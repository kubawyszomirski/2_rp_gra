const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// The December 1922 offices (technical reference 7.3, 7.5; cards 7.8 and 7.9; implementation plan,
// stage 2): the Marshal first, then the President, counted from the clubs' votes with the approved
// test profile office_profiles_1922_v1. The fixture parliaments use explicit vote shares so the
// tests do not depend on the default, not yet calibrated, 1922 result.
const { choose, clone } = dendry;
let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

const sum = object => Object.values(object).reduce((total, value) => total + value, 0);
// Close to the 1922 shares: the historical winners follow from it (Rataj, Narutowicz, Wojciechowski).
const HISTORICAL_LIKE = { zln: 22, pschd: 10, psl_piast: 13, psl_wyzwolenie: 11, pps: 10, npr: 5, minorities_bloc: 16, kpp: 1.5, other: 11.5 };
// The national result of the opening before the calibration of stage 8 (decision 2A): PPS is slightly larger than
// PSL Wyzwolenie, so a Daszyński nomination eliminates Narutowicz first (a fixture for the branch without him).
const PPS_AHEAD = { kpp: 6.005, pps: 13.287, npr: 6.33, psl_wyzwolenie: 12.751, psl_piast: 13.145, pschd: 6.589, zln: 11.848, minorities_bloc: 20.451, other: 9.594 };

function choice(engine, id) {
  return engine.getCurrentChoices().find(item => item.id === id);
}
function content(engine) {
  return JSON.stringify(engine.ui.paragraphs);
}
function update(engine) {
  engine._runActions(engine.game.scenes.polish_opening_state.onArrival);
}
function condition(engine, id, field = 'viewIf') {
  return engine._runPredicate(engine.game.scenes[id][field], true);
}
function shares(Q, values) {
  for (const group of Q.classes) for (const party of Q.parties) Q[`${group}_${party}`] = values[party] || 0;
  // Stage 5: the cells own the preferences, so the fixture rows are turned into cells again (5.1–5.2).
  if (Q.S && Q.S.society && Q.S.society.cells && Object.values(values).some(v => v > 0)) { PolishElectorate.seedCells(Q); PolishElectorate.writeClassMirrors(Q); }
}

function completeNovemberElection(engine, values = HISTORICAL_LIKE) {
  const Q = engine.state.qualities;
  Q.year = 1922; Q.month = 11; Q.time = 11;
  if (values) shares(Q, values);
  update(engine);
  engine.goToScene('sejm_election');
  choose(engine, 'sejm_election.calculate');
  dendry.formCabinet(engine, { mode: 'opposition' });
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'main');
  assert.equal(Q.sejm_pending.phase, 'complete');
  return clone(Q.sejm_parliament);
}

function advanceToDecember(engine, expectedScene = 'polish_speaker_election.choice') {
  const Q = engine.state.qualities;
  engine.state.currentHands.main = [{ id: 'campaigning', title: 'Campaigning' }];
  engine.playCard('campaigning');
  choose(engine, 'campaigning.workers');
  choose(engine, 'root');
  assert.equal(Q.month, 12);
  assert.equal(engine.state.sceneId, expectedScene);
}

function electSpeaker(engine, option = 'rataj') {
  choose(engine, `polish_speaker_election.${option}`);
  assert.equal(engine.state.sceneId, 'polish_speaker_election.result');
  choose(engine, 'polish_speaker_election.finish');
  assert.equal(engine.state.sceneId, 'polish_presidential_sequence.first_nomination');
}

// Stage 7c: after the vacancy the answer of PPS to the assassination (B4) comes from the event queue (17.6), then the
// National Assembly meets again.
function answerAssassination(engine, answer = 'restraint') {
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'polish_event_assassination_response');
  choose(engine, `polish_event_assassination_response.${answer}`);
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'polish_presidential_sequence.second_nomination');
}
// The historical branch: Narutowicz is elected, assassinated, and Wojciechowski succeeds him.
function finishHistoricalBranch(engine, first = 'decline_daszynski') {
  choose(engine, `polish_presidential_sequence.${first}`);
  assert.equal(engine.state.sceneId, 'polish_presidential_sequence.first_final');
  choose(engine, 'polish_presidential_sequence.first_transfer');
  choose(engine, 'polish_presidential_sequence.assassination');
  answerAssassination(engine);
  choose(engine, 'polish_presidential_sequence.do_not_run_daszynski_second');
  assert.equal(engine.state.sceneId, 'polish_presidential_sequence.second_final');
}

function december(options = {}) {
  const engine = dendry.startGame();
  const parliament = completeNovemberElection(engine, options.values === undefined ? HISTORICAL_LIKE : options.values);
  advanceToDecember(engine);
  return { engine, Q: engine.state.qualities, parliament };
}

