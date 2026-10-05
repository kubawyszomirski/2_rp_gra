'use strict';
// Stage 8 of the implementation plan, part 8c: the axis of the Normal scenario (technical reference 17.16.3), the
// compromise with Piłsudski carried out by an accepted cabinet executor (16.7; the B run of M02), the profile
// pilsudski_aligned of Ziemięcki's toleration (10.4.3, A10; decision 5A) and the programme points of the army and
// autonomy that no offer creates. Each test starts a real new game and calls the rules on its state.
const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

function quiet() {
  const Q = dendry.startGame().state.qualities;
  for (const key of Object.keys(Q.S.scenario.inputs)) Q.S.scenario.inputs[key] = false;
  Q.S.economy.budget_base = 10;
  return Q;
}
function free(Q) {
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  Q.month_actions = 0;
}
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
function at(Q, year, month) {
  Q.time = PolishRules.timeOf(year, month); Q.year = year; Q.month = month;
  Q.S.turn.last_settled_time = Q.time - 1;
}
// The synthetic base Sejm of the M02 runs (17.16.10): a test fixture, not a historical result.
const M02_BASE = { kpp: 2, pps: 41, npr: 18, psl_wyzwolenie: 49, psl_piast: 70, pschd: 60, zln: 100, jewish_rep: 30, other_minorities_rep: 60, other: 14 };
function m02Sejm(Q) {
  for (const club of Q.S.parliament.clubs) if (M02_BASE[club.id] !== undefined) club.seats = M02_BASE[club.id];
  return Q;
}
const militaryCase = Q => PolishPolitics.openCase(Q, { id: 'military_case', kind: 'military', subject: 'the organisation of the supreme military authorities' });

test('Kompromis przez gabinet: a supporting PPS asks for a compromise with Piłsudski; the cabinet carries out the military function at its next review, with the relief −12 once; the full card stays closed', () => {
  const Q = quiet();
  const S = Q.S;
  assert.equal(PolishGovernment.ppsStance(S), 'supporter', 'the opening toleration of Ponikowski');
  assert.equal(PolishGovernment.supportOptionStatus(Q, 'persuade', 'ordinary', 'military_compromise').available, false, 'no military case yet');
  militaryCase(Q);
  assert.equal(PolishGovernment.militaryCaseOpen(Q), true);
  assert.equal(PolishSecurity.pilsCardAvailable(Q), false, '21.1 Pula ustępstw: no ordinary card under toleration');
  const record = PolishGovernment.supportDemand(Q, 'persuade', 'military_compromise', 'ordinary');
  assert.equal(record.accepted, true, JSON.stringify(record.evaluations));
  const obligation = S.agreements.opening_toleration.obligations.find(o => o.required_military);
  assert.equal(obligation.required_military, 'military_function');
  assert.equal(obligation.fulfillment, 0);
  const pressure = S.coup.impulses.filter(i => i.id.startsWith('pils_agreement')).length;
  settle(Q);
  const agreement = S.agreements[S.actors.pilsudski.agreement_id];
  assert.equal(agreement.executor, 'cabinet');
  assert.equal(agreement.variant, 'military_function');
  assert.notEqual(agreement.execution_started_at, null, 'executed at once, as on the card');
  assert.equal(obligation.fulfillment, 1);
  assert.deepEqual(S.coup.impulses.filter(i => i.id.startsWith('pils_agreement')).slice(pressure).map(i => i.value), [-12]);
  assert.ok(S.history.actions.some(a => a.action_id === 'cabinet.military_compromise' && a.consumes_month === false), 'the cabinet’s own initiative');
  assert.equal(PolishGovernment.supportOptionStatus(Q, 'persuade', 'ordinary', 'military_compromise').available, false, 'one agreement at a time');
});

