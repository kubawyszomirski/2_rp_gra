// Polish chapter electorate: disjoint cells of voters, their preferences, turnout, PPS reach and trust, the
// poll and the votes, and every transfer of support (docs/POLISH_IMPLEMENTATION_PLAN.md, stage 5; technical
// reference 5.1–5.4, 5.6, 10.4.4, 17.4).
//
// Plain JavaScript without dependencies, like polish_rules.js. `npm run build` copies it to out/html/; the
// page loads it after polish_institutions.js as `window.PolishElectorate`, and Node tests load it with
// require(). The cells replace the seven overlapping class rows as the owner of preferences (decision 1 of
// stage 5); the rows `Q.<class>_<party>` are mirrors for displays and inherited readers.
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./polish_rules.js'));
  } else {
    root.PolishElectorate = factory(root.PolishRules);
  }
}(typeof self !== 'undefined' ? self : this, function (rules) {
  'use strict';

  if (!rules) throw new Error('PolishElectorate needs polish_rules.js first');

  const clip = (value, low, high) => Math.max(low, Math.min(high, value));
  const copy = value => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));

  const CELL_PROFILE_ID = 'cells_synthetic_v1';
  const MAIN_CLASSES = Object.freeze(['workers', 'old_middle', 'new_middle', 'rural', 'bourgeois_landowners']);
  const CLASS_NAMES = Object.freeze({workers: 'the workers', old_middle: 'the petty bourgeoisie', new_middle: 'the intelligentsia',
    rural: 'the peasants', bourgeois_landowners: 'the bourgeoisie and landowners'});
  // Polish version (decision 2A): the names in the two cases the texts need, nominative and genitive ('wśród robotników').
  const CLASS_NAMES_PL = Object.freeze({workers: 'robotnicy', old_middle: 'drobnomieszczaństwo', new_middle: 'inteligencja', rural: 'chłopi',
    bourgeois_landowners: 'burżuazja i ziemiaństwo'});
  const CLASS_NAMES_PL_GENITIVE = Object.freeze({workers: 'robotników', old_middle: 'drobnomieszczaństwa', new_middle: 'inteligencji',
    rural: 'chłopów', bourgeois_landowners: 'burżuazji i ziemiaństwa'});
  // 5.1 (P): the test distribution of identities, independent of class; not a demographic reconstruction.
  const IDENTITIES = Object.freeze({polish: 0.70, jewish: 0.10, other_minorities: 0.20});
  // 5.1 (P): the share of each class in the modelled urban labour force; unemployment divides only this pool.
  const LABOUR_FORCE = Object.freeze({workers: 1, new_middle: 0.5, old_middle: 0.25, rural: 0, bourgeois_landowners: 0});
  // 10.4.4 (P): half of each urban class lives in the large cities; the historical shares are B.
  const URBAN_CLASSES = Object.freeze(['workers', 'old_middle', 'new_middle']);
  const MAJOR_CITY_SHARE = 0.5;
  const START_TURNOUT = 0.70;
  const TURNOUT_CAP = 0.90;
  const START_TRUST = 50;
  const START_BASE_REACH = 20;
  const START_GRIEVANCE = 35; // 2.3 (P): the cells start at grievance 35 (stage 7)
  const SATURATION_MONTHS = 6;

  const hasCells = S => !!(S && S.society && Array.isArray(S.society.cells) && S.society.cells.length > 0);
  const partiesOf = S => S.society.parties;
  const massOf = cells => cells.reduce((n, cell) => n + cell.mass, 0);

  function rowOf(Q, rowId) {
    const raw = Q.parties.map(party => Math.max(0, Number(Q[rowId + '_' + party]) || 0));
    const total = raw.reduce((n, v) => n + v, 0);
    return total > 0 ? raw.map(v => v / total) : Q.parties.map(() => 1 / Q.parties.length);
  }

  const normalize = shares => {
    const total = shares.reduce((n, v) => n + Math.max(0, v), 0);
    return total > 0 ? shares.map(v => Math.max(0, v) / total) : shares.map(() => 0);
  };

  // ---- Building the cells of a new game (5.1–5.2; decision 1A of stage 5) ------------------------------

  // The masses: class × identity × employment × settlement; unemployment divides the urban labour force only.
  function cellFrames(Q, unemploymentRate) {
    const weights = MAIN_CLASSES.map(c => Math.max(0, Number(Q[c]) || 0));
    const total = weights.reduce((n, v) => n + v, 0) || 1;
    const u = clip(unemploymentRate, 0, 1);
    const frames = [];
    MAIN_CLASSES.forEach((classId, index) => {
      const classMass = weights[index] / total;
      const lf = LABOUR_FORCE[classId];
      const employment = [['employed', lf * (1 - u)], ['unemployed', lf * u], ['not_in_modelled_labor_force', 1 - lf]].filter(e => e[1] > 0);
      const settlements = URBAN_CLASSES.indexOf(classId) >= 0 ? [['major_city', MAJOR_CITY_SHARE], ['other', 1 - MAJOR_CITY_SHARE]] : [['other', 1]];
      for (const identity of Object.keys(IDENTITIES)) {
        for (const [status, statusShare] of employment) {
          for (const [settlement, settlementShare] of settlements) {
            frames.push({id: [classId, identity, status, settlement].join(':'), class_id: classId, identity_id: identity, employment: status,
              settlement: settlement, mass: classMass * IDENTITIES[identity] * statusShare * settlementShare});
          }
        }
      }
    });
    return frames;
  }

  // Raking: every cell's shares are scaled by one factor per party, then renormalized, until the national
  // poll equals the target. Returns the largest remaining difference.
  function rake(frames, seeds, target, iterations) {
    let error = Infinity;
    for (let it = 0; it < (iterations || 2000); it++) {
      const poll = target.map((v, i) => frames.reduce((n, f, k) => n + f.mass * seeds[k][i], 0));
      error = Math.max(...poll.map((v, i) => Math.abs(v - target[i])));
      if (error < 1e-13) break;
      const factors = poll.map((v, i) => (v > 0 ? target[i] / v : 1));
      for (let k = 0; k < seeds.length; k++) seeds[k] = normalize(seeds[k].map((v, i) => v * factors[i]));
    }
    return error;
  }

  // The cells take their preferences from the rows of today's model, so that the national poll of the
  // opening is exactly today's (decision 1A): Polish cells the row of their class (the unemployed the row of
  // the unemployed) without the minority bloc; minority cells the row of the minorities, tilted towards
  // their class; then one raking to today's national result. If that target cannot be reached (a test with
  // uniform rows, for instance), the Polish cells keep the bloc; failing that, every cell takes the nation.
  function seedCells(Q) {
    const S = Q.S;
    const u = S && S.economy ? (Number(S.economy.unemployment) || 0) / 100 : 0.03;
    const parties = Q.parties.slice();
    const bloc = parties.indexOf('minorities_bloc');
    const rowIds = Q.classes.slice();
    const rows = {};
    for (const id of rowIds) rows[id] = rowOf(Q, id);
    const weightTotal = rowIds.reduce((n, id) => n + Math.max(0, Number(Q[id]) || 0), 0) || 1;
    const target = parties.map((p, i) => rowIds.reduce((n, id) => n + Math.max(0, Number(Q[id]) || 0) * rows[id][i], 0) / weightTotal);
    const frames = cellFrames(Q, u);
    const minority = rows.national_minorities || target;
    const baseOf = f => (f.employment === 'unemployed' && rows.unemployed ? rows.unemployed : rows[f.class_id]);
    const tilt = (base, i) => Math.sqrt((base[i] + 0.001) / (target[i] + 0.001));
    const attempts = [
      f => (f.identity_id === 'polish' ? normalize(baseOf(f).map((v, i) => (i === bloc ? 0 : v))) : normalize(minority.map((v, i) => v * tilt(baseOf(f), i)))),
      f => (f.identity_id === 'polish' ? baseOf(f).slice() : normalize(minority.map((v, i) => v * tilt(baseOf(f), i)))),
      () => target.slice(),
    ];
    let seeds = null, method = null;
    for (let a = 0; a < attempts.length; a++) {
      const trial = frames.map(attempts[a]);
      if (rake(frames, trial, target) < 1e-9) { seeds = trial; method = ['calibrated', 'calibrated_with_bloc', 'national'][a]; break; }
    }
    const cells = frames.map((f, k) => {
      const propensity = {};
      parties.forEach((party, i) => { propensity[party] = 100 * seeds[k][i]; });
      return Object.assign(f, {propensity: propensity, turnout_base: START_TURNOUT, turnout_bonus: 0, trust_pps: START_TRUST,
        base_reach_pps: START_BASE_REACH, grievance: START_GRIEVANCE, radicalization: 0, relief: 0, campaigns: [], accepted_competitors: null});
    });
    S.society.cells = cells;
    S.society.parties = parties;
    // The rows the cells were built from, kept for the report and for checks of the approved opening.
    S.society.seed_rows = {};
    for (const id of rowIds) S.society.seed_rows[id] = parties.map(party => Number(Q[id + '_' + party]) || 0);
    S.society.cell_profile = CELL_PROFILE_ID;
    S.society.seed_method = method;
    S.society.class_shares = classShares(S);
    return cells;
  }

  function classShares(S) {
    const out = {};
    for (const c of MAIN_CLASSES) out[c] = massOf(S.society.cells.filter(cell => cell.class_id === c));
    return out;
  }

  // ---- Poll, votes and mirrors (5.2) ----------------------------------------------------------------------

  const turnoutOf = cell => Math.min(TURNOUT_CAP, cell.turnout_base + cell.turnout_bonus);

  function poll(S) {
    const out = {};
    for (const party of partiesOf(S)) out[party] = S.society.cells.reduce((n, cell) => n + cell.mass * cell.propensity[party], 0) / 100;
    return out;
  }

  function votes(S) {
    const cells = S.society.cells;
    const voters = cells.reduce((n, cell) => n + cell.mass * turnoutOf(cell), 0);
    const out = {};
    for (const party of partiesOf(S)) {
      out[party] = voters > 0 ? cells.reduce((n, cell) => n + cell.mass * turnoutOf(cell) * cell.propensity[party], 0) / (100 * voters) : 0;
    }
    return out;
  }

  function aggregate(S, filter, party) {
    const cells = S.society.cells.filter(filter);
    const mass = massOf(cells);
    return mass > 0 ? cells.reduce((n, cell) => n + cell.mass * cell.propensity[party], 0) / mass : 0;
  }

  // The share of one party (0–100) in one class, weighted by mass.
  function classShare(S, classId, party) {
    return aggregate(S, cell => cell.class_id === classId, party);
  }

  const ROW_FILTERS = Object.freeze({
    unemployed: cell => cell.employment === 'unemployed',
    national_minorities: cell => cell.identity_id !== 'polish',
  });

  // The seven rows of the inherited model, now written from the cells: each class row covers every cell of
  // the class; "unemployed" the unemployed cells and "national minorities" the minority cells.
  function writeClassMirrors(Q) {
    const S = Q.S;
    if (!hasCells(S)) return;
    const written = {};
    for (const rowId of Q.classes) {
      const filter = ROW_FILTERS[rowId] || (cell => cell.class_id === rowId);
      written[rowId] = {};
      for (const party of Q.parties) {
        Q[rowId + '_' + party] = aggregate(S, filter, party);
        written[rowId][party] = Q[rowId + '_' + party];
      }
    }
    S.society.mirror_rows = written;
    for (const legacy of Object.keys(Q.legacy_party_map || {})) {
      const party = Q.legacy_party_map[legacy];
      for (const rowId of Q.classes) {
        Q[rowId + '_' + legacy] = Q[rowId + '_' + party];
        Q[rowId + '_' + legacy + '_compat_base'] = Q[rowId + '_' + party];
      }
    }
    if (Q.national_minorities_pps !== undefined) {
      Q.catholics_spd = Q.national_minorities_pps;
      Q.catholics_spd_compat_base = Q.catholics_spd;
    }
  }

  // Inherited scenes that are still reachable write class rows, or their German aliases (`workers_spd`).
  // Their changes are taken over by the cells of that row, every cell of it moving by the same pp before
  // renormalization, so a legacy write is neither lost nor counted twice; then the rows are written back.
  function absorbRowEdits(Q) {
    const S = Q.S;
    if (!hasCells(S) || !S.society.mirror_rows) return false;
    const parties = partiesOf(S), base = S.society.mirror_rows;
    let changed = false;
    for (const rowId of Q.classes) {
      if (!base[rowId]) continue;
      const deltas = {};
      const add = (party, d) => { if (Number.isFinite(d) && Math.abs(d) > 1e-9) deltas[party] = (deltas[party] || 0) + d; };
      for (const party of parties) add(party, Number(Q[rowId + '_' + party]) - base[rowId][party]);
      for (const legacy of Object.keys(Q.legacy_party_map || {})) {
        add(Q.legacy_party_map[legacy], Number(Q[rowId + '_' + legacy]) - Number(Q[rowId + '_' + legacy + '_compat_base']));
      }
      if (rowId === 'national_minorities') add('pps', Number(Q.catholics_spd) - Number(Q.catholics_spd_compat_base));
      if (!Object.keys(deltas).length) continue;
      const filter = ROW_FILTERS[rowId] || (cell => cell.class_id === rowId);
      for (const cell of S.society.cells.filter(filter)) {
        const shares = parties.map(p => Math.max(0, cell.propensity[p] + (deltas[p] || 0)));
        const total = shares.reduce((n, v) => n + v, 0);
        if (total > 0) parties.forEach((p, i) => { cell.propensity[p] = 100 * shares[i] / total; });
      }
      S.history.reasons.push({t: Q.time, kind: 'support_legacy_write', row: rowId, deltas: copy(deltas)});
      changed = true;
    }
    writeClassMirrors(Q);
    return changed;
  }

  // The national qualities the displays and the Sejm election read: the votes of 5.2 (with turnout), and
  // `<party>_poll` for the preferences alone. Per-class normalized rows are left to the caller.
  // The votes are rounded to 12 decimals of a share (10⁻¹⁰ pp): far below any real difference, it removes
  // the floating-point noise of the cells so that equal results stay exactly equal in the seat count.
  const exact = value => Math.round(value * 1e12) / 1e12;

  function writeNationalQualities(Q) {
    const S = Q.S;
    const v = votes(S), p = poll(S);
    for (const party of Q.parties) { v[party] = exact(v[party]); p[party] = exact(p[party]); }
    for (const party of Q.parties) {
      Q[party + '_support'] = 100 * v[party];
      Q[party + '_normalized'] = v[party];
      Q[party + '_poll'] = p[party];
    }
    return v;
  }

  // ---- Employment and the structural trend of classes (5.1, 5.6) ----------------------------------------

  // Mass that moves into a cell brings its own values: the receiving cell becomes their mass-weighted mix.
  function mixInto(receiver, giver, amount, parties) {
    if (amount <= 0) return;
    const total = receiver.mass + amount;
    const w = amount / total;
    for (const party of parties) receiver.propensity[party] = (1 - w) * receiver.propensity[party] + w * giver.propensity[party];
    for (const field of ['turnout_base', 'turnout_bonus', 'trust_pps', 'base_reach_pps', 'grievance', 'radicalization']) {
      receiver[field] = (1 - w) * receiver[field] + w * giver[field];
    }
    receiver.mass = total;
    giver.mass = Math.max(0, giver.mass - amount);
  }

  // A change of the unemployment rate moves mass between the employed and the unemployed cells of the same
  // class, identity and settlement; total mass, class and identity stay (5.1). Preferences move with it (5.2),
  // so unemployment itself shifts no votes; it acts through the living-conditions index (5.6).
  function applyEmployment(S, unemploymentPct) {
    if (!hasCells(S)) return;
    const u = clip((Number(unemploymentPct) || 0) / 100, 0, 1);
    const parties = partiesOf(S);
    const groups = {};
    for (const cell of S.society.cells) {
      if (cell.employment === 'not_in_modelled_labor_force') continue;
      const key = [cell.class_id, cell.identity_id, cell.settlement].join(':');
      (groups[key] = groups[key] || {})[cell.employment] = cell;
    }
    for (const key of Object.keys(groups).sort()) {
      const g = groups[key];
      if (!g.employed || !g.unemployed) continue;
      const labour = g.employed.mass + g.unemployed.mass;
      const d = labour * u - g.unemployed.mass;
      if (d > 1e-15) mixInto(g.unemployed, g.employed, Math.min(d, g.employed.mass), parties);
      else if (d < -1e-15) mixInto(g.employed, g.unemployed, Math.min(-d, g.unemployed.mass), parties);
    }
  }

  // The approved structural trend (workers 27 → 30, peasants 53 → 50 by December 1939) changes the masses of
  // the classes; their cells keep their preferences, as the class weights did before.
  function applyClassShares(S, weights) {
    if (!hasCells(S)) return;
    const total = MAIN_CLASSES.reduce((n, c) => n + Math.max(0, Number(weights[c]) || 0), 0);
    if (!(total > 0)) return;
    const current = classShares(S);
    for (const c of MAIN_CLASSES) {
      const wanted = Math.max(0, Number(weights[c]) || 0) / total;
      if (!(current[c] > 0) || Math.abs(wanted - current[c]) < 1e-15) continue;
      const factor = wanted / current[c];
      for (const cell of S.society.cells) if (cell.class_id === c) cell.mass *= factor;
    }
    const sum = massOf(S.society.cells);
    if (sum > 0) for (const cell of S.society.cells) cell.mass /= sum;
    S.society.class_shares = classShares(S);
  }

  // ---- Transfers of support inside a cell ----------------------------------------------------------------

  // PPS gains `amount` pp in one cell; the others lose it in proportion to their shares, or only the named
  // sources (a polemic, a transfer from the KPP). The gain never exceeds the pool it is taken from, so no
  // share becomes negative and the cell still sums to 100 (5.3, 10.4.4). Returns the pp actually moved.
  function gainForPps(cell, amount, parties, sources) {
    if (!(amount > 0)) return 0;
    const from = (sources || parties).filter(p => p !== 'pps' && cell.propensity[p] > 0);
    const pool = from.reduce((n, p) => n + cell.propensity[p], 0);
    const moved = Math.min(amount, pool, 100 - cell.propensity.pps);
    if (!(moved > 0)) return 0;
    for (const p of from) cell.propensity[p] -= moved * cell.propensity[p] / pool;
    cell.propensity.pps += moved;
    for (const p of parties) if (Math.abs(cell.propensity[p]) < 1e-12) cell.propensity[p] = 0;
    return moved;
  }

  // PPS loses `amount` pp in one cell to the named recipients (or all others) in proportion to their shares;
  // a recipient without share gets nothing, and without any recipient there is no transfer (17.4).
  function lossForPps(cell, amount, parties, recipients) {
    const to = (recipients || parties).filter(p => p !== 'pps' && cell.propensity[p] > 0);
    const total = to.reduce((n, p) => n + cell.propensity[p], 0);
    const moved = Math.min(Math.max(0, amount), cell.propensity.pps);
    if (!(moved > 0) || !(total > 0)) return 0;
    cell.propensity.pps -= moved;
    for (const p of to) cell.propensity[p] += moved * cell.propensity[p] / total;
    return moved;
  }

  // One named transfer from party A to party B in one cell (a split to the KPP, a rival's campaign).
  function transfer(cell, from, to, amount) {
    const moved = Math.min(Math.max(0, amount), cell.propensity[from]);
    if (!(moved > 0)) return 0;
    cell.propensity[from] -= moved;
    cell.propensity[to] += moved;
    return moved;
  }

  // ---- The monthly flows of 5.6 and 17.4 on the cells ------------------------------------------------

  // Every cell of a class reads the same index (5.6): the flow of the class moves pp inside each of its cells.
  // `applyFlow` is the rule of 5.6 on one row of shares (from polish_economy.js).
  function settleLivingConditions(S, t, conditions, weights, applyFlow) {
    const society = S.society, parties = partiesOf(S);
    const flows = {}, moved = {};
    for (const c of MAIN_CLASSES) {
      const last = society.living_conditions_last[c];
      const change = conditions[c] - (last === undefined ? conditions[c] : last);
      const cells = society.cells.filter(cell => cell.class_id === c);
      const before = {};
      for (const p of parties) before[p] = aggregate(S, cell => cell.class_id === c, p);
      let applied = 0;
      for (const cell of cells) {
        const shares = parties.map(p => cell.propensity[p]);
        const value = applyFlow(shares, parties, change, weights);
        if (value !== 0) parties.forEach((p, i) => { cell.propensity[p] = shares[i]; });
        applied += cell.mass * value;
      }
      const mass = massOf(cells);
      society.living_conditions_last[c] = conditions[c];
      flows[c] = mass > 0 ? applied / mass : 0;
      moved[c] = {};
      for (const p of parties) {
        const d = aggregate(S, cell => cell.class_id === c, p) - before[p];
        if (Math.abs(d) > 1e-12) moved[c][p] = d;
      }
    }
    return {flows: flows, moved: moved};
  }

  // An adviser's protection of the workers' base (10.4.4): the outflow from PPS to the KPP in the workers'
  // cells is halved; the part kept stays with PPS. The strongest protection applies, never a product.
  function kppProtection(S, cell, t) {
    if (cell.class_id !== 'workers') return 1;
    const active = (S.advisors.effects || []).filter(e => e.kind === 'kpp_outflow_protection' && e.status !== 'expired' &&
      t >= e.starts_at && t < e.expires_at);
    return active.length ? Math.min(...active.map(e => e.value)) : 1;
  }

  // The ongoing outflow of disappointed voters of 17.4 on the cells, after 5.6: min(PPS share, perCell) pp to
  // the accepted competitors of the cell in proportion to their shares. The test profile of the cells has
  // no red lines, so every other party with a share is accepted (P).
  function settleDisappointment(S, t, perCell) {
    const parties = partiesOf(S);
    const outflows = {};
    if (!(perCell > 0)) return outflows;
    for (const c of MAIN_CLASSES) outflows[c] = 0;
    for (const cell of S.society.cells) {
      const accepted = (cell.accepted_competitors || parties).filter(p => p !== 'pps');
      const to = accepted.filter(p => cell.propensity[p] > 0);
      const total = to.reduce((n, p) => n + cell.propensity[p], 0);
      const amount = Math.min(cell.propensity.pps, perCell);
      if (!(amount > 0) || !(total > 0)) continue;
      const protection = kppProtection(S, cell, t);
      let kept = 0;
      const shares = {};
      for (const p of to) shares[p] = amount * cell.propensity[p] / total;
      if (shares.kpp !== undefined && protection < 1) { kept = shares.kpp * (1 - protection); shares.kpp -= kept; }
      cell.propensity.pps -= amount - kept;
      for (const p of to) cell.propensity[p] += shares[p];
      outflows[cell.class_id] += cell.mass * (amount - kept);
    }
    for (const c of MAIN_CLASSES) {
      const mass = massOf(S.society.cells.filter(cell => cell.class_id === c));
      outflows[c] = mass > 0 ? outflows[c] / mass : 0;
    }
    return outflows;
  }

  // ---- Campaigns (5.3) -----------------------------------------------------------------------------------

  const recentCampaigns = (cell, topic, t) => cell.campaigns.filter(c => c.topic === topic && t - c.t < SATURATION_MONTHS && c.t <= t).length;

  // gain_pp = 4 × (0.5 + reach/200) × (trust/100) × (1 − dissent) × (1 − share/100) / (1 + same topic in 6 M).
  function campaignGain(cell, reach, dissent, topic, t) {
    const share = cell.propensity.pps;
    const gain = 4 * (0.5 + clip(reach, 0, 100) / 200) * (clip(cell.trust_pps, 0, 100) / 100) * (1 - clip(dissent, 0, 0.95)) *
      (1 - share / 100) / (1 + recentCampaigns(cell, topic, t));
    return Math.min(gain, 100 - share);
  }

  function recordCampaign(cell, topic, t) {
    cell.campaigns = cell.campaigns.filter(c => t - c.t < SATURATION_MONTHS);
    cell.campaigns.push({topic: topic, t: t});
  }

  // The mobilisation campaign adds 0.04 turnout up to 0.90; the addition ends with the next election (5.3).
  function addTurnout(S, filter, amount) {
    let touched = 0;
    for (const cell of S.society.cells.filter(filter)) {
      const room = TURNOUT_CAP - turnoutOf(cell);
      cell.turnout_bonus += Math.max(0, Math.min(amount, room));
      touched += 1;
    }
    return touched;
  }

  function resetTurnout(S) {
    if (!hasCells(S)) return;
    for (const cell of S.society.cells) cell.turnout_bonus = 0;
  }

  function addBaseReach(S, filter, amount) {
    for (const cell of S.society.cells.filter(filter)) cell.base_reach_pps = clip(cell.base_reach_pps + amount, 0, 100);
  }

  function changeCells(S, filter, change) {
    for (const cell of S.society.cells.filter(filter)) {
      for (const field of Object.keys(change)) {
        const bounds = field === 'trust_pps' || field === 'base_reach_pps' || field === 'grievance' || field === 'radicalization' ? [0, 100] : [-Infinity, Infinity];
        cell[field] = clip((cell[field] || 0) + change[field], bounds[0], bounds[1]);
      }
    }
  }

  // ---- Audiences of the actions: named sets of cells ----------------------------------------------------

  const AUDIENCES = Object.freeze({
    workers: {name: 'workers', filter: cell => cell.class_id === 'workers'},
    employed_workers: {name: 'employed workers', filter: cell => cell.class_id === 'workers' && cell.employment === 'employed'},
    unemployed: {name: 'the unemployed', filter: cell => cell.employment === 'unemployed'},
    old_middle: {name: 'the petty bourgeoisie', filter: cell => cell.class_id === 'old_middle'},
    new_middle: {name: 'the intelligentsia', filter: cell => cell.class_id === 'new_middle'},
    rural: {name: 'the peasants', filter: cell => cell.class_id === 'rural'},
    bourgeois_landowners: {name: 'the bourgeoisie and landowners', filter: cell => cell.class_id === 'bourgeois_landowners'},
    major_cities: {name: 'the large cities', filter: cell => cell.settlement === 'major_city'},
    jewish: {name: 'Jewish voters', filter: cell => cell.identity_id === 'jewish'},
    other_minorities: {name: 'voters of the other minorities', filter: cell => cell.identity_id === 'other_minorities'},
  });
  const AUDIENCE_NAMES_PL = Object.freeze({workers: 'robotnicy', employed_workers: 'zatrudnieni robotnicy', unemployed: 'bezrobotni',
    old_middle: 'drobnomieszczaństwo', new_middle: 'inteligencja', rural: 'chłopi', bourgeois_landowners: 'burżuazja i ziemiaństwo',
    major_cities: 'wielkie miasta', jewish: 'wyborcy żydowscy', other_minorities: 'wyborcy pozostałych mniejszości'});
  const AUDIENCE_NAMES_PL_GENITIVE = Object.freeze({workers: 'robotników', employed_workers: 'zatrudnionych robotników', unemployed: 'bezrobotnych',
    old_middle: 'drobnomieszczaństwa', new_middle: 'inteligencji', rural: 'chłopów', bourgeois_landowners: 'burżuazji i ziemiaństwa',
    major_cities: 'wyborców wielkich miast', jewish: 'wyborców żydowskich', other_minorities: 'wyborców pozostałych mniejszości'});

  // Recipients named by projects and agreements, as cells (P): a class, the unemployed, the minorities.
  function beneficiaryFilter(label) {
    if (MAIN_CLASSES.indexOf(label) >= 0) return cell => cell.class_id === label;
    if (label === 'unemployed' || label === 'poor recipients') return cell => cell.employment === 'unemployed';
    if (label === 'national_minorities' || label === 'minorities' || label === 'excluded cells') return cell => cell.identity_id !== 'polish';
    if (label === 'jewish' || label === 'other_minorities') return cell => cell.identity_id === label;
    if (label === 'intelligentsia covered') return cell => cell.class_id === 'new_middle';
    return null;
  }

  function filterOfList(labels) {
    const filters = (labels || []).map(beneficiaryFilter).filter(Boolean);
    return filters.length ? (cell => filters.some(f => f(cell))) : null;
  }

  // Merging the opening cells of different sizes and the same turnout keeps masses and votes (5.1).
  function mergeCells(cells, parties) {
    const mass = massOf(cells);
    const merged = {mass: mass, propensity: {}, turnout_base: cells[0].turnout_base, turnout_bonus: 0};
    for (const p of parties) merged.propensity[p] = mass > 0 ? cells.reduce((n, cell) => n + cell.mass * cell.propensity[p], 0) / mass : 0;
    return merged;
  }

  function validateCells(S) {
    const problems = [];
    if (!hasCells(S)) return problems;
    const parties = partiesOf(S);
    const mass = massOf(S.society.cells);
    if (Math.abs(mass - 1) > 1e-9) problems.push('S.society.cells: the masses sum to ' + mass);
    for (const cell of S.society.cells) {
      if (['polish', 'jewish', 'other_minorities'].indexOf(cell.identity_id) < 0) problems.push('S.society.cells.' + cell.id + ': unknown identity');
      const sum = parties.reduce((n, p) => n + cell.propensity[p], 0);
      if (Math.abs(sum - 100) > 1e-6) problems.push('S.society.cells.' + cell.id + ': the shares sum to ' + sum);
      if (parties.some(p => !(cell.propensity[p] >= -1e-9))) problems.push('S.society.cells.' + cell.id + ': a negative share');
    }
    return problems;
  }

  // ---- The polls of the Status tab (moved from post_event, Z — 0.56) ---------------------------------------------

  // The class rows normalised for display and the national support of each party: from the cells since stage 5, from the
  // class rows before them. The opening calls it too, so the Polls tab shows the opening support in January 1922, not 0%.
  function recomputeSupport(Q) {
    if (Q.polish_party_rules) {
      absorbRowEdits(Q);
      writeClassMirrors(Q);
    }
    for (const c of Q.classes) {
      let classVotes = 0;
      for (const party of Q.parties) {
        if (Q[c + '_' + party] < 0) Q[c + '_' + party] = 0;
        classVotes += Q[c + '_' + party];
      }
      for (const party of Q.parties) {
        Q[c + '_' + party + '_normalized'] = classVotes > 0 ? 100 * Q[c + '_' + party] / classVotes : 0;
        Q[c + '_' + party + '_display'] = classVotes > 0 ? Math.round(100 * Q[c + '_' + party] / classVotes) : 0;
      }
    }
    for (const legacyParty in Q.legacy_party_map) {
      const polishParty = Q.legacy_party_map[legacyParty];
      for (const group of Q.classes) {
        Q[group + '_' + legacyParty + '_normalized'] = Q[group + '_' + polishParty + '_normalized'];
        Q[group + '_' + legacyParty + '_display'] = Q[group + '_' + polishParty + '_display'];
      }
    }
    // The national result is the votes of the cells (5.2), not a sum of overlapping rows.
    let totalSupport = 0;
    const cellVotes = Q.polish_party_rules ? writeNationalQualities(Q) : null;
    for (const party of Q.parties) {
      if (cellVotes) {
        totalSupport += Q[party + '_support'];
        continue;
      }
      let partySupport = 0;
      for (const c of Q.classes) partySupport += Q[c] * (Q.old_demographics ? Q[c + '_' + party] : Q[c + '_' + party + '_normalized']);
      Q[party + '_support'] = partySupport;
      totalSupport += partySupport;
    }
    for (const party of Q.parties) {
      Q[party + '_normalized'] = Q[party + '_support'] / totalSupport;
      Q[party + '_votes'] = Math.round(Q[party + '_normalized'] * 100);
      Q[party + '_votes_display'] = Math.round(Q[party + '_normalized'] * 100);
    }
    for (const legacyParty in Q.legacy_party_map) {
      const polishParty = Q.legacy_party_map[legacyParty];
      Q[legacyParty + '_support'] = Q[polishParty + '_support'];
      Q[legacyParty + '_normalized'] = Q[polishParty + '_normalized'];
      Q[legacyParty + '_votes'] = Q[polishParty + '_votes'];
      Q[legacyParty + '_votes_display'] = Q[polishParty + '_votes_display'];
    }
  }

  return Object.freeze({
    CELL_PROFILE_ID: CELL_PROFILE_ID,
    MAIN_CLASSES: MAIN_CLASSES,
    CLASS_NAMES: CLASS_NAMES,
    CLASS_NAMES_PL: CLASS_NAMES_PL,
    CLASS_NAMES_PL_GENITIVE: CLASS_NAMES_PL_GENITIVE,
    IDENTITIES: IDENTITIES,
    LABOUR_FORCE: LABOUR_FORCE,
    MAJOR_CITY_SHARE: MAJOR_CITY_SHARE,
    AUDIENCES: AUDIENCES,
    AUDIENCE_NAMES_PL: AUDIENCE_NAMES_PL,
    AUDIENCE_NAMES_PL_GENITIVE: AUDIENCE_NAMES_PL_GENITIVE,
    TURNOUT_CAP: TURNOUT_CAP,
    hasCells: hasCells,
    cellFrames: cellFrames,
    seedCells: seedCells,
    classShares: classShares,
    turnoutOf: turnoutOf,
    poll: poll,
    votes: votes,
    aggregate: aggregate,
    classShare: classShare,
    writeClassMirrors: writeClassMirrors,
    absorbRowEdits: absorbRowEdits,
    writeNationalQualities: writeNationalQualities,
    recomputeSupport: recomputeSupport,
    applyEmployment: applyEmployment,
    applyClassShares: applyClassShares,
    gainForPps: gainForPps,
    lossForPps: lossForPps,
    transfer: transfer,
    settleLivingConditions: settleLivingConditions,
    settleDisappointment: settleDisappointment,
    kppProtection: kppProtection,
    recentCampaigns: recentCampaigns,
    campaignGain: campaignGain,
    recordCampaign: recordCampaign,
    addTurnout: addTurnout,
    resetTurnout: resetTurnout,
    addBaseReach: addBaseReach,
    changeCells: changeCells,
    beneficiaryFilter: beneficiaryFilter,
    filterOfList: filterOfList,
    mergeCells: mergeCells,
    validateCells: validateCells,
  });
}));
