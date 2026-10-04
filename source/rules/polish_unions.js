// Polish chapter unions and strikes: the steps of a union dispute, the potential of an action, the strike
// record and its phases, the government's answer and the union's consent, the settlement and its execution, the
// inputs of strikes and wage agreements to the economy, the wage case of 1923 and Kraków, the communists in a
// strike, the answer of the authorities and of the Sejm, the card E6, and the collective agreements, synthetic
// plant records and derogations that the government cards of 8.1 and 8.6 act on (docs/POLISH_IMPLEMENTATION_PLAN.md,
// stage 6; technical reference 9.6, 14.1–14.5, 16.5, 17.4, 17.5, 17.5.1, 17.12, 17.16.5).
//
// Plain JavaScript without dependencies, like polish_rules.js, whose clock, cooldowns, transactions and recorded
// draws it uses. `npm run build` copies it to out/html/; the page loads it after polish_party.js as
// `window.PolishUnions`, and Node tests load it with require(). Numbers marked P in the reference are taken as
// written; where the reference leaves a gap, the archived M02 profile (analysis/m02-robustness/engine.cjs) is
// followed. They are a working balance, not historical statistics.
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./polish_rules.js'), require('./polish_economy.js'), require('./polish_government.js'),
      require('./polish_electorate.js'), require('./polish_party.js'));
  } else {
    root.PolishUnions = factory(root.PolishRules, root.PolishEconomy, root.PolishGovernment, root.PolishElectorate, root.PolishParty);
  }
}(typeof self !== 'undefined' ? self : this, function (rules, economy, government, electorate, party) {
  'use strict';

  if (!rules || !economy || !government || !electorate || !party) {
    throw new Error('PolishUnions needs polish_rules.js, polish_economy.js, polish_government.js, polish_electorate.js and polish_party.js first');
  }

  const copy = value => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
  const clip = (value, low, high) => Math.max(low, Math.min(high, value));
  const round = (value, digits) => Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
  const OK = Object.freeze({available: true, reason: ''});
  const no = reason => ({available: false, reason: reason});
  // Polish version (decision 2A): the texts of this module are written in both languages and L picks the current
  // one; numbers get a decimal comma and dates a Polish month in Polish (decision 6A).
  const L = rules.L;
  const PL = () => rules.getLanguage() === 'pl';
  const fmt = value => {
    const text = Math.abs(value) < 0.005 ? '0' : value.toFixed(2).replace(/\.?0+$/, '');
    return PL() ? text.replace('.', ',') : text;
  };
  // 'until 3/1925' in English; 'do marca 1925' in Polish (every use of a date here follows 'until' or 'since').
  const dateOf = t => (PL() ? rules.monthYear(t, 'gen') : rules.monthOf(t) + '/' + rules.yearOf(t));

  const BRANCHES = party.BRANCHES;
  const BRANCH_NAMES = Object.freeze({industry: 'Industry', rail: 'Railways', farm_labour: 'Agricultural labour'});
  const branchName = id => L(BRANCH_NAMES[id], party.BRANCH_NAMES_PL[id]);
  // A list of branches inside a sentence: 'industry and railways'; in Polish 'przemysł i kolej'.
  const branchList = (ids, joiner) => (PL() ? ids.map(id => party.BRANCH_NAMES_PL[id].toLowerCase()).join(' i ') :
    ids.map(id => BRANCH_NAMES[id].toLowerCase()).join(joiner || ' and '));
  // 14.4 (P): the importance of a sector in the talks.
  const SECTOR_IMPORTANCE = Object.freeze({industry: 60, rail: 90, farm_labour: 40});
  // 17.4: the weights of the branches in the disruption of production.
  const DISRUPTION_WEIGHTS = Object.freeze({industry: 0.5, rail: 0.3, farm_labour: 0.2});
  // P (archived M02 profile): the share of the modelled wage earners covered by a wage agreement of a branch.
  const WAGE_SCOPE = Object.freeze({industry: 0.6, rail: 0.2, farm_labour: 0.2});
  // 14.4 (P): the thresholds of a limited, a broad and a structural demand.
  const THRESHOLDS = Object.freeze({limited: 40, broad: 60, structural: 80});
  // 10.3: the lines of a strike call whose alignment decides compliance; 50 in the test profile.
  const LINES = Object.freeze({strike: 'the strike', agreed_end: 'the agreed end of a strike'});
  const LINES_PL = Object.freeze({strike: 'strajk', agreed_end: 'uzgodnione zakończenie strajku'});
  // 17.5: the clauses a settlement can have, each with its executor; the economic ones are signed by employers.
  const CLAUSES = Object.freeze({
    wages: {name: 'wages and the return to work', executor: 'employers'},
    conditions: {name: 'working conditions', executor: 'employers'},
    rail_militarization: {name: 'the end of the militarisation of the railways', executor: 'cabinet'},
    repression: {name: 'the withdrawal of the named repressive measure', executor: 'interior'},
  });
  const DEMAND_NAMES = Object.freeze({wages: 'wages', conditions: 'working conditions', rail_militarization: 'the end of the rail militarisation',
    repression: 'the end of the repression', cabinet_resignation: 'the resignation of the cabinet'});
  const CLAUSE_NAMES_PL = Object.freeze({wages: 'płace i powrót do pracy', conditions: 'warunki pracy', rail_militarization: 'koniec militaryzacji kolei',
    repression: 'wycofanie wskazanego środka represji'});
  const DEMAND_NAMES_PL = Object.freeze({wages: 'płace', conditions: 'warunki pracy', rail_militarization: 'koniec militaryzacji kolei',
    repression: 'koniec represji', cabinet_resignation: 'dymisja gabinetu'});
  const clauseName = kind => L(CLAUSES[kind].name, CLAUSE_NAMES_PL[kind]);
  const demandName = kind => L(DEMAND_NAMES[kind], DEMAND_NAMES_PL[kind]);
  const PREPARE_COOLDOWN = 2;     // 14.1: agreeing the demands and the end, cd 2 M
  const READINESS_STEP = 15;      // 14.1
  const ALIGN_STEP = 15;          // 10.3, 14.1: an accepted internal agreement
  const MEDIATE_STEP = 8;         // 14.1
  const FATIGUE_STEP = 5;         // 17.4: an active month +5, a calm month −5
  const UNDERFUNDED_DISSENT = 3;  // P, 14.5: continuing without the money raises dissent against the line
  const WAGE_AGREEMENT_PP = 2;    // 17.5: +2 for 2 months for the covered scope
  const WAGE_AGREEMENT_MONTHS = 2;
  const LIVE = Object.freeze(['prepared', 'negotiating', 'active', 'settlement_pending']);
  const LEVEL_ORDER = Object.freeze(['limited', 'broad', 'structural']);
  const STRIKING = Object.freeze(['active', 'settlement_pending']);
  // 17.16.5 (P): three completed months of real wages below 80 open one wage case of the covered wage earners.
  const WAGE_CASE_BRANCHES = Object.freeze(['industry', 'rail']);
  const WAGE_CASE_LIMIT = 80;
  const WAGE_CASE_MONTHS = 3;
  const CASE_COOLDOWN = 3;          // 17.16.5: a new case at the earliest 3 months after the last one closed
  // 9.6 (P): the communists' own contribution in points of participation, their goal and the share of the workers'
  // vote from which they act in a strike of industry or the railways. Stage 8 (8f, profile kpp_goal_1922_1926): the
  // goal is political (structural); in 1923 the KPRP sought to overthrow the cabinet by a general strike and to form a
  // workers' and peasants' government (HISTORICAL_SOURCES.md). The game keeps the name KPP for the whole chapter.
  const PARTNER_CONTRIBUTION = 10;
  const PARTNER_GOAL = 'structural';
  const PARTNER_PRESENCE = 5;
  const PARTNER_BRANCHES = Object.freeze(['industry', 'rail']);
  const E6_THRESHOLD = 10;          // P: the smallest refusing group that opens the card E6
  const PROTECTION_COST = 0.5;      // 17.5: the Milicja's protection of a strike costs 0.5 R
  const MILITIA_LOSS = 0.02;        // 17.5: 2% of the assigned people in a clash
  const KRAKOW_WINDOW = Object.freeze([rules.timeOf(1923, 10), rules.timeOf(1923, 11)]); // 17.5: the test window X–XI 1923
  // 17.5, 17.16.5 (P, strike_state_profiles_v1): how the authorities answer a strike when no PPS minister holds the
  // competence: Chjeno-Piast uses coercion in an active dispute after a refused settlement, a cabinet with PPS settles,
  // the others protect the gatherings. Not a historical label of every right-wing government.
  const STATE_PROFILE_ID = 'strike_state_profiles_v1';
  // Decision 2A of stage 6 (P, synthetic_plants_v1): a plant enters the record through a problem of an existing system
  // — a credit crisis or an active reaction of business in industry, a strike ended by exhaustion in its branch. It has
  // no name and no historical identity; its numbers are test values.
  const PLANT_PROFILE_ID = 'synthetic_plants_v1';
  const PLANT_LOST_CAPACITY = 20;
  const PLANT_WORKERS_SHARE = 0.10;
  const PLANT_KINDS = Object.freeze({industry: 'industrial plant', rail: 'railway workshop', farm_labour: 'estate'});
  const PLANT_KINDS_PL = Object.freeze({industry: 'zakład przemysłowy', rail: 'warsztat kolejowy', farm_labour: 'majątek ziemski'});
  const PLANT_HINT = 'plants are recorded by a credit crisis, an active reaction of business or a strike ended by exhaustion';
  const PLANT_HINT_PL = 'zakład zapisuje kryzys kredytowy, aktywna reakcja przedsiębiorców albo strajk zakończony wyczerpaniem';
  // Texts this module stores in the records of S stay in English (decision 5A); the Polish display translates them.
  const STORED_PL = Object.freeze({'its private owner': 'prywatny właściciel', 'the workers of the branch': 'robotnicy branży',
    'working time in this plant only': 'czas pracy tylko w tym zakładzie', 'the workers of the plant': 'robotnicy zakładu'});
  rules.registerStoredText(text => STORED_PL[text]);
  // Card 8.1 (Z — 0.37; P terms): a collective agreement is 1 T and 0 B, paid by the employers who sign it; its wage
  // effect passes once through 11.4 as the wage clause of a settlement (+2 × the branch's scope for two months) and
  // it runs for twelve months. A derogation is 1 T and 0 B for one threatened plant, for six months.
  const COLLECTIVE_TERM = 12;
  const DEROGATION_MONTHS = 6;
  const DEROGATION_BUSINESS = -4;
  const DEROGATION_GRIEVANCE = 3;

  function ready(Q) {
    return !!(Q && Q.S && Q.polish_union_rules && !Q.polish_save_incompatible && Q.S.strikes && Q.S.strikes.records && Q.S.unions && Q.S.unions.industry);
  }

  function waitReason(Q, key) {
    const wait = rules.cooldownRemaining(Q, key);
    return wait > 0 ? L('Available again in ' + wait + (wait === 1 ? ' month.' : ' months.'),
      'Znów dostępne za ' + wait + ' ' + rules.plural(wait, 'miesiąc', 'miesiące', 'miesięcy') + '.') : '';
  }

  // The branches keep the two lines of a strike call and the causes of their dissent (a branch created before
  // stage 6 gets them here); the records of strikes start empty (schema 7).
  function attachUnionState(Q) {
    const S = Q.S;
    for (const id of BRANCHES) {
      const branch = S.unions[id];
      for (const line of Object.keys(LINES)) if (branch.alignment[line] === undefined) branch.alignment[line] = 50;
      if (!Array.isArray(branch.dissent_causes)) branch.dissent_causes = [];
    }
    return S.strikes;
  }

  // ---- Records ------------------------------------------------------------------------------------------

  function recordOf(S, id) {
    return (id && S.strikes.records[id]) || null;
  }

  function records(S, statuses) {
    return Object.keys(S.strikes.records).sort().map(id => S.strikes.records[id]).filter(r => !statuses || statuses.indexOf(r.status) >= 0);
  }

  function branchRecord(S, branchId) {
    const rec = recordOf(S, S.unions[branchId].strike);
    return rec && LIVE.indexOf(rec.status) >= 0 ? rec : null;
  }

  function newRecord(Q, fields) {
    const S = Q.S, st = S.strikes;
    st.seq += 1;
    const id = 'strike-' + st.seq + '-t' + Q.time;
    const rec = Object.assign({id: id, kind: 'own', branches: [], demands: [], level: 'limited', threshold: THRESHOLDS.limited,
      created_at: Q.time, started_at: null, status: 'prepared', participants: {}, coverage: {}, uncontrolled_participation: 0,
      cost_paid: 0, disruption: {}, offer: null, termination_terms: {red_lines: ['no_reprisals'], agreed_end: true}, outcome: null,
      last_processed_time: null, communist_cooperation: null, rounds: [], rejected: false, political_refused: false, settlements: [],
      strategy: null, state_response: null, parliament_responses: [], ended_at: null, clashes: [], protection: null, repression: null,
      rail_militarized: null, krakow: false, response_phase: 0, response_answered: 0, awaiting_rejection: null, pps_support: true,
      pps_answered: true, steps: null, agreed_end: false, breached_by_pps: false, history: [{t: Q.time, kind: 'created'}]}, fields);
    st.records[id] = rec;
    for (const b of rec.branches) S.unions[b].strike = id;
    return rec;
  }

  function endRecord(S, rec, outcome, t, Q) {
    rec.status = 'ended';
    rec.outcome = outcome;
    rec.ended_at = t;
    rec.offer = null;
    rec.awaiting_rejection = null;
    for (const b of rec.branches) if (S.unions[b].strike === rec.id) S.unions[b].strike = null;
    rec.history.push({t: t, kind: 'ended', outcome: outcome});
    if (Q) closeJointActions(Q, rec);
  }

  // The end of a strike settles its joint actions once (9.6, 5.5): the trial with the communists succeeds when the
  // partner kept the agreed rules, whatever the employer did (full +5, limited +2 relation; a breach −5); the Bund's
  // joint action in industry gives +5 for an agreed end and −5 when PPS broke the settlement.
  function closeJointActions(Q, rec) {
    const S = Q.S, coop = rec.communist_cooperation;
    if (coop && coop.trial && !coop.resolved) {
      coop.resolved = true;
      party.resolveTrial(Q, rec.id, coop.complied ? 'success' : 'failure');
      if (coop.complied) government.changeRelation(Q, 'kpp', coop.mode === 'full' ? 5 : 2, 'strike_trial:' + rec.id);
    }
    if (rec.bund_joint && !rec.bund_closed) {
      rec.bund_closed = true;
      party.bundJointAction(Q, {id: rec.id, result: rec.breached_by_pps ? 'breach' : rec.outcome === 'agreement' && rec.agreed_end ? 'success' : 'none'});
    }
  }

  function demandsFor(level) {
    return level === 'broad' ? [{kind: 'wages'}, {kind: 'conditions'}] : [{kind: 'wages'}];
  }

  const economicDemands = rec => rec.demands.filter(d => CLAUSES[d.kind]).map(d => d.kind);

  // A single demand is limited (40), a package broad (60), a political demand structural (80) until it is refused.
  function updateThreshold(rec) {
    const political = rec.demands.some(d => d.kind === 'cabinet_resignation') && !rec.political_refused;
    rec.level = political ? 'structural' : economicDemands(rec).length >= 2 ? 'broad' : 'limited';
    rec.threshold = THRESHOLDS[rec.level];
  }

  function addDemand(rec, kind, t) {
    if (rec.demands.some(d => d.kind === kind)) return false;
    rec.demands.push({kind: kind, added_at: t});
    updateThreshold(rec);
    return true;
  }

  // ---- The potential of an action (14.2, 17.4) ------------------------------------------------------------

  const lineAlignment = (branch, line) => (branch.alignment[line] === undefined ? 50 : branch.alignment[line]);

  function effectiveReadiness(branch) {
    return branch.readiness * (1 - branch.fatigue / 100);
  }

  function callCompliance(S, branch, line) {
    return party.compliance(lineAlignment(branch, line), party.cohesion(S), branch.dissent);
  }

  function participation(S, branchId) {
    const branch = S.unions[branchId];
    return branch.reach * (effectiveReadiness(branch) / 100) * callCompliance(S, branch, 'strike');
  }

  const monthlyStrikeCost = value => 0.10 + 0.01 * value;
  const fundAdequacy = (fund, cost) => Math.min(1, fund / (2 * cost));
  const fundCoverage = (fund, cost) => Math.min(1, fund / cost);

  // Before a strike its credible pressure uses two months of upkeep (14.2).
  function potential(S, branchId) {
    const branch = S.unions[branchId], value = participation(S, branchId), cost = monthlyStrikeCost(value);
    const adequacy = fundAdequacy(branch.fund, cost);
    return {participation: value, cost: cost, adequacy: adequacy, credible: value * adequacy};
  }

  // During a strike the credible pressure is the active participation of the month (14.2), plus the agreed and
  // kept contribution of a partner (9.6), at most 100.
  function branchCredible(S, rec, branchId) {
    if (STRIKING.indexOf(rec.status) < 0) return potential(S, branchId).credible;
    const partner = rec.communist_cooperation && rec.communist_cooperation.pressure ? rec.communist_cooperation.pressure[branchId] || 0 : 0;
    return Math.min(100, (rec.participants[branchId] || 0) + partner);
  }

  // ---- The government's answer (14.4) ------------------------------------------------------------------

  function negotiatingPressure(credible, importance, fragility) {
    return 0.50 * credible + 0.30 * importance + 0.20 * fragility;
  }

  function successChance(pressure, threshold) {
    return clip(0.50 + (pressure - threshold) / 100, 0.05, 0.95);
  }

  // Every branch of the action must accept the same offer: the chance of a round is the smallest of theirs (P, M02).
  function roundChance(S, rec, threshold) {
    const fragility = government.governmentFragility(S);
    const rows = rec.branches.map(b => {
      const credible = branchCredible(S, rec, b);
      const pressure = negotiatingPressure(credible, SECTOR_IMPORTANCE[b], fragility);
      return {branch: b, credible: credible, pressure: pressure, chance: successChance(pressure, threshold)};
    });
    return {fragility: fragility, threshold: threshold, rows: rows, chance: rows.length ? Math.min(...rows.map(r => r.chance)) : 0};
  }

  function offerOf(rec, kinds, t) {
    return {id: rec.id + ':offer-' + (rec.rounds.length + 1), t: t, clauses: kinds.map(kind => ({kind: kind, executor: CLAUSES[kind].executor})),
      fulfilment: kinds.length / Math.max(1, rec.demands.length), red_line: false, status: 'open', consent: null};
  }

  // 17.4 (Z — 0.24, M12): the union accepts when 0.5·fulfilment + 0.3·trust + 0.2·continuationCost ≥ 50, where the
  // cost of going on is the larger of the missing money and the fatigue. A full offer is always accepted; an offer
  // across a red line never.
  function unionConsent(input) {
    const fulfilment = clip(input.fulfilment, 0, 1);
    const continuation = Math.max(100 * (1 - clip(input.coverage, 0, 1)), input.fatigue || 0);
    const score = 0.5 * 100 * fulfilment + 0.3 * input.trust + 0.2 * continuation;
    if (input.red_line) return {score: score, continuation: continuation, accept: false, reason: 'red_line'};
    if (fulfilment >= 1) return {score: score, continuation: continuation, accept: true, reason: 'full'};
    return {score: score, continuation: continuation, accept: score >= 50 - 1e-9, reason: score >= 50 - 1e-9 ? 'score' : 'refused'};
  }

  function consentFor(S, rec, offer) {
    const rows = rec.branches.map(b => {
      const branch = S.unions[b];
      const coverage = fundCoverage(branch.fund, monthlyStrikeCost(participation(S, b)));
      return Object.assign({branch: b}, unionConsent({fulfilment: offer.fulfilment, trust: branch.trust, coverage: coverage,
        fatigue: branch.fatigue, red_line: offer.red_line}));
    });
    return {accept: rows.every(r => r.accept), rows: rows};
  }

  // One round of a dispute (14.3–14.4): one recorded draw decides which offer the government accepts in this round;
  // a smaller offer reads the same draw. A political demand has no executor among employers, so it is refused
  // without a draw and the next round returns to the limited wage offer (14.4; archived M02 profile).
  function negotiationRound(Q, rec, t) {
    const S = Q.S, n = rec.rounds.length + 1;
    if (rec.demands.some(d => d.kind === 'cabinet_resignation') && !rec.political_refused) {
      rec.political_refused = true;
      rec.threshold = THRESHOLDS.limited;
      rec.rejected = true;
      rec.rounds.push({n: n, t: t, u: null, threshold: THRESHOLDS.structural, chance: 0, offer: null, reason: 'no_executor'});
      rec.history.push({t: t, kind: 'political_demand_refused'});
      return null;
    }
    const u = rules.roll(S, 'strike:' + rec.id + ':round:' + n);
    const full = roundChance(S, rec, rec.threshold);
    const economic = economicDemands(rec);
    let offer = null, reduced = null;
    if (economic.length && u < full.chance) offer = offerOf(rec, economic, t);
    else if (rec.threshold > THRESHOLDS.limited && economic.indexOf('wages') >= 0) {
      reduced = roundChance(S, rec, THRESHOLDS.limited);
      if (u < reduced.chance) offer = offerOf(rec, ['wages'], t);
    }
    rec.rounds.push({n: n, t: t, u: u, threshold: rec.threshold, chance: full.chance, reduced_chance: reduced ? reduced.chance : null,
      fragility: full.fragility, rows: full.rows, offer_id: offer ? offer.id : null});
    if (offer) {
      offer.consent = consentFor(S, rec, offer);
      rec.offer = offer;
      rec.status = 'settlement_pending';
      rec.response_phase += 1;
      rec.history.push({t: t, kind: 'offer', offer_id: offer.id, fulfilment: offer.fulfilment});
    } else {
      rec.rejected = true;
      rec.history.push({t: t, kind: 'refused', round: n});
      if (rec.status === 'active') authoritiesAfterRefusal(Q, rec, t, n);
    }
    return offer;
  }

  // ---- The authorities (17.5, 17.16.5; decision 3A of stage 6) -----------------------------------------------

  function cabinetProfile(S) {
    const cabinet = S.cabinet;
    if (!cabinet || cabinet.status === 'ended') return 'protect';
    if (cabinet.configuration_id === 'chjeno_piast') return 'repress';
    if ((cabinet.partner_ids || []).indexOf('pps') >= 0) return 'settle';
    return 'protect';
  }

  // One answer of the state in the phase of the protest (B8+B10): a PPS minister replaces the cabinet only within its
  // competence — Labour mediates, the Interior disposes of the police, the Military Affairs decide the railways;
  // Labour gives no order to the police.
  function stateResponse(S) {
    const cabinet = S.cabinet, portfolios = cabinet && cabinet.portfolios ? cabinet.portfolios : {};
    const profile = cabinetProfile(S);
    return {profile_id: STATE_PROFILE_ID, profile: profile,
      labour: portfolios.labor === 'pps' ? 'pps_mediation' : 'cabinet',
      police: portfolios.interior === 'pps' ? 'pps_protection' : profile,
      railways: portfolios.reichswehr === 'pps' ? 'pps' : profile === 'repress' ? 'militarize' : 'none'};
  }

  function averageCompliance(S, rec, line) {
    return rec.branches.reduce((n, b) => n + callCompliance(S, S.unions[b], line), 0) / Math.max(1, rec.branches.length);
  }

  // After a refused round of an active strike a repressive police answers with the named measure, and on the railways
  // the cabinet militarises them (once each); a clash is drawn once for this phase of the meeting (17.5). Grievance,
  // violence and exposure are recorded for stage 7 (decision 1A); the Milicja loses 2% of the people it assigned.
  function authoritiesAfterRefusal(Q, rec, t, round) {
    const S = Q.S, response = rec.state_response || stateResponse(S);
    rec.state_response = response;
    if (response.police !== 'repress') return null;
    let changed = false;
    if (!rec.repression) {
      rec.repression = {since: t, decided: false};
      addDemand(rec, 'repression', t);
      changed = true;
    }
    if (rec.branches.indexOf('rail') >= 0 && response.railways === 'militarize' && !rec.rail_militarized) {
      rec.rail_militarized = {since: t};
      addDemand(rec, 'rail_militarization', t);
      recordPendingEffect(S, {id: rec.id + ':rail_militarization', system: 'grievance', stage: 7, value: 10, cause: 'rail_militarization', branches: ['rail']});
      changed = true;
    }
    if (rec.kind === 'wage_case' && t >= KRAKOW_WINDOW[0] && t <= KRAKOW_WINDOW[1]) rec.krakow = true;
    if (changed) rec.response_phase += 1;
    const risk = clip(0.10 + 0.004 * (rec.uncontrolled_participation || 0) + 0.25 + 0.20 * 0 - 0.20 * averageCompliance(S, rec, 'strike'), 0, 0.90);
    const u = rules.roll(S, 'strike:' + rec.id + ':clash:' + round);
    const clash = {t: t, round: round, risk: risk, u: u, clash: u < risk, militia_lost: 0};
    if (clash.clash) {
      recordPendingEffect(S, {id: rec.id + ':violence:' + round, system: 'violence', stage: 7, value: 10, cause: 'strike_clash'});
      recordPendingEffect(S, {id: rec.id + ':repression_exposure:' + round, system: 'repression_exposure', stage: 7, value: 1,
        branches: rec.branches.slice(), exposure_cut: rec.protection ? rec.protection.exposure_cut : 0});
      if (rec.protection) {
        const lost = Math.round(MILITIA_LOSS * rec.protection.people);
        S.militia.strength = Math.max(0, S.militia.strength - lost);
        rec.protection.lost += lost;
        clash.militia_lost = lost;
      }
    }
    rec.clashes.push(clash);
    return clash;
  }

  // ---- The settlement and its execution (14.5, 17.5) --------------------------------------------------

  function signSettlement(Q, rec, offer, agreedEnd) {
    const t = Q.time, id = 'set-' + rec.id + '-' + (rec.settlements.length + 1);
    const settlement = {id: id, kind: 'strike_settlement', strike_id: rec.id, branches: rec.branches.slice(), signed_at: t, status: 'active',
      clauses: offer.clauses.map(c => ({id: id + ':' + c.kind, kind: c.kind, executor: c.executor, due_at: t + 1, weight: 1, status: 'pending',
        executed_at: null})),
      fulfilment: offer.fulfilment, agreed_end: agreedEnd, relief_recorded: false, reaction: null, history: [{t: t, kind: 'signed'}]};
    rec.settlements.push(settlement);
    return settlement;
  }

  // P: employers pay the wages and the conditions they signed at the due date; other executors come with 6b.
  function executorActs(S, clause) {
    return clause.executor === 'employers';
  }

  // 4.2 step 4: the due clauses of signed settlements are executed before the economy of the period, so an agreed
  // rise counts from the month after the signature (17.5; archived M02 profile). The first full execution records
  // the relief of 14.5 once per settlement; grievance comes with stage 7 (decision 1A of stage 6).
  function executeSettlements(Q, t) {
    const S = Q.S;
    for (const rec of records(S)) {
      for (const settlement of rec.settlements) {
        if (settlement.status !== 'active') continue;
        for (const clause of settlement.clauses) {
          if (clause.status !== 'pending' || t < clause.due_at || !executorActs(S, clause)) continue;
          clause.status = 'executed';
          clause.executed_at = t;
          settlement.history.push({t: t, kind: 'executed', clause_id: clause.id});
        }
        if (settlement.clauses.every(c => c.status === 'executed')) {
          settlement.status = 'executed';
          settlement.executed_at = t;
          if (!settlement.relief_recorded) {
            settlement.relief_recorded = true;
            recordPendingEffect(S, {id: settlement.id + ':relief', system: 'grievance', stage: 7, value: -4, cause: 'settlement_executed',
              branches: settlement.branches.slice()});
          }
        }
      }
    }
  }

  // Effects on grievance and radicalisation wait for stage 7 (decision 1A of stage 6): each is recorded once by ID.
  function recordPendingEffect(S, effect) {
    const list = S.strikes.pending_effects;
    if (list.some(e => e.id === effect.id)) return false;
    list.push(Object.assign({t: S.turn.last_settled_time}, effect));
    return true;
  }

  function wageAgreementInput(S, t) {
    let pp = 0;
    // Collective agreements of the branches (8.1, 17.12): signed by the employers, +2 for two months of their scope.
    for (const id of BRANCHES) {
      for (const agreement of S.unions[id].agreements || []) {
        if (agreement.kind === 'collective' && t >= agreement.starts_at && t < agreement.expires_at) pp += agreement.wage_pp * agreement.covered_share;
      }
    }
    for (const rec of records(S)) {
      for (const settlement of rec.settlements) {
        const wages = settlement.clauses.filter(c => c.kind === 'wages' && c.status === 'executed')[0];
        if (!wages || t < wages.executed_at || t >= wages.executed_at + WAGE_AGREEMENT_MONTHS) continue;
        pp += WAGE_AGREEMENT_PP * settlement.branches.reduce((n, b) => n + WAGE_SCOPE[b], 0);
      }
    }
    return pp;
  }

  // ---- One month (4.2 steps 4 and 6) ----------------------------------------------------------------------

  function addCause(branch, id, amount) {
    if (branch.dissent_causes.some(c => c.id === id)) return;
    branch.dissent_causes.push({id: id, amount: amount, status: 'open'});
  }

  // The end imposed without the agreed conditions: dissent +10 and trust −8 (14.5).
  function imposeEnd(branch, rec, t) {
    branch.dissent = clip(branch.dissent + 10, 0, 100);
    branch.trust = clip(branch.trust - 8, 0, 100);
    addCause(branch, 'imposed_end:' + rec.id + ':t' + t, 10);
  }

  function processStrike(Q, rec, t, striking) {
    const S = Q.S;
    for (const b of rec.branches) {
      const branch = S.unions[b];
      // After PPS withdrew its support (17.5.1 „order”) those who follow the call to end leave the action.
      const followers = rec.pps_support ? 1 : 1 - callCompliance(S, branch, 'agreed_end');
      const value = participation(S, b) * followers, cost = monthlyStrikeCost(value), coverage = fundCoverage(branch.fund, cost);
      const draw = Math.min(branch.fund, cost);
      branch.fund = Math.max(0, round(branch.fund - draw, 6));
      rec.cost_paid = round(rec.cost_paid + draw, 6);
      rec.participants[b] = value * coverage;
      rec.coverage[b] = coverage;
      if (coverage < 1) {
        branch.dissent = clip(branch.dissent + UNDERFUNDED_DISSENT, 0, 100);
        addCause(branch, 'underfunded:' + rec.id + ':t' + t, UNDERFUNDED_DISSENT);
      }
      rec.disruption[b] = Math.min(100, rec.participants[b] + (rec.uncontrolled_participation || 0)) * SECTOR_IMPORTANCE[b] / 100;
      striking[b] = true;
    }
    rec.last_processed_time = t;
    rec.history.push({t: t, kind: 'month', participants: copy(rec.participants), coverage: copy(rec.coverage)});
  }

  // 4.2 step 4, before the economy of period t: the unions' own funds (14.1), due settlement clauses (14.5), one draw
  // of each active strike on the fund of each of its branches (14.2–14.3), fatigue (17.4), and the inputs of strikes
  // and wage agreements to the economy (17.4, 11.4).
  function beginMonth(Q, settlement) {
    if (!ready(Q) || !settlement) return null;
    const S = Q.S, t = settlement.t;
    // Once per period: a second visit of the same settlement changes nothing (4.2).
    if (S.strikes.begun_t === t) return S.strikes.inputs;
    S.strikes.begun_t = t;
    const clock = {time: Q.time, year: Q.year, month: Q.month};
    Q.time = t; Q.year = rules.yearOf(t); Q.month = rules.monthOf(t);
    try {
      for (const id of BRANCHES) {
        const branch = S.unions[id];
        branch.fund = Math.max(0, round(branch.fund + Math.min(0.30, 0.05 * branch.reach / 20) - 0.02, 6));
      }
      executeSettlements(Q, t);
      const striking = {};
      for (const rec of records(S, STRIKING)) if (rec.last_processed_time !== t) processStrike(Q, rec, t, striking);
      for (const id of BRANCHES) {
        const branch = S.unions[id];
        branch.fatigue = clip(branch.fatigue + (striking[id] ? FATIGUE_STEP : -FATIGUE_STEP), 0, 100);
      }
      const byBranch = {};
      for (const id of BRANCHES) byBranch[id] = 0;
      for (const rec of records(S, STRIKING)) for (const b of rec.branches) byBranch[b] = Math.max(byBranch[b], rec.disruption[b] || 0);
      const disruption = Math.min(100, BRANCHES.reduce((n, id) => n + DISRUPTION_WEIGHTS[id] * byBranch[id], 0));
      S.strikes.inputs = {t: t, strike_disruption: disruption, by_branch: byBranch, wage_agreement_pp: wageAgreementInput(S, t)};
      return S.strikes.inputs;
    } finally {
      Q.time = clock.time; Q.year = clock.year; Q.month = clock.month;
    }
  }

  // 4.2 step 6, after the party's ledger: one round of talks for each active strike without an open offer, and the
  // end of a strike that has no active participants left (exhausted).
  function endMonth(Q, settlement) {
    if (!ready(Q) || !settlement) return null;
    const S = Q.S, t = settlement.t;
    if (S.strikes.ended_t === t) return S.strikes;
    S.strikes.ended_t = t;
    const clock = {time: Q.time, year: Q.year, month: Q.month};
    Q.time = t; Q.year = rules.yearOf(t); Q.month = rules.monthOf(t);
    try {
      for (const rec of records(S, ['active'])) {
        if (rec.awaiting_rejection) continue;
        if (!rec.pps_support && rec.last_processed_time === t) {
          endRecord(S, rec, 'withdrawn', t, Q);
          continue;
        }
        const active = rec.branches.reduce((n, b) => n + (rec.participants[b] || 0), 0);
        if (rec.last_processed_time === t && active < 0.5) {
          endRecord(S, rec, 'exhausted', t, Q);
          continue;
        }
        if (!rec.rounds.some(r => r.t === t)) negotiationRound(Q, rec, t);
      }
      // 17.16.5: a wage demand without an accepted settlement by the next settlement: +8 grievance once (stage 7).
      for (const rec of records(S).filter(r => r.kind === 'wage_case' && r.case_opened_at !== null && r.case_opened_at < t)) {
        if (!rec.settlements.some(x => x.status !== 'breached')) {
          recordPendingEffect(S, {id: rec.id + ':rejected_wage_demand', system: 'grievance', stage: 7, value: 8, cause: 'rejected_wage_demand',
            branches: rec.branches.slice()});
        }
      }
      watchWages(Q, t);
      recordPlants(Q, t);
      expireRecords(S, t);
      return S.strikes;
    } finally {
      Q.time = clock.time; Q.year = clock.year; Q.month = clock.month;
    }
  }

  // ---- Plants (decision 2A of stage 6; 17.12) ---------------------------------------------------------------

  function newPlant(Q, branch, cause, t) {
    const E = Q.S.enterprises;
    E.seq += 1;
    const id = 'plant-' + E.seq + '-' + branch + '-t' + t;
    E.records[id] = {id: id, seq: E.seq, profile_id: PLANT_PROFILE_ID, branch: branch, owner: 'private', cause: cause, created_at: t,
      status: 'threatened', capacity: 100 - PLANT_LOST_CAPACITY, lost_capacity: PLANT_LOST_CAPACITY, workers_share: PLANT_WORKERS_SHARE,
      exemption: null, rescue_project_id: null, public_act_id: null, management: 'its private owner', representation: null,
      codecision_project_id: null, employment_commitment: null, pending_effects: [], history: [{t: t, kind: 'recorded', cause: cause}]};
    Q.S.history.reasons.push({t: t, kind: 'plant_recorded', plant_id: id, cause: cause});
    return E.records[id];
  }

  // Once per episode: a plant is recorded when a crisis or a reaction begins, and for each branch of an exhausted strike.
  function recordPlants(Q, t) {
    const S = Q.S, E = S.enterprises, watch = E.watch || (E.watch = {business_reaction: false, credit_crisis: false});
    const business = S.economy.business_state === 'active', credit = economy.creditCrisis(S.economy, t);
    if (business && !watch.business_reaction) newPlant(Q, 'industry', 'business_reaction', t);
    if (credit && !watch.credit_crisis) newPlant(Q, 'industry', 'credit_crisis', t);
    watch.business_reaction = business;
    watch.credit_crisis = credit;
    for (const rec of records(S).filter(r => r.outcome === 'exhausted' && r.ended_at === t && !r.plants_recorded)) {
      rec.plants_recorded = true;
      for (const b of rec.branches) newPlant(Q, b, 'exhausted_strike:' + rec.id, t);
    }
  }

  function plants(S, filter) {
    return Object.keys(S.enterprises.records).sort().map(id => S.enterprises.records[id]).filter(filter || (() => true));
  }

  // The name of a plant on the screen; stored = true gives the English name that the records of S keep (decision 5A).
  function plantName(plant, stored) {
    const en = PLANT_KINDS[plant.branch] + ' no. ' + plant.seq;
    return stored ? en : L(en, PLANT_KINDS_PL[plant.branch] + ' nr ' + plant.seq);
  }
  rules.registerStoredText(text => {
    const m = /^(industrial plant|railway workshop|estate) no\. (\d+)$/.exec(text);
    const branch = m ? Object.keys(PLANT_KINDS).filter(b => PLANT_KINDS[b] === m[1])[0] : null;
    return branch ? PLANT_KINDS_PL[branch] + ' nr ' + m[2] : undefined;
  });

  const PLANT_STATUS = Object.freeze({threatened: 'in difficulty', rescued: 'rescued'});
  const PLANT_STATUS_PL = Object.freeze({threatened: 'w trudnościach', rescued: 'uratowany'});

  function describePlant(plant) {
    if (PL()) {
      const bits = [PLANT_STATUS_PL[plant.status] || plant.status, plant.owner === 'public' ? 'właściciel publiczny' : 'właściciel prywatny'];
      if (plant.lost_capacity > 0) bits.push('zdolność produkcyjna ' + plant.capacity + '%');
      if (plant.exemption && plant.exemption.status === 'active') bits.push('odstępstwo do ' + dateOf(plant.exemption.expires_at - 1));
      if (plant.public_act_id && plant.owner !== 'public') bits.push('akt kontroli publicznej przed izbami');
      if (plant.representation) bits.push(plant.representation.variant === 'decision_rights' ? 'współdecydowanie robotników' : 'konsultacja z robotnikami');
      const name = plantName(plant);
      return name.charAt(0).toUpperCase() + name.slice(1) + ' (' + party.BRANCH_NAMES_PL[plant.branch].toLowerCase() + '): ' + bits.join(', ') + '.';
    }
    const bits = [PLANT_STATUS[plant.status] || plant.status, (plant.owner === 'public' ? 'public' : 'private') + ' owner'];
    if (plant.lost_capacity > 0) bits.push('capacity ' + plant.capacity + '%');
    if (plant.exemption && plant.exemption.status === 'active') bits.push('derogation until ' + dateOf(plant.exemption.expires_at - 1));
    if (plant.public_act_id && plant.owner !== 'public') bits.push('act of public control before the chambers');
    if (plant.representation) bits.push(plant.representation.variant === 'decision_rights' ? 'workers’ co-decision' : 'workers’ consultation');
    return 'The ' + plantName(plant) + ' (' + BRANCH_NAMES[plant.branch].toLowerCase() + '): ' + bits.join(', ') + '.';
  }

  function plantsLine(S) {
    const list = S.enterprises ? plants(S) : [];
    return list.length ? L('Recorded plants: ', 'Zapisane zakłady: ') + list.map(describePlant).join(' ') :
      L('No plant is recorded: a credit crisis, an active reaction of business or a strike ended by exhaustion records one.',
        'Nie zapisano żadnego zakładu: ' + PLANT_HINT_PL + '.');
  }

  // ---- Collective agreements and derogations (card 8.1; 17.12) ---------------------------------------------

  function collectiveStatus(Q, branch) {
    const S = Q.S, t = Q.time, union = S.unions && S.unions[branch];
    if (!union) return no(L('Unknown branch.', 'Nieznana branża.'));
    if (records(S).some(r => LIVE.indexOf(r.status) >= 0 && r.branches.indexOf(branch) >= 0)) {
      return no(L('A dispute of this branch is open: its settlement decides the wages.', 'Spór w tej branży jest otwarty: o płacach zdecyduje jego ugoda.'));
    }
    const running = (union.agreements || []).filter(a => a.kind === 'collective' && t < a.term_until)[0];
    if (running) return no(L('The collective agreement of this branch runs until ' + dateOf(running.term_until - 1) + '.',
      'Układ zbiorowy tej branży obowiązuje do ' + dateOf(running.term_until - 1) + '.'));
    // P: employers ready to sign — none while the reaction of business is active (11.7).
    if (S.economy.business_state === 'active') return no(L('The employers refuse new agreements while the reaction of business is active.', 'Pracodawcy odmawiają nowych układów, dopóki trwa reakcja przedsiębiorców.'));
    return OK;
  }

  function signCollective(Q, branch) {
    const status = collectiveStatus(Q, branch);
    if (!status.available) throw new Error('signCollective: ' + branch + ': ' + status.reason);
    const S = Q.S, t = Q.time;
    const agreement = {id: 'coll-' + branch + '-t' + t, kind: 'collective', employer: 'employers:' + branch, union: branch,
      covered: 'the workers of the branch', covered_share: 1, conditions: ['wages'], wage_pp: WAGE_AGREEMENT_PP * WAGE_SCOPE[branch],
      signed_at: t, starts_at: t, expires_at: t + WAGE_AGREEMENT_MONTHS, term_until: t + COLLECTIVE_TERM, status: 'active', signed_by: 'pps_labour'};
    S.unions[branch].agreements.push(agreement);
    S.history.reasons.push({t: t, kind: 'collective_agreement', branch: branch, agreement_id: agreement.id});
    return agreement;
  }

  // The legal basis of a derogation is the law on working time in force: the inspection of card 8.1 (P).
  function workingTimeLaw(S) {
    return Object.keys(S.projects).sort().map(id => S.projects[id])
      .filter(p => p && p.type === 'labor_inspection' && p.authorized && p.status !== 'repealed')[0] || null;
  }

  function derogationTarget(S) {
    return plants(S, p => p.status === 'threatened' && !(p.exemption && p.exemption.status === 'active'))[0] || null;
  }

  function derogationStatus(Q) {
    const S = Q.S;
    if (!workingTimeLaw(S)) return no(L('Needs a legal basis: the law enforcing working time (the inspection of this card) must be in force.', 'Wymaga podstawy prawnej: musi obowiązywać ustawa egzekwująca czas pracy (inspekcja z tej karty).'));
    if (!derogationTarget(S)) return no(L('Needs a recorded plant in difficulty without a derogation; ' + PLANT_HINT + '.',
      'Wymaga zapisanego zakładu w trudnościach bez odstępstwa; ' + PLANT_HINT_PL + '.'));
    return OK;
  }

  function grantDerogation(Q) {
    const status = derogationStatus(Q);
    if (!status.available) throw new Error('grantDerogation: ' + status.reason);
    const S = Q.S, t = Q.time, plant = derogationTarget(S), law = workingTimeLaw(S);
    const id = 'derogation-' + plant.id + '-t' + t;
    plant.exemption = {restriction_id: id, basis: law.law_id || law.id, scope: 'working time in this plant only', starts_at: t,
      expires_at: t + DEROGATION_MONTHS, status: 'active'};
    economy.changeBusinessPressure(S, DEROGATION_BUSINESS, id, t, 'derogation');
    plant.pending_effects.push({id: id + ':grievance', system: 'grievance', stage: 7, value: DEROGATION_GRIEVANCE,
      recipients: 'the workers of the plant', share: plant.workers_share, branch: plant.branch});
    plant.history.push({t: t, kind: 'derogation', restriction_id: id, expires_at: plant.exemption.expires_at});
    return plant;
  }

  // Collective agreements and derogations end at their dates, without undoing what they did once.
  function expireRecords(S, t) {
    for (const b of BRANCHES) {
      for (const a of S.unions[b].agreements || []) {
        if (a.kind === 'collective' && a.status === 'active' && t >= a.term_until - 1) a.status = 'expired';
      }
    }
    for (const plant of plants(S, p => p.exemption && p.exemption.status === 'active' && t >= p.exemption.expires_at - 1)) {
      plant.exemption.status = 'expired';
      plant.history.push({t: t, kind: 'derogation_expired', restriction_id: plant.exemption.restriction_id});
    }
  }

  // ---- The wage case of 1923 (17.16.5, 17.5; card catalogue 9.8) ---------------------------------------------

  // Read after the economy of period t: three completed months below 80 open one case of the covered wage earners, at
  // the earliest three months after the last case closed; branches already in a dispute keep it.
  // 17.5 (stage 7): the grievance of the employed workers' cells opens the case at 60, as three months of low wages do.
  const WAGE_CASE_GRIEVANCE = 60;

  function workersGrievance(S) {
    const cells = S.society && Array.isArray(S.society.cells) ? S.society.cells.filter(c => c.class_id === 'workers' && c.employment === 'employed') : [];
    const mass = cells.reduce((n, c) => n + c.mass, 0);
    return mass > 0 ? cells.reduce((n, c) => n + c.mass * (c.grievance || 0), 0) / mass : 0;
  }

  function watchWages(Q, t) {
    const S = Q.S, watch = S.strikes.wage_watch;
    if (watch.last_checked === t) return null;
    watch.last_checked = t;
    watch.months_below = S.economy.real_wage < WAGE_CASE_LIMIT ? watch.months_below + 1 : 0;
    const aggrieved = !!S.politics && workersGrievance(S) >= WAGE_CASE_GRIEVANCE;
    if (watch.months_below < WAGE_CASE_MONTHS && !aggrieved) return null;
    if (records(S, LIVE).some(r => r.kind === 'wage_case')) return null;
    const last = records(S).filter(r => r.kind === 'wage_case').map(r => r.ended_at || r.case_opened_at).sort((a, b) => b - a)[0];
    if (last !== undefined && last !== null && t - last < CASE_COOLDOWN) return null;
    const branches = WAGE_CASE_BRANCHES.filter(b => !branchRecord(S, b));
    if (!branches.length) return null;
    const rec = newRecord(Q, {kind: 'wage_case', branches: branches, demands: [{kind: 'wages'}], level: 'limited', threshold: THRESHOLDS.limited,
      status: 'negotiating', rejected: true, pps_answered: false, case_opened_at: t});
    watch.last_case_at = t;
    rec.history.push({t: t, kind: 'wage_demand_presented', months_below: watch.months_below, grievance: round(workersGrievance(S), 2)});
    S.history.reasons.push({t: t, kind: 'wage_case', strike_id: rec.id});
    return rec;
  }

  function caseRecord(S) {
    return records(S, ['negotiating']).filter(r => r.kind === 'wage_case' && !r.pps_answered)[0] || null;
  }

  function caseDue(Q) {
    if (!ready(Q) || Q.S.chapter.status === 'ended') return false;
    const rec = caseRecord(Q.S);
    if (rec) Q.S.strikes.due.polish_event_strike_1923 = rec.id + ':opened';
    else delete Q.S.strikes.due.polish_event_strike_1923;
    return !!rec;
  }

  // 17.5: the limited action and the political demand are open in a dispute with an unresolved or rejected demand (the
  // grievance of 15.1 comes with stage 7); talks are always possible.
  function caseStatus(Q, strategy) {
    const S = Q.S, rec = caseRecord(S);
    if (!rec) return no('');
    if (strategy === 'negotiate') return OK;
    if (strategy === 'economic_strike' || strategy === 'cabinet_resignation') {
      return rec.rejected ? OK : no(L('Needs an unresolved or rejected demand in this dispute.', 'Wymaga nierozstrzygniętego albo odrzuconego postulatu w tym sporze.'));
    }
    return no(L('Unknown answer.', 'Nieznana odpowiedź.'));
  }

  // B8+B10 (17.5): one answer of PPS, 0 T, and the state's answer in the same phase. Talks bring the government's answer
  // at once; a strike goes on to the partner and protection steps.
  function caseChoose(Q, strategy) {
    party.syncMirrors(Q);
    const status = caseStatus(Q, strategy);
    if (!status.available) throw new Error('caseChoose: ' + status.reason);
    const S = Q.S, t = Q.time, rec = caseRecord(S);
    rec.pps_answered = true;
    rec.strategy = strategy;
    rec.state_response = stateResponse(S);
    S.history.actions.push({t: t, action_id: 'society.strike_1923.' + strategy, strike_id: rec.id, cost_t: 0});
    rec.history.push({t: t, kind: 'strategy', strategy: strategy});
    if (strategy === 'negotiate') {
      const offer = negotiationRound(Q, rec, t);
      if (offer) {
        offer.status = 'accepted';
        const settlement = signSettlement(Q, rec, offer, true);
        rec.agreed_end = true;
        endRecord(S, rec, 'agreement', t, Q);
        return result(Q, L('The talks succeed before any strike: ' + offer.clauses.map(c => CLAUSES[c.kind].name).join(', ') + ' (settlement ' +
          settlement.id + ', due next month). The fund is spared.',
          'Rozmowy kończą się sukcesem jeszcze przed strajkiem: ' + offer.clauses.map(c => clauseName(c.kind)).join(', ') + ' (ugoda ' +
          settlement.id + ', wykonanie w przyszłym miesiącu). Fundusz zostaje oszczędzony.'));
      }
      return result(Q, L('The government refuses the limited wage demand. The dispute stays open; a strike can still be started from the unions’ ' +
        'agenda (1 T). The refusal is not a concession.', 'Rząd odrzuca ograniczony postulat płacowy. Spór pozostaje otwarty; strajk można nadal ' +
        'rozpocząć z agendy związków (1 T). Odmowa nie jest ustępstwem.'));
    }
    if (strategy === 'cabinet_resignation') {
      addDemand(rec, 'cabinet_resignation', t);
      // 17.5: the Left −3 dissent under the matching line; the Centre +8 without the agreed line.
      if (S.actors.pps.strategy.direction === 'class_independence') {
        government.factionReaction(Q, 'lewica', {dissent: -3}, {id: 'strike.political:' + rec.id + ':lewica', kind: 'strike_goal', reverse: null});
      } else {
        government.factionReaction(Q, 'centrum', {dissent: 8}, {id: 'strike.political:' + rec.id + ':centrum', kind: 'strike_goal', reverse: null});
      }
    }
    rec.status = 'active';
    rec.started_at = t;
    openSteps(S, rec);
    party.writeMirrors(Q);
    return result(Q, L((strategy === 'cabinet_resignation' ? 'A strike with the demand that the cabinet resign (threshold 80): ' : 'A limited strike for wages and ' +
      'working conditions: ') + rec.branches.map(b => BRANCH_NAMES[b]).join(' and ') + '. The costs come from the union funds every active month.',
      (strategy === 'cabinet_resignation' ? 'Strajk z postulatem dymisji gabinetu (próg 80): ' : 'Ograniczony strajk o płace i warunki pracy: ') +
      branchList(rec.branches) + '. Koszty pokrywają fundusze związkowe w każdym miesiącu strajku.'));
  }

  // ---- The partner and the protection of a strike (9.6, 17.5; card catalogue 9.7) ----------------------------

  function communistsActive(S, rec) {
    if (!rec.branches.some(b => PARTNER_BRANCHES.indexOf(b) >= 0)) return false;
    return electorate.aggregate(S, cell => cell.class_id === 'workers', 'kpp') >= PARTNER_PRESENCE;
  }

  function openSteps(S, rec) {
    rec.steps = {cooperation: communistsActive(S, rec) ? 'pending' : 'none', protection: 'pending'};
    if (rec.branches.some(b => PARTNER_BRANCHES.indexOf(b) < 0) && !communistsActive(S, rec)) rec.steps.cooperation = 'none';
    // The Bund: a strike of industry is a joint labour action while PPS keeps a line of cooperation (5.5, 10.8).
    rec.bund_joint = rec.branches.indexOf('industry') >= 0 && S.actors.pps.strategy.jewish_cooperation !== 'none';
  }

  function stepsRecord(S) {
    return records(S, STRIKING).filter(r => r.steps && (r.steps.cooperation === 'pending' || r.steps.protection === 'pending'))[0] || null;
  }

  function stepsStage(S) {
    const rec = stepsRecord(S);
    if (!rec) return 'done';
    return rec.steps.cooperation === 'pending' ? 'cooperation' : 'protection';
  }

  function demandLevel(rec) {
    return rec.level === 'structural' ? 'structural' : rec.level === 'broad' ? 'broad' : 'limited';
  }

  function cooperationStatus(Q, mode) {
    const S = Q.S, rec = stepsRecord(S);
    if (!rec || rec.steps.cooperation !== 'pending') return no('');
    const relation = S.actors.relations.kpp;
    if (mode === 'none') return OK;
    if (mode === 'full') {
      if (!(S.actors.kpp_channel && S.actors.kpp_channel.contact_open)) return no(L('Needs an open contact with the KPP.', 'Wymaga otwartego kontaktu z KPP.'));
      if (relation < 30) return no(L('Needs a relation of 30 with the KPP; it is ' + fmt(relation) + '.',
        'Wymaga relacji z KPP co najmniej 30; obecnie ' + fmt(relation) + '.'));
      if (party.goalFit(demandLevel(rec), PARTNER_GOAL) < 50) return no(L('The KPP does not accept these joint demands and rules of the end.', 'KPP nie przyjmuje tych wspólnych postulatów ani zasad zakończenia.'));
      return OK;
    }
    if (mode === 'limited') return relation >= 20 ? OK : no(L('Needs a relation of 20 with the KPP; it is ' + fmt(relation) + '.',
      'Wymaga relacji z KPP co najmniej 20; obecnie ' + fmt(relation) + '.'));
    return no(L('Unknown mode.', 'Nieznany tryb.'));
  }

  // 9.6: full cooperation binds the partner's whole contribution, limited coordination half; its discipline is one
  // recorded draw against clip((relation + goal fit)/200, 0.10, 0.90). The Centre objects (+5 / +2) while the
  // acceptance inside PPS is below 60. No cooperation is no failed trial.
  function chooseCooperation(Q, mode) {
    party.syncMirrors(Q);
    const status = cooperationStatus(Q, mode);
    if (!status.available) throw new Error('chooseCooperation: ' + status.reason);
    const S = Q.S, t = Q.time, rec = stepsRecord(S);
    const relation = S.actors.relations.kpp, fit = party.goalFit(demandLevel(rec), PARTNER_GOAL);
    const compliance = party.partnerCompliance(relation, fit);
    const bound = mode === 'full' ? PARTNER_CONTRIBUTION : mode === 'limited' ? PARTNER_CONTRIBUTION / 2 : 0;
    const coop = {mode: mode, contribution: PARTNER_CONTRIBUTION, bound: bound, unbound: PARTNER_CONTRIBUTION - bound, partner_goal: PARTNER_GOAL,
      fit: fit, compliance: compliance, complied: null, trial: false, resolved: false, pressure: {}};
    if (mode !== 'none') {
      const u = rules.roll(S, 'kpp_discipline:' + rec.id);
      coop.complied = u < compliance;
      coop.trial = party.recordTrial(S, {action_id: rec.id, kind: 'strike', strike_id: rec.id, mode: mode, terms: {level: demandLevel(rec)},
        partner_response: 'accepted', result: 'pending'});
      const objection = party.centrumObjection(S, mode);
      if (objection) government.factionReaction(Q, 'centrum', {dissent: objection}, {id: 'strike.kpp:' + rec.id, kind: 'strike_cooperation', reverse: null});
    }
    // The partner's part that keeps the agreement adds to the pressure on the agreed demand; a broken one goes to the
    // uncontrolled protest. The unbound part presses only for a demand the partner holds itself.
    const holds = LEVEL_ORDER.indexOf(PARTNER_GOAL) >= LEVEL_ORDER.indexOf(demandLevel(rec));
    const pressure = (coop.complied ? bound : 0) + (holds ? coop.unbound : 0);
    for (const b of rec.branches) coop.pressure[b] = pressure / rec.branches.length;
    if (mode !== 'none' && !coop.complied) rec.uncontrolled_participation = (rec.uncontrolled_participation || 0) + bound;
    rec.communist_cooperation = coop;
    rec.steps.cooperation = 'done';
    S.history.actions.push({t: t, action_id: 'society.strike_communist_cooperation.' + mode, strike_id: rec.id, cost_t: 0});
    party.writeMirrors(Q);
    if (PL()) {
      return result(Q, mode === 'none' ? 'PPS zachowuje własne postulaty i sama prowadzi protest; komuniści działają na własną rękę.' :
        (mode === 'full' ? 'Wspólny komitet z komunistami na całą akcję' : 'Ograniczona koordynacja z komunistami') +
        ': KPP ' + (coop.complied ? 'przestrzega uzgodnionych zasad' : 'łamie uzgodnione zasady') + ' (szansa ' + fmt(100 * compliance) + '%).');
    }
    return result(Q, mode === 'none' ? 'PPS keeps its own demands and leads the protest alone; the communists act on their own.' :
      (mode === 'full' ? 'A joint committee with the communists for the whole action' : 'Limited coordination with the communists') +
      ': the KPP ' + (coop.complied ? 'keeps' : 'breaks') + ' the agreed rules (chance ' + fmt(100 * compliance) + '%).');
  }

  function protectionStatus(Q, choice) {
    const S = Q.S, rec = stepsRecord(S);
    if (!rec || rec.steps.cooperation === 'pending' || rec.steps.protection !== 'pending') return no('');
    if (choice === 'none') return OK;
    if (S.militia.banned) return no(L('Milicja PPS is banned.', 'Milicja PPS jest objęta zakazem działalności.'));
    if (!(S.militia.strength > 0)) return no(L('Milicja PPS has no members.', 'Milicja PPS nie ma członków.'));
    return S.party_orgs.cash + 1e-9 >= PROTECTION_COST ? OK : no(L('Needs 0.5 R.', 'Wymaga 0,5 R.'));
  }

  // 17.5, 16.5: the Milicja protects the strikers with the people it assigns and 0.5 R; the protection cuts the
  // exposure of the covered people by min(0.40, 0.10 × force) (recorded for stage 7), it does not stop a clash.
  function chooseProtection(Q, choice) {
    party.syncMirrors(Q);
    const status = protectionStatus(Q, choice);
    if (!status.available) throw new Error('chooseProtection: ' + status.reason);
    const S = Q.S, t = Q.time, rec = stepsRecord(S);
    rec.steps.protection = 'done';
    S.history.actions.push({t: t, action_id: 'strike.protection.' + choice, strike_id: rec.id, cost_t: 0});
    if (choice === 'none') return result(Q, L('The strike goes on without the Milicja.', 'Strajk trwa bez Milicji.'));
    S.party_orgs.cash = Math.max(0, round(S.party_orgs.cash - PROTECTION_COST, 6));
    const force = party.militiaForce(S).force;
    rec.protection = {people: S.militia.strength, force: force, exposure_cut: Math.min(0.40, 0.10 * force), lost: 0, since: t};
    party.writeMirrors(Q);
    return result(Q, L('Milicja PPS protects the strikers (' + S.militia.strength + ' people, force ' + fmt(force) + ' F, 0.5 R).',
      'Milicja PPS chroni strajkujących (' + S.militia.strength + ' ' + rules.plural(S.militia.strength, 'osoba', 'osoby', 'osób') + ', siła ' +
      fmt(force) + ' F, 0,5 R).'));
  }

  // ---- The answer of the Sejm: B11+B12 (17.5.1; card catalogue 7.10) -------------------------------------------

  function responseRecord(S) {
    return records(S, STRIKING).filter(r => !r.awaiting_rejection && r.response_phase > r.response_answered &&
      ((r.offer && r.offer.status === 'open') || r.repression) && !(r.steps && (r.steps.cooperation === 'pending' || r.steps.protection === 'pending')))[0] || null;
  }

  function responseDue(Q) {
    if (!ready(Q) || Q.S.chapter.status === 'ended') return false;
    const rec = responseRecord(Q.S);
    if (rec) Q.S.strikes.due.polish_event_strike_response = rec.id + ':' + rec.response_phase;
    else delete Q.S.strikes.due.polish_event_strike_response;
    return !!rec;
  }

  // Three answers, 0 T: demand the missing concession (the offer lapses, or the demands are put at once), seek a
  // settlement (accept the offer, or put one limited package), or back the restoration of order (PPS withdraws its
  // support without new concessions: unmet promises cost the union +10 dissent and −8 trust once; the call does not
  // end the protest and is no order to the police).
  function responseChoose(Q, choice) {
    party.syncMirrors(Q);
    const S = Q.S, t = Q.time, rec = responseRecord(S);
    if (!rec) throw new Error('responseChoose: nothing to answer');
    rec.response_answered = rec.response_phase;
    rec.parliament_responses.push({t: t, phase: rec.response_phase, choice: choice, offer_id: rec.offer ? rec.offer.id : null});
    S.history.actions.push({t: t, action_id: 'parliament.strike_response.' + choice, strike_id: rec.id, cost_t: 0});
    if (choice === 'demands') {
      if (rec.offer) return answerOffer(Q, rec.id, 'continue');
      const offer = negotiationRound(Q, rec, t);
      return result(Q, offer ? L('The demands are put to the government, which makes an offer.', 'Postulaty trafiają do rządu, który składa ofertę.') :
        L('The demands are put to the government, which refuses them.', 'Postulaty trafiają do rządu, który je odrzuca.'));
    }
    if (choice === 'settlement') {
      if (rec.offer) return answerOffer(Q, rec.id, 'accept');
      rec.demands = [{kind: 'wages', added_at: t}];
      updateThreshold(rec);
      const offer = negotiationRound(Q, rec, t);
      if (offer) return answerOffer(Q, rec.id, 'accept');
      return result(Q, L('The limited package is refused; the dispute goes on.', 'Ograniczony pakiet zostaje odrzucony; spór trwa.'));
    }
    if (choice !== 'order') throw new Error('responseChoose: unknown choice ' + choice);
    if (rec.offer) { rec.offer.status = 'declined'; rec.offer = null; rec.status = 'active'; }
    rec.pps_support = false;
    if (!rec.order_penalty) {
      rec.order_penalty = true;
      for (const b of rec.branches) {
        const branch = S.unions[b];
        branch.dissent = clip(branch.dissent + 10, 0, 100);
        branch.trust = clip(branch.trust - 8, 0, 100);
        addCause(branch, 'order:' + rec.id, 10);
      }
    }
    return result(Q, L('PPS backs the restoration of order and calls for the end of the strike, without new concessions. The union is let down ' +
      '(dissent +10, trust −8). The call does not end the protest by itself and is no order to the police.',
      'PPS popiera przywrócenie porządku i wzywa do zakończenia strajku, bez nowych ustępstw. Związek czuje się zawiedziony ' +
      '(sprzeciw +10, zaufanie −8). Samo wezwanie nie kończy protestu i nie jest poleceniem dla policji.'));
  }

  // ---- The steps of a union dispute (14.1; card catalogue 5.10) ------------------------------------------

  function agendaAvailable(Q) {
    return ready(Q) && Q.S.chapter.status !== 'ended';
  }

  function baseStatus(Q, branchId) {
    if (!agendaAvailable(Q)) return no('');
    if (!Q.S.unions[branchId]) return no(L('Unknown branch.', 'Nieznana branża.'));
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    return OK;
  }

  function prepareStatus(Q, branchId) {
    const base = baseStatus(Q, branchId);
    if (!base.available) return base;
    const rec = branchRecord(Q.S, branchId);
    if (rec && rec.status !== 'prepared') return no(L('A dispute of this branch is already under way.', 'Spór w tej branży już trwa.'));
    const wait = waitReason(Q, 'union.prepare.' + branchId);
    return wait ? no(wait) : OK;
  }

  // Agree the demands and the end of an action: readiness +15 and a record of the goal, its end and its red line.
  function prepare(Q, branchId, level) {
    party.syncMirrors(Q);
    const status = prepareStatus(Q, branchId);
    if (!status.available) throw new Error('prepare: ' + status.reason);
    if (level !== 'limited' && level !== 'broad') throw new Error('prepare: unknown level ' + level);
    const S = Q.S, t = Q.time, branch = S.unions[branchId];
    rules.commitMainAction(Q, 'union.prepare', {branch: branchId, level: level});
    branch.readiness = clip(branch.readiness + READINESS_STEP, 0, 100);
    S.cooldowns['union.prepare.' + branchId] = t + PREPARE_COOLDOWN;
    let rec = branchRecord(S, branchId);
    if (rec) {
      rec.demands = demandsFor(level);
      rec.level = level;
      rec.threshold = THRESHOLDS[level];
      rec.history.push({t: t, kind: 'demands_agreed', level: level});
    } else {
      rec = newRecord(Q, {branches: [branchId], demands: demandsFor(level), level: level, threshold: THRESHOLDS[level]});
    }
    return result(Q, L(BRANCH_NAMES[branchId] + ': the demands (' + rec.demands.map(d => DEMAND_NAMES[d.kind]).join(' and ') + ', threshold ' +
      rec.threshold + ') and the end of the action are agreed. Readiness ' + fmt(branch.readiness) + '.',
      branchName(branchId) + ': postulaty (' + rec.demands.map(d => demandName(d.kind)).join(' i ') + ', próg ' + rec.threshold +
      ') i zakończenie akcji są uzgodnione. Gotowość ' + fmt(branch.readiness) + '.'));
  }

  function alignStatus(Q, branchId, line) {
    const base = baseStatus(Q, branchId);
    if (!base.available) return base;
    if (!LINES[line]) return no(L('Unknown line.', 'Nieznana linia.'));
    if (!branchRecord(Q.S, branchId)) return no(L('Needs agreed demands: the meeting confirms an accepted agreement.', 'Wymaga uzgodnionych postulatów: zebranie potwierdza przyjęte porozumienie.'));
    return lineAlignment(Q.S.unions[branchId], line) >= 100 ? no(L('The branch already stands fully behind this line.', 'Branża w pełni popiera już tę linię.')) : OK;
  }

  function align(Q, branchId, line) {
    party.syncMirrors(Q);
    const status = alignStatus(Q, branchId, line);
    if (!status.available) throw new Error('align: ' + status.reason);
    const branch = Q.S.unions[branchId];
    rules.commitMainAction(Q, 'union.align', {branch: branchId, line: line});
    branch.alignment[line] = clip(lineAlignment(branch, line) + ALIGN_STEP, 0, 100);
    return result(Q, L(BRANCH_NAMES[branchId] + ': a joint meeting on ' + LINES[line] + ' (alignment ' + fmt(branch.alignment[line]) + ').',
      branchName(branchId) + ': wspólne zebranie w sprawie linii „' + LINES_PL[line] + '” (zgodność ' + fmt(branch.alignment[line]) + ').'));
  }

  function openCause(branch) {
    return branch.dissent_causes.filter(c => c.status === 'open')[0] || null;
  }

  function mediateStatus(Q, branchId) {
    const base = baseStatus(Q, branchId);
    if (!base.available) return base;
    const branch = Q.S.unions[branchId];
    if (!(branch.dissent > 0) || !openCause(branch)) return no(L('Needs a dispute with the leadership over a concrete change.', 'Wymaga sporu z kierownictwem o konkretną zmianę.'));
    return OK;
  }

  function mediate(Q, branchId) {
    party.syncMirrors(Q);
    const status = mediateStatus(Q, branchId);
    if (!status.available) throw new Error('mediate: ' + status.reason);
    const branch = Q.S.unions[branchId];
    rules.commitMainAction(Q, 'union.mediate', {branch: branchId});
    branch.dissent = clip(branch.dissent - MEDIATE_STEP, 0, 100);
    openCause(branch).status = 'answered';
    return result(Q, L(BRANCH_NAMES[branchId] + ': the dispute with the leadership is mediated; dissent ' + fmt(branch.dissent) + '.',
      branchName(branchId) + ': spór z kierownictwem rozstrzygnięty w mediacji; sprzeciw ' + fmt(branch.dissent) + '.'));
  }

  function strikeStatus(Q, branchId) {
    const base = baseStatus(Q, branchId);
    if (!base.available) return base;
    const rec = branchRecord(Q.S, branchId);
    if (!rec || !rec.demands.length || !(rec.status === 'prepared' || (rec.status === 'negotiating' && rec.rejected && rec.pps_answered))) {
      return no(L('Needs an agreed goal, demands and a plan to end the action.', 'Wymaga uzgodnionego celu, postulatów i planu zakończenia akcji.'));
    }
    return OK;
  }

  // Start the protest (1 T): the record becomes an active strike; its costs come from the branch fund in every
  // active month (14.2–14.3).
  function startStrike(Q, branchId) {
    party.syncMirrors(Q);
    const status = strikeStatus(Q, branchId);
    if (!status.available) throw new Error('startStrike: ' + status.reason);
    const S = Q.S, t = Q.time, rec = branchRecord(S, branchId);
    rules.commitMainAction(Q, 'union.strike', {branch: branchId, strike_id: rec.id});
    rec.status = 'active';
    rec.started_at = t;
    rec.strategy = rec.strategy || 'own';
    rec.state_response = stateResponse(S);
    rec.history.push({t: t, kind: 'started'});
    openSteps(S, rec);
    const p = potential(S, branchId);
    return result(Q, L(BRANCH_NAMES[branchId] + ': the strike begins. Expected participation ' + fmt(p.participation) + ', costing ' +
      fmt(p.cost) + ' R a month from the branch fund (' + fmt(S.unions[branchId].fund) + ' R).',
      branchName(branchId) + ': strajk się zaczyna. Oczekiwany udział ' + fmt(p.participation) + ', koszt ' + fmt(p.cost) +
      ' R miesięcznie z funduszu branży (' + fmt(S.unions[branchId].fund) + ' R).'));
  }

  // Answering an offer costs no month (14.3). Accepting signs the settlement: branches that agree end on the agreed
  // terms (trust +5); the refusal of a branch is recorded for the card E6 (stage 6b).
  function offerStatus(Q, strikeId) {
    const rec = ready(Q) ? recordOf(Q.S, strikeId) : null;
    if (!rec || rec.status !== 'settlement_pending' || !rec.offer) return no(L('There is no offer to answer.', 'Nie ma oferty, na którą trzeba odpowiedzieć.'));
    return OK;
  }

  function answerOffer(Q, strikeId, choice) {
    party.syncMirrors(Q);
    const status = offerStatus(Q, strikeId);
    if (!status.available) throw new Error('answerOffer: ' + status.reason);
    const S = Q.S, t = Q.time, rec = recordOf(S, strikeId), offer = rec.offer;
    S.history.actions.push({t: t, action_id: 'union.offer.' + choice, strike_id: rec.id, offer_id: offer.id, cost_t: 0});
    if (choice === 'continue') {
      offer.status = 'declined';
      rec.offer = null;
      rec.status = 'active';
      rec.history.push({t: t, kind: 'offer_declined', offer_id: offer.id});
      return result(Q, L('PPS keeps the strike going; the offer lapses. The next settlement brings another round of talks.',
        'PPS kontynuuje strajk; oferta wygasa. Następne rozliczenie przyniesie kolejną rundę rozmów.'));
    }
    if (choice !== 'accept') throw new Error('answerOffer: unknown choice ' + choice);
    offer.status = 'accepted';
    const consent = consentFor(S, rec, offer);
    offer.consent = consent;
    const settlement = signSettlement(Q, rec, offer, consent.accept);
    const refusing = {};
    for (const row of consent.rows) {
      const branch = S.unions[row.branch];
      if (row.accept) branch.trust = clip(branch.trust + 5, 0, 100);
      else refusing[row.branch] = rec.participants[row.branch] || 0;
    }
    // The communists bound by the agreement end with it when they kept its rules; otherwise they refuse (9.6).
    const coop = rec.communist_cooperation;
    const partnerRefusing = coop && coop.bound > 0 && !coop.complied ? coop.bound : 0;
    settlement.refusing = refusing;
    settlement.partner_refusing = partnerRefusing;
    const size = Object.keys(refusing).reduce((n, b) => n + refusing[b], 0) + partnerRefusing;
    rec.agreed_end = !Object.keys(refusing).length && !partnerRefusing;
    const names = offer.clauses.map(c => clauseName(c.kind)).join(', ');
    // Without a refusing group the strike ends on the settlement at once.
    if (rec.agreed_end) {
      endRecord(S, rec, 'agreement', t, Q);
      return result(Q, L('PPS accepts the offer: ' + names + '. The strike ends on the agreed terms; the settlement is due next month.',
        'PPS przyjmuje ofertę: ' + names + '. Strajk kończy się na uzgodnionych warunkach; ugoda zostanie wykonana w przyszłym miesiącu.'));
    }
    // A group large enough to go on opens the card E6 (14.5); a smaller one gives in, the end imposed on it.
    if (size >= E6_THRESHOLD) {
      rec.awaiting_rejection = settlement.id;
      rec.status = 'active';
      return result(Q, L('PPS accepts the offer: ' + names + '. Part of the strikers (' + fmt(size) + ' points of participation) does not want to end.',
        'PPS przyjmuje ofertę: ' + names + '. Część strajkujących (' + fmt(size) + ' pkt udziału) nie chce kończyć strajku.'));
    }
    for (const b of Object.keys(refusing)) imposeEnd(S.unions[b], rec, t);
    endRecord(S, rec, 'agreement', t, Q);
    return result(Q, L('PPS accepts the offer: ' + names + '. ' + (Object.keys(refusing).length ? Object.keys(refusing).map(b => BRANCH_NAMES[b]).join(' and ') +
      ' did not agree, and the end is imposed on it (dissent +10, trust −8).' : 'A few refuse, but the action ends.'),
      'PPS przyjmuje ofertę: ' + names + '. ' + (Object.keys(refusing).length ? 'Bez zgody: ' + branchList(Object.keys(refusing)) +
      '; zakończenie zostaje narzucone (sprzeciw +10, zaufanie −8).' : 'Nieliczni odmawiają, ale akcja się kończy.')));
  }

  // ---- E6: the participants refuse the settlement (14.5; card catalogue 9.9) ---------------------------------

  function rejectionRecord(S) {
    return records(S, STRIKING).filter(r => r.awaiting_rejection)[0] || null;
  }

  function rejectionDue(Q) {
    if (!ready(Q) || Q.S.chapter.status === 'ended') return false;
    const rec = rejectionRecord(Q.S);
    if (rec) Q.S.strikes.due.polish_event_strike_rejection = rec.id + ':' + rec.awaiting_rejection;
    else delete Q.S.strikes.due.polish_event_strike_rejection;
    return !!rec;
  }

  function settlementOf(rec, id) {
    return rec.settlements.filter(x => x.id === id)[0] || null;
  }

  // Uphold the settlement and call for the end: the obligation stands, the branches that refused have the end imposed
  // and part of them strike on without PPS. Support the strike: the mobilisation and its costs go on and PPS breaks the
  // settlement it signed (credibility −5 once); no better offer is forced. The answer does not settle the signature again.
  function rejectionChoose(Q, choice) {
    party.syncMirrors(Q);
    const S = Q.S, t = Q.time, rec = rejectionRecord(S);
    if (!rec) throw new Error('rejectionChoose: nothing to answer');
    const settlement = settlementOf(rec, rec.awaiting_rejection);
    S.history.actions.push({t: t, action_id: 'society.strike_settlement_rejection.' + choice, strike_id: rec.id, settlement_id: settlement.id, cost_t: 0});
    settlement.reaction = choice;
    if (choice === 'uphold') {
      let continuing = 0;
      for (const b of Object.keys(settlement.refusing)) {
        continuing += settlement.refusing[b] * (1 - callCompliance(S, S.unions[b], 'agreed_end'));
        imposeEnd(S.unions[b], rec, t);
      }
      continuing += settlement.partner_refusing || 0;
      settlement.continuing = continuing;
      endRecord(S, rec, 'agreement', t, Q);
      return result(Q, L('PPS upholds the settlement and calls for the end of the strike. About ' + fmt(continuing) +
        ' points of participation strike on without the support of PPS; the settlement stands.',
        'PPS podtrzymuje ugodę i wzywa do zakończenia strajku. Około ' + fmt(continuing) +
        ' pkt udziału strajkuje dalej bez poparcia PPS; ugoda obowiązuje.'));
    }
    if (choice !== 'support') throw new Error('rejectionChoose: unknown choice ' + choice);
    settlement.status = 'breached';
    settlement.history.push({t: t, kind: 'breached_by_pps'});
    rec.breached_by_pps = true;
    rec.awaiting_rejection = null;
    rec.offer = null;
    rec.status = 'active';
    government.changeCredibility(Q, 'breach:' + settlement.id, -5, 'settlement_breach');
    return result(Q, L('PPS supports the further strike: the mobilisation and its costs go on, and the settlement PPS accepted is broken ' +
      '(credibility −5). No better offer follows from it.', 'PPS popiera dalszy strajk: mobilizacja i jej koszty trwają, a ugoda przyjęta ' +
      'przez PPS zostaje zerwana (wiarygodność −5). Nie wynika z tego lepsza oferta.'));
  }

  // ---- The railways in a coup (16.5; test „Kolej”) --------------------------------------------------------

  // The railways delay a named route by one phase at active participation ≥40 and coordination ≥50, by two at ≥65
  // and ≥70. Coordination is the readiness of the railway branch (17.4); stage 7 reads it in the coup.
  function railDelayPhases(activeParticipation, coordination) {
    if (activeParticipation >= 65 && coordination >= 70) return 2;
    if (activeParticipation >= 40 && coordination >= 50) return 1;
    return 0;
  }

  // ---- Displays ---------------------------------------------------------------------------------------------

  function result(Q, text) {
    Q.pl_union_result = text;
    return text;
  }

  function statusText(S, rec) {
    if (!rec) return L('no dispute', 'brak sporu');
    const demands = rec.demands.map(d => demandName(d.kind)).join(', ');
    if (rec.status === 'prepared') return L('demands agreed (' + demands + ', threshold ' + rec.threshold + '), no action yet',
      'postulaty uzgodnione (' + demands + ', próg ' + rec.threshold + '), jeszcze bez akcji');
    if (rec.status === 'negotiating') return L('demands presented (' + demands + '), in talks', 'postulaty przedstawione (' + demands + '), trwają rozmowy');
    const active = rec.branches.reduce((n, b) => n + (rec.participants[b] || 0), 0);
    if (rec.status === 'settlement_pending') return L('on strike, an offer to answer', 'strajk; oferta czeka na odpowiedź');
    return L('on strike for ' + demands + ' since ' + rules.monthOf(rec.started_at) + '/' + rules.yearOf(rec.started_at) +
      (rec.last_processed_time !== null ? ', active participation ' + fmt(active) : ''),
      'strajk od ' + rules.monthYear(rec.started_at, 'gen') + ' (postulaty: ' + demands + ')' +
      (rec.last_processed_time !== null ? ', aktywny udział ' + fmt(active) : ''));
  }

  function branchLine(S, id) {
    const branch = S.unions[id];
    return L(BRANCH_NAMES[id] + ': reach ' + fmt(branch.reach) + ', readiness ' + fmt(branch.readiness) + ', fatigue ' + fmt(branch.fatigue) +
      ', trust ' + fmt(branch.trust) + ', dissent ' + fmt(branch.dissent) + ', fund ' + fmt(branch.fund) + ' R; ',
      branchName(id) + ': zasięg ' + fmt(branch.reach) + ', gotowość ' + fmt(branch.readiness) + ', zmęczenie ' + fmt(branch.fatigue) +
      ', zaufanie ' + fmt(branch.trust) + ', sprzeciw ' + fmt(branch.dissent) + ', fundusz ' + fmt(branch.fund) + ' R; ') + statusText(S, branchRecord(S, id));
  }

  function offerText(S, rec) {
    const offer = rec && rec.offer;
    if (!offer) return '';
    const consent = consentFor(S, rec, offer);
    return L('The government offers ' + offer.clauses.map(c => CLAUSES[c.kind].name).join(' and ') + ' (' + fmt(100 * offer.fulfilment) +
      '% of the demands). ' + consent.rows.map(r => BRANCH_NAMES[r.branch] + ' would ' + (r.accept ? 'agree' : 'refuse') + ' (' + fmt(r.score) + ')').join('; ') + '.',
      'Rząd oferuje: ' + offer.clauses.map(c => clauseName(c.kind)).join(' i ') + ' (' + fmt(100 * offer.fulfilment) + '% postulatów). ' +
      consent.rows.map(r => branchName(r.branch) + ': ' + (r.accept ? 'prawdopodobna zgoda' : 'prawdopodobna odmowa') + ' (' + fmt(r.score) + ')').join('; ') + '.');
  }

  function agendaView(Q) {
    if (!ready(Q)) return;
    const S = Q.S;
    for (const id of BRANCHES) Q['pl_un_' + id + '_line'] = branchLine(S, id);
    const strikes = records(S, STRIKING);
    Q.pl_un_summary = strikes.length ? L(strikes.length + (strikes.length === 1 ? ' strike' : ' strikes') + ' under way.',
      'Trwające strajki: ' + strikes.length + '.') : L('No strike is under way.', 'Nie trwa żaden strajk.');
  }

  function branchView(Q, branchId) {
    if (!ready(Q)) return;
    const S = Q.S, rec = branchRecord(S, branchId);
    Q.pl_union_branch = branchId;
    Q.pl_un_branch_name = branchName(branchId);
    Q.pl_un_branch_text = branchLine(S, branchId) + L('. Lines: the strike ', '. Linie: strajk ') + fmt(lineAlignment(S.unions[branchId], 'strike')) +
      L(', the agreed end ', ', uzgodnione zakończenie ') + fmt(lineAlignment(S.unions[branchId], 'agreed_end')) + L('. Autonomy ', '. Autonomia ') +
      fmt(S.unions[branchId].autonomy) + '.';
    Q.pl_un_offer = offerText(S, rec);
    Q.pl_un_strike_id = rec ? rec.id : '';
    Q.pl_un_prepare_why = prepareStatus(Q, branchId).reason;
    Q.pl_un_align_strike_why = alignStatus(Q, branchId, 'strike').reason;
    Q.pl_un_align_end_why = alignStatus(Q, branchId, 'agreed_end').reason;
    Q.pl_un_mediate_why = mediateStatus(Q, branchId).reason;
    Q.pl_un_strike_why = strikeStatus(Q, branchId).reason;
    Q.pl_un_offer_why = rec ? offerStatus(Q, rec.id).reason : L('There is no offer to answer.', 'Nie ma oferty, na którą trzeba odpowiedzieć.');
  }

  function responseText(S, rec) {
    const r = rec.state_response || stateResponse(S);
    if (PL()) {
      const police = r.police === 'pps_protection' ? 'minister spraw wewnętrznych z PPS chroni pokojowe zgromadzenia i działa tylko przeciw konkretnej przemocy' :
        r.police === 'repress' ? 'policja może użyć przymusu, jeśli ugoda zostanie odrzucona' : r.police === 'settle' ? 'gabinet dąży do ugody' :
          'policja chroni zgromadzenia';
      const labour = r.labour === 'pps_mediation' ? '; minister pracy z PPS prowadzi mediację (i nie wydaje poleceń policji)' : '';
      return 'Władze: ' + police + labour + '.';
    }
    const police = r.police === 'pps_protection' ? 'the PPS Minister of the Interior protects peaceful gatherings and acts only against concrete violence' :
      r.police === 'repress' ? 'the police may use coercion if a settlement is refused' : r.police === 'settle' ? 'the cabinet seeks a settlement' :
        'the police protect the gatherings';
    const labour = r.labour === 'pps_mediation' ? '; the PPS Minister of Labour mediates (and gives no order to the police)' : '';
    return 'The authorities: ' + police + labour + '.';
  }

  function caseView(Q) {
    if (!ready(Q)) return;
    const S = Q.S, rec = caseRecord(S);
    if (!rec) return;
    const pressure = rec.branches.map(b => branchName(b) + ' ' + fmt(potential(S, b).credible)).join(', ');
    Q.pl_case_text = L('Three months of real wages below 80 (now ' + fmt(S.economy.real_wage) + ') bring a demand for a wage rise in ' +
      rec.branches.map(b => BRANCH_NAMES[b].toLowerCase()).join(' and ') + '. No settlement has been accepted. Credible pressure of the unions ' +
      'without a strike: ' + pressure + '. ', 'Trzy miesiące płac realnych poniżej 80 (obecnie ' + fmt(S.economy.real_wage) + ') przynoszą postulat ' +
      'podwyżki płac (' + branchList(rec.branches) + '). Nie przyjęto żadnej ugody. Wiarygodny nacisk związków bez strajku: ' + pressure + '. ') +
      responseText(S, {state_response: stateResponse(S)});
    for (const strategy of ['negotiate', 'economic_strike', 'cabinet_resignation']) Q['pl_case_' + strategy + '_why'] = caseStatus(Q, strategy).reason;
  }

  function stepsView(Q) {
    if (!ready(Q)) return;
    const S = Q.S, rec = stepsRecord(S);
    Q.pl_st_stage = stepsStage(S);
    if (!rec) { Q.pl_st_title = L('The strike', 'Strajk'); Q.pl_st_text = L('The strike goes on.', 'Strajk trwa.'); return; }
    Q.pl_st_title = L('The strike of ' + rec.branches.map(b => BRANCH_NAMES[b].toLowerCase()).join(' and '), 'Strajk: ' + branchList(rec.branches));
    Q.pl_st_text = Q.pl_st_stage === 'cooperation' ?
      L('The communists act in this strike (the KPP has ' + fmt(electorate.aggregate(S, c => c.class_id === 'workers', 'kpp')) +
        '% among the workers). Their contribution is ' + PARTNER_CONTRIBUTION + ' points of participation; their goal is political: to bring down ' +
        'the cabinet by a general strike. Relation ' +
        fmt(S.actors.relations.kpp) + '.',
        'Komuniści działają w tym strajku (KPP ma ' + fmt(electorate.aggregate(S, c => c.class_id === 'workers', 'kpp')) +
        '% wśród robotników). Ich wkład to ' + PARTNER_CONTRIBUTION + ' pkt udziału; ich cel jest polityczny: obalić gabinet strajkiem ' +
        'generalnym. Relacja ' + fmt(S.actors.relations.kpp) + '.') :
      L('Milicja PPS can protect the strikers: ' + S.militia.strength + ' people, 0.5 R. Protection lowers the exposure of the people it covers; it ' +
        'does not stop a clash.', 'Milicja PPS może chronić strajkujących: ' + S.militia.strength + ' ' +
        rules.plural(S.militia.strength, 'osoba', 'osoby', 'osób') + ', 0,5 R. Ochrona zmniejsza narażenie osób, które obejmuje; nie zapobiega starciu.');
    for (const mode of ['full', 'limited', 'none']) Q['pl_st_' + mode + '_why'] = cooperationStatus(Q, mode).reason;
    Q.pl_st_protect_why = protectionStatus(Q, 'protect').reason;
  }

  function responseView(Q) {
    if (!ready(Q)) return;
    const S = Q.S, rec = responseRecord(S);
    if (!rec) return;
    const parts = [];
    if (rec.krakow) parts.push(L('Kraków, autumn 1923: the dispute has reached the city, and the authorities have used coercion.',
      'Kraków, jesień 1923: spór dotarł do miasta, a władze użyły przymusu.'));
    parts.push(L('The strike of ' + rec.branches.map(b => BRANCH_NAMES[b].toLowerCase()).join(' and ') + ' for ' +
      rec.demands.map(d => DEMAND_NAMES[d.kind]).join(', ') + '.',
      'Strajk (' + branchList(rec.branches) + '), postulaty: ' + rec.demands.map(d => demandName(d.kind)).join(', ') + '.'));
    if (rec.repression) parts.push(L('The police have used a named repressive measure' + (rec.rail_militarized ? ' and the railways are militarised' : '') + '.',
      'Policja użyła wskazanego środka represji' + (rec.rail_militarized ? ', a kolej jest zmilitaryzowana' : '') + '.'));
    if (rec.clashes.some(c => c.clash)) parts.push(L('There has been a clash.', 'Doszło do starcia.'));
    if (rec.offer) parts.push(offerText(S, rec));
    parts.push(responseText(S, rec));
    Q.pl_resp_text = parts.join(' ');
    Q.pl_resp_offer = rec.offer ? 1 : 0;
  }

  function rejectionView(Q) {
    if (!ready(Q)) return;
    const S = Q.S, rec = rejectionRecord(S);
    if (!rec) return;
    const settlement = settlementOf(rec, rec.awaiting_rejection);
    const groups = Object.keys(settlement.refusing).map(b => branchName(b) + ' (' + fmt(settlement.refusing[b]) + ')');
    if (settlement.partner_refusing) groups.push(L('the communists who broke the agreed rules (', 'komuniści, którzy złamali uzgodnione zasady (') +
      fmt(settlement.partner_refusing) + ')');
    Q.pl_rej_text = L('PPS accepted the settlement (' + settlement.clauses.map(c => CLAUSES[c.kind].name).join(', ') + '), but ' + groups.join(' and ') +
      ' want to go on striking.', 'PPS przyjęła ugodę (' + settlement.clauses.map(c => clauseName(c.kind)).join(', ') + '), ale strajk chcą ' +
      'kontynuować: ' + groups.join(' i ') + '.');
  }

  function statusDisplay(Q) {
    if (!ready(Q)) return;
    const S = Q.S, strikes = records(S, STRIKING);
    Q.pl_un_strikes = strikes.map(rec => rec.branches.map(branchName).join(L(' and ', ' i ')) + ' (' + statusText(S, rec) + ')').join('; ');
  }

  return Object.freeze({
    BRANCHES: BRANCHES,
    BRANCH_NAMES: BRANCH_NAMES,
    branchName: branchName,
    SECTOR_IMPORTANCE: SECTOR_IMPORTANCE,
    DISRUPTION_WEIGHTS: DISRUPTION_WEIGHTS,
    WAGE_SCOPE: WAGE_SCOPE,
    THRESHOLDS: THRESHOLDS,
    LINES: LINES,
    CLAUSES: CLAUSES,
    STATE_PROFILE_ID: STATE_PROFILE_ID,
    PARTNER_CONTRIBUTION: PARTNER_CONTRIBUTION,
    ready: ready,
    attachUnionState: attachUnionState,
    recordOf: recordOf,
    records: records,
    branchRecord: branchRecord,
    effectiveReadiness: effectiveReadiness,
    callCompliance: callCompliance,
    participation: participation,
    monthlyStrikeCost: monthlyStrikeCost,
    fundAdequacy: fundAdequacy,
    fundCoverage: fundCoverage,
    potential: potential,
    negotiatingPressure: negotiatingPressure,
    successChance: successChance,
    roundChance: roundChance,
    unionConsent: unionConsent,
    consentFor: consentFor,
    negotiationRound: negotiationRound,
    executeSettlements: executeSettlements,
    wageAgreementInput: wageAgreementInput,
    beginMonth: beginMonth,
    endMonth: endMonth,
    agendaAvailable: agendaAvailable,
    prepareStatus: prepareStatus,
    prepare: prepare,
    alignStatus: alignStatus,
    align: align,
    mediateStatus: mediateStatus,
    mediate: mediate,
    strikeStatus: strikeStatus,
    startStrike: startStrike,
    offerStatus: offerStatus,
    answerOffer: answerOffer,
    railDelayPhases: railDelayPhases,
    workersGrievance: workersGrievance,
    PLANT_PROFILE_ID: PLANT_PROFILE_ID,
    PLANT_KINDS: PLANT_KINDS,
    COLLECTIVE_TERM: COLLECTIVE_TERM,
    DEROGATION_MONTHS: DEROGATION_MONTHS,
    newPlant: newPlant,
    recordPlants: recordPlants,
    plants: plants,
    plantName: plantName,
    describePlant: describePlant,
    plantsLine: plantsLine,
    collectiveStatus: collectiveStatus,
    signCollective: signCollective,
    derogationStatus: derogationStatus,
    grantDerogation: grantDerogation,
    expireRecords: expireRecords,
    cabinetProfile: cabinetProfile,
    stateResponse: stateResponse,
    authoritiesAfterRefusal: authoritiesAfterRefusal,
    watchWages: watchWages,
    caseDue: caseDue,
    caseStatus: caseStatus,
    caseChoose: caseChoose,
    communistsActive: communistsActive,
    stepsStage: stepsStage,
    cooperationStatus: cooperationStatus,
    chooseCooperation: chooseCooperation,
    protectionStatus: protectionStatus,
    chooseProtection: chooseProtection,
    responseDue: responseDue,
    responseChoose: responseChoose,
    rejectionDue: rejectionDue,
    rejectionChoose: rejectionChoose,
    agendaView: agendaView,
    branchView: branchView,
    statusDisplay: statusDisplay,
    caseView: caseView,
    stepsView: stepsView,
    responseView: responseView,
    rejectionView: rejectionView,
  });
}));
