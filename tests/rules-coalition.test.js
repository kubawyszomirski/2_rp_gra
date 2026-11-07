'use strict';

// The coalition after Koalicja (the user's decisions of 7 XI 2026): the programme is the plan of the cabinet, not a promise; reforms
// that the partners reject raise the tension of their agreements (+20 two steps away, +40 three or more, nothing for a reform in
// the middle); at 60 the urgent card „Kryzys koalicyjny”; the card „Spory w koalicji” eases the coalition or ends it.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const dendry = require('./helpers/dendry');

function free(Q) {
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  Q.month_actions = 0;
}
// A cabinet formed in January 1922 through the mandatory formation after a fixture crisis; PPS takes Industry and Trade.
function formed(configuration, candidate, majority = false) {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  if (majority) ppsMajority(Q); // a coalition of the left needs more MPs than the Constituent Sejm gives it
  for (const [id, value] of Object.entries({ psl_piast: 60, npr: 60, psl_wyzwolenie: 70 })) {
    PolishGovernment.changeRelation(Q, id, value - Q.S.actors.relations[id], 'fixture');
  }
  PolishGovernment.openCrisis(Q, 'cabinet_fall', Q.S.cabinet.id);
  Q.S.cabinet.status = 'caretaker';
  engine.goToScene('post_event');
  const result = dendry.formCabinet(engine, { configuration, mode: 'member', candidate, claim: ['economic'] });
  assert.equal(result.appointed.configuration_id, configuration);
  return Q;
}
// A fixture Sejm in which PPS carries its laws.
function ppsMajority(Q) {
  Q.S.parliament.clubs.find(c => c.id === 'pps').seats += 215;
  Q.S.parliament.clubs.find(c => c.id === 'other').seats -= 215;
  return Q;
}
const agreementOf = (Q, party) => Q.S.agreements[Q.S.cabinet.agreement_ids.find(id => Q.S.agreements[id].parties.includes(party) &&
  Q.S.agreements[id].parties.includes('pps'))];

test('Reformy wbrew koalicjantom: the partners that reject a reform and by how much; the middle angers nobody; only while PPS sits in the cabinet', () => {
  const Q = formed('centre_left', 'thugutt');
  const objections = key => PolishGovernment.reformObjections(Q, key).map(o => [o.party, o.delta]);
  // Centre-left: PSL Wyzwolenie, PSL Piast and NPR. The secular school (church +1): Piast −2 is three steps away.
  assert.deepEqual(objections('education_program.secular'), [['psl_piast', 40]]);
  // The progressive tax (fiscal +2): Piast and NPR (0) are two steps away; Wyzwolenie (+2) agrees.
  assert.deepEqual(objections('finance_package.progressive'), [['npr', 20], ['psl_piast', 20]]);
  // A cut of the benefits (−2): Wyzwolenie (+2) is four steps away, at most +40.
  assert.deepEqual(objections('social_welfare.limit'), [['psl_wyzwolenie', 40], ['npr', 20], ['psl_piast', 20]]);
  assert.deepEqual(objections('finance_package.loan'), [], 'an option without a stance');
  assert.deepEqual(objections('land_program.compensated'), [], 'the middle of a scale');
  PolishRules.setLanguage('pl');
  try {
    assert.equal(PolishGovernment.reformObjectionText(Q, 'education_program.secular'),
      'W tym rządzie sprzeciwi się temu PSL „Piast”, więc napięcie w koalicji wzrośnie (+40).');
    assert.equal(PolishGovernment.reformObjectionText(Q, 'finance_package.progressive'),
      'W tym rządzie sprzeciwią się temu Narodowa Partia Robotnicza (+20) i PSL „Piast” (+20); napięcie w koalicji wzrośnie.');
  } finally {
    PolishRules.setLanguage('en');
  }
  Q.S.cabinet.partner_ids = Q.S.cabinet.partner_ids.filter(id => id !== 'pps');
  assert.deepEqual(objections('education_program.secular'), [], 'PPS outside the cabinet launches no reform');
});

