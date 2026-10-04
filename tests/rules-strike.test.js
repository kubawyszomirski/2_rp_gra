const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Rules of the unions and strikes of stage 6 (implementation plan, stage 6; technical reference 14.1–14.5, 16.5,
// 17.4): the potential of an action, the government's answer, the union's consent, the settlement and its
// execution, the railways in a coup and the finances of organising. Each test starts a real new game and calls the
// rules on its state.
let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

function game() {
  return dendry.startGame().state.qualities;
}
// The month's action was committed by the rules; a test that acts again in the same month frees it.
function free(Q) {
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  Q.month_actions = 0;
}
// One settlement of the unions for period t, without the rest of the month.
function month(Q, t) {
  PolishUnions.beginMonth(Q, { t });
  PolishUnions.endMonth(Q, { t });
}

// Stage 8 (decision 2A) calibrated the opening so that the KPP has 3.2% among the workers; the communist steps of a
// strike need 5% (14.4). These tests of the communist steps use the earlier opening row of the workers as a fixture.
function kppAmongWorkers(Q) {
  const old = { kpp: 11.04, pps: 38.64, npr: 18.4, psl_wyzwolenie: 1.84, psl_piast: 0.92, pschd: 9.2, zln: 7.36, minorities_bloc: 4.6, other: 8 };
  for (const party of Q.parties) Q['workers_' + party] = old[party];
  PolishElectorate.seedCells(Q);
  PolishElectorate.writeClassMirrors(Q);
}

test('a new game has three branches with the lines of a strike call and no strike (schema 7)', () => {
  const Q = game();
  const S = Q.S;
  assert.equal(Q.polish_union_rules, 1);
  for (const id of PolishUnions.BRANCHES) {
    assert.deepEqual([S.unions[id].alignment.strike, S.unions[id].alignment.agreed_end, S.unions[id].strike], [50, 50, null]);
    assert.deepEqual(S.unions[id].dissent_causes, []);
  }
  assert.deepEqual(S.strikes.records, {});
  assert.deepEqual(S.enterprises.records, {});
  assert.deepEqual(PolishRules.validateState(S), []);
  // 14.2 at the opening: reach 20 × readiness 25 % × compliance: a strike of an unprepared branch is weak.
  close(PolishUnions.participation(S, 'industry'), 20 * 0.25 * PolishParty.compliance(50, PolishParty.cohesion(S), 0));
});

test('Zgoda na ugodę: half of the demands and trust 50 give 40 with a full fund (refusal), 60 with an empty one and 50 with fatigue 50', () => {
  const consent = (coverage, fatigue) => PolishUnions.unionConsent({ fulfilment: 0.5, trust: 50, coverage, fatigue });
  assert.deepEqual([consent(1, 0).score, consent(1, 0).accept], [40, false]);
  assert.deepEqual([consent(0, 0).score, consent(0, 0).accept], [60, true]);
  assert.deepEqual([consent(1, 50).score, consent(1, 50).accept], [50, true]);
});

test('Zgoda a fundusz: in the same case a growing fund never raises the consent; it raises the credible pressure', () => {
  const Q = game();
  const S = Q.S;
  S.unions.industry.reach = 60; S.unions.industry.readiness = 70;
  const scores = [], pressures = [];
  for (const fund of [0, 0.3, 0.6, 1.2, 3]) {
    S.unions.industry.fund = fund;
    const p = PolishUnions.potential(S, 'industry');
    pressures.push(p.credible);
    scores.push(PolishUnions.unionConsent({ fulfilment: 0.5, trust: 50, coverage: PolishUnions.fundCoverage(fund, p.cost), fatigue: 0 }).score);
  }
  for (let i = 1; i < scores.length; i++) {
    assert.ok(scores[i] <= scores[i - 1], `consent ${scores}`);
    assert.ok(pressures[i] >= pressures[i - 1], `pressure ${pressures}`);
  }
  assert.ok(pressures[4] > pressures[0] && scores[4] < scores[0]);
});

test('Pełna oferta i czerwona linia: an offer meeting every demand is always accepted, one across a red line never', () => {
  for (const trust of [0, 50, 100]) {
    for (const coverage of [0, 1]) {
      assert.equal(PolishUnions.unionConsent({ fulfilment: 1, trust, coverage, fatigue: 0 }).accept, true);
      assert.equal(PolishUnions.unionConsent({ fulfilment: 1, trust, coverage, fatigue: 100, red_line: true }).accept, false);
    }
  }
});

test('Kruchość gabinetu: 232 / 279 / 200 MPs give 40 / 0 / 72; 232 with tension 60 give 70; a caretaker 100; the Sejm’s authority is no input', () => {
  const Q = game();
  const S = Q.S;
  const cabinet = S.cabinet;
  const at = (seats, tension) => {
    cabinet.status = 'active';
    cabinet.support_seats = seats;
    S.agreements.fixture_tension = { id: 'fixture_tension', tension };
    cabinet.agreement_ids = ['fixture_tension'];
    return PolishGovernment.governmentFragility(S);
  };
  assert.deepEqual([at(232, 0), at(279, 0), at(200, 0), at(232, 60)], [40, 0, 72, 70]);
  cabinet.status = 'caretaker';
  assert.equal(PolishGovernment.governmentFragility(S), 100);
  // 14.4 (Z — 0.24, M12): no reading of the Sejm's authority; the talks read support and disputes only.
  assert.ok(!/authority/.test(PolishGovernment.governmentFragility.toString()));
});

test('Kolej: rail participation 39 or 40 at coordination 50: only the second delays a route; two phases need 65 and 70', () => {
  const delay = PolishUnions.railDelayPhases;
  assert.deepEqual([delay(39, 50), delay(40, 50), delay(40, 49), delay(64, 70), delay(65, 69), delay(65, 70)], [0, 1, 0, 1, 1, 2]);
});

test('Otwarcia finansowe: over 52 months three apparatus levels give +1.65 R and three expansions of a branch +3.26 R against no investment', () => {
  const run = kind => {
    const Q = game();
    const S = Q.S;
    // M18 compares the cash flows of the ledger: enough money for the investments and no character bonus (13.1).
    S.party_orgs.cash = 10;
    S.actors.pps.strategy.electoral_base = 'broad_democratic';
    for (let m = 1; m <= 52; m++) {
      if (kind === 'apparatus' && m <= 3) { S.party_orgs.cash -= 2; S.party_orgs.apparatus.level += 1; }
      if (kind === 'reach' && m <= 3) { S.party_orgs.cash -= 1; S.unions.industry.reach += 15; }
      PolishParty.settleParty(Q, m);
    }
    return S.party_orgs.cash;
  };
  const none = run('none');
  close(run('apparatus') - none, 1.65, 0.005);
  close(run('reach') - none, 3.26, 0.005);
});

test('Zasięg i charakter partii: the rail branch under the workers’ line and Ziemięcki under the broad democratic line ×1.10, at most 1.30 with TUR; the press has no multiplier', () => {
  const Q = game();
  const S = Q.S;
  close(PolishParty.expansionMultiplier(S, { kind: 'branch', id: 'rail' }), 1.10);
  const rail = S.unions.rail.reach;
  PolishParty.organizationsChoose(Q, ['union_organize_rail']);
  free(Q);
  close(S.unions.rail.reach, rail + 16.5);
  S.actors.pps.strategy.electoral_base = 'broad_democratic';
  close(PolishParty.expansionMultiplier(S, { kind: 'class', class_id: 'new_middle' }), 1.10);
  close(PolishParty.expansionMultiplier(S, { kind: 'branch', id: 'rail' }), 1);
  const city = S.society.cells.find(c => c.class_id === 'new_middle' && c.settlement === 'major_city');
  const reach = city.base_reach_pps;
  Q.perl_advisor = 0; Q.ziemiecki_advisor = 1;
  PolishParty.advisorAction(Q, 'ziemiecki', 'municipal_socialism');
  close(city.base_reach_pps, reach + 8 * 1.10);
  S.party_orgs.tur.cadres = 60;
  close(PolishParty.expansionMultiplier(S, { kind: 'class', class_id: 'new_middle' }), 1.30);
  // The press distribution is not an organisation of a class: +10 reach whatever the line.
  const press = S.party_orgs.press.reach;
  S.party_orgs.cash = 5;
  PolishParty.organizationsChoose(Q, ['press_distribution']);
  assert.equal(S.party_orgs.press.reach, press + 10);
});

test('a strike month: one draw from the branch fund, participation and fatigue, and the disruption the economy reads', () => {
  const Q = game();
  const S = Q.S;
  const branch = S.unions.industry;
  branch.reach = 50; branch.readiness = 60;
  PolishUnions.prepare(Q, 'industry', 'limited');
  free(Q);
  PolishUnions.startStrike(Q, 'industry');
  free(Q);
  const rec = PolishUnions.branchRecord(S, 'industry');
  const t = Q.time;
  S.rng.rolls[`strike:${rec.id}:round:1`] = 0.99; // fixture: the government refuses the first round
  const fund = branch.fund + Math.min(0.30, 0.05 * branch.reach / 20) - 0.02;
  const expected = PolishUnions.participation(S, 'industry');
  const cost = PolishUnions.monthlyStrikeCost(expected);
  const inputs = PolishUnions.beginMonth(Q, { t });
  close(branch.fund, Math.max(0, fund - Math.min(fund, cost)), 1e-6);
  close(rec.participants.industry, expected * Math.min(1, fund / cost), 1e-9);
  assert.deepEqual([branch.fatigue, S.unions.rail.fatigue], [5, 0]);
  close(inputs.strike_disruption, 0.5 * rec.participants.industry * 60 / 100, 1e-9);
  // A second visit of the same settlement draws nothing again.
  const again = branch.fund;
  PolishUnions.beginMonth(Q, { t });
  assert.equal(branch.fund, again);
  PolishUnions.endMonth(Q, { t });
  assert.deepEqual([rec.status, rec.rounds.length, rec.rejected], ['active', 1, true]);
});

test('an accepted offer: the agreed end gives trust +5; the wage clause is executed next month and raises wages for two months, the relief waits for stage 7', () => {
  const Q = game();
  const S = Q.S;
  const branch = S.unions.industry;
  branch.reach = 50; branch.readiness = 60;
  PolishUnions.prepare(Q, 'industry', 'limited');
  free(Q);
  PolishUnions.startStrike(Q, 'industry');
  free(Q);
  const rec = PolishUnions.branchRecord(S, 'industry');
  const t = Q.time;
  S.rng.rolls[`strike:${rec.id}:round:1`] = 0.01; // fixture: the government accepts
  month(Q, t);
  assert.equal(rec.status, 'settlement_pending');
  assert.deepEqual(rec.offer.clauses.map(c => c.kind), ['wages']);
  assert.equal(rec.offer.fulfilment, 1);
  const trust = branch.trust;
  PolishUnions.answerOffer(Q, rec.id, 'accept');
  assert.deepEqual([rec.status, rec.outcome, branch.trust, branch.strike], ['ended', 'agreement', trust + 5, null]);
  const settlement = rec.settlements[0];
  assert.deepEqual(settlement.clauses.map(c => [c.kind, c.due_at, c.status]), [['wages', t + 1, 'pending']]);
  const next = PolishUnions.beginMonth(Q, { t: t + 1 });
  assert.equal(settlement.status, 'executed');
  close(next.wage_agreement_pp, 2 * 0.6);
  close(PolishUnions.beginMonth(Q, { t: t + 2 }).wage_agreement_pp, 2 * 0.6);
  assert.equal(PolishUnions.beginMonth(Q, { t: t + 3 }).wage_agreement_pp, 0, 'two months only');
  assert.deepEqual(S.strikes.pending_effects.map(e => [e.id, e.system, e.stage, e.value]), [[settlement.id + ':relief', 'grievance', 7, -4]]);
  PolishUnions.beginMonth(Q, { t: t + 4 });
  assert.equal(S.strikes.pending_effects.length, 1, 'the relief is recorded once');
});

test('a smaller offer reads the same draw; a branch that does not agree to the accepted offer opens E6, and upholding imposes the end on it', () => {
  const Q = game();
  const S = Q.S;
  const branch = S.unions.industry;
  branch.reach = 50; branch.readiness = 60;
  PolishUnions.prepare(Q, 'industry', 'broad');
  free(Q);
  PolishUnions.startStrike(Q, 'industry');
  free(Q);
  const rec = PolishUnions.branchRecord(S, 'industry');
  const t = Q.time;
  PolishUnions.beginMonth(Q, { t });
  const full = PolishUnions.roundChance(S, rec, 60).chance, reduced = PolishUnions.roundChance(S, rec, 40).chance;
  assert.ok(reduced > full);
  S.rng.rolls[`strike:${rec.id}:round:1`] = (full + reduced) / 2; // fixture: between the two chances
  PolishUnions.endMonth(Q, { t });
  assert.deepEqual(rec.offer.clauses.map(c => c.kind), ['wages']);
  assert.equal(rec.offer.fulfilment, 0.5);
  // With a full fund and no fatigue, half of the demands and trust 50 give 40: the branch refuses.
  branch.fund = 5; branch.fatigue = 0;
  PolishUnions.answerOffer(Q, rec.id, 'accept');
  const settlement = rec.settlements[0];
  assert.equal(rec.awaiting_rejection, settlement.id);
  assert.equal(PolishUnions.rejectionDue(Q), true);
  assert.equal(S.strikes.due.polish_event_strike_rejection, rec.id + ':' + settlement.id);
  PolishUnions.rejectionChoose(Q, 'uphold');
  assert.deepEqual([branch.dissent, branch.trust, rec.outcome, settlement.reaction, settlement.status], [10, 42, 'agreement', 'uphold', 'active']);
  assert.equal(branch.dissent_causes.length, 1);
});

test('a political demand has no executor: it is refused without a draw and the next round returns to the limited wage offer', () => {
  const Q = game();
  const S = Q.S;
  PolishUnions.prepare(Q, 'rail', 'limited');
  free(Q);
  PolishUnions.startStrike(Q, 'rail');
  free(Q);
  const rec = PolishUnions.branchRecord(S, 'rail');
  rec.demands.push({ kind: 'cabinet_resignation' });
  rec.threshold = 80;
  PolishUnions.negotiationRound(Q, rec, Q.time);
  assert.deepEqual([rec.rounds[0].u, rec.rounds[0].reason, rec.threshold], [null, 'no_executor', 40]);
  assert.ok(!Object.keys(S.rng.rolls).some(k => k.startsWith(`strike:${rec.id}`)), 'no draw was made');
});

// ---- Stage 6b: the wage case of 1923, the authorities, the communists, the Sejm and E6 ------------------------

// A Chjeno-Piast cabinet (fixture): its police answer a refused settlement with coercion (P, 17.16.5).
function chjenoPiast(Q) {
  const c = Q.S.cabinet;
  Object.assign(c, { configuration_id: 'chjeno_piast', pm: 'witos', party: 'psl_piast', status: 'active', partner_ids: ['zln', 'pschd', 'psl_piast'],
    supporter_ids: [] });
  for (const k of Object.keys(c.portfolios)) c.portfolios[k] = 'zln';
}
function at(Q, year, month) {
  Q.year = year; Q.month = month; Q.time = PolishRules.timeOf(year, month);
}
// Three completed months of real wages below 80 open the wage case of 1923 at the settlement of the third.
function wageCase(Q, year, month) {
  const S = Q.S;
  S.economy.real_wage = 75;
  const t0 = PolishRules.timeOf(year, month) - 3;
  for (const t of [t0, t0 + 1, t0 + 2]) PolishUnions.endMonth(Q, { t });
  at(Q, year, month);
  return PolishUnions.records(S).find(r => r.kind === 'wage_case');
}
function strongBranches(S) {
  for (const id of ['industry', 'rail']) { S.unions[id].reach = 60; S.unions[id].readiness = 70; S.unions[id].fund = 3; }
}
function noSteps(Q) {
  if (PolishUnions.stepsStage(Q.S) === 'cooperation') PolishUnions.chooseCooperation(Q, 'none');
  if (PolishUnions.stepsStage(Q.S) === 'protection') PolishUnions.chooseProtection(Q, 'none');
}

test('the wage case opens after three completed months below 80, not before, and again at the earliest three months after it closed', () => {
  const Q = game();
  const S = Q.S;
  S.economy.real_wage = 75;
  PolishUnions.endMonth(Q, { t: 18 });
  PolishUnions.endMonth(Q, { t: 19 });
  assert.equal(PolishUnions.caseDue(Q), false, 'two months are not enough');
  PolishUnions.endMonth(Q, { t: 20 });
  const rec = PolishUnions.records(S).find(r => r.kind === 'wage_case');
  assert.deepEqual([rec.status, rec.branches, rec.threshold, rec.rejected], ['negotiating', ['industry', 'rail'], 40, true]);
  assert.equal(PolishUnions.caseDue(Q), true);
  assert.equal(S.strikes.due.polish_event_strike_1923, rec.id + ':opened');
  // Without an accepted settlement by the next settlement: +8 grievance of the covered, recorded once for stage 7.
  PolishUnions.endMonth(Q, { t: 21 });
  PolishUnions.endMonth(Q, { t: 22 });
  assert.deepEqual(S.strikes.pending_effects.filter(e => e.cause === 'rejected_wage_demand').map(e => e.value), [8]);
  assert.equal(PolishUnions.records(S).filter(r => r.kind === 'wage_case').length, 1, 'one case while it is open');
});

test('Państwo a PPS w strajku: with Labour, the Interior or no portfolio: one goal and one answer of the authorities within their competence', () => {
  const answers = portfolios => {
    const Q = game();
    const S = Q.S;
    chjenoPiast(Q);
    Object.assign(S.cabinet.portfolios, portfolios);
    strongBranches(S);
    const rec = wageCase(Q, 1923, 10);
    PolishUnions.caseChoose(Q, 'economic_strike');
    noSteps(Q);
    const t = Q.time;
    PolishUnions.beginMonth(Q, { t });
    S.rng.rolls[`strike:${rec.id}:round:1`] = 0.99; // fixture: the government refuses
    PolishUnions.endMonth(Q, { t });
    return { response: rec.state_response, repressed: !!rec.repression, strategy: rec.strategy, answers: rec.parliament_responses.length };
  };
  const labour = answers({ labor: 'pps' }), interior = answers({ interior: 'pps' }), none = answers({});
  assert.deepEqual([labour.response.labour, labour.response.police], ['pps_mediation', 'repress'], 'Labour mediates and gives no order to the police');
  assert.equal(labour.repressed, true);
  assert.deepEqual([interior.response.labour, interior.response.police, interior.repressed], ['cabinet', 'pps_protection', false]);
  assert.deepEqual([none.response.labour, none.response.police, none.repressed], ['cabinet', 'repress', true]);
  for (const x of [labour, interior, none]) assert.equal(x.strategy, 'economic_strike', 'one goal of the protest');
  const scenes = dendry.startGame().game.scenes;
  assert.deepEqual(scenes.polish_event_strike_1923.options.map(o => o.id.split('.').pop()), ['negotiate', 'economic_strike', 'cabinet_resignation'],
    'no second menu B10');
});

test('Kraków: the rise is paid, the repression is not withdrawn: one clause executed, the others open; no automatic resignation of the cabinet', () => {
  const Q = game();
  const S = Q.S;
  chjenoPiast(Q);
  strongBranches(S);
  const rec = wageCase(Q, 1923, 10);
  PolishUnions.caseChoose(Q, 'economic_strike');
  noSteps(Q);
  let t = Q.time;
  S.rng.rolls[`strike:${rec.id}:round:1`] = 0.99; // the government refuses: coercion and the railways militarised
  PolishUnions.beginMonth(Q, { t });
  PolishUnions.endMonth(Q, { t });
  assert.equal(rec.krakow, true, 'X–XI 1923 with coercion: the Kraków context of the same case');
  assert.deepEqual(rec.demands.map(d => d.kind), ['wages', 'repression', 'rail_militarization']);
  assert.equal(rec.threshold, 60);
  assert.ok(S.strikes.pending_effects.some(e => e.id === rec.id + ':rail_militarization' && e.value === 10));
  assert.equal(rec.clashes.length, 1, 'one draw of a clash for the phase');
  // The Sejm answers the coercion: the demands are put again; the next round brings a full offer.
  assert.equal(PolishUnions.responseDue(Q), true);
  S.rng.rolls[`strike:${rec.id}:round:2`] = 0.99;
  PolishUnions.responseChoose(Q, 'demands');
  at(Q, 1923, 11); t = Q.time;
  S.rng.rolls[`strike:${rec.id}:round:3`] = 0.01;
  PolishUnions.beginMonth(Q, { t });
  PolishUnions.endMonth(Q, { t });
  assert.deepEqual(rec.offer.clauses.map(c => c.kind), ['wages', 'repression', 'rail_militarization']);
  PolishUnions.responseChoose(Q, 'settlement');
  const settlement = rec.settlements[0];
  assert.equal(rec.status, 'ended');
  PolishUnions.beginMonth(Q, { t: t + 1 });
  assert.deepEqual(settlement.clauses.map(c => [c.kind, c.status]), [['wages', 'executed'], ['repression', 'pending'], ['rail_militarization', 'pending']]);
  assert.equal(settlement.status, 'active', 'the settlement is not executed as a whole');
  assert.deepEqual([S.cabinet.configuration_id, S.cabinet.status], ['chjeno_piast', 'active'], 'no resignation from the street');
  assert.ok(!S.strikes.pending_effects.some(e => e.cause === 'settlement_executed'), 'no relief before the whole settlement is executed');
});

test('Komuniści: one strike opened three times gives one trial; two different successful trials, one of them full, open the further preparation', () => {
  const Q = game();
  kppAmongWorkers(Q);
  const S = Q.S;
  PolishGovernment.kppContact(Q);
  free(Q);
  PolishGovernment.changeRelation(Q, 'kpp', 50 - S.actors.relations.kpp, 'fixture');
  strongBranches(S);
  assert.ok(PolishUnions.communistsActive(S, { branches: ['industry'] }), 'the KPP has at least 5% among the workers');
  const strike = (branch, mode) => {
    // Stage 8 (8f): the KPP, with its political goal, joins a full committee only for a broad or a political demand.
    PolishUnions.prepare(Q, branch, mode === 'full' ? 'broad' : 'limited'); free(Q);
    PolishUnions.startStrike(Q, branch); free(Q);
    const rec = PolishUnions.branchRecord(S, branch);
    for (let i = 0; i < 3; i++) PolishUnions.stepsView(Q); // the step is opened three times
    S.rng.rolls[`kpp_discipline:${rec.id}`] = 0.01; // fixture: the KPP keeps the rules
    PolishUnions.chooseCooperation(Q, mode);
    assert.throws(() => PolishUnions.chooseCooperation(Q, mode), /chooseCooperation/, 'no second choice of the partner');
    PolishUnions.chooseProtection(Q, 'none');
    const t = Q.time;
    S.rng.rolls[`strike:${rec.id}:round:1`] = 0.01;
    PolishUnions.beginMonth(Q, { t });
    PolishUnions.endMonth(Q, { t });
    PolishUnions.responseChoose(Q, 'settlement');
    assert.equal(rec.outcome, 'agreement');
    Q.time += 1;
    return rec;
  };
  const first = strike('industry', 'full');
  const trials = S.actors.communist_cooperation.trial_records;
  assert.deepEqual(trials.map(r => [r.action_id, r.mode, r.result]), [[first.id, 'full', 'success']]);
  assert.match(PolishParty.kppStepStatus(Q, 'rules').reason, /two different successful joint actions/);
  const second = strike('rail', 'limited');
  assert.deepEqual(trials.map(r => [r.action_id, r.result]), [[first.id, 'success'], [second.id, 'success']]);
  assert.equal(S.actors.relations.kpp, 57, '+5 for the full and +2 for the limited trial');
  assert.equal(PolishParty.kppStepStatus(Q, 'rules').available, true);
});

test('Współpraca i eskalacja: full cooperation with a broad demand and a partner who keeps the end add agreed pressure, no violence and no radical demand', () => {
  const Q = game();
  kppAmongWorkers(Q);
  const S = Q.S;
  PolishGovernment.kppContact(Q);
  free(Q);
  PolishGovernment.changeRelation(Q, 'kpp', 40 - S.actors.relations.kpp, 'fixture');
  strongBranches(S);
  PolishUnions.prepare(Q, 'industry', 'broad'); free(Q);
  PolishUnions.startStrike(Q, 'industry'); free(Q);
  const rec = PolishUnions.branchRecord(S, 'industry');
  S.rng.rolls[`kpp_discipline:${rec.id}`] = 0.01;
  PolishUnions.chooseCooperation(Q, 'full');
  PolishUnions.chooseProtection(Q, 'none');
  const t = Q.time;
  PolishUnions.beginMonth(Q, { t });
  const withPartner = PolishUnions.roundChance(S, rec, 40);
  const saved = rec.communist_cooperation.pressure.industry;
  rec.communist_cooperation.pressure.industry = 0;
  const alone = PolishUnions.roundChance(S, rec, 40);
  rec.communist_cooperation.pressure.industry = saved;
  close(withPartner.rows[0].credible - alone.rows[0].credible, 10);
  assert.ok(withPartner.chance > alone.chance);
  S.rng.rolls[`strike:${rec.id}:round:1`] = 0.99;
  PolishUnions.endMonth(Q, { t });
  assert.deepEqual([rec.clashes.length, rec.level, rec.demands.map(d => d.kind), rec.uncontrolled_participation], [0, 'broad', ['wages', 'conditions'], 0]);
});

test('Cel KPP (etap 8, 8f): with its political goal the KPP refuses a full committee for one wage demand; at relation 30 a broad demand keeps the rules with 40%, a political one with 65%', () => {
  const Q = game();
  kppAmongWorkers(Q);
  const S = Q.S;
  PolishGovernment.kppContact(Q);
  free(Q);
  PolishGovernment.changeRelation(Q, 'kpp', 30 - S.actors.relations.kpp, 'fixture');
  strongBranches(S);
  PolishUnions.prepare(Q, 'industry', 'limited'); free(Q);
  PolishUnions.startStrike(Q, 'industry'); free(Q);
  assert.match(PolishUnions.cooperationStatus(Q, 'full').reason, /does not accept/);
  assert.equal(PolishUnions.cooperationStatus(Q, 'limited').available, true, 'limited coordination stays possible');
  assert.deepEqual(['limited', 'broad', 'structural'].map(level => PolishParty.goalFit(level, 'structural')), [0, 50, 100]);
  close(PolishParty.partnerCompliance(30, PolishParty.goalFit('broad', 'structural')), 0.40);
  close(PolishParty.partnerCompliance(30, PolishParty.goalFit('structural', 'structural')), 0.65);
});

test('Strajk i Sejm: the answers read the earlier choices; no new partner, no second strike and no double penalty for withdrawing support', () => {
  const Q = game();
  const S = Q.S;
  chjenoPiast(Q);
  strongBranches(S);
  const rec = wageCase(Q, 1923, 10);
  PolishUnions.caseChoose(Q, 'economic_strike');
  noSteps(Q);
  let t = Q.time;
  S.rng.rolls[`strike:${rec.id}:round:1`] = 0.99;
  PolishUnions.beginMonth(Q, { t });
  PolishUnions.endMonth(Q, { t });
  const before = JSON.stringify(rec.communist_cooperation);
  for (let i = 0; i < 3; i++) PolishUnions.responseView(Q); // the answer is opened again
  S.rng.rolls[`strike:${rec.id}:round:2`] = 0.99;
  PolishUnions.responseChoose(Q, 'demands');
  assert.equal(PolishUnions.responseDue(Q), false, 'one answer in this phase');
  t += 1;
  S.rng.rolls[`strike:${rec.id}:round:3`] = 0.01;
  PolishUnions.beginMonth(Q, { t });
  PolishUnions.endMonth(Q, { t });
  assert.equal(PolishUnions.responseDue(Q), true, 'a new offer is a new phase');
  PolishUnions.responseChoose(Q, 'order');
  assert.deepEqual([S.unions.industry.dissent, S.unions.industry.trust], [10, 42]);
  assert.equal(JSON.stringify(rec.communist_cooperation), before, 'the partner is not chosen again');
  assert.equal(PolishUnions.records(S).length, 1, 'no second strike');
  t += 1;
  PolishUnions.beginMonth(Q, { t });
  PolishUnions.endMonth(Q, { t });
  assert.deepEqual([rec.status, rec.outcome], ['ended', 'withdrawn']);
  assert.deepEqual([S.unions.industry.dissent, S.unions.industry.trust], [10, 42], 'the penalty for withdrawing comes once');
});

test('a political strike: the Left −3 under the class line or the Centre +8 without it; the demand is refused without a draw', () => {
  for (const [direction, faction, delta] of [['class_independence', 'lewica', -3], ['parliamentary_socialism', 'centrum', 8]]) {
    const Q = game();
    const S = Q.S;
    S.actors.pps.strategy.direction = direction;
    const f = S.actors.pps.factions[faction];
    const dissent = f.dissent;
    const rec = wageCase(Q, 1923, 10);
    PolishUnions.caseChoose(Q, 'cabinet_resignation');
    assert.equal(f.dissent, Math.max(0, dissent + delta), direction);
    assert.equal(rec.threshold, 80);
    noSteps(Q);
    PolishUnions.beginMonth(Q, { t: Q.time });
    PolishUnions.endMonth(Q, { t: Q.time });
    assert.deepEqual([rec.rounds[0].reason, rec.threshold], ['no_executor', 40]);
  }
});

test('a clash: the Milicja protecting the strike loses 2% of its people once; violence and exposure wait for stage 7', () => {
  const Q = game();
  const S = Q.S;
  chjenoPiast(Q);
  strongBranches(S);
  const rec = wageCase(Q, 1923, 10);
  PolishUnions.caseChoose(Q, 'economic_strike');
  if (PolishUnions.stepsStage(S) === 'cooperation') PolishUnions.chooseCooperation(Q, 'none');
  const cash = S.party_orgs.cash;
  PolishUnions.chooseProtection(Q, 'protect');
  close(S.party_orgs.cash, cash - 0.5);
  const people = S.militia.strength;
  const t = Q.time;
  S.rng.rolls[`strike:${rec.id}:round:1`] = 0.99;
  S.rng.rolls[`strike:${rec.id}:clash:1`] = 0; // fixture: the clash happens
  PolishUnions.beginMonth(Q, { t });
  PolishUnions.endMonth(Q, { t });
  assert.equal(rec.clashes[0].clash, true);
  assert.equal(S.militia.strength, people - Math.round(0.02 * people));
  assert.deepEqual(S.strikes.pending_effects.filter(e => e.system === 'violence').map(e => e.value), [10]);
  const exposure = S.strikes.pending_effects.find(e => e.system === 'repression_exposure');
  close(exposure.exposure_cut, Math.min(0.40, 0.10 * rec.protection.force));
});

// ---- Stage 6c: collective agreements, plants and Grabski (card catalogue 8.1, 8.6, 6.6, 7.1; reference 9.7, 17.12) ----

// PPS holds the named portfolios in the opening cabinet (a fixture of 8.5 access).
function withPortfolios(Q, ...portfolios) {
  const cabinet = Q.S.cabinet;
  if (!cabinet.partner_ids.includes('pps')) cabinet.partner_ids.push('pps');
  for (const key of portfolios) cabinet.portfolios[key] = 'pps';
  return Q;
}
function budget(Q) {
  return PolishEconomy.budgetAt(Q.S, Q.time).budget;
}
// One whole settlement of period t (4.2): unions, projects and the economy, the party, the unions' end.
function settle(Q) {
  const t = Q.time;
  free(Q);
  Q.time = t + 1; Q.year = PolishRules.yearOf(Q.time); Q.month = PolishRules.monthOf(Q.time);
  PolishUnions.beginMonth(Q, { t });
  PolishProjects.settleMonth(Q, { t });
  PolishUnions.endMonth(Q, { t });
  return Q.S.economy.history.at(-1);
}
// A plant recorded by a credit crisis: two readings of credit below 35 (11.5, decision 2A).
function creditCrisisPlant(Q) {
  const S = Q.S;
  S.economy.history.push({ t: Q.time - 1, credit: 30 }, { t: Q.time, credit: 30 });
  PolishUnions.recordPlants(Q, Q.time);
  return PolishUnions.plants(S).at(-1);
}

test('Zakłady (decyzja 2A): a credit crisis, an active reaction of business and a strike ended by exhaustion each record one synthetic plant, once per episode', () => {
  const Q = game();
  const S = Q.S;
  PolishUnions.recordPlants(Q, Q.time);
  assert.deepEqual(S.enterprises.records, {}, 'without a recorded problem there is no plant and no arbitrary bankruptcy');
  const credit = creditCrisisPlant(Q);
  assert.deepEqual([credit.branch, credit.cause, credit.owner, credit.status, credit.capacity, credit.lost_capacity, credit.profile_id],
    ['industry', 'credit_crisis', 'private', 'threatened', 80, 20, 'synthetic_plants_v1']);
  assert.equal(PolishUnions.plantName(credit), 'industrial plant no. 1', 'no name and no historical identity');
  PolishUnions.recordPlants(Q, Q.time);
  assert.equal(PolishUnions.plants(S).length, 1, 'the same crisis records no second plant');
  S.economy.business_state = 'active';
  PolishUnions.recordPlants(Q, Q.time);
  PolishUnions.recordPlants(Q, Q.time);
  assert.deepEqual(PolishUnions.plants(S).map(p => p.cause), ['credit_crisis', 'business_reaction']);
  S.economy.business_state = 'quiet';
  PolishUnions.recordPlants(Q, Q.time);
  S.economy.business_state = 'active';
  PolishUnions.recordPlants(Q, Q.time);
  assert.equal(PolishUnions.plants(S).length, 3, 'a new episode of the reaction records a new plant');
  // A strike ended by exhaustion records a plant in its branch, once.
  S.economy.business_state = 'quiet';
  S.unions.rail.reach = 1;
  PolishUnions.prepare(Q, 'rail', 'limited');
  free(Q);
  PolishUnions.startStrike(Q, 'rail');
  const rec = PolishUnions.records(S).find(r => r.branches.includes('rail'));
  month(Q, Q.time);
  assert.equal(rec.outcome, 'exhausted');
  const railPlant = PolishUnions.plants(S).at(-1);
  assert.deepEqual([railPlant.branch, railPlant.cause], ['rail', 'exhausted_strike:' + rec.id]);
  PolishUnions.endMonth(Q, { t: Q.time });
  assert.equal(PolishUnions.plants(S).filter(p => p.branch === 'rail').length, 1);
  assert.deepEqual(PolishRules.validateState(S), []);
});

test('Układ zbiorowy i odstępstwo: an agreement in one branch costs 0 B and moves wages once through 11.4 with no reaction of business; a derogation in a threatened plant costs 0 B, business −4, grievance +3 and expires on its date', () => {
  const Q = withPortfolios(game(), 'labor');
  const S = Q.S, t = Q.time;
  const before = { budget: budget(Q), business: S.economy.business_pressure };
  assert.equal(PolishProjects.optionStatus(Q, 'labor_rights', 'collective', { branch: 'industry' }).available, true);
  assert.throws(() => PolishProjects.chooseOption(Q, 'labor_rights', 'collective'), /needs a branch/);
  PolishProjects.chooseOption(Q, 'labor_rights', 'collective', { branch: 'industry' });
  assert.equal(Q.month_actions, 1, '1 T');
  const agreement = S.unions.industry.agreements.at(-1);
  assert.deepEqual([agreement.kind, agreement.employer, agreement.union, agreement.conditions, agreement.term_until],
    ['collective', 'employers:industry', 'industry', ['wages'], t + 12], 'employer, union, covered workers, conditions and term');
  assert.deepEqual([budget(Q), S.economy.business_pressure], [before.budget, before.business], '0 B: the employers pay; no reaction of business');
  close(PolishUnions.wageAgreementInput(S, t), 2 * 0.6);
  close(PolishUnions.wageAgreementInput(S, t + 1), 1.2);
  assert.equal(PolishUnions.wageAgreementInput(S, t + 2), 0, 'the wage effect passes once, for two months');
  // The same month of a twin game without the agreement: the difference is the wage effect of 11.4 only.
  const twin = game();
  const withAgreement = settle(Q), without = settle(twin);
  close(withAgreement.wage_agreement_pp, 1.2);
  assert.ok(withAgreement.real_wage > without.real_wage);
  assert.equal(withAgreement.business_pressure, without.business_pressure);
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'labor_rights', 'collective', { branch: 'industry' }).reason, /runs until/);
  assert.equal(PolishProjects.optionStatus(Q, 'labor_rights', 'collective', { branch: 'rail' }).available, true);
  S.unions.rail.reach = 50;
  PolishUnions.prepare(Q, 'rail', 'limited');
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'labor_rights', 'collective', { branch: 'rail' }).reason, /dispute of this branch/);
  S.economy.business_state = 'active';
  assert.match(PolishProjects.optionStatus(Q, 'labor_rights', 'collective', { branch: 'farm_labour' }).reason, /employers refuse/);
  S.economy.business_state = 'quiet';

  // The derogation needs its legal basis — the law on working time — and a threatened plant.
  assert.match(PolishProjects.optionStatus(Q, 'labor_rights', 'derogation').reason, /legal basis/);
  PolishProjects.chooseOption(Q, 'labor_rights', 'inspection');
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'labor_rights', 'derogation').reason, /recorded plant in difficulty/);
  const plant = creditCrisisPlant(Q);
  const pressure = S.economy.business_pressure, room = budget(Q);
  PolishProjects.chooseOption(Q, 'labor_rights', 'derogation');
  const at = Q.time;
  assert.deepEqual([plant.exemption.status, plant.exemption.expires_at, plant.exemption.scope], ['active', at + 6, 'working time in this plant only']);
  assert.equal(S.economy.business_pressure, pressure - 4);
  assert.equal(budget(Q), room, '0 B');
  assert.deepEqual(plant.pending_effects.map(e => [e.system, e.stage, e.value]), [['grievance', 7, 3]], 'grievance of the covered workers for stage 7');
  const inspection = Object.values(S.projects).find(p => p.type === 'labor_inspection');
  assert.equal(inspection.authorized, true, 'no general removal of the protection of working time');
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'labor_rights', 'derogation').reason, /without a derogation/, 'one derogation per plant at a time');
  PolishUnions.expireRecords(S, at + 4);
  assert.equal(plant.exemption.status, 'active');
  PolishUnions.expireRecords(S, at + 5);
  assert.equal(plant.exemption.status, 'expired', 'it lapses after its six settlements');
  assert.equal(S.economy.business_pressure, pressure - 4, 'the expiry does not undo the one-off change');
});

