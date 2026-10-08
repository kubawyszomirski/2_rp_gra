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

test('Start i odwołanie: a starting adviser dismissed and brought back gets no opening bonus; the dismissal +5; the adviser cooldown is not reset', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  assert.equal(Q.puzak_appointed_once, 1, 'the three advisers of the opening are already marked');
  act(engine, 'daszynski', 'parliamentary_compromise');
  assert.equal(PolishRules.cooldownRemaining(Q, 'advisor'), 6);
  const opening = strengths(S);
  // Z — 0.76: the Committee has all three seats filled; Ziemięcki stands in for Pużak, marked as appointed before (a fixture),
  // so only Pużak's dismissal and return change the factions.
  Q.ziemiecki_appointed_once = 1;
  PolishParty.advisersChoose(Q, ['daszynski', 'perl', 'ziemiecki']);
  assert.equal(Q.puzak_advisor, 0);
  assert.equal(S.actors.pps.factions.centrum.dissent, 5);
  assert.deepEqual(strengths(S), opening, 'a dismissal is no departure of a group');
  assert.equal(PolishRules.cooldownRemaining(Q, 'advisor'), 6, 'the team change does not reset the adviser cooldown');
  free(Q); later(Q, 6);
  assert.equal(PolishRules.cooldownRemaining(Q, 'advisor'), 0);
  PolishParty.advisersChoose(Q, ['daszynski', 'perl', 'puzak']);
  assert.equal(Q.puzak_advisor, 1);
  assert.deepEqual(strengths(S), opening, 'no opening bonus the second time');
  assert.equal(S.actors.pps.factions.centrum.dissent, 5);
  assert.equal(PolishRules.cooldownRemaining(Q, 'advisor'), 0, 'the team change starts no adviser cooldown');
  assert.equal(PolishRules.cooldownRemaining(Q, 'party.advisers'), 6, 'the change of team has its own cooldown');
});

test('Pużak: dissents 8/20/40 and Party Discipline give 0/8/28, with no promise, conference or mediation needed', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  const f = S.actors.pps.factions;
  f.centrum.dissent = 8; f.lewica.dissent = 20; f.pilsudczycy.dissent = 40;
  PolishParty.writeMirrors(Q);
  const opening = strengths(S);
  assert.equal(PolishParty.advisorActionStatus(Q, 'puzak', 'party_discipline').available, true);
  act(engine, 'puzak', 'party_discipline');
  assert.deepEqual(dissents(Q.S), [0, 8, 28]);
  assert.deepEqual(strengths(Q.S), opening);
  assert.deepEqual([Q.time, Q.month_actions, Q.S.party_orgs.cash], [1, 0, 2], '0 T and 0 R');
  assert.equal(PolishRules.cooldownRemaining(Q, 'advisor'), 6);
  assert.deepEqual(Q.S.faction_cases.list || [], [], 'no case, conference or promise is created');
});

test('Brak resortu: Moraczewski in opposition, or with PPS holding only the Treasury, cannot run the works; a declined preview takes no cooldown', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  Q.perl_advisor = 0; Q.moraczewski_advisor = 1;
  const declined = () => {
    engine.goToScene('main');
    choose(engine, 'moraczewski');
    const works = choice(engine, 'moraczewski.public_works');
    assert.equal(works.canChoose, false);
    assert.match(String(works.subtitle), /Needs PPS in the cabinet with Labour/);
    choose(engine, 'root');
    assert.deepEqual([PolishRules.cooldownRemaining(Q, 'advisor'), Q.month_actions, Q.time], [0, 0, 1]);
    assert.ok(!Object.values(Q.S.projects).some(p => p.type === 'public_works'), 'no works are run');
  };
  declined();
  // PPS in the cabinet with the Treasury only; Labour, the executor of the works, is another party's.
  Q.S.cabinet.partner_ids.push('pps');
  Q.S.cabinet.portfolios.finance = 'pps';
  Q.S.cabinet.portfolios.labor = 'psl_wyzwolenie';
  declined();
});

