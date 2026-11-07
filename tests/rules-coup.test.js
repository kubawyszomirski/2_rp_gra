const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Rules of the forces of the state and of Piłsudski of stage 7 (implementation plan, stage 7b; technical reference
// 16.1–16.3, 16.7, 16.8.1, 17.12.2–4, 17.12.6; card catalogue 6.8, 7.5, 8.12–8.15): the synthetic army groups and
// their effective loyalty, the coup capacity, the police, civilian control of the army and nominations, the
// investigation of a case, the agreement with Piłsudski and its review, the review of an abuse in Justice and the
// limited autonomy. Each test starts a real new game and calls the rules on its state. The force profile
// `synthetic_test_v2` is a test calibration, not a reconstruction of the army of 1926.
let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

const close = (a, b, eps = 1e-9, label = '') => assert.ok(Math.abs(a - b) < eps, `${label} ${a} != ${b}`);

// A game without the dated inputs of the scenario, so that a test of one rule sees no other speech or case.
function quiet(engine) {
  const Q = (engine || dendry.startGame()).state.qualities;
  Q.S.scenario.inputs.dispute_1922 = false;
  Q.S.scenario.inputs.military_case = false;
  Q.S.economy.budget = 10; // Z — 1.01: a pool of 10 units
  return Q;
}
function free(Q) {
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  Q.month_actions = 0;
}
// One settlement of period t in the order of post_event (4.2): unions, projects and the economy, the party, the
// unions' end, the agreements, politics, then the forces of the state.
function settle(Q) {
  const t = Q.time;
  free(Q);
  Q.time = t + 1; Q.year = PolishRules.yearOf(Q.time); Q.month = PolishRules.monthOf(Q.time);
  PolishUnions.beginMonth(Q, { t });
  PolishProjects.settleMonth(Q, { t });
  PolishParty.settleMonth(Q, { t });
  PolishUnions.endMonth(Q, { t });
  PolishGovernment.settleAgreements(Q);
  PolishPolitics.settleMonth(Q, { t });
  PolishSecurity.settleMonth(Q, { t });
  return t;
}
function withPortfolios(Q, ...portfolios) {
  const cabinet = Q.S.cabinet;
  if (!cabinet.partner_ids.includes('pps')) cabinet.partner_ids.push('pps');
  for (const key of portfolios) cabinet.portfolios[key] = 'pps';
  return Q;
}
// A fixture Sejm in which PPS carries its acts (250 of 444 MPs).
function ppsMajority(Q) {
  Q.S.parliament.clubs.find(c => c.id === 'pps').seats += 215;
  Q.S.parliament.clubs.find(c => c.id === 'other').seats -= 215;
  return Q;
}
const force = (S, id) => S.security.forces.find(f => f.id === id);
const sum = f => f.loyalty_legal + f.loyalty_pils + f.loyalty_neutral;
const dissent = (S, id) => S.actors.pps.factions[id].dissent;
const impulses = (S, prefix) => S.coup.impulses.filter(i => i.id.startsWith(prefix));
const armyProject = S => Object.values(S.projects).find(p => p.type === 'army_control');

test('Gotowość wojska: democracy 60 / 75 / 45 / 100 leaves the loyalties of v2 / moves 3.75 pp from Piłsudski to neutral / 3.75 pp back / at most 10 pp; the legal share never moves, the sum stays 1', () => {
  const Q = quiet();
  const S = Q.S;
  assert.equal(Q.polish_security_rules, 1);
  assert.equal(S.security.profile_id, 'synthetic_test_v2');
  assert.deepEqual(S.security.forces.map(f => [f.id, f.base_strength_F, f.loyalty_legal, f.loyalty_pils, f.loyalty_neutral, f.available_from_phase]), [
    ['capital_legal', 45, 0.90, 0.05, 0.05, 0], ['capital_pils', 55, 0.05, 0.90, 0.05, 0],
    ['near_reserve', 25, 0.30, 0.50, 0.20, 1], ['remote_reserve', 35, 0.50, 0.25, 0.25, 2]]);
  for (const f of S.security.forces) {
    const at = d => PolishSecurity.effectiveLoyalty(f, d);
    const e60 = at(60), e75 = at(75), e45 = at(45), e100 = at(100);
    assert.deepEqual([e60.legal, e60.pils, e60.neutral], [f.loyalty_legal, f.loyalty_pils, f.loyalty_neutral], f.id + ': unchanged at 60');
    close(e75.pils, f.loyalty_pils - 0.0375, 1e-12, f.id + ' 75');
    close(e75.neutral, f.loyalty_neutral + 0.0375, 1e-12, f.id + ' 75');
    close(e45.pils, f.loyalty_pils + 0.0375, 1e-12, f.id + ' 45');
    close(e45.neutral, f.loyalty_neutral - 0.0375, 1e-12, f.id + ' 45');
    close(e100.pils, f.loyalty_pils - Math.min(0.10, f.loyalty_pils), 1e-12, f.id + ' 100');
    for (const e of [e60, e75, e45, e100]) {
      assert.equal(e.legal, f.loyalty_legal, f.id + ': the legal share never moves');
      close(e.legal + e.pils + e.neutral, 1, 1e-12, f.id + ': sum');
    }
  }
  close(PolishSecurity.effectiveLoyalty(force(S, 'capital_pils'), 100).pils, 0.80, 1e-12, 'the limit of 10 pp');
  close(PolishSecurity.effectiveLoyalty(force(S, 'capital_pils'), 0).pils, 0.95, 1e-12, 'at most the neutral share moves');
  assert.deepEqual(S.security.forces.map(f => f.loyalty_pils), [0.05, 0.90, 0.50, 0.25], 'the reading never writes the loyalties');
});

test('Zdolność a demokracja: for democracy 0–100 the synthetic capacity stays at least 30, falls as democracy rises and is 38.1 at 60; it is a display of strength, not a probability', () => {
  const Q = quiet();
  const S = Q.S;
  const readings = [];
  for (let d = 0; d <= 100; d += 5) {
    S.politics.democracy = d;
    readings.push(PolishSecurity.capacity(S));
  }
  assert.ok(readings.every(c => c >= 30), readings.join(', '));
  assert.ok(readings.every((c, i) => i === 0 || c <= readings[i - 1] + 1e-12), 'more democracy, less capacity');
  S.politics.democracy = 60;
  close(PolishSecurity.capacity(S), 38.093, 1e-3, 'Σ strength × readiness × command × loyalty to Piłsudski × logistics 0.8');
  // A temporary fall of readiness is read by the capacity of that month only.
  const near = force(S, 'near_reserve');
  const t = Q.time;
  near.modifiers.push({ field: 'readiness', value: -0.05, from: t, until: t + 1, source: 'fixture' });
  close(PolishSecurity.capacity(S, t), 38.093 - 25 * 0.05 * 0.70 * 0.50 * 0.80, 1e-3);
  close(PolishSecurity.capacity(S, t + 1), 38.093, 1e-3);
  assert.match(PolishSecurity.statusLine(Q), /known only as/);
  assert.doesNotMatch(PolishSecurity.statusLine(Q), /capacity|38/i, 'the interface shows the recognised interval, not the true values');
});

test('Policja 0.99: the training gives command and lawful compliance +5 at the settlement of its month (protection 12.5 → 15.125); it can be repeated; a save keeps it', () => {
  const engine = dendry.startGame();
  const Q = withPortfolios(quiet(engine), 'interior');
  const S = Q.S;
  close(PolishSecurity.protectionCapacity(S, null, Q.time), 12.5, 1e-9, 'capacity × command × lawful compliance at 50/50/50');
  PolishProjects.chooseOption(Q, 'internal_security', 'training');
  const project = Object.values(S.projects).find(p => p.type === 'police_training');
  assert.deepEqual([project.status, project.price_B, project.duration_months], ['executing', 1, 1], 'Z — 1.01: 1 B once, one settlement');
  assert.deepEqual([S.security.police.command, S.security.police.lawful_compliance], [50, 50], 'nothing before the settlement');
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'internal_security', 'training').reason, /under way/);
  settle(Q);
  assert.equal(project.status, 'completed');
  assert.deepEqual([S.security.police.capacity, S.security.police.command, S.security.police.lawful_compliance], [50, 55, 55]);
  close(PolishSecurity.protectionCapacity(S, null, Q.time), 50 * 0.55 * 0.55, 1e-9, 'a change of the parameters, not a bonus');
  free(Q);
  // Z — 0.99: the training can be repeated.
  PolishProjects.chooseOption(Q, 'internal_security', 'training');
  settle(Q);
  assert.deepEqual([S.security.police.command, S.security.police.lawful_compliance], [60, 60]);
  const restored = dendry.saveAndRestore(engine).state.qualities;
  assert.deepEqual([restored.S.security.police.command, restored.S.security.police.lawful_compliance], [60, 60]);
});

