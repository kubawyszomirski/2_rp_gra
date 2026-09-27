#!/usr/bin/env node
'use strict';
// M06 diagnostics for technical reference 7.1, 7.3, 7.5 and 4.5: a two-candidate final always has a
// winner (more candidate votes; abstentions and invalid ballots count for presence, not majority;
// an exact tie keeps the approved 50/50 lot), mandatory office elections always have quorum and at
// least two valid candidacies, and a safety net ends an unresolved sequence with a retry next month.
// Documentation diagnostics only: not Dendry gameplay, not a campaign run.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');

// Validation before any vote: at least two valid candidacies; all clubs attend (no boycott in chapter 1).
function validateProfile(profile) {
  const valid = profile.candidates.filter(c => c.valid);
  if (valid.length < 2) return { ok: false, error: 'profile_needs_two_valid_candidacies' };
  return { ok: true };
}
// Final of two: more votes for candidates wins; abstain/invalid only count for presence. Tie -> lot.
function resolveFinal({ a, b, abstain = 0, invalid = 0, members, quorum, roll }) {
  const present = members; // every club attends a mandatory office election
  assert.ok(a.votes + b.votes + abstain + invalid <= present);
  if (present < quorum) return { status: 'no_election', reason: 'quorum' }; // unreachable by construction
  if (a.votes === b.votes) {
    const [first, second] = [a, b].sort((x, y) => (x.id < y.id ? -1 : 1));
    return { status: 'elected', winner: roll < 0.5 ? first.id : second.id, tieBreak: { method: 'lot_50_50', roll } };
  }
  return { status: 'elected', winner: a.votes > b.votes ? a.id : b.id, tieBreak: null };
}
const oldFinal = ({ a, b, abstain = 0, invalid = 0 }) => {
  const valid = a.votes + b.votes + abstain; // test convention: abstentions in the denominator
  if (a.votes === b.votes) return 'lot';
  const best = a.votes > b.votes ? a : b;
  return best.votes > valid / 2 ? best.id : 'no_election';
};
// Safety net: an unresolved election closes the sequence, keeps the acting holder, returns a normal
// turn and schedules one automatic retry in the next month.
function safetyNet(state, t) {
  return { ...state, sequence: 'closed', status: 'no_election', holder: state.acting, normalTurn: true, retryAt: t + 1 };
}

// ---- Unit checks of the approved contract.
const cases = {};
{
  // Audit example: A 200, B 180, 60 abstentions in a Sejm of 444 (4 invalid).
  const ex = { a: { id: 'A', votes: 200 }, b: { id: 'B', votes: 180 }, abstain: 60, invalid: 4, members: 444, quorum: 148 };
  assert.equal(oldFinal(ex), 'no_election', 'the old rule left an impasse');
  const r = resolveFinal({ ...ex, roll: 0.3 });
  assert.equal(r.status, 'elected'); assert.equal(r.winner, 'A'); assert.equal(r.tieBreak, null);
  cases.abstentions = { before: oldFinal(ex), after: r.winner };
  // Exact tie keeps the 50/50 lot with a saved roll ordered by ID.
  const tie = { a: { id: 'rataj', votes: 210 }, b: { id: 'smiarowski', votes: 210 }, abstain: 20, members: 444, quorum: 148 };
  assert.equal(resolveFinal({ ...tie, roll: 0.49 }).winner, 'rataj');
  assert.equal(resolveFinal({ ...tie, roll: 0.50 }).winner, 'smiarowski');
  assert.deepEqual(resolveFinal({ ...tie, roll: 0.49 }), resolveFinal({ ...tie, roll: 0.49 }), 'same saved roll, same result');
  // National Assembly (Sejm + Senate, 555): the same final rule.
  assert.equal(resolveFinal({ a: { id: 'X', votes: 289 }, b: { id: 'Y', votes: 227 }, abstain: 30, invalid: 9, members: 555, quorum: 278, roll: 0.9 }).winner, 'X');
  // Quorum by construction: all clubs attend.
  assert.equal(resolveFinal({ a: { id: 'A', votes: 1 }, b: { id: 'B', votes: 0 }, abstain: 443, members: 444, quorum: 148, roll: 0 }).winner, 'A',
    'even a tiny vote decides once quorum is guaranteed');
  // Candidacies: a profile with fewer than two valid candidates is rejected before the vote.
  assert.deepEqual(validateProfile({ candidates: [{ id: 'A', valid: true }, { id: 'B', valid: false }] }), { ok: false, error: 'profile_needs_two_valid_candidacies' });
  assert.deepEqual(validateProfile({ candidates: [{ id: 'A', valid: true }, { id: 'B', valid: true }] }), { ok: true });
  // Safety net: sequence closed, acting holder stays, normal turn, retry next month.
  const net = safetyNet({ sequence: 'speaker_1922', acting: 'senior_member', holder: null }, 11);
  assert.deepEqual({ sequence: net.sequence, status: net.status, holder: net.holder, normalTurn: net.normalTurn, retryAt: net.retryAt },
    { sequence: 'closed', status: 'no_election', holder: 'senior_member', normalTurn: true, retryAt: 12 });
  // Exhaustive: every final of two over a grid (ties included) resolves with an elected winner.
  let finals = 0;
  for (let a = 0; a <= 444; a += 37) for (let b = 0; b + a <= 444; b += 41) for (const abstain of [0, 50, 150]) {
    if (a + b + abstain > 444) continue;
    const res = resolveFinal({ a: { id: 'A', votes: a }, b: { id: 'B', votes: b }, abstain, members: 444, quorum: 148, roll: 0.7 });
    assert.equal(res.status, 'elected'); finals++;
  }
  cases.gridFinalsResolved = finals;
}

// ---- Scenario check: the archived M02 engine scripts the 1922 presidency as a shared opening profile.
const engineSrc = fs.readFileSync(path.join(root, 'analysis/m02-robustness/engine.cjs'), 'utf8');
const m02Scripted = engineSrc.includes('prezydent z prawem powołania — kontrolowany wspólny profil') && !/no_election/.test(engineSrc);
assert.equal(m02Scripted, true, 'M02 has no office-election algorithm to change');

const docs = ['docs/POLISH_TECHNICAL_REFERENCE.md', 'docs/POLISH_DESCRIPTIVE_GUIDE.md', 'docs/POLISH_MECHANICS_AUDIT.md', 'analysis/m02-robustness/engine.cjs'];
const hashes = Object.fromEntries(docs.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({
  scope: 'M06: office-election finals always resolve (more candidate votes; tie by the approved 50/50 lot), guaranteed quorum and candidacies, safety net with a retry next month (technical 7.1, 7.3, 7.5, 4.5). Unit checks; M02 scripts the 1922 offices.',
  hashes, cases, m02Scripted,
}, null, 2) + '\n');

console.log(`PASS: A 200 / B 180 / 60 abstentions now elects A (old rule: ${cases.abstentions.before}); tie keeps the saved 50/50 lot; Assembly of 555 uses the same rule; quorum and two candidacies guaranteed; safety net closes the sequence with a retry next month; all ${cases.gridFinalsResolved} grid finals resolved, ties included; M02 unaffected.`);