test('Piłsudczycy in a formal coalition: Jaworowski moves the relation and the faction, Malinowski only the faction; Ziemięcki’s toleration is closed, his municipal action is not', () => {
  const coalition = adviser => {
    const engine = dendry.startGame();
    const Q = engine.state.qualities;
    Q.S.cabinet.partner_ids.push('pps');
    Q.S.cabinet.portfolios.labor = 'pps';
    Q.perl_advisor = 0; Q[`${adviser}_advisor`] = 1;
    return engine;
  };
  const jaworowski = coalition('jaworowski');
  const J = jaworowski.state.qualities;
  act(jaworowski, 'jaworowski', 'back_pilsudski');
  assert.equal(J.S.actors.relations.pilsudski, 68);
  strengths(J.S).forEach((v, i) => close(v, 100 * [50, 15, 40][i] / 105));
  assert.deepEqual(dissents(J.S), [3, 23, 5]);

  const malinowski = coalition('malinowski');
  const M = malinowski.state.qualities;
  act(malinowski, 'malinowski', 'organize_pilsudczyks');
  assert.equal(M.S.actors.relations.pilsudski, 60, 'no change of the relation with Piłsudski');
  strengths(M.S).forEach((v, i) => close(v, 100 * [50, 15, 43][i] / 108));
  assert.deepEqual(dissents(M.S), [0, 20, 0]);

  const ziemiecki = coalition('ziemiecki');
  const Z = ziemiecki.state.qualities;
  ziemiecki.goToScene('main');
  choose(ziemiecki, 'ziemiecki');
  const toleration = choice(ziemiecki, 'ziemiecki.conditional_toleration');
  assert.equal(toleration.canChoose, false);
  assert.match(String(toleration.subtitle), /external support of a cabinet with a pilsudski_aligned profile/);
  assert.equal(choice(ziemiecki, 'ziemiecki.municipal_socialism').canChoose, true);
  choose(ziemiecki, 'root');
  const cells = Z.S.society.cells.map(c => ({ city: c.settlement === 'major_city', pps: c.propensity.pps }));
  act(ziemiecki, 'ziemiecki', 'municipal_socialism');
  Z.S.society.cells.forEach((c, i) => {
    if (cells[i].city) assert.ok(c.propensity.pps > cells[i].pps, c.id);
    else assert.equal(c.propensity.pps, cells[i].pps, c.id);
  });
  assert.deepEqual(dissents(Z.S), [0, 20, 5]);
});

