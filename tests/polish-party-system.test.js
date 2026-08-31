const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const gamePath = path.join(__dirname, '..', 'out', 'game.json');
const game = JSON.parse(fs.readFileSync(gamePath, 'utf8'));
const htmlShell = fs.readFileSync(path.join(__dirname, '..', 'out', 'html', 'index.html'), 'utf8');
const gameCss = fs.readFileSync(path.join(__dirname, '..', 'out', 'html', 'game.css'), 'utf8');

const expectedClasses = [
  'workers',
  'old_middle',
  'new_middle',
  'rural',
  'bourgeois_landowners',
  'unemployed',
  'national_minorities',
];

const expectedParties = [
  'kpp',
  'pps',
  'npr',
  'psl_wyzwolenie',
  'psl_piast',
  'pschd',
  'zln',
  'minorities_bloc',
  'other',
];

const openingRows = {
  workers: [11.04, 38.64, 18.4, 1.84, 0.92, 9.2, 7.36, 4.6, 8],
  old_middle: [1.84, 9.2, 12.88, 3.68, 5.52, 18.4, 29.44, 11.04, 8],
  new_middle: [3.68, 22.08, 4.6, 8.28, 4.6, 9.2, 25.76, 13.8, 8],
  rural: [1.76, 3.52, 1.76, 28.16, 29.92, 5.28, 13.2, 4.4, 12],
  bourgeois_landowners: [0, 1.84, 3.68, 0.92, 6.44, 13.8, 48.76, 16.56, 8],
  unemployed: [29.44, 34.96, 11.04, 1.84, 0.92, 4.6, 3.68, 5.52, 8],
  national_minorities: [9.2, 6.44, 0.92, 1.84, 0.92, 0.92, 1.84, 69.92, 8],
};

function codeFor(sceneId, field = 'onArrival') {
  const entries = game.scenes[sceneId][field] || [];
  const entryList = Array.isArray(entries) ? entries : [entries];
  return entryList.map((entry) => entry.$code).join('\n');
}

function runCode(code, Q, extraContext = {}) {
  const context = {
    Q,
    console: { log() {} },
    Date,
    Image: function Image() {},
    ...extraContext,
  };
  vm.runInNewContext(code, context);
  return Q;
}

function runScene(sceneId, Q, field = 'onArrival') {
  return runCode(codeFor(sceneId, field), Q);
}

function sceneCondition(sceneId, Q, field = 'viewIf') {
  const code = codeFor(sceneId, field);
  return vm.runInNewContext(`(function () { ${code} })()`, { Q });
}

function newGameState() {
  return runScene('root.start', {});
}

function runElection(Q) {
  return runScene('election_algorithm', Q);
}

function runPostEvent(Q) {
  return runCode(codeFor('post_event'), Q, {
    game: { scenes: { 'post_event.events_choice': {} } },
    _compileChoices: () => [{ title: 'Continue...' }],
    ui: null,
  });
}

function closeTo(actual, expected, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}

test('new games use semantic Polish party IDs and the approved population schema', () => {
  const Q = newGameState();

  assert.deepEqual(Array.from(Q.classes), expectedClasses);
  assert.deepEqual(Array.from(Q.parties), expectedParties);
  assert.equal(Q.player_party, 'pps');
  assert.equal(Q.polish_party_system, 1);
  assert.equal(Q.year, 1922);
  assert.equal(Q.month, 1);
  assert.equal(Q.workers, 27);
  assert.equal(Q.rural, 53);
  closeTo(Q.old_middle, 110 / 9);
  closeTo(Q.new_middle, 50 / 9);
  closeTo(Q.bourgeois_landowners, 20 / 9);
  closeTo(Q.workers + Q.rural + Q.old_middle + Q.new_middle + Q.bourgeois_landowners, 100);
  assert.equal(Q.unemployed, 3);
  assert.equal(Q.national_minorities, 30);
  assert.ok(!Q.parties.some((party) => ['spd', 'kpd', 'z', 'ddp', 'dvp', 'dnvp', 'nsdap'].includes(party)));
});

