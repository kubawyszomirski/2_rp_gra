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

### Source entry SU-1922-AUGUST-COMPOSITION

- **Source ID:** SU-1922-AUGUST-COMPOSITION
- **Claim or game element supported:** Dated outgoing Legislative Sejm
  composition for comparison with the game's opening parliamentary projection.
- **Category:** elections and parliamentary composition
- **Relevant date or period:** August 1922, before the November election;
  not a verified January 1922 opening roster.
- **Full citation:** Contentplus.pl, "Struktura polityczna Sejmu Ustawodawczego
  w latach 1919–1922", in ZPE, "Na drodze ku stabilizacji. Sejm Ustawodawczy
  1919–1922 i uchwalenie małej konstytucji", section "Schemat", undated;
  based on Piotr A. Tusiński, *Sejm Ustawodawczy Rzeczypospolitej Polskiej
  1919–1922*, Warszawa 2019. The underlying book was not inspected.
- **Author:** Contentplus.pl, using Tusiński's data.
- **Publication:** Zintegrowana Platforma Edukacyjna (ZPE).
- **Page number:** HTML timeline entry "Sierpień 1922".
- **URL or archive location:** https://zpe.gov.pl/a/schemat/D7Hnd95fX
- **Date accessed:** 2026-09-02
- **Primary or secondary source:** Secondary educational compilation.
- **Exact evidence or notes:** August total: 432. Selected club counts:

  | Source grouping | Deputies |
  | --- | ---: |
  | Communist parliamentary faction | 2 |
  | Socialist parliamentary group (PPS) | 34 |
  | National workers' group, labelled NZR by ZPE | 21 |
  | PSL Wyzwolenie | 24 |
  | PSL Piast | 96 |
  | Narodowo-Chrześcijański Klub Robotniczy | 26 |
  | ZLN | 81 |
  | Jewish deputies | 10 |
  | German deputies | 7 |

- **Confidence:** Medium-high for this dated secondary-source snapshot;
  exact January membership and party-to-club mappings need further research.
