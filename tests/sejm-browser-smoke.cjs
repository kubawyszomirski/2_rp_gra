// Optional browser check; no dependency is installed or added to the game.
// Run npm run serve, then:
// node tests/sejm-browser-smoke.cjs /path/to/installed/playwright [baseURL]
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require(process.argv[2] || 'playwright');

(async () => {
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  const page = await browser.newPage({viewport: {width: 1280, height: 1000}});
  const errors = [];
  const failedRequests = [];
  page.on('pageerror', error => errors.push(error.stack || String(error)));
  page.on('console', message => { if (message.text().startsWith('Error in')) errors.push(message.text()); });
  page.on('response', response => {
    if (response.status() >= 400) failedRequests.push({url: response.url(), status: response.status()});
  });
  const url = process.argv[3] || 'http://127.0.0.1:8000';
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sejm-election-smoke-'));
  async function choose(id) {
    const index = await page.evaluate(id => window.dendryUI.dendryEngine.getCurrentChoices()
      .findIndex(choice => choice.id === id && choice.canChoose), id);
    assert.ok(index >= 0, `missing eligible browser choice: ${id}`);
    await page.locator(`#content a[data-choice="${index}"]`).click();
  }
  async function snapshot() {
    return page.evaluate(() => JSON.parse(JSON.stringify(window.dendryUI.dendryEngine.state.qualities)));
  }
  async function campaign() {
    // Deterministic eligible-card fixture: test the real choice/rendering path,
    // without depending on random draw order or fundraising strategy.
    await page.evaluate(() => {
      const engine = window.dendryUI.dendryEngine;
      engine.state.currentHands.main = [{id: 'campaigning', title: 'Campaigning'}];
      engine.playCard('campaigning');
    });
    await choose('campaigning.workers');
    await choose('root');
  }
  try {
    await page.goto(url);
    await page.getByRole('link', {name: 'Start game', exact: true}).click();
    await choose('root.1928_main');
    await page.evaluate(() => { window.dendryUI.dendryEngine.state.qualities.resources = 100; });
    const opening = (await snapshot()).sejm_parliament;
    for (let i = 0; i < 10; i++) {
      await campaign();
      assert.deepEqual((await snapshot()).sejm_parliament, opening);
    }
    assert.equal(await page.evaluate(() => window.dendryUI.dendryEngine.state.sceneId), 'sejm_election');
    await choose('sejm_election.calculate');
    const result = await snapshot();
    assert.equal(result.month, 11);
    assert.equal(result.n_elections, 1);
    assert.equal(result.sejm_results.length, 1);
    assert.equal(Object.values(result.sejm_results[0].party_seats).reduce((a, b) => a + b, 0), 444);
    assert.match(await page.locator('#content').innerText(), /ChZJN/);
    assert.match(await page.locator('#content').innerText(), /223 MPs/);
    assert.match(await page.locator('#qualities').innerText(), /ChZJN/);
    await page.screenshot({path: path.join(directory, 'results.png'), fullPage: true});

    const saved = await page.evaluate(() => JSON.parse(JSON.stringify(window.dendryUI.dendryEngine.getExportableState())));
    await page.reload();
    await page.evaluate(saved => window.dendryUI.dendryEngine.setState(saved), saved);
    assert.deepEqual((await snapshot()).sejm_results, result.sejm_results);
    await page.locator('#stats-link').click();
    await choose('library.figures');
    await page.waitForFunction(() => document.querySelectorAll('#reichstag circle.seat').length === 444);
    // Appending 444 nodes is not enough: wait for the entrance animation and
    // assert that each actual rendered seat has finite coordinates and a radius.
    await page.waitForFunction(() => [...document.querySelectorAll('#reichstag circle.seat')].every(seat =>
      !seat.__transition && Number(seat.getAttribute('r')) > 0 &&
      Number.isFinite(Number(seat.getAttribute('cx'))) && Number.isFinite(Number(seat.getAttribute('cy')))));
    const chart = await page.evaluate(() => {
      const Q = window.dendryUI.dendryEngine.state.qualities;
      return Q.sejm_display_rows.map(row => ({id: row.id, expected: row.seats,
        actual: document.querySelectorAll('#reichstag .seat.' + row.id).length}));
    });
    assert.ok(chart.every(row => row.actual === row.expected));
    assert.equal(await page.locator('#reichstag .seat.zln, #reichstag .seat.pschd').count(), 0);
    assert.equal(await page.locator('#election_history tbody tr').count(), 8);
    assert.match(await page.locator('#election_history').innerText(), /Votes %/);
    assert.match(await page.locator('#election_history').innerText(), /ChZJN/);
    await page.locator('#reichstag').scrollIntoViewIfNeeded();
    await page.screenshot({path: path.join(directory, 'parliament.png')});
    await choose('library.public_opinion');
    assert.match(await page.locator('#content').innerText(), /Voting intentions/);
    await page.locator('#stats-link').click();
    await choose('election_1928.polish_opposition');
    await choose('root');
    assert.equal((await snapshot()).month, 11);
    await campaign();
    assert.equal(await page.evaluate(() => window.dendryUI.dendryEngine.state.sceneId),
      'polish_presidential_sequence.first_nomination');
    assert.match(await page.locator('#content').innerText(), /National Assembly/);
    const firstChoices = await page.evaluate(() => window.dendryUI.dendryEngine.getCurrentChoices()
      .map(choice => ({id: choice.id, canChoose: choice.canChoose})));
    assert.equal(firstChoices.find(choice => choice.id === 'polish_presidential_sequence.decline_daszynski').canChoose, false);
    await choose('polish_presidential_sequence.confirm_daszynski');
    assert.match(await page.locator('#content').innerText(), /Gabriel Narutowicz — 289 votes/);
    assert.match(await page.locator('#content').innerText(), /Maurycy Zamoyski — 227 votes/);
    await choose('polish_presidential_sequence.first_transfer');
    await choose('polish_presidential_sequence.assassination');
    const responseChoices = await page.evaluate(() => window.dendryUI.dendryEngine.getCurrentChoices()
      .map(choice => ({id: choice.id, canChoose: choice.canChoose})));
    assert.equal(responseChoices.find(choice => choice.id === 'polish_presidential_sequence.armed_reprisals').canChoose, false);
    await choose('polish_presidential_sequence.constitutional_response');
    const secondChoices = await page.evaluate(() => window.dendryUI.dendryEngine.getCurrentChoices()
      .map(choice => ({id: choice.id, canChoose: choice.canChoose})));
    assert.equal(secondChoices.find(choice => choice.id === 'polish_presidential_sequence.run_daszynski_second').canChoose, false);
    await choose('polish_presidential_sequence.do_not_run_daszynski_second');
    assert.match(await page.locator('#content').innerText(), /Stanisław Wojciechowski — 298 votes/);
    assert.match(await page.locator('#content').innerText(), /Kazimierz Morawski — 221 votes/);
    await page.screenshot({path: path.join(directory, 'presidential-result.png'), fullPage: true});
    await choose('polish_presidential_sequence.finish');
    const after = await snapshot();
    assert.equal(after.month, 12);
    assert.equal(after.n_elections, 1);
    assert.deepEqual(after.sejm_results, result.sejm_results);
    assert.deepEqual(after.sejm_parliament, result.sejm_parliament);
    assert.equal(after.polish_presidential_sequence_completed, 1);
    assert.equal(after.polish_presidency.current.holder_id, 'stanislaw_wojciechowski');
    assert.equal(after.polish_presidency.assembly.total_members, 555);
    assert.equal(after.polish_presidency.elections.length, 2);
    assert.equal(after.president, '');
    assert.ok(errors.every(error => /toFixed.*\n\s+at window.onload[\s\S]*game\.js:325/.test(error) ||
      /NotSupportedError: Failed to load because no supported source was found/.test(error)),
      'no unexpected browser runtime errors: ' + JSON.stringify(errors));
    assert.ok(failedRequests.every(request => request.status === 404 && /\/(music\/|favicon\.ico)/.test(request.url)),
      'no unexpected missing assets: ' + JSON.stringify(failedRequests));
    console.log(JSON.stringify({passed: true, chart, screenshots: directory,
      checks: ['January–October campaign path', 'November results and sidebar', '444 chart dots and ChZJN grouping',
        'recorded vote/seat history', 'browser reload and save-state restore', 'government choice without month charge',
        'December presidential final ballots and disabled alternatives', '555-member Assembly snapshot',
        'Wojciechowski office state without legacy-president writes'], errors, failedRequests}, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
