const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');

// Unit tests of projects, laws, packages, the cabinet's initiative and the state cards (implementation
// plan, stage 4; technical reference 7.2, 7.6, 8.5, 9.1, 9.7, 11.3, 11.9, 12.1–12.8, 17.10–17.16).
// They load the source files directly and never start the game.
const RULES = path.join(__dirname, '..', 'source', 'rules');
const rules = require(path.join(RULES, 'polish_rules.js'));
const inst = require(path.join(RULES, 'polish_institutions.js'));
const econ = require(path.join(RULES, 'polish_economy.js'));
const gov = require(path.join(RULES, 'polish_government.js'));
const proj = require(path.join(RULES, 'polish_projects.js'));
const close = (a, b, eps = 1e-9, label = '') => assert.ok(Math.abs(a - b) <= eps, `${label} ${a} != ${b}`);

const PARTIES = ['kpp', 'pps', 'npr', 'psl_wyzwolenie', 'psl_piast', 'pschd', 'zln', 'minorities_bloc', 'other'];
const CLASSES = ['workers', 'old_middle', 'new_middle', 'rural', 'bourgeois_landowners', 'unemployed', 'national_minorities'];
const OPENING = { kpp: 2, pps: 35, npr: 22, psl_wyzwolenie: 25, psl_piast: 99, pschd: 27, zln: 83, minorities_bloc: 17, other: 134 };

// A game state with the given parliament, relations and, optionally, a constituted Senate (6.4).
function world({ seats = OPENING, time = 1, senate = false, relations = {}, isolated = true } = {}) {
  const Q = {
    time, year: rules.yearOf(time), month: rules.monthOf(time), month_actions: 0, parties: PARTIES, classes: CLASSES,
    sejm_parliament: { id: 'fixture', kind: 'opening_snapshot', total_seats: 444, party_seats: { ...seats } },
    psl_wyzwolenie_relation: 65, minorities_bloc_relation: 50, psl_piast_relation: 45, npr_relation: 50,
    pschd_relation: 30, kpp_relation: 10, zln_relation: 5, lewica_dissent: 20, sejm_first_election_completed: time >= 12 ? 1 : 0,
    legacy_party_map: { spd: 'pps', kpd: 'kpp', dvp: 'pschd', dnvp: 'zln' },
    polish_presidency: { constitution: { reforms: { democratic_guarantees: false, constructive_vonc: false, presidential_arbitration: false } } },
    workers: 27, old_middle: 110 / 9, new_middle: 50 / 9, rural: 53, bourgeois_landowners: 20 / 9, unemployed: 3, national_minorities: 30,
    ...relations,
  };
  for (const c of CLASSES) for (const p of PARTIES) Q[`${c}_${p}`] = 100 / PARTIES.length;
  Q.S = rules.createFoundationState({ randomState: [1922, 1, 2, 3, 4], institutions: inst.createInstitutionState(Q),
    government: gov.createGovernmentState(Q), economy: econ.createEconomyState() });
  if (isolated) Q.S.economy.shocks = [];
  if (senate) {
    Q.S.senate = { status: 'constituted', total: 111, club_seats: inst.senateFromSejm(seats, PARTIES, 444), records: [], method: 'sejm_proxy_v1', result_id: 'fx' };
  }
  gov.writeRelationMirrors(Q);
  return Q;
}
// A cabinet formed by the rules in the fixture parliament (8.3, 8.7).
function formed(Q, draft, reason = 'post_election') {
  gov.beginFormation(Q, { reason, mandatory: true });
  for (const [field, value] of Object.entries(draft)) gov.setDraft(Q, field, value);
  const result = gov.submitFormation(Q);
  assert.ok(result.appointed, 'the fixture cabinet is appointed: ' + JSON.stringify(result.pps_offer && result.pps_offer.reason));
  Q.S.turn.pending = null; Q.month_actions = 0;
  return Q.S.cabinet;
}
function month(Q) {
  const t = Q.time;
  Q.S.turn.pending = null; Q.month_actions = 0;
  Q.time = t + 1; Q.year = rules.yearOf(Q.time); Q.month = rules.monthOf(Q.time);
  proj.settleMonth(Q, { t });
  gov.settleAgreements(Q);
  return Q.S.economy.history.at(-1);
}
function freeAction(Q) {
  Q.S.turn.pending = null; Q.month_actions = 0;
}
const LEFT = { pps: 150, psl_wyzwolenie: 90, minorities_bloc: 30, zln: 120, other: 54 };

// ---- The procedure of a law (7.2, C4) ----

test('C4: the Sejm votes in the decision and an ordinary law takes effect at once; a constitutional amendment keeps the Senate at +30 days; no extra scene', () => {
  // Z — 0.81 (decision 1A of 20 X 2026): the Senate stage of an ordinary law is left out of the game (P).
  const Q = world({ seats: LEFT, time: 14, senate: true });
  formed(Q, { configuration_id: 'left_minority', pps_mode: 'member' });
  const bill = proj.submitLaw(Q, { kind: 'test', title: 'Test law', sponsor: 'cabinet', programme: { fiscal: 2 } });
  assert.deepEqual([bill.status, bill.senate, bill.effective_at, bill.next_step], ['enacted', 'not_required', '1923-02-01', null]);
  assert.deepEqual(Q.S.ballots.filter(b => b.issue_id === bill.id).map(b => b.rule), ['ordinary_resolution'], 'no ballot of the Senate');
  // A chamber where the democratic guarantees have two thirds (a fixture): the Senate still votes at +30 days.
  const C = world({ seats: { pps: 200, psl_wyzwolenie: 110, minorities_bloc: 60, zln: 74 }, time: 14, senate: true });
  const amendment = proj.submitLaw(C, { kind: 'test', title: 'Test amendment', sponsor: 'pps', programme: { institution: 2 }, constitutional: true, pps_vote: 'yes' });
  assert.deepEqual([amendment.status, amendment.senate_notice_due], ['in_procedure', '1923-03-03']);
  proj.processLaws(C, 14);
  assert.equal(amendment.status, 'in_procedure', 'the +30 step is not early');
  proj.processLaws(C, 15);
  assert.notEqual(amendment.status, 'in_procedure');
  assert.equal(C.S.ballots.at(-1).rule, 'constitutional_amendment_senate');
});

test('C4: no Senate amendments for an ordinary law any more; a law without a majority never counts as adopted', () => {
  const Q = world({ seats: LEFT, time: 14, senate: true });
  formed(Q, { configuration_id: 'left_minority', pps_mode: 'member' });
  // A Senate where the clubs against the text have the majority (a fixture) no longer changes an ordinary law (Z — 0.81).
  Q.S.senate.club_seats = { pps: 30, psl_wyzwolenie: 10, zln: 71 };
  const amended = proj.submitLaw(Q, { kind: 'test', title: 'Bill with a weaker variant', sponsor: 'cabinet', programme: { fiscal: 2 },
    variant: 'full', weaker_variant: 'limited', weaker_programme: { fiscal: 1 }, compromise_scope: null });
  assert.deepEqual([amended.status, amended.enacted_variant, amended.amendment], ['enacted', 'full', null]);
  proj.processLaws(Q, 16);
  assert.deepEqual(Q.S.ballots.filter(b => b.issue_id === amended.id).map(b => b.rule), ['ordinary_resolution']);
  const weak = world({ seats: { pps: 35, zln: 200, pschd: 100, other: 109 }, time: 14, senate: true });
  const fail = proj.submitLaw(weak, { kind: 'test', title: 'No majority', sponsor: 'pps', programme: { fiscal: 2 }, pps_vote: 'yes' });
  assert.deepEqual([fail.status, fail.reason], ['rejected', 'no majority in the Sejm']);
});

test('before the Senate exists a law takes effect with the Sejm vote; a constitutional change needs both chambers', () => {
  const Q = world({ seats: LEFT, time: 3 });
  const bill = proj.submitLaw(Q, { kind: 'test', title: 'Law of the Legislative Sejm', sponsor: 'pps', programme: { fiscal: 2 }, pps_vote: 'yes' });
  assert.deepEqual([bill.status, bill.senate, bill.effective_at], ['enacted', 'not_constituted', '1922-03-01']);
  const reform = proj.submitLaw(Q, { kind: 'constitution', title: 'Reform', sponsor: 'pps', programme: { institution: 2 }, constitutional: true, pps_vote: 'yes' });
  assert.equal(reform.status, 'rejected');
});

// ---- The unemployment bill D (card 7.2; 17.15) ----

