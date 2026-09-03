const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test, mock, beforeEach, afterEach } = require('node:test');
const { convertJSONToGame, DendryEngine, NullUserInterface } = require('dendrynexus/lib/engine');

const gameJSON = fs.readFileSync(path.join(__dirname, '..', 'out', 'game.json'), 'utf8');
const diagnostics = [];
mock.method(console, 'log', (...args) => {
  if (String(args[0]).startsWith('Error in')) diagnostics.push(args.map(String).join(' '));
});
beforeEach(() => { diagnostics.length = 0; });
afterEach(() => assert.deepEqual(diagnostics, [], 'Dendry must not swallow script or condition errors'));

const clone = value => JSON.parse(JSON.stringify(value));
const sum = object => Object.values(object).reduce((total, value) => total + value, 0);

function create(start = true) {
  let game;
  convertJSONToGame(gameJSON, (error, result) => { if (error) throw error; game = result; });
  const ui = new NullUserInterface();
  ui.paragraphs = [];
  ui.newPage = () => { ui.paragraphs = []; };
  ui.displayContent = content => ui.paragraphs.push(...content);
  const engine = new DendryEngine(ui, game);
  engine.beginGame([1922]);
  if (start) {
    choose(engine, 'root.start');
    choose(engine, 'root.1928_main');
  }
  return engine;
}

function choice(engine, id) {
  return engine.getCurrentChoices().find(item => item.id === id);
}

function choose(engine, id) {
  const choices = engine.getCurrentChoices();
  const index = choices.findIndex(item => item.id === id);
  assert.ok(index >= 0, `${id} missing from ${engine.state.sceneId}: ${choices.map(item => item.id)}`);
  assert.equal(choices[index].canChoose, true, `${id} must be available`);
  engine.choose(index);
}

function condition(engine, id, field = 'viewIf') {
  return engine._runPredicate(engine.game.scenes[id][field], true);
}

function content(engine) {
  return JSON.stringify(engine.ui.paragraphs);
}

function update(engine) {
  engine._runActions(engine.game.scenes.polish_opening_state.onArrival);
}

function completeNovemberElection(engine) {
  const Q = engine.state.qualities;
  Q.year = 1922;
  Q.month = 11;
  Q.time = 11;
  update(engine);
  engine.goToScene('sejm_election');
  choose(engine, 'sejm_election.calculate');
  choose(engine, 'election_1928.polish_opposition');
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'main');
  assert.equal(Q.sejm_pending.phase, 'complete');
  return clone(Q.sejm_parliament);
}

function advanceToDecember(engine, expectedScene = 'polish_presidential_sequence.first_nomination') {
  const Q = engine.state.qualities;
  engine.state.currentHands.main = [{id: 'campaigning', title: 'Campaigning'}];
  engine.playCard('campaigning');
  choose(engine, 'campaigning.workers');
  choose(engine, 'root');
  assert.equal(Q.month, 12);
  assert.equal(engine.state.sceneId, expectedScene);
}

function finishSequence(engine) {
  choose(engine, 'polish_presidential_sequence.confirm_daszynski');
  choose(engine, 'polish_presidential_sequence.first_transfer');
  choose(engine, 'polish_presidential_sequence.assassination');
  choose(engine, 'polish_presidential_sequence.constitutional_response');
  choose(engine, 'polish_presidential_sequence.do_not_run_daszynski_second');
  assert.equal(engine.state.sceneId, 'polish_presidential_sequence.second_final');
}

test('new game has a semantic Polish constitutional office without activating legacy presidency', () => {
  const engine = create();
  const Q = engine.state.qualities;
  assert.equal(Q.polish_presidential_system, 1);
  assert.equal(Q.polish_presidential_sequence_completed, 0);
  assert.equal(Q.polish_presidency.current.office_id, 'naczelnik_panstwa');
  assert.equal(Q.polish_presidency.current.holder_id, 'jozef_pilsudski');
  assert.equal(Q.polish_presidency.constitution.election_body, 'national_assembly');
  assert.equal(Q.polish_presidency.constitution.term_years, 7);
  assert.equal(Q.polish_presidency.constitution.government_acts_require_countersignature, true);
  assert.equal(Q.polish_presidency.constitution.legislative_veto, false);
  assert.equal(Q.polish_presidency.constitution.independent_decrees, false);
  assert.equal(Q.president, '');
  assert.equal(Q.presidential_powers, 0);
  assert.equal(Q.polish_presidential_due, false);
});

