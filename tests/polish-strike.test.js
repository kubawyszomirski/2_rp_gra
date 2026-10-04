const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Engine tests of the unions and strikes of stage 6 (implementation plan, stage 6; technical reference 14.1–14.5,
// 17.5; card catalogue 5.10, 7.10, 9.7–9.9): the cards are played through the real Dendry engine and a month is
// settled once through post_event.
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
// Through a mandatory sequence back to the ordinary turn.
function toMain(engine) {
  for (let i = 0; i < 60 && engine.state.sceneId !== 'main'; i++) {
    const all = engine.getCurrentChoices() || [];
    const open = all.filter(c => c.canChoose !== false);
    engine.choose(all.indexOf(open[0]));
  }
  assert.equal(engine.state.sceneId, 'main');
}
// One month spent on organisational work in the party agenda (0 R); `stop` leaves the engine at the first event.
function spendMonth(engine, stop) {
  engine.goToScene('main');
  choose(engine, 'polish_party_agenda');
  choose(engine, 'polish_party_agenda.organize');
  choose(engine, 'polish_party_agenda.branch_farm_labour');
  choose(engine, 'root');
  if (!stop) toMain(engine);
}
// The steps after a strike begins: no cooperation with the communists (if they take part) and no protection.
function plainSteps(engine) {
  assert.equal(engine.state.sceneId, 'polish_strike_steps');
  if (ids(engine).includes('polish_strike_steps.none')) choose(engine, 'polish_strike_steps.none');
  choose(engine, 'polish_strike_steps.no_protection');
  choose(engine, 'polish_strike_steps.done');
}
function unionStep(engine, branch, step) {
  engine.goToScene('main');
  choose(engine, 'polish_union_agenda');
  choose(engine, `polish_union_agenda.${branch}`);
  choose(engine, `polish_union_agenda.${step}`);
  if (step === 'start') plainSteps(engine);
  else choose(engine, 'root');
  toMain(engine);
}

// Stage 8 (decision 2A) calibrated the opening so that the KPP has 3.2% among the workers; the communist steps of a
// strike need 5% (14.4). These tests of the communist steps use the earlier opening row of the workers as a fixture.
function kppAmongWorkers(Q) {
  const old = { kpp: 11.04, pps: 38.64, npr: 18.4, psl_wyzwolenie: 1.84, psl_piast: 0.92, pschd: 9.2, zln: 7.36, minorities_bloc: 4.6, other: 8 };
  for (const party of Q.parties) Q['workers_' + party] = old[party];
  PolishElectorate.seedCells(Q);
  PolishElectorate.writeClassMirrors(Q);
}

test('the Trade Unions card: agreeing the demands and starting a strike each take the month; the month draws on the fund once', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  assert.ok(ids(engine).includes('polish_union_agenda'), 'a pinned card');
  S.unions.industry.reach = 50;
  unionStep(engine, 'industry', 'prepare_limited');
  assert.equal(Q.time, 2, 'one month');
  assert.equal(S.unions.industry.readiness, 40);
  assert.equal(PolishRules.cooldownRemaining(Q, 'union.prepare.industry'), 1);
  const fund = S.unions.industry.fund;
  unionStep(engine, 'industry', 'start');
  assert.equal(Q.time, 3);
  const rec = PolishUnions.records(S).find(r => r.branches.includes('industry'));
  assert.equal(rec.started_at, 2);
  assert.ok(rec.participants.industry > 0);
  const income = Math.min(0.30, 0.05 * 50 / 20) - 0.02;
  assert.ok(Math.abs(S.unions.industry.fund - (fund + income - rec.cost_paid)) < 1e-6, 'one draw from the fund after its income');
  assert.equal(S.unions.industry.fatigue, 5);
  assert.equal(rec.rounds.length, 1, 'one round of talks in the month');
  assert.ok(S.strikes.inputs.strike_disruption > 0);
  assert.equal(S.economy.history.at(-1).strike_disruption, S.strikes.inputs.strike_disruption, 'the economy of the month read the strike');
});

