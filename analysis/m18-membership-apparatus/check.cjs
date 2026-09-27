#!/usr/bin/env node
'use strict';
// M18 diagnostics for technical reference 13.1: paying membership can grow with the organised base
// (PPS support among workers and union reach), and the apparatus income bonus falls from 0.20 to
// 0.15 R per level so that it is no longer the obvious first move. Documentation diagnostics only:
// not Dendry gameplay, not a campaign run.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const Module = require('node:module');

const root = path.resolve(__dirname, '../..');
const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
const clip = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// Approved rule (P values of the approved structure).
const RULE = { targetBounds: [50, 150], approach: 0.05, duesFactorPerLevel: 0.05, apparatusBonus: 0.15, oldApparatusBonus: 0.20,
  duesIncome: 0.25, apparatusCost: 0.10, pressCost: 0.10, militiaCost: 0.10 };

// 13.1: membership target and monthly approach.
function memberTarget({ supportRatio = 1, reachRatio = 1, dues = 2 }) {
  return clip(100 * ((supportRatio + reachRatio) / 2) * (1 - RULE.duesFactorPerLevel * (dues - 2)), ...RULE.targetBounds);
}
const approach = (mi, target) => mi + RULE.approach * (target - mi);
const income = ({ dues = 2, level = 1, mi = 100, bonus = RULE.apparatusBonus }) => (RULE.duesIncome * dues + bonus * (level - 1)) * mi / 100;
const upkeep = level => RULE.apparatusCost * level + RULE.pressCost + RULE.militiaCost;

// Opening comparison over 52 months (dues 2, start member index 100; worker support not modelled here).
function opening({ apparatusLevels = 0, unionExpansions = 0, bonus = RULE.apparatusBonus, growth = true, months = 52 }) {
  let level = 1, mi = 100, cash = 2, actions = 0;
  const reach = [20, 20, 20];
  const plan = [...Array(apparatusLevels).fill('apparatus'), ...Array(unionExpansions).fill('reach')];
  for (let m = 1; m <= months; m++) {
    const a = plan[m - 1];
    if (a === 'apparatus') { cash -= 2; level++; actions++; }
    if (a === 'reach') { cash -= 1; reach[0] = Math.min(100, reach[0] + 15); actions++; }
    if (growth) mi = approach(mi, memberTarget({ reachRatio: reach.reduce((x, y) => x + y) / 3 / 20 }));
    cash += income({ level, mi, bonus }) - upkeep(level);
  }
  return { cash, level, memberIndex: mi, actions };
}

// ---- Unit checks of the approved contract.
const examples = {};
{
  assert.equal(memberTarget({}), 100, 'opening base is stable');
  assert.equal(memberTarget({ reachRatio: 1.75 }), 137.5);
  assert.equal(memberTarget({ supportRatio: 2, reachRatio: 2 }), 150, 'capped at 150');
  assert.equal(memberTarget({ supportRatio: 0.2, reachRatio: 0.2 }), 50, 'floor 50');
  assert.ok(close(memberTarget({ dues: 3 }), 95) && close(memberTarget({ dues: 1 }), 105), 'higher dues lower the target');
  // Approach: 5% of the gap per month, both ways.
  assert.ok(close(approach(100, 137.5), 101.875) && close(approach(120, 100), 119));
  // Apparatus: +0.05 R net per level at full membership, payback 40 months.
  const net = income({ level: 2 }) - upkeep(2) - (income({ level: 1 }) - upkeep(1));
  assert.ok(close(net, 0.05)); assert.ok(close(2 / net, 40));
  const oldNet = income({ level: 2, bonus: RULE.oldApparatusBonus }) - upkeep(2) - (income({ level: 1 }) - upkeep(1));
  assert.ok(close(oldNet, 0.10)); assert.ok(close(2 / oldNet, 20));
  // The apparatus earns more in a larger party.
  assert.ok(income({ level: 2, mi: 130 }) - income({ level: 1, mi: 130 }) > income({ level: 2 }) - income({ level: 1 }));
  // Raising dues still trades members for money in the long run.
  const longRun = dues => income({ dues, mi: memberTarget({ dues }) });
  assert.ok(longRun(3) > longRun(2) && memberTarget({ dues: 3 }) < memberTarget({ dues: 2 }));
  examples.duesLongRun = { dues2: longRun(2), dues3: longRun(3), members2: memberTarget({ dues: 2 }), members3: memberTarget({ dues: 3 }) };
}

// Openings relative to no investment.
const openings = {};
{
  const baseOld = opening({ bonus: RULE.oldApparatusBonus, growth: false }).cash, baseNew = opening({}).cash;
  const rows = {
    apparatus1: [{ apparatusLevels: 1, bonus: RULE.oldApparatusBonus, growth: false }, { apparatusLevels: 1 }],
    apparatus3: [{ apparatusLevels: 3, bonus: RULE.oldApparatusBonus, growth: false }, { apparatusLevels: 3 }],
    unions3: [{ unionExpansions: 3, bonus: RULE.oldApparatusBonus, growth: false }, { unionExpansions: 3 }],
  };
  for (const [k, [o, n]] of Object.entries(rows)) {
    const a = opening(o), b = opening(n);
    openings[k] = { before: a.cash - baseOld, after: b.cash - baseNew, memberIndexAfter: b.memberIndex, actions: b.actions };
  }
  assert.ok(openings.apparatus3.before > 9 && openings.apparatus3.after < 2, 'three apparatus levels stop being dominant');
  assert.ok(openings.unions3.before < 0 && openings.unions3.after > 3, 'organising pays through membership');
}