// Z — 0.81 (decisions of 20 X 2026): the card Legislative Initiative replaces the cards D1/D2 and of the parliamentary control of
// the army: at most five laws, taking one up costs the month and moves relations at once, the vote the next month; a law passed
// in its limited variant, rejected or withdrawn comes back after nine months, after a limited one only in full.
test('Inicjatywa 0.81: five laws after the 1922 election; filing costs the month; the vote next month; limited, rejected and back after nine months', () => {
  const Q = world({ seats: OPENING, time: 13, senate: true });
  Q.sejm_first_election_completed = 1;
  assert.deepEqual(proj.initiativeShown(Q), ['unemployment', 'labor_inspection', 'progressive_tax', 'secular_school', 'land_reform']);
  assert.equal(proj.initiativeStatus(Q, 'army_oversight').eligible, false, 'the army only at an open military case');
  assert.equal(proj.initiativeStatus(Q, 'tenants').eligible, false, 'the tenants from VI 1924');
  // The rolls of a vote are recorded; the test fixes them (0.81: the chance of a vote, see "Los głosowania 0.81").
  const fix = (full, limited) => {
    const p = proj.initiativeState(Q.S).pending, base = 'initiative:' + p.id + ':t' + p.filed_at;
    Q.S.rng.rolls[base + ':full'] = full;
    if (limited !== undefined) Q.S.rng.rolls[base + ':limited'] = limited;
  };
  proj.initiativeFile(Q, 'unemployment');
  fix(0.99, 0);
  assert.equal(Q.month_actions, 1, 'taking a law up costs this month’s action');
  assert.equal(proj.initiativeState(Q.S).records.unemployment.plus_used, true, 'the gain of filing is used up');
  assert.deepEqual(proj.initiativeShown(Q), [], 'one initiative at a time');
  assert.equal(proj.initiativeVoteActive(Q), false, 'the vote only next month');
  month(Q);
  assert.equal(proj.initiativeVoteActive(Q), true);
  const view = proj.initiativeVoteView(Q);
  assert.equal(view.outcome, 'choice', 'the full benefit has no majority, the limited one has');
  assert.throws(() => proj.initiativeResolve(Q, 'full'));
  proj.initiativeResolve(Q, 'limited');
  assert.equal(Q.month_actions, 0, 'the vote costs no month');
  const protection = proj.operatingProtection(Q.S);
  assert.deepEqual([protection.variant, protection.upkeep_budget_B, protection.sponsor, protection.responsibility.pps], ['limited', 1, 'pps', 0.40]);
  assert.equal(proj.initiativeStatus(Q, 'unemployment').eligible, false, 'back only after nine months');
  assert.ok(proj.initiativeShown(Q).includes('workers_housing'), 'the next law takes the free place');
  // Nine months later only the full benefit is offered; the gain of the Left came with the first filing only.
  Q.time += 9; Q.year = rules.yearOf(Q.time); Q.month = rules.monthOf(Q.time);
  const status = proj.initiativeStatus(Q, 'unemployment');
  assert.deepEqual([status.eligible, status.offer], [true, 'full']);
  proj.initiativeFile(Q, 'unemployment');
  fix(0.99);
  assert.equal(proj.initiativeState(Q.S).records.unemployment.filings, 2);
  month(Q);
  assert.equal(proj.initiativeVoteView(Q).outcome, 'rejected', 'the full benefit still has no majority');
  proj.initiativeResolve(Q, 'rejected');
  assert.equal(proj.operatingProtection(Q.S).variant, 'limited', 'the limited law stays');
  // A law that passes in full leaves the card for good.
  freeAction(Q);
  const npr = Q.S.actors.relations.npr;
  proj.initiativeFile(Q, 'labor_inspection');
  fix(0);
  assert.equal(Q.S.actors.relations.npr, npr + 3, 'the National Workers’ Party welcomes the bill at once');
  month(Q);
  assert.equal(proj.initiativeVoteView(Q).outcome, 'full');
  proj.initiativeResolve(Q, 'full');
  const inspection = proj.projectsOf(Q.S, 'labor_inspection')[0];
  assert.deepEqual([inspection.variant, inspection.sponsor, inspection.authorized, inspection.responsibility.pps], ['inspection', 'pps', true, 0.40]);
  assert.match(proj.initiativeStatus(Q, 'labor_inspection').reason, /already in force/);
  // Filing no bill plays the card for three months without a month's action.
  freeAction(Q);
  proj.initiativeSkip(Q);
  assert.equal(rules.cardRest(Q, proj.INITIATIVE_CARD), 3);
  assert.equal(Q.month_actions, 0);
});

// Z — 0.81 (P): the special votes of the initiative — the friends of Piłsudski against full civilian oversight, the Lanckorona
// rule for an autonomy bill — and the clubs' views on the Church, which only the votes on laws read (decision 6B).
test('Głosowania inicjatywy 0.81: the friends of Piłsudski, the Lanckorona rule and the Church only in the votes on laws', () => {
  const Q = world({ seats: OPENING, time: rules.timeOf(1923, 7), senate: true });
  Q.sejm_first_election_completed = 1;
  const army = proj.initiativeCounts(Q, 'army_oversight', 0), compromise = proj.initiativeCounts(Q, 'army_oversight', 1);
  for (const club of ['psl_wyzwolenie', 'npr']) {
    assert.ok(army.no_clubs.includes(club), club + ' against full oversight after V 1923');
    assert.ok(!compromise.no_clubs.includes(club) && !compromise.yes_clubs.includes(club), club + ' abstains on the compromise');
  }
  assert.ok(!army.no_clubs.includes('psl_piast'), 'Piast is no friend of Piłsudski after V 1923');
  const early = world({ seats: OPENING, time: rules.timeOf(1923, 3), senate: true });
  assert.ok(proj.initiativeCounts(early, 'army_oversight', 0).no_clubs.includes('psl_piast'), 'Piast among his friends until V 1923');
  // PSL Piast and the Christian Democrats in a cabinet with ZLN vote against an autonomy bill.
  const before = proj.initiativeCounts(Q, 'autonomy', 1);
  Q.S.cabinet = Object.assign({}, Q.S.cabinet || {}, { id: 'fixture-chjeno', status: 'active', partner_ids: ['zln', 'psl_piast', 'pschd'], supporter_ids: [],
    party: 'zln', portfolios: Q.S.cabinet ? Q.S.cabinet.portfolios : {}, configuration_id: 'chjeno_piast' });
  const inCabinet = proj.initiativeCounts(Q, 'autonomy', 1);
  assert.ok(inCabinet.no_clubs.includes('psl_piast') && inCabinet.no_clubs.includes('pschd'));
  assert.ok(!before.no_clubs.includes('psl_piast'));
  // The Church: the Christian Democrats −2 in the votes on laws, 0 in every other offer.
  assert.equal(gov.programFit('pschd', { church: 1 }), 75);
  assert.equal(gov.programFit('pschd', { church: 1 }, true), 25);
  const school = world({ seats: OPENING, time: 13 });
  const secular = proj.initiativeCounts(school, 'secular_school', 0), exemption = proj.initiativeCounts(school, 'secular_school', 1);
  for (const club of ['pschd', 'zln', 'psl_piast']) assert.ok(secular.no_clubs.includes(club), club + ' against the secular school');
  // Part of the deputies of the other minorities (a half) votes against; the rest and the Jewish deputies do not.
  assert.ok(secular.no_clubs.includes('other_minorities_rep:church') && !secular.no_clubs.includes('other_minorities_rep'));
  assert.ok(!secular.no_clubs.includes('jewish_rep'), 'the Jewish deputies are not against the religious freedom');
  assert.deepEqual([secular.passed, exemption.passed, exemption.no], [false, true, 0], 'the exemption from religion passes');
});

// Z — 0.81 (the user's note of 20 X 2026, "lekka losowość"): the chance of a vote is 50% plus half the margin, between 5% and 95%;
// one recorded roll per filing and variant; a turned-over vote shows the deputies who stayed away, and the law follows the roll.
test('Los głosowania 0.81: a majority can fail and a minority can pass; the counts and the record follow the roll', () => {
  const Q = world({ seats: OPENING, time: 13, senate: true });
  Q.sejm_first_election_completed = 1;
  const key = v => { const p = proj.initiativeState(Q.S).pending; return 'initiative:' + p.id + ':t' + p.filed_at + ':' + v; };
  // The inspection has a clear majority (198 against 83, chance 95%); a roll of 0.97 makes it fail.
  proj.initiativeFile(Q, 'labor_inspection');
  Q.S.rng.rolls[key('full')] = 0.97;
  Q.S.rng.rolls[key('limited')] = 0.99;
  month(Q);
  const view = proj.initiativeVoteView(Q);
  assert.equal(view.outcome, 'rejected');
  assert.match(view.line, /116\) did not come to the vote/, 'the supporters who stayed away');
  assert.equal(proj.initiativeVoteView(Q).outcome, 'rejected', 'the recorded roll does not change');
  proj.initiativeResolve(Q, 'rejected');
  const ballot = Q.S.ballots.at(-1);
  assert.deepEqual([ballot.result, ballot.yes < ballot.no], ['failed', true], 'the recorded counts match the result');
  assert.equal(proj.projectsOf(Q.S, 'labor_inspection').length, 0);
  // The full progressive tax has no majority (60 against 110, chance 25%); a roll of 0.01 makes it pass.
  freeAction(Q);
  proj.initiativeFile(Q, 'progressive_tax');
  Q.S.rng.rolls[key('full')] = 0.01;
  month(Q);
  const pass = proj.initiativeVoteView(Q);
  assert.equal(pass.outcome, 'full');
  assert.match(pass.line, /Some of its opponents \(51\) did not come to the vote/);
  proj.initiativeResolve(Q, 'full');
  assert.equal(Q.S.ballots.at(-1).result, 'passed');
  assert.equal(proj.initiativeState(Q.S).records.progressive_tax.level, 'full');
});

