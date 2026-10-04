'use strict';

// The Polish version of the game (decisions 1A–7A of 4 October 2026). The English scenes are the only copy of the game
// logic; tools/i18n/build.cjs builds out/html/game_pl.json from them and the translation files in source/i18n/pl/.
// These tests check the translation files, that the Polish game keeps the logic of the English one, the language
// helpers of the rules, the translated screens and that both languages play the same game.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { convertJSONToGame } = require('dendrynexus/lib/engine');
const dendry = require('./helpers/dendry.js');
const strategies = require('./helpers/strategies.js');
const i18n = require('../tools/i18n/build.cjs');

// Plain text of displayed content.
const flat = c => (c == null ? '' : typeof c === 'string' ? c : Array.isArray(c) ? c.map(flat).join('') :
  typeof c === 'object' ? flat(c.content) + (c.type === 'paragraph' || c.type === 'heading' ? '\n' : '') : String(c));
// English words that do not occur in the Polish texts.
const ENGLISH = /\b(the|and|of|with|is|are|from|this|that|for|has|have|will|not|month|months|cabinet|government|party)\b/i;
const englishLeft = text => text.split('\n').filter(line => ENGLISH.test(line.replace(/<span[^>]*>|<\/span>/g, '')));

// The scenes translated so far, part by part; each must stay complete.
const COMPLETE = ['scenes/root.scene.dry', 'scenes/main.scene.dry', 'scenes/status.scene.dry', 'scenes/polish_opening_state.scene.dry',
  'scenes/polish_discard.scene.dry', 'qdisplays/month.qdisplay.dry', 'qdisplays/dissent.qdisplay.dry', 'qdisplays/relationships.qdisplay.dry',
  'qdisplays/strength.qdisplay.dry', 'qdisplays/loyalty.qdisplay.dry', 'qdisplays/militancy.qdisplay.dry',
  'qdisplays/coalition_dissent.qdisplay.dry', 'qdisplays/taxation.qdisplay.dry',
  // Part 2: the Library, elections, the Marshal and the President, the formation and the relation to the government.
  'scenes/library.scene.dry', 'scenes/post_event.scene.dry', 'scenes/sejm_election.scene.dry', 'scenes/sejm_election_result.scene.dry',
  'scenes/election_simulation.scene.dry', 'scenes/election_algorithm.scene.dry', 'scenes/polish_speaker_election.scene.dry',
  'scenes/polish_presidential_sequence.scene.dry', 'scenes/polish_cabinet_formation.scene.dry', 'scenes/polish_government_support.scene.dry',
  'scenes/polish_government_response.scene.dry', 'scenes/polish_list_agreement.scene.dry', 'scenes/polish_event_router.scene.dry',
  'scenes/polish_advisor_commit.scene.dry', 'scenes/cancel_advisor_action.scene.dry', 'scenes/easy_discard.scene.dry',
  'scenes/polish_incompatible_save.scene.dry', 'scenes/return.scene.dry', 'scenes/set_next_election_time.scene.dry',
  // Part 3: the party cards and agendas, the advisers, the trade unions, strikes and the KPP.
  ...['direction', 'main_opponent', 'pils_influence', 'form_of_power', 'electoral_base', 'slavic_autonomy', 'jewish_cooperation',
    'ussr_position', 'economic_program', 'dues', 'militia', 'media', 'organizations', 'unity', 'advisers']
    .map(id => 'scenes/party_affairs/polish_party_' + id + '.scene.dry'),
  'scenes/party_affairs/inter_party_relationships.scene.dry', 'scenes/polish_agenda.scene.dry', 'scenes/polish_party_agenda.scene.dry',
  'scenes/polish_union_agenda.scene.dry', 'scenes/polish_strike_steps.scene.dry', 'scenes/polish_event_strike_1923.scene.dry',
  'scenes/polish_event_strike_response.scene.dry', 'scenes/polish_event_strike_rejection.scene.dry', 'scenes/polish_event_faction_split.scene.dry',
  ...['arciszewski', 'czapinski', 'daszynski', 'drobner', 'dubois', 'jaworowski', 'malinowski', 'moraczewski', 'niedzialkowski', 'perl',
    'prochnik', 'puzak', 'zaremba', 'ziemiecki'].map(id => 'scenes/advisors/' + id + '.scene.dry'),
  // Part 4: the government cards, the projects, the economy, the budget and the bill D.
  ...['labor_rights', 'social_welfare', 'public_works', 'finance', 'currency', 'investment', 'industry', 'agriculture', 'land', 'education',
    'minority_schools', 'heritage', 'interior', 'justice', 'military', 'pils_agreement'].map(id => 'scenes/government_affairs/polish_gov_' + id + '.scene.dry'),
  'scenes/polish_budget_package.scene.dry', 'scenes/polish_unemployment_bill.scene.dry', 'scenes/polish_constitution_project.scene.dry',
  'scenes/polish_parliament_army_oversight.scene.dry', 'scenes/polish_event_stabilization.scene.dry', 'scenes/polish_event_credit_crisis.scene.dry',
  'scenes/polish_event_austerity_1926.scene.dry',
  // Part 5: politics, security, the coup, the chapter report and the headings of the Credits (their lists stay original, 7A).
  'scenes/polish_event_cabinet_1922.scene.dry', 'scenes/polish_event_pils_criticism.scene.dry', 'scenes/polish_event_niewiadomski_cult.scene.dry',
  'scenes/polish_event_assassination_response.scene.dry', 'scenes/polish_event_coup.scene.dry', 'scenes/polish_chapter_report.scene.dry',
  'scenes/credits.scene.dry'];

