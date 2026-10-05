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
// Only PPS, KPP and small lists win seats: no cabinet can be formed (a crisis fixture).
const NO_PARTNERS = { kpp: 60, pps: 20, other: 20 };

test('C1: one screen; every setting is free and returns to it; one commit, then the result; no second menu', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  november(engine, LEFT_SEJM_ROWS);
  choose(engine, 'polish_cabinet_formation');
  const before = { t: Q.time, actions: Q.month_actions, cabinet: clone(Q.S.cabinet), negotiations: Q.S.history.negotiations.length };
  assert.deepEqual(ids(engine).sort(), ['polish_cabinet_formation.candidates', 'polish_cabinet_formation.configurations',
    'polish_cabinet_formation.minorities_on', 'polish_cabinet_formation.modes', 'polish_cabinet_formation.portfolios',
    'polish_cabinet_formation.submit'], 'settings and one submit; the mandatory formation has no Close');
  choose(engine, 'polish_cabinet_formation.configurations');
  assert.equal(choice(engine, 'polish_cabinet_formation.cfg_broad_centre').canChoose, false, 'greyed with its reason');
  assert.match(JSON.stringify(choice(engine, 'polish_cabinet_formation.cfg_broad_centre').subtitle), /real crisis/);
  choose(engine, 'polish_cabinet_formation.cfg_left_minority');
  choose(engine, 'polish_cabinet_formation.minorities_on');
  choose(engine, 'polish_cabinet_formation.candidates');
  choose(engine, 'polish_cabinet_formation.cand_daszynski');
  choose(engine, 'polish_cabinet_formation.portfolios');
  choose(engine, 'polish_cabinet_formation.claim_plus');
  choose(engine, 'polish_cabinet_formation.plus_interior');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation');
  assert.deepEqual(Q.S.negotiation.draft, { configuration_id: 'left_minority', candidate_id: 'daszynski', pps_mode: 'member',
    seek_minority_support: true, portfolio_claim: ['labor', 'interior'] });
  assert.match(content(engine), /Labour, Interior/);
  assert.match(content(engine), /PSL Wyzwolenie \(relation 65\); gate 50 met; wants Agriculture or Interior — offered/);
  assert.deepEqual([Q.time, Q.month_actions, Q.S.history.negotiations.length], [before.t, before.actions, before.negotiations]);
  assert.deepEqual(Q.S.cabinet, before.cabinet, 'nothing is decided before the offer is submitted');
  assert.equal(Q.S.turn.pending, null);
  choose(engine, 'polish_cabinet_formation.submit');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation.result');
  assert.equal(Q.S.history.negotiations.length, before.negotiations + 1, 'one commit');
  assert.deepEqual([Q.time, Q.month_actions], [before.t, before.actions], 'the mandatory formation costs no month');
  assert.match(content(engine), /PSL Wyzwolenie: accepts/);
  assert.match(content(engine), /The head of state appoints ","Ignacy Daszyński/);
  assert.match(content(engine), /A minority cabinet: it has fewer than 223 MPs, but more MPs declared for it than against it/, 'explained (Z — 0.56)');
  assert.equal(Q.S.cabinet.pm, 'daszynski');
  assert.deepEqual(Q.S.cabinet.portfolios.labor, 'pps');
  assert.deepEqual(Q.S.cabinet.portfolios.interior, 'pps');
  assert.deepEqual(Q.S.cabinet.portfolios.agriculture, 'psl_wyzwolenie');
  assert.equal(Q.S.cabinet.appointment_basis, 'naczelnik_panstwa', 'before the constitutional transfer');
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
  assert.equal(choice(engine, 'polish_cabinet_formation.submit').canChoose, false);
  assert.match(JSON.stringify(choice(engine, 'polish_cabinet_formation.submit').subtitle), /same offer was refused/);
  choose(engine, 'easy_discard');
  assert.deepEqual([Q.time, Q.month_actions], [11, 0], 'closing the card costs nothing');
  assert.ok(engine.state.currentHands.main.some(card => card.id === 'polish_cabinet_formation'), 'back in the hand');
  playFromHand(engine, 'polish_cabinet_formation');
  choose(engine, 'polish_cabinet_formation.candidates');
  choose(engine, 'polish_cabinet_formation.cand_sikorski');
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
  engine.goToScene('main');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation', 'main routes to it as well');
  choose(engine, 'polish_cabinet_formation.submit');
  choose(engine, 'polish_cabinet_formation.done');
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
  const result = dendry.formCabinet(engine, { configuration: 'centre_left', mode: 'member', claim: ['economic'] });
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
  // Z — 0.56: half a year after the formation, or at once after an act of the cabinet against PPS.
  assert.equal(PolishGovernment.supportCardAvailable(Q), false, 'not in the first half-year of the cabinet');
  Q.S.cabinet.formed_at = Q.time - 6;
  assert.equal(PolishGovernment.supportCardAvailable(Q), true, 'PPS sits in the cabinet, half a year later');
  playFromHand(engine, 'polish_government_support');
  assert.deepEqual(ids(engine).sort(), ['easy_discard', 'polish_government_support.bargain', 'polish_government_support.persuade',
    'polish_government_support.withdraw']);
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
  assert.ok(ids(engine).includes('polish_government_response'), 'the pinned 0 T answer');
  assert.match(content(engine), /Ultimatum from NPR/);
  const restored = dendry.saveAndRestore(engine);
  restored.goToScene('main');
  const R = restored.state.qualities;
  restored.playPinnedCard('polish_government_response');
  assert.match(content(restored), /An ultimatum from/);
  assert.equal(choice(restored, 'polish_government_support.maintain').canChoose, true);
  choose(restored, 'polish_government_support.maintain');
  choose(restored, 'root');
  assert.deepEqual([R.time, R.month_actions], [2, 0], 'the answer costs no month');
  assert.equal(PolishGovernment.responseCase(R), null, 'one answer per case');
  assert.equal(R.S.agreements[agreement.id].ultimatum.status, 'open', 'keeping support removes no breach');
  assert.ok(!ids(restored).includes('polish_government_response'));
});

