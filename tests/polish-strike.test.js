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
  dendry.playCard(engine, 'polish_party_agenda');
  choose(engine, 'polish_party_agenda.organize_unions');
  choose(engine, 'root');
  if (!stop) toMain(engine);
}
// Stage 8 (decision 2A) calibrated the opening so that the KPP has 3.2% among the workers; the communist steps of a
// strike need 5% (14.4). These tests of the communist steps use the earlier opening row of the workers as a fixture.
function kppAmongWorkers(Q) {
  const old = { kpp: 11.04, pps: 38.64, npr: 18.4, psl_wyzwolenie: 1.84, psl_piast: 0.92, pschd: 9.2, zln: 7.36, minorities_bloc: 4.6, other: 8 };
  for (const party of Q.parties) Q['workers_' + party] = old[party];
  PolishElectorate.seedCells(Q);
  PolishElectorate.writeClassMirrors(Q);
}

// Z — 0.87 (the user's decisions of 24 X 2026): the card of a dispute describes the case and offers a strike, a threat or not
// taking up the fight; the strike page sets the goal, the communists and the Milicja; the offer of the government comes on an
// urgent card. A wage case is opened by three readings of real wages below 80.
function wageCase(Q) {
  Q.S.economy.real_wage = 75;
  for (const t of [1, 2, 3]) PolishUnions.watchWages(Q, t);
  return PolishUnions.disputeRecord(Q.S);
}
function playDispute(engine) {
  engine.goToScene('main');
  dendry.playCard(engine, 'polish_union_agenda');
}
// The strike page: the goal, then the strike is announced (no communists, no Milicja unless chosen).
function launch(engine, goal, extra) {
  playDispute(engine);
  choose(engine, 'polish_union_agenda.start');
  assert.equal(engine.state.sceneId, 'polish_union_agenda.setup');
  choose(engine, 'polish_union_agenda.g_' + goal);
  for (const id of extra || []) choose(engine, 'polish_union_agenda.' + id);
  choose(engine, 'polish_union_agenda.launch');
  choose(engine, 'root');
}

test('Karta sporu 0.87: a wage case makes the card of a dispute urgent; it describes the case; the strike page sets the goal; the strike costs the month and half a unit a month for each branch', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  for (const id of ['industry', 'rail']) { S.unions[id].reach = 50; S.unions[id].readiness = 40; }
  assert.equal(PolishUnions.disputeCardAvailable(Q), false, 'no dispute, no card');
  const rec = wageCase(Q);
  S.rng.rolls[`strike:${rec.id}:round:1`] = 0.99; // fixture: no offer in the month of the strike
  assert.deepEqual([rec.kind, rec.branches, rec.status], ['wage_case', ['industry', 'rail'], 'negotiating']);
  engine.goToScene('main');
  assert.deepEqual([dendry.urgentCards(engine), dendry.urgentDeck(engine, 'polish_union_agenda')], [['polish_union_agenda'], 'main.party']);
  playDispute(engine);
  assert.deepEqual(ids(engine), ['polish_union_agenda.start', 'polish_union_agenda.threaten', 'polish_union_agenda.drop', 'easy_discard']);
  assert.match(JSON.stringify(engine.ui.paragraphs), /A dispute in industry and railways.*Real wages have fallen to 75\. The workers of industry and railways demand a rise.*A won strike: wages rise for two months/);
  choose(engine, 'polish_union_agenda.start');
  assert.deepEqual(ids(engine), ['polish_union_agenda.g_small', 'polish_union_agenda.g_big', 'polish_union_agenda.g_political',
    'polish_union_agenda.p_no', 'polish_union_agenda.p_yes', 'polish_union_agenda.launch', 'polish_union_agenda'], 'no communists in these branches now');
  const title = id => [].concat(choice(engine, id).title).join('');
  assert.equal(title('polish_union_agenda.g_small'), '■ Wages and working conditions');
  choose(engine, 'polish_union_agenda.g_big');
  assert.deepEqual([title('polish_union_agenda.g_small'), title('polish_union_agenda.g_big')],
    ['□ Wages and working conditions', '■ Wages, working conditions and works councils']);
  const cash = S.party_orgs.cash;
  choose(engine, 'polish_union_agenda.launch');
  choose(engine, 'root');
  toMain(engine);
  assert.equal(Q.time, 2, 'the strike costs the month');
  assert.deepEqual([rec.status, rec.demands.map(d => d.kind), rec.threshold], ['active', ['wages', 'councils'], 60]);
  assert.ok(Math.abs(S.party_orgs.cash - (cash - 1)) < 1e-9, 'half a unit for each of the two branches');
  assert.equal(PolishUnions.disputeCardAvailable(Q), false, 'the strike is no longer a waiting dispute');
});

