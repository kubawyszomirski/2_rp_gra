'use strict';

// Shared helpers for engine tests (docs/POLISH_IMPLEMENTATION_PLAN.md, stage 0). They run the real
// Dendry engine on the built out/game.json and load the rules module from out/html/, as the page does.
// Build the game with `npm run build` before running the tests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { mock } = require('node:test');
const { convertJSONToGame, DendryEngine, NullUserInterface } = require('dendrynexus/lib/engine');

const ROOT = path.join(__dirname, '..', '..');
const RULES_FILE = path.join(ROOT, 'out', 'html', 'polish_rules.js');
const INSTITUTIONS_FILE = path.join(ROOT, 'out', 'html', 'polish_institutions.js');
const ECONOMY_FILE = path.join(ROOT, 'out', 'html', 'polish_economy.js');
const GOVERNMENT_FILE = path.join(ROOT, 'out', 'html', 'polish_government.js');
const PROJECTS_FILE = path.join(ROOT, 'out', 'html', 'polish_projects.js');
const ELECTORATE_FILE = path.join(ROOT, 'out', 'html', 'polish_electorate.js');
const PARTY_FILE = path.join(ROOT, 'out', 'html', 'polish_party.js');
const UNIONS_FILE = path.join(ROOT, 'out', 'html', 'polish_unions.js');
const POLITICS_FILE = path.join(ROOT, 'out', 'html', 'polish_politics.js');
const SECURITY_FILE = path.join(ROOT, 'out', 'html', 'polish_security.js');
const HOOKS_FILE = path.join(ROOT, 'out', 'html', 'polish_engine_hooks.js');
const clone = value => JSON.parse(JSON.stringify(value));

// The English game is out/game.json; the Polish version is out/html/game_pl.json, built by tools/i18n/build.cjs
// from the same scenes with translated lines (Polish version, decision 1A).
const GAME_FILES = { en: path.join(ROOT, 'out', 'game.json'), pl: path.join(ROOT, 'out', 'html', 'game_pl.json') };
const gameJSON = {};
function compiledGameJSON(lang = 'en') {
  if (!gameJSON[lang]) gameJSON[lang] = fs.readFileSync(GAME_FILES[lang], 'utf8');
  return gameJSON[lang];
}

// The page loads out/html/polish_rules.js as window.PolishRules and out/html/polish_institutions.js as
// window.PolishInstitutions before core.js, and game.js installs the engine hooks from
// out/html/polish_engine_hooks.js; the tests load the same built copies.
function loadRules() {
  globalThis.PolishRules = require(RULES_FILE);
  globalThis.PolishInstitutions = require(INSTITUTIONS_FILE);
  globalThis.PolishElectorate = require(ELECTORATE_FILE);
  globalThis.PolishEconomy = require(ECONOMY_FILE);
  globalThis.PolishGovernment = require(GOVERNMENT_FILE);
  globalThis.PolishProjects = require(PROJECTS_FILE);
  globalThis.PolishParty = require(PARTY_FILE);
  globalThis.PolishUnions = require(UNIONS_FILE);
  globalThis.PolishPolitics = require(POLITICS_FILE);
  globalThis.PolishSecurity = require(SECURITY_FILE);
  globalThis.PolishEngineHooks = require(HOOKS_FILE);
  globalThis.PolishEngineHooks.install(DendryEngine.prototype, globalThis.PolishRules);
  return globalThis.PolishRules;
}

// A few inherited scenes use window.dendryUI.dendryEngine and the page's d3 charts. Outside the
// browser this minimal stand-in points at the running engine and leaves the charts out.
function installBrowserStubs(engine) {
  globalThis.window = { dendryUI: { dendryEngine: engine } };
  globalThis.d3 = undefined;
}

function createUI() {
  const ui = new NullUserInterface();
  ui.paragraphs = [];
  ui.newPage = () => { ui.paragraphs = []; };
  ui.displayContent = content => { ui.paragraphs.push(...content); };
  return ui;
}

