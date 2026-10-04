'use strict';
// Line classifier for Dendry source files (.dry) of the Polish version of the game.
//
// The translation of a scene is kept line by line (source/i18n/<language>/...): a translated line replaces the
// English line with the same trimmed text, and the rest of the scene (conditions, scripts, jumps) stays shared. This
// module decides which lines carry player-facing text and therefore need a translation:
// - content lines (paragraphs, `= headings`, `- @choice: text`) with letters outside Dendry markup;
// - the text properties title, subtitle, unavailable-subtitle, achievement and game-over;
// - lines of scripts ({! ... !}) with a string literal that looks like display text;
// - quality-display ranges `(a..b) text`.
// Comments, identifiers, conditions and jumps are not translated.

const TEXT_KEYS = new Set(['title', 'subtitle', 'unavailable-subtitle', 'achievement', 'game-over']);

// Letters that remain after removing Dendry markup: inserts [+ x +], the condition part of [? if x : ... ?],
// emphasis and links.
function visibleLetters(text) {
  const stripped = text
    .replace(/\[\+[^+]*\+\]/g, ' ')
    .replace(/\[\?\s*if\s+[^:]*:/g, ' ')
    .replace(/\?\]/g, ' ')
    .replace(/[*_=\-@#]/g, ' ');
  return /\p{L}{2,}/u.test(stripped);
}

// A string literal of a script line that may be shown to the player: a word of two or more letters with a space
// (' MPs; ', 'Marshal of the Sejm'), or a text starting with a capital letter ('Vacant — '). Identifiers
// ('military_compromise'), file paths and selectors are not. Lower-case single words ('passed') cannot be told apart
// from identifiers here; such lines are added to a translation file by hand.
function displayLiterals(line) {
  const out = [];
  const re = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    const s = m[1] !== undefined ? m[1] : m[2];
    if (!/\p{L}{2,}/u.test(s)) continue;
    if (/^(img|music|audio)\//.test(s) || /^[#.][\w-]+$/.test(s) || /\.(js|json|png|jpe?g|mp3|ogg|css)$/.test(s)) continue;
    if (/\s/.test(s) || /^\p{Lu}/u.test(s)) out.push(s);
  }
  return out;
}

// Classifies every line of a .dry file. Each entry: {n (1-based), text (as in the file), trimmed, kind, translatable}.
// kind: blank, comment, scene-id, property, text-property, code, content, choice, qdisplay.
function classify(source, file) {
  const lines = source.split('\n');
  const qdisplay = /\.qdisplay\.dry$/.test(file || '');
  const out = [];
  let state = 'props';
  let inCode = false;
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i];
    const trimmed = text.trim();
    const entry = {n: i + 1, text, trimmed, kind: 'content', translatable: false};
    out.push(entry);
    if (inCode) {
      entry.kind = 'code';
      if (trimmed.includes('!}')) inCode = false;
      const code = trimmed.replace(/\/\/.*$/, '');
      entry.translatable = !trimmed.startsWith('//') && displayLiterals(code).length > 0;
      continue;
    }
    if (trimmed === '') {
      entry.kind = 'blank';
      if (state === 'props') state = 'content';
      continue;
    }
    if (trimmed.startsWith('#')) { entry.kind = 'comment'; continue; }
    if (qdisplay) {
      const q = trimmed.match(/^\(([^)]*)\)\s*(.*)$/);
      if (q) { entry.kind = 'qdisplay'; entry.translatable = visibleLetters(q[2]); continue; }
      const p = trimmed.match(/^([a-z][a-z0-9-]*)\s*:/);
      entry.kind = p ? 'property' : 'content';
      continue;
    }
    if (/^@[\w.-]+\s*$/.test(trimmed)) { entry.kind = 'scene-id'; state = 'props'; continue; }
    if (state === 'props') {
      const m = trimmed.match(/^([a-z][a-z0-9-]*)\s*:\s*(.*)$/);
      if (m) {
        const key = m[1], value = m[2];
        if (value.includes('{!')) {
          entry.kind = 'code';
          const after = value.slice(value.indexOf('{!') + 2);
          if (!after.includes('!}')) inCode = true;
          entry.translatable = displayLiterals(after.replace(/!\}.*$/, '').replace(/\/\/.*$/, '')).length > 0;
          continue;
        }
        if (TEXT_KEYS.has(key)) {
          entry.kind = 'text-property';
          entry.translatable = visibleLetters(value);
        } else {
          entry.kind = 'property';
        }
        continue;
      }
      // Dendry starts the content at the first line that is not a property.
      state = 'content';
    }
    if (/^-\s*[@#]/.test(trimmed)) {
      entry.kind = 'choice';
      const colon = trimmed.indexOf(':');
      entry.translatable = colon >= 0 && visibleLetters(trimmed.slice(colon + 1));
      continue;
    }
    entry.kind = 'content';
    entry.translatable = visibleLetters(trimmed);
  }
  return out;
}

module.exports = {classify, displayLiterals, visibleLetters, TEXT_KEYS};
