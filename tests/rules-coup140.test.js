'use strict';

// The coup in 1926–1927 and the end of chapter I at its outbreak (Z — 1.40, the user's decisions Z1–Z4 of 28 XI 2026): at the beginning
// of 1926 the cabinet falls and the right returns, unless PPS keeps it alive; the chapter ends with its balance when the coup breaks
// out, and the coup opens chapter II, which ends with the page of what follows.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const dendry = require('./helpers/dendry');
const strategies = require('./helpers/strategies');

const plain = c => (c == null ? '' : typeof c === 'string' ? c : Array.isArray(c) ? c.map(plain).join('') : plain(c.content));
const page = engine => engine.ui.paragraphs.map(p => plain(p.content)).join(' ');
const ids = engine => (engine.getCurrentChoices() || []).filter(c => c.canChoose !== false).map(c => c.id);
const T = (y, m) => PolishRules.timeOf(y, m);

function at1926(engine) {
  const Q = engine.state.qualities;
  Q.time = T(1926, 1); Q.year = 1926; Q.month = 1;
  return Q;
}

test('Powrót prawicy 1.40: at the beginning of 1926 the cabinet falls without the support of PPS; it stays when PPS tolerates it or the right governs', () => {
  const kept = at1926(dendry.startGame()), K = kept.S;
  assert.equal(PolishGovernment.ppsStance(K), 'supporter');
  assert.deepEqual([PolishPolitics.scanCabinetFall1926(kept).kind, K.cabinet.status], ['cabinet_kept', 'active'], 'a tolerated cabinet stays');
  const right = at1926(dendry.startGame()), R = right.S;
  R.cabinet.configuration_id = 'chjeno_piast';
  R.cabinet.supporter_ids = R.cabinet.supporter_ids.filter(id => id !== 'pps');
  assert.equal(PolishPolitics.scanCabinetFall1926(right).reason, 'right_in_power');
  const fall = at1926(dendry.startGame()), F = fall.S;
  F.cabinet.supporter_ids = F.cabinet.supporter_ids.filter(id => id !== 'pps');
  const episode = PolishPolitics.scanCabinetFall1926(fall);
  assert.equal(episode.kind, 'cabinet_resignation');
  assert.notEqual(F.cabinet.status, 'active', 'the cabinet has resigned');
  assert.equal(PolishPolitics.scanCabinetFall1926(fall), null, 'once');
  PolishRules.setLanguage('pl');
  try {
    assert.equal(PolishPolitics.crisisNote(fall), 'Bez poparcia PPS gabinet stracił większość i podał się do dymisji; prawica i PSL „Piast” są gotowe znów rządzić.');
  } finally {
    PolishRules.setLanguage('en');
  }
  // Witos has his window from the beginning of 1926.
  assert.ok(PolishGovernment.CANDIDATES.witos.windows.some(w => w[0] === 1926 && w[1] === 1));
});

test('Koniec rozdziału 1.40: the chapter ends with its balance at the outbreak; the balance opens chapter II with the coup', () => {
  // The passive PPS of the reference runs: Witos governs from 1924, so the preparations start in I 1926 and the coup breaks out in IV.
  const run = strategies.runCampaign('N_A', 1922, { chapterTwo: false });
  const engine = run.engine;
  const Q = engine.state.qualities, S = Q.S;
  assert.equal(S.coup.phase, 'attempt_declared', 'the chapter ended before the coup was played');
  assert.deepEqual([S.coup.countdown.trigger, S.coup.attempt.declared_at], ['right_coalition', T(1926, 4)]);
  assert.equal(engine.state.sceneId, 'polish_chapter_report');
  assert.equal(PolishInstitutions.route(Q), 'report');
  assert.deepEqual([S.chapter.status, S.chapter.reason, S.chapter.trigger_id], ['ended', 'coup', S.coup.attempt_id]);
  assert.equal(S.chapter.report.state.turning_point.outcome, null, 'the balance is written at the outbreak');
  // The achievements of the end: a chapter that ends with a coup is no chapter without a coup.
  PolishTopbar.goalsView(Q);
  assert.ok(!Object.keys(S.achievements.earned).includes('no_coup'));
  assert.equal(Q.pl_report_ending, '', 'the turning point names the outbreak; the ending comes in chapter II');
  assert.equal(Q.pl_verdict_republic, 'Facing a coup');
  engine.goToScene('polish_chapter_report');
  assert.match(page(engine), /Turning point\. In April 1926 units loyal to Piłsudski marched on Warsaw: the coup has broken out\. The first chapter ends here, and the coup opens the second\./);
  assert.match(page(engine), /The second chapter begins with the coup itself\./);
  assert.ok(ids(engine).includes('polish_chapter_report.chapter2'));
  dendry.choose(engine, 'polish_chapter_report.chapter2');
  assert.equal(engine.state.sceneId, 'polish_event_coup.f3', 'chapter II opens with the coup');
  // The coup is played to its outcome; the page of what follows gives the ending of 1.35 and the achievements of the coup.
  dendry.choose(engine, 'polish_event_coup.begin');
  dendry.choose(engine, 'polish_event_coup.defend_legal');
  dendry.choose(engine, 'polish_event_coup.commit_none');
  assert.equal(engine.state.sceneId, 'polish_event_coup.f10');
  dendry.choose(engine, 'polish_event_coup.epilogue');
  const text = page(engine);
  assert.match(text, /What follows/);
  assert.match(text, /We stood up for the government, but only in words\./);
  assert.doesNotMatch(text, /We end the chapter/, 'no line of the end of chapter I');
  assert.match(text, /The second chapter, the Republic after the coup, is in preparation\./);
  // The balance of chapter I read again still describes the outbreak.
  dendry.choose(engine, 'polish_chapter_report');
  assert.match(page(engine), /the coup has broken out/);
  assert.equal(Q.pl_report_ending, '', 'the balance of chapter I still describes the outbreak');
  assert.equal(Q.pl_verdict_republic, 'Facing a coup');
});
