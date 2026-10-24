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

// Z — 0.78 (decision 2A of 8 X 2026): the card of the organisations takes one investment on one page, carried out at once;
// Milicja is on its own card. Money is counted to the grosz (decision 1A): a cash shown as "1 R" pays for a 1 R option.
test('Jedna inwestycja w Organizacjach 0.78: one page, one investment at once, no Milicja; a shown 1 R pays for 1 R', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.S.party_orgs.cash = 3;
  PolishParty.writeMirrors(Q);
  playFromHand(engine, 'polish_party_organizations');
  assert.deepEqual(ids(engine), ['polish_party_organizations.press_distribution', 'polish_party_organizations.tur',
    'polish_party_organizations.cooperative_workers', 'easy_discard']);
  choose(engine, 'polish_party_organizations.press_distribution');
  assert.equal(engine.state.sceneId, 'polish_party_organizations.result', 'carried out at once');
  assert.match(content(engine), /the press gains 10 reach/);
  assert.deepEqual([Q.S.party_orgs.press.reach, Q.S.party_orgs.cash], [40, 2]);
  choose(engine, 'root');
  assert.equal(Q.time, 2, 'one month');
  // A collection of 0.9972 R was shown as "1 R" but could not pay 1 R; now the cash is kept to the grosz.
  const other = dendry.startGame();
  const O = other.state.qualities;
  O.S.party_orgs.cash = 0.9972;
  PolishParty.writeMirrors(O);
  assert.equal(O.S.party_orgs.cash, 1);
  playFromHand(other, 'polish_party_organizations');
  assert.equal(choice(other, 'polish_party_organizations.press_distribution').canChoose, true);
  assert.equal(PolishParty.collectionGain(O.S), Math.round(PolishParty.collectionGain(O.S) * 100) / 100, 'the collection to the grosz');
});

// Z — 0.68 (the user's note of 7 X 2026): the press distribution is offered only on the card of the organisations.
test('Kolportaż w Organizacjach 0.68: the Media card has no press distribution; the card of the organisations keeps it', () => {
  const media = dendry.startGame();
  playFromHand(media, 'polish_party_media');
  // Z — 0.77: the Press card (the campaigns among voters moved to the Campaign card).
  assert.deepEqual(ids(media), ['polish_party_media.press_campaign', 'polish_party_media.reportage', 'polish_party_media.debate',
    'polish_party_media.investigation', 'polish_party_media.format', 'easy_discard']);
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  playFromHand(engine, 'polish_party_organizations');
  choose(engine, 'polish_party_organizations.press_distribution');
  assert.equal(Q.S.party_orgs.press.reach, 40, 'the press gains 10 reach through the card of the organisations');
});