test('Efekty czasowe: Pużak (workers ×1.20) and later Perl (press ×1.25) multiply only the matching campaigns while active; no second reward and no negative share', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  S.scenario.inputs.dispute_1922 = false; // isolate the advisers from the dated dispute of 1922 (decision 1A of stage 7)
  S.party_orgs.cash = 10;
  PolishParty.writeMirrors(Q);
  const worker = S.society.cells.find(c => c.class_id === 'workers' && c.settlement === 'major_city' && c.identity_id === 'polish' && c.employment === 'employed');
  const clerk = S.society.cells.find(c => c.class_id === 'new_middle' && c.settlement === 'major_city' && c.identity_id === 'polish');
  // The gain of one press campaign in the large cities divided by the gain of 5.3 without adviser multipliers.
  const ratios = () => {
    PolishParty.syncMirrors(Q);
    const base = [worker, clerk].map(cell => {
      const copy = JSON.parse(JSON.stringify(cell));
      return PolishElectorate.campaignGain(copy, PolishParty.cellReach(S, copy, 'press'), Q.dissent || 0, 'workers_gains', Q.time) *
        (0.5 + 0.5 * PolishParty.pressEffective(S).credibility / 100) * PolishParty.strategyFactor(Q, 'workers_gains');
    });
    const shares = [worker.propensity.pps, clerk.propensity.pps];
    PolishParty.campaign(Q, 'press', 'workers_gains', 'major_cities');
    free(Q);
    return [worker, clerk].map((cell, i) => +((cell.propensity.pps - shares[i]) / base[i]).toFixed(9));
  };
  const before = JSON.stringify(S.society.cells.map(c => c.propensity));
  act(engine, 'puzak', 'mobilize_organization');
  assert.equal(JSON.stringify(S.society.cells.map(c => c.propensity)), before, 'Mobilize gains no votes by itself');
  close(worker.base_reach_pps, 31);
  assert.deepEqual(ratios(), [1.2, 1], 'Pużak: only the workers’ cells');
  later(Q, 6);
  act(engine, 'perl', 'direct_party_press');
  assert.deepEqual(ratios(), [1.25, 1.25], 'Pużak has expired; Perl: every press campaign');
  later(Q, 6);
  assert.deepEqual(ratios(), [1, 1], 'both have expired');
  close(worker.base_reach_pps, 31, 1e-9);
  assert.equal(S.advisors.effects.filter(e => e.kind === 'workers_campaign_multiplier').length, 1, 'one modifier, not renewed by campaigns');
  for (const cell of S.society.cells) {
    for (const party of S.society.parties) assert.ok(cell.propensity[party] >= 0, `${cell.id} ${party}`);
    close(S.society.parties.reduce((n, p) => n + cell.propensity[p], 0), 100);
  }
});

test('KPP i Lewica: Socialist Education halves the PPS→KPP outflow of the workers (4 → 2 pp); a flow from another party to the KPP stays; Lewica PPS is not the KPP', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  const S = Q.S;
  Q.perl_advisor = 0; Q.czapinski_advisor = 1;
  S.party_orgs.tur.level = 1; // a working TUR (fixture)
  PolishParty.writeMirrors(Q);
  const kpp = JSON.stringify(S.society.cells.map(c => c.propensity.kpp));
  const relation = S.actors.relations.kpp;
  const lewica = S.actors.pps.factions.lewica.strength;
  act(engine, 'czapinski', 'socialist_education');
  assert.equal(JSON.stringify(S.society.cells.map(c => c.propensity.kpp)), kpp, 'the action moves no voter to or from the KPP');
  assert.equal(S.actors.relations.kpp, relation);
  assert.ok(S.actors.pps.factions.lewica.strength > lewica);
  assert.deepEqual(Object.keys(S.actors.pps.factions), ['centrum', 'lewica', 'pilsudczycy'], 'no communist faction');
  // Disappointment (17.4) in cells whose only competitor is the KPP: 4 pp would leave PPS.
  const polishWorkers = S.society.cells.filter(c => c.class_id === 'workers' && c.identity_id === 'polish');
  const [worker, other] = polishWorkers;
  const clerk = S.society.cells.find(c => c.class_id === 'new_middle' && c.identity_id === 'polish');
  const set = (cell, shares) => { for (const p of S.society.parties) cell.propensity[p] = shares[p] || 0; };
  set(worker, { pps: 50, kpp: 50 });
  set(clerk, { pps: 50, kpp: 50 });
  PolishElectorate.settleDisappointment(S, Q.time, 4);
  close(worker.propensity.pps, 48);
  close(worker.propensity.kpp, 52);
  close(clerk.propensity.kpp, 54); // outside the workers' cells nothing is protected
  // Four months of worse conditions of the workers under a responsible NPR (5.6): NPR → KPP 2 pp.
  set(other, { npr: 50, kpp: 50 });
  const weights = {};
  for (const p of S.society.parties) weights[p] = 0;
  weights.npr = 1;
  for (let month = 0; month < 4; month++) {
    const conditions = { ...S.society.living_conditions_last };
    conditions.workers -= 5;
    PolishElectorate.settleLivingConditions(S, Q.time, conditions, weights, PolishEconomy.applyFlow);
  }
  close(other.propensity.npr, 48);
  close(other.propensity.kpp, 52); // the protection of PPS does not stop the KPP gaining from another party
});