test('Nominacja (awanse 1.02): without Military Affairs no card; the promotion moves 0.10 from Piłsudski to the legal authorities in the group most loyal to him, the known interval follows; 1 B, Piłsudski −10, the Piłsudczycy +8; the next one reaches the next group', () => {
  const Q = quiet();
  const S = Q.S;
  assert.equal(PolishProjects.cardAvailable(Q, 'military_policy'), false, 'no competence');
  withPortfolios(ppsMajority(Q), 'reichswehr');
  assert.deepEqual(PolishProjects.CARDS.military_policy.options, ['raise_spending', 'cut_spending', 'promote_officers']);
  const target = force(S, 'capital_pils'), pils0 = target.loyalty_pils, legal0 = target.loyalty_legal, known0 = S.security.known.capital_pils.pils_center;
  assert.equal(PolishSecurity.promotionTarget(S).id, 'capital_pils', 'the capital units close to Piłsudski first');
  const pool0 = S.economy.budget, rel = S.actors.relations.pilsudski, dP = dissent(S, 'pilsudczycy'), laws = S.parliament.laws.length;
  PolishProjects.chooseOption(Q, 'military_policy', 'promote_officers');
  close(target.loyalty_pils, pils0 - 0.10, 1e-12, 'loyalty to Piłsudski −0.10');
  close(target.loyalty_legal, legal0 + 0.10, 1e-12, 'to the legal authorities');
  close(sum(target), 1, 1e-12);
  close(S.security.known.capital_pils.pils_center, known0 - 0.10, 1e-12, 'the Status shows the change');
  assert.deepEqual([S.economy.budget, S.actors.relations.pilsudski, dissent(S, 'pilsudczycy'), S.parliament.laws.length, Q.month_actions],
    [pool0 - 1, Math.max(0, rel - 10), Math.min(100, dP + 8), laws, 1], 'one price, no law, 1 T');
  assert.match(Q.pl_gc_result, /In the capital units close to Piłsudski the loyalty to Piłsudski falls \(−10 pp\)/);
  for (const f of S.security.forces) if (f.id !== 'near_reserve') f.loyalty_pils = 0; // fixture: only the near reserve still leans to him
  assert.equal(PolishSecurity.promotionTarget(S).id, 'near_reserve');
  for (const f of S.security.forces) f.loyalty_pils = 0;
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'military_policy', 'promote_officers').reason, /No group of the army leans towards Piłsudski/);
});

test('Śledztwo i adresat polemiki (Z — 0.99, the pursuit of violence): 1 B once (Z — 1.01); violence −5; the National Democrats and the communists −3; the latest case is investigated and a confirmed one names the addressee of the polemic', () => {
  const Q = withPortfolios(quiet(), 'interior');
  const S = Q.S;
  S.actors.pps.strategy.main_opponent = 'unconstitutional_force';
  assert.equal(PolishProjects.optionStatus(Q, 'internal_security', 'prosecute').available, true, 'a permanent option, also without a recorded case');
  PolishPolitics.openCase(Q, { id: 'fixture_clash', kind: 'communist_violence', subject: 'a fixture clash in a strike', suspected: 'kpp' });
  PolishPolitics.openCase(Q, { id: 'fixture_attack', kind: 'far_right_violence', subject: 'a fixture attack with no suspect', suspected: null });
  assert.deepEqual(PolishParty.polemicAddressees(Q), [], 'the label of a case is not a proof of guilt');
  const zln = S.actors.relations.zln, kpp = S.actors.relations.kpp;
  PolishProjects.chooseOption(Q, 'internal_security', 'prosecute');
  const project = Object.values(S.projects).find(p => p.type === 'police_investigation');
  assert.deepEqual([project.variant, project.price_B, project.duration_months, project.policy_choices.case_id], ['prosecution', 1, 1, 'fixture_attack']);
  assert.deepEqual([S.actors.relations.zln, S.actors.relations.kpp], [zln - 3, kpp - 3]);
  assert.equal(Q.month_actions, 1, '1 T');
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'internal_security', 'prosecute').reason, /under way/);
  settle(Q); settle(Q);
  const d = S.politics.cases.fixture_attack;
  assert.deepEqual([d.investigation.confirmed, d.assigned_party], [false, null], 'a profile that suspects no party confirms none');
  assert.ok(S.politics.violence_episodes.some(e => e.id === project.id + ':violence' && e.value === -5), 'violence −5 at the end');
  free(Q);
  PolishProjects.chooseOption(Q, 'internal_security', 'prosecute');
  settle(Q); settle(Q);
  const c = S.politics.cases.fixture_clash;
  assert.deepEqual([c.investigation.confirmed, c.assigned_party], [true, 'kpp']);
  assert.deepEqual(PolishParty.polemicAddressees(Q), ['kpp']);
});