// Z — 0.75 (the user's note of 8 X 2026): on "The new Committee" each candidate opens with the bold faction, says who the
// person was and what they enable in the game, and ends with the state; a candidate who cannot be added keeps the description.
test('Nowy skład CKW 0.75/0.76: each candidate has a bold faction, a description, the actions under „Actions:” and the state; three seats are required', () => {
  const engine = dendry.startGame();
  playFromHand(engine, 'polish_party_advisers');
  choose(engine, 'polish_party_advisers.compose');
  const toggles = () => (engine.getCurrentChoices() || []).filter(c => /\.toggle_/.test(c.id));
  assert.equal(toggles().length, 11);
  for (const c of toggles()) {
    assert.doesNotMatch(plain(c.title), /\(/, `${c.id}: the title is the name only`);
    assert.equal(bold(c.subtitle).length, 1, `${c.id}: one bold faction`);
    // Z — 0.76: the actions stand in a paragraph of their own, one per line after a dash.
    assert.match(plain(c.subtitle), /<span class="pl-adv-actions">Actions:<br>– /, c.id);
    assert.doesNotMatch(plain(c.subtitle), /In the game: /, c.id);
  }
  const daszynski = choice(engine, 'polish_party_advisers.toggle_daszynski');
  assert.equal(plain(daszynski.title), 'Ignacy Daszyński');
  assert.deepEqual(bold(daszynski.subtitle), ['Centrum.']);
  assert.match(plain(daszynski.subtitle), /Actions:<br>– Parliamentary Compromise: .*<br>– Broker a Coalition: .*<strong class="pl-adv-in">On the Committee<\/strong> — click to remove\.<\/span>$/);
  const zaremba = choice(engine, 'polish_party_advisers.toggle_zaremba');
  assert.equal(zaremba.canChoose, false, 'the three seats are taken');
  assert.deepEqual(bold(zaremba.subtitle), ['Lewica.']);
  assert.match(plain(zaremba.subtitle), /Actions:<br>– Worker-Peasant Front: .*The three seats are taken\.<\/span>$/);
  assert.deepEqual(bold(choice(engine, 'polish_party_advisers.toggle_malinowski').subtitle), ['Piłsudczycy.']);
  choose(engine, 'polish_party_advisers.toggle_daszynski');
  assert.match(plain(choice(engine, 'polish_party_advisers.toggle_zaremba').subtitle), /Add to the Committee\.<\/span>$/);
  assert.match(plain(choice(engine, 'polish_party_advisers.toggle_daszynski').subtitle), /Add to the Committee\.<\/span>$/);
  // Z — 0.76: with two people chosen the Committee cannot be confirmed.
  assert.equal(choice(engine, 'polish_party_advisers.confirm').canChoose, false);
  assert.match(plain(choice(engine, 'polish_party_advisers.confirm').subtitle), /Choose three people for the three seats \(now 2\)/);
});

// Z — 0.78 (the user's note of 8 X 2026): the present Committee can simply be confirmed — for free; the card leaves the hand
// and rests; a change still costs the month.
test('Obecny skład CKW 0.78: confirming the present Committee is possible, free, and changes nothing', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const before = PolishParty.activeAdvisers(Q);
  playFromHand(engine, 'polish_party_advisers');
  choose(engine, 'polish_party_advisers.compose');
  const confirm = choice(engine, 'polish_party_advisers.confirm');
  assert.equal(confirm.canChoose, true, 'the present Committee can be accepted');
  assert.match(plain(confirm.subtitle), /No change: the present Committee stays; this costs no month\./);
  choose(engine, 'polish_party_advisers.confirm');
  assert.match(content(engine), /The Central Executive Committee stays as it is: /);
  choose(engine, 'root');
  assert.deepEqual([Q.time, Q.month_actions || 0], [1, 0], 'no month is used');
  assert.deepEqual(PolishParty.activeAdvisers(Q), before);
  assert.ok(!engine.state.currentHands.main.some(c => c.id === 'polish_party_advisers'), 'the card leaves the hand');
  assert.equal(PolishRules.cardRest(Q, 'polish_party_advisers'), 3, 'and rests');
  // A change still costs the month.
  const other = dendry.startGame();
  playFromHand(other, 'polish_party_advisers');
  choose(other, 'polish_party_advisers.compose');
  choose(other, 'polish_party_advisers.toggle_daszynski');
  choose(other, 'polish_party_advisers.toggle_zaremba');
  assert.match(plain(choice(other, 'polish_party_advisers.confirm').subtitle), /A change costs this month’s action/);
});

// Z — 0.78 (decision 5A of 8 X 2026): the TUR courses are a card of their own once TUR works, one click each; the game picks
// the target; the party agenda has no courses any more.
test('Kursy TUR 0.78: a card of its own once TUR works; one click per course with a target chosen by the game', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  assert.ok(!deck(engine).includes('polish_party_tur'), 'no card before TUR is founded');
  playFromHand(engine, 'polish_party_agenda');
  assert.ok(!ids(engine).some(id => /course/.test(id)), 'no courses in the agenda');
  choose(engine, 'easy_discard');
  Q.S.party_orgs.tur.level = 1;
  Q.S.party_orgs.cash = 3;
  PolishParty.writeMirrors(Q);
  assert.ok(deck(engine).includes('polish_party_tur'));
  playFromHand(engine, 'polish_party_tur');
  // Z — 0.91 (decisions 3A and 4A of 24 X 2026): three courses, no preparation of a reform.
  assert.deepEqual(ids(engine), ['polish_party_tur.civil_rights', 'polish_party_tur.union_cadres', 'polish_party_tur.national_education',
    'easy_discard']);
  assert.match(plain(choice(engine, 'polish_party_tur.civil_rights').subtitle), /^For the workers\. Trust in PPS in this group rises for good/);
  assert.equal(choice(engine, 'polish_party_tur.union_cadres').canChoose, false, 'level 2');
  assert.equal(PolishParty.courseTarget(Q, 'union_cadres'), ['industry', 'rail', 'farm_labour'].sort((a, b) => Q.S.unions[a].trust - Q.S.unions[b].trust)[0]);
  choose(engine, 'polish_party_tur.civil_rights');
  assert.deepEqual([Q.S.party_orgs.tur.active_course.course, Q.S.party_orgs.tur.active_course.target], ['civil_rights', 'workers']);
  assert.equal(Q.S.party_orgs.cash, 2);
  choose(engine, 'root');
  assert.equal(Q.time, 2);
});

