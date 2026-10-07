'use strict';
// Scripted PPS strategies for whole campaigns (implementation plan, stage 8a; technical reference 17.16.7
// and 21.2). A strategy plays through the real scenes of the game: each month it tries the actions of its
// priority list until one uses the month, takes free adviser steps first and answers events and sequences
// with fixed choices. Deck cards are opened directly, without drawing the hand of three cards: access to the
// planned cards is controlled, as in the M02 analyses (17.16.10), and the report states it.
const dendry = require('./dendry.js');

const ym = t => {
  const y = 1922 + Math.floor((t - 1) / 12), m = ((t - 1) % 12) + 1;
  return y + '-' + String(m).padStart(2, '0');
};

function options(engine) {
  return (engine.getCurrentChoices() || []).map((c, i) => ({ id: c.id, i, ok: c.canChoose !== false }));
}

function pick(engine, id) {
  const o = options(engine).find(c => c.id === id && c.ok);
  if (!o) return false;
  engine.choose(o.i);
  return true;
}

// ---- Paths of the month's actions: an entry (a choice of main, or a card scene opened directly) and steps.
// Z — 0.57: the party agenda, the unions and the protection of the unemployed are deck cards, opened directly like the
// others.
const P = {
  organize: branch => ['polish_party_agenda', 'polish_party_agenda.organize', 'polish_party_agenda.branch_' + branch],
  organizeClass: cls => ['polish_party_agenda', 'polish_party_agenda.organize', 'polish_party_agenda.class_' + cls],
  fundraise: () => ['polish_party_agenda', 'polish_party_agenda.fundraise'],
  apparatus: () => ['polish_party_agenda', 'polish_party_agenda.apparatus'],
  assess: () => ['polish_party_agenda', 'polish_party_agenda.assess_forces'],
  cadres: branch => ['polish_party_agenda', 'polish_party_agenda.courses', 'polish_party_agenda.course_union_cadres', 'polish_party_agenda.cadres_' + branch],
  cooperative: () => ['polish_party_agenda', 'polish_party_agenda.launch_cooperative'],
  // Z — 0.57: the second choice (or "only the first") is carried out at once, without a page of confirmation.
  orgs: (a, b) => b ? ['polish_party_organizations', 'polish_party_organizations.p1_' + a, 'polish_party_organizations.p2_' + b]
    : ['polish_party_organizations', 'polish_party_organizations.p1_' + a, 'polish_party_organizations.only_one'],
  militia: step => ['polish_party_militia', 'polish_party_militia.' + step],
  campaign: (topic, audience) => ['polish_party_media', 'polish_party_media.campaign', 'polish_party_media.topic_' + topic, 'polish_party_media.to_' + audience],
  turnout: audience => ['polish_party_media', 'polish_party_media.turnout', 'polish_party_media.to_' + audience],
  // The press distribution is offered only on the card of the organisations (the media card no longer has it).
  distribution: () => P.orgs('press_distribution'),
  talk: party => ['inter_party_relationships', 'inter_party_relationships.' + party],
  union: (branch, step) => ['polish_union_agenda', 'polish_union_agenda.' + branch, 'polish_union_agenda.' + step],
  bill: () => ['polish_unemployment_bill', 'polish_unemployment_bill.start'],
  gov: (card, option) => [card, card + '.' + option],
  agenda: option => ['main:polish_agenda', 'polish_agenda.' + option],
  support: option => ['polish_government_support', 'polish_government_support.' + option],
  // Z — 0.64: a PPS member raises the same demands on the coalition card of the Government deck.
  coalition: option => ['polish_coalition_affairs', 'polish_government_support.' + option],
  constitution: variant => ['polish_constitution_project', 'polish_constitution_project.' + variant],
  armyOversight: variant => ['polish_parliament_army_oversight', 'polish_parliament_army_oversight.' + variant],
  adviser: (who, action) => ['main:' + who, who + '.' + action],
};

// Runs one path from main. Returns false when a step is not available; the card is then closed.
function runPath(engine, path) {
  engine.goToScene('main');
  const [entry, ...steps] = path;
  if (entry.startsWith('main:')) {
    if (!pick(engine, entry.slice(5))) return false;
  } else {
    const scene = engine.game.scenes[entry];
    if (!scene || (scene.viewIf && !engine._runPredicate(scene.viewIf, true))) return false;
    engine.goToScene(entry);
  }
  for (const id of steps) {
    if (!pick(engine, id)) {
      if (!pick(engine, 'easy_discard')) engine.goToScene('main');
      if (engine.state.sceneId !== 'main') engine.goToScene('main');
      return false;
    }
  }
  return true;
}

