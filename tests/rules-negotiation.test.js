const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');

// Unit tests of the government module (implementation plan, stage 3; technical reference 8.1–8.3,
// 5.5, 17.4). They load the source files directly and never start the game.
const rules = require(path.join(__dirname, '..', 'source', 'rules', 'polish_rules.js'));
const inst = require(path.join(__dirname, '..', 'source', 'rules', 'polish_institutions.js'));
const gov = require(path.join(__dirname, '..', 'source', 'rules', 'polish_government.js'));
const close = (a, b, eps = 0.005) => assert.ok(Math.abs(a - b) <= eps, `${a} != ${b}`);
const PARTIES = ['kpp', 'pps', 'npr', 'psl_wyzwolenie', 'psl_piast', 'pschd', 'zln', 'minorities_bloc', 'other'];

// A small game state: the opening parliament and relations of the Polish opening (3.1).
function fixture(overrides = {}) {
  const Q = {
    time: 1, year: 1922, month: 1, month_actions: 0, parties: PARTIES,
    sejm_parliament: { id: 'opening_1922', kind: 'opening_snapshot', total_seats: 444,
      party_seats: { kpp: 2, pps: 35, npr: 22, psl_wyzwolenie: 25, psl_piast: 99, pschd: 27, zln: 83, minorities_bloc: 17, other: 134 } },
    psl_wyzwolenie_relation: 65, minorities_bloc_relation: 50, psl_piast_relation: 45, npr_relation: 50,
    pschd_relation: 30, kpp_relation: 10, zln_relation: 5, ...overrides,
  };
  Q.S = rules.createFoundationState({ randomState: [1922, 1, 2, 3, 4],
    institutions: inst.createInstitutionState(Q), government: gov.createGovernmentState(Q) });
  gov.writeRelationMirrors(Q);
  return Q;
}

test('the new game has one owner of relations, both minority representations at 50 (5.5)', () => {
  const Q = fixture();
  assert.deepEqual(Q.S.actors.relations, { psl_wyzwolenie: 65, psl_piast: 45, npr: 50, pschd: 30, zln: 5, kpp: 10,
    jewish_rep: 50, other_minorities_rep: 50 });
  assert.equal(Q.S.actors.pps.credibility, 50, '17.4: reputation of execution starts at 50');
  assert.equal(Q.S.cabinet.id, 'ponikowski_1');
  assert.equal(Q.S.cabinet.pps_mode, 'external_support');
  assert.deepEqual(Object.keys(Q.S.cabinet.portfolios), [...gov.PORTFOLIOS]);
  assert.equal(Q.S.agreements.opening_toleration.obligations.length, 0, 'a marked toleration without a programme');
  assert.deepEqual(rules.validateState(Q.S), []);
});

test('the minority bloc splits 1/3 and 2/3 by largest remainders; its old field is the weighted average', () => {
  assert.deepEqual(inst.splitMinorities(17), { jewish_rep: 6, other_minorities_rep: 11 });
  assert.deepEqual(inst.splitMinorities(101), { jewish_rep: 34, other_minorities_rep: 67 });
  assert.deepEqual(inst.splitMinorities(102), { jewish_rep: 34, other_minorities_rep: 68 });
  assert.deepEqual(inst.splitMinorities(0), { jewish_rep: 0, other_minorities_rep: 0 });
  const clubs = inst.clubsFromSeats({ pps: 10, minorities_bloc: 17 }, PARTIES);
  assert.deepEqual(clubs.map(c => [c.id, c.electoral_party_id, c.seats]),
    [['pps', 'pps', 10], ['jewish_rep', 'minorities_bloc', 6], ['other_minorities_rep', 'minorities_bloc', 11]]);
  const Q = fixture();
  gov.changeRelation(Q, 'jewish_rep', 4, 'test');
  close(Q.minorities_bloc_relation, (6 * 54 + 11 * 50) / 17);
});

test('inherited writes to the mirror fields are taken over once, and relations stay within 0–100', () => {
  const Q = fixture();
  Q.psl_piast_relation += 3; // e.g. an inherited adviser scene
  Q.minorities_bloc_relation += 4;
  gov.syncRelations(Q);
  assert.equal(Q.S.actors.relations.psl_piast, 48);
  assert.equal(Q.S.actors.relations.jewish_rep, 54);
  assert.equal(Q.S.actors.relations.other_minorities_rep, 54);
  gov.syncRelations(Q);
  assert.equal(Q.S.actors.relations.psl_piast, 48, 'not counted twice');
  Q.zln_relation = -40;
  gov.syncRelations(Q);
  assert.equal(Q.S.actors.relations.zln, 0);
  assert.equal(Q.zln_relation, 0, 'the mirror is rewritten within bounds');
  assert.equal(gov.changeRelation(Q, 'psl_wyzwolenie', 60, 'test'), 100);
});

test('programme fit reads only the topics of the offer; an offer without topics is invalid (8.1)', () => {
  close(gov.programFit('psl_wyzwolenie', { land: 1, fiscal: 1, institution: 2 }), 100 * (1 - 1 / 12));
  close(gov.programFit('npr', { land: 0, fiscal: 0, institution: 1 }), 100 * (1 - 1 / 12));
  assert.equal(gov.programFit('psl_piast', { fiscal: 0 }), 100);
  assert.throws(() => gov.programFit('npr', {}), /at least one programme topic/);
  assert.throws(() => gov.programFit('npr', { weather: 1 }), /unknown topic/);
});

test('Oferta: relation 100 and a crossed red line — refusal; no resources or leverage can buy it', () => {
  const Q = fixture();
  gov.changeRelation(Q, 'psl_piast', 100, 'test');
  const offer = { by: 'pps', members: ['pps', 'psl_piast'], programme: { land: 2, fiscal: 0 }, portfolios: { agriculture: 'psl_piast' } };
  const result = gov.evaluatePartner(Q.S, 'psl_piast', offer, 100);
  assert.equal(result.accept, false);
  assert.deepEqual(result.red_lines, ['land_confiscation']);
  assert.ok(result.score >= 60, 'the score alone would pass');
  assert.match(result.reasons[0], /red line/);
  const ok = gov.evaluatePartner(Q.S, 'psl_piast', { ...offer, programme: { land: 0, fiscal: 0 } }, 100);
  assert.equal(ok.accept, true);
});

test('portfolio fit: a member needs one preferred portfolio; minorities need their terms; none gives 100 (8.3)', () => {
  const member = { by: 'pps', members: ['pps', 'npr'], programme: { fiscal: 0 }, portfolios: { labor: 'pps', economic: 'npr' } };
  assert.equal(gov.portfolioFit('npr', member), 0, 'NPR prefers Labour');
  assert.equal(gov.portfolioFit('npr', { ...member, portfolios: { labor: 'npr' } }), 100);
  assert.equal(gov.portfolioFit('jewish_rep', { members: ['pps'], minority_terms: [] }), 0);
  assert.equal(gov.portfolioFit('jewish_rep', { members: ['pps'], minority_terms: ['language_rights'] }), 100);
  assert.equal(gov.portfolioFit('psl_piast', { members: ['pps'] }), 100, 'an external supporter without demands');
});

test('the offer score follows 8.3: M02 checks of the Grabski offer give 68.17 and 58.44', () => {
  // The premier evaluates a PPS offer of financed protection (fiscal +2) against stabilisation without
  // PPS (fiscal 0); direct relation 50, credibility 50, crisisCooperation 15 (analysis/m02-negotiations).
  const score = ideal => {
    const fit = offer => 100 * (1 - Math.abs(offer - ideal) / 4);
    const base = offer => 0.25 * 50 + 0.35 * fit(offer) + 0.20 * 100 + 0.10 * 50;
    const need = gov.needFor(gov.scaledAlternative(base(0)), 15);
    return base(2) + 0.10 * need;
  };
  close(score(1), 68.17);
  close(score(0), 58.44);
});

test('bargaining adds up to 10 points of need; persuasion none (M11 examples)', () => {
  const Q = fixture();
  const offer = { by: 'pps', members: [], programme: { fiscal: 0 } };
  const base = gov.baseScore(Q.S, 'psl_piast', offer);
  close(gov.offerScore(Q.S, 'psl_piast', offer, 100) - base, 10);
  close(gov.offerScore(Q.S, 'psl_piast', offer, 0), base);
  assert.equal(gov.offerScore(Q.S, 'psl_piast', { ...offer, advisor_bonus: 5 }, 0), Math.min(100, base + 5));
});

test('leverage of 8.2: 35 MPs, reputation 50 and an indispensable role give 74.07; an alternative 14.07', () => {
  close(gov.leverage({ canSucceedWithPPS: true, canSucceedWithoutPPS: false, ppsSeats: 35, chamberSize: 444, credibility: 50 }), 74.07);
  close(gov.leverage({ canSucceedWithPPS: true, canSucceedWithoutPPS: true, ppsSeats: 35, chamberSize: 444, credibility: 50 }), 14.07);
});

test('reputation of execution changes once per ID and stays within 0–100 (17.4)', () => {
  const Q = fixture();
  assert.equal(gov.changeCredibility(Q, 'breach:a', -5, 'breach'), 45);
  assert.equal(gov.changeCredibility(Q, 'breach:a', -5, 'breach'), 45, 'once per ID');
  assert.equal(gov.changeCredibility(Q, 'fulfilled:b', 3, 'fulfilled'), 48);
  for (let i = 0; i < 20; i++) gov.changeCredibility(Q, 'b' + i, -5, 'breach');
  assert.equal(Q.S.actors.pps.credibility, 0);
});

