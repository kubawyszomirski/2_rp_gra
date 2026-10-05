const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Engine tests of politics, democracy and the events of stage 7 (implementation plan, stage 7; technical reference
// 10.7, 15.1–15.3, 17.6–17.7; card catalogue 9.1–9.6): the events are played through the real Dendry engine and the
// month is settled once through post_event.
const { choose } = dendry;
let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

function ids(engine) {
  return (engine.getCurrentChoices() || []).map(item => item.id);
}
// One month spent on organisational work in the party agenda (0 R); the engine stops at the first event or at main.
function spendMonth(engine) {
  engine.goToScene('main');
  dendry.playCard(engine, 'polish_party_agenda');
  choose(engine, 'polish_party_agenda.organize');
  choose(engine, 'polish_party_agenda.branch_farm_labour');
  choose(engine, 'root');
}

// June 1922 with the dated inputs of the scenario: the cabinet crisis (B1, category 2) and its formation first.
function toJune1922(engine) {
  for (let m = 1; m <= 5; m++) {
    spendMonth(engine);
    if (m < 5) assert.equal(engine.state.sceneId, 'main', `month ${m}`);
  }
  assert.deepEqual([engine.state.qualities.year, engine.state.qualities.month], [1922, 6]);
  assert.equal(engine.state.sceneId, 'polish_event_cabinet_1922');
}
function formationAfterB1(engine, answer) {
  choose(engine, `polish_event_cabinet_1922.${answer}`);
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation');
  choose(engine, 'polish_cabinet_formation.submit');
  const result = engine.state.qualities.S.history.negotiations.at(-1).result;
  choose(engine, 'polish_cabinet_formation.done');
  return result;
}

// Z — 0.56 (item 5 of 5 X 2026): B2 is a card of the Parliament deck for three months; it shows an authentic quotation of
// Piłsudski without its date, the answer costs the month, and returning the card is free.
const offered = engine => (engine._compileChoices(engine.game.scenes['main.parliament']) || []).filter(c => c.canChoose !== false).map(c => c.id);
test('Karta B2: the speech of June 1922 opens a Parliament card with an authentic quotation; the answer costs the month', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  toJune1922(engine);
  formationAfterB1(engine, 'opposition');
  assert.equal(engine.state.sceneId, 'main', 'no queued event any more');
  assert.equal(Q.S.politics.speeches[0].response, null);
  assert.ok(offered(engine).includes('polish_event_pils_criticism'), 'the card is in the Parliament deck');
  engine.state.currentHands.main = [{ id: 'polish_event_pils_criticism', title: 'B2' }];
  engine.playCard('polish_event_pils_criticism');
  assert.deepEqual(ids(engine).map(id => id.split('.').pop()), ['support', 'defend', 'reform', 'easy_discard']);
  const page = JSON.stringify(engine.ui.paragraphs);
  assert.ok(page.includes(PolishPolitics.QUOTES[0][0]), 'the first and mildest quotation');
  assert.doesNotMatch(page, /not a historical quotation|19[23]\d/, 'no synthetic disclaimer and no date');
  choose(engine, 'easy_discard');
  assert.deepEqual([Q.time, Q.month_actions || 0], [6, 0], 'returning the card costs nothing');
  engine.playCard('polish_event_pils_criticism');
  choose(engine, 'polish_event_pils_criticism.defend');
  assert.equal(Q.month_actions, 1, 'the answer is the action of the month');
  choose(engine, 'root');
  assert.equal(Q.time, 7);
  assert.equal(Q.S.politics.speeches[0].response, 'defend');
  assert.equal(Q.S.politics.institutional_log.filter(e => e.kind === 'stance_defense').length, 1);
  assert.ok(!offered(engine).includes('polish_event_pils_criticism'), 'answered once');
});

