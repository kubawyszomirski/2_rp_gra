# Polish Adaptation Decision Worksheet

## Current state — reference 0.61, 7 October 2026

This section is the only current summary in this file. This worksheet records product scope and approved decisions. Everything under "Archive of entries" below is kept unchanged for traceability. It is history, not an implementation instruction; where it differs from the technical reference, the technical reference wins.

- **Canonical specification:** `docs/POLISH_TECHNICAL_REFERENCE.md`, chapters 1–22 (reference 0.61); its chapter 23 holds the decision history.
- **Player-facing description:** `docs/POLISH_DESCRIPTIVE_GUIDE.md`.
- **Audit:** every item of `docs/POLISH_MECHANICS_AUDIT.md` (M01–M19) is closed in documentation; stage 8 measured balance and behaviour in full automated campaigns (`analysis/stage8-campaigns/REPORT.md`).
- **Card catalogue for coding:** `docs/POLISH_CARD_CATALOGUE.md` (reference 0.32) has one table for each of its 69 entries (card families, agenda actions and events): access, options, time and resource cost, effects, end state and cooldown. It creates no rules; where it differs from the technical reference, the reference wins.
- **Cabinet formation in four steps (Z, K, 0.61):** the formation card shows four numbered steps — the cabinet from a list of all ten with clubs, seats, partners' scores and votes (impossible ones greyed with a reason), the role of PPS, the prime minister with one effect each, and the PPS portfolios bought with influence points (PPS share of the cabinet's seats + 10 when it is indispensable; Labour 10, Interior and Treasury 20, others 10); a partner's portfolio is greyed when the partner would refuse without it. A club deciding on a cabinet scores it visibly: 30% relation, 35% programme, 20% portfolio, 15% PPS credibility, minus broken promises, no hidden need, threshold 60 (`formationScoreParts`, `evaluateCabinetPartner`); other bargaining keeps `offerScore`. An accepted PPS offer is appointed at once; the +8 ranking only orders cabinets without PPS; a partner party's leader as prime minister gives +5 relation once. The draft's `portfolio_claim` is now a set bought with points (`portfolio_take`, `portfolio_drop`) (technical 8.3, 8.7, 8.8 and 23.34; chapter 30 of the plan). `npm test` 478 of 478.
- **Decks and hand (Z, K, 0.60):** the three decks are always shown in three rows, each with two places of the hand (`HAND_SIZE` 6, `HAND_PER_DECK` 2; a hand entry keeps `deck`); a closed deck (its `choose-if`) is greyed with a reason; a card is discarded by a button on it, once a month (`PolishRules.discardStatus`, `discardCard`), except the timed cards, the cards of the party's vision and the cards opened by a special event; the separate discard card is gone; a timed card shows a badge with its last month (`registerCardDeadline`); images of the three decks (technical 4.4 and 23.33; chapter 29 of the plan). `npm test` 472 of 472.
- **The Milicja in B5 and the unions card explained (Z, K, 0.59):** the event of the assassin's cult (B5) has a fourth answer, `disrupt`: the Milicja breaks up the services on the model of the retaliation of B4 (0.5 R, the Centrum +8, the Christian Democrats −5, PPS −1 among the peasants and the petty bourgeoisie, an authorised confrontation); the card "Trade Unions" says why it is in the deck, explains its numbers and gives each branch its next step (technical 17.7, 14.1 and 23.32; chapter 28 of the plan). `npm test` 472 of 472.
- **TUR from the start and the joint-list gate (Z, K, 0.58):** by the user's decision PPS can found TUR from January 1922; `S.party_orgs.tur.available_from` (13, January 1923, the founding of the historical TUR) is kept as a record and no longer gates the founding; every partner accepts a joint list only from a relation of 75 (`LIST_GATE`, technical 6.5) (technical 13.2 and 23.31; chapter 27 of the plan). `npm test` 470 of 470.
- **Thirteen items of 5 October 2026 (Z, K, 0.57):** the economic programme has effects (campaigns ×1.10 among the groups its priorities serve; +1/−1 pp for matching or contrary measures, `PolishProjects.PROGRAMME_LINKS`, `S.actors.pps.programme_log`) and opens on "Confirm the present programme" / "Change the programme"; the joint list is the event `polish_list_agreement` two months before the vote (gates 60/70/70, "we go alone", no peasant bloc, 0 T; queue category 4 keyed by election and month); the party agenda, the unions (during a dispute, `PolishUnions.disputeOpen`) and the protection of the unemployed are ordinary deck cards; the army oversight card only when there is something to choose; one wage case per cause (`S.strikes.wage_watch.latched`) and no "demands" at a full offer (`declined_clauses` hold a repeated offer); the decisive presidential ballot explained; the organisations card without a confirmation page; the party character without `allied_reach` (technical 20.1 and 23.30; chapter 26 of the plan). `npm test` 469 of 469.
- **Nine items of 5 October 2026 (Z, K, 0.56):** the money of the original game (collections from the Dues card and the agenda instead of monthly income, upkeep and arrears; the apparatus adds 25% to a collection per level); the union packages in a card of their own (`party.union_investments`); Piłsudski's criticism (B2) as a timed card of the Parliament deck with authentic quotations, silence recorded as `stance_silence` and further speeches at cabinet crises; the constitutional card after the debate event of December 1924 (`S.politics.constitution_debate`); the government card every six months or after an act of the cabinet against PPS (`S.cabinet.support_reviewed_at`); six economic priorities (`cooperatives_housing`); the 1919 votes next to the first election; the minority cabinet explained; fixed returns to the hand and polls from the start (technical 20.1 and 23.29; chapter 25 of the plan). `npm test` 463 of 463.
- **Sidebar readability (Z, K, 0.55):** on 5 October 2026 the user found the sidebar still unreadable after 0.54 and asked for bold text, headings and breaks (technical 20.1 and 23.28; chapter 24 of the plan). Every fact has a bold label; section headings have a rule and space above them; the Main tab opens with the date ("Status" before the game); composite lines are split (dues, membership index and apparatus level; dissent and cohesion); cohesion and membership are whole numbers and the five political indicators show their scale ("60 of 100"); the Defence tab has its own headings for Milicja PPS, the police and the army groups, one fact per line. Empty lines take no space, wrapped lines are indented under their label and no-break spaces keep numbers with their units. Display fields only: `pl_party_dues`, `pl_party_membership`, `pl_party_apparatus`, `pl_party_sales` and `pl_party_cohesion` (instead of `pl_party_base`) from `PolishParty.sidebarDisplay`; the scale in `pl_pol_*` from `PolishPolitics.statusView`; `pl_def_members`, `pl_def_efficiency`, `pl_def_condition`, `pl_def_attachment`, `pl_def_police_*` and `pl_def_force_<id>` with `pl_def_force_<id>_name` from `PolishSecurity.defenseView`. Every local page file carries `?v=0.55`. Rules unchanged; `npm test` 458 of 458.
- **Readable sidebar (Z, K, 0.54):** on 5 October 2026 the user found the Main tab of the sidebar unreadable (technical 20.1 and 23.27; chapter 23 of the plan). The sidebar shows only data, one fact per line under section headings: Main has the party, its organisations, the unions and the government; Politics has the political indicators, the Sejm, the relations and the factions; a new Economy tab has the economy, the projects and the laws in procedure; Defence and Polls are unchanged. The explanations that stood on the sidebar moved unchanged to a Library page, "Notes to the sidebar". The Main and Politics tabs compute their own new lines, so a save from 0.53 shows them at once. The stylesheet and every local script of the page carry one version (`?v=0.54`): a cached older script next to the always fresh `game_pl.json` stopped the game on the "LUTY 1922" page. Rules unchanged; `npm test` 455 of 455.
- **Choice descriptions (Z, K, 0.53):** on 4 October 2026 the user asked for a clear mark of the present line and for an Options choice whether the descriptions of choices show numbers (technical 20.1 and 23.26; chapter 22 of the plan). The present choice of the stance, Dues and Economic Programme cards opens its description with a bold label on its own line ("Present line" / "Obecna linia"). Every effect is named in words and its size stands in a parenthesis that opens with a sign or ×; the Options setting "Numbers in choices" (off by default, kept by the browser under `pps_effect_numbers`) shows or hides these parentheses. Costs are written in words (the month's action, resources, budget units) and stay visible with requirements and current values; the sidebar and the results keep the short forms R, B and T, explained by a legend in the Library. Rules unchanged; `npm test` 451 of 451.
- **Card images (Z, K, 4 October 2026; the technical reference is unchanged):** the user added 58 images for the Polish cards, events and Central Executive Committee cards. They are stored in `assets/img/polish/` as sRGB JPEG of at most 800 px (about 9 MB in all; the original PNG screenshots stay outside the repository). As in the original game, cards and pinned cards show them on the card (`card-image`) and events on their page (`face-image`); the heritage card shows the Wawel on the card and the Royal Castle on its page. Three cards (minority schools, social welfare, the Soviet model) replaced inherited German images. Their sources and licences are not yet recorded: `credits_images.txt` lists each file as to be completed. Test `tests/polish-images.test.js`; `npm test` 447 of 447.
- **Central Executive Committee (Z, K, 0.52):** on 4 October 2026 the user asked that the advisers be called "Centralny Komitet Wykonawczy" in Polish and "Central Executive Committee" in English (technical 10.4 and 23.25; chapter 21 of the plan). Only player-facing texts changed: the main-page header of the pinned cards, the card that changes the composition, the Library page, the opening texts and the action messages; one person is a member of the Committee ("członek CKW"). Rules, identifiers (`advisor`, `party.advisers`) and saves are unchanged, and the documentation keeps the technical term "adviser". The name is documented history (`PL-PPS-CKW-NAME-2026-10-04` in `HISTORICAL_SOURCES.md`); the three seats are a gameplay simplification. The wait before the next Committee action is written with full month forms in both languages. `npm test` 445 of 445.
- **Confirming the present line (Z, K, 0.51):** on 4 October 2026 the user asked that the stance cards also offer the present line and that "Close card" be called something like returning the card to the hand (technical 10.5, 13.1 and 23.24; chapter 20 of the plan). Choosing the present line now confirms it: it costs this month's action and the card waits its usual cooldown (6 months, the Soviet model 12), and nothing else changes — no record in `strategy_history`, no faction reaction, no relation change or one-time bonus. This replaces the 0.32 rule that the present line could not be chosen. The same applies to "Keep" on the Dues card and to the same set on the Economic Programme card; the other cards keep no paid no-effect options. The free exit from a card is now "Return to hand" ("Odłóż na rękę" in Polish); the exit from a card opened by an adviser stays "Close card". Schema 8 unchanged; `npm test` 444 of 444.
- **Polish language version (Z, K, 0.50):** on 4 October 2026 the user asked for a Polish version of the game with a language switch and approved decisions 1A–7A (technical 20.1 and 23.23; chapter 19 of the plan). The game has English (the default) and Polish; the player switches in Options or with the link in the page header, also during a game. The browser keeps the choice (`localStorage` key `pps_language`), not the save, so the same save loads in both languages. Scene texts are translated line by line in `source/i18n/pl/` and built into `out/html/game_pl.json`; rule texts have a Polish twin (`L(en, pl)`). Texts stored in `S` stay English and are translated when shown (`PolishRules.storedText`), so both languages play the same game: the test "Ta sama rozgrywka w obu językach" plays all 13 strategies to the end of the chapter in both languages and requires an identical state and no English line on Polish screens. Limitations: values computed before a mid-game switch keep the old language until the next page; the Credits translate only their headings; the game title in `info.dry` stays English because it keys saves and settings; unreachable German scenes stay untranslated. Dependencies and schema 8 unchanged; `npm test` 444 of 444.
- **Plan complete (Z, 0.49):** on 4 October 2026 the user decided that stage 8 is the last stage of the implementation plan. The first chapter is implemented in full, and the plan has no further stages. One feasibility check of 21.2 is not met: a lawful early election cannot be reached, because the dissolution under the arbitration reform (7.6) is not implemented. On 4 October 2026 the user decided not to implement it, so the limitation stays.
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

## M18 resolved in documentation — reference 0.30, 26 September 2026

Membership and the party apparatus, technical 13.1. The user chose a real,
growing membership scale and an apparatus income of 0.15 R per level, and
asked for the documentation.

- **Membership grows with the organised base:** the member index (0–150 in
  chapter 1) moves 5% of the gap each month toward
  `100 × average(PPS worker support ratio, average union reach ratio) ×
  (1 − 0.05 × (dues − 2))`, bounded 50–150. It works through existing
  actions: union expansion, campaigns, Pużak's mobilisation and Arciszewski's
  organising. There is no recruitment card. Splits and purges still cut the
  index at once.
- **Apparatus:** income `(0.25 × dues + 0.15 × (level − 1)) × members/100`;
  a level nets +0.05 R a month at full membership and pays back in about
  40 months (was 20).

[Diagnostics](analysis/m18-membership-apparatus/REPORT.md), cash after
52 months against no investment:

- three apparatus levels: +1.65 R (was +9.30 R);
- three expansions of one union branch: +3.26 R (was −3.00 R), with
  membership about 135;
- the 144 M02 runs keep outcomes and cabinets, cash never falls below zero,
  and active strategies end with 0–12 R more.

No gameplay code, dependency or scenario metadata changed (version 5).

## M17 resolved in documentation — reference 0.29, 26 September 2026

Late advisors and the KPP path, technical 9.5 and 10.4.3. The user chose to
treat Próchnik and Drobner as continuation advisors, and to open the KPP path
through ordinary actions. The user then asked for the documentation.

- **Continuation roster:** Próchnik (A12) and Drobner (A13) are not
  available in chapter 1. Their actions and dates are kept for chapter 2.
  Before, they arrived in January 1928, after most runs had ended.
- **Ordinary path to the KPP:** "Open contact" (9.5) is available from
  relation 10, the starting value, instead of 20. After the channel opens,
  ordinary 8.1 conversations (+4, one action, 3-month cooldown) include the
  KPP. Hostile choices can push the relation below 10 and close the channel.

[Diagnostics](analysis/m17-late-advisors/REPORT.md): the old threshold never
opened the channel without Drobner. Now limited strike coordination is
possible in month 4 (3 actions), full cooperation in month 10 (5 actions),
and the rules of a broader arrangement after about 25 months. M02 is
unaffected.

No gameplay code, dependency or scenario metadata changed (version 5).

## M06 resolved in documentation — reference 0.28, 26 September 2026

Office elections without deadlock, technical 7.3 and 7.5. The final tie
between two candidates already had the 50/50 lot from 0.18. The user now
chose "more votes wins" in the final and a safety net, and asked for the
documentation.

- **Final of two:** the candidate with more votes wins. Abstentions and
  invalid ballots count for presence, not for the majority. An exact tie keeps
  the saved 50/50 lot.
- **Quorum and candidacies:** all clubs attend mandatory office elections,
  because chapter 1 has no boycott option. Every election profile must have at
  least two valid candidacies; otherwise it fails validation before the vote.
- **Safety net:** if an election still does not resolve, the sequence ends as
  `no_election`. The acting holder named in the profile keeps the office, the
  player gets a normal turn, and a new vote follows automatically next month.

[Diagnostics](analysis/m06-office-elections/REPORT.md): A 200, B 180 and 60
abstentions now elects A instead of a deadlock. All 175 grid finals resolve,
ties included. M02 has no office-election algorithm, so the scenario is
unaffected.

No gameplay code, dependency or scenario metadata changed (version 5).

## M16 resolved in documentation — reference 0.27, 26 September 2026

The E3 split recalculation, technical 10.2. The user chose voters leaving in
the same proportion as members, −20 dissent for the remaining part, and
faction MP assignments frozen until a real transfer, and asked for the
documentation.

- **One recalculation, as for a purge, with 40% instead of 25%:**
  - faction strength ×0.6, then one normalisation to 100;
  - PPS membership and PPS support in every electorate cell fall by the
    departing share (`0.40 × faction strength / 100`); the lost voters go to
    the manifest's recipient, or to `other`;
  - 40% of the faction's MPs, rounded once, move to the split club;
  - organisations lose only the structures named in the manifest;
  - dissent of the remaining part −20 (a purge gives −15).
- **Frozen MPs:** after each election the PPS club is divided among factions
  by largest remainders from their strength on election day. Afterwards
  `faction_seats` changes only with a real transfer: split, purge or defection.
  Advisor actions that change faction strength no longer rewrite elected MPs.

[Diagnostics](analysis/m16-split-recalculation/REPORT.md):

- a Lewica split (strength 15, dissent 65, 5 MPs) removes 6% of PPS: support
  14.7% → 13.8%, 2 MPs, remaining dissent 45;
- a Piłsudczycy split removes 14% and 5 MPs;
- without the freeze, a Lewica strengthened to 24.1 would lose 3 MPs instead
  of 2 in the same split;
- archived M02 runs never reach a split.

No gameplay code, dependency or scenario metadata changed (version 5).

## M15 resolved in documentation — reference 0.26, 26 September 2026

The AS benefit, technical 13.3–13.4 and 16.8. The user chose option (a),
better call execution plus up to three concurrent actions before a coup, with
a +0.15 compliance bonus, and asked for the documentation.

- **Militia limit:** one action at a time. Before a coup it protects one
  matter; a second concurrent need stays unprotected. In a coup it has one
  task: combat when supporting or defending, own-people protection when
  neutral.
- **AS coordination:** member compliance +0.15, capped at 1. With the same
  people, AS has about 18–21% more force, in the coup and in events. It adds
  neither people nor militancy.
- **Three AS actions before a coup:** the engine fills each concurrent matter
  up to the full protection effect (40% at 4 F) and passes the rest to the
  next; a fourth matter is not served. In a coup AS keeps one task.

[Diagnostics](analysis/m15-as-benefit/REPORT.md), exact M08 enumeration at
democracy 60:

- defending the government with the same people as a 4 F militia, AS brings
  4.7 F; significant participation (F9) rises from 6.2% to 30.4% of attempts,
  and Piłsudski wins fall from 43.7% to 39.7%;
- supporting Piłsudski is practically unchanged;
- the archived M02 engine has no militia force, so the scenario is
  unaffected.

No gameplay code, dependency or scenario metadata changed (version 5).

## M13 resolved in documentation — reference 0.25, 25 September 2026

Communist discipline in a joint strike, technical 9.5–9.6. The user chose
relation plus goal fit for KPP discipline, and the existing unity-card
compromise for PPS internal consent, and asked for the documentation.

- **KPP discipline:** `(relation + goalFit) / 200`, within 10–90%, one saved
  roll. The event profile records the partner's goal (limited, broad or
  structural demands). Agreed demands at or above that goal give 100, one
  level below 50, two levels below 0. The test profile uses a broad goal;
  historical KPP goals are `TBD — historical research required`.
