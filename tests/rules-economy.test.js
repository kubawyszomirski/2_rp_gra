const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');

// Unit tests of the economy and project rules (implementation plan, stage 4; technical reference 5.6,
// 11.0–11.9, 12.1–12.5, 17.4, 17.16.2). They load the source files directly and never start the game.
const RULES = path.join(__dirname, '..', 'source', 'rules');
const rules = require(path.join(RULES, 'polish_rules.js'));
const inst = require(path.join(RULES, 'polish_institutions.js'));
const econ = require(path.join(RULES, 'polish_economy.js'));
const gov = require(path.join(RULES, 'polish_government.js'));
const proj = require(path.join(RULES, 'polish_projects.js'));
const close = (a, b, eps = 1e-9, label = '') => assert.ok(Math.abs(a - b) <= eps, `${label} ${a} != ${b}`);

const PARTIES = ['kpp', 'pps', 'npr', 'psl_wyzwolenie', 'psl_piast', 'pschd', 'zln', 'minorities_bloc', 'other'];
const CLASSES = ['workers', 'old_middle', 'new_middle', 'rural', 'bourgeois_landowners', 'unemployed', 'national_minorities'];
// Opening weights and rows of source/scenes/root.scene.dry (K).
const WEIGHTS = { workers: 27, old_middle: 110 / 9, new_middle: 50 / 9, rural: 53, bourgeois_landowners: 20 / 9, unemployed: 3, national_minorities: 30 };
const ROWS = {
  workers: [11.04, 38.64, 18.40, 1.84, 0.92, 9.20, 7.36, 4.60, 8],
  old_middle: [1.84, 9.20, 12.88, 3.68, 5.52, 18.40, 29.44, 11.04, 8],
  new_middle: [3.68, 22.08, 4.60, 8.28, 4.60, 9.20, 25.76, 13.80, 8],
  rural: [1.76, 3.52, 1.76, 28.16, 29.92, 5.28, 13.20, 4.40, 12],
  bourgeois_landowners: [0, 1.84, 3.68, 0.92, 6.44, 13.80, 48.76, 16.56, 8],
  unemployed: [29.44, 34.96, 11.04, 1.84, 0.92, 4.60, 3.68, 5.52, 8],
  national_minorities: [9.20, 6.44, 0.92, 1.84, 0.92, 0.92, 1.84, 69.92, 8],
};
const SEATS = { kpp: 2, pps: 35, npr: 22, psl_wyzwolenie: 25, psl_piast: 99, pschd: 27, zln: 83, minorities_bloc: 17, other: 134 };

function fixture(overrides = {}) {
  const Q = {
    time: 1, year: 1922, month: 1, month_actions: 0, parties: PARTIES, classes: CLASSES,
    sejm_parliament: { id: 'opening_1922', kind: 'opening_snapshot', total_seats: 444, party_seats: { ...SEATS } },
    psl_wyzwolenie_relation: 65, minorities_bloc_relation: 50, psl_piast_relation: 45, npr_relation: 50,
    pschd_relation: 30, kpp_relation: 10, zln_relation: 5, lewica_dissent: 20,
    legacy_party_map: { spd: 'pps', kpd: 'kpp', dvp: 'pschd', dnvp: 'zln' },
    polish_presidency: { constitution: { reforms: { democratic_guarantees: false, constructive_vonc: false, presidential_arbitration: false } } },
    ...WEIGHTS, ...overrides,
  };
  for (const c of CLASSES) PARTIES.forEach((p, i) => { Q[`${c}_${p}`] = ROWS[c][i]; });
  Q.S = rules.createFoundationState({ randomState: [1922, 1, 2, 3, 4], institutions: inst.createInstitutionState(Q),
    government: gov.createGovernmentState(Q), economy: econ.createEconomyState() });
  gov.writeRelationMirrors(Q);
  return Q;
}
// An isolated test without scenario pressures ("zerowe szoki są dozwolone tylko w jawnie izolowanych testach", 11.1).
function isolated(Q) {
  Q.S.economy.shocks = [];
  return Q;
}
// A frozen economy: only the budget of 11.2 and the projects move (the example of 11.8).
function frozenBudget(Q, t) {
  return econ.budgetAt(Q.S, t);
}
function cabinet(Q, fields) {
  Object.assign(Q.S.cabinet, fields);
  return Q.S.cabinet;
}
function row(Q, c) {
  return PARTIES.map(p => Q[`${c}_${p}`]);
}

