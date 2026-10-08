const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Engine tests of stage 3 (implementation plan; technical reference 8.1–8.9, 9.1–9.4, 9.8, 17.4):
// talks with parties, offers, cabinets, portfolios, agreements and the government-support card.
const { choose, clone } = dendry;
let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

function ids(engine) {
  return (engine.getCurrentChoices() || []).map(item => item.id);
}
function choice(engine, id) {
  return (engine.getCurrentChoices() || []).find(item => item.id === id);
}
function playFromHand(engine, cardId) {
  engine.state.currentHands.main = [{ id: cardId, title: cardId }];
  engine.playCard(cardId);
}

test('the talks card: one partner, the month is spent, the partner waits three months; closing is free', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const resources = Q.resources;
  playFromHand(engine, 'inter_party_relationships');
  assert.equal(engine.state.sceneId, 'inter_party_relationships');
  assert.equal(choice(engine, 'inter_party_relationships.kpp'), undefined, 'no talks with the KPP before a contact');
  assert.equal(choice(engine, 'inter_party_relationships.kpp_contact').canChoose, true);
  choose(engine, 'easy_discard');
  assert.deepEqual([Q.time, Q.month_actions], [1, 0], 'closing the card costs nothing');
  playFromHand(engine, 'inter_party_relationships');
  choose(engine, 'inter_party_relationships.psl_wyzwolenie');
  assert.equal(Q.S.actors.relations.psl_wyzwolenie, 69);
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'main');
  assert.equal(Q.time, 2, 'one month settled');
  assert.equal(Q.S.history.actions.at(-1).action_id, 'party.outreach');
  playFromHand(engine, 'inter_party_relationships');
  assert.equal(choice(engine, 'inter_party_relationships.psl_wyzwolenie').canChoose, false);
  assert.equal(choice(engine, 'inter_party_relationships.psl_piast').canChoose, true);
  // Z — 0.56: with no income or upkeep the money of the party does not change in a settled month, and the talk costs none.
  assert.ok(Math.abs(Q.resources - resources) < 1e-9, 'no resources are spent on the talk');
  assert.deepEqual(Q.S.history.actions.filter(a => a.action_id === 'party.outreach').map(a => a.resource_cost), [{}]);
});

test('relation changes written by an inherited adviser scene reach the one owner of relations', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const before = clone(Q.S.actors.relations);
  // Since stage 5 the Polish advisers change relations through the owner; a write to a mirror field by any
  // inherited scene is still taken over once.
  Q.psl_piast_relation += 3; Q.npr_relation += 3; Q.pschd_relation += 2;
  engine.goToScene('main');
  assert.equal(Q.S.actors.relations.psl_piast, before.psl_piast + 3);
  assert.equal(Q.S.actors.relations.npr, before.npr + 3);
  assert.equal(Q.S.actors.relations.pschd, before.pschd + 2);
  assert.equal(Q.psl_piast_relation, Q.S.actors.relations.psl_piast);
  const restored = dendry.saveAndRestore(engine);
  restored.goToScene('main');
  assert.deepEqual(restored.state.qualities.S.actors.relations, Q.S.actors.relations, 'a save and load changes nothing');
});

// ---- Part 3b: the one-screen cabinet formation (card 7.1; technical reference 8.4–8.8, 20.1.1) ----

function content(engine) {
  return JSON.stringify(engine.ui.paragraphs);
}
// The November 1922 election with the given vote shares (none: the game's own support), up to the
// post-election summary that opens the mandatory formation.
function november(engine, values) {
  const Q = engine.state.qualities;
  Q.year = 1922; Q.month = 11; Q.time = 11;
  if (values) {
    // Either one row for every class, or one row per class (LEFT_SEJM_ROWS).
    for (const group of Q.classes) for (const party of Q.parties) Q[`${group}_${party}`] = (values[group] || values)[party] || 0;
    const flat = Object.values(values).flatMap(v => (typeof v === 'object' ? Object.values(v) : [v]));
    if (flat.some(v => v > 0)) { PolishElectorate.seedCells(Q); PolishElectorate.writeClassMirrors(Q); }
  }
  engine._runActions(engine.game.scenes.polish_opening_state.onArrival);
  engine.goToScene('post_event');
  choose(engine, 'sejm_election.calculate');
  assert.equal(engine.state.sceneId, 'sejm_election.government');
}
// The opening rows before the calibration of stage 8: a Sejm in which PPS is the largest club of the left, so that the
// formation screen can be tested with Daszyński as premier (a fixture, not the calibrated opening).
const OLD_ROW = values => Object.fromEntries(['kpp', 'pps', 'npr', 'psl_wyzwolenie', 'psl_piast', 'pschd', 'zln', 'minorities_bloc', 'other'].map((p, i) => [p, values[i]]));
const LEFT_SEJM_ROWS = {
  workers: OLD_ROW([11.04, 38.64, 18.4, 1.84, 0.92, 9.2, 7.36, 4.6, 8]),
  old_middle: OLD_ROW([1.84, 9.2, 12.88, 3.68, 5.52, 18.4, 29.44, 11.04, 8]),
  new_middle: OLD_ROW([3.68, 22.08, 4.6, 8.28, 4.6, 9.2, 25.76, 13.8, 8]),
  rural: OLD_ROW([1.76, 3.52, 1.76, 28.16, 29.92, 5.28, 13.2, 4.4, 12]),
  bourgeois_landowners: OLD_ROW([0, 1.84, 3.68, 0.92, 6.44, 13.8, 48.76, 16.56, 8]),
  unemployed: OLD_ROW([29.44, 34.96, 11.04, 1.84, 0.92, 4.6, 3.68, 5.52, 8]),
  national_minorities: OLD_ROW([9.2, 6.44, 0.92, 1.84, 0.92, 0.92, 1.84, 69.92, 8]),
};
// Z — 0.67 (decision 3A of 7 X 2026): after the election of 1922 a cabinet with PPS needs 185 MPs of its own clubs. The
// formation tests give the left a strong result in the chamber — PPS 110 and PSL Wyzwolenie 80, a minority cabinet with
// the 30 MPs of the minority representations — and open the formation again on these seats (a fixture).
function strongLeft(engine) {
  const Q = engine.state.qualities;
  Q.S.parliament.clubs = PolishInstitutions.clubsFromSeats({ kpp: 2, pps: 110, npr: 20, psl_wyzwolenie: 80, psl_piast: 60, pschd: 30,
    zln: 100, minorities_bloc: 30, other: 12 }, Q.parties);
  PolishGovernment.beginPostElectionFormation(Q);
}
// Only PPS, KPP and small lists win seats: no cabinet can be formed (a crisis fixture).
const NO_PARTNERS = { kpp: 60, pps: 20, other: 20 };

