const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Factions, advisers and departures of stage 5 (implementation plan, stage 5, part 5d; technical reference
// 9.5, 10.1–10.5, 10.9; card catalogue 6.3–6.6, 9.10): the adviser team and the adviser actions, the unity
// card, the faction cases and the card E3, the split and the purge (M16). Adviser actions go through the real
// engine, which records the shared adviser cooldown; the other steps call the rules on the state of a new game.
const { choose } = dendry;
let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
// The recorded cause of a test reaction: the faction objects to the present direction (decision 3A).
const DIRECTION = { kind: 'strategy', field: 'direction', value: 'class_independence', objection: 'parliamentary_socialism' };

function game() {
  return dendry.startGame().state.qualities;
}
// The month's action was committed by the rules; a test that acts again in the same month frees it.
function free(Q) {
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  Q.month_actions = 0;
}
// Moves the calendar without settling the months in between (the rules read only the date).
function later(Q, months) {
  const t = Q.time + months;
  Q.time = t; Q.year = 1922 + Math.floor((t - 1) / 12); Q.month = ((t - 1) % 12) + 1;
}
// A reaction of a faction to a fixture cause with a concrete demand, up to the given dissent.
function objects(Q, faction, dissent, reverse = DIRECTION) {
  const f = Q.S.actors.pps.factions[faction];
  assert.ok(dissent > f.dissent, 'a fixture reaction raises the dissent');
  PolishGovernment.factionReaction(Q, faction, { dissent: dissent - f.dissent },
    { id: `fixture:${faction}:${dissent}:t${Q.time}`, kind: 'stance', reverse });
  PolishParty.writeMirrors(Q);
}
// One adviser action from the main page: the pinned adviser card, the action, and back to main.
function act(engine, adviser, action, option) {
  engine.goToScene('main');
  choose(engine, adviser);
  choose(engine, `${adviser}.${action}`);
  if (option) choose(engine, `${adviser}.${option}`);
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'main');
}
function choice(engine, id) {
  return (engine.getCurrentChoices() || []).find(item => item.id === id);
}
function deck(engine) {
  return (engine._compileChoices(engine.game.scenes['main.party']) || []).filter(c => c.canChoose !== false).map(c => c.id);
}
const strengths = S => ['centrum', 'lewica', 'pilsudczycy'].map(id => S.actors.pps.factions[id].strength);
const dissents = S => ['centrum', 'lewica', 'pilsudczycy'].map(id => S.actors.pps.factions[id].dissent);
const ppsClub = S => S.parliament.clubs.find(c => c.id === 'pps');
const seatTotal = S => S.parliament.clubs.reduce((n, c) => n + c.seats, 0);

// ---- Advisers (10.4) ----------------------------------------------------------------------------------

test('Nowe powołanie: factions 50/15/35 and a first new Piłsudczyk with dissent 20 give 47.619/14.286/38.095 and dissent 15; a re-appointment gives nothing', () => {
  const Q = game();
  const S = Q.S;
  S.actors.pps.factions.pilsudczycy.dissent = 20;
  PolishParty.writeMirrors(Q);
  assert.deepEqual(strengths(S), [50, 15, 35]);
  PolishParty.advisersChoose(Q, ['daszynski', 'puzak', 'malinowski']);
  assert.deepEqual(strengths(S).map(v => +v.toFixed(3)), [47.619, 14.286, 38.095]);
  close(S.actors.pps.factions.pilsudczycy.strength, 100 * 40 / 105);
  assert.equal(S.actors.pps.factions.pilsudczycy.dissent, 15);
  assert.equal(S.actors.pps.factions.centrum.dissent, 5, 'Perl leaves voluntarily: Centrum +5, no change of strength');
  const after = strengths(S);
  // Six months later Malinowski leaves; six more and he returns: no second +5 and no second −5.
  free(Q); later(Q, 6);
  PolishParty.advisersChoose(Q, ['daszynski', 'puzak', 'perl']);
  assert.equal(S.actors.pps.factions.pilsudczycy.dissent, 20, 'his dismissal +5');
  free(Q); later(Q, 6);
  PolishParty.advisersChoose(Q, ['daszynski', 'puzak', 'malinowski']);
  assert.deepEqual(strengths(S), after, 'no second raw +5');
  assert.equal(S.actors.pps.factions.pilsudczycy.dissent, 20, 'no second −5');
});