test('new games use the approved semantic PPS faction model', () => {
  const Q = newGameState();

  assert.equal(Q.polish_faction_system, 1);
  assert.deepEqual(Array.from(Q.factions), ['centrum', 'lewica', 'pilsudczycy']);
  assert.equal(Q.centrum_strength, 50);
  assert.equal(Q.lewica_strength, 15);
  assert.equal(Q.pilsudczycy_strength, 35);
  assert.equal(Q.centrum_dissent, 0);
  assert.equal(Q.lewica_dissent, 20);
  assert.equal(Q.pilsudczycy_dissent, 5);
  assert.deepEqual(JSON.parse(JSON.stringify(Q.legacy_faction_map)), {
    left: 'lewica',
    center: 'centrum',
    reformist: 'centrum',
    neorevisionist: 'pilsudczycy',
  });
  assert.ok(!Object.hasOwn(Q.legacy_faction_map, 'labor'));
});

test('legacy faction effects transfer once and active PPS strengths normalize', () => {
  const Q = newGameState();
  Q.center_strength += 4;
  Q.reformist_strength += 3;
  Q.left_strength += 5;
  Q.neorevisionist_strength += 6;
  Q.labor_strength += 9;
  Q.center_dissent += 2;
  Q.reformist_dissent += 3;
  Q.left_dissent += 4;
  Q.neorevisionist_dissent += 5;
  Q.labor_dissent += 20;

  runPostEvent(Q);

  closeTo(Q.centrum_strength, 100 * 57 / 118);
  closeTo(Q.lewica_strength, 100 * 20 / 118);
  closeTo(Q.pilsudczycy_strength, 100 * 41 / 118);
  closeTo(Q.centrum_strength + Q.lewica_strength + Q.pilsudczycy_strength, 100);
  assert.equal(Q.centrum_dissent, 5);
  assert.equal(Q.lewica_dissent, 24);
  assert.equal(Q.pilsudczycy_dissent, 10);
  const expectedDissent = 0.01 * (
    Q.centrum_strength * 5 + Q.lewica_strength * 24 + Q.pilsudczycy_strength * 10
  ) / 100;
  closeTo(Q.dissent, expectedDissent);

  const activeSnapshot = Q.factions.map((faction) => [
    Q[`${faction}_strength`],
    Q[`${faction}_dissent`],
  ]);
  runPostEvent(Q);
  for (let index = 0; index < Q.factions.length; index += 1) {
    closeTo(Q[`${Q.factions[index]}_strength`], activeSnapshot[index][0]);
    closeTo(Q[`${Q.factions[index]}_dissent`], activeSnapshot[index][1]);
  }
});

test('the affiliated Labor power centre is excluded from PPS dissent', () => {
  const lowLabor = newGameState();
  lowLabor.labor_dissent = 0;
  runPostEvent(lowLabor);

  const highLabor = newGameState();
  highLabor.labor_dissent = 99;
  runPostEvent(highLabor);

  closeTo(highLabor.dissent, lowLabor.dissent);
  assert.ok(!highLabor.factions.includes('labor'));
});

test('every opening support row totals 100 with the approved Other allocation', () => {
  const Q = newGameState();

  for (const populationGroup of expectedClasses) {
    const actual = expectedParties.map((party) => Q[`${populationGroup}_${party}`]);
    assert.deepEqual(actual, openingRows[populationGroup], populationGroup);
    closeTo(actual.reduce((sum, value) => sum + value, 0), 100);
    assert.equal(Q[`${populationGroup}_other`], populationGroup === 'rural' ? 12 : 8);
  }
});

test('opening national projection is deterministic under retained overlapping minority weighting', () => {
  const Q = runElection(newGameState());
  const expected = {
    kpp: 6.005,
    pps: 13.287,
    npr: 6.330,
    psl_wyzwolenie: 12.751,
    psl_piast: 13.145,
    pschd: 6.589,
    zln: 11.848,
    minorities_bloc: 20.451,
    other: 9.594,
  };

  closeTo(expectedParties.reduce((sum, party) => sum + Q[`${party}_normalized`], 0), 1);
  for (const [party, percentage] of Object.entries(expected)) {
    closeTo(Q[`${party}_normalized`] * 100, percentage, 0.001);
    assert.ok(Number.isFinite(Q[`${party}_votes_dec`]));
  }
  assert.equal(Q.workers_pps_display, 39);
  assert.equal(Q.rural_other_display, 12);
  assert.equal(Q.national_minorities_minorities_bloc_display, 70);
});