test('new game has a semantic Polish constitutional office without activating legacy presidency', () => {
  const engine = dendry.startGame();
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
  assert.equal(Q.S.parliament.speaker, null);
  assert.equal(Q.S.senate.status, 'not_constituted');
});

test('December begins with the Marshal, then the President, before ordinary events and without an extra month', () => {
  const { engine, Q, parliament } = december();
  assert.deepEqual([Q.time, Q.month_actions, Q.n_elections], [12, 0, 1]);
  assert.equal(Q.polish_presidential_due, false, 'the Marshal comes first (7.5)');
  electSpeaker(engine);
  assert.equal(Q.S.parliament.speaker.person_id, 'maciej_rataj');
  assert.equal(Q.polish_presidential_phase, 'first_nomination');
  assert.deepEqual(Q.sejm_parliament, parliament);
  assert.equal(choice(engine, 'polish_presidential_sequence.confirm_daszynski').canChoose, true);
  assert.equal(choice(engine, 'polish_presidential_sequence.decline_daszynski').canChoose, true);
  assert.deepEqual([Q.time, Q.month_actions], [12, 0]);
});

test('presidential date gate requires government formation and the Marshal vote, and stays recoverable', () => {
  const incomplete = dendry.startGame();
  const IQ = incomplete.state.qualities;
  IQ.year = 1922; IQ.month = 12; IQ.time = 12;
  IQ.sejm_first_election_completed = 1;
  IQ.sejm_pending = { phase: 'results' };
  update(incomplete);
  assert.equal(IQ.polish_presidential_due, false);

  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  completeNovemberElection(engine);
  update(engine);
  assert.equal(Q.polish_presidential_due, false, 'not due in November');
  Q.year = 1922; Q.month = 12; Q.time = 12;
  update(engine);
  assert.equal(Q.polish_speaker_due, 1, 'the Marshal is due in December');
  assert.equal(Q.polish_presidential_due, false, 'the President waits for the Marshal vote');
  engine.goToScene('polish_speaker_election');
  choose(engine, 'polish_speaker_election.rataj');
  choose(engine, 'polish_speaker_election.finish');
  update(engine);
  assert.equal(Q.polish_presidential_due, true, 'due in December after the Marshal vote');
  Q.year = 1923; Q.month = 1; Q.time = 13;
  update(engine);
  assert.equal(Q.polish_presidential_due, true, 'overdue saves still recover the mandatory sequence');
});

test('National Assembly has 444 Sejm MPs and the 111 senators recorded with the election', () => {
  const { engine, Q, parliament } = december();
  // The Senate was recorded with the November result, not in December.
  assert.equal(Q.S.senate.status, 'constituted');
  assert.equal(Q.S.senate.method, 'sejm_proxy_v1');
  assert.equal(Q.S.senate.result_id, Q.sejm_results[0].senate_result_id);
  electSpeaker(engine);
  const assembly = Q.polish_presidency.assembly;
  assert.equal(assembly.kind, 'gameplay_proportional_senate_snapshot');
  assert.equal(assembly.sejm_total, 444);
  assert.equal(assembly.senate_total, 111);
  assert.equal(assembly.total_members, 555);
  assert.equal(sum(assembly.sejm_seats), 444);
  assert.equal(sum(assembly.senate_seats), 111);
  assert.equal(sum(assembly.party_seats), 555);
  assert.deepEqual(assembly.sejm_seats, parliament.party_seats);
  assert.deepEqual(assembly.senate_seats, Q.S.senate.club_seats);
  assert.deepEqual(Q.sejm_parliament, parliament);
  for (const value of Object.values(assembly.senate_seats)) assert.equal(Number.isSafeInteger(value), true);
});

