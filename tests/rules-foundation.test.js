const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

// Unit tests of the rules module (technical reference 2.4, 19.3, 20.1; implementation plan, stage 0).
// They load the source file directly and never start the game.
const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'source', 'rules', 'polish_rules.js');
const rules = require(SOURCE);
const randomState = [1922, 11, 5, 444, 223];

test('the rules module loads without a browser and exposes the current schema version', () => {
  assert.equal(typeof globalThis.window, 'undefined');
  assert.equal(rules.SCHEMA_VERSION, 8, 'stage 7 added politics, the forces of the state and the coup');
  assert.equal(rules.BALANCE_ID, 'balance_v0_1+economy_simple_v1');
  assert.equal(rules.SCENARIO_ID, 'normal_chapter1_v1');
  assert.ok(Object.isFrozen(rules));
  assert.deepEqual([...rules.FOUNDATION_DOMAINS],
    ['meta', 'turn', 'advisors', 'cooldowns', 'events', 'projects', 'rng', 'history', 'chapter', 'scenario']);
  assert.deepEqual([...rules.INSTITUTION_DOMAINS], ['parliament', 'senate', 'ballots']);
  assert.deepEqual([...rules.GOVERNMENT_DOMAINS], ['actors', 'agreements', 'cabinet', 'negotiation', 'cabinet_crisis']);
  assert.deepEqual([...rules.ECONOMY_DOMAINS], ['economy', 'society']);
  assert.deepEqual([...rules.PARTY_DOMAINS], ['party_orgs', 'militia', 'unions', 'faction_cases']);
  assert.deepEqual([...rules.UNION_DOMAINS], ['strikes', 'enterprises']);
  assert.deepEqual([...rules.POLITICS_DOMAINS], ['politics', 'security', 'coup']);
});

test('the new-game state follows the domain register in 2.4', () => {
  const S = rules.createFoundationState({ randomState });
  assert.deepEqual(S, {
    meta: { schema_version: 8, balance_id: 'balance_v0_1+economy_simple_v1', scenario_id: 'normal_chapter1_v1', seed: S.meta.seed },
    turn: { phase: 'main', last_settled_time: 0, action_serial: 0, pending: null, discard_used: false, card_view: null, draw_serial: 0 },
    advisors: { effects: [] },
    cooldowns: {},
    events: { active: null, pending: [], resolved: {}, serial: 0 },
    projects: {},
    rng: { rolls: {} },
    history: { months: [], actions: [], reasons: [], negotiations: [], cabinets: [] },
    chapter: { status: 'active', reason: null, trigger_id: null, report: null, unemployment_bill: null },
    scenario: { profile_id: 'normal_chapter1_v1', version: 1, npc_reviewed_time: null, inputs: { dispute_1922: true, military_case: true, niewiadomski_cult: true } },
    // Without the opening parliament the institution domains start empty; a new game passes them in.
    parliament: { chamber_id: null, clubs: [], transfers: [], replacements: [], speaker: null, speaker_elections: [],
      term: { sequence_after_opening: 0, opened_at: null, result_id: null }, previous_term: null, next_election: null, alliances: [],
      laws: [] },
    senate: { status: 'not_constituted', total: 0, club_seats: {}, records: [], method: null, result_id: null },
    ballots: [],
    // Without the opening relations and cabinet the government domains start empty.
    actors: { profile_id: null, relations: {}, mirror_base: {}, pps: { credibility: 50, applied: [] },
      kpp_channel: { contact_open: false, opened_at: null } },
    agreements: {}, cabinet: null, negotiation: null, cabinet_crisis: null,
    // Without the opening profile of economy_simple_v1 the economy starts with neutral readings.
    economy: { profile_id: null, currency_regime: 'marka', inflation_m: 0, real_wage: 100, output: 100, credit: 55,
      market_unemployment: 0, unemployment: 0, budget_base: 0, tax_level: 0, tax_incidence: 'broad', policies: [], budget: 0,
      business_pressure: 0, business_state: 'quiet', warning_since: null, calm_months: 0, business_cases: [], shocks: [],
      history: [], last_growth: 0, pending_package: null, packages: [], package_revision: null },
    society: { agrarian_pressure: 45, living_conditions_last: {}, rural_improvements: 0 },
    // Without the opening values of the party (PolishParty.attachPartyState) its domains start neutral.
    party_orgs: { profile_id: null, cash: 0, dues: 2, apparatus: { level: 1, member_index: 100, worker_support0: null, union_reach0: 20 },
      press: { reach: 30, credibility: 60, format: 'party_journal', popular_adopted: false, campaigns: [], restrictions: [], unpaid_months: 0,
        paid_last: true, cases: [] },
      tur: { level: 0, cadres: 0, available_from: 13, active_build: null, active_course: null, prepared_campaigns: [], completed_courses: [] },
      cooperatives: { projects: [] }, arrears: { apparatus: 0, press: 0, tur: 0, cooperatives: 0 }, last_ledger: null, mirror_base: {} },
    militia: { strength: 0, militancy: 0, stage: 1, militarized: false, militarized_once: false, fatigue: 0, arrears: 0, assignments: [],
      banned: false, repressed: false, dissent: 0, alignment: {}, unpaid_last: false },
    unions: {},
    faction_cases: {},
    // Stage 6: no strike and no plant is recorded in a new game (14.3, 17.12).
    strikes: { seq: 0, records: {}, due: {}, wage_watch: { months_below: 0, last_case_at: null, last_checked: 0 }, inputs: null, pending_effects: [] },
    enterprises: { seq: 0, records: {} },
    // Stage 7: democracy 60, authority 55 (the reading of an empty journal), violence 10, pressure 10 (2.3–2.4).
    politics: { profile_id: 'politics_v1', started: false, democracy: 60, parliament_authority: 55, authority_at: 0, violence: 10,
      national_grievance: 0, institutional_log: [], cases: {}, restrictions: {}, speeches: [], episodes: [], democracy_effects: [],
      violence_episodes: [], civil_rewarded: [], cabinets_seen: [], due: {}, settled_t: null, history: [] },
    security: { profile_id: null, forces: [], logistics: 0.8, police: { capacity: 50, command: 50, lawful_compliance: 50, public_trust: 50 },
      army_control: { projects: [] }, threats: [], known: {}, assessments: [] },
    coup: { pressure: 10, phase: 'dormant', attempt_id: null, stance: null, commitments: [], round: 0, outcome: null, history: [],
      next_attempt_available_at: 1, f9: null, settlement: null, pps_contribution: null, concessions_to_pps: [], impulses: [],
      effects_complete: false },
  });
  assert.deepEqual(JSON.parse(JSON.stringify(S)), S, 'plain JSON');
  assert.deepEqual(rules.validateState(S), []);
});

