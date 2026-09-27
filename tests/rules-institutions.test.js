const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');

// Unit tests of the institutions module (implementation plan, stage 2; technical reference 6.1–6.4,
// 7.1–7.5, 19.1). They load the source files directly and never start the game.
const rules = require(path.join(__dirname, '..', 'source', 'rules', 'polish_rules.js'));
const inst = require(path.join(__dirname, '..', 'source', 'rules', 'polish_institutions.js'));
const PARTIES = ['kpp', 'pps', 'npr', 'psl_wyzwolenie', 'psl_piast', 'pschd', 'zln', 'minorities_bloc', 'other'];
const NAMES = Object.fromEntries(PARTIES.map(id => [id, id.toUpperCase()]));
const sum = object => Object.values(object).reduce((a, b) => a + b, 0);

function state(seed = [1922, 11, 5, 444, 223]) {
  return rules.createFoundationState({ randomState: seed });
}
// A fixture S whose roll for a given id is below or above one half, found by trying seeds.
function stateWithRoll(rollId, wantBelowHalf) {
  for (let word = 0; word < 500; word++) {
    const S = state([1922, word, 5, 444, 223]);
    const probe = JSON.parse(JSON.stringify(S));
    const u = rules.roll(probe, rollId);
    if ((u < 0.5) === wantBelowHalf) return S;
  }
  throw new Error('no seed found');
}
function twoWayProfile(quorum = 148) {
  return {
    id: 'test:two_way', office: 'speaker', chamber: 'sejm', procedure: 'top_two_runoff', quorum,
    candidates: [{ id: 'cand_a', name: 'A', party: 'x' }, { id: 'cand_b', name: 'B', party: 'y' }],
    preferences: { x: ['cand_a'], y: ['cand_b'], z: [] },
    acting_holder: { id: 'marszalek_senior', name: 'the senior member' },
  };
}

test('Mandaty: remainder ties, small lists and a joint list give exactly 444 seats, deterministically', () => {
  const votes = { kpp: 1.5, pps: 20, npr: 4, psl_wyzwolenie: 12, psl_piast: 12, pschd: 9, zln: 21, minorities_bloc: 15, other: 5.5 };
  const joint = [{ id: 'test_list', name: 'Test list', members: ['psl_wyzwolenie', 'psl_piast'] }];
  const a = inst.allocateSeats({ parties: PARTIES, votes, total: 444, alliances: joint, party_names: NAMES });
  const b = inst.allocateSeats({ parties: PARTIES, votes, total: 444, alliances: joint, party_names: NAMES });
  assert.deepEqual(a, b);
  assert.equal(sum(a.party_seats), 444);
  const list = a.lists.find(row => row.id === 'test_list');
  assert.equal(list.vote_share, 24);
  assert.equal(list.multiplier, 1.10, 'the joint list gets the band of its summed votes');
  assert.equal(list.party_seats.psl_wyzwolenie, list.party_seats.psl_piast, 'equal votes, equal attribution');
  assert.equal(list.party_seats.psl_wyzwolenie + list.party_seats.psl_piast, list.seats);
  assert.deepEqual(a.lists.filter(row => row.anonymous).map(row => row.vote_share), [2, 2, 1.5], 'Inne as 2% lists plus a remainder');
  assert.equal(a.lists.findIndex(row => row.id === 'test_list'), 3, 'a joint list takes the place of its first member');
  // An exact remainder tie goes to the ascending stable ID.
  const tie = inst.allocateSeats({ parties: ['kpp', 'pps'], votes: { kpp: 50, pps: 50 }, total: 445, alliances: [], party_names: NAMES });
  assert.deepEqual(tie.party_seats, { kpp: 223, pps: 222 });
  // German thresholds and bans are not inherited: a small party still takes part (6.1).
  const small = inst.allocateSeats({ parties: PARTIES, votes: { ...votes, kpp: 0.5, other: 6.5 }, total: 444, alliances: [], party_names: NAMES });
  assert.ok(small.party_seats.kpp > 0);
});

test('the Senate is 111 seats by largest remainders of the Sejm shares, ties by party ID (6.4)', () => {
  const seats = { kpp: 23, pps: 61, npr: 24, psl_wyzwolenie: 59, psl_piast: 61, pschd: 33, zln: 59, minorities_bloc: 102, other: 22 };
  const senate = inst.senateFromSejm(seats, PARTIES, 444);
  assert.equal(sum(senate), 111);
  assert.deepEqual(senate, { kpp: 6, pps: 15, npr: 6, psl_wyzwolenie: 15, psl_piast: 15, pschd: 8, zln: 15, minorities_bloc: 26, other: 5 });
  assert.equal(inst.SENATE_METHOD, 'sejm_proxy_v1');
});

test('Zwykła większość: 90 for, 89 against and 30 abstaining pass without 223 votes for', () => {
  const ballot = inst.resolveBallot('ordinary_resolution', { yes: 90, no: 89, abstain: 30 });
  assert.equal(ballot.present, 209);
  assert.equal(ballot.result, 'passed');
  assert.equal(inst.resolveBallot('ordinary_resolution', { yes: 90, no: 90, abstain: 30 }).result, 'failed', 'a tie on a law fails, no lot');
  assert.equal(inst.resolveBallot('ordinary_resolution', { yes: 90, no: 50 }).result, 'no_quorum', '140 present is below 148');
});

