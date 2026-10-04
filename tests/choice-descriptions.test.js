'use strict';

// The descriptions of choices (Z — 0.53). An effect is named in words and its size stands in a parenthesis that opens
// with a sign or ×, right after the word ("the relation improves (+5)"); the Options setting "Numbers in choices"
// (hidden by default) shows or hides these parentheses. Costs are written in words (resources, budget units, the
// month's action) and stay visible, like requirements; no description may be empty without its numbers.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dendry = require('./helpers/dendry.js');

const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const walk = dir => fs.readdirSync(dir, {withFileTypes: true})
  .flatMap(e => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const rules = () => globalThis.PolishRules;

// What a description shows with the numbers hidden: each branch of its conditions, inserts and markup removed.
const branches = line => {
  const body = line.replace(/^(unavailable-)?subtitle:\s*/, '');
  const parts = [...body.matchAll(/\[\?\s*if[^:]*:([^?]*)\?\]/g)].map(m => m[1]);
  const rest = body.replace(/\[\?\s*if[^:]*:[^?]*\?\]/g, '').trim();
  return parts.length ? parts.concat(rest ? [rest] : []) : [body];
};
const SIGNED = /(^|[^\w.,\-−])[+\-−±]\d/;
const FORBIDDEN = [[/×\s?\d/, 'a multiplier'], [/\b\d+(?:[.,]\d+)?\s?[RBT]\b/, 'an abbreviated unit'], [/\bpp\b|pkt proc\./, 'pp'],
  [/(?<!\p{L})(axis|oś)(?!\p{L})/iu, 'an unexplained axis']];

test('Opisy wyborów bez liczb: żadna liczba skutku ani skrót jednostki, żaden pusty opis, w obu językach', () => {
  dendry.createEngine(1922, 'en');
  const problems = [];
  let lines = 0;
  for (const file of walk(path.join(ROOT, 'source/i18n/pl/scenes')).filter(f => f.endsWith('.json'))) {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const [en, pl] of Object.entries(j.lines)) {
      if (!pl || !/^(unavailable-)?subtitle:/.test(en)) continue;
      for (const [lang, line] of [['en', en], ['pl', pl]]) {
        lines++;
        for (const b of branches(line)) {
          const hidden = rules().withoutEffectNumbers(b).replace(/\[\+[^+]*\+\]/g, 'X').replace(/\*\*/g, '').trim();
          const issues = [];
          if (!hidden.replace(/[\s.;,:]/g, '')) issues.push('empty');
          if (SIGNED.test(hidden)) issues.push('a signed number');
          for (const [re, what] of FORBIDDEN) if (re.test(hidden)) issues.push(what);
          if (issues.length) problems.push(`${j.source} [${lang}] ${issues.join(', ')}: ${b.trim().slice(0, 100)}`);
        }
      }
    }
  }
  assert.ok(lines > 600, `checked ${lines} description lines`);
  assert.deepEqual(problems, []);
});

test('Liczby w opisach: nawias skutku jest oznaczany i ukrywany, koszty i warunki zostają; koszty słowami w obu językach', () => {
  dendry.createEngine(1922, 'en');
  const R = rules();
  const text = 'The relation improves (+5, once); dissent falls (−3); campaigns work better (×1.20); costs 1 resource (at least 500 members).';
  assert.equal(R.withoutEffectNumbers(text), 'The relation improves; dissent falls; campaigns work better; costs 1 resource (at least 500 members).');
  assert.equal(R.markEffectNumbers('rises (+4)'), 'rises<span class="pl-fx"> (+4)</span>');
  assert.equal(R.markEffectNumbers('(500 members)'), '(500 members)', 'a requirement is not an effect');
  assert.deepEqual([1, 2, 0.5].map(n => R.units(n)), ['1 resource', '2 resources', '0.5 resources']);
  assert.equal(R.units(3, 'budget'), '3 budget units');
  R.setLanguage('pl');
  assert.deepEqual([1, 2, 5, 22, 0.5].map(n => R.units(n)),
    ['1 jednostka środków', '2 jednostki środków', '5 jednostek środków', '22 jednostki środków', '0,5 jednostki środków']);
  assert.deepEqual([1, 2, 0.5].map(n => R.units(n, 'resources', 'gen')), ['1 jednostki środków', '2 jednostek środków', '0,5 jednostki środków']);
  assert.deepEqual([1, 3].map(n => R.units(n, 'resources', 'acc')), ['1 jednostkę środków', '3 jednostki środków']);
  assert.equal(R.units(2, 'budget'), '2 jednostki budżetu');
  R.setLanguage('en');
});

test('Liczby w opisach: ustawienie w Opcjach, domyślnie ukryte, i oznaczanie tekstu na stronie', () => {
  const html = read('out/html/index.html'), js = read('out/html/game.js'), css = read('out/html/game.css');
  assert.match(html, /<body class="pl-hide-numbers">/, 'hidden by default');
  for (const id of ['numbers_show', 'numbers_hide']) assert.ok(html.includes(`id="${id}"`), id);
  assert.match(html, /data-i18n="effect_numbers"/);
  assert.match(js, /effect_numbers: \{en: 'Numbers in choices:', pl: 'Liczby w opisach wyborów:'\}/);
  assert.match(js, /window\.setShowNumbers = function/);
  assert.match(js, /window\.displayText = function\(text\) \{\n\s*return window\.PolishRules && window\.PolishRules\.markEffectNumbers/);
  assert.match(css, /body\.pl-hide-numbers ul\.choices \.pl-fx \{\n\s*display: none;/);
  assert.match(css, /ul\.choices li div\.subtitle > strong:first-child \{\n\s*display: block;/, 'the bold label stands on its own line');
});