test('talks: one partner, +4 or +2 from 70, 3-month cooldown per partner; KPP only after contact', () => {
  const Q = fixture();
  assert.equal(gov.outreach(Q, 'npr'), 4);
  assert.equal(Q.S.actors.relations.npr, 54);
  assert.equal(Q.S.turn.pending.action_id, 'party.outreach');
  assert.equal(Q.month_actions, 1);
  assert.throws(() => gov.outreach(Q, 'psl_piast'), /still pending|already used/, 'one main action a month');
  Q.S.turn.pending = null; Q.month_actions = 0; Q.time = 2;
  assert.equal(gov.outreachStatus(Q, 'npr').available, false, 'cooldown for this partner');
  assert.match(gov.outreachStatus(Q, 'npr').reason, /2 months/);
  assert.equal(gov.outreachStatus(Q, 'psl_piast').available, true, 'other partners stay open');
  gov.changeRelation(Q, 'psl_piast', 25, 'test');
  assert.equal(gov.outreach(Q, 'psl_piast'), 2, 'from 70 the gain is 2');
  Q.S.turn.pending = null; Q.month_actions = 0; Q.time = 4;
  assert.equal(gov.outreachStatus(Q, 'npr').available, true, 'after three months');
  assert.equal(gov.outreachStatus(Q, 'kpp').available, false);
  assert.equal(gov.kppContactStatus(Q).available, true, 'relation 10 allows the first contact');
  gov.kppContact(Q);
  assert.equal(Q.S.actors.relations.kpp, 14);
  Q.S.turn.pending = null; Q.month_actions = 0;
  assert.equal(gov.outreachStatus(Q, 'kpp').available, false, 'talks from the next month');
  Q.time = 5;
  assert.equal(gov.outreachStatus(Q, 'kpp').available, true);
  const low = fixture({ kpp_relation: 9 });
  assert.equal(gov.kppContactStatus(low).available, false);
});

// ---- Part 3b: portfolios, cabinet offers, the head of state's ranking and the impasse -------------

// A fixture with its own parliament: party seats for the clubs of 5.5 (the minority bloc splits 1/3
// and 2/3) and the time of the formation.
function chamber(partySeats, overrides = {}) {
  return fixture({ sejm_parliament: { id: 'fixture', kind: 'opening_snapshot', total_seats: 444, party_seats: partySeats }, ...overrides });
}
function formation(Q, reason = 'post_election') {
  return gov.beginFormation(Q, { reason, mandatory: reason !== 'initiative' });
}

test('Resorty docelowe: exactly nine unique portfolios; public works is no office and Labour is never doubled (8.5)', () => {
  const Q = fixture();
  assert.equal(gov.PORTFOLIOS.length, 9);
  assert.ok(!gov.PORTFOLIOS.includes('public_works'));
  assert.deepEqual([...gov.PROGRAMME_ONLY_TOPICS], ['public_works'], 'the public works programme still exists');
  const config = gov.CONFIGURATIONS.centre_left;
  for (const claim of [['labor'], ['labor', 'economic'], ['economic'], ['labor', 'labor'], ['public_works'], ['labor', 'public_works']]) {
    const owners = gov.allocatePortfolios(Q.S, config, config.members, claim);
    assert.deepEqual(Object.keys(owners), [...gov.PORTFOLIOS], `one owner per portfolio for ${claim}`);
    assert.equal(Object.values(owners).filter(owner => owner === 'pps').length, claim.filter(k => gov.PORTFOLIOS.includes(k)).filter((k, i, all) => all.indexOf(k) === i).length);
  }
  // Partners take their first free preferred portfolio, the larger club first; the rest are experts.
  const owners = gov.allocatePortfolios(Q.S, config, config.members, ['labor']);
  assert.equal(owners.labor, 'pps');
  assert.equal(owners.agriculture, 'psl_piast', 'PSL Piast (99 MPs) before PSL Wyzwolenie (25)');
  assert.equal(owners.interior, 'psl_wyzwolenie', 'its second preference');
  assert.equal(owners.foreign, 'expert');
  // A PPS majority government holds all nine; the fixed map of Skrzyński's cabinet is kept.
  assert.ok(Object.values(gov.allocatePortfolios(Q.S, gov.CONFIGURATIONS.pps_majority, ['pps'], [])).every(owner => owner === 'pps'));
  const broad = gov.CONFIGURATIONS.skrzynski_broad;
  assert.equal(gov.allocatePortfolios(Q.S, broad, broad.members, ['economic']).economic, 'npr');
});

test('Premier ekspercki: the ranking reads signed support only; no average of an empty list, no investiture', () => {
  // Nobody but PPS and KPP sits in the Sejm: no club can sign support for an expert.
  const empty = chamber({ kpp: 250, pps: 50, other: 144 }, { time: 11, year: 1922, month: 11 });
  formation(empty);
  assert.equal(empty.S.negotiation.draft.configuration_id, 'expert');
  const failed = gov.submitFormation(empty);
  assert.equal(failed.pps_offer.accepted, false);
  assert.match(failed.pps_offer.reason, /no club signs support/);
  assert.equal(failed.appointed, null);
  assert.equal(gov.rankOf(empty, { members: [], candidate_id: 'grabski' }, []), null, 'no average of an empty list');
  // Guarantors sign as external supporters; the cabinet has no party members and needs no 223 votes.
  const Q = chamber({ pps: 60, npr: 60, psl_piast: 60, kpp: 150, other: 114 }, { time: 11, year: 1922, month: 11 });
  formation(Q);
  gov.setDraft(Q, 'candidate_id', 'nowak');
  const result = gov.submitFormation(Q);
  assert.equal(result.pps_offer.accepted, true);
  const signed = result.pps_offer.evaluations.filter(e => e.accept).map(e => e.actor).sort();
  assert.deepEqual(signed, ['npr', 'psl_piast']);
  assert.equal(result.appointed.candidate_id, 'nowak');
  assert.deepEqual(Q.S.cabinet.partner_ids, []);
  assert.deepEqual([...Q.S.cabinet.supporter_ids].sort(), ['npr', 'pps', 'psl_piast']);
  assert.equal(Q.S.cabinet.support_seats, 180);
  assert.equal(Q.S.cabinet.majority, false, 'appointed without a fictional investiture majority');
  assert.ok(Object.values(Q.S.cabinet.portfolios).every(owner => owner === 'expert'));
  // The window candidate gets +8 on the average of the signed scores (8.7).
  const scores = result.pps_offer.evaluations.filter(e => e.accept).map(e => e.score);
  const entry = { members: [], candidate_id: 'nowak' };
  close(gov.rankOf(Q, entry, result.pps_offer.evaluations.filter(e => e.accept)), scores.reduce((a, b) => a + b) / scores.length + 8);
});

test('Gabinet po wyborach: after 1922 the broad and stabilising cabinets stay greyed; the left needs real support', () => {
  const high = { psl_wyzwolenie_relation: 90, psl_piast_relation: 90, npr_relation: 90, pschd_relation: 90, zln_relation: 90, minorities_bloc_relation: 90 };
  const Q = fixture({ time: 11, year: 1922, month: 11, ...high });
  formation(Q);
  for (const id of ['broad_centre', 'skrzynski_broad', 'national_unity']) {
    const status = gov.draftChoiceStatus(Q, 'configuration', id);
    assert.equal(status.available, false, id);
    assert.match(status.reason, /crisis/);
  }
  // Two real falls in six months still do not turn the post-election formation into a crisis (8.8).
  Q.S.history.cabinets.push({ id: 'a', pm: 'a', end_reason: 'fall', ended_at: 9 }, { id: 'b', pm: 'b', end_reason: 'fall', ended_at: 10 });
  assert.equal(gov.draftChoiceStatus(Q, 'configuration', 'broad_centre').available, false);
  assert.equal(gov.configurationStatus(Q, 'broad_centre', { reason: 'crisis' }).available, true, 'a real crisis unlocks it');
  // Z — 0.67 (decision 3A): after the election of 1922 a cabinet with PPS needs 185 MPs of its own clubs, without the
  // minority representations; the 60 MPs of PPS and PSL Wyzwolenie in the opening parliament are far from it, whatever
  // the relations. In a later crisis the threshold does not apply and the forecast of 7A decides.
  assert.equal(gov.POST_ELECTION_OWN_SEATS, 185);
  const normal = fixture({ time: 11, year: 1922, month: 11 });
  formation(normal);
  assert.match(gov.draftChoiceStatus(normal, 'configuration', 'left_minority').reason,
    /After the election of 1922 a cabinet with PPS needs 185 MPs of its own clubs, without the minority representations; this one has 60\./);
  assert.match(gov.draftChoiceStatus(Q, 'configuration', 'left_minority').reason, /needs 185 MPs/, 'relation 90 does not help');
  assert.match(gov.configurationStatus(normal, 'left_minority', { reason: 'crisis' }).reason, /No realistic parliamentary support/);
  const strong = chamber({ pps: 170, psl_wyzwolenie: 60, minorities_bloc: 30, zln: 100, other: 84 }, { time: 11, year: 1922, month: 11 });
  assert.equal(gov.configurationStatus(strong, 'left_minority', { reason: 'post_election' }).available, true);
});

