const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test, mock, beforeEach, afterEach } = require('node:test');
const { convertJSONToGame, DendryEngine, NullUserInterface } = require('dendrynexus/lib/engine');

const json = fs.readFileSync(path.join(__dirname, '..', 'out', 'game.json'), 'utf8');
const errors = [];
mock.method(console, 'log', (...args) => {
  if (String(args[0]).startsWith('Error in')) errors.push(args.map(String).join(' '));
});
beforeEach(() => { errors.length = 0; });
afterEach(() => assert.deepEqual(errors, [], 'no swallowed Dendry errors'));
const clone = (value) => JSON.parse(JSON.stringify(value));
const sum = (object) => Object.values(object).reduce((a, b) => a + b, 0);
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

function create(start = true) {
  let game;
  convertJSONToGame(json, (error, result) => { if (error) throw error; game = result; });
  const ui = new NullUserInterface();
  ui.paragraphs = [];
  ui.newPage = () => { ui.paragraphs = []; };
  ui.displayContent = (content) => ui.paragraphs.push(...content);
  const engine = new DendryEngine(ui, game);
  engine.beginGame([1922]);
  if (start) { choose(engine, 'root.start'); choose(engine, 'root.1928_main'); }
  return engine;
}
function choose(engine, id) {
  const choices = engine.getCurrentChoices();
  const index = choices.findIndex((choice) => choice.id === id);
  assert.ok(index >= 0, `${id} missing from ${engine.state.sceneId}: ${choices.map((c) => c.id)}`);
  assert.ok(choices[index].canChoose, `${id} is unavailable`);
  engine.choose(index);
}
function run(engine, id) { engine._runActions(engine.game.scenes[id].onArrival); }
function update(engine) { run(engine, 'polish_opening_state'); }
function condition(engine, id, field = 'viewIf') { return engine._runPredicate(engine.game.scenes[id][field], true); }
function text(engine) { return JSON.stringify(engine.ui.paragraphs); }
function preferences(Q, values) {
  for (const group of Q.classes) for (const party of Q.parties) Q[`${group}_${party}`] = values[party] || 0;
}
function election(engine, values) {
  const Q = engine.state.qualities;
  Q.year = 1922; Q.month = 11; Q.time = 11;
  if (values) preferences(Q, values);
  update(engine);
  engine.goToScene('sejm_election');
  choose(engine, 'sejm_election.calculate');
  assert.equal(engine.state.sceneId, 'sejm_election.government');
  return Q.sejm_results.at(-1);
}
function allocate(values, options = {}) {
  const engine = create();
  const Q = engine.state.qualities;
  for (const party of Q.parties) Q[`${party}_normalized`] = (values[party] || 0) / 100;
  Object.assign(Q, options);
  Q.sejm_pending = {id: 'test', year: 1922, month: 11, first: options.first !== false, phase: 'pending'};
  run(engine, 'sejm_election_result');
  update(engine);
  return {engine, Q, result: Q.sejm_results[0]};
}
function campaign(engine, option = 'workers') {
  assert.ok(engine._compileChoices(engine.game.scenes['main.party']).some((c) => c.id === 'campaigning'));
  engine.state.currentHands.main = [{id: 'campaigning', title: 'Campaigning'}];
  engine.playCard('campaigning');
  choose(engine, `campaigning.${option}`);
  choose(engine, 'root');
}

