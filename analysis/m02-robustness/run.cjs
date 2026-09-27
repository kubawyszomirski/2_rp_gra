#!/usr/bin/env node
'use strict';
// Controlled paired campaigns, not an implementation of the complete game.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {replay,scenarios,roll}=require('./engine.cjs');
const {evaluate}=require('./negotiations.cjs');
const root=path.resolve(__dirname,'../..');
const base={pps:41,piast:70,npr:18,pschd:60,zln:100,wyzwolenie:49,jewish:45,otherMinority:45,other:14,kpp:2};
const parliaments=Object.fromEntries([['base',0],['favorable',1],['harder',-1]].map(([id,d])=>[id,{...base,pps:41+8*d,wyzwolenie:49+4*d,zln:100-8*d,pschd:60-4*d}]));
const seeds=Array.from({length:12},(_,i)=>`m02-robustness-${String(i+1).padStart(2,'0')}`);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const archives=['m02-current-rules','m02-comparison','m02-four-runs','m02-revision-13','m02-negotiations','m02-political-chain','m02-pressure-calibration'];
const archiveHashes=Object.fromEntries(archives.flatMap(dir=>fs.readdirSync(path.join(root,'analysis',dir)).map(file=>{
 const name=`analysis/${dir}/${file}`;return[name,sha(fs.readFileSync(path.join(root,name)))];
})));
// Shared scorer must still reproduce all 59 archived, separately reviewed cases.
const scores=JSON.parse(fs.readFileSync(path.join(root,'analysis/m02-negotiations/results.json'))).reports;
for(const old of scores){const x=evaluate(old.input);assert.ok(Math.abs(x.score-old.result.score)<1e-9,old.id);assert.equal(x.accepted,old.result.accepted,old.id);}
const runs=[],counterfactuals=[],armySensitivity=[];
function verify(r){
 assert.ok(r.endpoint);
 assert.equal(new Set(r.rows.map(x=>x.time)).size,r.rows.length);
 for(let i=0;i<r.rows.length;i++){
  const x=r.rows[i];assert.ok(x.cash>=-1e-9&&x.railFund>=-1e-9);assert.ok(x.governmentInitiatives<=1);
  assert.ok(x.ppsActiveActions-(r.rows[i-1]?.ppsActiveActions??0)<=1);
  assert.ok(x.coverage===0||x.coverage===.5||x.coverage===1);
  for(const v of Object.values(x))if(typeof v==='number')assert.ok(Number.isFinite(v));
 }
 for(const b of r.ballots){assert.equal(b.yes+b.no,444);assert.equal(b.passed,b.yes>222);}
 for(const e of r.events.filter(e=>e.kind==='cabinet'&&e.proposal)){assert.ok(e.proposal.accepted&&e.proposal.yes>222);}
 const effects=r.events.filter(e=>e.kind==='agreement_fulfilled').map(e=>e.message);assert.equal(new Set(effects).size,effects.length);
 for(const k of ['military_compromise','military_public_warning','chjeno_impulse'])assert.ok(r.events.filter(e=>e.kind===k).length<=1,k);
 for(const e of r.events.filter(e=>e.kind==='chjeno_impulse')){
  assert.ok(['Grabski','Skrzyński'].includes(e.previousCabinet)&&e.priorChjeno&&e.militaryOpen);
  assert.ok(r.events.some(x=>x.kind==='cabinet'&&x.time===e.time&&x.proposal?.id==='Chjeno-Piast'));
 }
 for(const e of r.events.filter(e=>e.kind==='welfare_review'))assert.equal(e.accepted,e.proposal.accepted&&e.funded);
 for(const kind of ['currency','land','credit','works'])assert.ok(r.projects.filter(p=>p.kind===kind).length<=1,kind);
 for(const p of r.projects){assert.ok(p.authorization);if(p.firstEffect)assert.ok(p.progress===100&&p.firstEffect>p.start);}
 for(const p of r.projects.filter(p=>p.kind==='works'))assert.ok(r.events.some(e=>e.kind==='cabinet'&&e.time<=p.start&&e.ppsMode==='member'));
 for(const d of r.drawLog)assert.equal(d.value,roll(d.key,r.options.seed));
 assert.equal(new Set(r.drawLog.map(d=>d.key)).size,r.drawLog.length);
 assert.ok(Object.values(r.factions).every(f=>f.dissent<60),'Unimplemented faction exit may not be silently crossed');
 if(r.options.noMilitaryCompromise)assert.ok(!r.events.some(e=>e.kind==='military_compromise'));
 if(r.endpoint.kind==='synthetic_coup_result')assert.ok(r.endpoint.pressure>=65&&r.endpoint.capacity>=30&&r.endpoint.rounds>=3);
}
function execute(cfg,parliament,seed,extra={}){
 const r=replay(cfg,{seats:parliaments[parliament],seed,...extra});r.parliament=parliament;r.seed=seed;verify(r);return r;
}
for(const parliament of Object.keys(parliaments))for(const cfg of scenarios)for(const seed of seeds){
 const r=execute(cfg,parliament,seed);assert.deepEqual(execute(cfg,parliament,seed),r);runs.push(r);
}
const cfSpecs=[['B_no_military','B',{noMilitaryCompromise:true}],['C_no_military','C',{noMilitaryCompromise:true}],
 ['C_no_works','C',{noWorks:true}],['B_no_minority_contacts','B',{noMinorityContacts:true}],
 ['H_no_broker','H',{noBroker:true}],['H_no_zln_contact','H',{noZlnContact:true}]];
