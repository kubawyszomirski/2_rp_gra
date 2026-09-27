const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');

// Unit tests of stage 1 (docs/POLISH_IMPLEMENTATION_PLAN.md): the monthly clock, settling a month
// once, adviser transactions, closing and discarding cards, the event queue and recorded
// randomness (technical reference 4.1-4.6, 17.1). They load the source file and never start the game.
const rules = require(path.join(__dirname, '..', 'source', 'rules', 'polish_rules.js'));

function newQ(time = 1) {
  const S = rules.createFoundationState({ randomState: [1922, 1, 2, 3, 4] });
  return { S, time, year: rules.yearOf(time), month: rules.monthOf(time), month_actions: 0 };
}
const engineState = (hand = []) => ({ visits: {}, currentHands: { main: hand.slice() }, prevSceneId: null, sceneId: 'main' });
const game = {
  scenes: {
    'puzak.party_discipline': {},
    'puzak.mobilize_organization': { goTo: [{ id: 'party_organizations' }] },
    party_organizations: { isCard: true },
  },
};

test('one monthly clock: time gives the year and month (4.1)', () => {
  assert.deepEqual([1, 11, 53, 74].map(t => [rules.yearOf(t), rules.monthOf(t)]), [[1922, 1], [1922, 11], [1926, 5], [1928, 2]]);
  assert.deepEqual([[1922, 1], [1922, 11], [1926, 5], [1928, 2]].map(([y, m]) => rules.timeOf(y, m)), [1, 11, 53, 74]);
  for (let t = 1; t < 240; t++) assert.equal(rules.timeOf(rules.yearOf(t), rules.monthOf(t)), t);
});

test('a month is settled once, only after a month-consuming action (4.2)', () => {
  const Q = newQ();
  assert.equal(rules.beginMonthSettlement(Q, engineState()), null, 'no action, no settlement');
  assert.equal(Q.time, 1);
  Q.month_actions = 1;
  Q.S.turn.discard_used = true;
  const settlement = rules.beginMonthSettlement(Q, { ...engineState(), prevTopSceneId: 'fundraising' });
  assert.deepEqual(settlement, { t: 1, txn_id: 'txn-1', action_id: 'legacy.fundraising' });
  assert.deepEqual([Q.time, Q.year, Q.month, Q.month_actions, Q.S.turn.last_settled_time, Q.S.turn.discard_used], [2, 1922, 2, 0, 1, false]);
  rules.completeMonthSettlement(Q, settlement);
  assert.deepEqual(Q.S.history.months, [{ t: 1, txn_id: 'txn-1', action_id: 'legacy.fundraising' }]);
  assert.equal(Q.S.history.actions.length, 1);
  assert.equal(rules.beginMonthSettlement(Q, engineState()), null, 'a second visit settles nothing');
  // A month cannot be settled twice even if a counter is raised again.
  Q.month_actions = 1;
  Q.S.turn.last_settled_time = 2;
  assert.equal(rules.beginMonthSettlement(Q, engineState()), null);
  assert.equal(Q.month_actions, 0);
  assert.equal(Q.S.history.reasons.at(-1).kind, 'second_settlement_refused');
});

test('an adviser action is final and blocks all advisers until t+6 (4.4)', () => {
  const Q = newQ(1);
  const state = { ...engineState(), sceneId: 'puzak.party_discipline' };
  const txn = rules.commitAdvisorAction(Q, state, game);
  assert.equal(txn.action_id, 'advisor.puzak.party_discipline');
  assert.deepEqual([txn.advisor_id, txn.subaction_id, txn.source, txn.consumes_month], ['puzak', 'party_discipline', 'advisor', false]);
  assert.equal(Q.S.cooldowns.advisor, 7);
  assert.equal(Q.advisor_action_timer, 6);
  assert.throws(() => rules.commitAdvisorAction(Q, state, game), /still pending/);
  assert.equal(rules.beginMonthSettlement(Q, engineState()), null, 'an adviser action costs no month');
  assert.equal(Q.S.turn.pending, null);
  assert.equal(Q.S.history.actions.at(-1).phase, 'settled');
  for (let t = 1; t <= 7; t++) {
    Q.time = t;
    rules.refreshMirrors(Q);
    assert.equal(rules.isAdvisorAvailable(Q), t >= 7, `t=${t}`);
    assert.equal(Q.advisor_action_timer, Math.max(0, 7 - t));
  }
  Q.time = 3;
  assert.throws(() => rules.commitAdvisorAction(Q, state, game), /cooldown/);
});