- **Conflicting sources:** ZPE's national-workers label is NZR, whereas the
  [July 1922 table on Polish Wikipedia](https://pl.wikipedia.org/wiki/Sejm_Ustawodawczy_(1919%E2%80%931922))
  labels the 21-member group NPR. That table contains incorrect percentages,
  including 10.4% beside 34 socialist deputies; calculate shares independently.
  ZPE separately reports 431 deputies in November, with changed club sizes.
  Do not combine those dates or treat either as the January roster.
- **Intended gameplay use:** Evidence behind the approved opening approximation;
  see `OPENING-1922-DESIGN`. The historical counts in this entry remain unchanged.
- **Historical fact:** Dated club counts reported above; shares calculated as
  deputies / 432, so PPS is 7.87% and PSL Piast 22.22%.
- **Gameplay simplification:** Mapping the national-workers group to `npr`,
  NChKR to `pschd`, and 17 separate minority deputies to `minorities_bloc`
  requires explicit distinctions between parties, clubs and electoral alliances.
  Under those provisional groupings, the unrepresented remainder is 131
  deputies (30.32%); this is our arithmetic aggregation, not a historical party.
- **Alternate-history departure:** None established by this research.
- **Unresolved research question:** Exact January 1922 roster and vacancies;
  individual club memberships; treatment of substantial parties outside our roster.
- **Licensing or attribution requirements:** Timeline credits Contentplus.pl
  and CC BY-SA 3.0. No image or timeline asset copied into the game.
- **Implementation status:** A separate 444-MP approximation is now approved and
  implemented. That approval does not make these August counts a January roster.
- **Related mechanic, variable and source file:** Opening `<party>_r` values in
  `source/scenes/root.scene.dry`; derived from `opening_sejm_seats`, not polling.

### Source entry OPENING-1922-DESIGN

- **Source ID / category:** OPENING-1922-DESIGN; user-approved gameplay design,
  not an independent historical source.
- **Evidence and date:** User approval in this task, 2026-09-02. Normalize the
  supplied August percentages (0.5/7.9/4.9/5.6/22.2/6.0/18.8/3.9/30.3;
  total 100.1%) and allocate 444 whole MPs by largest remainder.
- **Implemented values:** KPP 2, PPS 35, NPR 22, PSL Wyzwolenie 25, PSL Piast 99,
  PSChD 27, ZLN 83, minority deputies 17, Inne 134. Polls remain independent.
- **Historical fact:** `SU-1922-AUGUST-COMPOSITION` records a different chamber
  size and date. Neither 444 MPs in January nor this exact allocation is asserted
  as a historical reconstruction. Existing KPP naming remains an approved
  temporary convention; see `KPRP-KPP-NAME-1925`.
- **Gameplay simplification:** Use these August-derived proportions from January;
  aggregate minority deputies without claiming a single January BMN club;
  ten stable portfolio categories, including combined Public Works /
  Communications; PPS external toleration with no cabinet seats.
- **Unresolved historical research:** Precise January PPS parliamentary stance
  and voting practice remain **TBD — historical research required**. Approving
  toleration as an initial game state does not establish a historical agreement.
- **Alternate history / chronology:** The initial opening-only limit has been
  superseded by `SEJM-1922-ELECTION-DESIGN`: November elections are implemented.
  December presidential transition and researched successor cabinets remain
  planned. Retaining May 1928 as the next election or an opening cabinet beyond
  its historical term is a development limitation, not history.
- **Implementation:** `source/scenes/root.scene.dry`,
  `source/scenes/polish_opening_state.scene.dry`, status/Library and authority
  guards; acceptance and portfolio list in `PLAN.md` section 2.
- **Rights:** No media copied. Existing image/music credits remain unchanged;
  code's MIT licence does not automatically cover media or cited editions.

### Source entry SU-CHADECJA-CLUB

- **Source ID:** SU-CHADECJA-CLUB
- **Claim or game element supported:** Historical identity of the parliamentary
  group used for a cautious comparison with the code's `pschd` entry.
- **Category:** elections and parliamentary composition
- **Relevant date or period:** Legislative Sejm constitutional debates, 1919–1921.
- **Full citation:** Paweł Magiera, "Kwestia kwalifikacji narodowych i wyznaniowych
  Prezydenta RP w polskiej debacie ustrojowej i pracach konstytucyjnych Sejmu
  Ustawodawczego z lat 1919–1921", in *Polska niepodległa 1918–2018. Księga
  rocznicowa z okazji 100 rocznicy odzyskania niepodległości*, Warszawa:
  Think & Make, 2018, p. 261, ISBN 978-83-950934-0-1.
- **Author:** Paweł Magiera.
- **Publication:** Think & Make anniversary collection.
- **Page number:** Printed p. 261, PDF page 261 (zero-based index 260).
- **URL or archive location:** https://think-make.pl/wp-content/uploads/2020/10/Polska-niepodleg%C5%82a-1918-%E2%80%93-2018-Ksi%C4%99ga-rocznicowa-z-okazji.pdf
- **Date accessed:** 2026-09-02
- **Primary or secondary source:** Secondary scholarly chapter.
- **Exact evidence or notes:** Identifies NChKR as the parliamentary
  representation of Christian democracy and identifies the party created in
  May 1920 as Chrześcijańsko-Narodowe Stronnictwo Pracy.
- **Confidence:** High for the identification stated by the source.
- **Conflicting sources:** None identified for this narrow claim.
- **Intended gameplay use:** Explain the historical club behind a PSChD comparison.
- **Historical fact:** NChKR represented Christian democracy in the cited debates.
- **Gameplay simplification:** Using the persistent `pschd` ID for this club
  does not establish that the club and later party name are interchangeable.
- **Alternate-history departure:** None.
- **Unresolved research question:** Exact date-dependent party names and roster.
- **Licensing or attribution requirements:** Publication reserves copyright;
  only a short factual paraphrase and citation are recorded.
- **Implementation status:** Research only.
- **Related mechanic, variable and source file:** `pschd_r` in
  `source/scenes/root.scene.dry`.

### Source entry BMN-1922-ELECTORAL-ALLIANCE

- **Source ID:** BMN-1922-ELECTORAL-ALLIANCE
- **Claim or game element supported:** Distinguish the 1922 minority electoral
  alliance from separate minority parliamentary clubs in the outgoing Sejm.
- **Category:** elections and parliamentary composition
- **Relevant date or period:** August 1922 election preparations.
- **Full citation:** "Blok mniejszości narodowych", *Tydzień Polski*, no. 35,
  Warszawa, 26 August 1922, p. 7.
- **Author:** Unsigned news item.
- **Publication:** Tydzień Polski.
- **Page number:** Printed p. 7, PDF page 7 (zero-based index 6).
- **URL or archive location:** https://rcin.org.pl/Content/190916/PDF/WA248_211888_P-II-175_tydz-polski-1922-35_o.pdf
- **Date accessed:** 2026-09-02
- **Primary or secondary source:** Primary contemporary newspaper report.
- **Exact evidence or notes:** Reports an agreement of minority representatives
  in Warsaw on 17 August and reproduces a declaration creating a joint
  electoral committee. Existing Jewish and German deputies attended.
- **Confidence:** High that this report distinguishes an electoral committee
  from the sitting parliamentary representation.
- **Conflicting sources:** Some retrospective accounts date the alliance to
  earlier August. This entry establishes the reported agreement, not a definitive
  first foundation date.
- **Intended gameplay use:** Avoid describing 17 minority deputies as a single
  historical BMN parliamentary club, or backdating the electoral alliance to January.
- **Historical fact:** Contemporary evidence of an August electoral agreement.
- **Gameplay simplification:** Combining separate minority clubs into one
  `minorities_bloc_r` would be an explicit game abstraction.
- **Alternate-history departure:** A January electoral alliance would require
  separate historical evidence or an approved alternate-history premise.
- **Unresolved research question:** Precise foundation chronology and the
  affiliation of each sitting minority deputy to the electoral alliance.
- **Licensing or attribution requirements:** No facsimile or asset copied;
  citation does not establish reuse rights for the archive's images.
- **Implementation status:** Research only.
- **Related mechanic, variable and source file:** `minorities_bloc_r` and
  `party_names` in `source/scenes/root.scene.dry`.

### Source entry KPRP-KPP-NAME-1925

- **Source ID:** KPRP-KPP-NAME-1925
- **Claim or game element supported:** Date-dependent communist party name.
- **Category:** elections and parliamentary composition
- **Relevant date or period:** 1922 and the 1925 renaming.
- **Full citation:** Instytut Pamięci Narodowej, "ul. Leszczyńskiego Juliana",
  archived historical biographical notice, undated.
- **Author:** Institutional; individual author not identified.
- **Publication:** IPN archive.
- **Page number:** HTML paragraph about the third KPRP congress.
- **URL or archive location:** https://archiwum.ipn.gov.pl/pl/upamietnianie/dekomunizacja/zmiany-nazw-ulic/nazwy-ulic/nazwy-do-zmiany/37008%2Cul-Leszczynskiego-Juliana.html
- **Date accessed:** 2026-09-02
- **Primary or secondary source:** Secondary institutional account.
- **Exact evidence or notes:** Dates the change from Komunistyczna Partia
  Robotnicza Polski (KPRP) to Komunistyczna Partia Polski (KPP) to 1925.
- **Confidence:** High for this narrow naming chronology.
- **Conflicting sources:** None identified for the renaming year.
- **Intended gameplay use:** Separate a stable internal ID from a historical label.
- **Historical fact:** The 1922 party name was KPRP; KPP followed in 1925.
- **Gameplay simplification:** The code currently uses `kpp` and displays KPP
  throughout the opening model.
- **Alternate-history departure:** None inferred from an internal variable name.
- **Unresolved research question:** Date-dependent display implementation remains
  a future decision; this source is not evidence for parliamentary seat counts.
- **Licensing or attribution requirements:** Factual paraphrase only; no media reuse.
- **Implementation status:** Research only.
- **Related mechanic, variable and source file:** `party_names.kpp` in
  `source/scenes/root.scene.dry`.

### Source entry SEJM-1922-ELECTION-DESIGN

- **Category / evidence:** User-approved November election gameplay design,
  approved 2 September 2026; implementation checked 3 September 2026. Not an
  independent historical source or a recreation of the legal allocation system.
- **Historical anchors:**
  - [Decree of 18 August 1922, Dz.U. 1922 nr 66 poz. 593](https://eli.gov.pl/api/acts/DU/1922/593/text/O/D19220593.pdf),
    first page: Sejm voting on **5 November 1922**, Senate on 12 November.
  - [Sejm electoral law of 28 July 1922, Dz.U. 1922 nr 66 poz. 590](https://eli.gov.pl/api/acts/DU/1922/590/text.html),
    art. 9: **444 MPs**, comprising 372 district-list and 72 national-list seats.
  - Accessed 3 September 2026; primary legal sources, high confidence for these
    specific dates/counts. The implemented heuristic does **not** reproduce
    those two historical allocation tiers.
- **Approved calibrated design:** The user confirms the national multiplier
  curve is already calibrated: <2% ×0.25; 2–<5 ×0.55; 5–<10 ×0.85;
  10–<15 ×1.025; 15–<25 ×1.10; 25%+ ×1.25. Calibration is resolved for this
  slice; no new independent empirical calibration is claimed here.
- **Approved simplifications:** Normalize weighted lists and allocate 444 whole
  MPs by largest remainder. Other consists of anonymous 2% lists plus a smaller
  remainder preserving its total. Geographic concentration is deliberately out
  of scope, not an outstanding implementation obligation. First-election ChZJN
  combines only ZLN + PSChD, then divides its seats by their election-time
  support; this is the approved internal attribution, not a historical club
  reconstruction. The parties remain separate after the election.
- **Timing / authority simplifications:** Election and minimal government choice
  finish within November without extra monthly actions. A strict majority is
  223 of 444 for these gameplay options, not a claim that every historical vote
  required 223. No Senate, named successor cabinet or presidential election is
  invented. Portfolios stay unallocated and approved German executive/confidence
  and toleration routes remain guarded; generic welfare stays labelled legacy.
- **Alternate history:** Results follow the player's changed support, not fixed
  historical national results. Parliamentary snapshots and votes remain distinct.
- **Implemented:** `source/scenes/sejm_election.scene.dry`,
  `source/scenes/sejm_election_result.scene.dry`,
  `source/scenes/polish_opening_state.scene.dry`, six Polish government choices
  in `source/scenes/events/election_1928.scene.dry`, status/Library, and
  `tests/sejm-election.test.js`.
- **Still unresolved:** Successor cabinets, presidential succession and
  subsequent Polish election chronology: **TBD — historical research required**.
  Temporary May 1928 scheduling and later legacy rules remain visibly labelled.
- **Rights:** No media imported; image/music credits preserved. The repository's
  MIT code licence does not automatically cover media assets or cited editions.

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

### Source entry PONIKOWSKI-FIRST-CABINET

- **Source ID / category:** PONIKOWSKI-FIRST-CABINET; opening government and
  ministry terminology.
- **Citation:** Marek Kornat and Patryk Tomaszewski (eds.), *Protokoły posiedzeń
  Rady Ministrów Rzeczypospolitej Polskiej 1918–1923*, vol. VIII, *Pierwszy
  gabinet Antoniego Ponikowskiego, 19 września 1921 – 5 marca 1922*, Warszawa:
  Instytut Historii PAN, 2022, ISBN 978-83-66911-28-4.
- **Source / access:** [RCIN edition](https://rcin.org.pl/ihpan/Content/239864/WA303_276186_II15098-8_Kornat-Tomaszewski.pdf),
  accessed 2026-09-02; published primary cabinet records with scholarly editing.
- **Evidence:** Volume chronology places Ponikowski's first cabinet in January
  1922. Printed p. 657 (PDF page 656) lists departments including separate
  railways, public works, posts, education, health and labour.
- **Confidence / limits:** High for cabinet identity/period and that department
  list; it is not evidence for exactly ten ministries or a PPS toleration pact.
- **Administrative character:** Piotr A. Tusiński's study of parliamentarians
  in interwar cabinets, *Przegląd Sejmowy* 6(131)/2015,
  [p. 115](https://orka.sejm.gov.pl/przeglad.nsf/0/D519E888835B02D1C1257F460042BC5B/%24File/ps131.pdf)
  describes extensive administrative experience among Ponikowski's ministers
  and department heads, while also identifying parliamentary members. This
  supports “predominantly expert/administrative,” not “all personally non-party.”
  Secondary scholarly evidence, accessed 2026-09-02; no inference about PPS
  toleration follows from that classification.
- **Gameplay use:** Opening PM and cautious Polish portfolio terminology.
  The ten-category display is the approved aggregation in `OPENING-1922-DESIGN`;
  no personal minister roster is implemented. Later cabinets remain planned.
- **Related files:** `source/scenes/root.scene.dry`,
  `source/scenes/library.scene.dry`, `source/scenes/status.scene.dry`.
- **Rights:** Citation/paraphrase only; no page facsimile or media imported.

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
- **Gameplay simplification:** Exact 444-seat allocation now replaces the old
  percentage proxy; the approved government threshold is 223 MPs. Named
  ministers and portfolio allocation are deliberately left TBD. External
  minority toleration does not imply cabinet membership.
- **Alternate-history departure:** Depends on election results and player choice.
- **Licensing or attribution requirements:** None identified for design text.
- **Implementation status:** Minimal choices implemented in the November 1922
  election and reused during temporary legacy continuation.
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

### Source entry OPENING-CONSTITUTION-1922

- **Source ID / category:** OPENING-CONSTITUTION-1922; institutional opening
  and transitional constitutional arrangements.
- **Primary sources:**
  - [Sejm resolution of 20 February 1919](https://libr.sejm.gov.pl/tek01/txt/kpol/1919.html),
    Dz.Pr.P.P. 1919 nr 19 poz. 226: Piłsudski entrusted with Naczelnik Państwa.
  - [Transitional Act of 18 May 1921](https://eli.gov.pl/api/acts/DU/1921/268/text/O/D19210268.pdf),
    Dz.U. 1921 nr 44 poz. 268, arts. 1–4: continuing Sejm Ustawodawczy and
    Naczelnik powers until the new institutions take office.
  - March Constitution, Dz.U. 1921 nr 44 poz. 267:
    [art. 11](https://biblioteka.sejm.gov.pl/tek01/txt/kpol/1921a-r2.html)
    gives the Sejm a five-year term from its opening;
    [art. 39](https://biblioteka.sejm.gov.pl/tek01/txt/kpol/1921a-r3.html)
    provides a seven-year president elected by the Sejm and Senate together.
- **Access / confidence:** 2026-09-02; high for these specific provisions.
- **Implemented interpretation:** Describe January as March Constitution with
  transitional arrangements, not the full later institutional machinery.
  Piłsudski's state office is distinct from the PPS Piłsudczycy faction.
- **Planned, not implemented:** Subsequent Polish election/term scheduling,
  presidential election and Senate simulation. The first November election is
  implemented under `SEJM-1922-ELECTION-DESIGN`. Retained four-year scheduling is not
  justified by these sources. No Sejm-only presidential election is asserted
  as historical; any future simplified procedure needs its own approval.
- **Research boundary / rights:** Exact political practice and PPS cabinet
  support need separate evidence; legal texts alone do not settle them. No
  media imported or new licence claim made.
- **Related files:** `source/scenes/root.scene.dry`,
  `source/scenes/library.scene.dry`, `source/scenes/status.scene.dry`.

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
| SEJM-1922-ELECTION-DESIGN | Elections / user-approved design | November date, 444 MPs, calibrated heuristic, ChZJN and small lists | Implemented bounded slice; future chronology unresolved | November 1922 election slice |
| TBD | TBD | TBD | TBD | TBD |