// Z — 1.42 (decisions K1A, K2A of 28 XI 2026): the card that fills three seats by currents replaced the composition card and the actions;
// the name of this test of 21.1 stays, its body checks the new rule.
test('Start i odwołanie (Z — 1.42): a current that gains a seat grows stronger (+2) and calmer (−2), one that loses a seat is displeased (+3)', () => {
  const Q = game(), f = Q.S.actors.pps.factions;
  const ckw = (Q, seats) => {
    if (Q.time < PolishRules.timeOf(1923, 1)) { Q.time = PolishRules.timeOf(1923, 1); Q.year = 1923; Q.month = 1; }
    delete Q.S.cooldowns['party.ckw'];
    if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
    Q.month_actions = 0;
    PolishParty.ckwReset(Q);
    for (const f of seats) PolishParty.ckwPick(Q, f);
    return PolishParty.ckwConfirm(Q, false);
  };
  for (const id of ['centrum', 'lewica', 'pilsudczycy']) f[id].dissent = 20;
  const raw = { ...f.lewica };
  ckw(Q, ['lewica', 'centrum', 'centrum']);
  assert.deepEqual([f.lewica.dissent, f.centrum.dissent, f.pilsudczycy.dissent], [18, 23, 20]);
  assert.ok(f.lewica.strength > raw.strength, 'the Left grows stronger');
  assert.deepEqual(Q.S.actors.pps.ckw.seats, ['centrum', 'centrum', 'lewica']);
  ckw(Q, ['pilsudczycy', 'pilsudczycy', 'pilsudczycy']);
  assert.deepEqual([f.lewica.dissent, f.centrum.dissent, f.pilsudczycy.dissent], [21, 29, 14], 'two seats lost by the Centre, one by the Left');
});

// Z — 1.42 (decisions K1A, K2A of 28 XI 2026): the card that fills three seats by currents replaced the composition card and the actions;
// the name of this test of 21.1 stays, its body checks the new rule.
test('Pużak (Z — 1.42): Party Discipline is gone with the actions of the Committee; his portrait offers only the way back', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  assert.equal(PolishParty.advisorActionStatus(Q, 'puzak', 'party_discipline').available, false);
  engine.goToScene('puzak');
  assert.deepEqual((engine.getCurrentChoices() || []).map(c => c.id), ['root']);
});

// Z — 1.42 (decisions K1A, K2A of 28 XI 2026): the card that fills three seats by currents replaced the composition card and the actions;
// the name of this test of 21.1 stays, its body checks the new rule.
test('Brak resortu (Z — 1.42): no member of the Committee runs a ministry programme; the ministry cards need their ministry as before', () => {
  const Q = game();
  assert.equal(PolishProjects.cardAvailable(Q, 'public_works'), false, 'in opposition no card of Labour');
  Q.moraczewski_advisor = 1;
  assert.equal(PolishProjects.cardAvailable(Q, 'public_works'), false, 'a portrait opens nothing');
});

