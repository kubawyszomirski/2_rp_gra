#!/usr/bin/env node
'use strict';
// M13 diagnostics for technical reference 9.5-9.6: KPP discipline in a joint strike depends on the
// relation and the fit of the agreed demands with the partner's goal; PPS internal acceptance acts
// only on PPS (Centre dissent, durable front gate) and is raised by the unity card's compromise.
// Documentation diagnostics only: not Dendry gameplay, not a campaign run.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
const clip = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// Approved rule (P values of the approved structure).
const RULE = { complianceBounds: [0.10, 0.90], fitByLevelsBelow: [100, 50, 0], consentThreshold: 60,
  compromiseGain: 15, breachLoss: 15, centreDissent: { full: 5, limited: 2 } };
const LEVEL = { limited: 1, broad: 2, structural: 3 };

// 9.6: goal fit of the agreed demands with the partner goal from the event profile.
function goalFit(agreed, partnerGoal) {
  const below = Math.max(0, LEVEL[partnerGoal] - LEVEL[agreed]);
  return RULE.fitByLevelsBelow[Math.min(below, 2)];
}
const partnerCompliance = (relation, agreed, partnerGoal) =>
  clip((relation + goalFit(agreed, partnerGoal)) / 200, ...RULE.complianceBounds);
const oldCompliance = (relation, acceptance) => clip((relation + acceptance) / 200, 0.10, 0.90);
// 9.5: faction-weighted acceptance of the arrangement.
const acceptance = (support, strength) => {
  const total = Object.values(strength).reduce((a, b) => a + b, 0);
  return Object.keys(support).reduce((s, f) => s + support[f] * strength[f] / total, 0);
};
const compromise = support => Object.fromEntries(Object.entries(support).map(([f, v]) => [f, clip(v + RULE.compromiseGain, 0, 100)]));
const breach = support => Object.fromEntries(Object.entries(support).map(([f, v]) => [f, clip(v - RULE.breachLoss, 0, 100)]));
const centreDissent = (mode, acc) => (acc >= RULE.consentThreshold ? 0 : RULE.centreDissent[mode] || 0);
const frontOpen = (relation, acc, rulesAccepted) => relation >= 65 && acc >= RULE.consentThreshold && rulesAccepted;

// ---- Unit checks of the approved contract.
const examples = {};
{
  // The audit defect: persuading PPS factions used to make the KPP more disciplined.
  assert.ok(close(oldCompliance(30, 50), 0.40) && close(oldCompliance(30, 65), 0.475));
  // New rule: acceptance does not enter; relation and goal fit do.
  examples.relation30_goalBroad = {
    broad: partnerCompliance(30, 'broad', 'broad'), limited: partnerCompliance(30, 'limited', 'broad'),
    structural: partnerCompliance(30, 'structural', 'broad'),
  };
  assert.ok(close(examples.relation30_goalBroad.broad, 0.65) && close(examples.relation30_goalBroad.limited, 0.40));
  assert.ok(close(examples.relation30_goalBroad.structural, 0.65), 'demands above the partner goal still fit');
  assert.ok(close(partnerCompliance(50, 'limited', 'structural'), 0.25), 'two levels below: fit 0');
  assert.equal(partnerCompliance(0, 'limited', 'structural'), 0.10);
  assert.equal(partnerCompliance(100, 'broad', 'broad'), 0.90);
  // Monotonic in relation and in the demand level.
  for (let r = 0; r < 100; r += 5) assert.ok(partnerCompliance(r + 5, 'limited', 'broad') >= partnerCompliance(r, 'limited', 'broad'));
  assert.ok(partnerCompliance(40, 'limited', 'structural') <= partnerCompliance(40, 'broad', 'structural'));
  assert.ok(partnerCompliance(40, 'broad', 'structural') <= partnerCompliance(40, 'structural', 'structural'));
  // PPS acceptance: start 50, one compromise gives 65 whatever the faction weights.
  const strength = { centrum: 0.45, lewica: 0.35, pilsudczycy: 0.20 };
  const start = { centrum: 50, lewica: 50, pilsudczycy: 50 };
  const agreed = compromise(start);
  assert.ok(close(acceptance(start, strength), 50) && close(acceptance(agreed, strength), 65));
  assert.equal(centreDissent('full', acceptance(start, strength)), 5);
  assert.equal(centreDissent('limited', acceptance(start, strength)), 2);
  assert.equal(centreDissent('full', acceptance(agreed, strength)), 0, 'an agreed line removes the Centre penalty');
  assert.equal(centreDissent('none', acceptance(start, strength)), 0);
  // A breach of the agreed rules brings acceptance back below the threshold.
  assert.ok(close(acceptance(breach(agreed), strength), 50));
  // Durable front gate unchanged: relation >= 65, acceptance >= 60, accepted rules.
  assert.ok(frontOpen(65, 65, true) && !frontOpen(64, 65, true) && !frontOpen(70, 59, true) && !frontOpen(70, 65, false));
  // The saved roll decides once: changing PPS acceptance after the roll changes nothing.
  const roll = 0.5;
  const keptBefore = roll < partnerCompliance(30, 'broad', 'broad');
  const keptAfter = roll < partnerCompliance(30, 'broad', 'broad'); // acceptance is not an input
  assert.equal(keptBefore, keptAfter);
  examples.acceptance = { start: 50, afterCompromise: 65, afterBreach: 50 };
}

// ---- Scenario check: the archived M02 engine does not model communist cooperation.
const engineSrc = fs.readFileSync(path.join(root, 'analysis/m02-robustness/engine.cjs'), 'utf8');
const m02HasCommunists = /communist|partnerCompliance|internal_acceptance/i.test(engineSrc);
assert.equal(m02HasCommunists, false, 'no communist cooperation in the archived M02 engine');

const docs = ['docs/POLISH_TECHNICAL_REFERENCE.md', 'docs/POLISH_DESCRIPTIVE_GUIDE.md', 'docs/POLISH_MECHANICS_AUDIT.md', 'analysis/m02-robustness/engine.cjs'];
const hashes = Object.fromEntries(docs.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({
  scope: 'M13: KPP compliance in a joint strike from relation and goal fit; PPS internal acceptance acting only on PPS (technical 9.5-9.6). Unit checks; the archived M02 engine has no communist cooperation, so the approved scenario is unaffected.',
  rule: RULE, hashes, examples, m02HasCommunists,
}, null, 2) + '\n');

console.log('PASS: KPP compliance reads relation and goal fit (0.65 / 0.40 / 0.25 examples, bounds 0.10-0.90), not PPS acceptance; one compromise lifts acceptance 50 -> 65 and removes the Centre penalty; breach -15; front gate unchanged; saved roll unaffected; M02 engine has no communist cooperation.');