// ---- The cabinet formation (card 7.1): one offer; a missing option keeps the default of the screen.
function form(engine, params) {
  if (engine.state.sceneId === 'sejm_election.government' && !pick(engine, 'polish_cabinet_formation')) return false;
  if (engine.state.sceneId !== 'polish_cabinet_formation') return false;
  const F = 'polish_cabinet_formation.';
  const at = page => engine.state.sceneId === F + page;
  // Z — 0.71: the wizard. The variant carries the role of PPS (a party cabinet with PPS in it, a cabinet of experts
  // supported from outside, opposition); the prime minister and the portfolios have pages only when there is a choice.
  const draft = () => engine.state.qualities.S.negotiation.draft;
  if (!pick(engine, F + 'variants')) return false;
  // A variant that cannot be chosen keeps the default offer of the screen, as the one-screen formation did; then opposition.
  const preset = draft().pps_mode === 'opposition' ? 'opposition' : draft().configuration_id;
  const variant = params.mode === 'opposition' || !params.configuration ? 'opposition' : params.configuration;
  if (!pick(engine, F + 'var_' + variant) && !pick(engine, F + 'var_' + preset) && !pick(engine, F + 'var_opposition')) return false;
  if (at('premier')) {
    if (!(params.candidate && pick(engine, F + 'cand_' + params.candidate)) && !pick(engine, F + 'cand_' + draft().candidate_id)) {
      const first = options(engine).find(c => c.id.startsWith(F + 'cand_') && c.ok);
      if (!first) return false;
      engine.choose(first.i);
    }
  }
  if (at('portfolio_menu')) {
    // Z — 0.61: the portfolios are bought with influence points; a greyed one is skipped.
    if (params.claim) {
      for (const c of options(engine).filter(c => c.id.startsWith(F + 'drop_'))) pick(engine, c.id);
      for (const key of params.claim) pick(engine, F + 'take_' + key);
    }
    pick(engine, F + 'ports_next');
  }
  if (!at('summary')) return false;
  if (params.minorities === true) pick(engine, F + 'minorities_on');
  if (params.minorities === false) pick(engine, F + 'minorities_off');
  if (params.terms && pick(engine, F + 'terms_menu') && !pick(engine, F + 'terms_' + params.terms)) pick(engine, F + 'back');
  if (!pick(engine, F + 'submit')) {
    // The offer cannot be submitted as set: PPS stays out of the cabinet instead.
    engine.goToScene(F + 'variants');
    if (!pick(engine, F + 'var_opposition') || !pick(engine, F + 'submit')) return false;
  }
  pick(engine, F + 'done');
  return true;
}

// ---- Context of one month for the planners.
function context(engine) {
  const Q = engine.state.qualities, S = Q.S, G = globalThis.PolishGovernment, R = globalThis.PolishRules;
  const T = (y, m) => R.timeOf(y, m);
  const cab = S.cabinet;
  const militaryCase = Object.values(S.politics.cases || {}).find(c => c.kind === 'military' && c.status === 'open') || null;
  const wageCase = Object.values(S.strikes.records || {}).find(r => r.kind === 'wage_case' && ['open', 'negotiating', 'active', 'settlement_pending'].includes(r.status)) || null;
  return {
    engine, Q, S, t: Q.time, T, year: Q.year, month: Q.month,
    stance: G.ppsStance(S),
    holds: p => !!cab && cab.status === 'active' && cab.portfolios[p] === 'pps',
    cash: S.party_orgs.cash,
    reach: b => S.unions[b] ? S.unions[b].reach : 0,
    fund: b => S.unions[b] ? S.unions[b].fund : 0,
    militiaStage: S.militia.stage,
    militaryCase, wageCase,
    pilsAgreement: S.actors.pilsudski ? S.actors.pilsudski.agreement_id : null,
    projects: (type, statuses) => Object.values(S.projects).filter(p => p.type === type && (!statuses || statuses.includes(p.status))),
    before: (y, m) => Q.time < T(y, m),
    after: (y, m) => Q.time >= T(y, m),
    beforeElection: months => S.parliament.next_election && typeof S.parliament.next_election.t === 'number' &&
      S.parliament.next_election.t - Q.time <= months && S.parliament.next_election.t >= Q.time,
  };
}

