# Polish Adaptation Decision Worksheet

## Purpose

This is a neutral worksheet for decisions that the user will research and
approve. It does not propose Polish historical equivalents, mechanics, dates,
or scope. The existing German game remains the working baseline until a
specific replacement has evidence and approval.

For each section, distinguish `undecided`, `researching`, `approved` and an
approved slice that is `implemented`. Add evidence to `HISTORICAL_SOURCES.md`, then link its Source IDs
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
- **Historical evidence:** Opening institutions and cabinet are recorded under
  `OPENING-CONSTITUTION-1922` and `PONIKOWSKI-FIRST-CABINET`. The approved
  parliament and PPS position are distinguished from historical evidence under
  `OPENING-1922-DESIGN` below.
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
  first Sejm election is November 1922 (relative month 11), followed temporarily
  by May 1928 (relative month 77);
  German date gates retain their existing calendar years; the opening clearly
  identifies the remaining German material as an interim baseline until Polish
  replacements are researched and approved.
- **Chronology decision:** November 1922 is implemented as a Sejm-only election.
  May 1928 and subsequent inherited scheduling remain a labelled continuation
  placeholder; all elections share exact-seat recording. No cutoff is introduced.
- **Open questions:** Later cabinets, presidential succession, later Polish
  scheduled events and the campaign end date require their own approved slices.

### Polish Opening State — approved and implemented, 2 September 2026

- **Opening:** Józef Piłsudski as Naczelnik Państwa; Antoni Ponikowski as prime
  minister of a predominantly expert cabinet; Sejm Ustawodawczy; March
  Constitution with transitional arrangements, not an operating Senate or
  presidential-election system at the start.
- **Parliament:** Use 444 MPs from January as an explicit simplification. The
  supplied August percentages total 100.1%; normalize them and allocate whole
  MPs by largest remainder, with party order as a deterministic tie-break.

  | Party/group | Supplied % | Opening MPs |
  | --- | ---: | ---: |
  | KPP | 0.5 | 2 |
  | PPS | 7.9 | 35 |
  | NPR | 4.9 | 22 |
  | PSL Wyzwolenie | 5.6 | 25 |
  | PSL Piast | 22.2 | 99 |
  | PSChD | 6.0 | 27 |
  | ZLN | 18.8 | 83 |
  | Minority deputies | 3.9 | 17 |
  | Inne | 30.3 | 134 |
  | **Total** | **100.1** | **444** |

  These are not exact January historical counts or opinion polls. `other` is
  an aggregate; minority deputies are not presented as a January BMN club.
  Party IDs, support rows and the existing KPP label are otherwise unchanged.
- **PPS position:** External toleration, outside cabinet, no ministries. Use
  `pps_external_toleration`, not inherited `spd_toleration`. Campaigning,
  organizing, advisers and militia development keep their existing rules.
- **Ten portfolios:** Labour; Interior; Treasury; Industry & Trade; Justice;
  Foreign Affairs; Agriculture; Military Affairs; Education; Public Works /
  Communications. The Library shows Polish labels and cabinet ownership, not
  named ministers or appointment actions. The last two are state/display only;
  Public Works / Communications combines historical departments.
- **Authority:** Under the approved election safeguards, inherited Prussian
  government/police-command options, executive education and German toleration
  management are unavailable. Existing ministry checks block taxation and
  appointments. Government Affairs stays hidden even at month six to avoid an
  empty deck. Police/army figures, `spd_prussia` force compatibility, militia
  calculations and unrelated events are retained.
- **Lifecycle:** Ordinary actions and monthly polling do not change opening
  seats or cabinet. Existing government replacement retires opening labels,
  toleration and unassigned portfolio placeholders without overwriting new
  assignments. Only the authoritative election writer replaces the opening
  parliament; polling and stray legacy percentage writes cannot do so.
  Cabinet replacement no longer clears the head-of-state identity.
- **Boundary:** The January cabinet snapshot can persist beyond its historical
  period; from March the UI warns that later cabinet chronology is missing.
  November now triggers the approved election below; no Senate or presidential
  succession is automatically created. Later cabinets remain unresearched.
- **Acceptance:** Real-engine tests cover initialization, allowed/blocked
  choices, campaign→month progression, date gates, government/election cleanup
  and same-version saves. Browser checks cover start, cabinet, all 444 dots and
  a fundraising turn into February. Build/tests and D3/image checks are required.