test('Szczególna większość: self-dissolution with 222 present fails at 147 and passes at 148', () => {
  assert.equal(inst.resolveBallot('sejm_self_dissolution', { yes: 147, no: 75, present: 222 }).result, 'failed');
  assert.equal(inst.resolveBallot('sejm_self_dissolution', { yes: 148, no: 74, present: 222 }).result, 'passed');
  assert.equal(inst.resolveBallot('sejm_self_dissolution', { yes: 148, no: 73, present: 221 }).result, 'no_quorum');
  assert.throws(() => inst.resolveBallot('sejm_self_dissolution', { yes: 300, no: 200 }), /exceed/);
});

test('Senat: consent needs 3/5 of the 111 senators — 66 is not enough, 67 is', () => {
  assert.equal(inst.resolveBallot('senate_dissolution_consent', { yes: 66, no: 45 }).result, 'failed');
  assert.equal(inst.resolveBallot('senate_dissolution_consent', { yes: 67, no: 44 }).result, 'passed');
  assert.equal(inst.resolveBallot('senate_amendment_rejection', { yes: 110, no: 90, abstain: 0 }).result, 'passed', '110/200 is 11/20');
  assert.equal(inst.resolveBallot('senate_amendment_rejection', { yes: 109, no: 91, abstain: 0 }).result, 'failed');
});

test('Finał bez większości bezwzględnej: A 200, B 180, 60 abstentions and 4 invalid — A wins, no lot', () => {
  const S = state();
  const profile = twoWayProfile();
  const run = inst.resolveOfficeElection(S, 'test_final', profile, { x: 200, y: 180, z: 60 }, { invalid: 4 });
  assert.equal(run.present, 444);
  assert.equal(run.rounds[0].valid, 440, 'abstentions count, invalid ballots do not');
  assert.equal(run.status, 'elected');
  assert.equal(run.winner_id, 'cand_a');
  assert.equal(run.tie_break, null);
  assert.deepEqual(S.rng.rolls, {}, 'no roll');
});

test('Remis finalistów urzędu: a roll below 0.5 elects the first finalist by ID, 0.5 or more the second', () => {
  const profile = twoWayProfile();
  const below = stateWithRoll('test_tie:final_tie', true);
  const low = inst.resolveOfficeElection(below, 'test_tie', profile, { x: 200, y: 200, z: 44 });
  assert.equal(low.status, 'elected');
  assert.equal(low.winner_id, 'cand_a');
  assert.deepEqual(low.tie_break, { method: 'lot_50_50', finalist_ids: ['cand_a', 'cand_b'], roll_id: 'test_tie:final_tie', winner_id: 'cand_a' });
  assert.deepEqual(low.final_ballot.candidates.map(row => row.votes), [200, 200], 'votes unchanged');
  const above = stateWithRoll('test_tie:final_tie', false);
  const high = inst.resolveOfficeElection(above, 'test_tie', profile, { x: 200, y: 200, z: 44 });
  assert.equal(high.winner_id, 'cand_b');
  assert.ok(above.rng.rolls['test_tie:final_tie'] >= 0.5);
  // Exactly 0.5 goes to the second finalist.
  const exact = state();
  exact.rng.rolls['test_tie:final_tie'] = 0.5;
  assert.equal(inst.resolveOfficeElection(exact, 'test_tie', profile, { x: 200, y: 200, z: 44 }).winner_id, 'cand_b');
  // A repeated count reads the recorded roll: same winner.
  assert.equal(inst.resolveOfficeElection(below, 'test_tie', profile, { x: 200, y: 200, z: 44 }).winner_id, 'cand_a');
});

test('Granica losowania urzędu: no quorum, an invalid finalist, unequal votes or a tied law never use the lot', () => {
  const S = state();
  const noQuorum = inst.resolveOfficeElection(S, 'b1', twoWayProfile(148), { x: 70, y: 70 });
  assert.equal(noQuorum.status, 'no_election');
  assert.equal(noQuorum.reason, 'no_quorum');
  const invalid = twoWayProfile();
  invalid.candidates[1] = { id: '', name: '' };
  assert.throws(() => inst.resolveOfficeElection(S, 'b2', invalid, { x: 200, y: 200 }), /rejected before the vote/);
  assert.equal(inst.resolveOfficeElection(S, 'b3', twoWayProfile(), { x: 201, y: 200, z: 43 }).tie_break, null);
  assert.equal(inst.resolveBallot('ordinary_resolution', { yes: 100, no: 100, abstain: 10 }).result, 'failed');
  assert.deepEqual(S.rng.rolls, {});
});