// Z — 0.71 (decisions 0 and 1A–5A of 7 X 2026): the formation is a wizard — an introduction, the variant with the role of PPS,
// the prime minister and the portfolios when there is a choice, and a summary that keeps the offer apart from what follows.
test('C1 0.71: the introduction, the variant, the prime minister, the portfolios and the summary; Back on every step; one commit', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  november(engine, LEFT_SEJM_ROWS);
  PolishGovernment.changeRelation(Q, 'npr', 60 - Q.S.actors.relations.npr, 'fixture');
  strongLeft(engine);
  choose(engine, 'polish_cabinet_formation');
  const before = { t: Q.time, actions: Q.month_actions, cabinet: clone(Q.S.cabinet), negotiations: Q.S.history.negotiations.length };
  // Decision 0: what is happening, who appoints the cabinet and how the Sejm stands; the mandatory formation has no Close.
  assert.deepEqual(ids(engine), ['polish_cabinet_formation.variants']);
  assert.match(content(engine), /The election has given the Sejm a new composition, and a new cabinet must be formed\. Until then the cabinet of Antoni Ponikowski governs as caretaker\./);
  assert.match(content(engine), /The Naczelnik Państwa, Józef Piłsudski, appoints the cabinet; his candidate for this period is Julian Nowak\./);
  assert.match(content(engine), /The Sejm has 444 MPs; a majority is 223\. The largest clubs: PPS 110, ZLN 100, PSL Wyzwolenie 80/);
  // Decision 2A: the variant carries the role of PPS — in the cabinet, a cabinet of experts from outside, or opposition.
  choose(engine, 'polish_cabinet_formation.variants');
  assert.equal(choice(engine, 'polish_cabinet_formation.var_broad_centre').canChoose, false, 'greyed with its reason');
  assert.match(JSON.stringify(choice(engine, 'polish_cabinet_formation.var_broad_centre').subtitle), /real crisis/);
  assert.match(JSON.stringify(choice(engine, 'polish_cabinet_formation.var_expert').title), /From outside: a cabinet of experts/);
  assert.match(JSON.stringify(choice(engine, 'polish_cabinet_formation.var_expert').subtitle), /Prime minister Julian Nowak; support signed by: NPR ✓, PSL Wyzwolenie ✓, PSL Piast ✓/);
  assert.match(JSON.stringify(choice(engine, 'polish_cabinet_formation.var_opposition').subtitle), /the head of state appoints a cabinet without PPS: Julian Nowak — Cabinet of experts/);
  assert.equal(choice(engine, 'polish_cabinet_formation.var_mode_external_support'), undefined, 'no external support of a party cabinet');
  choose(engine, 'polish_cabinet_formation.var_left_labour');
  // Decisions 4A and 5A: only who can lead this cabinet now; the faction candidates of PPS with their reasons.
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation.premier');
  assert.deepEqual(ids(engine), ['polish_cabinet_formation.cand_daszynski', 'polish_cabinet_formation.cand_moraczewski',
    'polish_cabinet_formation.cand_czapinski', 'polish_cabinet_formation.cand_thugutt', 'polish_cabinet_formation.back_variants']);
  assert.equal(choice(engine, 'polish_cabinet_formation.cand_czapinski').canChoose, false);
  assert.match(JSON.stringify(choice(engine, 'polish_cabinet_formation.cand_czapinski').subtitle), /His faction has 15% of the party; it needs 30%/);
  assert.match(JSON.stringify(choice(engine, 'polish_cabinet_formation.cand_thugutt').subtitle), /PSL Wyzwolenie is not the largest club of this cabinet/);
  choose(engine, 'polish_cabinet_formation.back_variants');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation.variants', 'Back returns to the previous step');
  choose(engine, 'polish_cabinet_formation.var_left_labour');
  choose(engine, 'polish_cabinet_formation.cand_daszynski');
  // Z — 0.61: the portfolios are bought with influence points (62 = 52% of the cabinet's seats + 10); NPR keeps Labour.
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation.portfolio_menu');
  assert.match(content(engine), /Influence points: 62 = PPS share of the cabinet’s seats 52% \+ 10/);
  assert.equal(choice(engine, 'polish_cabinet_formation.take_labor').canChoose, false, 'NPR needs Labour');
  choose(engine, 'polish_cabinet_formation.take_interior');
  assert.equal(choice(engine, 'polish_cabinet_formation.drop_interior').canChoose, true, 'it can be given back');
  choose(engine, 'polish_cabinet_formation.ports_next');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation.summary');
  assert.deepEqual(Q.S.negotiation.draft, { configuration_id: 'left_labour', candidate_id: 'daszynski', pps_mode: 'member',
    seek_minority_support: false, portfolio_claim: ['economic', 'interior'] });
  // The summary: our offer apart from what follows from it; each club in one line, its parts open on a click.
  assert.match(content(engine), /Our offer:"\]\}," ","PPS, PSL Wyzwolenie and NPR — PPS in the cabinet; prime minister Ignacy Daszyński; PPS portfolios: Interior, Industry and Trade\./);
  assert.match(content(engine), /<details class=\\"pl-score\\"><summary>PSL Wyzwolenie — agrees · \d+\/60<\/summary>relation with PPS \+20 · programme of the cabinet and the club’s views/);
  assert.match(content(engine), /<details class=\\"pl-score\\"><summary>NPR — agrees · \d+\/60<\/summary>/);
  assert.match(content(engine), /after the commit the cabinet is appointed at once — PPS, PSL Wyzwolenie and NPR, prime minister Ignacy Daszyński/);
  choose(engine, 'polish_cabinet_formation.back_summary');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation.portfolio_menu', 'Back from the summary to the portfolios');
  choose(engine, 'polish_cabinet_formation.ports_next');
  choose(engine, 'polish_cabinet_formation.minorities_on');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation.summary');
  choose(engine, 'polish_cabinet_formation.minorities_off');
  assert.deepEqual([Q.time, Q.month_actions, Q.S.history.negotiations.length], [before.t, before.actions, before.negotiations]);
  assert.deepEqual(Q.S.cabinet, before.cabinet, 'nothing is decided before the offer is submitted');
  assert.equal(Q.S.turn.pending, null);
  const factions = clone(Q.S.actors.pps.factions);
  choose(engine, 'polish_cabinet_formation.submit');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation.result');
  assert.equal(Q.S.history.negotiations.length, before.negotiations + 1, 'one commit');
  assert.deepEqual([Q.time, Q.month_actions], [before.t, before.actions], 'the mandatory formation costs no month');
  assert.match(content(engine), /PSL Wyzwolenie: accepts/);
  assert.match(content(engine), /The head of state appoints ","Ignacy Daszyński/);
  assert.match(content(engine), /A minority cabinet: it has fewer than 223 MPs, but more MPs declared for it than against it/, 'explained (Z — 0.56)');
  assert.equal(Q.S.cabinet.pm, 'daszynski');
  assert.deepEqual([Q.S.cabinet.portfolios.labor, Q.S.cabinet.portfolios.interior, Q.S.cabinet.portfolios.economic], ['npr', 'pps', 'pps']);
  assert.equal(Q.S.cabinet.appointment_basis, 'naczelnik_panstwa', 'before the constitutional transfer');
  // Decision 5A: Daszyński strengthens the centre of PPS (+5 strength, −5 dissent); the other factions grumble (+3 dissent).
  assert.equal(Q.S.actors.pps.factions.centrum.dissent, Math.max(0, factions.centrum.dissent - 5));
  assert.deepEqual(['lewica', 'pilsudczycy'].map(id => Q.S.actors.pps.factions[id].dissent - factions[id].dissent), [3, 3]);
  assert.ok(Q.S.actors.pps.factions.centrum.strength > factions.centrum.strength);
  choose(engine, 'polish_cabinet_formation.done');
  assert.equal(engine.state.sceneId, 'sejm_election.finish');
  assert.equal(Q.sejm_pending.phase, 'complete');
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'main');
  assert.equal(Q.time, 11);
  const restored = dendry.saveAndRestore(engine);
  restored.goToScene('main');
  assert.deepEqual(restored.state.qualities.S.cabinet, Q.S.cabinet, 'a save and load changes nothing');
});

