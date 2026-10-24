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
  // Z — 0.91 (decision 1A of 24 X 2026): no cadres and no recorded date; the level alone works.
  assert.deepEqual(S.party_orgs.tur, {level: 0, active_build: null, active_course: null, completed_courses: []});
  // Z — 0.89 (decisions 1 and 2A of 24 X 2026): members and training only; the fatigue, dissent, repression, alignment and
  // militarised mark of the Milicja left the state.
  assert.deepEqual([S.militia.strength, S.militia.militancy, S.militia.stage, PolishParty.militiaLevel(S.militia)], [200, 0.10, 1, 1]);
  assert.deepEqual(['fatigue', 'dissent', 'repressed', 'alignment', 'militarized', 'arrears', 'unpaid_last'].filter(k => k in S.militia), []);
  // Z — 0.86: PPS is strongest in the towns — the agricultural labourers start at reach 10; the unions have no funds.
  assert.deepEqual(PolishParty.BRANCHES.map(id => S.unions[id].reach), [20, 20, 10]);
  for (const id of PolishParty.BRANCHES) assert.deepEqual([S.unions[id].trust, S.unions[id].autonomy, S.unions[id].fund], [50, 60, 0]);
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

test('Brak gotówki: at 0 R no paid action is possible; organisational work and the collection stay available; the cash never goes below 0', () => {
  const Q = game();
  Q.S.party_orgs.cash = 0;
  PolishParty.writeMirrors(Q);
  for (const id of PolishParty.PACKAGE_ORDER) assert.equal(PolishParty.packageStatus(Q, id, 0).available, false, id);
  assert.equal(PolishParty.fundraiseStatus(Q).available, true, 'a collection costs no money');
  assert.equal(PolishParty.apparatusStatus(Q).available, false);
  assert.equal(PolishParty.organizeStatus(Q, 'branch:industry').available, true);
  PolishParty.organizeWithoutFunds(Q, 'branch:industry');
  assert.equal(Q.month_actions, 1);
  // Z — 0.56: the money of the original game: no income and no upkeep, so a settled month neither adds nor takes money.
  const ledger = PolishParty.settleParty(Q, Q.time);
  assert.equal(Q.S.party_orgs.cash, 0);
  assert.deepEqual([ledger.income, ledger.paid, ledger.unpaid], [undefined, undefined, undefined], 'the ledger records only membership');
  assert.ok(Object.values(Q.S.party_orgs.arrears).every(v => v === 0) && !('arrears' in Q.S.militia), 'no arrears');
});

test('Składki: a rise at real wages 89 or 91 multiplies membership by 0.95 or 0.98; every option collects the dues at once (Z — 0.56)', () => {
  for (const [wage, factor] of [[89, 0.95], [91, 0.98]]) {
    const Q = game();
    Q.S.economy.real_wage = wage;
    Q.S.economy.unemployment = 3;
    const cash = Q.S.party_orgs.cash;
    PolishParty.duesChoose(Q, 'raise');
    assert.equal(Q.S.party_orgs.dues, 3);
    close(Q.S.party_orgs.apparatus.member_index, 100 * factor);
    // The collection at the new dues and membership, to 0.1 R since Z — 0.84 (2.85 → 2.9, 2.94 → 2.9).
    close(Q.S.party_orgs.cash - cash, Math.round(30 * factor) / 10, 1e-9);
    assert.equal(PolishParty.duesStatus(Q, 'keep').available, false, 'after a change the month is used, so the level cannot be confirmed now');
    free(Q);
    assert.match(PolishParty.duesStatus(Q, 'lower').reason, /Available again in 6 months/);
  }
  const keep = game(), lower = game();
  const [k0, l0] = [keep.S.party_orgs.cash, lower.S.party_orgs.cash];
  PolishParty.duesChoose(keep, 'keep');
  PolishParty.duesChoose(lower, 'lower');
  close(keep.S.party_orgs.cash - k0, 2); // keeping collects too, as in the original game
  close(lower.S.party_orgs.cash - l0, 1); // at dues 1 and membership 102: 1.02 R, kept to 0.1 R since Z — 0.84
});

