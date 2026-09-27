#!/usr/bin/env node
'use strict';

// Proposals for review only. Does not write gameplay or the approved specification.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { run, configs, time, date, clip, near } = require('../m02-current-rules/calculate.cjs');
const root = path.resolve(__dirname, '../..');
const variants = [
  { id: 'current', options: {} },
  { id: 'draft_2', options: { slowWageRecovery: true, recoveryPoints: 2 } },
  { id: 'recommended_3', options: { slowWageRecovery: true, recoveryPoints: 3 } },
];
const at = (r, d) => r.rows.find(x => x.date === d);
const nextGate = row => row ? date(row.time + 1) : null;
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

// Same configs, dates, finance, synthetic population and two exposure assumptions.
const runs = variants.flatMap(v => configs.flatMap(c => [0, 1].map(exposure => ({
  variant: v.id, ...run(c, exposure, v.options),
}))));

// Regression against the saved first analysis, every pre-existing field and month.
const csv = fs.readFileSync(path.join(root, 'analysis/m02-current-rules/monthly.csv'), 'utf8').trim().split('\n');
const columns = csv.shift().split(',');
for (const line of csv) {
  const expected = Object.fromEntries(line.split(',').map((v, i) => [columns[i], v]));
  const actual = runs.find(r => r.variant === 'current' && r.config.id === expected.run && r.exposureMode === +expected.exposureMode)
    .rows.find(r => r.date === expected.date);
  for (const [key, value] of Object.entries(expected)) {
    if (typeof actual[key] === 'number') near(actual[key], +value, `baseline ${expected.run} ${expected.date} ${key}`);
    else assert.equal(String(actual[key]), value, `baseline ${key}`);
  }
}

function limitedAllowed(grievance, rejectedDemand, caseResolved) {
  return !caseResolved && (grievance >= 50 || rejectedDemand);
}
assert.equal(limitedAllowed(49, true, false), true);
assert.equal(limitedAllowed(49, false, false), false);
assert.equal(limitedAllowed(75, true, true), false);

function summarize(r) {
  const firstLimited50 = r.rows.find(x => x.grievance_employedWorkers >= 50);
  // Existing wage-demand case, explicitly rejected or still without an accepted settlement.
  // All these test fixtures supply no settlement. This is eligibility, NOT an automatic strike.
  const firstLimitedOrDemand = r.rows.find(x => limitedAllowed(x.grievance_employedWorkers, x.wageDemand, false));
  return {
    id: r.config.id, variant: r.variant, exposureMode: r.exposureMode,
    zloty: r.firstZloty && date(r.firstZloty),
    limitedThreshold50: nextGate(firstLimited50),
    limitedThreshold50orUnsettledDemand: nextGate(firstLimitedOrDemand),
    generalThreshold60: r.firstStrikeGate && date(r.firstStrikeGate),
    firstUncontrolledGate: r.firstUncontrolledGate && date(r.firstUncontrolledGate),
    firstWage95: r.rows.find(x => x.time > time('1924-03') && x.wage >= 95)?.date ?? null,
    minBudget: Math.min(...r.rows.map(x => x.budget)),
    checkpoints: ['1923-11', '1924-12', '1926-05', '1928-01'].map(d => at(r, d)),
  };
}

// Priority comparison holds the same synthetic authority and accepted packages.
// Two finite plans, not a forced historical cabinet sequence.
const landFirst = { id: 'priority_land_first', label: 'Ziemia przed walutą', launch: '1923-07', variant: 'rapid', landLaunch: '1923-05' };
const currencyFirst = { id: 'priority_currency_first', label: 'Waluta przed ziemią', launch: 'earliest', variant: 'rapid', landLaunch: '1923-07' };
const priorityRuns = variants.filter(v => v.id !== 'draft_2').flatMap(v => [landFirst, currencyFirst].map(c => ({ variant: v.id, ...run(c, 0, v.options) })));
for (const r of priorityRuns) {
  assert.equal(r.firstZloty, time(r.config.id === landFirst.id ? '1923-10' : '1923-08'));
  assert.ok(r.rows.every(x => x.cabinetInitiatives <= 1));
  assert.deepEqual(r.events.filter(e => e.kind === 'cabinet_input').slice(0, 4).map(e => e.date), ['1923-04', '1923-05', '1923-06', '1923-07']);
}