test('Kompromis przez gabinet: when Piłsudski refuses, the promise lapses with its reason, without an agreement, relief or breach', () => {
  const Q = quiet();
  const S = Q.S;
  militaryCase(Q);
  PolishGovernment.supportDemand(Q, 'persuade', 'military_compromise', 'ordinary');
  S.actors.relations.pilsudski = 30;
  settle(Q);
  const obligation = S.agreements.opening_toleration.obligations.find(o => o.required_military);
  assert.equal(obligation.status, 'void');
  assert.match(obligation.void_reason, /relation is below 40/);
  assert.equal(S.actors.pilsudski.agreement_id, null);
  assert.equal(S.coup.impulses.filter(i => i.id.startsWith('pils_agreement')).length, 0);
  assert.ok(S.history.reasons.some(r => r.kind === 'npc_review' && r.result === 'military_compromise_refused'));
});

test('Oferta Chjeno-Piasta 1923: from V 1923 the competing compromise is evaluated once; where it can govern, Piast leaves and the bloc’s motion dismisses the cabinet; the date alone dismisses nothing', () => {
  // Where the bloc cannot govern — the cabinet's own basis has a majority against it — the evaluation is recorded once
  // and changes nothing.
  const Q1 = quiet();
  const computed = { kpp: 23, pps: 62, npr: 24, psl_wyzwolenie: 59, psl_piast: 61, pschd: 33, zln: 58, jewish_rep: 34, other_minorities_rep: 68, other: 22 };
  for (const club of Q1.S.parliament.clubs) if (computed[club.id] !== undefined) club.seats = computed[club.id];
  Q1.S.cabinet.supporter_ids = ['pps', 'psl_wyzwolenie', 'npr', 'jewish_rep', 'other_minorities_rep'];
  Q1.S.scenario.inputs.chjeno_piast_1923 = true;
  at(Q1, 1923, 4);
  settle(Q1);
  assert.equal(Q1.S.politics.episodes.filter(e => e.id === 'competing_1923').length, 0, 'not before V 1923');
  settle(Q1);
  const first = Q1.S.politics.episodes.filter(e => e.id === 'competing_1923');
  assert.equal(first.length, 1);
  assert.equal(first[0].status, 'not_viable');
  const cabinet = Q1.S.cabinet.id;
  settle(Q1);
  assert.equal(Q1.S.politics.episodes.filter(e => e.id === 'competing_1923').length, 1, 'evaluated once');
  assert.equal(Q1.S.cabinet.id, cabinet, 'the sitting cabinet stays');
  // In the base Sejm of M02 the bloc has 230 MPs: Piast leaves the supporters and the motion passes.
  const Q = m02Sejm(quiet());
  const S = Q.S;
  S.scenario.inputs.chjeno_piast_1923 = true;
  S.cabinet.supporter_ids.push('psl_piast');
  at(Q, 1923, 5);
  settle(Q);
  const episode = S.politics.episodes.find(e => e.id === 'competing_1923');
  assert.equal(episode.status, 'motion');
  assert.deepEqual(episode.evaluations.map(e => [e.actor, e.accept]), [['zln', true], ['pschd', true]]);
  assert.equal(episode.forecast.yes, 230);
  assert.ok(!S.cabinet.supporter_ids.includes('psl_piast'), 'Piast leaves the basis of the cabinet (9.4)');
  const motion = S.cabinet.dismissal_motion;
  assert.deepEqual(motion.movers, ['zln', 'pschd', 'psl_piast']);
  assert.equal(motion.status, 'passed', 'PPS, bound to the cabinet, votes against; the bloc carries the motion');
  assert.equal(S.cabinet.status, 'caretaker');
  assert.equal(S.cabinet.fall_reason, 'dismissal');
  assert.ok(S.cabinet_crisis, 'the fall opens a formation, where PPS makes its own offer');
});