// Z — 0.56: without an answer for three months the speech is silence, recorded in the journal with no weight; an open
// cabinet crisis half a year after the last speech brings another speech with the next quotation.
test('Milczenie i kolejne wystąpienia B2: silence after three months; a later cabinet crisis brings another, sharper quotation', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities, S = Q.S;
  PolishPolitics.scheduleSpeech(Q, 'speech_1922_dispute', Q.time);
  const authority = S.politics.parliament_authority;
  for (let m = 0; m < 3; m++) spendMonth(engine);
  assert.equal(engine.state.sceneId, 'main');
  assert.equal(S.politics.speeches[0].response, 'silence');
  assert.equal(S.politics.institutional_log.filter(e => e.kind === 'stance_silence').length, 1);
  assert.equal(PolishRules.authorityFromLog(S.politics.institutional_log, Q.time), authority, 'silence has no weight');
  assert.equal(PolishPolitics.criticismDue(Q), false);
  Q.time = PolishRules.timeOf(1923, 3);
  PolishGovernment.openCrisis(Q, 'cabinet_fall', S.cabinet.id);
  PolishPolitics.afterEvents(Q);
  const second = S.politics.speeches[1];
  assert.equal(second.id, 'speech_crisis_' + S.cabinet_crisis.id);
  assert.equal(PolishPolitics.criticismDue(Q), true);
  PolishPolitics.criticismView(Q);
  assert.equal(Q.pl_crit_quote, PolishPolitics.QUOTES[1][0], 'the next quotation');
  assert.equal(Q.pl_crit_topic, 'the rule of the parties over the governments');
  PolishPolitics.afterEvents(Q);
  assert.equal(S.politics.speeches.length, 2, 'one speech for one crisis');
});

test('B1/B2: the dispute of June 1922 brings three answers of B1 into one free formation; the reformist answer of B2 creates no project, unlocks no variant and gives no votes', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities, S = Q.S;
  toJune1922(engine);
  assert.deepEqual(ids(engine), ['polish_event_cabinet_1922.pils_candidate', 'polish_event_cabinet_1922.parliamentary_compromise',
    'polish_event_cabinet_1922.opposition'], 'three answers, no fourth answer about a concession');
  assert.ok((engine.getCurrentChoices() || []).every(c => c.canChoose !== false));
  assert.deepEqual([S.politics.cases.dispute_1922.status, S.politics.cases.dispute_1922.closed_by], ['closed', 'ponikowski_resigned']);
  assert.deepEqual([S.cabinet.id, S.cabinet.status, S.cabinet_crisis.reason], ['ponikowski_1', 'caretaker', 'cabinet_fall']);
  choose(engine, 'polish_event_cabinet_1922.pils_candidate');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation');
  const neg = S.negotiation;
  assert.deepEqual([neg.context.reason, neg.mandatory, neg.cost_t, neg.draft.configuration_id, neg.draft.candidate_id, neg.draft.pps_mode],
    ['cabinet_fall', true, 0, 'expert', 'sliwinski', 'external_support'], 'the one mandatory formation of 8.8 with the Naczelnik’s candidate');
  choose(engine, 'polish_cabinet_formation.submit');
  const result = S.history.negotiations.at(-1).result;
  assert.equal(result.pps_offer.candidate_id, 'sliwinski');
  choose(engine, 'polish_cabinet_formation.done');
  assert.equal(S.history.negotiations.length, 1, 'one formation sequence');
  assert.deepEqual([Q.time, Q.month_actions || 0], [6, 0], 'no month is spent');
  // Z — 0.56: the speech of the same dispute waits in the Parliament deck as card B2.
  assert.equal(engine.state.sceneId, 'main');
  engine.state.currentHands.main = [{ id: 'polish_event_pils_criticism', title: 'B2' }];
  engine.playCard('polish_event_pils_criticism');
  const projects = Object.keys(S.projects).length;
  const guarantees = PolishProjects.constitutionStatus(Q, 'democratic_guarantees').reason;
  const pps = S.society.cells.map(c => c.propensity.pps);
  const centrum = S.actors.pps.factions.centrum.dissent;
  choose(engine, 'polish_event_pils_criticism.reform');
  assert.equal(Object.keys(S.projects).length, projects, 'no project');
  assert.deepEqual(S.society.cells.map(c => c.propensity.pps), pps, 'no votes');
  assert.equal(S.actors.pps.factions.centrum.dissent, Math.max(0, centrum - 2), 'only the Centrum −2');
  // The answer spends the month (Z — 0.56), so the path of the reform is compared in the next month.
  choose(engine, 'root');
  assert.equal(PolishProjects.constitutionStatus(Q, 'democratic_guarantees').reason, guarantees, 'no variant or path unlocked');
  // With another cabinet in office the sequence is not replayed: one case of the dispute, no fall.
  const other = dendry.startGame().state.qualities;
  other.S.cabinet.id = 'fixture_other_cabinet';
  other.time = PolishRules.timeOf(1922, 6); other.month = 6;
  PolishPolitics.afterEvents(other);
  assert.deepEqual([other.S.politics.cases.dispute_1922.closed_by, other.S.cabinet.status, other.S.cabinet_crisis], ['no_opening_cabinet', 'active', null]);
  assert.equal(PolishPolitics.cabinet1922Due(other), false);
});