test('Związki zawodowe jako zwykła karta (Z — 0.57; 0.87): the card of a dispute is urgent while a case waits; a dispute of a branch with the leadership makes it an ordinary card with the mediation', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  engine.goToScene('main');
  assert.ok(!dendry.urgentCards(engine).includes('polish_union_agenda'));
  // A dispute of the railway branch with the leadership of PPS over a concrete change.
  S.unions.rail.dissent = 12;
  S.unions.rail.dissent_causes.push({ id: 'fixture', amount: 12, status: 'open' });
  assert.deepEqual([PolishUnions.disputeCardAvailable(Q), PolishUnions.disputeUrgent(Q)], [true, false], 'an ordinary card');
  playDispute(engine);
  assert.deepEqual(ids(engine), ['polish_union_agenda.mediate', 'easy_discard']);
  assert.match(JSON.stringify(engine.ui.paragraphs), /Railways is in dispute with the leadership of PPS/);
  choose(engine, 'polish_union_agenda.mediate');
  choose(engine, 'root');
  toMain(engine);
  assert.deepEqual([Q.time, S.unions.rail.dissent], [2, 4], 'the mediation costs the month (−8)');
});

test('Groźba i rezygnacja 0.87: a refused threat readies the workers and leaves the strike; a threat that works settles at once; not taking up the fight costs trust and the case can return', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  let rec = wageCase(Q);
  S.rng.rolls[`strike:${rec.id}:round:1`] = 0.99; // fixture: the government refuses the threat
  playDispute(engine);
  choose(engine, 'polish_union_agenda.threaten');
  assert.match(JSON.stringify(engine.ui.paragraphs), /The government rejects the threat/);
  choose(engine, 'root');
  toMain(engine);
  assert.deepEqual([Q.time, S.unions.industry.readiness, rec.status, rec.pps_answered], [2, 40, 'negotiating', true]);
  playDispute(engine);
  assert.equal(choice(engine, 'polish_union_agenda.threaten').canChoose, false, 'one threat in a dispute');
  assert.notEqual(choice(engine, 'polish_union_agenda.start').canChoose, false);
  const trust = S.unions.industry.trust;
  choose(engine, 'polish_union_agenda.drop');
  choose(engine, 'root');
  toMain(engine);
  assert.deepEqual([Q.time, rec.status, rec.outcome, S.unions.industry.trust], [2, 'ended', 'dropped', trust - 3], 'not fighting costs no month');
  assert.equal(S.strikes.wage_watch.latched, false, 'the case can come back');
  // A threat the government gives way to: a settlement at once and more support among the workers.
  const other = dendry.startGame();
  const R = other.state.qualities;
  rec = wageCase(R);
  R.S.rng.rolls[`strike:${rec.id}:round:1`] = 0.01;
  const before = PolishElectorate.aggregate(R.S, c => c.class_id === 'workers', 'pps');
  playDispute(other);
  choose(other, 'polish_union_agenda.threaten');
  assert.match(JSON.stringify(other.ui.paragraphs), /The government gives way to the threat: wages and working conditions/);
  assert.deepEqual([rec.status, rec.outcome, rec.settlements.length], ['ended', 'agreement', 1]);
  assert.ok(PolishElectorate.aggregate(R.S, c => c.class_id === 'workers', 'pps') > before, 'a won dispute raises the support of PPS among the workers');
});

