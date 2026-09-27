#!/usr/bin/env node
'use strict';

// Integrated diagnostic replay of the documented economy, political offers and pressure.
// Exogenous institutions, strategies and actor profiles are explicit P inputs; not Dendry.
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
const {evaluate,offer}=require('./negotiations.cjs');
const broadPortfolios={labor:'pps',agriculture:'piast',economic:'npr',justice:'pschd',finance:'zln'};
const rightPortfolios={agriculture:'piast',justice:'pschd',finance:'zln'};
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
  // This separate diagnostic always uses the latest approved pressure/economy rules.
  const revision13 = true;
  const seats=options.seats; assert.equal(sum(Object.values(seats)),444);
  const ballots=[], refusals=[], obligations=[];
  let credibility=50;
  const factions={centrum:{strength:50,dissent:0},left:{strength:15,dissent:20},pils:{strength:35,dissent:5}};
  const cohesion=()=>100-sum(Object.values(factions).map(f=>f.strength*f.dissent))/100;
  const react=(id,delta)=>{factions[id].dissent=clip(factions[id].dissent+delta,0,99);};
  const drawLog=[];
  const random=key=>{const value=roll(key,seed);drawLog.push({key,value});return value;};
  const seed = options.seed ?? 'm02-four-runs-v1';
  const rows = [], events = [], projects = [], policies = [], institutional = [], seenCivil = new Set();
  const cells = newCells(), plans = partyPlan(cfg);
  if(cfg.welfare&&!options.noMinorityContacts){plans['1923-06']=['contact','jewish']; plans['1923-07']=['contact','otherMinority'];}
  if(cfg.coalition&&!options.noZlnContact)plans[cfg.id==='C'?'1925-04':'1924-09']=['contact','zln'];
  // Works follow actual access, not an assumed November appointment.
  delete plans['1925-11']; delete plans['1925-12'];
  if(cfg.militaryRequest)delete plans[cfg.militaryRequest];
  let E = { inflation: 4, wage: 100, output: 100, credit: 55, marketUnemployment: 3, unemployment: 3, agrarian: 45 };
  const P = { cash: 2, apparatus: 1, relations: { piast: 45, npr: 50, pschd: 30, zln: 5, pilsudski: 60, jewish:50, otherMinority:50 }, contacts:{}, cd: {}, spent: 0, activeActions: 0 };
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
  let economicOfferRound=0;
  const forces = [
    { id: 'capital_legal', f: 45, ready: .8, command: .8, legal: .9, pils: .05, phase: 0 },
    { id: 'capital_pils', f: 55, ready: .85, command: .85, legal: .05, pils: .9, phase: 0 },
    { id: 'near', f: 25, ready: .7, command: .7, legal: .35, pils: .45, phase: 1 },
    { id: 'remote', f: 35, ready: .7, command: .7, legal: .7, pils: .15, phase: 2 },
  ];
  const emit = (t, kind, message, data = {}) => events.push({ time: t, date: date(t), kind, message, ...data });
  const law = (t, id) => { if (!institutional.some(e => e.id === id)) institutional.push({ t, type: 'law', id }); };
  const civil = (t, id, applied) => {
    if (!seenCivil.has(id)) { seenCivil.add(id); applied.add(id); fulfil(t,id); emit(t, 'agreement_fulfilled', `Wykonane zobowiązanie: ${id}.`); }
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
    projects.push({ kind, cost, upkeep, duration, start: t, progress: 0, firstEffect: null, sponsor:source, authorization:`law-${kind}-${t}` });
    promise(t,kind,source==='pps',duration+2); law(t,kind);
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
    if (type === 'contact') { P.relations[target] += P.relations[target] >= 70 ? 2 : 4; P.contacts[target]=true; P.cd[key] = t + 3; }
    if (type === 'military_request') {
      if (options.noMilitaryCompromise) emit(t, 'counterfactual', 'Pominięto wniosek o kompromis wojskowy.');
      else if(ppsMode !== 'opposition'){militaryPending=true;} else emit(t,'blocked','Brak poparcia gabinetu lub wykonawcy kompromisu wojskowego.');
    }
    if (type === 'prepare_works') {
      if (ppsMode === 'member') worksPrepared = true;
      else emit(t, 'blocked', 'Brak udziału w gabinecie: przygotowanie nie daje uprawnienia do wykonania robót.');
    }
    if (type === 'launch_works') {
      if(ppsMode==='member'&&worksPrepared&&!options.noWorks){
        const v=programmeVote(t,0,true,'works');
        if(v.passed)startProject(t,'works',2,1,3,'pps',npc);
      }
      
    }
    emit(t, 'pps_action', `${type}${target ? ': ' + target : ''}`, { cashAfterChoice: P.cash });
  }
  const compliance = u => clip(.35 + .004 * 50 + .003 * cohesion() - .003 * u.dissent, 0, 1);
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
      emit(t, 'political_offer_refused', 'Żądanie dymisji zgłoszone, lecz premier i większość go nie przyjmują. Następna runda PPS wraca do ograniczonej oferty płacowej.', { threshold, cause:'employers_cannot_dismiss_cabinet', governmentSupport:governmentYes() });
      return false;
    }
    const chance = Math.min(...ids.map(id => clip(.5 + (.5 * strikePotential(id).credible + .3 * (id === 'rail' ? 90 : 60)
      + .2 * (100 - authority) - threshold) / 100, .05, .95)));
    const draw = random(`wage:initial-demand:round-${++economicOfferRound}`);
    const accepted = draw < chance;
    emit(t, 'settlement_offer', `Ograniczona ugoda: ${accepted ? 'przyjęta' : 'odrzucona'}.`, { chance, draw, ids });
    if (!accepted) return false;
    wageAgreements.push({ start: t + 1, end: t + 3, pp: 2 * sum(ids.map(id => id === 'industry' ? .6 : .2)) });
    lastWageSettlement = { due: t + 1, ids, fulfilled: false };
    promise(t,'wage',cfg.organized); 
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
      const draw = random(`coup:unit-${f.id}`);
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

  let status='active', formedAt=1, cabinetSupport=444, defectors=0;
  let creditStage='none', creditDue=null, creditClosed=false, currencyPrepared=false;
  let landPrepared=false, taxEnacted=false, benefitOfferDone=false, stabilizationRefused=false;
  let formationSignature=null, lastBroker=-99, publicWarningUsed=false, chjenoUsed=false;
  let militaryRequested=false, worksAttempted=false, broadRequestDone=false, broadReview=false, withdrawDue=null, successorDue=null;
  let businessWarning=null,businessActive=false,businessQuietMonths=0;
  const signature=()=>`${cabinet}/${status}/${budgetAt(currentT,benefit?0:2).budget>=-2}/${P.relations.zln}/${defectors}/${benefit}/${cfg.coalition}`;
  let currentT=1;
  const governmentYes=()=>cabinetSupport;
  const promise=(t,id,pps=false,months=4)=>{
    if(!obligations.some(o=>o.id===id))obligations.push({id,pps,due:t+months,status:'active',breachRecorded:false});
  };
  const fulfil=(t,id)=>{
    const key=id.startsWith('wage-')?'wage':id;
    const o=obligations.find(o=>o.id===key);
    if(o&&o.status!=='fulfilled'){o.status='fulfilled';o.fulfilledAt=date(t);if(o.pps)credibility=clip(credibility+3,0,100);}
  };
  function assess(t,label,a){
    const result=evaluate(a);
    if(!result.accepted){const entry={date:date(t),label,actor:a.actor,score:result.score,causes:result.failures.length?result.failures:['score_below_60']};refusals.push(entry);}
    return result;
  }
  const politicalCrisisBonus=t=>Math.min(20,5*events.filter(e=>e.kind==='resigned'&&e.time>t-6).length
    +.5*Math.max(0,average(cells,'grievance')-60)+10*(rows.length>=2&&rows.slice(-2).every(r=>r.inflation>=20)));
  function programmeVote(t,fiscal,ppsYes,kind){
    const details=['piast','npr','pschd','zln','wyzwolenie','jewish','otherMinority'].map(actor=>{
      const minority=['jewish','otherMinority'].includes(actor);
      const a=offer(actor,50,{fiscal},{gates:{legal:true,
        minorityTerms:!minority || (P.contacts[actor]===true&&fiscal>=0),
        earmarkedFunding:!kind.startsWith('credit')||!['piast','npr','wyzwolenie'].includes(actor)||fiscal===2}});
      return {...assess(t,kind,a),seats:seats[actor]};
    });
    const yes=sum(details.filter(r=>r.accepted).map(r=>r.seats))+(ppsYes?seats.pps:0);
    const vote={date:date(t),kind,fiscal,ppsYes,yes,no:444-yes,passed:yes>222,details};ballots.push(vote);
    emit(t,'vote',kind,{yes,no:444-yes,passed:vote.passed});return vote;
  }
  const delivered=kind=>projects.some(p=>p.kind===kind&&p.firstEffect&&p.firstEffect<=currentT);
  function offers(t,{retention=false,broker=false,returning=true,expert=false}={}){
    const returnEval=evaluate(offer('piast',60,{fiscal:-1,land:0},{gates:{landDelivered:delivered('land'),newGuarantee:returning}}));
    const piastYes=seats.piast-defectors+(returnEval.accepted?defectors:0);
    const potentialRight=piastYes+seats.pschd+seats.zln;
    const majorityRight=potentialRight>222;
    // After withdrawal PPS does not silently rejoin as a bargaining alternative.
    // Retention without PPS has its own separately scored mandate below.
    const broadPotential=!retention&&cfg.coalition&&budgetAt(t,benefit?0:2).budget>=-2;
    const rightAlt=actor=>({...offer(actor,60,{fiscal:-1,land:0}),hardFeasible:majorityRight});
    const broadParties=['piast','npr','pschd','zln'].map(actor=>{
      const a=offer(actor,retention?50:P.relations[actor],{fiscal:0},{credibility:retention?50:credibility,
        advisorBonus:broker?5:0,crisisCooperation:retention?0:politicalCrisisBonus(t),
        alternatives:['zln','pschd'].includes(actor)&&majorityRight?[rightAlt(actor)]:[],
        gates:{fundedMinimum:broadPotential,creditCrisis:t>=time('1925-06')&&(t<time('1926-07')||retention),
          willingPps:cfg.coalition||retention,ownPortfolio:Object.values(broadPortfolios).includes(actor),
          nprGuarantees:actor!=='npr'||(broadPortfolios.economic==='npr'&&broadPotential&&unions.industry.dissent<60)}});
      return assess(t,retention?'retention':'broad_formation',a);
    });
    const candidate=assess(t,'skrzynski_mandate',offer('skrzynski',50,{fiscal:0},{gates:{fundedMinimum:broadPotential,ppsJoins:cfg.coalition||retention}}));
    const yesBroad=seats.pps+seats.piast-defectors+seats.npr+seats.pschd+seats.zln;
    const rights=['pschd','zln'].map(actor=>assess(t,'witos_formation',offer(actor,60,{fiscal:-1,land:0},{alternatives:broadPotential?[{...offer(actor,P.relations[actor],{fiscal:0},{credibility}),hardFeasible:true}]:[],gates:{ownPortfolio:Object.values(rightPortfolios).includes(actor)}})));
    const broad={id:'Skrzyński',portfolios:broadPortfolios,minimum:{fullWelfare:true,independentUnions:true},parties:broadParties,candidate,yes:yesBroad,
      accepted:broadPotential&&candidate.accepted&&broadParties.every(r=>r.accepted)&&yesBroad>222,
      rank:sum(broadParties.map(r=>r.score))/4+(t>=time('1925-11')&&t<=time('1926-05')?8:0)};
    const right={id:'Chjeno-Piast',portfolios:rightPortfolios,parties:rights,returnEval,yes:potentialRight,
      accepted:majorityRight&&rights.every(r=>r.accepted),rank:sum(rights.map(r=>r.score))/2+(t===time('1926-05')?8:0)};
    if(!majorityRight)refusals.push({date:date(t),label:'witos_formation',actor:'majority',score:null,causes:[`only_${potentialRight}_votes`]});
    const list=[broad,right];
    if(expert){
      const voters=['piast','npr','pschd','zln'].map(actor=>assess(t,'expert_formation',offer(actor,50,{fiscal:0})));
      const yes=sum(voters.filter(r=>r.accepted).map(r=>seats[r.actor]-(r.actor==='piast'?defectors:0)))+(cfg.id!=='A'?seats.pps:0);
      const g=assess(t,'grabski_mandate',offer('grabski',50,{fiscal:0}));
      list.push({id:'Grabski',parties:voters,candidate:g,yes,accepted:g.accepted&&yes>222,rank:sum(voters.map(r=>r.score))/4+8});
    }
    return list;
  }
  function appointProposal(t,p,cause){
    assert.ok(p.accepted&&p.yes>222);
    const previousCabinet=cabinet;
    const priorChjeno=events.some(e=>e.kind==='cabinet'&&e.proposal?.id==='Chjeno-Piast');
    const mode=p.id==='Skrzyński'?'member':p.id==='Grabski'&&cfg.id!=='A'?'external_support':'opposition';
    appoint(t,p.id,cause,mode,{proposal:p});status='active';cabinetSupport=p.yes;formedAt=t;formationSignature=null;
    broadReview=false;
    if(cabinet==='Skrzyński'){
      benefitPromised=true;promise(t,'benefit',true);react('left',3);
    }
    if(cabinet==='Chjeno-Piast'&&priorChjeno&&['Grabski','Skrzyński'].includes(previousCabinet)&&militaryOpen&&!militaryResolved&&!chjenoUsed){
      chjenoUsed=true;pressure=clip(pressure+20,0,100);
      emit(t,'chjeno_impulse','Powrót po gabinecie stabilizacyjnym lub szerokim przy otwartym konflikcie wojskowym; +20 raz.',{previousCabinet,priorChjeno,militaryOpen});
    }
    if(cabinet==='Chjeno-Piast'&&benefit&&benefitCost===2)rightOfferAt=t+1;
  }
  function warning(t){
    if(publicWarningUsed||!militaryOpen||militaryResolved||options.noPublicWarning)return;
    // Explicit shared actor profile: one officer-backed public intervention in
    // an ACTUAL post-credit cabinet crisis. No November/date-only event.
    publicWarningUsed=true;pressure=clip(pressure+8,0,100);
    emit(t,'military_public_warning','Publiczne żądanie dotyczące otwartej sprawy, poparte interwencją oficerską podczas formowania; +8 raz.',{caseId:'army-organization',sourceStatus:'P_actor_profile'});
  }
  function formation(t,{expert=false}={}){
    const sig=signature();if(sig===formationSignature)return;formationSignature=sig;
    const broker=cfg.coalition&&!options.noBroker&&t>=lastBroker+6&&t>=time('1925-06');
    if(broker){lastBroker=t;emit(t,'advisor','Daszyński: jedna oferta koalicyjna +5, 0 R, 0 T, odnowienie 6 M.');}
    if(t>=time('1925-06'))warning(t);
    const proposals=offers(t,{expert,broker,returning:!expert});
    const eligible=proposals.filter(p=>p.accepted).sort((a,b)=>b.rank-a.rank||b.yes-a.yes||a.id.localeCompare(b.id));
    emit(t,'formation','Ocena ofert po rzeczywistym wakacie.',{proposals,chosen:eligible[0]?.id??null});
    if(eligible.length)appointProposal(t,eligible[0],'Przyjęte warunki, większość ochronna i akt prezydenta.');
    else {institutional.push({t,type:'failure',id:`formation-${t}`});emit(t,'caretaker','Brak przyjętego następcy; brak darmowej ponownej próby bez zmiany warunków.');}
  }
  function resign(t,cause,expert=false){
    emit(t,'resigned',cause,{cabinet});status='caretaker';ppsMode='opposition';formationSignature=null;
    formation(t,{expert});
  }
  function militaryConsent(t,label){
    // Existing synthetic programme profile, not historical quantified consent.
    const a={actor:'pilsudski',relation:P.relations.pilsudski,programme:{army:0,institution:0},credibility,
      demands:[{weight:3,met:true}],alternatives:[],gates:{relation:P.relations.pilsudski>=40,authorizedExecutor:status==='active',specifiedPost:true}};
    return assess(t,label,a);
  }
  function reviewMilitary(t){
    const v=militaryConsent(t,'military_review');
    if(v.accepted){militaryReview=t+6;emit(t,'military_review','Wykonywana ugoda przedłużona po ocenie; brak nowej ulgi.',{evaluation:v});}
    else {militaryReview=null;emit(t,'military_expiry','Brak przedłużenia; bez fikcyjnego naruszenia i bez wznawiania zakończonej sprawy.');}
  }
  const coupAllowed=t=>pressure>=65&&sum(forces.map(f=>f.f*f.ready*f.command*f.pils))*.8>=30&&t>=time('1926-03')&&!militaryReview;
  function updateBusiness(t){
    if(business>=40&&businessWarning===null)businessWarning=t;
    if(business>=60&&businessWarning!==null&&t>businessWarning)businessActive=true;
    if(business<40){businessQuietMonths++;if(businessQuietMonths>=2)businessActive=false;if(!businessActive)businessWarning=null;}else businessQuietMonths=0;
  }
  function creditOffer(t,npc,revised){
    npc.count++;
    const forecast=budgetAt(t,2,revised?2:0).budget;
    const v=programmeVote(t,revised?2:0,cfg.id!=='A','credit_'+(revised?'revised':'initial'));
    const accepted=v.passed&&forecast>=-2;
    emit(t,'credit_offer',revised?'Jedyna poprawka z podatkiem majątkowym.':'Bieżące finansowanie kredytu.',{revised,forecast,accepted,cause:forecast< -2?'unfunded':!v.passed?'votes':'accepted'});
    if(accepted){
      if(revised){policies.push({id:'credit_wealth_tax',start:t,end:t+6,b:2});business+=8;law(t,'credit-tax');}
      // The programme vote already used this month's initiative.
      startProject(t,'credit',2,1,2,'approved',npc);creditStage='accepted';creditClosed=true;
    }else if(!revised){creditStage='revision_due';creditDue=t+1;}
    else {creditClosed=true;creditStage='refused';if(cabinet==='Grabski')resign(t,'Dwie odmowy koniecznego pakietu kredytowego.');}
  }

  for (let t = 1; t <= time('1928-02'); t++) {
    currentT=t;
    if(coupAllowed(t)){endpoint=resolveCoup(t);break;}
    if (t === time('1928-02')) {
      endpoint = { kind: 'scheduled_election_boundary', date: '1928-02-19', pressure, note: 'Boundary before the next ordinary turn; electoral preferences/results not forecast.' }; break;
    }
    const npc = { count: 0 }, newCivil = new Set();
    let localRepression = false, rejectedDemand = false, adminCut = false, successfulSettlement = false;
    const currencyCrisis = rows.length >= 2 && rows.slice(-2).every(r => r.inflation >= 20);
    const fiscalCrisis = rows.length >= 2 && rows.slice(-2).every(r => r.budget < -2);
    if (currencyCrisis && !rows.at(-1)?.currencyCrisis) emit(t, 'crisis', 'Dwa zakończone miesiące inflacji ≥20%: bramka kryzysu walutowego.');
    if (fiscalCrisis && !rows.at(-1)?.fiscalCrisis) emit(t, 'crisis', 'Dwa zakończone miesiące budżetu <−2 B: bramka kryzysu finansowego.');
    if(militaryReview===t)reviewMilitary(t);
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
    // Shared opening event profile; later cabinets are conditional on votes.
    if(t===time('1922-06')){
      cabinet='Ponikowski (obowiązki)';status='caretaker';ppsMode='opposition';
      institutional.push({t,type:'failure',id:'sliwinski'});
      emit(t,'opening_input','Nieprzyjęty kompromis Ponikowskiego i próba Śliwińskiego; wspólne wejście przed wyborami.');
    }
    if(t===time('1922-07')){appoint(t,'Nowak','Wspólna przyjęta oferta kompromisowa przed wyborami.');status='active';}
    if(t===time('1922-11'))emit(t,'parliament_input','Zadany wariant wyniku wyborów; nie symulacja preferencji wyborców.',{seats});
    if(t===time('1922-12')){
      appoint(t,'Sikorski','Wspólna gałąź po kryzysie prezydenckim, legalny wykonawca.','external_support');status='active';formedAt=t;
      emit(t,'opening_input','Narutowicz, następstwo Rataja i prezydent z prawem powołania — kontrolowany wspólny profil.');
      violence=clip(violence+10,0,100);
      if(cfg.organized){spend(1);democracy=clip(democracy+2,0,100);emit(t,'pps_event','Mobilizacja republikańska za 1 R.');}
    }
    if(t===time('1923-05')){
      const p=offers(t).find(p=>p.id==='Chjeno-Piast');
      emit(t,'replacement_offer','Piast i prawica proponują własny gabinet.',{proposal:p});
      if(p.accepted){emit(t,'dismissal_vote','Skuteczne odwołanie Sikorskiego.',{yes:p.yes,no:444-p.yes});appointProposal(t,p,'Skuteczne żądanie ustąpienia i legalne powołanie.');}
      else emit(t,'cabinet_survives','Sikorski pozostaje: brak większości dla następcy.',{votes:p.yes});
    }
    if(t===time('1923-12')&&cabinet==='Chjeno-Piast'){
      defectors=10;
      const yes=seats.piast-defectors+seats.pschd+seats.zln;
      cabinetSupport=yes;
      emit(t,'support_change','Jawny wspólny profil P: dziesięciu posłów Piasta wycofuje poparcie.',{remaining:yes});
      if(yes<=222){emit(t,'dismissal_vote','Wniosek o ustąpienie uzyskuje większość.',{yes:444-yes,no:yes});resign(t,'Utrata większości w rzeczywistym głosowaniu.',true);}
      else emit(t,'cabinet_survives','Dziesięciu odchodzących posłów nie wystarcza do odwołania gabinetu.',{votes:yes});
    }
    if(t===time(options.armyStart??'1925-01')){militaryOpen=true;emit(t,'army_case_open','Konkretny nierozwiązany spór o organizację naczelnych władz wojskowych.',{sourceStatus:'P_shared_case_onset'});}
    const s=shocks(t,zloty);
    const creditCrisis=t>=time('1925-06')&&t<time('1926-07');
    if(t===time('1925-06'))emit(t,'crisis','Zewnętrzny kryzys kredytu i produkcji, zgodnie z manifestem.');
    for(const pol of policies.filter(p=>p.end===t))emit(t,'funding_expired','Wygasło konkretne źródło finansowania.',{id:pol.id,deltaB:-pol.b});

    // An actual main action, at most one per month. Plans are contingent on access.
    let action=plans[date(t)];
    if(!action&&cfg.militaryRequest&&!militaryRequested&&t>=time(cfg.militaryRequest)&&ppsMode!=='opposition'&&status==='active'){
      militaryRequested=true;action=['military_request'];
    }
    if(!action&&cfg.id==='C'&&ppsMode==='member'&&!options.noWorks){
      if(!worksPrepared)action=['prepare_works'];
      else if(!worksAttempted){action=['launch_works'];worksAttempted=true;}
    }
    if(withdrawDue===t){
      assert.ok(!action,'withdrawal must use a free planned main-action slot');
      withdrawDue=null;ppsMode='opposition';benefitPromised=false;successorDue=t+1;
      P.activeActions++;emit(t,'pps_withdrawal','PPS wybiera odejście w kolejnej akcji po odmowie kompromisu; gabinet nadal urzęduje.',{costT:1});
    }else if(!action&&cfg.coalition&&!broadRequestDone&&t>=time('1925-11')&&creditCrisis&&cabinet!=='Skrzyński'&&status==='active'){
      broadRequestDone=true;P.activeActions++;
      const incumbent=assess(t,'incumbent_reconstruction',offer(cabinet==='Sikorski'?'sikorski':cabinet==='Chjeno-Piast'?'witos':'grabski',50,{fiscal:0},{credibility,gates:{incumbentAcceptsNonpartyReconstruction:['Grabski','Sikorski'].includes(cabinet),realCreditCrisis:creditCrisis}}));
      emit(t,'reconstruction_request','PPS proponuje przebudowę gabinetu, zużywa 1 T.',{incumbent});
      if(incumbent.accepted){
        const broker=!options.noBroker&&t>=lastBroker+6;
        if(broker){lastBroker=t;emit(t,'advisor','Daszyński: przygotowanie jednej oferty +5.');}
        const p=offers(t,{broker}).find(p=>p.id==='Skrzyński');
        emit(t,'reconstruction_offer','Jedna oceniona oferta szerokiego gabinetu.',{proposal:p});
        if(p.accepted){warning(t);emit(t,'resigned','Urzędujący premier przyjmuje uzgodnioną przebudowę.',{cabinet});appointProposal(t,p,'Zaakceptowana przebudowa po zgodzie urzędującego premiera.');}
      }
    }else partyAction(t,action,npc);

    if(successorDue===t){
      successorDue=null;
      const proposals=offers(t,{retention:true});const right=proposals.find(p=>p.id==='Chjeno-Piast');
      if(right.accepted){emit(t,'dismissal_vote','Partnerzy popierają odwołanie i nazwaną ofertę Witosa.',{yes:right.yes,no:444-right.yes});appointProposal(t,right,'Legalna zmiana po odejściu PPS.');}
      else {
        const voters=['piast','npr','pschd','zln'].map(actor=>assess(t,'retention_without_pps',offer(actor,50,{fiscal:0},{gates:{funding:budgetAt(t).budget>=-2}})));
        const yes=sum(voters.filter(r=>r.accepted).map(r=>seats[r.actor]-(r.actor==='piast'?defectors:0)));
        if(yes>222){cabinetSupport=yes;emit(t,'retained_without_pps','Skrzyński przyjmuje kontynuację legalnych obowiązków bez PPS.',{yes,no:444-yes,voters});}
        else resign(t,'Brak zaakceptowanej większości ani przyjętego minimum.');
      }
    }
    if(status==='caretaker'&&t>=time('1923-01'))formation(t);

    if(cabinet==='Skrzyński'&&!broadReview&&t>=formedAt+5){
      broadReview=true;
      if(creditCrisis&&benefit&&benefitCost===2){
        npc.count++;
        const partners=offers(t,{retention:false}).find(p=>p.id==='Skrzyński');
        const funded=budgetAt(t).budget>=-2;
        const accepted=partners.accepted&&funded;
        emit(t,'welfare_review','Przegląd pełnej osłony: prawica żąda 2→1 B; PPS proponuje utrzymanie.',{accepted,funded,proposal:partners});
        if(accepted)emit(t,'welfare_compromise','Utrzymanie 2 B przyjęte po ocenie; bez kolejnej premii.');
        else {withdrawDue=t+1;emit(t,'welfare_refusal','Kompromis odrzucony; plan PPS przewiduje odejście w następnej akcji.',{causes:funded?['partner_score_or_hard_condition']:['funding']});}
      }else emit(t,'review_closed','Brak pełnej osłony albo aktywnego kryzysu; nie tworzymy fikcyjnych cięć.');
    }

    // A finite government agenda, with one initiative. Legal programmes survive succession.
    if(npc.count===0&&status==='active'){
      if(rightOfferAt!==null&&t>=rightOfferAt&&cabinet==='Chjeno-Piast'){
        rightOfferAt=null;npc.count++;
        const v=programmeVote(t,-1,false,'benefit_cut');
        if(v.passed){benefitCost=1;law(t,'benefit-cut');emit(t,'benefit_cut','Nowy gabinet osobno uchwala cięcie 2→1 B.');}
      }else if(benefitPromised&&!benefit&&cabinet==='Skrzyński'){
        npc.count++;const v=programmeVote(t,0,true,'benefit_broad');
        if(v.passed&&budgetAt(t,2).budget>=-2){benefit=true;law(t,'benefit');emit(t,'benefit_authorized','Przyjęte minimum, koszt 2 B, bez fikcyjnego podatku.');}
        else {emit(t,'blocked','Przyjęta obietnica osłon nie ma wykonania: głosy/budżet.');benefitPromised=false;}
      }else if(cfg.welfare&&ppsMode==='external_support'&&t>=time('1923-12')&&!benefitOfferDone){
        benefitOfferDone=true;npc.count++;
        const candidate=assess(t,'expert_welfare',offer(cabinet==='Sikorski'?'sikorski':'grabski',50,{fiscal:2},{credibility,
          alternatives:[{...offer(cabinet==='Sikorski'?'sikorski':'grabski',50,{fiscal:0}),hardFeasible:true}],crisisCooperation:politicalCrisisBonus(t),
          gates:{apparatus:P.apparatus>=2,unionReach:unions.industry.reach>=40,funding:budgetAt(t,2,3).budget>=-2}}));
        const v=candidate.accepted?programmeVote(t,2,true,'protected_welfare'):null;
        emit(t,'welfare_offer','Osłony PPS: oddzielna zgoda premiera i głosowanie podatkowe.',{candidate,vote:v});
        if(candidate.accepted&&v.passed){benefit=true;law(t,'benefit');benefitPromised=true;promise(t,'benefit',true);taxLevel++;taxEnacted=true;business+=12;policies.push({id:'wealth_tax',start:t,end:t+6,b:2});}
      }else if(cabinet==='Sikorski'&&t===formedAt){
        policies.push({id:'protection',start:t,end:t+1,b:-1});npc.count++;emit(t,'cabinet','Ochrona instytucji przez MSW za 1 B.');
      }else if(cabinet==='Sikorski'&&t===formedAt+1){
        npc.count++;emit(t,'executor_refusal','Opcjonalne porozumienie pracownicze bez zgody wykonawcy — brak efektu.');
      }else if(creditCrisis&&!projects.some(p=>p.kind==='credit')&&!creditClosed){
        if(creditStage==='none'){npc.count++;creditStage='prepared';creditDue=t+1;emit(t,'credit_prepared','Przygotowanie instrumentu; bez skutku gospodarczego.');}
        else if(t>=creditDue)creditOffer(t,npc,creditStage==='revision_due');
      }else if(militaryPending&&militaryOpen&&!options.noMilitaryCompromise){
        militaryPending=false;npc.count++;
        const executor=assess(t,'military_executor',offer(cabinet==='Skrzyński'?'skrzynski':cabinet==='Sikorski'?'sikorski':cabinet==='Chjeno-Piast'?'witos':'grabski',50,{fiscal:0},{gates:{cabinetActive:status==='active',ppsLink:ppsMode!=='opposition',civilControl:true}}));
        const v=militaryConsent(t,'military_agreement');
        if(v.accepted&&executor.accepted){
          militaryOpen=false;militaryResolved=true;pressure=clip(pressure-12,0,100);militaryReview=t+6;P.relations.pilsudski+=4;
          const f=forces.find(f=>f.id==='near');f.legal*=(1-f.pils-.05)/(1-f.pils);f.pils+=.05;
          react('pils',-5);emit(t,'military_compromise','Przyjęta i wykonana funkcja pod cywilną kontrolą: −12 raz.',{evaluation:v,executor,nearLoyaltyDelta:.05});
        }
      }else if(cabinet==='Chjeno-Piast'&&!landPrepared&&!projects.some(p=>p.kind==='land')){
        landPrepared=true;npc.count++;emit(t,'land_prepared','Przygotowanie transzy parcelacji z odszkodowaniem.');
      }else if(cabinet==='Chjeno-Piast'&&landPrepared&&!projects.some(p=>p.kind==='land')){
        npc.count++;const v=programmeVote(t,0,false,'land');if(v.passed)startProject(t,'land',2,0,4,'approved',npc);if(projects.some(p=>p.kind==='land'))business+=8;
      }else if(!taxEnacted&&((cabinet==='Chjeno-Piast')||budgetAt(t).budget< -2)){
        npc.count++;const v=programmeVote(t,0,cfg.id!=='A','broad_tax');
        if(v.passed){taxEnacted=true;taxLevel++;business+=4;law(t,'broad-tax');for(const c of cells.filter(c=>['petty','intelligentsia'].includes(c.kind)))c.grievance=clip(c.grievance+3,0,100);}
      }else if(currencyCrisis&&!preparedCurrency&&!projects.some(p=>p.kind==='currency')){
        preparedCurrency=true;npc.count++;emit(t,'currency_prepared','Przygotowanie stabilizacji po rzeczywistym kryzysie walutowym.');
      }else if(preparedCurrency&&!projects.some(p=>p.kind==='currency')&&!stabilizationRefused){
        npc.count++;const v=programmeVote(t,0,cfg.id!=='A','currency');
        if(v.passed&&budgetAt(t,2,1).budget>=-2){policies.push({id:'administration_cut',start:t,end:t+6,b:1});adminCut=true;startProject(t,'currency',2,0,3,'approved',npc);}
        else {stabilizationRefused=true;emit(t,'blocked','Stabilizacja odmówiona; brak automatycznych efektów.');}
      }
    }
    assert.ok(npc.count<=1,`${cfg.id} ${date(t)}: government initiative limit`);
    if(status==='caretaker')institutional.push({t,type:'gap',id:`gap-${t}`});
    for(const o of obligations){
      if(o.status==='active'&&t>o.due){o.status='breached';if(o.pps){credibility=clip(credibility-5,0,100);react('left',12);}emit(t,'obligation_breach','Minął termin rzeczywiście podpisanego obowiązku.',{id:o.id});}
    }
    if(coupAllowed(t)){endpoint=resolveCoup(t);break;}

    const recent = institutional.filter(e => e.t > t - 12);
    const authority = clip(55 + 4 * recent.filter(e => e.type === 'law').length + 4 * recent.filter(e => e.type === 'resolution').length
      - 6 * recent.filter(e => e.type === 'failure').length -3*recent.filter(e=>e.type==='gap').length -5*obligations.filter(o=>o.status==='breached').length, 0, 100);
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
        const draw = random(`clash:initial-demand:round-${settlementRounds.size}`);
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
    updateBusiness(t);
    const old = copy(E);
    E = economyStep(old, { monetary: s.monetary, creditShock: s.credit + (currencyProject && t < currencyProject.start + 3 ? 10 : 0),
      outputShock: s.output, agrarianShock: s.agrarian, capitalReaction:businessActive?1:0, creditSupport: active('credit') ? 5 * coverage : 0,
      worksUnits: active('works') ? 2 * coverage : 0, landUnits: projects.filter(p => p.kind === 'land' && p.firstEffect === t).length,
      strikeDisruption: disruption, wageAgreementPP: sum(wageAgreements.filter(w => w.start <= t && t < w.end).map(w => w.pp)),
    }, { slowWageRecovery: true, recoveryPoints: 3 });
    if (localRepression) for (const c of cells.filter(c => c.employment === 'employed')) {
      c.grievance = clip(c.grievance + 3 * .8, 0, 100); c.radicalization = clip(c.radicalization + 2 * .8, 0, 100);
    }
    if (successfulSettlement) for (const c of cells.filter(c => c.employment === 'employed')) c.radicalization = clip(c.radicalization - 2 * .8, 0, 100);
    const firstRelief = benefit && !benefitPaid && coverage > 0;
    if(firstRelief)benefitPaid=true;
    if(benefit&&coverage===1)civil(t,'benefit',newCivil);
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
    // Monthly accrual uses the current political ledger; event impulses already applied.
    const nationalG = average(cells, 'grievance');
    pressure = clip(pressure + 3*(status==='caretaker') + 2 * (authority < 40) + 2 * (nationalG >= 60) + 2 * militaryOpen - 2 * (newCivil.size > 0), 0, 100);
    democracy = clip(democracy + .03 * (authority - 50) - .02 * Math.max(0, nationalG - 50), 0, 100);
    if (!localRepression) violence = Math.max(0, violence - 2);
    rows.push({ run: cfg.id, date: date(t), time: t, cabinet, ppsMode, ...E, budget: fiscal.budget, coverage,
      projectCharges: fiscal.charges, policyBudget: fiscal.policyB, taxLevel, businessPressure: business,
      workerGrievance: social.employedWorkers, unemployedGrievance: social.unemployed, workerRadicalization: social.workerRadicalization,
      uncontrolledUpperBound, nationalGrievance: nationalG, authority, democracy, violence, pressure,
      militaryOpen, status, credibility, cohesion:cohesion(), cash: P.cash, apparatus: P.apparatus, industryReach: unions.industry.reach, industryReadiness: unions.industry.readiness,
      railReach: unions.rail.reach, railReadiness: unions.rail.readiness, railFund: unions.rail.fund, partySpending: P.spent,
      ppsActiveActions: P.activeActions, governmentInitiatives: npc.count, strikeDisruption: disruption,
      benefit, benefitCost:benefit?benefitCost:0, worksUnits: active('works') ? 2 * coverage : 0, agreementTension, currencyCrisis, fiscalCrisis,
    });
    if(coupAllowed(t)){endpoint=resolveCoup(t);break;}
    if (t === time('1926-05')) emit(t, 'historical_checkpoint', 'Maj nie powołuje nowego rządu ani nie uruchamia próby samą datą.', { pressure, cabinet });
  }
  assert.ok(endpoint);
  return { config: cfg, options, firstZloty, firstCredit, endpoint, finalEconomy: E, finalParty: P, finalUnions: unions,
    projects, events, rows, forces, ballots, obligations, credibility, factions, drawLog, refusals, blocked: events.filter(e => e.kind === 'blocked') };
}

module.exports={replay,scenarios,roll};