- **PPS internal acceptance acts only on PPS:** the "Compromise" option of the
  existing `party.unity` card on communist cooperation gives +15 in every
  faction. At 60 or more the line is agreed: the Centre dissent penalty
  (+5 full, +2 limited) disappears, and the durable-front gate stays as
  before. A breach of the agreed rules still costs −15.
- Own unions and militia keep their usual compliance from their alignment
  (10.3).

[Diagnostics](analysis/m13-communist-discipline/REPORT.md): at relation 30 and
a broad goal, the KPP keeps the rules with 65% for broad demands and 40% for
limited ones. Persuading the PPS Centre no longer changes this. The archived
M02 runs contain no communist cooperation, so the scenario is unaffected.

No gameplay code, dependency or scenario metadata changed (version 5).

## M12 resolved in documentation — reference 0.24, 25 September 2026

Strike settlements and government fragility, technical 14.4, 14.5 and 17.4.
The user chose a cost of continuing built from both money and fatigue, and a
fragility built from support and disputes, and asked for the documentation.

- **Union consent to a settlement:** `0.5 × fulfilment + 0.3 × trust + 0.2 ×
  cost of continuing ≥ 50`, keeping red lines.
  - The cost of continuing is the larger of the fund shortfall and the
    strikers' fatigue.
  - A full fund no longer makes the union settle, but it still raises
    pressure on the employer (14.2).