test('schema 5: the new game has the economy and society of 11.1 and 5.6 and an empty list of laws', () => {
  const Q = fixture();
  assert.equal(rules.SCHEMA_VERSION, 8);
  assert.deepEqual(rules.validateState(Q.S), []);
  const E = Q.S.economy;
  assert.deepEqual([E.currency_regime, E.inflation_m, E.real_wage, E.output, E.credit, E.market_unemployment, E.unemployment,
    E.budget_base, E.tax_level, E.tax_incidence, E.budget, E.business_pressure, E.business_state],
  ['marka', 4, 100, 100, 55, 3, 3, 2, 0, 'broad', 2, 10, 'quiet']);
  assert.equal(Q.S.society.agrarian_pressure, 45);
  assert.deepEqual(Object.values(Q.S.society.living_conditions_last), [100, 100, 100, 100, 100, 100, 100]);
  assert.deepEqual(Q.S.parliament.laws, []);
  assert.equal(Q.S.chapter.unemployment_bill, null);
  assert.equal(E.shocks.length, 11, '17.16.2: the dated pressures of normal_chapter1_v1');
});

test('17.16.2: one marka interval at a time, the złoty ends it, the non-monetary pressures keep their dates', () => {
  const E = fixture().S.economy;
  const at = (y, m) => ({ monetary: econ.shockAt(E, 'monetary', rules.timeOf(y, m)), credit: econ.shockAt(E, 'credit', rules.timeOf(y, m)),
    output: econ.shockAt(E, 'output', rules.timeOf(y, m)), agrarian: econ.shockAt(E, 'agrarian', rules.timeOf(y, m)) });
  assert.equal(at(1922, 6).monetary, 8);
  assert.equal(at(1922, 7).monetary, 15, 'replaces the previous interval, not added to 8');
  assert.equal(at(1923, 3).monetary, 30);
  assert.equal(at(1923, 9).monetary, 60);
  assert.equal(at(1924, 5).monetary, 120, 'the marka crisis lasts until the złoty, not only until 1924');
  assert.deepEqual([at(1924, 9).agrarian, at(1925, 2).agrarian, at(1925, 3).agrarian], [1, 1, 0]);
  assert.deepEqual([at(1925, 6).credit, at(1925, 12).credit, at(1926, 1).credit, at(1926, 7).credit], [12, 12, 6, 0]);
  close(at(1925, 6).output, -0.4); close(at(1926, 3).output, -0.2); close(at(1926, 7).output, 0.3); close(at(1927, 7).output, 0);
  E.currency_regime = 'zloty';
  assert.equal(at(1924, 5).monetary, 0, 'the złoty removes the marka impulses');
  assert.equal(at(1925, 6).credit, 12, '… but not the external credit crisis');
  E.currency_regime = 'stabilizing';
  assert.equal(at(1924, 5).monetary, 120, 'during the reform the marka rules still apply');
});

test('the first months follow the M02 calculator: inflation, wages, credit, output and the countryside (11.4–11.6)', () => {
  const Q = fixture();
  const b1 = econ.budgetAt(Q.S, 1);
  assert.equal(b1.budget, 2);
  const r1 = econ.settleEconomy(Q.S, 1, b1, {});
  // analysis/m02-revision-13/monthly.csv, run A, 1922-01 (start-of-month snapshot, marka pressure 8).
  close(r1.inflation_m, 5.2, 1e-12, 'inflation');
  close(r1.real_wage, 100 * 1.04 / 1.052, 1e-9, 'real wage');
  close(r1.credit, 54.88, 1e-12, 'credit');
  close(r1.output, 100, 1e-12, 'output');
  close(r1.agrarian_pressure, 44.85, 1e-12, 'agrarian pressure');
  const r2 = econ.settleEconomy(Q.S, 2, econ.budgetAt(Q.S, 2), {});
  close(r2.private_growth, 0.015 * (54.88 - 55) + 0.008 * (100 * 1.04 / 1.052 - 100), 1e-12, 'private growth');
  close(r2.market_unemployment, 3 - 0.35 * r2.private_growth, 1e-12);
});

