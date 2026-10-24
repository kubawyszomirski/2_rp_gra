'use strict';

// The cards of Labour and of Industry and Trade after the redesign of the government cards (Z — 0.94, the user's decisions of
// 24 X 2026): every option has one gain and one cost; the card Economic Democracy; the customs war with Germany as one answer.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const dendry = require('./helpers/dendry');

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

function game() {
  return dendry.startGame().state.qualities;
}
// The month's action was committed by the rules; a test that acts again in the same month frees it.
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
// One whole settlement of period t (4.2): unions, projects and the economy, the unions' end.
function settle(Q) {
  const t = Q.time;
  free(Q);
  Q.time = t + 1; Q.year = PolishRules.yearOf(Q.time); Q.month = PolishRules.monthOf(Q.time);
  PolishUnions.beginMonth(Q, { t });
  PolishProjects.settleMonth(Q, { t });
  PolishUnions.endMonth(Q, { t });
  return Q.S.economy.history.at(-1);
}
const options = cardId => PolishProjects.CARDS[cardId].options;

test('Karty Pracy i Przemysłu 0.94: the options of each card; the general credit and the representation left Industry', () => {
  game(); // the rules modules are loaded with the game
  assert.deepEqual(options('labor_rights'), ['inspection', 'collective', 'derogation']);
  assert.deepEqual(options('social_welfare'), ['expand', 'insurance', 'limit']);
  assert.deepEqual(options('public_works'), ['employment', 'infrastructure', 'housing']);
  assert.deepEqual(options('industrial_policy'), ['orders', 'rescue', 'public_control']);
  assert.deepEqual(options('economic_democracy'), ['works_councils', 'cooperative_credit', 'socialise_mining']);
  assert.deepEqual(options('investment_fund'), ['public', 'banks', 'cooperative']);
  assert.deepEqual(options('customs_war'), ['retaliation', 'new_markets', 'concessions']);
});

test('Inspekcja i banki 0.94: the inspection law makes business press harder (+4); an agreement with the banks costs half and the Left of PPS protests (+4)', () => {
  const Q = ppsMajority(withPortfolios(game(), 'labor', 'finance'));
  const S = Q.S;
  const pressure = S.economy.business_pressure;
  PolishProjects.chooseOption(Q, 'labor_rights', 'inspection');
  const inspection = Object.values(S.projects).find(p => p.type === 'labor_inspection');
  assert.deepEqual([S.parliament.laws.at(-1).status, inspection.authorized], ['enacted', true]);
  assert.equal(S.economy.business_pressure, pressure + 4);
  free(Q);
  S.economy.credit = 45;
  const lewica = S.actors.pps.factions.lewica.dissent, before = S.economy.business_pressure;
  PolishProjects.chooseOption(Q, 'investment_fund', 'banks');
  const banks = Object.values(S.projects).find(p => p.type === 'credit_instrument');
  assert.deepEqual([banks.variant, banks.build_budget_B, banks.upkeep_budget_B], ['banks', 0.5, 0.5]);
  assert.equal(S.economy.business_pressure, Math.max(0, before - 8));
  assert.equal(S.actors.pps.factions.lewica.dissent, Math.min(99, lewica + 4));
  assert.match(Q.pl_gc_result, /Left of PPS protests/);
});

test('Spółdzielnie 0.94: state credit for the cooperatives costs 1 B a month; the workers trust PPS more (+3), the small traders less (−3)', () => {
  const Q = withPortfolios(game(), 'economic');
  const S = Q.S;
  S.economy.budget_base = 10;
  PolishProjects.chooseOption(Q, 'economic_democracy', 'cooperative_credit');
  const project = Object.values(S.projects).find(p => p.type === 'cooperative_credit');
  assert.deepEqual([project.status, project.upkeep_budget_B, project.authorized], ['operating', 1, true]);
  settle(Q);
  const trust = project.pending_effects.filter(e => e.system === 'trust').map(e => [e.value, e.beneficiaries.join(',')]);
  assert.deepEqual(trust, [[3, 'workers'], [-3, 'old_middle']]);
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'economic_democracy', 'cooperative_credit').reason, /already runs/);
});

