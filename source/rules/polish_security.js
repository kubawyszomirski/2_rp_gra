// Polish chapter forces of the state: the synthetic army groups and their loyalties, the effective loyalty read from
// democracy, the coup capacity, the uncertain assessment of the forces, the police, civilian control of the army
// and nominations, and the agreement with Piłsudski with its review (docs/POLISH_IMPLEMENTATION_PLAN.md, stage 7;
// technical reference 16.1–16.3, 16.7, 16.8.1, 17.12.2, 17.12.4).
//
// Plain JavaScript without dependencies, like polish_rules.js. `npm run build` copies it to out/html/; the page
// loads it after polish_politics.js as `window.PolishSecurity`, and Node tests load it with require(). The force
// profile `synthetic_test_v2` is a test calibration (Z — M08), not a reconstruction of the army of 1926. Stage 8 (8f)
// kept it: its four groups follow the pattern of May 1926 recorded in HISTORICAL_SOURCES.md (a divided garrison of the
// capital, near reserves, remote reserves by rail and a selective railway blockade), but the sources disagree on the
// numbers.
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./polish_rules.js'), require('./polish_government.js'), require('./polish_party.js'),
      require('./polish_unions.js'), require('./polish_politics.js'), require('./polish_projects.js'));
  } else {
    root.PolishSecurity = factory(root.PolishRules, root.PolishGovernment, root.PolishParty, root.PolishUnions, root.PolishPolitics,
      root.PolishProjects);
  }
}(typeof self !== 'undefined' ? self : this, function (rules, government, party, unions, politics, projects) {
  'use strict';

  if (!rules || !government || !party || !unions || !politics || !projects) {
    throw new Error('PolishSecurity needs polish_rules.js, polish_government.js, polish_party.js, polish_unions.js, polish_politics.js ' +
      'and polish_projects.js first');
  }

  const clip = (value, low, high) => Math.max(low, Math.min(high, value));
  const round = (value, digits) => Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
  const copy = value => JSON.parse(JSON.stringify(value));
  // Polish version (decision 2A): the texts of this module are written in both languages and L picks the current
  // one; numbers get a decimal comma in Polish (decision 6A).
  const L = rules.L;
  // Z — 0.84 (the user's note of 24 X 2026): the numbers of the texts are shown to 0.1 at most.
  const fmt = value => {
    const text = Math.abs(value) < 0.05 ? '0' : value.toFixed(1).replace(/\.0$/, '');
    return rules.getLanguage() === 'pl' ? text.replace('.', ',') : text;
  };
  const dateOf = t => rules.monthOf(t) + '/' + rules.yearOf(t);
  // A number inside a text the records of S keep: always the English format (decision 5A).
  const fmtEn = value => (Math.abs(value) < 0.005 ? '0' : value.toFixed(2).replace(/\.?0+$/, ''));
  const PL = () => rules.getLanguage() === 'pl';
  const OK = Object.freeze({available: true, reason: ''});
  const VIOLENCE_SERIOUS = 10; // 15.2: a serious episode of violence
  const no = reason => ({available: false, reason: reason});

  // ---- The synthetic force profile (16.1, Z — 0.20, M08) ----------------------------------------------------

  // Z — 1.03 (decision 1B of 7 XI 2026): the army is one body, the strength-weighted sum of the four synthetic groups of
  // synthetic_test_v2 (160 F; loyalty to the government 0.43, to Piłsudski 0.45, neutral 0.12). P: game values.
  const FORCE_PROFILE_ID = 'synthetic_army_v1';
  const ARMY = 'army';
  const FORCES = Object.freeze([
    {id: ARMY, base_strength_F: 160, readiness: 0.80, command: 0.81, loyalty: [0.43, 0.45, 0.12], available_from_phase: 0, transport_route: 'road', rail_delay_cap: 0},
  ]);
  const LOGISTICS = 0.80;         // 16.2 (P)
  const KNOWN_START = 30;         // 16.8.1: ±30 pp around the loyalties
  const KNOWN_STEP = 10;          // one assessment narrows the interval by 10 pp
  const KNOWN_FLOOR = 5;          // to at least ±5 pp
  const ASSESS_COOLDOWN = 3;      // 6.8 (Z — 0.35): 1 T, 1 R, cd 3 M
  const ASSESS_COST_R = 1;
  // 17.12.4 (P): the one synthetic post under civilian oversight; since Z — 1.03 it acts on the whole army.
  const OVERSIGHT_FORCE = ARMY;

  function ready(Q) {
    return !!(Q && Q.S && Q.polish_security_rules && !Q.polish_save_incompatible && Q.S.security && Array.isArray(Q.S.security.forces) &&
      Q.S.security.forces.length > 0);
  }

  function knownFor(S, force, radius, rollId) {
    const u = rules.roll(S, rollId);
    const offset = (2 * u - 1) * radius / 2;
    return {pils_center: clip(force.loyalty_pils + offset / 100, 0, 1), radius: radius, at: S.turn.last_settled_time, roll_id: rollId};
  }

  // A new game: the four groups of the profile, the police at 50 (16.3), the assessment at ±30 pp around a centre
  // that a recorded roll moves so it does not reveal the true value (16.8.1).
  function attachSecurityState(Q) {
    const S = Q.S;
    if (S.security.forces.length) return S.security;
    S.security.profile_id = FORCE_PROFILE_ID;
    S.security.logistics = LOGISTICS;
    S.security.forces = FORCES.map(f => ({id: f.id, kind: 'army_group', base_strength_F: f.base_strength_F, readiness: f.readiness,
      command: f.command, loyalty_legal: f.loyalty[0], loyalty_pils: f.loyalty[1], loyalty_neutral: f.loyalty[2],
      available_from_phase: f.available_from_phase, transport_route: f.transport_route, rail_delay_cap: f.rail_delay_cap,
      committed_side: null, losses_F: 0, source_status: 'P', modifiers: []}));
    for (const force of S.security.forces) S.security.known[force.id] = knownFor(S, force, KNOWN_START, force.id + ':known');
    S.security.modifiers = [];
    S.security.protections = {};
    S.security.effects_applied = [];
    if (!S.actors.pilsudski) S.actors.pilsudski = {agreement_id: null, relief_case_ids: [], history: []};
    return S.security;
  }

  const forceOf = (S, id) => S.security.forces.filter(f => f.id === id)[0] || null;

  // Effective loyalty (16.1, Z — 0.22, M10): democracy above 60 moves part of those ready to join Piłsudski to
  // neutrality, below 60 from neutrality to Piłsudski; the legal share never changes; the sum stays 1.
  function effectiveLoyalty(force, democracy) {
    const s = clip(0.0025 * (democracy - 60), -0.10, 0.10);
    const legal = force.loyalty_legal, pils = force.loyalty_pils, neutral = force.loyalty_neutral;
    if (s >= 0) return {legal: legal, pils: pils - Math.min(s, pils), neutral: neutral + Math.min(s, pils)};
    return {legal: legal, pils: pils + Math.min(-s, neutral), neutral: neutral - Math.min(-s, neutral)};
  }

  // The readiness with its temporary modifiers (17.12.4: −0.05 for the two months after a nomination), never below 0.
  function readinessOf(force, t) {
    const modifier = (force.modifiers || []).filter(m => m.field === 'readiness' && t >= m.from && t < m.until).reduce((n, m) => n + m.value, 0);
    return Math.max(0, force.readiness + modifier);
  }

  // 16.2: the expected strength of the coup side, with availability 1 for every group that can arrive in the phases
  // of a crisis (0–3) and no rail delay; a display scale of 100 F; not a probability of victory.
  function capacity(S, t) {
    const democracy = S.politics ? S.politics.democracy : 60;
    const time = t === undefined ? S.turn.last_settled_time + 1 : t;
    const expected = S.security.forces.reduce((n, f) => n + (f.available_from_phase <= 3 ? Math.max(0, f.base_strength_F - f.losses_F) *
      readinessOf(f, time) * f.command * effectiveLoyalty(f, democracy).pils : 0), 0);
    return clip(100 * (expected / 100) * (S.security.logistics || LOGISTICS), 0, 100);
  }

  // The recognised interval of each group's loyalty to Piłsudski (16.8.1); the interface shows only this.
  function knownView(S) {
    return S.security.forces.map(f => {
      const k = S.security.known[f.id];
      return {id: f.id, low: clip(k.pils_center - k.radius / 100, 0, 1), high: clip(k.pils_center + k.radius / 100, 0, 1), radius: k.radius};
    });
  }

  // ---- The assessment of the forces: a permanent agenda action (6.8; 16.8.1) -------------------------------

  function assessStatus(Q) {
    const S = Q.S;
    if (!ready(Q) || S.chapter.status === 'ended') return no('');
    if (S.security.forces.every(f => S.security.known[f.id].radius <= KNOWN_FLOOR)) return no(L('The assessment is already as precise as it can be (±5 pp).', 'Ocena jest już tak dokładna, jak to możliwe (±5 pkt proc.).'));
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    const wait = rules.cooldownRemaining(Q, 'security.assess');
    if (wait > 0) return no(L('Assessed recently: ' + wait + (wait === 1 ? ' month' : ' months') + ' before the next assessment.',
      'Ocena była niedawno: do następnej ' + wait + ' ' + rules.plural(wait, 'miesiąc', 'miesiące', 'miesięcy') + '.'));
    if (S.party_orgs.cash + 1e-9 < ASSESS_COST_R) return no(L('Needs 1 resource.', 'Wymaga 1 jednostki środków.'));
    return OK;
  }

  function assess(Q) {
    const status = assessStatus(Q);
    if (!status.available) throw new Error('assess: ' + status.reason);
    const S = Q.S, t = Q.time;
    party.syncMirrors(Q);
    rules.commitMainAction(Q, 'security.assess', {});
    S.party_orgs.cash = Math.max(0, round(S.party_orgs.cash - ASSESS_COST_R, 6));
    S.cooldowns['security.assess'] = t + ASSESS_COOLDOWN;
    const n = S.security.assessments.length + 1;
    for (const force of S.security.forces) {
      const radius = Math.max(KNOWN_FLOOR, S.security.known[force.id].radius - KNOWN_STEP);
      const effective = effectiveLoyalty(force, S.politics.democracy);
      S.security.known[force.id] = knownFor(S, Object.assign({}, force, {loyalty_pils: effective.pils}), radius, force.id + ':known:' + n);
      S.security.known[force.id].at = t;
    }
    S.security.assessments.push({n: n, t: t, radius: S.security.known[S.security.forces[0].id].radius});
    party.writeMirrors(Q);
    // Z — 1.03 (decision 4A): what the assessment learned, in words.
    Q.pl_security_result = L('Our people in the army report: ', 'Nasi ludzie w wojsku donoszą: ') + armyWords(S).charAt(0).toLowerCase() + armyWords(S).slice(1);
    return S.security.known;
  }

  // ---- The police (16.3, 17.12.2; card 8.12) --------------------------------------------------------------

  // The capacity of protecting one gathering or institution: capacity × command × lawful compliance, plus the named
  // protection of this month (+10 × execution, at most 100).
  function protectionCapacity(S, caseId, t) {
    const police = S.security.police;
    const base = police.capacity * (police.command / 100) * (police.lawful_compliance / 100);
    const named = caseId && S.security.protections[caseId] && S.security.protections[caseId].t === t ? S.security.protections[caseId].bonus : 0;
    return clip(base + named, 0, 100);
  }

  // The finished professionalisation: command and lawful compliance +10 once in the chapter (17.12.2); a change of
  // government resets neither the training nor the limit.
  function professionalized(Q, project, t) {
    const S = Q.S, police = S.security.police;
    if (S.security.effects_applied.indexOf('police_professionalization') >= 0) return false;
    S.security.effects_applied.push('police_professionalization');
    police.command = Math.min(100, police.command + 10);
    police.lawful_compliance = Math.min(100, police.lawful_compliance + 10);
    S.history.reasons.push({t: t === undefined ? Q.time : t, kind: 'police_professionalized', project_id: project.id});
    return true;
  }

  // An investigation of a named case (Z — 0.37): a confirmed one assigns the case to the party its profile suspects;
  // a profile that suspects no party confirms none. The label names the case, not a proof of guilt.
  function investigated(Q, project, t) {
    const S = Q.S, c = S.politics.cases[project.policy_choices.case_id];
    if (!c || c.investigation) return null;
    c.investigation = {project_id: project.id, t: t === undefined ? Q.time : t, confirmed: !!c.suspected, party: c.suspected || null};
    if (c.suspected) c.assigned_party = c.suspected;
    return c.investigation;
  }

  function protectionExecuted(Q, project, coverage, t) {
    const S = Q.S, caseId = project.policy_choices.case_id;
    S.security.protections[caseId] = {t: t === undefined ? Q.time : t, bonus: 10 * (coverage === undefined ? 1 : coverage), project_id: project.id};
  }

  // ---- Civilian control of the army and nominations (16.3, 17.12.4; cards 7.5 and 8.14) -------------------

  // A move of the legal loyalty of one group by delta, taken proportionally from the other two shares (sum 1).
  function shiftLoyalty(force, field, delta) {
    const others = ['loyalty_legal', 'loyalty_pils', 'loyalty_neutral'].filter(f => f !== field);
    const room = Math.min(delta, 1 - force[field]);
    const pool = others.reduce((n, f) => n + force[f], 0);
    if (room <= 0 || pool <= 0) return 0;
    for (const f of others) force[f] = Math.max(0, force[f] - room * force[f] / pool);
    force[field] = force[field] + room;
    const sum = force.loyalty_legal + force.loyalty_pils + force.loyalty_neutral;
    force.loyalty_neutral = Math.max(0, force.loyalty_neutral + (1 - sum));
    return room;
  }

  // Z — 1.02: the recognised interval follows a change PPS itself made, so the Status shows what the decision did.
  function shiftKnown(S, forceId, deltaPils) {
    const k = S.security.known[forceId];
    if (k && deltaPils) k.pils_center = clip(k.pils_center + deltaPils, 0, 1);
  }

  // A direct move of loyalty from one share to another (Z — 1.02): at most what the first share holds; the sum stays 1.
  function moveLoyalty(S, force, from, to, delta) {
    const moved = Math.max(0, Math.min(delta, force[from]));
    force[from] -= moved;
    force[to] += moved;
    if (from === 'loyalty_pils') shiftKnown(S, force.id, -moved);
    if (to === 'loyalty_pils') shiftKnown(S, force.id, moved);
    return moved;
  }

  // Z — 1.02 (the card Sprawy wojskowe): the promotions reach the group most loyal to Piłsudski that still leans to him.
  function promotionTarget(S) {
    if (!S.security || !S.security.forces.length) return null;
    return S.security.forces.filter(f => f.loyalty_pils > 0.001).sort((a, b) => b.loyalty_pils - a.loyalty_pils || (a.id < b.id ? -1 : 1))[0] || null;
  }

  function promoteOfficers(Q, force, delta) {
    const S = Q.S;
    const moved = moveLoyalty(S, force, 'loyalty_pils', 'loyalty_legal', delta);
    S.history.reasons.push({t: Q.time, kind: 'officers_promoted', force_id: force.id, moved: round(moved, 4)});
    return moved;
  }

  // The executed control project: +0.05 of legal loyalty for its group (+0.025 for the limited reform), once per
  // scope of the reform; a nomination adds −0.05 readiness for two months and a real conflict +8 of pressure (P:
  // a nomination against a relation with Piłsudski below 40 is such a conflict).
  function armyControlled(Q, project, time) {
    const S = Q.S, t = time === undefined ? Q.time : time, key = 'army_control:' + (project.policy_choices.force_id || OVERSIGHT_FORCE);
    if (S.security.effects_applied.indexOf(key) >= 0) return 0;
    S.security.effects_applied.push(key);
    const force = forceOf(S, project.policy_choices.force_id || OVERSIGHT_FORCE);
    const delta = project.variant === 'limited_reform' ? 0.025 : 0.05;
    const moved = shiftLoyalty(force, 'loyalty_legal', delta);
    if (project.variant === 'personnel_changes') {
      force.modifiers.push({field: 'readiness', value: -0.05, from: t + 1, until: t + 3, source: project.id});
      if ((S.actors.relations.pilsudski || 0) < 40) politics.applyImpulse(Q, 'nomination_conflict:' + project.id, politics.IMPULSES.personal_conflict, 'personal_conflict');
    }
    S.history.reasons.push({t: t, kind: 'army_control', project_id: project.id, force_id: force.id, legal: round(force.loyalty_legal, 4)});
    return moved;
  }

  // ---- The agreement with Piłsudski (16.7; card 8.15) -------------------------------------------------------

  // P (16.7): the test profile of Piłsudski — army −2, institutions −2, the rest 0, weights 1 — and a demand of a
  // real named function with weight 3; the relation gates of the three concessions; their one-off effects.
  const PILS_PROFILE = Object.freeze({army: -2, institution: -2});
  const CONCESSIONS = Object.freeze({
    // Z — 1.02 (the user's decisions of 7 XI 2026): the inspectorate takes effect at once, without a vote, and moves the near and the
    // remote reserve towards Piłsudski by 0.05 each instead of 0.10 in one group; `forces` are the groups, `loyalty_limit` per group.
    // Z — 1.03: the one army; the military function +0.03 and the inspectorate +0.05 of loyalty to Piłsudski.
    military_function: {name: 'a military function under civilian control', relation: 40, relief: 12, pilsudczycy: -5, loyalty_limit: 0.03,
      forces: [ARMY], programme: {army: 0, institution: 0}, law: false},
    inspectorate: {name: 'an independent inspectorate with freer nominations', relation: 60, relief: 25, pilsudczycy: -8, centrum: 8,
      loyalty_limit: 0.05, forces: [ARMY], programme: {army: -2, institution: 0}, law: false},
    pils_premier: {name: 'Piłsudski as prime minister of a legal cabinet', relation: 65, relief: 20, pilsudczycy: -5, loyalty_limit: 0,
      programme: {army: 0, institution: 0}, law: false},
  });
  const CONCESSION_NAMES_PL = Object.freeze({military_function: 'funkcja wojskowa pod kontrolą cywilną',
    inspectorate: 'niezależny inspektorat ze swobodniejszymi nominacjami', pils_premier: 'Piłsudski jako premier legalnego gabinetu'});
  const concessionName = variant => L(CONCESSIONS[variant].name, CONCESSION_NAMES_PL[variant]);
  const REVIEW_MONTHS = 6;

  // Piłsudski's score of an offer (8.3 with his profile): 0.25 relation + 0.35 fit + 0.20 demands met + 0.10 PPS
  // credibility; the function demand (weight 3) is met by a real named function.
  function pilsScore(S, programme, functionMet) {
    let distance = 0, weights = 0;
    for (const topic of Object.keys(PILS_PROFILE)) { distance += Math.abs((programme[topic] || 0) - PILS_PROFILE[topic]); weights += 1; }
    distance += functionMet ? 0 : 4 * 3; weights += 3;
    const fit = 100 * (1 - distance / (4 * weights));
    return clip(0.25 * (S.actors.relations.pilsudski || 0) + 0.35 * fit + 0.20 * 100 + 0.10 * S.actors.pps.credibility, 0, 100);
  }

  function pilsAgreement(S) {
    const id = S.actors.pilsudski && S.actors.pilsudski.agreement_id;
    return id ? S.agreements[id] || null : null;
  }

  // The card is in the pool only with PPS in an active cabinet holding Military Affairs (8.15): toleration or a party
  // line do not open it; the premiership goes through the formation of a cabinet (8.8).
  function pilsCardAvailable(Q) {
    const S = Q.S;
    if (!ready(Q) || S.chapter.status === 'ended' || !S.cabinet || S.cabinet.status !== 'active') return false;
    if (government.formationPending(Q)) return false;
    // 16.7: during a started attempt the only decision about an offer is F9.
    if (S.coup.attempt_id !== null && ['attempt_declared', 'pps_stance', 'organization_commitment', 'execution_and_transport'].indexOf(S.coup.phase) >= 0) return false;
    return S.cabinet.partner_ids.indexOf('pps') >= 0 && S.cabinet.portfolios.reichswehr === 'pps';
  }

  // The coup is in its political crisis: the answer then costs no month (16.7).
  const inCrisis = S => S.coup && S.coup.phase === 'political_crisis';

  function concessionStatus(Q, variant) {
    const S = Q.S, spec = CONCESSIONS[variant], line = S.actors.pps.strategy.pils_influence;
    if (!pilsCardAvailable(Q)) return no(L('Needs PPS in the cabinet with Military Affairs; toleration or a party line are not enough.', 'Wymaga PPS w gabinecie z resortem Spraw Wojskowych; tolerowanie ani linia partii nie wystarczą.'));
    if (variant === 'refuse') return OK;
    if (!spec) return no(L('Unknown concession.', 'Nieznane ustępstwo.'));
    if (!inCrisis(S) && !rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    const current = pilsAgreement(S);
    if (current && current.status === 'active' && current.variant === variant) return no(L('This concession is already agreed.', 'To ustępstwo jest już uzgodnione.'));
    if ((S.actors.relations.pilsudski || 0) < spec.relation) return no(L('Needs a relation of ' + spec.relation + ' with Piłsudski.',
      'Wymaga relacji z Piłsudskim co najmniej ' + spec.relation + '.'));
    // 10.7 (Z — 0.33): the line limits the concessions, it does not gate the card.
    if (variant === 'inspectorate' && line === 'oppose_military_interference') return no(L('Our line opposes military interference: no autonomous military power.', 'Nasza linia sprzeciwia się ingerencji wojska: bez autonomicznej władzy wojskowej.'));
    if (variant === 'pils_premier' && current && current.status === 'active' && current.execution_started_at !== null) {
      return no(L('An agreement with Piłsudski is being executed; the premiership would be a second relief of the same crisis.', 'Porozumienie z Piłsudskim jest wykonywane; premierostwo byłoby drugim złagodzeniem tego samego kryzysu.'));
    }
    // The premiership too needs his score ≥60: a compromise despite a different constitutional ideal (16.7).
    const score = pilsScore(S, offerProgramme(S, variant), true);
    return score >= 60 ? OK : no(L('Piłsudski does not accept this concession (score ' + fmt(score) + ').', 'Piłsudski nie przyjmuje tego ustępstwa (ocena ' + fmt(score) + ').'));
  }

  // Under the conditional line the inspectorate carries a clause of responsibility before the Sejm (P: institution +1).
  function offerProgramme(S, variant) {
    const programme = Object.assign({}, CONCESSIONS[variant].programme);
    if (variant === 'inspectorate' && S.actors.pps.strategy.pils_influence === 'conditional') programme.institution = 1;
    return programme;
  }

  // One commit: an own initiative costs 1 T, the answer in an open political crisis 0 T. The military function is
  // executed at once; the inspectorate needs its law, filed now; the premiership makes Piłsudski a candidate of the
  // one formation of a cabinet of 8.8 (P: the next one), which costs no second T. A change of variant renegotiates
  // the one agreement; the relief of pressure comes once per agreement and crisis.
  function concessionChoose(Q, variant) {
    const status = concessionStatus(Q, variant);
    if (!status.available) throw new Error('concessionChoose: ' + variant + ': ' + status.reason);
    const S = Q.S, t = Q.time;
    party.syncMirrors(Q);
    if (!inCrisis(S)) rules.commitMainAction(Q, 'government.pils_agreement.' + variant, {variant: variant});
    else S.history.actions.push({t: t, action_id: 'government.pils_agreement.' + variant, cost_t: 0});
    if (variant === 'refuse') {
      S.actors.pilsudski.history.push({t: t, kind: 'refused'});
      Q.pl_pils_result = L('PPS refuses concessions and offers a civilian cabinet. There is no free relief of pressure; a first new civil obligation may lower it once.',
        'PPS odmawia ustępstw i proponuje gabinet cywilny. Nie ma darmowego zmniejszenia presji; pierwsze nowe zobowiązanie cywilne może ją raz obniżyć.');
      return null;
    }
    const spec = CONCESSIONS[variant];
    let agreement = pilsAgreement(S);
    if (!agreement || agreement.status !== 'active') {
      const id = 'agr-pilsudski-' + (S.actors.pilsudski.history.length + 1) + '-t' + t;
      agreement = {id: id, kind: 'pilsudski', parties: ['pps', 'pilsudski'], cabinet_id: S.cabinet.id, signed_at: t, status: 'active',
        variant: variant, force_ids: spec.loyalty_limit > 0 ? (spec.forces || [OVERSIGHT_FORCE]).slice() : [], obligations: [], execution_started_at: null,
        review_at: null, open_breach: false, loyalty_moved: 0, tension: 0, warning_issued: false, ultimatum: null, extensions_used: 0,
        responsibility: {pps: 1}, response: null, history: [{t: t, kind: 'signed', variant: variant}]};
      S.agreements[id] = agreement;
      S.actors.pilsudski.agreement_id = id;
    } else {
      agreement.history.push({t: t, kind: 'renegotiated', from: agreement.variant, to: variant});
      agreement.variant = variant;
      for (const forceId of spec.loyalty_limit > 0 ? (spec.forces || [OVERSIGHT_FORCE]) : []) {
        if (agreement.force_ids.indexOf(forceId) < 0) agreement.force_ids.push(forceId);
      }
    }
    S.actors.pilsudski.history.push({t: t, kind: 'agreed', variant: variant, agreement_id: agreement.id});
    // Z — 1.02: the inspectorate is a decision of the ministry like the military function, in force at once (no vote).
    if (variant === 'military_function' || variant === 'inspectorate') executeAgreement(Q, agreement, t);
    else if (variant === 'pils_premier') {
      agreement.law_id = null;
      Q.pl_pils_result = L('Piłsudski accepts the premiership on the programme of a legal cabinet. He becomes a candidate of the next formation of a ' +
        'cabinet (8.8), which costs no second action; the relief comes only after his real appointment.', 'Piłsudski przyjmuje premierostwo na programie ' +
        'legalnego gabinetu. Staje się kandydatem przy następnym formowaniu gabinetu, które nie kosztuje drugiej akcji; złagodzenie przychodzi dopiero ' +
        'po jego rzeczywistym powołaniu.');
    }
    party.writeMirrors(Q);
    return agreement;
  }

  // Stage 8 (P; 16.7 "an accepted cabinet executor", the B run of M02): a cabinet that accepted PPS's demand for a
  // compromise with Piłsudski carries it out as its own initiative of 17.16.4. It is the military function under
  // civilian control only; Piłsudski must accept it as on the card, and the relief, the review after 6 M and the
  // loyalty limit are the card's. A refusal voids the promise with its reason, without a breach.
  function cabinetConcession(Q, t, obligation, variant) {
    const S = Q.S, spec = CONCESSIONS[variant];
    const refuse = reason => {
      obligation.status = 'void';
      obligation.void_reason = reason;
      S.actors.pilsudski.history.push({t: t, kind: 'cabinet_compromise_refused', obligation_id: obligation.id, reason: reason});
      return {executed: false, reason: reason};
    };
    if (!spec || variant !== 'military_function') return refuse('only a military function under civilian control');
    const current = pilsAgreement(S);
    if (current && current.status === 'active') return refuse('an agreement with Piłsudski already exists');
    if ((S.actors.relations.pilsudski || 0) < spec.relation) return refuse('Piłsudski’s relation is below ' + spec.relation);
    const score = pilsScore(S, offerProgramme(S, variant), true);
    if (score < 60) return refuse('Piłsudski does not accept the compromise (score ' + fmtEn(score) + ')');
    party.syncMirrors(Q);
    const id = 'agr-pilsudski-' + (S.actors.pilsudski.history.length + 1) + '-t' + t;
    const agreement = {id: id, kind: 'pilsudski', parties: ['pps', 'pilsudski'], cabinet_id: S.cabinet.id, signed_at: t, status: 'active',
      variant: variant, force_ids: spec.loyalty_limit > 0 ? (spec.forces || [OVERSIGHT_FORCE]).slice() : [], obligations: [], execution_started_at: null,
      review_at: null, open_breach: false, loyalty_moved: 0, tension: 0, warning_issued: false, ultimatum: null, extensions_used: 0,
      responsibility: {pps: 0.5}, response: null, executor: 'cabinet', obligation_id: obligation.id,
      history: [{t: t, kind: 'signed', variant: variant, by: 'cabinet'}]};
    S.agreements[id] = agreement;
    S.actors.pilsudski.agreement_id = id;
    S.actors.pilsudski.history.push({t: t, kind: 'agreed', variant: variant, agreement_id: id, by: 'cabinet'});
    executeAgreement(Q, agreement, t);
    obligation.fulfillment = 1;
    obligation.last_checked = t;
    party.writeMirrors(Q);
    return {executed: true, agreement_id: id};
  }

  // The inspectorate needs the change of the law that sets its competences (16.7): PPS files it at once through
  // the procedure of 7.2; its execution starts when the law takes effect. A refused law ends the offer without
  // relief and without +8 — no culpable break.
  function fileInspectorate(Q, agreement, t) {
    const S = Q.S;
    const bill = projects.submitLaw(Q, {kind: 'pils_inspectorate', title: 'The competences of an independent inspectorate of the army',
      sponsor: 'pps', programme: offerProgramme(S, 'inspectorate')});
    agreement.law_id = bill.id;
    agreement.history.push({t: t, kind: 'law_filed', law_id: bill.id});
    if (bill.status === 'enacted') executeAgreement(Q, agreement, t);
    else if (bill.status === 'rejected') lawFailed(agreement, bill, t, Q);
    else Q.pl_pils_result = L('The law on the inspectorate passed the Sejm and goes to the Senate; its effects come when it takes effect.',
      'Ustawa o inspektoracie przeszła przez Sejm i trafia do Senatu; jej skutki nastąpią, gdy wejdzie w życie.');
    return bill;
  }

  function lawFailed(agreement, bill, t, Q) {
    agreement.status = 'failed';
    agreement.ended_at = t;
    agreement.history.push({t: t, kind: 'law_failed', law_id: bill.id, reason: bill.reason});
    if (Q) Q.pl_pils_result = L('The Sejm refused the law on the inspectorate (' + bill.reason + '): the offer ends without relief and without a new conflict.',
      'Sejm odrzucił ustawę o inspektoracie (' + rules.storedText(bill.reason) + '): oferta kończy się bez złagodzenia i bez nowego konfliktu.');
  }

  // The start of execution (16.7): the relief of pressure once per agreement and once per crisis (the open military
  // case), the relation +4, the factions, and the nominations of the variant — at most its limit of loyalty to
  // Piłsudski in its groups, counted over the whole agreement, never repeated. A renegotiated variant executes its
  // nominations without a second relief. The executed agreement closes the military case it resolves.
  function executeAgreement(Q, agreement, t) {
    const S = Q.S, spec = CONCESSIONS[agreement.variant];
    if (agreement.execution_started_at === null) {
      agreement.execution_started_at = t;
      agreement.review_at = t + REVIEW_MONTHS;
    }
    const open = politics.openMilitaryCase(S);
    const crisisId = open ? open.id : 'no_case:' + agreement.id;
    // P: the relief, the relation and the Piłsudczycy's answer are Piłsudski's satisfaction with the agreement, once;
    // the Centrum objects to the inspectorate itself, so a renegotiated inspectorate still meets it, once.
    let small = '';
    if (!agreement.relief_applied && S.actors.pilsudski.relief_case_ids.indexOf(crisisId) < 0) {
      // Z — 1.02 (decision 3A): the smaller effects stay and the result names them.
      small = L(' Relations with Piłsudski improve (+4) and the Piłsudczycy of PPS calm down (' + spec.pilsudczycy + ').',
        ' Stosunki z Piłsudskim się poprawiają (+4), a piłsudczycy w PPS się uspokajają (' + spec.pilsudczycy + ').').replace(/\(-/g, '(−');
      agreement.relief_applied = true;
      S.actors.pilsudski.relief_case_ids.push(crisisId);
      politics.applyImpulse(Q, 'pils_agreement_relief:' + crisisId, -spec.relief, 'military_agreement_relief');
      government.changeRelation(Q, 'pilsudski', 4, 'pils_agreement:' + agreement.id);
      government.factionReactions(Q, [{faction: 'pilsudczycy', dissent: spec.pilsudczycy}],
        {id: 'pils_agreement:' + agreement.id + ':pilsudczycy', kind: 'pils_agreement', reverse: null});
    }
    const centrumCause = 'pils_agreement:' + agreement.id + ':centrum';
    if (spec.centrum && S.actors.pps.strategy.pils_influence !== 'support' && !S.actors.pps.reactions.some(r => r.cause === centrumCause)) {
      government.factionReactions(Q, [{faction: 'centrum', dissent: spec.centrum}], {id: centrumCause, kind: 'pils_agreement', reverse: null});
      small += L(' The Centrum of PPS protests (+' + spec.centrum + ').', ' Centrum w PPS protestuje (+' + spec.centrum + ').');
    }
    // Z — 1.02: the limit counts for each group over the whole agreement; an agreement of an older game counted one total.
    if (!agreement.loyalty_moved_by) {
      agreement.loyalty_moved_by = {};
      if (agreement.force_ids.length) agreement.loyalty_moved_by[agreement.force_ids[0]] = agreement.loyalty_moved || 0;
    }
    for (const forceId of agreement.force_ids) {
      const force = forceOf(S, forceId), limit = spec.loyalty_limit;
      const room = Math.max(0, limit - (agreement.loyalty_moved_by[forceId] || 0));
      if (room <= 0) continue;
      const before = force.loyalty_pils;
      const moved = shiftLoyalty(force, 'loyalty_pils', room);
      shiftKnown(S, forceId, force.loyalty_pils - before);
      agreement.loyalty_moved_by[forceId] = (agreement.loyalty_moved_by[forceId] || 0) + moved;
      agreement.loyalty_moved += moved;
    }
    if (open) politics.closeCase(Q, open.id, 'pils_agreement:' + agreement.id);
    agreement.history.push({t: t, kind: 'executed', variant: agreement.variant});
    Q.pl_pils_result = L('The agreement with Piłsudski is being executed: ' + spec.name + '. It is reviewed after six months.',
      'Porozumienie z Piłsudskim jest wykonywane: ' + concessionName(agreement.variant) + '. Przegląd nastąpi po sześciu miesiącach.') + small;
  }

  // The review after six months (16.8.1): an extension on unchanged terms scored ≥60 by Piłsudski, with the competent
  // executor, gives review_at + 6 without a new relief; a refused one lets the agreement expire, without +8. It is
  // decided in the settlement of the last month of the term, so the protection has no gap at review_at.
  function reviewAgreements(Q, t) {
    const S = Q.S, agreement = pilsAgreement(S);
    if (!agreement || agreement.status !== 'active' || agreement.review_at === null || t + 1 < agreement.review_at) return null;
    // The competent executor: PPS in the cabinet with Military Affairs; for the premiership, his own active cabinet; for
    // the compromise carried out by the cabinet (stage 8, 16.7), that same cabinet while it governs (decision A3).
    const competent = agreement.executor === 'cabinet' ? !!S.cabinet && S.cabinet.status === 'active' && S.cabinet.id === agreement.cabinet_id :
      agreement.variant === 'pils_premier' ? !!S.cabinet && S.cabinet.pm === 'pilsudski' && S.cabinet.status === 'active' :
      !!S.cabinet && S.cabinet.status === 'active' && S.cabinet.partner_ids.indexOf('pps') >= 0 && S.cabinet.portfolios.reichswehr === 'pps';
    const score = pilsScore(S, offerProgramme(S, agreement.variant), true);
    if (competent && score >= 60) {
      agreement.review_at += REVIEW_MONTHS;
      agreement.history.push({t: t, kind: 'extended', review_at: agreement.review_at});
      return 'extended';
    }
    agreement.status = 'expired';
    agreement.ended_at = t;
    agreement.history.push({t: t, kind: 'expired', competent: competent, score: round(score, 2)});
    return 'expired';
  }

  // A culpable break of the agreement (16.7): one personal-conflict impulse +8 and a case of the broken clause.
  function breakAgreement(Q, reason) {
    const S = Q.S, agreement = pilsAgreement(S);
    if (!agreement || agreement.status !== 'active') return false;
    agreement.status = 'breached';
    agreement.open_breach = true;
    agreement.history.push({t: Q.time, kind: 'breach', reason: reason || ''});
    politics.applyImpulse(Q, 'pils_agreement_breach:' + agreement.id, politics.IMPULSES.personal_conflict, 'personal_conflict');
    politics.openCase(Q, {id: 'military_breach:' + agreement.id, kind: 'military', subject: 'the broken agreement with Piłsudski'});
    return true;
  }

  // The protective agreement of 16.8.1 (`credibleStandDownAgreement`).
  function credibleStandDown(S, t) {
    const a = pilsAgreement(S);
    if (!a || a.status !== 'active' || a.execution_started_at === null || t < a.execution_started_at || a.open_breach) return false;
    if (a.variant === 'pils_premier') return !!S.cabinet && S.cabinet.pm === 'pilsudski' && S.cabinet.status === 'active';
    return t < a.review_at;
  }

  // ---- The coup F, profile coup_f_v1 (16.4–16.8, the approved solution of M08; card catalogue 9.15) -------------

  // The numbers are P of the approved structure (16.8, Z — 24 IX 2026); the army groups are synthetic. The mediator of
  // the game, the marshal of the Sejm, has a historical basis: Rataj mediated on the evening of 12 V 1926; the change of
  // cabinet corresponds to the cabinet of Bartel of 15 V 1926 (stage 8, 8f; HISTORICAL_SOURCES.md). The resolution below
  // is the engine of analysis/m08-coup-profile/check.cjs (`resolve`), made resumable at the one decision F9.
  const COUP_PROFILE_ID = 'coup_f_v1';
  const COUP_WINDOW_FROM = rules.timeOf(1926, 3); // 16.8.1 (P): the Normal scenario opens the window on 1 III 1926
  const COUP_GATES = Object.freeze({crisis: 55, cancel: 40, attempt: 65, capacity: 30, cooldown: 3});
  const STANCE_SIDE = Object.freeze({support_pils: 'pils', defend_legal: 'legal', mediate: 'neutral'});
  const COMMITMENTS = Object.freeze(['none', 'rail', 'militia', 'both']);
  const COUP_OFFERS = Object.freeze([
    {id: 'coup.offer.military_function', army: 0, institution: 0, fn: 2, removal: -2, cabinet: 2, keeps_cabinet: true, needs_sejm: false},
    {id: 'coup.offer.inspectorate_law', army: -2, institution: 0, fn: 2, removal: -2, cabinet: 2, keeps_cabinet: true, needs_sejm: true},
    {id: 'coup.offer.cabinet_change', army: -1, institution: 0, fn: 2, removal: 2, cabinet: -2, keeps_cabinet: false, needs_sejm: false},
  ]);

  const oppSide = side => (side === 'pils' ? 'legal' : 'pils');

  // ---- The coup in one comparison (Z — 1.03, the user's decisions 1B, 2B, 3B and 4A of 7 XI 2026; P) ---------------------
  // As the March on Berlin of the German original: the forces of the two sides are compared once. The army is one body; a
  // hidden draw decides how many of the officers loyal to each side really move (80–120%), and the player never sees it. The
  // organisations of PPS join the side it supports: the Milicja with 1.5 times its force of 13.3, and the strike of the
  // railway workers that holds back the trains of the other side. A side with 1.2 times the force of the other wins; between
  // them the two sides reach a settlement while the institutions still work, else the conflict drags on.
  const COUP_TURNOUT = Object.freeze({low: 0.80, span: 0.40});
  const COUP_VICTORY = 1.20;
  const COUP_SETTLEMENT_DEMOCRACY = 45;
  const MILITIA_COUP_FACTOR = 1.5;
  const STRIKE_FACTOR = 1 / 200, STRIKE_CAP = 0.25;

  // cfg: strength, readiness, command, loyalty {pils, legal}, turnout {pils, legal}, stance ('pils'|'legal'|'neutral'), militia_F,
  // rail_base, settlement (institutions able to carry one), offers (feasible ids), objective {pils, legal}, no_pps (the
  // counterfactual without the organisations of PPS).
  function resolveCoup(cfg) {
    const army = Math.max(0, cfg.strength) * cfg.readiness * cfg.command;
    const F = {pils: army * cfg.loyalty.pils * cfg.turnout.pils, legal: army * cfg.loyalty.legal * cfg.turnout.legal};
    const side = cfg.stance === 'pils' || cfg.stance === 'legal' ? cfg.stance : null;
    const fighting = !cfg.no_pps && !!side;
    const militiaF = fighting ? (cfg.militia_F || 0) * MILITIA_COUP_FACTOR : 0;
    const strike = fighting ? Math.min(STRIKE_CAP, (cfg.rail_base || 0) * STRIKE_FACTOR) : 0;
    if (fighting) {
      F[side] += militiaF;
      F[oppSide(side)] *= 1 - strike;
    }
    // No force on either side is no military advantage of anyone.
    const ratio = F.legal > 0 ? F.pils / F.legal : F.pils > 0 ? Infinity : 1;
    let outcome, offer = null;
    if (ratio >= COUP_VICTORY && cfg.objective.pils) outcome = 'pils_victory';
    else if (ratio <= 1 / COUP_VICTORY && cfg.objective.legal) outcome = 'legal_victory';
    else if (cfg.settlement && cfg.offers.length) {
      outcome = 'constitutional_compromise';
      const prefer = F.pils >= F.legal ? 'coup.offer.cabinet_change' : 'coup.offer.inspectorate_law';
      offer = cfg.offers.indexOf(prefer) >= 0 ? prefer : cfg.offers[0];
    } else {
      outcome = 'prolonged_conflict';
    }
    return {stance: cfg.stance || null, fighting: fighting, F: {pils: round(F.pils, 6), legal: round(F.legal, 6)}, ratio: round(ratio, 6),
      militia_F: round(militiaF, 6), strike: round(strike, 6), outcome: outcome, offer: offer, fought: outcome === 'prolonged_conflict' ? 4 : 2};
  }

  // 16.8.7: the outcomes ordered by the benefit of the side PPS supports.
  const COUP_RANK = Object.freeze({
    pils: {pils_victory: 3, constitutional_compromise: 2, prolonged_conflict: 1, legal_victory: 0},
    legal: {legal_victory: 3, constitutional_compromise: 2, prolonged_conflict: 1, pils_victory: 0},
  });

  // The contribution of PPS: the same draw without its organisations (16.8.7).
  function contributionOf(res, without) {
    if (res.stance !== 'pils' && res.stance !== 'legal') return 'none';
    const rank = COUP_RANK[res.stance];
    if (rank[res.outcome] > rank[without.outcome]) return 'decisive';
    if (rank[res.outcome] < rank[without.outcome]) return 'adverse';
    return 'none';
  }

  // ---- The coup in the game: gates, F3–F11 --------------------------------------------------------------------

  const coupRecord = S => S.coup.attempt || null;

  function hasOverdueClause(a, t) {
    return (a.obligations || []).some(o => o.due_at !== null && o.due_at !== undefined && o.due_at < t && o.status !== 'fulfilled' && o.fulfillment < 1);
  }

  // 16.8.1: a force ready to strike (Z — 1.03: at least a quarter of the army follows Piłsudski); the window from 1 III 1926.
  const STRIKE_FORCE_SHARE = 0.25;
  function initialStrikeForce(S, t) {
    const democracy = S.politics ? S.politics.democracy : 60;
    return S.security.forces.some(f => effectiveLoyalty(f, democracy).pils >= STRIKE_FORCE_SHARE && readinessOf(f, t) >= 0.50 &&
      f.base_strength_F - f.losses_F > 0);
  }

  function coupGates(Q, now) {
    const S = Q.S, C = S.coup, a = pilsAgreement(S);
    const standDown = credibleStandDown(S, now) && !(a && hasOverdueClause(a, now));
    const g = {pressure: C.pressure >= COUP_GATES.attempt, capacity: capacity(S, now) >= COUP_GATES.capacity,
      window: now >= COUP_WINDOW_FROM && initialStrikeForce(S, now), stand_down: standDown,
      active: C.attempt_id !== null && C.phase !== 'resolved', cooldown: now < C.next_attempt_available_at};
    g.allowed = g.pressure && g.capacity && g.window && !g.stand_down && !g.active && !g.cooldown;
    return g;
  }

  // The gate check of 4.2 step 8, after the pressure of this month: pressure ≥55 is a political crisis, a protective
  // agreement at work or pressure below 40 calls the preparations off (3 M before a new attempt); all the gates of
  // 16.2 declare the attempt — a jump of pressure passes through the political crisis in one check.
  function checkCoupGates(Q, t) {
    const S = Q.S, C = S.coup, now = t + 1;
    if (S.chapter.status === 'ended' || (C.attempt_id !== null && C.phase !== 'resolved')) return C.phase;
    if (C.phase === 'resolved') return C.phase;
    C.log = C.log || [];
    const standDown = credibleStandDown(S, now);
    if (C.phase === 'political_crisis' && (standDown || C.pressure < COUP_GATES.cancel)) {
      C.phase = 'dormant';
      C.next_attempt_available_at = now + COUP_GATES.cooldown;
      C.log.push({t: t, kind: 'preparations_called_off', reason: standDown ? 'protective_agreement' : 'pressure_below_40', next_attempt_available_at: now + COUP_GATES.cooldown});
      return C.phase;
    }
    if (C.phase === 'dormant' && C.pressure >= COUP_GATES.crisis && !standDown) {
      C.phase = 'political_crisis';
      C.log.push({t: t, kind: 'political_crisis', pressure: round(C.pressure, 4)});
    }
    const gates = coupGates(Q, now);
    if (C.phase === 'political_crisis' && gates.allowed) declareAttempt(Q, now, gates);
    return C.phase;
  }

  function declareAttempt(Q, now, gates) {
    const S = Q.S, C = S.coup;
    const n = (C.log || []).filter(e => e.kind === 'attempt_declared').length + 1;
    C.attempt_id = 'coup-' + n + '-t' + now;
    C.phase = 'attempt_declared';
    C.stance = null;
    C.commitments = [];
    C.round = 0;
    C.outcome = null;
    C.f9 = null;
    C.settlement = null;
    C.pps_contribution = null;
    C.concessions_to_pps = [];
    C.effects_complete = false;
    const democracy = S.politics.democracy;
    C.attempt = {id: C.attempt_id, profile_id: COUP_PROFILE_ID, declared_at: now, democracy: democracy,
      loyalty_shift: round(clip(0.0025 * (democracy - 60), -0.10, 0.10), 6), pressure: round(C.pressure, 4), capacity: round(capacity(S, now), 4),
      known: knownView(S), stance: null, commitment: null, factions: null, organisations: null, sides: null, rolls: {}, resolution: null,
      counterfactual: null, effects: null, continuation_requirements: []};
    C.log.push({t: now, kind: 'attempt_declared', attempt_id: C.attempt_id, gates: gates});
    return C.attempt;
  }

  // The sequence F3–F11 is due from the declaration until the chapter ends with its report (19.1).
  function coupDue(Q) {
    const S = Q.S;
    if (!ready(Q) || S.chapter.status === 'ended') return false;
    const C = S.coup;
    return C.attempt_id !== null && C.phase !== 'dormant' && C.phase !== 'political_crisis';
  }

  // F3 → F4: the attempt is announced; the stance of PPS comes next.
  function coupBegin(Q) {
    const C = Q.S.coup;
    if (C.phase === 'attempt_declared') C.phase = 'pps_stance';
    return C.phase;
  }

  // 16.8.7 (P): the reactions of the factions to the stance of F4, once at its confirmation.
  function stanceReactions(S, stance) {
    const line = S.actors.pps.strategy.pils_influence;
    if (stance === 'support_pils') {
      const centrum = line === 'oppose_military_interference' ? 12 : (line === 'support' || line === 'conditional' ? 3 : 8);
      return [{faction: 'centrum', dissent: centrum}, {faction: 'lewica', dissent: 8}, {faction: 'pilsudczycy', dissent: -5}];
    }
    if (stance === 'defend_legal') return [{faction: 'pilsudczycy', dissent: line === 'support' ? 12 : 8}, {faction: 'centrum', dissent: -3}];
    return [{faction: 'pilsudczycy', dissent: 3}];
  }

  // The preview of F4: the reactions and the factions whose dissent would reach 60 (a split without E3 in F10+F11).
  function stancePreview(S, stance) {
    const reactions = stanceReactions(S, stance);
    const risk = reactions.filter(r => r.dissent > 0 && S.actors.pps.factions[r.faction].dissent + r.dissent >= 60).map(r => r.faction);
    return {reactions: reactions, split_risk: risk};
  }

  function coupStanceStatus(Q, stance) {
    const S = Q.S;
    if (!STANCE_SIDE[stance]) return no(L('Unknown stance.', 'Nieznane stanowisko.'));
    if (!coupDue(Q) || S.coup.phase !== 'pps_stance') return no('');
    return OK;
  }

  function coupStance(Q, stance) {
    const status = coupStanceStatus(Q, stance);
    if (!status.available) throw new Error('coupStance: ' + stance + ': ' + status.reason);
    const S = Q.S, C = S.coup, A = C.attempt;
    party.syncMirrors(Q);
    const reactions = stanceReactions(S, stance);
    const before = {};
    for (const r of reactions) before[r.faction] = S.actors.pps.factions[r.faction].dissent;
    government.factionReactions(Q, reactions, {id: 'coup_f4:' + C.attempt_id, kind: 'coup_stance', reverse: null});
    const after = {};
    for (const r of reactions) after[r.faction] = S.actors.pps.factions[r.faction].dissent;
    C.stance = stance;
    A.stance = stance;
    A.factions = {reactions: reactions, before: before, after: after,
      split: reactions.filter(r => r.dissent > 0 && after[r.faction] >= 60 && after[r.faction] > before[r.faction]).map(r => r.faction)};
    S.history.actions.push({t: Q.time, action_id: 'coup.stance.' + stance, attempt_id: C.attempt_id, cost_t: 0});
    C.phase = 'organization_commitment';
    party.writeMirrors(Q);
    return A;
  }

  // 16.8.2: the people of the Milicja not committed to another matter (13.4: one matter before AS, three with AS).
  function militiaPeopleFree(S) {
    const m = S.militia;
    if (m.banned || !(m.strength > 0)) return 0;
    const committed = unions.records(S, ['active', 'settlement_pending']).filter(r => r.protection).reduce((n, r) => n + (r.protection.people || 0), 0);
    return Math.max(0, m.strength - committed);
  }

  // 16.8.2: the compliance of 10.3 for the line of F4 (P: support of Piłsudski reads the opposite of the alignment
  // with the legal institutions) — since Z — 0.89 for the railway workers only; AS adds 0.15 (13.4, M15) to a stage 2.
  function coupCompliance(S, alignment, stance, dissent, stage) {
    const toward = stance === 'support_pils' ? 100 - alignment : alignment;
    const c = party.compliance(toward, party.cohesion(S), dissent);
    return stage === 2 ? Math.min(1, c + 0.15) : c;
  }

  // Z — 0.89 (decision 2A of 24 X 2026): every free member answers the call; the force is that of 13.3 (×1.2 as AS).
  function militiaCall(S, stance) {
    const m = S.militia, available = militiaPeopleFree(S);
    const force = party.militiaForce(S, {committed: m.strength - available}).force;
    return {available: available, compliance: 1, executing: available, force: round(force, 6), stage: m.stage};
  }

  // 16.8.2: the railway call — the base share in every round; the plan is fixed at F5. Z — 0.86 (decision 9 of 24 X 2026): a
  // political strike of one month costs nothing; the reach, readiness and compliance of the railway workers decide it.
  function railCall(S, stance) {
    const rail = S.unions.rail;
    const compliance = coupCompliance(S, rail.alignment.legal_institutions, stance, rail.dissent, 1);
    const base = rail.reach * rail.readiness * (1 - (rail.fatigue || 0) / 100) / 100 * compliance;
    const byRound = [0, 1, 2, 3].map(() => round(base, 6));
    return {base: round(base, 6), compliance: round(compliance, 6), by_round: byRound, readiness: rail.readiness};
  }

  function coupCommitStatus(Q, commitment) {
    const S = Q.S, C = S.coup;
    if (COMMITMENTS.indexOf(commitment) < 0) return no(L('Unknown commitment.', 'Nieznane zaangażowanie.'));
    if (!coupDue(Q) || C.phase !== 'organization_commitment') return no('');
    if (C.stance === 'mediate' && (commitment === 'rail' || commitment === 'both')) return no(L('A neutral PPS does not block transports for one side.', 'Neutralna PPS nie blokuje transportów jednej ze stron.'));
    if ((commitment === 'militia' || commitment === 'both') && militiaPeopleFree(S) <= 0) {
      return no(L('The Milicja has no free people: it is banned, empty or already assigned to another matter.', 'Milicja nie ma wolnych ludzi: jest objęta zakazem, pusta albo już przydzielona do innej sprawy.'));
    }
    return OK;
  }

  // 16.8.5: the offers the institutions can carry now.
  function feasibleOffers(Q) {
    const S = Q.S, head = Q.polish_presidency && Q.polish_presidency.current;
    const headOk = !!head && !!head.holder_id;
    const cabinetOk = !!S.cabinet && (S.cabinet.status === 'active' || S.cabinet.status === 'caretaker');
    return COUP_OFFERS.filter(o => headOk && (o.keeps_cabinet ? cabinetOk : true) && !(o.needs_sejm && S.parliament.dissolved_at)).map(o => o.id);
  }

  // F5: the commitment of the organisations; then the hidden draw and the one comparison, and the outcome at once (Z — 1.03).
  function coupCommit(Q, commitment) {
    const status = coupCommitStatus(Q, commitment);
    if (!status.available) throw new Error('coupCommit: ' + commitment + ': ' + status.reason);
    const S = Q.S, C = S.coup, A = C.attempt, t = Q.time;
    const stance = C.stance, side = STANCE_SIDE[stance];
    const useRail = commitment === 'rail' || commitment === 'both';
    const useMilitia = commitment === 'militia' || commitment === 'both';
    const militia = useMilitia ? militiaCall(S, stance) : null;
    if (useMilitia) rules.seedProfile(Q, 'militarism', 2, 'coup_militia');
    const rail = useRail ? railCall(S, stance) : null;
    C.commitments = COMMITMENTS.slice(1).filter(c => (c === 'rail' && useRail) || (c === 'militia' && useMilitia));
    A.commitment = commitment;
    A.organisations = {militia: militia, rail: rail, militia_task: useMilitia ? (side === 'neutral' ? 'protection' : 'confrontation') : null};
    if (militia && militia.executing > 0) {
      S.militia.assignments = (S.militia.assignments || []).filter(a => a.id !== 'coup:' + C.attempt_id)
        .concat([{id: 'coup:' + C.attempt_id, task: A.organisations.militia_task, people: militia.executing}]);
    }
    // The hidden draw: how many of the officers loyal to each side really move (recorded, never shown).
    const army = forceOf(S, ARMY), e = effectiveLoyalty(army, A.democracy), turnout = {};
    for (const s of ['pils', 'legal']) {
      const rollId = 'coup_' + C.attempt_id + ':' + s + ':turnout';
      const u = rules.roll(S, rollId);
      A.rolls[rollId] = u;
      turnout[s] = round(COUP_TURNOUT.low + COUP_TURNOUT.span * u, 6);
    }
    const head = Q.polish_presidency && Q.polish_presidency.current;
    const cabinetOk = !!S.cabinet && (S.cabinet.status === 'active' || S.cabinet.status === 'caretaker');
    const cfg = {strength: Math.max(0, army.base_strength_F - army.losses_F), readiness: readinessOf(army, t), command: army.command,
      loyalty: {pils: round(e.pils, 6), legal: round(e.legal, 6)}, turnout: turnout, stance: side,
      // Z — 1.07: militarism makes the Milicja count a quarter more in the coup.
      militia_F: militia && side !== 'neutral' ? militia.force * (rules.profileActive(S, 'militarism') ? 1.25 : 1) : 0, rail_base: rail ? rail.base : 0,
      settlement: A.democracy >= COUP_SETTLEMENT_DEMOCRACY, offers: feasibleOffers(Q),
      objective: {pils: cabinetOk, legal: !!head && !!head.holder_id && cabinetOk}};
    A.cfg = cfg;
    A.resolution = resolveCoup(cfg);
    C.phase = 'execution_and_transport';
    S.history.actions.push({t: t, action_id: 'coup.commitment.' + commitment, attempt_id: C.attempt_id, cost_t: 0});
    finishCoup(Q);
    return A;
  }

  // 16.8.7: the conditions of PPS recorded before the attempt — the conditional line with its guarantees (10.7) or an
  // active agreement with the side it supports.
  function recordedConditions(S, stance) {
    if (stance === 'support_pils') {
      const a = pilsAgreement(S);
      if (a && a.status === 'active') return [{kind: 'agreement', agreement_id: a.id, terms: CONCESSIONS[a.variant] ? CONCESSIONS[a.variant].name : a.variant}];
      if (S.actors.pps.strategy.pils_influence === 'conditional') {
        return [{kind: 'line', line: 'conditional', terms: 'civilian control of the army and the responsibility of the government before the Sejm'}];
      }
      return [];
    }
    if (stance === 'defend_legal' && S.cabinet) {
      return (S.cabinet.agreement_ids || []).map(id => S.agreements[id]).filter(a => a && a.status === 'active' && a.parties.indexOf('pps') >= 0)
        .map(a => ({kind: 'agreement', agreement_id: a.id, terms: 'the obligations of the agreement ' + a.id}));
    }
    return [];
  }

  // F10+F11: the counterfactual contribution, the concessions, the reactions and splits, relations, institutions,
  // production, the costs and losses; once, recorded for the report (16.8.7). The chapter then ends (19.1).
  function finishCoup(Q) {
    const S = Q.S, C = S.coup, A = C.attempt, res = A.resolution, t = Q.time;
    if (C.effects_complete) return A;
    const side = res.stance;
    // The same rolls without the organisations of PPS: no Milicja, no delays, no F9 (the settlement is automatic).
    const without = resolveCoup(Object.assign({}, A.cfg, {no_pps: true}));
    A.counterfactual = {outcome: without.outcome, offer: without.offer};
    C.pps_contribution = contributionOf(res, without);
    const organisations = A.organisations || {};
    const executed = !!((organisations.militia && organisations.militia.executing > 0 && side !== 'neutral') ||
      (organisations.rail && organisations.rail.base > 0 && res.fighting));
    const conditions = side === 'pils' || side === 'legal' ? recordedConditions(S, C.stance) : [];
    const won = res.outcome === side + '_victory';
    if (won && executed && conditions.length && C.pps_contribution === 'decisive') {
      C.concessions_to_pps = conditions.map(c => Object.assign({}, c, {status: 'accepted'}));
      A.continuation_requirements.push('concessions_to_pps: the winner owes the recorded conditions of PPS');
    } else {
      C.concessions_to_pps = [];
      A.conditions_not_accepted = conditions;
    }
    const effects = {factions: A.factions, splits: [], relations: [], institutions: null, production: null, rail_fund_used: 0,
      militia_lost: 0, forces: []};
    // Splits without E3 (M16): 40% of a faction whose dissent after F4 reached 60, without advisers.
    for (const faction of (A.factions && A.factions.split) || []) {
      const manifest = party.applyDeparture(Q, faction, 0.40, 20, 'coup_split', C.attempt_id);
      effects.splits.push({faction: faction, manifest_id: manifest.id, removed_share: manifest.removed_share, mps: manifest.mps});
    }
    // Relations: with Piłsudski +4 for support and +4 more for an executed share; defence −4 and −4; the parties of the
    // attacked cabinet the opposite; neutrality none.
    if (side === 'pils' || side === 'legal') {
      const sign = side === 'pils' ? 1 : -1, amount = 4 + (executed ? 4 : 0);
      government.changeRelation(Q, 'pilsudski', sign * amount, 'coup:' + C.attempt_id);
      effects.relations.push({actor: 'pilsudski', delta: sign * amount});
      for (const id of ((S.cabinet && S.cabinet.partner_ids) || []).filter(p => p !== 'pps' && S.actors.relations[p] !== undefined)) {
        government.changeRelation(Q, id, -sign * amount, 'coup:' + C.attempt_id);
        effects.relations.push({actor: id, delta: -sign * amount});
      }
    }
    // Institutions by the weights of 15.2, once: violence +10, democracy −2 for the attempt, −2 more for a victory of
    // Piłsudski or a prolonged conflict, +1 when the legal cabinet survived.
    const keeps = res.outcome === 'legal_victory' || (res.outcome === 'constitutional_compromise' && res.offer !== 'coup.offer.cabinet_change');
    const dDemocracy = -2 + (res.outcome === 'pils_victory' || res.outcome === 'prolonged_conflict' ? -2 : 0) + (keeps ? 1 : 0);
    const P = S.politics;
    P.democracy = clip(P.democracy + dDemocracy, 0, 100);
    P.violence = clip(P.violence + VIOLENCE_SERIOUS, 0, 100);
    effects.institutions = {violence: VIOLENCE_SERIOUS, democracy: dDemocracy, legal_cabinet_survived: keeps};
    // Z — 1.03: the days of fighting (2, or 4 when the conflict drags on), the losses of the army and of the Milicja.
    const fought = res.fought;
    const opp = side === 'pils' ? 'legal' : 'pils';
    if (organisations.militia && organisations.militia.executing > 0 && res.fighting && side !== 'neutral') {
      const share = res.F[opp] / Math.max(1, res.F.pils + res.F.legal);
      const lost = Math.min(organisations.militia.executing, Math.round(organisations.militia.executing * 0.08 * fought * share));
      S.militia.strength = Math.max(0, S.militia.strength - lost);
      effects.militia_lost = lost;
    }
    const army = forceOf(S, ARMY), loss = round(0.02 * fought * (res.F.pils + res.F.legal), 6);
    army.losses_F = round((army.losses_F || 0) + loss, 6);
    army.committed_side = res.outcome === 'pils_victory' ? 'pils' : res.outcome === 'legal_victory' ? 'legal' : 'neutral';
    effects.forces.push({id: ARMY, loss: loss, pils: res.F.pils, legal: res.F.legal});
    // Production (16.6): one change after the fighting, −min(8, 0.5 × days + 0.02 × disruption) %.
    const disruption = organisations.rail && res.fighting ? organisations.rail.base * unions.SECTOR_IMPORTANCE.rail / 100 : 0;
    const drop = Math.min(8, 0.5 * fought + 0.02 * disruption);
    if (S.economy) S.economy.output = round(S.economy.output * (1 - drop / 100), 6);
    effects.production = {percent: round(-drop, 6), fighting_rounds: fought, mean_disruption: round(disruption, 6)};
    // The executed settlement (16.8.5).
    if (res.outcome === 'constitutional_compromise') settlementExecuted(Q, res.offer, A);
    if (res.outcome === 'prolonged_conflict') A.continuation_requirements.push('prolonged_conflict');
    if (S.militia.assignments) S.militia.assignments = S.militia.assignments.filter(a => a.id !== 'coup:' + C.attempt_id);
    A.effects = effects;
    C.outcome = res.outcome;
    C.round = fought;
    C.settlement = res.offer;
    C.phase = 'resolved';
    C.effects_complete = true;
    C.log.push({t: t, kind: 'resolved', attempt_id: C.attempt_id, outcome: res.outcome, round: fought});
    party.writeMirrors(Q);
    return A;
  }

  // 16.8.5: what a settlement does at once. The military function names the synthetic post under civilian control
  // (the one agreement of 16.7, executed at the settlement); the inspectorate is a statutory obligation of the
  // continuation; the change of cabinet dismisses the attacked cabinet, and the formation belongs to the continuation.
  function settlementExecuted(Q, offerId, A) {
    const S = Q.S, t = Q.time;
    if (offerId === 'coup.offer.military_function') {
      const id = 'agr-pilsudski-coup-' + S.coup.attempt_id;
      S.agreements[id] = {id: id, kind: 'pilsudski', parties: ['pps', 'pilsudski'], cabinet_id: S.cabinet ? S.cabinet.id : null, signed_at: t,
        status: 'active', variant: 'military_function', force_ids: [OVERSIGHT_FORCE], obligations: [], execution_started_at: t,
        review_at: t + REVIEW_MONTHS, open_breach: false, loyalty_moved: 0, tension: 0, warning_issued: false, ultimatum: null, extensions_used: 0,
        responsibility: {pps: 0}, response: null, relief_applied: true, via: 'coup_settlement', history: [{t: t, kind: 'coup_settlement'}]};
      const agreement = S.agreements[id];
      agreement.loyalty_moved = shiftLoyalty(forceOf(S, OVERSIGHT_FORCE), 'loyalty_pils', CONCESSIONS.military_function.loyalty_limit);
      S.actors.pilsudski.agreement_id = id;
      A.agreement_id = id;
    } else if (offerId === 'coup.offer.inspectorate_law') {
      A.continuation_requirements.push('inspectorate_law: the law on the competences of an independent inspectorate, due by ' +
        dateOf(t + REVIEW_MONTHS) + ' (P)');
    } else if (offerId === 'coup.offer.cabinet_change') {
      if (S.cabinet && S.cabinet.status === 'active') government.cabinetFalls(Q, 'coup_settlement');
      A.continuation_requirements.push('cabinet_formation: a prime minister accepted by the camp of Piłsudski, appointed by the procedure of 8.8');
    }
    A.continuation_requirements.push('settlement_clauses: the troops return to their garrisons; amnesty and no repression of the participants; ' +
      'the Sejm and the calendar of elections are kept' + (A.resolution.f9 ? '; the mobilisation of PPS ends' : ''));
  }

  // The display of F3–F11: what PPS can know before the sides are drawn (16.8.1), then the recorded course.
  // Stage 8: the name opens the sentence of the F10 screen, so it starts with a capital letter.
  const OUTCOME_NAMES = Object.freeze({pils_victory: 'Piłsudski wins', legal_victory: 'The legal government prevails',
    constitutional_compromise: 'A constitutional compromise', prolonged_conflict: 'A prolonged conflict without a winner'});
  const OFFER_NAMES = Object.freeze({'coup.offer.military_function': 'a military function for Piłsudski under civilian control; the cabinet stays',
    'coup.offer.inspectorate_law': 'an independent inspectorate by a law; the cabinet stays',
    'coup.offer.cabinet_change': 'the dismissal of the attacked cabinet and a premier accepted by Piłsudski’s camp'});
  const FORCE_NAMES = Object.freeze({army: 'the army', capital_legal: 'the capital garrison loyal to the government', capital_pils: 'the capital units close to Piłsudski',
    near_reserve: 'the near reserve', remote_reserve: 'the remote reserve (by rail)'});
  const FORCE_NAMES_PL = Object.freeze({army: 'wojsko', capital_legal: 'stołeczny garnizon wierny rządowi', capital_pils: 'oddziały stołeczne bliskie Piłsudskiemu',
    near_reserve: 'bliski odwód', remote_reserve: 'daleki odwód (koleją)'});
  const forceName = id => L(FORCE_NAMES[id], FORCE_NAMES_PL[id]);
  const OUTCOME_NAMES_PL = Object.freeze({pils_victory: 'Piłsudski zwycięża', legal_victory: 'Legalny rząd utrzymuje się',
    constitutional_compromise: 'Kompromis konstytucyjny', prolonged_conflict: 'Przewlekły konflikt bez zwycięzcy'});
  const OFFER_NAMES_PL = Object.freeze({'coup.offer.military_function': 'funkcja wojskowa dla Piłsudskiego pod kontrolą cywilną; gabinet zostaje',
    'coup.offer.inspectorate_law': 'niezależny inspektorat na mocy ustawy; gabinet zostaje',
    'coup.offer.cabinet_change': 'dymisja zaatakowanego gabinetu i premier akceptowany przez obóz Piłsudskiego'});
  const CONTRIBUTION_PL = Object.freeze({decisive: 'rozstrzygający', adverse: 'niekorzystny', accelerating: 'przyspieszający', none: 'żaden'});
  const FACTION_SHORT_PL = Object.freeze({centrum: 'Centrum', lewica: 'Lewica', pilsudczycy: 'Piłsudczycy'});
  // The faction reactions of a coup stance for its description: the change in words, its size in parentheses (Z — 0.53).
  const FACTION_SHORT_EN = Object.freeze({centrum: 'Centrum', lewica: 'Lewica', pilsudczycy: 'Piłsudczycy'});
  const FACTION_GENITIVE_PL = Object.freeze({centrum: 'Centrum', lewica: 'Lewicy', pilsudczycy: 'Piłsudczyków'});
  const reactionText = r => {
    const size = r.dissent > 0 ? ' (+' + r.dissent + ')' : r.dissent < 0 ? ' (−' + Math.abs(r.dissent) + ')' : '';
    return PL() ? 'sprzeciw ' + (FACTION_GENITIVE_PL[r.faction] || r.faction) + (r.dissent > 0 ? ' rośnie' : r.dissent < 0 ? ' spada' : ' się nie zmienia') + size
      : (FACTION_SHORT_EN[r.faction] || r.faction) + ' dissent ' + (r.dissent > 0 ? 'rises' : r.dissent < 0 ? 'falls' : 'stays') + size;
  };
  const SIDES_PL = Object.freeze({legal: 'po stronie rządu', pils: 'po stronie Piłsudskiego', neutral: 'neutralne'});
  const TASKS_PL = Object.freeze({protection: 'ochrona', confrontation: 'konfrontacja'});
  const people = n => n + ' ' + rules.plural(n, 'osoba', 'osoby', 'osób');
  const STORED_PL = Object.freeze({
    'The competences of an independent inspectorate of the army': 'Kompetencje niezależnego inspektoratu wojska',
    'only a military function under civilian control': 'tylko funkcja wojskowa pod kontrolą cywilną',
    'an agreement with Piłsudski already exists': 'porozumienie z Piłsudskim już istnieje',
    'civilian control of the army and the responsibility of the government before the Sejm': 'cywilna kontrola nad wojskiem i odpowiedzialność rządu przed Sejmem',
    'prolonged_conflict': 'konflikt się przeciąga',
    'concessions_to_pps: the winner owes the recorded conditions of PPS': 'zwycięzca jest winien PPS uzgodnione warunki',
    'cabinet_formation: a prime minister accepted by the camp of Piłsudski, appointed by the procedure of 8.8':
      'nowym premierem zostanie ktoś akceptowany przez obóz Piłsudskiego',
  });
  rules.registerStoredText(text => {
    if (STORED_PL[text]) return STORED_PL[text];
    const concession = Object.keys(CONCESSIONS).filter(id => CONCESSIONS[id].name === text)[0];
    if (concession) return CONCESSION_NAMES_PL[concession];
    let m = /^Piłsudski’s relation is below (\d+)$/.exec(text);
    if (m) return 'relacja z Piłsudskim jest poniżej ' + m[1];
    m = /^Piłsudski does not accept the compromise \(score ([\d.]+)\)$/.exec(text);
    if (m) return 'Piłsudski nie przyjmuje kompromisu (ocena ' + m[1].replace('.', ',') + ')';
    m = /^the obligations of the agreement (.+)$/.exec(text);
    if (m) return 'zobowiązania porozumienia ' + m[1];
    m = /^inspectorate_law: the law on the competences of an independent inspectorate, due by (\d+)\/(\d+) \(P\)$/.exec(text);
    if (m) return 'ustawa o kompetencjach niezależnego inspektoratu wojska, w terminie do ' + rules.monthYear(rules.timeOf(+m[2], +m[1]), 'gen');
    m = /^settlement_clauses: the troops return to their garrisons; amnesty and no repression of the participants; the Sejm and the calendar of elections are kept(; the mobilisation of PPS ends)?$/.exec(text);
    if (m) return 'wojska wracają do garnizonów; amnestia i brak represji wobec uczestników; Sejm i kalendarz wyborczy zostają zachowane' +
      (m[1] ? '; mobilizacja PPS się kończy' : '');
    return undefined;
  });

  // Z — 1.03: the pages of the sequence — F3, the stance, the organisations and the outcome; no rounds and no offer to answer.
  function coupStep(S) {
    const C = S.coup, A = C.attempt;
    if (!A) return '';
    if (C.phase === 'attempt_declared') return 'f3';
    if (C.phase === 'pps_stance') return 'f4';
    if (C.phase === 'organization_commitment') return 'f5';
    return 'f10';
  }

  // The army in words (Z — 1.03, decision 4A): what PPS believes of the mood of the officers, from its estimate, never a number.
  function armyWords(S) {
    const army = forceOf(S, ARMY) || S.security.forces[0];
    const known = army ? S.security.known[army.id] : null;
    const pils = known ? known.pils_center : 0.45;
    if (pils >= 0.50) return L('Most officers lean towards Piłsudski.', 'Większość oficerów sprzyja Piłsudskiemu.');
    if (pils >= 0.35) return L('The army is divided; many officers lean towards Piłsudski.', 'Wojsko jest podzielone; wielu oficerów sprzyja Piłsudskiemu.');
    if (pils >= 0.20) return L('Most of the army is loyal to the government.', 'Większość wojska jest wierna rządowi.');
    return L('The army is loyal to the government.', 'Wojsko jest wierne rządowi.');
  }

  const OUTCOME_STORY = Object.freeze({
    pils_victory: ['The rebels took the capital, and the government stepped down.', 'Zamachowcy zajęli stolicę, a rząd ustąpił.'],
    legal_victory: ['The coup collapsed, and the government held on.', 'Zamach się załamał, a rząd się utrzymał.'],
    'coup.offer.cabinet_change': ['After two days of fighting the two sides reached a settlement: the government steps down, and a prime minister accepted by the camp of Piłsudski takes its place.',
      'Po dwóch dniach walk obie strony zawarły ugodę: rząd ustępuje, a jego miejsce zajmie premier akceptowany przez obóz Piłsudskiego.'],
    'coup.offer.inspectorate_law': ['After two days of fighting the two sides reached a settlement: the government stays, and Piłsudski gets an independent inspectorate of the army.',
      'Po dwóch dniach walk obie strony zawarły ugodę: rząd zostaje, a Piłsudski dostaje niezależny inspektorat armii.'],
    'coup.offer.military_function': ['After two days of fighting the two sides reached a settlement: the government stays, and Piłsudski gets a military function under civilian control.',
      'Po dwóch dniach walk obie strony zawarły ugodę: rząd zostaje, a Piłsudski dostaje funkcję wojskową pod kontrolą cywilną.'],
    prolonged_conflict: ['The fighting goes on, and neither side can prevail.', 'Walki trwają, a żadna strona nie może przeważyć.'],
  });

  // What happened, told without numbers: the army, the strike, the Milicja, the outcome and what PPS changed.
  function coupStory(Q) {
    const S = Q.S, C = S.coup, A = C.attempt, res = A.resolution, o = A.organisations || {};
    const parts = [res.F.pils > res.F.legal ? L('More soldiers followed Piłsudski than stayed with the government.', 'Za Piłsudskim poszło więcej żołnierzy, niż zostało przy rządzie.') :
      L('More soldiers stayed with the government than followed Piłsudski.', 'Przy rządzie zostało więcej żołnierzy, niż poszło za Piłsudskim.')];
    if (res.fighting && o.rail && o.rail.base > 0) {
      parts.push(res.strike >= 0.10 ? L('The strike of the railway workers stopped many trains with troops of the other side.', 'Strajk kolejarzy zatrzymał wiele pociągów z wojskiem przeciwnika.') :
        L('The strike of the railway workers held back only a few trains.', 'Strajk kolejarzy zatrzymał tylko nieliczne pociągi.'));
    }
    if (o.militia && o.militia.executing > 0) {
      parts.push(res.fighting ? L('The Milicja of PPS fought on the side of ' + (res.stance === 'legal' ? 'the government' : 'Piłsudski') + '.',
        'Milicja PPS walczyła po stronie ' + (res.stance === 'legal' ? 'rządu' : 'Piłsudskiego') + '.') : L('The Milicja protected our own people.', 'Milicja chroniła naszych ludzi.'));
    }
    const story = OUTCOME_STORY[C.outcome === 'constitutional_compromise' ? C.settlement : C.outcome];
    if (story) parts.push(L(story[0], story[1]));
    if (C.pps_contribution === 'decisive') parts.push(L('It was our organisations that tipped the balance.', 'To nasze organizacje przechyliły szalę.'));
    else if (C.pps_contribution === 'adverse') parts.push(L('Our engagement harmed the side we supported.', 'Nasze zaangażowanie zaszkodziło stronie, którą poparliśmy.'));
    return parts.join(' ');
  }

  function coupView(Q) {
    const S = Q.S, C = S.coup, A = C.attempt;
    if (!A) return;
    Q.pl_coup_phase = C.phase;
    Q.pl_coup_step = coupStep(S);
    Q.pl_coup_army = armyWords(S);
    for (const stance of Object.keys(STANCE_SIDE)) {
      const pv = stancePreview(S, stance);
      Q['pl_coup_' + stance + '_preview'] = pv.reactions.map(reactionText).join(', ') +
        (pv.split_risk.length ? L('; split risk: ', '; ryzyko rozłamu: ') + pv.split_risk.map(f => L(FACTION_SHORT_EN[f] || f, FACTION_SHORT_PL[f] || f)).join(', ') : '');
    }
    for (const c of COMMITMENTS) Q['pl_coup_' + c + '_why'] = coupCommitStatus(Q, c).reason;
    const militia = militiaCall(S, C.stance || 'defend_legal');
    Q.pl_coup_militia_forecast = militia.available > 0 ? L('The Milicja has ' + militia.available + ' people at hand.', 'Milicja ma do dyspozycji ' + people(militia.available) + '.') :
      L('The Milicja has no free people.', 'Milicja nie ma wolnych ludzi.');
    const rail = railCall(S, C.stance || 'defend_legal');
    Q.pl_coup_rail_forecast = rail.base >= 30 ? L('The railway workers are well organised and ready to strike.', 'Kolejarze są dobrze zorganizowani i gotowi do strajku.') :
      rail.base >= 15 ? L('Part of the railway workers will follow the call.', 'Część kolejarzy pójdzie za wezwaniem.') :
        L('Few railway workers will answer the call.', 'Niewielu kolejarzy odpowie na wezwanie.');
    Q.pl_coup_outcome = C.outcome ? L(OUTCOME_NAMES[C.outcome], OUTCOME_NAMES_PL[C.outcome]) : '';
    Q.pl_coup_story = C.outcome && A.resolution ? coupStory(Q) : '';
    const e = A.effects, sign = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
    Q.pl_coup_effects = e ? L('Democracy ', 'Demokracja ') + sign(e.institutions.democracy) + L(', violence +', ', przemoc +') + e.institutions.violence +
      L('; production ', '; produkcja ') + (e.production.percent < 0 ? '−' : '') + fmt(Math.abs(e.production.percent)) + '%' +
      (e.splits.length ? L('; splits: ', '; rozłamy: ') + e.splits.map(x => L(FACTION_SHORT_EN[x.faction] || x.faction, FACTION_SHORT_PL[x.faction] || x.faction)).join(', ') : '') +
      (e.relations.length ? L('; relations: ', '; stosunki: ') + e.relations.map(r => government.describeParty(r.actor) + ' ' + sign(r.delta)).join(', ') : '') +
      (e.militia_lost ? L('; the Milicja lost ' + e.militia_lost + ' people', '; Milicja straciła ' + people(e.militia_lost)) : '') +
      (C.concessions_to_pps.length ? L('; the winner owes the conditions of PPS', '; zwycięzca jest winien PPS jej warunki') : '') + '.' : '';
  }

  // Z — 1.03: a game saved with the four groups of synthetic_test_v2 gets the one army: the strength-weighted loyalties, the
  // losses, the known estimate, the agreements and the projects that named a group; an attempt between F5 and its outcome goes
  // back to the choice of the organisations. Idempotent; main calls it when a game is shown.
  function migrateArmy(Q) {
    const S = Q && Q.S;
    if (!S || !S.security || !Array.isArray(S.security.forces) || S.security.forces.length <= 1) return false;
    const forces = S.security.forces, total = forces.reduce((n, f) => n + f.base_strength_F, 0) || 1;
    const sum = fn => forces.reduce((n, f) => n + fn(f) * f.base_strength_F / total, 0);
    const army = {id: ARMY, kind: 'army_group', base_strength_F: total, readiness: round(sum(f => f.readiness), 6), command: round(sum(f => f.command), 6),
      loyalty_legal: round(sum(f => f.loyalty_legal), 6), loyalty_pils: round(sum(f => f.loyalty_pils), 6), loyalty_neutral: 0,
      available_from_phase: 0, transport_route: 'road', rail_delay_cap: 0, committed_side: null,
      losses_F: round(forces.reduce((n, f) => n + (f.losses_F || 0), 0), 6), source_status: 'P', modifiers: []};
    army.loyalty_neutral = round(Math.max(0, 1 - army.loyalty_legal - army.loyalty_pils), 6);
    const known = forces.map(f => S.security.known[f.id]).filter(Boolean);
    const center = known.length ? round(sum(f => (S.security.known[f.id] || {pils_center: f.loyalty_pils}).pils_center), 6) : army.loyalty_pils;
    const radius = known.length ? Math.min.apply(null, known.map(k => k.radius)) : KNOWN_START;
    S.security.forces = [army];
    S.security.known = {army: {pils_center: center, radius: radius, at: S.turn.last_settled_time, roll_id: 'army:known:migrated'}};
    S.security.profile_id = FORCE_PROFILE_ID;
    for (const id of Object.keys(S.agreements || {})) {
      const a = S.agreements[id];
      if (!a || a.kind !== 'pilsudski') continue;
      const moved = a.loyalty_moved || 0;
      a.force_ids = a.force_ids && a.force_ids.length ? [ARMY] : [];
      a.loyalty_moved_by = a.force_ids.length ? {army: moved} : {};
    }
    for (const id of Object.keys(S.projects || {})) {
      const pr = S.projects[id];
      if (pr && pr.policy_choices && pr.policy_choices.force_id) pr.policy_choices.force_id = ARMY;
    }
    const C = S.coup;
    if (C && C.phase === 'execution_and_transport' && !C.effects_complete) {
      C.phase = 'organization_commitment';
      if (C.attempt) C.attempt.resolution = null;
    }
    S.history.reasons.push({t: Q.time, kind: 'army_migrated', loyalty_pils: army.loyalty_pils});
    return true;
  }

  // ---- One month (4.2 step 6, after politics) --------------------------------------------------------------

  function settleMonth(Q, settlement) {
    if (!ready(Q) || !settlement) return null;
    const S = Q.S, t = settlement.t;
    if (S.security.settled_t === t) return S.security;
    S.security.settled_t = t;
    const clock = {time: Q.time, year: Q.year, month: Q.month};
    Q.time = t; Q.year = rules.yearOf(t); Q.month = rules.monthOf(t);
    try {
      settlePeriod(Q, t);
    } finally {
      Q.time = clock.time; Q.year = clock.year; Q.month = clock.month;
    }
    return S.security;
  }

  function settlePeriod(Q, t) {
    const S = Q.S;
    for (const force of S.security.forces) force.modifiers = (force.modifiers || []).filter(m => t + 1 < m.until);
    const agreement = pilsAgreement(S);
    // The inspectorate starts its execution when its law takes effect; a law that fails in the Senate ends the offer.
    if (agreement && agreement.status === 'active' && agreement.variant === 'inspectorate' && agreement.execution_started_at === null && agreement.law_id) {
      const law = S.parliament.laws.filter(l => l.id === agreement.law_id)[0];
      if (law && law.status === 'enacted') executeAgreement(Q, agreement, t);
      else if (law && law.status !== 'in_procedure') lawFailed(agreement, law, t);
    }
    if (agreement && agreement.status === 'active' && agreement.variant === 'pils_premier' && agreement.execution_started_at === null &&
      S.cabinet && S.cabinet.pm === 'pilsudski' && S.cabinet.status === 'active') executeAgreement(Q, agreement, t);
    reviewAgreements(Q, t);
    // 4.2 step 8: the gates of the coup after the pressure of this month (16.8.1).
    checkCoupGates(Q, t);
  }

  // ---- Views for the scenes ---------------------------------------------------------------------------------

  // The police of 16.3 as the Interior sees it; the capacity of protection at the current command and compliance.
  function policeLine(Q) {
    const S = Q.S, police = S.security.police;
    return L('Police: capacity ' + fmt(police.capacity) + ', command ' + fmt(police.command) + ', lawful compliance ' + fmt(police.lawful_compliance) +
      '; protection of one gathering ' + fmt(protectionCapacity(S, null, Q.time)) + ' of 100.',
      'Policja: potencjał ' + fmt(police.capacity) + ', dowodzenie ' + fmt(police.command) + ', praworządność ' + fmt(police.lawful_compliance) +
      '; ochrona jednego zgromadzenia ' + fmt(protectionCapacity(S, null, Q.time)) + ' na 100.');
  }

  // Z — 1.02 (the user's decisions of 7 XI 2026): the card „Piłsudski i wojsko” from curbing his influence to the independent
  // inspectorate; the premiership and the refusal left the card (their rules stay for older games). P: the numbers are game values.
  const PILS_OPTIONS = Object.freeze(['subordinate', 'legion_cult', 'military_function', 'inspectorate', 'status_quo']);
  const SUBORDINATE = Object.freeze({forces: [ARMY], loyalty: 0.05, relation: -15, pilsudczycy: 10});
  const LEGION_CULT = Object.freeze({price: 1, relation: 10});
  const STATUS_QUO = Object.freeze({centrum: -3, relation: -3});

  function pilsOptionStatus(Q, option) {
    const S = Q.S;
    if (option === 'military_function' || option === 'inspectorate') return concessionStatus(Q, option);
    if (!pilsCardAvailable(Q)) return no(L('Needs PPS in the cabinet with Military Affairs; toleration or a party line are not enough.', 'Wymaga PPS w gabinecie z resortem Spraw Wojskowych; tolerowanie ani linia partii nie wystarczą.'));
    if (!inCrisis(S) && !rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    if (option === 'subordinate') {
      return SUBORDINATE.forces.some(id => forceOf(S, id).loyalty_pils > 0.001) ? OK :
        no(L('The army no longer leans towards Piłsudski.', 'Wojsko nie sprzyja już Piłsudskiemu.'));
    }
    if (option === 'legion_cult') return projects.affordStatus(Q, LEGION_CULT.price);
    if (option === 'status_quo') return OK;
    return no(L('Unknown option.', 'Nieznana opcja.'));
  }

  function pilsChoose(Q, option) {
    if (option === 'military_function' || option === 'inspectorate') {
      const out = concessionChoose(Q, option);
      if (option === 'inspectorate') pilsObjections(Q, option);
      return out;
    }
    const status = pilsOptionStatus(Q, option);
    if (!status.available) throw new Error('pilsChoose: ' + option + ': ' + status.reason);
    const S = Q.S, t = Q.time;
    party.syncMirrors(Q);
    if (!inCrisis(S)) rules.commitMainAction(Q, 'government.pils_agreement.' + option, {option: option});
    else S.history.actions.push({t: t, action_id: 'government.pils_agreement.' + option, cost_t: 0});
    if (option === 'subordinate') {
      for (const id of SUBORDINATE.forces) moveLoyalty(S, forceOf(S, id), 'loyalty_pils', 'loyalty_legal', SUBORDINATE.loyalty);
      government.changeRelation(Q, 'pilsudski', SUBORDINATE.relation, 'pils_subordinate:t' + t);
      government.factionReactions(Q, [{faction: 'pilsudczycy', dissent: SUBORDINATE.pilsudczycy}], {id: 'pils_subordinate:t' + t, kind: 'cabinet_policy', reverse: null});
      // Z — 1.03 (decision 1A of the coup audit): the subordination settles the open military cases, so they no longer feed the
      // pressure; breaking an agreement with Piłsudski opens a new one (16.7).
      for (let open = politics.openMilitaryCase(S); open; open = politics.openMilitaryCase(S)) politics.closeCase(Q, open.id, 'subordinate:t' + t);
      const broke = breakAgreement(Q, 'the army subordinated to the minister and the Sejm');
      Q.pl_pils_result = L('The army answers to the minister and the Sejm: Piłsudski loses his say in the nominations, and the army leans less towards him. ' +
        'The Piłsudczycy in PPS rebel (+' + SUBORDINATE.pilsudczycy + ') and relations with Piłsudski worsen (−' + Math.abs(SUBORDINATE.relation) + ').' +
        (broke ? ' The agreement with him is broken: the pressure towards a coup rises.' : ''),
        'Wojsko odpowiada przed ministrem i Sejmem: Piłsudski traci wpływ na nominacje, a wojsko słabiej mu sprzyja. Piłsudczycy w PPS ' +
        'się burzą (+' + SUBORDINATE.pilsudczycy + '), a stosunki z Piłsudskim się psują (−' + Math.abs(SUBORDINATE.relation) + ').' +
        (broke ? ' Porozumienie z nim zostaje zerwane: presja na zamach rośnie.' : ''));
      pilsObjections(Q, option);
    } else if (option === 'legion_cult') {
      projects.poolChange(Q, -LEGION_CULT.price, 'legion_cult:t' + t, 'The anniversary of the Legions', 'Rocznica czynu legionowego');
      government.changeRelation(Q, 'pilsudski', LEGION_CULT.relation, 'legion_cult:t' + t);
      Q.pl_pils_result = L('The state celebrates the march of the First Cadre Company and decorates the legionnaires; it costs 1 budget unit. Relations with Piłsudski improve (+' +
        LEGION_CULT.relation + ').', 'Państwo obchodzi rocznicę wymarszu Kadrówki i odznacza legionistów; kosztuje to 1 jednostkę budżetu. Stosunki z Piłsudskim ' +
        'się poprawiają (+' + LEGION_CULT.relation + ').');
    } else {
      government.factionReactions(Q, [{faction: 'centrum', dissent: STATUS_QUO.centrum}], {id: 'pils_status_quo:t' + t, kind: 'cabinet_policy', reverse: null});
      government.changeRelation(Q, 'pilsudski', STATUS_QUO.relation, 'pils_status_quo:t' + t);
      const sign = n => (n < 0 ? '−' : '+') + Math.abs(n);
      Q.pl_pils_result = L('Nothing changes in the army. The Centrum of PPS is content (' + sign(STATUS_QUO.centrum) + '), but Piłsudski feels passed over (' +
        sign(STATUS_QUO.relation) + ').', 'W wojsku nic się nie zmienia. Centrum PPS jest zadowolone (' + sign(STATUS_QUO.centrum) + '), ale Piłsudski ' +
        'czuje się pominięty (' + sign(STATUS_QUO.relation) + ').');
    }
    party.writeMirrors(Q);
    return {option: option};
  }

  // The partners of the cabinet react to the two decisions that move the army furthest (Z — Koalicja, REFORM_STANCES).
  function pilsObjections(Q, option) {
    const objections = government.applyReformObjections(Q, 'pils_agreement.' + option, null);
    if (objections.length) {
      Q.pl_pils_result = (Q.pl_pils_result || '') + ' ' + objections.map(o => L(government.partyWords(o.party) + ' objects: tension +' + o.delta + '.',
        'Sprzeciw: ' + government.partyWords(o.party) + ', napięcie +' + o.delta + '.')).join(' ');
    }
    return objections;
  }

  function pilsView(Q) {
    const S = Q.S, a = pilsAgreement(S);
    for (const option of PILS_OPTIONS) {
      Q['pl_pils_' + option + '_why'] = pilsOptionStatus(Q, option).reason;
      Q['pl_pils_' + option + '_coalition'] = government.reformObjectionText(Q, 'pils_agreement.' + option);
    }
    Q.pl_pils_line = L('Relations with Piłsudski: ' + fmt(S.actors.relations.pilsudski || 0) + '. ' +
      (a && a.status === 'active' ? 'Current agreement: ' + concessionName(a.variant) + (a.execution_started_at === null ? ', not yet executed.' :
        ', executed since ' + dateOf(a.execution_started_at) + ', review ' + dateOf(a.review_at) + '.') : 'No agreement in force.') +
      (inCrisis(S) ? ' The coup is in its political crisis: an answer now costs no action.' : ''),
      'Stosunki z Piłsudskim: ' + fmt(S.actors.relations.pilsudski || 0) + '. ' +
      (a && a.status === 'active' ? 'Obecne porozumienie: ' + concessionName(a.variant) + (a.execution_started_at === null ? ', jeszcze niewykonane.' :
        ', wykonywane od ' + rules.monthYear(a.execution_started_at, 'gen') + ', przegląd w ' + rules.monthYear(a.review_at, 'loc') + '.') :
        'Brak obowiązującego porozumienia.') + (inCrisis(S) ? ' Zamach jest w fazie kryzysu politycznego: odpowiedź nie kosztuje teraz akcji.' : '')) +
      ' ' + projects.poolLine(Q);
    Q.pl_pils_result = '';
  }

  // The candidate of 16.7 in the formation of 8.8: an agreed, not yet executed premiership (read by the government
  // module from S.agreements, so the formation needs no new dependency).
  function premierAwaiting(S) {
    const a = pilsAgreement(S);
    return !!a && a.status === 'active' && a.variant === 'pils_premier' && a.execution_started_at === null;
  }

  // Only what PPS can know (16.8.1): the recognised interval, never the true loyalty or the capacity it gives.
  // Stage 8 (decision 3A): the Defense page of the Status shows what the Polish game counts, and of the army only what
  // PPS knows: Milicja PPS or the AS with its legal status, the police, and the four groups with the known interval of
  // their loyalty to Piłsudski. The German militias and forces of the inherited page are not shown.
  function defenseView(Q) {
    const S = Q.S, m = S.militia, P = S.politics;
    const ban = Object.keys(P.restrictions || {}).map(id => P.restrictions[id]).filter(r => r.kind === 'militia_ban' && r.status === 'active')[0];
    Q.pl_def_militia_name = m.stage === 2 ? 'Akcja Socjalistyczna' : 'Milicja PPS';
    const level = party.militiaLevel(m);
    Q.pl_def_militia = L(m.strength + ' organised members; training level ' + level + ' of 5.',
      m.strength + ' zorganizowanych członków; wyszkolenie na poziomie ' + level + ' z 5.');
    Q.pl_def_legal = ban ? L('banned by the cabinet since ' + dateOf(ban.imposed_at) + (ban.lawful ? ' (a lawful restriction after proven violence)' :
      ' (an unlawful restriction)'), 'zakazana przez gabinet od ' + rules.monthYear(ban.imposed_at, 'gen') +
      (ban.lawful ? ' (legalne ograniczenie po udowodnionej przemocy)' : ' (bezprawne ograniczenie)')) :
      L('legal', 'legalna');
    Q.pl_def_police = policeLine(Q);
    // Z — 1.03 (decision 4A of 7 XI 2026): the army in words, without numbers.
    Q.pl_def_army = armyWords(S);
    Q.pl_def_forces = Q.pl_def_army;
    Q.pl_def_note = L('PPS knows the mood of the officers only from reports; the assessment of the forces on the Party agenda gives a surer picture.',
      'PPS zna nastroje oficerów tylko z doniesień; ocena sił w agendzie partii daje pewniejszy obraz.');
    const a = pilsAgreement(S);
    Q.pl_def_agreement = a && a.status === 'active' ? L('Agreement with Piłsudski: ' + concessionName(a.variant) +
      (a.execution_started_at === null ? ' (not yet executed).' : ', review ' + dateOf(a.review_at) + '.'), 'Porozumienie z Piłsudskim: ' +
      concessionName(a.variant) + (a.execution_started_at === null ? ' (jeszcze niewykonane).' : ', przegląd w ' + rules.monthYear(a.review_at, 'loc') + '.')) : '';
    Q.pl_def_crisis = S.coup.phase === 'political_crisis' ? L('Political crisis: preparations for a coup are reported.',
      'Kryzys polityczny: napływają doniesienia o przygotowaniach do zamachu.') : '';
    // The Defense tab of the sidebar shows the same facts one per line with a bold label (Z — 0.55); the combined
    // lines above stay for the Library.
    Q.pl_def_members = String(m.strength);
    // Z — 0.89: the training in levels; the condition and the attachment of the Milicja left the game.
    Q.pl_def_efficiency = L('level ' + level + '\u00a0of\u00a05', 'poziom ' + level + '\u00a0z\u00a05');
    const police = S.security.police;
    Q.pl_def_police_capacity = fmt(police.capacity);
    Q.pl_def_police_command = fmt(police.command);
    Q.pl_def_police_lawful = fmt(police.lawful_compliance);
    Q.pl_def_police_protection = fmt(protectionCapacity(S, null, Q.time)) + L('\u00a0of\u00a0100', '\u00a0na\u00a0100');
  }

  function statusLine(Q) {
    const S = Q.S, police = S.security.police;
    const warning = S.coup.phase === 'political_crisis' ? L('Political crisis: preparations for a coup are reported. ',
      'Kryzys polityczny: napływają doniesienia o przygotowaniach do zamachu. ') : '';
    const a = pilsAgreement(S);
    // Z — 1.03 (decision 4A): the army in words.
    return warning + L(armyWords(S) + ' Police: command ' +
      fmt(police.command) + ', lawful compliance ' + fmt(police.lawful_compliance) + '.' +
      (a && a.status === 'active' ? ' Agreement with Piłsudski: ' + concessionName(a.variant) + (a.execution_started_at === null ? ' (not yet executed).' :
        ', review ' + dateOf(a.review_at) + '.') : ''),
      armyWords(S) + ' Policja: dowodzenie ' + fmt(police.command) + ', praworządność ' + fmt(police.lawful_compliance) + '.' +
      (a && a.status === 'active' ? ' Porozumienie z Piłsudskim: ' + concessionName(a.variant) + (a.execution_started_at === null ?
        ' (jeszcze niewykonane).' : ', przegląd w ' + rules.monthYear(a.review_at, 'loc') + '.') : ''));
  }

  return Object.freeze({
    ARMY: ARMY,
    armyWords: armyWords,
    migrateArmy: migrateArmy,
    resolveCoup: resolveCoup,
    feasibleOffers: feasibleOffers,
    initialStrikeForce: initialStrikeForce,
    COUP_VICTORY: COUP_VICTORY,
    MILITIA_COUP_FACTOR: MILITIA_COUP_FACTOR,
    FORCE_PROFILE_ID: FORCE_PROFILE_ID,
    FORCES: FORCES,
    LOGISTICS: LOGISTICS,
    OVERSIGHT_FORCE: OVERSIGHT_FORCE,
    forceName: forceName,
    CONCESSIONS: CONCESSIONS,
    REVIEW_MONTHS: REVIEW_MONTHS,
    ready: ready,
    attachSecurityState: attachSecurityState,
    forceOf: forceOf,
    effectiveLoyalty: effectiveLoyalty,
    readinessOf: readinessOf,
    capacity: capacity,
    knownView: knownView,
    defenseView: defenseView,
    assessStatus: assessStatus,
    assess: assess,
    protectionCapacity: protectionCapacity,
    professionalized: professionalized,
    investigated: investigated,
    protectionExecuted: protectionExecuted,
    shiftLoyalty: shiftLoyalty,
    moveLoyalty: moveLoyalty,
    promotionTarget: promotionTarget,
    promoteOfficers: promoteOfficers,
    PILS_OPTIONS: PILS_OPTIONS,
    pilsOptionStatus: pilsOptionStatus,
    pilsChoose: pilsChoose,
    armyControlled: armyControlled,
    pilsScore: pilsScore,
    pilsAgreement: pilsAgreement,
    pilsCardAvailable: pilsCardAvailable,
    concessionStatus: concessionStatus,
    concessionChoose: concessionChoose,
    cabinetConcession: cabinetConcession,
    executeAgreement: executeAgreement,
    reviewAgreements: reviewAgreements,
    breakAgreement: breakAgreement,
    credibleStandDown: credibleStandDown,
    premierAwaiting: premierAwaiting,
    COUP_PROFILE_ID: COUP_PROFILE_ID,
    COUP_WINDOW_FROM: COUP_WINDOW_FROM,
    COUP_GATES: COUP_GATES,
    STANCE_SIDE: STANCE_SIDE,
    COMMITMENTS: COMMITMENTS,
    contributionOf: contributionOf,
    coupGates: coupGates,
    checkCoupGates: checkCoupGates,
    coupDue: coupDue,
    coupBegin: coupBegin,
    stancePreview: stancePreview,
    coupStanceStatus: coupStanceStatus,
    coupStance: coupStance,
    militiaPeopleFree: militiaPeopleFree,
    militiaCall: militiaCall,
    railCall: railCall,
    coupCommitStatus: coupCommitStatus,
    coupCommit: coupCommit,
    finishCoup: finishCoup,
    coupView: coupView,
    coupStep: coupStep,

    policeLine: policeLine,
    pilsView: pilsView,
    PILS_OPTIONS: PILS_OPTIONS,
    fileInspectorate: fileInspectorate,
    settleMonth: settleMonth,
    statusLine: statusLine,
  });
}));
