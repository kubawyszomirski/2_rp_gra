'use strict';

// The achievements of chapter I (Z — 1.36, the user's decisions of 25 XI 2026): twenty achievements read from the state of
// the game, named on the month page in the month they are earned (D2A), listed in the balance of the chapter, shown in the
// Library and kept in the browser for the page of the start menu (D4A); the German achievements left the start menu.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const dendry = require('./helpers/dendry');

function game() {
  return dendry.startGame().state.qualities;
}
function free(Q) {
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  Q.month_actions = 0;
}
// A centre-left cabinet with PPS formed in January 1922, in a fixture Sejm in which PPS carries its laws.
function formed(keepSeats) {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.S.parliament.clubs.find(c => c.id === 'pps').seats += 215;
  Q.S.parliament.clubs.find(c => c.id === 'other').seats -= 215;
  for (const [id, value] of Object.entries({ psl_piast: 60, npr: 60, psl_wyzwolenie: 70 })) {
    PolishGovernment.changeRelation(Q, id, value - Q.S.actors.relations[id], 'fixture');
  }
  PolishGovernment.openCrisis(Q, 'cabinet_fall', Q.S.cabinet.id);
  Q.S.cabinet.status = 'caretaker';
  engine.goToScene('post_event');
  dendry.formCabinet(engine, { configuration: 'centre_left', mode: 'member', candidate: 'thugutt', claim: ['economic'] });
  free(Q);
  if (!keepSeats) {
    Q.S.parliament.clubs.find(c => c.id === 'pps').seats -= 215;
    Q.S.parliament.clubs.find(c => c.id === 'other').seats += 215;
  }
  // The month pages of the formation already read the achievements; each test starts from none.
  delete Q.S.achievements;
  return Q;
}
// A month later, without the settlement: the achievements are read from the state as it stands.
function nextMonth(Q) {
  Q.time += 1; Q.year = PolishRules.yearOf(Q.time); Q.month = PolishRules.monthOf(Q.time);
}
const earned = Q => Object.keys((Q.S.achievements || { earned: {} }).earned).sort();
// A stand-in for the browser's storage; `broken` throws as a blocked storage does.
function fakeStorage(broken) {
  const data = {};
  return {
    data,
    getItem: key => { if (broken) throw new Error('blocked'); return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null; },
    setItem: (key, value) => { if (broken) throw new Error('blocked'); data[key] = String(value); },
  };
}

test('Osiągnięcia 1.36: twenty achievements in four groups, each with a name and a sentence in both languages; none at the opening', () => {
  const Q = game();
  const list = PolishTopbar.ACHIEVEMENTS;
  assert.equal(list.length, 20);
  assert.equal(new Set(list.map(a => a.id)).size, 20);
  for (const a of list) {
    assert.ok(a.name[0] && a.name[1] && a.desc[0] && a.desc[1], a.id);
    assert.match(a.desc[1], /\.$/, a.id + ': a full sentence');
  }
  assert.deepEqual(list.filter(a => a.end).map(a => a.id), ['no_coup', 'deterred', 'credible', 'no_split'], 'read only at the end of the chapter');
  assert.equal(PolishTopbar.achievementsMonth(Q), '');
  assert.deepEqual(earned(Q), []);
  PolishTopbar.achievementsPage(Q, 'game');
  assert.equal((Q.pl_ach_page.match(/■/g) || []).length, 0);
  assert.equal((Q.pl_ach_page.match(/□/g) || []).length, 20);
  assert.equal(Q.pl_ach_count, 'In this game: 0 of 20; in all games: 0.');
});

