#!/usr/bin/env node
'use strict';
// M09 diagnostics for the approved living-conditions support flow (technical reference 5.6).
// Replays archived M02 monthly traces (economy, cabinet, PPS role) and applies only the
// new monthly flow to the opening class rows. Documentation diagnostics, not Dendry
// gameplay, not an election forecast: campaigns, promises and other flows are absent.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const tracePath = 'analysis/m02-robustness/monthly.csv';
const csv = fs.readFileSync(path.join(root, tracePath), 'utf8').trim().split('\n');
const keys = csv.shift().split(',');
const rows = csv.map(line => Object.fromEntries(line.split(',').map((v, i) => [keys[i], v])));

// Approved parameters (P values of the approved structure).
const RULE = {
  lossPerPoint: 0.10, lossCap: 0.50,      // pp of the class per condition point / month
  gainPerPoint: 0.05, gainCap: 0.25,      // improvement rewards at half strength
  unemploymentPoints: 2,                   // condition points per pp of unemployment above 3
  baseUnemployment: 3,
};
const PARTIES = ['kpp', 'pps', 'npr', 'wyzwolenie', 'piast', 'pschd', 'zln', 'minorities', 'other'];
// Opening class weights and rows: source/scenes/root.scene.dry (K). `general` is the share of the
// general economy (real wages and unemployment) felt by the class; peasants also read the rural index.
const CLASSES = {
  workers:        { weight: 27,      general: 1.00, rural: false, row: [11.04, 38.64, 18.40, 1.84, 0.92, 9.20, 7.36, 4.60, 8] },
  intelligentsia: { weight: 50 / 9,  general: 0.50, rural: false, row: [3.68, 22.08, 4.60, 8.28, 4.60, 9.20, 25.76, 13.80, 8] },
  petty:          { weight: 110 / 9, general: 0.25, rural: false, row: [1.84, 9.20, 12.88, 3.68, 5.52, 18.40, 29.44, 11.04, 8] },
  peasants:       { weight: 53,      general: 0.20, rural: true,  row: [1.76, 3.52, 1.76, 28.16, 29.92, 5.28, 13.20, 4.40, 12] },
  bourgeoisie:    { weight: 20 / 9,  general: 0.00, rural: false, row: [0, 1.84, 3.68, 0.92, 6.44, 13.80, 48.76, 16.56, 8] },
};

// Living-conditions index (5.6). Benefits and relief are deliberately not inputs.
function conditions(cls, e, classes = CLASSES) {
  const c = classes[cls];
  const general = (e.wage - 100) - RULE.unemploymentPoints * (e.unemployment - RULE.baseUnemployment);
  const rural = c.rural ? (45 - e.agrarian) * 0.4 : 0; // 11.6 rural index minus its base 100
  return 100 + c.general * general + rural;
}

// Responsibility: cabinet members 1, parties tolerating by agreement 0.5, opposition 0.
// SYNTHETIC assumption for archived traces: expert/non-party cabinets are tolerated by the
// centre-right clubs (Piast, NPR, PSChD, ZLN) at 0.5, because the traces do not record their
// supporters. Not a historical claim.
function responsibility(r) {
  const w = Object.fromEntries(PARTIES.map(p => [p, 0]));
  if (['Ponikowski', 'Ponikowski (obowiązki)', 'Nowak', 'Sikorski', 'Grabski'].includes(r.cabinet)) {
    for (const p of ['piast', 'npr', 'pschd', 'zln']) w[p] = 0.5;
  }
  if (r.cabinet === 'Chjeno-Piast') for (const p of ['zln', 'pschd', 'piast']) w[p] = 1;
  if (r.cabinet === 'Skrzyński') for (const p of ['piast', 'npr', 'pschd', 'zln']) w[p] = 1;
  w.pps = r.ppsMode === 'member' ? 1 : r.ppsMode === 'external_support' ? 0.5 : 0;
  return w;
}

// One monthly flow in one class; returns the applied flow in pp (negative = responsible lose).
function applyFlow(shares, change, w) {
  const flow = change < 0
    ? -Math.min(RULE.lossCap, RULE.lossPerPoint * -change)
    : Math.min(RULE.gainCap, RULE.gainPerPoint * change);
  const resp = PARTIES.map((p, i) => i).filter(i => w[PARTIES[i]] > 0);
  const free = PARTIES.map((p, i) => i).filter(i => w[PARTIES[i]] === 0);
  const weighted = resp.reduce((s, i) => s + w[PARTIES[i]] * shares[i], 0);
  const freeTotal = free.reduce((s, i) => s + shares[i], 0);
  if (flow === 0 || !resp.length || !free.length || weighted <= 0 || freeTotal <= 0) return 0;
  // A loss is bounded by the responsibility-weighted pool, so no responsible share goes negative.
  const amount = Math.min(Math.abs(flow), flow < 0 ? weighted : freeTotal);
  const sign = flow < 0 ? -1 : 1;
  for (const i of resp) shares[i] += sign * amount * w[PARTIES[i]] * shares[i] / weighted;
  for (const i of free) shares[i] -= sign * amount * shares[i] / freeTotal;
  return sign * amount;
}

