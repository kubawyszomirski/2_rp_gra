# Polish Adaptation: Transition Matrix and Content Boundary

Last inspected: **3 September 2026**

Source baseline: **`6568804` — changed stuff 2**, plus the pre-existing untracked
opening/election helpers and tests, this matrix, and the **uncommitted approved
December 1922 presidential slice** inspected below.

> This matrix records implemented slices and proposed next steps; it does not
> authorize further changes. The approved opening, November election and narrow
> post-election safeguards are implemented. A complete first chapter, wider German-content
> exclusions and a campaign endpoint still require approval. No cutoff exists.

## 1. What this document is for

The **transition matrix** is a checklist of what is implemented, what remains
inherited, and what needs to happen next. The **content boundary** is a proposed
rule for keeping unfinished German material out of a completed Polish chapter.

Use this file to answer:

- What has actually been converted?
- What is only a temporary substitute?
- What depends on another unfinished system?
- Which decisions are still needed?
- How will we know that a playable chapter is complete?

This is an overview, not a replacement for the existing living documents:

- [PLAN.md](PLAN.md): approved decisions, scope, milestones, and open questions.
- [MECHANICS_MAP.md](MECHANICS_MAP.md): mechanics and their source dependencies.
- [STATE_VARIABLES.md](STATE_VARIABLES.md): state names, meaning, and contracts.
- [HISTORICAL_SOURCES.md](HISTORICAL_SOURCES.md): evidence and research gaps.
- [Executive game overview](docs/EXECUTIVE_GAME_OVERVIEW.md): player-facing explanation.

An implemented design value is not automatically a historical fact. Population
figures, party support, adviser schedules, faction assignments, and organization
strengths must retain their existing distinction between approved gameplay
design and independently sourced history. Missing historical evidence remains
**TBD — historical research required**.

## 2. How to read the status labels

| Current status | Meaning |
| --- | --- |
| Polish slice | A bounded Polish replacement exists. This does not mean all related systems or historical research are complete. |
| Mixed | Polish behavior and inherited German behavior still share this system. |
| Legacy | The inherited mechanic or content remains; a full Polish replacement is not implemented. |
| Shared infrastructure | Reusable technical behavior, rather than a historical Polish or German institution. |

The **Next step / dependency** column is a recommendation unless it explicitly
refers to an already approved design. It does not approve new game rules.
Evidence codes refer to the repository paths in section 7.

## 3. Transition matrix

### A. Player party and society

