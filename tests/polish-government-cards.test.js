const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Engine tests of the state cards of stage 4 (implementation plan; technical reference 12.2, 17.10–17.15;
// card catalogue 7.2–7.4, 8.1–8.11, 8.13, 8.16, 9.11–9.13): the Government deck with PPS portfolios, the
// agenda, the adviser's free step, the unemployment bill, the Budget card, the constitutional card and
// the economic events.
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
function content(engine) {
  return JSON.stringify(engine.ui.paragraphs);
}
function playFromHand(engine, cardId) {
  engine.state.currentHands.main = [{ id: cardId, title: cardId }];
  engine.playCard(cardId);
}
function november(engine, values) {
  const Q = engine.state.qualities;
  Q.year = 1922; Q.month = 11; Q.time = 11;
  if (values) {
    for (const group of Q.classes) for (const party of Q.parties) Q[`${group}_${party}`] = values[party] || 0;
    if (Object.values(values).some(v => v > 0)) { PolishElectorate.seedCells(Q); PolishElectorate.writeClassMirrors(Q); }
  }
  engine._runActions(engine.game.scenes.polish_opening_state.onArrival);
  engine.goToScene('post_event');
  choose(engine, 'sejm_election.calculate');
  assert.equal(engine.state.sceneId, 'sejm_election.government');
}
// PPS and PSL Wyzwolenie with minority support after the 1922 election; PPS holds Labour.
function leftCabinet(engine) {
  const Q = engine.state.qualities;
  november(engine, { pps: 35, psl_wyzwolenie: 30, minorities_bloc: 35 });
  const result = dendry.formCabinet(engine, { configuration: 'left_minority', mode: 'member', minorities: true });
  assert.equal(result.appointed.configuration_id, 'left_minority');
  assert.equal(Q.S.cabinet.portfolios.labor, 'pps');
  // Continue to the ordinary December turn after the offices of 1922.
  for (let i = 0; i < 40 && engine.state.sceneId !== 'main'; i++) {
    const open = (engine.getCurrentChoices() || []).filter(c => c.canChoose !== false);
    engine.choose((engine.getCurrentChoices() || []).indexOf(open[0]));
  }
  engine.goToScene('main');
  for (const id of Q.S.cabinet.agreement_ids) Q.S.agreements[id].obligations = []; // isolate from the programme dates
  return Q;
}
// Through a mandatory sequence (the December offices of 1922) back to the ordinary turn.
function toMain(engine) {
  for (let i = 0; i < 60 && engine.state.sceneId !== 'main'; i++) {
    const all = engine.getCurrentChoices() || [];
    const open = all.filter(c => c.canChoose !== false);
    engine.choose(all.indexOf(open[0]));
  }
  assert.equal(engine.state.sceneId, 'main');
}
function offered(engine, deck) {
  return (engine._compileChoices(engine.game.scenes[deck]) || []).filter(c => c.canChoose !== false).map(c => c.id);
}

test('Roboty pod Pracą in the game: the Government deck offers the Labour cards; a prepared programme waits in the agenda; the launch costs its month', () => {
  const engine = dendry.startGame();
  const Q = leftCabinet(engine);
  const deck = offered(engine, 'main.govt');
  for (const id of ['polish_gov_public_works', 'polish_gov_social_welfare', 'polish_gov_labor_rights']) assert.ok(deck.includes(id), id);
  for (const id of ['polish_gov_finance', 'polish_gov_land', 'polish_gov_education']) assert.ok(!deck.includes(id), id + ' needs another portfolio');
  const t = Q.time;
  playFromHand(engine, 'polish_gov_public_works');
  assert.match(content(engine), /Budget this month/);
  choose(engine, 'easy_discard');
  assert.equal(Q.time, t, 'closing the card is free');
  assert.deepEqual(engine.state.currentHands.main.map(c => c.id), ['polish_gov_public_works'], 'the card goes back to the hand');
  engine.playCard('polish_gov_public_works');
  choose(engine, 'polish_gov_public_works.employment');
  assert.match(content(engine), /Its launch waits in the agenda/);
  choose(engine, 'root');
  assert.equal(Q.time, t + 1, 'the preparation spent the month');
  toMain(engine); // the December offices of 1922 come first
  assert.ok(ids(engine).includes('polish_agenda'), 'the agenda needs no card from the hand');
  engine.playPinnedCard('polish_agenda');
  assert.equal(choice(engine, 'polish_agenda.launch_public_works').canChoose, true);
  choose(engine, 'polish_agenda.launch_public_works');
  choose(engine, 'root');
  assert.equal(Q.time, t + 2);
  toMain(engine);
  const works = Object.values(Q.S.projects).find(p => p.type === 'public_works');
  assert.equal(works.status, 'executing');
  assert.equal(Q.S.economy.history.at(-1).project_charges, 2, 'building costs 2 B from its launch month');
  engine.goToScene('status.economy');
  assert.match(content(engine), /Public works \(quick employment of the unemployed\): being built/);
});

test('Jedno przekierowanie: Moraczewski opens the Public Works card; its one step costs no month and uses the shared adviser cooldown', () => {
  const engine = dendry.startGame();
  const Q = leftCabinet(engine);
  Q.moraczewski_advisor = 1;
  engine.goToScene('main');
  const t = Q.time;
  engine.playPinnedCard('moraczewski');
  assert.equal(choice(engine, 'moraczewski.public_works').canChoose, true);
  choose(engine, 'moraczewski.public_works');
  assert.equal(engine.state.sceneId, 'polish_gov_public_works');
  choose(engine, 'polish_gov_public_works.infrastructure');
  choose(engine, 'root');
  assert.equal(Q.time, t, 'the adviser step costs no month');
  assert.equal(PolishRules.cooldownRemaining(Q, 'advisor'), 6);
  const prepared = Object.values(Q.S.projects).find(p => p.type === 'public_works');
  assert.deepEqual([prepared.status, prepared.variant], ['prepared', 'infrastructure']);
  const txn = Q.S.history.actions.filter(a => a.source === 'advisor').at(-1);
  assert.equal(txn.redirect.action_id, 'government.public_works.infrastructure');
});

test('Arciszewski needs PPS with Labour; outside the cabinet his Labour Programme is blocked with its reason', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.arciszewski_advisor = 1;
  engine.goToScene('main');
  engine.playPinnedCard('arciszewski');
  assert.equal(choice(engine, 'arciszewski.labour_programme').canChoose, false);
  assert.equal(choice(engine, 'arciszewski.welfare_programme').canChoose, false);
  assert.match(String(choice(engine, 'arciszewski.labour_programme').subtitle), /Needs PPS in the cabinet with Labour/);
});

