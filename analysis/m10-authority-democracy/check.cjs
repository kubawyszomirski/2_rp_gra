#!/usr/bin/env node
'use strict';
// M10 diagnostics for technical reference 15.2, 15.3 and 16.1: one owner for Sejm authority (the
// dated institutional log), a small democracy drift, a small democracy term in coup pressure and
// democracy shifting army readiness to join a coup. Documentation diagnostics only: not Dendry
// gameplay, not a campaign run.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const Module = require('node:module');
const m08 = require('../m08-coup-profile/check.cjs');

const root = path.resolve(__dirname, '../..');
const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
const clip = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// Approved rule (P values of the approved structure).
const RULE = {
  window: 12,                 // months an institutional log entry counts
  democracyPivot: 53,         // was 50: an ordinary Sejm (authority 55) adds 0.06 instead of 0.15 a month
  oldPivot: 50,
  pressurePerPoint: 0.01,     // monthly coup pressure 0.01 x (60 - democracy)
  pressureCap: 0.5,
  shiftPerPoint: 0.0025,      // 2.5 pp of loyalty per 10 points of democracy
  shiftCentre: 60,
  shiftCap: 0.10,
};
// 15.2 institutional log: kinds and weights; the two stance kinds replace the direct 10.7 write.
const WEIGHTS = { law: 4, resolution: 4, failure: -6, gap: -3, breach: -5, stance_defense: 1, stance_criticism: -2 };

function authority(log, t) {
  const recent = log.filter(e => e.t <= t && e.t > t - RULE.window);
  return clip(55 + recent.reduce((s, e) => s + WEIGHTS[e.kind], 0), 0, 100);
}
function democracyStep(d, { authority: a, grievance = 0, unlawful = 0, defenses = 0 }, pivot = RULE.democracyPivot) {
  return clip(d + 0.03 * (a - pivot) - 0.02 * Math.max(0, grievance - 50) - 2 * unlawful + 1 * defenses, 0, 100);
}
const democracyPressure = d => clip(RULE.pressurePerPoint * (60 - d), -RULE.pressureCap, RULE.pressureCap);
// 16.1: effective loyalty [legal, pils, neutral] read at the gate check, estimates and the allegiance roll.
function effectiveLoyalty([l, p, n], democracy) {
  const s = clip(RULE.shiftPerPoint * (democracy - RULE.shiftCentre), -RULE.shiftCap, RULE.shiftCap);
  return s >= 0 ? [l, p - Math.min(s, p), n + Math.min(s, p)] : [l, p + Math.min(-s, n), n - Math.min(-s, n)];
}

// ---- Authority: one owner.
{
  const log = [{ t: 5, kind: 'stance_defense', source_id: 'pils_speech_1' }];
  for (let t = 5; t <= 16; t++) assert.equal(authority(log, t), 56, 'defence entry counts for 12 months');
  assert.equal(authority(log, 17), 55, 'entry expires after 12 months');
  assert.equal(authority([{ t: 5, kind: 'stance_criticism' }], 10), 53);
  // The old direct write is lost at the next monthly recomputation; the log entry is not.
  assert.equal(authority([], 5) - 2, 53);
  assert.equal(authority([], 6), 55, 'old direct write disappears at the next settlement');
  assert.equal(authority([{ t: 5, kind: 'stance_criticism' }], 6), 53, 'log entry persists');
  // One entry per speech ID: a repeated load or view does not add a second entry.
  const once = [];
  const add = e => { if (!once.some(x => x.source_id === e.source_id)) once.push(e); };
  add({ t: 5, kind: 'stance_criticism', source_id: 's1' }); add({ t: 5, kind: 'stance_criticism', source_id: 's1' });
  assert.equal(authority(once, 5), 53);
}

// ---- Democracy: small drift in an ordinary Sejm, concrete event terms, small pressure term.
{
  assert.ok(close(democracyStep(60, { authority: 55 }), 60.06), 'quiet Sejm adds 0.06 a month');
  assert.ok(close(democracyStep(60, { authority: 55 }, RULE.oldPivot), 60.15), 'old pivot added 0.15 a month');
  assert.ok(close(democracyStep(60, { authority: 53 }), 60), 'authority 53 keeps democracy');
  assert.ok(close(democracyStep(60, { authority: 49 }), 59.88), 'a failed formation lowers it');
  assert.ok(close(democracyStep(60, { authority: 55, unlawful: 1 }), 58.06), 'unlawful institutional act -2');
  assert.ok(close(democracyStep(60, { authority: 55, defenses: 1 }), 61.06), 'successful legal defence +1');
  assert.ok(close(democracyPressure(70), -0.1) && close(democracyPressure(50), 0.1) && democracyPressure(60) === 0);
  assert.ok(close(democracyPressure(100), -0.4) && democracyPressure(0) === 0.5, 'bounded pressure term');
}