// Z — 1.42 (decisions K1A, K2A of 28 XI 2026): the card that fills three seats by currents replaced the composition card and the actions;
// the name of this test of 21.1 stays, its body checks the new rule.
test('Piłsudczycy (Z — 1.42): with three seats their members — Jaworowski, Moraczewski and Ziemięcki — are in the Party tab', () => {
  const Q = game();
  const ckw = (Q, seats) => {
    if (Q.time < PolishRules.timeOf(1923, 1)) { Q.time = PolishRules.timeOf(1923, 1); Q.year = 1923; Q.month = 1; }
    delete Q.S.cooldowns['party.ckw'];
    if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
    Q.month_actions = 0;
    PolishParty.ckwReset(Q);
    for (const f of seats) PolishParty.ckwPick(Q, f);
    return PolishParty.ckwConfirm(Q, false);
  };
  ckw(Q, ['pilsudczycy', 'pilsudczycy', 'pilsudczycy']);
  assert.deepEqual(['daszynski', 'puzak', 'perl', 'jaworowski', 'moraczewski', 'ziemiecki', 'malinowski'].map(id => Q[id + '_advisor']), [0, 0, 0, 1, 1, 1, 0]);
  assert.match(PolishParty.ckwTabView(Q), /^<span class="pl-ckw-member"><strong>Rajmund Jaworowski<\/strong> — The Piłsudczycy\./);
  ckw(Q, ['lewica', 'centrum', 'centrum']);
  assert.deepEqual([...PolishParty.ckwTabView(Q).matchAll(/<strong>([^<]+)<\/strong> — ([^.]+)\./g)].map(m => m[1] + ': ' + m[2]),
    ['Ignacy Daszyński: The Centre of PPS', 'Kazimierz Pużak: The Centre of PPS', 'Zygmunt Zaremba: The Left of PPS'], 'the Party tab, in the order of the currents');
});

// Z — 1.42 (decisions K1A, K2A of 28 XI 2026): the card that fills three seats by currents replaced the composition card and the actions;
// the name of this test of 21.1 stays, its body checks the new rule.
test('Efekty czasowe (Z — 1.42): the defence of the constitution adds +5 to democracy at the next settlement and, for six months, angers the Centre at an authoritarian project', () => {
  const Q = game(), S = Q.S;
  PolishParty.defenceChoose(Q);
  assert.deepEqual(S.actors.pps.pending_effects.at(-1), { id: 'party.constitution_defence:t' + Q.time, system: 'democracy', stage: 7, value: 5 });
  const effect = S.advisors.effects.find(e => e.kind === 'authoritarian_support_penalty');
  assert.deepEqual([effect.value, effect.expires_at - effect.starts_at], [5, 6]);
  assert.ok(S.unions.rail.alignment.legal_institutions >= 55);
});

// Z — 1.42 (decisions K1A, K2A of 28 XI 2026): the card that fills three seats by currents replaced the composition card and the actions;
// the name of this test of 21.1 stays, its body checks the new rule.
test('KPP i Lewica (Z — 1.42): the Left holds at most two seats, Zaremba and Czapiński; no member of the Committee shields the workers from the KPP any more', () => {
  const Q = game();
  assert.equal(PolishParty.advisorActionStatus(Q, 'czapinski', 'socialist_education').available, false);
  const ckw = (Q, seats) => {
    if (Q.time < PolishRules.timeOf(1923, 1)) { Q.time = PolishRules.timeOf(1923, 1); Q.year = 1923; Q.month = 1; }
    delete Q.S.cooldowns['party.ckw'];
    if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
    Q.month_actions = 0;
    PolishParty.ckwReset(Q);
    for (const f of seats) PolishParty.ckwPick(Q, f);
    return PolishParty.ckwConfirm(Q, false);
  };
  assert.throws(() => ckw(Q, ['lewica', 'lewica', 'lewica']), /The Left of PPS has no more candidates/);
  ckw(Q, ['lewica', 'lewica', 'pilsudczycy']);
  assert.deepEqual([Q.zaremba_advisor, Q.czapinski_advisor, Q.jaworowski_advisor, Q.daszynski_advisor], [1, 1, 1, 0]);
});

