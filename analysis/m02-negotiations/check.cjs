#!/usr/bin/env node
'use strict';
// Isolated offer calculations. Does not replace campaign scheduling or Dendry.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const clip = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const sum = xs => xs.reduce((a, b) => a + b, 0);
const ideals = { piast: { fiscal: 0, land: 0 }, npr: { fiscal: 0, land: 0 },
  pschd: { fiscal: -1, land: -1 }, zln: { fiscal: -1, land: -1 },
  grabski: { fiscal: 1 }, grabski_neutral_fiscal: { fiscal: 0 },
  skrzynski: { fiscal: 0 } }; // Candidate profiles: P, NOT historical data.
function fit(actor, programme) {
  const topics = Object.keys(programme);
  assert.ok(topics.length, 'empty programme');
  for (const topic of topics) {
    assert.ok(Number.isFinite(ideals[actor]?.[topic]), `missing ideal: ${actor}/${topic}`);
    assert.ok(programme[topic] >= -2 && programme[topic] <= 2);
  }
  return 100 * (1 - sum(topics.map(t => Math.abs(programme[t] - ideals[actor][t]))) / (4 * topics.length));
}
function base(input) {
  for (const key of ['relation', 'credibility']) assert.ok(Number.isFinite(input[key]), `missing ${key}`);
  assert.ok(Array.isArray(input.demands), 'missing demands profile');
  const weight = sum(input.demands.map(d => {
    assert.ok(d.weight >= 1 && d.weight <= 3 && typeof d.met === 'boolean');
    return d.weight;
  }));
  const portfolioFit = weight ? 100 * sum(input.demands.filter(d => d.met).map(d => d.weight)) / weight : 100;
  const programFit = fit(input.actor, input.programme);
  const breachPenalty = Math.min(30, 5 * (input.breaches ?? 0));
  return { programFit, portfolioFit, breachPenalty,
    base: .25 * input.relation + .35 * programFit + .2 * portfolioFit + .1 * input.credibility - breachPenalty };
}
function evaluate(input) {
  const b = base(input);
  assert.ok(Array.isArray(input.alternatives), 'explicit alternatives required');
  const alternatives = input.alternatives.map(a => ({ id: a.id, hardFeasible: a.hardFeasible, ...base(a) }));
  const bestAlternativeScore = Math.max(0, ...alternatives.filter(a => a.hardFeasible).map(a => clip(a.base, 0, 90) / 90 * 100));
  const need = input.mode === 'persuade' ? 0 : clip(100 - bestAlternativeScore + (input.crisisCooperation ?? 0), 0, 100);
  const score = clip(b.base + .1 * need + (input.advisorBonus ?? 0), 0, 100);
  const failedGates = Object.entries(input.gates).filter(([, pass]) => !pass).map(([key]) => key);
  return { ...b, bestAlternativeScore, need, score, failedGates,
    accepted: !failedGates.length && score >= 60, alternatives };
}
const demands = (met = true) => [{ id: 'specified_portfolio_or_execution', weight: 1, met }];
const offer = (actor, relation, programme, extra = {}) => ({ actor, relation, programme, credibility: 50,
  demands: demands(), alternatives: [], gates: { legalProgramme: true }, ...extra });
// A named available offer is a planning alternative, not an already appointed government.
// Witos is proposed by Piast: Piast does not negotiate with itself. PSChD and ZLN
// use their relations with Piast (60), never their relations with PPS (46/5/25).
const witosAlternative = actor => offer(actor, 60, { fiscal: -1, land: 0 },
  { id: 'prepared_witos', hardFeasible: true });
const expertAlternative = actor => offer(actor, 50, { fiscal: 0 },
  { id: 'expert_continuation', hardFeasible: true });
const alternativesFor = actor => actor === 'zln' || actor === 'pschd' ? [witosAlternative(actor)] : [expertAlternative(actor)];
const reports = [];
function record(id, label, input) {
  const result = evaluate(input);
  reports.push({ id, label, input, result });
  return result;
}

