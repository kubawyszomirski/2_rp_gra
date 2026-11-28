'use strict';

// Z — 1.34 (the user's decisions of 25 XI 2026): a pair of adopted characteristics opens options of its own — a general strike (unionism
// and strike action), a state arbitrator (unionism and reformism), the union men on our lists (unionism and parliamentarism), the farm
// labourers organised with the peasant parties (unionism and the worker-peasant alliance), the union guard (unionism and militarism),
// bills that return sooner and the centre kinder to them (parliamentarism and reformism), the minorities voting with us and their
// declaration in defence of the Sejm (parliamentarism and federalism), the campaign „Robotnik i chłop razem” and PSL Wyzwolenie behind our
// radical bills (the alliance and radicalism), the workers' guard and the readiness for a general strike (militarism and strike action),
// the joint self-defence with the communists and the guard in the workers' districts (militarism and radicalism). The people's bloc is
// tested with the formation (rules-negotiation).
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
const adopt = (Q, ...ids) => { for (const id of ids) { PolishRules.profileState(Q.S).seeds[id] = 20; PolishRules.profileState(Q.S).adopted.push({ id, t: Q.time }); } };
function wageCase(Q) {
  const S = Q.S;
  for (const id of ['industry', 'rail', 'farm_labour']) { S.unions[id].reach = 40; S.unions[id].readiness = 40; }
  S.economy.real_wage = 75;
  for (const t of [1, 2, 3]) PolishUnions.watchWages(Q, t);
  return PolishUnions.disputeRecord(S);
}
const workersShare = S => {
  const cells = S.society.cells.filter(c => c.class_id === 'workers'), mass = cells.reduce((n, c) => n + c.mass, 0);
  return cells.reduce((n, c) => n + c.mass * c.propensity.pps, 0) / mass;
};

test('Pary 1.34: a pair needs both characteristics', () => {
  const Q = game();
  assert.equal(PolishRules.pairActive(Q.S, 'unionism', 'strike_action'), false);
  adopt(Q, 'unionism');
  assert.equal(PolishRules.pairActive(Q.S, 'unionism', 'strike_action'), false);
  adopt(Q, 'strike_action');
  assert.equal(PolishRules.pairActive(Q.S, 'unionism', 'strike_action'), true);
});

test('Strajk powszechny 1.34: once in the chapter; 25 points more pressure; the strike pay of every branch; the right stirred', () => {
  const Q = game();
  const S = Q.S;
  const rec = wageCase(Q);
  PolishUnions.setupState(S);
  assert.equal(PolishUnions.setupWhy(Q, 'general', true).available, false, 'only with the pair');
  adopt(Q, 'unionism', 'strike_action');
  assert.equal(PolishUnions.setupWhy(Q, 'general', true).available, true);
  const chance = general => PolishUnions.roundChance(S, Object.assign({}, rec, { status: 'active', general,
    participants: rec.branches.reduce((m, b) => Object.assign(m, { [b]: PolishUnions.participation(S, b) }), {}) }), 40).chance;
  assert.ok(Math.abs(chance(true) - Math.min(0.95, chance(false) + 0.25)) < 1e-9, 'twenty-five points more');
  PolishUnions.setupChoose(Q, 'solidarity', true);
  PolishUnions.setupChoose(Q, 'general', true);
  assert.equal(S.strikes.setup.solidarity, false, 'a general strike replaces the solidarity strike');
  free(Q);
  S.party_orgs.cash = 10;
  const right = S.politics.right ? S.politics.right.mobilisation : 0;
  PolishUnions.launchStrike(Q);
  assert.equal(rec.general, true);
  assert.equal(S.strikes.general_at, Q.time);
  assert.ok(S.politics.right.mobilisation > right, 'the right is stirred');
  assert.equal(PolishUnions.setupWhy(Q, 'general', true).available, false, 'once in the chapter');
});

test('Straż związkowa 1.34: the Milicja protects a strike at no cost and loses no people', () => {
  const Q = game();
  assert.equal(PolishUnions.protectionCost(Q.S), 0.5);
  adopt(Q, 'unionism', 'militarism');
  assert.equal(PolishUnions.protectionCost(Q.S), 0);
});