test('legacy card changes transfer only through approved direct mappings', () => {
  const Q = newGameState();
  Q.workers_spd += 4;
  Q.unemployed_kpd += 3;
  Q.old_middle_dvp += 2;
  Q.rural_dnvp += 5;
  Q.catholics_spd += 6;

  runElection(Q);

  closeTo(Q.workers_pps, openingRows.workers[1] + 4);
  closeTo(Q.unemployed_kpp, openingRows.unemployed[0] + 3);
  closeTo(Q.old_middle_pschd, openingRows.old_middle[5] + 2);
  closeTo(Q.rural_zln, openingRows.rural[6] + 5);
  closeTo(Q.national_minorities_pps, openingRows.national_minorities[1] + 6);
  assert.ok(!Q.parties.includes('nsdap'));
});

test('campaigning covers every approved population group and respects dissent', () => {
  const cases = [
    ['workers', 'workers_pps', 6],
    ['new_middle', 'new_middle_pps', 6],
    ['old_middle', 'old_middle_pps', 5],
    ['rural', 'rural_pps', 2],
    ['bourgeois_landowners', 'bourgeois_landowners_pps', 3],
    ['unemployed', 'unemployed_pps', 6],
    ['national_minorities', 'national_minorities_pps', 6],
  ];

  for (const [scene, key, baseGain] of cases) {
    const Q = newGameState();
    Q.resources = 10;
    Q.dissent = 0.25;
    Q.peoples_party = scene === 'national_minorities' ? 1 : Q.peoples_party;
    Q.socialism = 50;
    Q.nationalism = 50;
    Q.unemployed = 3;
    Q.welfare = 0;
    Q.wtb_adopted = 0;
    Q.nationalization_progress = 0;
    Q.rural_policy = 0;
    const before = Q[key];

    runScene(`campaigning.${scene}`, Q);

    closeTo(Q[key] - before, baseGain * (1 - Q.dissent));
    assert.equal(Q.resources, 9);
  }
});

test('Polish relationship actions update the implemented coalition partners', () => {
  const left = newGameState();
  left.resources = 2;
  runScene('inter_party_relationships.left_partners', left);
  closeTo(left.psl_wyzwolenie_relation, 65 + 4 * (1 - left.dissent));
  closeTo(left.minorities_bloc_relation, 50 + 4 * (1 - left.dissent));

  const center = newGameState();
  center.resources = 2;
  runScene('inter_party_relationships.center_left_partners', center);
  closeTo(center.psl_piast_relation, 45 + 3 * (1 - center.dissent));
  closeTo(center.npr_relation, 50 + 3 * (1 - center.dissent));
  closeTo(center.pschd_relation, 30 + 2 * (1 - center.dissent));
});

test('first-election processing records all parties and computes only the implemented coalition shell', () => {
  const Q = runElection(newGameState());
  runScene('election_1928.post_election_polish', Q);

  assert.equal(Q.election_records.length, 1);
  assert.deepEqual(Object.keys(Q.election_records[0]).sort(), ['date', ...expectedParties].sort());
  for (const party of expectedParties) {
    assert.equal(Q[`${party}_r`], Q[`${party}_votes`]);
  }
  assert.equal(Q.largest_party_id, 'minorities_bloc');
  assert.equal(Q.polish_left_coalition, Q.pps_r + Q.psl_wyzwolenie_r + Q.minorities_bloc_r);
  assert.equal(Q.polish_center_left_coalition, Q.pps_r + Q.psl_wyzwolenie_r + Q.psl_piast_r + Q.npr_r);
  assert.equal(Q.chjeno_piast_coalition, Q.zln_r + Q.pschd_r + Q.psl_piast_r);
  assert.equal(Q.anti_democratic_bloc, Q.kpp_r + Q.zln_r);
  assert.equal(Q.spd_r, Q.pps_r);
  assert.equal(Q.kpd_r, Q.kpp_r);
});

test('minority-supported government is external toleration, not cabinet membership', () => {
  const Q = newGameState();
  runScene('election_1928.polish_minority_toleration', Q);

  assert.equal(Q.pps_in_government, 1);
  assert.equal(Q.psl_wyzwolenie_in_government, 1);
  assert.equal(Q.minorities_bloc_in_government, 0);
  assert.equal(Q.minorities_toleration, 1);
  assert.equal(Q.in_minority_government, 1);
});