test('D1 and D2 from opposition: one initiative; D2 after the settlement; the Sejm votes at once; the Senate follows its dates', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  november(engine, { zln: 30, pschd: 15, psl_piast: 30, pps: 10, other: 15 });
  Q.S.history.cabinets.push({ id: 'nowak_fixture', pm: 'nowak', end_reason: 'fall', ended_at: 5 });
  dendry.formCabinet(engine, { mode: 'opposition' });
  for (let i = 0; i < 40 && engine.state.sceneId !== 'main'; i++) {
    const open = (engine.getCurrentChoices() || []).filter(c => c.canChoose !== false);
    engine.choose((engine.getCurrentChoices() || []).indexOf(open[0]));
  }
  engine.goToScene('main');
  assert.equal(PolishGovernment.ppsStance(Q.S), 'opposition');
  assert.ok(ids(engine).includes('polish_unemployment_bill'), 'the guaranteed agenda after the 1922 election');
  const t = Q.time;
  engine.playPinnedCard('polish_unemployment_bill');
  assert.ok(ids(engine).includes('polish_unemployment_bill.start') && !ids(engine).includes('polish_unemployment_bill.full'));
  choose(engine, 'polish_unemployment_bill.start');
  choose(engine, 'root');
  assert.equal(Q.time, t + 1, 'D1 costs one month');
  engine.playPinnedCard('polish_unemployment_bill');
  assert.ok(ids(engine).includes('polish_unemployment_bill.full'));
  choose(engine, 'polish_unemployment_bill.full');
  choose(engine, 'root');
  assert.equal(Q.time, t + 1, 'D2 costs no month');
  const bill = Q.S.chapter.unemployment_bill;
  assert.ok(['in_procedure', 'rejected'].includes(bill.status));
  if (bill.status === 'in_procedure') {
    assert.ok(bill.senate_notice_due && bill.senate_return_due, 'both dated steps are recorded');
    engine.goToScene('status.economy');
    assert.match(content(engine), /Laws in procedure/);
  }
  assert.ok(!ids(engine).includes('polish_unemployment_bill'), 'no second initiative');
});

