const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Engine tests of stage 1 (docs/POLISH_IMPLEMENTATION_PLAN.md): the monthly clock, one transaction
// per action, cooldowns as dates, the hand rules, the event queue and recorded randomness
// (technical reference 4.1-4.6). Cards are drawn and played as the page does it: drawCard and
// playCard. Run npm run build first.
const errors = dendry.watchEngineErrors();
beforeEach(() => { errors.length = 0; });
afterEach(() => assert.deepEqual(errors, [], 'no swallowed Dendry errors'));

const CLOSE_OPTIONS = ['easy_discard', 'cancel_advisor_action', 'return'];
const choiceIds = engine => (engine.getCurrentChoices() || []).map(choice => choice.id);
const open = engine => (engine.getCurrentChoices() || []).filter(choice => choice.canChoose !== false);

// Acts on the card until the main hand: takes the least used choosable option that is not a way to
// close the card, so that menus which lead back to themselves are left eventually.
function actUntilMain(engine, maxSteps = 80) {
  const used = new Map();
  let steps = 0;
  for (; steps < maxSteps && engine.state.sceneId !== 'main'; steps++) {
    const options = open(engine);
    const acting = options.filter(choice => !CLOSE_OPTIONS.includes(choice.id));
    const pool = (acting.length ? acting : options).slice().sort((a, b) => (used.get(a.id) || 0) - (used.get(b.id) || 0));
    const pick = pool[0];
    assert.ok(pick, `stuck in ${engine.state.sceneId}`);
    used.set(pick.id, (used.get(pick.id) || 0) + 1);
    dendry.choose(engine, pick.id);
  }
  assert.equal(engine.state.sceneId, 'main', 'back at the main hand');
  return steps;
}

// One ordinary month: play hand cards in ID order, drawing when needed, until one card is acted
// on. A card with no available option is closed for free and the next one is tried.
function spendMonth(engine) {
  const Q = engine.state.qualities;
  const before = Q.time;
  let result = null;
  for (let attempt = 0; attempt < 8 && Q.time === before; attempt++) {
    let hand = engine.state.currentHands.main || [];
    if (hand.length <= attempt % 4) engine.drawCard('main.party');
    hand = (engine.state.currentHands.main || []).slice().sort((a, b) => (a.id < b.id ? -1 : 1))
      .filter(card => card.id !== 'polish_party_advisers'); // it changes the team the tests rely on
    if (!hand.length) { engine.state.currentHands.main = []; engine.drawCard('main.party'); hand = engine.state.currentHands.main.slice(); }
    assert.ok(hand.length, `a card can be played at t=${Q.time}`);
    const card = hand[attempt % hand.length];
    engine.playCard(card.id);
    result = { card: card.id, steps: actUntilMain(engine) };
  }
  // Stage 5: with an empty cash box only paid cards may be in the hand; organisational work in the party
  // agenda is always there and needs no money (technical reference 4.4; card catalogue 5.7).
  if (Q.time === before && Q.S.party_orgs) {
    dendry.playCard(engine, 'polish_party_agenda');
    dendry.choose(engine, 'polish_party_agenda.organize_unions');
    result = { card: 'polish_party_agenda', steps: actUntilMain(engine) };
  }
  assert.equal(Q.time, before + 1, 'exactly one month is settled');
  return result;
}

function legalPartyCardWith(engine, option) {
  const legal = PolishEngineHooks.legalDeckCards(engine, 'main.party');
  const card = legal.find(choice => (engine.game.scenes[choice.id].options || []).some(o => o.id === '@' + option));
  assert.ok(card, `a legal party card offers ${option}`);
  return card;
}

const PolishEngineHooks = require(dendry.HOOKS_FILE);

test('Jedna tura (21.1): a main card through several pages settles exactly one month', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const { steps } = spendMonth(engine);
  assert.ok(steps >= 2, 'the card passed through more than one page');
  assert.deepEqual([Q.time, Q.S.turn.last_settled_time, Q.S.history.months.length], [2, 1, 1]);
  engine.goToScene('post_event');
  assert.deepEqual([Q.time, Q.S.history.months.length], [2, 1], 'visiting post_event again settles nothing');
  dendry.saveAndRestore(engine).goToScene('post_event');
  assert.equal(Q.time, 2);
});

