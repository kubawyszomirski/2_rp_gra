// Polish chapter economy: one budget in points B, prices and wages, credit, output and employment,
// the countryside, the one business reaction, financing instruments, dated scenario pressures and the
// monthly flow of support from living conditions (docs/POLISH_IMPLEMENTATION_PLAN.md, stage 4;
// technical reference 5.6, 11.0–11.9, 17.4, 17.16.2).
//
// Plain JavaScript without dependencies, like polish_rules.js, whose clock it uses. `npm run build`
// copies it to out/html/; the page loads it after polish_electorate.js as `window.PolishEconomy`,
// and Node tests load it with require(). Since stage 5 the flows of 5.6 and 17.4 act on the cells of
// polish_electorate.js; a state without cells (a test fixture) keeps the class rows of stage 4. Numbers marked P in the reference (`economy_simple_v1`) are
// taken as written; they are a working balance of the approved structure, not historical statistics.
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./polish_rules.js'), require('./polish_electorate.js'));
  } else {
    root.PolishEconomy = factory(root.PolishRules, root.PolishElectorate);
  }
}(typeof self !== 'undefined' ? self : this, function (rules, electorate) {
  'use strict';

  if (!rules || !electorate) throw new Error('PolishEconomy needs polish_rules.js and polish_electorate.js first');

  const copy = value => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
  const clip = (value, low, high) => Math.max(low, Math.min(high, value));
  const T = rules.timeOf;

  const ECONOMY_PROFILE_ID = 'economy_simple_v1';
  // The electoral weight of the "unemployed" row stays at its opening value until the cells of stage 5
  // (decision 2 of stage 4): unemployment then works only through the living-conditions index (5.6),
  // not a second time by moving votes to that row.
  const UNEMPLOYED_GROUP_WEIGHT = 3;
  const MINORITY_SEGMENTS = Object.freeze(['jewish_rep', 'other_minorities_rep']);

  // ---- Dated pressures of the Normal scenario (17.16.2) --------------------------------------------

  // One entry per channel and period, `starts_at <= t < ends_at` (null: open). `marka` entries apply
  // only under the marka or during the stabilisation; the złoty ends them. A positive credit value
  // lowers the credit target; a positive output value raises growth.
  const SCENARIO_SHOCKS = Object.freeze([
    {id: 'marka_1922_h1', channel: 'monetary', value: 8, starts_at: T(1922, 1), ends_at: T(1922, 7), condition: 'marka'},
    {id: 'marka_1922_h2', channel: 'monetary', value: 15, starts_at: T(1922, 7), ends_at: T(1923, 1), condition: 'marka'},
    {id: 'marka_1923_h1', channel: 'monetary', value: 30, starts_at: T(1923, 1), ends_at: T(1923, 7), condition: 'marka'},
    {id: 'marka_1923_q3', channel: 'monetary', value: 60, starts_at: T(1923, 7), ends_at: T(1923, 10), condition: 'marka'},
    {id: 'marka_crisis', channel: 'monetary', value: 120, starts_at: T(1923, 10), ends_at: null, condition: 'marka'},
    {id: 'rural_1924', channel: 'agrarian', value: 1, starts_at: T(1924, 9), ends_at: T(1925, 3), condition: null},
    {id: 'credit_1925', channel: 'credit', value: 12, starts_at: T(1925, 6), ends_at: T(1926, 1), condition: null},
    {id: 'credit_1925:output', channel: 'output', value: -0.4, starts_at: T(1925, 6), ends_at: T(1926, 1), condition: null},
    {id: 'credit_1926_tail', channel: 'credit', value: 6, starts_at: T(1926, 1), ends_at: T(1926, 7), condition: null},
    {id: 'credit_1926_tail:output', channel: 'output', value: -0.2, starts_at: T(1926, 1), ends_at: T(1926, 7), condition: null},
    {id: 'recovery_1926_27', channel: 'output', value: 0.3, starts_at: T(1926, 7), ends_at: T(1927, 7), condition: null},
  ].map(entry => Object.freeze(Object.assign({source_status: 'P'}, entry))));

  // ---- The new game (11.1, 2.4) --------------------------------------------------------------------

  const MAIN_CLASSES = Object.freeze(['workers', 'old_middle', 'new_middle', 'rural', 'bourgeois_landowners']);
  const LIVING_CLASSES = Object.freeze(MAIN_CLASSES.concat(['unemployed', 'national_minorities']));

  function createEconomyState() {
    const last = {};
    for (const id of LIVING_CLASSES) last[id] = 100;
    return {
      economy: {
        profile_id: ECONOMY_PROFILE_ID, currency_regime: 'marka', inflation_m: 4, real_wage: 100, output: 100, credit: 55,
        market_unemployment: 3, unemployment: 3, budget_base: 2, tax_level: 0, tax_incidence: 'broad', policies: [],
        budget: 2, business_pressure: 10, business_state: 'quiet', warning_since: null, calm_months: 0, business_cases: [],
        shocks: SCENARIO_SHOCKS.map(copy), history: [], last_growth: 0,
        // A fiscal package waiting for its vote (decision 5 of stage 4), the ones already voted, and one
        // due revision of a refused necessary package (17.16.4).
        pending_package: null, packages: [], package_revision: null,
      },
      // S.society of 2.4: agrarian pressure (11.6), the last living-conditions reading of 5.6 (100 at the
      // opening in the synthetic profile) and the one-off rural improvements of executed tranches.
      society: {agrarian_pressure: 45, living_conditions_last: last, rural_improvements: 0},
    };
  }

  // ---- Shocks, policies and the budget (11.2, 11.9) ------------------------------------------------

  function shockApplies(E, entry, t) {
    if (t < entry.starts_at || (entry.ends_at !== null && entry.ends_at !== undefined && t >= entry.ends_at)) return false;
    if (entry.condition === 'marka') return E.currency_regime === 'marka' || E.currency_regime === 'stabilizing';
    return true;
  }

  // The sum of the active entries of one channel; no entries give 0.
  function shockAt(E, channel, t) {
    return E.shocks.filter(entry => entry.channel === channel && shockApplies(E, entry, t)).reduce((n, entry) => n + entry.value, 0);
  }

  function addShock(E, entry) {
    if (E.shocks.some(existing => existing.id === entry.id)) return false;
    E.shocks.push(Object.assign({condition: null, source_status: 'P'}, entry));
    return true;
  }

  const inWindow = (window, t) => t >= window.from && (window.to === null || window.to === undefined || t < window.to);

  // A policy is active while one of its budget windows, or its authorisation window, covers t.
  function policyActive(policy, t) {
    if (policy.status === 'cancelled') return false;
    if (policy.budget_schedule && policy.budget_schedule.length) return policy.budget_schedule.some(window => inWindow(window, t));
    return inWindow({from: policy.starts_at, to: policy.ends_at}, t);
  }

  function activePolicies(E, kind, t) {
    return E.policies.filter(policy => policy.kind === kind && policyActive(policy, t));
  }

  function policyBudgetAt(E, t) {
    let sum = 0;
    for (const policy of E.policies) {
      if (policy.status === 'cancelled') continue;
      for (const window of policy.budget_schedule || []) if (inWindow(window, t)) sum += window.value;
    }
    return sum;
  }

  // Authorised emission points (11.9): the printing limit before the złoty, the transitional coinage after.
  function emissionAuthorizedAt(E, t) {
    const kind = E.currency_regime === 'zloty' ? 'coinage' : 'emission';
    return activePolicies(E, kind, t).reduce((n, policy) => n + (policy.emission_points || 0), 0);
  }

  // The charge of one project in month t (11.2, 12.3): building or upkeep, never both; the nominal cost
  // stays while execution is limited or paused; nothing before the authorisation takes effect.
  function projectCharge(project, t) {
    if (!project || !project.authorized) return 0;
    if (project.status === 'executing') return t >= (project.charge_from === undefined ? project.started_at : project.charge_from) ? project.build_budget_B : 0;
    if (project.status === 'operating') {
      if (project.ends_at !== null && project.ends_at !== undefined && t >= project.ends_at) return 0;
      return project.upkeep_budget_B;
    }
    if (project.status === 'paused') return project.return_phase === 'operating' ? project.upkeep_budget_B : project.build_budget_B;
    return 0;
  }

  // budgetAt(t, S) of 11.2: the reading of the financial room, never cash. `extra` adds the charge,
  // policy, tax or emission of an offer for a forecast (11.3).
  function budgetAt(S, t, extra) {
    const E = S.economy, x = extra || {};
    const cycle = clip((E.output - 100) / 20, -3, 3);
    const burden = Math.min(3, Math.floor(Math.max(0, E.inflation_m) / 20));
    const policy = policyBudgetAt(E, t) + (x.policy || 0);
    let charges = x.charge || 0;
    for (const id of Object.keys(S.projects).sort()) charges += projectCharge(S.projects[id], t);
    const taxLevel = clip(E.tax_level + (x.tax || 0), -3, 3);
    const structural = E.budget_base + taxLevel + cycle - burden + policy - charges;
    const authorized = emissionAuthorizedAt(E, t) + (x.emission || 0);
    const emissionUsed = Math.min(authorized, Math.max(0, -structural));
    return {t: t, budget: structural + emissionUsed, structural_room: structural, emission_used: emissionUsed, cycle: cycle,
      inflation_burden: burden, policy_budget: policy, project_charges: charges, tax_level: taxLevel, base: E.budget_base};
  }

  // One shared degree of fiscal execution (11.3): full at −2 B or more, limited to −5 B, stopped below.
  function fiscalDelivery(budget) {
    return budget >= -2 ? 1 : budget >= -5 ? 0.5 : 0;
  }

  // ---- The one business reaction (11.7) -----------------------------------------------------------

  // One-off changes, once per case; opening the menu again or confirming an existing policy adds nothing.
  function changeBusinessPressure(S, delta, caseId, t, reason) {
    const E = S.economy;
    if (caseId && E.business_cases.indexOf(caseId) >= 0) return false;
    if (caseId) E.business_cases.push(caseId);
    E.business_pressure = clip(E.business_pressure + delta, 0, 100);
    S.history.reasons.push({t: t, kind: 'business_pressure', delta: delta, case_id: caseId || null, reason: reason || '',
      pressure: E.business_pressure});
    return true;
  }

  // At ≥40 a warning with its date; at ≥60 after at least one full month of warning, active. Active
  // lasts until the pressure is below 40 in two consecutive settlements; a warning below 40 closes at once.
  function updateBusinessState(E, t) {
    const p = E.business_pressure;
    if (E.business_state === 'quiet') {
      if (p >= 40) { E.business_state = 'warning'; E.warning_since = t; }
    } else if (E.business_state === 'warning') {
      if (p < 40) { E.business_state = 'quiet'; E.warning_since = null; }
      else if (p >= 60 && t - E.warning_since >= 1) { E.business_state = 'active'; E.calm_months = 0; }
    } else if (E.business_state === 'active') {
      if (p < 40) {
        E.calm_months += 1;
        if (E.calm_months >= 2) { E.business_state = 'quiet'; E.warning_since = null; E.calm_months = 0; }
      } else {
        E.calm_months = 0;
      }
    }
    return E.business_state;
  }

  // ---- One month of the economy (11.4–11.6), from the snapshot at the start of the period ----------

  // `inputs` are the effects of projects and policies of this month, each already scaled once by its
  // execution: works units and their output, credit support, the orders contribution, newly executed land
  // units, other one-off agrarian changes, a price shock and negotiated wage agreements (none before
  // stage 6). `budget` is the executed reading of 11.2 for month t.
  function settleEconomy(S, t, budget, inputs) {
    const E = S.economy, society = S.society, x = inputs || {};
    updateBusinessState(E, t);
    const capital = E.business_state === 'active' ? 1 : 0;
    const i0 = E.inflation_m, wage0 = E.real_wage, credit0 = E.credit, output0 = E.output;
    const monetary = shockAt(E, 'monetary', t);
    const priceShock = shockAt(E, 'price', t) + (x.price_shock || 0);
    const emission = budget.emission_used;
    const targetInflation = monetary + 3 * emission + priceShock;
    const inflation = clip(0.70 * i0 + 0.30 * targetInflation, -10, 1000);
    const indexedWage = wage0 * (1 + clip(i0, -10, 1000) / 100) / (1 + inflation / 100);
    const baseWage = Math.min(wage0, indexedWage);
    const recovery = inflation <= 5 && inflation <= i0 && credit0 >= 45 ? Math.min(3, Math.max(0, 100 - baseWage)) : 0;
    const agreementPP = clip(i0 + (x.wage_agreement_pp || 0), -10, 1000) - clip(i0, -10, 1000);
    const wage = baseWage + recovery + wage0 * agreementPP / (100 + inflation);
    const creditSupport = Math.min(20, x.credit_support || 0);
    const creditShock = shockAt(E, 'credit', t);
    const creditTarget = clip(55 - 0.10 * Math.max(0, i0) - 10 * capital + creditSupport - creditShock, 0, 100);
    const credit = 0.70 * credit0 + 0.30 * creditTarget;
    const outputShock = shockAt(E, 'output', t) + (x.orders_output_pp || 0);
    const privateGrowth = clip(0.015 * (credit0 - 55) + 0.008 * clip(wage0 - 100, -50, 50) - 0.50 * capital -
      0.03 * (x.strike_disruption || 0) + outputShock, -8, 6);
    const output = Math.max(1, output0 * (1 + (privateGrowth + (x.works_output_pp || 0)) / 100));
    const market = clip(E.market_unemployment - 0.35 * privateGrowth, 0, 100);
    const unemployment = clip(market - 0.25 * (x.works_units || 0), 0, 100);
    const agrarian = clip(society.agrarian_pressure + 0.03 * (50 - credit0) + shockAt(E, 'agrarian', t) -
      3 * (x.land_units || 0) + (x.agrarian_delta || 0), 0, 100);
    if (inflation === 1000 || inflation === -10) {
      S.history.reasons.push({t: t, kind: 'calibration_warning', field: 'inflation_m', value: inflation});
    }
    Object.assign(E, {inflation_m: inflation, real_wage: wage, credit: credit, output: output, market_unemployment: market,
      unemployment: unemployment, budget: budget.budget, last_growth: 100 * (output / output0 - 1)});
    society.agrarian_pressure = agrarian;
    const reading = {t: t, currency_regime: E.currency_regime, inflation_m: inflation, real_wage: wage, output: output,
      growth: E.last_growth, private_growth: privateGrowth, credit: credit, credit_target: creditTarget,
      market_unemployment: market, unemployment: unemployment, agrarian_pressure: agrarian,
      budget: budget.budget, structural_room: budget.structural_room, emission_used: budget.emission_used, cycle: budget.cycle,
      inflation_burden: budget.inflation_burden, policy_budget: budget.policy_budget, project_charges: budget.project_charges,
      tax_level: E.tax_level, delivery: fiscalDelivery(budget.budget), business_pressure: E.business_pressure,
      business_state: E.business_state, credit_support: creditSupport, works_units: x.works_units || 0,
      works_output_pp: x.works_output_pp || 0, orders_output_pp: x.orders_output_pp || 0, land_units: x.land_units || 0,
      strike_disruption: x.strike_disruption || 0, wage_agreement_pp: x.wage_agreement_pp || 0,
      shocks: {monetary: monetary, price: priceShock, credit: creditShock, output: outputShock - (x.orders_output_pp || 0),
        agrarian: shockAt(E, 'agrarian', t)}};
    E.history.push(reading);
    return reading;
  }

  // ---- Crises read from the settled history (11.9, 8.6, 17.13) ------------------------------------

  const lastReadings = (E, n) => E.history.slice(-n);

  // The currency component of majorCrisis: inflation of at least 20% a month in the last two settlements.
  function currencyCrisis(E) {
    const r = lastReadings(E, 2);
    return r.length === 2 && r.every(x => x.inflation_m >= 20);
  }

  function fiscalCrisis(E) {
    const r = lastReadings(E, 2);
    return r.length === 2 && r.every(x => x.budget < -2);
  }

  // The scenario credit crisis: credit below 35 in two settlements, or the dated impulse of 1925.
  function creditCrisis(E, t) {
    const r = lastReadings(E, 2);
    const low = r.length === 2 && r.every(x => x.credit < 35);
    const dated = E.shocks.some(entry => entry.id === 'credit_1925' && shockApplies(E, entry, t));
    return low || dated;
  }

  // ---- Living conditions and responsibility for the government (5.6, M09) --------------------------

  const GENERAL_SHARE = Object.freeze({workers: 1, new_middle: 0.5, old_middle: 0.25, rural: 0.2, bourgeois_landowners: 0});

  // One index per class row, from the snapshot after the economy of period t. The "unemployed" row reads
  // the workers' index and the "national minorities" row the average of the five class indices weighted
  // by the class weights (P, decision 2 of stage 4, until the cells of stage 5).
  function classConditions(Q) {
    const S = Q.S, E = S.economy, society = S.society;
    const general = (E.real_wage - 100) - 2 * (E.unemployment - 3);
    const ruralIndex = clip(100 + (45 - society.agrarian_pressure) * 0.4 + (society.rural_improvements || 0), 40, 140);
    const conditions = {
      workers: 100 + GENERAL_SHARE.workers * general,
      new_middle: 100 + GENERAL_SHARE.new_middle * general,
      old_middle: 100 + GENERAL_SHARE.old_middle * general,
      rural: ruralIndex + GENERAL_SHARE.rural * general,
      bourgeois_landowners: 100,
    };
    conditions.unemployed = conditions.workers;
    let weights = 0, sum = 0;
    for (const id of MAIN_CLASSES) {
      const weight = Math.max(0, Number(Q[id]) || 0);
      weights += weight;
      sum += weight * conditions[id];
    }
    conditions.national_minorities = weights > 0 ? sum / weights : 100;
    return conditions;
  }

  const electoralParty = id => (MINORITY_SEGMENTS.indexOf(id) >= 0 ? 'minorities_bloc' : id);

  // Responsibility from the cabinet record of the same snapshot, also for a caretaker cabinet: the
  // premier's party and member parties 1; parties with signed support or an explicit toleration 0.5
  // (PPS as external supporter, guarantors of an expert cabinet, the minority representations);
  // the opposition 0. A non-party premier and experts have no voters.
  function responsibilityWeights(S, parties) {
    const weights = {};
    for (const party of parties) weights[party] = 0;
    const cabinet = S.cabinet;
    if (!cabinet || (cabinet.status !== 'active' && cabinet.status !== 'caretaker')) return weights;
    const set = (id, value) => {
      const party = electoralParty(id);
      if (Object.prototype.hasOwnProperty.call(weights, party)) weights[party] = Math.max(weights[party], value);
    };
    if (cabinet.party) set(cabinet.party, 1);
    for (const id of cabinet.partner_ids || []) set(id, 1);
    for (const id of cabinet.supporter_ids || []) set(id, 0.5);
    return weights;
  }

  // One monthly flow in one class row of shares (sum 100); returns the applied flow in pp (negative:
  // the responsible parties lose). The loss is bounded by the responsibility-weighted pool.
  function applyFlow(shares, parties, change, weights) {
    const flow = change < 0 ? -Math.min(0.50, 0.10 * -change) : change > 0 ? Math.min(0.25, 0.05 * change) : 0;
    const responsible = parties.map((p, i) => i).filter(i => weights[parties[i]] > 0);
    const free = parties.map((p, i) => i).filter(i => !(weights[parties[i]] > 0));
    const weighted = responsible.reduce((n, i) => n + weights[parties[i]] * shares[i], 0);
    const freeTotal = free.reduce((n, i) => n + shares[i], 0);
    if (flow === 0 || !responsible.length || !free.length || weighted <= 0 || freeTotal <= 0) return 0;
    const amount = Math.min(Math.abs(flow), flow < 0 ? weighted : freeTotal);
    const sign = flow < 0 ? -1 : 1;
    const before = shares.slice();
    for (const i of responsible) shares[i] = before[i] + sign * amount * weights[parties[i]] * before[i] / weighted;
    for (const i of free) shares[i] = before[i] - sign * amount * before[i] / freeTotal;
    for (let i = 0; i < shares.length; i++) if (Math.abs(shares[i]) < 1e-12) shares[i] = 0;
    return sign * amount;
  }

  function classShares(Q, classId) {
    const raw = Q.parties.map(party => Math.max(0, Number(Q[classId + '_' + party]) || 0));
    const total = raw.reduce((n, v) => n + v, 0);
    return total > 0 ? raw.map(v => 100 * v / total) : null;
  }

  function writeClassShares(Q, classId, shares) {
    Q.parties.forEach((party, index) => { Q[classId + '_' + party] = shares[index]; });
  }

  // Inherited cards write German party rows; post_event transfers their deltas once. After a Polish
  // change the German aliases and their bases take the new values, so no false delta appears.
  function syncLegacyRows(Q) {
    for (const legacy of Object.keys(Q.legacy_party_map || {})) {
      const party = Q.legacy_party_map[legacy];
      for (const classId of Q.classes) {
        Q[classId + '_' + legacy] = Q[classId + '_' + party];
        Q[classId + '_' + legacy + '_compat_base'] = Q[classId + '_' + party];
      }
    }
    if (Q.national_minorities_pps !== undefined) {
      Q.catholics_spd = Q.national_minorities_pps;
      Q.catholics_spd_compat_base = Q.catholics_spd;
    }
  }

  // 4.2 step 6, first part: the flow of 5.6, once per settled month: in every cell of a class (stage 5),
  // or in every class row of a state without cells.
  function settleLivingConditions(Q, t) {
    const S = Q.S, society = S.society;
    const conditions = classConditions(Q);
    const weights = responsibilityWeights(S, Q.parties);
    if (electorate.hasCells(S)) {
      const out = electorate.settleLivingConditions(S, t, conditions, weights, applyFlow);
      electorate.writeClassMirrors(Q);
      const reading = S.economy.history.filter(r => r.t === t).slice(-1)[0];
      if (reading) reading.living = {conditions: copy(conditions), flows: copy(out.flows), moved: copy(out.moved), weights: copy(weights)};
      return {conditions: conditions, flows: out.flows, weights: weights};
    }
    const flows = {};
    for (const classId of Q.classes) {
      if (!Object.prototype.hasOwnProperty.call(conditions, classId)) continue;
      const last = society.living_conditions_last[classId];
      const change = conditions[classId] - (last === undefined ? conditions[classId] : last);
      const shares = classShares(Q, classId);
      let applied = 0;
      if (shares) {
        applied = applyFlow(shares, Q.parties, change, weights);
        if (applied !== 0) writeClassShares(Q, classId, shares);
      }
      society.living_conditions_last[classId] = conditions[classId];
      flows[classId] = applied;
    }
    syncLegacyRows(Q);
    const reading = S.economy.history.filter(r => r.t === t).slice(-1)[0];
    if (reading) reading.living = {conditions: copy(conditions), flows: copy(flows), weights: copy(weights)};
    return {conditions: conditions, flows: flows, weights: weights};
  }

  // 4.2 step 6, second part (17.4): the ongoing outflow of disappointed voters from PPS for its own
  // overdue obligations, min(PPS share, 0.5 × responsibility × min(1, weight/2)) pp a month, after 5.6.
  // Until the cell profiles of stage 5 every other party with a share in the row counts as an
  // accepted competitor (P); without one there is no transfer.
  function settleDisappointment(Q, t, overdueWeight, responsibility) {
    const S = Q.S;
    const perClass = 0.5 * (responsibility || 0) * Math.min(1, (overdueWeight || 0) / 2);
    if (electorate.hasCells(S)) {
      const out = electorate.settleDisappointment(S, t, perClass);
      electorate.writeClassMirrors(Q);
      const reading = S.economy.history.filter(r => r.t === t).slice(-1)[0];
      if (reading && perClass > 0) reading.disappointment = {weight: overdueWeight, responsibility: responsibility, outflows: copy(out)};
      return out;
    }
    const outflows = {};
    if (perClass <= 0) return outflows;
    const pps = Q.parties.indexOf('pps');
    for (const classId of Q.classes) {
      const shares = classShares(Q, classId);
      if (!shares) continue;
      const others = Q.parties.map((p, i) => i).filter(i => i !== pps && shares[i] > 0);
      const otherTotal = others.reduce((n, i) => n + shares[i], 0);
      const amount = Math.min(shares[pps], perClass);
      if (amount <= 0 || otherTotal <= 0) { outflows[classId] = 0; continue; }
      const before = shares.slice();
      shares[pps] = before[pps] - amount;
      for (const i of others) shares[i] = before[i] + amount * before[i] / otherTotal;
      writeClassShares(Q, classId, shares);
      outflows[classId] = amount;
    }
    syncLegacyRows(Q);
    const reading = S.economy.history.filter(r => r.t === t).slice(-1)[0];
    if (reading) reading.disappointment = {weight: overdueWeight, responsibility: responsibility, outflows: copy(outflows)};
    return outflows;
  }

  // ---- Mirrors and displays ---------------------------------------------------------------------------

  const round = (value, digits) => Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
  const signed = (value, digits) => {
    const text = Math.abs(value).toFixed(digits);
    return (value > 0 && +text !== 0 ? '+' : value < 0 && +text !== 0 ? '−' : '') + text;
  };

  // Fields that inherited scenes and displays read, written only from S.economy (leak 1 of 20.2):
  // `budget` is the reading of 11.2, `inflation` the monthly inflation, `economic_growth` the last change
  // of output; the weight of the unemployed row is fixed (decision 2 of stage 4).
  function writeEconomyMirrors(Q) {
    const S = Q.S;
    if (!S || !S.economy) return;
    const E = S.economy;
    Q.budget = round(E.budget, 2);
    Q.inflation = round(E.inflation_m, 2);
    Q.economic_growth = round(E.last_growth, 2);
    Q.unemployed = UNEMPLOYED_GROUP_WEIGHT;
    Q.pl_unemployment = round(E.unemployment, 2);
  }

  const REGIME_NAMES = Object.freeze({marka: 'Polish mark', stabilizing: 'Polish mark, currency reform in progress', zloty: 'złoty'});
  const BUSINESS_NAMES = Object.freeze({quiet: 'calm', warning: 'warning', active: 'active resistance (credit and output penalties)'});

  function economyDisplay(Q) {
    const S = Q.S, E = S.economy;
    const forecast = budgetAt(S, Q.time);
    const delivery = fiscalDelivery(forecast.budget);
    const deliveryText = delivery === 1 ? 'programmes run in full' : delivery === 0.5 ? 'programmes run at half strength' : 'programmes are stopped';
    const parts = ['base ' + signed(E.budget_base, 0), 'taxes ' + signed(forecast.tax_level, 0)];
    if (Math.abs(forecast.cycle) >= 0.005) parts.push('business cycle ' + signed(forecast.cycle, 2));
    if (forecast.inflation_burden) parts.push('inflation −' + forecast.inflation_burden);
    if (Math.abs(forecast.policy_budget) > 1e-9) parts.push('instruments ' + signed(forecast.policy_budget, 0));
    if (Math.abs(forecast.project_charges) > 1e-9) parts.push('programmes −' + round(forecast.project_charges, 2));
    if (forecast.emission_used >= 0.005) parts.push('emission ' + signed(forecast.emission_used, 2));
    return {
      budget: signed(round(forecast.budget, 2), 2) + ' B this month (' + parts.join(', ') + '); ' + deliveryText,
      inflation: round(E.inflation_m, 1).toFixed(1) + '% a month',
      real_wage: round(E.real_wage, 1).toFixed(1),
      output: round(E.output, 1).toFixed(1) + ' (last month ' + signed(round(E.last_growth, 2), 2) + '%)',
      credit: round(E.credit, 1).toFixed(1),
      unemployment: round(E.unemployment, 2).toFixed(2) + '%' + (E.market_unemployment - E.unemployment > 1e-9 ?
        ' (' + round(E.market_unemployment, 2).toFixed(2) + '% without public works)' : ''),
      agrarian: round(S.society.agrarian_pressure, 1).toFixed(1),
      business: BUSINESS_NAMES[E.business_state] + ', pressure ' + round(E.business_pressure, 0),
      currency: REGIME_NAMES[E.currency_regime] || E.currency_regime,
      forecast: forecast,
    };
  }

  return Object.freeze({
    ECONOMY_PROFILE_ID: ECONOMY_PROFILE_ID,
    UNEMPLOYED_GROUP_WEIGHT: UNEMPLOYED_GROUP_WEIGHT,
    SCENARIO_SHOCKS: SCENARIO_SHOCKS,
    MAIN_CLASSES: MAIN_CLASSES,
    LIVING_CLASSES: LIVING_CLASSES,
    createEconomyState: createEconomyState,
    shockAt: shockAt,
    addShock: addShock,
    policyActive: policyActive,
    activePolicies: activePolicies,
    policyBudgetAt: policyBudgetAt,
    emissionAuthorizedAt: emissionAuthorizedAt,
    projectCharge: projectCharge,
    budgetAt: budgetAt,
    fiscalDelivery: fiscalDelivery,
    changeBusinessPressure: changeBusinessPressure,
    updateBusinessState: updateBusinessState,
    settleEconomy: settleEconomy,
    currencyCrisis: currencyCrisis,
    fiscalCrisis: fiscalCrisis,
    creditCrisis: creditCrisis,
    classConditions: classConditions,
    responsibilityWeights: responsibilityWeights,
    applyFlow: applyFlow,
    classShares: classShares,
    syncLegacyRows: syncLegacyRows,
    settleLivingConditions: settleLivingConditions,
    settleDisappointment: settleDisappointment,
    writeEconomyMirrors: writeEconomyMirrors,
    economyDisplay: economyDisplay,
  });
}));
