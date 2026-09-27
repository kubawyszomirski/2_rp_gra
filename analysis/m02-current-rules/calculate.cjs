#!/usr/bin/env node
'use strict';

// Diagnostic replay of the approved specification, NOT a gameplay implementation.
// Run: node analysis/m02-current-rules/calculate.cjs
// Policy approvals below are explicit test inputs, not computed parliamentary votes.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const reference = 'docs/POLISH_TECHNICAL_REFERENCE.md';
const clip = (x, a, b) => Math.min(b, Math.max(a, x));
const pos = x => Math.max(0, x);
const timeOf = (y, m) => 12 * (y - 1922) + m;
const time = date => { const [y, m] = date.split('-').map(Number); return timeOf(y, m); };
const date = t => `${1922 + Math.floor((t - 1) / 12)}-${String(1 + (t - 1) % 12).padStart(2, '0')}`;
const delivery = b => b >= -2 ? 1 : b >= -5 ? 0.5 : 0;
const near = (a, b, label) => assert.ok(Math.abs(a - b) < 1e-9, `${label}: ${a} != ${b}`);

// §17.16.2: non-overlapping marka stages, independent non-monetary shocks.
function shocks(t, zloty) {
  return {
    monetary: zloty ? 0 : t <= 6 ? 8 : t <= 12 ? 15 : t <= 18 ? 30 : t <= 21 ? 60 : 120,
    agrarian: t >= time('1924-09') && t < time('1925-03') ? 1 : 0,
    credit: t >= time('1925-06') && t < time('1926-01') ? 12
      : t >= time('1926-01') && t < time('1926-07') ? 6 : 0,
    output: t >= time('1925-06') && t < time('1926-01') ? -0.4
      : t >= time('1926-01') && t < time('1926-07') ? -0.2
      : t >= time('1926-07') && t < time('1927-07') ? 0.3 : 0,
  };
}

// §11.4–11.6. All inputs are the beginning-of-month snapshot.
function economyStep(old, input, options = {}) {
  const inflation = clip(0.7 * old.inflation + 0.3 * input.monetary, -10, 1000);
  const indexedWage = old.wage * (1 + clip(old.inflation, -10, 1000) / 100) / (1 + inflation / 100);
  let wage = indexedWage;
  // Optional comparison only. Default remains the approved 0.12 formula.
  if (options.slowWageRecovery) {
    wage = Math.min(old.wage, indexedWage);
    if (inflation <= 5 && old.credit >= 45 && inflation <= old.inflation) {
      wage += Math.min(options.recoveryPoints ?? 2, Math.max(0, 100 - wage));
    }
  }
  // Optional explicit settlement effects for the four-run replay; zero in earlier fixtures.
  const wagePP = clip(old.inflation + (input.wageAgreementPP ?? 0), -10, 1000) - clip(old.inflation, -10, 1000);
  wage += old.wage * wagePP / (100 + inflation);
  const capitalReaction = input.capitalReaction ?? 0;
  const creditTarget = clip(55 - 0.1 * pos(old.inflation) - 10 * capitalReaction + input.creditSupport - input.creditShock, 0, 100);
  const credit = 0.7 * old.credit + 0.3 * creditTarget;
  const privateGrowth = clip(0.015 * (old.credit - 55) + 0.008 * clip(old.wage - 100, -50, 50)
    - 0.5 * capitalReaction - 0.03 * (input.strikeDisruption ?? 0) + input.outputShock, -8, 6);
  const output = Math.max(1, old.output * (1 + (privateGrowth + 0.15 * input.worksUnits) / 100));
  const marketUnemployment = clip(old.marketUnemployment - 0.35 * privateGrowth, 0, 100);
  const unemployment = clip(marketUnemployment - 0.25 * input.worksUnits, 0, 100);
  const agrarian = clip(old.agrarian + 0.03 * (50 - old.credit) + input.agrarianShock - 3 * (input.landUnits ?? 0), 0, 100);
  return { inflation, wage, credit, output, marketUnemployment, unemployment, agrarian, privateGrowth, creditTarget };
}

