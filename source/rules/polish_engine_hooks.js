// Engine hooks for the Polish chapter (docs/POLISH_IMPLEMENTATION_PLAN.md, stage 1; technical
// reference 4.3, 4.4 and 4.6). Installed once on the Dendry engine prototype: by out/html/game.js
// in the browser and by the test helpers in Node. They change three engine behaviours without
// editing the dependency:
// - drawing a card picks uniformly among the legal cards of the deck sorted by ID, with a recorded
//   roll, so the result does not depend on the order of scenes in out/game.json;
// - checking whether a deck can be drawn from no longer uses up a random number;
// - playing a card from the hand records what the card changes when it opens, so that "Close card"
//   can undo exactly that.
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
    const viewable = engine._compileChoices(engine.game.scenes[deckId]) || [];
    const hand = (engine.state.currentHands[engine.state.sceneId] || []).map(card => card.id);
    return viewable
      .filter(choice => choice.canChoose && engine.game.scenes[choice.id] && engine.game.scenes[choice.id].isCard &&
        hand.indexOf(choice.id) < 0)
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  }

  function install(proto, rules) {
    if (proto.polishEngineHooks) return false;
    if (!rules) throw new Error('PolishEngineHooks.install needs the rules module');
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
      const card = rules.pickCard(this.state.qualities, legalDeckCards(this, deckId), deckId);
      if (!card) return {id: null, title: 'no_card_in_deck'};
      this.state.lastDrawnCard = card;
      card.image = this.game.scenes[card.id].cardImage;
      hand.push(card);
      this.ui.displayHand(hand, scene.maxCards);
      return card;
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

  return Object.freeze({install: install, legalDeckCards: legalDeckCards});
}));