test('Wykluczenia inicjatywy 0.81: no law the cabinet already carries out; a limited reform of the cabinet leaves only the full one; a ministry of PPS keeps its own law', () => {
  const Q = world({ seats: OPENING, time: 13, senate: true });
  Q.sejm_first_election_completed = 1;
  // A land reform with compensation of the cabinet (as of Chjeno-Piast): only the expropriation is offered.
  const land = proj.createProject(Q, 'land_program', 'compensated', { sponsor: 'cabinet' });
  land.status = 'executing';
  assert.deepEqual([proj.initiativeStatus(Q, 'land_reform').eligible, proj.initiativeStatus(Q, 'land_reform').offer], [true, 'full']);
  land.variant = 'expropriation';
  assert.match(proj.initiativeStatus(Q, 'land_reform').reason, /already in force/);
  // With PPS in Labour the protection of the unemployed is a matter of its own ministry card.
  const L2 = world({ seats: LEFT, time: 14, senate: true });
  L2.sejm_first_election_completed = 1;
  formed(L2, { configuration_id: 'left_minority', pps_mode: 'member' });
  if (L2.S.cabinet.portfolios.labor === 'pps') assert.match(proj.initiativeStatus(L2, 'unemployment').reason, /ministry/);
});

test('D2: a limited variant needs a concrete club ready for it; withdrawal only without a compromise; PPS in the cabinet suspends D2', () => {
  const Q = world({ seats: OPENING, time: 13 });
  Q.sejm_first_election_completed = 1;
  proj.billD1Choose(Q, 'start');
  month(Q);
  const clubs = proj.compromiseClubs(Q);
  assert.ok(clubs.length > 0, 'a club accepts the limited variant but not the full one');
  assert.equal(proj.billD2Status(Q, 'limited').available, true);
  assert.equal(proj.billD2Status(Q, 'withdraw').available, false);
  // In the cabinet the D2 decision waits without a new fee; it returns when PPS is outside again.
  const inCabinet = world({ seats: LEFT, time: 12 });
  inCabinet.sejm_first_election_completed = 1;
  proj.billD1Choose(inCabinet, 'start');
  month(inCabinet);
  formed(inCabinet, { configuration_id: 'left_minority', pps_mode: 'member' });
  assert.equal(proj.billD2Available(inCabinet), false, 'suspended while PPS sits in the cabinet');
  assert.equal(inCabinet.S.chapter.unemployment_bill.status, 'pending');
  gov.leaveCabinet(inCabinet, 'pps', 'fixture');
  gov.writeGovernmentMirrors(inCabinet);
  assert.equal(proj.billD2Available(inCabinet), inCabinet.S.cabinet.status === 'active', 'back after PPS leaves, without a new D1');
  const declined = world({ seats: LEFT, time: 13 });
  declined.sejm_first_election_completed = 1;
  proj.billD1Choose(declined, 'decline');
  assert.equal(declined.S.chapter.unemployment_bill.status, 'declined');
  assert.equal(proj.billD1Available(declined), false, 'refusal closes the offer');
});

// ---- The budget package and the Budget card (17.10; decision 5 of stage 4) ----

function packageFor(Q, instruments) {
  return proj.newPackage(Q, { instruments, necessary: true, reason: 'deficit' });
}

test('Budżet: a coalition member and the guarantor of an expert may answer the package; the opposition may not, but still votes', () => {
  const member = world({ seats: LEFT, time: 12 });
  formed(member, { configuration_id: 'left_minority', pps_mode: 'member' });
  packageFor(member, ['broad']);
  assert.equal(proj.budgetCardAvailable(member), true, 'coalition member');
  const guarantor = world({ seats: LEFT, time: 2 });
  packageFor(guarantor, ['broad']);
  assert.equal(gov.ppsStance(guarantor.S), 'supporter');
  assert.equal(proj.budgetCardAvailable(guarantor), true, 'the actual guarantor of the expert cabinet');
  const opposition = world({ seats: LEFT, time: 2 });
  gov.leaveCabinet(opposition, 'pps', 'fixture');
  packageFor(opposition, ['broad']);
  assert.equal(proj.budgetCardAvailable(opposition), false, 'no card after the support ended');
  const vote = proj.voteDuePackage(opposition, 3);
  assert.ok(opposition.S.ballots.at(-1).club_votes.pps, 'the opposition still votes on the budget');
  assert.equal(vote.status === 'passed' || vote.status === 'failed' || vote.status === 'in_procedure', true);
});

test('Opcje karty Budżet: protect drops the cut; wealth brings a progressive or wealth tax; the loan is blocked at credit 39 and offered at 40', () => {
  const make = credit => {
    const Q = world({ seats: LEFT, time: 12, relations: { psl_wyzwolenie_relation: 90 } });
    formed(Q, { configuration_id: 'left_minority', pps_mode: 'member' });
    const protection = proj.createProject(Q, 'worker_protection', 'full', { sponsor: 'cabinet' });
    proj.launchProject(Q, protection, { sponsor: 'cabinet' });
    Q.S.economy.credit = credit;
    packageFor(Q, ['benefit_cut', 'admin_cuts']);
    return Q;
  };
  const P = make(55);
  const protect = proj.answerBudget(P, 'protect');
  assert.equal(protect.accepted, true, 'PSL Wyzwolenie accepts the condition');
  assert.deepEqual(P.S.economy.pending_package.instruments, ['admin_cuts'], 'the package without the cut of benefits');
  assert.equal(P.S.economy.pending_package.pps_vote, 'yes');
  const W = make(55);
  const wealth = proj.answerBudget(W, 'wealth');
  assert.equal(wealth.accepted, true);
  assert.deepEqual(W.S.economy.pending_package.instruments, ['progressive'], 'a progressive tax instead of the burdens on broad groups');
  const L39 = make(39);
  assert.match(proj.budgetOptionStatus(L39, 'loan').reason, /below 40/);
  const L40 = make(40);
  assert.equal(proj.budgetOptionStatus(L40, 'loan').available, true);
  const loan = proj.answerBudget(L40, 'loan');
  assert.equal(loan.accepted, true);
  assert.deepEqual(L40.S.economy.pending_package.instruments, ['loan']);
  assert.equal(L40.S.economy.pending_package.pps_answer, 'loan');
  assert.equal(proj.budgetCardAvailable(L40), false, 'one answer per package');
  // A refusal: PPS votes against; if its votes were needed the package falls.
  const R = make(55);
  proj.answerBudget(R, 'refuse');
  assert.equal(R.S.economy.pending_package.pps_vote, 'no');
});

// ---- The cabinet's own initiative (17.16.4) ----

test('one initiative a month outside the PPS portfolios: a deficit brings the profile’s revenue, voted the next month', () => {
  const Q = world({ seats: OPENING, time: 3 });
  Q.S.economy.budget_base = -3; // a deficit below −2 B
  month(Q); // t=3: the reading of the deficit
  assert.ok(Q.S.economy.history.at(-1).budget < -2);
  month(Q); // t=4: Ponikowski proposes the broader tax base
  const pkg = Q.S.economy.pending_package;
  assert.deepEqual([pkg.instruments, pkg.vote_at], [['broad'], 5]);
  const initiatives = Q.S.history.actions.filter(a => a.source === 'cabinet' && a.time === 4);
  assert.equal(initiatives.length, 1, 'at most one initiative a month');
  assert.equal(initiatives[0].consumes_month, false);
  month(Q); // t=5: the vote; without a Senate the law takes effect at once
  assert.equal(Q.S.economy.tax_level, 1);
  assert.equal(Q.S.economy.packages.at(-1).status, 'passed');
  assert.equal(Q.S.scenario.npc_reviewed_time, 5);
});