// §5.1 synthetic population. Identity groups have identical inputs in these tests,
// so merging them changes neither masses nor weighted results.
const classData = [
  ['workers', 27 / 100, 1], ['petty', (110 / 9) / 100, 0.25],
  ['intelligentsia', (50 / 9) / 100, 0.5], ['peasants', 53 / 100, 0],
  ['bourgeois', (20 / 9) / 100, 0],
];
function newCells() {
  return classData.flatMap(([kind, mass, labour]) => [
    { kind, employment: 'employed', mass: mass * labour * 0.97, grievance: 35, radicalization: 0 },
    { kind, employment: 'unemployed', mass: mass * labour * 0.03, grievance: 35, radicalization: 0 },
    { kind, employment: 'outside', mass: mass * (1 - labour), grievance: 35, radicalization: 0 },
  ]).filter(c => c.mass > 0);
}
const average = (cells, field) => cells.reduce((s, c) => s + c.mass * c[field], 0)
  / cells.reduce((s, c) => s + c.mass, 0);

// DIAGNOSTIC ASSUMPTION, not a new approved rule: movement preserves grievance
// and radicalization by mass-weighted mixing, like the specified preference transfer.
function shiftEmployment(cells, unemployment) {
  for (const [kind, mass, labour] of classData) {
    if (!labour) continue;
    const e = cells.find(c => c.kind === kind && c.employment === 'employed');
    const u = cells.find(c => c.kind === kind && c.employment === 'unemployed');
    const targetU = mass * labour * unemployment / 100;
    const delta = targetU - u.mass;
    if (Math.abs(delta) < 1e-15) continue;
    const [from, to] = delta > 0 ? [e, u] : [u, e];
    const moved = Math.abs(delta);
    assert.ok(from.mass + 1e-12 >= moved);
    for (const key of ['grievance', 'radicalization']) {
      to[key] = (to[key] * to.mass + from[key] * moved) / (to.mass + moved);
    }
    from.mass -= moved;
    to.mass += moved;
  }
  near(cells.reduce((s, c) => s + c.mass, 0), 1, 'population conservation');
}

// §15.1. exposureMode=0 isolates living conditions. Mode=1 checks sensitivity to
// assigning the increase of urban unemployment (pp) to each modelled labour cell.
// That allocation is not fully specified in the reference; both results are retained.
function societyStep(cells, old, next, effects, exposureMode) {
  shiftEmployment(cells, next.unemployment);
  for (const c of cells) {
    if (effects.rejectedDemand && c.employment === 'employed') c.grievance = clip(c.grievance + 8 * (effects.rejectedDemandShare ?? 1), 0, 100);
    // Explicit synthetic recipient for the administrative cut; NOT a historical claim.
    if (effects.adminCut && c.kind === 'intelligentsia' && c.employment === 'employed') {
      c.grievance = clip(c.grievance + 4, 0, 100);
    }
    if (effects.firstRelief && c.employment === 'unemployed') c.grievance = clip(c.grievance - 6 * effects.coverage, 0, 100);
    const before = c.grievance;
    const conditions = c.employment === 'unemployed' ? 65
      : c.employment === 'employed' ? next.wage
      : c.kind === 'peasants' ? clip(100 + (45 - next.agrarian) * 0.4, 40, 140) : 100;
    const exposure = c.employment === 'outside' ? 0 : exposureMode * pos(next.unemployment - old.unemployment);
    const relief = c.employment === 'unemployed' && effects.benefit ? 2 * effects.coverage * (effects.benefitScale ?? 1) : 0;
    c.grievance = clip(before + 0.02 * pos(100 - conditions) + 0.5 * exposure
      - relief - 0.03 * pos(conditions - 100), 0, 100);
    // Written RHS uses pre-update grievance; no repression/violence/settlements are supplied.
    c.radicalization = clip(c.radicalization + 0.05 * pos(before - 60), 0, 100);
  }
  return {
    national: average(cells, 'grievance'),
    employedWorkers: average(cells.filter(c => c.kind === 'workers' && c.employment === 'employed'), 'grievance'),
    workers: average(cells.filter(c => c.kind === 'workers'), 'grievance'),
    workerRadicalization: average(cells.filter(c => c.kind === 'workers'), 'radicalization'),
    unemployed: average(cells.filter(c => c.employment === 'unemployed'), 'grievance'),
  };
}

