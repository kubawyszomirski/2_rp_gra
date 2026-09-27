#!/usr/bin/env node
'use strict';
// Diagnostic specification checks, not Dendry gameplay.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { replay, scenarios } = require('../m02-four-runs/replay.cjs');
const root = path.resolve(__dirname, '../..');
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

// The previous report remains reproducible despite the new optional rules.
const csv = fs.readFileSync(path.join(__dirname, '../m02-four-runs/monthly.csv'), 'utf8').trim().split('\n');
const keys = csv.shift().split(',');
const originalRows = csv.map(line => Object.fromEntries(line.split(',').map((v, i) => [keys[i], v])));
const old = scenarios.map(c => replay(c));
for (const row of old.flatMap(r => r.rows)) {
  const saved = originalRows.find(x => x.run === row.run && x.date === row.date);
  assert.ok(saved);
  for (const key of keys) typeof row[key] === 'number' ? close(row[key], Number(saved[key])) : assert.equal(String(row[key]), saved[key]);
}
assert.equal(originalRows.length, 281);

const runs = scenarios.map(c => replay(c, { revision13: true }));
const additional = [
  replay(scenarios[2], { revision13: true, broadResponse: 'accept_cuts' }),
  replay(scenarios[3], { revision13: true, rightFormsReplacement: false }),
  replay(scenarios[2], { revision13: true, rightAcceptsCompromise: false, rightFormsReplacement: false }),
];
for (const r of [...runs, ...additional]) {
  assert.ok(r.rows.every(x => x.cash >= 0 && x.railFund >= 0 && x.governmentInitiatives <= 1));
  assert.ok(r.events.filter(e => e.kind === 'settlement_relief').length <= 1);
  assert.ok(r.events.filter(e => e.kind === 'austerity_offer').length <= 1);
  assert.ok(r.events.filter(e => e.kind === 'chjeno_impulse').length <= 1);
  assert.equal(r.projects.filter(p => p.kind === 'currency').length, 1);
  const offers = r.events.filter(e => ['settlement_offer', 'political_offer_refused'].includes(e.kind));
  assert.equal(new Set(offers.map(e => e.time)).size, offers.length);
  const coup = r.events.find(e => e.kind === 'coup');
  if (coup) assert.ok(coup.rounds.length >= 3 && coup.rounds.length <= 4);
}
const at = (r, d) => r.rows.find(x => x.date === d);
assert.equal(at(runs[3], '1925-11').cabinet, 'Skrzyński');
assert.equal(at(runs[3], '1926-04').cabinet, 'Skrzyński');
assert.equal(at(runs[3], '1926-04').ppsMode, 'opposition');
assert.equal(at(runs[3], '1926-05').cabinet, 'Chjeno-Piast 1926');
assert.ok(runs[3].events.some(e => e.kind === 'political_strike_goal'));
assert.ok(!runs[3].blocked.some(e => /progu 60|gabinetu zablokowana/.test(e.message)));
assert.equal(at(runs[2], '1926-05').ppsMode, 'member');
assert.ok(runs[2].events.some(e => e.kind === 'austerity_compromise'));
close(at(old[1], '1924-03').workerGrievance - at(runs[1], '1924-03').workerGrievance, 3.2);
assert.ok(at(additional[0], '1926-05').budget > at(runs[2], '1926-05').budget);
assert.ok(at(additional[0], '1926-05').unemployedGrievance > at(runs[2], '1926-05').unemployedGrievance);
assert.equal(at(additional[1], '1926-05').cabinet, 'Skrzyński');
assert.equal(at(additional[1], '1926-05').ppsMode, 'opposition');
assert.ok(!additional[1].events.some(e => e.kind === 'chjeno_impulse'));
assert.equal(at(additional[2], '1926-05').ppsMode, 'opposition');

// Fixed, disclosed loyalties isolate the timing of enemy rail reinforcements.
const forceSides = { capital_legal: 'legal', capital_pils: 'pils', near: 'pils', remote: 'legal' };
const railCases = [];
for (const revision13 of [false, true]) for (const noCoupRail of [false, true]) {
  const r = replay(scenarios[3], { revision13, noCoupRail, forceSides });
  railCases.push({ revision13, rail: !noCoupRail, endpoint: r.endpoint, coup: r.events.find(e => e.kind === 'coup') });
}
assert.equal(railCases[0].endpoint.outcome, railCases[1].endpoint.outcome);
assert.equal(railCases[2].endpoint.outcome, 'pils_victory');
assert.equal(railCases[3].endpoint.outcome, 'prolonged_conflict');