test('Niedobór budżetu: execution 1 / 0.5 / 0.5 / 0 at −2 / −2.01 / −5 / −5.01; the nominal cost stays', () => {
  assert.deepEqual([-2, -2.01, -5, -5.01].map(econ.fiscalDelivery), [1, 0.5, 0.5, 0]);
  const Q = isolated(fixture());
  const project = proj.createProject(Q, 'public_works', 'employment', { sponsor: 'pps' });
  project.status = 'executing'; project.authorized = true; project.started_at = 1; project.charge_from = 1;
  Q.S.economy.budget_base = -1;
  const b = econ.budgetAt(Q.S, 1);
  assert.equal(b.budget, -3, 'the building cost of 2 B stays in the budget while execution is limited');
  proj.processProjects(Q, 1, b);
  close(project.progress, 100 / 3 * 0.5);
  assert.equal(econ.budgetAt(Q.S, 2).budget, -3, 'no second deduction and no automatic improvement from non-execution');
});

test('Budżet bez kumulacji: base 2, building 2 B for 3 M, upkeep 1: readings 0/0/0, then +1, without a reservation ledger', () => {
  const Q = isolated(fixture());
  Q.S.cabinet.status = 'active';
  const project = proj.createProject(Q, 'public_works', 'employment', { sponsor: 'cabinet' });
  proj.launchProject(Q, project, { sponsor: 'cabinet' });
  const readings = [];
  for (let t = 1; t <= 5; t++) {
    const b = frozenBudget(Q, t);
    readings.push(b.budget);
    proj.processProjects(Q, t, b);
  }
  assert.deepEqual(readings, [0, 0, 0, 1, 1]);
});

test('11.8: works prepared in November, launched in December: 0 B until February, then 1 B, 2 units, 0.5 pp of jobs and 0.30 pp of output', () => {
  const Q = isolated(fixture());
  const nov = rules.timeOf(1925, 11), dec = nov + 1, mar = rules.timeOf(1926, 3);
  Q.time = nov;
  const project = proj.prepareProject(Q, 'public_works', 'employment', { sponsor: 'cabinet' });
  assert.equal(project.status, 'prepared');
  assert.equal(econ.budgetAt(Q.S, nov).budget, 2, 'preparation has no budget cost');
  Q.time = dec;
  proj.launchProject(Q, project, { sponsor: 'cabinet' });
  const seen = {};
  for (let t = dec; t <= mar + 1; t++) {
    const b = frozenBudget(Q, t);
    const inputs = proj.processProjects(Q, t, b);
    seen[t] = { budget: b.budget, units: inputs.works_units, pp: inputs.works_output_pp };
  }
  assert.deepEqual([seen[dec].budget, seen[dec + 1].budget, seen[dec + 2].budget, seen[mar].budget], [0, 0, 0, 1]);
  assert.equal(seen[dec + 2].units, 0, 'no jobs in the month the building ends');
  assert.equal(seen[mar].units, 2, 'effects from March');
  close(seen[mar].pp, 0.30, 1e-12);
});

test('Zatrudnienie: the same 2 units for 6 M are a level of 0.5 pp of jobs, not −0.5 pp a month', () => {
  const Q = isolated(fixture());
  const E = Q.S.economy;
  E.market_unemployment = 5; E.unemployment = 5;
  for (let t = 1; t <= 6; t++) econ.settleEconomy(Q.S, t, { budget: 2, emission_used: 0, structural_room: 2 }, { works_units: 2, works_output_pp: 0.30 });
  close(E.market_unemployment - E.unemployment, 0.5, 1e-9, 'public jobs');
  assert.ok(E.unemployment > 3.5, 'the jobs are subtracted from private unemployment, not accumulated');
});

test('Wykonanie i limit robót: 2 employment and 2 infrastructure units at half execution give 2 units and 0.40 pp; the cap of 8 scales both once', () => {
  const Q = isolated(fixture());
  Q.S.cabinet.status = 'active';
  for (const variant of ['employment', 'infrastructure']) {
    const p = proj.createProject(Q, 'public_works', variant, { sponsor: 'cabinet' });
    Object.assign(p, { status: 'operating', authorized: true, started_at: 1, charge_from: 1, first_effect_time: 1, progress: 100 });
  }
  const half = proj.processProjects(Q, 2, { budget: -3 });
  close(half.works_units, 2, 1e-12);
  close(half.works_output_pp, 0.15 + 0.25, 1e-12);
  for (let i = 0; i < 4; i++) {
    const p = proj.createProject(Q, 'public_works', 'infrastructure', { sponsor: 'cabinet' });
    Object.assign(p, { status: 'operating', authorized: true, started_at: 1, charge_from: 1, first_effect_time: 1, progress: 100 });
  }
  const full = proj.processProjects(Q, 3, { budget: 2 });
  close(full.works_units, 8, 1e-12, 'twelve units scaled to eight');
  close(full.works_output_pp, (2 * 0.15 + 10 * 0.25) * 8 / 12, 1e-12);
});