| ID / system | Current status | What exists now | What remains unfinished | Next step / dependency |
| --- | --- | --- | --- | --- |
| T01 — Population | Polish slice | Seven approved groups; five main classes total 100%; unemployment and minority identity overlap them; 3% opening unemployment; demographic trend through December 1939. | Crisis-driven unemployment and support effects are inherited. A trend ending in 1939 does not create a playable campaign to that date. Historical validation remains open. | Retain the approved model. Review background effects with T12, not by changing class names again. Evidence: E1, E2. |
| T02 — Parties, support, campaigning | Polish slice | Nine semantic party IDs, support rows, campaigning, polls and a menu-only simulator. First-election ChZJN and anonymous Other lists are a separate allocation layer, not extra parties. | Legacy support effects still use selected mappings. Later party formations, mergers and alliances remain incomplete. | Define party lifecycles only as needed; preserve the votes/seats distinction. Evidence: E2, E3, E18. |
| T03 — PPS factions and splits | Polish slice | Centrum PPS, Lewica PPS, Piłsudczycy; opening strengths 50/15/35; dissents 0/20/5; Polish split/crisis scenes and named adviser departures. | Inherited cards can still affect factions through compatibility state. A split does not yet implement the full later electoral life of its successor organization. | Adapt card effects with T07/T08; design successor parties with T02/T15. Do not recreate the old Labor faction under a Polish name. Evidence: E3, E4. |
| T04 — Advisers | Polish slice | Fourteen Polish advisers; three active slots; Daszyński, Pużak, and Perl at the start; shared cooldown; date-based availability and named split departures. | Some dependent actions remain explicitly planned; historical validation and portraits remain open. Dates after the first prototype endpoint would remain future content. | Unlock dependent actions only when their organization, government, or political-camp system exists. Preserve the rule that a split cannot remove an adviser before their pool-entry date. Evidence: E5. |
| T05 — Milicja PPS / Akcja Socjalistyczna | Mixed | One organization, initially 200 active members and 0.10 militancy; legal and unrepressed; one-time AS reorganization; union cooperation without automatic manpower merger. | Opponent numbers, police/army behavior, and major confrontation outcomes still use inherited systems. Polish repression behavior is not complete. | Retain the approved militia slice; replace opponents and institutional response together with T13. AS must not become an automatic substitute for the Iron Front. Evidence: E6, E9. |
| T06 — Affiliated trade unions | Mixed | An inherited union measure is separated from the three PPS factions; some cooperation and adviser effects exist. | The approved ZSZ direction is not a complete strength/discontent/leadership system. A full strike, negotiation, and political-independence model remains unfinished. | Define the smallest ZSZ loop, including policy demands and dissent, before changing all labor cards. Connect to T03, T05, and T12. Evidence: E3, E4, E7. |
| T07 — Socialist social organizations | Mixed | The Party Organizations card still funds welfare, culture, youth, and newspapers; its militia/youth branches include Polish effects. | Much of the card still describes the SPD social world. TUR, OM TUR, Czerwone Harcerstwo TUR, RTPD, sport, cooperatives, and housing are approved directions, not a fully implemented network. | Select a small opening-era set after research; define costs, benefits, faction effects, and timers. Do not merely relabel every inherited branch. Evidence: E7. |
| T08 — Press and propaganda | Legacy | The Media card still describes SPD newspapers and offers newspaper and radio actions. | A Robotnik-centered press system and later censorship are planned. **The approved no-independent-PPS-radio direction is not yet enforced in this inherited card.** | Implement the press replacement, including its incoming links from organizations/advisers. Remove radio from the active Polish route as part of that approved replacement, not through this document. Evidence: E7. |

### B. Government, economy, and campaign

| ID / system | Current status | What exists now | What remains unfinished | Next step / dependency |
| --- | --- | --- | --- | --- |
| T09 — Elections and parliamentary results | Polish slice | November 1922 mandatory Sejm election; frozen votes, exact 444 seats, calibrated bands, Other at 2% plus remainder, first ChZJN with proportional internal attribution, consistent grouped chart/history. Majority is 223. December freezes these MPs and derives 111 Senate proxies only for the presidential Assembly. | May 1928 and subsequent scheduling/exclusions remain temporary legacy continuation. No general Senate election or later presidential elections. Geography is excluded by decision; calibration and internal ChZJN attribution are resolved design choices. | Research later Polish parliamentary/presidential chronology and alliances, not another rewrite of the completed first allocators. Evidence: E1, E2, E8, E17–E19. |
| T10 — Government, presidency and coalitions | Mixed | Opening toleration remains separate. Six minimal post-election outcomes use exact seats and existing relations. A semantic March-Constitution object, fixed December final ballots, Piłsudski–Narutowicz transfer, assassination response and Wojciechowski presidency are implemented without changing the cabinet. | No researched successor cabinet, permanent Senate, portfolio allocator, new ministry policy, later presidents or variable presidential outcomes. The brief Rataj acting presidency is intentionally omitted from playable state. | Research successor government and later constitutional transitions as separate bounded slices. Evidence: E8, E9, E17–E19. |
| T11 — Calendar and event routing | Mixed | January start, action-driven months and adviser dates. November Sejm routing is exclusive. The next ordinary action advances to December, whose mandatory presidential sequence runs before other events and without another action/month; deferred events resume afterwards. | Next parliamentary election May 1928, later scheduling and unrelated German events/monthly effects remain explicitly temporary. No campaign cutoff. | Research later chronology and separately approve any chapter boundary. Evidence: E1, E5, E10, E18, E19. |
| T12 — Economy, budget, and policy | Legacy | Indicators, budget feedback, growth, unemployment and crisis effects retained. Generic welfare is explicitly marked temporary; unallocated ministries continue to restrict executive policies. | Most of the economy and German-year support drift are not a researched Polish model. | Define the next bounded economy/policy slice; do not change it through election weights. Evidence: E1, E11, E18. |
| T13 — Police, army, opponents, and political violence | Mixed | Approved executive/Prussian police guards persist after elections; militia-only choices and force statistics remain. | Force numbers, loyalty, `spd_prussia` compatibility, coups and civil wars are still inherited. Narrow safeguards are not a full Polish police model. | Approve institutional response and forces together. Depends on T05/T10. Evidence: E6, E9, E10, E17, E18. |
| T14 — Foreign relations | Legacy | Foreign policy, reparations and international events retained, except the approved German war-guilt government route is guarded. | Polish objectives and constraints remain unimplemented as a campaign system. | Research only the next approved foreign-policy slice. Evidence: E12, E18. |
| T15 — Historical story and later party evolution | Legacy | German dated events remain alongside new PPS faction events. | A continuous Polish chronology, later political camps, successor parties, and researched alternate-history branches remain unfinished. | Build consecutive chapters after their required systems exist. Specify causes and consequences, not just replacement text. Depends on T02 and T09–T14. Evidence: E4, E10. |
| T16 — Endings and achievements | Legacy | Inherited terminal routes and achievement checks remain; some read adapted PPS/militia state. | Polish success/failure conditions and a neutral prototype endpoint are not implemented. German endings do not establish the Polish campaign's final date. | Define a non-defeat prototype endpoint first; design final campaign outcomes after the relevant Polish systems are approved. Depends on T11/T15. Evidence: E10, E13. |

