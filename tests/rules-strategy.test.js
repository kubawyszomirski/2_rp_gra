const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Rules of the declared line of PPS, its economic programme and the cooperation with the KPP and the Bund
// (implementation plan, stage 5; technical reference 9.5–9.6, 10.5–10.8, 10.10; card catalogue 4.1–4.8,
// 6.2, 6.7).
let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

function game() {
  return dendry.startGame().state.qualities;
}
function free(Q) {
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  Q.month_actions = 0;
}
const dissent = (Q, id) => Q.S.actors.pps.factions[id].dissent;

// Z — 0.51 (it replaces Z — 0.32): the present line can be confirmed; it costs the month and the usual wait, nothing else.
test('Obecna linia (rules): confirming the present line costs one month and the usual wait and changes nothing else; a new line costs one month and waits six months', () => {
  const Q = game();
  for (const card of PolishParty.STANCE_ORDER) {
    const field = PolishParty.STANCES[card].field;
    const present = Q.S.actors.pps.strategy[field];
    if (PolishParty.STANCES[card].values[present]) assert.equal(PolishParty.stanceStatus(Q, card, present).available, true, card);
  }
  const snapshot = () => JSON.stringify([Q.S.actors.pps.strategy, Q.S.actors.pps.strategy_history, Q.S.actors.pps.factions, Q.S.actors.relations]);
  const before = snapshot();
  PolishParty.stanceChoose(Q, 'pils_influence', 'conditional');
  assert.equal(Q.month_actions, 1, 'confirming costs the month');
  assert.equal(Q.S.cooldowns['party.pils_influence'], Q.time + 6, 'and the usual wait of the card');
  assert.equal(snapshot(), before, 'the line, its history, the factions and the relations do not change');
  assert.match(Q.pl_party_result, /confirms its present line/);
  free(Q);
  PolishParty.stanceChoose(Q, 'direction', 'class_independence');
  assert.equal(Q.month_actions, 1);
  assert.equal(Q.S.cooldowns['party.direction'], Q.time + 6);
  assert.equal(PolishParty.stanceAvailable(Q, 'direction'), false);
  assert.deepEqual(Q.S.actors.pps.strategy_history.at(-1), {t: Q.time, field: 'direction', from: 'parliamentary_socialism', to: 'class_independence'});
});

test('Profil frakcji v1: conditional → support gives Centrum +3 and Piłsudski +4; in another run → oppose gives Piłsudczycy +3 and −4; Lewica stays', () => {
  const Q = game();
  const lewica = dissent(Q, 'lewica');
  PolishParty.stanceChoose(Q, 'pils_influence', 'support');
  assert.deepEqual([dissent(Q, 'centrum'), Q.S.actors.relations.pilsudski], [3, 64]);
  assert.equal(dissent(Q, 'lewica'), lewica);
  const reaction = Q.S.actors.pps.factions.centrum.reactions.at(-1);
  assert.deepEqual(reaction.reverse, {kind: 'strategy', field: 'pils_influence', value: 'conditional', objection: 'support'}, 'the cause can be taken back (E3)');
  const R = game();
  PolishParty.stanceChoose(R, 'pils_influence', 'oppose_military_interference');
  assert.deepEqual([dissent(R, 'pilsudczycy'), R.S.actors.relations.pilsudski], [5 + 3, 56]);
  assert.equal(dissent(R, 'lewica'), lewica);
  assert.equal(dissent(R, 'centrum'), 0);
});

