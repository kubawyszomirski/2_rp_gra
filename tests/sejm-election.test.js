const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test, mock, beforeEach, afterEach } = require('node:test');
const { convertJSONToGame, DendryEngine, NullUserInterface } = require('dendrynexus/lib/engine');
// The page loads the rules module before core.js and installs the engine hooks; the engine tests
// load the same built copies.
globalThis.PolishRules = require(path.join(__dirname, '..', 'out', 'html', 'polish_rules.js'));
globalThis.PolishInstitutions = require(path.join(__dirname, '..', 'out', 'html', 'polish_institutions.js'));
globalThis.PolishEconomy = require(path.join(__dirname, '..', 'out', 'html', 'polish_economy.js'));
globalThis.PolishGovernment = require(path.join(__dirname, '..', 'out', 'html', 'polish_government.js'));
globalThis.PolishElectorate = require(path.join(__dirname, '..', 'out', 'html', 'polish_electorate.js'));
globalThis.PolishProjects = require(path.join(__dirname, '..', 'out', 'html', 'polish_projects.js'));
globalThis.PolishParty = require(path.join(__dirname, '..', 'out', 'html', 'polish_party.js'));
globalThis.PolishUnions = require(path.join(__dirname, '..', 'out', 'html', 'polish_unions.js'));
globalThis.PolishPolitics = require(path.join(__dirname, '..', 'out', 'html', 'polish_politics.js'));
globalThis.PolishSecurity = require(path.join(__dirname, '..', 'out', 'html', 'polish_security.js'));
require(path.join(__dirname, '..', 'out', 'html', 'polish_engine_hooks.js')).install(DendryEngine.prototype, globalThis.PolishRules);

const json = fs.readFileSync(path.join(__dirname, '..', 'out', 'game.json'), 'utf8');
const errors = [];
mock.method(console, 'log', (...args) => {
  if (String(args[0]).startsWith('Error')) errors.push(args.map(String).join(' '));
});
beforeEach(() => { errors.length = 0; });
afterEach(() => assert.deepEqual(errors, [], 'no swallowed Dendry errors'));
const clone = (value) => JSON.parse(JSON.stringify(value));
// The one-screen cabinet formation replaced the inherited government options (stage 3).
const { formCabinet } = require('./helpers/dendry');
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
  // Inherited scenes use window.dendryUI.dendryEngine and the page's d3 charts. Outside the
  // browser this stand-in points at the running engine and leaves the charts out.
  globalThis.window = { dendryUI: { dendryEngine: engine } };
  globalThis.d3 = undefined;
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
  // Stage 5: the cells own the preferences, so the fixture rows are turned into cells again (5.1–5.2).
  if (Q.S && Q.S.society && Q.S.society.cells && Object.values(values).some(v => v > 0)) { PolishElectorate.seedCells(Q); PolishElectorate.writeClassMirrors(Q); }
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
// Stage 5: a press campaign of the Media card (card catalogue 5.3) to one class of voters.
function campaign(engine, option = 'workers') {
  assert.ok(engine._compileChoices(engine.game.scenes['main.party']).some((c) => c.id === 'polish_party_media'));
  engine.state.currentHands.main = [{id: 'polish_party_media', title: 'Media and Campaigns'}];
  engine.playCard('polish_party_media');
  choose(engine, 'polish_party_media.campaign');
  choose(engine, 'polish_party_media.topic_class');
  choose(engine, `polish_party_media.to_${option}`);
  choose(engine, 'root');
}