// A fresh compiled game for every engine: scenes are mutable objects during play. The language of the rules' texts
// follows the game: English unless a test asks for the Polish version.
function createEngine(seed = 1922, lang = 'en') {
  loadRules().setLanguage(lang);
  let game;
  convertJSONToGame(compiledGameJSON(lang), (error, result) => { if (error) throw error; game = result; });
  const engine = new DendryEngine(createUI(), game);
  installBrowserStubs(engine);
  engine.beginGame([seed]);
  return engine;
}

function choose(engine, id) {
  const choices = engine.getCurrentChoices() || [];
  const index = choices.findIndex(choice => choice.id === id);
  assert.ok(index >= 0, `${id} missing in ${engine.state.sceneId}: ${choices.map(choice => choice.id)}`);
  assert.equal(choices[index].canChoose, true, `${id} must be eligible`);
  engine.choose(index);
}

// Walks the cabinet formation (card 7.1; technical reference 8.8, C1) and submits one offer. Z — 0.71: the formation is a
// wizard — the introduction, the variant (which carries the role of PPS: a party cabinet with PPS in it, a cabinet of
// experts supported from outside, or opposition), the prime minister and the portfolios when there is a choice, and the
// summary with the minorities and the commit. It starts on the post-election summary or on the introduction.
function formCabinet(engine, { configuration, mode, candidate, minorities, claim } = {}) {
  if (engine.state.sceneId === 'sejm_election.government') choose(engine, 'polish_cabinet_formation');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation');
  const F = 'polish_cabinet_formation.';
  const draft = () => engine.state.qualities.S.negotiation.draft;
  choose(engine, `${F}variants`);
  const configId = configuration || draft().configuration_id;
  // Without a role or a cabinet the preset of the draft holds (e.g. the opposition answer of B1).
  if (mode === 'opposition' || (!mode && !configuration && draft().pps_mode === 'opposition')) {
    choose(engine, `${F}var_opposition`);
  } else {
    assert.ok(!mode || mode === (configId === 'expert' ? 'external_support' : 'member'),
      `the role ${mode} is not part of the variant ${configId}`);
    choose(engine, `${F}var_${configId}`);
  }
  if (engine.state.sceneId === `${F}premier`) choose(engine, `${F}cand_${candidate || draft().candidate_id}`);
  else if (candidate) assert.equal(draft().candidate_id, candidate, 'the only possible prime minister');
  if (engine.state.sceneId === `${F}portfolio_menu`) {
    if (claim) {
      // Z — 0.61: step 4 gives up the portfolios held now and takes the requested ones with influence points.
      for (const c of engine.getCurrentChoices().filter(c => c.id.startsWith(`${F}drop_`) && c.canChoose !== false)) choose(engine, c.id);
      for (const key of claim) choose(engine, `${F}take_${key}`);
    }
    choose(engine, `${F}ports_next`);
  } else {
    assert.ok(!claim, 'the portfolios of this variant cannot be chosen');
  }
  assert.equal(engine.state.sceneId, `${F}summary`);
  if (minorities === true) choose(engine, `${F}minorities_on`);
  if (minorities === false && (engine.getCurrentChoices() || []).some(c => c.id === `${F}minorities_off`)) {
    choose(engine, `${F}minorities_off`);
  }
  choose(engine, `${F}submit`);
  assert.equal(engine.state.sceneId, `${F}result`);
  const result = engine.state.qualities.S.history.negotiations.at(-1).result;
  choose(engine, `${F}done`);
  return result;
}

// Tests that fix the electorate write the seven class rows; since stage 5 the cells own the preferences,
// so the rows are turned into cells again (the same calibrated method as the opening, 5.1–5.2).
function setClassRows(Q, values) {
  for (const group of Q.classes) for (const party of Q.parties) Q[`${group}_${party}`] = values[party] || 0;
  if (Q.S && Q.S.society && Q.S.society.cells) {
    globalThis.PolishElectorate.seedCells(Q);
    globalThis.PolishElectorate.writeClassMirrors(Q);
  }
}

function startGame(seed = 1922, lang = 'en') {
  const engine = createEngine(seed, lang);
  choose(engine, 'root.start');
  choose(engine, 'root.1928_main');
  return engine;
}