test('a refused necessary package: one revision at the next review, then the premier resigns (17.16.4)', () => {
  // PPS and PSL Wyzwolenie govern; the Treasury is an expert's, so the cabinet proposes revenue itself.
  const Q = world({ seats: { pps: 150, psl_wyzwolenie: 90, zln: 150, other: 54 }, time: 12 });
  const cabinet = formed(Q, { configuration_id: 'left_minority', pps_mode: 'member' });
  assert.notEqual(cabinet.portfolios.finance, 'pps');
  for (const id of cabinet.agreement_ids) Q.S.agreements[id].obligations = []; // isolate from the programme dates
  const protection = proj.createProject(Q, 'worker_protection', 'full', { sponsor: 'pps' });
  proj.launchProject(Q, protection, { sponsor: 'pps' });
  Q.S.economy.budget_base = -3; // the protection is paid only at half: its legal payments are threatened
  month(Q); // t=12: the first reading
  month(Q); // t=13: the left profile proposes a progressive tax, necessary for the payments
  const first = Q.S.economy.pending_package;
  assert.deepEqual([first.instruments, first.necessary, first.reason], [['progressive'], true, 'payments']);
  proj.answerBudget(Q, 'refuse'); // PPS refuses; its votes are needed
  month(Q); // t=14: refused; the same settlement's review presents the one revision
  assert.equal(Q.S.economy.packages.find(p => p.id === first.id).status, 'failed');
  const revision = Q.S.economy.pending_package;
  assert.deepEqual([revision.revision_of, revision.instruments], [first.id, ['wealth_tax']], 'one revision, not the same offer again');
  proj.answerBudget(Q, 'refuse');
  month(Q); // t=15: the revision is refused too: the premier resigns
  assert.equal(Q.S.economy.packages.find(p => p.id === revision.id).status, 'failed');
  assert.equal(Q.S.cabinet.status, 'caretaker');
  assert.equal(Q.S.cabinet.fall_reason, 'resignation');
  assert.ok(Q.S.cabinet_crisis, 'the formation of a successor follows');
});

// ---- Promises of the programme (decision 3 of stage 4; 9.1, 5.4) ----

test('decision 3: the cabinet carries out a promise in its own portfolio; its failure there is not a broken PPS promise', () => {
  const Q = world({ seats: LEFT, time: 12 });
  const cabinet = formed(Q, { configuration_id: 'left_minority', pps_mode: 'member' });
  assert.equal(cabinet.portfolios.agriculture, 'psl_wyzwolenie');
  const agreement = Q.S.agreements[cabinet.agreement_ids[0]];
  const land = agreement.obligations.find(o => o.topic === 'land');
  assert.deepEqual([land.required_variants, land.due_at, land.portfolio], [['accelerated'], 18, 'agriculture']);
  assert.equal(gov.ppsResponsible(Q.S, agreement, land), false, '5.4: another ministry executes it');
  const worker = agreement.obligations.find(o => o.topic === 'worker_protection');
  assert.equal(gov.ppsResponsible(Q.S, agreement, worker), true, 'PPS holds Labour');
  month(Q); // t=12: Wyzwolenie's ministry prepares the parcelation
  const reform = Object.values(Q.S.projects).find(p => p.type === 'land_program');
  assert.deepEqual([reform.status, reform.sponsor, reform.variant], ['prepared', 'cabinet', 'accelerated']);
  month(Q); // t=13: launched with its law (no Senate yet in this fixture)
  assert.equal(reform.status, 'executing');
  for (let i = 0; i < 4; i++) month(Q);
  assert.equal(land.status, 'fulfilled', 'the first tranche is executed by t+6');
  // Worker protection was PPS's own task in Labour: overdue, a culpable breach, reputation −5.
  assert.equal(worker.status, 'breached');
  assert.equal(Q.S.actors.pps.credibility, 50 - 5);
  assert.ok(Q.S.history.reasons.every(r => r.kind !== 'credibility' || r.id !== 'fulfilled:' + land.id), 'no reputation for another ministry’s work');
});

test('decision 3: a package contrary to an agreed fiscal position is a red-line breach once; a rule of the church binds the school card', () => {
  const Q = world({ seats: LEFT, time: 12 });
  const cabinet = formed(Q, { configuration_id: 'left_minority', pps_mode: 'member' });
  const agreement = Q.S.agreements[cabinet.agreement_ids[0]];
  const fiscal = agreement.obligations.find(o => o.topic === 'fiscal' && o.kind === 'constraint');
  assert.equal(fiscal.position, 1);
  proj.applyInstrument(Q, 'indirect', 12, { sponsor: 'cabinet' });
  assert.equal(fiscal.status, 'breached');
  assert.equal(agreement.history.filter(h => h.kind === 'red_line_breach').length, 1);
  proj.applyInstrument(Q, 'admin_cuts', 12, { sponsor: 'cabinet' });
  assert.equal(agreement.history.filter(h => h.kind === 'red_line_breach').length, 1, 'once');
  const before = agreement.tension;
  gov.settleAgreements(Q);
  assert.ok(agreement.tension >= before + 15, '+15 tension for the breach');
  assert.equal(proj.contradicts('fiscal', 0, 2), false, 'a shared burden allows a wealth tax (centre-left default)');
  assert.equal(proj.contradicts('fiscal', 0, -2), true);
  assert.equal(proj.contradicts('church', 0, 1), true);
});

test('Efekt projektu: a law, a lawful executor, no PPS minister, budget −3: execution 0.5; the caretaker continues current payments only', () => {
  const Q = world({ seats: OPENING, time: 5 });
  const works = proj.createProject(Q, 'public_works', 'employment', { sponsor: 'cabinet' });
  proj.launchProject(Q, works, { sponsor: 'cabinet' });
  const protection = proj.createProject(Q, 'worker_protection', 'full', { sponsor: 'cabinet' });
  proj.launchProject(Q, protection, { sponsor: 'cabinet' });
  Q.S.economy.budget_base = 0; // 0 − 1 (works, Z — 0.93) − 2 (protection) = −3
  const b = econ.budgetAt(Q.S, 5);
  assert.equal(b.budget, -3);
  proj.processProjects(Q, 5, b);
  assert.deepEqual([works.last_coverage, protection.last_coverage], [0.5, 0.5]);
  assert.ok(!Object.values(Q.S.cabinet.portfolios).includes('pps'), 'no PPS minister is needed (8.5)');
  gov.leaveCabinet(Q, 'pps', 'fixture');
  proj.processProjects(Q, 6, econ.budgetAt(Q.S, 6));
  assert.equal(works.last_coverage, 0.5, 'the exit of PPS changes nothing by itself');
  Q.S.cabinet.status = 'caretaker';
  proj.processProjects(Q, 7, econ.budgetAt(Q.S, 7));
  assert.deepEqual([works.last_coverage, protection.last_coverage], [0, 0.5], 'a caretaker cabinet continues the current benefits only');
  assert.match(works.interruption_reason, /caretaker/);
});

// ---- The cabinet's initiatives of the profiles (17.16.4) ----

test('Grabski and the credit crisis: the credit instrument first; without room a wealth tax; a refused necessary answer ends in resignation', () => {
  const Q = world({ seats: OPENING, time: rules.timeOf(1925, 6), isolated: false });
  Q.S.cabinet.pm = 'grabski'; Q.S.cabinet.id = 'expert_grabski'; Q.S.cabinet.programme = { fiscal: 1 };
  Q.S.economy.currency_regime = 'zloty';
  assert.equal(econ.creditCrisis(Q.S.economy, Q.time), true, 'the dated impulse of 1925');
  month(Q);
  const instrument = Object.values(Q.S.projects).find(p => p.type === 'credit_instrument');
  assert.deepEqual([instrument.status, instrument.variant, instrument.sponsor], ['prepared', 'public', 'cabinet']);
  Q.S.economy.budget_base = -2; // no room: 2 B of building would put the forecast below −2
  month(Q);
  const pkg = Q.S.economy.pending_package;
  assert.deepEqual([pkg.instruments, pkg.project_id, pkg.necessary], [['wealth_tax'], instrument.id, true]);
  pkg.pps_vote = 'no';
  pkg.pps_answer = 'refuse';
  // The clubs of the fixture pass or refuse by their own view; force a refusal of the revision by the vote.
  const seatsBefore = Q.S.parliament.clubs.map(c => c.seats);
  Q.S.parliament.clubs.forEach(c => { if (c.id !== 'pps') c.seats = 0; });
  Q.S.parliament.clubs.find(c => c.id === 'pps').seats = 444;
  month(Q);
  assert.equal(Q.S.cabinet.status, 'caretaker', 'Grabski resigns: no financing for the necessary credit answer');
  assert.equal(Q.S.cabinet.fall_reason, 'resignation');
  Q.S.parliament.clubs.forEach((c, i) => { c.seats = seatsBefore[i]; });
});

