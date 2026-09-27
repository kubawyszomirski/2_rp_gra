const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Engine tests of stage 0 (docs/POLISH_IMPLEMENTATION_PLAN.md): the Polish chapter state S
// (technical reference 2.4), save compatibility (19.3) and the 21.1 test "Jedna trudność".
// Run npm run build first.
const errors = dendry.watchEngineErrors();
beforeEach(() => { errors.length = 0; });
afterEach(() => assert.deepEqual(errors, [], 'no swallowed Dendry errors'));

// Stage 0 allowed one inherited error here ("Return card to hand" reading a missing card). Stage 1
// replaced that scene with "Close card", so no engine error is allowed any more.
const KNOWN_ERRORS = [];
function dropKnownErrors() {
  const known = errors.filter(message => KNOWN_ERRORS.some(pattern => pattern.test(message)));
  errors.splice(0, errors.length, ...errors.filter(message => !known.includes(message)));
  return known.length;
}

test('Jedna trudność (21.1): only the Normal game, with saves and polls available', () => {
  const engine = dendry.createEngine();
  assert.deepEqual((engine.getCurrentChoices() || []).map(choice => choice.id).sort(),
    ['credits', 'election_simulation', 'root.start'], 'no difficulty or historical-mode selector');
  dendry.choose(engine, 'root.start');
  dendry.choose(engine, 'root.1928_main');
  const Q = engine.state.qualities;
  assert.equal(Q.difficulty, 0);
  assert.equal(Q.historical_mode, 0);
  assert.equal(Q.S.meta.scenario_id, 'normal_chapter1_v1');
  assert.equal(engine.state.disableSaves, false, 'saves are available');
  assert.ok(engine.game.scenes['status.polls'], 'the status polls exist');
  for (const id of ['library.public_opinion', 'library.election_projections']) {
    assert.equal(engine._runPredicate(engine.game.scenes[id].viewIf, true), true, `${id} is visible`);
  }
  const restored = dendry.saveAndRestore(engine);
  assert.equal(restored.state.sceneId, 'main');
  assert.equal(restored.state.qualities.historical_mode, 0);
});

test('a new game creates the Polish chapter state S from the domain register (2.4)', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  assert.deepEqual(PolishRules.validateState(Q.S), []);
  assert.deepEqual(Q.S.meta, {
    schema_version: PolishRules.SCHEMA_VERSION, balance_id: 'balance_v0_1+economy_simple_v1', scenario_id: 'normal_chapter1_v1', seed: Q.S.meta.seed,
  });
  assert.ok(PolishRules.isSaveCompatible(Q));
  assert.equal(Q.polish_save_incompatible, undefined);
  assert.equal(dendry.startGame().state.qualities.S.meta.seed, Q.S.meta.seed, 'the same game seed gives the same state seed');
  assert.notEqual(dendry.startGame(1923).state.qualities.S.meta.seed, Q.S.meta.seed);
});

test('S survives save and load, and the loaded game continues', () => {
  const engine = dendry.startGame();
  const before = dendry.clone(engine.state.qualities.S);
  const restored = dendry.saveAndRestore(engine);
  assert.deepEqual(restored.state.qualities.S, before);
  const { engine: after, steps } = dendry.walk(restored, { maxSteps: 80 });
  assert.equal(steps, 80);
  assert.ok(after.state.qualities.time > 1, 'months advance after loading');
  assert.deepEqual(PolishRules.validateState(after.state.qualities.S), []);
  dropKnownErrors();
});

for (const [name, spoil] of [
  ['a save from before the Polish chapter state', saved => { delete saved.qualities.S; }],
  ['a save with another schema version', saved => { saved.qualities.S.meta.schema_version = PolishRules.SCHEMA_VERSION - 1; }],
]) {
  test(`${name} stops at the incompatible-save scene without settling a month (19.3)`, () => {
    const saved = dendry.clone(dendry.startGame().getExportableState());
    spoil(saved);
    for (const entry of ['post_event', 'main']) {
      const restored = dendry.restoreState(saved);
      const time = restored.state.qualities.time;
      restored.goToScene(entry);
      assert.equal(restored.state.sceneId, 'polish_incompatible_save', `${entry} stops the old save`);
      assert.equal(restored.state.qualities.polish_save_incompatible, 1);
      assert.equal(restored.state.qualities.time, time, 'no month is settled');
      // Dendry adds its default Continue to root to a scene without options. It leads back here.
      assert.deepEqual((restored.getCurrentChoices() || []).map(choice => [choice.id, choice.title]), [['root', 'Continue...']]);
      dendry.choose(restored, 'root');
      assert.equal(restored.state.sceneId, 'polish_incompatible_save', 'Continue returns to the message');
      assert.equal(restored.state.qualities.time, time, 'still no month is settled');
    }
  });
}

test('walks from January 1922 keep S valid through saves and raise no new engine errors', () => {
  let months = 0;
  let restores = 0;
  for (const variant of [0, 1, 2, 3]) {
    const { engine } = dendry.walk(dendry.startGame(1922 + variant), {
      variant,
      maxSteps: 1200,
      onStep(current, step) {
        const Q = current.state.qualities;
        assert.deepEqual(PolishRules.validateState(Q.S), [], `valid S at step ${step} of walk ${variant}`);
        assert.equal(Q.polish_save_incompatible, undefined);
        if (step > 0 && step % 150 === 0) {
          restores++;
          const restored = dendry.saveAndRestore(current);
          assert.deepEqual(restored.state.qualities.S, Q.S);
          return restored;
        }
        return null;
      },
    });
    months += engine.state.qualities.time;
  }
  dropKnownErrors();
  assert.ok(months > 100, `the walks cover ${months} months`);
  assert.ok(restores >= 20, `${restores} saves and loads`);
});

test('the page checks every loaded save before the game continues (out/html/game.js)', () => {
  const source = fs.readFileSync(path.join(dendry.ROOT, 'out', 'html', 'game.js'), 'utf8');
  const engine = dendry.startGame();
  const proto = Object.getPrototypeOf(engine);
  const originalSetState = proto.setState;
  const questions = [];
  const page = {
    PolishRules: globalThis.PolishRules,
    PolishInstitutions: globalThis.PolishInstitutions,
    PolishGovernment: globalThis.PolishGovernment,
    PolishEngineHooks: require(dendry.HOOKS_FILE),
    confirm: message => { questions.push(message); return questions.length === 1; },
  };
  vm.runInNewContext(source, { window: page, console: { log() {} } });
  try {
    page.dendryModifyUI({ game: engine.game, dendryEngine: engine });
    assert.equal(proto.polishSaveGuard, true);
    const old = dendry.clone(engine.getExportableState());
    delete old.qualities.S;

    engine.setState(dendry.clone(old));
    assert.equal(questions.length, 1);
    assert.match(questions[0], /older version of the game/);
    assert.ok((engine.getCurrentChoices() || []).some(choice => choice.id === 'root.start'), 'accepting starts a new game at the menu');

    engine.setState(dendry.clone(old));
    assert.equal(questions.length, 2);
    assert.equal(engine.state.sceneId, 'polish_incompatible_save', 'declining shows the incompatible-save scene');

    engine.setState(dendry.clone(dendry.startGame().getExportableState()));
    assert.equal(questions.length, 2, 'a compatible save loads without a question');
    assert.equal(engine.state.sceneId, 'main');
  } finally {
    proto.setState = originalSetState;
    delete proto.polishSaveGuard;
  }
});