test('the seed reads the generator state without drawing from it', () => {
  const state = randomState.slice();
  const seed = rules.seedFromRandomState(state);
  assert.deepEqual(state, randomState, 'the generator state is not changed');
  assert.equal(rules.seedFromRandomState(randomState.slice()), seed, 'same state, same seed');
  assert.ok(Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff, 'uint32');
  const others = [[1923, 11, 5, 444, 223], [1922, 11, 5, 444, 224], [0, 0, 0, 0, 0], [-1, -1, -1, -1, -1]]
    .map(rules.seedFromRandomState);
  assert.equal(new Set([seed, ...others]).size, 5, 'different states give different seeds');
  assert.throws(() => rules.seedFromRandomState(undefined), /random state/);
  assert.throws(() => rules.createFoundationState({}), /random state/);
});

test('validation reports missing domains, a wrong version and values that are not plain JSON', () => {
  const valid = () => rules.createFoundationState({ randomState });
  assert.deepEqual(rules.validateState(undefined), ['S is missing or not an object']);
  const noTurn = valid(); delete noTurn.turn;
  assert.deepEqual(rules.validateState(noTurn), ['S.turn is missing']);
  const version = valid(); version.meta.schema_version = 1;
  assert.deepEqual(rules.validateState(version), ['S.meta.schema_version is 1, expected 8']);
  const noActors = valid(); delete noActors.actors;
  assert.deepEqual(rules.validateState(noActors), ['S.actors is missing']);
  const noCabinet = valid(); delete noCabinet.cabinet;
  assert.deepEqual(rules.validateState(noCabinet), ['S.cabinet is missing']);
  const badRelation = valid(); badRelation.actors.relations.zln = 120;
  assert.deepEqual(rules.validateState(badRelation), ['S.actors.relations.zln is outside 0–100']);
  const noSenate = valid(); delete noSenate.senate;
  assert.deepEqual(rules.validateState(noSenate), ['S.senate is missing']);
  const noBallots = valid(); delete noBallots.ballots;
  assert.deepEqual(rules.validateState(noBallots), ['S.ballots is missing']);
  const seed = valid(); seed.meta.seed = -1;
  assert.deepEqual(rules.validateState(seed), ['S.meta.seed is not a uint32']);
  const notANumber = valid(); notANumber.rng.rolls.first = NaN;
  assert.deepEqual(rules.validateState(notANumber), ['S.rng.rolls.first is not a finite number']);
  const withFunction = valid(); withFunction.projects.p = { apply() {} };
  assert.deepEqual(rules.validateState(withFunction), ['S.projects.p.apply has unsupported type function']);
  const withDate = valid(); withDate.history.months.push(new Date(0));
  assert.deepEqual(rules.validateState(withDate), ['S.history.months.0 is not a plain object']);
  const cyclic = valid(); cyclic.projects.self = cyclic.projects;
  assert.deepEqual(rules.validateState(cyclic), ['S.projects.self is a cyclic reference']);
  const cooldown = valid(); cooldown.cooldowns['advisor.perl'] = 1.5;
  assert.deepEqual(rules.validateState(cooldown), ['S.cooldowns.advisor.perl is not a month number']);
});