test('the structural class trend still reaches its exact approved endpoints', () => {
  const february1922 = newGameState();
  february1922.month_actions = 1;
  runPostEvent(february1922);
  assert.equal(february1922.month, 2);
  closeTo(february1922.workers, 27 + 3 / 215);
  closeTo(february1922.rural, 53 - 3 / 215);

  const december1939 = newGameState();
  december1939.year = 1939;
  december1939.month = 11;
  december1939.month_actions = 1;
  runPostEvent(december1939);
  assert.equal(december1939.month, 12);
  assert.equal(december1939.workers, 30);
  assert.equal(december1939.rural, 50);
});

test('player-facing polling, library and chart code use the Polish roster', () => {
  const polls = JSON.stringify(game.scenes['status.polls'].content);
  const projections = JSON.stringify(game.scenes['library.election_projections'].content);
  const parties = JSON.stringify(game.scenes['library.parties'].content);
  const figures = codeFor('library.figures', 'onDisplay');
  const campaignOptions = game.scenes.campaigning.options.map((option) => option.title);

  for (const label of ['KPP', 'PPS', 'NPR', 'PSL Wyzwolenie', 'PSL Piast', 'PSChD', 'ZLN', 'Blok Mniejszości Narodowych']) {
    assert.ok(polls.includes(label), label);
    assert.ok(projections.includes(label), label);
    assert.ok(parties.includes(label), label);
  }
  assert.ok(campaignOptions.includes('Burżuazja i Ziemiaństwo.'));
  assert.ok(campaignOptions.includes('Mniejszości Narodowe.'));
  assert.ok(figures.includes('Q.party_colors'));
  assert.ok(figures.includes('Q.party_names'));
  for (const party of expectedParties.filter((party) => party !== 'other')) {
    assert.ok(gameCss.includes(`.seat.${party}`));
  }
  assert.ok(htmlShell.includes('PPS: An Alternate History'));
});

test('the election simulator uses the same Polish opening matrix', () => {
  const Q = {};
  runScene('election_simulation.opening', Q);
  runElection(Q);
  runScene('election_simulation.post_election', Q);

  assert.deepEqual(Array.from(Q.parties), expectedParties);
  assert.equal(Q.largest_party_id, 'minorities_bloc');
  assert.equal(Q.rural_other_display, 12);
  for (const party of expectedParties) {
    assert.ok(Number.isFinite(Q[`${party}_r`]));
  }
});

test('later Polish parties and coalitions remain explicitly planned rather than active', () => {
  const Q = newGameState();
  for (const party of ['bbwr', 'ozn', 'sl', 'pps_l', 'pps_dfr', 'spp']) {
    assert.ok(!Q.parties.includes(party));
  }
  assert.equal(Q.bbwr_formed, 0);
  assert.equal(Q.ozn_formed, 0);
  assert.equal(Q.sl_formed, 0);
  const partiesText = JSON.stringify(game.scenes['library.parties'].content);
  assert.ok(partiesText.includes('Planned, not implemented'));
  assert.ok(partiesText.includes('Socjaldemokratyczna Partia Pracy'));
});

test('party disunity choices operate on PPS factions and the separate unions', () => {
  const discipline = newGameState();
  discipline.centrum_dissent = 40;
  discipline.lewica_dissent = 40;
  discipline.pilsudczycy_dissent = 40;
  discipline.labor_dissent = 40;
  const workerSupport = discipline.workers_pps;
  runScene('party_disunity.enforce_unity', discipline);
  assert.equal(discipline.centrum_dissent, 35);
  assert.equal(discipline.lewica_dissent, 35);
  assert.equal(discipline.pilsudczycy_dissent, 35);
  assert.equal(discipline.labor_dissent, 35);
  assert.equal(discipline.workers_pps, workerSupport - 4);

  const concessions = newGameState();
  concessions.centrum_dissent = 40;
  concessions.lewica_dissent = 40;
  concessions.pilsudczycy_dissent = 40;
  concessions.labor_dissent = 40;
  runScene('party_disunity.concessions_centrum', concessions);
  assert.equal(concessions.centrum_dissent, 33);
  assert.equal(concessions.lewica_dissent, 42);
  assert.equal(concessions.pilsudczycy_dissent, 42);
  runScene('party_disunity.concessions_labor', concessions);
  assert.equal(concessions.labor_dissent, 33);
  assert.equal(concessions.centrum_dissent, 38);
});

