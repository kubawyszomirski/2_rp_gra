const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Engine tests of stage 2 (implementation plan; technical reference 6.3–6.4, 7.3–7.5, 19.1–19.2):
// the office elections, their safety nets, the legal calendar, the end of the chapter and the report.
const { choose, clone } = dendry;
let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

const sum = object => Object.values(object).reduce((total, value) => total + value, 0);
const HISTORICAL_LIKE = { zln: 22, pschd: 10, psl_piast: 13, psl_wyzwolenie: 11, pps: 10, npr: 5, minorities_bloc: 16, kpp: 1.5, other: 11.5 };
const STRONG_PPS = { zln: 12, pschd: 6, psl_piast: 10, psl_wyzwolenie: 10, pps: 40, npr: 4, minorities_bloc: 10, kpp: 2, other: 6 };

function update(engine) {
  engine._runActions(engine.game.scenes.polish_opening_state.onArrival);
}
function content(engine) {
  return JSON.stringify(engine.ui.paragraphs);
}
function ids(engine) {
  return (engine.getCurrentChoices() || []).map(item => item.id);
}
function club(id, seats) {
  return { id, electoral_party_id: id, seats, members_profile: 'party_default_v1', discipline: 1, issue_positions: {}, government_commitment: null };
}
function novemberElection(engine, values = HISTORICAL_LIKE) {
  const Q = engine.state.qualities;
  Q.year = 1922; Q.month = 11; Q.time = 11;
  for (const group of Q.classes) for (const party of Q.parties) Q[`${group}_${party}`] = values[party] || 0;
  // Stage 5: the cells own the preferences, so the fixture rows are turned into cells again (5.1–5.2).
  if (Q.S && Q.S.society && Q.S.society.cells && Object.values(values).some(v => v > 0)) { PolishElectorate.seedCells(Q); PolishElectorate.writeClassMirrors(Q); }
  update(engine);
  engine.goToScene('post_event');
  assert.equal(engine.state.sceneId, 'sejm_election');
  choose(engine, 'sejm_election.calculate');
  dendry.formCabinet(engine, { mode: 'opposition' });
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'main');
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
// One ordinary month: play a card from the hand; the month is settled once in post_event.
function spendMonth(engine) {
  engine.state.currentHands.main = [{ id: 'campaigning', title: 'Campaigning' }];
  engine.playCard('campaigning');
  choose(engine, 'campaigning.workers');
  choose(engine, 'root');
}
function historicalDecember(engine) {
  spendMonth(engine);
  assert.equal(engine.state.sceneId, 'polish_speaker_election.choice');
  choose(engine, 'polish_speaker_election.rataj');
  choose(engine, 'polish_speaker_election.finish');
  choose(engine, 'polish_presidential_sequence.decline_daszynski');
  choose(engine, 'polish_presidential_sequence.first_transfer');
  choose(engine, 'polish_presidential_sequence.assassination');
  answerAssassination(engine);
  choose(engine, 'polish_presidential_sequence.do_not_run_daszynski_second');
  choose(engine, 'polish_presidential_sequence.finish');
  assert.equal(engine.state.sceneId, 'main');
}
// Skip the quiet years: January 1928, with every earlier month settled.
function toJanuary1928(engine) {
  const Q = engine.state.qualities;
  Q.year = 1928; Q.month = 1; Q.time = 73;
  Q.S.turn.last_settled_time = 72;
  engine.goToScene('main');
  assert.equal(engine.state.sceneId, 'main');
}
function toChapterEnd() {
  const engine = dendry.startGame();
  novemberElection(engine);
  historicalDecember(engine);
  toJanuary1928(engine);
  spendMonth(engine);
  assert.equal(engine.state.sceneId, 'sejm_election');
  choose(engine, 'sejm_election.calculate');
  assert.equal(engine.state.sceneId, 'sejm_election.chapter_end');
  choose(engine, 'polish_chapter_report');
  assert.equal(engine.state.sceneId, 'polish_chapter_report');
  return engine;
}