test('Późni doradcy: in chapter 1, up to the coup or the election of 19 II 1928, Próchnik and Drobner cannot join; they are the cast of the continuation', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  for (const [year, month] of [[1922, 1], [1926, 5], [1928, 2]]) {
    Q.year = year; Q.month = month; Q.time = PolishRules.timeOf(year, month);
    for (const id of ['prochnik', 'drobner', 'dubois']) {
      assert.equal(PolishParty.ADVISERS[id].continuation, true, id);
      assert.equal(PolishParty.adviserInPool(Q, id), false, `${id} ${year}`);
      assert.match(PolishParty.advisersStatus(Q, ['daszynski', 'puzak', id]).reason, /not available/, id);
    }
    PolishParty.advisersView(Q);
    assert.deepEqual([Q.pl_adv_prochnik_can_add, Q.pl_adv_drobner_can_add], [0, 0]);
    assert.match(Q.pl_adv_prochnik_why, /continuation/);
  }
  const menu = engine.game.scenes['polish_party_advisers.menu'].options.map(o => o.id);
  for (const id of ['prochnik', 'drobner', 'dubois']) assert.ok(!menu.includes(`@toggle_${id}`), `${id} is not offered`);
  for (const id of ['prochnik', 'drobner']) assert.deepEqual(engine.game.scenes[id].options.map(o => o.id), ['@root'], `${id} has no action`);
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

test('Zmiana doradców osobno: with no dispute in the party the adviser card is in the pool and the unity card is not; the unity card changes no adviser', () => {
  const engine = dendry.startGame();
  const cards = deck(engine);
  assert.ok(cards.includes('polish_party_advisers'));
  assert.ok(!cards.includes('polish_party_unity'));
  const unity = Object.keys(engine.game.scenes).filter(id => id === 'polish_party_unity' || id.startsWith('polish_party_unity.'));
  for (const id of unity) {
    const scene = engine.game.scenes[id];
    assert.ok(!(scene.options || []).some(o => /advis|toggle/.test(o.id)), id);
    assert.ok(!/advisersChoose|_advisor\s*=/.test(JSON.stringify(scene.onArrival || [])), id);
  }
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
  assert.match(Q.pl_e3_preview, /6(\.0+)?% of the party’s base leaves/);
  assert.match(Q.pl_e3_preview, /2 MPs to a separate club; its voters go to the KPP\. No member of the Central Executive Committee leaves\./);
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

test('Zamrożeni posłowie: an adviser action that changes the faction strengths before or after the split leaves the division of the club and the MPs who leave', () => {
  const split = withAdviser => {
    const Q = game();
    const S = Q.S;
    Q.perl_advisor = 0; Q.zaremba_advisor = 1; Q.malinowski_advisor = 1;
    objects(Q, 'lewica', 65);
    const division = { ...ppsClub(S).faction_seats };
    if (withAdviser) PolishParty.advisorAction(Q, 'zaremba', 'class_campaign'); // Lewica +4 raw before the split
    assert.deepEqual({ ...ppsClub(S).faction_seats }, division);
    assert.equal(PolishParty.factionSplitDue(Q), true);
    const lewica = S.actors.pps.factions.lewica.strength;
    PolishParty.factionSplitRefuse(Q);
    const mps = S.faction_cases.manifests.at(-1).mps;
    const after = { ...ppsClub(S).faction_seats };
    PolishParty.advisorAction(Q, 'malinowski', 'organize_pilsudczyks'); // after the split
    assert.deepEqual({ ...ppsClub(S).faction_seats }, after);
    return { mps, after, lewica };
  };
  const plain = split(false);
  const moved = split(true);
  assert.ok(moved.lewica > plain.lewica, 'the adviser did change the strength');
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