test('an offer is answered without a month: accepting ends the strike on the agreed terms and the rise comes the next month', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  S.unions.rail.reach = 45;
  unionStep(engine, 'rail', 'prepare_limited');
  engine.goToScene('main');
  choose(engine, 'polish_union_agenda');
  choose(engine, 'polish_union_agenda.rail');
  choose(engine, 'polish_union_agenda.start');
  const rec = PolishUnions.records(S).find(r => r.branches.includes('rail'));
  S.rng.rolls[`strike:${rec.id}:round:1`] = 0.01; // fixture: the government accepts in the first round
  plainSteps(engine);
  // The offer is answered in the Sejm (B11+B12, 17.5.1), a mandatory event of the queue.
  assert.equal(engine.state.sceneId, 'polish_event_strike_response');
  assert.equal(rec.status, 'settlement_pending');
  assert.match(JSON.stringify(engine.ui.paragraphs), /The government offers wages and the return to work/);
  const t = Q.time;
  choose(engine, 'polish_event_strike_response.settlement');
  choose(engine, 'root');
  toMain(engine);
  assert.deepEqual([Q.time, rec.status, rec.outcome], [t, 'ended', 'agreement'], 'no month for the answer');
  assert.equal(S.unions.rail.trust, 55);
  // Accepted in month t, the wage clause is due at t+1: executed before the economy of that month reads it.
  spendMonth(engine);
  assert.equal(rec.settlements[0].status, 'active', 'not yet in the month of the signature');
  spendMonth(engine);
  assert.equal(rec.settlements[0].status, 'executed');
  assert.ok(Math.abs(S.strikes.inputs.wage_agreement_pp - 2 * 0.2) < 1e-9);
  assert.equal(S.economy.history.at(-1).wage_agreement_pp, S.strikes.inputs.wage_agreement_pp);
  assert.deepEqual(PolishRules.validateState(S), []);
  const restored = dendry.saveAndRestore(engine);
  assert.equal(restored.state.qualities.S.strikes.records[rec.id].settlements[0].status, 'executed', 'the record survives a save');
});

// ---- Stage 6b ------------------------------------------------------------------------------------------------

function chjenoPiast(Q) {
  const c = Q.S.cabinet;
  Object.assign(c, { configuration_id: 'chjeno_piast', pm: 'witos', party: 'psl_piast', status: 'active', partner_ids: ['zln', 'pschd', 'psl_piast'],
    supporter_ids: [] });
  for (const k of Object.keys(c.portfolios)) c.portfolios[k] = 'zln';
}
function freeMonth(Q) {
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  Q.month_actions = 0;
}

test('B8+B10 i B11+B12: one case with the communists, an offer and coercion: three answers in each of two phases, B9 apart; one acceptance', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  kppAmongWorkers(Q);
  PolishGovernment.kppContact(Q);
  freeMonth(Q);
  PolishGovernment.changeRelation(Q, 'kpp', 30 - S.actors.relations.kpp, 'fixture');
  chjenoPiast(Q);
  for (const id of ['industry', 'rail']) { S.unions[id].reach = 60; S.unions[id].readiness = 70; S.unions[id].fund = 3; }
  // Three completed months of real wages below 80 (fixture readings; the calendar stays at the opening).
  S.economy.real_wage = 75;
  for (const t of [1, 2, 3]) PolishUnions.watchWages(Q, t);
  engine.goToScene('post_event');
  assert.equal(engine.state.sceneId, 'polish_event_strike_1923');
  assert.deepEqual(ids(engine), ['polish_event_strike_1923.negotiate', 'polish_event_strike_1923.economic_strike',
    'polish_event_strike_1923.cabinet_resignation']);
  const rec = PolishUnions.records(S).find(r => r.kind === 'wage_case');
  choose(engine, 'polish_event_strike_1923.economic_strike');
  // B9 is its own step, after the goal and before participation.
  assert.equal(engine.state.sceneId, 'polish_strike_steps');
  assert.deepEqual(ids(engine), ['polish_strike_steps.full', 'polish_strike_steps.limited', 'polish_strike_steps.none']);
  choose(engine, 'polish_strike_steps.limited');
  choose(engine, 'polish_strike_steps.no_protection');
  choose(engine, 'polish_strike_steps.done');
  toMain(engine);
  assert.equal(Q.time, 1, 'the answers cost no month');
  // A refused round in October: coercion by the police of Chjeno-Piast opens the answer of the Sejm.
  S.rng.rolls[`strike:${rec.id}:round:1`] = 0.99;
  S.rng.rolls[`strike:${rec.id}:round:2`] = 0.01;
  S.rng.rolls[`strike:${rec.id}:clash:1`] = 0.99;
  spendMonth(engine, true);
  assert.equal(engine.state.sceneId, 'polish_event_strike_response');
  assert.deepEqual(ids(engine), ['polish_event_strike_response.demands', 'polish_event_strike_response.settlement', 'polish_event_strike_response.order']);
  assert.ok(rec.repression && rec.rail_militarized);
  choose(engine, 'polish_event_strike_response.settlement');
  choose(engine, 'root');
  toMain(engine);
  assert.deepEqual([rec.status, rec.outcome, rec.settlements.length], ['ended', 'agreement', 1]);
  assert.deepEqual(rec.settlements[0].clauses.map(c => c.kind), ['wages'], 'one limited package');
  assert.equal(PolishUnions.responseDue(Q), false, 'no second acceptance');
  assert.equal(rec.communist_cooperation.mode, 'limited');
  assert.equal(S.actors.communist_cooperation.trial_records.filter(r => r.action_id === rec.id).length, 1);
});