// Decision 5A: Moraczewski of the Piłsudski wing is welcome to the clubs friendly to Piłsudski and unwelcome to the hostile ones;
// on appointment his faction grows stronger. Czapiński needs a left of 30%.
test('Premier z frakcji 0.71: Moraczewski adds +5 with Wyzwolenie, Piast and NPR before V 1923; his faction grows on appointment', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  november(engine, LEFT_SEJM_ROWS);
  for (const [id, value] of Object.entries({ npr: 60, psl_piast: 60 })) PolishGovernment.changeRelation(Q, id, value - Q.S.actors.relations[id], 'fixture');
  strongLeft(engine);
  choose(engine, 'polish_cabinet_formation');
  choose(engine, 'polish_cabinet_formation.variants');
  choose(engine, 'polish_cabinet_formation.var_centre_left');
  assert.match(JSON.stringify(choice(engine, 'polish_cabinet_formation.cand_moraczewski').subtitle), /welcome to the clubs friendly to Piłsudski/);
  assert.equal(choice(engine, 'polish_cabinet_formation.cand_thugutt').canChoose, true, 'Thugutt may lead the centre-left');
  choose(engine, 'polish_cabinet_formation.cand_moraczewski');
  choose(engine, 'polish_cabinet_formation.ports_next');
  assert.match(content(engine), /<summary>PSL Piast — agrees · \d+\/60<\/summary>[^<]* · the premier of PPS \+5/);
  assert.match(content(engine), /<summary>PSL Wyzwolenie — agrees · \d+\/60<\/summary>[^<]* · the premier of PPS \+5/);
  const offer = PolishGovernment.buildCabinetOffer(Q, Q.S.negotiation.draft, Q.S.negotiation.context);
  assert.deepEqual(['psl_wyzwolenie', 'psl_piast', 'npr', 'pschd', 'zln'].map(id => PolishGovernment.premierPart(id, offer)), [5, 5, 5, -5, -5]);
  const before = clone(Q.S.actors.pps.factions);
  choose(engine, 'polish_cabinet_formation.submit');
  assert.equal(Q.S.cabinet.pm, 'moraczewski');
  assert.ok(Q.S.actors.pps.factions.pilsudczycy.strength > before.pilsudczycy.strength);
  assert.deepEqual(['centrum', 'lewica'].map(id => Q.S.actors.pps.factions[id].dissent - before[id].dissent), [3, 3]);
  assert.equal(Q.S.actors.pps.reactions.filter(r => r.kind === 'premier_faction').length, 3, 'one reaction per faction, with its cause');
});

test('the own initiative in a crisis: the Parliament deck, the same refused offer blocked, 1 T on submit, closing free', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  november(engine, NO_PARTNERS);
  const failed = dendry.formCabinet(engine, {});
  assert.equal(failed.appointed, null);
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'main');
  assert.equal(Q.S.cabinet_crisis.status, 'open');
  assert.equal(Q.polish_parliament_actions_available, true, 'the Parliament deck shows the card');
  assert.equal(PolishGovernment.formationVisible(Q), true);
  playFromHand(engine, 'polish_cabinet_formation');
  assert.equal(Q.S.negotiation.cost_t, 1);
  assert.match(content(engine), /PPS can make its own offer; submitting it spends this month’s action/);
  choose(engine, 'polish_cabinet_formation.variants');
  choose(engine, 'polish_cabinet_formation.var_expert');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation.summary', 'one candidate of the period: no page of the prime minister');
  assert.equal(choice(engine, 'polish_cabinet_formation.submit').canChoose, false);
  assert.match(JSON.stringify(choice(engine, 'polish_cabinet_formation.submit').subtitle), /same offer was refused/);
  choose(engine, 'easy_discard');
  assert.deepEqual([Q.time, Q.month_actions], [11, 0], 'closing the card costs nothing');
  assert.ok(engine.state.currentHands.main.some(card => card.id === 'polish_cabinet_formation'), 'back in the hand');
  playFromHand(engine, 'polish_cabinet_formation');
  // Z — 0.71: Nowak is the only non-party candidate of November 1922, so the other offer is PPS in opposition.
  choose(engine, 'polish_cabinet_formation.variants');
  choose(engine, 'polish_cabinet_formation.var_opposition');
  choose(engine, 'polish_cabinet_formation.submit');
  assert.equal(Q.month_actions, 1, 'the initiative spends the month when the offer is submitted');
  assert.equal(Q.S.turn.pending.action_id, 'parliament.cabinet_formation');
  assert.equal(Q.S.cabinet_crisis.failed_proposals, 2);
  choose(engine, 'polish_cabinet_formation.done');
  assert.equal(Q.time, 12, 'one month settled');
  assert.equal(Q.S.history.months.at(-1).action_id, 'parliament.cabinet_formation');
});