test('new games use the approved three-person starting team and full Polish adviser pool', () => {
  const Q = newGameState();
  const polishAdvisers = [
    'daszynski', 'puzak', 'perl', 'niedzialkowski', 'arciszewski',
    'zaremba', 'czapinski', 'prochnik', 'dubois', 'drobner',
    'jaworowski', 'moraczewski', 'ziemiecki', 'malinowski',
  ];

  assert.equal(Q.n_advisors, 3);
  assert.equal(Q.daszynski_advisor, 1);
  assert.equal(Q.puzak_advisor, 1);
  assert.equal(Q.perl_advisor, 1);
  for (const adviser of polishAdvisers.slice(3)) {
    assert.equal(Q[`${adviser}_advisor`], 0, adviser);
  }
  for (const adviser of polishAdvisers) {
    assert.ok(game.scenes[adviser], adviser);
    assert.ok(game.scenes[adviser].options.length >= 2, `${adviser} has a usable action and return option`);
    assert.equal(Q[`${adviser}_left_adviser_pool`], 0, adviser);
  }
  for (const legacy of ['wels', 'muller', 'hilferding']) {
    assert.equal(Q[`${legacy}_advisor`], 0, legacy);
  }
});

test('the six approved starting-adviser actions use semantic PPS state and one shared cooldown', () => {
  const compromise = newGameState();
  runScene('daszynski.parliamentary_compromise', compromise);
  assert.equal(compromise.psl_piast_relation, 48);
  assert.equal(compromise.npr_relation, 53);
  assert.equal(compromise.pschd_relation, 32);
  assert.equal(compromise.advisor_action_timer, 6);

  const coalition = newGameState();
  coalition.spd_in_government = 1;
  coalition.coalition_dissent = 2;
  runScene('daszynski.broker_coalition', coalition);
  assert.equal(coalition.coalition_dissent, 1);

  const discipline = newGameState();
  discipline.centrum_dissent = 10;
  discipline.lewica_dissent = 20;
  discipline.pilsudczycy_dissent = 30;
  runScene('puzak.party_discipline', discipline);
  assert.equal(discipline.centrum_dissent, 5);
  assert.equal(discipline.lewica_dissent, 15);
  assert.equal(discipline.pilsudczycy_dissent, 25);

  const organization = newGameState();
  organization.party_organizations_timer = 4;
  runScene('puzak.mobilize_organization', organization);
  assert.equal(organization.party_organizations_timer, 0);
  assert.equal(organization.last_advisor_action, 1);

  const partyLine = newGameState();
  runScene('perl.define_party_line', partyLine);
  assert.equal(partyLine.centrum_strength, 55);
  assert.equal(partyLine.centrum_dissent, -5);

  const press = newGameState();
  press.media_timer = 4;
  runScene('perl.direct_party_press', press);
  assert.equal(press.media_timer, 0);
  assert.equal(press.last_advisor_action, 1);
  assert.equal(press.advisor_action_timer, 6);
});

test('leadership appointments strengthen a faction once and dismissals add dissent', () => {
  const Q = newGameState();
  runScene('shuffle_leadership.remove_perl', Q);
  assert.equal(Q.perl_advisor, 0);
  assert.equal(Q.n_advisors, 2);
  assert.equal(Q.centrum_dissent, 5);

  const strengthAfterRemoval = Q.centrum_strength;
  runScene('shuffle_leadership.add_perl', Q);
  assert.equal(Q.perl_advisor, 1);
  assert.equal(Q.n_advisors, 3);
  assert.equal(Q.centrum_strength, strengthAfterRemoval);

  runScene('shuffle_leadership.remove_perl', Q);
  Q.niedzialkowski_appointed_once = 0;
  const beforeFirstAppointment = Q.centrum_strength;
  runScene('shuffle_leadership.add_niedzialkowski', Q);
  assert.equal(Q.centrum_strength, beforeFirstAppointment + 5);
  runScene('shuffle_leadership.remove_niedzialkowski', Q);
  const beforeReappointment = Q.centrum_strength;
  runScene('shuffle_leadership.add_niedzialkowski', Q);
  assert.equal(Q.centrum_strength, beforeReappointment);
});