// 1. PPS's terms to Grabski, not an invented new election/appointment.
// Actual tax-funded benefit forecast from the archived replay (B/C, Dec 1923).
const prior = JSON.parse(fs.readFileSync(path.join(root, 'analysis/m02-revision-13/results.json')));
const forecast = prior.runs.find(r => r.config.id === 'B').events.find(e => e.date === '1923-12' && /osłony 2 B/.test(e.message)).forecast;
const g = offer('grabski', 50, { fiscal: 2 }, { alternatives: [expertAlternative('grabski')],
  // At the December offer: one actual cabinet fall, currency crisis, grievance <60.
  crisisCooperation: 15,
  gates: { apparatus2: true, unionReach40: true, directRelation40: true,
    candidateMandate: true, fullFunding: forecast >= -2 } });
record('grabski_prepared', 'Grabski: osłony i podatek majątkowy, przygotowane PPS', g);
record('grabski_unprepared', 'Grabski: ta sama oferta bez organizacji', { ...g,
  gates: { ...g.gates, apparatus2: false, unionReach40: false } });
record('grabski_no_funding', 'Grabski: brak wykonalnego finansowania', { ...g, gates: { ...g.gates, fullFunding: false } });
record('grabski_expired_crisis', 'Grabski: ta sama oferta po ustaniu premii kryzysowej', { ...g, crisisCooperation: 0 });
record('grabski_neutral_profile', 'Grabski: wrażliwość na ideał fiscal=0 zamiast +1', { ...g,
  actor: 'grabski_neutral_fiscal', alternatives: [expertAlternative('grabski_neutral_fiscal')] });
// Candidate acceptance does not authorize taxes. Show the separate parliamentary
// obstacle using the same formula and explicit neutral candidate-party relations.
for (const actor of ['piast', 'npr', 'pschd']) record(`tax_${actor}`, `Głos finansowy: ${actor}, fiscal=+2`,
  offer(actor, 50, { fiscal: 2 }, { alternatives: [expertAlternative(actor)] }));

// 2. Broad coalition: initial profiles cannot allocate labor twice.
const ministries = { labor: 'pps', agriculture: 'piast', economic: 'npr', justice: 'pschd', finance: 'zln' };
assert.equal(Object.keys(ministries).length, 5);
const skrzynski = record('skrzynski_candidate', 'Skrzyński: przyjęcie kandydatury z pełnym minimum',
  offer('skrzynski', 50, { fiscal: 0 }, { alternatives: [expertAlternative('skrzynski')],
    gates: { ppsJoins: true, creditCrisis: true, fundedMinimum: true } }));
function broad(run, { fallback = false, bonus = 0, zlnContacts = 0, noAlternative = false } = {}) {
  const relations = { piast: 53, npr: 54, pschd: 46, zln: (run === 'C' ? 25 : 5) + 4 * zlnContacts };
  return Object.keys(relations).map(actor => {
    const ministryOK = actor !== 'npr' || fallback;
    return record(`broad_${run}_${fallback}_${bonus}_${zlnContacts}_${noAlternative}_${actor}`,
      `Skrzyński ${run}: ${actor}; NPR economic=${fallback}, doradca=${bonus}, kontakty ZLN=${zlnContacts}, brak alternatywy=${noAlternative}`,
      offer(actor, relations[actor], { fiscal: 0 }, { demands: demands(ministryOK),
        advisorBonus: bonus, alternatives: noAlternative ? [] : alternativesFor(actor),
        // Credit crisis opens talks; the existing formula gives NO crisis points
        // here: no recent fall, no currency crisis and national grievance <60.
        crisisCooperation: 0, gates: { creditCrisis: true, minimumProgramme: true,
          noRedLine: true, ownMinistry: ministryOK, finance: true } }));
  });
}
const originalC = broad('C');
const originalH = broad('H');
const correctedC = broad('C', { fallback: true });
const correctedH = broad('H', { fallback: true });
const preparedC = broad('C', { fallback: true, zlnContacts: 1 });
const preparedH = broad('H', { fallback: true, bonus: 5, zlnContacts: 1 });
const noAlternativeH = broad('H', { fallback: true, noAlternative: true });