test('Ratunek zakładu: the general credit adds 5 to the credit target; the rescue of a recorded plant costs 2 B for 2 months, then 1 B, and restores its lost capacity once', () => {
  const Q = withPortfolios(game(), 'economic');
  const S = Q.S;
  S.economy.budget_base = 10;  // a full execution in this fixture (11.3)
  assert.match(PolishProjects.optionStatus(Q, 'industrial_policy', 'rescue').reason, /recorded plant/);
  PolishProjects.chooseOption(Q, 'industrial_policy', 'credit');
  free(Q);
  const credit = Object.values(S.projects).find(p => p.type === 'credit_instrument');
  assert.deepEqual([credit.variant, PolishProjects.PROJECT_TYPES.credit_instrument.variants.public.credit_support], ['public', 5]);
  const plant = creditCrisisPlant(Q);
  assert.equal(PolishProjects.optionStatus(Q, 'industrial_policy', 'rescue').available, true);
  PolishProjects.chooseOption(Q, 'industrial_policy', 'rescue');
  free(Q);
  const rescue = Object.values(S.projects).find(p => p.type === 'plant_rescue');
  assert.deepEqual([rescue.status, rescue.klass, rescue.build_budget_B, rescue.upkeep_budget_B, rescue.duration_months, rescue.policy_choices.plant_id],
    ['prepared', 'large', 2, 1, 2, plant.id], 'a large project: prepared by the card, launched in the agenda');
  assert.equal(plant.rescue_project_id, rescue.id);
  assert.match(PolishProjects.optionStatus(Q, 'industrial_policy', 'rescue').reason, /already prepared/);
  assert.ok(PolishProjects.agendaItemsFor(Q).includes('plant_rescue'));
  PolishProjects.agendaChoose(Q, 'plant_rescue');
  assert.deepEqual([rescue.status, rescue.authorized], ['executing', true], 'the owner’s agreement is the condition of the credit; no law');
  // The rescue's own charge in each settlement (the cabinet may launch the prepared credit in the crisis, 17.16.4).
  const charges = [];
  for (let i = 0; i < 4; i++) {
    charges.push(PolishEconomy.projectCharge(rescue, Q.time));
    settle(Q);
  }
  assert.equal(rescue.status, 'operating');
  assert.deepEqual(charges, [2, 2, 1, 1], 'building 2 B for two months, then 1 B to run');
  assert.deepEqual([plant.capacity, plant.lost_capacity, plant.status], [100, 0, 'rescued'], 'the recorded lost capacity is restored');
  assert.equal(rescue.effects_applied.filter(k => k === 'first').length, 1, 'once');
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'industrial_policy', 'rescue').reason, /recorded plant/, 'no second rescue of the same plant');
});