test('counted ballots, supporters and office transitions are recorded once; cabinet and legacy fields stay', () => {
  const { engine, Q } = december();
  const government = {
    chancellor: Q.chancellor,
    party: Q.chancellor_party,
    portfolios: Object.fromEntries(Object.keys(Q.polish_portfolios)
      .map(key => [key, [Q[`${key}_minister`], Q[`${key}_minister_party`]]])),
  };
  electSpeaker(engine);
  finishHistoricalBranch(engine);
  assert.equal(Q.polish_presidential_sequence_completed, 1);
  assert.equal(Q.polish_presidential_phase, 'complete');
  assert.equal(Q.polish_presidency.elections.length, 2);
  const [first, second] = Q.polish_presidency.elections;
  assert.equal(first.method, 'presidential_final_result_v1');
  assert.equal(first.status, 'elected');
  assert.deepEqual(first.final_ballot.map(row => [row.candidate_id, row.votes]), [
    ['gabriel_narutowicz', 305], ['maurycy_zamoyski', 214],
  ]);
  assert.equal(first.final_ballot.reduce((n, row) => n + row.votes, 0) + first.blank_ballots, 555);
  // The minority bloc votes as its two representations (5.5, stage 3).
  assert.deepEqual(first.final_ballot[0].supporters, ['jewish_rep', 'npr', 'other_minorities_rep', 'pps', 'psl_piast', 'psl_wyzwolenie']);
  assert.deepEqual(first.final_ballot[1].supporters, ['pschd', 'zln']);
  assert.equal(first.tie_break, null);
  assert.deepEqual(second.final_ballot.map(row => [row.candidate_id, row.votes]), [
    ['stanislaw_wojciechowski', 305], ['kazimierz_morawski', 214],
  ]);
  assert.equal(Q.polish_presidency.current.holder_id, 'stanislaw_wojciechowski');
  assert.equal(Q.polish_presidency.current.office_id, 'prezydent_rp');
  assert.deepEqual(Q.polish_presidency.transitions.map(item => item.id),
    ['narutowicz_oath', 'pilsudski_transfer', 'narutowicz_assassinated', 'rataj_acting', 'wojciechowski_oath']);
  // C9: the Marshal actually elected substitutes for the vacant presidency.
  const acting = Q.polish_presidency.transitions.find(item => item.kind === 'acting_presidency');
  assert.equal(acting.holder_id, 'maciej_rataj');
  assert.equal(Q.S.ballots.filter(ballot => ballot.chamber === 'national_assembly').length, 2);
  assert.equal(Q.president, '');
  assert.equal(Q.presidential_powers, 0);
  assert.equal(Q.chancellor, government.chancellor);
  assert.equal(Q.chancellor_party, government.party);
  for (const [key, value] of Object.entries(government.portfolios)) {
    assert.deepEqual([Q[`${key}_minister`], Q[`${key}_minister_party`]], value);
  }
  assert.deepEqual([Q.year, Q.month, Q.time, Q.month_actions], [1922, 12, 12, 0]);
});

test('the threat branch follows only the election of Narutowicz', () => {
  // With PPS slightly larger than PSL Wyzwolenie (PPS_AHEAD), a Daszyński nomination eliminates Narutowicz
  // first and another President is elected.
  const { engine, Q } = december({ values: PPS_AHEAD });
  electSpeaker(engine);
  choose(engine, 'polish_presidential_sequence.confirm_daszynski');
  const first = Q.polish_presidency.elections[0];
  assert.notEqual(first.winner_id, 'gabriel_narutowicz');
  choose(engine, 'polish_presidential_sequence.first_transfer');
  assert.equal(choice(engine, 'polish_presidential_sequence.assassination'), undefined);
  choose(engine, 'polish_presidential_sequence.first_done');
  assert.equal(Q.polish_presidential_sequence_completed, 1);
  assert.equal(Q.polish_presidency.elections.length, 1);
  assert.ok(!Q.polish_presidency.transitions.some(item => item.kind === 'assassination'));
  assert.equal(Q.polish_presidency.current.holder_id, first.winner_id);
});

test('the Marshal stance changes only its approved relation, once; the nomination and a restrained answer change nothing', () => {
  const { engine, Q } = december();
  const keys = ['resources', 'workers_pps', 'old_middle_pps', 'new_middle_pps', 'rural_pps',
    'centrum_strength', 'centrum_dissent', 'lewica_strength', 'lewica_dissent',
    'pilsudczycy_strength', 'pilsudczycy_dissent', 'psl_wyzwolenie_relation',
    'psl_piast_relation', 'minorities_bloc_relation', 'pps_militia_strength', 'pps_militia_militancy'];
  const before = Object.fromEntries(keys.map(key => [key, Q[key]]));
  const advisers = [Q.daszynski_advisor, Q.n_advisors];
  choose(engine, 'polish_speaker_election.smiarowski');
  engine.goToScene('polish_speaker_election');
  choose(engine, 'polish_speaker_election.finish');
  const afterSpeaker = { ...before, psl_wyzwolenie_relation: before.psl_wyzwolenie_relation + 4 };
  assert.deepEqual(Object.fromEntries(keys.map(key => [key, Q[key]])), afterSpeaker);
  choose(engine, 'polish_presidential_sequence.confirm_daszynski');
  choose(engine, 'polish_presidential_sequence.first_transfer');
  choose(engine, 'polish_presidential_sequence.assassination');
  answerAssassination(engine, 'restraint');
  assert.deepEqual(Object.fromEntries(keys.map(key => [key, Q[key]])), afterSpeaker, 'restraint without a broken promise costs nothing');
  assert.deepEqual([Q.daszynski_advisor, Q.n_advisors], advisers);
  assert.equal(Q.polish_presidency.pps_decisions.find(d => d.id === 'narutowicz_assassination_response').decision, 'restraint');
});