test('Poparcie mniejszości: one segment accepts, the other refuses; appointment needs enough accepted declarations', () => {
  // PPS and PSL Wyzwolenie have 140 MPs, ZLN 214; the minorities (30 Jewish, 60 other) decide.
  const seats = { pps: 100, psl_wyzwolenie: 40, minorities_bloc: 90, zln: 214 };
  const Q = chamber(seats, { time: 11, year: 1922, month: 11 });
  // Z — 0.67: a later cabinet crisis, not the formation after the election of 1922 (which needs 185 MPs of its own clubs).
  formation(Q, 'crisis');
  gov.setDraft(Q, 'configuration_id', 'left_minority');
  assert.equal(gov.draftChoiceStatus(Q, 'configuration', 'left_minority').available, true, 'possible with minority support');
  gov.setDraft(Q, 'seek_minority_support', true);
  const view = gov.formationView(Q);
  assert.equal(view.members_seats, 140);
  assert.equal(view.requested_seats, 230, 'the preview counts the requested support, not a vote');
  // PPS broke an earlier promise to the other minorities; their relation is low.
  gov.changeRelation(Q, 'other_minorities_rep', -50, 'fixture');
  Q.S.agreements.old = { id: 'old', kind: 'support', parties: ['pps', 'other_minorities_rep'], status: 'breached',
    obligations: [{ id: 'old:1', owner: 'pps', status: 'breached' }], history: [] };
  const result = gov.submitFormation(Q);
  const answer = id => result.pps_offer.evaluations.find(e => e.actor === id);
  assert.equal(answer('jewish_rep').accept, true);
  assert.equal(answer('other_minorities_rep').accept, false);
  assert.equal(result.pps_offer.accepted, false);
  assert.match(result.pps_offer.reason, /too few votes/);
  assert.equal(result.pps_offer.forecast.yes, 170, 'only accepted declarations count');
  assert.notEqual(Q.S.cabinet.configuration_id, 'left_minority');
  // With both segments the same offer is appointed; minorities receive no portfolio.
  const ok = chamber(seats, { time: 11, year: 1922, month: 11 });
  formation(ok, 'crisis');
  gov.setDraft(ok, 'configuration_id', 'left_minority');
  gov.setDraft(ok, 'seek_minority_support', true);
  const appointed = gov.submitFormation(ok);
  assert.equal(appointed.appointed.configuration_id, 'left_minority');
  assert.deepEqual([...ok.S.cabinet.supporter_ids].sort(), ['jewish_rep', 'other_minorities_rep']);
  assert.ok(Object.values(ok.S.cabinet.portfolios).every(owner => ['pps', 'psl_wyzwolenie', 'expert'].includes(owner)));
  const terms = Object.values(ok.S.agreements).filter(a => a.parties.includes('jewish_rep'))[0].obligations.map(o => o.topic);
  assert.deepEqual(terms.filter(t => gov.MINORITY_TERMS.includes(t)), [...gov.MINORITY_TERMS]);
  // Stage 4 (decision 3 of stage 4): the programme points name projects, dates and rules; the minority
  // terms are the school project by t+6 and a rule of legal equality.
  const jewish = Object.values(ok.S.agreements).filter(a => a.parties.includes('jewish_rep'))[0];
  const term = topic => jewish.obligations.find(o => o.topic === topic);
  assert.deepEqual([term('school_rights').required_project, term('school_rights').due_at, term('school_rights').portfolio], ['minority_schools', 17, 'education']);
  assert.equal(term('legal_equality').kind, 'constraint');
  const programme = Object.values(ok.S.agreements).filter(a => a.parties.includes('psl_wyzwolenie'))[0].obligations;
  const land = programme.find(o => o.topic === 'land');
  assert.deepEqual([land.required_project, land.required_variants, land.due_at, land.portfolio], ['land_program', ['accelerated'], 17, 'agriculture']);
  assert.deepEqual([programme.find(o => o.topic === 'worker_protection').due_at, programme.find(o => o.topic === 'worker_protection').weight], [15, 2]);
  assert.equal(programme.find(o => o.topic === 'institution').status, 'open', 'a constitutional project has no date');
  assert.equal(programme.find(o => o.topic === 'fiscal').kind, 'constraint');
});

test('Impas and C2: three failed rounds make an impasse; the same refused offer waits for a change; a new candidate returns', () => {
  const Q = chamber({ kpp: 250, pps: 50, other: 144 }, { time: 11, year: 1922, month: 11 });
  formation(Q);
  // Z — 0.71 (decision 4A): in November 1922 Nowak is the one non-party candidate of the period.
  assert.deepEqual([Q.S.negotiation.draft.configuration_id, Q.S.negotiation.draft.candidate_id], ['expert', 'nowak']);
  gov.submitFormation(Q);
  assert.equal(Q.S.cabinet.status, 'caretaker');
  assert.deepEqual([Q.S.cabinet_crisis.status, Q.S.cabinet_crisis.failed_proposals], ['open', 1]);
  assert.equal(gov.formationDue(Q), false, 'not again in the same month');
  // The player's own initiative in the same month: the same offer cannot be submitted again (C2).
  assert.equal(gov.initiativeAvailable(Q), true);
  gov.enterFormation(Q);
  assert.equal(Q.S.negotiation.cost_t, 1);
  assert.match(gov.submitStatus(Q).reason, /same offer was refused/);
  gov.setDraft(Q, 'pps_mode', 'opposition');
  assert.equal(gov.submitStatus(Q).available, true, 'another offer: PPS stays in opposition');
  gov.submitFormation(Q);
  assert.equal(Q.month_actions, 1, 'the initiative spends the month');
  assert.equal(Q.S.cabinet_crisis.failed_proposals, 2);
  Q.S.turn.pending = null; Q.month_actions = 0; Q.time = 12; Q.month = 12;
  assert.equal(gov.formationDue(Q), false, 'December has the same window candidate');
  gov.enterFormation(Q);
  // The offer with Nowak differs from the last refused one (opposition), so it may be submitted again.
  assert.deepEqual([Q.S.negotiation.draft.candidate_id, Q.S.negotiation.draft.pps_mode], ['nowak', 'external_support']);
  gov.submitFormation(Q);
  assert.deepEqual([Q.S.cabinet_crisis.status, Q.S.cabinet_crisis.failed_proposals], ['impasse', 3]);
  assert.equal(Q.S.cabinet.status, 'caretaker');
  assert.equal(gov.governmentFragility(Q.S), 100);
  assert.match(gov.governmentDisplay(Q).crisis, /Impasse/);
  // December 1923: Grabski's period begins, a new candidate; the formation is mandatory again, 0 T.
  Q.S.turn.pending = null; Q.month_actions = 0; Q.time = rules.timeOf(1923, 12); Q.year = 1923; Q.month = 12;
  assert.equal(gov.formationDue(Q), true);
  assert.equal(gov.initiativeAvailable(Q), false, 'the mandatory formation comes first');
  const neg = gov.enterFormation(Q);
  assert.deepEqual([neg.mandatory, neg.cost_t, neg.context.reason, neg.draft.candidate_id], [true, 0, 'crisis', 'grabski']);
  assert.equal(gov.formationDue(Q), false, 'while it is being prepared');
  assert.equal(gov.formationVisible(Q), true);
});

// ---- Part 3c: agreements, the government-support card and electoral lists ------------------------

// A cabinet formed by the rules themselves in a fixture parliament. `relations` are mirror fields of
// the fixture (e.g. npr_relation); `falls` adds earlier cabinet falls for the crisis configurations.
function cabinet(partySeats, draft, { relations = {}, time = 11, falls = 0, reason = 'post_election' } = {}) {
  const Q = chamber(partySeats, { time, year: rules.yearOf(time), month: rules.monthOf(time), ...relations });
  for (let i = 0; i < falls; i++) Q.S.history.cabinets.push({ id: `fallen_${i}`, pm: `fallen_${i}`, end_reason: 'fall', ended_at: time - 1 - i });
  formation(Q, reason);
  for (const [field, value] of Object.entries(draft)) gov.setDraft(Q, field, value);
  const result = gov.submitFormation(Q);
  assert.equal(result.appointed && result.appointed.configuration_id, draft.configuration_id, 'the fixture cabinet is appointed');
  return Q;
}
function nextMonth(Q) {
  Q.S.turn.pending = null; Q.month_actions = 0;
  Q.time += 1; Q.year = rules.yearOf(Q.time); Q.month = rules.monthOf(Q.time);
  return gov.settleAgreements(Q);
}
function agreementWith(Q, party) {
  return Q.S.agreements[Q.S.cabinet.agreement_ids.find(id => Q.S.agreements[id].parties.includes(party) && Q.S.agreements[id].parties.includes('pps'))];
}
// The mechanism tests of stage 3 use one test promise; the programme points of stage 4 (decision 3)
// are removed from the fixture agreement so that their own dates do not add tension.
function isolated(agreement) {
  agreement.obligations = [];
  return agreement;
}
const LEFT = { pps: 150, psl_wyzwolenie: 90, minorities_bloc: 30, zln: 120, other: 54 };

