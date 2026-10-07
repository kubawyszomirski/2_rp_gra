# State Variable Inventory

## Current state — reference 0.66, 7 October 2026

This section is the only current summary in this file. This inventory lists the important game-state records; the target domains are defined in technical section 2.4. Everything under "Archive of entries" below is kept unchanged for traceability. It is history, not an implementation instruction; where it differs from the technical reference, the technical reference wins.

- **Canonical specification:** `docs/POLISH_TECHNICAL_REFERENCE.md`, chapters 1–22 (reference 0.66); its chapter 23 holds the decision history.
- **Player-facing description:** `docs/POLISH_DESCRIPTIVE_GUIDE.md`.
- **Audit:** every item of `docs/POLISH_MECHANICS_AUDIT.md` (M01–M19) is closed in documentation; stage 8 measured balance and behaviour in full automated campaigns (`analysis/stage8-campaigns/REPORT.md`).
- **Card catalogue for coding:** `docs/POLISH_CARD_CATALOGUE.md` (reference 0.32) has one table for each of its 69 entries (card families, agenda actions and events): access, options, time and resource cost, effects, end state and cooldown. It creates no rules; where it differs from the technical reference, the reference wins.
- **Two Treasury cards and ministry badges (Z, K, 0.66):** the Treasury card is split into "Taxes" (`polish_gov_finance`: progressive or wealth tax, indirect taxes, a broader base, customs duties) and "Loan, Savings and Emission" (`polish_gov_finance_funding`: domestic loan, administrative savings, the benefit cut, emission, better collection), both on the rules of 11.9 (`government.finance_package`); every government card carries the name of its ministry as a badge in the hand and a first line on its page (`PolishProjects.CARD_SCENES`, `ministryBadge`, `ministryLine`; `.pl-ministry-badge`) (technical 17.11 and 23.39; chapter 35 of the plan). `npm test` 485 of 485.
- **Sidebar MPs, "Obronność" and the Committee column (Z, K, 0.65):** the user's three notes of 7 October 2026 (technical 20.1 and 23.38; chapter 34 of the plan). The Sejm lines of the Politics tab give only the number of MPs (`[party]_sejm_seats_display`, with the Polish plural), while the parliament legend of the Library keeps the share of seats; the Polish name of the Defense tab is "Obronność"; the cards of the Central Executive Committee stand in a column to the right of the decks, one under another, when the deck board is at least 690 px wide (`#pl-board`, a container query; a window of about 1190 px), and under the decks otherwise (`window.displayPinnedCards` in `out/html/game.js`). No game rule changes. `npm test` 484 of 484.
- **Two cards for the relation to the government (Z, K, 0.64):** "Support for the Government" (Parliament deck) only while PPS tolerates the cabinet from outside (`supportCardAvailable`); "Coalition Affairs" (`polish_coalition_affairs`, Government deck, action `government.coalition_affairs`) only while PPS sits in it (`coalitionCardAvailable`), with the same options worded for a coalition and a new concession to the partners: the tension of each PPS coalition agreement −20, the Left of PPS +5 dissent (`coalitionConcession`). Both share the rhythm of half a year or an act of the cabinet against PPS (technical 9.8 and 23.37; chapter 33 of the plan). `npm test` 484 of 484.
- **Page look (Z, K, 0.63):** on 7 October 2026 the user asked for a wider play field and sidebar, more readable statistics and better cards, with simple means and without the recognisable Claude style (technical 20.1 and 23.36; chapter 32 of the plan). From 900 px the sidebar (18 rem, 21 rem from 1100 px) and the play field (up to 54 rem) stand side by side in one centred grid under a masthead, and the sidebar stays in view while the page scrolls; each sidebar fact is a ledger line — label, dotted leader, value at the right, a long value under its label (`ledgerRows` in `out/html/game.js`); the polls by social group are one table, a row per party and a column per group (`status.scene.dry`); a card is a print on a board with a thin frame, an empty place says so, and the timed-card badge is a red stamp without the hourglass; the page looks like a print of the time (paper, black and red ink, rules, small capitals), with no new fonts. No game rule changes. `npm test` 483 of 483.
- **Routing that survives a display error (Z, K, 0.62):** on 7 October 2026 the user played a game without the Sejm election, the presidency, the assassination of Narutowicz, the cult of Niewiadomski and the cabinet crisis of 1922 (technical 20.1 and 23.35; chapter 31 of the plan). The routing scene `polish_opening_state` computed the route only after about 300 lines of displays, so an exception in any display function (for example a stale cached script next to newer scenes) left the route empty and the game went on without them; 0.60 and 0.61 themselves showed all of them in full automated campaigns. Decisions 1A, 2A, 3A: the routing flags come first and six display parts are guarded one by one (a failure is logged, never silent); the page shows one notice per load asking for a reload without the cache; `tools/play/stable.sh` builds the last commit in a separate copy and serves it on port 8001. Rules unchanged; `npm test` 483 of 483.
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
- **Polish language version (Z, K, 0.50):** on 4 October 2026 the user asked for a Polish version of the game with a language switch and approved decisions 1A–7A (technical 20.1 and 23.23; chapter 19 of the plan). The game has English (the default) and Polish; the player switches in Options or with the link in the page header, also during a game. The browser keeps the choice (`localStorage` key `pps_language`), not the save, so the same save loads in both languages. Scene texts are translated line by line in `source/i18n/pl/` and built into `out/html/game_pl.json`; rule texts have a Polish twin (`L(en, pl)`). Texts stored in `S` stay English and are translated when shown (`PolishRules.storedText`), so both languages play the same game: the test "Ta sama rozgrywka w obu językach" plays all 13 strategies to the end of the chapter in both languages and requires an identical state and no English line on Polish screens. Limitations: values computed before a mid-game switch keep the old language until the next page; the Credits translate only their headings; the game title in `info.dry` stays English because it keys saves and settings; unreachable German scenes stay untranslated. Dependencies and schema 8 unchanged; `npm test` 444 of 444. New quality `pps_government_position_en`: the English form of the PPS position, set by `polish_opening_state` and read by the chapter report (`S.chapter.report.state.government.pps_position`), so the report keeps English in both languages.
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
- **State records changed in stage 8 (K, 0.49, schema 8 unchanged):** `S.scenario.inputs` gains `chjeno_piast_1923`, `piast_split_1923` and `grabski_resignation_1925`; `S.politics.episodes` gains the records `competing_1923` (kind `competing_offer`), `piast_split_1923` (kind `support_withdrawn`, with `status` and `restored_at`) and `grabski_resignation_1925` (kind `cabinet_resignation`, with `cabinet_id` and `cause`); `S.history.reasons` records `support_withdrawn` and `scenario_resignation`; an agreement of `S.agreements` can name `executor: 'cabinet'` (the military compromise carried out by the cabinet); `S.coup.pressure` starts at 0; the chapter report keeps `constitution.speaker`, the Marshal of the sitting Sejm. No record was removed.
- **State records added in stage 7 (K, 0.48, schema 8):** `S.politics` (democracy, `parliament_authority` from the `institutional_log`, violence and its episodes, `cases` and `restrictions` with a legal profile, speeches, democracy effects, `due` event keys and history), `S.security` (`profile_id`, `forces` with loyalty, commitment and losses, logistics, `police`, `army_control` projects, `threats`, the `known` intervals of the force assessment and `assessments`), `S.coup` (pressure and its `impulses`, `phase`, `attempt_id`, stance, commitments, round, F9 answer, settlement, outcome, the PPS contribution, concessions and `next_attempt_available_at`), `S.actors.pilsudski` (`agreement_id`, the cases already relieved, history) and `S.scenario.inputs` (`dispute_1922`, `military_case`, `niewiadomski_cult`). The legacy `coup_progress` and `pro_republic` are no longer written in the Polish game.
- **State records added in stage 6 (K, 0.47, schema 7):** `S.strikes` (`seq`; `records` — strikes and wage cases with branches, demands, threshold, status, participants and coverage, cost paid, disruption, rounds with recorded draws, the open offer, settlements with clauses and executors, the authorities' answer, clashes, protection, steps, the communist cooperation and the outcome; `due` event keys; `wage_watch`; the month's `inputs` for the economy; `pending_effects` for stage 7) and `S.enterprises` (`seq`; `records` of synthetic plants with branch, cause, owner, status, capacity, derogation, rescue, public act, representation and their own `pending_effects`; `watch` of the episodes). The branches of `S.unions` gain the lines `strike` and `agreed_end` in `alignment`, `dissent_causes` and collective agreements in `agreements`; a toleration agreement in `S.agreements` can carry a `term` with its review.
- **State records added in stage 5 (K, 0.46, schema 6):** `S.party_orgs` (`profile_id`, `cash`, `dues`, `apparatus` with `level`, `member_index`, `worker_support0` and `union_reach0`, `press` with `reach`, `credibility`, `format`, `popular_adopted`, `campaigns`, `restrictions`, `unpaid_months` and `cases`, `tur` with `level`, `cadres`, `available_from`, `active_build`, `active_course`, `prepared_campaigns` and `completed_courses`, `cooperatives.projects`, `arrears`, `last_ledger`, `mirror_base`); `S.militia` (`strength`, `militancy`, `stage`, `militarized`, `militarized_once`, `fatigue`, `arrears`, `assignments`, `banned`, `repressed`, `dissent`, `alignment`, `unpaid_last`); `S.unions` (three branches `industry`, `rail`, `farm_labour`, each with `reach`, `readiness`, `trust`, `autonomy`, `dissent`, `fatigue`, `fund`, `alignment`, `agreements`, `strike`); `S.faction_cases` (`list` of cases with the faction, status, demand, postponement and resolution, `manifests` of departures, `seq`, `due_case_id`); `S.society.cells` (54 cells with `class_id`, `identity_id`, `employment`, `settlement`, `mass`, `propensity`, `turnout_base`, `turnout_bonus`, `trust_pps`, `base_reach_pps`, `campaigns`) with `parties`, `seed_rows`, `cell_profile`, `seed_method`, `class_shares` and `mirror_rows`; `S.actors.pps` (`factions` with `strength`, `dissent`, `seats` and `reactions`, `strategy`, `strategy_history`, `reactions`, `program`); `S.actors.communist_cooperation` (`trial_records`, `rules`, `rules_agreed`, `pps_internal_acceptance`, `active_agreement`); `S.actors.bund` (`trust`, `joint_actions`); `S.actors.relations.pilsudski` (60); `S.advisors.effects`; and the PPS club's `faction_seats` in `S.parliament.clubs`. `Q.polish_party_rules = 1` marks the Polish party. `Q.resources`, `Q.dues`, `Q.pps_militia_*`, `Q.<faction>_strength`, `Q.<faction>_dissent`, `Q.dissent` and the class rows `Q.<class>_<party>` are mirrors. Displays: the `pl_party_*` fields and the `pl_<card>_<option>_why` reasons of blocked options.
- **State records added in stage 4 (K, 0.45, schema 5):** `S.economy` (`profile_id`, `currency_regime`, `inflation_m`, `real_wage`, `output`, `credit`, `market_unemployment`, `unemployment`, `budget_base`, `tax_level`, `tax_incidence`, `policies`, `budget`, `business_pressure`, `business_state`, `warning_since`, `calm_months`, `business_cases`, `shocks`, `history` with one reading a month, `last_growth`, `pending_package`, `packages`, `package_revision`); `S.society` (`agrarian_pressure`, `living_conditions_last` for the seven class rows, `rural_improvements`); `S.parliament.laws` (each law with its ballots, dated Senate steps and status); `S.chapter.unemployment_bill` (the record of bill D); project records in `S.projects` (type, variant, status, preparation, `authorized`, build and upkeep charges in B, `effects_applied`, `pending_effects`); and `Q.polish_presidency.constitution.reforms` (three reforms, all false at the start; `S.parliament.constructive_vonc` and `Q.constructive_vonc` are its adapters). `Q.polish_economy_system = 1` marks a Polish economy. `Q.budget`, `Q.inflation`, `Q.economic_growth` and `Q.pl_unemployment` are written only from `S.economy`; `Q.unemployed` stays 3. Displays: the `pl_eco_*` fields, `pl_economy_notices` and the `pl_<card>_<option>_why` reasons of blocked options.
- **State records added in stage 3 (K, 0.44, schema 4):** `S.actors` (`relations`, `mirror_base`, `pps.credibility`, `pps.applied`, `kpp_channel`); `S.agreements` (by ID: `kind`, `parties`, `cabinet_id`, `status`, `obligations`, `support_scope`, `tension`, `warning_issued`, `ultimatum`, `extensions_used`, `responsibility`, `response`, `history`); `S.cabinet` (`id`, `pm`, `pm_name`, `party`, `configuration_id`, `status`, `pps_mode`, nine `portfolios`, `partner_ids`, `supporter_ids`, `appointment_basis`, `programme`, `support_seats`, `majority`, `agreement_ids`, `accepted_postulates`, `dismissal_motion`, `pending_threat`, `pps_threat_discounted`, `fell_at`); `S.negotiation` (a cabinet offer being prepared) and `S.cabinet_crisis` (`status` open or impasse, `failed_proposals`, `snapshot`); `S.history.negotiations` and `S.history.cabinets`; `S.parliament.alliances`; cooldowns `outreach.<party>` and `support.<cabinet>`. The inherited government fields (`spd_in_government`, `pps_in_government`, `<party>_in_government`, `chancellor`, `chancellor_party`, `<portfolio>_minister_party`, `pps_external_toleration`, `minorities_toleration`, `in_minority_government`, `polish_cabinet_id`, `polish_opening_government_active`) are mirrors written from `S.cabinet`; `public_works_minister_party` stays empty and `coalition_dissent` zero. `Q.polish_portfolios` has nine keys. Display and routing fields: `pl_form_*`, `pl_fres_*`, `pl_sup_*`, `pl_resp_*`, `pl_list_*`, `pl_cabinet_support_display`, `pl_cabinet_crisis_display`, `pl_agreement_tension_display`, `pl_agreement_notices`, `pl_last_dismissal_display`, `pl_last_dismissal_passed`, `pl_joint_lists_display`, `polish_parliament_actions_available` and the route value `cabinet` of `pl_route`.
- **State records added in stage 2 (K, 0.43, schema 3):** `S.parliament` (`chamber_id`, `clubs`, `transfers`, `replacements`, `speaker`, `speaker_elections`, `term`, `previous_term`, `next_election`), `S.senate` (`status`, `total`, `club_seats`, `records`, `method`, `result_id`) and `S.ballots`; `S.chapter` now receives `status=ended`, the reason, the trigger and the report. Sejm results gain `sequence_after_opening`, `legal_basis`, `status`, `ballot_date` and `senate_result_id`. Presidential runs in `Q.polish_presidency.elections` gain the counted rounds, the preference snapshot and `tie_break`; unresolved runs go to `failed_elections`. Display and routing fields written by `polish_opening_state`: `pl_route`, `pl_next_election_display`, `pl_speaker_display`, `pl_senate_display`, `pl_chapter_ended`, `polish_speaker_due` and `polish_speaker_in_progress`; `next_election_year`, `next_election_month` and `next_election_time` only mirror `S.parliament.next_election`.
- **State records added in stage 1 (K, 0.42, schema 2):** `S.turn.discard_used`, `S.turn.card_view` (what an opened card changed, for closing it), `S.turn.draw_serial`, `S.events.serial` and the `EventRun` in `S.events.active`; `S.cooldowns.advisor` holds the adviser date. Display fields written by the rules module: `Q.advisor_action_timer` (remaining months), `Q.pl_hand_card_1`–`3` and `Q.pl_hand_count`; `Q.pl_next_event` names the event the router enters.
- **New state records (K, 0.41):** `Q.S` holds the state tree S of technical 2.4 and is written only by the rules module; stage 0 creates `meta`, `turn`, `advisors`, `cooldowns`, `events`, `projects`, `rng`, `history` (`months`, `actions`, `reasons`), `chapter` and `scenario`. `Q.polish_save_incompatible` is set to 1 only for a save that fails the schema check; compatible games never have it.
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

## Membership state — reference 0.30, M18

Target contract, not implemented state. Canonical: technical 13.1.

| Record / derived value | Contract |
|---|---|
| `apparatus.member_index` | 0–150, start 100; moves monthly toward the target; cut at once by departures |
| Membership target | Derived each month from PPS worker support, average union reach, their opening values and the dues level |
| Apparatus income per level | 0.15 R × member_index/100 (was 0.20) |

Diagnostics: `analysis/m18-membership-apparatus/`. Documentation only.

## Late-advisor and KPP contact state — reference 0.29, M17

Target contract, not implemented state. Canonical: technical 9.5 and 10.4.3.

