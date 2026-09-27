// Polish chapter government: actors and relations, offer evaluation, cabinets and portfolios,
// agreements and the government-support card (docs/POLISH_IMPLEMENTATION_PLAN.md, stage 3;
// technical reference 8.1–8.9, 9.1–9.4, 9.8, 17.4, 20.1.1). Stage 4 gives the programme points of
// agreements concrete projects and dates, and adds the currency and credit crises to majorCrisis.
//
// Plain JavaScript without dependencies, like polish_rules.js and polish_institutions.js, whose
// clock, rolls, clubs and ballots it uses, and like polish_economy.js, whose crises it reads. `npm run
// build` copies it to out/html/; the page loads it after polish_economy.js as `window.PolishGovernment`,
// and Node tests load it with
// require(). Numbers marked P in the reference are taken as written; profiles of actors,
// configurations and candidates are the approved test profiles (P), not historical positions.
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./polish_rules.js'), require('./polish_institutions.js'), require('./polish_economy.js'));
  } else {
    root.PolishGovernment = factory(root.PolishRules, root.PolishInstitutions, root.PolishEconomy);
  }
}(typeof self !== 'undefined' ? self : this, function (rules, institutions, economy) {
  'use strict';

  if (!rules || !institutions || !economy) throw new Error('PolishGovernment needs polish_rules.js, polish_institutions.js and polish_economy.js first');

  const copy = value => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
  const clip = (value, low, high) => Math.max(low, Math.min(high, value));
  const compareId = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  // ---- Actors and their test profiles (8.1, 8.6, 5.5) ---------------------------------------------

  const ACTOR_PROFILE_ID = 'actor_profiles_v1';
  const TOPICS = Object.freeze(['land', 'fiscal', 'institution', 'army', 'church', 'autonomy']);

  // Synthetic P profiles of 8.6: positions −2..2 per topic (unlisted topics 0), hard red lines and
  // preferred portfolios. They are test data, not the historical positions of these parties.
  const ACTOR_PROFILES = Object.freeze({
    pps: {name: 'PPS', ideals: {land: 1, fiscal: 2, institution: 2, army: 0}, red_lines: [], preferred_portfolios: ['labor']},
    psl_wyzwolenie: {name: 'PSL Wyzwolenie', ideals: {land: 1, fiscal: 2, institution: 2, army: 1},
      red_lines: ['discriminatory_land_access', 'end_parliamentary_control'], preferred_portfolios: ['agriculture', 'interior']},
    psl_piast: {name: 'PSL Piast', ideals: {land: 0, fiscal: 0, institution: 0, army: 0},
      red_lines: ['land_confiscation', 'smallholder_burden'], preferred_portfolios: ['agriculture']},
    npr: {name: 'NPR', ideals: {land: 0, fiscal: 0, institution: 0, army: 0},
      red_lines: ['violent_takeover', 'religious_confrontation', 'end_union_autonomy'], preferred_portfolios: ['labor']},
    pschd: {name: 'PSChD', ideals: {land: -1, fiscal: -1, institution: -1, army: 0},
      red_lines: ['religious_confrontation', 'land_confiscation'], preferred_portfolios: ['education', 'justice']},
    zln: {name: 'ZLN', ideals: {land: -1, fiscal: -1, institution: -1, army: 1, autonomy: -2},
      red_lines: ['territorial_autonomy', 'communists_in_cabinet'], preferred_portfolios: ['education', 'finance']},
    kpp: {name: 'KPP', ideals: {land: 2, fiscal: 2, institution: 2, army: 0},
      red_lines: ['give_up_own_organisation'], preferred_portfolios: []},
    jewish_rep: {name: 'Jewish representation', ideals: {land: 0, fiscal: 0, institution: 2, army: 0},
      red_lines: ['legal_discrimination', 'equating_with_bund'], preferred_portfolios: [], minority: true},
    other_minorities_rep: {name: 'Other national minorities', ideals: {land: 1, fiscal: 0, institution: 2, army: 0, autonomy: 1},
      red_lines: ['legal_discrimination', 'breaking_signed_land_agreement'], preferred_portfolios: [], minority: true},
  });

  // Partners PPS can talk to, with the field that inherited scenes read as a mirror.
  const PARTNERS = Object.freeze(['psl_wyzwolenie', 'psl_piast', 'npr', 'pschd', 'zln', 'kpp', 'jewish_rep', 'other_minorities_rep']);
  const PARTNER_PARTY = Object.freeze({psl_wyzwolenie: 'psl_wyzwolenie', psl_piast: 'psl_piast', npr: 'npr', pschd: 'pschd',
    zln: 'zln', kpp: 'kpp', jewish_rep: 'minorities_bloc', other_minorities_rep: 'minorities_bloc'});
  const MIRRORED = Object.freeze(['psl_wyzwolenie', 'psl_piast', 'npr', 'pschd', 'zln', 'kpp', 'minorities_bloc']);

  // Relations between other actors, for their own offers (8.6); unlisted pairs are neutral 50.
  const PAIR_RELATIONS = Object.freeze({'psl_piast|psl_wyzwolenie': 50, 'psl_piast|pschd': 60, 'psl_piast|zln': 60, 'pschd|zln': 70});

  function pairRelation(a, b) {
    if (a === b) return 100;
    const key = [a, b].sort().join('|');
    return Object.prototype.hasOwnProperty.call(PAIR_RELATIONS, key) ? PAIR_RELATIONS[key] : 50;
  }

  // ---- Relations: one owner, mirrors for inherited scenes (8.1, 5.5; decision 2 of stage 3) --------

  function createActorsState(Q) {
    const relations = {};
    for (const id of PARTNERS) {
      const party = PARTNER_PARTY[id];
      // 5.5: both minority representations start from 50; the others from the opening fields.
      relations[id] = PARTNER_PARTY[id] === 'minorities_bloc' ? 50 : clip(Number(Q[party + '_relation']) || 0, 0, 100);
    }
    return {
      profile_id: ACTOR_PROFILE_ID,
      relations: relations,
      mirror_base: {},
      pps: {credibility: 50, applied: []},
      kpp_channel: {contact_open: false, opened_at: null},
    };
  }

  // The inherited field of the minority bloc is only the seat-weighted average of the two
  // representations (by Sejm seats; 1/3 and 2/3 without seats), never a third author (5.5).
  function minorityBlocRelation(S) {
    const seats = {jewish_rep: 0, other_minorities_rep: 0};
    for (const club of S.parliament.clubs) if (Object.prototype.hasOwnProperty.call(seats, club.id)) seats[club.id] = club.seats;
    const total = seats.jewish_rep + seats.other_minorities_rep;
    const wJ = total > 0 ? seats.jewish_rep / total : 1 / 3;
    const wO = total > 0 ? seats.other_minorities_rep / total : 2 / 3;
    return wJ * S.actors.relations.jewish_rep + wO * S.actors.relations.other_minorities_rep;
  }

  function writeRelationMirrors(Q) {
    const S = Q.S;
    for (const party of MIRRORED) {
      const value = party === 'minorities_bloc' ? minorityBlocRelation(S) : S.actors.relations[party];
      Q[party + '_relation'] = value;
      S.actors.mirror_base[party] = value;
    }
  }

  // Inherited scenes (advisers and others) still write the mirror fields. Their changes are taken
  // over here, so the relation has one owner and nothing is lost or counted twice.
  function syncRelations(Q) {
    const S = Q.S;
    if (!S || !S.actors) return;
    const base = S.actors.mirror_base;
    for (const party of MIRRORED) {
      if (!Object.prototype.hasOwnProperty.call(base, party)) continue;
      const delta = Number(Q[party + '_relation']) - base[party];
      if (!Number.isFinite(delta) || Math.abs(delta) < 1e-9) continue;
      const ids = party === 'minorities_bloc' ? ['jewish_rep', 'other_minorities_rep'] : [party];
      for (const id of ids) S.actors.relations[id] = clip(S.actors.relations[id] + delta, 0, 100);
      S.history.reasons.push({t: Q.time, kind: 'relation_legacy_write', actor: party, delta: delta});
    }
    writeRelationMirrors(Q);
  }

  function relation(S, id) {
    const value = S.actors.relations[id];
    // A non-party premier has the neutral relation 50 with every party (decision 3).
    return value === undefined && CANDIDATES[id] && !CANDIDATES[id].party ? 50 : value;
  }

  // The profile an evaluator uses: a party of 8.6, or a non-party premier whose ideals are his own
  // programme, without red lines or portfolio demands (decision 3, P).
  function profileOf(id) {
    if (ACTOR_PROFILES[id]) return ACTOR_PROFILES[id];
    const candidate = CANDIDATES[id];
    if (candidate && !candidate.party) {
      return {name: candidate.name, ideals: candidate.programme || {}, red_lines: [], preferred_portfolios: [], expert: true};
    }
    return null;
  }

  function changeRelation(Q, id, delta, reason) {
    const S = Q.S;
    syncRelations(Q);
    if (!Object.prototype.hasOwnProperty.call(S.actors.relations, id)) throw new Error('changeRelation: unknown actor ' + id);
    S.actors.relations[id] = clip(S.actors.relations[id] + delta, 0, 100);
    S.history.reasons.push({t: Q.time, kind: 'relation', actor: id, delta: delta, reason: reason || ''});
    writeRelationMirrors(Q);
    return S.actors.relations[id];
  }

  // Reputation of execution (17.4): 50 at the start; a fulfilled significant obligation +3, a new
  // culpable breach −5 and a backed-down threat (9.8) −5; once per ID, bounded 0–100.
  function changeCredibility(Q, id, delta, kind) {
    const S = Q.S, pps = S.actors.pps;
    if (pps.applied.indexOf(id) >= 0) return pps.credibility;
    pps.applied.push(id);
    pps.credibility = clip(pps.credibility + delta, 0, 100);
    S.history.reasons.push({t: Q.time, kind: 'credibility', id: id, delta: delta, reason: kind || ''});
    return pps.credibility;
  }

  // ---- Reactions of the PPS factions (10.1; stage 5) ---------------------------------------------------

  const FACTION_IDS = Object.freeze(['centrum', 'lewica', 'pilsudczycy']);

  // One political reaction of a faction with its cause (10.1, 10.2): the raw strength and dissent change once,
  // strengths are normalized once, and the cause is kept for the faction's case (decision 3 of stage 5). Since
  // stage 5 the owner is S.actors.pps.factions; a state without it (a test fixture) keeps the mirror fields.
  function factionReaction(Q, factionId, change, cause) {
    const S = Q.S, dStrength = (change && change.strength) || 0, dDissent = (change && change.dissent) || 0;
    const causeId = cause && cause.id ? cause.id : String(cause || '');
    const factions = S && S.actors && S.actors.pps && S.actors.pps.factions;
    if (!factions) {
      if (dStrength) Q[factionId + '_strength'] = Math.max(0, (Number(Q[factionId + '_strength']) || 0) + dStrength);
      if (dDissent) Q[factionId + '_dissent'] = clip((Number(Q[factionId + '_dissent']) || 0) + dDissent, 0, 99);
      if (S) S.history.reasons.push({t: Q.time, kind: 'faction_reaction', faction: factionId, strength: dStrength, delta: dDissent, cause: causeId});
      return null;
    }
    const f = factions[factionId];
    if (!f) throw new Error('factionReaction: unknown faction ' + factionId);
    const before = f.dissent;
    f.strength = Math.max(0, f.strength + dStrength);
    f.dissent = clip(f.dissent + dDissent, 0, 99);
    let total = 0;
    for (const id of FACTION_IDS) total += Math.max(0, factions[id].strength);
    if (total > 0) for (const id of FACTION_IDS) factions[id].strength = 100 * Math.max(0, factions[id].strength) / total;
    const record = {t: Q.time, faction: factionId, strength: dStrength, dissent: f.dissent - before, cause: causeId,
      kind: (cause && cause.kind) || 'reaction', reverse: cause && cause.reverse ? copy(cause.reverse) : null};
    S.actors.pps.reactions.push(record);
    if (f.dissent - before > 0) f.reactions.push({t: Q.time, cause: causeId, kind: record.kind, amount: f.dissent - before, reverse: record.reverse, closed: false});
    S.history.reasons.push({t: Q.time, kind: 'faction_reaction', faction: factionId, strength: dStrength, delta: record.dissent, cause: causeId});
    return f;
  }

  // Several factions change in one action (an adviser's line): every raw change first, one normalization at
  // the end (10.4.3: "normalizacja raz").
  function factionReactions(Q, changes, cause) {
    const S = Q.S, factions = S.actors.pps.factions;
    for (const c of changes) {
      const f = factions[c.faction], before = f.dissent;
      f.strength = Math.max(0, f.strength + (c.strength || 0));
      f.dissent = clip(f.dissent + (c.dissent || 0), 0, 99);
      const record = {t: Q.time, faction: c.faction, strength: c.strength || 0, dissent: f.dissent - before, cause: cause.id,
        kind: cause.kind || 'reaction', reverse: cause.reverse ? copy(cause.reverse) : null};
      S.actors.pps.reactions.push(record);
      if (f.dissent - before > 0) f.reactions.push({t: Q.time, cause: cause.id, kind: record.kind, amount: f.dissent - before, reverse: record.reverse, closed: false});
      S.history.reasons.push({t: Q.time, kind: 'faction_reaction', faction: c.faction, strength: c.strength || 0, delta: record.dissent, cause: cause.id});
    }
    let total = 0;
    for (const id of FACTION_IDS) total += Math.max(0, factions[id].strength);
    if (total > 0) for (const id of FACTION_IDS) factions[id].strength = 100 * Math.max(0, factions[id].strength) / total;
  }

  // Faction reactions to a real break with a cabinet (9.3 `withdraw`, also a threat carried out; stage 5): one
  // reaction per faction of the profile, with its cause, once per cabinet. The test profile is empty (P, plan of
  // stage 5): the mechanism runs, the numbers wait for a decision and the calibration of stage 8.
  const WITHDRAW_REACTIONS = Object.freeze({});

  function withdrawReactions(Q, cabinetId, mode) {
    const S = Q.S;
    if (!S.actors || !S.actors.pps || !S.actors.pps.factions) return [];
    const out = [];
    for (const id of FACTION_IDS) {
      const change = WITHDRAW_REACTIONS[id];
      if (!change) continue;
      const causeId = 'withdraw:' + cabinetId + ':' + id;
      if (S.actors.pps.reactions.some(r => r.cause === causeId)) continue;
      out.push(factionReaction(Q, id, change, {id: causeId, kind: 'withdrawal', reverse: null}));
    }
    S.history.reasons.push({t: Q.time, kind: 'withdraw_reactions', cabinet_id: cabinetId, mode: mode, reactions: out.length});
    return out;
  }

  // The reverse of a reaction caused by the policy of the cabinet PPS is in or supports: leaving it.
  function cabinetPolicyReverse(S) {
    const cabinet = S.cabinet;
    if (!cabinet || cabinet.status !== 'active') return null;
    const bound = cabinet.partner_ids.indexOf('pps') >= 0 || cabinet.supporter_ids.indexOf('pps') >= 0;
    return bound ? {kind: 'leave_cabinet', cabinet_id: cabinet.id} : null;
  }

  // ---- Opening government (2.4, 3) --------------------------------------------------------------------

  const PORTFOLIOS = Object.freeze(['labor', 'interior', 'finance', 'economic', 'justice', 'agriculture', 'reichswehr', 'education', 'foreign']);

  // The new game: Ponikowski's predominantly expert cabinet, tolerated by PPS from outside with a
  // marked toleration and no programme agreement (2.4; the historical basis is TBD).
  function createGovernmentState(Q) {
    const portfolios = {};
    for (const key of PORTFOLIOS) portfolios[key] = 'expert';
    return {
      actors: createActorsState(Q),
      agreements: {
        opening_toleration: {id: 'opening_toleration', kind: 'toleration_marker', parties: ['pps'], cabinet_id: 'ponikowski_1',
          signed_at: Q.time, status: 'active', obligations: [], support_scope: ['toleration'], tension: 0, warning_issued: false,
          ultimatum: null, extensions_used: 0, responsibility: {pps: 0.5}, response: null, history: [],
          note: 'Opening toleration without a programme agreement; historical basis TBD — historical research required.'},
      },
      cabinet: {id: 'ponikowski_1', pm: 'ponikowski', pm_name: 'Antoni Ponikowski', party: null,
        configuration_id: 'expert', status: 'active', pps_mode: 'external_support', portfolios: portfolios,
        partner_ids: [], supporter_ids: ['pps'], appointment_basis: 'opening_profile', pps_threat_discounted: false,
        programme: {fiscal: 0}, formed_at: Q.time, agreement_ids: ['opening_toleration'], accepted_postulates: [],
        dismissal_motion: null, pending_threat: null},
      negotiation: null,
      cabinet_crisis: null,
    };
  }

  // ---- Offer evaluation (8.1–8.3) --------------------------------------------------------------------

  // Programme fit for the topics of the offer only; without topics there is no offer (8.1).
  function programFit(actorId, programme) {
    const profile = profileOf(actorId);
    if (!profile) throw new Error('programFit: no profile for ' + actorId);
    const topics = Object.keys(programme || {});
    if (!topics.length) throw new Error('programFit: an offer needs at least one programme topic');
    let distance = 0;
    for (const topic of topics) {
      if (TOPICS.indexOf(topic) < 0) throw new Error('programFit: unknown topic ' + topic);
      distance += Math.abs(programme[topic] - (profile.ideals[topic] || 0));
    }
    return 100 * (1 - distance / (4 * topics.length));
  }

  // Features of an offer that can cross a red line. Most come from the programme; the rest are
  // explicit flags of a concrete offer.
  function offerFeatures(offer) {
    const p = offer.programme || {};
    const features = new Set(offer.flags || []);
    if (p.land === 2) features.add('land_confiscation');
    if (p.church === 2) features.add('religious_confrontation');
    // Stage 5 (test "Oś autonomii"): the autonomy of the voivodeships (+1) already crosses the ZLN red line.
    if (p.autonomy >= 1) features.add('territorial_autonomy');
    if (p.institution === -2) features.add('end_parliamentary_control');
    if ((offer.members || []).indexOf('kpp') >= 0) features.add('communists_in_cabinet');
    return features;
  }

  function redLineViolations(actorId, offer) {
    const features = offerFeatures(offer);
    return profileOf(actorId).red_lines.filter(line => features.has(line));
  }

  // Share of the partner's demands that the offer meets (8.3): a cabinet member demands one of its
  // preferred portfolios (weight 2); an external minority supporter demands its minority terms
  // (weight 2); an explicit absence of demands gives 100.
  function portfolioFit(actorId, offer) {
    const profile = profileOf(actorId);
    // In a list offer the proportional split of candidates is accepted; it is never a ministry (6.5).
    if (offer.kind === 'electoral_list') return 100;
    const demands = [];
    if ((offer.members || []).indexOf(actorId) >= 0) {
      if (!profile.preferred_portfolios.length) throw new Error('portfolioFit: ' + actorId + ' has no portfolio profile');
      demands.push({weight: 2, met: profile.preferred_portfolios.some(key => offer.portfolios && offer.portfolios[key] === actorId)});
    } else if (profile.minority) {
      demands.push({weight: 2, met: (offer.minority_terms || []).length > 0});
    }
    if (!demands.length) return 100;
    const total = demands.reduce((n, d) => n + d.weight, 0);
    return 100 * demands.filter(d => d.met).reduce((n, d) => n + d.weight, 0) / total;
  }

  // The relation used by one actor when it evaluates an offer: PPS offers use the relation with PPS;
  // other offers the relation with the leading party, or 50 with a non-party candidate (8.6).
  function offerRelation(S, actorId, offer) {
    if (offer.by === 'pps') return relation(S, actorId);
    if (offer.by === 'pps_expert') return 50;
    if (!offer.lead_party) return 50;
    return pairRelation(actorId, offer.lead_party);
  }

  function breachPenalty(S, actorId) {
    let breaches = 0;
    for (const id of Object.keys(S.agreements).sort()) {
      const agreement = S.agreements[id];
      if (agreement.parties.indexOf(actorId) < 0 || agreement.parties.indexOf('pps') < 0) continue;
      for (const obligation of agreement.obligations || []) {
        if (obligation.owner === 'pps' && obligation.status === 'breached' && !obligation.resolved) breaches += 1;
      }
    }
    return Math.min(30, 5 * breaches);
  }

  // The score without the need component, used for the best alternative (8.3).
  function baseScore(S, actorId, offer) {
    const credibility = offer.by === 'pps' ? S.actors.pps.credibility : 50;
    return 0.25 * offerRelation(S, actorId, offer) + 0.35 * programFit(actorId, offer.programme) +
      0.20 * portfolioFit(actorId, offer) + 0.10 * credibility - breachPenalty(S, actorId);
  }

  // offerScore for one partner (8.3). `need` is given by the caller (needForThisAgreement); the
  // adviser bonus applies only to the one offer it was prepared for.
  function offerScore(S, actorId, offer, need) {
    const score = baseScore(S, actorId, offer) + 0.10 * clip(need || 0, 0, 100) + (offer.advisor_bonus || 0);
    return clip(score, 0, 100);
  }

  // Base scores of feasible other offers are bounded 0–90 and scaled to 0–100 (8.3).
  function scaledAlternative(base) {
    return clip(base, 0, 90) * 100 / 90;
  }

  function needFor(bestAlternative, crisisCooperation) {
    return clip(100 - (bestAlternative || 0) + (crisisCooperation || 0), 0, 100);
  }

  function evaluatePartner(S, actorId, offer, need) {
    const violations = redLineViolations(actorId, offer);
    const score = offerScore(S, actorId, offer, need);
    const gates = (offer.gates || []).filter(gate => gate.actor === actorId && relation(S, actorId) < gate.min);
    const reasons = [];
    for (const line of violations) reasons.push('red line: ' + line.replace(/_/g, ' '));
    for (const gate of gates) reasons.push('relation below ' + gate.min);
    if (!violations.length && !gates.length && score < 60) reasons.push('score ' + score.toFixed(1) + ' is below 60');
    return {actor: actorId, score: Math.round(score * 100) / 100, need: need, accept: !violations.length && !gates.length && score >= 60,
      red_lines: violations, reasons: reasons};
  }

  // Leverage of PPS in one conversation (8.2): a diagnostic result, never an extra bonus.
  function leverage(input) {
    const pivotal = input.canSucceedWithPPS && !input.canSucceedWithoutPPS ? 100 : 0;
    const seatWeight = clip(100 * input.ppsSeats / (0.30 * input.chamberSize), 0, 100);
    return clip(0.60 * pivotal + 0.25 * seatWeight + 0.15 * input.credibility, 0, 100);
  }

  // ---- Talks with other parties (8.1; card 6.1) -------------------------------------------------------

  const OUTREACH_COOLDOWN_MONTHS = 3;

  function seatsOf(S, actorId) {
    return S.parliament.clubs.filter(club => club.id === actorId).reduce((n, club) => n + club.seats, 0);
  }

  function kppChannelOpen(S, time) {
    const channel = S.actors.kpp_channel;
    return !!(channel.contact_open && channel.opened_at !== null && channel.opened_at < time);
  }

  function outreachStatus(Q, actorId) {
    const S = Q.S;
    if (PARTNERS.indexOf(actorId) < 0) return {available: false, reason: 'Not a partner for talks.'};
    if (seatsOf(S, actorId) <= 0) return {available: false, reason: 'Not in the current parliament.'};
    if (actorId === 'kpp' && !kppChannelOpen(S, Q.time)) return {available: false, reason: 'No open channel to the KPP yet.'};
    const wait = rules.cooldownRemaining(Q, 'outreach.' + actorId);
    if (wait > 0) return {available: false, reason: 'Talked recently: ' + wait + (wait === 1 ? ' month' : ' months') + ' before the next talk.'};
    return {available: true, reason: ''};
  }

  function kppContactStatus(Q) {
    const S = Q.S;
    if (S.actors.kpp_channel.contact_open) return {available: false, reason: 'The channel to the KPP is already open.'};
    if (relation(S, 'kpp') < 10) return {available: false, reason: 'Relation with the KPP is below 10.'};
    return {available: true, reason: ''};
  }

  function outreachAvailable(Q) {
    return PARTNERS.some(id => outreachStatus(Q, id).available) || kppContactStatus(Q).available;
  }

  // One talk with one partner: 1 T, 0 R, cd 3 M for this partner; +4, or +2 from relation 70 (8.1).
  function outreach(Q, actorId) {
    syncRelations(Q);
    const status = outreachStatus(Q, actorId);
    if (!status.available) throw new Error('outreach: ' + actorId + ' is not available (' + status.reason + ')');
    rules.commitMainAction(Q, 'party.outreach', {partner: actorId});
    const gain = relation(Q.S, actorId) >= 70 ? 2 : 4;
    changeRelation(Q, actorId, gain, 'party.outreach');
    Q.S.cooldowns['outreach.' + actorId] = Q.time + OUTREACH_COOLDOWN_MONTHS;
    return gain;
  }

  // Opening a channel to the KPP (kpp.contact, 17.2): talks include the KPP from the next month.
  function kppContact(Q) {
    syncRelations(Q);
    const status = kppContactStatus(Q);
    if (!status.available) throw new Error('kppContact: ' + status.reason);
    rules.commitMainAction(Q, 'kpp.contact', {partner: 'kpp'});
    Q.S.actors.kpp_channel = {contact_open: true, opened_at: Q.time};
    changeRelation(Q, 'kpp', 4, 'kpp.contact');
  }

  // ---- Cabinets: portfolios, configurations and candidates (8.4–8.8; decisions 3 and 4) ----------------

  const PORTFOLIO_NAMES = Object.freeze({
    labor: 'Praca i Opieka Społeczna (Labour, including public works)',
    interior: 'Sprawy Wewnętrzne (Interior)',
    finance: 'Skarb (Treasury)',
    economic: 'Przemysł i Handel (Industry and Trade)',
    justice: 'Sprawiedliwość (Justice)',
    agriculture: 'Rolnictwo i Dobra Państwowe (Agriculture)',
    reichswehr: 'Sprawy Wojskowe (Military Affairs)',
    education: 'Wyznania Religijne i Oświecenie Publiczne (Education)',
    foreign: 'Sprawy Zagraniczne (Foreign Affairs)',
  });
  const PORTFOLIO_SHORT = Object.freeze({labor: 'Labour', interior: 'Interior', finance: 'Treasury', economic: 'Industry and Trade',
    justice: 'Justice', agriculture: 'Agriculture', reichswehr: 'Military Affairs', education: 'Education', foreign: 'Foreign Affairs'});
  // Public works stay a programme topic; they are part of Labour, not a tenth portfolio (8.5, 20.1.1).
  const PROGRAMME_ONLY_TOPICS = Object.freeze(['public_works']);
  const MINORITY_TERMS = Object.freeze(['language_rights', 'school_rights', 'legal_equality']);
  const SEGMENTS = institutions.MINORITY_SEGMENTS;
  const HISTORICAL_WINDOW_BONUS = 8;
  const IMPASSE_AFTER = 3;

  // Configurations of 8.6 with the fixed minimum programmes of decision 4 (P): land / fiscal /
  // institution positions on the scale −2..2; only the topics listed enter the agreement.
  const CONFIGURATIONS = Object.freeze({
    pps_majority: {name: 'PPS majority government', members: ['pps'], programme: {land: 1, fiscal: 2, institution: 2},
      gates: [], majority_alone: true, minority_support: false},
    left_minority: {name: 'PPS and PSL Wyzwolenie', members: ['pps', 'psl_wyzwolenie'], programme: {land: 1, fiscal: 1, institution: 2},
      gates: [{actor: 'psl_wyzwolenie', min: 50}], minority_support: true},
    left_labour: {name: 'PPS, PSL Wyzwolenie and NPR', members: ['pps', 'psl_wyzwolenie', 'npr'],
      programme: {land: 1, fiscal: 1, institution: 1}, gates: [{actor: 'psl_wyzwolenie', min: 50}, {actor: 'npr', min: 55}],
      minority_support: true},
    centre_left: {name: 'Centre-left', members: ['pps', 'psl_wyzwolenie', 'psl_piast', 'npr'], programme: {land: 0, fiscal: 0, institution: 1},
      gates: [{actor: 'psl_wyzwolenie', min: 50}, {actor: 'psl_piast', min: 55}, {actor: 'npr', min: 55}], minority_support: true},
    broad_centre: {name: 'Broad centre', members: ['pps', 'psl_wyzwolenie', 'psl_piast', 'npr', 'pschd'],
      programme: {land: 0, fiscal: 0, church: 0}, crisis: 'major', minority_support: true,
      gates: [{actor: 'psl_wyzwolenie', min: 50}, {actor: 'psl_piast', min: 55}, {actor: 'npr', min: 55}, {actor: 'pschd', min: 55}]},
    skrzynski_broad: {name: 'Broad cabinet of Skrzyński', members: ['pps', 'psl_piast', 'npr', 'pschd', 'zln'], programme: {fiscal: 0},
      gates: [], crisis: 'major', candidate: 'skrzynski', minority_support: false,
      portfolio_map: {labor: 'pps', economic: 'npr', agriculture: 'psl_piast', justice: 'pschd', finance: 'zln'}},
    national_unity: {name: 'National unity', members: ['pps', 'psl_wyzwolenie', 'psl_piast', 'npr', 'pschd', 'zln'], programme: {fiscal: 0},
      crisis: 'severe', minority_support: false,
      gates: [{actor: 'psl_wyzwolenie', min: 55}, {actor: 'psl_piast', min: 55}, {actor: 'npr', min: 55}, {actor: 'pschd', min: 55}, {actor: 'zln', min: 45}]},
    united_left: {name: 'United left with the communists', members: ['pps', 'psl_wyzwolenie', 'npr', 'kpp'],
      programme: {land: 2, fiscal: 2, institution: 2}, requires: 'kpp_preparation', minority_support: false,
      gates: [{actor: 'psl_wyzwolenie', min: 60}, {actor: 'npr', min: 60}, {actor: 'kpp', min: 65}]},
    workers_front: {name: 'Workers’ front with the communists', members: ['pps', 'kpp'], programme: {land: 2, fiscal: 2, institution: 2},
      requires: 'kpp_preparation', minority_support: false, gates: [{actor: 'kpp', min: 70}]},
    expert: {name: 'Cabinet of experts', members: [], programme: null, gates: [], expert: true, minority_support: false},
    // Formed by other parties only; PPS is outside (8.6).
    chjeno_piast: {name: 'Chjeno-Piast', members: ['zln', 'pschd', 'psl_piast'], programme: {land: 0, fiscal: -1}, gates: [],
      npc: true, lead_party: 'psl_piast', candidate: 'witos'},
  });
  const PPS_CONFIGURATIONS = Object.freeze(['left_minority', 'centre_left', 'left_labour', 'pps_majority', 'broad_centre',
    'skrzynski_broad', 'national_unity', 'united_left', 'workers_front', 'expert']);

  // Candidates of decision 3 (P): a party leader has the profile of his party; an expert has a
  // neutral profile, except Grabski and Skrzyński (8.9). Windows are the historical themes of 8.7
  // (H) and give +8 in the ranking of already feasible and accepted offers.
  const CANDIDATES = Object.freeze({
    daszynski: {name: 'Ignacy Daszyński', party: 'pps', windows: []},
    thugutt: {name: 'Stanisław Thugutt', party: 'psl_wyzwolenie', windows: []},
    witos: {name: 'Wincenty Witos', party: 'psl_piast', windows: [[1923, 5, 1923, 12], [1926, 5, 1926, 5]]},
    ponikowski: {name: 'Antoni Ponikowski', party: null, windows: [[1922, 1, 1922, 6]], programme: {fiscal: 0}},
    // Stage 7c (8.7, 17.16.3; H: the attempt of VI–VII 1922 in PL-1922-1926-CABINETS): the Naczelnik's candidate after
    // the dispute with Ponikowski; he still needs the support of the Sejm.
    sliwinski: {name: 'Artur Śliwiński', party: null, windows: [[1922, 6, 1922, 7]], programme: {fiscal: 0}},
    nowak: {name: 'Julian Nowak', party: null, windows: [[1922, 7, 1922, 12]], programme: {fiscal: 0}},
    sikorski: {name: 'Władysław Sikorski', party: null, windows: [[1922, 12, 1923, 5]], programme: {fiscal: 0}},
    grabski: {name: 'Władysław Grabski', party: null, windows: [[1923, 12, 1925, 11]], programme: {fiscal: 1}},
    skrzynski: {name: 'Aleksander Skrzyński', party: null, windows: [[1925, 11, 1926, 5]], programme: {fiscal: 0}},
    // Stage 7 (16.7, P): the constitutional cabinet of Piłsudski on the programme of a legal cabinet; only after an
    // agreed premiership, never an automatic expert of the head of state (not in CANDIDATE_ORDER).
    pilsudski: {name: 'Józef Piłsudski', party: null, windows: [], programme: {fiscal: 0}, gated: true},
  });
  const CANDIDATE_ORDER = Object.freeze(['daszynski', 'thugutt', 'witos', 'sliwinski', 'nowak', 'sikorski', 'ponikowski', 'grabski', 'skrzynski']);
  const EXPERTS = Object.freeze(CANDIDATE_ORDER.filter(id => !CANDIDATES[id].party));

  function inWindow(candidateId, time) {
    return CANDIDATES[candidateId].windows.some(w => time >= rules.timeOf(w[0], w[1]) && time <= rules.timeOf(w[2], w[3]));
  }

  function majorityRequired(S) {
    const total = S.parliament.clubs.reduce((n, club) => n + club.seats, 0);
    return Math.floor(total / 2) + 1;
  }

  function seatsOfList(S, ids) {
    return ids.reduce((n, id) => n + seatsOf(S, id), 0);
  }

  // The national grievance of 15.1 and an active institutional emergency (an open case of unlawful violence against
  // institutions, 8.8) from S.politics of stage 7; a state without it reads 0 and no emergency.
  function nationalGrievance(S) {
    return S.politics && typeof S.politics.national_grievance === 'number' ? S.politics.national_grievance : 0;
  }

  function institutionalEmergency(S) {
    const cases = S.politics && S.politics.cases ? S.politics.cases : {};
    return Object.keys(cases).some(id => cases[id].institutional && cases[id].status === 'open');
  }

  // majorCrisis of 8.6: two cabinet falls in six months, national grievance of 60, the currency crisis of 11.9 or the
  // active scenario credit crisis; severeCrisis adds grievance 75, three falls or an institutional emergency (8.8).
  function crisisState(Q, context) {
    const S = Q.S, t = Q.time;
    const falls = S.history.cabinets.filter(c => c.end_reason === 'fall' && c.ended_at > t - 6).length +
      (S.cabinet && S.cabinet.fell_at !== undefined && S.cabinet.fell_at !== null && S.cabinet.fell_at > t - 6 ? 1 : 0);
    const currency = !!S.economy && economy.currencyCrisis(S.economy);
    const credit = !!S.economy && economy.creditCrisis(S.economy, t);
    const grievance = nationalGrievance(S), emergency = institutionalEmergency(S);
    const major = falls >= 2 || grievance >= 60 || currency || credit;
    return {falls: falls, currency: currency, credit: credit, grievance: grievance, emergency: emergency, major: major,
      allowed: major && !(context && context.reason === 'post_election'), severe: major && (grievance >= 75 || falls >= 3 || emergency)};
  }

  function daszynskiUnavailable(Q) {
    const S = Q.S;
    if (Q.daszynski_left_adviser_pool) return 'Ignacy Daszyński has left PPS.';
    if (Q.polish_presidency && Q.polish_presidency.current && Q.polish_presidency.current.holder_id === 'ignacy_daszynski') return 'Ignacy Daszyński is President.';
    if (S.parliament.speaker && S.parliament.speaker.person_id === 'ignacy_daszynski') return 'Ignacy Daszyński is Marshal of the Sejm.';
    return '';
  }

  // An expert whose own cabinet fell is not proposed again (decision 3), also while that cabinet is
  // still caretaker during the formation of its successor.
  function expertFallen(S, candidateId) {
    const current = S.cabinet;
    if (current && current.pm === candidateId && current.fell_at !== undefined && current.fell_at !== null) return true;
    return S.history.cabinets.some(c => c.pm === candidateId && c.end_reason === 'fall');
  }

  function partnersOf(offer) {
    return offer.members.filter(m => m !== 'pps').concat(offer.supporters.filter(s => s !== 'pps'));
  }

  // The premiership agreed with Piłsudski and not yet executed (16.7): the agreement of S.actors.pilsudski.
  function pilsudskiPremierAgreed(S) {
    const id = S.actors && S.actors.pilsudski && S.actors.pilsudski.agreement_id;
    const a = id ? S.agreements[id] : null;
    return !!a && a.status === 'active' && a.variant === 'pils_premier' && a.execution_started_at === null;
  }

  function candidateStatus(Q, candidateId, draft) {
    const S = Q.S, candidate = CANDIDATES[candidateId];
    const config = CONFIGURATIONS[draft.configuration_id];
    if (!candidate) return {available: false, reason: 'Unknown candidate.'};
    if (config.candidate && config.candidate !== candidateId) return {available: false, reason: 'This cabinet is led by ' + CANDIDATES[config.candidate].name + '.'};
    if (candidateId === 'pilsudski') {
      if (!pilsudskiPremierAgreed(S)) return {available: false, reason: 'Only after an agreed premiership with Piłsudski (16.7).'};
      if ((S.actors.relations.pilsudski || 0) < 65) return {available: false, reason: 'Needs a relation of 65 with Piłsudski: without it he withdraws his consent.'};
    }
    if (!candidate.party) {
      if (expertFallen(S, candidateId)) return {available: false, reason: 'His cabinet has fallen.'};
      return {available: true, reason: ''};
    }
    if (config.expert) return {available: false, reason: 'A cabinet of experts has a non-party prime minister.'};
    const offer = buildCabinetOffer(Q, Object.assign({}, draft, {candidate_id: candidateId}), {});
    if (offer.members.indexOf(candidate.party) < 0) return {available: false, reason: 'His party is not in this cabinet.'};
    if (seatsOf(S, candidate.party) <= 0) return {available: false, reason: 'His party has no MPs.'};
    if (candidateId === 'daszynski') {
      const blocked = daszynskiUnavailable(Q);
      if (blocked) return {available: false, reason: blocked};
      const largest = offer.members.every(m => seatsOf(S, m) <= seatsOf(S, 'pps'));
      if (!largest) return {available: false, reason: 'PPS is not the largest club of this cabinet.'};
      if (!config.majority_alone && partnersOf(offer).length < 2) return {available: false, reason: 'Needs at least two partners who accept him.'};
    }
    if (candidateId === 'thugutt' && (relation(S, 'psl_wyzwolenie') < 60 || relation(S, 'psl_piast') < 55)) {
      return {available: false, reason: 'Needs relations of 60 with PSL Wyzwolenie and 55 with PSL Piast.'};
    }
    return {available: true, reason: ''};
  }

  // Automatic portfolios (decision 4): PPS takes its claim, partners their first free preferred
  // portfolio (8.6), the larger club first; the rest go to non-party experts. One owner each.
  function allocatePortfolios(S, config, members, claim) {
    const owner = {};
    if (config.portfolio_map) {
      for (const key of Object.keys(config.portfolio_map)) {
        const who = config.portfolio_map[key];
        owner[key] = members.indexOf(who) >= 0 ? who : 'expert';
      }
    } else if (config.majority_alone && members.indexOf('pps') >= 0) {
      for (const key of PORTFOLIOS) owner[key] = 'pps';
    } else {
      if (members.indexOf('pps') >= 0) for (const key of claim || []) if (PORTFOLIOS.indexOf(key) >= 0 && !owner[key]) owner[key] = 'pps';
      const order = members.filter(m => m !== 'pps').sort((a, b) => seatsOf(S, b) - seatsOf(S, a) || compareId(a, b));
      for (const member of order) {
        const free = ACTOR_PROFILES[member].preferred_portfolios.filter(key => !owner[key])[0];
        if (free) owner[free] = member;
      }
    }
    // One owner for each of the nine portfolios, always in the same order.
    const ordered = {};
    for (const key of PORTFOLIOS) ordered[key] = owner[key] || 'expert';
    return ordered;
  }

  function buildCabinetOffer(Q, draft, context) {
    const config = CONFIGURATIONS[draft.configuration_id];
    const mode = config.expert && draft.pps_mode === 'member' ? 'external_support' : draft.pps_mode;
    const members = config.expert ? [] : (mode === 'member' ? config.members.slice() : config.members.filter(m => m !== 'pps'));
    const candidate = CANDIDATES[draft.candidate_id] || CANDIDATES.nowak;
    const supporters = [];
    if (mode === 'external_support') supporters.push('pps');
    const seekMinorities = !!(draft.seek_minority_support && config.minority_support);
    if (seekMinorities) supporters.push(...SEGMENTS);
    return {by: 'pps', kind: 'cabinet', configuration_id: draft.configuration_id, candidate_id: draft.candidate_id, pps_mode: mode,
      members: members, supporters: supporters,
      programme: copy(config.expert ? candidate.programme : config.programme),
      portfolios: allocatePortfolios(Q.S, config, members, mode === 'member' ? draft.portfolio_claim : []),
      minority_terms: seekMinorities ? MINORITY_TERMS.slice() : [], gates: config.gates, lead_party: candidate.party,
      stabilisation_terms: stabilisationTermsOpen(draft) ? draft.stabilisation_terms || 'none' : 'none',
      context: context || {}};
  }

  // Offers of other parties: Chjeno-Piast led by Witos, or experts tolerated by the clubs that sign.
  function npcOffer(Q, configId, candidateId) {
    const config = CONFIGURATIONS[configId];
    const candidate = CANDIDATES[candidateId];
    return {by: 'npc', kind: 'cabinet', configuration_id: configId, candidate_id: candidateId, pps_mode: 'opposition',
      members: config.expert ? [] : config.members.slice(), supporters: [],
      programme: copy(config.expert ? candidate.programme : config.programme),
      portfolios: allocatePortfolios(Q.S, config, config.expert ? [] : config.members, []),
      minority_terms: [], gates: [], lead_party: config.expert ? null : config.lead_party, context: {}};
  }

  // How a club outside the agreement votes on the budget and on a dismissal (decision 7): its view
  // of the cabinet programme from relation and programme fit, 0–100; below 40 it votes against,
  // otherwise it abstains. KPP and "Inne" abstain; neutral abstentions are never votes for.
  function programmeStance(S, clubId, offer) {
    if (!ACTOR_PROFILES[clubId]) return null;
    return clip((0.25 * offerRelation(S, clubId, offer) + 0.35 * programFit(clubId, offer.programme)) / 0.60, 0, 100);
  }

  function forecast(Q, offer, supporting, against) {
    const S = Q.S;
    const lines = [];
    let yes = 0, no = 0, abstain = 0;
    for (const club of S.parliament.clubs) {
      let vote;
      if (supporting.indexOf(club.id) >= 0) vote = 'yes';
      else if ((against || []).indexOf(club.id) >= 0) vote = 'no';
      else if (club.id === 'kpp' || club.id === 'other') vote = 'abstain';
      else if (club.id === 'pps') vote = offer.by === 'pps' ? 'abstain' : 'no';
      else {
        // A club without a profile (a splinter club of stage 5) abstains (P).
        const stance = programmeStance(S, club.id, offer);
        vote = stance !== null && stance < 40 ? 'no' : 'abstain';
      }
      if (vote === 'yes') yes += club.seats; else if (vote === 'no') no += club.seats; else abstain += club.seats;
      lines.push({club: club.id, seats: club.seats, vote: vote});
    }
    const majority = yes >= majorityRequired(S);
    return {yes: yes, no: no, abstain: abstain, majority: majority, viable: majority || yes > no, lines: lines};
  }

  function configurationStatus(Q, configId, context) {
    const S = Q.S, config = CONFIGURATIONS[configId];
    if (!config) return {available: false, reason: 'Unknown cabinet.'};
    if (config.npc) return {available: false, reason: 'Formed by other parties.'};
    if (config.requires === 'kpp_preparation') return {available: false, reason: 'Needs a prepared cooperation with the communists, not yet possible.'};
    if (config.crisis) {
      const crisis = crisisState(Q, context);
      if (!crisis.allowed) return {available: false, reason: 'Only in a real crisis: two cabinet falls within six months, a currency crisis or a credit crisis.'};
      if (config.crisis === 'severe' && !crisis.severe) return {available: false, reason: 'Only in a severe crisis: three cabinet falls within six months.'};
    }
    for (const gate of config.gates) {
      if (relation(S, gate.actor) < gate.min) return {available: false, reason: 'Relation with ' + ACTOR_PROFILES[gate.actor].name + ' is below ' + gate.min + '.'};
    }
    for (const member of config.members) {
      if (member !== 'pps' && seatsOf(S, member) <= 0) return {available: false, reason: ACTOR_PROFILES[member].name + ' has no MPs.'};
    }
    if (config.majority_alone && seatsOf(S, 'pps') < majorityRequired(S)) return {available: false, reason: 'PPS has no majority of its own.'};
    if (!config.expert) {
      // A realistic chance of support: the members, with the minority representations where allowed.
      const best = buildCabinetOffer(Q, {configuration_id: configId, candidate_id: 'nowak', pps_mode: 'member',
        seek_minority_support: config.minority_support, portfolio_claim: ['labor']}, context);
      if (!forecast(Q, best, best.members.concat(best.supporters)).viable) return {available: false, reason: 'No realistic parliamentary support.'};
    }
    return {available: true, reason: ''};
  }

  // The best alternative of one partner (8.3): feasible other offers that include it, without their
  // own need component, bounded to 0–90 and scaled; none gives 0.
  function bestAlternativeScore(Q, actorId, offer, context) {
    const S = Q.S;
    let best = 0;
    const consider = (alternative, feasible) => {
      if (!feasible) return;
      best = Math.max(best, scaledAlternative(baseScore(S, actorId, alternative)));
    };
    for (const configId of PPS_CONFIGURATIONS) {
      if (configId === offer.configuration_id || CONFIGURATIONS[configId].expert) continue;
      if (CONFIGURATIONS[configId].members.indexOf(actorId) < 0) continue;
      if (!configurationStatus(Q, configId, context).available) continue;
      const alt = buildCabinetOffer(Q, {configuration_id: configId, candidate_id: 'nowak', pps_mode: 'member',
        seek_minority_support: false, portfolio_claim: ['labor']}, context);
      consider(alt, forecast(Q, alt, alt.members).viable);
    }
    if (CONFIGURATIONS.chjeno_piast.members.indexOf(actorId) >= 0 && offer.configuration_id !== 'chjeno_piast') {
      const alt = npcOffer(Q, 'chjeno_piast', 'witos');
      consider(alt, forecast(Q, alt, alt.members).viable);
    }
    if (offer.configuration_id !== 'expert' && ACTOR_PROFILES[actorId] && actorId !== 'pps') {
      const expert = npcOffer(Q, 'expert', windowExpert(Q));
      consider(expert, true);
    }
    return best;
  }

  function windowExpert(Q) {
    const S = Q.S;
    return EXPERTS.filter(id => inWindow(id, Q.time) && !expertFallen(S, id))[0] ||
      EXPERTS.filter(id => !expertFallen(S, id))[0] || 'nowak';
  }

  // 8.8: min(20, 5 × falls + 0.5 × max(0, grievance − 60) + 10 × currency crisis).
  function crisisCooperation(Q, offer, context) {
    const config = CONFIGURATIONS[offer.configuration_id];
    const crisis = crisisState(Q, context);
    return config && config.crisis && crisis.allowed ?
      Math.min(20, 5 * crisis.falls + 0.5 * Math.max(0, crisis.grievance - 60) + (crisis.currency ? 10 : 0)) : 0;
  }

  function evaluateOffer(Q, offer, context) {
    const S = Q.S;
    const partners = offer.by === 'pps' ? partnersOf(offer) : offer.members.filter(m => m !== offer.lead_party);
    return partners.map(actorId => {
      const need = needFor(bestAlternativeScore(Q, actorId, offer, context), crisisCooperation(Q, offer, context));
      return evaluatePartner(S, actorId, offer, need);
    });
  }

  // The ranking of 8.7: the average offerScore of the required partners (external ones too), +8 for
  // the candidate of the historical window; PPS alone with a majority counts 60.
  function rankOf(Q, offer, evaluations) {
    const scores = evaluations.filter(e => e.accept).map(e => e.score);
    const average = scores.length ? scores.reduce((n, s) => n + s, 0) / scores.length : (offer.members.length === 1 && offer.members[0] === 'pps' ? 60 : null);
    if (average === null) return null;
    return average + (inWindow(offer.candidate_id, Q.time) ? HISTORICAL_WINDOW_BONUS : 0);
  }

  // Offers without PPS among the clubs not bound to another accepted offer (decision 7).
  function npcEntries(Q, bound, ppsAgainst) {
    const S = Q.S;
    const entries = [];
    const against = bound.concat(ppsAgainst ? ['pps'] : []);
    const chjeno = npcOffer(Q, 'chjeno_piast', 'witos');
    if (chjeno.members.every(m => seatsOf(S, m) > 0 && bound.indexOf(m) < 0)) {
      const evaluations = evaluateOffer(Q, chjeno, {});
      if (evaluations.every(e => e.accept)) {
        const fc = forecast(Q, chjeno, chjeno.members, against);
        if (fc.viable) entries.push({offer: chjeno, evaluations: evaluations, forecast: fc, rank: rankOf(Q, chjeno, evaluations)});
      }
    }
    for (const expertId of EXPERTS) {
      if (expertFallen(S, expertId)) continue;
      const entry = expertEntry(Q, expertId, against, false);
      if (entry.ok) entries.push({offer: entry.offer, evaluations: entry.signed, forecast: entry.forecast, rank: rankOf(Q, entry.offer, entry.signed)});
    }
    return entries;
  }

  // An expert cabinet is feasible only with signed support: the clubs whose offerScore as external
  // supporters reaches 60, plus PPS when it proposes the expert (8.7: no average of an empty list).
  function expertEntry(Q, candidateId, bound, withPPS) {
    const S = Q.S;
    const offer = npcOffer(Q, 'expert', candidateId);
    if (withPPS) { offer.by = 'pps_expert'; offer.pps_mode = 'external_support'; }
    const evaluations = [];
    const guarantors = [];
    for (const club of S.parliament.clubs) {
      if (!ACTOR_PROFILES[club.id] || club.id === 'pps' || club.id === 'kpp' || bound.indexOf(club.id) >= 0) continue;
      const evaluation = evaluatePartner(S, club.id, offer, needFor(bestAlternativeScore(Q, club.id, offer, {}), 0));
      evaluations.push(evaluation);
      if (evaluation.accept) guarantors.push(club.id);
    }
    const signed = evaluations.filter(e => e.accept);
    offer.supporters = (withPPS ? ['pps'] : []).concat(guarantors);
    const fc = forecast(Q, offer, offer.supporters, withPPS ? bound : bound);
    const ok = signed.length > 0 && fc.viable;
    return {offer: offer, evaluations: evaluations, signed: signed, forecast: fc, ok: ok,
      forecastSummary: {yes: fc.yes, no: fc.no, abstain: fc.abstain, majority: fc.majority, viable: fc.viable},
      reason: !signed.length ? 'no club signs support for the expert' : 'too few votes for the budget and against dismissal'};
  }

  function pickBest(entries) {
    return entries.filter(e => e.rank !== null).sort((a, b) => b.rank - a.rank || b.forecast.yes - a.forecast.yes ||
      compareId(a.offer.configuration_id + a.offer.candidate_id, b.offer.configuration_id + b.offer.candidate_id))[0] || null;
  }

  // ---- Forming a cabinet: one offer, one commit, the result (8.3, 8.4, 8.7, 8.8; card 7.1) -----------

  function defaultDraft(Q, context) {
    const draft = {configuration_id: 'expert', candidate_id: windowExpert(Q), pps_mode: 'external_support',
      seek_minority_support: false, portfolio_claim: ['labor']};
    const first = PPS_CONFIGURATIONS.filter(id => !CONFIGURATIONS[id].expert && configurationStatus(Q, id, context).available)[0];
    if (first) Object.assign(draft, {configuration_id: first, pps_mode: 'member'});
    draft.candidate_id = firstCandidate(Q, draft);
    return draft;
  }

  function firstCandidate(Q, draft) {
    const window = CANDIDATE_ORDER.filter(id => inWindow(id, Q.time) && candidateStatus(Q, id, draft).available)[0];
    const party = CANDIDATE_ORDER.filter(id => CANDIDATES[id].party && candidateStatus(Q, id, draft).available)[0];
    return party || window || CANDIDATE_ORDER.filter(id => candidateStatus(Q, id, draft).available)[0] || 'nowak';
  }

  // Opens the formation: mandatory after the 1922 election or a real fall (0 T); the player's own
  // initiative from the Parliament deck costs 1 T in total (8.8).
  function beginFormation(Q, context) {
    const S = Q.S;
    if (S.negotiation && S.negotiation.kind === 'cabinet' && S.negotiation.phase === 'draft') return S.negotiation;
    const serial = S.history.negotiations.length + 1;
    S.negotiation = {id: 'neg-' + serial + '-t' + Q.time, kind: 'cabinet', context: {reason: context.reason, event_id: context.event_id || null},
      mandatory: !!context.mandatory, cost_t: context.mandatory ? 0 : 1, phase: 'draft', opened_at: Q.time,
      draft: defaultDraft(Q, context), result: null};
    return S.negotiation;
  }

  // B1 (opening.cabinet_1922; 17.13): the answer to the fall of 1922 enters the one mandatory formation of 8.8, with
  // its candidate or with PPS in opposition; the card of that formation still shows every setting. 0 T.
  function beginCrisisFormation(Q, preset) {
    const S = Q.S;
    if (!S.cabinet_crisis) throw new Error('beginCrisisFormation: no cabinet crisis is open');
    S.negotiation = null;
    const neg = beginFormation(Q, {reason: 'cabinet_fall', mandatory: true, event_id: S.cabinet_crisis.id});
    if (preset.configuration_id) setDraft(Q, 'configuration_id', preset.configuration_id);
    if (preset.pps_mode) setDraft(Q, 'pps_mode', preset.pps_mode);
    if (preset.candidate_id) setDraft(Q, 'candidate_id', preset.candidate_id);
    return neg;
  }

  function setDraft(Q, field, value) {
    const neg = Q.S.negotiation;
    if (!neg || neg.phase !== 'draft') throw new Error('setDraft: no offer is being prepared');
    const draft = neg.draft;
    if (field === 'configuration_id') {
      draft.configuration_id = value;
      if (CONFIGURATIONS[value].expert && draft.pps_mode === 'member') draft.pps_mode = 'external_support';
      if (!CONFIGURATIONS[value].minority_support) draft.seek_minority_support = false;
      draft.candidate_id = firstCandidate(Q, draft);
    } else if (field === 'pps_mode') {
      draft.pps_mode = value;
      if (!candidateStatus(Q, draft.candidate_id, draft).available) draft.candidate_id = firstCandidate(Q, draft);
      if (!stabilisationTermsOpen(draft)) delete draft.stabilisation_terms;
    } else if (field === 'seek_minority_support') {
      draft.seek_minority_support = !!value && CONFIGURATIONS[draft.configuration_id].minority_support;
      if (!candidateStatus(Q, draft.candidate_id, draft).available) draft.candidate_id = firstCandidate(Q, draft);
    } else if (field === 'candidate_id' || field === 'portfolio_claim') {
      draft[field] = value;
      if (!stabilisationTermsOpen(draft)) delete draft.stabilisation_terms;
    } else if (field === 'stabilisation_terms') {
      if (!stabilisationTermsOpen(draft)) throw new Error('setDraft: stabilisation terms need Grabski and PPS support from outside');
      if (!stabilisationTermsStatus(value, Q).available) throw new Error('setDraft: ' + stabilisationTermsStatus(value, Q).reason);
      draft.stabilisation_terms = value;
    } else {
      throw new Error('setDraft: unknown field ' + field);
    }
    return draft;
  }

  // 9.7: the stabilisation profile of Grabski is part of the same formation card, with no separate card:
  // PPS tolerates him for protections and a heavier burden on wealth, or for a loan and limited cuts.
  function stabilisationTermsOpen(draft) {
    return !!draft && draft.candidate_id === 'grabski' && draft.pps_mode === 'external_support';
  }

  // P (9.7, stage 6): talks about protections need a real channel and a prepared base — the party apparatus at
  // level 2, one union branch with reach 40 and a relation of 40 with the addressee, Grabski (neutral 50 in his
  // test profile). They only open the talks; his answer comes with the offer (protectionTermsAnswer).
  const PROTECTION_TALKS = Object.freeze({apparatus: 2, reach: 40, relation: 40});

  function stabilisationTermsStatus(terms, Q) {
    if (terms === 'loan' || terms === 'none') return {available: true, reason: ''};
    if (terms !== 'protections') return {available: false, reason: 'Unknown terms.'};
    const S = Q && Q.S;
    const apparatus = S && S.party_orgs ? S.party_orgs.apparatus.level : 0;
    const reach = S && S.unions ? Math.max.apply(null, Object.keys(S.unions).map(id => S.unions[id].reach || 0)) : 0;
    const rel = S && S.actors ? relation(S, 'grabski') : 0;
    const missing = [];
    if (apparatus < PROTECTION_TALKS.apparatus) missing.push('party apparatus level 2 (now ' + apparatus + ')');
    if (reach < PROTECTION_TALKS.reach) missing.push('a union branch with reach 40 (now ' + Math.floor(reach) + ')');
    if (rel < PROTECTION_TALKS.relation) missing.push('a relation of 40 with Grabski (now ' + Math.floor(rel) + ')');
    return missing.length ? {available: false, reason: 'Negotiating protections needs ' + missing.join(', ') + '.'} : {available: true, reason: ''};
  }

  // The protection of the terms is financed when one already operates, or by the new burden on wealth of the
  // terms: the wealth tax of 11.9 (+2 B for six months) against the protection's 2 B, with the forecast budget
  // at −2 B or above (11.3). A wealth tax already in force leaves the terms no new money (P).
  function protectionFinancing(Q) {
    const S = Q.S, E = S.economy, t = Q.time;
    const operating = Object.keys(S.projects).some(id => {
      const p = S.projects[id];
      return !!p && p.type === 'worker_protection' && p.status === 'operating' && p.authorized;
    });
    if (operating) return {ok: true, kind: 'existing', reason: ''};
    const wealth = E.policies.some(p => p.kind === 'wealth_tax' && p.status !== 'cancelled' && (p.ends_at === null || p.ends_at === undefined || t < p.ends_at));
    if (wealth) return {ok: false, kind: null, reason: 'no money for the protection: the wealth tax is already in force, so the terms bring no new burden on wealth'};
    if (economy.budgetAt(S, t, {charge: 2, policy: 2}).budget < -2) {
      return {ok: false, kind: null, reason: 'no money for the protection: the forecast budget would stay below −2 B'};
    }
    return {ok: true, kind: 'wealth_tax', reason: ''};
  }

  // 9.7: Grabski answers the protections in the same commit. His score of 8.3 for a burden on wealth (fiscal +2)
  // with his need of PPS; he refuses PPS's demands when the clubs that sign give him a working support without
  // PPS; the protection needs its financing and its executor, the cabinet's minister of Labour (P).
  function protectionTermsAnswer(Q, entry) {
    const S = Q.S;
    const offer = {by: 'pps', kind: 'stabilisation_terms', programme: {fiscal: 2}, members: [], supporters: ['pps'],
      portfolios: entry.offer.portfolios, minority_terms: [], gates: [], lead_party: null};
    const alone = expertEntry(Q, 'grabski', [], false);
    const need = alone.ok ? 0 : 100;
    const evaluation = evaluatePartner(S, 'grabski', offer, need);
    const financing = protectionFinancing(Q);
    const executor = !!entry.offer.portfolios.labor && entry.offer.portfolios.labor !== 'pps';
    let reason = '';
    if (alone.ok) reason = 'Grabski has a working support without PPS and refuses its demands';
    else if (!evaluation.accept) reason = 'Grabski refuses the protections: ' + evaluation.reasons.join(', ');
    else if (!financing.ok) reason = financing.reason;
    else if (!executor) reason = 'no minister of Labour would carry out the protection';
    return {accept: !reason, reason: reason, score: evaluation.score, need: need, financing: financing.kind};
  }

  function draftChoiceStatus(Q, kind, value) {
    const neg = Q.S.negotiation;
    if (!neg) return {available: false, reason: ''};
    const draft = neg.draft;
    if (kind === 'configuration') return configurationStatus(Q, value, neg.context);
    if (kind === 'candidate') return candidateStatus(Q, value, draft);
    if (kind === 'mode') {
      if (value === 'member' && CONFIGURATIONS[draft.configuration_id].expert) return {available: false, reason: 'A cabinet of experts has no party ministers.'};
      return {available: true, reason: ''};
    }
    return {available: true, reason: ''};
  }

  const MODE_NAMES = Object.freeze({member: 'in the cabinet', external_support: 'supports it from outside', opposition: 'in opposition'});
  // Display names of the programme topics and of the positions that 8.1 names (P); other positions
  // are shown only as numbers.
  const TOPIC_NAMES = Object.freeze({land: 'land reform', fiscal: 'fiscal burden', institution: 'institutions', army: 'army',
    church: 'church', autonomy: 'autonomy'});
  const POSITION_NAMES = Object.freeze({
    land: {'-2': 'market sale', '0': 'with compensation', '1': 'accelerated', '2': 'without compensation'},
    fiscal: {'-2': 'cuts', '0': 'burden shared', '2': 'burden on wealth'},
    institution: {'-2': 'strong president', '0': 'cabinet rules', '2': 'democratisation'},
    army: {'-2': 'command autonomy', '0': 'compromise', '2': 'civilian oversight'},
  });

  function describeProgramme(programme) {
    return Object.keys(programme || {}).map(topic => {
      const position = programme[topic];
      const label = (POSITION_NAMES[topic] || {})[String(position)];
      return (TOPIC_NAMES[topic] || topic) + ' ' + (position > 0 ? '+' : '') + position + (label ? ' (' + label + ')' : '');
    }).join(', ');
  }

  function describeParty(id) {
    if (id === 'expert') return 'non-party expert';
    if (ACTOR_PROFILES[id]) return ACTOR_PROFILES[id].name;
    return CANDIDATES[id] ? CANDIDATES[id].name : id;
  }

  // Display fields of the offer screen: the offer, the partners' known demands and red lines, and
  // whether the offer meets them. The 8.3 scores appear only in the result (decision 4).
  function formationView(Q) {
    const S = Q.S, neg = S.negotiation;
    if (!neg) return null;
    const draft = neg.draft;
    const config = CONFIGURATIONS[draft.configuration_id];
    const offer = buildCabinetOffer(Q, draft, neg.context);
    const partnerLines = partnersOf(offer).map(id => {
      const profile = ACTOR_PROFILES[id];
      const bits = [profile.name + ' (relation ' + Math.round(relation(S, id)) + ')'];
      const gate = (config.gates || []).filter(g => g.actor === id)[0];
      if (gate) bits.push(relation(S, id) >= gate.min ? 'gate ' + gate.min + ' met' : 'gate ' + gate.min + ' NOT met');
      if (offer.members.indexOf(id) >= 0) {
        const wanted = profile.preferred_portfolios;
        const got = wanted.some(key => offer.portfolios[key] === id);
        bits.push('wants ' + wanted.map(key => PORTFOLIO_SHORT[key]).join(' or ') + (got ? ' — offered' : ' — NOT offered'));
      } else if (profile.minority) {
        bits.push('asks for minority rights — offered');
      }
      const lines = redLineViolations(id, offer);
      bits.push(lines.length ? 'red line crossed: ' + lines.join(', ').replace(/_/g, ' ') : 'no red line crossed');
      return bits.join('; ');
    });
    const own = PORTFOLIOS.filter(key => offer.portfolios[key] === 'pps');
    const fc = forecast(Q, offer, offer.members.concat(offer.supporters));
    return {
      mandatory: neg.mandatory, cost_t: formationCost(Q, neg), reason: neg.context.reason,
      configuration: config.name, candidate: (CANDIDATES[draft.candidate_id] || {}).name || '—',
      mode: MODE_NAMES[offer.pps_mode], minorities: offer.minority_terms.length ? 'requested' : 'not requested',
      stabilisation_open: stabilisationTermsOpen(draft),
      stabilisation: {none: 'no terms', loan: 'a loan and limited cuts', protections: 'protections and a heavier burden on wealth'}[offer.stabilisation_terms] || 'no terms',
      minority_allowed: !!config.minority_support,
      portfolios: offer.pps_mode === 'member' ? (own.length ? own.map(key => PORTFOLIO_SHORT[key]).join(', ') : 'none') : 'none (outside the cabinet)',
      allocation: PORTFOLIOS.map(key => PORTFOLIO_SHORT[key] + ': ' + describeParty(offer.portfolios[key])).join('; '),
      partners: partnerLines.length ? partnerLines.join(' | ') : 'none',
      members_seats: seatsOfList(S, offer.members), requested_seats: fc.yes, majority: majorityRequired(S),
      programme: describeProgramme(offer.programme),
    };
  }

  // The premiership agreed on the card of 16.7 already cost its action: its formation takes no second T.
  function formationCost(Q, neg) {
    if (!neg.cost_t) return 0;
    return neg.draft && neg.draft.candidate_id === 'pilsudski' && pilsudskiPremierAgreed(Q.S) ? 0 : neg.cost_t;
  }

  function closeNegotiation(S, result) {
    const neg = S.negotiation;
    neg.phase = 'result';
    neg.result = result;
    S.history.negotiations.push(copy(neg));
    S.negotiation = null;
  }

  // One commit: the partners answer yes or no; the head of state appoints the best feasible offer.
  function submitFormation(Q) {
    const S = Q.S, neg = S.negotiation;
    if (!neg || neg.kind !== 'cabinet' || neg.phase !== 'draft') throw new Error('submitFormation: no offer is being prepared');
    syncRelations(Q);
    if (formationCost(Q, neg)) rules.commitMainAction(Q, 'parliament.cabinet_formation', {negotiation_id: neg.id});
    const draft = neg.draft;
    const context = neg.context;
    const result = {negotiation_id: neg.id, t: Q.time, reason: context.reason, pps_mode: draft.pps_mode, pps_offer: null,
      appointed: null, lines: []};
    let entries = [];
    let bound = [];
    if (draft.pps_mode !== 'opposition' && CONFIGURATIONS[draft.configuration_id].expert) {
      const entry = expertEntry(Q, draft.candidate_id, [], true);
      entry.offer.stabilisation_terms = stabilisationTermsOpen(draft) ? draft.stabilisation_terms || 'none' : 'none';
      // Without an agreement on the terms there is no support (test "Tolerowanie B14").
      const terms = entry.offer.stabilisation_terms === 'protections' ? protectionTermsAnswer(Q, entry) : null;
      if (terms && !terms.accept && entry.ok) {
        entry.ok = false;
        entry.reason = terms.reason;
      }
      result.pps_offer = {configuration_id: 'expert', candidate_id: draft.candidate_id, evaluations: entry.evaluations,
        forecast: entry.forecastSummary, accepted: entry.ok, reason: entry.ok ? '' : entry.reason, terms_answer: terms};
      if (entry.ok) {
        bound = entry.offer.supporters.filter(id => id !== 'pps');
        entries.push({offer: entry.offer, evaluations: entry.signed, forecast: entry.forecast, rank: rankOf(Q, entry.offer, entry.signed)});
      }
    } else if (draft.pps_mode !== 'opposition') {
      const offer = buildCabinetOffer(Q, draft, context);
      if (neg.advisor_bonus && neg.advisor_bonus_until >= Q.time && BROAD_CONFIGURATIONS.indexOf(offer.configuration_id) >= 0) {
        offer.advisor_bonus = neg.advisor_bonus;
      }
      const evaluations = evaluateOffer(Q, offer, context);
      const members = offer.members.filter(m => m !== 'pps');
      const membersAccept = members.every(m => evaluations.filter(e => e.actor === m)[0].accept);
      const acceptedSupporters = offer.supporters.filter(s => s === 'pps' || (evaluations.filter(e => e.actor === s)[0] || {}).accept);
      const supporting = offer.members.concat(acceptedSupporters);
      const fc = forecast(Q, offer, supporting);
      const acceptedPartners = evaluations.filter(e => e.accept).length;
      const candidateOk = draft.candidate_id !== 'daszynski' || CONFIGURATIONS[draft.configuration_id].majority_alone || acceptedPartners >= 2;
      const ok = membersAccept && candidateOk && fc.viable && (offer.members.length > 0 || acceptedSupporters.length > 1);
      result.pps_offer = {configuration_id: offer.configuration_id, candidate_id: offer.candidate_id, evaluations: evaluations,
        forecast: {yes: fc.yes, no: fc.no, abstain: fc.abstain, majority: fc.majority, viable: fc.viable}, accepted: ok,
        reason: ok ? '' : (!membersAccept ? 'a cabinet partner refused' : !candidateOk ? 'fewer than two partners accept Daszyński' :
          !fc.viable ? 'too few votes for the budget and against dismissal' : 'no signed support')};
      if (ok) {
        offer.supporters = acceptedSupporters;
        bound = supporting.filter(id => id !== 'pps');
        entries.push({offer: offer, evaluations: evaluations.filter(e => e.accept), forecast: fc, rank: rankOf(Q, offer, evaluations)});
      }
    }
    const npc = npcEntries(Q, bound, draft.pps_mode === 'opposition' || !result.pps_offer || !result.pps_offer.accepted);
    entries = entries.concat(npc);
    const best = pickBest(entries);
    if (best) {
      appointCabinet(Q, best, context);
      result.appointed = {cabinet_id: S.cabinet.id, configuration_id: best.offer.configuration_id, candidate_id: best.offer.candidate_id,
        pm_name: S.cabinet.pm_name, pps_mode: S.cabinet.pps_mode, support_seats: best.forecast.yes, majority: best.forecast.majority,
        by: best.offer.by};
    } else {
      recordFailedFormation(Q, context);
      if (draft.pps_mode !== 'opposition') S.cabinet_crisis.last_pps_draft = copy(draft);
    }
    closeNegotiation(S, result);
    writeGovernmentMirrors(Q);
    return result;
  }

  function openCrisis(Q, reason, fallenId) {
    const S = Q.S;
    if (S.cabinet_crisis) return S.cabinet_crisis;
    S.cabinet_crisis = {id: 'crisis-t' + Q.time + '-' + (S.history.cabinets.length + 1), fallen_cabinet_id: fallenId || null,
      reason: reason, status: 'open', resolved_by: null, failed_proposals: 0, opened_at: Q.time, last_attempt_at: null, snapshot: null};
    return S.cabinet_crisis;
  }

  // A formation round that ends without an appointment is one failed proposal; the caretaker stays
  // in office. After three the crisis becomes an impasse, a state and not a card (8.7, Z — 0.36).
  function recordFailedFormation(Q, context) {
    const S = Q.S;
    const crisis = openCrisis(Q, context.reason, S.cabinet ? S.cabinet.id : null);
    crisis.failed_proposals += 1;
    crisis.last_attempt_at = Q.time;
    crisis.snapshot = situationSnapshot(Q);
    if (crisis.failed_proposals >= IMPASSE_AFTER) crisis.status = 'impasse';
    if (S.cabinet && S.cabinet.status === 'active') S.cabinet.status = 'caretaker';
  }

  // What must change before a mandatory formation returns: a new candidate of the window or a real
  // change of support — a new agreement or a change of the clubs (8.7).
  function situationSnapshot(Q) {
    const S = Q.S;
    return {window_candidate: windowExpert(Q), agreements: Object.keys(S.agreements).filter(id => S.agreements[id].status === 'active').length,
      clubs: S.parliament.clubs.map(c => c.id + ':' + c.seats).join(',')};
  }

  function situationChanged(Q) {
    const crisis = Q.S.cabinet_crisis;
    if (!crisis || !crisis.snapshot) return true;
    const now = situationSnapshot(Q);
    return now.window_candidate !== crisis.snapshot.window_candidate || now.agreements !== crisis.snapshot.agreements || now.clubs !== crisis.snapshot.clubs;
  }

  function endCabinet(Q, endReason) {
    const S = Q.S;
    if (!S.cabinet) return;
    const fell = S.cabinet.fell_at !== undefined && S.cabinet.fell_at !== null;
    S.history.cabinets.push(Object.assign(copy(S.cabinet), {ended_at: fell ? S.cabinet.fell_at : Q.time, end_reason: fell ? 'fall' : endReason}));
    for (const id of S.cabinet.agreement_ids || []) {
      const agreement = S.agreements[id];
      if (agreement && (agreement.status === 'active' || agreement.status === 'breached')) {
        agreement.status = 'expired';
        agreement.history.push({t: Q.time, kind: 'cabinet_ended', reason: endReason});
      }
    }
  }

  // ---- Programme points as projects, dates and rules (decision 3 of stage 4; 9.1, 17.16.4) -------------

  // Each point of an agreed programme names a project or a rule (P): land 0 or +1 the first tranche of
  // the parcelation by t+6 (17.16.4); fiscal +1 or +2 in a party cabinet the financed worker protection
  // operating in full by t+4 (9.1), and every fiscal point a rule against contrary packages; church a
  // rule for the school programme; institutions the matching constitutional project, without a date
  // because it needs two thirds of both chambers. Army and autonomy points are not yet linked to the projects of stage 7 (a recorded gap).
  function programmeObligations(offer, agreementId, beneficiaries, t) {
    const config = CONFIGURATIONS[offer.configuration_id];
    const partyCabinet = !config || !config.expert;
    const list = [];
    const base = (topic, extra) => Object.assign({id: agreementId + ':' + topic, topic: topic, position: offer.programme[topic],
      owner: 'cabinet', kind: 'programme', beneficiaries: beneficiaries.slice(), required_project: null, required_variants: null,
      required_stage: null, portfolio: null, weight: 1, due_at: null, status: 'active', fulfillment: 0, last_checked: null}, extra || {});
    for (const topic of Object.keys(offer.programme || {})) {
      const position = offer.programme[topic];
      if (topic === 'land') {
        if (position === 0 || position === 1) {
          list.push(base('land', {required_project: 'land_program', required_variants: position === 1 ? ['accelerated'] : ['compensated', 'accelerated'],
            required_stage: 'completed', portfolio: 'agriculture', due_at: t + 6}));
        } else if (position >= 2) {
          list.push(base('land', {status: 'awaiting_later_stage', note: 'Land reform without compensation needs a prior change of the property guarantees; no card of the catalogue creates it (gap, 12.6).'}));
        } else {
          list.push(base('land', {kind: 'constraint', portfolio: 'agriculture', fulfillment: 1}));
        }
      } else if (topic === 'fiscal') {
        list.push(base('fiscal', {kind: 'constraint', portfolio: 'finance', fulfillment: 1}));
        if (position >= 1 && partyCabinet) {
          list.push(base('fiscal', {id: agreementId + ':worker_protection', topic: 'worker_protection', required_project: 'worker_protection',
            required_variants: ['full'], required_stage: 'operating', portfolio: 'labor', weight: 2, due_at: t + 4}));
        }
      } else if (topic === 'institution') {
        const reform = position >= 1 ? 'democratic_guarantees' : position <= -1 ? 'presidential_arbitration' : 'constructive_vonc';
        list.push(base('institution', {required_project: 'constitution', required_variants: [reform], required_stage: 'enacted', status: 'open'}));
      } else if (topic === 'church') {
        list.push(base('church', {kind: 'constraint', portfolio: 'education', fulfillment: 1}));
      } else {
        list.push(base(topic, {status: 'awaiting_later_stage', note: 'Not yet linked to the army control or autonomy projects (a gap recorded in stage 7).'}));
      }
    }
    return list;
  }

  // The terms of a minority representation that supports the cabinet (8.6): schools and language rights
  // by the school project in its own language or agreed bilingualism, operating by t+6 (P); legal
  // equality as a rule against discriminating land access and imposed Polish dominance.
  function minorityObligation(agreementId, term, segment, t) {
    const common = {id: agreementId + ':' + term, topic: term, position: null, owner: 'cabinet', beneficiaries: [segment], weight: 2,
      required_project: null, required_variants: null, required_stage: null, portfolio: null, due_at: null, status: 'active',
      fulfillment: 0, last_checked: null};
    if (term === 'legal_equality') return Object.assign(common, {kind: 'constraint', fulfillment: 1});
    return Object.assign(common, {kind: 'programme', required_project: 'minority_schools', required_variants: ['own_language', 'agreed_bilingual'],
      required_stage: 'operating', portfolio: 'education', due_at: t + 6});
  }

  // A package or programme adopted against a rule of an agreement: one red-line breach (+15 tension
  // once, 9.2) and, when PPS answers for it, reputation −5 once (17.4).
  function breachConstraint(Q, agreementId, obligationId, reason) {
    const S = Q.S, agreement = S.agreements[agreementId];
    const o = agreement && findObligation(agreement, obligationId);
    if (!o || o.status === 'breached') return false;
    o.status = 'breached';
    o.breached_at = Q.time;
    o.fulfillment = 0;
    agreement.history.push({t: Q.time, kind: 'red_line_breach', obligation_id: o.id, reason: reason || ''});
    if (ppsResponsible(S, agreement, o)) changeCredibility(Q, 'breach:' + o.id, -5, 'rule_breach');
    return true;
  }

  // Appointment by the head of state: the Naczelnik before the constitutional transfer, then the
  // President. Agreements record the programme; since stage 4 its points name projects, dates and
  // rules (programmeObligations).
  function appointCabinet(Q, entry, context) {
    const S = Q.S, offer = entry.offer, t = Q.time;
    const previous = S.cabinet;
    endCabinet(Q, context.reason === 'post_election' ? 'post_election' : 'replaced');
    const candidate = CANDIDATES[offer.candidate_id];
    const cabinetId = offer.configuration_id + '_t' + t;
    const agreementIds = [];
    const parties = offer.by === 'pps' ? partnersOf(offer).filter(id => offer.members.indexOf(id) >= 0 || offer.supporters.indexOf(id) >= 0) : [];
    // The programme is owed by the cabinet to the parties that asked for it (9.1).
    const sign = (id, kind, partiesOf, scope, beneficiaries) => {
      const agreementId = 'agr-' + cabinetId + '-' + id;
      const obligations = programmeObligations(offer, agreementId, beneficiaries, t);
      if (kind === 'support' && SEGMENTS.indexOf(id) >= 0) {
        for (const term of offer.minority_terms) obligations.push(minorityObligation(agreementId, term, id, t));
      }
      S.agreements[agreementId] = {id: agreementId, kind: kind, parties: partiesOf, cabinet_id: cabinetId, signed_at: t, status: 'active',
        obligations: obligations, support_scope: scope, tension: 0, warning_issued: false, ultimatum: null, extensions_used: 0,
        responsibility: {pps: offer.pps_mode === 'member' ? 1 : (offer.pps_mode === 'external_support' ? 0.5 : 0)}, response: null,
        history: [{t: t, kind: 'signed'}]};
      agreementIds.push(agreementId);
    };
    if (offer.by === 'pps') {
      for (const id of parties) sign(id, offer.members.indexOf(id) >= 0 ? 'cabinet' : 'support', ['pps', id],
        offer.members.indexOf(id) >= 0 ? ['membership', 'budget', 'no_dismissal'] : ['budget', 'no_dismissal'], ['pps', id]);
      if (offer.pps_mode === 'external_support') sign('pps_support', 'support', ['pps', offer.lead_party || offer.candidate_id], ['budget', 'no_dismissal'], ['pps']);
    } else {
      for (const id of offer.members.filter(m => m !== offer.lead_party)) sign(id, 'cabinet', [offer.lead_party, id], ['membership', 'budget', 'no_dismissal'], [id]);
      for (const id of offer.supporters) sign(id, 'support', [offer.candidate_id, id], ['budget', 'no_dismissal'], [id]);
    }
    const authority = Q.polish_presidency && Q.polish_presidency.current && Q.polish_presidency.current.office_id === 'prezydent_rp' ? 'president' : 'naczelnik_panstwa';
    S.cabinet = {id: cabinetId, pm: offer.candidate_id, pm_name: candidate.name, party: candidate.party, configuration_id: offer.configuration_id,
      status: 'active', pps_mode: offer.pps_mode, portfolios: copy(offer.portfolios), partner_ids: offer.members.slice(),
      supporter_ids: offer.supporters.slice(), appointment_basis: authority, pps_threat_discounted: false, programme: copy(offer.programme),
      formed_at: t, agreement_ids: agreementIds, support_seats: entry.forecast.yes, majority: entry.forecast.majority,
      previous_cabinet_id: previous ? previous.id : null, accepted_postulates: [], dismissal_motion: null, pending_threat: null,
      stabilisation_terms: offer.stabilisation_terms || 'none'};
    // The PPS toleration agreement: a PPS offer signs it as `pps_support`, a tolerated expert as `pps` (stage 6 fix).
    const support = agreementIds.map(id => S.agreements[id]).filter(a => a.kind === 'support' && a.parties.indexOf('pps') >= 0 &&
      (a.id === 'agr-' + cabinetId + '-pps_support' || a.id === 'agr-' + cabinetId + '-pps'))[0] || null;
    // The terms of 9.7 are rules of the toleration (P): the loan means no rapid stabilisation with cuts; the
    // protections add the full protection for the unemployed, operating by t+4, and the burden on wealth.
    if (support && (offer.stabilisation_terms === 'loan' || offer.stabilisation_terms === 'protections')) {
      support.obligations.push({id: support.id + ':stabilisation_terms', topic: 'stabilisation_terms', position: offer.stabilisation_terms,
        owner: 'cabinet', kind: 'constraint', beneficiaries: ['pps'], required_project: null, required_variants: null, required_stage: null,
        portfolio: 'finance', weight: 2, due_at: null, status: 'active', fulfillment: 1, last_checked: null});
    }
    if (support && offer.stabilisation_terms === 'protections') {
      support.obligations.push({id: support.id + ':worker_protection', topic: 'worker_protection', position: null, owner: 'cabinet',
        kind: 'programme', beneficiaries: ['pps'], required_project: 'worker_protection', required_variants: ['full'],
        required_stage: 'operating', portfolio: 'labor', weight: 2, due_at: t + 4, status: 'active', fulfillment: 0, last_checked: null});
    }
    // P (9.7): the toleration of Grabski is an agreement for six months with a review after three.
    if (support && offer.candidate_id === 'grabski' && offer.pps_mode === 'external_support') {
      support.term = {months: TOLERATION_MONTHS, review_at: t + TOLERATION_REVIEW, expires_at: t + TOLERATION_MONTHS,
        review_opened: false, renewal_opened: false, renewals: 0};
    }
    if (S.cabinet_crisis) {
      S.history.reasons.push({t: t, kind: 'cabinet_crisis_resolved', crisis_id: S.cabinet_crisis.id, cabinet_id: cabinetId});
      S.cabinet_crisis = null;
    }
    S.history.reasons.push({t: t, kind: 'cabinet_appointed', cabinet_id: cabinetId, by: authority});
  }

  // After the certified 1922 result the previous cabinet stays as caretaker until a new one is
  // appointed in the same sequence (8.8: the election result opens the mandatory formation).
  function beginPostElectionFormation(Q) {
    const S = Q.S;
    if (S.cabinet && S.cabinet.status === 'active') S.cabinet.status = 'caretaker';
    S.negotiation = null;
    return beginFormation(Q, {reason: 'post_election', mandatory: true, event_id: Q.sejm_pending ? Q.sejm_pending.id : null});
  }

  // The player's own initiative (1 T) during an open crisis or impasse (8.7); it needs a changed
  // offer or situation, never a free copy of the same offer.
  function initiativeAvailable(Q) {
    const S = Q.S;
    if (!S || !S.cabinet_crisis || S.chapter.status === 'ended') return false;
    if (S.negotiation && S.negotiation.phase === 'draft' && S.negotiation.mandatory) return false;
    if (formationDue(Q)) return false; // the mandatory formation comes first, free of charge
    // An expert tolerated by PPS is always a possible offer, so a candidate and a partner exist.
    return true;
  }

  // A refused offer is not submitted again unchanged: the next attempt needs a changed offer or a
  // changed situation (8.3, C2).
  function submitStatus(Q) {
    const S = Q.S, neg = S.negotiation, crisis = S.cabinet_crisis;
    if (!neg || neg.phase !== 'draft') return {available: false, reason: 'No offer is being prepared.'};
    if (formationCost(Q, neg) && (Q.month_actions || 0) >= 1) return {available: false, reason: 'This month’s action has already been used.'};
    const draft = neg.draft;
    if (draft.pps_mode !== 'opposition') {
      const config = configurationStatus(Q, draft.configuration_id, neg.context);
      if (!config.available) return {available: false, reason: config.reason};
      const candidate = candidateStatus(Q, draft.candidate_id, draft);
      if (!candidate.available) return {available: false, reason: candidate.reason};
    }
    if (crisis && crisis.last_pps_draft && JSON.stringify(crisis.last_pps_draft) === JSON.stringify(draft) && !situationChanged(Q)) {
      return {available: false, reason: 'The same offer was refused and nothing has changed since.'};
    }
    return {available: true, reason: ''};
  }

  // The mandatory formation after a fall returns when nothing is being negotiated and either no
  // attempt was made yet or the situation has changed since the last one (8.7).
  function formationDue(Q) {
    const S = Q.S, crisis = S && S.cabinet_crisis;
    if (!crisis || S.chapter.status === 'ended') return false;
    if (S.negotiation && S.negotiation.phase === 'draft' && S.negotiation.mandatory) return false;
    if (crisis.last_attempt_at === null) return true;
    return crisis.last_attempt_at < Q.time && situationChanged(Q);
  }

  // Entering the formation card. An offer being prepared is kept while its settings change (free);
  // a due mandatory formation replaces a draft of the player's own initiative, and a draft left
  // unsent in an earlier month starts again.
  function enterFormation(Q) {
    const S = Q.S, neg = S.negotiation;
    const due = formationDue(Q);
    if (neg && neg.kind === 'cabinet' && neg.phase === 'draft' && (neg.mandatory || (!due && neg.opened_at === Q.time))) return neg;
    S.negotiation = null;
    if (due) return beginFormation(Q, {reason: 'crisis', mandatory: true, event_id: S.cabinet_crisis.id});
    return beginFormation(Q, {reason: 'initiative', mandatory: false, event_id: S.cabinet_crisis ? S.cabinet_crisis.id : null});
  }

  // The route of main and post_event: a due formation, or a mandatory one already being prepared.
  function formationPending(Q) {
    const S = Q.S;
    if (!S || S.chapter.status === 'ended') return false;
    const neg = S.negotiation;
    return formationDue(Q) || !!(neg && neg.kind === 'cabinet' && neg.phase === 'draft' && neg.mandatory);
  }

  // The formation card is visible during a mandatory formation, when one is due, and as the
  // player's own initiative during an open crisis.
  function formationVisible(Q) {
    const S = Q.S;
    if (!S || S.chapter.status === 'ended') return false;
    const neg = S.negotiation;
    if (neg && neg.kind === 'cabinet' && neg.phase === 'draft' && neg.mandatory) return true;
    return formationDue(Q) || initiativeAvailable(Q);
  }

  // The stabilisation event (9.11, B14) leads to this same formation card: the toleration offer to Grabski, when PPS
  // can make an offer now — a mandatory formation or its own initiative in an open crisis (stage 6).
  function tolerationOfferStatus(Q) {
    if (!formationVisible(Q)) return {available: false, reason: 'A toleration offer needs an open cabinet crisis in which PPS can make an offer.'};
    return candidateStatus(Q, 'grabski', {configuration_id: 'expert', pps_mode: 'external_support'});
  }

  // Opens the formation with Grabski tolerated by PPS and, when the talks are open, the protections as its terms;
  // everything stays editable on the one screen and the usual cost applies at the commit (9.7, 8.8).
  function openTolerationOffer(Q) {
    const status = tolerationOfferStatus(Q);
    if (!status.available) throw new Error('openTolerationOffer: ' + status.reason);
    const neg = enterFormation(Q);
    setDraft(Q, 'configuration_id', 'expert');
    setDraft(Q, 'candidate_id', 'grabski');
    setDraft(Q, 'pps_mode', 'external_support');
    if (stabilisationTermsStatus('protections', Q).available) setDraft(Q, 'stabilisation_terms', 'protections');
    return neg;
  }

  // PPS chooses its portfolios only as a member of a cabinet whose portfolios are not fixed.
  function draftPortfolioChoice(Q) {
    const neg = Q.S.negotiation;
    if (!neg || neg.phase !== 'draft') return false;
    const config = CONFIGURATIONS[neg.draft.configuration_id];
    return neg.draft.pps_mode === 'member' && !config.expert && !config.majority_alone && !config.portfolio_map;
  }

  // The result screen: the partners' answers with reasons and who was appointed.
  function formationResultView(Q) {
    const S = Q.S;
    const neg = S.history.negotiations.filter(n => n.kind === 'cabinet').slice(-1)[0];
    if (!neg || !neg.result) return null;
    const r = neg.result;
    const lines = [];
    if (r.pps_offer) {
      for (const e of r.pps_offer.evaluations) {
        lines.push(ACTOR_PROFILES[e.actor].name + ': ' + (e.accept ? 'accepts (' + e.score.toFixed(1) + ')' : 'refuses — ' + e.reasons.join('; ')));
      }
    }
    const crisis = S.cabinet_crisis;
    return {
      offer: r.pps_offer ? (CONFIGURATIONS[r.pps_offer.configuration_id].name + ' with ' + CANDIDATES[r.pps_offer.candidate_id].name +
        (r.pps_offer.accepted ? ': accepted' : ': not accepted (' + r.pps_offer.reason + ')')) : 'PPS stays in opposition',
      forecast: r.pps_offer ? r.pps_offer.forecast.yes + ' MPs for, ' + r.pps_offer.forecast.no + ' against, ' + r.pps_offer.forecast.abstain + ' abstaining' : '',
      answers: lines.join(' | '),
      appointed: r.appointed ? r.appointed.pm_name + ' — ' + CONFIGURATIONS[r.appointed.configuration_id].name + ', ' + r.appointed.support_seats +
        ' MPs declared for it' + (r.appointed.majority ? ' (majority)' : ' (minority)') + (r.appointed.by === 'npc' ? '; formed without PPS' : '') : '',
      failed: r.appointed ? '' : (crisis && crisis.status === 'impasse' ? 'No cabinet could be appointed. After three failed proposals the crisis is an impasse: the caretaker cabinet governs.' :
        'No cabinet could be appointed. The caretaker cabinet governs; the crisis stays open.'),
    };
  }

  // Fields that inherited scenes read, written only from the cabinet record.
  function writeGovernmentMirrors(Q) {
    const S = Q.S, cabinet = S.cabinet;
    if (!cabinet) return;
    const live = cabinet.status === 'active' || cabinet.status === 'caretaker';
    const member = live && cabinet.pps_mode === 'member';
    Q.spd_in_government = member ? 1 : 0;
    Q.pps_in_government = member ? 1 : 0;
    for (const party of ['kpp', 'npr', 'psl_wyzwolenie', 'psl_piast', 'pschd', 'zln', 'minorities_bloc', 'other']) {
      Q[party + '_in_government'] = live && cabinet.partner_ids.indexOf(party) >= 0 ? 1 : 0;
    }
    Q.pps_external_toleration = live && cabinet.pps_mode === 'external_support' ? 1 : 0;
    Q.minorities_toleration = live && cabinet.supporter_ids.some(id => SEGMENTS.indexOf(id) >= 0) ? 1 : 0;
    // A minority government in the classical sense: its member parties have no majority of their own,
    // whatever external support it has.
    Q.in_minority_government = live && cabinet.id !== 'ponikowski_1' && cabinet.partner_ids.length > 0 &&
      seatsOfList(S, cabinet.partner_ids) < majorityRequired(S) ? 1 : 0;
    Q.in_spd_majority = member && cabinet.configuration_id === 'pps_majority' ? 1 : 0;
    Q.in_polish_left_coalition = member && (cabinet.configuration_id === 'left_minority' || cabinet.configuration_id === 'left_labour') ? 1 : 0;
    Q.in_polish_center_left_coalition = member && cabinet.configuration_id === 'centre_left' ? 1 : 0;
    Q.in_chjeno_piast = live && cabinet.configuration_id === 'chjeno_piast' ? 1 : 0;
    Q.chancellor = cabinet.pm_name;
    Q.chancellor_party = cabinet.party || 'expert_cabinet';
    Q.polish_cabinet_id = cabinet.id;
    Q.polish_opening_government_active = cabinet.id === 'ponikowski_1' && cabinet.status === 'active' ? 1 : 0;
    for (const key of PORTFOLIOS) {
      const owner = cabinet.portfolios[key];
      Q[key + '_minister_party'] = owner === 'expert' ? (cabinet.id === 'ponikowski_1' ? 'opening_expert_cabinet' : 'expert') : owner;
      Q[key + '_minister'] = '';
    }
    Q.public_works_minister_party = '';
    Q.public_works_minister = '';
    // Leak 2 of 20.2: the German coalition-dissent counter no longer has an effect.
    Q.coalition_dissent = 0;
    Q.kpd_coalition_dissent = 0;
  }

  function governmentDisplay(Q) {
    const S = Q.S, cabinet = S.cabinet, crisis = S.cabinet_crisis;
    if (!cabinet) return null;
    const config = CONFIGURATIONS[cabinet.configuration_id] || {name: 'Cabinet'};
    const opening = cabinet.id === 'ponikowski_1';
    const pm = cabinet.pm_name + (opening ? '' : cabinet.party ? ' (' + ACTOR_PROFILES[cabinet.party].name + ')' : ' (non-party)');
    const status = cabinet.status === 'caretaker' ? ' — caretaker cabinet' : '';
    const own = PORTFOLIOS.filter(key => cabinet.portfolios[key] === 'pps').map(key => PORTFOLIO_SHORT[key]);
    // The opening keeps its careful wording (2.4): a predominantly expert cabinet, toleration TBD.
    const position = cabinet.pps_mode === 'member' ? 'In the cabinet' + (own.length ? ': ' + own.join(', ') : '') :
      cabinet.pps_mode === 'external_support' ? (opening ? 'External toleration of Ponikowski; outside the cabinet; no PPS ministries' :
        'Supports the cabinet from outside; no PPS ministries') : 'Opposition';
    return {
      prime_minister: pm + ' — ' + (opening ? 'predominantly expert cabinet' : config.name) + status,
      pps_position: position,
      // The opening cabinet records no declared support until a withdrawal recounts it (9.4).
      support: cabinet.support_seats === undefined ? 'Opening cabinet; support not recorded' :
        cabinet.support_seats + ' MPs declared for the cabinet' + (cabinet.majority ? ' (majority)' : ' (minority)'),
      crisis: crisis ? (crisis.status === 'impasse' ? 'Impasse: the caretaker cabinet governs; a new formation needs a new candidate or a real change of support.' :
        'Cabinet crisis: the caretaker cabinet governs until a new cabinet is appointed.') : '',
      portfolios: PORTFOLIOS.map(key => ({key: key, name: PORTFOLIO_NAMES[key],
        owner: cabinet.id === 'ponikowski_1' ? 'Cabinet-administered; outside PPS control' : describeParty(cabinet.portfolios[key])})),
    };
  }

  // The strike-talk fragility of 17.4: 50 − (support − 222) + 0.5 × the highest agreement tension,
  // bounded 0–100; a caretaker cabinet is 100.
  function governmentFragility(S) {
    const cabinet = S.cabinet;
    if (!cabinet || cabinet.status !== 'active') return 100;
    const tension = (cabinet.agreement_ids || []).map(id => (S.agreements[id] || {}).tension || 0);
    return clip(50 - ((cabinet.support_seats || 222) - 222) + 0.5 * (tension.length ? Math.max(...tension) : 0), 0, 100);
  }

  // ---- Agreements: obligations, tension, warnings and ultimatums (9.1–9.4) --------------------------

  const TENSION_WARNING = 40;
  const TENSION_ULTIMATUM = 60;
  const ULTIMATUM_MONTHS = 2;
  const EXTENSION_MONTHS = 3;
  const SUPPORT_COOLDOWN_MONTHS = 3;
  const FORCED_CONCESSION_RELATION = -3;
  const THREAT_BACKDOWN_CREDIBILITY = -5;

  // Demands PPS can make of a cabinet (9.8). Worker protection is the P example of 9.1 and of M02:
  // financed protection (fiscal +2), the protection project operating in full within 4 months, weight 2,
  // executed by Labour. Since stage 4 the accepted promise has its date (decision 3 of stage 4).
  const POSTULATES = Object.freeze({
    worker_protection: Object.freeze({id: 'worker_protection', name: 'Financed worker protection',
      programme: Object.freeze({fiscal: 2}), required_project: 'worker_protection', required_variants: Object.freeze(['full']),
      required_stage: 'operating', portfolio: 'labor', weight: 2, months: 4}),
  });
  const TEST_PROGRAMME = POSTULATES.worker_protection;

  function liveObligation(o) {
    return (o.status === 'active' || o.status === 'breached') && o.due_at !== null && o.due_at !== undefined;
  }

  function overdueObligation(o, t) {
    return liveObligation(o) && o.due_at < t && (o.fulfillment || 0) < 1;
  }

  function findObligation(agreement, id) {
    return agreement.obligations.filter(o => o.id === id)[0] || null;
  }

  // PPS answers for an obligation it owns, or for one of a cabinet it sits in (17.4: culpable). Since
  // stage 4 (5.4) an obligation executed by a named portfolio is PPS's own only when PPS holds that
  // portfolio: non-execution by another ministry is that executor's failure, not a broken PPS promise.
  function ppsResponsible(S, agreement, obligation) {
    if (obligation.owner === 'pps') return true;
    if (obligation.owner !== 'cabinet' || !S.cabinet || agreement.cabinet_id !== S.cabinet.id || S.cabinet.partner_ids.indexOf('pps') < 0) return false;
    return !obligation.portfolio || S.cabinet.portfolios[obligation.portfolio] === 'pps';
  }

  // The party that warns and sets an ultimatum: a beneficiary of an overdue obligation other than PPS
  // and the cabinet's own party. PPS decides its own reaction with card 7.6.
  function aggrievedPartner(S, agreement, overdue) {
    const lead = S.cabinet && agreement.cabinet_id === S.cabinet.id ? S.cabinet.party : null;
    const ids = [];
    for (const o of overdue) for (const id of o.beneficiaries || []) {
      if (id !== 'pps' && id !== lead && agreement.parties.indexOf(id) >= 0 && ids.indexOf(id) < 0) ids.push(id);
    }
    return ids.sort(compareId)[0] || null;
  }

  // One obligation added to an agreement, with its due date (`live: false` keeps it without a date,
  // waiting for a later stage).
  function addObligation(Q, agreementId, spec) {
    const agreement = Q.S.agreements[agreementId];
    if (!agreement) throw new Error('addObligation: no agreement ' + agreementId);
    const live = spec.live !== false;
    const obligation = {id: agreementId + ':' + spec.id, topic: spec.topic || spec.id, position: null, owner: spec.owner || 'cabinet',
      kind: 'programme', beneficiaries: (spec.beneficiaries || []).slice(), required_project: spec.required_project || null,
      required_variants: spec.required_variants ? spec.required_variants.slice() : null, required_stage: spec.required_stage || null,
      portfolio: spec.portfolio || null, weight: spec.weight, due_at: live ? Q.time + spec.months : null,
      status: live ? 'active' : 'awaiting_later_stage', fulfillment: 0, last_checked: null};
    if (findObligation(agreement, obligation.id)) throw new Error('addObligation: ' + obligation.id + ' already exists');
    agreement.obligations.push(obligation);
    agreement.history.push({t: Q.time, kind: 'obligation_added', obligation_id: obligation.id});
    return obligation;
  }

  // Progress reported by the obligation's executor (projects from stage 4; fixtures in tests).
  function setFulfillment(Q, agreementId, obligationId, value) {
    const obligation = findObligation(Q.S.agreements[agreementId], obligationId);
    if (!obligation) throw new Error('setFulfillment: no obligation ' + obligationId);
    obligation.fulfillment = clip(value, 0, 1);
    obligation.last_checked = Q.time;
    return obligation;
  }

  // 9.3: fulfilled parts of the weights over the weights of the active requirements.
  function weightedFulfillment(agreement) {
    const counted = agreement.obligations.filter(o => liveObligation(o) || o.status === 'fulfilled');
    const total = counted.reduce((n, o) => n + o.weight, 0);
    return total ? counted.reduce((n, o) => n + o.weight * Math.min(1, o.fulfillment || 0), 0) / total : 1;
  }

  function endAgreement(agreement, status, t, by, reason) {
    agreement.status = status;
    agreement.ended_at = t;
    if (agreement.ultimatum && agreement.ultimatum.status === 'open') agreement.ultimatum.status = 'void';
    if (agreement.response) agreement.response.used = true;
    agreement.history.push({t: t, kind: status, by: by || null, reason: reason || null});
  }

  function closeUltimatum(agreement, status, t) {
    agreement.ultimatum.status = status;
    agreement.ultimatum.closed_at = t;
    agreement.history.push({t: t, kind: 'ultimatum_' + status, ultimatum_id: agreement.ultimatum.id});
    if (agreement.response && agreement.response.kind === 'ultimatum') agreement.response.used = true;
  }

  const TOLERATION_MONTHS = 6;
  const TOLERATION_REVIEW = 3;

  // A warning or an ultimatum gives PPS one guaranteed 0 T answer (9.8), once per case; so do the review and the
  // end of a toleration agreement with a term (9.7).
  function openResponse(agreement, kind, by, t) {
    agreement.response = {case_id: kind + ':' + agreement.id + ':t' + t, kind: kind, by: by, opened_at: t, used: false};
  }

  // Once a month in the settlement (4.2 step 6; 9.2): fulfilment and breaches, tension, then warnings,
  // ultimatums and their expiry, and a dismissal motion left without an answer. Returns the events.
  function settleAgreements(Q) {
    const S = Q.S, t = Q.time, events = [];
    for (const id of Object.keys(S.agreements).sort()) {
      const agreement = S.agreements[id];
      if (agreement.status !== 'active' && agreement.status !== 'breached') continue;
      let fulfilled = 0;
      for (const o of agreement.obligations) {
        if (!liveObligation(o) || (o.fulfillment || 0) < 1) continue;
        o.status = 'fulfilled';
        o.fulfilled_at = t;
        fulfilled += 1;
        agreement.history.push({t: t, kind: 'fulfilled', obligation_id: o.id});
        if (ppsResponsible(S, agreement, o)) changeCredibility(Q, 'fulfilled:' + o.id, 3, 'fulfilled');
      }
      const overdue = agreement.obligations.filter(o => overdueObligation(o, t));
      for (const o of overdue) {
        o.last_checked = t;
        if (o.status === 'breached') continue;
        o.status = 'breached';
        o.breached_at = t;
        agreement.history.push({t: t, kind: 'breach', obligation_id: o.id});
        if (ppsResponsible(S, agreement, o)) changeCredibility(Q, 'breach:' + o.id, -5, 'breach');
      }
      const redLines = agreement.history.filter(h => h.kind === 'red_line_breach' && !h.counted_at);
      for (const h of redLines) h.counted_at = t;
      // unagreedBurdenPoints (0–3) of packages adopted against this partner's vote (P, stage 4), once each.
      const burdens = agreement.history.filter(h => h.kind === 'unagreed_burden' && !h.counted_at);
      for (const h of burdens) h.counted_at = t;
      const burdenPoints = Math.min(3, burdens.reduce((n, h) => n + (h.points || 0), 0));
      const delta = Math.min(20, 8 * overdue.reduce((n, o) => n + o.weight, 0)) + 15 * redLines.length + 4 * burdenPoints - 12 * fulfilled;
      agreement.tension = clip(agreement.tension + delta, 0, 100);
      agreement.status = overdue.length ? 'breached' : 'active';
      if (delta) agreement.history.push({t: t, kind: 'tension', delta: delta, tension: agreement.tension});
      const ultimatum = agreement.ultimatum;
      if (ultimatum && ultimatum.status === 'open') {
        const open = ultimatum.cause_ids.filter(oid => {
          const o = findObligation(agreement, oid);
          return !!o && overdueObligation(o, t);
        });
        if (!open.length) {
          closeUltimatum(agreement, 'lifted', t);
          events.push({kind: 'ultimatum_lifted', agreement_id: id, by: ultimatum.by});
        } else if (t >= ultimatum.due_at) {
          closeUltimatum(agreement, 'executed', t);
          events.push({kind: 'partner_withdrew', agreement_id: id, by: ultimatum.by});
          withdrawAgreement(Q, agreement, ultimatum.by, 'ultimatum');
          continue;
        }
      }
      // 9.7 (P): the review after three months and the end of the six-month term each open the answer of 9.8
      // once, when no other case of this agreement waits; without an answer the toleration goes on unchanged.
      const term = agreement.term;
      if (term && (!agreement.response || agreement.response.used)) {
        const by = agreement.parties.filter(p => p !== 'pps')[0];
        if (!term.review_opened && t >= term.review_at && t < term.expires_at) {
          term.review_opened = true;
          agreement.history.push({t: t, kind: 'term_review', by: by});
          openResponse(agreement, 'review', by, t);
          events.push({kind: 'review', agreement_id: id, by: by});
        } else if (!term.renewal_opened && t >= term.expires_at) {
          term.renewal_opened = true;
          agreement.history.push({t: t, kind: 'term_end', by: by});
          openResponse(agreement, 'renewal', by, t);
          events.push({kind: 'renewal', agreement_id: id, by: by});
        }
      }
      const partner = aggrievedPartner(S, agreement, overdue);
      if (!partner) continue;
      if (agreement.tension >= TENSION_WARNING && !agreement.warning_issued) {
        agreement.warning_issued = true;
        agreement.history.push({t: t, kind: 'warning', by: partner});
        openResponse(agreement, 'warning', partner, t);
        events.push({kind: 'warning', agreement_id: id, by: partner});
      }
      if (agreement.tension >= TENSION_ULTIMATUM && (!agreement.ultimatum || agreement.ultimatum.status !== 'open')) {
        agreement.ultimatum = {id: 'ult-' + id + '-t' + t, issued_at: t, due_at: t + ULTIMATUM_MONTHS, by: partner,
          cause_ids: overdue.map(o => o.id), status: 'open'};
        agreement.history.push({t: t, kind: 'ultimatum', ultimatum_id: agreement.ultimatum.id, by: partner, due_at: t + ULTIMATUM_MONTHS});
        openResponse(agreement, 'ultimatum', partner, t);
        events.push({kind: 'ultimatum', agreement_id: id, by: partner});
      }
    }
    // A motion that PPS did not answer is voted at the next settlement, PPS abstaining (decision 7).
    const cabinet = S.cabinet;
    if (cabinet && cabinet.dismissal_motion && cabinet.dismissal_motion.status === 'open' && cabinet.dismissal_motion.opened_at < t) {
      const ballot = decideDismissal(Q, 'unanswered');
      events.push({kind: 'dismissal_vote', result: ballot.result});
    }
    S.history.reasons.push({t: t, kind: 'agreements_settled', events: events.length});
    return events;
  }

  // ---- Leaving a cabinet, dismissal and fall (9.4, 7.1) ----------------------------------------------

  function cabinetAsOffer(S) {
    const cabinet = S.cabinet;
    return {by: cabinet.partner_ids.indexOf('pps') >= 0 ? 'pps' : 'npc', kind: 'cabinet', members: cabinet.partner_ids.slice(),
      supporters: cabinet.supporter_ids.slice(), programme: cabinet.programme, portfolios: cabinet.portfolios, minority_terms: [],
      lead_party: cabinet.party, configuration_id: cabinet.configuration_id, candidate_id: cabinet.pm};
  }

  function cabinetFalls(Q, reason) {
    const S = Q.S, cabinet = S.cabinet;
    cabinet.fell_at = Q.time;
    cabinet.fall_reason = reason;
    cabinet.status = 'caretaker';
    if (cabinet.dismissal_motion && cabinet.dismissal_motion.status === 'open') cabinet.dismissal_motion.status = 'void';
    openCrisis(Q, 'cabinet_fall', cabinet.id);
    S.history.reasons.push({t: Q.time, kind: 'cabinet_fell', cabinet_id: cabinet.id, reason: reason});
  }

  // 9.4: withdrawal of support → recount of the declared votes → a minority government (a replacement
  // agreement is the next formation) → the dismissal vote or the premier's resignation → formation.
  // Seats never disappear and no election follows. The premier resigns when his own party leaves.
  function leaveCabinet(Q, partyId, reason) {
    const S = Q.S, cabinet = S.cabinet, t = Q.time;
    for (const id of cabinet.agreement_ids) {
      const agreement = S.agreements[id];
      if (agreement && agreement.parties.indexOf(partyId) >= 0 && (agreement.status === 'active' || agreement.status === 'breached')) {
        endAgreement(agreement, 'withdrawn', t, partyId, reason);
      }
    }
    const member = cabinet.partner_ids.indexOf(partyId) >= 0;
    cabinet.partner_ids = cabinet.partner_ids.filter(id => id !== partyId);
    cabinet.supporter_ids = cabinet.supporter_ids.filter(id => id !== partyId);
    if (member) for (const key of PORTFOLIOS) if (cabinet.portfolios[key] === partyId) cabinet.portfolios[key] = 'expert';
    if (partyId === 'pps') cabinet.pps_mode = 'opposition';
    const fc = forecast(Q, cabinetAsOffer(S), cabinet.partner_ids.concat(cabinet.supporter_ids));
    cabinet.support_seats = fc.yes;
    cabinet.majority = fc.majority;
    S.history.reasons.push({t: t, kind: 'support_withdrawn', party: partyId, cabinet_id: cabinet.id, reason: reason, support_seats: fc.yes});
    if (partyId === cabinet.party) {
      cabinetFalls(Q, 'resignation');
      return {fell: true, motion: null};
    }
    cabinet.dismissal_motion = {id: 'motion-' + cabinet.id + '-t' + t + '-' + partyId, opened_at: t, after_withdrawal_of: partyId,
      status: 'open', pps_vote: null, ballot_id: null, successor: null};
    return {fell: false, motion: cabinet.dismissal_motion};
  }

  // A partner's withdrawal after an ultimatum; when PPS is bound to the cabinet it votes against the
  // motion at once, otherwise PPS answers the motion with a 0 T response.
  function withdrawAgreement(Q, agreement, partyId, reason) {
    const S = Q.S, cabinet = S.cabinet;
    const inCabinet = cabinet && agreement.cabinet_id === cabinet.id && cabinet.status === 'active' &&
      (cabinet.partner_ids.indexOf(partyId) >= 0 || cabinet.supporter_ids.indexOf(partyId) >= 0);
    if (!inCabinet) {
      endAgreement(agreement, 'withdrawn', Q.time, partyId, reason);
      return;
    }
    const left = leaveCabinet(Q, partyId, reason);
    if (left.motion && ppsBound(S)) decideDismissal(Q, 'bound');
  }

  function ppsBound(S) {
    const cabinet = S.cabinet;
    return !!cabinet && (cabinet.partner_ids.indexOf('pps') >= 0 || cabinet.supporter_ids.indexOf('pps') >= 0);
  }

  // The constructive vote of 7.1 exists only after the reform of 7.6. The record of the law in force is
  // Q.polish_presidency.constitution.reforms; S.parliament.constructive_vonc is only its adapter (7.6).
  function constructiveVoteRequired(S, Q) {
    const reforms = Q && Q.polish_presidency && Q.polish_presidency.constitution && Q.polish_presidency.constitution.reforms;
    return !!(reforms && reforms.constructive_vonc) || !!S.parliament.constructive_vonc;
  }

  function dismissalSupportStatus(Q) {
    const S = Q.S, motion = S.cabinet && S.cabinet.dismissal_motion;
    if (!motion || motion.status !== 'open') return {available: false, reason: 'No motion to dismiss the cabinet is open.'};
    if (ppsBound(S)) return {available: false, reason: 'PPS is bound to this cabinet by its agreement.'};
    if (constructiveVoteRequired(S, Q) && !motion.successor) {
      return {available: false, reason: 'After the constructive-vote reform a dismissal needs an agreed successor with 223 votes.'};
    }
    return {available: true, reason: ''};
  }

  // The dismissal vote (7.1; art. 58): the parties bound to the cabinet vote against; the other clubs
  // by their view of its programme (decision 7): below 40 for the dismissal, otherwise they abstain;
  // KPP and "Inne" abstain; PPS votes as decided. All clubs attend.
  function dismissalBallot(Q, ppsVote) {
    const S = Q.S, cabinet = S.cabinet, motion = cabinet.dismissal_motion;
    const bound = cabinet.partner_ids.concat(cabinet.supporter_ids);
    const offer = cabinetAsOffer(S);
    const clubVotes = {};
    let yes = 0, no = 0, abstain = 0;
    for (const club of S.parliament.clubs) {
      let vote;
      if (club.id === 'pps') vote = ppsVote;
      else if (bound.indexOf(club.id) >= 0) vote = 'no';
      else if (club.id === 'kpp' || !ACTOR_PROFILES[club.id]) vote = 'abstain';
      else vote = programmeStance(S, club.id, offer) < 40 ? 'yes' : 'abstain';
      clubVotes[club.id] = {vote: vote, seats: club.seats};
      if (vote === 'yes') yes += club.seats; else if (vote === 'no') no += club.seats; else abstain += club.seats;
    }
    const total = S.parliament.clubs.reduce((n, club) => n + club.seats, 0);
    return institutions.resolveBallot('cabinet_dismissal', {id: 'ballot-' + motion.id, issue_id: motion.id, yes: yes, no: no,
      abstain: abstain, present: total, eligible: total, club_votes: clubVotes});
  }

  // choice: 'support' | 'refuse' (PPS abstains) | 'bound' (PPS votes against) | 'unanswered' (abstains).
  function decideDismissal(Q, choice) {
    const S = Q.S, cabinet = S.cabinet, motion = cabinet && cabinet.dismissal_motion;
    if (!motion || motion.status !== 'open') throw new Error('decideDismissal: no open motion');
    if (choice === 'support' && !dismissalSupportStatus(Q).available) throw new Error('decideDismissal: ' + dismissalSupportStatus(Q).reason);
    const vote = ppsBound(S) ? 'no' : (choice === 'support' ? 'yes' : 'abstain');
    motion.pps_vote = vote;
    motion.answer = choice;
    const ballot = dismissalBallot(Q, vote);
    S.ballots.push(ballot);
    motion.ballot_id = ballot.id;
    motion.decided_at = Q.time;
    motion.status = ballot.result === 'passed' ? 'passed' : 'failed';
    S.history.reasons.push({t: Q.time, kind: 'dismissal_vote', motion_id: motion.id, result: ballot.result, yes: ballot.yes,
      no: ballot.no, abstain: ballot.abstain});
    if (ballot.result === 'passed') cabinetFalls(Q, 'dismissal');
    return ballot;
  }

  // ---- The government-support card (7.6; 9.8, M11) -----------------------------------------------------

  function ppsStance(S) {
    const cabinet = S.cabinet;
    if (!cabinet || cabinet.status !== 'active') return 'none';
    if (cabinet.partner_ids.indexOf('pps') >= 0) return 'member';
    if (cabinet.supporter_ids.indexOf('pps') >= 0) return 'supporter';
    return 'opposition';
  }

  // The agreements between PPS and the cabinet: its own programme and support promises.
  function ppsAgreements(S) {
    const cabinet = S.cabinet;
    return (cabinet ? cabinet.agreement_ids : []).filter(id => {
      const agreement = S.agreements[id];
      return agreement && agreement.parties.indexOf('pps') >= 0 && (agreement.status === 'active' || agreement.status === 'breached');
    });
  }

  // The open 0 T case: a partner's warning or ultimatum, or a motion PPS may support from opposition.
  function responseCase(Q) {
    const S = Q.S;
    if (!S || S.chapter.status === 'ended' || !S.cabinet) return null;
    for (const id of ppsAgreements(S)) {
      const response = S.agreements[id].response;
      if (response && !response.used) return {kind: response.kind, agreement_id: id, by: response.by, case_id: response.case_id};
    }
    const motion = S.cabinet.dismissal_motion;
    if (motion && motion.status === 'open' && !ppsBound(S) && motion.after_withdrawal_of !== 'pps') {
      return {kind: 'motion', motion_id: motion.id, by: motion.after_withdrawal_of, case_id: motion.id};
    }
    return null;
  }

  function supportCardAvailable(Q) {
    const S = Q.S;
    if (!S || S.chapter.status === 'ended' || formationPending(Q)) return false;
    const stance = ppsStance(S);
    if (stance !== 'member' && stance !== 'supporter') return false;
    return rules.cooldownRemaining(Q, 'support.' + S.cabinet.id) === 0;
  }

  // Who answers a PPS demand: the parties of the cabinet and its supporters other than PPS, and a
  // non-party premier (8.3, M02: the premier evaluates the offer).
  function demandEvaluators(S) {
    const cabinet = S.cabinet;
    const ids = cabinet.partner_ids.concat(cabinet.supporter_ids).filter(id => id !== 'pps' && profileOf(id));
    if (!cabinet.party && profileOf(cabinet.pm) && ids.indexOf(cabinet.pm) < 0) ids.push(cabinet.pm);
    return ids;
  }

  function demandOffer(S, postulate) {
    const offer = cabinetAsOffer(S);
    offer.by = 'pps';
    offer.kind = 'support_demand';
    offer.programme = Object.assign({}, S.cabinet.programme, postulate.programme);
    offer.postulate_id = postulate.id;
    return offer;
  }

  // How much the cabinet needs PPS (M11): 0 when it keeps a majority without PPS; otherwise the need
  // of 8.3 from the evaluator's best alternative.
  function governmentNeed(Q, actorId, offer) {
    const S = Q.S, cabinet = S.cabinet;
    const without = cabinet.partner_ids.concat(cabinet.supporter_ids).filter(id => id !== 'pps');
    if (seatsOfList(S, without) >= majorityRequired(S)) return 0;
    return needFor(ACTOR_PROFILES[actorId] ? bestAlternativeScore(Q, actorId, offer, {reason: 'support'}) : 0, 0);
  }

  function postulateStatus(Q, postulateId) {
    const S = Q.S, cabinet = S.cabinet, postulate = POSTULATES[postulateId];
    if (!postulate) return {available: false, reason: 'Unknown demand.'};
    if (cabinet.accepted_postulates.indexOf(postulateId) >= 0) return {available: false, reason: 'This cabinet has already accepted it.'};
    const same = Object.keys(postulate.programme).every(topic => cabinet.programme[topic] === postulate.programme[topic]);
    if (same) return {available: false, reason: 'The cabinet programme already contains it.'};
    if (!demandEvaluators(S).length) return {available: false, reason: 'Nobody in the cabinet can answer this demand.'};
    return {available: true, reason: ''};
  }

  // One commit of card 7.6: an ordinary use costs 1 T and starts the 3-month renewal for this cabinet;
  // an answer to an open case costs 0 T, once per case (9.8).
  function commitSupport(Q, mode, action) {
    const S = Q.S;
    if (mode === 'response') {
      const open = responseCase(Q);
      if (!open) throw new Error('commitSupport: no open case to answer');
      if (open.agreement_id) S.agreements[open.agreement_id].response.used = true;
      S.history.actions.push({t: Q.time, action_id: 'parliament.government_support.' + action, case_id: open.case_id, cost_t: 0});
      return open;
    }
    rules.commitMainAction(Q, 'parliament.government_support', {option: action, cabinet_id: S.cabinet.id});
    S.cooldowns['support.' + S.cabinet.id] = Q.time + SUPPORT_COOLDOWN_MONTHS;
    return null;
  }

  function supportOptionStatus(Q, action, mode) {
    const S = Q.S, stance = ppsStance(S);
    const open = mode === 'response' ? responseCase(Q) : null;
    if (mode === 'response' && !open) return {available: false, reason: 'There is no open case to answer.'};
    if (mode !== 'response' && (Q.month_actions || 0) >= 1) return {available: false, reason: 'This month’s action has already been used.'};
    if (action === 'withdraw') {
      if (stance !== 'member' && stance !== 'supporter') return {available: false, reason: 'PPS does not support this cabinet.'};
      return {available: true, reason: ''};
    }
    if (action === 'maintain') {
      if (!open || open.kind === 'motion') return {available: false, reason: 'Only as an answer to a partner’s warning or ultimatum.'};
      return {available: true, reason: ''};
    }
    if (action === 'bargain' || action === 'persuade') {
      if (stance !== 'member' && stance !== 'supporter') return {available: false, reason: 'PPS does not support this cabinet.'};
      return postulateStatus(Q, 'worker_protection');
    }
    if (action === 'extension') return extensionStatus(Q);
    if (action === 'support_dismissal') return dismissalSupportStatus(Q);
    if (action === 'refuse_dismissal') {
      const motion = S.cabinet && S.cabinet.dismissal_motion;
      return motion && motion.status === 'open' && !ppsBound(S) ? {available: true, reason: ''} : {available: false, reason: 'No motion to answer.'};
    }
    return {available: false, reason: 'Unknown option.'};
  }

  // bargain: the demand is a condition of further support, with the cabinet's need of PPS (8.3); an
  // accepted threat costs each accepting party 3 relation; a refusal asks at once: carry the threat
  // out or back down. persuade: need 0, no relation change either way (M11).
  function supportDemand(Q, kind, postulateId, mode) {
    const S = Q.S, cabinet = S.cabinet, t = Q.time;
    if (kind !== 'bargain' && kind !== 'persuade') throw new Error('supportDemand: unknown kind ' + kind);
    const status = supportOptionStatus(Q, kind, mode);
    if (!status.available) throw new Error('supportDemand: ' + status.reason);
    syncRelations(Q);
    const postulate = POSTULATES[postulateId];
    const offer = demandOffer(S, postulate);
    const discounted = kind === 'bargain' && cabinet.pps_threat_discounted;
    const evaluations = demandEvaluators(S).map(id =>
      evaluatePartner(S, id, offer, kind === 'bargain' && !discounted ? governmentNeed(Q, id, offer) : 0));
    const accepted = evaluations.length > 0 && evaluations.every(e => e.accept);
    commitSupport(Q, mode, kind);
    const negotiationId = 'neg-' + (S.history.negotiations.length + 1) + '-t' + t;
    const record = {id: negotiationId, kind: 'support', action: kind, postulate_id: postulateId, cabinet_id: cabinet.id, t: t,
      cost_t: mode === 'response' ? 0 : 1, threat_discounted: discounted, evaluations: evaluations, accepted: accepted, threat_answer: null};
    if (accepted) {
      cabinet.programme = offer.programme;
      cabinet.accepted_postulates.push(postulateId);
      // The promise has its date from the acceptance (9.1; decision 3 of stage 4). When the agreed
      // programme already promises it, that promise keeps its earlier date; the fiscal rule follows the
      // new programme.
      for (const id of ppsAgreements(S)) {
        const agreement = S.agreements[id];
        for (const o of agreement.obligations) if (o.kind === 'constraint' && o.topic === 'fiscal') o.position = offer.programme.fiscal;
        const existing = findObligation(agreement, id + ':' + postulate.id);
        if (existing) {
          if (existing.beneficiaries.indexOf('pps') < 0) existing.beneficiaries.push('pps');
          continue;
        }
        addObligation(Q, id, {id: postulate.id, topic: postulate.id, weight: postulate.weight, months: postulate.months,
          required_project: postulate.required_project, required_variants: postulate.required_variants,
          required_stage: postulate.required_stage, portfolio: postulate.portfolio, beneficiaries: ['pps']});
      }
      if (kind === 'bargain') {
        for (const e of evaluations) if (S.actors.relations[e.actor] !== undefined) changeRelation(Q, e.actor, FORCED_CONCESSION_RELATION, 'forced_concession:' + negotiationId);
      }
    } else if (kind === 'bargain') {
      cabinet.pending_threat = {negotiation_id: negotiationId, postulate_id: postulateId, opened_at: t};
    }
    S.history.negotiations.push(record);
    writeGovernmentMirrors(Q);
    return record;
  }

  // After a refused threat, in the same transaction and for 0 T: carry it out (withdraw) or back down
  // (credibility −5 once per negotiation; further threats against this cabinet count as persuasion).
  function answerThreat(Q, choice) {
    const S = Q.S, cabinet = S.cabinet, threat = cabinet && cabinet.pending_threat;
    if (!threat) throw new Error('answerThreat: no refused threat is waiting');
    cabinet.pending_threat = null;
    const record = S.history.negotiations.filter(n => n.id === threat.negotiation_id)[0];
    record.threat_answer = choice;
    if (choice === 'back_down') {
      changeCredibility(Q, 'backdown:' + threat.negotiation_id, THREAT_BACKDOWN_CREDIBILITY, 'threat_backdown');
      cabinet.pps_threat_discounted = true;
      writeGovernmentMirrors(Q);
      return {withdrawn: false, fell: false};
    }
    if (choice !== 'carry_out') throw new Error('answerThreat: unknown choice ' + choice);
    withdrawReactions(Q, cabinet.id, 'threat');
    const left = leaveCabinet(Q, 'pps', 'threat');
    writeGovernmentMirrors(Q);
    return {withdrawn: true, fell: left.fell};
  }

  // withdraw: PPS ends its support or leaves with its ministers; in the same sequence it decides on
  // the dismissal motion. The factions react to the real break once (stage 5; the profile is P).
  function withdrawSupport(Q, mode) {
    const status = supportOptionStatus(Q, 'withdraw', mode);
    if (!status.available) throw new Error('withdrawSupport: ' + status.reason);
    commitSupport(Q, mode, 'withdraw');
    withdrawReactions(Q, Q.S.cabinet.id, mode);
    const left = leaveCabinet(Q, 'pps', 'withdraw');
    writeGovernmentMirrors(Q);
    return left;
  }

  function maintainSupport(Q) {
    const status = supportOptionStatus(Q, 'maintain', 'response');
    if (!status.available) throw new Error('maintainSupport: ' + status.reason);
    const open = commitSupport(Q, 'response', 'maintain');
    const agreement = Q.S.agreements[open.agreement_id];
    agreement.history.push({t: Q.time, kind: 'maintained', case_id: open.case_id});
    // Keeping the support at the end of the term renews the toleration for six months, with a new review (P).
    if (open.kind === 'renewal' && agreement.term) {
      const t = Q.time;
      agreement.term = {months: TOLERATION_MONTHS, review_at: t + TOLERATION_REVIEW, expires_at: t + TOLERATION_MONTHS,
        review_opened: false, renewal_opened: false, renewals: agreement.term.renewals + 1};
      agreement.history.push({t: t, kind: 'term_renewed', expires_at: agreement.term.expires_at});
    }
    return open;
  }

  // 9.3: one standard extension by 3 months, when the relation is at least 50, half of the weighted
  // obligations are met, none was extended before, no red line is open and the partner accepts.
  function extensionTarget(Q) {
    const S = Q.S, open = responseCase(Q);
    if (!open || !open.agreement_id) return null;
    const agreement = S.agreements[open.agreement_id];
    const obligation = agreement.obligations.filter(o => overdueObligation(o, Q.time) || (liveObligation(o) && (o.fulfillment || 0) < 1))[0];
    return obligation ? {agreement: agreement, obligation: obligation, partner: open.by} : null;
  }

  function extensionStatus(Q) {
    const S = Q.S, target = extensionTarget(Q);
    if (!target) return {available: false, reason: 'No open obligation to extend.'};
    const agreement = target.agreement;
    if (relation(S, target.partner) < 50) return {available: false, reason: 'Needs a relation of 50 with ' + ACTOR_PROFILES[target.partner].name + '.'};
    if (weightedFulfillment(agreement) < 0.5) return {available: false, reason: 'Less than half of the obligations are met.'};
    if (agreement.extensions_used > 0) return {available: false, reason: 'The one standard extension has been used.'};
    if (agreement.history.some(h => h.kind === 'red_line_breach')) return {available: false, reason: 'A red line is still open.'};
    return {available: true, reason: ''};
  }

  function requestExtension(Q) {
    const S = Q.S, status = extensionStatus(Q);
    if (!status.available) throw new Error('requestExtension: ' + status.reason);
    const target = extensionTarget(Q);
    const offer = cabinetAsOffer(S);
    offer.by = 'pps';
    const evaluation = evaluatePartner(S, target.partner, offer, 0);
    commitSupport(Q, 'response', 'extension');
    const t = Q.time, agreement = target.agreement;
    const record = {id: 'neg-' + (S.history.negotiations.length + 1) + '-t' + t, kind: 'support', action: 'extension',
      obligation_id: target.obligation.id, t: t, cost_t: 0, evaluations: [evaluation], accepted: evaluation.accept};
    if (evaluation.accept) {
      // P: a deadline that has already passed is moved 3 months from the renegotiation, otherwise
      // the extension could never answer an ultimatum (which comes about 4 months after the date).
      target.obligation.due_at = Math.max(target.obligation.due_at, t) + EXTENSION_MONTHS;
      agreement.extensions_used += 1;
      agreement.history.push({t: t, kind: 'extended', obligation_id: target.obligation.id, due_at: target.obligation.due_at});
      // Removing the cause lifts the ultimatum at once (9.2).
      if (agreement.ultimatum && agreement.ultimatum.status === 'open' &&
          agreement.ultimatum.cause_ids.every(oid => !overdueObligation(findObligation(agreement, oid), t))) {
        closeUltimatum(agreement, 'lifted', t);
      }
    }
    S.history.negotiations.push(record);
    return record;
  }

  // The motion from opposition (C7): support it or refuse to take part (0 T, once per motion).
  function answerMotion(Q, choice) {
    const action = choice === 'support' ? 'support_dismissal' : 'refuse_dismissal';
    const status = supportOptionStatus(Q, action, 'response');
    if (!status.available) throw new Error('answerMotion: ' + status.reason);
    commitSupport(Q, 'response', action);
    const ballot = decideDismissal(Q, choice === 'support' ? 'support' : 'refuse');
    writeGovernmentMirrors(Q);
    return ballot;
  }

  // Daszyński's Broker a Coalition (10.4.3): in a coalition the tension of each active cabinet agreement
  // −10 (not below 0); or +5 to the partners' evaluation of one broad offer being prepared. One mode.
  const BROAD_CONFIGURATIONS = Object.freeze(['broad_centre', 'skrzynski_broad', 'national_unity']);

  function brokerStatus(Q) {
    const S = Q.S;
    if (!S) return {available: false, mode: null, reason: ''};
    const neg = S.negotiation;
    if (neg && neg.kind === 'cabinet' && neg.phase === 'draft' && BROAD_CONFIGURATIONS.indexOf(neg.draft.configuration_id) >= 0 &&
        configurationStatus(Q, neg.draft.configuration_id, neg.context).available && !neg.advisor_bonus) {
      return {available: true, mode: 'broad_offer', reason: ''};
    }
    if (ppsStance(S) === 'member') {
      const agreements = S.cabinet.agreement_ids.map(id => S.agreements[id])
        .filter(a => a && a.kind === 'cabinet' && (a.status === 'active' || a.status === 'breached'));
      if (agreements.some(a => a.tension > 0)) return {available: true, mode: 'tension', reason: ''};
      return {available: false, mode: null, reason: 'No cabinet agreement is under tension.'};
    }
    return {available: false, mode: null, reason: 'Needs PPS in a coalition or a broad cabinet offer in preparation.'};
  }

  function brokerCoalition(Q) {
    const S = Q.S, status = brokerStatus(Q);
    if (!status.available) throw new Error('brokerCoalition: ' + status.reason);
    if (status.mode === 'broad_offer') {
      S.negotiation.advisor_bonus = 5;
      S.negotiation.advisor_bonus_until = Q.time + 6;
    } else {
      for (const id of S.cabinet.agreement_ids) {
        const agreement = S.agreements[id];
        if (!agreement || agreement.kind !== 'cabinet' || (agreement.status !== 'active' && agreement.status !== 'breached')) continue;
        agreement.tension = Math.max(0, agreement.tension - 10);
        agreement.history.push({t: Q.time, kind: 'tension', delta: -10, tension: agreement.tension, reason: 'advisor.daszynski.broker_coalition'});
      }
    }
    S.history.reasons.push({t: Q.time, kind: 'advisor.daszynski.broker_coalition', mode: status.mode});
    return status.mode;
  }

  // ---- Electoral lists (6.2, 6.5; card 7.7) ------------------------------------------------------------

  // The list offers of 6.5 with their fixed programme profiles (P, list_profiles_v1): the shared minimum
  // as positions on the topics of 8.1. The candidate split is proportional to the votes and accepted,
  // so a list gives no portfolio. The peasant bloc stands without PPS; PPS only brokers it (decision 7).
  const LIST_PROFILE_ID = 'list_profiles_v1';
  const LIST_OPTIONS = Object.freeze({
    left_peasant: {name: 'PPS and PSL Wyzwolenie', members: ['pps', 'psl_wyzwolenie'], gates: [{actor: 'psl_wyzwolenie', min: 50}],
      programme: {land: 1, fiscal: 1}, profile: 'Land reform with equal access and protection of labour; seats shared in proportion to votes.'},
    labour: {name: 'PPS and NPR', members: ['pps', 'npr'], gates: [{actor: 'npr', min: 60}], programme: {fiscal: 1, church: 0},
      profile: 'The eight-hour day, protection of the unemployed and religious freedom.'},
    centrolew_early: {name: 'An early Centre-Left', members: ['pps', 'psl_wyzwolenie', 'psl_piast', 'npr'],
      gates: [{actor: 'psl_wyzwolenie', min: 60}, {actor: 'psl_piast', min: 60}, {actor: 'npr', min: 60}], fulfilled_needed: 2,
      programme: {land: 0, fiscal: 0, institution: 1, church: 0}, lewica_dissent: 3,
      profile: 'A lawful change of government, a social minimum and a land and religious compromise; an alternative early bloc, not the historical Centrolew.'},
    peasant: {name: 'Peasant bloc (PSL Wyzwolenie and PSL Piast)', members: ['psl_wyzwolenie', 'psl_piast'], without_pps: true, gates: [],
      programme: {land: 0}, profile: 'Agriculture and credit; two separate clubs after the election. PPS supports the rapprochement but is not on the list.'},
  });
  const LIST_ORDER = Object.freeze(['left_peasant', 'labour', 'centrolew_early', 'peasant']);

  // The window: the two full months before the month of the vote (decision 7).
  function listWindow(Q) {
    const S = Q.S, next = S && S.parliament.next_election;
    if (!next) return {open: false, election_id: null};
    return {open: Q.time >= next.time - 2 && Q.time <= next.time - 1, election_id: next.id, vote_time: next.time};
  }

  function alliancesFor(S, electionId) {
    return (S.parliament.alliances || []).filter(a => a.election_id === electionId && a.status === 'accepted');
  }

  // Fulfilled obligations shared by PPS and one of the partners, each with its own ID (6.5).
  function fulfilledJointObligations(S, partners) {
    const ids = [];
    for (const id of Object.keys(S.agreements)) {
      const agreement = S.agreements[id];
      if (agreement.parties.indexOf('pps') < 0 || !partners.some(p => agreement.parties.indexOf(p) >= 0)) continue;
      for (const o of agreement.obligations) if (o.status === 'fulfilled' && ids.indexOf(o.id) < 0) ids.push(o.id);
    }
    return ids.length;
  }

  function listOffer(optionId, evaluator) {
    const option = LIST_OPTIONS[optionId];
    const other = option.members.filter(m => m !== evaluator)[0];
    return {by: option.without_pps ? 'npc' : 'pps', kind: 'electoral_list', configuration_id: optionId, members: option.members.slice(),
      supporters: [], programme: option.programme, portfolios: {}, minority_terms: [], gates: option.gates,
      lead_party: option.without_pps ? other : 'pps'};
  }

  function listSnapshot(Q, optionId) {
    const S = Q.S, option = LIST_OPTIONS[optionId];
    return JSON.stringify({relations: option.members.map(m => relation(S, m)), credibility: S.actors.pps.credibility,
      penalties: option.members.map(m => breachPenalty(S, m)), fulfilled: fulfilledJointObligations(S, option.members.filter(m => m !== 'pps'))});
  }

  // A partner's need of this list: 100 minus its best other list offer whose gates pass (8.3).
  function listNeed(Q, actorId, optionId) {
    const S = Q.S;
    let best = 0;
    for (const id of LIST_ORDER) {
      if (id === optionId || LIST_OPTIONS[id].members.indexOf(actorId) < 0) continue;
      if (LIST_OPTIONS[id].gates.some(g => relation(S, g.actor) < g.min)) continue;
      best = Math.max(best, scaledAlternative(baseScore(S, actorId, listOffer(id, actorId))));
    }
    return needFor(best, 0);
  }

  function listStatus(Q, optionId) {
    const S = Q.S, option = LIST_OPTIONS[optionId], window = listWindow(Q);
    if (!option) return {available: false, reason: 'Unknown list.'};
    if (!window.open) return {available: false, reason: 'The list window is closed.'};
    if ((Q.month_actions || 0) >= 1) return {available: false, reason: 'This month’s action has already been used.'};
    const own = S.history.negotiations.filter(n => n.kind === 'electoral_list' && n.election_id === window.election_id && n.accepted);
    if (own.length) return {available: false, reason: 'PPS already has its list agreement for this election.'};
    const taken = alliancesFor(S, window.election_id).concat(window.election_id === 'first_election_1922' ? [institutions.CHZJN] : []);
    for (const member of option.members) {
      if (taken.some(a => a.members.indexOf(member) >= 0)) return {available: false, reason: ACTOR_PROFILES[member].name + ' is on another list.'};
      if (member !== 'pps' && seatsOf(S, member) <= 0 && !(Q[member + '_normalized'] > 0)) return {available: false, reason: ACTOR_PROFILES[member].name + ' has no support.'};
    }
    for (const gate of option.gates) {
      if (relation(S, gate.actor) < gate.min) return {available: false, reason: 'Relation with ' + ACTOR_PROFILES[gate.actor].name + ' is below ' + gate.min + '.'};
    }
    if (option.fulfilled_needed && fulfilledJointObligations(S, option.members.filter(m => m !== 'pps')) < option.fulfilled_needed) {
      return {available: false, reason: 'Needs ' + option.fulfilled_needed + ' fulfilled joint obligations with PPS.'};
    }
    const refused = S.history.negotiations.filter(n => n.kind === 'electoral_list' && n.election_id === window.election_id &&
      n.option_id === optionId && !n.accepted).slice(-1)[0];
    if (refused && refused.snapshot === listSnapshot(Q, optionId)) {
      return {available: false, reason: 'The same proposal was refused and nothing has changed since.'};
    }
    return {available: true, reason: ''};
  }

  // One confirmation, 1 T even when the partners refuse (C3). An accepted list is stored for the
  // election's seat count (6.1); the first acceptance of the early Centre-Left adds 3 dissent to the
  // Lewica, which rejects giving up points of the workers' programme (Z — 0.36).
  function proposeList(Q, optionId) {
    const S = Q.S, status = listStatus(Q, optionId);
    if (!status.available) throw new Error('proposeList: ' + status.reason);
    syncRelations(Q);
    const option = LIST_OPTIONS[optionId], window = listWindow(Q), t = Q.time;
    const partners = option.members.filter(m => m !== 'pps');
    const evaluations = partners.map(id => evaluatePartner(S, id, listOffer(optionId, id), listNeed(Q, id, optionId)));
    const accepted = evaluations.every(e => e.accept);
    rules.commitMainAction(Q, 'parliament.list_agreement', {option: optionId, election_id: window.election_id});
    const record = {id: 'neg-' + (S.history.negotiations.length + 1) + '-t' + t, kind: 'electoral_list', option_id: optionId,
      election_id: window.election_id, t: t, cost_t: 1, profile_id: LIST_PROFILE_ID, evaluations: evaluations, accepted: accepted,
      snapshot: listSnapshot(Q, optionId)};
    if (accepted) {
      S.parliament.alliances.push({id: optionId + '_' + window.election_id, election_id: window.election_id, name: option.name,
        members: option.members.slice(), accepted_by: partners.slice(), nomination_terms: 'proportional_to_votes',
        valid_until: window.vote_time, withdrawal_rules: 'closed_when_lists_close', status: 'accepted', option_id: optionId,
        signed_at: t, profile: option.profile, programme: copy(option.programme)});
      if (option.lewica_dissent && !S.history.reasons.some(r => r.kind === 'lewica_list_compromise')) {
        factionReaction(Q, 'lewica', {dissent: option.lewica_dissent}, {id: 'list:' + optionId, kind: 'list_compromise', reverse: null});
        S.history.reasons.push({t: t, kind: 'lewica_list_compromise', option_id: optionId, dissent: option.lewica_dissent});
      }
    }
    S.history.negotiations.push(record);
    return record;
  }

  function listAgreementAvailable(Q) {
    const S = Q.S;
    if (!S || S.chapter.status === 'ended' || !listWindow(Q).open) return false;
    return !S.history.negotiations.some(n => n.kind === 'electoral_list' && n.election_id === listWindow(Q).election_id && n.accepted);
  }

  // The Marshal's election of 7.5 in the agreement system (moved from stage 2). The Rataj package
  // becomes an agreement with PSL Piast about the standing orders and PPS work in the committees:
  // the PPS votes and the committee seats are fulfilled at the vote (P), the standing orders are a
  // standing procedural promise without a due date. A victory of Daszyński as the PPS nominee gives
  // reputation +5. No card of stage 3 creates an earlier promise of a Marshal candidate, so the
  // conditions of 7.5 that read such a promise stay unmet.
  function recordSpeakerOutcome(Q) {
    const S = Q.S, list = S.parliament.speaker_elections, run = list[list.length - 1];
    if (!run) return null;
    const out = {agreement_id: null, reputation: 0};
    if (run.commitment && run.commitment.kind === 'speaker_package' && !run.commitment.agreement_created) {
      const id = 'agr-' + run.id + '-' + run.commitment.partner;
      const obligation = (suffix, topic, owner, beneficiaries, status) => ({id: id + ':' + suffix, topic: topic, position: null, owner: owner,
        beneficiaries: beneficiaries, required_project: null, required_stage: null, weight: 1, due_at: null, status: status,
        fulfillment: status === 'fulfilled' ? 1 : 0, last_checked: Q.time, fulfilled_at: status === 'fulfilled' ? Q.time : null});
      S.agreements[id] = {id: id, kind: 'procedure', parties: ['pps', run.commitment.partner], cabinet_id: null, signed_at: Q.time,
        status: 'active', support_scope: ['speaker_vote'], tension: 0, warning_issued: false, ultimatum: null, extensions_used: 0,
        responsibility: {pps: 0.5}, response: null, speaker_run_id: run.id,
        obligations: [obligation('pps_vote', 'vote_for_rataj', 'pps', [run.commitment.partner], 'fulfilled'),
          obligation('committees', 'pps_committee_participation', run.commitment.partner, ['pps'], 'fulfilled'),
          obligation('standing_orders', 'defend_standing_orders', 'pps', [run.commitment.partner], 'standing')],
        history: [{t: Q.time, kind: 'signed'}, {t: Q.time, kind: 'fulfilled', obligation_id: id + ':pps_vote'},
          {t: Q.time, kind: 'fulfilled', obligation_id: id + ':committees'}]};
      run.commitment.agreement_created = true;
      run.commitment.agreement_id = id;
      out.agreement_id = id;
    }
    if (run.status === 'elected' && run.pps_decision === 'daszynski' && run.winner_id === 'ignacy_daszynski') {
      const before = S.actors.pps.credibility;
      out.reputation = changeCredibility(Q, 'office_won:' + run.id, 5, 'office_won') - before;
    }
    return out;
  }

  // The answers to one negotiation, with reasons, for the result screens.
  function describeAnswers(record) {
    return record.evaluations.map(e => {
      const profile = profileOf(e.actor);
      return (profile ? profile.name : e.actor) + ': ' + (e.accept ? 'accepts (' + e.score.toFixed(1) + ')' : 'refuses — ' + e.reasons.join('; '));
    }).join(' | ') || 'Nobody could answer.';
  }

  // Display of the agreements for Status, Library and the main screen.
  function agreementsDisplay(Q) {
    const S = Q.S, lines = [];
    let highest = null;
    for (const id of ppsAgreements(S)) {
      const agreement = S.agreements[id];
      if (!highest || agreement.tension > highest.tension) highest = agreement;
      if (agreement.ultimatum && agreement.ultimatum.status === 'open') {
        lines.push('Ultimatum from ' + describeParty(agreement.ultimatum.by) + ': support ends at the settlement of ' +
          rules.monthOf(agreement.ultimatum.due_at) + '/' + rules.yearOf(agreement.ultimatum.due_at) + ' unless the broken promise is met or extended.');
      } else if (agreement.response && !agreement.response.used && agreement.response.kind === 'warning') {
        lines.push('Warning from ' + describeParty(agreement.response.by) + ': a promise of the agreement is overdue.');
      }
    }
    const motion = S.cabinet && S.cabinet.dismissal_motion;
    if (motion && motion.status === 'open') lines.push('A motion to dismiss the cabinet is open after ' + describeParty(motion.after_withdrawal_of) + ' withdrew its support.');
    return {
      // Shown only once a promise has raised it; the opening toleration has no partner or programme.
      tension: highest && highest.tension > 0 ? Math.round(highest.tension) + ' (highest, agreement with ' +
        highest.parties.filter(p => p !== 'pps').map(describeParty).join(', ') + ')' : '',
      notices: lines.join(' '),
    };
  }

  return Object.freeze({
    ACTOR_PROFILE_ID: ACTOR_PROFILE_ID,
    POSTULATES: POSTULATES,
    TEST_PROGRAMME: TEST_PROGRAMME,
    LIST_OPTIONS: LIST_OPTIONS,
    LIST_ORDER: LIST_ORDER,
    LIST_PROFILE_ID: LIST_PROFILE_ID,
    BROAD_CONFIGURATIONS: BROAD_CONFIGURATIONS,
    profileOf: profileOf,
    addObligation: addObligation,
    setFulfillment: setFulfillment,
    weightedFulfillment: weightedFulfillment,
    settleAgreements: settleAgreements,
    leaveCabinet: leaveCabinet,
    cabinetFalls: cabinetFalls,
    constructiveVoteRequired: constructiveVoteRequired,
    programmeObligations: programmeObligations,
    minorityObligation: minorityObligation,
    breachConstraint: breachConstraint,
    ppsResponsible: ppsResponsible,
    overdueObligation: overdueObligation,
    liveObligation: liveObligation,
    findObligation: findObligation,
    seatsOf: seatsOf,
    majorityRequired: majorityRequired,
    ppsBound: ppsBound,
    cabinetAsOffer: cabinetAsOffer,
    commitSupport: commitSupport,
    SEGMENTS: SEGMENTS,
    ACTOR_PROFILES: ACTOR_PROFILES,
    dismissalSupportStatus: dismissalSupportStatus,
    dismissalBallot: dismissalBallot,
    decideDismissal: decideDismissal,
    ppsStance: ppsStance,
    ppsAgreements: ppsAgreements,
    responseCase: responseCase,
    supportCardAvailable: supportCardAvailable,
    supportOptionStatus: supportOptionStatus,
    governmentNeed: governmentNeed,
    demandEvaluators: demandEvaluators,
    supportDemand: supportDemand,
    answerThreat: answerThreat,
    withdrawSupport: withdrawSupport,
    maintainSupport: maintainSupport,
    extensionStatus: extensionStatus,
    requestExtension: requestExtension,
    answerMotion: answerMotion,
    brokerStatus: brokerStatus,
    brokerCoalition: brokerCoalition,
    listWindow: listWindow,
    listStatus: listStatus,
    proposeList: proposeList,
    listAgreementAvailable: listAgreementAvailable,
    alliancesFor: alliancesFor,
    fulfilledJointObligations: fulfilledJointObligations,
    agreementsDisplay: agreementsDisplay,
    describeAnswers: describeAnswers,
    recordSpeakerOutcome: recordSpeakerOutcome,
    describeParty: describeParty,
    PORTFOLIOS: PORTFOLIOS,
    PORTFOLIO_NAMES: PORTFOLIO_NAMES,
    PORTFOLIO_SHORT: PORTFOLIO_SHORT,
    PROGRAMME_ONLY_TOPICS: PROGRAMME_ONLY_TOPICS,
    CONFIGURATIONS: CONFIGURATIONS,
    PPS_CONFIGURATIONS: PPS_CONFIGURATIONS,
    CANDIDATES: CANDIDATES,
    pilsudskiPremierAgreed: pilsudskiPremierAgreed,
    beginCrisisFormation: beginCrisisFormation,
    CANDIDATE_ORDER: CANDIDATE_ORDER,
    EXPERTS: EXPERTS,
    MINORITY_TERMS: MINORITY_TERMS,
    inWindow: inWindow,
    crisisState: crisisState,
    candidateStatus: candidateStatus,
    allocatePortfolios: allocatePortfolios,
    buildCabinetOffer: buildCabinetOffer,
    npcOffer: npcOffer,
    programmeStance: programmeStance,
    forecast: forecast,
    configurationStatus: configurationStatus,
    bestAlternativeScore: bestAlternativeScore,
    evaluateOffer: evaluateOffer,
    rankOf: rankOf,
    beginFormation: beginFormation,
    setDraft: setDraft,
    draftChoiceStatus: draftChoiceStatus,
    stabilisationTermsOpen: stabilisationTermsOpen,
    stabilisationTermsStatus: stabilisationTermsStatus,
    PROTECTION_TALKS: PROTECTION_TALKS,
    protectionFinancing: protectionFinancing,
    protectionTermsAnswer: protectionTermsAnswer,
    tolerationOfferStatus: tolerationOfferStatus,
    openTolerationOffer: openTolerationOffer,
    TOLERATION_MONTHS: TOLERATION_MONTHS,
    TOLERATION_REVIEW: TOLERATION_REVIEW,
    formationView: formationView,
    submitFormation: submitFormation,
    openCrisis: openCrisis,
    situationChanged: situationChanged,
    beginPostElectionFormation: beginPostElectionFormation,
    initiativeAvailable: initiativeAvailable,
    submitStatus: submitStatus,
    formationDue: formationDue,
    enterFormation: enterFormation,
    formationVisible: formationVisible,
    formationPending: formationPending,
    draftPortfolioChoice: draftPortfolioChoice,
    formationResultView: formationResultView,
    describeProgramme: describeProgramme,
    writeGovernmentMirrors: writeGovernmentMirrors,
    governmentDisplay: governmentDisplay,
    governmentFragility: governmentFragility,
    TOPICS: TOPICS,
    ACTOR_PROFILES: ACTOR_PROFILES,
    PARTNERS: PARTNERS,
    OUTREACH_COOLDOWN_MONTHS: OUTREACH_COOLDOWN_MONTHS,
    pairRelation: pairRelation,
    createActorsState: createActorsState,
    createGovernmentState: createGovernmentState,
    minorityBlocRelation: minorityBlocRelation,
    writeRelationMirrors: writeRelationMirrors,
    syncRelations: syncRelations,
    relation: relation,
    changeRelation: changeRelation,
    changeCredibility: changeCredibility,
    programFit: programFit,
    factionReaction: factionReaction,
    factionReactions: factionReactions,
    WITHDRAW_REACTIONS: WITHDRAW_REACTIONS,
    withdrawReactions: withdrawReactions,
    cabinetPolicyReverse: cabinetPolicyReverse,
    FACTION_IDS: FACTION_IDS,
    redLineViolations: redLineViolations,
    portfolioFit: portfolioFit,
    baseScore: baseScore,
    offerScore: offerScore,
    scaledAlternative: scaledAlternative,
    needFor: needFor,
    evaluatePartner: evaluatePartner,
    leverage: leverage,
    outreachStatus: outreachStatus,
    kppContactStatus: kppContactStatus,
    outreachAvailable: outreachAvailable,
    outreach: outreach,
    kppContact: kppContact,
  });
}));