for(const [id,strategy,extra] of cfSpecs)for(const parliament of Object.keys(parliaments))for(const seed of seeds){
 const cfg=scenarios.find(c=>c.id===strategy),r=execute(cfg,parliament,seed,extra);r.counterfactual=id;counterfactuals.push(r);
}
for(const parliament of Object.keys(parliaments))for(const cfg of scenarios)for(const seed of seeds.slice(0,3))armySensitivity.push(execute(cfg,parliament,seed,{armyStart:'1923-06'}));
// Same event keys must yield the same value across every strategy and parliament;
// skipping or delaying an event cannot consume another branch's random number.
const draws=new Map();for(const r of [...runs,...counterfactuals,...armySensitivity])for(const d of r.drawLog){
 const key=`${r.seed}/${d.key}`;if(draws.has(key))assert.equal(draws.get(key),d.value);else draws.set(key,d.value);
}
const range=xs=>xs.length?[Math.min(...xs),Math.max(...xs)]:null;
const distribution=xs=>Object.fromEntries([...new Set(xs)].sort().map(k=>[k,xs.filter(x=>x===k).length]));
const summaries=[];
for(const parliament of Object.keys(parliaments))for(const cfg of scenarios){
 const rs=runs.filter(r=>r.parliament===parliament&&r.config.id===cfg.id);
 const may=rs.map(r=>r.rows.find(x=>x.date==='1926-05')).filter(Boolean);
 summaries.push({parliament,strategy:cfg.id,label:cfg.label,runs:rs.length,
  endpoints:distribution(rs.map(r=>r.endpoint.date)),outcomes:distribution(rs.map(r=>r.endpoint.outcome??'election_boundary')),
  firstZloty:distribution(rs.map(r=>r.firstZloty??'none')),welfarePaid:rs.filter(r=>r.events.some(e=>e.kind==='agreement_fulfilled'&&e.message.includes('benefit'))).length,
  worksOperating:rs.filter(r=>r.rows.some(x=>x.worksUnits>0)).length,
  armyAgreements:rs.filter(r=>r.events.some(e=>e.kind==='military_compromise')).length,
  may:{pressure:range(may.map(x=>x.pressure)),budget:range(may.map(x=>x.budget)),unemployment:range(may.map(x=>x.unemployment)),wage:range(may.map(x=>x.wage)),
    benefitCost:range(may.map(x=>x.benefitCost)),cabinet:distribution(may.map(x=>x.cabinet))},
  strikes:rs.filter(r=>r.events.some(e=>e.kind==='strike')).length,clashes:rs.filter(r=>r.events.some(e=>e.kind==='clash')).length});
}
const paired=counterfactuals.map(r=>{
 const b=runs.find(b=>b.parliament===r.parliament&&b.config.id===r.config.id&&b.seed===r.seed);
 const x=b.rows.find(x=>x.date==='1926-05'),y=r.rows.find(x=>x.date==='1926-05');
 return{id:r.counterfactual,parliament:r.parliament,seed:r.seed,baseEndpoint:b.endpoint.date,changedEndpoint:r.endpoint.date,
  baseCabinet:x?.cabinet,changedCabinet:y?.cabinet,unemploymentDelta:x&&y?y.unemployment-x.unemployment:null,
  basePressure:x?.pressure,changedPressure:y?.pressure,baseWorks:x?.worksUnits,changedWorks:y?.worksUnits};
});
const compact=r=>({...r,rows:undefined});
const files=['docs/POLISH_TECHNICAL_REFERENCE.md','docs/POLISH_DESCRIPTIVE_GUIDE.md','analysis/m02-robustness/engine.cjs','analysis/m02-robustness/negotiations.cjs','analysis/m02-robustness/run.cjs','analysis/m02-current-rules/calculate.cjs'];
const hashes=Object.fromEntries(files.map(f=>[f,sha(fs.readFileSync(path.join(root,f)))]));
fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify({scope:'paired monthly diagnostics with explicit actor/opening/card-access assumptions; not full Dendry gameplay',parliaments,seeds,hashes,
 counts:{main:runs.length,paired:counterfactuals.length,armySensitivity:armySensitivity.length},summaries,paired,
 runs:runs.map(compact),counterfactuals:counterfactuals.map(compact),armySensitivity:armySensitivity.map(compact)},(key,value)=>typeof value==='number'?Math.round(value*1e9)/1e9:value)+'\n');
