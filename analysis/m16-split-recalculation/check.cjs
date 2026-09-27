#!/usr/bin/env node
'use strict';
// M16 diagnostics for technical reference 10.2 and 10.9: one explicit recalculation for an accepted E3
// split (40% of the faction's base, like the 25% purge), faction MP assignments frozen between real
// transfers, and dissent of the remaining part -20. Documentation diagnostics only: not Dendry
// gameplay, not a campaign run.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

// Approved rule (P values of the approved structure).
const RULE = { split: { share: 0.40, remainingDissentDrop: 20 }, purge: { share: 0.25, remainingDissentDrop: 15 } };
const FACTIONS = ['centrum', 'lewica', 'pilsudczycy'];

// 10.1 normalisation and cohesion.
function normalise(raw) {
  const total = FACTIONS.reduce((s, f) => s + Math.max(0, raw[f]), 0);
  return Object.fromEntries(FACTIONS.map(f => [f, 100 * Math.max(0, raw[f]) / total]));
}
const partyDissent = (strength, dissent) => Math.min(0.95, FACTIONS.reduce((s, f) => s + strength[f] * dissent[f], 0) / 10000);
// Largest-remainder allocation, ties by faction order (stable ID).
function allocateSeats(seats, strength) {
  const quotas = FACTIONS.map(f => ({ f, q: seats * strength[f] / 100 }));
  const out = Object.fromEntries(quotas.map(x => [x.f, Math.floor(x.q)]));
  let left = seats - Object.values(out).reduce((a, b) => a + b, 0);
  for (const x of [...quotas].sort((a, b) => (b.q - Math.floor(b.q)) - (a.q - Math.floor(a.q)) || FACTIONS.indexOf(a.f) - FACTIONS.indexOf(b.f))) {
    if (left-- <= 0) break;
    out[x.f] += 1;
  }
  return out;
}
// One departure manifest (split or purge) applied to a party state.
function depart(state, faction, kind, recipient = 'other') {
  const r = RULE[kind];
  const removedShare = r.share * state.strength[faction] / 100;
  const raw = { ...state.strength, [faction]: state.strength[faction] * (1 - r.share) };
  const strength = normalise(raw);
  const dissent = { ...state.dissent, [faction]: Math.max(0, state.dissent[faction] - r.remainingDissentDrop) };
  const leavingMPs = Math.round(r.share * state.factionSeats[faction]);
  const factionSeats = { ...state.factionSeats, [faction]: state.factionSeats[faction] - leavingMPs };
  const rows = Object.fromEntries(Object.entries(state.rows).map(([cls, row]) => {
    const lost = row.pps * removedShare;
    return [cls, { ...row, pps: row.pps - lost, [recipient]: (row[recipient] || 0) + lost }];
  }));
  return { ...state, strength, dissent, factionSeats, rows, memberIndex: state.memberIndex * (1 - removedShare),
    splitClubSeats: (state.splitClubSeats || 0) + (kind === 'split' ? leavingMPs : 0), removedShare, leavingMPs };
}
// Opening class rows (source/scenes/root.scene.dry, K) and weights, as in M09.
const PARTIES = ['kpp', 'pps', 'npr', 'wyzwolenie', 'piast', 'pschd', 'zln', 'minorities', 'other'];
const CLASSES = {
  workers: { weight: 27, row: [11.04, 38.64, 18.40, 1.84, 0.92, 9.20, 7.36, 4.60, 8] },
  intelligentsia: { weight: 50 / 9, row: [3.68, 22.08, 4.60, 8.28, 4.60, 9.20, 25.76, 13.80, 8] },
  petty: { weight: 110 / 9, row: [1.84, 9.20, 12.88, 3.68, 5.52, 18.40, 29.44, 11.04, 8] },
  peasants: { weight: 53, row: [1.76, 3.52, 1.76, 28.16, 29.92, 5.28, 13.20, 4.40, 12] },
  bourgeoisie: { weight: 20 / 9, row: [0, 1.84, 3.68, 0.92, 6.44, 13.80, 48.76, 16.56, 8] },
};
const openingRows = () => Object.fromEntries(Object.entries(CLASSES).map(([k, c]) => [k, Object.fromEntries(PARTIES.map((p, i) => [p, c.row[i]]))]));
const nationalPPS = rows => Object.entries(CLASSES).reduce((s, [k, c]) => s + c.weight * rows[k].pps / 100, 0);
function openingState() {
  const strength = { centrum: 50, lewica: 15, pilsudczycy: 35 };
  return { strength, dissent: { centrum: 0, lewica: 20, pilsudczycy: 5 }, factionSeats: allocateSeats(35, strength),
    rows: openingRows(), memberIndex: 1 };
}

