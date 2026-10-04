'use strict';
// Stage 8, part 8f: what the researched values would change, measured before any decision. The script changes no
// file of the game: each variant compiles a modified copy of a built rules module (out/html/) into Node's module
// cache in its own child process, then plays the scripted strategies of tests/helpers/strategies.js on the shared
// seeds 8001–8012 (as analysis/stage8-campaigns/run.cjs).
// Usage: node analysis/stage8-research/whatif.cjs  →  results.json and a summary on the console.
// The measurement belongs to the state before the decisions of 4 X 2026 (the military case in I 1925, the cult in
// I 1923, the coup pressure starting at 10); results.json keeps it. After the decisions the built game no longer has
// that state, so the script stops instead of measuring something else; the campaigns of the decided state are in
// analysis/stage8-campaigns/ (label after-8f).
const fs = require('fs');
const path = require('path');
const Module = require('module');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
if (fs.readFileSync(path.join(root, 'out', 'html', 'polish_politics.js'), 'utf8').indexOf('military_case: T(1925, 1)') < 0) {
  console.log('The built game is past the decisions of 4 X 2026; results.json keeps the measurement made before them.');
  process.exit(0);
}
const SEEDS = Array.from({ length: 12 }, (_, i) => 8001 + i);

// The variants of the military case (report, point 1): the opening month and the earliest month of the public
// episode of military pressure (+8; now "the first cabinet crisis with an open case").
const VARIANTS = [
  { id: 'present', label: 'case I 1925, episode in the first crisis with an open case (the present game)' },
  { id: 'case_1923_07', label: 'case VII 1923, episode unchanged', military_case: [1923, 7] },
  { id: 'case_1923_07_episode_1925_11', label: 'case VII 1923, episode from XI 1925', military_case: [1923, 7], episode_from: [1925, 11] },
  // Point 5 of the report: the commemoration of the assassin one month later, after his execution on 31 I 1923.
  { id: 'cult_1923_02', label: 'the event of the cult from II 1923 (case and episode as in the present game)', niewiadomski_cult: [1923, 2] },
];

function patchPolitics(variant) {
  const file = path.join(root, 'out', 'html', 'polish_politics.js');
  let src = fs.readFileSync(file, 'utf8');
  if (variant.military_case) {
    const needle = 'military_case: T(1925, 1)';
    if (src.indexOf(needle) < 0) throw new Error('the date of the military case was not found in ' + file);
    src = src.replace(needle, 'military_case: T(' + variant.military_case.join(', ') + ')');
  }
  if (variant.niewiadomski_cult) {
    const needle = 'niewiadomski_cult: T(1923, 1)';
    if (src.indexOf(needle) < 0) throw new Error('the date of the cult event was not found in ' + file);
    src = src.replace(needle, 'niewiadomski_cult: T(' + variant.niewiadomski_cult.join(', ') + ')');
  }
  if (variant.episode_from) {
    const needle = "if (open && S.cabinet_crisis && !protectiveAgreement(S) && !P.episodes.some(e => e.id === 'public_military_pressure')) {";
    if (src.indexOf(needle) < 0) throw new Error('the condition of the public episode was not found in ' + file);
    src = src.replace(needle, needle.replace('if (open && ', 'if (open && Q.time >= T(' + variant.episode_from.join(', ') + ') && '));
  }
  const m = new Module(file, null);
  m.filename = file;
  m.paths = Module._nodeModulePaths(path.dirname(file));
  m._compile(src, file);
  m.loaded = true;
  require.cache[file] = m;
}

const quiet = fn => { const log = console.log; console.log = () => {}; try { return fn(); } finally { console.log = log; } };
const median = xs => { const s = xs.filter(x => x !== null).sort((a, b) => a - b); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };

function runVariant(variant) {
  if (variant.military_case || variant.episode_from || variant.niewiadomski_cult) patchPolitics(variant);
  const strategies = require(path.join(root, 'tests', 'helpers', 'strategies.js'));
  const ym = t => (t === null ? null : strategies.ym(t));
  const out = {};
  for (const id of Object.keys(strategies.STRATEGIES)) {
    const rs = [], first65 = [], episodes = [];
    for (const seed of SEEDS) {
      const run = quiet(() => strategies.runCampaign(id, seed));
      rs.push(strategies.summarize(run));
      const f = run.months.find(m => m.pressure >= 65);
      first65.push(f ? f.t : null);
      const ep = (run.engine.state.qualities.S.politics.episodes || []).find(e => e.id === 'public_military_pressure');
      episodes.push(ep ? ep.t : null);
    }
    const attempts = rs.filter(r => r.attempt_t !== null).map(r => r.attempt_t);
    const outcomes = {};
    for (const r of rs) outcomes[r.outcome || 'none'] = (outcomes[r.outcome || 'none'] || 0) + 1;
    out[id] = { attempts: attempts.length, runs: rs.length, attempt_median: ym(median(attempts)),
      attempt_range: attempts.length ? [ym(Math.min(...attempts)), ym(Math.max(...attempts))] : null, outcomes,
      pressure_65_first_median: ym(median(first65)), public_episode_median: ym(median(episodes)),
      public_episodes: episodes.filter(x => x !== null).length, pils_agreements: rs.filter(r => r.pils_agreement).length,
      stuck: rs.filter(r => r.stuck).length };
  }
  return out;
}