test('Ustępstwo Piłsudskiemu: the military function, then the inspectorate renegotiated in the same crisis: one relief of pressure, only nominations really executed and never repeated', () => {
  const Q = withPortfolios(ppsMajority(quiet()), 'reichswehr');
  const S = Q.S;
  PolishPolitics.openCase(Q, { id: 'military_case', kind: 'military', subject: 'the organisation of the supreme military authorities' });
  S.coup.pressure = 40; // fixture: high enough that no relief is cut at 0
  const p0 = S.coup.pressure, near = force(S, 'near_reserve'), pils0 = near.loyalty_pils, dP = dissent(S, 'pilsudczycy');
  assert.equal(PolishSecurity.pilsCardAvailable(Q), true);
  PolishSecurity.concessionChoose(Q, 'military_function');
  const agreement = PolishSecurity.pilsAgreement(S);
  assert.deepEqual([agreement.kind, agreement.variant, agreement.execution_started_at, agreement.review_at], ['pilsudski', 'military_function', Q.time, Q.time + 6]);
  close(S.coup.pressure, p0 - 12, 1e-9, 'relief −12 when the execution starts');
  assert.equal(S.actors.relations.pilsudski, 64);
  assert.equal(dissent(S, 'pilsudczycy'), Math.max(0, dP - 5));
  close(near.loyalty_pils, pils0 + 0.05, 1e-12, 'nominations up to +0.05 of loyalty to Piłsudski in the group under him');
  close(sum(near), 1, 1e-12);
  assert.equal(S.politics.cases.military_case.status, 'closed', 'the executed agreement resolves the military case');
  assert.equal(Q.month_actions, 1, 'an own initiative costs 1 T');
  free(Q);
  assert.match(PolishSecurity.concessionStatus(Q, 'military_function').reason, /already agreed/);
  const p1 = S.coup.pressure, dC = dissent(S, 'centrum'), laws = S.parliament.laws.length, remote = force(S, 'remote_reserve'), remote0 = remote.loyalty_pils;
  PolishSecurity.concessionChoose(Q, 'inspectorate');
  assert.equal(S.parliament.laws.length, laws, 'Z — 1.02: in force at once, without a law or a vote');
  assert.equal(PolishSecurity.pilsAgreement(S).id, agreement.id, 'the same agreement, renegotiated');
  assert.equal(agreement.variant, 'inspectorate');
  close(S.coup.pressure, p1, 1e-9, 'no second relief: −12 and −25 are not added');
  assert.equal(S.actors.relations.pilsudski, 64, 'no second +4');
  assert.equal(dissent(S, 'centrum'), dC + 8, 'the Centrum objects to the inspectorate itself');
  close(near.loyalty_pils, pils0 + 0.05, 1e-12, 'Z — 1.02: the limit of 0.05 for each group, counted over the whole agreement');
  close(remote.loyalty_pils, remote0 + 0.05, 1e-12, 'the remote reserve moves too');
  PolishSecurity.executeAgreement(Q, agreement, Q.time);
  close(near.loyalty_pils, pils0 + 0.05, 1e-12, 'a repeated execution moves nothing');
  close(remote.loyalty_pils, remote0 + 0.05, 1e-12);
  assert.deepEqual(impulses(S, 'pils_agreement').map(i => i.value), [-12]);
});

test('Pula ustępstw wojskowych: no card of concessions in opposition or under toleration; access with PPS in the cabinet holding Military Affairs; the Sejm still votes the laws', () => {
  const Q = quiet();
  const S = Q.S;
  assert.equal(S.cabinet.pps_mode, 'external_support', 'the opening toleration of Ponikowski');
  assert.equal(PolishSecurity.pilsCardAvailable(Q), false, 'toleration');
  S.cabinet.pps_mode = 'opposition';
  S.cabinet.supporter_ids = S.cabinet.supporter_ids.filter(id => id !== 'pps');
  assert.equal(PolishSecurity.pilsCardAvailable(Q), false, 'opposition');
  PolishPolitics.openCase(Q, { id: 'military_case', kind: 'military', subject: 'the organisation of the supreme military authorities' });
  assert.equal(PolishProjects.armyOversightAvailable(Q), true, 'the Sejm can still take up the military case');
  withPortfolios(Q, 'interior');
  assert.equal(PolishSecurity.pilsCardAvailable(Q), false, 'a portfolio without the competence');
  withPortfolios(Q, 'reichswehr');
  assert.equal(PolishSecurity.pilsCardAvailable(Q), true);
  S.cabinet.status = 'caretaker';
  assert.equal(PolishSecurity.pilsCardAvailable(Q), false, 'a caretaker cabinet does not open new concessions');
});

test('Ustępstwa a linia: under support all concessions; under the conditional line the inspectorate carries responsibility before the Sejm; the line against military interference blocks it (0.33)', () => {
  const lines = {};
  for (const line of ['support', 'conditional', 'oppose_military_interference']) {
    const Q = withPortfolios(ppsMajority(quiet()), 'reichswehr');
    Q.S.actors.pps.strategy.pils_influence = line;
    Q.S.actors.relations.pilsudski = 70;
    lines[line] = Q;
  }
  for (const variant of ['military_function', 'inspectorate', 'pils_premier', 'refuse']) {
    assert.equal(PolishSecurity.concessionStatus(lines.support, variant).available, true, 'support: ' + variant);
  }
  assert.equal(PolishSecurity.concessionStatus(lines.conditional, 'inspectorate').available, true);
  assert.match(PolishSecurity.concessionStatus(lines.oppose_military_interference, 'inspectorate').reason, /opposes military interference/);
  for (const variant of ['military_function', 'pils_premier', 'refuse']) {
    assert.equal(PolishSecurity.concessionStatus(lines.oppose_military_interference, variant).available, true, 'oppose: ' + variant);
  }
  const dSupport = dissent(lines.support.S, 'centrum'), dCond = dissent(lines.conditional.S, 'centrum');
  PolishSecurity.concessionChoose(lines.support, 'inspectorate');
  PolishSecurity.concessionChoose(lines.conditional, 'inspectorate');
  assert.deepEqual([lines.support, lines.conditional].map(G => PolishSecurity.pilsAgreement(G.S).execution_started_at), [lines.support.time, lines.conditional.time],
    'Z — 1.02: in force at once, without a law');
  assert.equal(dissent(lines.support.S, 'centrum'), dSupport, 'the line of support is the Centrum’s: no +8');
  assert.equal(dissent(lines.conditional.S, 'centrum'), dCond + 8);
});

test('Ograniczona reforma wojska (the old card of the Parliament deck, Z — 1.02): for the same group full oversight gives legal loyalty +0.05 and army +2 in its law; the limited reform +0.025 and army 0; 1 B once each', () => {
  const results = {};
  for (const variant of ['civilian_oversight', 'limited_reform']) {
    const Q = withPortfolios(ppsMajority(quiet()), 'reichswehr');
    const S = Q.S, near = force(S, 'near_reserve'), legal0 = near.loyalty_legal, pool0 = S.economy.budget;
    PolishPolitics.openCase(Q, { id: 'military_case', kind: 'military', subject: 'the organisation of the supreme military authorities' });
    PolishProjects.armyOversightChoose(Q, variant);
    const project = armyProject(S);
    assert.equal(project.variant, variant);
    const law = S.parliament.laws.at(-1);
    settle(Q);
    results[variant] = { army: law.programme.army, decree: !!law.decree, paid: pool0 - S.economy.budget, legal: near.loyalty_legal - legal0, sum: sum(near), status: project.status };
  }
  assert.deepEqual([results.civilian_oversight.army, results.limited_reform.army], [2, 0]);
  assert.deepEqual([results.civilian_oversight.decree, results.limited_reform.decree], [false, false], 'the Parliament deck files a law for a vote');
  assert.deepEqual([results.civilian_oversight.paid, results.limited_reform.paid], [1, 1]);
  close(results.civilian_oversight.legal, 0.05, 1e-12);
  close(results.limited_reform.legal, 0.025, 1e-12);
  for (const r of Object.values(results)) { close(r.sum, 1, 1e-12); assert.equal(r.status, 'completed'); }
});