// Z — 0.78 (decision 4A of 8 X 2026): organisational work is two options straight on the agenda; the game picks the weakest
// branch and the groups of the character of the party, and says so with the gain.
test('Praca organizacyjna 0.78: two options on the agenda; the weakest branch and the groups of the character of the party', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.S.unions.rail.reach = 8; // below the agricultural labourers, who start at 10 (Z — 0.86)
  playFromHand(engine, 'polish_party_agenda');
  assert.ok(ids(engine).includes('polish_party_agenda.organize_unions') && ids(engine).includes('polish_party_agenda.organize_voters'));
  assert.ok(!ids(engine).includes('polish_party_agenda.organize'), 'no second page');
  assert.match(plain(choice(engine, 'polish_party_agenda.organize_unions').subtitle), /^No money\. The weakest branch: Railways — reach 8 → 10\.2/);
  assert.match(plain(choice(engine, 'polish_party_agenda.organize_voters').subtitle), /The workers — PPS reach [\d.]+ → [\d.]+\.$/);
  choose(engine, 'easy_discard');
  // A party of workers and peasants organises the peasants too.
  Q.S.actors.pps.strategy.electoral_base = 'workers_peasants';
  const peasant = Q.S.society.cells.find(c => c.class_id === 'rural'), worker = Q.S.society.cells.find(c => c.class_id === 'workers');
  const [p0, w0] = [peasant.base_reach_pps, worker.base_reach_pps];
  engine.playCard('polish_party_agenda');
  choose(engine, 'polish_party_agenda.organize_voters');
  assert.ok(peasant.base_reach_pps > p0 && worker.base_reach_pps > w0);
  assert.match(content(engine), /among the workers \+[\d.]+ and the peasants \+[\d.]+\./);
  choose(engine, 'root');
  assert.equal(Q.time, 2);
});

// Z — 0.79 (decision 8A of 14 X 2026): the card of unity says why it is here — the discontented faction, its demand (also the
// opening line of the Soviet model, no longer shown raw) and what threatens — and shows only the options that fit.
test('Jedność i kierownictwo 0.79: why the card is here, the demand in words and only the options that fit', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  PolishParty.stanceChoose(Q, 'ussr_position', 'sympathetic');
  Q.S.actors.pps.factions.centrum.dissent = 44;
  PolishParty.writeMirrors(Q);
  engine.goToScene('main');
  playFromHand(engine, 'polish_party_unity');
  const text = content(engine);
  assert.match(text, /Centrum PPS<\/strong> is discontented: dissent 44 of 100/);
  assert.match(text, /It wants: return to the line “no declared position” \(PPS and the Soviet model\)\. At dissent 60 it raises this as its case/);
  assert.doesNotMatch(text, /uncommitted/);
  assert.match(text, /Calm \(dissent below 30\): Lewica PPS, Piłsudczycy\./);
  assert.deepEqual(ids(engine), ['polish_party_unity.concession_centrum', 'polish_party_unity.expel_centrum', 'easy_discard'],
    'no options for the calm factions, no postponement below 45, no line on the communists while the channel is closed');
  PolishRules.setLanguage('pl');
  try {
    assert.match(PolishParty.describeDemand(Q, PolishParty.factionDemand(Q, 'centrum')), /^powrót do linii „bez zajętego stanowiska”/);
  } finally {
    PolishRules.setLanguage('en');
  }
});

