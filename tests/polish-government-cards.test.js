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

// Z — 0.93 (decision 4A of 24 X 2026): the programme starts in the decision that chooses it; there is no card of prepared reforms.
test('Roboty pod Pracą in the game: the Government deck offers the Labour cards; the chosen programme starts at once for one month and one cost', () => {
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
  assert.match(content(engine), /Started: Public works — 1 B a month while it works; first effects in 3 months\./);
  choose(engine, 'root');
  assert.equal(Q.time, t + 1, 'one decision, one month');
  toMain(engine); // the December offices of 1922 come first
  assert.deepEqual(dendry.urgentCards(engine), [], 'no card of prepared reforms');
  const works = Object.values(Q.S.projects).find(p => p.type === 'public_works');
  assert.equal(works.status, 'executing');
  assert.equal(Q.S.economy.history.at(-1).project_charges, 1, 'one cost of 1 B from its launch month');
  engine.goToScene('status.economy');
  assert.match(content(engine), /Public works \(quick employment of the unemployed\): being built/);
});

// Z — 0.77 (decisions 3A and 4A of 8 X 2026): an ordinary card of the Government deck rests 3 months after use, like a party
// card; the deck says when the first resting card comes back. An urgent card takes a free place of its row, so with one
// ordinary card the row is full and nothing is drawn; urgent cards never rest.
test('Karty rządu 0.77: a used government card rests 3 months; the deck says when the first resting card comes back', () => {
  const engine = dendry.startGame();
  const Q = leftCabinet(engine);
  const drawable = () => PolishEngineHooks.legalDeckCards(engine, 'main.govt').map(c => c.id);
  playFromHand(engine, 'polish_gov_public_works');
  choose(engine, 'polish_gov_public_works.employment');
  assert.equal(PolishRules.cardRest(Q, 'polish_gov_public_works'), 3);
  choose(engine, 'root');
  toMain(engine);
  assert.ok(!drawable().includes('polish_gov_public_works'), 'not drawn while it rests');
  assert.ok(drawable().includes('polish_gov_social_welfare'), 'the other cards of the ministry can be drawn');
  // Z — 0.93: the card of prepared reforms is gone; urgent cards in a full row are tested with the Party deck (polish-turn).
  // When every card that could be drawn rests, the deck says when the first comes back.
  engine.state.currentHands.main = [];
  for (const id of drawable()) Q.S.cooldowns['rest:' + id] = Q.time + 2;
  Q.S.cooldowns['rest:polish_gov_public_works'] = Q.time + 1;
  const empty = PolishEngineHooks.deckView(engine, 'main.govt');
  assert.equal(empty.available, false);
  assert.match(empty.reason, /resting after use; the first comes back in 1 month\./);
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
  const works = Object.values(Q.S.projects).find(p => p.type === 'public_works');
  assert.deepEqual([works.status, works.variant], ['executing', 'infrastructure'], 'Z — 0.93: started at once');
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

// Z — 0.81 (decisions of 20 X 2026): the card Legislative Initiative and the urgent card of its vote in the game, in Polish.
test('Inicjatywa w grze 0.81: one card of the Parliament deck, the laws in plain Polish, the urgent vote card next month without a month', () => {
  const engine = dendry.startGame(1922, 'pl');
  const Q = engine.state.qualities;
  const plain = x => (x == null ? '' : typeof x === 'string' ? x : Array.isArray(x) ? x.map(plain).join('') : plain(x.content));
  try {
    november(engine, { zln: 30, pschd: 15, psl_piast: 30, pps: 10, other: 15 });
    Q.S.history.cabinets.push({ id: 'nowak_fixture', pm: 'nowak', end_reason: 'fall', ended_at: 5 });
    dendry.formCabinet(engine, { mode: 'opposition' });
    const settle = () => {
      for (let i = 0; i < 40 && engine.state.sceneId !== 'main'; i++) {
        const open = (engine.getCurrentChoices() || []).filter(c => c.canChoose !== false);
        engine.choose((engine.getCurrentChoices() || []).indexOf(open[0]));
      }
    };
    settle();
    engine.goToScene('main');
    const parliament = () => (engine._compileChoices(engine.game.scenes['main.parliament']) || []).filter(c => c.canChoose !== false).map(c => c.id);
    assert.ok(parliament().includes('polish_legislative_initiative'));
    assert.ok(!parliament().includes('polish_unemployment_bill') && !parliament().includes('polish_parliament_army_oversight'), 'the old cards left the deck');
    const t = Q.time;
    dendry.playCard(engine, 'polish_legislative_initiative');
    const shown = PolishProjects.initiativeShown(Q);
    assert.ok(shown.length > 0 && shown.length <= 5);
    for (const id of shown) assert.ok(ids(engine).includes('polish_legislative_initiative.' + id), id);
    assert.ok(ids(engine).includes('polish_legislative_initiative.skip'));
    assert.match(plain(choice(engine, 'polish_legislative_initiative.unemployment').subtitle),
      /^Zasiłek dla bezrobotnych z budżetu państwa: pełny kosztuje 2 jednostki budżetu miesięcznie, ograniczony 1\..* Samo wniesienie: sprzeciw Lewicy PPS spada \(−2\)\.$/);
    assert.equal(plain(choice(engine, 'polish_legislative_initiative.unemployment').title), 'Ochrona bezrobotnych');
    choose(engine, 'polish_legislative_initiative.unemployment');
    assert.match(content(engine), /PPS wnosi projekt ustawy „Ochrona bezrobotnych”; Sejm zagłosuje nad nim w przyszłym miesiącu/);
    choose(engine, 'root');
    assert.equal(Q.time, t + 1, 'taking a law up costs one month');
    settle();
    assert.ok(!parliament().includes('polish_legislative_initiative'), 'one initiative at a time');
    dendry.playCard(engine, 'polish_initiative_vote');
    const outcome = Q.pl_iv_outcome;
    assert.ok(['full', 'choice', 'rejected'].includes(outcome));
    assert.match(content(engine), /Głosowanie nad naszym projektem.*Ochrona bezrobotnych/);
    choose(engine, 'polish_initiative_vote.' + (outcome === 'full' ? 'passed' : outcome === 'choice' ? 'limited' : 'rejected'));
    choose(engine, 'root');
    assert.equal(Q.time, t + 1, 'the vote costs no month');
    if (outcome !== 'rejected') assert.ok(PolishProjects.operatingProtection(Q.S), 'the protection works');
    assert.ok(!Q.S.parliament.laws.some(l => l.status === 'in_procedure'), 'no Senate stage');
    assert.ok(parliament().includes('polish_legislative_initiative'), 'the card comes back at once');
  } finally {
    PolishRules.setLanguage('en');
  }
});

test('the Budget card: a package of the cabinet before the Sejm; PPS as its supporter answers once for 0 T', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  PolishProjects.newPackage(Q, { instruments: ['broad'], necessary: false, reason: 'deficit' });
  engine.goToScene('main');
  // Z — 0.74 (decision 3A of 8 X 2026): an urgent card of the Parliament deck until the vote of the package.
  assert.ok(dendry.urgentCards(engine).includes('polish_budget_package'));
  assert.equal(dendry.urgentDeck(engine, 'polish_budget_package'), 'main.parliament');
  assert.equal(PolishRules.cardDeadline(Q, 'polish_budget_package'), Q.S.economy.pending_package.vote_at);
  assert.match(content(engine), /The cabinet proposes a package/);
  const t = Q.time;
  engine.playCard('polish_budget_package');
  assert.equal(choice(engine, 'polish_budget_package.protect').canChoose, false, 'no cut of benefits in this package');
  choose(engine, 'polish_budget_package.support');
  choose(engine, 'root');
  assert.equal(Q.time, t, 'the answer costs no month');
  assert.equal(Q.S.economy.pending_package.pps_vote, 'yes');
  assert.ok(!dendry.urgentCards(engine).includes('polish_budget_package'), 'one answer per package');
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

// Z — 0.56 (item 2 of 5 X 2026) and 0.82 (the user's decisions of 21 X 2026): the constitutional debate opens with its event in
// December 1924, once; on its page PPS marks the motions it supports in its order. The old card stays out of the deck.
test('Debata o konstytucji 0.82 w grze: one page of seven motions marked in order, a free position, the vote card of Parliament in Polish', () => {
  const engine = dendry.startGame(1922, 'pl');
  const Q = engine.state.qualities;
  const P = globalThis.PolishProjects;
  const plain = x => (x == null ? '' : typeof x === 'string' ? x : Array.isArray(x) ? x.map(plain).join('') : plain(x.content));
  const page = () => plain(engine.ui.paragraphs.map(p => [p.content, ' ']));
  try {
    assert.equal(P.CONSTITUTION_DEBATE_AT, globalThis.PolishRules.timeOf(1924, 12));
    assert.equal(P.constitutionDebateDue(Q), false, 'not in 1922');
    Q.time = P.CONSTITUTION_DEBATE_AT;
    assert.equal(P.constitutionDebateDue(Q), true, 'due in December 1924');
    engine.goToScene('polish_event_constitution_debate');
    assert.match(page(), /26 października 1924 r\. Związek Ludowo-Narodowy.*Debata nie oznacza głosowania.*pierwszy na naszej liście ma szansę ok\. 17%.*Nasza lista: na razie żaden wniosek\./);
    assert.deepEqual([P.constitutionDebateOpen(Q.S), P.constitutionDebateDue(Q)], [true, false], 'once');
    assert.deepEqual(ids(engine), [...P.MOTION_IDS.map(id => 'polish_event_constitution_debate.m_' + id), 'polish_event_constitution_debate.declare']);
    const arbitration = choice(engine, 'polish_event_constitution_debate.m_presidential_arbitration');
    assert.deepEqual([arbitration.canChoose, plain(arbitration.subtitle)], [false, 'Tylko przy linii „Silniejsza prezydentura” (karta „Jakiej władzy chcemy”).']);
    assert.equal(plain(choice(engine, 'polish_event_constitution_debate.m_referendum').title), '□ Referendum ludowe');
    assert.match(plain(choice(engine, 'polish_event_constitution_debate.m_church_separation').subtitle),
      /^Koniec „naczelnego stanowiska” Kościoła katolickiego.* Samo poparcie: stosunki z chadecją się pogarszają \(−3\), stosunki z PSL „Piast” się pogarszają \(−3\), sprzeciw Lewicy PPS spada \(−2\)\.$/);
    choose(engine, 'polish_event_constitution_debate.m_constructive_vonc');
    choose(engine, 'polish_event_constitution_debate.m_labour_chamber');
    assert.equal(engine.state.sceneId, 'polish_event_constitution_debate.menu');
    assert.match(page(), /Nasza lista: 1\. Konstruktywne wotum nieufności, 2\. Izba Pracy w miejsce Senatu\./);
    assert.equal(plain(choice(engine, 'polish_event_constitution_debate.m_constructive_vonc').title), '■ 1. Konstruktywne wotum nieufności');
    const unicameral = choice(engine, 'polish_event_constitution_debate.m_unicameral');
    assert.deepEqual([unicameral.canChoose, plain(unicameral.subtitle)], [false, 'Wyklucza się z wnioskiem „Izba Pracy w miejsce Senatu”: najpierw go odznacz.']);
    const t = Q.time, actions = Q.month_actions || 0;
    choose(engine, 'polish_event_constitution_debate.declare');
    assert.match(page(), /PPS popiera w debacie: 1\. Konstruktywne wotum nieufności, 2\. Izba Pracy w miejsce Senatu\. Komisja Konstytucyjna skieruje wnioski pod obrady/);
    assert.deepEqual([Q.time, Q.month_actions || 0], [t, actions], 'the position costs no month');
    choose(engine, 'root');
    assert.ok(!offered(engine, 'main.parliament').includes('polish_constitution_project'), 'the old card stays out of the deck');
    // The Committee brought the constructive vote to the floor last month: the urgent vote card of Parliament (a fixture Senate).
    Q.S.senate = Object.assign({}, Q.S.senate, { status: 'constituted', total: 111, club_seats: { pps: 30, psl_piast: 40, zln: 41 } });
    P.debateState(Q.S).pending = { id: 'constructive_vonc', drawn_at: Q.time - 1 };
    engine.goToScene('main');
    assert.deepEqual([dendry.urgentCards(engine), dendry.urgentDeck(engine, 'polish_constitution_vote')], [['polish_constitution_vote'], 'main.parliament']);
    dendry.playCard(engine, 'polish_constitution_vote');
    assert.match(page(), /Głosowanie nad zmianą konstytucji.*Konstruktywne wotum nieufności.*Komisja Konstytucyjna skierowała wniosek pod obrady; obie izby głosują tego samego dnia\. Sejm: za \d+, przeciw \d+, wstrzymało się \d+\./);
    choose(engine, 'polish_constitution_vote.resolve');
    assert.match(page(), /Zmiana konstytucji obowiązuje od tego miesiąca|Wniosek upadł i nie wróci w tym Sejmie/);
    choose(engine, 'root');
    assert.deepEqual([Q.time, P.debateState(Q.S).pending, dendry.urgentCards(engine)], [t, null, []], 'the vote costs no month and leaves the hand');
  } finally {
    globalThis.PolishRules.setLanguage('en');
  }
});

// Z — 0.66 (decision 2A of 7 X 2026): every card of a ministry names its ministry, on its page and as a badge in the hand.
// Z — 0.93 (decision 3A of 24 X 2026): one Treasury card, “Taxes and Loans”, with five instruments.
test('Karty resortów 0.93: one Treasury card with five instruments; every government card names its ministry', () => {
  const engine = dendry.startGame();
  const Q = leftCabinet(engine);
  const options = id => Object.keys(engine.game.scenes).filter(s => s.startsWith(id + '.') && !s.endsWith('.result')).map(s => s.slice(id.length + 1)).sort();
  assert.deepEqual(options('polish_gov_finance'), ['admin_cuts', 'emission', 'indirect', 'loan', 'progressive']);
  assert.ok(!engine.game.scenes.polish_gov_finance_funding, 'the second Treasury card is gone');
  assert.equal(engine.game.scenes.polish_gov_finance.title, 'Taxes and Loans');
  Q.S.cabinet.portfolios.finance = 'pps';
  assert.ok(offered(engine, 'main.govt').includes('polish_gov_finance'));
  playFromHand(engine, 'polish_gov_finance');
  assert.match(content(engine), /pl-ministry-label\W{1,3}>Treasury ministry</, 'Z — 0.77: a printed label, not a sentence');
  assert.match(content(engine), /Budget this month/);
  assert.equal(choice(engine, 'polish_gov_finance.loan').canChoose, Q.S.economy.credit >= 40);
  assert.match(content(engine), /One instrument per decision, voted by the Sejm at once/);
  assert.doesNotMatch(content(engine), /11\.9|No project of this card yet/, 'no section number and no empty project line on the taxes card');
  choose(engine, 'easy_discard');
  // The badge names the ministry of every government card; of two portfolios, the one PPS holds.
  const P = PolishProjects;
  const expect = { polish_gov_labor_rights: 'Labour', polish_gov_social_welfare: 'Labour', polish_gov_public_works: 'Labour',
    polish_gov_finance: 'Treasury', polish_gov_currency: 'Treasury', polish_gov_investment: 'Treasury',
    polish_gov_industry: 'Industry and Trade', polish_gov_land: 'Agriculture', polish_gov_agriculture: 'Agriculture',
    polish_gov_education: 'Education', polish_gov_minority_schools: 'Education', polish_gov_heritage: 'Education',
    polish_gov_interior: 'Interior', polish_gov_justice: 'Justice', polish_gov_military: 'Military Affairs', polish_gov_pils_agreement: 'Military Affairs' };
  for (const [id, name] of Object.entries(expect)) assert.equal(P.ministryBadge(Q, id), name, id);
  const govScenes = Object.keys(engine.game.scenes).filter(id => !id.includes('.') && (engine.game.scenes[id].tags || []).includes('govt_affairs') && id.startsWith('polish_gov_'));
  assert.deepEqual(govScenes.filter(id => !P.ministryBadge(Q, id)), [], 'every Polish government card has a ministry');
  Q.S.cabinet.portfolios.finance = 'expert';
  Q.S.cabinet.portfolios.economic = 'pps';
  assert.equal(P.ministryBadge(Q, 'polish_gov_investment'), 'Industry and Trade', 'the investment fund under Industry and Trade');
  assert.equal(P.ministryBadge(Q, 'polish_party_dues'), '', 'no badge on a party card');
  PolishRules.setLanguage('pl');
  try {
    assert.equal(P.ministryBadge(Q, 'polish_gov_finance'), 'Skarb');
    assert.equal(P.ministryLine(Q, 'polish_gov_finance'), '<span class="pl-ministry-label">Resort Skarbu</span>');
    assert.equal(P.ministryLine(Q, 'polish_gov_pils_agreement'), '<span class="pl-ministry-label">Resort Spraw Wojskowych</span>');
  } finally {
    PolishRules.setLanguage('en');
  }
});