// ---- Unit checks of the approved contract.
const examples = {};
{
  const s0 = openingState();
  assert.deepEqual(s0.factionSeats, { centrum: 18, lewica: 5, pilsudczycy: 12 }, '35 MPs by 50/15/35');
  assert.ok(close(partyDissent(s0.strength, s0.dissent), 0.0475), 'opening cohesion 95.25');
  // Lewica split: strength 15, dissent 65, 5 MPs.
  const lewicaBefore = { ...s0, dissent: { ...s0.dissent, lewica: 65 } };
  const lew = depart(lewicaBefore, 'lewica', 'split', 'kpp');
  assert.ok(close(lew.removedShare, 0.06));
  assert.ok(close(lew.strength.centrum, 5000 / 94) && close(lew.strength.lewica, 900 / 94) && close(lew.strength.pilsudczycy, 3500 / 94));
  assert.equal(lew.dissent.lewica, 45);
  assert.equal(lew.leavingMPs, 2); assert.equal(lew.splitClubSeats, 2);
  assert.equal(Object.values(lew.factionSeats).reduce((a, b) => a + b, 0), 33);
  assert.ok(close(lew.memberIndex, 0.94));
  for (const row of Object.values(lew.rows)) assert.ok(close(Object.values(row).reduce((a, b) => a + b, 0), 100), 'rows still sum to 100');
  examples.lewica = { removedShare: lew.removedShare, strength: lew.strength, remainingDissent: lew.dissent.lewica, leavingMPs: lew.leavingMPs,
    ppsBefore: nationalPPS(s0.rows), ppsAfter: nationalPPS(lew.rows), cohesionBefore: 100 * (1 - partyDissent(lewicaBefore.strength, lewicaBefore.dissent)),
    cohesionAfter: 100 * (1 - partyDissent(lew.strength, lew.dissent)) };
  assert.ok(close(examples.lewica.ppsAfter / examples.lewica.ppsBefore, 0.94), 'PPS support falls by the departing share');
  // Pilsudczycy split: strength 35, 12 MPs -> round(4.8) = 5.
  const pil = depart({ ...s0, dissent: { ...s0.dissent, pilsudczycy: 62 } }, 'pilsudczycy', 'split');
  assert.ok(close(pil.removedShare, 0.14)); assert.equal(pil.leavingMPs, 5);
  examples.pilsudczycy = { removedShare: pil.removedShare, leavingMPs: pil.leavingMPs, ppsAfter: nationalPPS(pil.rows), remainingDissent: pil.dissent.pilsudczycy };
  // Purge uses the same machinery with 25% and -15.
  const pur = depart({ ...s0, dissent: { ...s0.dissent, lewica: 65 } }, 'lewica', 'purge');
  assert.ok(close(pur.removedShare, 0.0375)); assert.equal(pur.dissent.lewica, 50); assert.equal(pur.leavingMPs, 1);
  assert.equal(pur.splitClubSeats, 0, 'a purge creates no split club');
  examples.purgeLewica = { removedShare: pur.removedShare, leavingMPs: pur.leavingMPs, remainingDissent: pur.dissent.lewica };
  // Frozen MPs: a change of political strength (e.g. Perl, Centrum +8 raw) does not reassign MPs.
  const afterPerl = { ...lewicaBefore, strength: normalise({ ...lewicaBefore.strength, centrum: lewicaBefore.strength.centrum + 8 }) };
  assert.deepEqual(afterPerl.factionSeats, lewicaBefore.factionSeats);
  // Order independence: the same split removes the same MPs before or after the strength change.
  const a = depart(afterPerl, 'lewica', 'split'), b = depart(lewicaBefore, 'lewica', 'split');
  assert.equal(a.leavingMPs, b.leavingMPs);
  // Without the freeze, re-allocating from strength changes the transfer: Lewica strengthened by
  // advisor actions (+12 raw, e.g. two Czapinski actions) would suddenly hold more MPs.
  const strengthened = normalise({ ...lewicaBefore.strength, lewica: lewicaBefore.strength.lewica + 12 });
  const reallocated = allocateSeats(35, strengthened);
  examples.withoutFreeze = { lewicaStrength: strengthened.lewica, lewicaSeatsIfReallocated: reallocated.lewica,
    transferIfReallocated: Math.round(0.4 * reallocated.lewica), frozenSeats: lewicaBefore.factionSeats.lewica,
    frozenTransfer: Math.round(0.4 * lewicaBefore.factionSeats.lewica) };
  assert.ok(examples.withoutFreeze.transferIfReallocated > examples.withoutFreeze.frozenTransfer, 'reallocation would change the split cost');
  // One manifest: a later purge of the same faction works on the post-split state, never the same people twice.
  const both = depart(lew, 'lewica', 'purge');
  assert.ok(both.factionSeats.lewica === lew.factionSeats.lewica - Math.round(0.25 * lew.factionSeats.lewica));
  assert.ok(both.removedShare < pur.removedShare, 'a purge after a split removes a share of the smaller faction');
}