test('Tłumaczenia: każdy wpis ma swoją angielską linię, a pliki kompletne nie mają braków', () => {
  const cov = i18n.coverage('pl');
  for (const [file, c] of Object.entries(cov)) {
    assert.ok(!c.noSource, `${file}: the source file exists`);
    assert.deepEqual(c.stale, [], `${file}: entries whose English line has changed`);
    if (c.status === 'complete') assert.deepEqual(c.missing, [], `${file}: untranslated lines`);
  }
  for (const file of COMPLETE) assert.equal(cov[file] && cov[file].status, 'complete', `${file} is complete`);
});

test('Wersja polska: te same sceny, jakości i logika co angielska', () => {
  const en = JSON.parse(fs.readFileSync(path.join(dendry.ROOT, 'out', 'game.json'), 'utf8'));
  let pl;
  // The conversion builds every script of the Polish game, so a broken translated script fails here.
  convertJSONToGame(fs.readFileSync(path.join(dendry.ROOT, 'out', 'html', 'game_pl.json'), 'utf8'), (error, game) => {
    if (error) throw error;
    pl = game;
  });
  assert.deepEqual(Object.keys(pl.scenes).sort(), Object.keys(en.scenes).sort());
  assert.deepEqual(Object.keys(pl.qualities).sort(), Object.keys(en.qualities).sort());
  assert.deepEqual(Object.keys(pl.qdisplays).sort(), Object.keys(en.qdisplays).sort());
  // Everything but the texts and the scripts that write texts is identical: conditions, jumps, options, tags, limits.
  const TEXT = new Set(['title', 'subtitle', 'unavailableSubtitle', 'content', 'onArrival', 'onDeparture', 'onDisplay']);
  const logic = scene => JSON.parse(JSON.stringify(scene, (key, value) => (TEXT.has(key) ? undefined :
    typeof value === 'function' ? value.source : value)));
  const enGame = (() => { let g; convertJSONToGame(JSON.stringify(en), (e, r) => { g = r; }); return g; })();
  for (const id of Object.keys(en.scenes)) assert.deepEqual(logic(pl.scenes[id]), logic(enGame.scenes[id]), `scene ${id}`);
});

test('Język reguł: wybór tekstu, odmiana liczebników, przecinek i daty', () => {
  const rules = dendry.loadRules();
  try {
    rules.setLanguage('pl');
    assert.equal(rules.getLanguage(), 'pl');
    assert.equal(rules.L('Opposition', 'opozycja'), 'opozycja');
    assert.deepEqual([1, 2, 4, 5, 12, 14, 22, 25, 112].map(n => rules.plural(n, 'miesiąc', 'miesiące', 'miesięcy')),
      ['miesiąc', 'miesiące', 'miesiące', 'miesięcy', 'miesięcy', 'miesięcy', 'miesiące', 'miesięcy', 'miesięcy']);
    assert.equal(rules.plural(1.5, 'miesiąc', 'miesiące', 'miesięcy', 'miesiąca'), 'miesiąca');
    assert.equal(rules.num(0.5, 1), '0,5');
    assert.equal(rules.num(12.25), '12,25');
    assert.equal(rules.monthYear(51), 'marzec 1926');
    assert.equal(rules.monthYear(51, 'gen'), 'marca 1926');
    assert.equal(rules.monthYear(51, 'loc'), 'marcu 1926');
    assert.equal(rules.dateText('1928-02-19'), '19 lutego 1928');
    rules.setLanguage('en');
    assert.equal(rules.L('Opposition', 'opozycja'), 'Opposition');
    assert.equal(rules.num(0.5, 1), '0.5');
    assert.equal(rules.monthYear(51, 'gen'), 'March 1926');
    assert.equal(rules.dateText('1928-02-19'), '19 February 1928');
  } finally {
    rules.setLanguage('en');
  }
});