- **Evidence/files:** `OPENING-1922-DESIGN`, `SU-1922-AUGUST-COMPOSITION`,
  `OPENING-CONSTITUTION-1922`, `PONIKOWSKI-FIRST-CABINET`;
  `source/scenes/root.scene.dry`, `source/scenes/polish_opening_state.scene.dry`,
  `source/scenes/status.scene.dry`, `source/scenes/library.scene.dry`,
  `source/scenes/main.scene.dry`, `source/scenes/post_event.scene.dry`,
  `source/scenes/events/election_1928.scene.dry`, the targeted authority guards,
  and `tests/polish-opening-state.test.js`.

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
  adviser, strike, and faction scenes plus new organization state. The faction
  slice only separates the inherited Labor measure from the active PPS
  factions; it does not implement a researched ZSZ organization.
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
- **Historical evidence required:** Party descriptions and opening public-support
  values are approved gameplay inputs, not established historical facts.
  Validation is **TBD — historical research required**. Opening parliamentary
  seats now use the separate August-share approximation in section 2, not polling.
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

- **Status: undecided / researching / approved:** approved faction and adviser
  playable slice implemented; historical validation and dependent Polish
  systems remain.
- **User decision:** The active PPS faction model has **Centrum PPS 50**,
  **Lewica PPS 15**, and **Piłsudczycy 35**, with opening dissents 0, 20 and 5.
  The complete visible adviser pool contains fourteen Polish politicians, of
  whom at most three are active. Daszyński, Pużak and Perl are active in
  January 1922. Every action uses the shared six-month cooldown.
- **Implemented adviser roster:** Centrum — Ignacy Daszyński, Kazimierz Pużak,
  Feliks Perl, Mieczysław Niedziałkowski and Tomasz Arciszewski; Lewica —
  Zygmunt Zaremba, Kazimierz Czapiński, Adam Próchnik, Stanisław Dubois and
  Bolesław Drobner; Piłsudczycy — Rajmund Jaworowski, Jędrzej Moraczewski,
  Bronisław Ziemięcki and Marian Malinowski.
- **Implemented availability:** Próchnik and Drobner enter in 1928 and Dubois
  in 1930. Perl leaves in April 1927. Daszyński leaves at the beginning of
  1931 as the conservative interpretation of the approved year-only date.
  Split departures affect only advisers whose entry date has arrived.
- **Implemented leadership rule:** First appointment gives the associated
  faction +5 strength; dismissal gives it +5 dissent; reappointment cannot
  repeat the strength bonus. Starting advisers are already marked as appointed.
- **Implemented split departures:** Centrum crisis removes Daszyński, Perl and
  Niedziałkowski; Lewica split removes Czapiński and, if already entered,
  Próchnik, Dubois and Drobner; Piłsudczyk split removes Jaworowski,
  Moraczewski and Malinowski. Pużak, Arciszewski, Zaremba and Ziemięcki remain.
- **Implemented boundary:** Adviser actions use semantic PPS faction and Polish
  relationship variables directly. Actions depending on Centrolew, Sanacja,
  PPS-dFR, municipal government, a Polish economic programme or formal joint
  action with KPP remain explicitly planned. Dubois opens the PPS self-defence
  card but grants no free manpower or militancy.
- **Historical evidence required:** The supplied roster, faction placement,
  availability/departure schedule and political roles are approved gameplay
  inputs but remain **TBD — historical research required** as historical claims.
- **Acceptance criteria:** Three active slots; all fourteen Polish adviser cards
  exist; the approved starting six actions work; availability and named split
  departures are deterministic; later entrants survive earlier splits; no
  German adviser is selectable; build and complete automated path tests pass.
- **Open questions:** Successor-party creation, precise 1931 departure month,
  adviser portraits, repression/imprisonment, and the gated dependent actions
  remain separate future slices.

## 14. Election and coalition design

- **Status: undecided / researching / approved:** November 1922 slice implemented; later chronology planned
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

### November 1922 election — approved playable slice

- **Player path:** October action → monthly processing → mandatory November
  election → recorded result → an existing Polish government choice → ordinary
  November play. Results and government selection charge no monthly action.
  Dendry automatic routes are mutually exclusive so the election cannot be
  randomly bypassed. Other eligible events resume afterwards.
- **Distinct state:** live voting intentions, immutable recorded votes/seats,
  and sitting parliamentary seats. Opening MPs retain the approved August-share
  approximation. Election records do not invent a prior vote from that snapshot.