// Z — 1.42 (decisions K1A, K2A of 28 XI 2026): the card that fills three seats by currents replaced the composition card and the actions;
// the name of this test of 21.1 stays, its body checks the new rule.
test('Późni doradcy (Z — 1.42): Próchnik, Drobner and Dubois are never candidates in chapter 1; Perl gives way to Niedziałkowski after III 1927', () => {
  const Q = game();
  for (const id of ['prochnik', 'drobner', 'dubois']) assert.ok(!Object.values(PolishParty.CKW_CANDIDATES).flat().includes(id), id);
  Q.time = PolishRules.timeOf(1927, 4);
  PolishParty.ckwPortraits(Q);
  assert.deepEqual([Q.perl_advisor, Q.niedzialkowski_advisor, Q.daszynski_advisor, Q.puzak_advisor], [0, 1, 1, 1]);
  Q.daszynski_left_adviser_pool = 1;
  PolishParty.ckwPortraits(Q);
  assert.deepEqual([Q.daszynski_advisor, Q.puzak_advisor, Q.niedzialkowski_advisor, Q.arciszewski_advisor], [0, 1, 1, 1], 'a departure leaves no empty seat');
});

// ---- The unity card (10.5, 10.9; cards 6.3–6.4) ---------------------------------------------------------

test('Odroczenie sprawy frakcji: a demand at dissent 50 is postponed; at 62 no E3 for three months, then E3; the postponement leaves the dissent', () => {
  const Q = game();
  const S = Q.S;
  objects(Q, 'lewica', 50);
  const t = Q.time;
  assert.equal(PolishParty.unityStatus(Q, 'postpone', 'lewica').available, true);
  PolishParty.unityChoose(Q, 'postpone', 'lewica');
  assert.equal(S.actors.pps.factions.lewica.dissent, 50, 'the postponement alone changes no dissent');
  assert.equal(Q.month_actions, 1, '1 T');
  free(Q);
  objects(Q, 'lewica', 62);
  for (const month of [0, 1, 2]) {
    Q.time = t + month;
    assert.equal(PolishParty.factionSplitDue(Q), false, `month ${month} after the postponement`);
  }
  Q.time = t + 3;
  assert.equal(PolishParty.factionSplitDue(Q), true);
  const c = S.faction_cases.list.find(x => x.faction === 'lewica');
  assert.equal(S.faction_cases.due_case_id, c.id);
  assert.equal(S.faction_cases.list.length, 1, 'the same case returns, no second one');
  assert.match(PolishParty.unityStatus(Q, 'postpone', 'lewica').reason, /postponed once/);
});

test('Dwa warianty kompromisu: a concession to Lewica is −8 dissent for 1 T, 1 R and 3 months; the common line on the KPP is 50 → 65 in each faction for 1 T, 0 R and 6 months', () => {
  const Q = game();
  const S = Q.S;
  objects(Q, 'lewica', 40);
  PolishParty.unityChoose(Q, 'concession', 'lewica');
  assert.equal(S.actors.pps.factions.lewica.dissent, 32);
  assert.deepEqual([Q.month_actions, S.party_orgs.cash, PolishRules.cooldownRemaining(Q, 'party.faction_conference.lewica')], [1, 1, 3]);
  free(Q);
  assert.match(PolishParty.unityStatus(Q, 'concession', 'lewica').reason, /Available again in 3 months/);
  objects(Q, 'pilsudczycy', 30);
  assert.equal(PolishParty.unityStatus(Q, 'concession', 'pilsudczycy').available, true, 'another faction has its own cooldown');

  const R = game();
  PolishGovernment.kppContact(R);
  free(R);
  const cash = R.S.party_orgs.cash;
  PolishParty.unityChoose(R, 'kpp_line');
  assert.deepEqual(Object.values(R.S.actors.communist_cooperation.pps_internal_acceptance), [65, 65, 65]);
  assert.deepEqual([R.month_actions, R.S.party_orgs.cash, PolishRules.cooldownRemaining(R, 'party.unity.kpp_line')], [1, cash, 6]);
});

