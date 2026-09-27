#!/usr/bin/env node
'use strict';
// M12 diagnostics for technical reference 14.4 and 17.4: the union's consent to a settlement reads
// the cost of continuing instead of rewarding a full fund, and government fragility in strike
// negotiations reads the cabinet's real support and disputes instead of Sejm authority.
// Documentation diagnostics only: not Dendry gameplay, not a campaign run.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const Module = require('node:module');

const root = path.resolve(__dirname, '../..');
const clip = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// Approved rule (P values of the approved structure).
const RULE = { consentThreshold: 50, weights: { fulfilment: 0.5, trust: 0.3, costOfContinuing: 0.2 },
  fragilityBase: 50, majority: 222, tensionWeight: 0.5 };

// 17.4: union consent. fundCoverage 0-1 (one month of the strike), fatigue 0-100.
const costOfContinuing = (fundCoverage, fatigue) => Math.max(100 * (1 - clip(fundCoverage, 0, 1)), fatigue);
function consent({ fulfilment, trust, fundCoverage, fatigue = 0, redLine = false }) {
  const value = RULE.weights.fulfilment * fulfilment + RULE.weights.trust * trust + RULE.weights.costOfContinuing * costOfContinuing(fundCoverage, fatigue);
  return { value, accepted: !redLine && value >= RULE.consentThreshold };
}
const oldConsent = ({ fulfilment, trust, fundAdequacy }) => 0.5 * fulfilment + 0.3 * trust + 0.2 * 100 * fundAdequacy;
// 14.4: government fragility from support and disputes.
function fragility({ caretaker = false, supportSeats, maxTension = 0 }) {
  if (caretaker) return 100;
  return clip(RULE.fragilityBase - (supportSeats - RULE.majority) + RULE.tensionWeight * maxTension, 0, 100);
}

// ---- Unit checks of the approved contract.
{
  // Audit example, before and after.
  assert.equal(oldConsent({ fulfilment: 50, trust: 50, fundAdequacy: 0 }), 40);
  assert.equal(oldConsent({ fulfilment: 50, trust: 50, fundAdequacy: 1 }), 60);
  const full = consent({ fulfilment: 50, trust: 50, fundCoverage: 1, fatigue: 0 });
  const empty = consent({ fulfilment: 50, trust: 50, fundCoverage: 0, fatigue: 0 });
  const tired = consent({ fulfilment: 50, trust: 50, fundCoverage: 1, fatigue: 50 });
  assert.ok(full.value === 40 && !full.accepted, 'a full fund and rested strikers hold out');
  assert.ok(empty.value === 60 && empty.accepted, 'an empty fund makes the union settle');
  assert.ok(tired.value === 50 && tired.accepted, 'fatigue 50 also makes it settle');
  assert.ok(!consent({ fulfilment: 50, trust: 50, fundCoverage: 1, fatigue: 25 }).accepted);
  // Consent never rises with a fuller fund; a red line blocks consent.
  let prev = Infinity;
  for (let c = 0; c <= 1.0001; c += 0.05) {
    const v = consent({ fulfilment: 50, trust: 50, fundCoverage: c, fatigue: 10 }).value;
    assert.ok(v <= prev + 1e-12, 'consent does not rise with fund coverage'); prev = v;
  }
  assert.ok(!consent({ fulfilment: 100, trust: 100, fundCoverage: 0, fatigue: 100, redLine: true }).accepted);
  // An offer that meets every demand is always accepted, as in all archived M02 settlements.
  for (const trust of [0, 50, 100]) for (const c of [0, 0.5, 1]) for (const fatigue of [0, 50, 100]) {
    assert.ok(consent({ fulfilment: 100, trust, fundCoverage: c, fatigue }).accepted);
  }
  // Fragility examples.
  assert.equal(fragility({ supportSeats: 232 }), 40);
  assert.equal(fragility({ supportSeats: 279 }), 0);
  assert.equal(fragility({ supportSeats: 200 }), 72);
  assert.equal(fragility({ supportSeats: 232, maxTension: 60 }), 70);
  assert.equal(fragility({ caretaker: true, supportSeats: 300 }), 100);
  assert.equal(fragility({ supportSeats: 120, maxTension: 100 }), 100);
}

