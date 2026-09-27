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

let gameJSON = null;
function compiledGameJSON() {
  if (gameJSON === null) gameJSON = fs.readFileSync(path.join(ROOT, 'out', 'game.json'), 'utf8');
  return gameJSON;
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
  require(HOOKS_FILE).install(DendryEngine.prototype, globalThis.PolishRules);
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

// A fresh compiled game for every engine: scenes are mutable objects during play.
function createEngine(seed = 1922) {
  loadRules();
  let game;
  convertJSONToGame(compiledGameJSON(), (error, result) => { if (error) throw error; game = result; });
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

// Walks the one-screen cabinet formation (card 7.1; technical reference 8.8, C1) and submits one
// offer. It starts on the post-election summary or on the formation page; each option changes only
// the offer, so the order is fixed: cabinet, role of PPS, prime minister, minorities, portfolios.
function formCabinet(engine, { configuration, mode, candidate, minorities, claim } = {}) {
  if (engine.state.sceneId === 'sejm_election.government') choose(engine, 'polish_cabinet_formation');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation');
  const pick = (menu, option) => {
    choose(engine, `polish_cabinet_formation.${menu}`);
    choose(engine, `polish_cabinet_formation.${option}`);
  };
  if (configuration) pick('configurations', `cfg_${configuration}`);
  if (mode) pick('modes', `mode_${mode}`);
  if (candidate) pick('candidates', `cand_${candidate}`);
  if (minorities === true) choose(engine, 'polish_cabinet_formation.minorities_on');
  if (minorities === false && (engine.getCurrentChoices() || []).some(c => c.id === 'polish_cabinet_formation.minorities_off')) {
    choose(engine, 'polish_cabinet_formation.minorities_off');
  }
  if (claim) {
    choose(engine, 'polish_cabinet_formation.portfolios');
    if (claim.length === 1 && claim[0] === 'labor') choose(engine, 'polish_cabinet_formation.claim_labor');
    else if (claim[0] === 'labor') pick('claim_plus', `plus_${claim[1]}`);
    else pick('claim_instead', `instead_${claim[0]}`);
  }
  choose(engine, 'polish_cabinet_formation.submit');
  assert.equal(engine.state.sceneId, 'polish_cabinet_formation.result');
  const result = engine.state.qualities.S.history.negotiations.at(-1).result;
  choose(engine, 'polish_cabinet_formation.done');
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

function startGame(seed = 1922) {
  const engine = createEngine(seed);
  choose(engine, 'root.start');
  choose(engine, 'root.1928_main');
  return engine;
}

// Loads a saved state into a new engine, as the page does: JSON of the exportable state and setState.
function restoreState(saved) {
  loadRules();
  let game;
  convertJSONToGame(compiledGameJSON(), (error, result) => { if (error) throw error; game = result; });
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

// Plays with a fixed rule: among the choosable options, sorted by ID because the build does not fix
// the order of scenes, take the one at a position given by the step number and the variant. On the
// same page in the same month it first tries options not yet taken there, so free moves such as
// opening an adviser on cooldown cannot keep the walk in one place.
function walk(engine, { variant = 0, maxSteps = 2500, lastYear = 1928, onStep } = {}) {
  let current = engine;
  let step = 0;
  const tried = new Map();
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
    const pool = fresh.length ? fresh : options;
    const pick = pool[(step * (variant + 3) + variant) % pool.length];
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
  walk,
};