test('a due mandatory formation is routed before events, cannot be closed and costs no month', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  // Fixture for a real fall (the fall itself comes with the government-support card): an open
  // crisis without any attempt yet makes the formation mandatory (8.7).
  PolishGovernment.openCrisis(Q, 'cabinet_fall', Q.S.cabinet.id);
  Q.S.cabinet.status = 'caretaker';
  engine.goToScene('post_event');
  assert.equal(Q.pl_route, 'cabinet');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation');
  assert.equal(Q.S.negotiation.mandatory, true);
  assert.equal(choice(engine, 'easy_discard'), undefined);
  assert.match(content(engine), /The cabinet of Antoni Ponikowski has fallen and governs as caretaker until a new one is appointed\./);
  engine.goToScene('main');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation', 'main routes to it as well');
  choose(engine, 'polish_cabinet_formation.variants');
  assert.equal(choice(engine, 'polish_cabinet_formation.back_intro').canChoose, true);
  assert.equal(choice(engine, 'easy_discard'), undefined, 'no Close on any step');
  choose(engine, 'polish_cabinet_formation.back_intro');
  dendry.formCabinet(engine, {});
  assert.equal(engine.state.sceneId, 'main');
  assert.deepEqual([Q.time, Q.month_actions], [1, 0]);
  assert.equal(Q.S.cabinet_crisis, null, 'the crisis is resolved by the appointment');
  assert.notEqual(Q.S.cabinet.id, 'ponikowski_1');
  assert.equal(Q.S.agreements.opening_toleration.status, 'expired');
  assert.equal(Q.S.history.cabinets.at(-1).id, 'ponikowski_1');
});

test('Starszy gabinet: a save from before the nine portfolios stops; Labour and Public Works are neither merged nor doubled', () => {
  const saved = clone(dendry.startGame().getExportableState());
  saved.qualities.S.meta.schema_version = 3;
  for (const key of ['actors', 'agreements', 'cabinet', 'negotiation', 'cabinet_crisis']) delete saved.qualities.S[key];
  saved.qualities.labor_minister_party = 'pps';
  saved.qualities.public_works_minister_party = 'npr';
  const restored = dendry.restoreState(saved);
  restored.goToScene('main');
  assert.equal(restored.state.sceneId, 'polish_incompatible_save', 'schema 4 needs a new game (versioned plan)');
  const R = restored.state.qualities;
  assert.deepEqual([R.labor_minister_party, R.public_works_minister_party], ['pps', 'npr'], 'no silent merge');
  assert.equal(R.S.cabinet, undefined, 'no cabinet invented from the old fields');
});