// Proposed pressure: unresolved named military case +2/M (not per case), civil
// agreement reward -2 on its first actual fulfilment, no perpetual -2/-3 discounts.
// Keep existing one-off concessions, broken-agreement impulse and Chjeno return.
function pressureStep(p, input, proposed, seen) {
  const newlyFulfilled = (input.fulfilledIds ?? []).filter(id => !seen.has(id));
  for (const id of newlyFulfilled) seen.add(id);
  let delta = 3 * !!input.noCabinet + 2 * (input.authority < 40) + 2 * (input.grievance >= 60)
    + (input.personalImpulse ?? 0) + (input.chjenoImpulse ?? 0) - (input.oneOffConcession ?? 0);
  delta += proposed
    ? 2 * !!input.unresolvedMilitaryCase - 2 * (newlyFulfilled.length > 0)
    : -2 * !!input.executingCivilAgreement - 3 * !!input.executingCompromise;
  return clip(p + delta, 0, 100);
}

function politics(r, proposed, fixture) {
  let pressure = 10;
  const seen = new Set(), rows = [];
  for (const econ of r.rows) {
    const t = econ.time;
    const militaryOpened = fixture !== 'quiet' && t >= time('1925-01');
    const resolved = fixture === 'compromise' && t >= time('1925-06');
    const input = {
      authority: 55, grievance: econ.grievance_national, noCabinet: false,
      unresolvedMilitaryCase: militaryOpened && !resolved,
      executingCivilAgreement: t >= time('1925-01'),
      // Same ID on repeated checks: only the first execution can earn the proposed reward.
      fulfilledIds: t >= time('1925-01') ? ['civil_commitment_1'] : [],
      executingCompromise: resolved && t < time('1925-12'),
      oneOffConcession: fixture === 'compromise' && t === time('1925-06') ? 12 : 0,
      personalImpulse: fixture === 'unresolved' && t === time('1926-04') ? 8 : 0,
      chjenoImpulse: fixture !== 'quiet' && t === time('1926-05') ? 20 : 0,
    };
    pressure = pressureStep(pressure, input, proposed, seen);
    rows.push({ date: econ.date, pressure, ...input });
    // Stop at eligibility rather than simulating through a possible coup to elections.
    if (t >= time('1926-03') && pressure >= 65) break;
  }
  return { economicRun: r.config.id, economicVariant: r.variant, pressureRule: proposed ? 'proposed' : 'current', fixture,
    stopsAt: rows.at(-1).pressure >= 65 ? 'pressure_gate_only' : 'pre_election_boundary', rows };
}
const politicalComparisons = ['current', 'recommended_3'].flatMap(variant => {
  const r = runs.find(r => r.config.id === 'R3' && r.exposureMode === 0 && r.variant === variant);
  return [false, true].flatMap(proposed => ['quiet', 'unresolved', 'compromise'].map(fixture => politics(r, proposed, fixture)));
});
const pressureTests = [];
for (const proposed of [false, true]) {
  let p = 50;
  const seen = new Set(), values = [];
  for (let i = 0; i < 6; i++) {
    p = pressureStep(p, { authority: 55, grievance: 35, executingCivilAgreement: true,
      executingCompromise: true, oneOffConcession: i === 0 ? 12 : 0,
      fulfilledIds: ['separate_civil_agreement'] }, proposed, seen);
    values.push(p);
  }
  pressureTests.push({ proposed, start: 50, values });
}
assert.equal(pressureTests[0].values.at(-1), 8);
assert.equal(pressureTests[1].values.at(-1), 36);
const findPolitics = (rule, fixture) => politicalComparisons.find(r => r.economicVariant === 'recommended_3' && r.pressureRule === rule && r.fixture === fixture);
assert.equal(findPolitics('current', 'unresolved').rows.find(x => x.date === '1926-05').pressure, 24);
assert.equal(findPolitics('proposed', 'unresolved').rows.at(-1).pressure, 70);
assert.equal(findPolitics('proposed', 'compromise').rows.find(x => x.date === '1926-05').pressure, 26);
assert.equal(findPolitics('proposed', 'quiet').rows.at(-1).pressure, 8);