test('December sequence follows the completed Sejm/government path before ordinary events and costs no extra month', () => {
  const engine = create();
  const Q = engine.state.qualities;
  const parliament = completeNovemberElection(engine);
  const before = [Q.time, Q.month_actions, Q.n_elections];
  advanceToDecember(engine);
  assert.deepEqual([Q.time, Q.month_actions, Q.n_elections], [before[0] + 1, 0, 1]);
  assert.equal(Q.polish_presidential_due, true);
  assert.equal(Q.polish_presidential_phase, 'first_nomination');
  assert.deepEqual(Q.sejm_parliament, parliament);
  assert.equal(choice(engine, 'polish_presidential_sequence.confirm_daszynski').canChoose, true);
  assert.equal(choice(engine, 'polish_presidential_sequence.decline_daszynski').canChoose, false);
});

test('presidential date gate requires completed government formation and remains recoverable after December', () => {
  const incomplete = create();
  const IQ = incomplete.state.qualities;
  IQ.year = 1922; IQ.month = 12; IQ.time = 12;
  IQ.sejm_first_election_completed = 1;
  IQ.sejm_pending = {phase: 'results'};
  update(incomplete);
  assert.equal(IQ.polish_presidential_due, false);

  const engine = create();
  const Q = engine.state.qualities;
  completeNovemberElection(engine);
  update(engine);
  assert.equal(Q.polish_presidential_due, false, 'not due in November');
  Q.year = 1922; Q.month = 12; Q.time = 12;
  update(engine);
  assert.equal(Q.polish_presidential_due, true, 'due in December');
  Q.year = 1923; Q.month = 1; Q.time = 13;
  update(engine);
  assert.equal(Q.polish_presidential_due, true, 'overdue saves still recover the mandatory sequence');
});

test('National Assembly snapshot has 444 Sejm MPs, 111 senators and 555 total members', () => {
  const engine = create();
  const Q = engine.state.qualities;
  const parliament = completeNovemberElection(engine);
  advanceToDecember(engine);
  const assembly = Q.polish_presidency.assembly;
  assert.equal(assembly.kind, 'gameplay_proportional_senate_snapshot');
  assert.equal(assembly.sejm_total, 444);
  assert.equal(assembly.senate_total, 111);
  assert.equal(assembly.total_members, 555);
  assert.equal(sum(assembly.sejm_seats), 444);
  assert.equal(sum(assembly.senate_seats), 111);
  assert.equal(sum(assembly.party_seats), 555);
  assert.deepEqual(assembly.sejm_seats, parliament.party_seats);
  assert.deepEqual(Q.sejm_parliament, parliament);
  for (const value of Object.values(assembly.senate_seats)) assert.equal(Number.isSafeInteger(value), true);
});