test('Doradca (21.1): an adviser action at t=1 blocks all advisers until t=7, through returns and loads', () => {
  let engine = dendry.startGame();
  dendry.choose(engine, 'puzak');
  dendry.choose(engine, 'puzak.party_discipline');
  actUntilMain(engine);
  let Q = engine.state.qualities;
  assert.equal(Q.time, 1, 'the adviser action costs no month');
  assert.equal(Q.S.cooldowns.advisor, 7);
  const adviserOptions = () => {
    const result = {};
    for (const adviser of ['daszynski', 'perl', 'puzak']) {
      dendry.choose(engine, adviser);
      result[adviser] = open(engine).filter(choice => choice.id.startsWith(adviser + '.')).length;
      dendry.choose(engine, 'root');
      assert.equal(engine.state.sceneId, 'main');
    }
    return result;
  };
  for (let t = 1; t <= 7; t++) {
    Q = engine.state.qualities;
    assert.equal(Q.time, t);
    const available = Object.values(adviserOptions()).reduce((a, b) => a + b, 0);
    assert.equal(available > 0, t >= 7, `advisers at t=${t}`);
    assert.equal(Q.advisor_action_timer, Math.max(0, 7 - t));
    if (t === 4) engine = dendry.saveAndRestore(engine);
    if (t < 7) spendMonth(engine);
  }
  Q = engine.state.qualities;
  assert.equal(Q.S.history.months.length, Q.time - 1, 'one settlement, and so one monthly income, per month');
  assert.equal(Q.S.history.actions.filter(txn => txn.source === 'advisor').length, 1);
});

test('Ręka (21.1; Z — 0.60): two places for each deck, no third card of a deck, a legal refill and a lasting project agenda', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  for (let i = 0; i < 2; i++) assert.ok(engine.drawCard('main.party').id);
  assert.deepEqual(engine.drawCard('main.party'), { id: null, title: 'no_space_in_hand' }, 'two places for the Party deck');
  assert.deepEqual(engine.drawCard('main.govt'), { id: null, title: 'no_card_in_deck' }, 'the closed Government deck offers no card');
  assert.ok(engine.state.currentHands.main.every(card => card.deck === 'main.party'), 'a drawn card remembers its deck');
  // A card whose conditions stop holding leaves the hand when the hand is shown again. Inherited cards wait
  // on a Q timer; the Polish cards of stage 5 on a dated cooldown in Q.S (4.4).
  const block = (id, on) => {
    const key = id.startsWith('polish_party_') ? 'party.' + id.slice('polish_party_'.length).replace('ussr_position', 'ussr_position') : null;
    if (on) { Q[id + '_timer'] = 5; if (key) Q.S.cooldowns[key] = Q.time + 5; if (id === 'polish_party_militia') Q.S.militia.banned = true; }
    else { delete Q[id + '_timer']; if (key) delete Q.S.cooldowns[key]; if (id === 'polish_party_militia') Q.S.militia.banned = false; }
  };
  let removed = null;
  for (const card of engine.state.currentHands.main.slice()) {
    block(card.id, true);
    engine.goToScene('main');
    if (!engine.state.currentHands.main.some(c => c.id === card.id)) { removed = card.id; break; }
    block(card.id, false);
  }
  assert.ok(removed, 'one card became illegal and left the hand');
  assert.equal(engine.state.currentHands.main.length, 1);
  const refill = engine.drawCard('main.party');
  assert.ok(refill.id && refill.id !== removed, 'a legal card fills the place');
  Q.S.projects.test_project = { id: 'test_project', status: 'implementing' };
  spendMonth(engine);
  assert.deepEqual(PolishRules.agendaItems(Q.S), [{ id: 'test_project', kind: 'project', status: 'implementing' }], 'the project stays on the agenda');
  assert.ok(engine.state.currentHands.main.length <= 6);
});

test('Rzut (21.1): viewing, cancelling, saving and loading give the same recorded roll and no second reward', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const value = PolishRules.roll(Q.S, 'test:rzut');
  engine.goToScene('library.menu');
  engine.goToScene('main');
  const card = legalPartyCardWith(engine, 'easy_discard');
  engine.state.currentHands.main.push(card);
  engine.playCard(card.id);
  dendry.choose(engine, 'easy_discard');
  actUntilMain(engine);
  const restored = dendry.saveAndRestore(engine);
  assert.equal(PolishRules.roll(restored.state.qualities.S, 'test:rzut'), value);
  assert.equal(Object.keys(restored.state.qualities.S.rng.rolls).filter(id => id === 'test:rzut').length, 1);
  // A draw after loading the save made before it gives the same card, once.
  const saved = dendry.clone(restored.getExportableState());
  const first = restored.drawCard('main.party');
  const again = dendry.restoreState(saved);
  const second = again.drawCard('main.party');
  assert.equal(second.id, first.id);
  assert.equal(again.state.currentHands.main.filter(c => c.id === first.id).length, 1);
});

