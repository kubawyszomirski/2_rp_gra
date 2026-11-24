'use strict';

// The voters and the reforms of PPS (Z — 1.32, decisions D1–D7 of 24 XI 2026): a reform of a PPS ministry that comes into force
// announces the groups that will appreciate it and wins them about 0.4 points of the whole electorate over three settlements; a
// withdrawn reform takes back one and a half times its gain; governing in bad times slowly wears down the workers and the unemployed.
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

test('Zużycie władzy: a PPS in the cabinet loses 0.02 points a month while output falls; nothing in growth', () => {
  const Q = formed();
  Q.S.economy.last_growth = -0.5;
  assert.equal(PolishEconomy.badEconomy(Q.S.economy, Q.time), true);
  let before = national(Q.S);
  PolishParty.settleParty(Q, Q.time);
  near(national(Q.S), before - 0.02, 'the wear of a member');
  assert.deepEqual(Q.S.actors.pps.support.notes, [{ kind: 'wear', stance: 'member' }]);
  Q.S.economy.last_growth = 0.5;
  before = national(Q.S);
  PolishParty.settleParty(Q, Q.time);
  near(national(Q.S), before, 'no wear in growth');
});
