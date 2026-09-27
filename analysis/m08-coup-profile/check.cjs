#!/usr/bin/env node
'use strict';
// M08 diagnostics for the approved coup profile coup_f_v1 (technical reference 16.8).
// Exact enumeration of the 81 allegiance outcomes of the synthetic force profile.
// Documentation diagnostics only: this is not Dendry gameplay and not a campaign run.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const SIDES = ['legal', 'pils', 'neutral'];
const opp = side => (side === 'pils' ? 'legal' : 'pils');
const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

// Synthetic groups (16.1). Loyalties are [legal, pils, neutral].
const GROUPS = [
  { id: 'capital_legal', base: 45, readiness: 0.80, command: 0.80, phase: 0, rail: false, railCap: 0 },
  { id: 'capital_pils', base: 55, readiness: 0.85, command: 0.85, phase: 0, rail: false, railCap: 0 },
  { id: 'near_reserve', base: 25, readiness: 0.70, command: 0.70, phase: 1, rail: false, railCap: 0 },
  { id: 'remote_reserve', base: 35, readiness: 0.70, command: 0.70, phase: 2, rail: true, railCap: 2 },
];
const PROFILES = {
  synthetic_test_v1: [[0.90, 0.05, 0.05], [0.05, 0.90, 0.05], [0.35, 0.45, 0.20], [0.70, 0.15, 0.15]],
  synthetic_test_v2: [[0.90, 0.05, 0.05], [0.05, 0.90, 0.05], [0.30, 0.50, 0.20], [0.50, 0.25, 0.25]],
};

// Offer acceptability: programme fit of 8.1; a demand is met (distance 0) or not (distance 4).
function fit(ideal, offer) {
  let num = 0, den = 0;
  for (const [topic, { v, w }] of Object.entries(ideal)) { num += w * Math.abs(offer[topic] - v); den += w; }
  return 100 * (1 - num / (4 * den));
}
const PILS = { army: { v: -2, w: 1 }, institution: { v: -2, w: 1 }, fn: { v: 2, w: 3 }, removal: { v: 2, w: 3 } };
const LEGAL = { army: { v: 2, w: 1 }, institution: { v: 0, w: 1 }, cabinet: { v: 2, w: 3 } };
const OFFERS = [
  { id: 'coup.offer.military_function', army: 0, institution: 0, fn: 2, removal: -2, cabinet: 2 },
  { id: 'coup.offer.inspectorate_law', army: -2, institution: 0, fn: 2, removal: -2, cabinet: 2 },
  { id: 'coup.offer.cabinet_change', army: -1, institution: 0, fn: 2, removal: 2, cabinet: -2 },
].map(o => ({ ...o, acc: { pils: fit(PILS, o), legal: fit(LEGAL, o) } }));
assert.ok(close(OFFERS[0].acc.pils, 50) && close(OFFERS[0].acc.legal, 90));
assert.ok(close(OFFERS[1].acc.pils, 56.25) && close(OFFERS[1].acc.legal, 80));
assert.ok(close(OFFERS[2].acc.pils, 90.625) && close(OFFERS[2].acc.legal, 25));

function capacity(profile) {
  const expectedPilsF = GROUPS.reduce((s, g, i) => s + g.base * g.readiness * g.command * PROFILES[profile][i][1], 0);
  return expectedPilsF * 0.80; // logistics 0.80, expectedAvailability 1 for phases 0-3
}