test('a save is compatible only with the current schema (19.3)', () => {
  const S = rules.createFoundationState({ randomState });
  assert.deepEqual(rules.checkSave(undefined), { ok: false, problems: ['no game state'] });
  assert.deepEqual(rules.checkSave({ started: 1 }), { ok: false, problems: ['the save predates the Polish chapter state'] });
  assert.deepEqual(rules.checkSave({ S }), { ok: true, problems: [] });
  const newer = JSON.parse(JSON.stringify(S)); newer.meta.schema_version = 9;
  assert.equal(rules.isSaveCompatible({ S: newer }), false);
  const stage6 = JSON.parse(JSON.stringify(S)); stage6.meta.schema_version = 7;
  for (const domain of ['politics', 'security', 'coup']) delete stage6[domain];
  assert.equal(rules.isSaveCompatible({ S: stage6 }), false, 'a stage 6 save needs a new game');
  const stage5 = JSON.parse(JSON.stringify(S)); stage5.meta.schema_version = 6;
  for (const domain of ['strikes', 'enterprises']) delete stage5[domain];
  assert.equal(rules.isSaveCompatible({ S: stage5 }), false, 'a stage 5 save needs a new game');
  const stage4 = JSON.parse(JSON.stringify(S)); stage4.meta.schema_version = 5;
  for (const domain of ['party_orgs', 'militia', 'unions', 'faction_cases']) delete stage4[domain];
  assert.equal(rules.isSaveCompatible({ S: stage4 }), false, 'a stage 4 save needs a new game');
  const stage3 = JSON.parse(JSON.stringify(S)); stage3.meta.schema_version = 4;
  delete stage3.economy; delete stage3.society;
  assert.equal(rules.isSaveCompatible({ S: stage3 }), false, 'a stage 3 save needs a new game');
  const stage2 = JSON.parse(JSON.stringify(S)); stage2.meta.schema_version = 3;
  for (const domain of ['actors', 'agreements', 'cabinet', 'negotiation', 'cabinet_crisis']) delete stage2[domain];
  assert.equal(rules.isSaveCompatible({ S: stage2 }), false, 'a stage 2 save needs a new game');
  const stage1 = JSON.parse(JSON.stringify(S)); stage1.meta.schema_version = 2;
  delete stage1.parliament; delete stage1.senate; delete stage1.ballots;
  assert.equal(rules.isSaveCompatible({ S: stage1 }), false, 'a stage 1 save needs a new game');
  assert.equal(rules.isSaveCompatible({ S }), true);
});

test('the page and the engine tests load the same built copy of the rules', () => {
  const html = fs.readFileSync(path.join(ROOT, 'out', 'html', 'index.html'), 'utf8');
  const ignored = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8').split('\n');
  const at = file => html.indexOf('<script src="' + file + '"></script>');
  for (const file of ['polish_rules.js', 'polish_institutions.js', 'polish_electorate.js', 'polish_economy.js', 'polish_government.js',
    'polish_projects.js', 'polish_party.js', 'polish_unions.js']) {
    const built = path.join(ROOT, 'out', 'html', file);
    assert.ok(fs.existsSync(built), 'run npm run build first');
    assert.equal(fs.readFileSync(built, 'utf8'), fs.readFileSync(path.join(ROOT, 'source', 'rules', file), 'utf8'),
      'out/html copy matches source; run npm run build');
    assert.ok(at(file) >= 0 && at(file) < at('core.js'), file + ' is loaded before core.js');
    assert.ok(ignored.includes('out/html/' + file));
  }
  assert.ok(at('polish_rules.js') < at('polish_institutions.js'), 'the institutions module needs the rules module first');
  assert.ok(at('polish_institutions.js') < at('polish_electorate.js'), 'the electorate module comes after the institutions');
  assert.ok(at('polish_electorate.js') < at('polish_economy.js'), 'the economy module moves support in the cells of the electorate');
  assert.ok(at('polish_economy.js') < at('polish_government.js'), 'the government module reads the crises of the economy');
  assert.ok(at('polish_government.js') < at('polish_projects.js'), 'the projects module needs all four first');
  assert.ok(at('polish_projects.js') < at('polish_party.js'), 'the party module needs the projects and the electorate first');
  assert.ok(at('polish_party.js') < at('polish_unions.js'), 'the unions module reads the party’s compliance and cohesion');
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.ok(pkg.scripts.build.endsWith('&& cp source/rules/*.js out/html/'));
});

test('the rules modules never draw their own random numbers', () => {
  for (const file of ['polish_rules.js', 'polish_institutions.js', 'polish_electorate.js', 'polish_economy.js', 'polish_government.js',
    'polish_projects.js', 'polish_party.js', 'polish_unions.js']) {
    const source = fs.readFileSync(path.join(ROOT, 'source', 'rules', file), 'utf8');
    assert.ok(!source.includes('Math.random'), file + ': randomness comes from recorded rolls (4.6)');
  }
});
