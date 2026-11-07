'use strict';

// The cards of Agriculture and Education after the redesign of the government cards (Z — 0.97, the sketch approved on 7 XI 2026):
// one gain and one cost per option; the preference for Polish settlers instead of the page of access to land; the language
// rule with the reaction of the national democrats; the card Culture and Science with the restoration, the universities and
// the public radio.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const dendry = require('./helpers/dendry');

function game() {
  return dendry.startGame().state.qualities;
}
function free(Q) {
  if (Q.S.turn.pending) { Q.S.turn.pending.phase = 'settled'; Q.S.turn.pending = null; }
  Q.month_actions = 0;
}
function withPortfolios(Q, ...portfolios) {
  const cabinet = Q.S.cabinet;
  if (!cabinet.partner_ids.includes('pps')) cabinet.partner_ids.push('pps');
  for (const key of portfolios) cabinet.portfolios[key] = 'pps';
  return Q;
}
// A fixture Sejm in which PPS carries its laws (250 of 444 MPs).
function ppsMajority(Q) {
  Q.S.parliament.clubs.find(c => c.id === 'pps').seats += 215;
  Q.S.parliament.clubs.find(c => c.id === 'other').seats -= 215;
  return Q;
}
function settle(Q) {
  const t = Q.time;
  free(Q);
  Q.time = t + 1; Q.year = PolishRules.yearOf(Q.time); Q.month = PolishRules.monthOf(Q.time);
  PolishUnions.beginMonth(Q, { t });
  PolishProjects.settleMonth(Q, { t });
  PolishUnions.endMonth(Q, { t });
}
const options = cardId => PolishProjects.CARDS[cardId].options;
const relation = (Q, id) => Q.S.actors.relations[id];
const project = (Q, type) => Object.values(Q.S.projects).find(p => p.type === type);
const pending = (p, system) => p.pending_effects.filter(e => e.system === system).map(e => e.value);

test('Karty Rolnictwa i Oświaty 0.97: the options of each card; no expropriation and no Wawel-or-Castle menu', () => {
  game();
  assert.deepEqual(options('land_program'), ['compensated', 'accelerated', 'settlers']);
  assert.deepEqual(options('agriculture_development'), ['advisory', 'consolidation', 'cooperative_processing_sales']);
  assert.deepEqual(options('education_program'), ['rural_access', 'urban_worker_adult_access', 'secular']);
  assert.deepEqual(options('minority_school_rights'), ['own_language', 'agreed_bilingual', 'polish_dominance']);
  assert.deepEqual(options('heritage_restoration'), ['heritage', 'science', 'radio']);
});

test('Osadnicy 0.97: the third option of the land reform is the parcellation with compensation for Polish settlers; Piast +5, the excluded −6; the card counts the parts left', () => {
  const Q = ppsMajority(withPortfolios(game(), 'agriculture'));
  const S = Q.S;
  PolishProjects.cardView(Q, 'land_program');
  assert.equal(Q.pl_gc_land_left, 'All three parts are still left.');
  const piast = relation(Q, 'psl_piast');
  PolishProjects.chooseOption(Q, 'land_program', 'settlers');
  const land = project(Q, 'land_program');
  assert.deepEqual([land.variant, land.policy_choices.access, land.tranche, land.authorized], ['compensated', 'polish_majority', 1, true]);
  assert.equal(relation(Q, 'psl_piast'), piast + 5);
  assert.deepEqual(pending(land, 'trust'), [-6]);
  free(Q);
  PolishProjects.cardView(Q, 'land_program');
  assert.equal(Q.pl_gc_land_left, 'Two parts are still left.');
});

test('Komasacja i spółdzielnie 0.97: the consolidation law first angers the peasants (+2); cooperative processing costs the trust of the traders (−3)', () => {
  const Q = ppsMajority(withPortfolios(game(), 'agriculture'));
  PolishProjects.chooseOption(Q, 'agriculture_development', 'consolidation');
  const consolidation = project(Q, 'agriculture_development');
  assert.equal(consolidation.authorized, true);
  assert.deepEqual(pending(consolidation, 'grievance'), [2]);
  free(Q);
  PolishProjects.chooseOption(Q, 'agriculture_development', 'cooperative_processing_sales');
  const coop = Object.values(Q.S.projects).find(p => p.variant === 'cooperative_processing_sales');
  for (let i = 0; i < 5; i++) settle(Q);
  const traders = coop.pending_effects.filter(e => e.system === 'trust');
  assert.deepEqual(traders.map(e => [e.value, e.beneficiaries]), [[-3, ['old_middle']]]);
  PolishProjects.cardView(Q, 'agriculture_development');
  assert.match(Q.pl_gc_agrarian, /^\d+$/);
});

test('Szkoła świecka i szkoły mniejszości 0.97: the secular school costs the relation with the Christian Democrats (−8); the own language −5 and Polish dominance +5 with the national democrats; bilingualism +2 trust', () => {
  const Q = ppsMajority(withPortfolios(game(), 'education'));
  const pschd = relation(Q, 'pschd'), zln = relation(Q, 'zln');
  PolishProjects.chooseOption(Q, 'education_program', 'secular');
  assert.equal(project(Q, 'education_program').authorized, true);
  assert.equal(relation(Q, 'pschd'), pschd - 8);
  free(Q);
  PolishProjects.chooseOption(Q, 'minority_school_rights', 'own_language');
  assert.equal(relation(Q, 'zln'), zln - 5);
  const R = game();
  withPortfolios(R, 'education');
  const zln2 = relation(R, 'zln');
  PolishProjects.chooseOption(R, 'minority_school_rights', 'polish_dominance');
  assert.equal(relation(R, 'zln'), zln2 + 5);
  assert.equal(PolishProjects.PROJECT_TYPES.minority_schools.variants.agreed_bilingual.trust, 2);
});

test('Kultura i nauka 0.97: the universities cost 1 B once (Z — 1.01) and the intelligentsia trusts PPS more (+3); the public radio 2 B once and democracy +2 once', () => {
  const Q = withPortfolios(game(), 'education');
  PolishProjects.cardView(Q, 'heritage_restoration');
  assert.equal(Q.pl_gc_heritage_object, 'Wawel');
  PolishProjects.chooseOption(Q, 'heritage_restoration', 'science');
  const science = project(Q, 'science');
  assert.deepEqual([science.status, science.price_B], ['executing', 1]);
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'heritage_restoration', 'science').reason, /already receive/);
  PolishProjects.chooseOption(Q, 'heritage_restoration', 'radio');
  const radio = project(Q, 'radio');
  assert.deepEqual([radio.price_B, radio.duration_months], [2, 1]);
  for (let i = 0; i < 5; i++) settle(Q);
  assert.equal(science.status, 'operating');
  assert.deepEqual(pending(science, 'trust'), [3]);
  assert.equal(radio.status, 'completed');
  assert.deepEqual(pending(radio, 'democracy'), [2]);
  assert.match(PolishProjects.optionStatus(Q, 'heritage_restoration', 'radio').reason, /already broadcasts/);
});