// Stage 8 (decision A4): a strategy that wants to enter a cabinet first raises its relations by talks (8.1: +4, every
// 3 months per partner), as the C run of M02 did (8.9: one more contact with ZLN): the gates of the centre-left before
// 1924, the partners of the broad cabinet of Skrzyński from 1924. The targets are those of the bots, not of the game.
const TARGETS = { early: { psl_piast: 60, npr: 60, psl_wyzwolenie: 55 }, broad: { zln: 40, pschd: 55, psl_piast: 60, npr: 60 } };
const prepare = (ctx, which) => {
  const R = ctx.S.actors.relations, targets = TARGETS[which];
  const due = Object.keys(targets).filter(p => (R[p] || 0) < targets[p]).sort((a, b) => (R[a] - targets[a]) - (R[b] - targets[b]));
  return due.map(p => P.talk(p));
};
const lowest = (ctx, branches) => branches.slice().sort((a, b) => ctx.reach(a) - ctx.reach(b) || (a < b ? -1 : 1))[0];

// ---- Default answers of events and sequences, by option ID in order of preference.
const PASSIVE_EVENTS = {
  polish_event_cabinet_1922: ['opposition'],
  polish_event_pils_criticism: ['defend', 'reform', 'support'],
  polish_event_assassination_response: ['restraint'],
  polish_event_niewiadomski_cult: ['stay_out'],
  polish_event_strike_1923: ['negotiate'],
  polish_event_strike_response: ['settlement', 'demands', 'order'],
  polish_event_strike_rejection: ['uphold'],
  polish_event_stabilization: ['wait', 'gradual'],
  polish_event_credit_crisis: ['none'],
  polish_event_austerity_1926: ['maintain'],
  polish_event_faction_split: ['accept'],
  // Z — 0.57: the joint list is an event two months before the vote.
  polish_list_agreement: ['alone'],
  polish_speaker_election: ['daszynski'],
  polish_presidential_first: ['decline_daszynski'],
  polish_presidential_second: ['do_not_run_daszynski_second'],
  polish_budget_package: ['refuse', 'later'],
  polish_unemployment_bill: ['decline'],
  polish_government_response: ['maintain', 'motion_refuse', 'later'],
  polish_strike_steps: ['none', 'no_protection', 'done'],
  coup_stance: 'mediate', coup_commit: 'none', coup_f9: 'accept',
};

const ACTIVE_EVENTS = Object.assign({}, PASSIVE_EVENTS, {
  polish_event_cabinet_1922: ['parliamentary_compromise', 'opposition'],
  polish_event_assassination_response: ['defend', 'restraint'],
  polish_event_assassination_response_protection: ['protected', 'unprotected'],
  polish_event_niewiadomski_cult: ['condemn', 'stay_out'],
  polish_event_stabilization: ['protected', 'protections_terms', 'gradual', 'wait'],
  polish_event_credit_crisis: ['protection', 'orders', 'credit', 'none'],
  polish_event_austerity_1926: ['bargain', 'persuade', 'maintain'],
  polish_event_austerity_1926_threat: ['back_down'],
  polish_speaker_election: ['rataj', 'daszynski'],
  polish_budget_package: ['protect', 'support', 'refuse', 'later'],
  polish_unemployment_bill: ['full', 'limited', 'start'],
  polish_strike_steps: ['limited', 'protect', 'done'],
  coup_stance: 'defend_legal', coup_commit: 'both', coup_f9: 'accept',
});

// ---- Formation offers.
// Z — 0.71: an expert of his period as the formation itself judges it (Skrzyński leads only his own broad cabinet).
const inWindowExpert = ctx => {
  const G = globalThis.PolishGovernment;
  return ['ponikowski', 'sliwinski', 'nowak', 'sikorski', 'grabski'].find(id => G.expertPeriodStatus(ctx.Q, id).available) || null;
};