test('Osiągnięcia 1.36: ministers of PPS in a cabinet give “In the cabinet” on the month page of that month only', () => {
  const Q = formed();
  assert.equal(Q.S.cabinet.pps_mode, 'member');
  assert.equal(PolishTopbar.achievementsMonth(Q), '<strong>Achievement:</strong> “In the cabinet”. Ministers of PPS sit in a cabinet.');
  assert.deepEqual(earned(Q), ['cabinet'], 'not a premier of PPS and not a cabinet of the left');
  assert.equal(Q.S.achievements.earned.cabinet, Q.time);
  nextMonth(Q);
  assert.equal(PolishTopbar.achievementsMonth(Q), '', 'named once, in its month');
  // A cabinet of the left with a premier of PPS: two at once, named together.
  Q.S.cabinet.configuration_id = 'left_minority';
  Q.S.cabinet.party = 'pps';
  assert.equal(PolishTopbar.achievementsMonth(Q), '<strong>Achievements:</strong> “A premier of PPS”, “A cabinet of the left”.');
  // Polish.
  PolishRules.setLanguage('pl');
  try {
    PolishTopbar.goalsView(Q);
    assert.equal(PolishTopbar.achievementsMonth(Q), '<strong>Osiągnięcia:</strong> „Premier z PPS”, „Rząd lewicy”.');
    assert.equal(PolishTopbar.achievementsReport(Q), '„W rządzie”, „Premier z PPS”, „Rząd lewicy”.');
  } finally {
    PolishRules.setLanguage('en');
  }
});

test('Osiągnięcia 1.36: a reform of PPS in force gives “From words to deeds” and “Guarding the eight hours”', () => {
  const Q = formed(true);
  const S = Q.S;
  S.cabinet.portfolios.labor = 'pps';
  PolishProjects.chooseOption(Q, 'labor_rights', 'inspection');
  free(Q);
  const inspection = Object.values(S.projects).find(p => p.type === 'labor_inspection');
  assert.ok(inspection && inspection.authorized);
  assert.deepEqual(PolishProjects.ppsReforms(S).map(r => r.key), ['labor_inspection']);
  PolishTopbar.achievementsMonth(Q);
  assert.deepEqual(earned(Q), ['cabinet', 'eight_hours', 'fifty_mps', 'first_reform'], 'the fixture Sejm gives PPS 250 deputies');
  assert.ok(!earned(Q).includes('three_reforms'));
});

test('Osiągnięcia 1.36: the Republic, the coup and the party — read from the state as it stands', () => {
  const Q = game();
  const S = Q.S;
  S.coup.outcome = 'legal_victory';
  S.coup.attempt = { resolution: { fighting: true, strike: 0.12 } };
  S.militia.stage = 2;
  S.actors.pps.credibility = 80;
  S.parliament.clubs.find(c => c.id === 'pps').seats = 50;
  PolishTopbar.achievementsMonth(Q);
  assert.deepEqual(earned(Q), ['fifty_mps', 'republic_defended', 'socialist_action', 'trains_stopped'], 'credibility counts only at the end');
  // A strike counts when it began and won an agreement or a concession of the government.
  const R = game();
  R.S.strikes.records.x = { id: 'x', started_at: null, outcome: 'agreement' };
  PolishTopbar.achievementsMonth(R);
  assert.ok(!earned(R).includes('strike_won'), 'an agreement before any strike is no strike won');
  R.S.strikes.records.y = { id: 'y', started_at: 5, outcome: 'government_concession' };
  PolishTopbar.achievementsMonth(R);
  assert.ok(earned(R).includes('strike_won'));
  // With Piłsudski: backed and won; a weak strike in the fighting is no stopped trains.
  const P = game();
  P.S.coup.stance = 'support_pils';
  P.S.coup.outcome = 'pils_victory';
  P.S.coup.attempt = { resolution: { fighting: true, strike: 0.05 } };
  PolishTopbar.achievementsMonth(P);
  assert.deepEqual(earned(P), ['with_pilsudski']);
});

test('Osiągnięcia 1.36: the end of the chapter — no coup, Piłsudski deterred, a credible party, no split; the balance lists them', () => {
  const Q = game();
  const S = Q.S;
  S.coup.deterred_at = 40;
  S.actors.pps.credibility = 75;
  PolishTopbar.achievementsMonth(Q);
  assert.deepEqual(earned(Q), [], 'nothing of the end before the end');
  S.chapter.status = 'ended';
  PolishTopbar.goalsView(Q);
  assert.equal(Q.pl_report_achievements, '“No coup”, “Piłsudski did not dare”, “A credible party”, “No split”.');
  // A split, a coup and a lower credibility: none of these.
  const R = game();
  R.S.history.reasons.push({ t: 10, kind: 'faction_departure', departure: 'split' });
  R.S.coup.outcome = 'pils_victory';
  R.S.actors.pps.credibility = 74;
  R.S.chapter.status = 'ended';
  PolishTopbar.goalsView(R);
  assert.equal(R.pl_report_achievements, 'None in this chapter.');
});

