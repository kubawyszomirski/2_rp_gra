// Engine hooks for the Polish chapter (docs/POLISH_IMPLEMENTATION_PLAN.md, stage 1; technical
// reference 4.3, 4.4 and 4.6). Installed once on the Dendry engine prototype: by out/html/game.js
// in the browser and by the test helpers in Node. They change three engine behaviours without
// editing the dependency:
// - drawing a card picks uniformly among the legal cards of the deck sorted by ID, with a recorded
//   roll, so the result does not depend on the order of scenes in out/game.json;
// - checking whether a deck can be drawn from no longer uses up a random number;
// - playing a card from the hand records what the card changes when it opens, so that "Close card"
//   can undo exactly that;
// - Z — 0.60: the hand has two places for each of the three decks, and a closed deck (its choose-if) offers no card;
//   deckView describes a deck and its places for the page (out/html/game.js);
// - in the Polish version, a number inserted into the text gets a decimal comma (Polish version, decision 6A).
(function (root, factory) {
  'use strict';
  const hooks = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = hooks;
  } else {
    root.PolishEngineHooks = hooks;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // The legal cards of a deck, as the engine defines them: viewable, choosable, a card, and not
  // already in the hand. Sorted by ID.
  function legalDeckCards(engine, deckId) {
    // Z — 0.60: the decks are always shown; a closed deck (its choose-if in main) offers no card.
    const deck = engine.game.scenes[deckId];
    if (deck && deck.chooseIf && !engine._runPredicate(deck.chooseIf, true)) return [];
    const viewable = engine._compileChoices(engine.game.scenes[deckId]) || [];
    const hand = (engine.state.currentHands[engine.state.sceneId] || []).map(card => card.id);
    return viewable
      .filter(choice => choice.canChoose && engine.game.scenes[choice.id] && engine.game.scenes[choice.id].isCard &&
        hand.indexOf(choice.id) < 0)
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  }

  let installedRules = null;

  // One deck and its places of the hand, for the page (Z — 0.60): whether a card can be drawn and why not, and the cards
  // of this deck in the hand with their deadline and whether they can be discarded.
  function deckView(engine, deckId) {
    const rules = installedRules;
    const Q = engine.state.qualities, scene = engine.game.scenes[deckId] || {};
    const cards = rules.handOfDeck(engine.state, engine.game, deckId).map(card => {
      const until = rules.cardDeadline(Q, card.id);
      return {id: card.id, title: card.title, image: card.image || (engine.game.scenes[card.id] || {}).cardImage, until: until,
        discard: rules.discardStatus(Q, engine.state, card.id)};
    });
    const key = deckId.split('.').pop();
    let available = true, reason = '';
    if (scene.chooseIf && !engine._runPredicate(scene.chooseIf, true)) {
      available = false;
      reason = Q['pl_deck_' + key + '_why'] || rules.L('This deck is closed now.', 'Ta talia jest teraz zamknięta.');
    } else if (cards.length >= rules.HAND_PER_DECK) {
      available = false;
      reason = rules.L('Both places of this deck are taken: play or discard a card.', 'Oba miejsca tej talii są zajęte: zagraj albo odrzuć kartę.');
    } else if (!legalDeckCards(engine, deckId).length) {
      available = false;
      reason = rules.L('No card of this deck can be drawn now.', 'Teraz nie można dobrać żadnej karty z tej talii.');
    }
    return {id: deckId, title: scene.title || deckId, image: scene.cardImage || null, available: available, reason: reason,
      cards: cards, slots: rules.HAND_PER_DECK};
  }

  function install(proto, rules) {
    if (proto.polishEngineHooks) return false;
    if (!rules) throw new Error('PolishEngineHooks.install needs the rules module');
    installedRules = rules;
    const playCard = proto.playCard;

    proto._drawFromDeck = function (deckId) {
      const legal = legalDeckCards(this, deckId);
      return legal.length ? legal[0] : null;
    };

    proto.drawCard = function (deckId) {
      const sceneId = this.state.sceneId;
      const scene = this.getCurrentScene();
      const hand = this.state.currentHands[sceneId] || (this.state.currentHands[sceneId] = []);
      if (scene.maxCards <= hand.length) return {id: null, title: 'no_space_in_hand'};
      // Z — 0.60: two places for each deck.
      if (rules.handOfDeck(this.state, this.game, deckId).length >= rules.HAND_PER_DECK) return {id: null, title: 'no_space_in_hand'};
      const card = rules.pickCard(this.state.qualities, legalDeckCards(this, deckId), deckId);
      if (!card) return {id: null, title: 'no_card_in_deck'};
      card.deck = deckId;
      this.state.lastDrawnCard = card;
      card.image = this.game.scenes[card.id].cardImage;
      hand.push(card);
      this.ui.displayHand(hand, scene.maxCards);
      return card;
    };

    // The engine turns an inserted value into text with toString(). In Polish a number is written with a decimal
    // comma (rules.num); quality displays and other values are evaluated exactly as the engine does. English keeps
    // the engine's own evaluation.
    const evaluateStateDependencies = proto._evaluateStateDependencies;
    proto._evaluateStateDependencies = function (defs) {
      if (rules.getLanguage() !== 'pl') return evaluateStateDependencies.call(this, defs);
      const result = [];
      for (let i = 0; i < defs.length; ++i) {
        const def = defs[i];
        let value;
        if (def.type === 'insert') {
          value = this._runExpression(def.fn);
          if (def.qdisplay) value = this._getQDisplay(value, def.qdisplay);
          else value = typeof value === 'number' ? rules.num(value) : value.toString();
        } else {
          value = this._runPredicate(def.fn);
        }
        if (value.stateDependencies !== undefined) value = this._makeDisplayContent(value, false);
        result.push(value);
      }
      return result;
    };

    proto.playCard = function (cardId) {
      const Q = this.state.qualities;
      if (Q.S) {
        const hand = this.state.currentHands[this.state.sceneId] || [];
        const entry = hand.filter(card => card.id === cardId)[0] || null;
        rules.beginCardView(Q, this.state, cardId, {from_hand: true, hand_entry: entry, keys: rules.openingKeys(this.game, cardId)});
      }
      return playCard.call(this, cardId);
    };

    proto.polishEngineHooks = true;
    return true;
  }

  return Object.freeze({install: install, legalDeckCards: legalDeckCards, deckView: deckView});
}));