test('Umowa: breach, warning, ultimatum and payment are one conflict; removing the cause lifts the ultimatum', () => {
  const Q = cabinet(LEFT, { configuration_id: 'left_minority', pps_mode: 'member' });
  const agreement = isolated(agreementWith(Q, 'psl_wyzwolenie'));
  // The test programme: worker protection operating within 4 months, weight 2.
  const o = gov.addObligation(Q, agreement.id, { ...gov.TEST_PROGRAMME, beneficiaries: ['psl_wyzwolenie'] });
  assert.equal(o.due_at, 15);
  for (let t = 12; t <= 15; t++) assert.deepEqual(nextMonth(Q), [], `on time at t=${t}`);
  assert.equal(agreement.tension, 0);
  nextMonth(Q); // t=16: overdue, a new culpable breach of a cabinet PPS sits in
  assert.equal(o.status, 'breached');
  assert.equal(agreement.tension, 16, '8 × weight 2');
  assert.equal(Q.S.actors.pps.credibility, 45);
  nextMonth(Q);
  assert.equal(agreement.tension, 32);
  assert.deepEqual(nextMonth(Q).map(e => e.kind), ['warning']);
  assert.equal(gov.responseCase(Q).kind, 'warning');
  assert.deepEqual(nextMonth(Q).map(e => e.kind), ['ultimatum']); // t=19, tension 64
  assert.deepEqual([agreement.ultimatum.due_at, agreement.ultimatum.by], [21, 'psl_wyzwolenie']);
  assert.equal(gov.responseCase(Q).kind, 'ultimatum');
  nextMonth(Q); // t=20: one full turn to react
  assert.equal(agreement.ultimatum.status, 'open');
  gov.setFulfillment(Q, agreement.id, o.id, 1); // the promise is paid
  assert.deepEqual(nextMonth(Q).map(e => e.kind), ['ultimatum_lifted']);
  assert.equal(o.status, 'fulfilled');
  assert.equal(agreement.tension, 80 - 12, '−12 for a newly fulfilled obligation');
  assert.equal(agreement.status, 'active');
  assert.equal(Q.S.actors.pps.credibility, 48, '+3 once for the fulfilled obligation');
  assert.deepEqual(agreement.history.filter(h => ['warning', 'ultimatum', 'breach'].includes(h.kind)).map(h => h.kind), ['breach', 'warning', 'ultimatum']);
  assert.ok(Q.S.cabinet.partner_ids.includes('psl_wyzwolenie'), 'no withdrawal');
  nextMonth(Q);
  assert.equal(agreement.tension, 68, 'no second count of the same fulfilment');
});

test('Utrata partnera: an expired ultimatum takes the partner out; votes are recounted and no election follows', () => {
  const Q = cabinet(LEFT, { configuration_id: 'left_minority', pps_mode: 'member' });
  const next = JSON.parse(JSON.stringify(Q.S.parliament.next_election));
  const agreement = isolated(agreementWith(Q, 'psl_wyzwolenie'));
  const o = gov.addObligation(Q, agreement.id, { ...gov.TEST_PROGRAMME, beneficiaries: ['psl_wyzwolenie'] });
  while (!(agreement.ultimatum && agreement.ultimatum.status === 'open')) nextMonth(Q);
  const due = agreement.ultimatum.due_at;
  while (Q.time < due - 1) nextMonth(Q);
  const events = nextMonth(Q).map(e => e.kind);
  assert.deepEqual(events.slice(0, 2), ['partner_withdrew', 'dismissal_vote'].slice(0, events.length > 1 ? 2 : 1));
  assert.equal(agreement.status, 'withdrawn');
  assert.equal(agreement.ultimatum.status, 'executed');
  assert.ok(!Q.S.cabinet.partner_ids.includes('psl_wyzwolenie'));
  assert.equal(Q.S.cabinet.portfolios.agriculture, 'expert', 'its portfolio goes to a non-party expert');
  assert.equal(Q.S.cabinet.support_seats, 150, 'the declared votes are recounted: PPS alone');
  const ballot = Q.S.ballots.at(-1);
  assert.equal(ballot.rule, 'cabinet_dismissal');
  assert.equal(ballot.club_votes.pps.vote, 'no', 'PPS is still bound to its own cabinet');
  assert.deepEqual(Q.S.parliament.next_election, next, 'no early election');
  assert.equal(o.status, 'breached', 'the broken promise stays in the record');
});

test('M11 numbers: a threat adds up to 10 points of the government’s need; persuasion adds none', () => {
  // Base 55 with a government that needs PPS: bargain 65 (success), persuade 55 (refusal).
  // Base 48: bargain 58 (refusal), persuade 48. Base 62 without need: both 62.
  const withNeed = (base, need) => base + 0.10 * need;
  close(withNeed(55, 100), 65);
  close(withNeed(48, 100), 58);
  close(withNeed(62, 0), 62);
  // The same holds in the rules: a demand evaluated with need 100 and with need 0.
  const Q = cabinet(LEFT, { configuration_id: 'left_minority', pps_mode: 'member' });
  const offer = { by: 'pps', kind: 'support_demand', members: ['pps', 'psl_wyzwolenie'], programme: { land: 1, fiscal: 2, institution: 2 },
    portfolios: Q.S.cabinet.portfolios };
  close(gov.offerScore(Q.S, 'psl_wyzwolenie', offer, 100) - gov.offerScore(Q.S, 'psl_wyzwolenie', offer, 0),
    Math.min(10, 100 - gov.offerScore(Q.S, 'psl_wyzwolenie', offer, 0)));
});

test('Groźba przyjęta: four parties accept a threat; the concession is recorded; each relation −3 once', () => {
  const relations = { psl_wyzwolenie_relation: 70, psl_piast_relation: 70, npr_relation: 70, pschd_relation: 70 };
  // The partners have 210 MPs without PPS, so the government needs it; NPR receives Labour.
  const Q = cabinet({ pps: 130, psl_wyzwolenie: 50, psl_piast: 80, npr: 40, pschd: 40, zln: 70, other: 34 },
    { configuration_id: 'broad_centre', pps_mode: 'member', portfolio_claim: ['economic'] }, { relations, falls: 2, reason: 'crisis' });
  const before = { ...Q.S.actors.relations };
  const record = gov.supportDemand(Q, 'bargain', 'worker_protection', 'ordinary');
  assert.equal(record.accepted, true);
  assert.deepEqual(record.evaluations.map(e => e.actor).sort(), ['npr', 'pschd', 'psl_piast', 'psl_wyzwolenie']);
  assert.ok(record.evaluations.every(e => e.need > 0), 'the government needs PPS');
  for (const id of ['npr', 'pschd', 'psl_piast', 'psl_wyzwolenie']) assert.equal(Q.S.actors.relations[id], before[id] - 3, id);
  assert.equal(Q.S.cabinet.programme.fiscal, 2);
  assert.deepEqual(Q.S.cabinet.accepted_postulates, ['worker_protection']);
  const promises = gov.ppsAgreements(Q.S).map(id => Q.S.agreements[id].obligations.find(o => o.topic === 'worker_protection'));
  assert.ok(promises.length === 4 && promises.every(o => o.status === 'active' && o.due_at === Q.time + 4 && o.portfolio === 'labor'),
    'decision 3 of stage 4: the promise is due in 4 months and executed by Labour');
  assert.equal(Q.month_actions, 1, 'an ordinary use spends the month');
  assert.equal(rules.cooldownRemaining(Q, 'support.' + Q.S.cabinet.id), 6, 'renewal 6 months for this cabinet (Z — 0.56; it was 3)');
  assert.equal(gov.supportOptionStatus(Q, 'bargain', 'ordinary').available, false, 'the same demand cannot be taken twice');
});

test('Groźba odrzucona and Groźba po cofnięciu: carry out or back down; a backed-down threat counts as persuasion', () => {
  const relations = { psl_wyzwolenie_relation: 50 };
  const make = () => cabinet({ pps: 120, psl_wyzwolenie: 40, minorities_bloc: 90, zln: 194 },
    { configuration_id: 'left_minority', pps_mode: 'member', seek_minority_support: true }, { relations });
  // The refusal: PSL Wyzwolenie at relation 20 does not accept the demand, even under a threat.
  const Q = make();
  gov.changeRelation(Q, 'psl_wyzwolenie', -30, 'fixture');
  const refused = gov.supportDemand(Q, 'bargain', 'worker_protection', 'ordinary');
  assert.equal(refused.accepted, false);
  assert.ok(Q.S.cabinet.pending_threat, 'an immediate choice, no counter-proposal');
  gov.answerThreat(Q, 'back_down');
  assert.equal(Q.S.actors.pps.credibility, 45);
  assert.equal(Q.S.cabinet.pps_threat_discounted, true);
  assert.equal(Q.S.cabinet.partner_ids.includes('pps'), true, 'PPS stays');
  assert.equal(Q.month_actions, 1, 'the answer costs no further month');
  // The next threat against this cabinet counts without need, like persuasion.
  Q.S.turn.pending = null; Q.month_actions = 0; Q.time += 3; Q.month = rules.monthOf(Q.time);
  const again = gov.supportDemand(Q, 'bargain', 'worker_protection', 'ordinary');
  assert.ok(again.threat_discounted);
  assert.ok(again.evaluations.every(e => e.need === 0));
  gov.answerThreat(Q, 'back_down');
  assert.equal(Q.S.actors.pps.credibility, 40, 'once per negotiation ID');
  // Carrying the threat out: the ordinary effects of withdraw, without another month.
  const R = make();
  gov.changeRelation(R, 'psl_wyzwolenie', -30, 'fixture');
  gov.supportDemand(R, 'bargain', 'worker_protection', 'ordinary');
  const result = gov.answerThreat(R, 'carry_out');
  assert.equal(result.withdrawn, true);
  assert.equal(R.month_actions, 1);
  assert.equal(R.S.actors.pps.credibility, 50, 'carrying out costs no reputation');
  assert.ok(!R.S.cabinet.partner_ids.includes('pps'));
  assert.equal(R.S.cabinet.pps_mode, 'opposition');
  assert.equal(R.S.cabinet.dismissal_motion.status, 'open', 'PPS decides on the motion in the same sequence');
  // A new cabinet starts without the discount.
  assert.equal(make().S.cabinet.pps_threat_discounted, false);
});

