'use strict';

// The cards of Justice after the redesign (Z — 1.00, the sketch and the user's decisions of 7 XI 2026): „Sądy i więźniowie” with the
// amnesty, the jury courts and the legal advice, and „Prawo i rodzina” with civil marriage and divorce and the equal rights of women.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const dendry = require('./helpers/dendry');

function quiet() {
  const Q = dendry.startGame().state.qualities;
  Q.S.scenario.inputs.dispute_1922 = false;
  Q.S.scenario.inputs.military_case = false;
  Q.S.economy.budget = 10; // Z — 1.01: a pool of 10 units
  return Q;
}
function free(Q) {
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  Q.month_actions = 0;
}
function settle(Q) {
  const t = Q.time;
  free(Q);
  Q.time = t + 1; Q.year = PolishRules.yearOf(Q.time); Q.month = PolishRules.monthOf(Q.time);
  PolishUnions.beginMonth(Q, { t });
  PolishProjects.settleMonth(Q, { t });
  PolishParty.settleMonth(Q, { t });
  PolishUnions.endMonth(Q, { t });
  PolishGovernment.settleAgreements(Q);
  PolishPolitics.settleMonth(Q, { t });
  PolishSecurity.settleMonth(Q, { t });
}
function withJustice(Q) {
  if (!Q.S.cabinet.partner_ids.includes('pps')) Q.S.cabinet.partner_ids.push('pps');
  Q.S.cabinet.portfolios.justice = 'pps';
  Q.S.parliament.clubs.find(c => c.id === 'pps').seats += 215;
  Q.S.parliament.clubs.find(c => c.id === 'other').seats -= 215;
  return Q;
}
const project = (Q, type) => Object.values(Q.S.projects).find(p => p.type === type);
const pending = (p, system) => p.pending_effects.filter(e => e.system === system).map(e => e.value);

test('Sądy i więźniowie 1.00: the amnesty (workers +3, violence +3, once), the jury courts (1 B once — Z — 1.01, democracy +2), the legal advice (unions +5)', () => {
  const Q = withJustice(quiet());
  const S = Q.S;
  PolishProjects.chooseOption(Q, 'justice_policy', 'amnesty');
  const amnesty = project(Q, 'amnesty');
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'justice_policy', 'amnesty').reason, /already been declared/);
  PolishProjects.chooseOption(Q, 'justice_policy', 'jury');
  const jury = project(Q, 'jury_courts');
  assert.deepEqual([jury.authorized, jury.price_B], [true, 1]);
  free(Q);
  const trust = Object.keys(S.unions).map(b => S.unions[b].trust);
  PolishProjects.chooseOption(Q, 'justice_policy', 'legal_aid');
  for (let i = 0; i < 3; i++) settle(Q);
  assert.deepEqual(pending(amnesty, 'trust'), [3]);
  assert.equal(S.politics.violence_episodes.find(e => e.id === amnesty.id + ':violence').value, 3);
  assert.deepEqual(pending(jury, 'democracy'), [2]);
  assert.deepEqual(Object.keys(S.unions).map(b => S.unions[b].trust), trust.map(v => Math.min(100, v + 5)));
});

test('Prawo i rodzina 1.00: civil marriage and divorce (a law; trust +3; the Christian Democrats −8); equal rights of women (the intelligentsia +2, democracy +1; the Christian Democrats −5)', () => {
  const Q = withJustice(quiet());
  const S = Q.S, pschd = S.actors.relations.pschd;
  PolishProjects.chooseOption(Q, 'family_law', 'civil_marriage');
  const civil = project(Q, 'civil_marriage');
  assert.equal(civil.authorized, true);
  assert.equal(S.actors.relations.pschd, pschd - 8);
  free(Q);
  PolishProjects.chooseOption(Q, 'family_law', 'women_rights');
  const women = project(Q, 'women_rights');
  assert.equal(S.actors.relations.pschd, pschd - 13);
  for (let i = 0; i < 2; i++) settle(Q);
  assert.deepEqual(pending(civil, 'trust'), [3]);
  assert.deepEqual([pending(women, 'trust'), pending(women, 'democracy'), women.beneficiaries], [[2], [1], ['new_middle']]);
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'family_law', 'civil_marriage').reason, /already the law/);
});

test('Dekrety resortów 1.00: what a ministry of PPS decides takes effect at once, without a vote in the Sejm or the Senate, even in a Sejm that would refuse it', () => {
  // Z — 1.00 (the user's decision of 7 XI 2026, as in the German original): the price of a ministry decision is the budget, the
  // relations and the coalition, never a vote.
  const Q = quiet();
  if (!Q.S.cabinet.partner_ids.includes('pps')) Q.S.cabinet.partner_ids.push('pps');
  Q.S.cabinet.portfolios.justice = 'pps';
  const S = Q.S, clubs = S.parliament.clubs;
  S.parliament.clubs = [clubs.find(c => c.id === 'pps'), clubs.find(c => c.id === 'pschd')]; // fixture: a Sejm that would refuse
  S.parliament.clubs[0].seats = 1; S.parliament.clubs[1].seats = 443;
  S.actors.relations.pschd = 0;
  const ballots = S.ballots.length;
  PolishProjects.chooseOption(Q, 'family_law', 'civil_marriage');
  const bill = S.parliament.laws.at(-1);
  assert.deepEqual([bill.status, bill.decree, bill.senate, S.ballots.length], ['enacted', true, 'not_required', ballots], 'no ballot at all');
  assert.equal(project(Q, 'civil_marriage').authorized, true);
  assert.ok(Q.pl_gc_result.length > 20, 'the card shows what happened');
  assert.doesNotMatch(Q.pl_gc_result, /Sejm|in force\.|obowiązuje\./, 'no law note after a decree');
});

test('Sprawiedliwość w koalicji 1.00: the amnesty and the jury courts anger the Christian Democrats and the National Democrats; civil marriage angers Piast most', () => {
  const Q = withJustice(quiet());
  Q.S.cabinet.supporter_ids = ['pps', 'psl_piast', 'pschd'];
  const objections = key => PolishGovernment.reformObjections(Q, key).map(o => [o.party, o.delta]);
  assert.deepEqual(objections('justice_policy.amnesty'), [['pschd', 20]]);
  assert.deepEqual(objections('family_law.civil_marriage'), [['pschd', 40], ['psl_piast', 40]]);
  assert.deepEqual(objections('justice_policy.legal_aid'), [], 'the legal advice angers nobody');
});