test('Uspołecznienie 0.94: coal mining is socialised once by a law; business +25 when it takes effect; 2 B for six months; then Lewica −5 and the union of industry +5', () => {
  const Q = ppsMajority(withPortfolios(game(), 'economic'));
  const S = Q.S;
  S.economy.budget_base = 10;
  const pressure = S.economy.business_pressure, trust = S.unions.industry.trust, lewica = S.actors.pps.factions.lewica.dissent;
  PolishProjects.chooseOption(Q, 'economic_democracy', 'socialise_mining');
  const project = Object.values(S.projects).find(p => p.type === 'mining_socialisation');
  assert.deepEqual([S.parliament.laws.at(-1).project_id, S.parliament.laws.at(-1).status], [project.id, 'enacted']);
  assert.equal(S.economy.business_pressure, Math.min(100, pressure + 25));
  const charges = [];
  for (let i = 0; i < 7; i++) { charges.push(PolishEconomy.projectCharge(project, Q.time)); settle(Q); }
  assert.deepEqual(charges, [2, 2, 2, 2, 2, 2, 0], 'compensation for the owners for six months');
  assert.equal(project.status, 'completed');
  assert.equal(S.unions.industry.trust, Math.min(100, trust + 5));
  assert.ok(S.actors.pps.factions.lewica.dissent <= lewica, 'the Left of PPS is satisfied');
  free(Q);
  assert.match(PolishProjects.optionStatus(Q, 'economic_democracy', 'socialise_mining').reason, /once/);
});

test('Wojna celna 0.94: an urgent card of Industry and Trade from VI 1925 to VI 1926; one free answer that changes the shocks, the budget or the National Democrats', () => {
  const at = (Q, y, m) => { Q.year = y; Q.month = m; Q.time = PolishRules.timeOf(y, m); return Q; };
  const Q = withPortfolios(at(game(), 1925, 5), 'economic');
  assert.equal(PolishProjects.cardAvailable(Q, 'customs_war'), false, 'not before June 1925');
  at(Q, 1925, 6);
  assert.equal(PolishProjects.cardAvailable(Q, 'customs_war'), true);
  Q.month_actions = 1; // the month's action is already used: the answer is still free
  const t = Q.time;
  PolishProjects.chooseOption(Q, 'customs_war', 'retaliation');
  assert.equal(Q.month_actions, 1, 'no month');
  const shocks = Q.S.economy.shocks.filter(s => s.id.startsWith('customs_war:')).map(s => [s.channel, s.value, s.starts_at, s.ends_at]);
  assert.deepEqual(shocks, [['price', 1, t, t + 2], ['output', 0.2, t, t + 6]]);
  assert.equal(PolishProjects.cardAvailable(Q, 'customs_war'), false, 'one decision for the whole war');

  const M = withPortfolios(at(game(), 1925, 8), 'economic');
  const budget = PolishEconomy.budgetAt(M.S, M.time).budget;
  PolishProjects.chooseOption(M, 'customs_war', 'new_markets');
  close(PolishEconomy.budgetAt(M.S, M.time).budget, budget - 1);
  close(PolishEconomy.budgetAt(M.S, M.time + 6).budget - PolishEconomy.budgetAt(M.S, M.time + 6).policy_budget, PolishEconomy.budgetAt(M.S, M.time + 6).budget, 1e-9);

  const C = withPortfolios(at(game(), 1926, 6), 'economic');
  const zln = C.S.actors.relations.zln;
  PolishProjects.chooseOption(C, 'customs_war', 'concessions');
  assert.deepEqual(C.S.economy.shocks.filter(s => s.id === 'customs_war:credit').map(s => s.value), [-6]);
  assert.equal(C.S.actors.relations.zln, Math.max(0, zln - 8));
  const late = withPortfolios(at(game(), 1926, 7), 'economic');
  assert.equal(PolishProjects.cardAvailable(late, 'customs_war'), false, 'the window closes in July 1926');
});

test('Wojna celna w grze 0.94: the urgent card comes into the Government hand by itself and cannot wait for a lucky draw', () => {
  const engine = dendry.startGame();
  const Q = engine.state.qualities;
  withPortfolios(Q, 'economic');
  Q.year = 1925; Q.month = 6; Q.time = PolishRules.timeOf(1925, 6);
  engine.syncUrgentCards();
  assert.ok(dendry.urgentCards(engine).includes('polish_gov_customs_war'));
  assert.equal(dendry.urgentDeck(engine, 'polish_gov_customs_war'), 'main.govt');
});

// Z — 0.94 (the user's decision c of 24 X 2026): the pressure of business eases by 1 in a month in which nothing raised it, to 10.
test('Nacisk przedsiębiorców 0.94: it eases by 1 a month when nothing raised it, never below 10; a raise in the month stops the easing', () => {
  const Q = game();
  const S = Q.S, E = S.economy;
  E.business_pressure = 12;
  settle(Q);
  assert.equal(E.business_pressure, 11);
  PolishEconomy.changeBusinessPressure(S, 3, 'fixture:raise', Q.time, 'fixture');
  settle(Q);
  assert.equal(E.business_pressure, 14, 'no easing in the month of a raise');
  for (let i = 0; i < 8; i++) settle(Q);
  assert.equal(E.business_pressure, 10, 'down to its opening value');
  E.business_pressure = 6;
  settle(Q);
  assert.equal(E.business_pressure, 6, 'a pressure below 10 does not rise back by itself');
});