test('Sowiecki model B13: an ordinary card of the party; all three stances at first, then the present one only confirmed; 1 T and 12 months; no repeated bonus', () => {
  const Q = game();
  assert.equal(Q.S.actors.pps.strategy.ussr_stance, 'uncommitted');
  for (const value of ['sympathetic', 'independent', 'critical']) assert.equal(PolishParty.stanceStatus(Q, 'ussr_position', value).available, true, value);
  PolishParty.stanceChoose(Q, 'ussr_position', 'sympathetic');
  assert.equal(Q.S.cooldowns['party.ussr_position'], Q.time + 12);
  free(Q);
  delete Q.S.cooldowns['party.ussr_position'];
  const relation = Q.S.actors.relations.kpp, centrum = dissent(Q, 'centrum');
  PolishParty.stanceChoose(Q, 'ussr_position', 'sympathetic');
  assert.deepEqual([Q.S.actors.relations.kpp, dissent(Q, 'centrum')], [relation, centrum], 'confirming gives no bonus and no reaction');
  assert.equal(Q.S.cooldowns['party.ussr_position'], Q.time + 12, 'confirming waits 12 months too');
  free(Q);
  delete Q.S.cooldowns['party.ussr_position'];
  PolishParty.stanceChoose(Q, 'ussr_position', 'independent');
  free(Q);
  delete Q.S.cooldowns['party.ussr_position'];
  const kpp = Q.S.actors.relations.kpp;
  PolishParty.stanceChoose(Q, 'ussr_position', 'sympathetic');
  assert.equal(Q.S.actors.relations.kpp, kpp, 'the +5 is once in the chapter');
});

test('ZSRR: solidarity without joint trials moves the KPP relation and Centrum dissent only; no coalition, no money, no new system', () => {
  const Q = game();
  const cabinet = JSON.stringify(Q.S.cabinet), cash = Q.S.party_orgs.cash;
  PolishParty.stanceChoose(Q, 'ussr_position', 'sympathetic');
  assert.deepEqual([Q.S.actors.relations.kpp, dissent(Q, 'centrum')], [15, 5]);
  assert.equal(JSON.stringify(Q.S.cabinet), cabinet);
  assert.equal(Q.S.party_orgs.cash, cash);
  assert.equal(Q.S.actors.pps.strategy.form_of_power, 'parliamentarism');
  assert.deepEqual(Q.S.actors.communist_cooperation.trial_records, []);
});

test('Potępienie modelu sowieckiego: from solidarity to condemnation: the KPP relation −5 and no faction reaction', () => {
  const Q = game();
  PolishParty.stanceChoose(Q, 'ussr_position', 'sympathetic');
  free(Q);
  delete Q.S.cooldowns['party.ussr_position'];
  const factions = JSON.stringify(Q.S.actors.pps.factions);
  const kpp = Q.S.actors.relations.kpp;
  PolishParty.stanceChoose(Q, 'ussr_position', 'critical');
  assert.equal(Q.S.actors.relations.kpp, kpp - 5);
  assert.equal(JSON.stringify(Q.S.actors.pps.factions), factions);
});

test('Wrogość a kanał: condemning the Soviet model before a contact leaves the KPP at 5, below 10: no contact', () => {
  const Q = game();
  PolishParty.stanceChoose(Q, 'ussr_position', 'critical');
  assert.equal(Q.S.actors.relations.kpp, 5);
  assert.match(PolishGovernment.kppContactStatus(Q).reason, /below 10/);
});

test('Droga do KPP: from 10, a contact and talks every three months: 20 in month 4 after 3 actions, 30 in month 10 after 5, 50 after 25 months', () => {
  const Q = game();
  const start = Q.time;
  const at = month => { Q.time = start + month; Q.year = PolishRules.yearOf(Q.time); Q.month = PolishRules.monthOf(Q.time); free(Q); };
  PolishGovernment.kppContact(Q);
  assert.equal(Q.S.actors.relations.kpp, 14);
  const record = {};
  let actions = 1;
  for (const month of [1, 4, 7, 10, 13, 16, 19, 22, 25]) {
    at(month);
    PolishGovernment.outreach(Q, 'kpp');
    actions += 1;
    record[month] = [Q.S.actors.relations.kpp, actions];
  }
  assert.deepEqual(record[4], [22, 3]);
  assert.deepEqual(record[10], [30, 5]);
  assert.deepEqual(record[25], [50, 10]);
});

test('Kontakt i agenda KPP: talks from the month after the contact; the agenda offers the trial from relation 30 with an existing demand', () => {
  const Q = game();
  PolishGovernment.kppContact(Q);
  assert.equal(PolishGovernment.outreachStatus(Q, 'kpp').available, false, 'not in the month of the contact');
  free(Q);
  Q.time += 1;
  assert.equal(PolishGovernment.outreachStatus(Q, 'kpp').available, true);
  assert.equal(PolishParty.kppAgendaAvailable(Q), true);
  assert.match(PolishParty.kppStepStatus(Q, 'trial').reason, /relation of 30/);
  PolishGovernment.changeRelation(Q, 'kpp', 30 - Q.S.actors.relations.kpp, 'fixture');
  assert.match(PolishParty.kppStepStatus(Q, 'trial').reason, /existing joint demand/);
  Q.S.actors.communist_cooperation.demands = [{id: 'strike-fixture', kind: 'strike', level: 'broad', status: 'open', name: 'a fixture strike'}];
  assert.equal(PolishParty.kppStepStatus(Q, 'trial').available, true);
  PolishParty.kppStep(Q, 'trial');
  assert.equal(Q.S.actors.communist_cooperation.trial_records.length, 1);
});