test('Poparcie gabinetu: a refused threat, then carrying it out and the vote; one offer, no counter-proposal', () => {
  const engine = dendry.startGame();
  const Q = centreLeft(engine);
  PolishGovernment.changeRelation(Q, 'npr', -40, 'fixture'); // NPR will refuse the demand
  playFromHand(engine, 'polish_government_support');
  choose(engine, 'polish_government_support.bargain');
  assert.equal(engine.state.sceneId, 'polish_government_support.threat');
  assert.match(content(engine), /NPR: refuses/);
  assert.deepEqual(ids(engine).sort(), ['polish_government_support.back_down', 'polish_government_support.carry_out'], 'no C2 counter-proposal');
  assert.equal(Q.S.history.negotiations.filter(n => n.kind === 'support').length, 1, 'one offer, one answer');
  choose(engine, 'polish_government_support.carry_out');
  assert.equal(engine.state.sceneId, 'polish_government_support.motion');
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
  PolishGovernment.changeRelation(Q, 'npr', 70 - Q.S.actors.relations.npr, 'fixture');
  // PPS broke six promises to NPR before: the breach penalty of 8.3 (−30) makes NPR refuse.
  Q.S.agreements.old_npr = { id: 'old_npr', kind: 'support', parties: ['pps', 'npr'], status: 'breached', history: [],
    obligations: [1, 2, 3, 4, 5, 6].map(i => ({ id: `old_npr:${i}`, owner: 'pps', status: 'breached', weight: 1 })) };
  engine.goToScene('main');
  assert.equal(PolishGovernment.listAgreementAvailable(Q), true, 'the list window of October 1922');
  playFromHand(engine, 'polish_list_agreement');
  assert.equal(choice(engine, 'polish_list_agreement.centrolew_early').canChoose, false);
  choose(engine, 'polish_list_agreement.labour');
  assert.equal(engine.state.sceneId, 'polish_list_agreement.result');
  assert.match(content(engine), /NPR: refuses/);
  assert.deepEqual(ids(engine), ['root'], 'no counter-proposal and no menu of list conditions');
  assert.deepEqual(Q.S.parliament.alliances, [], 'the PPS list stands alone');
  assert.equal(Q.month_actions, 1, 'the confirmation spends the month even when refused');
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
  choose(engine, 'polish_cabinet_formation');
  choose(engine, 'polish_cabinet_formation.minorities_on');
  choose(engine, 'polish_cabinet_formation.candidates');
  choose(engine, 'polish_cabinet_formation.cand_daszynski');
  const draft = clone(Q.S.negotiation.draft);
  const restored = dendry.saveAndRestore(engine);
  const R = restored.state.qualities;
  assert.equal(restored.state.sceneId, 'polish_cabinet_formation');
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
test('Nasz stosunek do rządu: every six months, and at once after an act of the cabinet against PPS', () => {
  const engine = dendry.startGame();
  const Q = centreLeft(engine);
  assert.equal(PolishGovernment.supportCardAvailable(Q), false, 'the first half-year of the cabinet');
  Q.S.economy.pending_package = { id: 'pkg-test', cabinet_id: Q.S.cabinet.id, proposed_at: Q.time, vote_at: Q.time + 1,
    instruments: ['progressive', 'benefit_cut'], status: 'pending' };
  assert.equal(PolishGovernment.supportCardAvailable(Q), true, 'a package with a cut of the benefit');
  assert.equal(PolishGovernment.supportReason(Q), 'The cabinet has proposed a package with a cut of the unemployment benefit.');
  playFromHand(engine, 'polish_government_support');
  assert.match(content(engine), /The cabinet has proposed a package with a cut of the unemployment benefit\./);
  choose(engine, 'polish_government_support.persuade');
  assert.equal(Q.month_actions, 1, 'an ordinary use costs the month');
  assert.equal(Q.S.cabinet.support_reviewed_at, Q.time);
  assert.equal(PolishGovernment.supportCardAvailable(Q), false, 'the act is answered and the review waits six months');
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
  assert.equal(PolishGovernment.supportCardAvailable(Q), true, 'a breach opens the card at once');
  assert.equal(PolishGovernment.supportReason(Q), 'The cabinet has broken an obligation of our agreement.');
  Q.time += 2;
  assert.equal(PolishGovernment.supportProvocation(Q), null, 'an act counts for two months');
  Q.time += 3;
  delete Q.S.cooldowns['support.' + Q.S.cabinet.id];
  assert.equal(PolishGovernment.supportCardAvailable(Q), true, 'the half-yearly review');
  assert.match(PolishGovernment.supportReason(Q), /^Half a year has passed/);
});
