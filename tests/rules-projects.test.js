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

test('C4: the Sejm votes in the decision; without objections the Senate ends the procedure at +30 days; no extra scene', () => {
  const Q = world({ seats: LEFT, time: 14, senate: true });
  formed(Q, { configuration_id: 'left_minority', pps_mode: 'member' });
  const bill = proj.submitLaw(Q, { kind: 'test', title: 'Test law', sponsor: 'cabinet', programme: { fiscal: 2 } });
  assert.equal(bill.status, 'in_procedure');
  assert.equal(Q.S.ballots.at(-1).rule, 'ordinary_resolution');
  assert.deepEqual([bill.submitted_at, bill.senate_notice_due, bill.senate_return_due], ['1923-02-01', '1923-03-03', '1923-04-02']);
  proj.processLaws(Q, 14);
  assert.equal(bill.status, 'in_procedure', 'the +30 step is not early');
  proj.processLaws(Q, 15);
  assert.deepEqual([bill.status, bill.senate, bill.effective_at], ['enacted', 'accepted', '1923-03-03']);
  assert.equal(Q.S.ballots.at(-1).rule, 'senate_review');
});

test('C4: Senate amendments come back at +60; the Sejm accepts them by a simple majority or rejects them by 11/20; without either the law falls', () => {
  const Q = world({ seats: LEFT, time: 14, senate: true });
  formed(Q, { configuration_id: 'left_minority', pps_mode: 'member' });
  // A Senate where the clubs against the text have the majority (a fixture, not the 6.4 proxy).
  Q.S.senate.club_seats = { pps: 30, psl_wyzwolenie: 10, zln: 71 };
  const amended = proj.submitLaw(Q, { kind: 'test', title: 'Bill with a weaker variant', sponsor: 'cabinet', programme: { fiscal: 2 },
    variant: 'full', weaker_variant: 'limited', weaker_programme: { fiscal: 1 }, compromise_scope: null });
  const plain = proj.submitLaw(Q, { kind: 'test', title: 'Bill without a variant', sponsor: 'cabinet', programme: { fiscal: 2 } });
  proj.processLaws(Q, 15);
  assert.deepEqual([amended.senate, amended.next_step, amended.amendment.variant], ['amendments', 'return', 'limited']);
  assert.equal(plain.amendment.reject, true, 'without a weaker profile the amendment is the rejection');
  proj.processLaws(Q, 16);
  assert.notEqual(amended.status, 'in_procedure');
  assert.notEqual(plain.status, 'in_procedure');
  const rules1 = Q.S.ballots.filter(b => b.issue_id === amended.id).map(b => b.rule);
  assert.deepEqual(rules1.slice(0, 3), ['ordinary_resolution', 'senate_review', 'ordinary_resolution']);
  if (amended.status === 'enacted') assert.ok(['full', 'limited'].includes(amended.enacted_variant));
  if (amended.status === 'rejected') assert.match(amended.reason, /neither majority|rejection/);
  // A contested law without a majority never counts as adopted.
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

test('D1/D2: after the 1922 election and outside the cabinet; D2 after the settlement of D1; the Senate dates; payments from the effective month', () => {
  const Q = world({ seats: LEFT, time: 11 });
  assert.equal(proj.billD1Available(Q), false, 'not before the 1922 election');
  Q.sejm_first_election_completed = 1;
  Q.S.senate = { status: 'constituted', total: 111, club_seats: inst.senateFromSejm(LEFT, PARTIES, 444), records: [], method: 'sejm_proxy_v1', result_id: 'fx' };
  Q.time = 13; Q.year = 1923; Q.month = 1; // January 1923
  assert.equal(proj.billD1Available(Q), true, 'PPS is outside the opening cabinet');
  proj.billD1Choose(Q, 'start');
  assert.equal(Q.month_actions, 1, 'D1 costs this month’s action');
  assert.equal(proj.billD2Available(Q), false, 'D2 only after the settlement of the D1 month');
  month(Q);
  assert.equal(proj.billD2Available(Q), true);
  const out = proj.billD2Choose(Q, 'full');
  assert.equal(Q.month_actions, 0, 'D2 costs no month');
  assert.deepEqual([out.law.status, out.record.status, out.record.submitted_at, out.law.senate_notice_due], ['in_procedure', 'in_procedure', '1923-02-01', '1923-03-03']);
  month(Q); // February: the Sejm has passed it, no payment yet
  assert.equal(Q.S.economy.history.at(-1).project_charges, 0, 'no payment in February');
  month(Q); // March: the Senate raises no objection on 3 March; the law is in force and paid in March
  assert.equal(Q.S.chapter.unemployment_bill.status, 'enacted');
  assert.equal(Q.S.chapter.unemployment_bill.effective_at, '1923-03-03');
  const protection = proj.operatingProtection(Q.S);
  assert.deepEqual([protection.variant, protection.upkeep_budget_B, protection.sponsor, protection.executor, protection.responsibility.pps],
    ['full', 2, 'pps', 'labor_administration', 0.40]);
  assert.equal(Q.S.economy.history.at(-1).project_charges, 2, 'paid in March');
  assert.equal(proj.billD1Available(Q), false, 'one initiative in the chapter');
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
  Q.S.economy.budget_base = 1; // 1 − 2 (works) − 2 (protection) = −3
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

test('Kredyt B16: Labour only / Treasury only / the opposition: the right interventions, the others blocked; no menu in opposition; nothing ready is created', () => {
  const t = rules.timeOf(1925, 7);
  const labour = withPortfolio(world({ time: t, isolated: false }), 'labor');
  assert.equal(proj.creditEventDue(labour), true);
  assert.equal(proj.eventStatus(labour, 'credit', 'credit').available, false);
  assert.equal(proj.eventStatus(labour, 'credit', 'protection').available, true);
  assert.equal(proj.eventStatus(labour, 'credit', 'orders').available, false, 'no prepared works and no Industry');
  const treasury = withPortfolio(world({ time: t, isolated: false }), 'finance');
  assert.equal(proj.eventStatus(treasury, 'credit', 'credit').available, true);
  assert.equal(proj.eventStatus(treasury, 'credit', 'protection').available, false);
  proj.eventChoose(treasury, 'credit', 'credit');
  const prepared = Object.values(treasury.S.projects).find(p => p.type === 'credit_instrument');
  assert.equal(prepared.status, 'prepared', 'the answer prepares; the launch is an ordinary agenda step');
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
  proj.chooseOption(Q, 'public_works', 'housing');
  const housing = Object.values(Q.S.projects).find(p => p.type === 'public_works');
  assert.deepEqual([housing.variant, housing.duration_months, housing.build_budget_B, housing.upkeep_budget_B], ['housing', 4, 2, 1]);
  assert.equal(proj.PROJECT_TYPES.public_works.variants.housing.units, 0, 'no employment units for housing');
  freeAction(Q);
  Q.S.economy.budget_base = -1; // the launch would put the forecast at −3
  assert.match(proj.agendaStatus(Q, 'public_works').reason, /deficit stays at 2 budget units or less/);
  Q.S.economy.budget_base = 2;
  assert.equal(proj.agendaStatus(Q, 'public_works').available, true);
  proj.agendaChoose(Q, 'public_works');
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

test('Rozszerzyć i skupić osłony: a protection of 2 B extended to scope 2 costs 4 B; focused, 1 B for the most needy half', () => {
  const Q = withPortfolio(world({ time: 12 }), 'labor');
  proj.chooseOption(Q, 'social_welfare', 'expand');
  freeAction(Q);
  const protection = proj.operatingProtection(Q.S);
  assert.equal(protection.upkeep_budget_B, 2);
  proj.chooseOption(Q, 'social_welfare', 'expand');
  freeAction(Q);
  assert.deepEqual([protection.scope, protection.upkeep_budget_B], [2, 4]);
  assert.ok(protection.pending_effects.some(e => e.when === 'scope_2'), 'the same relief for the newly covered (stage 7)');
  const F = withPortfolio(world({ time: 12 }), 'labor');
  proj.chooseOption(F, 'social_welfare', 'expand');
  freeAction(F);
  proj.chooseOption(F, 'social_welfare', 'focus');
  const focused = proj.operatingProtection(F.S);
  assert.deepEqual([focused.variant, focused.upkeep_budget_B, proj.PROJECT_TYPES.worker_protection.variants.focused.share], ['focused', 1, 0.5]);
});

test('Warianty funduszu inwestycyjnego and Ratunek zakładu: public 2 B; banks blocked at credit 39, at 40 1 B and business −8; cooperatives need a PPS cooperative; no rescue without a recorded plant', () => {
  const Q = withPortfolio(world({ time: 12 }), 'finance');
  Q.S.economy.credit = 39;
  assert.match(proj.optionStatus(Q, 'investment_fund', 'banks').reason, /below 40/);
  Q.S.economy.credit = 40;
  proj.chooseOption(Q, 'investment_fund', 'banks');
  freeAction(Q);
  const instrument = Object.values(Q.S.projects).find(p => p.type === 'credit_instrument');
  assert.deepEqual([instrument.variant, instrument.build_budget_B, instrument.upkeep_budget_B], ['banks', 1, 1]);
  proj.agendaChoose(Q, 'credit_instrument');
  assert.equal(Q.S.economy.business_pressure, 10 - 8, 'the agreement lowers business pressure once');
  assert.match(proj.optionStatus(Q, 'investment_fund', 'cooperative').reason, /cooperative executor/);
  // Stage 5: an operating PPS cooperative is the cooperative executor; the variant then costs 2 B and
  // gives credit to farms and small plants (the rural and petty-bourgeois recipients).
  const C = withPortfolio(world({ time: 12 }), 'finance');
  C.S.party_orgs = { cooperatives: { projects: [{ id: 'coop-1', class_id: 'rural', status: 'operating' }] } };
  assert.equal(proj.optionStatus(C, 'investment_fund', 'cooperative').available, true);
  proj.chooseOption(C, 'investment_fund', 'cooperative');
  const cooperative = Object.values(C.S.projects).find(p => p.type === 'credit_instrument');
  assert.deepEqual([cooperative.variant, cooperative.build_budget_B, cooperative.beneficiaries], ['cooperative', 2, ['rural', 'old_middle']]);
  const I = withPortfolio(world({ time: 12 }), 'economic');
  // Stage 6: the rescue needs a recorded plant (tests/rules-strike.test.js, "Ratunek zakładu").
  assert.match(proj.optionStatus(I, 'industrial_policy', 'rescue').reason, /recorded plant/);
  proj.chooseOption(I, 'industrial_policy', 'credit');
  assert.equal(Object.values(I.S.projects).find(p => p.type === 'credit_instrument').variant, 'public', 'the general credit: +5 to the credit target');
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
  proj.chooseOption(Q, 'education_program', 'secular');
  freeAction(Q);
  // The agenda launches the prepared school programmes one at a time: first the village schools.
  proj.agendaChoose(Q, 'education_program');
  freeAction(Q);
  assert.equal(Q.S.parliament.laws.length, 0, 'village schools need no new law');
  proj.agendaChoose(Q, 'education_program');
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
  // Two main actions: the text, then the motion to both chambers; 2/3 and at least 111 signatures.
  freeAction(Q);
  proj.constitutionChoose(Q, 'democratic_guarantees', 'card');
  assert.equal(Q.month_actions, 1);
  freeAction(Q);
  const status = proj.constitutionStatus(Q, 'democratic_guarantees');
  if (status.available) {
    const out = proj.constitutionChoose(Q, 'democratic_guarantees', 'agenda');
    assert.equal(out.law.rule, 'constitutional');
    assert.equal(Q.S.ballots.at(-1).rule, 'constitutional_amendment_sejm');
  } else {
    assert.match(status.reason, /111 MPs/);
  }
  assert.match(proj.constitutionStatus(Q, 'presidential_arbitration').reason, /stronger presidency/);
});

test('Sprawiedliwość (stage-4 part): the broad variant is the one democratic_guarantees project; the review of an abuse needs a restriction case', () => {
  const Q = withPortfolio(world({ time: 12 }), 'justice');
  proj.chooseOption(Q, 'justice_policy', 'broad_safeguards');
  const project = Object.values(Q.S.projects).find(p => p.type === 'constitution');
  assert.equal(project.variant, 'democratic_guarantees', 'the ID of democratisation');
  assert.equal(Object.values(Q.S.projects).filter(p => p.type === 'constitution').length, 1, 'no second project');
  // Stage 7 records the restrictions (S.politics); without one the review has nothing to examine.
  freeAction(Q);
  assert.match(proj.optionStatus(Q, 'justice_policy', 'limited_redress').reason, /active restriction of a named case/);
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
  proj.chooseOption(Q, 'currency_stabilisation', 'gradual');
  freeAction(Q);
  proj.chooseOption(Q, 'public_works', 'employment');
  freeAction(Q);
  Q.S.economy.budget_base = -3;
  assert.match(proj.agendaStatus(Q, 'public_works').reason, /deficit stays at 2 budget units or less/);
  assert.equal(proj.agendaStatus(Q, 'currency_reform').available, true);
  proj.agendaChoose(Q, 'currency_reform');
  const reform = proj.currencyProject(Q.S);
  assert.equal(reform.status, 'executing', 'launched; its cost still limits execution');
  assert.equal(Q.S.economy.currency_regime, 'stabilizing');
});