// Loads a saved state into a new engine, as the page does: JSON of the exportable state and setState.
function restoreState(saved, lang = globalThis.PolishRules ? globalThis.PolishRules.getLanguage() : 'en') {
  loadRules().setLanguage(lang);
  let game;
  convertJSONToGame(compiledGameJSON(lang), (error, result) => { if (error) throw error; game = result; });
  const restored = new DendryEngine(createUI(), game);
  installBrowserStubs(restored);
  restored.setState(clone(saved));
  return restored;
}

function saveAndRestore(engine) {
  return restoreState(clone(engine.getExportableState()));
}

// The engine only logs script errors: "Error:" for scripts and conditions, "Error in expression"
// for expressions. Tests collect every such message and fail on any that is not explicitly allowed.
function watchEngineErrors() {
  const errors = [];
  mock.method(console, 'log', (...args) => {
    if (String(args[0]).startsWith('Error')) {
      errors.push(args.map(arg => (arg instanceof Error ? `${arg.name}: ${arg.message}` : String(arg))).join(' '));
    }
  });
  return errors;
}

// Z — 0.57: the party agenda, the unions and the protection of the unemployed are ordinary cards of the decks, no longer
// pinned. A test plays such a card as if it had been drawn: from main, the card is put into the hand and played.
function playCard(engine, id) {
  if (engine.state.sceneId !== 'main') engine.goToScene('main');
  const hand = engine.state.currentHands.main || (engine.state.currentHands.main = []);
  if (!hand.some(card => card.id === id)) hand.push({ id, title: id });
  engine.playCard(id);
}

// Plays with a fixed rule: among the choosable options, sorted by ID because the build does not fix
// the order of scenes, take the one at a position given by the step number and the variant. On the
// same page in the same month it first tries options not yet taken there, so free moves such as
// opening an adviser on cooldown cannot keep the walk in one place.
function walk(engine, { variant = 0, maxSteps = 2500, lastYear = 1928, onStep } = {}) {
  let current = engine;
  let step = 0;
  const tried = new Map();
  const visits = new Map();
  for (; step < maxSteps && !current.isGameOver() && current.state.qualities.year <= lastYear; step++) {
    if (onStep) {
      const replacement = onStep(current, step);
      if (replacement) current = replacement;
    }
    const options = (current.getCurrentChoices() || [])
      .map((choice, index) => ({ id: choice.id, index, open: choice.canChoose !== false }))
      .filter(option => option.open)
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    if (!options.length) break;
    const key = current.state.sceneId + '@' + current.state.qualities.time;
    const taken = tried.get(key) || new Set();
    const fresh = options.filter(option => !taken.has(option.id));
    // Once every option of this page has been taken this month, rotate through all of them: a stride that shares a factor
    // with their number would cycle over a few free moves for ever (nine options and the stride 3, seen in Z — 0.56). Z — 0.60:
    // the rotation counts the visits of the page, not the steps — main is reached every second step, so an even number of
    // options cycled over half of them (four options, two advisers).
    const visit = (visits.get(key) || 0) + 1;
    visits.set(key, visit);
    const pick = fresh.length ? fresh[(step * (variant + 3) + variant) % fresh.length] : options[(visit + variant) % options.length];
    taken.add(pick.id);
    tried.set(key, taken);
    current.choose(pick.index);
  }
  return { engine: current, steps: step };
}

module.exports = {
  ROOT,
  RULES_FILE,
  INSTITUTIONS_FILE,
  ECONOMY_FILE,
  GOVERNMENT_FILE,
  PROJECTS_FILE,
  ELECTORATE_FILE,
  PARTY_FILE,
  UNIONS_FILE,
  POLITICS_FILE,
  SECURITY_FILE,
  HOOKS_FILE,
  clone,
  loadRules,
  installBrowserStubs,
  createEngine,
  choose,
  formCabinet,
  setClassRows,
  startGame,
  restoreState,
  saveAndRestore,
  watchEngineErrors,
  playCard,
  walk,
};