### C. Technical foundations and presentation

| ID / system | Current status | What exists now | What remains unfinished | Next step / dependency |
| --- | --- | --- | --- | --- |
| T17 — Turn loop and fixed Normal baseline | Shared infrastructure | Existing card/month/adviser loop retained. November results/formation spend no extra month. Free Library; government deck hidden if no eligible cards remain. | Most party cards remain mixed; no new Polish executive policy loop. | Preserve loop and fixed Normal values. Evidence: E1, E14, E17, E18. |
| T18 — Legacy compatibility | Mixed | Support/faction/militia adapters retained; `_r` and flat election history are derived from canonical integer results. Old result writers and the menu simulator cannot overwrite a live parliament. Polish toleration and narrow government guards remain. `polish_presidency` is authoritative and never writes German `president`/`presidential_powers`; only the replaced 1932 election and 1934 Hindenburg succession routes are guarded. | Other German government/relationship/force/head-of-state readers and writers remain; no global isolation claimed. | Retire adapters only with their dependent replacement; new Polish events must read semantic presidency state. Evidence: E1, E3, E6, E18, E19. |
| T19 — Interface, Library, and media | Mixed | Exact 444 dots; ChZJN grouped in result/sidebar/chart; history separates votes, MPs, seat shares; Status/Library show the authoritative president, constitutional contract, 555-member Assembly and both fixed final ballots/supporters. | German cards/backgrounds/media remain; unchanged font-setting initialization error and missing music request reproduced. | Separate runtime/media follow-up; preserve credits/assets. Evidence: E15, E17–E19. |
| T20 — Build, saves, and verification | Shared infrastructure | Canonical build and 83 tests pass. D3/images are present. Real-browser January→November→December presidential play, 444 chart dots, history, save/reload, disabled choices, 555-member Assembly and Wojciechowski office state pass. | Known font/audio/favicon warnings remain; no full campaign certification or old-save migration. | Preserve complete-path regressions in later slices. Evidence: E16–E19. |

## 4. Implemented-content boundary

### What exists today

- New games start in **January 1922**.
- Approved opening government, 444-MP approximation, ten read-only portfolios
  and narrowly guarded executive/police-command actions are implemented.
- **November 1922's Sejm election is implemented**, with 444 MPs and a 223-MP
  majority. Results and government selection resolve in the same month.
- **December 1922 presidential succession is implemented.** A proportional
  111-seat Senate snapshot combines with the 444 Sejm MPs only for the National
  Assembly. Fixed final ballots produce Narutowicz and then Wojciechowski; the
  brief Rataj acting presidency is an explicit gameplay omission.
- **May 1928 is the temporary next parliamentary date**; later legacy scheduling
  uses the same exact-result writer without recreating ChZJN. Later presidential
  chronology and a general Senate remain unimplemented.
- Cabinet/result replacement clears stale opening metadata, not later event
  effects. Unreplaced January cabinet data is warned about from March onwards.