// ---- Army readiness: effective loyalties of synthetic_test_v2 with the exact M08 enumeration.
const BASE = m08.PROFILES.synthetic_test_v2;
for (let d = 0; d <= 100; d += 1) {
  for (const row of BASE.map(r => effectiveLoyalty(r, d))) {
    assert.ok(close(row.reduce((a, b) => a + b, 0), 1) && row.every(x => x >= -1e-12 && x <= 1 + 1e-12), 'valid loyalty row');
  }
}
assert.deepEqual(BASE.map(r => effectiveLoyalty(r, 60)), BASE, 'democracy 60 leaves synthetic_test_v2 unchanged');
const profileAt = d => {
  const key = `m10_democracy_${d}`;
  if (!m08.PROFILES[key]) m08.PROFILES[key] = BASE.map(r => effectiveLoyalty(r, d));
  return key;
};
const SHOWN = ['passive', 'support_rail', 'support_militia', 'defend_as', 'defend_rail'];
const table = {};
let prevPils = Infinity;
for (let d = 0; d <= 100; d += 5) {
  const key = profileAt(d);
  const cap = m08.capacity(key);
  assert.ok(cap >= 30, `capacity gate not blocked by democracy ${d}`);
  const pils = m08.enumerate(key, { democracy: d, f9: 'accept' }).outcomes.pils_victory || 0;
  assert.ok(pils <= prevPils + 1e-12, 'Pilsudski share does not rise with democracy');
  prevPils = pils;
  if (d >= 45 && d <= 75) assert.ok(pils >= 0.40 && pils <= 0.50, `passive PPS keeps the 40-50% band at democracy ${d}`);
  table[d] = { capacity: cap };
  for (const id of SHOWN) {
    const r = m08.enumerate(key, { ...m08.STRATEGIES[id].cfg, democracy: d, f9: 'accept' });
    table[d][id] = {
      pils: r.outcomes.pils_victory || 0, legal: r.outcomes.legal_victory || 0,
      compromise: r.outcomes.constitutional_compromise || 0, prolonged: r.outcomes.prolonged_conflict || 0,
    };
  }
}
assert.ok(close(table[60].passive.pils, m08.enumerate('synthetic_test_v2', { democracy: 60, f9: 'accept' }).outcomes.pils_victory), 'M08 result kept at democracy 60');
const passivePils = d => m08.enumerate(profileAt(Math.round(d)), { democracy: Math.round(d), f9: 'accept' }).outcomes.pils_victory;

// ---- Coup dates: archived M02 robustness engine with the M10 rules patched in memory only.
const enginePath = path.join(root, 'analysis/m02-robustness/engine.cjs');
const PATCH = [
  ["2 * militaryOpen - 2 * (newCivil.size > 0), 0, 100);",
   "2 * militaryOpen - 2 * (newCivil.size > 0) + (options.m10 ? options.m10.pressure(democracy) : 0), 0, 100);"],
  ["democracy = clip(democracy + .03 * (authority - 50)",
   "democracy = clip(democracy + .03 * (authority - (options.m10 ? options.m10.pivot : 50))"],
];
function loadPatchedEngine() {
  let src = fs.readFileSync(enginePath, 'utf8');
  for (const [from, to] of PATCH) {
    assert.equal(src.split(from).length - 1, 1, `engine anchor present once: ${from}`);
    src = src.replace(from, to);
  }
  const m = new Module(enginePath, module);
  m.filename = enginePath;
  m.paths = Module._nodeModulePaths(path.dirname(enginePath));
  m._compile(src, enginePath);
  return m.exports;
}
const original = require('../m02-robustness/engine.cjs');
const patched = loadPatchedEngine();
const seatsBase = { pps: 41, piast: 70, npr: 18, pschd: 60, zln: 100, wyzwolenie: 49, jewish: 45, otherMinority: 45, other: 14, kpp: 2 };
const parliaments = Object.fromEntries([['base', 0], ['favorable', 1], ['harder', -1]].map(([id, d]) => [id, { ...seatsBase, pps: 41 + 8 * d, wyzwolenie: 49 + 4 * d, zln: 100 - 8 * d, pschd: 60 - 4 * d }]));
const seeds = Array.from({ length: 12 }, (_, i) => `m02-robustness-${String(i + 1).padStart(2, '0')}`);
const monthIndex = d => { const [y, m] = d.split('-').map(Number); return 12 * (y - 1922) + m; };
const VARIANTS = {
  approved: { pivot: RULE.democracyPivot, pressure: democracyPressure },
  drift_only: { pivot: RULE.democracyPivot, pressure: () => 0 },
  pressure_x2: { pivot: RULE.democracyPivot, pressure: d => clip(0.02 * (60 - d), -0.5, 0.5) },
};
function endpoints(engine, m10) {
  const out = {};
  for (const parliament of Object.keys(parliaments)) for (const cfg of engine.scenarios) for (const seed of seeds) {
    const r = engine.replay(cfg, { seats: parliaments[parliament], seed, ...(m10 ? { m10 } : {}) });
    const last = r.rows[r.rows.length - 1];
    out[`${parliament}|${cfg.id}|${seed}`] = { coup: r.endpoint.kind === 'synthetic_coup_result', date: r.endpoint.date, democracy: last.democracy };
  }
  return out;
}
const archived = endpoints(original);
assert.deepEqual(endpoints(patched), archived, 'patched engine without M10 reproduces the archived runs');
const dates = {};
for (const [name, m10] of Object.entries(VARIANTS)) {
  const e = endpoints(patched, m10);
  const delays = {}, dem = [];
  let kept = 0, lost = 0, gained = 0;
  for (const [k, a] of Object.entries(archived)) {
    const r = e[k];
    if (a.coup && !r.coup) lost++;
    if (!a.coup && r.coup) gained++;
    if (r.coup) dem.push(r.democracy);
    if (a.coup && r.coup) { kept++; const dm = monthIndex(r.date) - monthIndex(a.date); delays[dm] = (delays[dm] || 0) + 1; }
  }
  dates[name] = { kept, lost, gained, delays, democracyAtAttempt: [Math.min(...dem), Math.max(...dem)], endpoints: e };
}
const attemptsArchived = Object.values(archived).filter(a => a.coup).length;
assert.equal(attemptsArchived, 96);
assert.ok(dates.drift_only.kept === 96 && Object.keys(dates.drift_only.delays).join() === '0', 'drift alone moves no date');
assert.ok(dates.approved.kept === 96 && dates.approved.lost === 0 && dates.approved.gained === 0, 'approved rule keeps every attempt');
assert.ok(Object.keys(dates.approved.delays).every(d => +d >= 1 && +d <= 3), 'approved rule delays attempts by 1-3 months');
const seed01 = {};
for (const parliament of Object.keys(parliaments)) for (const id of original.scenarios.map(c => c.id)) {
  const k = `${parliament}|${id}|m02-robustness-01`;
  const show = e => (e[k].coup ? e[k].date : 'none');
  seed01[`${parliament}|${id}`] = { archived: show(archived), approved: show(dates.approved.endpoints), pressure_x2: show(dates.pressure_x2.endpoints) };
}
const [dLo, dHi] = dates.approved.democracyAtAttempt;
const attempts = { democracy: [dLo, dHi], passivePils: [passivePils(dHi), passivePils(dLo)] };