- **Government fragility in strike negotiations:** `50 − (supporting seats −
  222) + 0.5 × the highest tension in the cabinet's agreements`, within
  0–100; a caretaker cabinet has 100. Sejm authority no longer affects strikes.

[Diagnostics](analysis/m12-strike-settlement/REPORT.md) show:

- the audit example (half the demands, trust 50) now gives 40 with a full fund
  (refusal) and 60 with an empty fund (consent);
- in the 144 archived M02 runs, the consent rule changes nothing, because
  every offer meets all demands;
- fragility moves strike success chances by −8.2 to +3.4 pp. In 10 runs the
  settlement falls in another month, and one attempt comes a month earlier.
  Cabinet sequences are unchanged.

Remaining work: calibration of weights and thresholds, and partial offers,
in the prototype. No gameplay code, dependency or scenario metadata changed
(version 5).

## M11 resolved in documentation — reference 0.23, 25 September 2026

Threat versus persuasion in the government-support card, technical 9.8. The
user chose a real choice after a refused threat and a relation cost for a
forced concession, and asked for the documentation.

- **A threat must be real:** when the government refuses a `bargain`, PPS at
  once and at 0 T either carries out the threat (the usual `withdraw` effects)
  or backs down. Backing down costs −5 credibility, and until this cabinet
  ends further bargaining counts without the need bonus, like persuasion.
- **A forced concession costs:** every party that accepts an offer made under
  threat lowers its relation with PPS by 3.
- **Persuasion is safe:** it changes neither relation nor credibility, but has
  no need bonus.
- The 8.3 score is unchanged. When the premier has a majority without PPS,
  bargaining gains nothing and only costs.

[Diagnostics](analysis/m11-threat-persuasion/REPORT.md) show:

- the audit example gives 65 (success, relation −3) for bargaining and 55
  (refusal, no cost) for persuasion;
- in the Skrzyński welfare review, bargaining saves two ZLN contacts but costs
  −3 relation with four parties;
- in the 144 archived M02 runs, outcomes, cabinet sequences and attempt dates
  are unchanged, also together with M10. In the 12 runs with a refused review,
  PPS leaves one month earlier.

Remaining work: calibration of −5 and −3 in the prototype. No gameplay code,
dependency or scenario metadata changed (version 5).

## M10 resolved in documentation — reference 0.22, 25 September 2026

Sejm authority and democracy, technical 15.2, 15.3 and 16.1. The user decided
that democracy should affect army readiness and, a little, coup pressure; that
democracy may still grow on its own, but only slowly; and that the army effect
should be gentle. The user approved the numbers below and asked for the
documentation.

- **One owner for authority:** authority is only read from the dated
  institutional log of the last 12 months. The response to a Piłsudski speech
  (10.7) becomes a log entry: +1 for defending parliament, −2 for supporting
  the criticism. It replaces a direct write that the monthly recomputation
  erased.
- **Slow democracy drift:** the authority reference point in the democracy
  equation is 53 instead of 50. An ordinary Sejm adds 0.06 a month (about 0.7
  a year) instead of 0.15.
  - A new case of violence against institutions, including a confirmed
    assassination of the president, gives −2.
  - Lifting an unlawful restriction through a legal procedure gives +1.
- **Before a coup democracy acts twice:**
  - Army readiness: every 10 points above 60 move 2.5 pp of each group's
    Piłsudski loyalty to neutral, and every 10 points below move it back,
    capped at ±10 pp. It applies to the capacity gate, estimates and the
    allegiance roll after F5.
  - Coup pressure: a monthly term of `0.01 × (60 − democracy)`, capped at
    ±0.5. That is −0.1 at democracy 70 and +0.1 at 50.
- **What does not read democracy:** offers, elections and the 5.6 voter flow.

[Diagnostics](analysis/m10-authority-democracy/REPORT.md) show:

- all 96 archived M02 attempts remain, each 1–3 months later; for example, the
  base Sejm with historically similar decisions moves from April to June 1926.
  The user accepted this; M02 dates are not refitted;
- democracy at the attempt falls from 70–79 to 65–75, where a passive PPS
  gives Piłsudski 41–43% wins (44% at democracy 60, as in M08);
- capacity never falls below the gate of 30.

Remaining work:

- calibration of log weights, shift strength, the pressure term and
  unlawful-act profiles, in the prototype;
- the historical link between democratic sentiment, officers' conduct and coup
  pressure (`TBD — historical research required`);
- advisor scenes must stop writing the inherited `pro_republic` (technical
  20.2).

No gameplay code, dependency or scenario metadata changed (version 5).

## M09 resolved in documentation — reference 0.21, 25 September 2026

Approved monthly living-conditions support flow, technical 5.6. The economy
now moves voters directly, not only through broken promises.

- **Index:** each class has one derived living-conditions number: real wages
  minus 2 points per percentage point of unemployment above 3%. Workers feel
  it fully, intelligentsia at 1/2, petty bourgeoisie at 1/4 and peasants at
  1/5 on top of the full rural index (11.6). Bourgeoisie and landowners do not
  react.
- **Flow:** only a month-to-month change moves support. A worsening shifts
  0.1 pp per point, at most 0.5 pp a month in a class, from the parties
  responsible for the government to the others. An improvement rewards the
  responsible parties at half strength (0.05 pp per point, at most 0.25 pp).
- **Responsibility:** cabinet parties 1, parties tolerating the cabinet under
  a signed agreement 0.5, opposition 0. A non-party premier brings no voters
  of their own.
- **Recipients:** the other parties, in proportion to their current share in
  the cell. The broken-promise outflow keeps its own 0.5 pp cap and now uses
  the same share-based split.
- **No double counting:** inflation acts only through real wages and output
  only through unemployment. Benefits are outside the index, and job loss does
  not change preferences.

User decisions: gentle strength, improvement at half strength, no extra
inflation term for the middle classes, and peasants who react but less than
other classes (interpreted as 1/5 of the general economy).
[Diagnostics](analysis/m09-living-conditions/REPORT.md) replay the archived
M02 traces: the flow alone moves PPS by −0.1 to +0.6 pp over the chapter.
Remaining work:

- balance and rural-index sensitivity, in the prototype;
- disabling the legacy German support drifts at implementation (technical
  20.2).

No gameplay code, dependency or scenario metadata changed (version 5).

## M08 resolved in documentation — reference 0.20, 24 September 2026

Approved coup profile `coup_f_v1`, technical 16.8. The player still makes
F4 (stance), F5 (organizations) and, only when relevant, F9.

- **Rounds:** at most four. A side wins after two consecutive rounds above
  1.20, or immediately at 2:1. The opponent's next-round arrivals count, so
  rail delays keep their effect. Fights often end after one or two rounds.
- **Settlements:** three offers — military function, inspectorate law or
  cabinet change. Acceptance depends on the cost of continuing, offer fit and
  democracy; there is no named guarantor. A side with a clear advantage does
  not bargain, and one final assessment follows round four.
- **PPS voice:** F9 appears only when PPS is a significant fighting factor
  (an actual rail delay, or militia at least 1/10 of its side). Rejection
  closes settlement for the attempt.
- **Endings:** `prolonged_conflict` is an approved chapter ending and should
  be rarer than a victory.
- **Concessions:** the winner owes PPS concessions only after a decisive
  counterfactual contribution and previously recorded PPS conditions.
- **Test forces:** `synthetic_test_v2` reserve loyalties give roughly 44%
  Piłsudski wins with a passive PPS.

[Diagnostics](analysis/m08-coup-profile/REPORT.md) enumerate all 81 synthetic
allegiance outcomes. Remaining work:

- historical forces, routes, mediation and the cabinet-change candidate
  (`TBD — historical research required`);
- balance and the working F10+F11 effects, in the prototype;
- the AS three-task benefit, which remains M15.

No gameplay code, dependency or scenario metadata changed (version 5).

## M07 resolved in documentation — reference 0.19

Approved first-chapter execution: industrial orders, police professionalization,
case-specific redress, bounded military appointments, workplace representation
and administrative/cultural autonomy. Technical 17.12.1–7 specifies action cost,
budget/time, authority, delivery/failure, effects and their later readers.
Broad judicial safeguards reuse the existing democratization project. Federation,
full political autonomy and a council state remain programme goals for the
continuation, with current faction/campaign/agreement consequences.

M07 is ready for implementation; historical actor/case/territory profiles and
balance remain prototype work, operational forces remain M08. No new deck,
ministry, global meter or D initiative. Existing 16 government families remain;
workplace representation is a contextual industrial-policy choice, autonomy
uses the agenda of an agreed government programme. No gameplay or M02 replay
change; scenario metadata remains 5. Earlier entries retain revision context.

## Finalist ties — reference 0.18

Approved: elect either of two tied presidential/speaker finalists at 50/50,
once with a saved draw. No extra choice or month. Valid candidacies and quorum
remain required; M06 is resolved for ties, with other deadlock cases still open.
Documentation only; technical 7.3 / 7.5, scenario metadata unchanged.

## M05 resolved in documentation — reference 0.17, 22 September 2026