// 3. Existing coalition; bargaining and mere persuasion have different need.
// Initial advisor bonus has been consumed and cannot be reused for a review.
const compromiseResults = [];
for (const [run, zlnRelation, mode] of [['C', 25, 'bargain'], ['C+kontakt', 29, 'bargain'],
  ['C', 25, 'persuade'], ['C+3kontakty', 37, 'persuade'], ['H', 5, 'bargain']]) {
  for (const actor of ['piast', 'npr', 'pschd', 'zln']) {
    const relations = { piast: 53, npr: 54, pschd: 46, zln: zlnRelation };
    compromiseResults.push(record(`keep_${run}_${mode}_${actor}`, `Osłony ${run}, ${mode}: ${actor}`,
      offer(actor, relations[actor], { fiscal: 0 }, { mode, alternatives: alternativesFor(actor),
        gates: { relationGate: zlnRelation >= 25 && relations.pschd >= 45,
          finance: true, legalContinuation: true } })));
  }
}

// 4. A concrete autonomous Piast offer; its initiation is a supplied event,
// whereas PSChD/ZLN consent and the resulting majority are calculated.
const witos = ['pschd', 'zln'].map(actor => record(`witos_${actor}`, `Witos: ${actor}`,
  offer(actor, 60, { fiscal: -1, land: 0 }, {
    alternatives: [expertAlternative(actor)],
    gates: { candidateAvailable: true, legalProgramme: true, ownMinistry: true, noRedLine: true } })));
const seats = { piast: 70, pschd: 60, zln: 100 };
const yes = seats.piast + sum(witos.map((r, i) => r.accepted ? seats[['pschd', 'zln'][i]] : 0));
const vote = { yes, no: 444 - yes, passes: yes > 444 - yes,
  condition: 'Piast submits the offer; accepted partners commit to the replacement vote; all other MPs oppose.' };
const lostTen = { yes: yes - 10, no: 444 - yes + 10, passes: yes - 10 > 444 - yes + 10 };

// Meaningful boundary checks; no expected automatic consent.
assert.equal(reports.find(r => r.id === 'grabski_prepared').result.accepted, true);
assert.equal(reports.find(r => r.id === 'grabski_unprepared').result.accepted, false);
assert.ok(reports.filter(r => r.id.startsWith('tax_')).every(r => !r.result.accepted));
assert.ok(!originalC.every(r => r.accepted) && !originalH.every(r => r.accepted));
assert.ok(!correctedC.every(r => r.accepted) && !correctedH.every(r => r.accepted));
assert.ok(preparedC.every(r => r.accepted) && preparedH.every(r => r.accepted));
assert.ok(skrzynski.accepted);
assert.ok(noAlternativeH.every(r => r.accepted));
assert.ok(witos.every(r => r.accepted) && vote.passes && !lostTen.passes);
assert.ok(compromiseResults.slice(4, 8).every(r => r.accepted));
assert.ok(!compromiseResults.slice(8, 12).every(r => r.accepted));
assert.ok(compromiseResults.slice(12, 16).every(r => r.accepted));
assert.throws(() => base({ ...g, demands: undefined }), /missing demands/);
assert.throws(() => fit('missing', { fiscal: 0 }), /missing ideal/);
assert.throws(() => fit('grabski', {}), /empty programme/);
const altWithBonus = { ...g, advisorBonus: 5, id: 'test', hardFeasible: true };
assert.equal(evaluate({ ...g, alternatives: [altWithBonus] }).bestAlternativeScore,
  evaluate({ ...g, alternatives: [{ ...altWithBonus, advisorBonus: 0 }] }).bestAlternativeScore);
assert.equal(evaluate({ ...g, alternatives: [{ ...altWithBonus, hardFeasible: false }] }).bestAlternativeScore, 0);