test('Rozjemca państwowy 1.34: while PPS tolerates the cabinet a dispute ends with half the rise, without a strike', () => {
  const Q = game();
  const S = Q.S;
  const rec = wageCase(Q);
  assert.equal(PolishUnions.arbitrationStatus(Q).available, false, 'only with the pair');
  adopt(Q, 'unionism', 'reformism');
  assert.equal(PolishGovernment.ppsStance(S), 'supporter');
  assert.equal(PolishUnions.arbitrationStatus(Q).available, true);
  const cash = S.party_orgs.cash;
  const text = PolishUnions.arbitrate(Q);
  assert.match(text, /A state arbitrator settles the dispute/);
  assert.deepEqual([rec.status, rec.outcome, rec.settlements[0].wage_factor], ['ended', 'arbitration', 0.5]);
  assert.equal(S.party_orgs.cash, cash, 'no strike pay');
  S.cabinet.supporter_ids = [];
  assert.equal(PolishUnions.arbitrationStatus(Q).available, false, 'not in opposition');
});

test('Związkowcy na listach 1.34: in the three months before an election the workers come to PPS by the reach of the unions', () => {
  const Q = game();
  const S = Q.S;
  S.parliament.next_election.time = Q.time + 2;
  adopt(Q, 'unionism', 'parliamentarism');
  for (const b of ['industry', 'rail', 'farm_labour']) S.unions[b].reach = 60;
  const before = workersShare(S);
  PolishParty.settleParty(Q, Q.time);
  assert.ok(workersShare(S) > before, 'the workers come to PPS');
  assert.ok(S.actors.pps.support.notes.some(n => n.kind === 'union_lists'));
  S.parliament.next_election.time = Q.time + 10;
  const later = workersShare(S);
  PolishParty.settleParty(Q, Q.time);
  assert.ok(!S.actors.pps.support.notes.some(n => n.kind === 'union_lists'), 'not long before an election');
  assert.ok(Math.abs(workersShare(S) - later) < 1e-9);
});

test('Robotnicy rolni z ludowcami 1.34: half as much reach again and both PSL closer', () => {
  const plain = game(), Q = game();
  for (const G of [plain, Q]) { G.S.party_orgs.cash = 5; adopt(G, 'unionism', 'worker_peasant'); }
  const r0 = [plain.S.unions.farm_labour.reach, Q.S.unions.farm_labour.reach];
  PolishParty.organizationsChoose(plain, ['union_organize_farm_labour'], 'party.union_investments');
  const rel = [Q.S.actors.relations.psl_wyzwolenie, Q.S.actors.relations.psl_piast];
  PolishParty.organizationsChoose(Q, ['union_organize_farm_joint'], 'party.union_investments');
  const gain = [plain.S.unions.farm_labour.reach - r0[0], Q.S.unions.farm_labour.reach - r0[1]];
  assert.ok(Math.abs(gain[1] - 1.5 * gain[0]) < 1e-6, 'half as much again: ' + gain);
  assert.deepEqual([Q.S.actors.relations.psl_wyzwolenie, Q.S.actors.relations.psl_piast], [Math.min(75, rel[0] + 2), Math.min(75, rel[1] + 2)].map((v, i) => Math.max(v, rel[i])));
  const single = game();
  single.S.party_orgs.cash = 5;
  assert.equal(PolishParty.selectionStatus(single, ['union_organize_farm_joint'], 'party.union_investments').available, false, 'only with the pair');
});

test('Ustawy 1.34: the centre kinder with parliamentarism and reformism; the minorities with federalism; Wyzwolenie for radical bills', () => {
  const votes = (Q, id, index) => {
    const c = PolishProjects.initiativeCounts(Q, id, index);
    return Object.fromEntries(Object.entries(c.club_votes).map(([k, v]) => [k, v.vote]));
  };
  const rank = { no: 0, abstain: 1, yes: 2 };
  const plain = game(), centre = game();
  adopt(centre, 'parliamentarism', 'reformism');
  const [a, b] = [votes(plain, 'progressive_tax', 0), votes(centre, 'progressive_tax', 0)];
  for (const club of ['npr', 'psl_wyzwolenie', 'psl_piast', 'pschd']) assert.ok(rank[b[club]] >= rank[a[club]], club);
  assert.ok(['npr', 'psl_piast', 'pschd'].some(club => rank[b[club]] > rank[a[club]]), 'at least one club of the centre votes better');
  // Z — 1.45: the return of a rejected bill (once, after three months) is checked in "Inicjatywa 0.81/1.09".
  const minorities = game();
  adopt(minorities, 'parliamentarism', 'federalism');
  const m = votes(minorities, 'progressive_tax', 0);
  assert.deepEqual([m.jewish_rep, m.other_minorities_rep], ['yes', 'yes']);
  const radical = game();
  adopt(radical, 'worker_peasant', 'radicalism');
  assert.equal(votes(radical, 'land_reform', 0).psl_wyzwolenie, 'yes', 'the land reform without compensation');
});