// cfg: stance ('pils'|'legal'|'neutral'|null), rail {byRound:[4], readiness}, militiaF,
//      democracy, f9 ('accept'|'reject'), noPPS (counterfactual run)
function resolve(sides, cfg) {
  const withPPS = !cfg.noPPS;
  const fighting = withPPS && (cfg.stance === 'pils' || cfg.stance === 'legal');
  const rail = fighting && cfg.rail ? cfg.rail : { byRound: [0, 0, 0, 0], readiness: 0 };
  const militiaF = fighting ? (cfg.militiaF || 0) : 0;
  const groups = GROUPS.map((g, i) => ({ ...g, side: sides[i], loss: 0, arrival: g.phase, delayKnownAt: null }));
  for (const g of groups) {
    if (!fighting || !g.rail || g.side !== opp(cfg.stance) || g.phase < 1) continue;
    // First phase: measured in the round before the scheduled arrival.
    if (g.railCap >= 1 && rail.byRound[g.arrival - 1] >= 40 && rail.readiness >= 50) {
      g.delayKnownAt = g.arrival - 1; g.arrival += 1;
      // Second phase: measured in the round before the delayed arrival.
      if (g.railCap >= 2 && rail.byRound[g.arrival - 1] >= 65 && rail.readiness >= 70) g.arrival += 1;
    }
  }
  const initial = { pils: 0, legal: 0 };
  for (const g of groups) if (g.side !== 'neutral') initial[g.side] += g.base;
  const force = r => {
    const F = { pils: 0, legal: 0 };
    if (fighting && militiaF) F[cfg.stance] += militiaF;
    for (const g of groups) if (g.side !== 'neutral' && g.arrival <= r) F[g.side] += (g.base - g.loss) * g.readiness * g.command;
    return F;
  };
  const nextArrivals = (side, r) => groups
    .filter(g => g.side === side && g.arrival === r + 1)
    .reduce((s, g) => s + (g.base - g.loss) * g.readiness * g.command, 0);
  const log = [];
  let f9 = null;
  const significant = (F, r) => fighting && (
    groups.some(g => g.delayKnownAt !== null && g.delayKnownAt <= r) ||
    (militiaF > 0 && militiaF >= 0.10 * F[cfg.stance]));
  const settlement = (F, completed) => {
    if (completed < 1 || (f9 && f9.response === 'rejected')) return null;
    let best = null;
    for (const offer of OFFERS) {
      const score = {};
      for (const side of ['pils', 'legal']) {
        const own = F[side], other = F[opp(side)];
        if (completed < 4 && own > 1.2 * other) { score[side] = null; continue; } // clear advantage: no bargaining
        const relativeDisadvantage = own + other === 0 ? 50 : 100 * other / (own + other);
        const lossPct = 100 * groups.filter(g => g.side === side).reduce((s, g) => s + g.loss, 0) / Math.max(1, initial[side]);
        const exhaustion = Math.min(100, 20 * completed + lossPct);
        score[side] = 0.40 * (0.5 * relativeDisadvantage + 0.5 * exhaustion) + 0.30 * offer.acc[side] + 0.30 * cfg.democracy;
      }
      if (score.pils === null || score.legal === null) continue;
      const min = Math.min(score.pils, score.legal);
      if (min >= 60 && (!best || min > best.min)) best = { offer: offer.id, min, score };
    }
    if (!best) return null;
    if (significant(F, completed === 4 ? 3 : completed)) {
      if (f9) return null; // F9 at most once
      f9 = { atCompletedRounds: completed, offer: best.offer, response: cfg.f9 === 'reject' ? 'rejected' : 'accepted' };
      if (f9.response === 'rejected') return null;
    }
    return best;
  };
  const streak = { pils: 0, legal: 0 };
  for (let r = 0; r < 4; r++) {
    const F = force(r);
    const s = settlement(F, r);
    if (s) return { outcome: 'constitutional_compromise', round: r + 1, offer: s.offer, f9, log };
    let winner = null;
    for (const side of ['pils', 'legal']) {
      const effectiveOpponent = F[opp(side)] + nextArrivals(opp(side), r);
      const crushing = F[side] > 0 && F[side] >= 2 * effectiveOpponent;
      streak[side] = F[side] > 1.2 * effectiveOpponent ? streak[side] + 1 : 0;
      if (!winner && (crushing || streak[side] >= 2)) winner = { side, crushing };
    }
    log.push({ round: r + 1, pils: F.pils, legal: F.legal, streak: { ...streak } });
    if (winner) return { outcome: `${winner.side}_victory`, round: r + 1, crushing: winner.crushing, f9, log };
    for (const g of groups) if (g.side !== 'neutral' && g.arrival <= r) g.loss += (g.base - g.loss) * 0.08 * F[opp(g.side)] / Math.max(1, F.pils + F.legal);
  }
  const s = settlement(force(3), 4); // final assessment after round 4, no new fighting
  if (s) return { outcome: 'constitutional_compromise', round: 4, offer: s.offer, final: true, f9, log };
  return { outcome: 'prolonged_conflict', round: 4, f9, log };
}

