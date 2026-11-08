'use strict';

// The sidebar (Z — 0.54): one fact per line, and the lines of the Main and Politics tabs are computed by the tabs
// themselves. Loading a save does not run the scripts of the month page, so without this a save from before 0.54,
// which has no such fields yet, would show 0 in these lines until the next choice. Since 0.55 every fact has a bold
// label, and the composite lines of the party are split into one value per line.
const test = require('node:test');
const assert = require('node:assert/strict');
const dendry = require('./helpers/dendry.js');

const flat = c => (c == null ? '' : typeof c === 'string' ? c : Array.isArray(c) ? c.map(flat).join('') :
  typeof c === 'object' ? flat(c.content) + (c.type === 'paragraph' || c.type === 'heading' ? '\n' : '') : String(c));
// Z — 0.56: the money of the original game has no income, upkeep or sales; a collection line replaces them.
const NEW_FIELDS = /^pl_party_(collection|dues|membership|apparatus|union_)|^pl_pol_/;

// The same steps as window.updateSidebar: the tab's on-arrival, then its content.
const display = (engine, id) => {
  const scene = engine.game.scenes[id];
  engine._runActions(scene.onArrival);
  return engine._makeDisplayContent(scene.content, true);
};
const sidebar = (engine, id) => flat(display(engine, id));

// The bold parts of a display: the labels in **…** and the raw HTML of the faction names.
const bold = content => {
  const out = [];
  const visit = c => {
    if (Array.isArray(c)) c.forEach(visit);
    else if (c && typeof c === 'object') {
      if (c.type === 'emphasis-2') out.push(flat(c.content));
      else if (c.type === 'magic' && /<strong>/.test(flat(c.content))) out.push(flat(c.content).replace(/<[^>]*>/g, ''));
      else visit(c.content);
    }
  };
  visit(content);
  return out;
};

for (const lang of ['en', 'pl']) {
  test(`Pasek boczny po wczytaniu zapisu sprzed 0.54 od razu pokazuje wartości (${lang})`, () => {
    const errors = dendry.watchEngineErrors();
    const engine = dendry.startGame(1922, lang);
    const expected = {status: sidebar(engine, 'status'), 'status.politics': sidebar(engine, 'status.politics')};
    const saved = dendry.clone(engine.getExportableState());
    const removed = Object.keys(saved.qualities).filter(k => NEW_FIELDS.test(k));
    assert.equal(removed.length, 12, removed.join(', '));
    for (const k of removed) delete saved.qualities[k];
    const restored = dendry.restoreState(saved, lang);
    for (const id of Object.keys(expected)) assert.equal(sidebar(restored, id), expected[id], id);
    const main = expected.status, politics = expected['status.politics'];
    if (lang === 'pl') {
      assert.match(main, /\nZbiórka przynosi: 2\u00a0R\s*\nSkładki: 2 z 4\s*\nCzłonkostwo \(indeks\): 100\s*\nPoziom aparatu: 1 z 4 ?\n/);
      assert.match(politics, /\nDemokracja: [1-9][\d,]*\u00a0na\u00a0100 ?\n/);
    } else {
      assert.match(main, /\nA collection brings: 2\u00a0R\s*\nDues: 2 of 4\s*\nMembership \(index\): 100\s*\nApparatus level: 1 of 4 ?\n/);
      assert.match(politics, /\nDemocracy: [1-9][\d.]*\u00a0of\u00a0100 ?\n/);
    }
    assert.deepEqual(errors, []);
  });
}

test('Pasek boczny: pogrubione etykiety, rozbite wiersze i liczby bez zbędnych miejsc po przecinku (pl)', () => {
  const errors = dendry.watchEngineErrors();
  const engine = dendry.startGame(1922, 'pl');
  const main = display(engine, 'status'), politics = display(engine, 'status.politics');
  const mainText = flat(main).replace(/<[^>]*>/g, ''), politicsText = flat(politics).replace(/<[^>]*>/g, '');
  // Z — 0.76: the tab "Partia" has no date heading; its first heading is PPS.
  assert.match(mainText, /^\s*PPS ?\n/);
  assert.doesNotMatch(mainText, /Styczeń 1922/);
  for (const label of ['Kasa partii:', 'Zbiórka przynosi:', 'Składki:', 'Członkostwo (indeks):', 'Poziom aparatu:',
    'Sprzeciw w partii:', 'Spójność:', 'Pozycja PPS:', 'Prasa:', 'Towarzystwo Uniwersytetu Robotniczego:', 'Spółdzielnia spożywców:', 'Przemysł:', 'Kolej:',
    'Robotnicy rolni:', 'Głowa państwa:', 'Premier:', 'Zorganizowani członkowie:', 'Centrum PPS', 'Lewica PPS', 'Piłsudczycy']) {
    assert.ok(bold(main).includes(label), label);
  }
  for (const label of ['Demokracja:', 'Autorytet Sejmu:', 'Niezadowolenie:', 'Przemoc:', 'Presja na zamach:', 'PPS:',
    'Posłowie mniejszości:', 'Następne wybory do Sejmu:', 'Wymagana większość:', 'ZLN:']) {
    assert.ok(bold(politics).includes(label), label);
  }
  // A union line no longer repeats its branch in the value; cohesion is a whole number.
  assert.match(mainText, /\nPrzemysł: zasięg słaby ?\n/, 'no union funds since Z — 0.86; the reach in a word since Z — 1.15');
  assert.match(mainText, /\nSpójność: \d+ na 100 ?\n/);
  assert.match(mainText, /\nSprzeciw w partii: [^;\n]+\n/);
  // No space before the colon after the minority deputies; a dash after each faction name. The top bar (7 XI 2026): the
  // Milicja PPS and the factions are in the Party tab, the politics of the state in the State tab.
  assert.match(politicsText, /\nPosłowie mniejszości: +\d+ posłów/);
  assert.match(mainText, /\nCentrum PPS — siła: [^,]+, sprzeciw: /);
  assert.deepEqual(errors, []);
});

