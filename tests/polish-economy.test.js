const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Engine tests of the Polish economy (implementation plan, stage 4; technical reference 4.2, 5.6,
// 11.0–11.9, 17.16.2, 20.2 leaks 1 and 9): the monthly settlement in the order of 4.2, the mirrors of
// the inherited fields, the German economy switched off, Status and Library, save and load.
const { choose, clone } = dendry;
let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

function content(engine) {
  return JSON.stringify(engine.ui.paragraphs);
}
function spendMonth(engine) {
  engine.state.currentHands.main = [{ id: 'campaigning', title: 'Campaigning' }];
  engine.playCard('campaigning');
  choose(engine, 'campaigning.workers');
  choose(engine, 'root');
}

test('a new game owns the economy in S.economy; the inherited fields are its mirrors and the unemployed weight is 3', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  assert.equal(Q.polish_economy_system, 1);
  assert.equal(Q.S.meta.schema_version, 8);
  assert.deepEqual([Q.budget, Q.inflation, Q.economic_growth, Q.unemployed], [2, 4, 0, 3]);
  assert.equal(Q.S.economy.currency_regime, 'marka');
  assert.deepEqual(PolishRules.validateState(Q.S), []);
});

test('one month is settled once in the order of 4.2: the economy of January, then the living-conditions flow and the record', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const records = Q.party_support_records.length;
  spendMonth(engine);
  assert.equal(Q.time, 2);
  const E = Q.S.economy;
  assert.equal(E.history.length, 1);
  const reading = E.history[0];
  assert.equal(reading.t, 1, 'the reading of period t, computed before the clock counts in t+1');
  assert.ok(Math.abs(reading.inflation_m - 5.2) < 1e-9, 'the marka pressure of 8 moves inflation 4 → 5.2 (17.16.2)');
  assert.ok(reading.living && reading.living.weights.pps === 0.5, 'PPS answers for Ponikowski with the weight of an explicit toleration');
  assert.equal(Q.party_support_records.length, records + 1, 'one record of the month');
  assert.equal(Q.economic_records.at(-1).inflation, reading.inflation_m);
  assert.equal(Q.inflation, Math.round(reading.inflation_m * 100) / 100);
  // Kolejność M09 with a save: loading does not repeat the flow or the month.
  const restored = dendry.saveAndRestore(engine);
  restored.goToScene('main');
  restored.goToScene('post_event');
  assert.equal(restored.state.qualities.S.economy.history.length, 1, 'no second settlement after loading');
  assert.deepEqual(restored.state.qualities.S.society, Q.S.society);
});

function talkMonth(engine) {
  // A month spent on talks with PSL Wyzwolenie (card 6.1): it changes a relation, never a class row.
  engine.state.currentHands.main = [{ id: 'inter_party_relationships', title: 'Talks' }];
  engine.playCard('inter_party_relationships');
  choose(engine, 'inter_party_relationships.psl_wyzwolenie');
  choose(engine, 'root');
}

test('Stare reguły poparcia: the German erosion, NSDAP flows, drifts and the high-inflation scene change no Polish preference', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  // Conditions under which the inherited German block moved support every month.
  Q.pro_republic = 5; Q.year = 1930; Q.high_inflation_timer = 0; Q.spd_in_government = 1;
  Q.inflation = 50; Q.unemployed = 40;
  Q.S.economy.shocks = []; // an isolated test: the only change left is the flow of 5.6
  const before = {};
  for (const c of Q.classes) for (const p of Q.parties) before[`${c}_${p}`] = Q[`${c}_${p}`];
  talkMonth(engine);
  assert.equal(Q.time, 2);
  assert.equal(Q.pro_republic, 5, 'no pro_republic erosion by unemployment or inflation');
  for (const c of Q.classes) assert.equal(Q[`${c}_nsdap`], 0, `no NSDAP flow in ${c}`);
  assert.equal(Q.unemployed, 3, 'the weight of the unemployed row is not an unemployment rate');
  const reading = Q.S.economy.history.at(-1);
  // Since stage 5 the five class rows are mirrors of the cells; the rows of the unemployed and of the
  // minorities are compositions of cells and move when mass changes employment (5.1), not by support rules.
  for (const c of PolishElectorate.MAIN_CLASSES) {
    const moved = Q.parties.reduce((n, p) => n + Math.abs(Q[`${c}_${p}`] - before[`${c}_${p}`]), 0);
    assert.ok(moved <= 2 * Math.abs(reading.living.flows[c]) + 1e-9, `${c}: only the flow of 5.6 moved the row`);
  }
  const due = (engine._compileChoices(engine.game.scenes['post_event.events_choice']) || []).map(c => c.id);
  assert.ok(!due.includes('high_inflation'), 'the high-inflation scene is not queued');
});

test('the German economy and welfare cards are switched off in the Polish economy', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.spd_in_government = 1; Q.social_welfare_timer = 0;
  for (const party of ['labor', 'finance', 'economic', 'agriculture', 'justice']) Q[party + '_minister_party'] = 'SPD';
  const offered = (engine._compileChoices(engine.game.scenes['main.govt']) || []).filter(c => c.canChoose !== false).map(c => c.id);
  for (const id of ['social_welfare', 'fiscal_policy', 'economic_policy', 'labor_rights', 'agricultural_policy', 'judiciary',
    'constitutional_reform', 'economic_democracy', 'education_science']) {
    assert.ok(!offered.includes(id), id + ' is not offered');
  }
});

test('Status shows the Polish budget, currency, prices, output, credit, unemployment, countryside and business; not the German lines', () => {
  const engine = dendry.startGame();
  engine.goToScene('status');
  const text = content(engine);
  assert.match(text, /\+2\.00 B this month \(base \+2, taxes 0\); programmes run in full/);
  assert.match(text, /"Polish mark"/);
  assert.match(text, /"4\.0% a month"/);
  assert.match(text, /Agrarian pressure \(0–100\): ","45\.0"/);
  assert.match(text, /"calm, pressure 10"/);
  assert.match(text, /working balance \(economy_simple_v1\)/);
  assert.doesNotMatch(text, /Economic growth: /, 'the German growth line is hidden in the Polish game');
});

test('the Library records the Polish monthly readings for its economic chart', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  spendMonth(engine);
  spendMonth(engine);
  assert.equal(Q.economic_records.length, 2);
  assert.ok(Q.economic_records.every(r => typeof r.inflation === 'number' && typeof r.unemployment === 'number'));
  engine.goToScene('library.figures');
  assert.match(content(engine), /Monthly inflation and unemployment of the Polish economy/);
});

test('a year of play keeps the economy consistent: one reading a month, valid S through saves, no engine errors', () => {
  let engine = dendry.startGame(1930);
  const { engine: end } = dendry.walk(engine, { variant: 1, maxSteps: 900, lastYear: 1923,
    onStep(current, step) {
      if (step > 0 && step % 200 === 0) return dendry.saveAndRestore(current);
      return null;
    } });
  const Q = end.state.qualities;
  assert.deepEqual(PolishRules.validateState(Q.S), []);
  assert.equal(Q.S.economy.history.length, Q.S.history.months.length, 'one economic reading per settled month');
  const times = Q.S.economy.history.map(r => r.t);
  assert.deepEqual(times, [...new Set(times)].sort((a, b) => a - b), 'no month twice');
  assert.equal(Q.budget, Math.round(Q.S.economy.budget * 100) / 100);
  engine = end;
  assert.ok(clone(Q.S));
});