const RANK = {
  pils: { pils_victory: 3, constitutional_compromise: 2, prolonged_conflict: 1, legal_victory: 0 },
  legal: { legal_victory: 3, constitutional_compromise: 2, prolonged_conflict: 1, pils_victory: 0 },
};
function contribution(sides, cfg, result) {
  if (cfg.stance !== 'pils' && cfg.stance !== 'legal') return 'none';
  const without = resolve(sides, { ...cfg, noPPS: true });
  const rank = RANK[cfg.stance];
  if (rank[result.outcome] > rank[without.outcome]) return 'decisive';
  if (rank[result.outcome] < rank[without.outcome]) return 'adverse';
  if (result.outcome === without.outcome && result.round < without.round) return 'accelerating';
  return 'none';
}

function enumerate(profile, cfg) {
  const L = PROFILES[profile];
  const out = { outcomes: {}, victoriesByRound: {}, f9: 0, f9Rejected: 0, rounds: 0, contribution: {}, supportedWins: 0, concessions: 0, total: 0 };
  for (const a of [0, 1, 2]) for (const b of [0, 1, 2]) for (const c of [0, 1, 2]) for (const d of [0, 1, 2]) {
    const idx = [a, b, c, d];
    const p = idx.reduce((acc, k, i) => acc * L[i][k], 1);
    const sides = idx.map(k => SIDES[k]);
    const r = resolve(sides, cfg);
    assert.ok(r.round >= 1 && r.round <= 4);
    if (r.outcome === 'constitutional_compromise') assert.ok(r.final || r.round >= 2, 'no settlement before any completed round');
    if (cfg.stance === 'neutral' || !cfg.stance) assert.equal(r.f9, null, 'no F9 without fighting PPS');
    out.total += p;
    out.outcomes[r.outcome] = (out.outcomes[r.outcome] || 0) + p;
    out.rounds += p * r.round;
    if (r.outcome.endsWith('_victory')) out.victoriesByRound[r.round] = (out.victoriesByRound[r.round] || 0) + p;
    if (r.f9) { out.f9 += p; if (r.f9.response === 'rejected') out.f9Rejected += p; }
    const k = contribution(sides, cfg, r);
    out.contribution[k] = (out.contribution[k] || 0) + p;
    if (cfg.stance && r.outcome === `${cfg.stance}_victory`) { out.supportedWins += p; if (k === 'decisive') out.concessions += p; }
  }
  assert.ok(close(out.total, 1), `${profile}: probabilities sum to 1`);
  return out;
}

const constantRail = (level, readiness) => ({ byRound: [level, level, level, level], readiness });
const STRATEGIES = {
  passive: { label: 'PPS bez udziału', cfg: {} },
  neutral_protection: { label: 'Neutralność, Milicja chroni własnych ludzi', cfg: { stance: 'neutral' } },
  support_rail: { label: 'Poparcie Piłsudskiego + silny strajk (80/100)', cfg: { stance: 'pils', rail: constantRail(80, 100) } },
  support_rail_weak: { label: 'Poparcie Piłsudskiego + słabszy strajk (45/60)', cfg: { stance: 'pils', rail: constantRail(45, 60) } },
  support_militia: { label: 'Poparcie Piłsudskiego + Milicja 6 F', cfg: { stance: 'pils', militiaF: 6 } },
  defend_militia_small: { label: 'Obrona rządu + Milicja 1 F', cfg: { stance: 'legal', militiaF: 1 } },
  defend_as: { label: 'Obrona rządu + AS 6 F', cfg: { stance: 'legal', militiaF: 6 } },
  defend_rail: { label: 'Obrona rządu + strajk (80/100)', cfg: { stance: 'legal', rail: constantRail(80, 100) } },
};
const DEMOCRACY = [30, 45, 60, 75];