test('Wydatki na wojsko 1.02: more money costs 2 B, the pressure towards a coup −5 and the Left of PPS +5; a cut brings +2 B and the pressure +5; more money needs 2 B in the pool', () => {
  const Q = withPortfolios(ppsMajority(quiet()), 'reichswehr');
  const S = Q.S;
  S.coup.pressure = 20;
  const pool0 = S.economy.budget, dL = dissent(S, 'lewica');
  PolishProjects.chooseOption(Q, 'military_policy', 'raise_spending');
  assert.deepEqual([S.economy.budget, S.coup.pressure, dissent(S, 'lewica')], [pool0 - 2, 15, Math.min(100, dL + 5)]);
  free(Q);
  PolishProjects.chooseOption(Q, 'military_policy', 'cut_spending');
  assert.deepEqual([S.economy.budget, S.coup.pressure], [pool0, 20]);
  free(Q);
  S.economy.budget = 1;
  assert.match(PolishProjects.optionStatus(Q, 'military_policy', 'raise_spending').reason, /Not enough budget: it needs 2, the pool has 1\./);
  assert.equal(PolishProjects.optionStatus(Q, 'military_policy', 'cut_spending').available, true);
});

test('Piłsudski i wojsko 1.02: subordination moves both reserves 0.05 to the legal authorities, Piłsudski −15, the Piłsudczycy +10 and breaks an agreement; the cult of the Legions 1 B and +10; the status quo Centrum −3 and Piłsudski −3', () => {
  const Q = withPortfolios(ppsMajority(quiet()), 'reichswehr');
  const S = Q.S;
  assert.deepEqual(PolishSecurity.PILS_OPTIONS, ['subordinate', 'legion_cult', 'military_function', 'inspectorate', 'status_quo']);
  S.coup.pressure = 30;
  PolishSecurity.pilsChoose(Q, 'military_function');
  free(Q);
  const near = force(S, 'near_reserve'), remote = force(S, 'remote_reserve'), n0 = near.loyalty_pils, r0 = remote.loyalty_pils;
  const rel = S.actors.relations.pilsudski, dP = dissent(S, 'pilsudczycy'), p0 = S.coup.pressure;
  PolishSecurity.pilsChoose(Q, 'subordinate');
  close(near.loyalty_pils, n0 - 0.05, 1e-12); close(remote.loyalty_pils, r0 - 0.05, 1e-12); close(sum(near), 1, 1e-12);
  assert.deepEqual([S.actors.relations.pilsudski, dissent(S, 'pilsudczycy')], [Math.max(0, rel - 15), Math.min(100, dP + 10)]);
  assert.equal(PolishSecurity.pilsAgreement(S).status, 'breached', 'the agreement with him is broken');
  assert.equal(S.coup.pressure, p0 + 8, 'a culpable break: +8');
  assert.match(Q.pl_pils_result, /The agreement with him is broken/);
  free(Q);
  const pool0 = S.economy.budget, rel1 = S.actors.relations.pilsudski;
  PolishSecurity.pilsChoose(Q, 'legion_cult');
  assert.deepEqual([S.economy.budget, S.actors.relations.pilsudski, Q.month_actions], [pool0 - 1, Math.min(100, rel1 + 10), 1]);
  free(Q);
  const dC = dissent(S, 'centrum'), rel2 = S.actors.relations.pilsudski;
  PolishSecurity.pilsChoose(Q, 'status_quo');
  assert.deepEqual([dissent(S, 'centrum'), S.actors.relations.pilsudski], [Math.max(0, dC - 3), Math.max(0, rel2 - 3)]);
  free(Q);
  S.economy.budget = 0;
  assert.match(PolishSecurity.pilsOptionStatus(Q, 'legion_cult').reason, /Not enough budget/);
  for (const f of S.security.forces) f.loyalty_pils = 0;
  assert.match(PolishSecurity.pilsOptionStatus(Q, 'subordinate').reason, /no longer lean towards Piłsudski/);
});

test('Przegląd ugody chroniącej: an agreement executed for 6 months is extended without a new relief when Piłsudski accepts, or expires without +8', () => {
  const run = keepCompetence => {
    const Q = withPortfolios(quiet(), 'reichswehr');
    const S = Q.S;
    PolishSecurity.concessionChoose(Q, 'military_function');
    const agreement = PolishSecurity.pilsAgreement(S), t0 = Q.time;
    for (let m = 0; m < 6; m++) {
      assert.equal(PolishSecurity.credibleStandDown(S, Q.time), true, 'protective while executed until the review');
      if (m === 5 && !keepCompetence) S.cabinet.portfolios.reichswehr = 'expert';
      settle(Q);
    }
    return { Q, S, agreement, t0 };
  };
  const kept = run(true);
  assert.equal(kept.agreement.status, 'active');
  assert.equal(kept.agreement.review_at, kept.t0 + 12, 'extended on unchanged terms');
  assert.equal(PolishSecurity.credibleStandDown(kept.S, kept.Q.time), true);
  assert.deepEqual(impulses(kept.S, 'pils_agreement').map(i => i.value), [-12], 'the extension repeats no relief');
  const lapsed = run(false);
  assert.equal(lapsed.agreement.status, 'expired');
  assert.equal(lapsed.agreement.history.at(-1).competent, false, 'no competent executor at the review');
  assert.equal(PolishSecurity.credibleStandDown(lapsed.S, lapsed.Q.time), false, 'its protection ends');
  assert.deepEqual(impulses(lapsed.S, 'pils_agreement').map(i => i.value), [-12], 'the end of the term is no breach: no +8');
  assert.equal(Object.values(lapsed.S.politics.cases).filter(c => c.kind === 'military').length, 0, 'no case is reopened');
});

