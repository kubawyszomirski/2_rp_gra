# Historical Source Register

## Purpose

This is an empty research register. It contains no historical claims,
citations, proposed equivalents, or example facts. Create one entry for each
source/claim relationship so that evidence, design interpretation, licensing,
and implementation can be reviewed independently.

Do not assume that an image, recording, or other media asset is covered by the
repository's MIT code licence. Record the asset's own licence, attribution,
source location, and permitted use in its entry. Preserve
`credits_images.txt` and `credits_music.txt` when implementation begins.

## Contents

1. [People](#people)
2. [Political parties and factions](#political-parties-and-factions)
3. [Elections and parliamentary composition](#elections-and-parliamentary-composition)
4. [Governments and coalitions](#governments-and-coalitions)
5. [Institutions and constitutional powers](#institutions-and-constitutional-powers)
6. [Economic statistics](#economic-statistics)
7. [Labor unions and social organizations](#labor-unions-and-social-organizations)
8. [Political violence and paramilitary organizations](#political-violence-and-paramilitary-organizations)
9. [Domestic events](#domestic-events)
10. [Foreign relations and international events](#foreign-relations-and-international-events)
11. [Regional and demographic data](#regional-and-demographic-data)
12. [Images](#images)
13. [Music and audio](#music-and-audio)

## Entry rules

- Leave unknown fields as `TBD — user historical research required.`
- Separate source evidence from design interpretation.
- Copy only the shortest exact evidence needed and always record its page or
  archive location.
- Record conflicts instead of silently selecting one account.
- Use the four classification fields to distinguish documented historical
  fact, gameplay simplification, alternate-history departure, and unresolved
  work.
- Do not mark implementation complete until the related decision in `PLAN.md`
  is approved and the cited source supports the implemented claim.

## People

### Source entry PEOPLE-TBD

- **Source ID:** TBD
- **Claim or game element supported:** TBD
- **Category:** people
- **Relevant date or period:** TBD
- **Full citation:** TBD
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** TBD
- **Confidence:** TBD
- **Conflicting sources:** TBD
- **Intended gameplay use:** TBD
- **Historical fact:** TBD
- **Gameplay simplification:** TBD
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** TBD
- **Implementation status:** TBD
- **Related mechanic, variable and source file:** TBD

## Political parties and factions

### Source entry PPS-DESIGN-TBD

- **Source ID:** PPS-DESIGN-TBD
- **Claim or game element supported:** PPS player identity, approved Polish
  opening-party support matrix, and implemented Centrum/Lewica/Piłsudczycy faction
  model.
- **Category:** political parties and factions
- **Relevant date or period:** January 1922 onward
- **Full citation:** TBD — user historical research required.
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** No historical source is recorded yet. The
  implemented gameplay matrix covers KPP, PPS, NPR, PSL Wyzwolenie, PSL Piast,
  PSChD, ZLN, Blok Mniejszości Narodowych and Inne across all seven population
  groups. The eight user-supplied named-party values are proportionally scaled
  so Inne receives 8% per row and 12% among Chłopi. The implemented faction
  opening is Centrum 50/0 dissent, Lewica 15/20, and Piłsudczycy 35/5, with
  60-dissent consequence designs.
- **Confidence:** Historical confidence TBD; implementation confidence applies
  only to the user-approved gameplay values.
- **Conflicting sources:** TBD
- **Intended gameplay use:** Opening polling/elections, campaigning,
  relationships, first-cycle coalitions, and the active faction/split slice.
- **Historical fact:** **TBD — historical research required.**
- **Gameplay simplification:** Active elections use semantic Polish IDs. A
  narrow compatibility map carries inherited `spd`, `kpd`, `dvp`, and `dnvp`
  support deltas into PPS, KPP, PSChD and ZLN. A separate bridge transfers
  inherited German card faction deltas into the three active PPS currents;
  this is not a historical equivalence. The active adviser roster is now
  Polish, while most dated content remains temporary baseline material.
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** None identified for design text;
  future source requirements TBD.
- **Implementation status:** Nine-party opening matrix, direct campaigning,
  initial relationships, first-election coalition shell, three-faction model,
  fourteen-person PPS adviser pool, and immediate 60-dissent consequences
  implemented. Later parties and historically conditioned successor formation
  remain planned.
- **Related mechanic, variable and source file:** `parties`, semantic
  `<class>_<party>` families, `legacy_party_map`, relationship and coalition
  fields, `factions`, `source/scenes/root.scene.dry`, status, Library,
  campaigning, relationships, elections, and future faction/adviser/split
  scenes.

### Source entry PPS-ADVISERS-USER-DESIGN

- **Source ID:** PPS-ADVISERS-USER-DESIGN
- **Claim or game element supported:** Approved playable PPS adviser pool,
  faction assignments, entry/departure schedule, named split departures and
  action directions.
- **Category:** party leadership and factions
- **Relevant date or period:** January 1922 onward
- **Full citation:** User-supplied gameplay design in the project conversation;
  no external historical source supplied.
- **Author:** Project owner
- **Publication:** Project design decision
- **Page number:** Not applicable
- **URL or archive location:** Not applicable
- **Date accessed:** 31 August 2026
- **Exact claim or evidence extracted:** Fourteen advisers are assigned to
  Centrum, Lewica or Piłsudczycy; Daszyński, Pużak and Perl are the opening
  active team; Próchnik and Drobner enter in 1928 and Dubois in 1930; Perl
  leaves in April 1927 and Daszyński in 1931; named faction-split departures
  follow the approved matrix and apply only after a person's entry date.
- **Confidence:** High as an approved gameplay specification; historical
  confidence **TBD — historical research required**.
- **Conflicting sources:** Not investigated.
- **Intended gameplay use:** Active adviser roster, leadership changes,
  cooldown actions, date gating and faction-split consequences.
- **Historical fact:** **TBD — historical research required.** The roster,
  dates, roles and split behavior must not be cited as established history from
  this entry alone.
- **Gameplay simplification:** Three active slots; a shared six-month cooldown;
  first appointment gives +5 faction strength; dismissal gives +5 faction
  dissent; reappointment gives no repeated strength bonus. The year-only 1931
  Daszyński departure is provisionally applied in January.
- **Alternate-history departure:** Adviser availability after faction splits
  follows the approved gameplay matrix; successor parties are not yet formed.
- **Licensing or attribution requirements:** None for the supplied design text;
  future portrait assets require separate licensing review.
- **Implementation status:** Implemented. Actions needing Centrolew, Sanacja,
  PPS-dFR, municipal government, a Polish economic programme or formal PPS–KPP
  joint action remain explicitly planned.
- **Related mechanic, variable and source file:** Fourteen semantic adviser
  flags, `*_appointed_once`, `*_left_adviser_pool`, `n_advisors`,
  `advisor_action_timer`, `source/scenes/advisors/`, leadership management,
  `post_event`, and the three PPS split scenes.

### Source entry PARTY-TBD

- **Source ID:** TBD
- **Claim or game element supported:** TBD
- **Category:** political parties and factions
- **Relevant date or period:** TBD
- **Full citation:** TBD
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** TBD
- **Confidence:** TBD
- **Conflicting sources:** TBD
- **Intended gameplay use:** TBD
- **Historical fact:** TBD
- **Gameplay simplification:** TBD
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** TBD
- **Implementation status:** TBD
- **Related mechanic, variable and source file:** TBD

## Elections and parliamentary composition

### Source entry ELECTION-TBD

- **Source ID:** TBD
- **Claim or game element supported:** TBD
- **Category:** elections and parliamentary composition
- **Relevant date or period:** TBD
- **Full citation:** TBD
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** TBD
- **Confidence:** TBD
- **Conflicting sources:** TBD
- **Intended gameplay use:** TBD
- **Historical fact:** TBD
- **Gameplay simplification:** TBD
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** TBD
- **Implementation status:** TBD
- **Related mechanic, variable and source file:** TBD

## Governments and coalitions

### Source entry POLISH-COALITION-DESIGN-TBD

- **Source ID:** POLISH-COALITION-DESIGN-TBD
- **Claim or game element supported:** First-cycle Polish coalition and
  toleration shell.
- **Category:** governments and coalitions
- **Relevant date or period:** Opening electoral cycle; exact historical date TBD
- **Full citation:** TBD — user historical research required.
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** User-approved gameplay combinations are Koalicja
  Lewicy (PPS + PSL Wyzwolenie + Minorities Bloc), centre-left (PPS + both PSL
  parties + NPR), Chjeno-Piast (ZLN + PSChD + PSL Piast), and a PPS–PSL
  Wyzwolenie minority government externally tolerated by the Minorities Bloc.
- **Confidence:** Historical confidence TBD; implementation confidence applies
  only to the approved gameplay rules.
- **Conflicting sources:** TBD
- **Intended gameplay use:** First election and government-state setup.
- **Historical fact:** **TBD — historical research required.** The implemented
  formulas and placeholder leadership must not be cited as historical fact.
- **Gameplay simplification:** Percentages stand in for seats; a 50% threshold
  is used; named ministers are deliberately left TBD.
- **Alternate-history departure:** Depends on election results and player choice.
- **Licensing or attribution requirements:** None identified for design text.
- **Implementation status:** Implemented for the first-election shell only.
  Centrolew, Sanacja, broad coalition/fronts, democratic classification and
  crisis rules remain planned.
- **Related mechanic, variable and source file:** Polish `_r` fields,
  relationship values, coalition totals and flags in
  `source/scenes/events/election_1928.scene.dry`.

### Source entry GOVERNMENT-TBD

- **Source ID:** TBD
- **Claim or game element supported:** TBD
- **Category:** governments and coalitions
- **Relevant date or period:** TBD
- **Full citation:** TBD
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** TBD
- **Confidence:** TBD
- **Conflicting sources:** TBD
- **Intended gameplay use:** TBD
- **Historical fact:** TBD
- **Gameplay simplification:** TBD
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** TBD
- **Implementation status:** TBD
- **Related mechanic, variable and source file:** TBD

## Institutions and constitutional powers

### Source entry INSTITUTION-TBD

- **Source ID:** TBD
- **Claim or game element supported:** TBD
- **Category:** institutions and constitutional powers
- **Relevant date or period:** TBD
- **Full citation:** TBD
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** TBD
- **Confidence:** TBD
- **Conflicting sources:** TBD
- **Intended gameplay use:** TBD
- **Historical fact:** TBD
- **Gameplay simplification:** TBD
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** TBD
- **Implementation status:** TBD
- **Related mechanic, variable and source file:** TBD

## Economic statistics

### Source entry ECONOMY-TBD

- **Source ID:** TBD
- **Claim or game element supported:** TBD
- **Category:** economic statistics
- **Relevant date or period:** TBD
- **Full citation:** TBD
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** TBD
- **Confidence:** TBD
- **Conflicting sources:** TBD
- **Intended gameplay use:** TBD
- **Historical fact:** TBD
- **Gameplay simplification:** TBD
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** TBD
- **Implementation status:** TBD
- **Related mechanic, variable and source file:** TBD

## Labor unions and social organizations

### Source entry PPS-ORGANIZATIONS-DESIGN-TBD

- **Source ID:** PPS-ORGANIZATIONS-DESIGN-TBD
- **Claim or game element supported:** Planned ZSZ affiliate, PPS social world,
  and press/propaganda structure.
- **Category:** labor unions and social organizations
- **Relevant date or period:** 1922–1939
- **Full citation:** TBD — user historical research required.
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** User-approved design names ZSZ; TUR, OM TUR,
  Czerwone Harcerstwo TUR, RTPD, worker sport, cooperatives and housing; and a
  press network centered on *Robotnik*, with regional papers, later censorship,
  and no independent radio branch. No repository source validates the
  historical descriptions, chronology, scale, or relationships yet.
- **Confidence:** TBD
- **Conflicting sources:** TBD
- **Intended gameplay use:** Future affiliated-union, organization, welfare,
  youth, recruitment, propaganda, and censorship mechanics.
- **Historical fact:** **TBD — historical research required.**
- **Gameplay simplification:** Planned aggregate systems; exact variables and
  thresholds are not approved.
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** TBD
- **Implementation status:** Approved design only; not implemented. The
  inherited Labor/ADGB measure is separated from active PPS factions. The game
  now has Polish advisers, but still preserves German-baseline organization and
  media cards beneath some adviser entry points.
- **Related mechanic, variable and source file:** Affiliated Labor compatibility measure,
  `unions_independent`, party-organization/media timers and scenes, welfare,
  youth, culture, cooperatives, strikes, and future dedicated state.

### Source entry ORGANIZATION-TBD

- **Source ID:** TBD
- **Claim or game element supported:** TBD
- **Category:** labor unions and social organizations
- **Relevant date or period:** TBD
- **Full citation:** TBD
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** TBD
- **Confidence:** TBD
- **Conflicting sources:** TBD
- **Intended gameplay use:** TBD
- **Historical fact:** TBD
- **Gameplay simplification:** TBD
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** TBD
- **Implementation status:** TBD
- **Related mechanic, variable and source file:** TBD

## Political violence and paramilitary organizations

### Source entry PPS-MILITIA-DESIGN-TBD

- **Source ID:** PPS-MILITIA-DESIGN-TBD
- **Claim or game element supported:** Implemented Milicja PPS to Akcja
  Socjalistyczna two-stage gameplay organization.
- **Category:** political violence and paramilitary organizations
- **Relevant date or period:** 1922–1939
- **Full citation:** TBD — user historical research required.
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** The approved design treats Milicja PPS and AS as
  two stages of one PPS self-defence organization, mechanically separate from
  any later Polish equivalent of the Iron Front. The user-approved opening is
  200 active organized members at 0.10 militancy; reorganization preserves
  strength and adds a provisional 0.10 militancy. Historical formation, dates,
  membership, activity, and state response are not yet sourced.
- **Confidence:** TBD
- **Conflicting sources:** TBD
- **Intended gameplay use:** Rally/strike defence, organization strength,
  militancy, street confrontation, repression, and faction effects.
- **Historical fact:** **TBD — historical research required.**
- **Gameplay simplification:** Implemented stage/strength/militancy model;
  approved opponents are nationalist militias, communist militias and state
  police. Union cooperation does not merge manpower.
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** TBD
- **Implementation status:** Playable slice implemented. Semantic PPS militia
  state drives organization, rally, street-conflict and crisis calculations;
  the Iron Front remains separate and is disabled in the Polish path.
- **Related mechanic, variable and source file:** `pps_militia_stage`,
  `pps_militia_strength`, `pps_militia_militancy`, union/legal state,
  `source/scenes/party_affairs/reichsbanner.scene.dry`, rally,
  street-fighting and crisis scenes.

### Source entry VIOLENCE-TBD

- **Source ID:** TBD
- **Claim or game element supported:** TBD
- **Category:** political violence and paramilitary organizations
- **Relevant date or period:** TBD
- **Full citation:** TBD
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** TBD
- **Confidence:** TBD
- **Conflicting sources:** TBD
- **Intended gameplay use:** TBD
- **Historical fact:** TBD
- **Gameplay simplification:** TBD
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** TBD
- **Implementation status:** TBD
- **Related mechanic, variable and source file:** TBD

## Domestic events

### Source entry DOMESTIC-TBD

- **Source ID:** TBD
- **Claim or game element supported:** TBD
- **Category:** domestic events
- **Relevant date or period:** TBD
- **Full citation:** TBD
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** TBD
- **Confidence:** TBD
- **Conflicting sources:** TBD
- **Intended gameplay use:** TBD
- **Historical fact:** TBD
- **Gameplay simplification:** TBD
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** TBD
- **Implementation status:** TBD
- **Related mechanic, variable and source file:** TBD

## Foreign relations and international events

### Source entry FOREIGN-TBD

- **Source ID:** TBD
- **Claim or game element supported:** TBD
- **Category:** foreign relations and international events
- **Relevant date or period:** TBD
- **Full citation:** TBD
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** TBD
- **Confidence:** TBD
- **Conflicting sources:** TBD
- **Intended gameplay use:** TBD
- **Historical fact:** TBD
- **Gameplay simplification:** TBD
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** TBD
- **Implementation status:** TBD
- **Related mechanic, variable and source file:** TBD

## Regional and demographic data

### Source entry REGIONAL-POPULATION-DESIGN-TBD

- **Source ID:** REGIONAL-POPULATION-DESIGN-TBD
- **Claim or game element supported:** Approved January 1922 population model,
  its linear 1939 endpoint, and the provisional composition of Mniejszości
  Narodowe.
- **Category:** regional and demographic data
- **Relevant date or period:** January 1922–December 1939
- **Full citation:** TBD
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** No historical evidence is recorded yet. The
  current figures are user-approved gameplay inputs: five main classes are
  normalized to 100%; Chłopi/Robotnicy move linearly 53/27 to 50/30;
  Bezrobotni start at 3%; Mniejszości Narodowe are a 30% overlapping group.
  Their provisional approximate composition is 60% Chłopi, 17% Robotnicy, 19%
  Drobnomieszczaństwo, 3% Inteligencja, and 2% Burżuazja i Ziemiaństwo.
- **Confidence:** TBD
- **Conflicting sources:** TBD
- **Intended gameplay use:** Opening demographic weights, long-term structural
  trend, election support weighting, and player-facing demographic reference.
- **Historical fact:** **TBD — historical research required.** Do not cite
  these design figures as established historical facts.
- **Gameplay simplification:** Implemented for the approved playable slice.
  Polacy are the implied complement and are not a separate weighted group.
  Minority composition is descriptive only. Burżuazja i Ziemiaństwo and
  Mniejszości Narodowe now have dedicated approved opening party rows. The
  minority dimension remains an overlapping 30% weight; only inherited
  Catholic-targeting PPS deltas are bridged into it.
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** TBD
- **Implementation status:** Implemented as a gameplay model with dedicated
  opening profiles; historical validation and a possible intersection model
  remain pending.
- **Related mechanic, variable and source file:** `classes`, `workers`,
  `old_middle`, `new_middle`, `rural`, `bourgeois_landowners`, `unemployed`,
  `national_minorities`, and dynamic class-party fields in
  `source/scenes/root.scene.dry`, `source/scenes/post_event.scene.dry`, and
  `source/scenes/election_algorithm.scene.dry`.

## Images

### Source entry IMAGE-TBD

- **Source ID:** TBD
- **Claim or game element supported:** TBD
- **Category:** images
- **Relevant date or period:** TBD
- **Full citation:** TBD
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** TBD
- **Confidence:** TBD
- **Conflicting sources:** TBD
- **Intended gameplay use:** TBD
- **Historical fact:** TBD
- **Gameplay simplification:** TBD
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** TBD
- **Implementation status:** TBD
- **Related mechanic, variable and source file:** TBD

## Music and audio

### Source entry AUDIO-TBD

- **Source ID:** TBD
- **Claim or game element supported:** TBD
- **Category:** music and audio
- **Relevant date or period:** TBD
- **Full citation:** TBD
- **Author:** TBD
- **Publication:** TBD
- **Page number:** TBD
- **URL or archive location:** TBD
- **Date accessed:** TBD
- **Primary or secondary source:** TBD
- **Exact evidence or notes:** TBD
- **Confidence:** TBD
- **Conflicting sources:** TBD
- **Intended gameplay use:** TBD
- **Historical fact:** TBD
- **Gameplay simplification:** TBD
- **Alternate-history departure:** TBD
- **Licensing or attribution requirements:** TBD
- **Implementation status:** TBD
- **Related mechanic, variable and source file:** TBD

## Register index

Add one row whenever an entry above is assigned a stable Source ID.

| Source ID | Category | Short claim/game element | Status | Related PLAN.md decision |
| --- | --- | --- | --- | --- |
| TBD | TBD | TBD | TBD | TBD |