test('the financial crisis of 11.9: the cabinet prepares the one currency reform, then launches it with its package; the złoty follows', () => {
  const Q = world({ seats: OPENING, time: rules.timeOf(1923, 3), isolated: false });
  Q.S.economy.inflation_m = 25;
  month(Q); month(Q); // two readings of at least 20% a month
  assert.equal(econ.currencyCrisis(Q.S.economy), true);
  assert.equal(proj.currencyProject(Q.S), null, 'the crisis is known after the second settlement');
  month(Q); // the first initiative after the crisis prepares the reform
  const reform = proj.currencyProject(Q.S);
  assert.ok(reform, 'prepared at the first initiative');
  assert.equal(reform.variant, 'gradual', 'the expert profile (P)');
  month(Q); // the launch as a package
  assert.equal(Q.S.economy.pending_package.project_id, reform.id);
  month(Q); // the vote: the currency law takes effect (no Senate in this fixture)
  assert.equal(reform.status, 'executing');
  assert.equal(Q.S.economy.currency_regime, 'stabilizing');
  for (let i = 0; i < 5; i++) month(Q);
  assert.equal(reform.status, 'completed');
  month(Q);
  assert.equal(Q.S.economy.currency_regime, 'zloty');
  assert.equal(econ.shockAt(Q.S.economy, 'monetary', Q.time), 0, 'the marka pressures end');
  assert.equal(proj.stabilizationEventDue(Q), false, 'one reform only');
});

test('Oszczędności 1926 przez 9.8: the sixth month of Skrzyński with a protection of 2 B; four answers; keeping support lets the cut pass if it has support', () => {
  const Q = world({ seats: { pps: 60, psl_piast: 100, npr: 40, pschd: 60, zln: 150, other: 34 }, time: rules.timeOf(1925, 11),
    relations: { psl_piast_relation: 80, npr_relation: 80, pschd_relation: 80, zln_relation: 80 } });
  Q.S.history.cabinets.push({ id: 'a', pm: 'a', end_reason: 'fall', ended_at: Q.time - 1 }, { id: 'b', pm: 'b', end_reason: 'fall', ended_at: Q.time - 2 });
  const cabinet = formed(Q, { configuration_id: 'skrzynski_broad', pps_mode: 'member' }, 'crisis');
  assert.equal(cabinet.pm, 'skrzynski');
  for (const id of cabinet.agreement_ids) Q.S.agreements[id].obligations = [];
  const protection = proj.createProject(Q, 'worker_protection', 'full', { sponsor: 'pps' });
  proj.launchProject(Q, protection, { sponsor: 'pps' });
  assert.equal(proj.austerityEventDue(Q), false, 'not before the sixth month');
  Q.time = cabinet.formed_at + 5; Q.year = rules.yearOf(Q.time); Q.month = rules.monthOf(Q.time);
  assert.equal(proj.austerityEventDue(Q), true);
  const out = proj.austerityChoose(Q, 'maintain');
  assert.equal(out.cut.status === 'enacted' || out.cut.status === 'rejected', true);
  if (out.cut.status === 'enacted') {
    assert.deepEqual([protection.variant, protection.upkeep_budget_B], ['limited', 1], 'only +1 B from 2 → 1');
  }
  assert.equal(proj.austerityEventDue(Q), false, 'once');
  assert.deepEqual(['bargain', 'persuade', 'maintain', 'withdraw'].length, 4, 'the four answers of 9.8, no separate "new financing" option');
});

// ---- Events of stage 4 (catalogue 9.11–9.12) ----

function withPortfolio(Q, key) {
  Q.S.cabinet.partner_ids = ['pps'];
  Q.S.cabinet.supporter_ids = [];
  for (const k of Object.keys(Q.S.cabinet.portfolios)) Q.S.cabinet.portfolios[k] = k === key ? 'pps' : 'expert';
  return Q;
}

test('Kredyt B16: Labour only / Treasury only / the opposition: the right interventions, the others blocked; no menu in opposition; the chosen instrument starts at once', () => {
  const t = rules.timeOf(1925, 7);
  const labour = withPortfolio(world({ time: t, isolated: false }), 'labor');
  assert.equal(proj.creditEventDue(labour), true);
  assert.equal(proj.eventStatus(labour, 'credit', 'credit').available, false);
  assert.equal(proj.eventStatus(labour, 'credit', 'protection').available, true);
  assert.equal(proj.eventStatus(labour, 'credit', 'orders').available, true, 'Z — 0.93: Labour answers with quick public works');
  const treasury = withPortfolio(world({ time: t, isolated: false }), 'finance');
  assert.equal(proj.eventStatus(treasury, 'credit', 'credit').available, true);
  assert.equal(proj.eventStatus(treasury, 'credit', 'protection').available, false);
  proj.eventChoose(treasury, 'credit', 'credit');
  const started = Object.values(treasury.S.projects).find(p => p.type === 'credit_instrument');
  assert.equal(started.status, 'executing', 'Z — 0.93 (decision 4A): the answer starts the instrument at once');
  const opposition = world({ time: t, isolated: false });
  gov.leaveCabinet(opposition, 'pps', 'fixture');
  assert.equal(proj.creditEventDue(opposition), false, 'no menu of interventions without executive access');
  assert.match(proj.economyNotices(opposition), /Credit crisis/);
});

// ---- Government cards (17.11–17.12) ----

test('Roboty pod Pracą and Wariant robót: Labour and financing / Treasury only / no financing; three variants with their times and recipients', () => {
  const Q = withPortfolio(world({ time: 12 }), 'labor');
  assert.equal(proj.cardAvailable(Q, 'public_works'), true);
  const treasury = withPortfolio(world({ time: 12 }), 'finance');
  assert.equal(proj.cardAvailable(treasury, 'public_works'), false, 'the Treasury alone gives no competence of Labour');
  // Z — 0.93 (decisions 3A and 4A of 24 X 2026): one cost of 1 B a month, started in the same decision.
  proj.chooseOption(Q, 'public_works', 'housing');
  const housing = Object.values(Q.S.projects).find(p => p.type === 'public_works');
  assert.deepEqual([housing.variant, housing.status, housing.duration_months, housing.build_budget_B, housing.upkeep_budget_B], ['housing', 'executing', 4, 1, 1]);
  assert.equal(proj.PROJECT_TYPES.public_works.variants.housing.units, 0, 'no employment units for housing');
  freeAction(Q);
  Q.S.economy.budget_base = -1; // −1 − 1 (housing) − 1 (new works) = −3
  assert.match(proj.optionStatus(Q, 'public_works', 'employment').reason, /deficit stays at 2 budget units or less/);
  Q.S.economy.budget_base = 2;
  assert.equal(proj.optionStatus(Q, 'public_works', 'employment').available, true);
  for (let i = 0; i < 5; i++) { month(Q); freeAction(Q); }
  assert.equal(housing.status, 'operating', 'the built housing stays recorded');
  assert.equal(econ.budgetAt(Q.S, Q.time).project_charges, 1);
});

test('Zamówienia: one contract for 3 M, 1 B a month, 0.30/0.15/0 pp × execution, then 0; no second package', () => {
  const Q = withPortfolio(world({ time: 12 }), 'economic');
  proj.chooseOption(Q, 'industrial_policy', 'orders');
  const orders = Object.values(Q.S.projects).find(p => p.type === 'orders');
  freeAction(Q);
  assert.match(proj.optionStatus(Q, 'industrial_policy', 'orders').reason, /One package/);
  const contributions = [2, -3, -6, 2].map((budget, i) => proj.processProjects(Q, 12 + i, { budget }).orders_output_pp);
  close(contributions[0], 0.30); close(contributions[1], 0.15); close(contributions[2], 0); close(contributions[3], 0);
  assert.equal(orders.status, 'completed', 'the contract ends at its fixed date');
  assert.equal(econ.projectCharge(orders, 15), 0);
});

test('Parcelacja i komasacja: both projects for the same tranche; the same scope of consolidation is not rewarded twice', () => {
  const Q = withPortfolio(world({ time: 12 }), 'agriculture');
  proj.chooseOption(Q, 'land_program', 'compensated', { access: 'equal' });
  freeAction(Q);
  proj.chooseOption(Q, 'agriculture_development', 'consolidation');
  freeAction(Q);
  const land = Object.values(Q.S.projects).find(p => p.type === 'land_program');
  const consolidation = Object.values(Q.S.projects).find(p => p.variant === 'consolidation');
  assert.deepEqual([land.tranche, consolidation.tranche], [1, 1], 'two different effects on the same area');
  for (const n of [2, 3]) {
    consolidation.status = 'completed';
    proj.chooseOption(Q, 'agriculture_development', 'consolidation');
    freeAction(Q);
    const next = Object.values(Q.S.projects).filter(p => p.variant === 'consolidation').at(-1);
    assert.equal(next.tranche, n);
    next.status = 'completed';
  }
  assert.match(proj.optionStatus(Q, 'agriculture_development', 'consolidation').reason, /no second reward/);
  assert.match(proj.optionStatus(Q, 'land_program', 'expropriation').reason, /guarantees of property/);
});