test('January through October campaigning preserves parliament and November resolves once', () => {
  const engine = create();
  const Q = engine.state.qualities;
  Q.resources = 100; // isolate the election path from fundraising/draw randomness
  Q.S.scenario.inputs.dispute_1922 = false; // and from the dated dispute of 1922 (decision 1A of stage 7)
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
  formCabinet(engine, {mode: 'opposition'});
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'main');
  assert.deepEqual([Q.year, Q.month, Q.time, Q.month_actions], [1922, 11, 11, 0]);
  // The legal calendar of 7.4: the term opened on 28 November 1922, the vote is on 19 February 1928.
  assert.deepEqual([Q.next_election_year, Q.next_election_month, Q.next_election_time], [1928, 2, 74]);
  assert.equal(Q.S.parliament.next_election.vote_date, '1928-02-19');
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
  Q.month = 11; Q.time = 11;
  // Stage 5: E3 needs dissent of 60 and a concrete demand (decision 3A): Lewica objects to the present direction.
  PolishGovernment.factionReaction(Q, 'lewica', {dissent: 45}, {id: 'fixture:lewica', kind: 'stance',
    reverse: {kind: 'strategy', field: 'direction', value: 'class_independence', objection: 'parliamentary_socialism'}});
  PolishParty.writeMirrors(Q);
  engine.goToScene('post_event');
  assert.equal(engine.state.sceneId, 'sejm_election');
  choose(engine, 'sejm_election.calculate');
  assert.equal(Q.pps_government_position, 'Government formation pending');
  const frozen = clone(Q.sejm_results);
  formCabinet(engine, {mode: 'opposition'});
  assert.equal(Q.pps_government_position, 'Opposition');
  choose(engine, 'root');
  // The event queue routes straight to the due faction case, the card E3 (technical reference 4.5, 10.2).
  assert.equal(engine.state.sceneId, 'polish_event_faction_split');
  choose(engine, 'polish_event_faction_split.refuse');
  choose(engine, 'root');
  assert.equal(Q.S.faction_cases.list[0].status, 'split');
  assert.deepEqual([Q.year, Q.month, Q.time, Q.month_actions], [1922, 11, 11, 0]);
  assert.deepEqual(Q.sejm_results, frozen);
  assert.equal(Q.n_elections, 1);
});