// ---- Scenario check: archived M02 robustness engine with M12 (and M10, M11) patched in memory only.
const enginePath = path.join(root, 'analysis/m02-robustness/engine.cjs');
const PATCH = [
  // M10: democracy pivot and pressure term.
  ["2 * militaryOpen - 2 * (newCivil.size > 0), 0, 100);",
   "2 * militaryOpen - 2 * (newCivil.size > 0) + (options.m10 ? options.m10.pressure(democracy) : 0), 0, 100);"],
  ["democracy = clip(democracy + .03 * (authority - 50)",
   "democracy = clip(democracy + .03 * (authority - (options.m10 ? options.m10.pivot : 50))"],
  // M11: forced concession costs relation; a refused threat is carried out at once.
  ["if(accepted)emit(t,'welfare_compromise','Utrzymanie 2 B przyjęte po ocenie; bez kolejnej premii.');",
   "if(accepted){emit(t,'welfare_compromise','Utrzymanie 2 B przyjęte po ocenie; bez kolejnej premii.');if(options.m11)for(const r of partners.parties)if(r.accepted)P.relations[r.actor]+=options.m11.relation;}"],
  ["else {withdrawDue=t+1;emit(t,'welfare_refusal',",
   "else if(options.m11){ppsMode='opposition';benefitPromised=false;successorDue=t+1;emit(t,'pps_withdrawal','M11: PPS spełnia groźbę od razu po odmowie, 0 T.',{costT:0});emit(t,'welfare_refusal','Kompromis odrzucony; PPS odchodzi od razu.',{causes:funded?['partner_score_or_hard_condition']:['funding']});}\n        else {withdrawDue=t+1;emit(t,'welfare_refusal',"],
  // M12: fragility from support and disputes. Scripted opening cabinets (Ponikowski, Nowak, Sikorski)
  // keep the placeholder support 444 in the engine; they get the SYNTHETIC toleration of M09:
  // Piast, NPR, PSChD and ZLN, plus PPS in external support. Not a historical claim.
  ["const governmentYes=()=>cabinetSupport;",
   "const governmentYes=()=>cabinetSupport;\n  const m12Support=()=>cabinetSupport===444?seats.piast+seats.npr+seats.pschd+seats.zln+(ppsMode==='external_support'?seats.pps:0):cabinetSupport;\n  const m12Fragility=()=>status==='caretaker'?100:Math.max(0,Math.min(100,50-(m12Support()-222)+.5*agreementTension));"],
  ["      + .2 * (100 - authority) - threshold) / 100, .05, .95)));",
   "      + .2 * (options.m12 ? m12Fragility() : (100 - authority)) - threshold) / 100, .05, .95)));"],
  // M12: consent reads the cost of continuing; every archived offer meets all demands.
  ["      const acceptance = .5 * 100 + .3 * unions[id].trust + .2 * 100 * Math.min(1, unions[id].fund / (2 * pot.cost));",
   "      const acceptance = options.m12 ? .5 * 100 + .3 * unions[id].trust + .2 * Math.max(100 * (1 - Math.min(1, unions[id].fund / pot.cost)), unions[id].fatigue) : .5 * 100 + .3 * unions[id].trust + .2 * 100 * Math.min(1, unions[id].fund / (2 * pot.cost));"],
];
function loadPatchedEngine() {
  let src = fs.readFileSync(enginePath, 'utf8');
  for (const [from, to] of PATCH) {
    assert.equal(src.split(from).length - 1, 1, `engine anchor present once: ${from.slice(0, 60)}`);
    src = src.replace(from, to);
  }
  const m = new Module(enginePath, module);
  m.filename = enginePath;
  m.paths = Module._nodeModulePaths(path.dirname(enginePath));
  m._compile(src, enginePath);
  return m.exports;
}
const original = require('../m02-robustness/engine.cjs');
const patched = loadPatchedEngine();
const seatsBase = { pps: 41, piast: 70, npr: 18, pschd: 60, zln: 100, wyzwolenie: 49, jewish: 45, otherMinority: 45, other: 14, kpp: 2 };
const parliaments = Object.fromEntries([['base', 0], ['favorable', 1], ['harder', -1]].map(([id, d]) => [id, { ...seatsBase, pps: 41 + 8 * d, wyzwolenie: 49 + 4 * d, zln: 100 - 8 * d, pschd: 60 - 4 * d }]));
const seeds = Array.from({ length: 12 }, (_, i) => `m02-robustness-${String(i + 1).padStart(2, '0')}`);
const monthIndex = d => { const [y, m] = d.split('-').map(Number); return 12 * (y - 1922) + m; };
const M10 = { pivot: 53, pressure: d => clip(0.01 * (60 - d), -0.5, 0.5) };
const M11 = { relation: -3 };
function runAll(engine, extra) {
  const out = {};
  for (const parliament of Object.keys(parliaments)) for (const cfg of engine.scenarios) for (const seed of seeds) {
    const r = engine.replay(cfg, { seats: parliaments[parliament], seed, ...extra });
    const cabinets = r.rows.map(x => `${x.cabinet}/${x.ppsMode}`).filter((c, i, a) => i === 0 || c !== a[i - 1]);
    const offers = r.events.filter(e => e.kind === 'settlement_offer').map(e => ({ date: e.date, chance: e.chance, accepted: /przyjęta/.test(e.message) }));
    out[`${parliament}|${cfg.id}|${seed}`] = { coup: r.endpoint.kind === 'synthetic_coup_result', date: r.endpoint.date, cabinets, offers };
  }
  return out;
}
function compare(a, b) {
  const res = { offers: 0, acceptedBefore: 0, acceptedAfter: 0, runsWithOtherOfferOutcome: 0, endpointsChanged: 0, cabinetSequencesChanged: 0, lost: 0, gained: 0, chanceChange: [Infinity, -Infinity], changedRuns: [] };
  for (const [k, x] of Object.entries(a)) {
    const y = b[k];
    res.offers += x.offers.length;
    res.acceptedBefore += x.offers.filter(o => o.accepted).length;
    res.acceptedAfter += y.offers.filter(o => o.accepted).length;
    const firstAccepted = o => (o.find(v => v.accepted) || {}).date || null;
    if (JSON.stringify(x.offers.map(o => [o.date, o.accepted])) !== JSON.stringify(y.offers.map(o => [o.date, o.accepted]))) {
      res.runsWithOtherOfferOutcome++;
      res.changedRuns.push({ run: k, settlementBefore: firstAccepted(x.offers), settlementAfter: firstAccepted(y.offers), endpointBefore: x.coup ? x.date : 'none', endpointAfter: y.coup ? y.date : 'none' });
    }
    if (x.coup && !y.coup) res.lost++;
    if (!x.coup && y.coup) res.gained++;
    if (x.coup !== y.coup || x.date !== y.date) res.endpointsChanged++;
    if (JSON.stringify(x.cabinets) !== JSON.stringify(y.cabinets)) res.cabinetSequencesChanged++;
    x.offers.forEach((o, i) => {
      const q = y.offers[i];
      if (q && q.date === o.date) { res.chanceChange[0] = Math.min(res.chanceChange[0], q.chance - o.chance); res.chanceChange[1] = Math.max(res.chanceChange[1], q.chance - o.chance); }
    });
  }
  return res;
}
const archived = runAll(original, {});
assert.deepEqual(runAll(patched, {}), archived, 'patched engine without M10-M12 reproduces the archived runs');
const m12Only = runAll(patched, { m12: true });
const cumulativeBefore = runAll(patched, { m10: M10, m11: M11 });
const cumulativeAfter = runAll(patched, { m10: M10, m11: M11, m12: true });
const scenario = { m12VersusArchive: compare(archived, m12Only), m10m11m12VersusM10m11: compare(cumulativeBefore, cumulativeAfter) };
assert.equal(scenario.m12VersusArchive.cabinetSequencesChanged, 0, 'M12 does not change cabinet sequences');
assert.equal(scenario.m12VersusArchive.lost + scenario.m12VersusArchive.gained, 0, 'M12 keeps every attempt');