test('Status and Library show the prime minister, support and the nine portfolios from the cabinet record', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  november(engine, LEFT_SEJM_ROWS);
  strongLeft(engine);
  dendry.formCabinet(engine, { configuration: 'left_minority', mode: 'member' });
  choose(engine, 'root');
  engine.goToScene('status');
  const status = content(engine);
  assert.match(status, /PPS position:["\]}, ]+In the cabinet: Labour/);
  assert.match(status, /Julian Nowak \(non-party\) — PPS and PSL Wyzwolenie/);
  assert.match(status, /MPs declared for the cabinet \(minority\)/);
  assert.doesNotMatch(status, /Coalition dissent|Government formation pending/);
  engine.goToScene('backSpecialScene');
  engine.goToScene('library');
  choose(engine, 'library.curr_gov');
  const cabinet = content(engine);
  assert.match(cabinet, /nine stable Polish gameplay categories/);
  assert.match(cabinet, /Praca i Opieka Społeczna \(Labour\): ","PPS/);
  assert.match(cabinet, /Rolnictwo i Dobra Państwowe \(Agriculture\): ","PSL Wyzwolenie/);
  assert.equal((cabinet.match(/: ","non-party expert/g) || []).length, 7);
  assert.doesNotMatch(cabinet, /Public Works \/ Communications|Coalition dissent/);
  assert.equal(Q.time, 11);
});

// ---- Part 3c: agreements, the government-support card, electoral lists (7.6, 7.7; 9.1–9.4, 9.8) ----

function condition(engine, id, field = 'viewIf') {
  return engine._runPredicate(engine.game.scenes[id][field], true);
}
// A centre-left cabinet with PPS formed in January 1922 through the mandatory formation after a
// fixture crisis (the fall itself is tested below). NPR receives Labour, PPS Industry and Trade.
function centreLeft(engine, relations = { psl_piast: 60, npr: 60 }) {
  const Q = engine.state.qualities;
  for (const [id, value] of Object.entries(relations)) PolishGovernment.changeRelation(Q, id, value - Q.S.actors.relations[id], 'fixture');
  PolishGovernment.openCrisis(Q, 'cabinet_fall', Q.S.cabinet.id);
  Q.S.cabinet.status = 'caretaker';
  engine.goToScene('post_event');
  // Z — 0.71: Thugutt leads the centre-left (his broad mission), as the tests of this fixture assume.
  const result = dendry.formCabinet(engine, { configuration: 'centre_left', mode: 'member', candidate: 'thugutt', claim: ['economic'] });
  assert.equal(result.appointed.configuration_id, 'centre_left');
  assert.equal(engine.state.sceneId, 'main');
  return Q;
}
function spendMonth(engine) {
  engine.state.currentHands.main = [{ id: 'campaigning', title: 'Campaigning' }];
  engine.playCard('campaigning');
  choose(engine, 'campaigning.workers');
  choose(engine, 'root');
}
function agreementOf(Q, party) {
  return Q.S.agreements[Q.S.cabinet.agreement_ids.find(id => Q.S.agreements[id].parties.includes(party) && Q.S.agreements[id].parties.includes('pps'))];
}

test('Utrzymanie poparcia tylko w kryzysie: no Keep option outside a crisis; after an ultimatum, Keep for 0 T, once', () => {
  const engine = dendry.startGame();
  const Q = centreLeft(engine);
  // Z — 0.56: half a year after the formation, or at once after an act of the cabinet against PPS. Z — 0.64: PPS sits in the
  // cabinet, so this is the coalition card of the Government deck, not the support card.
  assert.equal(PolishGovernment.coalitionCardAvailable(Q), false, 'not in the first half-year of the cabinet');
  Q.S.cabinet.formed_at = Q.time - 6;
  assert.equal(PolishGovernment.coalitionCardAvailable(Q), true, 'PPS sits in the cabinet, half a year later');
  assert.equal(PolishGovernment.supportCardAvailable(Q), false, 'the support card is for a toleration only');
  playFromHand(engine, 'polish_coalition_affairs');
  assert.deepEqual(ids(engine).sort(), ['easy_discard', 'polish_coalition_affairs.concession', 'polish_government_support.bargain',
    'polish_government_support.persuade', 'polish_government_support.withdraw']);
  choose(engine, 'easy_discard');
  assert.deepEqual([Q.time, Q.month_actions], [1, 0], 'closing is free');
  // A partner's ultimatum: a test promise owed to NPR is overdue. The premier's own party (here PSL
  // Wyzwolenie, Thugutt) sets no ultimatum to its own cabinet. Since stage 4 the cabinet executes a
  // promise of a project in its own portfolios itself, so the test promise names no project.
  assert.equal(Q.S.cabinet.pm, 'thugutt');
  const agreement = agreementOf(Q, 'npr');
  PolishGovernment.addObligation(Q, agreement.id, { ...PolishGovernment.TEST_PROGRAMME, required_project: null, portfolio: null,
    months: 0, beneficiaries: ['npr'] });
  agreement.tension = 50;
  spendMonth(engine);
  assert.equal(Q.time, 2);
  assert.equal(agreement.ultimatum.status, 'open');
  // Z — 0.74 (decision 3A of 8 X 2026): the 0 T answer is an urgent card in the hand of the Government deck (PPS sits in the
  // cabinet), with the month before the ultimatum expires as its last month.
  assert.ok(dendry.urgentCards(engine).includes('polish_government_response'), 'the urgent 0 T answer');
  assert.equal(dendry.urgentDeck(engine, 'polish_government_response'), 'main.govt');
  assert.equal(PolishRules.cardDeadline(Q, 'polish_government_response'), agreement.ultimatum.due_at - 1);
  assert.equal(PolishRules.discardStatus(Q, engine.state, 'polish_government_response').available, false, 'an urgent card cannot be discarded');
  assert.match(content(engine), /Ultimatum from NPR/);
  const restored = dendry.saveAndRestore(engine);
  restored.goToScene('main');
  const R = restored.state.qualities;
  restored.playCard('polish_government_response');
  assert.match(content(restored), /An ultimatum from/);
  assert.equal(choice(restored, 'polish_government_support.maintain').canChoose, true);
  choose(restored, 'polish_government_support.maintain');
  choose(restored, 'root');
  assert.deepEqual([R.time, R.month_actions], [2, 0], 'the answer costs no month');
  assert.equal(PolishGovernment.responseCase(R), null, 'one answer per case');
  assert.equal(R.S.agreements[agreement.id].ultimatum.status, 'open', 'keeping support removes no breach');
  assert.ok(!dendry.urgentCards(restored).includes('polish_government_response'), 'answered: the card leaves the hand');
});

// Z — 0.77 (decision 5A of 8 X 2026): the card of a warning says what happened, what is at stake and how to put it right, with the
// numbers of the game; it offers only the answers that fit (no demand of worker protection), lists the conditions of the
// extension with their present values and no longer repeats the notice of the main page.
test('Odpowiedź partnerowi 0.77: a warning says what happened, what is at stake and how to put it right; only fitting answers', () => {
  const engine = dendry.startGame();
  const Q = centreLeft(engine);
  const agreement = agreementOf(Q, 'npr');
  PolishGovernment.addObligation(Q, agreement.id, { ...PolishGovernment.TEST_PROGRAMME, required_project: null, portfolio: null,
    months: 0, beneficiaries: ['npr'] });
  agreement.tension = 30;
  spendMonth(engine);
  assert.equal(PolishGovernment.responseCase(Q).kind, 'warning');
  assert.equal(Math.round(agreement.tension), 46);
  engine.playCard('polish_government_response');
  const text = content(engine);
  assert.match(text, /<strong>What happened\.<\/strong> NPR reminds us of a promise of our agreement: financed protection for the unemployed in full by \w+ 1922\. The date has passed/);
  assert.match(text, /<strong>What is at stake\.<\/strong> Tension in the agreement: 46 of 100; it rises by 16 at each settlement/);
  assert.match(text, /At 60 NPR sets an ultimatum — at this pace at the start of \w+ 1922; two months later it leaves the cabinet with its ministers\./);
  assert.match(text, /The cabinet would lose \d+ MPs and keep \d+ of 444 \(a majority is 223/);
  assert.match(text, /<strong>How to put it right\.<\/strong> Or ask the partner for three more months/);
  assert.doesNotMatch(text, /a promise of the agreement is overdue/, 'the notice of the main page is not repeated');
  assert.deepEqual(ids(engine).sort(), ['polish_government_response.later', 'polish_government_support.extension',
    'polish_government_support.maintain', 'polish_government_support.withdraw'], 'no demand of worker protection in a warning');
  assert.match(JSON.stringify(choice(engine, 'polish_government_support.extension')),
    /Conditions: relation with the partner at least 50 \(now \d+\) [✓✗]; at least half of the promises met \(now 0%\) ✗/);
  // A promise with a project names its card, the ministry and who holds it.
  const schools = PolishGovernment.addObligation(Q, agreement.id, { id: 'schools', topic: 'school_rights', required_project: 'minority_schools',
    required_variants: ['own_language', 'agreed_bilingual'], required_stage: 'operating', portfolio: 'education', weight: 2, months: 0,
    beneficiaries: ['npr'] });
  schools.due_at = Q.time - 1;
  const holder = PolishGovernment.describeParty(Q.S.cabinet.portfolios.education);
  const remedy = PolishProjects.responseRemedy(Q, id => (engine.game.scenes[id] || {}).title);
  assert.ok(remedy.includes('The Education ministry is held by ' + (Q.S.cabinet.portfolios.education === 'expert' ? 'a non-party expert' : holder) +
    ', so it is that ministry’s task, not ours'), remedy);
  assert.ok(remedy.includes('The project must be prepared with the card “Language Rights and Minority Schools” (the Education ministry, variant: ' +
    'teaching in the own language or agreed bilingualism), then launched with the card “Prepared Reforms”.'), remedy);
  PolishRules.setLanguage('pl');
  try {
    assert.match(PolishGovernment.responseBrief(Q).what, /^<strong>Co się stało\.<\/strong> NPR przypomina obietnicę z naszego porozumienia: .*prawa językowe i szkoły mniejszości do \w+ 1922\. Termin minął/);
    assert.match(PolishGovernment.responseBrief(Q).risk, /Napięcie w porozumieniu: 46 na 100; rośnie o 20 przy każdym rozliczeniu/);
  } finally {
    PolishRules.setLanguage('en');
  }
  choose(engine, 'polish_government_response.later');
});

test('Poparcie gabinetu: a refused threat, then carrying it out and the vote; one offer, no counter-proposal', () => {
  const engine = dendry.startGame();
  const Q = centreLeft(engine);
  PolishGovernment.changeRelation(Q, 'npr', -40, 'fixture'); // NPR will refuse the demand
  // Z — 0.64: PPS sits in the cabinet, so the demand is an ultimatum in the Council of Ministers on the coalition card.
  playFromHand(engine, 'polish_coalition_affairs');
  assert.match(JSON.stringify(choice(engine, 'polish_government_support.bargain').title), /Put financed worker protection to the Council of Ministers, or we leave the cabinet/);
  choose(engine, 'polish_government_support.bargain');
  assert.equal(engine.state.sceneId, 'polish_government_support.threat');
  assert.match(content(engine), /Our coalition partners refuse/);
  assert.match(content(engine), /NPR: refuses/);
  assert.match(JSON.stringify(choice(engine, 'polish_government_support.carry_out').title), /Carry out the threat: leave the cabinet/);
  assert.deepEqual(ids(engine).sort(), ['polish_government_support.back_down', 'polish_government_support.carry_out'], 'no C2 counter-proposal');
  assert.equal(Q.S.history.negotiations.filter(n => n.kind === 'support').length, 1, 'one offer, one answer');
  choose(engine, 'polish_government_support.carry_out');
  assert.equal(engine.state.sceneId, 'polish_government_support.motion');
  assert.match(content(engine), /We have left the cabinet/);
  assert.equal(Q.S.cabinet.pps_mode, 'opposition');
  assert.ok(!Q.S.cabinet.partner_ids.includes('pps'));
  assert.equal(Q.S.cabinet.portfolios.economic, 'expert', 'PPS ministries pass to non-party experts');
  choose(engine, 'polish_government_support.own_motion_support');
  assert.equal(engine.state.sceneId, 'polish_government_support.vote_result');
  const ballot = Q.S.ballots.at(-1);
  assert.equal(ballot.club_votes.pps.vote, 'yes');
  assert.equal(ballot.club_votes.psl_piast.vote, 'no', 'bound partners vote against');
  assert.equal(ballot.result, ballot.yes > ballot.no ? 'passed' : 'failed', 'the real votes decide');
  assert.equal(Q.S.cabinet.status, ballot.result === 'passed' ? 'caretaker' : 'active');
  assert.match(content(engine), /Motion to dismiss the cabinet: \d+ for/);
  choose(engine, 'root');
  assert.equal(Q.time, 2, 'the whole sequence spent one month');
});

test('C7, C8 and the legal calendar: toppling the opening cabinet opens a new formation, never an early election', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const next = clone(Q.S.parliament.next_election);
  playFromHand(engine, 'polish_government_support');
  assert.match(content(engine), /PPS position: ","External toleration of Ponikowski/);
  choose(engine, 'polish_government_support.withdraw');
  assert.equal(engine.state.sceneId, 'polish_government_support.motion');
  assert.equal(Q.S.agreements.opening_toleration.status, 'withdrawn');
  assert.match(content(engine), /0 MPs declared for the cabinet \(minority\)/, 'the recount is shown (9.4)');
  choose(engine, 'polish_government_support.own_motion_support');
  const ballot = Q.S.ballots.at(-1);
  assert.deepEqual([ballot.yes, ballot.no, ballot.result], [35, 0, 'passed'], 'nobody else is bound to Ponikowski');
  assert.equal(Q.S.cabinet.status, 'caretaker');
  assert.equal(Q.S.cabinet_crisis.reason, 'cabinet_fall');
  choose(engine, 'root');
  // The next month begins with the mandatory formation: no early-election scene (C8), same date.
  assert.equal(Q.time, 2);
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation');
  assert.equal(Q.S.negotiation.mandatory, true);
  assert.deepEqual(Q.S.parliament.next_election, next);
  assert.equal(Q.sejm_election_due, false);
  // Ponikowski is not proposed again after his fall, even while his cabinet is caretaker (decision 3).
  assert.equal(PolishGovernment.candidateStatus(Q, 'ponikowski', { configuration_id: 'expert' }).available, false);
  assert.notEqual(Q.S.negotiation.draft.candidate_id, 'ponikowski');
  const formed = dendry.formCabinet(engine, {});
  assert.equal(engine.state.sceneId, 'main');
  assert.ok(formed.appointed, 'a successor is appointed');
  assert.notEqual(formed.appointed.candidate_id, 'ponikowski');
  assert.equal(Q.S.cabinet_crisis, null);
  assert.ok(Q.S.history.cabinets.some(c => c.id === 'ponikowski_1' && c.end_reason === 'fall'));
  assert.deepEqual(Q.S.parliament.next_election, next, 'still the November 1922 election');
});

test('C2/C3 and Skład porozumienia: one evaluation of a list, a refusal keeps the PPS list; an agreed list keeps separate clubs', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.year = 1922; Q.month = 10; Q.time = 10;
  PolishGovernment.changeRelation(Q, 'npr', 75 - Q.S.actors.relations.npr, 'fixture');
  // PPS broke six promises to NPR before: the breach penalty of 8.3 (−30) makes NPR refuse.
  Q.S.agreements.old_npr = { id: 'old_npr', kind: 'support', parties: ['pps', 'npr'], status: 'breached', history: [],
    obligations: [1, 2, 3, 4, 5, 6].map(i => ({ id: `old_npr:${i}`, owner: 'pps', status: 'breached', weight: 1 })) };
  engine.goToScene('main');
  // Z — 0.57: the joint list is an event in the list window, not a card; it offers no peasant bloc and costs no action.
  assert.equal(PolishGovernment.listEventDue(Q), true, 'the list window of October 1922');
  engine.goToScene('polish_list_agreement');
  assert.deepEqual(ids(engine), ['polish_list_agreement.left_peasant', 'polish_list_agreement.labour', 'polish_list_agreement.centrolew_early',
    'polish_list_agreement.alone']);
  assert.equal(choice(engine, 'polish_list_agreement.centrolew_early').canChoose, false);
  choose(engine, 'polish_list_agreement.labour');
  assert.equal(engine.state.sceneId, 'polish_list_agreement.result');
  assert.match(content(engine), /NPR: refuses/);
  assert.deepEqual(ids(engine), ['root'], 'no counter-proposal and no menu of list conditions');
  assert.deepEqual(Q.S.parliament.alliances, [], 'the PPS list stands alone');
  assert.equal(Q.month_actions, 0, 'a proposal costs no action');
  assert.equal(PolishGovernment.listEventDue(Q), false, 'the last month of the window: the question does not return');
  const restored = dendry.saveAndRestore(engine);
  const R = restored.state.qualities;
  R.S.turn.pending = null; R.month_actions = 0;
  assert.match(PolishGovernment.listStatus(R, 'labour').reason, /same proposal was refused/);
  // Once the old promises are settled, NPR accepts; after the election it has its own club.
  delete R.S.agreements.old_npr;
  const accepted = PolishGovernment.proposeList(R, 'labour');
  assert.equal(accepted.accepted, true);
  R.S.turn.pending = null; R.month_actions = 0; R.time = 11; R.month = 11;
  PolishGovernment.changeRelation(R, 'psl_piast', 60 - R.S.actors.relations.psl_piast, 'fixture');
  restored.goToScene('post_event');
  choose(restored, 'sejm_election.calculate');
  const result = R.sejm_results.at(-1);
  assert.ok(result.lists.some(list => list.id === 'labour_first_election_1922'));
  assert.ok(R.S.parliament.clubs.some(club => club.id === 'npr' && club.seats > 0), 'NPR keeps its own club');
  assert.match(content(restored), /Joint lists at this election/);
  // No automatic coalition: PPS still makes its offer; minorities support from outside, without portfolios.
  choose(restored, 'polish_cabinet_formation');
  assert.notEqual(R.S.negotiation.draft.configuration_id, 'labour');
  const formed = dendry.formCabinet(restored, { configuration: 'centre_left', mode: 'member', minorities: true, claim: ['economic'] });
  assert.equal(formed.appointed.configuration_id, 'centre_left');
  assert.deepEqual([...R.S.cabinet.supporter_ids].sort(), ['jewish_rep', 'other_minorities_rep']);
  assert.ok(Object.values(R.S.cabinet.portfolios).every(owner => ['pps', 'psl_wyzwolenie', 'psl_piast', 'npr', 'expert'].includes(owner)),
    'minorities receive no portfolio');
  assert.equal(R.S.cabinet.portfolios.labor, 'npr');
});