test('an adviser action that opens a card makes that step cost no month (4.3)', () => {
  const Q = newQ(1);
  const state = { ...engineState(), sceneId: 'puzak.mobilize_organization' };
  const txn = rules.commitAdvisorAction(Q, state, game);
  assert.deepEqual(txn.redirect, { card: 'party_organizations', month_actions_before: 0 });
  assert.equal(Q.S.turn.card_view.card_id, 'party_organizations');
  assert.equal(Q.S.turn.card_view.from_hand, false);
  Q.month_actions += 1; // the inherited card charges the month when it opens
  assert.equal(rules.beginMonthSettlement(Q, engineState()), null);
  assert.equal(Q.month_actions, 0);
  assert.equal(Q.time, 1);
  assert.equal(Q.S.history.actions.at(-1).redirect.month_charge_waived, 1);
});

test('closing a card from its first page undoes what it recorded on opening; later it only navigates (4.3)', () => {
  const Q = newQ(1);
  const entry = { id: 'campaigning', title: 'Campaigning', image: 'img/poster_1.png' };
  const state = engineState([entry, { id: 'media', title: 'Media' }]);
  Q.pps_militia_timer = 2;
  const keys = rules.openingKeys({ scenes: { campaigning: { onArrival: [{ source: "Q['month_actions'] += 1; Q['pps_militia_timer'] += 6; Q.cost = 2;" }] } } }, 'campaigning');
  assert.deepEqual(keys, ['cost', 'month_actions', 'pps_militia_timer']);
  rules.beginCardView(Q, state, 'campaigning', { from_hand: true, hand_entry: entry, keys });
  state.currentHands.main.shift(); // the engine takes the card out of the hand
  Q.month_actions += 1; Q.pps_militia_timer += 6; Q.cost = 2; state.visits.campaigning = 1; // what the card records when it opens
  state.prevSceneId = 'campaigning';
  assert.equal(rules.closeCard(Q, state), true);
  assert.equal(Q.month_actions, 0);
  assert.equal(Q.pps_militia_timer, 2, 'a cooldown with another name is restored too');
  assert.equal('cost' in Q, false);
  assert.equal('campaigning' in state.visits, false);
  assert.deepEqual(state.currentHands.main.map(card => card.id), ['media', 'campaigning']);
  assert.equal(Q.S.turn.card_view, null);

  rules.beginCardView(Q, state, 'media', { from_hand: true, hand_entry: { id: 'media', title: 'Media' } });
  Q.month_actions += 1;
  state.prevSceneId = 'media.newspapers'; // an option was chosen first
  assert.equal(rules.closeCard(Q, state), false);
  assert.equal(Q.month_actions, 1, 'nothing is refunded after an option');
  assert.equal(rules.closeCard({ ...Q, S: rules.createFoundationState({ randomState: [1] }) }, state), false, 'no card open');
});

test('one free discard a month, reset only when the month changes (4.4)', () => {
  const Q = newQ(1);
  const state = engineState([{ id: 'media', title: 'Media' }, { id: 'rally', title: 'Rally' }]);
  rules.refreshHandMirrors(Q, state);
  assert.deepEqual([Q.pl_hand_card_1, Q.pl_hand_card_2, Q.pl_hand_card_3], ['Media', 'Rally', '']);
  assert.equal(rules.canDiscard(Q, state), true);
  assert.equal(rules.discardFromHand(Q, state, 1), 'rally');
  assert.deepEqual(state.currentHands.main.map(card => card.id), ['media']);
  assert.equal(rules.canDiscard(Q, state), false);
  assert.throws(() => rules.discardFromHand(Q, state, 0), /no free discard/);
  Q.month_actions = 1;
  rules.beginMonthSettlement(Q, engineState());
  assert.equal(rules.canDiscard(Q, state), true);
  assert.equal(rules.canDiscard({ time: 1 }, state), false, 'an old save without S never discards');
});

test('the event queue takes due events one at a time by category, then ID (4.5)', () => {
  const Q = newQ(40);
  // Categories as in the 21.1 test "Kolejność kategorii wydarzeń": E6 (1), the 1926 review (4), B2 (6).
  const definitions = {
    b2: { definition_id: 'politics.pils_parliament_criticism', category: 6 },
    e6: { definition_id: 'society.strike_settlement_rejection', category: 1 },
    b19: { definition_id: 'cabinet.austerity_1926', category: 4 },
  };
  const order = [];
  let due = ['b2', 'e6', 'b19'];
  for (let visit = 0; visit < 4; visit++) {
    const next = rules.nextEvent(Q, due, definitions);
    if (!next) break;
    order.push(next);
    rules.markEventEntered(Q);
    due = due.filter(id => id !== next);
  }
  assert.deepEqual(order, ['e6', 'b19', 'b2']);
  assert.equal(rules.nextEvent(Q, due, definitions), null);
  assert.deepEqual(Object.keys(Q.S.events.resolved).sort(), ['b19', 'b2', 'e6']);
  assert.equal(Q.S.events.active, null);
});

