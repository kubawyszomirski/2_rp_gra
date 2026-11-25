// The top bar of the page (the user's decisions of 7 XI 2026: variant A with the hemicycle of the Sejm, a short line
// that stays at the top after scrolling). It replaces the side panel. Its Overview shows the cabinet and the position of
// PPS, the Sejm, the party line, three economic figures, the state of the country and the next election; the tabs Party,
// State and Polls open the details under it. overviewView writes the short texts of the Overview into Q.pl_top_*;
// the page (out/html/game.js) draws the columns, the stamp, the hemicycle and the bars from them.
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./polish_rules.js'), require('./polish_party.js'));
  } else {
    root.PolishTopbar = factory(root.PolishRules, root.PolishParty);
  }
}(typeof self !== 'undefined' ? self : this, function (rules, party) {
  'use strict';

  if (!rules || !party) {
    throw new Error('PolishTopbar needs polish_rules.js and polish_party.js first');
  }

  const L = rules.L;
  const one = value => rules.num(Math.round(value * 10) / 10, 1);
  const signed = value => (value > 0.05 ? '+' : value < -0.05 ? '−' : '') + one(Math.abs(value));
  const lowerFirst = text => (text ? text.charAt(0).toLowerCase() + text.slice(1) : '');

  // The present line of one card of the party's vision, as the card names it.
  function stance(Q, cardId) {
    party.stanceView(Q, cardId);
    return Q.pl_stance_current;
  }

  // The stamp of the position of PPS and one line under it.
  function ppsPosition(S, Q) {
    const cabinet = S && S.cabinet;
    if (!cabinet) return {stamp: L('outside the cabinet', 'poza rządem'), detail: ''};
    const ministries = Object.keys(cabinet.portfolios || {}).filter(key => cabinet.portfolios[key] === 'pps').length;
    const stamp = cabinet.pps_mode === 'member' ? L('in the cabinet', 'w rządzie') :
      cabinet.pps_mode === 'external_support' ? L('tolerates the cabinet', 'toleruje rząd') : L('in opposition', 'w opozycji');
    let detail = cabinet.pps_mode === 'member' ? L('PPS ministries: ', 'ministerstwa PPS: ') + ministries :
      cabinet.pps_mode === 'external_support' ? L('from outside, without ministries', 'z zewnątrz, bez ministerstw') : '';
    if (cabinet.status && cabinet.status !== 'active') detail = String(Q.pps_government_position || detail);
    return {stamp: stamp, detail: detail};
  }

  // The change of a figure since the month before. The last reading of the monthly history is the present month, so the
  // reading before it is the month before; null while the history is shorter than two months.
  function change(history, key, now) {
    if (!Array.isArray(history) || history.length < 2) return null;
    const before = history[history.length - 2];
    return before && typeof before[key] === 'number' && typeof now === 'number' ? now - before[key] : null;
  }

  // A small arrow with the size of a change ("↑ 0,3"); empty while there is no change or no month to compare with.
  function trend(delta, digits) {
    if (typeof delta !== 'number' || !isFinite(delta)) return '';
    const size = Math.abs(delta);
    if (size < (digits === 0 ? 0.5 : 0.05)) return '';
    return (delta > 0 ? '↑ ' : '↓ ') + (digits === 0 ? String(Math.round(size)) : one(size));
  }

  // The nine positions of the party line for the Party tab: the eight stances and the economic programme.
  const LINE_CARDS = Object.freeze(['direction', 'main_opponent', 'pils_influence', 'form_of_power', 'electoral_base',
    'slavic_autonomy', 'jewish_cooperation', 'ussr_position']);
  function lineView(Q) {
    if (!Q.S || !Q.polish_party_rules) return Q;
    for (const cardId of LINE_CARDS) Q['pl_line_' + cardId] = stance(Q, cardId);
    party.programmeView(Q);
    Q.pl_line_programme = Q.pl_prog_current;
    return Q;
  }

  function overviewView(Q) {
    const S = Q.S;
    // The cabinet: "Antoni Ponikowski — gabinet złożony głównie z fachowców" becomes the name and its description.
    const pm = String(Q.prime_minister_display || Q.chancellor || '').split(' — ');
    Q.pl_top_pm = pm[0] || '';
    Q.pl_top_cabinet = pm.slice(1).join(' — ');
    // The head of state: "Józef Piłsudski — Naczelnik Państwa" becomes "Naczelnik Państwa: Józef Piłsudski".
    const head = String(Q.head_of_state_display || '').split(' — ');
    Q.pl_top_head = head.length > 1 ? head.slice(1).join(' — ') + ': ' + head[0] : head[0];
    const position = ppsPosition(S, Q);
    Q.pl_top_pps_stamp = position.stamp;
    Q.pl_top_pps_detail = position.detail;
    // Z — 1.08 (the user's note): the resources of the party, with the change since the settlement that opened the month.
    const orgs = S && S.party_orgs;
    if (orgs) {
      Q.pl_top_cash = one(orgs.cash);
      Q.pl_top_cash_trend = orgs.last_ledger && typeof orgs.last_ledger.cash === 'number' ? trend(orgs.cash - orgs.last_ledger.cash, 1) : '';
    }
    // The Sejm: the hemicycle is drawn by the page from Q.sejm_display_rows.
    const total = Q.sejm_total_seats || 0;
    Q.pl_top_sejm = L('Sejm · ' + total + ' MPs', 'Sejm · ' + total + ' ' + rules.plural(total, 'poseł', 'posłów', 'posłów'));
    Q.pl_top_pps_seats = 'PPS ' + (Q.pps_seats || 0);
    Q.pl_top_majority = L('majority ', 'większość ') + (Q.sejm_majority_required || 0);
    // The party line: the direction, the main opponent and the attitude to Piłsudski.
    const lineReady = !!(S && Q.polish_party_rules);
    Q.pl_top_direction = lineReady ? stance(Q, 'direction') : '';
    Q.pl_top_opponent = lineReady ? L('main opponent: ', 'główny przeciwnik: ') + lowerFirst(stance(Q, 'main_opponent')) : '';
    Q.pl_top_pilsudski = lineReady ? 'Piłsudski: ' + lowerFirst(stance(Q, 'pils_influence')) : '';
    // Three figures of the economy, with their change since the month before.
    const E = S && S.economy;
    if (E) {
      // Z — 1.01: the budget pool, without a plus sign; below zero it is a deficit.
      Q.pl_top_budget = (E.budget < -0.05 ? '−' : '') + rules.num(Math.round(Math.abs(E.budget) * 10) / 10) + L(' B', '');
      Q.pl_top_inflation = one(E.inflation_m) + L('% a month', '% mies.');
      Q.pl_top_unemployment = one(E.unemployment) + '%';
      Q.pl_top_budget_trend = trend(change(E.history, 'budget', E.budget), 1);
      // Z — 1.08 (decision 2B): the state of the economy in one word.
      const econ = typeof PolishEconomy !== 'undefined' ? PolishEconomy : (typeof require === 'function' ? require('./polish_economy.js') : null);
      Q.pl_top_economy = econ && econ.economyWord ? econ.economyWord(E, Q.time) : '';
      Q.pl_top_inflation_trend = trend(change(E.history, 'inflation_m', E.inflation_m), 1);
      Q.pl_top_unemployment_trend = trend(change(E.history, 'unemployment', E.unemployment), 1);
    }
    // The state of the country, on scales of 0 to 100, with the change since the month before.
    const P = S && S.politics;
    if (P) {
      Q.pl_top_democracy = String(Math.round(P.democracy));
      Q.pl_top_grievance = String(Math.round(P.national_grievance));
      Q.pl_top_violence = String(Math.round(P.violence));
      Q.pl_top_democracy_trend = trend(change(P.history, 'democracy', P.democracy), 0);
      Q.pl_top_grievance_trend = trend(change(P.history, 'national_grievance', P.national_grievance), 0);
      Q.pl_top_violence_trend = trend(change(P.history, 'violence', P.violence), 0);
    }
    // Z — 1.10 (decision 4A of 8 XI 2026): the mood of the army in one word, in red from "seething".
    const sec = typeof PolishSecurity !== 'undefined' ? PolishSecurity : (typeof require === 'function' ? require('./polish_security.js') : null);
    if (S && S.coup && sec && sec.armyMoodWord) {
      const word = sec.armyMoodWord(S);
      Q.pl_top_army = sec.armyMoodLevel(S) >= 2 ? '<span class="pl-army-alarm">' + word + '</span>' : word;
    } else {
      Q.pl_top_army = '';
    }
    // Z — 1.13 (decision 1A of 8 XI 2026): the mobilisation of the right in one word, in red on the streets.
    const pol = typeof PolishPolitics !== 'undefined' ? PolishPolitics : null;
    if (S && S.politics && pol && pol.rightWord) {
      const word = pol.rightWord(S);
      Q.pl_top_right = pol.rightLevel(S) >= 2 ? '<span class="pl-army-alarm">' + word + '</span>' : word;
    } else {
      Q.pl_top_right = '';
    }
    // The support of PPS in the polls, with its change since the month before (the monthly records of the polls).
    const records = Q.party_support_records || [];
    Q.pl_top_pps_poll_trend = records.length >= 2 ? trend(records[records.length - 1].pps - records[records.length - 2].pps, 1) : '';
    // The next election: its month, how many months remain and whether it is the first one.
    const t = Q.next_election_time;
    if (typeof t === 'number' && t > 0) {
      const months = t - (Q.time || 0);
      Q.pl_top_election = rules.monthYear(t);
      Q.pl_top_election_in = months > 0 ? L('in ' + months + (months === 1 ? ' month' : ' months'),
        'za ' + months + ' ' + rules.plural(months, 'miesiąc', 'miesiące', 'miesięcy')) : L('this month', 'w tym miesiącu');
    } else {
      Q.pl_top_election = String(Q.pl_next_election_display || '');
      Q.pl_top_election_in = '';
    }
    Q.pl_top_election_note = Q.sejm_first_election_completed ? '' : L('the first election to the Sejm', 'pierwsze wybory do Sejmu');
    // The month of the page, for the tab row ("Styczeń 1922").
    const month = typeof Q.time === 'number' && Q.time > 0 ? rules.monthYear(Q.time) : '';
    Q.pl_top_date = month ? month.charAt(0).toUpperCase() + month.slice(1) : '';
    return Q;
  }

  // ---- The goals of the chapter and the record of PPS (Z — 1.31, decisions of 24 XI 2026) --------------------------------
  // Four goals in words — power, reforms, the Republic and the character of the party — and the credibility of PPS; the record
  // lists the reforms PPS has carried into force. Read by the Party tab, the Library and the balance of the chapter.
  const moduleOf = (name, file) => (typeof self !== 'undefined' && self[name]) || (typeof globalThis !== 'undefined' && globalThis[name]) ||
    (typeof require === 'function' ? require(file) : null);
  const REFORM_WORDS = Object.freeze([[0, 'none yet', 'jeszcze żadnych'], [1, 'first steps', 'pierwsze kroki'], [3, 'a clear record', 'wyraźny dorobek'],
    [6, 'a large record', 'duży dorobek'], [10, 'a great record', 'wielki dorobek']]);
  const CREDIBILITY_WORDS = Object.freeze([[0, 'weak', 'słaba'], [30, 'damaged', 'nadszarpnięta'], [45, 'middling', 'przeciętna'],
    [60, 'good', 'dobra'], [75, 'high', 'wysoka']]);
  const band = (value, table) => table.filter(row => value >= row[0]).pop();
  const POWER_NOW = Object.freeze({premier: ['a premier of PPS', 'premier z PPS'], member: ['ministers of PPS in the cabinet', 'ministrowie PPS w rządzie'],
    toleration: ['we support the cabinet from outside', 'tolerujemy rząd'], opposition: ['in opposition', 'w opozycji'], none: ['no cabinet now', 'teraz bez rządu']});
  const REPUBLIC_NOW = Object.freeze([['calm', 'spokojnie'], ['the army is restless', 'wojsko niespokojne'], ['the threat of a coup', 'groźba zamachu'],
    ['a coup is at hand', 'zamach wisi w powietrzu']]);
  const REPUBLIC_END = Object.freeze({pils_victory: ['Piłsudski in power', 'Piłsudski u władzy'], legal_victory: ['the government defended', 'rząd obroniony'],
    constitutional_compromise: ['a compromise', 'kompromis'], prolonged_conflict: ['a conflict without a winner', 'konflikt bez zwycięzcy']});

  function reformsList(list) {
    return list.map(r => L(r.name[0], r.name[1]) + ' (' + (typeof r.t === 'number' ? rules.yearOf(r.t) : '') +
      (r.limited ? L(', limited', ', okrojona') : '') + ')').join(', ');
  }

  function goalsView(Q) {
    const S = Q && Q.S;
    if (!S || !Q.polish_party_rules) return Q;
    const gov = moduleOf('PolishGovernment', './polish_government.js'), proj = moduleOf('PolishProjects', './polish_projects.js');
    const sec = moduleOf('PolishSecurity', './polish_security.js');
    const power = gov && gov.powerRecord ? gov.powerRecord(Q) : null;
    const reforms = proj && proj.ppsReforms ? proj.ppsReforms(S) : [];
    Q.pl_goal_power = power ? L(POWER_NOW[power.now][0], POWER_NOW[power.now][1]) : '';
    const words = band(reforms.length, REFORM_WORDS);
    Q.pl_goal_reforms = L(words[1], words[2]);
    const C = S.coup;
    if (C && C.outcome && REPUBLIC_END[C.outcome]) Q.pl_goal_republic = L(REPUBLIC_END[C.outcome][0], REPUBLIC_END[C.outcome][1]);
    else {
      const level = sec && sec.armyMoodLevel ? sec.armyMoodLevel(S) : 0;
      Q.pl_goal_republic = L(REPUBLIC_NOW[level][0], REPUBLIC_NOW[level][1]);
    }
    const profile = rules.profileState(S);
    const adopted = profile ? profile.adopted.map(a => party.PROFILES[a.id] ? L(party.PROFILES[a.id].name[0], party.PROFILES[a.id].name[1]) : a.id) : [];
    Q.pl_goal_character = adopted.length ? adopted.join(', ') : L('none yet', 'jeszcze żaden');
    const cred = band(S.actors.pps.credibility, CREDIBILITY_WORDS);
    Q.pl_goal_credibility = L(cred[1], cred[2]);
    // The record of PPS: power, the reforms and the party.
    if (power) {
      const months = n => n + ' ' + L(n === 1 ? 'month' : 'months', rules.plural(n, 'miesiąc', 'miesiące', 'miesięcy'));
      const parts = [];
      if (power.member) parts.push(L('in the cabinet: ' + months(power.member), 'w rządzie: ' + months(power.member)) +
        (power.portfolio_names.length ? L(' (portfolios: ', ' (resorty: ') + power.portfolio_names.join(', ') + ')' : ''));
      if (power.support) parts.push(L('support of cabinets from outside: ' + months(power.support), 'tolerowanie rządów z zewnątrz: ' + months(power.support)));
      Q.pl_record_power = (parts.length ? parts.join(L('; ', '; ')) : L('PPS has had no ministers yet', 'PPS nie miała jeszcze ministrów')) +
        (power.premier ? L('; PPS gave the cabinet its premier.', '; PPS dała rządowi premiera.') : L('; no premier of PPS.', '; premiera z PPS nie było.'));
      Q.pl_record_power = Q.pl_record_power.charAt(0).toUpperCase() + Q.pl_record_power.slice(1);
      Q.pl_verdict_power = power.premier ? L('a premier of PPS', 'premier z PPS') : power.member ? L('PPS governed', 'PPS współrządziła') :
        power.support ? L('PPS supported cabinets from outside', 'PPS wspierała rządy z zewnątrz') : L('PPS stayed in opposition', 'PPS pozostała w opozycji');
    }
    // The verdict of the Republic for the balance: the outcome of a coup, or no coup when the election closed the chapter.
    if (C && C.outcome && REPUBLIC_END[C.outcome]) {
      Q.pl_verdict_republic = L(REPUBLIC_END[C.outcome][0], REPUBLIC_END[C.outcome][1]) + (C.pps_contribution === 'decisive' ?
        L(', and PPS tipped the balance', ', a przesądziła PPS') : C.pps_contribution === 'adverse' ? L(', and PPS harmed the side it backed', ', a PPS zaszkodziła stronie, którą poparła') : '');
    } else Q.pl_verdict_republic = S.chapter && S.chapter.status === 'ended' ? L('no coup: the election closed the chapter', 'bez zamachu: rozdział zakończyły wybory') : Q.pl_goal_republic;
    // Z — 1.35 (decision D6A): the ending of the chapter — the result, our side and what follows.
    const security = globalThis.PolishSecurity;
    Q.pl_report_ending = S.chapter && S.chapter.status === 'ended' && security && security.coupEnding ? security.coupEnding(Q) : '';
    Q.pl_record_reforms = reforms.length ? reformsList(reforms) : '';
    Q.pl_record_count = reforms.length;
    // The verdicts begin the sentences of the balance.
    const cap = text => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '');
    Q.pl_verdict_power = cap(Q.pl_verdict_power || L('PPS stayed in opposition', 'PPS pozostała w opozycji'));
    Q.pl_verdict_reforms = reforms.length || !(S.chapter && S.chapter.status === 'ended') ? cap(Q.pl_goal_reforms) :
      L('No reform of PPS came into force', 'Żadna reforma PPS nie weszła w życie');
    // One line each for the Library and the balance, so that an empty list leaves no stray mark.
    const list = Q.pl_record_reforms ? '. ' + Q.pl_record_reforms : '';
    Q.pl_library_reforms = Q.pl_goal_reforms + list + '.';
    Q.pl_report_reforms = Q.pl_verdict_reforms + list + '.';
    Q.pl_verdict_republic = cap(Q.pl_verdict_republic);
    Q.pl_verdict_credibility = cap(Q.pl_goal_credibility);
    return Q;
  }

  // The factions of PPS in words for the balance of the chapter (Z — 1.31: no numbers of strength and dissent).
  function factionWords(f) {
    const one = (name, x, broke) => name + ': ' + L((x.strength >= 40 ? 'a strong' : x.strength >= 20 ? 'a middling' : 'a weak') + ' faction, ' +
      (x.dissent >= 60 ? 'very discontented' : x.dissent >= 30 ? 'discontented' : 'calm') + (broke ? ', after a split' : ''),
      (x.strength >= 40 ? 'silna' : x.strength >= 20 ? 'średnia' : 'słaba') + ' frakcja, ' +
      (x.dissent >= 60 ? 'bardzo niezadowolona' : x.dissent >= 30 ? 'niezadowolona' : 'spokojna') + (broke ? ', po rozłamie' : ''));
    return [one('Centrum', f.centrum, f.centrum.resigned), one('Lewica', f.lewica, f.lewica.split), one(L('Piłsudczycy', 'Piłsudczycy'), f.pilsudczycy, f.pilsudczycy.split)].join('; ');
  }

  return Object.freeze({overviewView: overviewView, lineView: lineView, goalsView: goalsView, factionWords: factionWords});
}));