// Since stage 5 the Party deck holds Polish cards that charge nothing on opening; the inherited Media card
// (off the deck, with its "Back to main") still shows that closing undoes an opening charge.
for (const option of ['easy_discard', 'return']) {
  test(`${option === 'return' ? 'Back to main' : 'Close card'} from the first page of a hand card is free and returns it (4.3)`, () => {
    const engine = dendry.startGame();
    const Q = engine.state.qualities;
    const card = option === 'return' ? { id: 'media', title: 'Media' } : legalPartyCardWith(engine, option);
    engine.state.currentHands.main.push(card);
    const before = { timer: Q[card.id + '_timer'], visits: engine.state.visits[card.id] };
    engine.playCard(card.id);
    assert.equal(Q.month_actions, option === 'return' ? 1 : 0, option === 'return' ? 'the inherited card charges when it opens' : 'a Polish card charges nothing when it opens');
    dendry.choose(engine, option);
    actUntilMain(engine);
    assert.deepEqual([Q.time, Q.month_actions], [1, 0], 'no month is used');
    assert.equal(Q[card.id + '_timer'], before.timer);
    assert.equal(engine.state.visits[card.id], before.visits);
    // An off-deck card is not legal, so the hand drops it when it is shown again (4.4).
    assert.deepEqual(engine.state.currentHands.main.map(c => c.id), option === 'return' ? [] : [card.id], 'the card is back in the hand');
  });
}

test('closing any legal party card from its first page restores everything its opening changed (4.3)', () => {
  const probe = dendry.startGame();
  const cards = PolishEngineHooks.legalDeckCards(probe, 'main.party')
    .filter(choice => (probe.game.scenes[choice.id].options || []).some(o => ['@easy_discard', '@return'].includes(o.id)));
  let checked = 0;
  for (const card of cards) {
    const engine = dendry.startGame();
    const Q = engine.state.qualities;
    const keys = PolishRules.openingKeys(engine.game, card.id);
    const before = Object.fromEntries(keys.map(key => [key, Q[key]]));
    engine.state.currentHands.main.push(card);
    engine.playCard(card.id);
    const close = ['easy_discard', 'return'].find(id => choiceIds(engine).includes(id));
    if (engine.state.sceneId !== card.id || !close) continue; // the card opens on a later page
    checked++;
    dendry.choose(engine, close);
    actUntilMain(engine);
    assert.deepEqual(Object.fromEntries(keys.map(key => [key, Q[key]])), before, `${card.id}: its opening is undone`);
    assert.deepEqual(engine.state.currentHands.main.map(c => c.id), [card.id], `${card.id} is back in the hand`);
    assert.equal(Q.time, 1);
  }
  assert.ok(checked >= 5, `${checked} cards checked`);
});

test('after an option, leaving a card refunds nothing (4.3)', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const card = legalPartyCardWith(engine, 'easy_discard');
  engine.state.currentHands.main.push(card);
  engine.playCard(card.id);
  const option = open(engine).find(choice => !CLOSE_OPTIONS.includes(choice.id));
  dendry.choose(engine, option.id);
  actUntilMain(engine);
  assert.equal(Q.time, 2, 'the month is used');
  assert.ok(!engine.state.currentHands.main.some(c => c.id === card.id), 'the card is spent');
});