test('Kapitał: pressure 60 from quiet gives a warning first; active only after a full month of warning; quiet after two calm settlements', () => {
  const E = fixture().S.economy;
  E.business_pressure = 60;
  assert.equal(econ.updateBusinessState(E, 10), 'warning');
  assert.equal(E.warning_since, 10);
  assert.equal(econ.updateBusinessState(E, 11), 'active');
  E.business_pressure = 39;
  assert.equal(econ.updateBusinessState(E, 12), 'active');
  assert.equal(econ.updateBusinessState(E, 13), 'quiet');
  E.business_pressure = 45;
  assert.equal(econ.updateBusinessState(E, 14), 'warning');
  E.business_pressure = 30;
  assert.equal(econ.updateBusinessState(E, 15), 'quiet', 'an inactive warning below 40 closes at once');
});

test('Konflikt kapitału: a reform raises the pressure once per case; the active state lowers credit and output (11.5, 11.7)', () => {
  const Q = isolated(fixture());
  const S = Q.S;
  assert.equal(econ.changeBusinessPressure(S, 25, 'case-1', 1), true);
  assert.equal(econ.changeBusinessPressure(S, 25, 'case-1', 1), false, 'reopening the same case adds nothing');
  econ.changeBusinessPressure(S, 30, 'case-2', 1);
  const quiet = econ.settleEconomy(S, 1, econ.budgetAt(S, 1), {});
  assert.equal(quiet.business_state, 'warning');
  const active = econ.settleEconomy(S, 2, econ.budgetAt(S, 2), {});
  assert.equal(active.business_state, 'active');
  close(active.credit_target, 55 - 0.1 * S.economy.history[0].inflation_m - 10, 1e-9, 'capital reaction −10 on the credit target');
  assert.ok(active.private_growth < quiet.private_growth - 0.49, 'and −0.5 pp on growth');
});

test('Warunki życia: +1 pp of unemployment at constant wages: workers −2, intelligentsia −1, petty bourgeoisie −0.5, peasants −0.4, bourgeoisie 0', () => {
  const Q = fixture();
  const before = econ.classConditions(Q);
  Q.S.economy.unemployment = 4;
  const after = econ.classConditions(Q);
  const d = c => after[c] - before[c];
  assert.deepEqual([d('workers'), d('new_middle'), d('old_middle'), d('rural'), d('bourgeois_landowners')].map(x => Math.round(x * 1e9) / 1e9),
    [-2, -1, -0.5, -0.4, 0]);
  assert.equal(d('unemployed'), -2, 'the unemployed row reads the workers’ index (P, decision 2 of stage 4)');
  const expected = ['workers', 'old_middle', 'new_middle', 'rural', 'bourgeois_landowners'].reduce((n, c) => n + WEIGHTS[c] * d(c), 0) / 100;
  close(d('national_minorities'), expected, 1e-9, 'the minority row: the weighted average of the class indices');
});

function flowAfter(Q, change, classId = 'workers') {
  const shares = econ.classShares(Q, classId);
  const applied = econ.applyFlow(shares, PARTIES, change, econ.responsibilityWeights(Q.S, PARTIES));
  return { shares, applied };
}

test('Przepływ pogorszenia: −3 and −8 points under ZLN–PSChD–Piast with PPS in opposition: the cabinet parties lose 0.30 and 0.50 pp (cap)', () => {
  const Q = fixture();
  cabinet(Q, { id: 'chjeno_t12', pm: 'witos', party: 'psl_piast', partner_ids: ['zln', 'pschd', 'psl_piast'], supporter_ids: [], status: 'active' });
  for (const [change, loss] of [[-3, 0.30], [-8, 0.50]]) {
    const { shares, applied } = flowAfter(Q, change);
    close(applied, -loss, 1e-12);
    const before = ROWS.workers;
    const lost = [4, 5, 6].reduce((n, i) => n + before[i] - shares[i], 0);
    close(lost, loss, 1e-9, 'cabinet parties');
    const opposition = [0, 1, 2, 3, 7, 8];
    const freeTotal = opposition.reduce((n, i) => n + before[i], 0);
    for (const i of opposition) close(shares[i] - before[i], loss * before[i] / freeTotal, 1e-9, 'gain by shares');
  }
});