test('Perswazja and Rząd bez potrzeby PPS: persuasion never changes relations; without need both succeed, only a threat costs', () => {
  // The other cabinet party has a majority without PPS: need 0 for every evaluator (M11). Thugutt
  // leads, so PSL Wyzwolenie is the one evaluator (a non-party premier would answer as well).
  const relations = { psl_wyzwolenie_relation: 75, psl_piast_relation: 55 };
  const make = () => cabinet({ pps: 40, psl_wyzwolenie: 240, zln: 100, other: 64 },
    { configuration_id: 'left_minority', pps_mode: 'member', candidate_id: 'thugutt' }, { relations });
  const P = make();
  const before = { ...P.S.actors.relations };
  const persuaded = gov.supportDemand(P, 'persuade', 'worker_protection', 'ordinary');
  assert.equal(persuaded.accepted, true);
  assert.deepEqual(P.S.actors.relations, before);
  assert.equal(P.S.actors.pps.credibility, 50);
  const B = make();
  assert.equal(gov.governmentNeed(B, 'psl_wyzwolenie', {}), 0);
  const bargained = gov.supportDemand(B, 'bargain', 'worker_protection', 'ordinary');
  assert.equal(bargained.accepted, true);
  close(bargained.evaluations[0].score, persuaded.evaluations[0].score, 1e-9);
  assert.equal(B.S.actors.relations.psl_wyzwolenie, before.psl_wyzwolenie - 3, 'the threat still costs relation');
  // A refused persuasion leaves the support as it was and asks for nothing else.
  const R = make();
  // Relation 0 and a reputation of 40: 0 + 35 (programme) + 20 (portfolio) + 4 = 59, below 60. Since 0.61 the appointment of
  // Thugutt has added +5 with his party (decision 5A), so the fixture removes the whole relation.
  gov.changeRelation(R, 'psl_wyzwolenie', -R.S.actors.relations.psl_wyzwolenie, 'fixture');
  gov.changeCredibility(R, 'fixture:breach', -10, 'breach');
  const snapshot = { ...R.S.actors.relations };
  const refused = gov.supportDemand(R, 'persuade', 'worker_protection', 'ordinary');
  assert.equal(refused.accepted, false);
  close(refused.evaluations[0].score, 59);
  assert.equal(R.S.cabinet.pending_threat, null);
  assert.deepEqual(R.S.actors.relations, snapshot);
  assert.equal(R.S.actors.pps.credibility, 40, 'persuasion changes no reputation');
  assert.ok(R.S.cabinet.partner_ids.includes('pps'));
});

test('Kompromis listowy a Lewica: the early Centre-Left adds 3 Lewica dissent once; the list with NPR none', () => {
  const high = { psl_wyzwolenie_relation: 75, psl_piast_relation: 75, npr_relation: 75, pschd_relation: 30 }; // Z — 0.58: the gates of 75
  const withJoint = Q => {
    // Two fulfilled joint obligations of PPS with the partners (6.5), each with its own ID.
    Q.S.agreements.joint = { id: 'joint', kind: 'support', parties: ['pps', 'psl_piast'], status: 'fulfilled', history: [],
      obligations: [{ id: 'joint:a', status: 'fulfilled', weight: 1 }, { id: 'joint:b', status: 'fulfilled', weight: 1 }] };
    return Q;
  };
  const C = withJoint(fixture({ time: 9, year: 1922, month: 9, lewica_dissent: 10, ...high }));
  assert.deepEqual(gov.listWindow(C), { open: true, election_id: 'first_election_1922', vote_time: 11 });
  const centre = gov.proposeList(C, 'centrolew_early');
  assert.equal(centre.accepted, true);
  assert.equal(C.lewica_dissent, 13);
  assert.equal(C.S.parliament.alliances.length, 1);
  assert.deepEqual(C.S.parliament.alliances[0].members, ['pps', 'psl_wyzwolenie', 'psl_piast', 'npr']);
  assert.equal(gov.listStatus(C, 'left_peasant').available, false, 'one own list agreement per election');
  const L = fixture({ time: 10, year: 1922, month: 10, lewica_dissent: 10, ...high });
  assert.equal(gov.listStatus(L, 'centrolew_early').available, false, 'needs two fulfilled joint obligations');
  const labour = gov.proposeList(L, 'labour');
  assert.equal(labour.accepted, true);
  assert.equal(L.lewica_dissent, 10, 'the list with NPR keeps the protection of labour');
  assert.equal(L.month_actions, 0, 'an answer to the event before the election costs no action (Z — 0.57)');
  // Outside the window the question is not asked.
  assert.equal(gov.listWindow(fixture({ time: 8, year: 1922, month: 8 })).open, false);
});

test('an accepted list is counted as one list at the election; without an agreement the seats stay as in stage 2', () => {
  const partySeats = { kpp: 2, pps: 35, npr: 22, psl_wyzwolenie: 25, psl_piast: 99, pschd: 27, zln: 83, minorities_bloc: 17, other: 134 };
  const votes = { kpp: 1.5, pps: 10, npr: 5, psl_wyzwolenie: 11, psl_piast: 13, pschd: 10, zln: 22, minorities_bloc: 16, other: 11.5 };
  const run = alliance => {
    const Q = fixture({ time: 10, year: 1922, month: 10, npr_relation: 75, sejm_total_seats: 444, n_elections: 0, sejm_results: [],
      party_names: Object.fromEntries(PARTIES.map(p => [p, p.toUpperCase()])) });
    for (const p of PARTIES) Q[`${p}_normalized`] = votes[p] / 100;
    if (alliance) assert.equal(gov.proposeList(Q, alliance).accepted, true);
    Q.S.turn.pending = null; Q.month_actions = 0; Q.time = 11;
    const recorded = inst.recordSejmElection(Q, { id: 'sejm_1922_11_1', year: 1922, month: 11, first: true, phase: 'pending' });
    assert.equal(recorded.ok, true);
    return recorded.result;
  };
  const plain = run(null);
  assert.deepEqual(plain.lists.filter(l => l.members.length > 1).map(l => l.id), ['chzjn']);
  const joint = run('labour');
  const list = joint.lists.find(l => l.id === 'labour_first_election_1922');
  assert.deepEqual(list.members, ['pps', 'npr']);
  close(list.vote_share, 15);
  assert.equal(list.seats, joint.party_seats.pps + joint.party_seats.npr);
  assert.ok(joint.party_seats.npr > 0, 'NPR keeps its own MPs and club');
  assert.equal(Object.values(joint.party_seats).reduce((a, b) => a + b), 444);
  void partySeats;
});

test('C5–C7: a dismissal needs no successor now; after the constructive-vote reform, no successor blocks it', () => {
  const Q = cabinet(LEFT, { configuration_id: 'left_minority', pps_mode: 'member' });
  assert.equal(Q.S.cabinet.pm, 'nowak', 'a non-party premier: PPS leaving is no resignation');
  const left = gov.withdrawSupport(Q, 'ordinary');
  assert.equal(left.fell, false);
  assert.equal(gov.dismissalSupportStatus(Q).available, true);
  Q.S.parliament.constructive_vonc = true; // fixture: the reform of 7.6 (stage 4)
  assert.equal(gov.constructiveVoteRequired(Q.S), true);
  assert.match(gov.dismissalSupportStatus(Q).reason, /agreed successor with 223 votes/);
  assert.throws(() => gov.decideDismissal(Q, 'support'), /successor/);
  Q.S.cabinet.dismissal_motion.successor = { candidate_id: 'daszynski', votes: 223 };
  assert.equal(gov.dismissalSupportStatus(Q).available, true);
  const ballot = gov.decideDismissal(Q, 'support');
  assert.equal(ballot.rule, 'cabinet_dismissal');
  assert.equal(ballot.club_votes.psl_wyzwolenie.vote, 'no', 'the remaining partner is bound');
  assert.equal(Q.S.cabinet.dismissal_motion.status, ballot.result === 'passed' ? 'passed' : 'failed');
});

