#!/usr/bin/env node
'use strict';
// M11 diagnostics for technical reference 9.8: a bargaining threat must be real and a forced
// concession costs the relation, while persuasion keeps it. Documentation diagnostics only:
// not Dendry gameplay, not a campaign run.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const Module = require('node:module');

const root = path.resolve(__dirname, '../..');
const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
const clip = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// Approved rule (P values of the approved structure).
const RULE = { backDownCredibility: -5, forcedConcessionRelation: -3 };

// 8.3 acceptance score; `base` is every term except need.
const score = (base, need) => clip(base + 0.10 * need, 0, 100);
// One 9.8 request. mode: bargain | persuade. Returns the result and the state changes.
function request({ mode, base, need, cabinetDiscounted = false, afterRefusal = 'withdraw' }) {
  const effectiveNeed = mode === 'bargain' && !cabinetDiscounted ? need : 0;
  const s = score(base, effectiveNeed);
  const accepted = s >= 60;
  const out = { score: s, accepted, relation: 0, credibility: 0, withdraw: false, discounted: cabinetDiscounted };
  if (mode === 'bargain' && accepted) out.relation = RULE.forcedConcessionRelation;
  if (mode === 'bargain' && !accepted) {
    if (afterRefusal === 'withdraw') out.withdraw = true;
    else { out.credibility = RULE.backDownCredibility; out.discounted = true; }
  }
  return out;
}

// ---- Unit checks of the approved contract.
{
  // Audit example: base 55, need 100.
  const b = request({ mode: 'bargain', base: 55, need: 100 });
  const p = request({ mode: 'persuade', base: 55, need: 100 });
  assert.ok(close(b.score, 65) && b.accepted && b.relation === -3, 'bargain succeeds and costs relation');
  assert.ok(close(p.score, 55) && !p.accepted && p.relation === 0 && p.credibility === 0, 'persuasion fails at no cost');
  // Refusal of a threat: carry it out, or back down with a price.
  const w = request({ mode: 'bargain', base: 48, need: 100, afterRefusal: 'withdraw' });
  assert.ok(!w.accepted && w.withdraw && w.credibility === 0);
  const back = request({ mode: 'bargain', base: 48, need: 100, afterRefusal: 'back_down' });
  assert.ok(!back.accepted && !back.withdraw && back.credibility === -5 && back.discounted);
  // After backing down, a new threat to the same cabinet counts like persuasion.
  const again = request({ mode: 'bargain', base: 55, need: 100, cabinetDiscounted: true });
  assert.ok(close(again.score, 55) && !again.accepted, 'discounted threat has no need bonus');
  // Credibility -5 lowers every later 8.3 score by 0.5 point.
  assert.ok(close(0.10 * RULE.backDownCredibility, -0.5));
  // A cabinet that does not need PPS gives no bonus: persuasion then dominates.
  const nb = request({ mode: 'bargain', base: 62, need: 0 }), np = request({ mode: 'persuade', base: 62, need: 0 });
  assert.ok(nb.score === np.score && nb.accepted && np.accepted && nb.relation === -3 && np.relation === 0);
  // Persuasion never changes relation or credibility.
  for (const base of [40, 55, 70]) {
    const r = request({ mode: 'persuade', base, need: 100 });
    assert.ok(r.relation === 0 && r.credibility === 0 && !r.withdraw);
  }
}

// ---- Archived M02 review cases (analysis/m02-negotiations): the Skrzynski welfare review.
const negotiations = JSON.parse(fs.readFileSync(path.join(root, 'analysis/m02-negotiations/results.json'), 'utf8')).reports;
const reviewCases = {};
for (const x of negotiations.filter(x => x.id.startsWith('keep_'))) {
  const [, run, mode, actor] = x.id.match(/^keep_(.+)_(bargain|persuade)_(\w+)$/);
  (reviewCases[`${run}|${mode}`] ||= {})[actor] = { score: x.result.score, accepted: x.result.accepted, need: x.result.need };
}
const relationsBefore = { 'C|bargain': { piast: 53, npr: 54, pschd: 46, zln: 25 }, 'C+kontakt|bargain': { piast: 53, npr: 54, pschd: 46, zln: 29 },
  'C|persuade': { piast: 53, npr: 54, pschd: 46, zln: 25 }, 'C+3kontakty|persuade': { piast: 53, npr: 54, pschd: 46, zln: 37 },
  'H|bargain': { piast: 53, npr: 54, pschd: 46, zln: 5 } };