test('the Budget card: a package of the cabinet before the Sejm; PPS as its supporter answers once for 0 T', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  PolishProjects.newPackage(Q, { instruments: ['broad'], necessary: false, reason: 'deficit' });
  engine.goToScene('main');
  assert.ok(ids(engine).includes('polish_budget_package'));
  assert.match(content(engine), /The cabinet proposes a package/);
  const t = Q.time;
  engine.playPinnedCard('polish_budget_package');
  assert.equal(choice(engine, 'polish_budget_package.protect').canChoose, false, 'no cut of benefits in this package');
  choose(engine, 'polish_budget_package.support');
  choose(engine, 'root');
  assert.equal(Q.time, t, 'the answer costs no month');
  assert.equal(Q.S.economy.pending_package.pps_vote, 'yes');
  assert.ok(!ids(engine).includes('polish_budget_package'), 'one answer per package');
});

test('the constitutional card: two main actions; the motion waits in the agenda and needs both chambers', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  // Z — 0.56: the card waits for the constitutional debate of December 1924; here the debate is opened at once.
  assert.ok(!offered(engine, 'main.parliament').includes('polish_constitution_project'), 'not before the constitutional debate');
  globalThis.PolishProjects.openConstitutionDebate(Q);
  assert.ok(offered(engine, 'main.parliament').includes('polish_constitution_project'), 'once the debate is open (card 7.4)');
  playFromHand(engine, 'polish_constitution_project');
  assert.equal(choice(engine, 'polish_constitution_project.presidential_arbitration').canChoose, false);
  choose(engine, 'polish_constitution_project.democratic_guarantees');
  choose(engine, 'root');
  assert.equal(Q.time, 2, 'the first step spent the month');
  engine.playPinnedCard('polish_agenda');
  const submit = choice(engine, 'polish_agenda.submit_democratic_guarantees');
  assert.equal(submit.canChoose, false);
  assert.match(String(submit.subtitle), /Senate is not yet constituted/);
});

test('9.11 in the game: a financial crisis without a reform queues the stabilisation event; without the Treasury PPS leaves it to the cabinet', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.S.economy.history.push({ t: 0, inflation_m: 25, budget: 1, credit: 50 });
  Q.S.economy.inflation_m = 30; // the settlement's own reading stays at 20% a month or more
  engine.state.currentHands.main = [{ id: 'inter_party_relationships', title: 'Talks' }];
  engine.playCard('inter_party_relationships');
  choose(engine, 'inter_party_relationships.psl_wyzwolenie');
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'polish_event_stabilization');
  assert.ok(ids(engine).includes('polish_event_stabilization.wait'));
  assert.equal(choice(engine, 'polish_event_stabilization.protections_terms').canChoose, false);
  choose(engine, 'polish_event_stabilization.wait');
  choose(engine, 'root');
  assert.equal(Q.S.events.resolved.polish_event_stabilization !== undefined || engine.state.sceneId === 'main', true);
});

// Z — 0.56 (item 2 of 5 X 2026): the constitutional debate opens with its event in December 1924, once, and only then the
// constitutional card comes into the Parliament deck.
test('Debata o konstytucji: the event of December 1924 opens the debate once, and with it the constitutional card', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const P = globalThis.PolishProjects;
  assert.equal(P.CONSTITUTION_DEBATE_AT, globalThis.PolishRules.timeOf(1924, 12));
  assert.equal(P.constitutionDebateDue(Q), false, 'not in 1922');
  Q.time = P.CONSTITUTION_DEBATE_AT;
  assert.equal(P.constitutionDebateDue(Q), true, 'due in December 1924');
  assert.ok(!offered(engine, 'main.parliament').includes('polish_constitution_project'), 'the card waits for the event');
  engine.goToScene('polish_event_constitution_debate');
  assert.match(JSON.stringify(engine.ui.paragraphs), /26 October 1924 the Popular National Union \(ZLN\)/);
  assert.equal(P.constitutionDebateOpen(Q.S), true);
  assert.equal(P.constitutionDebateDue(Q), false, 'once');
  assert.ok(offered(engine, 'main.parliament').includes('polish_constitution_project'), 'the card comes into the deck');
});
