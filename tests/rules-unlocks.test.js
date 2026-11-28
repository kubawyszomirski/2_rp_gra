'use strict';

// Z — 1.33 (the user's decisions of 25 XI 2026): each characteristic of the party opens an option of its own — cheaper strikes
// (unionism), a joint campaign on land with a peasant party (the worker-peasant alliance), the campaign „Równe prawa narodowości”
// (federalism), a Sejm committee of inquiry into the government (parliamentarism), a solidarity strike (strike action), former
// soldiers in the Milicja (militarism), a reform of ours as the price of our support and a shadow cabinet (reformism) and joint
// rallies with the KPP (radicalism). Without the characteristic none of them is open.
const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

function game() {
  return dendry.startGame().state.qualities;
}
function free(Q) {
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  Q.month_actions = 0;
}
const adopt = (Q, id) => { PolishRules.profileState(Q.S).seeds[id] = 20; PolishRules.profileState(Q.S).adopted.push({ id, t: Q.time }); };
const ruralPps = S => {
  const cells = S.society.cells.filter(c => c.class_id === 'rural');
  const mass = cells.reduce((n, c) => n + c.mass, 0);
  return cells.reduce((n, c) => n + c.mass * c.propensity.pps, 0) / mass;
};
const national = (S, party) => {
  const cells = S.society.cells, mass = cells.reduce((n, c) => n + c.mass, 0);
  return cells.reduce((n, c) => n + c.mass * c.propensity[party], 0) / mass;
};

test('Uzwiązkowienie 1.33: strikes cost the party half as much; with the cooperative a quarter', () => {
  const Q = game();
  const S = Q.S;
  const coop = PolishParty.cooperativeWorks(S);
  assert.equal(PolishParty.strikePayShare(S), coop ? 0.5 : 1);
  adopt(Q, 'unionism');
  assert.equal(PolishParty.strikePayShare(S), coop ? 0.25 : 0.5);
});

test('Kampanie 1.33: the joint campaign on land, the campaign of the nationalities and the rallies with the KPP need their characteristic', () => {
  const Q = game();
  const S = Q.S;
  for (const id of ['land_wyzwolenie', 'land_piast', 'equal_rights', 'kpp_rallies']) {
    assert.equal(PolishParty.issueUnlocked(Q, id), false, id);
    assert.equal(PolishParty.issueCampaignStatus(Q, id).available, false, id);
  }
  assert.equal(PolishParty.issueCampaignStatus(Q, 'equal_rights').reason, 'Only with the characteristic Federalism.');
  // A joint campaign with PSL „Wyzwolenie” reaches the peasants more strongly than the plain one and improves the relations by 3.
  const plain = game();
  adopt(plain, 'worker_peasant'); adopt(Q, 'worker_peasant');
  const before = [ruralPps(plain.S), ruralPps(S)];
  PolishParty.issueCampaign(plain, 'land');
  const rel = S.actors.relations.psl_wyzwolenie;
  const text = PolishParty.issueCampaign(Q, 'land_wyzwolenie');
  assert.ok(ruralPps(S) - before[1] > (ruralPps(plain.S) - before[0]) * 1.2, 'the joint campaign reaches the peasants more strongly');
  assert.equal(S.actors.relations.psl_wyzwolenie, rel + 3);
  // The relations these campaigns win stop at 75.
  S.actors.relations.psl_wyzwolenie = 74;
  free(Q);
  PolishParty.issueCampaign(Q, 'land_wyzwolenie');
  assert.equal(S.actors.relations.psl_wyzwolenie, 75);
  assert.match(JSON.stringify(Q.pl_party_result || text), /Our relations with PSL “Wyzwolenie” improve\./);
  // The campaign of the nationalities: both clubs of the minorities +2.
  const F = game();
  adopt(F, 'federalism');
  const minorities = [F.S.actors.relations.jewish_rep, F.S.actors.relations.other_minorities_rep];
  PolishParty.issueCampaign(F, 'equal_rights');
  assert.deepEqual([F.S.actors.relations.jewish_rep, F.S.actors.relations.other_minorities_rep], minorities.map(v => v + 2));
  // The rallies with the KPP: the KPP +3, the Centre of PPS +3 dissent, the right restless.
  const K = game();
  adopt(K, 'radicalism');
  const [kpp, centre] = [K.S.actors.relations.kpp, K.S.actors.pps.factions.centrum.dissent];
  PolishParty.issueCampaign(K, 'kpp_rallies');
  assert.equal(K.S.actors.relations.kpp, kpp + 3);
  assert.equal(K.S.actors.pps.factions.centrum.dissent, centre + 3);
  assert.ok(K.S.politics.right.mobilisation > 0, 'the right is stirred');
});

