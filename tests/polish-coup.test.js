const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Engine tests of the forces of the state and of the coup of stage 7 (implementation plan, stage 7; technical
// reference 16.1–16.8, 17.12.4; card catalogue 6.8, 7.5, 8.12–8.15, 9.15): the cards and standing actions are played
// through the real Dendry engine and the month is settled through post_event.
const { choose } = dendry;
let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

function ids(engine) {
  return (engine.getCurrentChoices() || []).map(item => item.id);
}
function choice(engine, id) {
  return (engine.getCurrentChoices() || []).find(item => item.id === id);
}
function playFromHand(engine, cardId) {
  engine.state.currentHands.main = [{ id: cardId, title: cardId }];
  engine.playCard(cardId);
}
// A game without the dated inputs of the scenario, so that no speech interrupts the months of a test.
function quietGame() {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.S.scenario.inputs.dispute_1922 = false;
  Q.S.scenario.inputs.military_case = false;
  Q.S.economy.budget_base = 10;
  return engine;
}
// One month spent on organisational work in the party agenda (0 R); the engine stops at main.
function spendMonth(engine) {
  engine.goToScene('main');
  choose(engine, 'polish_party_agenda');
  choose(engine, 'polish_party_agenda.organize');
  choose(engine, 'polish_party_agenda.branch_farm_labour');
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'main');
}

test('Rozpoznanie w agendzie: three assessments of the forces every 3 months narrow the interval 30 → 20 → 10 → 5 pp, each for 1 T and 1 R; the loyalties themselves do not change', () => {
  const engine = quietGame();
  const Q = engine.state.qualities, S = Q.S;
  const loyalties = S.security.forces.map(f => [f.loyalty_legal, f.loyalty_pils, f.loyalty_neutral]);
  const radii = [S.security.known.capital_legal.radius];
  for (let n = 0; n < 3; n++) {
    engine.goToScene('main');
    choose(engine, 'polish_party_agenda');
    const cash = S.party_orgs.cash, t = Q.time;
    choose(engine, 'polish_party_agenda.assess_forces');
    assert.ok(Math.abs(S.party_orgs.cash - (cash - 1)) < 1e-6, '1 R');
    assert.match(JSON.stringify(engine.ui.paragraphs), /narrows the interval/);
    choose(engine, 'root');
    assert.equal(Q.time, t + 1, '1 T: the month is spent');
    radii.push(S.security.known.capital_legal.radius);
    for (const view of PolishSecurity.knownView(S)) {
      const f = S.security.forces.find(g => g.id === view.id);
      const effective = PolishSecurity.effectiveLoyalty(f, S.politics.democracy).pils;
      assert.equal(view.radius, radii.at(-1), f.id);
      assert.ok(view.low <= effective && effective <= view.high, f.id + ': the effective loyalty lies inside the recognised interval');
    }
    if (n < 2) {
      engine.goToScene('main');
      choose(engine, 'polish_party_agenda');
      assert.equal(choice(engine, 'polish_party_agenda.assess_forces').canChoose, false, 'waits 3 months');
      assert.match(Q.pl_pa_assess_why, /months before the next assessment/);
      spendMonth(engine);
      spendMonth(engine);
    }
  }
  assert.deepEqual(radii, [30, 20, 10, 5]);
  assert.deepEqual(S.security.assessments.map(a => a.radius), [20, 10, 5]);
  spendMonth(engine); spendMonth(engine);
  engine.goToScene('main');
  choose(engine, 'polish_party_agenda');
  assert.equal(choice(engine, 'polish_party_agenda.assess_forces').canChoose, false);
  assert.match(Q.pl_pa_assess_why, /as precise as it can be/);
  assert.deepEqual(S.security.forces.map(f => [f.loyalty_legal, f.loyalty_pils, f.loyalty_neutral]), loyalties);
});

