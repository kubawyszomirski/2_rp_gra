'use strict';
const assert=require('node:assert/strict');
const clip=(x,a,b)=>Math.max(a,Math.min(b,x));
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const profiles = {
  sikorski:{fiscal:0},witos:{fiscal:-1},
  pilsudski:{army:-2,institution:-2},
  piast: { fiscal: 0, land: 0 }, npr: { fiscal: 0, land: 0 },
  pschd: { fiscal: -1, land: -1 }, zln: { fiscal: -1, land: -1 },
  wyzwolenie: { fiscal: 2, land: 1 }, jewish: { fiscal: 0, land: 0 }, otherMinority: { fiscal: 0, land: 1 },
  grabski: { fiscal: 1 }, grabski_neutral_fiscal: { fiscal: 0 }, skrzynski: { fiscal: 0 },
};
function base(a) {
  assert.ok(profiles[a.actor] && a.demands && Object.keys(a.programme).length);
  const topics = Object.keys(a.programme);
  assert.ok(topics.every(k => Number.isFinite(profiles[a.actor][k])));
  const programFit = 100 * (1 - sum(topics.map(k => Math.abs(profiles[a.actor][k] - a.programme[k]))) / (4 * topics.length));
  const total = sum(a.demands.map(d => d.weight));
  const portfolioFit = total ? 100 * sum(a.demands.filter(d => d.met).map(d => d.weight)) / total : 100;
  return { programFit, portfolioFit,
    value: .25 * a.relation + .35 * programFit + .2 * portfolioFit + .1 * a.credibility - Math.min(30, 5 * (a.breaches ?? 0)) };
}
function evaluate(a) {
  const b = base(a);
  const best = Math.max(0, ...a.alternatives.filter(x => x.hardFeasible).map(x => 100 * clip(base(x).value, 0, 90) / 90));
  const need = a.mode === 'persuade' ? 0 : clip(100 - best + (a.crisisCooperation ?? 0), 0, 100);
  const score = clip(b.value + .1 * need + (a.advisorBonus ?? 0), 0, 100);
  const failures = Object.keys(a.gates).filter(k => !a.gates[k]);
  return { actor: a.actor, score, programFit: b.programFit, portfolioFit: b.portfolioFit, best, need,
    failures, accepted: !failures.length && score >= 60 };
}
const offer = (actor, relation, programme, extra = {}) => ({ actor, relation, programme, credibility: 50,
  demands: [{ weight: 1, met: true }], alternatives: [], gates: {}, ...extra });

module.exports={evaluate,offer,base,profiles};