// Finite resignation rule, a review proposal. It selects no successor and gives
// PPS no veto beyond actual votes. One revised essential offer at the next review.
function cabinetStep(state, event) {
  if (state === 'resigned') return state;
  if (event === 'legal_dismissal') return 'resigned';
  if (event === 'pps_withdrawal_only' || event === 'optional_rejected') return state;
  if (event === 'essential_accepted') return 'operating';
  if (event === 'essential_rejected') return state === 'revision_pending' ? 'resigned' : 'revision_pending';
  if (event === 'no_feasible_revision' && state === 'revision_pending') return 'resigned';
  throw new Error(`Invalid transition ${state}/${event}`);
}
const resignationCases = [
  ['PPS wychodzi, bez utraty zdolności działania', ['pps_withdrawal_only'], 'operating'],
  ['Odrzucona opcjonalna inwestycja', ['optional_rejected'], 'operating'],
  ['Pakiet konieczny odrzucony; poprawiony przyjęty', ['essential_rejected', 'essential_accepted'], 'operating'],
  ['Pakiet konieczny odrzucony; poprawiony też odrzucony', ['essential_rejected', 'essential_rejected'], 'resigned'],
  ['Brak legalnej i finansowej alternatywy', ['essential_rejected', 'no_feasible_revision'], 'resigned'],
  ['Skuteczne legalne żądanie ustąpienia', ['legal_dismissal'], 'resigned'],
].map(([label, events, expected]) => {
  let state = 'operating';
  const trace = events.map(event => ({ event, state: state = cabinetStep(state, event) }));
  assert.equal(state, expected);
  return { label, trace };
});

// Recovery and eligibility invariants.
for (const r of runs.filter(r => r.variant !== 'current')) {
  const cap = r.variant === 'draft_2' ? 2 : 3;
  for (let i = 0; i < r.rows.length; i++) {
    const row = r.rows[i], previous = i ? r.rows[i - 1] : { wage: 100, credit: 55, inflation: 4 };
    assert.ok(row.wage <= 100 + 1e-9);
    assert.ok(row.wage - previous.wage <= cap + 1e-9);
    if (row.wage > previous.wage) assert.ok(row.inflation <= 5 && previous.credit >= 45 && row.inflation <= previous.inflation);
  }
}
const late = runs.find(r => r.variant === 'recommended_3' && r.config.id === 'R3' && r.exposureMode === 0);
assert.equal(summarize(late).limitedThreshold50, '1924-01');
assert.equal(summarize(late).limitedThreshold50orUnsettledDemand, '1923-11');
assert.equal(summarize(late).generalThreshold60, '1924-11');

const sourceFiles = ['docs/POLISH_TECHNICAL_REFERENCE.md', 'docs/POLISH_DESCRIPTIVE_GUIDE.md',
  'analysis/m02-current-rules/monthly.csv', 'analysis/m02-current-rules/calculate.cjs'];
const output = {
  status: 'comparison_only_not_approved_rules', date: '2026-09-21',
  sourceHashes: Object.fromEntries(sourceFiles.map(file => [file, hash(file)])),
  method: 'Paired conditional runs; only specified options change. Political cases and approvals are supplied inputs, not generated historical outcomes. Same social uncertainties as the first report.',
  summaries: runs.map(summarize),
  priorityComparisons: priorityRuns.map(r => ({ ...summarize(r), events: r.events })),
  politicalComparisons, pressureTests, resignationCases,
};
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(output, null, 2) + '\n');
const keys = ['variant', 'run', 'exposureMode', 'date', 'inflation', 'wage', 'output', 'credit', 'unemployment', 'budget',
  'coverage', 'grievance_employedWorkers', 'grievance_national', 'wageDemand'];
const rows = runs.flatMap(r => r.rows.map(row => ({ ...row, variant: r.variant })));
fs.writeFileSync(path.join(__dirname, 'monthly.csv'), [keys.join(','), ...rows.map(row => keys.map(k => row[k]).join(','))].join('\n') + '\n');
console.log('PASS: baseline matches 1022 saved monthly rows; 42 paired runs; 4 additional priority runs; pressure/resignation/recovery checks.');
console.table(output.summaries.filter(r => r.exposureMode === 0 && ['R1', 'R3', 'R5'].includes(r.id)).map(r => {
  const p = r.checkpoints.find(x => x.date === '1926-05');
  return { id: r.id, rule: r.variant, wage: p.wage.toFixed(2), unemployment: p.unemployment.toFixed(2),
    proposedLimitedGate: r.limitedThreshold50orUnsettledDemand, general60: r.generalThreshold60 };
}));