const sources = ['docs/POLISH_TECHNICAL_REFERENCE.md', 'docs/POLISH_DESCRIPTIVE_GUIDE.md',
  'analysis/m02-revision-13/results.json', 'analysis/m02-revision-13/monthly.csv'];
const hashes = Object.fromEntries(sources.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
const output = { scope: 'M02 step 1: isolated consent calculations; NOT an integrated campaign', hashes,
  assumptions: [
    'Programme fiscal=0 is the narrow financed broad-government minimum; fiscal=+2 is the PPS wealth-burden package; Witos offers fiscal=-1 and compensated land=0.',
    'Grabski fiscal ideal +1, direct PPS relation 50 and a solvent legal stabilization mandate are explicit new synthetic P inputs. His availability/contact does not use PPS-Piast relations. A separate fiscal=0 sensitivity case shows dependence on this missing profile.',
    'Skrzynski fiscal ideal 0 and neutral direct relation 50 are P; his mandate requires PPS participation and the funded broad minimum. Appointment still needs all party consents.',
    'Credibility is held at 50, breaches at zero. Earlier replays do not supply a partner-specific reputation ledger. No free +3 for every cabinet project.',
    'The NPR economic fallback requires full welfare and independent unions, and is a new P offer profile, not another ministry.',
    'Other governments and a prepared Witos offer are explicit available alternatives; they need hard political availability, programme, offices and potential votes. Their base scores are not supplied accept=true flags.',
    'The Witos initiative and willingness of Piast to propose its own programme are context inputs, just as PPS choosing to submit its own offer. Scheduling that initiative is step 2.',
    'Grabski programme acceptance does not establish a tax majority; separate financier and legal consent remain necessary. Test shows refusals of three crucial tax voters.',
    'Finance and institutional authority for already authorized broad-cabinet policies are controlled preconditions. This calculation does not invent a Senate vote or private lender approval.',
    'Prepared C/H add player actions to the earlier plans; they are counterfactual offer checks, not replays of the old action schedules. Advisor eligibility, pinning and cooldown still apply.',
    'Review calculations use archived April states conditionally on a coalition having formed; earlier rows cannot remain a proven campaign after a failed November offer.',
  ], forecast, ministries, reports, vote, lostTen };
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(output, null, 2) + '\n');
const table = ['| Przypadek | Program | Urzędy/wykonanie | Alternatywa | Potrzeba | Wynik | Zgoda |',
  '|---|---:|---:|---:|---:|---:|---|',
  ...reports.map(r => { const v = r.result; return `| ${r.label} | ${v.programFit.toFixed(2)} | ${v.portfolioFit.toFixed(2)} | ${v.bestAlternativeScore.toFixed(2)} | ${v.need.toFixed(2)} | ${v.score.toFixed(2)} | ${v.accepted ? 'tak' : 'nie'}${v.failedGates.length ? ': ' + v.failedGates.join(', ') : ''} |`; })];
fs.writeFileSync(path.join(__dirname, 'SCORES.md'), '# Obliczone oceny ofert M02\n\nWygenerowane przez `check.cjs`. Założenia i ograniczenia: [REPORT.md](REPORT.md).\n\n' + table.join('\n') + '\n');
console.log(`PASS: ${reports.length} explicit offer evaluations; missing-profile, alternative, adviser and majority boundaries checked.`);
for (const id of ['grabski_prepared', 'tax_piast', 'tax_pschd', 'broad_C_true_0_0_false_zln',
  'broad_H_true_0_0_false_zln', 'broad_H_true_5_1_false_zln', 'keep_C_bargain_zln',
  'keep_C+kontakt_bargain_zln', 'keep_C_persuade_zln', 'witos_zln']) {
  const r = reports.find(r => r.id === id); console.log(id, r.result.score.toFixed(4), r.result.accepted);
}
console.log('Replacement vote:', vote, 'With ten missing Piast MPs:', lostTen);