test('Pilotaż: ekran tytułowy, strona miesiąca i pasek boczny po polsku', () => {
  const errors = dendry.watchEngineErrors();
  const engine = dendry.createEngine(1922, 'pl');
  assert.match(flat(engine.ui.paragraphs), /PPS: historia alternatywna/);
  assert.deepEqual(engine.getCurrentChoices().map(c => flat(c.title)).slice(0, 3), ['Rozpocznij grę', 'Symulacja wyborów', 'Twórcy i licencje']);
  dendry.choose(engine, 'root.start');
  assert.match(flat(engine.ui.paragraphs), /Polska, styczeń 1922/);
  dendry.choose(engine, 'root.1928_main');
  const month = flat(engine.ui.paragraphs);
  assert.match(month, /Styczeń 1922/);
  assert.deepEqual(englishLeft(month), [], 'the month page');
  const titles = engine.getCurrentChoices().map(c => flat(c.title));
  for (const title of ['Sprawy partii', 'Parlament', 'Agenda partii', 'Związki zawodowe', 'Odrzuć kartę']) assert.ok(titles.includes(title), title);
  const sidebar = {};
  for (const id of ['status', 'status.politics', 'status.paramilitaries', 'status.polls']) {
    const scene = engine.game.scenes[id];
    engine._runActions(scene.onArrival);
    sidebar[id] = flat(engine._makeDisplayContent(scene.content, true));
    assert.deepEqual(englishLeft(sidebar[id]), [], `sidebar ${id}`);
  }
  assert.match(sidebar.status, /Kasa partii: 2 R; wpływy 0,5 R miesięcznie/);
  assert.match(sidebar.status, /Głowa państwa: Józef Piłsudski — Naczelnik Państwa/);
  assert.match(sidebar.status, /PPS: 35 posłów; 7,9% mandatów/);
  assert.match(sidebar['status.paramilitaries'], /Policja\. Policja: potencjał 50/);
  assert.match(sidebar['status.politics'], /PSL Wyzwolenie: przyjazne/);
  assert.deepEqual(errors, []);
});

// Z — 0.52: the advisers are shown as the Central Executive Committee (CKW). The wait before its next action is
// written in full in both languages, from the scenes and from the rules alike (Daszyński has one option of each).
test('Centralny Komitet Wykonawczy: nagłówek i odnowienie akcji z pełną odmianą w obu językach', () => {
  const errors = dendry.watchEngineErrors();
  const header = {en: 'Central Executive Committee - an action is available.', pl: 'Centralny Komitet Wykonawczy — akcja jest dostępna.'};
  const wait = {
    en: n => `${n} ${n === 1 ? 'month' : 'months'} before the next Committee action.`,
    pl: n => `Do następnej akcji CKW: ${n} ${n === 1 ? 'miesiąc' : n <= 4 ? 'miesiące' : 'miesięcy'}.`,
  };
  for (const lang of ['en', 'pl']) {
    const engine = dendry.startGame(1922, lang);
    const Q = engine.state.qualities;
    assert.equal(Q.pinnedCardsDescription, header[lang], `${lang}: the header of the pinned cards`);
    for (const n of [1, 3, 6]) {
      Q.S.cooldowns.advisor = Q.time + n;
      globalThis.PolishRules.refreshMirrors(Q);
      engine.goToScene('daszynski');
      const texts = ['daszynski.parliamentary_compromise', 'daszynski.broker_coalition']
        .map(id => flat(engine.getCurrentChoices().find(c => c.id === id).subtitle).trim());
      assert.deepEqual(texts, [wait[lang](n), wait[lang](n)], `${lang}: ${n} months`);
    }
  }
  globalThis.PolishRules.setLanguage('en');
  assert.deepEqual(errors, []);
});

test('Ta sama rozgrywka w obu językach: strategia N-C do grudnia 1923 daje identyczny stan gry', () => {
  const run = lang => strategies.runCampaign('N_C', 8001, { lang, stopWhen: Q => Q.time >= 24 });
  const en = run('en');
  const pl = run('pl');
  dendry.loadRules().setLanguage('en');
  assert.equal(pl.stuck, null);
  assert.equal(en.stuck, null);
  assert.deepEqual(clone(pl.engine.state.qualities.S), clone(en.engine.state.qualities.S));
});

// Decision 5A guarded over the whole chapter: every strategy of the test suite, to its end (the election or the coup),
// leaves the same state S in both languages, and the Polish run shows no English line.
test('Ta sama rozgrywka w obu językach: każda strategia do końca rozdziału, bez angielskich tekstów', () => {
  for (const name of Object.keys(strategies.STRATEGIES)) {
    const shown = [];
    const en = strategies.runCampaign(name, 8001, { lang: 'en' });
    const pl = strategies.runCampaign(name, 8001, { lang: 'pl', setup: engine => {
      const display = engine.ui.displayContent;
      engine.ui.displayContent = function(content) { shown.push(...englishLeft(flat(content))); return display.apply(this, arguments); };
    } });
    dendry.loadRules().setLanguage('en');
    assert.equal(pl.stuck, null, `${name}: the Polish run is stuck`);
    assert.equal(pl.engine.state.qualities.S.chapter.status, 'ended', `${name}: the Polish run reaches the end of the chapter`);
    assert.deepEqual(clone(pl.engine.state.qualities.S), clone(en.engine.state.qualities.S), `${name}: the same state in both languages`);
    assert.deepEqual([...new Set(shown)], [], `${name}: English lines on the Polish screens`);
  }
});

const clone = value => JSON.parse(JSON.stringify(value));
