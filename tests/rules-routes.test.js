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
  // Z — 1.45 (U4): in a cabinet the bills of the other ministries go to the partners through the Parliament deck.
  Q.S.cabinet.partner_ids = ['pps'];
  PolishGovernment.deckReasons(Q);
  assert.equal(Q.pl_deck_govt_why, 'PPS nie ma teraz ministerstwa, które otwiera kartę rządową. Ustawy z resortów, których nie mamy, proponujemy partnerom w talii „Parlament”.');
});

test('Drogi do reform 1.39 (Z — 1.45): the card of a bill says who files it — our club outside the cabinet, the cabinet after a proposal to the partners inside it', () => {
  const engine = dendry.startGame(1922, 'pl');
  const Q = engine.state.qualities;
  try {
    Q.sejm_first_election_completed = 1;
    Q.time = PolishRules.timeOf(1925, 10);
    PolishProjects.billWindows(Q, Q.time - 1);
    engine.goToScene('polish_bill_tenants');
    assert.match(page(engine), /Klub PPS wnosi projekt, a Sejm zagłosuje nad nim w przyszłym miesiącu\./);
    Object.assign(Q.S.cabinet, { partner_ids: ['psl_wyzwolenie', 'pps'], party: 'psl_wyzwolenie', pps_mode: 'member', status: 'active' });
    engine.goToScene('polish_bill_tenants');
    assert.match(page(engine), /PPS jest w rządzie: proponujemy tę ustawę partnerom z rządu, a gdy wszyscy się zgodzą, wniesie ją rząd i kluby koalicji zagłosują za\./);
  } finally {
    PolishRules.setLanguage('en');
  }
});

test('Drogi do reform 1.39: the Library explains the three routes and lists the reforms with more than one', () => {
  const engine = dendry.startGame(1922, 'pl');
  engine.goToScene('library.routes');
  const text = page(engine);
  assert.match(text, /Drogi do reform Wiele reform PPS może wejść w życie więcej niż jedną drogą/);
  for (const route of ['Decyzja ministra PPS', 'Ustawa (po wyborach 1922)', 'Żądanie wobec rządu']) assert.ok(text.includes(route), route);
  assert.match(text, /zjednuje mniej wyborców niż decyzja ministra/);
  assert.match(text, /zasiłki dla bezrobotnych \(„Zasiłki i ubezpieczenia”, ustawa „Ochrona bezrobotnych”, żądanie\)/);
  const engineEn = dendry.startGame();
  engineEn.goToScene('library.menu');
  assert.ok((engineEn.getCurrentChoices() || []).some(c => c.id === 'library.routes'), 'on the menu of the Library');
});
