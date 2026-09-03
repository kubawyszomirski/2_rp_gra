const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test, mock, beforeEach, afterEach } = require('node:test');
const { convertJSONToGame, DendryEngine, NullUserInterface } = require('dendrynexus/lib/engine');

// Use the actual compiled Dendry engine, including calls, conditions, event
// selection and navigation. The existing suite separately tests individual effects.
const gameJSON = fs.readFileSync(path.join(__dirname, '..', 'out', 'game.json'), 'utf8');
const diagnostics = [];
mock.method(console, 'log', (...args) => {
  if (String(args[0]).startsWith('Error in')) diagnostics.push(args.map(String).join(' '));
});
beforeEach(() => { diagnostics.length = 0; });
afterEach(() => { assert.deepEqual(diagnostics, [], 'Dendry must not silently swallow script/condition errors'); });

const seats = {
  kpp: 2, pps: 35, npr: 22, psl_wyzwolenie: 25, psl_piast: 99,
  pschd: 27, zln: 83, minorities_bloc: 17, other: 134,
};
const portfolioKeys = ['labor', 'interior', 'finance', 'economic', 'justice',
  'foreign', 'agriculture', 'reichswehr', 'education', 'public_works'];

function createEngine() {
  let game;
  convertJSONToGame(gameJSON, (error, result) => {
    if (error) throw error;
    game = result;
  });
  const ui = new NullUserInterface();
  ui.paragraphs = [];
  ui.newPage = () => { ui.paragraphs = []; };
  ui.displayContent = (content) => { ui.paragraphs.push(...content); };
  const engine = new DendryEngine(ui, game);
  engine.beginGame([1922]);
  return engine;
}

function choose(engine, id) {
  const choices = engine.getCurrentChoices();
  const index = choices.findIndex((choice) => choice.id === id);
  assert.ok(index >= 0, `${id} missing in ${engine.state.sceneId}: ${choices.map((c) => c.id)}`);
  assert.equal(choices[index].canChoose, true, `${id} must be eligible`);
  engine.choose(index);
}

function startGame() {
  const engine = createEngine();
  choose(engine, 'root.start');
  choose(engine, 'root.1928_main');
  assert.equal(engine.state.sceneId, 'main');
  return engine;
}

function content(engine) {
  return JSON.stringify(engine.ui.paragraphs);
}

function condition(engine, id, field = 'viewIf') {
  return engine._runPredicate(engine.game.scenes[id][field], true);
}

function parliamentaryShares(Q) {
  return Object.fromEntries(Q.parties.map((party) => [party, Q[`${party}_r`]]));
}

function playEligibleFixture(engine, id) {
  // Pick a deterministic card from the real eligible deck, then use ordinary
  // play/choice navigation. Random draw order is not the mechanic under test.
  assert.ok(engine._compileChoices(engine.game.scenes['main.party'])
    .some((choice) => choice.id === id && choice.canChoose));
  engine.state.currentHands.main = [{ id, title: id }];
  engine.playCard(id);
}

test('fresh opening initializes exactly 444 MPs independently from polling', () => {
  const engine = startGame();
  const Q = engine.state.qualities;
  assert.deepEqual(Q.opening_sejm_seats, seats);
  assert.equal(Object.values(Q.opening_sejm_seats).reduce((sum, n) => sum + n), 444);
  assert.equal(Q.sejm_total_seats, 444);
  assert.equal(Q.opening_sejm_active, 1);
  for (const [party, count] of Object.entries(seats)) {
    assert.equal(Q[`${party}_r`], 100 * count / 444);
    assert.equal(Q[`old_${party}_r`], Q[`${party}_r`]);
  }
  assert.ok(Math.abs(Object.values(parliamentaryShares(Q)).reduce((sum, n) => sum + n) - 100) < 1e-9);
  assert.equal(Q.spd_r, Q.pps_r);
  assert.notEqual(Q.pps_r, Q.pps_normalized * 100);
  assert.deepEqual(Q.election_records, []);
});