// Point 8 of the report: the Sejm vote on the limited autonomy law (programme {autonomy: +1}) in the Sejm of 1922 of a
// passive PPS (N-A, seed 8001, December 1922), with the present and with the proposed autonomy ideals (in memory).
function autonomyVote() {
  const strategies = require(path.join(root, 'tests', 'helpers', 'strategies.js'));
  const run = quiet(() => strategies.runCampaign('N_A', 8001, { stopWhen: Q => Q.time >= 13 }));
  const S = run.engine.state.qualities.S, G = globalThis.PolishGovernment;
  const offer = { by: 'npc', kind: 'bill', programme: { autonomy: 1 }, flags: [], members: [], supporters: [], lead_party: null, minority_terms: [], portfolios: {} };
  const count = () => {
    const clubs = {}; let yes = 0, no = 0, abstain = 0;
    for (const club of S.parliament.clubs) {
      let v;
      if (club.id === 'pps') v = 'as decided';
      else if (club.id === 'kpp' || !G.ACTOR_PROFILES[club.id]) v = 'abstain';
      else if (G.redLineViolations(club.id, offer).length) v = 'no';
      else { const s = G.programmeStance(S, club.id, offer); v = s >= 60 ? 'yes' : s < 40 ? 'no' : 'abstain'; }
      clubs[club.id] = { vote: v, seats: club.seats };
      if (v === 'yes') yes += club.seats; else if (v === 'no') no += club.seats; else if (v === 'abstain') abstain += club.seats;
    }
    return { yes, no, abstain, pps_seats: S.parliament.clubs.find(c => c.id === 'pps').seats, clubs };
  };
  const present = count();
  const proposed = { psl_piast: -1, pschd: -1, psl_wyzwolenie: 1 };
  const saved = {};
  for (const [id, v] of Object.entries(proposed)) { saved[id] = G.ACTOR_PROFILES[id].ideals.autonomy; G.ACTOR_PROFILES[id].ideals.autonomy = v; }
  const after = count();
  for (const [id, v] of Object.entries(saved)) { if (v === undefined) delete G.ACTOR_PROFILES[id].ideals.autonomy; else G.ACTOR_PROFILES[id].ideals.autonomy = v; }
  return { at: '1922-12', relations: S.actors.relations, proposed_ideals: proposed, present, proposed: after };
}

// Point 6 of the report: how often the KPP has the 5% among the workers that joint strike action needs (9.6), and how
// often the scripted strategies cooperate with it, in the 13 × 12 campaigns of the present game.
function kppPresence() {
  const strategies = require(path.join(root, 'tests', 'helpers', 'strategies.js'));
  let runsWith = 0, monthsWith = 0, months = 0, maxShare = 0, strikes = 0, cooperation = 0;
  for (const id of Object.keys(strategies.STRATEGIES)) {
    for (const seed of SEEDS) {
      let present = false;
      const run = quiet(() => strategies.runCampaign(id, seed, { onMonth: engine => {
        const share = globalThis.PolishElectorate.aggregate(engine.state.qualities.S, c => c.class_id === 'workers', 'kpp');
        months++;
        if (share >= 5) { monthsWith++; present = true; }
        maxShare = Math.max(maxShare, share);
      } }));
      if (present) runsWith++;
      for (const rec of Object.values(run.engine.state.qualities.S.strikes.records || {})) {
        strikes++;
        if (rec.communist_cooperation && rec.communist_cooperation.mode !== 'none') cooperation++;
      }
    }
  }
  return { runs: Object.keys(strategies.STRATEGIES).length * SEEDS.length, runs_with_kpp_present: runsWith, months, months_with_kpp_present: monthsWith,
    max_share_among_workers: Math.round(maxShare * 100) / 100, strike_records: strikes, strikes_with_kpp_cooperation: cooperation };
}

const mode = process.argv[2];
if (mode === '--variant') {
  process.stdout.write(JSON.stringify(runVariant(VARIANTS.find(v => v.id === process.argv[3]))));
} else if (mode === '--autonomy') {
  process.stdout.write(JSON.stringify(autonomyVote()));
} else if (mode === '--kpp') {
  process.stdout.write(JSON.stringify(kppPresence()));
} else {
  const child = args => JSON.parse(execFileSync(process.execPath, [__filename].concat(args), { maxBuffer: 64 * 1024 * 1024 }).toString());
  const results = { scope: 'Stage 8, part 8f: measured effects of the researched values; the game is not changed.', seeds: SEEDS, variants: {} };
  for (const v of VARIANTS) results.variants[v.id] = { label: v.label, strategies: child(['--variant', v.id]) };
  results.autonomy_vote = child(['--autonomy']);
  results.kpp_presence = child(['--kpp']);
  fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(results, null, 1) + '\n');
  for (const v of VARIANTS) {
    console.log('== ' + v.label);
    for (const [id, r] of Object.entries(results.variants[v.id].strategies)) {
      console.log('  ' + id.padEnd(26) + (r.attempts + '/' + r.runs).padEnd(6) + String(r.attempt_median).padEnd(9) + 'pressure 65: ' +
        String(r.pressure_65_first_median).padEnd(9) + 'episode: ' + String(r.public_episode_median).padEnd(9) + 'agreements ' + r.pils_agreements +
        ' stuck ' + r.stuck + ' ' + JSON.stringify(r.outcomes));
    }
  }
  const a = results.autonomy_vote;
  console.log('== autonomy law, XII 1922: present yes/no/abstain ' + [a.present.yes, a.present.no, a.present.abstain].join('/') +
    '; proposed ' + [a.proposed.yes, a.proposed.no, a.proposed.abstain].join('/') + ' (PPS ' + a.present.pps_seats + ' as decided)');
  console.log('== KPP presence: ' + JSON.stringify(results.kpp_presence));
}