test('Tolerowanie warunkowe Ziemięckiego: with external support of a minority cabinet of Śliwiński or Piłsudski by an agreement, Centrum −10 and Lewica −8 dissent; not for a member, another premier or without an agreement', () => {
  const Q = quiet();
  const S = Q.S;
  Q.ziemiecki_advisor = 1;
  const status = () => PolishParty.advisorActionStatus(Q, 'ziemiecki', 'conditional_toleration');
  assert.equal(PolishGovernment.pilsudskiAligned(S), false, 'Ponikowski is not Piłsudski’s candidate');
  assert.equal(status().available, false);
  S.cabinet.pm = 'sliwinski';
  assert.equal(PolishGovernment.pilsudskiAligned(S), true, 'a cabinet of experts is a minority cabinet');
  assert.equal(status().available, true, status().reason);
  const before = { centrum: S.actors.pps.factions.centrum.dissent, lewica: S.actors.pps.factions.lewica.dissent };
  PolishParty.advisorAction(Q, 'ziemiecki', 'conditional_toleration');
  assert.equal(S.actors.pps.factions.centrum.dissent, Math.max(0, before.centrum - 10));
  assert.equal(S.actors.pps.factions.lewica.dissent, Math.max(0, before.lewica - 8));
  assert.equal(S.cabinet.pps_mode, 'external_support', 'the kind of support does not change');
  // A member, or a supporter without an agreement, does not qualify.
  const Q2 = quiet();
  Q2.ziemiecki_advisor = 1;
  Q2.S.cabinet.pm = 'sliwinski';
  Q2.S.cabinet.partner_ids.push('pps');
  Q2.S.cabinet.supporter_ids = Q2.S.cabinet.supporter_ids.filter(id => id !== 'pps');
  assert.equal(PolishParty.advisorActionStatus(Q2, 'ziemiecki', 'conditional_toleration').available, false, 'full membership');
  const Q3 = quiet();
  Q3.ziemiecki_advisor = 1;
  Q3.S.cabinet.pm = 'sliwinski';
  Q3.S.agreements.opening_toleration.status = 'expired';
  assert.match(PolishParty.advisorActionStatus(Q3, 'ziemiecki', 'conditional_toleration').reason, /agreement/);
});

test('Punkty programu bez wojska i autonomii: no cabinet configuration and no demand puts an army or autonomy point into a programme agreement; the military demand is a promise of the cabinet itself', () => {
  for (const [id, config] of Object.entries(PolishGovernment.CONFIGURATIONS)) {
    const programme = config.programme || {};
    assert.ok(!('army' in programme) && !('autonomy' in programme), id);
  }
  for (const [id, postulate] of Object.entries(PolishGovernment.POSTULATES)) {
    if (id === 'military_compromise') assert.equal(postulate.required_military, 'military_function');
    else assert.ok(!('army' in postulate.programme) && !('autonomy' in postulate.programme), id);
  }
});

test('Zgromadzenie po rozłamie: MPs who left PPS with a faction before December no longer count as PPS in the National Assembly; their splinter club has no presidential profile', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  for (const key of Object.keys(Q.S.scenario.inputs)) Q.S.scenario.inputs[key] = false;
  Q.year = 1922; Q.month = 11; Q.time = 11;
  engine._runActions(engine.game.scenes.polish_opening_state.onArrival);
  engine.goToScene('sejm_election');
  dendry.choose(engine, 'sejm_election.calculate');
  dendry.formCabinet(engine, { mode: 'opposition' });
  dendry.choose(engine, 'root');
  const before = Q.S.parliament.clubs.find(c => c.id === 'pps').seats;
  // A split of the Lewica (10.2, M16) before the Assembly meets.
  PolishParty.applyDeparture(Q, 'lewica', 0.40, 20, 'split', 'fixture-split');
  const pps = Q.S.parliament.clubs.find(c => c.id === 'pps').seats;
  const splinter = Q.S.parliament.clubs.filter(c => c.splinter_of === 'pps').reduce((n, c) => n + c.seats, 0);
  assert.ok(splinter > 0 && pps + splinter === before, 'the MPs moved to a splinter club');
  engine.goToScene('main');
  dendry.playCard(engine, 'polish_party_agenda');
  dendry.choose(engine, 'polish_party_agenda.organize');
  dendry.choose(engine, 'polish_party_agenda.branch_farm_labour');
  dendry.choose(engine, 'root');
  dendry.choose(engine, 'polish_speaker_election.rataj');
  dendry.choose(engine, 'polish_speaker_election.finish');
  const assembly = Q.polish_presidency.assembly;
  assert.equal(assembly.sejm_seats.pps, pps, 'the Assembly counts the club as it sits');
  assert.equal(assembly.party_seats.pps, pps + (Q.S.senate.club_seats.pps || 0));
});