const configs = [
  { id: 'R0', label: 'Brak zaakceptowanej stabilizacji', launch: null },
  { id: 'R1', label: 'Wczesna szybka stabilizacja', launch: 'earliest', variant: 'rapid' },
  { id: 'R2', label: 'Wczesna stopniowa stabilizacja', launch: 'earliest', variant: 'gradual' },
  { id: 'R3', label: 'Późna szybka stabilizacja', launch: '1924-01', variant: 'rapid' },
  { id: 'R4', label: 'Późna stabilizacja z osłoną', launch: '1924-01', variant: 'protected' },
  { id: 'R5', label: 'Późna szybka + roboty PPS', launch: '1924-01', variant: 'rapid', works: true },
  { id: 'R6', label: 'Wczesna szybka + reakcja kredytowa', launch: 'earliest', variant: 'rapid', creditProject: true },
];

function run(config, exposureMode, options = {}) {
  let state = { inflation: 4, wage: 100, credit: 55, output: 100, marketUnemployment: 3, unemployment: 3, agrarian: 45 };
  const cells = newCells();
  const rows = [], events = [], projects = [];
  let firstCurrencyGate = null, prepared = null, launched = null, firstZloty = null;
  let benefit = false, benefitPaid = false, businessPressure = 10;
  let demandOpened = null, demandPenaltyApplied = false;
  let pressure = 10, democracy = 60, chjenoShadowPressure = 10;
  let firstStrikeGate = null, firstUncontrolledGate = null;
  const record = (t, kind, detail) => events.push({ date: date(t), time: t, kind, detail });
  for (let t = 1; t < time('1928-02'); t++) {
    const old = { ...state };
    const prev2 = rows.slice(-2);
    const currencyCrisis = prev2.length === 2 && prev2.every(r => r.inflation >= 20);
    const fiscalCrisis = prev2.length === 2 && prev2.every(r => r.budget < -2);
    if (currencyCrisis && firstCurrencyGate === null) {
      firstCurrencyGate = t;
      record(t, 'gate', 'Dwa zakończone miesiące inflacji >=20; dostępne przygotowanie stabilizacji.');
    }
    for (const p of projects) {
      if (p.firstEffect === t) {
        record(t, 'effect', `${p.kind}: pierwsze działanie.`);
        if (p.kind === 'stabilization') firstZloty = t;
      }
    }
    const launchAt = config.launch === 'earliest' ? (firstCurrencyGate === null ? Infinity : firstCurrencyGate + 1)
      : config.launch ? time(config.launch) : Infinity;
    let adminCut = false, initiativeCount = 0, ppsActions = 0;
    if (config.landLaunch && t === time(config.landLaunch) - 1) {
      initiativeCount++;
      record(t, 'cabinet_input', 'Przygotowanie uzgodnionej parcelacji przed stabilizacją.');
    }
    if (config.landLaunch && t === time(config.landLaunch)) {
      initiativeCount++;
      businessPressure += 8;
      projects.push({ kind: 'land', started: t, duration: 4, cost: 2, upkeep: 0, progress: 0, firstEffect: null });
      record(t, 'cabinet_input', 'Wdrożenie parcelacji z odszkodowaniem, skala 1; zgody są wejściem testu.');
    }
    if (t === launchAt - 1) {
      assert.ok(currencyCrisis || fiscalCrisis, 'stabilization preparation needs a crisis');
      prepared = t;
      initiativeCount++;
      record(t, 'cabinet_input', `Przygotowanie ${config.variant}; uprawnienia i zgoda są wejściem testu.`);
    }
    if (t === launchAt) {
      assert.equal(prepared, t - 1);
      launched = t;
      initiativeCount++;
      projects.push({ kind: 'stabilization', started: t, duration: config.variant === 'gradual' ? 5 : 3,
        cost: config.variant === 'gradual' ? 1 : 2, upkeep: 0, progress: 0, firstEffect: null });
      if (config.variant === 'rapid') { businessPressure += 8; adminCut = true; }
      if (config.variant === 'protected') {
        assert.ok(old.credit >= 40, 'loan requires credit >=40');
        businessPressure += 8;
        benefit = true;
      }
      record(t, 'cabinet_input', `Wdrożenie ${config.variant}; finansowanie przyjęte w tym samym pakiecie.`);
    }
    if (config.works && t === time('1925-11')) {
      ppsActions++;
      record(t, 'pps_input', 'Przygotowanie robót zatrudnieniowych; założony uzyskany resort Pracy i zgody.');
    }
    if (config.works && t === time('1925-12')) {
      ppsActions++;
      projects.push({ kind: 'works', started: t, duration: 3, cost: 2, upkeep: 1, progress: 0, firstEffect: null });
      record(t, 'pps_input', 'Wdrożenie robót, skala 1; bez nowego podatku/pożyczki.');
    }
    if (config.creditProject && t === time('1925-06')) {
      initiativeCount++;
      record(t, 'cabinet_input', 'Przygotowanie instrumentu kredytowego po datowanym szoku B16.');
    }
    if (config.creditProject && t === time('1925-07')) {
      initiativeCount++;
      projects.push({ kind: 'credit', started: t, duration: 2, cost: 2, upkeep: 1, progress: 0, firstEffect: null });
      record(t, 'cabinet_input', 'Wdrożenie instrumentu kredytowego; instytucja, prawo i zgody są wejściem.');
    }
    assert.ok(initiativeCount <= 1 && ppsActions <= 1, 'monthly action limit');

    let policyBudget = 0;
    if (launched !== null && t < launched + 6) {
      if (config.variant === 'rapid') policyBudget = 3; // wealth tax +2, named administration cut +1
      if (config.variant === 'protected') policyBudget = 5; // wealth tax +2, loan +3
    }
    if (config.variant === 'protected' && launched !== null && t >= launched + 6 && t < launched + 18) policyBudget = -1;
    const projectCharges = projects.reduce((s, p) => s + (p.firstEffect !== null && t >= p.firstEffect ? p.upkeep : p.cost), 0)
      + (benefit ? 2 : 0);
    const cycle = clip((old.output - 100) / 20, -3, 3);
    const inflationBurden = Math.min(3, Math.floor(pos(old.inflation) / 20));
    const budget = 2 + cycle - inflationBurden + policyBudget - projectCharges;
    // No approved tax, emission, active capital strike, wage deal or actual strike in these fixtures.
    const coverage = delivery(budget);
    if (projects.some(p => p.started === t)) assert.ok(budget >= -2, `unfunded voluntary launch ${config.id} ${date(t)}`);
    for (const p of projects) {
      if (p.firstEffect !== null) continue;
      p.progress = Math.min(100, p.progress + (100 / p.duration) * coverage);
      if (p.progress >= 100 - 1e-10) {
        p.progress = 100;
        p.firstEffect = t + 1;
        record(t, 'completion', `${p.kind}: budowa ukończona; efekt od ${date(t + 1)}.`);
      }
    }
    const active = kind => projects.some(p => p.kind === kind && p.firstEffect !== null && p.firstEffect <= t);
    const s = shocks(t, firstZloty !== null);
    const stabilizationShock = launched !== null && t < launched + (config.variant === 'gradual' ? 5 : 3)
      ? (config.variant === 'gradual' ? 5 : 10) : 0;
    const input = { monetary: s.monetary, creditShock: s.credit + stabilizationShock, outputShock: s.output,
      agrarianShock: s.agrarian, creditSupport: active('credit') ? 5 * coverage : 0, worksUnits: active('works') ? 2 * coverage : 0 };
    input.landUnits = projects.filter(p => p.kind === 'land' && p.firstEffect === t).length;
    state = economyStep(old, input, options);
    if (!options.slowWageRecovery) near(state.wage, 104 / (1 + state.inflation / 100), 'wage telescoping identity');
    assert.ok(businessPressure < 40, 'fixtures must not silently omit an active business reaction');

    if (!demandOpened && rows.length >= 3 && rows.slice(-3).every(r => r.wage < 80)) {
      demandOpened = t;
      record(t, 'wage_demand', 'Trzy zakończone miesiące płacy <80; otwarcie żądania.');
    }
    // Fixed test response: no accepted wage settlement by the settlement of the opening month.
    const rejectedDemand = demandOpened === t && !demandPenaltyApplied;
    if (rejectedDemand) { demandPenaltyApplied = true; record(t, 'response_input', 'Brak ugody; raz +8 objętym zatrudnionym.'); }
    const firstRelief = benefit && !benefitPaid && coverage > 0;
    if (firstRelief) benefitPaid = true;
    const social = societyStep(cells, old, state, { rejectedDemand, adminCut, benefit, firstRelief, coverage }, exposureMode);
    const compliance = clip(0.35 + 0.004 * 50 + 0.003 * 95.25, 0, 1);
    const passiveParticipation = 20 * 0.25 * compliance;
    const uncontrolledPressure = social.workers * social.workerRadicalization / 100 * (1 - passiveParticipation / 100);
    if (social.employedWorkers >= 60 && !firstStrikeGate) {
      firstStrikeGate = t + 1;
      record(t, 'strike_gate', `Próg pracowników >=60; karta od ${date(t + 1)}, bez automatycznego strajku.`);
    }
    if (uncontrolledPressure >= 40 && !firstUncontrolledGate) {
      firstUncontrolledGate = t + 1;
      record(t, 'uncontrolled_gate', `Sprawa protestu od ${date(t + 1)}; brak automatycznych uczestników.`);
    }
    // Political INPUT: operational cabinet, authority=55, no scored institutional acts,
    // no executed-agreement discount and no personal-conflict impulse. Not a forecast of cabinets.
    const socialPressure = social.national >= 60 ? 2 : 0;
    pressure = clip(pressure + socialPressure, 0, 100);
    chjenoShadowPressure = clip(chjenoShadowPressure + socialPressure + (t === time('1926-05') ? 20 : 0), 0, 100);
    democracy = clip(democracy + 0.03 * 5 - 0.02 * pos(social.national - 50), 0, 100);
    rows.push({ run: config.id, exposureMode, date: date(t), time: t, ...state,
      currency: firstZloty !== null ? 'zloty' : launched !== null ? 'stabilizing' : 'marka',
      monetary: input.monetary, creditShock: input.creditShock, outputShock: input.outputShock,
      cycle, inflationBurden, policyBudget, projectCharges, budget, coverage, businessPressure,
      ...Object.fromEntries(Object.entries(social).map(([k, v]) => [`grievance_${k}`, v])),
      uncontrolledPressure, pressure, chjenoShadowPressure, democracy,
      majorCrisis: currencyCrisis || social.national >= 60,
      currencyCrisis, fiscalCrisis, cabinetInitiatives: initiativeCount, ppsActions,
      worksUnits: input.worksUnits, creditSupport: input.creditSupport,
      wageDemand: demandOpened !== null, rejectedDemand,
      industryFund: 0.50 + 0.03 * t, railFund: 0.25 + 0.03 * t,
    });
  }
  return { config, exposureMode, firstCurrencyGate, firstZloty, firstStrikeGate, firstUncontrolledGate, events, rows };
}