test('an adviser opening a card makes that step cost no month; closing it refunds nothing (4.3)', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  // Stage 5: the redirects of 10.4.3 open government cards; PPS gets Labour in a fixture of the opening cabinet.
  Q.S.cabinet.partner_ids.push('pps');
  Q.S.cabinet.portfolios.labor = 'pps';
  Q.arciszewski_advisor = 1;
  engine.goToScene('main');
  dendry.choose(engine, 'arciszewski');
  dendry.choose(engine, 'arciszewski.labour_programme');
  assert.equal(engine.state.sceneId, 'polish_gov_labor_rights');
  dendry.choose(engine, 'polish_gov_labor_rights.inspection');
  actUntilMain(engine);
  assert.equal(Q.time, 1, 'the opened step costs no month');
  assert.equal(Q.S.cooldowns.advisor, 7);
  const txn = Q.S.history.actions.find(action => action.action_id === 'advisor.arciszewski.labour_programme');
  assert.equal(txn.redirect.card, 'polish_gov_labor_rights');
  assert.equal(txn.redirect.action_id, 'government.labor_rights.inspection');
  spendMonth(engine);
  assert.equal(Q.time, 2, 'the next ordinary card uses the month normally');

  // A card opened by an adviser offers closing in adviser mode; closing refunds nothing.
  const other = dendry.startGame(1923);
  const R = other.state.qualities;
  R.S.cabinet.partner_ids.push('pps');
  R.S.cabinet.portfolios.labor = 'pps';
  R.moraczewski_advisor = 1;
  other.goToScene('main');
  dendry.choose(other, 'moraczewski');
  dendry.choose(other, 'moraczewski.public_works');
  assert.equal(other.state.sceneId, 'polish_gov_public_works');
  assert.ok(choiceIds(other).includes('cancel_advisor_action'));
  assert.ok(!choiceIds(other).includes('easy_discard'), 'the ordinary close is hidden in adviser mode');
  dendry.choose(other, 'cancel_advisor_action');
  actUntilMain(other);
  assert.deepEqual([R.time, R.month_actions, R.S.cooldowns.advisor], [1, 0, 7], 'no month used, no adviser refund');
});

// Z — 0.60 (the user's notes of 7 X 2026): a card is discarded on the card itself, once a month; the timed cards, the cards of
// the party's vision and the cards opened by a special event cannot be discarded. There is no separate discard card.
test('one free discard a month on the card itself, available again after the month changes (4.4; Z — 0.60)', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  assert.ok(!choiceIds(engine).includes('polish_discard'), 'no separate discard card');
  engine.state.currentHands.main = [
    { id: 'polish_party_media', title: 'Media', deck: 'main.party' },
    { id: 'polish_party_direction', title: 'Direction', deck: 'main.party' },
  ];
  assert.match(PolishRules.discardStatus(Q, engine.state, 'polish_party_direction').reason, /vision cannot be discarded/);
  assert.match(PolishRules.discardStatus(Q, engine.state, 'polish_constitution_project').reason, /special event/);
  assert.match(PolishRules.discardStatus(Q, engine.state, 'polish_event_pils_criticism').reason, /timed card/);
  const party = PolishEngineHooks.deckView(engine, 'main.party');
  assert.deepEqual([party.available, party.cards.map(c => c.id)], [false, ['polish_party_media', 'polish_party_direction']]);
  assert.match(party.reason, /Both places of this deck are taken/);
  PolishRules.discardCard(Q, engine.state, 'polish_party_media');
  assert.deepEqual(engine.state.currentHands.main.map(c => c.id), ['polish_party_direction']);
  assert.equal(Q.time, 1, 'discarding costs no month');
  engine.state.currentHands.main.push({ id: 'polish_party_militia', title: 'Milicja', deck: 'main.party' });
  assert.match(PolishRules.discardStatus(Q, engine.state, 'polish_party_militia').reason, /already been discarded this month/);
  assert.equal(PolishEngineHooks.deckView(engine, 'main.party').cards.find(c => c.id === 'polish_party_militia').discard.available, false);
  spendMonth(engine);
  assert.equal(Q.S.turn.discard_used, false, 'available again after the month changes');
});

