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
// Plain text and bold parts of a displayed subtitle: the present choice opens with a bold label (Z — 0.53).
const plain = c => (c == null ? '' : typeof c === 'string' ? c : Array.isArray(c) ? c.map(plain).join('') : plain(c.content));
const bold = c => (c == null || typeof c === 'string' ? [] : Array.isArray(c) ? c.flatMap(bold) : c.type === 'emphasis-2' ? [plain(c.content)] : bold(c.content));
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
  for (const id of ['polish_party_organizations', 'polish_party_union_investments', 'polish_party_militia', 'polish_party_dues']) assert.ok(cards.includes(id), id);
  for (const id of ['fundraising', 'party_organizations', 'reichsbanner']) assert.ok(!cards.includes(id), id + ' is replaced');
  // Z — 0.57 (item 11 of the play notes): the party agenda is an ordinary card of the Party deck, no longer pinned; the
  // unions join the deck only during a dispute or with its cause, and January 1922 has neither.
  assert.ok(cards.includes('polish_party_agenda'), 'the party agenda is a card of the Party deck');
  assert.ok(!ids(engine).includes('polish_party_agenda'), 'not pinned');
  assert.ok(!cards.includes('polish_union_agenda'), 'no union dispute in January 1922');
});

// Z — 0.57 (item 6 of the play notes of 5 X 2026): the line with no effect is no longer offered.
test('Charakter partii (Z — 0.57): three lines, each with its environment; "our own profile, and reach through allies" is no longer offered', () => {
  const engine = dendry.startGame();
  playFromHand(engine, 'polish_party_electoral_base');
  assert.deepEqual(ids(engine), ['polish_party_electoral_base.workers', 'polish_party_electoral_base.workers_peasants',
    'polish_party_electoral_base.broad_democratic', 'easy_discard']);
  assert.match(PolishParty.stanceStatus(engine.state.qualities, 'electoral_base', 'allied_reach').reason, /no longer offered/);
});