test('Prezydentura bez interaktywnych tur: one final screen; a save and load repeats no nomination or effect', () => {
  for (const option of ['confirm_daszynski', 'decline_daszynski']) {
    const engine = dendry.startGame();
    novemberElection(engine);
    spendMonth(engine);
    choose(engine, 'polish_speaker_election.rataj');
    choose(engine, 'polish_speaker_election.finish');
    const assembly = clone(engine.state.qualities.polish_presidency.assembly);
    choose(engine, `polish_presidential_sequence.${option}`);
    assert.equal(engine.state.sceneId, 'polish_presidential_sequence.first_final', 'straight to the final result');
    assert.deepEqual(ids(engine), ['polish_presidential_sequence.first_transfer'], 'no intermediate ballot or transfer question');
    const restored = dendry.saveAndRestore(engine);
    const Q = restored.state.qualities;
    const record = clone(Q.polish_presidency.elections);
    restored.goToScene('polish_presidential_sequence');
    assert.equal(restored.state.sceneId, 'polish_presidential_sequence.first_final', 'the nomination is not asked again');
    assert.deepEqual(Q.polish_presidency.elections, record);
    assert.equal(Q.polish_presidency.elections.length, 1);
    assert.equal(Q.polish_presidency.pps_decisions.length, 1);
    assert.deepEqual(Q.polish_presidency.assembly, assembly, 'the clubs vote with the same seats');
    assert.equal(Q.polish_presidency.elections[0].pps_nomination, option === 'confirm_daszynski' ? 'ignacy_daszynski' : '');
  }
});

test('Zapis losowania urzędu: a tied Marshal vote keeps one roll, one winner and one effect after save and load', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  novemberElection(engine);
  // Fixture clubs: Rataj 200 against Śmiarowski 200, with 44 abstaining.
  Q.S.parliament.clubs = [club('zln', 200), club('psl_wyzwolenie', 100), club('pps', 100), club('other', 44)];
  const relation = Q.psl_wyzwolenie_relation;
  spendMonth(engine);
  const time = Q.time;
  choose(engine, 'polish_speaker_election.smiarowski');
  const run = clone(Q.S.parliament.speaker_elections[0]);
  assert.equal(run.status, 'elected');
  assert.equal(run.tie_break.method, 'lot_50_50');
  assert.deepEqual(run.tie_break.finalist_ids, ['eugeniusz_smiarowski', 'maciej_rataj']);
  assert.deepEqual(run.final_ballot.candidates.map(row => row.votes), [200, 200], 'votes unchanged by the lot');
  const roll = Q.S.rng.rolls[run.tie_break.roll_id];
  assert.equal(typeof roll, 'number');
  assert.equal(run.tie_break.winner_id, roll < 0.5 ? 'eugeniusz_smiarowski' : 'maciej_rataj');
  assert.match(content(engine), /decided by a recorded lot/);
  for (const restored of [dendry.saveAndRestore(engine)]) {
    const RQ = restored.state.qualities;
    restored.goToScene('polish_speaker_election');
    assert.equal(restored.state.sceneId, 'polish_speaker_election.result');
    assert.deepEqual(RQ.S.parliament.speaker_elections, [run]);
    assert.equal(RQ.S.rng.rolls[run.tie_break.roll_id], roll);
    assert.equal(RQ.psl_wyzwolenie_relation, relation + 4, 'the effect is applied once');
    choose(restored, 'polish_speaker_election.finish');
    const after = dendry.saveAndRestore(restored);
    after.goToScene('polish_speaker_election');
    assert.equal(after.state.qualities.S.parliament.speaker.person_id, run.winner_id);
    assert.equal(after.state.qualities.S.parliament.speaker_elections.length, 1);
    assert.equal(after.state.qualities.time, time, 'no new month');
  }
});