- The demographic trend reaches **December 1939**, but the campaign has not
  been extended to make that a coherent playable ending.
- Some German branches are already gated out: for example, the three original
  faction-break events are disabled for the Polish faction system, and the
  selectable adviser roster is Polish.
- There is **no complete campaign-wide Polish content boundary**. The opening
  institutional slice is implemented, while its wider simulation remains mixed.

**Last fully coherent Polish month: not yet established or certified.**
This does not mean the game cannot run. It means no start-to-end interval has
been verified as an internally consistent Polish chapter.

### Proposed behavior — not implemented

For the first complete chapter, explicitly classify every reachable card,
event, monthly effect, and terminal route into one of these categories:

| Category | Proposed treatment |
| --- | --- |
| Approved Polish content | Active when its date and state conditions are met. |
| Explicitly accepted temporary mechanic | Active only for a documented purpose, with its inherited assumptions recorded. |
| Unreplaced German-specific content | Not reachable from the completed Polish chapter; keep the source available for reference. |
| Future Polish content | Unavailable until the campaign reaches a chapter that implements its dependencies. |

The boundary would apply to more than text or an event tag. It must cover:

1. Opening officeholders, parliament, factions, organizations, and economy.
2. Deck eligibility, pinned actions, and cards already held in the hand.
3. Direct scene links, return routes, and calls from otherwise permitted cards.
4. Monthly support drift, economic changes, timers, and compatibility transfers.
5. Scheduled events, threshold events, event ordering, and follow-up scenes.
6. Elections, cabinet changes, coups, defeats, and achievements.
7. Status displays, Library entries, charts, and save/resume behavior.

Simply hiding `#event` entries would not be sufficient: an allowed card could
still call a German scene, or monthly processing could still apply its effects.
Conversely, blocking every legacy field would break accepted Polish behavior
that still uses an adapter. Each dependency needs an explicit disposition.

### Proposed first chapter

**January 1922 → first researched and approved Polish parliamentary election
→ initial government/coalition outcome → December presidential succession
→ end-of-prototype summary.**

This complete chapter remains a recommendation, not approved scope. Opening
institutions, November election rules, minimum government outcomes and the
December presidential succession are now implemented. The chapter endpoint and
wider content exclusions are **not** approved.
The endpoint should be defined by a completed outcome, not only a date, so it
does not interrupt an election midway through its choices.

At that endpoint, a future build would say something such as:

> You have reached the end of the currently implemented Polish campaign.

This would be a development limit, not an automatic historical defeat. It
should not silently continue into German content or award German ending
achievements. Whether to offer a summary, save, or restart must be decided
before implementation. Earlier approved failure outcomes would still need
their own explicit rules.

### Decisions required before enforcing the boundary

- [ ] Approve the first chapter's scope and exact endpoint condition.
- [x] Approve and implement the bounded opening officeholders, institutional
      description and simplified parliament (not all surrounding mechanics).
- [x] Approve and implement the first election date, allocation rules, and minimum coalition outcomes.
- [x] Approve and implement the first two presidential elections and the narrow
      German-presidency exclusion they replace.
- [ ] Choose the recurring party actions available during that chapter.
- [ ] Identify temporary economy/organization/institution effects allowed to remain.
- [ ] Define any legitimate failure outcomes within the chapter.
- [ ] Decide what the prototype-end screen permits and how same-version saves resume there.

Unresolved historical elements above remain **TBD — historical research
required**; opening evidence is recorded in `HISTORICAL_SOURCES.md`. This file
grants no authority for further removals while those decisions remain open.

## 5. Recommended implementation order

These are proposed milestones, not newly approved gameplay decisions. A system
only needs enough implementation to support the current chapter; later
features should not delay a smaller coherent prototype.

