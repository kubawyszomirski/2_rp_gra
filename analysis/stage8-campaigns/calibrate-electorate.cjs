'use strict';
// Stage 8, decision 2A: the opening preferences of the electorate (the seven class rows of January 1922, from which the
// 54 cells are seeded) are calibrated so that a passive PPS (strategy N-A) gets a Sejm of 1922 close to the synthetic
// base Sejm of the M02 runs (technical reference 17.16.10), within ±5 seats per club. The approved seat curve, the
// turnout and the class sizes are not changed. Each party's support is multiplied by one factor in every class, so its
// class profile keeps its shape; each class row is then renormalised to its old total.
// Usage: node analysis/stage8-campaigns/calibrate-electorate.cjs  →  calibration.json and the rows printed for root.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const strategies = require(path.join(root, 'tests', 'helpers', 'strategies.js'));

// The base Sejm of M02 (analysis/m02-robustness/run.cjs): a synthetic test input, not a historical result. The game's
// minority bloc is one electoral list; after the election its seats split 1/3 Jewish, 2/3 other minorities (stage 3).
const TARGET = { kpp: 2, pps: 41, npr: 18, psl_wyzwolenie: 49, psl_piast: 70, pschd: 60, zln: 100, minorities_bloc: 90, other: 14 };
const CLASSES = ['workers', 'old_middle', 'new_middle', 'rural', 'bourgeois_landowners', 'unemployed', 'national_minorities'];
const PARTIES = Object.keys(TARGET);
const TOLERANCE = 5;

const quiet = fn => { const log = console.log; console.log = () => {}; try { return fn(); } finally { console.log = log; } };

// The rows written in source/scenes/root.scene.dry.
function readRows() {
  const text = fs.readFileSync(path.join(root, 'source', 'scenes', 'root.scene.dry'), 'utf8');
  const rows = {};
  for (const c of CLASSES) {
    rows[c] = {};
    for (const p of PARTIES) {
      const m = text.match(new RegExp('^Q\\.' + c + '_' + p + ' = ([0-9.]+);', 'm'));
      if (!m) throw new Error('row ' + c + '_' + p + ' not found');
      rows[c][p] = Number(m[1]);
    }
  }
  return rows;
}

function scaled(rows, factors) {
  const out = {};
  for (const c of CLASSES) {
    const total = PARTIES.reduce((n, p) => n + rows[c][p], 0);
    const raw = PARTIES.map(p => rows[c][p] * factors[p]);
    const sum = raw.reduce((n, v) => n + v, 0);
    out[c] = {};
    PARTIES.forEach((p, i) => { out[c][p] = Math.round(100 * raw[i] * total / sum) / 100; });
  }
  return out;
}

// One passive campaign to the certified result of 1922, from the given opening rows.
function passive1922(rows) {
  const run = quiet(() => strategies.runCampaign('N_A', 8001, {
    setup: engine => {
      const Q = engine.state.qualities;
      for (const c of CLASSES) for (const p of PARTIES) Q[c + '_' + p] = rows[c][p];
      globalThis.PolishElectorate.seedCells(Q);
      globalThis.PolishElectorate.writeClassMirrors(Q);
    },
    stopWhen: Q => (Q.sejm_history || []).length >= 1,
  }));
  const Q = run.engine.state.qualities;
  const clubs = Object.fromEntries(Q.S.parliament.clubs.map(c => [c.id, c.seats]));
  const seats = Object.assign({}, clubs, { minorities_bloc: (clubs.jewish_rep || 0) + (clubs.other_minorities_rep || 0) });
  const election = (Q.sejm_history || [])[0];
  return { seats, votes: election ? Object.fromEntries(election.rows.map(r => [r.id || r.name, r.votes])) : null, speaker: Q.S.parliament.speaker && Q.S.parliament.speaker.name };
}

const base = readRows();
let factors = Object.fromEntries(PARTIES.map(p => [p, 1]));
const trace = [];
let best = null;
for (let iteration = 0; iteration < 40; iteration++) {
  const rows = scaled(base, factors);
  const result = passive1922(rows);
  const misses = PARTIES.map(p => result.seats[p] - TARGET[p]);
  const worst = Math.max(...misses.map(Math.abs));
  trace.push({ iteration, worst, seats: PARTIES.map(p => result.seats[p]) });
  if (!best || worst < best.worst) best = { worst, rows, factors: Object.assign({}, factors), result };
  if (worst <= 1) break;
  // Seats grow faster than votes for a large list (the curve); a damped step on each party's factor.
  for (const p of PARTIES) {
    const have = Math.max(0.5, result.seats[p]);
    factors[p] *= Math.pow(TARGET[p] / have, 0.6);
    factors[p] = Math.min(20, Math.max(0.02, factors[p]));
  }
}

const out = { scope: 'Decision 2A of stage 8: opening class rows calibrated to the M02 base Sejm for a passive PPS (N-A, seed 8001).',
  target: TARGET, tolerance: TOLERANCE, achieved: best.result.seats, worst_miss: best.worst, speaker: best.result.speaker,
  factors: best.factors, rows: best.rows, base_rows: base, trace };
fs.writeFileSync(path.join(__dirname, 'calibration.json'), JSON.stringify(out, null, 1) + '\n');
console.log('worst miss', best.worst, 'after', trace.length, 'iterations');
console.log('achieved', JSON.stringify(PARTIES.map(p => p + ' ' + best.result.seats[p] + '/' + TARGET[p])));
console.log('factors', JSON.stringify(Object.fromEntries(PARTIES.map(p => [p, Math.round(best.factors[p] * 1000) / 1000]))));