// ---- Checks of the Normal scenario (technical reference 21.2b) not covered by the tests of stages 4–7.

test('Płace 79/79/80 i 79/79/79 (21.2b): three full months below 80 are needed; the second series opens one wage demand, without a strike or an immediate +8', () => {
  const Q = quiet();
  const S = Q.S;
  const series = (values, from) => values.forEach((wage, i) => { S.economy.real_wage = wage; PolishUnions.watchWages(Q, from + i); });
  series([79, 79, 80], 1);
  assert.equal(PolishUnions.records(S).filter(r => r.kind === 'wage_case').length, 0, '79/79/80 does not meet the threshold');
  series([79, 79, 79], 4);
  const cases = PolishUnions.records(S).filter(r => r.kind === 'wage_case');
  assert.equal(cases.length, 1, 'one demand');
  assert.equal(cases[0].status, 'negotiating', 'a demand, not a strike');
  assert.ok(!PolishUnions.records(S).some(r => r.kind !== 'wage_case' && r.status === 'active'), 'no automatic strike');
  assert.ok(!S.strikes.pending_effects.some(e => e.system === 'grievance' && e.value === 8), 'no immediate +8');
});

test('II 1926 przy presji 100 (21.2b): no attempt before the opportunity of III 1926; from III the pressure alone does not replace the operational gates', () => {
  const Q = quiet();
  const S = Q.S;
  S.coup.pressure = 100;
  const february = PolishSecurity.coupGates(Q, PolishRules.timeOf(1926, 2));
  assert.deepEqual([february.pressure, february.window, february.allowed], [true, false, false]);
  PolishSecurity.checkCoupGates(Q, PolishRules.timeOf(1926, 1));
  assert.equal(S.coup.attempt_id, null, 'no attempt before the window');
  // A fixture without the units that strike first: from III 1926 the same pressure declares no attempt.
  for (const force of S.security.forces) if (force.available_from_phase === 0) force.losses_F = force.base_strength_F;
  const march = PolishSecurity.coupGates(Q, PolishRules.timeOf(1926, 3));
  assert.equal(march.pressure, true);
  assert.equal(march.window, false, 'no operational strike force');
  PolishSecurity.checkCoupGates(Q, PolishRules.timeOf(1926, 2));
  assert.equal(S.coup.attempt_id, null);
});

// ---- Checks of the correction 0.13 (technical reference 21.2c) not covered by the tests of stages 6–7.

test('Ugoda dla części zatrudnionych (21.2c): an executed settlement relieves the grievance of the covered branch once, in proportion to its coverage — not the whole population and not per instalment', () => {
  const Q = quiet();
  const S = Q.S;
  const t = Q.time;
  const grievance = filter => S.society.cells.filter(filter).map(c => c.grievance);
  const employed = c => c.class_id === 'workers' && c.employment === 'employed';
  const rural = c => c.class_id === 'rural';
  const before = { employed: grievance(employed), rural: grievance(rural) };
  // The settlement of industry, executed: one pending effect of −4 (14.5), applied by the politics of stage 7.
  S.strikes.pending_effects.push({ id: 'fixture-settlement:relief', system: 'grievance', stage: 7, value: -4, cause: 'settlement_executed', branches: ['industry'] });
  const exposure = PolishPolitics.applyRecordedEffects(Q, t);
  const share = PolishPolitics.BRANCH_CELLS.industry.share;
  grievance(employed).forEach((g, i) => assert.ok(Math.abs(g - Math.max(0, before.employed[i] - 4 * share)) < 1e-9, 'the covered workers: −4 × ' + share));
  assert.deepEqual(grievance(rural), before.rural, 'no relief for the whole population');
  assert.ok(exposure.settlement.length > 0, 'the settlement is recorded for the monthly equation');
  PolishPolitics.applyRecordedEffects(Q, t + 1);
  grievance(employed).forEach((g, i) => assert.ok(Math.abs(g - Math.max(0, before.employed[i] - 4 * share)) < 1e-9, 'once, not per instalment'));
});

