const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Z — 1.07 (the user's decisions of 7–8 XI 2026): the characteristics of the party; each working one changes other cards. Z — 1.41
// (decisions C1A, C2, C3B, C4A and D1A–D4A of 28 XI 2026): they work by themselves above a threshold, fade without matching decisions,
// lose to their opposites, at most three at once; an announced line feeds them every month; no congress. The views: the Party tab,
// the Overview, the Library, the report.
let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

function game(lang) {
  return dendry.startGame(1922, lang).state.qualities;
}
function free(Q) {
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  Q.month_actions = 0;
}
const R = () => globalThis.PolishRules, P = () => globalThis.PolishParty;
const plainText = x => (x == null ? '' : typeof x === 'string' ? x : Array.isArray(x) ? x.map(plainText).join('') : plainText(x.content));
// A working characteristic in a fixture: its indicator well above the threshold, so that no refresh drops it.
function work(Q, id) {
  R().profileState(Q.S).seeds[id] = 20;
  R().profileRefresh(Q, 'fixture');
}

test('Charakterystyka 1.41: decisions raise the indicator, the opposite loses half; it works from 10 and stops below 7; no congress', () => {
  const Q = game();
  const S = Q.S, f = S.actors.pps.factions;
  const state = R().profileState(S);
  assert.deepEqual(Object.keys(state.seeds), R().PROFILE_IDS);
  S.actors.pps.strategy.direction = 'parliamentary_socialism';
  assert.equal(R().seedProfile(Q, 'reformism', 2, 'fixture'), 2, 'no multiplier of the line any more');
  state.seeds.radicalism = 5;
  R().seedProfile(Q, 'reformism', 2, 'fixture');
  assert.deepEqual([state.seeds.reformism, state.seeds.radicalism], [4, 4], 'the opposite loses half of the gain');
  // The party's own decisions build it: building a union branch builds unionism.
  free(Q);
  S.party_orgs.cash = 5;
  P().organizationsChoose(Q, ['union_organize_industry'], 'party.union_investments');
  assert.equal(state.seeds.unionism, 2);
  for (const id of ['centrum', 'lewica', 'pilsudczycy']) f[id].dissent = 20;
  const centrum = f.centrum.strength;
  R().seedProfile(Q, 'unionism', 7.9, 'fixture');
  assert.equal(R().profileActive(S, 'unionism'), false, 'below the threshold');
  R().seedProfile(Q, 'unionism', 0.1, 'fixture');
  assert.equal(R().profileActive(S, 'unionism'), true, 'from the threshold it works at once');
  assert.ok(f.centrum.strength > centrum, 'the patron grows stronger');
  assert.equal(f.lewica.dissent, 25, 'the Left finds it too cautious (+5)');
  assert.deepEqual(state.changes.at(-1), { t: Q.time, id: 'unionism', on: true, cause: 'fixture' });
  state.seeds.unionism = 7.5;
  R().profileRefresh(Q);
  assert.equal(R().profileActive(S, 'unionism'), true, 'it keeps working down to 7');
  state.seeds.unionism = 6.9;
  R().profileRefresh(Q);
  assert.equal(R().profileActive(S, 'unionism'), false);
  assert.equal(state.dropped.at(-1).reason, 'faded');
  assert.equal(P().congressAvailable(Q), false, 'Z — 1.41 (decision D4A): no congress card');
});

test('Najwyżej trzy 1.41: of four above the threshold the three strongest work; of reformism and radicalism only the stronger', () => {
  const Q = game();
  const S = Q.S, seeds = R().profileState(S).seeds;
  Object.assign(seeds, { unionism: 15, federalism: 12, strike_action: 11, worker_peasant: 10.5 });
  R().profileRefresh(Q);
  assert.deepEqual(R().profileState(S).adopted.map(a => a.id).sort(), ['federalism', 'strike_action', 'unionism']);
  seeds.worker_peasant = 13;
  R().profileRefresh(Q);
  assert.deepEqual(R().profileState(S).adopted.map(a => a.id).sort(), ['federalism', 'unionism', 'worker_peasant']);
  assert.equal(R().profileState(S).dropped.at(-1).reason, 'crowded');
  const X = game(), xs = R().profileState(X.S).seeds;
  Object.assign(xs, { reformism: 12, radicalism: 14 });
  R().profileRefresh(X);
  assert.deepEqual(R().profileState(X.S).adopted.map(a => a.id), ['radicalism'], 'the stronger of the two');
});

test('Miesiąc 1.41: an indicator loses half in a year and a half; the opening line feeds nothing, an announced line feeds it every month', () => {
  const Q = game();
  const S = Q.S, seeds = R().profileState(S).seeds;
  seeds.federalism = 8;
  for (let i = 0; i < 18; i++) R().profileSettle(Q);
  assert.ok(Math.abs(seeds.federalism - 4) < 0.05, 'half in 18 months: ' + seeds.federalism);
  assert.deepEqual(R().profileLineFeeds(S), [], 'the opening line of 1922 feeds nothing');
  free(Q);
  P().stanceChoose(Q, 'direction', 'parliamentary_socialism'); // a confirmation announces it
  assert.deepEqual(R().profileLineFeeds(S), ['parliamentarism', 'reformism']);
  seeds.militarism = 5;
  R().profileSettle(Q);
  // The card Political direction builds two characteristics, so each takes half of the monthly feed (the user's decision of 28 XI 2026).
  assert.deepEqual([seeds.parliamentarism, seeds.reformism, seeds.militarism], [0.38, 0.38, 4.62], 'half each; the opposite fades and loses');
  for (let i = 0; i < 40; i++) R().profileSettle(Q);
  assert.ok(!R().profileActive(S, 'parliamentarism') && seeds.parliamentarism > 7, 'the direction alone stays below the threshold: ' + seeds.parliamentarism);
  // A card of one characteristic feeds it whole: the form of power alone reaches the threshold in about a year and a half.
  const F = game(), fs = R().profileState(F.S).seeds;
  free(F);
  P().stanceChoose(F, 'form_of_power', 'parliamentarism');
  for (let i = 0; i < 20; i++) R().profileSettle(F);
  assert.ok(R().profileActive(F.S, 'parliamentarism'), 'one characteristic, the whole feed: ' + fs.parliamentarism);
});

// Z — 1.33 (decisions D1B and D2A of 25 XI 2026): +40% when adopted (until 1.32 +25%), +60% after two years, no more in chapter I.
test('Skutki cech 1.07: unions, strikes, parliament, ministries, the Milicja and campaigns change with an adopted characteristic', () => {
  const Q = game();
  const S = Q.S, adopt = id => { R().profileState(S).seeds[id] = 20; R().profileState(S).adopted.push({ id, t: Q.time }); };
  // Unionism: a branch grows a quarter faster.
  free(Q); S.party_orgs.cash = 5;
  const reach0 = S.unions.rail.reach;
  P().organizationsChoose(Q, ['union_organize_rail'], 'party.union_investments');
  const plain = S.unions.rail.reach - reach0;
  adopt('unionism');
  Q.time += 6; free(Q); delete S.cooldowns['party.organizations']; S.party_orgs.cash = 5;
  for (const k of Object.keys(S.cooldowns)) if (/organi|union/.test(k)) delete S.cooldowns[k];
  const reach1 = S.unions.rail.reach;
  P().organizationsChoose(Q, ['union_organize_rail'], 'party.union_investments');
  assert.ok(Math.abs((S.unions.rail.reach - reach1) - Math.min(100 - reach1, plain * 1.4)) < 1e-6, 'unionism: +40% reach');
  // Campaigns: radicalism +40% among the workers and the unemployed, the alliance in the countryside, federalism among the minorities.
  const cell = c => S.society.cells.find(x => x.class_id === c);
  assert.equal(P().profileCampaignFactor(S, cell('workers')), 1);
  adopt('radicalism'); adopt('worker_peasant');
  assert.equal(P().profileCampaignFactor(S, cell('workers')), 1.4);
  assert.equal(P().profileCampaignFactor(S, cell('rural')), 1.4);
  // Two years later the alliance is strengthened (+60%); four years later it stays there in the first chapter.
  R().profileState(S).adopted.find(a => a.id === 'worker_peasant').t = S.turn.last_settled_time - 24;
  assert.equal(R().profileStage(S, 'worker_peasant'), 2);
  assert.equal(P().profileCampaignFactor(S, cell('rural')), 1.6);
  R().profileState(S).adopted.find(a => a.id === 'worker_peasant').t = S.turn.last_settled_time - 50;
  assert.equal(R().profileStage(S, 'worker_peasant'), 2, 'rooted only in chapter II');
  // Reformism: a programme of a PPS ministry that costs 2 or 3 costs one unit less; radicalism: the socialisation of the mines too.
  const PR = globalThis.PolishProjects;
  assert.deepEqual([PR.profilePrice(S, 'land_program', 2, 'pps'), PR.profilePrice(S, 'socialise_mining', 3, 'pps')], [2, 2]);
  adopt('reformism');
  assert.deepEqual([PR.profilePrice(S, 'land_program', 2, 'pps'), PR.profilePrice(S, 'land_program', 1, 'pps'), PR.profilePrice(S, 'land_program', 2, 'zln')], [1, 1, 2]);
  assert.equal(PR.profilePrice(S, 'socialise_mining', 3, 'pps'), 1, 'reformism and radicalism together only in a fixture');
  // Parliamentarism: a bill of our initiative has 16 points more of chance (10 until 1.32).
  const counts = { yes: 200, no: 200 };
  assert.equal(PR.initiativeChance(S, counts), 0.5);
  adopt('parliamentarism');
  assert.ok(Math.abs(PR.initiativeChance(S, counts) - 0.66) < 1e-9);
});

test('Linia partii 1.07: campaigns of the matching direction +25%; a cabinet against independent class politics angers the Left', () => {
  const Q = game();
  const S = Q.S;
  S.actors.pps.strategy.direction = 'class_independence';
  assert.equal(P().strategyFactor(Q, 'class'), 1.25);
  S.actors.pps.strategy.direction = 'democratic_movement';
  S.coup.pressure = 45;
  assert.equal(P().strategyFactor(Q, 'democracy'), 1.30);
});

test('Charakterystyka w grze 1.41: the Party tab shows eight bars with the mark of the threshold, the working ones first; the month page, the Overview, the Library and the report name them', () => {
  const engine = dendry.startGame(1922, 'pl');
  const Q = engine.state.qualities;
  const content = () => JSON.stringify(engine.ui.paragraphs);
  try {
    engine.goToScene('status');
    assert.match(content(), /Charakterystyka/);
    assert.match(Q.pl_profile_html, /pl-profile-count">Działają: 0 z 3</);
    // The cards of the line say what the present line builds; the top bar, which reads every card, does not overwrite it.
    globalThis.PolishTopbar.overviewView(Q);
    assert.equal(Q.pl_line_confirm_direction, 'Po potwierdzeniu co miesiąc rosną: parlamentaryzm i reformizm.');
    assert.equal(Q.pl_line_confirm_ussr_position, 'Potwierdzenie niczego nie zmienia.');
    assert.match(Q.pl_profile_html, /pl-profile pl-profile-none"><span class="pl-profile-head"><span class="pl-profile-name">Uzwiązkowienie<\/span><\/span><span class="pl-profile-bar"><span class="pl-profile-fill" style="width:0%"><\/span><span class="pl-profile-mark" style="left:50%"><\/span><\/span><span class="pl-profile-line"><span class="pl-profile-label">Daje:<\/span> związki rosną szybciej/);
    assert.equal(Q.pl_top_profile, '');
    work(Q, 'unionism');
    engine.goToScene('status');
    assert.match(Q.pl_profile_html, /^<span class="pl-profiles"><span class="pl-profile-count">Działają: 1 z 3<\/span><span class="pl-profile pl-profile-adopted"><span class="pl-profile-head"><span class="pl-profile-name">Uzwiązkowienie<\/span><span class="pl-profile-state">działa od 1922, umocni się w 1924<\/span>/, 'the working one first, with its stage');
    assert.equal(Q.pl_top_profile, 'Charakterystyka: uzwiązkowienie');
    assert.equal(P().profileSummary(Q.S), 'Działają: uzwiązkowienie (od 1922).');
    assert.equal(P().profileNotices(Q), 'zaczyna działać uzwiązkowienie.');
    assert.equal(P().profileNotices(Q), 'zaczyna działać uzwiązkowienie.', 'the same month page shows it again');
    Q.time += 1;
    assert.equal(P().profileNotices(Q), '', 'shown once');
    engine.goToScene('library.characteristics');
    assert.match(content(), /zaczyna działać sama, gdy jej pasek przekroczy kreskę progu/);
    assert.match(Q.pl_profile_library, /Uzwiązkowienie \(działa\)/);
    // The states in words, never a number; the order: working, above the threshold, the others from the strongest, blocked.
    const seeds = R().profileState(Q.S).seeds;
    for (const id of Object.keys(seeds)) seeds[id] = 0;
    Object.assign(seeds, { unionism: 20, parliamentarism: 18, reformism: 16, federalism: 12, strike_action: 8, worker_peasant: 4, militarism: 1, radicalism: 11 });
    R().profileRefresh(Q);
    engine.goToScene('status');
    const blocks = [...Q.pl_profile_html.matchAll(/pl-profile pl-profile-(\w+)"><span class="pl-profile-head"><span class="pl-profile-name">([^<]+)<\/span>(?:<span class="pl-profile-state">([^<]+)<\/span>)?/g)]
      .map(m => [m[2], m[1], m[3] || '']);
    assert.deepEqual(blocks.map(b => b[0] + ':' + b[1]), ['Uzwiązkowienie:adopted', 'Parlamentaryzm:adopted', 'Reformizm:adopted', 'Federalizm:ready',
      'Radykalizm:excluded', 'Akcja strajkowa:growing', 'Sojusz robotniczo-włościański:growing', 'Militaryzm:growing']);
    assert.deepEqual(blocks.slice(3).map(b => b[2]), ['ponad progiem, ale działają już trzy', 'blokuje ją reformizm', 'blisko progu', 'rośnie', 'zalążek']);
    assert.match(Q.pl_profile_html, /Działają: 3 z 3/);
    assert.match(Q.pl_profile_html, /Osłabia ją to, co buduje militaryzm\./);
    assert.match(Q.pl_profile_html, /Wyklucza radykalizm\./);
    assert.doesNotMatch(Q.pl_profile_html.replace(/style="[^"]*"/g, ''), /\d+(,\d+)? ?(pkt|punkt|%)|<br>/, 'no numbers and no run-on lines');
    // The congress card is gone.
    assert.equal(P().congressAvailable(Q), false);
  } finally {
    R().setLanguage('en');
  }
});

// Z — 1.07 (the user's notes after the first report): reformism lowers every payment of 2 or 3 units of a PPS decision, and the
// texts of the cards say the lower price; militarism grows more slowly (a steady building of the Milicja takes about a year).
test('Reformizm w tekstach 1.07: the cards say the lower price; the pool check uses it; militarism grows more slowly', () => {
  const engine = dendry.startGame(1922, 'pl');
  const Q = engine.state.qualities, S = Q.S, PR = globalThis.PolishProjects;
  const subtitle = (id) => {
    const c = (engine.getCurrentChoices() || []).find(x => x.id === id);
    const plain = x => (x == null ? '' : typeof x === 'string' ? x : Array.isArray(x) ? x.map(plain).join('') : plain(x.content));
    return c ? plain(c.subtitle) : '';
  };
  try {
    S.cabinet.portfolios.labor = 'pps';
    if (S.cabinet.partner_ids.indexOf('pps') < 0) S.cabinet.partner_ids.push('pps');
    S.economy.budget = 5;
    PR.costWords(Q);
    assert.deepEqual([Q.pl_cost2, Q.pl_cost2n, Q.pl_cost3], ['2 jednostki budżetu', '2 jednostki budżetu', '3 jednostki budżetu']);
    engine.goToScene('polish_gov_public_works');
    assert.match(subtitle('polish_gov_public_works.employment'), /^Koszt: 2 jednostki budżetu\./);
    R().profileState(S).adopted.push({ id: 'reformism', t: Q.time });
    engine.goToScene('polish_gov_public_works');
    assert.match(subtitle('polish_gov_public_works.employment'), /^Koszt: 1 jednostka budżetu\./);
    assert.match(subtitle('polish_gov_public_works.infrastructure'), /^Koszt: 2 jednostki budżetu\./);
    assert.deepEqual([Q.pl_cost2n, Q.pl_cost3], ['1 jednostka budżetu', '2 jednostki budżetu']);
    // Z — 1.08: every price word the Polish texts name is set by costWords (pl_cost_socn: the nominative after „Koszt:”).
    const fs = require('node:fs'), path = require('node:path'), used = new Set();
    const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
    for (const f of walk(path.join(__dirname, '..', 'source/i18n/pl/scenes')).filter(f => f.endsWith('.json')))
      for (const m of fs.readFileSync(f, 'utf8').matchAll(/\[\+ (pl_cost\w*) \+\]/g)) used.add(m[1]);
    assert.ok(used.has('pl_cost_socn'));
    assert.deepEqual([...used].filter(v => typeof Q[v] !== 'string'), [], 'a price word without a value');
    S.economy.budget = -1.5; // Z — 1.11: down to −3 B
    assert.equal(PR.affordStatus(Q, 2).available, true, 'the pool check uses the lower price');
    assert.equal(PR.affordStatus(Q, 3).available, false);
  } finally {
    R().setLanguage('en');
  }
  // Militarism: a recruitment adds half a point, a training one point, the Akcja Socjalistyczna two.
  const M = game();
  free(M); M.S.party_orgs.cash = 5;
  P().militiaChoose(M, 'recruit');
  assert.equal(R().profileState(M.S).seeds.militarism, 0.5);
});

// Z — 1.25 (decision 9 of 22 XI 2026): the actions of the Committee build the characteristics of the party, 1.5 each; the result and the
// description say which one; the actions that open a ministry card build it when the card is opened.
// Z — 1.42 (decision K2A): the actions of the Committee are gone; the defence of the constitution, a card of its own, builds
// parliamentarism and says so.
test('Obrona konstytucji 1.42: the card builds parliamentarism and says so; the portraits build nothing', () => {
  const engine = dendry.startGame(1922, 'pl');
  const Q = engine.state.qualities, seeds = () => R().profileState(Q.S).seeds;
  try {
    const before = seeds().parliamentarism;
    engine.goToScene('polish_party_constitution_defence');
    assert.match(plainText((engine.getCurrentChoices() || []).find(c => c.id === 'polish_party_constitution_defence.defend').subtitle), /Buduje parlamentaryzm\.$/);
    P().defenceChoose(Q);
    assert.equal(seeds().parliamentarism, before + 1.5);
    assert.equal(P().advisorActionStatus(Q, 'zaremba', 'worker_peasant_front').available, false);
  } finally {
    R().setLanguage('en');
  }
});