// Z — 0.74 (decisions 1A–3A of 8 X 2026): the cards that must not wait for a lucky draw — the prepared reforms, the answer to
// the cabinet's budget package, the answer to a partner, the filing of a constitutional motion — are urgent cards in the hand
// of their deck; the column of the Central Executive Committee holds only the advisers.
test('Karty pilne 0.74: an urgent card enters the hand of its deck in an extra place, cannot be discarded, stays after Not now and leaves with its condition', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  engine.goToScene('main');
  for (const id of ['polish_agenda', 'polish_budget_package', 'polish_government_response']) assert.ok(!choiceIds(engine).includes(id), `${id} is not pinned`);
  // Both ordinary places of Parliament are taken; the cabinet's package brings the budget card into a third, urgent place.
  engine.state.currentHands.main = [
    { id: 'inter_party_relationships', title: 'Talks', deck: 'main.parliament' },
    { id: 'polish_unemployment_bill', title: 'Bill', deck: 'main.parliament' },
  ];
  PolishProjects.newPackage(Q, { instruments: ['broad'], necessary: false, reason: 'deficit' });
  engine.syncUrgentCards();
  const view = PolishEngineHooks.deckView(engine, 'main.parliament');
  assert.deepEqual(view.cards.map(c => [c.id, c.urgent]), [['inter_party_relationships', false], ['polish_unemployment_bill', false],
    ['polish_budget_package', true]]);
  assert.equal(view.slots, 2, 'two ordinary places; the urgent card has its own');
  assert.equal(view.available, false, 'no draw: the deck is closed in January 1922 and its places are taken');
  assert.equal(view.cards[2].until, Q.S.economy.pending_package.vote_at, 'the badge of its last month');
  assert.match(PolishRules.discardStatus(Q, engine.state, 'polish_budget_package').reason, /urgent card cannot be discarded/);
  assert.equal(PolishRules.ordinaryHandOfDeck(engine.state, engine.game, 'main.parliament').length, 2);
  // "Not now" keeps it in the hand; the answer removes it.
  engine.state.currentHands.main = [];
  engine.goToScene('main');
  assert.deepEqual(dendry.urgentCards(engine), ['polish_budget_package']);
  engine.playCard('polish_budget_package');
  dendry.choose(engine, 'polish_budget_package.later');
  assert.equal(engine.state.sceneId, 'main');
  assert.deepEqual(dendry.urgentCards(engine), ['polish_budget_package'], 'back in its place after Not now');
  engine.playCard('polish_budget_package');
  dendry.choose(engine, 'polish_budget_package.support');
  dendry.choose(engine, 'root');
  assert.deepEqual(dendry.urgentCards(engine), [], 'answered: the condition has ended');
  assert.equal(Q.time, 1, 'the answer costs no month');
});

// Z — 0.76 (decision 1A of 8 X 2026): a used party card rests before it can be drawn again — 3 months; the cards of the party's
// line together 6 months; the party agenda, the move that is always open, never.
test('Odstęp kart partii 0.76: a used card rests 3 months, the cards of the party line together 6, the agenda never', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  dendry.playCard(engine, 'polish_party_organizations');
  dendry.choose(engine, 'polish_party_organizations.press_distribution');
  assert.equal(Q.month_actions, 1);
  assert.equal(PolishRules.cardRest(Q, 'polish_party_organizations'), 3);
  assert.ok(!PolishEngineHooks.legalDeckCards(engine, 'main.party').some(c => c.id === 'polish_party_organizations'), 'not drawn while it rests');
  const line = dendry.startGame();
  const L = line.state.qualities;
  dendry.playCard(line, 'polish_party_direction');
  const option = (line.getCurrentChoices() || []).find(c => c.id.startsWith('polish_party_direction.') && c.canChoose !== false);
  dendry.choose(line, option.id);
  assert.equal(L.month_actions, 1);
  for (const id of PolishRules.VISION_CARDS) assert.equal(PolishRules.cardRest(L, id), 6, `${id} rests with the line`);
  const drawable = PolishEngineHooks.legalDeckCards(line, 'main.party').map(c => c.id);
  assert.deepEqual(drawable.filter(id => PolishRules.VISION_CARDS.includes(id)), [], 'no card of the party line for six months');
  const agenda = dendry.startGame();
  dendry.playCard(agenda, 'polish_party_agenda');
  dendry.choose(agenda, 'polish_party_agenda.organize_unions');
  assert.equal(PolishRules.cardRest(agenda.state.qualities, 'polish_party_agenda'), 0, 'the agenda never rests');
});

// Bug of 5 X 2026: the discard page and "Not now" of a pinned card went straight to the hand without a new page, so
// their text stayed above the hand. They return through root, like "Return to hand". Z — 0.57: the party agenda is an
// ordinary card, so it is closed with "Return to hand" and goes back to the hand. Z — 0.60: the discard page is gone.
test('"Return to hand" of the party agenda leaves no text above the hand', () => {
  const engine = dendry.startGame();
  const text = () => JSON.stringify(engine.ui.paragraphs);
  dendry.playCard(engine, 'polish_party_agenda');
  assert.match(text(), /Party money/);
  dendry.choose(engine, 'easy_discard');
  assert.equal(engine.state.sceneId, 'main');
  assert.doesNotMatch(text(), /Party money/);
  assert.ok(engine.state.currentHands.main.some(card => card.id === 'polish_party_agenda'), 'the card is back in the hand');
  assert.deepEqual([engine.state.qualities.time, engine.state.qualities.month_actions || 0], [1, 0], 'no month and no action are used');
});

