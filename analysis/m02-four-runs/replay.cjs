#!/usr/bin/env node
'use strict';

// Four controlled political/economic replays. Approval tables and historical
// background are explicit fixtures, not secretly generated historical facts.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { economyStep, shocks, newCells, societyStep, average, delivery, time, date, clip, near } = require('../m02-current-rules/calculate.cjs');
const root = path.resolve(__dirname, '../..');
const scenarios = [
  { id: 'A', label: 'PPS bierna', organized: false, welfare: false, coalition: false, militaryRequest: null, stance: 'neutral' },
  { id: 'B', label: 'PPS tolerująca', organized: true, welfare: true, coalition: false, militaryRequest: '1925-06', stance: 'legal' },
  { id: 'C', label: 'PPS współrządząca', organized: true, welfare: true, coalition: true, militaryRequest: '1925-12', stance: 'legal' },
  { id: 'H', label: 'Decyzje zbliżone do historycznych', organized: true, welfare: false, coalition: true, historical: true, militaryRequest: null, stance: 'pils' },
];
// Synthetic frozen parliament for comparative negotiation, NOT the historical result.
const seats = { pps: 41, wyzwolenie: 49, npr: 18, piast: 70, pschd: 60, zln: 100, minorities: 90, other: 14, kpp: 2 };
assert.equal(Object.values(seats).reduce((a, b) => a + b), 444);
const inputManifest = {
  rules: 'reference 0.12 + comparison proposal: wage recovery 3; limited protest 50 or unresolved demand; finite cabinet agenda; one revised essential offer; event-based pressure',
  parliament: seats,
  assumptions: [
    'The 1922 election result is frozen identically to compare governing strategies, not calculated from campaigning.',
    '1922 succession, the May 1923 accepted right-wing offer, and ten Piast deputies withdrawing support in December 1923 are supplied political fixtures. Ten is a synthetic parameter, not a historical statistic.',
    'A named unresolved army-organization dispute opens in January 1925 for all runs. Its onset is a supplied stress-test event, not inferred from the calendar by economic equations.',
    'The competent actors accept the listed feasible fiscal instruments and the civilian-control military compromise if formally offered. Actual acceptance is an input; PPS authority, organization, relationships, finance and timing are checked.',
    'The active 1925 credit crisis can open broad-coalition talks (the small connector proposed in the comparison). It does not appoint a cabinet.',
    'Skrzynski agrees to the offered reconstruction only if PPS joins. Passive/external-support PPS keeps the existing expert cabinet; this condition is a test offer, not a historical claim.',
    'Industry covers 60% and railway 20% of modelled employed recipients; demand, repression and settlement effects are weighted. Remaining 20% is outside this wage case.',
    'Exposure to newly rising unemployment uses the common positive-pp interpretation; population mixing is the same diagnostic assumption as in the first two reports.',
    'No adviser bonus, population campaigning or automatic electoral transfers are supplied; resources, relevant relationships and union preparation are explicitly tracked. Party cohesion 95.25 and line alignment 50 are controlled inputs, not simulated factional outcomes.',
    'The military agreement is reviewed and renewed every six months by consenting actors; renewal carries no repeated pressure reduction. No other military dispute or broken promise is inserted.',
    'Synthetic forces/loyalties, logistics 0.8, objective access true, and no accepted in-coup bargain are used to test the four-round coup algorithm. Military outcomes are not historical predictions.',
  ],
};
const copy = x => JSON.parse(JSON.stringify(x));
const sum = xs => xs.reduce((a, b) => a + b, 0);
function roll(key, seed) {
  return crypto.createHash('sha256').update(`${seed}:${key}`).digest().readUInt32BE(0) / 4294967296;
}
function partyPlan(cfg) {
  const p = {};
  if (!cfg.organized) return p;
  Object.assign(p, {
    '1922-01': ['apparatus'], '1922-02': ['collect'], '1922-03': ['reach', 'industry'],
    '1922-04': ['ready', 'industry'], '1922-05': ['reach', 'industry'], '1922-06': ['collect'],
    '1922-07': ['reach', 'rail'], '1922-08': ['ready', 'rail'], '1922-09': ['reach', 'rail'],
    '1922-10': ['ready', 'rail'], '1922-11': ['contact', 'piast'], '1922-12': ['collect'],
    '1923-01': ['ready', 'industry'], '1923-02': ['contact', 'piast'], '1923-03': ['contact', 'npr'],
    '1923-04': ['fund', 'industry'], '1923-05': ['contact', 'pschd'], '1923-08': ['contact', 'pschd'],
    '1923-11': ['contact', 'pschd'], '1924-02': ['contact', 'pschd'],
  });
  if (cfg.id === 'C') for (const d of ['1924-01', '1924-04', '1924-07', '1924-10', '1925-01']) p[d] = ['contact', 'zln'];
  if (cfg.historical) {
    Object.assign(p, { '1923-07': ['reach', 'rail'], '1923-09': ['ready', 'rail'],
      '1923-10': ['reach', 'rail'], '1923-12': ['ready', 'rail'], '1924-01': ['reach', 'rail'],
      '1924-03': ['ready', 'rail'], '1924-06': ['fund', 'rail'] });
  }
  if (cfg.militaryRequest) p[cfg.militaryRequest] = ['military_request'];
  if (cfg.id === 'C') p['1925-11'] = ['prepare_works'];
  if (cfg.id === 'C') p['1925-12'] = ['launch_works']; // Army request is made in the cabinet event, 0 T.
  return p;
}
function replay(cfg, options = {}) {
  // Opt-in revised specification; the saved four-run report retains old defaults.
  const revision13 = options.revision13 === true;
  const seed = options.seed ?? 'm02-four-runs-v1';
  const rows = [], events = [], projects = [], policies = [], institutional = [], seenCivil = new Set();
  const cells = newCells(), plans = partyPlan(cfg);
  let E = { inflation: 4, wage: 100, output: 100, credit: 55, marketUnemployment: 3, unemployment: 3, agrarian: 45 };
  const P = { cash: 2, apparatus: 1, relations: { piast: 45, npr: 50, pschd: 30, zln: 5, pilsudski: 60 }, cd: {}, spent: 0, activeActions: 0 };
  const unions = Object.fromEntries(['industry', 'rail', 'rural'].map(id => [id, { reach: 20, readiness: 25, trust: 50, dissent: 0, fatigue: 0, fund: id === 'industry' ? .5 : .25 }]));
  let cabinet = 'Ponikowski', ppsMode = 'external_support', taxLevel = 0, business = 10, pressure = 10;
  let preparedCurrency = false, zloty = false, militaryOpen = false, militaryPending = false, militaryResolved = false, militaryReview = null;
  let benefit = false, benefitPaid = false, benefitPromised = false, agreementTension = 0, ultimatumAt = null;
  let benefitCost = 2, broadFormedAt = null, broadReviewDone = false, rightOfferAt = null;
  let demand = null, lastWageSettlement = null, broadAttempted = false, worksPrepared = false;
  let strikes = [], wageAgreements = [], firstZloty = null, firstCredit = null, endpoint = null;
  let politicalOffer = null, democracy = 60, violence = 10, railOffset = 0;
  const budgetBase = 2;
  const settlementRounds = new Set();
  const forces = [
    { id: 'capital_legal', f: 45, ready: .8, command: .8, legal: .9, pils: .05, phase: 0 },
    { id: 'capital_pils', f: 55, ready: .85, command: .85, legal: .05, pils: .9, phase: 0 },
    { id: 'near', f: 25, ready: .7, command: .7, legal: .35, pils: .45, phase: 1 },
    { id: 'remote', f: 35, ready: .7, command: .7, legal: .7, pils: .15, phase: 2 },
  ];
  const emit = (t, kind, message, data = {}) => events.push({ time: t, date: date(t), kind, message, ...data });
  const law = (t, id) => { if (!institutional.some(e => e.id === id)) institutional.push({ t, type: 'law', id }); };
  const civil = (t, id, applied) => {
    if (!seenCivil.has(id)) { seenCivil.add(id); applied.add(id); emit(t, 'agreement_fulfilled', `Wykonane zobowiązanie: ${id}.`); }
  };
  const appoint = (t, name, reason, mode = 'opposition', evidence = {}) => {
    const from = cabinet; cabinet = name; ppsMode = mode;
    institutional.push({ t, type: 'resolution', id: `cabinet-${name}-${t}` });
    emit(t, 'cabinet', `${from} → ${name}: ${reason}`, { ppsMode, ...evidence });
  };
  const budgetAt = (t, extraCost = 0, extraRevenue = 0) => {
    const policyB = sum(policies.filter(p => p.start <= t && t < p.end).map(p => p.b));
    const charges = sum(projects.map(p => p.firstEffect && p.firstEffect <= t ? p.upkeep : p.cost)) + (benefit ? benefitCost : 0);
    return { budget: budgetBase + taxLevel + clip((E.output - 100) / 20, -3, 3)
      - Math.min(3, Math.floor(Math.max(0, E.inflation) / 20)) + policyB - charges - extraCost + extraRevenue,
      policyB, charges: charges + extraCost };
  };
  const startProject = (t, kind, cost, upkeep, duration, source, npc) => {
    assert.ok(!projects.some(p => p.kind === kind), `duplicate ${kind}`);
    const forecast = budgetAt(t, cost).budget;
    if (forecast < -2) { emit(t, 'blocked', `Nie można wdrożyć ${kind}: prognoza ${forecast.toFixed(2)} B.`, { forecast }); return false; }
    if (source === 'cabinet') npc.count++;
    projects.push({ kind, cost, upkeep, duration, start: t, progress: 0, firstEffect: null });
    emit(t, source, `Wdrożenie ${kind}; koszt ${cost} B, czas ${duration} M.`, { forecast });
    return true;
  };
  const spend = (amount) => { assert.ok(P.cash + 1e-9 >= amount, `${cfg.id}: party budget ${P.cash}<${amount}`); P.cash -= amount; P.spent += amount; };
  function partyAction(t, action, npc) {
    if (!action) return; // one neutral ordinary action, no extra political effects
    const [type, target] = action;
    const key = `${type}:${target ?? ''}`;
    assert.ok(t >= (P.cd[key] ?? 0), `${cfg.id}: cooldown ${key}`);
    P.activeActions++;
    if (type === 'apparatus') { spend(2); P.apparatus++; }
    if (type === 'collect') { P.cash += 2; P.cd[key] = t + 3; }
    if (type === 'reach') { spend(1); unions[target].reach = Math.min(100, unions[target].reach + 15); P.cd[key] = t + 2; }
    if (type === 'ready') { unions[target].readiness = Math.min(100, unions[target].readiness + 15); P.cd[key] = t + 2; }
    if (type === 'fund') { spend(1); unions[target].fund += 1; }
    if (type === 'contact') { P.relations[target] += P.relations[target] >= 70 ? 2 : 4; P.cd[key] = t + 3; }
    if (type === 'military_request') {
      if (options.noMilitaryCompromise) emit(t, 'counterfactual', 'Pominięto wniosek o kompromis wojskowy.');
      else { assert.ok(ppsMode !== 'opposition'); militaryPending = true; }
    }
    if (type === 'prepare_works') {
      if (ppsMode === 'member') worksPrepared = true;
      else emit(t, 'blocked', 'Brak udziału w gabinecie: przygotowanie nie daje uprawnienia do wykonania robót.');
    }
    if (type === 'launch_works') {
      if (ppsMode === 'member' && worksPrepared && !options.noWorks) startProject(t, 'works', 2, 1, 3, 'pps', npc);
      if (!options.noMilitaryCompromise && ppsMode === 'member') militaryPending = true;
    }
    emit(t, 'pps_action', `${type}${target ? ': ' + target : ''}`, { cashAfterChoice: P.cash });
  }
  const compliance = u => clip(.35 + .004 * 50 + .003 * 95.25 - .003 * u.dissent, 0, 1);
  const strikePotential = id => {
    const u = unions[id], participation = u.reach * u.readiness / 100 * (1 - u.fatigue / 100) * compliance(u);
    const cost = .1 + .01 * participation;
    return { participation, cost, credible: participation * Math.min(1, u.fund / (2 * cost)) };
  };
  function offerSettlement(t, ids, authority, endStrike, threshold = 40) {
    assert.ok(!settlementRounds.has(t), 'one settlement offer per active round');
    settlementRounds.add(t);
    if (threshold === 80) {
      // This controlled parliament still supports the incumbent. A structural
      // demand cannot be fulfilled by employers signing a wage settlement.
      emit(t, 'political_offer_refused', 'Żądanie dymisji zgłoszone, lecz premier i większość go nie przyjmują. Następna runda PPS wraca do ograniczonej oferty płacowej.', { threshold, actorRefusalIsFixture: true });
      return false;
    }
    const chance = Math.min(...ids.map(id => clip(.5 + (.5 * strikePotential(id).credible + .3 * (id === 'rail' ? 90 : 60)
      + .2 * (100 - authority) - threshold) / 100, .05, .95)));
    const draw = roll(`wage-offer-${t}`, seed);
    const accepted = draw < chance;
    emit(t, 'settlement_offer', `Ograniczona ugoda: ${accepted ? 'przyjęta' : 'odrzucona'}.`, { chance, draw, ids });
    if (!accepted) return false;
    wageAgreements.push({ start: t + 1, end: t + 3, pp: 2 * sum(ids.map(id => id === 'industry' ? .6 : .2)) });
    lastWageSettlement = { due: t + 1, ids, fulfilled: false };
    demand.status = 'agreed';
    for (const id of ids) {
      unions[id].trust = Math.min(100, unions[id].trust + 5);
      const pot = strikePotential(id);
      const acceptance = .5 * 100 + .3 * unions[id].trust + .2 * 100 * Math.min(1, unions[id].fund / (2 * pot.cost));
      assert.ok(acceptance >= 50);
    }
    if (endStrike) strikes = [];
    emit(t, 'strike_end', 'Zakończenie na uzgodnionych warunkach; podwyżka dopiero od następnego miesiąca.');
    return true;
  }
  function resolveCoup(t) {
    const capacity = sum(forces.map(f => f.f * f.ready * f.command * f.pils)) * .8;
    assert.ok(capacity >= 30);
    for (const f of forces) {
      const draw = roll(`unit-${f.id}`, seed);
      f.side = draw < f.legal ? 'legal' : draw < f.legal + f.pils ? 'pils' : 'neutral';
      if (options.forceSides?.[f.id]) f.side = options.forceSides[f.id]; // explicit isolated transport fixture
      assert.ok(['legal', 'pils', 'neutral'].includes(f.side));
      f.draw = draw; f.loss = 0;
    }
    const side = cfg.stance === 'neutral' ? 'neutral' : cfg.stance;
    const railUsed = cfg.historical && side !== 'neutral' && !options.noCoupRail;
    let streak = { pils: 0, legal: 0 }, outcome = 'prolonged_conflict';
    const rounds = [];
    let delay = 0;
    for (let phase = 0; phase < 4; phase++) {
      let railParticipation = 0;
      if (railUsed) {
        const pot = strikePotential('rail'), cost = pot.cost / 4;
        railParticipation = pot.participation * Math.min(1, unions.rail.fund / cost);
        unions.rail.fund -= Math.min(unions.rail.fund, cost);
        if (phase === 0) delay = railParticipation >= 65 && unions.rail.readiness >= 70 ? 2
          : railParticipation >= 40 && unions.rail.readiness >= 50 ? 1 : 0;
      }
      const available = forces.filter(f => f.side !== 'neutral' && f.phase + (f.id === 'remote' && f.side !== side ? delay : 0) <= phase);
      const F = Object.fromEntries(['pils', 'legal'].map(s => [s, sum(available.filter(f => f.side === s).map(f => (f.f - f.loss) * f.ready * f.command))]));
      for (const s of ['pils', 'legal']) streak[s] = F[s] > 1.2 * F[s === 'pils' ? 'legal' : 'pils'] ? streak[s] + 1 : 0;
      for (const f of available) f.loss += (f.f - f.loss) * .08 * F[f.side === 'pils' ? 'legal' : 'pils'] / Math.max(1, F.pils + F.legal);
      rounds.push({ phase, F, railParticipation, delay, streak: copy(streak) });
      if ((!revision13 || phase >= 2) && (streak.pils >= 2 || streak.legal >= 2)) { outcome = streak.pils >= 2 ? 'pils_victory' : 'legal_victory'; break; }
    }
    const outputLossPercent = Math.min(8, .5 * rounds.length + .02 * (railUsed ? sum(rounds.map(r => r.railParticipation * .9 * .3)) / rounds.length : 0));
    E.output *= 1 - outputLossPercent / 100;
    emit(t, 'coup', `Rozstrzygnięcie syntetycznej próby: ${outcome}.`, { capacity, pressure, stance: side, railUsed, forces, rounds, outputLossPercent });
    return { kind: 'synthetic_coup_result', date: date(t), outcome, capacity, rounds: rounds.length, pressure, postCoupOutput: E.output };
  }

  for (let t = 1; t <= time('1928-02'); t++) {
    if (t >= time('1926-03') && pressure >= 65) { endpoint = resolveCoup(t); break; }
    if (t === time('1928-02')) {
      endpoint = { kind: 'scheduled_election_boundary', date: '1928-02-19', pressure, note: 'Boundary before the next ordinary turn; electoral preferences/results not forecast.' }; break;
    }
    const npc = { count: 0 }, newCivil = new Set();
    let localRepression = false, rejectedDemand = false, adminCut = false, successfulSettlement = false;
    const currencyCrisis = rows.length >= 2 && rows.slice(-2).every(r => r.inflation >= 20);
    const fiscalCrisis = rows.length >= 2 && rows.slice(-2).every(r => r.budget < -2);
    if (currencyCrisis && !rows.at(-1)?.currencyCrisis) emit(t, 'crisis', 'Dwa zakończone miesiące inflacji ≥20%: bramka kryzysu walutowego.');
    if (fiscalCrisis && !rows.at(-1)?.fiscalCrisis) emit(t, 'crisis', 'Dwa zakończone miesiące budżetu <−2 B: bramka kryzysu finansowego.');
    if (militaryReview === t) {
      militaryReview = t + 6;
      emit(t, 'military_review', 'Strony potwierdzają wykonanie i przedłużenie umowy na 6 M; bez ponownej ulgi.', { acceptanceIsFixture: true });
    }
    for (const p of projects.filter(p => p.firstEffect === t)) {
      emit(t, 'project_effect', `Pierwszy efekt: ${p.kind}.`);
      if (p.kind === 'currency') { zloty = true; firstZloty = date(t); law(t, 'currency'); civil(t, 'currency', newCivil); }
      if (p.kind === 'land') {
        law(t, 'land'); civil(t, 'land', newCivil);
        for (const c of cells.filter(c => c.kind === 'peasants')) c.grievance = clip(c.grievance - 4, 0, 100);
      }
      if (p.kind === 'credit') { firstCredit = date(t); civil(t, 'credit', newCivil); }
      if (p.kind === 'works') civil(t, 'works', newCivil);
    }
    if (lastWageSettlement && !lastWageSettlement.fulfilled && t === lastWageSettlement.due) {
      lastWageSettlement.fulfilled = true; successfulSettlement = true; demand.status = 'closed';
      if (revision13) {
        for (const c of cells.filter(c => c.employment === 'employed')) c.grievance = clip(c.grievance - 4 * .8, 0, 100);
        emit(t, 'settlement_relief', 'Pierwsza wykonana korzyść ugody: −4 niezadowolenia adresatom (80% zatrudnionych), raz.');
      }
      civil(t, `wage-${t}`, newCivil);
      emit(t, 'settlement_executed', 'Wykonanie ugody płacowej: pierwszy miesiąc podwyżki; żądanie płacowe zamknięte. Bez automatycznego uchylenia represji.');
    }
    if (fiscalCrisis && budgetAt(t).budget >= -2) emit(t, 'fiscal_review',
      'Przegląd po niedoborze: ukończona parcelacja przestaje obciążać budżet; kontynuacja zobowiązań jest wykonalna bez nowej korekty.',
      { currentForecast: budgetAt(t).budget });
    // Common supplied political background; ballots and reasons are explicit.
    if (t === time('1922-06')) {
      cabinet = 'Ponikowski (obowiązki)'; ppsMode = 'opposition';
      institutional.push({ t, type: 'failure', id: 'sliwinski' });
      emit(t, 'fixture', 'Brak uzgodnionego kompromisu z Naczelnikiem; dymisja Ponikowskiego. Próba Śliwińskiego bez przyjętego poparcia.');
    }
    if (t === time('1922-07')) appoint(t, 'Nowak', 'przyjęta administracyjna oferta kompromisowa', 'opposition', { fixture: true });
    if (t === time('1922-11')) emit(t, 'fixture', 'Wspólny zamrożony wynik wyborów 1922.', { seats });
    if (t === time('1922-12')) {
      emit(t, 'fixture', 'Gałąź Narutowicza, legalne zastępstwo Rataja i następca; to wejście polityczne, nie losowanie ryzyka zabójstwa.');
      appoint(t, 'Sikorski', 'przyjęta oferta ciągłości władz po kryzysie prezydenckim', 'external_support', { fixture: true });
      violence = clip(violence + 10, 0, 100);
      if (cfg.organized) { spend(1); democracy = clip(democracy + 2, 0, 100); emit(t, 'pps_event', 'Pokojowa mobilizacja republikańska, 1 R.'); }
    }
    if (t === time('1923-05')) {
      const yes = seats.zln + seats.pschd + seats.piast;
      assert.ok(yes > 444 - yes);
      emit(t, 'ballot', 'Przyjęte żądanie ustąpienia Sikorskiego na rzecz oferty prawicy i Piasta.', { yes, no: 444 - yes, declarationsAreFixture: true });
      appoint(t, 'Chjeno-Piast', 'zaakceptowana oferta ziemska i finansowa; większość parlamentarna');
    }
    if (t === time('1923-12')) {
      const right = seats.zln + seats.pschd + seats.piast - 10;
      emit(t, 'fixture', 'Dziesięciu posłów Piasta zmienia deklarację poparcia wskutek wewnętrznego sporu politycznego. Liczba jest syntetyczna.');
      emit(t, 'ballot', 'Skuteczne głosowanie o ustąpieniu Chjeno-Piasta.', { yes: 444 - right, no: right });
      const qualifies = P.apparatus >= 2 && unions.industry.reach >= 40 && P.relations.piast >= 40;
      assert.ok(!cfg.welfare || qualifies);
      appoint(t, 'Grabski', 'przyjęta oferta ekspercka; PPS może wynegocjować osłonę', cfg.welfare || cfg.historical ? 'external_support' : 'opposition',
        { guaranteedSupport: seats.piast + seats.npr + seats.pschd + seats.minorities, welfareAgreement: cfg.welfare });
      benefitPromised = cfg.welfare;
    }
    if (t === time('1925-01')) { militaryOpen = true; emit(t, 'fixture', 'Otwarta konkretna sprawa organizacji naczelnych władz wojskowych; wspólne wejście testu.'); }
    const s = shocks(t, zloty);
    const creditCrisis = t >= time('1925-06') && t < time('1926-07');
    if (t === time('1925-06')) emit(t, 'crisis', 'Datowany kryzys kredytowy: +12 do szoku kredytu, −0,4 pp produkcji.');
    if (t === time('1925-11') && cfg.coalition && !broadAttempted) {
      broadAttempted = true;
      const required = { piast: 50, npr: 50, pschd: 45, zln: 25 };
      const missing = Object.entries(required).filter(([p, min]) => P.relations[p] < min).map(([p, min]) => `${p}: ${P.relations[p]} < ${min}`);
      if (missing.length && !options.allowHistoricalBroad && !revision13) emit(t, 'blocked', 'Próba wejścia do szerokiego gabinetu zablokowana.', { missing });
      else if (creditCrisis) {
        if (missing.length) emit(t, revision13 ? 'crisis_offer' : 'counterfactual', 'Ratunkowa oferta bez osobnej bramki relacji; zgody na wspólne minimum i urzędy pozostają jawnym wejściem.', { missing });
        const yes = seats.pps + seats.piast + seats.npr + seats.pschd + seats.zln;
        appoint(t, 'Skrzyński', 'przyjęta przebudowa rządu w odpowiedzi na kryzys kredytowy', 'member',
          { declaredSupport: yes, ppsMinistry: 'labor', otherActorsConsentIsFixture: true });
        broadFormedAt = t;
        if (revision13 && !benefit) benefitPromised = true;
      }
    }
    if (t === time('1926-04') && cfg.historical && !revision13) {
      emit(t, 'historical_intent', ppsMode !== 'member' ? 'Zamiar odejścia z koalicji niewykonalny: PPS do niej nie weszła.'
        : 'Nie ma aktywnej propozycji cięć osłon: brak historycznej przesłanki reaktywnego wyjścia PPS.', { budgetForecast: budgetAt(t).budget });
    }
    if (revision13 && broadFormedAt !== null && !broadReviewDone && t === broadFormedAt + 5) {
      broadReviewDone = true;
      if (creditCrisis && benefit && benefitCost === 2 && cabinet === 'Skrzyński') {
        npc.count++;
        emit(t, 'austerity_offer', 'Sześciomiesięczny przegląd: prawicowi partnerzy proponują osłonę 2→1 B.',
          { budgetBefore: budgetAt(t).budget, reason: 'policy_preference', actorProposalIsFixture: true });
        const response = options.broadResponse ?? (cfg.historical ? 'negotiate_then_withdraw' : 'negotiate');
        const compromise = P.relations.zln >= 25 && P.relations.pschd >= 45 && budgetAt(t).budget >= -2 && options.rightAcceptsCompromise !== false;
        if (response.startsWith('negotiate') && compromise) {
          emit(t, 'austerity_compromise', 'Przyjęto jedyny kompromis: pełne osłony, obecne wykonalne finansowanie. Bez ponownej nagrody za starą umowę.', { consentIsFixture: true });
        } else if (response === 'accept_cuts') {
          benefitCost = 1;
          emit(t, 'austerity_cut', 'PPS przyjmuje zmianę istniejącego świadczenia 2→1 B; ustawa i zgody przyjęte w profilu.', { leftDissentIfNoPartyConsent: 8 });
        } else {
          ppsMode = 'opposition'; benefitPromised = false;
          emit(t, 'pps_withdrawal', 'Kompromis odrzucony; PPS wycofuje ministrów. Gabinet jeszcze nie odwołany.');
          if (options.rightFormsReplacement !== false) rightOfferAt = t + 1;
        }
      } else emit(t, 'review_closed', 'Brak pełnej osłony, kryzysu lub właściwego gabinetu; zamknięto ten przegląd bez cięć.');
    }
    if (rightOfferAt === t) {
      const yes = seats.zln + seats.pschd + seats.piast;
      assert.ok(yes > 444 - yes);
      emit(t, 'ballot', 'Partnerzy akceptują własną ofertę Witosa i głosują za zmianą gabinetu.', { yes, no: 444 - yes, declarationsAreFixture: true });
      appoint(t, 'Chjeno-Piast 1926', 'skuteczne głosowanie i przyjęta oferta; nie samo wyjście PPS');
      pressure = clip(pressure + 20, 0, 100);
      emit(t, 'chjeno_impulse', 'Faktyczny powrót tej konfiguracji: +20 presji raz.');
      if (benefit && benefitCost === 2) {
        npc.count++; benefitCost = 1;
        emit(t, 'austerity_cut', 'Nowy gabinet uchwala własne ograniczenie świadczenia 2→1 B. PPS w opozycji, program nie znika.', { legalConsentIsFixture: true });
      }
    }
    partyAction(t, plans[date(t)], npc);

    // Finite cabinet agenda, one initiative at most. Preparation survives replacement.
    if (npc.count > 0) {
      // An existing crisis proposal used this month's one cabinet initiative.
    } else if (revision13 && cabinet === 'Skrzyński' && benefitPromised && !benefit) {
      assert.ok(budgetAt(t, 2).budget >= -2);
      benefit = true; npc.count++;
      emit(t, 'cabinet', 'Wykonanie przyjętego minimum PPS: osłona 2 B z istniejącej przestrzeni finansowej; bez nowego podatku i bez kopii programu.');
    } else if (cabinet === 'Sikorski' && t === time('1922-12')) {
      policies.push({ id: 'protection', start: t, end: t + 1, b: -1 }); npc.count++;
      emit(t, 'cabinet', 'Sikorski: ochrona zagrożonych instytucji, koszt 1 B przez miesiąc.');
    } else if (cabinet === 'Sikorski' && t === time('1923-01')) {
      npc.count++; emit(t, 'offer_input', 'Sikorski proponuje porozumienie pracownicze; brak zgody wskazanego wykonawcy, bez efektu i bez dymisji za opcjonalny punkt.');
    } else if (cabinet === 'Sikorski' && rows.length >= 2 && rows.slice(-2).every(r => r.inflation >= 20) && !preparedCurrency) {
      preparedCurrency = true; npc.count++; emit(t, 'cabinet', 'Przygotowanie reformy walutowej po dwóch miesiącach inflacji ≥20%.');
    } else if (cabinet === 'Chjeno-Piast' && t === time('1923-05')) {
      npc.count++; emit(t, 'cabinet', 'Przygotowanie uzgodnionej parcelacji z odszkodowaniem.');
    } else if (cabinet === 'Chjeno-Piast' && t === time('1923-06')) {
      if (startProject(t, 'land', 2, 0, 4, 'cabinet', npc)) business += 8;
    } else if (cabinet === 'Chjeno-Piast' && t === time('1923-07')) {
      taxLevel++; business += 4; npc.count++; emit(t, 'cabinet', 'Szersza podstawa podatku: +1 B trwale; uzgodniony pakiet finansowania.');
      for (const c of cells.filter(c => ['petty', 'intelligentsia'].includes(c.kind))) c.grievance = clip(c.grievance + 3, 0, 100);
    } else if (cabinet === 'Chjeno-Piast' && t >= time('1923-08') && preparedCurrency && !projects.some(p => p.kind === 'currency')) {
      const forecast = budgetAt(t, 2, 1).budget;
      if (forecast >= -2) {
        policies.push({ id: 'administration_cut', start: t, end: t + 6, b: 1 }); adminCut = true;
        startProject(t, 'currency', 2, 0, 3, 'cabinet', npc);
      } else throw new Error('Fixture needs an explicit revised essential offer, not indefinite currency retries.');
    } else if (cabinet === 'Grabski' && benefitPromised && !benefit) {
      const forecast = budgetAt(t, 2, 3).budget;
      assert.ok(forecast >= -2);
      benefit = true; taxLevel++; business += 12; npc.count++;
      policies.push({ id: 'wealth_tax', start: t, end: t + 6, b: 2 });
      emit(t, 'cabinet', 'Wdrożenie wynegocjowanej osłony 2 B: progresja +1 B trwale oraz podatek majątkowy +2 B na 6 M.', { forecast });
    } else if (creditCrisis && !projects.some(p => p.kind === 'credit') && !politicalOffer) {
      politicalOffer = { kind: 'credit', phase: 'prepared', due: t + 1 }; npc.count++;
      emit(t, 'cabinet', 'Przygotowanie instrumentu kredytowego po otwarciu kryzysu.');
    } else if (politicalOffer?.kind === 'credit' && t >= politicalOffer.due) {
      if (startProject(t, 'credit', 2, 1, 2, 'cabinet', npc)) politicalOffer = null;
      else throw new Error('Fixture needs an explicit revised essential offer, not indefinite credit retries.');
    } else if (militaryPending && militaryOpen && !militaryResolved && !options.noMilitaryCompromise) {
      npc.count++; militaryOpen = false; militaryResolved = true; militaryPending = false; pressure = clip(pressure - 12, 0, 100);
      assert.ok(P.relations.pilsudski >= 40);
      P.relations.pilsudski += 4;
      militaryReview = t + 6;
      const nearForce = forces.find(f => f.id === 'near');
      nearForce.legal *= (1 - nearForce.pils - .05) / (1 - nearForce.pils);
      nearForce.pils += .05;
      emit(t, 'military_compromise', 'Wykonane uzgodnione stanowisko pod cywilną kontrolą: −12 presji raz; sprawa zamknięta.',
        { executor: cabinet, offerAcceptanceIsFixture: true, nearReserveLoyaltyChange: .05 });
    }
    assert.ok(npc.count <= 1, `${cfg.id} ${date(t)}: too many government initiatives`);

    const recent = institutional.filter(e => e.t > t - 12);
    const authority = clip(55 + 4 * recent.filter(e => e.type === 'law').length + 4 * recent.filter(e => e.type === 'resolution').length
      - 6 * recent.filter(e => e.type === 'failure').length, 0, 100);
    if (!demand && rows.length >= 3 && rows.slice(-3).every(r => r.wage < 80)) {
      demand = { opened: t, status: 'unresolved', attempted: false }; rejectedDemand = true;
      emit(t, 'crisis', 'Trzy miesiące płac <80: żądanie wyrównania; brak przyjętej ugody do rozliczenia, +8 adresatom (80% zatrudnionych).');
    }
    // Union cash comes before any cost of active participation.
    for (const u of Object.values(unions)) u.fund += Math.min(.30, .05 * u.reach / 20) - .02;
    const workerG = average(cells.filter(c => c.kind === 'workers' && c.employment === 'employed'), 'grievance');
    if (demand && demand.status === 'unresolved' && !demand.attempted && t > demand.opened) {
      demand.attempted = true;
      if (!cfg.organized) emit(t, 'pps_event', 'PPS nie organizuje protestu ani nie negocjuje ugody. Żądanie pozostaje otwarte.');
      else {
        if (cfg.historical && workerG < 60) emit(t, revision13 ? 'political_strike_goal' : 'blocked', revision13
          ? 'Postulat dymisji dostępny w otwartym sporze; próg żądania 80, brak automatycznej mobilizacji ogólnej.'
          : 'Historyczny zamiar strajku z postulatem dymisji jest poniżej progu 60; wybrano dostępną akcję ekonomiczną.', { workerG });
        if (cfg.id === 'B') {
          if (!offerSettlement(t, ['industry', 'rail'], authority, true)) {
            strikes = ['industry', 'rail']; emit(t, 'strike', 'Po odmowie rokowań PPS rozpoczyna ograniczoną akcję.');
          }
        } else { strikes = ['industry', 'rail']; emit(t, 'strike', 'Ograniczony strajk przemysłowy i kolejowy, bez automatycznej dymisji.'); }
      }
    }
    let disruption = 0;
    if (strikes.length) {
      for (const id of strikes) {
        const u = unions[id], pot = strikePotential(id), participation = pot.participation * Math.min(1, u.fund / pot.cost);
        u.fund -= Math.min(u.fund, pot.cost);
        disruption += participation * (id === 'rail' ? .9 * .3 : .6 * .5);
        u.fatigue = Math.min(100, u.fatigue + 5);
      }
      const threshold = revision13 && cfg.historical && t === demand.opened + 1 ? 80 : 40;
      const accepted = settlementRounds.has(t) ? false : offerSettlement(t, ['industry', 'rail'], authority, true, threshold);
      if (!accepted && cabinet === 'Chjeno-Piast') {
        if (!railOffset) {
          for (const c of cells.filter(c => c.employment === 'employed')) c.grievance = clip(c.grievance + 10 * .2, 0, 100);
          railOffset = 8; emit(t, 'state_response_input', 'Wykonana militaryzacja kolei po odmowie ugody; +10 branżowo, ważone w populacji.');
        }
        const clashRisk = clip(.1 + .25 - .2 * compliance(unions.industry), 0, .9);
        const draw = roll(`clash-${t}`, seed);
        if (draw < clashRisk) {
          localRepression = true; violence = clip(violence + 10, 0, 100);
          emit(t, 'clash', 'Starcie w aktywnym sporze, bez wpisywania historycznej liczby ofiar.', { clashRisk, draw });
        } else emit(t, 'clash_avoided', 'Represyjna reakcja nie kończy się starciem w tym rzucie.', { clashRisk, draw });
      }
    } else for (const u of Object.values(unions)) u.fatigue = Math.max(0, u.fatigue - 5);

    P.cash += .25 * 2 + .20 * (P.apparatus - 1);
    P.cash -= .10 * P.apparatus + .10 + .10; // apparatus, press, militia
    assert.ok(P.cash >= -1e-9);
    const fiscal = budgetAt(t), coverage = delivery(fiscal.budget);
    for (const p of projects.filter(p => !p.firstEffect)) {
      p.progress = Math.min(100, p.progress + 100 / p.duration * coverage);
      if (p.progress >= 100 - 1e-9) { p.progress = 100; p.firstEffect = t + 1; emit(t, 'completion', `${p.kind}: ukończony, efekt od ${date(t + 1)}.`); }
    }
    const active = kind => projects.some(p => p.kind === kind && p.firstEffect && p.firstEffect <= t);
    const currencyProject = projects.find(p => p.kind === 'currency');
    const old = copy(E);
    E = economyStep(old, { monetary: s.monetary, creditShock: s.credit + (currencyProject && t < currencyProject.start + 3 ? 10 : 0),
      outputShock: s.output, agrarianShock: s.agrarian, creditSupport: active('credit') ? 5 * coverage : 0,
      worksUnits: active('works') ? 2 * coverage : 0, landUnits: projects.filter(p => p.kind === 'land' && p.firstEffect === t).length,
      strikeDisruption: disruption, wageAgreementPP: sum(wageAgreements.filter(w => w.start <= t && t < w.end).map(w => w.pp)),
    }, { slowWageRecovery: true, recoveryPoints: 3 });
    assert.ok(business < 40, 'active business reaction requires a complete expansion of this fixture');
    if (localRepression) for (const c of cells.filter(c => c.employment === 'employed')) {
      c.grievance = clip(c.grievance + 3 * .8, 0, 100); c.radicalization = clip(c.radicalization + 2 * .8, 0, 100);
    }
    if (successfulSettlement) for (const c of cells.filter(c => c.employment === 'employed')) c.radicalization = clip(c.radicalization - 2 * .8, 0, 100);
    const firstRelief = benefit && !benefitPaid && coverage > 0;
    if (firstRelief) { benefitPaid = true; law(t, 'benefit'); civil(t, 'benefit', newCivil); }
    const social = societyStep(cells, old, E, { rejectedDemand, rejectedDemandShare: .8, adminCut, benefit, benefitScale: benefitCost / 2, firstRelief, coverage }, 1);
    // An upper bound uses zero controlled participation. If even this exceeds
    // the gate, the fixture needs a real spontaneous-protest response.
    const uncontrolledUpperBound = social.workers * social.workerRadicalization / 100;
    assert.ok(uncontrolledUpperBound < 40, 'spontaneous protest requires an explicit actor response');
    if (benefitPromised && benefit && coverage < 1) {
      for (const c of cells.filter(c => c.employment === 'unemployed')) c.grievance = clip(c.grievance + 2, 0, 100);
      agreementTension = clip(agreementTension + 16, 0, 100);
      if (agreementTension >= 60 && !ultimatumAt) ultimatumAt = t + 2;
      emit(t, 'agreement_breach', 'Niewykonanie pełnej osłony: +16 napięcia; koszt programu pozostaje.', { coverage, tension: agreementTension });
    } else if (benefit && coverage === 1 && ultimatumAt) {
      ultimatumAt = null; emit(t, 'agreement_recovery', 'Pełne wypłaty wróciły; naruszenie zakończone bez automatycznej dymisji.');
    }
    // No invented Chjeno return or personal broken-promise impulse in these runs.
    const nationalG = average(cells, 'grievance');
    pressure = clip(pressure + 2 * (authority < 40) + 2 * (nationalG >= 60) + 2 * militaryOpen - 2 * (newCivil.size > 0), 0, 100);
    democracy = clip(democracy + .03 * (authority - 50) - .02 * Math.max(0, nationalG - 50), 0, 100);
    if (!localRepression) violence = Math.max(0, violence - 2);
    rows.push({ run: cfg.id, date: date(t), time: t, cabinet, ppsMode, ...E, budget: fiscal.budget, coverage,
      projectCharges: fiscal.charges, policyBudget: fiscal.policyB, taxLevel, businessPressure: business,
      workerGrievance: social.employedWorkers, unemployedGrievance: social.unemployed, workerRadicalization: social.workerRadicalization,
      uncontrolledUpperBound, nationalGrievance: nationalG, authority, democracy, violence, pressure,
      militaryOpen, cash: P.cash, apparatus: P.apparatus, industryReach: unions.industry.reach, industryReadiness: unions.industry.readiness,
      railReach: unions.rail.reach, railReadiness: unions.rail.readiness, railFund: unions.rail.fund, partySpending: P.spent,
      ppsActiveActions: P.activeActions, governmentInitiatives: npc.count, strikeDisruption: disruption,
      benefit, worksUnits: active('works') ? 2 * coverage : 0, agreementTension, currencyCrisis, fiscalCrisis,
    });
    if (t === time('1926-05')) emit(t, 'historical_checkpoint', 'Maj nie powołuje nowego rządu ani nie uruchamia próby samą datą.', { pressure, cabinet });
  }
  assert.ok(endpoint);
  return { config: cfg, options, firstZloty, firstCredit, endpoint, finalEconomy: E, finalParty: P, finalUnions: unions,
    projects, events, rows, forces, blocked: events.filter(e => e.kind === 'blocked') };
}

