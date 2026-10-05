#!/usr/bin/env node
'use strict';

// Implementation-plan diagnostics for docs/POLISH_IMPLEMENTATION_PLAN.md (reference 0.40). The plan creates no
// rules; this script checks that it assigns every catalogue entry, every 21.1 test and every 20.2 leak to exactly
// one stage, that its section numbers, files and links exist, and that the approved decisions are recorded.
// It is not a simulation of the campaign.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
// Z — 0.54: the page's local scripts carry a version (?v=), so that a browser cannot mix cached and new files.
const scriptTag = file => new RegExp('<script src="' + file.replace(/\./g, '\\.') + '(\\?v=[0-9.]+)?"></script>');
const loadsScript = (html, file) => scriptTag(file).test(html);
const scriptAt = (html, file) => html.search(scriptTag(file));
const PLAN = 'docs/POLISH_IMPLEMENTATION_PLAN.md', TR = 'docs/POLISH_TECHNICAL_REFERENCE.md', CAT = 'docs/POLISH_CARD_CATALOGUE.md';
const plan = read(PLAN), tr = read(TR), cat = read(CAT);
const cells = line => line.split(/(?<!\\)\|/).slice(1, -1).map(c => c.trim());
const section = (text, from, to) => { const a = text.indexOf(from); assert.ok(a >= 0, from); const b = to ? text.indexOf(to, a + from.length) : text.length; return text.slice(a, b < 0 ? text.length : b); };
const lineAfter = (text, label) => { const l = text.split('\n').find(x => x.startsWith(label)); assert.ok(l, `line ${label}`); return l.slice(label.length).trim(); };

