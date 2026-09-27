const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Rules of politics and society of stage 7 (implementation plan, stage 7; technical reference 10.7, 15.1–15.3,
// 17.12, 17.12.5, 17.16.9–11): the journal of institutions and the authority of the Sejm, democracy, the pressure
// towards a coup, the grievance of the cells and the card B2. Each test starts a real new game and calls the rules on
// its state.
let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

const close = (a, b, eps = 1e-9, label = '') => assert.ok(Math.abs(a - b) < eps, `${label} ${a} != ${b}`);

function game() {
  return dendry.startGame().state.qualities;
}
// A game without the dated inputs of the scenario, so that a test of one rule sees no other speech or case.
function quiet() {
  const Q = game();
  Q.S.scenario.inputs.dispute_1922 = false;
  Q.S.scenario.inputs.military_case = false;
  return Q;
}
function free(Q) {
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  Q.month_actions = 0;
}
// One settlement of period t in the order of post_event (4.2): unions, projects and the economy, the party,
// the unions' end, the agreements, then politics.
function settle(Q) {
  const t = Q.time;
  free(Q);
  Q.time = t + 1; Q.year = PolishRules.yearOf(Q.time); Q.month = PolishRules.monthOf(Q.time);
  PolishUnions.beginMonth(Q, { t });
  PolishProjects.settleMonth(Q, { t });
  PolishParty.settleMonth(Q, { t });
  PolishUnions.endMonth(Q, { t });
  PolishGovernment.settleAgreements(Q);
  PolishPolitics.settleMonth(Q, { t });
  return Q.S.politics;
}
function withPortfolios(Q, ...portfolios) {
  const cabinet = Q.S.cabinet;
  if (!cabinet.partner_ids.includes('pps')) cabinet.partner_ids.push('pps');
  for (const key of portfolios) cabinet.portfolios[key] = 'pps';
  return Q;
}
const dissent = (S, id) => S.actors.pps.factions[id].dissent;
const unemployedCells = S => S.society.cells.filter(c => c.employment === 'unemployed');
const mean = (cells, field) => cells.reduce((n, c) => n + c.mass * c[field], 0) / cells.reduce((n, c) => n + c.mass, 0);

test('a new game starts politics at democracy 60, authority 55, violence 10, pressure 10 and the cells at grievance 35 (schema 8)', () => {
  const Q = game();
  const S = Q.S;
  assert.equal(Q.polish_politics_rules, 1);
  assert.deepEqual([S.politics.democracy, S.politics.parliament_authority, S.politics.violence, S.coup.pressure, S.coup.phase],
    [60, 55, 10, 10, 'dormant']);
  assert.ok(S.society.cells.every(c => c.grievance === 35 && c.radicalization === 0));
  close(S.politics.national_grievance, 35);
  assert.deepEqual(PolishRules.validateState(S), []);
});

test('Autorytet z dziennika: supporting the criticism in month t gives 53 in months t…t+11 and 55 from t+12; one entry per speech, also after save and load', () => {
  const Q = quiet();
  const S = Q.S, t = Q.time;
  PolishPolitics.scheduleSpeech(Q, 'speech_1922_dispute', t);
  assert.equal(PolishPolitics.criticismDue(Q), true);
  PolishPolitics.criticismChoose(Q, 'support');
  assert.equal(PolishPolitics.criticismDue(Q), false, 'answered once');
  assert.throws(() => PolishPolitics.criticismChoose(Q, 'defend'), /no speech/);
  assert.equal(PolishPolitics.scheduleSpeech(Q, 'speech_1922_dispute', t), null, 'the same speech is not recorded twice');
  const readings = [];
  for (let m = 0; m < 14; m++) {
    const P = settle(Q);
    readings.push([P.authority_at, P.parliament_authority]);
  }
  assert.deepEqual(readings.map(r => r[0]), Array.from({ length: 14 }, (_, i) => t + i));
  assert.deepEqual(readings.map(r => r[1]), [...Array(12).fill(53), 55, 55]);
  assert.equal(S.politics.institutional_log.filter(e => e.kind === 'stance_criticism').length, 1);
  const saved = JSON.parse(JSON.stringify(S));
  assert.equal(PolishRules.authorityFromLog(saved.politics.institutional_log, t + 11), 53, 'the loaded journal gives the same reading');
  assert.equal(PolishRules.authorityFromLog(saved.politics.institutional_log, t + 12), 55);
  assert.deepEqual(PolishRules.validateState(saved), []);
});

test('Bez bezpośredniego zapisu: a direct write of the authority is a validation error; only an entry of the journal changes it', () => {
  const Q = quiet();
  const S = Q.S;
  assert.deepEqual(PolishRules.validateState(S), []);
  S.politics.parliament_authority = 70;
  assert.deepEqual(PolishRules.validateState(S), ['S.politics.parliament_authority is not the reading of the institutional log']);
  S.politics.parliament_authority = 55;
  PolishPolitics.addLogEntry(S, 'law', 'fixture-law', Q.time);
  assert.equal(PolishPolitics.addLogEntry(S, 'law', 'fixture-law', Q.time), false, 'one entry per source');
  assert.throws(() => PolishPolitics.addLogEntry(S, 'applause', 'x', Q.time), /unknown kind/);
  settle(Q);
  assert.equal(S.politics.parliament_authority, 59);
  assert.deepEqual(PolishRules.validateState(S), []);
});

test('Demokracja w zwykłym Sejmie: authority 55, grievance below 50 and no events give +0.06 a month (formerly +0.15)', () => {
  const Q = quiet();
  const S = Q.S;
  settle(Q);
  close(S.politics.democracy, 60.06, 1e-9);
  assert.ok(S.politics.national_grievance < 50);
  settle(Q);
  close(S.politics.democracy, 60.12, 1e-9);
});

test('Zdarzenia demokracji: a new case of unconstitutional violence −2 once per case; lifting an unlawful restriction +1 once per restriction; B4 only its own +2', () => {
  const Q = quiet();
  const S = Q.S;
  PolishPolitics.openCase(Q, { id: 'case_a', kind: 'unconstitutional_violence', institutional: true, subject: 'a fixture attack on institutions' });
  assert.equal(PolishPolitics.activeInstitutionalEmergency(S), true);
  assert.equal(PolishGovernment.crisisState(Q, {}).emergency, true, 'the emergency of 8.8');
  settle(Q);
  close(S.politics.democracy, 60 + 0.06 - 2, 1e-9);
  settle(Q);
  close(S.politics.democracy, 60 + 0.12 - 2, 1e-9, 'the case counts once');
  PolishPolitics.addRestriction(Q, { id: 'r_unlawful', kind: 'strike_repression', target: 'fixture strikers', lawful: false });
  PolishPolitics.addRestriction(Q, { id: 'r_lawful', kind: 'militia_ban', target: 'fixture', lawful: true });
  assert.equal(PolishPolitics.liftRestriction(Q, 'r_unlawful', 'limited_redress'), true);
  assert.equal(PolishPolitics.liftRestriction(Q, 'r_unlawful', 'limited_redress'), false, 'lifted once');
  PolishPolitics.liftRestriction(Q, 'r_lawful', 'limited_redress');
  const d0 = S.politics.democracy;
  settle(Q);
  close(S.politics.democracy, d0 + 0.06 + 1, 1e-9, 'only the unlawful restriction counts');
  const cases = Object.keys(S.politics.cases).length;
  assert.equal(PolishPolitics.democracyEffect(Q, 'presidency.assassination_response:fixture', 2, 'B4'), true);
  assert.equal(PolishPolitics.democracyEffect(Q, 'presidency.assassination_response:fixture', 2, 'B4'), false);
  const d1 = S.politics.democracy;
  settle(Q);
  close(S.politics.democracy, d1 + 0.06 + 2, 1e-9);
  assert.equal(Object.keys(S.politics.cases).length, cases, 'B4 creates no second entry');
});

test('Demokracja w presji: democracy 70 / 60 / 50 at the start of the period gives −0.1 / 0 / +0.1 to the pressure, at most ±0.5', () => {
  const Q = quiet();
  const S = Q.S;
  const part = democracy => { S.politics.democracy = democracy; settle(Q); return S.coup.history.at(-1).parts.democracy; };
  close(part(70), -0.1, 1e-9);
  close(part(60), 0, 1e-9);
  close(part(50), 0.1, 1e-9);
  close(part(0), 0.5, 1e-9);
  close(part(100), -0.4, 1e-9);
});

test('Sprzeczność odpowiedzi B2: parliamentarism and support give a warning and the Centre +8 (5 + 3); support of Piłsudski with defence, and councils with support, give only their own effects', () => {
  const answer = (setup, choice) => {
    const Q = quiet();
    const S = Q.S;
    setup(S.actors.pps.strategy, S);
    PolishPolitics.scheduleSpeech(Q, 'speech_1922_dispute', Q.time);
    PolishPolitics.criticismView(Q);
    const warning = Q.pl_crit_warning;
    const before = { centrum: dissent(S, 'centrum'), pilsudczycy: dissent(S, 'pilsudczycy'), relation: S.actors.relations.pilsudski };
    PolishPolitics.criticismChoose(Q, choice);
    return { warning, centrum: dissent(S, 'centrum') - before.centrum, pilsudczycy: dissent(S, 'pilsudczycy') - before.pilsudczycy,
      relation: S.actors.relations.pilsudski - before.relation };
  };
  const first = answer(s => { s.form_of_power = 'parliamentarism'; }, 'support');
  assert.match(first.warning, /contradicts our line of parliamentarism/);
  assert.deepEqual([first.centrum, first.pilsudczycy, first.relation], [8, -3, 4]);
  const second = answer((s, S) => { s.pils_influence = 'support'; S.actors.pps.factions.centrum.dissent = 10; }, 'defend');
  assert.deepEqual([second.centrum, second.pilsudczycy, second.relation], [-3, 5, -4]);
  const third = answer(s => { s.form_of_power = 'workers_councils'; }, 'support');
  assert.deepEqual([third.warning, third.centrum], ['', 5]);
});

test('Dwie decyzje Piłsudskiego: the conditional line, then the defence of parliament in answer to a speech are separate records; no change of the army, the form of power or the lasting line', () => {
  const Q = quiet();
  const S = Q.S;
  assert.equal(S.actors.pps.strategy.pils_influence, 'conditional');
  const forces = JSON.stringify(S.security.forces);
  PolishPolitics.scheduleSpeech(Q, 'speech_1922_dispute', Q.time);
  PolishPolitics.criticismChoose(Q, 'defend');
  assert.deepEqual([S.actors.pps.strategy.pils_influence, S.actors.pps.strategy.form_of_power], ['conditional', 'parliamentarism']);
  assert.equal(S.politics.speeches[0].response, 'defend');
  assert.equal(JSON.stringify(S.security.forces), forces, 'no change of the army');
  assert.equal(S.politics.institutional_log.filter(e => e.kind === 'stance_defense').length, 1);
  assert.ok(S.actors.pps.reactions.some(r => r.cause === 'criticism:speech_1922_dispute'), 'the answer keeps its own cause');
});

test('Kolejność kategorii wydarzeń: E6 (1), the review of 1926 (4) and the criticism of parliament (6) due in one month come in this order, all before the next action', () => {
  const Q = quiet();
  const S = Q.S;
  S.politics.due.polish_event_pils_criticism = 'speech_fixture';
  S.strikes.due.polish_event_strike_rejection = 'strike-fixture:set-1';
  const due = ['polish_event_pils_criticism', 'polish_event_austerity_1926', 'polish_event_strike_rejection'];
  const order = [];
  for (let i = 0; i < 4; i++) {
    const next = PolishRules.nextEvent(Q, due);
    if (!next) break;
    order.push(next);
    PolishRules.markEventEntered(Q);
  }
  assert.deepEqual(order, ['polish_event_strike_rejection', 'polish_event_austerity_1926', 'polish_event_pils_criticism']);
});

test('B18/B19/B21: the return of Chjeno-Piast after a stabilising cabinet with an open military case gives +20 once; no extra card of formation or of preparing a coup', () => {
  const setup = ({ earlier = true, previous = 'grabski', caseOpen = true } = {}) => {
    const Q = quiet();
    const S = Q.S;
    Q.time = PolishRules.timeOf(1926, 5);
    if (caseOpen) PolishPolitics.openCase(Q, { id: 'military_case', kind: 'military', subject: 'fixture' }).opened_at = PolishRules.timeOf(1925, 1);
    if (earlier) S.history.cabinets.push({ id: 'chjeno_piast_t18', configuration_id: 'chjeno_piast', pm: 'witos', end_reason: 'fall', ended_at: 23 });
    S.history.cabinets.push({ id: 'prev_t24', configuration_id: previous === 'broad' ? 'broad_centre' : 'expert', pm: previous === 'grabski' ? 'grabski' : 'nowak',
      end_reason: 'fall', ended_at: Q.time });
    S.cabinet = Object.assign({}, S.cabinet, { id: 'chjeno_piast_t53', configuration_id: 'chjeno_piast', pm: 'witos', party: 'psl_piast',
      previous_cabinet_id: 'prev_t24', formed_at: Q.time, status: 'active' });
    const before = S.coup.pressure;
    PolishPolitics.scanImpulses(Q);
    PolishPolitics.scanImpulses(Q);
    return S.coup.pressure - before;
  };
  assert.equal(setup(), 20, 'once, not twice');
  assert.equal(setup({ previous: 'broad' }), 20, 'after a broad cabinet as well');
  assert.equal(setup({ earlier: false }), 0, 'a first cabinet of this configuration is no return');
  assert.equal(setup({ previous: 'other' }), 0, 'after another profile');
  assert.equal(setup({ caseOpen: false }), 0, 'without an open military case');
  const engine = dendry.startGame();
  assert.deepEqual(Object.keys(engine.game.scenes).filter(id => /b18|b19|b21|chjeno_return|coup_prep|broad_cabinet_card/i.test(id)), [],
    'the existing menus only');
});

test('Rozszerzyć i skupić osłony: expanding a 2 B protection to scope 2 costs 4 B and relieves the newly covered too; focusing costs 1 B and gives the full relief to the neediest half', () => {
  const run = option => {
    const Q = withPortfolios(quiet(), 'labor');
    Q.S.economy.budget_base = 10;
    PolishProjects.chooseOption(Q, 'social_welfare', option);
    return Q;
  };
  // The same unemployed cell in a twin game without the protection: every other term of 15.1 is equal there.
  const twin = quiet();
  twin.S.economy.budget_base = 10;
  const expanded = run('expand');
  const S = expanded.S;
  const id = unemployedCells(S)[0].id;
  const cellOf = G => G.S.society.cells.find(c => c.id === id);
  const gap = () => cellOf(twin).grievance - cellOf(expanded).grievance;
  settle(expanded);
  settle(twin);
  const protection = PolishProjects.operatingProtection(S);
  assert.deepEqual([protection.variant, protection.scope, protection.upkeep_budget_B], ['full', 1, 2]);
  close(PolishPolitics.ongoingRelief(S, cellOf(expanded)), 2 / 3, 1e-9, 'one level covers a third of the unemployed');
  close(gap(), 6 / 3 + 2 / 3, 1e-9, 'the initial relief −6 and the current relief 2 of the covered third');
  free(expanded);
  PolishProjects.chooseOption(expanded, 'social_welfare', 'expand');
  assert.deepEqual([protection.scope, protection.upkeep_budget_B], [2, 4]);
  const before = gap();
  settle(expanded);
  settle(twin);
  // Rising unemployment mixes new mass into the unemployed cell (5.1), so the second month differs by less than 0.01.
  close(gap() - before, 6 / 3 + 4 / 3, 0.01, 'the newly covered third gets the same −6, and the current relief doubles');
  assert.ok(protection.pending_effects.some(e => e.when === 'scope_2' && e.applied_at !== undefined));
  const focused = run('focus');
  settle(focused);
  const focus = PolishProjects.operatingProtection(focused.S);
  assert.deepEqual([focus.variant, focus.upkeep_budget_B], ['focused', 1]);
  close(PolishPolitics.ongoingRelief(focused.S, unemployedCells(focused.S)[0]), 1 / 3, 1e-9, 'the full relief for half of the covered');
});

test('Reprezentacja: consultation −2, then co-decision only the missing −2, then nothing; a refusal of the representatives blocks a covered decision only under co-decision', () => {
  const Q = withPortfolios(quiet(), 'economic');
  const S = Q.S;
  S.economy.budget_base = 10;
  S.economy.history.push({ t: Q.time - 1, credit: 30 }, { t: Q.time, credit: 30 });
  PolishUnions.recordPlants(Q, Q.time);
  const plant = PolishUnions.plants(S)[0];
  plant.owner = 'public'; plant.public_act_id = 'fixture-act';
  const workers = S.society.cells.filter(c => c.class_id === 'workers' && c.employment === 'employed');
  // The one-off effect alone: the recorded effects are applied, before the monthly equation of 15.1.
  const oneOff = () => { const g0 = workers.map(c => c.grievance); PolishPolitics.applyRecordedEffects(Q, Q.time); return workers.map((c, i) => c.grievance - g0[i]); };
  PolishProjects.chooseOption(Q, 'industrial_policy', 'worker_representation', { variant: 'consultative' });
  for (const d of oneOff()) close(d, -2 * 0.10 * 0.6, 1e-9, 'consultation: −2 for the workers of the plant, a tenth of the industrial branch');
  assert.deepEqual(oneOff(), workers.map(() => 0), 'once');
  assert.deepEqual(PolishProjects.plantDecisionStatus(Q, plant.id, 'mass dismissals', false), { available: true, reason: '' },
    'under consultation a refusal does not block');
  S.parliament.clubs.find(c => c.id === 'pps').seats += 215;
  S.parliament.clubs.find(c => c.id === 'other').seats -= 215;
  free(Q);
  PolishProjects.chooseOption(Q, 'industrial_policy', 'worker_representation', { variant: 'decision_rights' });
  free(Q);
  PolishProjects.agendaChoose(Q, 'enterprise_representation');
  const project = Object.values(S.projects).find(p => p.type === 'enterprise_representation' && p.variant === 'decision_rights');
  // The months of execution without politics, so the effect waits until it is applied here.
  for (let i = 0; i < 3 && project.status !== 'completed'; i++) {
    const t = Q.time;
    free(Q);
    Q.time = t + 1; Q.year = PolishRules.yearOf(Q.time); Q.month = PolishRules.monthOf(Q.time);
    PolishProjects.settleMonth(Q, { t });
  }
  assert.equal(project.status, 'completed');
  for (const d of oneOff()) close(d, -2 * 0.10 * 0.6, 1e-9, 'co-decision gives only the missing −2');
  assert.match(PolishProjects.plantDecisionStatus(Q, plant.id, 'mass dismissals', false).reason, /refuses its consent/);
  assert.equal(PolishProjects.plantDecisionStatus(Q, plant.id, 'mass dismissals', true).available, true);
  assert.equal(PolishProjects.plantDecisionStatus(Q, plant.id, 'the opening hours of the canteen', false).available, true, 'only the covered decisions');
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'industrial_policy', 'worker_representation').reason, /already/, 'a repeated choice gives nothing');
});