const FORMATION = {
  opposition: () => ({ mode: 'opposition' }),
  // Toleration of an expert in his historical window (8.7); with none in its window PPS stays in opposition and lets the
  // others form, as the M02 scripts do (stage 8, A4).
  tolerate: ctx => inWindowExpert(ctx) ? ({ configuration: 'expert', candidate: inWindowExpert(ctx), mode: 'external_support',
    terms: ctx.after(1923, 12) && ctx.before(1925, 12) ? 'protections' : null }) : { mode: 'opposition' },
  coalition: ctx => ({ configuration: ctx.after(1925, 11) ? 'skrzynski_broad' : 'centre_left', mode: 'member', claim: ['labor'] }),
  lateCoalition: ctx => ctx.after(1925, 11) ? { configuration: 'skrzynski_broad', mode: 'member', claim: ['labor'] } : FORMATION.tolerate(ctx),
};

// ---- Planners: the ordered candidate paths of one month.
const plan = {
  base(ctx) {
    const list = [];
    if (ctx.cash < 1.5) list.push(P.fundraise());
    list.push(P.organize(lowest(ctx, ['industry', 'rail', 'farm_labour'])));
    list.push(P.organize('industry'), P.fundraise());
    return list;
  },
  organised(ctx, extra) {
    const list = [];
    if (ctx.cash < 1.5) list.push(P.fundraise());
    list.push(...(extra || []));
    const month = ctx.t % 6;
    if (month === 0) list.push(P.orgs('union_organize_industry', 'union_organize_rail'));
    if (month === 1) list.push(P.orgs('union_fund_industry', 'union_fund_rail'));
    if (month === 2) list.push(P.distribution());
    if (month === 3) list.push(P.talk(['psl_wyzwolenie', 'psl_piast', 'npr', 'other_minorities_rep', 'jewish_rep'][Math.floor(ctx.t / 6) % 5]));
    if (month === 4) list.push(P.orgs('tur', 'union_organize_farm_labour'));
    list.push(P.organize(lowest(ctx, ['industry', 'rail', 'farm_labour'])));
    return list.concat(plan.base(ctx));
  },
  wage(ctx) {
    if (!ctx.wageCase) return [];
    const branch = (ctx.wageCase.branches || ['industry'])[0];
    return [P.union(branch, 'prepare_limited'), P.union(branch, 'align_end'), P.union(branch, 'mediate')];
  },
  military(ctx) {
    const current = ctx.pilsAgreement ? ctx.S.agreements[ctx.pilsAgreement] : null;
    if (!ctx.militaryCase || (current && current.status === 'active')) return [];
    // The full card with Military Affairs; otherwise the demand that the cabinet carries out (stage 8, 16.7).
    if (ctx.holds('reichswehr')) return [P.gov('polish_gov_pils_agreement', 'military_function')];
    // Persuasion first; after a refused persuasion of this cabinet, the demand with a threat.
    const refused = ctx.S.history.negotiations.some(n => n.postulate_id === 'military_compromise' && n.action === 'persuade' &&
      !n.accepted && ctx.S.cabinet && n.cabinet_id === ctx.S.cabinet.id);
    const card = ctx.stance === 'member' ? P.coalition : P.support;
    return refused ? [card('bargain_military'), card('persuade_military')] : [card('persuade_military'), card('bargain_military')];
  },
  government(ctx) {
    const list = [];
    if (ctx.holds('labor')) {
      if (!ctx.projects('public_works').length) list.push(P.gov('polish_gov_public_works', 'employment'));
      list.push(P.agenda('launch_public_works'));
      if (!ctx.projects('worker_protection', ['operating']).length) list.push(P.gov('polish_gov_social_welfare', 'expand'));
      list.push(P.gov('polish_gov_labor_rights', 'collective'));
    }
    return list;
  },
  support(ctx) {
    return ctx.stance === 'supporter' && !ctx.projects('worker_protection', ['operating', 'enacted', 'launched']).length ? [P.support('bargain')] : [];
  },
};

function strategy(id, label, spec) {
  return Object.assign({ id, label, events: ACTIVE_EVENTS, formation: FORMATION.tolerate, free: () => [], month: plan.base }, spec);
}