// Z — 0.86 (decision 6A of 24 X 2026): the unions no longer move the membership target; the support of the workers still does.
test('Cel członkostwa: the target is 100 at the start, 137.5 when the support of the workers is ×1.75, 95 at dues 3, the same at any union reach, always within 50–150', () => {
  const Q = game();
  close(PolishParty.memberTarget(Q), 100);
  for (const id of PolishParty.BRANCHES) Q.S.unions[id].reach = 100;
  close(PolishParty.memberTarget(Q), 100, 1e-9, 'the unions do not move the target');
  const support = PolishParty.ppsWorkerSupport(Q);
  Q.S.party_orgs.apparatus.worker_support0 = support / 1.75;
  close(PolishParty.memberTarget(Q), 137.5);
  Q.S.party_orgs.apparatus.worker_support0 = support;
  Q.S.party_orgs.dues = 3;
  close(PolishParty.memberTarget(Q), 95);
  Q.S.party_orgs.apparatus.worker_support0 = support / 3;
  Q.S.party_orgs.dues = 1;
  assert.equal(PolishParty.memberTarget(Q), 150);
  Q.S.party_orgs.apparatus.worker_support0 = support;
  for (const id of PolishParty.BRANCHES) Q.S.unions[id].reach = 0;
  Q.S.party_orgs.dues = 4;
  for (const cell of Q.S.society.cells) if (cell.class_id === 'workers') { const p = cell.propensity.pps; cell.propensity.pps = 0; cell.propensity.other += p; }
  assert.equal(PolishParty.memberTarget(Q), 50);
});

test('Zbliżanie członkostwa: 100 at a target of 137.5 becomes 101.875; 120 at a target of 100 becomes 119', () => {
  const Q = game();
  Q.S.party_orgs.apparatus.worker_support0 = PolishParty.ppsWorkerSupport(Q) / 1.75; // a target of 137.5
  PolishParty.settleParty(Q, Q.time);
  close(Q.S.party_orgs.apparatus.member_index, 101.875);
  const R = game();
  R.S.party_orgs.apparatus.member_index = 120;
  PolishParty.settleParty(R, R.time);
  close(R.S.party_orgs.apparatus.member_index, 119);
});

// Z — 0.86 (decisions 2A, 3A and 6A of 24 X 2026): strong unions add to every collection; the towns read the industrial and the
// railway branches, the countryside the agricultural labourers' union.
test('Silne związki 0.86: +1% to every collection for each point of the average reach above 20; the workers read industry and rail, the countryside 30% of the agricultural union', () => {
  const Q = game();
  const S = Q.S;
  assert.equal(PolishParty.unionCollectionBonus(S), 0, 'average 16.7 at the start');
  const base = PolishParty.collectionGain(S);
  for (const id of PolishParty.BRANCHES) S.unions[id].reach = 50;
  close(PolishParty.unionCollectionBonus(S), 0.30);
  close(PolishParty.collectionGain(S), Math.round(base * 1.3 * 10) / 10);
  S.unions.industry.reach = 40; S.unions.rail.reach = 60; S.unions.farm_labour.reach = 0;
  const worker = S.society.cells.find(c => c.class_id === 'workers'), rural = S.society.cells.find(c => c.class_id === 'rural');
  close(PolishParty.cellReach(S, worker, 'unions'), 50);
  close(PolishParty.cellReach(S, rural, 'unions'), 0.7 * rural.base_reach_pps);
  S.unions.farm_labour.reach = 50;
  close(PolishParty.cellReach(S, rural, 'unions'), 0.3 * 50 + 0.7 * rural.base_reach_pps);
  close(PolishParty.cellReach(S, rural, 'press'), 0.3 * 50 + 0.3 * PolishParty.pressEffective(S).reach + 0.4 * rural.base_reach_pps);
});

test('Zwrot aparatu: each level above the first adds 25% to every collection (Z — 0.56); at dues 2 and full membership the second level pays back its 2 R in four collections', () => {
  const Q = game();
  close(PolishParty.collectionGain(Q.S), 2); // dues 2 × membership 100 / 100
  PolishParty.buildApparatus(Q);
  assert.equal(Q.S.party_orgs.apparatus.level, 2);
  assert.equal(Q.S.party_orgs.cash, 0);
  close(PolishParty.collectionGain(Q.S), 2.5);
  close(2 / (PolishParty.collectionGain(Q.S) - 2), 4);
  Q.S.party_orgs.apparatus.level = 4;
  close(PolishParty.collectionGain(Q.S), 3.5);
});