test('Dostęp karty Jedność: with every dissent below 30 and the KPP channel closed the card is not in the pool; with one faction at 30 it is', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  assert.ok(dissents(Q.S).every(d => d < 30));
  assert.equal(PolishParty.unityAvailable(Q), false);
  assert.ok(!deck(engine).includes('polish_party_unity'));
  objects(Q, 'pilsudczycy', 30);
  assert.equal(PolishParty.unityAvailable(Q), true);
  assert.ok(deck(engine).includes('polish_party_unity'));

  const other = dendry.startGame();
  const R = other.state.qualities;
  PolishGovernment.kppContact(R);
  assert.ok(deck(other).includes('polish_party_unity'), 'an open channel to the KPP is enough');
});

// Z — 1.42 (decisions K1A, K2A of 28 XI 2026): the card that fills three seats by currents replaced the composition card and the actions;
// the name of this test of 21.1 stays, its body checks the new rule.
test('Zmiana doradców osobno (Z — 1.42): the card of the Committee and the card of unity are separate; the card of the Committee comes from 1923', () => {
  const Q = game();
  assert.equal(PolishParty.ckwAvailable(Q), false, 'not in 1922');
  later(Q, 12);
  assert.equal(PolishParty.ckwAvailable(Q), true);
  PolishParty.ckwConfirm(Q, true);
  assert.deepEqual(Q.S.actors.pps.ckw.seats, ['centrum', 'centrum', 'centrum'], 'the unity card changes no seat, and the Committee no unity');
});

test('Kompromis w PPS: the compromise on the cooperation with the communists gives 65 in each faction; a later breach of its rules takes 15 (50), once per action', () => {
  const Q = game();
  const S = Q.S;
  const acceptance = () => Object.values(S.actors.communist_cooperation.pps_internal_acceptance);
  PolishGovernment.kppContact(Q);
  free(Q);
  PolishParty.unityChoose(Q, 'kpp_line');
  assert.deepEqual(acceptance(), [65, 65, 65]);
  close(PolishParty.internalAcceptance(S), 65);
  // A joint action agreed and then broken; the executed actions come with stage 6.
  free(Q); Q.time += 1;
  PolishGovernment.changeRelation(Q, 'kpp', 30 - S.actors.relations.kpp, 'fixture');
  S.actors.communist_cooperation.demands = [{ id: 'demo-fixture', kind: 'demonstration', level: 'broad', status: 'open', name: 'a fixture demonstration' }];
  PolishParty.kppStep(Q, 'trial');
  PolishParty.resolveTrial(Q, 'demo-fixture', 'breach');
  assert.deepEqual(acceptance(), [50, 50, 50]);
  PolishParty.resolveTrial(Q, 'demo-fixture', 'breach');
  assert.deepEqual(acceptance(), [50, 50, 50], 'the same action is not counted twice');
  assert.equal(S.actors.relations.kpp, 30, 'a breach is not a failed action');
});

// ---- Faction cases, the card E3, the split and the purge (10.2, 10.9; M16) --------------------------------

test('Rozłam E3: Lewica (strength 15, dissent 65, 5 MPs) refused: 6% of the base leaves to the KPP, PPS ×0.94, 2 MPs, dissent 45, strengths 53.2/9.6/37.2', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  objects(Q, 'lewica', 65);
  assert.deepEqual([ppsClub(S).seats, ppsClub(S).faction_seats.lewica, S.actors.pps.factions.lewica.strength], [35, 5, 15]);
  const votes = PolishElectorate.votes(S);
  const seats = seatTotal(S);
  engine.goToScene('post_event');
  assert.equal(engine.state.sceneId, 'polish_event_faction_split');
  // Z — 1.04 (decision 3A of the event audit): the preview in words, with one number — the deputies.
  assert.equal(Q.pl_e3_preview, 'part of the party leaves with the faction: 2 deputies form a separate club, and its voters go to the KPP.');
  choose(engine, 'polish_event_faction_split.refuse');
  const manifest = S.faction_cases.manifests.at(-1);
  close(manifest.removed_share, 0.06);
  assert.deepEqual([manifest.recipient, manifest.mps, manifest.advisor_ids.length], ['kpp', 2, 0]);
  const after = PolishElectorate.votes(S);
  close(after.pps, votes.pps * 0.94, 1e-12);
  close(after.kpp, votes.kpp + 0.06 * votes.pps, 1e-12);
  assert.equal(S.actors.pps.factions.lewica.dissent, 45);
  assert.deepEqual(strengths(S).map(v => +v.toFixed(1)), [53.2, 9.6, 37.2]);
  close(S.party_orgs.apparatus.member_index, 94);
  assert.deepEqual([ppsClub(S).seats, ppsClub(S).faction_seats.lewica], [33, 3]);
  assert.equal(S.parliament.clubs.find(c => c.id === 'pps_split_lewica').seats, 2);
  assert.equal(seatTotal(S), seats, 'no mandate is destroyed');
  assert.deepEqual([Q.daszynski_advisor, Q.puzak_advisor, Q.perl_advisor], [1, 1, 1], 'the default manifest removes no adviser');
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'main');
  assert.deepEqual([Q.time, Q.month_actions], [1, 0], 'E3 costs no month');
  assert.equal(Q.lewica_split, 0, 'the inherited split scene did not run');
});