test('January through October campaigning preserves parliament and November resolves once', () => {
  const engine = create();
  const Q = engine.state.qualities;
  Q.resources = 100; // isolate the election path from fundraising/draw randomness
  const opening = clone(Q.sejm_parliament);
  const startingSupport = Q.workers_pps;
  for (let month = 1; month <= 10; month++) {
    assert.equal(Q.month, month);
    campaign(engine);
    assert.deepEqual(Q.sejm_parliament, opening);
    assert.equal(Q.sejm_results.length, 0);
    assert.equal(Q.n_elections, 0);
  }
  assert.ok(Q.workers_pps > startingSupport);
  assert.equal(engine.state.sceneId, 'sejm_election');
  assert.deepEqual([Q.year, Q.month, Q.time, Q.month_actions], [1922, 11, 11, 0]);
  const timer = Q.advisor_action_timer;
  const monthlyRecords = Q.party_support_records.length;
  choose(engine, 'sejm_election.calculate');
  assert.equal(Q.n_elections, 1);
  assert.equal(Q.sejm_results.length, 1);
  assert.equal(Q.advisor_action_timer, timer);
  assert.equal(Q.party_support_records.length, monthlyRecords);
  choose(engine, 'election_1928.polish_opposition');
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'main');
  assert.deepEqual([Q.year, Q.month, Q.time, Q.month_actions], [1922, 11, 11, 0]);
  assert.deepEqual([Q.next_election_year, Q.next_election_month, Q.next_election_time], [1928, 5, 77]);
  const frozen = clone(Q.sejm_results);
  const seats = clone(Q.sejm_parliament);
  campaign(engine, 'rural');
  assert.equal(Q.month, 12);
  assert.deepEqual(Q.sejm_results, frozen);
  assert.deepEqual(Q.sejm_parliament, seats);
  assert.equal(Q.president, '');
});

test('election freezes freshly calculated support, not stale or rounded display percentages', () => {
  const engine = create();
  const Q = engine.state.qualities;
  Q.pps_votes = 99; Q.pps_normalized = 0.99;
  const result = election(engine, {pps: 13.287, kpp: 6.005, zln: 20, pschd: 10, other: 50.708});
  close(result.party_votes.pps, 13.287);
  assert.notEqual(result.party_votes.pps, Q.pps_votes);
  for (const party of Q.parties) close(Q[`${party}_r`], 100 * result.party_seats[party] / 444);
  assert.equal(Q.spd_r, Q.pps_r);
  assert.equal(Q.leverage, Q.pps_r);
  close(result.lists.reduce((n, list) => n + list.vote_share, 0), 100);
  assert.equal(sum(result.party_seats), 444);
});

test('a simultaneously eligible faction event is deferred, not lost or charged another month', () => {
  const engine = create();
  const Q = engine.state.qualities;
  Q.month = 11; Q.time = 11; Q.lewica_dissent = 70;
  engine.goToScene('post_event');
  assert.equal(engine.state.sceneId, 'sejm_election');
  assert.equal(Q.lewica_split, 0);
  choose(engine, 'sejm_election.calculate');
  assert.equal(Q.pps_government_position, 'Government formation pending');
  const frozen = clone(Q.sejm_results);
  choose(engine, 'election_1928.polish_opposition');
  assert.equal(Q.pps_government_position, 'Opposition');
  choose(engine, 'root');
  choose(engine, 'pps_lewica_split');
  choose(engine, 'root');
  assert.equal(Q.lewica_split, 1);
  assert.deepEqual([Q.year, Q.month, Q.time, Q.month_actions], [1922, 11, 11, 0]);
  assert.deepEqual(Q.sejm_results, frozen);
  assert.equal(Q.n_elections, 1);
});

test('first date is fixed, but later inherited election requests use the new result path', () => {
  const engine = create();
  const Q = engine.state.qualities;
  Q.next_election_year = 1922; Q.next_election_month = 2; Q.next_election_time = 2;
  update(engine);
  assert.deepEqual([Q.next_election_year, Q.next_election_month, Q.next_election_time], [1922, 11, 11]);
  election(engine);
  choose(engine, 'election_1928.polish_opposition');
  choose(engine, 'root');
  const first = clone(Q.sejm_results[0]);
  Q.year = 1923; Q.month = 2; Q.time = 14;
  Q.next_election_year = 1923; Q.next_election_month = 2; Q.next_election_time = 14;
  update(engine); engine.goToScene('main');
  assert.equal(engine.state.sceneId, 'sejm_election');
  choose(engine, 'sejm_election.calculate');
  assert.deepEqual(Q.sejm_results[0], first);
  assert.equal(Q.sejm_results[1].kind, 'legacy_continuation');
  assert.equal(sum(Q.sejm_results[1].party_seats), 444);
  assert.deepEqual([Q.next_election_year, Q.next_election_month, Q.next_election_time], [1927, 2, 62]);
});

