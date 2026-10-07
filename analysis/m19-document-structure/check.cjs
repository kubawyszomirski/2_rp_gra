#!/usr/bin/env node
'use strict';
// M19 diagnostics: the documentation keeps one current version for coding and a clearly separated
// decision archive in the same files. Checks the structure of the technical reference (chapters 1-22
// current, chapter 23 archive), the descriptive guide (state paragraph, history appendix), the audit,
// the source register and the four registers (current state above the archive of entries); resolves
// every markdown link with an anchor into a repository document; and, when M19_BACKUP_DIR points at
// the pre-M19 copies, confirms that no line was lost and that the moved blocks kept their text and order.
// Documentation diagnostics only: not Dendry gameplay.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const lines = text => text.split('\n');
const nonEmpty = text => lines(text).filter(l => l.trim());
const count = (text, s) => text.split(s).length - 1;
// The structure checked here holds from reference 0.31 on; later versions keep it.
const VERSION = '0\\.(?:3[1-9]|[4-9]\\d)';
const versionRe = (prefix, suffix = '') => new RegExp(prefix + VERSION + suffix);

const TR = 'docs/POLISH_TECHNICAL_REFERENCE.md';
const GUIDE = 'docs/POLISH_DESCRIPTIVE_GUIDE.md';
const AUDIT = 'docs/POLISH_MECHANICS_AUDIT.md';
const SOURCES = 'HISTORICAL_SOURCES.md';
const REGISTERS = ['PLAN.md', 'MECHANICS_MAP.md', 'STATE_VARIABLES.md', 'TRANSITION_MATRIX.md'];
const M19_DOCS = [TR, GUIDE, AUDIT, SOURCES, ...REGISTERS];