// ---- Header and approved decisions.
assert.match(plan.split('\n')[2], /^\*\*Stan — referencja 0\.[45]\d, \d{1,2} \S+ \d{4}\./, 'plan state line');
const decisions = section(plan, '## 2. Zatwierdzone decyzje (Z — 0.40)', '## 3. ');
for (const t of ['**Kod reguł w osobnym module.**', '**Na razie tylko angielski.**', '**Stare zapisy gry wymagają nowej gry.**']) assert.ok(decisions.includes(t), `decision ${t}`);
const trRules = [
  ['### 19.3. ', '## 20. ', '**Z — 0.40:** zapis bez zgodnej wersji schematu, w tym każdy zapis sprzed przebudowy, nie jest migrowany.'],
  ['### 20.1. ', '### 20.1.1. ', '**Z — 0.40: miejsce kodu reguł.** Obliczenia reguł trafiają do osobnego pliku zwykłego JavaScriptu w `source/rules/`'],
  // 0.50 (the Polish language version) replaced the 0.40 decision on the language; 23.23 records the change.
  ['### 20.1. ', '### 20.1.1. ', '**Z — 0.50: język.** Gra ma dwie wersje językowe: angielską (domyślną) i polską.'],
  ['### 23.23. ', null, '**1A:** tłumaczenia scen w plikach linia po linii'],
  ['### 20.3. ', '## 21. ', '[POLISH_IMPLEMENTATION_PLAN.md](POLISH_IMPLEMENTATION_PLAN.md)'],
];
for (const [from, to, text] of trRules) assert.ok(section(tr, from, to).includes(text), `reference ${from.trim()} records the 0.40 decision`);
assert.ok(/^\*\*Wersja 0\.[45]\d — /m.test(tr), 'reference version 0.40 or later');
assert.ok(section(tr, '### 20.1. ', '### 20.1.1. ').includes('Decyzja zastępuje Z — 0.40'), 'reference 20.1 names the replaced 0.40 decision');
assert.ok(plan.includes('## 19. Polska wersja językowa (po planie, 0.50)'), 'plan chapter 19: the Polish language version');
for (const f of ['PLAN.md', 'MECHANICS_MAP.md', 'STATE_VARIABLES.md', 'TRANSITION_MATRIX.md']) {
  const text = read(f), head = text.match(/^## Current state — reference 0\.[45]\d, .*$/m);
  assert.ok(head, `${f} has a current state for reference 0.40 or later`);
  const state = section(text, head[0], '## Archive of entries');
  assert.ok(state.includes('`docs/POLISH_IMPLEMENTATION_PLAN.md`') && state.includes('**Implementation plan (Z, 0.40):**'), `${f} points to the plan`);
}

// ---- Stages 0-8, each with the required fields; scope sections exist in chapters 1-22 of the reference.
const trCurrent = tr.slice(0, tr.indexOf('\n## 23. '));
const sections = new Set([...trCurrent.matchAll(/^#{2,4} (\d+(?:\.\d+)*[a-z]?)\. /gm)].map(m => m[1]));
const stageChunks = plan.split(/^### Etap /m).slice(1).map(c => '### Etap ' + c.split(/^## /m)[0]);
assert.deepEqual(stageChunks.map(c => Number(c.match(/^### Etap (\d) — /)[1])), [0, 1, 2, 3, 4, 5, 6, 7, 8], 'stages 0-8 in order');
const FIELDS = ['**Cel:**', '**Zakres w referencji:**', '**Karty z katalogu:**', '**Pliki:**', '**Stan:**', '**Wyłączamy:**', '**Gotowe, gdy:**'];
const expand = list => list.flatMap(tok => {
  const r = tok.match(/^(\d+)\.(\d+)–(?:(\d+)\.)?(\d+)$/);
  if (!r) return [tok];
  assert.ok(!r[3] || r[3] === r[1], `range ${tok} stays within one chapter`);
  return Array.from({ length: Number(r[4]) - Number(r[2]) + 1 }, (_, i) => `${r[1]}.${Number(r[2]) + i}`);
});
const stages = stageChunks.map(chunk => {
  const n = Number(chunk.match(/^### Etap (\d)/)[1]);
  for (const f of FIELDS) assert.ok(chunk.includes('\n' + f) || chunk.includes('\n\n' + f), `stage ${n}: ${f}`);
  const scope = lineAfter(chunk, '**Zakres w referencji:**').split(/\. [A-ZŚŻ]/)[0].replace(/\.$/, '');
  const refs = scope.split(/,\s*/).flatMap(t => t.split('–')).map(t => t.trim()).filter(Boolean);
  for (const s of refs) assert.ok(sections.has(s), `stage ${n}: reference section ${s} exists`);
  const cardsText = lineAfter(chunk, '**Karty z katalogu:**');
  const cards = cardsText.startsWith('brak') ? [] : expand(cardsText.replace(/\.$/, '').split(/,\s*/));
  const leakText = chunk.slice(chunk.indexOf('\n**Wyłączamy:**')).split('\n\n**')[0];
  const leakMatch = leakText.match(/przecie(?:k|ki) ([\d, i]+?)(?: z dodatku C)?\)/);
  const leaks = leakMatch ? leakMatch[1].split(/,\s*| i /).map(Number) : [];
  return { n, scopeRefs: refs.length, cards, leaks, text: chunk };
});

// ---- Appendix A: every catalogue entry in exactly one stage, matching the stage's own card line.
const entries = [...cat.matchAll(/^### (\d+\.\d+)\. /gm)].map(m => m[1]);
assert.equal(entries.length, 69, 'catalogue has 69 entries');
const appA = section(plan, '## Dodatek A. ', '## Dodatek B. ').split('\n').filter(l => /^\| \d \|/.test(l)).map(cells);
assert.deepEqual(appA.map(r => Number(r[0])), [0, 1, 2, 3, 4, 5, 6, 7, 8], 'appendix A has one row per stage');
const byStageA = {};
for (const r of appA) {
  const nums = r[1] === '—' ? [] : r[1].split(/,\s*/);
  assert.equal(nums.length, Number(r[2]), `appendix A stage ${r[0]} count`);
  byStageA[r[0]] = nums;
  assert.deepEqual(nums, stages[Number(r[0])].cards, `appendix A stage ${r[0]} matches the stage's card line`);
}
const assignedCards = Object.values(byStageA).flat();
assert.equal(new Set(assignedCards).size, assignedCards.length, 'no catalogue entry is assigned twice');
assert.deepEqual([...assignedCards].sort(), [...entries].sort(), 'every catalogue entry has a stage');
assert.ok(section(plan, '## Dodatek A. ', '## Dodatek B. ').includes('| **Razem** | | **69** |'));

// ---- Appendix B: every 21.1 test in exactly one stage; stage counts match.
const tests = section(tr, '### 21.1. ', '### 21.2. ').split('\n').filter(l => l.startsWith('| ')).map(l => cells(l)[0]).filter(t => t !== 'Test');
assert.equal(tests.length, new Set(tests).size, '21.1 test names are unique');
const appB = section(plan, '## Dodatek B. ', '## Dodatek C. ').split('\n').filter(l => /^- \*\*Etap \d \(\d+\):\*\*/.test(l));
assert.equal(appB.length, 9, 'appendix B has one line per stage');
const byStageB = {};
for (const l of appB) {
  const [, n, k] = l.match(/^- \*\*Etap (\d) \((\d+)\):\*\*/);
  const names = [...l.matchAll(/„([^”]+)”/g)].map(m => m[1]);
  assert.equal(names.length, Number(k), `appendix B stage ${n} count`);
  byStageB[n] = names;
}
const assignedTests = Object.values(byStageB).flat();
assert.equal(new Set(assignedTests).size, assignedTests.length, 'no 21.1 test is assigned twice');
assert.deepEqual(assignedTests.filter(t => !tests.includes(t)), [], 'every assigned name exists in 21.1');
assert.deepEqual(tests.filter(t => !assignedTests.includes(t)), [], 'every 21.1 test has a stage');
assert.ok(plan.includes(`Razem: ${tests.length} testów z 21.1.`), 'appendix B total');
for (const s of stages) {
  const m = s.text.match(/\*\*Testy z 21\.1:\*\* (\d+) testów z dodatku B/);
  if (m) assert.equal(Number(m[1]), byStageB[s.n].length, `stage ${s.n}: test count in the stage text`);
  for (const name of [...(s.text.match(/\*\*Testy z 21\.1:\*\*[^\n]*/) || [''])[0].matchAll(/„([^”]+)”/g)].map(x => x[1])) {
    assert.ok(byStageB[s.n].includes(name), `stage ${s.n}: named test ${name} is assigned to this stage`);
  }
}

// ---- Appendix C: the ten leaks of 20.2, each closed by one stage, as the stage texts say.
const leaks20 = section(tr, '### 20.2. ', '### 20.3. ').split('\n').filter(l => l.startsWith('- '));
assert.equal(leaks20.length, 10, '20.2 lists ten leaks');
const appC = section(plan, '## Dodatek C. ', '## Dodatek D. ').split('\n').filter(l => /^\| \d+ \|/.test(l)).map(cells);
assert.deepEqual(appC.map(r => Number(r[0])), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'appendix C rows 1-10');
for (const r of appC) {
  const n = Number(r[0]), stage = Number(r[2]);
  assert.ok(stages[stage].leaks.includes(n), `leak ${n}: stage ${stage} names it in "Wyłączamy"`);
}
assert.deepEqual(stages.flatMap(s => s.leaks).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'stage texts name each leak once');

// ---- Appendix D: one manifest row per taking-over stage.
const appD = section(plan, '## Dodatek D. ').split('\n').filter(l => /^\| `[a-z_]+` \| \d+ \|/.test(l)).map(cells);
assert.deepEqual(appD.map(r => Number(r[1])), [1, 2, 3, 4, 5, 6, 7, 8], 'appendix D covers stages 1-8');
assert.equal(new Set(appD.map(r => r[0])).size, appD.length, 'system_id values are unique');
assert.ok(appD.every(r => r.length === 8 && ['planowane', 'wykonane'].includes(r[7])), 'eight columns and a known status');
const doneStages = stages.filter(s => /\*\*Stan:\*\* wykonany/.test(s.text)).map(s => s.n);
for (const r of appD) assert.equal(r[7], doneStages.includes(Number(r[1])) ? 'wykonane' : 'planowane', `appendix D ${r[0]}: status follows stage ${r[1]}`);

// ---- Files and folders named in the plan exist, unless marked "(nowy)".
const tokens = [...new Set([...plan.matchAll(/`([^`\s]+)`/g)].map(m => m[1]))];
const NEW_DIRS = ['source/rules/'];
const resolve = t => {
  if (/^(source|tests|analysis|out|docs|node_modules|assets)\//.test(t) || t === 'package.json') return t;
  if (/^(events|advisors|government_affairs|party_affairs)\//.test(t)) return `source/scenes/${t}.scene.dry`;
  if (/^qdisplays\//.test(t)) return `source/qdisplays/${t.slice(10)}.qdisplay.dry`;
  return null;
};
const files = { existing: 0, planned: [] };
for (const t of tokens.filter(x => x.includes('/') && !x.includes('*') && !x.startsWith('http'))) {
  const p = resolve(t); if (!p) continue;
  if (fs.existsSync(path.join(root, p))) { files.existing++; continue; }
  const markedNew = plan.includes('`' + t + '` (nowy)') || NEW_DIRS.some(d => t.startsWith(d));
  assert.ok(markedNew, `${t} exists or is marked (nowy)`);
  files.planned.push(t);
}
// Bare names listed next to a folder in the same line exist in that folder.
for (const line of plan.split('\n')) {
  const folder = (line.match(/`(source\/(?:scenes\/(?:government_affairs|party_affairs)|qdisplays)\/)`/) || [])[1];
  if (!folder) continue;
  const ext = folder.startsWith('source/qdisplays') ? '.qdisplay.dry' : '.scene.dry';
  for (const name of [...line.matchAll(/`([a-z_]+)`/g)].map(m => m[1])) {
    assert.ok(fs.existsSync(path.join(root, folder, name + ext)), `${folder}${name}${ext} exists`);
    files.existing++;
  }
}
// Relative links and anchors resolve (GitHub slug rules).
const slug = t => t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/`/g, '').replace(/\*\*/g, '')
  .toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '').replace(/ /g, '-');
const links = [...plan.matchAll(/\]\(([^)\s]+)\)/g)].map(m => m[1]).filter(l => !/^https?:/.test(l));
for (const l of links) {
  const [file, anchor] = l.split('#');
  const target = path.join(root, 'docs', file);
  assert.ok(fs.existsSync(target), `link target ${file} exists`);
  if (anchor) {
    const heads = fs.readFileSync(target, 'utf8').split('\n').filter(x => /^#{1,6} /.test(x)).map(x => slug(x.replace(/^#+ /, '')));
    assert.ok(heads.includes(anchor), `anchor #${anchor} exists in ${file}`);
  }
}

// ---- Stage 0 (0.41): done, its files exist and its decisions and findings are recorded.
const stage0 = stages[0].text;
assert.ok(stage0.includes('**Stan:** wykonany'), 'stage 0 is marked as done');
const stage0Files = ['source/rules/polish_rules.js', 'source/scenes/polish_incompatible_save.scene.dry', 'tests/helpers/dendry.js', 'tests/rules-foundation.test.js', 'tests/polish-foundation.test.js'];
for (const f of stage0Files) assert.ok(fs.existsSync(path.join(root, f)), `stage 0 file ${f} exists`);
assert.ok(decisions.includes('Decyzje etapu 0 (Z — 0.41):'), 'stage 0 decisions recorded');
assert.ok(plan.includes('## 10. Ustalenia z etapu 0') && plan.includes('## Dodatek E. '), 'stage 0 findings and full lists');
assert.ok(/^### 23\.14\. Etap 0 wdrożony/m.test(tr), 'reference 23.14 records stage 0');
const pkg = JSON.parse(read('package.json'));
// The Polish version of the game (4 X 2026) adds its own step after the copy of the rules.
assert.ok(/&& cp source\/rules\/\*\.js out\/html\/( && node tools\/i18n\/build\.cjs)?$/.test(pkg.scripts.build), 'the build copies the rules module');
assert.ok(loadsScript(read('out/html/index.html'), 'polish_rules.js'), 'the page loads the rules module');
// Appendix E: every listed file contains the named variable as a whole word.
const appE = section(plan, '## Dodatek E. ').split('\n').filter(l => /^- \*\*`[^`]+`\*\* — \d+ plików/.test(l));
for (const l of appE) {
  const [, name, count] = l.match(/^- \*\*`([^`]+)`\*\* — (\d+) plików/);
  const list = [...l.slice(l.indexOf(':') + 1).matchAll(/`([^`]+)`/g)].map(m => m[1]);
  assert.equal(list.length, Number(count), `appendix E ${name}: count`);
  const word = new RegExp((name.startsWith('Q.') ? 'Q\\.' + name.slice(2) : '\\b' + name) + '\\b');
  for (const item of list) {
    const file = item.startsWith('qdisplays/') ? `source/qdisplays/${item.slice(10)}.qdisplay.dry` : `source/scenes/${item}.scene.dry`;
    assert.ok(word.test(read(file)), `appendix E ${name}: ${file}`);
  }
}
assert.equal(appE.length, 7, 'appendix E lists seven variables');

// ---- Stage 1 (0.42): done, its files exist, its decisions and findings are recorded.
assert.ok(stages[1].text.includes('**Stan:** wykonany'), 'stage 1 is marked as done');
const stage1Files = ['source/rules/polish_engine_hooks.js', 'source/scenes/polish_advisor_commit.scene.dry', 'source/scenes/polish_event_router.scene.dry',
  'source/scenes/polish_discard.scene.dry', 'tests/rules-turn.test.js', 'tests/polish-turn.test.js'];
for (const f of stage1Files) assert.ok(fs.existsSync(path.join(root, f)), `stage 1 file ${f} exists`);
assert.ok(decisions.includes('Decyzje etapu 1 (Z — 0.42):'), 'stage 1 decisions recorded');
assert.ok(plan.includes('## 11. Ustalenia z etapu 1'), 'stage 1 findings');
assert.ok(/^### 23\.15\. Etap 1 wdrożony/m.test(tr), 'reference 23.15 records stage 1');
assert.equal((tr.match(/\*\*K — etap 1 \(0\.42\):\*\*/g) || []).length, 5, 'five K notes of stage 1 in chapter 4');
assert.ok(loadsScript(read('out/html/index.html'), 'polish_engine_hooks.js'), 'the page loads the engine hooks');
assert.ok(read('out/html/game.js').includes('window.PolishEngineHooks.install('), 'game.js installs the engine hooks');
const advisers = ['arciszewski', 'czapinski', 'daszynski', 'drobner', 'dubois', 'jaworowski', 'malinowski', 'moraczewski', 'niedzialkowski', 'perl', 'prochnik', 'puzak', 'zaremba', 'ziemiecki'];
const commits = advisers.reduce((n, a) => n + (read(`source/scenes/advisors/${a}.scene.dry`).match(/^call: polish_advisor_commit$/gm) || []).length, 0);
// Stage 4 added the second Labour Programme option of Arciszewski (benefits), hence 22; stage 6 opened Czapiński's
// public ownership and workers' representation, which open the Industry card, hence 24.
assert.equal(commits, 24, 'every Polish adviser action commits through the rules module');

// ---- Stage 2 (0.43): done, its files exist, its decisions and findings are recorded; decision 1 moved
// card 7.7 and "Kompromis listowy a Lewica" to stage 3 and "C4" to stage 4.
assert.ok(stages[2].text.includes('**Stan:** wykonany'), 'stage 2 is marked as done');
const stage2Files = ['source/rules/polish_institutions.js', 'source/scenes/polish_speaker_election.scene.dry',
  'source/scenes/polish_chapter_report.scene.dry', 'tests/rules-institutions.test.js', 'tests/polish-institutions.test.js'];
for (const f of stage2Files) assert.ok(fs.existsSync(path.join(root, f)), `stage 2 file ${f} exists`);
assert.ok(decisions.includes('Decyzje etapu 2 (Z — 0.43):'), 'stage 2 decisions recorded');
assert.ok(plan.includes('## 12. Ustalenia z etapu 2'), 'stage 2 findings');
assert.ok(/^### 23\.16\. Etap 2 wdrożony/m.test(tr), 'reference 23.16 records stage 2');
assert.equal((tr.match(/\*\*K — etap 2 \(0\.43\)/g) || []).length, 12, 'twelve K notes of stage 2');
assert.ok(loadsScript(read('out/html/index.html'), 'polish_institutions.js'), 'the page loads the institutions module');
assert.ok(byStageA[3].includes('7.7') && !byStageA[2].includes('7.7'), 'card 7.7 is in stage 3');
assert.ok(byStageB[3].includes('Kompromis listowy a Lewica') && byStageB[4].includes('C4'), 'the two moved tests are in stages 3 and 4');

// ---- Stage 3 (0.44): done, its files exist, its decisions and findings are recorded; decision 6 moved
// card 9.1 to stage 7.
assert.ok(stages[3].text.includes('**Stan:** wykonany'), 'stage 3 is marked as done');
const stage3Files = ['source/rules/polish_government.js', 'source/scenes/polish_cabinet_formation.scene.dry',
  'source/scenes/polish_government_support.scene.dry', 'source/scenes/polish_government_response.scene.dry',
  'source/scenes/polish_list_agreement.scene.dry', 'tests/rules-negotiation.test.js', 'tests/polish-cabinet.test.js'];
for (const f of stage3Files) assert.ok(fs.existsSync(path.join(root, f)), `stage 3 file ${f} exists`);
assert.ok(decisions.includes('Decyzje etapu 3 (Z — 0.44):'), 'stage 3 decisions recorded');
assert.ok(plan.includes('## 13. Ustalenia z etapu 3'), 'stage 3 findings');
assert.ok(/^### 23\.17\. Etap 3 wdrożony/m.test(tr), 'reference 23.17 records stage 3');
assert.equal((tr.match(/\*\*K — etap 3 \(0\.44\):\*\*/g) || []).length, 18, 'eighteen K notes of stage 3');
assert.ok(loadsScript(read('out/html/index.html'), 'polish_government.js'), 'the page loads the government module');
assert.ok(byStageA[7].includes('9.1') && !byStageA[3].includes('9.1'), 'card 9.1 is in stage 7');
assert.ok(!/\bcoalition_dissent\b/.test(read('source/scenes/advisors/malinowski.scene.dry') + read('source/scenes/advisors/ziemiecki.scene.dry')),
  'leak 2: the Polish advisers no longer write the German coalition counter');

// ---- Stage 4 (0.45): done, its files exist, its decisions and findings are recorded; decision 4
// moved nine tests to stages 5-7; the German economy is switched off by a guard, not deleted.
assert.ok(stages[4].text.includes('**Stan:** wykonany'), 'stage 4 is marked as done');
const stage4Files = ['source/rules/polish_economy.js', 'source/rules/polish_projects.js', 'source/scenes/polish_agenda.scene.dry',
  'source/scenes/polish_unemployment_bill.scene.dry', 'source/scenes/polish_budget_package.scene.dry', 'source/scenes/polish_constitution_project.scene.dry',
  'source/scenes/polish_event_stabilization.scene.dry', 'source/scenes/polish_event_credit_crisis.scene.dry', 'source/scenes/polish_event_austerity_1926.scene.dry',
  'tests/rules-economy.test.js', 'tests/rules-projects.test.js', 'tests/polish-economy.test.js', 'tests/polish-government-cards.test.js'];
const govCards = ['labor_rights', 'social_welfare', 'finance', 'currency', 'investment', 'industry', 'public_works', 'land', 'agriculture',
  'education', 'minority_schools', 'justice', 'heritage'];
for (const f of stage4Files.concat(govCards.map(c => `source/scenes/government_affairs/polish_gov_${c}.scene.dry`))) {
  assert.ok(fs.existsSync(path.join(root, f)), `stage 4 file ${f} exists`);
}
assert.ok(decisions.includes('Decyzje etapu 4 (Z — 0.45):'), 'stage 4 decisions recorded');
assert.ok(plan.includes('## 14. Ustalenia z etapu 4'), 'stage 4 findings');
assert.ok(/^### 23\.18\. Etap 4 wdrożony/m.test(tr), 'reference 23.18 records stage 4');
assert.equal((tr.match(/\*\*K — etap 4 \(0\.45\):\*\*/g) || []).length, 22, 'twenty-two K notes of stage 4');
for (const script of ['polish_economy.js', 'polish_projects.js']) assert.ok(loadsScript(read('out/html/index.html'), script), `the page loads ${script}`);
for (const [name, stage] of [['Populacja', 5], ['Warianty funduszu inwestycyjnego', 5], ['Szkoły', 5], ['Ratunek zakładu', 6], ['Wspólna karta gabinetowa', 6],
  ['Reprezentacja', 7], ['Autonomia', 7], ['Sprawiedliwość', 7], ['Rozszerzyć i skupić osłony', 7]]) {
  assert.ok(byStageB[stage].includes(name) && !byStageB[4].includes(name), `decision 4 of stage 4: ${name} is in stage ${stage}`);
}
assert.equal(byStageB[4].length, 36, 'stage 4 keeps 36 tests of 21.1 (35 and the debate on the constitution of Z — 0.56)');
assert.ok(/if \(!Q\.polish_economy_system\) \{/.test(read('source/scenes/post_event.scene.dry')), 'leaks 1 and 9: the German monthly economy is guarded');
for (const card of ['economic_policy', 'fiscal_policy', 'social_welfare', 'labor_rights', 'agricultural_policy', 'education_science', 'judiciary',
  'constitutional_reform', 'economic_democracy']) {
  assert.ok(/^view-if: not polish_economy_system and \(/m.test(read(`source/scenes/government_affairs/${card}.scene.dry`)), `the German card ${card} is guarded`);
}
assert.ok(/^view-if: not polish_economy_system and \(/m.test(read('source/scenes/events/high_inflation.scene.dry')), 'the high-inflation scene is guarded');

// ---- Stage 5 (0.46): done, its files exist, its decisions and findings are recorded; decision 2 took the three
// union branches from stage 6; the three automatic faction crises leave the queue and the inherited party cards are
// guarded, not deleted; leak 10 is closed.
assert.ok(stages[5].text.includes('**Stan:** wykonany'), 'stage 5 is marked as done');
const stage5Files = ['source/rules/polish_electorate.js', 'source/rules/polish_party.js', 'source/scenes/polish_party_agenda.scene.dry',
  'source/scenes/polish_event_faction_split.scene.dry', 'tests/rules-party.test.js', 'tests/polish-party.test.js', 'tests/rules-electorate.test.js',
  'tests/rules-strategy.test.js', 'tests/rules-factions.test.js'];
const partyCards = ['organizations', 'militia', 'dues', 'media', 'direction', 'main_opponent', 'pils_influence', 'form_of_power', 'electoral_base',
  'slavic_autonomy', 'jewish_cooperation', 'ussr_position', 'economic_program', 'unity', 'advisers'];
for (const f of stage5Files.concat(partyCards.map(c => `source/scenes/party_affairs/polish_party_${c}.scene.dry`))) {
  assert.ok(fs.existsSync(path.join(root, f)), `stage 5 file ${f} exists`);
}
assert.ok(decisions.includes('Decyzje etapu 5 (Z — 0.46):'), 'stage 5 decisions recorded');
assert.ok(plan.includes('## 15. Ustalenia z etapu 5'), 'stage 5 findings');
assert.ok(/^### 23\.19\. Etap 5 wdrożony/m.test(tr), 'reference 23.19 records stage 5');
assert.equal((tr.match(/\*\*K — etap 5 \(0\.46\):\*\*/g) || []).length, 34, 'thirty-four K notes of stage 5');
for (const script of ['polish_electorate.js', 'polish_party.js']) assert.ok(loadsScript(read('out/html/index.html'), script), `the page loads ${script}`);
assert.equal(byStageB[5].length, 67, 'stage 5 keeps 67 tests of 21.1');
const rulesSource = read('source/rules/polish_rules.js');
assert.ok(rulesSource.includes("polish_event_faction_split: Object.freeze({definition_id: 'party.faction_split'"), 'E3 is one definition of the queue');
for (const scene of ['pps_lewica_split', 'pps_pilsudczycy_split', 'pps_centrum_crisis']) {
  const text = read(`source/scenes/events/${scene}.scene.dry`);
  assert.ok(/^tags: event$/m.test(text) && /^view-if: not polish_party_rules and /m.test(text), `${scene} stays in the files, outside the Polish queue`);
  assert.ok(!rulesSource.includes(`${scene}:`), `${scene} has no queue definition`);
}
for (const card of ['campaigning', 'fundraising', 'ideology', 'media', 'party_disunity', 'party_organizations', 'reichsbanner', 'shuffle_leadership',
  'rally', 'enemies', 'international_relations']) {
  assert.ok(/^view-if: not polish_party_rules\b/m.test(read(`source/scenes/party_affairs/${card}.scene.dry`)), `the inherited card ${card} is guarded`);
}
assert.ok(!/\bpro_republic\b/.test(read('source/scenes/advisors/niedzialkowski.scene.dry') + read('source/scenes/advisors/prochnik.scene.dry')),
  'leak 10: the Polish advisers no longer write pro_republic');

// ---- Stage 6 (0.47): done, its files exist, its decisions and findings are recorded; the plants of decision 2 are
// synthetic records; the German strike events are guarded and stay in the files; Czapiński's variants open the card.
assert.ok(stages[6].text.includes('**Stan:** wykonany'), 'stage 6 is marked as done');
const stage6Files = ['source/rules/polish_unions.js', 'source/scenes/polish_union_agenda.scene.dry', 'source/scenes/polish_event_strike_1923.scene.dry',
  'source/scenes/polish_strike_steps.scene.dry', 'source/scenes/polish_event_strike_response.scene.dry', 'source/scenes/polish_event_strike_rejection.scene.dry',
  'tests/rules-strike.test.js', 'tests/polish-strike.test.js'];
for (const f of stage6Files) assert.ok(fs.existsSync(path.join(root, f)), `stage 6 file ${f} exists`);
assert.ok(decisions.includes('Decyzje etapu 6 (Z — 0.47):'), 'stage 6 decisions recorded');
assert.ok(plan.includes('## 16. Ustalenia z etapu 6'), 'stage 6 findings');
assert.ok(/^### 23\.20\. Etap 6 wdrożony/m.test(tr), 'reference 23.20 records stage 6');
assert.equal((tr.match(/\*\*K — etap 6 \(0\.47\):\*\*/g) || []).length, 26, 'twenty-six K notes of stage 6');
assert.ok(loadsScript(read('out/html/index.html'), 'polish_unions.js'), 'the page loads polish_unions.js');
const pageOrder = ['polish_party.js', 'polish_unions.js', 'polish_engine_hooks.js'].map(f => scriptAt(read('out/html/index.html'), f));
assert.ok(pageOrder[0] < pageOrder[1] && pageOrder[1] < pageOrder[2], 'the unions module loads after the party and before the engine hooks');
assert.equal(byStageB[6].length, 18, 'stage 6 keeps 18 tests of 21.1');
const strikeTests = read('tests/rules-strike.test.js') + read('tests/polish-strike.test.js') + read('tests/rules-economy.test.js');
for (const name of byStageB[6]) assert.ok(strikeTests.includes(`test('${name}`), `stage 6 test „${name}” is implemented`);
for (const [id, category] of [['society.strike_1923', 5], ['parliament.strike_response', 5], ['society.strike_settlement_rejection', 1]]) {
  assert.ok(new RegExp(`definition_id: '${id.replace('.', '\\.')}', category: ${category}`).test(rulesSource), `${id} is one definition of the queue with category ${category}`);
}
for (const scene of ['labor_unrest', 'unions_declare_independence']) {
  assert.ok(/^view-if: not polish_union_rules and \(/m.test(read(`source/scenes/events/${scene}.scene.dry`)), `${scene} stays in the files, outside the Polish queue`);
}
const unionsSource = read('source/rules/polish_unions.js');
assert.ok(unionsSource.includes("const PLANT_PROFILE_ID = 'synthetic_plants_v1';") && unionsSource.includes("const STATE_PROFILE_ID = 'strike_state_profiles_v1';"),
  'decisions 2A and 3A: the synthetic plant profile and the state profile are named');
const czapinski = read('source/scenes/advisors/czapinski.scene.dry');
assert.ok((czapinski.match(/^go-to: polish_gov_industry$/gm) || []).length === 2 && !/choose-if: \{! return false !\}/.test(czapinski),
  'Czapiński: public ownership and representation open the Industry card');

// ---- Stage 7 (0.48): done, its files exist, its decisions and findings are recorded; the three dated inputs of decision 1,
// the certain assassination of decision 2 and the legal profile of restrictions of decision 3; the coup engine keeps the
// M08 profile; 26 German scenes that write coup_progress or pro_republic are guarded and stay in the files (leak 3).
assert.ok(stages[7].text.includes('**Stan:** wykonany'), 'stage 7 is marked as done');
const stage7Files = ['source/rules/polish_politics.js', 'source/rules/polish_security.js', 'source/scenes/polish_event_pils_criticism.scene.dry',
  'source/scenes/polish_event_cabinet_1922.scene.dry', 'source/scenes/polish_event_assassination_response.scene.dry',
  'source/scenes/polish_event_niewiadomski_cult.scene.dry', 'source/scenes/polish_event_coup.scene.dry', 'source/scenes/polish_parliament_army_oversight.scene.dry',
  'source/scenes/government_affairs/polish_gov_interior.scene.dry', 'source/scenes/government_affairs/polish_gov_military.scene.dry',
  'source/scenes/government_affairs/polish_gov_pils_agreement.scene.dry', 'tests/rules-politics.test.js', 'tests/polish-democracy.test.js',
  'tests/rules-coup.test.js', 'tests/polish-coup.test.js'];
for (const f of stage7Files) assert.ok(fs.existsSync(path.join(root, f)), `stage 7 file ${f} exists`);
assert.ok(decisions.includes('Decyzje etapu 7 (Z — 0.48):'), 'stage 7 decisions recorded');
assert.ok(plan.includes('## 17. Ustalenia z etapu 7'), 'stage 7 findings');
assert.ok(/^### 23\.21\. Etap 7 wdrożony/m.test(tr), 'reference 23.21 records stage 7');
assert.equal((tr.match(/\*\*K — etap 7 \(0\.48\):\*\*/g) || []).length, 32, 'thirty-two K notes of stage 7');
const page7 = read('out/html/index.html');
const pageOrder7 = ['polish_unions.js', 'polish_politics.js', 'polish_security.js', 'polish_engine_hooks.js'].map(f => scriptAt(page7, f));
assert.ok(pageOrder7.every(i => i >= 0) && pageOrder7[0] < pageOrder7[1] && pageOrder7[1] < pageOrder7[2] && pageOrder7[2] < pageOrder7[3],
  'the politics and security modules load after the unions and before the engine hooks');
assert.equal(byStageB[7].length, 54, 'stage 7 keeps 54 tests of 21.1 (53 and the silence of B2 of Z — 0.56)');
const democracyTests = ['tests/rules-politics.test.js', 'tests/polish-democracy.test.js', 'tests/rules-coup.test.js', 'tests/polish-coup.test.js',
  'tests/rules-projects.test.js'].map(read).join('\n');
for (const name of byStageB[7]) assert.ok(democracyTests.includes(`test('${name}`), `stage 7 test „${name}” is implemented`);
// Z — 0.56: B2 left the queue and is a card of the Parliament deck.
assert.ok(!/definition_id: 'politics\.pils_parliament_criticism'/.test(rulesSource), 'B2 is no longer a queued event');
assert.ok(read('source/scenes/polish_event_pils_criticism.scene.dry').includes('tags: parliament_affairs'), 'B2 is a card of the Parliament deck');
for (const [id, category] of [['opening.cabinet_1922', 2], ['presidency.assassination_response', 5],
  ['society.niewiadomski_cult', 6], ['coup.attempt', 2]]) {
  assert.ok(new RegExp(`definition_id: '${id.replace('.', '\\.')}', category: ${category}`).test(rulesSource), `${id} is one definition of the queue with category ${category}`);
}
const politicsSource = read('source/rules/polish_politics.js'), securitySource = read('source/rules/polish_security.js');
// The dates themselves were researched in stage 8 (part 8f): the military case from VII 1923 instead of the test input I 1925.
assert.ok(/const SCENARIO_INPUTS = Object\.freeze\(\{profile_id: 'normal_chapter1_v1', dispute_1922: T\(1922, 6\), military_case: T\(1923, 7\),/.test(politicsSource) &&
  rulesSource.includes('inputs: {dispute_1922: true, military_case: true, niewiadomski_cult: true'), 'decision 1A: three dated scenario inputs of normal_chapter1_v1');
assert.ok(read('source/scenes/polish_presidential_sequence.scene.dry').includes("pending.phase = election.winner_id === 'gabriel_narutowicz' ? 'assassination' : 'complete';"),
  'decision 2B: the election of Narutowicz, and only it, ends in the assassination');
assert.ok(politicsSource.includes("kind: 'strike_repression'") && politicsSource.includes("kind: 'press_confiscation'") &&
  politicsSource.includes("kind: 'militia_ban', target: 'Milicja PPS', lawful: true"), 'decision 3A: restrictions come from existing actions, each with a legal profile');
assert.ok(securitySource.includes("const COUP_PROFILE_ID = 'coup_f_v1';") && securitySource.includes("const FORCE_PROFILE_ID = 'synthetic_test_v2';"),
  'the coup engine and the synthetic force profile are named');
assert.ok(!/\bcoup_progress\b/.test(politicsSource + securitySource), 'leak 3: the Polish coup never reads the German coup_progress');
const guarded7 = ['advisors/leber', 'advisors/rosenfeld', 'advisors/sender', 'advisors/seydewitz', 'events/all_quiet', 'events/austrian_civil_war',
  'events/banking_crisis', 'events/capital_strike', 'events/emergency_cuts', 'events/harzburg_front', 'events/hunger_chancellor', 'events/march_on_berlin',
  'events/nazis_in_crisis', 'events/prussian_coup', 'events/return_to_normalcy', 'events/schleichers_schemes', 'events/unemployment_insurance_1',
  'events/unemployment_insurance_weimar', 'events/weltbuhne', 'events/young_plan_right_coalition', 'government_affairs/deport_hitler',
  'government_affairs/foreign_policy', 'government_affairs/military_policy', 'government_affairs/police', 'party_affairs/confronting_nazis',
  'party_affairs/crisis_program'];
assert.equal(guarded7.length, 26, 'twenty-six German scenes');
for (const scene of guarded7) {
  assert.ok(/^view-if: not polish_security_rules and \(/m.test(read(`source/scenes/${scene}.scene.dry`)), `${scene} stays in the files, outside the Polish game`);
}

// ---- Stage 8 (0.49): done and the last stage of the plan; its files exist, its decisions and findings are recorded; the
// researched dates of 8f and the dated resignation of Grabski (A1), the zero start pressure, the NPR alternative of rule
// 8.9 (A2), the KPP goal and front of 9.6 (fix 1), the agenda without the dead KPP trial (fix 2), no German music (fix 5).
assert.ok(stages[8].text.includes('**Stan:** wykonany'), 'stage 8 is marked as done');
const stage8Files = ['tests/helpers/strategies.js', 'tests/polish-campaign.test.js', 'tests/polish-scenario.test.js',
  'analysis/stage8-campaigns/run.cjs', 'analysis/stage8-campaigns/REPORT.md', 'analysis/stage8-campaigns/calibration.json',
  'analysis/stage8-research/REPORT.md', 'analysis/stage8-research/whatif.cjs'];
for (const f of stage8Files) assert.ok(fs.existsSync(path.join(root, f)), `stage 8 file ${f} exists`);
assert.ok(decisions.includes('Decyzje etapu 8 (Z — 0.49):'), 'stage 8 decisions recorded');
assert.ok(plan.includes('## 18. Ustalenia z etapu 8') && plan.includes('**Koniec planu:** etap 8 był ostatni'), 'stage 8 findings and the end of the plan');
assert.ok(/^### 23\.22\. Etap 8 wdrożony/m.test(tr), 'reference 23.22 records stage 8');
assert.equal((tr.match(/\*\*K — etap 8 \(0\.49\)[^*]*\*\*/g) || []).length, 21, 'twenty-one K notes of stage 8');
assert.equal(byStageB[8].length, 0, 'stage 8 has no tests of 21.1; its checks are the full campaigns of 21.2');
assert.ok(read('tests/polish-campaign.test.js').includes("require('./helpers/strategies.js')"), 'the campaign test plays the strategies of the helpers');
assert.ok(/military_case: T\(1923, 7\),\s*military_escalation: T\(1925, 11\), niewiadomski_cult: T\(1923, 2\), chjeno_piast_1923: T\(1923, 5\),/.test(politicsSource) &&
  politicsSource.includes('grabski_resignation_1925: T(1925, 11)}') && politicsSource.includes('function scanGrabskiResignation(Q)'),
  'stage 8: the dates of 8f and the dated resignation of Grabski (A1)');
assert.ok(politicsSource.includes('pressure: 0,') && rulesSource.includes("coup: {pressure: 0, phase: 'dormant'") && rulesSource.includes('grabski_resignation_1925: true'),
  'stage 8: the coup pressure starts at 0 and the scenario has the Grabski input');
const governmentSource = read('source/rules/polish_government.js');
assert.ok(governmentSource.includes("const ACTOR_PROFILE_ID = 'actor_profiles_v2';") &&
  governmentSource.includes("const PORTFOLIO_ALTERNATIVES = Object.freeze({skrzynski_broad: Object.freeze({npr: Object.freeze(['economic'])})});") &&
  governmentSource.includes('function kppFrontPrepared(S)'), 'stage 8: actor profile v2, rule 8.9 for the NPR (A2) and the KPP front after 9.6 (fix 1)');
assert.ok(read('source/rules/polish_unions.js').includes("const PARTNER_GOAL = 'structural';"), 'stage 8: the KPP goal of 8f');
assert.ok(!/^- @kpp_trial/m.test(read('source/scenes/polish_party_agenda.scene.dry')), 'fix 2: the agenda no longer lists the KPP trial');
assert.ok(!/^audio:/m.test(section(read('source/scenes/root.scene.dry'), '@1928_main', '= January 1922')), 'fix 5: the title screen plays no German music');
for (const f of ['credits_images.txt', 'credits_music.txt']) assert.ok(fs.existsSync(path.join(root, f)), `${f} is kept`);

// ---- Results.
const docs = [PLAN, TR, CAT];
const hashes = Object.fromEntries(docs.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
const count = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v.length]));
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({
  scope: 'Implementation plan 0.40: stages 0-8, catalogue entries, 21.1 tests and 20.2 leaks each assigned once; scope sections, files and links exist; approved decisions recorded.',
  hashes, stages: stages.length, cardsByStage: count(byStageA), testsByStage: count(byStageB), tests: tests.length,
  leaksByStage: Object.fromEntries(stages.map(s => [s.n, s.leaks])), manifestRows: appD.length,
  files: { existingChecked: files.existing, plannedNewFiles: files.planned.sort() }, links: links.length,
  stage0: { done: true, files: stage0Files, appendixEVariables: appE.length },
  stage1: { done: true, files: stage1Files, adviserCommits: commits },
  stage2: { done: true, files: stage2Files, movedToStage3: ['7.7', 'Kompromis listowy a Lewica'], movedToStage4: ['C4'] },
  stage3: { done: true, files: stage3Files, movedToStage7: ['9.1'] },
  stage4: { done: true, files: stage4Files.length + govCards.length, movedTests: { 5: ['Populacja', 'Warianty funduszu inwestycyjnego', 'Szkoły'],
    6: ['Ratunek zakładu', 'Wspólna karta gabinetowa'], 7: ['Reprezentacja', 'Autonomia', 'Sprawiedliwość', 'Rozszerzyć i skupić osłony'] } },
  stage5: { done: true, files: stage5Files.length + partyCards.length, unionsFromStage6: ['S.unions: three branches'], leakClosed: 10 },
  stage6: { done: true, files: stage6Files.length, testsImplemented: byStageB[6].length, kNotes: 26, plantProfile: 'synthetic_plants_v1', stateProfile: 'strike_state_profiles_v1' },
  stage7: { done: true, files: stage7Files.length, testsImplemented: byStageB[7].length, kNotes: 32, scenarioProfile: 'normal_chapter1_v1',
    forceProfile: 'synthetic_test_v2', coupProfile: 'coup_f_v1', guardedGermanScenes: guarded7.length, leakClosed: 3 },
  stage8: { done: true, lastStage: true, files: stage8Files.length, kNotes: 21, testsOf21_1: byStageB[8].length, actorProfile: 'actor_profiles_v2',
    newScenarioInputs: ['military_escalation', 'chjeno_piast_1923', 'piast_split_1923', 'grabski_resignation_1925'], startPressure: 0, kppGoal: 'structural' },
}, null, 2) + '\n');
console.log(`PASS: ${stages.length} stages; ${assignedCards.length} catalogue entries, ${assignedTests.length} tests from 21.1 and 10 leaks from 20.2 each assigned once; ${files.existing} named files exist, ${files.planned.length} marked new; ${links.length} links resolve; decisions recorded in 19.3, 20.1, 20.3 and the registers.`);
for (const s of stages) console.log(`stage ${s.n}: ${byStageA[s.n].length} catalogue entries, ${byStageB[s.n].length} tests, leaks ${s.leaks.join(', ') || '—'}`);