test('Marszałek i prezydent: Daszyński wins both offices in turn; the offices separate and no 445th MP appears', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  novemberElection(engine, STRONG_PPS);
  const ppsSeats = Q.sejm_parliament.party_seats.pps;
  spendMonth(engine);
  const credibility = Q.S.actors.pps.credibility;
  choose(engine, 'polish_speaker_election.daszynski');
  assert.equal(Q.S.parliament.speaker.person_id, 'ignacy_daszynski');
  assert.equal(Q.S.actors.pps.credibility, credibility + 5, 'the victory of the PPS nominee: reputation +5 (7.5, stage 3)');
  choose(engine, 'polish_speaker_election.finish');
  choose(engine, 'polish_presidential_sequence.confirm_daszynski');
  assert.equal(Q.polish_presidency.elections[0].winner_id, 'ignacy_daszynski');
  choose(engine, 'polish_presidential_sequence.first_transfer');
  assert.equal(Q.S.parliament.speaker, null, 'the Marshal leaves the office on becoming President');
  choose(engine, 'polish_presidential_sequence.first_done');
  // Before the ordinary turn the Sejm elects a new Marshal; Daszyński cannot stand.
  assert.equal(engine.state.sceneId, 'polish_speaker_election.choice');
  assert.match(content(engine), /has become President of the Republic/);
  assert.ok(!ids(engine).includes('polish_speaker_election.daszynski'));
  choose(engine, 'polish_speaker_election.smiarowski');
  choose(engine, 'polish_speaker_election.finish');
  assert.equal(engine.state.sceneId, 'main');
  assert.equal(Q.polish_presidency.current.holder_id, 'ignacy_daszynski');
  assert.equal(Q.S.parliament.speaker.person_id, 'eugeniusz_smiarowski');
  assert.equal(Q.S.parliament.speaker_elections.map(run => run.instance).join(','), 'speaker_1922,vacancy');
  assert.deepEqual(Q.S.parliament.replacements.map(item => [item.person_out, item.reason, item.club_id]),
    [['ignacy_daszynski', 'elected_president', 'pps']]);
  assert.equal(Q.S.parliament.clubs.find(item => item.id === 'pps').seats, ppsSeats, 'the next person on the list takes the seat');
  assert.equal(sum(Object.fromEntries(Q.S.parliament.clubs.map(item => [item.id, item.seats]))), 444);
  assert.equal(Q.sejm_parliament.total_seats, 444);
});

test('Bezpiecznik (Marshal): an unresolved vote leaves the senior member presiding and repeats next month', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  novemberElection(engine);
  const clubs = clone(Q.S.parliament.clubs);
  Q.S.parliament.clubs = [club('kpp', 222), club('other', 222)]; // everybody abstains
  spendMonth(engine);
  choose(engine, 'polish_speaker_election.smiarowski');
  const failed = Q.S.parliament.speaker_elections[0];
  assert.equal(failed.status, 'no_election');
  assert.equal(failed.acting_holder.id, 'marszalek_senior');
  assert.equal(failed.retry_at, 13);
  assert.match(content(engine), /presides until a new vote next month/);
  Q.S.parliament.clubs = clubs; // the clubs may reach agreements meanwhile
  choose(engine, 'polish_speaker_election.finish');
  assert.equal(engine.state.sceneId, 'polish_presidential_sequence.first_nomination', 'the December sequence continues');
  choose(engine, 'polish_presidential_sequence.decline_daszynski');
  choose(engine, 'polish_presidential_sequence.first_transfer');
  choose(engine, 'polish_presidential_sequence.assassination');
  answerAssassination(engine);
  choose(engine, 'polish_presidential_sequence.do_not_run_daszynski_second');
  choose(engine, 'polish_presidential_sequence.finish');
  assert.equal(engine.state.sceneId, 'main', 'an ordinary turn in December, no second vote this month');
  assert.equal(Q.time, 12);
  spendMonth(engine);
  assert.equal(Q.time, 13);
  assert.equal(engine.state.sceneId, 'polish_speaker_election.choice', 'the new vote comes by itself next month');
  choose(engine, 'polish_speaker_election.rataj');
  assert.equal(Q.S.parliament.speaker.person_id, 'maciej_rataj');
  assert.equal(Q.S.parliament.speaker_elections.length, 2);
  // The Rataj package becomes an agreement with PSL Piast about the standing orders and the committees
  // (7.5, stage 3): the PPS votes and the committee seats are fulfilled at once; one agreement per vote.
  const packages = Object.values(Q.S.agreements).filter(a => a.kind === 'procedure' && a.parties.includes('psl_piast'));
  assert.equal(packages.length, 1, 'the unresolved first vote had no Rataj package');
  assert.deepEqual(packages[0].obligations.map(o => [o.topic, o.status]),
    [['vote_for_rataj', 'fulfilled'], ['pps_committee_participation', 'fulfilled'], ['defend_standing_orders', 'standing']]);
  assert.equal(PolishGovernment.fulfilledJointObligations(Q.S, ['psl_piast']), 2);
  assert.equal(Q.S.parliament.speaker_elections.at(-1).commitment.agreement_created, true);
});