test('Kworum i kandydatury: a profile with one valid candidate is a data error before the vote', () => {
  const S = state();
  const one = twoWayProfile();
  one.candidates = [one.candidates[0]];
  one.preferences = { x: ['cand_a'] };
  assert.deepEqual(inst.officeProfileProblems(one), ['the profile has fewer than two valid candidates']);
  assert.throws(() => inst.resolveOfficeElection(S, 'q1', one, { x: 444 }), /fewer than two valid candidates/);
  for (const kind of ['speaker', 'president_first', 'president_second']) {
    for (const decision of ['smiarowski', 'rataj', 'daszynski', 'nominate', 'none']) {
      if (kind === 'speaker' && (decision === 'nominate' || decision === 'none')) continue;
      if (kind !== 'speaker' && decision !== 'nominate' && decision !== 'none') continue;
      assert.deepEqual(inst.officeProfileProblems(inst.officeProfile(kind, decision, { quorum: 278 })), [], kind + ' ' + decision);
    }
  }
});

test('Bezpiecznik wyboru urzędu: an unresolved vote records no_election and names the acting holder', () => {
  const S = state();
  const run = inst.resolveOfficeElection(S, 's1', twoWayProfile(), { z: 444 });
  assert.equal(run.status, 'no_election');
  assert.equal(run.reason, 'no_votes_cast');
  assert.equal(run.acting_holder.id, 'marszalek_senior');
  assert.equal(run.winner_id, null);
});

test('the elimination count drops the weakest until a majority, at most one round per candidate', () => {
  const S = state();
  const profile = {
    id: 'test:elimination', office: 'president', chamber: 'national_assembly', procedure: 'elimination', quorum: 1,
    candidates: ['c1', 'c2', 'c3', 'c4'].map(id => ({ id, name: id.toUpperCase(), party: id })),
    preferences: { p1: ['c1'], p2: ['c2', 'c1'], p3: ['c3', 'c2'], p4: ['c4', 'c3', 'c2'] },
    acting_holder: { id: 'acting', name: 'Acting' },
  };
  const run = inst.resolveOfficeElection(S, 'e1', profile, { p1: 100, p2: 90, p3: 80, p4: 70 });
  assert.equal(run.status, 'elected');
  // 100/90/80/70: c4 drops out and its votes go to c3 (150); then c2 (90) drops out and its votes go
  // to c1 (190); the final between c1 and c3 is won by the larger vote.
  assert.equal(run.winner_id, 'c1');
  assert.deepEqual(run.rounds.map(round => round.eliminated), [['c4'], ['c2'], []]);
  assert.deepEqual(run.final_ballot.candidates.map(row => [row.candidate_id, row.votes]), [['c1', 190], ['c3', 150]]);
  assert.ok(run.rounds.length <= profile.candidates.length);
});

test('Data: announcement 1927-11-29, earliest day +78 is 1928-02-15, the vote is Sunday 1928-02-19 (t=74)', () => {
  const record = inst.scheduleElection({ kind: 'term_end', opened_at: '1922-11-28' });
  assert.equal(record.term_end, '1927-11-28');
  assert.equal(record.announced_at, '1927-11-29');
  assert.equal(record.earliest_vote, '1928-02-15');
  assert.equal(record.vote_date, '1928-02-19');
  assert.equal(inst.weekday(record.vote_date), 0);
  assert.equal(record.time, 74);
  assert.equal(record.validated, true);
  // An early election also needs a Sunday within 90 days of the dissolution; an empty interval is
  // a configuration error, never an unlawful election.
  const early = inst.scheduleElection({ kind: 'dissolution', dissolved_at: '1925-03-01', announced_at: '1925-03-02' });
  assert.equal(early.vote_date, '1925-05-24');
  assert.throws(() => inst.scheduleElection({ kind: 'dissolution', dissolved_at: '1925-03-01', announced_at: '1925-04-01' }), /no lawful Sunday/);
});

test('Granica: the 1922 result and a dissolution alone continue the chapter; the next lawful result ends it', () => {
  const Q = { S: state(), sejm_results: [] };
  const certified = (sequence, extra = {}) => ({ id: 'r' + sequence, sequence_after_opening: sequence, status: 'certified',
    total_seats: 444, legal_basis: { validated: true }, ballot_date: '1928-02-19', party_seats: { pps: 60 }, party_votes: { pps: 14 }, ...extra });
  assert.equal(inst.chapterEnds(Q), false, 'no election yet');
  Q.sejm_results.push(certified(1));
  assert.equal(inst.chapterEnds(Q), false, 'the 1922 result');
  Q.S.parliament.next_election = inst.scheduleElection({ kind: 'dissolution', dissolved_at: '1925-03-01', announced_at: '1925-03-02' });
  assert.equal(inst.chapterEnds(Q), false, 'a dissolution and an ordered election are not the end');
  Q.sejm_results.push(certified(2, { legal_basis: { validated: false } }));
  assert.equal(inst.chapterEnds(Q), false, 'an unvalidated basis');
  Q.sejm_results[1] = certified(2, { status: 'counting' });
  assert.equal(inst.chapterEnds(Q), false, 'not certified');
  Q.sejm_results[1] = certified(2);
  assert.equal(inst.chapterEnds(Q), true, 'the next lawful result');
});
