const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Engine tests of the party cards of stage 5 (implementation plan, stage 5; card catalogue 4.1–4.8,
// 5.1–5.9, 6.2–6.7, 9.10): the cards are played through the real Dendry engine, and a month is
// settled once through post_event.
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
function deck(engine) {
  return (engine._compileChoices(engine.game.scenes['main.party']) || []).filter(c => c.canChoose !== false).map(c => c.id);
}

test('the Party deck offers the Polish cards of stage 5 and no longer the replaced inherited ones', () => {
  const engine = dendry.startGame();
  const cards = deck(engine);
  for (const id of ['polish_party_organizations', 'polish_party_militia', 'polish_party_dues']) assert.ok(cards.includes(id), id);
  for (const id of ['fundraising', 'party_organizations', 'reichsbanner']) assert.ok(!cards.includes(id), id + ' is replaced');
  assert.ok(ids(engine).includes('polish_party_agenda'), 'the party agenda is a pinned card');
});

test('Dwie organizacje in the game: two different organisations in one month; nothing is spent before the confirmation', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.S.party_orgs.cash = 3;
  PolishParty.writeMirrors(Q);
  playFromHand(engine, 'polish_party_organizations');
  choose(engine, 'polish_party_organizations.p1_press_distribution');
  assert.equal(choice(engine, 'polish_party_organizations.p2_union_organize_rail').canChoose, true);
  assert.equal(choice(engine, 'polish_party_organizations.p2_press_distribution').canChoose, false, 'not the same organisation twice');
  choose(engine, 'polish_party_organizations.p2_union_organize_rail');
  assert.match(content(engine), /Together 2 R and this month’s action/);
  assert.equal(Q.S.party_orgs.cash, 3, 'nothing is spent before the confirmation');
  choose(engine, 'polish_party_organizations.do_confirm');
  assert.match(content(engine), /the press gains 10 reach/);
  assert.equal(Q.S.party_orgs.press.reach, 40);
  assert.ok(Math.abs(Q.S.unions.rail.reach - 36.5) < 1e-9, 'rail +15 × 1.10: the character of a workers’ party (10.6)');
  choose(engine, 'root');
  assert.equal(Q.time, 2, 'one month');
});

test('Bez płatnego braku wyboru: the organisations card returned to the hand costs nothing; keeping the present dues is a decision for the month (Z — 0.51)', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  playFromHand(engine, 'polish_party_organizations');
  choose(engine, 'easy_discard');
  assert.deepEqual([Q.time, Q.month_actions, Q.S.cooldowns['party.organizations']], [1, 0, undefined]);
  assert.deepEqual(engine.state.currentHands.main.map(c => c.id), ['polish_party_organizations'], 'the card goes back to the hand');
  playFromHand(engine, 'polish_party_dues');
  assert.equal(choice(engine, 'polish_party_dues.keep').canChoose, true);
  assert.match([].concat(choice(engine, 'polish_party_dues.keep').subtitle).join(''), /the dues stay at 2 and the card waits 6 months/);
  assert.equal([].concat(choice(engine, 'easy_discard').title).join(''), 'Return to hand');
  choose(engine, 'easy_discard');
  assert.equal(Q.time, 1);
  engine.playCard('polish_party_dues');
  choose(engine, 'polish_party_dues.keep');
  assert.match(content(engine), /Dues stay at 2/);
  choose(engine, 'root');
  assert.deepEqual([Q.time, Q.S.party_orgs.dues, Q.S.cooldowns['party.dues']], [2, 2, 7], 'one month, the same dues, the usual wait');
});

test('Brak gotówki in the game: with an empty cash box the party agenda still offers organisational work, which spends the month and no money', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.S.party_orgs.cash = 0;
  PolishParty.writeMirrors(Q);
  engine.playPinnedCard('polish_party_agenda');
  assert.equal(choice(engine, 'polish_party_agenda.apparatus').canChoose, false);
  choose(engine, 'polish_party_agenda.organize');
  choose(engine, 'polish_party_agenda.class_rural');
  assert.match(content(engine), /base reach of PPS there \+2/);
  choose(engine, 'root');
  assert.equal(Q.time, 2);
  assert.ok(Q.S.party_orgs.cash >= 0);
  assert.ok(Q.S.society.cells.filter(c => c.class_id === 'rural').every(c => Math.abs(c.base_reach_pps - 22) < 1e-9));
});

test('the Milicja card recruits for 1 R and settles the month; the party ledger then pays the larger upkeep', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  playFromHand(engine, 'polish_party_militia');
  assert.equal(choice(engine, 'polish_party_militia.form_as').canChoose, false);
  choose(engine, 'polish_party_militia.recruit');
  choose(engine, 'root');
  assert.deepEqual([Q.time, Q.S.militia.strength, Q.pps_militia_strength], [2, 300, 300]);
  const ledger = Q.S.party_orgs.last_ledger;
  assert.equal(ledger.t, 1);
  assert.ok(Math.abs(ledger.paid.militia - 0.20) < 1e-9, 'two hundreds of members cost 0.20 R');
  engine.goToScene('status');
  assert.match(content(engine), /300 members/);
});