test('Dyscyplina KPP and Granice dyscypliny: relation 30 and a broad goal give 65% / 40% / 65%; the bounds are 10% and 90%', () => {
  const compliance = level => PolishParty.partnerCompliance(30, PolishParty.goalFit(level, 'broad'));
  close(compliance('broad'), 0.65);
  close(compliance('limited'), 0.40);
  close(compliance('structural'), 0.65);
  close(PolishParty.partnerCompliance(0, 0), 0.10);
  close(PolishParty.partnerCompliance(100, 100), 0.90);
  const Q = game();
  const r = PolishRules.roll(Q.S, 'kpp_discipline:strike-fixture');
  assert.equal(PolishRules.roll(Q.S, 'kpp_discipline:strike-fixture'), r, 'one recorded roll');
});

test('Akceptacja a KPP: after the compromise inside PPS (50 → 65) the KPP chance is the same; the Centre objection +5/+2 disappears', () => {
  const Q = game();
  const chance = PolishParty.partnerCompliance(30, PolishParty.goalFit('broad', 'broad'));
  assert.deepEqual([PolishParty.centrumObjection(Q.S, 'full'), PolishParty.centrumObjection(Q.S, 'limited')], [5, 2]);
  for (const id of PolishParty.FACTIONS) Q.S.actors.communist_cooperation.pps_internal_acceptance[id] = 65;
  close(PolishParty.internalAcceptance(Q.S), 65);
  assert.deepEqual([PolishParty.centrumObjection(Q.S, 'full'), PolishParty.centrumObjection(Q.S, 'limited')], [0, 0]);
  close(PolishParty.partnerCompliance(30, PolishParty.goalFit('broad', 'broad')), chance);
});

test('Rozmowa a akcja: talks with the KPP make no trial; a demonstration and its protection are one action and at most one success', () => {
  const Q = game();
  PolishGovernment.kppContact(Q);
  assert.deepEqual(PolishParty.successfulTrials(Q.S), []);
  assert.equal(PolishParty.recordTrial(Q.S, {action_id: 'demo-1', kind: 'demonstration', mode: 'limited', result: 'success', ended_as_agreed: true}), true);
  assert.equal(PolishParty.recordTrial(Q.S, {action_id: 'demo-1', kind: 'protective_action', mode: 'limited', result: 'success', ended_as_agreed: true}), false);
  assert.equal(PolishParty.successfulTrials(Q.S).length, 1);
});

test('Bund: not a party, a relation, a list or a club; its trust starts at 50 and changes only after an executed joint action', () => {
  const Q = game();
  assert.ok(!Q.parties.includes('bund'));
  assert.ok(!Object.keys(Q.S.actors.relations).includes('bund'));
  assert.ok(!Q.S.parliament.clubs.some(club => club.id === 'bund'));
  assert.equal(Q.S.actors.bund.trust, 50);
  PolishGovernment.outreach(Q, 'jewish_rep');
  assert.equal(Q.S.actors.bund.trust, 50, 'talks with the Jewish representation do not move the Bund');
  assert.equal(PolishParty.bundJointAction(Q, {id: 'joint-1', result: 'success'}), 55);
  assert.equal(PolishParty.bundJointAction(Q, {id: 'joint-1', result: 'success'}), 55, 'once per action');
});