| Record / derived value | Contract |
|---|---|
| Advisor availability for A12, A13 | `continuation`; not offered in chapter 1 |
| `S.actors.communist_cooperation.contact_open` | Can become true from relation 10; enables ordinary 8.1 conversations with the KPP |
| KPP relation (`Q.kpp_relation`) | Start 10 (K); ordinary conversations +4 after the channel opens |

Diagnostics: `analysis/m17-late-advisors/`. Documentation only.

## Office-election state — reference 0.28, M06

Target contract, not implemented state. Canonical: technical 7.3 and 7.5.

| Record / derived value | Contract |
|---|---|
| `PresidentialElectionRun.status` / speaker `EventRun` | `elected` normally; `no_election` only through the safety net, with the acting holder and a retry date next month |
| `tie_break` | Unchanged from 0.18: `lot_50_50` with the saved roll, only for an exact tie of two finalists |
| Election profile | At least two valid candidacies and the acting holder; validated before the vote |

Diagnostics: `analysis/m06-office-elections/`. Documentation only.

## Faction split state — reference 0.27, M16

Target contract, not implemented state. Canonical: technical 10.2.

| Record / derived value | Contract |
|---|---|
| PPS club `faction_seats` in `S.parliament.clubs` | Integer MPs per faction; set after each election by largest remainders; changed only by real transfers |
| `departure_manifest` | Share 0.40 (split) or 0.25 (purge), recipient of lost voters, named organisations and advisors; applied once |
| Faction strength and dissent | Recomputed once after departure: strength ×0.6 then normalise; remaining dissent −20 (split) or −15 (purge) |

Diagnostics: `analysis/m16-split-recalculation/`. Documentation only.

## Milicja and AS values — reference 0.26, M15

Target contract, not implemented state. Canonical: technical 13.3–13.4. No
new stored field.

| Record / derived value | Contract |
|---|---|
| `pps_militia_stage` | 1 or 2; stage 2 (AS) gives `effectiveCompliance = min(1, compliance + 0.15)` |
| `S.militia.assignments` | Stage 1: one concurrent matter; stage 2: at most three, filled by the engine in event order up to 4 F each |

Diagnostics: `analysis/m15-as-benefit/`. Documentation only.

## Communist cooperation state — reference 0.25, M13

Target contract, not implemented state. Canonical: technical 9.5–9.6.

| Record / derived value | Contract |
|---|---|
| `S.actors.communist_cooperation.pps_internal_acceptance` | Faction-weighted support; raised by the `party.unity` compromise (+15 per faction); read only for PPS effects: Centre dissent and the durable-front gate |
| Event profile `partner_goal` | `limited`, `broad` or `structural`; test value `broad`; historical values TBD |
| `partnerCompliance` | Derived from the KPP relation and the goal fit; one saved roll per strike agreement |

Diagnostics: `analysis/m13-communist-discipline/`. Documentation only.

## Strike settlement values — reference 0.24, M12

Target contract, not implemented state. Canonical: technical 14.4 and 17.4.
No new stored field.

| Derived value | Contract |
|---|---|
| `strikeContinuationCost` | `max(100×(1−fundCoverage), fatigue)` from the existing `UnionBranch.fund` and `fatigue`; not the coup's `costOfContinuing` (16.6) |
| `governmentFragility` | From `S.cabinet` status, the seats of parties with responsibility `r>0` (5.6) and the highest `Agreement.tension` of the cabinet; no longer reads `parliament_authority` |

Diagnostics: `analysis/m12-strike-settlement/`. Documentation only.

## Threat state — reference 0.23, M11

Target contract, not implemented state. Canonical: technical 9.8.

| Record / derived value | Contract |
|---|---|
| `S.cabinet.pps_threat_discounted` | Boolean, false for every new cabinet; set when PPS backs down from a refused threat; makes later `bargain` use `need=0` |
| PPS credibility (reputation) | −5 once per negotiation ID for a withdrawn threat, as for a new culpable breach (17.4) |
| Party relations | −3 for each party accepting an offer made under threat, once per offer |

Diagnostics: `analysis/m11-threat-persuasion/`. Documentation only.

## Authority and democracy state — reference 0.22, M10

Target contract, not implemented state. Canonical: technical 15.2, 15.3 and
16.1.

| Record / derived value | Contract |
|---|---|
| `S.politics.institutional_log` | `InstitutionalEntry[]` with `id, t, kind, source_id`; kinds `law, resolution, failure, gap, breach, stance_defense, stance_criticism`; one entry per source ID; counts while `t > time−12` |
| `S.politics.parliament_authority` | Last read of the 15.2 formula from the log; no other writer; rebuilt on load |
| `S.politics.democracy` | Stored state; monthly equation with reference point 53 plus one-off effects; the two event terms count each case ID and `restriction_id` once |
| Democracy pressure term | Derived each month from democracy at the start of the period; not stored separately |
| Effective loyalty | Derived from stored `Force.loyalty_*` and current democracy; never written back; the F5 roll reads democracy at attempt declaration |
| Coup report | Democracy at attempt declaration and the resulting loyalty shift |

Inherited `pro_republic`, still written by the current advisor scenes, has no
role in the Polish contract. Diagnostics: `analysis/m10-authority-democracy/`.
Documentation only.

## Living-conditions state — reference 0.21, M09

Target contract, not implemented state. Canonical: technical 5.6.

| Record / derived value | Contract |
|---|---|
| `S.society.living_conditions_last` | `classId -> number` for `workers`, `new_middle`, `old_middle`, `rural`, `bourgeois_landowners`; the last index read; initialised from the opening state (100 in the synthetic profile) |
| `conditions[class]` | Derived each month after the economy; never an independent source |
| Responsibility `r[party]` | Derived from `S.cabinet` and `S.agreements` in the same snapshot: 1 / 0.5 / 0 |
| History record | Per class `change`, `flowPP` and pp moved per party, reason `living_conditions` |

Legacy `Q.<class>_qol` (source comment: currently unused) stay unwritten; the
M09 index deliberately excludes benefits. Diagnostics:
`analysis/m09-living-conditions/`. Documentation only.

## Coup contract state — reference 0.20, M08

Target contract, not implemented state. Canonical: technical 16.8.

| Record / derived value | Contract |
|---|---|
| `S.coup` additions | `next_attempt_available_at` (initial 1), `f9 {completed_rounds, offer_id, response}`, `settlement {offer_id, round, clauses}`, `pps_contribution` (`decisive/accelerating/none/adverse`), `concessions_to_pps` (list) |
| `S.coup.phase` | `dormant → political_crisis → attempt_declared → pps_stance → organization_commitment → execution_and_transport → resolved`; crisis at pressure ≥55, call-off at executing stand-down or pressure <40 sets retry t+3 |
| `credibleStandDownAgreement` | Derived from `S.actors.pilsudski.agreement_id`: active, execution started, no overdue clause/open breach, before `review_at` (start+6) or premier variant with an active Piłsudski cabinet; same value as 16.7 `credibleCompromiseOperating` |
| `operationalWindow` | Derived: scenario window (Normal t≥51) and at least one phase-0 group leaning to Piłsudski with readiness ≥0.50 |
| `Force.rail_delay_cap` | 0–2 alternative-route limit; synthetic remote reserve 2, other groups 0 |
| Synthetic force profile | `synthetic_test_v2`: near reserve 0.30/0.50/0.20, remote 0.50/0.25/0.25 (legal/Piłsudski/neutral); expected capacity 38.1 |
| `S.security.known` | ±30 pp loyalty interval with a saved centre offset per group; `security.assess` −10 pp to 5 pp |
| Rolls | `coup_<attempt_id>:<force_id>:allegiance` after F5; `<force_id>:known` for estimates; counterfactual replay reuses saved rolls |
| Report | Outcome, offer, F9 record, round log (forces, arrivals, delays, streaks), losses, rail fund, militia, rolls, contribution, concessions, faction/relation effects, `continuation_requirements` |

Trust in settlement reads democracy directly; no guarantor reputation field is
used by the coup. Supersedes the 0.13 phase-2 floor below and the 0.10 F9 gate
of positive participation. Diagnostics: `analysis/m08-coup-profile/`. Scenario
metadata remains version 5; documentation only.

## M07 project payloads and readers — reference 0.19

No new global economy, autonomy or workers-council meter. Existing Project,
Agreement, EventRun, actor programme and force records own the state:

| Record | Required payload / existing reader |
|---|---|
| Orders Project/Agreement | Branch, beneficiaries, supplier/commissioner, deliverable, funding and fixed 3-month contract from started_at; monthly coverage feeds activeOutputShock once; single active package |
| Police Project | Legal scope, 3-month progress, effects_applied; existing police.command and lawful_compliance each +10 once to 100; chapter completion from project history |
| Redress EventRun/Project | case_id, restriction_id, competent authority, legal findings and final result; affects only that restriction |
| Broad safeguards | Existing democratic_guarantees project ID; no parallel judicial-reform bonus |
| Military Project.policy_choices | position_id, candidate_id, authorization, force_ids and concrete conflict reference; applied nomination IDs and dated readiness modifier, bounded normalized loyalty transfer |
| Worker representation policy_choices | worker_representation=consultative/decision_rights, enterprise_ids, worker_actor_id, beneficiaries, covered_decisions and authority/owner Agreement; one scope record for upgrades, consultation/consent read before later enterprise decisions |
| Autonomy policy_choices | territory_id, recipient_authority_id, delegated_capabilities, law/Agreement references and beneficiaries; later legal authority checks read delegation |
| Programme | Existing form_of_power/slavic_autonomy stay distinct from enacted reforms; history marks the first council-line influence bonus, without a new faction |

See technical 17.12.1–7. Unfinished reforms do not grant finished rights;
repeated entry/load does not duplicate effect IDs. Existing cadre-free project
execution and two minority aggregates remain. Proposed schemas only; no live
state migration or change to scenario version 5.

## Office-election tie record — reference 0.18

`PresidentialElectionRun.tie_break` is null or
`{method:'lot_50_50',finalist_ids,roll_id,winner_id}`; speaker elections use the
same data in existing `EventRun.payload`. Use `S.rng.rolls` keyed by election
run ID and `:final_tie`; sorted finalist IDs map draws <0.5 / ≥0.5 to first/second.
Persist the result with the office outcome; load/menu return never rerolls.
No new meter or change to vote totals. Proposed documentation, not live state.

## Current D record — reference 0.17, M05

`chapter.unemployment_bill` adds `in_procedure` and `expired` to the earlier
status set: `pending` alone permits D2, `in_procedure` runs dates automatically,
`enacted` means entry into force. Record submitted/final variants, `ballot_ids`,
`submitted_at`, `senate_notice_due`, `senate_return_due`, `effective_at`,
`next_step`, permitted compromise and applied action/stage IDs. Dates are
calendar dates; project start/first-effect fields still identify settlements.

The shared Project owns `sponsor=pps`, `executor=labor_administration`,
`financing_policy_ids`/general-budget funding, `responsibility` (PPS share 0.40)
and the existing one-time effect record. No second benefit or reward ledger.
No phase reopens D2 after commitment; government entry suspends only pending
D2. Recorded legal duties survive cabinet changes. Technical 5.4 / 17.15;
these are documentation contracts, not implemented fields. Scenario remains 5.

## Final M02 state contract — reference 0.16, 22 September 2026

`S.scenario.version=5` supersedes version 4. No new meter or card. Existing
appointment history, predecessor programme profile and open army EventRun
supply the return condition. Preserve the single applied-effect record.
`chjeno1926Impulse` / `cabinet.chjeno_return_1926` retain their IDs, but the
suffix does not impose a year or May gate. No retroactive replay after loading.

Welfare consent reads the common score, funding and hard conditions; it no
longer reads a second relationship-minimum gate. Existing rates and thresholds
are unchanged. Dates of concrete military disputes remain provisional test
inputs (`TBD — historical research required`). Technical 17.16.11 and
[final diagnostic](analysis/m02-robustness/REPORT.md). Older dated entries below
record previous contracts; M02 is ready for implementation.

## Paired state diagnostics — 22 September 2026

M02 step 4 introduces no new game variable or schema version. Scenario version
4 / reference 0.15 remain current. The separate diagnostic records actual
programme authorization, preparation, progress, first effect and upkeep;
accepted/rejected offers and votes; obligations and PPS delivery reputation;
monthly budgets, organizational funds, factions and pressure. No failed offer
receives an operating programme or a later delivery reward.

Shared random keys identify a wage-offer round, clash round or force decision;
branch timing does not shift the tape. Three alternative election outcomes
are explicit inputs, not changing live polling. Next-election results and full
hand availability are not simulated. See [scope and outputs](analysis/m02-robustness/REPORT.md).

## Current pressure state contract — reference 0.15, 22 September 2026

`S.scenario.version=4` supersedes version 3 below. Keep existing pressure,
EventRun, Agreement and history records; no extra global meter. A public
military episode records its concrete demand, army-case ID, formation-crisis
ID, officer backing and applied-effect ID in the existing event payload.
Related public statements share one effect ID. Monthly settlement IDs prevent
repeated +2/+3 accrual; event impulses are already applied and must not be
added again by monthly settlement. `pressureAfterEvents` in 15.3 is explanatory
notation for current pressure, not another saved balance.

An executed agreement resolves only the covered case; actual breach can reopen
it, expiry alone cannot. Preserve processed effects and `last_settled_time`
on loading/migration; set attempt-active before queuing F. Never replay new
historical impulses into an old save to force a May threshold. Technical 4.2,
15.3, 16.7, 17.16.9; [checks](analysis/m02-pressure-calibration/REPORT.md).

## Current M02 chain state — reference 0.14

`S.scenario.version=3` supersedes version 2 below. Technical 17.16.8 keeps the
existing EventRun/Negotiation/Agreement records: cause, first/revised offer IDs,
refusal reason, next review, terminal result and evaluated candidate batch.
Store the material support/programme snapshot so an unchanged month or reload
does not repeat formation. Preserve dissenting MPs inside the existing party's
seat total, fiscal instrument dates and inherited programmes. No new global
crisis meter. Migration preserves processed events; it does not replay shocks.

M02 step 1 (21 IX): technical 8.9 and
[the negotiation report](analysis/m02-negotiations/REPORT.md) supply explicit
P test inputs for existing actor/offer records, not new global variables.
Keep candidate relations separate from PPS-party relations; substitute the
actual obligation ledger for controlled credibility 50 in integrated runs.
Portfolio ownership remains unique. Missing profiles must not imply consent.

## Current M02 state contract — reference 0.13, 21 September 2026

Supersedes the corresponding earlier target rows, not the German code inventory.
No additional global political or economic meter. Source:
`PL-M02-REVISION-2026-09-21`; technical 11.4, 14.5, 15.3, 16.6, 17.16.4.

| Record / derived value | Contract |
|---|---|
| `S.scenario.version` | 2 for the corrected `normal_chapter1_v1` manifest; do not replay old shocks on migration |
| Wage recovery | Derived from starting credit >=45, non-rising monthly inflation <=5; at most 3 index points up to 100; actual negotiated raises are separate |
| Wage case | Limited access at grievance >=50 or unresolved rejected demand; political resignation goal uses the same case; broader mobilization still requires 60 |
| Settlement record | Once-only recipient grievance relief 4 after first full delivered due benefit; no reward for signature or repeated payments |
| Military cases and delivered obligation IDs | Derive total +2/M for any open military conflict and at most -2/M for newly delivered civil obligations; retain one-off military concessions |
| Essential-offer `EventRun.payload` | `cabinet_id,original_offer_id,revised_offer_id,status,next_review_at`; initial/revision_due/accepted/resigned/closed, one amendment |
| Broad-cabinet agreement | Named full benefit, financing, `review_at=formed_at+5`, review completed once; proposed cut changes no expenditure before legal acceptance |
| Coup phase | Synthetic objective requires phase >=2 in addition to two consecutive rounds of >1.20 superiority and actual objective access; no additional player menu |

Focused checks and limits: [revision report](analysis/m02-revision-13/REPORT.md).

## Normal scenario state — reference 0.12, 20 September 2026

