'use strict';

// The cards of the Interior after the redesign (Z — 0.99, the sketch and the user's decisions of 7 XI 2026): Police with three
// permanent options, „Kresy i mniejszości” and „Wolności obywatelskie”; one gain and one cost per option.
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
function withPortfolios(Q, ...portfolios) {
  if (!Q.S.cabinet.partner_ids.includes('pps')) Q.S.cabinet.partner_ids.push('pps');
  for (const key of portfolios) Q.S.cabinet.portfolios[key] = 'pps';
  return Q;
}
function ppsMajority(Q) {
  Q.S.parliament.clubs.find(c => c.id === 'pps').seats += 215;
  Q.S.parliament.clubs.find(c => c.id === 'other').seats -= 215;
  return Q;
}
const options = cardId => PolishProjects.CARDS[cardId].options;
const project = (Q, type) => Object.values(Q.S.projects).find(p => p.type === type);
const episode = (Q, id) => Q.S.politics.violence_episodes.find(e => e.id === id);

test('Sprawy Wewnętrzne 0.99: three cards with three permanent options each', () => {
  quiet();
  assert.deepEqual(options('internal_security'), ['training', 'prosecute', 'protect', 'police_cuts'], 'Z — 1.11: and a saving');
  assert.deepEqual(options('minorities_kresy'), ['official_languages', 'self_government', 'border']);
  assert.deepEqual(options('civil_liberties'), ['press_freedom', 'assembly', 'squads']);
});

test('Chroń wiece i strajki: an order for half a year, business +3; it holds when PPS loses the ministry and lowers the risk of a clash at a rally', () => {
  const Q = withPortfolios(quiet(), 'interior');
  const S = Q.S, pressure = S.economy.business_pressure;
  PolishProjects.chooseOption(Q, 'internal_security', 'protect');
  assert.equal(S.security.protect_until, Q.time + 6);
  assert.equal(S.economy.business_pressure, pressure + 3);
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'internal_security', 'protect').reason, /in force until/);
  S.cabinet.portfolios.interior = 'expert';
  assert.equal(PolishProjects.policeOrders(S, Q.time + 5), true, 'the order outlasts the ministry');
  assert.equal(PolishProjects.policeOrders(S, Q.time + 6), false);
  const guarded = PolishPolitics.gatheringClash(Q, { id: 'fixture_rally', uncontrolled: 0, repressive: false, authorised: false, compliance: 0, subject: 'a fixture rally' });
  assert.equal(guarded.risk, 0, 'the base risk of 0.10 is guarded away');
});

test('Kresy i mniejszości: languages in the offices (law, the minorities +3, endecja −5); the border (2 B once — Z — 1.01, violence −3, the minorities −3)', () => {
  const Q = ppsMajority(withPortfolios(quiet(), 'interior'));
  const S = Q.S, zln = S.actors.relations.zln;
  PolishProjects.chooseOption(Q, 'minorities_kresy', 'official_languages');
  const languages = project(Q, 'official_languages');
  assert.deepEqual([languages.authorized, languages.price_B], [true, 1]);
  assert.equal(S.actors.relations.zln, zln - 5);
  free(Q);
  PolishProjects.chooseOption(Q, 'minorities_kresy', 'border');
  const border = project(Q, 'border_protection');
  assert.deepEqual([border.price_B, border.duration_months], [2, 1]);
  for (let i = 0; i < 4; i++) settle(Q);
  assert.deepEqual(languages.pending_effects.filter(e => e.system === 'trust').map(e => e.value), [3]);
  assert.deepEqual(border.pending_effects.filter(e => e.system === 'trust').map(e => [e.value, e.beneficiaries]), [[-3, ['national_minorities']]]);
  assert.equal(episode(Q, border.id + ':violence').value, -3);
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'minorities_kresy', 'border').reason, /already been strengthened/);
});

test('Wolności obywatelskie: no confiscation for a year and democracy +1; easier rallies (campaigns ×1.10, violence +3); the squads dissolved (−10; endecja −5, communists −10)', () => {
  const Q = ppsMajority(withPortfolios(quiet(), 'interior'));
  const S = Q.S;
  PolishProjects.chooseOption(Q, 'civil_liberties', 'press_freedom');
  assert.equal(S.party_orgs.press.no_confiscation_until, Q.time + 12);
  assert.ok(S.politics.democracy_effects.some(e => e.cause === 'press_law' && e.value === 1));
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'civil_liberties', 'press_freedom').reason, /is confiscated until/);
  PolishProjects.chooseOption(Q, 'civil_liberties', 'assembly');
  assert.ok(S.politics.assembly_freedom);
  assert.equal(episode(Q, 'assembly_freedom').value, 3);
  free(Q);
  const zln = S.actors.relations.zln, kpp = S.actors.relations.kpp;
  PolishProjects.chooseOption(Q, 'civil_liberties', 'squads');
  assert.equal(episode(Q, 'squads_dissolved').value, -10);
  assert.deepEqual([S.actors.relations.zln, S.actors.relations.kpp], [zln - 5, kpp - 10]);
  assert.ok(S.militia.strength > 0, 'the PPS Militia stays');
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'civil_liberties', 'squads').reason, /already dissolved/);
});