test('Kontrola wojska bez pustych opcji: at a prepared project the Parliament card has two options, full oversight and a limited reform; closing it costs nothing (0.36)', () => {
  const engine = quietGame();
  const Q = engine.state.qualities, S = Q.S;
  if (!S.cabinet.partner_ids.includes('pps')) S.cabinet.partner_ids.push('pps');
  S.cabinet.portfolios.reichswehr = 'pps';
  engine.goToScene('main');
  playFromHand(engine, 'polish_gov_military');
  assert.deepEqual(ids(engine).filter(id => !['easy_discard', 'cancel_advisor_action'].includes(id)),
    ['polish_gov_military.civilian_oversight', 'polish_gov_military.personnel_changes', 'polish_gov_military.organizational_compromise']);
  choose(engine, 'polish_gov_military.civilian_oversight');
  assert.match(JSON.stringify(engine.ui.paragraphs), /its law and launch wait in the agenda/);
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'main');
  const t = Q.time;
  assert.equal(PolishProjects.armyOversightAvailable(Q), true, 'a prepared project opens the card');
  playFromHand(engine, 'polish_parliament_army_oversight');
  const options = ids(engine).filter(id => !['easy_discard', 'cancel_advisor_action'].includes(id));
  assert.deepEqual(options, ['polish_parliament_army_oversight.civilian_oversight', 'polish_parliament_army_oversight.limited_reform'],
    'no paid explanations of the minister and no postponement');
  assert.equal(choice(engine, 'polish_parliament_army_oversight.civilian_oversight').canChoose, false, 'the same variant is already prepared');
  assert.equal(choice(engine, 'polish_parliament_army_oversight.limited_reform').canChoose, true);
  choose(engine, 'easy_discard');
  assert.deepEqual([Q.time, Q.month_actions || 0], [t, 0], 'closing the card costs nothing');
  playFromHand(engine, 'polish_parliament_army_oversight');
  choose(engine, 'polish_parliament_army_oversight.limited_reform');
  choose(engine, 'root');
  const project = Object.values(S.projects).find(p => p.type === 'army_control');
  assert.deepEqual([Q.time, project.variant, project.status, project.policy_choices.via, project.duration_months],
    [t + 1, 'limited_reform', 'prepared', 'parliament', 2], '1 T: the one project, changed to the limited reform');
  assert.equal(Object.values(S.projects).filter(p => p.type === 'army_control').length, 1, 'no second project');
});

// ---- The coup F through the engine (16.4–16.8, 19.1; card catalogue 9.15) ----

const HISTORICAL_LIKE = { zln: 22, pschd: 10, psl_piast: 13, psl_wyzwolenie: 11, pps: 10, npr: 5, minorities_bloc: 16, kpp: 1.5, other: 11.5 };
// The recorded draws that give each group a chosen side (see tests/rules-coup.test.js).
const U = { capital_legal: { legal: 0.1, neutral: 0.99 }, capital_pils: { legal: 0.01, pils: 0.5, neutral: 0.99 },
  near_reserve: { legal: 0.1, pils: 0.5, neutral: 0.95 }, remote_reserve: { legal: 0.1, pils: 0.6, neutral: 0.95 } };
