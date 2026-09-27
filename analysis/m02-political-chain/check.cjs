#!/usr/bin/env node
'use strict';
// Political succession from an explicit crisis snapshot. Not a macroeconomic
// campaign, historical prediction, Dendry implementation, or new game engine.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const dir = __dirname;
const root = path.resolve(dir, '../..');
const clip = (x, a, b) => Math.max(a, Math.min(b, x));
const sum = xs => xs.reduce((a, b) => a + b, 0);
const date = t => `${Math.floor(t / 12)}-${String(t % 12 + 1).padStart(2, '0')}`;
const month = s => { const [y, m] = s.split('-').map(Number); return y * 12 + m - 1; };
const profiles = {
  piast: { fiscal: 0, land: 0 }, npr: { fiscal: 0, land: 0 },
  pschd: { fiscal: -1, land: -1 }, zln: { fiscal: -1, land: -1 },
  wyzwolenie: { fiscal: 2, land: 1 }, jewish: { fiscal: 0, land: 0 }, otherMinority: { fiscal: 0, land: 1 },
  grabski: { fiscal: 1 }, grabski_neutral_fiscal: { fiscal: 0 }, skrzynski: { fiscal: 0 },
};
function base(a) {
  assert.ok(profiles[a.actor] && a.demands && Object.keys(a.programme).length);
  const topics = Object.keys(a.programme);
  assert.ok(topics.every(k => Number.isFinite(profiles[a.actor][k])));
  const programFit = 100 * (1 - sum(topics.map(k => Math.abs(profiles[a.actor][k] - a.programme[k]))) / (4 * topics.length));
  const total = sum(a.demands.map(d => d.weight));
  const portfolioFit = total ? 100 * sum(a.demands.filter(d => d.met).map(d => d.weight)) / total : 100;
  return { programFit, portfolioFit,
    value: .25 * a.relation + .35 * programFit + .2 * portfolioFit + .1 * a.credibility - Math.min(30, 5 * (a.breaches ?? 0)) };
}
function evaluate(a) {
  const b = base(a);
  const best = Math.max(0, ...a.alternatives.filter(x => x.hardFeasible).map(x => 100 * clip(base(x).value, 0, 90) / 90));
  const need = a.mode === 'persuade' ? 0 : clip(100 - best + (a.crisisCooperation ?? 0), 0, 100);
  const score = clip(b.value + .1 * need + (a.advisorBonus ?? 0), 0, 100);
  const failures = Object.keys(a.gates).filter(k => !a.gates[k]);
  return { actor: a.actor, score, programFit: b.programFit, portfolioFit: b.portfolioFit, best, need,
    failures, accepted: !failures.length && score >= 60 };
}
const offer = (actor, relation, programme, extra = {}) => ({ actor, relation, programme, credibility: 50,
  demands: [{ weight: 1, met: true }], alternatives: [], gates: {}, ...extra });
// Regression against every saved step-1 score, without executing/writing its archive.
const step1 = JSON.parse(fs.readFileSync(path.join(root, 'analysis/m02-negotiations/results.json')));
for (const old of step1.reports) {
  const r = evaluate(old.input);
  assert.ok(Math.abs(r.score - old.result.score) < 1e-9, old.id);
  assert.equal(r.accepted, old.result.accepted, old.id);
}
const seat = { pps: 41, piast: 70, npr: 18, pschd: 60, zln: 100, wyzwolenie: 49,
  jewish: 45, otherMinority: 45, other: 14, kpp: 2 };
assert.equal(sum(Object.values(seat)), 444);
const forces = [[45,.8,.8,.05], [55,.85,.85,.9], [25,.7,.7,.45], [35,.7,.7,.15]];
const capacity = sum(forces.map(([f,r,c,p]) => f*r*c*p)) * .8;
const canAttempt = x => x.pressure >= 65 && x.capacity >= 30 && x.operationalWindow &&
  !x.credibleStandDownAgreement && !x.attemptAlreadyActive && x.time >= x.nextAttemptAvailableAt;
const ready = {pressure:65,capacity:30,operationalWindow:true,credibleStandDownAgreement:false,
  attemptAlreadyActive:false,time:100,nextAttemptAvailableAt:100};
assert.ok(canAttempt(ready));
for(const change of [{pressure:64},{capacity:29},{operationalWindow:false},{credibleStandDownAgreement:true},
  {attemptAlreadyActive:true},{nextAttemptAvailableAt:101}])assert.ok(!canAttempt({...ready,...change}));