test('Przepływ poprawy: +3 and +8 points while PPS tolerates the cabinet: the responsible gain 0.15 and 0.25 pp; PPS with weight 0.5', () => {
  const Q = fixture();
  assert.deepEqual(econ.responsibilityWeights(Q.S, PARTIES).pps, 0.5, 'the opening toleration of Ponikowski');
  for (const [change, gain] of [[3, 0.15], [8, 0.25]]) {
    const { shares, applied } = flowAfter(Q, change);
    close(applied, gain, 1e-12);
    close(shares[1] - ROWS.workers[1], gain, 1e-9, 'PPS is the only responsible party with a share');
  }
});

test('Asymetria: −4 then +4 under the same cabinet leaves the responsible parties lower than at the start', () => {
  const Q = fixture();
  cabinet(Q, { id: 'chjeno_t12', pm: 'witos', party: 'psl_piast', partner_ids: ['zln', 'pschd', 'psl_piast'], supporter_ids: [], status: 'active' });
  const shares = econ.classShares(Q, 'workers');
  const w = econ.responsibilityWeights(Q.S, PARTIES);
  econ.applyFlow(shares, PARTIES, -4, w);
  econ.applyFlow(shares, PARTIES, 4, w);
  assert.ok(shares[4] + shares[5] + shares[6] < ROWS.workers[4] + ROWS.workers[5] + ROWS.workers[6]);
});

test('Brak przepływu: a stable economy, a low but stable wage, or a cabinet without members and signed support give 0 pp', () => {
  const Q = fixture();
  Q.S.economy.real_wage = 80;
  econ.settleLivingConditions(Q, 1);
  const first = row(Q, 'workers');
  const second = econ.settleLivingConditions(Q, 2);
  assert.deepEqual(row(Q, 'workers'), first, 'a stable low wage creates no flow by itself');
  assert.equal(second.flows.workers, 0);
  const Q2 = fixture();
  cabinet(Q2, { partner_ids: [], supporter_ids: [], party: null });
  Q2.S.economy.real_wage = 70;
  const out = econ.settleLivingConditions(Q2, 1);
  assert.ok(Object.values(out.flows).every(f => f === 0), 'no responsible party, no flow');
});

test('Mała pula: responsible shares 0.1 pp with r=1 and 0.1 pp with r=0.5, change −10: flow 0.15 pp, no negative share, sum 100', () => {
  const shares = [10, 0.1, 0.1, 10, 10, 10, 29.8, 20, 10];
  const w = Object.fromEntries(PARTIES.map(p => [p, 0]));
  w.pps = 1; w.npr = 0.5;
  close(econ.applyFlow(shares, PARTIES, -10, w), -0.15, 1e-12);
  assert.ok(shares.every(x => x >= 0));
  close(shares.reduce((a, b) => a + b, 0), 100, 1e-9);
});

test('Bez podwójnego liczenia: benefits do not enter the index; inflation acts only through real wages; the unemployed weight stays 3', () => {
  const Q = fixture();
  const base = econ.classConditions(Q);
  const p = proj.createProject(Q, 'worker_protection', 'full', { sponsor: 'cabinet' });
  proj.launchProject(Q, p, { sponsor: 'cabinet' });
  assert.deepEqual(econ.classConditions(Q), base, 'a paid benefit leaves the index unchanged');
  Q.S.economy.inflation_m = 60;
  assert.deepEqual(econ.classConditions(Q), base, 'inflation at constant real wages leaves the index unchanged');
  Q.unemployed = 30;
  econ.writeEconomyMirrors(Q);
  assert.equal(Q.unemployed, 3, 'moving people to unemployment does not move votes to the unemployed row a second time');
});