function main() {
  const runs = scenarios.map(c => replay(c));
  // Targeted counterfactuals isolate decisions rather than changing every input.
  const counterfactuals = [replay(scenarios[1], { noMilitaryCompromise: true }),
    replay(scenarios[2], { noMilitaryCompromise: true }), replay(scenarios[3], { allowHistoricalBroad: true }),
    replay(scenarios[3], { noCoupRail: true }), replay(scenarios[2], { noWorks: true })];
  const files = ['docs/POLISH_TECHNICAL_REFERENCE.md', 'docs/POLISH_DESCRIPTIVE_GUIDE.md', 'analysis/m02-comparison/REPORT.md'];
  const hashes = Object.fromEntries(files.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
  for (const r of [...runs, ...counterfactuals]) {
    assert.ok(r.rows.every(x => x.cash >= 0 && x.railFund >= 0 && x.governmentInitiatives <= 1));
    assert.ok(r.events.filter(e => e.kind === 'military_compromise').length <= 1);
    assert.ok(r.rows.every(x => x.ppsMode === 'member' || x.worksUnits === 0 || r.events.some(e => e.kind === 'pps' && e.message.includes('works'))));
    assert.equal(new Set(r.rows.map(x => x.time)).size, r.rows.length);
    assert.equal(r.rows.at(-1).time + 1, time(r.endpoint.date));
    const offerTimes = r.events.filter(e => e.kind === 'settlement_offer').map(e => e.time);
    assert.equal(offerTimes.length, new Set(offerTimes).size);
    assert.equal(r.events.filter(e => e.kind === 'agreement_fulfilled' && e.message.includes('currency')).length, 1);
    assert.equal(r.projects.filter(p => p.kind === 'currency').length, 1);
    assert.ok(!r.events.some(e => e.date >= '1926-01' && e.kind === 'cabinet' && e.message.includes('→ Chjeno')));
    assert.ok(r.forces.every(f => f.legal >= 0 && f.pils >= 0 && f.legal + f.pils <= 1));
  }
  assert.ok(runs.slice(0, 2).every(r => !r.rows.some(x => x.ppsMode === 'member')));
  assert.ok(runs[2].rows.some(x => x.worksUnits === 2));
  assert.ok(!runs[3].rows.some(x => x.ppsMode === 'member'));
  assert.ok(counterfactuals[0].endpoint.kind === 'synthetic_coup_result' && runs[1].endpoint.kind === 'scheduled_election_boundary');
  assert.ok(counterfactuals[1].endpoint.kind === 'synthetic_coup_result' && runs[2].endpoint.kind === 'scheduled_election_boundary');
  assert.ok(counterfactuals[2].rows.some(x => x.ppsMode === 'member'));
  assert.ok(counterfactuals[4].rows.every(x => x.worksUnits === 0));
  near(counterfactuals[4].rows.find(x => x.date === '1926-05').unemployment - runs[2].rows.find(x => x.date === '1926-05').unemployment, .5, 'direct job-program benefit');
  const worksLaunch = runs[2].events.find(e => e.kind === 'pps' && e.message.includes('works'));
  const fiscalSensitivity = { date: worksLaunch.date, currentForecast: worksLaunch.forecast,
    snapshotWithOneLessB: worksLaunch.forecast - 1, launchFloor: -2,
    note: 'One decision snapshot only: not a replay with a changed base budget.' };
  const summary = runs.map(r => ({ id: r.config.id, label: r.config.label, firstZloty: r.firstZloty, endpoint: r.endpoint,
    checkpoints: ['1923-11', '1924-06', '1925-11', '1926-05', '1928-01'].map(d => r.rows.find(x => x.date === d)).filter(Boolean), blocked: r.blocked }));
  fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({ inputManifest, hashes, summary, fiscalSensitivity,
    runs: runs.map(({ rows, ...r }) => r), counterfactuals: counterfactuals.map(({ rows, ...r }) => ({ ...r,
      may1926: rows.find(x => x.date === '1926-05'), finalMonth: rows.at(-1) })) }, null, 2) + '\n');
  const allRows = runs.flatMap(r => r.rows), keys = Object.keys(allRows[0]);
  fs.writeFileSync(path.join(__dirname, 'monthly.csv'), [keys.join(','), ...allRows.map(row => keys.map(k => row[k]).join(','))].join('\n') + '\n');
  for (const r of runs) {
    console.log(r.config.id, r.firstZloty, JSON.stringify(r.endpoint));
    console.log('MAY26', JSON.stringify(r.rows.find(x => x.date === '1926-05')));
    console.log('BLOCKED', JSON.stringify(r.blocked));
  }
  console.log('COUNTERFACTUALS', JSON.stringify(counterfactuals.map(r => ({ id: r.config.id, options: r.options, endpoint: r.endpoint, blocked: r.blocked }))));
}
module.exports = { replay, scenarios, roll };
if (require.main === module) main();
