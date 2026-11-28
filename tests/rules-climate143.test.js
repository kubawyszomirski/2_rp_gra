'use strict';

// Z — 1.43 (decisions G1A, G2A and G4A of 28 XI 2026, the rate of 4% approved the same day): the times weigh on the government. In a
// month of crisis each party of the cabinet loses a twelfth of 4% of its voters, a party that supports it from outside half of that;
// a decline counts half, in full at an unemployment of 8%; growth gives back half of the rate. The voters go to the other parties of
// the same groups. The month page names the other parties of the cabinet once, when the times begin to weigh on them or to help them
// or the cabinet changes, and PPS every month it is touched.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const dendry = require('./helpers/dendry');

const national = (S, party) => {
  const cells = S.society.cells, mass = cells.reduce((n, c) => n + c.mass, 0);
  return cells.reduce((n, c) => n + c.mass * c.propensity[party], 0) / mass;
};
// The cabinet of Witos with PSL Piast, the Christian Democrats and the National Democrats; PPS in opposition.
function witos(lang) {
  const engine = dendry.startGame(1922, lang);
  const Q = engine.state.qualities;
  Object.assign(Q.S.cabinet, { pm: 'witos', pm_name: 'Wincenty Witos', party: 'psl_piast', partner_ids: ['pschd', 'zln'], supporter_ids: ['npr'], pps_mode: 'opposition' });
  return Q;
}

test('Rząd a gospodarka (Z — 1.43): in a crisis month the members lose a twelfth of 4% of their voters, the supporters half; the others gain as much', () => {
  const Q = witos(), S = Q.S, parties = S.society.parties;
  Q.S.economy.last_growth = -1.5;
  const before = Object.fromEntries(parties.map(p => [p, national(S, p)]));
  const c = PolishEconomy.settleGovernmentClimate(Q, Q.time);
  assert.deepEqual([c.kind, c.factor, c.sign, c.began], ['crisis', 1, -1, true]);
  assert.deepEqual(c.weights, { npr: 0.5, psl_piast: 1, pschd: 1, zln: 1 });
  for (const p of ['psl_piast', 'pschd', 'zln']) assert.ok(Math.abs(national(S, p) / before[p] - (1 - 0.04 / 12)) < 1e-9, p);
  assert.ok(Math.abs(national(S, 'npr') / before.npr - (1 - 0.02 / 12)) < 1e-9, 'a supporter: half');
  const total = parties.reduce((n, p) => n + national(S, p) - before[p], 0);
  assert.ok(Math.abs(total) < 1e-9, 'the voters stay in the electorate');
  for (const p of ['pps', 'psl_wyzwolenie', 'kpp']) assert.ok(national(S, p) > before[p], p + ' gains');
  assert.ok(Math.abs(c.moved.zln - (national(S, 'zln') - before.zln)) < 1e-9, 'the record names the change');
});

test('Rząd a gospodarka (Z — 1.43): a cabinet of experts costs only its supporters, at half; stagnation changes nothing', () => {
  const Q = witos(), S = Q.S;
  Object.assign(S.cabinet, { pm: 'grabski', pm_name: 'Władysław Grabski', party: null, partner_ids: [], supporter_ids: ['zln', 'psl_piast'] });
  S.economy.last_growth = 0;
  const zln = national(S, 'zln');
  assert.equal(PolishEconomy.settleGovernmentClimate(Q, Q.time).kind, 'stagnation');
  assert.equal(national(S, 'zln'), zln);
  S.economy.last_growth = -1.5;
  PolishEconomy.settleGovernmentClimate(Q, Q.time);
  assert.ok(Math.abs(national(S, 'zln') / zln - (1 - 0.02 / 12)) < 1e-9);
});

test('Rząd a gospodarka (Z — 1.43): the month page names the other parties once, when the times begin to weigh on them, and PPS every month', () => {
  const Q = witos('pl'), S = Q.S;
  try {
    S.economy.last_growth = -1.5;
    PolishEconomy.settleGovernmentClimate(Q, Q.time);
    Q.time += 1;
    assert.equal(PolishParty.supportNotices(Q), 'Kryzys obciąża rząd Wincentego Witosa: wyborców tracą PSL „Piast”, chadecja i endecja, a w połowie także popierające go z zewnątrz Narodowa Partia Robotnicza.');
    PolishEconomy.settleGovernmentClimate(Q, Q.time);
    Q.time += 1;
    assert.equal(PolishParty.supportNotices(Q), '', 'the same times and the same cabinet: no new sentence');
    S.cabinet.supporter_ids = ['npr', 'pps'];
    PolishEconomy.settleGovernmentClimate(Q, Q.time);
    Q.time += 1;
    assert.match(PolishParty.supportNotices(Q), /^Kryzys obciąża rząd Wincentego Witosa: .*Ciężkie czasy obciążają też PPS, która popiera rząd: niektórzy nasi wyborcy odwracają się od nas\.$/);
    PolishEconomy.settleGovernmentClimate(Q, Q.time);
    Q.time += 1;
    assert.equal(PolishParty.supportNotices(Q), 'Ciężkie czasy obciążają też PPS, która popiera rząd: niektórzy nasi wyborcy odwracają się od nas.', 'PPS every month');
    S.economy.last_growth = 0.5;
    PolishEconomy.settleGovernmentClimate(Q, Q.time);
    Q.time += 1;
    assert.match(PolishParty.supportNotices(Q), /^Dobra koniunktura pomaga rządowi Wincentego Witosa: wyborców zyskują PSL „Piast”, chadecja i endecja, a w połowie także popierające go z zewnątrz Narodowa Partia Robotnicza\. Dobre czasy pomagają też PPS/);
  } finally {
    PolishRules.setLanguage('en');
  }
});