test('dated adviser arrivals and deterministic departures follow the approved schedule', () => {
  const opening = newGameState();
  opening.n_advisors = 0;
  assert.equal(sceneCondition('shuffle_leadership.add_prochnik', opening), false);
  assert.equal(sceneCondition('shuffle_leadership.add_drobner', opening), false);
  assert.equal(sceneCondition('shuffle_leadership.add_dubois', opening), false);

  opening.year = 1928;
  assert.equal(sceneCondition('shuffle_leadership.add_prochnik', opening), true);
  assert.equal(sceneCondition('shuffle_leadership.add_drobner', opening), true);
  assert.equal(sceneCondition('shuffle_leadership.add_dubois', opening), false);
  opening.year = 1930;
  assert.equal(sceneCondition('shuffle_leadership.add_dubois', opening), true);

  const perl = newGameState();
  perl.year = 1927;
  perl.month = 3;
  perl.month_actions = 1;
  runPostEvent(perl);
  assert.equal(perl.month, 4);
  assert.equal(perl.perl_advisor, 0);
  assert.equal(perl.perl_left_adviser_pool, 1);
  assert.equal(perl.n_advisors, 2);

  const daszynski = newGameState();
  daszynski.perl_advisor = 0;
  daszynski.perl_left_adviser_pool = 1;
  daszynski.n_advisors = 2;
  daszynski.year = 1930;
  daszynski.month = 12;
  daszynski.month_actions = 1;
  runPostEvent(daszynski);
  assert.equal(daszynski.year, 1931);
  assert.equal(daszynski.month, 1);
  assert.equal(daszynski.daszynski_advisor, 0);
  assert.equal(daszynski.daszynski_left_adviser_pool, 1);
  assert.equal(daszynski.n_advisors, 1);
});

test('named split departures affect only advisers whose pool-entry date has arrived', () => {
  const earlyLewica = newGameState();
  earlyLewica.year = 1926;
  earlyLewica.lewica_dissent = 60;
  earlyLewica.daszynski_advisor = 0;
  earlyLewica.puzak_advisor = 0;
  earlyLewica.perl_advisor = 0;
  earlyLewica.czapinski_advisor = 1;
  earlyLewica.n_advisors = 1;
  runScene('pps_lewica_split', earlyLewica);
  assert.equal(earlyLewica.lewica_split, 1);
  assert.equal(earlyLewica.lewica_strength, 7.5);
  assert.equal(earlyLewica.czapinski_advisor, 0);
  assert.equal(earlyLewica.czapinski_left_adviser_pool, 1);
  assert.equal(earlyLewica.prochnik_left_adviser_pool, 0);
  assert.equal(earlyLewica.drobner_left_adviser_pool, 0);
  assert.equal(earlyLewica.dubois_left_adviser_pool, 0);
  assert.equal(earlyLewica.n_advisors, 0);
  earlyLewica.year = 1930;
  assert.equal(sceneCondition('shuffle_leadership.add_dubois', earlyLewica), true);

  const lateLewica = newGameState();
  lateLewica.year = 1931;
  lateLewica.lewica_dissent = 60;
  runScene('pps_lewica_split', lateLewica);
  for (const adviser of ['czapinski', 'prochnik', 'dubois', 'drobner']) {
    assert.equal(lateLewica[`${adviser}_left_adviser_pool`], 1, adviser);
  }
  assert.equal(lateLewica.zaremba_left_adviser_pool, 0);

  const centrum = newGameState();
  centrum.centrum_dissent = 60;
  runScene('pps_centrum_crisis', centrum);
  assert.equal(centrum.centrum_resigned, 1);
  assert.equal(centrum.centrum_strength, 15);
  assert.equal(centrum.workers_pps, openingRows.workers[1] - 5);
  assert.equal(centrum.new_middle_pps, openingRows.new_middle[1] - 3);
  assert.equal(centrum.daszynski_advisor, 0);
  assert.equal(centrum.perl_advisor, 0);
  assert.equal(centrum.puzak_advisor, 1);
  assert.equal(centrum.niedzialkowski_left_adviser_pool, 1);
  assert.equal(centrum.arciszewski_left_adviser_pool, 0);
  assert.equal(centrum.n_advisors, 1);

  const pilsudczycy = newGameState();
  pilsudczycy.pilsudczycy_dissent = 60;
  pilsudczycy.daszynski_advisor = 0;
  pilsudczycy.puzak_advisor = 0;
  pilsudczycy.perl_advisor = 0;
  pilsudczycy.jaworowski_advisor = 1;
  pilsudczycy.moraczewski_advisor = 1;
  pilsudczycy.ziemiecki_advisor = 1;
  pilsudczycy.n_advisors = 3;
  runScene('pps_pilsudczycy_split', pilsudczycy);
  assert.equal(pilsudczycy.pilsudczycy_split, 1);
  assert.equal(pilsudczycy.pilsudczycy_strength, 17.5);
  assert.equal(pilsudczycy.workers_pps, openingRows.workers[1] - 3);
  assert.equal(pilsudczycy.new_middle_pps, openingRows.new_middle[1] - 2);
  assert.equal(pilsudczycy.workers_other, openingRows.workers[8] + 3);
  assert.equal(pilsudczycy.new_middle_other, openingRows.new_middle[8] + 2);
  assert.equal(pilsudczycy.jaworowski_advisor, 0);
  assert.equal(pilsudczycy.moraczewski_advisor, 0);
  assert.equal(pilsudczycy.ziemiecki_advisor, 1);
  assert.equal(pilsudczycy.malinowski_left_adviser_pool, 1);
  assert.equal(pilsudczycy.ziemiecki_left_adviser_pool, 0);
  assert.equal(pilsudczycy.n_advisors, 1);

  assert.equal(game.scenes.pps_lewica_split.maxVisits, 1);
  assert.equal(game.scenes.pps_centrum_crisis.maxVisits, 1);
  assert.equal(game.scenes.pps_pilsudczycy_split.maxVisits, 1);
});