const allRows=[...runs,...counterfactuals,...armySensitivity].flatMap(r=>r.rows.map(x=>({parliament:r.parliament,seed:r.seed,variant:r.counterfactual??(r.options.armyStart?'army_1923':'main'),...x})));
const keys=Object.keys(allRows[0]);fs.writeFileSync(path.join(__dirname,'monthly.csv'),[keys.join(','),...allRows.map(x=>keys.map(k=>typeof x[k]==='number'?Math.round(x[k]*1e9)/1e9:x[k]).join(','))].join('\n')+'\n');
const table=['# Wyniki sparowanych przebiegów','', 'Założenia i interpretacja: [REPORT.md](REPORT.md).','',
 '| Sejm | PPS | Koniec (liczba z 12) | Osłony wykonane | Roboty działające | Ugoda wojskowa | Presja V 1926 |',
 '|---|---|---|---:|---:|---:|---|',
 ...summaries.map(s=>`| ${s.parliament} | ${s.strategy} | ${Object.entries(s.endpoints).map(([k,n])=>`${k}: ${n}`).join('; ')} | ${s.welfarePaid} | ${s.worksOperating} | ${s.armyAgreements} | ${s.may.pressure?.join('–')??'kampania zakończona wcześniej'} |`)];
fs.writeFileSync(path.join(__dirname,'SUMMARY.md'),table.join('\n')+'\n');
const traceKinds=new Set(['crisis','cabinet','support_change','cabinet_survives','credit_offer','resigned','formation','reconstruction_offer','welfare_offer','welfare_review','welfare_refusal','pps_withdrawal','benefit_cut','retained_without_pps','military_compromise','military_public_warning','chjeno_impulse','project_effect','settlement_offer','strike','clash','coup','blocked','funding_expired']);
const trace=['# Przebiegi — wspólne ziarno 01','', 'Wszystkie ziarna i szczegółowe oceny w [results.json](results.json); [interpretacja](REPORT.md).',''];
for(const r of runs.filter(r=>r.seed===seeds[0])){
 trace.push(`## ${r.parliament} / ${r.config.id}`,'','| Data | Zdarzenie | Wynik / przyczyna |','|---|---|---|');
 for(const e of r.events.filter(e=>traceKinds.has(e.kind))){
  let detail=e.message;
  if(e.kind==='credit_offer')detail+=` prognoza ${e.forecast.toFixed(2)} B; ${e.accepted?'przyjęte':'odrzucone: '+e.cause}`;
  if(e.kind==='formation')detail+=` Wybrano: ${e.chosen??'brak'}.`;
  if(e.kind==='welfare_review')detail+=` ${e.accepted?'kompromis przyjęty':'odmowa'}`;
  if(e.kind==='welfare_offer')detail+=` premier ${e.candidate.score.toFixed(2)}; ${e.vote?`${e.vote.yes}:${e.vote.no}`:'bez głosowania'}`;
  trace.push(`| ${e.date} | ${e.kind} | ${detail.replaceAll('|','/')} |`);
 }
 trace.push('',`Koniec: ${r.endpoint.date}; ${r.endpoint.outcome??'granica następnych wyborów'}.`,'');
}
fs.writeFileSync(path.join(__dirname,'TRACES.md'),trace.join('\n')+'\n');
for(const [f,h] of Object.entries(archiveHashes))assert.equal(sha(fs.readFileSync(path.join(root,f))),h,`archive modified: ${f}`);
console.log(`PASS: ${runs.length} paired main campaigns (4 × 3 × 12), ${counterfactuals.length} decision controls, ${armySensitivity.length} army-onset controls; 59 prior offer scores, deterministic repeat, matching random keys, budgets/votes/one-shot/authority gates and unchanged archives.`);
console.log(table.slice(4).join('\n'));