test('Oferta rządu 0.87: the offer is an urgent card of the Party deck answered without a month; accepting ends the strike on the agreed terms and the rise comes the next month', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  for (const id of ['industry', 'rail']) { S.unions[id].reach = 45; S.unions[id].readiness = 40; }
  const rec = wageCase(Q);
  S.rng.rolls[`strike:${rec.id}:round:1`] = 0.01; // fixture: the government offers in the first round
  launch(engine, 'small');
  toMain(engine);
  assert.equal(rec.status, 'settlement_pending');
  assert.deepEqual([dendry.urgentCards(engine), dendry.urgentDeck(engine, 'polish_strike_offer')], [['polish_strike_offer'], 'main.party']);
  dendry.playCard(engine, 'polish_strike_offer');
  assert.deepEqual(ids(engine), ['polish_strike_offer.accept', 'polish_strike_offer.continue', 'polish_strike_offer.end']);
  assert.match(JSON.stringify(engine.ui.paragraphs), /The government offers wages and working conditions \(all the demands\)/);
  const t = Q.time;
  choose(engine, 'polish_strike_offer.accept');
  choose(engine, 'root');
  toMain(engine);
  assert.deepEqual([Q.time, rec.status, rec.outcome], [t, 'ended', 'agreement'], 'no month for the answer');
  assert.deepEqual([S.unions.industry.trust, S.unions.rail.trust], [55, 55]);
  // Accepted in month t, the wage clause is due at t+1: executed before the economy of that month reads it.
  spendMonth(engine);
  assert.equal(rec.settlements[0].status, 'active', 'not yet in the month of the signature');
  spendMonth(engine);
  assert.equal(rec.settlements[0].status, 'executed');
  assert.ok(Math.abs(S.strikes.inputs.wage_agreement_pp - 2 * (0.6 + 0.2)) < 1e-9);
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

test('B8+B10 i B11+B12 (Z — 0.87): one dispute with the communists, coercion and an offer: the strike page, the offer card without an offer, then with one; one acceptance', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  kppAmongWorkers(Q);
  PolishGovernment.kppContact(Q);
  freeMonth(Q);
  PolishGovernment.changeRelation(Q, 'kpp', 30 - S.actors.relations.kpp, 'fixture');
  chjenoPiast(Q);
  for (const id of ['industry', 'rail']) { S.unions[id].reach = 60; S.unions[id].readiness = 70; }
  S.party_orgs.cash = 10;
  const rec = wageCase(Q);
  // A refused first round (in the month of the strike): coercion by the police of Chjeno-Piast comes on the offer card,
  // without an offer; the second round brings an offer.
  S.rng.rolls[`strike:${rec.id}:round:1`] = 0.99;
  S.rng.rolls[`strike:${rec.id}:round:2`] = 0.01;
  S.rng.rolls[`strike:${rec.id}:clash:1`] = 0.99;
  playDispute(engine);
  choose(engine, 'polish_union_agenda.start');
  assert.ok(ids(engine).includes('polish_union_agenda.c_yes') && ids(engine).includes('polish_union_agenda.c_no'), 'the communists take part: yes or no');
  choose(engine, 'polish_union_agenda.c_yes');
  choose(engine, 'polish_union_agenda.launch');
  choose(engine, 'root');
  toMain(engine);
  assert.ok(rec.repression && rec.rail_militarized);
  dendry.playCard(engine, 'polish_strike_offer');
  assert.deepEqual(ids(engine), ['polish_strike_offer.continue', 'polish_strike_offer.end'], 'nothing to accept');
  assert.match(JSON.stringify(engine.ui.paragraphs), /The government makes no offer, and the police act against the strikers/);
  choose(engine, 'polish_strike_offer.continue');
  choose(engine, 'root');
  toMain(engine);
  spendMonth(engine);
  dendry.playCard(engine, 'polish_strike_offer');
  choose(engine, 'polish_strike_offer.accept');
  choose(engine, 'root');
  toMain(engine);
  assert.deepEqual([rec.status, rec.outcome, rec.settlements.length], ['ended', 'agreement', 1]);
  assert.deepEqual(rec.settlements[0].clauses.map(c => c.kind), ['wages', 'repression', 'rail_militarization'],
    'one package: the demands with the end of the coercion added after the refusal');
  assert.equal(PolishUnions.offerCardActive(Q), false, 'no second acceptance');
  assert.equal(rec.communist_cooperation.mode, 'limited');
  assert.equal(S.actors.communist_cooperation.trial_records.filter(r => r.action_id === rec.id).length, 1);
});

test('Ugoda kończy strajk 0.87: a branch that refuses the accepted offer has the end imposed; the strike ends at once and no card E6 comes', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  for (const id of ['industry', 'rail']) { S.unions[id].reach = 60; S.unions[id].readiness = 60; }
  S.unions.industry.trust = 0; // fixture: the industrial union will refuse a partial offer
  const rec = wageCase(Q);
  launch(engine, 'big');
  toMain(engine);
  const full = PolishUnions.roundChance(S, rec, 60).chance, reduced = PolishUnions.roundChance(S, rec, 40).chance;
  S.rng.rolls[`strike:${rec.id}:round:1`] = (full + reduced) / 2; // only wages and working conditions, without the councils
  spendMonth(engine);
  dendry.playCard(engine, 'polish_strike_offer');
  assert.match(JSON.stringify(engine.ui.paragraphs), /\(part of the demands\).*Industry does not want to end on these terms/);
  choose(engine, 'polish_strike_offer.accept');
  choose(engine, 'root');
  toMain(engine);
  assert.deepEqual([rec.status, rec.outcome, rec.awaiting_rejection, S.unions.industry.dissent], ['ended', 'agreement', null, 10]);
  assert.equal(PolishUnions.rejectionDue(Q), false, 'the card E6 left the game');
  assert.notEqual(engine.state.sceneId, 'polish_event_strike_rejection');
  // An end imposed on every branch is no win: the support of PPS among the workers does not grow.
  const other = dendry.startGame();
  const R = other.state.qualities;
  for (const id of ['industry', 'rail']) { R.S.unions[id].reach = 60; R.S.unions[id].readiness = 60; R.S.unions[id].trust = 0; }
  const lost = wageCase(R);
  launch(other, 'big');
  toMain(other);
  R.S.rng.rolls[`strike:${lost.id}:round:1`] = (PolishUnions.roundChance(R.S, lost, 60).chance + PolishUnions.roundChance(R.S, lost, 40).chance) / 2;
  spendMonth(other);
  const before = PolishElectorate.aggregate(R.S, c => c.class_id === 'workers', 'pps');
  dendry.playCard(other, 'polish_strike_offer');
  assert.match(JSON.stringify(other.ui.paragraphs), /Industry and Railways do not want to end on these terms; if you accept, the end is imposed on them/);
  choose(other, 'polish_strike_offer.accept');
  assert.deepEqual([lost.outcome, PolishElectorate.aggregate(R.S, c => c.class_id === 'workers', 'pps')], ['agreement', before]);
});