const STRATEGIES = {
  // The four reference runs of 17.16.7.
  N_A: strategy('N_A', 'N-A: passive PPS', { events: PASSIVE_EVENTS, formation: FORMATION.opposition, month: plan.base }),
  N_B: strategy('N_B', 'N-B: tolerating PPS', {
    formation: FORMATION.tolerate,
    free: ctx => [P.adviser('niedzialkowski', 'defend_democracy')],
    month: ctx => plan.organised(ctx, [...plan.wage(ctx), ...(ctx.after(1925, 6) ? plan.military(ctx) : []), ...plan.support(ctx)]),
  }),
  N_C: strategy('N_C', 'N-C: co-governing PPS', {
    formation: FORMATION.lateCoalition,
    free: ctx => [P.adviser('niedzialkowski', 'defend_democracy'), P.adviser('moraczewski', 'public_works')],
    month: ctx => plan.organised(ctx, [...(ctx.after(1924, 1) && ctx.before(1925, 12) ? prepare(ctx, 'broad') : []), ...plan.wage(ctx), ...plan.government(ctx), ...(ctx.after(1925, 12) ? plan.military(ctx) : []), ...plan.support(ctx)]),
  }),
  N_H: strategy('N_H', 'N-H: historical intentions', {
    events: Object.assign({}, ACTIVE_EVENTS, {
      polish_event_strike_1923: ['cabinet_resignation', 'economic_strike'],
      polish_event_stabilization: ['gradual', 'protected', 'wait'],
      polish_event_austerity_1926: ['withdraw'],
      polish_presidential_first: ['confirm_daszynski'],
      polish_strike_steps: ['limited', 'no_protection', 'done'],
      coup_stance: 'support_pils', coup_commit: 'rail', coup_f9: 'accept',
    }),
    formation: FORMATION.lateCoalition,
    month: ctx => plan.organised(ctx, [...(ctx.after(1924, 1) && ctx.before(1925, 12) ? prepare(ctx, 'broad') : []), ...plan.government(ctx)]),
  }),
  // The nine strategies of 21.2.
  passive_opening: strategy('passive_opening', '21.2: passive opening', {
    events: PASSIVE_EVENTS,
    formation: ctx => ctx.before(1922, 12) ? FORMATION.opposition(ctx) : FORMATION.tolerate(ctx),
    month: ctx => ctx.before(1922, 12) ? plan.base(ctx) : plan.organised(ctx, [...plan.wage(ctx), ...plan.support(ctx)]),
  }),
  election_campaign: strategy('election_campaign', '21.2: active election campaign', {
    month: ctx => {
      const pre = (ctx.after(1922, 7) && ctx.before(1922, 11)) || (ctx.after(1927, 9) && ctx.before(1928, 2));
      const extra = pre ? [P.campaign('workers_gains', ['workers', 'rural', 'new_middle'][ctx.t % 3]), P.turnout('workers')] : [];
      return plan.organised(ctx, [...extra, ...plan.wage(ctx), ...plan.support(ctx)]);
    },
    // Z — 0.57: the joint list with PSL Wyzwolenie is the answer to the event before the election.
    events: Object.assign({}, ACTIVE_EVENTS, { polish_list_agreement: ['left_peasant', 'alone'] }),
  }),
  permanent_opposition: strategy('permanent_opposition', '21.2: permanent opposition', {
    formation: FORMATION.opposition,
    events: Object.assign({}, ACTIVE_EVENTS, { polish_event_cabinet_1922: ['opposition'], polish_budget_package: ['refuse', 'later'] }),
    month: ctx => plan.organised(ctx, [...plan.wage(ctx)]),
  }),
  formal_coalition: strategy('formal_coalition', '21.2: formal coalition', {
    formation: FORMATION.coalition,
    month: ctx => plan.organised(ctx, [...prepare(ctx, ctx.before(1924, 1) ? 'early' : 'broad'), ...plan.government(ctx), ...plan.military(ctx)]),
  }),
  stabilization_protections: strategy('stabilization_protections', '21.2: stabilisation with protections', {
    formation: FORMATION.tolerate,
    events: Object.assign({}, ACTIVE_EVENTS, { polish_event_stabilization: ['protections_terms', 'protected', 'gradual'] }),
    month: ctx => plan.organised(ctx, [...plan.support(ctx), ...plan.wage(ctx)]),
  }),
  active_employment: strategy('active_employment', '21.2: active employment', {
    formation: FORMATION.coalition,
    free: ctx => [P.adviser('moraczewski', 'public_works')],
    month: ctx => plan.organised(ctx, [...prepare(ctx, ctx.before(1924, 1) ? 'early' : 'broad'), ...plan.government(ctx), P.bill()]),
  }),
  mass_organizations: strategy('mass_organizations', '21.2: mass organisations', {
    month: ctx => {
      const extra = [];
      if (ctx.militiaStage < 2) {
        // Stage 8 (A4): the AS as soon as it is affordable (10.9: 2 R; since Z — 0.56 without a reserve for upkeep); before that the step
        // it still needs, then money saved for it — not a fixed rotation that misses the affordable month.
        const M = ctx.S.militia;
        if (globalThis.PolishParty.militiaStatus(ctx.Q, 'as').available) extra.push(P.militia('form_as'));
        else if (!M.militarized) extra.push(P.militia('militarize'));
        else if (M.strength < 500) extra.push(P.militia('recruit'));
        else extra.push(P.fundraise());
      }
      extra.push(P.orgs('union_organize_industry', 'union_fund_rail'), P.orgs('tur', 'cooperative_workers'), P.cooperative());
      return plan.organised(ctx, extra);
    },
  }),
  prepared_mediation: strategy('prepared_mediation', '21.2: prepared mediation', {
    events: Object.assign({}, ACTIVE_EVENTS, { coup_stance: 'mediate', coup_commit: 'militia', coup_f9: 'accept' }),
    month: ctx => plan.organised(ctx, [ctx.t % 4 === 0 ? P.militia('recruit') : P.militia('militarize'), ...plan.wage(ctx)]),
  }),
  constitutional_defense: strategy('constitutional_defense', '21.2: constitutional defence', {
    free: ctx => [P.adviser('niedzialkowski', 'defend_democracy')],
    month: ctx => plan.organised(ctx, [P.constitution('democratic_guarantees'), P.agenda('submit_democratic_guarantees'),
      P.armyOversight('civilian_oversight'), P.agenda('launch_army_control'), P.militia(ctx.t % 2 ? 'militarize' : 'form_as'),
      P.campaign('democracy', 'workers'), ...plan.military(ctx)]),
  }),
};