test('Żądanie dymisji przy niezadowoleniu 47 (21.2c): in an open rejected dispute the political demand is available; choosing it changes no vote and dismisses nobody by itself', () => {
  const Q = quiet();
  const S = Q.S;
  for (const cell of S.society.cells) if (cell.class_id === 'workers') cell.grievance = 47;
  S.economy.real_wage = 75;
  for (const t of [1, 2, 3]) PolishUnions.watchWages(Q, t);
  const rec = PolishUnions.records(S).find(r => r.kind === 'wage_case');
  assert.ok(rec && rec.rejected, 'an open dispute with an unresolved demand');
  assert.equal(PolishUnions.caseStatus(Q, 'cabinet_resignation').available, true);
  const cabinet = S.cabinet.id, ballots = S.ballots.length;
  PolishUnions.caseChoose(Q, 'cabinet_resignation');
  assert.ok(rec.demands.some(d => d.kind === 'cabinet_resignation'), 'the demand is recorded');
  assert.deepEqual([S.cabinet.id, S.cabinet.status, S.ballots.length], [cabinet, 'active', ballots], 'no automatic dismissal or vote');
});

// Stage 8, part 8f: the dated inputs of the Normal scenario from the sources (HISTORICAL_SOURCES.md, PL-MILITARY-CASE-1923-1926,
// PL-1922-CABINET-CRISIS, PL-NIEWIADOMSKI-CULT-1923).
test('Daty ze źródeł (8f): the military case opens in VII 1923 with its speech; the public episode of military pressure waits for a cabinet crisis from XI 1925; the speech of 1922 is about the right to appoint the cabinet', () => {
  const Q = quiet();
  const S = Q.S;
  const I = PolishPolitics.SCENARIO_INPUTS;
  assert.deepEqual([I.dispute_1922, I.niewiadomski_cult, I.military_case, I.military_escalation],
    [PolishRules.timeOf(1922, 6), PolishRules.timeOf(1923, 2), PolishRules.timeOf(1923, 7), PolishRules.timeOf(1925, 11)]);
  S.scenario.inputs.military_case = true;
  at(Q, 1923, 6);
  settle(Q);
  assert.equal(PolishPolitics.openMilitaryCase(S), null, 'no case in VI 1923');
  settle(Q);
  const opened = PolishPolitics.openMilitaryCase(S);
  assert.deepEqual([opened && opened.opened_at, S.politics.speeches.map(s => s.id)], [I.military_case, ['speech_military_case']]);
  // A cabinet crisis before XI 1925 brings no public episode.
  PolishGovernment.cabinetFalls(Q, 'fixture');
  PolishPolitics.afterEvents(Q);
  assert.deepEqual([!!S.cabinet_crisis, S.politics.episodes.filter(e => e.id === 'public_military_pressure').length], [true, 0]);
  const pressure = S.coup.pressure;
  at(Q, 1925, 11);
  PolishPolitics.afterEvents(Q);
  assert.equal(S.politics.episodes.filter(e => e.id === 'public_military_pressure').length, 1, 'the crisis of XI 1925');
  assert.equal(S.coup.pressure, pressure + 8, 'the impulse +8 once');
  PolishPolitics.afterEvents(Q);
  assert.equal(S.coup.pressure, pressure + 8, 'not again');
  assert.equal(PolishPolitics.SPEECHES.find(s => s.id === 'speech_1922_dispute').topic, 'the right to appoint the cabinet');
});