// Z — 0.57 (items 7 and 8 of the play notes of 5 X 2026, "an event before the election"): the question of a joint list
// comes from the queue in the first month of the list window, with higher gates and the answer "we go alone"; the peasant
// bloc without PPS is no longer offered. After a refusal it returns once in the last month of the window, if a list is
// still possible; going alone closes it for the election. No answer costs an action. Z — 0.58: every gate is 75.
test('Wspólna lista jako wydarzenie (Z — 0.57, 0.58): asked two months before the vote; gates of 75; after a refusal once more; going alone closes it', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const G = PolishGovernment;
  assert.deepEqual(G.LIST_ORDER, ['left_peasant', 'labour', 'centrolew_early'], 'no peasant bloc without PPS');
  assert.deepEqual(G.LIST_ORDER.map(id => G.LIST_OPTIONS[id].gates.map(g => g.min)), [[75], [75], [75, 75, 75]]);
  assert.equal(G.listEventDue(Q), false, 'not in January 1922');
  assert.match(G.electionReminder(Object.assign(Object.create(Q), { time: 8 })), /two months before the vote it decides on a joint list/);
  Q.year = 1922; Q.month = 9; Q.time = 9;
  G.changeRelation(Q, 'psl_wyzwolenie', 75 - Q.S.actors.relations.psl_wyzwolenie, 'fixture');
  G.changeRelation(Q, 'npr', 74 - Q.S.actors.relations.npr, 'fixture');
  assert.equal(G.listEventDue(Q), true, 'September 1922: the first month of the window');
  assert.equal(PolishRules.nextEvent(Q, ['polish_list_agreement']), 'polish_list_agreement');
  assert.equal(Q.S.events.active.instance_key, 'polish_list_agreement:' + Q.S.parliament.next_election.id + ':9', 'one instance per election and month');
  engine.goToScene('polish_list_agreement');
  assert.match(content(engine).replace(/","/g, ''), /The Sejm election is held on 5 November 1922/);
  assert.deepEqual(ids(engine), ['polish_list_agreement.left_peasant', 'polish_list_agreement.labour', 'polish_list_agreement.centrolew_early',
    'polish_list_agreement.alone']);
  assert.equal(choice(engine, 'polish_list_agreement.labour').canChoose, false, 'NPR needs 75');
  assert.match(JSON.stringify(choice(engine, 'polish_list_agreement.labour').subtitle), /Relation with NPR is below 75/);
  // PSL Wyzwolenie refuses: PPS broke six promises to it before (the breach penalty of 8.3).
  Q.S.agreements.old_wyz = { id: 'old_wyz', kind: 'support', parties: ['pps', 'psl_wyzwolenie'], status: 'breached', history: [],
    obligations: [1, 2, 3, 4, 5, 6].map(i => ({ id: `old_wyz:${i}`, owner: 'pps', status: 'breached', weight: 1 })) };
  G.changeRelation(Q, 'npr', 1, 'fixture');
  choose(engine, 'polish_list_agreement.left_peasant');
  assert.match(content(engine), /No joint list/);
  assert.match(content(engine), /Before the lists close next month, PPS can propose another joint list/, 'NPR is possible now');
  assert.equal(Q.month_actions, 0, 'a proposal costs no action');
  assert.equal(G.listEventDue(Q), false, 'one question a month');
  // October 1922: the question returns once; the refused list is closed while nothing has changed.
  Q.month = 10; Q.time = 10;
  assert.equal(G.listEventDue(Q), true);
  engine.goToScene('polish_list_agreement');
  assert.match(JSON.stringify(choice(engine, 'polish_list_agreement.left_peasant').subtitle), /same proposal was refused/);
  choose(engine, 'polish_list_agreement.alone');
  assert.equal(engine.state.sceneId, 'polish_list_agreement.alone_result');
  assert.match(content(engine), /PPS goes to the election alone/);
  assert.deepEqual([Q.S.parliament.alliances, Q.month_actions, G.listEventDue(Q)], [[], 0, false], 'going alone closes the question');
  assert.match(G.electionReminder(Q), /PPS stands on its own list\.$/);
});