test('player-facing faction displays use Polish names and mark the union boundary', () => {
  const status = JSON.stringify(game.scenes['status.politics'].content);
  const library = JSON.stringify(game.scenes['library.factions'].content);
  for (const label of ['Centrum PPS', 'Lewica PPS', 'Piłsudczycy']) {
    assert.ok(status.includes(label), label);
    assert.ok(library.includes(label), label);
  }
  assert.ok(status.includes('Affiliated trade unions'));
  assert.ok(library.includes('Affiliated trade unions'));
  assert.ok(!library.includes('Temporary German-baseline party factions'));
});

test('German faction break events are disabled for the Polish faction system', () => {
  for (const sceneId of ['left_split', 'centrist_leaders_resign', 'reformist_leaders_resign']) {
    assert.ok(codeFor(sceneId, 'viewIf').includes('polish_faction_system'), sceneId);
  }
});

test('new games start with the approved Milicja PPS state', () => {
  const Q = newGameState();

  assert.equal(Q.pps_militia_stage, 1);
  assert.equal(Q.pps_militia_name, 'Milicja PPS');
  assert.equal(Q.pps_militia_strength, 200);
  assert.equal(Q.pps_militia_militancy, 0.10);
  assert.equal(Q.pps_militia_banned, 0);
  assert.equal(Q.pps_militia_repressed, 0);
  assert.equal(Q.pps_militia_union_cooperation, 0);
  assert.equal(Q.akcja_socjalistyczna_formed, 0);
  assert.deepEqual(Array.from(Q.pps_militia_opponents), [
    'nationalist_militias',
    'communist_militias',
    'state_police',
  ]);
  assert.equal(Q.rb_strength, Q.pps_militia_strength);
  assert.equal(Q.rb_militancy, Q.pps_militia_militancy);
});

test('Dubois provides access to self-defence choices without free manpower or militancy', () => {
  const selfDefence = newGameState();
  selfDefence.pps_militia_timer = 4;
  const openingStrength = selfDefence.pps_militia_strength;
  const openingMilitancy = selfDefence.pps_militia_militancy;
  runScene('dubois.workers_self_defence', selfDefence);
  assert.equal(selfDefence.pps_militia_timer, 0);
  assert.equal(selfDefence.pps_militia_strength, openingStrength);
  assert.equal(selfDefence.pps_militia_militancy, openingMilitancy);
  assert.equal(selfDefence.last_advisor_action, 1);
  assert.equal(selfDefence.advisor_action_timer, 6);

  const youth = newGameState();
  runScene('dubois.organize_youth', youth);
  assert.equal(youth.pps_militia_strength, openingStrength);
  assert.equal(youth.pps_militia_militancy, openingMilitancy);
});

