// Polish chapter institutions: elections, the Senate, ballots, office elections, the legal
// election calendar and the end of the chapter (docs/POLISH_IMPLEMENTATION_PLAN.md, stage 2;
// technical reference 6.1–6.5, 7.1–7.5, 19.1–19.2).
//
// Plain JavaScript without dependencies, like polish_rules.js, whose clock and recorded rolls it
// uses. `npm run build` copies both files to out/html/; the page loads this one after
// polish_rules.js as `window.PolishInstitutions`, and Node tests load it with require(). Numbers
// marked P in the reference are taken as written; the office-election profile is the approved
// test profile `office_profiles_1922_v1`, not a reconstruction of historical ballots.
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./polish_rules.js'));
  } else {
    root.PolishInstitutions = factory(root.PolishRules);
  }
}(typeof self !== 'undefined' ? self : this, function (rules) {
  'use strict';

  if (!rules) throw new Error('PolishInstitutions needs the rules module (polish_rules.js) first');
  // Polish version (decision 2A): the texts of this module are written in both languages and L picks the current one.
  const L = rules.L;

  const SEJM_SEATS = 444;
  const SENATE_SEATS = 111;
  const SEAT_METHOD = 'approved_bands_largest_remainders_v1';
  const SENATE_METHOD = 'sejm_proxy_v1'; // 6.4: an explicit simplification, not an election
  const OFFICE_PROFILE_ID = 'office_profiles_1922_v1';
  const ELECTORAL_LAW = 'DU/1922/590'; // 7.4: Sejm electoral law of 1922, arts. 13–14
  const FIRST_BALLOT_DATE = '1922-11-05';
  const FIRST_TERM_OPENED = '1922-11-28'; // 7.4, H: the first term began on 28 November 1922
  const TERM_YEARS = 5;
  const MIN_DAYS_AFTER_ANNOUNCEMENT = 78;
  const EARLY_ELECTION_MAX_DAYS = 90;

  const copy = value => JSON.parse(JSON.stringify(value));
  const compareId = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  const sumValues = object => Object.keys(object).reduce((n, key) => n + object[key], 0);

  // ---- Dates (ISO days, computed in UTC so the browser time zone never matters) ------------------

  function parseDay(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) throw new Error('not an ISO day: ' + iso);
    return Date.UTC(+m[1], +m[2] - 1, +m[3]);
  }
  function formatDay(ms) {
    return new Date(ms).toISOString().slice(0, 10);
  }
  function addDays(iso, days) {
    return formatDay(parseDay(iso) + days * 86400000);
  }
  function addYears(iso, years) {
    return String(+iso.slice(0, 4) + years) + iso.slice(4);
  }
  function weekday(iso) { // 0 = Sunday
    return new Date(parseDay(iso)).getUTCDay();
  }
  function firstSundayOnOrAfter(iso) {
    return addDays(iso, (7 - weekday(iso)) % 7);
  }
  function timeOfDay(iso) {
    return rules.timeOf(+iso.slice(0, 4), +iso.slice(5, 7));
  }

  // ---- Legal election calendar (7.4) -------------------------------------------------------------

  // Elections are ordered at the latest a week after the mandates expire; the vote is on a Sunday
  // at least 78 days after the announcement. The default variant announces on the day after the end
  // of the five-year term: 1922-11-28 → 1927-11-29 → earliest 1928-02-15 → Sunday 1928-02-19 (t=74).
  // An early election also has to fall within 90 days of the dissolution. An empty interval is a
  // configuration error, never an unlawful election.
  function scheduleElection(options) {
    const kind = options.kind;
    if (kind !== 'term_end' && kind !== 'dissolution') throw new Error('scheduleElection: unknown kind ' + kind);
    const record = {id: '', kind: kind, act_ref: ELECTORAL_LAW + ' arts. 13–14', method: 'first_sunday_after_78_days_v1'};
    if (kind === 'term_end') {
      record.opened_at = options.opened_at;
      record.term_end = addYears(options.opened_at, TERM_YEARS);
      record.announced_at = options.announced_at || addDays(record.term_end, 1);
      record.latest_vote = null;
    } else {
      if (!options.dissolved_at || !options.announced_at) throw new Error('scheduleElection: a dissolution needs its date and announcement');
      record.dissolved_at = options.dissolved_at;
      record.announced_at = options.announced_at;
      record.latest_vote = addDays(options.dissolved_at, EARLY_ELECTION_MAX_DAYS);
      record.basis = options.basis || null;
    }
    record.earliest_vote = addDays(record.announced_at, MIN_DAYS_AFTER_ANNOUNCEMENT);
    record.vote_date = firstSundayOnOrAfter(record.earliest_vote);
    if (record.latest_vote && record.vote_date > record.latest_vote) {
      throw new Error('scheduleElection: no lawful Sunday between ' + record.earliest_vote + ' and ' + record.latest_vote);
    }
    record.time = timeOfDay(record.vote_date);
    record.id = kind + '_' + record.vote_date;
    record.validated = true;
    return record;
  }

  function firstElectionBasis() {
    return {id: 'first_election_1922', kind: 'first_election', act_ref: ELECTORAL_LAW,
      vote_date: FIRST_BALLOT_DATE, time: timeOfDay(FIRST_BALLOT_DATE), validated: true};
  }

  // ---- Seats (6.1) ---------------------------------------------------------------------------------

  function multiplier(vote) {
    if (vote >= 25) return 1.25;
    if (vote >= 15) return 1.10;
    if (vote >= 10) return 1.025;
    if (vote >= 5) return 0.85;
    if (vote >= 2) return 0.55;
    return 0.25;
  }

  // Largest remainders; equal remainders go to the ascending stable ID.
  function apportion(rows, total, weightKey) {
    const sum = rows.reduce((n, row) => n + row[weightKey], 0);
    if (!(sum > 0)) return false;
    let assigned = 0;
    const ranked = rows.map(row => {
      const exact = total * row[weightKey] / sum;
      row.seats = Math.floor(exact);
      assigned += row.seats;
      return {row: row, remainder: exact - row.seats};
    }).filter(item => item.row[weightKey] > 0);
    ranked.sort((a, b) => b.remainder - a.remainder || compareId(a.row.id, b.row.id));
    for (let index = 0; index < total - assigned; index++) ranked[index].row.seats++;
    return true;
  }

  // The first ChZJN keeps the existing rule (6.2): a joint ZLN+PSChD list at the first election.
  const CHZJN = Object.freeze({id: 'chzjn', name: 'ChZJN (ZLN + PSChD)', members: Object.freeze(['zln', 'pschd'])});

  // Votes, lists and seats of one election. `votes` are shares in % that sum to 100; `alliances`
  // are the joint lists valid at this election, each shown at the place of its first member.
  // Everyone may stand: the next elections do not inherit German thresholds or bans (6.1).
  function allocateSeats(input) {
    const parties = input.parties, votes = input.votes, total = input.total;
    const alliances = input.alliances || [];
    const inAlliance = {};
    for (const alliance of alliances) for (const member of alliance.members) inAlliance[member] = alliance;
    const lists = [];
    for (const party of parties) {
      const alliance = inAlliance[party];
      if (alliance && alliance.members[0] !== party) continue;
      if (party === 'other') {
        // Full 2% anonymous lists plus a final remainder; the aggregate never gets a large-list bonus.
        let remaining = votes.other;
        let index = 1;
        do {
          const share = Math.min(2, remaining);
          lists.push({id: 'other_' + String(index).padStart(2, '0'), name: 'Inne — lista ' + index,
            members: ['other'], vote_share: share, eligible: true, anonymous: true});
          remaining = Math.max(0, remaining - share);
          index++;
        } while (remaining > 1e-12);
      } else {
        const members = alliance ? alliance.members.slice() : [party];
        lists.push({id: alliance ? alliance.id : party, name: alliance ? alliance.name : input.party_names[party],
          members: members, vote_share: members.reduce((n, id) => n + votes[id], 0), eligible: true, anonymous: false});
      }
    }
    for (const list of lists) {
      list.multiplier = multiplier(list.vote_share);
      list.weight = list.eligible ? list.vote_share * list.multiplier : 0;
    }
    if (!apportion(lists, total, 'weight')) return {error: 'No eligible list has positive support.'};
    const seats = {};
    for (const party of parties) seats[party] = 0;
    for (const list of lists) {
      if (list.members.length === 1) {
        seats[list.members[0]] += list.seats;
      } else {
        // A joint list divides its seats among its parties by their votes, by largest remainders.
        const attribution = list.members.map(party => ({id: party, weight: votes[party], seats: 0}));
        if (list.seats > 0) apportion(attribution, list.seats, 'weight');
        list.party_seats = {};
        for (const row of attribution) {
          seats[row.id] += row.seats;
          list.party_seats[row.id] = row.seats;
        }
      }
    }
    return {lists: lists, party_seats: seats};
  }

  // ---- Clubs and the minimal Senate (6.3, 6.4) ----------------------------------------------------

  // The two parliamentary representations of the minority bloc (5.5): 1/3 and 2/3 of its seats by
  // largest remainders, separately in each chamber, ties to the ascending ID. A working split of
  // the game, not the historical composition of the bloc.
  const MINORITY_SEGMENTS = Object.freeze(['jewish_rep', 'other_minorities_rep']);

  function splitMinorities(total) {
    const rows = [{id: 'jewish_rep', num: 1}, {id: 'other_minorities_rep', num: 2}];
    let assigned = 0;
    for (const row of rows) {
      row.seats = Math.floor(total * row.num / 3);
      row.remainder = (total * row.num) % 3;
      assigned += row.seats;
    }
    rows.slice().sort((a, b) => b.remainder - a.remainder || compareId(a.id, b.id))
      .slice(0, total - assigned).forEach(row => { row.seats += 1; });
    return {jewish_rep: rows[0].seats, other_minorities_rep: rows[1].seats};
  }

  // Club votes from party seats: one club per party, the minority bloc as its two representations.
  function clubSeatsFromPartySeats(partySeats) {
    const clubs = {};
    for (const party of Object.keys(partySeats)) {
      const seats = partySeats[party] || 0;
      if (party === 'minorities_bloc') {
        const split = splitMinorities(seats);
        for (const id of MINORITY_SEGMENTS) clubs[id] = (clubs[id] || 0) + split[id];
      } else {
        clubs[party] = (clubs[party] || 0) + seats;
      }
    }
    return clubs;
  }

  // One club per party that won seats; the minority bloc forms its two representations. Clubs of
  // the minorities and of "Inne" share only the seats of their own aggregate; the sum of the clubs
  // is the chamber.
  function clubsFromSeats(partySeats, parties) {
    const clubs = [];
    for (const party of parties) {
      const seats = partySeats[party] || 0;
      if (seats <= 0) continue;
      const parts = party === 'minorities_bloc' ? splitMinorities(seats) : {[party]: seats};
      for (const id of Object.keys(parts)) {
        if (parts[id] <= 0) continue;
        clubs.push({id: id, electoral_party_id: party, seats: parts[id], members_profile: 'party_default_v1',
          discipline: 1, issue_positions: {}, government_commitment: null});
      }
    }
    return clubs;
  }

  // 111 senators by largest remainders on the party shares of the Sejm seats; equal remainders go
  // to the ascending party ID. Recorded once per election and never recalculated from polls.
  function senateFromSejm(partySeats, parties, sejmTotal) {
    const seats = {};
    let assigned = 0;
    const remainders = parties.map(party => {
      const exact = SENATE_SEATS * (partySeats[party] || 0) / sejmTotal;
      seats[party] = Math.floor(exact);
      assigned += seats[party];
      return {party: party, remainder: exact - seats[party]};
    });
    remainders.sort((a, b) => b.remainder - a.remainder || compareId(a.party, b.party));
    for (let index = 0; index < SENATE_SEATS - assigned; index++) seats[remainders[index].party] += 1;
    return seats;
  }

  // The parliament and Senate domains of a new game (2.4): clubs of the opening Sejm, no Senate yet,
  // and the first election due in November 1922.
  function createInstitutionState(Q) {
    return {
      parliament: {
        chamber_id: Q.sejm_parliament.id,
        clubs: clubsFromSeats(Q.sejm_parliament.party_seats, Q.parties),
        transfers: [],
        replacements: [],
        speaker: null,
        speaker_elections: [],
        term: {sequence_after_opening: 0, opened_at: null, result_id: Q.sejm_parliament.id},
        previous_term: null,
        next_election: firstElectionBasis(),
        // Joint lists agreed for the next election (6.2; card 7.7), kept after it as history.
        alliances: [],
        // Laws in procedure and their outcome (7.2; stage 4): the Sejm vote, the Senate dates and promulgation.
        laws: [],
      },
      senate: {status: 'not_constituted', total: 0, club_seats: {}, records: [], method: null, result_id: null},
      ballots: [],
    };
  }

  // The first election or the next legal one, as the three mirror fields that inherited scenes read.
  // Legacy writers cannot move it: polish_opening_state rewrites the mirrors from this record.
  function nextElection(S) {
    const record = S.parliament.next_election;
    if (!record) return null;
    return {year: rules.yearOf(record.time), month: rules.monthOf(record.time), time: record.time, record: record};
  }

  // ---- Recording an election (6.3) --------------------------------------------------------------

  // One transaction: calculate, check, then publish the result, the clubs, the Senate, the term and
  // the next legal date together. Returns {ok, result} or {ok: false, error}; re-entry with the same
  // ID or in another phase changes nothing.
  function recordSejmElection(Q, pending) {
    const S = Q.S;
    if (!pending || pending.phase !== 'pending') return {ok: false, error: '', skipped: true};
    if (Q.sejm_results.some(result => result.id === pending.id)) return {ok: false, error: '', skipped: true};
    const total = Q.sejm_total_seats;
    if (!Number.isSafeInteger(total) || total <= 0) return {ok: false, error: 'The chamber size must be a positive integer.'};
    const parties = Q.parties.slice();
    const votes = {};
    let voteSum = 0;
    for (const party of parties) {
      const value = Q[party + '_normalized'];
      if (!Number.isFinite(value) || value < 0) return {ok: false, error: 'Voting intentions contain an invalid value for ' + party + '.'};
      votes[party] = value * 100;
      voteSum += votes[party];
    }
    if (!(voteSum > 0)) return {ok: false, error: 'All voting intentions are zero.'};
    for (const party of parties) votes[party] = votes[party] * 100 / voteSum;
    const basisId = pending.first ? firstElectionBasis().id : (S.parliament.next_election && S.parliament.next_election.id);
    // ChZJN of the first election (6.1), then the joint lists agreed in the list window (6.2, 6.5).
    const alliances = (pending.first && parties.indexOf('zln') >= 0 && parties.indexOf('pschd') >= 0 ? [CHZJN] : [])
      .concat((S.parliament.alliances || []).filter(a => a.election_id === basisId && a.status === 'accepted' &&
        a.members.every(m => parties.indexOf(m) >= 0)).map(a => ({id: a.id, name: a.name, members: a.members.slice()})));
    const allocation = allocateSeats({parties: parties, votes: votes, total: total, alliances: alliances, party_names: Q.party_names});
    if (allocation.error) return {ok: false, error: allocation.error};
    const seats = allocation.party_seats;
    if (sumValues(seats) !== total) return {ok: false, error: 'The seats do not add up to the chamber.'};

    const sequence = Q.sejm_results.length + 1;
    const basis = pending.first ? firstElectionBasis() : copy(S.parliament.next_election);
    if (!basis || !basis.validated) return {ok: false, error: 'The election has no validated legal basis.'};
    const senateSeats = senateFromSejm(seats, parties, total);
    const result = {
      id: pending.id, year: pending.year, month: pending.month,
      date: pending.year + '-' + String(pending.month).padStart(2, '0') + '-01',
      kind: pending.first ? 'november_1922' : 'next_legal_election',
      method: SEAT_METHOD, total_seats: total,
      party_names: copy(Q.party_names), party_votes: votes, party_seats: seats,
      lists: allocation.lists, previous_parliament: copy(Q.sejm_parliament),
      sequence_after_opening: sequence, legal_basis: basis, status: 'certified',
      ballot_date: basis.vote_date, senate_result_id: 'senate_' + pending.id,
    };
    // Publish. The previous parliament stays a shallow snapshot: seats and identity only.
    Q.sejm_results.push(result);
    Q.sejm_parliament = {id: result.id, kind: 'elected', total_seats: total,
      party_seats: copy(seats), party_names: copy(result.party_names)};
    const parliament = S.parliament;
    parliament.previous_term = {result_id: parliament.chamber_id, speaker: copy(parliament.speaker)};
    parliament.chamber_id = result.id;
    parliament.clubs = clubsFromSeats(seats, parties);
    parliament.transfers = [];
    parliament.replacements = [];
    parliament.speaker = null;
    parliament.speaker_elections = [];
    const opened = pending.first ? FIRST_TERM_OPENED : null;
    parliament.term = {sequence_after_opening: sequence, opened_at: opened, result_id: result.id};
    // The chapter ends with the next legal result (19.1); a following term belongs to the continuation.
    parliament.next_election = pending.first ? scheduleElection({kind: 'term_end', opened_at: FIRST_TERM_OPENED}) : null;
    S.senate = {status: 'constituted', total: SENATE_SEATS, club_seats: senateSeats, method: SENATE_METHOD,
      result_id: result.senate_result_id,
      records: S.senate.records.concat([{id: result.senate_result_id, election_id: result.id, date: result.ballot_date,
        method: SENATE_METHOD, total: SENATE_SEATS, party_seats: copy(senateSeats)}])};
    Q.n_elections += 1;
    Q.sejm_first_election_completed = 1;
    // Stage 5: the extra turnout of mobilisation campaigns ends with the election (5.3).
    if (S.society && Array.isArray(S.society.cells)) for (const cell of S.society.cells) cell.turnout_bonus = 0;
    pending.phase = 'results';
    return {ok: true, result: result};
  }

  // ---- Ballots (7.1) -----------------------------------------------------------------------------

  // Procedures of 7.1 with their quorum, denominator and threshold. The denominator of a qualified
  // majority is the valid votes: yes, no and abstentions; invalid votes count only for attendance
  // (the P convention of 7.1). Composition-based thresholds read the full membership.
  const BALLOT_RULES = Object.freeze({
    ordinary_resolution: Object.freeze({chamber: 'sejm', quorum: 148, kind: 'more_yes_than_no', basis: 'H: art. 32'}),
    cabinet_dismissal: Object.freeze({chamber: 'sejm', quorum: 148, kind: 'more_yes_than_no', basis: 'H: art. 58'}),
    sejm_self_dissolution: Object.freeze({chamber: 'sejm', quorum: 222, kind: 'share_of_valid', num: 2, den: 3, basis: 'H: art. 26'}),
    senate_dissolution_consent: Object.freeze({chamber: 'senate', quorum: 0, kind: 'share_of_membership', num: 3, den: 5, membership: SENATE_SEATS, basis: 'H: art. 26'}),
    constitutional_amendment_sejm: Object.freeze({chamber: 'sejm', quorum: 222, kind: 'share_of_valid', num: 2, den: 3, basis: 'H: art. 125'}),
    constitutional_amendment_senate: Object.freeze({chamber: 'senate', quorum: 56, kind: 'share_of_valid', num: 2, den: 3, basis: 'H: art. 125'}),
    senate_amendment_rejection: Object.freeze({chamber: 'sejm', quorum: 148, kind: 'share_of_valid', num: 11, den: 20, basis: 'H: art. 35'}),
    // The simplified Senate reviews a law passed by the Sejm (7.2, stage 4): without a majority against
    // the text it raises no objection (P: the detailed procedure of the Senate needs research).
    senate_review: Object.freeze({chamber: 'senate', quorum: 0, kind: 'more_yes_than_no', basis: 'P: simplified Senate review, 7.2'}),
  });

  // One deterministic count once the delegations are known; a tie on a law is a failure, never a lot.
  function resolveBallot(ruleId, counts) {
    const rule = BALLOT_RULES[ruleId];
    if (!rule) throw new Error('resolveBallot: unknown procedure ' + ruleId);
    const yes = counts.yes || 0, no = counts.no || 0, abstain = counts.abstain || 0, invalid = counts.invalid || 0;
    const present = counts.present === undefined ? yes + no + abstain + invalid : counts.present;
    const eligible = counts.eligible === undefined ? (rule.chamber === 'senate' ? SENATE_SEATS : SEJM_SEATS) : counts.eligible;
    if (yes + no + abstain + invalid > present || present > eligible) throw new Error('resolveBallot: votes exceed those present or present exceed the eligible');
    const valid = yes + no + abstain;
    const ballot = {id: counts.id || '', issue_id: counts.issue_id || '', chamber: rule.chamber, law_id: counts.law_id || null,
      rule: ruleId, eligible: eligible, present: present, yes: yes, no: no, abstain: abstain, invalid: invalid,
      quorum: rule.quorum, denominator: null, threshold: null, result: 'failed', club_votes: counts.club_votes || {}};
    if (present < rule.quorum) {
      ballot.result = 'no_quorum';
      return ballot;
    }
    if (rule.kind === 'more_yes_than_no') {
      ballot.denominator = yes + no;
      ballot.threshold = 'yes > no';
      ballot.result = yes > no ? 'passed' : 'failed';
    } else if (rule.kind === 'share_of_valid') {
      ballot.denominator = valid;
      ballot.threshold = rule.num + '/' + rule.den;
      ballot.result = yes * rule.den >= rule.num * valid && valid > 0 ? 'passed' : 'failed';
    } else {
      ballot.denominator = rule.membership;
      ballot.threshold = rule.num + '/' + rule.den + ' of ' + rule.membership;
      ballot.result = yes * rule.den >= rule.num * rule.membership ? 'passed' : 'failed';
    }
    return ballot;
  }

  // ---- Office elections (7.3, 7.5, M06) ------------------------------------------------------------

  const PEOPLE = Object.freeze({
    maciej_rataj: 'Maciej Rataj',
    eugeniusz_smiarowski: 'Eugeniusz Śmiarowski',
    ignacy_daszynski: 'Ignacy Daszyński',
    maurycy_zamoyski: 'Maurycy Zamoyski',
    stanislaw_wojciechowski: 'Stanisław Wojciechowski',
    jan_baudouin_de_courtenay: 'Jan Baudouin de Courtenay',
    gabriel_narutowicz: 'Gabriel Narutowicz',
    kazimierz_morawski: 'Kazimierz Morawski',
    marszalek_senior: 'the senior member (marszałek senior)',
    jozef_pilsudski: 'Józef Piłsudski',
  });
  // Names are stored in the records of S as written above (decision 5A); the displays translate the one English name.
  const PEOPLE_PL = Object.freeze({'the senior member (marszałek senior)': 'marszałek senior'});
  const personNameText = name => L(name, PEOPLE_PL[name] || name);

  function candidate(id, party) {
    return {id: id, name: PEOPLE[id], party: party};
  }

  // The approved test profile office_profiles_1922_v1 (P). Each club votes for the first candidate
  // still standing on its list and abstains when none is left; senators vote with their party's
  // club; KPP and "Inne" abstain. It is not a claim about how any party historically voted.
  // `decision` is the PPS choice: speaker 'smiarowski' | 'rataj' | 'daszynski'; president
  // 'nominate' | 'none'.
  function officeProfile(kind, decision, context) {
    const profile = rawOfficeProfile(kind, decision, context);
    // The two minority representations vote as the minority bloc did (5.5, stage 3).
    if (profile.preferences.minorities_bloc) {
      for (const id of MINORITY_SEGMENTS) profile.preferences[id] = profile.preferences.minorities_bloc.slice();
      delete profile.preferences.minorities_bloc;
    }
    // A club's list names only the candidates actually standing in this election.
    const standing = profile.candidates.map(c => c.id);
    for (const club of Object.keys(profile.preferences)) {
      profile.preferences[club] = profile.preferences[club].filter(id => standing.indexOf(id) >= 0);
    }
    return profile;
  }

  function rawOfficeProfile(kind, decision, context) {
    const ctx = context || {};
    if (kind === 'speaker') {
      const left = decision === 'daszynski' ? 'ignacy_daszynski' : 'eugeniusz_smiarowski';
      const candidates = [candidate('maciej_rataj', 'psl_piast'),
        decision === 'daszynski' ? candidate('ignacy_daszynski', 'pps') : candidate('eugeniusz_smiarowski', 'psl_wyzwolenie')];
      const pps = decision === 'rataj' ? ['maciej_rataj'] : [left];
      return {
        id: OFFICE_PROFILE_ID + ':speaker', office: 'speaker', chamber: 'sejm', procedure: 'top_two_runoff',
        quorum: 148, candidates: candidates,
        preferences: {zln: ['maciej_rataj'], pschd: ['maciej_rataj'], psl_piast: ['maciej_rataj'], npr: ['maciej_rataj'],
          psl_wyzwolenie: [left, 'maciej_rataj'], minorities_bloc: [left, 'maciej_rataj'], pps: pps, kpp: [], other: []},
        // P — acting chair when the vote does not resolve; the historical procedure is TBD.
        acting_holder: {id: 'marszalek_senior', name: PEOPLE.marszalek_senior},
      };
    }
    const nominate = decision === 'nominate';
    if (kind === 'president_first') {
      const candidates = [candidate('gabriel_narutowicz', 'psl_wyzwolenie'), candidate('jan_baudouin_de_courtenay', 'minorities_bloc'),
        candidate('maurycy_zamoyski', 'zln'), candidate('stanislaw_wojciechowski', 'psl_piast')];
      if (nominate) candidates.push(candidate('ignacy_daszynski', 'pps'));
      return {
        id: OFFICE_PROFILE_ID + ':president_first', office: 'president', chamber: 'national_assembly', procedure: 'elimination',
        quorum: ctx.quorum, candidates: candidates,
        preferences: {zln: ['maurycy_zamoyski', 'stanislaw_wojciechowski'], pschd: ['maurycy_zamoyski', 'stanislaw_wojciechowski'],
          psl_piast: ['stanislaw_wojciechowski', 'gabriel_narutowicz', 'maurycy_zamoyski'],
          npr: ['stanislaw_wojciechowski', 'gabriel_narutowicz', 'maurycy_zamoyski'],
          psl_wyzwolenie: ['gabriel_narutowicz', 'stanislaw_wojciechowski', 'ignacy_daszynski', 'jan_baudouin_de_courtenay'],
          pps: (nominate ? ['ignacy_daszynski'] : []).concat(['gabriel_narutowicz', 'jan_baudouin_de_courtenay', 'stanislaw_wojciechowski']),
          minorities_bloc: ['jan_baudouin_de_courtenay', 'gabriel_narutowicz', 'ignacy_daszynski', 'stanislaw_wojciechowski'],
          kpp: [], other: []},
        // Before the first President the Naczelnik Państwa stays in office.
        acting_holder: {id: 'jozef_pilsudski', name: PEOPLE.jozef_pilsudski},
      };
    }
    if (kind === 'president_second') {
      const candidates = [candidate('kazimierz_morawski', 'zln'), candidate('stanislaw_wojciechowski', 'psl_piast')];
      if (nominate) candidates.push(candidate('ignacy_daszynski', 'pps'));
      return {
        id: OFFICE_PROFILE_ID + ':president_second', office: 'president', chamber: 'national_assembly', procedure: 'elimination',
        quorum: ctx.quorum, candidates: candidates,
        preferences: {zln: ['kazimierz_morawski'], pschd: ['kazimierz_morawski'], psl_piast: ['stanislaw_wojciechowski'],
          npr: ['stanislaw_wojciechowski'], psl_wyzwolenie: ['stanislaw_wojciechowski'], minorities_bloc: ['stanislaw_wojciechowski'],
          pps: (nominate ? ['ignacy_daszynski'] : []).concat(['stanislaw_wojciechowski']), kpp: [], other: []},
        // C9: the Marshal of the Sejm acts during the vacancy.
        acting_holder: ctx.speaker ? {id: ctx.speaker.person_id, name: ctx.speaker.name} : {id: 'marszalek_senior', name: PEOPLE.marszalek_senior},
      };
    }
    throw new Error('officeProfile: unknown election ' + kind);
  }

  // A profile needs at least two valid, distinct candidates; anything less is a data error found
  // before the vote, not a situation in play (M06).
  function officeProfileProblems(profile) {
    const problems = [];
    const ids = new Set();
    for (const c of profile.candidates || []) {
      if (!c || typeof c.id !== 'string' || !c.id || typeof c.name !== 'string' || !c.name) problems.push('a candidate has no id or name');
      else if (ids.has(c.id)) problems.push('candidate ' + c.id + ' is listed twice');
      else ids.add(c.id);
    }
    if (ids.size < 2) problems.push('the profile has fewer than two valid candidates');
    for (const club of Object.keys(profile.preferences || {})) {
      for (const id of profile.preferences[club]) if (!ids.has(id)) problems.push('club ' + club + ' prefers ' + id + ', who is not standing');
    }
    if (!profile.acting_holder || !profile.acting_holder.id) problems.push('the profile names no acting holder');
    return problems;
  }

  // Votes of each club in the chamber: Sejm clubs, plus senators of the same party in the Assembly.
  function electorate(S, chamber) {
    const votes = {};
    for (const club of S.parliament.clubs) votes[club.id] = (votes[club.id] || 0) + club.seats;
    if (chamber === 'national_assembly') {
      const senators = clubSeatsFromPartySeats(S.senate.club_seats);
      for (const club of Object.keys(senators)) {
        if (senators[club] > 0) votes[club] = (votes[club] || 0) + senators[club];
      }
    }
    return votes;
  }

  function tally(standing, voters, preferences) {
    const votes = {};
    const supporters = {};
    for (const id of standing) { votes[id] = 0; supporters[id] = []; }
    let abstain = 0;
    for (const club of Object.keys(voters).sort()) {
      const pick = (preferences[club] || []).filter(id => standing.indexOf(id) >= 0)[0];
      if (pick) { votes[pick] += voters[club]; supporters[pick].push(club); } else abstain += voters[club];
    }
    return {votes: votes, supporters: supporters, abstain: abstain};
  }

  // Ranking: more votes first; equal votes go to the ascending stable ID (7.3, 7.5).
  const ranking = votes => (a, b) => votes[b] - votes[a] || compareId(a, b);

  // Deterministic count of one office election. The count repeats the same way on every call; only
  // an exact tie of two finalists uses a lot, u = roll(runId + ':final_tie'), recorded once.
  // Invalid ballots (options.invalid) count for attendance only. Returns the run record: rounds
  // (diagnostic), final ballot, winner, status and tie_break.
  function resolveOfficeElection(S, runId, profile, voters, options) {
    const problems = officeProfileProblems(profile);
    if (problems.length) throw new Error('office profile ' + profile.id + ' rejected before the vote: ' + problems.join('; '));
    const invalid = (options && options.invalid) || 0;
    const present = sumValues(voters) + invalid;
    const eligible = options && options.eligible !== undefined ? options.eligible : present;
    const run = {id: runId, office: profile.office, chamber: profile.chamber, profile_id: profile.id,
      procedure: profile.procedure, eligible: eligible, present: present, invalid: invalid, quorum: profile.quorum || 0,
      candidates: profile.candidates.map(c => copy(c)), preference_snapshot: copy(profile.preferences),
      electorate: copy(voters), rounds: [], final_ballot: null, winner_id: null, winner_name: null,
      status: 'no_election', reason: null, tie_break: null, acting_holder: copy(profile.acting_holder)};
    if (present < run.quorum) {
      run.reason = 'no_quorum';
      return run;
    }
    let standing = profile.candidates.map(c => c.id).sort(compareId);
    const maxRounds = standing.length;
    for (let round = 1; round <= maxRounds; round++) {
      const count = tally(standing, voters, profile.preferences);
      const valid = sumValues(count.votes) + count.abstain;
      const order = standing.slice().sort(ranking(count.votes));
      const entry = {round: round, standing: standing.slice(), votes: count.votes, abstain: count.abstain, valid: valid, eliminated: []};
      run.rounds.push(entry);
      // An absolute majority of the valid ballots elects outright.
      if (standing.length > 2 && count.votes[order[0]] * 2 > valid) {
        return finishOffice(S, run, standing, count, order[0], null);
      }
      if (standing.length === 2) {
        const a = order[0], b = order[1];
        if (count.votes[a] + count.votes[b] === 0) {
          run.reason = 'no_votes_cast';
          run.final_ballot = finalBallot(profile, standing, count, present, invalid);
          return run;
        }
        if (count.votes[a] > count.votes[b]) return finishOffice(S, run, standing, count, a, null);
        // Exact tie of two valid finalists with the quorum met: the approved 50/50 lot.
        const finalists = standing.slice().sort(compareId);
        const rollId = runId + ':final_tie';
        const u = rules.roll(S, rollId);
        const winner = u < 0.5 ? finalists[0] : finalists[1];
        return finishOffice(S, run, standing, count, winner, {method: 'lot_50_50', finalist_ids: finalists, roll_id: rollId, winner_id: winner});
      }
      if (profile.procedure === 'top_two_runoff') {
        entry.eliminated = order.slice(2);
        standing = order.slice(0, 2).sort(compareId);
      } else {
        const weakest = order[order.length - 1];
        entry.eliminated = [weakest];
        standing = standing.filter(id => id !== weakest);
      }
    }
    run.reason = 'unresolved';
    return run;
  }

  function finalBallot(profile, standing, count, present, invalid) {
    return {
      candidates: standing.slice().sort(ranking(count.votes)).map(id => ({candidate_id: id,
        candidate_name: profile.candidates.filter(c => c.id === id)[0].name, votes: count.votes[id],
        supporters: count.supporters[id].slice()})),
      abstain: count.abstain, invalid: invalid, present: present,
    };
  }

  function finishOffice(S, run, standing, count, winnerId, tieBreak) {
    const profileCandidates = run.candidates;
    run.final_ballot = finalBallot({candidates: profileCandidates}, standing, count, run.present, run.invalid);
    run.winner_id = winnerId;
    run.winner_name = profileCandidates.filter(c => c.id === winnerId)[0].name;
    run.status = 'elected';
    run.tie_break = tieBreak;
    return run;
  }

  // The final ballot of a run as a Ballot record of 7.1, kept in S.ballots once.
  function recordOfficeBallot(S, run, date) {
    const id = run.id + ':final';
    if (S.ballots.some(ballot => ballot.id === id)) return;
    const club_votes = {};
    if (run.final_ballot) {
      for (const row of run.final_ballot.candidates) for (const club of row.supporters) club_votes[club] = row.candidate_id;
    }
    S.ballots.push({id: id, issue_id: run.id, chamber: run.chamber, law_id: null, rule: 'office_election', date: date,
      eligible: run.eligible, present: run.present, yes: null, no: null,
      abstain: run.final_ballot ? run.final_ballot.abstain : 0, invalid: run.invalid || 0, quorum: run.quorum,
      denominator: 'more_votes_in_final', threshold: run.procedure, result: run.status,
      candidate_votes: run.final_ballot ? run.final_ballot.candidates.reduce((map, row) => { map[row.candidate_id] = row.votes; return map; }, {}) : {},
      club_votes: club_votes, tie_break: run.tie_break ? copy(run.tie_break) : null});
  }

  // Assembly quorum (P): at least half of the members, the same convention as the constitutional
  // amendment in 7.1. In chapter 1 every club attends mandatory office elections, so it is met.
  function assemblyQuorum(S) {
    return Math.ceil(sumValues(electorate(S, 'national_assembly')) / 2);
  }

  // ---- The Marshal of the Sejm (7.5; card 7.8) -----------------------------------------------------

  // Options of the PPS stance (0 T). Conditions that read systems of later stages (earlier
  // commitments, reputation, a faction line) are not met until those stages exist.
  function speakerOptions(Q) {
    const daszynskiAvailable = !Q.daszynski_left_adviser_pool && !(Q.polish_presidency && Q.polish_presidency.current &&
      Q.polish_presidency.current.holder_id === 'ignacy_daszynski');
    return {
      smiarowski: {available: true, reason: ''},
      rataj: {available: (Q.psl_piast_relation || 0) >= 45,
        reason: L('PSL Piast will not accept the package below relation 45.', 'PSL Piast nie przyjmie pakietu przy relacji niższej niż 45.')},
      daszynski: {available: daszynskiAvailable && (Q.psl_wyzwolenie_relation || 0) >= 60,
        reason: !daszynskiAvailable ? L('Ignacy Daszyński is not available.', 'Ignacy Daszyński jest niedostępny.') :
          L('PSL Wyzwolenie will not sign the nomination below relation 60.', 'PSL Wyzwolenie nie podpisze zgłoszenia przy relacji niższej niż 60.')},
    };
  }

  function speakerDue(Q) {
    const S = Q.S, parliament = S.parliament;
    if (!Q.sejm_first_election_completed || !Q.sejm_pending || Q.sejm_pending.phase !== 'complete') return false;
    if (parliament.term.sequence_after_opening < 1 || parliament.speaker) return false;
    if (S.chapter.status === 'ended') return false;
    if (Q.year < 1922 || (Q.year === 1922 && Q.month < 12)) return false;
    const last = parliament.speaker_elections[parliament.speaker_elections.length - 1];
    if (last && last.phase !== 'complete') return false; // already in progress
    // After a vote that did not resolve, the new vote is next month (M06).
    return !(last && last.status === 'no_election' && last.retry_at > Q.time);
  }

  function speakerInProgress(S) {
    const list = S.parliament.speaker_elections;
    const last = list[list.length - 1];
    return !!(last && last.phase !== 'complete');
  }

  // Opens a speaker election, or returns the one in progress.
  function beginSpeakerElection(Q) {
    const parliament = Q.S.parliament;
    const list = parliament.speaker_elections;
    const last = list[list.length - 1];
    if (last && last.phase !== 'complete') return last;
    const vacancy = list.some(run => run.status === 'elected');
    const run = {id: 'speaker_' + parliament.chamber_id + '_' + (list.length + 1), instance: vacancy ? 'vacancy' : 'speaker_1922',
      t: Q.time, date: rules.yearOf(Q.time) + '-' + String(rules.monthOf(Q.time)).padStart(2, '0'),
      phase: 'choice', pps_decision: null, status: null, effects_applied: [], retry_at: null};
    list.push(run);
    return run;
  }

  // The PPS choice, then the vote at once; direct effects are applied once per election (7.5).
  function chooseSpeakerStance(Q, decision) {
    const S = Q.S;
    const run = beginSpeakerElection(Q);
    if (run.phase !== 'choice') return run;
    const option = speakerOptions(Q)[decision];
    if (!option || !option.available) throw new Error('chooseSpeakerStance: ' + decision + ' is not available');
    run.pps_decision = decision;
    if (decision === 'smiarowski') applyRelationOnce(Q, run, 'psl_wyzwolenie_relation', 4);
    if (decision === 'rataj') {
      applyRelationOnce(Q, run, 'psl_piast_relation', 4);
      run.commitment = {id: run.id + ':rataj_package', kind: 'speaker_package', partner: 'psl_piast',
        terms: ['defend_standing_orders', 'pps_committee_participation'], agreement_created: false};
    }
    const profile = officeProfile('speaker', decision);
    const result = resolveOfficeElection(S, run.id, profile, electorate(S, 'sejm'));
    Object.assign(run, {office: result.office, chamber: result.chamber, profile_id: result.profile_id,
      procedure: result.procedure, eligible: result.eligible,
      present: result.present, quorum: result.quorum, candidates: result.candidates, preference_snapshot: result.preference_snapshot,
      electorate: result.electorate, rounds: result.rounds, final_ballot: result.final_ballot, winner_id: result.winner_id,
      winner_name: result.winner_name, status: result.status, reason: result.reason, tie_break: result.tie_break,
      acting_holder: result.acting_holder});
    recordOfficeBallot(S, run, run.date);
    if (run.status === 'elected') {
      const winner = run.candidates.filter(c => c.id === run.winner_id)[0];
      S.parliament.speaker = {person_id: winner.id, name: winner.name, club_id: winner.party, since_t: Q.time, run_id: run.id, acting: false};
    } else {
      S.parliament.speaker = null;
      run.retry_at = Q.time + 1;
    }
    run.phase = 'result';
    return run;
  }

  function applyRelationOnce(Q, run, key, delta) {
    const id = run.id + ':' + key;
    if (run.effects_applied.indexOf(id) >= 0) return;
    Q[key] = Math.max(0, Math.min(100, (Q[key] || 0) + delta));
    run.effects_applied.push(id);
  }

  function finishSpeakerElection(Q) {
    const list = Q.S.parliament.speaker_elections;
    const run = list[list.length - 1];
    if (run && run.phase === 'result') run.phase = 'complete';
    return run || null;
  }

  // A Marshal elected President leaves the office and the Sejm: the office falls vacant and the
  // mandate goes to the next person on the same list, so the club keeps its seats and no 445th MP
  // appears (7.3, P; the historical replacement procedure is TBD — historical research required).
  function vacateSpeakerForPresidency(Q, personId, date) {
    const parliament = Q.S.parliament;
    if (!parliament.speaker || parliament.speaker.person_id !== personId) return false;
    const club = parliament.speaker.club_id;
    parliament.speaker = null;
    const id = 'mandate_' + personId + '_president';
    if (!parliament.replacements.some(item => item.id === id)) {
      parliament.replacements.push({id: id, date: date, club_id: club, person_out: personId,
        reason: 'elected_president', method: 'next_on_list_v1'});
    }
    return true;
  }

  // ---- The President (7.3; card 7.9) --------------------------------------------------------------

  // The count of one presidential election from the recorded Assembly, once per run.
  function resolvePresidentialElection(Q, runId, kind, nominate) {
    const S = Q.S;
    const profile = officeProfile(kind, nominate ? 'nominate' : 'none', {quorum: assemblyQuorum(S), speaker: S.parliament.speaker});
    const run = resolveOfficeElection(S, runId, profile, electorate(S, 'national_assembly'));
    run.pps_nomination = nominate ? 'ignacy_daszynski' : '';
    return run;
  }

  // ---- End of the chapter and the report (19.1, 19.2) ---------------------------------------------

  function latestElection(Q) {
    return Q.sejm_results && Q.sejm_results.length ? Q.sejm_results[Q.sejm_results.length - 1] : null;
  }

  function electionEndpoint(Q) {
    const latest = latestElection(Q);
    return !!(latest && latest.sequence_after_opening >= 2 && latest.legal_basis && latest.legal_basis.validated &&
      latest.status === 'certified' && latest.total_seats === SEJM_SEATS);
  }

  // The coup domain arrives in stage 7; until then there is no coup endpoint.
  function coupEndpoint(S) {
    const coup = S.coup;
    return !!(coup && coup.attempt_id != null && coup.phase === 'resolved' && coup.outcome != null && coup.effects_complete);
  }

  function chapterEnds(Q) {
    return electionEndpoint(Q) || coupEndpoint(Q.S);
  }

  // Once recorded, the trigger and the report never change (19.1); a second call returns the same. A coup resolved
  // before the vote is the boundary of the chapter (stage 7d); the election record stays in the report.
  function endChapterIfDue(Q) {
    const S = Q.S;
    if (S.chapter.status === 'ended') return S.chapter;
    if (!chapterEnds(Q)) return null;
    const latest = latestElection(Q);
    const coup = coupEndpoint(S);
    S.chapter.status = 'ended';
    S.chapter.reason = coup ? 'coup' : 'next_legal_election';
    S.chapter.trigger_id = coup ? S.coup.attempt_id : latest.id;
    S.chapter.report = buildReport(Q, latest, coup ? S.coup : null);
    return S.chapter;
  }

  // Stage 8 completes the content, the researched dates and the calibration of the Normal scenario; what remains is the
  // continuation after the chapter.
  const NOT_MODELLED = Object.freeze([
    'What follows the chapter — a new government after the election or the coup — is not part of this game',
  ]);
  // The report keeps these texts in English (decision 5A of the Polish version); the Polish report shows them translated.
  const REPORT_TEXTS_PL = Object.freeze({
    'What follows the chapter — a new government after the election or the coup — is not part of this game':
      'To, co następuje po rozdziale — nowy rząd po wyborach albo po zamachu — nie jest częścią tej gry',
    'Office elections use the test profile office_profiles_1922_v1 (P).': 'Wybory na urzędy korzystają z profilu testowego office_profiles_1922_v1 (P).',
    'The 1928 date is the game calendar of 7.4, not the historical election date.': 'Data z 1928 roku pochodzi z kalendarza gry (7.4), a nie z historycznej daty wyborów.',
    'The Senate is the sejm_proxy_v1 simplification.': 'Senat jest uproszczeniem sejm_proxy_v1.',
    'The army groups are the synthetic profile synthetic_test_v2 and the coup follows coup_f_v1 (P); they follow the pattern of May 1926, not its units and numbers.':
      'Zgrupowania wojska to syntetyczny profil synthetic_test_v2, a zamach przebiega według coup_f_v1 (P); naśladują wzorzec maja 1926 roku, a nie jego jednostki i liczby.',
    ['The dated inputs of the Normal scenario use historical dates: the dispute of the Naczelnik with the cabinet (VI 1922), the funeral of the assassin ' +
      '(II 1923), the military case from Piłsudski’s resignation of 2 VII 1923 and the officers’ demonstration (from XI 1925); what follows them depends on the game.']:
      'Datowane wydarzenia scenariusza Normalnego mają daty historyczne: spór Naczelnika Państwa z gabinetem (VI 1922), pogrzeb zamachowca (II 1923), ' +
      'sprawę wojskową od dymisji Piłsudskiego 2 VII 1923 i demonstrację oficerów (od XI 1925); to, co następuje potem, zależy od gry.',
    'Government formation after the 1928 election belongs to the continuation.': 'Utworzenie rządu po wyborach 1928 roku należy do kontynuacji.',
  });
  rules.registerStoredText(text => REPORT_TEXTS_PL[text]);

  const mean = (cells, field) => {
    const mass = cells.reduce((n, c) => n + c.mass, 0);
    return mass > 0 ? cells.reduce((n, c) => n + c.mass * (typeof field === 'function' ? field(c) : c[field] || 0), 0) / mass : 0;
  };
  const MAIN_CLASS_IDS = Object.freeze(['workers', 'rural', 'new_middle', 'old_middle', 'bourgeois_landowners']);

  // 19.2 — society: the preferences, turnout, grievance and radicalisation of the cells, and the democratic legitimacy.
  function societyReport(S) {
    const cells = (S.society && S.society.cells) || [];
    const byClass = {};
    for (const id of MAIN_CLASS_IDS) {
      const own = cells.filter(c => c.class_id === id);
      byClass[id] = {pps: mean(own, c => c.propensity.pps), grievance: mean(own, 'grievance'), radicalization: mean(own, 'radicalization'),
        turnout: mean(own, c => (c.turnout_base || 0) + (c.turnout_bonus || 0))};
    }
    return {cells: cells.map(c => ({id: c.id, class_id: c.class_id, identity_id: c.identity_id, employment: c.employment, mass: c.mass,
      propensity: copy(c.propensity), turnout: (c.turnout_base || 0) + (c.turnout_bonus || 0), grievance: c.grievance || 0,
      radicalization: c.radicalization || 0})), by_class: byClass, national_grievance: S.politics ? S.politics.national_grievance : null,
      democratic_legitimacy: S.politics ? S.politics.democracy : null};
  }

  // 19.2 — the unfinished matters: projects, laws in procedure, charges and financing, promises, ultimatums, agreements.
  function unfinishedReport(S) {
    const agreements = Object.keys(S.agreements || {}).sort().map(id => S.agreements[id]);
    return {
      projects: Object.keys(S.projects || {}).sort().map(id => S.projects[id]).filter(p => p && p.status !== 'completed' && p.status !== 'repealed')
        .map(p => ({id: p.id, type: p.type, variant: p.variant, status: p.status, progress: p.progress, build_budget_B: p.build_budget_B,
          upkeep_budget_B: p.upkeep_budget_B, authorized: p.authorized})),
      laws_in_procedure: (S.parliament.laws || []).filter(l => l.status === 'in_procedure').map(l => ({id: l.id, title: l.title, next_step: l.next_step,
        senate_notice_due: l.senate_notice_due, senate_return_due: l.senate_return_due})),
      financing: S.economy ? (S.economy.policies || []).filter(p => p.status === 'active').map(p => ({id: p.id, kind: p.kind, variant: p.variant,
        ends_at: p.ends_at})) : [],
      promises: agreements.filter(a => a.status === 'active' || a.status === 'breached').map(a => ({agreement_id: a.id, kind: a.kind,
        parties: a.parties.slice(), open: (a.obligations || []).filter(o => o.status === 'active' || o.status === 'breached')
          .map(o => ({id: o.id, topic: o.topic, due_at: o.due_at, fulfillment: o.fulfillment, status: o.status}))})),
      ultimatums: agreements.filter(a => a.ultimatum && a.ultimatum.status === 'open').map(a => ({agreement_id: a.id, due_at: a.ultimatum.due_at})),
      expiring: agreements.filter(a => a.status === 'active' && ((a.term && a.term.expires_at) || a.review_at)).map(a => ({agreement_id: a.id,
        expires_at: a.term ? a.term.expires_at : null, review_at: a.review_at || null})),
    };
  }

  // 19.2 — the memory of actions: draws and resolutions, applied effects, the saturation of campaigns, cooldowns.
  function memoryReport(S) {
    const applied = Object.keys(S.projects || {}).reduce((n, id) => n + ((S.projects[id] && S.projects[id].effects_applied) || []).length, 0);
    return {rolls: copy(S.rng.rolls), events_resolved: copy(S.events.resolved), applied_effect_ids: applied,
      democracy_effects: S.politics ? S.politics.democracy_effects.map(e => e.id) : [],
      impulses: S.coup ? S.coup.impulses.map(i => i.id) : [],
      campaigns: S.party_orgs && S.party_orgs.press ? copy(S.party_orgs.press.campaigns) : [], cooldowns: copy(S.cooldowns)};
  }

  const monthIso = t => rules.yearOf(t) + '-' + String(rules.monthOf(t)).padStart(2, '0');

  // The turning point of a resolved coup (16.8.7): outcome, offer, F9, the rounds, the draw of the sides with the
  // democracy of the declaration, losses, costs, the contribution of PPS and what the continuation owes.
  function coupTurningPoint(coup) {
    const A = coup.attempt || {};
    return {type: 'coup', attempt_id: coup.attempt_id, date: monthIso(A.declared_at || 0), outcome: coup.outcome, round: coup.round,
      offer: coup.settlement, f9: copy(coup.f9), pps_stance: coup.stance, commitment: A.commitment || null,
      pps_contribution: coup.pps_contribution, concessions_to_pps: copy(coup.concessions_to_pps || []),
      democracy_at_declaration: A.democracy, loyalty_shift: A.loyalty_shift, sides: copy(A.sides || null), rolls: copy(A.rolls || {}),
      rounds: copy(A.resolution ? A.resolution.log : []), counterfactual: copy(A.counterfactual || null), effects: copy(A.effects || null),
      organisations: copy(A.organisations || null)};
  }

  // A deep copy of what exists now (19.2). Areas that later stages add are listed, not invented.
  function buildReport(Q, latest, coup) {
    const S = Q.S;
    const first = Q.sejm_results[0];
    const presidency = Q.polish_presidency || {};
    const electionPoint = {type: 'election', date: latest.ballot_date, sequence_after_opening: latest.sequence_after_opening,
      legal_basis: copy(latest.legal_basis), party_seats: copy(latest.party_seats), party_votes: copy(latest.party_votes),
      previous_election_id: first && first.id !== latest.id ? first.id : null,
      previous_party_seats: first && first.id !== latest.id ? copy(first.party_seats) : null};
    return {
      report_id: 'report_' + (coup ? coup.attempt_id : latest.id),
      schema_version: S.meta.schema_version, balance_id: S.meta.balance_id, scenario_id: S.meta.scenario_id,
      trigger_id: coup ? coup.attempt_id : latest.id, time: Q.time, date: coup ? monthIso(coup.attempt.declared_at) : latest.ballot_date,
      reason: coup ? 'coup' : 'next_legal_election',
      state: {
        turning_point: coup ? coupTurningPoint(coup) : electionPoint,
        // A coup before the vote leaves the last election in the report (19.1).
        last_election: coup ? electionPoint : null,
        pps: {seats: latest.party_seats.pps || 0, seats_1922: first ? first.party_seats.pps || 0 : null,
          vote_share: latest.party_votes.pps || 0,
          factions: {centrum: {strength: Q.centrum_strength, dissent: Q.centrum_dissent, resigned: !!Q.centrum_resigned},
            lewica: {strength: Q.lewica_strength, dissent: Q.lewica_dissent, split: !!Q.lewica_split},
            pilsudczycy: {strength: Q.pilsudczycy_strength, dissent: Q.pilsudczycy_dissent, split: !!Q.pilsudczycy_split}},
          resources: Q.resources,
          // Stage 5: the party's own record (13, 10.5): the declared line is a programme, kept apart from laws.
          strategy: S.actors.pps && S.actors.pps.strategy ? copy(S.actors.pps.strategy) : null,
          program: S.actors.pps && S.actors.pps.program ? copy(S.actors.pps.program) : null,
          organisations: S.party_orgs && S.party_orgs.apparatus ? {cash: S.party_orgs.cash, dues: S.party_orgs.dues,
            member_index: S.party_orgs.apparatus.member_index, apparatus_level: S.party_orgs.apparatus.level,
            press_reach: S.party_orgs.press.reach, tur_level: S.party_orgs.tur.level,
            cooperatives: S.party_orgs.cooperatives.projects.filter(c => c.status === 'operating').length} : null,
          militia: S.militia && S.militia.stage ? {strength: S.militia.strength, militancy: S.militia.militancy, stage: S.militia.stage,
            fatigue: S.militia.fatigue, banned: !!S.militia.banned, repressed: !!S.militia.repressed} : null,
          credibility: S.actors.pps ? S.actors.pps.credibility : null,
          manifests: S.faction_cases && S.faction_cases.manifests ? copy(S.faction_cases.manifests) : [],
          unions: S.unions ? Object.keys(S.unions).sort().map(id => ({id: id, reach: S.unions[id].reach, fund: S.unions[id].fund,
            trust: S.unions[id].trust, dissent: S.unions[id].dissent, readiness: S.unions[id].readiness, fatigue: S.unions[id].fatigue,
            alignment: copy(S.unions[id].alignment)})) : [],
          // Stage 6: the strikes of the chapter and their settlements (14.3–14.5; the Kraków context of 17.5).
          strikes: S.strikes ? Object.keys(S.strikes.records).sort().map(id => {
            const r = S.strikes.records[id];
            return {id: id, kind: r.kind, branches: r.branches.slice(), status: r.status, outcome: r.outcome, krakow: !!r.krakow,
              settlements: r.settlements.map(x => ({id: x.id, status: x.status, reaction: x.reaction}))};
          }) : [],
          // Stage 6c: the synthetic plants and what the cards did with them (decision 2A; 17.12).
          plants: S.enterprises ? Object.keys(S.enterprises.records).sort().map(id => {
            const p = S.enterprises.records[id];
            return {id: id, branch: p.branch, cause: p.cause, status: p.status, owner: p.owner,
              representation: p.representation ? p.representation.variant : null, derogation: p.exemption ? p.exemption.status : null};
          }) : []},
        economy: S.economy ? {currency_regime: S.economy.currency_regime, inflation_m: S.economy.inflation_m, real_wage: S.economy.real_wage,
          output: S.economy.output, credit: S.economy.credit, unemployment: S.economy.unemployment, market_unemployment: S.economy.market_unemployment,
          budget: S.economy.budget, budget_base: S.economy.budget_base, tax_level: S.economy.tax_level,
          policies: (S.economy.policies || []).map(p => ({id: p.id, kind: p.kind, variant: p.variant, status: p.status, starts_at: p.starts_at,
            ends_at: p.ends_at, emission_points: p.emission_points || 0})),
          business: {pressure: S.economy.business_pressure, state: S.economy.business_state}} : null,
        // Stage 7 (19.2): society, politics and the forces of the state; what is unfinished and what the game remembers.
        society: societyReport(S),
        politics: S.politics ? {democracy: S.politics.democracy, parliament_authority: S.politics.parliament_authority, violence: S.politics.violence,
          national_grievance: S.politics.national_grievance, coup_pressure: S.coup ? S.coup.pressure : null, coup_phase: S.coup ? S.coup.phase : null,
          cases: copy(S.politics.cases), restrictions: copy(S.politics.restrictions), episodes: copy(S.politics.episodes)} : null,
        security: S.security ? {profile_id: S.security.profile_id, forces: copy(S.security.forces), known: copy(S.security.known),
          assessments: copy(S.security.assessments), police: copy(S.security.police),
          pilsudski_agreement: S.actors && S.actors.pilsudski && S.actors.pilsudski.agreement_id ? copy(S.agreements[S.actors.pilsudski.agreement_id]) : null} : null,
        unfinished: unfinishedReport(S),
        memory: memoryReport(S),
        reforms: Q.polish_presidency && Q.polish_presidency.constitution ? copy(Q.polish_presidency.constitution.reforms || null) : null,
        constitution: {president: copy(presidency.current || null), presidential_elections: copy(presidency.elections || []),
          outgoing_speaker: copy(S.parliament.previous_term ? S.parliament.previous_term.speaker : null),
          speaker: copy(S.parliament.speaker || null),
          sejm: {id: latest.id, total_seats: latest.total_seats, clubs: copy(S.parliament.clubs)},
          senate: copy(S.senate)},
        // The cabinet record of stage 3 (8.4, 8.5): the mirrors name the premier and the PPS position.
        government: {prime_minister: Q.chancellor || '', pps_position: Q.pps_government_position_en || Q.pps_government_position || '',
          cabinet: S.cabinet ? copy({id: S.cabinet.id, configuration_id: S.cabinet.configuration_id, status: S.cabinet.status,
            pps_mode: S.cabinet.pps_mode, portfolios: S.cabinet.portfolios, partner_ids: S.cabinet.partner_ids,
            supporter_ids: S.cabinet.supporter_ids, support_seats: S.cabinet.support_seats === undefined ? null : S.cabinet.support_seats}) : null,
          cabinets_before: S.history.cabinets.length},
      },
      ledger_summary: {months_settled: S.history.months.length, actions: S.history.actions.length,
        rolls: Object.keys(S.rng.rolls).length, ballots: S.ballots.length,
        events_resolved: Object.keys(S.events.resolved).length},
      uncertainties: ['Office elections use the test profile office_profiles_1922_v1 (P).',
        'The 1928 date is the game calendar of 7.4, not the historical election date.',
        'The Senate is the sejm_proxy_v1 simplification.',
        'The army groups are the synthetic profile synthetic_test_v2 and the coup follows coup_f_v1 (P); they follow the pattern of May 1926, not its units and numbers.',
        'The dated inputs of the Normal scenario use historical dates: the dispute of the Naczelnik with the cabinet (VI 1922), the funeral of the assassin ' +
          '(II 1923), the military case from Piłsudski’s resignation of 2 VII 1923 and the officers’ demonstration (from XI 1925); what follows them depends on the game.'],
      not_modelled: NOT_MODELLED.slice(),
      continuation_requirements: coup ? copy((coup.attempt && coup.attempt.continuation_requirements) || []) :
        ['Government formation after the 1928 election belongs to the continuation.'],
    };
  }

  // ---- Routing of the mandatory sequences (4.5 order, kept outside the queue until stage 7) -------

  // One value, so the go-to of main and post_event has exactly one valid target: a started sequence
  // first (category 1), then an event of category 1–2 already chosen by the queue (stage 7c: a started part of a
  // sequence or an immediate succession), then elections and offices (category 3), then the other events.
  function route(Q) {
    if (Q.polish_save_incompatible || !Q.S) return 'incompatible';
    if (Q.S.chapter.status === 'ended') return 'report';
    if (Q.sejm_election_in_progress) return 'sejm';
    if (Q.polish_presidential_in_progress) return 'presidency';
    if (speakerInProgress(Q.S)) return 'speaker';
    if (Q.has_event === 1 && Q.S.events && Q.S.events.active && Q.S.events.active.priority <= 2) return 'event';
    if (Q.sejm_election_due) return 'sejm';
    if (speakerDue(Q)) return 'speaker';
    if (Q.polish_presidential_due) return 'presidency';
    if (Q.has_event === 1) return 'event';
    return '';
  }

  return Object.freeze({
    personNameText: personNameText,
    CHZJN: CHZJN,
    SEJM_SEATS: SEJM_SEATS,
    SENATE_SEATS: SENATE_SEATS,
    SENATE_METHOD: SENATE_METHOD,
    SEAT_METHOD: SEAT_METHOD,
    OFFICE_PROFILE_ID: OFFICE_PROFILE_ID,
    FIRST_TERM_OPENED: FIRST_TERM_OPENED,
    BALLOT_RULES: BALLOT_RULES,
    NOT_MODELLED: NOT_MODELLED,
    addDays: addDays,
    weekday: weekday,
    scheduleElection: scheduleElection,
    multiplier: multiplier,
    allocateSeats: allocateSeats,
    MINORITY_SEGMENTS: MINORITY_SEGMENTS,
    splitMinorities: splitMinorities,
    clubSeatsFromPartySeats: clubSeatsFromPartySeats,
    clubsFromSeats: clubsFromSeats,
    senateFromSejm: senateFromSejm,
    createInstitutionState: createInstitutionState,
    nextElection: nextElection,
    recordSejmElection: recordSejmElection,
    resolveBallot: resolveBallot,
    officeProfile: officeProfile,
    officeProfileProblems: officeProfileProblems,
    electorate: electorate,
    resolveOfficeElection: resolveOfficeElection,
    recordOfficeBallot: recordOfficeBallot,
    assemblyQuorum: assemblyQuorum,
    speakerOptions: speakerOptions,
    speakerDue: speakerDue,
    speakerInProgress: speakerInProgress,
    beginSpeakerElection: beginSpeakerElection,
    chooseSpeakerStance: chooseSpeakerStance,
    finishSpeakerElection: finishSpeakerElection,
    vacateSpeakerForPresidency: vacateSpeakerForPresidency,
    resolvePresidentialElection: resolvePresidentialElection,
    electionEndpoint: electionEndpoint,
    chapterEnds: chapterEnds,
    endChapterIfDue: endChapterIfDue,
    buildReport: buildReport,
    route: route,
  });
}));