test('inherited election dates cannot order an early election: the legal record decides (7.4, C8)', () => {
  const engine = create();
  const Q = engine.state.qualities;
  Q.next_election_year = 1922; Q.next_election_month = 2; Q.next_election_time = 2;
  update(engine);
  assert.deepEqual([Q.next_election_year, Q.next_election_month, Q.next_election_time], [1922, 11, 11]);
  election(engine);
  formCabinet(engine, {mode: 'opposition'});
  choose(engine, 'root');
  const first = clone(Q.sejm_results[0]);
  Q.year = 1923; Q.month = 2; Q.time = 14;
  Q.next_election_year = 1923; Q.next_election_month = 2; Q.next_election_time = 14;
  // German-era scenes still write these fields, some through set_next_election_time.
  Q.time_to_election = 3; run(engine, 'set_next_election_time');
  update(engine);
  assert.deepEqual([Q.next_election_year, Q.next_election_month, Q.next_election_time], [1928, 2, 74]);
  assert.equal(Q.sejm_election_due, false);
  engine.goToScene('main');
  assert.notEqual(engine.state.sceneId, 'sejm_election');
  assert.deepEqual(Q.sejm_results, [first]);
  assert.equal(Q.n_elections, 1);
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

test('invalid or all-zero support preserves the parliament; German bans exclude nobody', () => {
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
  // German threshold and ban fields exclude nobody at a later election (6.1).
  const {Q, result} = allocate({pps: 100}, {first: false, constitutional_reform: 1, pps_banned: 1});
  assert.equal(Q.sejm_election_error, '');
  assert.equal(result.party_seats.pps, 444);
});

test('all-zero polling is finite and German threshold settings exclude no party at a later election', () => {
  const engine = create();
  // Stage 5 (5.2): the cells always keep a valid row, so a write of zero rows cannot erase the electorate;
  // the votes stay finite and sum to one.
  preferences(engine.state.qualities, {});
  run(engine, 'election_algorithm');
  const shares = engine.state.qualities.parties.map(party => engine.state.qualities[`${party}_normalized`]);
  assert.ok(shares.every(Number.isFinite));
  close(shares.reduce((n, v) => n + v, 0), 1);
  const {result} = allocate({pps: 40, kpp: 10, npr: 4, zln: 40, other: 6},
    {first: false, constitutional_reform: 1, electoral_threshold: 5, kpp_banned: 1});
  assert.equal(sum(result.party_seats), 444);
  for (const id of ['kpp', 'npr', 'other']) {
    assert.ok(result.party_seats[id] > 0, id);
    assert.ok(result.party_votes[id] > 0);
  }
});

// Complete post-election outcomes of the one-screen formation (technical reference 8.4–8.8): the
// configuration, the role of PPS and the minority support request of one offer, or opposition.
const outcomes = [
  ['pps_majority', {pps: 60, other: 40}, {configuration: 'pps_majority', mode: 'member'}, ['pps']],
  ['left_minority with minority support', {pps: 35, psl_wyzwolenie: 30, minorities_bloc: 35},
    {configuration: 'left_minority', mode: 'member', minorities: true}, ['pps', 'psl_wyzwolenie']],
  ['centre_left', {pps: 25, psl_wyzwolenie: 25, psl_piast: 25, npr: 25},
    // NPR accepts only with its preferred Labour portfolio, so PPS takes Industry and Trade instead.
    {configuration: 'centre_left', mode: 'member', minorities: false, claim: ['economic']},
    ['pps', 'psl_wyzwolenie', 'psl_piast', 'npr'], {psl_piast: 60, npr: 60}],
  ['left_minority as a minority government', {pps: 20, psl_wyzwolenie: 20, minorities_bloc: 35, other: 25},
    {configuration: 'left_minority', mode: 'member', minorities: true}, ['pps', 'psl_wyzwolenie']],
  // In November 1922 the window candidate Nowak gets +8 in the ranking (8.7) and would be appointed;
  // the fixture records that his cabinet has fallen, so he is not proposed again (decision 3).
  ['chjeno_piast without PPS', {zln: 30, pschd: 15, psl_piast: 30, other: 25}, {mode: 'opposition'}, ['zln', 'pschd', 'psl_piast'],
    null, {fallen: 'nowak'}],
  ['no cabinet', {kpp: 100}, {mode: 'opposition'}, []],
];
for (const [label, values, offer, members, relations, fixture] of outcomes) test(`complete playable government outcome: ${label}`, () => {
  const engine = create();
  const Q = engine.state.qualities;
  for (const [id, value] of Object.entries(relations || {})) PolishGovernment.changeRelation(Q, id, value - Q.S.actors.relations[id], 'fixture');
  if (fixture && fixture.fallen) Q.S.history.cabinets.push({id: `${fixture.fallen}_fixture`, pm: fixture.fallen, end_reason: 'fall', ended_at: 5});
  election(engine, values);
  const result = formCabinet(engine, offer);
  assert.equal(Q.sejm_pending.phase, 'complete');
  for (const party of Q.parties) assert.equal(!!Q[`${party}_in_government`], members.includes(party), party);
  assert.equal(Q.minorities_bloc_in_government, 0, 'minorities support from outside; no minority portfolios');
  if (members.length) {
    assert.ok(result.appointed, 'a cabinet is appointed');
    assert.equal(Q.sejm_pending.government_choice, Q.S.cabinet.id);
    assert.deepEqual([...Q.S.cabinet.partner_ids].sort(), [...members].sort());
    // Nine unique portfolios; the mirrors follow the cabinet record (8.5, "Resorty docelowe").
    assert.deepEqual(Object.keys(Q.S.cabinet.portfolios), [...PolishGovernment.PORTFOLIOS]);
    for (const key of PolishGovernment.PORTFOLIOS) assert.equal(Q[`${key}_minister_party`], Q.S.cabinet.portfolios[key]);
    assert.equal(Q.public_works_minister_party, '');
  } else {
    assert.equal(result.appointed, null);
    assert.equal(Q.sejm_pending.government_choice, 'no_cabinet');
    assert.equal(Q.S.cabinet.status, 'caretaker', 'the previous cabinet governs');
    assert.equal(Q.S.cabinet_crisis.status, 'open');
  }
  if (label === 'left_minority with minority support') {
    assert.equal(Q.minorities_toleration, 1);
    assert.equal(Q.in_minority_government, 0);
  }
  if (label === 'left_minority as a minority government') {
    assert.equal(Q.in_minority_government, 1);
    assert.equal(Q.minorities_toleration, 1);
  }
  if (label === 'chjeno_piast without PPS') assert.equal(Q.in_chjeno_piast, 1);
  assert.equal(Q.head_of_state_name, 'Józef Piłsudski');
  assert.equal(Q.president, '');
  choose(engine, 'root');
  assert.equal(Q.time, 11);
  assert.equal(Q.month_actions, 0);
  assert.equal(Q.n_elections, 1);
  assert.equal(engine.isGameOver(), false);
});

test('223 of 444 seats, not rounded percentages, decides a PPS majority; the relation gate 49 fails and 50 passes', () => {
  const engine = create();
  const Q = engine.state.qualities;
  election(engine, {pps: 50, kpp: 50});
  assert.equal(Q.pps_seats, 222);
  const status = id => PolishGovernment.draftChoiceStatus(Q, 'configuration', id);
  assert.equal(status('pps_majority').available, false);
  assert.match(status('pps_majority').reason, /no majority of its own/);
  // Exact-seat eligibility fixtures, independent of the allocation above.
  const clubs = Q.S.parliament.clubs;
  clubs.find((club) => club.id === 'pps').seats = 223;
  clubs.find((club) => club.id === 'kpp').seats = 221;
  assert.equal(status('pps_majority').available, true);
  clubs.find((club) => club.id === 'kpp').seats = 223;
  assert.equal(status('pps_majority').available, false, '223 of 446 is no majority');
  const other = create();
  const R = other.state.qualities;
  election(other, {pps: 45, psl_wyzwolenie: 20, minorities_bloc: 10, other: 25});
  PolishGovernment.changeRelation(R, 'psl_wyzwolenie', 49 - R.S.actors.relations.psl_wyzwolenie, 'fixture');
  assert.match(PolishGovernment.draftChoiceStatus(R, 'configuration', 'left_minority').reason, /below 50/);
  PolishGovernment.changeRelation(R, 'psl_wyzwolenie', 1, 'fixture');
  assert.equal(PolishGovernment.draftChoiceStatus(R, 'configuration', 'left_minority').available, true);
});

test('external support does not mislabel an already-majority cabinet as a minority', () => {
  const engine = create();
  const Q = engine.state.qualities;
  election(engine, {pps: 40, psl_wyzwolenie: 40, minorities_bloc: 20});
  formCabinet(engine, {configuration: 'left_minority', mode: 'member', minorities: true});
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
  formCabinet(engine, {mode: 'opposition'});
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
  if (phase === 'complete') formCabinet(engine, {mode: 'opposition'});
  const saved = clone(engine.getExportableState());
  const restored = create(false);
  restored.setState(saved);
  if (phase === 'pending') choose(restored, 'sejm_election.calculate');
  if (phase !== 'complete') formCabinet(restored, {mode: 'opposition'});
  choose(restored, 'root');
  const state = restored.state.qualities;
  const frozen = clone(state.sejm_results);
  const cabinet = clone(state.S.cabinet);
  const negotiations = state.S.history.negotiations.length;
  for (const id of ['sejm_election_result', 'polish_cabinet_formation.submit', 'election_1928.post_election_polish',
    'election_1928.post_election_1928']) run(restored, id);
  update(restored);
  assert.deepEqual(state.sejm_results, frozen);
  assert.deepEqual(state.S.cabinet, cabinet, 'no second appointment');
  assert.equal(state.S.history.negotiations.length, negotiations);
  assert.equal(state.n_elections, 1);
  assert.equal(state.time, 11);
  assert.equal(state.sejm_pending.phase, 'complete');
});

test('legacy writers and repeated government choices cannot replace the recorded election', () => {
  const engine = create();
  const Q = engine.state.qualities;
  election(engine, {pps: 60, other: 40});
  formCabinet(engine, {configuration: 'pps_majority', mode: 'member'});
  choose(engine, 'root');
  const before = clone(Q.sejm_results);
  const cabinet = clone(Q.S.cabinet);
  Q.pps_r = 1; Q.spd_r = 1; Q.election_records.push({date: 'bogus', pps: 99});
  update(engine);
  assert.equal(Q.pps_r, 100 * before[0].party_seats.pps / 444);
  assert.equal(Q.election_records.length, 1);
  run(engine, 'polish_cabinet_formation.submit');
  update(engine);
  assert.equal(Q.pps_in_government, 1);
  assert.deepEqual(Q.S.cabinet, cabinet);
  engine.goToScene('election_1928.post_election_1928');
  assert.deepEqual(Q.sejm_results, before);
  assert.equal(condition(engine, 'election_1928.cancel_elections'), false);
  assert.equal(Q.n_elections, 1);
});

test('the February 1928 election reuses the exact method without ChZJN, keeps 1922 history and ends the chapter', () => {
  const engine = create();
  const Q = engine.state.qualities;
  election(engine);
  formCabinet(engine, {mode: 'opposition'});
  choose(engine, 'root');
  const first = clone(Q.sejm_results[0]);
  Q.year = 1928; Q.month = 2; Q.time = 74;
  update(engine); engine.goToScene('election_1928');
  choose(engine, 'sejm_election.calculate');
  assert.equal(Q.sejm_results.length, 2);
  assert.deepEqual(Q.sejm_results[0], first);
  const second = Q.sejm_results[1];
  assert.equal(second.kind, 'next_legal_election');
  assert.equal(second.sequence_after_opening, 2);
  assert.equal(second.status, 'certified');
  assert.equal(second.ballot_date, '1928-02-19');
  assert.equal(second.legal_basis.kind, 'term_end');
  assert.ok(!second.lists.some((row) => row.id === 'chzjn'));
  assert.equal(sum(second.party_seats), 444);
  assert.match(Q.pschd_election_display, /previous votes N\/A/);
  assert.match(Q.pps_election_display, /vote change/);
  // The certified result ends the chapter before any government formation (19.1).
  assert.equal(engine.state.sceneId, 'sejm_election.chapter_end');
  assert.equal(Q.S.chapter.status, 'ended');
  assert.equal(Q.S.chapter.trigger_id, second.id);
  assert.ok(!engine.getCurrentChoices().some((c) => c.id.startsWith('election_1928.') || c.id === 'polish_cabinet_formation'),
    'no government formation');
  assert.equal(Q.S.negotiation, null);
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

test('post-election safeguards cover held cards, old coalition links and police choices; the Polish welfare card replaces the German one', () => {
  const engine = create();
  const Q = engine.state.qualities;
  election(engine, outcomes[3][1]);
  formCabinet(engine, outcomes[3][2]);
  assert.equal(Q.pps_in_government, 1);
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
  // Stage 4: the German welfare card no longer runs; PPS with Labour uses the Polish card 8.2.
  assert.equal(condition(engine, 'social_welfare'), false, 'the German welfare card is off in the Polish economy');
  assert.equal(Q.S.cabinet.portfolios.labor, 'pps');
  assert.equal(condition(engine, 'polish_gov_social_welfare'), true);
  engine.state.currentHands.main = [{id: 'war_guilt', title: 'Old card'}, {id: 'prussian_affairs', title: 'Old card'}];
  engine.displayChoices();
  assert.deepEqual(engine.state.currentHands.main, []);
  assert.equal(Q.spd_prussia, 1, 'force compatibility retained');
  engine.state.currentHands.main = [{id: 'polish_gov_social_welfare', title: 'Benefits'}];
  engine.playCard('polish_gov_social_welfare');
  choose(engine, 'polish_gov_social_welfare.expand');
  choose(engine, 'root');
  assert.equal(Q.month, 12);
  const protection = Object.values(Q.S.projects).find(p => p.type === 'worker_protection');
  assert.deepEqual([protection.status, protection.upkeep_budget_B, protection.sponsor], ['operating', 2, 'pps']);
  assert.equal(Q.S.economy.history.at(-1).project_charges, 2, 'the protection pays from the month it starts');
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