Approved: one D initiative and two cards. D2 resolves the Sejm vote; Senate
processing and promulgation run automatically on recorded dates. Payments
start only after legal entry into force, using actual funding and Labour
administration. PPS authorship receives a proposed 0.40 responsibility share
once on full delivery, without stacking role bonuses. General project actions
cannot reopen D. Technical 5.4 / 7.2 / 12.2–3 / 17.15.
M05 is ready for implementation; dates, save/resume, failures and attribution
remain prototype checks. M02 rules, its archived tests and scenario version 5
are unchanged. Earlier entries below retain their revision context.

## M02 ready for implementation — reference 0.16, 22 September 2026

The user approved two final corrections: +20 only for an actual Chjeno-Piast
return after a stabilization or broad cabinet during an unresolved military
case, without a May gate; welfare compromise uses the common score ≥60,
funding and hard conditions, without separate relationship minima. Keep +2/month,
threshold 65 and all other numbers. Technical 17.16.11 / scenario metadata 5.

[Final verification](analysis/m02-robustness/REPORT.md) uses the existing suite
once. M02's documentation stage is closed; prototype balance, full hand draws
and historical validation of provisional military-case dates remain. M06/M08/M09
are separate audit items. No new cards, meters or further date-fitting round.
Earlier dated entries below are the record of superseded stages, not current
M02 blockers. No Dendry gameplay changed.

## M02 step 4 checked — paired robustness, 22 September 2026

[Report](analysis/m02-robustness/REPORT.md): 144 main monthly replays (four
strategies, three 444-seat chambers, 12 shared random tapes), 216 matched
single-decision controls and 36 army-case-onset controls. Economy and political
acceptance are recomputed together. Technical 17.16.10 records results without
changing 0.15 rules or scenario metadata.

The frozen-history May result does not survive integration: baseline H yields
February 1927. Priorities now are the May-only return impulse, actual army-case
lifecycles, and the extra relationship gate on an otherwise acceptable welfare
compromise. Resolve these explicitly, then repeat the same suite. M02 remains
open; full deck draws, election outcomes (M09) and historical forces (M08) are
not silently claimed complete. Diagnostics and documentation only.

## M02 step 3 — pressure coverage and timing, reference 0.15, 22 September 2026

[Pressure report](analysis/m02-pressure-calibration/REPORT.md), technical 4.2,
15.3 and 17.16.9: reproduce 272 archived readings, compare 20 sensitivity runs
and three step-2 projections. Keep +2/month and threshold 65. Count the omitted
caretaker month and one qualifying public military confrontation; check gates
after committed event batches and monthly settlement, before advancing time.
No calendar top-up, extra deck or gameplay change. Scenario metadata version 4.

Controlled H reaches May 1926; a delivered compromise can prevent the attempt,
and changed events can delay it. This is not a full campaign replay. Next:
integrate actual military-case lifecycles, actor consent, economy and elections
in all four campaigns, including refusal branches. A continuously open 1923
case reaches March 1926 in sensitivity testing; do not silently reset it to
fit May. M02 remains partially open; operational force validation remains M08.

## M02 step 2 — political succession contract, reference 0.14

Technical 17.16.8 now connects the credit crisis, Grabski's first and revised
offers, resignation/caretaker, scored successor offers, welfare review, PPS
withdrawal, retention/replacement and coup gates. See
[16 checked political variants](analysis/m02-political-chain/REPORT.md).
Two actual political refusals proceed through a new cabinet, not just an
isolated resignation check. A successor inherits legal benefits and fiscal
expiry dates. No new card, negotiation round or global meter.

Scenario metadata is version 3; detailed actor/offer profiles remain P.
Next: calibrate timing, then rerun full campaigns with evolving economics,
reputation and multiple parliamentary configurations. An early credit response
currently advances resignation/review; do not repair it by forced calendar
appointments or an automatic May coup. M02 remains partially open.

## M02 step 1 checked — 21 September 2026

[Four negotiation checks](analysis/m02-negotiations/REPORT.md) calculate 59
partner/candidate scores and variants under reference 0.13. They expose the
PPS–NPR Labor conflict, contested financing of Grabski's welfare agreement,
the effect of a viable Witos alternative and the missing ten Piast deputies.
Technical 8.9 records explicit P candidate profiles and a conditional Economic
portfolio offer to NPR. No new cards, global variables or acceptance threshold.
These are isolated calculations; prior archived campaigns still contain fixed
consents. Next: connect actual alternative availability, funding votes and MP
declarations before recalibrating and rerunning campaigns. M02 stays open.

## Approved M02 corrections — reference 0.13, 21 September 2026

Current target supersedes the corresponding 0.12 rules below. User approval:
`PL-M02-REVISION-2026-09-21`. Documentation and diagnostic tools only.

- Crisis Skrzynski offers use programme acceptance, votes and red lines without
  separate relationship entry thresholds; relationships still affect acceptance.
- One six-month benefit review during the credit crisis: full benefits 2 B or
  the right's proposed 1 B; one feasible negotiated continuation, no new card.
- Grabski has a specified credit package, one tax-funded revision and resignation
  after failure; PPS withdrawal alone still cannot appoint a successor.
- Wages recover at most 3 index points/month under the stated conditions;
  limited protest uses 50 or an unresolved demand. A resignation demand needs
  no extra grievance gate; wider mobilization retains 60.
- First actual settlement delivery gives recipients -4 grievance once.
  Open military conflict adds 2 pressure/month; agreement rewards are one-shot.
- Military victory requires at least phase 2, so enemy rail reserves can matter.

Four controlled replays and focused checks are in
[revision report](analysis/m02-revision-13/REPORT.md). M02 remains partially open
for political consent profiles and calibration: the historical-intention fixture
now reaches the coalition dispute and an actual replacement vote, but its coup
still occurs in December 1926. M08 needs historical forces/offers; electoral
and factional consequences remain their existing audit tasks.

## Approved Normal scenario — reference 0.12, 20 September 2026