test('Przejęcie i reprezentacja (stage-6 part): public control by an act gives business +15 once; consultation −2 and co-decision only the missing −2; a private plant has no representation', () => {
  const Q = withPortfolios(game(), 'economic');
  const S = Q.S;
  S.economy.budget_base = 10;
  // A fixture Sejm in which PPS carries its acts (250 of 444 MPs).
  S.parliament.clubs.find(c => c.id === 'pps').seats += 215;
  S.parliament.clubs.find(c => c.id === 'other').seats -= 215;
  assert.match(PolishProjects.optionStatus(Q, 'industrial_policy', 'public_control').reason, /recorded private plant/);
  const plant = creditCrisisPlant(Q);
  assert.match(PolishProjects.optionStatus(Q, 'industrial_policy', 'worker_representation').reason, /public plant/, 'a private plant has no representation');
  const pressure = S.economy.business_pressure;
  PolishProjects.chooseOption(Q, 'industrial_policy', 'public_control');
  free(Q);
  const law = S.parliament.laws.at(-1);
  assert.deepEqual([law.kind, law.plant_id, law.programme.fiscal, law.status], ['public_control', plant.id, 2, 'enacted']);
  assert.deepEqual([plant.owner, plant.public_act_id, plant.management], ['public', law.id, 'a public board under Industry and Trade']);
  assert.equal(S.economy.business_pressure, pressure + 15, 'the prepared public control: +15 once (11.7)');
  assert.match(PolishProjects.optionStatus(Q, 'industrial_policy', 'public_control').reason, /recorded private plant/, 'one act per plant');
  PolishProjects.chooseOption(Q, 'industrial_policy', 'worker_representation', { variant: 'consultative' });
  free(Q);
  assert.deepEqual([plant.representation.variant, plant.representation.worker_actor_id], ['consultative', 'union:industry'],
    'the representative is the branch union, not PPS');
  const consult = Object.values(S.projects).find(p => p.type === 'enterprise_representation' && p.variant === 'consultative');
  assert.deepEqual([consult.status, consult.build_budget_B, consult.pending_effects.map(e => e.value)], ['completed', 0, [-2]], '1 T, 0 B, after the act');
  assert.match(PolishProjects.optionStatus(Q, 'industrial_policy', 'worker_representation', { variant: 'consultative' }).reason, /already has/);
  PolishProjects.chooseOption(Q, 'industrial_policy', 'worker_representation', { variant: 'decision_rights' });
  free(Q);
  const codecision = Object.values(S.projects).find(p => p.type === 'enterprise_representation' && p.variant === 'decision_rights');
  assert.deepEqual([codecision.status, codecision.klass, codecision.build_budget_B, codecision.duration_months], ['prepared', 'large', 1, 2],
    'two steps: prepared now, launched in the agenda');
  PolishProjects.agendaChoose(Q, 'enterprise_representation');
  const bill = S.parliament.laws.at(-1);
  assert.deepEqual([bill.project_id, bill.status], [codecision.id, 'enacted'], 'co-decision needs its own law');
  for (let i = 0; i < 3 && codecision.status !== 'completed'; i++) settle(Q);
  assert.equal(codecision.status, 'completed');
  assert.deepEqual([plant.representation.variant, plant.representation.covered_decisions], ['decision_rights', ['mass dismissals', 'changes of the wage rules']]);
  assert.deepEqual(codecision.pending_effects.map(e => e.value), [-2], 'only the missing difference after consultation');
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'industrial_policy', 'worker_representation').reason, /already/, 'a repeated choice gives nothing');
  assert.equal(S.economy.business_pressure, pressure + 15, 'the representation adds no second reaction of business');
});