const results = {};
for (const profile of Object.keys(PROFILES)) {
  results[profile] = { capacity: capacity(profile), runs: {} };
  for (const [id, s] of Object.entries(STRATEGIES)) for (const democracy of DEMOCRACY) for (const f9 of ['accept', 'reject']) {
    results[profile].runs[`${id}|${democracy}|${f9}`] = enumerate(profile, { ...s.cfg, democracy, f9 });
  }
}

// Determinism: the same inputs give the same result.
assert.deepEqual(enumerate('synthetic_test_v2', { stance: 'pils', rail: constantRail(80, 100), democracy: 60, f9: 'accept' }),
  results.synthetic_test_v2.runs['support_rail|60|accept']);
// Capacity gate unchanged by the loyalty update.
assert.ok(results.synthetic_test_v1.capacity >= 30 && results.synthetic_test_v2.capacity >= 30);

// Fixed-side checks from the worked example: capital garrisons loyal, near reserve with Pilsudski,
// remote reserve with the government.
const example = ['legal', 'pils', 'pils', 'legal'];
const noStrike = resolve(example, { democracy: 75 });
const oneDelay = resolve(example, { stance: 'pils', rail: constantRail(45, 60), democracy: 75, f9: 'accept' });
const twoDelays = resolve(example, { stance: 'pils', rail: constantRail(80, 100), democracy: 75, f9: 'accept' });
assert.ok(!noStrike.outcome.endsWith('_victory'), 'arriving reserve prevents an early military decision');
assert.ok(noStrike.log.every(x => x.round !== 2 || x.streak.pils === 0), 'reserve due next round counts at round 2');
assert.equal(oneDelay.outcome, 'pils_victory'); assert.equal(oneDelay.round, 2);
assert.equal(twoDelays.outcome, 'pils_victory'); assert.equal(twoDelays.round, 2);
assert.equal(noStrike.outcome, 'constitutional_compromise');
const lowTrust = resolve(example, { democracy: 30 });
assert.equal(lowTrust.outcome, 'prolonged_conflict');
// Strike measured in the round before arrival: exhausted fund after round 1 releases the train.
const fadingStrike = resolve(example, { stance: 'pils', rail: { byRound: [80, 30, 30, 30], readiness: 100 }, democracy: 75, f9: 'accept' });
assert.ok(!fadingStrike.outcome.endsWith('_victory') || fadingStrike.round > 2);
// Crushing superiority ends the fight after round 1.
const crushing = resolve(['neutral', 'pils', 'pils', 'legal'], { democracy: 75 });
assert.equal(crushing.outcome, 'pils_victory'); assert.equal(crushing.round, 1); assert.ok(crushing.crushing);
// Zero forces on both sides: no military victory.
const empty = resolve(['neutral', 'neutral', 'neutral', 'neutral'], { democracy: 75 });
assert.ok(!empty.outcome.endsWith('_victory'));
// Significant participation gates F9; rejection closes every later settlement, including the final assessment.
const defendAccept = resolve(example, { stance: 'legal', militiaF: 6, democracy: 75, f9: 'accept' });
const defendReject = resolve(example, { stance: 'legal', militiaF: 6, democracy: 75, f9: 'reject' });
const smallMilitia = resolve(example, { stance: 'legal', militiaF: 1, democracy: 75, f9: 'reject' });
assert.ok(defendAccept.f9 && defendAccept.outcome === 'constitutional_compromise');
assert.ok(defendReject.f9 && defendReject.f9.response === 'rejected' && defendReject.outcome !== 'constitutional_compromise');
assert.equal(smallMilitia.f9, null, 'insignificant PPS has no F9 and cannot block the settlement');
assert.equal(smallMilitia.outcome, 'constitutional_compromise');
// Counterfactual contribution of the strike in the worked example.
assert.equal(contribution(example, { stance: 'pils', rail: constantRail(80, 100), democracy: 75, f9: 'accept' }, twoDelays), 'decisive');

