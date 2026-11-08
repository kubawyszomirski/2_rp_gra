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
      Q.pl_top_budget = (E.budget < -0.05 ? '−' : '') + rules.num(Math.round(Math.abs(E.budget) * 10) / 10) + ' B';
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

  return Object.freeze({overviewView: overviewView, lineView: lineView});
}));