// ---- Headings and GitHub anchors (github-slugger rules on the rendered heading text).
function headings(text) {
  const out = []; let fence = null;
  for (const [i, l] of lines(text).entries()) {
    const f = l.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (f) { if (!fence) fence = f[1][0]; else if (f[1][0] === fence) fence = null; continue; }
    if (fence) continue;
    const m = l.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (m) out.push({ line: i + 1, level: m[1].length, text: m[2] });
  }
  return out;
}
const slugBase = t => t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/`/g, '').replace(/\*\*/g, '')
  .toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '').replace(/ /g, '-');
function anchors(text) {
  const seen = new Map(), all = new Set();
  for (const h of headings(text)) {
    const base = slugBase(h.text); let s = base;
    while (seen.has(s)) { seen.set(base, seen.get(base) + 1); s = `${base}-${seen.get(base)}`; }
    seen.set(s, 0); all.add(s);
  }
  for (const m of text.matchAll(/<a\s+(?:id|name)="([^"]+)"/g)) all.add(m[1]);
  return all;
}

// ---- Technical reference: one current version (chapters 1-22) and the archive (chapter 23).
const tr = read(TR);
const trLines = lines(tr);
const trH = headings(tr);
const at = (level, prefix) => { const h = trH.filter(x => x.level === level && x.text.startsWith(prefix)); assert.equal(h.length, 1, `one heading ${'#'.repeat(level)} ${prefix}`); return h[0].line; };
const structure = {};
{
  assert.ok(versionRe('^\\*\\*Wersja ', ' — \\d{1,2} \\S+ \\d{4}\\.\\*\\*').test(trLines[2]), 'header names version 0.31 or later');
  assert.ok(trLines[2].includes('**To jedna aktualna wersja do kodowania: obowiązuje tekst rozdziałów 1–22.**'));
  const chapters = trH.filter(h => h.level === 2).map(h => h.text);
  assert.deepEqual(chapters.map(t => Number(t.split('.')[0])), Array.from({ length: 23 }, (_, i) => i + 1), 'chapters 1-23 in order');
  assert.equal(chapters[22], '23. Archiwum decyzji');
  const ch1 = at(2, '1. '), ch23 = at(2, '23. ');
  // Preamble: the header, the index table and nothing else; no revision paragraphs.
  const preamble = trLines.slice(1, ch1 - 1).filter(l => l.trim());
  assert.ok(!preamble.some(l => l.startsWith('**Rewizja 0.')), 'no revision paragraphs above chapter 1');
  assert.ok(preamble.includes('**Gdzie jest aktualna reguła.** Tabela wskazuje kanoniczne miejsce każdego tematu i ostatnie zatwierdzone zmiany. Oznaczenia „Z — 0.xx (Mxx)” w tekście mówią, która decyzja ustaliła daną regułę.'));
  const index = preamble.filter(l => l.startsWith('| ') && !l.startsWith('| Temat') && !l.startsWith('|---')).map(l => l.split('|').map(c => c.trim()));
  assert.deepEqual(index.map(r => r[2]), Array.from({ length: 23 }, (_, i) => String(i + 1)), 'index table points at sections 1-23');
  // Every subsection named in the index exists (numbers starting with 0. are versions, not sections).
  const named = [...new Set(index.flatMap(r => [...r[3].matchAll(/\b([1-9]\d?\.\d+(?:\.\d+)?)\b/g)].map(m => m[1])))];
  const numbered = new Set(trH.map(h => (h.text.match(/^(\d+(?:\.\d+)*)\./) || [])[1]).filter(Boolean));
  const missing = named.filter(n => !numbered.has(n));
  assert.deepEqual(missing, [], 'index table names only existing subsections');
  structure.indexSubsectionsChecked = named.length;
  // Chapter 22 keeps only 22.1-22.4; the approval logs 22.5-22.24 sit under 23.3 as level-4 headings.
  const s22 = trH.filter(h => /^22\.\d+\./.test(h.text));
  assert.deepEqual(s22.filter(h => h.level === 3).map(h => h.text.split('.')[1]), ['1', '2', '3', '4']);
  const logs = s22.filter(h => h.level === 4).map(h => Number(h.text.split('.')[1]));
  assert.deepEqual(logs, Array.from({ length: 20 }, (_, i) => i + 5), 'logs 22.5-22.24 in order');
  const a231 = at(3, '23.1. '), a232 = at(3, '23.2. '), a233 = at(3, '23.3. '), a234 = at(3, '23.4. ');
  assert.ok(ch23 < a231 && a231 < a232 && a232 < a233 && a233 < a234);
  assert.ok(s22.filter(h => h.level === 4).every(h => h.line > a233 && h.line < a234), 'logs inside 23.3');
  assert.ok(at(4, 'Rewizja 0.13 ') > a233 && at(4, 'Rewizja 0.13 ') < a234, 'revision 0.13 log inside 23.3');
  // 23.1 holds the old header; 23.2 the 17 revision paragraphs 0.30 ... 0.14, each only once in the file.
  const in231 = trLines.slice(a231, a232 - 1).filter(l => l.startsWith('**Wersja 0.'));
  assert.deepEqual(in231.map(l => l.slice(0, 13)), ['**Wersja 0.30'], 'old header in 23.1');
  const revisions = trLines.slice(a232, a233 - 1).filter(l => l.startsWith('**Rewizja 0.'));
  assert.deepEqual(revisions.map(l => Number(l.match(/^\*\*Rewizja 0\.(\d+)/)[1])), Array.from({ length: 17 }, (_, i) => 30 - i));
  for (const r of revisions) assert.equal(count(tr, r), 1, 'each revision paragraph kept once');
  // The archive states its rank; the current rules no longer carry the two stale sentences.
  assert.ok(trLines[ch23 + 1].includes('gdy jego treść różni się od rozdziałów 1–22, obowiązują rozdziały 1–22'));
  const current = trLines.slice(0, ch23 - 1).join('\n');
  for (const stale of ['rozłamu po ultimatum', 'M06 pozostaje oddzielną pozycją audytu']) assert.equal(count(tr, stale), 0, stale);
  assert.equal(count(current, 'To odrębny wariant od rozłamu z karty E3 (10.2).'), 1);
  assert.equal(count(current, 'M06 zamknięto w dokumentacji w 0.28 (7.3–7.5), M08 w 0.20 (16.8)'), 1);
  assert.ok(current.includes('Zapisy zatwierdzeń kolejnych decyzji, dawne 22.5–22.24, są od 0.31 w rozdziale 23 (M19).'));
  structure.technical = { chapters: chapters.length, revisionParagraphsInArchive: revisions.length, approvalLogsInArchive: logs.length + 1, archiveStartsAtLine: ch23 };
}

// ---- Descriptive guide: one state paragraph at the top, the dated notes in the history appendix.
{
  const g = read(GUIDE), gl = lines(g), gh = headings(g).filter(h => h.level === 2);
  assert.deepEqual(gh.slice(0, 19).map(h => Number(h.text.split('.')[0])), Array.from({ length: 19 }, (_, i) => i + 1));
  assert.equal(gh.length, 20); assert.equal(gh[19].text, 'Dodatek: historia zmian przewodnika');
  const top = gl.slice(1, gh[0].line - 1).filter(l => l.trim());
  assert.equal(top.length, 4, 'state paragraph and the three introductory paragraphs');
  assert.ok(versionRe('^\\*\\*Stan — referencja ', ', \\d{1,2} \\S+ \\d{4}\\.\\*\\*').test(top[0]));
  const dated = /^\*\*[^*]*(referencja 0\.\d+|wersja 0\.\d+|\d{1,2} września 2026)[^*]*\*\*/;
  const body = gl.slice(gh[0].line - 1, gh[19].line - 1);
  assert.equal(body.filter(l => dated.test(l)).length, 0, 'no dated notes in chapters 1-19');
  const notes = gl.slice(gh[19].line).filter(l => l.startsWith('**'));
  assert.ok(notes.length >= 30, 'the 30 moved notes plus later dated notes');
  structure.guide = { chapters: 19, notesInAppendix: notes.length, appendixStartsAtLine: gh[19].line };
}

// ---- Registers: current state first, all earlier entries under the archive heading.
structure.registers = {};
for (const f of REGISTERS) {
  const t = read(f), h = headings(t).filter(x => x.level === 2);
  assert.ok(versionRe('^Current state — reference ', ', \\d{1,2} \\S+ \\d{4}$').test(h[0].text), f);
  assert.equal(h[1].text, 'Archive of entries — history, not implementation instructions', f);
  assert.equal(h.filter(x => x.text.startsWith('Current state')).length, 1);
  assert.equal(h.filter(x => x.text.startsWith('Archive of entries')).length, 1);
  const state = lines(t).slice(h[0].line, h[1].line - 1).join('\n');
  assert.ok(versionRe('chapters 1–22 \\(reference ', '\\)').test(state) && state.includes('(M01–M19) is closed in documentation'), f);
  const rows = lines(state).filter(l => l.startsWith('| ') && !l.startsWith('| Area')).map(l => l.split('|').map(c => c.trim()));
  const named = [...new Set(rows.flatMap(r => [...(r[2] + ' ' + r[3]).matchAll(/(?<![\d.])([1-9]\d?(?:\.\d+)*)\b/g)].map(m => m[1])))];
  const numbered = new Set(trH.map(x => (x.text.match(/^(\d+(?:\.\d+)*)\./) || [])[1]).filter(Boolean));
  assert.deepEqual(named.filter(n => !numbered.has(n)), [], `${f}: current-state table names only existing sections`);
  structure.registers[f] = { areas: rows.length, archiveStartsAtLine: h[1].line };
}

// ---- Audit and source register.
{
  const a = read(AUDIT);
  assert.ok(versionRe('\\*\\*Audyt 11 września; aktualizacja \\d{1,2} \\S+ \\d{4} — referencja ', '\\.\\*\\* Wszystkie punkty audytu są zamknięte w dokumentacji\\.').test(a));
  const ids = [...a.matchAll(/^\| \*\*(M\d\d) — /gm)].map(m => m[1]).sort();
  assert.deepEqual(ids, Array.from({ length: 19 }, (_, i) => `M${String(i + 1).padStart(2, '0')}`), 'closed table covers M01-M19');
  // Every item section sits in the closed part; the three groups of open problems are empty.
  const ah = headings(a), closedAt = ah.find(h => h.level === 2 && h.text.startsWith('Zamknięte w dokumentacji')).line;
  const closedEnd = ah.find(h => h.level === 2 && h.line > closedAt).line;
  const items = ah.filter(h => h.level === 3 && /^M\d\d\./.test(h.text));
  assert.ok(items.every(h => h.line > closedAt && h.line < closedEnd && /(uzgodnione|gotowy do implementacji)$/.test(h.text)), 'no open audit item');
  for (const group of ['Reguły wymagające zamknięcia', 'Niespójności przyczynowe i słabe wybory', 'Użyteczność długoterminowa i porządek dokumentacji']) {
    const g = ah.find(h => h.level === 2 && h.text === group).line, next = ah.find(h => h.level === 2 && h.line > g).line;
    assert.equal(ah.filter(h => h.line > g && h.line < next).length, 0, `${group}: empty`);
  }
  assert.equal(count(a, 'M18 w 0.30, a M19 w 0.31.'), 1);
  const s = read(SOURCES);
  assert.equal(count(s, '## PL-M19-DOCUMENT-STRUCTURE-2026-09-26 — approved documentation structure'), 1);
  assert.equal(count(s, '| PL-M19-DOCUMENT-STRUCTURE-2026-09-26 |'), 1);
}

// ---- Links: every relative link must name an existing file, and every anchor into a repository
// document must hit a heading.
function markdownFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    // .claude holds the worktrees of parallel Claude sessions: copies of the documents, not the project's own.
    if (e.isDirectory()) { if (!['node_modules', 'out', '.git', '.claude'].includes(e.name)) out.push(...markdownFiles(rel)); }
    else if (e.name.endsWith('.md')) out.push(rel);
  }
  return out;
}
const anchorCache = new Map();
const anchorsOf = f => { if (!anchorCache.has(f)) anchorCache.set(f, anchors(read(f))); return anchorCache.get(f); };
const links = { files: 0, checked: 0, intoM19Docs: 0, broken: [], missingFiles: [] };
for (const f of markdownFiles('.').sort()) {
  let fence = null;
  for (const [i, l] of lines(read(f)).entries()) {
    const fm = l.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fm) { if (!fence) fence = fm[1][0]; else if (fm[1][0] === fence) fence = null; continue; }
    if (fence) continue;
    for (const m of l.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      if (/^[a-z]+:/i.test(m[1])) continue;
      const cut = m[1].indexOf('#'), file = cut < 0 ? m[1] : m[1].slice(0, cut), hash = cut < 0 ? '' : m[1].slice(cut + 1);
      const target = file ? path.normalize(path.join(path.dirname(f), decodeURIComponent(file))) : path.normalize(f);
      if (file) { links.files++; if (!fs.existsSync(path.join(root, target))) { links.missingFiles.push(`${f}:${i + 1} → ${m[1]}`); continue; } }
      if (!hash || !target.endsWith('.md')) continue;
      links.checked++; if (M19_DOCS.includes(target)) links.intoM19Docs++;
      let anchor = hash; try { anchor = decodeURIComponent(hash); } catch { /* keep raw */ }
      if (!anchorsOf(target).has(anchor.toLowerCase())) links.broken.push(`${f}:${i + 1} → ${m[1]}`);
    }
  }
}
assert.deepEqual(links.broken, [], 'every anchor link resolves');
assert.deepEqual(links.missingFiles, [], 'every linked file exists');
assert.ok(links.intoM19Docs > 0);

// ---- Optional one-time preservation check against the pre-M19 copies (flat backup directory).
let preservation = { run: false, reason: 'set M19_BACKUP_DIR to the directory with the pre-M19 copies' };
const backup = process.env.M19_BACKUP_DIR;
if (backup) {
  const norm = l => l.replace(/^#{1,6} /, '# ');
  const multiset = arr => arr.reduce((m, l) => m.set(norm(l), (m.get(norm(l)) || 0) + 1), new Map());
  const lost = (oldText, newText) => { const o = multiset(nonEmpty(oldText)), n = multiset(nonEmpty(newText)); return [...o].filter(([l, c]) => c > (n.get(l) || 0)).map(([l]) => l); };
  // Known edits: two stale sentences in the current rules and one stale link target in an archived entry.
  const EDITS = {
    [TR]: [
      ['To odrębny wariant od dobrowolnego rozłamu po ultimatum.', 'To odrębny wariant od rozłamu z karty E3 (10.2).'],
      ['M06 pozostaje oddzielną pozycją audytu; M08 zamknięto w dokumentacji w 0.20 (16.8)', 'M06 zamknięto w dokumentacji w 0.28 (7.3–7.5), M08 w 0.20 (16.8)'],
    ],
    'MECHANICS_MAP.md': [['#1710-zatwierdzony-manifest-12-kart-parlamentarnych)', '#1710-aktualny-manifest-10-kart-parlamentarnych)']],
  };
  const applyEdits = (f, l) => (EDITS[f] || []).reduce((x, [from, to]) => x.replace(from, to), l);
  const AUDIT_EDITS = ['**Audyt 11 września; aktualizacja 26 września 2026 — referencja 0.30.**', 'Koncepcja gry, katalog decyzji i scenariusz Normalny wystarczają',
    '| Przed pełną kampanią i dalszym rozwojem | M19 |', 'M05 zamknięto w dokumentacji w 0.17', '# M19. Dokumenty zawierają historię decyzji',
    '**Stan:** `PLAN.md`, `MECHANICS_MAP.md`', '**Rekomendacja:** oddzielić aktualną specyfikację', '7. Przenieść aktualne reguły do jednej spójnej wersji dokumentacji.'];
  const perFile = {};
  for (const f of M19_DOCS) {
    const oldText = fs.readFileSync(path.join(backup, path.basename(f)), 'utf8'), newText = read(f);
    const gone = lost(oldText, newText);
    if (EDITS[f]) {
      assert.equal(gone.length, EDITS[f].length, `${f}: only the known edits changed a line`);
      const newSet = new Set(nonEmpty(newText));
      for (const [from, to] of EDITS[f]) { const l = gone.filter(x => count(x, from) === 1); assert.equal(l.length, 1, from); assert.ok(newSet.has(l[0].replace(from, to)), `corrected line present: ${to}`); }
    } else if (f === AUDIT) {
      assert.deepEqual(AUDIT_EDITS.map(p => gone.filter(l => l.startsWith(p)).length), AUDIT_EDITS.map(() => 1));
      assert.equal(gone.length, AUDIT_EDITS.length, 'only the M19 closure edits changed in the audit');
    } else assert.deepEqual(gone, [], `${f}: no line lost`);
    // Every heading anchor that existed before still exists (the removed open M19 audit item excepted).
    const oldAnchors = [...anchors(oldText)].filter(s => !s.startsWith('m19-dokumenty-zawierają-historię-decyzji'));
    assert.deepEqual(oldAnchors.filter(s => !anchors(newText).has(s)), [], `${f}: anchors kept`);
    perFile[f] = { linesLost: gone.length, anchorsKept: oldAnchors.length };
  }
  // Moved blocks keep their text and order.
  const oldTr = fs.readFileSync(path.join(backup, 'POLISH_TECHNICAL_REFERENCE.md'), 'utf8'), ol = lines(oldTr), oh = headings(oldTr);
  const oldCh1 = oh.find(h => h.level === 2 && h.text.startsWith('1. ')).line, old225 = oh.find(h => h.text.startsWith('22.5. ')).line;
  const oldPreamble = ol.slice(1, oldCh1 - 1).filter(l => l.trim());
  const a231 = at(3, '23.1. '), a232 = at(3, '23.2. '), a233 = at(3, '23.3. '), a234 = at(3, '23.4. ');
  assert.equal(trLines.slice(a231, a232 - 1).filter(l => l.startsWith('**Wersja 0.'))[0], oldPreamble[0], 'old header verbatim in 23.1');
  assert.deepEqual(trLines.slice(a232, a233 - 1).filter(l => l.startsWith('**Rewizja 0.')), oldPreamble.slice(1), 'revision paragraphs verbatim and in order in 23.2');
  const oldLogs = ol.slice(old225 - 1).filter(l => l.trim()).map(norm);
  const newLogs = trLines.slice(trH.find(h => h.text.startsWith('22.5. ')).line - 1, a234 - 1).filter(l => l.trim()).map(norm);
  assert.deepEqual(newLogs, oldLogs, 'approval logs verbatim and in order in 23.3');
  const og = fs.readFileSync(path.join(backup, 'POLISH_DESCRIPTIVE_GUIDE.md'), 'utf8'), ogl = lines(og);
  const oldNotes = ogl.slice(1, headings(og).find(h => h.level === 2).line - 1).filter(l => l.startsWith('**'));
  const g = read(GUIDE), appendix = headings(g).find(h => h.text.startsWith('Dodatek: historia zmian')).line;
  assert.deepEqual(lines(g).slice(appendix).filter(l => l.startsWith('**')), oldNotes, 'guide notes verbatim and in order in the appendix');
  for (const f of REGISTERS) {
    const o = fs.readFileSync(path.join(backup, f), 'utf8'), n = read(f);
    const archive = headings(n).find(h => h.text.startsWith('Archive of entries')).line;
    assert.deepEqual(lines(n).slice(archive).filter(l => l.trim()).slice(1), lines(o).slice(1).filter(l => l.trim()).map(l => applyEdits(f, l)), `${f}: old entries verbatim under the archive heading`);
  }
  preservation = { run: true, perFile, knownEdits: Object.fromEntries(Object.entries(EDITS).map(([f, e]) => [f, e.length])), moved: { technicalHeader: 1, technicalRevisions: oldPreamble.length - 1, technicalLogLines: oldLogs.length, guideNotes: oldNotes.length } };
}

const hashes = Object.fromEntries(M19_DOCS.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
const resultsPath = path.join(__dirname, 'results.json');
// Keep the recorded one-time preservation result when a later run has no backup directory.
if (!preservation.run && fs.existsSync(resultsPath)) {
  const prev = JSON.parse(fs.readFileSync(resultsPath, 'utf8')).preservation;
  if (prev && prev.run) preservation = { ...prev, note: 'recorded by an earlier run with M19_BACKUP_DIR; not repeated in this run' };
}
fs.writeFileSync(resultsPath, JSON.stringify({
  scope: 'M19: one current version for coding (technical chapters 1-22) and a separated decision archive (chapter 23); guide history appendix; registers with a current state above the archive of entries. Structure checks, anchor resolution of every markdown link, optional preservation check against the pre-M19 copies.',
  hashes, structure, links: { fileLinks: links.files, missingFiles: links.missingFiles.length, anchorLinks: links.checked, anchorLinksIntoM19Docs: links.intoM19Docs, brokenAnchors: links.broken.length }, preservation,
}, null, 2) + '\n');

console.log(`PASS: reference 0.31+ with chapters 1-22 current and chapter 23 archive (${structure.technical.revisionParagraphsInArchive} revision paragraphs, ${structure.technical.approvalLogsInArchive} approval logs); guide with ${structure.guide.notesInAppendix} notes in the appendix; four registers with current state above the archive; audit M01-M19 closed; ${links.files} relative file links exist; ${links.checked} anchor links resolve (${links.intoM19Docs} into M19 documents).`);
console.log(preservation.run && !preservation.note ? `Preservation vs pre-M19 copies: no line lost except the two corrected stale sentences, one corrected archive link and the audit closure edits; moved blocks verbatim and in order.` : `Preservation check: ${preservation.note || preservation.reason}.`);