test('Sprawiedliwość: a confirmed unlawful act lifts only its restriction (democracy +1 once); no grounds and no execution lift nothing; no review clears all repression', () => {
  const Q = withPortfolios(quiet(), 'justice');
  const S = Q.S;
  // Decision 3A: executed violence of a PPS organisation opens a case; only a repressive cabinet (14.4) bans the Milicja.
  const own = PolishPolitics.organisationViolence(Q, { id: 'militia:fixture_1', subject: 'a fixture clash with Milicja PPS' });
  assert.deepEqual([own.kind, own.assigned_party, own.restriction_ids, S.militia.banned], ['pps_violence', 'pps', [], false], 'a case without a ban');
  const configuration = S.cabinet.configuration_id;
  S.cabinet.configuration_id = 'chjeno_piast'; // fixture: the repressive profile of 14.4
  PolishPolitics.organisationViolence(Q, { id: 'militia:fixture_2', subject: 'another fixture clash with Milicja PPS' });
  S.cabinet.configuration_id = configuration;
  const ban = S.politics.restrictions['militia_ban:militia:fixture_2'];
  assert.deepEqual([ban.kind, ban.lawful, S.militia.banned, Q.pps_militia_banned], ['militia_ban', true, true, 1], 'a lawful restriction');
  assert.match(PolishParty.militiaStatus(Q, 'recruit').reason, /banned/);
  PolishPolitics.addRestriction(Q, { id: 'a_repression', kind: 'strike_repression', target: 'fixture strikers', lawful: false });
  PolishPolitics.addRestriction(Q, { id: 'z_repression', kind: 'strike_repression', target: 'other fixture strikers', lawful: false });
  // Z — 1.00 (decision 1A of 7 XI 2026): the review left the card of Justice; the rules keep it for games saved before.
  const review = () => {
    const r = PolishProjects.reviewTarget(S);
    const project = PolishProjects.createProject(Q, 'justice_review', 'limited_redress', { sponsor: 'pps', responsibility: { pps: 0.70 },
      policy_choices: { restriction_id: r.id, case_id: r.case_id } });
    PolishProjects.launchProject(Q, project, { sponsor: 'pps' });
    return project;
  };
  review();
  const first = Object.values(S.projects).find(p => p.type === 'justice_review');
  assert.deepEqual([first.policy_choices.restriction_id, first.price_B, first.duration_months], ['a_repression', 1, 1]);
  const d0 = S.politics.democracy;
  settle(Q);
  assert.deepEqual([first.policy_choices.result, S.politics.restrictions.a_repression.status], ['unlawful', 'lifted']);
  close(S.politics.democracy, d0 + 0.06 + 1, 1e-9, 'a legal defence: +1 once');
  assert.equal(S.politics.restrictions.z_repression.status, 'active', 'the other repression stays');
  free(Q);
  review();
  settle(Q);
  const second = Object.values(S.projects).filter(p => p.type === 'justice_review').at(-1);
  assert.deepEqual([second.policy_choices.restriction_id, second.policy_choices.result], [ban.id, 'no_grounds']);
  assert.deepEqual([ban.status, S.militia.banned], ['active', true], 'a lawful ban stays');
  free(Q);
  review();
  const third = Object.values(S.projects).filter(p => p.type === 'justice_review').at(-1);
  S.cabinet.status = 'caretaker';
  settle(Q);
  assert.deepEqual([third.policy_choices.restriction_id, third.status, third.policy_choices.result], ['z_repression', 'executing', undefined], 'no execution, no result');
  assert.equal(S.politics.restrictions.z_repression.status, 'active');
  S.cabinet.status = 'active';
  free(Q);
  assert.equal(PolishProjects.reviewTarget(S), null, 'the same material is not reviewed again');
  assert.match(PolishProjects.optionStatus(Q, 'justice_policy', 'limited_redress').reason, /Unknown option/, 'the review is not on the card');
  // Z — 1.00 (decision 2A): the democratic guarantees are a motion of the constitutional debate itself, not an option of the card.
  assert.match(PolishProjects.optionStatus(Q, 'justice_policy', 'broad_safeguards').reason, /Unknown option/);
});

test('Autonomia: after the law and before the end of the work no relief; at the end −3 once for the covered population and a real limit of competence; the schools still cost separately', () => {
  const Q = withPortfolios(ppsMajority(quiet()), 'interior', 'education');
  const S = Q.S;
  // Z — 0.99 (decision 2B): the card „Kresy i mniejszości” carries out the act also without a promise to the minorities.
  assert.equal(PolishProjects.optionStatus(Q, 'minorities_kresy', 'self_government').available, true);
  const zln = S.actors.relations.zln;
  S.agreements['agr-fixture-minorities'] = { id: 'agr-fixture-minorities', kind: 'support', parties: ['pps', 'other_minorities_rep'], cabinet_id: S.cabinet.id,
    signed_at: Q.time, status: 'active', tension: 0, warning_issued: false, ultimatum: null, extensions_used: 0, responsibility: { pps: 1 }, response: null,
    obligations: [{ id: 'agr-fixture-minorities:language_rights', topic: 'language_rights', position: null, owner: 'cabinet', kind: 'constraint',
      beneficiaries: ['other_minorities_rep'], required_project: null, required_variants: null, required_stage: null, portfolio: null, weight: 2,
      due_at: null, status: 'active', fulfillment: 1, last_checked: null }], history: [{ t: Q.time, kind: 'signed' }] };
  // Z — 0.93 (decision 4A of 24 X 2026): the law is filed in the same decision.
  PolishProjects.chooseOption(Q, 'minorities_kresy', 'self_government');
  const project = Object.values(S.projects).find(p => p.type === 'limited_autonomy');
  assert.equal(S.actors.relations.zln, zln - 5, 'the National Democrats protest when the law takes effect');
  assert.deepEqual([project.status, project.policy_choices.territory_id, project.policy_choices.delegated_capabilities],
    ['executing', 'synthetic_autonomy_area', ['schools', 'official_language', 'culture']]);
  const law = S.parliament.laws.at(-1);
  assert.deepEqual([law.project_id, law.programme.autonomy, law.status], [project.id, 1, 'enacted']);
  const cells = S.society.cells.filter(c => c.identity_id === 'other_minorities');
  const oneOff = () => { const g0 = cells.map(c => c.grievance); PolishPolitics.applyRecordedEffects(Q, Q.time); return cells.map((c, i) => c.grievance - g0[i]); };
  // The months of execution without politics, so that a one-off effect waits until it is applied here.
  const month = () => { const t = Q.time; free(Q); Q.time = t + 1; Q.year = PolishRules.yearOf(Q.time); Q.month = PolishRules.monthOf(Q.time); PolishProjects.settleMonth(Q, { t }); };
  assert.deepEqual(oneOff(), cells.map(() => 0), 'the law alone gives no relief');
  assert.equal(PolishProjects.delegation(S, 'schools'), null, 'nothing delegated before the execution');
  month();
  assert.equal(project.status, 'completed', 'Z — 1.01: carried out at the settlement of the month of the decision');
  for (const d of oneOff()) close(d, -3 * 0.5, 1e-9, '−3 for the covered half of the other minorities');
  assert.deepEqual(oneOff(), cells.map(() => 0), 'once');
  assert.equal(PolishProjects.delegation(S, 'schools').territory_id, 'synthetic_autonomy_area');
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'minority_school_rights', 'polish_dominance').reason, /delegated to its self-government/,
    'a central order outside its competence is no lawful act');
  assert.equal(PolishProjects.optionStatus(Q, 'minority_school_rights', 'own_language').available, true, 'the schools are a separate programme');
  assert.match(PolishProjects.optionStatus(Q, 'minorities_kresy', 'self_government').reason, /in force/, 'the same area gets no second reward');
  assert.equal(S.agreements['agr-fixture-minorities'].history.at(-1).kind, 'autonomy_executed');
});