test('Niepokój w wojsku 1.34: the declaration with the minorities and the readiness for a general strike calm the army', () => {
  const Q = game();
  const S = Q.S;
  for (const option of ['declaration', 'general_strike']) assert.equal(PolishSecurity.unrestStatus(Q, option).available, false, option);
  adopt(Q, 'parliamentarism', 'federalism', 'militarism', 'strike_action');
  S.coup.pressure = 45;
  const rel = S.actors.relations.jewish_rep, democracy = S.politics.democracy;
  PolishSecurity.unrestChoose(Q, 'declaration');
  assert.equal(S.coup.pressure, 39);
  assert.deepEqual([S.actors.relations.jewish_rep, S.politics.democracy], [rel + 2, democracy + 1]);
  const pils = S.actors.relations.pilsudski;
  S.politics.due.polish_event_army_mood = 'army:2';
  PolishSecurity.unrestChoose(Q, 'general_strike');
  assert.equal(S.coup.pressure, 31);
  assert.equal(S.actors.relations.pilsudski, pils - 3);
  for (const option of ['declaration', 'general_strike']) assert.equal(PolishSecurity.unrestStatus(Q, option).available, false, option + ': once in the chapter');
  // The workers' guard: with the Milicja and the railwaymen both called, each counts a quarter more.
  assert.equal(PolishSecurity.workersGuard(S, { force: 1 }, { base: 1 }), 1.25);
  assert.equal(PolishSecurity.workersGuard(S, { force: 1 }, null), 1);
});

test('Milicja i komuniści 1.34: 200 members, the KPP closer, the Centre outraged; the guard in the districts: readier workers, faster training', () => {
  const Q = game();
  const S = Q.S;
  assert.equal(PolishParty.militiaStatus(Q, 'communists').available, false);
  adopt(Q, 'militarism', 'radicalism');
  S.party_orgs.cash = 5;
  const [members, kpp, centre] = [S.militia.strength, S.actors.relations.kpp, S.actors.pps.factions.centrum.dissent];
  PolishParty.militiaChoose(Q, 'communists');
  assert.deepEqual([S.militia.strength, S.actors.relations.kpp, S.actors.pps.factions.centrum.dissent], [members + 200, kpp + 5, centre + 5]);
  free(Q);
  assert.equal(PolishParty.pairMilitiaShown(Q, 'communists'), false, 'once');
  const readiness = S.unions.industry.readiness;
  PolishParty.militiaChoose(Q, 'districts');
  assert.equal(S.unions.industry.readiness, readiness + 8);
  free(Q);
  PolishParty.militiaChoose(Q, 'militarize');
  assert.equal(S.cooldowns['militia.militarize'], Q.time + 1, 'the next training in a month');
});

test('Robotnik i chłop razem 1.34: a campaign to the workers and the peasants at once, only with the pair', () => {
  const Q = game();
  assert.equal(PolishParty.issueUnlocked(Q, 'worker_peasant_together'), false);
  assert.equal(PolishParty.issueCampaignStatus(Q, 'worker_peasant_together').reason, 'Only with the characteristics Worker-peasant alliance and Radicalism.'.replace('Worker-peasant alliance', 'The worker-peasant alliance'));
  adopt(Q, 'worker_peasant', 'radicalism');
  const text = PolishParty.issueCampaign(Q, 'worker_peasant_together');
  assert.match(JSON.stringify(Q.pl_party_result || text), /The campaign “Worker and peasant together”: PPS gains among/);
});