// Z — 0.79 (decision 5A of 14 X 2026): Ziemięcki's emergency collection, +2 R, with the shared cooldown of the Committee.
test('Nadzwyczajna zbiórka 0.79: Ziemięcki brings +2 resources at once; the Committee then waits', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.ziemiecki_advisor = 1;
  const cash = Q.S.party_orgs.cash;
  engine.goToScene('ziemiecki');
  assert.deepEqual(ids(engine), ['ziemiecki.emergency_fundraising', 'ziemiecki.municipal_socialism', 'root']);
  choose(engine, 'ziemiecki.emergency_fundraising');
  assert.equal(Q.S.party_orgs.cash, cash + 2);
  assert.match(content(engine), /An emergency collection organised by the Committee: \+2 resources\./);
  assert.equal(PolishParty.advisorActionStatus(Q, 'ziemiecki', 'municipal_socialism').available, false, 'the shared cooldown');
});

// Z — 0.79 (the user's notes of 14 X 2026): an adviser's action says what is missing — the ministry of its government card,
// or TUR before its price.
test('Powody niedostępności 0.79: Czapiński names the missing ministry; socialist education asks for TUR before money', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.czapinski_advisor = 1;
  Q.S.party_orgs.cash = 0;
  PolishParty.writeMirrors(Q);
  engine.goToScene('czapinski');
  assert.equal(Q.pl_czap_public_control_why, 'Needs PPS in the cabinet with the Industry and Trade ministry.');
  assert.equal(PolishParty.advisorActionStatus(Q, 'czapinski', 'socialist_education').reason,
    'Needs a working TUR (found it with the card Organisations of PPS).', 'TUR before the price');
});

// Z — 0.56 (item 4 of 5 X 2026): the union packages have a card of their own; one investment in one action.
test('Związki zawodowe — organizowanie (Z — 0.86): a card of its own with three branches, their reach and purpose and the addition to collections; one investment costs the month', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  playFromHand(engine, 'polish_party_organizations');
  assert.ok(ids(engine).length <= 7, 'the organisations card has at most seven choices');
  assert.ok(!ids(engine).some(id => id.includes('union')), 'no union package in the organisations card');
  choose(engine, 'easy_discard');
  playFromHand(engine, 'polish_party_union_investments');
  assert.deepEqual(ids(engine), ['polish_party_union_investments.union_organize_industry', 'polish_party_union_investments.union_organize_rail',
    'polish_party_union_investments.union_organize_farm_labour', 'easy_discard'], 'no union funds since Z — 0.86');
  assert.match(plain(choice(engine, 'polish_party_union_investments.union_organize_farm_labour').subtitle),
    /^1 resource; reach 10 → 26\.5\. Votes in the countryside; from reach 40 the harvest strike\.$/);
  assert.match(plain(choice(engine, 'polish_party_union_investments.union_organize_rail').subtitle), /control of strategic infrastructure/);
  assert.match(JSON.stringify(engine.ui.paragraphs), /Strong unions add 1% to every collection for each point of their average reach above 20; now \+0%\./);
  choose(engine, 'polish_party_union_investments.union_organize_rail');
  assert.ok(Math.abs(Q.S.unions.rail.reach - 36.5) < 1e-9, 'rail +15 × 1.10: the character of a workers’ party (10.6)');
  assert.equal(Q.month_actions, 1, 'the month is spent');
  assert.equal(Q.S.cooldowns['party.union_investments'], Q.time + 2, 'the card waits two months');
  assert.equal(Q.S.cooldowns['party.organizations'], undefined, 'the organisations card keeps its own wait');
  assert.match(PolishParty.selectionStatus(Q, ['union_organize_rail', 'union_organize_industry'], 'party.union_investments').reason, /one investment for the unions/);
  assert.match(PolishParty.selectionStatus(Q, ['press_distribution', 'union_fund_rail']).reason, /Unknown package/, 'the fund packages are gone');
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
  // Z — 0.78 (decision 4A): organisational work among our voters, the groups of the character of the party.
  choose(engine, 'polish_party_agenda.organize_voters');
  assert.match(content(engine), /Organisers work among our voters: the base reach of PPS among the workers \+2\.2\./, '×1.10 in the party’s own groups');
  choose(engine, 'root');
  assert.equal(Q.time, 2);
  assert.ok(Q.S.party_orgs.cash >= 0);
  assert.ok(Q.S.society.cells.filter(c => c.class_id === 'workers').every(c => Math.abs(c.base_reach_pps - 22.2) < 1e-9));
});