test('Klucz sprawy E6: strike S and settlement U1 refused by part of the strikers: one card for S + U1, not again after a reload; U2 opens a new one', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  kppAmongWorkers(Q);
  PolishGovernment.kppContact(Q);
  freeMonth(Q);
  PolishGovernment.changeRelation(Q, 'kpp', 40 - S.actors.relations.kpp, 'fixture');
  S.unions.industry.reach = 60; S.unions.industry.readiness = 60; S.unions.industry.fund = 3;
  // A package of demands: since stage 8 (8f) the KPP, with its political goal, joins a full committee only for a broad
  // or a political demand.
  unionStep(engine, 'industry', 'prepare_broad');
  engine.goToScene('main');
  choose(engine, 'polish_union_agenda');
  choose(engine, 'polish_union_agenda.industry');
  choose(engine, 'polish_union_agenda.start');
  const rec = PolishUnions.records(S).find(r => r.branches.includes('industry'));
  S.rng.rolls[`kpp_discipline:${rec.id}`] = 0.99; // fixture: the KPP breaks the agreed rules
  S.rng.rolls[`strike:${rec.id}:round:1`] = 0.01;
  S.rng.rolls[`strike:${rec.id}:round:2`] = 0.01;
  choose(engine, 'polish_strike_steps.full');
  choose(engine, 'polish_strike_steps.no_protection');
  choose(engine, 'polish_strike_steps.done');
  assert.equal(engine.state.sceneId, 'polish_event_strike_response');
  choose(engine, 'polish_event_strike_response.settlement');
  choose(engine, 'root');
  // The communists bound by the agreement broke its rules: they refuse the end, and E6 comes first (category 1).
  assert.equal(engine.state.sceneId, 'polish_event_strike_rejection');
  const u1 = rec.settlements[0].id;
  assert.equal(S.events.active.instance_key, `polish_event_strike_rejection:${rec.id}:${u1}`);
  choose(engine, 'polish_event_strike_rejection.support');
  choose(engine, 'root');
  toMain(engine);
  assert.ok(Object.keys(S.events.resolved).includes(`polish_event_strike_rejection:${rec.id}:${u1}`));
  assert.equal(rec.settlements[0].status, 'breached');
  // Save and reload: the answered card does not return.
  const restored = dendry.saveAndRestore(engine);
  restored.goToScene('post_event');
  assert.equal(restored.state.sceneId, 'main');
  const R = restored.state.qualities;
  const again = R.S.strikes.records[rec.id];
  // The next month brings a new offer U2; its refusal opens a new instance.
  restored.goToScene('main');
  choose(restored, 'polish_party_agenda');
  choose(restored, 'polish_party_agenda.organize');
  choose(restored, 'polish_party_agenda.branch_farm_labour');
  choose(restored, 'root');
  assert.equal(restored.state.sceneId, 'polish_event_strike_response');
  choose(restored, 'polish_event_strike_response.settlement');
  choose(restored, 'root');
  assert.equal(restored.state.sceneId, 'polish_event_strike_rejection');
  const u2 = again.settlements[1].id;
  assert.notEqual(u2, u1);
  assert.equal(R.S.events.active.instance_key, `polish_event_strike_rejection:${rec.id}:${u2}`);
});