test('Legalny kalendarz bez C8: a fall when the election is already set keeps its date; the premier resigns with his party', () => {
  const Q = cabinet(LEFT, { configuration_id: 'left_minority', pps_mode: 'member', seek_minority_support: true, candidate_id: 'daszynski' });
  // Fixture: January 1928, the lawful election of 19 February 1928 already set (7.4).
  Q.S.parliament.next_election = inst.scheduleElection({ kind: 'term_end', opened_at: inst.FIRST_TERM_OPENED });
  Q.time = 73; Q.year = 1928; Q.month = 1;
  const next = JSON.parse(JSON.stringify(Q.S.parliament.next_election));
  const left = gov.withdrawSupport(Q, 'ordinary');
  assert.equal(left.fell, true, 'Daszyński resigns when PPS leaves');
  assert.equal(Q.S.cabinet.status, 'caretaker');
  assert.equal(Q.S.cabinet.dismissal_motion, null, 'no vote is needed after a resignation');
  assert.equal(Q.S.cabinet_crisis.reason, 'cabinet_fall');
  assert.deepEqual(Q.S.parliament.next_election, next, 'no dissolution and no early election');
  assert.equal(next.vote_date, '1928-02-19');
  Q.S.turn.pending = null; Q.month_actions = 0;
  assert.equal(gov.formationDue(Q), true, 'the formation comes before the election');
});

test('9.3: one extension by three months lifts the ultimatum; a second is not available', () => {
  const Q = cabinet(LEFT, { configuration_id: 'left_minority', pps_mode: 'member' });
  const agreement = isolated(agreementWith(Q, 'psl_wyzwolenie'));
  const o = gov.addObligation(Q, agreement.id, { ...gov.TEST_PROGRAMME, beneficiaries: ['psl_wyzwolenie'] });
  while (!(agreement.ultimatum && agreement.ultimatum.status === 'open')) nextMonth(Q);
  assert.equal(gov.responseCase(Q).kind, 'ultimatum');
  assert.match(gov.extensionStatus(Q).reason, /Less than half/);
  gov.setFulfillment(Q, agreement.id, o.id, 0.5); // the project runs, but not yet fully
  assert.equal(gov.weightedFulfillment(agreement), 0.5);
  assert.equal(gov.extensionStatus(Q).available, true);
  const record = gov.requestExtension(Q);
  assert.equal(record.accepted, true);
  assert.equal(o.due_at, Q.time + 3, 'three months from the renegotiation, as the old date has passed');
  assert.equal(agreement.ultimatum.status, 'lifted', 'removing the cause lifts it at once');
  assert.equal(agreement.extensions_used, 1);
  assert.equal(o.fulfillment, 0.5, 'an extension records the date, not progress');
  while (!(agreement.ultimatum && agreement.ultimatum.status === 'open')) nextMonth(Q);
  assert.match(gov.extensionStatus(Q).reason, /one standard extension has been used/);
});

test('Broker a Coalition (10.4.3): +5 for the partners of one broad offer in preparation, or −10 tension in a coalition', () => {
  const relations = { psl_wyzwolenie_relation: 70, psl_piast_relation: 70, npr_relation: 70, pschd_relation: 70 };
  const seats = { pps: 130, psl_wyzwolenie: 50, psl_piast: 80, npr: 40, pschd: 40, zln: 70, other: 34 };
  const prepared = broker => {
    const Q = chamber(seats, { time: 11, year: 1922, month: 11, ...relations });
    Q.S.history.cabinets.push({ id: 'a', pm: 'a', end_reason: 'fall', ended_at: 10 }, { id: 'b', pm: 'b', end_reason: 'fall', ended_at: 9 });
    formation(Q, 'crisis');
    gov.setDraft(Q, 'configuration_id', 'broad_centre');
    gov.setDraft(Q, 'portfolio_claim', ['economic']);
    if (broker) {
      assert.equal(gov.brokerStatus(Q).mode, 'broad_offer');
      gov.brokerCoalition(Q);
      assert.equal(gov.brokerStatus(Q).available, false, 'one indicated offer, once');
    }
    return gov.submitFormation(Q).pps_offer.evaluations;
  };
  const plain = prepared(false), helped = prepared(true);
  for (let i = 0; i < plain.length; i++) close(helped[i].score, Math.min(100, plain[i].score + 5));
  // In a coalition: −10 on each cabinet agreement, not below 0.
  const Q = cabinet(LEFT, { configuration_id: 'left_minority', pps_mode: 'member' });
  const agreement = agreementWith(Q, 'psl_wyzwolenie');
  assert.equal(gov.brokerStatus(Q).available, false, 'nothing to ease without tension');
  agreement.tension = 6;
  assert.equal(gov.brokerCoalition(Q), 'tension');
  assert.equal(agreement.tension, 0);
});

// ---- Z — 0.61: the formation in four steps (decisions 1B simplified, 2A–7A and the necessary portfolios) ----------
const CENTRE = { pps: 100, psl_wyzwolenie: 60, psl_piast: 80, npr: 40, zln: 100, other: 64 };
function centreLeft(overrides = {}) {
  const Q = chamber(CENTRE, { time: 11, year: 1922, month: 11, psl_piast_relation: 60, npr_relation: 55, ...overrides });
  formation(Q);
  gov.setDraft(Q, 'configuration_id', 'centre_left');
  return Q;
}

test('Ocena partnera 0.61: four visible parts — 30% relation, 35% programme, 20% portfolio, 15% credibility — and no need', () => {
  const Q = centreLeft();
  const offer = gov.buildCabinetOffer(Q, Q.S.negotiation.draft, Q.S.negotiation.context);
  const parts = gov.formationScoreParts(Q.S, 'psl_piast', offer);
  close(parts.relation, 18);
  close(parts.programme, 0.35 * 100 * (1 - 1 / 12));
  close(parts.portfolio, 20); // Agriculture for PSL Piast
  close(parts.credibility, 7.5);
  close(parts.total, 77.58);
  const answer = gov.evaluateCabinetPartner(Q.S, 'psl_piast', offer);
  assert.deepEqual([answer.accept, answer.need, Math.round(answer.score * 100) / 100], [true, null, 77.58]);
  // The screen shows whole parts whose sum is the score, cut down so that 59.9 never reads as 60. Z — 0.71 (the user's note of
  // 7 X 2026): each club is one line with its answer and overall score; the named parts open on a click.
  const lines = gov.formationView(Q).partner_lines;
  assert.ok(lines.includes('<details class="pl-score"><summary>PSL Piast — agrees · 77/60</summary>relation with PPS +18 · ' +
    'programme of the cabinet and the club’s views +32 · its portfolio +20 · credibility of PPS +7.</details>'), lines.join(' | '));
  assert.ok(lines.includes('<details class="pl-score"><summary>PSL Wyzwolenie — agrees · 70/60</summary>relation with PPS +20 · ' +
    'programme of the cabinet and the club’s views +23 · its portfolio +20 · credibility of PPS +7.</details>'));
  // A broken promise is a visible minus; a gate below its minimum is named with the current relation.
  Q.S.agreements.old = { id: 'old', kind: 'support', parties: ['pps', 'npr'], status: 'breached',
    obligations: [{ id: 'old:1', owner: 'pps', status: 'breached' }, { id: 'old:2', owner: 'pps', status: 'breached' }], history: [] };
  assert.ok(gov.formationView(Q).partner_lines.some(l => /^<details class="pl-score"><summary>NPR — agrees · 66\/60<\/summary>relation with PPS \+17 .* · broken promises −10\.<\/details>$/.test(l)));
  gov.changeRelation(Q, 'npr', -10, 'fixture');
  assert.match(gov.draftChoiceStatus(Q, 'configuration', 'centre_left').reason, /Relation with NPR is below 55 \(now 45\)/);
});

test('Konieczny resort 0.61: a partner keeps its preferred portfolio when it would refuse without it; with a margin PPS may take it', () => {
  const Q = centreLeft();
  // NPR wants Labour, PSL Piast Agriculture and PSL Wyzwolenie (the smaller peasant club) Interior: each would fall by 20.
  assert.match(gov.portfolioStatus(Q, 'labor').reason, /Without it NPR refuses: its score falls from 76 to 56, below 60/);
  assert.match(gov.portfolioStatus(Q, 'agriculture').reason, /Without it PSL Piast refuses: its score falls from 77 to 57/);
  assert.match(gov.portfolioStatus(Q, 'interior').reason, /Without it PSL Wyzwolenie refuses: its score falls from 70 to 50/);
  assert.deepEqual(Q.S.negotiation.draft.portfolio_claim, ['economic'], 'without Labour PPS starts with Industry and Trade');
  assert.throws(() => gov.setDraft(Q, 'portfolio_take', 'labor'), /cannot be taken/);
  // With relation 100 NPR keeps 69 without Labour: PPS may take it, and the screen says what NPR loses.
  const R = centreLeft({ npr_relation: 100 });
  assert.deepEqual(R.S.negotiation.draft.portfolio_claim, ['labor']);
  gov.setDraft(R, 'portfolio_drop', 'labor');
  const status = gov.portfolioStatus(R, 'labor');
  assert.equal(status.available, true);
  assert.equal(status.note, 'NPR loses its portfolio: score 89 → 69.');
});

