#!/usr/bin/env node
'use strict';
// M15 diagnostics for technical reference 13.3-13.4 and 16.8: the militia has one action at a time;
// AS improves coordination (+0.15 compliance) and, before a coup, serves up to three concurrent
// actions. Documentation diagnostics only: not Dendry gameplay, not a campaign run.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const m08 = require('../m08-coup-profile/check.cjs');

const root = path.resolve(__dirname, '../..');
const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
const clip = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// Approved rule (P values of the approved structure).
const RULE = { asComplianceBonus: 0.15, asMaxActions: 3, protectionPerF: 0.10, protectionCap: 0.40 };

// 10.3 compliance and the AS bonus (13.3); 13.4 effective force.
const compliance = ({ alignment, cohesion = 95, dissent = 0 }) => clip(0.35 + 0.004 * alignment + 0.003 * cohesion - 0.003 * dissent, 0, 1);
const effectiveCompliance = (stage, c) => (stage === 2 ? Math.min(1, c + RULE.asComplianceBonus) : c);
const militiaF = ({ people, militancy, c, fatigue = 0 }) => (people / 100) * militancy * c * (1 - fatigue / 100);
const protection = f => Math.min(RULE.protectionCap, RULE.protectionPerF * f);
// Before a coup: stage 1 serves only the first concurrent need; AS serves up to three, filling each
// in the event's order up to the full protection effect (4 F) and passing the rest to the next.
function allocate(stage, needs, totalF) {
  const out = needs.map(() => 0);
  if (!needs.length) return out;
  if (stage === 1) { out[0] = totalF; return out; }
  let left = totalF;
  for (let i = 0; i < Math.min(needs.length, RULE.asMaxActions); i++) {
    const give = i === Math.min(needs.length, RULE.asMaxActions) - 1 ? left : Math.min(left, RULE.protectionCap / RULE.protectionPerF);
    out[i] = give; left -= give;
  }
  return out;
}

// ---- Unit checks of the approved contract.
const turnout = {};
{
  for (const alignment of [50, 20, 100]) {
    const c = compliance({ alignment }), a = effectiveCompliance(2, c);
    turnout[alignment] = { milicja: c, as: a, ratio: a / c };
  }
  assert.ok(close(turnout[50].milicja, 0.835) && close(turnout[50].as, 0.985));
  assert.ok(close(turnout[20].milicja, 0.715) && close(turnout[20].as, 0.865));
  assert.ok(turnout[50].ratio > 1.17 && turnout[50].ratio < 1.19 && turnout[20].ratio > 1.20 && turnout[20].ratio < 1.22);
  assert.equal(turnout[100].milicja, 1); assert.equal(turnout[100].as, 1, 'full compliance cannot rise');
  // AS adds neither people nor militancy: same inputs, only compliance differs.
  const base = { people: 600, militancy: 0.30, fatigue: 0 };
  const fM = militiaF({ ...base, c: turnout[50].milicja }), fA = militiaF({ ...base, c: turnout[50].as });
  assert.ok(close(fA / fM, turnout[50].ratio));
  // One action for the militia; AS spreads only what one action cannot use.
  assert.deepEqual(allocate(1, ['strike', 'rally'], 8), [8, 0]);
  assert.deepEqual(allocate(2, ['strike', 'rally'], 8), [4, 4]);
  assert.deepEqual(allocate(2, ['strike', 'rally'], 3), [3, 0], 'a small AS still covers only the first action');
  assert.deepEqual(allocate(2, ['a', 'b', 'c', 'd'], 14), [4, 4, 6, 0], 'at most three actions; a fourth gets nothing');
  assert.ok(close(protection(8), 0.40) && close(protection(4), 0.40) && close(protection(3), 0.30));
  const milicjaCover = allocate(1, ['strike', 'rally'], 8).map(protection), asCover = allocate(2, ['strike', 'rally'], 8).map(protection);
  assert.deepEqual(milicjaCover, [0.40, 0]); assert.deepEqual(asCover, [0.40, 0.40]);
}

// ---- Coup: AS has one F task too; the bonus raises its force (exact M08 enumeration, democracy 60).
const cases = [
  ['defend_4F', 'legal', 4], ['defend_6F', 'legal', 6], ['support_6F', 'pils', 6],
];
const coup = {};
for (const [id, stance, F] of cases) {
  const fAS = F * turnout[50].ratio;
  const r1 = m08.enumerate('synthetic_test_v2', { stance, militiaF: F, democracy: 60, f9: 'accept' });
  const r2 = m08.enumerate('synthetic_test_v2', { stance, militiaF: fAS, democracy: 60, f9: 'accept' });
  const pick = r => ({ pils: r.outcomes.pils_victory || 0, legal: r.outcomes.legal_victory || 0, compromise: r.outcomes.constitutional_compromise || 0, f9: r.f9 });
  coup[id] = { milicjaF: F, asF: fAS, milicja: pick(r1), as: pick(r2) };
}
assert.ok(coup.defend_4F.as.f9 > coup.defend_4F.milicja.f9 + 0.2, 'AS makes a 4 F defence significant far more often');
assert.ok(coup.defend_6F.as.pils < coup.defend_6F.milicja.pils, 'AS weakens Pilsudski when defending');
assert.ok(Math.abs(coup.support_6F.as.pils - coup.support_6F.milicja.pils) < 0.005, 'support barely changes');

// ---- Scenario check: the archived M02 engine charges militia upkeep only; no militia force or AS.
const engineSrc = fs.readFileSync(path.join(root, 'analysis/m02-robustness/engine.cjs'), 'utf8');
const m02UsesMilitiaForce = /militancy|militiaF|pps_militia/i.test(engineSrc);
assert.equal(m02UsesMilitiaForce, false, 'no militia force or AS in the archived M02 engine');

const docs = ['docs/POLISH_TECHNICAL_REFERENCE.md', 'docs/POLISH_DESCRIPTIVE_GUIDE.md', 'docs/POLISH_MECHANICS_AUDIT.md',
  'analysis/m02-robustness/engine.cjs', 'analysis/m08-coup-profile/check.cjs'];
const hashes = Object.fromEntries(docs.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({
  scope: 'M15: militia one action at a time; AS +0.15 compliance and up to three concurrent actions before a coup (technical 13.3-13.4, 16.8). Unit checks and the exact M08 enumeration at democracy 60. Not a campaign run.',
  rule: RULE, hashes, turnout, coup, m02UsesMilitiaForce,
}, null, 2) + '\n');

const pct = x => `${(100 * x).toFixed(1)}%`;
console.log('PASS: AS compliance +0.15 (x1.18 at alignment 50, x1.21 at 20, none at full compliance), no extra people or militancy, one action for the militia, AS fills up to three actions to the 40% protection cap, M08 coup effects, M02 engine without militia force.');
for (const [id, v] of Object.entries(coup)) console.log(`${id}: Milicja ${v.milicjaF} F -> P ${pct(v.milicja.pils)} L ${pct(v.milicja.legal)} K ${pct(v.milicja.compromise)} F9 ${pct(v.milicja.f9)} | AS ${v.asF.toFixed(2)} F -> P ${pct(v.as.pils)} L ${pct(v.as.legal)} K ${pct(v.as.compromise)} F9 ${pct(v.as.f9)}`);