// The November election and the December offices of 1922 (the historical branch), then February 1926 with a pressure
// above the gates: the settlement of that month declares the attempt and the queue brings F3 (16.8.1).
function toCoup({ democracy = null, sides = null } = {}) {
  const engine = quietGame();
  const Q = engine.state.qualities, S = Q.S;
  S.scenario.inputs.niewiadomski_cult = false;
  Q.year = 1922; Q.month = 11; Q.time = 11;
  for (const group of Q.classes) for (const party of Q.parties) Q[`${group}_${party}`] = HISTORICAL_LIKE[party] || 0;
  PolishElectorate.seedCells(Q); PolishElectorate.writeClassMirrors(Q);
  engine._runActions(engine.game.scenes.polish_opening_state.onArrival);
  engine.goToScene('sejm_election');
  choose(engine, 'sejm_election.calculate');
  dendry.formCabinet(engine, { mode: 'opposition' });
  choose(engine, 'root');
  engine.goToScene('main');
  choose(engine, 'polish_party_agenda');
  choose(engine, 'polish_party_agenda.organize');
  choose(engine, 'polish_party_agenda.branch_farm_labour');
  choose(engine, 'root');
  choose(engine, 'polish_speaker_election.rataj');
  choose(engine, 'polish_speaker_election.finish');
  choose(engine, 'polish_presidential_sequence.decline_daszynski');
  choose(engine, 'polish_presidential_sequence.first_transfer');
  choose(engine, 'polish_presidential_sequence.assassination');
  choose(engine, 'root');
  choose(engine, 'polish_event_assassination_response.restraint');
  choose(engine, 'root');
  choose(engine, 'polish_presidential_sequence.do_not_run_daszynski_second');
  choose(engine, 'polish_presidential_sequence.finish');
  assert.equal(engine.state.sceneId, 'main');
  Q.year = 1926; Q.month = 2; Q.time = 50; S.turn.last_settled_time = 49;
  S.coup.pressure = 70;
  if (democracy !== null) S.politics.democracy = democracy;
  engine.goToScene('main');
  choose(engine, 'polish_party_agenda');
  choose(engine, 'polish_party_agenda.organize');
  choose(engine, 'polish_party_agenda.branch_farm_labour');
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'polish_event_coup.f3', 'the queue brings the declared attempt at once (category 2)');
  if (sides) S.security.forces.forEach((f, i) => { S.rng.rolls[`coup_${S.coup.attempt_id}:${f.id}:allegiance`] = U[f.id][sides[i]]; });
  return engine;
}

test('Zamach: identical forces with different last commitments of PPS — the outcome is computed only after the commitments; the German coup counter and scenes change nothing', () => {
  const run = commitment => {
    const engine = toCoup({ sides: ['legal', 'pils', 'pils', 'legal'] });
    const Q = engine.state.qualities, S = Q.S;
    Q.coup_progress = 10; // the inherited German counter (leak 3): read by no Polish rule
    const A = S.coup.attempt;
    assert.ok(A.capacity >= 30 && A.pressure >= 65, 'a Polish intention and capacity');
    choose(engine, 'polish_event_coup.begin');
    choose(engine, 'polish_event_coup.defend_legal');
    assert.deepEqual([S.coup.outcome, A.sides], [null, null], 'nothing is decided before F5');
    S.militia.strength = 740; S.militia.militancy = 1; S.militia.fatigue = 0; // fixture: a Milicja of about 6 F
    choose(engine, `polish_event_coup.commit_${commitment}`);
    choose(engine, 'polish_event_coup.f67_seen');
    if (engine.state.sceneId === 'polish_event_coup.f9') choose(engine, 'polish_event_coup.f9_accept');
    assert.equal(engine.state.sceneId, 'polish_event_coup.f10');
    return { S, A };
  };
  const none = run('none'), militia = run('militia');
  assert.deepEqual(none.A.sides, militia.A.sides, 'the same draws of the groups');
  assert.ok(none.S.coup.outcome && militia.S.coup.outcome, 'both resolved after the commitments');
  assert.deepEqual([none.A.organisations.militia, militia.A.organisations.militia.executing > 0], [null, true]);
  assert.equal(none.S.coup.pps_contribution, 'none', 'without organisations no contribution');
  for (const r of [none, militia]) {
    assert.deepEqual([r.S.chapter.status, r.S.chapter.reason], ['ended', 'coup'], 'the chapter ends after the coup');
    assert.ok(!Object.values(r.S.coup).some(v => v === undefined));
  }
});