const review = {};
for (const [key, actors] of Object.entries(reviewCases)) {
  const mode = key.split('|')[1];
  const all = Object.values(actors).every(a => a.accepted);
  const after = { ...relationsBefore[key] };
  if (all && mode === 'bargain') for (const a of Object.keys(after)) after[a] += RULE.forcedConcessionRelation;
  review[key] = { accepted: all, relationsBefore: relationsBefore[key], relationsAfter: after };
}
assert.ok(review['C+kontakt|bargain'].accepted && !review['C|bargain'].accepted, 'one ZLN contact is enough when bargaining');
assert.ok(review['C+3kontakty|persuade'].accepted && !review['C|persuade'].accepted, 'persuasion needs three ZLN contacts');
assert.ok(!review['H|bargain'].accepted, 'H is refused');
assert.deepEqual(review['C+kontakt|bargain'].relationsAfter, { piast: 50, npr: 51, pschd: 43, zln: 26 });

// ---- Scenario check: archived M02 robustness engine with M11 (and M10) patched in memory only.
const enginePath = path.join(root, 'analysis/m02-robustness/engine.cjs');
const PATCH = [
  // M10 (for the combined variant): democracy pivot and the pressure term.
  ["2 * militaryOpen - 2 * (newCivil.size > 0), 0, 100);",
   "2 * militaryOpen - 2 * (newCivil.size > 0) + (options.m10 ? options.m10.pressure(democracy) : 0), 0, 100);"],
  ["democracy = clip(democracy + .03 * (authority - 50)",
   "democracy = clip(democracy + .03 * (authority - (options.m10 ? options.m10.pivot : 50))"],
  // M11: a forced concession costs -3 relation with each accepting partner.
  ["if(accepted)emit(t,'welfare_compromise','Utrzymanie 2 B przyjęte po ocenie; bez kolejnej premii.');",
   "if(accepted){emit(t,'welfare_compromise','Utrzymanie 2 B przyjęte po ocenie; bez kolejnej premii.');if(options.m11)for(const r of partners.parties)if(r.accepted)P.relations[r.actor]+=options.m11.relation;}"],
  // M11: after a refused threat the planned withdrawal happens at once, at 0 T.
  ["else {withdrawDue=t+1;emit(t,'welfare_refusal',",
   "else if(options.m11){ppsMode='opposition';benefitPromised=false;successorDue=t+1;emit(t,'pps_withdrawal','M11: PPS spełnia groźbę od razu po odmowie, 0 T.',{costT:0});emit(t,'welfare_refusal','Kompromis odrzucony; PPS odchodzi od razu.',{causes:funded?['partner_score_or_hard_condition']:['funding']});}\n        else {withdrawDue=t+1;emit(t,'welfare_refusal',"],
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
const M11 = { relation: RULE.forcedConcessionRelation };
function runAll(engine, extra) {
  const out = {};
  for (const parliament of Object.keys(parliaments)) for (const cfg of engine.scenarios) for (const seed of seeds) {
    const r = engine.replay(cfg, { seats: parliaments[parliament], seed, ...extra });
    const cabinets = r.rows.map(x => `${x.cabinet}/${x.ppsMode}`).filter((c, i, a) => i === 0 || c !== a[i - 1]);
    const reviews = r.events.filter(e => e.kind === 'welfare_review').map(e => e.accepted);
    out[`${parliament}|${cfg.id}|${seed}`] = { coup: r.endpoint.kind === 'synthetic_coup_result', date: r.endpoint.date, cabinets, reviews,
      withdrawal: r.events.find(e => e.kind === 'pps_withdrawal')?.date ?? null, relations: r.finalParty.relations };
  }
  return out;
}
function compare(a, b) {
  let changedEndpoint = 0, changedCabinets = 0, lost = 0, gained = 0;
  const delays = {};
  for (const [k, x] of Object.entries(a)) {
    const y = b[k];
    if (x.coup && !y.coup) lost++;
    if (!x.coup && y.coup) gained++;
    if (x.coup !== y.coup || x.date !== y.date) changedEndpoint++;
    if (JSON.stringify(x.cabinets) !== JSON.stringify(y.cabinets)) changedCabinets++;
    if (x.coup && y.coup) { const d = monthIndex(y.date) - monthIndex(x.date); delays[d] = (delays[d] || 0) + 1; }
  }
  return { changedEndpoint, changedCabinets, lost, gained, delays };
}
const archived = runAll(original, {});
assert.deepEqual(runAll(patched, {}), archived, 'patched engine without M10/M11 reproduces the archived runs');
const m11Only = runAll(patched, { m11: M11 });
const m10Only = runAll(patched, { m10: M10 });
const m10m11 = runAll(patched, { m10: M10, m11: M11 });
const reviews = { total: 0, accepted: 0, refused: 0 };
for (const x of Object.values(archived)) for (const acc of x.reviews) { reviews.total++; acc ? reviews.accepted++ : reviews.refused++; }
const scenario = {
  reviews,
  m11VersusArchive: compare(archived, m11Only),
  m10m11VersusM10: compare(m10Only, m10m11),
};
assert.equal(scenario.m11VersusArchive.lost + scenario.m11VersusArchive.gained, 0, 'M11 keeps every attempt');
// Where PPS carried out the refused threat, the withdrawal now comes one month earlier.
const withdrawalShift = {};
for (const [k, x] of Object.entries(archived)) {
  const y = m11Only[k];
  if (x.withdrawal || y.withdrawal) {
    const d = x.withdrawal && y.withdrawal ? monthIndex(y.withdrawal) - monthIndex(x.withdrawal) : 'n/a';
    withdrawalShift[d] = (withdrawalShift[d] || 0) + 1;
  }
}
scenario.withdrawalShift = withdrawalShift;
const seed01 = {};
for (const parliament of Object.keys(parliaments)) for (const id of original.scenarios.map(c => c.id)) {
  const k = `${parliament}|${id}|m02-robustness-01`;
  const show = e => (e[k].coup ? e[k].date : 'none');
  seed01[`${parliament}|${id}`] = { archived: show(archived), m11: show(m11Only), m10: show(m10Only), m10m11: show(m10m11),
    reviews: archived[k].reviews, withdrawal: [archived[k].withdrawal, m11Only[k].withdrawal] };
}

const docs = ['docs/POLISH_TECHNICAL_REFERENCE.md', 'docs/POLISH_DESCRIPTIVE_GUIDE.md', 'docs/POLISH_MECHANICS_AUDIT.md',
  'analysis/m02-robustness/engine.cjs', 'analysis/m02-negotiations/results.json'];
const hashes = Object.fromEntries(docs.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({
  scope: 'M11: bargaining threat versus persuasion (technical 9.8). Unit checks, archived M02 review cases, and the 144 main M02 runs on the archived robustness engine patched in memory (alone and together with M10). Not a campaign run.',
  rule: RULE, hashes, review, scenario, seed01,
}, null, 2) + '\n');

console.log('PASS: bargain gains the need bonus but costs -3 relation on success; refusal forces withdrawal or a -5 credibility back-down that discounts later threats to the same cabinet; persuasion keeps relation; archived review cases and patched engine checks.');
for (const [k, v] of Object.entries(review)) console.log(`review ${k.padEnd(20)} accepted ${v.accepted} relations ${JSON.stringify(v.relationsBefore)} -> ${JSON.stringify(v.relationsAfter)}`);
console.log(`M02 reviews in 144 runs: ${JSON.stringify(reviews)}; withdrawal shift (months): ${JSON.stringify(withdrawalShift)}`);
console.log(`M11 vs archive: ${JSON.stringify(scenario.m11VersusArchive)}`);
console.log(`M10+M11 vs M10: ${JSON.stringify(scenario.m10m11VersusM10)}`);
for (const [k, v] of Object.entries(seed01)) console.log(`seed 01 ${k.padEnd(12)} archived ${v.archived} | M11 ${v.m11} | M10 ${v.m10} | M10+M11 ${v.m10m11} | reviews ${JSON.stringify(v.reviews)} | withdrawal ${JSON.stringify(v.withdrawal)}`);