// A formation with Grabski tolerated by PPS in his window (9.7): mandatory, or the player's own initiative.
function grabskiDraft(Q, mandatory = true) {
  Q.time = PolishRules.timeOf(1924, 1); Q.year = 1924; Q.month = 1;
  PolishGovernment.beginFormation(Q, { reason: 'crisis', mandatory });
  PolishGovernment.setDraft(Q, 'configuration_id', 'expert');
  PolishGovernment.setDraft(Q, 'candidate_id', 'grabski');
  PolishGovernment.setDraft(Q, 'pps_mode', 'external_support');
  return Q.S.negotiation.draft;
}
// The prepared base of 9.7: apparatus 2 and one branch with reach 40 (Grabski's relation is the neutral 50).
function preparedBase(Q) {
  Q.S.party_orgs.apparatus.level = 2;
  Q.S.unions.industry.reach = 40;
}
// A fixture Sejm in which Grabski has no working support without PPS: PPS 300 of 444 MPs.
function ppsDecides(Q) {
  const clubs = Q.S.parliament.clubs, seats = id => clubs.find(c => c.id === id);
  seats('pps').seats += 265;
  for (const [id, n] of [['other', 134], ['zln', 83], ['pschd', 27], ['psl_piast', 21]]) seats(id).seats -= n;
}