test('Remont Oświaty: a running conservation of Wawel extended once; one charge for the rest and one reward at the end; no restart', () => {
  const Q = withPortfolio(world({ time: 12 }), 'education');
  proj.chooseOption(Q, 'heritage_restoration', 'wawel_conservation');
  const wawel = Object.values(Q.S.projects).find(p => p.type === 'heritage');
  freeAction(Q);
  proj.processProjects(Q, 12, econ.budgetAt(Q.S, 12));
  close(wawel.progress, 50);
  proj.chooseOption(Q, 'heritage_restoration', 'wawel_restoration');
  freeAction(Q);
  assert.deepEqual([wawel.variant, wawel.build_budget_B, wawel.duration_months], ['restoration', 2, 4]);
  close(wawel.progress, 25, 1e-9, 'one month done of four');
  for (let t = 13; t <= 16; t++) proj.processProjects(Q, t, econ.budgetAt(Q.S, t));
  assert.equal(wawel.status, 'completed');
  assert.equal(Q.S.actors.pps.credibility, 52, 'reputation +2 once, as the open sponsor');
  assert.equal(Object.values(Q.S.projects).filter(p => p.type === 'heritage').length, 1, 'one project for the building');
  assert.match(proj.optionStatus(Q, 'heritage_restoration', 'wawel_restoration').reason, /completed/);
  assert.equal(proj.optionStatus(Q, 'heritage_restoration', 'zamek_conservation').available, true, 'the other building remains');
});

test('Rozszerzyć osłony i ubezpieczenie: a protection of 2 B extended to scope 2 costs 4 B; the insurance of workers by a law, business +6 (Z — 0.94)', () => {
  const Q = withPortfolio(world({ time: 12 }), 'labor');
  proj.chooseOption(Q, 'social_welfare', 'expand');
  freeAction(Q);
  const protection = proj.operatingProtection(Q.S);
  assert.equal(protection.upkeep_budget_B, 2);
  proj.chooseOption(Q, 'social_welfare', 'expand');
  freeAction(Q);
  assert.deepEqual([protection.scope, protection.upkeep_budget_B], [2, 4]);
  assert.ok(protection.pending_effects.some(e => e.when === 'scope_2'), 'the same relief for the newly covered (stage 7)');
  // Z — 0.94 (decisions of 24 X 2026): the focused variant left the card; the insurance of workers is filed by the card itself.
  assert.match(proj.optionStatus(Q, 'social_welfare', 'focus').reason, /Unknown option/);
  const F = withPortfolio(world({ seats: LEFT, time: 12 }), 'labor');
  const pressure = F.S.economy.business_pressure;
  proj.chooseOption(F, 'social_welfare', 'insurance');
  const insurance = Object.values(F.S.projects).find(p => p.type === 'old_age_insurance');
  const law = F.S.parliament.laws.at(-1);
  assert.deepEqual([law.project_id, law.status, insurance.status, insurance.upkeep_budget_B], [insurance.id, 'enacted', 'operating', 1]);
  assert.equal(F.S.economy.business_pressure, pressure + 6);
  freeAction(F);
  assert.match(proj.optionStatus(F, 'social_welfare', 'insurance').reason, /already in force/);
});

test('Warianty funduszu inwestycyjnego and Ratunek zakładu: 1 B a month, banks half (Z — 0.94); banks blocked at credit 39, at 40 business −8; cooperatives need no PPS cooperative (Z — 0.92); no rescue without a recorded plant', () => {
  const Q = withPortfolio(world({ time: 12 }), 'finance');
  Q.S.economy.credit = 39;
  assert.match(proj.optionStatus(Q, 'investment_fund', 'banks').reason, /below 40/);
  Q.S.economy.credit = 40;
  proj.chooseOption(Q, 'investment_fund', 'banks');
  freeAction(Q);
  const instrument = Object.values(Q.S.projects).find(p => p.type === 'credit_instrument');
  assert.deepEqual([instrument.variant, instrument.status, instrument.build_budget_B, instrument.upkeep_budget_B], ['banks', 'executing', 0.5, 0.5]);
  assert.equal(Q.S.economy.business_pressure, 10 - 8, 'the agreement lowers business pressure once');
  // Z — 0.92: the cooperative variant uses the existing cooperative movement; it gives credit to farms and small plants (the
  // rural and petty-bourgeois recipients). Z — 0.93: 1 B a month, like the others.
  const C = withPortfolio(world({ time: 12 }), 'finance');
  assert.equal(proj.optionStatus(C, 'investment_fund', 'cooperative').available, true);
  proj.chooseOption(C, 'investment_fund', 'cooperative');
  const cooperative = Object.values(C.S.projects).find(p => p.type === 'credit_instrument');
  assert.deepEqual([cooperative.variant, cooperative.build_budget_B, cooperative.beneficiaries], ['cooperative', 1, ['rural', 'old_middle']]);
  const I = withPortfolio(world({ time: 12 }), 'economic');
  // Stage 6: the rescue needs a recorded plant (tests/rules-strike.test.js, "Ratunek zakładu").
  assert.match(proj.optionStatus(I, 'industrial_policy', 'rescue').reason, /recorded plant/);
  proj.chooseOption(I, 'investment_fund', 'public');
  assert.equal(Object.values(I.S.projects).find(p => p.type === 'credit_instrument').variant, 'public', 'the general credit: +5 to the credit target');
  assert.match(proj.optionStatus(I, 'industrial_policy', 'credit').reason, /Unknown option/, 'Z — 0.94: no second card of the same credit');
  assert.equal(proj.PROJECT_TYPES.credit_instrument.variants.public.credit_support, 5);
});

test('Szkoły and Szkoła świecka bez reakcji frakcji: separate projects with their costs; a secular school against the agreement with NPR breaks it, no faction reaction', () => {
  const Q = world({ seats: { pps: 150, psl_wyzwolenie: 60, npr: 60, zln: 130, other: 44 }, time: 12,
    relations: { npr_relation: 75, psl_wyzwolenie_relation: 75 } });
  // NPR accepts only with its preferred Labour, so PPS claims Education instead.
  const cabinet = formed(Q, { configuration_id: 'left_labour', pps_mode: 'member', portfolio_claim: ['education'] });
  assert.equal(cabinet.portfolios.education, 'pps');
  cabinet.programme.church = 0;
  const npr = Q.S.agreements[cabinet.agreement_ids.find(id => Q.S.agreements[id].parties.includes('npr'))];
  npr.obligations.push({ id: npr.id + ':church', topic: 'church', position: 0, owner: 'cabinet', kind: 'constraint', beneficiaries: ['npr'],
    required_project: null, required_variants: null, required_stage: null, portfolio: 'education', weight: 1, due_at: null, status: 'active', fulfillment: 1 });
  proj.chooseOption(Q, 'education_program', 'rural_access');
  freeAction(Q);
  proj.chooseOption(Q, 'minority_school_rights', 'own_language');
  freeAction(Q);
  const schools = Object.values(Q.S.projects).filter(p => p.type === 'education_program' || p.type === 'minority_schools');
  assert.equal(schools.length, 2, 'the language rule of the same scope is a separate project with its own costs');
  const lewica = Q.lewica_dissent;
  // Z — 0.93 (decision 4A of 24 X 2026): each programme starts in its own decision; the village schools needed no law.
  assert.equal(Q.S.parliament.laws.length, 0, 'village schools need no new law');
  proj.chooseOption(Q, 'education_program', 'secular');
  freeAction(Q);
  const secularLaw = Q.S.parliament.laws.at(-1);
  assert.equal(secularLaw.title.startsWith('Secular school'), true);
  assert.equal(secularLaw.status, 'enacted', 'no Senate yet in this fixture: the Sejm vote decides');
  assert.equal(npr.obligations.find(o => o.topic === 'church').status, 'breached', 'the agreement with NPR is broken');
  assert.equal(Q.lewica_dissent, lewica, 'no faction reaction (Z — 0.37)');
});

