'use strict';

// The cooperation with the communists (Z — 1.37, the user's decisions D1A, D2A and D3A of 25 XI 2026): the work „Cooperation with
// the communists” of the card „Party work” no longer promises the cabinets with the KPP, which chapter I does not form; it raises the
// relation with the KPP up to 75 (very friendly) and no further; friendly relations (65 or more) calm the Left of PPS a little every
// month, the mirror of the cost in the Centre.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const dendry = require('./helpers/dendry');

const plain = c => (c == null ? '' : typeof c === 'string' ? c : Array.isArray(c) ? c.map(plain).join('') : plain(c.content));
function free(Q) {
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  Q.month_actions = 0;
}
function playFromHand(engine, cardId) {
  engine.state.currentHands.main = [{ id: cardId, title: cardId }];
  engine.playCard(cardId);
}
const subtitle = engine => plain((engine.getCurrentChoices() || []).find(c => c.id === 'polish_party_agenda.kpp_work').subtitle);
const setKpp = (Q, value) => PolishGovernment.changeRelation(Q, 'kpp', value - Q.S.actors.relations.kpp, 'fixture');

test('Komuniści 1.37: the work says what good relations give, without the cabinets with the KPP', () => {
  const engine = dendry.startGame();
  playFromHand(engine, 'polish_party_agenda');
  assert.equal(subtitle(engine), 'Cost: 0 resources. Improves our relations with the KPP, which are frigid today, but displeases the Centre of the party. ' +
    'Better relations bring the communists into our strikes, and friendly ones calm the Left of the party. Builds radicalism.');
  assert.doesNotMatch(subtitle(engine), /cabinet/);
});

test('Komuniści 1.37: the work raises the relation with the KPP up to very friendly (75) and no further; the Centre is displeased all the same', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities, S = Q.S;
  setKpp(Q, 73);
  PolishParty.agendaWork(Q, 'kpp');
  assert.equal(S.actors.relations.kpp, 75, 'two points up to the ceiling');
  free(Q);
  const centrum = S.actors.pps.factions.centrum.dissent, seeds = S.actors.pps.profile.seeds.radicalism;
  PolishParty.agendaWork(Q, 'kpp');
  assert.equal(S.actors.relations.kpp, 75, 'no further');
  assert.equal(S.actors.pps.factions.centrum.dissent, centrum + 3);
  assert.ok(S.actors.pps.profile.seeds.radicalism > seeds, 'it still builds radicalism');
  assert.match(Q.pl_party_result, /already as good as this work can make them/);
  // The card says so before the choice.
  free(Q);
  playFromHand(engine, 'polish_party_agenda');
  assert.equal(subtitle(engine), 'Cost: 0 resources. Our relations with the KPP are already very friendly: this work no longer improves them, only joint strikes can, ' +
    'and it still displeases the Centre of the party. Builds radicalism.');
  // A joint strike still raises the relation above the ceiling of the work.
  PolishGovernment.changeRelation(Q, 'kpp', 5, 'strike_trial:fixture');
  assert.equal(S.actors.relations.kpp, 80);
});

test('Komuniści 1.37: friendly relations with the KPP calm the Left of PPS by one point a month; not below friendly, nor after its split', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities, S = Q.S;
  const lewica = S.actors.pps.factions.lewica;
  lewica.dissent = 20;
  setKpp(Q, 64);
  PolishParty.settleMonth(Q, { t: Q.time });
  assert.equal(lewica.dissent, 20, 'warm relations are not enough');
  setKpp(Q, 65);
  PolishParty.settleMonth(Q, { t: Q.time });
  assert.equal(lewica.dissent, 19);
  assert.equal(S.history.reasons.at(-1).cause, 'kpp_friendly:t' + Q.time);
  lewica.dissent = 0.5;
  PolishParty.settleMonth(Q, { t: Q.time });
  assert.equal(lewica.dissent, 0, 'not below zero');
  lewica.dissent = 20;
  lewica.split = true;
  PolishParty.settleMonth(Q, { t: Q.time });
  assert.equal(lewica.dissent, 20, 'a Left that has split away is not calmed');
});