- **Allocation:** 444 integer MPs; majority is 223. Unrounded national votes use
  multipliers 0.25 below 2%, 0.55 at 2%, 0.85 at 5%, 1.025 at 10%, 1.10 at 15%,
  and 1.25 at 25%. Normalize weights, floor seat quotas, then award largest
  remainders; exact ties use lexical list IDs. The user confirms calibration;
  recalibration and geographic concentration are not outstanding work here.
  Band-edge jumps and normalization are intentional properties of this rule.
- **Inne:** preserve total support, split into anonymous 2% lists plus a smaller
  remainder. Allocate each separately and aggregate only for display. No single
  Other-list bonus, joint coalition or fictitious named parties.
- **ChZJN:** first election only, ZLN + PSChD. Combine votes before applying
  the multiplier. Attribute its integer seats by those parties' support at the
  election, using largest remainders. Results, status and seat charts show one
  bloc; the parties stay separate for relationships and cabinet membership.
- **Government:** retain the six choices and existing relationship gates;
  count exact MPs. External minority-bloc support does not make it a cabinet
  member. An already-majority PPS–Wyzwolenie cabinet is not labelled minority.
  Opposition remains a voluntary choice. Reset stale government/portfolio flags;
  no new named ministers, ministry allocation or presidential succession.
- **Safeguards:** retain force/support/faction adapters. Keep Prussian executive
  and police options blocked after the opening; exclude German War Guilt,
  confidence/toleration and old cabinet-allocation entry routes. Generic welfare
  remains explicitly temporary. No general German-content shutdown or cutoff.
- **Continuation:** after November set May 1928, then retain subsequent legacy
  date requests/four-year cadence through the same result writer. ChZJN is not
  automatically recreated in later elections. No new first-election threshold
  or ban; subsequent constitutional-reform exclusions remain compatibility.
- **Saves:** persist the election ID/phase and one result. New-game/same-version
  saves are supported; no older-save migration is promised.
- **Evidence/verification:** `SEJM-1922-ELECTION-DESIGN` in the research register;
  `source/scenes/sejm_election.scene.dry`, `sejm_election_result.scene.dry`,
  `polish_opening_state.scene.dry`, updated UI and legacy entry guards;
  `tests/sejm-election.test.js` and optional `tests/sejm-browser-smoke.cjs`.

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

- **Status: undecided / researching / approved:** approved playable slice implemented
- **User decision:** Milicja PPS exists in January 1922 with 200 active
  organized members and 0.10 militancy. The player can reorganize it into
  Akcja Socjalistyczna, preserving membership and adding a provisional 0.10
  militancy. They are two stages of one organization, separate from any later
  Polish equivalent of the Iron Front.
- **Historical evidence required:** Formation, chronology, membership, role,
  relationship to PPS, and use of force are **TBD — historical research
  required**.
- **Design rationale:** Preserve the approved progression from defensive party
  militia to more organized socialist self-defence without incorrectly mapping
  it onto the German cross-party Iron Front.
- **Original mechanic affected:** Reichsbanner strength/militancy, Iron Front
  formation, rally defence, street fighting, bans, repression, and faction
  reactions.
- **Implemented boundary:** Semantic stage, strength, militancy, legal status,
  union cooperation, investment, rally defence, street conflict and inherited
  crisis calculations are active. The German Iron Front and cross-party exodus
  are gated out of the Polish path. Legacy `rb_*` fields are a synchronized
  compatibility shadow only.
- **Acceptance criteria:** Opening state is exactly 200/0.10, stage one is
  legal and unrepressed, reorganization is one-time and produces stage two at
  unchanged strength/0.20 militancy, unions add no strength, all self-defence
  power calculations use semantic state, and tests/build/UI pass.
- **Open questions:** Exact historical dates, leadership, recruitment scale,
  state repression and semantic Polish opponent variables remain pending.

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
| 2, 12, 14 — Polish Opening State | 2026-09-02 | 444-MP opening; Ponikowski external toleration; ten read-only portfolios; narrow authority guards; unchanged election scheduler and no cutoff | OPENING-1922-DESIGN; SU-1922-AUGUST-COMPOSITION; OPENING-CONSTITUTION-1922; PONIKOWSKI-FIRST-CABINET | Implemented working-tree slice; not committed |
| 2, 14 — November Sejm election | 2026-09-02 | Approved bands; Other at 2%; ChZJN support-based attribution/grouped display; 444 MPs/223 majority; no monthly charge; safeguards and temporary continuation | SEJM-1922-ELECTION-DESIGN | Implemented working-tree slice; not committed or pushed |