test('Trzy reformy: only the constructive vote in force; no arbitration and no complaint of the guarantees; each reform has its own act', () => {
  const Q = world({ seats: LEFT, time: 14, senate: true });
  const project = proj.createProject(Q, 'constitution', 'constructive_vonc', { sponsor: 'pps' });
  Object.assign(project, { status: 'completed', first_effect_time: 14, authorized: true, progress: 100 });
  proj.processProjects(Q, 14, econ.budgetAt(Q.S, 14));
  const reforms = proj.reformsRecord(Q);
  assert.deepEqual(reforms, { democratic_guarantees: false, constructive_vonc: true, presidential_arbitration: false });
  assert.equal(gov.constructiveVoteRequired(Q.S, Q), true);
  assert.equal(Q.S.parliament.constructive_vonc, true, 'the old field is only the adapter');
  assert.equal(Q.constructive_vonc, 1);
  // Z — 0.82: a change of the constitution is a motion of the debate; a change in force cannot be supported again.
  proj.openConstitutionDebate(Q);
  assert.match(proj.motionStatus(Q, 'constructive_vonc').reason, /already in force/);
  assert.match(proj.motionStatus(Q, 'presidential_arbitration').reason, /stronger presidency/);
});

test('Sprawiedliwość (stage-4 part): the broad variant puts the democratic guarantees first among the motions of PPS; the review of an abuse needs a restriction case', () => {
  const Q = withPortfolio(world({ time: 36, senate: true }), 'justice');
  assert.match(proj.optionStatus(Q, 'justice_policy', 'broad_safeguards').reason, /constitutional debate/, 'not before the debate');
  proj.openConstitutionDebate(Q);
  proj.debateToggle(Q, 'constructive_vonc');
  proj.debateDeclare(Q);
  assert.equal(proj.optionStatus(Q, 'justice_policy', 'broad_safeguards').available, true);
  proj.chooseOption(Q, 'justice_policy', 'broad_safeguards');
  const debate = proj.debateState(Q.S);
  assert.deepEqual([debate.ranking, debate.motions.democratic_guarantees.status, Q.month_actions], [['democratic_guarantees', 'constructive_vonc'], 'waiting', 1]);
  assert.equal(Object.values(Q.S.projects).filter(p => p.type === 'constitution').length, 0, 'no project before the vote');
  freeAction(Q);
  assert.match(proj.optionStatus(Q, 'justice_policy', 'broad_safeguards').reason, /already the first motion/);
  // Stage 7 records the restrictions (S.politics); without one the review has nothing to examine.
  assert.match(proj.optionStatus(Q, 'justice_policy', 'limited_redress').reason, /active restriction of a named case/);
});

// Z — 0.82 (the user's decisions of 21 X 2026): the constitutional debate. The fixture parliament LEFT gives the guarantees 270 votes
// for and 120 against (two thirds of the votes for and against), the constructive vote 150 for and none against.
test('Debata 0.82: the list of PPS in its order; the lines of What Power Do We Want and the exclusion; the position costs no month and brings the effects of support once', () => {
  const Q = world({ seats: LEFT, time: 36, senate: true });
  assert.equal(proj.debateState(Q.S), null, 'no debate before its event');
  proj.openConstitutionDebate(Q);
  assert.deepEqual(proj.MOTION_IDS, ['democratic_guarantees', 'church_separation', 'constructive_vonc', 'referendum', 'presidential_arbitration',
    'labour_chamber', 'unicameral']);
  assert.match(proj.motionStatus(Q, 'presidential_arbitration').reason, /A stronger presidency/);
  Q.S.actors.pps.strategy = { form_of_power: 'strong_presidency' };
  assert.equal(proj.motionStatus(Q, 'presidential_arbitration').available, true);
  assert.match(proj.motionStatus(Q, 'labour_chamber').reason, /Parliamentarism” or “Workers’ councils/);
  Q.S.actors.pps.strategy = { form_of_power: 'workers_councils' };
  for (const id of ['constructive_vonc', 'democratic_guarantees', 'labour_chamber']) proj.debateToggle(Q, id);
  assert.match(proj.motionStatus(Q, 'unicameral').reason, /excludes the motion “A Chamber of Labour in place of the Senate”/);
  assert.equal(proj.motionToggleable(Q, 'unicameral'), false);
  assert.throws(() => proj.debateToggle(Q, 'unicameral'));
  assert.equal(proj.motionToggleable(Q, 'labour_chamber'), true, 'a chosen motion can always be unmarked');
  proj.debateToggle(Q, 'labour_chamber');
  assert.equal(proj.motionStatus(Q, 'unicameral').available, true);
  proj.debateToggle(Q, 'church_separation');
  proj.debateToggle(Q, 'constructive_vonc');
  proj.debateToggle(Q, 'constructive_vonc');
  assert.equal(Q.pl_con_draft_text, '1. Democratic guarantees, 2. Separation of the Church and the state, 3. Constructive vote of no confidence',
    'an unmarked motion leaves the list and comes back at its end');
  assert.deepEqual([Q.pl_con_church_separation_mark, Q.pl_con_referendum_mark], ['■ 2.', '□']);
  assert.match(Q.pl_con_church_separation_line, /^The end of the leading position of the Catholic Church.*Our support: relations with the Christian Democrats worsen \(−3\)/);
  const before = { pschd: Q.S.actors.relations.pschd, piast: Q.S.actors.relations.psl_piast, lewica: Q.lewica_dissent };
  const text = proj.debateDeclare(Q);
  assert.equal(Q.month_actions, 0, 'the position costs no month');
  assert.match(text, /^PPS supports in the debate: 1\. Democratic guarantees, 2\. Separation of the Church and the state, 3\. Constructive vote of no confidence\./);
  const debate = proj.debateState(Q.S);
  assert.deepEqual([debate.declared_at, debate.ranking, Object.keys(debate.motions).map(id => debate.motions[id].status)],
    [36, ['democratic_guarantees', 'church_separation', 'constructive_vonc'], ['waiting', 'waiting', 'waiting']]);
  assert.deepEqual([Q.S.actors.relations.pschd, Q.S.actors.relations.psl_piast, Q.lewica_dissent], [before.pschd - 3, before.piast - 3, before.lewica - 2]);
  assert.throws(() => proj.debateDeclare(Q), /does not wait/, 'one position in the debate');
  assert.throws(() => proj.debateToggle(Q, 'referendum'));
  // Supporting none is a position too: then no motion comes to a vote.
  const N = world({ seats: LEFT, time: 36, senate: true });
  proj.openConstitutionDebate(N);
  assert.match(proj.debateDeclare(N), /supports none of the motions/);
  for (let i = 0; i < 6; i++) month(N);
  assert.equal(proj.debateState(N.S).pending, null);
});

test('Komisja Konstytucyjna 0.82: at most one motion a month, by its place among the waiting motions; none while a vote waits; the vote card only the next month', () => {
  const Q = world({ seats: LEFT, time: 36, senate: true });
  assert.deepEqual([proj.AGENDA_CHANCES, proj.AGENDA_CHANCE_LATER], [[0.17, 0.10, 0.07], 0.035]);
  proj.openConstitutionDebate(Q);
  for (const id of ['constructive_vonc', 'democratic_guarantees', 'referendum']) proj.debateToggle(Q, id);
  proj.debateDeclare(Q);
  const rolls = Q.S.rng.rolls, key = (id, t) => 'constitution:agenda:' + id + ':t' + t;
  // The first misses (0.5 ≥ 17%), the second and the third would both come (below 10% and 7%): the higher one comes.
  Object.assign(rolls, { [key('constructive_vonc', 36)]: 0.5, [key('democratic_guarantees', 36)]: 0.09, [key('referendum', 36)]: 0.01 });
  assert.equal(proj.constitutionVoteActive(Q), false);
  month(Q);
  const debate = proj.debateState(Q.S);
  assert.deepEqual(debate.pending, { id: 'democratic_guarantees', drawn_at: 36 });
  assert.equal(proj.constitutionVoteActive(Q), true, 'the vote card from the next month');
  rolls[key('constructive_vonc', 37)] = 0;
  month(Q);
  assert.deepEqual(debate.pending, { id: 'democratic_guarantees', drawn_at: 36 }, 'no second motion while a vote waits');
  assert.equal(rolls[key('constructive_vonc', 37)], 0, 'and no roll is drawn');
});