test('leak 2: the German coalition counter and votes of no confidence have no effect in the Polish game', () => {
  const engine = dendry.startGame();
  const Q = centreLeft(engine);
  Q.coalition_dissent = 10;
  Q.kpd_coalition_dissent = 10;
  Q.in_weimar_coalition = 1;
  assert.equal(condition(engine, 'coalition_affairs'), false);
  for (const id of ['vote_of_no_confidence', 'kpd_vote_of_no_confidence']) {
    const due = engine._compileChoices(engine.game.scenes['post_event.events_choice']).map(c => c.id);
    assert.equal(PolishRules.nextEvent(Q, due.filter(e => e === id)), null, `${id} is never routed`);
  }
  engine.goToScene('main');
  assert.equal(Q.coalition_dissent, 0, 'the mirror is rewritten from the cabinet record');
  assert.equal(Q.S.cabinet.configuration_id, 'centre_left', 'the cabinet stands');
  // Daszyński's action works on agreement tension, never on the old counter.
  agreementOf(Q, 'npr').tension = 12;
  assert.equal(PolishGovernment.brokerStatus(Q).mode, 'tension');
});

test('save and load in the middle of the formation keeps the offer; the restored game submits it once', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  november(engine, LEFT_SEJM_ROWS);
  PolishGovernment.changeRelation(Q, 'npr', 60 - Q.S.actors.relations.npr, 'fixture');
  strongLeft(engine);
  choose(engine, 'polish_cabinet_formation');
  choose(engine, 'polish_cabinet_formation.variants');
  choose(engine, 'polish_cabinet_formation.var_left_labour');
  choose(engine, 'polish_cabinet_formation.cand_daszynski');
  choose(engine, 'polish_cabinet_formation.ports_next');
  choose(engine, 'polish_cabinet_formation.minorities_on');
  const draft = clone(Q.S.negotiation.draft);
  const restored = dendry.saveAndRestore(engine);
  const R = restored.state.qualities;
  assert.equal(restored.state.sceneId, 'polish_cabinet_formation.summary');
  assert.deepEqual(R.S.negotiation.draft, draft);
  choose(restored, 'polish_cabinet_formation.submit');
  choose(restored, 'polish_cabinet_formation.done');
  assert.equal(R.S.cabinet.pm, 'daszynski');
  assert.equal(R.S.history.negotiations.filter(n => n.kind === 'cabinet').length, 1);
  assert.equal(R.sejm_pending.phase, 'complete');
  assert.equal(Q.S.negotiation.phase, 'draft', 'the saved game is independent');
});