test('fixed ballots, supporters and office transitions are recorded once while cabinet and legacy fields stay unchanged', () => {
  const engine = create();
  const Q = engine.state.qualities;
  completeNovemberElection(engine);
  const government = {
    chancellor: Q.chancellor,
    party: Q.chancellor_party,
    portfolios: Object.fromEntries(Object.keys(Q.polish_portfolios)
      .map(key => [key, [Q[`${key}_minister`], Q[`${key}_minister_party`]]])),
  };
  advanceToDecember(engine);
  finishSequence(engine);
  assert.equal(Q.polish_presidential_sequence_completed, 1);
  assert.equal(Q.polish_presidential_phase, 'complete');
  assert.equal(Q.polish_presidency.elections.length, 2);
  const [first, second] = Q.polish_presidency.elections;
  assert.deepEqual(first.final_ballot.map(row => [row.candidate_id, row.votes]), [
    ['gabriel_narutowicz', 289], ['maurycy_zamoyski', 227],
  ]);
  assert.deepEqual(first.final_ballot[0].supporters,
    ['psl_wyzwolenie', 'pps', 'psl_piast', 'minorities_bloc', 'npr']);
  assert.equal(first.blank_ballots, 29);
  assert.deepEqual(second.final_ballot.map(row => [row.candidate_id, row.votes]), [
    ['stanislaw_wojciechowski', 298], ['kazimierz_morawski', 221],
  ]);
  assert.deepEqual(second.final_ballot[0].supporters,
    ['psl_piast', 'psl_wyzwolenie', 'pps', 'npr', 'minorities_bloc']);
  assert.equal(Q.polish_presidency.current.holder_id, 'stanislaw_wojciechowski');
  assert.equal(Q.polish_presidency.current.office_id, 'prezydent_rp');
  assert.deepEqual(Q.polish_presidency.transitions.map(item => item.id),
    ['narutowicz_oath', 'pilsudski_transfer', 'narutowicz_assassinated', 'wojciechowski_oath']);
  assert.ok(!Q.polish_presidency.transitions.some(item => item.holder_id === 'maciej_rataj'));
  assert.equal(Q.president, '');
  assert.equal(Q.presidential_powers, 0);
  assert.equal(Q.chancellor, government.chancellor);
  assert.equal(Q.chancellor_party, government.party);
  for (const [key, value] of Object.entries(government.portfolios)) {
    assert.deepEqual([Q[`${key}_minister`], Q[`${key}_minister_party`]], value);
  }
  assert.deepEqual([Q.year, Q.month, Q.time, Q.month_actions], [1922, 12, 12, 0]);
});

test('nomination and constitutional response alter no unapproved numerical state or adviser slots', () => {
  const engine = create();
  const Q = engine.state.qualities;
  completeNovemberElection(engine);
  advanceToDecember(engine);
  const keys = ['resources', 'workers_pps', 'old_middle_pps', 'new_middle_pps', 'rural_pps',
    'centrum_strength', 'centrum_dissent', 'lewica_strength', 'lewica_dissent',
    'pilsudczycy_strength', 'pilsudczycy_dissent', 'psl_wyzwolenie_relation',
    'psl_piast_relation', 'minorities_bloc_relation', 'pps_militia_strength', 'pps_militia_militancy'];
  const before = Object.fromEntries(keys.map(key => [key, Q[key]]));
  const advisers = [Q.daszynski_advisor, Q.n_advisors];
  choose(engine, 'polish_presidential_sequence.confirm_daszynski');
  choose(engine, 'polish_presidential_sequence.first_transfer');
  choose(engine, 'polish_presidential_sequence.assassination');
  assert.equal(choice(engine, 'polish_presidential_sequence.armed_reprisals').canChoose, false);
  choose(engine, 'polish_presidential_sequence.constitutional_response');
  assert.deepEqual(Object.fromEntries(keys.map(key => [key, Q[key]])), before);
  assert.deepEqual([Q.daszynski_advisor, Q.n_advisors], advisers);
  assert.equal(Q.polish_presidential_pending.assassination_response, 'constitutional_peaceful_mobilization');
});

test('a prior Centrum departure prevents Daszyński candidacy regardless of active adviser status', () => {
  const engine = create();
  const Q = engine.state.qualities;
  completeNovemberElection(engine);
  Q.daszynski_left_adviser_pool = 1;
  Q.daszynski_advisor = 1;
  advanceToDecember(engine, 'polish_presidential_sequence.first_without_daszynski');
  assert.equal(engine.state.sceneId, 'polish_presidential_sequence.first_without_daszynski');
  assert.equal(Q.polish_presidential_pending.first_pps_candidate, '');
  choose(engine, 'polish_presidential_sequence.first_final');
  assert.equal(Q.polish_presidency.elections[0].pps_candidate, '');
  assert.equal(Q.daszynski_advisor, 1, 'presidential route does not alter adviser-slot state');
});