test('Kolejność M09: the 5.6 flow first, then the outflow of 17.4 for PPS’s own overdue promises; both after the economy of t', () => {
  const Q = fixture();
  cabinet(Q, { id: 'left_t12', pm: 'daszynski', party: 'pps', partner_ids: ['pps', 'psl_wyzwolenie'], supporter_ids: [], status: 'active',
    portfolios: { ...Q.S.cabinet.portfolios, labor: 'pps' } });
  Q.S.agreements.a = { id: 'a', kind: 'cabinet', parties: ['pps', 'psl_wyzwolenie'], cabinet_id: 'left_t12', status: 'active', tension: 0,
    obligations: [{ id: 'a:worker_protection', topic: 'worker_protection', owner: 'cabinet', portfolio: 'labor', beneficiaries: ['psl_wyzwolenie'],
      weight: 2, due_at: 1, status: 'active', fulfillment: 0 }], history: [], responsibility: { pps: 1 } };
  Q.time = 3;
  assert.equal(proj.ppsOverdueWeight(Q), 2);
  assert.equal(proj.ppsResponsibility(Q.S), 1);
  Q.S.economy.real_wage = 97;
  const flow = econ.settleLivingConditions(Q, 2);
  const afterFlow = econ.classShares(Q, 'workers')[1];
  close(afterFlow - ROWS.workers[1], flow.flows.workers * ROWS.workers[1] * 1 / (ROWS.workers[1] + ROWS.workers[3]), 1e-9, 'PPS loses its part of the flow');
  const out = econ.settleDisappointment(Q, 2, proj.ppsOverdueWeight(Q), 1);
  close(out.workers, 0.5, 1e-12, 'min(PPS share, 0.5 × 1 × min(1, 2/2))');
  close(econ.classShares(Q, 'workers')[1], afterFlow - 0.5, 1e-9);
  close(econ.classShares(Q, 'workers').reduce((a, b) => a + b, 0), 100, 1e-9);
});

test('Stare reguły poparcia: the German aliases take the new rows, so no false delta is transferred later', () => {
  const Q = fixture();
  cabinet(Q, { id: 'chjeno_t12', pm: 'witos', party: 'psl_piast', partner_ids: ['zln', 'pschd', 'psl_piast'], supporter_ids: [], status: 'active' });
  Q.S.economy.real_wage = 95;
  econ.settleLivingConditions(Q, 1);
  for (const c of CLASSES) {
    assert.equal(Q[`${c}_spd`], Q[`${c}_pps`]);
    assert.equal(Q[`${c}_spd_compat_base`], Q[`${c}_pps`]);
    assert.equal(Q[`${c}_dnvp`], Q[`${c}_zln`]);
  }
  assert.equal(Q.catholics_spd, Q.national_minorities_pps);
});

// ---- Financing instruments (11.9; card 8.3) ----

function ppsTreasury(Q) {
  cabinet(Q, { id: 'left_t12', pm: 'daszynski', party: 'pps', partner_ids: ['pps', 'psl_wyzwolenie'], supporter_ids: [], status: 'active',
    portfolios: { ...Q.S.cabinet.portfolios, finance: 'pps', labor: 'pps', economic: 'pps', agriculture: 'psl_wyzwolenie', education: 'pps', justice: 'pps' } });
  return Q;
}

test('Czasowy dochód: a wealth tax from t for 6 M gives +2 B only in t..t+5, once; a save and load changes nothing', () => {
  const Q = isolated(ppsTreasury(fixture()));
  Q.time = 5;
  const policy = proj.applyInstrument(Q, 'wealth_tax', 5, { sponsor: 'pps' });
  const readings = [4, 5, 10, 11].map(t => econ.budgetAt(Q.S, t).budget);
  assert.deepEqual(readings, [2, 4, 4, 2]);
  assert.equal(Q.S.economy.business_pressure, 18, 'business pressure +8 once');
  const copy = JSON.parse(JSON.stringify(Q.S));
  assert.equal(econ.budgetAt(copy, 7).budget, 4);
  assert.match(proj.instrumentBlocked(Q, 'wealth_tax'), /already in force/);
  Q.time = 11;
  assert.equal(proj.instrumentBlocked(Q, 'wealth_tax'), '', 'after it expires an extension needs a new decision');
  assert.equal(policy.ends_at, 11);
});

test('Pożyczka inwestycyjna: +3 B in t..t+5, −1 B in t+6..t+17, then 0; a new loan waits for the end of the service', () => {
  const Q = isolated(ppsTreasury(fixture()));
  Q.time = 3;
  proj.applyInstrument(Q, 'loan', 3, { sponsor: 'pps' });
  assert.deepEqual([3, 8, 9, 20, 21].map(t => econ.budgetAt(Q.S, t).budget), [5, 5, 1, 1, 2]);
  Q.time = 10;
  assert.match(proj.instrumentBlocked(Q, 'loan'), /still being serviced/);
  Q.time = 21;
  assert.equal(proj.instrumentBlocked(Q, 'loan'), '');
  Q.S.economy.credit = 39;
  assert.match(proj.instrumentBlocked(Q, 'loan'), /below 40/);
});