| Milestone | Deliverable | Completion check |
| --- | --- | --- |
| M0 — Transition inventory | Maintain this matrix; record chapter decisions in PLAN.md; identify active legacy dependencies. | No item is called fully Polish merely because its label changed. |
| M1 — Opening and election contract | Approve starting institutions, first election, minimal government lifecycle, and prototype endpoint. | All initial state and required outcomes have an explicit design and evidence status. |
| M2 — Opening chapter | Implement the minimum PPS actions, economic behavior, elections, and government outcomes needed by M1; enforce its content boundary. | A new game reaches the approved endpoint without unsupported German routes or hidden effects. |
| M3 — Deeper PPS organization | Implement ZSZ, social organizations, and the press in separate bounded tasks. | Each has useful choices, costs, consequences, and faction/support connections; approved no-radio behavior is enforced. |
| M4 — Later chapters | Extend chronology with the economy, institutions, opponents, party evolution, and foreign relations needed by each chapter. | The previous endpoint advances only after the added period passes its complete-path tests. |
| M5 — Full campaign and retirement review | Approve Polish final outcomes; review remaining compatibility state, German content, presentation, and media. | Every remaining legacy dependency is intentional; any removal is separately reviewed and authorized. |

Some organization/economy work from M3/M4 may be required in minimal form for
M2. The goal is dependency-driven order, not a requirement to finish the entire
economy or all organizations before testing the opening chapter.

For each bounded implementation: trace dependencies → research and approval →
implement → test the full affected path → update the living documents → review
the diff. Commit or push only when explicitly requested.

## 6. Acceptance criteria for a completed Polish chapter

**Presidential-slice verification (3 September 2026):** The canonical build and
all 83 tests pass. Twelve presidential tests cover initialization, December
priority routing, 444+111 conservation, fixed ballots/supporters, cabinet and
legacy-field preservation, no numerical PPS effects, Daszyński's prior-departure
case, disabled alternatives, save/re-entry idempotence, Status/Library agreement,
narrow German-route guards and deferred faction events. The extended browser
smoke passes January–November, government selection, the complete December
sequence, 444 rendered MPs, the 555-member Assembly and final Wojciechowski
state. It reproduces the pre-existing `game.js:325` font-setting `toFixed`
error, unsupported/missing opening music, and missing favicon; no new unexpected
browser error or missing asset appears. D3 and source images are present under
`out/html/`. This verifies the bounded path, not a full Polish campaign.

**November-slice verification (3 September 2026):** 71 automated tests cover
the 45 prior checks plus 26 election checks: real campaign/monthly routing,
band boundaries, 2% fragmentation, ChZJN attribution, 444-seat conservation,
222/223 majority gates, relationships, all six outcomes, saved pending/results/
completed states, duplicate entry, old-writer/simulator isolation, later
continuation, simultaneous faction events and guarded German routes. Browser smoke covers January–October
campaign choices, November result/formation, save/reload, 444 visible chart dots,
history and a December action with frozen results. No full campaign is certified.
The existing font-setting `toFixed` error in `out/html/game.js:325` and a 404 for
`music/1928_1930/FruhlingsliedMendelssohn.mp3` remain outside this slice. Build
warnings remain `padLevels` and generated core/jquery overwrites. Test source:
E18. Multiplier calibration is user-confirmed design, not new independent
historical verification; geography is explicitly excluded.

**Previous opening-slice verification (2 September 2026):** Exact opening seat counts;
consistent offices/toleration/ten portfolios; campaign consequences and monthly
progression; blocked executive/police and German toleration choices; month-six,
November/December and legacy election date cases; government/result cleanup;
preserved eligible legacy-event effects; adviser diplomacy and militia development;
same-version save/resume. All 14 new
real-engine tests pass alongside 31 prior tests. Browser checks confirm 444 dots
with matching party colors/counts and a normal January→February fundraising turn.
The build still warns about `padLevels` and generated-file overwrites; the
browser reports existing font-setting and absent-audio problems (plus a missing
favicon request). These do not
certify a whole campaign or a complete UI/audio regression pass.

The following are future verification requirements, **not claims that the
current build already passes them**.

- [ ] A fresh game starts in the approved state with internally consistent
      officeholders, parliament, party support, factions, advisers, and organizations.
- [ ] Every eligible card, adviser action, event, and direct destination has a
      documented Polish or explicitly temporary classification.
- [ ] Monthly processing cannot apply unapproved legacy political or economic
      effects within the chapter.
- [ ] Support totals, party IDs, faction normalization, manpower units, and
      government flags remain consistent after actions and elections.
- [ ] Tests cover date boundaries, faction thresholds, adviser arrivals and
      departures, cooldowns, election resolution, and coalition/toleration outcomes.
