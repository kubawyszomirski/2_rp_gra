# Polish Adaptation: Transition Matrix and Content Boundary

## Current state — reference 0.56, 5 October 2026

This section is the only current summary in this file. This matrix lists approved transitions and the content boundary of implemented slices. Everything under "Archive of entries" below is kept unchanged for traceability. It is history, not an implementation instruction; where it differs from the technical reference, the technical reference wins.

- **Canonical specification:** `docs/POLISH_TECHNICAL_REFERENCE.md`, chapters 1–22 (reference 0.56); its chapter 23 holds the decision history.
- **Player-facing description:** `docs/POLISH_DESCRIPTIVE_GUIDE.md`.
- **Audit:** every item of `docs/POLISH_MECHANICS_AUDIT.md` (M01–M19) is closed in documentation; stage 8 measured balance and behaviour in full automated campaigns (`analysis/stage8-campaigns/REPORT.md`).
- **Card catalogue for coding:** `docs/POLISH_CARD_CATALOGUE.md` (reference 0.32) has one table for each of its 69 entries (card families, agenda actions and events): access, options, time and resource cost, effects, end state and cooldown. It creates no rules; where it differs from the technical reference, the reference wins.
- **Nine items of 5 October 2026 (Z, K, 0.56):** the money of the original game (collections from the Dues card and the agenda instead of monthly income, upkeep and arrears; the apparatus adds 25% to a collection per level); the union packages in a card of their own (`party.union_investments`); Piłsudski's criticism (B2) as a timed card of the Parliament deck with authentic quotations, silence recorded as `stance_silence` and further speeches at cabinet crises; the constitutional card after the debate event of December 1924 (`S.politics.constitution_debate`); the government card every six months or after an act of the cabinet against PPS (`S.cabinet.support_reviewed_at`); six economic priorities (`cooperatives_housing`); the 1919 votes next to the first election; the minority cabinet explained; fixed returns to the hand and polls from the start (technical 20.1 and 23.29; chapter 25 of the plan). `npm test` 463 of 463.
- **Sidebar readability (Z, K, 0.55):** on 5 October 2026 the user found the sidebar still unreadable after 0.54 and asked for bold text, headings and breaks (technical 20.1 and 23.28; chapter 24 of the plan). Every fact has a bold label; section headings have a rule and space above them; the Main tab opens with the date ("Status" before the game); composite lines are split (dues, membership index and apparatus level; dissent and cohesion); cohesion and membership are whole numbers and the five political indicators show their scale ("60 of 100"); the Defence tab has its own headings for Milicja PPS, the police and the army groups, one fact per line. Empty lines take no space, wrapped lines are indented under their label and no-break spaces keep numbers with their units. Display fields only: `pl_party_dues`, `pl_party_membership`, `pl_party_apparatus`, `pl_party_sales` and `pl_party_cohesion` (instead of `pl_party_base`) from `PolishParty.sidebarDisplay`; the scale in `pl_pol_*` from `PolishPolitics.statusView`; `pl_def_members`, `pl_def_efficiency`, `pl_def_condition`, `pl_def_attachment`, `pl_def_police_*` and `pl_def_force_<id>` with `pl_def_force_<id>_name` from `PolishSecurity.defenseView`. Every local page file carries `?v=0.55`. Rules unchanged; `npm test` 458 of 458.
- **Readable sidebar (Z, K, 0.54):** on 5 October 2026 the user found the Main tab of the sidebar unreadable (technical 20.1 and 23.27; chapter 23 of the plan). The sidebar shows only data, one fact per line under section headings: Main has the party, its organisations, the unions and the government; Politics has the political indicators, the Sejm, the relations and the factions; a new Economy tab has the economy, the projects and the laws in procedure; Defence and Polls are unchanged. The explanations that stood on the sidebar moved unchanged to a Library page, "Notes to the sidebar". The Main and Politics tabs compute their own new lines, so a save from 0.53 shows them at once. The stylesheet and every local script of the page carry one version (`?v=0.54`): a cached older script next to the always fresh `game_pl.json` stopped the game on the "LUTY 1922" page. Rules unchanged; `npm test` 455 of 455.
- **Choice descriptions (Z, K, 0.53):** on 4 October 2026 the user asked for a clear mark of the present line and for an Options choice whether the descriptions of choices show numbers (technical 20.1 and 23.26; chapter 22 of the plan). The present choice of the stance, Dues and Economic Programme cards opens its description with a bold label on its own line ("Present line" / "Obecna linia"). Every effect is named in words and its size stands in a parenthesis that opens with a sign or ×; the Options setting "Numbers in choices" (off by default, kept by the browser under `pps_effect_numbers`) shows or hides these parentheses. Costs are written in words (the month's action, resources, budget units) and stay visible with requirements and current values; the sidebar and the results keep the short forms R, B and T, explained by a legend in the Library. Rules unchanged; `npm test` 451 of 451.
- **Card images (Z, K, 4 October 2026; the technical reference is unchanged):** the user added 58 images for the Polish cards, events and Central Executive Committee cards. They are stored in `assets/img/polish/` as sRGB JPEG of at most 800 px (about 9 MB in all; the original PNG screenshots stay outside the repository). As in the original game, cards and pinned cards show them on the card (`card-image`) and events on their page (`face-image`); the heritage card shows the Wawel on the card and the Royal Castle on its page. Three cards (minority schools, social welfare, the Soviet model) replaced inherited German images. Their sources and licences are not yet recorded: `credits_images.txt` lists each file as to be completed. Test `tests/polish-images.test.js`; `npm test` 447 of 447.
- **Central Executive Committee (Z, K, 0.52):** on 4 October 2026 the user asked that the advisers be called "Centralny Komitet Wykonawczy" in Polish and "Central Executive Committee" in English (technical 10.4 and 23.25; chapter 21 of the plan). Only player-facing texts changed: the main-page header of the pinned cards, the card that changes the composition, the Library page, the opening texts and the action messages; one person is a member of the Committee ("członek CKW"). Rules, identifiers (`advisor`, `party.advisers`) and saves are unchanged, and the documentation keeps the technical term "adviser". The name is documented history (`PL-PPS-CKW-NAME-2026-10-04` in `HISTORICAL_SOURCES.md`); the three seats are a gameplay simplification. The wait before the next Committee action is written with full month forms in both languages. `npm test` 445 of 445.
- **Confirming the present line (Z, K, 0.51):** on 4 October 2026 the user asked that the stance cards also offer the present line and that "Close card" be called something like returning the card to the hand (technical 10.5, 13.1 and 23.24; chapter 20 of the plan). Choosing the present line now confirms it: it costs this month's action and the card waits its usual cooldown (6 months, the Soviet model 12), and nothing else changes — no record in `strategy_history`, no faction reaction, no relation change or one-time bonus. This replaces the 0.32 rule that the present line could not be chosen. The same applies to "Keep" on the Dues card and to the same set on the Economic Programme card; the other cards keep no paid no-effect options. The free exit from a card is now "Return to hand" ("Odłóż na rękę" in Polish); the exit from a card opened by an adviser stays "Close card". Schema 8 unchanged; `npm test` 444 of 444.
- **Polish language version (Z, K, 0.50):** on 4 October 2026 the user asked for a Polish version of the game with a language switch and approved decisions 1A–7A (technical 20.1 and 23.23; chapter 19 of the plan). The game has English (the default) and Polish; the player switches in Options or with the link in the page header, also during a game. The browser keeps the choice (`localStorage` key `pps_language`), not the save, so the same save loads in both languages. Scene texts are translated line by line in `source/i18n/pl/` and built into `out/html/game_pl.json`; rule texts have a Polish twin (`L(en, pl)`). Texts stored in `S` stay English and are translated when shown (`PolishRules.storedText`), so both languages play the same game: the test "Ta sama rozgrywka w obu językach" plays all 13 strategies to the end of the chapter in both languages and requires an identical state and no English line on Polish screens. Limitations: values computed before a mid-game switch keep the old language until the next page; the Credits translate only their headings; the game title in `info.dry` stays English because it keys saves and settings; unreachable German scenes stay untranslated. Dependencies and schema 8 unchanged; `npm test` 444 of 444.
- **Plan complete (Z, 0.49):** on 4 October 2026 the user decided that stage 8 is the last stage of the implementation plan. The first chapter is implemented in full, and the plan has no further stages. One feasibility check of 21.2 is not met: a lawful early election cannot be reached, because the dissolution under the arbitration reform (7.6) is not implemented. On 4 October 2026 the user decided not to implement it, so the limitation stays.
- **The chapter as one Polish game (K, 0.49):** the first chapter runs as one coherent Polish game from January 1922 to its report. The transitions in order: the opening with Ponikowski's cabinet; monthly turns; the dispute of the Naczelnik in June 1922 and the 1922 cabinets; the Sejm election of November 1922; the Marshal and the President in December 1922, with the assassination of Narutowicz and the second vote; the cabinets of 1923–1925 with the dated inputs of 17.16; the strike of 1923; the military case from July 1923; the resignation of Grabski and the formation of a new cabinet; then either an attempted coup from March 1926, resolved in its phases, or the lawful election of 19 February 1928; and the chapter report. Each step is owned by a Polish rules module or a Polish scene. German scenes stay in the files, but guards keep them out of the Polish game (stages 1–7, appendix C of the plan: ten leaks closed). Evidence: 156 of 156 automated campaigns reach a report without getting stuck (`tests/polish-campaign.test.js`); the test "Izolacja Polski" confirms that no old German field changes the outcome of the economy or the coup; and a browser check of a new game showed no console errors. Content boundary: what follows the chapter is not part of the game, and lawful early elections cannot be reached (chapter 18 of the plan).
- **Stage 8 implemented (K, 0.49) — the last stage of the plan:** the Normal scenario, its content and calibration. Thirteen automated PPS strategies in `tests/helpers/strategies.js` (the four reference runs of 17.16.7 and the nine strategies of 21.2) play full campaigns in the real engine; `analysis/stage8-campaigns/REPORT.md` records them on 12 shared seeds. Decision 2A scales the opening class rows by one factor per party, so that a passive PPS gets the M02 baseline Sejm within ±5 seats per club. Part 8f researched the items marked TBD (eight new entries in `HISTORICAL_SOURCES.md`), and the user accepted all nine proposals: the military case opens in July 1923; the Niewiadomski ceremony is his funeral at the Powązki cemetery on 6 February 1923; the KPP goal in strikes is `structural`; the starting PPS line on autonomy is `regional_autonomy`; the actor profile `actor_profiles_v2` dates the autonomy topic; and the coup pressure starts at 0. New dated scenario inputs: the Chjeno-Piast offer (May–December 1923), the departure of ten Piast MPs (December 1923, a working value from M02), the public episode of army pressure (from November 1925) and the resignation of Grabski from November 1925 if he governs in a credit or currency crisis (A1). Rule 8.9 lets the NPR accept Industry and Trade instead of Labour in the broad Skrzyński cabinet (A2), and an agreement carried out by the cabinet stays valid while that cabinet governs (A3). Closing fixes: offers of governments with the KPP open after the broader 9.6 agreement; the agenda no longer lists the KPP trial that could never be taken; the text of a government-prepared credit; no German music; the report after a coup names the Marshal of the sitting Sejm. Screens show only Polish data: the Defense tab, Library charts from January 1922, a Polish timeline 1919–1922 and no German photos on 49 Polish scenes (the image files stay). Result: N-A and N-H attempt a coup in March 1926 in 12 of 12 seeds; N-B and N-C reach the 1928 election without an attempt; every strategy has the cabinets Ponikowski → Śliwiński → Nowak → Witos → Grabski → Skrzyński; 156 of 156 campaigns reach a report. The limitations of the finished chapter are in chapter 18 of `docs/POLISH_IMPLEMENTATION_PLAN.md`. Schema 8 is unchanged, so saves of stage 7 still load; `npm test` 438 of 438.
- **Stage 7 implemented (K, 0.48):** two new rules files own democracy and the forces of the state. `source/rules/polish_politics.js` keeps the institutional log and the authority of the Sejm, attachment to democracy, violence, cases and restrictions with a legal profile, the grievance and radicalisation of the electorate cells and the coup pressure with its impulses. `source/rules/polish_security.js` owns the synthetic army groupings (`synthetic_test_v2`) with their effective loyalty, the capacity for an attempt, the force assessment on the Party agenda (1 T and 1 R; the interval narrows 30 → 20 → 10 → 5 pp), the police, army control and nominations, the agreement with Piłsudski with its review, the gates of an attempt and the coup engine `coup_f_v1`, which reproduces the M08 profile exactly. Decision 1A: three dated scenario inputs of the test profile `normal_chapter1_v1` — the dispute of the Chief of State with Ponikowski in June 1922 (the cabinet resigns, card 9.1, and Piłsudski's criticism of parliament, card 9.2, needs one mandatory answer), the military case from January 1925 (a test input; the historical date is TBD — historical research required) and one ceremony from January 1923. Decision 2B: in the historical branch the election of Narutowicz always ends in his assassination, with no protection model; the response (card 9.5) follows only a confirmed death, before the second vote of the National Assembly. Decision 3A: restrictions come from existing actions — strike repression, press confiscation and the authorities' answer to executed unlawful violence of PPS organisations; a repressive cabinet bans the Milicja (a lawful restriction), and the Justice review lifts only an unlawful one. New cards: army oversight in the Sejm, the Interior, Military Affairs and the agreement with Piłsudski; Śliwiński (June–July 1922) and Piłsudski (only after an agreed premiership) are formation candidates. An attempt is possible from March 1926; its steps F3–F11 cost no month, and a resolved coup ends the first chapter with a fuller report (society, democracy, the forces of the state, unfinished matters and what the continuation owes). Twenty-six German scenes that write `coup_progress` or `pro_republic` are guarded by `not polish_security_rules`; their files stay. Two automatic campaign walks ended in a coup in autumn 1927 won by Piłsudski; calibration is stage 8. Saves of schema 7 need a new game. Schema version 8; `npm test` 417 of 417.
- **Stage 6 implemented (K, 0.47):** a new rules file, `source/rules/polish_unions.js`, owns unions and strikes. The pinned "Trade Unions" card has the steps of a dispute for each of the three branches (agree limited or broad demands, a joint meeting on the strike line or on the agreed end, mediation, start the protest; each 1 T). A strike draws once a month on its branch fund, adds fatigue and disrupts output; one recorded draw a month decides the government's offer, the union's consent follows 17.4, and PPS answers an offer in the Sejm response (card 7.10: demands, settlement or order, 0 T). The employers execute a settlement's wage clause the next month (+2 pp times the branch's wage scope for two months); a refusing group of at least 10 points of participation opens E6 (card 9.9). Decision 1A kept grievance in stage 7: the 1923 case (card 9.8) opens after three months of real wages below 80, after a refused demand or with an own strike, and effects on grievance, violence and repression exposure are recorded for stage 7. Decision 3A: the authorities answer from the cabinet profile `strike_state_profiles_v1` (P), and a PPS minister replaces it only within its competence; one clash is drawn per phase, and the Milicja protection costs 0.5 R and loses 2% of its people in a clash. The communist cooperation step (card 9.7) records one trial and one discipline draw; a strike in industry is a joint action with the Bund. Decision 2A: synthetic plants (profile `synthetic_plants_v1`, no names) are recorded by a credit crisis, an active business reaction or a strike ended by exhaustion. The Labour card now has collective agreements (1 T, 0 B, a wage effect through 11.4) and derogations (business pressure −4, grievance +3 for stage 7, six months); the Industry card has the rescue of a plant (2 B for 2 months, then 1 B), public control by law (business pressure +15) and workers' representation in a public plant; Czapiński's two variants open the Industry card. Grabski's protection terms open with apparatus 2, union reach 40 and relation 40; he answers in the same commit, and tolerating him is a six-month agreement with a review after three. The user also chose the M18 order of the party ledger: membership moves before dues income. The German events `labor_unrest` and `unions_declare_independence` are guarded by `not polish_union_rules`; their files stay. Saves of schema 6 need a new game. Schema version 7; `npm test` 360 of 360.
- **Stage 5 implemented (K, 0.46):** two new rules files own the electorate and the party. `source/rules/polish_electorate.js` replaces the seven overlapping class rows with 54 disjoint cells (class × identity 70/10/20 × employment × large city), each with its own preferences, turnout, PPS reach and trust. Decision 1A calibrated the opening so that the national result is exactly the previous one; the class rows are now mirrors, averages of their cells including the minorities of each class. The poll, the votes, the 5.6 flow and the 17.4 outflow run on the cells, and unemployment moves mass between employed and unemployed cells. `source/rules/polish_party.js` owns the monthly party ledger of 13.1 (dues, apparatus, press, TUR, cooperatives, Milicja upkeep, arrears without negative cash, membership moving towards the M18 target), the Organisations card with up to two packages, Milicja and AS on the costs and gates of 13.3, and three union branches (decision 2A: industry, rail and farm labour with reach and a monthly fund; readiness, disputes, strikes and the Grabski protections wait for stage 6). It also owns eight stance cards with the line in `S.actors.pps.strategy`, the economic programme, the Media card (press, union, polemic and turnout campaigns: topic, then audience, with saturation), the KPP agenda and the Bund's trust. The factions live in `S.actors.pps.factions`; a faction with dissent of 60 and a live cause opens a case, and the card E3 `party.faction_split` asks it (decision 3A: the demand takes back the recorded reversible cause with the largest share). Accepting changes the policy; refusing lets 40% of the faction's base leave with its voters and MPs, who go to a technical splinter club (M16). The unity card has a concession, the common KPP line, a postponement and the purge; the adviser change is a separate card, and all adviser actions of 10.4.3 work, with timed effects. The Party deck has the 16 cards of the 10.5 manifest. The inherited party cards are switched off by `not polish_party_rules`, and the three automatic faction crises left the event queue; their files stay. The German bridges for support rows and the five old factions are off, and Niedziałkowski and Próchnik no longer write `pro_republic` (leak 10). Faction reactions to a real break of support run through one hook with an empty test profile. Saves of schema 5 need a new game. Schema version 6; `npm test` 327 of 327.
- **Stage 4 implemented (K, 0.45):** two new rules files own the economy and the work of the state. `source/rules/polish_economy.js` settles the monthly economy of technical 11.1–11.9 (profile `economy_simple_v1`): budget points B, the marka and the złoty, monthly inflation, wages, output, credit, unemployment, agrarian pressure and business pressure, with the dated scenario pressures of 17.16.2; it also runs the living-conditions flow of 5.6 and the outflow of disappointed voters of 17.4 on the existing class rows. `source/rules/polish_projects.js` owns projects, laws (the Sejm vote, a simplified Senate review after 30 days and a return after 60), the fiscal instruments of 11.9, cabinet packages voted at the next settlement, one review a month by the cabinet without PPS (17.16.4), the unemployment bill D, the three constitutional reforms of 7.6, the government cards and three economic events. `S.economy` is the only owner: `Q.budget`, `Q.inflation` (now monthly) and `Q.economic_growth` are its mirrors, and the weight of the unemployed row `Q.unemployed` stays 3. The German monthly economy and support rules in `post_event`, the high-inflation event and nine replaced German government cards are switched off by `not polish_economy_system` (leaks 1 and 9); their files stay. Thirteen Polish government cards (`polish_gov_*`) enter the Government deck only through a PPS portfolio; options that need stages 5–7 are visible and blocked with their reason, and their effects wait in the project record (`pending_effects`). Pinned cards: the Agenda (it launches prepared large programmes and files constitutional motions), the unemployment bill D (after the 1922 election, while PPS is not in the cabinet) and the Budget card (while a cabinet package awaits its vote; 0 T). Programme promises from stage 3 now have projects, due dates and rules, and PPS answers only for promises in its own portfolios. Decision 4 moved nine tests of 21.1 to stages 5–7. Saves of schema 4 need a new game. Schema version 5; `npm test` 251 of 251.
- **Stage 3 implemented (K, 0.44):** a third rules file, `source/rules/polish_government.js`, owns relations, agreements and cabinets. Relations with PPS live in `S.actors` (the `Q.<party>_relation` fields are mirrors), and the minority bloc splits into a Jewish representation (1/3 of its seats) and other minorities (2/3). After the 1922 election the cabinet is formed by one offer on one screen (card 7.1): configuration, prime minister, the role of PPS, a request for minority support and the PPS portfolios; each partner answers yes or no with its reason, and the head of state appoints the best feasible offer, with or without PPS. There are nine portfolios, and public works belong to Labour. A fall opens a mandatory formation; three failed rounds bring an impasse with a caretaker cabinet. A new Parliament deck holds the cabinet initiative (1 T in a crisis), Support for the Government (card 7.6: end support and vote on dismissal, a threat or persuasion about financed worker protection) and, in the list window, the Electoral Agreement (card 7.7). Agreements settle monthly: tension, a warning at 40, an ultimatum at 60 with a 0 T answer, one extension and the partner's withdrawal. Promises that need stage-4 programmes wait without a due date, so no ultimatum occurs in play yet. The Rataj package becomes an agreement with PSL Piast, and a Daszyński victory as Marshal gives reputation +5. The German coalition counter has no effect (leak 2), and card 9.1 moved to stage 7. Schema version 4; `npm test` 185 of 185.
- **Stage 2 implemented (K, 0.43):** a second rules file, `source/rules/polish_institutions.js`, records each Sejm election in one transaction: the result (now `certified`, with its sequence, legal basis and ballot date), one club per party and a 111-seat Senate derived once (`sejm_proxy_v1`). The seat calculation moved there unchanged (20,000 random cases give identical results), and later elections apply no German thresholds or bans. In December 1922 the Sejm elects its Marshal (support Śmiarowski, agree on Rataj or nominate Daszyński) and the National Assembly elects the President (nominate Daszyński or not). Both offices are counted from the clubs' votes with the test profile `office_profiles_1922_v1` (P), with the M06 final, the tie lot and the safety net. Narutowicz's assassination follows only his election, and the elected Marshal then acts as President. The legal calendar puts the next election on 19 February 1928 (t=74); the 21 inherited files that write election dates can no longer move it. Its certified result ends the chapter before any government formation and shows a one-screen report; after that no month is settled. Decision 1 moved card 7.7 and the test "Kompromis listowy a Lewica" to stage 3 and the test "C4" to stage 4. Schema version 3; `npm test` 144 of 144.
- **Stage 1 implemented (K, 0.42):** one monthly clock and one settlement per month (`PolishRules.beginMonthSettlement`); Polish adviser actions commit through the rules module with a dated shared cooldown (t+6), and an adviser opening a card makes that whole step cost no month; closing an inherited card from its first page ("Close card" or "Back to main") undoes exactly what its opening wrote and returns it to the hand; one free discard a month on the "Discard a card" card; card draws pick uniformly among legal cards sorted by ID with a recorded roll; due Polish events come one at a time from the queue (category, then ID) through `polish_event_router`, and German events are no longer offered. Schema version 2; `npm test` 122 of 122.
- **Stage 0 implemented (K, 0.41):** the rules module `source/rules/polish_rules.js` is copied by `npm run build` and loaded by the page and the tests. A new game creates the state tree as `Q.S` (schema version 1). `out/html/game.js` checks every loaded save, and `main` and `post_event` stop an incompatible save at `polish_incompatible_save` before a month is settled. Engine tests now catch every engine error. Gameplay is unchanged: eight order-independent walks, 15,788 steps in total, match the previous build. One inherited error ("Return card to hand") stays until stage 1.
- **Implementation plan (Z, 0.40):** `docs/POLISH_IMPLEMENTATION_PLAN.md` expands technical 20.3 into stages 0–8. Each stage lists its files, state, legacy writers to disable and 21.1 tests, and the plan starts the takeover manifest. Decisions: the rules live in a separate plain-JavaScript module in `source/rules/`, copied by `npm run build` and loaded by the page and the tests; player-facing text is English only for now, keeping Polish proper names; a save without a matching schema version shows a message and requires a new game.
- **Queue categories and research (Z, 0.39):** the seven event-queue categories that the catalogue had inferred from 4.5 are approved unchanged and written in 4.5. Historical research for the five items marked `TBD — historical research required` is deferred by the user; until then the game uses the marked test values.
- **Batch-6 answers (Z, 0.38):** E3 has the ID `party.faction_split` (one definition for all factions, keyed by `case_id`); E6 has the ID `society.strike_settlement_rejection` (keyed by `strike_id + settlement_id`); the answer to Piłsudski's criticism of parliament is mandatory, with no "stay silent" option; the 17.3 row for `cabinet.austerity_1926` now uses the four 9.8 answers, as 17.13 and 17.16.4 already did; only supporting the criticism under the `parliamentarism` line contradicts a lasting line, and then the Centre reacts +3.
- **Batch-5 answers (Z, 0.37):** the government cards have no paid "keep", "postpone" or "leave it to the owners" options, and closing a card is free (the Piłsudski card keeps its refusal, which leads to cabinet formation); a collective agreement and a hardship exemption cost 1 T and 0 B (the exemption: capital pressure −4, grievance of the covered workers +3, and it expires); "expand benefits" raises the scope by 1, up to 3, at +2 B a month per level, while "focus" gives full relief to the neediest half of the recipients for 1 B instead of 2; the finance card gains "burden broad groups" (indirect taxes, a broader tax base or fiscal customs), "money issue" (1–3 points before stabilisation, a temporary coin issue of 1 point for 3 months after it) and `government.collection`; the three investment-fund variants differ in who pays and who must agree; the enterprise rescue is a variant of the conditional credit; police investigations cost 1 T and 1 B for 1 month, and a confirmed one makes that party the addressee of the "unconstitutional force" polemic; the secular school has no faction reaction. Parliamentary card 6 in 17.10 now repeats the 0.36 crisis-only rule for "keep support".
- **Batch-4 answers (Z, 0.36):** "keep support" is only a crisis response; the army-oversight card drops its paid "minister's explanations" and "postpone"; budget-card options use the 11.9 instruments; parliamentary cards 3–5 have no cooldown; the limited army reform is the compromise version (`army=0`, +0.025 legal loyalty, 1 B for 2 months); the Left reacts +3 only to a list that drops labour points, i.e. the early Centrolew; after three failed cabinet proposals the game enters an impasse with a caretaker cabinet.
- **Batch-3 answers (Z, 0.35):** the programme card cannot confirm an unchanged set and the unity card has no plain "hold the line"; "persuade to postpone" delays a faction case for 3 months without lowering dissent; the compromise has two variants (one faction: 1 T, 1 R, cd 3 M, dissent −8; the communist line: 1 T, cd 6 M, +15 acceptance in each faction); the unity card appears only with a faction dissent of at least 30 or an open KPP channel; the adviser change is a separate card; `kpp.contact` sits in the outreach card and `kpp.trial`, `kpp.rules`, `kpp.agreement` in the "Cooperation with the KPP" agenda; the security assessment is a permanent agenda action.
- **Batch-2 answers (Z, 0.34):** the Organisations and Dues cards have no paid no-effect options; the Centre reacts +3 to the first militarisation of the Milicja; the Media card has no card cooldown and includes the turnout campaign and press investigation; the joint political meeting is `union.align`; organisational work adds +2 reach to one union branch or to the cells of one chosen class, not the press or TUR; cooperatives have no separate cap.
- **Stance cards (Z, 0.32):** the current line cannot be chosen again, and closing the card is free. Test faction profile `faction_stance_profile_v1`: the Piłsudczycy reject opposing military interference, and the Centre rejects supporting Piłsudski's influence (technical 10.5). Batch-1 answers (Z, 0.33): the direction works through campaigns; polemic addressees are the ZLN for the national right, parties with fiscal and land ideals ≤ −1 for defenders of capital and land, and a party with an open violence case for unconstitutional force; the Piłsudski line limits concessions but does not gate them; presidential arbitration needs the strong-presidency line; test ideals on the autonomy axis are ZLN −2 and other minorities +1; the Bund is an organisation, not a party; condemning the Soviet model triggers no faction reaction.
- **Code:** the M08–M19 documentation work changed no gameplay code, dependency or scenario metadata (version 5).

| Area | Canonical section of the technical reference | Latest approval |
|---|---|---|
| Rule status, scope and markers | 1 | — |
| State ownership, units, indicators, domain register | 2 | stage 0: `Q.S` (2.4), stage 2 (2.4), stage 4 (2.4), stage 5 (2.4), stage 6 (2.4), stage 7 (2.4) |
| Time, cards, settlement order, event queue | 4 | M06 (4.5), organisational work (4.4), queue categories (4.5), stage 1 (4.1–4.6), stage 4 (4.2, 4.5), stage 5 (4.2, 4.4, 4.5), stage 6 (4.2, 4.5), stage 7 (4.2, 4.5) |
| Electorate, campaigns, support flows | 5 | M09 (5.6), Bund not a party (5.5), stage 4 (5.4, 5.6), stage 5 (5.1–5.6), stage 6 (5.5), stage 8 (5.2) |
| Elections, institutions, presidency and speaker | 6–7 | M06 (7.3, 7.5), arbitration and the PPS line (7.6), list compromise (6.5), stage 2 (6.1, 6.3–6.5, 7.1–7.5), stage 4 (7.2, 7.6), stage 5 (7.6), stage 8 (7.6) |
| Relations, conversations, offers, cabinets | 8 | M11 (8.3), M17 (8.1), autonomy axis (8.6), formation impasse (8.7), stage 4 (8.5, 8.6), stage 5 (8.6), stage 7 (8.7), stage 8 (8.6, 8.9) |
| Agreements, government support, communist cooperation | 9 | M11 (9.8), M13 (9.5–9.6), M17 (9.5), KPP agenda (9.5), keeping support only in a crisis (9.8), stage 4 (9.1, 9.7), stage 5 (9.5, 9.8), stage 6 (9.6–9.8), stage 8 (9.6) |
| Factions, compliance, advisors, strategic cards | 10 | M10 (10.7), M16 (10.2), M17 (10.4.3), card catalogue (10.2, 10.4.2, 10.5–10.10), stage 5 (10.1–10.10), stage 6 (10.4.3), stage 7 (10.7), stage 8 (10.5) |
| Economy, state finances, projects | 11–12 | M01 (0.11), M07 (17.12), budget card and investment-fund variants (11.9), card catalogue (12.7, 12.8), stage 4 (11.1, 11.3, 11.9, 12.2), stage 6 (11.4, 11.7, 12.4) |
| PPS organisations, party finances, Milicja and AS | 13 | M18 (13.1), M15 (13.3–13.4), card catalogue (13.1–13.5), stage 5 (13.1–13.5), stage 6 (13.1), stage 7 (13.4) |
| Unions, strikes, settlements | 14 | M12 (14.4–14.5), `union.align` (14.1), E6 ID (14.5), stage 5 (14.1), stage 6 (14.1–14.5) |
| Grievance, democracy, coup pressure | 15 | M10 (15.2–15.3), stage 7 (15.1–15.3), stage 8 (15.3) |
| Police, army, coup | 16 | M08 (16.8), M10 (16.1), M15 (16.8.3), force assessment (16.8.1), limited oversight reform (16.3), stage 6 (16.5), stage 7 (16.1–16.7, 16.8.8), stage 8 (16.1, 16.8, 16.8.1, 16.8.5) |
| Cards, events, Normal scenario | 17 | M02 (17.16), M05 (17.15), M07 (17.12), M12 (17.4), card catalogue (17.3, 17.10–17.12, 17.15), stage 4 (17.4, 17.10, 17.11, 17.15, 17.16.2, 17.16.4), stage 5 (17.4), stage 6 (17.4, 17.5, 17.5.1, 17.11, 17.12, 17.12.5, 17.16.5), stage 7 (17.5, 17.6, 17.7, 17.10, 17.11, 17.12, 17.12.2–17.12.4, 17.12.6, 17.13, 17.16.3), stage 8 (17.7, 17.10, 17.12.4, 17.16.3, 17.16.6, 17.16.11) |
| Chapter end, report, save | 19 | M08 (19.1), old saves (19.3), stage 2 (19.1–19.2), stage 7 (19.1, 19.2), stage 8 (19.2) |
| Dendry integration and legacy rules to disable | 20 | M09, M10 (20.2), rules module and language (20.1), implementation plan (20.3), stage 2 (20.1, 20.2), stage 4 (20.2), stage 5 (20.2), stage 6 (20.2), stage 7 (20.2) |
| Verification criteria and tests | 21 | all of the above (21.1), stage 8 (21.2) |
| Decision archive | 23 | M19, card catalogue, stages 0–8 (23.14–23.22) |

## Archive of entries — history, not implementation instructions

All sections below this heading are earlier dated entries and the original worksheet, kept as they were written. Read them through the current state above.

## M18 approved membership transitions — reference 0.30

| Transition | Effect / guard |
|---|---|
| Monthly settlement (step 6) | Member index moves 5% of the gap toward its target |
| Union expansion or a gain in worker support | Target rises; membership follows slowly |
| Dues raised | Immediate ×0.95/0.98; target −5% per level above 2 |
| Split or purge | Index × (1 − departing share) at once |
| Apparatus level bought | Income +0.15 × members/100, cost +0.10 R a month |

Technical 13.1.

## M17 approved late-advisor and KPP contact transitions — reference 0.29

| Transition | Effect / guard |
|---|---|
| Chapter 1, any date | A12 and A13 not offered |
| Open contact with the KPP | Relation ≥10; channel open; relation +4 |
| Conversation with the KPP | Channel open; +4, 3-month cooldown |
| Relation below 10 before contact | Contact unavailable |

Technical 9.5, 8.1 and 10.4.3.

## M06 approved office-election transitions — reference 0.28

| Transition | Effect / guard |
|---|---|
| Final of two, unequal votes | More votes wins; abstentions and invalid ballots do not block it |
| Final of two, exact tie | Saved 50/50 lot |
| Profile with fewer than two valid candidacies | Validation error before the vote |
| Election still unresolved | `no_election`; acting holder keeps the office; normal turn; new vote next month |

Technical 7.3, 7.5 and 4.5.

## M16 approved faction split transitions — reference 0.27

| Transition | Effect / guard |
|---|---|
| E3 accepted split | One manifest: 40% of the faction base leaves; members and voters by the same share; `round(0.40 × faction_seats)` MPs to the split club; remaining dissent −20 |
| Advisor action changes faction strength | `faction_seats` unchanged |
| Election | `faction_seats` reallocated by largest remainders from current strength |
| Later purge of the same faction | Applied to the post-split state; nobody leaves twice |

Technical 10.2.

## M15 approved Milicja and AS transitions — reference 0.26

| Transition | Effect / guard |
|---|---|
| `militia.as` executed | Stage 2: compliance +0.15 in every call; up to three concurrent actions before a coup |
| Two concurrent protection needs | Stage 1: only the first; AS: each up to 4 F, the rest to the next |
| Coup call (F5) | One task for militia and AS; AS force includes the bonus |

Technical 13.3–13.4.

## M13 approved communist cooperation transitions — reference 0.25

| Transition | Effect / guard |
|---|---|
| `party.unity` compromise on the cooperation line | +15 support in every faction; 1 T, 6-month renewal |
| Acceptance reaches 60 | Line agreed: no Centre dissent penalty for full or limited cooperation |
| Joint strike agreement | One saved roll against `(relation + goalFit)/200`, within 10–90% |
| Agreed rules broken | Acceptance −15; trial failed; relation −5 |

Technical 9.5–9.6.

## M12 approved strike settlement transitions — reference 0.24

| Transition | Effect / guard |
|---|---|
| Offer presented to a striking branch with autonomy ≥50 | Consent if `0.5×fulfilment + 0.3×trust + 0.2×strikeContinuationCost ≥ 50` and no red line is breached |
| Fund falls or fatigue rises during the strike | Consent becomes easier; pressure on the employer falls with the fund |
| Cabinet loses support or a partner dispute escalates | Fragility rises; strike success chance rises by 0.2 pp per fragility point |
| Cabinet becomes caretaker | Fragility 100 |

Technical 14.4 and 17.4.

## M11 approved threat and persuasion transitions — reference 0.23

| Transition | Effect / guard |
|---|---|
| `bargain` accepted | Concession recorded; each accepting party −3 relation, once per offer |
| `bargain` refused → carry out | Immediate `withdraw` effects at 0 T |
| `bargain` refused → back down | Credibility −5 once per negotiation ID; `pps_threat_discounted=true` |
| Later `bargain`, same cabinet, after a back-down | Scored with `need=0` |
| New cabinet | `pps_threat_discounted=false` |
| `persuade` accepted or refused | No relation or credibility change; support stays |

Technical 9.8.

## M10 approved authority and democracy transitions — reference 0.22

| Transition | Effect / guard |
|---|---|
| Response to a Piłsudski speech | One log entry per speech ID: `stance_defense` +1 or `stance_criticism` −2 for 12 months; the reform answer adds none |
| Monthly settlement (step 6) | Authority recomputed from the log; pressure adds the democracy term; democracy updated with reference point 53 |
| New case of violence against institutions | Democracy −2 once per case ID, in the month it opens; the coup attempt keeps its own F10+F11 effects |
| Unlawful restriction lifted by a legal procedure | Democracy +1 once per `restriction_id`; B4/B5 keep their own +2 |
| Gate check and F5 roll | Loyalties shifted by current democracy (cap ±10 pp); roll saved once |
| Direct write to authority | Validation error |

Technical 15.2, 15.3 and 16.1. In the archived M02 runs the pressure term moves
each attempt 1–3 months later; the user accepted this effect.

## M09 approved economy–voter transitions — reference 0.21

| Transition | Effect / guard |
|---|---|
| Class index falls between two monthly settlements | Responsible parties lose `min(0.5, 0.1×fall)` pp in every cell of the class, to the other parties by share |
| Class index rises | Responsible parties gain `min(0.25, 0.05×rise)` pp, taken from the other parties by share |
| Index unchanged, or no responsible or no other party in the cell | No flow |
| Cabinet or toleration changes | The next settlement reads the new responsibility (1 / 0.5 / 0); no retroactive flow |
| Overdue obligation in the same month | 17.4 outflow applied after the 5.6 flow, with its own cap and the share-based split |
| Save/load | No repeated flow; `living_conditions_last` restored |

Technical 5.6. Legacy German vote drifts are disabled in the same bounded
change (technical 20.2).

## M08 approved coup transitions — reference 0.20

| Transition | Effect / guard |
|---|---|
| Pressure reaches 55 | `dormant → political_crisis`, visible warning; no attempt without all 16.2 gates |
| Stand-down agreement starts executing, or pressure falls below 40 | Preparations called off → `dormant`, next attempt no earlier than t+3 |
| All 16.2 gates met | `attempt_declared` in the same check; F3 → F4 → F5; allegiance rolls after F5 |
| Rail strike in the round before a scheduled arrival | Opposing rail-dependent group delayed 1 (≥40/≥50) or 2 (≥65/≥70) phases, within `rail_delay_cap`; exhausted fund releases it |
| Round comparison | Win after two consecutive rounds above 1.20 or immediately at 2:1, counting opponent's next-round arrivals; at most four rounds |
| Stalemate with an offer scoring ≥60 for both sides | Automatic constitutional compromise, or F9 when PPS is significant; accepted F9 settles, rejected F9 closes settlement for the attempt |
| Four rounds and final assessment without victory or settlement | `prolonged_conflict`: approved chapter ending with hand-off report |
| Resolution | Counterfactual replay without PPS; concessions only for a decisive contribution with recorded PPS conditions; F10+F11 effects once |

Technical 16.8. Earlier rows below (0.13 phase-2 floor, open M08 force-profile
notes) describe superseded or research states. Historical forces, routes and
mediation remain `TBD — historical research required`.

## M07 approved transitions — reference 0.19

| Transition | Effect / stopping condition |
|---|---|
| Orders authorized → three contract settlements → expiry | 1 B/month, actual deliveries give +0.30 pp × coverage through production; expiry removes ongoing contribution, no retroactive refund or duplicate package |
| Police prepared → fully implemented | +10 command/lawful compliance once; poor funding delays, cabinet change does not reset chapter limit |
| Case review → decision | Proven unlawful restriction can end; absent grounds gives no relief; no minister-selected verdict |
| Broad justice choice → democratic_guarantees | Same project, votes, costs and one outcome |
| Authorized nomination → execution → transition ends | Named group +0.05 legal loyalty once, temporary −0.05 readiness; no +8 without a real pressure event |
| Consultation → decision rights | One representation record; −2 grievance then only remaining −2; later covered decision needs worker consent only with decision_rights |
| Cabinet autonomy commitment → law and implementation | Delegate explicit local competencies; −3 grievance once for covered people; refused law/authority means no transfer; schools separately funded |
| Council/federal programme choice → campaign/negotiation/report | Existing programme effects and continuation goal, no automatic regime change or pending unfinishable project |

Technical 17.12.1–7. Implementation options keep existing ministry/agenda and
advisor entry, one-time effect IDs and shared financing. M07 documentation is
closed; operational forces/history, balance and full gameplay tests remain.

## Office-election tie transition — reference 0.18

A valid presidential/speaker final with quorum and equal votes for its two
finalists resolves by one saved 50/50 draw. Continue ordinary office appointment
and effects once; do not enter `no_election` merely because of this tie.
The visible result preserves tied totals and records selection by lot. Other
failures, earlier ranking ties and legislative votes retain their own rules.

## Current D transitions — reference 0.17, M05

| Trigger | Transition and effect |
|---|---|
| D1 accepted outside government | `available → pending`; 1 T; one prepared bill, named finance/executor |
| D2 commits variant | Immediate Sejm vote; fail → `rejected`, pass → `in_procedure`; withdrawal → `withdrawn`; 0 T |
| Senate notice at +30 days | No objections → legal finalization; amendments → recorded return at +60 |
| Returned text at +60 | Automatic Sejm acceptance of amendments or 11/20 rejection; otherwise bill fails; no new PPS menu |
| Successful legal finalization | Same-day promulgation/entry (P), `enacted`; first due settlement applies cost and actual coverage |
| Full delivery of accepted benefit | PPS authorship share 0.40 credited once; no duplicate reward through Labour card or cabinet entry |
| Government entry | Before D2: suspend pending card; after D2: procedure continues |
| Dissolution / chapter boundary | Pending procedure expires at dissolution (P); end report preserves reached state without future execution |

General project/advisor actions cannot reset the one-initiative limit. Cost,
partial/no delivery and execution authority stay governed by the shared
programme. Earlier rows below describe previous revisions; technical 17.15
is the current D contract. No source/runtime change.

## Final M02 transitions — reference 0.16, 22 September 2026

| Trigger | Effect | Guard |
|---|---|---|
| Actual Chjeno-Piast return | +20 once in chapter | Earlier Chjeno-Piast in history; direct predecessor has stabilization/broad profile; unresolved army case at appointment; no date gate |
| Initial formation, failed proposal, different predecessor or settled army case | No return impulse | No deferred award when the month or army case changes |
| Welfare compromise | Retain agreed protection | Each required consent scores ≥60 by the common rule, funding feasible, hard conditions met; no extra ZLN25/PSChD45 minima |

+2/month, pressure threshold 65 and the separate attempt gates remain.
[Final verification](analysis/m02-robustness/REPORT.md); technical 17.16.11.
M02 is ready for implementation. Military-case dating remains provisional;
older entries below describe earlier transition contracts and results.

## M02 paired transition checks — 22 September 2026

[144 main runs and matched controls](analysis/m02-robustness/REPORT.md) verify
that 218 right/Piast votes cannot force the May 1923 replacement, while 232
remaining votes after ten departures can retain that cabinet in the harder
chamber. Both Grabski funding refusals can produce an August 1925 resignation;
a scored successor changes the date of its sixth-month review. Withdrawal
alone does not appoint Witos; the favorable H retains Skrzynski without PPS.

This exposes the date gate on the +20 impulse: a March 1926 return does not
qualify under current 0.15, leading to a later attempt. No threshold top-up or
rule edit was applied. Full card draws, historical force profiles and election
results remain outside the checked transitions. Technical 17.16.10.

## M02 pressure timing — reference 0.15, 22 September 2026

| Trigger | Transition | Guard |
|---|---|---|
| Recorded public military intervention during actual cabinet formation/reconstruction | Existing personal-conflict channel +8 once | Open army case, public demand, officer backing, no operating settlement of that case; no date-only trigger |
| Fulfilled military agreement | One existing relief; resolve covered case | Actual consent, executive authority and delivery; no reward for renewal |
| Agreement expires without a new breach | Remove expired stand-down protection | No automatic +8 or reopening of resolved case |
| Actual breach | +8 once; reopen breached issue | Concrete violated clause, no fictional prior agreement |
| Completed event batch or monthly settlement | Evaluate all 16.2 gates in the current month | Apply effects once; do not delay to next month or queue duplicate F |

Keep +2/month and threshold 65. [Twenty pressure variants and three projections](analysis/m02-pressure-calibration/REPORT.md)
show May, later attempts and prevention under controlled inputs. Full evolving
campaigns and the historical lifecycle of army cases remain open M02 work.

## M02 political chain — reference 0.14, 21 September 2026

Canonical cause/actors/PPS/survival matrix: technical 17.16.8.
[Verified traces](analysis/m02-political-chain/REPORT.md) include:

| Trigger | Transition | What prevents it |
|---|---|---|
| Credit crisis, no delivered response | Prepare if needed → first funding offer → one revised offer at next review | Existing completed response or resolved cause; no duplicate project |
| Both essential offers fail | Grabski resigns → caretaker → scored successor batch | Accepted executable offer keeps him; tax cannot repair a missing executor |
| No accepted viable successor | Caretaker pays lawful obligations | No free monthly retry; require material candidate/programme/support change |
| Sixth-month broad review during credit crisis | Actual cut proposal → PPS support/bargain/persuasion/withdrawal | No automatic benefit cut or forced review after cause disappears |
| PPS leaves | Independently accepted retention OR lawful dismissal/resignation and successor | Departure alone supplies neither a vacancy nor missing MPs |
| Witos appointed | Inherited benefits continue → separately enacted cut | Appointment is not a financial law; no second cabinet initiative that month |
| Political pressure accumulates | Existing force/window/stand-down/cooldown gates → F | No coup from a date or cabinet label alone |

An early Chjeno-Piast appointment does not receive a delayed May +20 impulse.
Detailed timing and the complete evolving campaign remain open M02 work.

M02 step 1 (21 IX): [calculated offers](analysis/m02-negotiations/REPORT.md)
qualify the archived fixed-consent runs. Grabski agreement → separate approval
of its financing; broad offer → unique portfolios and every required score;
benefit review → new acceptance without reusing the formation adviser bonus;
Witos offer → partner consent and current MP declarations. A refusal stops
dependent transitions; do not retain later outcomes of a cabinet that failed
to form. Alternative-offer scheduling remains the next step, not a date trigger.

## M02 correction — reference 0.13, 21 September 2026

Current target overrides corresponding older rows. Documentation/diagnostics only.

| Transition | Required acceptance evidence |
|---|---|
| Crisis coalition | Credit crisis can open the offer; weak ZLN relations no longer separately block entry, but programme score, red lines, votes and consent remain |
| Broad review | First six-month review + active credit crisis + existing full benefit → right proposes 2→1 B once; no direct cut on scene arrival |
| Compromise | One accepted, funded full-benefit continuation; ZLN >=25 and PSChD >=45 are draft compromise gates, not membership gates |
| PPS departure | Remove own ministers and recalculate declarations; replacement requires its own accepted offer and vote/resignation |
| Grabski refusal | Existing credit package → one viable wealth-tax amendment → accept or resign; no duplicate tax or cure for an unwilling executor |
| Delivered settlement | Recipients receive -4 grievance once on actual delivery; no repeated rewards or whole-population bonus |
| Political protest | Open wage dispute allows a resignation demand; 80 is the difficulty of the demand, 60 still gates general mobilization |
| Rail and outcome | Arrival/transport precedes victory check; no military resolution before phase 2 in the synthetic profile; an earlier legal bargain can still end the crisis |

[272 revised monthly settlements and focused checks](analysis/m02-revision-13/REPORT.md).
The four runs still use explicit political consent fixtures. M02 calibration,
M08 historical force profiles and the other audit items remain open as stated.
Approval: `PL-M02-REVISION-2026-09-21`.

## Normal scenario — reference 0.12, 20 September 2026

Approved documentation target: [technical 17.16](docs/POLISH_TECHNICAL_REFERENCE.md#1716-scenariusz-normalny--normal_chapter1_v1).

| Transition | Required acceptance evidence |
|---|---|
| Month boundary | Exactly one active marka period; no sum of old/new plateau values, no second NPC review on reload |
| Successful stabilization | Ends marka pressure and ordinary Treasury emission from its first effect date; does not erase rural or 1925 credit/output shocks |
| Passive PPS | Cabinet can finance and execute policies without PPS ministries; no fabricated votes or party funds |
| External support | Accepted obligations and named state executor; withdrawing PPS support does not necessarily dismiss the government |
| Cabinet membership | Autonomous actors cannot perform an additional decision for a PPS-controlled ministry; shared finance still needs consent |
| Wage dispute | Three completed months below 80 → addressed demand; unresolved/rejected demand +8 once, actual railway militarization +10 to railway workers once |
| Settlement | Can stop escalation before combat; rejected settlement uses existing E6, not a new menu |
| Cabinet fall | Actual vote/resignation/support failure; no date-only succession and no strike-to-premier shortcut |
| Coup window | False before spring 1926; date floor afterwards is insufficient without operational forces and all 16.2 gates |
| No-coup branch | Recovery applies without Piłsudski victory; financing/agreements persist and legal elections end chapter |
| N-A/N-B/N-C | Same opening/pressures/seeds; record fiscal delivery, political causation, action costs and endpoint, not only final support |

Documentation connections have been reviewed, not the full simulated campaign.
M02 remains partially open; M06 office impasse, M08 force profiles and M09–M13
cross-system issues are not implicitly solved. No source/generated changes.

## Economic successor — reference 0.11, 14 September 2026

Current target, superseding earlier Polish cash-flow/staff-allocation plans:

| Transition / boundary | Acceptance evidence |
|---|---|
| Economic replacement | New economy_simple_v1 owns seven readings; German monthly feedback cannot run alongside it |
| Budget refresh | Base 2, construction charge 2 for 3 M yields 0/0/0, then upkeep 1 yields +1, with fixed other inputs |
| Finance lifetime | Loan +3/6 M then −1/12 M; no duplicate grant, overlap or cancellation of service when investment ends |
| Execution | Budget ≥−2: full; below −2 down to −5: half; below −5: stopped; nominal obligation remains until legally changed |
| Player vs state | PPS access requires its political gate; existing legal Labour benefits execute without PPS and during lawful caretaker duties |
| Large project | One preparation, one implementation; law/funding decisions within that step; guaranteed agenda, then automatic progress |
| D | Same benefit ID as Labour policy; first possible payment after legal enactment; no extra project stages |
| Advisor/TUR | One allowed advisor step; TUR prepares once and saves one execution month, minimum one; no free finances |
| Business | Warning before active response; two calm months end active response; no sector multiplier |
| Save/report | Preserve projects, financing phases, unmet promises and economic state; old B amounts need explicit migration or new campaign |

The concrete coefficients are proposed balance, not implemented behavior.
Scenario 0.12 now specifies the Normal manifest; full campaign verification
and the remaining D procedural calendar remain audit items.

## D–G revision — reference 0.10, 11 September 2026

| Transition | Acceptance evidence for future implementation |
|---|---|
| D1 → D2 → result | One unemployment bill after 1922, outside government; full/real compromise or withdrawal. Current 0.17: D2 reports Sejm, then automatic dated Senate/finalization; no third card or repeated initiative |
| D execution | Enactment creates one funded-as-available Labour program; no magic budget, duplicate benefit or extra project-stage cards. Government entry suspends pending D2, not enacted law |
| Constitutional stabilization | Remains in the constitutional card, not D; existing legal vote requirements apply |
| E3 | Two choices, actual policy change or one faction-portion departure; default advisor list empty, any exception previewed |
| E6 | Actual settlement refusal, uphold/continue only; no repeat for the same strike/settlement or separate E7 |
| F3/F4/F5 | Informational opening, stance and commitment; neutral commitment cannot support one side through rail sabotage |
| F6+F7 | Single no-choice mobilization/transport report; no new tactical assignments during automatic rounds |
| F9 | Positive actual participation and feasible offer; at most once. None/zero participation or political endorsement alone cannot trigger it |
| F10+F11 / G8 | One final outcome/consequences report after all consequential choices, no post-ending decision |
| G1/G4/G6/G7/G9 | Start/reminder/1922 result retained; next legal election ends chapter before government formation; restore without replay |
| Removed screens | No E1/E2/E4/E5/E7/E8/E9, F1/F2/F8, G2/G3/G5 or additional D procedure/funding/executor scenes |

Documentation-only approval. Implement and test the above in bounded later
changes; preserve German behavior until the Polish successor is implemented.

## C-scene revision — reference 0.9, 11 September 2026

| Future change | Acceptance evidence |
|---|---|
| C1/C2 | One cabinet scene/commit/result, no second participation scene, counteroffer or free round loop |
| C3 | Five contextual alliance choices; fixed profile; refusal preserves current list; no terms negotiation |
| C4 | No procedural choice scene or Senate submenu; actual legal vote outcome still required |
| C5–C7 | Speaker choices, two presidential choices and support/refuse dismissal preserved; constructive successor gate retained |
| C8/C9 | No election-initiative/vacancy screens; lawful existing dates and automatic succession remain correct |
| Manifest | 10 parliamentary families, government/advisor counts unchanged |

Technical 17.14 supersedes earlier scene requirements. Source:
`PL-C-SCENES-REVIEW-2026-09-11`. No runtime transition completed.


## Event revision — reference 0.8, 10 September 2026

Documentation target only; no runtime transition is marked complete.

| Future change | Acceptance evidence |
|---|---|
| Simplified B1/B2/B4/B5 | Correct three choices; no reform unlock from B2; no unaccepted or duplicate Mass reward |
| B8+B10 and B11+B12 | Three choices in each merged phase, one strike, one government response per scope, one settlement; B9 still separate |
| B13 | Present in ordinary party pool with normal action time/cooldown; absent from event-only list |
| B14/B16 | Organization/contact/acceptance for toleration; authority/law/funds for the selected economic instrument |
| B7/B18/B19 | Reuse cabinet formation and government-support menus without duplicated time or effects |
| Removed B3/B6/B15/B17/B20/B21 | No retired choice screen/reward; existing rights, restrictions, economic reactions, succession and actual coup retain their normal rules |
| Catalog counts | 11 parliamentary families / 16 government families; unchanged 13 advisor profiles / 22 actions and nine ministries |

Source: `PL-EVENTS-B-REVIEW-2026-09-10`. Technical 17.13 is the current mapping;
older transition targets below are superseded where these menus conflict.


## Advisor revision — reference 0.7, 10 September 2026

Approved concrete advisor subjects are synthesized into 13 profiles and 22
actions (technical 10.4). No runtime transition is completed by this revision.

| Bounded future change | Required acceptance evidence |
|---|---|
| Roster political effect | First +5 strength/−5 dissent, dismissal +5; one normalization; no repeated appointment reward or startup reapplication |
| Shared timer / action redirects | One action blocks all advisors for 6 M; one policy step bypasses named card timer, retains funds/legal gates and normal post-use cooldown |
| Direct political effects | Pużak reduces all dissents; faction actions change actual influence; relation actions do not create automatic coalitions |
| Distinct campaigns | Correct worker/unemployed/petty-bourgeois/city audiences, conserved total vote shares, no additional municipal population |
| Temporary effects | Exact expiry, nonstacking same-kind bonuses, strongest KPP-flow protection; persistent gains clamped |
| Institutional preparation | pro_democracy uses existing field; legally stronger presidency is not automatically authoritarian |
| Government programs | Rights/welfare vs socialist ownership/tax/worker representation vs Labour works have distinct access; no instant complete reform |
| Piłsudski and later actors | Four distinct roles, actual toleration gate; no premature Sanacja/SL or post-endpoint action |
| Communist action | Negotiation never counts as a successful trial; real strike/demonstration/protection counts once, no double cooperation dissent |

Historical roster dates and departures remain the established project inputs;
Próchnik/Drobner do not move into 1922. Pending historical/cost profiles are
explicitly blocking for their specific execution, not free default powers.
Source: `PL-ADVISORS-REVIEW-2026-09-10`.

## Government-card revision — reference 0.6, 10 September 2026

Approved documentation target: 16 basic families and 2 crisis events,
**nine portfolios**, with public works moved to Labour. No transition is
marked implemented by this edit. Technical 17.11–17.12 contains all choices.

| Bounded change | Required transition | Acceptance evidence |
|---|---|---|
| Ministry consolidation | Nine-key new manifest → unique allocation and capability checks | No separate Public Works ministry, second Labour holder or silent loss of old agreements; old saves require explicit migration |
| Government choices | Eligible family → chosen variant/target → existing project or agreement → execution | Shared time, correct law/funding/executor, no repeat reward or compulsory exclusive economic route |
| Labour public works | Labour + financing → employment/infrastructure/housing | Retained program with different timing/beneficiaries; no old Works portfolio dependency or police/union control |
| Fiscal and industrial instruments | Policy choice → one financed instrument and real obligation | No duplicate loan, universal rescue or automatic inflation reset |
| Schools and agriculture | Specific project scope → bounded completed result | New cooperative processing/sales; separate school access and language; no double beneficiaries or party funds from state spending |
| Institutional policy | Actual reform/case/appointment → authorized execution | Specific rights and units; no invented evidence, dictated verdict or instant loyal army |
| State strike response | Party preparation → authorized government choice → actual force execution → parliamentary response | One state response instead of duplicate NPC action; shared strikes, losses and costs |
| Business refusal | Actual investment/funding/contract refusal → one response → agreement or funded replacement | Mere tax increase does not trigger event; no free replacement capital or repeat reward |

Previously retained Piłsudski and heritage mechanics remain within this
manifest. MSZ has no diplomacy cards. Incomplete profiles and new numerical
differences require calibration before runtime implementation. Earlier rows
describing ten implemented portfolios remain historical inspection snapshots.
Source/design: `PL-GOVERNMENT-CARDS-REVIEW-2026-09-10`.

## Parliamentary-card revision — reference 0.5, 10 September 2026

These are approved future behavior and acceptance requirements, not completed
runtime transitions. They supersede earlier card splits; technical 17.10 is
the canonical 12-family manifest.

| Bounded system | Required transition | Acceptance evidence |
|---|---|---|
| Combined formation | Context → available configuration/candidate → PPS mode and terms → portfolios → acceptance/appointment | One transaction; no extra priority menu, Grabski card or time charge |
| Coalition gates | Current votes, political limits and crisis → greyed-out reasons / negotiable option | Normal post-1922 opening blocks broad crisis cabinets; impossible left majorities stay blocked; stronger real crisis improves willingness without overriding limits |
| Minority support | Optional request → conditional offer → accepted external commitments | Preview does not grant votes; refusal recomputes feasibility; no extra population or portfolios |
| Budget access | Active supported cabinet + fiscal package → five-option negotiation | Opposition and one-off supporters cannot use it; normal budget votes and own bills remain |
| Government relations | Withdraw/bargain/persuade/maintain → agreement or actual dismissal procedure | Refusal does not automatically end support; departure does not automatically topple government or call elections |
| Early-election agenda | Actual fall → open successor crisis → legal dissolution or active successor | Only fall opens card; caretaker leaves it open; new active cabinet closes unused card, not already lawful elections |
| Executive concessions | Proper government authority → Piłsudski offer → legal execution | No unrestricted parliamentary concession card; required laws and cabinet formation still processed |
| Żyrardów | Evidence → publicise/accountability or restrain → one result | Exactly two choices, conditional promise/partner effects; no leak minigame |
| Parliamentary strike response | Active strike dispute → demands/settlement/order → existing actor response | Exactly three choices; reads prior strike/communist/Milicja decisions; no duplicate expenses or betrayal penalty |

Retained legislation, constitutional reform, military scrutiny, electoral
agreements and office choices must remain reachable through their manifest
families. Source/design record: `PL-PARLIAMENT-CARDS-REVIEW-2026-09-10`.

## Design update — updated 10 September 2026

The new [Polish descriptive guide](docs/POLISH_DESCRIPTIVE_GUIDE.md) is the
first-chapter masterplan. It records the user's approved direction and labels
remaining synthesis, historical research and calibration separately. This
entry updates the design boundary only: the implementation inspection dated
below remains a snapshot, not a fresh code audit.

The target is now January 1922 through coup resolution, or the next legal
parliamentary election after 1922 when no coup occurs, with domestic gameplay
and a state report suitable for continuation. Planned work includes a
parliamentary deck/project agenda, partner-specific cabinet agreements, all
nine portfolios with public works under Labour, dynamic 1922 presidential results and speaker succession,
a Polish economic model, staged militia development into an optionally early
AS, separate coup pressure/capacity and outcomes resolved after commitments.

The guide proposes a minimal persistent Senate and a recalibrated cross-class
electorate. The first legal parliamentary election after 1922 is now approved
as the endpoint even when held early. Exact default scheduling, assassination
alternatives and final numerical balance remain open. The new
[technical reference](docs/POLISH_TECHNICAL_REFERENCE.md) supplies concrete
draft values and contracts for testing, without implementing them. The user
clarified that military organization concerns Milicja PPS, not state police.
An early AS is approved alternate history; delaying its name until 1934 is not
the chosen direction.

The next design revision narrows minorities to Jewish and other-minority
categories beside the majority, retains Normal only, and shows presidential
elections as one nomination decision followed by the final tally. Program and
press proposals from Notion remain within the domestic chapter. The economic
complexity comparison recommends simplifying the first draft, but the choice
of replacement is pending; no transition row is marked implemented by these
documentation changes.

**Party-card review, reference 0.4:** The user's approved strategic card
catalog supersedes the generic program menu and the previous militia
command/trial-card proposals. This adds future implementation dependencies;
no transition is marked implemented.

| Approved change | Bounded transition | Required evidence |
|---|---|---|
| Strategic direction, opponent and electoral base | Party choice → persistent strategy → actual campaign/organization action | Context-specific effects and vote conservation; no current-cabinet opponent |
| Separate Piłsudski influence and parliamentary criticism | Persistent line + independent event record | Response does not silently replace strategy or command troops |
| Max three economic priorities / two investments | Draft selection → atomic commit → distinct downstream processes | One main action, full combined costs, shared cooldowns, no fourth/third item |
| Three forms of power and two minority cards | Declaration → negotiated project, with existing legal authority | Exactly three power options; four autonomy / three Jewish-cooperation choices; two population aggregates |
| Milicja recruitment and militarization, then AS | Strength and military preparation → optional reorganization | No command-upgrade action or hidden command gate; no duplicated people |
| Dues and faction expulsions | New income basis / single departure manifest | Lower dissent paid for in support and membership; elected MPs retain seats |
| Kraków strategy and communist cooperation | Specific strike → strategy → cooperation mode → outcome | Full/limited/none separately from escalation; one result per strike |
| USSR position | Domestic debate → party response | Relations/dissent, no invented external funding or diplomacy |

Standalone party religion and generic strike-strategy cards are excluded.
Education, historical event choices and concrete project agendas remain.
Numerical parameters and detailed USSR responses are proposals, not new
historical claims or approved runtime changes. Design source:
`PL-PARTY-CARDS-REVIEW-2026-09-10`.

**Content expansion, reference 0.3 (retained):** Approved subjects now have draft choices
and consequences in both Polish guides. The following dependencies define
bounded future work; none are marked implemented by this edit.

| Content group | Required transition | Completion evidence for a later implementation |
|---|---|---|
| Named lists, coalitions, premiers and speaker | Existing election/ballot state → accepted participant/program offer | Correct membership, actual votes, no automatic extra MPs or offices |
| Constitutional variants and Piłsudski concessions | Accepted offer → proper legal authorization → execution | Separate current law, coup intent and affected force allegiance |
| Grabski, taxes and investment funding | Toleration terms → financed policy → scheduled review | Finite revenue/loan effects and actual beneficiaries of cuts |
| Land, modernization, consolidation and education | Chosen variant → authorized project → completed/operating scope | Different political costs, limited tranches, no double payment/effect |
| Heritage under Education | Wawel/Warsaw and scope → funded finite restoration | Real cost, bounded completion reward, no industry/coup multiplier |
| TUR and communist trials | Preparation → funded course or accepted joint action → completion | No instant training or cooperation success at menu entry |
| Kraków, assassination response, cult and Żyrardów | Evidence/trigger → PPS choice → independent actor response → follow-up | Persistent event state, one recorded result, crisis outcome after choices |

The user-approved catalog reconciles earlier repository plans with the current
chapter boundary and simplified minorities. Numerical reactions and alternative
constitutional arrangements remain test proposals. Source evidence and limits:
`PL-CONTENT-1922-1926-2026-09` in `HISTORICAL_SOURCES.md`.

T01–T20 and their existing evidence below are not marked implemented by this
change. In particular, earlier notes saying that no endpoint has been approved
are historical to the inspection; no endpoint has yet been implemented.

Last inspected: **3 September 2026**

Source baseline: **`6568804` — changed stuff 2**, plus the pre-existing untracked
opening/election helpers and tests, this matrix, and the **uncommitted approved
December 1922 presidential slice** inspected below.

> This matrix records implemented slices and proposed next steps; it does not
> authorize further changes. The approved opening, November election and narrow
> post-election safeguards are implemented. A complete first chapter, wider German-content
> exclusions still require bounded implementation approval. The chapter
> endpoint is now approved as described above, but no cutoff exists in code.

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
