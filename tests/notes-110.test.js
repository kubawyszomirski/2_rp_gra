'use strict';

// The notes of the user after playing 1.09 (8 XI 2026) and the decisions 1A–4A of version 1.10.
const test = require('node:test');
const assert = require('node:assert/strict');
const dendry = require('./helpers/dendry.js');

const plain = x => (x == null ? '' : typeof x === 'string' ? x : Array.isArray(x) ? x.map(plain).join('') : plain(x.content));
const content = engine => plain(engine.ui.paragraphs);

test('Wojsko 1.10 (decision 4A): the mood of the army in a word on the Overview, a note of each change, an event on the screen at "seething" and "ready for a coup"', () => {
  const engine = dendry.startGame(1922, 'pl');
  const Q = engine.state.qualities, S = Q.S, SEC = globalThis.PolishSecurity, TOP = globalThis.PolishTopbar;
  try {
    const word = p => { S.coup.pressure = p; return SEC.armyMoodWord(S); };
    assert.deepEqual([word(0), word(24.9), word(25), word(40), word(55)], ['spokojne', 'spokojne', 'niespokojne', 'wrze', 'gotowe do zamachu']);
    const settle = p => { S.coup.pressure = p; SEC.settleArmyMood(Q, Q.time - 1); };
    settle(30);
    assert.equal(SEC.armyNotice(Q), 'Nastroje w wojsku są niespokojne: oficerowie coraz głośniej krytykują rząd i Sejm.');
    assert.equal(SEC.armyMoodDue(Q), false, 'no event for "restless"');
    TOP.overviewView(Q);
    assert.equal(Q.pl_top_army, 'niespokojne');
    // Seething: an event with the causes of the last month and what eases the tension.
    S.coup.history.push({ t: Q.time - 1, pressure: 42, delta: 3.7, parts: { military_case: 1.7, authority: 2, no_cabinet: 0 } });
    settle(42);
    assert.equal(SEC.armyNotice(Q), 'W wojsku wrze: oficerowie otwarcie mówią o marszu na Warszawę.');
    assert.equal(SEC.armyMoodDue(Q), true);
    TOP.overviewView(Q);
    assert.equal(Q.pl_top_army, '<span class="pl-army-alarm">wrze</span>', 'in red from "seething"');
    assert.equal(globalThis.PolishRules.nextEvent(Q, ['polish_event_army_mood']), 'polish_event_army_mood', 'the event has its place in the queue');
    engine.goToScene('polish_event_army_mood');
    assert.match(content(engine), /Wojsko wrze/);
    assert.match(content(engine), /W kasynach oficerskich mówi się o marszu na Warszawę\./);
    assert.match(content(engine), /Oficerów popycha do tego to, że Sejm stracił autorytet i spór o wojsko wciąż jest otwarty\./);
    assert.match(content(engine), /Napięcie słabnie, gdy kraj ma stały rząd/);
    dendry.choose(engine, 'polish_event_army_mood.seen');
    assert.equal(SEC.armyMoodDue(Q), false, 'seen once');
    settle(45);
    assert.equal(SEC.armyMoodDue(Q), false, 'the same mood brings no new event');
    // Ready for a coup: a second event.
    settle(56);
    assert.equal(SEC.armyMoodDue(Q), true);
    SEC.armyMoodView(Q);
    assert.equal(Q.pl_army_title, 'Wojsko gotowe do zamachu');
    assert.match(Q.pl_army_text, /^Z garnizonów napływają doniesienia o przygotowaniach do zamachu/);
    SEC.armyMoodSeen(Q);
    // The army calms down; a new rise is announced again.
    settle(10);
    assert.equal(SEC.armyNotice(Q), 'Nastroje w wojsku się uspokajają: oficerowie są spokojni.');
    settle(41);
    assert.equal(SEC.armyMoodDue(Q), true, 'a new rise after calm is an event again');
  } finally {
    globalThis.PolishRules.setLanguage('en');
  }
});

test('Pasek 1.10 (decision 2A): the columns of the party first, then those of the state', () => {
  const engine = dendry.startGame(1922, 'pl');
  try {
    engine.goToScene('status.overview');
    const all = engine.ui.paragraphs.filter(p => p.type === 'heading').map(p => plain(p.content));
    const headings = all.slice(all.indexOf('Pozycja PPS'));
    assert.deepEqual(headings.slice(0, 3), ['Pozycja PPS', 'Linia partii', 'Rząd']);
    assert.match(headings[3], /^Sejm/);
    assert.deepEqual(headings.slice(4), ['Gospodarka', 'Kraj', 'Wybory']);
  } finally {
    globalThis.PolishRules.setLanguage('en');
  }
});

test('Głosowanie 1.10 (decision 1A): the counts of a bill of the initiative add up to the chamber', () => {
  const engine = dendry.startGame(1922, 'pl');
  const Q = engine.state.qualities, S = Q.S, P = globalThis.PolishProjects;
  try {
    Q.sejm_first_election_completed = 1;
    S.party_orgs.cash = 3;
    Q.time = 13;
    P.initiativeFile(Q, 'progressive_tax');
    const pending = P.initiativeState(S).pending, key = 'initiative:' + pending.id + ':t' + pending.filed_at;
    S.rng.rolls[key + ':full'] = 0.01;
    Q.time = 14; Q.month_actions = 0;
    const view = P.initiativeVoteView(Q);
    const m = view.line.match(/za (\d+) posłów, przeciw (\d+), wstrzymało się (\d+)\.(?: Część przeciwników \((\d+) posłów\))?/);
    assert.ok(m, view.line);
    const total = S.parliament.clubs.reduce((n, c) => n + c.seats, 0);
    assert.equal(Number(m[1]) + Number(m[2]) + Number(m[3]) + Number(m[4] || 0), total);
  } finally {
    globalThis.PolishRules.setLanguage('en');
  }
});