test('approved multiplier boundaries and small-list remainder are explicit', () => {
  const cases = [[0, .25], [1.999, .25], [2, .55], [4.999, .55], [5, .85],
    [9.999, .85], [10, 1.025], [14.999, 1.025], [15, 1.1], [24.999, 1.1], [25, 1.25]];
  for (const [value, expected] of cases) {
    const {result} = allocate({pps: value, kpp: 100 - value});
    assert.equal(result.lists.find((row) => row.id === 'pps').multiplier, expected);
    assert.equal(sum(result.party_seats), 444);
    assert.ok(Object.values(result.party_seats).every((n) => Number.isInteger(n) && n >= 0));
  }
  const {result} = allocate({pps: 90.7, other: 9.3});
  const small = result.lists.filter((row) => row.anonymous);
  assert.equal(small.length, 5);
  for (let i = 0; i < 4; i++) assert.equal(small[i].vote_share, 2);
  close(small[4].vote_share, 1.3);
  assert.equal(small[4].multiplier, .25);
  assert.equal(result.party_seats.other, small.reduce((n, row) => n + row.seats, 0));
});

test('ChZJN is allocated once, attributed by election support and displayed as one bloc', () => {
  const {Q, result} = allocate({zln: 30, pschd: 10, pps: 35, other: 25});
  const joint = result.lists.find((row) => row.id === 'chzjn');
  close(joint.vote_share, 40);
  assert.equal(joint.multiplier, 1.25);
  assert.equal(joint.seats, result.party_seats.zln + result.party_seats.pschd);
  assert.ok(Math.abs(joint.party_seats.zln - joint.seats * .75) < 1);
  assert.ok(Math.abs(joint.party_seats.pschd - joint.seats * .25) < 1);
  assert.ok(Q.parties.includes('zln') && Q.parties.includes('pschd') && !Q.parties.includes('chzjn'));
  assert.ok(!Q.sejm_display_rows.some((row) => ['zln', 'pschd'].includes(row.id)));
  assert.equal(Q.sejm_display_rows.reduce((n, row) => n + row.seats, 0), 444);
  assert.match(Q.sejm_largest_lists, /ChZJN/);
  assert.equal(Q.largest_party_id, 'pps');
});

test('identical inputs and ties are deterministic; zero-seat parties stay in the record', () => {
  const a = allocate({pps: 50, kpp: 50}, {sejm_total_seats: 445}).result;
  const b = allocate({pps: 50, kpp: 50}, {sejm_total_seats: 445}).result;
  assert.deepEqual(a, b);
  assert.equal(a.party_seats.kpp, 223, 'stable lexical ID tie-break');
  assert.equal(a.party_seats.pps, 222);
  assert.equal(a.party_seats.npr, 0);
  assert.equal(a.party_votes.npr, 0);
});

test('invalid/all-zero support and all-excluded continuation preserve existing parliament', () => {
  for (const values of [{}, {pps: -1}, {pps: NaN}]) {
    const engine = create();
    const Q = engine.state.qualities;
    const before = clone(Q.sejm_parliament);
    for (const party of Q.parties) Q[`${party}_normalized`] = 0;
    if (Object.hasOwn(values, 'pps')) Q.pps_normalized = values.pps;
    Q.sejm_pending = {id: 'invalid', first: true, phase: 'pending'};
    run(engine, 'sejm_election_result');
    assert.ok(Q.sejm_election_error);
    assert.deepEqual(Q.sejm_parliament, before);
    assert.equal(Q.n_elections, 0);
    assert.deepEqual(Q.sejm_results, []);
  }
  const {Q, result} = allocate({pps: 100}, {first: false, constitutional_reform: 1, pps_banned: 1});
  assert.equal(result, undefined);
  assert.match(Q.sejm_election_error, /No eligible list/);
  assert.equal(Q.n_elections, 0);
});