test('Tolerowanie B14: apparatus 1/2, reach 39/40 and relation 39/40 only open the talks; acceptance needs 8.3, money and an executor; no support without the agreement', () => {
  const Q = game();
  const S = Q.S;
  grabskiDraft(Q);
  const terms = () => PolishGovernment.stabilisationTermsStatus('protections', Q);
  assert.match(terms().reason, /apparatus level 2 \(now 1\)/);
  S.party_orgs.apparatus.level = 2;
  S.unions.industry.reach = 39;
  assert.match(terms().reason, /reach 40 \(now 39\)/);
  S.unions.industry.reach = 40;
  assert.equal(terms().available, true, 'Grabski’s test profile: the neutral relation 50');
  S.actors.relations.grabski = 39;
  assert.match(terms().reason, /relation of 40 with Grabski \(now 39\)/);
  S.actors.relations.grabski = 40;
  assert.equal(terms().available, true);
  // No contact: without Grabski as the candidate tolerated by PPS the terms are not part of the offer.
  PolishGovernment.setDraft(Q, 'pps_mode', 'opposition');
  assert.throws(() => PolishGovernment.setDraft(Q, 'stabilisation_terms', 'protections'), /Grabski and PPS support/);
  PolishGovernment.setDraft(Q, 'pps_mode', 'external_support');
  PolishGovernment.setDraft(Q, 'stabilisation_terms', 'protections');
  // The talks are open, but in this Sejm Grabski has a working support without PPS and refuses its demands.
  const refused = PolishGovernment.submitFormation(Q);
  assert.equal(refused.pps_offer.accepted, false);
  assert.match(refused.pps_offer.reason, /working support without PPS/);
  assert.ok(!(S.cabinet.supporter_ids || []).includes('pps') || S.cabinet.pm !== 'grabski', 'no PPS support without the agreement');
  assert.ok(!Object.values(S.agreements).some(a => a.term), 'no toleration agreement was signed');

  // No money: where PPS decides, a wealth tax already in force leaves the terms no financing.
  const P = game();
  ppsDecides(P);
  preparedBase(P);
  grabskiDraft(P);
  PolishGovernment.setDraft(P, 'stabilisation_terms', 'protections');
  P.S.economy.policies.push({ id: 'pol-wealth_tax-fixture', kind: 'wealth_tax', status: 'active', starts_at: P.time - 1, ends_at: P.time + 5,
    budget_schedule: [{ from: P.time - 1, to: P.time + 5, value: 2 }], emission_points: 0, beneficiaries: [], effects_applied: [] });
  const poor = PolishGovernment.submitFormation(P);
  assert.equal(poor.pps_offer.accepted, false);
  assert.match(poor.pps_offer.reason, /no money/);
  assert.ok(!Object.values(P.S.agreements).some(a => a.term));

  // Everything met: his score of 8.3 at the minimal relation, his need of PPS, the financing and Labour.
  const A = game();
  ppsDecides(A);
  preparedBase(A);
  A.S.actors.relations.grabski = 40;
  grabskiDraft(A);
  PolishGovernment.setDraft(A, 'stabilisation_terms', 'protections');
  const t = A.time;
  const accepted = PolishGovernment.submitFormation(A);
  assert.equal(accepted.pps_offer.accepted, true, JSON.stringify(accepted.pps_offer.reason));
  const answer = accepted.pps_offer.terms_answer;
  assert.ok(answer.accept && answer.score >= 60 && answer.need === 100 && answer.financing === 'wealth_tax');
  assert.deepEqual([A.S.cabinet.pm, A.S.cabinet.pps_mode, A.S.cabinet.stabilisation_terms], ['grabski', 'external_support', 'protections']);
  const support = Object.values(A.S.agreements).find(a => a.term);
  assert.deepEqual([support.id, support.term.review_at, support.term.expires_at], ['agr-' + A.S.cabinet.id + '-pps', t + 3, t + 6]);
  const protection = support.obligations.find(o => o.topic === 'worker_protection');
  assert.deepEqual([protection.required_project, protection.required_variants, protection.due_at, protection.portfolio], ['worker_protection', ['full'], t + 4, 'labor']);
  assert.ok(support.obligations.some(o => o.topic === 'stabilisation_terms' && o.position === 'protections'));
  const profile = PolishProjects.cabinetProfile(A.S.cabinet);
  assert.deepEqual([profile.stabilisation, profile.stabilisation_financing, profile.revenue[0]], ['protected', ['wealth_tax'], 'wealth_tax']);
  // The review after three months and the end of the six-month term each open the answer of 9.8 once.
  A.time = t + 3;
  PolishGovernment.settleAgreements(A);
  let open = PolishGovernment.responseCase(A);
  assert.deepEqual([open.kind, PolishGovernment.describeParty(open.by)], ['review', 'Władysław Grabski']);
  assert.equal(PolishGovernment.supportOptionStatus(A, 'maintain', 'response').available, true);
  PolishGovernment.maintainSupport(A);
  assert.equal(PolishGovernment.responseCase(A), null);
  A.time = t + 6;
  PolishGovernment.settleAgreements(A);
  open = PolishGovernment.responseCase(A);
  assert.equal(open.kind, 'renewal');
  PolishGovernment.maintainSupport(A);
  assert.deepEqual([support.term.review_at, support.term.expires_at, support.term.renewals], [t + 9, t + 12, 1], 'renewed for six months with a new review');
  assert.deepEqual(PolishRules.validateState(A.S), []);
});