test('Punkty wpływu 0.61: the PPS share of the cabinet’s seats + 10 when it is indispensable; Labour 10, Interior and Treasury 20, others 10', () => {
  const Q = centreLeft();
  // PPS has 100 of the cabinet's 280 MPs (36%); the other three have 180, below 223.
  assert.deepEqual(gov.influencePoints(Q, Q.S.negotiation.draft), { points: 46, share: 36, pivotal: true });
  assert.deepEqual([gov.PORTFOLIO_COSTS.labor, gov.PORTFOLIO_COSTS.interior, gov.PORTFOLIO_COSTS.finance, gov.PORTFOLIO_COSTS.justice], [10, 20, 20, 10]);
  gov.setDraft(Q, 'portfolio_take', 'finance');
  gov.setDraft(Q, 'portfolio_take', 'justice');
  assert.equal(gov.claimCost(Q.S.negotiation.draft.portfolio_claim), 40);
  assert.match(gov.portfolioStatus(Q, 'education').reason, /Not enough influence points: 6 left, 10 needed/);
  assert.match(gov.formationView(Q).points, /Influence points: 46 = PPS share of the cabinet’s seats 36% \+ 10, because without PPS this cabinet has no majority\. The chosen portfolios cost 40, 6 left\./);
  // A programmatic claim above the points cannot be submitted; a cabinet with a majority without PPS gives no +10.
  gov.setDraft(Q, 'portfolio_claim', ['finance', 'interior', 'justice']);
  assert.match(gov.submitStatus(Q).reason, /The chosen portfolios cost 50 influence points; PPS has 46/);
  const big = chamber({ pps: 60, psl_wyzwolenie: 100, psl_piast: 130, npr: 40, zln: 50, other: 64 },
    { time: 11, year: 1922, month: 11, psl_piast_relation: 60, npr_relation: 60 });
  formation(big);
  gov.setDraft(big, 'configuration_id', 'centre_left');
  assert.deepEqual(gov.influencePoints(big, big.S.negotiation.draft), { points: 18, share: 18, pivotal: false });
});

test('Powołanie od razu 0.61: an accepted PPS offer is appointed even when the head of state’s candidate could govern without PPS', () => {
  // VI 1923, the period of Witos: Chjeno-Piast could govern and would rank 82.6 with the +8 of the period (8.7).
  const Q = chamber({ pps: 100, psl_wyzwolenie: 60, psl_piast: 80, npr: 40, pschd: 40, zln: 100, other: 24 },
    { time: rules.timeOf(1923, 6), year: 1923, month: 6, psl_piast_relation: 60, npr_relation: 60 });
  formation(Q, 'crisis');
  gov.setDraft(Q, 'configuration_id', 'centre_left');
  const fallback = gov.fallbackCabinet(Q);
  assert.deepEqual([fallback.offer.configuration_id, fallback.offer.candidate_id], ['chjeno_piast', 'witos']);
  assert.match(gov.formationView(Q).verdict, /after the commit the cabinet is appointed at once — Centre-left, prime minister Ignacy Daszyński/);
  const result = gov.submitFormation(Q);
  assert.deepEqual([result.appointed.configuration_id, result.appointed.by], ['centre_left', 'pps']);
  // In opposition PPS sees beforehand which cabinet the head of state would appoint.
  const O = chamber({ pps: 100, psl_wyzwolenie: 60, psl_piast: 80, npr: 40, pschd: 40, zln: 100, other: 24 },
    { time: rules.timeOf(1923, 6), year: 1923, month: 6 });
  formation(O, 'crisis');
  gov.setDraft(O, 'pps_mode', 'opposition');
  assert.match(gov.formationView(O).verdict, /PPS stays in opposition: the head of state appoints a cabinet without PPS: Wincenty Witos — Chjeno-Piast\./);
});

test('Premier 0.71: a party cabinet is led by the leader of its largest club (Thugutt also in the centre-left); the leader of a partner party wins PPS +5 with it once; an expert leads only a cabinet of experts', () => {
  const Q = centreLeft();
  const draft = Q.S.negotiation.draft;
  // Decision 4A of 7 X 2026: PPS is the largest club of this centre-left, so Daszyński leads by default; Witos cannot, Thugutt
  // can (his mission of a broad cabinet), and a non-party man leads a party cabinet only when none of its leaders can.
  assert.equal(draft.candidate_id, 'daszynski');
  assert.equal(gov.candidateStatus(Q, 'witos', draft).reason, 'PSL Piast is not the largest club of this cabinet.');
  assert.equal(gov.candidateStatus(Q, 'thugutt', draft).available, true);
  assert.equal(gov.candidateStatus(Q, 'nowak', draft).reason, 'A party cabinet is led by the leader of its largest party.');
  assert.match(gov.candidateNote(Q, 'thugutt'), /^Leader of PSL Wyzwolenie: after the appointment \+5 relation with his party\.$/);
  assert.equal(gov.candidateShown(Q, 'witos'), true, 'the leader of a member party is shown, greyed with his reason');
  assert.equal(gov.candidateShown(Q, 'nowak'), false, 'an expert is no candidate of this party cabinet');
  assert.equal(gov.candidateShown(Q, 'pilsudski'), false);
  gov.setDraft(Q, 'candidate_id', 'thugutt');
  gov.submitFormation(Q);
  assert.equal(Q.S.cabinet.pm, 'thugutt');
  assert.equal(Q.S.actors.relations.psl_wyzwolenie, 70);
  assert.equal(Q.S.history.reasons.filter(r => r.kind === 'relation' && /^premier:/.test(r.reason)).length, 1);
  // A cabinet of experts has the expert of the period, with the clubs that historically backed and fought him.
  const E = centreLeft();
  gov.chooseCoalition(E, 'expert');
  assert.deepEqual([E.S.negotiation.draft.candidate_id, E.S.negotiation.draft.pps_mode], ['nowak', 'external_support']);
  assert.match(gov.candidateNote(E, 'nowak'), /Backed by PSL Piast, PSL Wyzwolenie, NPR, PPS\. Candidate of the Naczelnik Państwa for this period: supporting him costs nothing with Piłsudski\.$/);
  gov.submitFormation(E);
  assert.deepEqual([E.S.cabinet.pm, E.S.actors.relations.psl_piast], ['nowak', 60]);
});

test('Lista gabinetów 0.61: every cabinet in one line with its clubs, seats, partners’ scores and votes; the impossible ones greyed with a reason', () => {
  const Q = centreLeft();
  const line = gov.coalitionLine(Q, 'centre_left');
  assert.equal(line.available, true);
  assert.match(line.line, /^Chosen now\. PPS 100 \+ PSL Wyzwolenie 60 \+ PSL Piast 80 \+ NPR 40 = 280 MPs\. Partners: PSL Wyzwolenie ✓, PSL Piast ✓, NPR ✓\. Votes: majority \(280 for; 223 needed\)\./);
  // Z — 0.67: after the election of 1922 the 160 MPs of PPS and PSL Wyzwolenie are below the 185 of decision 3A.
  const left = gov.coalitionLine(Q, 'left_minority');
  assert.equal(left.available, false);
  assert.match(left.line, /^PPS 100 \+ PSL Wyzwolenie 60 = 160 MPs\. After the election of 1922 a cabinet with PPS needs 185 MPs/);
  const broad = gov.coalitionLine(Q, 'broad_centre');
  assert.equal(broad.available, false);
  assert.match(broad.line, /= 280 MPs\. Only in a real crisis/);
  assert.match(gov.oppositionLine(Q), /^No partner’s agreement is needed\. Then /);
  // Choosing a cabinet from the list brings PPS back from opposition.
  gov.setDraft(Q, 'pps_mode', 'opposition');
  gov.chooseCoalition(Q, 'left_minority');
  assert.equal(Q.S.negotiation.draft.pps_mode, 'member');
  gov.setDraft(Q, 'pps_mode', 'opposition');
  gov.chooseCoalition(Q, 'expert');
  assert.equal(Q.S.negotiation.draft.pps_mode, 'external_support');
});

// ---- Z — 0.71: the candidates of their period, the stances of the clubs to a non-party premier and the fallback ----------
// (decisions 3A and 4A of 7 X 2026; H: PL-1922-1926-PM-CANDIDATES)
const at = (year, month, seats = CENTRE) => chamber(seats, { time: rules.timeOf(year, month), year, month });
test('Kandydaci okresu 0.71: each non-party premier only in his period and under his condition; Skrzyński only in his own cabinet', () => {
  const EXPERTS = ['ponikowski', 'sliwinski', 'nowak', 'sikorski', 'grabski', 'skrzynski'];
  const standing = Q => EXPERTS.filter(id => gov.expertPeriodStatus(Q, id).available);
  assert.deepEqual(standing(at(1922, 3)), ['ponikowski', 'sliwinski']);
  assert.deepEqual(standing(at(1922, 6)), ['sliwinski', 'nowak'], 'the crisis of VI 1922: the Naczelnik’s man and the compromise');
  assert.deepEqual(standing(at(1922, 11)), ['nowak']);
  assert.deepEqual(standing(at(1924, 3)), ['grabski']);
  assert.deepEqual(standing(at(1926, 5)), ['grabski', 'skrzynski']);
  // Sikorski only after the assassination of the President; Śliwiński only while Piłsudski is Naczelnik.
  const december = at(1922, 12);
  assert.equal(gov.expertPeriodStatus(december, 'sikorski').reason, 'Only after the assassination of the President.');
  december.S.politics.episodes.push({ kind: 'security_crisis', outcome: 'death' });
  assert.equal(gov.expertPeriodStatus(december, 'sikorski').available, true);
  const june = at(1922, 6);
  june.polish_presidency = { current: { office_id: 'prezydent_rp', holder_id: 'gabriel_narutowicz', holder_name: 'Gabriel Narutowicz', status: 'active' } };
  assert.equal(gov.expertPeriodStatus(june, 'sliwinski').reason, 'Only while Piłsudski is Naczelnik.');
  // Without a candidate of the period the cabinet of experts cannot be chosen; Skrzyński leads only his broad cabinet.
  const between = at(1923, 6);
  formation(between, 'crisis');
  assert.equal(gov.variantStatus(between, 'expert').reason, 'No non-party prime minister stands in this period.');
  const late = at(1925, 12);
  assert.equal(gov.candidateStatus(late, 'skrzynski', { configuration_id: 'expert' }).reason, 'He leads only his own cabinet: Broad cabinet of Skrzyński.');
  assert.equal(gov.candidateStatus(late, 'skrzynski', { configuration_id: 'skrzynski_broad' }).available, true);
});