// Z — 1.42: a new composition of the Committee instead of the former actions of its members.
test('Zamrożeni posłowie: a new composition of the Committee that changes the faction strengths before or after the split leaves the division of the club and the MPs who leave', () => {
  const ckw = (Q, seats) => {
    if (Q.time < PolishRules.timeOf(1923, 1)) { Q.time = PolishRules.timeOf(1923, 1); Q.year = 1923; Q.month = 1; }
    delete Q.S.cooldowns['party.ckw'];
    if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
    Q.month_actions = 0;
    PolishParty.ckwReset(Q);
    for (const f of seats) PolishParty.ckwPick(Q, f);
    return PolishParty.ckwConfirm(Q, false);
  };
  const split = withAdviser => {
    const Q = game();
    const S = Q.S;
    objects(Q, 'lewica', 65);
    const division = { ...ppsClub(S).faction_seats };
    if (withAdviser) ckw(Q, ['lewica', 'lewica', 'centrum']); // Lewica +4 raw before the split
    assert.deepEqual({ ...ppsClub(S).faction_seats }, division);
    assert.equal(PolishParty.factionSplitDue(Q), true);
    const lewica = S.actors.pps.factions.lewica.strength;
    PolishParty.factionSplitRefuse(Q);
    const mps = S.faction_cases.manifests.at(-1).mps;
    const after = { ...ppsClub(S).faction_seats };
    if (withAdviser) ckw(Q, ['pilsudczycy', 'pilsudczycy', 'centrum']); // after the split
    assert.deepEqual({ ...ppsClub(S).faction_seats }, after);
    return { mps, after, lewica };
  };
  const plain = split(false);
  const moved = split(true);
  assert.ok(moved.lewica > plain.lewica, 'the new Committee did change the strength');
  assert.deepEqual([plain.mps, moved.mps], [2, 2]);
  assert.deepEqual(moved.after, plain.after);
});

test('Rozłam i czystka: a purge of Lewica after its split works on the state after the split; nobody leaves twice', () => {
  const Q = game();
  const S = Q.S;
  objects(Q, 'lewica', 65);
  assert.equal(PolishParty.factionSplitDue(Q), true);
  PolishParty.factionSplitRefuse(Q);
  const state = { strength: S.actors.pps.factions.lewica.strength, index: S.party_orgs.apparatus.member_index, pps: PolishElectorate.votes(S).pps };
  assert.deepEqual([ppsClub(S).faction_seats.lewica, S.actors.pps.factions.lewica.dissent], [3, 45]);
  assert.equal(PolishParty.unityStatus(Q, 'expel', 'lewica').available, true);
  PolishParty.unityChoose(Q, 'expel', 'lewica');
  const manifest = S.faction_cases.manifests.at(-1);
  close(manifest.removed_share, 0.25 * state.strength / 100);
  close(S.party_orgs.apparatus.member_index, state.index * (1 - manifest.removed_share));
  close(PolishElectorate.votes(S).pps, state.pps * (1 - manifest.removed_share), 1e-12);
  assert.equal(manifest.mps, 1, 'round(0.25 × 3) of the MPs still in the club');
  assert.deepEqual([ppsClub(S).seats, ppsClub(S).faction_seats.lewica], [32, 2]);
  assert.equal(S.parliament.clubs.find(c => c.id === 'pps_split_lewica').seats, 3);
  assert.equal(S.parliament.transfers.reduce((n, x) => n + x.seats, 0), 3, 'the split 2 and the purge 1: nobody twice');
  assert.equal(S.actors.pps.factions.lewica.dissent, 30);
  assert.equal(S.faction_cases.list[0].status, 'split', 'the purge does not reopen the closed case');
  assert.equal(S.faction_cases.manifests.length, 2, 'one record for each departure');
});