test('Wspólna karta gabinetowa: Grabski, the protections, the role of PPS and the portfolios are one sequence with one initiative cost; no extra priority and no Grabski card', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  ppsDecides(Q);
  preparedBase(Q);
  grabskiDraft(Q, false);
  assert.equal(Q.S.negotiation.cost_t, 1, 'the player’s own initiative costs one month in total');
  assert.deepEqual(PolishGovernment.draftChoiceStatus(Q, 'mode', 'member'), { available: false, reason: 'A cabinet of experts has no party ministers.' });
  PolishGovernment.setDraft(Q, 'stabilisation_terms', 'protections');
  const view = PolishGovernment.formationView(Q);
  assert.deepEqual([view.stabilisation_open, view.stabilisation, view.portfolios], [true, 'protections and a heavier burden on wealth', 'none (outside the cabinet)']);
  assert.equal(Q.month_actions, 0, 'setting the terms is free');
  const result = PolishGovernment.submitFormation(Q);
  assert.equal(Q.month_actions, 1, 'one commit');
  assert.equal(Q.S.turn.pending.action_id, 'parliament.cabinet_formation', 'the one transaction of the formation card');
  assert.equal(result.pps_offer.accepted, true);
  assert.equal(Q.S.cabinet.stabilisation_terms, 'protections');
  assert.equal(PolishProjects.CARDS.grabski_terms, undefined, 'no separate Grabski card');
  assert.deepEqual(Object.keys(engine.game.scenes).filter(id => /grabski/i.test(id) && !id.startsWith('polish_cabinet_formation.')), [],
    'Grabski is only a candidate of the one formation card');
});