test('Wczytanie zamachu: a save after the stance and one round, at the pending F9, loads the same sides, losses and draws; only the next open phase remains', () => {
  const engine = toCoup({ democracy: 100, sides: ['legal', 'pils', 'neutral', 'neutral'] });
  const Q = engine.state.qualities, S = Q.S;
  choose(engine, 'polish_event_coup.begin');
  choose(engine, 'polish_event_coup.defend_legal');
  S.militia.strength = 740; S.militia.militancy = 1; S.militia.fatigue = 0;
  choose(engine, 'polish_event_coup.commit_militia');
  const res = S.coup.attempt.resolution;
  assert.deepEqual([res.pending && res.pending.kind, res.f9.completed_rounds, res.log.length], ['f9', 1, 1], 'F9 after one completed round');
  choose(engine, 'polish_event_coup.f67_seen');
  assert.equal(engine.state.sceneId, 'polish_event_coup.f9');
  const restored = dendry.saveAndRestore(engine);
  const R = restored.state.qualities;
  assert.equal(restored.state.sceneId, 'polish_event_coup.f9');
  assert.deepEqual(R.S.coup.attempt.sides, S.coup.attempt.sides);
  assert.deepEqual(R.S.coup.attempt.rolls, S.coup.attempt.rolls);
  assert.deepEqual(R.S.coup.attempt.resolution.groups.map(g => g.loss), res.groups.map(g => g.loss));
  assert.deepEqual(Object.keys(R.S.rng.rolls).length, Object.keys(S.rng.rolls).length, 'no new draw');
  choose(restored, 'polish_event_coup.f9_accept');
  choose(engine, 'polish_event_coup.f9_accept');
  assert.deepEqual([R.S.coup.outcome, R.S.coup.settlement], [S.coup.outcome, S.coup.settlement]);
  assert.equal(R.S.coup.outcome, 'constitutional_compromise');
  assert.deepEqual(R.S.coup.f9, { completed_rounds: 1, offer_id: S.coup.settlement, response: 'accepted' });
});

test('Brak zwycięzcy: a stalemate after four rounds at democracy 30 without an offer of 60 is a prolonged conflict, a report of handover and the end of the chapter', () => {
  const engine = toCoup({ democracy: 30, sides: ['legal', 'pils', 'pils', 'legal'] });
  const Q = engine.state.qualities, S = Q.S;
  choose(engine, 'polish_event_coup.begin');
  choose(engine, 'polish_event_coup.mediate');
  choose(engine, 'polish_event_coup.commit_none');
  choose(engine, 'polish_event_coup.f67_seen');
  assert.equal(engine.state.sceneId, 'polish_event_coup.f10');
  assert.deepEqual([S.coup.outcome, S.coup.round, S.coup.phase, S.coup.effects_complete], ['prolonged_conflict', 4, 'resolved', true]);
  assert.deepEqual([S.chapter.status, S.chapter.reason, S.chapter.trigger_id], ['ended', 'coup', S.coup.attempt_id]);
  const report = S.chapter.report;
  assert.equal(report.state.turning_point.outcome, 'prolonged_conflict');
  assert.equal(report.state.turning_point.rounds.length, 4, 'the last balance of the rounds');
  assert.ok(report.state.turning_point.effects.forces.every(f => f.side), 'the sides and losses of the groups');
  assert.deepEqual(report.continuation_requirements, ['prolonged_conflict']);
  assert.equal(report.state.last_election.sequence_after_opening, 1, 'the Sejm of 1922 stays in the report');
  choose(engine, 'polish_chapter_report');
  assert.match(JSON.stringify(engine.ui.paragraphs), /the conflict continues without a winner/);
  engine.goToScene('main');
  assert.equal(engine.state.sceneId, 'polish_chapter_report', 'no month after the end of the chapter');
});

// ---- Stage 7e: the decks, the isolation from the German systems and the whole chapter (17.10–17.11, 19.1–19.2) ----