test('Zamrożony wynik: a poll, a split and a change of cabinet after the election leave the election history; the transfers change only the present clubs', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.year = 1922; Q.month = 11; Q.time = 11;
  dendry.setClassRows(Q, { pps: 35, psl_wyzwolenie: 30, minorities_bloc: 35 });
  engine._runActions(engine.game.scenes.polish_opening_state.onArrival);
  engine.goToScene('post_event');
  choose(engine, 'sejm_election.calculate');
  dendry.formCabinet(engine, { configuration: 'left_minority', mode: 'member', minorities: true });
  for (let i = 0; i < 40 && engine.state.sceneId !== 'main'; i++) {
    const all = engine.getCurrentChoices() || [];
    engine.choose(all.indexOf(all.filter(c => c.canChoose !== false)[0]));
  }
  const S = Q.S;
  assert.ok(S.cabinet.partner_ids.includes('pps'));
  const club = ppsClub(S);
  assert.ok(club.faction_seats, 'the new club was divided among the factions on the day of the result');
  const results = dendry.clone(Q.sejm_results);
  const elected = dendry.clone(Q.sejm_parliament);
  const seats = seatTotal(S);
  const lewicaSeats = club.faction_seats.lewica;
  const poll = PolishElectorate.poll(S);
  objects(Q, 'lewica', 65);
  engine.goToScene('post_event');
  assert.equal(engine.state.sceneId, 'polish_event_faction_split');
  choose(engine, 'polish_event_faction_split.refuse');
  choose(engine, 'root');
  assert.ok(PolishElectorate.poll(S).pps < poll.pps, 'the poll follows the split');
  const mps = Math.round(0.40 * lewicaSeats);
  assert.equal(ppsClub(S).seats, results[0].party_seats.pps - mps);
  // The change of cabinet: PPS leaves the government.
  PolishGovernment.withdrawSupport(Q, 'ordinary');
  assert.ok(!S.cabinet.partner_ids.includes('pps'));
  assert.deepEqual(Q.sejm_results, results, 'the election history is not rewritten');
  assert.deepEqual(Q.sejm_parliament, elected);
  assert.equal(seatTotal(S), seats, 'the transfers keep every mandate');
  assert.deepEqual(S.parliament.transfers.map(x => [x.from, x.to, x.seats]), [['pps', 'pps_split_lewica', mps]]);
});

