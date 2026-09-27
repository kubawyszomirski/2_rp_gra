const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const dendry = require('./helpers/dendry');

// Rules of the electorate of stage 5 (implementation plan, stage 5, decision 1A; technical reference
// 5.1–5.4, 5.6, 17.4): disjoint cells, the calibrated opening, the poll and the votes, employment, the
// structural trend, campaigns, transfers and the results of policy for the cells.
let errors = [];
beforeEach(() => { errors = dendry.watchEngineErrors(); });
afterEach(() => assert.deepEqual(errors, [], 'Dendry must not swallow script or condition errors'));

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
const massOf = cells => cells.reduce((n, c) => n + c.mass, 0);

function game() {
  return dendry.startGame().state.qualities;
}

test('decision 1A: 54 disjoint cells reproduce the national result of the opening exactly; the class rows become mirrors', () => {
  const Q = game();
  const S = Q.S;
  assert.equal(S.society.cells.length, 54);
  assert.equal(S.society.seed_method, 'calibrated');
  close(massOf(S.society.cells), 1);
  const votes = PolishElectorate.votes(S);
  const expected = {kpp: 6.005, pps: 13.287, npr: 6.330, psl_wyzwolenie: 12.751, psl_piast: 13.145, pschd: 6.589, zln: 11.848,
    minorities_bloc: 20.451, other: 9.594};
  for (const [party, value] of Object.entries(expected)) close(100 * votes[party], value, 0.001);
  // Polish cells hold no share of the minority bloc; the minority cells vote much like the old minority row.
  for (const cell of S.society.cells.filter(c => c.identity_id === 'polish')) assert.equal(cell.propensity.minorities_bloc, 0);
  close(Q.national_minorities_minorities_bloc, 68.2, 0.1);
  for (const c of PolishElectorate.MAIN_CLASSES) close(Q.parties.reduce((n, p) => n + Q[`${c}_${p}`], 0), 100);
  assert.deepEqual(PolishElectorate.validateCells(S), []);
  assert.deepEqual([...new Set(S.society.cells.map(c => c.turnout_base))], [0.70]);
  assert.deepEqual([...new Set(S.society.cells.map(c => c.trust_pps))], [50]);
  assert.deepEqual([...new Set(S.society.cells.map(c => c.base_reach_pps))], [20]);
});

test('Populacja: a change of employment moves minority workers between cells; the total mass stays 1 and nobody is counted twice', () => {
  const Q = game();
  const S = Q.S;
  const minority = () => massOf(S.society.cells.filter(c => c.identity_id !== 'polish'));
  const workers = () => massOf(S.society.cells.filter(c => c.class_id === 'workers'));
  const unemployedMinorityWorkers = () => massOf(S.society.cells.filter(c => c.identity_id !== 'polish' && c.class_id === 'workers' && c.employment === 'unemployed'));
  const [m0, w0, u0] = [minority(), workers(), unemployedMinorityWorkers()];
  const poll0 = PolishElectorate.poll(S);
  PolishElectorate.applyEmployment(S, 10);
  close(massOf(S.society.cells), 1);
  close(minority(), m0);
  close(workers(), w0);
  close(unemployedMinorityWorkers() / u0, 10 / 3, 1e-9);
  const poll1 = PolishElectorate.poll(S);
  for (const party of Q.parties) close(poll1[party], poll0[party], 1e-12);
  assert.ok(!S.society.cells.some(c => c.class_id === 'unemployed'), 'the unemployed are a state of employment, not a second pool');
});

test('Dwie kategorie mniejszości: merging cells of different size and the same turnout keeps their mass and votes; the two seat segments sum to the bloc', () => {
  const Q = game();
  const S = Q.S;
  assert.deepEqual([...new Set(S.society.cells.map(c => c.identity_id))].sort(), ['jewish', 'other_minorities', 'polish']);
  const pair = S.society.cells.filter(c => c.class_id === 'rural' && c.identity_id !== 'polish');
  assert.ok(pair[0].mass !== pair[1].mass);
  const merged = PolishElectorate.mergeCells(pair, Q.parties);
  close(merged.mass, pair[0].mass + pair[1].mass);
  for (const party of Q.parties) close(merged.mass * merged.propensity[party], pair[0].mass * pair[0].propensity[party] + pair[1].mass * pair[1].propensity[party]);
  for (const total of [17, 0, 1, 2, 66]) {
    const split = PolishInstitutions.splitMinorities ? PolishInstitutions.splitMinorities(total) : null;
    if (split) assert.equal(split.jewish_rep + split.other_minorities_rep, total);
  }
});

test('Miasta i klasy: the large-city split changes neither mass nor poll; a campaign to the large cities reaches only their cells', () => {
  const Q = game();
  const S = Q.S;
  const urban = S.society.cells.filter(c => c.settlement === 'major_city');
  assert.ok(urban.length > 0 && urban.every(c => ['workers', 'old_middle', 'new_middle'].includes(c.class_id)));
  for (const c of ['workers', 'old_middle', 'new_middle']) {
    const city = massOf(S.society.cells.filter(x => x.class_id === c && x.settlement === 'major_city'));
    const other = massOf(S.society.cells.filter(x => x.class_id === c && x.settlement === 'other'));
    close(city, other, 1e-12);
  }
  const before = S.society.cells.map(c => c.propensity.pps);
  PolishParty.campaign(Q, 'press', 'class', 'major_cities');
  S.society.cells.forEach((cell, i) => {
    if (cell.settlement === 'major_city') assert.ok(cell.propensity.pps > before[i], cell.id);
    else assert.equal(cell.propensity.pps, before[i], cell.id);
  });
});