test('opening offices, toleration and all ten portfolios grant no executive powers', () => {
  const engine = startGame();
  const Q = engine.state.qualities;
  assert.equal(Q.polish_cabinet_id, 'ponikowski_1');
  assert.equal(Q.head_of_state_office, 'naczelnik_panstwa');
  assert.equal(Q.head_of_state_name, 'Józef Piłsudski');
  assert.equal(Q.president, '');
  assert.equal(Q.chancellor, 'Antoni Ponikowski');
  assert.equal(Q.chancellor_party, 'expert_cabinet');
  assert.equal(Q.pps_external_toleration, 1);
  for (const key of ['spd_in_government', 'pps_in_government', 'spd_caretaker',
    'spd_toleration', 'minorities_toleration', 'z_in_government', 'dvp_in_government', 'dnvp_in_government']) {
    assert.equal(Q[key], 0, key);
  }
  assert.deepEqual(Object.keys(Q.polish_portfolios), portfolioKeys);
  for (const key of portfolioKeys) {
    assert.equal(Q[`${key}_minister`], '');
    assert.equal(Q[`${key}_minister_party`], 'opening_expert_cabinet');
  }
  for (const id of ['fiscal_policy', 'police', 'military_policy', 'judiciary',
    'foreign_policy', 'agricultural_policy', 'labor_affairs', 'shuffle_cabinet',
    'education_science', 'constitutional_reform', 'dealing_with_toleration', 'cabinet']) {
    assert.equal(condition(engine, id), false, id);
  }
  assert.equal(Q.pilsudczycy_strength, 35);
  assert.equal(Q.pilsudczycy_dissent, 5);
  assert.equal(Q.n_advisors, 3);
  assert.equal(Q.pps_militia_strength, 200);
  assert.equal(Q.pps_militia_militancy, 0.1);
  // Retain force compatibility; it no longer authorizes opening police commands.
  assert.equal(Q.spd_prussia, 1);
});

test('opening, status and read-only cabinet agree without changing time or membership', () => {
  const engine = createEngine();
  choose(engine, 'root.start');
  const opening = content(engine);
  for (const name of ['Józef Piłsudski', 'Naczelnik Państwa', 'Antoni Ponikowski', '444']) {
    assert.ok(opening.includes(name), name);
  }
  assert.doesNotMatch(opening, /Hindenburg|Marx|Kautsky/);
  choose(engine, 'root.1928_main');
  engine.goToScene('status');
  assert.match(content(engine), /External toleration of Ponikowski/);
  assert.match(content(engine), /35 MPs; 7.9%/);
  assert.doesNotMatch(content(engine), /Hindenburg|Chancellor:/);
  engine.goToScene('backSpecialScene');
  engine.goToScene('library');
  choose(engine, 'library.curr_gov');
  const cabinet = content(engine);
  for (const label of Object.values(engine.state.qualities.polish_portfolios)) {
    assert.ok(cabinet.includes(label), label);
  }
  assert.equal((cabinet.match(/Cabinet-administered; outside PPS control/g) || []).length, 10);
  assert.equal(engine.state.qualities.time, 1);
  assert.equal(engine.state.qualities.spd_in_government, 0);
  engine.goToScene('backSpecialScene');
  assert.equal(engine.state.sceneId, 'main');
});

test('campaign choice, consequences, event processing and February preserve government and seats', () => {
  const engine = startGame();
  const Q = engine.state.qualities;
  engine.goToScene('library');
  choose(engine, 'library.public_opinion');
  engine.goToScene('backSpecialScene');
  const before = parliamentaryShares(Q);
  const initialSupport = Q.workers_pps;
  const initialPoll = Q.pps_normalized;
  playEligibleFixture(engine, 'campaigning');
  choose(engine, 'campaigning.workers');
  assert.ok(Q.workers_pps > initialSupport);
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'main');
  assert.deepEqual([Q.year, Q.month, Q.time], [1922, 2, 2]);
  assert.equal(Q.month_actions, 0);
  assert.ok(Q.pps_normalized > initialPoll);
  assert.deepEqual(parliamentaryShares(Q), before);
  assert.equal(Q.opening_sejm_active, 1);
  assert.equal(Q.polish_opening_government_active, 1);
  assert.equal(Q.pps_external_toleration, 1);
  assert.equal(Q.chancellor, 'Antoni Ponikowski');
  assert.equal(Q.n_elections, 0);
  engine.goToScene('status');
  assert.match(content(engine), /Antoni Ponikowski/);
  assert.match(content(engine), /444 MPs/);
});

test('authority guards cover rally choices, training, direct police route and held cards', () => {
  const engine = startGame();
  const Q = engine.state.qualities;
  Q.prussian_police_loyalty = 1;
  Q.prussian_police_training = 1;
  Q.judicial_reform = 4;
  Q.investigate_far_right = 3;
  Q.nazi_urgency = 4;
  Q.presidential_election_seen = 0;
  for (const id of ['prussian_affairs', 'rally.police_protect', 'rally.both_protect',
    'streetfighting.prussian_police_training']) {
    assert.equal(condition(engine, id), false, id);
  }
  assert.equal(condition(engine, 'deport_hitler', 'chooseIf'), false);
  engine.state.currentHands.main = [{ id: 'prussian_affairs', title: 'Old card' }];
  engine.displayChoices();
  assert.deepEqual(engine.state.currentHands.main, []);
  engine.goToScene('rally.sa_disrupt');
  assert.deepEqual(engine.getCurrentChoices().map((c) => c.id), ['rally.rb_protect', 'rally.cancel']);
  assert.equal(condition(engine, 'rally.rb_protect'), true);
  // No force values or militia effects are replaced by access guards.
  const strength = Q.pps_militia_strength;
  Q.sa_strength = 0;
  choose(engine, 'rally.rb_protect');
  assert.equal(Q.pps_militia_strength, strength);
  assert.equal(Q.polish_opening_government_active, 1);
});