// Independent checks of boundaries and identities, not tests of the existing game.
function main() {
assert.equal(time('1926-05'), 53);
assert.equal(time('1928-02'), 74);
assert.equal(shocks(time('1925-12'), true).credit, 12);
assert.equal(shocks(time('1926-01'), true).credit, 6);
assert.equal(shocks(time('1926-07'), true).credit, 0);
assert.equal(shocks(time('1927-07'), true).output, 0);
assert.equal(shocks(time('1923-10'), false).monetary, 120);
assert.equal(shocks(time('1923-10'), true).monetary, 0);
assert.deepEqual([-5.01, -5, -2.01, -2].map(delivery), [0, 0.5, 0.5, 1]);
const runs = configs.flatMap(c => [run(c, 0), run(c, 1)]);
const at = (r, d) => r.rows.find(x => x.date === d);
const base = id => runs.find(r => r.config.id === id && r.exposureMode === 0);
for (const r of runs) {
  assert.equal(r.rows.length, 73); // February election precedes a further ordinary monthly action.
  assert.equal(r.firstCurrencyGate, time('1923-04'));
  assert.ok(r.rows.every(x => [0, 0.5, 1].includes(x.coverage)));
}
assert.equal(base('R1').firstZloty, time('1923-08'));
assert.equal(base('R2').firstZloty, time('1923-10'));
assert.equal(base('R3').firstZloty, time('1924-04'));
assert.equal(at(base('R5'), '1926-02').worksUnits, 0);
assert.equal(at(base('R5'), '1926-03').worksUnits, 2);
assert.equal(at(base('R5'), '1926-02').projectCharges, 2);
assert.equal(at(base('R5'), '1926-03').projectCharges, 1);
assert.equal(at(base('R4'), '1924-06').policyBudget, 5);
assert.equal(at(base('R4'), '1924-07').policyBudget, -1);
assert.equal(at(base('R4'), '1925-06').policyBudget, -1);
assert.equal(at(base('R4'), '1925-07').policyBudget, 0);
near(at(base('R5'), '1926-05').marketUnemployment - at(base('R5'), '1926-05').unemployment, 0.5, 'jobs are a level effect');
assert.equal(at(base('R6'), '1925-08').creditSupport, 0);
assert.equal(at(base('R6'), '1925-09').creditSupport, 5);
// A partial project with a -3 B budget needs six rather than three settlements.
near(Array.from({ length: 6 }).reduce(p => Math.min(100, p + 100 / 3 * delivery(-3)), 0), 100, 'half delivery');

function politicalTrace({ start = 10, months = 6, noCabinet = false, authority = 55,
  grievance = 35, agreement = false, compromise = false, chjenoMonth = null, brokenMonth = null }) {
  let p = start;
  return Array.from({ length: months }, (_, i) => {
    p = clip(p + 3 * noCabinet + 2 * (authority < 40) + 2 * (grievance >= 60)
      + (i === brokenMonth ? 8 : 0) + (i === chjenoMonth ? 20 : 0) - 2 * agreement - 3 * compromise, 0, 100);
    return p;
  });
}
const forces = [[45, .8, .8, .05], [55, .85, .85, .9], [25, .7, .7, .45], [35, .7, .7, .15]];
const capacity = forces.reduce((sum, [f, r, c, l]) => sum + f * r * c * l, 0) * .8;
const pressureChecks = {
  allForcesExpectedAvailable_capacity: capacity,
  onlyCapitalForcesExpectedAvailable_capacity: forces.slice(0, 2).reduce((sum, [f, r, c, l]) => sum + f * r * c * l, 0) * .8,
  stableCabinet_ChjenoReturn: politicalTrace({ chjenoMonth: 0 }),
  agreementsOnly: politicalTrace({ start: 50, agreement: true }),
  compromiseOnly: politicalTrace({ start: 50, compromise: true }),
  bothDiscounts: politicalTrace({ start: 50, agreement: true, compromise: true }),
  highSocialGrievance_cancelledByAgreement: politicalTrace({ grievance: 65, agreement: true }),
};
near(capacity, 36.231, 'synthetic capacity');
assert.equal(pressureChecks.bothDiscounts.at(-1), 20);

// Coupled §15.2/15.3 test: six months without an operational cabinet, then an
// actual formation in May. Failed formation attempts and a broken agreement are
// EXTERNAL stress-test events, not inferred historical events.
function deadlockTrace(failedAttempts, brokenPromise) {
  let p = 10;
  return Array.from({ length: 7 }, (_, i) => {
    const noCabinetMonths = Math.min(i + 1, 6);
    const operational = i === 6;
    const authority = clip(55 + (operational ? 4 : 0) - 6 * failedAttempts - 3 * noCabinetMonths, 0, 100);
    p = clip(p + (operational ? 0 : 3) + 2 * (authority < 40)
      + (operational ? 20 : 0) + (brokenPromise && i === 5 ? 8 : 0), 0, 100);
    return { date: date(time('1925-11') + i), authority, pressure: p, operational,
      attemptPressureGate: p >= 65 };
  });
}
pressureChecks.sixMonthsDeadlockThenChjeno = deadlockTrace(0, false);
pressureChecks.twoFailedFormationsAndDeadlockThenChjeno = deadlockTrace(2, false);
pressureChecks.samePlusOneBrokenPromise = deadlockTrace(2, true);
assert.equal(pressureChecks.sixMonthsDeadlockThenChjeno.at(-1).pressure, 50);
assert.equal(pressureChecks.twoFailedFormationsAndDeadlockThenChjeno.at(-1).pressure, 60);
assert.equal(pressureChecks.samePlusOneBrokenPromise.at(-1).pressure, 68);

const compliance = clip(.35 + .004 * 50 + .003 * 95.25, 0, 1);
const participation = 20 * .25 * compliance;
const cost = .1 + .01 * participation;
const strikeChecks = {
  compliance, participation, monthlyCost_R: cost,
  industryFundBeforeNov1923: .5 + .03 * 22,
  railFundBeforeNov1923: .25 + .03 * 22,
  industryLimitedDemandChance: clip(.5 + (.5 * participation + .3 * 60 + .2 * 45 - 40) / 100, .05, .95),
  railLimitedDemandChance: clip(.5 + (.5 * participation + .3 * 90 + .2 * 45 - 40) / 100, .05, .95),
  railGrievanceNov1923_withActualMilitarization: [0, 1].map(mode =>
    at(runs.find(r => r.config.id === 'R0' && r.exposureMode === mode), '1923-11').grievance_employedWorkers + 10),
  note: 'Rail +10 is an isolated branch-only sensitivity with an actual order supplied as input. No unknown rail population share or national bonus is invented. Negotiation chances require a legal feasible offer; no success draw is fabricated.',
};
near(participation, 4.17875, 'passive strike participation');
assert.ok(strikeChecks.railGrievanceNov1923_withActualMilitarization.every(g => g < 60));

const summary = runs.map(r => ({ id: r.config.id, label: r.config.label, exposureMode: r.exposureMode,
  firstCurrencyGate: date(r.firstCurrencyGate), firstZloty: r.firstZloty ? date(r.firstZloty) : null,
  firstStrikeGate: r.firstStrikeGate ? date(r.firstStrikeGate) : null,
  firstUncontrolledGate: r.firstUncontrolledGate ? date(r.firstUncontrolledGate) : null,
  minBudget: Math.min(...r.rows.map(x => x.budget)), minWage: Math.min(...r.rows.map(x => x.wage)),
  maxNationalGrievance: Math.max(...r.rows.map(x => x.grievance_national)),
  firstFiscalCrisis: r.rows.find(x => x.fiscalCrisis)?.date ?? null,
  checkpoints: ['1923-03', '1923-11', '1923-12', '1924-03', '1924-06', '1924-09', '1925-11', '1926-05', '1928-01'].map(d => at(r, d)),
}));
const hashes = Object.fromEntries([reference, 'docs/POLISH_DESCRIPTIVE_GUIDE.md', 'docs/POLISH_MECHANICS_AUDIT.md'].map(p =>
  [p, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, p))).digest('hex')]));
