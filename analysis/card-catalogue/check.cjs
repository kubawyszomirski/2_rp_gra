#!/usr/bin/env node
'use strict';
// Card-catalogue diagnostics for docs/POLISH_CARD_CATALOGUE.md (reference 0.32). The catalogue creates no
// rules, so it must: cover every card family, sub-action, event and advisor action named in the technical
// reference; keep the approved table template; cite only existing current sections and 21.1 tests; name
// existing code files; and repeat the time, resource and cooldown tokens of technical 17.2. It also checks
// the two stance-card rules approved with it (10.5, 10.10, 21.1). Documentation diagnostics only.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const CAT = 'docs/POLISH_CARD_CATALOGUE.md', TR = 'docs/POLISH_TECHNICAL_REFERENCE.md';
const cat = read(CAT), tr = read(TR);
const cells = line => line.split(/(?<!\\)\|/).slice(1, -1).map(c => c.trim());
const section = (text, from, to) => { const a = text.indexOf(from); assert.ok(a >= 0, from); const b = to ? text.indexOf(to, a + from.length) : text.length; return text.slice(a, b < 0 ? text.length : b); };

// ---- Reference: current numbered sections (chapters 1-22) and 21.1 test names.
const trCurrent = tr.slice(0, tr.indexOf('\n## 23. '));
const sections = new Set([...trCurrent.matchAll(/^#{2,4} (\d+(?:\.\d+)*[a-z]?)\. /gm)].map(m => m[1]));
const tests = new Set(section(tr, '### 21.1. ', '### 21.2. ').split('\n').filter(l => l.startsWith('| ')).map(l => cells(l)[0]));

// ---- Reference IDs that the catalogue must cover.
const idsIn = (text, firstColumnOnly) => {
  const out = [];
  for (const l of text.split('\n').filter(x => x.startsWith('| '))) {
    const c = firstColumnOnly ? cells(l)[0] : l;
    for (const m of (c || '').matchAll(/`([a-z]+\.[a-z0-9_]+(?:\/[a-z0-9_]+)*(?:\.[a-z0-9_]+)?)`/g)) {
      const parts = m[1].split('/'), prefix = parts[0].slice(0, parts[0].lastIndexOf('.') + 1);
      out.push(parts[0], ...parts.slice(1).map(p => prefix + p));
    }
  }
  return out;
};
const required = {
  '10.5 party deck': idsIn(section(tr, '### 10.5. ', '**Program gospodarczy — do trzech'), true),
  '17.2 actions': idsIn(section(tr, '### 17.2. ', '### 17.3. '), true),
  '17.3 events': idsIn(section(tr, '### 17.3. ', '### 17.4. '), true),
  '17.9 links': idsIn(section(tr, '### 17.9. ', '### 17.10. '), true),
  '17.10 parliament': idsIn(section(tr, '### 17.10. ', '**Budżet — bramka'), true),
  '17.11 government': idsIn(section(tr, '### 17.11. ', '**Dostęp i czas:**'), true),
  '10.4.3 advisors': idsIn(section(tr, '#### 10.4.3. ', '**Redukcja powtórzeń:**'), false).filter(id => id.startsWith('advisor.')),
};
const catIds = new Set([...cat.matchAll(/`([a-z]+\.[a-z0-9_.]+)`/g)].map(m => m[1]));
const missing = Object.fromEntries(Object.entries(required).map(([k, ids]) => [k, [...new Set(ids)].filter(id => !catIds.has(id))]));
for (const [k, ids] of Object.entries(missing)) assert.deepEqual(ids, [], `catalogue covers ${k}`);
const requiredCount = Object.fromEntries(Object.entries(required).map(([k, ids]) => [k, new Set(ids).size]));
assert.equal(requiredCount['10.5 party deck'], 16); // 15 families plus the separate adviser card (0.35) assert.equal(requiredCount['17.10 parliament'], 10); assert.equal(requiredCount['17.11 government'], 16);
assert.equal(requiredCount['10.4.3 advisors'], 22);

// ---- Catalogue entries: template, statuses, sources, tests, code files, open questions.
const CARD = ['Talia i pula', 'Dostęp', 'Koszt', 'Limit wyboru', 'Odnowienie', 'Wyjątek', 'Zapisuje', 'Odczytują', 'Co zostaje po karcie', 'Obecny kod', 'Źródła i testy'];
const EVENT = ['Rodzaj', 'Wyzwalacz', 'Okno', 'Kolejka', 'Powtarzalność', 'Koszt odpowiedzi', 'Bez odpowiedzi', 'Zapisuje', 'Odczytują', 'Co zostaje po karcie', 'Obecny kod', 'Źródła i testy'];
const OPTIONS = ['Opcja (ID)', 'Zablokowana, gdy', 'Skutek od razu', 'Skutek później', 'Status'];
const STATUS = /^(—|pytanie \d+( w \d+\.\d+ katalogu)?|[ZPKHB]( \/ [ZPKHB])*(; (pytanie \d+|historycznie B|luka, pytanie \d+))?)$/;
const sourceFiles = [];
(function walk(dir) { for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) { const r = path.join(dir, e.name); if (e.isDirectory()) walk(r); else sourceFiles.push(r); } })('source');
const sourceText = sourceFiles.map(f => read(f)).join('\n');

const entries = [];
const chunks = cat.split(/^### /m).slice(1);
for (const chunk of chunks) {
  const lines = chunk.split('\n');
  const title = lines[0].trim();
  const m = title.match(/^(\d+\.\d+)\. (.+?) — (.+)$/);
  assert.ok(m, `heading format: ${title}`);
  const ids = [...m[3].matchAll(/`([^`]+)`/g)].map(x => x[1]);
  assert.ok(ids.length > 0 || m[3] === 'bez ID', `heading has an ID or says "bez ID": ${title}`);
  const tables = []; let cur = null;
  for (const l of lines) { if (l.startsWith('|')) { if (!cur) tables.push(cur = []); cur.push(l); } else cur = null; }
  assert.ok(tables.length >= 2, `${m[1]}: header and options tables`);
  for (const tb of tables) { const n = cells(tb[0]).length; tb.forEach((l, i) => assert.equal(cells(l).length, n, `${m[1]}: row ${i + 1} of a table has ${n} cells`)); }
  const header = tables[0].slice(2).map(cells), fields = header.map(r => r[0]);
  const kind = fields[0] === 'Rodzaj' ? 'event' : 'card';
  assert.deepEqual(fields, kind === 'event' ? EVENT : CARD, `${m[1]}: header fields`);
  assert.deepEqual(cells(tables[0][0]), ['Pole', 'Treść', 'Status'], `${m[1]}: header columns`);
  assert.deepEqual(cells(tables[1][0]), OPTIONS, `${m[1]}: options columns`);
  const options = tables[1].slice(2).map(cells);
  assert.ok(options.length >= 1, `${m[1]}: at least one option row`);
  for (const r of [...header, ...options]) assert.match(r[r.length - 1], STATUS, `${m[1]}: status "${r[r.length - 1]}"`);
  const get = f => header.find(r => r[0] === f)[1];
  // Sources: current sections only, and test names from 21.1.
  const src = get('Źródła i testy');
  const citedTests = [...src.matchAll(/„([^”]+)”/g)].map(x => x[1]);
  for (const t of citedTests) assert.ok(tests.has(t), `${m[1]}: test „${t}” exists in 21.1`);
  const citedSections = [...src.replace(/„[^”]+”/g, '').matchAll(/(?<![\d.])(\d+(?:\.\d+)*[a-z]?)(?!\d|\.\d)/g)].map(x => x[1]);
  for (const s of citedSections) assert.ok(sections.has(s), `${m[1]}: section ${s} exists in chapters 1-22`);
  // Code: named files exist; "no scene with this ID" is true.
  const code = get('Obecny kod');
  for (const f of [...code.matchAll(/`(source\/[^`]+)`/g)].map(x => x[1])) assert.ok(fs.existsSync(path.join(root, f)), `${m[1]}: ${f} exists`);
  if (/Brak sceny z tym ID/.test(code)) for (const id of ids) assert.ok(!sourceText.includes(id), `${m[1]}: ${id} absent from source/`);
  // Open questions.
  const q = chunk.match(/\*\*Otwarte pytania:\*\*(.*?)(?=\n## |$)/s);
  assert.ok(q, `${m[1]}: open questions line`);
  const questions = q[1].trim().startsWith('brak.') ? [] : [...q[1].matchAll(/^\d+\. (.+)$/gm)].map(x => x[1]);
  assert.ok(q[1].trim().startsWith('brak.') || questions.length > 0, `${m[1]}: questions listed or "brak."`);
  entries.push({ num: m[1], name: m[2], ids, kind, cost: [get(kind === 'event' ? 'Koszt odpowiedzi' : 'Koszt'), kind === 'card' ? get('Odnowienie') : '', kind === 'card' ? get('Limit wyboru') : ''].join(' '), text: chunk, options, questions, citedTests: citedTests.length });
}
assert.equal(entries.length, 69);
const nums = new Set(entries.map(e => e.num));
for (const r of cat.matchAll(/(\d+\.\d+) katalogu/g)) assert.ok(nums.has(r[1]), `internal reference ${r[1]} katalogu exists`);

// ---- Costs and cooldowns: every T, R and cd token of a 17.2 row appears where the catalogue shows that action.
const tokens = t => [...t.matchAll(/(?<![\d,])(\d+) T\b/g)].map(x => `${x[1]} T`)
  .concat([...t.matchAll(/(?<![\d,])(\d+) R\b/g)].map(x => `${x[1]} R`), [...t.matchAll(/cd (\d+) M/g)].map(x => `cd ${x[1]} M`));
const costChecks = [];
for (const l of section(tr, '### 17.2. ', '### 17.3. ').split('\n').filter(x => x.startsWith('| `'))) {
  const [first, cost] = cells(l);
  const ids = idsIn(`| ${first} |`, true), want = [...new Set(tokens(cost))];
  for (const id of new Set(ids)) {
    const where = entries.filter(e => e.text.includes('`' + id + '`'));
    assert.ok(where.length > 0 || cat.includes('`' + id + '`'), `${id} shown in the catalogue`);
    const shown = where.map(e => e.cost + ' ' + e.text.split('\n').filter(x => x.includes('`' + id + '`')).join(' ')).join(' ')
      + ' ' + cat.split('\n').filter(x => x.startsWith('- ') && x.includes('`' + id + '`')).join(' ');
    const have = new Set(tokens(shown.replace(/−/g, '')));
    const lost = want.filter(w => !have.has(w));
    assert.deepEqual(lost, [], `${id}: 17.2 tokens ${want.join(', ')} appear in the catalogue`);
    costChecks.push({ id, tokens: want });
  }
}

// ---- Stance cards: the present line can be confirmed in every option (Z — 0.51, replacing the 0.32 block); the
// approved faction profile is written.
for (const e of entries.filter(x => x.num.startsWith('4.'))) {
  for (const r of e.options.filter(r => !r[0].startsWith('Reakcja frakcji'))) assert.equal(r[1], '— (obecna linia: potwierdzenie za 1 T, bez skutków)', `${e.num}: present line confirmable in ${r[0]}`);
}
const profile = ['Piłsudczycy odrzucają `pils_influence=oppose_military_interference`', 'Centrum odrzuca `pils_influence=support`'];
for (const p of profile) { assert.ok(cat.includes(p), `catalogue: ${p}`); }
const s105 = section(tr, '### 10.5. ', '### 10.6. ');
assert.ok(s105.includes('**Z — 0.51: obecną linię można potwierdzić (zastępuje Z — 0.32).**'));
assert.ok(s105.includes('`faction_stance_profile_v1`') && s105.includes('Piłsudczycy odrzucają `pils_influence=oppose_military_interference`, a Centrum `pils_influence=support`'));
assert.ok(!s105.includes('Może zamknąć turę jako świadome podtrzymanie'), 'the pre-0.32 wording of the confirmation is gone');
assert.ok(section(tr, '### 10.10. ', '## 11. ').includes('Obecne stanowisko można potwierdzić za 1 T i odnowienie 12 M, bez żadnej reakcji (10.5, Z — 0.51)'));
for (const t of ['Obecna linia', 'Profil frakcji v1']) assert.ok(tests.has(t), `21.1 test ${t}`);

// ---- Batch 1 answers (0.33): the rules are written in the reference and the catalogue agrees.
const num = x => Number(x.replace('−', '-').replace('+', ''));
const ideals = Object.fromEntries(section(tr, '| Aktor | land / fiscal / institution / army |', 'To **syntetyczne profile P**').split('\n')
  .filter(l => /^\| [^|]+ \| [−+]?\d/.test(l)).map(l => { const [actor, v] = cells(l); const [land, fiscal] = v.split(' / ').map(num); return [actor, { land, fiscal }]; }));
const capitalLand = Object.entries(ideals).filter(([, v]) => v.fiscal <= -1 && v.land <= -1).map(([a]) => a).sort();
assert.deepEqual(capitalLand, ['PSChD', 'ZLN'], 'capital_land addressees derived from the 8.6 test ideals');
assert.ok(section(cat, '### 4.2. ', '### 4.3. ').includes('(test: PSChD i ZLN)'), 'catalogue 4.2 names the derived addressees');
const autonomyIdeal = { ZLN: -2, 'Pozostałe mniejszości': 1 };
const distance = (offer, who) => Math.abs(offer - autonomyIdeal[who]);
assert.deepEqual([distance(0, 'ZLN'), distance(0, 'Pozostałe mniejszości'), distance(1, 'Pozostałe mniejszości')], [2, 1, 0]);
assert.ok(section(tr, '### 21.1. ', '### 21.2. ').includes('Odległość od ideału: ZLN 2, mniejszości 1; przy autonomii ZLN blokuje czerwona linia, mniejszości 0'), '21.1 autonomy test matches the computed distances');
const batch1Rules = [
  ['### 5.5. ', '### 5.6. ', '**Z — 0.33: Bund nie jest partią.**'],
  ['### 7.6. ', '## 8. ', 'własne przygotowanie `presidential_arbitration` przez PPS wymaga linii `form_of_power=strong_presidency`'],
  ['### 8.6. ', '### 8.7. ', '**Z — 0.33, temat `autonomy`** (oś praw i autonomii z 10.8): ZLN −2, reprezentacja pozostałych mniejszości +1, pozostali aktorzy 0'],
  ['### 10.5. ', '### 10.6. ', 'Premia kampanii zgodnych z kierunkiem (`strategyFactor`, 10.6)'],
  ['### 10.6. ', '### 10.7. ', '**Z — 0.33, adresaci:** `nationalist_right` to ZLN'],
  ['### 10.6. ', '### 10.7. ', '**Z — 0.33, zakres:** rozbudową zasięgu jest każde podniesienie zasięgu branży związkowej albo `base_reach_pps`'],
  ['### 10.7. ', '### 10.8. ', '**Z — 0.33: linia nie jest warunkiem karty 16.7, tylko ją ogranicza.**'],
  ['### 10.8. ', '### 10.9. ', 'tylko przy tej linii PPS może przygotować `presidential_arbitration`'],
  ['### 16.7. ', '### 16.8. ', 'Linia `pils_influence` nie jest warunkiem karty, tylko ogranicza dostępne ustępstwa według 10.7 (Z — 0.33).'],
];
for (const [from, to, text] of batch1Rules) assert.ok(section(tr, from, to).includes(text), `reference ${from.trim()} has the 0.33 rule: ${text.slice(0, 50)}`);
assert.ok(!section(tr, '### 10.10. ', '## 11. ').includes('frakcja, która wcześniej poparła model sowiecki'), 'dead faction reaction removed');
for (const name of ['Potępienie modelu sowieckiego', 'Adresat polemiki', 'Ustępstwa a linia', 'Arbitraż i linia', 'Zasięg i charakter partii', 'Oś autonomii', 'Bund']) assert.ok(tests.has(name), `21.1 test ${name}`);
assert.ok(section(cat, '## 4. ', '## 5. ').includes('**Status partii:** przejrzana przez użytkownika'), 'batch 1 marked as reviewed');
assert.equal(entries.filter(e => e.num.startsWith('4.')).reduce((n, e) => n + e.questions.length, 0), 0, 'batch 1 has no open questions');
const batch1 = { capitalLand, autonomyDistances: { zlnCultural: 2, minoritiesCultural: 1, minoritiesAutonomy: 0 }, rulesChecked: batch1Rules.length + 1 };

// ---- Batch 2 answers (0.34): party resources and organisations.
const batch2Rules = [
  ['### 4.4. ', '### 4.5. ', '**Z — 0.34:** dodaje 2 zasięgu jednej branży związkowej albo 2 do `base_reach_pps` w komórkach jednej wybranej klasy'],
  ['### 10.5. ', '### 10.6. ', 'bez płatnego „zachować środki”'],
  ['### 10.5. ', '### 10.6. ', '| Składki / `party.dues` | Podwyższyć, obniżyć albo utrzymać;'], // 0.51: a paid confirmation again
  ['### 10.5. ', '### 10.6. ', 'kampanię mobilizacyjną (`party.turnout`) i śledztwo prasowe (`party.press_investigation`'],
  ['### 12.4. ', '### 12.5. ', '**Z — 0.34:** liczba spółdzielni nie ma osobnego limitu'],
  ['### 13.1. ', '### 13.2. ', 'od 0.51 „utrzymać” to płatne potwierdzenie bez skutków'],
  ['### 13.3. ', '### 13.4. ', '**Z — 0.34:** tym środowiskiem jest Centrum'],
  ['### 13.5. ', '## 14. ', '**Z — 0.34:** nie ma płatnej opcji „zachować środki”'],
  ['### 13.5. ', '## 14. ', '`ActionTxn.selected_options` zawiera 1–2 unikalne organizacje'],
  ['### 14.1. ', '### 14.2. ', '(`union.align`, Z — 0.34)'],
  ['### 17.2. ', '### 17.3. ', '`union.organize/prepare/fund/mediate/align`'],
];
for (const [from, to, text] of batch2Rules) assert.ok(section(tr, from, to).includes(text), `reference ${from.trim()} has the 0.34 rule: ${text.slice(0, 50)}`);
assert.ok(!section(tr, '### 13.1. ', '### 13.2. ').includes('Utrzymanie nie zmienia stanu i nie daje premii.'), 'the pre-0.34 wording is gone');
assert.ok(section(tr, '### 13.1. ', '### 13.2. ').includes('„Utrzymać” kosztuje 1 T i odnowienie 6 M; poziom składek, członkostwo i wpływy zostają bez zmian'), 'dues keep is a paid confirmation (0.51)');
for (const name of ['Bez płatnego braku wyboru', 'Militaryzacja a frakcje', 'Praca organizacyjna w komórkach', 'Media bez odnowienia karty']) assert.ok(tests.has(name), `21.1 test ${name}`);
const organizingGain = Math.round(2 * (1 + 0.10) * 10) / 10;
assert.equal(organizingGain, 2.2);
assert.ok(section(tr, '### 21.1. ', '### 21.2. ').includes('`base_reach_pps` chłopów +2,2 (mnożnik 1,10)'), '21.1 organising test matches the computed gain');
const militiaScene = read('source/scenes/party_affairs/reichsbanner.scene.dry');
assert.match(militiaScene.slice(militiaScene.indexOf('@militant\n')), /^on-arrival: .*centrum_dissent \+= \d+/m, 'the existing Milicja card raises the Centre dissent on militarisation (K)');
assert.ok(section(cat, '## 5. ', '## 6. ').includes('**Status partii:** przejrzana przez użytkownika'), 'batch 2 marked as reviewed');
assert.equal(entries.filter(e => e.num.startsWith('5.')).reduce((n, e) => n + e.questions.length, 0), 0, 'batch 2 has no open questions');
assert.ok(entries.find(e => e.num === '5.4').options.some(r => r[0] === 'Utrzymać (`keep`)' && r[1] === '—'), '5.4: keep is a paid confirmation (0.51)');
for (const [num, label] of [['5.1', 'Zachować środki']]) assert.ok(!entries.find(e => e.num === num).options.some(r => r[0] === label), `${num}: paid no-effect option ${label} removed`);
const batch2 = { rulesChecked: batch2Rules.length + 1, organizingGain, militiaCodeCentreReaction: true };

// ---- Batch 3 answers (0.35): relations, programme, unity and advisers.
const batch3Rules = [
  ['### 9.5. ', '### 9.6. ', '| Otworzyć kontakt (`kpp.contact`, karta Stosunki z partiami) |'],
  ['### 9.5. ', '### 9.6. ', '**Z — 0.35: miejsce kroków.**'],
  ['### 10.2. ', '### 10.3. ', 'sprawa odroczona opcją „Przekonać do odroczenia” z karty Jedność (10.5) nie wywołuje E3 przez 3 M'],
  ['#### 10.4.2. ', '#### 10.4.3. ', '**Z — 0.35:** to osobna karta talii partyjnej `party.advisors`'],
  ['### 10.5. ', '### 10.6. ', '| Zmiana doradców / `party.advisors` |'],
  ['### 10.5. ', '### 10.6. ', 'karta jest w puli tylko przy sprzeciwie którejś frakcji ≥30 albo przy otwartym kanale z KPP'],
  ['### 10.5. ', '### 10.6. ', 'ustępstwo dla jednej frakcji (1 T, 1 R, cd 3 M; jej sprzeciw −8) albo uzgodnienie linii współpracy z komunistami (1 T, 0 R, cd 6 M'],
  ['### 10.5. ', '### 10.6. ', '**Z — 0.51 (zastępuje Z — 0.35):** zatwierdzić można także zestaw równy obecnemu'],
  ['#### 16.8.1. ', '#### 16.8.2. ', 'jest stałym działaniem agendy, zawsze dostępnym za 1 T i 1 R, z odnowieniem 3 M (Z — 0.35)'],
  ['### 17.2. ', '### 17.3. ', '| `kpp.trial/rules/agreement` / agenda Współpraca z KPP |'],
];
for (const [from, to, text] of batch3Rules) assert.ok(section(tr, from, to).includes(text), `reference ${from.trim()} has the 0.35 rule: ${text.slice(0, 50)}`);
assert.ok(!section(tr, '### 10.5. ', '### 10.6. ').includes('Kompromis, przekonanie do odroczenia, utrzymanie linii, zmiana doradców'), 'old unity option list replaced');
for (const name of ['Program bez zmiany', 'Odroczenie sprawy frakcji', 'Dwa warianty kompromisu', 'Dostęp karty Jedność', 'Zmiana doradców osobno', 'Kontakt i agenda KPP', 'Rozpoznanie w agendzie']) assert.ok(tests.has(name), `21.1 test ${name}`);
const radius = [30]; while (radius.length < 4) radius.push(Math.max(5, radius[radius.length - 1] - 10));
assert.deepEqual(radius, [30, 20, 10, 5]);
assert.ok(section(tr, '### 21.1. ', '### 21.2. ').includes('Promień 30 → 20 → 10 → 5 pp'), '21.1 assessment test matches the computed radius');
const acceptance = 50 + 15;
assert.ok(acceptance >= 60 && section(tr, '### 21.1. ', '### 21.2. ').includes('akceptacja układu 50 → 65 w każdej frakcji'), 'compromise lifts acceptance over the 60 threshold');
assert.ok(section(cat, '## 6. ', '## 7. ').includes('**Status partii:** przejrzana przez użytkownika'), 'batch 3 marked as reviewed');
assert.equal(entries.filter(e => e.num.startsWith('6.')).reduce((n, e) => n + e.questions.length, 0), 0, 'batch 3 has no open questions');
assert.ok(!entries.find(e => e.num === '6.3').options.some(r => /^(Utrzymać linię|Zmienić doradców)/.test(r[0])), '6.3: removed options are gone');
const batch3 = { rulesChecked: batch3Rules.length + 1, assessmentRadius: radius, acceptanceAfterCompromise: acceptance };

// ---- Batch 4 answers (0.36): the parliamentary cards.
const batch4Rules = [
  ['### 6.5. ', '## 7. ', '**Z — 0.36:** właściwą frakcją jest Lewica'],
  ['### 8.7. ', '### 8.8. ', '**Z — 0.36: impas to stan, nie karta.**'],
  ['### 9.8. ', '## 10. ', 'Z — 0.36: tylko jako odpowiedź 0 T na ostrzeżenie albo ultimatum partnera'],
  ['### 12.4. ', '### 12.5. ', 'ograniczona reforma 1 / 0; 2 M (Z — 0.36)'],
  ['### 16.3. ', '### 16.4. ', 'Ograniczona reforma z karty parlamentarnej daje +0,025 (Z — 0.36, 17.10).'],
  ['### 17.10. ', '### 17.11. ', 'Z — 0.36: bez płatnych „wyjaśnień ministra” i „odłożenia”'],
  ['### 17.10. ', '### 17.11. ', 'Z — 0.36: „chronić wydatki” to warunek usunięcia cięcia wskazanych świadczeń'],
  ['### 17.10. ', '### 17.11. ', '**Z — 0.36:** karty 3–5 nie mają odnowienia'],
];
for (const [from, to, text] of batch4Rules) assert.ok(section(tr, from, to).includes(text), `reference ${from.trim()} has the 0.36 rule: ${text.slice(0, 50)}`);
for (const name of ['Utrzymanie poparcia tylko w kryzysie', 'Kontrola wojska bez pustych opcji', 'Ograniczona reforma wojska', 'Opcje karty Budżet', 'Kompromis listowy a Lewica', 'Impas', 'Karty 3–5 bez odnowienia']) assert.ok(tests.has(name), `21.1 test ${name}`);
// Army axis from the 8.6 test ideals: the limited reform (0) is never farther than full oversight (+2).
const armyIdeal = Object.fromEntries(section(tr, '| Aktor | land / fiscal / institution / army |', 'To **syntetyczne profile P**').split('\n')
  .filter(l => /^\| [^|]+ \| [−+]?\d/.test(l)).map(l => { const [actor, v] = cells(l); return [actor, num(v.split(' / ')[3])]; }));
const armyDistance = Object.fromEntries(Object.entries(armyIdeal).map(([a, v]) => [a, { full: Math.abs(2 - v), limited: Math.abs(0 - v) }]));
assert.ok(Object.values(armyDistance).every(d => d.limited <= d.full), 'the limited reform is never harder to accept than full oversight');
for (const a of ['Piast', 'NPR', 'PSChD']) assert.deepEqual(armyDistance[a], { full: 2, limited: 0 }, `${a}: the limited reform matches the ideal`);
assert.equal(0.05 / 2, 0.025);
// List programmes (6.5): only the early Centrolew replaces labour points with a social minimum.
const lists = Object.fromEntries(section(tr, '### 6.5. ', '## 7. ').split('\n').filter(l => /^\| `[a-z_]+` \|/.test(l)).map(l => { const c = cells(l); return [c[0].replace(/`/g, ''), c[2]]; }));
const dropsLabour = Object.entries(lists).filter(([, programme]) => programme.includes('minimum społeczne')).map(([id]) => id);
assert.deepEqual(dropsLabour, ['centrolew_early'], 'only the early Centrolew drops labour points');
assert.ok(lists.left_peasant.includes('ochrona pracy') && lists.labour.includes('dzień pracy'), 'the other PPS lists keep labour protection');
assert.ok(section(cat, '## 7. ', '## 8. ').includes('**Status partii:** przejrzana przez użytkownika'), 'batch 4 marked as reviewed');
assert.equal(entries.filter(e => e.num.startsWith('7.')).reduce((n, e) => n + e.questions.length, 0), 0, 'batch 4 has no open questions');
assert.ok(!entries.find(e => e.num === '7.5').options.some(r => /^(Wyjaśnienia ministra|Odłożyć)/.test(r[0])), '7.5: paid no-effect options removed');
const batch4 = { rulesChecked: batch4Rules.length, armyDistance, dropsLabour };

// ---- Batch 5 answers (0.37): the government cards.
const batch5Rules = [
  ['### 10.6. ', '### 10.7. ', 'np. potwierdzonym śledztwem MSW (17.12, Z — 0.37)'],
  ['### 11.9. ', '## 12. ', '**Z — 0.37, trzy warianty:** fundusz publiczny płaci całość'],
  ['### 12.7. ', '### 12.8. ', 'Z — 0.37: bez reakcji frakcji, bo dokumentacja nie wskazuje frakcji przeciwnej tej linii'],
  ['### 17.2. ', '### 17.3. ', '| `government.collection` / karta Polityka finansowa (Z — 0.37) |'],
  ['### 17.10. ', '### 17.11. ', '„utrzymać poparcie” tylko w odpowiedzi na ostrzeżenie albo ultimatum partnera (9.8, Z — 0.36)'],
  ['### 17.11. ', '### 17.12. ', 'obciążyć szerokie grupy (podatki pośrednie, szersza podstawa podatku albo cła); pożyczka krajowa; oszczędności ze wskazaniem wydatków; finansowanie z emisji; usprawnić pobór podatków (Z — 0.37)'],
  ['### 17.11. ', '### 17.12. ', '`government.tax` i `government.collection` do 3 (Z — 0.37)'],
  ['### 17.11. ', '### 17.12. ', '**Z — 0.37:** nie ma płatnych opcji utrzymania, odłożenia ani pozostawienia sprawy właścicielom; zamknięcie karty jest bezpłatne.'],
  ['### 17.11. ', '### 17.12. ', 'Warunkowy kredyt, ogólny albo na ratunek wskazanego zakładu'],
  ['### 17.12. ', '#### 17.12.1. ', '**Z — 0.37:** układ zbiorowy to 1 T i 0 B'],
  ['### 17.12. ', '#### 17.12.1. ', '„Skupić” obejmuje połowę odbiorców, najbardziej potrzebujących, z pełną ulgą, za 1 B zamiast 2'],
  ['### 17.12. ', '#### 17.12.1. ', '**Z — 0.37:** opcja „obciążyć szerokie grupy” ma trzy warianty z 11.9'],
  ['### 17.12. ', '#### 17.12.1. ', '**Z — 0.37:** zabezpieczenie przedsiębiorstwa to wariant opcji „warunkowy kredyt”'],
  ['### 17.12. ', '#### 17.12.1. ', '**Z — 0.37:** śledztwo kosztuje 1 T i 1 B przez 1 M'],
];
for (const [from, to, text] of batch5Rules) assert.ok(section(tr, from, to).includes(text), `reference ${from.trim()} has the 0.37 rule: ${text.slice(0, 50)}`);
const s1711 = section(tr, '### 17.11. ', '### 17.12. ');
for (const gone of ['utrzymać zakres', 'pozostawić dostosowanie właścicielom', 'zachować system', 'zachować układ']) assert.ok(!s1711.toLowerCase().includes(gone), `17.11: ${gone} removed`);
assert.ok(!/^\| Odłożyć/m.test(section(tr, '### 12.8. ', '## 13. ')), '12.8: paid postponement removed');
assert.ok(!section(tr, '### 12.7. ', '### 12.8. ').includes('+8 sprzeciwu frakcji'), '12.7: secular-school faction reaction removed');
for (const name of ['Karty rządowe bez pustych opcji', 'Układ zbiorowy i odstępstwo', 'Rozszerzyć i skupić osłony', 'Pobór w karcie finansowej', 'Szerokie grupy i emisja', 'Warianty funduszu inwestycyjnego', 'Ratunek zakładu', 'Śledztwo i adresat polemiki', 'Szkoła świecka bez reakcji frakcji']) assert.ok(tests.has(name), `21.1 test ${name}`);
// Benefits (12.4 base 0 / 2): each scope level adds 2 B, so scope 2 costs 4 B; focus halves the recipients and the cost.
const s124 = section(tr, '### 12.4. ', '### 12.5. ');
const reliefRunning = num(cells(s124.split('\n').find(l => l.startsWith('| Osłona dla bezrobotnych |')))[2].match(/0 \/ (\d+)/)[1]);
const expandTo2 = reliefRunning + 2 * (2 - 1), focus = reliefRunning / 2;
assert.deepEqual([reliefRunning, expandTo2, focus], [2, 4, 1]);
assert.ok(section(tr, '### 21.1. ', '### 21.2. ').includes('Rozszerzenie: 4 B') && section(tr, '### 21.1. ', '### 21.2. ').includes('skupienie: 1 B'), '21.1 benefit test matches the computed costs');
// Investment fund: banks pay half of the 12.4 credit build cost, need the loan's credit threshold and give the 11.7 agreement reward.
const creditBuild = num(cells(s124.split('\n').find(l => l.startsWith('| Instrument kredytowy |')))[2].match(/(\d+) \/ \d+/)[1]);
const loanThreshold = num(section(tr, '### 11.9. ', '## 12. ').split('\n').find(l => l.startsWith('| Krajowa pożyczka inwestycyjna |')).match(/Kredyt ≥(\d+)/)[1]);
const agreementReward = num(cells(section(tr, '### 11.7. ', '### 11.8. ').split('\n').find(l => l.startsWith('| Wykonane porozumienie o koszcie reformy |')))[1]);
const bankBuild = creditBuild / 2;
assert.deepEqual([creditBuild, bankBuild, loanThreshold, agreementReward], [2, 1, 40, -8]);
assert.ok(section(tr, '### 11.9. ', '## 12. ').includes('pokrywa połowę budowy (1 B), wymaga zgody banków jak pożyczka (kredyt ≥40), obniża presję kapitału o 8'), '11.9 bank variant matches the computed values');
assert.ok(section(tr, '### 21.1. ', '### 21.2. ').includes('banki: blokada przy 39, przy 40 budowa 1 B i presja kapitału −8'), '21.1 fund test matches the computed values');
// Catalogue: batch reviewed, removed options gone, new options present.
assert.ok(section(cat, '## 8. ', '## 9. ').includes('**Status partii:** przejrzana przez użytkownika'), 'batch 5 marked as reviewed');
assert.equal(entries.filter(e => e.num.startsWith('8.')).reduce((n, e) => n + e.questions.length, 0), 0, 'batch 5 has no open questions');
const removed5 = [['8.2', /^Utrzymać zakres/], ['8.4', /^Odłożyć/], ['8.6', /^Pozostawić dostosowanie/], ['8.13', /^Zachować system/], ['8.14', /^Zachować układ/], ['8.16', /^Odłożyć/]];
for (const [n, re] of removed5) assert.ok(!entries.find(e => e.num === n).options.some(r => re.test(r[0])), `${n}: paid no-effect option removed`);
const e83 = entries.find(e => e.num === '8.3').options.map(r => r[0]);
for (const o of ['Obciążyć szerokie grupy: podatki pośrednie', 'Obciążyć szerokie grupy: szersza podstawa podatku', 'Obciążyć szerokie grupy: cła fiskalne', 'Finansowanie z emisji', 'Usprawnić pobór podatków (`government.collection`)']) assert.ok(e83.includes(o), `8.3 has the option ${o}`);
const batch5 = { rulesChecked: batch5Rules.length + 3, benefits: { reliefRunning, expandTo2, focus }, investmentFund: { creditBuild, bankBuild, loanThreshold, agreementReward }, removedOptions: removed5.length };

// ---- Batch 6 answers (0.38): events and sequences.
const batch6Rules = [
  ['### 10.2. ', '### 10.3. ', '**Z — 0.38:** karta E3 ma ID `party.faction_split`. To jedna definicja dla wszystkich frakcji; `instance_key` to `case_id` sprawy z `S.faction_cases`.'],
  ['### 10.7. ', '### 10.8. ', '**Z — 0.38:** odpowiedź jest obowiązkowa. Wydarzenie rozstrzyga się w miesiącu wystąpienia, przed następną zwykłą akcją (4.2, krok 9); nie ma opcji „milczeć”.'],
  ['### 10.7. ', '### 10.8. ', 'Trwałej linii przeczy tylko odpowiedź „Poprzeć krytykę parlamentaryzmu” przy `form_of_power=parliamentarism`. Zainteresowaną frakcją jest wtedy Centrum: +3, razem z samą odpowiedzią +8.'],
  ['### 14.5. ', '## 15. ', '**Z — 0.38:** ID karty to `society.strike_settlement_rejection`, a para `strike_id + settlement_id` jest jej `instance_key`.'],
  ['### 17.3. ', '### 17.4. ', 'Odpowiedź obowiązkowa, bez opcji „milczeć” (Z — 0.38)'],
  ['### 17.3. ', '### 17.4. ', 'Cztery odpowiedzi karty 9.8, jak w 17.13 i 17.16.4: negocjować warunek, przekonywać bez ultimatum, utrzymać poparcie mimo sporu, wycofać poparcie (Z — 0.38).'],
  ['### 17.15. ', '### 17.16. ', '| **E3. Część frakcji grozi odejściem** / `party.faction_split` (Z — 0.38) |'],
  ['### 17.15. ', '### 17.16. ', '| **E6. Uczestnicy odrzucają ugodę** / `society.strike_settlement_rejection` (Z — 0.38) |'],
];
for (const [from, to, text] of batch6Rules) assert.ok(section(tr, from, to).includes(text), `reference ${from.trim()} has the 0.38 rule: ${text.slice(0, 50)}`);
assert.ok(!section(tr, '### 17.3. ', '### 17.4. ').includes('Nowe finansowanie, mniejszy uzgodniony zakres, naruszenie albo wyjście PPS'), '17.3: stale austerity answers replaced');
for (const name of ['Jedna karta E3', 'Klucz sprawy E6', 'Karta B2', 'Milczenie i kolejne wystąpienia B2', 'Sprzeczność odpowiedzi B2', 'Oszczędności 1926 przez 9.8']) assert.ok(tests.has(name), `21.1 test ${name}`);
// The Centre's total reaction: the answer's own +5 from the 10.7 table plus the +3 credibility dispute.
const s107 = section(tr, '### 10.7. ', '### 10.8. ');
const centreOwn = num(cells(s107.split('\n').find(l => l.startsWith('| Poprzeć krytykę parlamentaryzmu |')))[1].match(/Centrum ([+−]\d+)/)[1]);
const centreTotal = centreOwn + 3;
assert.deepEqual([centreOwn, centreTotal], [5, 8]);
assert.ok(section(tr, '### 21.1. ', '### 21.2. ').includes('ostrzeżenie i Centrum +8 (5 + 3)'), '21.1 contradiction test matches the computed total');
// The compatible stances named in 10.7 come from the guide's examples.
const guide = read('docs/POLISH_DESCRIPTIVE_GUIDE.md');
assert.ok(guide.includes('Można popierać jego konstytucyjny udział we władzy i sprzeciwić się atakowi na Sejm.') && guide.includes('Można też podważać parlament, pozostając krytycznym wobec rządów wojskowych i preferując rady robotnicze.'), 'the guide documents both compatible stances');
// B19 in 17.13 and 17.16.4 already used the 9.8 answers.
assert.ok(section(tr, '### 17.13. ', '### 17.14. ').includes('| B19 — oszczędności naruszają umowę | Cztery odpowiedzi istniejącej karty 9.8'), '17.13 B19 uses the 9.8 answers');
assert.ok(section(tr, '### 17.16. ', '## 18. ').includes('Przegląd Skrzyńskiego zajmuje istniejącą scenę B19. Cztery odpowiedzi z 9.8 pozostają'), '17.16.4 uses the 9.8 answers');
// Catalogue: headings carry the new IDs, batch reviewed and no questions left. E3 (stage 5, 0.46) and E6 (stage 6, 0.47)
// are queue definitions in the code.
const e99 = entries.find(e => e.num === '9.9'), e910 = entries.find(e => e.num === '9.10');
assert.deepEqual([e99.ids, e910.ids], [['society.strike_settlement_rejection'], ['party.faction_split']], 'E6 and E3 headings carry their IDs');
assert.ok(read('source/rules/polish_rules.js').includes("definition_id: 'society.strike_settlement_rejection'"), 'society.strike_settlement_rejection is the queue definition of stage 6');
assert.ok(read('source/rules/polish_rules.js').includes("definition_id: 'party.faction_split'"), 'party.faction_split is the queue definition of stage 5');
assert.ok(entries.find(e => e.num === '9.5').text.includes('| Bez odpowiedzi | Odpowiedź obowiązkowa'), '9.5: mandatory answer');
// Z — 0.56: B2 is a timed card of the Parliament deck; without an answer for three months it is silence.
assert.ok(entries.find(e => e.num === '9.2').text.includes('| Bez odpowiedzi | Od 0.56 po 3 M milczenie'), '9.2: silence after three months');
assert.ok(section(cat, '## 9. ', '## 10. ').includes('**Status partii:** przejrzana przez użytkownika'), 'batch 6 marked as reviewed');
assert.equal(entries.filter(e => e.num.startsWith('9.')).reduce((n, e) => n + e.questions.length, 0), 0, 'batch 6 has no open questions');
assert.equal(entries.reduce((n, e) => n + e.questions.length, 0), 0, 'the catalogue has no open questions');
const batch6 = { rulesChecked: batch6Rules.length + 3, centreReaction: { own: centreOwn, total: centreTotal }, newIds: ['party.faction_split', 'society.strike_settlement_rejection'] };

// ---- Queue categories (0.39): the seven inferred categories are approved in 4.5 and the catalogue repeats them.
const s45 = section(tr, '### 4.5. ', '### 4.6. ');
assert.ok(s45.includes('**Z — 0.39: kategorie siedmiu wydarzeń.**'), '4.5 has the 0.39 category table');
const queueTable = Object.fromEntries(s45.slice(s45.indexOf('**Z — 0.39: kategorie siedmiu wydarzeń.**')).split('\n')
  .filter(l => /^\| `[a-z]+\.[a-z0-9_]+`/.test(l)).map(l => { const c = cells(l); return [c[0].match(/`([^`]+)`/)[1], Number(c[1].match(/^(\d) —/)[1])]; }));
assert.equal(Object.keys(queueTable).length, 7, 'seven events in the 0.39 table');
assert.ok(!cat.includes('wniosek z 4.5'), 'no inferred category is left in the catalogue');
for (const [id, category] of Object.entries(queueTable)) {
  const e = entries.find(x => x.ids.includes(id));
  assert.ok(e && e.kind === 'event', `${id} is a catalogue event`);
  const row = cells(e.text.split('\n').find(l => l.startsWith('| Kolejka |')));
  assert.ok(row[1].startsWith(`Kategoria ${category} z 4.5`) && row[1].includes('Z — 0.39') && row[2] === 'Z', `${e.num}: queue category ${category} approved`);
}
for (const e of entries.filter(x => x.kind === 'event')) {
  const row = cells(e.text.split('\n').find(l => l.startsWith('| Kolejka |')));
  assert.ok(row[1] === '—' || /^Kategoria [1-6]\b/.test(row[1]) || row[1].startsWith('W sekwencji strajku'), `${e.num}: queue cell names a 4.5 category`);
}
// Test ordering: E6 (1), the 1926 review (4), the parliament criticism (6).
const sameMonth = ['politics.pils_parliament_criticism', 'society.strike_settlement_rejection', 'cabinet.austerity_1926'];
const order = [...sameMonth].sort((a, b) => queueTable[a] - queueTable[b]);
assert.deepEqual(order, ['society.strike_settlement_rejection', 'cabinet.austerity_1926', 'politics.pils_parliament_criticism']);
assert.ok(tests.has('Kolejność kategorii wydarzeń') && section(tr, '### 21.1. ', '### 21.2. ').includes('Kolejność: E6 (1), przegląd (4), krytyka parlamentu (6)'), '21.1 queue test matches the computed order');
const queue = { approvedCategories: queueTable, sameMonthOrder: order };

// ---- Index (chapter 3) and grouped questions (chapter 10) agree with the entries.
const spis = section(cat, '## 3. Spis kart', '## 4. ').split('\n').filter(l => /^\| \d+\.\d+ \|/.test(l)).map(cells);
assert.deepEqual(spis.map(r => r[0]), entries.map(e => e.num), 'index lists every entry in order');
assert.deepEqual(spis.map(r => Number(r[3])), entries.map(e => e.questions.length), 'index question counts');
assert.deepEqual(spis.map(r => r[1].replace(/^\[(.*)\]\(#.*\)$/, '$1')), entries.map(e => e.name), 'index names match headings');
assert.deepEqual(spis.map(r => r[2]), entries.map(e => e.ids.length ? e.ids.map(i => '`' + i + '`').join(', ') : '—'), 'index IDs match headings');
const totalQuestions = entries.reduce((s, e) => s + e.questions.length, 0);
assert.ok(cat.includes(`Razem: ${entries.length} pozycji i ${totalQuestions} pytań.`));
const grouped = new Set([...section(cat, '## 10. ').matchAll(/(?<![\d.])(\d+\.\d+)(?!\d|\.\d)/g)].map(x => x[1]).filter(n => nums.has(n)));
const withQuestions = entries.filter(e => e.questions.length).map(e => e.num);
assert.deepEqual(withQuestions.filter(n => !grouped.has(n)), [], 'chapter 10 names every entry with questions');
assert.deepEqual([...grouped].filter(n => !withQuestions.includes(n)), [], 'chapter 10 names only entries with questions');

// ---- Results.
const byBatch = {};
for (const e of entries) { const b = e.num.split('.')[0]; byBatch[b] = byBatch[b] || { entries: 0, questions: 0 }; byBatch[b].entries++; byBatch[b].questions += e.questions.length; }
const statuses = {};
for (const e of entries) for (const r of e.options) statuses[r[4]] = (statuses[r[4]] || 0) + 1;
const docs = [CAT, TR, 'docs/POLISH_DESCRIPTIVE_GUIDE.md', 'docs/POLISH_MECHANICS_AUDIT.md'];
const hashes = Object.fromEntries(docs.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({
  scope: 'Card catalogue 0.32: coverage of every reference card family, sub-action, event and advisor action; table template; statuses; cited sections and 21.1 tests; code files; 17.2 cost tokens; approved stance-card rules; index and grouped questions.',
  hashes, entries: entries.length, cards: entries.filter(e => e.kind === 'card').length, events: entries.filter(e => e.kind === 'event').length,
  requiredIds: requiredCount, costChecks: costChecks.length, openQuestions: totalQuestions, byBatch, optionStatuses: statuses,
  citedTests: entries.reduce((s, e) => s + e.citedTests, 0),
  batch1,
  batch2,
  batch3,
  batch4,
  batch5,
  batch6,
  queue,
}, null, 2) + '\n');
console.log(`PASS: ${entries.length} entries (${entries.filter(e => e.kind === 'card').length} cards, ${entries.filter(e => e.kind === 'event').length} events) cover all ${Object.values(requiredCount).reduce((a, b) => a + b, 0)} reference IDs (with overlaps); template, statuses, sources, tests and code files valid; ${costChecks.length} 17.2 cost checks match; stance-card rules in 10.5, 10.10 and 21.1; ${totalQuestions} open questions indexed and grouped.`);
for (const [b, v] of Object.entries(byBatch)) console.log(`batch ${Number(b) - 3} (chapter ${b}): ${v.entries} entries, ${v.questions} open questions`);