function replay(trace, classes = CLASSES) {
  const shares = Object.fromEntries(Object.entries(CLASSES).map(([k, c]) => [k, [...c.row]]));
  const national = p => Object.entries(CLASSES).reduce((s, [k, c]) => s + c.weight * shares[k][PARTIES.indexOf(p)] / 100, 0);
  const start = Object.fromEntries(PARTIES.map(p => [p, national(p)]));
  const perClassFlow = Object.fromEntries(Object.keys(CLASSES).map(k => [k, 0]));
  let prev = null, maxLoss = 0, maxGain = 0;
  const checkpoints = {};
  for (const r of trace) {
    const e = { wage: +r.wage, unemployment: +r.unemployment, agrarian: +r.agrarian };
    if (prev) {
      const w = responsibility(r);
      for (const k of Object.keys(CLASSES)) {
        const applied = applyFlow(shares[k], conditions(k, e, classes) - conditions(k, prev, classes), w);
        perClassFlow[k] += applied;
        maxLoss = Math.min(maxLoss, applied); maxGain = Math.max(maxGain, applied);
        const sum = shares[k].reduce((a, b) => a + b, 0);
        assert.ok(Math.abs(sum - 100) < 1e-9 && shares[k].every(x => x >= -1e-12 && x <= 100 + 1e-12), `${k} shares valid`);
      }
    }
    prev = e;
    checkpoints[r.date] = national('pps') - start.pps;
  }
  assert.ok(maxLoss >= -RULE.lossCap - 1e-12 && maxGain <= RULE.gainCap + 1e-12, 'monthly caps respected');
  const end = Object.fromEntries(PARTIES.map(p => [p, national(p) - start[p]]));
  return { startPPS: start.pps, end, perClassFlow, workersPPS: shares.workers[1] - CLASSES.workers.row[1],
    peasantsPPS: shares.peasants[1] - CLASSES.peasants.row[1], checkpoints, last: trace[trace.length - 1].date };
}

// Unit checks of the approved contract.
{
  const e0 = { wage: 90, unemployment: 3, agrarian: 45 };
  assert.equal(conditions('workers', { ...e0, unemployment: 4 }) - conditions('workers', e0), -2, 'one pp of unemployment = -2 points');
  assert.equal(conditions('bourgeoisie', { wage: 50, unemployment: 20, agrarian: 45 }), 100, 'bourgeoisie unaffected');
  const shock = { ...e0, wage: 80 };
  const dWorkers = conditions('workers', shock) - conditions('workers', e0);
  const dPeasants = conditions('peasants', shock) - conditions('peasants', e0);
  assert.ok(Math.abs(dPeasants - 0.2 * dWorkers) < 1e-12, 'peasants feel the general economy at 1/5');
  for (const k of ['intelligentsia', 'petty', 'peasants']) {
    assert.ok(Math.abs(conditions(k, shock) - conditions(k, e0)) < Math.abs(dWorkers), `${k} reacts less than workers`);
  }
  assert.ok(Math.abs(conditions('peasants', shock) - conditions('peasants', e0)) < Math.abs(conditions('petty', shock) - conditions('petty', e0)), 'peasants below every urban reacting class');
  // Asymmetry: an equal fall and recovery under the same cabinet leaves the responsible parties lower.
  const s = [...CLASSES.workers.row];
  const w = { kpp: 0, pps: 0, npr: 0, wyzwolenie: 0, piast: 1, pschd: 1, zln: 1, minorities: 0, other: 0 };
  applyFlow(s, -4, w); applyFlow(s, +4, w);
  assert.ok(s[4] + s[5] + s[6] < 0.92 + 9.20 + 7.36, 'improvement rewards at half strength');
  // No responsible party: no flow. Stable economy: no flow.
  const s2 = [...CLASSES.workers.row];
  assert.equal(applyFlow(s2, -10, Object.fromEntries(PARTIES.map(p => [p, 0]))), 0);
  assert.equal(applyFlow(s2, 0, w), 0);
  // Opposition never loses from a worsening; responsible never gain from it.
  const s3 = [...CLASSES.workers.row];
  applyFlow(s3, -5, w);
  assert.ok(s3[1] > CLASSES.workers.row[1] && s3[6] < CLASSES.workers.row[6]);
  // Small responsible pool with mixed weights (1 and 0.5): bounded by sum(r*share), no negative share.
  const s4 = [10, 0.1, 0.1, 10, 10, 10, 29.8, 20, 10];
  const w4 = { kpp: 0, pps: 1, npr: 0.5, wyzwolenie: 0, piast: 0, pschd: 0, zln: 0, minorities: 0, other: 0 };
  assert.ok(Math.abs(applyFlow(s4, -10, w4) + 0.15) < 1e-12, 'loss bounded by the weighted pool');
  assert.ok(s4.every(x => x >= -1e-12) && Math.abs(s4.reduce((a, b) => a + b, 0) - 100) < 1e-9, 'no negative share');
}