test('the Milicja card recruits for 1 R and settles the month; the larger Milicja needs no upkeep (Z — 0.56)', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  playFromHand(engine, 'polish_party_militia');
  assert.equal(choice(engine, 'polish_party_militia.form_as').canChoose, false);
  const cash = Q.S.party_orgs.cash;
  choose(engine, 'polish_party_militia.recruit');
  choose(engine, 'root');
  assert.deepEqual([Q.time, Q.S.militia.strength, Q.pps_militia_strength], [2, 350, 350], 'Z — 0.89: +150 members');
  const ledger = Q.S.party_orgs.last_ledger;
  assert.equal(ledger.t, 1);
  assert.ok(Math.abs(Q.S.party_orgs.cash - (cash - 1)) < 1e-9, 'only the 1 R of the recruitment');
  engine.goToScene('status');
  assert.match(content(engine), /350 members, training 1\/5/);
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

// Z — 0.77: the same matter twice within six months gains less among the same voters (saturation); the card's rest of three
// months does not stop a card already in the hand.
test('Kampania bez odnowienia karty: the same matter twice in consecutive months; the second gains less', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.S.party_orgs.cash = 5;
  PolishParty.writeMirrors(Q);
  const workers = () => PolishElectorate.aggregate(Q.S, c => c.class_id === 'workers' && c.employment === 'employed', 'pps');
  const gains = [];
  for (let month = 0; month < 2; month++) {
    const before = workers();
    playFromHand(engine, 'polish_party_campaign');
    choose(engine, 'polish_party_campaign.eight_hours');
    choose(engine, 'root');
    gains.push(workers() - before);
  }
  assert.equal(Q.time, 3);
  assert.ok(gains[0] > 0 && gains[1] > 0);
  assert.ok(gains[1] < gains[0], 'saturation of the matter among the same voters');
});

test('Konfiskata in the game: a restricted press weakens the press campaign; the Campaign card goes through the unions, and since Z — 0.90 its press support falls too', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const free = PolishParty.pressCampaignPreview(Q);
  const campaign = PolishParty.issuePreview(Q, 'eight_hours');
  PolishParty.addPressRestriction(Q, {id: 'test-confiscation', event_id: 'fixture', reach_penalty: 30, expires_at: Q.time + 2});
  const cell = Q.S.society.cells.find(c => c.class_id === 'workers');
  assert.equal(PolishParty.cellReach(Q.S, cell, 'unions'), 20, 'the branches only');
  assert.ok(PolishParty.cellReach(Q.S, cell, 'press') < 0.5 * 20 + 0.3 * 30 + 0.2 * 20, 'the press part is restricted');
  // Z — 0.80: the preview in words, the change in parentheses ("It reaches workers (+0.5) …").
  const number = text => Number(text.match(/reaches workers \(\+([\d.]+)\)/)[1]);
  assert.ok(number(PolishParty.pressCampaignPreview(Q)) < number(free), 'the press campaign is weaker');
  // Z — 0.90 (decision 6(ii) of 24 X 2026): the press supports the campaigns of the Campaign card among its readers; a confiscation
  // lowers that support too.
  assert.notEqual(PolishParty.issuePreview(Q, 'eight_hours'), campaign, 'the press support of the campaign falls');
  assert.equal(PolishParty.cellReach(Q.S, cell, 'unions'), 20, 'the campaign itself still goes through the unions');
  playFromHand(engine, 'polish_party_campaign');
  choose(engine, 'polish_party_campaign.eight_hours');
  assert.match(content(engine), /The campaign “In defence of the eight-hour day”: PPS gains among employed workers \(\+/);
  choose(engine, 'root');
  assert.equal(Q.time, 2);
});