test('Szkoła świecka w centrolewie: Piast +40 at once; at 60 the crisis card; stopping the school −40, the Left of PPS +10; the card notes it', () => {
  const Q = ppsMajority(formed('centre_left', 'thugutt'));
  Q.S.cabinet.portfolios.education = 'pps';
  PolishProjects.cardView(Q, 'education_program');
  assert.match(Q.pl_education_program_secular_coalition, /PSL Piast will object, so the tension in the coalition will rise \(\+40\)/);
  assert.equal(Q.pl_education_program_rural_access_coalition, '', 'village schools anger nobody');
  PolishProjects.chooseOption(Q, 'education_program', 'secular');
  const piast = agreementOf(Q, 'psl_piast');
  const school = Object.values(Q.S.projects).find(p => p.variant === 'secular');
  assert.equal(school.status, 'executing');
  assert.equal(piast.tension, 40);
  assert.deepEqual(piast.history.filter(h => h.kind === 'reform_objection').map(h => [h.by, h.delta, h.target.kind]), [['psl_piast', 40, 'project']]);
  piast.tension = 60;
  free(Q);
  PolishGovernment.settleAgreements(Q);
  const c = PolishGovernment.crisisCase(Q);
  assert.deepEqual([c.partner, c.kind], ['psl_piast', 'tension']);
  assert.equal(PolishGovernment.responseCase(Q), null, 'no answer card of 9.8 for a member');
  assert.match(PolishGovernment.crisisView(Q).text, /PSL Piast threatens to leave the cabinet because it rejects the secular school\./);
  assert.equal(PolishGovernment.crisisStatus(Q, 'stop').available, true);
  const left = Q.S.actors.pps.factions.lewica.dissent;
  const out = PolishGovernment.crisisChoose(Q, 'stop');
  assert.equal(school.status, 'stopped');
  assert.equal(PolishEconomy.projectCharge(school, Q.time), 0, 'a stopped reform costs nothing');
  assert.equal(piast.tension, 20);
  assert.equal(piast.ultimatum.status, 'lifted');
  assert.equal(Q.S.actors.pps.factions.lewica.dissent, left + 10, 'giving way to a party on the right displeases the Left');
  assert.equal(PolishGovernment.crisisCase(Q), null);
  assert.match(PolishGovernment.crisisResult(Q, out), /^The secular school stops\./);
});

test('Kryzys: the talks −20 once for 2 R; letting the partner go takes it out; breaking the coalition pleases the faction of the coalition', () => {
  const Q = formed('centre_left', 'thugutt');
  Q.S.party_orgs.cash = 5;
  const npr = agreementOf(Q, 'npr');
  npr.history.push({ t: Q.time, kind: 'reform_objection', by: 'npr', key: 'finance_package.progressive', delta: 20, target: null });
  npr.tension = 70;
  PolishGovernment.settleAgreements(Q);
  assert.equal(PolishGovernment.crisisCase(Q).partner, 'npr');
  assert.equal(PolishGovernment.crisisStatus(Q, 'stop').available, false, 'nothing to stop');
  PolishGovernment.crisisChoose(Q, 'persuade');
  assert.deepEqual([npr.tension, Q.S.party_orgs.cash, npr.ultimatum.status], [50, 3, 'lifted']);
  npr.tension = 80;
  PolishGovernment.settleAgreements(Q);
  assert.equal(PolishGovernment.crisisCase(Q).ultimatum.persuaded, false, 'a new crisis allows new talks');
  const out = PolishGovernment.crisisChoose(Q, 'let_go');
  assert.ok(!Q.S.cabinet.partner_ids.includes('npr'), 'NPR leaves the cabinet');
  assert.equal(npr.status, 'withdrawn');
  assert.match(PolishGovernment.crisisResult(Q, out), /The National Workers’ Party leaves the cabinet\./);
  // A coalition of the left: giving way displeases, and breaking the coalition pleases, the Centre of PPS.
  const L = formed('left_minority', undefined, true);
  assert.equal(PolishGovernment.concessionFaction(L.S), 'centrum');
  const wyzwolenie = agreementOf(L, 'psl_wyzwolenie');
  wyzwolenie.history.push({ t: L.time, kind: 'reform_objection', by: 'psl_wyzwolenie', key: 'finance_package.indirect', delta: 40, target: null });
  wyzwolenie.tension = 60;
  PolishGovernment.settleAgreements(L);
  const centre = L.S.actors.pps.factions.centrum.dissent;
  PolishGovernment.crisisChoose(L, 'break');
  assert.ok(!L.S.cabinet.partner_ids.includes('pps'), 'PPS leaves the cabinet');
  assert.equal(L.S.actors.pps.factions.centrum.dissent, Math.max(0, centre - 10));
});

