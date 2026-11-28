'use strict';

// Z — 1.45 (decision U4 of 28 XI 2026): in a cabinet without the ministry a bill concerns, its card comes to the Parliament deck with
// another description — PPS proposes the bill to its partners, in its full or its limited version, and the cabinet files it when all of
// them agree; the clubs of the coalition then vote for it. While PPS holds the ministry, the bill goes through the ministry card and
// its card waits.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const dendry = require('./helpers/dendry');

function coalition(portfolios, lang) {
  const engine = dendry.startGame(1922, lang);
  const Q = engine.state.qualities;
  Q.sejm_first_election_completed = 1;
  Q.time = PolishRules.timeOf(1924, 1); Q.year = 1924; Q.month = 1;
  Object.assign(Q.S.cabinet, { pm: 'thugutt', pm_name: 'Stanisław Thugutt', party: 'psl_wyzwolenie', partner_ids: ['psl_wyzwolenie', 'pps', 'npr'],
    supporter_ids: [], pps_mode: 'member', status: 'active', portfolios: Object.assign({}, Q.S.cabinet.portfolios, portfolios) });
  Q.S.party_orgs.cash = 5;
  return { engine, Q };
}

test('Ustawa w rządzie 1.45 (U4): without the ministry PPS proposes the bill to its partners; a partner who would not agree closes the option with its name', () => {
  const { Q } = coalition({ labor: 'psl_wyzwolenie', finance: 'pps' }, 'pl');
  try {
    assert.equal(PolishProjects.billMode(Q, 'unemployment'), 'partners');
    assert.equal(PolishProjects.billMode(Q, 'progressive_tax'), 'ministry', 'the treasury is ours');
    Q.S.economy.unemployment = 6;
    PolishProjects.billWindows(Q, Q.time - 1);
    assert.equal(PolishProjects.billCardAvailable(Q, 'unemployment'), true);
    PolishProjects.billCardView(Q, 'unemployment');
    assert.match(Q.pl_bill_intro, /PPS jest w rządzie, ale resort pracy nie jest nasz: proponujemy tę ustawę partnerom z rządu, a gdy wszyscy się zgodzą, wniesie ją rząd i kluby koalicji zagłosują za\.$/);
    assert.deepEqual([Q.pl_bill_file_title, Q.pl_bill_limited_title, Q.pl_bill_limited_show], ['Proponujemy ustawę partnerom', 'Proponujemy wersję okrojoną', 1]);
    assert.match(Q.pl_bill_file_line, /^Koszt: 1 jednostka środków\. Pełna wersja: pełny zasiłek\. Dziś /);
    assert.match(Q.pl_bill_limited_line, /^Koszt: 1 jednostka środków\. Wersja okrojona: ograniczony zasiłek\. Dziś /);
    Q.S.actors.relations.npr = 0;
    const refused = PolishProjects.billFileStatus(Q, 'unemployment', 'file');
    assert.deepEqual([refused.available, refused.reason], [false, 'Partnerzy się nie zgodzą: odmawia Narodowa Partia Robotnicza.']);
  } finally {
    PolishRules.setLanguage('en');
  }
});

test('Ustawa w rządzie 1.45 (U4): with the partners’ consent the cabinet files the variant they agreed to, and the clubs of the coalition vote for it', () => {
  const { Q } = coalition({ labor: 'psl_wyzwolenie' });
  for (const id of ['psl_wyzwolenie', 'npr']) Q.S.actors.relations[id] = 90;
  Q.S.economy.unemployment = 6;
  PolishProjects.billWindows(Q, Q.time - 1);
  assert.deepEqual(PolishProjects.billRefusals(Q, 'unemployment', 1), []);
  const text = PolishProjects.billFile(Q, 'unemployment', 'limited');
  assert.match(text, /^Our partners agree, and the cabinet files the bill “Protection of the unemployed”; the Sejm votes on it next month\./);
  const pending = PolishProjects.initiativeState(Q.S).pending;
  assert.deepEqual([pending.sponsor, pending.index, pending.offer], ['cabinet', 1, 'limited']);
  Q.S.turn.pending = null; Q.month_actions = 0;
  Q.time += 1;
  const view = PolishProjects.initiativeVoteView(Q);
  assert.match(view.line, /^The Sejm (passes|rejects) the bill of the cabinet/);
  const votes = PolishProjects.initiativeCounts(Q, 'unemployment', 1, 'cabinet').club_votes;
  assert.deepEqual([votes.psl_wyzwolenie.vote, votes.npr.vote], ['yes', 'yes'], 'the coalition votes for the bill of its cabinet');
});

test('Ustawa w rządzie 1.45: while PPS holds the ministry the card waits, and it comes when PPS no longer holds it', () => {
  const { Q } = coalition({ finance: 'pps' });
  Q.S.economy.inflation_m = 30;
  Q.S.economy.history.push({ t: Q.time - 2, inflation_m: 30, budget: 1, credit: 50 }, { t: Q.time - 1, inflation_m: 30, budget: 1, credit: 50 });
  PolishProjects.billWindows(Q, Q.time - 1);
  assert.equal(PolishProjects.billCardAvailable(Q, 'progressive_tax'), false, 'the ministry card carries it');
  Q.S.cabinet.portfolios.finance = 'npr';
  PolishProjects.billWindows(Q, Q.time - 1);
  assert.equal(PolishProjects.billCardAvailable(Q, 'progressive_tax'), true, 'without the treasury the bill comes as a proposal to the partners');
  assert.equal(PolishProjects.billMode(Q, 'progressive_tax'), 'partners');
});