test('external toleration preserves adviser diplomacy and playable militia development', () => {
  const engine = startGame();
  const Q = engine.state.qualities;
  const relation = Q.psl_piast_relation;
  assert.equal(condition(engine, 'daszynski'), true);
  engine.playPinnedCard('daszynski');
  assert.equal(condition(engine, 'daszynski.broker_coalition', 'chooseIf'), false);
  choose(engine, 'daszynski.parliamentary_compromise');
  assert.equal(Q.psl_piast_relation, relation + 3);
  choose(engine, 'root');
  assert.equal(Q.spd_in_government, 0);
  assert.equal(Q.pps_external_toleration, 1);
  const month = Q.month;
  playEligibleFixture(engine, 'reichsbanner');
  choose(engine, 'reichsbanner.militant');
  assert.equal(Q.pps_militia_strength, 300);
  assert.ok(Math.abs(Q.pps_militia_militancy - 0.15) < 1e-9);
  choose(engine, 'root');
  assert.equal(Q.month, month + 1);
  assert.equal(Q.polish_opening_government_active, 1);
  assert.equal(Q.pps_external_toleration, 1);
  assert.equal(Q.interior_minister_party, 'opening_expert_cabinet');
});

test('Government Affairs remains inaccessible at its relative-month unlock without a dead end', () => {
  const engine = startGame();
  const Q = engine.state.qualities;
  for (const month of [5, 6, 7]) {
    Q.month = month;
    Q.time = month;
    engine.goToScene('main');
    assert.equal(condition(engine, 'main.govt'), false);
    assert.ok(engine.getCurrentChoices().some((c) => c.id === 'main.party'));
    assert.ok(!engine._compileChoices(engine.game.scenes['main.govt']).some((c) =>
      c.canChoose && engine.game.scenes[c.id].isCard));
    if (month >= 6) assert.match(content(engine), /no available executive actions/);
  }
});

test('November election is scheduled without creating a Senate or president', () => {
  const engine = startGame();
  const Q = engine.state.qualities;
  for (const month of [10, 11, 12]) {
    Q.month = month;
    Q.time = month;
    engine.goToScene('status');
    assert.equal(condition(engine, 'election_1928'), false);
    assert.match(content(engine), /The first Sejm election is in November 1922/);
    assert.match(content(engine), /Later cabinet chronology has not been implemented/);
    assert.equal(Q.head_of_state_office, 'naczelnik_panstwa');
    assert.equal(Q.president, '');
    assert.deepEqual([Q.next_election_year, Q.next_election_month, Q.next_election_time], [1922, 11, 11]);
    assert.equal(Q.sejm_election_due, month >= 11);
  }
  Q.year = 1928;
  Q.month = 4;
  assert.equal(condition(engine, 'election_1928'), false);
  Q.month = 5;
  assert.equal(condition(engine, 'election_1928'), false, 'legacy entry is not a second election event');
  assert.equal(engine.isGameOver(), false);
});

test('legacy entry redirects to exact-seat election without its old monthly charge', () => {
  const engine = startGame();
  const Q = engine.state.qualities;
  Q.year = 1922;
  Q.month = 11;
  Q.time = 11;
  engine.goToScene('polish_opening_state');
  engine.goToScene('election_1928');
  choose(engine, 'sejm_election.calculate');
  assert.equal(engine.state.sceneId, 'sejm_election.government');
  assert.equal(Q.opening_sejm_active, 0);
  assert.equal(Q.polish_opening_government_active, 0);
  assert.equal(Q.pps_external_toleration, 0);
  assert.equal(Q.polish_cabinet_id, '');
  assert.equal(Q.head_of_state_name, 'Józef Piłsudski');
  assert.equal(Q.education_minister_party, '');
  assert.equal(Q.public_works_minister_party, '');
  choose(engine, 'election_1928.polish_opposition');
  choose(engine, 'root');
  assert.equal(Q.next_election_year, 1928);
  assert.equal(Q.month, 11);
  assert.equal(Q.time, 11);
  assert.equal(Q.n_elections, 1);
  assert.notEqual(Q.chancellor, 'Antoni Ponikowski');
  engine.goToScene('status');
  assert.doesNotMatch(content(engine), /External toleration of Ponikowski/);
  assert.match(content(engine), /444 MPs/);
});