// ---- The coup F, profile coup_f_v1 (16.4–16.8; M08, M10, M15; card catalogue 9.15) ----

// The synthetic groups of synthetic_test_v2 as the engine reads them, with the sides of a recorded draw.
function coupGroups(sides) {
  const Q = quiet();
  return PolishSecurity.coupGroups(Q.S, Q.time).map((g, i) => Object.assign(g, { side: sides[i] }));
}
const SIDES = ['legal', 'pils', 'neutral'];
const EXAMPLE = ['legal', 'pils', 'pils', 'legal']; // the worked example of M08
const resolve = (sides, cfg) => PolishSecurity.resolveAttempt(coupGroups(sides), cfg);
// The exact enumeration of the 81 draws with the effective loyalties at a democracy (16.1, M10).
function enumerate(cfg, democracy = cfg.democracy) {
  const Q = quiet();
  const rows = Q.S.security.forces.map(f => { const e = PolishSecurity.effectiveLoyalty(f, democracy); return [e.legal, e.pils, e.neutral]; });
  const out = { outcomes: {}, f9: 0, decisive: 0 };
  for (const a of [0, 1, 2]) for (const b of [0, 1, 2]) for (const c of [0, 1, 2]) for (const d of [0, 1, 2]) {
    const idx = [a, b, c, d], p = idx.reduce((n, k, i) => n * rows[i][k], 1), sides = idx.map(k => SIDES[k]);
    const r = resolve(sides, cfg), w = resolve(sides, { ...cfg, no_pps: true });
    out.outcomes[r.outcome] = (out.outcomes[r.outcome] || 0) + p;
    if (r.f9) out.f9 += p;
    if (cfg.stance && r.outcome === cfg.stance + '_victory' && PolishSecurity.contributionOf(r, w) === 'decisive') out.decisive += p;
  }
  return out;
}
const pct = v => Math.round(1000 * (v || 0)) / 10;
// A game at the gate check of February 1926 (4.2 step 8): all gates of 16.2 can be met.
function atGates(pressure = 70) {
  const Q = quiet();
  const S = Q.S;
  Q.time = 50; Q.year = 1926; Q.month = 2;
  S.turn.last_settled_time = 49;
  S.coup.pressure = pressure;
  return Q;
}
function declared(pressure = 70) {
  const Q = atGates(pressure);
  PolishSecurity.checkCoupGates(Q, 50);
  Q.time = 51; Q.month = 3;
  assert.equal(Q.S.coup.phase, 'attempt_declared');
  return Q;
}
// The recorded draws that give each group a chosen side at any democracy of these tests.
const U = { capital_legal: { legal: 0.1, neutral: 0.99 }, capital_pils: { legal: 0.01, pils: 0.5, neutral: 0.99 },
  near_reserve: { legal: 0.1, pils: 0.5, neutral: 0.95 }, remote_reserve: { legal: 0.1, pils: 0.6, neutral: 0.95 } };
function fixSides(Q, sides) {
  Q.S.security.forces.forEach((f, i) => { Q.S.rng.rolls[`coup_${Q.S.coup.attempt_id}:${f.id}:allegiance`] = U[f.id][sides[i]]; });
}

test('Profil M08 w silniku gry: the 81 draws reproduce 16.8.8, M10 and M15 exactly (the table is diagnostics of rules, not a forecast)', () => {
  const passive = enumerate({ democracy: 60 });
  assert.deepEqual([pct(passive.outcomes.pils_victory), pct(passive.outcomes.legal_victory), pct(passive.outcomes.constitutional_compromise),
    pct(passive.outcomes.prolonged_conflict)], [43.8, 21.7, 34.5, 0]);
  const support = enumerate({ stance: 'pils', rail: { by_round: [80, 80, 80, 80], readiness: 100 }, democracy: 60, f9: 'accept' });
  assert.deepEqual([pct(support.outcomes.pils_victory), pct(support.outcomes.legal_victory), pct(support.outcomes.constitutional_compromise),
    pct(support.f9), pct(support.decisive)], [72.2, 9.4, 18.4, 12.2, 28.4]);
  const defend = enumerate({ stance: 'legal', militia_F: 6, democracy: 60, f9: 'accept' });
  assert.deepEqual([pct(defend.outcomes.pils_victory), pct(defend.outcomes.legal_victory), pct(defend.outcomes.constitutional_compromise),
    pct(defend.f9), pct(defend.decisive)], [39.7, 36.0, 24.3, 24.3, 14.3]);
  const at45 = enumerate({ democracy: 45 }), at75 = enumerate({ democracy: 75 });
  assert.deepEqual([pct(at45.outcomes.pils_victory), pct(at45.outcomes.legal_victory), pct(at45.outcomes.constitutional_compromise),
    pct(at45.outcomes.prolonged_conflict)], [46.4, 18.6, 6.9, 28.2]);
  assert.deepEqual([pct(at75.outcomes.pils_victory), pct(at75.outcomes.legal_victory), pct(at75.outcomes.constitutional_compromise)], [41.1, 24.9, 33.9]);
  const reject = enumerate({ stance: 'pils', rail: { by_round: [80, 80, 80, 80], readiness: 100 }, democracy: 60, f9: 'reject' });
  assert.equal(pct(reject.outcomes.prolonged_conflict), 12.2, 'a rejected F9 leaves no winner in 12.2%');
});

test('Zero sił: with F = 0 on both sides there is no NaN, no division by zero and no invented military advantage', () => {
  for (const democracy of [60, 30]) {
    const r = resolve(['neutral', 'neutral', 'neutral', 'neutral'], { democracy });
    assert.ok(!r.outcome.endsWith('_victory'), 'no military victory');
    assert.ok(r.log.every(l => l.pils === 0 && l.legal === 0 && Number.isFinite(l.pils)));
    assert.ok(r.groups.every(g => g.loss === 0));
    assert.ok(!/NaN|Infinity/.test(JSON.stringify(r)));
  }
  assert.equal(resolve(['neutral', 'neutral', 'neutral', 'neutral'], { democracy: 60 }).outcome, 'constitutional_compromise',
    'an even 50 of disadvantage and exhaustion reach a settlement in the final assessment');
  assert.equal(resolve(['neutral', 'neutral', 'neutral', 'neutral'], { democracy: 30 }).outcome, 'prolonged_conflict');
});