// ---- December 1922 and the presidency (17.6–17.7) ----
const HISTORICAL_LIKE = { zln: 22, pschd: 10, psl_piast: 13, psl_wyzwolenie: 11, pps: 10, npr: 5, minorities_bloc: 16, kpp: 1.5, other: 11.5 };
// The national result of the opening before the calibration of stage 8 (decision 2A): PPS is slightly larger than
// PSL Wyzwolenie, so a Daszyński nomination eliminates Narutowicz first (a fixture for the branch without him).
const PPS_AHEAD = { kpp: 6.005, pps: 13.287, npr: 6.33, psl_wyzwolenie: 12.751, psl_piast: 13.145, pschd: 6.589, zln: 11.848, minorities_bloc: 20.451, other: 9.594 };
function december({ values = HISTORICAL_LIKE } = {}) {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.S.scenario.inputs.dispute_1922 = false;
  Q.year = 1922; Q.month = 11; Q.time = 11;
  if (values) {
    for (const group of Q.classes) for (const party of Q.parties) Q[`${group}_${party}`] = values[party] || 0;
    PolishElectorate.seedCells(Q); PolishElectorate.writeClassMirrors(Q);
  }
  engine._runActions(engine.game.scenes.polish_opening_state.onArrival);
  engine.goToScene('sejm_election');
  choose(engine, 'sejm_election.calculate');
  dendry.formCabinet(engine, { mode: 'opposition' });
  choose(engine, 'root');
  spendMonth(engine);
  assert.equal(engine.state.sceneId, 'polish_speaker_election.choice');
  choose(engine, 'polish_speaker_election.rataj');
  choose(engine, 'polish_speaker_election.finish');
  assert.equal(engine.state.sceneId, 'polish_presidential_sequence.first_nomination');
  return engine;
}