test('all-zero polling is finite and excluded continuation parties have votes but zero seats', () => {
  const engine = create();
  preferences(engine.state.qualities, {});
  run(engine, 'election_algorithm');
  for (const party of engine.state.qualities.parties) assert.equal(engine.state.qualities[`${party}_normalized`], 0);
  const {result} = allocate({pps: 40, kpp: 10, npr: 4, zln: 40, other: 6},
    {first: false, constitutional_reform: 1, electoral_threshold: 5, kpp_banned: 1});
  assert.equal(sum(result.party_seats), 444);
  for (const id of ['kpp', 'npr', 'other']) {
    assert.equal(result.party_seats[id], 0);
    assert.ok(result.party_votes[id] > 0);
  }
});

const outcomes = [
  ['polish_pps_majority', {pps: 60, other: 40}, ['pps']],
  ['polish_left_coalition', {pps: 35, psl_wyzwolenie: 30, minorities_bloc: 35}, ['pps', 'psl_wyzwolenie', 'minorities_bloc']],
  ['polish_center_left_coalition', {pps: 25, psl_wyzwolenie: 25, psl_piast: 25, npr: 25}, ['pps', 'psl_wyzwolenie', 'psl_piast', 'npr']],
  ['polish_minority_toleration', {pps: 20, psl_wyzwolenie: 20, minorities_bloc: 35, other: 25}, ['pps', 'psl_wyzwolenie']],
  ['polish_chjeno_piast', {zln: 30, pschd: 15, psl_piast: 30, other: 25}, ['zln', 'pschd', 'psl_piast']],
  ['polish_opposition', {kpp: 100}, []],
];
for (const [choice, values, members] of outcomes) test(`complete playable government outcome: ${choice}`, () => {
  const engine = create();
  const Q = engine.state.qualities;
  election(engine, values);
  choose(engine, `election_1928.${choice}`);
  assert.equal(Q.sejm_pending.phase, 'complete');
  for (const party of Q.parties) assert.equal(!!Q[`${party}_in_government`], members.includes(party), party);
  assert.equal(Q.pps_external_toleration, 0);
  if (choice === 'polish_minority_toleration') {
    assert.equal(Q.in_minority_government, 1);
    assert.equal(Q.minorities_toleration, 1);
  }
  assert.equal(Q.head_of_state_name, 'Józef Piłsudski');
  assert.equal(Q.president, '');
  for (const portfolio of Object.keys(Q.polish_portfolios)) assert.equal(Q[`${portfolio}_minister_party`], '');
  choose(engine, 'root');
  assert.equal(Q.time, 11);
  assert.equal(Q.month_actions, 0);
  assert.equal(Q.n_elections, 1);
  assert.equal(engine.isGameOver(), false);
});

test('223 of 444, not rounded percentages, qualifies; relation 39 fails and 40 passes', () => {
  const engine = create();
  const Q = engine.state.qualities;
  election(engine, {pps: 50, kpp: 50});
  assert.equal(Q.pps_seats, 222);
  assert.equal(condition(engine, 'election_1928.polish_pps_majority'), false);
  // Exact-seat eligibility fixtures, independent of the allocation test above.
  const result = Q.sejm_results[0];
  result.party_seats.pps = 223; result.party_seats.kpp = 221;
  update(engine);
  assert.equal(condition(engine, 'election_1928.polish_pps_majority'), true);
  Q.psl_wyzwolenie_relation = 39;
  assert.equal(condition(engine, 'election_1928.polish_left_coalition'), false);
  Q.psl_wyzwolenie_relation = 40; Q.minorities_bloc_relation = 40;
  assert.equal(condition(engine, 'election_1928.polish_left_coalition'), true);
  result.total_seats = 446; result.party_seats.kpp = 223;
  update(engine);
  assert.equal(Q.sejm_majority_required, 224);
  assert.equal(condition(engine, 'election_1928.polish_pps_majority'), false);
});