// ---- Answers to a scene that is not the month's main page.
const CONTINUE = ['root', 'polish_event_coup.begin', 'polish_event_coup.f67_seen', 'sejm_election.calculate', 'sejm_election.finish',
  'sejm_election.return_to_play', 'polish_speaker_election.finish', 'polish_presidential_sequence.first_done',
  'polish_presidential_sequence.assassination', 'polish_presidential_sequence.finish', 'polish_cabinet_formation.done',
  'polish_strike_steps.done'];

function answer(engine, strat) {
  const Q = engine.state.qualities, sid = engine.state.sceneId, ev = strat.events;
  if (sid === 'polish_cabinet_formation' || sid === 'sejm_election.government') {
    const ctx = context(engine);
    const params = strat.formation(ctx) || { mode: 'opposition' };
    if (form(engine, params)) return true;
    if (form(engine, { mode: 'opposition' })) return true;
  }
  const opts = options(engine).filter(o => o.ok);
  if (!opts.length) return false;
  const base = sid.split('.')[0];
  let prefs = [];
  if (base === 'polish_event_coup') {
    prefs = ['polish_event_coup.' + ev.coup_stance, 'polish_event_coup.commit_' + ev.coup_commit, 'polish_event_coup.f9_' + ev.coup_f9,
      'polish_event_coup.commit_none', 'polish_event_coup.mediate'];
  } else if (sid === 'polish_presidential_sequence.first_nomination') {
    prefs = (ev.polish_presidential_first || []).map(o => 'polish_presidential_sequence.' + o);
  } else if (sid === 'polish_presidential_sequence.second_nomination') {
    prefs = (ev.polish_presidential_second || []).map(o => 'polish_presidential_sequence.' + o);
  } else if (sid === 'polish_event_assassination_response.protection') {
    prefs = (ev.polish_event_assassination_response_protection || ['unprotected']).map(o => 'polish_event_assassination_response.' + o);
  } else if (sid === 'polish_event_austerity_1926.threat') {
    prefs = (ev.polish_event_austerity_1926_threat || ['back_down']).map(o => 'polish_event_austerity_1926.' + o);
  } else if (sid === 'polish_speaker_election.choice') {
    prefs = (ev.polish_speaker_election || []).map(o => 'polish_speaker_election.' + o);
  } else if (sid === 'polish_government_support.threat') {
    prefs = ['polish_government_support.back_down'];
  } else if (sid === 'polish_government_support.motion') {
    prefs = ['polish_government_support.own_motion_refuse'];
  } else if (ev[base]) {
    const key = base === 'polish_government_response' ? 'polish_government_response' : base;
    prefs = ev[key].map(o => (o.includes('.') ? o : (key === 'polish_government_response' && ['maintain', 'extension', 'bargain', 'persuade', 'withdraw'].includes(o)
      ? 'polish_government_support.' : base + '.') + o));
  }
  for (const id of prefs.concat(CONTINUE)) if (pick(engine, id)) return true;
  const fallback = opts.find(o => !['easy_discard', 'cancel_advisor_action'].includes(o.id) && !o.id.endsWith('.later')) || opts[0];
  engine.choose(fallback.i);
  return true;
}

