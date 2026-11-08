const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Z — 1.07 (the user's decisions of 7–8 XI 2026): the characteristics of the party. A characteristic grows from the decisions
// that build it (a line of the party that matches it makes it grow half as fast again), a congress of PPS adopts a ready one with
// a resolution (the action of the month), two at most in the first chapter, reformism and radicalism exclude each other, an
// adopted one can be left; each adopted one changes other cards. The views: the Party tab, the Overview, the Library, the report.
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
function ripen(Q, id) {
  R().profileState(Q.S).seeds[id] = P().PROFILE_READY;
}

test('Charakterystyka 1.07: seeds grow from decisions, faster with a matching line; a congress appears only when one is ready', () => {
  const Q = game();
  const S = Q.S;
  const state = R().profileState(S);
  assert.deepEqual(Object.keys(state.seeds), R().PROFILE_IDS);
  S.actors.pps.strategy.direction = 'parliamentary_socialism';
  S.actors.pps.strategy.electoral_base = 'workers_peasants';
  assert.equal(R().seedProfile(Q, 'unionism', 2, 'fixture'), 2, 'no matching line');
  assert.equal(R().seedProfile(Q, 'reformism', 2, 'fixture'), 3, 'socialist parliamentarism matches reformism (×1.5)');
  assert.equal(R().seedProfile(Q, 'worker_peasant', 2, 'fixture'), 3, 'the party of workers and peasants matches the alliance');
  assert.equal(P().congressAvailable(Q), false, 'nothing is ready');
  // The party's own decisions build the seeds: building a union branch builds unionism.
  free(Q);
  S.party_orgs.cash = 5;
  P().organizationsChoose(Q, ['union_organize_industry'], 'party.union_investments');
  assert.equal(state.seeds.unionism, 4);
  ripen(Q, 'unionism');
  assert.deepEqual(P().readyProfiles(S), ['unionism']);
  assert.equal(P().congressAvailable(Q), true);
});

test('Kongres 1.07: a resolution adopts a characteristic for the action of the month; two at most; reformism and radicalism exclude each other; an adopted one can be left; one congress a year', () => {
  const Q = game();
  const S = Q.S, f = S.actors.pps.factions;
  free(Q);
  for (const id of ['centrum', 'lewica', 'pilsudczycy']) f[id].dissent = 20;
  const centrum = f.centrum.strength;
  ripen(Q, 'reformism');
  ripen(Q, 'radicalism');
  assert.match(P().congressChoose(Q, 'adopt:reformism'), /^The congress adopts reformism\./);
  assert.ok(R().profileActive(S, 'reformism'));
  assert.ok(f.centrum.strength > centrum, 'the patron grows stronger');
  assert.equal(f.lewica.dissent, 28, 'the Left protests (+8)');
  assert.equal(Q.month_actions, 1, 'the resolution is the action of the month');
  assert.deepEqual(P().readyProfiles(S), [], 'radicalism is excluded by reformism');
  assert.equal(P().congressAvailable(Q), false, 'one congress a year');
  Q.time += 12; free(Q);
  ripen(Q, 'unionism');
  assert.equal(P().congressAvailable(Q), true);
  P().congressChoose(Q, 'adopt:unionism');
  Q.time += 12; free(Q);
  ripen(Q, 'militarism');
  assert.match(P().congressStatus(Q, 'adopt:militarism').reason, /already has two characteristics/);
  assert.equal(P().congressStatus(Q, 'drop:unionism').available, true);
  f.centrum.dissent = 20;
  const actions = Q.month_actions;
  P().congressChoose(Q, 'drop:unionism');
  assert.deepEqual([R().profileActive(S, 'unionism'), f.centrum.dissent, R().profileState(S).seeds.unionism], [false, 28, 0]);
  // Z — 1.10 (decision 3A): the congress goes on in the same month and adopts another one within the same action.
  assert.equal(Q.month_actions, actions + 1, 'giving up costs the action once');
  assert.equal(P().congressAvailable(Q), true, 'the congress is still open');
  P().congressView(Q);
  assert.match(Q.pl_cg_note, /given up unionism/);
  assert.equal(P().congressStatus(Q, 'adopt:militarism').available, true);
  P().congressChoose(Q, 'adopt:militarism');
  assert.equal(Q.month_actions, actions + 1, 'adopting in the same congress costs nothing more');
  assert.ok(R().profileActive(S, 'militarism'));
  assert.equal(P().congressAvailable(Q), false, 'the congress has ended');
  Q.time += 12; free(Q);
  ripen(Q, 'federalism');
  const before = Q.month_actions;
  assert.match(P().congressChoose(Q, 'none'), /without new resolutions/);
  assert.equal(Q.month_actions, before, 'no new resolutions cost no action');
});

test('Skutki cech 1.07: unions, strikes, parliament, ministries, the Milicja and campaigns change with an adopted characteristic', () => {
  const Q = game();
  const S = Q.S, adopt = id => R().profileState(S).adopted.push({ id, t: Q.time });
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
  assert.ok(Math.abs((S.unions.rail.reach - reach1) - Math.min(100 - reach1, plain * 1.25)) < 1e-6, 'unionism: +25% reach');
  // Campaigns: radicalism +25% among the workers and the unemployed, the alliance in the countryside, federalism among the minorities.
  const cell = c => S.society.cells.find(x => x.class_id === c);
  assert.equal(P().profileCampaignFactor(S, cell('workers')), 1);
  adopt('radicalism'); adopt('worker_peasant');
  assert.equal(P().profileCampaignFactor(S, cell('workers')), 1.25);
  assert.equal(P().profileCampaignFactor(S, cell('rural')), 1.25);
  // Reformism: a programme of a PPS ministry that costs 2 or 3 costs one unit less; radicalism: the socialisation of the mines too.
  const PR = globalThis.PolishProjects;
  assert.deepEqual([PR.profilePrice(S, 'land_program', 2, 'pps'), PR.profilePrice(S, 'socialise_mining', 3, 'pps')], [2, 2]);
  adopt('reformism');
  assert.deepEqual([PR.profilePrice(S, 'land_program', 2, 'pps'), PR.profilePrice(S, 'land_program', 1, 'pps'), PR.profilePrice(S, 'land_program', 2, 'zln')], [1, 1, 2]);
  assert.equal(PR.profilePrice(S, 'socialise_mining', 3, 'pps'), 1, 'reformism and radicalism together only in a fixture');
  // Parliamentarism: a bill of our initiative has ten points more of chance.
  const counts = { yes: 200, no: 200 };
  assert.equal(PR.initiativeChance(S, counts), 0.5);
  adopt('parliamentarism');
  assert.equal(PR.initiativeChance(S, counts), 0.6);
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

test('Charakterystyka w grze 1.07: the Party tab shows the eight characteristics, the adopted ones in red; the Overview, the Library and the report name them; the congress card in Polish', () => {
  const engine = dendry.startGame(1922, 'pl');
  const Q = engine.state.qualities;
  const content = () => JSON.stringify(engine.ui.paragraphs);
  try {
    engine.goToScene('status');
    assert.match(content(), /Charakterystyka/);
    assert.match(Q.pl_profile_html, /pl-profile-off">Uzwiązkowienie<\/span> — Buduje:/);
    assert.equal(Q.pl_top_profile, '');
    R().profileState(Q.S).adopted.push({ id: 'unionism', t: Q.time });
    engine.goToScene('status');
    assert.match(Q.pl_profile_html, /pl-profile-on">Uzwiązkowienie \(przyjęta\)<\/span>/);
    assert.equal(Q.pl_top_profile, 'Charakterystyka: uzwiązkowienie');
    assert.equal(P().profileSummary(Q.S), 'PPS przyjęła uzwiązkowienie (1922).');
    engine.goToScene('library.characteristics');
    assert.match(content(), /Charakterystyka partii/);
    assert.match(Q.pl_profile_library, /Uzwiązkowienie \(przyjęta\)/);
    ripen(Q, 'parliamentarism');
    free(Q);
    engine.goToScene('polish_party_congress');
    assert.match(content(), /Do Warszawy zjeżdżają delegaci/);
    const ids = (engine.getCurrentChoices() || []).map(c => c.id);
    assert.ok(ids.includes('polish_party_congress.adopt_parliamentarism'));
    assert.ok(ids.includes('polish_party_congress.drop_unionism'));
    assert.ok(ids.includes('polish_party_congress.none') && ids.includes('polish_party_congress.later'));
    // Z — 1.10 (the user's notes and decision 3A of 8 XI 2026): plain titles; giving one up keeps the congress open, and another
    // one is adopted within the same action.
    const title = id => plainText((engine.getCurrentChoices() || []).find(c => c.id === id).title);
    assert.equal(title('polish_party_congress.adopt_parliamentarism'), 'Przyjmij parlamentaryzm');
    assert.equal(title('polish_party_congress.drop_unionism'), 'Porzuć uzwiązkowienie');
    dendry.choose(engine, 'polish_party_congress.drop_unionism');
    assert.match(content(), /Kongres porzucił uzwiązkowienie\. Może teraz przyjąć inną charakterystykę albo zakończyć obrady\./);
    assert.equal(Q.month_actions, 1);
    dendry.choose(engine, 'polish_party_congress.adopt_parliamentarism');
    assert.match(content(), /Kongres przyjmuje parlamentaryzm\. Partia wiąże swój los z Sejmem/);
    assert.equal(Q.month_actions, 1, 'one action for the whole congress');
    assert.ok(R().profileActive(Q.S, 'parliamentarism') && !R().profileActive(Q.S, 'unionism'));
    // The Party tab: each characteristic with what builds it and what it gives.
    engine.goToScene('status');
    assert.match(Q.pl_profile_html, /pl-profile-on">Parlamentaryzm \(przyjęta\)<\/span> — Buduje: ustawy z inicjatywy/);
    assert.equal((Q.pl_profile_html.match(/<br>/g) || []).length, 7, 'eight lines');
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
    S.economy.budget = 1;
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