The user approved the reviewed scenario for documentation. Canonical contract:
[technical 17.16](docs/POLISH_TECHNICAL_REFERENCE.md#1716-scenariusz-normalny--normal_chapter1_v1),
with the player explanation in descriptive 12/15/17.

- One `normal_chapter1_v1`, not another difficulty/history selector.
- Dated marka pressures, a rural shock, the 1925 credit/output crisis, its
  1926 taper and recovery that also applies without a coup. Completed currency
  stabilization ends marka pressures, not the later credit shock.
- At most one new autonomous cabinet initiative per month outside PPS-controlled
  ministries; ordinary law, budget, consent and project steps still apply.
- Cabinet profiles and worker disputes generate conditional transitions; a date,
  strike or PPS departure alone does not dismiss a government.
- Military opportunity begins in spring 1926 (draft date 1 March); actual force
  availability, intent, capacity and stand-down agreements still gate a coup.
- Without a coup, financing expiry, policy delivery and electoral alliances lead
  to the next legal election; preserve the draft 19 February 1928 calendar.
- N-A passive PPS, N-B external support and N-C cabinet membership are defined
  comparison runs, not three rigid routes or completed simulations.

No cards are reintroduced. M02 is partially resolved: the scenario contract is
written, but full campaign calibration and related M06/M08/M09–M13 issues remain.
Source: `PL-NORMAL-SCENARIO-2026-09-20`. Documentation only; do not enable the
manifest alongside inherited German economic/event effects in current code.

## Approved simple economy — reference 0.11, 14 September 2026

The user accepted M01's recommended simplification. Both Polish guides now
specify one fiscal-space budget, seven economic readings, short reform steps
and one capital-reaction process. No treasury ledger or manual staff allocation.
Existing strategic choices (tax incidence, loans, stabilization costs, land,
public works, education) remain. The nine-ministry manifest is unchanged.

Documentation integration includes D's single benefit program, coalition
obligations, state execution after PPS leaves government, advisor steps, TUR,
project costs, end-of-chapter records and acceptance cases. Main actions still
cost a month; approved projects do not wait for a second random draw.

Implementation remains future work. Normal's pressure/NPC contract is now
defined in reference 0.12; M02 still requires campaign verification. Complete
the remaining electoral consequences (M09) and calibrate numbers in scenarios.
The audit closes M01/M03/M04/M14 at the documentation level; other findings
remain active or partially resolved. Source: `PL-ECONOMY-SIMPLIFICATION-2026-09-14`.

## Approved D–G simplification — reference 0.10, 11 September 2026

Implement documentation first; gameplay is unchanged. Canonical specification:
[technical reference 17.15](docs/POLISH_TECHNICAL_REFERENCE.md#1715-zatwierdzone-uproszczenie-dg).

- D: one unemployment-protection bill, two cards, after the 1922 election and
  outside formal government (external support is allowed). Initiate/decline,
  then full bill/available compromise, or withdrawal if no compromise exists.
  Votes and execution are automatic; no generic D preparation/funding/executor
  chain. Cabinet stabilization remains a constitutional-reform variant.
- E: retain only E3 and E6. E3 concerns a departing portion of a faction,
  normally without an advisor; any exceptional advisor departure is named
  before the choice. Accept the actual policy demand or accept the split.
  E6: uphold the accepted settlement or support continued striking.
- F: remove F1, F2 and F8. Keep stance and organization choices; merge F6/F7
  into a no-choice participation/transport report. F9 requires actual PPS
  involvement and a feasible offer. Merge F10/F11 into outcome/consequences.
- G: remove G2/G3 monthly screens and G5 list confirmation. G1/G4/G6 remain
  informational; G7 ends the chapter and starts the single G8 report.
  G9 restores directly without replaying effects.

This supersedes earlier D–G scene proposals, not unrelated party/ministry
cards. Parliament still has 10 families (D1/D2 share family 2), government
16 families, advisors 22 actions. Draft costs and thresholds remain P.

## C-scenes simplification — reference 0.9, 11 September 2026

User-approved scope: C1 is one scene and one submission; C3 selects only the
alliance, without a second terms negotiation. Remove C2 counteroffers, C4
legislative-procedure menus, C8 early-election initiative and C9 vacancy screen.
C5 speaker, C6 president and C7 dismissal votes remain. Current parliament
manifest has 10 families; government 16 and advisors 22 actions are unchanged.
Votes, accepted obligations, automatic succession and lawful election dates
remain real state; they do not create replacement menus. No wider economic or
constitutional redesign is inferred. Technical 17.14 is the canonical map.
Source: `PL-C-SCENES-REVIEW-2026-09-11`. Documentation only.


## Events revision B1–B21 — reference 0.8, 10 September 2026

The user's latest review supersedes earlier scene menus. Technical 17.13
maps every B number. Current manifests: 11 parliamentary families, 16 government
families. B8+B10 share three choices (negotiate, limited economic strike,
strike for cabinet resignation); B11+B12 share one settlement/parliament menu.
Keep B9's full/limited/no communist cooperation. Soviet-model policy B13 is
a regular party card. Remove separate B3/B6/B15/B17/B20/B21 menus; B7/B18
use normal cabinet formation. Existing economic/institutional consequences remain.

B5 replaces two discarded choices with a democracy Mass, requiring a willing
host and organization; this is a gameplay alternative, not a historical claim.
Expert toleration drops support without an agreement and requires organization,
real contact, accepted terms and funding. B16 requires actual executive authority.
Source: `PL-EVENTS-B-REVIEW-2026-09-10`. Documentation only; no runtime work completed.


## Advisor revision — 10 September 2026

The user requested a German-advisor audit and concrete, non-repetitive
actions, with one or two per adviser and faction effects on selection.
Technical reference **0.7, 10.4** and descriptive section 5 now specify
13 profiles / 22 actions. Numbers remain test proposals, not runtime changes.

First appointment proposes +5 raw faction strength and −5 faction dissent;
voluntary dismissal +5 dissent. Reappointment repeats neither benefit. The
three opening appointments are already reflected in the initial state. Three
slots and one shared six-month action cooldown remain; roster changes do not
reset it. Government redirects bypass the named card's draw/cooldown for one
stage, while preserving law, ministry, funds and the shared advisor cooldown.

Direct actions cover relations, dissent, faction strength, worker/class/city
support and temporary press/organization effects. Jaworowski has Back
Piłsudski, Moraczewski Public Works, Malinowski Organize the Piłsudczyks;
Ziemięcki combines toleration defense with Municipal Socialism. Repetitive
generic Sanacja cooperation/support actions are folded into existing relation
and cabinet systems. Próchnik retains Republican Left; Drobner owns negotiation
and concrete joint action, rather than duplicating both men's KPP contacts.

Sanacja and SL are conditional continuation labels, not new 1922 parties.
Conditional Toleration requires actual external support of an aligned minority
cabinet; full coalition membership does not qualify. Próchnik/Drobner retain
January 1928 availability, Dubois 1930 outside this chapter. Joint trials may
include real demonstrations/protection as well as strikes, but never count
one event or a mere meeting twice. The scope still ends at the coup result or
next legal parliamentary election. Source: `PL-ADVISORS-REVIEW-2026-09-10`.

## Approved government cards and nine ministries — 10 September 2026

The user approved 16 basic government card families and two crisis responses,
with one correction: remove the separate Public Works / Communications
ministry and assign its card to Labour. The current target therefore has
**nine portfolios**; Foreign Affairs remains without diplomatic cards.
This supersedes the earlier ten-portfolio target. Existing code and earlier
implementation audit entries still describe ten until a bounded migration.

The approved families are labour rights; welfare; fiscal policy; currency
stabilization; investment capital; industrial intervention; public works;
land reform; agricultural modernization; education; minority-language schools;
internal security; justice; military policy; Piłsudski concessions; and heritage
restoration. The two events are the state's response to a strike and an actual
business refusal to cooperate. Their choices are specified in descriptive
section 3 and technical **0.6**, sections 17.11–17.12.

Labour owns employment works, infrastructure and worker housing from the works
card. Treasury funding, legal authority and executors still matter; acquiring
Labour does not command police or railway unions. Parliamentary/party cards
remain distinct, with one shared action budget and no duplicate project effects.
Detailed new costs and institutional profiles are proposals for calibration,
not an approval of a larger economic model or an implemented runtime change.
Design source: `PL-GOVERNMENT-CARDS-REVIEW-2026-09-10`.

## Approved parliamentary-card review — 10 September 2026

The user approved the revised **12 parliamentary card families** now recorded
in descriptive section 3 and technical-reference **0.5**, section 17.10.
Cabinet formation, PPS participation, concrete portfolios and Grabski's
stabilization terms form one sequence, with no negotiation-priority card.
Unavailable coalitions are greyed out with reasons. Minority support is an
explicit optional negotiation, not automatic votes. Broad/stabilization
offers require an actual crisis; its severity improves willingness to agree
without overriding red lines. Normal first-election formation does not expose
them as selectable options. Ordinary expert/administrative cabinets are not
all classified as extraordinary stabilization offers.

Budget negotiations require coalition membership or actual external support
of the active cabinet, including an expert cabinet. A one-off favourable vote
does not qualify. Government relations use one simple menu: withdraw support,
bargain for concessions, persuade without an ultimatum, or continue support;
no-confidence proceedings are a step in that same matter. Opposition uses
the contextual support/refuse-dismissal choices. Early-election initiatives
are available only during an unresolved crisis after a real cabinet fall,
and retain all legal requirements. Actual Piłsudski concessions move to the
government pool; parliamentary scrutiny and required legislation remain.

The Żyrardów event has exactly two options (publicise/demand accountability or
limit publicity); parliamentary strike response has three (demand reversal
and worker concessions, seek agreement, or support order/call off the strike).
Existing party strike strategy, Milicja and communist choices remain separate.
Legislation, constitutional reform, army scrutiny, electoral agreements,
speaker and president complete the 12-family manifest. No new gameplay is
implemented. Detailed thresholds, field names and costs remain proposals.
Design source: `PL-PARLIAMENT-CARDS-REVIEW-2026-09-10`.

## Current design direction — updated 10 September 2026

The first-chapter masterplan is now documented in
[POLISH_DESCRIPTIVE_GUIDE.md](docs/POLISH_DESCRIPTIVE_GUIDE.md). This is a
documentation-only design update, not an implementation milestone. Existing
sections below retain the history of earlier approved and implemented slices;
where their design differs, the new direction below supersedes it for future
work, without claiming that the code has changed.

[POLISH_TECHNICAL_REFERENCE.md](docs/POLISH_TECHNICAL_REFERENCE.md) now supplies
the draft state contracts, costs, thresholds, formulas, action/event sequences,
integration boundaries and acceptance scenarios. The user requested concrete
draft values; `balance_v0_1` is proposed for testing, not approved implemented
balance. The first legal parliamentary election after 1922 ends the chapter,
including an early election before May 1926; this endpoint is now approved.

**Latest simplifications:** Keep only Jewish and other-minority categories
alongside the Polish majority; no further national subgroups. Normal is the
only difficulty. Presidential elections show one PPS nomination decision and
the final ballot result; any intermediate transfers happen automatically.
These directions are retained in technical-reference version 0.7.

**Approved party-card review — 10 September 2026:** The party deck now has
strategic choices of direction, principal opponent (excluding the current
cabinet), party relations, Piłsudski influence, economic priorities, form of
power, electoral base, two minority policies, organizations, Milicja, media,
dues and party unity. Directions have context-sensitive effects; early
democratic organization is groundwork for an actual institutional crisis.
Piłsudski's criticism of parliament has a separate response event. Economic
priorities have a maximum active set of three; one organization card can fund
two different organizations in one main action, at their combined cost.

The form-of-power card offers parliamentarism, a stronger presidency or
workers' councils; existing constitutional projects remain implementation
tools. The Slavic-autonomy card retains all four choices from Notion:
federation, regional autonomy, cultural/language/organizational freedoms
without autonomy, and polonisation. Jewish cooperation is broad, labour-only
or absent. This does not add national population subgroups. The standalone
religion card is omitted; existing Education and event decisions remain.

Milicja has recruitment and militarization, then conditional conversion to
AS; no independent command-upgrade action. Recruitment is retained, following
the user's final clarification in their review. A faction-expulsion choice
reduces that faction's influence and dissent while costing PPS support,
membership and potentially MPs/advisers; parliamentary mandates survive in
other clubs. Strike strategy is contextual, especially Kraków. Communist
cooperation is a separate full/limited/none strike decision; an USSR-position
event affects domestic party politics without foreign-policy gameplay.

Reference: sections 9.6, 10.5–10.10, 13.1–13.5 and 17. These choices are Z;
numeric costs, gates, modifiers, expulsion size and detailed USSR responses
are P. The former religious party card, separate militia command requirement
and three independent communist-trial cards are superseded. Full alternative
federal/council-state implementation needs a later bounded specification.
Source/design record: `PL-PARTY-CARDS-REVIEW-2026-09-10`.

**Approved content expansion — 9 September 2026:** Both Polish guides now
include concrete electoral alliances (PPS–Wyzwolenie, PPS–NPR, the peasant bloc,
early Centrolew), cabinet configurations from PPS–PSL–NPR to broader coalitions,
national unity and united left, the cabinet sequence and alternative premiers,
and the Śmiarowski/Rataj/Daszyński speaker choice. Land, fiscal, education,
minority-rights and constitutional projects now have distinct political
variants, alongside Grabski toleration and specific concessions to Piłsudski.
TUR has selectable educational tasks. Kraków 1923, post-assassination
mobilization, Niewiadomski commemorations and the Żyrardów affair have explicit
player choices and follow-up consequences. Wawel/Royal Castle restoration is
a bounded Education decision. Details: technical sections 6.5, 7.5–7.6,
8.6–8.7, 9.6–9.7, 11.9, 12.6–12.8, 13.2, 16.7 and 17.5–17.9.

The approved subjects use existing agreement/project/event systems. Draft
costs, ideological profiles and alternate constitutional rules remain P;
adding the catalog does not approve implementation. The later economy
simplification was approved on 14 September and is defined in reference 0.11. Minorities retain external parliamentary
support without portfolio ownership in these first-chapter configurations.
The historical source boundary is `PL-CONTENT-1922-1926-2026-09`.

**User-approved direction:** January 1922 to resolution of the May-coup crisis,
or the next legal parliamentary election after 1922 if no coup takes place;
domestic affairs; plausible alternatives with the historical trajectory as the
default tendency; variable presidential elections in 1922; one main action per
month, three hand slots, guaranteed access to critical eligible actions and
started projects, and advisers with a cooldown. Use nine portfolio
categories after moving Public Works to Labour; foreign-policy play remains
outside this chapter.

The player can govern, support a cabinet externally, or act from opposition.
Negotiating strength is temporary and contextual, not a second accumulated
currency. The economy will distinguish inflation, real wages, public finance,
production, credit, unemployment and agrarian pressure. Approximately 12–15
main status readings are visible, with contextual detail elsewhere. Communist
cooperation is possible but requires costly repeated preparation. Relations
with Piłsudski, political pressure for a coup and operational coup capacity are
separate. The two minority categories are now explicit; their population and
mandate weights still need calibration.

**Explicit militia clarification:** The user meant Milicja PPS, not state
police. Militarization precedes sufficient strength/readiness and a subsequent
AS reorganization. Early AS is deliberately allowed as alternate history; do
not impose a 1934 gate. This replaces the immediate-reorganization design for
future implementation, not the current working mechanic.

**Design synthesis, not yet calibrated code:** Add the speaker's acting-head-of-
state role and a minimal persistent Senate; use partner-specific government
commitments; distinguish withdrawal of support, cabinet resignation and
parliamentary dissolution; stage economic implementation and militia growth;
resolve coup outcomes after player commitments; end with a transferable state
report. The guide proposes replacing overlapping electoral weights with a
cross-class identity/employment model, subject to separate calibration.

**Remaining decisions/research:** Selection of the default no-coup election
schedule, alternative presidential protection/assassination scenarios,
historical cabinet/club profiles, army actors, economic data, and calibration
of the proposed thresholds, costs and probabilities. The technical reference
offers 19 February 1928 as a legally constrained counterfactual schedule under
specified assumptions; this is not a historical election date or a new fixed
date imposed on the game.
The guide treats the 1926 Chjeno-Piast return as a mandatory confrontation
whose passage into fighting still respects changed political and military
conditions. It does not guarantee the same coup regardless of previous play.

**Economy decision, 14 September:** The user approved seven readings with
simpler supporting rules. Technical sections 11–12 now replace the detailed
Polish fiscal ledger, staff allocation and three-sector business model.
Small reforms take one action, large reforms normally preparation plus launch;
legal/political gates remain. Numerical settings are test proposals.

The renewed Notion review adds bounded proposals for party-program choices,
minority cooperation, secularism, popular versus party-journal press and
responses to confiscation. These reuse agreements, campaigns and event
records. Later major investments and new historical event claims are not
automatically brought into the first chapter.

No gameplay, dependency, asset, compiled output or save-format changes are
included. Related source records: `PPS-CHAPTER1-DESIGN-2026-09`,
`PPS-CHAPTER1-NOTION-NOTES`, `PL-1924-FISCAL-CURRENCY`,
`PL-1925-LAND-REFORM`, `PPS-MAY-1926-ROLE`, `PL-1922-1926-CABINETS`.

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
  The campaign end date remains TBD — user decision required. The implemented
  opening chronology now includes the December 1922 presidential succession.
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
- **Chronology decision:** November 1922 is implemented as a Sejm election,
  followed by the approved fixed presidential sequence in December. May 1928
  and subsequent inherited parliamentary scheduling remain a labelled
  continuation placeholder; all Sejm elections share exact-seat recording. No
  cutoff is introduced.
- **Open questions:** Later cabinets, later presidential elections, later Polish
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
  November triggers the approved election below. December creates a proportional
  111-seat Senate snapshot only for the National Assembly and resolves the
  approved presidential succession. Later cabinets remain unresearched.
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
  no new named ministers or ministry allocation. The December presidential
  succession preserves whichever government was selected.
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

### December 1922 presidential succession — approved playable slice

- **Timing:** After the completed November Sejm result and government choice,
  the next ordinary action advances to December. The presidential sequence then
  pre-empts ordinary events, resolves completely without another action or
  month advance, and returns to the deferred December event/action flow.
- **Constitution:** Use a separate semantic March-Constitution profile. The
  President is elected for seven years by the Sejm and Senate as the National
  Assembly; government acts require countersignature; ministers other than the
  prime minister are appointed on the prime minister's proposal. Do not reuse
  the inherited German `presidential_powers` model.
- **Assembly:** Freeze the current 444 Sejm MPs and derive exactly 111 Senate
  seats proportionally by largest remainder, with lexical party-ID tie breaks.
  This 555-member snapshot exists only for the presidential record and does not
  implement a general Senate, Senate election or second-chamber gameplay.
- **First election:** Present all five historical candidates. Force Ignacy
  Daszyński's PPS candidacy unless he has already left PPS through the Centrum
  crisis; active adviser-slot status is irrelevant and unchanged. Collapse the
  display to the final Narutowicz–Zamoyski ballot. Narutowicz wins 289–227, with
  29 blank ballots; display the historically supported party groupings.
- **Transfer and assassination:** Record Narutowicz's oath on 11 December and
  Piłsudski's formal transfer of authority on 14 December. Record the 16 December
  assassination. By explicit gameplay decision, omit Maciej Rataj's brief acting
  presidency from the playable state while documenting that omission as a
  simplification, not a historical claim.
- **PPS response:** Peaceful defence of the constitutional order and lawful
  accountability is the available historical path. Armed reprisals remain
  visible but unavailable. Record the choice without numerical support,
  relationship, faction, resource or militia effects.
- **Second election:** PPS does not run Daszyński; the alternative is visible
  but unavailable. Display the final Wojciechowski–Morawski ballot and party
  supporters. Wojciechowski wins 298–221 and becomes the authoritative current
  president.
- **State boundary:** `polish_presidency` stores constitution, current holder,
  Assembly, immutable elections, transitions and PPS decisions. The legacy
  `president` and `presidential_powers` remain untouched. German 1932 direct
  election and Hindenburg succession routes are guarded only while the Polish
  presidential system is active.
- **Deferred scope:** Variable presidential outcomes, later presidents,
  president-dependent cabinet changes, a permanent Senate and successor-cabinet
  chronology remain planned. The current cabinet and ten portfolios are preserved.
- **Evidence/verification:** `PRESIDENCY-1922-SEQUENCE` in the research register;
  `source/scenes/polish_presidential_sequence.scene.dry`, the routing and display
  helpers, `tests/polish-presidential-sequence.test.js`, and the extended browser
  smoke path.

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
| First-chapter direction | 2026-09-08 | Explicit decisions and remaining design synthesis distinguished in Current design direction and the Polish descriptive guide | PPS-CHAPTER1-DESIGN-2026-09 | Documentation only; implementation pending |
| Technical reference and electoral endpoint | 2026-09-09 (recorded) | Include concrete draft values as test proposals; the first legal parliamentary election after 1922 ends the chapter even if held early | PL-TECHNICAL-DRAFT-2026-09; PL-1922-LEGAL-PROCEDURES | Documentation only; no blanket approval of proposed balancing values or implementation |
| Simplification of minorities and presidential interface | 2026-09-09 (recorded) | Only Jewish/other-minority categories; Normal difficulty only; nominate a PPS presidential candidate or not, then show the final result | PL-DESIGN-SIMPLIFICATION-2026-09 | Documentation only; later economic choice resolved by 14 September approval |
| Strategic PPS party-card review | 2026-09-10 | Contextual directions; two Piłsudski cards; max 3 economic priorities / 2 organizational investments; three forms of power; separate Slavic/Jewish cards; evolutionary Milicja; faction expulsions; communist strike and USSR events | PL-PARTY-CARDS-REVIEW-2026-09-10 | Documentation only; numeric contracts remain proposals |
| Parliamentary-card review | 2026-09-10 | 12 families; combined formation; contextual coalition/budget/election access; government Piłsudski concessions; simplified government relations, Żyrardów and parliamentary strike response | PL-PARLIAMENT-CARDS-REVIEW-2026-09-10 | Documentation only; numeric contracts remain proposals |
| Government-card review and ministry consolidation | 2026-09-10 | 16 basic families + 2 crisis responses; remove Public Works / Communications ministry and move its card to Labour; nine ministries | PL-GOVERNMENT-CARDS-REVIEW-2026-09-10 | Documentation only; balance/profile completion and versioned migration remain future work |
| Advisor review and German comparison | 2026-09-10 | Concrete 1–2 actions per adviser; faction appointment effects; differentiated Piłsudczyks; 13 profiles/22 actions in the synthesized catalog | PL-ADVISORS-REVIEW-2026-09-10 | Documentation only; numeric parameters and historical profiles remain proposals/research |

| Normal first-chapter scenario | 2026-09-20 | Approved reviewed pressure calendar, autonomous cabinet profiles, conditional crises and three reference runs; technical 0.12 section 17.16 | PL-NORMAL-SCENARIO-2026-09-20 | Documentation only; numerical calibration and full simulations pending, M02 partially resolved |