test('external support does not mislabel an already-majority cabinet as a minority', () => {
  const engine = create();
  const Q = engine.state.qualities;
  election(engine, {pps: 40, psl_wyzwolenie: 40, minorities_bloc: 20});
  choose(engine, 'election_1928.polish_minority_toleration');
  assert.equal(Q.minorities_toleration, 1);
  assert.equal(Q.minorities_bloc_in_government, 0);
  assert.equal(Q.in_minority_government, 0);
});

test('polls, result text, chart rows, status and history agree without rewriting votes', () => {
  const engine = create();
  const Q = engine.state.qualities;
  const result = clone(election(engine));
  assert.match(text(engine), /Previous vote comparison: not available/);
  assert.match(text(engine), /ChZJN/);
  assert.equal(Q.sejm_display_rows.reduce((n, row) => n + row.seats, 0), 444);
  engine.goToScene('library');
  choose(engine, 'library.figures');
  assert.deepEqual(Q.sejm_history[0].rows, Q.sejm_display_rows);
  assert.match(text(engine), /Each dot represents one MP/);
  choose(engine, 'library.public_opinion');
  assert.match(text(engine), /Voting intentions/);
  engine.goToScene('backSpecialScene');
  assert.equal(engine.state.sceneId, 'sejm_election.government');
  assert.deepEqual(Q.sejm_results[0], result);
  choose(engine, 'election_1928.polish_opposition');
  choose(engine, 'root');
  Q.workers_pps += 20;
  engine.goToScene('library');
  choose(engine, 'library.public_opinion');
  engine.goToScene('backSpecialScene');
  engine.goToScene('status');
  assert.match(text(engine), /ChZJN/);
  assert.equal(Q.spd_r, 100 * result.party_seats.pps / 444);
  assert.deepEqual(Q.sejm_results[0], result);
});

for (const phase of ['pending', 'results', 'complete']) test(`save/resume and re-entry are idempotent in phase ${phase}`, () => {
  const engine = create();
  const Q = engine.state.qualities;
  Q.month = 11; Q.time = 11; update(engine);
  engine.goToScene('sejm_election');
  if (phase !== 'pending') choose(engine, 'sejm_election.calculate');
  if (phase === 'complete') choose(engine, 'election_1928.polish_opposition');
  const saved = clone(engine.getExportableState());
  const restored = create(false);
  restored.setState(saved);
  if (phase === 'pending') choose(restored, 'sejm_election.calculate');
  if (phase !== 'complete') choose(restored, 'election_1928.polish_opposition');
  choose(restored, 'root');
  const state = restored.state.qualities;
  const frozen = clone(state.sejm_results);
  for (const id of ['sejm_election_result', 'election_1928.post_election_polish', 'election_1928.post_election_1928']) run(restored, id);
  update(restored);
  assert.deepEqual(state.sejm_results, frozen);
  assert.equal(state.n_elections, 1);
  assert.equal(state.time, 11);
  assert.equal(state.sejm_pending.phase, 'complete');
});

test('legacy writers and repeated government choices cannot replace the recorded election', () => {
  const engine = create();
  const Q = engine.state.qualities;
  election(engine, {pps: 60, other: 40});
  choose(engine, 'election_1928.polish_pps_majority');
  choose(engine, 'root');
  const before = clone(Q.sejm_results);
  Q.pps_r = 1; Q.spd_r = 1; Q.election_records.push({date: 'bogus', pps: 99});
  update(engine);
  assert.equal(Q.pps_r, 100 * before[0].party_seats.pps / 444);
  assert.equal(Q.election_records.length, 1);
  run(engine, 'election_1928.polish_opposition');
  assert.equal(Q.pps_in_government, 1);
  engine.goToScene('election_1928.post_election_1928');
  assert.deepEqual(Q.sejm_results, before);
  assert.equal(condition(engine, 'election_1928.cancel_elections'), false);
  assert.equal(Q.n_elections, 1);
});