// ---- One month at the main page: free steps, then the first action of the plan that uses the month.
function playMonth(engine, strat, used) {
  const Q = engine.state.qualities, R = globalThis.PolishRules;
  const ctx = context(engine);
  for (const path of strat.free(ctx)) {
    const key = path.join('>') + '@' + Q.time;
    if (used.has(key)) continue;
    used.add(key);
    if (runPath(engine, path)) {
      while (engine.state.sceneId !== 'main' && Q.S.chapter.status !== 'ended' && Q.time === ctx.t) {
        if (!answer(engine, strat)) break;
      }
      if (Q.time !== ctx.t || Q.S.chapter.status === 'ended') return 'moved';
      if (engine.state.sceneId !== 'main') engine.goToScene('main');
    }
  }
  const tried = [];
  for (const path of strat.month(context(engine))) {
    if (!R.mainActionAvailable(Q)) break;
    tried.push(path[path.length - 1]);
    if (!runPath(engine, path)) continue;
    if (!R.mainActionAvailable(Q) || Q.time !== ctx.t) return path;
    // The path did not use the month (a free answer): carry on from where it left the game.
    while (engine.state.sceneId !== 'main' && Q.S.chapter.status !== 'ended' && Q.time === ctx.t) {
      if (!answer(engine, strat)) break;
    }
    // A free answer that settled the month leaves the game at the next month's events: they are answered by the run.
    if (Q.time !== ctx.t || Q.S.chapter.status === 'ended') return path;
    if (engine.state.sceneId !== 'main') engine.goToScene('main');
  }
  return null;
}

// ---- A whole campaign.
// Options: setup(engine) changes the new game before the first month (a calibration fixture); stopWhen(Q) ends the
// run early, e.g. after the election of 1922; lang 'pl' plays the Polish version of the game.
function runCampaign(strategyId, seed, { maxSteps = 30000, monthSteps = 400, setup = null, stopWhen = null, onMonth = null, lang = 'en' } = {}) {
  const strat = STRATEGIES[strategyId];
  if (!strat) throw new Error('unknown strategy ' + strategyId);
  const engine = dendry.startGame(seed, lang);
  if (setup) setup(engine);
  const Q = engine.state.qualities, S = Q.S;
  const months = [];
  const actions = {};
  const used = new Set();
  let steps = 0, lastT = -1, stepsThisMonth = 0, stuck = null;
  const snapshot = () => {
    const E = S.economy, cab = S.cabinet;
    months.push({ t: Q.time, date: ym(Q.time), cabinet: cab ? cab.id : null, pm: cab ? cab.pm_name : null, config: cab ? cab.configuration_id : null,
      pps_mode: cab ? cab.pps_mode : null, cabinet_status: cab ? cab.status : null, inflation: E.inflation_m, output: E.output, unemployment: E.unemployment,
      budget: E.budget, pressure: S.coup.pressure, democracy: S.politics.democracy, violence: S.politics.violence, authority: S.politics.parliament_authority,
      grievance: S.politics.national_grievance, capacity: globalThis.PolishSecurity ? globalThis.PolishSecurity.capacity(S, Q.time) : null,
      cash: S.party_orgs.cash, pps_votes: Q.pps_votes, coup_phase: S.coup.phase });
  };
  while (S.chapter.status !== 'ended' && steps < maxSteps) {
    if (stopWhen && stopWhen(Q)) break;
    steps++;
    if (Q.time !== lastT) { lastT = Q.time; stepsThisMonth = 0; snapshot(); if (onMonth) onMonth(engine); }
    if (++stepsThisMonth > monthSteps) { stuck = { t: Q.time, date: ym(Q.time), scene: engine.state.sceneId }; break; }
    if (engine.state.sceneId === 'main') {
      const done = playMonth(engine, strat, used);
      if (done && done !== 'moved') { const k = done[done.length - 1]; actions[k] = (actions[k] || 0) + 1; }
      if (!done && engine.state.sceneId === 'main' && Q.time === lastT && S.chapter.status !== 'ended') {
        // Nothing of the plan used the month: fall back to organisational work, which is always open.
        if (runPath(engine, P.organize('industry'))) actions['fallback.organize'] = (actions['fallback.organize'] || 0) + 1;
        else { stuck = { t: Q.time, date: ym(Q.time), scene: 'main', reason: 'no action available' }; break; }
      }
      continue;
    }
    if (!answer(engine, strat)) { stuck = { t: Q.time, date: ym(Q.time), scene: engine.state.sceneId, reason: 'no option' }; break; }
  }
  // The chapter ends on the last page of its sequence (F10+F11 or the election result); the report follows.
  for (let n = 0; n < 5 && S.chapter.status === 'ended' && engine.state.sceneId !== 'polish_chapter_report'; n++) {
    if (!pick(engine, 'polish_chapter_report') && !pick(engine, 'sejm_election.chapter_end')) break;
  }
  snapshot();
  return { strategy: strategyId, label: strat.label, seed, engine, months, actions, stuck, steps };
}