// Z — 0.58 (the user's decision of 5 X 2026): TUR can be founded from the start; January 1923 is not a gate.
test('TUR od startu (Z — 0.58): in January 1922 PPS can found TUR; the historical date is not a gate', () => {
  const Q = game();
  assert.equal(Q.time, 1);
  Q.S.party_orgs.cash = 2;
  assert.equal(PolishParty.packageStatus(Q, 'tur', 0).available, true);
  PolishParty.organizationsChoose(Q, ['tur']);
  assert.deepEqual(Q.S.party_orgs.tur.active_build, {target_level: 1, started_at: 1, paid_months: 0});
  PolishParty.partyDisplay(Q);
  assert.match(Q.pl_party_tur, /being founded \(0\/2 months\)/);
});

test('Dwie organizacje: press and TUR cost 3 R and one month; with 2 R nothing is bought; the same organisation twice is refused', () => {
  const Q = game();
  at(Q, 1923, 1);
  Q.S.party_orgs.cash = 2;
  assert.match(PolishParty.selectionStatus(Q, ['press_distribution', 'tur']).reason, /costs 3 resources/);
  assert.throws(() => PolishParty.organizationsChoose(Q, ['press_distribution', 'tur']), /costs 3 resources/);
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
  assert.equal(Q.S.militia.strength, 350);
  free(Q);
  assert.match(PolishParty.militiaStatus(Q, 'recruit').reason, /Available again in 2 months/);
  assert.match(PolishParty.packageStatus(Q, 'militia_recruit', 0).reason, /Available again in 2 months/);
  assert.equal(PolishParty.militiaStatus(Q, 'militarize').available, true, 'another step of the same organisation has its own cooldown');
});

// Z — 0.91 (decision 2A of 24 X 2026): a civic course raises the trust in PPS of its group by 4, never above 70 from the courses;
// no radicalisation and no one-off campaign bonus.
test('TUR 0.91: a civic course takes two months, with or without money; then the trust of its group rises (+4) up to 70', () => {
  const Q = game();
  at(Q, 1923, 1);
  Q.S.party_orgs.tur.level = 1;
  const workers = Q.S.society.cells.filter(c => c.class_id === 'workers');
  const others = Q.S.society.cells.filter(c => c.class_id !== 'workers');
  workers[0].trust_pps = 50; workers[1].trust_pps = 68; workers[2].trust_pps = 75;
  const before = others.map(c => c.trust_pps), radical = workers.map(c => c.radicalization);
  PolishParty.turCourse(Q, 'civil_rights', 'workers');
  PolishParty.settleParty(Q, Q.time);
  assert.equal(Q.S.party_orgs.tur.active_course.paid_months, 1);
  assert.equal(workers[0].trust_pps, 50, 'an unfinished course gives nothing');
  // Z — 0.56: no upkeep, so an empty cash box does not stop the course.
  Q.S.party_orgs.cash = 0;
  PolishParty.settleParty(Q, Q.time + 1);
  assert.equal(Q.S.party_orgs.tur.active_course, null);
  assert.deepEqual(workers.slice(0, 3).map(c => c.trust_pps), [54, 70, 75], '+4, up to 70; a higher trust stays');
  assert.deepEqual(others.map(c => c.trust_pps), before, 'only its group');
  assert.deepEqual(workers.map(c => c.radicalization), radical, 'no radicalisation effect');
  assert.equal(Q.S.party_orgs.tur.completed_courses.length, 1);
  // With every cell of the group at 70 or more the course has nothing to do.
  for (const c of workers) c.trust_pps = Math.max(c.trust_pps, 70);
  Q.S.party_orgs.cash = 3;
  free(Q);
  delete Q.S.cooldowns['party.tur_course'];
  assert.match(PolishParty.courseStatus(Q, 'civil_rights', 'workers').reason, /already as high as a course can raise it/);
  Q.S.party_orgs.tur.level = 3;
  assert.equal(PolishParty.courseStatus(Q, 'national_education', 'workers,rural,new_middle').available, true, 'the other groups still have room');
});