// Stage 6c through the engine: the plant cards of 8.1 and 8.6 and the agenda (card catalogue 8.1, 8.6; reference 17.12).
function playFromHand(engine, cardId) {
  engine.state.currentHands.main = [{ id: cardId, title: cardId }];
  engine.playCard(cardId);
}

test('the plant cards in the game: Labour signs a collective agreement in the branch submenu for one month; Industry shows the plants, prepares a rescue and the agenda launches it', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  S.cabinet.partner_ids.push('pps');
  S.cabinet.portfolios.labor = 'pps';
  S.cabinet.portfolios.economic = 'pps';
  S.economy.history.push({ t: 0, credit: 30 }, { t: 1, credit: 30 });
  PolishUnions.recordPlants(Q, Q.time);
  playFromHand(engine, 'polish_gov_labor_rights');
  assert.match(JSON.stringify(engine.ui.paragraphs), /industrial plant no\. 1 \(industry\): in difficulty, private owner, capacity 80%/);
  assert.equal(choice(engine, 'polish_gov_labor_rights.derogation').canChoose, false, 'no law on working time yet');
  choose(engine, 'polish_gov_labor_rights.collective');
  assert.deepEqual(ids(engine).filter(id => /collective_/.test(id)).length, 3);
  assert.equal(Q.month_actions || 0, 0, 'the submenu is free');
  choose(engine, 'polish_gov_labor_rights.collective_industry');
  assert.match(JSON.stringify(engine.ui.paragraphs), /collective agreement of industry is signed/);
  choose(engine, 'root');
  toMain(engine);
  assert.equal(Q.time, 2, 'one month');
  assert.equal(S.unions.industry.agreements.length, 1);
  assert.ok(Math.abs(S.economy.history.at(-1).wage_agreement_pp - 1.2) < 1e-9, 'the economy of the month read the agreement once');

  playFromHand(engine, 'polish_gov_industry');
  assert.match(JSON.stringify(engine.ui.paragraphs), /Recorded plants/);
  assert.equal(choice(engine, 'polish_gov_industry.worker_representation').canChoose, false, 'a private plant has no representation');
  choose(engine, 'polish_gov_industry.rescue');
  assert.match(JSON.stringify(engine.ui.paragraphs), /rescue of the industrial plant no\. 1 is prepared/);
  choose(engine, 'root');
  toMain(engine);
  assert.equal(Q.time, 3);
  choose(engine, 'polish_agenda');
  assert.ok(ids(engine).includes('polish_agenda.launch_plant_rescue'));
  choose(engine, 'polish_agenda.launch_plant_rescue');
  choose(engine, 'root');
  toMain(engine);
  const rescue = Object.values(S.projects).find(p => p.type === 'plant_rescue');
  assert.deepEqual([rescue.status, rescue.authorized, Q.time], ['executing', true, 4]);
});

test('B14 in the game: the stabilisation event without the Treasury leads to the formation card with Grabski and the protections for no month', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  S.party_orgs.apparatus.level = 2;
  S.unions.industry.reach = 40;
  PolishGovernment.openCrisis(Q, 'fixture_fall', S.cabinet.id);
  engine.goToScene('polish_event_stabilization');
  assert.equal(choice(engine, 'polish_event_stabilization.protections_terms').canChoose !== false, true);
  choose(engine, 'polish_event_stabilization.protections_terms');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation');
  assert.match(JSON.stringify(engine.ui.paragraphs), /protections and a heavier burden on wealth/);
  assert.equal(Q.month_actions || 0, 0);
});