test('B3/B4: the threat settles without a menu; only a confirmed death, after the vacancy is filled, opens the three answers of B4', () => {
  const engine = december();
  const Q = engine.state.qualities, S = Q.S;
  choose(engine, 'polish_presidential_sequence.decline_daszynski');
  choose(engine, 'polish_presidential_sequence.first_transfer');
  choose(engine, 'polish_presidential_sequence.assassination');
  assert.deepEqual(ids(engine), ['root'], 'no menu of B3');
  const death = S.politics.episodes.find(e => e.kind === 'security_crisis');
  assert.deepEqual([death.holder_id, death.outcome, death.protection, death.perpetrator],
    ['gabriel_narutowicz', 'death', 'not_modelled_in_chapter_1', 'Eligiusz Niewiadomski'], 'decision 2B: the historical branch');
  const c = S.politics.cases[death.case_id];
  assert.deepEqual([c.kind, c.institutional, c.label, c.suspected], ['unconstitutional_violence', true, 'far_right', null]);
  assert.equal(S.events.resolved['security_crisis:gabriel_narutowicz'].definition_id, 'presidency.security_crisis');
  assert.deepEqual([Q.polish_presidency.current.holder_id, Q.polish_presidency.current.status], ['maciej_rataj', 'acting'], 'the vacancy first');
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'polish_event_assassination_response', 'B4 from the queue, before the second election');
  assert.deepEqual(ids(engine), ['polish_event_assassination_response.defend', 'polish_event_assassination_response.restraint',
    'polish_event_assassination_response.retaliation']);
  const cash = S.party_orgs.cash;
  choose(engine, 'polish_event_assassination_response.defend');
  choose(engine, 'polish_event_assassination_response.unprotected');
  assert.ok(Math.abs(S.party_orgs.cash - (cash - 1)) < 1e-6, '1 R');
  assert.deepEqual(S.politics.democracy_effects.filter(e => e.cause === 'B4').map(e => e.value), [2], 'a peaceful gathering: +2 once');
  assert.ok(S.party_orgs.press.campaigns.some(k => k.topic === 'democracy'), 'a campaign on the defence of democracy');
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'polish_presidential_sequence.second_nomination');
  const restored = dendry.saveAndRestore(engine);
  assert.equal(PolishPolitics.responseDue(restored.state.qualities), false, 'answered once, also after loading');
  choose(restored, 'polish_presidential_sequence.do_not_run_daszynski_second');
  assert.equal(restored.state.qualities.S.politics.cases[death.case_id].closed_by, 'lawful_succession');
  // No death, no B4: with the Daszyński nomination another President is elected (PPS_AHEAD).
  const other = december({ values: PPS_AHEAD });
  choose(other, 'polish_presidential_sequence.confirm_daszynski');
  assert.notEqual(other.state.qualities.polish_presidency.elections[0].winner_id, 'gabriel_narutowicz');
  choose(other, 'polish_presidential_sequence.first_transfer');
  choose(other, 'polish_presidential_sequence.first_done');
  const OQ = other.state.qualities;
  assert.deepEqual([OQ.S.politics.episodes.filter(e => e.kind === 'security_crisis').length, PolishPolitics.responseDue(OQ)], [0, false]);
  assert.ok(!Object.values(OQ.S.politics.cases).some(k => k.kind === 'unconstitutional_violence'));
});

test('B3/B4 (retaliation): the authorised confrontation costs 0.5 R and the Centrum +8; only a confrontation that happens is a case against PPS, and a repressive cabinet bans the Milicja', () => {
  const run = (clash, repressive) => {
    const Q = dendry.startGame().state.qualities, S = Q.S;
    Q.time = 12; Q.month = 12;
    S.party_orgs.cash = 5;
    if (repressive) S.cabinet.configuration_id = 'chjeno_piast'; // fixture: the repressive profile of 14.4
    PolishPolitics.securityCrisis(Q, { holder_id: 'gabriel_narutowicz', holder_name: 'Gabriel Narutowicz', date: '1922-12-16', perpetrator: 'Eligiusz Niewiadomski' });
    Q.polish_presidency.current = { office_id: 'prezydent_rp', holder_id: 'maciej_rataj', holder_name: 'Maciej Rataj', status: 'acting', since: '1922-12-16' };
    S.rng.rolls['b4:security_crisis:gabriel_narutowicz:clash'] = clash ? 0 : 0.999; // fixture: the recorded roll of the clash
    const centrum = S.actors.pps.factions.centrum.dissent, people = S.militia.strength;
    const record = PolishPolitics.responseChoose(Q, 'retaliation');
    return { S, record, centrum, people };
  };
  const quiet = run(false, false);
  assert.equal(quiet.record.pps_authorizes_confrontation, true);
  assert.equal(quiet.S.actors.pps.factions.centrum.dissent, quiet.centrum + 8);
  assert.ok(Math.abs(quiet.S.party_orgs.cash - 4.5) < 1e-6);
  assert.deepEqual([quiet.record.clash.clash, Object.values(quiet.S.politics.cases).filter(k => k.kind === 'pps_violence').length], [false, 0],
    'the declaration creates no victims and no case');
  const clash = run(true, true);
  const own = Object.values(clash.S.politics.cases).filter(k => k.kind === 'pps_violence');
  assert.deepEqual([clash.record.clash.clash, own.length, own[0].assigned_party], [true, 1, 'pps']);
  assert.equal(clash.S.militia.strength, clash.people - Math.round(0.02 * clash.people), 'the Milicja loses 2% of its people once');
  assert.deepEqual([clash.S.militia.banned, Object.values(clash.S.politics.restrictions).map(r => [r.kind, r.lawful])], [true, [['militia_ban', true]]]);
  assert.equal(clash.S.politics.violence_episodes.filter(e => e.id === 'b4:security_crisis:gabriel_narutowicz').map(e => e.value)[0], 10, 'one serious episode');
});

