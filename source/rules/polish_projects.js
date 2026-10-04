// Polish chapter projects, laws and state cards: the project cycle (12.1–12.8), the procedure of a law
// with the Senate dates (7.2, C4), financing instruments (11.9), the cabinet's own monthly initiative
// (17.16.4), the budget package (17.10), the unemployment bill D (17.15), the three constitutional
// projects (7.6), the government cards of stage 4 (17.11–17.12), the economic events (17.13) and the
// monthly settlement order of 4.2 (docs/POLISH_IMPLEMENTATION_PLAN.md, stage 4). Stage 6 adds the options on
// union branches and plants: collective agreements and derogations, the rescue of a plant, public control and
// workers' representation (17.12, 17.12.5), reaching window.PolishUnions only when they are used.
//
// Plain JavaScript without dependencies. `npm run build` copies it to out/html/; the page loads it
// after polish_government.js as `window.PolishProjects`, and Node tests load it with require(). Costs,
// durations, thresholds and profiles marked P in the reference are taken as written; effects on
// systems of later stages (cell trust and preferences of 5.4, grievance of 15.1, democracy) are kept
// in the project record as `pending_effects` and applied by those stages (decision 4 of stage 4).
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./polish_rules.js'), require('./polish_institutions.js'), require('./polish_economy.js'),
      require('./polish_government.js'), require('./polish_electorate.js'), () => require('./polish_unions.js'),
      () => require('./polish_politics.js'), () => require('./polish_security.js'));
  } else {
    root.PolishProjects = factory(root.PolishRules, root.PolishInstitutions, root.PolishEconomy, root.PolishGovernment, root.PolishElectorate,
      () => root.PolishUnions, () => root.PolishPolitics, () => root.PolishSecurity);
  }
}(typeof self !== 'undefined' ? self : this, function (rules, institutions, economy, government, electorate, lateUnions, latePolitics, lateSecurity) {
  'use strict';

  if (!rules || !institutions || !economy || !government || !electorate) {
    throw new Error('PolishProjects needs polish_rules.js, polish_institutions.js, polish_economy.js, polish_government.js and polish_electorate.js first');
  }

  const copy = value => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
  const clip = (value, low, high) => Math.max(low, Math.min(high, value));
  const compareId = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  const pad = n => String(n).padStart(2, '0');
  const isoOf = t => rules.yearOf(t) + '-' + pad(rules.monthOf(t)) + '-01';
  const timeOfIso = iso => rules.timeOf(+iso.slice(0, 4), +iso.slice(5, 7));
  const round = (value, digits) => Math.round(value * Math.pow(10, digits || 0)) / Math.pow(10, digits || 0);
  const T = rules.timeOf;
  // Polish version (decision 2A): the texts of this module are written in both languages and L picks the current one;
  // numbers get a decimal comma and dates a Polish month in Polish (decision 6A).
  const L = rules.L;
  const PL = () => rules.getLanguage() === 'pl';
  const num = value => (PL() ? String(value).replace('.', ',') : String(value));
  const signed = (value, digits) => {
    const text = Math.abs(value).toFixed(digits === undefined ? 1 : digits);
    return (value > 0 && +text !== 0 ? '+' : value < 0 && +text !== 0 ? '−' : '') + num(text);
  };
  // A law date of the records (ISO) and a month of the game on the screen: '1923-04-01' and 4/1923, or Polish.
  const isoText = iso => (PL() ? rules.dateText(iso) : iso);
  const monthText = (t, form) => (PL() ? rules.monthYear(t, form || 'nom') : rules.monthOf(t) + '/' + rules.yearOf(t));
  const months = n => n + ' ' + L(n === 1 ? 'month' : 'months', rules.plural(n, 'miesiąc', 'miesiące', 'miesięcy'));
  const capital = text => text.charAt(0).toUpperCase() + text.slice(1);
  // Stage 6: the unions module is loaded after this one; the cards of 8.1 and 8.6 reach it only when they are used.
  const unionsModule = () => (lateUnions ? lateUnions() || null : null);
  // Stage 7: politics and the forces of the state are loaded after this module too (cards 8.12–8.14, 17.12.2–6).
  const politicsModule = () => (latePolitics ? latePolitics() || null : null);
  const securityModule = () => (lateSecurity ? lateSecurity() || null : null);

  const PORTFOLIO_SHORT = Object.freeze({labor: 'Labour', interior: 'Interior', finance: 'Treasury', economic: 'Industry and Trade',
    justice: 'Justice', agriculture: 'Agriculture', reichswehr: 'Military Affairs', education: 'Education', foreign: 'Foreign Affairs'});
  const PORTFOLIO_SHORT_PL = Object.freeze({labor: 'Pracy', interior: 'Spraw Wewnętrznych', finance: 'Skarbu', economic: 'Przemysłu i Handlu',
    justice: 'Sprawiedliwości', agriculture: 'Rolnictwa', reichswehr: 'Spraw Wojskowych', education: 'Oświaty', foreign: 'Spraw Zagranicznych'});
  const OK = Object.freeze({available: true, reason: ''});
  const no = reason => ({available: false, reason: reason});

  // ---- Access (8.5) ----------------------------------------------------------------------------------

  const cabinetActive = S => !!S.cabinet && S.cabinet.status === 'active';
  const ppsMember = S => !!S.cabinet && S.cabinet.partner_ids.indexOf('pps') >= 0;
  // ppsCanChoose: PPS owns the required portfolio of an active cabinet. An executor agreement with a
  // partner cannot yet be negotiated in the formation, so in stage 4 only the portfolio gives access (gap).
  const ppsHolds = (S, portfolio) => cabinetActive(S) && ppsMember(S) && S.cabinet.portfolios[portfolio] === 'pps';
  const ppsHoldsAny = (S, portfolios) => portfolios.some(key => ppsHolds(S, key));
  const npcHolds = (S, portfolio) => !!S.cabinet && S.cabinet.portfolios[portfolio] !== 'pps';

  // ---- Project profiles (12.4, 12.6–12.8, 17.12) ---------------------------------------------------

  // build/upkeep: B charged while building / while operating; duration: settlements of full execution.
  // `on_launch: 'operating'` programmes pay from the month their basis takes effect (12.3).
  const PROJECT_TYPES = Object.freeze({
    labor_inspection: {name: 'Labour inspection and working time', card: 'labor_rights', portfolios: ['labor'], klass: 'small',
      investment: false, ongoing: true, caretaker_allowed: true, beneficiaries: ['workers'],
      law: {title: 'Enforcement of working time', programme: {fiscal: 1}},
      variants: {inspection: {build: 1, upkeep: 1, duration: 2}}},
    worker_protection: {name: 'Protection for the unemployed', card: 'social_welfare', portfolios: ['labor'], klass: 'small',
      investment: false, ongoing: true, on_launch: 'operating', caretaker_allowed: true, beneficiaries: ['unemployed'], law: null,
      variants: {full: {build: 0, upkeep: 2, share: 1, relief_start: -6, relief: 2}, focused: {build: 0, upkeep: 1, share: 0.5, relief_start: -6, relief: 2},
        limited: {build: 0, upkeep: 1, share: 1, relief_start: -3, relief: 1}}},
    public_works: {name: 'Public works', card: 'public_works', portfolios: ['labor'], klass: 'large', investment: true, ongoing: true,
      beneficiaries: ['unemployed'], law: null,
      variants: {employment: {build: 2, upkeep: 1, duration: 3, units: 2, output_pp: 0.15},
        infrastructure: {build: 2, upkeep: 1, duration: 4, units: 2, output_pp: 0.25},
        housing: {build: 2, upkeep: 1, duration: 4, units: 0, output_pp: 0, relief: 2, beneficiaries: ['workers']}}},
    credit_instrument: {name: 'Credit instrument', card: 'investment_fund', portfolios: ['finance', 'economic'], klass: 'large',
      investment: true, ongoing: true, beneficiaries: ['workers', 'old_middle'], law: null,
      variants: {public: {build: 2, upkeep: 1, duration: 2, credit_support: 5},
        banks: {build: 1, upkeep: 1, duration: 2, credit_support: 5, business: -8},
        cooperative: {build: 2, upkeep: 1, duration: 2, credit_support: 5, beneficiaries: ['rural', 'old_middle']}}},
    orders: {name: 'Public orders for industry', card: 'industrial_policy', portfolios: ['economic'], klass: 'small', investment: false,
      ongoing: true, on_launch: 'operating', beneficiaries: ['workers'], law: null,
      variants: {orders: {build: 0, upkeep: 1, months: 3, output_pp: 0.30}}},
    land_program: {name: 'Land reform', card: 'land_program', portfolios: ['agriculture'], klass: 'large', investment: true, tranches: 3,
      beneficiaries: ['rural'], law: {title: 'Execution of the land reform'},
      variants: {compensated: {build: 2, upkeep: 0, duration: 4, business: 8, programme: {land: 0}},
        accelerated: {build: 3, upkeep: 0, duration: 3, business: 12, programme: {land: 1}},
        expropriation: {build: 1, upkeep: 0, duration: 4, business: 25, programme: {land: 2}}}},
    agriculture_development: {name: 'Modernisation of agriculture', card: 'agriculture_development', portfolios: ['agriculture'],
      klass: 'large', investment: true, tranches: 3, beneficiaries: ['rural'], law: null,
      variants: {advisory: {build: 1, upkeep: 0, duration: 4, agrarian: -2, rural: 3},
        consolidation: {build: 1, upkeep: 0, duration: 4, agrarian: -2, rural: 2, law: {title: 'Voluntary consolidation of land', programme: {land: 0}}},
        cooperative_processing_sales: {build: 1, upkeep: 0, duration: 4, rural: 2}}},
    education_program: {name: 'Schools and adult education', card: 'education_program', portfolios: ['education'], klass: 'large',
      investment: true, ongoing: true, tranches: 3, law: null, beneficiaries: ['rural'],
      variants: {rural_access: {build: 1, upkeep: 1, duration: 4, trust: 4, beneficiaries: ['rural']},
        urban_worker_adult_access: {build: 1, upkeep: 1, duration: 4, trust: 4, beneficiaries: ['workers']},
        secular: {build: 1, upkeep: 1, duration: 4, tranches: 1, beneficiaries: ['workers', 'new_middle'],
          law: {title: 'Secular school with religious freedom', programme: {church: 1}}}}},
    minority_schools: {name: 'Language rights and minority schools', card: 'minority_school_rights', portfolios: ['education'],
      klass: 'large', investment: true, ongoing: true, law: null, beneficiaries: ['national_minorities'],
      variants: {own_language: {build: 1, upkeep: 1, duration: 4, trust: 4}, agreed_bilingual: {build: 1, upkeep: 1, duration: 4, trust: 4},
        polish_dominance: {build: 1, upkeep: 1, duration: 4, trust: -6}}},
    heritage: {name: 'Wawel or the Royal Castle', card: 'heritage_restoration', portfolios: ['education'], klass: 'small', investment: true,
      law: null, beneficiaries: ['new_middle'],
      variants: {conservation: {klass: 'small', build: 1, upkeep: 0, duration: 2, credibility: 1},
        restoration: {klass: 'large', build: 2, upkeep: 0, duration: 4, credibility: 2, trust: 3}}},
    currency_reform: {name: 'Currency reform', card: 'currency_stabilisation', portfolios: ['finance'], klass: 'large', investment: true,
      beneficiaries: [], law: {title: 'Currency reform', programme: {fiscal: 0}},
      variants: {rapid_cuts: {build: 2, upkeep: 0, duration: 3, credit_shock: 10, shock_months: 3},
        protected: {build: 2, upkeep: 0, duration: 3, credit_shock: 10, shock_months: 3},
        gradual: {build: 1, upkeep: 0, duration: 5, credit_shock: 5, shock_months: 5}}},
    collection: {name: 'Better tax collection', card: 'finance_package', portfolios: ['finance'], klass: 'small', investment: false,
      beneficiaries: [], law: null, variants: {collection: {build: 1, upkeep: 0, duration: 2, permanent: 1}}},
    // Stage 6 (12.4, 17.12, 17.12.5): the rescue of one recorded plant is the rescue variant of the conditional credit,
    // under the owner's agreement that is the condition of the credit (P); representation of the workers of a public plant.
    plant_rescue: {name: 'Rescue of a plant', card: 'industrial_policy', portfolios: ['economic'], klass: 'large', investment: true,
      ongoing: true, beneficiaries: ['workers'], law: null, variants: {rescue: {build: 2, upkeep: 1, duration: 2}}},
    enterprise_representation: {name: 'Workers’ representation in a plant', card: 'industrial_policy', portfolios: ['economic'],
      klass: 'small', investment: false, beneficiaries: ['workers'], law: null,
      variants: {consultative: {build: 0, upkeep: 0, duration: 1},
        decision_rights: {klass: 'large', build: 1, upkeep: 0, duration: 2, law: {title: 'Workers’ co-decision in a public plant', programme: {fiscal: 1}}}}},
    // Stage 7 (12.4, 16.3, 17.12.2–6): the police, civilian control of the army, the review of an abuse and the
    // limited autonomy; their effects on the forces, the police and the restrictions are applied by PolishSecurity
    // and PolishPolitics.
    police_professionalization: {name: 'Professionalisation of the police', card: 'internal_security', portfolios: ['interior'], klass: 'small',
      investment: false, beneficiaries: [], law: null, variants: {professionalization: {build: 1, upkeep: 0, duration: 3}}},
    police_investigation: {name: 'Investigation of a named case', card: 'internal_security', portfolios: ['interior'], klass: 'small',
      investment: false, beneficiaries: [], law: null, variants: {far_right: {build: 1, upkeep: 0, duration: 1}, communist: {build: 1, upkeep: 0, duration: 1}}},
    police_protection: {name: 'Protection of a gathering or an institution', card: 'internal_security', portfolios: ['interior'], klass: 'small',
      investment: false, beneficiaries: [], law: null, variants: {protection: {build: 1, upkeep: 0, duration: 1}}},
    limited_autonomy: {name: 'Limited administrative and cultural autonomy', card: 'internal_security', portfolios: ['interior'], klass: 'large',
      investment: false, beneficiaries: ['other_minorities'], law: {title: 'Limited administrative and cultural autonomy', programme: {autonomy: 1}},
      variants: {autonomy: {build: 1, upkeep: 0, duration: 3}}},
    army_control: {name: 'Civilian control of the army', card: 'military_policy', portfolios: ['reichswehr'], klass: 'large', investment: false,
      beneficiaries: [], law: {title: 'Civilian oversight of the army', programme: {army: 2}},
      variants: {civilian_oversight: {build: 1, upkeep: 0, duration: 3}, personnel_changes: {build: 1, upkeep: 0, duration: 3},
        limited_reform: {build: 1, upkeep: 0, duration: 2, law: {title: 'A limited reform of the command of the army', programme: {army: 0}}}}},
    justice_review: {name: 'Review of a named abuse', card: 'justice_policy', portfolios: ['justice'], klass: 'small', investment: false,
      beneficiaries: [], law: null, variants: {limited_redress: {build: 1, upkeep: 0, duration: 1}}},
    constitution: {name: 'Constitutional reform', card: 'constitution_project', portfolios: [], klass: 'constitutional', investment: true,
      beneficiaries: [], law: {constitutional: true},
      variants: {democratic_guarantees: {build: 1, upkeep: 0, duration: 1, programme: {institution: 2}},
        constructive_vonc: {build: 1, upkeep: 0, duration: 1, programme: {institution: 0}},
        presidential_arbitration: {build: 1, upkeep: 0, duration: 1, programme: {institution: -2}}}},
  });

  const VARIANT_NAMES = Object.freeze({
    inspection: 'inspection and enforcement of working time', full: 'full protection', focused: 'focused on the most needy',
    limited: 'limited benefit', employment: 'quick employment of the unemployed', infrastructure: 'transport and infrastructure',
    housing: 'workers’ housing', public: 'public fund', banks: 'agreement with banks and industry', cooperative: 'cooperative financing',
    orders: 'orders for a threatened industry', compensated: 'parcelation with compensation', accelerated: 'accelerated parcelation with compensation',
    expropriation: 'expropriation without compensation', advisory: 'advice, tools and cooperative modernisation',
    consolidation: 'voluntary consolidation of land', cooperative_processing_sales: 'cooperative processing and sales',
    rural_access: 'village schools', urban_worker_adult_access: 'education of the poor and adults in workers’ centres',
    secular: 'secular school with religious freedom', own_language: 'teaching in the own language', agreed_bilingual: 'agreed bilingualism',
    polish_dominance: 'dominance of the Polish language', conservation: 'limited conservation', restoration: 'wider restoration with public access',
    rapid_cuts: 'rapid stabilisation with cuts', protected: 'stabilisation with protections and a burden on wealth', gradual: 'gradual limitation of emission',
    collection: 'better tax collection', democratic_guarantees: 'democratic guarantees', constructive_vonc: 'constructive vote of no confidence',
    presidential_arbitration: 'presidential arbitration', rescue: 'a conditional credit restoring its lost capacity',
    consultative: 'information and consultation', decision_rights: 'co-decision on mass dismissals and the wage rules',
    professionalization: 'professionalisation and subordination to lawful authorities', far_right: 'violence of the far right',
    communist: 'violence of the communists', protection: 'protection of a named gathering or institution', autonomy: 'limited autonomy of one area',
    civilian_oversight: 'full civilian oversight', personnel_changes: 'lawful changes of personnel', limited_reform: 'a limited reform',
    limited_redress: 'the review of a named abuse',
  });
  // 11.7: the prepared public control of an enterprise, once per plant.
  const PUBLIC_CONTROL_BUSINESS = 15;

  const HERITAGE_OBJECTS = Object.freeze({wawel: 'Wawel', zamek: 'the Royal Castle in Warsaw'});

  // ---- Polish names (decision 2A) and the Polish display of texts the records keep in English (decision 5A) ------

  const PROJECT_NAMES_PL = Object.freeze({labor_inspection: 'Inspekcja pracy i czas pracy', worker_protection: 'Osłona dla bezrobotnych',
    public_works: 'Roboty publiczne', credit_instrument: 'Instrument kredytowy', orders: 'Zamówienia publiczne dla przemysłu',
    land_program: 'Reforma rolna', agriculture_development: 'Modernizacja rolnictwa', education_program: 'Szkoły i oświata dorosłych',
    minority_schools: 'Prawa językowe i szkoły mniejszości', heritage: 'Wawel czy Zamek Królewski', currency_reform: 'Reforma walutowa',
    collection: 'Lepszy pobór podatków', plant_rescue: 'Ratowanie zakładu', enterprise_representation: 'Przedstawicielstwo robotników w zakładzie',
    police_professionalization: 'Profesjonalizacja policji', police_investigation: 'Śledztwo w wymienionej sprawie',
    police_protection: 'Ochrona zgromadzenia albo instytucji', limited_autonomy: 'Ograniczona autonomia administracyjna i kulturalna',
    army_control: 'Cywilna kontrola nad wojskiem', justice_review: 'Rewizja wymienionego nadużycia', constitution: 'Reforma konstytucyjna'});
  const VARIANT_NAMES_PL = Object.freeze({
    inspection: 'inspekcja i egzekwowanie czasu pracy', full: 'pełna osłona', focused: 'skupiona na najbardziej potrzebujących',
    limited: 'ograniczony zasiłek', employment: 'szybkie zatrudnienie bezrobotnych', infrastructure: 'transport i infrastruktura',
    housing: 'mieszkania robotnicze', public: 'fundusz publiczny', banks: 'porozumienie z bankami i przemysłem', cooperative: 'finansowanie spółdzielcze',
    orders: 'zamówienia dla zagrożonego przemysłu', compensated: 'parcelacja z odszkodowaniem', accelerated: 'przyspieszona parcelacja z odszkodowaniem',
    expropriation: 'wywłaszczenie bez odszkodowania', advisory: 'doradztwo, narzędzia i modernizacja spółdzielcza',
    consolidation: 'dobrowolna komasacja gruntów', cooperative_processing_sales: 'spółdzielcze przetwórstwo i sprzedaż',
    rural_access: 'szkoły wiejskie', urban_worker_adult_access: 'oświata ubogich i dorosłych w ośrodkach robotniczych',
    secular: 'szkoła świecka z wolnością religijną', own_language: 'nauczanie we własnym języku', agreed_bilingual: 'uzgodniona dwujęzyczność',
    polish_dominance: 'dominacja języka polskiego', conservation: 'ograniczona konserwacja', restoration: 'szersza restauracja z dostępem publicznym',
    rapid_cuts: 'szybka stabilizacja z cięciami', protected: 'stabilizacja z osłonami i obciążeniem majątku', gradual: 'stopniowe ograniczanie emisji',
    collection: 'lepszy pobór podatków', democratic_guarantees: 'gwarancje demokratyczne', constructive_vonc: 'konstruktywne wotum nieufności',
    presidential_arbitration: 'arbitraż prezydencki', rescue: 'warunkowy kredyt przywracający utracone moce',
    consultative: 'informacja i konsultacja', decision_rights: 'współdecydowanie o masowych zwolnieniach i zasadach płac',
    professionalization: 'profesjonalizacja i podporządkowanie legalnym władzom', far_right: 'przemoc skrajnej prawicy',
    communist: 'przemoc komunistów', protection: 'ochrona wymienionego zgromadzenia albo instytucji', autonomy: 'ograniczona autonomia jednego obszaru',
    civilian_oversight: 'pełny nadzór cywilny', personnel_changes: 'legalne zmiany personalne', limited_reform: 'ograniczona reforma',
    limited_redress: 'rewizja wymienionego nadużycia',
  });
  // Wawel and the Royal Castle in the cases the sentences need: 'Wawel', 'konserwacja Wawelu', 'prace przy Wawelu'.
  const HERITAGE_OBJECTS_PL = Object.freeze({wawel: {nom: 'Wawel', gen: 'Wawelu', loc: 'Wawelu'},
    zamek: {nom: 'Zamek Królewski w Warszawie', gen: 'Zamku Królewskiego w Warszawie', loc: 'Zamku Królewskim w Warszawie'}});
  const projectName = typeId => L(PROJECT_TYPES[typeId].name, PROJECT_NAMES_PL[typeId]);
  const variantName = variantId => L(VARIANT_NAMES[variantId], VARIANT_NAMES_PL[variantId]);
  const heritageName = (object, form) => L(HERITAGE_OBJECTS[object], HERITAGE_OBJECTS_PL[object][form || 'nom']);
  const portfolioShort = key => L(PORTFOLIO_SHORT[key], PORTFOLIO_SHORT_PL[key]);

  // ---- Financing instruments (11.9; card 8.3) -------------------------------------------------------

  // position: the fiscal position of the instrument on the scale of 8.1 (cuts −2 … burden on wealth +2);
  // schedule: [months, B] windows from the effective month; tax: a change of tax_level by one level.
  const INSTRUMENTS = Object.freeze({
    progressive: {name: 'progressive tax on high incomes and wealth', position: 2, law: true, tax: 1, incidence: 'progressive', business: 4, lewica: -3},
    wealth_tax: {name: 'extraordinary wealth tax', position: 2, law: true, schedule: [[6, 2]], business: 8},
    indirect: {name: 'indirect taxes', position: -1, law: true, tax: 1, incidence: 'indirect', lewica: 3,
      pending: {system: 'grievance', stage: 7, value: 3, recipients: 'poor recipients'}},
    broad: {name: 'a broader tax base', position: 0, law: true, tax: 1, incidence: 'broad', business: 4,
      pending: {system: 'grievance', stage: 7, value: 3, recipients: 'the middle class covered'}},
    customs: {name: 'fiscal customs duties', position: -1, law: true, schedule: [[6, 1]],
      shocks: [{channel: 'price', value: 1, months: 2}, {channel: 'credit', value: 3, months: 6}]},
    loan: {name: 'domestic investment loan', position: 0, law: true, schedule: [[6, 3], [12, -1]], min_credit: 40},
    admin_cuts: {name: 'cuts in named administrative spending', position: -1, law: false, schedule: [[6, 1]],
      pending: {system: 'grievance', stage: 7, value: 4, recipients: 'the public employees named'}},
    benefit_cut: {name: 'cut of the unemployment benefit', position: -2, law: true, lewica: 8},
    emission: {name: 'emission financing', position: 0, law: true},
    coinage: {name: 'transitional coinage', position: 0, law: true, months: 3},
  });
  const INSTRUMENT_NAMES_PL = Object.freeze({progressive: 'progresywny podatek od wysokich dochodów i majątku',
    wealth_tax: 'nadzwyczajny podatek majątkowy', indirect: 'podatki pośrednie', broad: 'szersza podstawa opodatkowania',
    customs: 'cła fiskalne', loan: 'wewnętrzna pożyczka inwestycyjna', admin_cuts: 'cięcia wymienionych wydatków administracyjnych',
    benefit_cut: 'cięcie zasiłku dla bezrobotnych', emission: 'finansowanie emisją', coinage: 'przejściowa emisja bilonu'});
  const instrumentName = kind => L(INSTRUMENTS[kind].name, INSTRUMENT_NAMES_PL[kind] || INSTRUMENTS[kind].name);

  // Titles of laws, reasons of a stopped project or a failed law and other texts the records keep in English: their
  // Polish form on the screen (decision 5A). Composite titles are read back from their English parts.
  const LAW_TITLES_PL = Object.freeze({'Enforcement of working time': 'Egzekwowanie czasu pracy', 'Execution of the land reform': 'Wykonanie reformy rolnej',
    'Voluntary consolidation of land': 'Dobrowolna komasacja gruntów', 'Secular school with religious freedom': 'Szkoła świecka z wolnością religijną',
    'Currency reform': 'Reforma walutowa', 'Workers’ co-decision in a public plant': 'Współdecydowanie robotników w zakładzie publicznym',
    'Limited administrative and cultural autonomy': 'Ograniczona autonomia administracyjna i kulturalna',
    'Civilian oversight of the army': 'Cywilny nadzór nad wojskiem', 'A limited reform of the command of the army': 'Ograniczona reforma dowodzenia wojskiem',
    'Constitutional reform': 'Reforma konstytucyjna', 'Cut of the unemployment benefit': 'Cięcie zasiłku dla bezrobotnych'});
  const STORED_PL = Object.freeze({
    'The Sejm rejected the law; the preparation is kept.': 'Sejm odrzucił ustawę; przygotowanie zostaje zachowane.',
    'the law has not yet taken effect': 'ustawa jeszcze nie weszła w życie', 'there is no cabinet': 'nie ma gabinetu',
    'the caretaker cabinet continues only the current payments': 'gabinet tymczasowy kontynuuje tylko bieżące płatności',
    'Stopped: the budget is below −5 B.': 'Wstrzymany: budżet jest poniżej −5 B.',
    'Limited to half: the budget is below −2 B.': 'Ograniczony do połowy: budżet jest poniżej −2 B.',
    'no quorum in the Sejm': 'brak kworum w Sejmie', 'no majority in the Sejm': 'brak większości w Sejmie',
    'the Senate is not yet constituted': 'Senat jeszcze się nie ukonstytuował', 'the Sejm that passed it has ended': 'Sejm, który ją uchwalił, zakończył kadencję',
    'no two-thirds majority in the Senate': 'brak większości dwóch trzecich w Senacie',
    'the Sejm accepted the Senate’s rejection': 'Sejm przyjął odrzucenie ustawy przez Senat',
    'neither majority for the Senate’s amendments nor 11/20 against them': 'nie było większości ani za poprawkami Senatu, ani 11/20 przeciw nim',
    'the self-government of the area': 'samorząd obszaru', 'a public board under Industry and Trade': 'zarząd publiczny podległy resortowi Przemysłu i Handlu',
  });
  const VARIANT_BY_NAME = Object.freeze(Object.keys(VARIANT_NAMES).reduce((map, id) => Object.assign(map, {[VARIANT_NAMES[id]]: id}), {}));
  const INSTRUMENT_BY_NAME = Object.freeze(Object.keys(INSTRUMENTS).reduce((map, id) => Object.assign(map, {[INSTRUMENTS[id].name]: id}), {}));
  const PROJECT_BY_NAME = Object.freeze(Object.keys(PROJECT_TYPES).reduce((map, id) => Object.assign(map, {[PROJECT_TYPES[id].name]: id}), {}));
  const instrumentListPl = text => text.split(', ').map(name => INSTRUMENT_BY_NAME[name] ? INSTRUMENT_NAMES_PL[INSTRUMENT_BY_NAME[name]] : name).join(', ');
  const titlePl = text => LAW_TITLES_PL[text] || (PROJECT_BY_NAME[text] ? PROJECT_NAMES_PL[PROJECT_BY_NAME[text]] : null);
  function storedProjectText(text) {
    if (STORED_PL[text]) return STORED_PL[text];
    if (titlePl(text)) return titlePl(text);
    const kind = INSTRUMENT_BY_NAME[text.charAt(0).toLowerCase() + text.slice(1)];
    if (kind) return capital(INSTRUMENT_NAMES_PL[kind]);
    let m = /^Constitutional reform: (.+)$/.exec(text);
    if (m && VARIANT_BY_NAME[m[1]]) return 'Reforma konstytucyjna: ' + VARIANT_NAMES_PL[VARIANT_BY_NAME[m[1]]];
    m = /^Fiscal package: (.+)$/.exec(text);
    if (m) return 'Pakiet fiskalny: ' + instrumentListPl(m[1]);
    m = /^Public control of the (.+)$/.exec(text);
    if (m) return 'Kontrola publiczna: ' + rules.storedText(m[1]);
    m = /^Protection of the unemployed \((full|limited) variant\)$/.exec(text);
    if (m) return 'Ochrona bezrobotnych (wariant ' + (m[1] === 'full' ? 'pełny' : 'ograniczony') + ')';
    m = /^(.+) \(([^()]+)\)( with (.+))?$/.exec(text);
    if (m && titlePl(m[1]) && VARIANT_BY_NAME[m[2]]) {
      return titlePl(m[1]) + ' (' + VARIANT_NAMES_PL[VARIANT_BY_NAME[m[2]]] + ')' + (m[4] ? ' wraz z: ' + instrumentListPl(m[4]) : '');
    }
    m = /^Stopped: (.+)\.$/.exec(text);
    if (m) return 'Wstrzymany: ' + (STORED_PL[m[1]] || m[1]) + '.';
    m = /^The law failed \((.+)\); the preparation is kept\.$/.exec(text);
    if (m) return 'Ustawa upadła (' + (STORED_PL[m[1]] || m[1]) + '); przygotowanie zostaje zachowane.';
    return undefined;
  }
  rules.registerStoredText(storedProjectText);
  const REGRESSIVE = Object.freeze(['indirect', 'broad', 'customs', 'admin_cuts', 'benefit_cut']);

  // The instrument of this kind that is still running at t (a loan until its service ends).
  function runningInstrument(E, kind, t) {
    return E.policies.filter(policy => policy.kind === kind && policy.status !== 'cancelled' &&
      (policy.budget_schedule && policy.budget_schedule.length ? policy.budget_schedule.some(w => t < (w.to === null ? Infinity : w.to)) :
        (policy.ends_at === null || policy.ends_at === undefined || t < policy.ends_at)) && policy.starts_at <= t + 1)[0] || null;
  }

  // Why one instrument cannot be adopted now; '' when it can.
  function instrumentBlocked(Q, kind) {
    const S = Q.S, E = S.economy, t = Q.time, spec = INSTRUMENTS[kind];
    if (!spec) return L('Unknown instrument.', 'Nieznany instrument.');
    if (spec.tax && E.tax_level >= 3) return L('The tax level is already at its maximum of 3.', 'Poziom podatków jest już na maksimum 3.');
    if (kind === 'wealth_tax' && runningInstrument(E, 'wealth_tax', t)) return L('The wealth tax is already in force; an extension needs its end.', 'Podatek majątkowy już obowiązuje; przedłużenie wymaga jego wygaśnięcia.');
    if (kind === 'customs' && runningInstrument(E, 'customs', t)) return L('The fiscal duties are still in force.', 'Cła fiskalne nadal obowiązują.');
    if (kind === 'admin_cuts' && runningInstrument(E, 'admin_cuts', t)) return L('The administrative cuts are still in force.', 'Cięcia administracyjne nadal obowiązują.');
    if (kind === 'loan') {
      if (E.credit < spec.min_credit) return L('Credit is below 40: the financiers do not agree to a loan.', 'Kredyt jest poniżej 40: finansiści nie zgadzają się na pożyczkę.');
      if (runningInstrument(E, 'loan', t)) return L('The previous loan is still being serviced.', 'Poprzednia pożyczka jest nadal spłacana.');
    }
    if (kind === 'benefit_cut') {
      const protection = operatingProtection(S);
      if (!protection) return L('There is no benefit to cut.', 'Nie ma zasiłku do obcięcia.');
      if (protection.variant === 'limited') return L('The benefit is already limited.', 'Zasiłek jest już ograniczony.');
    }
    if (kind === 'emission') {
      if (E.currency_regime === 'zloty') return L('After the złoty the Treasury has no ordinary emission.', 'Po wprowadzeniu złotego Skarb nie ma zwykłej emisji.');
      if (runningInstrument(E, 'emission', t)) return L('An emission limit is already authorised.', 'Limit emisji jest już zatwierdzony.');
    }
    if (kind === 'coinage') {
      if (E.currency_regime !== 'zloty') return L('Transitional coinage exists only after the stabilisation.', 'Przejściowa emisja bilonu jest możliwa dopiero po stabilizacji.');
      if (runningInstrument(E, 'coinage', t)) return L('The coinage is still in force; it can be renewed after it expires.', 'Emisja bilonu nadal obowiązuje; można ją odnowić po jej wygaśnięciu.');
    }
    return '';
  }

  // The fiscal position of a package: the rounded mean of its instruments (P).
  function packagePosition(kinds, fallback) {
    const positions = kinds.map(kind => INSTRUMENTS[kind].position);
    if (!positions.length) return fallback === undefined ? 0 : fallback;
    return clip(Math.round(positions.reduce((n, p) => n + p, 0) / positions.length), -2, 2);
  }

  function emissionPoints(Q) {
    const forecast = economy.budgetAt(Q.S, Q.time).budget;
    return clip(Math.ceil(-forecast), 1, 3);
  }

  // Applying an instrument from its effective month (11.9): one record per instrument, the tax level as
  // the only source of ordinary taxes, the business reaction once per record (11.7).
  function applyInstrument(Q, kind, m, context) {
    const S = Q.S, E = S.economy, spec = INSTRUMENTS[kind], ctx = context || {};
    const id = 'pol-' + kind + '-' + (E.policies.length + 1) + '-t' + m;
    const policy = {id: id, kind: kind, variant: ctx.variant || null, authorization_id: ctx.law_id || null, starts_at: m, ends_at: null,
      budget_schedule: [], emission_points: 0, beneficiaries: [], effects_applied: [], sponsor: ctx.sponsor || 'cabinet', status: 'active'};
    if (spec.tax) {
      E.tax_level = clip(E.tax_level + spec.tax, -3, 3);
      E.tax_incidence = spec.incidence;
    }
    let from = m;
    for (const window of spec.schedule || []) {
      policy.budget_schedule.push({from: from, to: from + window[0], value: window[1]});
      from += window[0];
    }
    if (policy.budget_schedule.length) policy.ends_at = policy.budget_schedule[policy.budget_schedule.length - 1].to;
    if (kind === 'emission') policy.emission_points = ctx.points || 1;
    if (kind === 'coinage') { policy.emission_points = 1; policy.ends_at = m + spec.months; }
    for (const shock of spec.shocks || []) {
      economy.addShock(E, {id: id + ':' + shock.channel, channel: shock.channel, value: shock.value, starts_at: m, ends_at: m + shock.months});
    }
    if (kind === 'benefit_cut') {
      const protection = operatingProtection(S);
      if (protection) {
        const scope = protection.scope || 1;
        protection.variant = 'limited';
        protection.upkeep_budget_B = PROJECT_TYPES.worker_protection.variants.limited.upkeep * scope;
        protection.history.push({t: m, kind: 'benefit_cut', policy_id: id});
        policy.project_id = protection.id;
      }
    }
    if (spec.business) economy.changeBusinessPressure(S, spec.business, id, m, kind);
    // Faction reactions of 11.9 apply when PPS answers for the instrument (its Treasury or its vote).
    if (spec.lewica && ctx.pps_answers) {
      // Stage 5: the reaction keeps its cause; the policy of a cabinet PPS belongs to can be left (decision 3).
      government.factionReaction(Q, 'lewica', {dissent: spec.lewica}, {id: 'instrument:' + id, kind: 'cabinet_policy',
        reverse: spec.lewica > 0 ? government.cabinetPolicyReverse(S) : null});
    }
    if (spec.pending) policy.pending_effects = [Object.assign({id: id + ':' + spec.pending.system}, spec.pending)];
    E.policies.push(policy);
    S.history.reasons.push({t: m, kind: 'instrument', policy_id: id, instrument: kind, sponsor: policy.sponsor});
    checkConstraints(Q, 'fiscal', spec.position, {instrument: kind, sponsor: policy.sponsor});
    return policy;
  }

  // ---- Rules of agreements against a contrary decision (decision 3 of stage 4; 9.2) ----------------

  // P: a fiscal decision contradicts an agreed position on the other side of zero (q ≥ 1 and p ≤ −1,
  // q ≤ −1 and p ≥ 1) or, for a shared burden (q = 0), a cut of benefits (p = −2). A secular school
  // contradicts an agreed religious compromise (church ≤ 0). A discriminating rule contradicts legal equality.
  function contradicts(topic, agreed, position) {
    if (topic === 'fiscal') return (agreed >= 1 && position <= -1) || (agreed <= -1 && position >= 1) || (agreed === 0 && position <= -2);
    if (topic === 'church') return agreed <= 0 && position >= 1;
    if (topic === 'land') return agreed < 0 && position >= 0;
    if (topic === 'legal_equality') return position === 'discrimination';
    return false;
  }

  function checkConstraints(Q, topic, position, context) {
    const S = Q.S;
    const breached = [];
    for (const id of Object.keys(S.agreements).sort()) {
      const agreement = S.agreements[id];
      if (agreement.status !== 'active' && agreement.status !== 'breached') continue;
      if (!S.cabinet || agreement.cabinet_id !== S.cabinet.id) continue;
      for (const o of agreement.obligations) {
        if (o.kind !== 'constraint' || o.topic !== topic || o.status === 'breached') continue;
        if (!contradicts(topic, o.position, position)) continue;
        if (government.breachConstraint(Q, id, o.id, (context && context.instrument) || topic)) breached.push({agreement_id: id, obligation_id: o.id});
      }
    }
    return breached;
  }

  // ---- Projects (12.1–12.3) ------------------------------------------------------------------------

  // Projects of the stage-4 catalogue; a record of another kind (a test fixture of stage 1) is skipped.
  function projectsOf(S, type, filter) {
    return Object.keys(S.projects).sort().map(id => S.projects[id])
      .filter(p => p && PROJECT_TYPES[p.type] && (!type || p.type === type) && p.status !== 'repealed' && (!filter || filter(p)));
  }

  const liveProject = p => p.status === 'executing' || p.status === 'operating' || p.status === 'paused';
  const preparedProject = p => p.status === 'prepared' || p.status === 'idea';

  function operatingProtection(S) {
    return projectsOf(S, 'worker_protection', p => p.status === 'operating' && p.authorized)[0] || null;
  }

  function currencyProject(S) {
    return projectsOf(S, 'currency_reform')[0] || null;
  }

  function createProject(Q, typeId, variantId, fields) {
    const S = Q.S, type = PROJECT_TYPES[typeId], variant = type.variants[variantId];
    if (!variant) throw new Error('createProject: ' + typeId + ' has no variant ' + variantId);
    const id = 'prj-' + (Object.keys(S.projects).length + 1) + '-' + typeId + '-t' + Q.time;
    const project = {id: id, type: typeId, variant: variantId, card: 'government.' + type.card, klass: variant.klass || type.klass,
      sponsor: 'pps', cabinet_id: S.cabinet ? S.cabinet.id : null, responsibility: {pps: 0},
      beneficiaries: (variant.beneficiaries || type.beneficiaries || []).slice(), scope: 1, tranche: null, policy_choices: {},
      status: 'idea', preparation: 0, authorization_id: null, authorized: false, law_id: null, executor: type.portfolios[0] || 'parliament',
      required_capabilities: type.portfolios.slice(), build_budget_B: variant.build, upkeep_budget_B: variant.upkeep || 0, party_cost_R: 0,
      financing_policy_ids: [], progress: 0, duration_months: variant.duration || variant.months || 0, started_at: null, charge_from: null,
      first_effect_time: null, last_processed_time: null, effects_applied: [], pending_effects: [], obligations_linked: [],
      caretaker_allowed: !!type.caretaker_allowed, interruption_reason: '', investment: !!type.investment, ends_at: null,
      created_at: Q.time, prepared_at: null, launched_at: null, completed_at: null, last_coverage: null, history: [{t: Q.time, kind: 'created'}]};
    Object.assign(project, fields || {});
    S.projects[id] = project;
    return project;
  }

  // PPS's share of the credit, recorded with the project and not only after a good result (5.4): its
  // own portfolio 0.70; authorship without a portfolio (D) 0.40; a vote without authorship 0.15.
  function ppsShare(S, sponsor, portfolios) {
    if (sponsor === 'pps') return portfolios.some(key => ppsHolds(S, key)) ? 0.70 : 0.40;
    return 0;
  }

  function setVariant(project, variantId) {
    const type = PROJECT_TYPES[project.type], variant = type.variants[variantId];
    project.variant = variantId;
    project.klass = variant.klass || type.klass;
    project.build_budget_B = variant.build * (project.scope || 1);
    project.upkeep_budget_B = (variant.upkeep || 0) * (project.scope || 1);
    project.duration_months = variant.duration || variant.months || 0;
    project.beneficiaries = (variant.beneficiaries || type.beneficiaries || []).slice();
  }

  // The law a project needs before it can be executed (7.2): the variant's own law, else the type's.
  function projectLaw(project) {
    const type = PROJECT_TYPES[project.type];
    const variant = type.variants[project.variant];
    const law = variant.law || type.law;
    if (!law) return null;
    return {title: law.title || type.name, programme: law.programme || variant.programme || {fiscal: 0}, constitutional: !!law.constitutional};
  }

  // Preparation of a large reform: idea → prepared, one decision (12.2); the same card again updates the
  // one prepared project of this type instead of a copy.
  function prepareProject(Q, typeId, variantId, fields, options) {
    const S = Q.S, opts = options || {};
    const existing = projectsOf(S, typeId, p => preparedProject(p) && (!opts.match || opts.match(p)))[0] || null;
    const project = existing || createProject(Q, typeId, variantId, fields);
    if (existing) {
      setVariant(existing, variantId);
      Object.assign(existing, fields || {});
    }
    project.status = 'prepared';
    project.preparation = 100;
    project.prepared_at = Q.time;
    project.history.push({t: Q.time, kind: 'prepared', variant: variantId, by: project.sponsor});
    return project;
  }

  // prepared → executing (or operating for payments): the law, the financing and the executor (12.2).
  // Returns the law record when a vote was needed.
  function launchProject(Q, project, options) {
    const S = Q.S, opts = options || {}, t = Q.time;
    const law = projectLaw(project);
    project.launched_at = t;
    project.sponsor = opts.sponsor || project.sponsor;
    project.cabinet_id = S.cabinet ? S.cabinet.id : null;
    project.history.push({t: t, kind: 'launch', by: project.sponsor});
    const type = PROJECT_TYPES[project.type];
    project.status = type.on_launch === 'operating' ? 'operating' : 'executing';
    project.started_at = t;
    project.charge_from = t;
    if (type.on_launch === 'operating') project.first_effect_time = t;
    if (project.type === 'orders') project.ends_at = t + PROJECT_TYPES.orders.variants.orders.months;
    const variant = type.variants[project.variant];
    if (!law) {
      // Without a law the reaction comes with the decision; with one, when the law is adopted (12.6).
      if (variant.business) economy.changeBusinessPressure(S, variant.business, project.id + ':business', t, project.type);
      authorize(Q, project, t, 'competence');
      return null;
    }
    const bill = submitLaw(Q, {kind: 'project', title: law.title + ' (' + VARIANT_NAMES[project.variant] + ')', project_id: project.id,
      sponsor: project.sponsor === 'pps' ? 'pps' : 'cabinet', programme: law.programme, constitutional: law.constitutional,
      pps_vote: opts.pps_vote, flags: opts.flags});
    project.law_id = bill.id;
    project.authorization_id = bill.id;
    if (bill.status === 'rejected') {
      project.status = 'prepared';
      project.started_at = null;
      project.charge_from = null;
      project.first_effect_time = null;
      project.ends_at = null;
      project.interruption_reason = 'The Sejm rejected the law; the preparation is kept.';
      project.history.push({t: t, kind: 'law_rejected', law_id: bill.id});
    }
    return bill;
  }

  function authorize(Q, project, m, authorizationId) {
    project.authorized = true;
    project.authorization_id = authorizationId || project.authorization_id;
    if (project.started_at === null || project.started_at < m) {
      project.started_at = m;
      project.charge_from = m;
      if (PROJECT_TYPES[project.type].on_launch === 'operating') project.first_effect_time = m;
      if (project.type === 'orders') project.ends_at = m + PROJECT_TYPES.orders.variants.orders.months;
    }
    project.history.push({t: m, kind: 'authorized', by: project.authorization_id});
    if (project.type === 'currency_reform') {
      const E = Q.S.economy;
      if (E.currency_regime === 'marka') E.currency_regime = 'stabilizing';
      const variant = PROJECT_TYPES.currency_reform.variants[project.variant];
      economy.addShock(E, {id: project.id + ':credit', channel: 'credit', value: variant.credit_shock, starts_at: m, ends_at: m + variant.shock_months});
    }
  }

  // stateCanExecute of 8.5: a valid authorisation, the competent executor, an active cabinet or a
  // caretaker cabinet for the current payments it may continue. No PPS minister is required.
  function stateCanExecute(Q, project) {
    const cabinet = Q.S.cabinet;
    if (!project.authorized) return {ok: false, reason: 'the law has not yet taken effect'};
    if (!cabinet) return {ok: false, reason: 'there is no cabinet'};
    if (cabinet.status === 'active') return {ok: true, reason: ''};
    if (cabinet.status === 'caretaker' && project.caretaker_allowed) return {ok: true, reason: ''};
    return {ok: false, reason: 'the caretaker cabinet continues only the current payments'};
  }

  function completeProject(Q, project, t) {
    const type = PROJECT_TYPES[project.type];
    project.progress = 100;
    project.completed_at = t;
    project.first_effect_time = project.investment ? t + 1 : t;
    project.status = type.ongoing && (project.upkeep_budget_B > 0 || project.type === 'labor_inspection') ? 'operating' : 'completed';
    project.history.push({t: t, kind: 'completed', first_effect_time: project.first_effect_time});
  }

  function pend(project, effect) {
    const id = project.id + ':' + effect.system + ':' + (effect.when || 'effect');
    if (project.pending_effects.some(e => e.id === id)) return;
    project.pending_effects.push(Object.assign({id: id, beneficiaries: project.beneficiaries.slice()}, effect));
  }

  function applyOnce(project, key, fn) {
    if (project.effects_applied.indexOf(key) >= 0) return false;
    project.effects_applied.push(key);
    fn();
    return true;
  }

  // One-off effects at the first effect (12.3, 12.6–12.8, 7.6); payment programmes at their first payment.
  function firstEffects(Q, project, t, inputs, coverage) {
    const S = Q.S, type = PROJECT_TYPES[project.type], variant = type.variants[project.variant];
    applyOnce(project, 'first', () => {
      if (project.type === 'land_program') {
        inputs.land_units += 1;
        pend(project, {system: 'grievance', stage: 7, value: -4, when: 'first_effect', note: 'recipients of the tranche, once'});
      } else if (project.type === 'agriculture_development') {
        if (variant.agrarian) inputs.agrarian_delta += variant.agrarian;
        // One tranche covers a third of the countryside (P): its conditions change the rural index by a third.
        if (variant.rural) S.society.rural_improvements = (S.society.rural_improvements || 0) + variant.rural / 3;
      } else if (project.type === 'education_program' || project.type === 'minority_schools') {
        if (variant.trust) pend(project, {system: 'trust', stage: 5, value: variant.trust, when: 'first_effect'});
        if (project.type === 'minority_schools' && project.variant !== 'polish_dominance') executedMinorityAgreements(Q, project);
      } else if (project.type === 'heritage') {
        if (project.sponsor === 'pps') government.changeCredibility(Q, 'heritage:' + project.policy_choices.object, variant.credibility, 'heritage');
        if (variant.trust) pend(project, {system: 'trust', stage: 5, value: variant.trust, when: 'first_effect', note: 'intelligentsia covered'});
      } else if (project.type === 'currency_reform') {
        // The regime changes at the start of the period, before the budget (startOfPeriod).
      } else if (project.type === 'collection') {
        const policy = {id: 'pol-collection-' + (S.economy.policies.length + 1) + '-t' + t, kind: 'collection', variant: null,
          authorization_id: project.id, starts_at: t + 1, ends_at: null, budget_schedule: [{from: t + 1, to: null, value: 1}],
          emission_points: 0, beneficiaries: [], effects_applied: [], sponsor: project.sponsor, status: 'active'};
        S.economy.policies.push(policy);
      } else if (project.type === 'constitution') {
        enactReform(Q, project.variant, project, t);
      } else if (project.type === 'labor_inspection') {
        pend(project, {system: 'grievance', stage: 7, value: -3, when: 'first_operation', scale: coverage, note: 'recipients, × execution'});
      } else if (project.type === 'worker_protection') {
        pend(project, {system: 'grievance', stage: 7, value: variant.relief_start, when: 'first_payment', scale: coverage,
          share: variant.share, note: 'the initial relief, once at the first real payment'});
      } else if (project.type === 'plant_rescue') {
        restorePlant(Q, project, t);
      } else if (project.type === 'enterprise_representation') {
        representationEffects(Q, project, t);
      } else if (project.type === 'police_professionalization') {
        securityModule().professionalized(Q, project, t);
      } else if (project.type === 'police_investigation') {
        securityModule().investigated(Q, project, t);
      } else if (project.type === 'police_protection') {
        securityModule().protectionExecuted(Q, project, coverage, t);
      } else if (project.type === 'army_control') {
        securityModule().armyControlled(Q, project, t);
      } else if (project.type === 'justice_review') {
        reviewDecided(Q, project, t);
      } else if (project.type === 'limited_autonomy') {
        autonomyEffects(Q, project, t);
      }
    });
  }

  // ---- Stage 7: the review of an abuse, autonomy and the cards of the Interior and of Military Affairs ------------

  // The review of 17.12.3 reads the active restrictions of S.politics; one review per restriction.
  function reviewTarget(S) {
    if (!S.politics) return null;
    const busy = projectsOf(S, 'justice_review', p => liveProject(p) || p.status === 'completed').map(p => p.policy_choices.restriction_id);
    return Object.keys(S.politics.restrictions).sort().map(id => S.politics.restrictions[id])
      .filter(r => r.status === 'active' && busy.indexOf(r.id) < 0)[0] || null;
  }

  // The competent organ reads the legal profile: a confirmed unlawful act lifts only this restriction; without grounds
  // the review ends without relief. It never clears all repression (17.12.3).
  function reviewDecided(Q, project, t) {
    const S = Q.S, r = S.politics && S.politics.restrictions[project.policy_choices.restriction_id];
    if (!r) return;
    const unlawful = !r.lawful;
    project.policy_choices.result = unlawful ? 'unlawful' : 'no_grounds';
    if (unlawful) politicsModule().liftRestriction(Q, r.id, 'limited_redress');
    S.history.reasons.push({t: t, kind: 'justice_review', project_id: project.id, restriction_id: r.id, result: project.policy_choices.result});
  }

  // 17.12.6 (P): the delegation of schools, the official language and cultural institutions to the self-government of
  // one synthetic area; −3 grievance once for its covered population, half of the other minorities' cells.
  const AUTONOMY_SHARE = 0.5;
  const AUTONOMY_CAPABILITIES = Object.freeze(['schools', 'official_language', 'culture']);

  function delegation(S, capability) {
    const list = S.politics && S.politics.delegations ? S.politics.delegations : [];
    return list.filter(d => d.status === 'in_force' && d.capabilities.indexOf(capability) >= 0)[0] || null;
  }

  function autonomyEffects(Q, project, t) {
    const S = Q.S;
    if (!S.politics) return;
    S.politics.delegations = S.politics.delegations || [];
    if (S.politics.delegations.some(d => d.project_id === project.id)) return;
    S.politics.delegations.push({id: 'delegation-' + project.id, project_id: project.id, territory_id: 'synthetic_autonomy_area',
      recipient_authority_id: 'the self-government of the area', capabilities: AUTONOMY_CAPABILITIES.slice(), authorization_id: project.authorization_id,
      since: t, status: 'in_force'});
    pend(project, {system: 'grievance', stage: 7, value: -3, when: 'first_effect', share: AUTONOMY_SHARE, note: 'the covered population of the area'});
    // The executed delegation is recorded with the agreement that opened it; its obligations keep their own projects.
    const agreement = project.policy_choices.agreement_id ? S.agreements[project.policy_choices.agreement_id] : null;
    if (agreement) agreement.history.push({t: t, kind: 'autonomy_executed', project_id: project.id});
  }

  // The agreement that opens the autonomy (17.12.6): an agreed point with the representation of the other minorities.
  function autonomyAgreement(S) {
    return Object.keys(S.agreements).sort().map(id => S.agreements[id]).filter(a => (a.status === 'active' || a.status === 'breached') &&
      a.parties.indexOf('other_minorities_rep') >= 0 && (a.obligations || []).some(o => o.topic === 'language_rights' || o.topic === 'school_rights'))[0] || null;
  }

  // Cases an investigation can take up: the label names the case, not a proof of guilt (Z — 0.37).
  const CASE_LABELS = Object.freeze({investigate_far_right: 'far_right', investigate_communist: 'communist'});

  function caseLabel(c) {
    if (c.label) return c.label;
    return c.kind === 'communist_violence' ? 'communist' : c.kind === 'unconstitutional_violence' || c.kind === 'far_right_violence' ? 'far_right' : null;
  }

  function investigationTarget(S, label) {
    if (!S.politics) return null;
    const busy = projectsOf(S, 'police_investigation', p => liveProject(p) || p.status === 'completed').map(p => p.policy_choices.case_id);
    return Object.keys(S.politics.cases).sort().map(id => S.politics.cases[id])
      .filter(c => c.status === 'open' && !c.investigation && caseLabel(c) === label && busy.indexOf(c.id) < 0)[0] || null;
  }

  // The protection of a named gathering: an active strike or an open gathering of the month (16.3, 17.2).
  function protectionTarget(Q) {
    const S = Q.S, unions = unionsModule();
    const strike = unions ? unions.records(S, ['active', 'settlement_pending'])[0] : null;
    if (strike && !(S.security.protections[strike.id] && S.security.protections[strike.id].t === Q.time)) {
      return {id: strike.id, name: L('the strike ' + strike.id, 'strajk ' + strike.id)};
    }
    const gathering = S.politics ? Object.keys(S.politics.cases).map(id => S.politics.cases[id]).filter(c => c.kind === 'gathering' && c.status === 'open')[0] : null;
    return gathering ? {id: gathering.id, name: rules.storedText(gathering.subject)} : null;
  }

  function securityOptionStatus(Q, option) {
    const S = Q.S;
    if (!securityModule() || !S.security || !S.politics) return no(L('Needs the forces of the state of stage 7.', 'Wymaga sił państwa z etapu 7.'));
    if (option === 'professionalization') {
      if (projectsOf(S, 'police_professionalization').length) return no(L('The professionalisation is done once in the chapter; it is under way or completed.', 'Profesjonalizację przeprowadza się raz w rozdziale; już trwa albo została zakończona.'));
      return forecastWith(Q, {charge: 1}) >= -2 ? OK : no(forecastBlock());
    }
    if (CASE_LABELS[option]) {
      if (!investigationTarget(S, CASE_LABELS[option])) return no(L('Needs an open, named case of this kind with its evidence; none is recorded.', 'Wymaga otwartej, wymienionej sprawy tego rodzaju wraz z dowodami; żadna nie jest zapisana.'));
      return forecastWith(Q, {charge: 1}) >= -2 ? OK : no(forecastBlock());
    }
    if (option === 'police_protection') {
      if (!protectionTarget(Q)) return no(L('Needs a named gathering or institution to protect this month and a lawful task.', 'Wymaga wymienionego zgromadzenia albo instytucji do ochrony w tym miesiącu oraz legalnego zadania.'));
      return forecastWith(Q, {charge: 1}) >= -2 ? OK : no(forecastBlock());
    }
    if (option === 'limited_autonomy') {
      if (projectsOf(S, 'limited_autonomy').length) return no(L('The autonomy of this area is prepared, under way or in force.', 'Autonomia tego obszaru jest przygotowana, w toku albo już obowiązuje.'));
      if (!autonomyAgreement(S)) return no(L('Needs an agreed point with the representation of the other national minorities (17.12.6).', 'Wymaga uzgodnionego punktu z reprezentacją pozostałych mniejszości narodowych (17.12.6).'));
      return OK;
    }
    return no(L('Unknown option.', 'Nieznana opcja.'));
  }

  function securityChoose(Q, option) {
    const S = Q.S, fields = {sponsor: 'pps', responsibility: {pps: 0.70}};
    if (option === 'professionalization') {
      const project = createProject(Q, 'police_professionalization', 'professionalization', fields);
      launchProject(Q, project, {sponsor: 'pps'});
      return result(Q, L('The professionalisation of the police starts: 1 B for three months, then command and lawful compliance +10 once.',
        'Rusza profesjonalizacja policji: 1 B przez trzy miesiące, potem jednorazowo dowodzenie i praworządność +10.'));
    }
    if (CASE_LABELS[option]) {
      const c = investigationTarget(S, CASE_LABELS[option]);
      const project = createProject(Q, 'police_investigation', CASE_LABELS[option], Object.assign({policy_choices: {case_id: c.id}}, fields));
      launchProject(Q, project, {sponsor: 'pps'});
      return result(Q, L('The Interior investigates the case: ' + c.subject + '. 1 B for one month; the label names the case, not a proof of guilt.',
        'Resort Spraw Wewnętrznych bada sprawę: ' + rules.storedText(c.subject) + '. 1 B przez jeden miesiąc; etykieta nazywa sprawę, a nie dowodzi winy.'));
    }
    if (option === 'police_protection') {
      const target = protectionTarget(Q);
      const project = createProject(Q, 'police_protection', 'protection', Object.assign({policy_choices: {case_id: target.id}}, fields));
      launchProject(Q, project, {sponsor: 'pps'});
      // It protects the gathering of this month at once; the settlement then measures its execution (× coverage).
      securityModule().protectionExecuted(Q, project, 1, Q.time);
      return result(Q, L('The police protect ' + target.name + ' this month: 1 B, the capacity of protection +10 times its execution.',
        'Policja chroni w tym miesiącu: ' + target.name + '. 1 B; zdolność ochrony +10 razy stopień wykonania.'));
    }
    prepareProject(Q, 'limited_autonomy', 'autonomy', Object.assign({policy_choices: {territory_id: 'synthetic_autonomy_area',
      recipient_authority_id: 'the self-government of the area', delegated_capabilities: AUTONOMY_CAPABILITIES.slice(),
      agreement_id: autonomyAgreement(S).id}}, fields));
    return result(Q, L('The limited autonomy of one area is prepared: its law and launch wait in the agenda, then 1 B a month for three months.',
      'Ograniczona autonomia jednego obszaru jest przygotowana: jej ustawa i uruchomienie czekają w agendzie, potem 1 B miesięcznie przez trzy miesiące.'));
  }

  // Cards 7.5 and 8.14 share one project of civilian control for the one synthetic post over the near reserve.
  const ARMY_VARIANTS = Object.freeze({civilian_oversight: 'civilian_oversight', personnel_changes: 'personnel_changes',
    organizational_compromise: 'limited_reform', limited_reform: 'limited_reform'});

  function armyProject(S) {
    return projectsOf(S, 'army_control')[0] || null;
  }

  function armyVariantStatus(Q, variant) {
    const S = Q.S, project = armyProject(S);
    if (!securityModule() || !S.security || !S.security.forces.length) return no(L('Needs the forces of the state of stage 7.', 'Wymaga sił państwa z etapu 7.'));
    if (project && !preparedProject(project)) return no(L('The reform of this scope is under way or done; its effects come once.', 'Reforma tego zakresu jest w toku albo zakończona; jej skutki przychodzą raz.'));
    if (project && project.variant === variant) return no(L('This variant is already prepared; launch it from the agenda.', 'Ten wariant jest już przygotowany; uruchom go z agendy.'));
    return OK;
  }

  function armyOptionStatus(Q, option) {
    return armyVariantStatus(Q, ARMY_VARIANTS[option]);
  }

  function armyChoose(Q, option, via) {
    const S = Q.S, variant = ARMY_VARIANTS[option];
    const fields = {sponsor: 'pps', responsibility: {pps: via === 'parliament' ? 0.40 : 0.70},
      policy_choices: {force_id: securityModule().OVERSIGHT_FORCE, position_id: 'synthetic_oversight_post', via: via || 'military_affairs'}};
    const project = prepareProject(Q, 'army_control', variant, fields);
    project.policy_choices = Object.assign({}, project.policy_choices, fields.policy_choices);
    return result(Q, L('Civilian control of the army is prepared (' + VARIANT_NAMES[variant] + '): its law and launch wait in the agenda, then 1 B a month for ' +
      project.duration_months + ' months.', 'Cywilna kontrola nad wojskiem jest przygotowana (' + VARIANT_NAMES_PL[variant] + '): jej ustawa i uruchomienie ' +
      'czekają w agendzie, potem 1 B miesięcznie przez ' + months(project.duration_months) + '.'));
  }

  // Card 7.5 of the Parliament deck: at a prepared project or a concrete military case; 1 T; no cooldown, and a refused
  // law is not filed again unchanged (Z — 0.36).
  function armyOversightAvailable(Q) {
    const S = Q.S;
    if (!S || S.chapter.status === 'ended' || !S.politics || government.formationPending(Q)) return false;
    const pol = politicsModule();
    const project = armyProject(S);
    return !!(pol && pol.openMilitaryCase(S)) || !!(project && preparedProject(project));
  }

  function armyOversightStatus(Q, option) {
    if (!armyOversightAvailable(Q)) return no(L('Needs a prepared project or a concrete military case.', 'Wymaga przygotowanego projektu albo konkretnej sprawy wojskowej.'));
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    return armyVariantStatus(Q, ARMY_VARIANTS[option]);
  }

  const ARMY_OVERSIGHT_OPTIONS = Object.freeze(['civilian_oversight', 'limited_reform']);

  function armyOversightView(Q) {
    for (const option of ARMY_OVERSIGHT_OPTIONS) Q['pl_ao_' + option + '_why'] = armyOversightStatus(Q, option).reason;
    const pol = politicsModule(), c = pol ? pol.openMilitaryCase(Q.S) : null, project = armyProject(Q.S);
    Q.pl_ao_line = (c ? L('Open military case: ' + c.subject + '. ', 'Otwarta sprawa wojskowa: ' + rules.storedText(c.subject) + '. ') : '') +
      (project ? describeProject(project, Q.S) : L('No project of civilian control yet.', 'Nie ma jeszcze projektu kontroli cywilnej.'));
    Q.pl_gc_result = '';
  }

  function armyOversightChoose(Q, option) {
    const status = armyOversightStatus(Q, option);
    if (!status.available) throw new Error('armyOversightChoose: ' + status.reason);
    rules.commitMainAction(Q, 'parliament.army_oversight.' + option, {option: option});
    return armyChoose(Q, option, 'parliament');
  }

  // ---- Plants of stage 6 (decision 2A; 17.12, 17.12.5) -------------------------------------------------

  // Plant records are written by PolishUnions (synthetic_plants_v1); the cards of 8.1 and 8.6 act on them.
  const PLANT_HINT = 'plants are recorded by a credit crisis, an active reaction of business or a strike ended by exhaustion';
  const PLANT_HINT_PL = 'zakład zapisuje kryzys kredytowy, aktywna reakcja przedsiębiorców albo strajk zakończony wyczerpaniem';
  // P: Industry and Trade acts on the plants of industry and the railway workshops; an estate of farm labour is
  // not within its competence.
  const INDUSTRY_PLANT_BRANCHES = Object.freeze(['industry', 'rail']);

  function plantOf(S, id) {
    return S.enterprises && id ? S.enterprises.records[id] || null : null;
  }

  function plantList(S, filter) {
    if (!S.enterprises) return [];
    return Object.keys(S.enterprises.records).sort().map(id => S.enterprises.records[id]).filter(filter);
  }

  // stored = true: the English name that the records of S keep (decision 5A); otherwise the name on the screen.
  function plantLabel(plant, stored) {
    const unions = unionsModule();
    return unions ? unions.plantName(plant, stored) : plant.id;
  }

  const industryPlant = p => INDUSTRY_PLANT_BRANCHES.indexOf(p.branch) >= 0;

  function rescueTarget(S) {
    return plantList(S, p => industryPlant(p) && p.lost_capacity > 0 && !p.rescue_project_id)[0] || null;
  }

  function publicControlTarget(S) {
    return plantList(S, p => industryPlant(p) && p.owner === 'private' && !p.public_act_id)[0] || null;
  }

  function representationTarget(S, variant) {
    return plantList(S, p => industryPlant(p) && p.owner === 'public' && (variant === 'decision_rights' ?
      !(p.representation && p.representation.variant === 'decision_rights') && !p.codecision_project_id : !p.representation))[0] || null;
  }

  function rescueStatus(Q) {
    const S = Q.S;
    if (projectsOf(S, 'plant_rescue', p => preparedProject(p) && p.sponsor === 'pps').length) return no(L('A rescue is already prepared; launch it from the agenda.', 'Ratunek jest już przygotowany; uruchom go z agendy.'));
    if (!rescueTarget(S)) return no(L('Needs a recorded plant of industry or a railway workshop that has lost capacity and has no rescue yet; ' + PLANT_HINT + '.',
      'Wymaga zapisanego zakładu przemysłowego albo warsztatu kolejowego, który stracił moce i nie ma jeszcze ratunku; ' + PLANT_HINT_PL + '.'));
    return OK;
  }

  function publicControlStatus(Q) {
    if (!publicControlTarget(Q.S)) return no(L('Needs a recorded private plant of industry or a railway workshop without a pending act; ' + PLANT_HINT + '.',
      'Wymaga zapisanego prywatnego zakładu przemysłowego albo warsztatu kolejowego bez toczącego się aktu; ' + PLANT_HINT_PL + '.'));
    return OK;
  }

  const REPRESENTATION_BLOCK = 'Needs a public plant, after an act of public control; an owner’s agreement with a private plant cannot yet be negotiated in this chapter.';

  function representationStatus(Q, variant) {
    const S = Q.S;
    const variants = variant ? [variant] : ['consultative', 'decision_rights'];
    const reasons = [];
    for (const v of variants) {
      if (v === 'decision_rights' && projectsOf(S, 'enterprise_representation', p => p.variant === 'decision_rights' && preparedProject(p)).length) {
        reasons.push(L('Co-decision is already prepared; launch it from the agenda.', 'Współdecydowanie jest już przygotowane; uruchom je z agendy.'));
        continue;
      }
      if (representationTarget(S, v)) return OK;
      const any = plantList(S, p => industryPlant(p) && p.owner === 'public');
      reasons.push(!any.length ? L(REPRESENTATION_BLOCK, 'Wymaga zakładu publicznego, po akcie kontroli publicznej; porozumienia z właścicielem zakładu ' +
        'prywatnego nie da się jeszcze wynegocjować w tym rozdziale.') : v === 'consultative' ?
        L('Every public plant already has its workers’ representation.', 'Każdy zakład publiczny ma już przedstawicielstwo robotników.') :
        L('Every public plant already has co-decision or has it under way.', 'Każdy zakład publiczny ma już współdecydowanie albo jest ono w toku.'));
    }
    return no(reasons[0]);
  }

  // The finished rescue restores the recorded lost capacity of its plant once, with no universal bonus (12.4).
  function restorePlant(Q, project, t) {
    const plant = plantOf(Q.S, project.policy_choices.plant_id);
    if (!plant) return;
    plant.capacity = 100;
    plant.lost_capacity = 0;
    plant.status = 'rescued';
    plant.rescued_at = t;
    // The owner's commitment to keep the plant and its workers is settled after the execution (17.12).
    plant.employment_commitment = {since: t, status: 'active', project_id: project.id};
    plant.history.push({t: t, kind: 'rescued', project_id: project.id});
  }

  // 17.12.5: one representation record per plant. Consultation −2 grievance of its workers, co-decision −4, an
  // upgrade only the missing −2; a repeated choice gives nothing (pending for stage 7).
  function representationEffects(Q, project, t) {
    const plant = plantOf(Q.S, project.policy_choices.plant_id);
    if (!plant) return;
    const variant = project.variant, before = plant.representation ? plant.representation.variant : null;
    if (before === variant || before === 'decision_rights') return;
    plant.representation = {variant: variant, project_id: project.id, worker_actor_id: 'union:' + plant.branch, beneficiaries: ['workers'],
      information: true, covered_decisions: variant === 'decision_rights' ? ['mass dismissals', 'changes of the wage rules'] :
        ['changes of the conditions of employment, consulted without a veto'], since: t};
    const relief = variant === 'decision_rights' ? (before === 'consultative' ? -2 : -4) : -2;
    pend(project, {system: 'grievance', stage: 7, value: relief, when: 'first_effect', share: plant.workers_share,
      note: 'the workers of the ' + plantLabel(plant, true) + (before ? ', the missing difference' : '')});
    plant.history.push({t: t, kind: 'representation', variant: variant, project_id: project.id});
  }

  // 17.12.5: a decision named in co-decision needs the consent of the workers' representation; under consultation a
  // refusal is recorded but does not block, and a decision outside the covered list is never blocked.
  function plantDecisionStatus(Q, plantId, decision, workersConsent) {
    const plant = plantOf(Q.S, plantId);
    if (!plant) return no(L('Unknown plant.', 'Nieznany zakład.'));
    const rep = plant.representation;
    if (!rep || rep.variant !== 'decision_rights' || rep.covered_decisions.indexOf(decision) < 0 || workersConsent) return OK;
    return no(L('The workers’ representation of the ' + plantLabel(plant) + ' refuses its consent to ' + decision + '.',
      'Przedstawicielstwo robotników (' + plantLabel(plant) + ') nie zgadza się na: ' + ({'mass dismissals': 'masowe zwolnienia',
        'changes of the wage rules': 'zmiany zasad płac'}[decision] || decision) + '.'));
  }

  function publicControlEnacted(Q, bill, m) {
    const S = Q.S, plant = plantOf(S, bill.plant_id);
    if (!plant) return;
    plant.owner = 'public';
    plant.public_act_id = bill.id;
    plant.management = 'a public board under Industry and Trade';
    plant.history.push({t: m, kind: 'public_control', law_id: bill.id});
    economy.changeBusinessPressure(S, PUBLIC_CONTROL_BUSINESS, 'public_control:' + plant.id, m, 'public_control');
  }

  // The monthly execution of every project (12.3) for the budget of period t. Returns the inputs of the
  // economy of 11.5–11.6, each scaled once by execution; public works are bounded to 8 units together.
  function processProjects(Q, t, budgetReading) {
    const S = Q.S;
    const delivery = economy.fiscalDelivery(budgetReading.budget);
    const inputs = {works_units: 0, works_output_pp: 0, credit_support: 0, orders_output_pp: 0, land_units: 0, agrarian_delta: 0};
    const works = [];
    for (const id of Object.keys(S.projects).sort()) {
      const project = S.projects[id];
      if (!project || !PROJECT_TYPES[project.type] || !project.authorized) continue;
      if (project.status === 'completed') {
        if (project.first_effect_time === t) firstEffects(Q, project, t, inputs, 1);
        continue;
      }
      if (!liveProject(project)) continue;
      if (project.started_at !== null && t < project.started_at) continue;
      const can = stateCanExecute(Q, project);
      const coverage = can.ok ? (project.status === 'paused' ? 0 : delivery) : 0;
      project.last_coverage = coverage;
      project.last_processed_time = t;
      project.interruption_reason = !can.ok ? 'Stopped: ' + can.reason + '.' : coverage === 0 ? 'Stopped: the budget is below −5 B.' :
        coverage < 1 ? 'Limited to half: the budget is below −2 B.' : '';
      if (project.status === 'executing') {
        project.progress = Math.min(100, project.progress + (100 / project.duration_months) * coverage);
        if (project.progress >= 100 - 1e-9) completeProject(Q, project, t);
      }
      if (project.status === 'completed' && project.first_effect_time === t) {
        firstEffects(Q, project, t, inputs, coverage);
        continue;
      }
      if (project.status !== 'operating' || project.first_effect_time === null || project.first_effect_time > t) continue;
      // A payment's first relief comes with the first real payment; other effects at the first effect.
      if (project.effects_applied.indexOf('first') < 0 && (coverage > 0 || project.investment)) firstEffects(Q, project, t, inputs, coverage);
      const variant = PROJECT_TYPES[project.type].variants[project.variant];
      if (project.type === 'public_works' && variant.units) {
        works.push({units: variant.units * (project.scope || 1) * coverage, pp: variant.output_pp});
      } else if (project.type === 'credit_instrument') {
        inputs.credit_support += variant.credit_support * coverage;
      } else if (project.type === 'orders') {
        inputs.orders_output_pp += variant.output_pp * coverage;
        if (project.ends_at !== null && t >= project.ends_at - 1) {
          project.status = 'completed';
          project.history.push({t: t, kind: 'contract_ended'});
        }
      }
    }
    // 11.5: at most 8 units together; one common factor scales both contributions once.
    const units = works.reduce((n, w) => n + w.units, 0);
    const scale = units > 8 ? 8 / units : 1;
    inputs.works_units = units * scale;
    inputs.works_output_pp = works.reduce((n, w) => n + w.units * w.pp, 0) * scale;
    return inputs;
  }

  // At the start of a period, before its budget: the finished currency reform changes the regime to the
  // złoty and closes the ordinary emission of the Treasury (11.4).
  function startOfPeriod(Q, t) {
    const S = Q.S, E = S.economy;
    for (const project of projectsOf(S, 'currency_reform')) {
      if (project.first_effect_time === t && E.currency_regime !== 'zloty' && project.progress >= 100) {
        E.currency_regime = 'zloty';
        for (const policy of E.policies) {
          if (policy.kind === 'emission' && (policy.ends_at === null || policy.ends_at > t)) policy.ends_at = t;
        }
        S.history.reasons.push({t: t, kind: 'currency_regime', regime: 'zloty', project_id: project.id});
      }
    }
  }

  // ---- The procedure of a law (7.2, C4) ------------------------------------------------------------

  function billOffer(S, bill) {
    const cabinet = S.cabinet;
    return {by: bill.sponsor === 'pps' ? 'pps' : 'npc', kind: 'bill', programme: bill.programme, flags: bill.flags || [],
      members: cabinet ? cabinet.partner_ids.slice() : [], supporters: cabinet ? cabinet.supporter_ids.slice() : [],
      lead_party: cabinet ? cabinet.party : null, minority_terms: [], portfolios: cabinet ? cabinet.portfolios : {},
      configuration_id: cabinet ? cabinet.configuration_id : null};
  }

  // How one club votes on a bill (C4): the parties bound to the cabinet vote for its bills unless a bill
  // crosses their red line; the other clubs by their view of the programme (≥60 for, <40 against,
  // otherwise abstain); KPP and "Inne" abstain; PPS votes as decided.
  function clubVote(S, clubId, bill, offer) {
    if (clubId === 'pps') return bill.pps_vote;
    const cabinet = S.cabinet;
    const bound = cabinet && (cabinet.status === 'active' || cabinet.status === 'caretaker') ? cabinet.partner_ids.concat(cabinet.supporter_ids) : [];
    if (clubId === 'kpp' || !government.ACTOR_PROFILES[clubId]) return 'abstain';
    if (government.redLineViolations(clubId, offer).length) return 'no';
    if (bill.sponsor === 'cabinet' && bound.indexOf(clubId) >= 0) return 'yes';
    const stance = government.programmeStance(S, clubId, offer);
    return stance >= 60 ? 'yes' : stance < 40 ? 'no' : 'abstain';
  }

  function ppsDefaultVote(Q, bill) {
    const S = Q.S;
    if (bill.sponsor === 'pps') return 'yes';
    if (government.ppsBound(S)) return 'yes';
    const stance = government.programmeStance(S, 'pps', billOffer(S, bill));
    return stance >= 60 ? 'yes' : stance < 40 ? 'no' : 'abstain';
  }

  function sejmCounts(Q, bill, programme) {
    const S = Q.S;
    const offer = billOffer(S, Object.assign({}, bill, {programme: programme || bill.programme}));
    const clubVotes = {};
    let yes = 0, no = 0, abstain = 0;
    for (const club of S.parliament.clubs) {
      const vote = clubVote(S, club.id, bill, offer);
      clubVotes[club.id] = {vote: vote, seats: club.seats};
      if (vote === 'yes') yes += club.seats; else if (vote === 'no') no += club.seats; else abstain += club.seats;
    }
    const total = S.parliament.clubs.reduce((n, club) => n + club.seats, 0);
    return {yes: yes, no: no, abstain: abstain, present: total, eligible: total, club_votes: clubVotes};
  }

  // The simplified Senate (6.4) has the party proportions of the Sejm result; each party votes as its
  // club does on the same text at the date of the review (P). The two minority segments share the
  // senators of their bloc 1/3 and 2/3.
  function senateCounts(Q, bill, programme) {
    const S = Q.S;
    const sejm = sejmCounts(Q, bill, programme);
    const seats = S.senate.club_seats || {};
    let yes = 0, no = 0, abstain = 0;
    const partyVotes = {};
    for (const party of Object.keys(seats).sort()) {
      const n = seats[party] || 0;
      if (!n) continue;
      const clubs = S.parliament.clubs.filter(club => (club.electoral_party_id || club.id) === party);
      const shares = clubs.length > 1 && party === 'minorities_bloc' ? institutions.splitMinorities(n) : null;
      for (const club of clubs.length ? clubs : [{id: party}]) {
        const part = shares ? shares[club.id] || 0 : (clubs.length ? n / clubs.length : n);
        const vote = sejm.club_votes[club.id] ? sejm.club_votes[club.id].vote : 'abstain';
        partyVotes[club.id] = {vote: vote, seats: part};
        if (vote === 'yes') yes += part; else if (vote === 'no') no += part; else abstain += part;
      }
    }
    const total = S.senate.total || 0;
    return {yes: yes, no: no, abstain: abstain, present: total, eligible: total, club_votes: partyVotes};
  }

  function recordBallot(Q, rule, bill, counts, suffix) {
    const ballot = institutions.resolveBallot(rule, Object.assign({id: 'ballot-' + bill.id + '-' + suffix, issue_id: bill.id, law_id: bill.id}, counts));
    Q.S.ballots.push(ballot);
    bill.ballot_ids.push(ballot.id);
    return ballot;
  }

  // Submitting a law: the Sejm votes at once in the decision; then the dated Senate procedure. Before
  // the Senate is constituted (the first chapter until the 1922 result) the law takes effect with the
  // Sejm vote (P): no fictitious Senate is used (7.2).
  function submitLaw(Q, spec) {
    const S = Q.S, t = Q.time;
    const bill = {id: 'law-' + (S.parliament.laws.length + 1) + '-t' + t, kind: spec.kind, title: spec.title,
      project_id: spec.project_id || null, package_id: spec.package_id || null, sponsor: spec.sponsor || 'cabinet',
      cabinet_id: S.cabinet ? S.cabinet.id : null, chamber_id: S.parliament.chamber_id, programme: copy(spec.programme),
      flags: (spec.flags || []).slice(), variant: spec.variant || null, weaker_variant: spec.weaker_variant || null,
      weaker_programme: spec.weaker_programme ? copy(spec.weaker_programme) : null,
      rule: spec.constitutional ? 'constitutional' : 'ordinary', status: 'in_procedure', submitted_at: isoOf(t), submitted_t: t,
      ballot_ids: [], senate: null, senate_notice_due: null, senate_return_due: null, amendment: null, effective_at: null,
      enacted_variant: null, next_step: null, pps_vote: null, compromise_scope: spec.compromise_scope || null, closed_at: null,
      reason: '', instrument: spec.instrument || null, points: spec.points || 0};
    if (spec.plant_id) bill.plant_id = spec.plant_id;
    bill.pps_vote = spec.pps_vote || ppsDefaultVote(Q, bill);
    S.parliament.laws.push(bill);
    const counts = sejmCounts(Q, bill);
    const ballot = recordBallot(Q, bill.rule === 'constitutional' ? 'constitutional_amendment_sejm' : 'ordinary_resolution', bill, counts, 'sejm');
    if (ballot.result !== 'passed') {
      closeLaw(Q, bill, 'rejected', ballot.result === 'no_quorum' ? 'no quorum in the Sejm' : 'no majority in the Sejm');
      return bill;
    }
    if (S.senate.status !== 'constituted') {
      if (bill.rule === 'constitutional') {
        closeLaw(Q, bill, 'rejected', 'the Senate is not yet constituted');
        return bill;
      }
      bill.senate = 'not_constituted';
      enactLaw(Q, bill, bill.submitted_at, bill.variant);
      return bill;
    }
    bill.senate_notice_due = institutions.addDays(bill.submitted_at, 30);
    bill.senate_return_due = institutions.addDays(bill.submitted_at, 60);
    bill.next_step = 'senate';
    return bill;
  }

  function closeLaw(Q, bill, status, reason) {
    bill.status = status;
    bill.reason = reason || '';
    bill.closed_at = Q.time;
    bill.next_step = null;
    lawClosedHooks(Q, bill);
  }

  function enactLaw(Q, bill, iso, variant) {
    bill.status = 'enacted';
    bill.effective_at = iso;
    bill.enacted_variant = variant || bill.variant;
    bill.next_step = null;
    bill.closed_at = Q.time;
    lawEnactedHooks(Q, bill, timeOfIso(iso));
  }

  // The dated steps of the laws in procedure, chronologically up to the end of the settled period t,
  // before the finances of 4.2. The +30 step never triggers the +60 step early.
  function processLaws(Q, t) {
    const S = Q.S;
    for (const bill of S.parliament.laws) {
      if (bill.status !== 'in_procedure') continue;
      if (bill.chamber_id !== S.parliament.chamber_id) {
        closeLaw(Q, bill, 'expired', 'the Sejm that passed it has ended');
        continue;
      }
      if (bill.next_step === 'senate' && timeOfIso(bill.senate_notice_due) <= t) {
        const constitutional = bill.rule === 'constitutional';
        const ballot = recordBallot(Q, constitutional ? 'constitutional_amendment_senate' : 'senate_review', bill, senateCounts(Q, bill), 'senate');
        if (ballot.result === 'passed') {
          bill.senate = 'accepted';
          enactLaw(Q, bill, bill.senate_notice_due, bill.variant);
          continue;
        }
        if (constitutional) {
          bill.senate = 'rejected';
          closeLaw(Q, bill, 'rejected', 'no two-thirds majority in the Senate');
          continue;
        }
        bill.senate = 'amendments';
        bill.amendment = bill.weaker_variant ? {variant: bill.weaker_variant, programme: bill.weaker_programme} : {variant: null, reject: true};
        bill.next_step = 'return';
      }
      if (bill.next_step === 'return' && timeOfIso(bill.senate_return_due) <= t) returnVote(Q, bill);
    }
  }

  // On the return date (+60): the Sejm accepts the Senate's amendments by a simple majority; if not, it
  // rejects them by 11/20; without either majority the law falls (7.2; C4: no extra scene).
  function returnVote(Q, bill) {
    const S = Q.S;
    const original = sejmCounts(Q, bill);
    const amended = bill.amendment.reject ? null : sejmCounts(Q, bill, bill.amendment.programme);
    const acceptCounts = {yes: 0, no: 0, abstain: 0, club_votes: {}};
    const keepCounts = {yes: 0, no: 0, abstain: 0, club_votes: {}};
    for (const club of S.parliament.clubs) {
      const was = original.club_votes[club.id].vote;
      let prefersAmendment;
      if (bill.amendment.reject) prefersAmendment = was === 'no' ? 1 : was === 'yes' ? -1 : 0;
      else {
        const now = amended.club_votes[club.id].vote;
        const score = v => (v === 'yes' ? 1 : v === 'no' ? -1 : 0);
        prefersAmendment = Math.sign(score(now) - score(was));
        // PPS supports an amendment only within the compromise recorded at its decision (17.15).
        if (club.id === 'pps') prefersAmendment = bill.compromise_scope === bill.amendment.variant ? 1 : -1;
        if (bill.sponsor === 'cabinet' && was === 'yes' && club.id !== 'pps') prefersAmendment = prefersAmendment > 0 ? 0 : -1;
      }
      const add = (counts, vote) => {
        counts.club_votes[club.id] = {vote: vote, seats: club.seats};
        if (vote === 'yes') counts.yes += club.seats; else if (vote === 'no') counts.no += club.seats; else counts.abstain += club.seats;
      };
      add(acceptCounts, prefersAmendment > 0 ? 'yes' : prefersAmendment < 0 ? 'no' : 'abstain');
      add(keepCounts, prefersAmendment < 0 ? 'yes' : prefersAmendment > 0 ? 'no' : 'abstain');
    }
    const total = S.parliament.clubs.reduce((n, club) => n + club.seats, 0);
    const accept = recordBallot(Q, 'ordinary_resolution', bill, Object.assign({present: total, eligible: total}, acceptCounts), 'accept-amendments');
    if (accept.result === 'passed') {
      if (bill.amendment.reject) closeLaw(Q, bill, 'rejected', 'the Sejm accepted the Senate’s rejection');
      else enactLaw(Q, bill, bill.senate_return_due, bill.amendment.variant);
      return;
    }
    const keep = recordBallot(Q, 'senate_amendment_rejection', bill, Object.assign({present: total, eligible: total}, keepCounts), 'reject-amendments');
    if (keep.result === 'passed') enactLaw(Q, bill, bill.senate_return_due, bill.variant);
    else closeLaw(Q, bill, 'rejected', 'neither majority for the Senate’s amendments nor 11/20 against them');
  }

  // ---- What an enacted or failed law does --------------------------------------------------------------

  function lawEnactedHooks(Q, bill, m) {
    const S = Q.S;
    if (bill.project_id && S.projects[bill.project_id]) {
      const project = S.projects[bill.project_id];
      if (project.type === 'constitution') {
        project.status = 'executing';
        project.started_at = m;
        project.charge_from = m;
        project.launched_at = project.launched_at || m;
      }
      authorize(Q, project, m, bill.id);
      const variant = PROJECT_TYPES[project.type].variants[project.variant];
      if (variant.business) economy.changeBusinessPressure(S, variant.business, project.id + ':business', m, project.type);
      if (project.type === 'land_program' && project.policy_choices.access === 'polish_majority') {
        checkConstraints(Q, 'legal_equality', 'discrimination', {instrument: 'land_access'});
        pend(project, {system: 'trust', stage: 5, value: -6, when: 'law', note: 'excluded cells'});
      }
      if (project.type === 'education_program' && project.variant === 'secular') checkConstraints(Q, 'church', 1, {instrument: 'secular_school'});
    }
    if (bill.package_id) applyPackage(Q, bill.package_id, m);
    if (bill.kind === 'unemployment_bill') billEnacted(Q, bill, m);
    if (bill.kind === 'instrument') {
      applyInstrument(Q, bill.instrument, m, {law_id: bill.id, sponsor: bill.sponsor, points: bill.points,
        pps_answers: bill.sponsor === 'pps' || bill.pps_vote === 'yes'});
    }
    if (bill.kind === 'public_control') publicControlEnacted(Q, bill, m);
    S.history.reasons.push({t: m, kind: 'law_enacted', law_id: bill.id, title: bill.title, variant: bill.enacted_variant});
  }

  function lawClosedHooks(Q, bill) {
    const S = Q.S;
    if (bill.project_id && S.projects[bill.project_id]) {
      const project = S.projects[bill.project_id];
      if (bill.status !== 'enacted' && !project.authorized) {
        project.status = 'prepared';
        project.started_at = null;
        project.charge_from = null;
        project.first_effect_time = null;
        project.interruption_reason = 'The law failed (' + bill.reason + '); the preparation is kept.';
        project.history.push({t: Q.time, kind: 'law_' + bill.status, law_id: bill.id});
        if (project.type === 'constitution') project.rejected_forecast = forecastKey(Q, project);
        else if (project.type === 'army_control') project.rejected_forecast = lawForecastKey(Q, project);
      }
    }
    if (bill.kind === 'unemployment_bill' && S.chapter.unemployment_bill) {
      const record = S.chapter.unemployment_bill;
      record.status = bill.status === 'expired' ? 'expired' : 'rejected';
      record.next_step = null;
    }
    if (bill.package_id) packageFailed(Q, bill.package_id, bill);
    if (bill.kind === 'public_control' && bill.status !== 'enacted') {
      const plant = plantOf(S, bill.plant_id);
      if (plant && plant.public_act_id === bill.id) plant.public_act_id = null;
      if (plant) plant.history.push({t: Q.time, kind: 'public_control_' + bill.status, law_id: bill.id});
    }
    S.history.reasons.push({t: Q.time, kind: 'law_' + bill.status, law_id: bill.id, reason: bill.reason});
  }

  // ---- Fiscal packages and the Budget card (decision 5 of stage 4; 17.10, 17.16.4) -----------------

  function newPackage(Q, spec) {
    const S = Q.S, E = S.economy, t = Q.time;
    const pkg = {id: 'pkg-' + (E.packages.length + (E.pending_package ? 2 : 1)) + '-t' + t, cabinet_id: S.cabinet.id, proposed_at: t,
      vote_at: t + 1, instruments: spec.instruments.slice(), project_id: spec.project_id || null, necessary: !!spec.necessary,
      reason: spec.reason, revision_of: spec.revision_of || null, pps_answer: null, pps_vote: null, evaluations: [],
      position: packagePosition(spec.instruments, spec.position), status: 'pending', law_id: null, title: spec.title || null};
    E.pending_package = pkg;
    S.history.reasons.push({t: t, kind: 'package_proposed', package_id: pkg.id, instruments: pkg.instruments, necessary: pkg.necessary});
    return pkg;
  }

  // The mandatory vote of a package in the settlement after it was proposed; PPS votes as it answered
  // with the Budget card, otherwise as its role binds it.
  function voteDuePackage(Q, t) {
    const S = Q.S, E = S.economy, pkg = E.pending_package;
    if (!pkg || pkg.vote_at > t) return null;
    E.pending_package = null;
    if (!S.cabinet || S.cabinet.id !== pkg.cabinet_id || S.cabinet.status !== 'active') {
      pkg.status = 'lapsed';
      E.packages.push(pkg);
      return pkg;
    }
    E.packages.push(pkg);
    const lawNeeded = pkg.project_id ? !!projectLaw(S.projects[pkg.project_id]) : true;
    const needsVote = lawNeeded || pkg.instruments.some(kind => INSTRUMENTS[kind].law);
    if (!needsVote) {
      pkg.status = 'passed';
      applyPackage(Q, pkg.id, t);
      return pkg;
    }
    const project = pkg.project_id ? S.projects[pkg.project_id] : null;
    const title = pkg.title || ('Fiscal package: ' + pkg.instruments.map(kind => INSTRUMENTS[kind].name).join(', '));
    const programme = project && projectLaw(project) ? Object.assign({}, projectLaw(project).programme, {fiscal: pkg.position}) : {fiscal: pkg.position};
    if (project) {
      project.launched_at = t;
      project.sponsor = 'cabinet';
      project.cabinet_id = S.cabinet.id;
      project.status = PROJECT_TYPES[project.type].on_launch === 'operating' ? 'operating' : 'executing';
      project.started_at = t;
      project.charge_from = t;
    }
    const bill = submitLaw(Q, {kind: 'package', title: title, package_id: pkg.id, project_id: pkg.project_id, sponsor: 'cabinet',
      programme: programme, pps_vote: pkg.pps_vote || undefined});
    pkg.law_id = bill.id;
    if (bill.status !== 'rejected') {
      pkg.status = bill.status === 'enacted' ? 'passed' : 'in_procedure';
      // The partners who voted against a package that burdens their programme: unagreedBurdenPoints (P).
      const ballot = S.ballots.filter(b => b.id === bill.ballot_ids[0])[0];
      for (const id of S.cabinet.agreement_ids) {
        const agreement = S.agreements[id];
        if (!agreement || (agreement.status !== 'active' && agreement.status !== 'breached')) continue;
        for (const party of agreement.parties) {
          if (party === 'pps' || !ballot.club_votes[party] || ballot.club_votes[party].vote !== 'no') continue;
          const ideal = (government.profileOf(party) || {ideals: {}}).ideals.fiscal || 0;
          const distance = Math.abs(ideal - pkg.position);
          if (distance >= 2) agreement.history.push({t: t, kind: 'unagreed_burden', points: Math.min(3, distance - 1), package_id: pkg.id});
        }
      }
    }
    return pkg;
  }

  function applyPackage(Q, packageId, m) {
    const S = Q.S, E = S.economy;
    const pkg = E.packages.filter(p => p.id === packageId)[0];
    if (!pkg || pkg.applied) return;
    pkg.applied = true;
    pkg.status = 'passed';
    const ppsAnswers = pkg.pps_vote === 'yes' || (!pkg.pps_vote && government.ppsBound(S));
    for (const kind of pkg.instruments) {
      applyInstrument(Q, kind, m, {law_id: pkg.law_id, sponsor: 'cabinet', points: kind === 'emission' ? 2 : 0, pps_answers: ppsAnswers});
    }
    if (pkg.project_id && S.projects[pkg.project_id] && !S.projects[pkg.project_id].authorized) authorize(Q, S.projects[pkg.project_id], m, pkg.law_id || 'package');
    if (E.package_revision && (E.package_revision.original_id === pkg.revision_of || E.package_revision.original_id === pkg.id)) E.package_revision = null;
  }

  // A refused necessary package: one revision at the next review; a refused revision or no feasible
  // variant ends in the premier's resignation (17.16.4).
  function packageFailed(Q, packageId, bill) {
    const S = Q.S, E = S.economy;
    const pkg = E.packages.filter(p => p.id === packageId)[0];
    if (!pkg) return;
    pkg.status = 'failed';
    if (pkg.project_id && S.projects[pkg.project_id] && !S.projects[pkg.project_id].authorized) {
      const project = S.projects[pkg.project_id];
      project.status = 'prepared';
      project.started_at = null;
      project.charge_from = null;
    }
    if (!pkg.necessary) return;
    if (pkg.revision_of) {
      E.package_revision = null;
      resignOverPackage(Q, pkg, 'the revised package was refused');
      return;
    }
    E.package_revision = {original_id: pkg.id, reason: pkg.reason, instruments: pkg.instruments.slice(), project_id: pkg.project_id,
      refused_at: Q.time, bill_reason: bill ? bill.reason : ''};
  }

  function resignOverPackage(Q, pkg, reason) {
    const S = Q.S;
    if (!S.cabinet || S.cabinet.id !== pkg.cabinet_id || S.cabinet.status !== 'active') return;
    S.history.reasons.push({t: Q.time, kind: 'cabinet_resigns_over_package', package_id: pkg.id, reason: reason});
    government.cabinetFalls(Q, 'resignation');
    government.writeGovernmentMirrors(Q);
  }

  // canUseBudgetCard of 17.10: an active cabinet, a pending package of this cabinet, PPS a member or a
  // supporter with current support; one answer per package, 0 T (a response to another's mandatory offer).
  function budgetCardAvailable(Q) {
    const S = Q.S;
    if (!S || S.chapter.status === 'ended' || !S.economy) return false;
    const pkg = S.economy.pending_package;
    if (!pkg || pkg.pps_answer || !cabinetActive(S) || pkg.cabinet_id !== S.cabinet.id) return false;
    const stance = government.ppsStance(S);
    return stance === 'member' || stance === 'supporter';
  }

  function budgetOffer(Q, kinds) {
    const S = Q.S;
    const offer = government.cabinetAsOffer(S);
    offer.by = 'pps';
    offer.kind = 'support_demand';
    offer.programme = Object.assign({}, S.cabinet.programme || {}, {fiscal: packagePosition(kinds, 0)});
    return offer;
  }

  // The package after a PPS condition (Z — 0.36): protect drops the benefit cut; wealth replaces the
  // burdens on broad groups with a progressive or wealth tax; loan replaces cuts with a domestic loan.
  function conditionedInstruments(Q, option) {
    const S = Q.S, E = S.economy, pkg = E.pending_package, t = Q.time;
    const kinds = pkg.instruments.slice();
    if (option === 'protect') return kinds.filter(kind => kind !== 'benefit_cut');
    if (option === 'wealth') {
      const kept = kinds.filter(kind => REGRESSIVE.indexOf(kind) < 0);
      const tax = E.tax_level < 3 ? 'progressive' : (!runningInstrument(E, 'wealth_tax', t) ? 'wealth_tax' : null);
      return tax ? kept.concat([tax]) : null;
    }
    if (option === 'loan') return kinds.filter(kind => kind !== 'admin_cuts' && kind !== 'benefit_cut').concat(['loan']);
    return kinds;
  }

  function budgetOptionStatus(Q, option) {
    const S = Q.S, E = S.economy, pkg = E.pending_package, t = Q.time;
    if (!budgetCardAvailable(Q)) return no(L('There is no package to answer.', 'Nie ma pakietu, na który trzeba odpowiedzieć.'));
    if (option === 'support' || option === 'refuse') return OK;
    if (option === 'protect') return pkg.instruments.indexOf('benefit_cut') >= 0 ? OK : no(L('The package cuts no benefits.', 'Pakiet nie tnie zasiłków.'));
    if (option === 'wealth') {
      if (!pkg.instruments.some(kind => REGRESSIVE.indexOf(kind) >= 0)) return no(L('The package puts no burden on broad groups to shift.', 'Pakiet nie nakłada na szerokie grupy obciążeń, które można by przenieść.'));
      if (E.tax_level >= 3 && runningInstrument(E, 'wealth_tax', t)) return no(L('The tax level is at 3 and the wealth tax is already in force.', 'Poziom podatków wynosi 3, a podatek majątkowy już obowiązuje.'));
      return OK;
    }
    if (option === 'loan') {
      if (!pkg.instruments.some(kind => kind === 'admin_cuts' || kind === 'benefit_cut')) return no(L('The package has no cuts to replace.', 'Pakiet nie ma cięć do zastąpienia.'));
      const blocked = instrumentBlocked(Q, 'loan');
      return blocked ? no(blocked) : OK;
    }
    return no(L('Unknown option.', 'Nieznana opcja.'));
  }

  // One answer: the partners evaluate a PPS condition by 8.3; accepted, the package changes and PPS
  // votes for it; refused, PPS keeps its condition and votes against. Support and refusal need no
  // evaluation. If the PPS votes were needed, a refusal means the package falls.
  function answerBudget(Q, option) {
    const S = Q.S, E = S.economy, pkg = E.pending_package;
    const status = budgetOptionStatus(Q, option);
    if (!status.available) throw new Error('answerBudget: ' + status.reason);
    government.syncRelations(Q);
    pkg.pps_answer = option;
    S.history.actions.push({t: Q.time, action_id: 'parliament.finance_amendment.' + option, package_id: pkg.id, cost_t: 0});
    if (option === 'support') { pkg.pps_vote = 'yes'; return {accepted: true, option: option}; }
    if (option === 'refuse') { pkg.pps_vote = 'no'; return {accepted: false, option: option}; }
    const kinds = conditionedInstruments(Q, option);
    const offer = budgetOffer(Q, kinds);
    const evaluations = government.demandEvaluators(S).map(id => government.evaluatePartner(S, id, offer, government.governmentNeed(Q, id, offer)));
    const accepted = evaluations.length > 0 && evaluations.every(e => e.accept);
    pkg.evaluations = evaluations;
    if (accepted) {
      pkg.instruments = kinds;
      pkg.position = packagePosition(kinds, pkg.position);
      pkg.pps_vote = 'yes';
    } else {
      pkg.pps_vote = 'no';
    }
    return {accepted: accepted, option: option, evaluations: evaluations};
  }

  function budgetView(Q) {
    const S = Q.S, pkg = S.economy.pending_package;
    if (!pkg) return null;
    const forecast = economy.budgetAt(S, Q.time);
    return {
      package: pkg.instruments.length ? pkg.instruments.map(instrumentName).join('; ') : L('no new instruments', 'brak nowych instrumentów'),
      project: pkg.project_id && S.projects[pkg.project_id] ? projectName(S.projects[pkg.project_id].type) + ' (' +
        variantName(S.projects[pkg.project_id].variant) + ')' : '',
      reason: L(PACKAGE_REASONS[pkg.reason], PACKAGE_REASONS_PL[pkg.reason]) || pkg.reason,
      necessary: pkg.necessary,
      forecast: signed(round(forecast.budget, 2), 2) + L(' B this month', ' B w tym miesiącu'),
      vote: monthText(pkg.vote_at, 'gen'),
    };
  }

  const PACKAGE_REASONS = Object.freeze({
    payments: 'current legal payments are not fully financed', deficit: 'the budget has fallen below −2 B', stabilisation: 'the currency reform',
    credit: 'the credit crisis', revision: 'the revision of a refused package', obligation: 'a promise of the cabinet',
  });
  const PACKAGE_REASONS_PL = Object.freeze({
    payments: 'bieżące płatności ustawowe nie są w pełni sfinansowane', deficit: 'budżet spadł poniżej −2 B', stabilisation: 'reforma walutowa',
    credit: 'kryzys kredytowy', revision: 'rewizja odrzuconego pakietu', obligation: 'obietnica gabinetu',
  });

  // ---- The cabinet's own initiative (17.16.4, economic part; decision 1 of stage 4) ------------------

  // Short programmes of the profiles (P): the order of revenue proposals and the stabilisation variant.
  const CABINET_PROFILES = Object.freeze({
    expert: {revenue: ['broad', 'admin_cuts'], stabilisation: 'gradual', stabilisation_financing: []},
    grabski: {revenue: ['broad', 'admin_cuts'], stabilisation: 'rapid_cuts', stabilisation_financing: ['admin_cuts', 'wealth_tax'], credit_necessary: true},
    skrzynski: {revenue: ['broad', 'wealth_tax'], stabilisation: 'gradual', stabilisation_financing: []},
    right: {revenue: ['broad', 'admin_cuts'], stabilisation: 'rapid_cuts', stabilisation_financing: ['admin_cuts']},
    left: {revenue: ['progressive', 'wealth_tax'], stabilisation: 'protected', stabilisation_financing: ['wealth_tax']},
    broad: {revenue: ['broad', 'wealth_tax'], stabilisation: 'gradual', stabilisation_financing: []},
  });

  function cabinetProfile(cabinet) {
    // 9.7: a toleration by PPS for a loan and limited cuts changes Grabski's variant to the gradual one.
    if (cabinet.pm === 'grabski' && cabinet.stabilisation_terms === 'loan') {
      return Object.assign({}, CABINET_PROFILES.grabski, {stabilisation: 'gradual', stabilisation_financing: ['loan']});
    }
    // 9.7 (stage 6): protections and a heavier burden on wealth — stabilisation with protections, the wealth tax first.
    if (cabinet.pm === 'grabski' && cabinet.stabilisation_terms === 'protections') {
      return Object.assign({}, CABINET_PROFILES.grabski, {revenue: ['wealth_tax', 'broad'], stabilisation: 'protected', stabilisation_financing: ['wealth_tax']});
    }
    if (cabinet.pm === 'grabski') return CABINET_PROFILES.grabski;
    if (cabinet.pm === 'skrzynski') return CABINET_PROFILES.skrzynski;
    const config = cabinet.configuration_id;
    if (config === 'chjeno_piast') return CABINET_PROFILES.right;
    if (['pps_majority', 'left_minority', 'left_labour', 'centre_left', 'united_left', 'workers_front'].indexOf(config) >= 0) return CABINET_PROFILES.left;
    if (['broad_centre', 'national_unity', 'skrzynski_broad'].indexOf(config) >= 0) return CABINET_PROFILES.broad;
    return CABINET_PROFILES.expert;
  }

  function financialCrisis(S) {
    const E = S.economy;
    return economy.fiscalCrisis(E) || economy.currencyCrisis(E) || !!currencyProject(S);
  }

  function nextRevenue(Q, profile, exclude) {
    return profile.revenue.filter(kind => (exclude || []).indexOf(kind) < 0 && !instrumentBlocked(Q, kind))[0] || null;
  }

  function cabinetTxn(Q, t, kind, detail) {
    const S = Q.S;
    const txn = {id: 'cab-' + S.cabinet.id + '-t' + t + '-' + kind, action_id: 'cabinet.' + kind, instance_id: null, source: 'cabinet', time: t,
      input_revision: S.turn.action_serial, phase: 'settled', resource_cost: {}, transfers: [], effects: [detail || {}], cooldowns: {},
      consumes_month: false, selected_options: [], cabinet_id: S.cabinet.id};
    S.history.actions.push(txn);
    return txn;
  }

  // Obligations of this cabinet that it executes itself: due promises in portfolios PPS does not hold.
  function dueObligationStep(Q, t) {
    const S = Q.S, cabinet = S.cabinet;
    const candidates = [];
    for (const id of cabinet.agreement_ids) {
      const agreement = S.agreements[id];
      if (!agreement || (agreement.status !== 'active' && agreement.status !== 'breached')) continue;
      for (const o of agreement.obligations) {
        // Stage 8: an accepted compromise with Piłsudski is the cabinet's own initiative (16.7 accepted executor).
        if (o.required_military && government.liveObligation(o) && (o.fulfillment || 0) < 1 && o.status !== 'void') {
          candidates.push(o);
          continue;
        }
        if (!o.required_project || o.required_project === 'constitution' || !government.liveObligation(o) || (o.fulfillment || 0) >= 1) continue;
        if (o.portfolio && !npcHolds(S, o.portfolio)) continue;
        candidates.push(o);
      }
    }
    candidates.sort((a, b) => a.due_at - b.due_at || compareId(a.id, b.id));
    for (const o of candidates) {
      if (o.required_military) return {obligation: o, military: o.required_military};
      const variants = o.required_variants || Object.keys(PROJECT_TYPES[o.required_project].variants);
      const running = projectsOf(S, o.required_project, p => variants.indexOf(p.variant) >= 0 && (liveProject(p) || p.status === 'completed'));
      if (running.length) continue;
      return {obligation: o, type: o.required_project, variant: variants[0]};
    }
    return null;
  }

  function reviewReason(Q, t, result) {
    Q.S.history.reasons.push(Object.assign({t: t, kind: 'npc_review', cabinet_id: Q.S.cabinet ? Q.S.cabinet.id : null}, result));
    return result;
  }

  // One review a month (17.16.4): at most one new initiative, outside the portfolios PPS controls,
  // with the same projects, B costs, laws and executors; it spends no PPS action and never moves the
  // clock. Priority: the one revision of a refused necessary package, threatened legal payments and due
  // agreements, then the profile: stabilisation at the financial crisis of 11.9, the credit response,
  // revenue at a deficit. No feasible initiative records its reason.
  function cabinetReview(Q, t) {
    const S = Q.S, cabinet = S.cabinet, E = S.economy;
    if (!cabinet || S.chapter.status === 'ended') return null;
    if (S.scenario.npc_reviewed_time === t) return null;
    S.scenario.npc_reviewed_time = t;
    if (cabinet.status !== 'active') return reviewReason(Q, t, {result: 'none', reason: 'caretaker: only current tasks continue'});
    if (E.pending_package) return reviewReason(Q, t, {result: 'none', reason: 'a package waits for its vote'});
    const profile = cabinetProfile(cabinet);
    const last = E.history[E.history.length - 1] || null;
    const protection = operatingProtection(S);
    // The one revision of a refused necessary package answers the same need, so it comes before a new
    // first proposal; the same offer is never repeated.
    if (E.package_revision) {
      const revision = E.package_revision;
      const kinds = revisionInstruments(Q, profile, revision);
      if (!kinds) {
        E.package_revision = null;
        resignOverPackage(Q, {id: revision.original_id, cabinet_id: cabinet.id}, 'no legal and financially feasible revision');
        return reviewReason(Q, t, {result: 'resignation', reason: 'no feasible revision'});
      }
      cabinetTxn(Q, t, 'revision', {instruments: kinds});
      const pkg = newPackage(Q, {instruments: kinds, necessary: true, reason: 'revision', revision_of: revision.original_id, project_id: revision.project_id});
      return reviewReason(Q, t, {result: 'package', package_id: pkg.id});
    }
    // 1a. Current legal payments not fully financed: revenue first.
    if (npcHolds(S, 'finance') && protection && protection.last_coverage !== null && protection.last_coverage < 1) {
      const kind = nextRevenue(Q, profile);
      if (kind) {
        cabinetTxn(Q, t, 'revenue', {instrument: kind, reason: 'payments'});
        return reviewReason(Q, t, {result: 'package', package_id: newPackage(Q, {instruments: [kind], necessary: true, reason: 'payments'}).id});
      }
    }
    // 1b. A due promise of this cabinet in a portfolio of its own.
    const step = dueObligationStep(Q, t);
    if (step && step.military) {
      const security = securityModule();
      const done = security ? security.cabinetConcession(Q, t, step.obligation, step.military) : {executed: false, reason: 'no forces of the state'};
      cabinetTxn(Q, t, done.executed ? 'military_compromise' : 'military_compromise_refused', {obligation_id: step.obligation.id, reason: done.reason || null});
      return reviewReason(Q, t, {result: done.executed ? 'military_compromise' : 'military_compromise_refused', obligation_id: step.obligation.id,
        agreement_id: done.agreement_id || null, reason: done.reason || null});
    }
    if (step) {
      const result = obligationInitiative(Q, t, step);
      if (result) return result;
    }
    // 3a. Stabilisation at the financial crisis: preparation first, the launch at the next initiative.
    if (npcHolds(S, 'finance') && financialCrisis(S)) {
      const reform = currencyProject(S);
      if (!reform) {
        const variant = profile.stabilisation === 'protected' && !protection ? 'gradual' : profile.stabilisation;
        const project = prepareProject(Q, 'currency_reform', variant, {sponsor: 'cabinet', cabinet_id: cabinet.id});
        cabinetTxn(Q, t, 'prepare', {project_id: project.id, variant: variant});
        return reviewReason(Q, t, {result: 'prepared', project_id: project.id});
      }
      if (preparedProject(reform)) {
        const kinds = stabilisationFinancing(Q, reform, profile);
        cabinetTxn(Q, t, 'launch', {project_id: reform.id, instruments: kinds});
        const pkg = newPackage(Q, {instruments: kinds, project_id: reform.id, necessary: true, reason: 'stabilisation',
          title: 'Currency reform (' + VARIANT_NAMES[reform.variant] + ')' + (kinds.length ? ' with ' + kinds.map(k => INSTRUMENTS[k].name).join(', ') : '')});
        return reviewReason(Q, t, {result: 'package', package_id: pkg.id});
      }
    }
    // 3b. A credit crisis puts the credit response before voluntary investments.
    if ((npcHolds(S, 'finance') || npcHolds(S, 'economic')) && economy.creditCrisis(E, t)) {
      const instrument = projectsOf(S, 'credit_instrument')[0] || null;
      if (!instrument) {
        const project = prepareProject(Q, 'credit_instrument', 'public', {sponsor: 'cabinet', cabinet_id: cabinet.id});
        cabinetTxn(Q, t, 'prepare', {project_id: project.id});
        return reviewReason(Q, t, {result: 'prepared', project_id: project.id});
      }
      if (preparedProject(instrument)) {
        const forecast = economy.budgetAt(S, t, {charge: instrument.build_budget_B}).budget;
        if (forecast >= -2) {
          launchProject(Q, instrument, {sponsor: 'cabinet'});
          cabinetTxn(Q, t, 'launch', {project_id: instrument.id});
          return reviewReason(Q, t, {result: 'launched', project_id: instrument.id});
        }
        if (profile.credit_necessary && !instrumentBlocked(Q, 'wealth_tax')) {
          cabinetTxn(Q, t, 'launch', {project_id: instrument.id, instruments: ['wealth_tax']});
          const pkg = newPackage(Q, {instruments: ['wealth_tax'], project_id: instrument.id, necessary: true, reason: 'credit', revision_of: 'infeasible-' + instrument.id});
          return reviewReason(Q, t, {result: 'package', package_id: pkg.id});
        }
        if (profile.credit_necessary) {
          resignOverPackage(Q, {id: 'infeasible-' + instrument.id, cabinet_id: cabinet.id}, 'no financing for the necessary credit response');
          return reviewReason(Q, t, {result: 'resignation', reason: 'no financing for the credit response'});
        }
      }
    }
    // 3c. Revenue at a deficit; necessary when promised programmes are limited.
    if (npcHolds(S, 'finance') && last && last.budget < -2) {
      const kind = nextRevenue(Q, profile);
      if (kind) {
        const necessary = projectsOf(S, null, p => liveProject(p) && p.last_coverage !== null && p.last_coverage < 1).length > 0;
        cabinetTxn(Q, t, 'revenue', {instrument: kind, reason: 'deficit'});
        return reviewReason(Q, t, {result: 'package', package_id: newPackage(Q, {instruments: [kind], necessary: necessary, reason: 'deficit'}).id});
      }
    }
    return reviewReason(Q, t, {result: 'none', reason: 'no feasible initiative'});
  }

  function stabilisationFinancing(Q, reform, profile) {
    const S = Q.S, E = S.economy, t = Q.time;
    const kinds = [];
    if (reform.variant === 'rapid_cuts') {
      if (!runningInstrument(E, 'admin_cuts', t) && !runningInstrument(E, 'benefit_cut', t)) kinds.push('admin_cuts');
      if (profile.stabilisation_financing.indexOf('wealth_tax') >= 0 && !instrumentBlocked(Q, 'wealth_tax')) kinds.push('wealth_tax');
    } else if (reform.variant === 'protected') {
      if (!runningInstrument(E, 'wealth_tax', t) && !runningInstrument(E, 'loan', t)) kinds.push(instrumentBlocked(Q, 'wealth_tax') ? 'loan' : 'wealth_tax');
    } else if (profile.stabilisation_financing.indexOf('loan') >= 0 && !instrumentBlocked(Q, 'loan')) {
      kinds.push('loan');
    }
    return kinds;
  }

  // The one revision (17.16.4): the refused instruments replaced by the next feasible revenue of the
  // profile; for a stabilisation or credit package, the same project with a wealth tax instead.
  function revisionInstruments(Q, profile, revision) {
    if (revision.project_id) {
      const kinds = revision.instruments.filter(kind => kind !== 'admin_cuts' && kind !== 'benefit_cut');
      if (kinds.indexOf('wealth_tax') < 0 && !instrumentBlocked(Q, 'wealth_tax')) kinds.push('wealth_tax');
      return JSON.stringify(kinds) === JSON.stringify(revision.instruments) ? null : kinds;
    }
    const kind = nextRevenue(Q, profile, revision.instruments);
    return kind ? [kind] : null;
  }

  function obligationInitiative(Q, t, step) {
    const S = Q.S, cabinet = S.cabinet;
    const type = PROJECT_TYPES[step.type];
    const variants = step.obligation.required_variants || [step.variant];
    // One protection project for the same recipients: an existing one is restored to the full benefit.
    const existing = step.type === 'worker_protection' ? operatingProtection(S) : null;
    if (existing) {
      setVariant(existing, 'full');
      existing.history.push({t: t, kind: 'restored_full', by: 'cabinet'});
      cabinetTxn(Q, t, 'restore', {project_id: existing.id, obligation_id: step.obligation.id});
      return reviewReason(Q, t, {result: 'restored', project_id: existing.id, obligation_id: step.obligation.id});
    }
    const prepared = projectsOf(S, step.type, p => preparedProject(p) && variants.indexOf(p.variant) >= 0)[0] || null;
    if (type.klass === 'small') {
      const project = prepared || createProject(Q, step.type, step.variant, {sponsor: 'cabinet', cabinet_id: cabinet.id});
      launchProject(Q, project, {sponsor: 'cabinet'});
      cabinetTxn(Q, t, 'launch', {project_id: project.id, obligation_id: step.obligation.id});
      return reviewReason(Q, t, {result: 'launched', project_id: project.id, obligation_id: step.obligation.id});
    }
    if (!prepared) {
      const fields = {sponsor: 'cabinet', cabinet_id: cabinet.id};
      if (step.type === 'land_program') fields.policy_choices = {access: 'equal'};
      const project = prepareProject(Q, step.type, step.variant, fields);
      if (type.tranches) project.tranche = nextTranche(S, step.type, step.variant);
      cabinetTxn(Q, t, 'prepare', {project_id: project.id, obligation_id: step.obligation.id});
      return reviewReason(Q, t, {result: 'prepared', project_id: project.id, obligation_id: step.obligation.id});
    }
    // Existing promises may start even beyond the voluntary −2 B threshold (11.3).
    launchProject(Q, prepared, {sponsor: 'cabinet'});
    cabinetTxn(Q, t, 'launch', {project_id: prepared.id, obligation_id: step.obligation.id});
    return reviewReason(Q, t, {result: 'launched', project_id: prepared.id, obligation_id: step.obligation.id});
  }

  // ---- Promises: project progress → fulfilment (9.1; decision 3 of stage 4) -------------------------

  function obligationMet(Q, o, t) {
    const S = Q.S;
    if (o.required_project === 'constitution') return !!reformsRecord(Q)[(o.required_variants || [])[0]];
    const variants = o.required_variants;
    return projectsOf(S, o.required_project, p => !variants || variants.indexOf(p.variant) >= 0).some(p => {
      if (o.required_stage === 'operating') return p.status === 'operating' && p.authorized && (p.first_effect_time === null || p.first_effect_time <= t) &&
        (p.last_coverage === null ? false : p.last_coverage >= (o.min_coverage || 1));
      if (o.required_stage === 'completed') return (p.status === 'completed' || p.status === 'operating') && p.first_effect_time !== null && p.first_effect_time <= t + 1 && p.progress >= 100;
      return false;
    });
  }

  function updateObligations(Q, t) {
    const S = Q.S;
    for (const id of Object.keys(S.agreements).sort()) {
      const agreement = S.agreements[id];
      if (agreement.status !== 'active' && agreement.status !== 'breached') continue;
      for (const o of agreement.obligations) {
        if (o.required_military && (o.status === 'active' || o.status === 'breached')) {
          // Met while the agreement with Piłsudski that the cabinet concluded for it is being executed.
          const pils = S.actors.pilsudski && S.actors.pilsudski.agreement_id ? S.agreements[S.actors.pilsudski.agreement_id] : null;
          o.fulfillment = pils && pils.status === 'active' && pils.execution_started_at !== null && pils.obligation_id === o.id ? 1 : 0;
          o.last_checked = t;
          continue;
        }
        if (!o.required_project || o.status === 'fulfilled' || o.status === 'awaiting_later_stage') continue;
        const met = obligationMet(Q, o, t);
        if (o.status === 'open') {
          if (met) { o.status = 'active'; o.due_at = t; o.fulfillment = 1; o.last_checked = t; }
          continue;
        }
        if (o.status !== 'active' && o.status !== 'breached') continue;
        o.fulfillment = met ? 1 : 0;
        o.last_checked = t;
      }
    }
  }

  // 17.4: PPS's own overdue obligations (as the agreements of 9.2 see them at the same settlement) and
  // its responsibility for the cabinet.
  function ppsOverdueWeight(Q, at) {
    const S = Q.S, time = at === undefined ? Q.time : at;
    let weight = 0;
    for (const id of Object.keys(S.agreements).sort()) {
      const agreement = S.agreements[id];
      if (agreement.status !== 'active' && agreement.status !== 'breached') continue;
      for (const o of agreement.obligations) {
        if (government.overdueObligation(o, time) && government.ppsResponsible(S, agreement, o)) weight += o.weight;
      }
    }
    return weight;
  }

  function ppsResponsibility(S) {
    const cabinet = S.cabinet;
    if (!cabinet || (cabinet.status !== 'active' && cabinet.status !== 'caretaker')) return 0;
    if (cabinet.partner_ids.indexOf('pps') >= 0) return 1;
    if (cabinet.supporter_ids.indexOf('pps') >= 0) return 0.5;
    return 0;
  }

  // ---- The monthly settlement in the order of 4.2 (steps 4–6) ---------------------------------------

  // Called once per settled month from post_event, for period t = settlement.t: dated law steps and
  // scenario effects, the vote of a pending package, one review of the cabinet, the state finances and
  // the execution of projects, the economy of period t, then the flow of 5.6, the outflow of 17.4 and the
  // fulfilment of promises. The agreements (9.2) and the history record follow in post_event.
  // The clock has already moved to t+1 (4.1); the steps of period t run with the date of t, so an
  // initiative of the cabinet, a vote or a launch belongs to the month it settles.
  function settleMonth(Q, settlement) {
    const S = Q.S, t = settlement.t;
    const clock = {time: Q.time, year: Q.year, month: Q.month};
    Q.time = t;
    Q.year = rules.yearOf(t);
    Q.month = rules.monthOf(t);
    try {
      processLaws(Q, t);
      startOfPeriod(Q, t);
      voteDuePackage(Q, t);
      cabinetReview(Q, t);
      processLaws(Q, t);
      const budget = economy.budgetAt(S, t);
      const inputs = processProjects(Q, t, budget);
      // Stage 6: strikes and wage agreements of the period, recorded by the union rules before the economy (17.4, 11.4).
      const labour = S.strikes && S.strikes.inputs;
      if (labour && labour.t === t) {
        inputs.strike_disruption = labour.strike_disruption;
        inputs.wage_agreement_pp = labour.wage_agreement_pp;
      }
      const reading = economy.settleEconomy(S, t, budget, inputs);
      // Stage 5: a change of unemployment moves mass between employed and unemployed cells (5.1).
      electorate.applyEmployment(S, S.economy.unemployment);
      economy.settleLivingConditions(Q, t);
      economy.settleDisappointment(Q, t, ppsOverdueWeight(Q, t + 1), ppsResponsibility(S));
      updateObligations(Q, t);
      return reading;
    } finally {
      Q.time = clock.time;
      Q.year = clock.year;
      Q.month = clock.month;
    }
  }

  // ---- Constitutional projects (7.6; card 7.4) ---------------------------------------------------

  const REFORMS = Object.freeze(['democratic_guarantees', 'constructive_vonc', 'presidential_arbitration']);

  function reformsRecord(Q) {
    const constitution = Q.polish_presidency && Q.polish_presidency.constitution;
    if (!constitution) return {};
    if (!constitution.reforms) constitution.reforms = {democratic_guarantees: false, constructive_vonc: false, presidential_arbitration: false};
    return constitution.reforms;
  }

  function constitutionProject(S, reform) {
    return projectsOf(S, 'constitution', p => p.variant === reform)[0] || null;
  }

  // P: the motion needs the signatures of at least 111 MPs (7.1): PPS and the clubs that would vote for it.
  function signatures(Q, reform) {
    const S = Q.S;
    const bill = {sponsor: 'pps', programme: PROJECT_TYPES.constitution.variants[reform].programme, pps_vote: 'yes'};
    const counts = sejmCounts(Q, bill);
    return counts.yes;
  }

  function forecastKey(Q, project) {
    const S = Q.S;
    const bill = {sponsor: 'pps', programme: PROJECT_TYPES.constitution.variants[project.variant].programme, pps_vote: 'yes'};
    const counts = sejmCounts(Q, bill);
    return counts.yes + '/' + counts.no + '/' + counts.abstain + '/' + S.parliament.chamber_id + '/' + S.senate.status;
  }

  // The same law of an ordinary project after a refusal (Z — 0.36): the forecast of its vote must have changed.
  function lawForecastKey(Q, project) {
    const S = Q.S, law = projectLaw(project);
    const counts = sejmCounts(Q, {sponsor: 'pps', programme: law ? law.programme : {fiscal: 0}, pps_vote: 'yes'});
    return project.variant + ':' + counts.yes + '/' + counts.no + '/' + counts.abstain + '/' + S.parliament.chamber_id + '/' + S.senate.status;
  }

  function constitutionStatus(Q, reform, via) {
    const S = Q.S;
    if (!S || S.chapter.status === 'ended') return no('');
    if (REFORMS.indexOf(reform) < 0) return no(L('Unknown reform.', 'Nieznana reforma.'));
    if (reformsRecord(Q)[reform]) return no(L('This reform is already in force.', 'Ta reforma już obowiązuje.'));
    const project = constitutionProject(S, reform);
    if (project && (liveProject(project) || project.status === 'completed')) return no(L('The reform is being carried out after its promulgation.', 'Reforma jest wprowadzana po jej ogłoszeniu.'));
    const law = project && project.law_id ? S.parliament.laws.filter(l => l.id === project.law_id)[0] : null;
    if (law && law.status === 'in_procedure') return no(L('The motion is before the Senate.', 'Wniosek jest w Senacie.'));
    // 10.8 (Z — 0.33): PPS prepares the arbitration only with the line of a stronger presidency; a later change of the
    // line does not cancel a prepared project.
    const strong = S.actors && S.actors.pps && S.actors.pps.strategy && S.actors.pps.strategy.form_of_power === 'strong_presidency';
    if (reform === 'presidential_arbitration' && !strong && !(project && project.preparation >= 50)) {
      return no(L('PPS prepares it only with the line of a stronger presidency (card What Power Do We Want).', 'PPS przygotowuje ją tylko przy linii silniejszej prezydentury (karta „Jakiej władzy chcemy”).'));
    }
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    if (!project || project.preparation < 50) return OK;
    if (S.senate.status !== 'constituted') return no(L('The March Constitution needs both chambers; the Senate is not yet constituted.', 'Konstytucja marcowa wymaga obu izb; Senat jeszcze się nie ukonstytuował.'));
    if (signatures(Q, reform) < 111) return no(L('The motion needs the signatures of at least 111 MPs; PPS and the clubs that support it have ' + signatures(Q, reform) + '.',
      'Wniosek wymaga podpisów co najmniej 111 posłów; PPS i popierające go kluby mają ' + signatures(Q, reform) + '.'));
    if (project.rejected_forecast && project.rejected_forecast === forecastKey(Q, project)) return no(L('The same motion was refused and nothing has changed since.', 'Ten sam wniosek został odrzucony i od tego czasu nic się nie zmieniło.'));
    return OK;
  }

  // Preparation takes two main actions (7.6): the first prepares the text, the second files the motion
  // and puts it to the vote of both chambers (2/3; the Senate at +30 days).
  function constitutionChoose(Q, reform, via) {
    const S = Q.S;
    const status = constitutionStatus(Q, reform, via);
    if (!status.available) throw new Error('constitutionChoose: ' + status.reason);
    let project = constitutionProject(S, reform);
    rules.commitMainAction(Q, via === 'justice' ? 'government.justice_policy.broad_safeguards' : 'parliament.constitution_project', {reform: reform});
    if (!project || project.preparation < 50) {
      project = project || createProject(Q, 'constitution', reform, {sponsor: 'pps', responsibility: {pps: 0.70}, executor: 'parliament'});
      project.preparation = 50;
      project.status = 'idea';
      project.history.push({t: Q.time, kind: 'preparation', step: 1});
      return {step: 'prepared', project: project, law: null};
    }
    project.preparation = 100;
    project.status = 'prepared';
    project.prepared_at = Q.time;
    const bill = submitLaw(Q, {kind: 'constitution', title: 'Constitutional reform: ' + VARIANT_NAMES[reform], project_id: project.id,
      sponsor: 'pps', programme: PROJECT_TYPES.constitution.variants[reform].programme, constitutional: true, pps_vote: 'yes'});
    project.law_id = bill.id;
    project.authorization_id = bill.id;
    return {step: 'submitted', project: project, law: bill};
  }

  // The reform takes effect after its promulgation and one month of implementation (7.6).
  function enactReform(Q, reform, project, t) {
    const S = Q.S;
    const record = reformsRecord(Q);
    if (record[reform]) return;
    record[reform] = true;
    if (reform === 'constructive_vonc') {
      S.parliament.constructive_vonc = true;
      Q.constructive_vonc = 1;
    }
    if (reform === 'democratic_guarantees') {
      for (const id of ['psl_wyzwolenie', 'jewish_rep', 'other_minorities_rep']) {
        if (S.actors.relations[id] !== undefined) government.changeRelation(Q, id, 4, 'reform:democratic_guarantees');
      }
      pend(project, {system: 'democracy', stage: 7, value: 3, when: 'first_effect', note: 'once'});
    }
    if (reform === 'presidential_arbitration') {
      government.factionReaction(Q, 'lewica', {dissent: 8}, {id: 'reform:presidential_arbitration', kind: 'reform', reverse: null});
    }
    S.history.reasons.push({t: t, kind: 'constitution_reform', reform: reform, project_id: project.id});
  }

  function constitutionCardAvailable(Q) {
    const S = Q.S;
    if (!S || S.chapter.status === 'ended' || government.formationPending(Q)) return false;
    return REFORMS.some(reform => {
      const project = constitutionProject(S, reform);
      return (!project || project.preparation < 50) && constitutionStatus(Q, reform).available;
    });
  }

  // ---- The unemployment bill D (card 7.2; 17.15) -------------------------------------------------------

  const BILL_PROGRAMMES = Object.freeze({full: {fiscal: 2}, limited: {fiscal: 1}});

  function billRecord(S) {
    return S.chapter.unemployment_bill || null;
  }

  // D1: after the 1922 election, only outside the cabinet; one initiative in the chapter.
  function billD1Available(Q) {
    const S = Q.S;
    if (!S || S.chapter.status === 'ended' || !Q.sejm_first_election_completed) return false;
    if (cabinetActive(S) && ppsMember(S)) return false;
    return !billRecord(S);
  }

  function billD1Choose(Q, choice) {
    const S = Q.S;
    if (!billD1Available(Q)) throw new Error('billD1Choose: the initiative is not available');
    if (choice === 'decline') {
      S.chapter.unemployment_bill = {status: 'declined', declined_at: Q.time, started_at: null, variant: null, enacted_variant: null,
        project_id: null, ballot_ids: [], submitted_at: null, senate_notice_due: null, senate_return_due: null, effective_at: null,
        next_step: null, compromise_scope: null, law_id: null};
      S.history.actions.push({t: Q.time, action_id: 'parliament.legislative_program.decline', cost_t: 0});
      return S.chapter.unemployment_bill;
    }
    if (!rules.mainActionAvailable(Q)) throw new Error('billD1Choose: this month’s action has already been used');
    rules.commitMainAction(Q, 'parliament.legislative_program.d1', {});
    S.chapter.unemployment_bill = {status: 'pending', declined_at: null, started_at: Q.time, variant: null, enacted_variant: null,
      project_id: null, ballot_ids: [], submitted_at: null, senate_notice_due: null, senate_return_due: null, effective_at: null,
      next_step: 'd2', compromise_scope: null, law_id: null, financing: 'general budget', executor: 'labor_administration'};
    return S.chapter.unemployment_bill;
  }

  // D2 comes in the next parliamentary window after the settlement of D1's month; while PPS sits in the
  // cabinet it is suspended without a new fee.
  function billD2Available(Q) {
    const S = Q.S, record = S && billRecord(S);
    if (!record || S.chapter.status === 'ended' || record.status !== 'pending' || record.started_at >= Q.time) return false;
    return !(cabinetActive(S) && ppsMember(S));
  }

  function billSimulation(Q, variant) {
    const bill = {sponsor: 'pps', programme: BILL_PROGRAMMES[variant], pps_vote: 'yes'};
    return sejmCounts(Q, bill);
  }

  // A compromise needs a concrete club ready to vote for the limited variant but not for the full one.
  function compromiseClubs(Q) {
    const full = billSimulation(Q, 'full'), limited = billSimulation(Q, 'limited');
    return Object.keys(limited.club_votes).sort().filter(id => id !== 'pps' && limited.club_votes[id].vote === 'yes' && full.club_votes[id].vote !== 'yes');
  }

  function billD2Status(Q, option) {
    if (!billD2Available(Q)) return no(L('The bill is not waiting for its decision.', 'Ustawa nie czeka na decyzję.'));
    if (option === 'full') return OK;
    if (option === 'limited') return compromiseClubs(Q).length ? OK : no(L('No club is ready to support the limited variant.', 'Żaden klub nie jest gotów poprzeć wariantu ograniczonego.'));
    if (option === 'withdraw') return compromiseClubs(Q).length ? no(L('Withdrawal is offered only when there is no compromise.', 'Wycofanie jest możliwe tylko wtedy, gdy nie ma kompromisu.')) : OK;
    return no(L('Unknown option.', 'Nieznana opcja.'));
  }

  function billD2Choose(Q, option) {
    const S = Q.S, record = billRecord(S);
    const status = billD2Status(Q, option);
    if (!status.available) throw new Error('billD2Choose: ' + status.reason);
    S.history.actions.push({t: Q.time, action_id: 'parliament.legislative_program.d2.' + option, cost_t: 0});
    if (option === 'withdraw') {
      record.status = 'withdrawn';
      record.next_step = null;
      return {record: record, law: null};
    }
    record.variant = option;
    record.compromise_scope = option === 'limited' ? 'limited' : null;
    const bill = submitLaw(Q, {kind: 'unemployment_bill', title: 'Protection of the unemployed (' + (option === 'full' ? 'full' : 'limited') + ' variant)',
      sponsor: 'pps', programme: BILL_PROGRAMMES[option], variant: option, weaker_variant: option === 'full' ? 'limited' : null,
      weaker_programme: option === 'full' ? BILL_PROGRAMMES.limited : null, compromise_scope: record.compromise_scope, pps_vote: 'yes'});
    record.law_id = bill.id;
    record.ballot_ids = bill.ballot_ids.slice();
    record.submitted_at = bill.submitted_at;
    record.senate_notice_due = bill.senate_notice_due;
    record.senate_return_due = bill.senate_return_due;
    if (bill.status === 'in_procedure') { record.status = 'in_procedure'; record.next_step = 'senate'; }
    else if (bill.status === 'rejected') { record.status = 'rejected'; record.next_step = null; }
    return {record: record, law: bill};
  }

  // One protection project for these recipients (17.15): an enacted D creates it, or changes an existing
  // one only by the real change of entitlement and cost.
  function billEnacted(Q, bill, m) {
    const S = Q.S, record = billRecord(S);
    const variant = bill.enacted_variant || bill.variant;
    let project = operatingProtection(S);
    if (project) {
      if (project.variant !== 'full' && variant === 'full') setVariant(project, 'full');
      project.history.push({t: m, kind: 'unemployment_bill', variant: variant});
    } else {
      project = createProject(Q, 'worker_protection', variant, {sponsor: 'pps', executor: 'labor_administration', responsibility: {pps: 0.40},
        caretaker_allowed: true});
      project.status = 'operating';
      project.preparation = 100;
      project.launched_at = m;
      authorize(Q, project, m, bill.id);
    }
    if (record) {
      record.status = 'enacted';
      record.enacted_variant = variant;
      record.effective_at = bill.effective_at;
      record.project_id = project.id;
      record.next_step = null;
      record.ballot_ids = bill.ballot_ids.slice();
    }
  }

  function billView(Q) {
    const S = Q.S, record = billRecord(S);
    const full = billSimulation(Q, 'full'), limited = billSimulation(Q, 'limited');
    const forecast = economy.budgetAt(S, Q.time);
    return {
      status: record ? record.status : 'available',
      full_forecast: L(full.yes + ' for, ' + full.no + ' against, ' + full.abstain + ' abstaining',
        full.yes + ' za, ' + full.no + ' przeciw, ' + full.abstain + ' wstrzymujących się'),
      limited_forecast: L(limited.yes + ' for, ' + limited.no + ' against, ' + limited.abstain + ' abstaining',
        limited.yes + ' za, ' + limited.no + ' przeciw, ' + limited.abstain + ' wstrzymujących się'),
      compromise: compromiseClubs(Q).map(government.describeParty).join(', '),
      budget: signed(round(forecast.budget, 2), 2) + L(' B now; the full variant would cost 2 B a month, the limited 1 B',
        ' B obecnie; pełny wariant kosztowałby 2 B miesięcznie, ograniczony 1 B'),
    };
  }

  // ---- Government cards (17.11; catalogue 8.1–8.11, 8.13, 8.16) -------------------------------------

  const CARDS = Object.freeze({
    labor_rights: {portfolios: ['labor'], options: ['inspection', 'collective', 'derogation']},
    social_welfare: {portfolios: ['labor'], options: ['expand', 'focus', 'limit']},
    finance_package: {portfolios: ['finance'], options: ['progressive', 'wealth_tax', 'indirect', 'broad', 'customs', 'loan', 'admin_cuts',
      'benefit_cut', 'emission', 'collection']},
    currency_stabilisation: {portfolios: ['finance'], options: ['rapid_cuts', 'protected', 'gradual']},
    investment_fund: {portfolios: ['finance', 'economic'], options: ['public', 'banks', 'cooperative']},
    industrial_policy: {portfolios: ['economic'], options: ['credit', 'rescue', 'orders', 'public_control', 'worker_representation']},
    public_works: {portfolios: ['labor'], options: ['employment', 'infrastructure', 'housing']},
    land_program: {portfolios: ['agriculture'], options: ['compensated', 'accelerated', 'expropriation']},
    agriculture_development: {portfolios: ['agriculture'], options: ['advisory', 'consolidation', 'cooperative_processing_sales']},
    education_program: {portfolios: ['education'], options: ['rural_access', 'urban_worker_adult_access', 'secular']},
    minority_school_rights: {portfolios: ['education'], options: ['own_language', 'agreed_bilingual', 'polish_dominance']},
    justice_policy: {portfolios: ['justice'], options: ['broad_safeguards', 'limited_redress']},
    // Stage 7: cards 12 and 14 of 17.11 (catalogue 8.12, 8.14); the agreement with Piłsudski (card 15) is PolishSecurity's.
    internal_security: {portfolios: ['interior'], options: ['professionalization', 'investigate_far_right', 'investigate_communist', 'police_protection',
      'limited_autonomy']},
    military_policy: {portfolios: ['reichswehr'], options: ['civilian_oversight', 'personnel_changes', 'organizational_compromise']},
    heritage_restoration: {portfolios: ['education'], options: ['wawel_conservation', 'wawel_restoration', 'zamek_conservation', 'zamek_restoration']},
  });

  // The card is in the pool only with the right access (17.11): PPS holds one of its portfolios in an
  // active cabinet; stabilisation also needs a financial crisis or an existing project.
  function cardAvailable(Q, cardId) {
    const S = Q.S, card = CARDS[cardId];
    if (!S || !card || S.chapter.status === 'ended' || government.formationPending(Q)) return false;
    if (!ppsHoldsAny(S, card.portfolios)) return false;
    if (cardId === 'currency_stabilisation') return financialCrisis(S);
    return true;
  }

  function forecastWith(Q, extra) {
    return economy.budgetAt(Q.S, Q.time, extra).budget;
  }

  // The rule of 11.3 for new programmes, in words (Z — 0.53): a forecast budget of −2 B or more.
  const FORECAST_BLOCK = 'A new programme starts only when the forecast budget deficit stays at 2 budget units or less.';
  const forecastBlock = () => L(FORECAST_BLOCK, 'Nowy program rusza tylko wtedy, gdy prognozowany deficyt budżetu nie przekracza 2 jednostek.');

  function nextTranche(S, typeId, variantId) {
    const type = PROJECT_TYPES[typeId];
    const limit = (type.variants[variantId] && type.variants[variantId].tranches) || type.tranches || 1;
    const used = projectsOf(S, typeId, p => p.variant === variantId || typeId === 'land_program').map(p => p.tranche);
    for (let n = 1; n <= limit; n++) if (used.indexOf(n) < 0) return n;
    return null;
  }

  function trancheBlocked(S, typeId, variantId) {
    const prepared = projectsOf(S, typeId, p => preparedProject(p) && (typeId === 'land_program' || p.variant === variantId))[0];
    if (prepared) return '';
    return nextTranche(S, typeId, variantId) === null ? L('All tranches of this scope are done; the same area gets no second reward.',
      'Wszystkie transze tego zakresu są wykonane; ten sam obszar nie dostaje drugiej nagrody.') : '';
  }

  function minorityAgreements(S) {
    return Object.keys(S.agreements).sort().map(id => S.agreements[id]).filter(a => (a.status === 'active' || a.status === 'breached') &&
      a.obligations.some(o => o.topic === 'school_rights' || o.topic === 'language_rights'));
  }

  // The executed school agreement: the relation of the club it was signed with +4, once (12.7).
  function executedMinorityAgreements(Q, project) {
    const S = Q.S;
    for (const agreement of minorityAgreements(S)) {
      for (const party of agreement.parties) {
        if (government.SEGMENTS.indexOf(party) < 0) continue;
        if (project.effects_applied.indexOf('relation:' + agreement.id) >= 0) continue;
        project.effects_applied.push('relation:' + agreement.id);
        government.changeRelation(Q, party, 4, 'minority_schools:' + project.id);
      }
    }
  }

  // A working PPS cooperative is the cooperative executor (13.2; stage 5).
  function cooperativeExecutor(S) {
    return !!(S.party_orgs && S.party_orgs.cooperatives.projects.some(p => p.status === 'operating'));
  }

  // Card 8.1 through the unions module (stage 6): the collective agreement of one branch, or of any branch when
  // no branch is named, and the derogation for the oldest threatened plant (P).
  function unionOption(Q, option, extra) {
    const S = Q.S, unions = unionsModule();
    if (!unions || !S.unions || !S.enterprises) return no(L('Needs the union branches and plant records of stage 6.', 'Wymaga branż związkowych i rejestru zakładów z etapu 6.'));
    if (option === 'derogation') return unions.derogationStatus(Q);
    if (extra && extra.branch) return unions.collectiveStatus(Q, extra.branch);
    const reasons = unions.BRANCHES.map(b => unions.collectiveStatus(Q, b));
    if (reasons.some(r => r.available)) return OK;
    return no(L('No branch can sign now: ', 'Żadna branża nie może teraz podpisać: ') +
      reasons.map((r, i) => unions.branchName(unions.BRANCHES[i]) + ' — ' + r.reason).join(' '));
  }

  // Status of one option of a government card (the reason is shown under the option). `extra` names the branch,
  // the variant of representation, or `adviser` when an adviser checks the option before opening the card.
  function optionStatus(Q, cardId, option, extra) {
    const S = Q.S, E = S.economy, t = Q.time;
    if (!cardAvailable(Q, cardId)) return no(L('The card is not available.', 'Karta jest niedostępna.'));
    const blockedLater = {
      expropriation: L('Needs a prior change of the constitutional guarantees of property; no card of this chapter creates it (12.6).',
        'Wymaga wcześniejszej zmiany konstytucyjnych gwarancji własności; żadna karta tego rozdziału jej nie tworzy (12.6).'),
    };
    if (blockedLater[option]) return no(blockedLater[option]);
    // Stage 5: a working cooperative of PPS is the cooperative executor of 8.5 and 8.9.
    if ((option === 'cooperative' || option === 'cooperative_processing_sales') && !cooperativeExecutor(S)) {
      return no(L('Needs a cooperative executor: an operating PPS cooperative (Organisations of PPS, then the party agenda).', 'Wymaga wykonawcy spółdzielczego: działającej spółdzielni PPS (Organizacje PPS, potem agenda partii).'));
    }
    if (!(extra && extra.adviser) && !rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    switch (cardId) {
      case 'labor_rights': {
        if (option === 'collective' || option === 'derogation') return unionOption(Q, option, extra);
        if (projectsOf(S, 'labor_inspection', p => liveProject(p)).length) return no(L('The inspection already works; the same variant points to the existing project.', 'Inspekcja już działa; ten sam wariant wskazuje na istniejący projekt.'));
        return forecastWith(Q, {charge: 1}) >= -2 ? OK : no(forecastBlock());
      }
      case 'social_welfare': {
        const protection = operatingProtection(S);
        if (option === 'expand') {
          if (protection && (protection.scope || 1) >= 3) return no(L('The protection already covers its full scope of 3.', 'Osłona obejmuje już pełny zakres 3.'));
          if (protection && protection.variant !== 'full') return no(L('The protection is focused or limited; expanding it means restoring the full benefit first.', 'Osłona jest skupiona albo ograniczona; jej rozszerzenie wymaga najpierw przywrócenia pełnego zasiłku.'));
          return forecastWith(Q, {charge: 2}) >= -2 ? OK : no(L('No financing: ', 'Brak finansowania: ') + forecastBlock());
        }
        if (option === 'focus') {
          if (protection && protection.variant !== 'full') return no(L('The protection is already focused or limited.', 'Osłona jest już skupiona albo ograniczona.'));
          if (protection && (protection.scope || 1) > 1) return no(L('Focusing applies to a protection of scope 1.', 'Skupienie dotyczy osłony o zakresie 1.'));
          return protection || forecastWith(Q, {charge: 1}) >= -2 ? OK : no(L('No financing: ', 'Brak finansowania: ') + forecastBlock());
        }
        const blocked = instrumentBlocked(Q, 'benefit_cut');
        return blocked ? no(blocked) : OK;
      }
      case 'finance_package': {
        if (option === 'collection') {
          if (projectsOf(S, 'collection').length) return no(L('Tax collection has already been improved in this chapter.', 'Pobór podatków został już w tym rozdziale usprawniony.'));
          return forecastWith(Q, {charge: 1}) >= -2 ? OK : no(forecastBlock());
        }
        const kind = option === 'emission' && E.currency_regime === 'zloty' ? 'coinage' : option;
        const blocked = instrumentBlocked(Q, kind);
        return blocked ? no(blocked) : OK;
      }
      case 'currency_stabilisation': {
        const reform = currencyProject(S);
        if (reform && !preparedProject(reform)) return no(L('The currency reform is already under way.', 'Reforma walutowa już trwa.'));
        if (reform && reform.variant === option) return no(L('This variant is already prepared; launch it from the agenda.', 'Ten wariant jest już przygotowany; uruchom go z agendy.'));
        if (option === 'protected' && !operatingProtection(S)) return no(L('Needs a full or an agreed limited protection for the unemployed.', 'Wymaga pełnej albo uzgodnionej ograniczonej osłony dla bezrobotnych.'));
        return OK;
      }
      case 'investment_fund':
      case 'industrial_policy': {
        if (option === 'rescue') return rescueStatus(Q);
        if (option === 'public_control') return publicControlStatus(Q);
        if (option === 'worker_representation') return representationStatus(Q, extra && extra.variant);
        if (option === 'orders') {
          if (projectsOf(S, 'orders', p => liveProject(p)).length) return no(L('One package of orders is already running in the country.', 'W kraju realizowany jest już jeden pakiet zamówień.'));
          return forecastWith(Q, {charge: 1}) >= -2 ? OK : no(forecastBlock());
        }
        const instrument = projectsOf(S, 'credit_instrument')[0];
        if (instrument && !preparedProject(instrument)) return no(L('The credit instrument is already running: one financing, one cost, one effect.', 'Instrument kredytowy już działa: jedno finansowanie, jeden koszt, jeden skutek.'));
        const financing = option === 'credit' ? 'public' : option;
        // Stage 8 (fix 3): an instrument prepared by the cabinet is not on the agenda of PPS; the cabinet launches it itself.
        if (instrument && instrument.variant === financing) {
          return no(instrument.sponsor === 'cabinet' ? L('The cabinet has prepared this financing; it launches it at one of its next reviews.',
            'Gabinet przygotował to finansowanie; uruchomi je przy jednym z kolejnych przeglądów.') :
            L('This financing is already prepared; launch it from the agenda.', 'To finansowanie jest już przygotowane; uruchom je z agendy.'));
        }
        if (financing === 'banks' && E.credit < 40) return no(L('Credit is below 40: the banks do not agree.', 'Kredyt jest poniżej 40: banki się nie zgadzają.'));
        return OK;
      }
      case 'public_works': {
        const prepared = projectsOf(S, 'public_works', p => preparedProject(p))[0];
        if (prepared && prepared.variant === option) return no(L('This programme is already prepared; launch it from the agenda.', 'Ten program jest już przygotowany; uruchom go z agendy.'));
        return OK;
      }
      case 'land_program': {
        const prepared = projectsOf(S, 'land_program', p => preparedProject(p))[0];
        if (prepared && prepared.variant === option) return no(L('This variant is already prepared; launch it from the agenda.', 'Ten wariant jest już przygotowany; uruchom go z agendy.'));
        const tranche = trancheBlocked(S, 'land_program', option);
        return tranche ? no(tranche) : OK;
      }
      case 'agriculture_development': {
        const prepared = projectsOf(S, 'agriculture_development', p => preparedProject(p) && p.variant === option)[0];
        if (prepared) return no(L('This programme is already prepared; launch it from the agenda.', 'Ten program jest już przygotowany; uruchom go z agendy.'));
        const tranche = trancheBlocked(S, 'agriculture_development', option);
        return tranche ? no(tranche) : OK;
      }
      case 'education_program': {
        const prepared = projectsOf(S, 'education_program', p => preparedProject(p) && p.variant === option)[0];
        if (prepared) return no(L('This programme is already prepared; launch it from the agenda.', 'Ten program jest już przygotowany; uruchom go z agendy.'));
        const tranche = trancheBlocked(S, 'education_program', option);
        return tranche ? no(option === 'secular' ? L('The secular school model is already adopted or under way.',
          'Model szkoły świeckiej jest już przyjęty albo w toku.') : tranche) : OK;
      }
      case 'minority_school_rights': {
        const running = projectsOf(S, 'minority_schools', p => liveProject(p) || p.status === 'completed');
        const prepared = projectsOf(S, 'minority_schools', p => preparedProject(p))[0];
        if (prepared && prepared.variant === option) return no(L('This rule is already prepared; launch it from the agenda.', 'Ta zasada jest już przygotowana; uruchom ją z agendy.'));
        if (running.length) return no(L('A language rule is already carried out; a contrary rule would need a new law, not part of this chapter.', 'Zasada językowa jest już realizowana; przeciwna zasada wymagałaby nowej ustawy, której nie ma w tym rozdziale.'));
        if (option === 'agreed_bilingual' && !minorityAgreements(S).length) return no(L('Needs a voluntarily accepted agreement with a minority representation.', 'Wymaga dobrowolnie przyjętego porozumienia z reprezentacją mniejszości.'));
        if (option === 'polish_dominance' && reformsRecord(Q).democratic_guarantees) return no(L('The democratic guarantees in force forbid it.', 'Zakazują tego obowiązujące gwarancje demokratyczne.'));
        if (option === 'polish_dominance' && delegation(S, 'schools')) {
          return no(L('The schools of the autonomous area are delegated to its self-government: a central order there is not a lawful act (17.12.6).',
            'Szkoły obszaru autonomicznego są przekazane jego samorządowi: centralne polecenie nie jest tam aktem legalnym (17.12.6).'));
        }
        return OK;
      }
      case 'justice_policy': {
        if (option === 'limited_redress') {
          if (!reviewTarget(S)) return no(L('Needs an active restriction of a named case that is not already under review.', 'Wymaga aktywnego ograniczenia w wymienionej sprawie, które nie jest jeszcze rozpatrywane.'));
          return forecastWith(Q, {charge: 1}) >= -2 ? OK : no(forecastBlock());
        }
        const status = constitutionStatus(Q, 'democratic_guarantees', 'justice');
        return status.available ? OK : no(status.reason);
      }
      case 'internal_security': return securityOptionStatus(Q, option);
      case 'military_policy': return armyOptionStatus(Q, option);
      case 'heritage_restoration': {
        const object = option.split('_')[0], scope = option.split('_')[1];
        const existing = projectsOf(S, 'heritage', p => p.policy_choices.object === object)[0];
        if (existing && existing.status === 'completed') return no(L('The works on ' + HERITAGE_OBJECTS[object] + ' are completed; they are not started again for a reward.',
          'Prace przy ' + heritageName(object, 'loc') + ' są zakończone; nie rozpoczyna się ich ponownie dla nagrody.'));
        if (existing && scope === 'conservation') return no(L('A project for ' + HERITAGE_OBJECTS[object] + ' already exists.',
          'Projekt dotyczący ' + heritageName(object, 'gen') + ' już istnieje.'));
        if (existing && existing.variant === 'restoration') return no(L('The wider restoration of ' + HERITAGE_OBJECTS[object] + ' is already chosen.',
          'Szersza restauracja ' + heritageName(object, 'gen') + ' jest już wybrana.'));
        if (existing && preparedProject(existing)) return no(L('Already prepared; launch it from the agenda.', 'Już przygotowane; uruchom z agendy.'));
        const charge = scope === 'conservation' ? 1 : existing ? 1 : 0;
        return forecastWith(Q, {charge: charge}) >= -2 ? OK : no(forecastBlock());
      }
    }
    return no(L('Unknown option.', 'Nieznana opcja.'));
  }

  // The rule of access to land is a point of the same law (12.6): the preference for the Polish majority
  // is blocked where the law or the guarantees of 7.6 forbid it.
  function landAccessStatus(Q, access) {
    if (access === 'equal') return OK;
    if (reformsRecord(Q).democratic_guarantees) return no(L('The democratic guarantees in force forbid a discriminating rule of access.', 'Obowiązujące gwarancje demokratyczne zakazują dyskryminującej zasady dostępu.'));
    return OK;
  }

  function actionId(cardId, option) {
    return 'government.' + cardId + '.' + option;
  }

  // The chosen option (17.11): 1 T for the decision, a small reform launched at once, a large one prepared
  // for the agenda; a card opened by an adviser takes its one step for 0 T.
  function chooseOption(Q, cardId, option, extra) {
    const S = Q.S, E = S.economy, t = Q.time;
    if (cardId === 'labor_rights' && option === 'collective' && !(extra && extra.branch)) throw new Error('chooseOption: a collective agreement needs a branch');
    const status = optionStatus(Q, cardId, option, extra && {branch: extra.branch, variant: extra.variant});
    if (!status.available) throw new Error('chooseOption: ' + cardId + '.' + option + ': ' + status.reason);
    government.syncRelations(Q);
    if (cardId === 'justice_policy' && option === 'limited_redress') {
      rules.commitMainAction(Q, actionId(cardId, option), {card: cardId, option: option});
      const r = reviewTarget(S);
      const project = createProject(Q, 'justice_review', 'limited_redress', {sponsor: 'pps', responsibility: {pps: 0.70},
        policy_choices: {restriction_id: r.id, case_id: r.case_id}});
      launchProject(Q, project, {sponsor: 'pps'});
      return result(Q, L('The review of the named restriction (' + r.kind.replace(/_/g, ' ') + ') starts: 1 B for one month. The competent organ decides on its legal grounds.',
        'Rusza rewizja wymienionego ograniczenia (' + ({strike_repression: 'represje wobec strajku', press_confiscation: 'konfiskata prasy',
          militia_ban: 'zakaz działalności Milicji'}[r.kind] || r.kind) + '): 1 B przez jeden miesiąc. Właściwy organ rozstrzyga na podstawie przepisów.'));
    }
    if (cardId === 'internal_security' || cardId === 'military_policy') {
      rules.commitMainAction(Q, actionId(cardId, option), {card: cardId, option: option});
      return cardId === 'internal_security' ? securityChoose(Q, option) : armyChoose(Q, option);
    }
    if (cardId === 'justice_policy') {
      // The broad variant is the one democratic_guarantees project, without an extra step (17.12.3).
      const out = constitutionChoose(Q, 'democratic_guarantees', 'justice');
      return result(Q, out.step === 'prepared' ? L('The democratic guarantees are prepared; filing the motion waits in the agenda.',
        'Gwarancje demokratyczne są przygotowane; złożenie wniosku czeka w agendzie.') :
        out.law.status === 'rejected' ? L('The motion fails: ' + out.law.reason + '.', 'Wniosek upada: ' + rules.storedText(out.law.reason) + '.') :
          L('The Sejm adopts the democratic guarantees; the Senate votes on ' + out.law.senate_notice_due + '.',
            'Sejm przyjmuje gwarancje demokratyczne; Senat głosuje ' + isoText(out.law.senate_notice_due) + '.'));
    }
    rules.commitMainAction(Q, actionId(cardId, option), {card: cardId, option: option});
    const share = ppsShare(S, 'pps', CARDS[cardId].portfolios);
    const ppsFields = {sponsor: 'pps', responsibility: {pps: share}};
    switch (cardId) {
      case 'labor_rights': {
        if (option === 'collective') {
          const unions = unionsModule(), agreement = unions.signCollective(Q, extra.branch);
          return result(Q, L('The collective agreement of ' + unions.BRANCH_NAMES[extra.branch].toLowerCase() + ' is signed: wages +' +
            round(agreement.wage_pp, 2) + ' pp for two months, paid by the employers who sign it, with no reaction of business. It runs for ' +
            unions.COLLECTIVE_TERM + ' months.', 'Układ zbiorowy (' + unions.branchName(extra.branch).toLowerCase() + ') zostaje podpisany: płace +' +
            num(round(agreement.wage_pp, 2)) + ' pkt proc. przez dwa miesiące, płacone przez pracodawców, którzy go podpisują, bez reakcji przedsiębiorców. ' +
            'Obowiązuje przez ' + months(unions.COLLECTIVE_TERM) + '.'));
        }
        if (option === 'derogation') {
          const unions = unionsModule(), plant = unions.grantDerogation(Q);
          return result(Q, L('A limited derogation from working time is granted to the ' + unions.plantName(plant) + ' for ' +
            unions.DEROGATION_MONTHS + ' months: business pressure −4; its workers’ grievance +3 at the next monthly settlement. It is no general end of the protection of working time.',
            'Ograniczone odstępstwo od czasu pracy zostaje przyznane (' + unions.plantName(plant) + ') na ' + months(unions.DEROGATION_MONTHS) +
            ': presja przedsiębiorców −4; niezadowolenie robotników zakładu +3 przy następnym miesięcznym rozliczeniu. Nie oznacza to ogólnego końca ochrony czasu pracy.'));
        }
        const project = createProject(Q, 'labor_inspection', 'inspection', ppsFields);
        const law = launchProject(Q, project, {sponsor: 'pps'});
        return result(Q, law && law.status === 'rejected' ? L('The Sejm rejects the enforcement law; the inspection stays prepared.',
          'Sejm odrzuca ustawę o egzekwowaniu czasu pracy; inspekcja pozostaje przygotowana.') :
          L('The inspection of working time starts: 1 B for two months, then 1 B to run.', 'Rusza inspekcja czasu pracy: 1 B przez dwa miesiące, potem 1 B na utrzymanie.') +
          lawNote(law));
      }
      case 'social_welfare': {
        const protection = operatingProtection(S);
        if (option === 'expand') {
          if (!protection) {
            const project = createProject(Q, 'worker_protection', 'full', ppsFields);
            launchProject(Q, project, {sponsor: 'pps'});
            return result(Q, L('The protection for the unemployed starts this month: 2 B a month.', 'Osłona dla bezrobotnych rusza w tym miesiącu: 2 B miesięcznie.'));
          }
          protection.scope = (protection.scope || 1) + 1;
          setVariant(protection, 'full');
          pend(protection, {system: 'grievance', stage: 7, value: -6, when: 'scope_' + protection.scope, note: 'newly covered recipients'});
          protection.history.push({t: t, kind: 'expanded', scope: protection.scope});
          return result(Q, L('The protection now covers scope ' + protection.scope + ': ' + protection.upkeep_budget_B + ' B a month.',
            'Osłona obejmuje teraz zakres ' + protection.scope + ': ' + num(protection.upkeep_budget_B) + ' B miesięcznie.'));
        }
        if (option === 'focus') {
          if (!protection) {
            const project = createProject(Q, 'worker_protection', 'focused', ppsFields);
            launchProject(Q, project, {sponsor: 'pps'});
            return result(Q, L('A protection focused on the most needy half starts: 1 B a month.', 'Rusza osłona skupiona na najbardziej potrzebującej połowie: 1 B miesięcznie.'));
          }
          setVariant(protection, 'focused');
          protection.history.push({t: t, kind: 'focused'});
          return result(Q, L('The protection is focused on the most needy half of the recipients: 1 B instead of 2.', 'Osłona zostaje skupiona na najbardziej potrzebującej połowie odbiorców: 1 B zamiast 2.'));
        }
        const law = adoptInstrument(Q, 'benefit_cut');
        return result(Q, law.status === 'rejected' ? L('The Sejm rejects the cut; the benefit stays.', 'Sejm odrzuca cięcie; zasiłek zostaje.') :
          L('The benefit is cut to the limited variant.', 'Zasiłek zostaje obcięty do wariantu ograniczonego.') + lawNote(law));
      }
      case 'finance_package': {
        if (option === 'collection') {
          const project = createProject(Q, 'collection', 'collection', ppsFields);
          launchProject(Q, project, {sponsor: 'pps'});
          return result(Q, L('Tax collection improves: 1 B for two months, then +1 B for good.', 'Pobór podatków się poprawia: 1 B przez dwa miesiące, potem trwale +1 B.'));
        }
        const kind = option === 'emission' && E.currency_regime === 'zloty' ? 'coinage' : option;
        const law = adoptInstrument(Q, kind);
        if (!law) return result(Q, L('The ' + INSTRUMENTS[kind].name + ' take effect this month.', capital(instrumentName(kind)) + ': wchodzą w życie w tym miesiącu.'));
        return result(Q, law.status === 'rejected' ? L('The Sejm rejects the ' + INSTRUMENTS[kind].name + '.', 'Sejm odrzuca: ' + instrumentName(kind) + '.') :
          L('The Sejm adopts the ' + INSTRUMENTS[kind].name + '.', 'Sejm przyjmuje: ' + instrumentName(kind) + '.') + lawNote(law));
      }
      case 'currency_stabilisation': {
        const project = prepareProject(Q, 'currency_reform', option, ppsFields);
        return result(Q, L('The currency reform is prepared (' + VARIANT_NAMES[option] + '). Its launch waits in the agenda.',
          'Reforma walutowa jest przygotowana (' + VARIANT_NAMES_PL[option] + '). Jej uruchomienie czeka w agendzie.'));
      }
      case 'investment_fund':
      case 'industrial_policy': {
        if (option === 'rescue') {
          const plant = rescueTarget(S);
          const project = prepareProject(Q, 'plant_rescue', 'rescue', Object.assign({policy_choices: {plant_id: plant.id, profile: plant.profile_id,
            owner_agreement: 'the condition of the credit: the owner keeps the plant working and its workers employed'}}, ppsFields),
            {match: p => p.policy_choices.plant_id === plant.id});
          plant.rescue_project_id = project.id;
          plant.history.push({t: t, kind: 'rescue_prepared', project_id: project.id});
          return result(Q, L('The rescue of the ' + plantLabel(plant) + ' is prepared: a conditional credit of 2 B a month for two months, then 1 B to run. Its launch waits in the agenda.',
            'Ratunek zakładu (' + plantLabel(plant) + ') jest przygotowany: warunkowy kredyt 2 B miesięcznie przez dwa miesiące, potem 1 B na utrzymanie. ' +
            'Jego uruchomienie czeka w agendzie.'));
        }
        if (option === 'public_control') {
          const plant = publicControlTarget(S);
          const bill = submitLaw(Q, {kind: 'public_control', title: 'Public control of the ' + plantLabel(plant, true), sponsor: 'pps',
            programme: {fiscal: 2}, pps_vote: 'yes', plant_id: plant.id});
          if (bill.status !== 'rejected' && plant.owner !== 'public') plant.public_act_id = bill.id;
          plant.history.push({t: t, kind: 'public_control_submitted', law_id: bill.id});
          return result(Q, bill.status === 'rejected' ? L('The Sejm rejects the act; the ' + plantLabel(plant) + ' stays private.',
            'Sejm odrzuca akt; zakład (' + plantLabel(plant) + ') pozostaje prywatny.') :
            bill.status === 'enacted' ? L('The ' + plantLabel(plant) + ' passes under public control, managed by a public board: business pressure +15.',
              capital(plantLabel(plant)) + ' przechodzi pod kontrolę publiczną i zarządza nim zarząd publiczny: presja przedsiębiorców +15.') :
              L('The Sejm passes the act of public control of the ' + plantLabel(plant) + '; business pressure +15 comes when it takes effect.',
                'Sejm uchwala akt kontroli publicznej (' + plantLabel(plant) + '); presja przedsiębiorców +15 przyjdzie, gdy akt wejdzie w życie.') + lawNote(bill));
        }
        if (option === 'worker_representation') {
          const variant = (extra && extra.variant) || 'consultative';
          const plant = representationTarget(S, variant);
          const fields = Object.assign({policy_choices: {plant_id: plant.id, worker_representation: variant}}, ppsFields);
          if (variant === 'consultative') {
            // One act of the public owner in the same decision (12.4: small, 0 / 0, after the act).
            const project = createProject(Q, 'enterprise_representation', 'consultative', fields);
            Object.assign(project, {status: 'completed', authorized: true, authorization_id: 'owner:' + plant.public_act_id, progress: 100,
              started_at: t, launched_at: t, completed_at: t, first_effect_time: t});
            project.history.push({t: t, kind: 'completed', first_effect_time: t});
            applyOnce(project, 'first', () => representationEffects(Q, project, t));
            return result(Q, L('The workers of the ' + plantLabel(plant) + ' are informed and consulted before any change of their conditions, without a veto; their grievance −2 at the next monthly settlement.',
              'Robotnicy zakładu (' + plantLabel(plant) + ') są informowani i konsultowani przed każdą zmianą swoich warunków, bez prawa weta; ' +
              'ich niezadowolenie −2 przy następnym miesięcznym rozliczeniu.'));
          }
          const project = prepareProject(Q, 'enterprise_representation', 'decision_rights', fields,
            {match: p => p.variant === 'decision_rights' && p.policy_choices.plant_id === plant.id});
          plant.codecision_project_id = project.id;
          plant.history.push({t: t, kind: 'codecision_prepared', project_id: project.id});
          return result(Q, L('Co-decision in the ' + plantLabel(plant) + ' is prepared: its law and launch wait in the agenda, then 1 B a month for two months.',
            'Współdecydowanie (' + plantLabel(plant) + ') jest przygotowane: jego ustawa i uruchomienie czekają w agendzie, potem 1 B miesięcznie przez dwa miesiące.'));
        }
        if (option === 'orders') {
          const project = createProject(Q, 'orders', 'orders', Object.assign({policy_choices: {buyer: 'the state railways and administration',
            suppliers: 'domestic industry', profile: 'synthetic_orders_v1'}}, ppsFields));
          launchProject(Q, project, {sponsor: 'pps'});
          return result(Q, L('One package of public orders runs for three settlements: 1 B a month.', 'Jeden pakiet zamówień publicznych trwa przez trzy rozliczenia: 1 B miesięcznie.'));
        }
        const financing = option === 'credit' ? 'public' : option;
        prepareProject(Q, 'credit_instrument', financing, ppsFields);
        return result(Q, L('The credit instrument is prepared (' + VARIANT_NAMES[financing] + '). Its launch waits in the agenda.',
          'Instrument kredytowy jest przygotowany (' + VARIANT_NAMES_PL[financing] + '). Jego uruchomienie czeka w agendzie.'));
      }
      case 'public_works': {
        prepareProject(Q, 'public_works', option, ppsFields);
        return result(Q, L('The works programme is prepared (' + VARIANT_NAMES[option] + '). Its launch waits in the agenda.',
          'Program robót jest przygotowany (' + VARIANT_NAMES_PL[option] + '). Jego uruchomienie czeka w agendzie.'));
      }
      case 'land_program': {
        const access = (extra && extra.access) || 'equal';
        const project = prepareProject(Q, 'land_program', option, Object.assign({policy_choices: {access: access}}, ppsFields));
        if (!project.tranche) project.tranche = nextTranche(S, 'land_program', option);
        return result(Q, L('The land reform is prepared (' + VARIANT_NAMES[option] + ', ' + (access === 'equal' ? 'equal access by need and farm size' :
          'preference for the Polish majority') + '). Its law and launch wait in the agenda.', 'Reforma rolna jest przygotowana (' + VARIANT_NAMES_PL[option] + ', ' +
          (access === 'equal' ? 'równy dostęp według potrzeb i wielkości gospodarstwa' : 'pierwszeństwo dla polskiej większości') +
          '). Jej ustawa i uruchomienie czekają w agendzie.'));
      }
      case 'agriculture_development':
      case 'education_program':
      case 'minority_school_rights': {
        const typeId = cardId === 'agriculture_development' ? 'agriculture_development' : cardId === 'education_program' ? 'education_program' : 'minority_schools';
        const project = prepareProject(Q, typeId, option, ppsFields, {match: p => p.variant === option || typeId === 'minority_schools'});
        if (PROJECT_TYPES[typeId].tranches && !project.tranche) project.tranche = nextTranche(S, typeId, option);
        if (option === 'polish_dominance') checkConstraints(Q, 'legal_equality', 'discrimination', {instrument: 'polish_dominance'});
        return result(Q, L('The programme is prepared (' + VARIANT_NAMES[option] + '). Its launch waits in the agenda.',
          'Program jest przygotowany (' + VARIANT_NAMES_PL[option] + '). Jego uruchomienie czeka w agendzie.'));
      }
      case 'justice_policy':
        return null;
      case 'heritage_restoration': {
        const object = option.split('_')[0], scope = option.split('_')[1];
        const existing = projectsOf(S, 'heritage', p => p.policy_choices.object === object)[0];
        if (existing && scope === 'restoration' && existing.status === 'executing') {
          // A change of scope updates the charge of the remaining works; one reward at the end (12.8).
          const monthsDone = existing.progress / 100 * existing.duration_months;
          setVariant(existing, 'restoration');
          existing.progress = 100 * monthsDone / existing.duration_months;
          existing.history.push({t: t, kind: 'extended', to: 'restoration'});
          return result(Q, L('The conservation of ' + HERITAGE_OBJECTS[object] + ' becomes a wider restoration: 2 B a month for the remaining works.',
            'Konserwacja ' + heritageName(object, 'gen') + ' staje się szerszą restauracją: 2 B miesięcznie za pozostałe prace.'));
        }
        const fields = Object.assign({policy_choices: {object: object}}, ppsFields);
        if (scope === 'conservation') {
          const project = createProject(Q, 'heritage', 'conservation', fields);
          launchProject(Q, project, {sponsor: 'pps'});
          return result(Q, L('The conservation of ' + HERITAGE_OBJECTS[object] + ' starts: 1 B for two months.',
            'Rusza konserwacja ' + heritageName(object, 'gen') + ': 1 B przez dwa miesiące.'));
        }
        prepareProject(Q, 'heritage', 'restoration', fields, {match: p => p.policy_choices.object === object});
        return result(Q, L('The wider restoration of ' + HERITAGE_OBJECTS[object] + ' is prepared; its launch waits in the agenda.',
          'Szersza restauracja ' + heritageName(object, 'gen') + ' jest przygotowana; jej uruchomienie czeka w agendzie.'));
      }
    }
    throw new Error('chooseOption: unknown card ' + cardId);
  }

  function result(Q, text) {
    Q.pl_gc_result = text;
    return {text: text};
  }

  function lawNote(law) {
    if (!law) return '';
    if (law.status === 'enacted') return L(' The law is in force.', ' Ustawa obowiązuje.');
    if (law.status === 'in_procedure') return L(' The Sejm has passed the law; it waits for the Senate (' + law.senate_notice_due + ').',
      ' Sejm uchwalił ustawę; czeka ona na Senat (' + isoText(law.senate_notice_due) + ').');
    return '';
  }

  // A PPS instrument of card 8.3: one decision, the vote in the same decision, the dated procedure after.
  function adoptInstrument(Q, kind) {
    const S = Q.S, spec = INSTRUMENTS[kind], t = Q.time;
    if (!spec.law) {
      applyInstrument(Q, kind, t, {sponsor: 'pps', pps_answers: true});
      return null;
    }
    return submitLaw(Q, {kind: 'instrument', title: spec.name.charAt(0).toUpperCase() + spec.name.slice(1), sponsor: 'pps',
      programme: {fiscal: spec.position}, pps_vote: 'yes', instrument: kind, points: kind === 'emission' ? emissionPoints(Q) : 0});
  }

  // Display fields of one card: the budget forecast, its running projects, and each option's reason.
  function cardView(Q, cardId) {
    const S = Q.S, card = CARDS[cardId];
    const forecast = economy.budgetAt(S, Q.time);
    const delivery = economy.fiscalDelivery(forecast.budget);
    Q.pl_gc_budget = L('Budget this month: ', 'Budżet w tym miesiącu: ') + signed(round(forecast.budget, 2), 2) + ' B (' +
      (delivery === 1 ? L('programmes run in full', 'programy działają w pełni') : delivery === 0.5 ?
        L('programmes run at half strength', 'programy działają w połowie') : L('programmes are stopped', 'programy są wstrzymane')) + ').';
    const types = Object.keys(PROJECT_TYPES).filter(id => PROJECT_TYPES[id].card === cardId || (cardId === 'industrial_policy' && id === 'credit_instrument') ||
      (cardId === 'finance_package' && id === 'collection'));
    const lines = projectsOf(S, null, p => types.indexOf(p.type) >= 0).map(p => describeProject(p, S));
    Q.pl_gc_projects = lines.length ? lines.join(' ') : L('No project of this card yet.', 'Ta karta nie ma jeszcze projektu.');
    for (const option of card.options) {
      const status = optionStatus(Q, cardId, option);
      Q['pl_' + cardId + '_' + option + '_why'] = status.reason;
    }
    const unions = unionsModule();
    if (cardId === 'labor_rights' && unions && S.unions) {
      for (const branch of unions.BRANCHES) Q['pl_collective_' + branch + '_why'] = optionStatus(Q, cardId, 'collective', {branch: branch}).reason;
    }
    if (cardId === 'industrial_policy') {
      for (const variant of ['consultative', 'decision_rights']) Q['pl_rep_' + variant + '_why'] = optionStatus(Q, cardId, 'worker_representation', {variant: variant}).reason;
    }
    Q.pl_gc_plants = unions && S.enterprises && (cardId === 'labor_rights' || cardId === 'industrial_policy') ? unions.plantsLine(S) : '';
    Q.pl_gc_result = '';
  }

  function describeProject(p, S) {
    const type = PROJECT_TYPES[p.type];
    const plant = S && p.policy_choices && p.policy_choices.plant_id ? plantOf(S, p.policy_choices.plant_id) : null;
    if (PL()) {
      const namePl = PROJECT_NAMES_PL[p.type] + (p.policy_choices && p.policy_choices.object ? ' — ' + heritageName(p.policy_choices.object) : '') +
        (plant ? ' — ' + plantLabel(plant) : '') +
        ' (' + VARIANT_NAMES_PL[p.variant] + (p.tranche ? ', transza ' + p.tranche : '') + (p.scope > 1 ? ', zakres ' + p.scope : '') + ')';
      let statePl;
      if (p.status === 'prepared' || p.status === 'idea') statePl = p.status === 'idea' ? 'w przygotowaniu' : 'przygotowanie zakończone, czeka na uruchomienie';
      else if (p.status === 'executing') statePl = p.authorized ? 'w realizacji: ' + Math.round(p.progress) + '%, ' + num(p.build_budget_B) + ' B miesięcznie' : 'czeka na ustawę';
      else if (p.status === 'operating') statePl = 'w działaniu: ' + num(p.upkeep_budget_B) + ' B miesięcznie' + (p.ends_at ? ' do ' + rules.monthYear(p.ends_at - 1, 'gen') : '');
      else if (p.status === 'completed') statePl = 'realizacja zakończona';
      else statePl = p.status;
      const reason = p.interruption_reason && (p.status === 'executing' || p.status === 'operating') ? rules.storedText(p.interruption_reason).replace(/\.$/, '') : '';
      return namePl + ': ' + statePl + (reason ? '; ' + reason.charAt(0).toLowerCase() + reason.slice(1) : '') + '.';
    }
    const name = type.name + (p.policy_choices && p.policy_choices.object ? ' — ' + HERITAGE_OBJECTS[p.policy_choices.object] : '') +
      (plant ? ' — the ' + plantLabel(plant) : '') +
      ' (' + VARIANT_NAMES[p.variant] + (p.tranche ? ', tranche ' + p.tranche : '') + (p.scope > 1 ? ', scope ' + p.scope : '') + ')';
    let state;
    if (p.status === 'prepared' || p.status === 'idea') state = p.status === 'idea' ? 'in preparation' : 'prepared, waiting for its launch';
    else if (p.status === 'executing') state = p.authorized ? 'being built, ' + Math.round(p.progress) + '%, ' + p.build_budget_B + ' B a month' : 'waiting for its law';
    else if (p.status === 'operating') state = 'operating, ' + p.upkeep_budget_B + ' B a month' + (p.ends_at ? ' until ' + rules.monthOf(p.ends_at - 1) + '/' + rules.yearOf(p.ends_at - 1) : '');
    else if (p.status === 'completed') state = 'completed';
    else state = p.status;
    const note = p.interruption_reason && (p.status === 'executing' || p.status === 'operating') ? ' ' + p.interruption_reason.replace(/\.$/, '') : '';
    return name + ': ' + state + note + '.';
  }

  // ---- The agenda: launching prepared reforms (12.2) -------------------------------------------------

  const AGENDA_TYPES = Object.freeze(['public_works', 'credit_instrument', 'land_program', 'agriculture_development', 'education_program',
    'minority_schools', 'heritage', 'currency_reform', 'plant_rescue', 'enterprise_representation', 'army_control', 'limited_autonomy']);

  function agendaProject(S, typeId) {
    return projectsOf(S, typeId, p => p.status === 'prepared' && p.sponsor === 'pps')[0] || null;
  }

  function agendaStatus(Q, item) {
    const S = Q.S;
    if (!S || S.chapter.status === 'ended') return no('');
    if (item.indexOf('submit_') === 0) {
      const reform = item.slice(7);
      const project = constitutionProject(S, reform);
      if (!project || project.preparation < 50) return no(L('Not prepared.', 'Nieprzygotowane.'));
      return constitutionStatus(Q, reform);
    }
    const project = agendaProject(S, item);
    if (!project) return no(L('Nothing prepared.', 'Nic nie jest przygotowane.'));
    const type = PROJECT_TYPES[item];
    // The parliamentary route of card 7.5 files the law without the portfolio; the cabinet executes it (8.5).
    const viaParliament = item === 'army_control' && project.policy_choices.via === 'parliament';
    if (!viaParliament && !ppsHoldsAny(S, type.portfolios)) return no(L('PPS no longer holds ' + type.portfolios.map(k => PORTFOLIO_SHORT[k]).join(' or ') + '.',
      'PPS nie ma już resortu ' + type.portfolios.map(portfolioShort).join(' ani ') + '.'));
    if (project.rejected_forecast && project.rejected_forecast === lawForecastKey(Q, project)) return no(L('The same law was refused and nothing has changed since.', 'Ta sama ustawa została odrzucona i od tego czasu nic się nie zmieniło.'));
    if (!rules.mainActionAvailable(Q)) return no(L('This month’s action has already been used.', 'Akcja tego miesiąca została już wykorzystana.'));
    const financing = item === 'currency_reform' ? launchFinancing(Q, project) : {kinds: [], policy: 0};
    if (financing.blocked) return no(financing.blocked);
    if (item === 'credit_instrument' && project.variant === 'banks' && S.economy.credit < 40) return no(L('Credit is below 40: the banks no longer agree.', 'Kredyt jest poniżej 40: banki już się nie zgadzają.'));
    // P: the currency reform answers the financial crisis of 11.9 and is not a voluntary programme of 11.3,
    // so, like the cabinet's necessary package, it may start below −2 B; its cost still limits execution.
    if (item !== 'currency_reform' && forecastWith(Q, {charge: project.build_budget_B, policy: financing.policy, tax: financing.tax || 0}) < -2) return no(forecastBlock());
    return OK;
  }

  // The necessary package of the stabilisation is part of its launch (17.12): rapid cuts need adopted
  // cuts of at least 1 B, the protected variant an operating protection and its financing.
  function launchFinancing(Q, project) {
    const S = Q.S, E = S.economy, t = Q.time;
    const kinds = [];
    if (project.variant === 'rapid_cuts' && !runningInstrument(E, 'admin_cuts', t) && !runningInstrument(E, 'benefit_cut', t)) kinds.push('admin_cuts');
    if (project.variant === 'protected') {
      if (!operatingProtection(S)) return {blocked: L('Needs a full or an agreed limited protection for the unemployed.', 'Wymaga pełnej albo uzgodnionej ograniczonej osłony dla bezrobotnych.'), kinds: []};
      if (!runningInstrument(E, 'wealth_tax', t) && !runningInstrument(E, 'loan', t)) {
        const kind = !instrumentBlocked(Q, 'wealth_tax') ? 'wealth_tax' : !instrumentBlocked(Q, 'loan') ? 'loan' : null;
        if (!kind) return {blocked: L('No financing of the protection is available: neither a wealth tax nor a loan.', 'Brak finansowania osłony: nie ma ani podatku majątkowego, ani pożyczki.'), kinds: []};
        kinds.push(kind);
      }
    }
    const policy = kinds.reduce((n, kind) => n + ((INSTRUMENTS[kind].schedule || [[0, 0]])[0][1]), 0);
    return {kinds: kinds, policy: policy};
  }

  function agendaChoose(Q, item) {
    const S = Q.S, t = Q.time;
    const status = agendaStatus(Q, item);
    if (!status.available) throw new Error('agendaChoose: ' + item + ': ' + status.reason);
    if (item.indexOf('submit_') === 0) {
      const out = constitutionChoose(Q, item.slice(7), 'agenda');
      return result(Q, out.law.status === 'rejected' ? L('The motion fails: ' + out.law.reason + '.', 'Wniosek upada: ' + rules.storedText(out.law.reason) + '.') :
        L('The Sejm adopts the constitutional reform by two thirds; the Senate votes on ' + out.law.senate_notice_due + '.',
          'Sejm przyjmuje reformę konstytucyjną większością dwóch trzecich; Senat głosuje ' + isoText(out.law.senate_notice_due) + '.'));
    }
    const project = agendaProject(S, item);
    rules.commitMainAction(Q, 'project.launch.' + item, {project_id: project.id});
    if (item === 'currency_reform') {
      const financing = launchFinancing(Q, project);
      const law = projectLaw(project);
      const kinds = financing.kinds;
      project.status = 'executing';
      project.started_at = t;
      project.charge_from = t;
      project.launched_at = t;
      const pkg = {id: 'pkg-pps-' + (S.economy.packages.length + 1) + '-t' + t, cabinet_id: S.cabinet.id, proposed_at: t, vote_at: t,
        instruments: kinds, project_id: project.id, necessary: false, reason: 'stabilisation', revision_of: null, pps_answer: 'support',
        pps_vote: 'yes', evaluations: [], position: packagePosition(kinds, 0), status: 'pending', law_id: null};
      S.economy.packages.push(pkg);
      const bill = submitLaw(Q, {kind: 'package', title: law.title + ' (' + VARIANT_NAMES[project.variant] + ')', package_id: pkg.id,
        project_id: project.id, sponsor: 'pps', programme: Object.assign({}, law.programme, {fiscal: pkg.position}), pps_vote: 'yes'});
      pkg.law_id = bill.id;
      project.law_id = bill.id;
      if (bill.status === 'rejected') {
        project.status = 'prepared';
        project.started_at = null;
        return result(Q, L('The Sejm rejects the currency law; the reform stays prepared.', 'Sejm odrzuca ustawę walutową; reforma pozostaje przygotowana.'));
      }
      return result(Q, L('The currency reform is launched' + (kinds.length ? ' with ' + kinds.map(k => INSTRUMENTS[k].name).join(' and ') : '') + '.',
        'Reforma walutowa zostaje uruchomiona' + (kinds.length ? ' wraz z: ' + kinds.map(instrumentName).join(' i ') : '') + '.') + lawNote(bill));
    }
    const law = launchProject(Q, project, {sponsor: 'pps'});
    if (law && law.status === 'rejected') return result(Q, L('The Sejm rejects the law; the programme stays prepared.', 'Sejm odrzuca ustawę; program pozostaje przygotowany.'));
    return result(Q, L(PROJECT_TYPES[item].name + ' launched: ' + project.build_budget_B + ' B a month while it is built.',
      PROJECT_NAMES_PL[item] + ': uruchomiono; ' + num(project.build_budget_B) + ' B miesięcznie w czasie budowy.') + lawNote(law));
  }

  function agendaItemsFor(Q) {
    const S = Q.S;
    const items = AGENDA_TYPES.filter(type => agendaProject(S, type)).concat(REFORMS.map(reform => 'submit_' + reform)
      .filter(item => { const project = constitutionProject(S, item.slice(7)); return project && project.preparation >= 50 && project.status === 'idea'; }));
    return items;
  }

  function agendaAvailable(Q) {
    const S = Q.S;
    if (!S || S.chapter.status === 'ended' || government.formationPending(Q)) return false;
    return agendaItemsFor(Q).length > 0;
  }

  function agendaView(Q) {
    const S = Q.S;
    const lines = [];
    for (const item of agendaItemsFor(Q)) {
      const status = agendaStatus(Q, item);
      Q['pl_agenda_' + item + '_why'] = status.reason;
      if (item.indexOf('submit_') === 0) {
        const reform = item.slice(7);
        lines.push(L('Constitutional reform — ' + VARIANT_NAMES[reform] + ': the text is prepared; filing the motion puts it to the vote of both chambers.',
          'Reforma konstytucyjna — ' + VARIANT_NAMES_PL[reform] + ': tekst jest przygotowany; złożenie wniosku poddaje go pod głosowanie obu izb.'));
      } else {
        const project = agendaProject(S, item);
        lines.push(describeProject(project, S).replace(/\.$/, '') + L('; building costs ' + project.build_budget_B + ' B a month for ' + project.duration_months +
          ' months' + (project.upkeep_budget_B ? ', then ' + project.upkeep_budget_B + ' B to run' : '') + '.',
          '; budowa kosztuje ' + num(project.build_budget_B) + ' B miesięcznie przez ' + months(project.duration_months) +
          (project.upkeep_budget_B ? ', potem ' + num(project.upkeep_budget_B) + ' B na utrzymanie' : '') + '.'));
      }
    }
    for (const item of AGENDA_TYPES.concat(REFORMS.map(r => 'submit_' + r))) {
      if (Q['pl_agenda_' + item + '_why'] === undefined) Q['pl_agenda_' + item + '_why'] = '';
    }
    Q.pl_agenda_lines = lines.join(' ');
    Q.pl_agenda_budget = L('Budget this month: ', 'Budżet w tym miesiącu: ') + signed(round(economy.budgetAt(S, Q.time).budget, 2), 2) + ' B.';
    Q.pl_gc_result = '';
  }

  // ---- Economic events (catalogue 9.11–9.13; 17.13) ----------------------------------------------

  // 9.11: a financial crisis without a stabilisation project; one project only.
  function stabilizationEventDue(Q) {
    const S = Q.S;
    if (!S || S.chapter.status === 'ended' || !S.economy) return false;
    if (currencyProject(S)) return false;
    return economy.fiscalCrisis(S.economy) || economy.currencyCrisis(S.economy);
  }

  // 9.12: the credit crisis, shown only with executive access of PPS (B16).
  function creditEventDue(Q) {
    const S = Q.S;
    if (!S || S.chapter.status === 'ended' || !S.economy) return false;
    if (!economy.creditCrisis(S.economy, Q.time)) return false;
    return ppsHoldsAny(S, ['finance', 'economic', 'labor']);
  }

  // 9.13: I–IV 1926, the review of the protection: the sixth month of Skrzyński's cabinet with a full
  // protection of 2 B, or a budget below −2 for two months with an operating protection; once.
  function austerityEventDue(Q) {
    const S = Q.S, t = Q.time;
    if (!S || S.chapter.status === 'ended' || !S.economy || S.economy.austerity_review) return false;
    if (t < T(1926, 1) || t > T(1926, 4) || !cabinetActive(S)) return false;
    const stance = government.ppsStance(S);
    if (stance !== 'member' && stance !== 'supporter') return false;
    const protection = operatingProtection(S);
    if (!protection || protection.variant !== 'full' || protection.upkeep_budget_B < 2) return false;
    const review = S.cabinet.pm === 'skrzynski' && t >= S.cabinet.formed_at + 5;
    return review || economy.fiscalCrisis(S.economy);
  }

  function eventStatus(Q, kind, option) {
    const S = Q.S;
    if (kind === 'stabilization') {
      if (option === 'variants') return ppsHolds(S, 'finance') ? OK : no(L('Needs executive access: PPS does not hold the Treasury.', 'Wymaga dostępu wykonawczego: PPS nie ma resortu Skarbu.'));
      if (['rapid_cuts', 'protected', 'gradual'].indexOf(option) >= 0) {
        if (!ppsHolds(S, 'finance')) return no(L('Needs the Treasury.', 'Wymaga resortu Skarbu.'));
        if (option === 'protected' && !operatingProtection(S)) return no(L('Needs a full or an agreed limited protection for the unemployed.', 'Wymaga pełnej albo uzgodnionej ograniczonej osłony dla bezrobotnych.'));
        return OK;
      }
      // B14 (9.7): without the Treasury the answer is the toleration offer to Grabski in the formation card.
      if (option === 'protections_terms') {
        if (ppsHolds(S, 'finance')) return no(L('PPS holds the Treasury: it decides the reform itself.', 'PPS ma resort Skarbu: sama decyduje o reformie.'));
        const offer = government.tolerationOfferStatus(Q);
        return offer.available ? OK : no(offer.reason);
      }
      if (option === 'wait') return ppsHolds(S, 'finance') ? no(L('PPS holds the Treasury: it decides the reform itself.', 'PPS ma resort Skarbu: sama decyduje o reformie.')) : OK;
      return no(L('Unknown option.', 'Nieznana opcja.'));
    }
    if (kind === 'credit') {
      if (option === 'credit') {
        if (!ppsHoldsAny(S, ['finance', 'economic'])) return no(L('Needs the Treasury or Industry and Trade.', 'Wymaga resortu Skarbu albo Przemysłu i Handlu.'));
        const instrument = projectsOf(S, 'credit_instrument')[0];
        if (instrument) return no(L('The credit instrument already exists; it is launched from the agenda.', 'Instrument kredytowy już istnieje; uruchamia się go z agendy.'));
        return OK;
      }
      if (option === 'orders') {
        if (ppsHolds(S, 'economic') && !projectsOf(S, 'orders', p => liveProject(p)).length) return OK;
        const works = agendaProject(S, 'public_works');
        if (ppsHolds(S, 'labor') && works) return OK;
        return no(L('Needs Industry and Trade for orders, or Labour with prepared public works.', 'Wymaga resortu Przemysłu i Handlu dla zamówień albo resortu Pracy z przygotowanymi robotami publicznymi.'));
      }
      if (option === 'protection') {
        if (!ppsHolds(S, 'labor')) return no(L('Needs Labour.', 'Wymaga resortu Pracy.'));
        const protection = operatingProtection(S);
        if (protection && protection.scope >= 3) return no(L('The protection already covers its full scope.', 'Osłona obejmuje już pełny zakres.'));
        return OK;
      }
      if (option === 'none') return OK;
      return no(L('Unknown option.', 'Nieznana opcja.'));
    }
    return no(L('Unknown event.', 'Nieznane wydarzenie.'));
  }

  // The first answer to an event costs 0 T; the costs of the intervention are the ordinary ones.
  function eventChoose(Q, kind, option) {
    const S = Q.S, t = Q.time;
    const status = eventStatus(Q, kind, option);
    if (!status.available) throw new Error('eventChoose: ' + kind + '.' + option + ': ' + status.reason);
    S.history.actions.push({t: t, action_id: 'event.' + kind + '.' + option, cost_t: 0});
    const ppsFields = {sponsor: 'pps', responsibility: {pps: 0.70}};
    if (kind === 'stabilization') {
      if (option === 'wait') return result(Q, L('The cabinet prepares the reform itself; PPS can answer its package with the Budget card.', 'Gabinet sam przygotowuje reformę; PPS może odpowiedzieć na jego pakiet kartą „Budżet”.'));
      if (option === 'protections_terms') {
        government.openTolerationOffer(Q);
        return result(Q, L('PPS answers with a toleration offer to Grabski; its terms are set in the formation card.', 'PPS odpowiada ofertą tolerowania gabinetu Grabskiego; jej warunki ustala się w karcie formowania gabinetu.'));
      }
      prepareProject(Q, 'currency_reform', option, ppsFields);
      return result(Q, L('The currency reform is prepared (' + VARIANT_NAMES[option] + '). Its launch waits in the agenda.',
        'Reforma walutowa jest przygotowana (' + VARIANT_NAMES_PL[option] + '). Jej uruchomienie czeka w agendzie.'));
    }
    if (option === 'credit') {
      prepareProject(Q, 'credit_instrument', 'public', ppsFields);
      return result(Q, L('A conditional credit instrument is prepared; its launch waits in the agenda.', 'Warunkowy instrument kredytowy jest przygotowany; jego uruchomienie czeka w agendzie.'));
    }
    if (option === 'orders') {
      if (ppsHolds(S, 'economic') && !projectsOf(S, 'orders', p => liveProject(p)).length) {
        const project = createProject(Q, 'orders', 'orders', Object.assign({policy_choices: {profile: 'synthetic_orders_v1'}}, ppsFields));
        launchProject(Q, project, {sponsor: 'pps'});
        return result(Q, L('A package of public orders runs for three settlements.', 'Pakiet zamówień publicznych trwa przez trzy rozliczenia.'));
      }
      const works = agendaProject(S, 'public_works');
      launchProject(Q, works, {sponsor: 'pps'});
      return result(Q, L('The prepared public works are launched.', 'Przygotowane roboty publiczne zostają uruchomione.'));
    }
    if (option === 'protection') {
      const protection = operatingProtection(S);
      if (!protection) {
        const project = createProject(Q, 'worker_protection', 'full', ppsFields);
        launchProject(Q, project, {sponsor: 'pps'});
      } else {
        protection.scope = (protection.scope || 1) + 1;
        setVariant(protection, protection.variant === 'full' ? 'full' : protection.variant);
      }
      return result(Q, L('The protection for those losing work is strengthened; unemployment itself does not fall.', 'Osłona dla tracących pracę zostaje wzmocniona; samo bezrobocie nie spada.'));
    }
    return result(Q, L('No new intervention.', 'Bez nowej interwencji.'));
  }

  // 9.13 through the four answers of 9.8: the one compromise keeps 2 B with the existing financing.
  const KEEP_PROTECTION = Object.freeze({id: 'keep_full_protection', programme: Object.freeze({fiscal: 1})});

  function austerityOffer(S) {
    const offer = government.cabinetAsOffer(S);
    offer.by = 'pps';
    offer.kind = 'support_demand';
    offer.programme = Object.assign({}, S.cabinet.programme || {}, KEEP_PROTECTION.programme);
    return offer;
  }

  function austerityChoose(Q, option) {
    const S = Q.S, t = Q.time;
    S.economy.austerity_review = {t: t, option: option, cabinet_id: S.cabinet.id, status: 'open'};
    S.history.actions.push({t: t, action_id: 'event.austerity_1926.' + option, cost_t: 0});
    government.syncRelations(Q);
    if (option === 'withdraw') {
      const left = government.leaveCabinet(Q, 'pps', 'austerity_review');
      government.writeGovernmentMirrors(Q);
      S.economy.austerity_review.status = 'pps_left';
      return {option: option, fell: left.fell, accepted: false};
    }
    if (option === 'bargain' || option === 'persuade') {
      const offer = austerityOffer(S);
      const discounted = option === 'bargain' && S.cabinet.pps_threat_discounted;
      const evaluations = government.demandEvaluators(S).map(id => government.evaluatePartner(S, id, offer,
        option === 'bargain' && !discounted ? government.governmentNeed(Q, id, offer) : 0));
      const accepted = evaluations.length > 0 && evaluations.every(e => e.accept);
      S.economy.austerity_review.evaluations = evaluations;
      if (accepted) {
        S.economy.austerity_review.status = 'compromise';
        if (option === 'bargain') {
          for (const e of evaluations) if (S.actors.relations[e.actor] !== undefined) government.changeRelation(Q, e.actor, -3, 'forced_concession:austerity_1926');
        }
        return {option: option, accepted: true, evaluations: evaluations};
      }
      if (option === 'bargain') {
        S.economy.austerity_review.status = 'threat_refused';
        return {option: option, accepted: false, evaluations: evaluations, threat: true};
      }
    }
    // maintain (or a refused persuasion): the cut goes to the vote and passes if it has support.
    const cut = austerityCut(Q, 'abstain');
    return {option: option, accepted: false, cut: cut};
  }

  // After a refused threat: carry it out (leave) or back down (the cut goes to the vote; later threats
  // count as persuasion; reputation −5 once).
  function austerityThreat(Q, choice) {
    const S = Q.S;
    if (choice === 'carry_out') {
      const left = government.leaveCabinet(Q, 'pps', 'austerity_review');
      government.writeGovernmentMirrors(Q);
      S.economy.austerity_review.status = 'pps_left';
      return {fell: left.fell};
    }
    government.changeCredibility(Q, 'backdown:austerity_1926', -5, 'threat_backdown');
    S.cabinet.pps_threat_discounted = true;
    return {cut: austerityCut(Q, 'abstain')};
  }

  // The cut 2 → 1 B needs a change of the law and its support; it gives only +1 B (17.16.4).
  function austerityCut(Q, ppsVote) {
    const S = Q.S;
    const bill = submitLaw(Q, {kind: 'instrument', title: 'Cut of the unemployment benefit', sponsor: 'cabinet', programme: {fiscal: -2},
      pps_vote: ppsVote, instrument: 'benefit_cut'});
    S.economy.austerity_review.status = bill.status === 'rejected' ? 'cut_rejected' : 'cut_adopted';
    S.economy.austerity_review.law_id = bill.id;
    return bill;
  }

  // ---- Displays -------------------------------------------------------------------------------------

  function projectsDisplay(Q) {
    const S = Q.S;
    const lines = projectsOf(S, null, p => p.status !== 'completed' || (p.completed_at !== null && p.completed_at >= Q.time - 3)).map(p => describeProject(p, S));
    const laws = S.parliament.laws.filter(l => l.status === 'in_procedure').map(l => L(l.title + ': passed by the Sejm, ' +
      (l.next_step === 'senate' ? 'the Senate decides by ' + l.senate_notice_due : 'back in the Sejm on ' + l.senate_return_due) + '.',
      rules.storedText(l.title) + ': uchwalona przez Sejm, ' + (l.next_step === 'senate' ? 'Senat decyduje do ' + isoText(l.senate_notice_due) :
        'wraca do Sejmu ' + isoText(l.senate_return_due)) + '.'));
    const pkg = S.economy.pending_package;
    const packageLine = pkg ? L('The cabinet proposes a package (' + (pkg.instruments.map(k => INSTRUMENTS[k].name).join(', ') || 'a project') +
      '); the Sejm votes at the settlement of ' + rules.monthOf(pkg.vote_at) + '/' + rules.yearOf(pkg.vote_at) + '.',
      'Gabinet proponuje pakiet (' + (pkg.instruments.map(instrumentName).join(', ') || 'projekt') + '); Sejm głosuje przy rozliczeniu ' +
      rules.monthYear(pkg.vote_at, 'gen') + '.') : '';
    return {projects: lines.join(' '), laws: laws.join(' '), package: packageLine};
  }

  // Short notices of the main screen: a package before the Sejm, the crises and the dated procedure of D.
  function economyNotices(Q) {
    const S = Q.S, E = S.economy, lines = [];
    const pkg = E.pending_package;
    if (pkg) {
      lines.push(L('The cabinet proposes a package (' + (pkg.instruments.map(kind => INSTRUMENTS[kind].name).join(', ') || 'a project and its law') +
        '); the Sejm votes at the settlement of ' + rules.monthOf(pkg.vote_at) + '/' + rules.yearOf(pkg.vote_at) + '.' +
        (budgetCardAvailable(Q) ? ' PPS can answer it with the Budget card.' : ''),
        'Gabinet proponuje pakiet (' + (pkg.instruments.map(instrumentName).join(', ') || 'projekt i jego ustawa') + '); Sejm głosuje przy rozliczeniu ' +
        rules.monthYear(pkg.vote_at, 'gen') + '.' + (budgetCardAvailable(Q) ? ' PPS może odpowiedzieć kartą „Budżet”.' : '')));
    }
    if (economy.currencyCrisis(E)) {
      lines.push(L('Currency crisis: inflation has been at least 20% a month for two months.',
        'Kryzys walutowy: od dwóch miesięcy inflacja wynosi co najmniej 20% miesięcznie.'));
    } else if (economy.fiscalCrisis(E)) {
      lines.push(L('Fiscal crisis: the budget has been below −2 B for two months.', 'Kryzys budżetowy: od dwóch miesięcy budżet jest poniżej −2 B.'));
    }
    if (economy.creditCrisis(E, Q.time) && !creditEventDue(Q)) {
      lines.push(L('Credit crisis: credit and output fall. Without an executive portfolio PPS acts through its relation to the government.',
        'Kryzys kredytowy: kredyt i produkcja spadają. Bez resortu wykonawczego PPS działa przez swój stosunek do rządu.'));
    }
    const bill = billRecord(S);
    if (bill && bill.status === 'in_procedure') {
      lines.push(L('The unemployment bill has passed the Sejm and waits for the Senate.', 'Ustawa o bezrobociu przeszła przez Sejm i czeka na Senat.'));
    }
    if (bill && bill.status === 'pending' && cabinetActive(S) && ppsMember(S)) {
      lines.push(L('D2 of the unemployment bill waits until PPS is outside the cabinet.', 'Krok D2 ustawy o bezrobociu czeka, aż PPS znajdzie się poza gabinetem.'));
    }
    return lines.join(' ');
  }

  return Object.freeze({
    PROJECT_TYPES: PROJECT_TYPES,
    INSTRUMENTS: INSTRUMENTS,
    CARDS: CARDS,
    REFORMS: REFORMS,
    CABINET_PROFILES: CABINET_PROFILES,
    VARIANT_NAMES: VARIANT_NAMES,
    isoOf: isoOf,
    ppsHolds: ppsHolds,
    createProject: createProject,
    prepareProject: prepareProject,
    launchProject: launchProject,
    stateCanExecute: stateCanExecute,
    processProjects: processProjects,
    startOfPeriod: startOfPeriod,
    operatingProtection: operatingProtection,
    currencyProject: currencyProject,
    projectsOf: projectsOf,
    instrumentBlocked: instrumentBlocked,
    applyInstrument: applyInstrument,
    adoptInstrument: adoptInstrument,
    checkConstraints: checkConstraints,
    contradicts: contradicts,
    sejmCounts: sejmCounts,
    senateCounts: senateCounts,
    submitLaw: submitLaw,
    processLaws: processLaws,
    newPackage: newPackage,
    voteDuePackage: voteDuePackage,
    budgetCardAvailable: budgetCardAvailable,
    budgetOptionStatus: budgetOptionStatus,
    answerBudget: answerBudget,
    budgetView: budgetView,
    cabinetReview: cabinetReview,
    cabinetProfile: cabinetProfile,
    financialCrisis: financialCrisis,
    updateObligations: updateObligations,
    ppsOverdueWeight: ppsOverdueWeight,
    ppsResponsibility: ppsResponsibility,
    settleMonth: settleMonth,
    reformsRecord: reformsRecord,
    constitutionStatus: constitutionStatus,
    constitutionChoose: constitutionChoose,
    constitutionCardAvailable: constitutionCardAvailable,
    billD1Available: billD1Available,
    billD1Choose: billD1Choose,
    billD2Available: billD2Available,
    billD2Status: billD2Status,
    billD2Choose: billD2Choose,
    billView: billView,
    compromiseClubs: compromiseClubs,
    cardAvailable: cardAvailable,
    landAccessStatus: landAccessStatus,
    optionStatus: optionStatus,
    chooseOption: chooseOption,
    cardView: cardView,
    agendaAvailable: agendaAvailable,
    agendaStatus: agendaStatus,
    agendaChoose: agendaChoose,
    agendaView: agendaView,
    agendaItemsFor: agendaItemsFor,
    stabilizationEventDue: stabilizationEventDue,
    creditEventDue: creditEventDue,
    austerityEventDue: austerityEventDue,
    eventStatus: eventStatus,
    eventChoose: eventChoose,
    austerityChoose: austerityChoose,
    austerityThreat: austerityThreat,
    projectsDisplay: projectsDisplay,
    economyNotices: economyNotices,
    describeProject: describeProject,
    PUBLIC_CONTROL_BUSINESS: PUBLIC_CONTROL_BUSINESS,
    INDUSTRY_PLANT_BRANCHES: INDUSTRY_PLANT_BRANCHES,
    rescueStatus: rescueStatus,
    publicControlStatus: publicControlStatus,
    representationStatus: representationStatus,
    plantDecisionStatus: plantDecisionStatus,
    reviewTarget: reviewTarget,
    delegation: delegation,
    autonomyAgreement: autonomyAgreement,
    investigationTarget: investigationTarget,
    protectionTarget: protectionTarget,
    armyProject: armyProject,
    armyOversightAvailable: armyOversightAvailable,
    armyOversightStatus: armyOversightStatus,
    armyOversightChoose: armyOversightChoose,
    armyOversightView: armyOversightView,
  });
}));