// Z — 0.77 (decisions of 8 X 2026): the Campaign card — five campaigns on a matter, each over its own groups at once, with the
// expected change on the card; the line and the situation strengthen a campaign; rallies only before an election.
// Z — 0.80 (the user's note of 20 X 2026): the preview in words ("very popular among …", the change in parentheses) and no
// rallies on the card any more.
test('Kampania 0.77: five matters over several groups at once, a preview with the sum, boosts from the line and the situation, rallies before the vote', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  assert.ok(deck(engine).includes('polish_party_campaign'));
  playFromHand(engine, 'polish_party_campaign');
  assert.deepEqual(ids(engine), ['polish_party_campaign.eight_hours', 'polish_party_campaign.prices', 'polish_party_campaign.land',
    'polish_party_campaign.republic', 'polish_party_campaign.unemployed', 'easy_discard'], 'no rallies');
  assert.match(plain(choice(engine, 'polish_party_campaign.eight_hours').subtitle),
    /^Very popular among employed workers \(\+[\d.]+\), popular among the unemployed \(\+[\d.]+\), disliked among the bourgeoisie and landowners \(−[\d.]+\)\./);
  assert.doesNotMatch(plain(choice(engine, 'polish_party_campaign.eight_hours').subtitle), /points|in the whole country/);
  // The opening direction, parliamentary socialism, strengthens the land and the unemployed; a threat to democracy the Republic.
  assert.match(plain(choice(engine, 'polish_party_campaign.land').subtitle), /Stronger now: the direction of the party\./);
  assert.doesNotMatch(plain(choice(engine, 'polish_party_campaign.republic').subtitle), /Stronger now/);
  const before = PolishParty.issuePreview(Q, 'republic');
  Q.S.coup = Object.assign(Q.S.coup || {}, {pressure: 50});
  assert.match(PolishParty.issuePreview(Q, 'republic'), /Stronger now: the situation of the country\./);
  const total = text => [...text.matchAll(/\(([+−])([\d.]+)\)/g)].reduce((n, m) => n + (m[1] === '+' ? 1 : -1) * Number(m[2]), 0);
  assert.ok(total(PolishParty.issuePreview(Q, 'republic')) >= total(before));
  Q.S.coup.pressure = 0;
  // One campaign: the month (no money since 0.79); PPS gains among employed workers and loses a little among the bourgeoisie.
  const share = f => PolishElectorate.aggregate(Q.S, f, 'pps');
  const employed = c => c.class_id === 'workers' && c.employment === 'employed', rich = c => c.class_id === 'bourgeois_landowners';
  const [cash, w0, b0] = [Q.S.party_orgs.cash, share(employed), share(rich)];
  choose(engine, 'polish_party_campaign.eight_hours');
  assert.equal(Q.S.party_orgs.cash, cash, 'Z — 0.79: a campaign costs no money');
  assert.ok(share(employed) > w0 && share(rich) < b0);
  choose(engine, 'root');
  assert.equal(Q.time, 2);
  assert.equal(PolishRules.cardRest(Q, 'polish_party_campaign'), 2, 'the card rests');
  // Z — 0.80: no rallies even in the last months before the vote.
  Q.S.parliament.next_election.time = Q.time + 2;
  playFromHand(engine, 'polish_party_campaign');
  assert.ok(!ids(engine).includes('polish_party_campaign.rallies'));
  assert.doesNotMatch(content(engine), /Rallies|rallies before/);
});

