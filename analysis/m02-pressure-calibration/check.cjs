#!/usr/bin/env node
'use strict';
// Pressure ledger diagnostics. Cabinet/economy inputs are frozen explicitly;
// this does not claim to rerun the full political/economic game.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root=path.resolve(__dirname,'../..');
const clip=x=>Math.max(0,Math.min(100,x));
const month=s=>{const[y,m]=s.split('-').map(Number);return 12*y+m-1;};
const date=t=>`${Math.floor(t/12)}-${String(t%12+1).padStart(2,'0')}`;
const csv=fs.readFileSync(path.join(root,'analysis/m02-revision-13/monthly.csv'),'utf8').trim().split('\n');
const keys=csv.shift().split(',');
const archivedRows=csv.map(l=>Object.fromEntries(l.split(',').map((v,i)=>[keys[i],v==='true'?true:v==='false'?false:Number.isNaN(Number(v))?v:Number(v)])));
const archive=JSON.parse(fs.readFileSync(path.join(root,'analysis/m02-revision-13/results.json')));
const forces=[[45,.8,.8,.05],[55,.85,.85,.9],[25,.7,.7,.45],[35,.7,.7,.15]];
const capacity=(available=4)=>forces.slice(0,available).reduce((s,[f,r,c,p])=>s+f*r*c*p,0)*.8;
const may=month('1926-05');
const warningAllowed=({open,agreement,crisisFormation,officerBacking,publicMilitaryDemand})=>
  open&&!agreement&&crisisFormation&&officerBacking&&publicMilitaryDemand;
const gate=(p,t,cap,standDown=false,active=false,next=0)=>p>=65&&cap>=30&&t>=month('1926-03')&&!standDown&&!active&&t>=next;

// Reproduce the old arithmetic before adding any missing event or changing a number.
for(const r of archive.runs){
 let p=10;
 for(const row of archivedRows.filter(x=>x.run===r.config.id)){
  const ev=r.events.filter(e=>e.date===row.date);
  for(const e of ev){if(e.kind==='chjeno_impulse')p=clip(p+20);if(e.kind==='military_compromise')p=clip(p-12);}
  p=clip(p+2*(row.authority<40)+2*(row.nationalGrievance>=60)+2*row.militaryOpen-2*ev.some(e=>e.kind==='agreement_fulfilled'));
  assert.equal(p,row.pressure,`${row.run}/${row.date}`);
 }
}
const H=archive.runs.find(r=>r.config.id==='H');
const Hrows=archivedRows.filter(r=>r.run==='H');
const civil=H.events.filter(e=>e.kind==='agreement_fulfilled').map(e=>({id:e.message,at:month(e.date)}));
const defaults={id:'full_2',rate:2,fillGap:true,publicWarning:true,eventCheck:true,initial:10,
  militaryStart:'1925-01',warningAt:'1925-11',rightAt:'1926-05',availableForces:4,
  agreementAt:null,renew:true,breachAt:null,extraCivil:null,officerBacking:true,publicMilitaryDemand:true};