const docs = ['docs/POLISH_TECHNICAL_REFERENCE.md', 'docs/POLISH_DESCRIPTIVE_GUIDE.md', 'docs/POLISH_MECHANICS_AUDIT.md', 'analysis/m02-robustness/engine.cjs'];
const hashes = Object.fromEntries(docs.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({
  scope: 'M12: union settlement consent reads the cost of continuing; strike-negotiation fragility reads cabinet support and disputes (technical 14.4, 17.4). Unit checks and the 144 main M02 runs on the archived robustness engine patched in memory, alone and on top of M10+M11. Not a campaign run.',
  rule: RULE, hashes, scenario,
}, null, 2) + '\n');

const pp = x => `${(100 * x).toFixed(1)} pp`;
console.log('PASS: consent reads the cost of continuing (fund shortfall or fatigue, whichever is larger) and never rises with the fund; full offers always accepted; red line blocks; fragility examples 40/0/72/70/100; patched engine reproduces M02; no cabinet sequence or attempt lost.');
for (const [name, r] of Object.entries(scenario)) {
  console.log(`${name}: strike offers ${r.offers}, accepted ${r.acceptedBefore} -> ${r.acceptedAfter}, runs with another offer outcome ${r.runsWithOtherOfferOutcome}, chance change ${pp(r.chanceChange[0])}..${pp(r.chanceChange[1])}, endpoints changed ${r.endpointsChanged}, cabinet sequences changed ${r.cabinetSequencesChanged}`);
  for (const c of r.changedRuns) console.log(`   ${c.run.padEnd(30)} settlement ${c.settlementBefore} -> ${c.settlementAfter}; endpoint ${c.endpointBefore} -> ${c.endpointAfter}`);
}