// Stage 8, decisions A1–A3: the chain of 1925 (17.16.8) — Grabski's resignation as a dated input, the portfolio of NPR in
// the broad cabinet of 8.9, and the review of an agreement that the cabinet carries out.
test('Dymisja Grabskiego (A1): from XI 1925 Grabski resigns once if he governs during the credit crisis; not before, not with another premier, not after the crisis; the formation card names the cause', () => {
  const Q = quiet();
  const S = Q.S;
  S.scenario.inputs.grabski_resignation_1925 = true;
  S.cabinet.pm = 'grabski'; // fixture: Grabski governs
  S.economy.currency_regime = 'zloty'; // fixture: after the currency reform, as in 1925 (no marka inflation)
  assert.equal(PolishPolitics.SCENARIO_INPUTS.grabski_resignation_1925, PolishRules.timeOf(1925, 11));
  at(Q, 1925, 10);
  settle(Q);
  assert.equal(S.cabinet.status, 'active', 'not before XI 1925, even in the credit crisis');
  assert.equal(PolishEconomy.creditCrisis(S.economy, Q.time), true, 'the dated credit shock of 1925 still applies in XI');
  settle(Q);
  const episode = S.politics.episodes.find(e => e.id === 'grabski_resignation_1925');
  assert.deepEqual([S.cabinet.status, S.cabinet.fall_reason, episode && episode.cause], ['caretaker', 'resignation', 'credit_crisis']);
  assert.match(PolishPolitics.crisisNote(Q), /Grabski has resigned: the credit crisis of autumn 1925/);
  assert.equal(PolishPolitics.scanGrabskiResignation(Q), null, 'once per chapter');
  // Another premier in XI 1925, or Grabski only after the crisis: nothing happens.
  const Q2 = quiet();
  Q2.S.scenario.inputs.grabski_resignation_1925 = true;
  Q2.S.economy.currency_regime = 'zloty';
  at(Q2, 1925, 11);
  settle(Q2);
  assert.equal(Q2.S.cabinet.status, 'active', 'the cabinet of another premier stays');
  const Q3 = quiet();
  Q3.S.scenario.inputs.grabski_resignation_1925 = true;
  Q3.S.cabinet.pm = 'grabski';
  Q3.S.economy.currency_regime = 'zloty';
  at(Q3, 1926, 2);
  settle(Q3);
  assert.deepEqual([Q3.S.cabinet.status, PolishEconomy.creditCrisis(Q3.S.economy, PolishRules.timeOf(1926, 2))], ['active', false], 'no crisis, no resignation');
});

test('Resort NPR (A2, 8.9): in the broad cabinet of Skrzyński NPR accepts Industry and Trade as well as Labour; in another cabinet only Labour', () => {
  const portfolios = { labor: 'pps', economic: 'npr', agriculture: 'psl_piast', justice: 'pschd', finance: 'zln' };
  const members = ['pps', 'psl_piast', 'npr', 'pschd', 'zln'];
  assert.deepEqual(PolishGovernment.PORTFOLIO_ALTERNATIVES.skrzynski_broad.npr, ['economic']);
  assert.equal(PolishGovernment.portfolioFit('npr', { configuration_id: 'skrzynski_broad', members, portfolios }), 100);
  assert.equal(PolishGovernment.portfolioFit('npr', { configuration_id: 'national_unity', members, portfolios }), 0);
  assert.equal(PolishGovernment.portfolioFit('npr', { configuration_id: 'skrzynski_broad', members, portfolios: Object.assign({}, portfolios, { economic: 'zln' }) }), 0);
});