// Z — 0.89 (decision 2A of 24 X 2026): every free member answers; AS is the same people ×1.2 (before: the compliance +0.15).
test('AS w zamachu: defending the government with the Milicja of 4 F and with AS of the same people (×1.2), democracy 60: one task; F9 in 6.2% and 30.4% of the draws', () => {
  const Q = declared();
  const S = Q.S;
  PolishSecurity.coupBegin(Q);
  PolishSecurity.coupStance(Q, 'defend_legal');
  S.militia.militancy = 1;
  S.militia.strength = 400;
  const milicja = PolishSecurity.militiaCall(S, 'defend_legal');
  close(milicja.force, 4, 0.02, 'the Milicja: 4 F');
  assert.equal(milicja.executing, milicja.available, 'every free member answers');
  S.militia.stage = 2;
  const as = PolishSecurity.militiaCall(S, 'defend_legal');
  assert.equal(as.available, milicja.available, 'the same people');
  close(as.force / milicja.force, 1.2, 0.001, 'AS ×1.2');
  assert.deepEqual([pct(enumerate({ stance: 'legal', militia_F: 4, democracy: 60, f9: 'accept' }).f9),
    pct(enumerate({ stance: 'legal', militia_F: 4.8, democracy: 60, f9: 'accept' }).f9)], [6.2, 30.4]);
  PolishSecurity.coupCommit(Q, 'militia');
  const called = S.coup.attempt.organisations;
  assert.deepEqual([called.militia_task, called.militia.executing <= called.militia.available], ['confrontation', true], 'one task of the Milicja in the attempt');
});

test('Podwójny przydział: people protecting a strike cannot also fight; the call takes only the free people and never multiplies the force', () => {
  const Q = declared();
  const S = Q.S;
  PolishSecurity.coupBegin(Q);
  PolishSecurity.coupStance(Q, 'defend_legal');
  S.strikes.records.fixture = { id: 'fixture', status: 'active', branches: ['industry'], protection: { people: S.militia.strength, force: 1, since: 50 },
    clashes: [], settlements: [] };
  assert.equal(PolishSecurity.militiaPeopleFree(S), 0);
  assert.match(PolishSecurity.coupCommitStatus(Q, 'militia').reason, /no free people/);
  assert.match(PolishSecurity.coupCommitStatus(Q, 'both').reason, /no free people/);
  S.strikes.records.fixture.protection.people = S.militia.strength - 50;
  assert.equal(PolishSecurity.militiaPeopleFree(S), 50);
  const call = PolishSecurity.militiaCall(S, 'defend_legal');
  assert.ok(call.executing <= 50, 'at most the free people');
  delete S.strikes.records.fixture;
});

test('Losowanie po F5: the side of each group is drawn once after F5 with the democracy of the declaration; a later change and a load change nothing', () => {
  const engine = dendry.startGame();
  const Q = quiet(engine);
  const S = Q.S;
  Q.time = 50; Q.year = 1926; Q.month = 2; S.turn.last_settled_time = 49; S.coup.pressure = 70;
  S.politics.democracy = 80;
  PolishSecurity.checkCoupGates(Q, 50);
  Q.time = 51; Q.month = 3;
  const A = S.coup.attempt;
  assert.deepEqual([A.democracy, A.loyalty_shift, A.sides], [80, 0.05, null], 'no draw before F5');
  PolishSecurity.coupBegin(Q);
  PolishSecurity.coupStance(Q, 'mediate');
  S.rng.rolls[`coup_${S.coup.attempt_id}:near_reserve:allegiance`] = 0.80; // fixture: neutral at democracy 80, with Piłsudski at 20
  S.politics.democracy = 20;
  PolishSecurity.coupCommit(Q, 'none');
  assert.equal(A.sides.near_reserve, 'neutral', 'the shift of the moment of the declaration');
  const restored = dendry.saveAndRestore(engine).state.qualities;
  assert.deepEqual(restored.S.coup.attempt.sides, A.sides);
  assert.equal(restored.S.rng.rolls[`coup_${S.coup.attempt_id}:near_reserve:allegiance`], 0.80);
  assert.equal(restored.S.security.forces.find(f => f.id === 'near_reserve').committed_side, 'neutral');
});

test('Szybkie zwycięstwo: an advantage of 2 after the first round ends it at once; 1.3 in rounds 1–2 without reinforcements of the opponent ends it after round 2', () => {
  const crushing = resolve(['neutral', 'pils', 'pils', 'legal'], { democracy: 75 });
  assert.deepEqual([crushing.outcome, crushing.round, crushing.crushing], ['pils_victory', 1, true]);
  const steady = resolve(['legal', 'pils', 'neutral', 'neutral'], { democracy: 75 });
  assert.ok(steady.log[0].pils > 1.2 * steady.log[0].legal && steady.log[0].pils < 2 * steady.log[0].legal);
  assert.deepEqual([steady.outcome, steady.round, steady.crushing], ['pils_victory', 2, false], 'no waiting for round 3');
});

test('Nadchodząca rezerwa: an advantage after round 2 with the reserve of the opponent arriving in round 3 is no victory; the same reserve delayed by rail gives the victory after round 2', () => {
  const noStrike = resolve(EXAMPLE, { democracy: 75 });
  assert.ok(!noStrike.outcome.endsWith('_victory') || noStrike.round > 2);
  assert.equal(noStrike.log.find(l => l.round === 2).streak.pils, 0, 'the reserve due next round counts in round 2');
  const delayed = resolve(EXAMPLE, { stance: 'pils', rail: { by_round: [80, 80, 80, 80], readiness: 100 }, democracy: 75, f9: 'accept' });
  assert.deepEqual([delayed.outcome, delayed.round], ['pils_victory', 2]);
  assert.deepEqual(delayed.groups.find(g => g.id === 'remote_reserve').delays, 2);
});

test('Pomiar strajku: a share of 80 in round 1 that fades before the round before the arrival gives no delay; that round decides the blockade; the railway call costs nothing (Z — 0.86)', () => {
  const fading = resolve(EXAMPLE, { stance: 'pils', rail: { by_round: [80, 30, 30, 30], readiness: 100 }, democracy: 75, f9: 'accept' });
  assert.equal(fading.groups.find(g => g.id === 'remote_reserve').delays, 0);
  // The call of the game: the same base share in every round, without money (Z — 0.86, decision 9A).
  const Q = declared();
  const S = Q.S;
  Object.assign(S.unions.rail, { reach: 100, readiness: 100, fatigue: 0, dissent: 0 });
  S.party_orgs.cash = 0;
  const call = PolishSecurity.railCall(S, 'support_pils');
  assert.deepEqual(call.by_round, [call.base, call.base, call.base, call.base]);
  assert.ok(call.base >= 40, 'a strong railway branch blocks without money');
});

test('Istotny udział: the Milicja of 1 F beside a side of 45 F, of 6 F beside 45 F, a strike delaying a transport, a neutral protection: F9 no / yes / yes / no', () => {
  const side45 = [{ id: 'fixture_legal', base: 45, readiness: 1, command: 1, phase: 0, rail: false, rail_cap: 0, side: 'legal' },
    { id: 'fixture_pils', base: 45, readiness: 1, command: 1, phase: 0, rail: false, rail_cap: 0, side: 'pils' }];
  const at = cfg => { const res = PolishSecurity.newResolution(side45, { democracy: 60, ...cfg }); return PolishSecurity.significantAt(res, PolishSecurity.sideForce(res, 0), 0); };
  assert.equal(at({ stance: 'legal', militia_F: 1 }), false);
  assert.equal(at({ stance: 'legal', militia_F: 6 }), true);
  const strike = PolishSecurity.newResolution(coupGroups(EXAMPLE), { stance: 'pils', rail: { by_round: [80, 80, 80, 80], readiness: 100 }, democracy: 75 });
  assert.equal(PolishSecurity.significantAt(strike, PolishSecurity.sideForce(strike, 1), 1), true, 'a delay known by this round');
  assert.equal(at({ stance: 'neutral', militia_F: 6 }), false, 'a neutral protection has no F9');
});