// Z — 0.77: the Press card — a press campaign over the groups of its format, half of its gains from the voters of the main
// opponent of the line; reportage raises trust; an open debate lowers the dissent of every faction; no polemic any more.
test('Prasa 0.77: the press campaign follows the format and the main opponent; reportage and an open debate', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.S.party_orgs.cash = 5;
  PolishParty.writeMirrors(Q);
  playFromHand(engine, 'polish_party_media');
  assert.match(plain(choice(engine, 'polish_party_media.press_campaign').subtitle),
    /^One unit of the party's money\. It reaches workers \(\+[\d.]+\) and the unemployed \(\+[\d.]+\); half of the new votes it takes from our main opponent: the National Democrats\./);
  const zln = () => PolishElectorate.aggregate(Q.S, c => c.class_id === 'workers', 'zln');
  const z0 = zln();
  choose(engine, 'polish_party_media.press_campaign');
  assert.ok(zln() < z0, 'the main opponent loses voters');
  assert.match(content(engine), /The press campaign: PPS gains among workers \(\+/);
  choose(engine, 'root');
  // A popular format reaches the intelligentsia and the petty bourgeoisie too.
  Q.S.party_orgs.press.format = 'popular';
  assert.match(PolishParty.pressCampaignPreview(Q), /the intelligentsia \(\+[\d.]+\).*the petty bourgeoisie \(\+/);
  Q.S.party_orgs.press.format = 'party_journal';
  // Reportage: the trust of workers and the unemployed +3.
  const worker = Q.S.society.cells.find(c => c.class_id === 'workers');
  const trust = worker.trust_pps;
  playFromHand(engine, 'polish_party_media');
  const credibility = Q.S.party_orgs.press.credibility;
  choose(engine, 'polish_party_media.reportage');
  assert.equal(worker.trust_pps, Math.min(100, trust + 3));
  assert.equal(Q.S.party_orgs.press.credibility, credibility + 2, 'Z — 0.90 (decision 5A): honest reportage, credibility +2');
  choose(engine, 'root');
  // An open debate: no money, every faction's dissent −3.
  const dissent = Q.lewica_dissent, cash = Q.S.party_orgs.cash;
  playFromHand(engine, 'polish_party_media');
  choose(engine, 'polish_party_media.debate');
  assert.equal(Q.lewica_dissent, dissent - 3);
  assert.equal(Q.S.party_orgs.cash, cash, 'the debate costs no money');
  choose(engine, 'root');
  assert.equal(Q.time, 4);
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

// Z — 0.89 (the user's note of 24 X 2026 on the card): what the self-defence is for in plain words, its members and its training;
// no forces and no foretelling of events.
test('Karta Milicji 0.89: plain words, members and training; no forces and no foretelling (pl)', () => {
  const engine = dendry.startGame(1922, 'pl');
  playFromHand(engine, 'polish_party_militia');
  const text = content(engine);
  assert.match(text, /Samoobrona partii chroni strajki, wiece i lokale naszych organizacji, a gdy konflikt w kraju się zaostrzy, może stanąć po stronie, którą wybierze partia\. ","Milicja ma 200 członków; wyszkolenie na poziomie 1 z 5\./);
  assert.doesNotMatch(text, /zamach|\d F\b|sprawnoś|zmęczeni/);
  const title = id => [].concat(choice(engine, 'polish_party_militia.' + id).title).join('');
  assert.deepEqual(['recruit', 'militarize', 'form_as'].map(title), ['Przeprowadź werbunek', 'Przeprowadź szkolenie', 'Przekształć w Akcję Socjalistyczną']);
});

// Z — 0.90 (decision 4A of 24 X 2026 with the user's note that the descriptions were too terse): the press card in full sentences.
test('Karta Prasy 0.90: full sentences about the press, its readers, their trust and the support of the campaigns (pl)', () => {
  const engine = dendry.startGame(1922, 'pl');
  const Q = engine.state.qualities;
  Q.S.party_orgs.cash = 5;
  PolishParty.writeMirrors(Q);
  playFromHand(engine, 'polish_party_media');
  // Z — 0.90 (the user's note: the full version was too long again): two sentences at the top, one or two for each option.
  assert.match(content(engine), /Pismo partyjne dociera do 30 na 100 czytelników spośród robotników i bezrobotnych, a czytelnicy umiarkowanie mu ufają\. Wzmacnia każdą naszą kampanię wśród nich o 5%\./);
  const sub = id => plain(choice(engine, 'polish_party_media.' + id).subtitle);
  assert.match(sub('press_campaign'), /^Jedna jednostka środków\. Trafia do robotników/);
  assert.equal(sub('reportage'), 'Jedna jednostka środków. Robotnicy i bezrobotni bardziej ufają PPS (+3), więc następne kampanie wśród nich będą mocniejsze; prasa zyskuje na wiarygodności (+2).');
  assert.equal([].concat(choice(engine, 'polish_party_media.format').title).join(''), 'Zmień format na gazetę popularną');
  assert.equal(sub('format'), 'Jedna jednostka środków. Więcej czytelników (+10), także wśród inteligencji i drobnomieszczaństwa, i dochód ze sprzedaży od zasięgu 50, ale mniej zaufania (−5). Za pierwszym razem sprzeciw Centrum PPS (+3).');
});