test('due events come one at a time from the queue, in a fixed order, and are not repeated (4.5)', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  // Stage 5: two factions with a concrete demand (decision 3A) open two cases of the one card E3.
  for (const id of ['centrum', 'lewica']) {
    PolishGovernment.factionReaction(Q, id, {dissent: 70 - Q.S.actors.pps.factions[id].dissent}, {id: 'fixture:' + id, kind: 'stance',
      reverse: {kind: 'strategy', field: 'direction', value: 'class_independence', objection: 'parliamentary_socialism'}});
  }
  PolishParty.writeMirrors(Q);
  engine.drawCard('main.party');
  const card = engine.state.currentHands.main[0];
  engine.playCard(card.id);
  const visited = [];
  for (let steps = 0; steps < 80 && engine.state.sceneId !== 'main'; steps++) {
    const scene = engine.state.sceneId.split('.')[0];
    if (PolishRules.EVENT_DEFINITIONS[scene] && visited[visited.length - 1] !== scene) visited.push(scene);
    assert.notEqual(engine.state.sceneId, 'post_event.events_choice', 'events are never offered as a list');
    const options = open(engine);
    const pick = options.find(choice => !CLOSE_OPTIONS.includes(choice.id)) || options[0];
    dendry.choose(engine, pick.id);
  }
  assert.equal(engine.state.sceneId, 'main');
  assert.equal(visited[0], 'polish_event_faction_split');
  const resolved = Object.keys(Q.S.events.resolved).filter(key => key.startsWith('polish_event_faction_split:'));
  assert.ok(resolved.length >= 1, 'the case is resolved under its own key');
  assert.equal(new Set(resolved).size, resolved.length, 'no case twice');
  assert.ok(Q.S.faction_cases.list.every(c => c.status !== 'open'), 'no case left open: accepting one demand also ends the other');
  assert.equal(Q.S.events.active, null);
  assert.equal(Q.time, 2, 'events cost no month');
  engine.goToScene('post_event');
  assert.equal(engine.state.sceneId, 'main', 'resolved events do not return');
});

test('German events are no longer offered: the list takes only Polish events with a queue category (4.5)', () => {
  const engine = dendry.startGame();
  const scenes = engine.game.scenes;
  assert.deepEqual(scenes['post_event.events_choice'].options.map(o => o.id), ['#pl_event']);
  const tagged = tag => Object.keys(scenes).filter(id => (scenes[id].tags || []).includes(tag)).sort();
  assert.deepEqual(tagged('pl_event'), Object.keys(PolishRules.EVENT_DEFINITIONS).sort());
  assert.ok(tagged('event').length > 60, 'the German events are kept in the files');
  for (const id of tagged('event')) assert.ok(!tagged('pl_event').includes(id), id);
  assert.ok(tagged('event').includes('economic_expansion'));
});

test('walks that play like the page keep every stage 1 rule', () => {
  let months = 0;
  for (const variant of [0, 1, 2]) {
    let engine = dendry.startGame(1922 + variant);
    const seenAdviserActions = [];
    for (let step = 0; step < 36; step++) {
      const Q = engine.state.qualities;
      assert.equal(engine.state.sceneId, 'main');
      assert.deepEqual(PolishRules.validateState(Q.S), []);
      assert.equal(Q.S.history.months.length, Q.time - 1, 'one settlement per month');
      assert.ok(engine.state.currentHands.main.length <= 3);
      if (Q.time >= 11) break; // the November election has its own tests
      if (step % 5 === variant && PolishRules.isAdvisorAvailable(Q)) {
        dendry.choose(engine, 'puzak');
        dendry.choose(engine, 'puzak.party_discipline');
        actUntilMain(engine);
        seenAdviserActions.push(Q.time);
      } else if (step % 7 === 3 && (engine.state.currentHands.main || []).some(c => PolishRules.discardStatus(Q, engine.state, c.id).available)) {
        // Z — 0.60: a card is discarded on the card itself (the separate discard card is gone).
        const card = engine.state.currentHands.main.find(c => PolishRules.discardStatus(Q, engine.state, c.id).available);
        PolishRules.discardCard(Q, engine.state, card.id);
      } else {
        spendMonth(engine);
      }
      if (step % 4 === 2) engine = dendry.saveAndRestore(engine);
    }
    for (let i = 1; i < seenAdviserActions.length; i++) {
      assert.ok(seenAdviserActions[i] - seenAdviserActions[i - 1] >= 6, `adviser actions at ${seenAdviserActions}`);
    }
    months += engine.state.qualities.time - 1;
  }
  assert.ok(months >= 20, `${months} months played`);
});