test('Ugoda w rundzie 1: an offer scored ≥60 by both sides before the first fighting is not accepted; the assessment starts in round 2', () => {
  // A fixture offer both sides like (the three offers of 16.8.5 cannot reach 60 for both before any exhaustion).
  const offers = [{ id: 'fixture.offer', pils: 100, legal: 100 }];
  const balanced = [{ id: 'a', base: 40, readiness: 1, command: 1, phase: 0, side: 'legal' }, { id: 'b', base: 40, readiness: 1, command: 1, phase: 0, side: 'pils' }];
  const even = PolishSecurity.newResolution(balanced, { democracy: 100, offers });
  assert.ok(PolishSecurity.bestOffer(even, PolishSecurity.sideForce(even, 0), 0).min >= 60, 'both would accept before the first fighting');
  const r = PolishSecurity.resolveAttempt(balanced, { democracy: 100, offers });
  assert.deepEqual([r.outcome, r.round, r.offer], ['constitutional_compromise', 2, 'fixture.offer'], 'the first assessment after one completed round');
  assert.equal(r.log.length, 1, 'one round was fought');
});

test('Przewaga nie negocjuje: a side with an advantage of 1.25 in the current round accepts nothing in rounds 2–4; in the final assessment the rule no longer applies', () => {
  const groups = [{ id: 'a', base: 40, readiness: 1, command: 1, phase: 0, side: 'legal' }, { id: 'b', base: 50, readiness: 1, command: 1, phase: 0, side: 'pils' }];
  const res = PolishSecurity.newResolution(groups, { democracy: 100 });
  const F = PolishSecurity.sideForce(res, 0);
  close(F.pils / F.legal, 1.25, 1e-12);
  for (const completed of [1, 2, 3]) assert.equal(PolishSecurity.bestOffer(res, F, completed), null, `round ${completed + 1}`);
  const final = PolishSecurity.bestOffer(res, F, 4);
  assert.ok(final && final.min >= 60, 'the ordinary assessment after round 4');
});

test('Odrzucone F9: with a significant share and both sides ready, a rejection closes every settlement until the end, also in the final assessment; the reputation does not change', () => {
  const Q = declared();
  const S = Q.S;
  fixSides(Q, EXAMPLE);
  S.militia.strength = 620; S.militia.militancy = 1; // fixture: a Milicja of about 6 F (Z — 0.89: every member answers)
  S.politics.democracy = 75; S.coup.attempt.democracy = 75; // fixture: the democracy of the declaration
  PolishSecurity.coupBegin(Q);
  PolishSecurity.coupStance(Q, 'defend_legal');
  const credibility = S.actors.pps.credibility;
  PolishSecurity.coupCommit(Q, 'militia');
  const A = S.coup.attempt;
  assert.ok(A.resolution.pending, 'F9 waits');
  assert.equal(S.coup.outcome, null, 'no outcome before the last decision');
  PolishSecurity.coupF9(Q, 'reject');
  assert.equal(A.resolution.f9.response, 'rejected');
  assert.notEqual(S.coup.outcome, 'constitutional_compromise');
  assert.equal(S.actors.pps.credibility, credibility, 'no change of reputation');
  assert.ok(!Object.values(S.agreements).some(a => a.status === 'breached'), 'no breach');
});

test('Wkład kontrfaktyczny: the same draws with and without PPS give one class of contribution, kept after a load; concessions only with a decisive share and recorded conditions', () => {
  const run = line => {
    const engine = dendry.startGame();
    const Q = quiet(engine);
    const S = Q.S;
    Q.time = 50; Q.year = 1926; Q.month = 2; S.turn.last_settled_time = 49; S.coup.pressure = 70; S.politics.democracy = 75;
    S.actors.pps.strategy.pils_influence = line;
    PolishSecurity.checkCoupGates(Q, 50);
    Q.time = 51; Q.month = 3;
    fixSides(Q, EXAMPLE);
    Object.assign(S.unions.rail, { reach: 100, readiness: 100, fatigue: 0, dissent: 0 });
    PolishSecurity.coupBegin(Q);
    PolishSecurity.coupStance(Q, 'support_pils');
    PolishSecurity.coupCommit(Q, 'rail');
    return { engine, Q, S };
  };
  const conditional = run('conditional');
  assert.deepEqual([conditional.S.coup.outcome, conditional.S.coup.round], ['pils_victory', 2]);
  assert.deepEqual([conditional.S.coup.pps_contribution, conditional.S.coup.attempt.counterfactual.outcome], ['decisive', 'constitutional_compromise']);
  assert.equal(conditional.S.coup.concessions_to_pps.length, 1, 'the conditions of the conditional line become the winner’s obligations');
  assert.ok(conditional.S.coup.attempt.continuation_requirements.some(c => c.startsWith('concessions_to_pps')));
  const restored = dendry.saveAndRestore(conditional.engine).state.qualities;
  assert.equal(restored.S.coup.pps_contribution, 'decisive');
  const unconditional = run('support');
  assert.equal(unconditional.S.coup.pps_contribution, 'decisive');
  assert.deepEqual(unconditional.S.coup.concessions_to_pps, [], 'unconditional support creates no concessions');
});

test('Kryzys i przerwa: pressure 56 is a political crisis; a protective agreement at work calls it off (next attempt at t+3); no attempt before that date even at ≥65', () => {
  const Q = withPortfolios(atGates(56), 'reichswehr');
  const S = Q.S;
  assert.equal(PolishSecurity.checkCoupGates(Q, 50), 'political_crisis', 'a warning, no attempt below 65');
  assert.match(PolishSecurity.statusLine(Q), /Political crisis/);
  free(Q); Q.time = 51; Q.month = 3;
  PolishSecurity.concessionChoose(Q, 'military_function'); // an answer in the crisis: 0 T
  assert.equal(Q.month_actions || 0, 0, 'the answer in an open crisis costs no action');
  assert.equal(PolishSecurity.checkCoupGates(Q, 51), 'dormant');
  assert.equal(S.coup.next_attempt_available_at, 55, 't + 3 from the month of the check');
  S.agreements[S.actors.pilsudski.agreement_id].open_breach = true; // fixture: the protection ends
  S.coup.pressure = 80;
  for (const t of [52, 53]) assert.notEqual(PolishSecurity.checkCoupGates(Q, t), 'attempt_declared', `no attempt at ${t + 1}`);
  assert.equal(PolishSecurity.checkCoupGates(Q, 54), 'attempt_declared', 'from the date of the cooldown');
});