test('reorganization creates Akcja Socjalistyczna without creating manpower', () => {
  const Q = newGameState();
  const openingStrength = Q.pps_militia_strength;

  runScene('reichsbanner.reorganize_as', Q);

  assert.equal(Q.pps_militia_stage, 2);
  assert.equal(Q.pps_militia_name, 'Akcja Socjalistyczna');
  assert.equal(Q.akcja_socjalistyczna_formed, 1);
  assert.equal(Q.pps_militia_strength, openingStrength);
  closeTo(Q.pps_militia_militancy, 0.20);
  assert.equal(game.scenes['reichsbanner.reorganize_as'].maxVisits, 1);
});

test('trade-union cooperation improves readiness without merging manpower', () => {
  const Q = newGameState();
  const openingStrength = Q.pps_militia_strength;
  const openingLaborDissent = Q.labor_dissent;

  runScene('reichsbanner.union_cooperation', Q);

  assert.equal(Q.pps_militia_union_cooperation, 1);
  assert.equal(Q.pps_militia_strength, openingStrength);
  closeTo(Q.pps_militia_militancy, 0.12);
  assert.equal(Q.labor_dissent, openingLaborDissent - 2);

  runScene('streetfighting.if_training', Q);
  assert.equal(Q.pps_militia_strength, openingStrength);
  closeTo(Q.pps_militia_militancy, 0.15);

  runScene('unions_declare_independence', Q);
  assert.equal(Q.pps_militia_union_cooperation, 0);
  assert.equal(Q.pps_militia_strength, openingStrength);
});

test('Milicja investment and rally defence use semantic militia state', () => {
  const Q = newGameState();
  Q.resources = 10;
  Q.pps_militia_training_cost = 1;
  runScene('reichsbanner.militant', Q);
  assert.equal(Q.resources, 9);
  assert.equal(Q.pps_militia_strength, 300);
  closeTo(Q.pps_militia_militancy, 0.15);

  Q.sa_strength = 20;
  Q.sa_militancy = 0.5;
  runScene('rally.rb_protect', Q);
  closeTo(Q.pps_militia_success, 35);
});

test('legacy Reichsbanner deltas transfer once into the PPS militia', () => {
  const Q = newGameState();
  Q.rb_strength += 25;
  Q.rb_militancy += 0.03;

  runPostEvent(Q);
  assert.equal(Q.pps_militia_strength, 225);
  closeTo(Q.pps_militia_militancy, 0.13);

  runPostEvent(Q);
  assert.equal(Q.pps_militia_strength, 225);
  closeTo(Q.pps_militia_militancy, 0.13);
});

test('inherited crisis calculations read the semantic PPS militia power', () => {
  const affectedScenes = [
    ['prussian_coup.defend', 'chooseIf'],
    ['prussian_coup.defend_2', 'onArrival'],
    ['march_on_berlin.fight', 'onArrival'],
    ['civil_war', 'onArrival'],
    ['deport_hitler.force_approach', 'onArrival'],
  ];

  for (const [sceneId, field] of affectedScenes) {
    assert.ok(codeFor(sceneId, field).includes('pps_militia'), `${sceneId}.${field}`);
  }
});

test('Polish self-defence UI replaces the active Reichsbanner and Iron Front surfaces', () => {
  const status = JSON.stringify(game.scenes['status.paramilitaries']);
  const library = JSON.stringify(game.scenes['library.paramilitaries'].content);
  const militiaCard = JSON.stringify(game.scenes.reichsbanner.content);

  for (const text of ['Milicja PPS', 'Active organized members']) {
    assert.ok(library.includes(text), text);
  }
  assert.ok(status.includes('pps_militia_name'));
  assert.ok(militiaCard.includes('Akcja Socjalistyczna'));
  assert.ok(!militiaCard.includes('Reichsbanner Schwarz-Rot-Gold'));
  for (const category of ['Communist militias', 'Nationalist militias', 'State police']) {
    assert.ok(status.includes(category), category);
    assert.ok(library.includes(category), category);
  }
  for (const sceneId of ['iron_front', 'reichsbanner_zentrum', 'response_to_antisemitism']) {
    assert.ok(codeFor(sceneId, 'viewIf').includes('polish_party_system'), sceneId);
  }
});