test('Oś autonomii: an offer with cultural rights (0) and one with the autonomy of the voivodeships (+1), for ZLN and the other minorities', () => {
  const culture = {programme: {autonomy: 0}};
  const autonomy = {programme: {autonomy: 1}};
  close(PolishGovernment.programFit('zln', culture.programme), 100 * (1 - 2 / 4));
  close(PolishGovernment.programFit('other_minorities_rep', culture.programme), 100 * (1 - 1 / 4));
  assert.deepEqual(PolishGovernment.redLineViolations('zln', culture), []);
  assert.deepEqual(PolishGovernment.redLineViolations('zln', autonomy), ['territorial_autonomy']);
  close(PolishGovernment.programFit('other_minorities_rep', autonomy.programme), 100);
  // Stage 8 (8f, actor_profiles_v2): the dated positions on autonomy — PPS and Wyzwolenie +1, Piast and PSChD −1, NPR 0.
  assert.equal(PolishGovernment.ACTOR_PROFILE_ID, 'actor_profiles_v2');
  for (const [party, fit] of [['pps', 100], ['psl_wyzwolenie', 100], ['psl_piast', 50], ['pschd', 50], ['npr', 75]]) {
    assert.ok(Math.abs(PolishGovernment.programFit(party, autonomy.programme) - fit) < 1e-9, party);
  }
  // The opening line of PPS is the territorial autonomy of its bill of October 1921; choosing it again only confirms it (Z — 0.51).
  const Q = game();
  assert.equal(Q.S.actors.pps.strategy.slavic_autonomy, 'regional_autonomy');
  assert.equal(PolishParty.stanceStatus(Q, 'slavic_autonomy', 'regional_autonomy').available, true);
  PolishParty.stanceChoose(Q, 'slavic_autonomy', 'cultural_rights');
  assert.equal(Q.S.actors.pps.program.slavic_autonomy, 0);
});

test('Arbitraż i linia: blocked with its reason under parliamentarism, prepared under a stronger presidency; a later change keeps the project', () => {
  const Q = game();
  assert.match(PolishProjects.constitutionStatus(Q, 'presidential_arbitration').reason, /stronger presidency/);
  PolishParty.stanceChoose(Q, 'form_of_power', 'strong_presidency');
  free(Q);
  assert.equal(PolishProjects.constitutionStatus(Q, 'presidential_arbitration').available, true);
  PolishProjects.constitutionChoose(Q, 'presidential_arbitration', 'parliament');
  free(Q);
  delete Q.S.cooldowns['party.form_of_power'];
  PolishParty.stanceChoose(Q, 'form_of_power', 'parliamentarism');
  free(Q);
  assert.doesNotMatch(PolishProjects.constitutionStatus(Q, 'presidential_arbitration').reason, /stronger presidency/);
});

test('Trzy ustroje: a stronger presidency or workers’ councils set no reform in force; the head of state and the cabinet stay', () => {
  for (const value of ['strong_presidency', 'workers_councils']) {
    const Q = game();
    const head = JSON.stringify(Q.polish_presidency.current), cabinet = Q.S.cabinet.id;
    PolishParty.stanceChoose(Q, 'form_of_power', value);
    assert.deepEqual(Q.polish_presidency.constitution.reforms, {democratic_guarantees: false, constructive_vonc: false, presidential_arbitration: false});
    assert.equal(JSON.stringify(Q.polish_presidency.current), head);
    assert.equal(Q.S.cabinet.id, cabinet);
    if (value === 'workers_councils') {
      assert.equal(dissent(Q, 'centrum'), 3);
      close(Q.S.actors.pps.factions.lewica.strength, 100 * 19 / 104);
    }
  }
});

test('Cztery stanowiska autonomii: federation and broad Jewish cooperation are two cards; still two minority categories; no rights enacted and no new population', () => {
  const Q = game();
  PolishParty.stanceChoose(Q, 'slavic_autonomy', 'federation');
  free(Q);
  PolishParty.stanceChoose(Q, 'jewish_cooperation', 'broad');
  assert.deepEqual(Q.S.actors.pps.program, {form_of_power: 2, slavic_autonomy: 2, jewish_cooperation: 2});
  assert.deepEqual([...new Set(Q.S.society.cells.map(c => c.identity_id))].sort(), ['jewish', 'other_minorities', 'polish']);
  assert.equal(Q.S.society.cells.length, 54);
  assert.deepEqual(Q.S.parliament.laws, []);
  assert.deepEqual(Object.keys(Q.S.projects), []);
});