test('Bezpiecznik (President): an unresolved vote keeps the Naczelnik in office and repeats next month', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  novemberElection(engine);
  spendMonth(engine);
  choose(engine, 'polish_speaker_election.rataj');
  choose(engine, 'polish_speaker_election.finish');
  const clubs = clone(Q.S.parliament.clubs);
  const senate = clone(Q.S.senate.club_seats);
  Q.S.parliament.clubs = [club('kpp', 222), club('other', 222)];
  Q.S.senate.club_seats = { kpp: 55, other: 56 };
  choose(engine, 'polish_presidential_sequence.decline_daszynski');
  assert.equal(engine.state.sceneId, 'main', 'the player gets the ordinary turn back');
  assert.equal(Q.polish_presidency.elections.length, 0);
  assert.equal(Q.polish_presidency.failed_elections[0].status, 'no_election');
  assert.equal(Q.polish_presidency.current.holder_id, 'jozef_pilsudski', 'the acting holder of the profile');
  assert.equal(Q.polish_presidential_in_progress, false);
  Q.S.parliament.clubs = clubs;
  Q.S.senate.club_seats = senate;
  spendMonth(engine);
  assert.equal(Q.time, 13);
  assert.equal(engine.state.sceneId, 'polish_presidential_sequence.first_nomination', 'the vote repeats by itself');
  choose(engine, 'polish_presidential_sequence.decline_daszynski');
  assert.equal(Q.polish_presidency.elections[0].winner_id, 'gabriel_narutowicz');
});

test('Granica: the 1922 result continues the game; the next lawful result ends the chapter', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  novemberElection(engine);
  assert.equal(Q.S.chapter.status, 'active');
  assert.equal(Q.sejm_results[0].sequence_after_opening, 1);
  assert.equal(Q.sejm_results[0].status, 'certified');
  assert.equal(Q.sejm_results[0].ballot_date, '1922-11-05');
  historicalDecember(engine);
  toJanuary1928(engine);
  assert.equal(Q.S.chapter.status, 'active');
  assert.match(content(engine), /next election is held on 19 February 1928/);
  spendMonth(engine);
  assert.deepEqual([Q.year, Q.month, Q.time], [1928, 2, 74]);
  assert.equal(engine.state.sceneId, 'sejm_election');
  choose(engine, 'sejm_election.calculate');
  assert.equal(Q.S.chapter.status, 'ended');
  assert.equal(Q.S.chapter.reason, 'next_legal_election');
  assert.equal(Q.S.chapter.trigger_id, Q.sejm_results[1].id);
  assert.equal(Q.S.senate.records.length, 2, 'a new simplified Senate is recorded too');
  assert.equal(Q.S.senate.result_id, Q.sejm_results[1].senate_result_id);
});