test('Przegląd porozumienia (A3): an agreement carried out by the cabinet is extended at its review while that cabinet governs and Piłsudski scores it at least 60; with another cabinet it expires, without +8', () => {
  const run = sameCabinet => {
    const Q = quiet();
    const S = Q.S;
    militaryCase(Q);
    PolishGovernment.supportDemand(Q, 'persuade', 'military_compromise', 'ordinary');
    settle(Q);
    const agreement = S.agreements[S.actors.pilsudski.agreement_id];
    assert.equal(agreement.executor, 'cabinet');
    if (!sameCabinet) S.cabinet.id = 'another_cabinet'; // fixture: another cabinet governs at the review
    const review = agreement.review_at;
    const result = PolishSecurity.reviewAgreements(Q, review - 1);
    return { agreement, review, result, impulses: S.coup.impulses.filter(i => i.kind === 'personal_conflict').length };
  };
  const same = run(true);
  assert.deepEqual([same.result, same.agreement.status, same.agreement.review_at], ['extended', 'active', same.review + 6]);
  const other = run(false);
  assert.deepEqual([other.result, other.agreement.status, other.impulses], ['expired', 'expired', 0]);
});

// Stage 8, closing fixes 1–5 (gaps of earlier stages in approved rules and texts).
test('Front z komunistami (poprawka 1, 9.6): the offers with the KPP stay closed until the broader agreement on its three rules; then the usual gates and votes decide, and the KPP asks for no ministry', () => {
  const Q = quiet();
  const S = Q.S;
  for (const id of ['united_left', 'workers_front']) assert.match(PolishGovernment.configurationStatus(Q, id, {}).reason, /broader agreement with the KPP/);
  S.actors.communist_cooperation.rules = { legal_vote: true, no_forced_merger: true, agreed_strike_end: true };
  S.actors.communist_cooperation.rules_agreed = true;
  S.actors.communist_cooperation.active_agreement = { agreed_at: Q.time, goal: 'joint_workers_action' };
  for (const id of ['united_left', 'workers_front']) {
    assert.doesNotMatch(PolishGovernment.configurationStatus(Q, id, {}).reason, /broader agreement/, id + ': the preparation is met; gates and votes remain');
  }
  assert.equal(PolishGovernment.portfolioFit('kpp', { configuration_id: 'united_left', members: ['pps', 'psl_wyzwolenie', 'npr', 'kpp'], portfolios: {} }), 100);
});

test('Agenda bez martwej próby (poprawka 2): the trial with the KPP is agreed in a strike, not on the party agenda; its rule keeps an accurate reason', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  PolishGovernment.kppContact(Q);
  free(Q); Q.time += 1;
  engine.goToScene('polish_party_agenda');
  const ids = (engine.getCurrentChoices() || []).map(c => c.id);
  assert.ok(ids.includes('polish_party_agenda.kpp_rules'), 'the KPP steps are on the agenda');
  assert.ok(!ids.includes('polish_party_agenda.kpp_trial'), 'but not the trial');
  PolishGovernment.changeRelation(Q, 'kpp', 30 - Q.S.actors.relations.kpp, 'fixture');
  assert.match(PolishParty.kppStepStatus(Q, 'trial').reason, /in a strike/);
  assert.doesNotMatch(PolishParty.kppStepStatus(Q, 'trial').reason, /stage/);
});

test('Kredyt rządu (poprawka 3): a credit instrument that the cabinet prepared is not sent to the agenda of PPS; the card says the cabinet launches it', () => {
  const Q = quiet();
  // Fixture: PPS is a member of the cabinet and holds Industry and Trade, so the card is open.
  Q.S.cabinet.partner_ids = Q.S.cabinet.partner_ids.concat(['pps']);
  Q.S.cabinet.pps_mode = 'member';
  Q.S.cabinet.portfolios.economic = 'pps';
  PolishProjects.prepareProject(Q, 'credit_instrument', 'public', { sponsor: 'cabinet', cabinet_id: Q.S.cabinet.id });
  assert.match(PolishProjects.optionStatus(Q, 'industrial_policy', 'credit').reason, /The cabinet has prepared this financing/);
});

test('Bez niemieckiej muzyki (poprawka 5): the Polish chapter starts without the music files of the German game', () => {
  const engine = dendry.startGame();
  assert.ok(!JSON.stringify(engine.game.scenes['root.1928_main']).includes('music/'));
});