test('Szerokie grupy i emisja: three broad variants with the costs of 11.9; emission limit before the złoty, coinage 1 point for 3 M after', () => {
  const Q = isolated(ppsTreasury(fixture()));
  proj.applyInstrument(Q, 'indirect', 1, { sponsor: 'pps', pps_answers: true });
  assert.deepEqual([Q.S.economy.tax_level, Q.S.economy.tax_incidence, Q.lewica_dissent], [1, 'indirect', 23]);
  proj.applyInstrument(Q, 'broad', 1, { sponsor: 'pps' });
  assert.deepEqual([Q.S.economy.tax_level, Q.S.economy.tax_incidence, Q.S.economy.business_pressure], [2, 'broad', 14]);
  proj.applyInstrument(Q, 'customs', 2, { sponsor: 'pps' });
  assert.equal(econ.shockAt(Q.S.economy, 'price', 3), 1);
  assert.equal(econ.shockAt(Q.S.economy, 'price', 4), 0, 'the price shock lasts 2 M');
  assert.equal(econ.shockAt(Q.S.economy, 'credit', 7), 3, 'the credit shock lasts 6 M');
  Q.S.economy.budget_base = -6;
  proj.applyInstrument(Q, 'emission', 1, { sponsor: 'pps', points: 3 });
  const b = econ.budgetAt(Q.S, 2);
  assert.equal(b.emission_used, Math.min(3, -b.structural_room));
  assert.equal(proj.instrumentBlocked(Q, 'coinage'), 'Transitional coinage exists only after the stabilisation.');
  Q.S.economy.currency_regime = 'zloty';
  assert.equal(econ.emissionAuthorizedAt(Q.S.economy, 2), 0, 'the złoty closes the ordinary emission');
  proj.applyInstrument(Q, 'coinage', 2, { sponsor: 'pps' });
  assert.deepEqual([2, 4, 5].map(t => econ.emissionAuthorizedAt(Q.S.economy, t)), [1, 1, 0]);
});

test('Pobór w karcie finansowej: 1 B for 2 M, then +1 B for good; a second time is blocked', () => {
  const Q = isolated(ppsTreasury(fixture()));
  const project = proj.createProject(Q, 'collection', 'collection', { sponsor: 'pps' });
  proj.launchProject(Q, project, { sponsor: 'pps' });
  const readings = [];
  for (let t = 1; t <= 5; t++) {
    const b = econ.budgetAt(Q.S, t);
    readings.push(b.budget);
    proj.processProjects(Q, t, b);
  }
  assert.deepEqual(readings, [1, 1, 3, 3, 3]);
  assert.match(proj.optionStatus(Q, 'finance_package', 'collection').reason, /already been improved/);
});

test('Stabilizacja i finanse: the złoty keeps the loan service and wages; it closes only the marka financing and impulses', () => {
  const Q = isolated(ppsTreasury(fixture()));
  Q.S.economy.shocks = econ.SCENARIO_SHOCKS.map(s => ({ ...s }));
  const t0 = rules.timeOf(1923, 11);
  Q.time = t0;
  proj.applyInstrument(Q, 'loan', t0, { sponsor: 'pps' });
  proj.applyInstrument(Q, 'emission', t0, { sponsor: 'pps', points: 2 });
  const reform = proj.prepareProject(Q, 'currency_reform', 'gradual', { sponsor: 'pps' });
  reform.status = 'executing'; reform.started_at = t0; reform.charge_from = t0;
  Q.S.economy.real_wage = 70;
  const law = { id: 'law-x', status: 'enacted' };
  reform.authorized = true;
  for (let t = t0; t < t0 + 6; t++) {
    proj.startOfPeriod(Q, t);
    proj.processProjects(Q, t, econ.budgetAt(Q.S, t));
  }
  assert.equal(Q.S.economy.currency_regime, 'zloty');
  assert.equal(econ.shockAt(Q.S.economy, 'monetary', t0 + 6), 0);
  assert.equal(econ.emissionAuthorizedAt(Q.S.economy, t0 + 6), 0);
  assert.equal(econ.policyBudgetAt(Q.S.economy, t0 + 6), -1, 'the loan service continues');
  assert.equal(Q.S.economy.real_wage, 70, 'no reset of wages');
  assert.equal(law.status, 'enacted');
});