test('Osiągnięcia 1.36: the browser keeps every achievement ever earned for the start menu; a blocked storage changes nothing in the game', () => {
  const saved = globalThis.window;
  try {
    const store = fakeStorage(false);
    const Q = formed();
    globalThis.window = Object.assign({}, saved, { localStorage: store });
    PolishTopbar.achievementsMonth(Q);
    assert.deepEqual(JSON.parse(store.data['pps.achievements']), ['cabinet']);
    // A later game adds to the list; the page of the start menu, without a game, marks all of them.
    const R = game();
    globalThis.window = Object.assign({}, globalThis.window, { localStorage: store });
    R.S.militia.stage = 2;
    PolishTopbar.achievementsMonth(R);
    assert.deepEqual(JSON.parse(store.data['pps.achievements']), ['cabinet', 'socialist_action']);
    const menu = {};
    PolishTopbar.achievementsPage(menu, 'all');
    assert.equal(menu.pl_ach_count, 'Earned: 2 of 20.');
    assert.equal((menu.pl_ach_page.match(/■/g) || []).length, 2);
    assert.match(menu.pl_ach_page, /■ <strong>In the cabinet\.<\/strong> Ministers of PPS sit in a cabinet\./);
    assert.match(menu.pl_ach_page, /^<em>Power<\/em><br>/);
    // In the Library of the second game only its own achievement is marked.
    PolishTopbar.achievementsPage(R, 'game');
    assert.equal(R.pl_ach_count, 'In this game: 1 of 20; in all games: 2.');
    // A game loaded from a save: what it earned before reaches the browser at the next check.
    const L = game();
    globalThis.window = Object.assign({}, globalThis.window, { localStorage: store });
    L.S.achievements = { earned: { premier: 30 } };
    PolishTopbar.achievementsMonth(L);
    assert.deepEqual(JSON.parse(store.data['pps.achievements']), ['cabinet', 'premier', 'socialist_action']);
    // A blocked storage: the game keeps its own achievements and the page still shows.
    globalThis.window = Object.assign({}, saved, { localStorage: fakeStorage(true) });
    const B = formed();
    assert.match(PolishTopbar.achievementsMonth(B), /In the cabinet/);
    PolishTopbar.achievementsPage(B, 'all');
    assert.equal(B.pl_ach_count, 'Earned: 1 of 20.');
  } finally {
    globalThis.window = saved;
  }
});

test('Osiągnięcia 1.36: the start menu opens the Polish achievements, the Library has the page and the balance a line', () => {
  const root = fs.readFileSync(path.join(__dirname, '..', 'source/scenes/root.scene.dry'), 'utf8');
  assert.ok(!root.includes('@game_over.achievements'), 'the German achievements left the start menu');
  assert.match(root, /- @achievements_pl\n/);
  assert.match(root, /PolishTopbar\.achievementsPage\(Q, 'all'\)/);
  const library = fs.readFileSync(path.join(__dirname, '..', 'source/scenes/library.scene.dry'), 'utf8');
  assert.match(library, /- @achievements: Achievements\n/);
  assert.match(library, /PolishTopbar\.achievementsPage\(Q, 'game'\)/);
  const report = fs.readFileSync(path.join(__dirname, '..', 'source/scenes/polish_chapter_report.scene.dry'), 'utf8');
  assert.match(report, /\*\*Achievements\.\*\* \[\+ pl_report_achievements \+\]/);
  // The month page of the game names the achievement of its month.
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.S.militia.stage = 2;
  engine.goToScene('main');
  assert.match(Q.pl_achievement_notices, /Akcja Socjalistyczna/);
});