test('Mobilizacja i kult: a living President opens neither B4 nor B5; without the concrete commemoration of the assassin, and at an ordinary service, the cult does not appear', () => {
  const Q = quiet();
  const S = Q.S;
  Q.time = PolishRules.timeOf(1923, 1); Q.year = 1923; Q.month = 1;
  PolishPolitics.afterEvents(Q);
  assert.deepEqual([PolishPolitics.responseDue(Q), PolishPolitics.cultDue(Q)], [false, false], 'the President lives');
  assert.equal(S.politics.episodes.filter(e => e.kind === 'assassin_commemoration').length, 0);
  // An ordinary service is no trigger: only the recorded commemoration of the assassin.
  S.politics.episodes.push({ id: 'fixture_service', kind: 'service', t: Q.time });
  assert.equal(PolishPolitics.cultDue(Q), false);
  // The historical branch without the dated commemoration (the input off): B4 after the vacancy, still no B5.
  Q.polish_presidency.current = { office_id: 'prezydent_rp', holder_id: 'gabriel_narutowicz', holder_name: 'Gabriel Narutowicz', status: 'incumbent', since: '1922-12-11' };
  PolishPolitics.securityCrisis(Q, { holder_id: 'gabriel_narutowicz', holder_name: 'Gabriel Narutowicz', date: '1922-12-16', perpetrator: 'Eligiusz Niewiadomski' });
  assert.equal(PolishPolitics.responseDue(Q), false, 'not before the vacancy is filled');
  Q.polish_presidency.current = { office_id: 'prezydent_rp', holder_id: 'maciej_rataj', holder_name: 'Maciej Rataj', status: 'acting', since: '1922-12-16' };
  assert.equal(PolishPolitics.responseDue(Q), true);
  S.scenario.inputs.niewiadomski_cult = false;
  PolishPolitics.afterEvents(Q);
  assert.equal(PolishPolitics.cultDue(Q), false, 'no concrete commemoration');
  S.scenario.inputs.niewiadomski_cult = true;
  PolishPolitics.afterEvents(Q);
  assert.equal(PolishPolitics.cultDue(Q), true, 'the named commemoration of I 1923');
  PolishPolitics.afterEvents(Q);
  assert.equal(S.politics.episodes.filter(e => e.kind === 'assassin_commemoration').length, 1, 'one named event, no yearly repetition');
});
