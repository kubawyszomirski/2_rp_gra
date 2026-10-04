'use strict';
// Stage 8 of the implementation plan: whole campaigns played by the scripted PPS strategies of 17.16.7 and 21.2
// (tests/helpers/strategies.js). These tests check that the campaigns can be played; the measured balance is
// reported by analysis/stage8-campaigns/.
const test = require('node:test');
const assert = require('node:assert/strict');
const strategies = require('./helpers/strategies.js');

const quiet = fn => {
  const log = console.log;
  console.log = () => {};
  try { return fn(); } finally { console.log = log; }
};

test('Kampanie strategii: each of the 13 scripted strategies plays from January 1922 to one chapter report without getting stuck', () => {
  for (const id of Object.keys(strategies.STRATEGIES)) {
    const run = quiet(() => strategies.runCampaign(id, 8001));
    const S = run.engine.state.qualities.S;
    assert.equal(run.stuck, null, `${id} is not stuck`);
    assert.equal(S.chapter.status, 'ended', `${id} reaches the end of the chapter`);
    assert.ok(['coup', 'next_legal_election'].includes(S.chapter.reason), `${id} ends with a coup or the next election`);
    assert.equal(run.engine.state.sceneId, 'polish_chapter_report', `${id} shows the report`);
    assert.deepEqual(globalThis.PolishRules.validateState(S), [], `${id} leaves a valid state`);
  }
});

// Appendix D of the implementation plan (scenario_content, stage 8): no German card, adviser or event remains
// available in the Polish game. Polish scenes and the Polish advisers adapted in stage 5 are allowed.
const POLISH_ADVISERS = ['arciszewski', 'czapinski', 'daszynski', 'drobner', 'dubois', 'jaworowski', 'malinowski', 'moraczewski',
  'niedzialkowski', 'perl', 'prochnik', 'puzak', 'zaremba', 'ziemiecki'];
const DECK_TAGS = ['party_affairs', 'govt_affairs', 'parliament_affairs', 'advisor', 'event', 'pl_event'];
test('Izolacja talii: across whole campaigns of three strategies no German card, adviser or event is ever available in the Polish game', () => {
  const offered = new Set();
  for (const id of ['N_A', 'N_C', 'formal_coalition']) {
    quiet(() => strategies.runCampaign(id, 8001, {
      onMonth: engine => {
        for (const [sceneId, scene] of Object.entries(engine.game.scenes)) {
          if (sceneId.includes('.') || sceneId.startsWith('polish_') || POLISH_ADVISERS.includes(sceneId) || sceneId === 'inter_party_relationships') continue;
          if (!(scene.tags || []).some(tag => DECK_TAGS.includes(tag))) continue;
          if (!scene.viewIf || engine._runPredicate(scene.viewIf, true)) offered.add(sceneId + '@' + engine.state.qualities.time);
        }
      },
    }));
  }
  assert.deepEqual([...offered], []);
});
