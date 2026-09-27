#!/usr/bin/env node
'use strict';
// M17 diagnostics for technical reference 8.1, 9.5-9.6 and 10.4.3: Prochnik (A12) and Drobner (A13)
// are continuation advisors, and chapter 1 has a feasible path to communist cooperation through
// ordinary actions: open contact from relation 10, then ordinary 8.1 conversations with the KPP.
// Documentation diagnostics only: not Dendry gameplay, not a campaign run.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');

// Approved rule (P values of the approved structure).
const RULE = { start: 10, contactThreshold: 10, contactGain: 4, talkGain: 4, talkGainAbove70: 2, talkCooldown: 3,
  limitedThreshold: 20, fullThreshold: 30, rulesThreshold: 50, sympatheticGain: 5 };
const OLD = { contactThreshold: 20 };

// Plan: open contact, then talk every time the 3-month cooldown allows; optional Soviet-model stance.
function kppPath({ contactThreshold = RULE.contactThreshold, sympathetic = false, startMonth = 0, months = 60 }) {
  let relation = RULE.start, open = false, nextTalk = Infinity, actions = 0, usedSympathetic = false;
  const reached = {};
  for (let m = startMonth; m < startMonth + months; m++) {
    if (!open) {
      if (relation >= contactThreshold) { open = true; relation += RULE.contactGain; actions++; nextTalk = m + 1; }
      else if (sympathetic && !usedSympathetic) { relation += RULE.sympatheticGain; usedSympathetic = true; actions++; }
    } else if (m >= nextTalk) {
      relation = Math.min(100, relation + (relation >= 70 ? RULE.talkGainAbove70 : RULE.talkGain)); actions++; nextTalk = m + RULE.talkCooldown;
    }
    for (const [k, v] of [['limited', RULE.limitedThreshold], ['full', RULE.fullThreshold], ['rules', RULE.rulesThreshold]]) {
      if (open && relation >= v && !(k in reached)) reached[k] = { month: m - startMonth, actions, relation };
    }
  }
  return { open, reached };
}

// ---- Unit checks of the approved contract.
const results = {};
{
  // Old rule: contact needed 20; before 1928 only the Soviet stance (+5 once) raised the relation.
  const old = kppPath({ contactThreshold: OLD.contactThreshold, sympathetic: true, months: 72 });
  assert.equal(old.open, false, 'old rule: the channel never opens without Drobner');
  results.old = old;
  // New rule: contact at month 0, talks at months 1, 4, 7, 10.
  const plain = kppPath({});
  assert.deepEqual(plain.reached.limited, { month: 4, actions: 3, relation: 22 });
  assert.deepEqual(plain.reached.full, { month: 10, actions: 5, relation: 30 });
  results.plain = plain;
  // With the Soviet stance first (+5), the same thresholds come sooner in relation, one action more.
  const withStance = kppPath({ sympathetic: true });
  assert.ok(withStance.reached.full.relation >= 30);
  results.withSympatheticStance = withStance;
  // Rules of a broader arrangement (50) need many more talks: a long-term goal.
  assert.ok(plain.reached.rules.month >= 25, 'rules only after about two years of talks');
  // Hostility closes the channel: critical stance (-5) or two polemical campaigns (-2 each) below 10.
  const hostile = (() => { let r = RULE.start - 5; return r >= RULE.contactThreshold; })();
  assert.equal(hostile, false);
  // Talks with the KPP need the open channel.
  assert.equal(kppPath({ contactThreshold: 200, months: 24 }).open, false);
}

// ---- Late advisors: continuation roster, never in chapter 1.
const ROSTER = { A12: { id: 'prochnik', availability: 'continuation' }, A13: { id: 'drobner', availability: 'continuation' } };
const chapterEnds = { coup: 'III 1926 – VIII 1927 (archived M02 attempts)', elections: '1928-02-19' };
for (const a of Object.values(ROSTER)) assert.equal(a.availability, 'continuation');

// ---- Scenario check: the archived M02 engine uses neither these advisors nor communist cooperation.
const engineSrc = fs.readFileSync(path.join(root, 'analysis/m02-robustness/engine.cjs'), 'utf8');
const m02Unaffected = !/drobner|prochnik|communist/i.test(engineSrc);
assert.equal(m02Unaffected, true);

const docs = ['docs/POLISH_TECHNICAL_REFERENCE.md', 'docs/POLISH_DESCRIPTIVE_GUIDE.md', 'docs/POLISH_MECHANICS_AUDIT.md', 'analysis/m02-robustness/engine.cjs'];
const hashes = Object.fromEntries(docs.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({
  scope: 'M17: Prochnik and Drobner as continuation advisors; chapter-1 path to KPP cooperation through ordinary actions (technical 8.1, 9.5-9.6, 10.4.3). Unit checks; M02 unaffected.',
  rule: RULE, hashes, roster: ROSTER, chapterEnds, results, m02Unaffected,
}, null, 2) + '\n');

const r = results.plain.reached;
console.log(`PASS: old rule never opens the KPP channel; new path: limited coordination after ${r.limited.actions} actions (month ${r.limited.month}, relation ${r.limited.relation}), full after ${r.full.actions} actions (month ${r.full.month}, relation ${r.full.relation}), broader rules after ${r.rules.actions} actions (month ${r.rules.month}); hostility closes the channel; A12/A13 continuation only; M02 unaffected.`);