// Worked example: one speech answered with support for the criticism.
const example = {
  authority: authority([{ t: 42, kind: 'stance_criticism' }], 42),
  months: RULE.window,
  democracyEffect: 12 * 0.03 * -2,          // -0.06 per month for 12 months
  strikeChancePP: 100 * 0.20 * 2 / 100,     // governmentFragility +2 -> negotiatingPressure +0.4 -> +0.4 pp
};

const docs = ['docs/POLISH_TECHNICAL_REFERENCE.md', 'docs/POLISH_DESCRIPTIVE_GUIDE.md', 'docs/POLISH_MECHANICS_AUDIT.md',
  'analysis/m02-robustness/engine.cjs', 'analysis/m08-coup-profile/check.cjs'];
const hashes = Object.fromEntries(docs.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
const summary = Object.fromEntries(Object.entries(dates).map(([k, v]) => [k, { kept: v.kept, lost: v.lost, gained: v.gained, delays: v.delays, democracyAtAttempt: v.democracyAtAttempt }]));
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({
  scope: 'M10: institutional log for authority; democracy pivot 53 and pressure term replayed with the archived M02 robustness engine (144 main runs, patched in memory); democracy-shifted loyalties of synthetic_test_v2 with the exact M08 enumeration. Not a campaign run, not historical forces.',
  rule: RULE, weights: WEIGHTS, hashes, attemptsArchived, dates: summary, seed01, attempts, example, table,
}, null, 2) + '\n');

const f = x => `${(100 * x).toFixed(1)}%`;
console.log('PASS: 12-month log entries replace the direct write, democracy drift 0.06/M, event and pressure terms, patched engine reproduces M02, all 96 attempts kept and delayed 1-3 M, valid loyalty rows, democracy 60 = v2, capacity >= 30, monotonic Pilsudski share, 40-50% band at democracy 45-75.');
for (const [k, v] of Object.entries(summary)) console.log(`${k.padEnd(12)} attempts kept ${v.kept}/96, lost ${v.lost}, gained ${v.gained}, delay months ${JSON.stringify(v.delays)}, democracy at attempt ${v.democracyAtAttempt.map(x => x.toFixed(1)).join('..')}`);
console.log(`Passive PPS at the approved attempt democracy ${dLo.toFixed(1)}..${dHi.toFixed(1)}: Pilsudski ${attempts.passivePils.map(f).join('..')}.`);
for (const [k, v] of Object.entries(seed01)) console.log(`seed 01 ${k.padEnd(12)} archived ${v.archived} | approved ${v.approved} | pressure x2 ${v.pressure_x2}`);
for (const d of [30, 45, 60, 75, 85]) {
  const r = table[d];
  console.log(`democracy ${d}: capacity ${r.capacity.toFixed(1)} | passive P ${f(r.passive.pils)} L ${f(r.passive.legal)} K ${f(r.passive.compromise)} B ${f(r.passive.prolonged)} | support+strike P ${f(r.support_rail.pils)} | support+militia P ${f(r.support_militia.pils)} | defend+AS L ${f(r.defend_as.legal)} P ${f(r.defend_as.pils)} | defend+strike L ${f(r.defend_rail.legal)}`);
}