// The top bar (7 XI 2026): the Milicja PPS is in the Party tab; the police and the army are in the State tab, which
// draws the gauges of the police from markers in the lines.
test('Pasek: Milicja PPS w zakładce Partia, policja i wojsko w zakładce Państwo, jedna informacja w wierszu (pl)', () => {
  const errors = dendry.watchEngineErrors();
  const engine = dendry.startGame(1922, 'pl');
  const defense = display(engine, 'status.paramilitaries');
  const text = flat(defense).replace(/<[^>]*>/g, '');
  const main = flat(display(engine, 'status'));
  // Z — 0.89: the training in levels; the condition and the attachment of the Milicja left the tab.
  assert.match(main, /\nMilicja PPS ?\nZorganizowani członkowie: 200 ?\nWyszkolenie: poziom 1\u00a0z\u00a05 ?\nStatus prawny: legalna ?\n/);
  assert.doesNotMatch(main + text, /Przywiązanie do legalnych instytucji|Sprawność/);
  assert.doesNotMatch(text, /Milicja/);
  assert.match(text, /(?:^|\n)\s*Policja ?\n\s*Potencjał: 50 ?\nDowodzenie: 50 ?\nPraworządność: 50 ?\nOchrona jednego zgromadzenia: [\d,]+\u00a0na\u00a0100 ?\n/);
  // Z — 1.03 (decision 4A of 7 XI 2026): the army in words, without numbers.
  assert.match(text, /\nWojsko ?\n\s*(Większość oficerów sprzyja Piłsudskiemu|Wojsko jest podzielone; wielu oficerów sprzyja Piłsudskiemu|Większość wojska jest wierna rządowi|Wojsko jest wierne rządowi)\. ?\n/);
  assert.doesNotMatch(text, /Zgrupowania wojska|odwód|\d+–\u2060\d+%/);
  assert.deepEqual(errors, []);
});

// Z — 0.76 (the user's note of 8 X 2026): the first tab is called "Partia" and shows no date, before the game and in it.
test('Pasek boczny: zakładka „Partia” bez daty, przed rozpoczęciem gry i w grze (pl)', () => {
  const errors = dendry.watchEngineErrors();
  const before = dendry.createEngine(1922, 'pl');
  assert.doesNotMatch(sidebar(before, 'status'), /^Stan ?\n/);
  const engine = dendry.startGame(1922, 'pl');
  assert.match(sidebar(engine, 'status'), /^\s*PPS ?\n/);
  assert.doesNotMatch(sidebar(engine, 'status'), /Styczeń 1922/);
  assert.deepEqual(errors, []);
});

// Z — 0.56: the opening computes the polls at once; before, the Polls tab showed 0% until the first visit of post_event.
test('Sondaże na starcie pokazują poparcie z otwarcia, nie zera (pl)', () => {
  const errors = dendry.watchEngineErrors();
  const engine = dendry.startGame(1922, 'pl');
  const text = sidebar(engine, 'status.polls');
  // The top bar (7 XI 2026): a bar is drawn before each share from a marker in the line.
  assert.match(text.replace(/<i [^>]*><\/i>/g, ''), /\nPPS: [1-9]\d*%/);
  // Z — 0.63: the social groups are one table (a row for each party); the first column is the workers.
  assert.match(text, /<th><span>Robotnicy<\/span><\/th>/);
  assert.match(text, /<tr class="pl-pps"><th>\s*PPS\s*<\/th><td>\s*[1-9]\d*\s*<\/td>/);
  const Q = engine.state.qualities;
  assert.equal(Math.round(100 * Q.parties.reduce((n, p) => n + Q[p + '_normalized'], 0)), 100, 'the national shares sum to 100%');
  assert.deepEqual(errors, []);
});