test('a year of play keeps the party consistent: cash never negative, one ledger a month, valid S through saves', () => {
  const engine = dendry.startGame(1930);
  const { engine: end } = dendry.walk(engine, { variant: 2, maxSteps: 700, lastYear: 1922,
    onStep(current, step) { return step > 0 && step % 150 === 0 ? dendry.saveAndRestore(current) : null; } });
  const Q = end.state.qualities;
  assert.deepEqual(PolishRules.validateState(Q.S), []);
  assert.ok(Q.S.party_orgs.cash >= 0);
  assert.equal(Q.S.party_orgs.last_ledger.t, Q.time - 1, 'the ledger of the last settled month');
  assert.ok(Math.abs(Q.S.society.cells.reduce((n, c) => n + c.mass, 0) - 1) < 1e-9);
});

test('Media bez odnowienia karty: two campaigns on the same topic in consecutive months are both possible; the second gains less', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.S.party_orgs.cash = 5;
  PolishParty.writeMirrors(Q);
  const workers = () => PolishElectorate.aggregate(Q.S, c => c.class_id === 'workers', 'pps');
  const gains = [];
  for (let month = 0; month < 2; month++) {
    const before = workers();
    playFromHand(engine, 'polish_party_media');
    choose(engine, 'polish_party_media.campaign');
    choose(engine, 'polish_party_media.topic_class');
    choose(engine, 'polish_party_media.to_workers');
    choose(engine, 'root');
    gains.push(workers() - before);
  }
  assert.equal(Q.time, 3);
  assert.ok(gains[0] > 0 && gains[1] > 0);
  assert.ok(gains[1] < gains[0], 'saturation of the topic among the same voters');
});

test('Konfiskata in the game: a restricted press weakens the press campaign; the campaign through the unions still works and ignores the press', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  PolishParty.addPressRestriction(Q, {id: 'test-confiscation', event_id: 'fixture', reach_penalty: 30, expires_at: Q.time + 2});
  const cell = Q.S.society.cells.find(c => c.class_id === 'workers');
  assert.equal(PolishParty.cellReach(Q.S, cell, 'unions'), 20, 'the branches only');
  assert.ok(PolishParty.cellReach(Q.S, cell, 'press') < 0.5 * 20 + 0.3 * 30 + 0.2 * 20, 'the press part is restricted');
  playFromHand(engine, 'polish_party_media');
  choose(engine, 'polish_party_media.unions_campaign');
  choose(engine, 'polish_party_media.topic_class');
  choose(engine, 'polish_party_media.to_workers');
  assert.match(content(engine), /through the unions and meetings/);
  choose(engine, 'root');
  assert.equal(Q.time, 2);
});

test('Obecna linia in the game: the present line can be confirmed for the month; returning the card costs nothing and keeps it in the hand', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  for (const id of ['polish_party_direction', 'polish_party_main_opponent', 'polish_party_pils_influence', 'polish_party_form_of_power',
    'polish_party_electoral_base', 'polish_party_slavic_autonomy', 'polish_party_jewish_cooperation', 'polish_party_ussr_position',
    'polish_party_economic_program']) assert.ok(deck(engine).includes(id), id);
  playFromHand(engine, 'polish_party_pils_influence');
  assert.equal(choice(engine, 'polish_party_pils_influence.conditional').canChoose, true);
  assert.match(String(choice(engine, 'polish_party_pils_influence.conditional').subtitle), /This is the present line\. Confirming it costs this month's action/);
  assert.doesNotMatch(String(choice(engine, 'polish_party_pils_influence.support').subtitle), /present line/);
  choose(engine, 'easy_discard');
  assert.deepEqual([Q.time, Q.month_actions, Q.S.cooldowns['party.pils_influence']], [1, 0, undefined]);
  assert.deepEqual(engine.state.currentHands.main.map(c => c.id), ['polish_party_pils_influence']);
  engine.playCard('polish_party_pils_influence');
  choose(engine, 'polish_party_pils_influence.support');
  assert.match(content(engine), /relation with Piłsudski \+4/);
  choose(engine, 'root');
  assert.equal(Q.time, 2);
  assert.ok(!deck(engine).includes('polish_party_pils_influence'), 'the card waits six months');
});

test('Program bez zmiany in the game: the same set can be confirmed for the month; returning the card is free; a new set costs the month', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  playFromHand(engine, 'polish_party_economic_program');
  choose(engine, 'polish_party_economic_program.edit');
  assert.equal(choice(engine, 'polish_party_economic_program.confirm').canChoose, true, 'the empty set is the present one and can be confirmed');
  assert.match(String(choice(engine, 'polish_party_economic_program.confirm').subtitle), /This is the present programme/);
  choose(engine, 'polish_party_economic_program.toggle_public_works');
  assert.match(String(choice(engine, 'polish_party_economic_program.confirm').subtitle), /^1 T; the card then waits 6 months\.$/);
  choose(engine, 'polish_party_economic_program.toggle_public_works');
  assert.equal(choice(engine, 'polish_party_economic_program.confirm').canChoose, true);
  choose(engine, 'polish_party_economic_program');
  choose(engine, 'easy_discard');
  assert.deepEqual([Q.time, Q.month_actions], [1, 0]);
  engine.playCard('polish_party_economic_program');
  choose(engine, 'polish_party_economic_program.edit');
  choose(engine, 'polish_party_economic_program.toggle_public_works');
  choose(engine, 'polish_party_economic_program.toggle_agrarian_labour');
  choose(engine, 'polish_party_economic_program.confirm');
  choose(engine, 'root');
  assert.deepEqual(Q.S.actors.pps.strategy.economic_priorities, ['agrarian_labour', 'public_works']);
  assert.equal(Q.time, 2);
});