test('Komisja śledcza 1.33: once a year in opposition — the parties of a cabinet lose about a point and −3; the clubs of a cabinet of experts half', () => {
  const Q = game();
  const S = Q.S;
  // Ponikowski's cabinet of experts, supported by PSL Piast and NPR, with PPS in opposition (decision 1A: the clubs pay half).
  S.cabinet.supporter_ids = ['psl_piast', 'npr'];
  assert.equal(PolishGovernment.ppsStance(S), 'opposition');
  assert.equal(PolishPolitics.inquiryOpen(Q), false, 'only with parliamentarism');
  adopt(Q, 'parliamentarism');
  assert.equal(PolishPolitics.inquiryOpen(Q), true);
  let before = national(S, 'psl_piast') + national(S, 'npr');
  let rel = [S.actors.relations.psl_piast, S.actors.relations.npr];
  PolishRules.setLanguage('pl');
  try {
    PolishPolitics.inquiryView(Q);
    assert.equal(Q.pl_inq_line, 'To rząd fachowców: popierające go kluby (Narodowa Partia Robotnicza i PSL „Piast”) stracą nieco poparcia, a autorytet Sejmu wzrośnie.');
  } finally {
    PolishRules.setLanguage('en');
  }
  let text = PolishPolitics.inquiryChoose(Q);
  assert.match(text, /^The Sejm appoints a committee of inquiry into the cabinet of experts\./);
  let lost = before - (national(S, 'psl_piast') + national(S, 'npr'));
  assert.ok(Math.abs(lost - 0.5) < 0.01, 'about half a point: ' + lost);
  assert.deepEqual([S.actors.relations.psl_piast, S.actors.relations.npr], rel.map(v => v - 1.5));
  assert.ok(S.politics.institutional_log.some(e => e.kind === 'resolution' && /^resolution:inquiry:/.test(e.id)), 'a resolution of the Sejm');
  free(Q);
  assert.equal(PolishPolitics.inquiryOpen(Q), false, 'once a year');
  // A year later a party cabinet: only the parties with ministers pay, in full; a club that only supports it is spared.
  Q.time += 12;
  S.cabinet.partner_ids = ['psl_piast', 'zln'];
  S.cabinet.supporter_ids = ['npr'];
  assert.equal(PolishPolitics.inquiryOpen(Q), true);
  before = national(S, 'psl_piast') + national(S, 'zln');
  rel = [S.actors.relations.psl_piast, S.actors.relations.zln, S.actors.relations.npr];
  text = PolishPolitics.inquiryChoose(Q);
  assert.match(text, /^The Sejm appoints a committee of inquiry into the government\. PSL Piast and the National Democrats lose some support/);
  lost = before - (national(S, 'psl_piast') + national(S, 'zln'));
  assert.ok(Math.abs(lost - 1) < 0.01, 'about one point: ' + lost);
  assert.deepEqual([S.actors.relations.psl_piast, S.actors.relations.zln, S.actors.relations.npr], [rel[0] - 3, Math.max(0, rel[1] - 3), rel[2]]);
  Q.time += 12;
  S.cabinet.supporter_ids = ['pps'];
  assert.equal(PolishPolitics.inquiryOpen(Q), false, 'not while PPS tolerates the cabinet');
});

test('Strajk solidarnościowy 1.33: another branch strikes with them; the government gives way more easily; one more strike pay', () => {
  const Q = game();
  const S = Q.S;
  for (const id of ['industry', 'rail', 'farm_labour']) { S.unions[id].reach = 40; S.unions[id].readiness = 40; }
  S.economy.real_wage = 75;
  for (const t of [1, 2, 3]) PolishUnions.watchWages(Q, t);
  const rec = PolishUnions.disputeRecord(S);
  assert.ok(rec, 'a wage case');
  PolishUnions.setupState(S);
  assert.equal(PolishUnions.setupWhy(Q, 'solidarity', true).available, false, 'only with strike action');
  adopt(Q, 'strike_action');
  assert.equal(PolishUnions.setupWhy(Q, 'solidarity', true).available, true);
  const chance = solidarity => PolishUnions.roundChance(S, Object.assign({}, rec, { status: 'active', solidarity: solidarity ? 'farm_labour' : null,
    participants: rec.branches.reduce((m, b) => Object.assign(m, { [b]: PolishUnions.participation(S, b) }), {}) }), 40).chance;
  const plain = chance(false);
  assert.ok(Math.abs(chance(true) - Math.min(0.95, plain + 0.08)) < 1e-9, 'eight points more');
  PolishUnions.setupChoose(Q, 'solidarity', true);
  free(Q);
  S.party_orgs.cash = 10;
  PolishUnions.launchStrike(Q);
  assert.ok(rec.solidarity && rec.branches.indexOf(rec.solidarity) < 0, 'a branch outside the dispute joins');
});

