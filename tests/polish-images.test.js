'use strict';

// Images of the Polish cards and events (added 4 October 2026). The files live in assets/img/polish/ as sRGB JPEG of at
// most 800 px; as in the original game, cards and pinned cards show them on the card (card-image) and events on their
// page (face-image); the heritage card shows the Wawel on the card and the Royal Castle on its page. Every file has an
// entry in credits_images.txt, and both compiled games carry the same images.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const POLISH = path.join(ROOT, 'assets/img/polish');
const walk = dir => fs.readdirSync(dir, {withFileTypes: true})
  .flatMap(e => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const polishFiles = () => fs.readdirSync(POLISH).filter(f => f.endsWith('.jpg')).sort();

test('Obrazki: każdy obrazek sceny istnieje, a każdy polski obrazek jest użyty raz i ma wpis w credits_images.txt', () => {
  const used = new Map();
  for (const file of walk(path.join(ROOT, 'source/scenes')).filter(f => f.endsWith('.dry'))) {
    for (const m of fs.readFileSync(file, 'utf8').matchAll(/^(card-image|face-image):\s*img\/(\S+)\s*$/gm)) {
      assert.ok(fs.existsSync(path.join(ROOT, 'assets/img', m[2])), `${path.relative(ROOT, file)}: img/${m[2]} exists in assets/img`);
      used.set(m[2], (used.get(m[2]) || []).concat(path.relative(ROOT, file)));
    }
  }
  const credits = fs.readFileSync(path.join(ROOT, 'credits_images.txt'), 'utf8');
  const files = polishFiles();
  assert.equal(files.length, 59, 'with the card of the unions (Z — 0.56)');
  for (const f of files) {
    assert.equal((used.get('polish/' + f) || []).length, 1, `polish/${f} is used by exactly one scene`);
    assert.ok(credits.includes('\npolish/' + f + ': '), `polish/${f} has an entry in credits_images.txt`);
  }
});

test('Obrazki: karty i karty CKW mają obrazek na karcie, wydarzenia na stronie; obie wersje językowe mają te same obrazki', () => {
  const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  const games = {en: read('out/game.json'), pl: read('out/html/game_pl.json')};
  for (const f of polishFiles()) {
    const name = f.replace(/\.jpg$/, '');
    const id = name.replace(/_(wawel|zamek_krolewski)$/, '');
    const scene = games.en.scenes[id];
    assert.ok(scene, `${f}: scene ${id}`);
    const card = !!(scene.isCard || scene.isPinnedCard);
    const key = name === 'polish_gov_heritage_zamek_krolewski' ? 'faceImage' : card ? 'cardImage' : 'faceImage';
    // Z — 0.56: B2 became a card of the Parliament deck and kept its scene ID, polish_event_pils_criticism.
    const event = id.startsWith('polish_event_') && id !== 'polish_event_pils_criticism';
    assert.equal(card, !event, `${id}: cards and pinned cards are not events`);
    assert.equal(scene[key], 'img/polish/' + f, `${id}: ${key}`);
    assert.equal(games.pl.scenes[id][key], scene[key], `${id}: the Polish game shows the same image`);
  }
  const heritage = games.en.scenes.polish_gov_heritage;
  assert.deepEqual([heritage.cardImage, heritage.faceImage],
    ['img/polish/polish_gov_heritage_wawel.jpg', 'img/polish/polish_gov_heritage_zamek_krolewski.jpg']);
});
