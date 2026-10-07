// Polish chapter party: money, membership and the apparatus, press, TUR, cooperatives, the trade-union
// branches, Milicja PPS and AS, the PPS factions, the party's declared line and its cards
// (docs/POLISH_IMPLEMENTATION_PLAN.md, stage 5; technical reference 9.5, 10.1–10.10, 13.1–13.5, 14.1).
//
// Plain JavaScript without dependencies, like polish_rules.js, whose clock, cooldowns and transactions it
// uses. `npm run build` copies it to out/html/; the page loads it after polish_projects.js as
// `window.PolishParty`, and Node tests load it with require(). Numbers marked P in the reference are
// taken as written; they are a working balance of the approved structure, not historical statistics.
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./polish_rules.js'), require('./polish_economy.js'), require('./polish_government.js'),
      require('./polish_projects.js'), require('./polish_electorate.js'));
  } else {
    root.PolishParty = factory(root.PolishRules, root.PolishEconomy, root.PolishGovernment, root.PolishProjects, root.PolishElectorate);
  }
}(typeof self !== 'undefined' ? self : this, function (rules, economy, government, projects, electorate) {
  'use strict';

  if (!rules || !economy || !government || !projects || !electorate) {
    throw new Error('PolishParty needs polish_rules.js, polish_economy.js, polish_government.js, polish_projects.js and polish_electorate.js first');
  }

  const copy = value => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
  const clip = (value, low, high) => Math.max(low, Math.min(high, value));
  const round = (value, digits) => Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
  const T = rules.timeOf;
  const OK = Object.freeze({available: true, reason: ''});
  const no = reason => ({available: false, reason: reason});
  // Polish version (decision 2A): the texts of this module are written in both languages and L picks the current
  // one; numbers get a decimal comma in Polish (decision 6A).
  const L = rules.L;
  const fmt = value => {
    const text = Math.abs(value) < 0.005 ? '0' : value.toFixed(2).replace(/\.?0+$/, '');
    return rules.getLanguage() === 'pl' ? text.replace('.', ',') : text;
  };

  // ---- Profiles and opening values (3.2, 13.1–13.3, 14.1) ---------------------------------------------

  const PARTY_PROFILE_ID = 'party_profile_v1';
  const FACTIONS = Object.freeze(['centrum', 'lewica', 'pilsudczycy']);
  const FACTION_NAMES = Object.freeze({centrum: 'Centrum PPS', lewica: 'Lewica PPS', pilsudczycy: 'Piłsudczycy'});
  const BRANCHES = Object.freeze(['industry', 'rail', 'farm_labour']);
  const BRANCH_NAMES = Object.freeze({industry: 'Industry', rail: 'Railways', farm_labour: 'Agricultural labour'});
  const BRANCH_NAMES_PL = Object.freeze({industry: 'Przemysł', rail: 'Kolej', farm_labour: 'Robotnicy rolni'});
  const branchName = id => L(BRANCH_NAMES[id], BRANCH_NAMES_PL[id]);
  // 'branży przemysłowej' and 'branżę przemysłową': the genitive or locative and the accusative of a branch in Polish.
  const BRANCH_PL_GENITIVE = Object.freeze({industry: 'przemysłowej', rail: 'kolejowej', farm_labour: 'robotników rolnych'});
  const BRANCH_PL_ACCUSATIVE = Object.freeze({industry: 'przemysłową', rail: 'kolejową', farm_labour: 'robotników rolnych'});
  const BRANCH_FUNDS = Object.freeze({industry: 0.50, rail: 0.25, farm_labour: 0.25});
  const DUES_MIN = 1;
  const DUES_MAX = 4;
  const APPARATUS_MAX = 4;
  const TUR_MAX = 3;
  // H — the TUR's own 1929 publication confirms its foundation in January 1923 (PL-CONTENT-1922-1926-2026-09);
  // the pace of its levels is P (13.2). Z — 0.58 (the user's decision of 5 X 2026): the date stays recorded in
  // `tur.available_from`, but it no longer blocks the founding; PPS may found TUR from the start (alternate history).
  const TUR_AVAILABLE_FROM = T(1923, 1);
  const REACH_MULTIPLIER_CAP = 1.30; // 10.6: character of the party and TUR together
  const COOPERATIVE_CLASSES = Object.freeze(['workers', 'rural']);
  const COOPERATIVE_NAMES = Object.freeze({workers: 'a workers’ consumer cooperative', rural: 'a village cooperative of smallholders'});
  const COOPERATIVE_NAMES_PL = Object.freeze({workers: 'robotnicza spółdzielnia spożywców', rural: 'wiejska spółdzielnia drobnych gospodarzy'});
  const COOPERATIVE_NAMES_PL_ACCUSATIVE = Object.freeze({workers: 'robotniczą spółdzielnię spożywców', rural: 'wiejską spółdzielnię drobnych gospodarzy'});
  const RELIEF_CAP = 6; // 13.2: the current relief in one cell

  // 10.5: the synthetic opening line of PPS, not a reconstruction of its programme of January 1922. Stage 8 (8f): the
  // line on the Slavic minorities is territorial autonomy, as in the PPS bill of Niedziałkowski of October 1921
  // (HISTORICAL_SOURCES.md).
  const OPENING_STRATEGY = Object.freeze({direction: 'parliamentary_socialism', main_opponent: 'nationalist_right',
    pils_influence: 'conditional', form_of_power: 'parliamentarism', electoral_base: 'workers', economic_priorities: [],
    slavic_autonomy: 'regional_autonomy', jewish_cooperation: 'labour_only', ussr_stance: 'uncommitted'});

  function createPartyState(Q) {
    const unions = {};
    for (const id of BRANCHES) {
      // Stage 6: the lines of a strike call (10.3) and the causes of the branch's dissent.
      unions[id] = {id: id, reach: 20, readiness: 25, trust: 50, autonomy: 60, dissent: 0, fatigue: 0, fund: BRANCH_FUNDS[id],
        alignment: {legal_institutions: 50, strike: 50, agreed_end: 50}, agreements: [], strike: null, dissent_causes: []};
    }
    return {
      party_orgs: {
        profile_id: PARTY_PROFILE_ID,
        cash: Number(Q.resources) || 0,
        dues: clip(Math.round(Number(Q.dues) || 2), DUES_MIN, DUES_MAX),
        apparatus: {level: 1, member_index: 100, worker_support0: null, union_reach0: 20},
        press: {reach: 30, credibility: 60, format: 'party_journal', popular_adopted: false, campaigns: [], restrictions: [],
          unpaid_months: 0, paid_last: true, cases: []},
        tur: {level: 0, cadres: 0, available_from: TUR_AVAILABLE_FROM, active_build: null, active_course: null,
          prepared_campaigns: [], completed_courses: []},
        cooperatives: {projects: []},
        arrears: {apparatus: 0, press: 0, tur: 0, cooperatives: 0},
        last_ledger: null,
        mirror_base: {},
      },
      militia: {strength: Math.max(0, Math.round(Number(Q.pps_militia_strength) || 200)),
        militancy: clip(Number(Q.pps_militia_militancy) || 0.10, 0, 1), stage: Q.pps_militia_stage === 2 ? 2 : 1,
        militarized: false, militarized_once: false, fatigue: 0, arrears: 0, assignments: [], banned: false, repressed: false,
        dissent: 0, alignment: {legal_institutions: 50}, unpaid_last: false},
      unions: unions,
      faction_cases: {},
    };
  }

  // The PPS actor gets its factions and its line (10.1, 10.5): stored in S.actors.pps, with the inherited
  // fields Q.<faction>_strength, Q.<faction>_dissent and Q.dissent as mirrors.
  function createPpsActor(Q) {
    const factions = {};
    for (const id of FACTIONS) {
      factions[id] = {strength: Math.max(0, Number(Q[id + '_strength']) || 0), dissent: clip(Number(Q[id + '_dissent']) || 0, 0, 99),
        seats: 0, reactions: []};
    }
    normalizeFactions(factions);
    return {factions: factions, strategy: copy(OPENING_STRATEGY), strategy_history: [], reactions: []};
  }

  // Everything a new game adds to the state tree for the party (schema 6).
  function attachPartyState(Q) {
    const S = Q.S;
    Object.assign(S, createPartyState(Q));
    const actor = createPpsActor(Q);
    Object.assign(S.actors.pps, actor);
    if (S.actors.relations.pilsudski === undefined) S.actors.relations.pilsudski = 60; // 3.2: relation PPS–Piłsudski 60
    S.actors.bund = {trust: 50, joint_actions: []}; // 5.5: an organisation, not a party
    S.actors.communist_cooperation = {trial_records: [], rules: {legal_vote: false, no_forced_merger: false, agreed_strike_end: false},
      rules_agreed: false, pps_internal_acceptance: {centrum: 50, lewica: 50, pilsudczycy: 50}, active_agreement: null};
    writeProgramme(S);
    S.party_orgs.apparatus.worker_support0 = ppsWorkerSupport(Q);
    S.party_orgs.apparatus.union_reach0 = averageUnionReach(S);
    writeMirrors(Q);
  }

  // The party state of stage 5 is there and belongs to a compatible save (19.3).
  const partyReady = Q => !!(Q && Q.S && !Q.polish_save_incompatible && Q.S.party_orgs && Q.S.militia && Q.S.unions &&
    Q.S.actors && Q.S.actors.pps && Q.S.actors.pps.factions);

  // ---- Factions: normalization, cohesion and reactions (10.1) -----------------------------------------

  function normalizeFactions(factions) {
    let total = 0;
    for (const id of FACTIONS) {
      factions[id].strength = Math.max(0, factions[id].strength);
      factions[id].dissent = clip(factions[id].dissent, 0, 99);
      total += factions[id].strength;
    }
    if (total > 0) for (const id of FACTIONS) factions[id].strength = 100 * factions[id].strength / total;
  }

  function factionsOf(S) {
    return S.actors.pps.factions;
  }

  // Q.dissent = min(0.95, Σ strength×dissent / 10000); cohesion = 100 × (1 − Q.dissent) (10.1).
  function partyDissent(S) {
    const f = factionsOf(S);
    return Math.min(0.95, FACTIONS.reduce((n, id) => n + f[id].strength * f[id].dissent, 0) / 10000);
  }

  function cohesion(S) {
    return 100 * (1 - partyDissent(S));
  }

  // One political reaction of a faction, with its cause (10.1, 10.2): the core is PolishGovernment.factionReaction,
  // shared with the projects and agreements; here the mirror fields are taken over first and written after.
  function factionReaction(Q, factionId, change, cause) {
    syncMirrors(Q);
    const f = government.factionReaction(Q, factionId, change, cause);
    writeMirrors(Q);
    return f;
  }

  // ---- Mirrors of the inherited fields -------------------------------------------------------------------

  const MIRROR_FIELDS = Object.freeze(['resources', 'dues', 'pps_militia_strength', 'pps_militia_militancy']
    .concat(FACTIONS.map(id => id + '_strength'), FACTIONS.map(id => id + '_dissent')));

  // Inherited scenes that are still reachable write the mirror fields. Their changes are taken over here,
  // so every value has one owner and nothing is lost or counted twice (as for relations in stage 3).
  function syncMirrors(Q) {
    if (!partyReady(Q)) return;
    const S = Q.S, base = S.party_orgs.mirror_base;
    if (S.actors.pps.factions) ensureFactionSeats(Q);
    if (!Object.keys(base).length) { writeMirrors(Q); return; }
    const delta = field => {
      const d = Number(Q[field]) - base[field];
      return Number.isFinite(d) && Math.abs(d) > 1e-9 ? d : 0;
    };
    const changes = [];
    const cash = delta('resources');
    if (cash) { S.party_orgs.cash = Math.max(0, S.party_orgs.cash + cash); changes.push(['resources', cash]); }
    const dues = delta('dues');
    if (dues) { S.party_orgs.dues = clip(Math.round(S.party_orgs.dues + dues), DUES_MIN, DUES_MAX); changes.push(['dues', dues]); }
    const people = delta('pps_militia_strength');
    if (people) { S.militia.strength = Math.max(0, Math.round(S.militia.strength + people)); changes.push(['pps_militia_strength', people]); }
    const militancy = delta('pps_militia_militancy');
    if (militancy) { S.militia.militancy = clip(S.militia.militancy + militancy, 0, 1); changes.push(['pps_militia_militancy', militancy]); }
    let factionsChanged = false;
    for (const id of FACTIONS) {
      const s = delta(id + '_strength'), d = delta(id + '_dissent');
      if (s) { factionsOf(S)[id].strength += s; factionsChanged = true; changes.push([id + '_strength', s]); }
      if (d) { factionsOf(S)[id].dissent = clip(factionsOf(S)[id].dissent + d, 0, 99); factionsChanged = true; changes.push([id + '_dissent', d]); }
    }
    if (factionsChanged) normalizeFactions(factionsOf(S));
    for (const [field, value] of changes) S.history.reasons.push({t: Q.time, kind: 'party_legacy_write', field: field, delta: value});
    writeMirrors(Q);
  }

  function writeMirrors(Q) {
    if (!partyReady(Q)) return;
    const S = Q.S, orgs = S.party_orgs, militia = S.militia, base = orgs.mirror_base;
    Q.resources = round(orgs.cash, 4);
    Q.dues = orgs.dues;
    Q.pps_militia_strength = militia.strength;
    Q.pps_militia_militancy = round(militia.militancy, 4);
    Q.pps_militia_stage = militia.stage;
    Q.pps_militia_name = militia.stage === 2 ? 'Akcja Socjalistyczna' : 'Milicja PPS';
    Q.akcja_socjalistyczna_formed = militia.stage === 2 ? 1 : 0;
    Q.pps_militia_banned = militia.banned ? 1 : 0;
    Q.pps_militia_repressed = militia.repressed ? 1 : 0;
    Q.rb_strength = militia.strength;
    Q.rb_militancy = Q.pps_militia_militancy;
    Q.rb_strength_compat_base = Q.rb_strength;
    Q.rb_militancy_compat_base = Q.rb_militancy;
    const f = factionsOf(S);
    for (const id of FACTIONS) {
      Q[id + '_strength'] = f[id].strength;
      Q[id + '_dissent'] = f[id].dissent;
    }
    Q.dissent = partyDissent(S);
    Q.dissent_percent = Q.dissent * 100;
    for (const field of MIRROR_FIELDS) base[field] = Number(Q[field]);
  }

  // ---- Money, membership and the apparatus (13.1) -----------------------------------------------------

  function averageUnionReach(S) {
    return BRANCHES.reduce((n, id) => n + S.unions[id].reach, 0) / BRANCHES.length;
  }

  // PPS share among the workers, weighted by their mass (13.1): from the cells, or the class row before them.
  function ppsWorkerSupport(Q) {
    const S = Q.S;
    if (S && electorate.hasCells(S)) return electorate.classShare(S, 'workers', 'pps');
    const row = Q.parties.map(p => Math.max(0, Number(Q['workers_' + p]) || 0));
    const total = row.reduce((n, v) => n + v, 0);
    return total > 0 ? 100 * (Number(Q.workers_pps) || 0) / total : 0;
  }

  function memberTarget(Q) {
    const S = Q.S, apparatus = S.party_orgs.apparatus;
    const support0 = apparatus.worker_support0 || ppsWorkerSupport(Q) || 1;
    const reach0 = apparatus.union_reach0 || 20;
    const ratio = (ppsWorkerSupport(Q) / support0 + averageUnionReach(S) / reach0) / 2;
    return clip(100 * ratio * (1 - 0.05 * (S.party_orgs.dues - 2)), 50, 150);
  }

  // Z — 0.56 (item 1 of 5 X 2026): the money of the original game. There is no monthly income, upkeep or arrears; money
  // comes from collections — the card Party Dues and the extraordinary collection of the agenda — and from events. A
  // collection brings dues × membership / 100, and each level of the apparatus above the first adds 25% (decisions 1a, 1b).
  const APPARATUS_COLLECTION_BONUS = 0.25;
  function collectionAt(dues, members, level) {
    return dues * members / 100 * (1 + APPARATUS_COLLECTION_BONUS * (level - 1));
  }
  function collectionGain(S) {
    const orgs = S.party_orgs;
    return collectionAt(orgs.dues, orgs.apparatus.member_index, orgs.apparatus.level);
  }

  const operatingCooperatives = S => S.party_orgs.cooperatives.projects.filter(p => p.status === 'operating');

  function pressEffective(S) {
    const press = S.party_orgs.press, t = S.turn.last_settled_time + 1;
    const penalty = press.restrictions.filter(r => r.status === 'active' && t < r.expires_at).reduce((n, r) => n + r.reach_penalty, 0);
    return {reach: clip(press.reach + (press.format === 'popular' ? 10 : 0) - penalty, 0, 100),
      credibility: clip(press.credibility - (press.format === 'popular' ? 5 : 0), 0, 100), penalty: penalty};
  }

  // One month of the party's own finances (13.1–13.4, 14.1), in step 6 of 4.2 after the economy and the flows, before the
  // agreements. Z — 0.56: only the membership moves here; the organisations work without upkeep — the press keeps its
  // reach, a build or a course of TUR advances every month, the cooperatives give their relief while they operate and
  // Milicja recovers 5 fatigue a month. Arrears of an older save are written off.
  function settleParty(Q, t) {
    const S = Q.S, orgs = S.party_orgs, militia = S.militia;
    // Membership approaches its target by 5% of the gap (13.1; the order of the approved M18 diagnostics).
    const apparatus = orgs.apparatus;
    const target = memberTarget(Q);
    apparatus.member_index = clip(apparatus.member_index + 0.05 * (target - apparatus.member_index), 0, 150);
    for (const key of Object.keys(orgs.arrears)) orgs.arrears[key] = 0;
    militia.arrears = 0;
    const press = orgs.press;
    press.unpaid_months = 0;
    press.paid_last = true;
    const tur = orgs.tur;
    if (tur.active_build) {
      tur.active_build.paid_months += 1;
      if (tur.active_build.paid_months >= 2) {
        tur.level = tur.active_build.target_level;
        tur.cadres = Math.min(100, tur.cadres + 10);
        S.history.reasons.push({t: t, kind: 'tur_level', level: tur.level});
        tur.active_build = null;
      }
    }
    if (tur.active_course) {
      tur.active_course.paid_months += 1;
      if (tur.active_course.paid_months >= 2) completeCourse(Q, t);
    }
    for (const project of operatingCooperatives(S)) project.paid_last = true;
    militia.fatigue = Math.max(0, militia.fatigue - 5);
    militia.unpaid_last = false;
    // Since stage 6 the unions' own funds are settled by PolishUnions.beginMonth, before a strike draws on them
    // (14.1–14.2).
    orgs.last_ledger = {t: t, cash: round(orgs.cash, 4), member_index: round(apparatus.member_index, 4), member_target: round(target, 4)};
    return orgs.last_ledger;
  }

  // Called once per settled month from post_event, for period t = settlement.t (4.2 step 6).
  function settleMonth(Q, settlement) {
    if (!partyReady(Q) || !settlement) return null;
    syncMirrors(Q);
    const clock = {time: Q.time, year: Q.year, month: Q.month};
    const t = settlement.t;
    Q.time = t; Q.year = rules.yearOf(t); Q.month = rules.monthOf(t);
    try {
      const ledger = settleParty(Q, t);
      settleRewards(Q, t);
      updateFactionCases(Q, t);
      expireAdvisorEffects(Q.S, t + 1);
      return ledger;
    } finally {
      Q.time = clock.time; Q.year = clock.year; Q.month = clock.month;
      writeMirrors(Q);
    }
  }

  // ---- Expansion of reach: the character of the party and TUR (10.6, 13.2) ---------------------------

  // Environments of the character of the party: `workers` — the three branches and the workers' cells;
  // `workers_peasants` — also the peasants; `broad_democratic` — intelligentsia and petty bourgeoisie.
  function inEnvironment(S, target) {
    const base = S.actors.pps.strategy.electoral_base;
    if (target.kind === 'branch') return base === 'workers' || base === 'workers_peasants';
    const c = target.class_id;
    if (base === 'workers') return c === 'workers';
    if (base === 'workers_peasants') return c === 'workers' || c === 'rural';
    if (base === 'broad_democratic') return c === 'new_middle' || c === 'old_middle';
    return false;
  }

  function expansionMultiplier(S, target) {
    const tur = S.party_orgs.tur;
    const value = 1 + (inEnvironment(S, target) ? 0.10 : 0) + 0.1 * Math.floor(tur.cadres / 20);
    return Math.min(REACH_MULTIPLIER_CAP, value);
  }

  function expandBranch(S, branchId, amount) {
    const branch = S.unions[branchId];
    const gain = amount * expansionMultiplier(S, {kind: 'branch', id: branchId});
    branch.reach = Math.min(100, branch.reach + gain);
    return gain;
  }

  // ---- Organisations of PPS: up to two investments in one action (13.5; card 5.1) --------------------

  const PACKAGES = Object.freeze({
    union_organize_industry: {org: 'unions', cost: 1, branch: 'industry', kind: 'organize'},
    union_organize_rail: {org: 'unions', cost: 1, branch: 'rail', kind: 'organize'},
    union_organize_farm_labour: {org: 'unions', cost: 1, branch: 'farm_labour', kind: 'organize'},
    union_fund_industry: {org: 'unions', cost: 1, branch: 'industry', kind: 'fund'},
    union_fund_rail: {org: 'unions', cost: 1, branch: 'rail', kind: 'fund'},
    union_fund_farm_labour: {org: 'unions', cost: 1, branch: 'farm_labour', kind: 'fund'},
    press_distribution: {org: 'press', cost: 1, kind: 'distribution'},
    tur: {org: 'tur', cost: 2, kind: 'build'},
    militia_recruit: {org: 'militia', cost: 1, kind: 'recruit'},
    militia_militarize: {org: 'militia', cost: 2, kind: 'militarize'},
    cooperative_workers: {org: 'cooperatives', cost: 1, kind: 'prepare', class_id: 'workers'},
    cooperative_rural: {org: 'cooperatives', cost: 1, kind: 'prepare', class_id: 'rural'},
  });
  const PACKAGE_ORDER = Object.freeze(Object.keys(PACKAGES));
  // Z — 0.56 (item 4 of 5 X 2026): the union packages have a card of their own, party.union_investments; the other packages
  // stay in party.organizations. Unions are one organisation, so their card takes one package in one action.
  const UNION_CARD = 'party.union_investments', ORGANIZATIONS_CARD = 'party.organizations';
  const cardOfPackage = id => (PACKAGES[id].org === 'unions' ? UNION_CARD : ORGANIZATIONS_CARD);
  const ORG_NAMES = Object.freeze({unions: 'trade unions', press: 'the press', tur: 'TUR', militia: 'Milicja', cooperatives: 'cooperatives'});
  const ORG_NAMES_PL_ACCUSATIVE = Object.freeze({unions: 'związki zawodowe', press: 'prasę', tur: 'TUR', militia: 'Milicję', cooperatives: 'spółdzielnie'});
  const ORGANIZATIONS_COOLDOWN = 2;
  const SUBACTION_COOLDOWNS = Object.freeze({organize: 2, distribution: 2, recruit: 2, militarize: 3});

  function packageCooldownKey(id) {
    const p = PACKAGES[id];
    if (p.kind === 'organize') return 'union.organize.' + p.branch;
    if (p.kind === 'distribution') return 'party.press_distribution';
    if (p.kind === 'recruit') return 'militia.recruit';
    if (p.kind === 'militarize') return 'militia.militarize';
    return null;
  }

  function waitReason(Q, key) {
    const wait = key ? rules.cooldownRemaining(Q, key) : 0;
    return wait > 0 ? L('Available again in ' + wait + (wait === 1 ? ' month.' : ' months.'),
      'Znów dostępne za ' + wait + ' ' + rules.plural(wait, 'miesiąc', 'miesiące', 'miesięcy') + '.') : '';
  }

  // One package on the state before the transaction; `spent` is what the other package of the same card
  // costs, so the reserve of Milicja is checked after all one-off expenses (13.5).
  function packageStatus(Q, id, spent) {
    const S = Q.S, p = PACKAGES[id];
    if (!p) return no(L('Unknown package.', 'Nieznany pakiet.'));
    const cash = S.party_orgs.cash - (spent || 0);
    const wait = waitReason(Q, packageCooldownKey(id));
    if (wait) return no(wait);
    if (cash + 1e-9 < p.cost) return no(L('Needs ' + rules.units(p.cost) + '.', 'Wymaga ' + rules.units(p.cost, 'resources', 'gen') + '.'));
    if (p.org === 'tur') {
      const tur = S.party_orgs.tur;
      if (tur.level >= TUR_MAX) return no(L('TUR has its full national coordination.', 'TUR ma już pełną koordynację ogólnokrajową.'));
      if (tur.active_build) return no(L('A stage of TUR is already being built.', 'Jeden etap TUR jest już w budowie.'));
    }
    if (p.org === 'militia') {
      const m = S.militia;
      if (m.banned) return no(L('Milicja is banned.', 'Milicja jest zakazana.'));
      if (p.kind === 'militarize' && m.militancy >= 0.70 - 1e-9) return no(L('Its efficiency has reached 0.70.', 'Jej sprawność osiągnęła 0,70.'));
    }
    if (p.org === 'cooperatives') {
      if (S.party_orgs.cooperatives.projects.some(c => c.class_id === p.class_id && c.status === 'prepared')) {
        return no(L('A cooperative for these recipients is already prepared; launch it from the party agenda.', 'Spółdzielnia dla tych odbiorców jest już przygotowana; uruchom ją z agendy partii.'));
      }
    }
    return OK;
  }

  function organizationsAvailable(Q) {
    if (!partyReady(Q) || Q.S.chapter.status === 'ended') return false;
    if (rules.cooldownRemaining(Q, ORGANIZATIONS_CARD) > 0) return false;
    return true;
  }

  function unionInvestmentsAvailable(Q) {
    if (!partyReady(Q) || Q.S.chapter.status === 'ended') return false;
    return rules.cooldownRemaining(Q, UNION_CARD) === 0;
  }

  function selectionStatus(Q, ids, card) {
    const S = Q.S, owner = card || ORGANIZATIONS_CARD;
    if (ids.some(id => !PACKAGES[id] || cardOfPackage(id) !== owner)) return no(L('Unknown package.', 'Nieznany pakiet.'));
    if (owner === UNION_CARD && ids.length !== 1) return no(L('Choose one investment for the unions.', 'Wybierz jedną inwestycję w związki.'));
    if (!ids.length || ids.length > 2) return no(L('Choose one or two organisations.', 'Wybierz jedną albo dwie organizacje.'));
    if (ids.length === 2 && PACKAGES[ids[0]].org === PACKAGES[ids[1]].org) return no(L('The two packages must be for different organisations.', 'Oba pakiety muszą dotyczyć różnych organizacji.'));
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    const total = ids.reduce((n, id) => n + PACKAGES[id].cost, 0);
    if (S.party_orgs.cash + 1e-9 < total) {
      return no(L('The package costs ' + rules.units(total) + '; PPS has only ' + fmt(S.party_orgs.cash) + '.',
        'Pakiet kosztuje ' + rules.units(total, 'resources', 'acc') + '; PPS ma tylko ' + fmt(S.party_orgs.cash) + '.'));
    }
    for (let i = 0; i < ids.length; i++) {
      const spent = ids.filter((other, j) => j !== i).reduce((n, other) => n + PACKAGES[other].cost, 0);
      const status = packageStatus(Q, ids[i], spent);
      if (!status.available) return status;
    }
    return OK;
  }

  function applyPackage(Q, id) {
    const S = Q.S, p = PACKAGES[id], t = Q.time;
    S.party_orgs.cash = Math.max(0, S.party_orgs.cash - p.cost);
    const key = packageCooldownKey(id);
    if (key) S.cooldowns[key] = t + SUBACTION_COOLDOWNS[p.kind];
    if (p.kind === 'organize') {
      const gain = fmt(expandBranch(S, p.branch, 15));
      return L('the ' + BRANCH_NAMES[p.branch].toLowerCase() + ' branch gains ' + gain + ' reach', 'zasięg branży ' + BRANCH_PL_GENITIVE[p.branch] + ' rośnie o ' + gain);
    }
    if (p.kind === 'fund') {
      S.unions[p.branch].fund += 1;
      return L('the ' + BRANCH_NAMES[p.branch].toLowerCase() + ' fund gains 1 R', 'fundusz branży ' + BRANCH_PL_GENITIVE[p.branch] + ' rośnie o 1 R');
    }
    if (p.kind === 'distribution') {
      S.party_orgs.press.reach = Math.min(100, S.party_orgs.press.reach + 10);
      return L('the press gains 10 reach', 'zasięg prasy rośnie o 10');
    }
    if (p.kind === 'build') {
      S.party_orgs.tur.active_build = {target_level: S.party_orgs.tur.level + 1, started_at: t, paid_months: 0};
      // Z — 0.58: no monthly payments since Z — 0.56, so the build simply takes two months.
      return L('TUR starts building level ' + (S.party_orgs.tur.level + 1) + ' (two months)',
        'TUR zaczyna budowę poziomu ' + (S.party_orgs.tur.level + 1) + ' (dwa miesiące)');
    }
    if (p.kind === 'recruit') return recruit(Q);
    if (p.kind === 'militarize') return militarize(Q);
    if (p.kind === 'prepare') {
      const project = {id: 'coop-' + (S.party_orgs.cooperatives.projects.length + 1) + '-' + p.class_id + '-t' + t, class_id: p.class_id,
        status: 'prepared', prepared_at: t, launched_at: null, relief: 1, paid_last: false};
      S.party_orgs.cooperatives.projects.push(project);
      return L(COOPERATIVE_NAMES[p.class_id] + ' is prepared; its launch waits in the party agenda',
        'przygotowano: ' + COOPERATIVE_NAMES_PL[p.class_id] + '; jej uruchomienie czeka w agendzie partii');
    }
    throw new Error('applyPackage: unknown package ' + id);
  }

  // The whole package is checked first, then the sum of R and 1 T are taken, then the effects and the
  // cooldowns are written; a missing R blocks the whole package, never half of it (13.5).
  function organizationsChoose(Q, ids, card) {
    syncMirrors(Q);
    const owner = card || ORGANIZATIONS_CARD;
    const status = selectionStatus(Q, ids, owner);
    if (!status.available) throw new Error('organizationsChoose: ' + status.reason);
    rules.commitMainAction(Q, owner, {selected_options: ids.slice(), resource_cost: {R: ids.reduce((n, id) => n + PACKAGES[id].cost, 0)}});
    const results = ids.map(id => applyPackage(Q, id));
    Q.S.cooldowns[owner] = Q.time + ORGANIZATIONS_COOLDOWN;
    writeMirrors(Q);
    return result(Q, L('PPS invests in ' + ids.map(id => ORG_NAMES[PACKAGES[id].org]).join(' and ') + ': ',
      'PPS inwestuje w ' + ids.map(id => ORG_NAMES_PL_ACCUSATIVE[PACKAGES[id].org]).join(' i ') + ': ') + results.join('; ') + '.');
  }

  // ---- Milicja PPS and AS (13.3–13.4; card 5.2) --------------------------------------------------------

  function recruit(Q) {
    Q.S.militia.strength += 100;
    return L('Milicja gains 100 members', 'Milicja zyskuje 100 członków');
  }

  function militarize(Q) {
    const S = Q.S, m = S.militia;
    m.militancy = Math.min(0.70, m.militancy + 0.10);
    m.militarized = true;
    if (!m.militarized_once) {
      m.militarized_once = true;
      // Z — 0.34: the Centre fears an uncontrolled militarisation; the Left gets no bonus (13.3).
      factionReaction(Q, 'centrum', {dissent: 3}, {id: 'militia.militarize', kind: 'militarization', reverse: null});
    }
    return L('Milicja trains and disciplines its members: efficiency ', 'Milicja szkoli i dyscyplinuje członków: sprawność ') + fmt(m.militancy);
  }

  function canFormAS(S) {
    const m = S.militia;
    return m.stage === 1 && m.militarized && m.strength >= 500 && !m.banned && !m.repressed && S.party_orgs.cash + 1e-9 >= 2;
  }

  function militiaStatus(Q, option) {
    const S = Q.S, m = S.militia;
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    if (m.banned) return no(L('Milicja is banned.', 'Milicja jest zakazana.'));
    if (option === 'recruit') return packageStatus(Q, 'militia_recruit', 0);
    if (option === 'militarize') return packageStatus(Q, 'militia_militarize', 0);
    if (option === 'as') {
      if (m.stage === 2) return no(L('Akcja Socjalistyczna is already formed.', 'Akcja Socjalistyczna już istnieje.'));
      if (!m.militarized) return no(L('Needs a militarised Milicja.', 'Wymaga zmilitaryzowanej Milicji.'));
      if (m.strength < 500) return no(L('Needs at least 500 members; Milicja has ' + m.strength + '.', 'Wymaga co najmniej 500 członków; Milicja ma ' + m.strength + '.'));
      if (m.repressed) return no(L('Milicja is under repression.', 'Milicja podlega represjom.'));
      // Z — 0.56: 2 for the change, with no reserve for upkeep.
      if (S.party_orgs.cash + 1e-9 < 2) return no(L('Needs 2 resources.', 'Wymaga 2 jednostek środków.'));
      return OK;
    }
    return no(L('Unknown option.', 'Nieznana opcja.'));
  }

  function militiaAvailable(Q) {
    return partyReady(Q) && Q.S.chapter.status !== 'ended' && !Q.S.militia.banned;
  }

  function militiaChoose(Q, option) {
    syncMirrors(Q);
    const status = militiaStatus(Q, option);
    if (!status.available) throw new Error('militiaChoose: ' + status.reason);
    const S = Q.S, t = Q.time;
    let text;
    if (option === 'as') {
      rules.commitMainAction(Q, 'militia.as', {resource_cost: {R: 2}});
      S.party_orgs.cash = Math.max(0, S.party_orgs.cash - 2);
      S.militia.stage = 2;
      text = L('Milicja is reorganised as Akcja Socjalistyczna: its members follow a call better (+0.15) and it can cover up to three cases at once before a coup.',
        'Milicja zostaje przekształcona w Akcję Socjalistyczną: jej członkowie lepiej odpowiadają na wezwanie (+0,15) i przed zamachem może obsługiwać do trzech spraw naraz.');
    } else {
      const id = option === 'recruit' ? 'militia_recruit' : 'militia_militarize';
      rules.commitMainAction(Q, 'militia.' + option, {resource_cost: {R: PACKAGES[id].cost}});
      text = applyPackage(Q, id) + '.';
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }
    S.history.reasons.push({t: t, kind: 'militia', option: option});
    writeMirrors(Q);
    return result(Q, text);
  }

  // 10.3: compliance with one concrete call; AS adds 0.15 (M15).
  function compliance(alignment, cohesionValue, organizationDissent) {
    return clip(0.35 + 0.004 * alignment + 0.003 * cohesionValue - 0.003 * (organizationDissent || 0), 0, 1);
  }

  function militiaForce(S, options) {
    const m = S.militia, o = options || {};
    const alignment = o.alignment === undefined ? (m.alignment.legal_institutions || 50) : o.alignment;
    const base = compliance(alignment, o.cohesion === undefined ? cohesion(S) : o.cohesion, m.dissent);
    const effective = m.stage === 2 ? Math.min(1, base + 0.15) : base;
    const people = Math.max(0, m.strength - (o.committed || 0) - (o.unavailable || 0));
    return {compliance: base, effective_compliance: effective, force: (people / 100) * m.militancy * effective * (1 - m.fatigue / 100)};
  }

  // 13.4 (M15): Milicja covers one case at a time; AS up to three before a coup. Each case receives force up
  // to the full protection of 16.5 (40% at 4 F), the rest goes on, the third takes all that is left.
  function allocateProtection(stage, force, cases) {
    const limit = stage === 2 ? 3 : 1;
    const out = [];
    let left = force;
    for (let i = 0; i < cases; i++) {
      let assigned = 0;
      if (i < limit) assigned = i === limit - 1 ? left : Math.min(4, left);
      left -= assigned;
      out.push({force: assigned, protection: Math.min(0.40, 0.10 * assigned)});
    }
    return out;
  }

  // ---- Dues, collection and the apparatus (13.1; cards 5.4–5.6) ---------------------------------------

  function duesStatus(Q, option) {
    const S = Q.S, dues = S.party_orgs.dues;
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    const wait = waitReason(Q, 'party.dues');
    if (wait) return no(wait);
    // Z — 0.51: keeping the present level is a decision too, for this month's action and the usual wait.
    if (option === 'keep') return OK;
    if (option === 'raise' && dues >= DUES_MAX) return no(L('Dues are at their highest level, 4.', 'Składki są na najwyższym poziomie, 4.'));
    if (option === 'lower' && dues <= DUES_MIN) return no(L('Dues are at their lowest level, 1.', 'Składki są na najniższym poziomie, 1.'));
    return option === 'raise' || option === 'lower' ? OK : no(L('Unknown option.', 'Nieznana opcja.'));
  }

  function duesAvailable(Q) {
    return partyReady(Q) && Q.S.chapter.status !== 'ended' && rules.cooldownRemaining(Q, 'party.dues') === 0;
  }

  // A rise multiplies the membership by 0.95 when real wages are below 90 or unemployment is 8% or more, otherwise by 0.98;
  // a cut adds 2 points up to 150. Z — 0.56: as in the original game every option collects the dues at once, after the
  // change (collectionGain); the card still waits six months.
  function duesChange(S, option) {
    const orgs = S.party_orgs, E = S.economy;
    const hard = E.real_wage < 90 || E.unemployment >= 8;
    if (option === 'raise') return {dues: orgs.dues + 1, members: orgs.apparatus.member_index * (hard ? 0.95 : 0.98), hard: hard};
    if (option === 'lower') return {dues: orgs.dues - 1, members: Math.min(150, orgs.apparatus.member_index + 2), hard: hard};
    return {dues: orgs.dues, members: orgs.apparatus.member_index, hard: hard};
  }

  // What each option collects at once, for the card (Z — 0.56).
  function duesView(Q) {
    const S = Q.S;
    for (const option of ['keep', 'raise', 'lower']) {
      const change = duesChange(S, option);
      Q['pl_dues_' + option + '_gain'] = rules.units(round(collectionAt(change.dues, change.members, S.party_orgs.apparatus.level), 2));
    }
  }

  function duesChoose(Q, option) {
    syncMirrors(Q);
    const status = duesStatus(Q, option);
    if (!status.available) throw new Error('duesChoose: ' + status.reason);
    const S = Q.S, orgs = S.party_orgs;
    rules.commitMainAction(Q, 'party.dues', {option: option});
    const change = duesChange(S, option);
    let text;
    if (option === 'keep') {
      text = L('Dues stay at ' + orgs.dues + '.', 'Składki pozostają na poziomie ' + orgs.dues + '.');
    } else if (option === 'raise') {
      orgs.dues = change.dues;
      orgs.apparatus.member_index = change.members;
      text = L('Dues rise to ' + orgs.dues + '; some members leave (membership ×' + (change.hard ? '0.95' : '0.98') + ').',
        'Składki rosną do ' + orgs.dues + '; część członków odchodzi (członkostwo ×' + (change.hard ? '0,95' : '0,98') + ').');
    } else {
      orgs.dues = change.dues;
      orgs.apparatus.member_index = change.members;
      text = L('Dues fall to ' + orgs.dues + '; membership +2.', 'Składki spadają do ' + orgs.dues + '; członkostwo +2.');
    }
    const gain = collectionGain(S);
    orgs.cash += gain;
    S.cooldowns['party.dues'] = Q.time + 6;
    writeMirrors(Q);
    return result(Q, text + L(' The collection brings ' + fmt(gain) + ' R.', ' Zbiórka przynosi ' + fmt(gain) + ' R.'));
  }

  function fundraiseStatus(Q) {
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    const wait = waitReason(Q, 'party.fundraise');
    return wait ? no(wait) : OK;
  }

  // An extraordinary collection: dues × membership / 100 R, 1 T, cd 3 M; not a second booking of the
  // monthly income (13.1).
  function fundraise(Q) {
    syncMirrors(Q);
    const status = fundraiseStatus(Q);
    if (!status.available) throw new Error('fundraise: ' + status.reason);
    const S = Q.S, orgs = S.party_orgs;
    const gain = collectionGain(S);
    rules.commitMainAction(Q, 'party.fundraise', {});
    orgs.cash += gain;
    S.cooldowns['party.fundraise'] = Q.time + 3;
    writeMirrors(Q);
    return result(Q, L('The extraordinary collection brings ', 'Zbiórka nadzwyczajna przynosi ') + fmt(gain) + ' R.');
  }

  function apparatusStatus(Q) {
    const S = Q.S;
    if (S.party_orgs.apparatus.level >= APPARATUS_MAX) return no(L('The apparatus has its highest level, 4.', 'Aparat ma najwyższy poziom, 4.'));
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    if (S.party_orgs.cash + 1e-9 < 2) return no(L('Needs 2 resources.', 'Wymaga 2 jednostek środków.'));
    return OK;
  }

  function buildApparatus(Q) {
    syncMirrors(Q);
    const status = apparatusStatus(Q);
    if (!status.available) throw new Error('buildApparatus: ' + status.reason);
    const S = Q.S, orgs = S.party_orgs;
    rules.commitMainAction(Q, 'party.apparatus', {resource_cost: {R: 2}});
    orgs.cash = Math.max(0, orgs.cash - 2);
    orgs.apparatus.level += 1;
    writeMirrors(Q);
    return result(Q, L('The party apparatus reaches level ' + orgs.apparatus.level + ': every collection brings 25% more for each level above the first.',
      'Aparat partii osiąga poziom ' + orgs.apparatus.level + ': każda zbiórka przynosi o 25% więcej za każdy poziom powyżej pierwszego.'));
  }

  // ---- Organisational work without money (4.4; card 5.7) ---------------------------------------------

  const ORGANIZE_CLASSES = Object.freeze(['workers', 'rural', 'new_middle', 'old_middle', 'bourgeois_landowners']);

  function organizeStatus(Q, target) {
    const isBranch = target.indexOf('branch:') === 0, isClass = target.indexOf('class:') === 0;
    if (!isBranch && !isClass) return no(L('Organisational work reaches a union branch or the cells of one class, not the press or TUR.', 'Praca organizacyjna obejmuje branżę związkową albo grupy wyborców jednej klasy, a nie prasę ani TUR.'));
    if (isBranch && BRANCHES.indexOf(target.slice(7)) < 0) return no(L('Unknown branch.', 'Nieznana branża.'));
    if (isClass && ORGANIZE_CLASSES.indexOf(target.slice(6)) < 0) return no(L('Unknown class.', 'Nieznana klasa.'));
    if (isClass && !electorate.hasCells(Q.S)) return no(L('The cells of the electorate are not recorded.', 'Grupy wyborców nie są zapisane.'));
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    return OK;
  }

  // Free of money but weak: +2 reach of one branch or +2 base reach of PPS in the cells of one class, with
  // the multiplier of the party's character and TUR (Z — 0.34).
  function organizeWithoutFunds(Q, target) {
    syncMirrors(Q);
    const status = organizeStatus(Q, target);
    if (!status.available) throw new Error('organizeWithoutFunds: ' + status.reason);
    const S = Q.S;
    rules.commitMainAction(Q, 'party.organize_without_funds', {target: target});
    let text;
    if (target.indexOf('branch:') === 0) {
      const id = target.slice(7);
      const gain = fmt(expandBranch(S, id, 2));
      text = L('Organisers work in the ' + BRANCH_NAMES[id].toLowerCase() + ' branch: reach +' + gain + '.',
        'Organizatorzy pracują w branży ' + BRANCH_PL_GENITIVE[id] + ': zasięg +' + gain + '.');
    } else {
      const classId = target.slice(6);
      const gain = 2 * expansionMultiplier(S, {kind: 'class', class_id: classId});
      electorate.addBaseReach(S, cell => cell.class_id === classId, gain);
      text = L('Organisers work among ' + electorate.CLASS_NAMES[classId] + ': the base reach of PPS there +' + fmt(gain) + '.',
        'Organizatorzy pracują wśród ' + electorate.CLASS_NAMES_PL_GENITIVE[classId] + ': bazowy zasięg PPS w tej grupie +' + fmt(gain) + '.');
    }
    writeMirrors(Q);
    return result(Q, text);
  }

  // ---- TUR: levels and courses (13.2; cards 5.1 and 5.8) ----------------------------------------------

  const COURSES = Object.freeze({
    civil_rights: {level: 1, name: 'Civil rights and the practice of democracy', audience: 'class'},
    union_cadres: {level: 2, name: 'Union cadres and the line of PPS', audience: 'branch'},
    social_reform: {level: 2, name: 'Preparation of a social reform', audience: 'project'},
    national_education: {level: 3, name: 'A national education campaign', audience: 'classes'},
  });
  const COURSE_NAMES_PL = Object.freeze({civil_rights: 'Prawa obywatelskie i praktyka demokracji', union_cadres: 'Kadry związkowe i linia PPS',
    social_reform: 'Przygotowanie reformy społecznej', national_education: 'Ogólnokrajowa kampania oświatowa'});
  const courseName = id => L(COURSES[id].name, COURSE_NAMES_PL[id]);
  const REFORM_TYPES = Object.freeze(['public_works', 'education_program', 'credit_instrument', 'minority_schools']);

  function reformProjects(S) {
    return Object.keys(S.projects).sort().map(id => S.projects[id]).filter(p => p && REFORM_TYPES.indexOf(p.type) >= 0 &&
      (p.status === 'idea' || p.status === 'prepared') && !p.tur_prepared && (p.klass === 'large'));
  }

  function courseStatus(Q, courseId, target) {
    const S = Q.S, tur = S.party_orgs.tur, course = COURSES[courseId];
    if (!course) return no(L('Unknown course.', 'Nieznany kurs.'));
    if (tur.level < course.level) return no(L('Needs TUR level ' + course.level + '.', 'Wymaga TUR na poziomie ' + course.level + '.'));
    if (tur.active_course) return no(L('A course is already running.', 'Kurs już trwa.'));
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    const wait = waitReason(Q, 'party.tur_course');
    if (wait) return no(wait);
    if (S.party_orgs.cash + 1e-9 < 1) return no(L('Needs 1 resource.', 'Wymaga 1 jednostki środków.'));
    if (course.audience === 'project' && !reformProjects(S).length) {
      return no(L('Needs a large labour, education, housing or cooperative project that has not been launched.', 'Wymaga dużego projektu pracy, oświaty, mieszkalnictwa albo spółdzielczości, który nie został jeszcze uruchomiony.'));
    }
    if (target !== undefined && course.audience === 'branch' && BRANCHES.indexOf(target) < 0) return no(L('Choose a union branch.', 'Wybierz branżę związkową.'));
    return OK;
  }

  function turCourse(Q, courseId, target) {
    syncMirrors(Q);
    const status = courseStatus(Q, courseId, target);
    if (!status.available) throw new Error('turCourse: ' + status.reason);
    const S = Q.S, tur = S.party_orgs.tur, t = Q.time;
    rules.commitMainAction(Q, 'party.tur_course', {course: courseId, target: target || null, resource_cost: {R: 1}});
    S.party_orgs.cash = Math.max(0, S.party_orgs.cash - 1);
    let chosen = target || null;
    if (COURSES[courseId].audience === 'project') chosen = chosen || reformProjects(S)[0].id;
    tur.active_course = {course: courseId, target: chosen, started_at: t, paid_months: 0, effect_id: 'tur:' + courseId + ':t' + t};
    S.cooldowns['party.tur_course'] = t + 4;
    writeMirrors(Q);
    return result(Q, courseName(courseId) + L(': the course runs for two months.', ': kurs trwa dwa miesiące.'));
  }

  // Its effect only after two financed months; a course interrupted by a shortfall waits (13.2).
  function completeCourse(Q, t) {
    const S = Q.S, tur = S.party_orgs.tur, run = tur.active_course;
    tur.active_course = null;
    tur.completed_courses.push({course: run.course, target: run.target, completed_at: t, effect_id: run.effect_id});
    if (run.course === 'union_cadres' && S.unions[run.target]) {
      S.unions[run.target].trust = Math.min(100, S.unions[run.target].trust + 3);
      S.unions[run.target].dissent = Math.max(0, S.unions[run.target].dissent - 4);
    } else if (run.course === 'social_reform') {
      const project = S.projects[run.target];
      if (project && (project.status === 'idea' || project.status === 'prepared') && !project.tur_prepared) {
        project.tur_prepared = true;
        project.preparation = 100;
        project.duration_months = Math.max(1, (project.duration_months || 1) - 1);
      }
    } else if (run.course === 'civil_rights' || run.course === 'national_education') {
      const classes = String(run.target || 'workers').split(',').filter(Boolean).slice(0, run.course === 'civil_rights' ? 1 : 3);
      if (electorate.hasCells(S)) electorate.changeCells(S, cell => classes.indexOf(cell.class_id) >= 0, {radicalization: -3});
      tur.prepared_campaigns.push({id: run.effect_id, topic: 'democracy', classes: classes, expires_at: t + 1 + 6, used_by: []});
    }
    S.history.reasons.push({t: t, kind: 'tur_course', course: run.course, target: run.target});
  }

  // The prepared bonus of a completed course for one cell and topic, used once (13.2, 5.3).
  function takeCourseBonus(S, cell, topic, t) {
    const entry = S.party_orgs.tur.prepared_campaigns.find(e => e.topic === topic && t < e.expires_at &&
      e.classes.indexOf(cell.class_id) >= 0 && e.used_by.indexOf(cell.id) < 0);
    if (!entry) return 0;
    entry.used_by.push(cell.id);
    return 0.10;
  }

  // ---- Cooperatives (13.2; card 5.9) -------------------------------------------------------------------

  function preparedCooperatives(S) {
    return S.party_orgs.cooperatives.projects.filter(p => p.status === 'prepared');
  }

  function cooperativeStatus(Q, projectId) {
    const S = Q.S, project = S.party_orgs.cooperatives.projects.find(p => p.id === projectId);
    if (!project || project.status !== 'prepared') return no(L('No prepared cooperative.', 'Brak przygotowanej spółdzielni.'));
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    if (S.party_orgs.cash + 1e-9 < 2) return no(L('Needs 2 resources.', 'Wymaga 2 jednostek środków.'));
    return OK;
  }

  function launchCooperative(Q, projectId) {
    syncMirrors(Q);
    const status = cooperativeStatus(Q, projectId);
    if (!status.available) throw new Error('launchCooperative: ' + status.reason);
    const S = Q.S, project = S.party_orgs.cooperatives.projects.find(p => p.id === projectId);
    rules.commitMainAction(Q, 'party.cooperative', {project_id: projectId, resource_cost: {R: 2}});
    S.party_orgs.cash = Math.max(0, S.party_orgs.cash - 2);
    project.status = 'operating';
    project.launched_at = Q.time;
    project.paid_last = true;
    writeMirrors(Q);
    const coopName = L(COOPERATIVE_NAMES[project.class_id], COOPERATIVE_NAMES_PL[project.class_id]);
    return result(Q, coopName.charAt(0).toUpperCase() + coopName.slice(1) + L(' starts work: relief +1 for its recipients while it operates.',
      ' zaczyna działać: ulga +1 dla jej odbiorców, dopóki działa.'));
  }

  // A cooperative executor for the cooperative variants of the government cards (8.5, 8.9).
  function cooperativeExecutor(S) {
    return !!(S && S.party_orgs && operatingCooperatives(S).length);
  }

  // The relief of the operating cooperatives in one cell (13.2): +1 each while it operates (Z — 0.56), at most 6 in the cell.
  function cooperativeRelief(S, cell) {
    const relief = operatingCooperatives(S).filter(p => p.paid_last && p.class_id === cell.class_id).reduce((n, p) => n + p.relief, 0);
    return Math.min(RELIEF_CAP, relief);
  }

  // ---- The press (13.2): format and restrictions -------------------------------------------------------

  function pressFormatStatus(Q) {
    const S = Q.S;
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    const wait = waitReason(Q, 'party.press_format');
    if (wait) return no(wait);
    if (S.party_orgs.cash + 1e-9 < 1) return no(L('Needs 1 resource.', 'Wymaga 1 jednostki środków.'));
    return OK;
  }

  // party_journal ↔ popular: 1 T, 1 R, cd 6 M. The popular format adds +10 effective reach and −5 credibility,
  // never written into the base fields; its first adoption gives Centrum +3 dissent once (13.2).
  function pressFormatChoose(Q) {
    syncMirrors(Q);
    const status = pressFormatStatus(Q);
    if (!status.available) throw new Error('pressFormatChoose: ' + status.reason);
    const S = Q.S, press = S.party_orgs.press;
    const next = press.format === 'popular' ? 'party_journal' : 'popular';
    rules.commitMainAction(Q, 'party.press_format', {format: next, resource_cost: {R: 1}});
    S.party_orgs.cash = Math.max(0, S.party_orgs.cash - 1);
    press.format = next;
    S.cooldowns['party.press_format'] = Q.time + 6;
    if (next === 'popular' && !press.popular_adopted) {
      press.popular_adopted = true;
      factionReaction(Q, 'centrum', {dissent: 3}, {id: 'party.press_format:popular', kind: 'press_format',
        reverse: {kind: 'press_format', value: 'party_journal'}});
    }
    writeMirrors(Q);
    return result(Q, next === 'popular' ? L('The party press takes a popular format: effective reach +10, credibility −5.',
      'Prasa partyjna przyjmuje format popularny: efektywny zasięg +10, wiarygodność −5.')
      : L('The party press returns to the party journal format.', 'Prasa partyjna wraca do formatu pisma partyjnego.'));
  }

  // A restriction of the press is tied to one act of a competent authority in an event (13.2): recorded once
  // per ID, it expires or is lifted by that ID only.
  function addPressRestriction(Q, spec) {
    const press = Q.S.party_orgs.press;
    if (press.restrictions.some(r => r.id === spec.id)) return false;
    press.restrictions.push({id: spec.id, event_id: spec.event_id || null, reach_penalty: spec.reach_penalty === undefined ? 10 : spec.reach_penalty,
      expires_at: spec.expires_at === undefined ? Q.time + 2 : spec.expires_at, status: 'active'});
    return true;
  }

  function liftPressRestriction(Q, id) {
    const restriction = Q.S.party_orgs.press.restrictions.find(r => r.id === id && r.status === 'active');
    if (!restriction) return false;
    restriction.status = 'lifted';
    return true;
  }

  // ---- The declared line of PPS: eight stance cards (10.5–10.8, 10.10; cards 4.1–4.8) ---------------

  const STANCES = Object.freeze({
    direction: {field: 'direction', action: 'party.direction', cooldown: 6, name: 'Political direction',
      values: {parliamentary_socialism: 'Parliamentary socialism', class_independence: 'Independent class politics',
        workers_gains: 'Defend the workers’ gains', democratic_movement: 'A broad democratic movement'}},
    main_opponent: {field: 'main_opponent', action: 'party.main_opponent', cooldown: 6, name: 'Main opponent',
      values: {nationalist_right: 'The national right', communists: 'The communists', capital_land: 'The defenders of capital and landed estates',
        unconstitutional_force: 'Violence against the constitution, from any side'}},
    pils_influence: {field: 'pils_influence', action: 'party.pils_influence', cooldown: 6, name: 'Piłsudski’s influence',
      values: {support: 'Support his influence', conditional: 'Support it on conditions', oppose_military_interference: 'Oppose the army’s interference'}},
    form_of_power: {field: 'form_of_power', action: 'party.form_of_power', cooldown: 6, name: 'What power do we want',
      values: {parliamentarism: 'Parliamentarism', strong_presidency: 'A stronger presidency', workers_councils: 'Workers’ councils'}},
    electoral_base: {field: 'electoral_base', action: 'party.electoral_base', cooldown: 6, name: 'Character of the party',
      values: {workers: 'A workers’ party', workers_peasants: 'A party of workers and peasants', broad_democratic: 'A broad democratic party',
        allied_reach: 'Our own profile, and reach through allies'}},
    slavic_autonomy: {field: 'slavic_autonomy', action: 'party.slavic_autonomy', cooldown: 6, name: 'Slavic minorities: autonomy',
      values: {federation: 'Federation', regional_autonomy: 'Autonomy of the voivodeships', cultural_rights: 'Freedom of language, schools and organisations without autonomy',
        polonisation: 'Polonisation'}},
    jewish_cooperation: {field: 'jewish_cooperation', action: 'party.jewish_cooperation', cooldown: 6, name: 'Cooperation with Jewish organisations',
      values: {broad: 'Broad cooperation and rights in the programme', labour_only: 'Cooperation of workers’ organisations', none: 'No cooperation'}},
    ussr_position: {field: 'ussr_stance', action: 'party.ussr_position', cooldown: 12, name: 'PPS and the Soviet model',
      values: {sympathetic: 'Solidarity with the Soviet state as an attempt to build socialism',
        independent: 'Independence: workers’ cooperation without the Soviet model',
        critical: 'Condemn Soviet authoritarianism and the subordination of the labour movement'}},
  });
  const STANCES_PL = Object.freeze({
    direction: {name: 'Kierunek polityczny', values: {parliamentary_socialism: 'Socjalizm parlamentarny', class_independence: 'Niezależna polityka klasowa',
      workers_gains: 'Obrona zdobyczy robotniczych', democratic_movement: 'Szeroki ruch demokratyczny'}},
    main_opponent: {name: 'Główny przeciwnik', values: {nationalist_right: 'Prawica narodowa', communists: 'Komuniści',
      capital_land: 'Obrońcy kapitału i wielkiej własności ziemskiej', unconstitutional_force: 'Przemoc wymierzona w konstytucję, z każdej strony'}},
    pils_influence: {name: 'Wpływ Piłsudskiego', values: {support: 'Poparcie dla jego wpływu', conditional: 'Poparcie pod warunkami',
      oppose_military_interference: 'Sprzeciw wobec ingerencji wojska'}},
    form_of_power: {name: 'Jakiej władzy chcemy', values: {parliamentarism: 'Parlamentaryzm', strong_presidency: 'Silniejsza prezydentura',
      workers_councils: 'Rady robotnicze'}},
    electoral_base: {name: 'Charakter partii', values: {workers: 'Partia robotnicza', workers_peasants: 'Partia robotników i chłopów',
      broad_democratic: 'Szeroka partia demokratyczna', allied_reach: 'Własny profil i zasięg przez sojuszników'}},
    slavic_autonomy: {name: 'Mniejszości słowiańskie: autonomia', values: {federation: 'Federacja', regional_autonomy: 'Autonomia województw',
      cultural_rights: 'Swoboda języka, szkół i organizacji bez autonomii', polonisation: 'Polonizacja'}},
    jewish_cooperation: {name: 'Współpraca z organizacjami żydowskimi', values: {broad: 'Szeroka współpraca i prawa w programie',
      labour_only: 'Współpraca organizacji robotniczych', none: 'Bez współpracy'}},
    ussr_position: {name: 'PPS wobec modelu sowieckiego', values: {sympathetic: 'Solidarność z państwem sowieckim jako próbą budowy socjalizmu',
      independent: 'Niezależność: współpraca robotnicza bez modelu sowieckiego',
      critical: 'Potępienie sowieckiego autorytaryzmu i podporządkowania ruchu robotniczego'}},
  });
  const stanceName = cardId => L(STANCES[cardId].name, STANCES_PL[cardId].name);
  const stanceValue = (cardId, value) => L(STANCES[cardId].values[value], STANCES_PL[cardId].values[value]);
  const STANCE_ORDER = Object.freeze(Object.keys(STANCES));
  // Z — 0.32, the test profile faction_stance_profile_v1: the rejected lines of the factions (10.5).
  const FACTION_STANCE_PROFILE_ID = 'faction_stance_profile_v1';
  const REJECTED = Object.freeze([
    {faction: 'pilsudczycy', field: 'pils_influence', value: 'oppose_military_interference'},
    {faction: 'centrum', field: 'pils_influence', value: 'support'},
  ]);
  // Axes of the programme projection of PPS (10.8): the method of power, rights and autonomy, Jewish cooperation.
  const PROGRAMME_AXES = Object.freeze({
    form_of_power: {parliamentarism: 2, strong_presidency: 0, workers_councils: -2},
    slavic_autonomy: {federation: 2, regional_autonomy: 1, cultural_rights: 0, polonisation: -2},
    jewish_cooperation: {broad: 2, labour_only: 0, none: -2},
  });

  function strategyOf(S) {
    return S.actors.pps.strategy;
  }

  function stanceCooldownKey(cardId) {
    return STANCES[cardId].action;
  }

  function stanceAvailable(Q, cardId) {
    return partyReady(Q) && !!STANCES[cardId] && Q.S.chapter.status !== 'ended' && rules.cooldownRemaining(Q, stanceCooldownKey(cardId)) === 0;
  }

  // Z — 0.51 (the user, 4 X 2026; it replaces Z — 0.32): the present line can be chosen again. Confirming it costs this
  // month's action and the card's usual wait, like a change, and changes nothing else.
  // Z — 0.57 (item 6 of the play notes of 5 X 2026): a line with no effect is no longer offered; its name stays for a save
  // that declared it.
  const RETIRED_STANCES = Object.freeze({electoral_base: Object.freeze(['allied_reach'])});

  function stanceStatus(Q, cardId, value) {
    const card = STANCES[cardId];
    if (!card || !card.values[value]) return no(L('Unknown line.', 'Nieznana linia.'));
    if ((RETIRED_STANCES[cardId] || []).indexOf(value) >= 0) return no(L('This line is no longer offered.', 'Ta linia nie jest już dostępna.'));
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    const wait = waitReason(Q, stanceCooldownKey(cardId));
    if (wait) return no(wait);
    return OK;
  }

  // The projection of the declared line on the axes of offers (10.8), kept in S.actors.pps.program: the
  // programmes of the cabinet configurations stay those of stage 3 (P); the projection is the record of
  // the party's own programme for its offers and the report.
  function writeProgramme(S) {
    const strategy = strategyOf(S), program = {};
    for (const field of Object.keys(PROGRAMME_AXES)) program[field] = PROGRAMME_AXES[field][strategy[field]];
    S.actors.pps.program = program;
    return program;
  }

  // One declaration (10.5): 1 T, 0 R, cd 6 M (the Soviet model 12 M); the new line is recorded, the rejecting
  // faction of the test profile +3 dissent, and the reactions of 10.7, 10.8 and 10.10 once.
  function stanceChoose(Q, cardId, value) {
    syncMirrors(Q);
    const status = stanceStatus(Q, cardId, value);
    if (!status.available) throw new Error('stanceChoose: ' + status.reason);
    const S = Q.S, t = Q.time, card = STANCES[cardId], strategy = strategyOf(S);
    const previous = strategy[card.field];
    if (previous === value) {
      // The confirmed present line: the month and the wait of the card, no record of a change, no reaction (Z — 0.51).
      rules.commitMainAction(Q, card.action, {from: previous, to: value, kept: true});
      S.cooldowns[stanceCooldownKey(cardId)] = t + card.cooldown;
      writeMirrors(Q);
      return result(Q, stanceName(cardId) + ': ' + stanceValue(cardId, value) + L('. PPS confirms its present line; nothing else changes.',
        '. PPS potwierdza swoją obecną linię; nic więcej się nie zmienia.'));
    }
    rules.commitMainAction(Q, card.action, {from: previous, to: value});
    strategy[card.field] = value;
    S.actors.pps.strategy_history.push({t: t, field: card.field, from: previous, to: value});
    S.cooldowns[stanceCooldownKey(cardId)] = t + card.cooldown;
    const reverse = {kind: 'strategy', field: card.field, value: previous, objection: value};
    const lines = [];
    for (const rule of REJECTED) {
      if (rule.field === card.field && rule.value === value) {
        factionReaction(Q, rule.faction, {dissent: 3}, {id: card.action + ':' + value + ':t' + t, kind: 'stance', reverse: reverse});
        lines.push(FACTION_NAMES[rule.faction] + L(' dissent +3', ': sprzeciw +3'));
      }
    }
    if (cardId === 'pils_influence') {
      if (value === 'support') {
        const recent = S.actors.pps.strategy_history.some(h => h.field === 'pils_influence' && h.to === 'support' && h.t !== t && t - h.t < 12);
        if (!recent) {
          government.changeRelation(Q, 'pilsudski', 4, 'party.pils_influence:support');
          lines.push(L('relation with Piłsudski +4', 'relacja z Piłsudskim +4'));
        }
      } else if (value === 'oppose_military_interference') {
        government.changeRelation(Q, 'pilsudski', -4, 'party.pils_influence:oppose');
        lines.push(L('relation with Piłsudski −4', 'relacja z Piłsudskim −4'));
      }
    }
    if (cardId === 'form_of_power' && value === 'workers_councils' && !S.actors.pps.councils_adopted) {
      S.actors.pps.councils_adopted = true;
      factionReaction(Q, 'lewica', {strength: 4}, {id: 'party.form_of_power:workers_councils:strength', kind: 'stance_strength', reverse: null});
      factionReaction(Q, 'centrum', {dissent: 3}, {id: 'party.form_of_power:workers_councils', kind: 'stance', reverse: reverse});
      lines.push(L('Lewica +4 strength, Centrum dissent +3', 'Lewica: siła +4; Centrum: sprzeciw +3'));
    }
    if (cardId === 'ussr_position') {
      if (value === 'sympathetic') {
        if (!S.actors.pps.ussr_bonus_used) {
          S.actors.pps.ussr_bonus_used = true;
          government.changeRelation(Q, 'kpp', 5, 'party.ussr_position:sympathetic');
          lines.push(L('relation with the KPP +5', 'relacja z KPP +5'));
        }
        factionReaction(Q, 'centrum', {dissent: 5}, {id: 'party.ussr_position:sympathetic:t' + t, kind: 'stance', reverse: reverse});
        lines.push(L('Centrum dissent +5', 'Centrum: sprzeciw +5'));
      } else if (value === 'critical') {
        government.changeRelation(Q, 'kpp', -5, 'party.ussr_position:critical:t' + t);
        lines.push(L('relation with the KPP −5', 'relacja z KPP −5'));
      }
    }
    writeProgramme(S);
    writeMirrors(Q);
    return result(Q, stanceName(cardId) + ': ' + stanceValue(cardId, value) + '.' + (lines.length ? ' ' + lines.join('; ') + '.' :
      L(' No immediate reaction.', ' Bez natychmiastowej reakcji.')));
  }

  function stanceView(Q, cardId) {
    syncMirrors(Q);
    const card = STANCES[cardId];
    const current = strategyOf(Q.S)[card.field];
    for (const value of Object.keys(card.values)) {
      Q['pl_stance_' + value + '_why'] = stanceStatus(Q, cardId, value).reason;
      Q['pl_stance_' + value + '_present'] = value === current ? 1 : 0;
    }
    Q.pl_stance_current = card.values[current] ? stanceValue(cardId, current) : L('not declared', 'nie zadeklarowano');
  }

  // ---- Economic programme: up to three priorities (10.5; card 6.2) --------------------------------------

  // Z — 0.56 (texts approved by the user on 5 X 2026): a clearer name for agrarian_labour and a sixth priority; at most
  // three of the six.
  const PRIORITIES = Object.freeze({
    stabilisation_with_protection: 'Stabilisation with protections', public_works: 'Public works and employment',
    wealth_and_investment: 'Wealth taxes and capital for investment', socialisation: 'Socialisation of selected enterprises',
    agrarian_labour: 'Land reform and rural modernisation', cooperatives_housing: 'Cooperatives and housing',
  });
  const PRIORITIES_PL = Object.freeze({stabilisation_with_protection: 'Stabilizacja z osłonami', public_works: 'Roboty publiczne i zatrudnienie',
    wealth_and_investment: 'Podatki majątkowe i kapitał na inwestycje', socialisation: 'Uspołecznienie wybranych przedsiębiorstw',
    agrarian_labour: 'Reforma rolna i modernizacja wsi', cooperatives_housing: 'Spółdzielczość i mieszkania'});
  const priorityName = id => L(PRIORITIES[id], PRIORITIES_PL[id]);

  const sameSet = (a, b) => a.length === b.length && a.every(x => b.indexOf(x) >= 0);

  function programmeAvailable(Q) {
    return partyReady(Q) && Q.S.chapter.status !== 'ended' && rules.cooldownRemaining(Q, 'party.economic_program') === 0;
  }

  function programmeStatus(Q, set) {
    const S = Q.S;
    if (!Array.isArray(set) || set.some(id => !PRIORITIES[id]) || new Set(set).size !== set.length) return no(L('Unknown priorities.', 'Nieznane priorytety.'));
    if (set.length > 3) return no(L('At most three priorities.', 'Najwyżej trzy priorytety.'));
    // Z — 0.56: without a present programme an empty set is nothing to confirm (it replaces the empty case of Z — 0.51).
    if (!set.length && !strategyOf(S).economic_priorities.length) return no(L('Choose at least one priority.', 'Wybierz co najmniej jeden priorytet.'));
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    const wait = waitReason(Q, 'party.economic_program');
    if (wait) return no(wait);
    return OK;
  }

  // The whole set in one transaction: 1 T, 0 R, cd 6 M. The priorities give no reform and no reward by
  // themselves; a repeated priority gives no progress (10.5, Z — 0.35).
  function programmeChoose(Q, set) {
    syncMirrors(Q);
    const status = programmeStatus(Q, set);
    if (!status.available) throw new Error('programmeChoose: ' + status.reason);
    const S = Q.S, t = Q.time, strategy = strategyOf(S);
    const previous = strategy.economic_priorities.slice();
    if (sameSet(set, previous)) {
      // The confirmed present programme (Z — 0.51): the month and the wait of the card, nothing else.
      rules.commitMainAction(Q, 'party.economic_program', {from: previous, to: set.slice(), kept: true});
      S.cooldowns['party.economic_program'] = t + 6;
      writeMirrors(Q);
      return result(Q, L('PPS confirms its present economic programme: ', 'PPS potwierdza swój obecny program gospodarczy: ') +
        (previous.length ? previous.map(priorityName).join('; ') : L('no priorities', 'bez priorytetów')) +
        L('. Nothing else changes.', '. Nic więcej się nie zmienia.'));
    }
    rules.commitMainAction(Q, 'party.economic_program', {from: previous, to: set.slice()});
    strategy.economic_priorities = set.slice().sort();
    S.actors.pps.strategy_history.push({t: t, field: 'economic_priorities', from: previous, to: strategy.economic_priorities.slice()});
    S.cooldowns['party.economic_program'] = t + 6;
    writeMirrors(Q);
    // Z — 0.57: the result names what the programme now does (10.5).
    const served = andList(programmeGroupNames(S));
    return result(Q, set.length ? L('The economic programme of PPS: ', 'Program gospodarczy PPS: ') + strategy.economic_priorities.map(priorityName).join('; ') +
      L('. Campaigns of PPS are now 10% stronger among ' + served + '. The priorities prepare nothing by themselves; each programme still needs its card, law, money and executor.',
        '. Kampanie PPS są teraz o 10% skuteczniejsze wśród ' + served + '. Priorytety same niczego nie przygotowują; każdy program nadal potrzebuje swojej karty, ustawy, pieniędzy i wykonawcy.')
      : L('PPS withdraws its economic priorities.', 'PPS wycofuje swoje priorytety gospodarcze.'));
  }

  // Z — 0.57 (item 10 of the play notes): the card opens on the present programme, which can be confirmed at once; the
  // menu of priorities accepts only a changed set.
  function programmeChangeStatus(Q, set) {
    if (Array.isArray(set) && set.length && sameSet(set, strategyOf(Q.S).economic_priorities)) {
      return no(L('Nothing has changed. To confirm the present programme, go back to the beginning.',
        'Nic się nie zmieniło. Aby zatwierdzić obecny program, wróć na początek.'));
    }
    return programmeStatus(Q, set);
  }

  // The last three reactions of voters to the programme (Z — 0.57, PolishProjects.programmeReaction), newest first.
  function programmeLogText(S) {
    const log = (S.actors.pps.programme_log || []).slice(-3).reverse();
    return log.map(e => {
      const groups = andList(((projects.PROGRAMME_LINKS[e.priority] || {serves: []}).serves).map(label =>
        L(electorate.AUDIENCES[label] ? electorate.AUDIENCES[label].name : label, electorate.AUDIENCE_NAMES_PL_GENITIVE[label] || label)));
      return rules.monthYear(e.t) + ' — ' + projects.programmeMeasureName(e) + ': ' + (e.sign > 0
        ? L('matches “' + PRIORITIES[e.priority] + '”, +1 among ' + groups, 'zgodne z priorytetem „' + PRIORITIES_PL[e.priority] + '”, +1 wśród ' + groups)
        : L('contrary to “' + PRIORITIES[e.priority] + '”, −1 among ' + groups, 'sprzeczne z priorytetem „' + PRIORITIES_PL[e.priority] + '”, −1 wśród ' + groups));
    }).join('; ');
  }

  function programmeView(Q) {
    syncMirrors(Q);
    const draft = String(Q.pl_prog_draft || '').split(',').filter(Boolean);
    const current = strategyOf(Q.S).economic_priorities;
    Q.pl_prog_has = current.length ? 1 : 0;
    Q.pl_prog_present_why = programmeStatus(Q, current.slice()).reason;
    Q.pl_prog_served = andList(programmeGroupNames(Q.S));
    Q.pl_prog_log = programmeLogText(Q.S);
    // Z — 0.56: a priority of the present programme carries the bold label "Present programme" in the menu.
    for (const id of Object.keys(PRIORITIES)) {
      Q['pl_prog_' + id + '_in'] = draft.indexOf(id) >= 0 ? 1 : 0;
      Q['pl_prog_' + id + '_now'] = current.indexOf(id) >= 0 ? 1 : 0;
    }
    Q.pl_prog_current = strategyOf(Q.S).economic_priorities.map(priorityName).join('; ') || L('none', 'brak');
    Q.pl_prog_draft_text = draft.map(priorityName).join('; ') || L('none', 'brak');
    Q.pl_prog_confirm_why = programmeChangeStatus(Q, draft).reason;
    Q.pl_prog_confirm_same = sameSet(draft, strategyOf(Q.S).economic_priorities) ? 1 : 0;
  }

  function programmeToggle(Q, id) {
    const draft = String(Q.pl_prog_draft || '').split(',').filter(Boolean);
    const at = draft.indexOf(id);
    if (at >= 0) draft.splice(at, 1); else draft.push(id);
    Q.pl_prog_draft = draft.join(',');
    programmeView(Q);
  }

  // ---- Cooperation with the KPP (9.5–9.6; card 6.7) and the Bund (5.5) -----------------------------------

  const channelOpen = S => !!(S.actors.kpp_channel && S.actors.kpp_channel.contact_open);

  // Partner discipline in a joint action (Z — 0.25, M13): from the relation and the fit of the demands to
  // the partner's goal, never from the mood inside PPS.
  const LEVELS = Object.freeze(['limited', 'broad', 'structural']);
  function goalFit(demandLevel, partnerGoal) {
    const d = LEVELS.indexOf(demandLevel), g = LEVELS.indexOf(partnerGoal);
    if (d < 0 || g < 0) throw new Error('goalFit: unknown level');
    return d >= g ? 100 : d === g - 1 ? 50 : 0;
  }

  function partnerCompliance(relation, fit) {
    return clip((relation + fit) / 200, 0.10, 0.90);
  }

  // The acceptance inside PPS of cooperation with the KPP (9.5): the strength-weighted mean of the factions.
  function internalAcceptance(S) {
    const cc = S.actors.communist_cooperation, f = factionsOf(S);
    return FACTIONS.reduce((n, id) => n + f[id].strength * cc.pps_internal_acceptance[id], 0) / 100;
  }

  // The Centre's objection in a joint strike (9.6, M13): +5 full, +2 limited while acceptance is below 60.
  function centrumObjection(S, mode) {
    if (internalAcceptance(S) >= 60) return 0;
    return mode === 'full' ? 5 : mode === 'limited' ? 2 : 0;
  }

  // A trial record per real action (9.6, 10.4.5): one record per action ID, so the protection and the end
  // of the same demonstration never make two successes; a talk is not a trial.
  function recordTrial(S, record) {
    const cc = S.actors.communist_cooperation;
    if (cc.trial_records.some(r => r.action_id === record.action_id)) return false;
    cc.trial_records.push(Object.assign({id: 'trial-' + (cc.trial_records.length + 1), kind: 'strike', mode: 'none', terms: {},
      partner_response: null, ended_as_agreed: false, result: 'none'}, record));
    return true;
  }

  // The outcome of one joint action (9.5), recorded once per trial ID. The executed actions come with the
  // strikes and demonstrations of stage 6; stage 5 records their consequences: a failure lowers the relation
  // by 5 and counts one more failed action; a breach of the agreed rules costs 15 of acceptance in each faction.
  const TRIAL_OUTCOMES = Object.freeze(['success', 'failure', 'breach']);

  function resolveTrial(Q, actionId, outcome) {
    const S = Q.S, cc = S.actors.communist_cooperation;
    if (TRIAL_OUTCOMES.indexOf(outcome) < 0) throw new Error('resolveTrial: unknown outcome ' + outcome);
    const record = cc.trial_records.find(r => r.action_id === actionId);
    if (!record) throw new Error('resolveTrial: no trial ' + actionId);
    if (record.result !== 'pending') return record;
    record.result = outcome;
    record.ended_as_agreed = outcome === 'success';
    record.resolved_at = Q.time;
    if (outcome === 'failure') {
      cc.failed_joint_actions = (cc.failed_joint_actions || 0) + 1;
      government.changeRelation(Q, 'kpp', -5, 'trial_failed:' + actionId);
    }
    if (outcome === 'breach') kppRuleBroken(Q);
    S.history.reasons.push({t: Q.time, kind: 'kpp_trial', action_id: actionId, outcome: outcome});
    return record;
  }

  function successfulTrials(S) {
    return S.actors.communist_cooperation.trial_records.filter(r => r.result === 'success');
  }

  // The existing demands of a joint action (a strike, a demonstration or a protective action) come with the
  // unions and strikes of stage 6; `demands` lists them when they exist.
  const openDemands = S => (S.actors.communist_cooperation.demands || []).filter(d => d.status === 'open');

  function kppStepStatus(Q, step) {
    const S = Q.S, cc = S.actors.communist_cooperation, relation = S.actors.relations.kpp;
    if (!channelOpen(S)) return no(L('No open channel to the KPP.', 'Brak otwartego kanału do KPP.'));
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    if (step === 'trial') {
      if (relation < 30) return no(L('Needs a relation of 30 with the KPP; it is ' + fmt(relation) + '.', 'Wymaga relacji 30 z KPP; obecnie ' + fmt(relation) + '.'));
      if (!openDemands(S).length) return no(L('Needs an existing joint demand; in this chapter a trial is agreed in a strike, in its step of cooperation with the communists.', 'Wymaga istniejącego wspólnego postulatu; w tym rozdziale próbę uzgadnia się w strajku, w kroku współpracy z komunistami.'));
      return OK;
    }
    if (step === 'rules') {
      const done = successfulTrials(S);
      if (done.length < 2 || !done.some(r => r.mode === 'full') || new Set(done.map(r => r.action_id)).size < 2) {
        return no(L('Needs two different successful joint actions, one of them full cooperation.', 'Wymaga dwóch różnych udanych wspólnych akcji, w tym jednej pełnej współpracy.'));
      }
      if (relation < 50) return no(L('Needs a relation of 50 with the KPP.', 'Wymaga relacji 50 z KPP.'));
      return OK;
    }
    if (step === 'agreement') {
      if (!cc.rules_agreed) return no(L('Needs rules accepted by both sides.', 'Wymaga zasad przyjętych przez obie strony.'));
      if (internalAcceptance(S) < 60) return no(L('Needs the acceptance of 60 inside PPS.', 'Wymaga akceptacji 60 wewnątrz PPS.'));
      if (S.party_orgs.cash + 1e-9 < 1) return no(L('Needs 1 resource.', 'Wymaga 1 jednostki środków.'));
      return OK;
    }
    return no(L('Unknown step.', 'Nieznany krok.'));
  }

  function kppAgendaAvailable(Q) {
    return partyReady(Q) && channelOpen(Q.S);
  }

  // The next steps of 9.5 in the party agenda, each 1 T (the broader agreement also 1 R).
  function kppStep(Q, step) {
    syncMirrors(Q);
    const status = kppStepStatus(Q, step);
    if (!status.available) throw new Error('kppStep: ' + status.reason);
    const S = Q.S, cc = S.actors.communist_cooperation, t = Q.time;
    rules.commitMainAction(Q, 'kpp.' + step, step === 'agreement' ? {resource_cost: {R: 1}} : {});
    if (step === 'trial') {
      const demand = openDemands(S)[0];
      demand.status = 'agreed';
      recordTrial(S, {action_id: demand.id, kind: demand.kind || 'strike', mode: 'agreed', terms: {level: demand.level || 'broad'}, result: 'pending'});
      return result(Q, L('PPS and the KPP agree on a trial of joint action for ' + (demand.name || 'the joint demand') + '.',
        'PPS i KPP uzgadniają próbę wspólnej akcji (' + (demand.name || 'wspólny postulat') + ').'));
    }
    if (step === 'rules') {
      cc.rules = {legal_vote: true, no_forced_merger: true, agreed_strike_end: true};
      cc.rules_agreed = true;
      return result(Q, L('The rules of a broader cooperation are agreed: legality, no violence and the independence of PPS.',
        'Uzgodniono zasady szerszej współpracy: legalność, wyrzeczenie się przemocy i niezależność PPS.'));
    }
    S.party_orgs.cash = Math.max(0, S.party_orgs.cash - 1);
    cc.active_agreement = {agreed_at: t, goal: 'joint_workers_action'};
    writeMirrors(Q);
    return result(Q, L('PPS and the KPP conclude a broader agreement for joint workers’ action.', 'PPS i KPP zawierają szersze porozumienie o wspólnej akcji robotniczej.'));
  }

  // The Bund is an organisation, not a party (5.5): its trust changes only by an executed joint action,
  // once per action (P: +5 when it ended as agreed, −5 when a side broke the rules).
  function bundJointAction(Q, action) {
    const bund = Q.S.actors.bund;
    if (bund.joint_actions.some(a => a.id === action.id)) return bund.trust;
    bund.joint_actions.push({id: action.id, t: Q.time, result: action.result});
    bund.trust = clip(bund.trust + (action.result === 'success' ? 5 : action.result === 'breach' ? -5 : 0), 0, 100);
    return bund.trust;
  }

  function kppView(Q) {
    for (const step of ['trial', 'rules', 'agreement']) Q['pl_kpp_' + step + '_why'] = kppStepStatus(Q, step).reason;
    Q.pl_kpp_relation = fmt(Q.S.actors.relations.kpp);
    Q.pl_kpp_acceptance = fmt(internalAcceptance(Q.S));
  }

  // ---- Campaigns and the Media card (5.3, 10.6, 13.2; card 5.3) ---------------------------------------

  const TOPICS = Object.freeze({
    parliamentary: 'parliamentary socialism', class: 'independent class politics', workers_gains: 'the defence of workers’ gains',
    democracy: 'the defence of democracy',
  });
  const TOPICS_PL = Object.freeze({parliamentary: 'socjalizm parlamentarny', class: 'niezależna polityka klasowa',
    workers_gains: 'obrona zdobyczy robotniczych', democracy: 'obrona demokracji'});
  const topicName = id => L(TOPICS[id], TOPICS_PL[id]);
  const CAMPAIGN_KINDS = Object.freeze(['press', 'unions', 'polemic', 'turnout']);

  // The addressees of a polemic from the present line (10.6, Z — 0.33): ZLN for the national right, the KPP
  // for the communists, parties with land and fiscal ideals ≤ −1 for capital and land, and a party to which a
  // confirmed investigation assigned an open case of violence (S.politics of stage 7).
  function polemicAddressees(Q) {
    const line = Q.S.actors.pps.strategy.main_opponent;
    if (line === 'nationalist_right') return ['zln'];
    if (line === 'communists') return ['kpp'];
    if (line === 'capital_land') {
      const profiles = government.ACTOR_PROFILES;
      return Object.keys(profiles).filter(id => id !== 'pps' && (profiles[id].ideals.fiscal || 0) <= -1 && (profiles[id].ideals.land || 0) <= -1).sort();
    }
    if (line === 'unconstitutional_force' && Q.S.politics) {
      const cases = Q.S.politics.cases;
      return Object.keys(cases).map(id => cases[id]).filter(c => c.status === 'open' && c.assigned_party && c.assigned_party !== 'pps' &&
        government.ACTOR_PROFILES[c.assigned_party])
        .map(c => c.assigned_party).filter((id, i, list) => list.indexOf(id) === i).sort();
    }
    return [];
  }

  // A democratic threat (10.6): coup pressure of 40 or an open case of an unlawful breach of institutions.
  function democraticThreat(S) {
    const cases = S.politics && S.politics.cases ? S.politics.cases : {};
    return !!(S.coup && S.coup.pressure >= 40) || Object.keys(cases).some(id => cases[id].institutional && cases[id].status === 'open');
  }

  function lawInProcedureByPps(S) {
    const bill = S.chapter.unemployment_bill;
    if (bill && (bill.status === 'pending' || bill.status === 'in_procedure')) return true;
    return S.parliament.laws.some(law => law.sponsor === 'pps' && law.status === 'in_procedure');
  }

  function gainUnderThreat(S) {
    const pending = S.economy && S.economy.pending_package;
    const cut = pending && (pending.instruments || []).indexOf('benefit_cut') >= 0;
    return cut || !!(S.economy && S.economy.austerity_review && S.economy.austerity_review.status === 'open');
  }

  // One strategyFactor of 10.6 (P): the dominant topic of the direction 1.10 with an existing addressee or
  // demand; the defence of a threatened gain 1.15; the democratic movement 1.15 only under a threat.
  function strategyFactor(Q, topic) {
    const S = Q.S, direction = S.actors.pps.strategy.direction;
    if (direction === 'parliamentary_socialism' && topic === 'parliamentary') return lawInProcedureByPps(S) ? 1.10 : 1;
    if (direction === 'class_independence' && topic === 'class') return 1.10;
    if (direction === 'workers_gains' && topic === 'workers_gains') {
      const gain = projects.operatingProtection(S) || Object.keys(S.projects).some(id => S.projects[id].type === 'labor_inspection' &&
        S.projects[id].status === 'operating');
      if (!gain) return 1;
      return gainUnderThreat(S) ? 1.15 : 1.10;
    }
    if (direction === 'democratic_movement' && topic === 'democracy') return democraticThreat(S) ? 1.15 : 1;
    return 1;
  }

  // The union reach that matches a cell (5.3, P): the workers' cells read the three branches alike; cells
  // without a matching union use their own base reach.
  function matchingUnionReach(S, cell) {
    if (cell.class_id === 'workers') return averageUnionReach(S);
    return cell.base_reach_pps;
  }

  function cellReach(S, cell, kind) {
    const union = matchingUnionReach(S, cell);
    if (kind === 'unions') return clip(union, 0, 100);
    return clip(0.50 * union + 0.30 * pressEffective(S).reach + 0.20 * cell.base_reach_pps, 0, 100);
  }

  function activeEffect(S, kind, t) {
    const effects = S.advisors.effects.filter(e => e.kind === kind && e.status !== 'expired' && t >= e.starts_at && t < e.expires_at);
    return effects.length ? Math.max(...effects.map(e => e.value)) : 1;
  }

  function audienceFilter(audience) {
    const entry = electorate.AUDIENCES[audience];
    if (!entry) throw new Error('unknown audience ' + audience);
    return entry.filter;
  }

  function campaignStatus(Q, kind, topic, audience) {
    const S = Q.S;
    if (CAMPAIGN_KINDS.indexOf(kind) < 0) return no(L('Unknown campaign.', 'Nieznana kampania.'));
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    if (S.party_orgs.cash + 1e-9 < 1) return no(L('Needs 1 resource.', 'Wymaga 1 jednostki środków.'));
    if (!electorate.hasCells(S)) return no(L('The cells of the electorate are not recorded.', 'Grupy wyborców nie są zapisane.'));
    if ((kind === 'press' || kind === 'unions') && topic !== undefined && !TOPICS[topic]) return no(L('Choose a topic.', 'Wybierz temat.'));
    if (kind === 'polemic') {
      const addressees = polemicAddressees(Q);
      if (!addressees.length) return no(L('No addressee: the present main opponent has no party to answer for it.', 'Brak adresata: obecny główny przeciwnik nie ma partii, która by za niego odpowiadała.'));
      if (audience !== undefined) {
        const pool = S.society.cells.filter(audienceFilter(audience)).reduce((n, cell) => n + addressees.reduce((m, p) => m + cell.propensity[p], 0), 0);
        if (!(pool > 0)) return no(L('The addressee has no voters among them.', 'Adresat nie ma wśród nich wyborców.'));
      }
    }
    if (audience !== undefined && !S.society.cells.some(audienceFilter(audience))) return no(L('No such voters are modelled.', 'Gra nie modeluje takich wyborców.'));
    return OK;
  }

  // One campaign (5.3): 1 T and 1 R; PPS gains in each cell of the audience with its reach, trust, the
  // party's cohesion, its share and the saturation of the topic; the others lose in proportion (a polemic
  // only its addressees). The mobilisation campaign adds 0.04 turnout up to 0.90 until the next election.
  function campaign(Q, kind, topic, audience) {
    syncMirrors(Q);
    const status = campaignStatus(Q, kind, topic, audience);
    if (!status.available) throw new Error('campaign: ' + status.reason);
    const S = Q.S, t = Q.time;
    const actionId = kind === 'turnout' ? 'party.turnout' : 'party.campaign';
    rules.commitMainAction(Q, actionId, {kind: kind, topic: topic || null, audience: audience, resource_cost: {R: 1}});
    S.party_orgs.cash = Math.max(0, S.party_orgs.cash - 1);
    const filter = audienceFilter(audience);
    let text;
    if (kind === 'turnout') {
      electorate.addTurnout(S, filter, 0.04);
      text = L('The mobilisation campaign raises the turnout of ' + electorate.AUDIENCES[audience].name + ' by 0.04 until the next election.',
        'Kampania mobilizacyjna podnosi frekwencję ' + electorate.AUDIENCE_NAMES_PL_GENITIVE[audience] + ' o 0,04 do następnych wyborów.');
    } else {
      text = campaignEffect(Q, kind, topic, audience).text;
    }
    electorate.writeClassMirrors(Q);
    writeMirrors(Q);
    return result(Q, text);
  }

  // Z — 0.57 (item 5 of the play notes of 5 X 2026): campaigns are 10% stronger among the groups the programme serves.
  const PROGRAMME_CAMPAIGN_FACTOR = 1.10;

  const andList = names => names.length < 2 ? (names[0] || '') : names.slice(0, -1).join(', ') + L(' and ', ' i ') + names[names.length - 1];

  // The groups served by the programme among the given cells (all cells when none are given), for "among …".
  function programmeGroupNames(S, cells) {
    const names = [];
    for (const label of projects.programmeServes(S)) {
      const f = electorate.filterOfList([label]);
      if (!f || (cells && !cells.some(f))) continue;
      names.push(L(electorate.AUDIENCES[label] ? electorate.AUDIENCES[label].name : label, electorate.AUDIENCE_NAMES_PL_GENITIVE[label] || label));
    }
    return names;
  }

  function programmeCampaignNote(S, cells) {
    const names = programmeGroupNames(S, cells);
    return names.length ? L(' The economic programme of PPS makes it 10% stronger among ' + andList(names) + '.',
      ' Program gospodarczy PPS wzmacnia ją o 10% wśród ' + andList(names) + '.') : '';
  }

  // The effect of one campaign in its cells (5.3), without its action and cost: the card above pays 1 T and 1 R; an
  // event of stage 7 (B4, B5) pays its own cost in the same decision. A null audience is every cell the
  // organisation reaches — the reach of each cell decides how much it moves.
  function campaignEffect(Q, kind, topic, audience) {
    const S = Q.S, t = Q.time, parties = S.society.parties;
    const filter = audience ? audienceFilter(audience) : () => true;
    const cells = S.society.cells.filter(filter);
    // Z — 0.57: the groups the economic programme of PPS serves answer a campaign 10% more strongly.
    const served = projects.programmeFilter(S);
    const key = kind === 'polemic' ? 'polemic:' + S.actors.pps.strategy.main_opponent : topic;
    const sources = kind === 'polemic' ? polemicAddressees(Q) : null;
    const pressFactor = kind === 'unions' ? 1 : 0.5 + 0.5 * pressEffective(S).credibility / 100;
    const factor = kind === 'polemic' ? 1 : strategyFactor(Q, topic);
    const press = kind === 'unions' ? 1 : activeEffect(S, 'press_campaign_multiplier', t);
    const before = electorate.aggregate(S, filter, 'pps');
    let moved = 0;
    for (const cell of cells) {
      const workers = cell.class_id === 'workers' ? activeEffect(S, 'workers_campaign_multiplier', t) : 1;
      const tur = kind === 'polemic' ? 1 : 1 + takeCourseBonus(S, cell, topic, t);
      const programme = served && served(cell) ? PROGRAMME_CAMPAIGN_FACTOR : 1;
      const gain = electorate.campaignGain(cell, cellReach(S, cell, kind), Q.dissent || 0, key, t) * pressFactor * factor * tur * press * workers * programme;
      moved += cell.mass * electorate.gainForPps(cell, gain, parties, sources);
      electorate.recordCampaign(cell, key, t);
    }
    S.party_orgs.press.campaigns.push({t: t, kind: kind, topic: key, audience: audience || 'reached'});
    if (kind === 'polemic') for (const id of sources) government.changeRelation(Q, id, -2, 'polemic:' + id + ':t' + t);
    const after = electorate.aggregate(S, filter, 'pps');
    const name = audience ? electorate.AUDIENCES[audience].name : 'the voters it reaches';
    const text = L('The ' + (kind === 'polemic' ? 'polemic' : kind === 'unions' ? 'campaign through the unions and meetings' : 'press campaign') +
      (topic && kind !== 'polemic' ? ' on ' + TOPICS[topic] : '') + ' reaches ' + name + ': PPS ' +
      fmt(before) + '% → ' + fmt(after) + '% among them.' + (kind === 'polemic' ? ' The addressee’s relation with PPS −2.' : ''),
      (kind === 'polemic' ? 'Polemika' : kind === 'unions' ? 'Kampania przez związki i zebrania' : 'Kampania prasowa') +
      (topic && kind !== 'polemic' ? ' (temat: ' + topicName(topic) + ')' : '') + ' dociera do ' +
      (audience ? electorate.AUDIENCE_NAMES_PL_GENITIVE[audience] : 'wyborców w swoim zasięgu') + ': PPS ' +
      fmt(before) + '% → ' + fmt(after) + '% w tej grupie.' + (kind === 'polemic' ? ' Relacja adresata z PPS −2.' : '')) +
      programmeCampaignNote(S, cells);
    S.history.reasons.push({t: t, kind: 'campaign', campaign: kind, topic: key, audience: audience || 'reached', moved: moved});
    electorate.writeClassMirrors(Q);
    return {moved: moved, before: before, after: after, text: text};
  }

  // A press investigation needs a real case and evidence (13.2). P (stage 7): the evidence is the record of the case
  // in the journal of 15.2 — an open case of violence or an active unlawful restriction, not yet revealed; never a
  // case of the PPS organisations themselves, never the political dispute about the army, never an invented scandal.
  function pressInvestigationTarget(S) {
    const P = S.politics;
    if (!P) return null;
    const cases = Object.keys(P.cases).sort().map(id => P.cases[id])
      .filter(c => c.status === 'open' && !c.press_revealed_at && c.suspected !== 'pps' && c.kind !== 'military' && c.kind !== 'pps_violence');
    if (cases.length) return {kind: 'case', id: cases[0].id, subject: cases[0].subject};
    const restrictions = Object.keys(P.restrictions).sort().map(id => P.restrictions[id])
      .filter(r => r.status === 'active' && !r.lawful && !r.press_revealed_at && r.kind !== 'press_confiscation');
    return restrictions.length ? {kind: 'restriction', id: restrictions[0].id, subject: 'the ' + restrictions[0].kind.replace(/_/g, ' ') + ' against ' +
      restrictions[0].target} : null;
  }

  function pressInvestigationStatus(Q) {
    const S = Q.S;
    if (!pressInvestigationTarget(S)) return no(L('Needs an open case with evidence: a recorded case of violence or an unlawful restriction not yet revealed.', 'Wymaga otwartej sprawy z dowodami: zapisanego przypadku przemocy albo bezprawnego ograniczenia, którego jeszcze nie ujawniono.'));
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    if (S.party_orgs.cash + 1e-9 < 1) return no(L('Needs 1 resource.', 'Wymaga 1 jednostki środków.'));
    return OK;
  }

  // 1 T, 1 R: press credibility +4; the revealed fact is recorded once with its case (13.2).
  function pressInvestigation(Q) {
    syncMirrors(Q);
    const status = pressInvestigationStatus(Q);
    if (!status.available) throw new Error('pressInvestigation: ' + status.reason);
    const S = Q.S, target = pressInvestigationTarget(S), t = Q.time;
    rules.commitMainAction(Q, 'party.press_investigation', {target: target.id, resource_cost: {R: 1}});
    S.party_orgs.cash = Math.max(0, S.party_orgs.cash - 1);
    S.party_orgs.press.credibility = clip(S.party_orgs.press.credibility + 4, 0, 100);
    const record = target.kind === 'case' ? S.politics.cases[target.id] : S.politics.restrictions[target.id];
    record.press_revealed_at = t;
    S.history.reasons.push({t: t, kind: 'press_investigation', target_kind: target.kind, target_id: target.id});
    writeMirrors(Q);
    return result(Q, L('The party press documents ' + target.subject + ': credibility +4. The fact is recorded once; nothing is invented.',
      'Prasa partyjna dokumentuje sprawę: ' + rules.storedText(target.subject) + '. Wiarygodność +4. Fakt zostaje zapisany raz; nic nie jest zmyślone.'));
  }

  function mediaView(Q) {
    syncMirrors(Q);
    partyDisplay(Q);
    Q.pl_media_format_why = pressFormatStatus(Q).reason;
    Q.pl_media_format_next = Q.S.party_orgs.press.format === 'popular' ? L('the party journal', 'pismo partyjne') : L('a popular format', 'format popularny');
    Q.pl_media_campaign_why = campaignStatus(Q, 'press').reason;
    Q.pl_media_unions_why = campaignStatus(Q, 'unions').reason;
    Q.pl_media_polemic_why = campaignStatus(Q, 'polemic').reason;
    Q.pl_media_turnout_why = campaignStatus(Q, 'turnout').reason;
    Q.pl_media_investigation_why = pressInvestigationStatus(Q).reason;
    const addressees = polemicAddressees(Q);
    Q.pl_media_addressees = addressees.length ? addressees.map(id => government.ACTOR_PROFILES[id].name).join(L(' and ', ' i ')) : L('no one', 'brak');
  }

  function audienceView(Q, kind, topic) {
    for (const id of Object.keys(electorate.AUDIENCES)) Q['pl_aud_' + id + '_why'] = campaignStatus(Q, kind, topic, id).reason;
    // Z — 0.57: the groups where the programme of PPS strengthens a campaign (empty without a programme or for mobilisation).
    Q.pl_aud_programme = kind === 'turnout' ? '' : andList(programmeGroupNames(Q.S));
  }

  // ---- Results of policy for the cells: 5.4 ---------------------------------------------------------

  // Once per project: the trust entries kept by stage 4 (`pending_effects`, system trust) are applied to
  // their recipients, and the first full execution of a project PPS answers for gives the reward of 5.4:
  // trust +4 × share (unless the project has its own trust entry) and a one-off +1 pp × share.
  function settleRewards(Q, t) {
    const S = Q.S;
    if (!electorate.hasCells(S)) return;
    const parties = S.society.parties;
    for (const id of Object.keys(S.projects).sort()) {
      const project = S.projects[id];
      if (!project || !Array.isArray(project.pending_effects)) continue;
      for (const effect of project.pending_effects) {
        if (effect.system !== 'trust' || effect.stage !== 5 || effect.applied_at !== undefined) continue;
        const labels = effect.note === 'excluded cells' || effect.note === 'intelligentsia covered' ? [effect.note] : effect.beneficiaries;
        const filter = electorate.filterOfList(labels);
        if (filter) electorate.changeCells(S, filter, {trust_pps: effect.value});
        effect.applied_at = t;
      }
      const share = (project.responsibility && project.responsibility.pps) || 0;
      if (!(share > 0) || project.first_effect_time === null || project.first_effect_time === undefined || project.first_effect_time > t) continue;
      if (project.last_coverage !== null && project.last_coverage !== undefined && project.last_coverage < 1) continue;
      if (project.effects_applied.indexOf('reward:5.4') >= 0) continue;
      project.effects_applied.push('reward:5.4');
      const filter = electorate.filterOfList(project.beneficiaries);
      if (!filter) continue;
      if (!project.pending_effects.some(e => e.system === 'trust')) electorate.changeCells(S, filter, {trust_pps: 4 * share});
      for (const cell of S.society.cells.filter(filter)) electorate.gainForPps(cell, share, parties);
      S.history.reasons.push({t: t, kind: 'policy_reward', project_id: project.id, share: share});
    }
    electorate.writeClassMirrors(Q);
  }

  // A broken own promise of PPS (5.4, 9.2): trust −8 and −2 pp among its recipients, once per obligation.
  function settleBrokenPromises(Q) {
    const S = Q.S;
    if (!electorate.hasCells(S)) return;
    const done = S.actors.pps.applied;
    for (const id of Object.keys(S.agreements).sort()) {
      const agreement = S.agreements[id];
      for (const o of agreement.obligations || []) {
        if (o.status !== 'breached' || !government.ppsResponsible(S, agreement, o)) continue;
        const key = 'cells:broken:' + o.id;
        if (done.indexOf(key) >= 0) continue;
        done.push(key);
        const filter = electorate.filterOfList(o.beneficiaries);
        if (!filter) continue;
        electorate.changeCells(S, filter, {trust_pps: -8});
        for (const cell of S.society.cells.filter(filter)) electorate.lossForPps(cell, 2, S.society.parties);
        S.history.reasons.push({t: Q.time, kind: 'broken_promise_cells', obligation_id: o.id});
      }
    }
    electorate.writeClassMirrors(Q);
  }

  // Called by post_event after the agreements of the month (4.2 step 6).
  function afterAgreements(Q) {
    if (!partyReady(Q)) return;
    settleBrokenPromises(Q);
  }

  // ---- The PPS club: frozen seats of the factions and splinter clubs (10.2, M16) -------------------------

  function ppsClub(S) {
    return S.parliament.clubs.find(club => club.id === 'pps') || null;
  }

  // After each election, and at the opening, the PPS club is divided among the factions by largest remainders
  // of their strength that day, ties by ID; later only a real transfer changes it (Z — 0.27, M16).
  function allocateFactionSeats(seats, factions) {
    const rows = FACTIONS.map(id => ({id: id, exact: seats * factions[id].strength / 100}));
    const out = {};
    let assigned = 0;
    for (const row of rows) { out[row.id] = Math.floor(row.exact); assigned += out[row.id]; }
    rows.sort((a, b) => (b.exact - Math.floor(b.exact)) - (a.exact - Math.floor(a.exact)) || (a.id < b.id ? -1 : 1));
    for (let i = 0; i < seats - assigned; i++) out[rows[i].id] += 1;
    return out;
  }

  function ensureFactionSeats(Q) {
    const S = Q.S, club = ppsClub(S);
    if (!club || club.faction_seats) return club;
    club.faction_seats = allocateFactionSeats(club.seats, factionsOf(S));
    club.faction_seats_at = Q.time;
    return club;
  }

  // MPs who leave with a group go to one technically named splinter club of that faction (no historical name);
  // it abstains in votes and joins no offer (P).
  function transferMPs(Q, factionId, count, reason, caseId) {
    const S = Q.S, club = ensureFactionSeats(Q);
    if (!club || !(count > 0)) return 0;
    const moving = Math.min(count, club.faction_seats[factionId], club.seats);
    if (!(moving > 0)) return 0;
    club.seats -= moving;
    club.faction_seats[factionId] -= moving;
    const id = 'pps_split_' + factionId;
    let splinter = S.parliament.clubs.find(c => c.id === id);
    if (!splinter) {
      splinter = {id: id, electoral_party_id: 'pps', seats: 0, members_profile: 'splinter_v1', discipline: 1, issue_positions: {},
        government_commitment: null, splinter_of: 'pps', faction: factionId};
      S.parliament.clubs.push(splinter);
    }
    splinter.seats += moving;
    S.parliament.transfers.push({t: Q.time, from: 'pps', to: id, seats: moving, reason: reason, case_id: caseId || null});
    return moving;
  }

  // ---- A group leaves: the one account of a split and a purge (10.2, 10.9; M16) --------------------------

  // P manifests: the voters of a leaving Lewica go to the KPP (10.2), of the other factions to "Inne".
  const DEPARTURE_RECIPIENT = Object.freeze({lewica: 'kpp', centrum: 'other', pilsudczycy: 'other'});

  function departurePreview(Q, factionId, share) {
    const S = Q.S, f = factionsOf(S)[factionId], club = ensureFactionSeats(Q);
    const removed = share * f.strength / 100;
    const national = electorate.votes(S).pps;
    return {share: share, removed_share: removed, members_after: S.party_orgs.apparatus.member_index * (1 - removed),
      pps_after: 100 * national * (1 - removed), pps_before: 100 * national, mps: club ? Math.round(share * club.faction_seats[factionId]) : 0,
      recipient: DEPARTURE_RECIPIENT[factionId]};
  }

  function applyDeparture(Q, factionId, share, dissentDrop, kind, caseId) {
    const S = Q.S, factions = factionsOf(S), f = factions[factionId];
    const club = ensureFactionSeats(Q);
    const removed = share * f.strength / 100;
    const mps = club ? Math.round(share * club.faction_seats[factionId]) : 0;
    f.strength = f.strength * (1 - share);
    f.dissent = Math.max(0, f.dissent - dissentDrop);
    normalizeFactions(factions);
    S.party_orgs.apparatus.member_index = S.party_orgs.apparatus.member_index * (1 - removed);
    const to = DEPARTURE_RECIPIENT[factionId];
    for (const cell of S.society.cells) electorate.transfer(cell, 'pps', to, cell.propensity.pps * removed);
    const moved = transferMPs(Q, factionId, mps, kind, caseId);
    const manifest = {id: kind + '-' + factionId + '-t' + Q.time, case_id: caseId || null, kind: kind, faction: factionId, share: share,
      removed_share: removed, recipient: to, mps: moved, advisor_ids: []};
    (S.faction_cases.manifests = S.faction_cases.manifests || []).push(manifest);
    S.history.reasons.push({t: Q.time, kind: 'faction_departure', departure: kind, faction: factionId, removed_share: removed, mps: moved});
    electorate.writeClassMirrors(Q);
    writeMirrors(Q);
    return manifest;
  }

  // ---- Faction cases and the E3 card (10.2, decision 3A; card 9.10) ------------------------------------

  const casesOf = S => (S.faction_cases.list = S.faction_cases.list || []);
  const activeCase = (S, factionId) => casesOf(S).find(c => c.faction === factionId && (c.status === 'open' || c.status === 'postponed')) || null;

  // A reversible cause still describes the present situation (decision 3A).
  function reverseLive(Q, reverse) {
    const S = Q.S;
    if (!reverse) return false;
    if (reverse.kind === 'strategy') return S.actors.pps.strategy[reverse.field] === reverse.objection;
    if (reverse.kind === 'press_format') return S.party_orgs.press.format === 'popular';
    if (reverse.kind === 'leave_cabinet') {
      const cabinet = S.cabinet;
      return !!cabinet && cabinet.id === reverse.cabinet_id && cabinet.status === 'active' &&
        (cabinet.partner_ids.indexOf('pps') >= 0 || cabinet.supporter_ids.indexOf('pps') >= 0);
    }
    if (reverse.kind === 'kpp_agreement') return !!S.actors.communist_cooperation.active_agreement;
    return false;
  }

  // The concrete demand: to take back the live cause with the largest share of the faction's dissent.
  function factionDemand(Q, factionId) {
    const f = factionsOf(Q.S)[factionId];
    const sums = {};
    for (const r of f.reactions) {
      if (r.closed || !r.reverse || !reverseLive(Q, r.reverse)) continue;
      const key = JSON.stringify(r.reverse);
      if (!sums[key]) sums[key] = {reverse: r.reverse, amount: 0, first: r.t};
      sums[key].amount += r.amount;
    }
    const list = Object.keys(sums).map(k => sums[k]).sort((a, b) => b.amount - a.amount || a.first - b.first);
    return list.length ? list[0] : null;
  }

  // In Polish the demand is a noun phrase ('powrót do linii …'); the scenes and results put it after a colon.
  function describeDemand(Q, demand) {
    const r = demand.reverse;
    if (r.kind === 'strategy') {
      const cardId = STANCE_ORDER.find(id => STANCES[id].field === r.field), card = cardId ? STANCES[cardId] : null;
      return L('return to the line “' + (card ? card.values[r.value] : r.value) + '” (' + (card ? card.name : r.field) + ')',
        'powrót do linii „' + (card && card.values[r.value] ? stanceValue(cardId, r.value) : r.value) + '” (' + (card ? stanceName(cardId) : r.field) + ')');
    }
    if (r.kind === 'press_format') return L('return the party press to the party journal', 'powrót prasy partyjnej do formuły pisma partyjnego');
    if (r.kind === 'leave_cabinet') return L('end PPS’s participation in, or support for, the present cabinet',
      'zakończenie udziału PPS w obecnym gabinecie albo poparcia dla niego');
    if (r.kind === 'kpp_agreement') return L('end the agreement with the KPP', 'zerwanie porozumienia z KPP');
    return L('change the line', 'zmiana linii');
  }
  const mpsText = n => L(n + (n === 1 ? ' MP' : ' MPs'), n + ' ' + rules.plural(n, 'poseł', 'posłów', 'posłów'));

  // Once a month (and when the queue looks for an event): a faction with dissent of 60 or more and a concrete
  // demand gets one case; a postponed case returns after its three months; a case whose cause is gone lapses.
  function updateFactionCases(Q, t) {
    const S = Q.S, cases = casesOf(S);
    for (const id of FACTIONS) {
      const f = factionsOf(S)[id], current = activeCase(S, id);
      if (current) {
        if (!reverseLive(Q, current.demand.reverse)) { current.status = 'lapsed'; current.resolved_at = t; continue; }
        if (current.status === 'postponed' && t >= current.postponed_until) current.status = 'open';
        continue;
      }
      if (f.dissent < 60) continue;
      const demand = factionDemand(Q, id);
      if (!demand) continue;
      S.faction_cases.seq = (S.faction_cases.seq || 0) + 1;
      cases.push({id: 'case-' + S.faction_cases.seq + '-' + id + '-t' + t, faction: id, status: 'open', demand: copy(demand), opened_at: t,
        postponed_until: null, postponed_once: false, resolved_at: null, resolution: null});
    }
  }

  // E3 is due for an open case of a faction still at 60 or more (10.2); its instance key is the case ID.
  function factionSplitDue(Q) {
    if (!partyReady(Q) || Q.S.chapter.status === 'ended') return false;
    const S = Q.S;
    updateFactionCases(Q, Q.time);
    const due = casesOf(S).find(c => c.status === 'open' && factionsOf(S)[c.faction].dissent >= 60) || null;
    S.faction_cases.due_case_id = due ? due.id : null;
    return !!due;
  }

  function dueCase(S) {
    return casesOf(S).find(c => c.id === S.faction_cases.due_case_id) || null;
  }

  function executeReverse(Q, reverse) {
    const S = Q.S;
    if (reverse.kind === 'strategy') {
      const previous = S.actors.pps.strategy[reverse.field];
      S.actors.pps.strategy[reverse.field] = reverse.value;
      S.actors.pps.strategy_history.push({t: Q.time, field: reverse.field, from: previous, to: reverse.value, by: 'faction_demand'});
      writeProgramme(S);
    } else if (reverse.kind === 'press_format') {
      S.party_orgs.press.format = 'party_journal';
    } else if (reverse.kind === 'leave_cabinet') {
      government.leaveCabinet(Q, 'pps', 'faction_demand');
      government.writeGovernmentMirrors(Q);
    } else if (reverse.kind === 'kpp_agreement') {
      S.actors.communist_cooperation.active_agreement = null;
    }
  }

  function closeReactions(S, factionId, reverse) {
    const key = JSON.stringify(reverse);
    for (const r of factionsOf(S)[factionId].reactions) if (r.reverse && JSON.stringify(r.reverse) === key) r.closed = true;
  }

  // Accept the demand and keep unity: the change is carried out, the faction's dissent −5 (10.1), the case closed.
  function factionSplitAccept(Q) {
    syncMirrors(Q);
    const S = Q.S, c = dueCase(S);
    if (!c) throw new Error('factionSplitAccept: no case');
    S.history.actions.push({t: Q.time, action_id: 'party.faction_split.accept', case_id: c.id, cost_t: 0});
    executeReverse(Q, c.demand.reverse);
    closeReactions(S, c.faction, c.demand.reverse);
    government.factionReaction(Q, c.faction, {dissent: -5}, {id: 'e3:' + c.id + ':accepted', kind: 'demand_met', reverse: null});
    c.status = 'accepted'; c.resolution = 'accepted'; c.resolved_at = Q.time;
    writeMirrors(Q);
    return result(Q, L(FACTION_NAMES[c.faction] + ' stays: PPS will ' + describeDemand(Q, c.demand) + '. Its dissent −5.',
      FACTION_NAMES[c.faction] + ' zostaje. PPS spełnia żądanie: ' + describeDemand(Q, c.demand) + '. Sprzeciw frakcji −5.'));
  }

  // Keep the line and accept the split: 40% of the faction's base leaves (M16), with its voters and MPs.
  function factionSplitRefuse(Q) {
    syncMirrors(Q);
    const S = Q.S, c = dueCase(S);
    if (!c) throw new Error('factionSplitRefuse: no case');
    S.history.actions.push({t: Q.time, action_id: 'party.faction_split.refuse', case_id: c.id, cost_t: 0});
    closeReactions(S, c.faction, c.demand.reverse);
    const manifest = applyDeparture(Q, c.faction, 0.40, 20, 'split', c.id);
    c.status = 'split'; c.resolution = 'split'; c.resolved_at = Q.time; c.manifest_id = manifest.id;
    return result(Q, L('Part of ' + FACTION_NAMES[c.faction] + ' leaves PPS: ' + fmt(100 * manifest.removed_share) + '% of the party’s base, ' +
      manifest.mps + (manifest.mps === 1 ? ' MP' : ' MPs') + ' to a separate club. PPS keeps its line.',
      'Część frakcji ' + FACTION_NAMES[c.faction] + ' odchodzi z PPS: ' + fmt(100 * manifest.removed_share) + '% bazy partii; do osobnego klubu przechodzi ' +
      mpsText(manifest.mps) + '. PPS utrzymuje swoją linię.'));
  }

  function factionSplitView(Q) {
    const S = Q.S, c = dueCase(S);
    if (!c) return;
    const preview = departurePreview(Q, c.faction, 0.40);
    Q.pl_e3_faction = FACTION_NAMES[c.faction];
    Q.pl_e3_dissent = fmt(factionsOf(S)[c.faction].dissent);
    Q.pl_e3_demand = describeDemand(Q, c.demand);
    Q.pl_e3_preview = L(fmt(100 * preview.removed_share) + '% of the party’s base leaves; PPS support ' + fmt(preview.pps_before) + '% → ' +
      fmt(preview.pps_after) + '%; membership ×' + fmt(1 - preview.removed_share) + '; ' + preview.mps + (preview.mps === 1 ? ' MP' : ' MPs') +
      ' to a separate club; its voters go to ' + (preview.recipient === 'kpp' ? 'the KPP' : 'other lists') + '. No member of the Central Executive Committee leaves.',
      fmt(100 * preview.removed_share) + '% bazy partii odchodzi; poparcie PPS ' + fmt(preview.pps_before) + '% → ' + fmt(preview.pps_after) +
      '%; członkostwo ×' + fmt(1 - preview.removed_share) + '; do osobnego klubu przechodzi ' + mpsText(preview.mps) + '; jej wyborcy przechodzą do ' +
      (preview.recipient === 'kpp' ? 'KPP' : 'innych list') + '. Żaden członek CKW nie odchodzi.');
  }

  // ---- The unity card (10.5, 10.9; cards 6.3–6.4) ---------------------------------------------------------

  function unityAvailable(Q) {
    if (!partyReady(Q) || Q.S.chapter.status === 'ended') return false;
    const f = factionsOf(Q.S);
    return FACTIONS.some(id => f[id].dissent >= 30) || channelOpen(Q.S);
  }

  function unityStatus(Q, option, factionId) {
    const S = Q.S, f = factionsOf(S);
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    if (option === 'concession') {
      if (f[factionId].dissent < 30) return no(L('A concession is for a faction with dissent of 30 or more.', 'Ustępstwo przysługuje frakcji ze sprzeciwem co najmniej 30.'));
      const wait = waitReason(Q, 'party.faction_conference.' + factionId);
      if (wait) return no(wait);
      return S.party_orgs.cash + 1e-9 >= 1 ? OK : no(L('Needs 1 resource.', 'Wymaga 1 jednostki środków.'));
    }
    if (option === 'kpp_line') {
      if (!channelOpen(S)) return no(L('The channel to the KPP is closed.', 'Kanał kontaktu z KPP jest zamknięty.'));
      const wait = waitReason(Q, 'party.unity.kpp_line');
      return wait ? no(wait) : OK;
    }
    if (option === 'postpone') {
      const current = activeCase(S, factionId);
      const demand = current ? current.demand : factionDemand(Q, factionId);
      if (!demand) return no(L('The faction has no concrete demand.', 'Frakcja nie ma konkretnego żądania.'));
      if (f[factionId].dissent < 45) return no(L('Needs dissent of 45 or more.', 'Wymaga sprzeciwu co najmniej 45.'));
      if (current && current.postponed_once) return no(L('This case has been postponed once already.', 'Tę sprawę już raz odroczono.'));
      return OK;
    }
    if (option === 'expel') {
      if (!(f[factionId].strength > 0)) return no(L('The faction has no strength.', 'Frakcja nie ma siły.'));
      const gate = Math.max(30, 100 * partyDissent(S));
      if (f[factionId].dissent < gate) return no(L('Needs dissent of ' + fmt(gate) + ' or more in this faction.',
        'Wymaga sprzeciwu co najmniej ' + fmt(gate) + ' w tej frakcji.'));
      const wait = waitReason(Q, 'party.faction_expulsion');
      if (wait) return no(wait);
      return S.party_orgs.cash + 1e-9 >= 1 ? OK : no(L('Needs 1 resource.', 'Wymaga 1 jednostki środków.'));
    }
    return no(L('Unknown option.', 'Nieznana opcja.'));
  }

  function unityChoose(Q, option, factionId) {
    syncMirrors(Q);
    const status = unityStatus(Q, option, factionId);
    if (!status.available) throw new Error('unityChoose: ' + status.reason);
    const S = Q.S, t = Q.time;
    if (option === 'concession') {
      rules.commitMainAction(Q, 'party.faction_conference', {faction: factionId, resource_cost: {R: 1}});
      S.party_orgs.cash = Math.max(0, S.party_orgs.cash - 1);
      S.cooldowns['party.faction_conference.' + factionId] = t + 3;
      government.factionReaction(Q, factionId, {dissent: -8}, {id: 'party.faction_conference:' + factionId + ':t' + t, kind: 'concession', reverse: null});
      writeMirrors(Q);
      return result(Q, L('A concession to ' + FACTION_NAMES[factionId] + ': its dissent −8.',
        'Ustępstwo wobec frakcji ' + FACTION_NAMES[factionId] + ': jej sprzeciw −8.'));
    }
    if (option === 'kpp_line') {
      rules.commitMainAction(Q, 'party.unity.kpp_line', {});
      const acceptance = S.actors.communist_cooperation.pps_internal_acceptance;
      for (const id of FACTIONS) acceptance[id] = Math.min(100, acceptance[id] + 15);
      S.cooldowns['party.unity.kpp_line'] = t + 6;
      writeMirrors(Q);
      return result(Q, L('PPS agrees on the line of cooperation with the communists: acceptance +15 in each faction (' + fmt(internalAcceptance(S)) + ').',
        'PPS uzgadnia linię współpracy z komunistami: akceptacja +15 w każdej frakcji (' + fmt(internalAcceptance(S)) + ').'));
    }
    if (option === 'postpone') {
      rules.commitMainAction(Q, 'party.unity.postpone', {faction: factionId});
      let current = activeCase(S, factionId);
      if (!current) {
        S.faction_cases.seq = (S.faction_cases.seq || 0) + 1;
        current = {id: 'case-' + S.faction_cases.seq + '-' + factionId + '-t' + t, faction: factionId, status: 'postponed',
          demand: copy(factionDemand(Q, factionId)), opened_at: t, postponed_until: null, postponed_once: false, resolved_at: null, resolution: null};
        casesOf(S).push(current);
      }
      current.status = 'postponed';
      current.postponed_until = t + 3;
      current.postponed_once = true;
      writeMirrors(Q);
      return result(Q, L(FACTION_NAMES[factionId] + ' agrees to wait: its case is postponed for three months. Its dissent does not change.',
        FACTION_NAMES[factionId] + ' zgadza się poczekać: jej sprawa zostaje odroczona o trzy miesiące. Jej sprzeciw się nie zmienia.'));
    }
    // A purge (10.9): 25% of the faction's base, dissent −15, a shared cooldown of 12 months.
    rules.commitMainAction(Q, 'party.faction_expulsion', {faction: factionId, resource_cost: {R: 1}});
    S.party_orgs.cash = Math.max(0, S.party_orgs.cash - 1);
    S.cooldowns['party.faction_expulsion'] = t + 12;
    const current = activeCase(S, factionId);
    const manifest = applyDeparture(Q, factionId, 0.25, 15, 'expulsion', current ? current.id : null);
    if (current) { current.status = 'closed'; current.resolution = 'expulsion'; current.resolved_at = t; current.manifest_id = manifest.id; }
    return result(Q, L('PPS expels part of ' + FACTION_NAMES[factionId] + ': ' + fmt(100 * manifest.removed_share) + '% of the party’s base, ' +
      manifest.mps + (manifest.mps === 1 ? ' MP' : ' MPs') + ' leave the club.',
      'PPS usuwa część frakcji ' + FACTION_NAMES[factionId] + ': ' + fmt(100 * manifest.removed_share) + '% bazy partii; klub opuszcza ' +
      mpsText(manifest.mps) + '.'));
  }

  // A broken rule of the cooperation with the communists costs 15 of acceptance in each faction (9.5).
  function kppRuleBroken(Q) {
    const acceptance = Q.S.actors.communist_cooperation.pps_internal_acceptance;
    for (const id of FACTIONS) acceptance[id] = Math.max(0, acceptance[id] - 15);
  }

  function unityView(Q) {
    syncMirrors(Q);
    const S = Q.S;
    for (const id of FACTIONS) {
      for (const option of ['concession', 'postpone', 'expel']) Q['pl_unity_' + option + '_' + id + '_why'] = unityStatus(Q, option, id).reason;
      Q['pl_unity_' + id + '_line'] = FACTION_NAMES[id] + L(': strength ', ': siła ') + fmt(factionsOf(S)[id].strength) + L(', dissent ', ', sprzeciw ') +
        fmt(factionsOf(S)[id].dissent) + (activeCase(S, id) ? L('; its demand: ', '; jej żądanie: ') + describeDemand(Q, activeCase(S, id).demand) :
          factionDemand(Q, id) ? L('; it could demand: ', '; możliwe żądanie: ') + describeDemand(Q, factionDemand(Q, id)) : '');
    }
    Q.pl_unity_kpp_line_why = unityStatus(Q, 'kpp_line').reason;
  }

  // ---- Advisers: the change of the team and the actions of 10.4 (cards 6.5–6.6) ------------------------

  const ADVISERS = Object.freeze({
    daszynski: {faction: 'centrum', name: 'Ignacy Daszyński'},
    puzak: {faction: 'centrum', name: 'Kazimierz Pużak'},
    perl: {faction: 'centrum', name: 'Feliks Perl', last_time: T(1927, 3)},
    niedzialkowski: {faction: 'centrum', name: 'Mieczysław Niedziałkowski'},
    arciszewski: {faction: 'centrum', name: 'Tomasz Arciszewski'},
    zaremba: {faction: 'lewica', name: 'Zygmunt Zaremba'},
    czapinski: {faction: 'lewica', name: 'Kazimierz Czapiński'},
    jaworowski: {faction: 'pilsudczycy', name: 'Rajmund Jaworowski'},
    moraczewski: {faction: 'pilsudczycy', name: 'Jędrzej Moraczewski'},
    ziemiecki: {faction: 'pilsudczycy', name: 'Bronisław Ziemięcki'},
    malinowski: {faction: 'pilsudczycy', name: 'Marian Malinowski'},
    // Z — 0.29 (M17): the cast of the continuation, not available in chapter 1.
    prochnik: {faction: 'lewica', name: 'Adam Próchnik', continuation: true},
    drobner: {faction: 'lewica', name: 'Bolesław Drobner', continuation: true},
    dubois: {faction: 'lewica', name: 'Stanisław Dubois', continuation: true},
  });
  const ADVISER_ORDER = Object.freeze(Object.keys(ADVISERS));
  const TEAM_SIZE = 3;

  const activeAdvisers = Q => ADVISER_ORDER.filter(id => Q[id + '_advisor'] === 1);

  function adviserInPool(Q, id) {
    const a = ADVISERS[id];
    if (!a || a.continuation) return false;
    if (Q[id + '_left_adviser_pool']) return false;
    if (a.last_time && Q.time > a.last_time) return false;
    return true;
  }

  function advisersAvailable(Q) {
    return partyReady(Q) && Q.S.chapter.status !== 'ended' && rules.cooldownRemaining(Q, 'party.advisers') === 0;
  }

  const draftOf = Q => String(Q.pl_adv_draft || '').split(',').filter(Boolean);

  function advisersStatus(Q, draft) {
    const current = activeAdvisers(Q);
    if (draft.length > TEAM_SIZE) return no(L('Three seats at most.', 'Najwyżej trzy miejsca.'));
    if (draft.some(id => current.indexOf(id) < 0 && !adviserInPool(Q, id))) return no(L('Someone in this Committee is not available.', 'Ktoś z tego składu CKW jest niedostępny.'));
    if (sameSet(draft, current)) return no(L('This is the present Committee.', 'To obecny skład CKW.'));
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    const wait = waitReason(Q, 'party.advisers');
    return wait ? no(wait) : OK;
  }

  // One final team in one transaction (10.4.2): 1 T, cd 6 M, without resetting the adviser cooldown. A first
  // appointment: +5 raw strength of the person's faction and −5 of its dissent; a dismissal: +5 dissent;
  // a re-appointment gives nothing.
  function advisersChoose(Q, draft) {
    syncMirrors(Q);
    const status = advisersStatus(Q, draft);
    if (!status.available) throw new Error('advisersChoose: ' + status.reason);
    const S = Q.S, t = Q.time, current = activeAdvisers(Q);
    rules.commitMainAction(Q, 'party.advisers', {from: current, to: draft.slice()});
    const lines = [];
    for (const id of current) {
      if (draft.indexOf(id) >= 0) continue;
      Q[id + '_advisor'] = 0;
      government.factionReaction(Q, ADVISERS[id].faction, {dissent: 5}, {id: 'adviser.dismissed:' + id + ':t' + t, kind: 'dismissal', reverse: null});
      lines.push(ADVISERS[id].name + L(' leaves the Committee (' + FACTION_NAMES[ADVISERS[id].faction] + ' dissent +5)',
        ' odchodzi z CKW (' + FACTION_NAMES[ADVISERS[id].faction] + ': sprzeciw +5)'));
    }
    for (const id of draft) {
      if (current.indexOf(id) >= 0) continue;
      Q[id + '_advisor'] = 1;
      if (!Q[id + '_appointed_once']) {
        Q[id + '_appointed_once'] = 1;
        government.factionReaction(Q, ADVISERS[id].faction, {strength: 5, dissent: -5}, {id: 'adviser.appointed:' + id, kind: 'appointment', reverse: null});
        lines.push(ADVISERS[id].name + L(' joins the Committee (' + FACTION_NAMES[ADVISERS[id].faction] + ' +5 strength, dissent −5)',
          ' wchodzi do CKW (' + FACTION_NAMES[ADVISERS[id].faction] + ': siła +5, sprzeciw −5)'));
      } else {
        lines.push(ADVISERS[id].name + L(' returns to the Committee', ' wraca do CKW'));
      }
    }
    Q.n_advisors = activeAdvisers(Q).length;
    S.cooldowns['party.advisers'] = t + 6;
    writeMirrors(Q);
    return result(Q, lines.join('; ') + '.');
  }

  function advisersView(Q) {
    const draft = draftOf(Q), current = activeAdvisers(Q);
    for (const id of ADVISER_ORDER) {
      Q['pl_adv_' + id + '_in'] = draft.indexOf(id) >= 0 ? 1 : 0;
      Q['pl_adv_' + id + '_can_add'] = draft.indexOf(id) < 0 && draft.length < TEAM_SIZE && (current.indexOf(id) >= 0 || adviserInPool(Q, id)) ? 1 : 0;
      Q['pl_adv_' + id + '_why'] = ADVISERS[id].continuation ? L('Belongs to the continuation (from 1928 in chapter 2).',
        'Należy do kontynuacji (od 1928 roku, w rozdziale 2).') : !adviserInPool(Q, id) && current.indexOf(id) < 0 ? L('No longer available.', 'Już niedostępny.') :
        draft.length >= TEAM_SIZE ? L('The three seats are taken.', 'Trzy miejsca są zajęte.') : '';
      // Z — 0.75: the last sentence of the candidate's description: remove, add, or why not.
      Q['pl_adv_' + id + '_state'] = Q['pl_adv_' + id + '_in'] ? L('On the Committee — remove.', 'Zasiada w CKW — usuń.') :
        Q['pl_adv_' + id + '_can_add'] ? L('Add to the Committee.', 'Dodaj do CKW.') : Q['pl_adv_' + id + '_why'];
    }
    Q.pl_adv_draft_text = draft.map(id => ADVISERS[id].name).join(', ') || L('nobody', 'nikt');
    Q.pl_adv_confirm_why = advisersStatus(Q, draft).reason;
  }

  function advisersToggle(Q, id) {
    const draft = draftOf(Q);
    const at = draft.indexOf(id);
    if (at >= 0) draft.splice(at, 1); else if (draft.length < TEAM_SIZE) draft.push(id);
    Q.pl_adv_draft = draft.join(',');
    advisersView(Q);
  }

  // The support transfer of an adviser action (10.4.4) in one cell: delta = min(pool, k × (1 − dissent) ×
  // (1 − share/100)); a single adviser cooldown of six months means the same action is never repeated sooner.
  function impulse(Q, filter, k, sources) {
    const S = Q.S, parties = S.society.parties;
    let moved = 0;
    for (const cell of S.society.cells.filter(filter)) {
      const delta = k * (1 - (Q.dissent || 0)) * (1 - cell.propensity.pps / 100);
      moved += cell.mass * electorate.gainForPps(cell, delta, parties, sources || null);
    }
    return moved;
  }

  function addEffect(S, actionId, kind, value, t) {
    S.advisors.effects.push({action_id: actionId, kind: kind, audience: null, starts_at: t, expires_at: t + 6, value: value, used_by: [], status: 'active'});
  }

  const ACTION_COSTS = Object.freeze({mobilize_organization: 1, direct_party_press: 1, organize_workers: 1, class_campaign: 1,
    socialist_education: 1, municipal_socialism: 1});

  function advisorActionStatus(Q, advisorId, actionId) {
    const S = Q.S;
    if (Q[advisorId + '_advisor'] !== 1) return no(L('Not on the Committee.', 'Nie zasiada w CKW.'));
    if (!rules.isAdvisorAvailable(Q)) {
      const wait = rules.cooldownRemaining(Q, 'advisor');
      return no(L(wait + (wait === 1 ? ' month' : ' months') + ' before the next Committee action.',
        'Do następnej akcji CKW: ' + wait + ' ' + rules.plural(wait, 'miesiąc', 'miesiące', 'miesięcy') + '.'));
    }
    const cost = ACTION_COSTS[actionId] || 0;
    if (cost && S.party_orgs.cash + 1e-9 < cost) return no(L('Needs ' + rules.units(cost) + '.', 'Wymaga ' + rules.units(cost, 'resources', 'gen') + '.'));
    if (advisorId === 'perl' && Q.time > ADVISERS.perl.last_time) return no(L('Perl is no longer active.', 'Perl nie jest już aktywny.'));
    if (actionId === 'direct_party_press' && (S.party_orgs.press.unpaid_months >= 2 || S.party_orgs.press.reach <= 0)) return no(L('Needs a working party press.', 'Wymaga działającej prasy partyjnej.'));
    if (actionId === 'broker_coalition') return government.brokerStatus(Q);
    if (actionId === 'socialist_education' && S.party_orgs.tur.level < 1) return no(L('Needs a working TUR.', 'Wymaga działającego TUR.'));
    // Decision 5A of stage 8: the profile pilsudski_aligned of A10 belongs to the cabinets of Śliwiński and Piłsudski.
    if (actionId === 'conditional_toleration') {
      if (government.ppsStance(S) !== 'supporter') return no(L('Needs external support of a cabinet with a pilsudski_aligned profile and an agreement; full membership does not qualify.', 'Wymaga poparcia z zewnątrz i porozumienia z gabinetem o profilu bliskim Piłsudskiemu (pilsudski_aligned); pełny udział w gabinecie się nie liczy.'));
      if (!government.pilsudskiAligned(S)) return no(L('Needs a minority cabinet with a pilsudski_aligned profile: premier Śliwiński or Piłsudski.', 'Wymaga gabinetu mniejszościowego o profilu bliskim Piłsudskiemu (pilsudski_aligned): premier Śliwiński albo Piłsudski.'));
      if (!government.ppsSupportAgreement(S)) return no(L('Needs an agreement on our external support.', 'Wymaga porozumienia o naszym poparciu z zewnątrz.'));
    }
    return OK;
  }

  // The approved actions of 10.4.3 (P numbers); the action's own R is paid here, the cooldown by the commit.
  function advisorAction(Q, advisorId, actionId, option) {
    syncMirrors(Q);
    const status = advisorActionStatus(Q, advisorId, actionId);
    if (!status.available) throw new Error('advisorAction: ' + status.reason);
    const S = Q.S, t = Q.time, key = 'advisor.' + advisorId + '.' + actionId;
    const cost = ACTION_COSTS[actionId] || 0;
    if (cost) S.party_orgs.cash = Math.max(0, S.party_orgs.cash - cost);
    const react = (faction, change) => government.factionReaction(Q, faction, change, {id: key + ':t' + t, kind: 'adviser', reverse: null});
    const relation = (id, delta) => { if (S.actors.relations[id] !== undefined) government.changeRelation(Q, id, delta, key); };
    let text = '';
    if (key === 'advisor.daszynski.parliamentary_compromise') {
      relation('psl_piast', 5); relation('npr', 5); relation('pschd', 4);
      text = L('Relations: PSL Piast +5, NPR +5, PSChD +4.', 'Relacje: PSL Piast +5, NPR +5, PSChD +4.');
    } else if (key === 'advisor.daszynski.broker_coalition') {
      government.brokerCoalition(Q);
      text = L('Daszyński brokers the coalition.', 'Daszyński pośredniczy w tworzeniu koalicji.');
    } else if (key === 'advisor.puzak.party_discipline') {
      for (const id of FACTIONS) react(id, {dissent: -12});
      text = L('Every faction’s dissent −12.', 'Sprzeciw każdej frakcji −12.');
    } else if (key === 'advisor.puzak.mobilize_organization') {
      const gain = 10 * expansionMultiplier(S, {kind: 'class', class_id: 'workers'});
      electorate.addBaseReach(S, cell => cell.class_id === 'workers', gain);
      addEffect(S, key, 'workers_campaign_multiplier', 1.20, t);
      text = L('The base reach of PPS among the workers +' + fmt(gain) + '; campaigns among workers ×1.20 for six months.',
        'Bazowy zasięg PPS wśród robotników +' + fmt(gain) + '; kampanie wśród robotników ×1,20 przez sześć miesięcy.');
    } else if (key === 'advisor.perl.define_party_line') {
      government.factionReactions(Q, [{faction: 'centrum', strength: 8, dissent: -8}, {faction: 'pilsudczycy', strength: -4}],
        {id: key + ':t' + t, kind: 'adviser', reverse: null});
      impulse(Q, cell => cell.class_id === 'workers', 1, ['kpp']);
      text = L('Centrum +8 strength and −8 dissent, Piłsudczycy −4; workers move from the KPP to PPS.', 'Centrum: siła +8, sprzeciw −8; Piłsudczycy: siła −4; robotnicy przechodzą od KPP do PPS.');
    } else if (key === 'advisor.perl.direct_party_press') {
      S.party_orgs.press.credibility = Math.min(100, S.party_orgs.press.credibility + 5);
      addEffect(S, key, 'press_campaign_multiplier', 1.25, t);
      text = L('Press credibility +5; press campaigns ×1.25 for six months.', 'Wiarygodność prasy +5; kampanie prasowe ×1,25 przez sześć miesięcy.');
    } else if (key === 'advisor.ziemiecki.conditional_toleration') {
      government.factionReactions(Q, [{faction: 'centrum', dissent: -10}, {faction: 'lewica', dissent: -8}],
        {id: key + ':t' + t, kind: 'adviser', reverse: null});
      text = L('Our toleration stays conditional: Centrum −10 and Lewica −8 dissent. The kind of our support does not change.', 'Nasze tolerowanie pozostaje warunkowe: Centrum: sprzeciw −10; Lewica: sprzeciw −8. Rodzaj naszego poparcia się nie zmienia.');
    } else if (key === 'advisor.niedzialkowski.build_centrolew') {
      for (const id of ['psl_piast', 'psl_wyzwolenie', 'npr', 'pschd']) relation(id, 3);
      text = L('Relations with Piast, Wyzwolenie, NPR and PSChD +3.', 'Relacje z Piastem, Wyzwoleniem, NPR i PSChD +3.');
    } else if (key === 'advisor.niedzialkowski.defend_democracy') {
      // The +5 to democracy is applied by PolishPolitics at the next settlement (decision 4 of stage 4; leak 10: no pro_republic).
      (S.actors.pps.pending_effects = S.actors.pps.pending_effects || []).push({id: key + ':t' + t, system: 'democracy', stage: 7, value: 5});
      S.militia.alignment.legal_institutions = Math.min(100, (S.militia.alignment.legal_institutions || 50) + 5);
      for (const id of BRANCHES) S.unions[id].alignment.legal_institutions = Math.min(100, (S.unions[id].alignment.legal_institutions || 50) + 5);
      addEffect(S, key, 'authoritarian_support_penalty', 5, t);
      text = L('The organisations of PPS stand closer to the legal institutions (+5); attachment to democracy +5 at the next monthly settlement.', 'Organizacje PPS zbliżają się do legalnych instytucji (+5); przywiązanie do demokracji +5 przy następnym miesięcznym rozliczeniu.');
    } else if (key === 'advisor.arciszewski.organize_workers') {
      const branch = option || 'industry';
      const gain = expandBranch(S, branch, 8);
      impulse(Q, cell => cell.class_id === 'workers', 3);
      text = L('The ' + BRANCH_NAMES[branch].toLowerCase() + ' branch +' + fmt(gain) + ' reach; PPS gains among its workers.',
        'Zasięg branży ' + BRANCH_PL_GENITIVE[branch] + ' +' + fmt(gain) + '; PPS zyskuje wśród jej robotników.');
    } else if (key === 'advisor.zaremba.worker_peasant_front') {
      relation('psl_wyzwolenie', 8);
      text = L('Relation with PSL Wyzwolenie +8.', 'Relacja z PSL Wyzwolenie +8.');
    } else if (key === 'advisor.zaremba.class_campaign') {
      impulse(Q, cell => cell.class_id === 'workers' && cell.employment === 'employed', 4);
      impulse(Q, cell => cell.employment === 'unemployed', 3);
      for (const cell of S.society.cells.filter(c => c.class_id === 'old_middle')) electorate.lossForPps(cell, Math.min(cell.propensity.pps, 2), S.society.parties);
      react('lewica', {strength: 4, dissent: -5});
      text = L('A class campaign: gains among employed and unemployed workers, a loss among the petty bourgeoisie; Lewica +4 strength, dissent −5.', 'Kampania klasowa: zyski wśród zatrudnionych i bezrobotnych robotników, strata wśród drobnomieszczaństwa; Lewica: siła +4, sprzeciw −5.');
    } else if (key === 'advisor.czapinski.socialist_education') {
      react('lewica', {strength: 6, dissent: -5});
      addEffect(S, key, 'kpp_outflow_protection', 0.50, t);
      text = L('Lewica +6 strength and −5 dissent; for six months the flow of workers from PPS to the KPP is halved.', 'Lewica: siła +6, sprzeciw −5; przez sześć miesięcy odpływ robotników z PPS do KPP jest o połowę mniejszy.');
    } else if (key === 'advisor.jaworowski.back_pilsudski') {
      relation('pilsudski', 8);
      government.factionReactions(Q, [{faction: 'pilsudczycy', strength: 5}, {faction: 'centrum', dissent: 3}, {faction: 'lewica', dissent: 3}],
        {id: key + ':t' + t, kind: 'adviser', reverse: null});
      text = L('Relation with Piłsudski +8; Piłsudczycy +5 strength; Centrum and Lewica dissent +3.', 'Relacja z Piłsudskim +8; Piłsudczycy: siła +5; Centrum i Lewica: sprzeciw +3.');
    } else if (key === 'advisor.ziemiecki.municipal_socialism') {
      const city = cell => cell.settlement === 'major_city' && ['workers', 'new_middle', 'old_middle'].indexOf(cell.class_id) >= 0;
      for (const c of ['workers', 'new_middle', 'old_middle']) {
        electorate.addBaseReach(S, cell => city(cell) && cell.class_id === c, 8 * expansionMultiplier(S, {kind: 'class', class_id: c}));
      }
      impulse(Q, city, 2);
      text = L('Municipal socialism in the large cities: base reach +8 and a gain for PPS there.', 'Socjalizm municypalny w wielkich miastach: bazowy zasięg +8 i zysk PPS w tych miastach.');
    } else if (key === 'advisor.malinowski.organize_pilsudczyks') {
      react('pilsudczycy', {strength: 8, dissent: -10});
      text = L('Piłsudczycy +8 strength, dissent −10.', 'Piłsudczycy: siła +8, sprzeciw −10.');
    } else {
      throw new Error('advisorAction: unknown action ' + key);
    }
    S.history.reasons.push({t: t, kind: 'adviser_action', action_id: key, option: option || null});
    electorate.writeClassMirrors(Q);
    writeMirrors(Q);
    return result(Q, text);
  }

  function advisorView(Q, advisorId) {
    const actions = {daszynski: ['parliamentary_compromise', 'broker_coalition'], puzak: ['party_discipline', 'mobilize_organization'],
      perl: ['define_party_line', 'direct_party_press'], niedzialkowski: ['build_centrolew', 'defend_democracy'], arciszewski: ['organize_workers'],
      zaremba: ['worker_peasant_front', 'class_campaign'], czapinski: ['socialist_education'], jaworowski: ['back_pilsudski'],
      ziemiecki: ['conditional_toleration', 'municipal_socialism'], malinowski: ['organize_pilsudczyks']}[advisorId] || [];
    for (const id of actions) Q['pl_advact_' + id + '_why'] = advisorActionStatus(Q, advisorId, id).reason;
  }

  // ---- Temporary modifiers of advisers (10.4.4) --------------------------------------------------------

  function expireAdvisorEffects(S, time) {
    for (const effect of S.advisors.effects) if (effect.status !== 'expired' && time >= effect.expires_at) effect.status = 'expired';
  }

  // ---- Displays -------------------------------------------------------------------------------------------

  function result(Q, text) {
    Q.pl_party_result = text;
    return text;
  }

  function packageLine(Q, id) {
    const p = PACKAGES[id];
    const names = rules.getLanguage() === 'pl' ? {
      organize: 'Zorganizuj branżę ' + (p.branch ? BRANCH_PL_ACCUSATIVE[p.branch] : '') + ' (+15 zasięgu, więcej przy linii robotniczej i z kadrami TUR)',
      fund: 'Wesprzyj fundusz związkowy branży ' + (p.branch ? BRANCH_PL_GENITIVE[p.branch] : '') + ' (+1 R dla związku)',
      distribution: 'Poszerz kolportaż prasy (+10 zasięgu)',
      // Z — 0.57: at level 0 the first build founds TUR, a decision of the party.
      build: (Q.S.party_orgs.tur.level === 0 ? 'Załóż TUR' : 'Rozpocznij kolejny etap TUR') + ' (dwa miesiące)',
      recruit: 'Werbunek do Milicji (+100 członków)',
      militarize: 'Militaryzacja Milicji (sprawność +0,10, najwyżej 0,70)',
      prepare: 'Przygotuj ' + (p.class_id ? COOPERATIVE_NAMES_PL_ACCUSATIVE[p.class_id] : ''),
    } : {
      organize: 'Organise the ' + (p.branch ? BRANCH_NAMES[p.branch].toLowerCase() : '') + ' branch (+15 reach, more under the workers’ line and with TUR cadres)',
      fund: 'Support the ' + (p.branch ? BRANCH_NAMES[p.branch].toLowerCase() : '') + ' union fund (+1 R to the union)',
      distribution: 'Extend the distribution of the press (+10 reach)',
      build: (Q.S.party_orgs.tur.level === 0 ? 'Found TUR' : 'Start the next stage of TUR') + ' (two months)',
      recruit: 'Recruit into Milicja (+100 members)',
      militarize: 'Militarise Milicja (efficiency +0.10, up to 0.70)',
      prepare: 'Prepare ' + (p.class_id ? COOPERATIVE_NAMES[p.class_id] : ''),
    };
    return names[p.kind] + ' — ' + L(String(p.cost), fmt(p.cost)) + ' R';
  }

  function organizationsView(Q) {
    syncMirrors(Q);
    for (const id of PACKAGE_ORDER) {
      Q['pl_org_' + id + '_title'] = packageLine(Q, id);
      Q['pl_org_' + id + '_why'] = packageStatus(Q, id, 0).reason;
    }
    Q.pl_org_cash = fmt(Q.S.party_orgs.cash);
    // Z — 0.57: the TUR package founds TUR while its level is 0.
    Q.pl_tur_level = Q.S.party_orgs.tur.level;
  }

  // The union card: why each of its packages cannot be taken now (Z — 0.56).
  function unionInvestmentsView(Q) {
    organizationsView(Q);
    for (const id of PACKAGE_ORDER) if (cardOfPackage(id) === UNION_CARD) Q['pl_uni_' + id + '_why'] = selectionStatus(Q, [id], UNION_CARD).reason;
  }

  function organizationsSecondView(Q, first) {
    // The second page shows only the other organisations, so it never offers more than seven choices (Z — 0.56).
    Q.pl_org_first_org = PACKAGES[first].org;
    // Z — 0.57: "Invest only in" names the first investment.
    Q.pl_org_pick1_name = packageLine(Q, first).split(' — ')[0];
    for (const id of PACKAGE_ORDER) {
      const same = PACKAGES[id].org === PACKAGES[first].org;
      Q['pl_org2_' + id + '_ok'] = same ? 0 : (selectionStatus(Q, [first, id]).available ? 1 : 0);
      Q['pl_org2_' + id + '_why'] = same ? L('The second package must be for another organisation.', 'Drugi pakiet musi dotyczyć innej organizacji.') :
        selectionStatus(Q, [first, id]).reason;
    }
  }

  function selectionSummary(Q, ids) {
    const total = ids.reduce((n, id) => n + PACKAGES[id].cost, 0);
    Q.pl_org_summary = ids.map(id => packageLine(Q, id)).join('; ') + L('. Together ' + total + ' R and this month’s action.',
      '. Razem ' + fmt(total) + ' R i akcja tego miesiąca.');
    Q.pl_org_confirm_why = selectionStatus(Q, ids).reason;
    return selectionStatus(Q, ids).available;
  }

  function partyDisplay(Q) {
    if (!partyReady(Q)) return;
    const S = Q.S, orgs = S.party_orgs, m = S.militia, press = pressEffective(S);
    // A no-break space keeps the unit with its number on the narrow sidebar (Z — 0.56).
    Q.pl_party_cash = fmt(orgs.cash) + '\u00a0R';
    Q.pl_party_press = L('reach ', 'zasięg ') + fmt(press.reach) + L(', credibility ', ', wiarygodność ') + fmt(press.credibility) + ' (' +
      (orgs.press.format === 'popular' ? L('popular format', 'format popularny') : L('party journal', 'pismo partyjne')) + ')' +
      (press.penalty ? L('; restricted −', '; ograniczenia −') + fmt(press.penalty) : '');
    const tur = orgs.tur;
    // Z — 0.57: TUR is founded by a decision of the party, the first build in the card Organisations of PPS.
    Q.pl_party_tur = tur.level === 0 && !tur.active_build ? L('not founded; it can be founded with the card Organisations of PPS',
      'nie założony; można go założyć kartą Organizacje PPS') :
      tur.level === 0 ? L('being founded (', 'w trakcie zakładania (') + tur.active_build.paid_months + L('/2 months)', '/2 mies.)') :
      L('level ', 'poziom ') + tur.level + L(', cadres ', ', kadry ') + tur.cadres + (tur.active_build ? L('; building level ', '; budowa poziomu ') +
        tur.active_build.target_level + ' (' + tur.active_build.paid_months + L('/2 months)', '/2 mies.)') : '') +
      (tur.active_course ? L('; course: ', '; kurs: ') + courseName(tur.active_course.course) + ' (' + tur.active_course.paid_months +
        L('/2 months)', '/2 mies.)') : '');
    const coops = operatingCooperatives(S).length, prepared = preparedCooperatives(S).length;
    Q.pl_party_coops = L(coops + ' operating' + (prepared ? ', ' + prepared + ' prepared' : ''),
      coops + ' ' + rules.plural(coops, 'działająca', 'działające', 'działających') +
      (prepared ? ', ' + prepared + ' ' + rules.plural(prepared, 'przygotowana', 'przygotowane', 'przygotowanych') : ''));
    Q.pl_party_militia = L(m.strength + ' members, efficiency ' + fmt(m.militancy) + (m.fatigue ? ', fatigue ' + m.fatigue : '') +
      (m.militarized ? ', militarised' : '') + (m.stage === 2 ? '; Akcja Socjalistyczna' : ''),
      m.strength + ' ' + rules.plural(m.strength, 'członek', 'członków', 'członków') + ', sprawność ' + fmt(m.militancy) +
      (m.fatigue ? ', zmęczenie ' + m.fatigue : '') + (m.militarized ? ', zmilitaryzowana' : '') + (m.stage === 2 ? '; Akcja Socjalistyczna' : ''));
    Q.pl_party_unions = BRANCHES.map(id => branchName(id) + L(' reach ', ': zasięg ') + fmt(S.unions[id].reach) + L(', fund ', ', fundusz ') +
      fmt(S.unions[id].fund) + ' R').join('; ');
    sidebarDisplay(Q);
  }

  // The same values one per line for the sidebar (Z — 0.54). The sidebar's Main tab also computes them itself, so a
  // save from before 0.54 shows them as soon as it is loaded; they are display fields only.
  function sidebarDisplay(Q) {
    if (!partyReady(Q)) return;
    const S = Q.S, orgs = S.party_orgs;
    // Z — 0.56: what a collection brings now; there is no monthly income or upkeep.
    Q.pl_party_collection = fmt(collectionGain(S)) + '\u00a0R';
    // Each value has its own line with a bold label in the scene (Z — 0.55); the scales are 1–4 for both levels.
    Q.pl_party_dues = orgs.dues + L(' of ', ' z ') + DUES_MAX;
    Q.pl_party_membership = String(Math.round(orgs.apparatus.member_index));
    Q.pl_party_apparatus = orgs.apparatus.level + L(' of ', ' z ') + APPARATUS_MAX;
    Q.pl_party_cohesion = String(Math.round(cohesion(S)));
    for (const id of BRANCHES) {
      Q['pl_party_union_' + id] = L('reach ', 'zasięg ') + fmt(S.unions[id].reach) + L(', fund ', ', fundusz ') + fmt(S.unions[id].fund) + '\u00a0R';
    }
  }

  // ---- Party agenda (4.4, 13.1–13.2; cards 5.5–5.9) ----------------------------------------------------

  function agendaAvailable(Q) {
    return partyReady(Q) && Q.S.chapter.status !== 'ended';
  }

  function agendaView(Q) {
    syncMirrors(Q);
    const S = Q.S;
    Q.pl_pa_fundraise_why = fundraiseStatus(Q).reason;
    Q.pl_pa_fundraise_gain = fmt(collectionGain(S));
    Q.pl_pa_apparatus_why = apparatusStatus(Q).reason;
    for (const id of BRANCHES) Q['pl_pa_branch_' + id + '_why'] = organizeStatus(Q, 'branch:' + id).reason;
    for (const c of ORGANIZE_CLASSES) Q['pl_pa_class_' + c + '_why'] = organizeStatus(Q, 'class:' + c).reason;
    for (const id of Object.keys(COURSES)) Q['pl_pa_course_' + id + '_why'] = courseStatus(Q, id).reason;
    const prepared = preparedCooperatives(S);
    Q.pl_pa_coop_count = prepared.length;
    Q.pl_pa_coop_id = prepared.length ? prepared[0].id : '';
    Q.pl_pa_coop_name = prepared.length ? L(COOPERATIVE_NAMES[prepared[0].class_id], COOPERATIVE_NAMES_PL[prepared[0].class_id]) : '';
    Q.pl_pa_coop_why = prepared.length ? cooperativeStatus(Q, prepared[0].id).reason : '';
    Q.pl_pa_kpp_open = channelOpen(S) ? 1 : 0;
    if (channelOpen(S)) kppView(Q);
    Q.pl_pa_priorities = strategyOf(S).economic_priorities.map(priorityName).join('; ');
    partyDisplay(Q);
  }

  return Object.freeze({
    PARTY_PROFILE_ID: PARTY_PROFILE_ID,
    FACTIONS: FACTIONS,
    FACTION_NAMES: FACTION_NAMES,
    BRANCHES: BRANCHES,
    BRANCH_NAMES: BRANCH_NAMES,
    BRANCH_NAMES_PL: BRANCH_NAMES_PL,
    PACKAGES: PACKAGES,
    PACKAGE_ORDER: PACKAGE_ORDER,
    COURSES: COURSES,
    OPENING_STRATEGY: OPENING_STRATEGY,
    TUR_AVAILABLE_FROM: TUR_AVAILABLE_FROM,
    createPartyState: createPartyState,
    attachPartyState: attachPartyState,
    partyReady: partyReady,
    normalizeFactions: normalizeFactions,
    partyDissent: partyDissent,
    cohesion: cohesion,
    factionReaction: factionReaction,
    syncMirrors: syncMirrors,
    writeMirrors: writeMirrors,
    averageUnionReach: averageUnionReach,
    ppsWorkerSupport: ppsWorkerSupport,
    memberTarget: memberTarget,
    APPARATUS_COLLECTION_BONUS: APPARATUS_COLLECTION_BONUS,
    collectionGain: collectionGain,
    pressEffective: pressEffective,
    settleParty: settleParty,
    settleMonth: settleMonth,
    expansionMultiplier: expansionMultiplier,
    packageStatus: packageStatus,
    selectionStatus: selectionStatus,
    organizationsAvailable: organizationsAvailable,
    unionInvestmentsAvailable: unionInvestmentsAvailable,
    unionInvestmentsView: unionInvestmentsView,
    organizationsChoose: organizationsChoose,
    organizationsView: organizationsView,
    organizationsSecondView: organizationsSecondView,
    selectionSummary: selectionSummary,
    canFormAS: canFormAS,
    militiaStatus: militiaStatus,
    militiaAvailable: militiaAvailable,
    militiaChoose: militiaChoose,
    compliance: compliance,
    militiaForce: militiaForce,
    allocateProtection: allocateProtection,
    duesStatus: duesStatus,
    duesAvailable: duesAvailable,
    duesChoose: duesChoose,
    duesView: duesView,
    fundraiseStatus: fundraiseStatus,
    fundraise: fundraise,
    apparatusStatus: apparatusStatus,
    buildApparatus: buildApparatus,
    organizeStatus: organizeStatus,
    organizeWithoutFunds: organizeWithoutFunds,
    courseStatus: courseStatus,
    turCourse: turCourse,
    takeCourseBonus: takeCourseBonus,
    reformProjects: reformProjects,
    cooperativeStatus: cooperativeStatus,
    launchCooperative: launchCooperative,
    cooperativeExecutor: cooperativeExecutor,
    cooperativeRelief: cooperativeRelief,
    pressFormatStatus: pressFormatStatus,
    pressFormatChoose: pressFormatChoose,
    addPressRestriction: addPressRestriction,
    liftPressRestriction: liftPressRestriction,
    expireAdvisorEffects: expireAdvisorEffects,
    ADVISERS: ADVISERS,
    ADVISER_ORDER: ADVISER_ORDER,
    DEPARTURE_RECIPIENT: DEPARTURE_RECIPIENT,
    ppsClub: ppsClub,
    allocateFactionSeats: allocateFactionSeats,
    ensureFactionSeats: ensureFactionSeats,
    transferMPs: transferMPs,
    departurePreview: departurePreview,
    applyDeparture: applyDeparture,
    factionDemand: factionDemand,
    describeDemand: describeDemand,
    updateFactionCases: updateFactionCases,
    factionSplitDue: factionSplitDue,
    factionSplitAccept: factionSplitAccept,
    factionSplitRefuse: factionSplitRefuse,
    factionSplitView: factionSplitView,
    unityAvailable: unityAvailable,
    unityStatus: unityStatus,
    unityChoose: unityChoose,
    unityView: unityView,
    kppRuleBroken: kppRuleBroken,
    activeAdvisers: activeAdvisers,
    adviserInPool: adviserInPool,
    advisersAvailable: advisersAvailable,
    advisersStatus: advisersStatus,
    advisersChoose: advisersChoose,
    advisersView: advisersView,
    advisersToggle: advisersToggle,
    impulse: impulse,
    advisorActionStatus: advisorActionStatus,
    advisorAction: advisorAction,
    advisorView: advisorView,
    STANCES: STANCES,
    STANCE_ORDER: STANCE_ORDER,
    FACTION_STANCE_PROFILE_ID: FACTION_STANCE_PROFILE_ID,
    PROGRAMME_AXES: PROGRAMME_AXES,
    PRIORITIES: PRIORITIES,
    stanceAvailable: stanceAvailable,
    stanceStatus: stanceStatus,
    stanceChoose: stanceChoose,
    stanceView: stanceView,
    writeProgramme: writeProgramme,
    programmeAvailable: programmeAvailable,
    programmeStatus: programmeStatus,
    programmeChoose: programmeChoose,
    programmeView: programmeView,
    programmeChangeStatus: programmeChangeStatus,
    programmeToggle: programmeToggle,
    goalFit: goalFit,
    partnerCompliance: partnerCompliance,
    internalAcceptance: internalAcceptance,
    centrumObjection: centrumObjection,
    recordTrial: recordTrial,
    resolveTrial: resolveTrial,
    successfulTrials: successfulTrials,
    kppStepStatus: kppStepStatus,
    kppAgendaAvailable: kppAgendaAvailable,
    kppStep: kppStep,
    kppView: kppView,
    bundJointAction: bundJointAction,
    TOPICS: TOPICS,
    polemicAddressees: polemicAddressees,
    democraticThreat: democraticThreat,
    strategyFactor: strategyFactor,
    matchingUnionReach: matchingUnionReach,
    cellReach: cellReach,
    campaignStatus: campaignStatus,
    campaign: campaign,
    pressInvestigationStatus: pressInvestigationStatus,
    campaignEffect: campaignEffect,
    pressInvestigationTarget: pressInvestigationTarget,
    pressInvestigation: pressInvestigation,
    mediaView: mediaView,
    audienceView: audienceView,
    settleRewards: settleRewards,
    settleBrokenPromises: settleBrokenPromises,
    afterAgreements: afterAgreements,
    partyDisplay: partyDisplay,
    sidebarDisplay: sidebarDisplay,
    agendaAvailable: agendaAvailable,
    agendaView: agendaView,
  });
}));