test('Raport: opening the ended chapter again adds no month, cost or second report', () => {
  const engine = toChapterEnd();
  const Q = engine.state.qualities;
  const report = clone(Q.S.chapter.report);
  const months = Q.S.history.months.length;
  const actions = Q.S.history.actions.length;
  const time = Q.time;
  const resources = Q.resources;
  assert.equal(report.trigger_id, Q.S.chapter.trigger_id);
  assert.equal(report.schema_version, PolishRules.SCHEMA_VERSION);
  assert.equal(report.state.turning_point.date, '1928-02-19');
  assert.equal(report.state.constitution.outgoing_speaker.person_id, 'maciej_rataj');
  assert.equal(report.state.constitution.president.holder_id, 'stanislaw_wojciechowski');
  assert.ok(report.not_modelled.length > 0, 'areas of later stages are listed, not invented');
  assert.ok(report.state.government.cabinet && report.state.government.cabinet.portfolios.labor, 'the cabinet record (stage 3)');
  assert.ok(!report.not_modelled.some(line => /cabinet negotiations/.test(line)));
  assert.match(content(engine), /The end of the first chapter/);
  assert.match(content(engine), /1928-02-19/);
  for (const scene of ['root', 'main', 'post_event', 'polish_chapter_report', 'post_event', 'main']) {
    engine.goToScene(scene);
    assert.equal(engine.state.sceneId, 'polish_chapter_report', scene);
  }
  choose(engine, 'polish_chapter_report.again');
  const restored = dendry.saveAndRestore(engine);
  restored.goToScene('root');
  const RQ = restored.state.qualities;
  assert.equal(restored.state.sceneId, 'polish_chapter_report');
  for (const state of [Q, RQ]) {
    assert.deepEqual(state.S.chapter.report, report);
    assert.equal(state.S.history.months.length, months);
    assert.equal(state.S.history.actions.length, actions);
    assert.equal(state.time, time);
    assert.equal(state.resources, resources);
    assert.equal(state.sejm_results.length, 2);
  }
  assert.deepEqual(PolishRules.validateState(RQ.S), []);
});

test('Status and Library show the Marshal, the Senate and the legal date; the German endings cannot be reached', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  novemberElection(engine);
  engine.goToScene('status');
  assert.match(content(engine), /Senate: ","111 senators, derived once from the Sejm result/);
  assert.match(content(engine), /Next Sejm election: ","1928-02-19/);
  assert.match(content(engine), /not the historical election date/);
  engine.goToScene('backSpecialScene');
  historicalDecember(engine);
  engine.goToScene('library');
  choose(engine, 'library.presidency');
  assert.match(content(engine), /Marshal of the Sejm: ","Maciej Rataj/);
  // German endings keep the German event tag, which post_event no longer offers; no Polish scene
  // leads to them, and the Polish chapter ends only through its report (leak 7 of 20.2).
  const scenes = engine.game.scenes;
  for (const id of ['1934_end', 'game_over_1934', 'civil_war', 'hitler_takes_power', 'death_of_hindenburg_president']) {
    assert.ok(scenes[id], id);
    assert.ok(!(scenes[id].tags || []).includes('pl_event'), id);
  }
  assert.deepEqual(scenes['post_event.events_choice'].options.map(option => option.id), ['#pl_event']);
  const polish = Object.keys(scenes).filter(id => /^(polish_|sejm_election|pps_|post_event|main)/.test(id));
  for (const id of polish) {
    for (const goTo of scenes[id].goTo || []) assert.ok(!/game_over|1934_end/.test(goTo.id), id + ' → ' + goTo.id);
    for (const option of scenes[id].options || []) assert.ok(!/game_over|1934_end/.test(option.id), id + ' → ' + option.id);
  }
  assert.equal(Q.S.chapter.status, 'active');
});
