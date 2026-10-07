'use strict';

// Z — 0.62 (audit of 7 X 2026): one failing display function in the routing scene polish_opening_state used to leave
// the route empty, and the game went on month after month without the cabinet crisis of 1922, the Sejm election, the
// presidency and the events. The routing flags now come first and every display part is guarded; a failure is logged
// in the engine's form, and the page shows a notice asking for a reload without the cache.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const dendry = require('./helpers/dendry.js');

const KEY = ['polish_event_cabinet_1922', 'sejm_election', 'polish_speaker_election', 'polish_presidential_sequence'];

// The real modules are frozen; a copy with one function that throws stands in for a stale or half-built file.
const breakFunction = (globalName, fn) => {
  globalThis[globalName] = Object.assign({}, globalThis[globalName], {
    [fn]: () => { throw new TypeError('simulated failure of ' + globalName + '.' + fn); },
  });
};

for (const [globalName, fn] of [['PolishGovernment', 'governmentDisplay'], ['PolishGovernment', 'agreementsDisplay'],
  ['PolishEconomy', 'economyDisplay'], ['PolishParty', 'partyDisplay']]) {
  test(`a failing ${globalName}.${fn} does not stop the cabinet crisis, the election and the presidency`, () => {
    const errors = dendry.watchEngineErrors();
    const engine = dendry.startGame(1922, 'pl');
    breakFunction(globalName, fn);
    const seen = {};
    const { engine: end } = dendry.walk(engine, { variant: 1, maxSteps: 1500, lastYear: 1923, onStep: e => {
      const id = e.state.sceneId.split('.')[0], Q = e.state.qualities;
      if (KEY.includes(id) && !seen[id]) seen[id] = Q.year + '-' + Q.month;
    }});
    assert.equal(seen.polish_event_cabinet_1922, '1922-6', 'the cabinet crisis of 1922');
    assert.equal(seen.sejm_election, '1922-11', 'the Sejm election of November 1922');
    assert.equal(seen.polish_speaker_election, '1922-12', 'the Marshal in December 1922');
    assert.equal(seen.polish_presidential_sequence, '1922-12', 'the presidency in December 1922');
    assert.ok(end.state.qualities.sejm_first_election_completed, 'the first election is recorded');
    assert.ok(errors.some(e => e.startsWith('Error: the routing scene could not prepare')), 'the failure is logged, not silent');
  });
}

test('the page shows one notice when a game script fails, and nothing outside a page', () => {
  const source = fs.readFileSync(path.join(dendry.ROOT, 'out', 'html', 'game.js'), 'utf8');
  // A minimal document: the notice is a div with a text and a close button, appended to the body.
  const appended = [];
  const element = tag => ({ tag, children: [], className: '', textContent: '', attributes: {},
    setAttribute(k, v) { this.attributes[k] = v; }, appendChild(c) { this.children.push(c); c.parentNode = this; },
    removeChild(c) { this.children = this.children.filter(x => x !== c); } });
  const body = element('body');
  body.appendChild = c => { appended.push(c); c.parentNode = body; };
  const logged = [];
  const sandbox = { window: { currentLanguage: 'pl' }, document: { body, createElement: element },
    console: { log(...a) { logged.push(a); } } };
  sandbox.window.addEventListener = () => {};
  vm.runInNewContext(source, sandbox);
  sandbox.window.currentLanguage = 'pl';
  const before = logged.length;
  sandbox.console.log('A note');
  assert.equal(appended.length, 0, 'an ordinary message shows nothing');
  sandbox.console.log('Error:', new TypeError('x'));
  sandbox.console.log('Error in expression', 'Q.x', ':', new TypeError('y'));
  assert.equal(appended.length, 1, 'one notice per page load');
  assert.equal(appended[0].className, 'pl-script-error');
  assert.match(appended[0].children[0].textContent, /Cmd\+Shift\+R/);
  assert.match(appended[0].children[0].textContent, /^Skrypt gry zgłosił błąd/);
  assert.equal(logged.length - before, 3, 'every message still reaches the console');
  // Outside a page (the Node test of the save check) there is no document: logging an error only logs it.
  const quiet = { window: {}, console: { log() {} } };
  vm.runInNewContext(source, quiet);
  assert.doesNotThrow(() => quiet.console.log('Error:', new TypeError('z')));
});