const strategies = ['A', 'B', 'C', 'H'];
const parliaments = ['base', 'favorable', 'harder'];
const results = {};
const traces = {};
for (const parliament of parliaments) for (const run of strategies) {
  const trace = rows.filter(r => r.variant === 'main' && r.parliament === parliament && r.seed === 'm02-robustness-01' && r.run === run);
  assert.ok(trace.length > 0, `${parliament}/${run} trace present`);
  traces[`${parliament}|${run}`] = trace;
  results[`${parliament}|${run}`] = replay(trace);
}
// Decision 4 comparison: peasants reading only the rural index versus the approved 1/5 of the general
// economy plus the rural index. Totals mix channels, so only workers and intelligentsia are asserted.
const RURAL_ONLY = { ...CLASSES, peasants: { ...CLASSES.peasants, general: 0 } };
const peasants = {};
for (const [key, trace] of Object.entries(traces)) {
  const flow = results[key].perClassFlow;
  peasants[key] = { ruralOnly: replay(trace, RURAL_ONLY).perClassFlow.peasants, approved: flow.peasants, petty: flow.petty };
  assert.ok(Math.abs(flow.peasants) < Math.abs(flow.intelligentsia) && Math.abs(flow.peasants) < Math.abs(flow.workers), `${key} peasants below workers and intelligentsia`);
}
const peasantsBelowPetty = Object.values(peasants).filter(v => Math.abs(v.approved) < Math.abs(v.petty)).length;
// Determinism.
assert.deepEqual(replay(rows.filter(r => r.variant === 'main' && r.parliament === 'base' && r.seed === 'm02-robustness-01' && r.run === 'B')), results['base|B']);

// Worked example: 1923 hyperinflation under Chjeno-Piast, trace A.
const example = rows.filter(r => r.variant === 'main' && r.parliament === 'base' && r.seed === 'm02-robustness-01' && r.run === 'A' && r.date >= '1923-05' && r.date <= '1923-11');
const exShares = [...CLASSES.workers.row];
let exFlow = 0;
for (let i = 1; i < example.length; i++) {
  const a = { wage: +example[i - 1].wage, unemployment: +example[i - 1].unemployment, agrarian: +example[i - 1].agrarian };
  const b = { wage: +example[i].wage, unemployment: +example[i].unemployment, agrarian: +example[i].agrarian };
  exFlow += applyFlow(exShares, conditions('workers', b) - conditions('workers', a), responsibility(example[i]));
}
const workedExample = {
  period: '1923-05..1923-11', wage: [+example[0].wage, +example[example.length - 1].wage],
  workersFlowPP: exFlow, ppsWorkersPP: exShares[1] - CLASSES.workers.row[1],
  chjenoPiastWorkersPP: (exShares[4] + exShares[5] + exShares[6]) - (0.92 + 9.20 + 7.36),
};

const docs = ['docs/POLISH_TECHNICAL_REFERENCE.md', 'docs/POLISH_DESCRIPTIVE_GUIDE.md', 'docs/POLISH_MECHANICS_AUDIT.md', tracePath];
const hashes = Object.fromEntries(docs.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({
  scope: 'Living-conditions flow of technical 5.6 applied to archived M02 monthly traces (seed 01). Only this flow is simulated; not an election forecast.',
  rule: RULE, classes: Object.fromEntries(Object.entries(CLASSES).map(([k, c]) => [k, { weight: c.weight, general: c.general, rural: c.rural }])),
  hashes, workedExample, peasants, peasantsBelowPetty, results,
}, null, 2) + '\n');

const f = x => `${x >= 0 ? '+' : ''}${x.toFixed(2)}`;
console.log('PASS: unemployment weight, class sensitivities, peasants below urban classes, half-strength reward, no-responsibility and stable-economy cases, share bounds, caps and determinism.');
const range = xs => `${Math.min(...xs).toFixed(2)}..${Math.max(...xs).toFixed(2)}`;
console.log(`Peasants net flow: rural index only ${range(Object.values(peasants).map(v => -v.ruralOnly))} pp, approved ${range(Object.values(peasants).map(v => -v.approved))} pp; below petty bourgeoisie in ${peasantsBelowPetty} of ${Object.keys(peasants).length} runs.`);
console.log(`Worked example ${workedExample.period}: workers flow ${f(workedExample.workersFlowPP)} pp, PPS ${f(workedExample.ppsWorkersPP)} pp, Chjeno-Piast ${f(workedExample.chjenoPiastWorkersPP)} pp among workers.`);
for (const parliament of parliaments) for (const run of strategies) {
  const r = results[`${parliament}|${run}`];
  console.log(`${parliament.padEnd(9)} ${run} (to ${r.last}): PPS ${f(r.end.pps)} pp nationally (start ${r.startPPS.toFixed(2)}%), workers ${f(r.workersPPS)}, peasants ${f(r.peasantsPPS)} | Piast ${f(r.end.piast)} Wyzwolenie ${f(r.end.wyzwolenie)} ZLN ${f(r.end.zln)} PSChD ${f(r.end.pschd)} NPR ${f(r.end.npr)} KPP ${f(r.end.kpp)} | flow by class: ${Object.entries(r.perClassFlow).map(([k, v]) => `${k} ${f(v)}`).join(', ')}`);
}