const optionIds = (engine, sceneId) => (engine.game.scenes[sceneId].options || []).map(o => o.id.replace(/^@/, '').replace(sceneId + '.', ''));
const topScenes = engine => Object.keys(engine.game.scenes).filter(id => !id.includes('.'));
const tagged = (engine, tag) => topScenes(engine).filter(id => (engine.game.scenes[id].tags || []).includes(tag));

test('Manifest parlamentu: the pool, the agenda and the events are the 10 families of 17.10; no card of early elections or of Żyrardów; one joint answer B11+B12', () => {
  const engine = dendry.startGame();
  const FAMILIES = {
    'parliament.cabinet_formation': ['polish_cabinet_formation'],
    'parliament.legislative_program': ['polish_unemployment_bill'],
    'parliament.finance_amendment': ['polish_budget_package'],
    'parliament.constitution_project': ['polish_constitution_project'],
    'parliament.army_oversight': ['polish_parliament_army_oversight'],
    'parliament.government_support': ['polish_government_support', 'polish_government_response'],
    'parliament.list_agreement': ['polish_list_agreement'],
    'parliament.speaker_election': ['polish_speaker_election'],
    'presidency.election': ['polish_presidential_sequence'],
    'parliament.strike_response': ['polish_event_strike_response'],
  };
  assert.equal(Object.keys(FAMILIES).length, 10);
  const all = Object.values(FAMILIES).flat();
  for (const id of all) assert.ok(engine.game.scenes[id], id);
  assert.deepEqual(tagged(engine, 'parliament_affairs').filter(id => !all.includes(id)), [], 'every card of the Parliament deck belongs to a family');
  assert.ok(!topScenes(engine).some(id => /early_election|zyrardow|dissolution/.test(id)), 'no card of early elections (C8) and no Żyrardów (B15)');
  assert.deepEqual(optionIds(engine, 'polish_event_strike_response'), ['demands', 'settlement', 'order'], 'one menu for B11+B12');
  assert.deepEqual(optionIds(engine, 'polish_parliament_army_oversight').filter(id => !['easy_discard', 'cancel_advisor_action'].includes(id)),
    ['civilian_oversight', 'limited_reform']);
});

test('Katalog rządowy: 16 families in the pool, the agenda and the triggers; no extra menus of B10 or B20; no cards for Foreign Affairs; the credit crisis leads to the proper policies', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities, S = Q.S;
  const FAMILIES = {
    labor_rights: 'polish_gov_labor_rights', social_welfare: 'polish_gov_social_welfare', finance_package: 'polish_gov_finance',
    currency_stabilisation: 'polish_gov_currency', investment_fund: 'polish_gov_investment', industrial_policy: 'polish_gov_industry',
    public_works: 'polish_gov_public_works', land_program: 'polish_gov_land', agriculture_development: 'polish_gov_agriculture',
    education_program: 'polish_gov_education', minority_school_rights: 'polish_gov_minority_schools', internal_security: 'polish_gov_interior',
    justice_policy: 'polish_gov_justice', military_policy: 'polish_gov_military', pils_agreement: 'polish_gov_pils_agreement',
    heritage_restoration: 'polish_gov_heritage',
  };
  assert.equal(Object.keys(FAMILIES).length, 16);
  const polish = Object.values(FAMILIES);
  for (const id of polish) assert.ok(engine.game.scenes[id], id);
  // A fixture cabinet in which PPS holds all nine portfolios, in a financial crisis (the stabilisation).
  if (!S.cabinet.partner_ids.includes('pps')) S.cabinet.partner_ids.push('pps');
  for (const key of Object.keys(S.cabinet.portfolios)) S.cabinet.portfolios[key] = 'pps';
  S.economy.history.push({ t: Q.time - 1, inflation_m: 30, budget: 1, credit: 50 }, { t: Q.time, inflation_m: 40, budget: 1, credit: 50 });
  PolishGovernment.writeGovernmentMirrors(Q);
  const offered = (engine._compileChoices(engine.game.scenes['main.govt']) || []).filter(c => c.canChoose !== false).map(c => c.id);
  assert.deepEqual(offered.filter(id => !polish.includes(id)), [], 'no German card with every portfolio');
  assert.ok(polish.filter(id => offered.includes(id)).length >= 15, 'the families with their access');
  assert.ok(!topScenes(engine).some(id => /strike_response_government|business_conflict|polish_gov_foreign/.test(id)), 'no extra menus B10/B20 and no MSZ card');
  for (const key of Object.keys(S.cabinet.portfolios)) S.cabinet.portfolios[key] = key === 'foreign' ? 'pps' : 'expert';
  PolishGovernment.writeGovernmentMirrors(Q);
  assert.deepEqual((engine._compileChoices(engine.game.scenes['main.govt']) || []).filter(c => c.canChoose !== false && c.id !== 'root').map(c => c.id), [],
    'Foreign Affairs alone opens no card');
  assert.ok(optionIds(engine, 'polish_event_credit_crisis').length >= 2, 'the credit crisis answers through the existing policies');
});