// Z — 0.57: the second choice is carried out at once (no page of confirmation); "Invest only in" names the first one.
test('Dwie organizacje in the game: two different organisations in one month; the second choice is carried out at once', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.S.party_orgs.cash = 3;
  PolishParty.writeMirrors(Q);
  playFromHand(engine, 'polish_party_organizations');
  choose(engine, 'polish_party_organizations.p1_press_distribution');
  assert.equal(Q.S.party_orgs.cash, 3, 'nothing is spent with the first choice');
  assert.equal(choice(engine, 'polish_party_organizations.p2_cooperative_workers').canChoose, true);
  assert.equal(choice(engine, 'polish_party_organizations.p2_press_distribution'), undefined, 'the same organisation is not offered again (Z — 0.56)');
  assert.ok(ids(engine).length <= 7, 'at most seven choices on the second page');
  assert.equal(JSON.stringify(choice(engine, 'polish_party_organizations.only_one').title).replace(/[\["\]]/g, '').replace(/,/g, ''),
    'Invest only in: Extend the distribution of the press (+10 reach)');
  choose(engine, 'polish_party_organizations.p2_cooperative_workers');
  assert.equal(engine.state.sceneId, 'polish_party_organizations.result', 'no page of confirmation');
  assert.match(content(engine), /the press gains 10 reach/);
  assert.equal(Q.S.party_orgs.press.reach, 40);
  assert.equal(Q.S.party_orgs.cooperatives.projects.filter(c => c.status === 'prepared').length, 1, 'a workers’ cooperative is prepared');
  choose(engine, 'root');
  assert.equal(Q.time, 2, 'one month');
});

// Z — 0.68 (the user's note of 7 X 2026): the press distribution is offered only on the card of the organisations.
test('Kolportaż w Organizacjach 0.68: the Media card has no press distribution; the card of the organisations keeps it', () => {
  const media = dendry.startGame();
  playFromHand(media, 'polish_party_media');
  assert.deepEqual(ids(media), ['polish_party_media.format', 'polish_party_media.campaign', 'polish_party_media.unions_campaign',
    'polish_party_media.polemic', 'polish_party_media.turnout', 'polish_party_media.investigation', 'easy_discard']);
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  playFromHand(engine, 'polish_party_organizations');
  choose(engine, 'polish_party_organizations.p1_press_distribution');
  choose(engine, 'polish_party_organizations.only_one');
  assert.equal(Q.S.party_orgs.press.reach, 40, 'the press gains 10 reach through the card of the organisations');
});

// Z — 0.75 (the user's note of 8 X 2026): on "The new Committee" each candidate opens with the bold faction, says who the
// person was and what they enable in the game, and ends with the state; a candidate who cannot be added keeps the description.
test('Nowy skład CKW 0.75: each candidate has a bold faction, a description and the state', () => {
  const engine = dendry.startGame();
  playFromHand(engine, 'polish_party_advisers');
  choose(engine, 'polish_party_advisers.compose');
  const toggles = () => (engine.getCurrentChoices() || []).filter(c => /\.toggle_/.test(c.id));
  assert.equal(toggles().length, 11);
  for (const c of toggles()) {
    assert.doesNotMatch(plain(c.title), /\(/, `${c.id}: the title is the name only`);
    assert.equal(bold(c.subtitle).length, 1, `${c.id}: one bold faction`);
    assert.match(plain(c.subtitle), /In the game: /, c.id);
  }
  const daszynski = choice(engine, 'polish_party_advisers.toggle_daszynski');
  assert.equal(plain(daszynski.title), 'Ignacy Daszyński');
  assert.deepEqual(bold(daszynski.subtitle), ['Centrum.']);
  assert.match(plain(daszynski.subtitle), /In the game: Parliamentary Compromise.* On the Committee — remove\.$/);
  const zaremba = choice(engine, 'polish_party_advisers.toggle_zaremba');
  assert.equal(zaremba.canChoose, false, 'the three seats are taken');
  assert.deepEqual(bold(zaremba.subtitle), ['Lewica.']);
  assert.match(plain(zaremba.subtitle), /In the game: Worker-Peasant Front.* The three seats are taken\.$/);
  assert.deepEqual(bold(choice(engine, 'polish_party_advisers.toggle_malinowski').subtitle), ['Piłsudczycy.']);
  choose(engine, 'polish_party_advisers.toggle_daszynski');
  assert.match(plain(choice(engine, 'polish_party_advisers.toggle_zaremba').subtitle), / Add to the Committee\.$/);
  assert.match(plain(choice(engine, 'polish_party_advisers.toggle_daszynski').subtitle), / Add to the Committee\.$/);
});

// Z — 0.56 (item 4 of 5 X 2026): the union packages have a card of their own; one investment in one action.
test('Związki zawodowe — organizowanie i fundusze: a card of its own with seven choices; one investment costs the month', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  playFromHand(engine, 'polish_party_organizations');
  assert.ok(ids(engine).length <= 7, 'the organisations card has at most seven choices');
  assert.ok(!ids(engine).some(id => id.includes('union')), 'no union package in the organisations card');
  choose(engine, 'easy_discard');
  playFromHand(engine, 'polish_party_union_investments');
  assert.deepEqual(ids(engine), ['polish_party_union_investments.union_organize_industry', 'polish_party_union_investments.union_organize_rail',
    'polish_party_union_investments.union_organize_farm_labour', 'polish_party_union_investments.union_fund_industry',
    'polish_party_union_investments.union_fund_rail', 'polish_party_union_investments.union_fund_farm_labour', 'easy_discard']);
  choose(engine, 'polish_party_union_investments.union_organize_rail');
  assert.ok(Math.abs(Q.S.unions.rail.reach - 36.5) < 1e-9, 'rail +15 × 1.10: the character of a workers’ party (10.6)');
  assert.equal(Q.month_actions, 1, 'the month is spent');
  assert.equal(Q.S.cooldowns['party.union_investments'], Q.time + 2, 'the card waits two months');
  assert.equal(Q.S.cooldowns['party.organizations'], undefined, 'the organisations card keeps its own wait');
  assert.match(PolishParty.selectionStatus(Q, ['union_organize_rail', 'union_fund_rail'], 'party.union_investments').reason, /one investment for the unions/);
  assert.match(PolishParty.selectionStatus(Q, ['press_distribution', 'union_fund_rail']).reason, /Unknown package/);
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
  assert.match(plain(choice(engine, 'polish_party_dues.keep').subtitle), /^Present level Costs this month's action; the dues stay at 2, the collection brings 2 resources now, and the card waits six months\.$/);
  assert.deepEqual(bold(choice(engine, 'polish_party_dues.keep').subtitle), ['Present level']);
  assert.equal([].concat(choice(engine, 'easy_discard').title).join(''), 'Return to hand');
  choose(engine, 'easy_discard');
  assert.equal(Q.time, 1);
  engine.playCard('polish_party_dues');
  choose(engine, 'polish_party_dues.keep');
  assert.match(content(engine), /Dues stay at 2\. The collection brings 2 R\./);
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

test('the Milicja card recruits for 1 R and settles the month; the larger Milicja needs no upkeep (Z — 0.56)', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  playFromHand(engine, 'polish_party_militia');
  assert.equal(choice(engine, 'polish_party_militia.form_as').canChoose, false);
  const cash = Q.S.party_orgs.cash;
  choose(engine, 'polish_party_militia.recruit');
  choose(engine, 'root');
  assert.deepEqual([Q.time, Q.S.militia.strength, Q.pps_militia_strength], [2, 300, 300]);
  const ledger = Q.S.party_orgs.last_ledger;
  assert.equal(ledger.t, 1);
  assert.ok(Math.abs(Q.S.party_orgs.cash - (cash - 1)) < 1e-9, 'only the 1 R of the recruitment');
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
  assert.match(plain(choice(engine, 'polish_party_pils_influence.conditional').subtitle), /^Present line Confirming it costs this month's action/);
  assert.deepEqual(bold(choice(engine, 'polish_party_pils_influence.conditional').subtitle), ['Present line'], 'the label is bold');
  assert.doesNotMatch(plain(choice(engine, 'polish_party_pils_influence.support').subtitle), /present line/i);
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

// Z — 0.56: the priorities of the present programme carry the bold label; without a programme an empty set cannot be
// confirmed (it replaced the empty case of 0.51). Z — 0.57 (item 10 of the play notes): the card opens on the present
// programme, which is confirmed there in one step; the menu accepts only a changed set.
test('Program bez zmiany in the game (Z — 0.56, 0.57): six described priorities; the present programme is confirmed on the first page; the menu accepts only a change', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const PRIORITY_IDS = ['stabilisation_with_protection', 'public_works', 'wealth_and_investment', 'socialisation', 'agrarian_labour',
    'cooperatives_housing'];
  playFromHand(engine, 'polish_party_economic_program');
  assert.deepEqual(ids(engine), ['polish_party_economic_program.edit', 'easy_discard'], 'without a programme there is nothing to confirm');
  assert.equal(plain(choice(engine, 'polish_party_economic_program.edit').title).trim(), 'Compose the programme');
  assert.match(plain(engine.ui.paragraphs), /Without a programme, campaigns get no bonus/);
  choose(engine, 'polish_party_economic_program.edit');
  assert.deepEqual(ids(engine).filter(id => id.includes('.toggle_')), PRIORITY_IDS.map(id => 'polish_party_economic_program.toggle_' + id));
  for (const id of PRIORITY_IDS) {
    const option = choice(engine, 'polish_party_economic_program.toggle_' + id);
    assert.deepEqual(bold(option.subtitle), [], id + ': no present programme yet');
    assert.match(plain(option.subtitle), /^[A-Z][^.]+\. Add it to the set\.$/, id + ': one sentence, then the action');
  }
  assert.equal(plain(choice(engine, 'polish_party_economic_program.toggle_agrarian_labour').title), 'Land reform and rural modernisation');
  const empty = choice(engine, 'polish_party_economic_program.confirm');
  assert.equal(plain(empty.title), 'Accept the new programme');
  assert.equal(empty.canChoose, false, 'no programme and nothing chosen');
  assert.equal(plain(empty.subtitle), 'Choose at least one priority.');
  choose(engine, 'polish_party_economic_program.toggle_public_works');
  assert.match(plain(choice(engine, 'polish_party_economic_program.confirm').subtitle), /^Costs this month's action; the card then waits six months\.$/);
  choose(engine, 'polish_party_economic_program');
  choose(engine, 'easy_discard');
  assert.deepEqual([Q.time, Q.month_actions], [1, 0], 'returning the card is free');
  engine.playCard('polish_party_economic_program');
  choose(engine, 'polish_party_economic_program.edit');
  choose(engine, 'polish_party_economic_program.toggle_public_works');
  choose(engine, 'polish_party_economic_program.toggle_cooperatives_housing');
  choose(engine, 'polish_party_economic_program.confirm');
  choose(engine, 'root');
  assert.deepEqual(Q.S.actors.pps.strategy.economic_priorities, ['cooperatives_housing', 'public_works']);
  assert.equal(Q.time, 2);
  // Six months later the card opens on the present programme: confirm it at once, or change it.
  delete Q.S.cooldowns['party.economic_program'];
  playFromHand(engine, 'polish_party_economic_program');
  assert.deepEqual(ids(engine), ['polish_party_economic_program.confirm_present', 'polish_party_economic_program.edit', 'easy_discard']);
  assert.equal(plain(choice(engine, 'polish_party_economic_program.confirm_present').title),
    'Confirm the present programme: Cooperatives and housing; Public works and employment');
  assert.equal(plain(choice(engine, 'polish_party_economic_program.edit').title).trim(), 'Change the programme');
  assert.match(plain(engine.ui.paragraphs), /10% stronger among workers, the peasants, the intelligentsia and the unemployed/);
  choose(engine, 'polish_party_economic_program.edit');
  for (const id of PRIORITY_IDS) {
    const marked = ['public_works', 'cooperatives_housing'].includes(id);
    assert.deepEqual(bold(choice(engine, 'polish_party_economic_program.toggle_' + id).subtitle), marked ? ['Present programme'] : [], id);
  }
  const same = choice(engine, 'polish_party_economic_program.confirm');
  assert.equal(same.canChoose, false, 'an unchanged set is confirmed on the first page');
  assert.equal(plain(same.subtitle), 'Nothing has changed. To confirm the present programme, go back to the beginning.');
  choose(engine, 'polish_party_economic_program.toggle_public_works');
  choose(engine, 'polish_party_economic_program.toggle_cooperatives_housing');
  assert.equal(choice(engine, 'polish_party_economic_program.confirm').canChoose, true, 'a present programme can be withdrawn');
  choose(engine, 'polish_party_economic_program');
  choose(engine, 'polish_party_economic_program.confirm_present');
  assert.match(plain(engine.ui.paragraphs), /PPS confirms its present economic programme: Cooperatives and housing; Public works and employment\. Nothing else changes\./);
  choose(engine, 'root');
  assert.deepEqual(Q.S.actors.pps.strategy.economic_priorities, ['cooperatives_housing', 'public_works']);
  assert.equal(Q.S.cooldowns['party.economic_program'], Q.time + 5, 'the card waits six months from the month it was played');
});