test('Spory w koalicji: the talks lower every tension by 10 for 2 R and the month; the concession in a coalition of the left displeases the Centre', () => {
  const Q = formed('left_minority', undefined, true);
  Q.S.party_orgs.cash = 4;
  const wyzwolenie = agreementOf(Q, 'psl_wyzwolenie');
  wyzwolenie.tension = 25;
  Q.S.cabinet.formed_at = Q.time - 6;
  assert.equal(PolishGovernment.coalitionCardAvailable(Q), true);
  PolishGovernment.coalitionTalks(Q);
  assert.deepEqual([wyzwolenie.tension, Q.S.party_orgs.cash, Q.month_actions], [15, 2, 1]);
  free(Q);
  delete Q.S.cooldowns['support.' + Q.S.cabinet.id];
  const centre = Q.S.actors.pps.factions.centrum.dissent;
  PolishGovernment.coalitionConcession(Q);
  assert.equal(wyzwolenie.tension, 0);
  assert.equal(Q.S.actors.pps.factions.centrum.dissent, centre + 5, 'the Centre of PPS dislikes giving way to the left');
});

// Z — 1.05 (the user's decisions of 7 XI 2026): the concordat — a stance in the Sejm outside the cabinet, a decision of the cabinet
// inside it, without a vote; it costs no action.
test('Konkordat 1.05: outside the cabinet a stance in the Sejm; in the cabinet accept or reject, with the tension of the Catholic partners or the loss in the countryside', () => {
  const T = PolishRules.timeOf;
  const opposition = dendry.startGame().state.qualities;
  opposition.time = T(1925, 2); opposition.year = 1925; opposition.month = 2;
  assert.equal(PolishPolitics.concordatParliamentActive(opposition), true);
  const lewica = opposition.S.actors.pps.factions.lewica;
  lewica.dissent = 20;
  const rural = () => PolishElectorate.aggregate(opposition.S, c => c.class_id === 'rural', 'pps');
  const before = rural();
  assert.match(PolishPolitics.concordatChoose(opposition, 'against'), /ratifies the concordat/);
  assert.equal(lewica.dissent, 17);
  assert.ok(rural() < before, 'Catholic voters in the countryside turn away');
  assert.deepEqual([opposition.S.politics.concordat.status, opposition.month_actions || 0], ['ratified', 0]);
  assert.equal(PolishPolitics.concordatParliamentActive(opposition), false, 'answered once');

  const Q = formed('centre_left', 'thugutt');
  Q.time = T(1925, 2); Q.year = 1925; Q.month = 2;
  assert.deepEqual([PolishPolitics.concordatGovernmentActive(Q), PolishPolitics.concordatParliamentActive(Q)], [true, false]);
  assert.throws(() => PolishPolitics.concordatChoose(Q, 'against'), /not open/);
  Q.S.actors.pps.factions.lewica.dissent = 20;
  const tension = agreementOf(Q, 'psl_piast').tension;
  assert.match(PolishPolitics.concordatChoose(Q, 'reject'), /Catholic partners in the cabinet are outraged/);
  assert.equal(agreementOf(Q, 'psl_piast').tension, Math.min(100, tension + 20));
  assert.equal(Q.S.actors.pps.factions.lewica.dissent, 17);
  assert.equal(Q.S.politics.concordat.status, 'rejected');

  const left = formed('centre_left', 'thugutt');
  left.time = T(1925, 3); left.year = 1925; left.month = 3;
  left.S.cabinet.partner_ids = left.S.cabinet.partner_ids.filter(id => !['zln', 'pschd', 'psl_piast'].includes(id));
  assert.match(PolishPolitics.concordatChoose(left, 'reject'), /Catholic voters in the countryside/);
});