test('second Daszyński candidacy and armed reprisals remain visible but unavailable', () => {
  const engine = create();
  completeNovemberElection(engine);
  advanceToDecember(engine);
  choose(engine, 'polish_presidential_sequence.confirm_daszynski');
  choose(engine, 'polish_presidential_sequence.first_transfer');
  choose(engine, 'polish_presidential_sequence.assassination');
  assert.equal(choice(engine, 'polish_presidential_sequence.armed_reprisals').canChoose, false);
  choose(engine, 'polish_presidential_sequence.constitutional_response');
  assert.equal(choice(engine, 'polish_presidential_sequence.run_daszynski_second').canChoose, false);
  assert.equal(choice(engine, 'polish_presidential_sequence.do_not_run_daszynski_second').canChoose, true);
});

test('save/restore in the middle resumes once and cannot duplicate immutable history', () => {
  const engine = create();
  completeNovemberElection(engine);
  advanceToDecember(engine);
  choose(engine, 'polish_presidential_sequence.confirm_daszynski');
  choose(engine, 'polish_presidential_sequence.first_transfer');
  const saved = clone(engine.getExportableState());
  const restored = create(false);
  restored.setState(saved);
  choose(restored, 'polish_presidential_sequence.assassination');
  choose(restored, 'polish_presidential_sequence.constitutional_response');
  choose(restored, 'polish_presidential_sequence.do_not_run_daszynski_second');
  const Q = restored.state.qualities;
  const history = clone(Q.polish_presidency);
  restored.goToScene('polish_presidential_sequence');
  assert.deepEqual(Q.polish_presidency, history);
  assert.equal(Q.polish_presidency.elections.length, 2);
  assert.equal(Q.polish_presidency.pps_decisions.length, 3);
});

test('Status and Library use the same authoritative president and recorded final ballots', () => {
  const engine = create();
  completeNovemberElection(engine);
  advanceToDecember(engine);
  finishSequence(engine);
  engine.goToScene('status');
  assert.match(content(engine), /Stanisław Wojciechowski/);
  assert.match(content(engine), /National Assembly/);
  engine.goToScene('backSpecialScene');
  engine.goToScene('library');
  choose(engine, 'library.presidency');
  const page = content(engine);
  for (const expected of ['Stanisław Wojciechowski', 'Gabriel Narutowicz', 'Maurycy Zamoyski',
    'Kazimierz Morawski', '289 votes', '227 votes', '298 votes', '221 votes', '555']) {
    assert.ok(page.includes(expected), expected);
  }
  assert.match(page, /brief acting presidency/);
});

test('German direct election and Hindenburg succession are guarded only under the Polish system', () => {
  const engine = create();
  const Q = engine.state.qualities;
  Q.year = 1932; Q.month = 4; Q.presidential_election_seen = 0;
  assert.equal(condition(engine, 'presidential_election_1932'), false);
  Q.year = 1934; Q.month = 7; Q.president = 'Hindenburg';
  assert.equal(condition(engine, 'death_of_hindenburg_president'), false);
  Q.president = '';
  assert.equal(condition(engine, 'death_of_hindenburg_normal'), false);
  Q.polish_presidential_system = 0;
  Q.year = 1932; Q.month = 4; Q.presidential_election_seen = 0;
  assert.equal(condition(engine, 'presidential_election_1932'), true);
  Q.year = 1934; Q.month = 7; Q.president = 'Hindenburg';
  assert.equal(condition(engine, 'death_of_hindenburg_president'), true);
});

test('an eligible faction event is deferred until the mandatory presidential sequence finishes', () => {
  const engine = create();
  const Q = engine.state.qualities;
  completeNovemberElection(engine);
  Q.lewica_dissent = 60;
  advanceToDecember(engine);
  assert.equal(Q.lewica_split, 0);
  finishSequence(engine);
  choose(engine, 'polish_presidential_sequence.finish');
  assert.equal(engine.state.sceneId, 'post_event.events_choice');
  choose(engine, 'pps_lewica_split');
  assert.equal(engine.state.sceneId, 'pps_lewica_split');
  assert.equal(Q.polish_presidential_sequence_completed, 1);
  assert.equal(Q.lewica_split, 1);
});
