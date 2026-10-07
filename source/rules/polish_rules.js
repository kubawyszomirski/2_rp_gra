// Polish chapter rules module (technical reference 20.1, Z — 0.40).
//
// Plain JavaScript without dependencies or a build step. `npm run build` copies this file to
// out/html/, the page loads it before core.js as `window.PolishRules`, and Node tests load it with
// require(). Functions calculate, validate and apply one transaction at a time; they never draw
// their own random numbers and never touch the page. Scenes store the result in the Dendry
// qualities as `Q.S`, the state tree `S` of the technical reference (2.4).
//
// docs/POLISH_IMPLEMENTATION_PLAN.md: stage 0 created the state foundation and save
// compatibility; stage 1 adds the monthly clock, action transactions, cooldowns as dates, the
// hand rules, the event queue and recorded randomness (technical reference 4.1–4.6, 17.1).
// Stage 2 adds the parliament, Senate and ballot domains (schema 3); their rules are in
// polish_institutions.js. Stage 3 adds actors, agreements, the cabinet, negotiations and cabinet
// crises (schema 4), with rules in polish_government.js. Stage 4 adds the economy and society domains
// and the list of laws (schema 5), with rules in polish_economy.js and polish_projects.js. Stage 5 adds the
// party organisations, Milicja, the union branches and the faction cases, and the cells of the electorate
// in S.society (schema 6), with rules in polish_electorate.js and polish_party.js. Stage 6 adds the records of
// strikes and of plants (schema 7), with rules in polish_unions.js. Domains that need an opening profile are added
// by the stage that takes them over, with a new schema version.
(function (root, factory) {
  'use strict';
  const rules = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = rules;
  } else {
    root.PolishRules = rules;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SCHEMA_VERSION = 8;
  const BALANCE_ID = 'balance_v0_1+economy_simple_v1';
  const SCENARIO_ID = 'normal_chapter1_v1';
  const FOUNDATION_DOMAINS = ['meta', 'turn', 'advisors', 'cooldowns', 'events', 'projects', 'rng',
    'history', 'chapter', 'scenario'];
  // Stage 2 (schema 3): parliament and Senate records, and the list of ballots (2.4).
  const INSTITUTION_DOMAINS = ['parliament', 'senate'];
  // Stage 3 (schema 4): actors and agreements; the cabinet, the open negotiation and a cabinet
  // crisis may be null (2.4).
  const GOVERNMENT_DOMAINS = ['actors', 'agreements'];
  const NULLABLE_GOVERNMENT_DOMAINS = ['cabinet', 'negotiation', 'cabinet_crisis'];
  // Stage 4 (schema 5): the economy and society (2.4, 11.1, 5.6).
  const ECONOMY_DOMAINS = ['economy', 'society'];
  // Stage 5 (schema 6): party organisations and finances, Milicja, the union branches and the faction
  // cases (2.4, 13.1–13.4, 14.1, 10.2); the cells of the electorate are in S.society.
  const PARTY_DOMAINS = ['party_orgs', 'militia', 'unions', 'faction_cases'];
  // Stage 6 (schema 7): the records of strikes with their settlements, and the records of plants (14.3, 17.12).
  const UNION_DOMAINS = ['strikes', 'enterprises'];
  // Stage 7 (schema 8): politics and society (15.1–15.3), the forces of the state (16.1–16.3) and the coup (16.8).
  const POLITICS_DOMAINS = ['politics', 'security', 'coup'];
  const COUP_PHASES = ['dormant', 'political_crisis', 'attempt_declared', 'pps_stance', 'organization_commitment', 'execution_and_transport', 'resolved'];
  // 15.2 (Z — 0.22, M10): the one owner of the authority of the Sejm is its journal; each entry counts for twelve months.
  // Z — 0.56: the silence of PPS after a speech of Piłsudski is recorded in the journal with no weight.
  const AUTHORITY_WEIGHTS = Object.freeze({law: 4, resolution: 4, failure: -6, gap: -3, breach: -5, stance_defense: 1, stance_criticism: -2,
    stance_silence: 0});
  const AUTHORITY_BASE = 55;
  // 4.4; Z — 0.60 (the user's notes of 7 X 2026): two places for each of the three decks, six in all (until 0.59 three in all).
  const HAND_SIZE = 6;
  const HAND_PER_DECK = 2;
  const DECK_TAGS = Object.freeze({party_affairs: 'main.party', govt_affairs: 'main.govt', parliament_affairs: 'main.parliament'});
  // Cards that cannot be discarded (Z — 0.60): the timed cards, the cards of the party's vision and the cards a special
  // event opens. A timed card registers the last month it can be played (registerCardDeadline).
  const TIMED_CARDS = Object.freeze(['polish_event_pils_criticism']);
  const VISION_CARDS = Object.freeze(['polish_party_direction', 'polish_party_main_opponent', 'polish_party_pils_influence',
    'polish_party_form_of_power', 'polish_party_electoral_base', 'polish_party_slavic_autonomy', 'polish_party_jewish_cooperation',
    'polish_party_ussr_position', 'polish_party_economic_program']);
  const EVENT_CARDS = Object.freeze(['polish_constitution_project', 'polish_parliament_army_oversight']);
  const cardDeadlines = {};
  const ADVISOR_COOLDOWN_MONTHS = 6; // 4.4: one shared adviser cooldown
  const TXN_SOURCES = ['main', 'advisor', 'event', 'cabinet'];
  const TXN_PHASES = ['preview', 'committed', 'settled'];

  // Event queue (4.5). Only scenes listed here can be queued; each has a category from the table
  // in 4.5. Since stage 5 the one E3 card of 10.2 replaces the three automatic PPS faction crises; it is a
  // party crisis (category 5) with one instance per faction case (Z — 0.38); the review of 1926 has the
  // category of a review date (4).
  const EVENT_DEFINITIONS = Object.freeze({
    polish_event_faction_split: Object.freeze({definition_id: 'party.faction_split', category: 5, keyed_by: 'faction_case'}),
    // Z — 0.56: the criticism of parliament (Z — 0.39: category 6) is no longer queued; it is a card of the Parliament deck.
    // Stage 7c (Z — 0.39): the cabinet crisis of 1922 is an institutional succession (2); the mobilisation after an
    // assassination a conditional crisis, always after the vacancy (5); the cult of the assassin background (6). The
    // threat to the President (B3) settles without a menu inside the presidential sequence and is not queued.
    polish_event_cabinet_1922: Object.freeze({definition_id: 'opening.cabinet_1922', category: 2, keyed_by: 'politics'}),
    polish_event_assassination_response: Object.freeze({definition_id: 'presidency.assassination_response', category: 5, keyed_by: 'politics'}),
    polish_event_niewiadomski_cult: Object.freeze({definition_id: 'society.niewiadomski_cult', category: 6, keyed_by: 'politics'}),
    // Stage 7d: the started confrontation of the coup (category 2), one instance per attempt and phase (card catalogue 9.15).
    polish_event_coup: Object.freeze({definition_id: 'coup.attempt', category: 2, keyed_by: 'coup'}),
    // Stage 6: the wage case of 1923 and the answer of the Sejm are conditional crises (category 5), one instance per
    // case and phase; E6 is part of a started strike (category 1), keyed by the strike and the settlement (Z — 0.38).
    polish_event_strike_1923: Object.freeze({definition_id: 'society.strike_1923', category: 5, keyed_by: 'strike'}),
    polish_event_strike_response: Object.freeze({definition_id: 'parliament.strike_response', category: 5, keyed_by: 'strike'}),
    polish_event_strike_rejection: Object.freeze({definition_id: 'society.strike_settlement_rejection', category: 1, keyed_by: 'strike'}),
    // Stage 4: the economic events of 17.13 (card catalogue 9.11–9.13).
    polish_event_stabilization: Object.freeze({definition_id: 'economy.stabilization', category: 5}),
    polish_event_credit_crisis: Object.freeze({definition_id: 'economy.credit_crisis', category: 5}),
    polish_event_austerity_1926: Object.freeze({definition_id: 'cabinet.austerity_1926', category: 4}),
    // Z — 0.56: the constitutional debate of December 1924 is background (category 6), once; it opens card 7.6.
    polish_event_constitution_debate: Object.freeze({definition_id: 'politics.constitution_debate', category: 6}),
    // Z — 0.57: the joint list before a Sejm election is a deadline of the lists (category 4), one instance per election
    // and month; it keeps the scene ID of card 7.7, which it replaces.
    polish_list_agreement: Object.freeze({definition_id: 'parliament.list_agreement', category: 4, keyed_by: 'election_month'}),
  });

  const isPlainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype;
  const isCount = value => Number.isInteger(value) && value >= 0;
  const isUint32 = value => Number.isInteger(value) && value >= 0 && value <= 0xffffffff;
  const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const copy = value => JSON.parse(JSON.stringify(value));

  // ---- Seeds and recorded randomness (4.6) ------------------------------------------------------

  function fnv1a(text, hash) {
    let h = hash === undefined ? 0x811c9dc5 : hash;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i) & 0xff;
      h = Math.imul(h, 0x01000193) >>> 0;
      h ^= text.charCodeAt(i) >>> 8;
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }

  // A new game's seed, derived from the Dendry generator state without drawing a number from it,
  // so the existing random sequence of the game stays unchanged (FNV-1a over the five state words).
  function seedFromRandomState(randomState) {
    if (!Array.isArray(randomState) || randomState.length === 0) {
      throw new Error('seedFromRandomState needs the Dendry random state array');
    }
    let hash = 0x811c9dc5;
    for (const word of randomState) {
      let value = word >>> 0;
      for (let i = 0; i < 4; i++) {
        hash ^= value & 0xff;
        hash = Math.imul(hash, 0x01000193) >>> 0;
        value >>>= 8;
      }
    }
    return hash >>> 0;
  }

  // U[0,1) for one challenge: Mulberry32 (Tommy Ettinger) started from an FNV-1a hash of the game
  // seed and the challenge ID. The same seed and ID always give the same value.
  function uniformFor(seed, challengeId) {
    const a = (fnv1a(challengeId, fnv1a(String(seed))) + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // roll(challenge_id) draws once, stores the result in S.rng.rolls and later returns the same value.
  function roll(S, challengeId) {
    if (typeof challengeId !== 'string' || !challengeId) throw new Error('roll needs a challenge id');
    if (Object.prototype.hasOwnProperty.call(S.rng.rolls, challengeId)) return S.rng.rolls[challengeId];
    const value = uniformFor(S.meta.seed, challengeId);
    S.rng.rolls[challengeId] = value;
    return value;
  }

  // ---- State foundation (2.4) --------------------------------------------------------------------

  // The institution domains need the opening parliament, so the new game passes them in
  // (PolishInstitutions.createInstitutionState); without it they start empty.
  function emptyInstitutions() {
    return {
      parliament: {chamber_id: null, clubs: [], transfers: [], replacements: [], speaker: null, speaker_elections: [],
        term: {sequence_after_opening: 0, opened_at: null, result_id: null}, previous_term: null, next_election: null, alliances: [],
        laws: []},
      senate: {status: 'not_constituted', total: 0, club_seats: {}, records: [], method: null, result_id: null},
      ballots: [],
    };
  }

  // The government domains need the opening cabinet and relations, so the new game passes them in
  // (PolishGovernment.createGovernmentState); without it they start empty.
  function emptyGovernment() {
    return {
      actors: {profile_id: null, relations: {}, mirror_base: {}, pps: {credibility: 50, applied: []},
        kpp_channel: {contact_open: false, opened_at: null}},
      agreements: {}, cabinet: null, negotiation: null, cabinet_crisis: null,
    };
  }

  // The economy needs the opening profile of economy_simple_v1, so the new game passes it in
  // (PolishEconomy.createEconomyState); without it the domains start with neutral readings.
  function emptyEconomy() {
    return {
      economy: {profile_id: null, currency_regime: 'marka', inflation_m: 0, real_wage: 100, output: 100, credit: 55,
        market_unemployment: 0, unemployment: 0, budget_base: 0, tax_level: 0, tax_incidence: 'broad', policies: [], budget: 0,
        business_pressure: 0, business_state: 'quiet', warning_since: null, calm_months: 0, business_cases: [], shocks: [],
        history: [], last_growth: 0, pending_package: null, packages: [], package_revision: null},
      society: {agrarian_pressure: 45, living_conditions_last: {}, rural_improvements: 0},
    };
  }

  // The party needs the opening values of the Polish fields, so the new game builds it with
  // PolishParty.attachPartyState; without it the domains start empty.
  function emptyParty() {
    return {
      party_orgs: {profile_id: null, cash: 0, dues: 2, apparatus: {level: 1, member_index: 100, worker_support0: null, union_reach0: 20},
        press: {reach: 30, credibility: 60, format: 'party_journal', popular_adopted: false, campaigns: [], restrictions: [], unpaid_months: 0,
          paid_last: true, cases: []},
        tur: {level: 0, cadres: 0, available_from: 13, active_build: null, active_course: null, prepared_campaigns: [], completed_courses: []},
        cooperatives: {projects: []}, arrears: {apparatus: 0, press: 0, tur: 0, cooperatives: 0}, last_ledger: null, mirror_base: {}},
      militia: {strength: 0, militancy: 0, stage: 1, militarized: false, militarized_once: false, fatigue: 0, arrears: 0, assignments: [],
        banned: false, repressed: false, dissent: 0, alignment: {}, unpaid_last: false},
      unions: {},
      faction_cases: {},
    };
  }

  // The reading of the authority of the Sejm at t from the journal (15.2): 55 plus the weighted entries of the last
  // twelve months, bounded 0–100. No card or event writes the authority directly.
  function authorityFromLog(log, t) {
    let value = AUTHORITY_BASE;
    for (const entry of log || []) {
      if (entry.t > t - 12 && entry.t <= t && AUTHORITY_WEIGHTS[entry.kind] !== undefined) value += AUTHORITY_WEIGHTS[entry.kind];
    }
    return Math.max(0, Math.min(100, value));
  }

  // Politics, the forces of the state and the coup start from 2.3–2.4: democracy 60, authority 55, violence 10 and a
  // dormant coup; the coup pressure starts at 0 (stage 8, P: in I 1922 Piłsudski is still the Naczelnik Państwa). The
  // forces of the synthetic profile are attached by PolishSecurity.
  function emptyPolitics() {
    return {
      politics: {profile_id: 'politics_v1', started: false, democracy: 60, parliament_authority: AUTHORITY_BASE, authority_at: 0, violence: 10,
        national_grievance: 0, institutional_log: [], cases: {}, restrictions: {}, speeches: [], episodes: [], democracy_effects: [],
        violence_episodes: [], civil_rewarded: [], cabinets_seen: [], due: {}, settled_t: null, history: []},
      security: {profile_id: null, forces: [], logistics: 0.8, police: {capacity: 50, command: 50, lawful_compliance: 50, public_trust: 50},
        army_control: {projects: []}, threats: [], known: {}, assessments: []},
      coup: {pressure: 0, phase: 'dormant', attempt_id: null, stance: null, commitments: [], round: 0, outcome: null, history: [],
        next_attempt_available_at: 1, f9: null, settlement: null, pps_contribution: null, concessions_to_pps: [], impulses: [],
        effects_complete: false},
    };
  }

  // Strikes and plants start empty in every new game (14.3, 17.12).
  function emptyUnions() {
    return {
      strikes: {seq: 0, records: {}, due: {}, wage_watch: {months_below: 0, last_case_at: null, last_checked: 0, latched: false}, inputs: null, pending_effects: []},
      enterprises: {seq: 0, records: {}},
    };
  }

  function createFoundationState(options) {
    const seed = seedFromRandomState(options && options.randomState);
    const institutions = copy((options && options.institutions) || emptyInstitutions());
    const government = copy((options && options.government) || emptyGovernment());
    const economy = copy((options && options.economy) || emptyEconomy());
    const party = emptyParty();
    const unions = emptyUnions();
    const politics = emptyPolitics();
    return {
      meta: {schema_version: SCHEMA_VERSION, balance_id: BALANCE_ID, scenario_id: SCENARIO_ID, seed: seed},
      turn: {phase: 'main', last_settled_time: 0, action_serial: 0, pending: null, discard_used: false,
        card_view: null, draw_serial: 0},
      advisors: {effects: []},
      cooldowns: {},
      events: {active: null, pending: [], resolved: {}, serial: 0},
      projects: {},
      rng: {rolls: {}},
      history: {months: [], actions: [], reasons: [], negotiations: [], cabinets: []},
      chapter: {status: 'active', reason: null, trigger_id: null, report: null, unemployment_bill: null},
      // Stage 7 (decision 1A): the dated inputs of the Normal scenario; a test of another system may switch one off.
      scenario: {profile_id: SCENARIO_ID, version: 1, npc_reviewed_time: null, inputs: {dispute_1922: true, military_case: true, niewiadomski_cult: true, chjeno_piast_1923: true, piast_split_1923: true,
        grabski_resignation_1925: true}},
      parliament: institutions.parliament,
      senate: institutions.senate,
      ballots: institutions.ballots,
      actors: government.actors,
      agreements: government.agreements,
      cabinet: government.cabinet,
      negotiation: government.negotiation,
      cabinet_crisis: government.cabinet_crisis,
      economy: economy.economy,
      society: economy.society,
      party_orgs: party.party_orgs,
      militia: party.militia,
      unions: party.unions,
      faction_cases: party.faction_cases,
      strikes: unions.strikes,
      enterprises: unions.enterprises,
      politics: politics.politics,
      security: politics.security,
      coup: politics.coup,
    };
  }

  // Plain JSON only: no functions, Date objects, cycles, NaN or Infinity (2.4).
  function jsonProblems(value, where, seen, problems) {
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) problems.push(where + ' is not a finite number');
      return;
    }
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
    if (typeof value !== 'object') {
      problems.push(where + ' has unsupported type ' + typeof value);
      return;
    }
    if (seen.has(value)) {
      problems.push(where + ' is a cyclic reference');
      return;
    }
    if (!Array.isArray(value) && !isPlainObject(value)) {
      problems.push(where + ' is not a plain object');
      return;
    }
    seen.add(value);
    for (const key of Object.keys(value)) jsonProblems(value[key], where + '.' + key, seen, problems);
    seen.delete(value);
  }

  function txnProblems(txn, where) {
    const problems = [];
    if (typeof txn.id !== 'string' || typeof txn.action_id !== 'string') problems.push(where + ' has no id or action_id');
    if (TXN_SOURCES.indexOf(txn.source) < 0) problems.push(where + '.source is ' + txn.source);
    if (TXN_PHASES.indexOf(txn.phase) < 0) problems.push(where + '.phase is ' + txn.phase);
    if (!isCount(txn.time)) problems.push(where + '.time is not a month');
    if (typeof txn.consumes_month !== 'boolean') problems.push(where + '.consumes_month is not a boolean');
    return problems;
  }

  // Returns a list of problems; an empty list means the state is valid for this schema version.
  function validateState(S) {
    const problems = [];
    if (!isPlainObject(S)) return ['S is missing or not an object'];
    for (const domain of FOUNDATION_DOMAINS.concat(INSTITUTION_DOMAINS, GOVERNMENT_DOMAINS, ECONOMY_DOMAINS, PARTY_DOMAINS, UNION_DOMAINS, POLITICS_DOMAINS)) {
      if (!isPlainObject(S[domain])) problems.push('S.' + domain + ' is missing');
    }
    if (!Array.isArray(S.ballots)) problems.push('S.ballots is missing');
    for (const domain of NULLABLE_GOVERNMENT_DOMAINS) {
      if (!Object.prototype.hasOwnProperty.call(S, domain)) problems.push('S.' + domain + ' is missing');
      else if (S[domain] !== null && !isPlainObject(S[domain])) problems.push('S.' + domain + ' is not null or an object');
    }
    if (problems.length) return problems;
    const meta = S.meta, turn = S.turn;
    if (meta.schema_version !== SCHEMA_VERSION) problems.push('S.meta.schema_version is ' + meta.schema_version + ', expected ' + SCHEMA_VERSION);
    if (typeof meta.balance_id !== 'string' || !meta.balance_id) problems.push('S.meta.balance_id is missing');
    if (typeof meta.scenario_id !== 'string' || !meta.scenario_id) problems.push('S.meta.scenario_id is missing');
    if (!isUint32(meta.seed)) problems.push('S.meta.seed is not a uint32');
    if (typeof turn.phase !== 'string') problems.push('S.turn.phase is not a string');
    if (!isCount(turn.last_settled_time)) problems.push('S.turn.last_settled_time is not a count');
    if (!isCount(turn.action_serial)) problems.push('S.turn.action_serial is not a count');
    if (!isCount(turn.draw_serial)) problems.push('S.turn.draw_serial is not a count');
    if (typeof turn.discard_used !== 'boolean') problems.push('S.turn.discard_used is not a boolean');
    if (turn.pending !== null) {
      if (!isPlainObject(turn.pending)) problems.push('S.turn.pending is not null or an object');
      else problems.push(...txnProblems(turn.pending, 'S.turn.pending'));
    }
    if (turn.card_view !== null && !isPlainObject(turn.card_view)) problems.push('S.turn.card_view is not null or an object');
    if (!Array.isArray(S.advisors.effects)) problems.push('S.advisors.effects is not a list');
    for (const id of Object.keys(S.cooldowns)) {
      if (!isCount(S.cooldowns[id])) problems.push('S.cooldowns.' + id + ' is not a month number');
    }
    if (S.events.active !== null && !isPlainObject(S.events.active)) problems.push('S.events.active is not null or an object');
    if (!Array.isArray(S.events.pending)) problems.push('S.events.pending is not a list');
    if (!isPlainObject(S.events.resolved)) problems.push('S.events.resolved is not a map');
    if (!isCount(S.events.serial)) problems.push('S.events.serial is not a count');
    if (!isPlainObject(S.rng.rolls)) problems.push('S.rng.rolls is not a map');
    for (const id of Object.keys(S.rng.rolls || {})) {
      const r = S.rng.rolls[id];
      if (typeof r === 'number' && Number.isFinite(r) && (r < 0 || r >= 1)) problems.push('S.rng.rolls.' + id + ' is outside [0, 1)');
    }
    for (const list of ['months', 'actions', 'reasons', 'negotiations', 'cabinets']) {
      if (!Array.isArray(S.history[list])) problems.push('S.history.' + list + ' is not a list');
    }
    if (!isPlainObject(S.actors.relations)) problems.push('S.actors.relations is not a map');
    for (const id of Object.keys(S.actors.relations || {})) {
      const r = S.actors.relations[id];
      if (typeof r !== 'number' || r < 0 || r > 100) problems.push('S.actors.relations.' + id + ' is outside 0–100');
    }
    if (!isPlainObject(S.actors.pps) || typeof S.actors.pps.credibility !== 'number') problems.push('S.actors.pps.credibility is missing');
    if (typeof S.chapter.status !== 'string') problems.push('S.chapter.status is not a string');
    const parliament = S.parliament;
    for (const list of ['clubs', 'transfers', 'replacements', 'speaker_elections', 'alliances', 'laws']) {
      if (!Array.isArray(parliament[list])) problems.push('S.parliament.' + list + ' is not a list');
    }
    if (parliament.speaker !== null && !isPlainObject(parliament.speaker)) problems.push('S.parliament.speaker is not null or an object');
    if (!isPlainObject(parliament.term)) problems.push('S.parliament.term is not an object');
    if (parliament.next_election !== null && !isPlainObject(parliament.next_election)) problems.push('S.parliament.next_election is not null or an object');
    if (typeof S.senate.status !== 'string') problems.push('S.senate.status is not a string');
    if (!isCount(S.senate.total)) problems.push('S.senate.total is not a count');
    if (!isPlainObject(S.senate.club_seats)) problems.push('S.senate.club_seats is not a map');
    if (!Array.isArray(S.senate.records)) problems.push('S.senate.records is not a list');
    const bill = S.chapter.unemployment_bill;
    if (bill !== null && bill !== undefined && !isPlainObject(bill)) problems.push('S.chapter.unemployment_bill is not null or an object');
    const economy = S.economy;
    for (const field of ['inflation_m', 'real_wage', 'output', 'credit', 'market_unemployment', 'unemployment', 'budget_base',
      'tax_level', 'budget', 'business_pressure']) {
      if (typeof economy[field] !== 'number') problems.push('S.economy.' + field + ' is not a number');
    }
    if (economy.tax_level < -3 || economy.tax_level > 3) problems.push('S.economy.tax_level is outside −3..3');
    if (['marka', 'stabilizing', 'zloty'].indexOf(economy.currency_regime) < 0) problems.push('S.economy.currency_regime is ' + economy.currency_regime);
    if (['quiet', 'warning', 'active'].indexOf(economy.business_state) < 0) problems.push('S.economy.business_state is ' + economy.business_state);
    for (const list of ['policies', 'shocks', 'history', 'business_cases', 'packages']) {
      if (!Array.isArray(economy[list])) problems.push('S.economy.' + list + ' is not a list');
    }
    if (typeof S.society.agrarian_pressure !== 'number') problems.push('S.society.agrarian_pressure is not a number');
    if (!isPlainObject(S.society.living_conditions_last)) problems.push('S.society.living_conditions_last is not a map');
    if (S.society.cells !== undefined) {
      if (!Array.isArray(S.society.cells)) problems.push('S.society.cells is not a list');
      else if (S.society.cells.length) {
        const mass = S.society.cells.reduce((n, cell) => n + (Number(cell.mass) || 0), 0);
        if (Math.abs(mass - 1) > 1e-6) problems.push('S.society.cells: the masses sum to ' + mass);
        for (const cell of S.society.cells) {
          if (!isPlainObject(cell.propensity)) { problems.push('S.society.cells: ' + cell.id + ' has no preferences'); continue; }
          const sum = Object.keys(cell.propensity).reduce((n, p) => n + cell.propensity[p], 0);
          if (Math.abs(sum - 100) > 1e-6) problems.push('S.society.cells: the shares of ' + cell.id + ' sum to ' + sum);
          if (['polish', 'jewish', 'other_minorities'].indexOf(cell.identity_id) < 0) problems.push('S.society.cells: ' + cell.id + ' has identity ' + cell.identity_id);
        }
      }
    }
    const orgs = S.party_orgs;
    if (typeof orgs.cash !== 'number' || orgs.cash < 0) problems.push('S.party_orgs.cash is not a non-negative number');
    if (!Number.isInteger(orgs.dues) || orgs.dues < 1 || orgs.dues > 4) problems.push('S.party_orgs.dues is outside 1–4');
    if (!isPlainObject(orgs.apparatus) || !Number.isInteger(orgs.apparatus.level) || orgs.apparatus.level < 1 || orgs.apparatus.level > 4) {
      problems.push('S.party_orgs.apparatus.level is outside 1–4');
    } else if (typeof orgs.apparatus.member_index !== 'number' || orgs.apparatus.member_index < 0 || orgs.apparatus.member_index > 150) {
      problems.push('S.party_orgs.apparatus.member_index is outside 0–150');
    }
    if (!isPlainObject(orgs.press) || !Array.isArray(orgs.press.restrictions)) problems.push('S.party_orgs.press is invalid');
    if (!isPlainObject(orgs.tur) || !Number.isInteger(orgs.tur.level) || orgs.tur.level < 0 || orgs.tur.level > 3) problems.push('S.party_orgs.tur.level is outside 0–3');
    if (!isPlainObject(orgs.cooperatives) || !Array.isArray(orgs.cooperatives.projects)) problems.push('S.party_orgs.cooperatives is invalid');
    const militia = S.militia;
    if (!Number.isInteger(militia.strength) || militia.strength < 0) problems.push('S.militia.strength is not a count');
    if (typeof militia.militancy !== 'number' || militia.militancy < 0 || militia.militancy > 1) problems.push('S.militia.militancy is outside 0–1');
    if (militia.stage !== 1 && militia.stage !== 2) problems.push('S.militia.stage is ' + militia.stage);
    if (typeof militia.fatigue !== 'number' || militia.fatigue < 0 || militia.fatigue > 100) problems.push('S.militia.fatigue is outside 0–100');
    for (const id of Object.keys(S.unions)) {
      const branch = S.unions[id];
      if (!isPlainObject(branch) || typeof branch.reach !== 'number' || branch.reach < 0 || branch.reach > 100) problems.push('S.unions.' + id + '.reach is outside 0–100');
      else if (typeof branch.fund !== 'number' || branch.fund < 0) problems.push('S.unions.' + id + '.fund is negative');
    }
    if (S.actors.pps.factions !== undefined) {
      for (const id of Object.keys(S.actors.pps.factions)) {
        const f = S.actors.pps.factions[id];
        if (typeof f.strength !== 'number' || f.strength < 0) problems.push('S.actors.pps.factions.' + id + '.strength is negative');
        if (typeof f.dissent !== 'number' || f.dissent < 0 || f.dissent > 99) problems.push('S.actors.pps.factions.' + id + '.dissent is outside 0–99');
      }
    }
    if (!isPlainObject(S.strikes.records) || !Array.isArray(S.strikes.pending_effects)) problems.push('S.strikes is invalid');
    for (const id of Object.keys(S.strikes.records || {})) {
      const rec = S.strikes.records[id];
      if (['prepared', 'negotiating', 'active', 'settlement_pending', 'ended'].indexOf(rec.status) < 0) problems.push('S.strikes.records.' + id + '.status is ' + rec.status);
    }
    if (!isPlainObject(S.enterprises.records)) problems.push('S.enterprises is invalid');
    const P = S.politics;
    if (!Array.isArray(P.institutional_log) || !isPlainObject(P.cases) || !isPlainObject(P.restrictions)) problems.push('S.politics is invalid');
    else {
      for (const entry of P.institutional_log) {
        if (AUTHORITY_WEIGHTS[entry.kind] === undefined) problems.push('S.politics.institutional_log: unknown kind ' + entry.kind);
      }
      // 15.2 (Z — 0.22): a direct write of the authority is an error; it is always the reading of the journal.
      if (P.parliament_authority !== authorityFromLog(P.institutional_log, P.authority_at)) {
        problems.push('S.politics.parliament_authority is not the reading of the institutional log');
      }
    }
    for (const field of ['democracy', 'violence']) {
      if (typeof P[field] !== 'number' || P[field] < 0 || P[field] > 100) problems.push('S.politics.' + field + ' is outside 0–100');
    }
    if (typeof S.coup.pressure !== 'number' || S.coup.pressure < 0 || S.coup.pressure > 100) problems.push('S.coup.pressure is outside 0–100');
    if (COUP_PHASES.indexOf(S.coup.phase) < 0) problems.push('S.coup.phase is ' + S.coup.phase);
    if (!Array.isArray(S.security.forces)) problems.push('S.security.forces is invalid');
    if (typeof S.scenario.profile_id !== 'string') problems.push('S.scenario.profile_id is not a string');
    if (!isCount(S.scenario.version)) problems.push('S.scenario.version is not a count');
    jsonProblems(S, 'S', new Set(), problems);
    return problems;
  }

  // A save is compatible only with the same schema version; older saves are not converted (19.3, Z — 0.40).
  function checkSave(Q) {
    if (!Q || typeof Q !== 'object') return {ok: false, problems: ['no game state']};
    if (Q.S === undefined) return {ok: false, problems: ['the save predates the Polish chapter state']};
    const problems = validateState(Q.S);
    return {ok: problems.length === 0, problems: problems};
  }

  function isSaveCompatible(Q) {
    return checkSave(Q).ok;
  }

  // ---- One monthly clock (4.1) ---------------------------------------------------------------------

  const yearOf = time => 1922 + Math.floor((time - 1) / 12);
  const monthOf = time => 1 + ((time - 1) % 12);
  const timeOf = (year, month) => 1 + 12 * (year - 1922) + (month - 1);

  // ---- Action transactions (4.3, 17.1) -------------------------------------------------------------

  function newTxn(S, time, fields) {
    S.turn.action_serial += 1;
    return Object.assign({
      id: 'txn-' + S.turn.action_serial, action_id: '', instance_id: null, source: 'main', time: time,
      input_revision: S.turn.action_serial - 1, phase: 'committed', resource_cost: {}, transfers: [],
      effects: [], cooldowns: {}, consumes_month: true, selected_options: [],
    }, fields);
  }

  function settleTxn(S, txn) {
    txn.phase = 'settled';
    S.history.actions.push(copy(txn));
    if (S.turn.pending === txn) S.turn.pending = null;
  }

  // Remaining months of a cooldown: max(0, available_at - time) (4.4).
  function cooldownRemaining(Q, scope) {
    const at = Q.S.cooldowns[scope];
    return at === undefined ? 0 : Math.max(0, at - Q.time);
  }

  function isAdvisorAvailable(Q) {
    return cooldownRemaining(Q, 'advisor') === 0;
  }

  // Fields kept for the inherited scenes and displays; written only here.
  function refreshMirrors(Q) {
    Q.advisor_action_timer = cooldownRemaining(Q, 'advisor');
  }

  // The qualities a card's opening code can change: every Q['name'] or Q.name in the compiled
  // on-arrival code of the card and of a scene it calls, plus the month counter.
  function openingKeys(game, cardId) {
    const scene = game.scenes[cardId] || {};
    const code = [].concat(scene.onArrival || []);
    if (scene.call && game.scenes[scene.call]) code.push(...[].concat(game.scenes[scene.call].onArrival || []));
    const keys = new Set(['month_actions']);
    for (const fn of code) {
      const source = (fn && (fn.source || fn.$code)) || '';
      for (const match of source.matchAll(/Q\[['"]([A-Za-z_$][\w$]*)['"]\]/g)) keys.add(match[1]);
      for (const match of source.matchAll(/Q\.([A-Za-z_$][\w$]*)/g)) keys.add(match[1]);
    }
    keys.delete('S');
    return Array.from(keys).sort();
  }

  // What a card changes when it is opened, so closing it can undo exactly that (4.3: viewing and
  // closing a card are free). Called when a card is played from the hand and when an adviser opens one.
  function beginCardView(Q, state, cardId, options) {
    const keys = (options && options.keys) || ['month_actions', cardId + '_timer'];
    const values = {}, absent = [];
    for (const key of keys) {
      const value = Q[key];
      if (value === undefined) absent.push(key);
      else if (value === null || typeof value === 'string' || typeof value === 'boolean' ||
        (typeof value === 'number' && Number.isFinite(value))) values[key] = value;
    }
    Q.S.turn.card_view = {
      card_id: cardId,
      t: Q.time,
      from_hand: !!(options && options.from_hand),
      hand_entry: options && options.hand_entry ? copy(options.hand_entry) : null,
      values: values,
      absent: absent,
      visits: state.visits[cardId] === undefined ? null : state.visits[cardId],
    };
  }

  // "Close card": when the player leaves the card from its first page without acting, restore what
  // the card recorded on opening and return a hand card to the hand. After an option has been
  // chosen, or for a card opened another way, closing is only navigation: nothing is refunded.
  function closeCard(Q, state) {
    const S = Q.S, view = S.turn.card_view, cardId = state.prevSceneId;
    if (!view) return false;
    if (view.card_id !== cardId || view.t !== Q.time) {
      // Left from a later page of the card, after an option: navigation only. The card was used.
      return false;
    }
    S.turn.card_view = null;
    for (const key of Object.keys(view.values)) Q[key] = view.values[key];
    for (const key of view.absent) delete Q[key];
    if (view.visits === null) delete state.visits[cardId];
    else state.visits[cardId] = view.visits;
    if (view.from_hand && view.hand_entry) {
      const hand = state.currentHands.main || (state.currentHands.main = []);
      if (!hand.some(card => card.id === cardId) && hand.length < HAND_SIZE) hand.push(view.hand_entry);
    }
    S.history.reasons.push({t: Q.time, kind: 'close', card: cardId});
    return true;
  }

  // One adviser action, called by every Polish adviser option (call: polish_advisor_commit). It is
  // final once chosen: all advisers wait until t+6 (4.4). An action that opens a card replaces the
  // time cost of that one step: it costs no month (4.3; test "Jedno przekierowanie").
  function commitAdvisorAction(Q, state, game) {
    const S = Q.S, t = Q.time, sceneId = state.sceneId;
    if (S.turn.pending && S.turn.pending.phase === 'committed') {
      throw new Error('commitAdvisorAction: ' + S.turn.pending.action_id + ' is still pending');
    }
    if (!isAdvisorAvailable(Q)) throw new Error('commitAdvisorAction: advisers are on cooldown');
    const scene = game.scenes[sceneId];
    const target = ((scene && scene.goTo) || []).map(goTo => goTo.id)
      .filter(id => game.scenes[id] && game.scenes[id].isCard)[0] || null;
    const parts = sceneId.split('.');
    const txn = newTxn(S, t, {
      action_id: 'advisor.' + sceneId, source: 'advisor', consumes_month: false,
      cooldowns: {advisor: t + ADVISOR_COOLDOWN_MONTHS},
      advisor_id: parts[0], subaction_id: parts.slice(1).join('.'),
    });
    S.cooldowns.advisor = t + ADVISOR_COOLDOWN_MONTHS;
    Q.advisor_action_timer = ADVISOR_COOLDOWN_MONTHS;
    if (target) {
      txn.redirect = {card: target, month_actions_before: Q.month_actions || 0};
      beginCardView(Q, state, target, {from_hand: false, keys: openingKeys(game, target)});
    }
    S.turn.pending = txn;
    return txn;
  }

  // The adviser transaction whose opened card has not yet used its one step (4.3, 10.4.3).
  function advisorStepPending(Q) {
    const pending = Q.S && Q.S.turn.pending;
    return !!(pending && pending.phase === 'committed' && pending.source === 'advisor' && pending.redirect && !pending.redirect.action_id);
  }

  // A main action can be committed: the month's action is unused, or a card opened by an adviser still
  // has its one free step.
  function mainActionAvailable(Q) {
    return advisorStepPending(Q) || (!(Q.S && Q.S.turn.pending && Q.S.turn.pending.phase === 'committed') && (Q.month_actions || 0) < 1);
  }

  // One main action of a new Polish card, committed when the player confirms it; opening and
  // closing the card cost nothing (4.3). It consumes the month and is settled once in post_event.
  // In a card opened by an adviser the one step belongs to the adviser transaction and costs no month.
  function commitMainAction(Q, actionId, fields) {
    const S = Q.S;
    if (advisorStepPending(Q)) {
      const pending = S.turn.pending;
      pending.redirect.action_id = actionId;
      pending.redirect.fields = copy(fields || {});
      return pending;
    }
    if (S.turn.pending && S.turn.pending.phase === 'committed') {
      throw new Error('commitMainAction: ' + S.turn.pending.action_id + ' is still pending');
    }
    if ((Q.month_actions || 0) >= 1) throw new Error('commitMainAction: the main action of this month is already used');
    const txn = newTxn(S, Q.time, Object.assign({action_id: actionId, source: 'main', consumes_month: true}, fields || {}));
    S.turn.pending = txn;
    Q.month_actions = (Q.month_actions || 0) + 1;
    return txn;
  }

  // ---- Settling a month once (4.2) -----------------------------------------------------------------

  // Called on every visit of post_event. First settles a pending adviser action (0 T): the month
  // charged by a card it opened is waived. Then, if a month-consuming action was taken in month t,
  // moves the clock to t+1 once and returns the settlement; otherwise returns null. Browsing,
  // loading a save or leaving a menu therefore never settles a month twice.
  function beginMonthSettlement(Q, state) {
    const S = Q.S, turn = S.turn, t = Q.time;
    const pending = turn.pending;
    if (pending && pending.phase === 'committed' && !pending.consumes_month) {
      if (pending.redirect) {
        const charge = Math.max(0, (Q.month_actions || 0) - pending.redirect.month_actions_before);
        Q.month_actions = (Q.month_actions || 0) - charge;
        pending.redirect.month_charge_waived = charge;
      }
      settleTxn(S, pending);
    }
    const usedCard = turn.card_view ? turn.card_view.card_id : null;
    turn.card_view = null;
    const main = turn.pending && turn.pending.phase === 'committed' && turn.pending.consumes_month ? turn.pending : null;
    if (!main && (Q.month_actions || 0) < 1) return null;
    if (turn.last_settled_time >= t) {
      S.history.reasons.push({t: t, kind: 'second_settlement_refused'});
      Q.month_actions = 0;
      return null;
    }
    const txn = main || newTxn(S, t, {
      action_id: 'legacy.' + (usedCard || (state && state.prevTopSceneId) || 'unknown'), source: 'main',
    });
    turn.last_settled_time = t;
    Q.time = t + 1;
    Q.month = monthOf(t + 1);
    Q.year = yearOf(t + 1);
    Q.month_actions = 0;
    turn.discard_used = false;
    settleTxn(S, txn);
    return {t: t, txn_id: txn.id, action_id: txn.action_id};
  }

  // One history record of period t after the month's settlement code has run (4.2, step 7).
  function completeMonthSettlement(Q, settlement) {
    if (settlement) Q.S.history.months.push({t: settlement.t, txn_id: settlement.txn_id, action_id: settlement.action_id});
  }

  // ---- Hand (4.4) --------------------------------------------------------------------------------

  const handCards = state => (state.currentHands && state.currentHands.main) || [];

  function handCardId(state, index) {
    const card = handCards(state)[index];
    return card ? card.id : null;
  }

  // The free discard of this month is still unused (the card offering it stays visible).
  function discardAvailable(Q) {
    return !!Q.S && !Q.S.turn.discard_used;
  }

  function canDiscard(Q, state) {
    return discardAvailable(Q) && handCards(state).length > 0;
  }

  // The deck a card is drawn from, by its tag (Z — 0.60).
  function deckOfCard(game, cardId) {
    const scene = game && game.scenes && game.scenes[cardId];
    for (const tag of (scene && scene.tags) || []) if (DECK_TAGS[tag]) return DECK_TAGS[tag];
    return null;
  }

  function handOfDeck(state, game, deckId) {
    return handCards(state).filter(card => (card.deck || deckOfCard(game, card.id)) === deckId);
  }

  // A module registers the last month in which its timed card can be played (Z — 0.60).
  function registerCardDeadline(cardId, fn) {
    cardDeadlines[cardId] = fn;
  }

  function cardDeadline(Q, cardId) {
    const fn = cardDeadlines[cardId];
    const t = fn ? fn(Q) : null;
    return typeof t === 'number' ? t : null;
  }

  // Z — 0.60: a card is discarded on the card itself; once a month, and never a timed card, a card of the party's vision or a
  // card opened by a special event.
  function discardStatus(Q, state, cardId) {
    const no = reason => ({available: false, reason: reason});
    if (!Q.S) return no('');
    if (TIMED_CARDS.indexOf(cardId) >= 0) return no(L('A timed card cannot be discarded; it leaves the hand when its time ends.',
      'Karty czasowej nie można odrzucić; zniknie z ręki po swoim terminie.'));
    if (VISION_CARDS.indexOf(cardId) >= 0) return no(L('A card of the party’s vision cannot be discarded: play it to confirm or change the line.',
      'Karty wizji partii nie można odrzucić: zagraj ją, aby potwierdzić albo zmienić linię.'));
    if (EVENT_CARDS.indexOf(cardId) >= 0) return no(L('A card opened by a special event cannot be discarded.',
      'Karty otwartej przez specjalne wydarzenie nie można odrzucić.'));
    if (Q.S.turn.discard_used) return no(L('A card has already been discarded this month.', 'W tym miesiącu odrzucono już kartę.'));
    if (!handCards(state).some(card => card.id === cardId)) return no(L('The card is not in the hand.', 'Tej karty nie ma na ręce.'));
    return {available: true, reason: ''};
  }

  function discardCard(Q, state, cardId) {
    const status = discardStatus(Q, state, cardId);
    if (!status.available) throw new Error('discardCard: ' + status.reason);
    return discardFromHand(Q, state, handCards(state).findIndex(card => card.id === cardId));
  }

  function refreshHandMirrors(Q, state) {
    Q.pl_hand_count = handCards(state).length;
    for (let i = 0; i < HAND_SIZE; i++) {
      const card = handCards(state)[i];
      Q['pl_hand_card_' + (i + 1)] = card ? String(card.title || card.id) : '';
    }
  }

  // One free voluntary discard a month: the card leaves the hand without effect or cooldown; the
  // counter resets only when the month changes (4.4).
  function discardFromHand(Q, state, index) {
    if (!canDiscard(Q, state)) throw new Error('discardFromHand: no free discard left this month');
    const hand = handCards(state);
    const card = hand[index];
    if (!card) throw new Error('discardFromHand: no card in place ' + (index + 1));
    hand.splice(index, 1);
    Q.S.turn.discard_used = true;
    Q.S.history.reasons.push({t: Q.time, kind: 'discard', card: card.id});
    return card.id;
  }

  // A drawn card: uniform among the legal cards sorted by ID, with a recorded roll (4.4, 4.6), so
  // the result does not depend on the order of scenes in the build.
  function pickCard(Q, legalCards, deckId) {
    if (!legalCards.length) return null;
    const S = Q.S;
    const sorted = legalCards.slice().sort(byId);
    S.turn.draw_serial += 1;
    const r = roll(S, 'draw:' + deckId + ':t' + Q.time + ':' + S.turn.draw_serial);
    return sorted[Math.min(sorted.length - 1, Math.floor(r * sorted.length))];
  }

  // Projects and required responses stay outside the three hand places (4.4).
  function agendaItems(S) {
    return Object.keys(S.projects).sort()
      .map(id => S.projects[id])
      .filter(project => project && project.status !== 'completed' && project.status !== 'cancelled' && project.status !== 'repealed')
      .map(project => ({id: project.id, kind: 'project', status: project.status}));
  }

  // ---- Event queue (4.5) -------------------------------------------------------------------------

  // Called on every visit of post_event with the Polish event scenes that are due now. An event the
  // router entered on an earlier visit has finished, so it is resolved first; one that was chosen
  // but not entered, because an election or succession sequence came first, is chosen again. Then
  // the next due event is chosen by category and stable ID; every due event is resolved before the
  // next ordinary action.
  function nextEvent(Q, dueSceneIds, definitions) {
    const registry = definitions || EVENT_DEFINITIONS; // a test can pass its own definitions
    const events = Q.S.events, t = Q.time;
    if (events.active) {
      if (events.active.phase === 'entered') {
        events.resolved[events.active.instance_key] = {id: events.active.id, definition_id: events.active.definition_id, resolved_at: t};
      }
      events.active = null;
    }
    const candidates = [];
    for (const sceneId of dueSceneIds) {
      const definition = registry[sceneId];
      if (!definition) throw new Error('nextEvent: ' + sceneId + ' has no queue category (4.5)');
      // A definition with instances (E3, the strike events) is keyed by the case it answers, so a closed case never returns.
      const key = definition.keyed_by === 'faction_case' ? sceneId + ':' + ((Q.S.faction_cases && Q.S.faction_cases.due_case_id) || '') :
        definition.keyed_by === 'strike' ? sceneId + ':' + ((Q.S.strikes && Q.S.strikes.due && Q.S.strikes.due[sceneId]) || '') :
        definition.keyed_by === 'politics' ? sceneId + ':' + ((Q.S.politics && Q.S.politics.due && Q.S.politics.due[sceneId]) || '') :
        definition.keyed_by === 'coup' ? sceneId + ':' + ((Q.S.coup && Q.S.coup.attempt_id) || '') + ':' + ((Q.S.coup && Q.S.coup.phase) || '') :
        definition.keyed_by === 'election_month' ? sceneId + ':' + ((Q.S.parliament && Q.S.parliament.next_election && Q.S.parliament.next_election.id) || '') + ':' + t :
        sceneId;
      if (events.resolved[key]) continue;
      candidates.push({id: sceneId, key: key, definition: definition});
    }
    candidates.sort((a, b) => a.definition.category - b.definition.category || byId(a, b));
    events.pending = candidates.slice(1).map(candidate => candidate.id);
    if (!candidates.length) return null;
    const chosen = candidates[0];
    events.serial += 1;
    events.active = {
      id: 'ev-' + events.serial, definition_id: chosen.definition.definition_id, instance_key: chosen.key,
      due_date: t, priority: chosen.definition.category, phase: 'active', entered_at: t, context_snapshot: {},
      payload: {}, choices: [], roll_ids: [], applied_effect_ids: [], resolution: null,
    };
    return chosen.id;
  }

  // Called by the event router when it enters the chosen event.
  function markEventEntered(Q) {
    if (Q.S && Q.S.events.active) Q.S.events.active.phase = 'entered';
  }

  // ---- Language of the player-facing text (Polish version of 4 October 2026, decisions 2A, 3A, 5A and 6A).
  // The page sets it from the player's choice (out/html/game.js); it is a setting of the browser, not part of a save.
  // English is the default, so the rules and the tests behave as before.
  let language = 'en';
  function setLanguage(lang) {
    language = lang === 'pl' ? 'pl' : 'en';
    return language;
  }
  function getLanguage() {
    return language;
  }
  // Runs fn with the texts of one language and restores the current one: a record of S that keeps a displayed text
  // keeps its English form (decision 5A).
  function inLanguage(lang, fn) {
    const previous = language;
    setLanguage(lang);
    try {
      return fn();
    } finally {
      language = previous;
    }
  }
  // Effect numbers in the descriptions of choices (Z — 0.53). A description names an effect in words and gives its
  // size in a parenthesis that opens with a sign or ×, right after the word: "the relation improves (+5)". The page
  // wraps such parentheses so that the Options setting "Numbers in choices" can hide them (hidden by default). Costs
  // (resources, budget, the month's action) and requirements are written outside them and always stay visible.
  const EFFECT_NUMBERS = /\s*\([+\-−±×][^()]*\)/g;
  function markEffectNumbers(text) {
    return typeof text === 'string' ? text.replace(EFFECT_NUMBERS, m => '<span class="pl-fx">' + m + '</span>') : text;
  }
  function withoutEffectNumbers(text) {
    return typeof text === 'string' ? text.replace(EFFECT_NUMBERS, '') : text;
  }
  // The text in the current language: the English text, or the Polish text written next to it (decision 2A).
  function L(en, pl) {
    return language === 'pl' && typeof pl === 'string' ? pl : en;
  }
  // Texts stored in the records of S stay in English (decision 5A). A module registers how to translate the texts it
  // stores; storedText() applies the first translation that matches, in the current language, when a text is shown.
  const storedTranslators = [];
  function registerStoredText(translate) {
    storedTranslators.push(translate);
  }
  function storedText(text) {
    if (language !== 'pl' || typeof text !== 'string' || !text) return text;
    for (const translate of storedTranslators) {
      const out = translate(text);
      if (typeof out === 'string' && out !== text) return out;
    }
    return text;
  }
  // The Polish noun form after a number: 1 miesiąc, 2–4 miesiące (but 12–14 miesięcy), 5 and more miesięcy; a
  // fraction takes the genitive singular (1,5 miesiąca), which is `fraction` or else `few`.
  function plural(n, one, few, many, fraction) {
    const a = Math.abs(n);
    if (!Number.isInteger(a)) return fraction !== undefined ? fraction : few;
    if (a === 1) return one;
    const d = a % 10, h = a % 100;
    return d >= 2 && d <= 4 && !(h >= 12 && h <= 14) ? few : many;
  }
  // Costs in words in the descriptions of choices (Z — 0.53): party resources and budget units without the
  // abbreviations R and B. form: 'nom' (2 jednostki), 'acc' (kosztuje 1 jednostkę) or 'gen' (wymaga 2 jednostek); a
  // fraction takes the genitive singular (0,5 jednostki). English: 1 resource, 2 resources; 1 budget unit.
  function units(n, kind, form) {
    const value = Math.round(Number(n) * 100) / 100;
    const text = num(value);
    if (language !== 'pl') return text + (kind === 'budget' ? ' budget unit' : ' resource') + (value === 1 ? '' : 's');
    let word;
    if (!Number.isInteger(value)) word = 'jednostki';
    else if (form === 'gen') word = Math.abs(value) === 1 ? 'jednostki' : 'jednostek';
    else if (Math.abs(value) === 1) word = form === 'acc' ? 'jednostkę' : 'jednostka';
    else word = plural(value, 'jednostka', 'jednostki', 'jednostek');
    return text + ' ' + word + (kind === 'budget' ? ' budżetu' : ' środków');
  }
  // A number for display (decision 6A): fixed digits, with a decimal comma in Polish.
  function num(value, digits) {
    const text = typeof digits === 'number' ? Number(value).toFixed(digits) : String(value);
    return language === 'pl' ? text.replace('.', ',') : text;
  }
  const MONTHS_EN = Object.freeze(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
    'October', 'November', 'December']);
  const MONTHS_PL = Object.freeze(['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień',
    'październik', 'listopad', 'grudzień']);
  const MONTHS_PL_GENITIVE = Object.freeze(['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia',
    'września', 'października', 'listopada', 'grudnia']);
  const MONTHS_PL_LOCATIVE = Object.freeze(['styczniu', 'lutym', 'marcu', 'kwietniu', 'maju', 'czerwcu', 'lipcu', 'sierpniu',
    'wrześniu', 'październiku', 'listopadzie', 'grudniu']);
  // 'March 1926' for a game time; in Polish the case the sentence needs: 'nom' marzec 1926 (the default), 'gen' (od)
  // marca 1926, 'loc' (w) marcu 1926.
  function monthYear(t, form) {
    const m = monthOf(t);
    if (language !== 'pl') return MONTHS_EN[m - 1] + ' ' + yearOf(t);
    const names = form === 'gen' ? MONTHS_PL_GENITIVE : form === 'loc' ? MONTHS_PL_LOCATIVE : MONTHS_PL;
    return names[m - 1] + ' ' + yearOf(t);
  }
  // 'November 1922' or 'listopad 1922' for an ISO month or day (YYYY-MM or YYYY-MM-DD); other text is returned unchanged.
  function monthText(iso) {
    const parts = String(iso || '').split('-').map(Number);
    if (parts.length < 2 || parts.slice(0, 2).some(x => !Number.isFinite(x))) return String(iso || '');
    return (language === 'pl' ? MONTHS_PL : MONTHS_EN)[parts[1] - 1] + ' ' + parts[0];
  }
  // '19 February 1928' or '19 lutego 1928' for an ISO date (YYYY-MM-DD); other text is returned unchanged.
  function dateText(iso) {
    const parts = String(iso || '').split('-').map(Number);
    if (parts.length !== 3 || parts.some(x => !Number.isFinite(x))) return String(iso || '');
    return parts[2] + ' ' + (language === 'pl' ? MONTHS_PL_GENITIVE : MONTHS_EN)[parts[1] - 1] + ' ' + parts[0];
  }

  return Object.freeze({
    SCHEMA_VERSION: SCHEMA_VERSION,
    BALANCE_ID: BALANCE_ID,
    SCENARIO_ID: SCENARIO_ID,
    FOUNDATION_DOMAINS: Object.freeze(FOUNDATION_DOMAINS.slice()),
    INSTITUTION_DOMAINS: Object.freeze(INSTITUTION_DOMAINS.concat(['ballots'])),
    GOVERNMENT_DOMAINS: Object.freeze(GOVERNMENT_DOMAINS.concat(NULLABLE_GOVERNMENT_DOMAINS)),
    ECONOMY_DOMAINS: Object.freeze(ECONOMY_DOMAINS.slice()),
    PARTY_DOMAINS: Object.freeze(PARTY_DOMAINS.slice()),
    UNION_DOMAINS: Object.freeze(UNION_DOMAINS.slice()),
    POLITICS_DOMAINS: Object.freeze(POLITICS_DOMAINS.slice()),
    COUP_PHASES: Object.freeze(COUP_PHASES.slice()),
    AUTHORITY_WEIGHTS: AUTHORITY_WEIGHTS,
    authorityFromLog: authorityFromLog,
    HAND_SIZE: HAND_SIZE,
    ADVISOR_COOLDOWN_MONTHS: ADVISOR_COOLDOWN_MONTHS,
    EVENT_DEFINITIONS: EVENT_DEFINITIONS,
    seedFromRandomState: seedFromRandomState,
    roll: roll,
    createFoundationState: createFoundationState,
    validateState: validateState,
    checkSave: checkSave,
    isSaveCompatible: isSaveCompatible,
    yearOf: yearOf,
    monthOf: monthOf,
    timeOf: timeOf,
    cooldownRemaining: cooldownRemaining,
    isAdvisorAvailable: isAdvisorAvailable,
    refreshMirrors: refreshMirrors,
    openingKeys: openingKeys,
    beginCardView: beginCardView,
    closeCard: closeCard,
    commitAdvisorAction: commitAdvisorAction,
    commitMainAction: commitMainAction,
    advisorStepPending: advisorStepPending,
    mainActionAvailable: mainActionAvailable,
    beginMonthSettlement: beginMonthSettlement,
    completeMonthSettlement: completeMonthSettlement,
    handCardId: handCardId,
    discardAvailable: discardAvailable,
    canDiscard: canDiscard,
    refreshHandMirrors: refreshHandMirrors,
    discardFromHand: discardFromHand,
    HAND_PER_DECK: HAND_PER_DECK,
    TIMED_CARDS: TIMED_CARDS,
    VISION_CARDS: VISION_CARDS,
    EVENT_CARDS: EVENT_CARDS,
    deckOfCard: deckOfCard,
    handOfDeck: handOfDeck,
    registerCardDeadline: registerCardDeadline,
    cardDeadline: cardDeadline,
    discardStatus: discardStatus,
    discardCard: discardCard,
    pickCard: pickCard,
    agendaItems: agendaItems,
    nextEvent: nextEvent,
    markEventEntered: markEventEntered,
    setLanguage: setLanguage,
    inLanguage: inLanguage,
    getLanguage: getLanguage,
    L: L,
    markEffectNumbers: markEffectNumbers,
    withoutEffectNumbers: withoutEffectNumbers,
    registerStoredText: registerStoredText,
    storedText: storedText,
    plural: plural,
    num: num,
    units: units,
    monthYear: monthYear,
    dateText: dateText,
    monthText: monthText,
    MONTHS_EN: MONTHS_EN,
    MONTHS_PL: MONTHS_PL,
    MONTHS_PL_GENITIVE: MONTHS_PL_GENITIVE,
    MONTHS_PL_LOCATIVE: MONTHS_PL_LOCATIVE,
  });
}));