test('May 1928 continuation reuses exact results, does not reuse ChZJN or corrupt 1922 history', () => {
  const engine = create();
  const Q = engine.state.qualities;
  election(engine);
  choose(engine, 'election_1928.polish_opposition');
  choose(engine, 'root');
  const first = clone(Q.sejm_results[0]);
  Q.year = 1928; Q.month = 5; Q.time = 77;
  update(engine); engine.goToScene('election_1928');
  choose(engine, 'sejm_election.calculate');
  assert.equal(Q.sejm_results.length, 2);
  assert.deepEqual(Q.sejm_results[0], first);
  const second = Q.sejm_results[1];
  assert.equal(second.kind, 'legacy_continuation');
  assert.ok(!second.lists.some((row) => row.id === 'chzjn'));
  assert.equal(sum(second.party_seats), 444);
  assert.deepEqual([Q.next_election_year, Q.next_election_month, Q.next_election_time], [1932, 5, 125]);
  assert.match(Q.pschd_election_display, /previous votes N\/A/);
  assert.match(Q.pps_election_display, /vote change/);
  assert.equal(Q.in_spd_majority, 0);
});

test('different previous chamber size and new party identities do not invent vote or seat comparisons', () => {
  const engine = create();
  const Q = engine.state.qualities;
  Q.sejm_parliament.total_seats = 432;
  Q.sejm_parliament.party_seats.pps = 34;
  delete Q.sejm_parliament.party_seats.npr;
  const result = election(engine);
  assert.equal(result.previous_parliament.total_seats, 432);
  assert.match(Q.npr_election_display, /previous parliament not comparable/);
  close(Q.old_pps_r, 100 * 34 / 432);
  assert.match(Q.pps_election_display, /previous votes N\/A/);
});

test('post-election safeguards cover held cards, old coalition links and police choices while welfare remains playable', () => {
  const engine = create();
  const Q = engine.state.qualities;
  election(engine, outcomes[3][1]);
  choose(engine, 'election_1928.polish_minority_toleration');
  choose(engine, 'root');
  Q.coalition_dissent = 10; Q.kpd_coalition_dissent = 10;
  Q.in_popular_front = 1; Q.spd_toleration = 1; Q.chancellor_party = 'Z';
  Q.prussian_police_loyalty = 1;
  for (const id of ['war_guilt', 'prussian_affairs', 'vote_of_no_confidence',
    'kpd_vote_of_no_confidence', 'dealing_with_toleration', 'shuffle_cabinet',
    'rally.police_protect', 'rally.both_protect', 'streetfighting.prussian_police_training']) {
    assert.equal(condition(engine, id), false, id);
  }
  assert.equal(condition(engine, 'deport_hitler', 'chooseIf'), false);
  assert.equal(condition(engine, 'social_welfare'), true);
  engine.state.currentHands.main = [{id: 'war_guilt', title: 'Old card'}, {id: 'prussian_affairs', title: 'Old card'}];
  engine.displayChoices();
  assert.deepEqual(engine.state.currentHands.main, []);
  assert.equal(Q.spd_prussia, 1, 'force compatibility retained');
  const support = Q.workers_pps;
  Q.budget = 2;
  engine.state.currentHands.main = [{id: 'social_welfare', title: 'Welfare'}];
  engine.playCard('social_welfare');
  choose(engine, 'social_welfare.increase_spending_pre_depression');
  choose(engine, 'root');
  assert.equal(Q.month, 12);
  assert.ok(Q.workers_pps > support);
  assert.equal(Q.sejm_results.length, 1);
});

test('the menu-only simulator does not alter a running game or its parliament', () => {
  const engine = create();
  const Q = engine.state.qualities;
  const before = clone(Q.sejm_parliament);
  const date = [Q.year, Q.month, Q.time];
  assert.equal(condition(engine, 'election_simulation'), false);
  engine.goToScene('election_simulation.opening');
  assert.deepEqual(Q.sejm_parliament, before);
  assert.deepEqual([Q.year, Q.month, Q.time], date);
  assert.equal(engine.state.sceneId, 'main');
});