- [ ] Multiple eligible events cannot skip, duplicate, or prematurely terminate
      the chapter. Held cards and follow-up routes cannot bypass the boundary.
- [ ] The endpoint resolves exactly once, after required chapter outcomes;
      continuing or reloading cannot resume the inherited German storyline.
- [ ] A representative browser playthrough reaches the endpoint; same-version
      saving/loading preserves it. Old-save migration is not silently promised.
- [ ] `npm run build` succeeds; required D3 and source images appear in `out/html/`;
      `npm test` passes; all warnings and known limitations are reported.
- [ ] PLAN.md, MECHANICS_MAP.md, STATE_VARIABLES.md, HISTORICAL_SOURCES.md, this
      matrix, and the executive overview agree on implemented versus planned behavior.

A German-word scan can flag suspicious content, but it cannot prove isolation:
legitimate historical references may mention Germany, while hidden legacy
effects may contain no German words. Eligibility and state-change tests matter
more than achieving a zero search-result count.

## 7. Repository evidence index

This matrix is based on source inspection and the existing design records, not
a new exhaustive reachability audit or full campaign playthrough. Directory
references identify dependency areas, not proof that every file is reachable.

- **E1 — Start, calendar, and monthly processing:**
  [root.scene.dry](source/scenes/root.scene.dry),
  [post_event.scene.dry](source/scenes/post_event.scene.dry),
  [main.scene.dry](source/scenes/main.scene.dry).
- **E2 — Population, support, and elections:**
  [election_algorithm.scene.dry](source/scenes/election_algorithm.scene.dry),
  [election_simulation.scene.dry](source/scenes/election_simulation.scene.dry),
  [campaigning.scene.dry](source/scenes/party_affairs/campaigning.scene.dry),
  plus E1 and [library.scene.dry](source/scenes/library.scene.dry).
- **E3 — Semantic state and adapters:** E1;
  [inter_party_relationships.scene.dry](source/scenes/party_affairs/inter_party_relationships.scene.dry);
  [STATE_VARIABLES.md](STATE_VARIABLES.md).
- **E4 — Factions and crisis routes:**
  [party_disunity.scene.dry](source/scenes/party_affairs/party_disunity.scene.dry),
  [pps_centrum_crisis.scene.dry](source/scenes/events/pps_centrum_crisis.scene.dry),
  [pps_lewica_split.scene.dry](source/scenes/events/pps_lewica_split.scene.dry),
  [pps_pilsudczycy_split.scene.dry](source/scenes/events/pps_pilsudczycy_split.scene.dry),
  [unions_declare_independence.scene.dry](source/scenes/events/unions_declare_independence.scene.dry).
- **E5 — Adviser roster and availability:**
  [shuffle_leadership.scene.dry](source/scenes/party_affairs/shuffle_leadership.scene.dry),
  [adviser scenes](source/scenes/advisors/), plus E1 and E16.
- **E6 — PPS self-defence and compatibility:**
  [reichsbanner.scene.dry](source/scenes/party_affairs/reichsbanner.scene.dry)
  (the filename is inherited; the card is PPS Self-Defence),
  [streetfighting.scene.dry](source/scenes/party_affairs/streetfighting.scene.dry),
  [rally.scene.dry](source/scenes/party_affairs/rally.scene.dry),
  [iron_front.scene.dry](source/scenes/party_affairs/iron_front.scene.dry), plus E1.
- **E7 — Organizations, press, and labor:**
  [party_organizations.scene.dry](source/scenes/party_affairs/party_organizations.scene.dry),
  [media.scene.dry](source/scenes/party_affairs/media.scene.dry),
  [labor_affairs.scene.dry](source/scenes/government_affairs/labor_affairs.scene.dry),
  and approved directions in [PLAN.md](PLAN.md).
- **E8 — Election and coalition entry/outcomes:**
  [election_1928.scene.dry](source/scenes/events/election_1928.scene.dry),
  [coalition_affairs.scene.dry](source/scenes/government_affairs/coalition_affairs.scene.dry),
  [cabinet.scene.dry](source/scenes/advisors/cabinet.scene.dry).
