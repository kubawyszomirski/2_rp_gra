'use strict';

// The notes of the user after playing 1.09 (8 XI 2026) and the decisions 1A–4A of version 1.10.
const test = require('node:test');
const assert = require('node:assert/strict');
const dendry = require('./helpers/dendry.js');

const plain = x => (x == null ? '' : typeof x === 'string' ? x : Array.isArray(x) ? x.map(plain).join('') : plain(x.content));
const content = engine => plain(engine.ui.paragraphs);

test('Wojsko 1.10 (decision 4A): the mood of the army in a word on the Overview, a note of each change, a card on the screen when the army becomes agitated (1.24)', () => {
  const engine = dendry.startGame(1922, 'pl');
  const Q = engine.state.qualities, S = Q.S, SEC = globalThis.PolishSecurity, TOP = globalThis.PolishTopbar;
  try {
    const word = p => { S.coup.pressure = p; return SEC.armyMoodWord(S); };
    assert.deepEqual([word(0), word(24.9), word(25), word(40), word(55)], ['spokojne', 'spokojne', 'niespokojne', 'wzburzone', 'gotowe do zamachu']);
    const settle = p => { S.coup.pressure = p; SEC.settleArmyMood(Q, Q.time - 1); };
    settle(30);
    assert.equal(SEC.armyNotice(Q), 'Nastroje w wojsku są niespokojne: oficerowie coraz głośniej krytykują rząd i Sejm.');
    assert.equal(SEC.armyMoodDue(Q), false, 'no event for "restless"');
    TOP.overviewView(Q);
    assert.equal(Q.pl_top_army, 'niespokojne');
    // Seething: an event with the causes of the last month and what eases the tension.
    S.coup.history.push({ t: Q.time - 1, pressure: 42, delta: 3.7, parts: { military_case: 1.7, authority: 2, no_cabinet: 0 } });
    settle(42);
    assert.equal(SEC.armyNotice(Q), 'Wojsko jest wzburzone: oficerowie otwarcie mówią o marszu na Warszawę.'); // Z — 1.24
    assert.equal(SEC.armyMoodDue(Q), true);
    TOP.overviewView(Q);
    assert.equal(Q.pl_top_army, '<span class="pl-army-alarm">wzburzone</span>', 'in red from "agitated"');
    assert.equal(globalThis.PolishRules.nextEvent(Q, ['polish_event_army_mood']), 'polish_event_army_mood', 'the event has its place in the queue');
    engine.goToScene('polish_event_army_mood');
    assert.match(content(engine), /Niepokój w wojsku/);
    // Z — 1.38: one sentence on the mood and its causes, one on what eases it.
    assert.match(content(engine), /W kasynach oficerskich mówi się o marszu na Warszawę, a oficerowie wierni Piłsudskiemu otwarcie atakują rząd i Sejm; popycha ich to, że Sejm stracił autorytet i spór o wojsko wciąż jest otwarty\./);
    assert.match(content(engine), /Napięcie słabnie przy stałym rządzie/);
    // Z — 1.24 (decision 8A): a decision with three answers; outside the cabinet the high post cannot be offered.
    const ids = (engine.getCurrentChoices() || []).map(c => c.id);
    assert.deepEqual(ids, ['polish_event_army_mood.appoint', 'polish_event_army_mood.call_to_order', 'polish_event_army_mood.ignore']);
    assert.equal(engine.getCurrentChoices()[0].canChoose, false);
    assert.match(Q.pl_unrest_appoint_why, /tylko rząd z udziałem PPS/);
    dendry.choose(engine, 'polish_event_army_mood.ignore');
    assert.match(content(engine), /PPS macha na to ręką\. Nic się nie zmienia\./);
    assert.equal(SEC.armyMoodDue(Q), false, 'seen once');
    settle(45);
    assert.equal(SEC.armyMoodDue(Q), false, 'the same mood brings no new event');
    // Z — 1.24: "ready for a coup" brings no second card.
    settle(56);
    assert.equal(SEC.armyMoodDue(Q), false, 'no card at "ready for a coup"');
    // The army calms down; a new rise is announced again.
    settle(10);
    assert.equal(SEC.armyNotice(Q), 'Nastroje w wojsku się uspokajają: oficerowie są spokojni.');
    S.coup.pressure = 41;
    SEC.settleArmyMood(Q, Q.time); // a later month (Z — 1.24: one key per rise)
    assert.equal(SEC.armyMoodDue(Q), true, 'a new rise after calm is an event again');
    // Z — 1.24: with PPS in the cabinet and good relations the high post lowers the pressure; calling him to order raises it.
    S.cabinet.partner_ids = S.cabinet.partner_ids.concat(['pps']);
    globalThis.PolishGovernment.changeRelation(Q, 'pilsudski', 50 - S.actors.relations.pilsudski, 'fixture');
    assert.match(SEC.unrestStatus(Q, 'appoint').reason, /nie są dość dobre/);
    globalThis.PolishGovernment.changeRelation(Q, 'pilsudski', 10, 'fixture');
    const p0 = S.coup.pressure, rel = S.actors.relations.pilsudski, dP = S.actors.pps.factions.pilsudczycy.dissent, dC = S.actors.pps.factions.centrum.dissent;
    SEC.unrestChoose(Q, 'appoint');
    assert.deepEqual([S.coup.pressure, S.actors.relations.pilsudski, S.actors.pps.factions.pilsudczycy.dissent, S.actors.pps.factions.centrum.dissent],
      [Math.max(0, p0 - 10), Math.min(100, rel + 5), Math.max(0, dP - 5), Math.min(100, dC + 3)]);
    assert.equal(SEC.armyMoodDue(Q), false, 'answered');
    const p1 = S.coup.pressure, rel1 = S.actors.relations.pilsudski;
    S.politics.due.polish_event_army_mood = 'army:2:fixture';
    SEC.unrestChoose(Q, 'call_to_order');
    assert.deepEqual([S.coup.pressure, S.actors.relations.pilsudski], [Math.min(100, p1 + 3), Math.max(0, rel1 - 10)]);
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

test('Spółdzielnia 1.17 (the user\'s request of 22 XI 2026): the cooperative in one plain sentence — it feeds the strikers, so a strike costs half', () => {
  const engine = dendry.startGame(1922, 'pl');
  try {
    engine.state.currentHands.main = [{ id: 'polish_party_organizations', title: 'Organizacje' }];
    engine.playCard('polish_party_organizations');
    const c = (engine.getCurrentChoices() || []).find(x => x.id === 'polish_party_organizations.cooperative_workers');
    assert.equal(plain(c.subtitle), 'Koszt: 1 jednostka środków. Spółdzielnia dostarcza strajkującym żywność, więc strajk kosztuje partię o połowę mniej.');
  } finally {
    globalThis.PolishRules.setLanguage('en');
  }
});