function run(input){
 const c={...defaults,...input};
 let p=c.initial,open=false,agreement=null,attempt=null;
 const seen=new Set(),rows=[],events=[];
 const once=(t,id,amount,kind)=>{if(seen.has(id))return false;seen.add(id);p=clip(p+amount);events.push({date:date(t),kind,id,amount,pressure:p});return true;};
 const maybe=(t,phase)=>{if(!attempt&&gate(p,t,capacity(c.availableForces),!!agreement))attempt={date:date(t),phase,pressure:p,capacity:capacity(c.availableForces)};};
 for(let t=month('1922-01');t<=month('1928-01');t++){
  if(!c.eventCheck)maybe(t,'next_month_start');
  if(attempt)break;
  const d=date(t),old=Hrows.find(r=>r.date===d)??Hrows.at(-1);
  const start=p;
  // Pending army dispute is an inherited test input, not a historical dating claim.
  if(c.militaryStart&&d===c.militaryStart)open=true;
  if(agreement&&t===agreement.reviewAt){
   if(c.renew){agreement.reviewAt=t+6;events.push({date:d,kind:'agreement_review',amount:0});}
   else {agreement=null;events.push({date:d,kind:'agreement_expired',amount:0});}
  }
  if(c.agreementAt===d&&open){
   once(t,'military-settlement',-12,'agreement_delivered');open=false;agreement={reviewAt:t+6};
  }
  // A real breach of an operating promise is different from failure to renew it.
  if(c.breachAt===d&&agreement){
   agreement=null;open=true;once(t,'military-clause-breach',8,'agreement_breach');
  }
  const crisisFormation=H.events.some(e=>e.date===d&&e.kind==='cabinet'&&e.otherActorsConsentIsFixture);
  if(c.publicWarning&&d===c.warningAt&&warningAllowed({open,agreement,crisisFormation,
    officerBacking:c.officerBacking,publicMilitaryDemand:c.publicMilitaryDemand})){
   once(t,'army-public-ultimatum',8,'public_ultimatum');
   // Same event arriving twice must have no second effect.
   once(t,'army-public-ultimatum',8,'public_ultimatum');
  }
  if(c.rightAt===d&&t>=may)once(t,'actual-right-return',20,'right_appointment');
  if(c.eventCheck)maybe(t,'after_event_batch');
  if(attempt){rows.push({date:d,start,end:p,settled:false,open,standDown:!!agreement});break;}
  const gap=c.fillGap&&d==='1922-06'; // Explicit archived caretaker; no full-month penalty for a brief later vacancy.
  const due=civil.filter(e=>e.at===t&&!seen.has(`civil:${e.id}`));
  if(c.extraCivil===d)due.push({id:'additional-executed-duty',at:t});
  due.forEach(e=>seen.add(`civil:${e.id}`));
  const terms={gap:3*gap,authority:2*(old.authority<40),grievance:2*(old.nationalGrievance>=60),
    military:c.rate*open,civil:due.length?-2:0};
  // No late historical-row reuse for macro triggers: tail is an explicit frozen
  // sensitivity background (authority >=40, national grievance <60).
  const key=`month:${t}`;assert.ok(!seen.has(key));seen.add(key);
  p=clip(p+Object.values(terms).reduce((a,b)=>a+b,0));
  rows.push({date:d,start,end:p,settled:true,terms,open,standDown:!!agreement});
  if(c.eventCheck)maybe(t,'after_month_settlement');
  if(attempt)break;
 }
 return {config:c,attempt,may:rows.find(r=>r.date==='1926-05')??null,rows,events,
   endpoint:attempt?.date??'1928-02-19 election boundary (no result simulated)'};
}
const configs=[
 {id:'legacy',fillGap:false,publicWarning:false,eventCheck:false},
 {id:'timing_only',fillGap:false,publicWarning:false},
 {id:'gap_only',publicWarning:false},
 {id:'full_2'},
 {id:'full_2_5',rate:2.5},
 {id:'full_3',rate:3},
 {id:'no_public_warning',publicWarning:false},
 {id:'no_right_return',rightAt:null},
 {id:'late_right_return',rightAt:'1926-08'},
 {id:'early_agreement',agreementAt:'1925-08'},
 {id:'late_agreement',agreementAt:'1926-04'},
 {id:'breached_agreement',agreementAt:'1925-08',breachAt:'1926-10'},
 {id:'unrenewed_agreement',agreementAt:'1925-08',renew:false},
 {id:'no_military_dispute',militaryStart:null},
 {id:'one_more_civil_success',extraCivil:'1926-04'},
 {id:'lower_opening_pressure',initial:5},
 {id:'higher_opening_pressure',initial:15},
 {id:'insufficient_forces',availableForces:2},
 {id:'long_dispute_sensitivity',militaryStart:'1923-06'},
 {id:'no_correction_to_gap',fillGap:false},
].map(run);
const byId=id=>configs.find(r=>r.config.id===id);
assert.equal(byId('legacy').may.end,54);
assert.equal(byId('legacy').attempt.date,'1926-12');
assert.equal(byId('timing_only').attempt.date,'1926-11');
assert.equal(byId('full_2').may.end,65);
assert.equal(byId('full_2').attempt.date,'1926-05');
for(const id of ['early_agreement','late_agreement','unrenewed_agreement','no_military_dispute','insufficient_forces'])assert.equal(byId(id).attempt,null,id);
assert.ok(byId('no_public_warning').attempt.date>'1926-05');
assert.ok(byId('no_right_return').attempt.date>'1926-05');
assert.ok(byId('one_more_civil_success').attempt.date>'1926-05');
assert.ok(byId('breached_agreement').events.some(e=>e.kind==='agreement_breach'));
assert.equal(byId('early_agreement').events.filter(e=>e.kind==='public_ultimatum').length,0);
assert.equal(byId('full_2').events.filter(e=>e.kind==='public_ultimatum').length,1);
assert.ok(byId('long_dispute_sensitivity').attempt.date<'1926-05');
for(const r of configs)assert.deepEqual(run(r.config),r);
const warningInput={open:true,agreement:null,crisisFormation:true,officerBacking:true,publicMilitaryDemand:true};
assert.ok(warningAllowed(warningInput));
for(const key of ['open','crisisFormation','officerBacking','publicMilitaryDemand']){
 assert.ok(!warningAllowed({...warningInput,[key]:false}),key);
}
assert.ok(!warningAllowed({...warningInput,agreement:{reviewAt:may}}));
for(const key of ['officerBacking','publicMilitaryDemand']){
 const control=run({[key]:false});
 assert.equal(control.events.filter(e=>e.kind==='public_ultimatum').length,0);
 assert.equal(control.may.end,57);
} // Guard checks, not additional campaign variants.