test('TUR 0.91: an older save loses the cadres, the date and the prepared campaigns; its preparation of a reform ends without an effect', () => {
  const Q = game();
  at(Q, 1923, 1);
  Object.assign(Q.S.party_orgs.tur, {level: 2, cadres: 20, available_from: 13, prepared_campaigns: [],
    active_course: {course: 'social_reform', target: 'prj-1', started_at: Q.time - 1, paid_months: 1, effect_id: 'tur:social_reform:t12'}});
  PolishParty.partyDisplay(Q);
  assert.match(Q.pl_party_tur, /^level 2; course: Preparation of a social reform \(1\/2 months\)$/);
  PolishParty.settleParty(Q, Q.time);
  assert.deepEqual(Object.keys(Q.S.party_orgs.tur).sort(), ['active_build', 'active_course', 'completed_courses', 'level']);
  assert.equal(Q.S.party_orgs.tur.active_course, null);
  assert.equal(Q.S.party_orgs.tur.completed_courses[0].course, 'social_reform');
  assert.deepEqual(Object.keys(PolishParty.COURSES), ['civil_rights', 'union_cadres', 'national_education']);
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

test('AS: 499 or 500 members, with and without training: AS only from 500 members at training level 3, with 2 R and legality (Z — 0.56: no reserve for upkeep; Z — 0.89: level 3)', () => {
  const Q = game();
  Q.S.party_orgs.cash = 10;
  Q.S.militia.strength = 500;
  Q.S.militia.militancy = PolishParty.MILITIA_LEVELS[1];
  assert.match(PolishParty.militiaStatus(Q, 'as').reason, /Needs training at level 3; it is at 2\./);
  Q.S.militia.militancy = PolishParty.MILITIA_LEVELS[2];
  Q.S.militia.strength = 499;
  assert.match(PolishParty.militiaStatus(Q, 'as').reason, /500 members/);
  Q.S.militia.strength = 500;
  assert.equal(PolishParty.canFormAS(Q.S), true);
  assert.equal(Q.S.militia.stage, 1, 'the threshold does not reorganise by itself');
  Q.S.party_orgs.cash = 1.9;
  assert.match(PolishParty.militiaStatus(Q, 'as').reason, /Needs 2 resources/);
  Q.S.party_orgs.cash = 10;
  PolishParty.militiaChoose(Q, 'as');
  assert.deepEqual([Q.S.militia.stage, Q.S.militia.strength, Q.pps_militia_name], [2, 500, 'Akcja Socjalistyczna']);
  close(Q.S.party_orgs.cash, 8); // only the 2 R of the change
});

// Z — 0.89 (decision 2A of 24 X 2026): the hidden compliance left the Milicja — the force is members ÷ 100 × training, ×1.2 as
// AS, and its discipline in the clash test is fixed (0.80 / 0.95).
test('Posłuch AS (Z — 0.89): the force is members ÷ 100 × training, ×1.2 as AS; the discipline is 0.80 for the Milicja and 0.95 for AS', () => {
  const Q = game();
  const S = Q.S;
  S.militia.strength = 400; S.militia.militancy = PolishParty.MILITIA_LEVELS[2];
  S.militia.stage = 1;
  const militia = PolishParty.militiaForce(S);
  S.militia.stage = 2;
  const as = PolishParty.militiaForce(S);
  close(militia.force, 4 * 0.40);
  close(as.force / militia.force, 1.2);
  assert.deepEqual([militia.discipline, as.discipline], [0.80, 0.95]);
  assert.equal(PolishParty.militiaForce(S, { committed: 100 }).people, 300, 'only the free members');
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
  close(Q.S.militia.militancy, 0.25, 1e-9, 'Z — 0.89: training level 2');
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
  // Z — 0.56: no upkeep; the relief lasts while the cooperative operates.
  PolishParty.settleParty(Q, Q.time);
  assert.deepEqual([PolishParty.cooperativeRelief(Q.S, rural), Q.S.party_orgs.cash], [1, 2]);
});

// ---- Z — 0.89: the simplified Milicja (decisions 1, 2A and 3A of 24 X 2026) ----

test('Milicja 0.89: a recruitment brings 150 members for 1 R, a training one level of five for 1 R, each waiting two months; AS needs 500 members and level 3', () => {
  const Q = game();
  const S = Q.S;
  S.party_orgs.cash = 20;
  const step = option => { PolishParty.militiaChoose(Q, option); free(Q); delete S.cooldowns['militia.' + option]; };
  step('recruit');
  assert.deepEqual([S.militia.strength, S.party_orgs.cash], [350, 19]);
  assert.match(PolishParty.militiaStatus(Q, 'as').reason, /Needs training at level 3; it is at 1\./);
  for (const level of [2, 3, 4, 5]) {
    step('militarize');
    assert.equal(PolishParty.militiaLevel(S.militia), level);
  }
  assert.deepEqual([S.militia.militancy, S.party_orgs.cash], [0.70, 15]);
  assert.match(PolishParty.militiaStatus(Q, 'militarize').reason, /Its training is at the highest level, 5\./);
  PolishParty.militiaChoose(Q, 'recruit');
  assert.equal(PolishParty.militiaStatus(Q, 'militarize').available, false);
  free(Q);
  assert.match(PolishParty.militiaStatus(Q, 'recruit').reason, /Available again in 2 months/);
  assert.equal(S.militia.strength, 500);
  assert.equal(PolishParty.militiaStatus(Q, 'as').available, true);
  // Up to 800 members: the last recruitment brings only what is missing.
  S.militia.strength = 700;
  delete S.cooldowns['militia.recruit'];
  PolishParty.militiaChoose(Q, 'recruit');
  free(Q);
  delete S.cooldowns['militia.recruit'];
  assert.equal(S.militia.strength, 800);
  assert.match(PolishParty.militiaStatus(Q, 'recruit').reason, /Milicja has 800 members; the party cannot organise more\./);
});

test('Droga do 4 F 0.89: three recruitments, three trainings and AS — seven actions and 8 R — give a full protection of a strike', () => {
  const Q = game();
  const S = Q.S;
  S.party_orgs.cash = 20;
  const actions = ['recruit', 'militarize', 'recruit', 'militarize', 'recruit', 'militarize', 'as'];
  for (const option of actions) {
    PolishParty.militiaChoose(Q, option);
    free(Q);
    delete S.cooldowns['militia.' + option];
  }
  assert.deepEqual([S.militia.strength, PolishParty.militiaLevel(S.militia), S.militia.stage, S.party_orgs.cash], [650, 4, 2, 12]);
  const force = PolishParty.militiaForce(S).force;
  close(force, 6.5 * 0.55 * 1.2);
  assert.equal(PolishParty.allocateProtection(2, force, 1)[0].protection, 0.40, 'the full protection');
});

test('Stary zapis 0.89: the fields the Milicja no longer has are removed at the next settlement; the training takes its nearest level', () => {
  const Q = game();
  const S = Q.S;
  Object.assign(S.militia, { militancy: 0.32, fatigue: 10, dissent: 0, repressed: false, alignment: { legal_institutions: 55 }, militarized: true,
    arrears: 0, unpaid_last: false });
  delete S.militia.militarized_once;
  PolishParty.settleParty(Q, Q.time);
  assert.deepEqual(['fatigue', 'dissent', 'repressed', 'alignment', 'militarized', 'arrears', 'unpaid_last'].filter(k => k in S.militia), []);
  assert.deepEqual([S.militia.militancy, PolishParty.militiaLevel(S.militia), S.militia.militarized_once], [0.25, 2, true]);
  assert.deepEqual(PolishRules.validateState(S), []);
});

// ---- Z — 0.90: the party press (decisions 1B, 2A, 5A, a, 4A and 6(ii) of 24 X 2026) ----

test('Sufit prasy 0.90: the distribution brings the party journal up to 60 and the popular paper up to 100; a journal above 60 reaches only 60', () => {
  const Q = game();
  const S = Q.S, press = S.party_orgs.press;
  S.party_orgs.cash = 20;
  press.reach = 50;
  assert.equal(PolishParty.packageStatus(Q, 'militia_recruit', 0).available, true);
  PolishParty.organizationsChoose(Q, ['press_distribution']);
  free(Q);
  delete S.cooldowns['party.press_distribution'];
  assert.equal(press.reach, 60);
  assert.match(PolishParty.packageStatus(Q, 'press_distribution', 0).reason, /The party journal already has its highest reach, 60; only a popular paper reaches more\./);
  press.format = 'popular';
  assert.deepEqual([PolishParty.packageStatus(Q, 'press_distribution', 0).available, PolishParty.pressEffective(S).reach], [true, 70]);
  press.reach = 90;
  assert.deepEqual([PolishParty.pressEffective(S).reach, PolishParty.packageStatus(Q, 'press_distribution', 0).available], [100, false]);
  press.format = 'party_journal';
  assert.equal(PolishParty.pressEffective(S).reach, 60, 'an older save above the ceiling reaches only 60 as a journal');
});

test('Sprzedaż prasy 0.90: the popular paper earns a tenth of a unit a month from reach 50; the journal and a smaller paper earn nothing', () => {
  const Q = game();
  const S = Q.S, press = S.party_orgs.press;
  const month = () => { const cash = S.party_orgs.cash; PolishParty.settleParty(Q, Q.time); return Math.round(10 * (S.party_orgs.cash - cash)) / 10; };
  press.reach = 40;
  assert.equal(month(), 0, 'the journal sells nothing');
  press.format = 'popular';
  assert.equal(month(), 0.1, 'reach 50 with the popular +10');
  assert.equal(S.party_orgs.last_ledger.press_sales, 0.1);
  press.reach = 30;
  assert.equal(month(), 0, 'reach 40 is too small');
  assert.deepEqual(['unpaid_months', 'paid_last', 'cases'].filter(k => k in press), [], 'the dead fields are gone');
});

test('Konfiskata 0.90: under a government of the right a press campaign may cost a confiscated issue (one in four), reach −10 for two months; revealed it costs nothing, unrevealed −2 credibility at its end', () => {
  const Q = game();
  const S = Q.S, press = S.party_orgs.press;
  S.party_orgs.cash = 20;
  const t = Q.time;
  S.rng.rolls['press_confiscation:press_campaign:t' + t] = 0.10;
  PolishParty.pressCampaign(Q);
  free(Q);
  assert.equal(press.restrictions.length, 0, 'no confiscation under the opening cabinet');
  S.cabinet.configuration_id = 'chjeno_piast';
  assert.equal(PolishParty.rightGovernment(S), true);
  Q.S.cooldowns = {};
  const reach = PolishParty.pressEffective(S).reach;
  PolishParty.pressCampaign(Q);
  free(Q);
  assert.deepEqual(press.restrictions.map(r => [r.reach_penalty, r.expires_at - t, r.confiscation, r.lawful]), [[10, 2, true, false]]);
  assert.equal(PolishParty.pressEffective(S).reach, reach - 10);
  // The end of an unrevealed confiscation: credibility −2.
  const credibility = press.credibility;
  PolishParty.settleParty(Q, t + 1);
  assert.deepEqual([press.restrictions[0].status, press.credibility], ['expired', credibility - 2]);
  // A revealed one costs nothing at its end.
  press.restrictions.push({id: 'confiscation:fixture', event_id: 'fixture', reach_penalty: 10, expires_at: t + 4, status: 'active', confiscation: true,
    lawful: false, revealed: true});
  PolishParty.settleParty(Q, t + 3);
  assert.equal(press.credibility, credibility - 2, 'no second loss');
});

test('Prasa wzmacnia kampanię 0.90: the press makes a campaign of the Campaign card stronger among its readers — 25% × reach × credibility; not among the others', () => {
  const Q = game();
  const S = Q.S, press = S.party_orgs.press;
  close(PolishParty.pressBoost(S).value, 0.25 * 0.30 * 0.60);
  PolishParty.campaignView(Q);
  assert.equal(Q.pl_campaign_press, 'The party press makes a campaign stronger among its readers, workers and the unemployed: by 5%.');
  const spec = boost => { press.reach = boost; return PolishParty.issueSpec(Q, 'eight_hours'); };
  const worker = S.society.cells.find(c => c.class_id === 'workers'), peasant = S.society.cells.find(c => c.class_id === 'rural');
  const low = spec(30), high = spec(60);
  close(high.factor(worker) / low.factor(worker), (1 + 0.25 * 0.6 * 0.6) / (1 + 0.25 * 0.3 * 0.6));
  assert.equal(high.factor(peasant), low.factor(peasant), 'the party journal does not reach the countryside');
  // The violence of a PPS organisation costs the press credibility (−5).
  const before = press.credibility;
  PolishPolitics.organisationViolence(Q, {id: 'fixture-violence', subject: 'a fixture'});
  assert.equal(press.credibility, before - 5);
});