test('an event chosen but not entered is chosen again; an entered one never returns (4.5)', () => {
  const Q = newQ(12);
  const due = ['polish_event_stabilization', 'polish_event_credit_crisis'];
  assert.equal(rules.nextEvent(Q, due), 'polish_event_credit_crisis', 'same category: stable ID');
  assert.deepEqual(Q.S.events.pending, ['polish_event_stabilization']);
  // An election came first, so the router did not enter it.
  assert.equal(rules.nextEvent(Q, due), 'polish_event_credit_crisis');
  rules.markEventEntered(Q);
  assert.equal(rules.nextEvent(Q, due), 'polish_event_stabilization');
  rules.markEventEntered(Q);
  assert.equal(rules.nextEvent(Q, due), null, 'resolved events are not routed again');
  // E3 (stage 5) has one instance per faction case: a new case opens a new instance of the same card.
  Q.S.faction_cases = {list: [], due_case_id: 'case-1'};
  assert.equal(rules.nextEvent(Q, ['polish_event_faction_split']), 'polish_event_faction_split');
  rules.markEventEntered(Q);
  assert.equal(rules.nextEvent(Q, ['polish_event_faction_split']), null, 'case 1 is resolved');
  Q.S.faction_cases.due_case_id = 'case-2';
  assert.equal(rules.nextEvent(Q, ['polish_event_faction_split']), 'polish_event_faction_split');
  assert.equal(Q.S.events.active.instance_key, 'polish_event_faction_split:case-2');
  assert.throws(() => rules.nextEvent(Q, ['economic_expansion']), /no queue category/);
});

test('a roll is drawn once, recorded and uniform (4.6)', () => {
  const Q = newQ();
  const first = rules.roll(Q.S, 'coup_1:formation_near_reserve:allegiance');
  assert.ok(first >= 0 && first < 1);
  assert.equal(rules.roll(Q.S, 'coup_1:formation_near_reserve:allegiance'), first, 'the same challenge gives the recorded value');
  assert.deepEqual(Object.keys(Q.S.rng.rolls), ['coup_1:formation_near_reserve:allegiance']);
  const again = newQ();
  assert.equal(rules.roll(again.S, 'coup_1:formation_near_reserve:allegiance'), first, 'the same seed gives the same value');
  const other = rules.createFoundationState({ randomState: [1923, 1, 2, 3, 4] });
  assert.notEqual(rules.roll(other, 'coup_1:formation_near_reserve:allegiance'), first, 'another seed, another value');
  assert.throws(() => rules.roll(Q.S, ''), /challenge id/);
  const values = Array.from({ length: 20000 }, (_, i) => rules.roll(Q.S, `uniform:${i}`));
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  assert.ok(Math.abs(mean - 0.5) < 0.01, `mean ${mean}`);
  for (let decile = 0; decile < 10; decile++) {
    const share = values.filter(v => v >= decile / 10 && v < (decile + 1) / 10).length / values.length;
    assert.ok(Math.abs(share - 0.1) < 0.015, `decile ${decile}: ${share}`);
  }
});

test('a drawn card does not depend on the order of the legal cards (4.4, 4.6)', () => {
  const legal = ['rally', 'media', 'campaigning', 'fundraising', 'ideology'].map(id => ({ id }));
  const reversed = legal.slice().reverse();
  for (let t = 1; t <= 30; t++) {
    const a = newQ(t), b = newQ(t);
    assert.equal(rules.pickCard(a, legal, 'main.party').id, rules.pickCard(b, reversed, 'main.party').id, `t=${t}`);
    assert.equal(a.S.turn.draw_serial, 1);
  }
  const counts = {};
  const Q = newQ(1);
  for (let i = 0; i < 5000; i++) {
    const card = rules.pickCard(Q, legal, 'main.party');
    counts[card.id] = (counts[card.id] || 0) + 1;
  }
  for (const card of legal) assert.ok(Math.abs(counts[card.id] / 5000 - 0.2) < 0.03, `${card.id}: ${counts[card.id]}`);
  assert.equal(rules.pickCard(Q, [], 'main.party'), null);
});

test('projects stay on the agenda, outside the three hand places (4.4)', () => {
  const Q = newQ();
  Q.S.projects.p2 = { id: 'p2', status: 'implementing' };
  Q.S.projects.p1 = { id: 'p1', status: 'preparing' };
  Q.S.projects.p0 = { id: 'p0', status: 'completed' };
  assert.deepEqual(rules.agendaItems(Q.S), [{ id: 'p1', kind: 'project', status: 'preparing' }, { id: 'p2', kind: 'project', status: 'implementing' }]);
  assert.equal(rules.HAND_SIZE, 3);
});

test('validation covers transactions and rolls (schema 2)', () => {
  const S = rules.createFoundationState({ randomState: [1] });
  S.turn.pending = { id: 'txn-1', action_id: 'x', source: 'magic', phase: 'done', time: 1, consumes_month: 'yes' };
  S.rng.rolls.bad = 1.5;
  assert.deepEqual(rules.validateState(S), [
    'S.turn.pending.source is magic', 'S.turn.pending.phase is done', 'S.turn.pending.consumes_month is not a boolean',
    'S.rng.rolls.bad is outside [0, 1)',
  ]);
});
