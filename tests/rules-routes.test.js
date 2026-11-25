'use strict';

// The routes to the same reform (Z — 1.39, the user's decisions D4A and D5A of 25 XI 2026): a card of a ministry opens only with its
// ministry, so the player meets the closed Government Affairs deck; its reason names the other route — the bills of the initiative in
// the Parliament deck — outside the cabinet after the election of 1922. The cards of the initiative say that in a cabinet the ministers
// bring in the same reforms by a decision, and the Library has a page of the three routes.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const dendry = require('./helpers/dendry');

const plain = c => (c == null ? '' : typeof c === 'string' ? c : Array.isArray(c) ? c.map(plain).join('') : plain(c.content));
const page = engine => engine.ui.paragraphs.map(p => plain(p.content)).join(' ');

test('Drogi do reform 1.39: the closed Government deck names the bills of the Parliament deck, outside the cabinet after the election', () => {
  const engine = dendry.startGame(1922, 'pl');
  const Q = engine.state.qualities;
  PolishGovernment.deckReasons(Q);
  assert.equal(Q.pl_deck_govt_why, 'PPS toleruje rząd, ale nie ma ministerstw.', 'before the election of 1922 the club files no bills');
  Q.sejm_first_election_completed = 1;
  Q.polish_opening_government_active = 0;
  Q.time = 20;
  PolishGovernment.deckReasons(Q);
  assert.equal(Q.pl_deck_govt_why, 'PPS nie ma teraz ministerstwa, które otwiera kartę rządową. Nasze reformy wnosimy jako ustawy z talii „Parlament”.');
  // In a cabinet the initiative is closed, so the deck names no other route.
  Q.S.cabinet.partner_ids = ['pps'];
  PolishGovernment.deckReasons(Q);
  assert.equal(Q.pl_deck_govt_why, 'PPS nie ma teraz ministerstwa, które otwiera kartę rządową.');
});

test('Drogi do reform 1.39: the cards of the initiative say that in a cabinet the ministers bring in the same reforms without a vote', () => {
  const engine = dendry.startGame(1922, 'pl');
  for (const id of ['polish_legislative_initiative', 'polish_legislative_initiative_state']) {
    engine.goToScene(id);
    assert.match(page(engine), /a Sejm głosuje nad nim w przyszłym miesiącu; gdy PPS wejdzie do rządu, te reformy wprowadzają jej ministrowie decyzją, bez głosowania, a karta się zamyka\./, id);
  }
});

test('Drogi do reform 1.39: the Library explains the three routes and lists the reforms with more than one', () => {
  const engine = dendry.startGame(1922, 'pl');
  engine.goToScene('library.routes');
  const text = page(engine);
  assert.match(text, /Drogi do reform Wiele reform PPS może wejść w życie więcej niż jedną drogą/);
  for (const route of ['Decyzja ministra PPS', 'Ustawa z inicjatywy', 'Żądanie wobec rządu']) assert.ok(text.includes(route), route);
  assert.match(text, /ustawa zjednuje mniej wyborców niż decyzja ministra/);
  assert.match(text, /zasiłki dla bezrobotnych \(„Zasiłki i ubezpieczenia”, ustawa „Ochrona bezrobotnych”, żądanie\)/);
  const engineEn = dendry.startGame();
  engineEn.goToScene('library.menu');
  assert.ok((engineEn.getCurrentChoices() || []).some(c => c.id === 'library.routes'), 'on the menu of the Library');
});