test('Preferencje: +4 pp in a cell near 100% keeps every share within 0–100, the sum 100 and no negative rival', () => {
  const Q = game();
  const cell = JSON.parse(JSON.stringify(Q.S.society.cells[0]));
  for (const p of Q.parties) cell.propensity[p] = 0;
  cell.propensity.pps = 98; cell.propensity.kpp = 1.5; cell.propensity.other = 0.5;
  const moved = PolishElectorate.gainForPps(cell, 4, Q.parties);
  close(moved, 2);
  close(cell.propensity.pps, 100);
  for (const p of Q.parties) assert.ok(cell.propensity[p] >= 0 && cell.propensity[p] <= 100, p);
  close(Q.parties.reduce((n, p) => n + cell.propensity[p], 0), 100);
});

test('the campaign formula of 5.3: gain = 4 × (0.5 + reach/200) × trust/100 × (1 − dissent) × (1 − share/100), times the press credibility', () => {
  const Q = game();
  const S = Q.S;
  const cell = S.society.cells.find(c => c.class_id === 'rural' && c.identity_id === 'polish');
  const share = cell.propensity.pps;
  const reach = 0.5 * cell.base_reach_pps + 0.3 * PolishParty.pressEffective(S).reach + 0.2 * cell.base_reach_pps;
  close(PolishParty.cellReach(S, cell, 'press'), reach);
  const expected = 4 * (0.5 + reach / 200) * 0.5 * (1 - Q.dissent) * (1 - share / 100) * (0.5 + 0.5 * 60 / 100);
  PolishParty.campaign(Q, 'press', 'class', 'rural');
  close(cell.propensity.pps - share, expected, 1e-9);
  assert.equal(S.party_orgs.cash, 1, '1 R');
  assert.equal(Q.month_actions, 1, '1 T');
});

test('Nasycenie: the fifth identical campaign within six months gains less than the first, other inputs equal', () => {
  const Q = game();
  const cell = JSON.parse(JSON.stringify(Q.S.society.cells.find(c => c.class_id === 'workers')));
  const first = PolishElectorate.campaignGain(cell, 30, 0.05, 'class', 5);
  for (const t of [1, 2, 3, 4]) PolishElectorate.recordCampaign(cell, 'class', t);
  const fifth = PolishElectorate.campaignGain(cell, 30, 0.05, 'class', 5);
  close(fifth, first / 5);
  assert.equal(PolishElectorate.campaignGain(cell, 30, 0.05, 'democracy', 5), first, 'another topic is not saturated');
  assert.equal(PolishElectorate.campaignGain(cell, 30, 0.05, 'class', 11), first, 'the count expires after six months');
});

test('Praca organizacyjna w komórkach: among the peasants under the workers-and-peasants line +2.2 (×1.10); the press is not a target', () => {
  const Q = game();
  Q.S.actors.pps.strategy.electoral_base = 'workers_peasants';
  PolishParty.organizeWithoutFunds(Q, 'class:rural');
  for (const cell of Q.S.society.cells.filter(c => c.class_id === 'rural')) close(cell.base_reach_pps, 22.2);
  for (const cell of Q.S.society.cells.filter(c => c.class_id === 'workers')) close(cell.base_reach_pps, 20);
  assert.match(PolishParty.organizeStatus(Q, 'press').reason, /not the press or TUR/);
});

test('Szkoły: two school projects of one scope give their own trust once, without a double reward and without TUR growth', () => {
  const Q = game();
  const S = Q.S, t = Q.time;
  const project = (id, type, variant, beneficiaries) => {
    S.projects[id] = {id: id, type: type, variant: variant, beneficiaries: beneficiaries, responsibility: {pps: 0.70}, status: 'operating',
      first_effect_time: t, last_coverage: 1, effects_applied: [],
      pending_effects: [{id: id + ':trust:first_effect', system: 'trust', stage: 5, value: 4, when: 'first_effect', beneficiaries: beneficiaries}]};
  };
  project('prj-rural', 'education_program', 'rural_access', ['rural']);
  project('prj-language', 'minority_schools', 'own_language', ['national_minorities']);
  const rural = S.society.cells.find(c => c.class_id === 'rural' && c.identity_id === 'polish');
  const minority = S.society.cells.find(c => c.class_id === 'workers' && c.identity_id === 'jewish');
  const shareBefore = rural.propensity.pps;
  PolishParty.settleRewards(Q, t);
  assert.deepEqual([rural.trust_pps, minority.trust_pps], [54, 54]);
  close(rural.propensity.pps - shareBefore, 0.70, 1e-9);
  PolishParty.settleRewards(Q, t + 1);
  assert.deepEqual([rural.trust_pps, minority.trust_pps], [54, 54], 'no second reward');
  assert.equal(S.party_orgs.tur.level, 0);
});

test('17.4 on the cells: the disappointed voters of PPS go to the other parties of the cell in proportion to their shares', () => {
  const Q = game();
  const S = Q.S;
  const cell = S.society.cells.find(c => c.class_id === 'workers' && c.identity_id === 'polish');
  const before = JSON.parse(JSON.stringify(cell.propensity));
  const out = PolishElectorate.settleDisappointment(S, Q.time, 0.5);
  close(cell.propensity.pps, before.pps - 0.5);
  const others = Q.parties.filter(p => p !== 'pps' && before[p] > 0);
  const total = others.reduce((n, p) => n + before[p], 0);
  for (const p of others) close(cell.propensity[p] - before[p], 0.5 * before[p] / total);
  close(out.workers, 0.5);
});