const pct = v => `${(100 * (v || 0)).toFixed(1)}%`;
const row = (profile, id, democracy, f9 = 'accept') => {
  const r = results[profile].runs[`${id}|${democracy}|${f9}`];
  return {
    pils: pct(r.outcomes.pils_victory), legal: pct(r.outcomes.legal_victory),
    compromise: pct(r.outcomes.constitutional_compromise), prolonged: pct(r.outcomes.prolonged_conflict),
    f9: pct(r.f9), meanRounds: Number(r.rounds.toFixed(2)),
    victoriesWithin2Rounds: pct((r.victoriesByRound[1] || 0) + (r.victoriesByRound[2] || 0)),
    victories: pct((r.outcomes.pils_victory || 0) + (r.outcomes.legal_victory || 0)),
    supportedWins: pct(r.supportedWins), decisiveWins: pct(r.concessions),
  };
};
const summary = {};
for (const profile of Object.keys(PROFILES)) for (const id of Object.keys(STRATEGIES)) for (const d of DEMOCRACY) {
  summary[`${profile}|${id}|${d}`] = { accept: row(profile, id, d, 'accept'), reject: row(profile, id, d, 'reject') };
}

// Shared with later diagnostics (M10) that reuse the enumeration.
module.exports = { GROUPS, PROFILES, capacity, enumerate, constantRail, STRATEGIES };

// Written output only when run directly.
if (require.main === module) {
  const sources = ['docs/POLISH_TECHNICAL_REFERENCE.md', 'docs/POLISH_DESCRIPTIVE_GUIDE.md', 'docs/POLISH_MECHANICS_AUDIT.md'];
  const hashes = Object.fromEntries(sources.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
  fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({
    scope: 'Exact enumeration of 81 synthetic allegiance outcomes for coup_f_v1 (technical reference 16.8). Not a campaign run, not historical forces.',
    hashes,
    offers: OFFERS.map(o => ({ id: o.id, acceptability: o.acc })),
    capacity: { synthetic_test_v1: results.synthetic_test_v1.capacity, synthetic_test_v2: results.synthetic_test_v2.capacity },
    workedExample: { sides: example, noStrike, oneDelay, twoDelays, lowTrust, crushing },
    summary,
  }, null, 2) + '\n');

  console.log('PASS: offer acceptability, probability sums, determinism, capacity gate, worked example, crushing win, zero forces, F9 gate/rejection and counterfactual checks.');
  console.log(`Capacity v1 ${results.synthetic_test_v1.capacity.toFixed(2)} / v2 ${results.synthetic_test_v2.capacity.toFixed(2)} (gate 30).`);
  for (const profile of Object.keys(PROFILES)) for (const d of [45, 60, 75]) {
    console.log(`\n${profile}, democracy ${d}`);
    for (const [id, s] of Object.entries(STRATEGIES)) {
      const a = summary[`${profile}|${id}|${d}`].accept, r = summary[`${profile}|${id}|${d}`].reject;
      console.log(`  ${s.label.padEnd(46)} P ${a.pils} L ${a.legal} K ${a.compromise} B ${a.prolonged} | rounds ${a.meanRounds} | wins<=2 ${a.victoriesWithin2Rounds} | F9 ${a.f9} | decisive ${a.decisiveWins}/${a.supportedWins} | reject: K ${r.compromise} B ${r.prolonged}`);
    }
  }
}