test('government replacement invalidates only opening metadata, not new assignments or parliament', () => {
  const engine = startGame();
  const Q = engine.state.qualities;
  Q.chancellor = 'Replacement fixture';
  Q.chancellor_party = 'PPS';
  Q.spd_in_government = 1;
  Q.pps_in_government = 1;
  Q.finance_minister_party = 'SPD';
  engine.goToScene('status');
  assert.equal(Q.pps_external_toleration, 0);
  assert.equal(Q.polish_opening_government_active, 0);
  assert.equal(Q.chancellor, 'Replacement fixture');
  assert.equal(Q.finance_minister_party, 'SPD');
  assert.equal(Q.opening_sejm_active, 1);
  assert.match(content(engine), /Replacement fixture/);
  engine.goToScene('polish_opening_state');
  assert.equal(Q.chancellor, 'Replacement fixture');
  assert.equal(Q.finance_minister_party, 'SPD');
});

test('unsupported legacy share writes cannot replace the authoritative opening parliament', () => {
  const engine = startGame();
  const Q = engine.state.qualities;
  Q.pps_r += 1;
  Q.other_r -= 1;
  engine.goToScene('status');
  assert.equal(Q.opening_sejm_active, 1);
  assert.equal(Q.pps_r, 100 * seats.pps / 444);
  assert.equal(Q.polish_opening_government_active, 1);
  assert.equal(Q.pps_external_toleration, 1);
});

test('same-version save/restore preserves the opening and remains playable', () => {
  const engine = startGame();
  const saved = JSON.parse(JSON.stringify(engine.getExportableState()));
  const restored = createEngine();
  restored.setState(saved);
  assert.deepEqual(restored.state.qualities.opening_sejm_seats, seats);
  assert.equal(restored.state.qualities.pps_external_toleration, 1);
  restored.goToScene('status');
  assert.match(content(restored), /Józef Piłsudski/);
  restored.goToScene('backSpecialScene');
  playEligibleFixture(restored, 'campaigning');
  choose(restored, 'campaigning.workers');
  choose(restored, 'root');
  assert.equal(restored.state.qualities.month, 2);
});

test('Polish external toleration never enables legacy toleration choices at crisis thresholds', () => {
  const engine = startGame();
  const Q = engine.state.qualities;
  Q.year = 1931;
  Q.month = 12;
  Q.unemployed = 30;
  Q.welfare = -1;
  for (const id of ['emergency_cuts.vote_yes', 'emergency_cuts.vote_no',
    'hunger_chancellor.maintain_toleration', 'hunger_chancellor.break_toleration',
    'dealing_with_toleration']) {
    assert.equal(condition(engine, id), false, id);
  }
  assert.equal(condition(engine, 'emergency_cuts'), false);
  assert.equal(condition(engine, 'papen_chancellor'), false);
  assert.equal(Q.pps_external_toleration, 1);
  assert.equal(Q.spd_toleration, 0);
  assert.equal(Q.chancellor, 'Antoni Ponikowski');
});

test('an eligible inherited cabinet event is preserved and its assignments survive cleanup', () => {
  const engine = startGame();
  const Q = engine.state.qualities;
  // Fixture representing a later legacy government, not a route the opening
  // invents. Exercise the existing event itself, including its effects.
  Q.year = 1932;
  Q.sejm_first_election_completed = 1; // fixture is explicitly beyond the first election
  Q.month = 5;
  Q.time = 125;
  Q.chancellor = 'Brüning';
  Q.president = 'Hindenburg';
  Q.grand_coalition = 40;
  Q.next_election_time = 140;
  Q.judicial_reform = 3;
  assert.equal(condition(engine, 'papen_chancellor'), true);
  engine.goToScene('papen_chancellor');
  engine.goToScene('status');
  assert.equal(Q.polish_opening_government_active, 0);
  assert.equal(Q.pps_external_toleration, 0);
  assert.equal(Q.chancellor, 'Papen');
  assert.equal(Q.president, 'Hindenburg');
  assert.equal(Q.finance_minister_party, 'I');
  assert.equal(Q.judicial_reform, 1);
  assert.equal(Q.next_election_time, 128);
  assert.equal(Q.education_minister_party, '');
  assert.equal(Q.opening_sejm_active, 1);
  assert.doesNotMatch(content(engine), /Ponikowski|Naczelnik Państwa/);
  assert.match(content(engine), /temporary government framework/);
});
