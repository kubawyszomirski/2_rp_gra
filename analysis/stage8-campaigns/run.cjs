'use strict';
// Stage 8 of the implementation plan: whole campaigns of the real game, played by the scripted PPS strategies of
// tests/helpers/strategies.js on shared seeds (technical reference 17.16.7, 21.2). The run changes no gameplay:
// it measures. Output: results.json (every campaign and the aggregates), monthly.csv (the monthly record) and the
// tables printed for REPORT.md. Usage: node analysis/stage8-campaigns/run.cjs [label]
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..', '..');
const strategies = require(path.join(root, 'tests', 'helpers', 'strategies.js'));

const SEEDS = Array.from({ length: 12 }, (_, i) => 8001 + i);
const ORDER = ['N_A', 'N_B', 'N_C', 'N_H', 'passive_opening', 'election_campaign', 'permanent_opposition', 'formal_coalition',
  'stabilization_protections', 'active_employment', 'mass_organizations', 'prepared_mediation', 'constitutional_defense'];
const label = process.argv[2] || 'baseline';

const quiet = fn => {
  const log = console.log;
  console.log = () => {};
  try { return fn(); } finally { console.log = log; }
};
const median = xs => {
  const s = xs.filter(x => x !== null && x !== undefined).sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const ym = strategies.ym;

const runs = [];
const monthly = ['strategy,seed,t,date,cabinet,config,pps_mode,inflation,output,unemployment,budget,pressure,democracy,violence,authority,grievance,capacity,cash,pps_votes,coup_phase'];
const t0 = Date.now();
for (const id of ORDER) {
  for (const seed of SEEDS) {
    const run = quiet(() => strategies.runCampaign(id, seed));
    const sum = strategies.summarize(run);
    runs.push(sum);
    for (const m of run.months) {
      monthly.push([id, seed, m.t, m.date, m.cabinet, m.config, m.pps_mode, ...['inflation', 'output', 'unemployment', 'budget', 'pressure', 'democracy',
        'violence', 'authority', 'grievance', 'capacity', 'cash', 'pps_votes'].map(k => (typeof m[k] === 'number' ? Number(m[k].toFixed(3)) : '')), m.coup_phase].join(','));
    }
  }
}

// ---- Aggregates per strategy.
const T = (y, m) => (y - 1922) * 12 + m;
const aggregates = {};
for (const id of ORDER) {
  const rs = runs.filter(r => r.strategy === id);
  const attempts = rs.filter(r => r.attempt_t !== null);
  const outcomes = {};
  for (const r of rs) outcomes[r.outcome || 'none'] = (outcomes[r.outcome || 'none'] || 0) + 1;
  const seatKeys = rs[0] && rs[0].sejm_1922 ? Object.keys(rs[0].sejm_1922) : [];
  const medianAttempt = median(attempts.map(r => r.attempt_t));
  aggregates[id] = {
    label: rs[0] ? strategies.STRATEGIES[id].label : id,
    runs: rs.length,
    attempts: attempts.length,
    attempt_median: medianAttempt === null ? null : ym(Math.round(medianAttempt)),
    attempt_range: attempts.length ? [ym(Math.min(...attempts.map(r => r.attempt_t))), ym(Math.max(...attempts.map(r => r.attempt_t)))] : null,
    outcomes,
    ends: rs.reduce((o, r) => (o[r.end] = (o[r.end] || 0) + 1, o), {}),
    stuck: rs.filter(r => r.stuck).length,
    pils_agreements: rs.filter(r => r.pils_agreement).length,
    as_formed: rs.filter(r => r.militia_stage === 2).length,
    cabinets_median: median(rs.map(r => r.cabinet_count)),
    sejm_1922_median: Object.fromEntries(seatKeys.map(k => [k, median(rs.map(r => r.sejm_1922 ? r.sejm_1922[k] : null))])),
    speakers: rs.reduce((o, r) => (o[r.speaker_1922 || '—'] = (o[r.speaker_1922 || '—'] || 0) + 1, o), {}),
    presidents: rs.reduce((o, r) => { const k = r.presidents.join(' → ') || '—'; o[k] = (o[k] || 0) + 1; return o; }, {}),
    cabinet_sequences: rs.reduce((o, r) => { const k = r.cabinets.map(c => c.pm + (c.pps_mode === 'member' ? '*' : '')).join(' → '); o[k] = (o[k] || 0) + 1; return o; }, {}),
    pressure_1926_03_median: median(rs.map(r => r.pressure_1926_03)),
    democracy_end_median: median(rs.map(r => r.democracy_end)),
  };
}

// ---- Decision 1A of stage 8: the M02 pattern (17.16.10–11) with its tolerance.
const inWindow = r => r.attempt_t !== null && r.attempt_t >= T(1926, 3) && r.attempt_t <= T(1926, 8);
const targets = {};
for (const id of ['N_A', 'N_H']) {
  const a = aggregates[id], med = median(runs.filter(r => r.strategy === id && r.attempt_t !== null).map(r => r.attempt_t));
  targets[id] = { rule: 'attempt in ≥ 2/3 of seeds, median III–VIII 1926', attempts: a.attempts, of: a.runs, median: a.attempt_median,
    pass: a.attempts * 3 >= a.runs * 2 && med !== null && med >= T(1926, 3) && med <= T(1926, 8) };
}
for (const id of ['N_B', 'N_C']) {
  const rs = runs.filter(r => r.strategy === id);
  const quiet = rs.filter(r => r.attempt_t === null && r.pils_agreement).length;
  targets[id] = { rule: 'no attempt before the elections, with an executed military agreement, in ≥ 2/3 of seeds', quiet, of: rs.length,
    pass: quiet * 3 >= rs.length * 2 };
}

// ---- 21.2: feasibility.
const feasibility = {
  coup_report_reached: runs.some(r => r.end === 'coup'),
  election_report_reached: runs.some(r => r.end === 'next_legal_election'),
  as_affordable: runs.filter(r => r.strategy === 'mass_organizations' && r.militia_stage === 2).length,
  programme_executed: runs.filter(r => r.projects_operating.length > 0).length,
  stuck_runs: runs.filter(r => r.stuck).length,
};

const results = {
  scope: 'Stage 8 measurement: 13 scripted PPS strategies × 12 shared seeds in the real game engine; deck cards opened directly (controlled access as in M02).',
  label, seeds: SEEDS, generated_seconds: Math.round((Date.now() - t0) / 1000),
  sources: Object.fromEntries(['tests/helpers/strategies.js', 'tests/helpers/dendry.js'].concat(fs.readdirSync(path.join(root, 'source', 'rules')).map(f => 'source/rules/' + f))
    .map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex').slice(0, 16)])),
  aggregates, targets, feasibility, runs,
};
fs.writeFileSync(path.join(__dirname, `results-${label}.json`), JSON.stringify(results, null, 1) + '\n');
fs.writeFileSync(path.join(__dirname, `monthly-${label}.csv`), monthly.join('\n') + '\n');

// ---- Printed summary.
console.log(`${label}: ${runs.length} campaigns in ${results.generated_seconds} s`);
for (const id of ORDER) {
  const a = aggregates[id];
  console.log(`${id.padEnd(26)} attempts ${String(a.attempts).padStart(2)}/${a.runs}  median ${a.attempt_median || '—'}  range ${a.attempt_range ? a.attempt_range.join('–') : '—'}  ` +
    `outcomes ${JSON.stringify(a.outcomes)}  cabinets ${a.cabinets_median}  pils ${a.pils_agreements}  AS ${a.as_formed}  stuck ${a.stuck}`);
}
console.log('targets', JSON.stringify(targets));
console.log('feasibility', JSON.stringify(feasibility));
console.log('sejm 1922 (N_A median)', JSON.stringify(aggregates.N_A.sejm_1922_median));
