// Polish chapter politics and society: the grievance and radicalisation of the electorate cells, the journal of
// institutions and the authority of the Sejm read from it, democracy, political violence, cases of unlawful acts
// and restrictions, the pressure towards a coup with its impulses, and the dated inputs of the Normal scenario
// that feed it (docs/POLISH_IMPLEMENTATION_PLAN.md, stage 7; technical reference 10.7, 15.1–15.3, 17.16.9–11).
//
// Plain JavaScript without dependencies, like polish_rules.js. `npm run build` copies it to out/html/; the page
// loads it after polish_unions.js as `window.PolishPolitics`, and Node tests load it with require(). Numbers
// marked P in the reference are taken as written; the ways the recorded effects of stages 4–6 reach the cells
// are P mappings stated here. They are a working balance, not historical statistics.
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./polish_rules.js'), require('./polish_economy.js'), require('./polish_government.js'),
      require('./polish_electorate.js'), require('./polish_party.js'), require('./polish_unions.js'));
  } else {
    root.PolishPolitics = factory(root.PolishRules, root.PolishEconomy, root.PolishGovernment, root.PolishElectorate, root.PolishParty,
      root.PolishUnions);
  }
}(typeof self !== 'undefined' ? self : this, function (rules, economy, government, electorate, party, unions) {
  'use strict';

  if (!rules || !economy || !government || !electorate || !party || !unions) {
    throw new Error('PolishPolitics needs polish_rules.js, polish_economy.js, polish_government.js, polish_electorate.js, polish_party.js and polish_unions.js first');
  }

  const clip = (value, low, high) => Math.max(low, Math.min(high, value));
  const pos = value => Math.max(0, value);
  const round = (value, digits) => Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
  const fmt = value => (Math.abs(value) < 0.005 ? '0' : value.toFixed(2).replace(/\.?0+$/, ''));
  const T = rules.timeOf;
  const OK = Object.freeze({available: true, reason: ''});
  const no = reason => ({available: false, reason: reason});

  // ---- Profiles (P) ---------------------------------------------------------------------------------------

  // 2.3 and 2.4: democracy 60, authority 55, violence 10; the cells start at grievance 35. Stage 8 (P, the calibration
  // of 8d): the coup pressure starts at 0, because in I 1922 Piłsudski is still the Naczelnik Państwa.
  const START = Object.freeze({democracy: 60, authority: 55, violence: 10, pressure: 0, grievance: 35});
  // 15.2: a serious episode of violence +10, a local one +4, a month without new violence −2.
  const VIOLENCE = Object.freeze({serious: 10, local: 4, calm: -2});
  // The dated inputs of the Normal scenario (normal_chapter1_v1) that feed the pressure; stage 8 (part 8f) dates them
  // from the sources recorded in HISTORICAL_SOURCES.md:
  // - the dispute of the Naczelnik with the cabinet of Ponikowski, VI 1922 (the cabinet resigned on 2 VI, accepted 6 VI);
  // - the military case opens in VII 1923: on 2 VII 1923 Piłsudski resigned his last military function after the bill
  //   of Szeptycki on the supreme military authorities (17.16.9);
  // - the one public episode of military pressure comes in the first real cabinet crisis from XI 1925 while the case is
  //   open: the officers in Sulejówek on 15 XI 1925, after the resignation of Grabski (17.16.9);
  // - the public commemoration of the assassin comes from II 1923: his funeral at Powązki on 6 II 1923 (17.7);
  // - the currency crisis of autumn 1925 ends the cabinet of Grabski: from XI 1925, if he still governs during a credit
  //   or currency crisis, he resigns (13 XI 1925; stage 8, decision A1; 17.16.8).
  // What follows each input depends on the game. Stage 8 (17.16.3, P): from V 1923 Piast and the right present a
  // competing compromise, evaluated once while Witos has his window (V–XII 1923).
  const SCENARIO_INPUTS = Object.freeze({profile_id: 'normal_chapter1_v1', dispute_1922: T(1922, 6), military_case: T(1923, 7),
    military_escalation: T(1925, 11), niewiadomski_cult: T(1923, 2), chjeno_piast_1923: T(1923, 5), chjeno_piast_1923_end: T(1923, 12),
    piast_split_1923: T(1923, 12), grabski_resignation_1925: T(1925, 11)});
  // 17.16.8 (P, stage 8; the M02 runs): the synthetic departure of ten test MPs of Piast from a cabinet with the right.
  const PIAST_SPLIT_SEATS = 10;
  const MILITARY_CASE_SUBJECT = 'the organisation of the supreme military authorities';
  // 10.7 (P): the recorded speeches of Piłsudski that open the card B2; synthetic, without quotations. The topic of 1922
  // follows the sources (stage 8, 8f): after the resignation of Ponikowski the dispute was over who appoints the cabinet.
  const SPEECHES = Object.freeze([
    {id: 'speech_1922_dispute', dispute: 'dispute_1922', topic: 'the right to appoint the cabinet', institution: 'the Sejm'},
    {id: 'speech_military_case', dispute: 'military_case', topic: 'the Sejm and the organisation of the army’s command', institution: 'the Sejm'},
  ]);
  // 15.3: impulses applied once per ID of their effect.
  const IMPULSES = Object.freeze({personal_conflict: 8, chjeno_return: 20});
  // P (15.1): the branches of the unions in the cells — the employed workers carry industry and the railways, the
  // peasant cells the agricultural labour — each with the wage scope of 14.4 as its share.
  const BRANCH_CELLS = Object.freeze({
    industry: {filter: cell => cell.class_id === 'workers' && cell.employment === 'employed', share: 0.6},
    rail: {filter: cell => cell.class_id === 'workers' && cell.employment === 'employed', share: 0.2},
    farm_labour: {filter: cell => cell.class_id === 'rural', share: 0.2},
  });
  // P (15.1): labels of recorded effects that the stage-5 key of beneficiaries does not know.
  const EXTRA_LABELS = Object.freeze({
    'the middle class covered': cell => cell.class_id === 'old_middle' || cell.class_id === 'new_middle',
    'the public employees named': cell => cell.class_id === 'new_middle',
    'recipients of the tranche, once': cell => cell.class_id === 'rural',
    'recipients, × execution': cell => cell.class_id === 'workers' && cell.employment === 'employed',
  });
  // P (17.12): one level of the protection for the unemployed covers a third of them; three levels cover all.
  const PROTECTION_LEVELS = 3;
  const RELIEF_CAP = 6; // 13.2: the current relief in one cell
  const UNEMPLOYED_CONDITIONS = 65; // 15.1: the unemployed cells read 65, changed only by addressed help

  // ---- The state of stage 7 --------------------------------------------------------------------------

  function ready(Q) {
    return !!(Q && Q.S && Q.polish_politics_rules && !Q.polish_save_incompatible && Q.S.politics && Q.S.coup &&
      Array.isArray(Q.S.politics.institutional_log));
  }

  // A new game: the journal and the cases start empty; the cells already start at grievance 35 (2.3).
  function attachPoliticsState(Q) {
    const S = Q.S;
    if (!S.politics.started) {
      S.politics.started = true;
      S.politics.national_grievance = nationalGrievance(S);
    }
    return S.politics;
  }

  function nationalGrievance(S) {
    if (!electorate.hasCells(S)) return 0;
    return S.society.cells.reduce((n, cell) => n + cell.mass * (cell.grievance || 0), 0) /
      Math.max(1e-12, S.society.cells.reduce((n, cell) => n + cell.mass, 0));
  }

  // The mass-weighted grievance of a set of cells (the workers for the strike route of 17.5, for instance).
  function grievanceOf(S, filter) {
    if (!electorate.hasCells(S)) return 0;
    const cells = S.society.cells.filter(filter);
    const mass = cells.reduce((n, cell) => n + cell.mass, 0);
    return mass > 0 ? cells.reduce((n, cell) => n + cell.mass * (cell.grievance || 0), 0) / mass : 0;
  }

  // ---- The journal of institutions and the authority of the Sejm (15.2, M10) ------------------------------

  function addLogEntry(S, kind, sourceId, t) {
    const P = S.politics, id = kind + ':' + sourceId;
    if (P.institutional_log.some(e => e.id === id)) return false;
    if (rules.AUTHORITY_WEIGHTS[kind] === undefined) throw new Error('addLogEntry: unknown kind ' + kind);
    P.institutional_log.push({id: id, t: t, kind: kind, source_id: sourceId});
    return true;
  }

  // P (15.2): important laws are the laws of projects, packages, the unemployment bill, public control and the
  // constitution; a fiscal instrument alone is not one.
  const IMPORTANT_LAW_KINDS = Object.freeze(['project', 'package', 'unemployment_bill', 'public_control']);

  // The journal is filled from the records that already exist, once per ID: enacted important laws, resolved
  // cabinet crises, failed formations, months without an operating cabinet and broken commitments of agreements.
  function scanJournal(Q, t) {
    const S = Q.S;
    for (const law of S.parliament.laws || []) {
      if (law.status !== 'enacted') continue;
      if (IMPORTANT_LAW_KINDS.indexOf(law.kind) < 0 && law.rule !== 'constitutional') continue;
      addLogEntry(S, 'law', law.id, law.closed_at === null || law.closed_at === undefined ? t : law.closed_at);
    }
    for (const reason of S.history.reasons) {
      if (reason.kind === 'cabinet_crisis_resolved') addLogEntry(S, 'resolution', reason.crisis_id, reason.t);
    }
    for (const neg of S.history.negotiations || []) {
      if (neg.kind === 'cabinet' && neg.result && neg.result.appointed === null && neg.result.pps_mode !== undefined) {
        addLogEntry(S, 'failure', neg.id, neg.result.t);
      }
    }
    for (const id of Object.keys(S.agreements).sort()) {
      for (const o of S.agreements[id].obligations || []) {
        if (o.status === 'breached' && o.breached_at !== undefined && o.breached_at !== null) addLogEntry(S, 'breach', o.id, o.breached_at);
      }
    }
    if (!S.cabinet || S.cabinet.status !== 'active') addLogEntry(S, 'gap', 't' + t, t);
  }

  function authority(S, t) {
    return rules.authorityFromLog(S.politics.institutional_log, t);
  }

  // ---- Cases, restrictions, violence and explicit effects (15.2, 13.2, 17.12.3) ---------------------------

  // A case of an unlawful act or of violence. An institutional case (violence against institutions or against the
  // constitution) is an active institutional emergency (8.8, 10.6) while open and costs democracy 2 once, in the
  // month of its opening (15.2). `suspected` names the party an investigation may confirm; it is null when the
  // profile names none.
  function openCase(Q, spec) {
    const P = Q.S.politics;
    if (P.cases[spec.id]) return P.cases[spec.id];
    P.cases[spec.id] = {id: spec.id, kind: spec.kind, subject: spec.subject || '', opened_at: Q.time, institutional: !!spec.institutional,
      suspected: spec.suspected || null, assigned_party: null, status: 'open', closed_at: null, counted_at: null, investigation: null,
      source_id: spec.source_id || null, restriction_ids: []};
    Q.S.history.reasons.push({t: Q.time, kind: 'politics_case', case_id: spec.id, case_kind: spec.kind});
    return P.cases[spec.id];
  }

  function closeCase(Q, id, how) {
    const c = Q.S.politics.cases[id];
    if (!c || c.status !== 'open') return false;
    c.status = 'closed';
    c.closed_at = Q.time;
    c.closed_by = how || null;
    return true;
  }

  function activeInstitutionalEmergency(S) {
    return !!(S.politics && Object.keys(S.politics.cases).some(id => S.politics.cases[id].institutional && S.politics.cases[id].status === 'open'));
  }

  // A restriction is one act of an authority with its legal profile (13.2, 17.12.3): `lawful` says what a proper
  // review would confirm (P). Lifting an unlawful one through a legal procedure gives democracy +1 once (15.2).
  function addRestriction(Q, spec) {
    const P = Q.S.politics;
    if (P.restrictions[spec.id]) return P.restrictions[spec.id];
    P.restrictions[spec.id] = {id: spec.id, kind: spec.kind, target: spec.target, lawful: !!spec.lawful, imposed_by: spec.imposed_by || 'authorities',
      imposed_at: Q.time, case_id: spec.case_id || null, status: 'active', lifted_at: null, lifted_by: null, counted: false,
      exposure: spec.exposure || null};
    if (spec.case_id && P.cases[spec.case_id]) P.cases[spec.case_id].restriction_ids.push(spec.id);
    Q.S.history.reasons.push({t: Q.time, kind: 'restriction', restriction_id: spec.id, restriction_kind: spec.kind});
    return P.restrictions[spec.id];
  }

  function liftRestriction(Q, id, procedure) {
    const r = Q.S.politics.restrictions[id];
    if (!r || r.status !== 'active') return false;
    r.status = 'lifted';
    r.lifted_at = Q.time;
    r.lifted_by = procedure || null;
    if (r.kind === 'press_confiscation' && r.source_id) party.liftPressRestriction(Q, r.source_id);
    if (r.kind === 'militia_ban') Q.S.militia.banned = false;
    return true;
  }

  // Explicit one-off effects on democracy (advisers, reforms, B4/B5), once per ID; applied at the next settlement.
  function democracyEffect(Q, id, value, cause) {
    const P = Q.S.politics;
    if (P.democracy_effects.some(e => e.id === id)) return false;
    P.democracy_effects.push({id: id, value: value, cause: cause || '', recorded_at: Q.time, applied_at: null});
    return true;
  }

  // A new episode of violence, once per ID: serious +10, local +4 at the next settlement (15.2).
  function violenceEpisode(Q, id, serious, cause) {
    const P = Q.S.politics;
    if (P.violence_episodes.some(e => e.id === id)) return false;
    P.violence_episodes.push({id: id, value: serious ? VIOLENCE.serious : VIOLENCE.local, cause: cause || '', recorded_at: Q.time, applied_at: null});
    return true;
  }

  // Restrictions from acts the game already models (decision 3A of stage 7): the named repressive measure in a
  // strike (unlawful against a lawful economic strike, P) and the confiscations of the press (unlawful, P).
  function scanRestrictions(Q) {
    const S = Q.S;
    for (const rec of unions.records(S)) {
      if (!rec.repression) continue;
      const id = 'strike_repression:' + rec.id;
      if (!S.politics.restrictions[id]) {
        const r = addRestriction(Q, {id: id, kind: 'strike_repression', target: 'the strikers of ' + rec.branches.join(' and '), lawful: false,
          imposed_by: 'interior', exposure: {branches: rec.branches.slice()}});
        r.imposed_at = rec.repression.since;
        r.strike_id = rec.id;
      }
    }
    for (const press of S.party_orgs && S.party_orgs.press ? S.party_orgs.press.restrictions : []) {
      const id = 'press:' + press.id;
      if (!S.politics.restrictions[id]) {
        const r = addRestriction(Q, {id: id, kind: 'press_confiscation', target: 'the press of PPS', lawful: !!press.lawful, imposed_by: 'authorities'});
        r.source_id = press.id;
      }
      const r = S.politics.restrictions[id];
      if (press.status !== 'active' && r.status === 'active') { r.status = press.status === 'lifted' ? 'lifted' : 'expired'; r.lifted_at = Q.time; }
    }
  }

  // A clash in a strike is a local episode of violence; when the communist partner broke the agreed rules it is a
  // case of communist violence the Interior may investigate (8.12). Not violence against institutions. A clash in
  // which Milicja PPS protected the strikers is also executed violence of a PPS organisation (decision 3A).
  function scanClashes(Q) {
    const S = Q.S;
    for (const rec of unions.records(S)) {
      for (const clash of rec.clashes || []) {
        if (!clash.clash) continue;
        const id = 'clash:' + rec.id + ':' + clash.round;
        const coop = rec.communist_cooperation;
        const suspected = coop && coop.mode !== 'none' && coop.complied === false ? 'kpp' : null;
        if (!S.politics.cases[id]) {
          const c = openCase(Q, {id: id, kind: suspected ? 'communist_violence' : 'strike_clash', subject: 'a clash in the strike ' + rec.id,
            suspected: suspected, source_id: rec.id});
          c.opened_at = clash.t;
        }
        if (rec.protection && rec.protection.since <= clash.t) {
          organisationViolence(Q, {id: 'militia:' + id, subject: 'a clash with Milicja PPS in the strike ' + rec.id, source_id: id, t: clash.t});
        }
      }
    }
  }

  // The reaction of the authorities to executed unlawful violence of a PPS organisation (decision 3A of stage 7; B4
  // retaliation of 7c, a clash with the Milicja): a case of PPS violence; a repressive cabinet (the profile of 14.4)
  // also bans the Milicja — a lawful restriction, which a review in Justice does not lift. Other cabinets open the
  // case without a ban. Once per source.
  function organisationViolence(Q, spec) {
    const S = Q.S, P = S.politics;
    if (P.cases[spec.id]) return P.cases[spec.id];
    const c = openCase(Q, {id: spec.id, kind: 'pps_violence', subject: spec.subject, suspected: 'pps', source_id: spec.source_id || null});
    if (spec.t !== undefined) c.opened_at = spec.t;
    c.assigned_party = 'pps';
    if (unions.cabinetProfile(S) === 'repress' && !S.militia.banned) {
      addRestriction(Q, {id: 'militia_ban:' + spec.id, kind: 'militia_ban', target: 'Milicja PPS', lawful: true, imposed_by: 'cabinet', case_id: c.id});
      S.militia.banned = true;
      if (party.partyReady(Q)) party.writeMirrors(Q);
    }
    return c;
  }

  // ---- The cells: grievance and radicalisation (15.1) ------------------------------------------------------

  function filterForLabels(labels) {
    const known = electorate.filterOfList(labels);
    const extra = (labels || []).map(l => EXTRA_LABELS[l]).filter(Boolean);
    if (!known && !extra.length) return null;
    return cell => (known && known(cell)) || extra.some(f => f(cell));
  }

  // One recorded effect to its recipients' cells, once: grievance or radicalisation, times its scale and share.
  function applyToCells(S, filter, field, amount) {
    if (!filter || !amount) return;
    electorate.changeCells(S, filter, {[field]: amount});
  }

  function branchFilter(branches) {
    const list = (branches || []).filter(b => BRANCH_CELLS[b]);
    return list.map(b => ({filter: BRANCH_CELLS[b].filter, share: BRANCH_CELLS[b].share}));
  }

  // The one-off effects recorded by stages 4–7, applied before the monthly equation (15.1): projects and fiscal
  // instruments, strikes and plants, the party's and the explicit democracy effects, episodes of violence.
  // Returns the exposures of this period for the monthly equation.
  function applyRecordedEffects(Q, t) {
    const S = Q.S, P = S.politics;
    const exposure = {repression: [], violence: [], settlement: []};
    for (const id of Object.keys(S.projects).sort()) {
      const project = S.projects[id];
      for (const effect of (project && project.pending_effects) || []) {
        if (effect.stage !== 7 || effect.applied_at !== undefined) continue;
        effect.applied_at = t;
        if (effect.system === 'democracy') {
          P.democracy_effects.push({id: effect.id, value: effect.value, cause: project.id, recorded_at: t, applied_at: null});
          continue;
        }
        if (effect.system !== 'grievance') continue;
        const scopeFactor = project.type === 'worker_protection' ? 1 / PROTECTION_LEVELS : 1;
        const amount = effect.value * (effect.scale === undefined ? 1 : effect.scale) * (effect.share === undefined ? 1 : effect.share) * scopeFactor;
        if (project.type === 'enterprise_representation' && project.policy_choices && project.policy_choices.plant_id) {
          const plant = S.enterprises.records[project.policy_choices.plant_id];
          for (const b of branchFilter(plant ? [plant.branch] : [])) applyToCells(S, b.filter, 'grievance', amount * b.share);
          continue;
        }
        applyToCells(S, filterForLabels(effect.note && EXTRA_LABELS[effect.note] ? [effect.note] : effect.beneficiaries), 'grievance', amount);
      }
    }
    for (const policy of S.economy.policies || []) {
      for (const effect of policy.pending_effects || []) {
        if (effect.system !== 'grievance' || effect.applied_at !== undefined) continue;
        effect.applied_at = t;
        applyToCells(S, filterForLabels([effect.recipients]), 'grievance', effect.value);
      }
    }
    for (const effect of S.strikes.pending_effects || []) {
      if (effect.applied_at !== undefined) continue;
      effect.applied_at = t;
      const targets = branchFilter(effect.branches);
      if (effect.system === 'grievance') {
        for (const b of targets) applyToCells(S, b.filter, 'grievance', effect.value * b.share);
        if (effect.cause === 'settlement_executed') exposure.settlement.push(...targets);
      } else if (effect.system === 'repression_exposure') {
        const cut = effect.exposure_cut || 0;
        for (const b of targets) exposure.repression.push({filter: b.filter, amount: effect.value * (1 - cut) * b.share});
      } else if (effect.system === 'violence') {
        // 17.5: after a clash one serious episode of violence (+10 of 15.2), once per clash.
        const m = String(effect.id).match(/^(.*):violence:(\d+)$/);
        const rec = m ? S.strikes.records[m[1]] : null;
        violenceEpisode(Q, m ? 'clash:' + m[1] + ':' + m[2] : effect.id, true, effect.cause);
        for (const b of branchFilter(rec ? rec.branches : [])) exposure.violence.push({filter: b.filter, amount: b.share});
      }
    }
    for (const plant of Object.keys(S.enterprises.records).sort().map(id => S.enterprises.records[id])) {
      for (const effect of plant.pending_effects || []) {
        if (effect.system !== 'grievance' || effect.applied_at !== undefined) continue;
        effect.applied_at = t;
        for (const b of branchFilter([plant.branch])) applyToCells(S, b.filter, 'grievance', effect.value * (effect.share || 1) * b.share);
      }
    }
    for (const effect of S.actors.pps.pending_effects || []) {
      if (effect.system !== 'democracy' || effect.applied_at !== undefined) continue;
      effect.applied_at = t;
      P.democracy_effects.push({id: effect.id, value: effect.value, cause: 'party', recorded_at: t, applied_at: null});
    }
    // The exposure of the cells covered by a clash at a gathering (17.5 for B4 and B5), less the protection of the Milicja.
    for (const e of P.exposures || []) {
      if (e.applied_at !== null) continue;
      e.applied_at = t;
      const filter = electorate.AUDIENCES[e.audience] ? electorate.AUDIENCES[e.audience].filter : null;
      if (filter) exposure.violence.push({filter: filter, amount: e.value * (1 - (e.cut || 0))});
    }
    // New restrictions expose the people they target once, at their imposition.
    for (const id of Object.keys(P.restrictions).sort()) {
      const r = P.restrictions[id];
      if (r.exposure_applied || !r.exposure) continue;
      r.exposure_applied = true;
      for (const b of branchFilter(r.exposure.branches)) exposure.repression.push({filter: b.filter, amount: b.share});
    }
    return exposure;
  }

  // The current relief of executed programmes in one cell (15.1): the protection for the unemployed, the workers'
  // housing and the cooperatives of PPS, each times its execution; at most 6 in a cell (13.2).
  function ongoingRelief(S, cell) {
    let relief = 0;
    for (const id of Object.keys(S.projects)) {
      const p = S.projects[id];
      if (!p || p.status !== 'operating' || !p.authorized) continue;
      const coverage = p.last_coverage === null || p.last_coverage === undefined ? 0 : p.last_coverage;
      if (p.type === 'worker_protection' && cell.employment === 'unemployed') {
        const reliefs = {full: 2, focused: 2, limited: 1}, shares = {full: 1, focused: 0.5, limited: 1};
        relief += (reliefs[p.variant] || 0) * (shares[p.variant] || 0) * coverage * Math.min(PROTECTION_LEVELS, p.scope || 1) / PROTECTION_LEVELS;
      }
      if (p.type === 'public_works' && p.variant === 'housing' && cell.class_id === 'workers') relief += 2 * coverage / PROTECTION_LEVELS;
    }
    relief += party.cooperativeRelief ? party.cooperativeRelief(S, cell) : 0;
    return Math.min(RELIEF_CAP, relief);
  }

  function wageIndex(S, cell) {
    const E = S.economy, society = S.society;
    if (cell.employment === 'unemployed') return UNEMPLOYED_CONDITIONS;
    if (cell.class_id === 'rural') return clip(100 + (45 - society.agrarian_pressure) * 0.4 + (society.rural_improvements || 0), 40, 140);
    if ((cell.class_id === 'workers' || cell.class_id === 'new_middle') && cell.employment === 'employed') return E.real_wage;
    return 100;
  }

  // A promise of protection due and not met in this period: once per period (15.1).
  function missedProtection(S, t) {
    for (const id of Object.keys(S.agreements)) {
      const agreement = S.agreements[id];
      if (agreement.status !== 'active' && agreement.status !== 'breached') continue;
      for (const o of agreement.obligations || []) {
        if (o.required_project === 'worker_protection' && o.due_at !== null && o.due_at !== undefined && o.due_at <= t &&
          o.status !== 'fulfilled' && (o.fulfillment || 0) < 1 && o.status !== 'awaiting_later_stage') return 1;
      }
    }
    return 0;
  }

  function settleCells(Q, t, exposure) {
    const S = Q.S;
    if (!electorate.hasCells(S)) return;
    const readings = S.economy.history;
    const last = readings[readings.length - 1], before = readings[readings.length - 2];
    const rise = last && before ? pos((last.unemployment || 0) - (before.unemployment || 0)) : 0;
    const missed = missedProtection(S, t);
    for (const cell of S.society.cells) {
      const index = wageIndex(S, cell);
      const repression = exposure.repression.filter(e => e.filter(cell)).reduce((n, e) => n + e.amount, 0);
      const violence = exposure.violence.filter(e => e.filter(cell)).reduce((n, e) => n + e.amount, 0);
      const settled = exposure.settlement.filter(e => e.filter(cell)).reduce((n, e) => n + e.share, 0);
      const exposed = cell.employment === 'employed' && ['workers', 'new_middle', 'old_middle'].indexOf(cell.class_id) >= 0 ? rise : 0;
      const g0 = cell.grievance || 0;
      cell.grievance = clip(g0 + 0.20 * pos(100 - index) / 10 + 0.50 * exposed + 2 * (cell.employment === 'unemployed' ? missed : 0) +
        3 * repression - ongoingRelief(S, cell) - 0.30 * pos(index - 100) / 10, 0, 100);
      cell.radicalization = clip((cell.radicalization || 0) + 0.05 * pos(g0 - 60) + 2 * repression + 2 * violence - 2 * settled, 0, 100);
    }
    electorate.writeClassMirrors(Q);
  }

  // ---- The scenario inputs of decision 1A, speeches and impulses (10.7, 15.3, 17.16.9–11) -----------------

  // A dated input of the scenario is on unless a test of another system switched it off (S.scenario.inputs).
  function inputOn(S, key) {
    return !(S.scenario && S.scenario.inputs && S.scenario.inputs[key] === false);
  }

  function militaryCases(S) {
    return Object.keys(S.politics.cases).sort().map(id => S.politics.cases[id]).filter(c => c.kind === 'military');
  }

  function openMilitaryCase(S) {
    return militaryCases(S).filter(c => c.status === 'open')[0] || null;
  }

  function scenarioInputs(Q, t) {
    const S = Q.S, P = S.politics;
    if (inputOn(S, 'military_case') && t >= SCENARIO_INPUTS.military_case && !P.cases.military_case) {
      const c = openCase(Q, {id: 'military_case', kind: 'military', subject: MILITARY_CASE_SUBJECT});
      c.opened_at = SCENARIO_INPUTS.military_case;
      c.profile_id = SCENARIO_INPUTS.profile_id;
      scheduleSpeech(Q, 'speech_military_case', t);
    }
  }

  // The recorded speech waits for its answer in the event queue (card B2); one per ID.
  function scheduleSpeech(Q, id, t) {
    const P = Q.S.politics;
    if (P.speeches.some(s => s.id === id)) return null;
    const profile = SPEECHES.filter(s => s.id === id)[0];
    const speech = {id: id, t: t, topic: profile.topic, institution: profile.institution, dispute: profile.dispute, response: null,
      answered_at: null, profile_id: SCENARIO_INPUTS.profile_id};
    P.speeches.push(speech);
    return speech;
  }

  function applyImpulse(Q, id, value, kind) {
    const C = Q.S.coup;
    if (C.impulses.some(i => i.id === id)) return false;
    C.impulses.push({id: id, t: Q.time, value: value, kind: kind});
    C.pressure = clip(C.pressure + value, 0, 100);
    Q.S.history.reasons.push({t: Q.time, kind: 'coup_impulse', id: id, value: value, pressure: C.pressure});
    return true;
  }

  // A protective agreement with Piłsudski that is being executed (16.7, 16.8.1; the card of stage 7b).
  function protectiveAgreement(S) {
    const pils = S.actors.pilsudski || {};
    const a = pils.agreement_id ? S.agreements[pils.agreement_id] : null;
    return !!(a && a.status === 'active' && a.execution_started_at !== null && a.execution_started_at !== undefined && !a.open_breach);
  }

  const STABILISING_OR_BROAD = Object.freeze(['broad_centre', 'national_unity', 'skrzynski_broad']);

  function stabilisingOrBroad(cabinet) {
    return !!cabinet && (cabinet.pm === 'grabski' || cabinet.pm === 'skrzynski' || STABILISING_OR_BROAD.indexOf(cabinet.configuration_id) >= 0);
  }

  // The impulses at the approval of an event, once per ID of their effect (15.3): the public episode of military
  // pressure (decision 1A of stage 7; from XI 1925 since stage 8, 8f) and the return of Chjeno-Piast (17.16.11).
  function scanImpulses(Q) {
    const S = Q.S, P = S.politics;
    const open = openMilitaryCase(S);
    if (open && Q.time >= SCENARIO_INPUTS.military_escalation && S.cabinet_crisis && !protectiveAgreement(S) &&
      !P.episodes.some(e => e.id === 'public_military_pressure')) {
      P.episodes.push({id: 'public_military_pressure', t: Q.time, crisis_id: S.cabinet_crisis.id, case_id: open.id,
        demand: 'a public demand of Piłsudski on the army, with the support of intervening officers', profile_id: SCENARIO_INPUTS.profile_id});
      applyImpulse(Q, 'public_military_pressure', IMPULSES.personal_conflict, 'personal_conflict');
    }
    const cabinet = S.cabinet;
    if (cabinet && cabinet.configuration_id === 'chjeno_piast' && P.cabinets_seen.indexOf(cabinet.id) < 0) {
      P.cabinets_seen.push(cabinet.id);
      const history = S.history.cabinets;
      const previous = history.filter(c => c.id === cabinet.previous_cabinet_id)[0] || history[history.length - 1] || null;
      const earlier = history.some(c => c.configuration_id === 'chjeno_piast');
      const caseOpen = militaryCases(S).some(c => c.opened_at <= cabinet.formed_at && (c.status === 'open' || c.closed_at > cabinet.formed_at));
      if (earlier && stabilisingOrBroad(previous) && caseOpen) applyImpulse(Q, 'chjeno1926', IMPULSES.chjeno_return, 'chjeno_return');
    }
  }

  // The dispute of 1922 records its speech in the month of the dispute (decision 1A; the card B1 comes with 7c).
  function scanSpeeches(Q) {
    const S = Q.S;
    if (inputOn(S, 'dispute_1922') && Q.time >= SCENARIO_INPUTS.dispute_1922 && Q.time < T(1922, 11) &&
      !S.politics.speeches.some(s => s.id === 'speech_1922_dispute')) {
      scheduleSpeech(Q, 'speech_1922_dispute', Q.time);
    }
  }

  // Called on every visit of post_event, after an event package and before the next ordinary action (4.2):
  // the dispute of 1922, the speeches, the commemoration and the impulses due now, once each.
  function afterEvents(Q) {
    if (!ready(Q) || Q.S.chapter.status === 'ended') return null;
    scanDispute(Q);
    scanSpeeches(Q);
    scanCult(Q);
    scanImpulses(Q);
    return Q.S.coup;
  }

  // ---- 1922 and the presidency (17.6–17.7, 17.13, 17.16.3; card catalogue 9.1, 9.4–9.6) -------------------------

  // B1 (opening.cabinet_1922): the dispute of the Naczelnik with Ponikowski in VI 1922 (decision 1A) is one case of
  // conflict. P (17.16.3): no card of this chapter offers a compromise keeping the cabinet, so the opening cabinet of
  // Ponikowski, if it still governs, resigns; the fall opens the one mandatory formation of 8.8 through the card B1.
  // With another or a kept cabinet the sequence is not replayed.
  const OPENING_CABINET = 'ponikowski_1';

  // 17.16.3 (P, stage 8): the competing compromise of Piast and the right (Chjeno-Piast) is evaluated once for the new
  // situation; it waits only while no cabinet is in office or another motion is open. The record is an episode.
  function scanCompeting(Q) {
    const S = Q.S, P = S.politics;
    if (!inputOn(S, 'chjeno_piast_1923') || Q.time < SCENARIO_INPUTS.chjeno_piast_1923 || Q.time > SCENARIO_INPUTS.chjeno_piast_1923_end) return null;
    const done = P.episodes.filter(e => e.id === 'competing_1923')[0];
    if (done && done.status !== 'no_active_cabinet' && done.status !== 'motion_open') return null;
    const record = Object.assign({id: 'competing_1923', kind: 'competing_offer', profile_id: SCENARIO_INPUTS.profile_id},
      government.competingOffer(Q, 'chjeno_piast', 'witos'));
    if (done) P.episodes[P.episodes.indexOf(done)] = record;
    else P.episodes.push(record);
    return record;
  }

  // 17.16.8 (P, stage 8): once, from XII 1923, ten test MPs of Piast leave a cabinet with the right; a carried-out land
  // guarantee (a land programme in operation after the split) brings their declaration back.
  function scanPiastSplit(Q) {
    const S = Q.S, P = S.politics;
    if (!inputOn(S, 'piast_split_1923') || Q.time < SCENARIO_INPUTS.piast_split_1923) return null;
    const done = P.episodes.filter(e => e.id === 'piast_split_1923')[0];
    if (done) {
      if (done.status === 'split' && done.restored_at === null && Object.keys(S.projects).some(id => S.projects[id].type === 'land_program' &&
        ['operating', 'completed'].indexOf(S.projects[id].status) >= 0 && (S.projects[id].launched_at || 0) >= done.t)) {
        done.restored_at = Q.time;
      }
      return done;
    }
    const record = Object.assign({id: 'piast_split_1923', kind: 'support_withdrawn', profile_id: SCENARIO_INPUTS.profile_id},
      government.piastSplit(Q, PIAST_SPLIT_SEATS));
    P.episodes.push(record);
    return record;
  }

  function scanDispute(Q) {
    const S = Q.S, P = S.politics;
    if (!inputOn(S, 'dispute_1922') || Q.time < SCENARIO_INPUTS.dispute_1922 || Q.time >= T(1922, 11) || P.cases.dispute_1922) return null;
    const c = openCase(Q, {id: 'dispute_1922', kind: 'naczelnik_dispute', subject: 'the dispute of the Naczelnik with the cabinet of Ponikowski'});
    c.profile_id = SCENARIO_INPUTS.profile_id;
    const cabinet = S.cabinet;
    if (cabinet && cabinet.id === OPENING_CABINET && cabinet.status === 'active' && !S.cabinet_crisis) {
      government.cabinetFalls(Q, 'naczelnik_dispute');
      P.episodes.push({id: 'cabinet_1922', kind: 'cabinet_1922', t: Q.time, case_id: c.id, crisis_id: S.cabinet_crisis.id, response: null,
        profile_id: SCENARIO_INPUTS.profile_id});
      P.due.polish_event_cabinet_1922 = 'cabinet_1922';
    }
    closeCase(Q, c.id, cabinet && cabinet.id === OPENING_CABINET ? 'ponikowski_resigned' : 'no_opening_cabinet');
    return c;
  }

  // Stage 8, decision A1 (17.16.8): the currency crisis of autumn 1925 ends the stabilisation cabinet of Grabski. From
  // XI 1925, the first settlement in which his cabinet governs during a credit or currency crisis records his resignation,
  // once per chapter; the mandatory formation of 8.8 follows. With another cabinet, an open crisis or without the economic
  // crisis nothing happens: the input does not replay history. The refusals of 17.16.8 can still end his cabinet earlier.
  function scanGrabskiResignation(Q) {
    const S = Q.S, P = S.politics, cabinet = S.cabinet;
    if (!inputOn(S, 'grabski_resignation_1925') || Q.time < SCENARIO_INPUTS.grabski_resignation_1925) return null;
    if (P.episodes.some(e => e.id === 'grabski_resignation_1925')) return null;
    if (!cabinet || cabinet.pm !== 'grabski' || cabinet.status !== 'active' || S.cabinet_crisis) return null;
    const currency = economy.currencyCrisis(S.economy), credit = economy.creditCrisis(S.economy, Q.time);
    if (!currency && !credit) return null;
    const episode = {id: 'grabski_resignation_1925', kind: 'cabinet_resignation', t: Q.time, cabinet_id: cabinet.id,
      cause: currency ? 'currency_crisis' : 'credit_crisis', profile_id: SCENARIO_INPUTS.profile_id};
    P.episodes.push(episode);
    S.history.reasons.push({t: Q.time, kind: 'scenario_resignation', episode_id: episode.id, cabinet_id: cabinet.id, cause: episode.cause});
    government.cabinetFalls(Q, 'resignation');
    government.writeGovernmentMirrors(Q);
    return episode;
  }

  // The line of the formation card that names the cause of a crisis opened by a dated input (stage 8, A1).
  function crisisNote(Q) {
    const S = Q.S, crisis = S && S.cabinet_crisis;
    if (!crisis || !S.politics) return '';
    const episode = S.politics.episodes.filter(e => e.id === 'grabski_resignation_1925' && e.cabinet_id === crisis.fallen_cabinet_id)[0];
    return episode ? 'Władysław Grabski has resigned: the ' + (episode.cause === 'currency_crisis' ? 'currency' : 'credit') +
      ' crisis of autumn 1925 has broken his stabilisation.' : '';
  }

  const CABINET_1922 = Object.freeze({
    pils_candidate: {candidate: 'sliwinski', name: 'the Naczelnik’s candidate', preset: {configuration_id: 'expert', pps_mode: 'external_support', candidate_id: 'sliwinski'}},
    parliamentary_compromise: {candidate: 'nowak', name: 'a compromise candidate of the Sejm', preset: {configuration_id: 'expert', pps_mode: 'external_support', candidate_id: 'nowak'}},
    opposition: {candidate: null, name: 'opposition', preset: {pps_mode: 'opposition'}},
  });

  function cabinet1922Episode(S) {
    return S.politics.episodes.filter(e => e.id === 'cabinet_1922')[0] || null;
  }

  function cabinet1922Due(Q) {
    if (!ready(Q) || Q.S.chapter.status === 'ended') return false;
    const e = cabinet1922Episode(Q.S);
    return !!e && e.response === null && !!Q.S.cabinet_crisis && Q.S.cabinet_crisis.id === e.crisis_id;
  }

  // P: Śliwiński consents while the Naczelnik is in office and in his window of VI–VII 1922 (8.7); a compromise
  // candidate is available while his own cabinet has not fallen.
  function cabinet1922Status(Q, choice) {
    const S = Q.S, spec = CABINET_1922[choice];
    if (!spec) return no('Unknown answer.');
    if (!cabinet1922Due(Q)) return no('');
    if (choice === 'pils_candidate') {
      const head = Q.polish_presidency && Q.polish_presidency.current;
      if (head && head.holder_id !== 'jozef_pilsudski') return no('The Naczelnik is no longer in office; his candidate does not stand.');
      if (!government.inWindow('sliwinski', Q.time)) return no('Śliwiński stands only in June and July 1922.');
    }
    if (spec.candidate && !government.candidateStatus(Q, spec.candidate, {configuration_id: 'expert', pps_mode: 'external_support'}).available) {
      return no('This candidate is not available.');
    }
    return OK;
  }

  function cabinet1922Choose(Q, choice) {
    const status = cabinet1922Status(Q, choice);
    if (!status.available) throw new Error('cabinet1922Choose: ' + choice + ': ' + status.reason);
    const S = Q.S, e = cabinet1922Episode(S);
    e.response = choice;
    e.answered_at = Q.time;
    if (S.events.active && S.events.active.definition_id === 'opening.cabinet_1922') S.events.active.payload = {response: choice};
    government.beginCrisisFormation(Q, CABINET_1922[choice].preset);
    return e;
  }

  function cabinet1922View(Q) {
    for (const choice of Object.keys(CABINET_1922)) Q['pl_b1_' + choice + '_why'] = cabinet1922Status(Q, choice).reason;
  }

  // B3 (presidency.security_crisis): the recognised threat settles inside the presidential sequence, without a menu.
  // Decision 2B of stage 7: the historical branch — the election of Gabriel Narutowicz ends in his assassination; the
  // protection of the President is not modelled in chapter 1. The death is one institutional case of unconstitutional
  // violence (15.2: −2 democracy once, the emergency of 8.8), labelled far right without a party it names; one
  // serious episode of violence. The vacancy is filled by the Marshal (C9) before the answer of PPS (B4).
  function securityCrisis(Q, spec) {
    const S = Q.S, P = S.politics;
    const id = 'security_crisis:' + spec.holder_id;
    const known = P.episodes.filter(e => e.id === id)[0];
    if (known) return known;
    const caseId = 'assassination:' + spec.holder_id;
    const c = openCase(Q, {id: caseId, kind: 'unconstitutional_violence', institutional: true, subject: 'the assassination of President ' + spec.holder_name,
      suspected: null});
    c.label = 'far_right';
    violenceEpisode(Q, caseId, true, 'assassination');
    const episode = {id: id, kind: 'security_crisis', t: Q.time, date: spec.date, holder_id: spec.holder_id, holder_name: spec.holder_name, outcome: 'death',
      protection: 'not_modelled_in_chapter_1', perpetrator: spec.perpetrator || null, case_id: caseId, profile_id: SCENARIO_INPUTS.profile_id};
    P.episodes.push(episode);
    S.events.serial += 1;
    S.events.resolved[id] = {id: 'ev-' + S.events.serial, definition_id: 'presidency.security_crisis', resolved_at: Q.time};
    P.due.polish_event_assassination_response = id;
    return episode;
  }

  // The lawful successor has taken the oath: the institutions work again and the case stops being an emergency (P).
  function successionCompleted(Q, holderId) {
    return closeCase(Q, 'assassination:' + holderId, 'lawful_succession');
  }

  function deathOf(S, key) {
    return S.politics.episodes.filter(e => e.id === key && e.kind === 'security_crisis' && e.outcome === 'death')[0] || null;
  }

  // P (5.3, 17.6–17.7): a public promise of mobilisation or of a public answer is a campaign of PPS on the defence of
  // democracy in the last twelve months; staying passive afterwards breaks it.
  function publicPromise(S, t) {
    return (S.party_orgs.press.campaigns || []).some(c => c.topic === 'democracy' && c.t <= t && t - c.t < 12);
  }

  // 17.4: the unrest outside the control of the organisations, computed and never added to membership:
  // uncontrolledPressure = nationalWorkerGrievance × workerRadicalization / 100 × (1 − participation / 100).
  function uncontrolledPressure(S, participation) {
    const workers = cell => cell.class_id === 'workers';
    const cells = S.society.cells.filter(workers), mass = cells.reduce((n, c) => n + c.mass, 0);
    const radical = mass > 0 ? cells.reduce((n, c) => n + c.mass * (c.radicalization || 0), 0) / mass : 0;
    return grievanceOf(S, workers) * radical / 100 * (1 - clip(participation || 0, 0, 100) / 100);
  }

  const average = list => (list.length ? list.reduce((n, v) => n + v, 0) / list.length : 0);

  // The discipline of the organisations that call a gathering (10.3) toward the lawful line.
  function unionCompliance(S) {
    return average(Object.keys(S.unions).sort().map(id => party.compliance(S.unions[id].alignment.legal_institutions, party.cohesion(S), S.unions[id].dissent)));
  }
  function militiaCompliance(S) {
    return party.compliance(S.militia.alignment.legal_institutions, party.cohesion(S), S.militia.dissent);
  }

  // The Milicja takes one matter at a time before AS (13.4): it is free when it protects no active strike.
  function militiaFree(S) {
    const m = S.militia;
    if (m.banned || m.repressed || !(m.strength > 0)) return false;
    const busy = unions.records(S, ['active', 'settlement_pending']).filter(r => r.protection).length;
    return busy < (m.stage === 2 ? 3 : 1);
  }

  // The clash test of 17.5 for one phase of a gathering: clashRisk = clip(0.10 + 0.004·uncontrolled + 0.25·repressive
  // + 0.20·authorised − 0.20·compliance, 0, 0.90), one recorded roll. A clash is one serious episode of violence
  // (+10), the exposure of the covered cells less the protection of the Milicja, and a case of responsibility (a case
  // of PPS violence only when PPS authorised it); the Milicja on the spot loses 2% of its people, rounded once.
  function gatheringClash(Q, spec) {
    const S = Q.S, P = S.politics;
    const risk = clip(0.10 + 0.004 * (spec.uncontrolled || 0) + 0.25 * (spec.repressive ? 1 : 0) + 0.20 * (spec.authorised ? 1 : 0) -
      0.20 * (spec.compliance || 0), 0, 0.90);
    const u = rules.roll(S, spec.id + ':clash');
    const out = {id: spec.id, risk: round(risk, 6), u: u, clash: u < risk, militia_lost: 0};
    if (!out.clash) return out;
    violenceEpisode(Q, spec.id, true, spec.cause || 'gathering_clash');
    P.exposures = P.exposures || [];
    P.exposures.push({id: spec.id + ':exposure', audience: spec.audience || 'workers', value: 1, cut: spec.exposure_cut || 0, recorded_at: Q.time,
      applied_at: null});
    if (spec.militia_people) {
      const lost = Math.round(0.02 * spec.militia_people);
      S.militia.strength = Math.max(0, S.militia.strength - lost);
      out.militia_lost = lost;
    }
    if (spec.authorised) out.case_id = organisationViolence(Q, {id: spec.id + ':pps', subject: spec.subject, source_id: spec.id}).id;
    else out.case_id = openCase(Q, {id: spec.id + ':case', kind: 'gathering_clash', subject: spec.subject, suspected: null, source_id: spec.id}).id;
    return out;
  }

  // B4 (presidency.assassination_response; 17.6): one decision of PPS, 0 T, only after a confirmed death and the
  // vacancy filled; three answers.
  const RESPONSES = Object.freeze(['defend', 'restraint', 'retaliation']);

  function responseDue(Q) {
    if (!ready(Q) || Q.S.chapter.status === 'ended') return false;
    const S = Q.S, key = S.politics.due.polish_event_assassination_response;
    const death = key ? deathOf(S, key) : null;
    if (!death) return false;
    const head = Q.polish_presidency && Q.polish_presidency.current;
    const vacancyFilled = !!head && head.holder_id !== death.holder_id;
    return vacancyFilled && !S.politics.episodes.some(e => e.kind === 'assassination_response' && e.crisis_id === key);
  }

  function pressWorks(S) {
    return party.pressEffective(S).reach > 0;
  }
  function unionLineAgreed(S) {
    return Object.keys(S.unions).some(id => S.unions[id].alignment.legal_institutions >= 50);
  }

  function responseStatus(Q, choice, protect) {
    const S = Q.S;
    if (RESPONSES.indexOf(choice) < 0) return no('Unknown answer.');
    if (!responseDue(Q)) return no('');
    if (choice === 'defend') {
      if (!unionLineAgreed(S) && !pressWorks(S)) return no('Needs an agreed line of a union branch or a working press.');
      const cost = 1 + (protect ? 0.5 : 0);
      if (S.party_orgs.cash + 1e-9 < cost) return no('Needs ' + fmt(cost) + ' R.');
      if (protect && !militiaFree(S)) return no('The Milicja is banned, has no members or already protects another matter.');
      return OK;
    }
    if (choice === 'retaliation') {
      if (!militiaFree(S)) return no('Needs able members of the Milicja assigned to it: it is banned, empty or busy elsewhere.');
      if (S.party_orgs.cash + 1e-9 < 0.5) return no('Needs 0.5 R.');
    }
    return OK;
  }

  function responseChoose(Q, choice, options) {
    const protect = !!(options && options.protect);
    const status = responseStatus(Q, choice, protect);
    if (!status.available) throw new Error('responseChoose: ' + choice + ': ' + status.reason);
    const S = Q.S, P = S.politics, t = Q.time, key = P.due.polish_event_assassination_response;
    party.syncMirrors(Q);
    const record = {id: 'assassination_response:' + key, kind: 'assassination_response', crisis_id: key, t: t, choice: choice, organisations: [],
      cost_R: 0, clash: null, democracy_effect: 0, pps_authorizes_confrontation: choice === 'retaliation'};
    const lines = [];
    const threat = activeInstitutionalEmergency(S);
    const repressive = unions.cabinetProfile(S) === 'repress';
    if (choice === 'defend') {
      record.cost_R = 1 + (protect ? 0.5 : 0);
      S.party_orgs.cash = Math.max(0, round(S.party_orgs.cash - record.cost_R, 6));
      const kind = pressWorks(S) ? 'press' : 'unions';
      record.organisations = [kind === 'press' ? 'press' : 'unions'].concat(protect ? ['militia'] : []);
      // P (5.3): the covered cells are the workers our press or unions mobilise.
      lines.push(party.campaignEffect(Q, kind, 'democracy', 'workers').text);
      const participation = average(Object.keys(S.unions).sort().map(id => unions.participation(S, id)));
      const force = protect ? party.militiaForce(S).force : 0;
      if (threat) {
        record.clash = gatheringClash(Q, {id: 'b4:' + key, uncontrolled: uncontrolledPressure(S, participation), repressive: repressive,
          authorised: false, compliance: unionCompliance(S), exposure_cut: protect ? Math.min(0.40, 0.10 * force) : 0,
          militia_people: protect ? S.militia.strength : 0, subject: 'a clash at the gathering in defence of the republic'});
      }
      if (!record.clash || !record.clash.clash) {
        democracyEffect(Q, 'presidency.assassination_response:' + key, 2, 'B4');
        record.democracy_effect = 2;
        lines.push('The gathering passes peacefully: democracy +2 once. It does not authorise a general strike.');
      } else {
        lines.push('The gathering ends in a clash: one serious episode of violence and a case of responsibility; no gain for democracy.');
      }
    } else if (choice === 'restraint') {
      if (publicPromise(S, t)) {
        government.factionReaction(Q, 'lewica', {dissent: 3}, {id: 'b4_restraint:' + key, kind: 'broken_promise', reverse: null});
        lines.push('The Left had been promised a public mobilisation: its dissent +3.');
      }
      lines.push('PPS concentrates on the lawful succession: no free mass campaign.');
    } else {
      record.cost_R = 0.5;
      S.party_orgs.cash = Math.max(0, round(S.party_orgs.cash - 0.5, 6));
      record.organisations = ['militia'];
      government.factionReaction(Q, 'centrum', {dissent: 8}, {id: 'b4_retaliation:' + key, kind: 'retaliation', reverse: null});
      lines.push('Without an internal agreement the Centrum objects: dissent +8.');
      record.clash = gatheringClash(Q, {id: 'b4:' + key, uncontrolled: uncontrolledPressure(S, 0), repressive: repressive, authorised: true,
        compliance: militiaCompliance(S), militia_people: S.militia.strength, audience: 'workers',
        subject: 'a retaliatory confrontation of Milicja PPS after the assassination'});
      lines.push(record.clash.clash ? 'The Milicja clashes with its opponents: executed unlawful violence, a case against the PPS organisations and a reaction of the authorities.' :
        'The authorised confrontation does not take place: the declaration creates no victims and no case.');
    }
    P.episodes.push(record);
    // The decision is also kept in the record of the presidency (stage 2), as before.
    if (Q.polish_presidency && !Q.polish_presidency.pps_decisions.some(d => d.id === 'narutowicz_assassination_response')) {
      Q.polish_presidency.pps_decisions.push({id: 'narutowicz_assassination_response', date: '1922-12-16', decision: choice, numerical_effects: true});
    }
    if (S.events.active && S.events.active.definition_id === 'presidency.assassination_response') {
      S.events.active.payload = {choice: choice, organisations: record.organisations.slice()};
    }
    party.writeMirrors(Q);
    Q.pl_b4_result = lines.join(' ');
    return record;
  }

  function responseView(Q) {
    for (const choice of RESPONSES) Q['pl_b4_' + choice + '_why'] = responseStatus(Q, choice).reason;
    Q.pl_b4_protect_why = responseStatus(Q, 'defend', true).reason;
    Q.pl_b4_result = '';
  }

  // B5 (society.niewiadomski_cult; 17.7): one named public commemoration of the assassin, only in the historical
  // branch of the assassination of Narutowicz by Niewiadomski. Stage 8 (8f): from II 1923, after his execution on 31 I
  // 1923; the named commemoration is his funeral at Powązki on 6 II 1923, with a requiem mass and about 10,000 people
  // (HISTORICAL_SOURCES.md). The answers of PPS and the mass for democracy remain a game event. An ordinary service is
  // no trigger.
  const CULT_ANSWERS = Object.freeze(['condemn', 'democracy_mass', 'stay_out']);
  const CULT_PLACE = 'Warsaw, the Powązki cemetery: the funeral of Eligiusz Niewiadomski on 6 February 1923';
  const HOST_RELATION = 40; // P: the relation with PSChD at which a clergyman or host agrees, and PSChD joins a condemnation

  function scanCult(Q) {
    const S = Q.S, P = S.politics;
    if (!inputOn(S, 'niewiadomski_cult') || Q.time < SCENARIO_INPUTS.niewiadomski_cult) return null;
    if (P.episodes.some(e => e.kind === 'assassin_commemoration')) return null;
    const death = P.episodes.filter(e => e.kind === 'security_crisis' && e.outcome === 'death' && e.holder_id === 'gabriel_narutowicz' &&
      e.perpetrator === 'Eligiusz Niewiadomski')[0];
    if (!death) return null;
    const episode = {id: 'niewiadomski_commemoration', kind: 'assassin_commemoration', t: Q.time, crisis_id: death.id,
      place: CULT_PLACE, profile_id: SCENARIO_INPUTS.profile_id};
    P.episodes.push(episode);
    P.due.polish_event_niewiadomski_cult = episode.id;
    return episode;
  }

  function cultDue(Q) {
    if (!ready(Q) || Q.S.chapter.status === 'ended') return false;
    const P = Q.S.politics, key = P.due.polish_event_niewiadomski_cult;
    return !!key && P.episodes.some(e => e.id === key && e.kind === 'assassin_commemoration') &&
      !P.episodes.some(e => e.kind === 'cult_response' && e.commemoration_id === key);
  }

  function hostConsents(S) {
    return (S.actors.relations.pschd || 0) >= HOST_RELATION;
  }

  function cultStatus(Q, choice) {
    const S = Q.S;
    if (CULT_ANSWERS.indexOf(choice) < 0) return no('Unknown answer.');
    if (!cultDue(Q)) return no('');
    if (choice === 'democracy_mass') {
      if (!hostConsents(S)) return no('No clergyman or host agrees to hold it (relation with the Christian Democrats below ' + HOST_RELATION + ').');
      if (!(S.party_orgs.apparatus.level >= 1)) return no('Needs a working organisation of PPS.');
      if (S.party_orgs.cash + 1e-9 < 1) return no('Needs 1 R.');
    }
    return OK;
  }

  function cultChoose(Q, choice) {
    const status = cultStatus(Q, choice);
    if (!status.available) throw new Error('cultChoose: ' + choice + ': ' + status.reason);
    const S = Q.S, P = S.politics, t = Q.time, key = P.due.polish_event_niewiadomski_cult;
    party.syncMirrors(Q);
    const record = {id: 'cult_response:' + key, kind: 'cult_response', commemoration_id: key, t: t, choice: choice, cost_R: 0, clash: null,
      democracy_effect: 0};
    const lines = [];
    if (choice === 'condemn') {
      if (S.actors.pps.strategy.form_of_power === 'parliamentarism') {
        government.factionReaction(Q, 'centrum', {dissent: -3}, {id: 'b5_condemn:' + key, kind: 'agreed_line', reverse: null});
        lines.push('The line agreed with the Centrum: its dissent −3.');
      }
      if (hostConsents(S)) {
        government.changeRelation(Q, 'pschd', 2, 'b5_joint_condemnation:' + key);
        lines.push('The Christian Democrats join the condemnation of violence: relation +2.');
      }
      lines.push('PPS condemns the cult of the assassin and orders its members not to disturb the service.');
    } else if (choice === 'democracy_mass') {
      record.cost_R = 1;
      S.party_orgs.cash = Math.max(0, round(S.party_orgs.cash - 1, 6));
      lines.push(party.campaignEffect(Q, pressWorks(S) ? 'press' : 'unions', 'democracy', 'workers').text);
      democracyEffect(Q, 'society.niewiadomski_cult:' + key, 2, 'B5');
      record.democracy_effect = 2;
      lines.push('The mass for the defence of democracy is held once: democracy +2. No alliance with the Christian Democrats follows from it.');
    } else {
      if (publicPromise(S, t)) {
        government.factionReaction(Q, 'lewica', {dissent: 3}, {id: 'b5_stay_out:' + key, kind: 'broken_promise', reverse: null});
        lines.push('A public answer had been promised: the Left’s dissent +3.');
      }
      lines.push('PPS does not engage its organisations.');
    }
    // 17.7: uncontrolled behaviour only from the existing unrest (17.4); an instruction of restraint reaches the
    // members of PPS, not everyone present. Without it no clash is drawn.
    const unrest = uncontrolledPressure(S, 0);
    if (unrest > 0) {
      record.clash = gatheringClash(Q, {id: 'b5:' + key, uncontrolled: unrest, repressive: false, authorised: false,
        compliance: choice === 'stay_out' ? 0 : militiaCompliance(S), subject: 'an uncontrolled confrontation at the commemoration of the assassin'});
      if (record.clash.clash) lines.push('People outside the control of PPS clash at the commemoration: one serious episode of violence.');
    }
    P.episodes.push(record);
    if (S.events.active && S.events.active.definition_id === 'society.niewiadomski_cult') S.events.active.payload = {choice: choice};
    party.writeMirrors(Q);
    Q.pl_b5_result = lines.join(' ');
    return record;
  }

  function cultView(Q) {
    for (const choice of CULT_ANSWERS) Q['pl_b5_' + choice + '_why'] = cultStatus(Q, choice).reason;
    Q.pl_b5_result = '';
  }



  // ---- One month (4.2 step 6) ------------------------------------------------------------------------------

  // A new, first fulfilment of a significant civil obligation in this period: −2 at most once a month (15.3).
  function newFulfilledCivil(S, t) {
    const P = S.politics;
    let found = false;
    for (const id of Object.keys(S.agreements).sort()) {
      const agreement = S.agreements[id];
      if (agreement.kind === 'pilsudski') continue;
      for (const o of agreement.obligations || []) {
        if (o.status !== 'fulfilled' || o.fulfilled_at !== t || o.kind === 'constraint' || P.civil_rewarded.indexOf(o.id) >= 0) continue;
        P.civil_rewarded.push(o.id);
        found = true;
      }
    }
    return found ? 1 : 0;
  }

  function settleMonth(Q, settlement) {
    if (!ready(Q) || !settlement) return null;
    const S = Q.S, P = S.politics, C = S.coup, t = settlement.t;
    if (P.settled_t === t) return P;
    P.settled_t = t;
    const clock = {time: Q.time, year: Q.year, month: Q.month};
    Q.time = t; Q.year = rules.yearOf(t); Q.month = rules.monthOf(t);
    try {
      scenarioInputs(Q, t);
      scanDispute(Q);
      scanGrabskiResignation(Q);
      scanCompeting(Q);
      scanPiastSplit(Q);
      scanSpeeches(Q);
      scanCult(Q);
      scanRestrictions(Q);
      scanClashes(Q);
      const exposure = applyRecordedEffects(Q, t);
      settleCells(Q, t, exposure);
      P.national_grievance = nationalGrievance(S);
      scanJournal(Q, t);
      P.parliament_authority = authority(S, t);
      P.authority_at = t;
      scanImpulses(Q);
      // 15.3: the monthly accrual reads democracy from the start of the period, before its update.
      const democracy0 = P.democracy;
      const parts = {no_cabinet: !S.cabinet || S.cabinet.status !== 'active' ? 3 : 0, authority: P.parliament_authority < 40 ? 2 : 0,
        grievance: P.national_grievance >= 60 ? 2 : 0, military_case: openMilitaryCase(S) ? 2 : 0, civil: newFulfilledCivil(S, t) ? -2 : 0,
        democracy: clip(0.01 * (60 - democracy0), -0.5, 0.5)};
      const delta = Object.keys(parts).reduce((n, k) => n + parts[k], 0);
      C.pressure = clip(C.pressure + delta, 0, 100);
      C.history.push({t: t, pressure: C.pressure, delta: delta, parts: parts});
      // 15.2: democracy from the authority, the national grievance and new unlawful acts and legal defences.
      const acts = Object.keys(P.cases).map(id => P.cases[id]).filter(c => c.institutional && c.counted_at === null);
      for (const c of acts) c.counted_at = t;
      const defences = Object.keys(P.restrictions).map(id => P.restrictions[id]).filter(r => r.status === 'lifted' && !r.lawful && !r.counted &&
        ['limited_redress', 'democratic_guarantees', 'minority_rights'].indexOf(r.lifted_by) >= 0);
      for (const r of defences) r.counted = true;
      let explicit = 0;
      for (const e of P.democracy_effects) if (e.applied_at === null) { e.applied_at = t; explicit += e.value; }
      P.democracy = clip(democracy0 + 0.03 * (P.parliament_authority - 53) - 0.02 * pos(P.national_grievance - 50) - 2 * acts.length +
        1 * defences.length + explicit, 0, 100);
      // Violence: new episodes, or −2 in a calm month.
      const fresh = P.violence_episodes.filter(e => e.applied_at === null);
      for (const e of fresh) e.applied_at = t;
      P.violence = clip(P.violence + (fresh.length ? fresh.reduce((n, e) => n + e.value, 0) : VIOLENCE.calm), 0, 100);
      P.history.push({t: t, democracy: round(P.democracy, 4), authority: P.parliament_authority, national_grievance: round(P.national_grievance, 4),
        violence: P.violence, pressure: round(C.pressure, 4)});
      return P;
    } finally {
      Q.time = clock.time; Q.year = clock.year; Q.month = clock.month;
    }
  }

  // ---- The card B2: criticism of parliament (10.7; card catalogue 9.2) ----------------------------------------

  function speechDue(S) {
    return S.politics.speeches.filter(s => s.response === null)[0] || null;
  }

  function criticismDue(Q) {
    if (!ready(Q) || Q.S.chapter.status === 'ended') return false;
    const speech = speechDue(Q.S);
    if (speech) Q.S.politics.due.polish_event_pils_criticism = speech.id;
    else delete Q.S.politics.due.polish_event_pils_criticism;
    return !!speech;
  }

  // Only supporting the criticism under the line of parliamentarism contradicts a lasting line (Z — 0.38).
  function criticismContradicts(S, choice) {
    return choice === 'support' && S.actors.pps.strategy.form_of_power === 'parliamentarism';
  }

  const CRITICISM = Object.freeze({
    support: {relation: 4, reactions: [{faction: 'pilsudczycy', dissent: -3}, {faction: 'centrum', dissent: 5}], log: 'stance_criticism'},
    defend: {relation: -4, reactions: [{faction: 'pilsudczycy', dissent: 5}, {faction: 'centrum', dissent: -3}], log: 'stance_defense'},
    reform: {relation: 0, reactions: [{faction: 'centrum', dissent: -2}], log: null},
  });

  // One answer, 0 T, in the month of the speech (Z — 0.38): the relation with Piłsudski, the factions and one entry
  // of the journal per speech; it writes neither `pils_influence` nor `form_of_power`.
  function criticismChoose(Q, choice) {
    const S = Q.S, speech = speechDue(S), spec = CRITICISM[choice];
    if (!speech) throw new Error('criticismChoose: no speech waits for an answer');
    if (!spec) throw new Error('criticismChoose: unknown answer ' + choice);
    party.syncMirrors(Q);
    speech.response = choice;
    speech.answered_at = Q.time;
    if (spec.relation) government.changeRelation(Q, 'pilsudski', spec.relation, 'criticism:' + speech.id);
    const reactions = spec.reactions.map(r => Object.assign({}, r));
    if (criticismContradicts(S, choice)) reactions.filter(r => r.faction === 'centrum')[0].dissent += 3;
    government.factionReactions(Q, reactions, {id: 'criticism:' + speech.id, kind: 'criticism_answer', reverse: null});
    if (spec.log) addLogEntry(S, spec.log, speech.id, Q.time);
    S.history.actions.push({t: Q.time, action_id: 'politics.pils_parliament_criticism.' + choice, speech_id: speech.id, cost_t: 0});
    party.writeMirrors(Q);
    Q.pl_crit_result = {support: 'PPS supports the criticism of parliamentarism. The relation with Piłsudski improves; the Centre objects.',
      defend: 'PPS defends parliament and the lawful change of governments. The relation with Piłsudski worsens; the Piłsudczycy object.',
      reform: 'PPS says parliament should be reformed to work better. This supports the line of reform; it creates no project and wins no votes.'}[choice];
    return speech;
  }

  function criticismView(Q) {
    const S = Q.S, speech = speechDue(S);
    Q.pl_crit_topic = speech ? speech.topic : '';
    Q.pl_crit_warning = criticismContradicts(S, 'support') ?
      'This contradicts our line of parliamentarism: the Centre objects once more (+3).' : '';
    return speech;
  }

  // ---- Displays -----------------------------------------------------------------------------------------------

  function statusLine(Q) {
    const S = Q.S, P = S.politics;
    return 'Democracy ' + fmt(P.democracy) + ', authority of the Sejm ' + fmt(P.parliament_authority) + ', grievance ' +
      fmt(P.national_grievance) + ', violence ' + fmt(P.violence) + '; pressure towards a coup ' + fmt(S.coup.pressure) +
      (openMilitaryCase(S) ? ' (an open military case)' : '') + '.';
  }

  return Object.freeze({
    START: START,
    SCENARIO_INPUTS: SCENARIO_INPUTS,
    SPEECHES: SPEECHES,
    IMPULSES: IMPULSES,
    BRANCH_CELLS: BRANCH_CELLS,
    PROTECTION_LEVELS: PROTECTION_LEVELS,
    IMPORTANT_LAW_KINDS: IMPORTANT_LAW_KINDS,
    organisationViolence: organisationViolence,
    OPENING_CABINET: OPENING_CABINET,
    CABINET_1922: CABINET_1922,
    RESPONSES: RESPONSES,
    CULT_ANSWERS: CULT_ANSWERS,
    HOST_RELATION: HOST_RELATION,
    scanDispute: scanDispute,
    cabinet1922Due: cabinet1922Due,
    cabinet1922Status: cabinet1922Status,
    cabinet1922Choose: cabinet1922Choose,
    cabinet1922View: cabinet1922View,
    securityCrisis: securityCrisis,
    successionCompleted: successionCompleted,
    publicPromise: publicPromise,
    uncontrolledPressure: uncontrolledPressure,
    gatheringClash: gatheringClash,
    responseDue: responseDue,
    responseStatus: responseStatus,
    responseChoose: responseChoose,
    responseView: responseView,
    scanCult: scanCult,
    cultDue: cultDue,
    cultStatus: cultStatus,
    cultChoose: cultChoose,
    cultView: cultView,
    ready: ready,
    inputOn: inputOn,
    attachPoliticsState: attachPoliticsState,
    nationalGrievance: nationalGrievance,
    grievanceOf: grievanceOf,
    addLogEntry: addLogEntry,
    scanJournal: scanJournal,
    authority: authority,
    openCase: openCase,
    scanGrabskiResignation: scanGrabskiResignation,
    crisisNote: crisisNote,
    closeCase: closeCase,
    activeInstitutionalEmergency: activeInstitutionalEmergency,
    addRestriction: addRestriction,
    liftRestriction: liftRestriction,
    democracyEffect: democracyEffect,
    violenceEpisode: violenceEpisode,
    applyRecordedEffects: applyRecordedEffects,
    ongoingRelief: ongoingRelief,
    wageIndex: wageIndex,
    settleCells: settleCells,
    militaryCases: militaryCases,
    openMilitaryCase: openMilitaryCase,
    scheduleSpeech: scheduleSpeech,
    applyImpulse: applyImpulse,
    protectiveAgreement: protectiveAgreement,
    scanImpulses: scanImpulses,
    afterEvents: afterEvents,
    settleMonth: settleMonth,
    criticismDue: criticismDue,
    criticismContradicts: criticismContradicts,
    criticismChoose: criticismChoose,
    criticismView: criticismView,
    statusLine: statusLine,
  });
}));
