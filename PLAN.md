# Polish Adaptation Decision Worksheet

## Purpose

This is a neutral worksheet for decisions that the user will research and
approve. It does not propose Polish historical equivalents, mechanics, dates,
or scope. The existing German game remains the working baseline until a
specific replacement has evidence and approval.

For each section, change **Status** only to one of `undecided`, `researching`,
or `approved`. Add evidence to `HISTORICAL_SOURCES.md`, then link its Source IDs
here. Use `MECHANICS_MAP.md` and `STATE_VARIABLES.md` to trace the original
mechanic and implementation surface.

## Contents

1. [Game premise](#1-game-premise)
2. [Start and end dates](#2-start-and-end-dates)
3. [Player role and political scope](#3-player-role-and-political-scope)
4. [Historical constraints](#4-historical-constraints)
5. [Alternate-history boundaries](#5-alternate-history-boundaries)
6. [Victory and defeat conditions](#6-victory-and-defeat-conditions)
7. [Campaign length](#7-campaign-length)
8. [Core mechanics to retain](#8-core-mechanics-to-retain)
9. [Mechanics to adapt](#9-mechanics-to-adapt)
10. [Mechanics to remove](#10-mechanics-to-remove)
11. [New mechanics to add](#11-new-mechanics-to-add)
12. [Political parties and institutions](#12-political-parties-and-institutions)
13. [Factions and advisers](#13-factions-and-advisers)
14. [Election and coalition design](#14-election-and-coalition-design)
15. [Economic design](#15-economic-design)
16. [Political violence and institutional loyalty](#16-political-violence-and-institutional-loyalty)
17. [Content scope](#17-content-scope)
18. [Language and localization](#18-language-and-localization)
19. [Visual and audio direction](#19-visual-and-audio-direction)
20. [Accessibility](#20-accessibility)
21. [Testing](#21-testing)
22. [Deployment](#22-deployment)
23. [Milestones](#23-milestones)
24. [Minimum playable prototype](#24-minimum-playable-prototype)
25. [Out-of-scope features](#25-out-of-scope-features)

## 1. Game premise

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 2. Start and end dates

- **Status: undecided / researching / approved:** researching
- **User decision:** The campaign starts in **January 1922**. This date is now
  implemented.
  The campaign end date remains TBD — user decision required.
- **Historical evidence required:** Evidence supporting the historical framing
  and opening political situation for January 1922 is **TBD — historical
  research required**.
- **Design rationale:** The January 1922 start date is approved. A fuller
  rationale remains TBD — user decision required.
- **Original mechanic affected:** The German baseline initialized January 1928
  and schedules elections, events, advisers, policies, and endings from that
  calendar. Initialization now begins in January 1922; the retained German
  dated content has not been shifted.
- **Variables/files likely affected:** `year`, `month`, `time`,
  `next_election_year`, `next_election_month`, and all dated conditions under
  `source/scenes/events/`; initialization in
  `source/scenes/root.scene.dry`; reconciliation in
  `source/scenes/post_event.scene.dry`.
- **Acceptance criteria:** New games initialize and display January 1922; the
  retained May 1928 election is represented consistently as relative month 77;
  German date gates retain their existing calendar years; the opening clearly
  identifies the remaining German material as an interim baseline until Polish
  replacements are researched and approved.
- **Open questions:** Campaign end date, first election date, opening office
  holders and parliamentary state, and the first set of scheduled events are
  TBD — user historical research and design decision required.

## 3. Player role and political scope

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 4. Historical constraints

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 5. Alternate-history boundaries

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 6. Victory and defeat conditions

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 7. Campaign length

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 8. Core mechanics to retain

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 9. Mechanics to adapt

- **Status: undecided / researching / approved:** implemented (population and opening-party slice)
- **User decision:** Implement Robotnicy, Drobnomieszczaństwo, Inteligencja,
  Chłopi, Burżuazja i Ziemiaństwo, Bezrobotni, and Mniejszości Narodowe for new
  games. The five main classes total 100%; Bezrobotni and Mniejszości Narodowe
  overlap them. Polacy are the implied complement and are not separately
  weighted. The subsequent approved opening-party slice now supplies dedicated
  support rows for all seven groups.
- **Historical evidence required:** Class shares, minority composition, and
  historical validation remains **TBD — historical research required**. The
  approved figures are implemented as gameplay design values, not documented
  historical facts.
- **Design rationale:** Chłopi decline linearly from 53% in January 1922 to 50%
  in December 1939 while Robotnicy rise from 27% to 30%. Opening Bezrobotni are
  3%; Mniejszości Narodowe are 30%.
- **Original mechanic affected:** Demographic support weighting, campaigning,
  election simulation, SAPD formation, and player-facing demographic details.
- **Variables/files likely affected:** `classes`, demographic weights, dynamic
  class-party families, `source/scenes/root.scene.dry`, `post_event.scene.dry`,
  `election_algorithm.scene.dry`, `election_simulation.scene.dry`,
  `library.scene.dry`, `party_affairs/campaigning.scene.dry`, and tests.
- **Acceptance criteria:** Opening main classes total exactly 100%; approved
  linear endpoints are exact; unemployment starts at 3%; minorities are
  weighted at 30%; no active Catholic support group is displayed; all seven
  approved party-support rows work; all affected election paths remain
  finite and build/tests pass.
- **Open questions:** Historically supported class figures, a possible future
  intersection model for minority weighting, campaign chronology through
  1939, and old-save migration remain outside this approved slice.

## 10. Mechanics to remove

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 11. New mechanics to add

- **Status: undecided / researching / approved:** approved design; not implemented
- **User decision:** A later slice will model ZSZ as an affiliated trade-union
  power center rather than a PPS faction; the PPS social world (TUR, OM TUR,
  Czerwone Harcerstwo TUR, RTPD, worker sport, cooperatives, and housing);
  press centered on *Robotnik* with no independent radio apparatus; and
  censorship/resilience after the May Coup. Existing party action cards stay
  unchanged in PPS-1.
- **Historical evidence required:** All organizational roles, dates, scale,
  relationships, and censorship behavior are **TBD — historical research
  required**.
- **Design rationale:** Separate affiliated organizations from formal faction
  strength while preserving their ability to affect support, mobilization,
  recruitment, dissent, and resilience.
- **Original mechanic affected:** Labor faction/ADGB, party organizations,
  media/propaganda, workers' welfare, youth, culture, cooperatives, and timers.
- **Variables/files likely affected:** Party-organization, media, labor,
  adviser, strike, and faction scenes plus new organization state. None are
  changed by PPS-1.
- **Acceptance criteria:** A future bounded slice must define ownership,
  strength/discontent, faction alignment, timers, thresholds, and tests before
  replacing an inherited mechanic.
- **Open questions:** Exact chronology, names, scale, leadership, interactions,
  and source evidence remain pending.

## 12. Political parties and institutions

- **Status: undecided / researching / approved:** implemented (opening-party and first-election slice)
- **User decision:** Active elections use semantic IDs for KPP, PPS, NPR, PSL
  Wyzwolenie, PSL Piast, PSChD, ZLN, Blok Mniejszości Narodowych, and `other`.
  Other receives exactly 8% of each opening support row and 12% among Chłopi;
  the eight supplied party values are proportionally scaled to the remaining
  92% or 88%. The 30% minority identity dimension remains overlapping for now.
- **Historical evidence required:** Party descriptions, opening support values,
  electoral strength and the resulting opening parliamentary projection are
  approved gameplay inputs, not established historical facts. Validation is
  **TBD — historical research required**.
- **Design rationale:** Clear Polish IDs prevent German names from remaining in
  elections, records and charts. A narrow compatibility map transfers inherited
  `spd`→`pps`, `kpd`→`kpp`, `dvp`→`pschd`, and `dnvp`→`zln` support effects
  without reactivating German parties.
- **Original mechanic affected:** Party roster, opening support matrix,
  campaigning, relationships, election simulation/results, coalition shell,
  records, status, Library and D3 colors.
- **Variables/files likely affected:** `parties`, `party_names`, `party_colors`,
  `legacy_party_map`, all semantic class-party families, relationship fields,
  parliamentary `_r` fields and the core party/election scenes.
- **Acceptance criteria:** Nine semantic IDs are active; every row totals 100;
  legacy direct mappings transfer once without duplication; elections and
  records contain all nine parties; UI/charts use Polish labels; build and the
  complete automated path tests pass.
- **Open questions:** Historical validation, ZLN→SN, SL, BBWR, OZN, PPS split
  parties, the post-first-election event calendar and save migration remain
  separate future slices.

## 13. Factions and advisers

- **Status: undecided / researching / approved:** approved design; not implemented
- **User decision:** The future PPS faction model has **Centrum PPS 50**,
  **Lewica PPS 15**, and **Piłsudczycy 35**. The supplied initial dissents are
  0, 20, and 5 respectively. At 60 dissent, each faction can trigger its
  approved split/resignation consequences, with possible PPS-L, SPP, or PPS-dFR
  outcomes depending on chronology and political conditions. German advisers
  remain visible placeholders in PPS-1 and will be assigned or replaced later.
- **Historical evidence required:** Faction definitions, strengths, dissent,
  people, organizations, split names, dates, and destinations are **TBD —
  historical research required**.
- **Design rationale:** The approved three-way model totals 100, but cannot
  safely replace five heavily wired factions without adapting cards, monthly
  dissent, advisers, split events, organizations, and UI together.
- **Original mechanic affected:** Five-faction normalization, dissent,
  party-disunity events, adviser eligibility/departure, support modifiers,
  Labor/union behavior, and SAPD formation.
- **Variables/files likely affected:** `factions`, all faction strength/dissent
  fields, `post_event`, party-disunity and leadership cards, adviser scenes,
  split events, support/election initialization, and status/Library display.
- **Acceptance criteria:** PPS-1 preserves the live five-faction system and
  advisers. A later faction slice must implement all three factions, overall
  dissent, every 60-dissent path, adviser exits, organization effects, and
  regression coverage as one coherent change.
- **Open questions:** Exact split timing/eligibility, successor-party profiles,
  adviser assignments, public-sector/veteran/railway support representation,
  and interactions after an earlier split remain pending.

## 14. Election and coalition design

- **Status: undecided / researching / approved:** implemented first-cycle shell; later systems planned
- **User decision:** The implemented first-election menu may form a PPS
  majority, Koalicja Lewicy (PPS + PSL Wyzwolenie + Minorities Bloc), a
  centre-left coalition (PPS + both PSL parties + NPR), a PPS–PSL Wyzwolenie
  minority government externally tolerated by the Minorities Bloc, or an
  autonomous Chjeno-Piast government (ZLN + PSChD + PSL Piast). Minority
  support is toleration, not cabinet membership.
- **Historical evidence required:** Coalition names, dates, members,
  parliamentary viability, leadership and cabinet allocation are **TBD —
  historical research required**.
- **Design rationale:** Replace German coalition arithmetic on the active first
  election without inventing later democratic classifications, crisis
  conditions or named ministers.
- **Original mechanic affected:** Election result recording, largest-party
  selection, coalition totals, government flags and active election routing.
- **Variables/files likely affected:** `source/scenes/events/election_1928.scene.dry`,
  semantic `_r` fields, `*_relation`, `in_polish_left_coalition`,
  `in_polish_center_left_coalition`, `in_chjeno_piast`,
  `minorities_toleration`, and tests.
- **Acceptance criteria:** All parties receive results and history records;
  coalition sums are deterministic; relationship gates work; toleration keeps
  the Minorities Bloc outside government; inherited German coalition branches
  are unreachable from Polish elections.
- **Open questions:** Democratic classification, Depression realignment,
  broad-coalition crisis rules, Centrolew, Sanacja, United Left, broad
  democratic front, exact ministries and later autonomous governments are
  planned but not implemented.

## 15. Economic design

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 16. Political violence and institutional loyalty

- **Status: undecided / researching / approved:** approved design; not implemented
- **User decision:** Milicja PPS and Akcja Socjalistyczna are two stages of one
  future PPS organization. They remain separate from any later Polish
  equivalent of the Iron Front. PPS-1 retains Reichsbanner/Iron Front mechanics
  unchanged as a visible temporary baseline.
- **Historical evidence required:** Formation, chronology, membership, role,
  relationship to PPS, and use of force are **TBD — historical research
  required**.
- **Design rationale:** Preserve the approved progression from defensive party
  militia to more organized socialist self-defence without incorrectly mapping
  it onto the German cross-party Iron Front.
- **Original mechanic affected:** Reichsbanner strength/militancy, Iron Front
  formation, rally defence, street fighting, bans, repression, and faction
  reactions.
- **Variables/files likely affected:** Paramilitary initialization and status,
  `reichsbanner.scene.dry`, `iron_front.scene.dry`, street-fighting and coup
  events, plus future Milicja/AS stage state.
- **Acceptance criteria:** A later slice must model stage, strength, militancy,
  defensive/confrontational use, repression, faction effects, and relevant
  event outcomes without reusing `iron_front_formed` ambiguously.
- **Open questions:** Exact dates, scale, leadership, legal status, opponents,
  state response, and relationship to unions and other PPS organizations remain
  pending.

## 17. Content scope

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 18. Language and localization

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 19. Visual and audio direction

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 20. Accessibility

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 21. Testing

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 22. Deployment

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 23. Milestones

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 24. Minimum playable prototype

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## 25. Out-of-scope features

- **Status: undecided / researching / approved:** undecided
- **User decision:** TBD — user decision required.
- **Historical evidence required:** TBD — user historical research required.
- **Design rationale:** TBD — user decision required.
- **Original mechanic affected:** TBD — user decision required.
- **Variables/files likely affected:** TBD — user decision required.
- **Acceptance criteria:** TBD — user decision required.
- **Open questions:** TBD — user decision required.

## Approval log

Use this table only after a section above reaches `approved`.

| Decision section | Approval date | Approved wording/version | Related Source IDs | Implementation task/commit |
| --- | --- | --- | --- | --- |
| TBD | TBD | TBD | TBD | TBD |