// Z — 0.56 (item 7 of 5 X 2026): card 7.6 comes back half a year after the formation or its last ordinary use, and at once
// for two months when the cabinet acts against PPS: a package with an instrument PPS opposes, or a breach of our agreement.
// Z — 0.64 (decisions 1A–3A of 7 X 2026): two cards instead of one — "Support for the Government" in the Parliament deck
// while PPS tolerates the cabinet, and "Coalition Affairs" in the Government deck while PPS sits in it, with the options
// worded for a coalition and the concession to the partners.
test('Sprawy koalicji 0.64: a member gets the coalition card with the concession; a toleration keeps the support card', () => {
  const engine = dendry.startGame();
  const tolerated = engine.state.qualities;
  assert.equal(PolishGovernment.ppsStance(tolerated.S), 'supporter');
  tolerated.S.cabinet.formed_at = tolerated.time - 6;
  assert.deepEqual([PolishGovernment.supportCardAvailable(tolerated), PolishGovernment.coalitionCardAvailable(tolerated)], [true, false]);
  assert.ok(engine.game.scenes.polish_government_support.tags.includes('parliament_affairs'));
  assert.ok(engine.game.scenes.polish_coalition_affairs.tags.includes('govt_affairs'), 'the coalition card lies in the Government deck');
  const other = dendry.startGame();
  const Q = centreLeft(other);
  Q.S.cabinet.formed_at = Q.time - 6;
  assert.deepEqual([PolishGovernment.supportCardAvailable(Q), PolishGovernment.coalitionCardAvailable(Q)], [false, true]);
  playFromHand(other, 'polish_coalition_affairs');
  assert.match(content(other), /Coalition affairs/);
  assert.match(JSON.stringify(choice(other, 'polish_government_support.withdraw').title), /Leave the cabinet with our ministers/);
  assert.doesNotMatch(JSON.stringify(choice(other, 'polish_government_support.withdraw').title), /End our support/);
  assert.equal(choice(other, 'polish_coalition_affairs.concession').canChoose, false);
  assert.match(JSON.stringify(choice(other, 'polish_coalition_affairs.concession').subtitle), /There is no tension in our coalition agreements/);
  choose(other, 'easy_discard');
  // Tension with NPR 30 and with PSL Wyzwolenie 10: giving way lowers each by 20 (not below 0); the Left of PPS +5.
  agreementOf(Q, 'npr').tension = 30;
  agreementOf(Q, 'psl_wyzwolenie').tension = 10;
  const left = Q.S.actors.pps.factions.lewica.dissent;
  playFromHand(other, 'polish_coalition_affairs');
  assert.match(content(other), /Tension in our agreements \(a warning at 40, an ultimatum at 60\): [^"]*NPR 30/);
  choose(other, 'polish_coalition_affairs.concession');
  assert.equal(other.state.sceneId, 'polish_coalition_affairs.conceded');
  assert.deepEqual([agreementOf(Q, 'npr').tension, agreementOf(Q, 'psl_wyzwolenie').tension], [10, 0]);
  assert.equal(Q.S.actors.pps.factions.lewica.dissent, left + 5);
  assert.equal(Q.month_actions, 1, 'an ordinary use costs the month');
  assert.equal(Q.S.turn.pending.action_id, 'government.coalition_affairs');
  assert.equal(PolishGovernment.coalitionCardAvailable(Q), false, 'the renewal of six months');
  choose(other, 'root');
  assert.equal(Q.time, 2);
});

test('Nasz stosunek do rządu: every six months, and at once after an act of the cabinet against PPS', () => {
  const engine = dendry.startGame();
  const Q = centreLeft(engine);
  // Z — 0.64: PPS is a member, so the rhythm belongs to the coalition card (the support card has the same one).
  assert.equal(PolishGovernment.coalitionCardAvailable(Q), false, 'the first half-year of the cabinet');
  Q.S.economy.pending_package = { id: 'pkg-test', cabinet_id: Q.S.cabinet.id, proposed_at: Q.time, vote_at: Q.time + 1,
    instruments: ['progressive', 'benefit_cut'], status: 'pending' };
  assert.equal(PolishGovernment.coalitionCardAvailable(Q), true, 'a package with a cut of the benefit');
  assert.equal(PolishGovernment.supportReason(Q), 'The cabinet has proposed a package with a cut of the unemployment benefit.');
  playFromHand(engine, 'polish_coalition_affairs');
  assert.match(content(engine), /The cabinet has proposed a package with a cut of the unemployment benefit\./);
  choose(engine, 'polish_government_support.persuade');
  assert.equal(Q.month_actions, 1, 'an ordinary use costs the month');
  assert.equal(Q.S.turn.pending.action_id, 'government.coalition_affairs', 'an action of the Government deck');
  assert.equal(Q.S.cabinet.support_reviewed_at, Q.time);
  assert.equal(PolishGovernment.coalitionCardAvailable(Q), false, 'the act is answered and the review waits six months');
  // A later breach of an obligation of the cabinet opens the card again at once.
  const agreement = agreementOf(Q, 'npr');
  PolishGovernment.addObligation(Q, agreement.id, { ...PolishGovernment.TEST_PROGRAMME, id: 'breach_fixture', required_project: null,
    portfolio: null, months: 0, beneficiaries: ['npr'] });
  const obligation = agreement.obligations[agreement.obligations.length - 1];
  obligation.owner = 'npr'; // the partner's own promise: PPS does not answer for it
  Q.time += 1;
  obligation.status = 'breached';
  obligation.breached_at = Q.time;
  assert.equal(PolishGovernment.supportProvocation(Q).kind, 'breach');
  assert.equal(PolishGovernment.coalitionCardAvailable(Q), true, 'a breach opens the card at once');
  assert.equal(PolishGovernment.supportReason(Q), 'The cabinet has broken an obligation of our agreement.');
  Q.time += 2;
  assert.equal(PolishGovernment.supportProvocation(Q), null, 'an act counts for two months');
  Q.time += 3;
  delete Q.S.cooldowns['support.' + Q.S.cabinet.id];
  assert.equal(PolishGovernment.coalitionCardAvailable(Q), true, 'the half-yearly review');
  assert.match(PolishGovernment.supportReason(Q), /^Half a year has passed/);
});