test('Karty rządowe bez pustych opcji: Welfare, Stabilisation, Industry, Justice, Military Affairs and Wawel have no options of keeping, postponing or leaving it to the owners; closing is free', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  for (const id of ['polish_gov_social_welfare', 'polish_gov_currency', 'polish_gov_industry', 'polish_gov_justice', 'polish_gov_military', 'polish_gov_heritage']) {
    const options = optionIds(engine, id);
    assert.ok(options.includes('easy_discard'), id + ': closing without cost');
    assert.deepEqual(options.filter(o => /retain|defer|postpone|keep|owner|leave|wait/.test(o)), [], id + ': no empty option');
  }
  if (!Q.S.cabinet.partner_ids.includes('pps')) Q.S.cabinet.partner_ids.push('pps');
  Q.S.cabinet.portfolios.labor = 'pps';
  engine.goToScene('main');
  const t = Q.time;
  playFromHand(engine, 'polish_gov_social_welfare');
  choose(engine, 'easy_discard');
  assert.deepEqual([Q.time, Q.month_actions || 0], [t, 0], 'closing the card costs nothing');
});

test('Sceny wycofane B: the old cases of Żyrardów, the confiscations, land and languages or the refusal of business have no menu and no reward; the ordinary policies and real consequences still work', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities, S = Q.S;
  assert.ok(!topScenes(engine).some(id => /confiscat|zyrardow|land_language|language_land|business_refusal|business_conflict/.test(id)),
    'B6, B15, B17 and B20 have no scene');
  const reach = PolishParty.pressEffective(S).reach;
  assert.equal(PolishParty.addPressRestriction(Q, { id: 'fixture_confiscation', event_id: null }), true);
  assert.equal(PolishParty.pressEffective(S).reach, reach - 10, 'a real restriction of the press still works (13.2)');
  const pressure = S.economy.business_pressure;
  PolishEconomy.changeBusinessPressure(S, 15, 'fixture_reform:business', Q.time, 'fixture');
  assert.equal(S.economy.business_pressure, pressure + 15, 'the reaction of business to real reforms still works (11.7)');
});