// Audit of projected step-2 histories: no arbitrary starting-pressure correction.
const chains=JSON.parse(fs.readFileSync(path.join(root,'analysis/m02-political-chain/results.json')));
const chainChecks=chains.runs.filter(r=>['double_refusal_withdrawal','late_crisis_response','military_agreement'].includes(r.config.id)).map(r=>{
 let extra=0,warningApplied=false,attempt=null;
 const rows=[];
 for(const row of r.rows){
  if(!warningApplied&&!r.config.existingMilitaryAgreement&&r.events.some(e=>e.date===row.date&&e.kind==='formation')){extra=8;warningApplied=true;}
  const pressure=clip(row.pressure+extra);
  rows.push({date:row.date,pressure,extra});
  if(gate(pressure,month(row.date),row.capacity,r.config.existingMilitaryAgreement)){attempt={date:row.date,pressure};break;}
 }
 return {id:r.config.id,assumption:'same controlled step-2 crisis, supplied public-warning profile at actual formation; unchanged initial pressure',attempt,rows};
});
// Gates remain independent of this calibration, including valid stand-down,
// actual force availability, active attempt and three-month retry availability.
assert.ok(gate(65,may,30));
assert.ok(!gate(65,may,29));assert.ok(!gate(64,may,30));assert.ok(!gate(80,may,36,true));
assert.ok(!gate(80,may,36,false,true));assert.ok(!gate(80,may,36,false,false,may+1));
assert.ok(!gate(80,month('1926-02'),36));
const sources=['docs/POLISH_TECHNICAL_REFERENCE.md','docs/POLISH_DESCRIPTIVE_GUIDE.md',
 'analysis/m02-revision-13/monthly.csv','analysis/m02-revision-13/results.json','analysis/m02-political-chain/results.json'];
const hashes=Object.fromEntries(sources.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify({hashes,archiveRowsChecked:archivedRows.length,
 scope:'pressure-only calibration with frozen cabinet/economy traces; not a new full campaign',configs,chainChecks},null,2)+'\n');
const table=['# Sprawdzenie tempa presji','', 'Dane syntetyczne i ograniczenia: [REPORT.md](REPORT.md).','',
 '| Wariant | Presja w V 1926 (do przerwania) | Początek próby | Moment kontroli |', '|---|---:|---|---|',
 ...configs.map(r=>`| ${r.config.id} | ${r.may?.end??'—'} | ${r.attempt?.date??'brak do granicy wyborów'} | ${r.attempt?.phase??'—'} |`)];
fs.writeFileSync(path.join(__dirname,'RESULTS.md'),table.join('\n')+'\n');
console.log(`PASS: ${archivedRows.length} archived monthly pressures reproduced; ${configs.length} sensitivity runs and ${chainChecks.length} step-2 projections; one-shot effects, reproducibility and all coup gates.`);
console.log(table.slice(4).join('\n'));
console.log('Step-2 projections:',chainChecks.map(r=>[r.id,r.attempt]));