test('a prior Centrum departure blocks Daszyński as Marshal and President, regardless of adviser status', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  completeNovemberElection(engine);
  Q.daszynski_left_adviser_pool = 1;
  Q.daszynski_advisor = 1;
  advanceToDecember(engine);
  const speakerOption = choice(engine, 'polish_speaker_election.daszynski');
  assert.equal(speakerOption.canChoose, false);
  electSpeaker(engine);
  assert.equal(choice(engine, 'polish_presidential_sequence.confirm_daszynski').canChoose, false);
  choose(engine, 'polish_presidential_sequence.decline_daszynski');
  assert.equal(Q.polish_presidency.elections[0].pps_candidate, '');
  assert.equal(Q.polish_presidency.pps_decisions[0].decision, 'no_pps_candidate_after_daszynski_departure');
  assert.equal(Q.daszynski_advisor, 1, 'presidential route does not alter adviser-slot state');
});

test('the second Daszyński candidacy is available after the answer to the assassination', () => {
  const { engine } = december();
  electSpeaker(engine);
  choose(engine, 'polish_presidential_sequence.decline_daszynski');
  choose(engine, 'polish_presidential_sequence.first_transfer');
  choose(engine, 'polish_presidential_sequence.assassination');
  answerAssassination(engine);
  assert.equal(choice(engine, 'polish_presidential_sequence.run_daszynski_second').canChoose, true);
  assert.equal(choice(engine, 'polish_presidential_sequence.do_not_run_daszynski_second').canChoose, true);
});

test('save/restore in the middle resumes once and cannot duplicate immutable history', () => {
  const { engine } = december();
  electSpeaker(engine);
  choose(engine, 'polish_presidential_sequence.decline_daszynski');
  choose(engine, 'polish_presidential_sequence.first_transfer');
  const restored = dendry.saveAndRestore(engine);
  choose(restored, 'polish_presidential_sequence.assassination');
  answerAssassination(restored);
  choose(restored, 'polish_presidential_sequence.do_not_run_daszynski_second');
  const Q = restored.state.qualities;
  const history = clone(Q.polish_presidency);
  const ballots = clone(Q.S.ballots);
  restored.goToScene('polish_presidential_sequence');
  assert.deepEqual(Q.polish_presidency, history);
  assert.deepEqual(Q.S.ballots, ballots);
  assert.equal(Q.polish_presidency.elections.length, 2);
  assert.equal(Q.polish_presidency.pps_decisions.length, 3);
});

test('Status and Library use the same authoritative president and the recorded final ballots', () => {
  const { engine } = december();
  electSpeaker(engine);
  finishHistoricalBranch(engine);
  engine.goToScene('status');
  assert.match(content(engine), /Stanisław Wojciechowski/);
  assert.match(content(engine), /National Assembly/);
  assert.match(content(engine), /Marshal of the Sejm: ","Maciej Rataj/);
  assert.match(content(engine), /111 senators/);
  engine.goToScene('backSpecialScene');
  engine.goToScene('library');
  choose(engine, 'library.presidency');
  const page = content(engine);
  for (const expected of ['Stanisław Wojciechowski', 'Gabriel Narutowicz', 'Maurycy Zamoyski',
    'Kazimierz Morawski', '305 votes', '214 votes', '555', 'Historical note', '289 votes to 227']) {
    assert.ok(page.includes(expected), expected);
  }
});

test('German direct election and Hindenburg succession are guarded only under the Polish system', () => {
  const engine = dendry.startGame();
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

test('an eligible faction event is deferred until the mandatory December sequences finish', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  completeNovemberElection(engine);
  // Stage 5: E3 needs dissent of 60 and a concrete demand (decision 3A): Lewica objects to the present direction.
  PolishGovernment.factionReaction(Q, 'lewica', {dissent: 45}, {id: 'fixture:lewica', kind: 'stance',
    reverse: {kind: 'strategy', field: 'direction', value: 'class_independence', objection: 'parliamentary_socialism'}});
  PolishParty.writeMirrors(Q);
  advanceToDecember(engine);
  assert.ok(!Q.S.faction_cases.list.some(c => c.status === 'split' || c.status === 'accepted'));
  electSpeaker(engine);
  finishHistoricalBranch(engine);
  choose(engine, 'polish_presidential_sequence.finish');
  // The event queue routes straight to the due faction case, the card E3 (technical reference 4.5, 10.2).
  assert.equal(engine.state.sceneId, 'polish_event_faction_split');
  assert.equal(Q.polish_presidential_sequence_completed, 1);
  choose(engine, 'polish_event_faction_split.accept');
  assert.equal(Q.S.actors.pps.strategy.direction, 'class_independence');
});