const common = { start: '1925-06', end: '1927-06', budgetBeforeCredit: -1,
  initialPressure: 20, landDelivered: true, pps: 'join', zlnRelation: 29,
  broker: true, minorityTaxAgreement: false, welfareReply: 'bargain',
  executor: true, legal: true, creditPrepared: true, existingMilitaryAgreement: false };
const configs = [
  { id: 'first_accepted', budgetBeforeCredit: 1, pps: 'support', broker: false },
  { id: 'revision_accepted', minorityTaxAgreement: true, pps: 'support', broker: false },
  { id: 'double_refusal_compromise' },
  { id: 'prepare_then_two_offers', creditPrepared: false },
  { id: 'double_refusal_withdrawal', welfareReply: 'withdraw' },
  { id: 'failed_bargain_no_auto_exit', zlnRelation: 25 },
  { id: 'accept_cuts', welfareReply: 'accept_cuts' },
  { id: 'withdraw_no_successor', landDelivered: false, welfareReply: 'withdraw' },
  { id: 'pps_refuses_membership', pps: 'opposition', broker: false },
  { id: 'formation_fails', pps: 'opposition', broker: false, landDelivered: false },
  { id: 'impasse_resolved', pps: 'opposition', broker: false, landDelivered: false, deliverLandAt: '1925-10' },
  { id: 'no_executor', executor: false },
  { id: 'political_refusal_twice', budgetBeforeCredit: 1, earmarkedFundingRequired: true },
  { id: 'late_crisis_response', start: '1925-11', welfareReply: 'withdraw' },
  { id: 'crisis_ends_before_revision', start: '1926-06' },
  { id: 'military_agreement', welfareReply: 'withdraw', existingMilitaryAgreement: true },
].map(c => ({ ...common, ...c }));