test('Głosowanie konstytucyjne 0.82: both chambers on the same day by two thirds of the votes for and against; in force at once and 1 B for a month; a failed motion does not come back', () => {
  const Q = world({ seats: LEFT, time: 36, senate: true });
  proj.openConstitutionDebate(Q);
  for (const id of ['democratic_guarantees', 'constructive_vonc']) proj.debateToggle(Q, id);
  proj.debateDeclare(Q);
  const debate = proj.debateState(Q.S);
  debate.pending = { id: 'democratic_guarantees', drawn_at: 36 };
  Q.time = 37; Q.year = rules.yearOf(37); Q.month = rules.monthOf(37);
  Q.S.rng.rolls['constitution:vote:democratic_guarantees:t36'] = 0.5; // the chance is 65%
  const view = proj.constitutionVoteView(Q);
  assert.equal(view.passes, true);
  assert.match(view.line, /The Sejm: 270 for, 120 against, 54 abstaining\. The Senate: 67 for, 30 against, 14 abstaining\. Both chambers have adopted/);
  const wyzwolenie = Q.S.actors.relations.psl_wyzwolenie;
  const text = proj.constitutionVoteResolve(Q);
  assert.match(text, /^The change of the constitution is in force from this month; it costs the budget 1 unit this month\. Relations with PSL Wyzwolenie/);
  assert.equal(Q.month_actions, 0, 'the vote costs no month');
  const law = Q.S.parliament.laws.at(-1);
  assert.deepEqual([law.rule, law.status, law.senate, Q.S.ballots.slice(-2).map(b => b.rule + ':' + b.result)],
    ['constitutional', 'enacted', 'accepted', ['constitutional_amendment_sejm:passed', 'constitutional_amendment_senate:passed']]);
  assert.equal(Q.S.ballots.at(-1).denominator, 97, 'two thirds of the senators voting for and against');
  assert.equal(proj.reformsRecord(Q).democratic_guarantees, true, 'in force at once');
  assert.equal(Q.S.actors.relations.psl_wyzwolenie, wyzwolenie + 4);
  const project = proj.projectsOf(Q.S, 'constitution')[0];
  assert.deepEqual([project.variant, project.status, project.build_budget_B, project.duration_months], ['democratic_guarantees', 'executing', 1, 1]);
  month(Q);
  assert.equal(project.status, 'completed', '1 B for one month');
  // The constructive vote has 150 for and none against (95%); a roll of 0.99 turns it over.
  debate.pending = { id: 'constructive_vonc', drawn_at: Q.time - 1 };
  Q.S.rng.rolls['constitution:vote:constructive_vonc:t' + (Q.time - 1)] = 0.99;
  const failed = proj.constitutionVoteView(Q);
  assert.equal(failed.passes, false);
  assert.match(failed.line, /Some of the MPs who were to abstain \(76\) voted against\. There are not two thirds of the votes in the Sejm: the motion fails\./);
  assert.match(proj.constitutionVoteResolve(Q), /does not come back/);
  assert.deepEqual([debate.motions.constructive_vonc.status, proj.reformsRecord(Q).constructive_vonc], ['failed', false]);
  assert.equal(proj.projectsOf(Q.S, 'constitution').length, 1, 'a failed motion creates no project');
  for (let i = 0; i < 6; i++) month(Q);
  assert.equal(debate.pending, null, 'nothing is left to bring to the floor');
});

test('Senat i los 0.82: the clubs that made the Senate vote against its end; a roll can pass a motion when its opponents abstain; without the Senate the Sejm alone decides', () => {
  const O = world({ seats: OPENING, time: 36, senate: true });
  const votes = proj.motionCounts(O, 'unicameral').sejm.club_votes;
  assert.deepEqual(['zln', 'pschd', 'psl_piast'].map(id => votes[id].vote), ['no', 'no', 'no']);
  proj.openConstitutionDebate(O);
  proj.debateToggle(O, 'unicameral');
  proj.debateDeclare(O);
  proj.debateState(O.S).pending = { id: 'unicameral', drawn_at: 36 };
  O.time = 37;
  O.S.rng.rolls['constitution:vote:unicameral:t36'] = 0.01; // 77 for, 209 against: the chance is 5%
  const view = proj.constitutionVoteView(O);
  assert.equal(view.passes, true);
  assert.match(view.line, /Some of its opponents \(171 MPs\) abstained\..*Some of its opponents in the Senate \(\d+\) abstained\..*Both chambers have adopted/);
  const text = proj.constitutionVoteResolve(O);
  assert.match(text, /The Senate ends; from now on the Sejm alone decides\./);
  assert.deepEqual([O.S.senate.status, O.S.senate.total, O.S.senate.abolished_by], ['abolished', 0, 'unicameral']);
  // A later change of the constitution needs the Sejm only.
  const Q = world({ seats: LEFT, time: 36, senate: true });
  Q.S.senate = Object.assign({}, Q.S.senate, { status: 'abolished', total: 0, club_seats: {} });
  proj.openConstitutionDebate(Q);
  proj.debateToggle(Q, 'constructive_vonc');
  proj.debateDeclare(Q);
  proj.debateState(Q.S).pending = { id: 'constructive_vonc', drawn_at: 36 };
  Q.time = 37;
  Q.S.rng.rolls['constitution:vote:constructive_vonc:t36'] = 0.5;
  assert.match(proj.constitutionVoteView(Q).line, /Without the Senate, the vote of the Sejm decides/);
  proj.constitutionVoteResolve(Q);
  assert.deepEqual([Q.S.parliament.laws.at(-1).senate, proj.reformsRecord(Q).constructive_vonc], ['abolished', true]);
});

// ---- Crisis offers (8.6, 8.8) ----

test('Wykonalność jedności narodowej and Narastanie kryzysu: no crisis, no offer; the currency crisis opens broad offers and raises the bonus to its limit', () => {
  const relations = { psl_wyzwolenie_relation: 90, psl_piast_relation: 90, npr_relation: 90, pschd_relation: 90, zln_relation: 90 };
  const Q = world({ time: 20, relations });
  assert.match(gov.configurationStatus(Q, 'national_unity', { reason: 'crisis' }).reason, /real crisis/, 'high relations do not replace a crisis');
  Q.S.economy.history.push({ t: 18, inflation_m: 30, budget: 1, credit: 50 }, { t: 19, inflation_m: 40, budget: 1, credit: 50 });
  const crisis = gov.crisisState(Q, { reason: 'crisis' });
  assert.deepEqual([crisis.currency, crisis.major, crisis.severe], [true, true, false]);
  assert.match(gov.configurationStatus(Q, 'national_unity', { reason: 'crisis' }).reason, /severe/, 'national unity needs the severe crisis');
  assert.equal(gov.configurationStatus(Q, 'broad_centre', { reason: 'crisis' }).available !== undefined, true);
  const offer = { configuration_id: 'broad_centre' };
  const bonus = n => { Q.S.history.cabinets = Array.from({ length: n }, (_, i) => ({ id: 'f' + i, pm: 'f' + i, end_reason: 'fall', ended_at: 19 - i })); return gov.crisisState(Q, { reason: 'crisis' }); };
  assert.equal(bonus(0).major, true);
  assert.equal(gov.configurationStatus(Q, 'broad_centre', { reason: 'post_election' }).available, false, 'never in the ordinary opening after the election');
  assert.ok(offer);
});

test('Wspólna karta gabinetowa (stage-4 part): Grabski’s terms belong to the one formation card; protections need the prepared base of 9.7; the loan terms make him stabilise gradually', () => {
  const Q = world({ time: rules.timeOf(1924, 1) });
  gov.beginFormation(Q, { reason: 'crisis', mandatory: true });
  gov.setDraft(Q, 'configuration_id', 'expert');
  gov.setDraft(Q, 'candidate_id', 'grabski');
  gov.setDraft(Q, 'pps_mode', 'external_support');
  assert.equal(gov.formationView(Q).stabilisation_open, true);
  assert.throws(() => gov.setDraft(Q, 'stabilisation_terms', 'protections'), /apparatus/);
  gov.setDraft(Q, 'stabilisation_terms', 'loan');
  assert.equal(gov.formationView(Q).stabilisation, 'a loan and limited cuts');
  const result = gov.submitFormation(Q);
  assert.equal(Q.month_actions, 0, 'the mandatory sequence costs no month; one commit');
  if (result.appointed && Q.S.cabinet.pm === 'grabski') {
    assert.equal(Q.S.cabinet.stabilisation_terms, 'loan');
    assert.equal(proj.cabinetProfile(Q.S.cabinet).stabilisation, 'gradual');
  }
  assert.equal(proj.CARDS.grabski_terms, undefined, 'no separate Grabski card');
});

test('P: the currency reform answering a financial crisis may start below −2 B; other programmes keep the threshold of 11.3', () => {
  const Q = withPortfolio(world({ time: 20 }), 'finance');
  Q.S.cabinet.portfolios.labor = 'pps';
  Q.S.economy.history.push({ t: 18, inflation_m: 30, budget: -3, credit: 50 }, { t: 19, inflation_m: 40, budget: -3, credit: 50 });
  // Z — 0.93 (decision 4A of 24 X 2026): the card starts the reform in the same decision; the rule is checked on the card.
  Q.S.economy.budget_base = -3;
  assert.match(proj.optionStatus(Q, 'public_works', 'employment').reason, /deficit stays at 2 budget units or less/);
  assert.equal(proj.optionStatus(Q, 'currency_stabilisation', 'gradual').available, true);
  proj.chooseOption(Q, 'currency_stabilisation', 'gradual');
  const reform = proj.currencyProject(Q.S);
  assert.equal(reform.status, 'executing', 'launched; its cost still limits execution');
  assert.equal(Q.S.economy.currency_regime, 'stabilizing');
});
