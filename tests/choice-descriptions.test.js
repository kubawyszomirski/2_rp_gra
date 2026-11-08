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

// Z — 1.08 (the user's notes after playing 1.07): the money a choice spends stands in its own line ("Koszt: …"); no text speaks of
// the month's action; the cards whose every option spends resources have "Do nothing"; the Overview shows the party's resources and
// the state of the economy in a word.
test('Koszt w osobnej linijce 1.08: the cost sentence is its own line; no text mentions the month’s action; no description opens with a bare cost', () => {
  dendry.createEngine(1922, 'en');
  const R = rules();
  assert.equal(R.markEffectNumbers('Koszt: 1 jednostka środków. Robotnicy bardziej ufają PPS (+3).'),
    '<span class="pl-cost">Koszt: 1 jednostka środków.</span>Robotnicy bardziej ufają PPS<span class="pl-fx"> (+3)</span>.');
  assert.equal(R.markEffectNumbers('Zysk: 1 jednostka.'), 'Zysk: 1 jednostka.', 'only a cost opens a line of its own');
  const ACTION = /zużywa akcj|kosztuje akcję|Akcja miesiąca|akcji miesiąca|akcję miesiąca|akcji tego miesiąca|akcję tego miesiąca|kosztuje miesiąca|Bez akcji|Nie zużywa akcji/i;
  const BARE = /^(unavailable-)?subtitle: (\[\?[^:]*: )?(Kosztuje|Jedna jednostka|Dwie jednostki|1 jednostka środków|2 jednostki środków|Pół jednostki|0,5 jednostki)/;
  const problems = [];
  for (const file of walk(path.join(ROOT, 'source/i18n/pl/scenes')).filter(f => f.endsWith('.json') && !/strike_1923|army_oversight/.test(f))) {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const [en, pl] of Object.entries(j.lines)) {
      if (typeof pl !== 'string' || /Q\./.test(en) || /główna akcja miesiąca/.test(pl)) continue; // the glossary of the Library names the unit T
      if (ACTION.test(pl)) problems.push('action: ' + j.source + ': ' + pl.slice(0, 80));
      if (BARE.test(pl)) problems.push('bare cost: ' + j.source + ': ' + pl.slice(0, 80));
    }
  }
  assert.deepEqual(problems, []);
});

test('Przegląd i „Nic nie robimy” 1.08: the Overview shows the resources and the state of the economy; doing nothing plays the card and keeps the month', () => {
  const engine = dendry.startGame(1922, 'pl');
  const Q = engine.state.qualities, S = Q.S;
  try {
    globalThis.PolishTopbar.overviewView(Q);
    assert.equal(Q.pl_top_cash, '2,0');
    assert.equal(Q.pl_top_economy, 'zastój', 'no growth at the start');
    S.economy.last_growth = 0.5;
    globalThis.PolishTopbar.overviewView(Q);
    assert.equal(Q.pl_top_economy, 'wzrost');
    S.economy.last_growth = -1.5;
    globalThis.PolishTopbar.overviewView(Q);
    assert.equal(Q.pl_top_economy, 'kryzys');
    engine.state.currentHands.main = [{ id: 'polish_party_militia', title: 'Milicja' }];
    engine.playCard('polish_party_militia');
    const ids = (engine.getCurrentChoices() || []).map(c => c.id);
    assert.ok(ids.includes('polish_party_militia.nothing'));
    dendry.choose(engine, 'polish_party_militia.nothing');
    assert.equal(Q.month_actions || 0, 0, 'the month stays free');
    assert.ok(globalThis.PolishRules.cardRest(Q, 'polish_party_militia') > 0, 'the card rests as after a use');
  } finally {
    rules().setLanguage('en');
  }
});