// Isolated Grabski offer cases: a concrete tax amendment cannot cure absent
// legal powers or an unwilling executor. These do not simulate his successor.
function creditOfferCase(input) {
  const firstFeasible = input.executor && input.legal && input.budgetAfterProject >= -2;
  if (firstFeasible && input.initialConsent) return { result: 'accepted', revisedOffers: 0, budget: input.budgetAfterProject };
  const revisedBudget = input.budgetAfterProject + (input.wealthAlreadyActive ? 0 : 2);
  const revisedFeasible = input.executor && input.legal && !input.wealthAlreadyActive && revisedBudget >= -2;
  if (!revisedFeasible) return { result: 'resigned', revisedOffers: 0, reason: 'no_feasible_amendment' };
  return { result: input.revisedConsent ? 'accepted' : 'resigned', revisedOffers: 1, budget: revisedBudget };
}
const creditCases = [
  { name: 'Existing budget and consent', input: { budgetAfterProject: -1, initialConsent: true, revisedConsent: false, executor: true, legal: true } },
  { name: 'Wealth tax repairs missing funding', input: { budgetAfterProject: -3, initialConsent: false, revisedConsent: true, executor: true, legal: true } },
  { name: 'Both offers refused', input: { budgetAfterProject: -1, initialConsent: false, revisedConsent: false, executor: true, legal: true } },
  { name: 'Tax cannot replace unwilling executor', input: { budgetAfterProject: -1, initialConsent: false, revisedConsent: true, executor: false, legal: true } },
  { name: 'Active tax cannot be duplicated', input: { budgetAfterProject: -3, initialConsent: false, revisedConsent: true, executor: true, legal: true, wealthAlreadyActive: true } },
].map(c => ({ ...c, outcome: creditOfferCase(c.input) }));
assert.deepEqual(creditCases.map(c => c.outcome.result), ['accepted', 'accepted', 'resigned', 'resigned', 'resigned']);
close(creditCases[1].outcome.budget, -1);

const referenceFiles = ['docs/POLISH_TECHNICAL_REFERENCE.md', 'docs/POLISH_DESCRIPTIVE_GUIDE.md'];
const hashes = Object.fromEntries(referenceFiles.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
const summarize = r => ({ config: r.config, options: r.options, endpoint: r.endpoint, may1926: at(r, '1926-05'),
  projects: r.projects, events: r.events, blocked: r.blocked });
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({ hashes,
  assumptions: [
    'Same controlled mandates, consent fixtures, cohort mixing and random seed as the earlier four-run report.',
    'New broad-coalition minimum includes the existing full benefit or a feasible accepted new benefit; no duplication.',
    'The right proposes cuts at the first six-month review during the active credit crisis. Its declared willingness to retain or replace Skrzynski is supplied; actual ballots are checked.',
    'The right majority refuses the 1923 resignation demand; PPS switches to an economic offer next round. Political faction effects are not a fully simulated party campaign.',
    'The original random draw sends the remote reserve to Pilsudski. A separate fixed-side test, explicitly labelled, isolates enemy transport.',
    'Grabski refusal cases are isolated agreement checks, not full campaigns after his resignation.',
  ], runs: runs.map(summarize), additional: additional.map(summarize), railCases, creditCases }, null, 2) + '\n');
const monthly = runs.flatMap(r => r.rows), outKeys = Object.keys(monthly[0]);
fs.writeFileSync(path.join(__dirname, 'monthly.csv'), [outKeys.join(','), ...monthly.map(r => outKeys.map(k => r[k]).join(','))].join('\n') + '\n');
console.log(`PASS: ${originalRows.length} old rows unchanged; ${monthly.length} revised months; coalition, settlement, cuts, departure, transport and 5 Grabski offer cases.`);
for (const r of runs) console.log(r.config.id, r.endpoint.date, r.endpoint.outcome ?? r.endpoint.kind, 'May pressure:', at(r, '1926-05').pressure);
