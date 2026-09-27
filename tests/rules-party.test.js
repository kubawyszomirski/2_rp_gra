const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Rules of the party of stage 5 (implementation plan, stage 5; technical reference 5.1–5.4, 10.1–10.4,
// 13.1–13.5, 14.1): money and membership, the apparatus, the organisations package, the press, TUR,
// cooperatives and Milicja / AS. Each test starts a real new game and calls the rules module on its state.
let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

function game() {
  const engine = dendry.startGame();
  return engine.state.qualities;
}
// The month's action was committed by the rules; a test that acts again in the same month frees it.
function free(Q) {
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  Q.month_actions = 0;
}
function at(Q, year, month) {
  Q.year = year; Q.month = month; Q.time = PolishRules.timeOf(year, month);
}

test('a new game has the party of 13.1–13.3 and the factions of 10.1 in Q.S; the inherited fields are mirrors', () => {
  const Q = game();
  const S = Q.S;
  assert.deepEqual([S.party_orgs.cash, S.party_orgs.dues, S.party_orgs.apparatus.level, S.party_orgs.apparatus.member_index], [2, 2, 1, 100]);
  assert.deepEqual([S.party_orgs.press.reach, S.party_orgs.press.credibility, S.party_orgs.press.format], [30, 60, 'party_journal']);
  assert.deepEqual([S.party_orgs.tur.level, S.party_orgs.tur.cadres, S.party_orgs.tur.available_from], [0, 0, 13]);
  assert.deepEqual([S.militia.strength, S.militia.militancy, S.militia.stage, S.militia.militarized], [200, 0.10, 1, false]);
  for (const id of PolishParty.BRANCHES) assert.deepEqual([S.unions[id].reach, S.unions[id].trust, S.unions[id].autonomy], [20, 50, 60]);
  assert.deepEqual(PolishParty.BRANCHES.map(id => S.unions[id].fund), [0.50, 0.25, 0.25]);
  assert.deepEqual(Object.keys(S.actors.pps.factions), ['centrum', 'lewica', 'pilsudczycy']);
  close(Q.dissent, 0.0475);
  close(PolishParty.cohesion(S), 95.25);
  assert.equal(S.actors.relations.pilsudski, 60, '3.2: the relation PPS–Piłsudski starts at 60');
  assert.deepEqual(S.actors.bund, {trust: 50, joint_actions: []});
  assert.deepEqual(S.actors.pps.strategy, PolishParty.OPENING_STRATEGY);
  assert.deepEqual(PolishRules.validateState(S), []);
  // A legacy write to a mirror is taken over once, not lost and not counted twice.
  Q.resources += 1;
  PolishParty.syncMirrors(Q);
  assert.equal(S.party_orgs.cash, 3);
  PolishParty.syncMirrors(Q);
  assert.equal(S.party_orgs.cash, 3);
});

test('Brak gotówki: at 0 R no paid action is possible; organisational work stays available; the cash never goes below 0', () => {
  const Q = game();
  Q.S.party_orgs.cash = 0;
  PolishParty.writeMirrors(Q);
  for (const id of PolishParty.PACKAGE_ORDER) assert.equal(PolishParty.packageStatus(Q, id, 0).available, false, id);
  assert.equal(PolishParty.fundraiseStatus(Q).available, true, 'a collection costs no money');
  assert.equal(PolishParty.apparatusStatus(Q).available, false);
  assert.equal(PolishParty.organizeStatus(Q, 'branch:industry').available, true);
  PolishParty.organizeWithoutFunds(Q, 'branch:industry');
  assert.equal(Q.month_actions, 1);
  Q.S.party_orgs.apparatus.member_index = 0; // no income at all
  const ledger = PolishParty.settleParty(Q, Q.time);
  assert.equal(Q.S.party_orgs.cash, 0);
  assert.ok(Object.keys(ledger.unpaid).length > 0, 'the unpaid upkeep is recorded');
  assert.ok(Q.S.party_orgs.arrears.apparatus > 0 && Q.S.militia.arrears > 0);
});

test('Składki: a rise at real wages 89 or 91 multiplies membership by 0.95 or 0.98; the income comes only in the monthly ledger', () => {
  for (const [wage, factor] of [[89, 0.95], [91, 0.98]]) {
    const Q = game();
    Q.S.economy.real_wage = wage;
    Q.S.economy.unemployment = 3;
    const cash = Q.S.party_orgs.cash;
    PolishParty.duesChoose(Q, 'raise');
    assert.equal(Q.S.party_orgs.dues, 3);
    close(Q.S.party_orgs.apparatus.member_index, 100 * factor);
    assert.equal(Q.S.party_orgs.cash, cash, 'no extra income at once');
    assert.equal(PolishParty.duesStatus(Q, 'keep').available, false, 'the present level is shown as present');
    free(Q);
    assert.match(PolishParty.duesStatus(Q, 'lower').reason, /Available again in 6 months/);
  }
});

test('Cel członkostwa: the target is 100 at the start, 137.5 with union reach ×1.75, 95 at dues 3, always within 50–150', () => {
  const Q = game();
  close(PolishParty.memberTarget(Q), 100);
  for (const id of PolishParty.BRANCHES) Q.S.unions[id].reach = 35;
  close(PolishParty.memberTarget(Q), 137.5);
  for (const id of PolishParty.BRANCHES) Q.S.unions[id].reach = 20;
  Q.S.party_orgs.dues = 3;
  close(PolishParty.memberTarget(Q), 95);
  for (const id of PolishParty.BRANCHES) Q.S.unions[id].reach = 100;
  Q.S.party_orgs.dues = 1;
  assert.equal(PolishParty.memberTarget(Q), 150);
  for (const id of PolishParty.BRANCHES) Q.S.unions[id].reach = 0;
  Q.S.party_orgs.dues = 4;
  for (const cell of Q.S.society.cells) if (cell.class_id === 'workers') { const p = cell.propensity.pps; cell.propensity.pps = 0; cell.propensity.other += p; }
  assert.equal(PolishParty.memberTarget(Q), 50);
});

test('Zbliżanie członkostwa: 100 at a target of 137.5 becomes 101.875; 120 at a target of 100 becomes 119', () => {
  const Q = game();
  for (const id of PolishParty.BRANCHES) Q.S.unions[id].reach = 35;
  PolishParty.settleParty(Q, Q.time);
  // The union funds grow by their own income at the same settlement; the reach used is 35.
  close(Q.S.party_orgs.apparatus.member_index, 101.875);
  const R = game();
  R.S.party_orgs.apparatus.member_index = 120;
  PolishParty.settleParty(R, R.time);
  close(R.S.party_orgs.apparatus.member_index, 119);
});

test('Zwrot aparatu: the second level at full membership pays back its 2 R in 40 months (+0.05 R a month net)', () => {
  const Q = game();
  const income1 = PolishParty.duesIncome(Q.S);
  const cost1 = PolishParty.monthlyCosts(Q.S).find(item => item.id === 'apparatus').cost;
  PolishParty.buildApparatus(Q);
  assert.equal(Q.S.party_orgs.apparatus.level, 2);
  assert.equal(Q.S.party_orgs.cash, 0);
  const net = (PolishParty.duesIncome(Q.S) - income1) - (PolishParty.monthlyCosts(Q.S).find(item => item.id === 'apparatus').cost - cost1);
  close(net, 0.05);
  close(2 / net, 40);
});

test('Dwie organizacje: press and TUR cost 3 R and one month; with 2 R nothing is bought; the same organisation twice is refused', () => {
  const Q = game();
  at(Q, 1923, 1);
  Q.S.party_orgs.cash = 2;
  assert.match(PolishParty.selectionStatus(Q, ['press_distribution', 'tur']).reason, /costs 3 R/);
  assert.throws(() => PolishParty.organizationsChoose(Q, ['press_distribution', 'tur']), /costs 3 R/);
  assert.equal(Q.S.party_orgs.cash, 2, 'no half of the package');
  Q.S.party_orgs.cash = 3;
  PolishParty.organizationsChoose(Q, ['press_distribution', 'tur']);
  assert.deepEqual([Q.S.party_orgs.cash, Q.month_actions, Q.S.party_orgs.press.reach], [0, 1, 40]);
  assert.deepEqual(Q.S.party_orgs.tur.active_build, {target_level: 1, started_at: Q.time, paid_months: 0});
  assert.equal(Q.S.cooldowns['party.organizations'], Q.time + 2, 'the card waits 2 months');
  assert.deepEqual(Q.S.turn.pending.selected_options, ['press_distribution', 'tur']);
  free(Q);
  Q.S.party_orgs.cash = 5;
  assert.match(PolishParty.selectionStatus(Q, ['militia_recruit', 'militia_militarize']).reason, /different organisations/);
});

test('Podmenu i doradcy: a recruitment from the organisations card starts the same cooldown as the Milicja card; no second free recruitment', () => {
  const Q = game();
  Q.S.party_orgs.cash = 5;
  PolishParty.organizationsChoose(Q, ['militia_recruit']);
  assert.equal(Q.S.militia.strength, 300);
  free(Q);
  assert.match(PolishParty.militiaStatus(Q, 'recruit').reason, /Available again in 2 months/);
  assert.match(PolishParty.packageStatus(Q, 'militia_recruit', 0).reason, /Available again in 2 months/);
  assert.equal(PolishParty.militiaStatus(Q, 'militarize').available, true, 'another step of the same organisation has its own cooldown');
});

test('TUR: a course waits in an unfinanced month; unfinished it gives no bonus; completed, its campaign bonus in one cell is used once', () => {
  const Q = game();
  at(Q, 1923, 1);
  Q.S.party_orgs.tur.level = 1;
  PolishParty.turCourse(Q, 'civil_rights', 'workers');
  PolishParty.settleParty(Q, Q.time);
  assert.equal(Q.S.party_orgs.tur.active_course.paid_months, 1);
  // A month without money: the TUR upkeep is not paid and the course does not advance.
  Q.S.party_orgs.cash = 0;
  const index = Q.S.party_orgs.apparatus.member_index;
  Q.S.party_orgs.apparatus.member_index = 0;
  PolishParty.settleParty(Q, Q.time + 1);
  assert.equal(Q.S.party_orgs.tur.active_course.paid_months, 1);
  assert.deepEqual(Q.S.party_orgs.tur.prepared_campaigns, [], 'an unfinished course gives no bonus');
  Q.S.party_orgs.apparatus.member_index = index;
  Q.S.party_orgs.cash = 3;
  PolishParty.settleParty(Q, Q.time + 2);
  assert.equal(Q.S.party_orgs.tur.active_course, null);
  assert.equal(Q.S.party_orgs.tur.prepared_campaigns.length, 1);
  const cell = Q.S.society.cells.find(c => c.class_id === 'workers');
  assert.equal(PolishParty.takeCourseBonus(Q.S, cell, 'democracy', Q.time + 3), 0.10);
  assert.equal(PolishParty.takeCourseBonus(Q.S, cell, 'democracy', Q.time + 3), 0, 'used once in this cell');
  const other = Q.S.society.cells.filter(c => c.class_id === 'workers')[1];
  assert.equal(PolishParty.takeCourseBonus(Q.S, other, 'democracy', Q.time + 3), 0.10, 'another covered cell has its own bonus');
  assert.equal(PolishParty.takeCourseBonus(Q.S, other, 'class', Q.time + 3), 0, 'only the topic of the course');
});

test('Zmiana formatu prasy: popular, journal, popular again: one current modifier, no stacked +10 and no second penalty', () => {
  const Q = game();
  const reach = PolishParty.pressEffective(Q.S).reach;
  PolishParty.pressFormatChoose(Q);
  assert.equal(Q.S.party_orgs.press.format, 'popular');
  assert.equal(PolishParty.pressEffective(Q.S).reach, reach + 10);
  assert.equal(PolishParty.pressEffective(Q.S).credibility, 55);
  assert.equal(Q.S.actors.pps.factions.centrum.dissent, 3, 'the first popular format: Centrum +3');
  free(Q);
  delete Q.S.cooldowns['party.press_format'];
  Q.S.party_orgs.cash = 5;
  PolishParty.pressFormatChoose(Q);
  assert.equal(PolishParty.pressEffective(Q.S).reach, reach);
  free(Q);
  delete Q.S.cooldowns['party.press_format'];
  PolishParty.pressFormatChoose(Q);
  assert.equal(PolishParty.pressEffective(Q.S).reach, reach + 10, 'not +20');
  assert.equal(Q.S.party_orgs.press.reach, reach, 'the base field is never written by the format');
  assert.equal(Q.S.actors.pps.factions.centrum.dissent, 3, 'no second penalty');
});

test('Konfiskata: one restriction per ID, re-entry changes nothing, lifting removes only this restriction', () => {
  const Q = game();
  const reach = PolishParty.pressEffective(Q.S).reach;
  assert.equal(PolishParty.addPressRestriction(Q, {id: 'conf-1', event_id: 'ev-1'}), true);
  assert.equal(PolishParty.addPressRestriction(Q, {id: 'conf-1', event_id: 'ev-1'}), false, 'once per ID');
  assert.equal(PolishParty.pressEffective(Q.S).reach, reach - 10);
  PolishParty.addPressRestriction(Q, {id: 'conf-2', event_id: 'ev-2', reach_penalty: 5});
  assert.equal(PolishParty.pressEffective(Q.S).reach, reach - 15);
  assert.equal(PolishParty.liftPressRestriction(Q, 'conf-1'), true);
  assert.equal(PolishParty.pressEffective(Q.S).reach, reach - 5, 'only conf-1 is lifted');
  assert.equal(PolishParty.liftPressRestriction(Q, 'conf-1'), false);
});

test('AS: 499 or 500 members, with and without militarisation: AS only from 500 after militarisation, with money, legality and no arrears', () => {
  const Q = game();
  Q.S.party_orgs.cash = 10;
  Q.S.militia.strength = 500;
  assert.match(PolishParty.militiaStatus(Q, 'as').reason, /militarised/);
  Q.S.militia.militarized = true;
  Q.S.militia.strength = 499;
  assert.match(PolishParty.militiaStatus(Q, 'as').reason, /500 members/);
  Q.S.militia.strength = 500;
  assert.equal(PolishParty.canFormAS(Q.S), true);
  assert.equal(Q.S.militia.stage, 1, 'the threshold does not reorganise by itself');
  Q.S.party_orgs.cash = 3.1;
  assert.match(PolishParty.militiaStatus(Q, 'as').reason, /Needs 3\.2 R/);
  Q.S.party_orgs.cash = 10;
  Q.S.militia.arrears = 0.1;
  assert.match(PolishParty.militiaStatus(Q, 'as').reason, /unpaid upkeep/);
  Q.S.militia.arrears = 0;
  PolishParty.militiaChoose(Q, 'as');
  assert.deepEqual([Q.S.militia.stage, Q.S.militia.strength, Q.pps_militia_name], [2, 500, 'Akcja Socjalistyczna']);
  close(PolishParty.militiaUpkeep(Q.S.militia), 0.40);
});

test('Posłuch AS: alignment 50 / 20 / 100 gives compliance 0.835→0.985 / 0.715→0.865 / 1→1 and force ×1.18 / ×1.21 / ×1', () => {
  const Q = game();
  const S = Q.S;
  S.militia.strength = 400; S.militia.militancy = 0.5;
  const expected = [[50, 0.83575, 0.98575, 1.18], [20, 0.71575, 0.86575, 1.21], [100, 1, 1, 1]];
  for (const [alignment, before, after, ratio] of expected) {
    S.militia.stage = 1;
    const militia = PolishParty.militiaForce(S, {alignment});
    S.militia.stage = 2;
    const as = PolishParty.militiaForce(S, {alignment});
    close(militia.compliance, before);
    close(as.effective_compliance, after);
    close(as.force / militia.force, ratio, 0.005);
  }
});

test('Jedna akcja Milicji and Mała AS i czwarta sprawa: 8 F in two cases 40/0 and 40/40; AS 3 F 30/0; AS 14 F in four cases 4/4/6/0 F', () => {
  const protection = (stage, force, cases) => PolishParty.allocateProtection(stage, force, cases);
  assert.deepEqual(protection(1, 8, 2).map(c => c.protection), [0.40, 0]);
  assert.deepEqual(protection(2, 8, 2).map(c => c.protection), [0.40, 0.40]);
  assert.deepEqual(protection(2, 3, 2).map(c => Math.round(100 * c.protection)), [30, 0]);
  assert.deepEqual(protection(2, 14, 4).map(c => c.force), [4, 4, 6, 0]);
});

test('Militaryzacja a frakcje: only the first militarisation gives Centrum +3 dissent; Lewica does not change', () => {
  const Q = game();
  Q.S.party_orgs.cash = 10;
  const lewica = Q.S.actors.pps.factions.lewica.dissent;
  PolishParty.militiaChoose(Q, 'militarize');
  assert.equal(Q.S.actors.pps.factions.centrum.dissent, 3);
  close(Q.S.militia.militancy, 0.20);
  free(Q);
  delete Q.S.cooldowns['militia.militarize'];
  PolishParty.militiaChoose(Q, 'militarize');
  assert.equal(Q.S.actors.pps.factions.centrum.dissent, 3, 'no second reaction');
  assert.equal(Q.S.actors.pps.factions.lewica.dissent, lewica);
  assert.equal(Q.centrum_dissent, 3, 'the mirror follows the owner');
  const reaction = Q.S.actors.pps.factions.centrum.reactions.at(-1);
  assert.deepEqual([reaction.cause, reaction.reverse], ['militia.militarize', null], 'a militarisation cannot be taken back');
});

test('cooperatives: prepared in the organisations card, launched in the agenda for 2 R; the operating one is the cooperative executor', () => {
  const Q = game();
  Q.S.party_orgs.cash = 5;
  PolishParty.organizationsChoose(Q, ['cooperative_rural']);
  free(Q);
  assert.equal(PolishParty.cooperativeExecutor(Q.S), false, 'a prepared cooperative is not yet an executor');
  const project = Q.S.party_orgs.cooperatives.projects[0];
  PolishParty.launchCooperative(Q, project.id);
  assert.deepEqual([project.status, Q.S.party_orgs.cash], ['operating', 2]);
  assert.equal(PolishParty.cooperativeExecutor(Q.S), true);
  const rural = Q.S.society.cells.find(c => c.class_id === 'rural');
  const workers = Q.S.society.cells.find(c => c.class_id === 'workers');
  assert.deepEqual([PolishParty.cooperativeRelief(Q.S, rural), PolishParty.cooperativeRelief(Q.S, workers)], [1, 0]);
  assert.ok(PolishParty.monthlyCosts(Q.S).some(item => item.id === 'cooperative:' + project.id && item.cost === 0.10));
});