Target contract, not implemented state. Canonical:
[technical 17.16](docs/POLISH_TECHNICAL_REFERENCE.md#1716-scenariusz-normalny--normal_chapter1_v1).

| State / record | Initialization and readers |
|---|---|
| `S.scenario` | `{profile_id:"normal_chapter1_v1", version:1, npc_reviewed_time:null}`; monthly scheduler, save and report |
| `S.economy.shocks` | Normal loads dated records from 17.16.2; empty only in explicitly isolated tests. Fields: id/channel/value/starts_at/ends_at/condition/source_ref |
| Shock lifetime | Half-open month intervals; null end means no calendar expiry. Marka/stabilizing condition; only one marka period at a time |
| `ActionTxn.source=cabinet` | Autonomous initiative, consumes_month=false; one review per t, including across reload or same-month replacement of the premier |
| Wage/rail dispute `EventRun.payload` | Addressed group, demand and response/deadline, military order if any, unique effect IDs; no duplicate +8/+10 on reopening |
| Historical event context | Actual candidate, accepted offer, resignation/vote or unfulfilled agreement; historical date alone cannot replace the cabinet |
| `operationalWindow` | Derived; Normal false before spring 1926 (P: 1 March), then actual forces/logistics required; not automatically true for every later month |
| End/report | Preserve scenario version, financing, policies, disputes and reasons; first resolved coup or first legal election after 1922 |

No new political currency, general crisis meter or public-action budget. New
social effects target existing populations, with branch exposure weighted into
aggregate cells once. NPC initiative never debits PPS resources or repeats the
PPS minister's action. Updated game saves will need the manifest/version; old
saves cannot silently acquire elapsed shocks as a second retroactive charge.
Source: `PL-NORMAL-SCENARIO-2026-09-20`. M02 calibration remains open in part.

## Approved simple economy — reference 0.11, 14 September 2026

This is the current **target**, superseding older Polish ledger proposals. The
German/current-code inventory below remains evidence of existing behavior.
Canonical rules: [technical sections 11–12](docs/POLISH_TECHNICAL_REFERENCE.md#11-gospodarka-i-finanse-pełny-kontrakt-miesięczny).

| Target state | Initial value / reader |
|---|---|
| `S.economy.inflation_m`, `real_wage`, `output`, `credit` | P: 4%, 100, 100, 55; monthly formulas, social conditions and budget |
| `market_unemployment`, derived `unemployment` | 3%; count public employment once against private unemployment |
| `S.society.agrarian_pressure` | 45; credit, completed reforms and rural conditions |
| `budget_base`, `tax_level`, derived `budget` | 2 B, 0, +2 B; a fiscal-space score, never accumulated cash |
| `policies` and `shocks` | Empty in isolated tests; dated modifiers with unique IDs and conditions |
| `business_pressure`, `business_state`, `warning_since`, `calm_months` | 10, quiet, null, 0; one warning/active-reaction process |
| `Project.build_budget_B`, `upkeep_budget_B` | Mutually exclusive phase charges, scaled once by scope |
| `Project.preparation`, `status`, `progress` | 0/100; idea/prepared/executing/operating/paused/completed/repealed; no authorized/funded player stages |
| `Project.financing_policy_ids`, derived `coverage` | References to accepted instruments; 1/0.5/0 from common fiscal conditions and legal execution |

Remove proposed state-treasury cash/debt/arrears/reservations and sectoral
business ledgers, not party R balances, union funds or organizational arrears.
A loan is one dated +3 B/6 M then −1 B/12 M instrument, with no overlap until
its service period ends (P). Party upkeep remains an actual deduction of R.
Do not migrate old B amounts by renaming fields; this scale is different.
`ppsCanChoose` and `stateCanExecute` separate player access from state duty.
D executes through Labour without a PPS minister; advisors replace one step;
TUR supplies full preparation and one month of execution savings, once.
Numbers are draft balance. Source: `PL-ECONOMY-SIMPLIFICATION-2026-09-14`.

## D–G state contract — reference 0.10, 11 September 2026

These are proposed records, not new implemented variables. See technical 17.15.

| Record | Contract |
|---|---|
| `chapter.unemployment_bill` | Updated by 0.17: one initiative, with `in_procedure` and `expired` in addition to the former statuses. Variants, project/ballot IDs, daily deadlines and applied stage IDs; see current D record above. Government entry suspends only pending D2, not committed legal processing |
| Unemployment Project | Full or fixed reduced-benefit profile; one shared execution record with Labour policy, no double payment/effect. Budget and legal execution remain required; no staff allocation or additional D menus |
| Faction E3 case | Concrete demand, faction portion and previewed departure manifest; completed case cannot retrigger solely from the same dissent value |
| `departure_manifest.advisor_ids` | Default empty for E3; only a named, previewed exception may remove an advisor with the group. Not automatic removal of everyone affiliated with that faction |
| E6 event | Keyed to actual strike and accepted settlement; two responses, once per settlement, no duplicate communist-refusal event |
| Coup stance/commitment | Existing `mediate` means neutral; permits none or protective Milicja only. Side, capacity and compliance derive task/scale, without tactical menus |
| Coup F9 | Actual positive organizational participation plus a feasible offer; at most once per attempt. Political support alone does not qualify |
| Final report/save | F10+F11 or G7 is the start of G8, one report; loading restores state and applied IDs without rerolling or reapplying costs |

Faction warning thresholds 30/45 are panel information; proposed 60 opens
E3 only with an actual demand. The old faction t+2 ultimatum scene chain is
superseded; coalition agreement deadlines remain separate. Removed D/E/F/G
scenes must not be reintroduced merely because the underlying state persists.

## C-scene contract — reference 0.9, 11 September 2026

| Existing record | Simplified successor |
|---|---|
| Cabinet Negotiation | One editable scene, one submitted offer and result; no interactive round field or counteroffer response |
| Electoral-list agreement | Fixed profile program/candidate allocation, one alliance choice and acceptance; no second terms phase |
| Legislative record | Automatic votes and Senate response from program/agreements; legal thresholds retained |
| S.cabinet_crisis | Still records real government fall and successor; no longer unlocks early-election action |
| canInitiateEarlyElection | Removed action-availability predicate; legal election schedule remains independent |
| Presidency vacancy | Automatic acting-holder/date/reason update before successor choice; no C9 scene state |

Coup rounds and B strike choices are not removed by this simplification.
Source: `PL-C-SCENES-REVIEW-2026-09-11`; technical 17.14, not implemented code.


## Event contract revision — reference 0.8, 10 September 2026

Proposed successor only; technical 17.13 gives the complete B1–B21 mapping.

| Existing owner | Revised contract |
|---|---|
| EventRun.payload for a strike | strike_strategy=negotiate/economic_strike/cabinet_resignation; government_response records only the responsible actor's executed scope; no separate B10 menu |
| Strike settlement / parliament_response | B11+B12 share demands/settlement/order, one offer and one outcome; no second acceptance reward |
| party.ussr_position / ussr_stance | Regular party action, 1 T, 0 R, cooldown 12 M; unchanged choice has no repeated effects |
| B5 event | democracy_mass requires host acceptance/place/organization; one actual campaign and outcome, not a new church-relations currency |
| B14 negotiations | Read apparatus level, relevant union reach, actual recipient relation and accepted contact; no new leverage currency; finance and execution still required |
| B16 crisis | Read ppsCanChoose for each instrument and stateCanExecute for delivery; one crisis_id, same underlying project/budget; no general access from merely supporting a cabinet |
| Retired B menus | No new zyrardow publicity rewards, business-conflict responses or press-confiscation menus; actual restrictions, one business reaction, presidency outcomes and coup pressure remain |

Source: `PL-EVENTS-B-REVIEW-2026-09-10`. Older entries describe prior proposals
or inspected code and do not override this successor contract.


## Advisor contract — reference 0.7, 10 September 2026

These are proposed successor rules, not changes to the implemented inventory.
Technical 10.4 has the 13 profiles / 22 actions and all parameters.

| Owner | New contract / constraint |
|---|---|
| Existing advisor and appointed_once flags | First appointment +5 raw faction strength, −5 dissent once; initial trio already marked; dismissal +5 dissent, no double penalty for split/death |
| `S.cooldowns.advisor_action` | One available-at time shared by every advisor, t+6; old advisor_action_timer is only an adapter |
| `ActionTxn` with source=advisor | Additional advisor_id, subaction_id, project_id; one cost/commit/one-stage permission, never a second independently writable transaction |
| `S.advisors.effects` | Initially []; action/kind/audience/start/expiry/value/used_by records; no stacking same kind, automatic expiry |
| Existing raw faction strengths/dissents | Clamp and normalize once after all deltas; relative influence is not newly earned MPs |
| Society cells and `base_reach_pps` | Direct bounded vote transfers, Pużak/city organization; coalition relationships are separate values |
| `settlement=major_city/other` | Partition existing cell mass for Municipal Socialism, preserving class/identity/employment and votes; test split 1/2 is synthetic, historical shares pending |
| `pro_democracy` label | Read/write existing S.politics.democracy, not a duplicate state field |
| TrialRecord action_id/kind | strike/demonstration/protective_action, optional strike_id; one unique actual event, completed before success counts |

Sanacja is a later label for the appropriate actor, not extra current relation
currency; SL requires its own later profile. Conditional toleration reads an
actual current minority cabinet, its aligned profile and external-support
agreement. The KPP-protection effect retains only otherwise outgoing PPS
support; it never deletes KPP gains from other parties. Existing inventory
entries below continue to describe today's behavior. Source:
`PL-ADVISORS-REVIEW-2026-09-10`.

## Government-card state — reference 0.6, 10 September 2026

The **target** cabinet has nine unique portfolio keys: `labor`, `interior`,
`finance`, `economic`, `justice`, `agriculture`, `reichswehr`, `education`,
`foreign`. Labour includes public works/infrastructure/housing. The old
`polish_portfolios.public_works` is still present in unchanged runtime and
must not be confused with the retained party priority `public_works` or new
action family `government.public_works`. No source variables were renamed.

| Record / proposed field | Lifecycle and consumer |
|---|---|
| `S.cabinet.portfolios` | Nine unique keys for the new manifest; one formal holder each; no duplicate Labour allocation for two former ministries |
| `Project.variant`, `policy_choices`, `beneficiaries`, `financing_policy_ids` | Persist approved government choices, not a global exclusive economic route; empty until proposed, effects only after execution |
| Works `required_capabilities` | Labour plus actual funding authorization; employment/infrastructure/housing variants use existing project and output/employment accounting |
| Stabilization variant and financing references | rapid_cuts/protected/gradual; defer executes nothing; approved simple profiles in 17.12 and actual emission from 11.2 |
| School variants | Access/secularity and language are separate properties or project scopes; same school cost and benefit cannot be counted twice |
| Security/justice case and `force_ids` | Actual evidence, legal authorization and affected units; no generated guilt, preferred verdict or universal loyalty |
| Strike `EventRun.payload.government_response` | protect_negotiate/protect_sites/disperse once per phase, before execution; distinct from `Strike.parliament_response` and communist cooperation |
| Business reaction | One pressure and quiet/warning/active state in 11.7; no business-conflict choice card; affected sector is a tag, not a separate simulation |

Derived output contributions, coverage and availability read projects and
agreements; no new spendable capital, extra dashboard reading or free credit.
Migration of old cabinets with different Labour/Works holders requires an
explicit versioned contract; technical 20.1.1. Current implementation entries
below remain unchanged. Source: `PL-GOVERNMENT-CARDS-REVIEW-2026-09-10`.

## Parliamentary-card state — reference 0.5, 10 September 2026

Proposed record additions below implement the approved design contract in
documentation only. They add no main dashboard values or spendable leverage.
Details: technical 7.4, 8.8, 9.8, 17.5.1, 17.8 and 17.10.

| Owner / field P | Initialization and lifecycle | Consumer |
|---|---|---|
| `S.cabinet_crisis` | Null; actual fall creates ID, fallen cabinet, reason and open status; active successor closes it | Availability of early-election initiative, distinct from lawful election schedule |
| `Negotiation.context` | Actual event/reason, not a player-editable crisis selector | Initial post-election versus real later crisis gates |
| `Negotiation.configuration_id`, `candidate_id`, `programme_profile`, `pps_mode_proposed` | Draft values in one formation offer | Configuration/candidate/terms and actual accepted PPS role; Grabski is a profile |
| `Negotiation.seek_minority_support`, `minority_terms` | False / empty before request; accepted commitments persist in agreements | Preview of possible support, then actual votes from two existing minority segments |
| `Negotiation.availability_snapshot`, `phase` | Dated preview and current stage, recomputed before commitment | Greyed-out reasons; one transaction and total initiative cost |
| Derived `crisisOfferAllowed`, `severeCrisis`, `crisisCooperation` | Compute from actual context, recorded cabinet falls and existing economic/social/institutional crisis | Gate and willingness to negotiate; no independent coup or popularity reward |
| Derived `canUseBudgetCard`, `hasCurrentCabinetSupport` | Active cabinet, pending package, membership or actual current external support | Special budget negotiation; a one-off favourable vote is insufficient |
| `Strike.parliament_response` | Null, then demands/settlement/order once per strike | Existing compliance, concessions and settlement; no duplicate strike fund |
| Żyrardów `EventRun.payload` | Evidence, publicise/restrain, affected partner, actual request for restraint, prior disclosure promise, exposed workers and effects-applied flag | Two-choice outcome, saved once; no leak roll or staged investigation menu |

Government-support negotiations reuse existing agreements and ballots; a PPS
exit does not itself set the whole cabinet to fallen. `can_negotiate` may use
real conditional support, whereas appointment requires accepted commitments.
Current support must be recorded for the current cabinet, including explicit
opening toleration; raw relationship scores never substitute for it. Party
Piłsudski stance does not grant the executive authority required by the
government concession card. Earlier generic event payload descriptions remain
valid only within these simplified branch contracts.
Design source: `PL-PARLIAMENT-CARDS-REVIEW-2026-09-10`.

## Planned state contract — updated 10 September 2026

The implementation inventory below is unchanged by the design documented in
[POLISH_DESCRIPTIVE_GUIDE.md](docs/POLISH_DESCRIPTIVE_GUIDE.md). That guide's
section 4 proposes fifteen main status readings: party resources, PPS polling,
PPS MPs, cohesion, monthly inflation, a real-wage index, defined urban-worker
unemployment, fiscal room, industrial production, credit availability,
agrarian pressure, social dissatisfaction, democratic commitment, political
coup pressure and derived coup capacity. This is a display budget, not a claim
that all game state fits into fifteen scalar variables.

Proposed canonical keys, initial values, clamps, units and formulas are now
specified in [POLISH_TECHNICAL_REFERENCE.md](docs/POLISH_TECHNICAL_REFERENCE.md),
especially sections 2–4 and the individual system contracts. New domains use
the proposed `Q.pl` namespace alongside explicitly retained authoritative
fields. These are test proposals, not newly implemented state. Do not silently
rename inherited qualities: existing fields retain the readers/writers below
until bounded replacements and their migrations are built and tested.

Version 0.2 narrows the proposed identity enum to `polish,jewish,other_minorities`.
Two aggregate minority negotiators share existing minority seats; the current
single relation becomes a read-only derived compatibility value only when that
replacement is implemented. Bund remains an organizational partner, not an
additional population or automatic owner of all Jewish MPs. The current
inventory below still records the unchanged implemented model.

Normal remains the sole difficulty. The proposed presidential run stores one
nomination choice and a final ballot, with automatic internal transfers and no
interactive rounds. Proposed party-program fields, press format and temporary
press restrictions reuse actor/event records. Economy simplification was approved
on 14 September: current technical sections 11–12 define economy_simple_v1.
This changes the target documentation, not the implementation inventory below.

The technical reference also specifies the approved endpoint: the next legal
parliamentary election after 1922 ends this chapter even if held early. Its
proposed report and save schemas preserve unfinished projects, agreements,
losses, event phases and recorded random results for continuation.

**Party-card state in reference 0.4, 10 September (not implemented):**

| Proposed field / owner | Initial value / constraint | Read by |
|---|---|---|
| `S.actors.pps.strategy.direction` | `parliamentary_socialism`, one of four directions; P | Contextual campaign and organizational choices, 10.6 |
| `.main_opponent` | `nationalist_right`; no current-cabinet enum | Targeted campaigning, actual opponent vote pool and response |
| `.pils_influence` | `conditional`; support/conditional/oppose military interference | Concession availability and internal political alignment |
| `.form_of_power` | `parliamentarism`; also strong presidency or workers' councils | Declared method, not current legal constitution |
| `.electoral_base` | `workers`; four orientations | Organizational reach and campaign audience |
| `.economic_priorities` | Empty set, maximum three unique priorities | Program agenda, project preparation and promises |
| `.slavic_autonomy` | `cultural_rights`; federation/regional autonomy/cultural rights/polonisation | Domestic rights and constitutional proposals; no new population category |
| `.jewish_cooperation` | `labour_only`; broad/labour-only/none | Cooperation scope, Bund and minority negotiators |
| `.ussr_stance` | `uncommitted`; event writes sympathetic/independent/critical | Domestic relations with KPRP/KPP and faction expectations |
| `.democratic_preparation` | Empty list of completed-action IDs | Audit of existing alignment changes; no second passive bonus |
| `ActionTxn.selected_options` | Draft set; default max 1, economic program 3, organizations 2 | Atomic validation, cost and shared cooldowns |
| `S.party_orgs.apparatus.member_index` | 100, range 0–100, P | Dues, expulsion and effective party income |
| `S.faction_cases` expulsion resolution | No initial departure manifest | Faction normalization, reduced support and actual MP/adviser transfers |
| `Strike.communist_cooperation` and `trial_records` | Null / empty; one resolved record per distinct strike | Full/limited/none mode, compliance, unrest and preparation gates |
| Piłsudski criticism `EventRun` | Concrete speech/debate, response and resolved ID | Separate event effects; does not overwrite influence policy |

All strategy defaults and numeric mappings are P. The program display and
actor `issue_ideals` are projections of authoritative strategy and specific
offers, not parallel writable programs. `democraticThreat` and
`strategyFactor` are derived. Completed strike successes/failures are counts
of unique records, not a separately spendable `communist_coalition` value.

Milicja retains `Q.pps_militia_strength/militancy/stage`. The proposed
`S.militia.command` is removed; training is part of militarization. Police and
regular army command fields remain independent. `S.militia.militarized`,
upkeep, legal status and the proposed strength threshold control access to
AS. Existing runtime qualities below remain unchanged until implementation.

**Proposed content state in reference 0.3 (retained unless superseded above):** Named coalition,
list, premier and policy variants are saved in existing typed records, not
parallel progress meters. The additions have the following owners:

| Proposed state | Owner / initialization | Read by |
|---|---|---|
| Cabinet/list participant set, agreed program and chosen candidate | `Negotiation`, `Agreement`, election/cabinet records; none before proposal | Offers, ballots, portfolio access and later breaches |
| Land/fiscal/institution/army program positions | Actor `issue_ideals`; synthetic profiles in 8.6 | Program fit and explicit red lines |
| Democratic guarantees, constructive no confidence, presidential arbitration | `Q.polish_presidency.constitution.reforms`; false initially | Specific legal procedures in 7.6; no generic government immunity |
| Tax incidence and finite fiscal instruments | `S.economy.tax_incidence=broad`, `policies=[]` | One derived budget and dated financing/cost effects in 11.2/11.9 |
| Variant, beneficiaries and completed geographic tranche | `Project`; no new completed tranches initially | Execution, actual social effect, prevention of duplicate projects |
| TUR construction and selected course | `S.party_orgs.tur` process records; null initially | Paid months, unlocks, one-use campaign preparation |
| Modes and results of communist strike cooperation | Cooperation record with distinct strike IDs and completed agreements | Stronger parliamentary pact gates in 9.6; repeated views never add a trial |
| Current Piłsudski concession | `S.actors.pilsudski.agreement_id=null` | Delivery, pressure relief once, affected force loyalties |
| Crisis facts, evidence and follow-up state | `EventRun.payload={}`, then `S.events.resolved` | Kraków, assassination response, cult and scandal branches |

`offerScore` names the existing acceptance score, not a new currency.
`majorCrisis` is derived from recorded cabinet failures, social grievance or
the specified inflation history. Policy budget modifiers are components of one
derived budget, not separately spendable cash. No new main dashboard reading is added.

The future contract must distinguish:

- party resources, temporary negotiating position and state finance;
- abstract fiscal room, temporary financing and program obligations;
- polling, votes, sitting mandates, electoral lists and governing agreements;
- class membership, minority identity and employment status without treating
  the same people as additional population;
- party relations, particular promises, dissent and actual withdrawal of support;
- social grievance, protest participation, violence and support for democracy;
- relations with Piłsudski, inclination toward a coup and available capacity;
- militia members, readiness, command, upkeep and legal status; unions and
  state police never become automatic militia manpower;
- project declaration, authorization, funding, execution and observed outcome.

The militia successor must record militarization and sufficient preparation
before early AS becomes available. The user explicitly confirmed Milicja PPS
as the target. The existing `pps_militia_stage` values and immediate action
remain actual code, not the newly approved progression.

Future coup calculations must run after the relevant choices and remain
resumable during the event. A chapter report preserves institutions, actors,
losses, economy, organizations and outstanding agreements rather than only a
single victory flag. Historical starting data and balance thresholds are still
separate research/calibration tasks.

## Purpose and method

A Dendry **quality** is a persistent game-state value. In embedded JavaScript,
qualities are properties of `Q` (`Q.resources`); in Dendry conditions and text,
the same value appears by name (`resources >= 2`). Scenes can read qualities to
show cards, events, choices, and text, or write them on arrival/departure.
Qdisplays convert numeric qualities into phrases, and the browser serializes
the state for saves.

Most baseline values are initialized in `root.start` in
`source/scenes/root.scene.dry`. Other values are created only when an event or
calculation first needs them. Dendry-generated condition code generally treats
an absent value as false/zero, but embedded JavaScript does not always make the
same fallback explicit. A new value should therefore be initialized unless a
verified lifecycle requires otherwise.

Changing a name can break distant systems because state is shared and because
several families are built from strings. For example, `post_event` combines a
class and party to access `<class>_<party>`, while election code constructs
`old_<party>_r` and `<party>_r_disp`. A search for one literal spelling does not
find every dynamic reader.

### Audit method and count

- All 167 files under `source/` were read: 158 scene files, eight qdisplay
  files, and `source/info.dry`.
- The original baseline audit identified 989 literal or constructible `Q`
  keys. The approved population slice adds 58 identifiable keys: two group
  weights, two quality-of-life placeholders, and two 27-key raw/normalized/
  display class-party families (including SAPD).
- That audit snapshot contained **1,047 identifiable state keys**. This is not
  a recounted total after the later party, adviser and opening-state slices;
  their contracts are documented below. It includes keys that a dynamic loop
  can access even if their value is absent and behaves as false/zero.
- JavaScript locals such as `party`, `class_votes`, and `candidate_votes` are
  not qualities and are excluded.
- Dendry engine state such as the current hand, visit counts, and current scene
  is persistent runtime state but is not included in those source-quality counts.

This is a static evidence inventory. “Appears unread” and “not initialized” do
not prove a defect; dynamic access, runtime code, and route ordering must be
considered. Where behavior remains uncertain, it is labelled **UNCLEAR —
requires code investigation or runtime testing.**

## How to read the contracts

Each table covers the requested fields in compact form:

- **Type / initialization / range** gives the inferred type, where the value is
  first assigned, its initial value, and only ranges or enumerations evidenced
  by source.
- **Writers / readers / display** names representative source files/scenes when
  the complete set is large and notes qdisplay/UI use.
- **Dependencies / kind** states which systems rely on it and whether it is
  persistent simulation state, an event flag, or temporary control/display
  state.
- **Thresholds / uncertainty** records invariants, boundary values, and naming
  or lifecycle risks.
- Every row carries an adaptation field. Approved decisions are recorded
  directly; unresolved fields remain **TBD — user decision required.**

## Time and turn state

| Exact name | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `started` | Number used as boolean; `root.start`, `0` before start and `1` on start | Written/read in `source/scenes/root.scene.dry`; controls start menu vs game | Root routing; persistent control state | Must be set before normal loop | TBD — user decision required. |
| `time` | Integer month counter; `root.start`: `1`; increases by one per spent-action reconciliation | Written in `source/scenes/post_event.scene.dry`; read by cards/events including the government-deck gate | Calendar, events, elections; persistent simulation state | Government deck needs `time >= 6` AND inactive opening-cabinet guard; relationship to month/year must remain consistent | Retain `1` as the opening relative-time value. |
| `year` | Integer; current `root.start`: `1922`; increments at month rollover | `post_event` and dated event conditions; shown in status | Calendar, events, ending; persistent simulation state | Month 13 resets to 1 and increments year; retained absolute-year German events begin in 1928 and campaign-end events begin in 1934 | Implemented as `1922`. German date gates retain their existing years until researched Polish replacements are approved. |
| `month` | Integer; current `root.start`: `1`; normal values 1–12 | Written by `post_event`; read by scheduled events/elections; `source/qdisplays/month.qdisplay.dry` | Calendar and all scheduled content; persistent simulation state | Must remain 1–12 after reconciliation | Implemented as `1`, representing January. |
| `month_actions` | Integer control count; `root.start`: `0`; most action cards add one | Written throughout party/government scenes and reset by `post_event`; no direct qdisplay | Determines whether time advances; temporary turn control persisted in saves | `>= 1` advances exactly one month; discard/cancel paths subtract one | TBD — user decision required. |
| `timers` | Array of timer base names; initialized in `root.start` | Read by the decrement loop in `post_event`; not directly shown | All card/event cooldowns; persistent configuration state | A `<base>_timer` omitted from this array does not use central decrement | TBD — user decision required. |
| `*_timer` | Nonnegative integer months by convention; many explicit zeros in `root.start`, others created later | Written by matching cards/events; read in `view-if`/choices and decremented in `post_event`; usually player sees availability, not the number | Hand eligibility, events, advisers; persistent cooldown state | Positive values decrement; most cards treat zero/absent as available; inconsistent initialization is a risk | TBD — user decision required. |
| `next_election_year`, `next_election_month`, `next_election_time` | Integers; root: `1922`, `11`, `11`; first result schedules `1928`, `5`, `77` | Opening helper protects the first date; `sejm_election_result` schedules continuation; later inherited scheduling writers remain | Election scheduling; persistent simulation state | Month/year and relative counter agree. Later ordinary results schedule four years from the actual election date | November 1922 implemented. May 1928 and subsequent inherited scheduling are explicitly temporary, not approved Polish chronology. |

## Resources and action economy

| Exact name | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `resources` | Integer-like party currency; fixed `root.start`: `2` | Many party/adviser cards spend/add it; shown in status | Party actions, organizations, advisers; persistent simulation state | Costs are embedded across scenes; no demonstrated global min/max | TBD — user decision required. |
| `dues` | Integer-like recurring fundraising capacity; fixed `root.start`: `2` | `source/scenes/party_affairs/fundraising.scene.dry` and initialization; player-facing through resource outcomes/status | Resource income; persistent simulation state | Full runtime range is not established | TBD — user decision required. |
| `budget` | Numeric government fiscal capacity/balance; fixed `root.start`: `4` | Government/economic/fiscal scenes and `post_event`; shown in status | Policy access, inflation feedback, capital strike; persistent simulation state | Negative is legal; `post_event` bands at 0, -2, and -5 alter inflation | TBD — user decision required. |
| `difficulty` | Legacy integer compatibility field; fixed to `0` in `root.start` | Initialized in root and still read by dormant legacy branches or imported content; no player selection | Save/mod compatibility; persistent configuration state | New games must leave it at `0`, the former Normal value | Keep fixed at `0` for compatibility; do not expose a difficulty selection. |
| `historical_mode` | Legacy boolean-like compatibility field; fixed to `0` in `root.start` | Initialized in root and still read by dormant legacy/runtime gates; no player selection | Save/mod compatibility; persistent configuration state | New games must leave it false so saves, polls, and normal event choices remain available | Keep false; do not expose a historical mode, and retain saves and polls. |
| `last_advisor_action`, `last_cabinet_action` | ID/false-like temporary markers; initialized/reset to `0` | Adviser/cabinet actions write; cancellation and `post_event` read/reset | Pinned-card rollback; temporary control state | Must identify the card whose action can be cancelled; type varies between zero and identifiers | TBD — user decision required. |

## Elections and parliamentary state

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `parties` | Array; nine semantic Polish IDs in `root.start`: `kpp`, `pps`, `npr`, `psl_wyzwolenie`, `psl_piast`, `pschd`, `zln`, `minorities_bloc`, `other` | Read by support/election/post-event/game-over loops and charts | Defines active electoral state; persistent configuration/simulation state | Adding/removing/reordering requires initialization, formulas, UI, colors, records and saves to agree | Implemented. Inactive German IDs must not be pushed into this array; the old SAPD event is gated out for Polish games. |
| `player_party`, `polish_party_system`, `party_names`, `party_colors` | Semantic player ID, feature flag, and ID→display maps initialized in root | Election, Library/chart and compatibility code read | Polish party configuration and UI | Keys must cover every member of `parties` | Implemented for the opening-party slice. |
| `legacy_party_map` | Object initialized as `spd`→`pps`, `kpd`→`kpp`, `dvp`→`pschd`, `dnvp`→`zln` | `post_event` and `election_algorithm` transfer deltas; inherited scenes write legacy families | Compatibility layer; persistent transitional state | Transfer bases must be refreshed after each transfer to prevent duplicate effects | Implemented narrowly; no mapping is inferred for Zentrum, DDP or NSDAP. |
| `<party>_normalized` | Fraction number, normally 0–1; calculated by `post_event`/`election_algorithm` | Written in those calculators; read by presidential election, UI/charts, and events | Vote shares, candidate aggregation, achievements; derived persistent state | Party fractions should sum approximately to 1; division denominator must be nonzero | TBD — user decision required. |
| `<party>_votes`, `<party>_votes_dec`, `<party>_votes_disp`, `<party>_votes_display` | Numeric and formatted derived variants; calculators assign rounded values | Election/post-event writers; election narrative/status readers | Player-facing vote representation and downstream election state; derived/display state | Similar suffixes have different rounding/format; `use_decimals` is TODO | TBD — user decision required. |
| `<party>_r`, `<party>_r_disp` | Parliamentary percentage / legacy formatted variant; `_r = 100 * <party>_seats / sejm_total_seats` | Opening helper rebuilds `_r` from the opening snapshot or recorded result, including legacy aliases | Compatibility for unadapted readers; not authoritative electoral state | Never votes or seat counts. UI uses fresh `_sejm_display` and result rows instead of potentially stale `_r_disp` | Exact integer seats implemented; inherited percentage readers retained. |
| `old_<party>_r`, `change_<party>_r`, `str_change_<party>` | Prior numeric result, numeric delta, formatted signed delta; initialized/calculated in root/election | Election code writes/reads; result screen displays | Election comparison; persistent/display-support state | Must update as one family before overwriting current result | TBD — user decision required. |
| `electoral_threshold` | Numeric percent; `root.start`: `0` | Retained constitutional-policy writers; continuation result filter | Legacy continuation eligibility only | First November result ignores inherited exclusions. Later elections exclude below-threshold parties and Other when threshold exceeds 1 | Preserve later legacy behavior; not a reconstruction of Polish electoral law. |
| `kpd_banned`, `nsdap_banned` and dynamic `<party>_banned` reads | Number used as boolean; explicit two-party flags initialized `0` | Constitutional/institutional scenes write; election loop dynamically reads for every party | Election eligibility; persistent rule/flag state | Only two explicit base flags are evidenced; absent dynamic keys act false in compiled conditions | TBD — user decision required. |
| `n_elections` | Integer counter; root: `0` | Atomic `sejm_election_result` writer increments when publishing a new record | Campaign progress and conditional content | Re-entering results, restoring a same-version save or visiting Library must not increment it again | Implemented idempotent result recording. |
| `largest_party`, `has_majority`, `any_majority`, `pass_threshold` | String/boolean-like helpers, assigned during election/government logic | Election and presidential-election code; coalition menus/narrative | Government formation; temporary/derived persistent control state | Recompute after each relevant result; lifecycle outside election is not uniformly documented | TBD — user decision required. |
| Inherited German coalition totals (`weimar_coalition`, `grand_coalition`, `bourgeois_coalition`, `center_right_coalition`, `right_coalition`, `far_right_coalition`, `left_coalition`, `popular_front_coalition`, `anti_democratic_coalition`, `neo_weimar_coalition`, `hitler_right_coalition`, `progressive_coalition`) | Numeric compatibility values in the retained German election branch | Inactive German result/government scenes write/read | Legacy compatibility only for Polish games | The active Polish election no longer routes through these formulas | Preserve until the remaining German event/government routes are replaced; do not use them as Polish coalition state. |
| `election_records` | Flat array of dated party seat percentages; root: `[]` | Opening helper regenerates from `sejm_results` | Temporary compatibility only | Not the authoritative history; current Library uses `sejm_history`, with distinct votes, MPs and seat percentages | Implemented derived adapter. |

### Authoritative Sejm election contract

Source: `source/scenes/sejm_election.scene.dry`,
`source/scenes/sejm_election_result.scene.dry`,
`source/scenes/polish_opening_state.scene.dry`; tests:
`tests/sejm-election.test.js`. The opening snapshot, changing polls and recorded
elections are separate objects. Neither campaigning nor a legacy `_r` write
replaces a parliament. The menu-only simulator does not write these objects.

| Exact name/family | Type / lifecycle | Contract and consumers |
| --- | --- | --- |
| `polish_election_system`, `polish_government_safeguards` | Boolean-like numbers; root: `1` / `1` | Select the new result path and keep approved German executive, Prussian-police, confidence and toleration routes unavailable after the opening as well. They are not a campaign cutoff. |
| `sejm_pending` | Root: `null`; object with `id`, `year`, `month`, `first`, `phase` and later `government_choice` | Phases `pending` → `results` → `complete`. The ID prevents duplicate publication; a government choice is applied only once. Serializable with ordinary Dendry state. |
| `sejm_results` | Root: `[]`; append-only array | Authoritative frozen records: `id`, `year`, `month`, `date`, `kind`, `method`, `total_seats`, `party_names`, `party_votes`, `party_seats`, `lists`, `previous_parliament`. `date` is a month-bucket ISO key; it is not a claim of polling on the first day. |
| Result `lists` | Array of objects with `id`, `name`, `members`, `vote_share`, `multiplier`, `weight`, `seats` and `anonymous` where applicable | First result combines ZLN + PSChD as ChZJN. Other becomes 2% lists plus a remainder. Named parties remain separate in `party_votes`/`party_seats`. Coalition membership never includes a `chzjn` party ID. |
| `sejm_parliament` | Root opening snapshot; replaced only on a valid result | Current parliament cache with `id`, `kind`, `total_seats`, `party_seats`, `party_names`; elected cache is rebuilt from the matching record. `previous_parliament` archives the actual prior counts/size without recursive history. |
| `sejm_first_election_completed` | Root: `0`; first valid result: `1` | Protects November 1922 from inherited scheduling writes until recorded. ChZJN is first-election-only; subsequent records have kind `legacy_continuation`. |
| `<party>_seats`, `sejm_majority_required` | Derived integers | All seats sum to chamber size. Majority = `floor(total / 2) + 1`, hence 223 of 444; 222 is insufficient. `_r` remains a derived percentage, not another result writer. |
| `polish_left_seats`, `polish_center_left_seats`, `chjeno_piast_seats`, `pps_wyzwolenie_seats` | Derived integer sums | Government choices use these totals and unchanged relation gates. `minorities_toleration` never makes the minority bloc a cabinet member; `in_minority_government` is true only if the cabinet itself lacks a majority. |
| `sejm_election_due`, `sejm_election_in_progress`, `sejm_forming_government` | Derived booleans | Exclusive routing from `post_event` / `main` ensures the due election cannot be skipped for another normal monthly action. Results and government choice consume no extra month. |
| `sejm_election_error` | Root: empty string; validation message if needed | Invalid/all-zero input does not partially replace a parliament or append history. |
| `sejm_display_rows`, `sejm_history`, `sejm_chart_colors`, `sejm_has_chzjn`, `sejm_has_result` | Derived presentation data | Status, exact-seat D3 chart and history agree. ChZJN grouped for its recorded election; Other aggregates its independent lists for display only. |
| `sejm_largest_lists`, `sejm_largest_parties`, `largest_party_id`, `largest_party` | Derived names / legacy single-party adapter | Largest list is by recorded votes; largest named party by seats, excluding aggregated Other. All ties displayed; the legacy single-party ID uses lexical order. |
| `<list>_election_display`, `sejm_vote_comparison_notice`, `sejm_result_date` | Derived strings | Separate vote %, MPs, seat %, MP deltas and seat-percentage-point deltas. Previous votes are N/A for the opening snapshot or a changed electoral alliance. |
| `polish_government_actions_available` | Derived boolean in `main` | Show the government deck only when at least one eligible card remains; an empty protected deck cannot consume the turn. |

Allocation uses full-precision national polling and the user-confirmed calibrated
bands: below 2% ×0.25, 2–<5 ×0.55, 5–<10 ×0.85, 10–<15 ×1.025,
15–<25 ×1.10, 25%+ ×1.25. Normalize weighted lists, allocate integer seats by
largest remainder, and break exact ties by lexical list ID. ChZJN's internal
seats use the same integer method on election-time ZLN/PSChD support. These are
approved gameplay rules, not the historical district system; geography is out
of scope. Invalid input fails without publishing partial state.

## Party support and factions

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `classes` | Array of seven active IDs initialized in `root.start`: `workers`, `old_middle`, `new_middle`, `rural`, `bourgeois_landowners`, `unemployed`, `national_minorities` | Support/election/game-over loops read; Library displays Polish labels | Defines demographic dynamic keys; persistent configuration state | Every member requires a weight and a nonzero party-propensity row; `catholics` is deliberately absent | Implemented for new games; old-save migration is out of scope. |
| `workers`, `old_middle`, `new_middle`, `rural`, `bourgeois_landowners` | Numeric main-class shares; root: `27`, `110/9`, `50/9`, `53`, `20/9` | `post_event` updates `workers`/`rural`; support loops weight every field | Five-class structure and elections; persistent simulation state | Total is exactly 100; `workers` rises and `rural` falls linearly by three points over month indexes 0–215; other shares remain fixed | Implemented. December 1939 endpoint is 30/50, although the current campaign normally ends earlier. Historical basis remains **TBD — historical research required**. |
| `unemployed` | Numeric percent-like overlapping economic condition; root: `3` | Year/economic events and policies write; support weighting, status, and graph read | Economy and elections; persistent simulation state | Floored at 1 in `post_event`; not part of the five-class 100% total; differs from `unemployment` | Implemented opening value; existing crisis mechanics preserved. |
| `national_minorities` | Numeric overlapping identity weight; root: `30` | Support loops read; Library displays; currently fixed | Elections; persistent simulation state | Overlaps the main classes; Polacy are the implied complement and have no separate variable; this makes the minority row an additional electoral dimension | Implemented by explicit user-approved design decision; a future intersection model remains optional planned work. |
| `catholics`, `catholics_spd`, `catholics_spd_compat_base` | Legacy compatibility weight/input; `catholics` is not a member of `classes` | Existing German cards may write `catholics_spd`; compatibility code transfers only its delta to `national_minorities_pps` | Transitional mechanics only | Must never overwrite the full minority-party row or be weighted independently | Retained only for inherited PPS-targeting effects. |
| `<class>_<party>` | Numeric opening within-group percentage/raw propensity; matrix initialized in `root.start` | Campaigning and compatibility code write selected cells; support/election loops read dynamically | Core party-support model; persistent simulation state | Negative values are clamped; every implemented opening row totals exactly 100 | Implemented for all nine parties and seven groups. `other` is 8 in every row except `rural`, where it is 12; the eight supplied party values are proportionally scaled to the remainder. |
| `<class>_<party>_normalized`, `<class>_<party>_display` | Numeric percent and rounded display value; generated by calculators | `post_event`, `election_algorithm`, and `game_over` write; conditions/status/achievements read | Elections, achievements, demographic UI; derived/display persistent state | Each class's normalized party values should sum to 100 | Retain the existing calculation for the approved playable slice. |
| `party_support_records` | Array; `root.start`: `[]`; monthly dated objects appended | `post_event` writes; D3 chart in `library` reads | Historical support chart; persistent display-support state | Party keys must follow the nine active `parties` and `party_names`/`party_colors` maps | Implemented for the Polish opening roster. |
| `factions` | Active array `centrum`, `lewica`, `pilsudczycy`; initialized in root | `post_event` normalizes; disunity, split events, status and Library read | PPS faction normalization and dissent; persistent configuration state | Every member requires `_strength` and `_dissent`; Labor is deliberately excluded | Implemented for new games. |
| `centrum_strength`, `lewica_strength`, `pilsudczycy_strength` | Numeric shares; root starts 50/15/35 | Polish disunity/split events and the compatibility bridge write; `post_event` normalizes; UI displays | Overall dissent and split consequences; persistent simulation state | Nonnegative; normalized to total 100; zero total is guarded | Implemented. |
| `centrum_dissent`, `lewica_dissent`, `pilsudczycy_dissent` | Numeric percent-like values; root starts 0/20/5 | Polish disunity and compatibility bridge write; `post_event` clamps; split events read | Overall dissent and split consequences; persistent simulation state | Clamped to 0–99; each consequence triggers at 60 | Implemented gameplay values; historical validation remains TBD. |
| `legacy_factions`, `legacy_faction_map`, `<legacy>_*_compat_base` | Shadow five-field German model and per-field transfer baselines | Inherited cards and inactive legacy adviser scenes may write German fields; `post_event` transfers mapped deltas once, normalizes shadow values and refreshes baselines | Temporary unadapted-card compatibility | Map: Left→Lewica, Center+Reformist→Centrum, Neorevisionist→Piłsudczycy; Labor is unmapped | Implemented technical bridge, explicitly not a historical equivalence. Active Polish advisers write semantic fields directly. |
| `labor_strength`, `labor_dissent` | Numeric inherited union-power-centre values | Inherited union content and Polish disunity card write; status/Library display | Temporary affiliated-union compatibility state | Excluded from `factions`, its normalization and overall `dissent` | Retained until a researched ZSZ mechanic is implemented. |
| `dissent`, `dissent_percent` | Fraction and percent; initialized then recomputed after actions | `post_event` writes; support changes, party-disunity scenes, status and `dissent` qdisplay read | Party support effectiveness and faction consequences; derived persistent state | Weighted from the three active PPS factions only; `dissent` capped at 0.95 | Implemented. |
| `lewica_split`, `centrum_resigned`, `pilsudczycy_split` | Number used as one-shot event flags; root starts `0` | New PPS consequence scenes write/read; UI/disunity checks read | Prevent repeated 60-dissent consequences; persistent event flags | Trigger at corresponding dissent 60 | Implemented; successor parties remain planned. |
| `left_split`, `centrists_resign`, `reformists_resign`, `reformists_resigned`, `unions_independent`, `sapd_formed` | Legacy compatibility flags | Inherited event/card files may read/write them | Transitional inherited mechanics | German faction split/resignation scenes are gated off when `polish_faction_system` is active | Retained compatibility state; not PPS faction outcomes. |

## Coalition and inter-party state

### Implemented Polish Opening State contract

Initialization is in `source/scenes/root.scene.dry`. The helper
`source/scenes/polish_opening_state.scene.dry` runs **after** initialization and
monthly reconciliation and before main/status/Library displays. The following
state is for new games and same-version saves, not an old-save migration.

| Exact name/family | Type and initial value | Writers/readers and invariant |
| --- | --- | --- |
| `polish_opening_government_active` | Boolean-like number, `1` | Root initializes; helper and the canonical election writer clear it. Opening government identity is never reactivated automatically. Later authority safeguards have their own flag. |
| `polish_cabinet_id` | String, `ponikowski_1` | Root/helper; display/lifecycle identity. Cleared when the opening is retired, not assigned to a researched successor. |
| `head_of_state_office`, `head_of_state_name` | Strings, initially `naczelnik_panstwa`, `Józef Piłsudski` | Derived compatibility/display fields for the authoritative `polish_presidency.current`. December changes them to `prezydent_rp` and finally Stanisław Wojciechowski. Separate from the PPS Piłsudczycy faction. |
| `pps_external_toleration` | Boolean-like number, `1` | Root/helper; PPS-position text only. Grants no ministry or cabinet membership; never copied into `spd_toleration`. Clears when this opening government is replaced. |
| `chancellor`, `chancellor_party`, `president` | Strings, `Antoni Ponikowski`, `expert_cabinet`, empty string | Retained executive compatibility keys. The Polish sequence preserves the first two and never writes `president`; empty legacy `president` does not mean that the Polish presidency is vacant. |
| `polish_portfolios` | Object mapping ten stable keys to Polish labels | Root and read-only Library/helper. Keys: `labor`, `interior`, `finance`, `economic`, `justice`, `foreign`, `agriculture`, `reichswehr`, `education`, `public_works`. Last two add no policy/allocator behavior. |
| `<portfolio>_minister_party`, `<portfolio>_minister` | Strings, `opening_expert_cabinet` and empty name | The sentinel denotes cabinet administration outside PPS, not a claim that all ministers were non-party. Helper clears remaining sentinels after replacement but preserves new owners/names. Existing ministry checks must not treat the sentinel as PPS/SPD ownership. |
| `sejm_total_seats` | Integer, `444` | Current chamber size, used for allocation, majority, seat percentages and exact chart dots. |
| `opening_sejm_seats` | ID→integer object, 2/35/22/25/99/27/83/17/134 in party order | Root largest-remainder allocation from normalized supplied August shares. Sum is exactly 444. Retained as an archive after invalidation, never reused as current results then. |
| `opening_sejm_active` | Boolean-like number, `1` | Derived from `sejm_parliament.kind`; clears on an elected parliament. Stray `_r` writes are repaired, not accepted as results. Old difference-detection remains only for states without `polish_election_system`. Cabinet replacement alone does not clear the snapshot. |
| `head_of_state_display`, `prime_minister_display`, `pps_government_position`, `parliament_heading`, `parliament_names`, `<party>_sejm_display`, `<portfolio>_portfolio_display` | Derived strings/maps | Helper refreshes for status/Library. Opening minority representation is labelled “Minority deputies”; global party IDs/names remain unchanged. Later unimplemented state is explicitly labelled temporary. |

The helper recognizes replacement through executive identity, government/
caretaker/legacy-toleration flags, ministry-owner changes or an election. It
clears only opening metadata and remaining opening placeholders, never new
government assignments. No new timers are introduced. From March 1922 the UI
warns if the January cabinet snapshot persists. November 1922 is scheduled and
implemented; the December presidency then preserves the selected government.
May 1928 / relative month 77 is only the temporary next parliamentary date,
followed by inherited scheduling.

Opening `spd_in_government`, `pps_in_government`, `spd_caretaker`, coalition
flags, legacy `spd_toleration` and minority toleration all start at zero.
`spd_prussia = 1` deliberately remains for force compatibility, **not** police
command rights: rally/police-training and Prussian executive options have
the persistent `polish_government_safeguards` guard. Police figures and militia
mechanics are unchanged. Generic welfare remains explicitly labelled legacy.

### Implemented Polish presidential-state contract

| Exact name/family | Type and initial value | Writers/readers and invariant |
| --- | --- | --- |
| `polish_presidential_system` | Boolean-like number, `1` | Enables the semantic Polish system and narrowly disables the German 1932 direct election and 1934 Hindenburg succession routes. It is not a campaign-wide content cutoff. |
| `polish_presidency` | Object with `constitution`, `current`, `assembly`, `elections`, `transitions`, `pps_decisions` | Root initializes; the December sequence writes; opening helper, Status and Library read. This is the authoritative Polish office and immutable history. |
| `polish_presidency.constitution` | Semantic object for `march_constitution_1921` | Seven-year National Assembly election; countersignature; prime-minister appointment; ministers on PM proposal; no separate legislative veto or inherited independent-decree power; Sejm dissolution requires the recorded Senate-consent rule. Never inferred from `presidential_powers`. |
| `polish_presidency.current` | Object; initially Piłsudski as `naczelnik_panstwa` | Sequence changes to Narutowicz as `prezydent_rp`, a short compressed-succession marker, then Wojciechowski. The approved playable state deliberately omits Rataj's brief acting presidency. |
| `polish_presidency.assembly` | `null`, then immutable 555-member snapshot | Contains the current 444 Sejm seats, 111 Senate proxies apportioned proportionally by largest remainder, combined party seats and names. It does not create a general Senate mechanic or alter `sejm_parliament`. |
| `polish_presidency.elections` | Empty array, then two records | Fixed final ballots: Narutowicz 289 / Zamoyski 227 plus 29 blank on 9 December; Wojciechowski 298 / Morawski 221 on 20 December. Each record includes semantic candidate IDs and supporting party IDs. Results are not calculated from the simplified Assembly. |
| `polish_presidency.transitions` | Empty array | Records Narutowicz's oath, Piłsudski's transfer, assassination, and Wojciechowski's oath/assumption exactly once. Does not record an acting holder under the approved compression. |
| `polish_presidency.pps_decisions` | Empty array | Records first candidacy, peaceful constitutional response and second non-candidacy. No numerical effects. First candidacy depends on `daszynski_left_adviser_pool`, not `daszynski_advisor`. |
| `polish_presidential_pending` | `null`, then resumable phase object | Stores Assembly copy, nominations, response and phase. Same-version save/re-entry must not duplicate decisions, ballots or transitions. |
| `polish_presidential_phase`, `polish_presidential_due`, `polish_presidential_in_progress`, `polish_presidential_sequence_completed` | Derived string/boolean-like controls | Opening helper and sequence maintain routing. Due only after completed November government formation at December-or-later; mandatory route precedes ordinary events and consumes no action/month. |
| `polish_first_presidential_election_recorded`, `polish_second_presidential_election_recorded`, `national_assembly_total` | Derived display fields | Opening helper rebuilds from canonical state for Status/Library; never authoritative writers. |
| `president`, `presidential_powers`, `presidential_election_seen` | Legacy German compatibility state | Unchanged by the Polish sequence. German named-string/power semantics are not Polish constitutional semantics. Later Polish events must read `polish_presidency`, while remaining inherited users require separate review. |

Variable presidential outcomes, later elections, a permanent Senate, successor
cabinets and numerical consequences are planned, not silently represented by
the fixed December records.

### Retained coalition and relationship families

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `in_spd_majority`, `in_polish_left_coalition`, `in_polish_center_left_coalition`, `in_chjeno_piast`, `in_minority_government`, `minorities_toleration` | Number used as related booleans; initialized/reset around the Polish election | Active Polish election routes write; status/Library read; inherited government access still reads `spd_in_government` | First-cycle government identity and access; persistent simulation state | Active result processing resets all six before offering routes; later inherited government events require further adaptation | Implemented first-cycle shell. Minorities toleration requires `minorities_bloc_in_government = 0`. |
| `polish_left_coalition`, `polish_center_left_coalition`, `chjeno_piast_coalition`, `minority_toleration_total`, `anti_democratic_bloc` | Derived seat-percentage totals | Opening helper rebuilds from integer party seats | Percentage compatibility and reporting only; active majority gates use exact seats | `anti_democratic_bloc` remains a legacy metric, not a Polish democratic classification | Democratic classification and broad-coalition crisis logic remain planned. |
| `coalition_dissent` | Numeric step-like value; initialized/reset around government formation | Government choices/events write; coalition affairs and qdisplay read | Government stability and confidence votes; persistent simulation state | Qdisplay: 0 very low, 1 low, 2 medium, 3 high, 4+ very high | TBD — user decision required. |
| `kpd_coalition_dissent`, `kpd_goals_seen`, `kpd_goals_completed`, `kpd_coalition_success`, `popular_front_success` | Numeric counters/boolean flags created in coalition/event routes | Popular/left-front and KPD event files write/read; narrative/ending use | Specific coalition stability; persistent event/simulation state | Lifecycle depends on entering those routes; several are not root-initialized | TBD — user decision required. |
| `psl_wyzwolenie_relation`, `minorities_bloc_relation`, `psl_piast_relation`, `npr_relation`, `pschd_relation`, `kpp_relation`, `zln_relation` | Numeric relationships initialized to 65/50/45/50/30/10/5 | Polish relationship card writes; status/Library display; first-cycle coalition gates read selected values | Cooperation and coalition eligibility; persistent simulation state | Existing qdisplay bands are authoritative, so 65 displays friendly, 50 neutral, 10 frigid and 5 hostile | Implemented. Legacy German relationship fields remain inactive compatibility state for inherited content. |
| `spd_toleration`, `communist_coalition`, `kpd_truce`, `tried_supporting_kpd` | Numeric policy/route flags; initialized or created by relevant choices | Election, inter-party and KPD routes | Coalition option availability and consequences; persistent choice/event state | Meanings are route-specific rather than one common scale | TBD — user decision required. |
| `chancellor`, `chancellor_party`, `old_chancellor`, `president` | Legacy strings; initialized and reassigned by inherited election/government/head-of-state events | Coalition and major German event writers; some inherited endings readers | Temporary government and legacy constitutional state | Named comparisons remain fragile; Polish presidency deliberately does not write `president` | Retain only as compatibility. New Polish head-of-state work must use `polish_presidency`. |

## Advisers, cabinet, and leadership

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `n_advisors` | Integer active-roster count; root: `3` | Polish leadership management and departure/split processing write; the three-slot gate reads | Adviser availability; persistent configuration/simulation state | Must remain between 0 and 3; opening active team is Daszyński, Pużak and Perl | Implemented three active slots. |
| `<name>_advisor` (14 semantic Polish flags) | Number used as boolean; three starting flags are `1`, all other Polish flags `0` | Leadership, split and timed-departure logic write; individual adviser cards read | Active Polish adviser roster; persistent state | Names: `daszynski`, `puzak`, `perl`, `niedzialkowski`, `arciszewski`, `zaremba`, `czapinski`, `prochnik`, `dubois`, `drobner`, `jaworowski`, `moraczewski`, `ziemiecki`, `malinowski` | Implemented. Legacy German flags remain initialized to zero for inherited compatibility only. |
| `<name>_appointed_once` | Boolean-like number; starting three are `1`, other Polish advisers `0` | Leadership appointment writes and reads | Prevents repeatable faction-strength farming; persistent roster history | First appointment adds +5 associated-faction strength; later appointments do not | Implemented. |
| `<name>_left_adviser_pool` | Boolean-like number; root: `0` for all fourteen | Timed departures and named faction splits write; appointment availability reads | Permanent adviser-pool departure; persistent chronology state | A split sets this only for named advisers whose entry date has arrived; therefore a later entrant survives an earlier split | Implemented. Perl: April 1927; Daszyński: beginning of 1931; named split matrix documented in `PLAN.md`. |
| `advisor_action_timer` | Nonnegative integer; root: `0`; Polish adviser actions set `6` | Adviser scenes and cancel helper write/read; availability is player-facing | Shared adviser cooldown; persistent cooldown state | One cooldown is shared by every active adviser; it decrements with monthly timer processing | Implemented six-month assignment, preserving existing subsequent monthly decrement behavior. |
| `leverage` | Numeric ministry-negotiation currency calculated at election | Election coalition/ministry subscenes write/read; allocation choices show costs | Cabinet ownership; temporary election state persisted in saves | Common ministry costs 5/10/15; must not become negative through valid choices | TBD — user decision required. |
| `*_minister_party` | String party ID or false-like value; initialized/reset in root/elections | Election allocation and cabinet changes write; government cards read; status shows ownership | Ministry access and goals; persistent government state | Must agree with current coalition and reset on government change | TBD — user decision required. |
| `*_minister` | String person name; initialized/assigned in root/cabinet routes | Cabinet scenes write; narrative may read; not all have confirmed mechanical readers | Narrative/cabinet identity; persistent display/support state | Some appear write-only in static analysis | TBD — user decision required. |
| `*_goal`, `*_goal_completed` | String/number or boolean-like ministry objectives; initialized/created by cabinet paths | Cabinet/government scenes write/read; goal UI/narrative readers | Cabinet progression; persistent simulation/control state | Type and values differ by ministry; no common enum is enforced | TBD — user decision required. |

## Economy, taxation, and government finance

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `unemployed` | Numeric percent-like value; root: `3` | Year/economic events and policies write; support weighting, status, and graph read | Economy and elections; persistent simulation state | Floored at 1 in `post_event`; differs from `unemployment`; overlaps rather than belonging to the main-class 100% | Opening value implemented; existing crisis behavior retained. |
| `inflation` | Numeric percentage; root: `2.9` | Year events, policies, and monthly budget feedback write; status/graph/events read | Economy, support, crisis events; persistent simulation state | Monthly deficit bands use 0, -2, -5 budget and caps such as 2.5/5/10 | TBD — user decision required. |
| `economic_growth` | Numeric percentage-like value; root: `4.4` | Year events/policies/monthly logic write; status/events read | Economy, unemployment, endings; persistent simulation state | No demonstrated universal clamp or range | TBD — user decision required. |
| `economic_records` | Array of dated objects; root: `[]` | `post_event` appends inflation/unemployment; D3 reads | Economic chart; persistent display-support state | Date and field names must match chart code | TBD — user decision required. |
| `economic_plan` | Integer enum; root: `0`; documented `1` WTB, `2` moderate, `3` nationalization | `source/scenes/party_affairs/crisis_program.scene.dry` writes; government economic policy/events/endings read | Policy tree and political consequences; persistent decision state | Exact numeric comparisons; only 0–3 documented | TBD — user decision required. |
| `wtb_support`, `wtb_adopted`, `wtb_implemented`, `wtb_budget`; `moderate_plan_support`, `moderate_plan_adopted`, `moderate_plan_progress`; `nationalization_support`, `nationalization_adopted`, `nationalization_progress`, `nationalize_budget` | Mixed counters, booleans and numeric costs; many root-initialized at zero | Crisis/economic-policy scenes write/read; events/endings and UI use selected fields | Staged economic programs; persistent simulation state | Similar but nonuniform naming/lifecycles; ranges vary by route | TBD — user decision required. |
| `works_program` | Integer-like policy level; created by economic policy | Year/month economic logic, events and endings read/write | Unemployment/growth/inflation trajectory and endings; persistent simulation state | Later source distinguishes `0`, `>=1`, and `>=2` | TBD — user decision required. |
| `upper_tax_rates`, `lower_tax_rates`, `tariffs` | Signed integer-like policy levels; initialized in root | Fiscal policy writes; qdisplay/relationships/economy read | Budget and political/economic reactions; persistent simulation state | Taxation qdisplay bands from `<=-6` to `>=6` | TBD — user decision required. |
| `capital_strike_progress`, `coup_progress` | Numeric escalation counters; root: `0` | Policy/institution/event writers; threshold event readers | Elite resistance, coup events, endings; persistent simulation state | Trigger logic uses `>=10`; capital confidence event also uses progress 6 and budget -5 | TBD — user decision required. |

## Organizations, loyalty, and militancy

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `pps_militia_stage`, `pps_militia_name`, `akcja_socjalistyczna_formed` | Stage integer 1/2, display name and boolean-like flag; root starts `1`, `Milicja PPS`, `0` | PPS self-defence card writes during one-time reorganization; status, Library and conflict narrative read | Identity of one continuous PPS organization; persistent simulation state | Reorganization preserves strength and cannot repeat | Implemented. Stage 2 is Akcja Socjalistyczna; it is not the Iron Front. |
| `pps_militia_strength` | Numeric active organized members; root starts `200` | Organization/adviser/conflict actions write; rally, coup and civil-war calculations read | PPS self-defence capacity; persistent simulation state | Nonnegative; represents approximate active organized membership, not thousands | Implemented user-approved opening value. |
| `pps_militia_militancy` | Numeric readiness/force multiplier; root starts `0.10` | Training, reorganization and conflict actions write; force calculations and `militancy` qdisplay read | PPS self-defence effectiveness; persistent simulation state | Nonnegative; AS reorganization adds `0.10` | Implemented; exact balance is a conservative provisional value. |
| `pps_militia_banned`, `pps_militia_repressed` | Number used as booleans; root starts `0`/`0` | Status/Library currently read; no Polish repression writer yet | Legal/repression state; persistent simulation state | The organization is initially legal and not repressed | Implemented opening state; later repression mechanics remain planned. |
| `pps_militia_union_cooperation` | Boolean-like number; root starts `0` | Militia card establishes cooperation; street-conflict training and status read; union independence clears | Coordination with affiliated unions | Cooperation adds readiness, never strength or union manpower | Implemented. |
| `pps_militia_opponents` | Array of `nationalist_militias`, `communist_militias`, `state_police` | Root initializes; documentation/tests read | Approved opponent categories | Current opponent numbers remain inherited German compatibility fields | Implemented classification; Polish opponent model remains planned. |
| `rb_strength`, `rb_militancy`, `rb_*_compat_base` | Shadow legacy values initialized from semantic militia state | Unadapted German calculations may write; `post_event` transfers deltas once and resynchronizes | Temporary compatibility only | Must not be displayed as a second organization | Retained for inherited content; not canonical PPS state. |
| `sh_strength`, `sa_strength`, `rfb_strength` and corresponding militancy/ban fields | Inherited numeric opponent state | Existing violence scenes write/read | Temporary nationalist/communist opponent calculations | German identities and scales are not Polish equivalents | Retained pending bounded opponent replacement. |
| `interior_police_loyalty`, `prussian_police_loyalty`, `reichswehr_loyalty` | Fractions; root: 0.45/0.5/0.2 | Police/military/institution events write; coup/conflict calculations and `loyalty` qdisplay read | Institutional response and violence; persistent simulation state | Qdisplay ranges from completely disloyal `<=0.06` to completely loyal `>=0.95` | TBD — user decision required. |
| `prussian_police_strength`, `reichswehr_strength`, `prussian_police_militancy`, `reichswehr_militancy` and interior equivalents | Numeric force inputs initialized in root | Institution cards/events write; conflict code derives power; strength/militancy labels may display | Coup/civil-war balance; persistent simulation state | Different units are multiplied/combined; no common scale is evidenced | TBD — user decision required. |
| `rb_power`, `sh_power`, `sa_power`, `rfb_power`, `prussian_police_power`, `loyal_reichswehr_power`, `hostile_reichswehr_power`, `enemy_power`, `total_power` | Derived numeric helpers created in conflict scenes | `civil_war` and related event code writes/reads; outcome narrative uses results | Violence resolution; temporary derived state persisted in saves | Must be recomputed after changing any strength/militancy/loyalty input | TBD — user decision required. |
| `civil_war_seen`, `coup_victory`, `republic_victory`, `total_defeat`, `long_war`, `resist_coup` | Number used as route/outcome flags; created in terminal event paths | Coup/civil-war events and `game_over` write/read; ending is player-facing | Terminal outcomes and achievements; persistent event/ending state | Multiple flags may coexist unless route logic prevents it | TBD — user decision required. |

## Event scheduling and flags

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `*_seen` | Number used as boolean; some initialized in root, many created by their event | Corresponding event writes and `view-if` reads; narrative/event availability reveals state | One-time event scheduling; persistent event flags | Naming convention is broad but not universal; should pair with `max-visits` review | TBD — user decision required. |
| `has_event` | Number used as boolean/helper; initialized/assigned around event selection | `post_event` flow writes/reads; no direct display | Route control; temporary control state | Exact role alongside tag eligibility is not fully explicit | TBD — user decision required. |
| `black_thursday_seen`, `banking_crisis_seen`, `emergency_cuts_seen`, `presidential_election_seen`, `prussian_coup_seen`, `march_on_berlin_seen` | Boolean-like event flags; event-created or root-initialized depending on flag | Named event files write; related events/cards/endings read | Major chronology/consequence chains; persistent event flags | Several lack explicit root initialization and rely on false/zero default | TBD — user decision required. |
| Progress/phase controls such as `round`, `election_round`, `candidate`, `winner`, `winner_votes`, `winner_desc` | Mixed number/string; initialized within election event routes | Presidential-election code writes/reads and displays | Multi-round presidential election; temporary event control persisted in saves | Dynamic candidate keys are case-sensitive; restarting/resuming mid-event must retain them | TBD — user decision required. |

## Achievements and endings

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `game_over` | Number used as boolean; set in `source/scenes/game_over.scene.dry` | Terminal events/game-over flow write/read; final UI uses game-over scene state | Campaign termination; persistent control state | Must only become true on a terminal route | TBD — user decision required. |
| `achievement_*` | Number used as cross-play achievement state; handled in game-over/achievement logic | `game_over` writes/reads; achievements menu displays | Persistent unlocks across plays | Names are save/public identifiers; rename risks losing unlocks | TBD — user decision required. |
| `game_achievement_*` | Number used as current-play achievement state | `game_over` calculates; ending/achievement display reads | Per-play summary and global unlock assignment | Must remain paired with intended `achievement_*` key | TBD — user decision required. |
| Outcome flags (`hitler_deported`, `deportation_success`, `eu`, `constitutional_reform`, `united_front_success`, and many others) | Usually boolean or progress numbers, initialized in root or relevant path | Policy/event writers; `game_over` ending and achievement predicates read | Ending selection and achievements; persistent simulation/event state | Full meaning is condition-specific; consult exact ending predicate before changing | TBD — user decision required. |

## UI and display-support state

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `*_display`, `*_disp`, `str_change_*` | Usually rounded number or string; generated by calculations | Election/support calculations write; scene interpolation/status reads | Presentation; derived display state persisted in saves | Suffixes are not interchangeable and rounding differs | TBD — user decision required. |
| `dissent_percent`, `pro_republic_disp` | Rounded/percent display helpers; generated from simulation values | `post_event`/relevant scenes write; status/narrative read | Player-facing presentation | Can become stale if raw value changes outside recomputation | TBD — user decision required. |
| `pinnedCardsDescription` | String/HTML-like runtime support state initialized in root | Browser hand UI reads; no gameplay formula confirmed | Pinned-card presentation; persistent UI-support state | Runtime coupling is outside ordinary Dendry conditions | TBD — user decision required. |
| `mods_table` | Runtime/configuration data referenced by mod UI | Root/runtime mod loader interaction; browser-facing | Mod support; UI/runtime state | Network, schema, and trust behavior are untested | TBD — user decision required. |
| `election_records`, `party_support_records`, `economic_records` | Arrays of dated objects; initialized empty in root | Election/post-event writers; D3 readers | Charts and save size; persistent display-support state | Object schema and party IDs must match `library` figure code | TBD — user decision required. |

## Variables whose purpose is unclear or inconsistent

The following findings are evidence for follow-up, not instructions to delete or
rename anything.

### Appear written but not read literally

Dynamic and runtime reads were excluded where identifiable. These keys still
appear to lack a confirmed source reader:

- `advisor_action_time` appears in source alongside the active
  `advisor_action_timer` convention.
- `DNVP_relation` and `NSDAP_relation` are initialized, while later conditions
  use `dnvp_relation` and `nsdap_relation`.
- `kpd_leader` and `z_leader` coexist with actively used
  `kpd_party_leader` and `z_party_leader`.
- `hindenburg_relation` and `hindenburg_enabled` have initialization evidence
  but no confirmed active mechanical reader in the compiled source.
- `workers_qol`, `rural_qol`, `unemployed_qol`, `old_middle_qol`,
  `new_middle_qol`, `bourgeois_landowners_qol`, and
  `national_minorities_qol` are explicitly described in source as currently
  unused.
- Some named minister fields appear to be written for narrative completeness
  while access checks use only `<ministry>_minister_party`.
- Flags including `harzburg_front_seen`, `muller_died_in_office`, and
  `panzerkreuzer_b_funded` require a targeted route/runtime check before any
  conclusion.

For every item above: **UNCLEAR — requires code investigation or runtime
testing.**

### Appear read without explicit root initialization

Many event flags are intentionally created only when their route occurs. The
following high-impact examples are read without a confirmed explicit
`root.start` value and therefore rely on absent-as-false behavior or earlier
route assignment:

- Timers: `party_disunity_timer`, `dealing_with_toleration_timer`,
  `constitutional_reform_timer`, `labor_rights_timer`,
  `education_science_timer`, and `curriculum_timer`.
- Policy/control values: `peoples_party`, `strife`, `spd_caretaker`,
  `progressive_coalition`, `works_councils`, `rural_policy`, and `workers_aid`.
- Event flags: `black_thursday_seen`, `banking_crisis_seen`,
  `austrian_civil_war_seen`, and numerous other route-specific `_seen` keys.
- Dynamic families: SAPD class propensities and display fields before/after the
  party is added; candidate bonus/running/vote keys for candidates not selected;
  `<party>_banned` for parties other than the two explicit ban flags.

This may be deliberate Dendry style, but embedded JavaScript accesses should
be checked independently. **UNCLEAR — requires code investigation or runtime
testing.**

### Similar or confusing names

| Names | Risk |
| --- | --- |
| `DNVP_relation` / `dnvp_relation`; `NSDAP_relation` / `nsdap_relation` | JavaScript state keys are case-sensitive; initialization and readers may not meet. |
| `Hitler_votes` / `hitler_votes`; `Braun_running` / `braun_campaign` and other candidate capitalization variants | Presidential-election dynamic keys use capitalized candidate names while party/election keys are lower-case. |
| `streseman_dead` / `stresemann_dead` | Spelling variants may represent separate flags. |
| `reformists_resign` / `reformists_resigned` | Two near-identical faction consequence flags. |
| `advisor_action_time` / `advisor_action_timer` | Only the `_timer` name fits the central timer convention. |
| `unemployed` / `unemployment` | One is the main economic/demographic value; some scenes read the other. |
| `workers_other` / `workers_others` | Singular/plural raw-support names. |
| `moderate_economic_plan` / `moderate_plan_adopted` | Potentially overlapping plan-state meanings. |
| `hoover_memorandum_seen` / `hoover_moratorium_seen` | Similar event spelling with different words. |
| `reparations_negotiation` / `reparations_negotiations` | Singular/plural state split. |
| `center_dissent` / `centrist_dissent` | Faction field versus apparently separate similarly named value. |
| `month_actions` / `month_activities` | The former drives time; the latter's lifecycle is not equally clear. |
| `democratization` / `democratization-2`; `pacifism` / `pacifism-2` | Hyphenated identifiers appear in compiled expressions and may be parsed as quality names rather than subtraction as intended. |

### Highest-risk shared variables

1. `time`, `year`, `month`, `month_actions`, `timers`, and all `*_timer` keys.
2. `classes`, `parties`, every dynamic class-party field, and normalized vote
   families.
3. `factions`, faction strength/dissent, `dissent`, and `dissent_percent`.
4. Party result, prior result, change, coalition total, and government flag
   families.
5. `budget`, `unemployed`, `inflation`, `economic_growth`, program-stage fields,
   `capital_strike_progress`, and `coup_progress`.
6. Organization strength/militancy, institutional loyalty, and derived power
   helpers.
7. `chancellor`, `president`, ministry ownership, and constitutional flags.
8. Achievement, ending, and save-visible identifiers.

## Appendix: complete expanded state-key index

This appendix lists the original 989 literal or concretely constructible `Q`
keys found by the audit, followed by the 58 population-model additions.
Constructible entries are included because loops can access them even when no
explicit assignment exists. Alphabetization inside each block is
case-insensitive; case variants remain separate exact keys.

<!-- COMPLETE_VARIABLE_INDEX -->
`abortion`, `abortion_rights`, `achievement_anders_als_die_andern`, `achievement_arbeiter_von_wien`, `achievement_ausnahmezustand`, `achievement_bauernrevolution`, `achievement_bollwerk_der_demokratie`, `achievement_bruder_zur_sonne`
`achievement_bundesrepublik`, `achievement_civil_war`, `achievement_constitutional_coalition`, `achievement_deport_hitler`, `achievement_die_rote_fahne`, `achievement_drei_pfeile`, `achievement_einheitsfront`, `achievement_einheitsfront_2`
`achievement_einigkeit`, `achievement_einigkeit_und_recht`, `achievement_einigkeit_und_recht_und_freiheit`, `achievement_eiserne_front`, `achievement_equality`, `achievement_eu`, `achievement_freie_marktwirtschaft`, `achievement_game_completed`
`achievement_grosse_volksfront`, `achievement_grosse_volkspartei`, `achievement_heidelberger_programm`, `achievement_hirschfeld`, `achievement_katholischer_sozialismus`, `achievement_klassenkampf`, `achievement_majority_party`, `achievement_minderheitsregierung`
`achievement_panik_im_mittelstand`, `achievement_polykrise`, `achievement_raterepublik`, `achievement_red_tzar_of_prussia`, `achievement_republik_der_wissenschaft`, `achievement_rote_millionar`, `achievement_schwarz_rot_gold`, `achievement_sohn_seiner_klasse`
`achievement_stolperstein`, `achievement_syndikalismus`, `achievement_verfassungsreform`, `achievement_versohnler`, `achievement_victory_for_the_republic`, `achievement_volksfront`, `achievement_volksfront_2`, `achievement_volkspartei`
`achievement_wahlrechts`, `achievement_weimar_coalition`, `achievement_wirtschaftsexperiment`, `achievement_wirtschaftspolitik`, `achievement_wirtschaftswunder`, `achievement_women_reichsbanner`, `achievement_zeppelin_kapitan`, `Adenauer_bonus`
`adenauer_drops_out`, `Adenauer_running`, `Adenauer_votes`, `Adenauer_votes_disp`, `advisor_action_time`, `advisor_action_timer`, `agricultural_finance`, `agricultural_policy`
`agricultural_policy_timer`, `agriculture_goal`, `agriculture_goal_completed`, `agriculture_minister`, `agriculture_minister_party`, `anti_democratic_coalition`, `any_majority`, `applied_research`
`aufhauser_advisor`, `austerity`, `austria_civil_war`, `austria_defeat`, `austria_peace`, `austria_relation`, `austria_victory`, `austrian_civil_war_seen`
`austrian_parliament_seen`, `baade_advisor`, `banking_crisis_seen`, `banking_crisis_timer`, `black_thursday_seen`, `blutmai`, `bourgeois_coalition`, `braun_advisor`
`Braun_bonus`, `braun_campaign`, `braun_majority`, `braun_plurality`, `Braun_running`, `braun_votes`, `Braun_votes`, `braun_votes_disp`
`Braun_votes_disp`, `breitscheid_advisor`, `budget`, `bureaucratic_reform`, `campaign_media`, `candidate`, `capital_strike_progress`, `capital_strike_seen`
`catholics`, `catholics_ddp`, `catholics_ddp_display`, `catholics_ddp_normalized`, `catholics_dnvp`, `catholics_dnvp_display`, `catholics_dnvp_normalized`, `catholics_dvp`
`catholics_dvp_display`, `catholics_dvp_normalized`, `catholics_kpd`, `catholics_kpd_display`, `catholics_kpd_normalized`, `catholics_nsdap`, `catholics_nsdap_display`, `catholics_nsdap_normalized`
`catholics_other`, `catholics_other_display`, `catholics_other_normalized`, `catholics_sapd`, `catholics_sapd_display`, `catholics_sapd_normalized`, `catholics_spd`, `catholics_spd_display`
`catholics_spd_normalized`, `catholics_z`, `catholics_z_display`, `catholics_z_normalized`, `center_dissent`, `center_right_coalition`, `center_strength`, `centrist_dissent`
`centrists_resign`, `chancellor`, `chancellor_party`, `change_ddp_r`, `change_dnvp_r`, `change_dvp_r`, `change_kpd_r`, `change_nsdap_r`
`change_other_r`, `change_sapd_r`, `change_sex`, `change_spd_r`, `change_z_r`, `changed`, `civil_war_seen`, `classes`
`coalition_affairs_timer`, `coalition_dissent`, `comintern_seen`, `commercialized_media`, `communist_coalition`, `confronting_antisemitism`, `confronting_nazis_seen`, `confronting_nazis_timer`
`constitutional_crisis`, `constitutional_protection`, `constitutional_reform`, `constitutional_reform_timer`, `constructive_vonc`, `cooperatives`, `coup_progress`, `coup_victory`
`crisis_program_timer`, `crisis_urgency`, `crispien_advisor`, `cultural_organizations`, `curriculum_timer`, `customs_union`, `customs_union_seen`, `ddp_banned`
`ddp_candidate`, `ddp_dstp_seen`, `ddp_in_government`, `ddp_name`, `ddp_normalized`, `ddp_r`, `ddp_r_disp`, `ddp_relation`
`ddp_support`, `ddp_votes`, `ddp_votes_dec`, `ddp_votes_disp`, `ddp_votes_display`, `dealing_with_toleration_timer`, `defense_strength`, `democratization`
`democratization-2`, `deportation_success`, `difficulty`, `dissent`, `dissent_percent`, `dnvp_banned`, `dnvp_candidate`, `dnvp_in_government`
`dnvp_normalized`, `dnvp_r`, `dnvp_r_disp`, `dnvp_relation`, `DNVP_relation`, `dnvp_support`, `dnvp_votes`, `dnvp_votes_dec`
`dnvp_votes_disp`, `dnvp_votes_display`, `domestic_enemies_timer`, `dues`, `dvp_banned`, `dvp_candidate`, `dvp_in_government`, `dvp_no_confidence`
`dvp_normalized`, `dvp_r`, `dvp_r_disp`, `dvp_relation`, `dvp_support`, `dvp_support_braun`, `dvp_votes`, `dvp_votes_dec`
`dvp_votes_disp`, `dvp_votes_display`, `east_aid`, `east_relation`, `Eckener_bonus`, `Eckener_running`, `Eckener_votes`, `Eckener_votes_disp`
`economic_democracy`, `economic_democracy_timer`, `economic_expansion`, `economic_growth`, `economic_growth_2`, `economic_minister`, `economic_minister_party`, `economic_plan`
`economic_policy_timer`, `economic_records`, `economy_goal`, `economy_goal_completed`, `education_science`, `education_science_timer`, `Einstein_bonus`, `Einstein_running`
`Einstein_votes`, `Einstein_votes_disp`, `election_records`, `election_round`, `electoral_threshold`, `emergency_cuts_seen`, `emergency_cuts_timer`, `emergency_rule`
`enemies`, `enemies_timer`, `enemy_power`, `enemy_strength`, `eu`, `eu_austria`, `eu_progress`, `factions`
`factory_takeovers`, `family_law`, `far_right_coalition`, `finance_goal`, `finance_goal_completed`, `finance_minister`, `finance_minister_party`, `fiscal_policy_timer`
`foreign_goal`, `foreign_goal_completed`, `foreign_minister`, `foreign_minister_party`, `foreign_policy_timer`, `funded_reichsbanner`, `fundraising_timer`, `game_achievement_anders_als_die_andern`
`game_achievement_arbeiter_von_wien`, `game_achievement_ausnahmezustand`, `game_achievement_bauernrevolution`, `game_achievement_bollwerk_der_demokratie`, `game_achievement_bruder_zur_sonne`, `game_achievement_bundesrepublik`, `game_achievement_civil_war`, `game_achievement_constitutional_coalition`
`game_achievement_deport_hitler`, `game_achievement_die_rote_fahne`, `game_achievement_drei_pfeile`, `game_achievement_einheitsfront`, `game_achievement_einheitsfront_2`, `game_achievement_einigkeit`, `game_achievement_einigkeit_und_recht`, `game_achievement_einigkeit_und_recht_und_freiheit`
`game_achievement_eiserne_front`, `game_achievement_equality`, `game_achievement_eu`, `game_achievement_freie_marktwirtschaft`, `game_achievement_grosse_volksfront`, `game_achievement_grosse_volkspartei`, `game_achievement_heidelberger_programm`, `game_achievement_hirschfeld`
`game_achievement_katholischer_sozialismus`, `game_achievement_klassenkampf`, `game_achievement_majority_party`, `game_achievement_minderheitsregierung`, `game_achievement_panik_im_mittelstand`, `game_achievement_polykrise`, `game_achievement_raterepublik`, `game_achievement_red_tzar_of_prussia`
`game_achievement_republik_der_wissenschaft`, `game_achievement_rote_millionar`, `game_achievement_schwarz_rot_gold`, `game_achievement_sohn_seiner_klasse`, `game_achievement_stolperstein`, `game_achievement_syndikalismus`, `game_achievement_verfassungsreform`, `game_achievement_versohnler`
`game_achievement_victory_for_the_republic`, `game_achievement_volksfront`, `game_achievement_volksfront_2`, `game_achievement_volkspartei`, `game_achievement_wahlrechts`, `game_achievement_weimar_coalition`, `game_achievement_wirtschaftsexperiment`, `game_achievement_wirtschaftspolitik`
`game_achievement_wirtschaftswunder`, `game_achievement_women_reichsbanner`, `game_achievement_zeppelin_kapitan`, `game_over`, `Gessler_bonus`, `gessler_drops_out`, `Gessler_running`, `Gessler_votes`
`Gessler_votes_disp`, `Goring_bonus`, `Goring_running`, `Goring_votes`, `Goring_votes_disp`, `grand_coalition`, `grand_coalition_failed`, `harzburg_front_seen`
`has_event`, `has_majority`, `high_inflation_timer`, `hilferding_advisor`, `hindenburg_dead`, `hindenburg_enabled`, `hindenburg_majority`, `hindenburg_plurality`
`hindenburg_relation`, `hindenburg_to_braun_bonus`, `hindenburg_votes`, `hindenburg_votes_disp`, `hirschfeld_advisor`, `historical_mode`, `Hitler_bonus`, `hitler_deported`
`hitler_majority`, `hitler_plurality`, `hitler_right_coalition`, `Hitler_running`, `hitler_support_hindenburg`, `hitler_votes`, `Hitler_votes`, `hitler_votes_disp`
`Hitler_votes_disp`, `homosexual_rights`, `homosexual_rights_timer`, `hoover_memorandum_seen`, `hoover_moratorium_seen`, `hostile_reichswehr_power`, `ideology`, `ideology_timer`
`in_election`, `in_emergency_government`, `in_grand_coalition`, `in_left_front`, `in_minority_government`, `in_popular_front`, `in_right_coalition`, `in_spd_majority`
`in_unity_government`, `in_weimar_coalition`, `income`, `inflation`, `inflation_2`, `inter_party_relationships_timer`, `interior_goal`, `interior_goal_completed`
`interior_minister`, `interior_minister_party`, `interior_police_loyalty`, `interior_police_militancy`, `interior_police_strength`, `international_relations_timer`, `investigate_corruption`, `investigate_far_right`
`iron_front_formed`, `iron_front_timer`, `is_cultural_candidate`, `is_favorable`, `is_unity_candidate`, `juchacz_advisor`, `Juchacz_bonus`, `Juchacz_running`
`Juchacz_votes`, `Juchacz_votes_disp`, `judicial_reform`, `judiciary_timer`, `justice_minister`, `justice_minister_party`, `kellogg_briand_seen`, `kellogg_briand_signed`
`kpd_appeal_seen`, `kpd_banned`, `kpd_candidate`, `kpd_coalition_dissent`, `kpd_coalition_success`, `kpd_cooperation_seen`, `kpd_foreign_seen`, `kpd_goals_completed`
`kpd_goals_seen`, `kpd_in_government`, `kpd_influence`, `kpd_inter_party_seen`, `kpd_labor_support`, `kpd_leader`, `kpd_no_confidence`, `kpd_normalized`
`kpd_party_conference_seen`, `kpd_party_leader`, `kpd_policy_timer`, `kpd_r`, `kpd_r_disp`, `kpd_rectified_history`, `kpd_relation`, `kpd_score`
`kpd_support`, `kpd_support_braun`, `kpd_truce`, `kpd_ultimatum_seen`, `kpd_ultimatum_timer`, `kpd_votes`, `kpd_votes_dec`, `kpd_votes_disp`
`kpd_votes_display`, `kwg_research`, `labor_affairs_seen`, `labor_affairs_timer`, `labor_dissent`, `labor_goal`, `labor_goal_completed`, `labor_minister`
`labor_minister_party`, `labor_rights_timer`, `labor_strength`, `land_reform`, `largest_party`, `last_advisor_action`, `last_cabinet_action`, `leber_advisor`
`left_coalition`, `left_dissent`, `left_split`, `left_strength`, `leipart_advisor`, `leverage`, `levi_advisor`, `levi_dead`
`london_economic_conference_seen`, `long_war`, `lower_tax_rates`, `loyal_reichswehr_power`, `major_curriculum`, `Mann_bonus`, `Mann_running`, `Mann_votes`
`Mann_votes_disp`, `march_on_berlin_seen`, `march_on_berlin_timer`, `media_timer`, `medical_research`, `mierendorff_advisor`, `military_policy_timer`, `military_reform`
`minor_curriculum`, `minority_government`, `moderate_economic_plan`, `moderate_plan_adopted`, `moderate_plan_progress`, `moderate_plan_support`, `mods_table`, `month`
`month_actions`, `month_activities`, `muller_advisor`, `muller_dead`, `muller_died_in_office`, `Munzenberg_bonus`, `Munzenberg_running`, `Munzenberg_votes`
`Munzenberg_votes_disp`, `n_advisors`, `n_elections`, `n_rfb_banned`, `n_rfb_persecuted`, `nationalism`, `nationalism_disp`, `nationalization_adopted`
`nationalization_progress`, `nationalization_support`, `nationalize_budget`, `nazi_urgency`, `neo_weimar_coalition`, `neorevisionism`, `neorevisionist_dissent`, `neorevisionist_strength`
`new_middle`, `new_middle_ddp`, `new_middle_ddp_display`, `new_middle_ddp_normalized`, `new_middle_dnvp`, `new_middle_dnvp_display`, `new_middle_dnvp_normalized`, `new_middle_dvp`
`new_middle_dvp_display`, `new_middle_dvp_normalized`, `new_middle_kpd`, `new_middle_kpd_display`, `new_middle_kpd_normalized`, `new_middle_nsdap`, `new_middle_nsdap_display`, `new_middle_nsdap_normalized`
`new_middle_other`, `new_middle_other_display`, `new_middle_other_normalized`, `new_middle_qol`, `new_middle_sapd`, `new_middle_sapd_display`, `new_middle_sapd_normalized`, `new_middle_spd`
`new_middle_spd_display`, `new_middle_spd_normalized`, `new_middle_z`, `new_middle_z_display`, `new_middle_z_normalized`, `next_election_month`, `next_election_time`, `next_election_year`
`no_confidence_against_spd`, `no_confidence_succeeds`, `no_confidence_votes`, `no_majority_bruning_elections`, `no_majority_elections`, `no_majority_papen_elections`, `normalized_workers_kpd`, `normalized_workers_spd`
`normalized_workers_total`, `nsdap_banned`, `nsdap_candidate`, `nsdap_in_government`, `nsdap_leader`, `nsdap_normalized`, `nsdap_r`, `nsdap_r_disp`
`nsdap_relation`, `NSDAP_relation`, `nsdap_support`, `nsdap_votes`, `nsdap_votes_dec`, `nsdap_votes_disp`, `nsdap_votes_display`, `nsdap_workers`
`old_chancellor`, `old_ddp_r`, `old_demographics`, `old_dnvp_r`, `old_dvp_r`, `old_ideology`, `old_kpd_r`, `old_middle`
`old_middle_ddp`, `old_middle_ddp_display`, `old_middle_ddp_normalized`, `old_middle_dnvp`, `old_middle_dnvp_display`, `old_middle_dnvp_normalized`, `old_middle_dvp`, `old_middle_dvp_display`
`old_middle_dvp_normalized`, `old_middle_kpd`, `old_middle_kpd_display`, `old_middle_kpd_normalized`, `old_middle_nsdap`, `old_middle_nsdap_display`, `old_middle_nsdap_normalized`, `old_middle_other`
`old_middle_other_display`, `old_middle_other_normalized`, `old_middle_qol`, `old_middle_sapd`, `old_middle_sapd_display`, `old_middle_sapd_normalized`, `old_middle_spd`, `old_middle_spd_display`
`old_middle_spd_normalized`, `old_middle_z`, `old_middle_z_display`, `old_middle_z_normalized`, `old_nsdap_r`, `old_other_r`, `old_sapd_r`, `old_spd_r`
`old_z_r`, `Ossietzky_bonus`, `Ossietzky_running`, `Ossietzky_votes`, `Ossietzky_votes_disp`, `other_banned`, `other_candidate`, `other_no_confidence`
`other_normalized`, `other_r`, `other_r_disp`, `other_support`, `other_votes`, `other_votes_dec`, `other_votes_disp`, `other_votes_display`
`pacifism`, `pacifism-2`, `panzerkreuzer_b_funded`, `panzerkreuzer_b_seen`, `panzerkreuzer_failed`, `panzerkreuzer_funded`, `panzerkreuzer_seen`, `papen_chancellor_timer`
`papenomics_timer`, `parties`, `party_disunity_timer`, `party_organizations_timer`, `party_support_records`, `pass_threshold`, `peoples_party`, `peoples_party_support`
`peoples_party_timer`, `pfulf_advisor`, `pinnedCardsDescription`, `police_protect_success`, `police_timer`, `popular_front_coalition`, `popular_front_dispute_timer`, `popular_front_success`
`president`, `presidential_election_seen`, `presidential_powers`, `pro_consumer`, `pro_democracy_votes`, `pro_labor`, `pro_republic`, `pro_republic_disp`
`progressive_coalition`, `prussian_affairs_timer`, `prussian_concordat`, `prussian_concordat_progress`, `prussian_coup_seen`, `prussian_government`, `prussian_police_loyalty`, `prussian_police_militancy`
`prussian_police_power`, `prussian_police_strength`, `prussian_police_training`, `public_hs`, `radbruch_advisor`, `radicalization`, `radio`, `rally_timer`
`rb_banned`, `rb_exit`, `rb_investment`, `rb_militancy`, `rb_militarization_cost`, `rb_power`, `rb_stay`, `rb_strength`
`rb_strength_2`, `rb_success`, `rearmament_exposed`, `reform_support`, `reformed_183`, `reformist_dissent`, `reformist_strength`, `reformists_resign`
`reformists_resigned`, `reichsbanner_timer`, `reichskonkordat`, `reichskonkordat_progress`, `reichswehr_goal`, `reichswehr_goal_completed`, `reichswehr_loyalty`, `reichswehr_militancy`
`reichswehr_minister`, `reichswehr_minister_party`, `reichswehr_strength`, `reparations`, `reparations_negotiation`, `reparations_negotiations`, `repealed_175`, `republic_victory`
`resist_coup`, `resources`, `return_to_normalcy`, `rfb_banned`, `rfb_banned_prussia`, `rfb_militancy`, `rfb_power`, `rfb_strength`
`rfb_strength_2`, `right_coalition`, `rosenfeld_advisor`, `round`, `rural`, `rural_ddp`, `rural_ddp_display`, `rural_ddp_normalized`
`rural_dnvp`, `rural_dnvp_display`, `rural_dnvp_normalized`, `rural_dvp`, `rural_dvp_display`, `rural_dvp_normalized`, `rural_kpd`, `rural_kpd_display`
`rural_kpd_normalized`, `rural_nsdap`, `rural_nsdap_display`, `rural_nsdap_normalized`, `rural_other`, `rural_other_display`, `rural_other_normalized`, `rural_policy`
`rural_qol`, `rural_sapd`, `rural_sapd_display`, `rural_sapd_normalized`, `rural_sol`, `rural_spd`, `rural_spd_display`, `rural_spd_normalized`
`rural_z`, `rural_z_display`, `rural_z_normalized`, `sa_ban_timer`, `sa_banned`, `sa_banned_prussia`, `sa_militancy`, `sa_power`
`sa_strength`, `sa_strength_2`, `sapd_banned`, `sapd_candidate`, `sapd_formed`, `sapd_normalized`, `sapd_r`, `sapd_r_disp`
`sapd_support`, `sapd_votes`, `sapd_votes_dec`, `sapd_votes_disp`, `sapd_votes_display`, `schleicher_support`, `schleichers_scheme_success`, `schleichers_schemes_timer`
`school_boards`, `schumacher_advisor`, `Schumacher_bonus`, `Schumacher_running`, `Schumacher_votes`, `Schumacher_votes_disp`, `science`, `science_bonus`
`science_funding`, `sdapo_strength`, `secularized`, `Seldte_bonus`, `Seldte_running`, `Seldte_votes`, `Seldte_votes_disp`, `sender_advisor`
`severing_advisor`, `seydewitz_advisor`, `sh_ban_timer`, `sh_banned`, `sh_banned_prussia`, `sh_militancy`, `sh_power`, `sh_strength`
`sh_strength_2`, `shuffle_cabinet_timer`, `shuffle_leadership_timer`, `siemsen_advisor`, `social_welfare_timer`, `socialism`, `socialism_disp`, `socializations`
`soviet_aid`, `soviet_relation`, `spd_banned`, `spd_candidate`, `spd_caretaker`, `spd_in_government`, `spd_militancy`, `spd_no_confidence`
`spd_normalized`, `spd_prussia`, `spd_r`, `spd_r_disp`, `spd_support`, `spd_support_thalmann`, `spd_toleration`, `spd_votes`
`spd_votes_dec`, `spd_votes_disp`, `spd_votes_display`, `stampfer_advisor`, `started`, `state_buyer`, `str_change_ddp`, `str_change_dnvp`
`str_change_dvp`, `str_change_kpd`, `str_change_nsdap`, `str_change_other`, `str_change_sapd`, `str_change_spd`, `str_change_z`, `streetfighting_timer`
`streseman_dead`, `stresemann_dead`, `strife`, `strike_term_seen`, `tariffs`, `Thalmann_bonus`, `thalmann_majority`, `thalmann_plurality`
`Thalmann_running`, `thalmann_to_braun_bonus`, `thalmann_votes`, `Thalmann_votes`, `thalmann_votes_disp`, `Thalmann_votes_disp`, `time`, `time_to_election`
`timers`, `total_defeat`, `total_power`, `trans_rights`, `tried_supporting_kpd`, `understanding_enemy_seen`, `understanding_enemy_timer`, `unemployed`
`unemployed_2`, `unemployed_ddp`, `unemployed_ddp_display`, `unemployed_ddp_normalized`, `unemployed_dnvp`, `unemployed_dnvp_display`, `unemployed_dnvp_normalized`, `unemployed_dvp`
`unemployed_dvp_display`, `unemployed_dvp_normalized`, `unemployed_kpd`, `unemployed_kpd_display`, `unemployed_kpd_normalized`, `unemployed_nsdap`, `unemployed_nsdap_display`, `unemployed_nsdap_normalized`
`unemployed_other`, `unemployed_other_display`, `unemployed_other_normalized`, `unemployed_qol`, `unemployed_sapd`, `unemployed_sapd_display`, `unemployed_sapd_normalized`, `unemployed_spd`
`unemployed_spd_display`, `unemployed_spd_normalized`, `unemployed_z`, `unemployed_z_display`, `unemployed_z_normalized`, `unemployment`, `unemployment_insurance_crisis`, `unemployment_insurance_seen`
`unemployment_insurance_threshold`, `unemployment_insurance_timer`, `unions_independent`, `united_front_coalition`, `united_front_success`, `upper_tax_rates`, `use_decimals`, `war_choices`
`war_guilt`, `war_guilt_timer`, `weimar_coalition`, `welfare`, `welfare_goal`, `welfare_goal_completed`, `wels_advisor`, `weltbuhne_conclusion`
`weltbuhne_dropped`, `weltbuhne_seen`, `west_aid`, `west_relation`, `winner`, `winner_desc`, `winner_votes`, `winner_votes_disp`
`wissell_advisor`, `wittorf_affair_seen`, `wittorf_secret`, `wittorf_soviet_union`, `women_in_rb`, `womens_rights`, `womens_rights_timer`, `womens_work`
`workers`, `workers_aid`, `workers_ddp`, `workers_ddp_display`, `workers_ddp_normalized`, `workers_dnvp`, `workers_dnvp_display`, `workers_dnvp_normalized`
`workers_dvp`, `workers_dvp_display`, `workers_dvp_normalized`, `workers_kpd`, `workers_kpd_display`, `workers_kpd_normalized`, `workers_nsdap`, `workers_nsdap_display`
`workers_nsdap_normalized`, `workers_other`, `workers_other_display`, `workers_other_normalized`, `workers_others`, `workers_qol`, `workers_safety`, `workers_sapd`
`workers_sapd_display`, `workers_sapd_normalized`, `workers_sol`, `workers_spd`, `workers_spd_display`, `workers_spd_normalized`, `workers_z`, `workers_z_display`
`workers_z_normalized`, `working_hours`, `works_councils`, `works_program`, `woytinsky_advisor`, `wtb_adopted`, `wtb_budget`, `wtb_implemented`
`wtb_support`, `year`, `young_plan_seen`, `young_socialists`, `z_banned`, `z_candidate`, `z_in_government`, `z_leader`
`z_minus_bvp_r`, `z_no_confidence`, `z_normalized`, `z_party_leader`, `z_r`, `z_r_disp`, `z_relation`, `z_support`
`z_support_braun`, `z_votes`, `z_votes_dec`, `z_votes_disp`, `z_votes_display`

### Population-model additions

`bourgeois_landowners`, `bourgeois_landowners_ddp`, `bourgeois_landowners_ddp_display`, `bourgeois_landowners_ddp_normalized`, `bourgeois_landowners_dnvp`, `bourgeois_landowners_dnvp_display`, `bourgeois_landowners_dnvp_normalized`, `bourgeois_landowners_dvp`
`bourgeois_landowners_dvp_display`, `bourgeois_landowners_dvp_normalized`, `bourgeois_landowners_kpd`, `bourgeois_landowners_kpd_display`, `bourgeois_landowners_kpd_normalized`, `bourgeois_landowners_nsdap`, `bourgeois_landowners_nsdap_display`, `bourgeois_landowners_nsdap_normalized`
`bourgeois_landowners_other`, `bourgeois_landowners_other_display`, `bourgeois_landowners_other_normalized`, `bourgeois_landowners_qol`, `bourgeois_landowners_sapd`, `bourgeois_landowners_sapd_display`, `bourgeois_landowners_sapd_normalized`, `bourgeois_landowners_spd`
`bourgeois_landowners_spd_display`, `bourgeois_landowners_spd_normalized`, `bourgeois_landowners_z`, `bourgeois_landowners_z_display`, `bourgeois_landowners_z_normalized`
`national_minorities`, `national_minorities_ddp`, `national_minorities_ddp_display`, `national_minorities_ddp_normalized`, `national_minorities_dnvp`, `national_minorities_dnvp_display`, `national_minorities_dnvp_normalized`, `national_minorities_dvp`
`national_minorities_dvp_display`, `national_minorities_dvp_normalized`, `national_minorities_kpd`, `national_minorities_kpd_display`, `national_minorities_kpd_normalized`, `national_minorities_nsdap`, `national_minorities_nsdap_display`, `national_minorities_nsdap_normalized`
`national_minorities_other`, `national_minorities_other_display`, `national_minorities_other_normalized`, `national_minorities_qol`, `national_minorities_sapd`, `national_minorities_sapd_display`, `national_minorities_sapd_normalized`, `national_minorities_spd`
`national_minorities_spd_display`, `national_minorities_spd_normalized`, `national_minorities_z`, `national_minorities_z_display`, `national_minorities_z_normalized`

## Dynamic-family provenance

The expanded keys above come from these source constructs:

- Active support groups: `workers`, `old_middle`, `new_middle`, `rural`,
  `bourgeois_landowners`, `unemployed`, and `national_minorities` from
  `source/scenes/root.scene.dry`. `catholics` remains only as compatibility
  state feeding `national_minorities_*`.
- Parties: `spd`, `kpd`, `z`, `ddp`, `dvp`, `dnvp`, `nsdap`, `other`, plus
  `sapd` added by `source/scenes/events/sapd_formed.scene.dry`.
- Class-party families: raw, `_normalized`, and `_display`, constructed in
  `source/scenes/post_event.scene.dry`,
  `source/scenes/election_algorithm.scene.dry`, and
  `source/scenes/game_over.scene.dry`.
- Party-result families: `_support`, `_normalized`, `_votes`, `_votes_display`,
  `_votes_dec`, `_votes_disp`, `_r`, `_r_disp`, `old_*_r`, `change_*_r`,
  `str_change_*`, `_candidate`, and `_banned`, constructed in support/election
  and presidential-election code.
- Timer family: every base in `Q.timers` plus `_timer`, decremented by
  `source/scenes/post_event.scene.dry`.
- Presidential candidates: capitalized candidate names combined with `_running`,
  `_bonus`, `_votes`, and `_votes_disp` in
  `source/scenes/events/death_of_hindenburg_president.scene.dry`.