- **E9 — Institutions:**
  [constitutional_reform.scene.dry](source/scenes/government_affairs/constitutional_reform.scene.dry),
  [prussian_affairs.scene.dry](source/scenes/government_affairs/prussian_affairs.scene.dry),
  [police.scene.dry](source/scenes/government_affairs/police.scene.dry),
  [military_policy.scene.dry](source/scenes/government_affairs/military_policy.scene.dry).
- **E10 — Chronology and crises:**
  [event scenes](source/scenes/events/), especially
  [1934.scene.dry](source/scenes/events/1934.scene.dry),
  [prussian_coup.scene.dry](source/scenes/events/prussian_coup.scene.dry),
  [civil_war.scene.dry](source/scenes/events/civil_war.scene.dry), plus E1.
- **E11 — Economic policy:**
  [crisis_program.scene.dry](source/scenes/party_affairs/crisis_program.scene.dry),
  [economic_policy.scene.dry](source/scenes/government_affairs/economic_policy.scene.dry),
  [fiscal_policy.scene.dry](source/scenes/government_affairs/fiscal_policy.scene.dry),
  [black_thursday.scene.dry](source/scenes/events/black_thursday.scene.dry), plus E1.
- **E12 — Foreign policy:**
  [international_relations.scene.dry](source/scenes/party_affairs/international_relations.scene.dry),
  [foreign_policy.scene.dry](source/scenes/government_affairs/foreign_policy.scene.dry),
  [war_guilt.scene.dry](source/scenes/government_affairs/war_guilt.scene.dry).
- **E13 — Terminal behavior:**
  [game_over.scene.dry](source/scenes/game_over.scene.dry),
  [game_over_1934.scene.dry](source/scenes/events/game_over_1934.scene.dry).
- **E14 — Core interaction:** [main.scene.dry](source/scenes/main.scene.dry),
  [cancel_advisor_action.scene.dry](source/scenes/cancel_advisor_action.scene.dry),
  plus E1.
- **E15 — Presentation and media:**
  [status.scene.dry](source/scenes/status.scene.dry),
  [library.scene.dry](source/scenes/library.scene.dry),
  [customized runtime files](out/html/), [source images](assets/img/),
  [credits_images.txt](credits_images.txt), [credits_music.txt](credits_music.txt).
- **E16 — Environment and verification:** [package.json](package.json),
  [.nvmrc](.nvmrc), [build workflow](.github/workflows/build.yaml),
  [Polish-system tests](tests/polish-party-system.test.js),
  [README.md](README.md), [AGENTS.md](AGENTS.md).
- **E17 — Approved opening state:**
  [opening lifecycle helper](source/scenes/polish_opening_state.scene.dry),
  [real-engine opening tests](tests/polish-opening-state.test.js), E1/E8/E9/E15,
  and the opening decisions/evidence in `PLAN.md` and `HISTORICAL_SOURCES.md`.
- **E18 — November election slice:**
  [election sequence](source/scenes/sejm_election.scene.dry),
  [atomic result writer](source/scenes/sejm_election_result.scene.dry), E1/E8/E17,
  [real-engine election tests](tests/sejm-election.test.js),
  [optional browser smoke check](tests/sejm-browser-smoke.cjs), and
  `SEJM-1922-ELECTION-DESIGN` in `HISTORICAL_SOURCES.md`.
- **E19 — December presidential slice:**
  [presidential sequence](source/scenes/polish_presidential_sequence.scene.dry),
  E1/E17/E18, the head-of-state displays in E15,
  [real-engine presidential tests](tests/polish-presidential-sequence.test.js),
  the extended [browser smoke check](tests/sejm-browser-smoke.cjs), and
  `PRESIDENCY-1922-SEQUENCE` in `HISTORICAL_SOURCES.md`.

## 8. Maintaining this file

After an approved slice changes the implementation:

1. Update the affected row and its remaining dependency, not just its status.
2. Record the approval in PLAN.md and historical evidence in HISTORICAL_SOURCES.md.
3. Update mechanical/state details in MECHANICS_MAP.md and STATE_VARIABLES.md.
4. Update the executive overview if the player experience changes.
5. Record the inspected revision and verification limits here. Advance the
   certified chapter endpoint only after its complete-path checks pass.

Do not treat a planned feature as implemented, a historical research gap as
settled, or an unused-looking legacy file as authorized for deletion.