test('Jedna karta E3: Lewica at 65: case A is closed, then case B with a new demand; one definition party.faction_split; A does not return, B has its own instance', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  const definitions = Object.keys(PolishRules.EVENT_DEFINITIONS)
    .filter(id => PolishRules.EVENT_DEFINITIONS[id].definition_id === 'party.faction_split');
  assert.deepEqual(definitions, ['polish_event_faction_split']);
  objects(Q, 'lewica', 65);
  engine.goToScene('post_event');
  assert.equal(engine.state.sceneId, 'polish_event_faction_split');
  const a = S.faction_cases.due_case_id;
  assert.equal(S.events.active.instance_key, `polish_event_faction_split:${a}`);
  choose(engine, 'polish_event_faction_split.accept');
  choose(engine, 'root');
  assert.equal(engine.state.sceneId, 'main', 'a met demand leaves no live cause: no second card');
  assert.equal(S.actors.pps.strategy.direction, 'class_independence', 'accepting really changes the line');
  assert.equal(S.actors.pps.factions.lewica.dissent, 60);
  // A new cause with another demand: Lewica now objects to the main opponent.
  objects(Q, 'lewica', 65, { kind: 'strategy', field: 'main_opponent', value: 'capital_land', objection: 'nationalist_right' });
  engine.goToScene('post_event');
  assert.equal(engine.state.sceneId, 'polish_event_faction_split');
  const b = S.faction_cases.due_case_id;
  assert.notEqual(b, a);
  assert.equal(S.events.active.instance_key, `polish_event_faction_split:${b}`);
  assert.ok(Object.keys(S.events.resolved).includes(`polish_event_faction_split:${a}`));
  assert.equal(S.faction_cases.list.find(c => c.id === a).status, 'accepted');
  assert.match(Q.pl_e3_demand, /main opponent|Main Opponent/i);
  choose(engine, 'polish_event_faction_split.refuse');
  choose(engine, 'root');
  assert.deepEqual(S.faction_cases.list.map(c => c.status), ['accepted', 'split']);
});

test('Czystka: faction 20, dissent 60, PPS 10%, membership 100: strength ≈15.79, dissent 45, PPS 9.5%, index 95; the MPs move without destroying mandates', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  dendry.setClassRows(Q, { zln: 30, pschd: 15, psl_piast: 30, pps: 10, other: 15 });
  const S = Q.S;
  close(PolishElectorate.votes(S).pps, 0.10, 1e-9);
  const f = S.actors.pps.factions;
  f.centrum.strength = 45; f.lewica.strength = 20; f.pilsudczycy.strength = 35;
  PolishParty.writeMirrors(Q);
  assert.match(PolishParty.unityStatus(Q, 'expel', 'lewica').reason, /Needs dissent of 30 or more/);
  objects(Q, 'lewica', 60);
  assert.equal(PolishParty.unityStatus(Q, 'expel', 'lewica').available, true, 'the gate: dissent 60 ≥ max(30, the party’s dissent)');
  const seats = seatTotal(S);
  PolishParty.unityChoose(Q, 'expel', 'lewica');
  close(f.lewica.strength, 100 * 15 / 95);
  assert.equal(+f.lewica.strength.toFixed(2), 15.79);
  assert.equal(f.lewica.dissent, 45);
  close(PolishElectorate.votes(S).pps, 0.095, 1e-12);
  close(S.party_orgs.apparatus.member_index, 95);
  assert.deepEqual([ppsClub(S).seats, S.parliament.clubs.find(c => c.id === 'pps_split_lewica').seats], [34, 1]);
  assert.equal(seatTotal(S), seats, 'no mandate is destroyed');
  assert.deepEqual([Q.month_actions, S.party_orgs.cash, PolishRules.cooldownRemaining(Q, 'party.faction_expulsion')], [1, 1, 12]);
});

// ---- A real break with a cabinet (9.3; stage 5) ------------------------------------------------------------

test('withdraw: the break goes through the one hook of faction reactions, once; the test profile is empty and changes no faction (P)', () => {
  const Q = game();
  const S = Q.S;
  assert.deepEqual(Object.keys(PolishGovernment.WITHDRAW_REACTIONS), []);
  const factions = JSON.stringify(S.actors.pps.factions);
  const cabinet = S.cabinet.id;
  PolishGovernment.withdrawSupport(Q, 'ordinary');
  const hooks = S.history.reasons.filter(r => r.kind === 'withdraw_reactions');
  assert.deepEqual(hooks.map(r => [r.cabinet_id, r.mode, r.reactions]), [[cabinet, 'ordinary', 0]]);
  assert.equal(JSON.stringify(S.actors.pps.factions), factions);
});
