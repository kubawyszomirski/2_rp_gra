'use strict';

// The voters and the reforms of PPS (Z — 1.32, decisions D1–D7 of 24 XI 2026): a reform of a PPS ministry that comes into force
// announces the groups that will appreciate it and wins them about 0.4 points of the whole electorate over three settlements; a
// withdrawn reform takes back one and a half times its gain; Z — 1.43: governing in bad times costs PPS like any party of the cabinet.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const dendry = require('./helpers/dendry');

// A centre-left cabinet with PPS formed in January 1922, in a fixture Sejm in which PPS carries its laws.
function formed() {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.S.parliament.clubs.find(c => c.id === 'pps').seats += 215;
  Q.S.parliament.clubs.find(c => c.id === 'other').seats -= 215;
  for (const [id, value] of Object.entries({ psl_piast: 60, npr: 60, psl_wyzwolenie: 70 })) {
    PolishGovernment.changeRelation(Q, id, value - Q.S.actors.relations[id], 'fixture');
  }
  PolishGovernment.openCrisis(Q, 'cabinet_fall', Q.S.cabinet.id);
  Q.S.cabinet.status = 'caretaker';
  engine.goToScene('post_event');
  dendry.formCabinet(engine, { configuration: 'centre_left', mode: 'member', candidate: 'thugutt', claim: ['economic'] });
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  return Q;
}
// The support of PPS in the whole electorate, in points.
const national = S => {
  const cells = S.society.cells, mass = cells.reduce((n, c) => n + c.mass, 0);
  return cells.reduce((n, c) => n + c.mass * c.propensity.pps, 0) / mass;
};
const near = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 0.005, message + ': ' + actual + ' vs ' + expected);

test('Reforma i wyborcy: village schools announce the peasants and pay a third of their gain at each of three settlements', () => {
  const Q = formed();
  Q.S.cabinet.portfolios.education = 'pps';
  PolishProjects.cardView(Q, 'education_program');
  const before = national(Q.S);
  PolishProjects.chooseOption(Q, 'education_program', 'rural_access');
  assert.match(Q.pl_gc_result, /The peasants will appreciate it in the next three months\.$/);
  const sup = Q.S.actors.pps.support;
  assert.deepEqual(sup.pending.map(p => [p.key, p.labels, p.left]), [['education_program', ['rural'], 3]], 'the groups of the card option');
  const gain = sup.given.education_program;
  assert.ok(gain > 0.3 && gain < 0.6, 'about 0.4 points: ' + gain);
  near(national(Q.S), before, 'nothing at once');
  for (let i = 1; i <= 3; i += 1) {
    PolishParty.settleParty(Q, Q.time);
    near(national(Q.S), before + gain * i / 3, 'settlement ' + i);
  }
  assert.deepEqual(sup.pending, [], 'the whole gain delivered');
  PolishRules.setLanguage('pl');
  try {
    assert.equal(PolishParty.supportNotices({ S: Q.S, time: Q.time + 1 }), 'Chłopi doceniają reformę „Szkoły i oświata dorosłych”.');
  } finally {
    PolishRules.setLanguage('en');
  }
  PolishParty.settleParty(Q, Q.time);
  assert.equal(PolishParty.supportNotices({ S: Q.S, time: Q.time + 1 }), '', 'no line once the gain is delivered');
});

test('Wycofana reforma: stopping it takes back one and a half times its gain and cancels what was still to come', () => {
  const Q = formed();
  Q.S.cabinet.portfolios.education = 'pps';
  PolishProjects.cardView(Q, 'education_program');
  PolishProjects.chooseOption(Q, 'education_program', 'rural_access');
  const sup = Q.S.actors.pps.support, gain = sup.given.education_program;
  PolishParty.settleParty(Q, Q.time);
  const before = national(Q.S);
  const school = Object.values(Q.S.projects).find(p => p.variant === 'rural_access');
  PolishProjects.stopTarget(Q, { kind: 'project', id: school.id }, 'test');
  near(national(Q.S), before - 1.5 * gain, 'one and a half times the gain');
  assert.deepEqual([sup.given.education_program, sup.pending.length], [0, 0]);
  assert.equal(PolishProjects.consumeAnnouncement(Q.S, Q.time), 'The peasants turn away from PPS.');
});

test('Zużycie władzy (Z — 1.43): the wear of PPS is a part of the rule for the cabinet — in a decline a member loses half of 4% a year of its voters, in full at an unemployment of 8%; growth gives back half; stagnation nothing', () => {
  const Q = formed(), E = Q.S.economy;
  const settle = (growth, unemployment) => {
    Object.assign(E, { last_growth: growth, unemployment });
    const before = national(Q.S);
    const climate = PolishEconomy.settleGovernmentClimate(Q, Q.time);
    return { climate, ratio: national(Q.S) / before };
  };
  let r = settle(-0.5, 5);
  assert.deepEqual([r.climate.kind, r.climate.factor, r.climate.weights.pps], ['decline', 0.5, 1]);
  near(1000 * r.ratio, 1000 * (1 - 0.04 / 12 * 0.5), 'a decline: half of the rate');
  r = settle(-0.5, 9);
  near(1000 * r.ratio, 1000 * (1 - 0.04 / 12), 'a decline at 9% unemployment: the full rate');
  r = settle(0.5, 9);
  near(1000 * r.ratio, 1000 * (1 + 0.04 / 12 * 0.5), 'growth: half of the rate back');
  r = settle(0, 9);
  assert.equal(r.ratio, 1, 'stagnation');
  assert.equal(Q.S.actors.pps.support === undefined || !(Q.S.actors.pps.support.notes || []).some(n => n.kind === 'wear'), true, 'no separate wear of PPS any more');
});