function run(cfg) {
  const s = { cabinet: 'grabski', status: 'active', ppsMode: 'external_support',
    benefit: 2, pressure: cfg.initialPressure, landDelivered: cfg.landDelivered,
    creditStage: 'initial', creditStarted: null, taxStarted: null,
    formationAt: null, broadReviewed: false, alternativeDue: null,
    brokerAvailable: cfg.broker, advisorAvailableAt: month(cfg.start),
    caseClosed: false, chjenoImpulseUsed: false, lastFormationSignature: null, creditPrepared: cfg.creditPrepared };
  const events = [], rows = [], political = [];
  let initiatives = 0, newCivil = false;
  const emit = (t, kind, data = {}) => events.push({ date: date(t), kind, ...data });
  const mark = (t, kind, id) => { if (!political.some(x => x.id === id)) political.push({ t, kind, id }); };
  const live = (t, kind) => political.filter(e => e.kind === kind && e.t > t - 12 && e.t <= t).length;
  const crisisBonus = t => Math.min(20, 5 * events.filter(e => e.kind === 'resigned' && month(e.date) > t - 6).length);
  const cash = t => cfg.budgetBeforeCredit + (s.benefit === 1 ? 1 : 0)
    + (s.taxStarted !== null && t < s.taxStarted + 6 ? 2 : 0)
    - (s.creditStarted === null ? 0 : t < s.creditStarted + 2 ? 2 : 1);
  const rightInputs = actor => offer(actor, 60, { fiscal: -1, land: 0 });
  const broadInputs = (actor, bonus = 0) => offer(actor,
    { piast: 53, npr: 54, pschd: 46, zln: cfg.zlnRelation }[actor], { fiscal: 0 }, { advisorBonus: bonus });
  function rightPotential() {
    // Ten MPs stay separately identified. A NEW land guarantee must be signed;
    // an old party label cannot erase their recorded dissent.
    const returning = evaluate(offer('piast', 60, { fiscal: -1, land: 0 },
      { gates: { landDelivered: s.landDelivered, compensatedLand: true, noSmallFarmTax: true } }));
    return { yes: 60 + (returning.accepted ? 10 : 0) + seat.pschd + seat.zln, returning };
  }
  function cabinetOffers(t, { retention = false, bonus = 0 } = {}) {
    const right = rightPotential();
    const rightPossible = right.yes > 444 - right.yes;
    const broadPossible = (cfg.pps === 'join' || retention) && cash(t) >= -2;
    const parties = ['piast','npr','pschd','zln'].map(actor => {
      const a = broadInputs(actor, bonus);
      if (rightPossible && ['pschd','zln'].includes(actor)) a.alternatives = [{ ...rightInputs(actor), hardFeasible: true }];
      a.crisisCooperation = retention ? 0 : crisisBonus(t);
      if(retention && cfg.welfareReply==='persuade')a.mode='persuade';
      a.gates = { ppsMember: broadPossible, legal: cfg.legal, nprEconomicAndLabourGuarantees: true,
        fundedMinimum: cash(t) >= -2, crisis: t < month('1926-07') || retention,
        compromiseRelations: !retention || (cfg.zlnRelation >= 25) };
      return evaluate(a);
    });
    const candidate = evaluate(offer('skrzynski', 50, { fiscal: 0 }, { gates: {
      ppsJoins: broadPossible, minimum: cash(t) >= -2, legal: cfg.legal } }));
    const rights = ['pschd','zln'].map(actor => evaluate({ ...rightInputs(actor),
      alternatives: broadPossible ? [{ ...broadInputs(actor), hardFeasible: true }] : [],
      gates: { legal: cfg.legal, landProgramme: true } }));
    const broadAccepted = candidate.accepted && parties.every(p => p.accepted);
    const rightAccepted = rightPossible && rights.every(p => p.accepted);
    const historyBonus = t >= month('1925-11') && t <= month('1926-05') ? 8 : 0;
    return { broad: { id: 'skrzynski', accepted: broadAccepted, candidate, parties,
      yes: 41+60+18+60+100, rank: sum(parties.map(p => p.score))/4+historyBonus },
    right: { id: 'witos', accepted: rightAccepted, parties: rights, returning: right.returning,
      yes: right.yes, rank: sum(rights.map(p => p.score))/2 + (t === month('1926-05') ? 8 : 0) } };
  }
  function appoint(t, proposal, cause) {
    assert.ok(proposal.accepted && proposal.yes > 444 - proposal.yes);
    const from = s.cabinet;
    s.cabinet = proposal.id; s.status = 'active'; s.ppsMode = proposal.id === 'skrzynski' ? 'member' : 'opposition';
    s.formationAt = t; s.broadReviewed = false;
    if (proposal.id === 'witos' && s.benefit === 2) s.rightCutAt = t+1;
    mark(t, 'resolved', `appointment-${t}-${proposal.id}`);
    emit(t, 'appointed', { from, to: proposal.id, cause, proposal,
      legalAct: 'available president appoints accepted majority candidate; no mandatory investiture',
      inheritedBenefit: s.benefit, inheritedCredit: s.creditStarted, inheritedTax: s.taxStarted });
    if (proposal.id === 'witos' && t >= month('1926-05') && !s.chjenoImpulseUsed) {
      s.pressure = clip(s.pressure + 20, 0, 100); s.chjenoImpulseUsed = true;
      emit(t, 'chjeno_impulse', { amount: 20, cause: 'actual qualifying appointment' });
    }
  }
  function formation(t) {
    const signature = `${s.cabinet}/${s.landDelivered}/${cfg.pps}/${cfg.zlnRelation}/${cash(t) >= -2}`;
    if (s.lastFormationSignature === signature) return;
    s.lastFormationSignature = signature;
    const bonus = s.brokerAvailable && t >= s.advisorAvailableAt && cfg.pps === 'join' ? 5 : 0;
    if (bonus) { s.brokerAvailable = false; s.advisorAvailableAt = t+6;
      emit(t, 'pps_advisor', { action: 'broker_coalition', bonus, costR: 0, cooldownUntil: date(t+6) }); }
    const offers = cabinetOffers(t, { bonus });
    const eligible = Object.values(offers).filter(o => o.accepted).sort((a,b) => b.rank-a.rank || b.yes-a.yes || a.id.localeCompare(b.id));
    emit(t, 'formation', { cause: 'actual vacancy or changed material support', offers, chosen: eligible[0]?.id ?? null });
    if (eligible.length) appoint(t, eligible[0], 'resignation and accepted ranked offer');
    else { mark(t, 'failure', `formation-${t}`); emit(t, 'caretaker', { noFreeRetry: true }); }
  }
  function programmeVote(t, fiscal, ppsYes = cfg.pps !== 'opposition', creditCase = false) {
    const voters = ['piast','npr','pschd','zln','wyzwolenie','jewish','otherMinority'];
    const details = voters.map(actor => {
      const minority = ['jewish','otherMinority'].includes(actor);
      const a = offer(actor, 50, { fiscal }, {
        gates: { legal: cfg.legal, explicitMinorityTerms: !minority || cfg.minorityTaxAgreement,
          earmarkedFunding: !creditCase || !cfg.earmarkedFundingRequired || fiscal === 2 || !['piast','npr','wyzwolenie'].includes(actor) } });
      // No active rival proposal before a vacancy in this snapshot. Refusal does
      // not mean a fictitious accepted expert continuation is available.
      return { ...evaluate(a), seats: seat[actor] };
    });
    const yes = sum(details.filter(d => d.accepted).map(d => d.seats)) + (ppsYes ? 41 : 0);
    return { yes, no: 444-yes, passed: yes > 444-yes, ppsYes, details,
      votingRule: 'all MPs present; no agreement = no vote; no inferred abstentions' };
  }
  function creditOffer(t, revised) {
    assert.equal(initiatives, 0); initiatives++;
    const forecast = cash(t) - 2 + (revised ? 2 : 0);
    const vote = programmeVote(t, revised ? 2 : 0, cfg.pps !== 'opposition', true);
    const executable = cfg.executor && cfg.legal && forecast >= -2;
    const accepted = executable && vote.passed;
    emit(t, revised ? 'credit_revision' : 'credit_initial', { forecast, vote, executable, accepted,
      executor: 'authorized public credit instrument; Treasury funds it, no private loan assumed',
      cause: forecast < -2 ? 'unfunded_programme' : !cfg.executor ? 'executor_refusal' : !vote.passed ? 'political_refusal' : 'accepted' });
    if (accepted) {
      s.creditStarted = t; if (revised) s.taxStarted = t;
      s.creditStage = 'accepted'; s.caseClosed = true;
      if (revised) { mark(t, 'law', 'credit-wealth-tax'); emit(t, 'wealth_tax', { revenue: 2, expires: date(t+6), businessPressure: 8 }); }
      emit(t, 'grabski_stays', { reason: 'essential package accepted', programmeId: 'credit-1925' });
    } else if (!revised) { s.creditStage = 'revision_due'; s.reviewAt = t+1; }
    else resign(t, 'both essential offers failed');
  }
  function resign(t, reason) {
    s.creditStage = 'resigned'; s.caseClosed = true; s.status = 'caretaker'; s.ppsMode = 'opposition';
    emit(t, 'resigned', { cabinet: 'grabski', reason });
    formation(t); // Appointment is institutional; no second programme initiative.
  }
  let endReason = 'observation_limit';
  for (let t = month(cfg.start); t <= month(cfg.end); t++) {
    initiatives = 0; newCivil = false;
    if (cfg.deliverLandAt === date(t)) { s.landDelivered = true; mark(t,'law','land-guarantee-delivered'); newCivil = true;
      emit(t,'land_delivered',{ cause: 'previously authorized project reaches its scheduled completion, not a reset of ten MPs' }); }
    if (s.creditStarted !== null && t === s.creditStarted+2) {
      newCivil = true; mark(t,'law','credit-delivered'); emit(t,'credit_delivered',{ support: 5, upkeep: 1 });
    }
    if (s.taxStarted !== null && t === s.taxStarted+6) emit(t,'tax_expired',{ effectB: -2, budget: cash(t) });
    if (s.creditStage === 'revision_due' && t >= month('1926-07')) {
      s.creditStage='closed';s.caseClosed=true;
      emit(t,'credit_case_closed',{reason:'controlled crisis has resolved; no outstanding legal duty requiring this new programme'});
    }
    if (s.creditStage === 'initial') {
      if(!s.creditPrepared){initiatives++;s.creditPrepared=true;emit(t,'credit_prepared',{nextOfferAt:date(t+1),noCreditEffect:true});}
      else creditOffer(t, false);
    }
    else if (s.creditStage === 'revision_due' && t === s.reviewAt) {
      if (!cfg.executor || !cfg.legal) {
        // Tax cannot fix a missing executor or legal authority.
        emit(t,'no_valid_revision',{ reason: 'tax cannot remove executor or legal veto' }); resign(t,'no valid amendment');
      } else creditOffer(t, true);
    }
    if (s.status === 'caretaker') formation(t);
    if (s.cabinet === 'skrzynski' && s.status === 'active' && !s.broadReviewed && t === s.formationAt+5) {
      s.broadReviewed = true;
      if (t < month('1926-07') && s.benefit === 2) {
        assert.equal(initiatives,0); initiatives++;
        const offers = cabinetOffers(t, { retention: true });
        emit(t,'welfare_review',{ cause: 'agreed sixth-month review during credit crisis', pps: cfg.welfareReply, offers });
        if (['bargain','persuade'].includes(cfg.welfareReply) && offers.broad.accepted) emit(t,'compromise_kept',{ benefit: 2, noNewAward: true });
        else if (cfg.welfareReply === 'accept_cuts') {
          // A specific lawful cut vote, not an automatic effect of opening B19.
          const vote = programmeVote(t, -1, true);
          if (vote.passed) { s.benefit=1; mark(t,'law','benefit-cut'); emit(t,'benefit_cut',{ vote, benefit: 1 }); }
        } else if(cfg.welfareReply==='withdraw') {
          s.ppsMode='opposition'; s.alternativeDue=t+1;
          emit(t,'pps_withdrawal',{ cabinetStillActive: true, benefit: s.benefit,
            next: 'other parties assess concrete retention and replacement programmes' });
        } else {s.pendingResponse=true;emit(t,'dispute_pending',{reason:'no accepted compromise; PPS has not chosen withdrawal; next actual action or partner proposal required'});}
      } else emit(t,'review_closed',{ reason: 'credit crisis ended or no full benefit; no invented cuts' });
    }
    if (s.alternativeDue === t) {
      s.alternativeDue=null;
      const offers=cabinetOffers(t);
      if (offers.right.accepted) {
        const yes=offers.right.yes;
        emit(t,'replacement_vote',{ yes, no:444-yes, passed:yes>444-yes, cause:'right and Piast accept named Witos offer' });
        appoint(t,offers.right,'successful dismissal vote and legal appointment');
      } else {
        // Available continuation: same named premier, no PPS ministers, existing
        // benefits at 2B; its terms are rated independently, not inherited votes.
        const ret=['piast','npr','pschd','zln'].map(actor => evaluate(offer(actor,50,{fiscal:0},
          {gates:{budget:cash(t)>=-2,legal:cfg.legal}})));
        const yes=sum(ret.filter(r=>r.accepted).map(r=>r.actor==='piast'?60:seat[r.actor]));
        const candidate=evaluate(offer('skrzynski',50,{fiscal:0},{gates:{legal:cfg.legal,budget:cash(t)>=-2}}));
        if(yes>444-yes && candidate.accepted) emit(t,'retained_without_pps',{yes,no:444-yes,parties:ret,candidate,benefit:s.benefit,
          candidateMandate:'Skrzynski accepts one continuation of existing lawful obligations after PPS departure'});
        else { s.status='caretaker'; emit(t,'resigned',{cabinet:'skrzynski',reason:'neither minimum nor continuation accepted'}); formation(t); }
      }
    }
    if(s.rightCutAt===t && s.cabinet==='witos' && s.status==='active') {
      assert.equal(initiatives,0); initiatives++;
      const vote=programmeVote(t,-1,false);
      if(vote.passed){s.benefit=1;mark(t,'law','benefit-cut');}
      emit(t,'right_cut_vote',{vote,benefit:s.benefit,cause:'new government changes inherited law, not a reset on appointment'});
      s.rightCutAt=null;
    }
    if (s.status==='caretaker') mark(t,'gap',`gap-${t}`);
    const authority=clip(55+4*live(t,'law')+4*live(t,'resolved')-6*live(t,'failure')-3*live(t,'gap'),0,100);
    const delta=3*(s.status!=='active')+2*(authority<40)+2*(!cfg.existingMilitaryAgreement)-2*newCivil;
    s.pressure=clip(s.pressure+delta,0,100);
    const operationalWindow=t>=month('1926-03');
    const attemptAllowed=canAttempt({pressure:s.pressure,capacity,operationalWindow,
      credibleStandDownAgreement:cfg.existingMilitaryAgreement,attemptAlreadyActive:false,
      time:t,nextAttemptAvailableAt:month(cfg.start)});
    rows.push({date:date(t),cabinet:s.cabinet,status:s.status,ppsMode:s.ppsMode,benefit:s.benefit,budget:cash(t),
      authority,pressure:s.pressure,delta,capacity,operationalWindow,attemptAllowed,initiatives});
    assert.ok(initiatives<=1);
    if(attemptAllowed){emit(t,'coup_attempt',{pressure:s.pressure,capacity,next:'existing F sequence; no result calculated here'});endReason='coup_attempt';break;}
    if(s.pendingResponse){endReason='pending_response';break;}
  }
  return {config:cfg,events,rows,endReason,final:rows.at(-1)};
}
const runs=configs.map(run);
const get=id=>runs.find(r=>r.config.id===id);
assert.ok(!get('first_accepted').events.some(e=>e.kind==='resigned'));
assert.ok(!get('revision_accepted').events.some(e=>e.kind==='resigned'));
for(const id of ['double_refusal_compromise','double_refusal_withdrawal']) {
  const r=get(id); assert.equal(r.events.filter(e=>e.kind==='credit_initial').length,1);
  assert.equal(r.events.filter(e=>e.kind==='credit_revision').length,1);
  assert.equal(r.events.find(e=>e.kind==='resigned').date,'1925-07');
  assert.equal(r.events.find(e=>e.kind==='appointed').to,'skrzynski');
}
assert.ok(get('double_refusal_compromise').events.some(e=>e.kind==='compromise_kept'));
assert.equal(get('prepare_then_two_offers').events.find(e=>e.kind==='resigned').date,'1925-08');
assert.ok(get('double_refusal_withdrawal').events.some(e=>e.kind==='replacement_vote'));
assert.ok(get('failed_bargain_no_auto_exit').events.some(e=>e.kind==='dispute_pending'));
assert.ok(!get('failed_bargain_no_auto_exit').events.some(e=>e.kind==='pps_withdrawal'));
assert.ok(get('withdraw_no_successor').events.some(e=>e.kind==='retained_without_pps'));
assert.ok(!get('no_executor').events.some(e=>e.kind==='credit_revision'));
assert.equal(get('formation_fails').events.filter(e=>e.kind==='formation').length,1);
assert.ok(get('impasse_resolved').events.some(e=>e.kind==='appointed' && e.date==='1925-10'));
assert.ok(get('political_refusal_twice').events.filter(e=>['credit_initial','credit_revision'].includes(e.kind)).every(e=>!e.vote.passed));
assert.ok(!get('military_agreement').events.some(e=>e.kind==='coup_attempt'));
assert.ok(get('crisis_ends_before_revision').events.some(e=>e.kind==='credit_case_closed'));
assert.ok(!get('crisis_ends_before_revision').events.some(e=>e.kind==='resigned'));
assert.equal(get('double_refusal_withdrawal').events.filter(e=>e.kind==='chjeno_impulse').length,0);
assert.equal(get('late_crisis_response').events.filter(e=>e.kind==='chjeno_impulse').length,1);
for(const r of runs){
  assert.ok(r.events.filter(e=>e.kind==='chjeno_impulse').length<=1);
  assert.ok(r.events.filter(e=>e.kind==='wealth_tax').length<=1);
  assert.ok(r.rows.every(x=>x.budget>=-2),'controlled fiscal snapshots must remain solvent');
  assert.ok(r.rows.filter(x=>x.status==='caretaker').every(x=>x.benefit===2));
  // Save/replay determinism; old cases cannot be reopened just by another render.
  assert.deepEqual(run(r.config),r);
}
const sources=['docs/POLISH_TECHNICAL_REFERENCE.md','docs/POLISH_DESCRIPTIVE_GUIDE.md','analysis/m02-negotiations/results.json'];
const hashes=Object.fromEntries(sources.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({hashes,scope:'political-chain diagnostic with controlled macro inputs',runs},null,2)+'\n');
const lines=['# Przebiegi ciągu politycznego M02','',
  'Wygenerowane przez `check.cjs`; założenia i granice: [REPORT.md](REPORT.md).',''];
for(const r of runs){lines.push(`## ${r.config.id}`,'','| Miesiąc | Przejście | Wynik |','|---|---|---|');
  for(const e of r.events)lines.push(`| ${e.date} | ${e.kind} | ${e.to??e.chosen??e.reason??e.cause??''}${e.vote?' — '+e.vote.yes+':'+e.vote.no:''}${e.yes?' — '+e.yes+':'+e.no:''} |`);
  lines.push('',`Koniec obserwacji: ${r.final.date}, ${r.final.cabinet}, presja ${r.final.pressure}, ${r.endReason}.`,'');}
fs.writeFileSync(path.join(dir,'TRACES.md'),lines.join('\n')+'\n');
console.log(`PASS: ${step1.reports.length} previous scores unchanged; ${runs.length} political chains; budgets, unique effects, monthly limit and deterministic replay.`);
for(const r of runs)console.log(r.config.id, r.events.filter(e=>['appointed','resigned','compromise_kept','retained_without_pps','coup_attempt'].includes(e.kind)).map(e=>`${e.date}:${e.kind}:${e.to??''}`).join(' | '));