test('Cele ustrojowe: councils and federation are written into the report as a programme, without an implementation, spending or finished reform', () => {
  const Q = game();
  PolishParty.stanceChoose(Q, 'form_of_power', 'workers_councils');
  free(Q);
  PolishParty.stanceChoose(Q, 'slavic_autonomy', 'federation');
  const latest = {id: 'fixture_1928', ballot_date: '1928-02-19', sequence_after_opening: 1, legal_basis: {}, party_seats: {pps: 40}, party_votes: {pps: 12}};
  Q.sejm_results = [latest];
  const report = PolishInstitutions.buildReport(Q, latest);
  assert.equal(report.state.pps.strategy.form_of_power, 'workers_councils');
  assert.equal(report.state.pps.strategy.slavic_autonomy, 'federation');
  assert.deepEqual(report.state.reforms, {democratic_guarantees: false, constructive_vonc: false, presidential_arbitration: false});
  assert.ok(!report.not_modelled.some(line => /stage 5/.test(line)), 'the party of stage 5 is modelled');
});

test('Demokracja zależna od sytuacji: the democratic movement gives ×1.00 without a threat and ×1.15 under one; no lasting bonus to democracy', () => {
  const Q = game();
  const democracy = Q.S.politics.democracy;
  PolishParty.stanceChoose(Q, 'direction', 'democratic_movement');
  assert.equal(PolishParty.strategyFactor(Q, 'democracy'), 1);
  Q.S.coup.pressure = 45;
  assert.equal(PolishParty.strategyFactor(Q, 'democracy'), 1.15);
  assert.equal(PolishParty.strategyFactor(Q, 'class'), 1);
  // Stage 7: an open case of unlawful violence against institutions is a threat as well (10.6).
  Q.S.coup.pressure = 10;
  PolishPolitics.openCase(Q, { id: 'fixture_emergency', kind: 'unconstitutional_violence', institutional: true });
  assert.equal(PolishParty.strategyFactor(Q, 'democracy'), 1.15);
  assert.equal(Q.S.politics.democracy, democracy, 'the line gives no lasting bonus to democracy');
});

test('Adresat polemiki: capital and land address PSChD and ZLN; violence against the constitution without a case blocks the polemic', () => {
  const Q = game();
  PolishParty.stanceChoose(Q, 'main_opponent', 'capital_land');
  assert.deepEqual(PolishParty.polemicAddressees(Q), ['pschd', 'zln']);
  free(Q);
  delete Q.S.cooldowns['party.main_opponent'];
  PolishParty.stanceChoose(Q, 'main_opponent', 'unconstitutional_force');
  free(Q);
  assert.match(PolishParty.campaignStatus(Q, 'polemic').reason, /No addressee/);
});

test('Program gospodarczy and Program bez zmiany: three priorities in one month; a fourth is refused; the same set is only confirmed; no reform by itself', () => {
  const Q = game();
  assert.match(PolishParty.programmeStatus(Q, []).reason, /Choose at least one priority/, 'without a programme an empty set is nothing to confirm (Z — 0.56)');
  assert.equal(PolishParty.programmeStatus(Q, ['cooperatives_housing']).available, true, 'the sixth priority (Z — 0.56)');
  const three = ['public_works', 'stabilisation_with_protection', 'wealth_and_investment'];
  assert.match(PolishParty.programmeStatus(Q, three.concat(['socialisation'])).reason, /At most three/);
  PolishParty.programmeChoose(Q, three);
  assert.equal(Q.month_actions, 1);
  assert.deepEqual(Q.S.actors.pps.strategy.economic_priorities, three.slice().sort());
  assert.deepEqual(Object.keys(Q.S.projects), [], 'no programme is prepared by the declaration');
  free(Q);
  delete Q.S.cooldowns['party.economic_program'];
  const history = Q.S.actors.pps.strategy_history.length;
  PolishParty.programmeChoose(Q, three);
  assert.equal(Q.month_actions, 1, 'confirming the same set costs the month');
  assert.equal(Q.S.cooldowns['party.economic_program'], Q.time + 6, 'and the usual wait');
  assert.deepEqual([Q.S.actors.pps.strategy.economic_priorities, Q.S.actors.pps.strategy_history.length], [three.slice().sort(), history], 'nothing else changes');
  assert.match(Q.pl_party_result, /confirms its present economic programme/);
});
