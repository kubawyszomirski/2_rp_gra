'use strict';

// Z — 1.44 (decisions D1A and D2A of 28 XI 2026, N1B and N2A of the sketch): in June 1926 the government decides on each postulate
// PPS announced in the debate of June 1925. A party of the cabinet agrees with a postulate, is neutral or is against it, by the fit of
// its views as for a bill, its red lines and, for the end of the Senate, the clubs that made it. The government takes a postulate all
// its parties agree with; a neutral one when PPS sits in the cabinet or the relations with each of its parties are at least warm
// (55); never one a party of the cabinet is against. The amendment passes with what it took, without a vote.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const dendry = require('./helpers/dendry');

function declared(postulates, cabinet, form) {
  const Q = dendry.startGame().state.qualities, P = PolishProjects;
  if (form) Q.S.actors.pps.strategy.form_of_power = form;
  Q.time = P.CONSTITUTION_DEBATE_AT;
  P.openConstitutionDebate(Q);
  for (const id of postulates) P.debateToggle(Q, id);
  P.debateDeclare(Q);
  Object.assign(Q.S.cabinet, { supporter_ids: [], pps_mode: 'opposition' }, cabinet);
  Q.time = P.AMENDMENT_AT;
  return Q;
}
const chjeno = { pm: 'witos', pm_name: 'Wincenty Witos', party: 'psl_piast', partner_ids: ['pschd', 'zln'] };
const centreLeft = { pm: 'witos', pm_name: 'Wincenty Witos', party: 'psl_piast', partner_ids: ['psl_wyzwolenie', 'npr'] };

test('Nowela 1.44: the stances of the parties come from their views — the right is against the guarantees, PSL Piast is neutral, PSL Wyzwolenie agrees', () => {
  const Q = declared([], chjeno), P = PolishProjects;
  const st = (club, id) => P.amendmentStance(Q, club, id);
  assert.deepEqual(['zln', 'pschd', 'psl_piast', 'npr', 'psl_wyzwolenie'].map(c => st(c, 'democratic_guarantees')), ['against', 'against', 'neutral', 'neutral', 'own']);
  assert.deepEqual(['zln', 'psl_piast', 'psl_wyzwolenie'].map(c => st(c, 'constructive_vonc')), ['own', 'own', 'neutral']);
  assert.deepEqual(['zln', 'psl_piast', 'npr', 'psl_wyzwolenie'].map(c => st(c, 'church_separation')), ['against', 'against', 'against', 'own'], 'NPR by its red line');
  assert.deepEqual(['zln', 'pschd', 'psl_piast', 'psl_wyzwolenie'].map(c => st(c, 'unicameral')), ['against', 'against', 'against', 'own'], 'the makers of the Senate');
  assert.equal(st('psl_wyzwolenie', 'presidential_arbitration'), 'against', 'the red line of the end of parliamentary control');
});

test('Nowela 1.44: Chjeno-Piast takes the constructive vote and rejects the guarantees; the amendment passes without a vote and costs 1 B for each change', () => {
  const Q = declared(['constructive_vonc', 'democratic_guarantees', 'referendum'], chjeno), P = PolishProjects;
  const a = P.amendmentResolve(Q);
  assert.deepEqual(a.decisions.map(d => [d.id, d.taken, d.why, d.parties]), [
    ['constructive_vonc', true, 'own', []],
    ['democratic_guarantees', false, 'against', ['pschd', 'zln']],
    ['referendum', false, 'against', ['pschd', 'zln']]]);
  const debate = P.debateState(Q.S);
  assert.deepEqual(['constructive_vonc', 'democratic_guarantees'].map(id => debate.motions[id].status), ['passed', 'rejected']);
  assert.equal(P.reformsRecord(Q).constructive_vonc, true);
  const law = Q.S.parliament.laws.find(l => l.id === debate.motions.constructive_vonc.law_id);
  assert.deepEqual([law.status, law.cabinet_amendment, law.ballot_ids.length], ['enacted', true, 0], 'no vote');
  assert.equal(P.amendmentResolve(Q), a, 'once');
});

test('Nowela 1.44: a neutral postulate needs PPS in the cabinet or warm relations with each party of the cabinet', () => {
  let Q = declared(['democratic_guarantees', 'referendum', 'church_separation'], centreLeft);
  for (const [id, value] of Object.entries({ psl_piast: 70, psl_wyzwolenie: 70, npr: 50 })) Q.S.actors.relations[id] = value;
  let a = PolishProjects.amendmentResolve(Q);
  assert.deepEqual(a.decisions.map(d => [d.id, d.taken, d.why, d.parties]), [
    ['democratic_guarantees', false, 'relations', ['npr']],
    ['referendum', false, 'relations', ['npr']],
    ['church_separation', false, 'against', ['psl_piast', 'npr']]]);
  Q = declared(['democratic_guarantees', 'referendum'], centreLeft);
  for (const [id, value] of Object.entries({ psl_piast: 70, psl_wyzwolenie: 70, npr: 55 })) Q.S.actors.relations[id] = value;
  a = PolishProjects.amendmentResolve(Q);
  assert.deepEqual(a.decisions.map(d => [d.taken, d.why]), [[true, 'relations'], [true, 'relations']], 'warm relations with each party (55)');
  Q = declared(['democratic_guarantees'], Object.assign({}, centreLeft, { partner_ids: ['pps', 'psl_wyzwolenie', 'npr'], pps_mode: 'member' }));
  Q.S.actors.relations.npr = 10;
  a = PolishProjects.amendmentResolve(Q);
  assert.deepEqual(a.decisions.map(d => [d.taken, d.why]), [[true, 'pps']], 'PPS in the cabinet');
});

test('Nowela 1.44: a cabinet of experts counts the parties that support it; if the coup comes first, the postulates wait', () => {
  const Q = declared(['democratic_guarantees'], { pm: 'grabski', pm_name: 'Władysław Grabski', party: null, partner_ids: [], supporter_ids: ['zln', 'psl_piast'] });
  assert.deepEqual(PolishProjects.amendmentParties(Q.S), { parties: ['zln', 'psl_piast'], pps_in: false });
  const R = declared(['democratic_guarantees'], chjeno);
  R.S.chapter.status = 'ended';
  assert.equal(PolishProjects.amendmentDue(R), false);
  assert.equal(PolishProjects.debateState(R.S).motions.democratic_guarantees.status, 'waiting', 'for chapter II');
  const N = declared([], chjeno);
  assert.equal(PolishProjects.amendmentDue(N), false, 'no postulate, no amendment');
});