const output = { specification: '0.12 / normal_chapter1_v1 / economy_simple_v1', hashes,
  boundary: { date: '1928-02-19', kind: 'conditional_scheduled_election_boundary',
    lastSettled: '1928-01', certifiedElection: false, note: 'No simulated election result or cabinet succession.' },
  assumptions: [
    'Conditional policy approvals and lawful executors are supplied; no votes or cabinet successions are simulated.',
    'No further policy is approved beyond each fixture; this is not a full autonomous NPC policy.',
    'Employment transfers mix grievance/radicalization by mass; allocation of new unemployment exposure is tested at 0 and positive national urban pp.',
    'Administrative cut recipients are the synthetic employed intelligentsia; no historical public-service share is asserted.',
    'No actual strike, repression, army concession, wage agreement, emission, land reform or new binding agreement is supplied.',
    'The benefit fixture tests fiscal delivery without a linked political promise: no missed-promised-payments penalty is fabricated.',
    'Political baseline holds an operational cabinet and authority 55; Chjeno and deadlock overlays are separate conditional inputs.',
    'The scheduled election boundary has no computed mandates/certification; coup stress tests stop at attempt eligibility, not a fabricated outcome.',
  ],
  inputs: configs, pressureChecks, strikeChecks, summary,
  runs: runs.map(({ rows, ...r }) => r) };
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(output, null, 2) + '\n');
const flat = runs.flatMap(r => r.rows);
const keys = Object.keys(flat[0]);
fs.writeFileSync(path.join(__dirname, 'monthly.csv'), [keys.join(','), ...flat.map(r => keys.map(k => r[k]).join(','))].join('\n') + '\n');
const checkpointKeys = ['run', 'exposureMode', 'date', 'inflation', 'wage', 'output', 'credit', 'unemployment', 'budget', 'coverage',
  'grievance_employedWorkers', 'grievance_national', 'pressure', 'chjenoShadowPressure'];
const selected = summary.flatMap(r => r.checkpoints);
fs.writeFileSync(path.join(__dirname, 'checkpoints.csv'), [checkpointKeys.join(','), ...selected.map(r => checkpointKeys.map(k => r[k]).join(','))].join('\n') + '\n');
console.log(JSON.stringify({ message: 'Checks passed. 14 conditional runs × 73 months; gameplay/specification untouched.',
  summary: summary.filter(r => r.exposureMode === 0).map(({ checkpoints, ...rest }) => rest), pressureChecks, strikeChecks }, null, 2));
}

module.exports = { run, configs, economyStep, time, date, clip, near, shocks, newCells, societyStep, average, delivery };
if (require.main === module) main();