test('Stosunek do fachowca 0.71: a supporter judges him with 80, a neutral club with 50, an opponent refuses and votes against', () => {
  // VI 1922 in the Sejm of 1919: Śliwiński, backed by the left, Piast and the minorities, fought by ZLN and the Christian Democrats.
  const Q = fixture({ time: 6, year: 1922, month: 6 });
  formation(Q, 'crisis');
  gov.chooseCoalition(Q, 'expert');
  gov.setDraft(Q, 'candidate_id', 'sliwinski');
  // The offer as the formation judges it: an expert proposed by PPS (by 'pps_expert').
  const offer = { ...gov.buildCabinetOffer(Q, Q.S.negotiation.draft, Q.S.negotiation.context), by: 'pps_expert' };
  assert.deepEqual(['psl_piast', 'zln', 'pschd', 'jewish_rep'].map(id => gov.expertStance(id, 'sliwinski')), ['for', 'against', 'against', 'for']);
  close(gov.formationScoreParts(Q.S, 'psl_piast', offer).relation, 24);
  close(gov.formationScoreParts(Q.S, 'zln', offer).relation, 6);
  const zln = gov.evaluateCabinetPartner(Q.S, 'zln', offer);
  assert.deepEqual([zln.accept, zln.opponent, zln.reasons], [false, true, ['an opponent of the prime minister']]);
  const view = gov.formationView(Q);
  assert.ok(view.partner_lines.includes('<details class="pl-score"><summary>ZLN — does not support it</summary>An opponent of this prime minister: ' +
    'it votes against his cabinet whatever the score (59: an opponent of the premier +6 · programme of the premier and the club’s views +26 · ' +
    'no demands +20 · fixed part +7).</details>'), view.partner_lines.join(' | '));
  assert.ok(view.partner_lines.some(l => l.startsWith('<details class="pl-score"><summary>PSL Piast — supports it · 86/60</summary>a supporter of the premier +24')));
  // The opponents vote against: 198 for (PPS, the peasants, NPR and the minorities), 110 against (ZLN and PSChD).
  assert.match(view.votes, /^198 for, 110 against, 136 abstaining; a majority is 223\./);
  assert.match(gov.candidateNote(Q, 'sliwinski'), /Backed by PPS, PSL Wyzwolenie, PSL Piast, NPR, Jewish representation, Other national minorities\. Fought by ZLN, PSChD\./);
});

test('Rząd awaryjny 0.71: the head of state appoints the expert of the period first, another non-party man only when nobody else can govern', () => {
  // XI 1922: Nowak is the man of the period and governs without PPS.
  const Q = at(1922, 11);
  formation(Q);
  assert.deepEqual([gov.fallbackCabinet(Q).offer.configuration_id, gov.fallbackCabinet(Q).offer.candidate_id], ['expert', 'nowak']);
  // With his cabinet fallen and no Chjeno-Piast possible, the head of state turns to a man beyond his period whose conditions
  // hold (P: no crisis without end) — never Sikorski before the assassination, never Skrzyński outside his own cabinet.
  const F = at(1922, 11);
  F.S.history.cabinets.push({ id: 'nowak_fixture', pm: 'nowak', end_reason: 'fall', ended_at: 5 });
  formation(F);
  assert.deepEqual([gov.fallbackCabinet(F).offer.configuration_id, gov.fallbackCabinet(F).offer.candidate_id], ['expert', 'ponikowski']);
  // A cabinet of the parties comes before a man beyond his period (VI 1923, Chjeno-Piast).
  const R = at(1923, 6, { pps: 100, psl_wyzwolenie: 60, psl_piast: 80, npr: 40, pschd: 40, zln: 100, other: 24 });
  formation(R, 'crisis');
  assert.deepEqual([gov.fallbackCabinet(R).offer.configuration_id, gov.fallbackCabinet(R).offer.candidate_id], ['chjeno_piast', 'witos']);
});

// ---- Z — 0.67: the formation after the election of 1922 (decisions 1A and 3A of 7 X 2026) ------------------------
test('Głosy mniejszości 0.67: a cabinet without PSL Piast that passes only with the minorities meets the votes of Piast, NPR, PSChD and ZLN', () => {
  // A later crisis (no threshold of 3A). PPS and PSL Wyzwolenie have 100 MPs, the minorities 90; ZLN 100 and PSChD 34 vote
  // against, so only the minorities give the cabinet more votes for than against: PSL Piast 90 and NPR 30 vote against too.
  const weak = chamber({ pps: 60, psl_wyzwolenie: 40, minorities_bloc: 90, psl_piast: 90, npr: 30, pschd: 34, zln: 100 }, { time: 20, year: 1923, month: 8 });
  formation(weak, 'crisis');
  gov.setDraft(weak, 'configuration_id', 'left_minority');
  gov.setDraft(weak, 'seek_minority_support', true);
  const w = gov.buildCabinetOffer(weak, weak.S.negotiation.draft, weak.S.negotiation.context);
  const wf = gov.forecast(weak, w, w.members.concat(w.supporters));
  assert.deepEqual([wf.minority_reaction, wf.yes, wf.no, wf.viable], [true, 190, 254, false]);
  assert.deepEqual(wf.lines.filter(l => l.minority_reaction).map(l => l.club).sort(), ['npr', 'psl_piast']);
  assert.match(gov.formationView(weak).votes, /PSL Piast, NPR, the Christian Democrats and ZLN vote against a cabinet that rests on the votes of the minorities\./);
  assert.match(gov.configurationStatus(weak, 'left_minority', { reason: 'crisis' }).reason, /No realistic parliamentary support/);
  // A strong left (150 MPs against 114) does not need the minorities: their votes cause no reaction.
  const strong = chamber({ pps: 90, psl_wyzwolenie: 60, minorities_bloc: 90, psl_piast: 70, npr: 20, pschd: 34, zln: 80 }, { time: 20, year: 1923, month: 8 });
  formation(strong, 'crisis');
  gov.setDraft(strong, 'configuration_id', 'left_minority');
  gov.setDraft(strong, 'seek_minority_support', true);
  const s1 = gov.buildCabinetOffer(strong, strong.S.negotiation.draft, strong.S.negotiation.context);
  const sf = gov.forecast(strong, s1, s1.members.concat(s1.supporters));
  assert.deepEqual([sf.minority_reaction, sf.yes, sf.viable], [false, 240, true]);
  // With PSL Piast inside (the Centre-left) the minorities' votes cause no reaction either.
  gov.changeRelation(weak, 'psl_piast', 60 - weak.S.actors.relations.psl_piast, 'fixture');
  gov.changeRelation(weak, 'npr', 60 - weak.S.actors.relations.npr, 'fixture');
  gov.setDraft(weak, 'configuration_id', 'centre_left');
  gov.setDraft(weak, 'seek_minority_support', true);
  const centre = gov.buildCabinetOffer(weak, weak.S.negotiation.draft, weak.S.negotiation.context);
  assert.equal(gov.forecast(weak, centre, centre.members.concat(centre.supporters)).minority_reaction, false);
});

test('Próg po wyborach 1922 0.67: a cabinet with PPS needs 185 MPs of its own clubs; a crisis later has no such threshold', () => {
  const high = { psl_piast_relation: 60, npr_relation: 60 };
  const at = (n, reason = 'post_election') => {
    const Q = chamber({ pps: 50, psl_wyzwolenie: 50, psl_piast: 65, npr: n, pschd: 40, zln: 120, minorities_bloc: 90, other: 444 - 415 - n },
      { time: 11, year: 1922, month: 11, ...high });
    formation(Q, reason);
    return gov.configurationStatus(Q, 'centre_left', Q.S.negotiation.context);
  };
  assert.match(at(19).reason, /After the election of 1922 a cabinet with PPS needs 185 MPs of its own clubs, without the minority representations; this one has 184\./);
  assert.equal(at(20).available, true, '185 MPs of PPS, PSL Wyzwolenie, PSL Piast and NPR');
  assert.equal(at(19, 'crisis').available, true, 'only the formation after the election');
  // The cabinet of experts tolerated by PPS has no such threshold.
  const Q = chamber({ pps: 50, psl_wyzwolenie: 50, psl_piast: 65, npr: 19, pschd: 40, zln: 120, minorities_bloc: 90, other: 10 }, { time: 11, year: 1922, month: 11 });
  formation(Q);
  assert.equal(gov.configurationStatus(Q, 'expert', Q.S.negotiation.context).available, true);
  assert.equal(Q.S.negotiation.draft.configuration_id, 'expert', 'the default offer after the election is the tolerated expert');
});