test('Izolacja Polski: with the new models of the economy and the coup active, no old German field changes their outcome', () => {
  const run = poisoned => {
    const engine = dendry.startGame();
    const Q = engine.state.qualities;
    Q.S.scenario.inputs.dispute_1922 = false;
    if (poisoned) {
      Object.assign(Q, { coup_progress: 10, pro_republic: 0, capital_strike_progress: 10, budget: -10, inflation: 25, unemployed: 40,
        reichswehr_strength: 500, reichswehr_loyalty: 0, reichswehr_militancy: 5, nationalism: 100, nsdap_r: 30, sa_strength: 500 });
    }
    for (let m = 0; m < 4; m++) spendMonth(engine);
    const S = Q.S;
    return { economy: [S.economy.inflation_m, S.economy.output, S.economy.unemployment, S.economy.budget], politics: [S.politics.democracy, S.politics.violence, S.coup.pressure],
      forces: PolishSecurity.capacity(S), resolution: PolishSecurity.resolveAttempt(PolishSecurity.coupGroups(S, Q.time).map((g, i) => Object.assign(g, { side: ['legal', 'pils', 'pils', 'legal'][i] })),
        { democracy: S.politics.democracy }).outcome, Q, engine };
  };
  const clean = run(false), poisoned = run(true);
  assert.deepEqual(poisoned.economy, clean.economy, 'the economy');
  assert.deepEqual(poisoned.politics, clean.politics, 'democracy, violence and pressure');
  assert.equal(poisoned.forces, clean.forces, 'the forces of the state');
  assert.equal(poisoned.resolution, clean.resolution, 'the coup');
  // The German writers of the coup counter and of the support for the Republic cannot run in the Polish game.
  const Q = poisoned.Q, engine = poisoned.engine;
  Q.year = 1930; Q.month = 12; Q.spd_in_government = 1; Q.spd_prussia = 1;
  for (const id of ['march_on_berlin', 'capital_strike', 'harzburg_front', 'return_to_normalcy', 'all_quiet', 'weltbuhne', 'banking_crisis',
    'deport_hitler', 'foreign_policy', 'military_policy', 'police', 'confronting_nazis', 'crisis_program', 'leber', 'rosenfeld', 'sender', 'seydewitz']) {
    assert.equal(engine._runPredicate(engine.game.scenes[id].viewIf, true), false, id);
  }
});

test('Kolejność i zakres: after the report of a coup no new action and no month; Sanacja and SL are not formed and Drobner is not in the pool before 1928', () => {
  const engine = toCoup({ sides: ['neutral', 'pils', 'pils', 'legal'] });
  const Q = engine.state.qualities, S = Q.S;
  choose(engine, 'polish_event_coup.begin');
  choose(engine, 'polish_event_coup.mediate');
  choose(engine, 'polish_event_coup.commit_none');
  choose(engine, 'polish_event_coup.f67_seen');
  assert.equal(S.chapter.status, 'ended');
  const time = Q.time, months = S.history.months.length, actions = S.history.actions.length;
  for (const scene of ['main', 'post_event', 'root']) {
    engine.goToScene(scene);
    assert.equal(engine.state.sceneId, 'polish_chapter_report', scene + ' leads to the report');
  }
  assert.deepEqual([Q.time, S.history.months.length, S.history.actions.length], [time, months, actions], 'no month and no action after the report');
  assert.equal(Q.bbwr_formed, 0, 'no Sanacja');
  assert.ok(!Q.parties.some(p => /sanacja|bbwr|^sl$/.test(p)), 'no new party is formed automatically');
  assert.equal(PolishParty.adviserInPool(Q, 'drobner'), false, 'Drobner belongs to the continuation');
});