test('Byli żołnierze 1.33: once, 300 members and one level of training more; the Centre uneasy, the army suspicious', () => {
  const Q = game();
  const S = Q.S;
  assert.equal(PolishParty.militiaStatus(Q, 'veterans').available, false);
  assert.equal(PolishParty.veteransShown(Q), false);
  adopt(Q, 'militarism');
  S.party_orgs.cash = 5;
  const [members, centre, pressure] = [S.militia.strength, S.actors.pps.factions.centrum.dissent, S.coup.pressure];
  const level = S.militia.militancy;
  PolishParty.militiaChoose(Q, 'veterans');
  assert.equal(S.militia.strength, members + 300);
  assert.ok(S.militia.militancy > level, 'trained one level more');
  assert.equal(S.actors.pps.factions.centrum.dissent, centre + 3);
  assert.equal(S.coup.pressure, pressure + 2);
  free(Q);
  assert.equal(PolishParty.veteransShown(Q), false, 'once');
  assert.equal(PolishParty.militiaStatus(Q, 'veterans').available, false);
});

test('Reformizm 1.33: while PPS tolerates the cabinet it may demand a reform; started by the cabinet it counts as a reform of PPS', () => {
  const Q = game();
  const S = Q.S;
  assert.equal(PolishGovernment.ppsStance(S), 'supporter');
  assert.equal(PolishGovernment.nextReformDemand(S), 'reform_labor_inspection');
  assert.equal(PolishGovernment.supportOptionStatus(Q, 'persuade', 'ordinary', 'reform_labor_inspection').available, false, 'only with reformism');
  adopt(Q, 'reformism');
  // The government itself decides — here the non-party premier — not every club that supports the cabinet.
  const asked = PolishGovernment.supportDemand(Q, 'persuade', 'reform_labor_inspection', 'ordinary');
  assert.deepEqual(asked.evaluations.map(e => e.actor), ['ponikowski']);
  assert.equal(asked.accepted, true);
  assert.deepEqual(S.cabinet.plan.filter(o => o.reform_demand).map(o => o.topic), ['reform_labor_inspection']);
  S.cabinet.plan = S.cabinet.plan.filter(o => !o.reform_demand);
  // The cabinet accepted the demand: it starts the reform at a review, and the project counts in the record of PPS.
  const item = { id: 'plan:test', topic: 'reform_labor_inspection', kind: 'programme', beneficiaries: ['pps'], required_project: 'labor_inspection',
    required_variants: ['inspection'], required_stage: 'launched', portfolio: 'labor', weight: 1, due_at: Q.time, status: 'active', fulfillment: 0,
    reform_demand: true };
  S.cabinet.plan = (S.cabinet.plan || []).concat([item]);
  for (let i = 0; i < 4 && !Object.values(S.projects).some(p => p.pps_demand); i++) {
    S.scenario.npc_reviewed_time = null;
    PolishProjects.cabinetReview(Q, Q.time + i);
  }
  const project = Object.values(S.projects).find(p => p.pps_demand === 'reform_labor_inspection');
  assert.ok(project, 'the cabinet starts the demanded reform');
  assert.equal(project.sponsor, 'cabinet');
  assert.ok(project.authorized);
  assert.deepEqual(PolishProjects.ppsReforms(S).map(r => r.key), ['labor_inspection'], 'in the record of PPS');
  assert.ok(S.actors.pps.support.given.labor_inspection > 0.4, 'its voters will appreciate it as a reform of ours');
  // Shadow cabinet: 20 influence points more at the forming of a cabinet.
  const R = game();
  const draft = { configuration_id: 'centre_left' };
  const plain = PolishGovernment.influencePoints(R, draft).points;
  adopt(R, 'reformism');
  assert.equal(PolishGovernment.influencePoints(R, draft).points, plain + 20);
});