// ---- Scenario check: the archived M02 run asserts that no faction reaches dissent 60.
const runSrc = fs.readFileSync(path.join(root, 'analysis/m02-robustness/run.cjs'), 'utf8');
const m02GuardsDissent = runSrc.includes("every(f=>f.dissent<60),'Unimplemented faction exit may not be silently crossed'");
assert.equal(m02GuardsDissent, true, 'archived M02 runs never reach an E3 split');

const docs = ['docs/POLISH_TECHNICAL_REFERENCE.md', 'docs/POLISH_DESCRIPTIVE_GUIDE.md', 'docs/POLISH_MECHANICS_AUDIT.md', 'analysis/m02-robustness/run.cjs'];
const hashes = Object.fromEntries(docs.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({
  scope: 'M16: explicit E3 split recalculation (40% of the faction base), frozen faction MP assignment, remaining dissent -20 (technical 10.2, 10.9). Unit checks on the opening party profile; archived M02 runs never reach dissent 60.',
  rule: RULE, hashes, examples, m02GuardsDissent,
}, null, 2) + '\n');

const f1 = x => x.toFixed(2);
console.log('PASS: 35 MPs 18/5/12; Lewica split removes 6% (PPS support x0.94, 2 MPs, dissent 65 -> 45, strengths 53.19/9.57/37.23); Pilsudczycy split 14% and 5 MPs; purge 25%/-15 on the same machinery; frozen MPs make the transfer order-independent; one manifest per departure; M02 guard present.');
console.log(`Lewica split: PPS ${f1(examples.lewica.ppsBefore)}% -> ${f1(examples.lewica.ppsAfter)}%, cohesion ${f1(examples.lewica.cohesionBefore)} -> ${f1(examples.lewica.cohesionAfter)}; Pilsudczycy split: PPS -> ${f1(examples.pilsudczycy.ppsAfter)}%; Lewica at ${f1(examples.withoutFreeze.lewicaStrength)} strength: reallocated ${examples.withoutFreeze.lewicaSeatsIfReallocated} seats (transfer ${examples.withoutFreeze.transferIfReallocated}) versus frozen ${examples.withoutFreeze.frozenSeats} (transfer ${examples.withoutFreeze.frozenTransfer}).`);