test('Karty 3–5 bez odnowienia: an answered budget package, a refused motion and a refused army law are not offered again unchanged; a changed offer is', () => {
  // Card 3: one answer per package (0 T, decision of stage 4); a new package of the cabinet opens a new answer.
  const engine = quietGame();
  const Q = engine.state.qualities, S = Q.S;
  PolishProjects.newPackage(Q, { instruments: ['broad'], necessary: false, reason: 'deficit' });
  assert.equal(PolishProjects.budgetCardAvailable(Q), true);
  PolishProjects.answerBudget(Q, 'refuse');
  assert.equal(PolishProjects.budgetCardAvailable(Q), false, 'the same package is not answered again');
  S.economy.pending_package = null;
  PolishProjects.newPackage(Q, { instruments: ['wealth_tax'], necessary: false, reason: 'deficit' });
  assert.equal(PolishProjects.budgetCardAvailable(Q), true, 'a changed package can be answered');
  // Card 5: the refused law of civilian control is not filed again unchanged; the limited reform (1 T) is a changed offer.
  if (!S.cabinet.partner_ids.includes('pps')) S.cabinet.partner_ids.push('pps');
  S.cabinet.portfolios.reichswehr = 'pps';
  const clubs = S.parliament.clubs;
  S.parliament.clubs = [clubs.find(c => c.id === 'pps'), clubs.find(c => c.id === 'pschd')]; // fixture: a Sejm that refuses the law
  S.parliament.clubs[0].seats = 1; S.parliament.clubs[1].seats = 443;
  S.actors.relations.pschd = 0; // fixture: the Christian Democrats vote against, not abstain
  PolishProjects.chooseOption(Q, 'military_policy', 'civilian_oversight');
  Q.month_actions = 0; S.turn.pending = null;
  PolishProjects.agendaChoose(Q, 'army_control');
  assert.equal(S.parliament.laws.at(-1).status, 'rejected');
  Q.month_actions = 0; S.turn.pending = null;
  assert.match(PolishProjects.agendaStatus(Q, 'army_control').reason, /same law was refused/);
  assert.equal(PolishProjects.armyOversightAvailable(Q), true, 'the card has no cooldown');
  PolishProjects.armyOversightChoose(Q, 'limited_reform');
  assert.equal(Q.month_actions, 1, '1 T');
  Q.month_actions = 0; S.turn.pending = null;
  assert.equal(PolishProjects.agendaStatus(Q, 'army_control').available, true, 'the changed offer can be filed');
  // Card 4: a refused constitutional motion is not filed again while its forecast is the same; a changed situation opens it.
  const C = quietGame().state.qualities;
  C.S.senate.status = 'constituted'; C.S.senate.club_seats = { pps: 40, pschd: 71 }; C.S.senate.total = 111;
  const cc = C.S.parliament.clubs;
  C.S.parliament.clubs = [cc.find(c => c.id === 'pps'), cc.find(c => c.id === 'pschd')];
  C.S.parliament.clubs[0].seats = 150; C.S.parliament.clubs[1].seats = 294;
  C.S.actors.relations.pschd = 0;
  PolishProjects.constitutionChoose(C, 'democratic_guarantees', 'parliament');
  C.month_actions = 0; C.S.turn.pending = null;
  PolishProjects.agendaChoose(C, 'submit_democratic_guarantees');
  assert.equal(C.S.parliament.laws.at(-1).status, 'rejected', 'no two thirds');
  C.month_actions = 0; C.S.turn.pending = null;
  assert.match(PolishProjects.constitutionStatus(C, 'democratic_guarantees').reason, /same motion was refused/);
  C.S.actors.relations.pschd = 100; // a changed situation: the Christian Democrats no longer vote against
  PolishGovernment.writeGovernmentMirrors(C);
  assert.equal(PolishProjects.constitutionStatus(C, 'democratic_guarantees').available, true, 'a changed situation opens it again for 1 T');
});

test('Kampania od stycznia 1922 do raportu: two walks of the whole chapter end in one report — after the coup or after the next election — with a valid state and no engine error', () => {
  for (const variant of [0, 1]) {
    const { engine } = dendry.walk(dendry.startGame(1922 + variant), { variant, maxSteps: 4000, lastYear: 1928 });
    const Q = engine.state.qualities, S = Q.S;
    assert.equal(S.chapter.status, 'ended', `walk ${variant}`);
    assert.ok(['coup', 'next_legal_election'].includes(S.chapter.reason));
    assert.equal(engine.state.sceneId, 'polish_chapter_report');
    assert.ok(S.chapter.report.state.society && S.chapter.report.state.politics && S.chapter.report.state.security && S.chapter.report.state.unfinished);
    assert.deepEqual(PolishRules.validateState(S), []);
  }
});
