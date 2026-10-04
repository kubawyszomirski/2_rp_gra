#!/usr/bin/env node
'use strict';
// Builds the Polish version of the game (Polish version, decisions 1A and 7A of 4 October 2026).
//
// The English scenes in source/ are the only copy of the game logic. A translation file
// source/i18n/<language>/<path of the scene without .dry>.json maps trimmed English lines to translated lines.
// `npm run build` runs this script after the English build: it copies every .dry file of source/ to
// out/i18n/<language>/source/, replaces each translated line (keeping its indentation), compiles that project with
// the Dendry compiler and copies the result to out/html/game_<language>.json, which the page loads when the player
// chooses the language. A line without a translation stays English; a value null marks a line that the Polish game
// never shows (inherited German content), so it needs no translation.
//
// Usage:
//   node tools/i18n/build.cjs                       build every language
//   node tools/i18n/build.cjs --report [file ...]   list untranslated and stale lines (no build)

const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {classify} = require('./dry-lines.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE = path.join(ROOT, 'source');
const LANGUAGES = ['pl'];

function walk(dir, base = dir, out = []) {
  for (const name of fs.readdirSync(dir).sort()) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, base, out);
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

const dryFiles = () => walk(SOURCE).filter(f => f.endsWith('.dry') && !f.startsWith('i18n/'));
const translationPath = (lang, rel) => path.join(SOURCE, 'i18n', lang, rel.replace(/\.dry$/, '.json'));

// All translation files of a language: {source path: {status, lines}}.
function loadTranslations(lang) {
  const dir = path.join(SOURCE, 'i18n', lang);
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const rel of walk(dir).filter(f => f.endsWith('.json'))) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, rel), 'utf8'));
    const source = rel.replace(/\.json$/, '.dry');
    if (data.source !== source) throw new Error(`${lang}/${rel}: "source" must be ${source}`);
    if (!['complete', 'partial'].includes(data.status)) throw new Error(`${lang}/${rel}: status must be complete or partial`);
    // keep_original: the lines without an entry stay in the original language on purpose (decision 7A: the source lists
    // of the Credits); they are counted as kept, not as missing.
    out[source] = {status: data.status, lines: data.lines || {}, keepOriginal: data.keep_original === true};
  }
  return out;
}

function translateSource(text, dict) {
  if (!dict) return text;
  return text.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed || !Object.prototype.hasOwnProperty.call(dict, trimmed)) return line;
    const value = dict[trimmed];
    if (typeof value !== 'string') return line;
    return line.slice(0, line.length - line.trimStart().length) + value;
  }).join('\n');
}

// Coverage of one language: for each translated source file, the translatable lines without an entry and the entries
// whose English line no longer exists.
function coverage(lang) {
  const translations = loadTranslations(lang);
  const files = {};
  for (const [source, t] of Object.entries(translations)) {
    const full = path.join(SOURCE, source);
    if (!fs.existsSync(full)) { files[source] = {status: t.status, missing: [], stale: Object.keys(t.lines), noSource: true}; continue; }
    const lines = classify(fs.readFileSync(full, 'utf8'), source);
    const present = new Set(lines.map(l => l.trimmed));
    const seen = new Set();
    const missing = [];
    for (const l of lines) {
      if (!l.translatable || seen.has(l.trimmed)) continue;
      seen.add(l.trimmed);
      if (!Object.prototype.hasOwnProperty.call(t.lines, l.trimmed)) missing.push(l.trimmed);
    }
    const stale = Object.keys(t.lines).filter(k => !present.has(k));
    const translated = Object.values(t.lines).filter(v => typeof v === 'string').length;
    const skipped = Object.values(t.lines).filter(v => v === null).length;
    files[source] = t.keepOriginal ? {status: t.status, translated, skipped, kept: missing.length, missing: [], stale} :
      {status: t.status, translated, skipped, missing, stale};
  }
  return files;
}

function compile(projectDir) {
  const cli = path.join(path.dirname(require.resolve('dendrynexus/package.json')), 'lib', 'cli', 'main.js');
  const run = spawnSync(process.execPath, [cli, 'compile', projectDir, '-f'], {cwd: ROOT, encoding: 'utf8'});
  if (run.status !== 0) {
    process.stderr.write(run.stdout || '');
    process.stderr.write(run.stderr || '');
    throw new Error(`Dendry compilation of ${path.relative(ROOT, projectDir)} failed`);
  }
}

function build(lang) {
  const translations = loadTranslations(lang);
  const project = path.join(ROOT, 'out', 'i18n', lang);
  fs.rmSync(path.join(project, 'source'), {recursive: true, force: true});
  for (const rel of dryFiles()) {
    const target = path.join(project, 'source', rel);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    const text = fs.readFileSync(path.join(SOURCE, rel), 'utf8');
    fs.writeFileSync(target, translateSource(text, translations[rel] && translations[rel].lines));
  }
  compile(project);
  fs.copyFileSync(path.join(project, 'out', 'game.json'), path.join(ROOT, 'out', 'html', `game_${lang}.json`));
  const cov = coverage(lang);
  const complete = Object.values(cov).filter(f => f.status === 'complete').length;
  const missing = Object.values(cov).reduce((n, f) => n + f.missing.length, 0);
  const stale = Object.values(cov).reduce((n, f) => n + f.stale.length, 0);
  const kept = Object.values(cov).reduce((n, f) => n + (f.kept || 0), 0);
  console.log(`i18n ${lang}: out/html/game_${lang}.json built; ${Object.keys(cov).length} translated files ` +
    `(${complete} complete); untranslated lines ${missing}; kept in the original ${kept}; stale entries ${stale}.`);
}

function report(lang, files) {
  const cov = coverage(lang);
  const pick = files.length ? files : Object.keys(cov);
  const out = {};
  for (const f of pick) {
    if (cov[f]) out[f] = cov[f];
    else {
      const full = path.join(SOURCE, f);
      if (!fs.existsSync(full)) { out[f] = {error: 'no such source file'}; continue; }
      const lines = classify(fs.readFileSync(full, 'utf8'), f);
      out[f] = {status: 'none', missing: [...new Set(lines.filter(l => l.translatable).map(l => l.trimmed))], stale: []};
    }
  }
  console.log(JSON.stringify(out, null, 1));
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === '--report') report('pl', args.slice(1));
  else for (const lang of LANGUAGES) build(lang);
}

module.exports = {LANGUAGES, loadTranslations, translateSource, coverage, dryFiles, build};