test('Msza B5: three answers; without a host the mass is blocked at no cost; with one it is held once, without an automatic alliance with the Christian Democrats', () => {
  const engine = december();
  const Q = engine.state.qualities, S = Q.S;
  choose(engine, 'polish_presidential_sequence.decline_daszynski');
  choose(engine, 'polish_presidential_sequence.first_transfer');
  choose(engine, 'polish_presidential_sequence.assassination');
  choose(engine, 'root');
  choose(engine, 'polish_event_assassination_response.restraint');
  choose(engine, 'root');
  choose(engine, 'polish_presidential_sequence.do_not_run_daszynski_second');
  choose(engine, 'polish_presidential_sequence.finish');
  S.party_orgs.cash = 5;
  spendMonth(engine);
  assert.deepEqual([Q.year, Q.month], [1923, 1]);
  assert.equal(engine.state.sceneId, 'main', 'stage 8 (8f): the commemoration comes after the execution of 31 I 1923');
  spendMonth(engine);
  assert.deepEqual([Q.year, Q.month], [1923, 2]);
  assert.equal(engine.state.sceneId, 'polish_event_niewiadomski_cult');
  assert.deepEqual(ids(engine), ['polish_event_niewiadomski_cult.condemn', 'polish_event_niewiadomski_cult.democracy_mass',
    'polish_event_niewiadomski_cult.stay_out']);
  assert.equal(S.politics.episodes.find(e => e.kind === 'assassin_commemoration').place,
    'Warsaw, the Powązki cemetery: the funeral of Eligiusz Niewiadomski on 6 February 1923');
  const mass = () => (engine.getCurrentChoices() || []).find(c => c.id === 'polish_event_niewiadomski_cult.democracy_mass');
  const cash = S.party_orgs.cash;
  assert.equal(S.actors.relations.pschd, 30);
  assert.equal(mass().canChoose, false, 'no clergyman or host agrees');
  assert.match(Q.pl_b5_democracy_mass_why, /host/);
  assert.equal(S.party_orgs.cash, cash, 'the refusal costs nothing');
  S.actors.relations.pschd = 45;
  PolishGovernment.writeGovernmentMirrors(Q);
  const restored = dendry.saveAndRestore(engine);
  restored.goToScene('polish_event_niewiadomski_cult');
  const R = restored.state.qualities;
  const choiceIndex = (restored.getCurrentChoices() || []).findIndex(c => c.id === 'polish_event_niewiadomski_cult.democracy_mass');
  assert.equal(restored.getCurrentChoices()[choiceIndex].canChoose, true, 'with a host the mass can be held');
  const relation = R.S.actors.relations.pschd;
  choose(restored, 'polish_event_niewiadomski_cult.democracy_mass');
  assert.ok(Math.abs(R.S.party_orgs.cash - (cash - 1)) < 1e-6, '1 R');
  assert.deepEqual(R.S.politics.democracy_effects.filter(e => e.cause === 'B5').map(e => e.value), [2]);
  assert.equal(R.S.actors.relations.pschd, relation, 'no automatic alliance');
  assert.ok(R.S.party_orgs.press.campaigns.some(k => k.topic === 'democracy'));
  choose(restored, 'root');
  assert.equal(PolishPolitics.cultDue(R), false, 'held once');
  const again = dendry.saveAndRestore(restored);
  assert.equal(PolishPolitics.cultDue(again.state.qualities), false, 'a new entry after loading adds nothing');
  assert.deepEqual(again.state.qualities.S.politics.democracy_effects.filter(e => e.cause === 'B5').length, 1);
});