// ---- The summary of a campaign for the report.
function summarize(run) {
  const Q = run.engine.state.qualities, S = Q.S;
  const seats = Object.fromEntries((S.parliament.clubs || []).map(c => [c.id, c.seats]));
  const history = Q.sejm_history || [];
  const cabinets = S.history.cabinets.concat(S.cabinet ? [S.cabinet] : []).map(c => ({ pm: c.pm_name, config: c.configuration_id, pps_mode: c.pps_mode,
    formed: c.formed_at ? ym(c.formed_at) : null, ended: c.ended_at ? ym(c.ended_at) : null, end: c.end_reason || c.fall_reason || null }));
  const log = S.coup.log || [];
  const crisis = log.find(e => e.kind === 'political_crisis'), attempt = log.find(e => e.kind === 'attempt_declared');
  const presidents = (Q.polish_presidency && Q.polish_presidency.elections || []).map(e => e.winner_name || e.winner_id);
  const at = (y, m) => run.months.find(x => x.t === globalThis.PolishRules.timeOf(y, m)) || null;
  return {
    strategy: run.strategy, seed: run.seed, stuck: run.stuck, steps: run.steps,
    end: S.chapter.status === 'ended' ? S.chapter.reason : 'not_ended', end_date: ym(Q.time),
    sejm_1922: history.length ? seats : null, first_election: history[0] ? history[0].date : null,
    speaker_1922: S.parliament.previous_term && S.parliament.previous_term.speaker ? S.parliament.previous_term.speaker.name
      : (S.parliament.speaker ? S.parliament.speaker.name : null),
    presidents, cabinets, cabinet_count: cabinets.length,
    crisis: crisis ? ym(crisis.t) : null, attempt: attempt ? ym(attempt.t) : null, attempt_t: attempt ? attempt.t : null,
    outcome: S.coup.outcome, stance: S.coup.stance, commitments: S.coup.commitments, pps_contribution: S.coup.pps_contribution,
    pils_agreement: S.actors.pilsudski ? S.actors.pilsudski.agreement_id : null,
    pressure_max: Math.max(...run.months.map(m => m.pressure)), pressure_1926_03: at(1926, 3) ? at(1926, 3).pressure : null,
    democracy_end: S.politics.democracy, violence_end: S.politics.violence,
    pps_votes_end: Q.pps_votes, cash_end: S.party_orgs.cash, militia_stage: S.militia.stage,
    projects_operating: Object.values(S.projects).filter(p => ['operating', 'completed', 'enacted'].includes(p.status)).map(p => p.type),
    actions: run.actions,
  };
}

module.exports = { STRATEGIES, P, runCampaign, summarize, runPath, answer, form, context, ym };