// Stage 6c through the engine: the plant cards of 8.1 and 8.6 and the agenda (card catalogue 8.1, 8.6; reference 17.12).
function playFromHand(engine, cardId) {
  engine.state.currentHands.main = [{ id: cardId, title: cardId }];
  engine.playCard(cardId);
}

// Z — 0.94 (decisions of 24 X 2026): no branch submenu — the agreement goes to the branch where our union is strongest; the
// derogation needs no inspection law; Industry has orders, the rescue and public control.
test('the plant cards in the game: Labour signs a collective agreement in its strongest branch for one month; Industry shows the plants and starts a rescue', () => {
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
  assert.equal(choice(engine, 'polish_gov_labor_rights.derogation').canChoose, true, 'the act on working time of 1919 is enough');
  assert.match([].concat(choice(engine, 'polish_gov_labor_rights.collective').subtitle).join(''), /where our union is strongest \(now: industry\)/);
  choose(engine, 'polish_gov_labor_rights.collective');
  assert.match(JSON.stringify(engine.ui.paragraphs), /collective agreement of industry is signed/);
  choose(engine, 'root');
  toMain(engine);
  assert.equal(Q.time, 2, 'one month');
  assert.equal(S.unions.industry.agreements.length, 1);
  assert.ok(Math.abs(S.economy.history.at(-1).wage_agreement_pp - 1.2) < 1e-9, 'the economy of the month read the agreement once');

  playFromHand(engine, 'polish_gov_industry');
  assert.match(JSON.stringify(engine.ui.paragraphs), /Recorded plants/);
  assert.deepEqual(ids(engine).filter(id => id.startsWith('polish_gov_industry.')), ['polish_gov_industry.orders', 'polish_gov_industry.rescue',
    'polish_gov_industry.public_control']);
  choose(engine, 'polish_gov_industry.rescue');
  // Z — 0.93 (decision 4A of 24 X 2026): the rescue starts in the same decision.
  assert.match(JSON.stringify(engine.ui.paragraphs), /rescue of the industrial plant no\. 1 is a conditional credit\. Started: Rescue of a plant/);
  choose(engine, 'root');
  toMain(engine);
  const rescue = Object.values(S.projects).find(p => p.type === 'plant_rescue');
  assert.deepEqual([rescue.status, rescue.authorized, Q.time], ['executing', true, 3]);
});

test('B14 in the game: the stabilisation event without the Treasury leads to the formation card with Grabski and the protections for no month', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  S.party_orgs.apparatus.level = 2;
  S.unions.industry.reach = 40;
  // Z — 0.71 (decision 4A): Grabski stands from XII 1923, so the fixture crisis is in his period.
  Q.year = 1924; Q.month = 1; Q.time = PolishRules.timeOf(1924, 1);
  PolishGovernment.openCrisis(Q, 'fixture_fall', S.cabinet.id);
  engine.goToScene('polish_event_stabilization');
  assert.equal(choice(engine, 'polish_event_stabilization.protections_terms').canChoose !== false, true);
  choose(engine, 'polish_event_stabilization.protections_terms');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation');
  // Z — 0.71: the wizard opens on its introduction; the preset offer with the protections is on the summary.
  choose(engine, 'polish_cabinet_formation.variants');
  choose(engine, 'polish_cabinet_formation.var_expert');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation.summary');
  assert.match(JSON.stringify(engine.ui.paragraphs), /protections and a heavier burden on wealth/);
  assert.equal(Q.month_actions || 0, 0);
});