test('B14 through the stabilisation event: without the Treasury the answer opens the one formation card with Grabski and the protections; without a crisis it is blocked with its reason', () => {
  const Q = game();
  const S = Q.S;
  preparedBase(Q);
  assert.match(PolishProjects.eventStatus(Q, 'stabilization', 'protections_terms').reason, /open cabinet crisis/);
  withPortfolios(Q, 'finance');
  assert.match(PolishProjects.eventStatus(Q, 'stabilization', 'protections_terms').reason, /holds the Treasury/);
  S.cabinet.portfolios.finance = 'expert';
  PolishGovernment.openCrisis(Q, 'fixture_fall', S.cabinet.id);
  assert.equal(PolishProjects.eventStatus(Q, 'stabilization', 'protections_terms').available, true);
  PolishProjects.eventChoose(Q, 'stabilization', 'protections_terms');
  const draft = S.negotiation.draft;
  assert.deepEqual([draft.configuration_id, draft.candidate_id, draft.pps_mode, draft.stabilisation_terms], ['expert', 'grabski', 'external_support', 'protections']);
  assert.equal(Q.month_actions || 0, 0, 'the answer to the event costs no month; the formation keeps its own cost');
  assert.ok(S.history.actions.some(a => a.action_id === 'event.stabilization.protections_terms' && a.cost_t === 0));
});