// ---- Scenario check: archived M02 engine patched in memory (support not modelled: reach ratio only).
const enginePath = path.join(root, 'analysis/m02-robustness/engine.cjs');
const PATCH = [
  ["  const P = { cash: 2, apparatus: 1,", "  let m18mi = 100;\n  const P = { cash: 2, apparatus: 1,"],
  ["    P.cash += .25 * 2 + .20 * (P.apparatus - 1);",
   "    if (options.m18 && options.m18.growth) { const avgReach = (unions.industry.reach + unions.rail.reach + unions.rural.reach) / 3; const target = Math.max(50, Math.min(150, 100 * (1 + avgReach / 20) / 2)); m18mi += 0.05 * (target - m18mi); }\n    P.cash += options.m18 ? (.25 * 2 + options.m18.bonus * (P.apparatus - 1)) * m18mi / 100 : .25 * 2 + .20 * (P.apparatus - 1);"],
];
function loadPatchedEngine() {
  let src = fs.readFileSync(enginePath, 'utf8');
  for (const [from, to] of PATCH) { assert.equal(src.split(from).length - 1, 1, `engine anchor present once: ${from.slice(0, 50)}`); src = src.replace(from, to); }
  const m = new Module(enginePath, module); m.filename = enginePath; m.paths = Module._nodeModulePaths(path.dirname(enginePath)); m._compile(src, enginePath);
  return m.exports;
}
const original = require('../m02-robustness/engine.cjs');
const patched = loadPatchedEngine();
const seatsBase = { pps: 41, piast: 70, npr: 18, pschd: 60, zln: 100, wyzwolenie: 49, jewish: 45, otherMinority: 45, other: 14, kpp: 2 };
const parliaments = Object.fromEntries([['base', 0], ['favorable', 1], ['harder', -1]].map(([id, d]) => [id, { ...seatsBase, pps: 41 + 8 * d, wyzwolenie: 49 + 4 * d, zln: 100 - 8 * d, pschd: 60 - 4 * d }]));
const seeds = Array.from({ length: 12 }, (_, i) => `m02-robustness-${String(i + 1).padStart(2, '0')}`);
function runAll(engine, extra) {
  const out = {};
  for (const p of Object.keys(parliaments)) for (const cfg of engine.scenarios) for (const seed of seeds) {
    const r = engine.replay(cfg, { seats: parliaments[p], seed, ...extra });
    const cabinets = r.rows.map(x => `${x.cabinet}/${x.ppsMode}`).filter((c, i, a) => i === 0 || c !== a[i - 1]);
    out[`${p}|${cfg.id}|${seed}`] = { coup: r.endpoint.kind === 'synthetic_coup_result', date: r.endpoint.date, cabinets,
      minCash: Math.min(...r.rows.map(x => x.cash)), endCash: r.rows[r.rows.length - 1].cash };
  }
  return out;
}
const archived = runAll(original, {});
assert.deepEqual(runAll(patched, {}), archived, 'patched engine without M18 reproduces the archived runs');
const scenario = {};
for (const [name, m18] of [['bonusOnly', { bonus: 0.15, growth: false }], ['approved', { bonus: 0.15, growth: true }]]) {
  const b = runAll(patched, { m18 });
  let endpoints = 0, cabinets = 0, minCash = Infinity; const delta = [];
  for (const [k, a] of Object.entries(archived)) {
    const x = b[k];
    if (a.coup !== x.coup || a.date !== x.date) endpoints++;
    if (JSON.stringify(a.cabinets) !== JSON.stringify(x.cabinets)) cabinets++;
    minCash = Math.min(minCash, x.minCash); delta.push(x.endCash - a.endCash);
  }
  scenario[name] = { endpointsChanged: endpoints, cabinetSequencesChanged: cabinets, minCash, endCashDelta: [Math.min(...delta), Math.max(...delta)] };
}
assert.ok(scenario.approved.endpointsChanged === 0 && scenario.approved.cabinetSequencesChanged === 0 && scenario.approved.minCash >= 0);

const docs = ['docs/POLISH_TECHNICAL_REFERENCE.md', 'docs/POLISH_DESCRIPTIVE_GUIDE.md', 'docs/POLISH_MECHANICS_AUDIT.md', 'analysis/m02-robustness/engine.cjs'];
const hashes = Object.fromEntries(docs.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({
  scope: 'M18: membership growth toward a target from worker support and union reach, cap 150; apparatus bonus 0.15 (technical 13.1). Unit checks, a 52-month opening comparison and the 144 main M02 runs on the robustness engine patched in memory (reach ratio only; support not modelled there).',
  rule: RULE, hashes, examples, openings, scenario,
}, null, 2) + '\n');

const f = x => `${x >= 0 ? '+' : ''}${x.toFixed(2)}`;
console.log('PASS: target 100 at the opening, 137.5 with reach x1.75, bounds 50-150, dues factor; 5% monthly approach; apparatus +0.05 net per level (payback 40 M, was 20); openings rebalanced; M02 outcomes and cabinets unchanged, cash never negative.');
for (const [k, v] of Object.entries(openings)) console.log(`${k.padEnd(11)} vs no investment after 52 M: before ${f(v.before)} R, after ${f(v.after)} R (member index ${v.memberIndexAfter.toFixed(1)})`);
for (const [k, v] of Object.entries(scenario)) console.log(`M02 ${k}: endpoints ${v.endpointsChanged}, cabinets ${v.cabinetSequencesChanged}, min cash ${v.minCash.toFixed(2)}, end cash delta ${f(v.endCashDelta[0])}..${f(v.endCashDelta[1])} R`);
