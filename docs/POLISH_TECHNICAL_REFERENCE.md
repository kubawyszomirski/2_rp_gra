# Polska wersja: techniczna referencja mechanik, stanu i przejść

**Wersja 0.49 — 4 października 2026.** Specyfikacja pierwszego rozdziału na podstawie [POLISH_DESCRIPTIVE_GUIDE.md](POLISH_DESCRIPTIVE_GUIDE.md). Obejmuje stan, jednostki, wzory, warunki kart, kolejność rozliczeń, głosowania, umowy, gospodarkę, organizacje, zamach i zapis kampanii. **To jedna aktualna wersja do kodowania: obowiązuje tekst rozdziałów 1–22.** Karty zbiera w jednym miejscu [katalog kart do kodowania](POLISH_CARD_CATALOGUE.md): jedna tabela na kartę, szkic z 0.32; wszystkie sześć partii użytkownik przejrzał w 0.33–0.38 i katalog nie ma otwartych pytań. Katalog nie tworzy reguł; przy rozbieżności obowiązuje ta referencja. Historia decyzji jest w rozdziale 23 i nie jest instrukcją wdrożenia. Trafiły tam dawny opis wersji, akapity rewizji 0.13–0.30 i zapisy zatwierdzeń. Oznaczenia K/Z/P/H/B objaśnia rozdział 1. Wszystkie punkty audytu mechanik są zamknięte w dokumentacji. **Etap 8 planu wdrożenia był ostatni: pierwszy rozdział jest wdrożony w całości** (23.22). Liczby P skalibrowano na pełnych kampaniach etapu 8 ([pomiar](../analysis/stage8-campaigns/REPORT.md)); ograniczenia gotowego rozdziału wymienia rozdział 18 [planu wdrożenia](POLISH_IMPLEMENTATION_PLAN.md). Dokument nie zmienia działającej gry.

**Gdzie jest aktualna reguła.** Tabela wskazuje kanoniczne miejsce każdego tematu i ostatnie zatwierdzone zmiany. Oznaczenia „Z — 0.xx (Mxx)” w tekście mówią, która decyzja ustaliła daną regułę.

| Temat | Sekcja | Ostatnie zatwierdzenia |
|---|---|---|
| Status reguł, zakres i oznaczenia | 1 | — |
| Własność stanu, jednostki, wskaźniki, rejestr domen | 2 | etap 0: `Q.S` (2.4), etap 2 (2.4), etap 4 (2.4), etap 5 (2.4), etap 6 (2.4), etap 7 (2.4) |
| Stan początkowy i konfiguracja testowa | 3 | — |
| Czas, karty, kolejność rozliczeń, kolejka wydarzeń | 4 | M06 (4.5), praca organizacyjna (4.4), kategorie kolejki wydarzeń (4.5), etap 1 (4.1–4.6), etap 4 (4.2, 4.5), etap 5 (4.2, 4.4, 4.5), etap 6 (4.2, 4.5), etap 7 (4.2, 4.5) |
| Elektorat, kampanie, przepływy poparcia | 5 | M09 (5.6), Bund nie jest partią (5.5), etap 4 (5.4, 5.6), etap 5 (5.1–5.6), etap 6 (5.5), etap 8 (5.2) |
| Wybory i zapis parlamentu | 6 | kompromis listowy (6.5), etap 2 (6.1, 6.3–6.5) |
| Instytucje, głosowania, prezydent i marszałek | 7 | M06 (7.3, 7.5), arbitraż prezydenta a linia PPS (7.6), etap 2 (7.1–7.5), etap 4 (7.2, 7.6), etap 5 (7.6), etap 8 (7.6) |
| Relacje, rozmowy, oferty, gabinety | 8 | M11 (8.3), M17 (8.1), oś autonomii (8.6), impas formowania (8.7), etap 4 (8.5, 8.6), etap 5 (8.6), etap 7 (8.7), etap 8 (8.6, 8.9) |
| Umowy, stosunek do rządu, współpraca z komunistami | 9 | M11 (9.8), M13 (9.5–9.6), M17 (9.5), agenda współpracy z KPP (9.5), utrzymanie poparcia tylko w kryzysie (9.8), etap 4 (9.1, 9.7), etap 5 (9.5, 9.8), etap 6 (9.6–9.8), etap 8 (9.6) |
| Frakcje, posłuch, doradcy, karty strategiczne | 10 | M10 (10.7), M16 (10.2), M17 (10.4.3), katalog kart (10.2, 10.4.2, 10.5–10.10), etap 5 (10.1–10.10), etap 6 (10.4.3), etap 7 (10.7), etap 8 (10.5) |
| Gospodarka i finanse państwa | 11 | M01 (0.11), karta Budżet (11.9), etap 4 (11.1, 11.3, 11.9), etap 6 (11.4, 11.7) |
| Projekty i wykonanie | 12 | M07 (17.12), katalog kart (12.7, 12.8), etap 4 (12.2), etap 6 (12.4) |
| Organizacje PPS, finanse partii, Milicja i AS | 13 | M18 (13.1), M15 (13.3–13.4), katalog kart (13.1–13.5), etap 5 (13.1–13.5), etap 6 (13.1), etap 7 (13.4) |
| Związki, strajki, ugody | 14 | M12 (14.4–14.5), `union.align` (14.1), ID karty E6 (14.5), etap 5 (14.1), etap 6 (14.1–14.5) |
| Niezadowolenie, demokracja, presja na zamach | 15 | M10 (15.2–15.3), etap 7 (15.1–15.3), etap 8 (15.3) |
| Policja, wojsko, zamach | 16 | M08 (16.8), M10 (16.1), M15 (16.8.3), rozpoznanie sił (16.8.1), ograniczona reforma kontroli (16.3), etap 6 (16.5), etap 7 (16.1–16.8), etap 8 (16.1, 16.8, 16.8.1, 16.8.5) |
| Karty, wydarzenia, scenariusz Normalny | 17 | M02 (17.16), M05 (17.15), M07 (17.12), M12 (17.4), katalog kart (17.2, 17.3, 17.10, 17.11, 17.12, 17.15), etap 4 (17.4, 17.10, 17.11, 17.15, 17.16.2, 17.16.4), etap 5 (17.4), etap 6 (17.4, 17.5, 17.5.1, 17.11, 17.12, 17.12.5, 17.16.5), etap 7 (17.5–17.7, 17.10–17.13, 17.16.3), etap 8 (17.7, 17.10, 17.12.4, 17.16.3, 17.16.6, 17.16.11) |
| Ścieżki jako zestawy warunków | 18 | — |
| Granica rozdziału, raport i zapis | 19 | M08 (19.1), stare zapisy i etap 0 (19.3), etap 2 (19.1–19.2), etap 7 (19.1–19.2), etap 8 (19.2) |
| Integracja z Dendry i odziedziczonym kodem | 20 | M09, M10 (20.2), moduł reguł, język i etap 0 (20.1), plan wdrożenia (20.3), etap 2 (20.1, 20.2), etap 4 (20.2), etap 5 (20.2), etap 6 (20.2), etap 7 (20.2) |
| Kryteria weryfikacji i testy | 21 | wszystkie powyższe (21.1), etap 8 (21.2) |
| Granice pewności i źródła | 22 | — |
| Archiwum decyzji | 23 | M19, katalog kart, etapy 0–8 (23.14–23.22) |

## 1. Status reguł i granica audytu

[Niemiecka referencja](GERMAN_ORIGINAL_TECHNICAL_REFERENCE.md) opisuje zaimplementowaną grę na historycznym commicie. Ta referencja ma dodatkowe zadanie: określić jeszcze niezaimplementowany polski model. Nie przedstawia zaproponowanych liczb jako odczytanych z kodu.

| Oznaczenie | Znaczenie |
|---|---|
| **K — kod** | Zachowanie potwierdzone w obecnym repozytorium |
| **Z — zatwierdzone** | Decyzja użytkownika; może jeszcze nie być wdrożona |
| **P — propozycja** | Konkretny kontrakt lub wartość do testów i dalszej akceptacji |
| **H — historia** | Informacja potwierdzona wskazanym źródłem |
| **B — badanie** | Brakujący materiał: `TBD — historical research required` |

**Domyślnie wszystkie nowe wzory, koszty i progi poniżej mają status P.** Pozostałe systemy zachowują zestaw testowy `balance_v0_1`; gospodarka i projekty używają rewizji `economy_simple_v1`, nie końcowego balansu. Użytkownik wyraźnie zaakceptował przygotowanie takich wartości. Propozycja działania nie oznacza zatwierdzenia jego implementacji.

**Z — zakres:** styczeń 1922; sprawy wewnętrzne; jeden główny priorytet miesięcznie; ręka trzech kart; trzy pule działań; doradcy; piętnaście głównych wskazań; dziewięć resortów. Koniec następuje po rozstrzygnięciu rozpoczętej próby zamachu albo po pierwszych legalnych wyborach parlamentarnych następujących po wyborach 1922. **Wcześniejsze legalne wybory również kończą rozdział**, także przed majem 1926. Uniknięcie samej próby zamachu prowadzi do dalszej gry.

**Z — uproszczenia:** jeden poziom **Normalny**, bez wyboru trybu historycznego; mniejszości wyłącznie jako Żydzi i pozostałe mniejszości; wybory prezydenckie jako jedna decyzja o zgłoszeniu kandydata PPS, po której pokazujemy ostatni wynik. Symulacja wewnętrznych transferów głosów nie staje się dodatkowymi turami gracza.

Stan sprawdzono na `7434dc6ae784d467b61c2c8991343c92448099e3`, z istniejącymi zmianami dokumentacyjnymi w katalogu roboczym. Audyt jest celowany: obejmuje wymienione poniżej powierzchnie, a nie deklarowany nowy przegląd każdej odziedziczonej sceny.

### 1.1. Co istnieje, a co dopiero definiujemy

| System | K — obecna implementacja | P/Z — kierunek tej referencji |
|---|---|---|
| Czas i karty | `time=1`, styczeń 1922; trzy miejsca; talie Party/Government; miesięczny `month_actions` | Wspólny budżet także dla parlamentu; transakcje i agenda; jeden zapis rozliczenia miesiąca |
| Otwarcie | Ponikowski, Naczelnik Piłsudski, zewnętrzna tolerancja PPS, brak resortów PPS | Zachowanie rozdziału ról; późniejsze gabinety jako umowy |
| Sejm | Dokładne 444 mandaty, atomowe `sejm_results`, oddzielone sondaże | Zachować metodę i zapis pierwszych wyborów; dołożyć kluby, porozumienia i legalny kalendarz |
| Prezydent | Semantyczny obiekt; stałe wyniki grudniowe; jednorazowa migawka Senatu | Jeden wybór nominacyjny, dynamiczny wynik końcowy, aktualny marszałek, trwały minimalny Senat |
| PPS | Trzy frakcje, czternaście doradców; wspólne odnowienie | Ostrzeżenia i wykonanie decyzji zamiast wyłącznie progów rozłamu |
| Milicja | 200 członków, sprawność 0,10; natychmiastowa jednorazowa AS | Rekrutacja, militaryzacja i utrzymanie; AS po osiągnięciu progu siły |
| Gospodarka | `budget=4`, `inflation=2.9`, `economic_growth=4.4`; niemieckie sprzężenia | Jeden abstrakcyjny budżet, inflacja, płace realne, kredyt, produkcja, zatrudnienie i presja agrarna |
| Zamach | Odziedziczone siły, liczniki i sceny niemieckie | Polski zamiar, zdolność, organizacje i wynik liczony po wyborach |
| Koniec | Brak polskiego punktu końcowego; następna data tymczasowo maj 1928 | Atomowy raport zamachu albo następnych legalnych wyborów |

Źródła K: `source/scenes/root.scene.dry`, `main.scene.dry`, `post_event.scene.dry`, `polish_opening_state.scene.dry`, `sejm_election.scene.dry`, `sejm_election_result.scene.dry`, `polish_presidential_sequence.scene.dry`, `party_affairs/reichsbanner.scene.dry` oraz `advisors/` — wszystkie względem `source/scenes/`. Dokładne obecne pola opisuje również [STATE_VARIABLES.md](../STATE_VARIABLES.md).

### 1.2. Jak korzystać z dokumentu

Rozdziały 2–4 definiują kontrakt stanu i czasu; 5–10 politykę; 11–14 gospodarkę, projekty i organizacje; 15–16 kryzys państwa i zamach. Rozdział 17 jest katalogiem działań i wydarzeń, 18 wiąże je w ścieżki, a 19–22 określają koniec, kompatybilność, testy i otwarte kwestie.

Wzory są pseudokodem JavaScript. `clip(x,a,b)` ogranicza wartość do przedziału domkniętego; `pos(x)=max(0,x)`; `I(warunek)` daje 1 albo 0. Procenty zapisane jako 0–100 różnią się od udziałów 0–1. „pp” oznacza punkt procentowy. Zaokrąglanie wyświetlania nigdy nie jest wejściem do obliczeń.

Szybki dostęp: [stan i wskaźniki](#2-własność-stanu-i-jednostki), [tura i karty](#4-czas-karty-transakcje-i-losowość), [wybory](#6-wybory-i-niezmienny-zapis-parlamentu), [głosowania](#7-instytucje-głosowania-i-legalny-kalendarz), [umowy](#9-umowy-napięcie-koalicyjne-i-utrata-poparcia), [gospodarka](#11-gospodarka-i-finanse-pełny-kontrakt-miesięczny), [projekty](#12-projekty-upoważnienie-i-wykonanie), [organizacje](#13-organizacje-pps-i-milicja--as), [zamach](#16-policja-wojsko-i-rozstrzygnięcie-zamachu), [katalog kart](#17-kontrakty-kart-i-manifest-wydarzeń), [ścieżki](#18-ścieżki-jako-zestawy-warunków-a-nie-osobne-tryby), [raport](#19-granica-rozdziału-raport-i-zapis), [weryfikacja](#21-kryteria-weryfikacji-i-kalibracji).

## 2. Własność stanu i jednostki

### 2.1. Jeden autorytatywny zapis

Nie wykonujemy masowej zmiany nazw. Działające polskie rekordy pozostają autorytatywne, a nowe domeny dostają proponowaną przestrzeń `Q.pl`. Symbol `S` w dalszym tekście oznacza `Q.pl`.

| Właściciel | Stan autorytatywny | Reguła integracji |
|---|---|---|
| `Q.time` | Numer miesiąca, od 1 | `year/month` są jego pochodnymi |
| `Q.resources`, `Q.dues` | Zasoby i zdolność składkowa PPS | Nie są budżetem państwa |
| `Q.<faction>_strength/dissent` | Trzy frakcje PPS | `Q.dissent` jest wynikiem, nie dodatkowym źródłem sprzeciwu |
| `Q.<party>_relation` | Istniejące relacje partyjne poza nowym podziałem mniejszości | Dwie relacje reprezentacji mniejszości przejmuje `S.actors`; stara relacja agregatu jest tylko odczytywaną pochodną, rozdział 5.5 |
| `Q.sejm_results` | Niezmienna historia wyborów | Nie przepisywać po rozłamie lub kampanii |
| `Q.sejm_parliament` | Obecne mandaty według partii | Przeliczany z wyniku i jawnych transferów; `S.parliament.clubs` daje szczegóły |
| `Q.polish_presidency` | Urząd i historia prezydentury | Rozszerzenie istniejącego obiektu; bez zapisu do niemieckiego `president` |
| `Q.pps_militia_*` | Członkowie, sprawność, etap, status prawny | Nowe szczegóły w `S.militia`; nie tworzyć drugiej Milicji |
| `Q.<name>_advisor` i pola puli | Doradcy i dostępność | Nowy scheduler daje odnowienie; stary licznik staje się adapterem |
| `S.*` | Nowe procesy, umowy, finanse i szczegóły | Pola pochodne są odtwarzalne z kanonicznych wejść |

Zmiana właściciela pola wymaga osobnego etapu migracji. Stare `budget`, `inflation`, `economic_growth`, `coup_progress` i `capital_strike_progress` nie mogą równolegle sterować nową gospodarką lub polskim zamachem. Adapter może wyświetlać wartość, ale nie przenosić niezatwierdzonych niemieckich skutków do nowego systemu.

### 2.2. Jednostki

| Symbol | Jednostka | Przykład |
|---|---|---|
| R | Punkt zasobów PPS; zapis do 0,01 | 1 R przeniesiony do funduszu związku nie jest wydatkiem państwa |
| B | Punkt abstrakcyjnej przestrzeni finansowej państwa | Baza +2 B; program obciąża odczyt o 2 B w fazie budowy, nie zużywa co miesiąc zapasu gotówki |
| M | Miesiąc symulacji | Odnowienie 6 M od t=1 daje dostęp przy t=7 |
| F | Umowna jednostka siły wojskowej | Nigdy nie jest liczbą żołnierzy ani posłów |
| osoba | Aktywny członek Milicji | 200 oznacza 200 osób, nie 200 tysięcy |
| indeks | Poziom względem początku rozdziału = 100 | Płaca realna 88 oznacza 12% mniej niż na początku |
| 0–100 | Ocena polityczna lub organizacyjna | Relacja 60 nie jest prawdopodobieństwem 60% |
| 0–1 | Udział, sprawność lub prawdopodobieństwo | Sprawność 0,35 musi być pomnożona przez właściwą siłę |

B nie jest historyczną kwotą ani zasobem PPS. Budżet wyliczamy ze składników według 11.2; `cost_B` w starszych opisach oznacza wyłącznie profil obciążenia, nigdy automatyczne `budget -= cost_B`. Waluta nie przelicza punktów B. Oznaczenie **B — badanie** w statusie źródła nadal oznacza brak historycznego materiału, nie jednostkę kosztu.

### 2.3. Piętnaście głównych wskazań i ich właściciele

| Wskazanie | Autorytatywne wejście / obliczenie | Zakres / początek | Główni odbiorcy |
|---|---|---|---|
| Zasoby PPS | `Q.resources` | ≥0; 2 R [K, zachowane P] | Koszty kart, fundusze, utrzymanie |
| Sondaż PPS | `poll(pps,S.society)` | 0–100%; wyliczony | Wybory i siła argumentu politycznego |
| Mandaty PPS | `Q.sejm_parliament.party_seats.pps` | 0–444; 35 w uproszczonym otwarciu [K] | Głosowania i negocjacje |
| Spójność PPS | `100*(1-Q.dissent)` | 0–100; 95,25 po normalizacji | Kampania i posłuch |
| Inflacja miesięczna | `S.economy.inflation_m` | >−100%; testowo 4% | Ceny, płace, finanse |
| Płace realne | `S.economy.real_wage` | >0; 100 | Niezadowolenie robotników; warunki życia klas 5.6 |
| Bezrobocie | `S.economy.unemployment` | 0–100%; 3% [początek K, definicja P] | Zatrudnienie, warunki życia i poparcie 5.6, związki |
| Budżet / przestrzeń finansowa | `budgetAt(t,S)` z 11.2 | B; początkowo +2, może być ujemny | Dostępność programu, wykonanie i negocjacje |
| Produkcja | `S.economy.output` | >0; 100 | Praca, dochody, inwestycje |
| Kredyt | `S.economy.credit` | 0–100; 55 | Produkcja i projekty |
| Presja agrarna | `S.society.agrarian_pressure` | 0–100; 45 | Ludowcy, program ziemski, wskaźnik wsi 11.6 i warunki chłopów 5.6 |
| Niezadowolenie | Średnia ważona `cell.grievance` | 0–100; komórki testowo 35 | Protesty i presja na rząd |
| Przywiązanie do demokracji | `S.politics.democracy` | 0–100; 60 | Gotowość wojska do zamachu (16.1), niewielki składnik presji (15.3), zaufanie do ugody (16.6) |
| Presja na zamach | `S.coup.pressure` | 0–100; 10 | Warunek próby |
| Zdolność zamachowa | `coup_capacity(forces,logistics)` | 0–100; z profilu sił | Wykonalność próby |

Wszystkie początki bez [K] są P, nie statystykami roku 1922. Widok gracza może przedstawiać cudzą zdolność jako przedział; prawdziwy wynik istnieje w stanie symulacji. Dokładność rozpoznania nie zmienia rzeczywistej siły.

### 2.4. Rejestr nowych domen

| Domena | Minimalne pola i typy | Inicjalizacja i zapis |
|---|---|---|
| `S.meta` | `schema_version:int`, `balance_id:string`, `scenario_id:string`, `seed:uint32` | 1, `balance_v0_1+economy_simple_v1`, jawny profil scenariusza, ziarno nowej gry |
| `S.turn` | `phase:enum`, `last_settled_time:int`, `action_serial:int`, `pending:ActionTxn\|null` | `main`, 0, 0, null |
| `S.advisors` | `effects:[]`; czasowe, zakresowe premie akcji, 10.4 | Pusta lista; obsada i appointed_once pozostają w istniejących polach |
| `S.cooldowns` | `actionId -> available_at:int` | Dostępne na początku: 1; późniejsze: data manifestu |
| `S.events` | `active:EventRun\|null`, `pending:EventRef[]`, `resolved:map` | null, [], {} |
| `S.projects` | `projectId -> Project` | {} |
| `S.agreements` | `agreementId -> Agreement` | Umowa otwarcia albo oznaczona tolerancja bez umowy programowej |
| `S.cabinet` | `id,pm,party,status,pps_mode,portfolios,partner_ids,appointment_basis,pps_threat_discounted` | `ponikowski_1`, stan otwarcia; `pps_threat_discounted=false`, także dla każdego nowego gabinetu (9.8, M11) |
| `S.parliament` | `clubs:Club[]`, `transfers:Transfer[]`, `speaker:PersonId\|null`, daty kadencji | Kluby z otwarcia; skład szczegółowy „Innych” wymaga profilu; klub PPS ma `faction_seats`, zamrożone między transferami (10.2, M16) |
| `S.senate` | `status,total,club_seats,records,method` | Przed utworzeniem: `not_constituted`, total=0 |
| `S.ballots` | `Ballot[]`; każdy z prawem, izbą, obecnością i wynikiem | [] |
| `S.negotiation` | `Negotiation\|null`; dla gabinetu kontekst, tryb PPS i opcja wsparcia mniejszości, 8.8 | null; zamykana po każdej sprawie |
| `S.cabinet_crisis` | `id,fallen_cabinet_id,reason,status,resolved_by`; 7.4 i 8.8 | null; rekord powstaje dopiero po rzeczywistym upadku gabinetu |
| `S.actors` | Dodatkowe relacje, profile postulatów, reputacja i gotowość współpracy | Profil jawnie oznaczony K/H/P |
| `S.society` | Komórki elektoratu, presja agrarna, historia efektów, `living_conditions_last:classId -> number` | Rozdział 5; ostatni odczyt warunków życia 5.6 ze stanu otwarcia (w profilu syntetycznym 100) |
| `S.politics` | `democracy,parliament_authority,violence,credibility,institutional_log:InstitutionalEntry[]` | 60, 55, 10, 50, []; `parliament_authority` to ostatni odczyt 15.2 z `institutional_log` (wpis `id,t,kind,source_id`), bez innych autorów |
| `S.economy` | Stany cen, pracy, produkcji, kredytu, finansów i polityk | Rozdział 11 |
| `S.unions` | `branchId -> UnionBranch` | Trzy testowe branże: przemysł, kolej, praca rolna |
| `S.party_orgs` | `press,tur,cooperatives,apparatus` | Rozdział 13 |
| `S.militia` | `militarized:bool,fatigue:0..100,arrears:R,assignments:[]` | false, 0, 0, [] |
| `S.actors.pps.strategy` | Kierunek, przeciwnik, ustrój, Piłsudski, elektorat, priorytety gospodarcze i stanowiska mniejszościowe; 10.5 | Jawny syntetyczny profil otwarcia; deklaracje zapisane osobno od ustaw |
| `S.faction_cases` | `factionId -> Dispute\|null`, wykonanie linii i transfery | Brak sporów otwartych |
| `S.security` | `forces:Force[]`, `police,army_control,threats,known` | Profil sił H albo syntetyczny P; obecnie `synthetic_test_v2` (16.1) |
| `S.coup` | `pressure,phase,attempt_id,stance,commitments,round,outcome,history,next_attempt_available_at,f9,settlement,pps_contribution,concessions_to_pps` | 10, `dormant`, null, null, [], 0, null, [], 1, null, null, null, []; kontrakt 16.8 |
| `S.rng` | `rolls:challengeId -> number` | {}; wynik losowania zapisany raz |
| `S.history` | Miesięczne stany, wykonane akcje i powody zmian | Tablice dopisywane po zatwierdzeniu transakcji |
| `S.chapter` | `status,reason,trigger_id,report` | `active`, null, null, null |
| `S.scenario` | `profile_id,version,npc_reviewed_time`; 17.16 | `normal_chapter1_v1`, 1, null; metadane manifestu, bez selektora trudności |

Mapy i tablice są zwykłym JSON-em: bez funkcji, obiektów Date, cyklicznych referencji, NaN i Infinity. Daty dzienne przechowujemy jako ISO, nie jako czas w lokalnej strefie przeglądarki.

**K — etap 0 (0.41):** drzewo S jest w stanie Dendry obiektem `Q.S`, zapisywanym tylko przez moduł reguł. Nowa gra zakłada `S.meta` oraz dziedziny `turn`, `advisors`, `cooldowns`, `events`, `projects`, `rng`, `history`, `chapter` i `scenario` z wartościami z tej tabeli (`PolishRules.createFoundationState`); `history` ma listy `months`, `actions` i `reasons`. Pozostałe dziedziny powstają w etapach, które je przejmują, z nową wersją schematu. Ziarno `S.meta.seed` jest liczone ze stanu generatora Dendry bez pobierania z niego liczby, więc losowość gry się nie zmienia.

**K — etap 2 (0.43):** schemat 3 dodaje dziedziny `S.parliament`, `S.senate` i `S.ballots`. Nowa gra wypełnia je z otwierającego Sejmu (`PolishInstitutions.createInstitutionState`): kluby z `Q.sejm_parliament`, brak marszałka, Senat `not_constituted`, pusta lista głosowań i rekord pierwszych wyborów (XI 1922). `S.parliament` ma też listy `speaker_elections` i `replacements`, pole `previous_term` z marszałkiem poprzedniej kadencji (do raportu) oraz `next_election`, czyli rekord podstawy prawnej następnych wyborów. Zapisy ze schematu 2 wymagają nowej gry (19.3).

**K — etap 3 (0.44):** schemat 4 dodaje dziedziny `S.actors` (relacje z PPS, reputacja wykonania 50, kanał KPP), `S.agreements`, `S.cabinet`, `S.negotiation` i `S.cabinet_crisis` oraz listy `S.history.negotiations` i `S.history.cabinets`. Nowa gra wypełnia je w `PolishGovernment.createGovernmentState`: relacje z pól otwarcia, gabinet Ponikowskiego (`ponikowski_1`) popierany przez PPS z zewnątrz i oznaczona tolerancja bez programu. `S.parliament` dostaje listę `alliances` (6.2). Zapisy ze schematu 3 wymagają nowej gry (19.3).

**K — etap 4 (0.45):** schemat 5 dodaje dziedziny `S.economy` (stany z 11.1, polityki, presje z 17.16.2, historia miesięcznych odczytów, oczekujący pakiet) i `S.society` (presja agrarna, `living_conditions_last` równe 100 dla siedmiu wierszy klas, jednorazowe poprawy wsi), listę ustaw `S.parliament.laws` i rekord `S.chapter.unemployment_bill`. Nowa gra wypełnia je w `PolishEconomy.createEconomyState` (profil `economy_simple_v1`); `S.projects` ma rekordy z 12.1. Zapisy ze schematu 4 (etap 3) wymagają nowej gry.

**K — etap 5 (0.46):** schemat 6 dodaje dziedziny `S.party_orgs` (kasa, składki, aparat z indeksem członkostwa, prasa, TUR, spółdzielnie, zaległości i ostatnia księga), `S.militia` (etap, liczebność, sprawność, militaryzacja, zmęczenie, zaległości, `alignment`), `S.unions` (trzy branże, decyzja 2A etapu 5) i `S.faction_cases` (sprawy frakcji i manifesty odejść). `S.society.cells` ma 54 komórki elektoratu z profilem `cells_synthetic_v1`. `S.actors.pps` dostaje `strategy`, jej projekcję `program`, `factions` (siła, sprzeciw i reakcje z przyczynami) oraz listę `reactions`; `S.actors` dostaje `communist_cooperation` i `bund`, a relacja z Piłsudskim zaczyna od 60 (3.2). Pola `Q.resources`, `Q.dues`, `Q.pps_militia_*`, `Q.<frakcja>_strength`, `Q.<frakcja>_dissent`, `Q.dissent` i wiersze klas `Q.<klasa>_<partia>` są kopiami (`PolishParty.writeMirrors`, `PolishElectorate.writeClassMirrors`); zapis odziedziczonej karty do kopii przechodzi raz na właściciela. Zapisy ze schematu 5 wymagają nowej gry.

**K — etap 6 (0.47):** schemat 7 dodaje dziedziny `S.strikes` (licznik, rekordy strajków i spraw z ugodami, rundami, starciami i krokami, klucze kolejki `due`, obserwacja płac `wage_watch`, wejścia miesiąca `inputs` i skutki dla etapu 7 `pending_effects`) oraz `S.enterprises` (licznik, rekordy syntetycznych zakładów i znaczniki epizodów). Branże `S.unions` mają linie `strike` i `agreed_end` w nastawieniu, przyczyny sprzeciwu i układy zbiorowe w `agreements`; umowa tolerowania może mieć termin `term`. Zapis ze schematu 6 wymaga nowej gry.

**K — etap 7 (0.48):** schemat 8 dodaje dziedziny `S.politics` (demokracja 60, autorytet jako odczyt dziennika `institutional_log`, przemoc 10, niezadowolenie krajowe, sprawy `cases`, restrykcje `restrictions`, wystąpienia, epizody, skutki demokracji i przemocy, klucze kolejki `due`, historia), `S.security` (profil `synthetic_test_v2` z czterema zgrupowaniami, logistyka 0,8, policja 50/50/50/50, rozpoznanie `known` ±30 pp, oceny, modyfikatory i ochrony) oraz `S.coup` (presja 10, fazy 16.8.1, rekord próby `attempt` z rozstrzygnięciem, F9, wynik, wkład PPS, ustępstwa i dziennik `log`). `S.actors.pilsudski` wskazuje jedną umowę 16.7. `S.scenario.inputs` włącza datowane wejścia scenariusza: spór 1922, sprawę wojskową 1925 i uroczystość 1923; testy innych systemów mogą je wyłączyć. Zapis ze schematu 7 wymaga nowej gry.

## 3. Stan początkowy i konfiguracja testowa

### 3.1. Wartości zachowane z polskiego kodu

| Rodzina | Wartości |
|---|---|
| Czas | `time=1`, styczeń 1922 |
| Tryb | Tylko **Normalny**; zapisy i sondaże dostępne; brak selektora innych trybów |
| PPS | `resources=2`, `dues=2` |
| Frakcje: Centrum / Lewica / Piłsudczycy | Siła 50/15/35; sprzeciw 0/20/5 |
| Relacje: Wyzwolenie / Piast / NPR / PSChD / ZLN / komuniści / reprezentacja mniejszości | 65/45/50/30/5/10/50 |
| Aktywni doradcy | Daszyński, Pużak, Perl |
| Milicja | 200 członków; sprawność 0,10; etap 1; legalna, nierepresjonowana |
| Głosujący aktorzy | `kpp,pps,npr,psl_wyzwolenie,psl_piast,pschd,zln,minorities_bloc,other` |
| Uproszczony otwierający Sejm, w tej kolejności | 2/35/22/25/99/27/83/17/134 mandatów; suma 444 |

Identyfikator `kpp` pozostaje stabilny technicznie. Nazwa prezentowana przed 1925 to KPRP. Reprezentanci legalnej listy i nielegalna partia są odrębnymi aktorami.

Źródło K: `source/scenes/root.scene.dry` i `polish_opening_state.scene.dry`. Są to przyjęte wartości gry; nie wszystkie mają historyczne uzasadnienie.

K — stare pola kompatybilności `difficulty` i `historical_mode` pozostają w obecnym kodzie ustawione na 0. Nie są dwiema opcjami gry docelowej. Scenariusze syntetyczne i ziarna testowe nie są dodatkowymi poziomami trudności dla gracza.

### 3.2. Początki nowych organizacji i procesów

| Pole | P — wartość |
|---|---|
| Aparat PPS: poziom / koszt stały | 1 / 0,10 R miesięcznie |
| Prasa: zasięg / wiarygodność | 30 / 60 |
| TUR: poziom / kadra | 0 / 0; projekt dostępny po dacie z profilu treści |
| Spółdzielczość | Brak nowego projektu; poziom 0 |
| Każdy związek: zasięg / gotowość / zaufanie / autonomia | 20 / 25 / 50 / 60 |
| Fundusz: przemysł / kolej / praca rolna | 0,50 / 0,25 / 0,25 R |
| Stosunek organizacji do stron zamachu | Wynika z profilu; neutralne testowe 50/50 |
| Reputacja PPS w wykonywaniu umów | 50/100 |
| Gotowość współpracy z komunistami | Kontakt=false; próby udane=0; trzy zasady trwałego frontu z 9.6=false |
| Relacja PPS–Piłsudski | 60/100, osobna od siły frakcji |
| Zreformowana konstytucja | Brak nowych zmian; konstruktywne wotum=false |
| Kryzysy, strajki, nowe projekty | Brak aktywnych rekordów |
| Nowe warianty treści | Polityki Skarbu=[]; bieżąca umowa Piłsudskiego=null; budowa/kurs TUR=null, przygotowane kampanie=[]; szczegóły w rozdziałach właścicieli |

Fundusze związków są odrębnymi początkowymi zasobami tych organizacji. Przekazanie im później 1 R z kasy PPS zmniejsza kasę o 1 R i zwiększa fundusz o 1 R. Nie drukuje zasobów.

Początkowe poparcie nie jest wpisywane jako wybrany „dobry procent PPS”. Jest obliczane z profilu elektoratu. Profil sił zbrojnych nie udaje historycznych liczebności; dopóki nie został zbadany, nosi etykietę `synthetic_test`.

## 4. Czas, karty, transakcje i losowość

### 4.1. Jeden zegar miesięczny

```js
year  = 1922 + Math.floor((time - 1) / 12);
month = 1 + ((time - 1) % 12);
timeOf(y, m) = 1 + 12 * (y - 1922) + (m - 1);
```

Styczeń 1922 to t=1, listopad 1922 t=11, maj 1926 t=53, luty 1928 t=74. Scena nie zapisuje samodzielnie `month += 1`. Dokładne daty głosowań i ustaw są osobnymi datami dziennymi wewnątrz miesięcznej reprezentacji.

Główna akcja wybrana w miesiącu t rozlicza okres t i prowadzi do t+1. Doradca lub odpowiedź wewnątrz obowiązkowego wydarzenia może zmienić stan bez rozliczenia kolejnego miesiąca.

### 4.2. Kolejność rozliczenia

1. Sprawdzić ponownie uprawnienia, koszt i niezmienność wejściowej fazy.
2. Zatwierdzić akcję: pobrać koszt, zapisać bezpośrednie skutki i jej identyfikator.
3. Rozliczyć bezpośrednio wywołane sprawy wymagające odpowiedzi, np. reakcję frakcji.
4. Jeżeli akcja zużywa miesiąc: aktywować należne efekty i presje scenariusza; wykonać najwyżej jeden przegląd inicjatyw gabinetu z 17.16.1/17.16.4 oraz zależne odpowiedzi; pobrać wpływy PPS i utrzymanie; następnie rozliczyć finanse państwa i wykonanie projektów. Samodzielna inicjatywa nie uruchamia tego kroku rekurencyjnie.
5. Obliczyć gospodarkę okresu t z wejściowego stanu i wykonanych w tym okresie polityk.
6. Rozliczyć społeczne skutki, zobowiązania i napięcia; wyliczyć pochodne.
7. Zapisać jeden rekord historii okresu t i `last_settled_time=t`.
8. Po zapisie rozliczenia sprawdzić wszystkie bramki próby z 16.2. Jeśli spełnione, zapisać aktywną próbę i jej kolejkę F w miesiącu t; nie przesuwać daty ani nie rozliczać dodatkowego miesiąca. W przeciwnym razie ustawić `time=t+1`, odtworzyć kalendarz i dostępność.
9. Zbudować kolejkę zdarzeń należnych na nową datę; rozstrzygnąć je przed następną zwykłą akcją.

Niezależnie od miesięcznego przebiegu, po zatwierdzeniu całego pakietu bezpośrednich skutków wydarzenia politycznego bez kosztu miesiąca sprawdzamy te same bramki, przed powrotem do zwykłych akcji. Nie sprawdzamy ich w połowie transakcji ani pomiędzy jej impulsem i wykonaną ugodą. Trwające obowiązkowe odpowiedzi należące do pakietu kończą się przed sprawdzianem. Raz ustawione `attemptAlreadyActive` chroni przed drugą kolejką F; zapis/wczytanie nie ponawia impulsu ani miesięcznej aktualizacji. Punkt 9 dotyczy tylko ścieżki bez rozpoczętej próby.

Projekt zakończony w punkcie 4 może oddziaływać w punkcie 5 tylko wtedy, gdy jego `first_effect_time <= t`. Domyślnie nowo ukończona inwestycja ma pierwsze efekty od t+1. Podpisana wcześniej polityka wypłat może działać w bieżącym rozliczeniu, jeśli wynika to z jej rekordu.

Przeglądanie Biblioteki, odtworzenie zapisu i wyjście z menu nie wykonują punktów 4–8. Obecny `post_event` wymaga oddzielenia tych przypadków od miesięcznej symulacji; nie wystarczy dodać nowe wzory na końcu istniejącego pliku.

**K — etap 1 (0.42):** `PolishRules.beginMonthSettlement` rozlicza miesiąc raz: tylko po akcji zużywającej miesiąc i tylko przy `last_settled_time < t`. Przesuwa zegar (4.1) i zapisuje rekord okresu w `S.history.months`. Odziedziczony blok miesięczny w `post_event` działa dalej w dotychczasowej kolejności; pełną kolejność punktów 4–7 wprowadzą etapy, które przejmą gospodarkę i projekty.

**K — etap 4 (0.45):** `PolishProjects.settleMonth` rozlicza okres t w kolejności punktów 4–6: należne kroki ustaw, zmiana waluty na początku okresu, głosowanie oczekującego pakietu, jeden przegląd gabinetu (17.16.4), budżet 11.2 i wykonanie projektów, gospodarka 11.4–11.6, przepływ 5.6, odpływ 17.4 i wykonanie obietnic; potem `post_event` rozlicza umowy (9.2), liczy poparcie od nowa i zapisuje jeden rekord okresu. Zegar nadal przesuwa się na początku rozliczenia, lecz kroki okresu t liczą się z datą t. Odziedziczony niemiecki blok gospodarki w `post_event` jest wyłączony warunkiem `polish_economy_system`.

**K — etap 5 (0.46):** księga partii rozlicza się w punkcie 6, po gospodarce, przepływie 5.6 i odpływie 17.4, a przed umowami (`PolishParty.settleMonth`): wpływy i koszty z zaległościami, członkostwo (M18), TUR i kursy, spółdzielnie, zmęczenie Milicji, fundusze związków, nagrody 5.4, sprawy frakcji i wygaśnięcie efektów doradców. Zmiana bezrobocia przesuwa masę komórek zaraz po rozliczeniu gospodarki, a trend struktury klas skaluje komórki po trendzie demograficznym. Niemieckie mosty wierszy poparcia i pięciu dawnych frakcji nie działają w polskiej grze.

**K — etap 6 (0.47):** w punkcie 4, przed gospodarką, `PolishUnions.beginMonth` dopisuje fundusze branż, wykonuje należne klauzule ugód, pobiera raz koszt każdego strajku, zmienia zmęczenie i zapisuje wejścia `strike_disruption` i `wage_agreement_pp`, które czyta rozliczenie projektów i gospodarki. W punkcie 6, po księdze partii, `PolishUnions.endMonth` prowadzi jedną rundę rokowań każdego aktywnego strajku bez otwartej oferty, kończy strajki wyczerpane i wycofane, zapisuje +8 za nierozstrzygnięte żądanie płacowe, sprawdza drogę płacową 17.16.5, zapisuje zakłady i kończy terminy układów i odstępstw. Każda połowa działa raz na okres.

**K — etap 7 (0.48):** w punkcie 6, po umowach i księdze partii, `PolishPolitics.settleMonth` stosuje zapisane skutki jednorazowe, rozlicza niezadowolenie i radykalizację komórek (15.1), dziennik i autorytet (15.2), impulsy i narastanie presji (15.3), demokrację oraz przemoc. Potem `PolishSecurity.settleMonth` kończy czasowe modyfikatory sił, wykonuje i przegląda umowę z Piłsudskim, a w punkcie 8 sprawdza bramki zamachu (16.8.1). Spór 1922, wystąpienia, uroczystość 1923 i impulsy po wydarzeniach sprawdza `PolishPolitics.afterEvents` przy każdym wejściu do `post_event`, przed kolejką.

### 4.3. Kontrakt akcji

`ActionTxn` zawiera: `id, action_id, instance_id, source, time, input_revision, phase, resource_cost, transfers, effects, cooldowns, consumes_month, selected_options`. `selected_options` zapisuje zestaw zgodny z limitem karty z 17.1; domyślnie jeden wybór. `source` ma wartość `main|advisor|event|cabinet`; ostatnia identyfikuje samodzielną inicjatywę państwa z 17.16.4, nie dodatkową akcję PPS; `phase` to `preview|committed|settled`.

```js
if (alreadyApplied(txn.id)) return savedResult(txn.id);
validateStateAndPhase(txn);
const draft = deepCopy(authoritativeState);
validateGatesAndCosts(draft, txn);
applyCostsAndEffects(draft, txn);
validateInvariants(draft);
publish(draft, txn.id); // jeden punkt zatwierdzenia
```

Anulowanie przed `committed` niczego nie refunduje, bo koszt nie został jeszcze pobrany. Po zatwierdzeniu „powrót” jest nawigacją, nie cofnięciem polityki. Przekierowanie doradcy do karty przekazuje ten sam identyfikator transakcji i jej tryb; nie pobiera drugiego miesiąca.

**K — etap 1 (0.42):** akcje polskich doradców zatwierdza `PolishRules.commitAdvisorAction` (scena `polish_advisor_commit`). Przekierowany krok nie zużywa miesiąca, także gdy karta otwiera dalej następną kartę. Odziedziczone karty pobierają akcję przy otwarciu; „Close card” i „Back to main” z pierwszej strony karty cofają dokładnie pola zmienione przez kod jej otwarcia (`PolishRules.openingKeys`) i zwracają kartę do ręki. Po wybraniu opcji zamknięcie jest tylko nawigacją. Nowe karty z etapów 2–7 użyją pełnej transakcji.

### 4.4. Ręka i odnowienia

**K:** normalne dobieranie z talii jest jednolite wśród legalnych kart; `frequency` nie waży zwykłego doboru w obecnej konfiguracji. Źródła: `source/scenes/main.scene.dry` oraz `node_modules/dendrynexus/lib/engine.js`.

**P:** zachowujemy ten model. Gracz wybiera talię, a silnik losuje jedną kartę spośród N legalnych kart tej talii z prawdopodobieństwem 1/N. W ręce mogą być łącznie trzy karty, nie trzy z każdej talii. Jeśli N=0, dobieranie jest niedostępne z podanym powodem.

Legalność karty: aktywny polski manifest, dostępna data, brak wyczerpania wizyt, spełnione `view-if`, brak tej samej instancji w ręce, upłynięte odnowienie. `choose-if` sprawdza konkretną opcję ponownie w chwili użycia. Utrata resortu może zablokować opcję w już dobranej karcie.

P — reguły obsługi:

- Jedno dobrowolne odrzucenie karty na miesiąc jest darmowe; licznik `S.turn.discard_used` zeruje się wyłącznie po zmianie t.
- Karta całkowicie nieważna wskutek zmiany stanu jest usuwana automatycznie. Nie daje efektu ani zwrotu już poniesionych kosztów.
- Projekty i krytyczne odpowiedzi znajdują się poza trzema miejscami ręki. Ich wykonanie nadal kosztuje akcję, chyba że są odpowiedzią w trwającym wydarzeniu.
- Gwarantowane bezpłatne finansowo działanie „Praca organizacyjna” zużywa miesiąc. **Z — 0.34:** dodaje 2 zasięgu jednej branży związkowej albo 2 do `base_reach_pps` w komórkach jednej wybranej klasy, np. chłopów lub inteligencji. Nie dotyczy prasy ani TUR. Mnożnik charakteru partii z 10.6 działa także tutaj. Zapobiega utknięciu przy pustej kasie.
- Zwykła talia Government znika, gdy nie ma legalnej opcji; talia Parliament nie wymaga wejścia do gabinetu.

Odnowienia zapisujemy jako datę dostępności: `available_at=t+cooldown`. Nie zmniejszamy ich przy każdym wejściu do `post_event`. Pozostały czas to `max(0,available_at-time)`.

Doradcy mają jedno wspólne `available_at`, ustawiane na t+6 po zatwierdzeniu działania. Wejście do menu i anulowanie nie uruchamia odnowienia. Przywrócenie dawnego doradcy go nie resetuje.

**K — etap 1 (0.42):** `S.cooldowns.advisor` przechowuje datę, a `advisor_action_timer` jest tylko polem wyświetlania. Stała karta „Discard a card” daje jedno darmowe odrzucenie w miesiącu (`S.turn.discard_used`). Dobieranie wybiera równomiernie spośród legalnych kart talii posortowanych po ID, z zapisanym rzutem (`source/rules/polish_engine_hooks.js`); sprawdzanie, czy talia ma kartę, nie zużywa losowania. Agenda jest na razie funkcją `PolishRules.agendaItems`, bez widoku dla gracza.

**K — etap 5 (0.46):** praca organizacyjna jest stałą pozycją karty „Party Agenda” (`polish_party_agenda`): 1 T, 0 R, +2 zasięgu jednej branży albo +2 bazy PPS w jednej klasie (×1,10 w środowisku partii z 10.6), dostępna przy każdej kasie; nie dotyczy prasy ani TUR. Karta otwarta przez doradcę ma w trybie doradcy opcję zamknięcia `cancel_advisor_action`, od etapu 5 także w 13 kartach `polish_gov_*`; zamknięcie nie zwraca odnowienia doradców.

### 4.5. Kolejka wydarzeń

`EventRun`: `id,definition_id,instance_key,due_date,priority,phase,entered_at,context_snapshot,payload,choices,roll_ids,applied_effect_ids,resolution`. `payload` zaczyna jako `{}` i zawiera stan właściwy tej sprawie. `instance_key` jest np. identyfikatorem umowy i numerem naruszenia, nie samą nazwą karty. Ten sam schemat obowiązuje w katalogu rozdziału 17.

| Kolejność | Rodzaj | Reguła |
|---|---|---|
| 1 | Już rozpoczęta sekwencja | Wznawia zapisaną fazę; nie rozpoczyna drugiej kopii |
| 2 | Natychmiastowa sukcesja lub rozpoczęta konfrontacja | Rozstrzyga instytucje niezbędne do dalszych czynności |
| 3 | Wybory i prawnie ustalone głosowania | Termin dzienny przed późniejszym wydarzeniem tego miesiąca |
| 4 | Ultimata i terminy projektów | Według daty, potem stałego identyfikatora |
| 5 | Warunkowe kryzysy gospodarcze i partyjne | Tylko jeśli ich przyczyna nadal istnieje |
| 6 | Zdarzenia tła | Nie opóźniają bez końca terminów wyższych kategorii |

Najpierw porównuje się rzeczywiste daty; priorytet rozstrzyga zdarzenia równoczesne i zależności. Wybory, których wynik został już legalnie zapisany jako koniec rozdziału, nie są cofane przez później otwarty kryzys. Zamach rozpoczęty wcześniej przerywa możliwość udawania, że głosowanie odbywa się normalnie. **Z — 0.28 (M06):** obowiązkowa sekwencja wyboru urzędu nie może zablokować kolejki. Przy nierozstrzygnięciu kończy się, oddaje graczowi zwykłą turę i planuje nowe głosowanie na następny miesiąc (7.3).

**Z — 0.39: kategorie siedmiu wydarzeń.** Opis tych wydarzeń nie podawał kategorii. Użytkownik zatwierdził bez zmian przypisanie zaproponowane w katalogu kart:

| Wydarzenie | Kategoria |
|---|---|
| `opening.cabinet_1922` | 2 — sukcesja instytucji |
| `politics.pils_parliament_criticism` | 6 — tło |
| `presidency.security_crisis` | 2 — sukcesja |
| `presidency.assassination_response` | 5 — warunkowy kryzys; zawsze po obsłużeniu wakatu (17.6) |
| `society.niewiadomski_cult` | 6 — tło |
| `society.strike_settlement_rejection` (E6) | 1 — część rozpoczętej sekwencji strajku |
| `cabinet.austerity_1926` | 4 — termin przeglądu |

**K — etap 1 (0.42):** `post_event` bierze tylko sceny z tagiem `pl_event`. `PolishRules.nextEvent` wybiera jedną według kategorii i ID, a scena `polish_event_router` przechodzi do niej przez `go-to-ref`. Wydarzenie zamyka się dopiero wtedy, gdy router do niego wszedł; wybrane, ale nierozegrane z powodu pierwszeństwa wyborów wraca w następnej wizycie. Niemieckie wydarzenia (tag `event`) nie są już oferowane.

Jednorazowy szok ma znacznik wykonania. Powtarzalny kryzys wymaga wygaśnięcia poprzedniej instancji oraz okresu odnowienia. Przekroczenie progu nie wykonuje tego samego szoku przy każdym odwiedzeniu ekranu.

**K — etap 4 (0.45):** kolejka zna trzy polskie wydarzenia gospodarcze: `polish_event_stabilization` (9.11 katalogu, kategoria 5), `polish_event_credit_crisis` (9.12, kategoria 5) i `polish_event_austerity_1926` (9.13, kategoria 4). Każde rozstrzyga się raz w rozdziale.

**K — etap 5 (0.46):** karta E3 `polish_event_faction_split` (definicja `party.faction_split`, kategoria 5) zastępuje w kolejce trzy automatyczne sceny kryzysu frakcji; te dostały znacznik `event` i zostają w plikach. Instancja ma klucz sprawy (`keyed_by: faction_case`): `polish_event_faction_split:<case_id>`. Nowa sprawa tej samej frakcji otwiera nową instancję, a rozstrzygnięta nie wraca.

**K — etap 6 (0.47):** trzy wydarzenia strajkowe mają klucz sprawy `strike`: strajki 1923 `society.strike_1923` (kategoria 5), odpowiedź Sejmu `parliament.strike_response` (kategoria 5, klucz strajku i fazy) i E6 `society.strike_settlement_rejection` (kategoria 1, klucz strajku i ugody). Nowa ugoda tego samego strajku otwiera nową instancję E6; zapis i wczytanie jej nie powtarzają.

**K — etap 7 (0.48):** kolejka ma sześć nowych definicji. Z kluczem `politics`: krytyka parlamentu B2 (kategoria 6), kryzys gabinetowy B1 `opening.cabinet_1922` (2), mobilizacja B4 `presidency.assassination_response` (5) i kult B5 `society.niewiadomski_cult` (6). Zamach `coup.attempt` (2) ma klucz próby i fazy. Zagrożenie B3 rozlicza się w sekwencji prezydenckiej bez menu i zapisuje od razu rozstrzygnięty `EventRun`. Wybrane wydarzenie kategorii 1–2 wyprzedza należne wybory, urzędy i obowiązkowe formowanie gabinetu; rozpoczęta sekwencja nadal ma pierwszeństwo. Po zabójstwie sekwencja prezydencka czeka na B4, zanim Zgromadzenie Narodowe zbierze się ponownie.

### 4.6. Jawna, zapisywana losowość

Wyniki mandatów, sumy głosów, koszty i wypłaty są deterministyczne. Losowość może dotyczyć niepewnego posłuchu, konfrontacji i zagrożenia przemocą; każda taka decyzja ma jawnie określony rozkład. Zatwierdzony wyjątek przy obsadzie urzędu: równy wynik dwóch finalistów wyborów prezydenta lub marszałka rozstrzyga zapisane losowanie 50/50 z 7.3. Nie zmienia ono policzonych głosów.

`roll(challenge_id)` losuje raz z U[0,1), zapisuje w `S.rng.rolls` i później zwraca ten sam wynik. Przykładowy identyfikator: `coup_1:formation_near_reserve:allegiance`. Zmiana deklaracji PPS zmienia warunki, nie losuje od nowa tej samej lojalności.

Implementacja ma korzystać ze zweryfikowanego generatora z ziarnem zapisywanym w stanie. Nie wolno polegać na przypadkowym wyborze jednego z wielu jednocześnie prawdziwych `go-to`. Jeśli reguła ma być deterministyczna, dopuszczalny jest dokładnie jeden rezultat.

**K — etap 1 (0.42):** `PolishRules.roll` używa generatora Mulberry32 z ziarnem z funkcji FNV-1a dla `S.meta.seed` i ID wyzwania; wynik trafia raz do `S.rng.rolls`.

## 5. Elektorat, kampania i przepływy poparcia

### 5.1. Model obecny a następca

**K:** pięć głównych wag wynosi 27, 110/9, 50/9, 53 i 20/9. Dodatkowo w obecnych obliczeniach uczestniczą bezrobotni i mniejszości jako nakładające się wagi. Źródła: `source/scenes/root.scene.dry`, `election_algorithm.scene.dry`, `post_event.scene.dry`.

**P:** nowy elektorat składa się z rozłącznych komórek. Komórka ma `class_id,identity_id,employment,mass,propensity,turnout,grievance,radicalization,trust_pps,base_reach_pps`. `reach_pps` jest pochodną z 5.3. `mass` to udział w modelowanej puli wyborców; suma wynosi 1.

Zachowujemy pięć klas i ich obecne znaczenie: robotnicy, drobnomieszczaństwo, inteligencja, chłopi oraz burżuazja i ziemiaństwo. Robotników rolnych można wydzielić jako podgrupę, nie przez zmianę etykiety innej istniejącej klasy.

Z — jedyne wartości `identity_id` to `polish,jewish,other_minorities`: polska większość, Żydzi, pozostałe mniejszości. Nie ma dalszych narodowych podziałów, także jako ukrytych osobnych relacji. Model pracy używa `employed,unemployed,not_in_modelled_labor_force`. Dokładne krzyżowe liczebności wymagają badań.

P — testowy rozkład tożsamości 70/10/20, niezależny od klasy, zachowuje 30% łącznej puli mniejszości. **Nie jest rekonstrukcją demograficzną.** Przyszły profil historyczny zastępuje macierz tych samych trzech kategorii, a nie dodaje kolejnych narodowości lub drugiej nakładającej się populacji. Łączenie komórek początkowej konfiguracji sumuje ich masę i waży preferencje; ich frekwencja początkowa jest jednakowa. Nie definiujemy tu migracji hipotetycznego zapisu z sześcioma różniącymi się już frekwencją kategoriami. Niezmienne istniejące wyniki wyborów nigdy nie są przeliczane przez taką zmianę modelu.

Dla testu udział w modelowanej miejskiej sile roboczej wynosi: robotnicy 1, inteligencja 0,5, drobnomieszczaństwo 0,25, pozostałe 0. Stopa bezrobocia dzieli tylko tę pulę. Przesunięcie zatrudniony → bezrobotny zachowuje klasę, tożsamość i całkowitą masę.

**K — etap 5 (0.46):** 54 rozłączne komórki: klasa × tożsamość (70/10/20) × zatrudnienie × osiedle; klasy miejskie mają połowę masy w dużych miastach (P z 10.4.4). Komórka ma `mass`, `propensity`, `turnout_base` 0,70, `turnout_bonus`, `trust_pps` 50, `base_reach_pps` 20 i zapis kampanii. Bezrobotni są stanem zatrudnienia, nie drugą pulą: zmiana stopy bezrobocia przesuwa masę między zatrudnionymi a bezrobotnymi tej samej klasy, tożsamości i osiedla (`PolishElectorate.applyEmployment`), a trend klas skaluje masy klas (`applyClassShares`). Suma mas wynosi 1.

### 5.2. Preferencje i wynik

```js
p[cell,party] = max(0,propensity[cell,party]) /
               sumParty(max(0,propensity[cell,party]));
poll[party] = 100 * sumCell(mass[cell] * p[cell,party]);
votes[party] = 100 * sumCell(mass[cell] * turnout[cell] * p[cell,party]) /
                    sumCell(mass[cell] * turnout[cell]);
```

Sondaż pokazuje preferencje; przewidywany wynik może dodatkowo uwzględniać uczestnictwo. Początkowe `turnout=0.70` we wszystkich komórkach jest parametrem P, więc początkowo oba rozkłady są takie same.

Każdy wiersz musi mieć dodatnią sumę. Błąd danych nie tworzy wyniku wyborów. Gdy społeczny proces usuwa ostatnią dodatnią preferencję, zachowuje ostatni prawidłowy wiersz i zapisuje błąd do diagnostyki.

Po zmianie o pp zapisujemy cały nowy znormalizowany wiersz do `propensity` w skali 0–100, nie dodajemy pp do arbitralnej surowej wagi. `p` i krajowy sondaż są następnie wyliczane; nie mają niezależnych zapisów. Przemieszczenie masy między zatrudnieniem a bezrobociem przenosi proporcjonalnie dotychczasowe preferencje; ich zmiana polityczna jest osobnym skutkiem.

P — inicjalizacja preferencji używa obecnych pięciu wierszy klasowych. Dla mniejszości stosuje raz mnożnik:

```js
modifier[party] = sqrt((minorityRow[party] + 0.1) /
                      (classWeightedNationalRow[party] + 0.1));
raw[cell,party] = classRow[cell.class_id,party] *
                 (cell.identity_id === "polish" ? 1 : modifier[party]);
```

Następuje normalizacja. Obie kategorie mniejszości zaczynają od tego samego testowego mnożnika. Ich późniejsze preferencje mogą różnić się wskutek konkretnych polityk; różnice początkowe wymagają profilu źródłowego.

**K — etap 5 (0.46):** decyzja 1A etapu 5: preferencje komórek pochodzą z wierszy klas (komórki polskie z wiersza swojej klasy bez bloku mniejszości, komórki mniejszości z wiersza mniejszości przechylonego ku klasie), a jedno skalowanie proporcjonalne (raking) doprowadza je do dotychczasowego wyniku krajowego. Sondaż otwarcia jest więc taki sam jak przed etapem 5; wzoru z pierwiastkowym mnożnikiem nie stosujemy, bo zmieniłby wynik otwarcia i wybory 1922. Blok mniejszości ma w komórkach mniejszości ok. 68% (wiersz: 70%). Sondaż i głosy (`poll`, `votes`) liczymy z komórek; wynik krajowy zaokrąglamy do 10⁻¹², żeby szum obliczeń nie przesuwał mandatów. Wiersze klas są średnimi komórek klasy, łącznie z mniejszościami tej klasy (np. PPS wśród robotników 32,6% zamiast 38,6%); zmiany zapisane w nich przez odziedziczone karty `absorbRowEdits` przenosi raz na komórki.

**K — etap 8 (0.49), decyzja 2A:** wiersze klas otwarcia mnoży jeden współczynnik na partię (wspólny dla wszystkich klas; wiersz zachowuje sumę), tak by bierna PPS dostała w XI 1922 bazowy Sejm M02 z dokładnością ±5 mandatów na klub: KPP 2, PPS 43, NPR 19, Wyzwolenie 48, Piast 70, PSChD 59, ZLN 99, mniejszości 90, Inne 14. Krzywa mandatów, frekwencja i wielkości klas bez zmian. Kalibracja: [`analysis/stage8-campaigns/calibration.json`](../analysis/stage8-campaigns/calibration.json). Skutek: KPP ma na starcie 3,2% wśród robotników, poniżej progu 5% wspólnego strajku (9.6).

### 5.3. Kampania z malejącą skutecznością

Kampania wybiera zbiór komórek i temat. Zmiana udziału PPS wewnątrz komórki:

```js
gain_pp = 4 * (0.5 + reach_pps/200) * (trust_pps/100) *
          (1 - Q.dissent) * (1 - pps_share/100) /
          (1 + campaigns_same_topic_last_6m);
gain_pp = min(gain_pp, 100 - pps_share);
```

Koszt: 1 R i 1 główna akcja. `pps_share` jest tu procentem 0–100. `reach_pps` i `trust_pps` są ocenami 0–100. Licznik dotyczy tej komórki i tematu, wygasa po sześciu miesiącach.

W profilu P każda komórka zaczyna z własnym zasięgiem PPS 20 i zaufaniem 50. Dla zwykłej kampanii efektywny `reach_pps=clip(0.50*matchingUnionReach+0.30*pressEffectiveReach+0.20*cell.base_reach_pps,0,100)`. Komórki bez odpowiedniego związku używają własnego zasięgu jako `matchingUnionReach`; przy kilku branżach stosujemy średnią według rozłącznych udziałów odbiorców. Organizowanie zmienia właściwą branżę; kampania nie dodaje równocześnie darmowego zasięgu. Kampania prasowa mnoży zysk przez `0.5+0.5*pressEffectiveCredibility/100`. Wariant organizowany wyłącznie przez związki używa `reach_pps=matchingUnionReach` i nie dziedziczy modyfikatorów prasy. Efektywne wartości prasy po formacie i ograniczeniach określa 13.2.

PPS zyskuje `gain_pp`; pozostałe partie tracą łącznie tyle samo, proporcjonalnie do swoich udziałów. Wyjątek: kampania polemiczna z 10.6 odbiera głosy wyłącznie wskazanym obecnym adresatom, proporcjonalnie w ich puli; mniejsza pula ogranicza zysk, bez ujemnych preferencji. Jeśli nie ma nie-PPS głosów, zysk=0. Przykładowe +2 pp w grupie o wadze 27% daje około +0,54 pp krajowo przy niezmienionych pozostałych wejściach, nie +2 pp krajowo.

Kampania mobilizacyjna zamiast preferencji dodaje 0,04 do `turnout` odbiorców, do pułapu 0,90; wygasa po wyborach. Nie zmienia ich preferencji drugi raz.

Ukończony kurs TUR z 13.2 daje jednorazowo `turCampaignMultiplier=1.10` dla objętej komórki i tematu; bez aktywnego przygotowania 1. Mnożymy wynik również przez pojedynczy `strategyFactor` z 10.6. Po wszystkich modyfikatorach kampanii ponownie ograniczamy zysk do `100-pps_share` oraz dostępnej puli odbieranych głosów. Wykorzystany wpis wygasa, nie mnoży kolejnych kampanii ani frekwencji.

**K — etap 5 (0.46):** kampanie są w karcie „Media and Campaigns” (`polish_party_media`, 5.3 katalogu): najpierw temat, potem odbiorcy (klasa, zatrudnieni robotnicy, bezrobotni, duże miasta, wyborcy żydowscy, wyborcy innych mniejszości); 1 T i 1 R. Zysk w komórce liczy wzór tej sekcji z zasięgiem `0,5·związek + 0,3·prasa + 0,2·baza`; komórki robotnicze czytają średni zasięg trzech branż, pozostałe własną bazę (P). Dalej mnożą: wiarygodność prasy, `strategyFactor` z 10.6, premia TUR i efekty doradców (10.4.4). Nasycenie liczy kampanie tego tematu w komórce w ostatnich 6 M. Kampania przez związki nie korzysta z prasy, polemika odbiera głosy tylko adresatom i obniża ich relację o 2, a mobilizacja dodaje 0,04 frekwencji, do 0,90, do najbliższych wyborów. Śledztwo prasowe jest zablokowane do spraw etapu 7.

### 5.4. Rezultat polityki i odpowiedzialność

Wykonany postulat zwiększa `trust_pps` dotkniętych komórek o 4 i daje jednorazowy impuls preferencji 1 pp, pomnożony przez przypisany udział odpowiedzialności PPS. Złamana własna obietnica: −8 zaufania i −2 pp preferencji w jej grupie odbiorców.

Udział odpowiedzialności jest zapisywany w projekcie/umowie, a nie ustalany dopiero po dobrym wyniku: PPS wykonuje własny resort 0,70; współwykonanie 0,40; wynegocjowana umowa zewnętrzna 0,35; samo głosowanie bez autorstwa 0,15. Pozostała zasługa przypada nazwanym wykonawcom. Sumy udziałów nie przekraczają 1.

Skutki gospodarki ogólnej są miesięczne i mniejsze od efektu jednego postanowienia. Przepływ poparcia za warunki życia określa 5.6, a przepływ przez niezadowolenie rozdział 15. Nie dodaje się tej samej poprawy płac ponownie jako pełnej nagrody „wykonano politykę” co miesiąc.

**D — autorstwo bez własnego resortu (P, M05):** projekt zapisuje `sponsor=pps`, administrację Pracy jako wykonawcę i udział PPS **0,40** za autorstwo; pozostałe 0,60 to udział wykonawczy rozliczany według faktycznego wykonawcy. Używamy istniejącej skali, nie nowej premii. Za samo D1, głosowanie Sejmu lub wejście ustawy w życie nie przyznajemy nagrody za wykonanie. Po pierwszym pełnym wykonaniu wybranego wariantu PPS otrzymuje raz +1,6 `trust_pps` i +0,40 pp preferencji odbiorców (4 i 1 pp × 0,40). Przy wypłacie częściowej ta nagroda czeka na pełne wykonanie; bieżąca ulga gospodarcza działa od razu według 12.3. Ograniczony wariant przy wykonaniu 1 spełnia swoją mniejszą obietnicę.

Udział autorski D nie sumuje się z udziałem za samo głosowanie, tolerowanie ani późniejsze objęcie Pracy. Zmiana rządu nie zmienia autorstwa ani nie ponawia nagrody. Zapis `responsibility` i identyfikator nagrody należą do tego samego programu, z którego korzysta karta Pracy. Brak wykonania przez cudzy resort zgłaszamy jako niewykonanie obowiązku tego wykonawcy; nie jest automatycznie złamaniem własnej obietnicy PPS. Rzeczywiste własne zobowiązania PPS nadal podlegają 9.2.

**K — etap 4 (0.45):** projekt zapisuje udział PPS przy decyzji: własny resort 0,70, autorstwo bez resortu (D) 0,40. Zaufanie komórek i impuls preferencji z wykonanego postulatu zostają w `pending_effects` projektu do etapu 5. Obowiązek przypisany resortowi, którego PPS nie ma, nie jest jej złamaną obietnicą (`PolishGovernment.ppsResponsible`).

**K — etap 5 (0.46):** wpisy `pending_effects` projektów rozliczają się raz w księdze partii: wpis zaufania daje zapisaną wartość komórkom odbiorców, a nagroda 5.4 (`reward:5.4`) +4 × udział PPS zaufania (chyba że projekt ma własny wpis zaufania) i +udział pp preferencji. Odbiorców projektu przypisujemy komórkom prostym kluczem P, np. osłona → bezrobotni, reforma rolna → chłopi, szkoły mniejszości → komórki mniejszości. Złamana własna obietnica PPS daje raz −8 zaufania i −2 pp w komórkach jej odbiorców.

### 5.5. Organizacje mniejszości nie są komórkami populacji

Mamy dwóch zbiorczych rozmówców parlamentarnych: `jewish_rep` i `other_minorities_rep`. Ich relacje w `S.actors` zaczynają testowo od 50; zmieniają je te same rozmowy i naruszenia co inne relacje. `bund` jest partnerem organizacyjnym w kategorii żydowskiej, z własnym zaufaniem do wspólnej akcji, bez automatycznie przypisanych mandatów. Zwiększenie zaufania Bundu nie zmienia liczby żydowskich wyborców, senatorów ani posłów. **Z — 0.33: Bund nie jest partią.** Nie ma go na liście partii i relacji, na listach wyborczych ani w Sejmie; występuje tylko jako partner wspólnych akcji pracowniczych. Zaufanie Bundu zaczyna testowo od 50, jak relacje obu reprezentacji, i zmienia się tylko przez wykonane wspólne akcje.

Dziewięć partii wyborczych pozostaje bez zmian. Dwa segmenty dzielą tylko mandaty `minorities_bloc`: testowo w proporcji 1/3 i 2/3 metodą największych reszt, oddzielnie w każdej izbie, z rozstrzyganiem remisu po ID. To roboczy podział gry, nie historyczny skład BMN. Każdy segment składa jedną deklarację głosowania. Nie tworzymy ukrytych dalszych klubów narodowych. `Q.minorities_bloc_relation` po migracji jest wyłącznie średnią obu relacji ważoną ich mandatami sejmowymi, a przy braku mandatów wagami 1/3 i 2/3; nie ma równoległego trzeciego autora relacji.

Porozumienie z klubem zapisuje wyłącznie jego głosy. Porozumienie o prawie językowym wskazuje odbiorców polityki. Porozumienie z organizacją pracowniczą wskazuje zdolność wspólnej akcji. Dopiero wykonywanie tych umów łączy ich efekty.

**K — etap 3 (0.44):** blok mniejszości dzieli mandaty i senatorów na reprezentację żydowską (1/3) i pozostałe mniejszości (2/3) metodą największych reszt, np. 17 → 6 i 11. Oba segmenty mają relację 50 i osobno oceniają oferty. Stare pole `minorities_bloc_relation` jest średnią ich relacji ważoną mandatami. W wyborach urzędów oba głosują jak dawny blok.

**K — etap 5 (0.46):** Bund jest w `S.actors.bund` (zaufanie 50, lista wspólnych akcji), bez relacji, listy i klubu. Zaufanie zmienia tylko wykonana wspólna akcja, raz na jej ID: +5 za zakończoną zgodnie, −5 za złamanie zasad (P). Wspólne akcje przyniosą strajki etapu 6.

**K — etap 6 (0.47):** strajk przemysłu przy linii współpracy żydowskiej innej niż „żadna” jest wspólną akcją pracowniczą z Bundem. Jego koniec zapisuje wynik raz: +5 zaufania za zakończenie zgodne z ugodą, −5 za złamanie ugody przez PPS, w pozostałych przypadkach bez zmiany.

### 5.6. Warunki życia i odpowiedzialność za rząd — przepływ M09

**Z — zatwierdzone 25 IX 2026 (M09):** gospodarka zmienia preferencje co miesiąc, także bez złamanej obietnicy. Pogorszenie warunków życia klasy odbiera poparcie partiom odpowiedzialnym za rząd, a poprawa nagradza je w połowie siły. Struktura jest zatwierdzona, liczby są P do balansu. Źródło: `PL-M09-LIVING-CONDITIONS-2026-09-25`; diagnostyka: [analysis/m09-living-conditions/REPORT.md](../analysis/m09-living-conditions/REPORT.md).

**Wskaźnik klasy.** Pochodna liczona z migawki po gospodarce okresu t (punkt 5 z 4.2):

```js
general = (real_wage - 100) - 2*(unemployment - 3);   // unemployment w %
ruralIndex = clip(100 + (45-agrarian_pressure)*0.4 +
                  targetedRuralImprovements, 40, 140); // 11.6
conditions = {
  workers:              100 + 1.00*general,
  new_middle:           100 + 0.50*general,            // inteligencja
  old_middle:           100 + 0.25*general,            // drobnomieszczaństwo
  rural:                ruralIndex + 0.20*general,     // chłopi
  bourgeois_landowners: 100,
};
```

Identyfikatory klas to istniejące `Q.classes` z `source/scenes/root.scene.dry` (K). Udziały klas miejskich odpowiadają ich udziałom w miejskiej sile roboczej z 5.1. Chłopi czytają w pełni wskaźnik wsi i w 1/5 ogólną gospodarkę, czyli słabiej niż każda reagująca klasa miejska. Wszystkie komórki klasy, każdej tożsamości i każdego stanu zatrudnienia, czytają ten sam wskaźnik. Mniejszości nie mają osobnego wskaźnika.

**Przepływ miesięczny.** Przepływ czyta wyłącznie zmianę. Poziomy odniesienia 100 i 3% ani trwale niski, lecz stały poziom płac nie tworzą go same:

```js
change = conditions[c] - S.society.living_conditions_last[c];
flowPP = change < 0 ? -min(0.50, 0.10*-change)   // pogorszenie
       : change > 0 ?  min(0.25, 0.05*change)    // poprawa, połowa siły
       : 0;
S.society.living_conditions_last[c] = conditions[c];
```

W każdej komórce klasy `c` przepływ zmienia jej wiersz preferencji w pp (5.2). `r[p]` oznacza odpowiedzialność partii, `share[p]` jej obecny udział w komórce, a `F` — partie z `r=0`:
- pogorszenie: `amount=min(-flowPP, sum(r[p]*share[p]))`. Partia odpowiedzialna traci `amount*r[p]*share[p]/sum(r*share)`, a partie `F` zyskują łącznie `amount`, proporcjonalnie do swoich udziałów;
- poprawa: `amount=min(flowPP, sum(share[F]))`. Partie `F` tracą proporcjonalnie do udziałów, a odpowiedzialne zyskują proporcjonalnie do `r*share`;
- gdy w komórce nie ma odpowiedzialnej partii z dodatnim udziałem albo nie ma żadnej partii `F`, przepływu nie ma.

Granica `sum(r*share)` chroni przed ujemnym udziałem przy małej puli i mieszanych wagach. Wiersz pozostaje znormalizowany do sumy 100.

**Kto odpowiada.** Odczyt z `S.cabinet` i `S.agreements` tej samej migawki, także dla gabinetu pełniącego obowiązki:
- partia premiera i partie członkowskie z resortami: `r=1`;
- partie z obowiązującym podpisanym wsparciem albo jawną tolerancją gabinetu, w tym gwaranci gabinetu eksperckiego (8.7) i PPS w `external_support` z `hasCurrentCabinetSupport` (17.10): `r=0,5`;
- opozycja, także głosująca za pojedynczą ustawą: `r=0`.

Premier bezpartyjny i ministrowie fachowi nie mają własnych wyborców. Gabinet bez partii członkowskich i bez podpisanego wsparcia nie tworzy przepływu.

**Czego przepływ nie liczy drugi raz:**
- Inflacja działa tylko przez płace realne, a spadek produkcji tylko przez bezrobocie. Nie ma osobnego członu inflacji, wzrostu ani dodatkowej straty oszczędności klas średnich.
- Świadczenia, osłona, `ongoingRelief` i ulga ugody z 14.5 nie wchodzą do wskaźnika. Działają przez niezadowolenie 15.1 i nagrodę 5.4.
- Przesunięcie masy do bezrobotnych zachowuje preferencje (5.1–5.2); bezrobocie działa wyłącznie przez człon `general`.
- Wykonana transza rolna zmienia `targetedRuralImprovements` raz, więc daje najwyżej jeden miesięczny przepływ poprawy. Nagroda autorska 5.4 pozostaje osobna.
- `grievance` z 15.1 czyta `realWageForCell` niezależnie; przepływ 5.6 go nie zmienia.
- Odpływ za niewykonane zobowiązania z 17.4 pozostaje osobnym skutkiem z własnym limitem 0,5 pp.
- Nie ma dryfów zależnych od daty (17.3). Odziedziczone niemieckie reguły poparcia wyłącza 20.2, a nieużywane `Q.<klasa>_qol` pozostają bez zapisu.

**Kolejność i zapis.** W punkcie 6 z 4.2 najpierw liczymy przepływ 5.6 dla wszystkich klas, potem odpływ z 17.4 na już zmienionych wierszach. Rekord historii okresu zapisuje dla każdej klasy `change`, `flowPP` i pp przeniesione według partii, z powodem `living_conditions`. Wczytanie zapisu nie powtarza przepływu.

**Diagnostyka (P, nie prognoza wyborów).** Na archiwalnych przebiegach M02 (3 Sejmy × 4 strategie, ziarno 01) sam ten przepływ zmienia krajowe poparcie PPS o −0,1 do +0,6 pp w rozdziale. Hiperinflacja 1923 za Chjeno-Piasta odbiera partiom rządu 2,2 pp wśród robotników, a PPS w opozycji zyskuje tam 1,0 pp. Przepływ netto w rozdziale wynosi:
- robotnicy: 1,5–2,4 pp;
- inteligencja: 0,8–1,5 pp;
- drobnomieszczaństwo: 0,4–0,7 pp;
- chłopi: 0,3–0,5 pp (z samym wskaźnikiem wsi byłoby 0,03–0,19 pp);
- burżuazja: 0.

Chłopi przesuwają zawsze mniej niż robotnicy i inteligencja, a mniej niż drobnomieszczaństwo w 10 z 12 przebiegów.

**K — etap 4 (0.45):** przepływ działa co miesiąc na siedmiu wierszach klas `Q.<klasa>_<partia>`, z których liczymy wybory (decyzja etapu 4): wiersz „bezrobotni” czyta wskaźnik robotników, wiersz „mniejszości” średnią wskaźników pięciu klas ważoną ich wielkością (P). Waga `Q.unemployed` w wyborach wynosi stale 3, więc bezrobocie działa tylko przez człon `general`. Odpowiedzialność czyta `S.cabinet`: partia premiera i członkowie 1, wspierający i tolerujący 0,5 (także PPS przy Ponikowskim). Po przepływie odziedziczone wiersze niemieckich partii dostają nowe wartości, więc nie powstaje fałszywa różnica.

**K — etap 5 (0.46):** przepływ działa od etapu 5 w komórkach: każda komórka dostaje zmianę wskaźnika swojej klasy z tą samą regułą odpowiedzialności, a wynik liczymy z komórek. Wiersze klas są potem kopiami.

## 6. Wybory i niezmienny zapis parlamentu

### 6.1. Zachowana metoda pierwszych wyborów

**K, zachować:** najpierw obliczyć głosy partii, potem listy, potem 444 mandaty list i ich przypisanie do partii. Pierwszy ChZJN grupuje `zln+pschd`. „Inne” dzieli się na listy po 2% i resztę. Nie dostaje premii jednej dużej listy.

| Głosy listy v w % | Mnożnik m(v) |
|---|---:|
| v ≥ 25 | 1,25 |
| 15 ≤ v < 25 | 1,10 |
| 10 ≤ v < 15 | 1,025 |
| 5 ≤ v < 10 | 0,85 |
| 2 ≤ v < 5 | 0,55 |
| 0 ≤ v < 2 | 0,25 |

```js
weight[list] = vote_share[list] * multiplier(vote_share[list]);
exact[list] = 444 * weight[list] / sum(weight);
seats[list] = floor(exact[list]);
```

Pozostałe mandaty otrzymują największe reszty, a remis rozstrzyga rosnący stabilny identyfikator. Wspólna lista rozdziela swój wynik na partie proporcjonalnie do ich głosów, również metodą największych reszt.

Jest to zatwierdzona heurystyka gry, **nie historyczna ordynacja okręgowa**. Nie zastępujemy jej inną metodą tylko dlatego, że powstaje techniczny przewodnik. Źródło: `source/scenes/sejm_election_result.scene.dry`; obecne testy `tests/sejm-election.test.js`.

P — następne wybory używają tej samej jawnej metody, lecz aktualnych porozumień listowych. Nie dziedziczą automatycznych niemieckich progów i wykluczeń. Zmiana ordynacji w grze wymaga odpowiedniego prawa i wersji `method` zapisanej w wyniku.

**K — etap 2 (0.43):** obliczenie mandatów przeniesiono ze sceny `sejm_election_result` do `PolishInstitutions.allocateSeats` bez zmiany wyników; sprawdzono to na 20 000 losowych danych. Następne wybory nie stosują niemieckich progów i wykluczeń (`constitutional_reform`, `electoral_threshold`, `…_banned`). Wspólna lista działa dla dowolnego porozumienia; w 1922 jest nią tylko ChZJN, a nowe porozumienia wprowadzi karta 7.7 katalogu w etapie 3.

### 6.2. Porozumienia listowe

`ElectoralAlliance`: `id,election_id,members,accepted_by,nomination_terms,valid_until,withdrawal_rules`. Wspólna lista wymaga zgody każdego członka. Jeden aktor nie może należeć do dwóch list w tej samej puli. Po zamknięciu list nie można zmienić jej składu zwykłą kartą relacji.

Pierwsze ChZJN zachowuje istniejącą regułę. Nowe sojusze są P: porozumienie nie dostaje dodatkowego „bonusu koalicji” obok premii wynikającej już z sumy głosów i m(v). Ewentualna reakcja wyborców na wspólny program jest osobnym, nazwanym efektem przed głosowaniem.

### 6.3. Zapis i kluby

Wynik dodaje jeden rekord do `Q.sejm_results`; ponowne wejście z tym samym ID niczego nie dopisuje. `n_elections` zwiększa się dopiero po prawidłowym opublikowaniu całego wyniku.

Zachowujemy obecne pola `id,year,month,kind,method,total_seats,party_names,party_votes,party_seats,lists,previous_parliament`. P — dokładamy `sequence_after_opening,legal_basis,status,ballot_date,senate_result_id`. `status=certified` ustawiamy w jednej transakcji z pełnym wynikiem, poprawną sumą mandatów i uproszczonym Senatem; nowe pole nie czeka na wybór gabinetu. `previous_parliament` pozostaje płytką migawką, bez rekurencyjnego kopiowania wszystkich wcześniejszych wyborów.

`Club`: `id,electoral_party_id,seats,members_profile,discipline,issue_positions,government_commitment`. Kluby mniejszości i „Innych” dzielą wyłącznie mandaty własnego agregatu. Suma klubów musi odtworzyć sumę partii i izbę.

`Transfer`: `id,date,from_club,to_club,seats,reason`. Rozłam przesuwa mandaty między klubami; nie zmienia liczby mandatów przyznanych w historycznym wyniku. Bieżący parlament wyliczamy z wyniku oraz transferów.

Nieznane programowo kluby „Innych” nie dają jednej oferty za 134 głosy z otwarcia. Profil testowy może rozdzielić je na neutralne bloki, które w sprawach bez ustalonego stanowiska wstrzymują się. Profil historyczny wymaga wskazania rozmówców.

**K — etap 2 (0.43):** `PolishInstitutions.recordSejmElection` publikuje w jednej transakcji wynik, kluby, Senat i datę następnych wyborów. Wynik ma nowe pola: `sequence_after_opening` (1 dla XI 1922, 2 dla następnych wyborów), `legal_basis` z `validated=true`, `status=certified`, `ballot_date` (1922-11-05 albo 1928-02-19) i `senate_result_id`. Kluby w `S.parliament.clubs` to na razie jeden klub na partię z mandatami (`members_profile=party_default_v1`); transfery dojdą z rozłamami w etapie 5. Poseł wybrany na prezydenta oddaje mandat następnej osobie z tej samej listy: klub zachowuje liczbę mandatów, a zapis trafia do `S.parliament.replacements` (`next_on_list_v1`, P; historyczna procedura: TBD — historical research required).

### 6.4. Minimalny Senat

P — po wyborach 1922 tworzymy 111 senatorów metodą proporcjonalnych największych reszt na podstawie udziału partii w przyznanych mandatach sejmowych, jak obecny uproszczony model Zgromadzenia, ale zapisujemy ich trwale. Remis rozstrzyga stabilny ID partii. `method=sejm_proxy_v1` mówi wprost, że to uproszczenie.

Senat nie jest przeliczany z późniejszego sondażu. Ma własne głosowania i transfery; odrębność nie oznacza pełnej dodatkowej kampanii. Zgromadzenie Narodowe sumuje aktualnych posłów i senatorów, nie zawsze stale wpisane 555 obecnych.

**K — etap 2 (0.43):** Senat powstaje raz przy każdym zatwierdzonym wyniku (`S.senate`, `method=sejm_proxy_v1`, rekord w `S.senate.records`). Grudniowe Zgromadzenie Narodowe odczytuje ten zapis zamiast liczyć własną migawkę; liczby są takie same jak wcześniej.

### 6.5. Konkretne sojusze wyborcze

P — przy otwarciu okna list gracz widzi poniższe oferty, samodzielną listę oraz przyczyny blokad. Progi dotyczą relacji PPS z partnerami. Zgoda każdego partnera wymaga również `offerScore>=60` z 8.3 i braku sprzecznej aktywnej umowy. Wspólna lista nie daje resortów. Mniejszości zachowują własną listę; mogą podpisać porozumienie o konkretnym głosowaniu bez dołączenia do listy PPS.

| ID / wybór | Członkowie i bramka P | Stały profil porozumienia | Szczególny koszt lub ograniczenie |
|---|---|---|---|
| `left_peasant` | PPS + Wyzwolenie; relacja ≥50 | Reforma ziemska z równym dostępem, ochrona pracy; podział miejsc proporcjonalny do głosów | Pracownicy rolni nie otrzymują ziemi samą obietnicą; jej treść zostaje zobowiązaniem do późniejszego wykonania |
| `labour` | PPS + NPR; ≥60 | Ośmiogodzinny dzień pracy, osłona bezrobotnych, wolność religijna | Konfrontacyjny antyklerykalizm blokuje ofertę NPR; PPS musi zmienić konkretny punkt, a nie zapłacić za jego pominięcie |
| `peasant` | Piast + Wyzwolenie; obaj akceptują pakiet ziemski | Rolnictwo i kredyt, zachowanie dwóch klubów | Sojusz bez PPS. Gracz może poprzeć zbliżenie dyplomacją parlamentarną, ale nie tworzy cudzej listy jednostronnie; staje wobec silniejszego partnera na wsi |
| `centrolew_early` | PPS + Wyzwolenie + Piast + NPR; relacje odpowiednio ≥60/60/60 | Legalna zmiana rządów, minimum społeczne, kompromis ziemski i religijny | Co najmniej 2 wykonane wspólne zobowiązania z udziałem PPS; wyłącznie alternatywny wcześniejszy blok, bez udawania historycznego Centrolewu już w 1922 |
| `christian_agrarian` | Piast + PSChD; obaj akceptują ofertę | Własność chłopska, finansowanie stabilizacji, szkoła | Oferta konkurentów; zmniejsza możliwość pozyskania tych samych partnerów przez PPS po zamknięciu list |
| `chzjn` | ZLN + PSChD w zachowanym uproszczeniu pierwszych wyborów | Istniejąca lista z 6.1 | Nie otrzymuje ponownej premii z nowego katalogu |

**C3 — jedna scena i jeden wybór:** samodzielna PPS, PPS–Wyzwolenie, PPS–NPR, dostępny Centrolew albo zabieganie o porozumienie z istniejącym blokiem ludowym. Po wyborze pokazujemy wynik akceptacji partnerów. Nie ma drugiej oferty warunków, wyboru podziału kandydatur, „przyjmij / skoryguj / zrezygnuj” ani sceny kontrpropozycji. Program minimum i sposób podziału kandydatur są stałym, widocznym opisem danego sojuszu, odczytywanym przez obecne reguły 6.1 i 8.3. Niepowodzenie zachowuje dotychczasową listę, domyślnie samodzielną PPS. P — potwierdzenie wyboru kosztuje 1 T raz, także przy odmowie partnerów; oglądanie nie kosztuje czasu. W kampanii obowiązuje najwyżej jedno własne porozumienie listowe; ta sama decyzja na niezmienionym stanie nie daje nowej oceny ani premii. Pierwsze przyjęcie kompromisu odległego od programu PPS zwiększa sprzeciw właściwej frakcji o 3 zgodnie z 10.1; nie dodajemy tej kary ponownie, jeśli została już naliczona przez zmianę programu. **Z — 0.36:** właściwą frakcją jest Lewica, i tylko wtedy, gdy wspólny program listy rezygnuje z punktów programu robotniczego; przewodnik (rozdział 5) opisuje Lewicę jako reagującą na porzucanie zdobyczy pracowniczych. Z listą `centrolew_early` („minimum społeczne”) Lewica +3; listy `left_peasant` i `labour` zachowują ochronę pracy i nie wywołują reakcji. Wykonane wspólne zobowiązanie oznacza zaakceptowany i zakończony obowiązek z unikalnym ID, nie dwie wizyty w rozmowach.

Samodzielna lista zachowuje cały program i wszystkie własne nominacje. Nie dostaje bonusu za odmowę sojuszu. Wspólna lista ma tylko efekt metody 6.1 oraz reakcję na faktycznie zmieniony program; nie mnoży głosów samym podpisem. Po wyniku członkowie mają oddzielne kluby i mogą różnie głosować. Sojusz ludowy lub chrześcijańsko-agrarny jest propozycją P zależną od profili przeciwników, a nie kolejną przymusową historyczną listą. W ofertach listowych `portfolioFit` z 8.3 oznacza przyjęty podział kandydatur, nigdy żądanie ministerstwa; `Negotiation.kind=electoral_list`.

**Z — 0.43 (plan, etap 2):** karta 7.7 katalogu i test „Kompromis listowy a Lewica” przechodzą do etapu 3, bo zgoda partnera wymaga oceny oferty (8.3), aktywnych umów i wykonanych zobowiązań. Do tego czasu jedyną wspólną listą jest ChZJN z 1922.

**K — etap 3 (0.44):** karta 7.7 katalogu (`polish_list_agreement`) działa w oknie dwóch pełnych miesięcy przed miesiącem głosowania: IX–X 1922 i XII 1927–I 1928 (decyzja etapu 3). Stałe profile programów list są P (`list_profiles_v1`): `left_peasant` — ziemia +1, finanse +1; `labour` — finanse +1, kościół 0; `centrolew_early` — ziemia 0, finanse 0, instytucje +1, kościół 0; `peasant` — ziemia 0. Zgoda partnera to ocena 8.3 z `portfolioFit=100` (proporcjonalny podział kandydatur) i potrzebą wyliczoną z jego najlepszej innej listy. Relacja to relacja z PPS, a dla bloku ludowego relacja między partnerami. Przyjęta lista trafia do `S.parliament.alliances`, a `recordSejmElection` liczy ją jako jedną listę metody 6.1; członkowie mają osobne kluby. Pierwsze przyjęcie `centrolew_early` daje Lewicy +3 sprzeciwu, raz. Poza ChZJN z 1922 nie powstają listy bez PPS (decyzja etapu 3).

## 7. Instytucje, głosowania i legalny kalendarz

Katalog sojuszy znajduje się w 6.5, gabinetów w 8.6–8.7, reform w 7.6, a szczegółowych spraw społecznych w 17.5–17.8. Ich warianty są propozycjami P w zatwierdzonym zakresie; reguły niżej pozostają wspólnym sposobem rozliczania decyzji.

### 7.1. Głosowanie jest rekordem z określoną regułą

`Ballot` zawiera: `id,issue_id,chamber,law_id,eligible,present,yes,no,abstain,invalid,quorum,denominator,threshold,result,club_votes`. Suma głosów nie przekracza obecnych; suma obecnych nie przekracza uprawnionych.

P — klub domyślnie głosuje zgodnie z zawartym porozumieniem. Wewnętrzny sprzeciw może odłączyć wskazaną liczbę posłów. Po ustaleniu delegacji liczenie jest deterministyczne. Nie losujemy każdego z 444 parlamentarzystów po kliknięciu wyniku.

| Procedura | Warunek w modelu | Status |
|---|---|---|
| Zwykła uchwała Sejmu | Obecni ≥148; za > przeciw | H: art. 32; P: wykonanie w silniku |
| Żądanie ustąpienia gabinetu/ministra | Zwykła większość, właściwe kworum | H: art. 58 |
| Samorozwiązanie Sejmu | Obecni ≥222; co najmniej 2/3 właściwego mianownika głosowania | H: art. 26 |
| Rozwiązanie przez prezydenta | Zgoda co najmniej 67 ze 111 senatorów oraz wymagany akt | H: art. 26; nie 3/5 obecnych |
| Zmiana konstytucji | Wniosek ≥111 posłów; zapowiedź ≥15 dni; 2/3 w obu izbach przy co najmniej połowie składu | H: art. 125 |
| Konstruktywne wotum po reformie | Za następcą ≥223 oraz zaakceptowany kandydat, w jednym rozstrzygnięciu | P: treść projektowanej reformy |
| Wybór prezydenta | Bezwzględna większość głosów Zgromadzenia | H: art. 39; szczegółowy regulamin tur B. P — finał dwóch kandydatów rozstrzyga większa liczba głosów oddanych na kandydatów (7.3, M06) |

Podstawy: [Konstytucja, rozdział II](https://biblioteka.sejm.gov.pl/tek01/txt/kpol/1921a-r2.html), [rozdział III](https://biblioteka.sejm.gov.pl/tek01/txt/kpol/1921a-r3.html), [art. 125](https://biblioteka.sejm.gov.pl/tek01/txt/kpol/1921a-r6.html).

Dla testu mianownik większości kwalifikowanej obejmuje ważne głosy za, przeciw i wstrzymujące. Głosy nieważne liczą się do obecności, nie do ważnych głosów. To jawna konwencja P do sprawdzenia z właściwym regulaminem, nie uniwersalne twierdzenie o każdej procedurze historycznej.

Zgoda 223 posłów oznacza większość pełnego składu, lecz nie wystarcza do każdej reformy. Ułatwiony tryb rewizji przez drugi Sejm konstytucyjny nie dotyczy pierwszego Sejmu wybranego w 1922; następne wybory kończą ten rozdział.

**K — etap 2 (0.43):** `PolishInstitutions.resolveBallot` rozlicza procedury z tabeli: zwykłą uchwałę i żądanie ustąpienia (≥148 obecnych, za > przeciw), samorozwiązanie (≥222 obecnych, 2/3 ważnych), zgodę Senatu na rozwiązanie (67 ze 111, czyli 3/5 składu), zmianę konstytucji w każdej izbie (połowa składu obecna, 2/3 ważnych) i odrzucenie poprawek Senatu (11/20 ważnych; 7.2). Remis nad ustawą oznacza odrzucenie, nigdy losowanie. Głosowania urzędów trafiają do `S.ballots` jako rekord `office_election`. Kworum Zgromadzenia Narodowego to połowa członków (P, ta sama konwencja co przy zmianie konstytucji); w rozdziale 1 przychodzą wszystkie kluby, więc jest zawsze spełnione.

**K — etap 3 (0.44):** wniosek o odwołanie gabinetu (`cabinet_dismissal`, art. 58) pojawia się po wycofaniu poparcia przez partnera (decyzja etapu 3). Kluby związane z gabinetem głosują przeciw. Pozostałe głosują według oceny programu: poniżej 40 za odwołaniem, inaczej się wstrzymują. KPP i Inni się wstrzymują, a PPS głosuje według decyzji. Konstruktywne wotum sprawdza flaga `S.parliament.constructive_vonc`, którą ustawi reforma z 7.6 (etap 4); do tego czasu jest fałszywa. Przyjęty wniosek czyni gabinet pełniącym obowiązki i otwiera formowanie; nie zarządza wyborów.

### 7.2. Ustawa i urząd

P — sekwencja ustawy: projekt → głosowanie Sejmu → rozpatrzenie Senatu → wymagane ponowne głosowanie → promulgacja → wejście w życie. Uproszczony Senat może przyjąć projekt albo zażądać zmiany; obsługa jego sprzeciwu nie jest prezydenckim wetem. H — art. 35 daje Senatowi 30 dni na zapowiedzenie zarzutów i dalsze 30 na zwrot projektu ze zmianami. Sejm może przyjąć zmiany zwykłą większością albo odrzucić większością 11/20; nie zastępujemy tego ogólnym progiem 223. Scheduler zapisuje oba terminy dzienne i właściwy typ ponownego głosowania. P — szczegółowy mianownik testowego głosowania jak w 7.1; historyczny regulamin wymaga sprawdzenia.

**C4 usunięte:** po wskazaniu projektu i wariantu w istniejącej karcie programu ustawowego głosowania oraz terminy rozliczają się automatycznie. Nie ma dodatkowych menu „pełny projekt / kompromis / etapy / wycofaj” podczas procedowania ani osobnego wyboru odpowiedzi na Senat. Głosy PPS czytają zatwierdzony program i umowy; zgodne z nimi poprawki popiera, przy sprzecznych popiera odrzucenie. Przyjęcie albo odrzucenie nadal wymaga rzeczywistej większości według powyższych reguł. Wynik i przyczyna są raportowane; brak większości nie uruchamia automatycznej darmowej renegocjacji. To uproszczenie rozgrywki P, nie zmiana historycznych kompetencji izb. Dobrowolna późniejsza zmiana projektu korzysta ze zwykłej karty i kosztu czasu.

**Z — 0.43 (plan, etap 2):** pełną procedurę ustawy z terminami Senatu (+30 i +60 dni) oraz test „C4” wdraża etap 4, razem z pierwszą ustawą (D, karta 7.2 katalogu). Etap 2 daje tylko reguły głosowań z 7.1, w tym próg 11/20.

**Wyjątek od ponownego składania projektu: D.** Powyższa możliwość późniejszej zmiany przez zwykłą kartę nie otwiera ponownie jedynej inicjatywy D. Po D2 wersja i dopuszczalny zakres kompromisu są zamknięte; dalsze czynności zachowują daty, bez nowych decyzji PPS. Odrzucenie, wycofanie lub zakończenie D nie odblokowuje nowego D1 przez `project.prepare/launch`, doradcę ani ogólną kartę programu. Późniejsza prawidłowa zmiana obowiązującej polityki wymaga osobno dostępnej kompetencji rządowej; nie resetuje limitu D ani jego zasługi. Szczególny kalendarz D określa 17.15: natychmiastowy jest wynik pierwszego głosowania Sejmu, nie całej procedury.

Prezydent mianuje premiera, a ministrów na jego wniosek; działa przez odpowiedzialnych ministrów. Nie dostaje niemieckiego niezależnego prawa dekretów. Pusty legacy `president` nie oznacza wakatu w polskim państwie.

Przed grudniowym przejściem z Naczelnika nie używamy fikcyjnego Senatu do otwierających sporów o gabinet. `law_id` rozróżnia przejściowy układ 1922 i późniejszy model marcowy. Szczegółowe otwierające kompetencje pozostają pod kontrolą badań, zamiast wynikać z tłumaczenia niemieckich nazw.

**K — etap 4 (0.45):** każda ustawa przechodzi `PolishProjects.submitLaw`: głosowanie Sejmu w decyzji, uproszczony Senat po 30 dniach (reguła `senate_review`, kluby głosują tak jak w Sejmie), przy sprzeciwie zwrot po 60 dniach ze słabszym wariantem ustawy albo odrzuceniem, potem przyjęcie zmian zwykłą większością albo ich odrzucenie większością 11/20. Przed utworzeniem Senatu ustawa wchodzi w życie z głosowaniem Sejmu. Kroki z datą rozlicza miesięczne rozliczenie do końca okresu. Ustawy zmarłego Sejmu wygasają.

### 7.3. Wybory prezydenckie i sukcesja

Z — widoczna sekwencja to `nomination_choice → final_result → oath`. Gracz wybiera „zgłoś kandydata PPS” albo „nie zgłaszaj”. Gra nie pokazuje pośrednich głosowań, nie pyta o transfery po każdej turze i nie pobiera za nie miesięcy. Widoczny wynik obejmuje zwycięzcę, uczestników ostatniego głosowania, ich głosy oraz wstrzymania/nieważne głosy potrzebne do wyjaśnienia większości.

P — `resolvePresidentialElection` przyjmuje migawkę aktualnego Zgromadzenia, kandydatury innych ugrupowań, decyzję PPS i wcześniejsze zobowiązania. Testowa kandydatura PPS w 1922 to Daszyński, jeśli pozostaje dostępny; brak osoby blokuje tę opcję z powodem. Rezygnacja nie usuwa głosów klubu. Głosuje on zgodnie z przyjętą umową, a przy jej braku według zapisanej kolejności akceptowanych kandydatów. Żadna reguła nie ogłasza zwycięzcy tylko na podstawie jego etykiety ideowej.

P — pomocniczy algorytm może automatycznie odrzucać najsłabszą kandydaturę i przenosić głosy według stałych preferencji, aż zostanie osiągnięta większość z 7.1. Remisy eliminacji rozstrzyga stabilny ID, z etykietą uproszczenia `presidential_final_result_v1`; nie są dodatkowym wyborem gracza. Algorytm wykonuje najwyżej tyle etapów, ilu ma kandydatów. Remis dwóch finalistów rozstrzyga poniższa zatwierdzona reguła 50/50. **Z — 0.28 (M06): wybór zawsze się kończy.**
- **Finał dwóch kandydatów** wygrywa ten, kto dostał więcej głosów. Wstrzymania i głosy nieważne liczą się do obecności, ale nie do większości. Dokładny remis rozstrzyga poniższe losowanie 50/50. Przykład: A 200, B 180, 60 wstrzymań i 4 nieważne — wygrywa A, choć nie ma ponad połowy z 440.
- **Kworum** jest zapewnione: na obowiązkowe wybory urzędów przychodzą wszystkie kluby, bo w rozdziale 1 nie ma opcji bojkotu.
- **Kandydatury:** profil wyboru musi mieć co najmniej dwie ważne kandydatury. Ich brak to błąd walidacji danych przed głosowaniem, a nie sytuacja w rozgrywce.
- **Bezpiecznik:** gdyby wybór mimo to się nie rozstrzygnął, zapisujemy `no_election` i kończymy sekwencję. Urząd sprawuje osoba pełniąca obowiązki wskazana w profilu, np. marszałek przy prezydenturze. Gracz odzyskuje zwykłą turę i może zmienić porozumienia, a nowe głosowanie następuje samo w następnym miesiącu.

Reguła finału jest uproszczeniem gry; szczegółowy regulamin Zgromadzenia pozostaje B. Diagnostyka: [analysis/m06-office-elections/REPORT.md](../analysis/m06-office-elections/REPORT.md). Szczegółowy historyczny regulamin pozostaje B; jego rekonstrukcja nie jest warunkiem budowania interaktywnej minigry, bo takiej tu nie ma.

**Z — remis dwóch finalistów, wspólna reguła dla prezydenta i marszałka:** jeżeli końcowe głosowanie ma wymagane kworum, obie kandydatury są ważne i mają tyle samo głosów, gra wybiera jednego z tych dwóch kandydatów z prawdopodobieństwem **1/2 dla każdego**. Jest to zatwierdzone uproszczenie rozgrywki i wyjątek od wymogu większości dla tego finału, nie twierdzenie o historycznej procedurze. Nie dodajemy zwycięzcy fikcyjnego głosu. Widoczny wynik zachowuje remis i informację „rozstrzygnięto losowaniem”; sekwencja przechodzi do zwykłego zakończenia wyboru, bez dodatkowej karty, miesiąca lub negocjacji.

P — dwóch finalistów porządkujemy po ID wyłącznie dla powtarzalnego przypisania: `u=roll(election_run_id + ':final_tie')`; `u<0.5` wybiera pierwszego, pozostałe wyniki drugiego. `tie_break={method:'lot_50_50',finalist_ids,roll_id,winner_id}` zapisujemy razem z wynikiem; dla marszałka w istniejącym `EventRun.payload`. Raz zapisany rzut i zwycięzca nie zmieniają się po powrocie do menu lub wczytaniu. Obsada urzędu i jej zwykłe skutki wykonują się raz. Reguła nie rozstrzyga remisu w głosowaniu nad ustawą, nie zastępuje kworum i nie obejmuje wcześniejszych remisów rankingowych.

`PresidentialElectionRun` przechowuje `id,date,assembly_snapshot,pps_nomination,preference_snapshot,final_ballot,winner,status,tie_break,effects_applied`; `tie_break=null` bez końcowego remisu. Do raportu trafia końcowe głosowanie i sposób rozstrzygnięcia; pośredni ślad obliczeń może istnieć wyłącznie diagnostycznie. Wczytanie zapisu po nominacji nie pyta ponownie i nie powtarza skutków politycznych. Zgłoszenie sprzeczne z wiążącą obietnicą uruchamia zwykłe naruszenie umowy; samo kandydowanie lub rezygnacja nie daje cyklicznego bonusu do poparcia.

Wybór prezydenta nie zwiększa licznika wyborów sejmowych i nie spełnia warunku końca rozdziału z 7.4.

P — po wyborze obecnego marszałka na prezydenta zapis obsady rozdziela urzędy: przed powrotem do zwykłej tury następuje wymagane zwolnienie funkcji marszałka i wybór jego następcy. Nie pozostawiamy tej samej osoby jako prezydenta oraz własnego zastępcy. Uzupełnienie opróżnionego mandatu korzysta z reguł listy, nie dopisuje 445. posła; szczegółową historyczną procedurę uzupełnienia należy zweryfikować przed wdrożeniem.

**C9 usunięte:** wakat lub niezdolność urzędu automatycznie wskazuje faktycznie wybranego marszałka jako zastępującego, bez osobnej sceny, przycisku kontynuacji lub kosztu czasu. Powód i zastępca są informacją w istniejącym wyborze następcy C6 oraz dzienniku. Rataj pojawia się tylko wtedy, gdy jest marszałkiem. Zapis obejmuje datę, powód i podstawę sukcesji. Urząd nie otrzymuje dwóch aktualnych posiadaczy.

Zamach na Narutowicza jest osobnym wydarzeniem zagrożenia, a nie skutkiem `left_candidate_won=true`. Rozdział 17 określa mechaniczne gniazdo; treść alternatywnych zagrożeń wymaga źródeł.

**K — etap 2 (0.43), Z — decyzje etapu 2:** wynik liczy `PolishInstitutions.resolvePresidentialElection` z zapisanego Zgromadzenia (posłowie i senatorowie według klubów) i testowego profilu `office_profiles_1922_v1` (P). Każdy klub głosuje na pierwszego z akceptowanych kandydatów, który jeszcze startuje, a bez takiego się wstrzymuje. W turach pośrednich wybiera większość ponad połowy ważnych głosów: oddanych na kandydatów i wstrzymujących się; nieważne liczą się tylko do obecności. Odpada najsłabszy, a przy równości kandydat z dalszym ID. Finał dwóch rozstrzyga większa liczba głosów. Profil nie odtwarza historycznych głosowań:

| Wybór | Kolejność kandydatów klubów (P) |
|---|---|
| 9 XII 1922 | ZLN, PSChD: Zamoyski → Wojciechowski. Piast, NPR: Wojciechowski → Narutowicz → Zamoyski. Wyzwolenie: Narutowicz → Wojciechowski → Daszyński → Baudouin de Courtenay. PPS: Daszyński, jeśli zgłoszony → Narutowicz → Baudouin de Courtenay → Wojciechowski. Mniejszości: Baudouin de Courtenay → Narutowicz → Daszyński → Wojciechowski. KPP i Inni wstrzymują się |
| 20 XII 1922, tylko po zabójstwie | ZLN, PSChD: Morawski. Pozostałe kluby: Wojciechowski (PPS najpierw Daszyński, jeśli zgłoszony). KPP i Inni wstrzymują się |

Zabójstwo Narutowicza pozostaje historyczną gałęzią i następuje tylko po jego wyborze (17.16). Obowiązki prezydenta przejmuje wtedy faktycznie wybrany marszałek (C9, przejście `acting_presidency`); bez marszałka urząd jest pusty. Nierozstrzygnięty wybór zostawia przy pierwszej elekcji Naczelnika Państwa, a przy drugiej marszałka; nowe głosowanie jest w następnym miesiącu. Marszałek wybrany na prezydenta zwalnia urząd, a Sejm wybiera nowego marszałka przed zwykłą turą. Rekordy `PresidentialElectionRun` są w `Q.polish_presidency.elections`, a nierozstrzygnięte w `failed_elections`. Odpowiedź na zamach pozostaje bez zmian (tylko pokojowa mobilizacja; zbrojny odwet zablokowany do etapu 7). Przy domyślnym, jeszcze niedostrojonym wyniku 1922 zgłoszenie Daszyńskiego eliminuje Narutowicza jako pierwszego i wygrywa Wojciechowski; strojenie należy do etapu 8.

### 7.4. Następne wybory

H — pierwsza kadencja rozpoczęła się 28 listopada 1922; podstawowa reguła dawała pięć lat od otwarcia. Potwierdza to [zestawienie Kancelarii Senatu](https://www.senat.gov.pl/gfx/senat/userfiles/_public/k8/statystyki/senat_1922-1939/01_kadencje_1922-1939.pdf).

H — ordynacja 1922 wymaga zarządzenia wyborów najpóźniej tydzień po wygaśnięciu mandatów; głosowanie przypada w niedzielę, najwcześniej 78 dni po ogłoszeniu. Przy wcześniejszym rozwiązaniu dochodzi konstytucyjny limit 90 dni. [Ordynacja, art. 13–14](https://eli.gov.pl/api/acts/DU/1922/590/text.html).

P — domyślny wariant bez zamachu i bez zmiany prawa:

```text
otwarcie: 1922-11-28
koniec pięciolecia: 1927-11-28
przyjęte ogłoszenie: 1927-11-29
78 dni później: 1928-02-15
pierwsza następna niedziela: 1928-02-19
miesiąc symulacji: 74
```

**19 lutego 1928 jest propozycją wyboru dopuszczalnego kalendarza w kontrfaktycznej grze, nie datą historycznych wyborów ani jedyną datą wymaganą prawem.** Zmieniona ustawa lub wcześniejsze rozwiązanie korzystają z własnego rekordu podstawy prawnej.

**C8 usunięte:** gracz nie otrzymuje karty `parliament.early_election` ani menu samorozwiązania, wniosku do prezydenta lub gabinetu przejściowego do wyborów. Nie przenosimy tych czterech wyborów do innej karty. `canInitiateEarlyElection` nie jest już predykatem dostępności akcji PPS.

`S.cabinet_crisis={id,fallen_cabinet_id,reason,status:"open",resolved_by:null}` pozostaje zapisem rzeczywistego upadku rządu dla wyboru następcy i oceny kryzysu. Nowy aktywny gabinet zamyka go; samo wyjście PPS nie tworzy dymisji. Ten rekord nie odblokowuje osobnej sceny wyborczej.

Nadal obowiązuje zatwierdzony koniec rozdziału przy następnych legalnych wyborach, również wcześniejszych. Wcześniejszy termin może wynikać wyłącznie z rzeczywiście dokonanego legalnego aktu właściwych instytucji, np. rozstrzygnięcia dopuszczonej reformą kompetencji prezydenta. Nie dodajemy w zastępstwie usuniętej karty nowego automatycznego losowania rozwiązania. Bez konkretnego aktu i podstawy działa zwykły kalendarz końca kadencji. Usunięcie menu nie anuluje już zarządzonych legalnych wyborów.

Przedterminowy scheduler przyjmuje datę rozwiązania, datę ogłoszenia i przedział legalnego głosowania. Wybiera pierwszą niedzielę spełniającą wszystkie warunki, nie `month+3`. Jeśli przedział jest pusty, zgłasza błąd konfiguracji zamiast tworzyć bezprawne wybory.

Zakończenie dotyczy wyniku drugiego głosowania sejmowego w kampanii. Uproszczony nowy Senat zostaje również zapisany, lecz kolejna pełna runda tworzenia rządu należy już do kontynuacji.

**K — etap 2 (0.43):** `PolishInstitutions.scheduleElection` liczy kalendarz: koniec pięciolecia od 1922-11-28, ogłoszenie następnego dnia i pierwsza niedziela co najmniej 78 dni później, czyli 19 II 1928 (t=74). Wariant przedterminowy wymaga ponadto niedzieli w ciągu 90 dni od rozwiązania, a pusty przedział zgłasza błąd konfiguracji. Rekord trafia do `S.parliament.next_election` przy zatwierdzeniu wyników 1922. `polish_opening_state` przepisuje z niego pola `next_election_*`, więc 21 odziedziczonych plików, które je zmieniają (bezpośrednio albo przez `set_next_election_time`), nie przesuwa wyborów. Wybory 1928 mają `sequence_after_opening=2` i nowy Senat; rządu po nich nie formujemy.

### 7.5. Marszałek: Śmiarowski, Rataj albo Daszyński

Z — jedna obowiązkowa sekwencja po wyborach, przed grudniową prezydenturą. `speaker_1922` korzysta z aktualnych klubów i ich umów. P — samo stanowisko PPS kosztuje 0 T; poprzedzające je dobrowolne negocjacje kosztują normalną akcję. Nie tworzymy trzech dodatkowych miesięcy grudnia.

| Wybór | Warunek / oferta P | Bezpośrednia reakcja raz na wybór | Co zależy od wyniku |
|---|---|---|---|
| Poprzeć Eugeniusza Śmiarowskiego | Dostępny poseł i jego zgoda; współpraca z Wyzwoleniem | Wyzwolenie relacja +4; Centrum sprzeciw −3, jeśli zgodne z jego przyjętą linią | Urząd otrzymuje wyłącznie po wygraniu głosowania; przegrana nie usuwa efektu dotrzymanej obietnicy |
| Uzgodnić poparcie Macieja Rataja | Piast ≥45; przyjęty pakiet: obrona regulaminu i udział PPS w pracach komisji | Piast +4; Lewica sprzeciw +3, jeśli PPS wcześniej zobowiązała się do własnego/lewicowego kandydata | Powstaje umowa o konkretnej komisji albo procedurze, nie stały bonus do wszystkich ustaw |
| Zgłosić Ignacego Daszyńskiego | Dostępny poseł, Wyzwolenie ≥60 oraz co najmniej jeden inny klub podpisuje nominację | Przy złamaniu wcześniejszej umowy normalne naruszenie; bez premii za samą nominację | Zwycięstwo: reputacja PPS +5; porażka pozostawia wynik i zobowiązania bez urzędu |

P — do jednego głosowania trafiają wszystkie podtrzymane kandydatury, nie tylko trzy nazwiska PPS. Uproszczenie: kworum ≥148, zwycięzca ma > połowę ważnych głosów; jeśli nikt nie osiąga większości, automatyczna dogrywka dwóch pierwszych z transferami według zapisanych preferencji. Przy równym wyniku dwóch finalistów i spełnionym kworum zwycięzcę wskazuje zapisane losowanie 50/50 według 7.3. Dogrywkę dwóch pierwszych rozstrzyga większa liczba głosów, a kworum, kandydatury i bezpiecznik działają jak w 7.3 (Z, 0.28, M06). Przy nierozstrzygniętym wyborze obowiązki pełni osoba wskazana w profilu; historyczna procedura pozostaje B. Remisy rankingowe przed finałem nadal rozstrzyga stabilny ID. Wszystkie głosy, ewentualne losowanie i aktualny marszałek są zapisane; mandat marszałka pozostaje jednym z 444.

H — Rataj i Śmiarowski rzeczywiście rywalizowali o urząd w 1922. Kandydatura Daszyńskiego w tym scenariuszu jest alternatywą P. Nie zamrażamy historycznej liczby głosów w innej izbie. Ślad źródłowy: `PL-CONTENT-1922-1926-2026-09`, badanie J. Kocznura o Śmiarowskim. Obowiązki p.o. prezydenta obejmuje zwycięzca, niezależnie od tego, kogo poparła PPS.

**K — etap 2 (0.43), Z — decyzje etapu 2:** scena `polish_speaker_election` otwiera grudzień 1922 przed nominacją prezydencką, w tym samym miesiącu, za 0 T. Kandydują Rataj (Piast) i Śmiarowski (Wyzwolenie); gdy PPS zgłasza Daszyńskiego, Wyzwolenie podpisuje nominację i popiera go zamiast Śmiarowskiego. Prawica nie wystawia własnego kandydata (P). Profil głosowania (P): ZLN, PSChD, Piast i NPR — Rataj; Wyzwolenie i mniejszości — kandydat lewicy, potem Rataj; PPS według decyzji; KPP i Inni wstrzymują się. Warunki w wersji sprawdzalnej: Śmiarowski zawsze się zgadza; pakiet Rataja to relacja z Piastem ≥45; podpis nominacji Daszyńskiego to relacja z Wyzwoleniem ≥60, a Daszyńskiego nie można zgłosić po jego odejściu z PPS ani po wyborze na prezydenta. Od razu działają tylko skutki dla relacji (+4, raz na wybór). Warunki i skutki wymagające późniejszych systemów — wcześniejsze zobowiązanie PPS, umowa o komisji i reputacja +5 (etap 3) oraz linia Centrum (etap 5) — do tego czasu nie są spełnione i nie działają. Przy nierozstrzygniętym wyborze obrady prowadzi marszałek senior (P; TBD — historical research required), a nowe głosowanie jest w następnym miesiącu. Przebieg, głosy i ewentualne losowanie zapisuje `S.parliament.speaker_elections`; aktualny marszałek to `S.parliament.speaker`.

**K — etap 3 (0.44):** pakiet Rataja tworzy umowę PPS z Piastem (`kind=procedure`). Głosy PPS i udział PPS w komisjach są wykonane przy głosowaniu (P), a obrona regulaminu jest stałą obietnicą bez terminu. Zwycięstwo Daszyńskiego jako kandydata PPS daje reputację +5, raz na wybór. Żadna karta etapu 3 nie tworzy wcześniejszego zobowiązania do kandydata na marszałka, więc warunki, które je czytają, pozostają niespełnione.

### 7.6. Trzy odrębne projekty ustrojowe

Każdy projekt jest alternatywą ustrojową P, przechodzi tryb zmiany konstytucji z 7.1 i ma własny `law_id`. **Z — 0.33:** własne przygotowanie `presidential_arbitration` przez PPS wymaga linii `form_of_power=strong_presidency` (10.8); pozostałe dwa projekty nie mają warunku linii. Przygotowanie trwa 2 główne akcje; Doradca może zastąpić krok wyłącznie wtedy, gdy jego konkretna akcja z 10.4 obejmuje ten projekt; samo Defend Constitutional Democracy nie przygotowuje ustawy. Sam minister Sprawiedliwości nie zmienia ustroju. Koszt wykonania: obciążenie 1 B przez 1 M, bez stałego utrzymania, efekt po promulgacji i 1 M wdrożenia. To uszczegółowienie rekordu reformy z 12.4, nie drugi koszt obok niego.

| Projekt / zapis w `Q.polish_presidency.constitution.reforms` | Treść i mechaniczny rezultat P | Cena polityczna i ograniczenie |
|---|---|---|
| `democratic_guarantees` | Wzmocnić ochronę stowarzyszeń, równość praw i samorząd. Odblokowuje skargę na konkretną represję z terminem rozpatrzenia t+1; po skutecznym uchyleniu bezprawnej decyzji usuwa tylko ten zakaz | Wykonanie demokracja +3 raz; Wyzwolenie i oba segmenty mniejszości +4 relacji. ZLN sprzeciw wobec tej oferty, bez automatycznej utraty mandatów. Reforma nie gwarantuje posłuchu urzędu ani wyniku skargi |
| `constructive_vonc` | Obalenie gabinetu wymaga jednoczesnej większości 223 dla uzgodnionego następcy | Chroni też niechciany przez PPS gabinet; nie blokuje dobrowolnej dymisji, przegranej ustawy ani legalnych wyborów. Nie dodaje stałego miesięcznego poparcia |
| `presidential_arbitration` | Po 2 zapisanych nieudanych próbach powołania gabinetu w 3 M prezydent może, z kontrasygnatą premiera pełniącego obowiązki, rozwiązać Sejm bez odrębnej zgody Senatu | Nowa, wyraźnie alternatywna podstawa rozwiązania. Nadal trzeba zarządzić legalne wybory z kalendarzem; urząd nie dostaje prawa dekretów ani wydłużania kadencji. Lewica sprzeciw +8; sprzeczna umowa demokratyczna wymaga renegocjacji |

Domyślnie wszystkie trzy pola są false. Równoległy legacy `constructive_vonc` staje się tylko adapterem przy wdrożeniu; predykat głosowania czyta ten sam rekord obowiązującego prawa. Wybory według `presidential_arbitration` mają własne `legal_basis`, testowo te same terminy ogłoszenia/głosowania co legalne wcześniejsze wybory; nie stosuje się do nich ponownie wymogu 67 senatorów. Prezydent może przyjąć propozycję, gdy istnieje wakat/impas i kontrasygnata; nie omija aktualnego działającego gabinetu.

**K — etap 8 (0.49):** reforma `presidential_arbitration` jest zapisywana w obowiązującym prawie, ale rozwiązanie Sejmu przez prezydenta po dwóch nieudanych powołaniach nie jest wdrożone. Legalne wcześniejsze wybory nie są więc w grze osiągalne; to ograniczenie gotowego rozdziału (plan wdrożenia, rozdz. 18), które zgodnie z decyzją użytkownika z 4 X 2026 zostaje.

Wzmocnienie prezydenta hamuje presję zamachową przez zakończenie rzeczywistego impasu lub przyjęty kompromis, a nie przez bezwarunkowe −X co miesiąc. Wykorzystać je może każdy przyszły posiadacz urzędu. Gwarancje demokratyczne mogą współistnieć z obiema pozostałymi reformami; zgodność programu i większości musi być wynegocjowana osobno. Powtarzalna pozorna odmowa tej samej oferty nie dopisuje kolejnej nieudanej próby gabinetowej.

Cywilny nadzór nad wojskiem jest czwartym, odrębnym projektem wykonawczym z 12.4 i 16.3. Nie wymaga automatycznie zmiany konstytucji, gdy dana zmiana mieści się w istniejącym prawie; zakres wskazuje rekord projektu. Szeroki wariant wymiaru sprawiedliwości prowadzi do istniejącego `democratic_guarantees`, bez dodatkowego projektu. Ograniczona autonomia z 17.12.6 jest projektem ustawowym w swoim dopuszczonym zakresie; federacja, pełna autonomia polityczna i państwo rad nie są dodatkowymi wdrożeniami konstytucyjnymi pierwszego rozdziału.

**K — etap 4 (0.45):** rekord `Q.polish_presidency.constitution.reforms` ma trzy pola false na starcie; `S.parliament.constructive_vonc` i `Q.constructive_vonc` są tylko jego adapterem. Przygotowanie to dwie główne akcje (karta w talii „Parliament”, potem wniosek w agendzie); wniosek wymaga 111 podpisów, 2/3 ważnych głosów w Sejmie (kworum 222) i w Senacie (kworum 56). Po promulgacji reforma kosztuje 1 B przez 1 M i działa od następnego okresu. Własne przygotowanie `presidential_arbitration` jest zablokowane do linii z etapu 5.

**K — etap 5 (0.46):** arbitraż prezydenta wymaga linii silniejszej prezydentury z karty „What Power Do We Want” (`strategy.form_of_power = strong_presidency`), chyba że przygotowanie ma już co najmniej 50; inaczej jest widoczny i zablokowany z powodem. Późniejsza zmiana linii nie usuwa przygotowanego projektu.

## 8. Relacje, negocjacje, gabinet i resorty

### 8.1. Relacja nie jest zobowiązaniem

Relacje ograniczamy do 0–100. Zwykła udana rozmowa zwiększa relację o 4, kosztuje 1 akcję, 0 R i ma odnowienie 3 M dla tego partnera. Przy relacji ≥70 przyrost wynosi 2. Z KPP rozmowa wymaga otwartego kanału z 9.5 (Z, 0.29, M17). Bez przedmiotu rozmowy nie powstają głosy ani stanowiska.

`ActorProfile` zawiera `id,relation_key,issue_ideals,issue_weights,red_lines,preferred_portfolios,availability,source_status`. Pozycje programowe mają skalę −2..2 dla określonego tematu; nie są jedną osią „dobry–zły”.

Programową zgodność oferty obliczamy tylko dla poruszonych tematów:

```js
fit = 100 * (1 - sum(weight[i] * abs(offer[i] - ideal[i])) /
                  (4 * sum(weight[i])));
```

Gdy brak tematów, nie tworzymy gabinetu z domyślnym `fit=100`. Oferta musi zawierać program minimum i podstawę finansową. Czerwona linia jest twardym warunkiem konkretnego partnera, nie dodatkowym minusowym punktem, który da się przykryć zasobami.

Szczegółowe historyczne profile pozostają B. Profile testowe są oznaczone P i nie są dowodem na rzeczywiste stanowisko partii w każdym roku.

### 8.2. Tymczasowa siła negocjacyjna

`Negotiation`: `id,kind,participants,issue_ids,offers,expires_at,result`. To zapis decyzji i jej oceny, nie interaktywna seria rund; pole `round` nie jest potrzebne w nowym kontrakcie negocjacji. Nie dotyczy to odrębnych rund zamachu. `kind` to `cabinet|bill|support|endorsement|settlement|electoral_list`.

P — wskaźnik PPS w danej rozmowie:

```js
pivotal = canSucceedWithPPS && !canSucceedWithoutPPS ? 100 : 0;
seatWeight = clip(100 * ppsSeats / (0.30 * chamberSize), 0, 100);
leverage = clip(0.60*pivotal + 0.25*seatWeight + 0.15*credibility, 0, 100);
```

`canSucceed...` sprawdza aktualne dopuszczalne porozumienia i właściwą procedurę, a nie tylko sumę wszystkich partii wybranych przez gracza. W negocjacjach strajkowych lub zamachowych zamiast `seatWeight` stosuje się jawnie wskazaną zdolność organizacyjną; nie udajemy, że każdy rodzaj nacisku pochodzi z mandatów.

Leverage jest wyliczane ponownie po zmianie oferty lub alternatywy. **Nie odejmujemy od niego ceny ministerstwa.** Po zamknięciu rozmowy pozostaje zapis oferty i umowy, bez zapasu punktów. W tym projekcie L jest diagnostycznym wynikiem rozmowy, nie osobnym bonusem dodawanym ponownie do akceptacji. Skuteczność wynika z tych samych realnych alternatyw, żądań i reputacji użytych w 8.3. Interfejs pokazuje L wraz z powodem zmiany, a nie obiecuje określonego resortu za próg punktów.

Przykład: PPS z 35 mandatami, reputacją 50 i niezbędnym udziałem ma L≈74,07. Gdy pojawi się wykonalna większość bez PPS, L≈14,07. Mandaty i kasa PPS nie zmieniają się.

### 8.3. Akceptacja oferty

Dla każdego partnera:

```js
score = clip(0.25*relation + 0.35*programFit + 0.20*portfolioFit +
        0.10*credibility + 0.10*needForThisAgreement - breachPenalty +
        advisorOfferBonus, 0, 100);
accept = hardConditions && score >= 60;
```

`offerScore` w katalogach jest nazwą powyższego `score` dla konkretnego partnera, nie dodatkową premią ani odrębnym licznikiem.

P — `advisorOfferBonus=0` domyślnie; wynosi 5 wyłącznie dla jednej wskazanej oferty szerokiego gabinetu przygotowanej akcją Daszyńskiego z 10.4. Bonus dotyczy oceny jej partnerów i wygasa przy zamknięciu tej oferty lub po 6 M. Nie trafia do bazowych ocen innych ofert używanych przez `bestAlternativeScore`, nie sumuje się sam ze sobą i nie uchyla `hardConditions`.

`needForThisAgreement=clip(100-bestAlternativeScore+crisisCooperation,0,100)`; `crisisCooperation` jest zerem poza odpowiednimi ofertami kryzysowymi, a jego formułę określa 8.8; jeśli partner ma już zaakceptowaną lepszą alternatywę, nie uważa PPS za niezbędną. `bestAlternativeScore` to maksymalna bazowa ocena wykonalnych innych ofert (bez składnika need), znormalizowana z maksymalnych 90 do 100; brak wykonalnej alternatywy daje 0. Zapobiega to rekurencyjnemu liczeniu ofert przez siebie nawzajem. Przy ofercie dotyczącej ustawy zamiast `portfolioFit` używamy zgodności warunków jej wykonania.

**Z — 0.23 (M11):** w prośbach z 9.8 składnik `needForThisAgreement` liczymy tylko dla prawdziwej groźby, czyli targowania, po którego odmowie PPS musi wybrać odejście albo cofnięcie. Perswazja ma `need=0`. Po cofnięciu groźby wobec tego samego gabinetu (`pps_threat_discounted`) także targowanie ma `need=0`.

`portfolioFit` jest stopniem zaspokojenia żądań urzędowych danego partnera. Partner formalnego gabinetu może mieć wymaganie otrzymania co najmniej jednego spośród wskazanych resortów. Zewnętrzne poparcie ma zamiast tego żądanie programowe. Wysoka relacja nie omija twardej odmowy programu.

P — każde żądanie stanowiska lub warunku wykonania ma wagę 1–3. Dopasowanie to 100 razy suma wag spełnionych żądań / suma wag wszystkich żądań; jawny brak takich żądań daje 100, a brak profilu jest błędem. `breachPenalty=min(30,5*unresolvedBreachedObligationsWithPartner)`. Bazową ocenę innej oferty liczymy z jej relacji, programu, stanowisk i reputacji, odejmujemy tę samą karę, ograniczamy do 0–90, następnie skalujemy. Podział resortów jest elementem oferty ocenianej przez każdego partnera; jeden portfel ma jednego formalnego posiadacza.

**C2 usunięte:** zatwierdzona oferta ma jedną ocenę partnerów i wynik, bez menu kontrpropozycji i limitu trzech negocjacyjnych rund. Odmowa wskazuje powód; nie otwiera kolejnego darmowego wyboru warunków. Następna własna próba wymaga zwykłej dostępnej akcji i zmienionej oferty albo sytuacji. W obowiązkowym formowaniu odmowa lub opozycja PPS pozostawia wybór wykonalnego gabinetu pozostałym aktorom według 8.7; gdy brak takiego układu, pozostaje gabinet pełniący obowiązki i otwarty kryzys. Nie ponawiamy natychmiast tego samego obowiązkowego menu. Nowa inicjatywa instytucjonalna potrzebuje nowego kandydata lub istotnej zmiany poparcia, a sama zmiana miesiąca nie tworzy bezpłatnej kopii tej samej oferty.

**K — etap 3 (0.44):** `PolishGovernment.offerScore` liczy wzór z 8.3. Sprawdzenia M02 (68,17 i 58,44), M11 (65, 58 i 62) i dźwigni z 8.2 (74,07 i 14,07) są testami. Bezpartyjny premier ocenia żądania PPS sam: jego ideałem jest własny program, a relacja z PPS wynosi 50 (decyzja etapu 3).

### 8.4. Utworzenie i zmiana gabinetu

`Cabinet.status`: `formation|active|caretaker|resigned`. `pps_mode`: `member|external_support|opposition`. Gabinet mniejszościowy jest cechą poparcia, nie osobnym ustrojem.

Utworzenie wymaga:

1. Dostępnego, zgodnego z regułami kandydata.
2. Przyjętych umów lub wiarygodnej tolerancji.
3. Programu oraz wskazania wykonawców.
4. Właściwego aktu powołania.
5. Braku skutecznie przeprowadzonego żądania ustąpienia.

Nie wprowadzamy historycznie nieuzasadnionej automatycznej obowiązkowej inwestytury „223 za każdym nowym premierem”. Przewidywana sytuacja głosowań decyduje o ofertach, a rzeczywisty wniosek o odwołanie jest odrębną procedurą.

Zmiana gabinetu zamyka przypisania resortów starego gabinetu i tworzy nowe. Obowiązujące prawo, obciążenia pożyczki, programy świadczeń i wykonane inwestycje nie znikają. Nowy rząd musi przyjąć, zmienić lub odrzucić polityczne zobowiązania poprzednika. Osobista obietnica partnerowi nie staje się automatycznie obowiązkiem nowego premiera.

### 8.5. Dziewięć portfeli i predykat wykonania

Z — aktywny katalog docelowy ma dziewięć kluczy: `labor`, `interior`, `finance`, `economic`, `justice`, `agriculture`, `reichswehr`, `education`, `foreign`. Usuwamy `public_works` wyłącznie jako osobny portfel: roboty publiczne i inwestycje transportowe należą do `labor`. Nazwa priorytetu gospodarczego `public_works` oraz akcji `government.public_works` nadal opisuje program, nie urząd. Zachowujemy pozostałe identyfikatory kategorii. `reichswehr` jest starym technicznym kluczem portfela wojskowego, nie nazwą polskiej armii.

```js
ppsCanChoose(action,cabinet) =
  action.ppsModeGate(cabinet.pps_mode) &&
  (ppsOwnsRequiredPortfolio || validExecutorAgreementForThisAction);
stateCanExecute(project,cabinet) =
  project.authorizationIsValid && executorHasRequiredCompetence &&
  (cabinet.status === "active" ||
   (cabinet.status === "caretaker" && project.caretaker_allowed));
```

Nazwę statusu `caretaker` mapujemy na rzeczywisty rekord sprawowania obowiązków; sam `resigned` bez pełnienia obowiązków nie daje dostępu. `ppsCanChoose` sprawdza możliwość nowej decyzji PPS; szczególne D ma własną bramkę opozycyjną. `stateCanExecute` sprawdza wykonanie obowiązującego programu także przez cudzy rząd. Finansowanie wyznacza osobno `coverage` z 12.3. Przy zmianie gabinetu aktualizujemy instytucjonalnego wykonawcę i nadal obowiązujące upoważnienia; nie kasujemy programu za brak ministra PPS.

Gabinet ustępujący kontynuuje prawnie wymagane bieżące świadczenia (`caretaker_allowed=true` w osłonach, w tym D); nie rozpoczyna dobrowolnych nowych reform. Pozostałe programy zapisują swój dozwolony zakres obowiązków w profilu. Brak zgody politycznej na nową ofertę jest odrębny od legalnego wykonania istniejącej ustawy.

| Klucz | Kompetencja w projekcie | Przykładowy dodatkowy warunek |
|---|---|---|
| `labor` | Inspekcja, polityka pracy, świadczenia, roboty publiczne, infrastruktura i mieszkalnictwo tej karty | Finansowanie, prawo i wykonawcy; bez osobnego portfela Komunikacji |
| `interior` | Administracja i policja | Zgodne z prawem zadanie i posłuch wykonawcy |
| `finance` | Dochody, budżet, pożyczki i finansowanie | Upoważnienie właściwą ustawą |
| `economic` | Przemysł i instrumenty gospodarcze | Źródło kredytu lub warunki zamówienia |
| `justice` | Przygotowanie prawa i procedur | Głosowanie nie jest zastąpione ministrem |
| `agriculture` | Parcelacja, modernizacja i komasacja z 12.6 | Ustawa/procedura, zgody i finansowanie |
| `reichswehr` | Organizacja i nadzór nad wojskiem | Kompetencja konkretnej decyzji kadrowej |
| `education` | Szkoła, język i prace w obu zamkach z 12.7–12.8 | Budżet i właściwe uprawnienie |
| `foreign` | Miejsce w podziale gabinetowym | Brak puli dyplomatycznej w tym rozdziale |

Dostęp PPS do pracy z właściwym ministrem nie oznacza automatycznego dostępu do wszystkich działań jego resortu. Umowa identyfikuje projekt i zakres. Ministerstwo MSZ nie daje ukrytego bonusu gospodarczego jako zastępczej nagrody.

**K — etap 3 (0.44):** zapis gabinetu ma dokładnie dziewięć resortów: `labor`, `interior`, `finance`, `economic`, `justice`, `agriculture`, `reichswehr`, `education` i `foreign`. Roboty publiczne są częścią Pracy, a pole `public_works_minister_party` jest puste; `Q.polish_portfolios` ma dziewięć kluczy. PPS zgłasza resorty: samą Pracę, Pracę i jeden inny albo inny zamiast Pracy. Partnerzy dostają pierwszy wolny resort ze swojej listy, najpierw większy klub, a resztę bezpartyjni fachowcy (P). Pola `…_minister_party`, `spd_in_government` i podobne są kopiami zapisu gabinetu, więc stare sceny nie mogą ich trwale zmienić.

**K — etap 4 (0.45):** `PolishProjects.stateCanExecute` sprawdza obowiązującą podstawę, wykonawcę i stan gabinetu: pełniący obowiązki kontynuuje tylko osłony i inspekcję (`caretaker_allowed`). Nowe decyzje PPS (karty 8.x) wymagają resortu PPS w aktywnym gabinecie; umowy wykonania z partnerem nie da się jeszcze wynegocjować (luka).

### 8.6. Katalog gabinetów i ich programów

Z — rozwijamy konfiguracje z `PLAN.md` §14 i `MECHANICS_MAP.md` §10. **Reprezentacja mniejszości wspiera gabinet zewnętrznie, nie dostaje w tym rozdziale resortów.** Dwa segmenty negocjują osobno i razem nie przekraczają liczby istniejących mandatów agregatu. P — nazwy poniżej identyfikują oferty gry; nie są twierdzeniem, że wszystkie takie koalicje historycznie powstały.

| ID / konfiguracja | Formalni członkowie | Minimum programu i relacji PPS z partnerami, P | Główna sprzeczność |
|---|---|---|---|
| `pps_majority` | PPS | Większość 223, dostępny premier, wykonalny budżet | Własna większość nie usuwa frakcji, kosztu ani oporu administracji; bardzo odległy wariant, bez premii wyborczej umożliwiającej go z automatu |
| `left_minority` | PPS, Wyzwolenie | Wyzwolenie ≥50; reforma ziemska, prawa pracy; zewnętrzne umowy z potrzebnymi segmentami mniejszości | Zależność od wykonania praw językowych i ziemskich; zachowany poprzedni wariant polskiego menu |
| `left_labour` | PPS, Wyzwolenie, NPR | ≥50/55; ziemia, czas pracy, neutralność państwa wobec religii | NPR odrzuca konfrontacyjną politykę wyznaniową |
| `centre_left` | PPS, Wyzwolenie, Piast, NPR | ≥50/55/55; parcelacja z odszkodowaniem, ochrona płac, legalne rządy | Piast nie przyjmuje konfiskacyjnej reformy; poparcie na wsi nie przechodzi automatycznie na PPS |
| `broad_centre` | Poprzedni skład + PSChD | `crisisOfferAllowed`; PSChD ≥55, pozostali jak wyżej; program socjalny z finansowaniem i swobodą religii | Szkoła świecka i nacjonalizacja wymagają osobnych kompromisów; konstytucji nie zmienia sam skład gabinetu |
| `skrzynski_broad` | PPS, Piast, NPR, PSChD, ZLN | `crisisOfferAllowed`; wspólne minimum, bez dodatkowych progów relacji na wejściu; każdy partner nadal musi przyjąć ofertę z 8.3 | Przegląd osłon po sześciu miesiącach według 17.16.4; relacje pomagają utrzymać kompromis, nie zastępują finansowania |
| `national_unity` | PPS, oba PSL, NPR, PSChD, ZLN | Każdy ≥55, ZLN ≥45; `crisisOfferAllowed` i `severeCrisis`; program na 6 M, bez konfiskat i zawieszania praw | ZLN i Wyzwolenie odrzucają sprzeczne rozwiązania autonomiczne; jedność wymaga wąskiej wspólnej treści, nie znosi sporów |
| `united_left` | PPS, Wyzwolenie, NPR, legalni reprezentanci komunistyczni | ≥60/60/65; przygotowanie 9.6, wspólny legalny program, poszanowanie samodzielności organizacji | NPR odrzuca rewolucyjne przejęcie państwa; komunista bez zgody na wspólną legalną procedurę nie dołącza |
| `workers_front` | PPS i legalni reprezentanci komunistyczni | Relacja ≥70, 9.6, rzeczywiste dodatkowe poparcie parlamentarne, jeśli brakuje większości | Bez ludowców i centrum zwykle brakuje głosów; żadnego zamieniania siły strajku w mandaty |
| `chjeno_piast` | ZLN, PSChD, Piast | Oferta autonomiczna partnerów; PPS jest poza gabinetem | Wspólny program prawicy i Piasta konkuruje z ofertą PPS; powrót w 1926 podlega osobnej scenie |

`majorCrisis` jest wyliczonym warunkiem oferty: co najmniej 2 upadki gabinetu w ostatnich 6 M lub `nationalGrievance>=60` lub kryzys walutowy zdefiniowany na końcu 11.9 lub aktywny kryzys kredytowy scenariusza. Nie jest nowym licznikiem ani przyczyną dodatkowego pogorszenia. Zwykłe progi relacji pozostają bramkami pozostałych ofert; wyjątkiem jest powyższy ratunkowy `skrzynski_broad`. Relacja nadal wchodzi do `offerScore>=60`; czerwone linie, zgody i procedura powołania obowiązują każdego uczestnika. Brak progu wejścia nie gwarantuje ministerstw ani akceptacji.

Wspólne minimum `skrzynski_broad` wskazuje istniejącą osłonę pracowniczą albo przyjęte nowe świadczenie, finansowanie oraz jeden przegląd w szóstym miesiącu gabinetu (miesiąc powołania jest pierwszym). Zgoda na przegląd nie jest zgodą PPS na przyszłe cięcia. Nie tworzymy drugiej osłony, jeżeli program już działa. W spokojnym zwykłym otwarciu po wyborach 1922 ta oferta nadal jest niedostępna.

**Większość i tolerowanie:** wariant większościowy potrzebuje ≥223 zadeklarowanych posłów. Przy mniejszej liczbie można zaproponować wariant tolerowany, jeżeli prognozowane głosowania budżetowe i o ustąpieniu pozwalają mu działać: przy kworum `budget_yes>budget_no` i `dismissal_yes<=dismissal_no`. Neutralne wstrzymania nie stają się głosami za PPS. Istnienie większości negatywnej pozwala odmówić powołania słabego kandydata, ale nie wymusza natychmiastowych wyborów. Po faktycznym głosowaniu liczą się rzeczywiste deklaracje, nie prognoza.

P — profile ofert używają czterech dodatkowo nazwanych tematów w istniejącym `issue_ideals`: `land` (rynkowa −2 / odszkodowanie 0 / przyspieszona +1 / bez odszkodowania +2), `fiscal` (cięcia −2 / rozłożenie ciężaru 0 / obciążenie majątku +2), `institution` (silny prezydent −2 / reguły gabinetowe 0 / demokratyzacja +2) oraz `army` (autonomia dowództwa −2 / kompromis 0 / nadzór cywilny +2). Wagi są testowo równe 1; temat niewchodzący do umowy nie jest oceniany. Wyjściowe ideały do sprawdzania algorytmu:

| Aktor | land / fiscal / institution / army | Wybrane czerwone linie w profilu P |
|---|---|---|
| PPS | +1 / +2 / +2 / 0 | Zmienne zgodnie z programem i zawartymi umowami; nie można obiecać dwóch wykluczających się polityk |
| Wyzwolenie | +1 / +2 / +2 / +1 | Dyskryminacyjny dostęp do ziemi; likwidacja kontroli parlamentarnej |
| Piast | 0 / 0 / 0 / 0 | Konfiskata ziemi bez odszkodowania; nowy ciężar na drobne gospodarstwa |
| NPR | 0 / 0 / 0 / 0 | Przemoc jako metoda przejęcia rządu; przymus wyznaniowy; likwidacja samodzielności związków |
| PSChD | −1 / −1 / −1 / 0 | Konfrontacyjne ograniczenie praktyk religijnych; wywłaszczenie bez odszkodowania |
| ZLN | −1 / −1 / −1 / +1 | Autonomia terytorialna; udział komunistów w tym samym gabinecie |
| Reprezentanci komunistyczni | +2 / +2 / +2 / 0 | Rezygnacja z własnej organizacji; dodatkowo konieczna warunkowa zgoda na legalne reguły z 9.6 |
| Żydowska reprezentacja | 0 / 0 / +2 / 0 | Dyskryminacja prawna; utożsamienie jej z Bundem |
| Pozostałe mniejszości | +1 / 0 / +2 / 0 | Dyskryminacja prawna i językowa; złamanie podpisanej umowy ziemskiej |

To **syntetyczne profile P**, nie historyczne deklaracje wszystkich tych partii przez całą kadencję. Zmiana historycznego lidera lub stanowiska wymaga jawnego profilu datowanego. Temat `church` opisuje treść konkretnej oferty oświatowej z 12.7; nie jest osobną kartą partyjną: NPR i PSChD odrzucają przymusową konfrontację; nie otrzymują weta wobec dowolnej dyskusji o świeckości. Pozostałe nieopisane tematy mają pozycję 0 i wagę 1 w testach, z jawną etykietą danych syntetycznych. **Z — 0.33, temat `autonomy`** (oś praw i autonomii z 10.8): ZLN −2, reprezentacja pozostałych mniejszości +1, pozostali aktorzy 0; waga 1. To wartości testowe P; historyczne stanowiska: `TBD — historical research required`. Dla samodzielnych ofert przeciwników profil przechowuje ich wzajemną relację, nie używa relacji z PPS: syntetycznie Piast–Wyzwolenie 50, Piast–PSChD 60, Piast–ZLN 60, PSChD–ZLN 70; pozostałe jawnie neutralne pary 50. Zmiana wymaga zapisanej reakcji lub nowego profilu, nie zależy od samego kliknięcia PPS.

**K — etap 8 (0.49):** profil `actor_profiles_v2` datuje temat `autonomy` dla lat 1922–1926 według badań 8f (`PL-MINORITY-AUTONOMY-1922-1926`): PPS +1 (projekty autonomii z 1921 i 1925), Wyzwolenie +1 (deklaracje bez wniosku), Piast i PSChD −1 (pakt lanckoroński), NPR 0 (autonomia kulturalna), ZLN −2, pozostałe mniejszości +1; reprezentacja żydowska i KPP 0, bo brak danych o ich stosunku do autonomii ziem słowiańskich. Pozostałe tematy profili pozostają syntetyczne (P). Skutek: w Sejmie 1922 ustawa o ograniczonej autonomii nie ma już poparcia Piasta i chadecji.

**Resorty:** PPS składa ofertę, nie otrzymuje ich za nazwę koalicji. Preferencją PPS jest `labor`, obejmujący teraz również roboty publiczne; kolejne żądanie wybiera spośród istniejących dziewięciu portfeli według programu. Nie zamieniamy mechanicznie drugiej dawnej preferencji `public_works` na drugi egzemplarz `labor`. P — Piast preferuje `agriculture`, NPR `labor`, PSChD `education` lub `justice`, ZLN `education` lub `finance`, Wyzwolenie `agriculture` lub `interior`. Każda kategoria ma jednego formalnego właściciela. Minimum jednego resortu może być warunkiem wejścia; uzgodnione wykonanie programu nie jest dodatkowym stanowiskiem. Wariant bez uzgodnionego resortu wymaga świadomego wyboru zewnętrznego poparcia.

**K — etap 3 (0.44):** układy mają stałe programy minimum (decyzja etapu 3), w kolejności ziemia / finanse / instytucje: `pps_majority` +1/+2/+2, `left_minority` +1/+1/+2, `left_labour` +1/+1/+1, `centre_left` 0/0/+1, `chjeno_piast` 0/−1/—; gabinet fachowców ma finanse 0 (Grabski +1). Szerokie i stabilizacyjne układy wymagają dwóch upadków rządu w 6 miesiącach, jedność narodowa trzech. `united_left` i `workers_front` są wyszarzone do etapu 5.

**K — etap 4 (0.45):** `crisisState` liczy `majorCrisis` z upadków gabinetów, kryzysu walutowego z 11.9 i aktywnego kryzysu kredytowego scenariusza; `crisisCooperation` dodaje 10 przy kryzysie walutowym. Niezadowolenie narodowe i zagrożenie instytucji wchodzą z etapem 7.

**K — etap 5 (0.46):** stanowiska PPS wyznaczają jej ideały w tematach `institution` i `autonomy` (projekcja `S.actors.pps.program`); programy minimum układów z etapu 3 się nie zmieniają. Oferta z autonomią co najmniej +1 ma cechę `territorial_autonomy`, więc czerwona linia ZLN obejmuje też autonomię województw (test „Oś autonomii”).

### 8.7. Kolejność gabinetów i alternatywni premierzy

H — historyczna oś według opracowania w `HISTORICAL_SOURCES.md`, `PL-1922-1926-CABINETS`. Miesiące w tabeli porządkują temat; nie zastępują dziennych dat powołania, dymisji i sprawowania obowiązków. P — alternatywy i premia tendencji należą do gry.

| Okno historycznego tematu | Najbliższy historyczny gabinet | Warianty wynikające z decyzji gracza |
|---|---|---|
| I–VI 1922 | Ponikowski | Podtrzymanie tolerancji za ustępstwo; kompromis z Naczelnikiem; wycofanie poparcia i oferta następcy |
| VI–VII 1922 | Próba Śliwińskiego | PPS popiera kandydata Piłsudskiego albo wspiera porozumienie parlamentarne; brak głosów może zakończyć próbę |
| VII–XII 1922 | Nowak | Tolerancja z warunkiem pracowniczym lub opozycja; nie pomijamy wyborów przez utrzymywanie jego gabinetu |
| XII 1922–V 1923 | Sikorski | Gabinet przywracający zdolność państwa po kryzysie; przy innej sukcesji możliwy kandydat większości parlamentarnej |
| V–XII 1923 | Witos / Chjeno-Piast | Porozumienie PPS z Piastem może stworzyć `centre_left`; strajk sam nie wyznacza premiera |
| XII 1923–XI 1925 | Grabski | Ekspercka stabilizacja bez PPS, tolerancja warunkowa 9.7 albo alternatywa parlamentarna po zbudowaniu większości |
| XI 1925–V 1926 | Skrzyński | `skrzynski_broad`; utrzymanie osłon, nowe finansowanie lub wyjście PPS. Wyjście PPS w IV nie jest tym samym co dymisja całego gabinetu |
| V 1926 | Powrót Witosa | Nowe Chjeno-Piast, utrzymany kompromis szerokiej koalicji albo centrolewica; tylko faktyczny powrót właściwej konfiguracji daje impuls 1926 |

P — do ofert alternatywnych dodajemy **Stanisława Thugutta** (program lewicowo-ludowy, Wyzwolenie ≥60 i Piast ≥55), **Ignacego Daszyńskiego** (PPS ma największy klub w proponowanej koalicji, co najmniej 2 partnerów przyjmują jego kandydaturę) i konstytucyjny gabinet **Piłsudskiego** według 16.7. Skrzyński może być wcześniej proponowanym kompromisowym ekspertem; Sikorski kandydatem zapewnienia ciągłości władz, a nie automatycznym zastępcą Piłsudskiego. To alternatywy P; nie twierdzimy, że każda była historycznie bliska powstania. Osoba ma `available`, `consents` i profil oferty; samo nazwisko nie oznacza zgody.

Gdy urząd jest obsadzony i gabinet działa, data następnego historycznego premiera go nie usuwa. Po wakacie kandydaci są oceniani na aktualnych głosach. P — właściwy kandydat historycznego okna otrzymuje +8 do porównania **już wykonalnych i zaakceptowanych ofert**; pozostały wynik to średnia `offerScore` wymaganych partnerów, także zewnętrznych. Nie liczymy PPS jako negocjującej samej ze sobą; dla samodzielnej PPS ze zgodną kandydaturą i większością używamy wyniku 60. Gabinet ekspercki bez żadnego wskazanego partnera lub gwaranta tolerancji nie jest wykonalną ofertą w tym rankingu, więc nie liczymy średniej pustej listy. Premia nie przełamuje braku większości, weta programowego, odmowy osoby ani decyzji właściwej głowy państwa. Przy remisie decyduje większa liczba zadeklarowanych głosów, potem stabilny ID. To wspólny profil Normalny, nie dodatkowy tryb historyczny.

P — przed konstytucyjnym przejściem w grudniu kompetentnym powołującym jest Naczelnik według profilu otwarcia; później prezydent. Kandydat z legalnie przedstawionym porozumieniem większościowym jest dopuszczany w testowym profilu urzędu. Odmowa polityczna wymaga własnej jawnej sprawy i przyczyny; nie jest tajnym rzutem blokującym ofertę. Po trzech nieudanych propozycjach otwiera się impas, poszukiwanie tolerowanego gabinetu lub legalnej procedury wyborów. **Z — 0.36: impas to stan, nie karta.** `S.cabinet_crisis.status=impasse`; rządzi gabinet pełniący obowiązki, który wykonuje tylko bieżące zadania (8.5), a w rokowaniach strajkowych ma `governmentFragility=100` (14.4). Formowanie wraca jako obowiązkowe, gdy pojawi się nowy kandydat albo istotna zmiana poparcia: nowa umowa, rozłam albo transfer posłów. PPS może też podjąć własną inicjatywę za 1 T ze zmienioną ofertą. Przy obowiązującym `presidential_arbitration` prezydent może rozwiązać Sejm według 7.6; bez tej reformy nic nie dzieje się automatycznie.

H — w gabinecie Skrzyńskiego PPS reprezentowali m.in. Ziemięcki w resorcie pracy oraz Moraczewski w robotach publicznych; później tego drugiego zastąpił Barlicki. Źródło: P. A. Tusiński, *Przegląd Sejmowy* 6/2015, wskazany rejestr. W grze doradca i minister są osobnymi funkcjami; obsada historyczna jest ofertą profilu, nie obowiązkowym wyborem gracza.


**K — etap 3 (0.44):** okna kandydatów (H) dają +8 w rankingu wykonalnych i przyjętych ofert; przy remisie decyduje więcej zadeklarowanych głosów, potem ID. Najpierw oceniana jest oferta PPS, a partnerzy, którzy ją przyjmą, są nią związani. Potem oceniane są oferty bez PPS: Chjeno-Piast Witosa i fachowcy z podpisanymi gwarantami. Fachowiec, którego gabinet upadł, nie jest proponowany ponownie, także gdy jego gabinet jeszcze pełni obowiązki. Impas zaczyna się po trzech rundach bez powołania. Formowanie wraca jako obowiązkowe przy nowym kandydacie okna albo przy zmianie umów lub klubów. Powołuje Naczelnik, a od grudnia 1922 prezydent.

**K — etap 7 (0.48):** kandydat Artur Śliwiński (okno VI–VII 1922, fachowiec o neutralnym profilu) jest w kolejności kandydatów i w swoim oknie ma premię +8 jak pozostali. Konstytucyjny gabinet Piłsudskiego jest kandydatem wyłącznie po uzgodnionym premierostwie z 16.7 i przy relacji ≥65; nie należy do automatycznej kolejności fachowców, a jego formowanie nie kosztuje drugiej akcji.

### 8.8. Jedna karta gabinetowa: dostępność, udział PPS i mniejszości

**Z — połączenie tworzenia większości, udziału PPS i warunków gabinetu eksperckiego.** `parliament.cabinet_formation` jest jedną rodziną karty, używającą `Negotiation.kind=cabinet`. Uruchamia ją wynik wyborów 1922, rzeczywisty upadek gabinetu lub konkretna przyjęta propozycja przebudowy rządu. Żaden z tych kontekstów nie otwiera usuniętej karty wcześniejszych wyborów C8. Dobrowolne przygotowanie rzeczywistej alternatywy wymaga dostępnego kandydata i przynajmniej jednego zainteresowanego partnera; nie jest nowym upadkiem urzędującego rządu.

**C1 — jedna scena:** na tym samym ekranie gracz ustawia dostępny układ i kandydata, udział/tolerowanie/opozycję, warunki programu, zabieganie o poparcie mniejszości oraz resorty przy wejściu do gabinetu. Jedno zatwierdzenie rozlicza całość i pokazuje wynik. Nie ma pierwszej sceny wyboru partnerów i drugiej sceny udziału PPS ani późniejszej kontrpropozycji. Tryby to `member`, `external_support`, `opposition`; poparcie tylko wskazanej ustawy bez stałej umowy pozostawia `opposition`. Opozycja nie wymaga zgody partnerów. Nie ma dodatkowego menu priorytetów negocjacyjnych. Wszystkie dziewięć kategorii resortów zachowuje wspólne zasady; gracz składa ofertę konkretnych stanowisk.

`Negotiation` dodaje `context={reason,event_id}`, `configuration_id`, `candidate_id`, `programme_profile`, `pps_mode_proposed`, `seek_minority_support:false`, `minority_terms:[]`, `availability_snapshot` i `phase`. Powody obejmują `post_election`, `cabinet_fall`, `reconstruction`, `economic_crisis`, `institutional_crisis`, `alternative_preparation`; każdy poza pierwszym ma referencję do rzeczywistej sprawy. To typ sprawy, a nie nowe swobodnie przestawiane opcje gracza. Całość używa jednego identyfikatora transakcji. Obowiązkowe formowanie: 0 T za jedno zatwierdzenie; własna inicjatywa: 1 T łącznie, bez dodatkowego miesiąca za ministrów, kandydata lub mniejszości.

**Wyszarzanie:** gracz może obejrzeć konfiguracje i ich braki, ale wybrać do negocjacji tylko takie, dla których istnieją dostępni kandydaci, politycznie dopuszczalne warunki oraz realna możliwość wystarczającego poparcia. `can_negotiate` uwzględnia możliwe warunkowe zgody partnerów na pokazaną ofertę minimum; `can_appoint` wymaga już rzeczywiście przyjętych umów i legalnej procedury. Niepewna zgoda jest oznaczona „wymaga uzgodnienia”, nie liczona jako zdobyty głos. Czerwonych linii, brakujących mandatów i bramki kryzysowej nie można ominąć wydaniem R.

Lewica i centrolewica po wyborach 1922 są wyszarzone, jeśli nie mają realnego oparcia. Nie wprowadzamy sztywnego zakazu alternatywnej lewicowej większości, gdy kampania i porozumienia faktycznie ją umożliwiły. Wariant mniejszościowy nadal spełnia prognozy 8.6; nie zakładamy, że wszyscy niepozyskani przeciwnicy wstrzymają się. Ich jawne profile lub zobowiązania określają przewidywane zachowanie.

**Poparcie mniejszości:** dla potencjalnego gabinetu z udziałem lub poparciem PPS gracz może zaznaczyć „zabiegać o zewnętrzne poparcie mniejszości” albo pozostawić je wyłączone. Menu przelicza wykonalność obu wariantów. Zaznaczenie może uczynić wcześniej niedostępny układ negocjowalnym, ale samo nie daje głosów. Uzgodnione prawa językowe, szkolne, organizacyjne lub ziemskie trafiają do tej samej umowy. Dwa istniejące segmenty z 5.5 przyjmują warunki osobno; mogą poprzeć różny zakres. Nie tworzymy dodatkowych mandatów, trzeciej kategorii ludności ani ministerstw mniejszości. Odmowa jednego segmentu wymaga ponownego sprawdzenia całej oferty przed powołaniem.

**Gabinet szeroki i stabilizacyjny:** `crisisOfferAllowed = majorCrisis && context.reason!=="post_election"`. Dotyczy `broad_centre`, `skrzynski_broad`, `national_unity` oraz eksperckiej oferty nadzwyczajnej stabilizacji. W zwykłym otwarciu po pierwszych wyborach są wyszarzone, również gdy dałoby się zsumować ich mandaty. Dopiero nowy rzeczywisty kryzys nadaje właściwy kontekst; ponowne wejście do menu nie zmienia `post_election` w kryzys. Zwykły gabinet administracyjny lub ekspert powołany do konkretnego zadania nie jest automatycznie szeroką koalicją stabilizacyjną — nie blokujemy przez tę etykietę wszystkich historycznych gabinetów eksperckich.

P — `severeCrisis = majorCrisis && (nationalGrievance>=75 || cabinetFallsLast6M>=3 || activeInstitutionalEmergency)`. Ostatnie pole jest pochodną aktywnego wydarzenia bezprawnej przemocy wobec instytucji. Jedność narodowa wymaga tego ostrzejszego warunku. W istniejącej ocenie oferty z 8.3 dla dopuszczonego wariantu kryzysowego:

```js
crisisCooperation = crisisOfferAllowed && isCrisisConfiguration
  ? min(20, 5*cabinetFallsLast6M +
      0.5*max(0,nationalGrievance-60) + 10*I(currencyCrisis))
  : 0;
```

`currencyCrisis` ma definicję 11.9. Rosnący kryzys zwiększa gotowość do porozumienia przez istniejące `needForThisAgreement`, do jego limitu 100. Nie dodajemy drugiego losowania ani gwarancji akceptacji. Wariant poza bramką pozostaje zablokowany; wysokie relacje nie zastępują kryzysu. Zakończona kryzysowa umowa nie rozpada się automatycznie, gdy jej polityka zmniejszy kryzys. Wymagania dotyczą zawierania nowego porozumienia, a potem obowiązuje jego zapisany termin i treść.

**Grabski:** `candidate_id=grabski` oraz `programme_profile=stabilisation` w tej samej karcie. Warianty osłon, podatku majątkowego i pożyczki z 9.7 są treścią oferty. Nie ma oddzielnej karty `cabinet.grabski_terms`, osobnego dodatkowego czasu ani ponownego przydziału resortów. Tak samo działają właściwe profile innych ekspertów. Karta nie powołuje żadnego premiera bez jego zgody i poparcia.

**K — etap 3 (0.44):** karta `polish_cabinet_formation` to C1: jeden ekran z układem, premierem, udziałem PPS, prośbą o poparcie mniejszości i resortami, jedno zatwierdzenie i wynik z odpowiedziami partnerów. Obowiązkowe formowanie (po wyborach 1922 i po upadku rządu) kosztuje 0 T i nie ma przycisku zamknięcia. Własna inicjatywa w kryzysie leży w talii „Parliament” i kosztuje 1 T przy złożeniu oferty. Prognoza głosów (decyzja etapu 3): członkowie i partnerzy z umową głosują za, pozostałe kluby według oceny programu (poniżej 40 przeciw, inaczej wstrzymanie), KPP i Inni się wstrzymują. Gabinet jest wykonalny przy większości albo przy przewadze głosów za nad przeciw.

### 8.9. Sprawdzenie czterech ofert M02 — 21 IX 2026

**Diagnostyka reguł 0.13, nie ukończona symulacja kampanii.** [Raport kroku 1](../analysis/m02-negotiations/REPORT.md) i jego kalkulator zastępują założenie „partnerzy się zgodzili” jawnymi ocenami czterech porozumień. Próg 60 i wagi 8.3 pozostają bez zmian. Wiarygodność jest kontrolnie równa 50; pełna kampania musi podstawić rzeczywisty rejestr zobowiązań. Przyjęte w raporcie alternatywy wymagają faktycznej dostępności, nie pojawiają się od samej daty.

| Porozumienie | Wynik sprawdzenia i konsekwencja |
|---|---|
| Tolerowanie Grabskiego za osłony | W jawnym profilu P premiera ocena 68,17 pozwala przyjąć program. Nie zapewnia większości dla jego podatków: Piast/NPR oceniają badany pakiet +2 na 56,94, PSChD na 49,17. Starej prognozy budżetowej nie wolno wykonać bez uchwalonego finansowania |
| Szeroki gabinet Skrzyńskiego | Przy przygotowanej ofercie Witosa ZLN daje 59,65 w C i 54,65 w H. Samo zniesienie bramek wejścia nie zapewnia zgody. Jeden dodatkowy kontakt wystarcza w C; w H kontakt i istniejący bonus koalicyjny Daszyńskiego. Bez faktycznej alternatywy H daje 62,50 |
| Zachowanie osłon | Przy tej samej prawicowej alternatywie nacisk daje ZLN 59,65 przy relacji 25, 60,65 przy 29. Przekonywanie bez groźby odejścia daje odpowiednio 57,50 i wymaga relacji 37 do wyniku 60,50. To przykłady wpływu relacji na ocenę, nie osobne minima; od 0.16 nie stosujemy dodatkowych bramek 25/45 |
| Oferta Witosa | Przy własnej inicjatywie Piasta PSChD i ZLN dają po 73,54. Pełne kluby dają 230:214; utrzymanie braku 10 posłów Piasta zmienia wynik na 220:224. Odejście PPS nie przywraca tych głosów |

**P — konkretne uzupełnienia profili do testów:** Grabski ma ideał `fiscal=+1`, bezpośrednią relację z PPS 50 i mandat do rozmowy o finansowanej stabilizacji; Skrzyński `fiscal=0`, relację 50 i wymóg udziału PPS oraz pełnego finansowanego minimum. To jawne dane próbne, nie ustalenia historyczne ani relacje wyprowadzone ze znajomości PPS z dowolną partią. Wariant Grabskiego z ideałem 0 daje 58,44 i odmowę, więc wybór profilu wymaga świadomej kalibracji. Nie zakładamy pełnego historycznego odtworzenia tych osób.

**P — konkretna alternatywa resortowa NPR w `skrzynski_broad`:** `labor` albo `economic` przy zapisanej pełnej osłonie i zachowaniu samodzielności związków. W przetestowanej obsadzie PPS otrzymuje Pracę, NPR Gospodarkę, Piast Rolnictwo, PSChD Sprawiedliwość, ZLN Skarb. To warunkowa propozycja uzupełniająca preferencję z 8.6, nie zgoda NPR na dowolny resort ani drugi minister Pracy. Bez tego uzupełnienia literalne wymaganie Pracy przez PPS i NPR blokuje badaną ofertę.

**K — etap 8 (0.49), A2:** alternatywa wdrożona (`PolishGovernment.PORTFOLIO_ALTERNATIVES`): w `skrzynski_broad` NPR uznaje za swój resort także Przemysł i Handel. Bez niej NPR odrzucała każdy gabinet z PPS w Pracy, a PPS nie wchodziła do rządu w żadnej kampanii.

Kontakty i akcję doradcy trzeba rzeczywiście wykonać w dostępnym czasie. Bonus przygotowania dotyczy jednej oferty formowania, nie jej późniejszego przeglądu. Odmowa zatrzymuje skutki tej gałęzi; późniejszych rezultatów archiwalnego przebiegu nie wolno zachować, jeśli nie powstał jego gabinet albo finansowanie. Połączone przebiegi i końcową korektę opisują 17.16.10–11; dalszy balans sprawdzamy w grywalnym prototypie.

## 9. Umowy, napięcie koalicyjne i utrata poparcia

### 9.1. Schemat zobowiązania

`Agreement` zawiera:

| Pole | Typ / znaczenie |
|---|---|
| `id,parties,cabinet_id,kind` | Tożsamość, uczestnicy, gabinet albo null, typ umowy |
| `signed_at,status` | Data; `proposed\|active\|fulfilled\|breached\|withdrawn\|expired` |
| `obligations[]` | Konkretne zobowiązania |
| `support_scope` | Wskazane ustawy, budżet, niepopieranie odwołania albo członkostwo |
| `tension,ultimatum` | Ocena 0–100 i osobny rekord terminu |
| `extensions_used` | Licznik zaakceptowanych przesunięć terminu |
| `responsibility` | Udziały autorstwa i wykonania |
| `history` | Wykonanie, naruszenia i renegocjacje bez nadpisywania historii |

`Obligation`: `id,topic,beneficiaries,required_project,required_stage,min_coverage,funding_source,due_at,red_line,weight,fulfillment,last_checked`.

Przykład P: „osłona pracownicza” wymaga projektu w fazie `operating`, pełnego wykonania (`min_coverage=1`) i rozpoczęcia świadczenia do t+4; ma wagę 2. Samo `law_passed=true` daje postęp, ale nie spełnia tej obietnicy.

**K — etap 4 (0.45):** punkty programu z umów dostają projekty, terminy i reguły (decyzja etapu 4): ziemia 0/+1 — parcelacja do t+6; finanse +1/+2 w gabinecie partyjnym — osłona w pełnym wariancie do t+4; finanse, Kościół i równość prawna — reguły; instytucje — projekt 7.6 bez terminu; warunki szkolne mniejszości — szkoły do t+6. Gabinet wykonuje obietnice w swoich resortach sam, w przeglądzie 17.16.4; wykonanie ustala `PolishProjects.updateObligations`.

### 9.2. Napięcie jest wynikiem niewykonania

Dla każdej nadal wiążącej umowy (`active` lub `breached`, bez wycofania/wygaśnięcia) liczymy raz na miesiąc:

```js
delta = min(20, 8*sum(weightsOfOverdueUnfulfilledObligations)) +
        15*newRedLineBreaches +
        4*unagreedBurdenPoints -
        12*newlyFulfilledObligations;
tension = clip(tension + delta, 0, 100);
```

`new...` pochodzi z dziennika skutków z identyfikatorami, więc ponowna kontrola nie nalicza go drugi raz. `unagreedBurdenPoints` to 0–3 z tabeli reakcji danego pakietu, nie ogólna kara za lewicowość.

| Stan | Reguła P | Rezultat |
|---|---|---|
| Napięcie <40 | Brak formalnego ostrzeżenia | Można dalej wykonywać umowę |
| Napięcie ≥40 | Pierwsze ostrzeżenie w danej instancji | Agenda wskazuje powód i zagrożone poparcie |
| Napięcie ≥60 | Ultimatum z terminem t+2 | Gracz ma co najmniej jedną pełną zwykłą turę reakcji |
| Upływ ultimatum | Wskazane naruszenie nadal niewykonane i nierozwiązane | Partner wycofuje odpowiedni zakres poparcia |
| Wykonanie / przyjęta renegocjacja | Zamknięcie konkretnego naruszenia | Ultimatum może wygasnąć; zachowujemy ślad wcześniejszego konfliktu |

Samo 75 lub 100 napięcia nie rozwiązuje parlamentu. Nagłe naruszenie jawnej, nieprzekraczalnej granicy może wywołać natychmiastowe wyjście tylko wtedy, gdy taki skutek jest wcześniej zapisany w umowie i pokazany przy wyborze.

**K — etap 3 (0.44):** `PolishGovernment.settleAgreements` liczy napięcie raz w miesiącu w rozliczeniu `post_event`. Nowe naruszenie obowiązku, za który PPS odpowiada, obniża reputację o 5, a wykonanie podnosi ją o 3, raz na ID. Ostrzeżenie (≥40) i ultimatum (≥60, termin t+2) stawia partner, któremu należy się obietnica, ale nie partia premiera. Każde z nich otwiera odpowiedź 0 T w stałej karcie `polish_government_response`. Po upływie ultimatum partner wycofuje poparcie (9.4). Obietnice czekające na programy etapu 4 (`awaiting_stage4`) nie mają terminu ani napięcia, więc w grze etapu 3 ultimatum nie występuje; mechanizm sprawdza testowy program osłony (decyzja etapu 3). `unagreedBurdenPoints` wynosi 0 do etapu 4.

### 9.3. Co można wynegocjować

Jedno standardowe przedłużenie o 3 M jest dostępne, gdy:

```js
relation >= 50 &&
weightedFulfillment >= 0.50 &&
extensions_used === 0 &&
!unresolvedRedLine &&
partnerAccepts(revisedOffer);
```

`weightedFulfillment` to suma wag spełnionych części podzielona przez sumę wag aktywnych wymagań. Nie zaczyna się od fikcyjnej stałej „6” niezależnej od liczby celów.

Renegocjacja zapisuje nowy zakres, termin i ustępstwo; nie podnosi automatycznie `fulfillment`. Doraźne działanie doradcy może usunąć 8 napięcia, lecz nie zamyka niewykonanej obietnicy. Jeśli przyczyna trwa, miesięczny proces ponownie podnosi napięcie.

**K — etap 3 (0.44):** przedłużenie jest odpowiedzią 0 T na ostrzeżenie lub ultimatum. Gdy termin już minął, trzy miesiące liczymy od renegocjacji (P). Przyjęte przedłużenie od razu zdejmuje ultimatum, jeśli nic innego nie jest zaległe.

### 9.4. Kolejność po wyjściu partnera

```text
wycofanie określonego poparcia
→ przeliczenie deklaracji w danej sprawie
→ propozycja zastępczego porozumienia lub rząd mniejszościowy
→ ewentualne głosowanie o ustąpieniu / decyzja premiera
→ dopiero potem formowanie kolejnego gabinetu
```

Aktualne mandaty nie znikają. Wycofanie PPS z gabinetu odbiera jej własne resorty po odpowiedniej zmianie obsady, lecz nie unieważnia ustawy. Przedterminowe wybory uruchamia wyłącznie procedura z rozdziału 7.

**K — etap 3 (0.44):** wyjście partnera kończy jego umowy z gabinetem. Jego resorty przechodzą do fachowców, deklaracje są przeliczane, a gabinet trwa jako mniejszościowy i otwiera się wniosek o odwołanie (7.1). Gdy wychodzi partia premiera, premier podaje się do dymisji. Upadek otwiera obowiązkowe formowanie; wybory nie są zarządzane.

### 9.5. Komuniści: powtarzane przygotowanie zamiast licznika-koalicji

Nowy stan `S.actors.communist_cooperation` ma pola: `contact_open,trial_records,rules,pps_internal_acceptance,active_agreement`. `trial_records=[]`; `successful_joint_actions` i `failed_joint_actions` są liczbami wyprowadzonymi z unikalnych zakończonych rekordów, nie drugim równoległym licznikiem.

`pps_internal_acceptance` jest średnią poparcia dla tego konkretnego układu we frakcjach, ważoną ich znormalizowaną siłą. Testowe poparcie zaczyna od 50 w każdej frakcji, a uzgodnienie dopuszczalnej linii dodaje 15, odrzucone złamanie jej reguł odejmuje 15; ograniczenie 0–100. Ten wynik nie jest ogólną spójnością partii. Nieudana wspólna próba zwiększa `failed_joint_actions` o 1 i obniża relację o 5, raz na ID próby.

**Z — 0.25 (M13): akceptacja działa tylko na PPS.** „Uzgodnienie dopuszczalnej linii” to opcja **Kompromis** w karcie `party.unity` (10.5), gdy jej przedmiotem jest współpraca z komunistami. Daje +15 poparcia tego układu w każdej frakcji, za 1 T i z odnowieniem 6 M jak inne karty 10.5. `pps_internal_acceptance>=60` oznacza linię uzgodnioną: znosi karę sprzeciwu Centrum z 9.6 i, jak dotąd, jest jedną z bramek trwałego frontu. Akceptacja nie wpływa na dyscyplinę KPP (9.6). Posłuch własnych związków i Milicji we wspólnej akcji liczy zwykły 10.3 z ich `alignment` wobec linii.

| Krok | Warunek P | Koszt i wynik |
|---|---|---|
| Otworzyć kontakt (`kpp.contact`, karta Stosunki z partiami) | Relacja ≥10, czyli od startu (Z, 0.29, M17; wcześniej ≥20) | 1 T; zapis kanału, relacja +4; od następnego miesiąca zwykłe rozmowy z 8.1 obejmują KPP |
| Uzgodnić próbę (`kpp.trial`) | Własna inicjatywa przy istniejącym żądaniu: kanał i relacja ≥30; odpowiedź kryzysowa według 9.6 | 1 T własnej inicjatywy albo 0 T odpowiedzi w wydarzeniu; nigdy oba koszty za tę samą umowę |
| Wykonać próbę | Obie strony dotrzymały zakresu i końca | Jeden udany rekord; relacja +5 za pełną, +2 za lekką współpracę według 9.6 |
| Uzgodnić zasady (`kpp.rules`) | Dwie różne udane akcje, w tym jedna pełna (9.6); relacja ≥50 | 1 T; stanowisko wobec legalności, przemocy i samodzielności PPS |
| Zawrzeć szerszy układ (`kpp.agreement`) | Zasady przyjęte przez obie strony, zgoda własnego zaplecza ≥60 | 1 T i 1 R na przygotowanie; umowa o wskazanym celu |

**Z — 0.35: miejsce kroków.** „Otworzyć kontakt” jest opcją karty Stosunki z partiami, dopóki kanał jest zamknięty. Po otwarciu kontaktu kroki `kpp.trial`, `kpp.rules` i `kpp.agreement` są w stałej pozycji agendy „Współpraca z KPP”, która pokazuje następny dostępny krok. Próbę można też uzgodnić odpowiedzią 0 T w wydarzeniu strajkowym (9.6).

**Z — 0.29 (M17): droga w rozdziale 1 przez zwykłe działania.** Relacja z KPP startuje od 10. Przy dawnym progu 20 i jedynym wcześniejszym wzroście ze stanowiska prosowieckiego (+5, raz) kanał nigdy się nie otwierał bez Drobnera. Teraz plan „kontakt, potem rozmowy co 3 M” prowadzi do:
- lekkiej koordynacji w strajku (≥20) w 4. miesiącu, po 3 akcjach;
- pełnej współpracy (≥30) w 10. miesiącu, po 5 akcjach;
- zasad szerszego układu (≥50) po ok. 25 miesiącach i 10 akcjach.

Udane próby (+2/+5) i stanowisko prosowieckie (+5) skracają drogę. Stanowisko krytyczne (−5) lub kampanie polemiczne przeciw KPP (−2) mogą ją zamknąć poniżej 10. Rozmowy Drobnera z KPP należą do kontynuacji. Diagnostyka: [analysis/m17-late-advisors/REPORT.md](../analysis/m17-late-advisors/REPORT.md).

Wyższa relacja nie zastępuje brakującej zgody na zasady. Próba, w której partner odmówił uzgodnionego zakończenia, nie daje punktu sukcesu. Parlamentarni reprezentanci muszą niezależnie przyjąć zobowiązanie do głosowania.

Reakcje innych partnerów wynikają z porównania treści umowy z ich czerwonymi liniami. Nie kopiujemy niemieckich reguł Conciliators, Wittorf ani automatycznej koalicji KPD. Ograniczona współpraca jest możliwa bez koalicji rządowej i bez pełnej rewolucyjnej ścieżki.

**K — etap 5 (0.46):** pozycje agendy partii (`kpp_trial`, `kpp_rules`, `kpp_agreement`) pojawiają się przy kanale otwartym kontaktem z etapu 3. Próba wymaga relacji 30 i istniejącego wspólnego żądania (`communist_cooperation.demands`), które przyniosą strajki i demonstracje etapu 6. Reguły wymagają dwóch różnych udanych prób, w tym jednej pełnej, i relacji 50. Szerszy układ wymaga reguł, akceptacji 60 i 1 R. Akceptacja wewnątrz PPS zaczyna od 50 w każdej frakcji. Opcja karty Jedność „linia współpracy” daje +15 (1 T, cd 6 M). Wynik wykonanej akcji zapisuje `PolishParty.resolveTrial`, raz na akcję: złamanie reguł −15 akceptacji w każdej frakcji, niepowodzenie −5 relacji i +1 `failed_joint_actions`. Dyscyplina KPP to `clip((relacja + dopasowanie celu)/200, 0,10, 0,90)`, bez wpływu akceptacji.

### 9.6. Karta wydarzenia: współpraca z komunistami podczas strajku

**Z — trzy warianty:** pełna współpraca, lekka koordynacja, brak współpracy. `society.strike_communist_cooperation` pojawia się, gdy trwa lub jest przygotowany konkretny strajk, komuniści rzeczywiście w nim działają, a PPS może odpowiedzieć na ich udział. Obejmuje także strajki 1923/Kraków. Nie losujemy jej bez protestu i partnera. Jest jednym krokiem odpowiedzi kryzysowej 0 T, z własnym `strike_id`; koszty funduszu i ewentualnej ochrony są rozliczane raz przez macierz strajku. Własne rozpoczęcie strajku nadal kosztuje 1 T.

| Wybór | Warunki i organizacja | Konsekwencje P |
|---|---|---|
| **Pełna współpraca** / `full` | Kontakt otwarty, relacja ≥30, obie strony akceptują wspólne żądania i reguły zakończenia; wspólny komitet całej uzgodnionej akcji | Wspólne uczestnictwo wzmacnia nacisk, lecz złamanie zasad przez partnera może rozszerzyć niekontrolowany protest. Centrum +5 sprzeciwu, gdy `pps_internal_acceptance<60` (M13) |
| **Lekka koordynacja** / `limited` | Wspólne ograniczone żądanie i przyjęta koordynacja terminu/bezpieczeństwa, testowo relacja ≥20; osobne kierownictwa | Połowa dostępnego wkładu partnera zostaje związana zakresem porozumienia; reszta działa samodzielnie. Centrum +2, gdy `pps_internal_acceptance<60` (M13); Lewica +3 tylko jeśli wcześniej obiecano pełną współpracę |
| **Brak współpracy** / `none` | Zawsze dostępny | PPS zachowuje własne żądania i dowodzenie protestem, lecz nie wykorzystuje organizacji partnera. Bez automatycznej poprawy posłuchu ani zniknięcia komunistów; złamana wcześniejsza obietnica współdziałania wywołuje normalny konflikt |

„Pełna” dotyczy **tego strajku**; nie oznacza połączenia partii, koalicji rządowej, poparcia ZSRR ani zgody na przemoc. Eskalacja celu protestu to osobny wybór z 17.5. Gracz może prowadzić pełną współpracę przy ograniczonych żądaniach albo radykalny strajk bez komunistów.

Profil zapisuje rozłączne pule uczestników PPS, partnera i pozostałego spontanicznego protestu. `external_participation` i własny fundusz partnera pochodzą z profilu wydarzenia; testowo dostępny wkład 10 punktów udziału, nie 10 osób ani 10 F. Nie dopisujemy go ponownie do zasięgu związku PPS. Pełna współpraca wiąże porozumieniem całość, lekka połowę; poza porozumieniem zachowanie partnera określa jawny profil jego własnego działania, nie polecenie PPS.

P — przestrzeganie przyjętych zasad bada zapisany raz rzut. **Z — 0.25 (M13):** dyscyplina zależy od partnera, nie od nastrojów w PPS:

```js
partnerCompliance = clip((relation + goalFit) / 200, 0.10, 0.90);
// goalFit: wspólne żądania na poziomie celu partnera lub wyżej 100,
// o jeden poziom niżej 50, o dwa poziomy niżej 0
```

Poziomy żądań to `limited`, `broad` i `structural`, jak progi 40/60/80 z 14.4. Profil wydarzenia zapisuje `partner_goal`; testowo `broad`, a historyczne cele KPP w konkretnych strajkach pozostają **TBD — historical research required**. Przykład: relacja 30 przy celu szerokim daje 65% dla wspólnych żądań szerokich i 40% dla ograniczonych. Wcześniejszy składnik `pps_internal_acceptance` usunięto: przekonanie frakcji PPS nie zmienia zachowania KPP. Diagnostyka: [analysis/m13-communist-discipline/REPORT.md](../analysis/m13-communist-discipline/REPORT.md). Wynik mówi o dotrzymaniu umowy, nie skuteczności żądania wobec rządu. W udanej próbie finansowany udział objęty porozumieniem dodaje się raz do nacisku `crediblePressure`, maksymalnie do 100. Przy nieposłuszeństwie traci ten wkład w nacisk na **uzgodnione żądanie** i przechodzi do rozłącznego `uncontrolled_participation`. Udział niezwiązany porozumieniem zwiększa nacisk na żądanie PPS tylko jeśli partner niezależnie podtrzymuje to samo żądanie; do niekontrolowanego udziału trafia tylko po faktycznej odmowie uzgodnionego ograniczenia lub końca.

**K — etap 8 (0.49):** cel KPP to `structural` (profil `kpp_goal_1922_1926`; `PL-KPRP-GOALS-1923`: w 1923 r. KPRP chciała strajkiem powszechnym obalić gabinet i utworzyć rząd robotniczo-chłopski). Pełny komitet z KPP wymaga więc żądania szerokiego albo politycznego; przy relacji 30 szansa dotrzymania zasad wynosi 40% przy żądaniu szerokim i 65% przy politycznym. Przykład powyżej opisuje dawny cel testowy `broad`. Nazwa KPP obejmuje cały rozdział, choć do 1925 r. partia nazywała się KPRP (uproszczenie gry).

Brutalizacja wynika następnie z niekontrolowanego udziału, zachowania władz i zezwolenia na konfrontację według 17.5. Przy pełnej, przestrzeganej umowie kontrola może być lepsza niż przy rywalizujących wezwaniach. Przy zerwaniu wspólnego końca większa wspólna mobilizacja zwiększa zakres kryzysu. Samo słowo „komuniści” nie dodaje stałego prawdopodobieństwa przemocy.

Na końcu zapisujemy `TrialRecord{id,action_id,kind,strike_id,mode,terms,partner_response,ended_as_agreed,result}`, dla tej sceny `kind=strike`, `action_id=strike_id`; inne rodzaje rzeczywistej akcji opisuje 10.4.5. Wykonana próba `full` daje relację +5, `limited` +2; naruszenie zasad przez którąkolwiek stronę daje −5 i wynik nieudany; brak współpracy nie jest nieudaną próbą. Są to jedyne efekty relacji za próbę — zastępują ogólny przyrost z 9.5. Sukces znaczy dotrzymanie uzgodnień między partnerami, nawet jeśli pracodawca odmówił postulatów. Ponowne otwarcie wydarzenia, ochrona i zakończenie tego samego strajku nie tworzą kolejnych sukcesów.

**Powtarzane przygotowanie:** co najmniej dwa udane współdziałania w dwóch różnych rzeczywistych akcjach, w tym przynajmniej jedno pełne, pozwalają przy relacji ≥50 negocjować zasady szerszego układu z 9.5. Dwie lekkie koordynacje to za mało. **Trwały front** wymaga dodatkowo relacji ≥65, `pps_internal_acceptance>=60` oraz przyjęcia samodzielności PPS i zasad zakończenia akcji. Można pozostać przy działaniach doraźnych, zawrzeć porozumienie pracownicze albo przygotować układ parlamentarny. Przygotowanie umowy kosztuje 1 T i 1 R, bez ponownej opłaty pod inną nazwą.

Układ parlamentarny wymaga osobnej zgody legalnych reprezentantów na `rules.legal_vote`, `rules.no_forced_merger` i `rules.agreed_strike_end`; odblokowuje ofertę `united_left` lub `workers_front`, która nadal podlega 8.6. NPR nie musi przyjąć tej samej oferty. Pierwszy trwały front daje Centrum +8 sprzeciwu bez uprzedniej akceptacji jego warunków. Pozycja wobec ZSRR z 10.10 modyfikuje relacje i treść rozmów, ale nie zastępuje wykonanych prób.

**K — etap 8 (0.49):** szersze porozumienie z KPP na trzech zasadach (`rules_agreed` i `active_agreement`) odblokowuje oferty `united_left` i `workers_front`; dalej obowiązują progi relacji, zgody partnerów i głosy 8.6, a KPP w takim gabinecie nie żąda resortu. Do etapu 8 obie oferty były zawsze zamknięte. Próbę wspólnego działania uzgadnia krok współpracy w strajku (14.3); osobnej pozycji próby nie ma już w agendzie partii.

Ten kontrakt zastępuje trzy osobne losowe karty prób `joint_wage_committee`, `joint_protest_protection`, `joint_civil_rights` z poprzedniego szkicu. Komitet, ochrona i obrona praw mogą być treścią konkretnego wydarzenia; nie są trzema dodatkowymi przyciskami zbierania punktów koalicji.

**K — etap 6 (0.47):** krok współpracy pojawia się po wyborze celu protestu w karcie kroków strajku (`polish_strike_steps`), gdy strajk obejmuje przemysł albo kolej, a KPP ma co najmniej 5% wśród robotników (P). Wkład komunistów to 10 punktów udziału z celem szerokim (P). Pełna współpraca wymaga otwartego kontaktu, relacji 30 i zgodności celu co najmniej 50 i wiąże cały wkład; ograniczona koordynacja wymaga relacji 20 i wiąże połowę; bez współpracy nie ma próby. Dyscyplina to jeden zapisany rzut `kpp_discipline:<strajk>` wobec clip((relacja + zgodność)/200, 0,10, 0,90). Dotrzymany wkład dodaje nacisk na uzgodnione żądanie, złamany przechodzi do protestu niekontrolowanego. `TrialRecord` powstaje raz, a wynik rozstrzyga koniec strajku: sukces daje relację +5 przy pełnej współpracy i +2 przy ograniczonej. Centrum +5/+2 sprzeciwu przy akceptacji poniżej 60. Pozycja `kpp_trial` agendy partii nadal wymaga zapisanego wspólnego żądania; próbę w strajku zapisuje krok współpracy.

### 9.7. Warunki stabilizacji we wspólnej karcie gabinetowej

**Z — bez oddzielnej karty Grabskiego.** Przy jego kandydaturze wspólna sekwencja z 8.8 odczytuje profil stabilizacyjny, testowo od XII 1923. Wybór roli PPS i finansowych warunków jest częścią tego samego formowania gabinetu; 0 T w obowiązkowej sekwencji, 1 T całej dobrowolnej inicjatywy. Gracz może:

- tolerować za osłony pracownicze i większe obciążenie majątku;
- tolerować za pożyczkę i ograniczenie wskazanych cięć;
- pozostać w opozycji i szukać innej wykonalnej oferty.

Wejście PPS z ministrami wymaga rzeczywiście przyjętego wariantu koalicyjnego z 8, nie jest domyślną cechą samego nazwiska Grabskiego. Dla tolerowania P pozostaje umowa na 6 M z przeglądem po 3 M. Wynegocjowanie osłon wymaga faktycznego kanału do kandydata/gabinetu i przygotowanego zaplecza: P — `apparatus.level>=2`, zasięg co najmniej jednej objętej branży związku `reach>=40` oraz relacja PPS z adresatem oferty >=40. Adresatem jest kandydat z własnym profilem relacji albo jego faktyczny polityczny gwarant, nigdy dowolna zaprzyjaźniona partia. Kanał istnieje, gdy adresat przyjął udział w tej negocjacji; brak profilu lub odpowiedzi nie oznacza zgody. Te warunki otwierają rozmowę, a jej sukces nadal wymaga `offerScore>=60`, zgodnego programu, finansowania i wykonawcy. Organizacja nie daje automatycznej osłony ani prawa do Skarbu. Obejmuje konkretne osłony, finansowanie i granice cięć. Jeśli premier ma wystarczającą alternatywę bez PPS, może odrzucić jej żądania. Przyjęta pożyczka daje finansowanie, nie stały dochód ani dowolne prawo PPS do emisji.

Późniejszy przegląd prowadzi do czterech odpowiedzi **Stosunku do rządu** z 9.8; propozycja zmiany dochodów lub osłon jest wariantem „wynegocjować ustępstwa” albo „przekonać rząd”. Bieżące negocjowanie budżetu wymaga bramki 17.10. W opozycji ocena efektów stabilizacji jest tematem istniejącej karty mediów/kampanii, nie dodatkową kartą `parliament.assess_stabilization`. Nie daje bezpłatnego budżetowego dostępu ani oddzielnej premii za samo uznanie spadku inflacji.

Skutki finansowe określa 11.9, odpowiedzialność za faktycznie popartą politykę 5.4. Krytyka spadku płac wymaga tego spadku lub niewykonanej osłony; fałszywa deklaracja wyniku nie nagradza PPS. H — stabilizacja i podatek majątkowy mają istniejące źródła ustawowe; polityczne umowy i liczby pozostają P.

**K — etap 4 (0.45):** karta formowania pokazuje warunki stabilizacji, gdy premierem ma być Grabski, a PPS wspiera go z zewnątrz: osłony i majątek są zablokowane do etapów 5–6, a pożyczka z ograniczonymi cięciami zmienia jego profil na stopniową stabilizację z pożyczką. Umowa tolerowania na 6 M z przeglądem po 3 M nie jest jeszcze zapisana.

**K — etap 6 (0.47):** rozmowę o osłonach otwierają `apparatus.level ≥ 2`, zasięg co najmniej jednej branży ≥ 40 i relacja z Grabskim ≥ 40 (w profilu testowym neutralne 50). Grabski odpowiada w tym samym zatwierdzeniu (`protectionTermsAnswer`): ocena 8.3 oferty z obciążeniem majątku (`fiscal` +2) i potrzebą PPS (100, gdy bez PPS nie ma działającego poparcia); gdy ma działające poparcie bez PPS, odmawia jej żądań. Potrzebne są pieniądze — nowy podatek majątkowy z 11.9 przy prognozie budżetu co najmniej −2 B (już obowiązujący podatek nie daje nowych pieniędzy; wystarcza działająca osłona) — i minister Pracy gabinetu jako wykonawca. Odmowa zamyka ofertę PPS bez umowy. Przyjęte osłony dodają do umowy tolerowania pełną osłonę do t+4 (waga 2) i regułę warunków, a profil gabinetu wybiera stabilizację z osłonami i podatek majątkowy. Tolerowanie Grabskiego to umowa na 6 M z przeglądem po 3 M (`agreement.term`). Odpowiedź „tolerowanie za osłony” w wydarzeniu stabilizacji (9.11 katalogu) bez Skarbu otwiera tę samą kartę formowania z Grabskim i osłonami. Poprawka: warunki pożyczki z etapu 4 trafiają teraz do umowy tolerowanego fachowca (`agr-<gabinet>-pps`).

### 9.8. Stosunek do rządu — jedno proste menu

**Z — połączone sprawy tolerowania, koalicji i odwołania gabinetu.** `parliament.government_support` zastępuje niezależne karty „niewykonana umowa” i „wotum nieufności”. Jest dostępna przy rzeczywistej relacji PPS z gabinetem; w opozycji przy konkretnej inicjatywie jego odwołania. Zwykłe użycie P: 1 T, 0 R, cd 3 M na gabinet. Ostrzeżenie lub ultimatum otwiera gwarantowaną odpowiedź 0 T raz na sprawę, także podczas odnowienia. Nie zużywa drugiego miesiąca za samo przekazanie do właściwej procedury głosowania.

| Wybór | Co robi | Warunek i skutek P |
|---|---|---|
| **Zakończyć poparcie** / `withdraw` | Wycofać tolerowanie lub ministrów; w tej samej sekwencji zdecydować o poparciu odwołania rządu | Aktualizacja umów i stanowisk, frakcyjne reakcje na faktyczne zerwanie; odwołanie zależy od głosów i obowiązującego prawa |
| **Wynegocjować ustępstwa** / `bargain` | Przedstawić konkretny postulat jako warunek dalszego poparcia | Ocena 8.3 uwzględnia realne alternatywy premiera. Przyjęta oferta zapisuje zakres i termin; każda partia, która ją przyjęła, obniża relację z PPS o 3. Odmowa wymaga natychmiastowego wyboru: spełnić groźbę albo się cofnąć (Z, 0.23, M11) |
| **Przekonać rząd** / `persuade` | Przedstawić wykonalny postulat bez groźby zerwania | Relacje i zgodność programu nadal liczą się przez 8.3, lecz nie tworzymy groźby upadku: `needForThisAgreement=0` dla tej prośby. Sukces wymaga wyniku ≥60 i braku czerwonych linii. Ani sukces, ani odmowa nie zmieniają relacji (M11) |
| **Utrzymać poparcie** / `maintain` | Zachować bieżący układ bez nowego warunku | Nie daje darmowych ustępstw ani nie usuwa istniejącego niewykonania; własne zaplecze ocenia tolerowaną politykę. Z — 0.36: tylko jako odpowiedź 0 T na ostrzeżenie albo ultimatum partnera; poza kryzysem opcji nie ma, a zamknięcie karty jest bezpłatne |

W opozycji zamiast `withdraw` pojawia się **poprzeć odwołanie gabinetu** albo **odmówić udziału w jego obalaniu**. Pozostałe opcje odnoszą się do posiadanej relacji wsparcia; nie wyświetlamy fikcyjnego „wyjścia z koalicji”. Konstruktywne wotum, jeśli wcześniej uchwalono je w grze, wymaga nazwanego następcy. Odrębna zwykła sprawa odwołania ministra może być etapem kontroli parlamentarnej, ale nie tworzy dodatkowej powtarzalnej karty.

**Z — 0.23 (M11): groźba musi być prawdziwa.** Po odmowie przy `bargain` PPS od razu, w tej samej transakcji i za 0 T, wybiera jedną z dwóch odpowiedzi:
- **spełnić groźbę** — zwykłe skutki `withdraw`, w tym decyzja o poparciu odwołania rządu;
- **cofnąć się** — wiarygodność PPS −5, jak nowe zawinione naruszenie z 17.4, raz na ID negocjacji. Ustawiamy `S.cabinet.pps_threat_discounted=true`: do końca tego gabinetu kolejne `bargain` liczy się z `need=0`, czyli jak perswazja.

Każda partia, która przyjęła ofertę wymuszoną groźbą, obniża relację z PPS o 3, raz na ofertę. Perswazja nie zmienia relacji ani przy sukcesie, ani przy odmowie. Po jej odmowie pozostaje dotychczasowe poparcie i zwykłe wybory karty 9.8, z zachowaniem ich czasu i dostępności. Gdy premier ma wykonalną większość bez PPS (`need=0`), targowanie nie daje premii, a nadal kosztuje; rozsądniejsza jest wtedy perswazja. Diagnostyka: [analysis/m11-threat-persuasion/REPORT.md](../analysis/m11-threat-persuasion/REPORT.md).

`bargain`/`persuade` mają jedną ofertę i odpowiedź tak/nie zapisaną w `Negotiation`, bez sceny kontrpropozycji C2. Poza wyborem po odmowie groźby odmowa nie otwiera kolejnego bezpłatnego menu. Kolejna własna inicjatywa wymaga następnej dostępnej akcji. Realizacja przyjętego postulatu przechodzi przez zwykłego wykonawcę i finansowanie; sama perswazja nie wypłaca świadczeń.

Backend nadal używa umów i napięcia z 9.1–9.4. Ich terminy wyjaśniają wynik i gwarantują okno reakcji, ale nie tworzą osobnych kart przedłużania, zamiany i eskalacji każdego punktu. Prolongata lub zmiana zakresu z 9.3 jest treścią zaakceptowanej oferty, nie dodatkową obowiązkową sceną. To uproszczenie interfejsu zachowujące pamięć obietnic.

K — inspiracja to `source/scenes/government_affairs/dealing_with_toleration.scene.dry`: zakończenie tolerowania, zabieganie o wydatki społeczne, poprawa współpracy i utrzymanie kursu. `source/scenes/government_affairs/coalition_affairs.scene.dry` zawiera reakcję na spór koalicyjny. Nie przenosimy niemieckiego automatycznego zarządzenia wyborów po użyciu opcji; w Polsce upadek gabinetu, otwarcie 7.4 i legalne rozwiązanie są osobnymi rezultatami.

**K — etap 3 (0.44):** karta `polish_government_support` leży w talii „Parliament” (1 T, odnowienie 3 M na gabinet); stała karta odpowiedzi `polish_government_response` daje 0 T raz na sprawę. Żądaniem jest w grze osłona pracownicza z 9.1 (`fiscal=+2`); przyjęta trafia do umowy jako obietnica czekająca na etap 4. Potrzeba rządu wynosi 0, gdy gabinet ma większość bez PPS. Reakcje frakcji na zerwanie wejdą z etapem 5.

**K — etap 5 (0.46):** wycofanie poparcia i spełniona groźba przechodzą przez jeden punkt reakcji frakcji na faktyczne zerwanie (`PolishGovernment.withdrawReactions`), raz na gabinet. Profil testowy jest pusty (P): mechanizm działa, a liczby czekają na decyzję i kalibrację etapu 8.

**K — etap 6 (0.47):** przegląd po 3 M i koniec terminu tolerowania z 9.7 otwierają odpowiedź 0 T raz na sprawę (`review`, `renewal`), gdy nie czeka inna sprawa tej umowy. Działają cztery odpowiedzi: utrzymać, wynegocjować ustępstwa, przekonać i zakończyć. Utrzymanie przy końcu terminu odnawia umowę na 6 M z nowym przeglądem; bez odpowiedzi tolerowanie trwa na dotychczasowych warunkach (P).

## 10. Frakcje, posłuch i doradcy

### 10.1. Normalizacja i spójność

```js
strength[f] = 100 * max(0,strength[f]) / sumFaction(max(0,strength[f]));
dissent[f] = clip(dissent[f], 0, 99);
Q.dissent = min(0.95, sumFaction(strength[f]*dissent[f]) / 10000);
cohesion = 100 * (1-Q.dissent);
```

Początek daje `(50*0+15*20+35*5)/10000=0.0475`, czyli 95,25 spójności. Związki nie są czwartą frakcją.

P — wagi konkretnych reakcji: małe ustępstwo sprzeczne z linią +3 sprzeciwu; poważne +8; złamanie własnej jawnej obietnicy +12; wykonanie zaakceptowanego postulatu −5. Każda opcja wskazuje adresata. Nie stosujemy wszystkich kar do wszystkich frakcji.

**K — etap 5 (0.46):** siła i sprzeciw frakcji są w `S.actors.pps.factions` (otwarcie 50/15/35 i 0/20/5); `Q.<frakcja>_*` i `Q.dissent` są kopiami. Reakcja (`PolishGovernment.factionReaction`) zmienia surowe wartości raz i normalizuje siły raz; akcja zmieniająca kilka frakcji (`factionReactions`) normalizuje raz, na końcu. Reakcja zapisuje przyczynę, a gdy PPS może ją cofnąć, także `reverse`. Sprzeciw partii to `Σ siła·sprzeciw/10⁴` (otwarcie 0,0475, spójność 95,25). Związki są poza sprzeciwem PPS.

### 10.2. Od sprzeciwu do rozłamu — E3

**Z — grozi odejściem część frakcji, nie pojedynczy działacz ani automatycznie cała frakcja.** Zostaje jedna karta E3, bez osobnych scen ostrzeżenia, ultimatum i wykonania rozłamu. Zwykłe karty dyscypliny, doradców i dobrowolnych wykluczeń pozostają dostępne na własnych zasadach. **Z — 0.38:** karta E3 ma ID `party.faction_split`. To jedna definicja dla wszystkich frakcji; `instance_key` to `case_id` sprawy z `S.faction_cases`.

| Próg / warunek P | Mechanika |
|---|---|
| Sprzeciw ≥30 | Informacja o przyczynie w panelu frakcji, bez osobnej sceny |
| Sprzeciw ≥45 | Ostrzeżenie o ryzyku odejścia; posłuch nadal wynika z 10.3 |
| Sprzeciw ≥60 i istnieje konkretne, wykonalne żądanie polityczne | Jednorazowa E3 dla danej sprawy: **Część frakcji grozi odejściem** |

E3 ma dokładnie dwa wybory:

1. **Przyjąć żądanie i zachować jedność.** Gra wykonuje wskazaną zmianę linii, np. wycofanie poparcia dla ingerencji Piłsudskiego lub zakończenie konkretnej współpracy komunistycznej. P: sprzeciw zainteresowanej frakcji −5 jak za spełnione żądanie (10.1); zamyka tę sprawę bez odejścia. Reakcje partnerów i innych frakcji wynikają z rzeczywiście zmienionej polityki. Sama obietnica nie wystarcza.
2. **Utrzymać linię PPS i zaakceptować rozłam.** Zastosowanie zapisanego `departure_manifest` od razu, bez dodatkowej E4. PPS zachowuje linię, lecz traci wskazane zaplecze.

P — domyślny manifest obejmuje 40% zaplecza **tej frakcji**, nie całej PPS. Przed wyborem pokazujemy udział odchodzącej grupy, zmianę członkostwa i poparcia PPS, mandaty oraz wskazane struktury organizacyjne. Straty zapisuje jeden manifest; członkostwo, wyborcy i organizacje nie są trzema niezależnymi potrąceniami tej samej grupy. Siły pozostałych frakcji normalizujemy po odejściu; sprzeciw odchodzących przestaje uczestniczyć w obliczeniu spójności, bez dodatkowego uniwersalnego bonusu za rozłam.

**Z — 0.27 (M16): jeden rachunek rozłamu.** Przyjęty rozłam stosuje ten sam rachunek co czystka z 10.9, z udziałem 40%:

```js
removedShare = 0.40 * oldFactionStrength / 100;
factionStrengthRaw = oldFactionStrength * 0.60;
// Pozostałe siły bez zmiany, następnie jedna normalizacja do 100 (10.1).
remainingFactionDissent = max(0, oldFactionDissent - 20);
apparatus.member_index *= 1 - removedShare;
// W każdej komórce elektoratu, do odbiorcy z manifestu albo `other`:
lostPpsPP = oldPpsPreference * removedShare;
leavingMPs = round(0.40 * frozenFactionSeats);   // raz, do klubu rozłamowego
```

- **Wyborcy** odchodzą w tej samej proporcji co członkowie. Odbiorca jest częścią manifestu sprawy, np. KPP przy rozłamie Lewicy; brak wskazania oznacza `other`. Każda komórka nadal sumuje się do 100.
- **Organizacje** tracą tylko struktury wskazane w manifeście, bez automatycznego procentu.
- **Sprzeciw pozostałej części** spada o 20, bo odchodzą najbardziej niezadowoleni; czystka odejmuje 15. Spójność liczymy po odejściu.

Przykład: Lewica z siłą 15, sprzeciwem 65 i 5 posłami.
- Odchodzi 6% zaplecza PPS.
- Poparcie PPS spada z 14,7% do 13,8%, członkostwo o 6%.
- 2 posłów przechodzi do klubu rozłamowego.
- Siły frakcji: 53,2 / 9,6 / 37,2; sprzeciw pozostałej Lewicy 45; spójność rośnie z 88,5 do 93,8.

Rozłam Piłsudczyków (siła 35, 12 posłów) zabiera 14% zaplecza i 5 posłów. Diagnostyka: [analysis/m16-split-recalculation/REPORT.md](../analysis/m16-split-recalculation/REPORT.md).

**Doradca domyślnie nie odchodzi:** `departure_manifest.advisor_ids=[]`. Wyjątek wymaga wskazanej z nazwiska osoby powiązanej z tą grupą i podglądu jej odejścia przed decyzją. Przynależność doradcy do frakcji sama nie wystarcza. Utrata osoby usuwa ją z dostępnych i aktywnych doradców raz, bez automatycznego zastępcy.

Mandaty frakcji w klubie PPS są alokowane całkowitoliczbowo. Dla początkowych 35 posłów proporcje 50/15/35 dają 18/5/12. Jeśli odchodzi 40% pięcioosobowej delegacji Lewicy, transfer obejmuje 2 mandaty. **Z — 0.27 (M16): przypisanie posłów jest zamrożone.** Po każdych wyborach dzielimy klub PPS między frakcje metodą największych reszt według ich siły w dniu wyborów, z rozstrzyganiem remisu po ID. Później `faction_seats` zmienia się tylko przy rzeczywistym transferze: rozłamie, czystce albo przejściu posła. Zmiany siły politycznej frakcji, np. po akcji Perla czy powołaniu doradcy, nie przepisują już wybranych posłów. Przykład: Lewica wzmocniona do siły 24,1 miałaby po przeliczeniu 8 posłów i straciłaby w rozłamie 3; przy zamrożeniu ma 5 i traci 2, niezależnie od kolejności akcji. Powstaje nazwany technicznie klub rozłamowy, bez wymyślania historycznej nazwy nowej partii.

Zakończony `case_id` nie uruchamia E3 ponownie tylko dlatego, że sprzeciw nadal przekracza próg. **Z — 0.35:** sprawa odroczona opcją „Przekonać do odroczenia” z karty Jedność (10.5) nie wywołuje E3 przez 3 M od odroczenia; sprzeciw się nie zmienia, a po terminie sprawa wraca. Nowa E3 wymaga nowego konfliktu i nowego żądania. Progi są balansem P; nie przywracają usuniętego łańcucha scen ani terminu t+2 dla rozłamu. Terminy umów koalicyjnych z rozdziału 9 pozostają odrębną mechaniką.

**K — etap 5 (0.46):** decyzja 3A etapu 5: sprawa frakcji powstaje przy sprzeciwie co najmniej 60 i żywej przyczynie, którą PPS może cofnąć. Przyczyną jest linia z karty stanowiska, popularny format prasy, układ z KPP albo udział w gabinecie lub jego poparcie, gdy sprzeciw wywołała jego polityka. Żądanie cofa przyczynę o największym udziale w sprzeciwie; bez takiej przyczyny karty nie ma. E3 (0 T) ma dwa wybory: przyjąć (zmiana od razu, sprzeciw −5, sprawa zamknięta) albo utrzymać linię (odchodzi 40% zaplecza frakcji, sprzeciw reszty −20). Odejście liczy jeden rachunek M16: `removed = udział·siła/100`, siła × (1 − udział), jedna normalizacja, członkostwo × (1 − removed), a w każdej komórce PPS × removed przechodzi do odbiorcy manifestu (Lewica → KPP, pozostałe → Inne; P). `round(udział·posłowie frakcji)` posłów przechodzi do technicznego klubu `pps_split_<frakcja>`, który wstrzymuje się w głosowaniach i nie wchodzi do ofert. Podział klubu PPS na frakcje liczymy przy otwarciu i w dniu wyniku wyborów metodą największych reszt; potem zmienia go tylko transfer. Domyślny manifest nie usuwa doradców.

### 10.3. Posłuch wobec konkretnego wezwania

Każda organizacja ma zapisane nastawienie do rozważanej linii `alignment=0..100`. Posłuch nie jest równy samej spójności PPS:

```js
compliance = clip(0.35 + 0.004*alignment +
                 0.003*cohesion - 0.003*organizationDissent, 0, 1);
```

Poprzednie deklaracje zmieniają `alignment` powoli: kampania danej linii +8, przyjęte wewnętrzne porozumienie +15; nie resetują przeciwnego stanowiska całej organizacji. Nagła zmiana w kryzysie może więc dać niski posłuch mimo dużej nominalnej liczebności.

**K — etap 5 (0.46):** posłuch Milicji liczy `clip(0,35 + 0,004·alignment + 0,003·spójność − 0,003·sprzeciw organizacji, 0, 1)`; AS dodaje 0,15, do 1. Nastawienie do legalnych instytucji (`alignment.legal_institutions`) zaczyna od 50 w Milicji i w każdej branży; obrona demokracji Niedziałkowskiego podnosi je o 5.

### 10.4. Doradcy — konkretne akcje i wpływ na frakcje

**Rewizja Z, 10 września 2026:** użytkownik zastąpił ogólne opisy konkretnymi politycznymi działaniami. Poniżej jest 13 profili A1–A13 i 22 akcje; jedna lub dwie na osobę. Dubois zachowuje miejsce w puli kontynuacji od 1930, bez dopisywania wcześniejszej akcji. **Z — 0.29 (M17):** Próchnik (A12) i Drobner (A13) także należą do obsady kontynuacji. Ich akcje i daty zapisujemy dla rozdziału 2; w rozdziale 1 nie są dostępni. Imiona, przynależności i daty pozostają przyjętymi profilami gry, nie nowymi twierdzeniami historycznymi. Koszty i liczby są P. „KKP” z uwag odczytujemy jako KPRP/KPP; nie tworzymy odrębnej partii.

#### 10.4.1. Co wynika z niemieckich doradców

K — przejrzano menu 24 zachowanych plików niemieckich doradców w `source/scenes/advisors/`. Nie jest to nieskażone archiwum całego oryginału: np. `schumacher.scene.dry` zawiera już odsyłacz PPS, a `source/scenes/party_affairs/shuffle_leadership.scene.dry` został zastąpiony polskim doborem. Rekonstrukcja dawnych powołań opiera się dodatkowo na audycie `docs/GERMAN_ORIGINAL_TECHNICAL_REFERENCE.md`, części „Advisors form a second route-access system”; nie przypisujemy dzisiejszego polskiego selektora Niemcom.

| Wzorzec z istniejącego kodu | Konkretny efekt K | Wniosek dla Polski |
|---|---|---|
| `source/scenes/advisors/wels.scene.dry` | Party Discipline: −5/−10 dissentu zależnie od frakcji; wspólny timer 6 | Pużak bezpośrednio obniża trzy dissenty |
| `source/scenes/advisors/muller.scene.dry` | Koalicja: −1 coalition dissent i +5 relacji Z/DDP/DVP; tolerowanie obniża dissent innych frakcji | Daszyński naprawia koalicję, Ziemięcki łagodzi koszt konkretnego tolerowania |
| `source/scenes/advisors/hilferding.scene.dry` | Against Right and Left: Centrum +10 siły, wybrane inne frakcje −5, Centrum dissent −10; wyjątkowo timer 5 | Perl zmienia rzeczywisty układ frakcji; polski timer ujednolicamy do 6 |
| `source/scenes/advisors/stampfer.scene.dry` | Dostęp do mediów; wybór linii daje frakcji +8 siły i −8 dissentu | Media i frakcje mogą mieć bezpośrednie efekty, bez fikcyjnej wieloetapowej narady |
| `source/scenes/advisors/leipart.scene.dry`, `seydewitz.scene.dry` | Zyski robotnicze zależne od spójności; u Seydewitza także bezrobotni i straty klasy średniej | Arciszewski i Zaremba mają różne grupy i koszty polityczne |
| `source/scenes/advisors/wissell.scene.dry`, `radbruch.scene.dry`, `woytinsky.scene.dry` | Skrócenie timera i wejście do właściwej polityki; nadal wymagane resorty i warunki | Arciszewski, Czapiński i Moraczewski dają gwarantowany dostęp lub jeden etap, nie darmową pełną reformę |
| `source/scenes/advisors/levi.scene.dry`, `rosenfeld.scene.dry` | Relacja KPD +6/+4 razy spójność, koszt dissentu, ograniczony zapis przygotowania koalicji | Drobner poprawia kontakty; polskie realne wspólne próby nie są zastępowane klikaniem licznika |

Pozostałe sprawdzone menu to Aufhäuser, Baade, Braun, Breitscheid, Hirschfeld, Juchacz, Leber, Mierendorff, Pfülf, Schumacher, Sender, Severing i Siemsen. Pokrywają kampanie klasowe, zbiórki, sprawy państwowe i dostęp do kart, a nie jeden uniwersalny typ „mediacji”. W pierwotnym audycie nie każde powołanie dawało identyczny bonus frakcji. W obecnym polskim kodzie pierwsze powołanie daje +5 siły, odwołanie +5 dissentu; nowa reguła niżej dodaje efekt uspokojenia przy pierwszym powołaniu.

#### 10.4.2. Miejsca, odnowienie i powołania

Z — trzy aktywne miejsca, początkowo Daszyński, Pużak, Perl. P — jedno **wspólne** odnowienie 6 M: użycie jednego doradcy w t blokuje wszystkie akcje doradcze do t+6. Autorytatywne `S.cooldowns.advisor_action` przechowuje `available_at`; stary `advisor_action_timer` jest wyliczanym adapterem. Akcja doradcy to 0 T głównej pętli, nie dodatkowy miesiąc; jej R/B pozostają realnym kosztem. Zmiana składu zespołu kosztuje 1 główną akcję, ma odnowienie 6 M i nie resetuje odnowienia działań. **Z — 0.35:** to osobna karta talii partyjnej `party.advisors`, a nie opcja karty Jedność.

| Operacja P | Siła frakcji | Dissent frakcji |
|---|---|---|
| Pierwsze powołanie dostępnej osoby | +5 do surowej siły, następnie normalizacja 10.1 | −5, do 0 |
| Dobrowolne odwołanie aktywnego doradcy | Bez kolejnego automatycznego przeliczenia wpływu za odejście jednej osoby | +5, do 99 |
| Ponowne powołanie tej samej osoby | Bez ponownej premii | Bez ponownego −5 |
| Historyczna niedostępność, rozłam lub czystka | Według jednego rekordu odejścia | Nie naliczać dodatkowo kary za dobrowolne odwołanie |

Pola `appointed_once` zachowujemy; trzy osoby otwarcia są już oznaczone, bez retrospektywnego bonusu do początkowych 50/15/35. Podgląd przed zatwierdzeniem pokazuje wynik normalizacji, nie obiecuje +5 procentowych punktów udziału frakcji. Zmiana składu jest jedną transakcją końcowej obsady: pozorne odwołanie i ponowne dodanie tej samej osoby w tym menu niczego nie farmi. Odwołanie nie usuwa samo mandatów czy całej frakcji. Zmiana siły następnie zmienia wagę dissentu w ogólnej spójności.

**K — etap 5 (0.46):** zmiana zespołu to osobna karta `polish_party_advisers` (6.5 katalogu): jedna końcowa obsada do trzech osób, 1 T, cd 6 M, bez resetu odnowienia akcji doradców. Pierwsze powołanie daje +5 surowej siły frakcji osoby i −5 sprzeciwu, dobrowolne odwołanie +5 sprzeciwu, ponowne powołanie nic. Trzy osoby otwarcia mają `*_appointed_once`. Próchnika, Drobnera i Dubois nie ma w menu rozdziału 1 (M17); Perl wypada po III 1927.

#### 10.4.3. Zatwierdzony katalog i robocze efekty

W tabeli „spójność” jako mnożnik oznacza `1-Q.dissent`, zakres 0–1. Relacje ograniczamy do ich zakresu 0–100. Efekty polityczne i frakcyjne są jednorazowe na wykonanie akcji, nie na wejście do menu. Zmiana surowych sił jest atomowa, z ograniczeniem do zera i jedną normalizacją na końcu.

| Doradca / dostęp | Akcja i klucz P | Konkretny skutek i warunek P |
|---|---|---|
| A1. Daszyński / Centrum; Od początku; wyjście od 1931 według dotychczasowego harmonogramu | **Parliamentary Compromise** / `advisor.daszynski.parliamentary_compromise` | 0 R; Piast +5, NPR +5, PSChD +4. Tolerowanie nadal wymaga dostępnego kandydata, przyjętego programu i rzeczywistego poparcia. |
| A1. Daszyński / Centrum; Od początku; wyjście od 1931 według dotychczasowego harmonogramu | **Broker a Coalition** / `advisor.daszynski.broker_coalition` | 0 R; w koalicji napięcie każdej aktywnej umowy gabinetowej −10, do 0. Podczas wykonalnych negocjacji szerokiego gabinetu +5 do oceny tej oferty przez partnerów, dla jednej wskazanej oferty. Wybieramy jeden tryb; bez darmowej zmiany relacji i bez obejścia bramki kryzysu. |
| A2. Pużak / Centrum; Od początku | **Party Discipline** / `advisor.puzak.party_discipline` | 0 R; Centrum, Lewica i Piłsudczycy po −12 dissentu, do 0. Bez nowej obietnicy, konferencji czy wyboru kompromisu; nie usuwa przyczyn przyszłych przyrostów. |
| A2. Pużak / Centrum; Od początku | **Mobilize the Organization** / `advisor.puzak.mobilize_organization` | 1 R; `base_reach_pps` robotniczych komórek +10, do 100; ich kampanie pracownicze przez 6 M ×1,20. Bez natychmiastowego zysku głosów ani zwiększenia siły związków. |
| A3. Perl / Centrum; Do III 1927 włącznie | **Define the Party Line** / `advisor.perl.define_party_line` | 0 R; surowa siła Centrum +8, Piłsudczyków −4, dissent Centrum −8; normalizacja raz. W komórkach robotniczych transfer KPP → PPS z bazą 1 pp, po spójności i ograniczeniach z 10.4.4. Nie utożsamiamy Lewicy PPS z KPP i nie tworzymy czwartej frakcji. |
| A3. Perl / Centrum; Do III 1927 włącznie | **Direct the Party Press** / `advisor.perl.direct_party_press` | 1 R; wiarygodność prasy +5, do 100, oraz prasowe kampanie PPS ×1,25 przez 6 M. Potrzebna działająca prasa; nie uchyla konfiskaty ani nie dodaje drugiej kampanii w tej samej akcji. |
| A4. Niedziałkowski / Centrum; Od początku | **Build Centrolew** / `advisor.niedzialkowski.build_centrolew` | 0 R; Piast, Wyzwolenie, NPR i PSChD po +3 relacji. Wzrost relacji może odblokować listę/rozmowy z 6.5 i 8.6; nie ustanawia sojuszu ani większości. |
| A4. Niedziałkowski / Centrum; Od początku | **Defend Constitutional Democracy** / `advisor.niedzialkowski.defend_democracy` | 0 R; demokracja +5, do 100; nastawienie istniejących organizacji PPS do obrony legalnych instytucji +5, do 100. Przez 6 M poparcie przez PPS jawnie autorytarnego projektu powoduje dodatkowe +5 dissentu Centrum raz na projekt; szczegóły poniżej. |
| A5. Arciszewski / Centrum; Od początku | **Labour Programme** / `advisor.arciszewski.labour_programme` | PPS w rządzie i posiada Pracę. Przekierowanie do `government.labor_rights` albo `government.social_welfare`; jeden etap za 0 T w trybie doradcy, zwykłe koszty R/B i prawo pozostają. |
| A5. Arciszewski / Centrum; Od początku | **Organize the Workers** / `advisor.arciszewski.organize_workers` | 1 R; wybrana branża związku: zasięg +8, do 100; PPS zyskuje bazowo 3 pp w jej objętych komórkach robotniczych przez transfer zdefiniowany poniżej. Bez premii ogólnokrajowej 3 pp i bez drugiej nagrody Pużaka. |
| A6. Zaremba / Lewica; Od początku | **Worker-Peasant Front** / `advisor.zaremba.worker_peasant_front` | 0 R; Wyzwolenie +8 relacji; w kontynuacji jeden właściwy następca SL zamiast nieistniejącego partnera. Nie dodajemy poparcia Piasta/chadecji, nie tworzymy listy samą nazwą frontu. |
| A6. Zaremba / Lewica; Od początku | **Class Campaign** / `advisor.zaremba.class_campaign` | 1 R; bazowo +4 pp u robotników zatrudnionych, +3 pp u bezrobotnych; odbiorcy liczeni raz. Drobnomieszczaństwo −2 pp PPS (także jeśli obejmuje bezrobotnych); Lewica surowa siła +4 i dissent −5. Transfery, nasycenie i kolejność poniżej. |
| A7. Czapiński / Lewica; Od początku | **Socialist Economic Programme** / `advisor.czapinski.socialist_economic_programme` | PPS w gabinecie; właściwy resort albo umowa wykonania dla wybranej polityki. Jedna z trzech polityk: przejęcie publiczne, progresywne/majątkowe finansowanie, reprezentacja pracownicza w zarządzaniu; dostęp lub jeden etap 0 T. Nadal potrzebne prawo, pieniądze i wykonawca. |
| A7. Czapiński / Lewica; Od początku | **Socialist Education** / `advisor.czapinski.socialist_education` | 1 R, działający TUR; surowa siła Lewicy +6, dissent −5. Przez 6 M transfery od PPS do KPP w robotniczych komórkach ×0,50; zatrzymana część pozostaje przy PPS. Nie ogranicza innych źródeł wzrostu KPP. |
| A8. Jaworowski / Piłsudczycy; Od początku | **Back Piłsudski** / `advisor.jaworowski.back_pilsudski` | 0 R; relacja Piłsudski +8; surowa siła Piłsudczyków +5; Centrum i Lewica po +3 dissentu przy publicznym poparciu. Sprzeczność z przyjętą linią daje raz właściwą wyższą karę zamiast jej dublowania. Nie daje stanowisk ani współpracy gabinetowej z automatu. |
| A9. Moraczewski / Piłsudczycy; Od początku | **Public Works Programme** / `advisor.moraczewski.public_works_programme` | PPS w rządzie; Praca albo przyjęta umowa wykonania jej projektu. Przekierowanie do `government.public_works`, jeden etap 0 T, normalne R/B i prawo. Wszystkie trzy warianty robót, bez dodatkowego resortu Komunikacji. |
| A10. Ziemięcki / Piłsudczycy; Od początku | **Conditional Toleration** / `advisor.ziemiecki.conditional_toleration` | 0 R; `pps_mode=external_support`, aktywny gabinet mniejszościowy z profilem `pilsudski_aligned` i faktyczna umowa. Centrum −10, Lewica −8 dissentu. Niedostępne dla pełnego członkostwa gabinetowego oraz zwykłego rządu bez tego profilu; nie zmienia rodzaju poparcia. |
| A10. Ziemięcki / Piłsudczycy; Od początku | **Municipal Socialism** / `advisor.ziemiecki.municipal_socialism` | 1 R; `base_reach_pps` +8 oraz bazowy zysk PPS +2 pp w istniejącym audytowalnym zakresie dużych miast. Dotyczy robotników, inteligencji i drobnomieszczaństwa tych miast; nie daje ratusza, budżetu miejskiego ani mieszkań bez programu. |
| A11. Malinowski / Piłsudczycy; Od początku | **Organize the Piłsudczyks** / `advisor.malinowski.organize_pilsudczyks` | 0 R; surowa siła Piłsudczyków +8, dissent −10; normalizacja raz. Bez zmiany relacji z Piłsudskim, poparcia rządu lub siły armii. |
| A12. Próchnik / Lewica; obsada kontynuacji (M17), w rozdziale 2 od I 1928; niedostępny w rozdziale 1 | **Republican Left** / `advisor.prochnik.republican_left` | 1 R; demokracja +3; surowa siła Lewicy +5; bazowy zysk PPS +2 pp w robotniczych i inteligenckich komórkach, temat obrony republiki. Zapis przygotowania demokratycznego dla tego audytorium, bez dodatkowej drugiej premii demokracji. |
| A13. Drobner / Lewica; obsada kontynuacji (M17), w rozdziale 2 od I 1928; niedostępny w rozdziale 1 | **Negotiate with the KPP** / `advisor.drobner.negotiate_kpp` | 0 R; relacja KPRP/KPP +10 × spójność; `contact_open=true`; Centrum +5 dissentu za wykonanie tej akcji. Pozostałe warunki prób, zasad, poparcia i mandatów zostają; samo spotkanie nie daje udanej wspólnej akcji. |
| A13. Drobner / Lewica; obsada kontynuacji (M17), w rozdziale 2 od I 1928; niedostępny w rozdziale 1 | **Joint Workers’ Action** / `advisor.drobner.joint_workers_action` | Istniejąca sprawa, partner i reguły z 9.5–9.6. Doradca zastępuje czas jednej inicjatywy, nie jej finansowanie. Przy uruchomieniu pełnej współpracy Centrum +8 dissentu zamiast zwykłego +5 za tę samą akcję. Próba liczy się dopiero po rzeczywistym wykonaniu. |

Identyfikatory akcji używają istniejących ASCII ID osób, bez zmiany nazw plików źródłowych. Nazwy angielskie zachowują zatwierdzone etykiety użytkownika; interfejs może pokazywać ich polskie tłumaczenie.

**Redukcja powtórzeń:** Jaworowski ma jedno Back Piłsudski, Moraczewski jedno Public Works Programme, Malinowski jedno Organize the Piłsudczyks. Ziemięcki zachowuje tolerowanie i miasta. Ogólne Cooperate with Sanacja / Support the Government mieszczą się w relacji Jaworowskiego oraz istniejących kartach gabinetowych, nie powstają jako dwie kolejne kopie. Próchnik ma tylko Republican Left; rozmowy o wspólnym froncie skupia Drobner, który zachowuje dwie różne akcje — kontakt polityczny i rzeczywiste współdziałanie. To redakcyjna synteza w ramach zgody użytkownika na 1–2 akcje, nie usunięcie możliwości współpracy PPS z rządem.

**K — etap 3 (0.44):** akcja Daszyńskiego „Broker a Coalition” działa według tej tabeli: −10 napięcia każdej umowy gabinetowej albo +5 do oceny jednej szerokiej oferty w przygotowaniu, na 6 M. Malinowski i Ziemięcki nie zapisują już `coalition_dissent`.

**K — etap 5 (0.46):** akcje tabeli wykonuje `PolishParty.advisorAction` w scenach doradców: 0 T, własny koszt R, wspólne odnowienie 6 M. Perl i Jaworowski zmieniają kilka frakcji z jedną normalizacją. Obrona demokracji Niedziałkowskiego zapisuje +5 demokracji w `pending_effects` do etapu 7. Socjalistyczny Program Gospodarczy Czapińskiego działa na razie jako wariant finansowy (przekierowanie do karty Skarbu); własność publiczna i reprezentacja pracownicza czekają na rekordy przedsiębiorstw etapu 6. Tolerowanie Ziemięckiego jest zablokowane, bo przed etapem 7 nie ma gabinetu `pilsudski_aligned`. Próchnik, Drobner i Dubois mają tylko powrót (kontynuacja, M17). Żadna scena doradcy nie zapisuje `pro_republic` (przeciek 10).

**K — etap 6 (0.47):** Czapiński: warianty własności publicznej i reprezentacji pracowniczej otwierają kartę Przemysłu z jednym krokiem za 0 T, gdy dana opcja jest wykonalna (prywatny zakład do przejęcia albo zakład publiczny dla reprezentacji); ustawa, pieniądze i wykonawca pozostają.

#### 10.4.4. Wykonanie i zakres modyfikatorów

**Akcja rządowa doradcy:** Istniejący `ActionTxn` z `source=advisor` zapisuje dodatkowo `advisor_id`, `subaction_id`, `project_id`, koszt i jeden znacznik wykonania; pozostaje w `S.turn.pending`, bez drugiej transakcji równoległej. Przed potwierdzeniem wybieramy konkretny wariant i sprawdzamy jego dostępność. Zatwierdzenie ustawia wspólny timer 6 M i daje pojedyncze obejście doboru oraz zwykłego odnowienia tej wskazanej podakcji. Wykonuje pełne przygotowanie (100 według 12.2) albo jedną dopuszczoną decyzję wdrożeniową za 0 T; nie cały projekt i nie dwie pozycje organizacyjnego pakietu. Wykonany krok ustawia normalne odnowienie podakcji. Zamknięcie podglądu niczego nie pobiera; odmowa z powodu braku środków nie zużywa doradcy. Nie wydajemy swobodnie przenośnego tokenu ani dodatkowej raty czasu za samo przekierowanie.

Czapiński daje mocne warianty istniejących polityk: własność publiczną z karty przemysłu, progresywny/podatek majątkowy ze Skarbu oraz reprezentację pracowniczą w zarządzaniu. Ta ostatnia to `Project.policy_choices.worker_representation=consultative|decision_rights` w projekcie przedsiębiorstwa, z pełnym profilem 17.12.5. Konsultacje: 1 T, 0 B; współdecydowanie: dwa etapy po 1 T, 1 B przez 2 M wdrożenia, potem 0 B. Przedsiębiorstwo musi być publiczne albo objęte przyjętą umową właściciela; silniejsze uprawnienia wymagają właściwej podstawy prawnej i wykonawcy. Doradca zastępuje najwyżej jeden dozwolony etap, bez drugiej nagrody czy przejęcia własności. Dostęp do przygotowania nie uchyla koalicyjnych czerwonych linii, prawa własności ani kosztów 11–12. Doradcy nie mają wyłącznego monopolu na te programy: zwykłe karty i agenda nadal do nich prowadzą.

**Transfery poparcia:** dla bazowego dodatniego impulsu `k` w określonej komórce stosujemy `delta=min(availableOtherVotes, k*(1-Q.dissent)*(1-ppsShare/100)/(1+sameActionLast6M))`. PPS dostaje delta; pozostałe partie tracą proporcjonalnie, chyba że wskazano źródło KPP. Dla Perla wyłącznie dostępna pula KPP ogranicza dodatni transfer. Przesunięcie klasowe Zaremby u drobnomieszczaństwa wynosi `min(ppsShare,2)` w tej samej jednostce pp, rozdzielone proporcjonalnie między obecnych konkurentów; gdy PPS ma 100%, profil preferowanych odbiorców straty musi wskazać legalną alternatywę. Bez takiego profilu błąd konfiguracji, nie ujemna preferencja. Wszystkie zmiany odczytują jedną migawkę sprzed akcji; końcowy wiersz pozostaje znormalizowany. Bezrobotni otrzymują dodatni impuls raz, nie ponownie jako zatrudnieni robotnicy; bezrobotny drobnomieszczanin może otrzymać +3 i −2 z jawnych dwóch skutków. Żadna akcja nie zmienia historycznych mandatów.

**Zasięg i czas:** organizacja Pużaka to istniejące `base_reach_pps`, siła związku Arciszewskiego to istniejący zasięg branży. `S.advisors.effects=[]` przechowuje jedynie czasowe modyfikatory `{action_id,kind,audience,starts_at,expires_at,value,used_by}`. Efekty 6 M działają dla t ≤ czas < t+6. Ten sam `kind` nie kumuluje się po ponownym wywołaniu; zasięg i wiarygodność z tabeli zostają do swoich limitów. Bonus Pużaka dotyczy kampanii pracowniczej, Perla wyłącznie prasowej; oba mogą mnożyć wynik tej samej zgodnej kampanii, a wynik nadal przechodzi ograniczenie puli 5.3. Akcje dające natychmiastowy transfer poparcia nie są dodatkowo kampanią 5.3 i nie zużywają drugiej premii za tę samą akcję.

Ochrona zaplecza Czapińskiego działa na rzeczywisty przepływ PPS → KPP przy miesięcznym rozczarowaniu i kampanii rywala. Nie zamraża KPP w całej komórce, nie chroni odpływu do innych partii i nie kasuje dissentu Centrum. Jeżeli jednocześnie działa kilka ochron tego przepływu, stosujemy najsilniejszą zamiast mnożenia. Lewica PPS i KPP pozostają odrębne; „wpływ komunistyczny wewnątrz zaplecza” opisują rywalizacja o robotnicze poparcie i stanowiska programu, nie nowa frakcja komunistyczna.

**Miasta:** Municipal Socialism ma zdefiniowany w profilu zakres `settlement=major_city`, obok `other`. To przekrojowe oznaczenie istniejących komórek, nie dodatkowa populacja. Jeśli komórka obejmuje oba zakresy, dzielimy jej masę na dwie części z tą samą klasą, tożsamością, zatrudnieniem i początkowymi preferencjami. Ich suma zachowuje starą masę i wynik; syntetyczny test przyjmuje 1/2 komórki miejskich klas w dużych miastach, wyraźnie P, a historyczne proporcje są B. Brak profilu nie oznacza automatycznie całej Polski. Akcja nie zakłada kontroli PPS nad miejskim samorządem i nie tworzy miejskiego budżetu.

**Demokracja:** nazwa `pro_democracy` z uwag jest aliasem istniejącego `S.politics.democracy`, nie drugim saldem. Niedziałkowski oddziałuje ogólnie i organizacyjnie; Próchnik prowadzi określoną kampanię robotniczo-inteligencką i wzmacnia Lewicę. Nie dopisujemy kolejnego licznika demokracji dla każdej klasy. Przygotowanie Próchnika zapisuje rzeczywiście wykonaną akcję w istniejącym `democratic_preparation`, bez drugiej automatycznej nagrody. Autorytarna zmiana oznacza w profilu aktu usunięcie wolnych wyborów, legalnego pluralizmu albo parlamentarnej odpowiedzialności władzy; samo legalne wzmocnienie prezydenta nie spełnia tego warunku. Za poparcie sprzeczne z aktywną akcją Niedziałkowskiego stosujemy większą z kar za ten sam czyn, nie dodajemy +5 do już większej kary za złamanie tej samej obietnicy. Nie jest to nowe weto ani automatyczna zmiana głosów obcych klubów.

**Koalicja:** Broker a Coalition używa istniejącego `Agreement.tension`, nie niemieckiego globalnego `coalition_dissent`. Obniża bieżące napięcie, nie kasuje terminów i niewykonanych obowiązków; kolejne miesiące mogą je znowu zwiększyć. Bonus formowania +5 zapisujemy przy jednej ofercie, wygasa po jej rozstrzygnięciu lub po 6 M, nie stosuje się ponownie do wyniku już ocenionego. Twarde warunki kryzysu, liczby mandatów i czerwone linie pozostają. Wyszarzona niemożliwa szeroka koalicja nie staje się możliwa samym użyciem doradcy.

**K — etap 5 (0.46):** efekty czasowe są w `S.advisors.effects` (`action_id`, `kind`, `starts_at`, `expires_at`, `value`), aktywne dla t ≤ czas < t+6; kilka efektów tego samego rodzaju się nie mnoży, liczy się najsilniejszy. Mnożnik Pużaka działa w komórkach robotniczych, Perla w kampaniach prasowych; oba mogą mnożyć tę samą kampanię. Ochrona Czapińskiego zatrzymuje przy PPS połowę odpływu rozczarowanych do KPP w komórkach robotniczych; nie dotyczy przepływu 5.6 z innych partii. Impuls poparcia akcji to `min(pula, k·(1 − Q.dissent)·(1 − udział/100))` w każdej objętej komórce.

#### 10.4.5. Piłsudski, późniejsze nazwy i wspólna akcja

Nazwy „Sanacja” i „SL” są zależne od rzeczywistego stanu kontynuacji. Przed przewrotem używamy relacji z obozem Piłsudskiego (`S.actors.pilsudski`), nie wymyślonej dodatkowej partii Sanacja. Gdy legalny gabinet przed zamachem rzeczywiście ma profil `pilsudski_aligned`, Ziemięcki może bronić jego tolerowania. Zwycięstwo Piłsudskiego kończy obecny rozdział; akcje nie odblokowują po raporcie kolejnych miesięcy rządów Sanacji. SL nie jest dodawane do pierwszego rozdziału, a Zaremba używa na razie Wyzwolenia. Próchnik i Drobner zachowują późne wejście w I 1928; nie przesuwamy ich do 1922. Historyczne przypisania profili wymagają badań.

**Drobner i realne próby:** Negotiate poprawia kanał i relacje, nie `successful_joint_actions`. Joint Workers’ Action wymaga konkretnej sprawy i wspólnych warunków; może skierować do istniejącego strajku lub jednego przygotowanego wydarzenia demonstracji/ochrony przed wskazaną przemocą. Współpraca w strajku nadal ma pełny/lekki/brak wariant z 9.6. Po odmowie nie naliczamy +8 za niewykonaną pełną współpracę; lekka koordynacja zachowuje +2, pełna przez tę akcję daje raz +8 zamiast +5. Koszt funduszu i ochrony płacimy normalnie.

Rekord prób uogólniamy do `TrialRecord{id,action_id,kind,strike_id?,mode,terms,partner_response,ended_as_agreed,result}`; `kind=strike|demonstration|protective_action`. Istniejący strajk zachowuje jedno ID jako `action_id`, więc wspólna ochrona i koniec tej samej akcji nie tworzą trzech sukcesów. Demonstracja wymaga uzgodnionego celu, rzeczywiście opłaconej organizacji i udziału; akcja ochronna dodatkowo rzeczywistego zagrożenia i dostępnych ludzi. Używa zwykłych kosztów kampanii/ochrony 5.3 i 17.5 oraz zapisanej odpowiedzi partnera z 9.6; nie dodaje funduszu strajkowego bez strajku. Sukces wymaga rzeczywistego wykonania i zgodnego końca, nie samej rozmowy. Dwie różne udane akcje, w tym jedna pełna, mogą przygotować szerszy układ; relacje, akceptacja PPS, legalne reguły i głosy parlamentarne nadal obowiązują. Inicjatywa doradcy nie monopolizuje istniejących wydarzeń współpracy.

Źródło decyzji i audytu: `PL-ADVISORS-REVIEW-2026-09-10` w [HISTORICAL_SOURCES.md](../HISTORICAL_SOURCES.md). Zachowujemy dotychczasowe wyjścia z puli i manifesty rozłamów; usunięcie osoby z powodu rozłamu nie nalicza drugi raz kosztu dobrowolnego odwołania. Wszystkie profile są dokumentacją przyszłego zachowania, nie nowym wykonaniem kodu.

### 10.5. Karty strategiczne PPS — stan, wybory i czas

**Z — rewizja użytkownika z 10 września:** poniższy katalog zastępuje zbiorczą kartę `party.program_declaration`. Karta ustrojowa ma trzy opcje, program gospodarczy limit trzech priorytetów, a organizacje limit dwóch inwestycji. Nie ma osobnej karty religii ani stałej karty wyboru strategii strajkowej. Wzory, odnowienia i reakcje liczbowe pozostają **P**.

Deklaracja zapisuje stanowisko w `S.actors.pps.strategy`, odczytywane przez kampanie, profile ofert, frakcje i wydarzenia. Nie ustawia flag wykonanej reformy, nowych kompetencji ani poparcia całego społeczeństwa. Zamiast osobnego równoległego programu `S.actors.pps.program` staje się jego odczytywaną projekcją dla istniejących konsumentów; `issue_ideals` jest wyliczany z aktualnych stanowisk oraz treści konkretnej oferty. Nie kopiujemy dwóch niezależnie zmienianych wersji.

| Karta / ID | Warianty zatwierdzone; identyfikatory P | Co odczytuje wybór |
|---|---|---|
| Kierunek polityczny / `party.direction` | Socjalizm parlamentarny `parliamentary_socialism`; samodzielna polityka klasowa `class_independence`; obrona zdobyczy robotniczych `workers_gains`; szeroki ruch demokratyczny `democratic_movement` | Premia kampanii zgodnych z kierunkiem (`strategyFactor`, 10.6) i nastawienie organizacji przez takie kampanie (10.3: kampania danej linii +8). Oferty partnerzy oceniają po ich treści (8.1), nie po samej deklaracji (Z — 0.33) |
| Główny przeciwnik / `party.main_opponent` | Prawica narodowa `nationalist_right`; komuniści `communists`; obrońcy kapitału i ziemiaństwa `capital_land`; przemoc przeciw konstytucji niezależnie od strony `unconstitutional_force` | Cel następnych kampanii polemicznych; **bez opcji „obecny gabinet”** |
| Stosunki z partiami / `party.outreach` | Zbliżenie do Wyzwolenia, Piasta, NPR, PSChD albo dopuszczonego partnera z aktualnego składu | Relacja +4, od poziomu 70 tylko +2; odnowienie 3 M na partnera; formalna oferta pozostaje parlamentarna. Dopóki kanał z KPP jest zamknięty, karta ma opcję „Otworzyć kontakt z KPP” (`kpp.contact`, 9.5; Z — 0.35) |
| Wpływ Piłsudskiego / `party.pils_influence` | Popierać wpływ `support`; popierać warunkowo `conditional`; sprzeciwiać się ingerencji wojska `oppose_military_interference` | Dostęp i warunki ofert 16.7, relacja i sprzeciw frakcyjny; nie steruje oddziałami |
| Program gospodarczy / `party.economic_program` | Do trzech z pięciu priorytetów wymienionych poniżej | Przygotowanie i ocena projektów oraz obietnice, bez natychmiastowej polityki gospodarczej |
| Jakiej władzy chcemy / `party.form_of_power` | Parlamentaryzm `parliamentarism`; silniejsza prezydentura `strong_presidency`; rady robotnicze `workers_councils` | Ustrój postulowany, odmienne oferty i spory; ustawy i bieżący ustrój osobno |
| Charakter partii / `party.electoral_base` | Partia robotnicza `workers`; robotniczo-chłopska `workers_peasants`; szeroka partia demokratyczna `broad_democratic`; własny profil i docieranie przez sojusze `allied_reach` | Gdzie inwestycja i kampania rozwijają zasięg, oczekiwania partnerów i własnego zaplecza |
| Mniejszości słowiańskie — autonomia / `party.slavic_autonomy` | Federacja `federation`; autonomia wojewódzka `regional_autonomy`; swobody języka, szkół i organizacji bez autonomii `cultural_rights`; polonizacja `polonisation` | Treść żądań ustrojowych i praw mniejszości, ocena ofert; 10.8 |
| Współpraca z organizacjami żydowskimi / `party.jewish_cooperation` | Szeroka współpraca i prawa w programie `broad`; współpraca pracownicza `labour_only`; brak współpracy `none` | Dopuszczalny zakres porozumień, zwłaszcza z Bundem; 10.8 |
| Organizacje PPS / `party.organizations` | Maksymalnie dwie różne organizacje: związki, prasa, TUR, Milicja, spółdzielczość/samopomoc; zamknięcie karty bez wyboru jest bezpłatne (Z — 0.34, bez płatnego „zachować środki”) | Zbiorcza transakcja konkretnych inwestycji z 13.5 |
| Milicja PPS / `party.militia` | Rekrutacja; militaryzacja; warunkowo przekształcenie w AS | Ludzie, sprawność, etap; brak osobnej akcji dowodzenia, 13.3 |
| Media i kampania / `party.media` | Rozszerzyć dystrybucję; prasa programowa lub popularna; kampania na wybrany temat do wskazanego elektoratu | Konkretne działania 5.3 i 13.2; jeden wariant, nie wszystkie naraz. Z — 0.34: karta obejmuje też kampanię mobilizacyjną (`party.turnout`) i śledztwo prasowe (`party.press_investigation`, tylko przy istniejącej sprawie i dowodach); nie ma własnego odnowienia, obowiązują odnowienia wariantów |
| PPS wobec modelu sowieckiego / `party.ussr_position` | Solidaryzować się; zachować niezależność; potępić autorytaryzm | Stała linia partyjna, relacje i dissent, 10.10; bez dyplomacji |
| Składki / `party.dues` | Podwyższyć albo obniżyć; obecny poziom jest widoczny jako obecny, a zamknięcie karty bez zmiany jest bezpłatne (Z — 0.34) | Poziom składek i koszt członkostwa, 13.1 |
| Jedność i kierownictwo / `party.unity` | Kompromis w dwóch wariantach, przekonanie do odroczenia albo usunięcie części wskazanej frakcji. Z — 0.35: bez zwykłego „utrzymania linii” i bez zmiany doradców, która jest osobną kartą | Spór albo kosztowne odejścia z 10.9. Z — 0.35: karta jest w puli tylko przy sprzeciwie którejś frakcji ≥30 albo przy otwartym kanale z KPP. Kompromis: ustępstwo dla jednej frakcji (1 T, 1 R, cd 3 M; jej sprzeciw −8) albo uzgodnienie linii współpracy z komunistami (1 T, 0 R, cd 6 M; +15 poparcia układu w każdej frakcji, 9.5, M13). Przekonanie do odroczenia: 1 T, 0 R, raz na sprawę, przy konkretnym żądaniu i sprzeciwie ≥45; przez 3 M ta sprawa nie wywołuje E3 (10.2) |
| Zmiana doradców / `party.advisors` | Końcowa obsada trzech miejsc (Z — 0.35: osobna karta) | 1 T, cd 6 M; skutki powołań i odwołań z 10.4.2 |

Osobne karty wydarzeń to **krytyka parlamentu przez Piłsudskiego** (10.7), **strategia protestów/Krakowa** (17.5), **współpraca z komunistami podczas strajku** (9.6; odrębna decyzja o partnerze). Stanowisko wobec modelu sowieckiego należy do zwykłej puli partii (10.10). Pozostałe wymienione wydarzenia wchodzą z konkretnej sprawy, zamiast zwiększać zwykłą talię o stale dostępne reakcje na nieistniejące wydarzenie.

Zwykła deklaracja: 1 T, 0 R, odnowienie 6 M na kartę, chyba że wskazano wyjątek — model sowiecki z 10.10 ma 12 M. **Z — 0.32: obecnej linii nie wybiera się ponownie.** Dotyczy ośmiu kart stanowisk: kierunku, głównego przeciwnika, wpływu Piłsudskiego, formy władzy, charakteru partii, obu kart mniejszościowych i modelu sowieckiego. Opcja obecnej linii jest widoczna i zablokowana z powodem „obecna linia” (`disabled_reasons`). Zamknięcie karty nic nie kosztuje: karta zostaje w ręce albo trafia do darmowego odrzucenia z 4.4. Utrzymanie linii nie daje premii ani nie cofa dawnych naruszeń. W otwartym kryzysie, np. E3, utrzymanie linii pozostaje zwykłą odpowiedzią tej sprawy, z jej skutkami. Samo oglądanie i anulowanie są bezpłatne. Otwarte ultimatum lub obowiązkowy kryzys udostępnia odpowiedź także podczas odnowienia, raz dla tej sprawy. Potwierdzenie nowej linii ustawia nowe odnowienie, zamiast dawać darmową późniejszą zmianę.

Zmiana zwiększająca odległość od znanego profilu frakcji daje jej +3 sprzeciwu raz na decyzję, najwyżej +8 przy wieloelementowej zmianie. Profil musi jawnie określać odrzucone warianty; brak danych oznacza neutralny profil testowy, a historycznie **B**. **Z — 0.32, profil testowy `faction_stance_profile_v1`:** Piłsudczycy odrzucają `pils_influence=oppose_military_interference`, a Centrum `pils_influence=support`. Karty `form_of_power` i `ussr_position` mają tylko reakcje szczególne z 10.8 i 10.10. Pozostałe karty stanowisk nie mają w tym profilu odrzucanych wariantów. Profil zbudowano wyłącznie z opisu frakcji w przewodniku (rozdział 5) i reakcji zapisanych już w 10.7. Historyczne stanowiska frakcji: `TBD — historical research required`. Reakcja szczególna w tabeli wydarzenia zastępuje ten sam rodzaj reakcji ogólnej. Podpisana czerwona linia uruchamia jedną sprawę naruszenia umowy. Odrębne skutki — relacja, sprzeciw, utrata głosów — mają nazwane przyczyny, a nie powieloną karę za każdą podscenę.

**K — etap 8 (0.49):** badania 8f (`PL-PPS-CURRENTS-1922-1926`) dają mocne oparcie regule piłsudczyków i częściowe regule Centrum; stanowiska Lewicy przed 1926 r. pozostają `TBD — historical research required`. Profil `faction_stance_profile_v1` bez zmian.

Początek P: `direction=parliamentary_socialism`, `main_opponent=nationalist_right`, `pils_influence=conditional`, `form_of_power=parliamentarism`, `electoral_base=workers`, `economic_priorities=[]`, `slavic_autonomy=cultural_rights`, `jewish_cooperation=labour_only`, `ussr_stance=uncommitted`. To syntetyczne ustawienia do gry, nie pełna rekonstrukcja programu PPS ze stycznia 1922.

**K — etap 8 (0.49):** linia startowa `slavic_autonomy=regional_autonomy`, jak projekt autonomii Niedziałkowskiego z X 1921 (`PL-MINORITY-AUTONOMY-1922-1926`); pozostałe linie startowe bez zmian.

**Program gospodarczy — do trzech aktywnych priorytetów.** `economic_priorities` jest zbiorem, nie licznikiem ani jedną niemiecką wartością `economic_plan`:

| Priorytet | Otwierane przygotowanie i polityczny sens |
|---|---|
| `stabilisation_with_protection` — stabilizacja z osłonami | Wariant tolerowania Grabskiego i osłony płac/bezrobocia; PPS ocenia, kto ponosi koszt stabilizacji |
| `public_works` — roboty publiczne i zatrudnienie | Projekt pracy i inwestycji; wymaga później finansowania oraz wykonawcy |
| `wealth_and_investment` — podatki majątkowe i kapitał na inwestycje | Wybór instrumentu z 11.9; deklaracja sama nie dodaje B |
| `socialisation` — uspołecznienie wybranych przedsiębiorstw | Przygotowanie zakresu przejęć, rekompensat i zarządzania; konkretna oferta określa poziom radykalizmu |
| `agrarian_labour` — program agrarno-robotniczy | Wariant parcelacji, modernizacji lub ochrony pracy rolnej z 12.6 |

Gracz ustala cały zestaw 0–3 w jednej transakcji za 1 T, 0 R, cd 6 M; 0 oznacza świadome wycofanie priorytetów, nie otrzymanie nagrody. **Z — 0.35:** zatwierdzić można tylko zestaw różny od obecnego; zamknięcie karty bez zmiany jest bezpłatne. Zaznaczenie nie wydaje czasu ani zasobów przed zatwierdzeniem. Czwarty element jest niedopuszczalny. Ponowne wybranie istniejącego elementu nie daje postępu projektu. Przyjęte priorytety trafiają do agendy jako dostępne przygotowanie, każdy z własnymi kosztami 12.2. Wycofanie priorytetu nie kasuje ukończonej ustawy, wydatku lub podpisanej obietnicy.

Można łączyć stabilizację i roboty publiczne; ich zgodność zależy od finansowania i zakresu. Uspołecznienie bez odszkodowania może naruszać warunki partnera tolerującego interwencję inwestycyjną. Oferta musi określić te szczegóły, zamiast karać za samo posiadanie trzech haseł. Doraźne osłony i wymagane odpowiedzi pozostają dostępne także poza listą priorytetów; kosztowny własny program rozpoczyna się przez odpowiedni priorytet albo przez przyjęty kontrakt gabinetowy.

**K — etap 5 (0.46):** osiem kart stanowisk (`polish_party_direction`, `polish_party_main_opponent`, `polish_party_pils_influence`, `polish_party_form_of_power`, `polish_party_electoral_base`, `polish_party_slavic_autonomy`, `polish_party_jewish_cooperation`, `polish_party_ussr_position`) zapisuje linię w `S.actors.pps.strategy` za 1 T, z odnowieniem 6 M (karta ZSRR 12 M). Obecna linia jest zablokowana z powodem, a zamknięcie karty nic nie kosztuje. Program gospodarczy (`polish_party_economic_program`) ma do trzech priorytetów; ten sam zestaw jest zablokowany. Reakcje frakcji pochodzą z profilu `faction_stance_profile_v1` (P) i zapisują przyczynę do cofnięcia. Talia partyjna ma 16 kart manifestu; odziedziczone karty partyjne są zablokowane warunkiem `not polish_party_rules` i zostają w plikach, a „International Relations” i „Political Rally” nie mają następcy.

### 10.6. Kierunek i elektorat reagują na sytuację polityczną

Kierunek określa preferowaną metodę budowania wpływu; charakter partii określa odbiorców. Nie są to wykluczające się tryby kampanii. Partia robotnicza może bronić parlamentu, a szeroka partia demokratyczna nadal prowadzić politykę socjalną.

P — w kampanii z 5.3 stosujemy jeden `strategyFactor`, domyślnie 1. Własny dominujący temat (parlamentarny, klasowy, obrona zdobyczy) daje 1,10 tylko w odpowiadającej mu kampanii i przy istniejącym adresacie/żądaniu. Obrona konkretnej zagrożonej zdobyczy daje 1,15 zamiast 1,10, gdy w agendzie jest jej ograniczenie. Samodzielność klasowa nie zakazuje sojuszy, lecz zobowiązuje do zachowania samodzielnego programu; wspólna lista sprzeczna z publiczną obietnicą wymaga renegocjacji.

`democraticThreat` jest warunkiem pochodnym: `coup.pressure>=40` albo aktywna sprawa bezprawnego naruszenia instytucji lub przemocy antykonstytucyjnej. Nie czeka na datę maja 1926 i nie wymaga istnienia Sanacji. Dla kierunku `democratic_movement` kampania demokratyczna ma `strategyFactor=1.00` bez zagrożenia i `1.15` w jego obecności. Wcześniej praca polityczna buduje relacje i uzgodnienie linii organizacji, zamiast co miesiąc automatycznie dodawać demokrację.

`S.actors.pps.strategy.democratic_preparation` to lista ID **wykonanych** porozumień obrony legalności, kursów TUR i kampanii z uzgodnioną linią; początkowo pusta. Samo ogłoszenie kierunku nie dodaje wpisu. Zgodne przygotowanie pozostawia wzrost `alignment` z 10.3 w danej organizacji; podczas kryzysu czyta go zwykły wzór posłuchu, bez drugiego bonusu od tej listy. Nagłe wsparcie przewrotu może spotkać się ze sprzeciwem tak przygotowanego zaplecza. Raport zachowuje te rekordy dla przyszłej gry pod Sanacją, jeśli powstanie; bieżący rozdział nie symuluje jej późniejszych rządów.

P — charakter partii nadaje +0,10 do mnożnika **rozbudowy zasięgu** w docelowym środowisku: robotnicy; robotnicy i chłopi; albo inteligencja i drobnomieszczaństwo przy poszerzeniu demokratycznym. Wariant sojuszniczy udostępnia wykorzystanie zasięgu partnera dopiero po jego zgodzie; nie sumuje tych samych odbiorców. Modyfikator nie wpływa na pieniądze, kadrę TUR, członków Milicji ani głosy przy samym wyborze karty. Wraz z TUR łączny mnożnik rozbudowy jest ograniczony testowo do 1,30. Nasycenie kampanii nadal obowiązuje. **Z — 0.33, zakres:** rozbudową zasięgu jest każde podniesienie zasięgu branży związkowej albo `base_reach_pps` komórek docelowego środowiska: rozbudowa branży (14.1), praca organizacyjna (4.4) oraz akcje Pużaka, Arciszewskiego i Ziemięckiego (10.4.3). Zasięg prasy się nie liczy. Środowiska: `workers` — trzy branże i komórki robotników, w tym robotników rolnych (5.1); `workers_peasants` — do tego komórki chłopów; `broad_democratic` — komórki inteligencji i drobnomieszczaństwa; `allied_reach` nie ma mnożnika.

Główny przeciwnik wskazuje cel polemiki. P — kampania przeciw wskazanemu przeciwnikowi przenosi do PPS głosy według 5.3 przede wszystkim z jego rzeczywistej puli w docelowej komórce, z limitem jej wielkości; nie tworzy głosów kosztem nieobecnej partii. Grupa obrońców kapitału/ziemiaństwa oraz aktorzy przemocy są wskazywani przez bieżące stanowiska i udokumentowane w grze działania, nie przez stałą etykietę każdej partii. **Z — 0.33, adresaci:** `nationalist_right` to ZLN (przypisanie gry P; PSChD nie należy do tej puli, choć w grze tworzy z ZLN listę `chzjn`). `communists` to KPP. `capital_land` to partie, które w aktualnym profilu 8.6 mają ideał `fiscal` ≤ −1 i `land` ≤ −1 (test: PSChD i ZLN). `unconstitutional_force` to partia, której przypisano otwartą sprawę przemocy antykonstytucyjnej w dzienniku 15.2, np. potwierdzonym śledztwem MSW (17.12, Z — 0.37). Gdy nikt nie spełnia opisu, linię można przyjąć, ale kampania polemiczna jest zablokowana z powodem „brak adresata”. Po publicznej kampanii zaatakowany adresat traci 2 relacji z PPS raz na akcję. Samo ustawienie przeciwnika nie obala gabinetu ani nie zrywa umowy.

**K — etap 5 (0.46):** `strategyFactor`: kierunek parlamentarny ×1,10 dla tematu parlamentarnego tylko przy ustawie PPS w procedurze; kierunek klasowy ×1,10 zawsze; obrona zdobyczy ×1,10 przy działającej osłonie lub inspekcji, a ×1,15, gdy gabinet proponuje cięcie świadczeń albo trwa przegląd oszczędności; ruch demokratyczny ×1,15 tylko przy zagrożeniu (`S.coup.pressure` ≥ 40, przed etapem 7 nie występuje). Elektorat partii daje ×1,10 rozbudowy w swoim środowisku; razem z kadrą TUR najwyżej ×1,30. Adresaci polemiki wynikają z linii przeciwnika: ZLN, KPP albo partie o ideałach fiskalnym i ziemskim ≤ −1; „przemoc antykonstytucyjna” czeka na dziennik etapu 7.

### 10.7. Dwie różne karty Piłsudskiego

`party.pils_influence` określa trwałą linię. P — zmiana na poparcie daje relację +4, na sprzeciw −4, warunkowo 0; odnowienie 6 M oraz zwykłe reakcje frakcji. Przy ponownym powrocie do tej samej linii w ciągu 12 M nie naliczamy kolejnego dodatniego efektu relacji. **Z — 0.33: linia nie jest warunkiem karty 16.7, tylko ją ogranicza.** Przy poparciu dostępne są wszystkie ustępstwa 16.7, nadal przy ich relacji i zgodach. Warunkowe poparcie wymaga gwarancji kontroli cywilnej albo odpowiedzialności przed Sejmem: funkcja wojskowa pod cywilną kontrolą i premierostwo legalnego gabinetu spełniają ją z definicji, a samodzielny inspektorat wymaga zapisu o odpowiedzialności przed Sejmem, który Piłsudski ocenia zwykłą regułą 8.3. Sprzeciw blokuje inicjowanie ustępstw nadających autonomiczną władzę wojskową, czyli samodzielnego inspektoratu, do jawnej zmiany linii. Nie blokuje rozmów pokojowych ani poparcia legalnego premiera pod kontrolą Sejmu.

`politics.pils_parliament_criticism` jest odpowiedzią na konkretne wystąpienie: profil musi wskazać temat, instytucję i polityczny spór. Może pojawić się w kryzysie 1922 lub później; treść przypisana historycznej osobie wymaga źródła, a scena syntetyczna ma oznaczenie P. Jeden wybór 0 T na ID wystąpienia:

| Odpowiedź | Efekty P po opublikowaniu stanowiska |
|---|---|
| Poprzeć krytykę parlamentaryzmu | Relacja Piłsudski +4; Piłsudczycy sprzeciw −3; Centrum +5; wpis `stance_criticism` w dzienniku 15.2 (autorytet −2 przez 12 M) |
| Bronić parlamentu i legalnej zmiany rządu | Relacja −4; Piłsudczycy +5; Centrum −3; wpis `stance_defense` w dzienniku 15.2 (autorytet +1 przez 12 M); umożliwia kampanię obrony instytucji |
| Parlament należy reformować, aby działał skuteczniej | Bez zmiany relacji; Centrum dissent −2 za poparcie legalnej poprawy skuteczności. Wspiera linię reform, ale nie tworzy projektu, nie odblokowuje ścieżki, nie dodaje postępu ustawy ani głosów partnerów |

Karta zapisuje `response` w wydarzeniu; nie nadpisuje `pils_influence` ani `form_of_power`. Gdy odpowiedź przeczy trwałej linii, pojawia się ostrzeżenie przed zatwierdzeniem i jeden spór o wiarygodność w zainteresowanej frakcji (+3 zamiast drugiej kary tego samego rodzaju). Kampania kontynuująca odpowiedź płaci normalne 1 T/1 R i czyta zasięg mediów.

**Z — 0.38:** odpowiedź jest obowiązkowa. Wydarzenie rozstrzyga się w miesiącu wystąpienia, przed następną zwykłą akcją (4.2, krok 9); nie ma opcji „milczeć”. Trwałej linii przeczy tylko odpowiedź „Poprzeć krytykę parlamentaryzmu” przy `form_of_power=parliamentarism`. Zainteresowaną frakcją jest wtedy Centrum: +3, razem z samą odpowiedzią +8. Inne połączenia nie są sprzeczne, np. `pils_influence=support` z obroną parlamentu albo `workers_councils` z poparciem krytyki (przewodnik, „Dwa różne wybory dotyczące Piłsudskiego”). Obrona parlamentu i propozycja reformy nigdy nie dają tego sporu.

**Z — 0.22 (M10):** skutek dla autorytetu to jeden wpis dziennika instytucjonalnego na ID wystąpienia, nie bezpośrednia zmiana `parliament_authority`. Wczytanie i ponowne otwarcie wydarzenia nie dodają drugiego wpisu.

**K — etap 5 (0.46):** zmiana wpływu Piłsudskiego z warunkowego na poparcie daje Centrum +3 sprzeciwu i relację z Piłsudskim +4 (ponowne poparcie w ciągu 12 M nie daje drugiego +4), a na sprzeciw wobec ingerencji wojska Piłsudczykom +3 sprzeciwu i relację −4. Relacja jest w `S.actors.relations.pilsudski`.

**K — etap 7 (0.48):** karta B2 `polish_event_pils_criticism` pojawia się raz na zapisane wystąpienie (spór VI 1922 i sprawa wojskowa od I 1925), w kolejce kategorii 6, przed następną zwykłą akcją, z trzema odpowiedziami za 0 T. Odpowiedź zapisuje `stance_criticism` albo `stance_defense` w dzienniku 15.2, zmienia relację i frakcje; przy linii parlamentaryzmu poparcie krytyki ma ostrzeżenie i Centrum dodatkowo +3. Treść wystąpienia jest syntetyczna.

### 10.8. Ustrój i dwie karty mniejszościowe

**Jakiej władzy chcemy:** parlamentaryzm zachowuje drogę większości, odpowiedzialności gabinetu i demokratyzacji; silniejsza prezydentura otwiera przygotowanie arbitrażu prezydenta (Z — 0.33: tylko przy tej linii PPS może przygotować `presidential_arbitration`, a późniejsza zmiana linii nie kasuje przygotowanego projektu); rady robotnicze stawiają reprezentację pracowniczą i zmianę źródła władzy w centrum programu. Ostatni wariant jest alternatywą ustrojową, nie natychmiastowym utworzeniem rządu rad ani automatyczną zgodą na przemoc lub ZSRR.

Trzy projekty z 7.6 — demokratyzacja, stabilizacja gabinetów i wzmocnienie prezydenta — pozostają konkretnymi narzędziami parlamentarnymi. **Z — zakres pierwszego rozdziału:** rady jako ustrój są stanowiskiem programowym z bieżącymi skutkami, a wykonanie pełnej zmiany państwa należy do kontynuacji. Nie tworzymy projektu bez możliwego finału ani ukrytego zakończenia. Praktycznym działaniem tej linii jest m.in. reprezentacja w przedsiębiorstwach z 17.12.5; nie wymaga ona przyjęcia ustroju rad. Legalna reforma prezydentury nie jest tym samym co wojskowa ingerencja Piłsudskiego.

P — pierwsze przyjęcie `workers_councils` w rozdziale daje Lewicy +4 surowej siły, po czym raz normalizujemy frakcje; Centrum +3 dissentu zastępuje ogólną reakcję tego samego rodzaju z 10.5. Powrót do tej linii nie daje ponownie siły; rzeczywiste zmiany sprzeczne z profilem lub umową nadal wywołują zwykły sprzeciw. Program wpływa na kampanie 5.3 i zgodność ofert 8.3. Nie daje głosów KPP, reprezentacji pracowniczej ani poparcia wyborców za samą deklarację.

Współrzędna metody ustrojowej P dla `programFit`: parlamentaryzm +2, silniejsza prezydentura 0, rady −2. Jest to umowna odległość negocjacyjna, nie ranking demokracji. Aktor może równocześnie zaakceptować parlamentarną procedurę konkretnej umowy i postulować inny ustrój docelowy.

**Mniejszości słowiańskie — autonomia:** cztery warianty pochodzą z notatek użytkownika. Federacja oznacza postulowaną krajową przebudowę ustrojową z członami ukraińskim i białoruskim; autonomia wojewódzka pozostawia państwo jednolite z przekazanymi kompetencjami; swobody obejmują język, szkolnictwo i organizacje bez autonomii politycznej; polonizacja odrzuca odrębną autonomię i instytucje narodowe. **Z — pierwszy rozdział:** wykonalna jest ograniczona autonomia administracyjno-kulturalna z 17.12.6. Pełna autonomia polityczna z regionalnym parlamentem oraz federalizacja pozostają celami na kontynuację, bez przycisku wdrożenia i bez rozpoczętego fikcyjnego projektu konstytucyjnego. Karta nie prowadzi negocjacji zagranicznych ani nie zmienia granic państwa.

Federacja i autonomia nadal różnią się pozycją programową w ocenie ofert. Obie pozwalają proponować zgodne kroki pośrednie: prawa językowe, szkoły i ograniczone przekazanie kompetencji. Umowa o takim kroku wymienia tylko zakres wykonywany w tym rozdziale; nie obiecuje automatycznie pełnej federacji. Reakcje partnerów wynikają ze zgodności tej konkretnej oferty i ich czerwonych linii. Raport rozdziału przenosi `form_of_power` i `slavic_autonomy` jako program, oddzielnie od wykonanych reform.

Zapisujemy `slavic_autonomy`; do oceny oferty rzutujemy odpowiednio na 2, 1, 0, −2 osi praw i autonomii. Ideały testowe aktorów na tej osi podaje 8.6 (temat `autonomy`, Z — 0.33). Nie dokładamy trzeciej kategorii mniejszości: `other_minorities` pozostaje jednym agregatem. Temat słowiański nie oznacza, że każdy wyborca tego agregatu jest Ukraińcem lub Białorusinem. Ekspozycja na konkretną ustawę należy do profilu jej odbiorców; brak udokumentowanego rozkładu pozostaje B, test używa jawnego udziału syntetycznego. Żadna deklaracja nie daje od razu poparcia całego agregatu.

**Współpraca żydowska:** szeroki wariant (+2 osi) dopuszcza porozumienie o prawach i wspólne działania; pracowniczy (0) dopuszcza porozumienia pracy, zwłaszcza z Bundem; brak współpracy (−2) blokuje inicjowanie nowych wspólnych działań. Istniejące obietnice trzeba wykonać, renegocjować albo wypowiedzieć. Bund nie dysponuje automatycznie wszystkimi mandatami żydowskimi. Odmowa sojuszu nie cofa już obowiązujących praw obywateli.

Reakcje, kampanie i późniejsze złamanie obietnicy stosują 10.5, 5.3–5.5 oraz 9.2. Usuwamy osobną kartę religii z pierwszego rozdziału. Kwestie szkoły, konkordatu, praw obywatelskich i nabożeństw pozostają w swoich ministerstwach, wydarzeniach i umowach; to nie przywraca pominiętej karty.

**K — etap 5 (0.46):** karta ustroju ma trzy opcje: parlamentaryzm, silniejszą prezydenturę i rady robotnicze (za pierwszym razem Lewica +4 surowej siły, Centrum +3 sprzeciwu); żadna nie wprowadza reformy ani nie zmienia urzędów. Autonomia słowiańska ma cztery stanowiska na osi −2…+2, a współpraca żydowska osobną kartę. Nie tworzą nowej populacji ani praw; cele ustrojowe raport zapisuje jako program.

### 10.9. Usunięcie członków frakcji

**Z — wybór w karcie jedności:** partyjna czystka oznacza wykluczenie organizacyjne, nie przemoc fizyczną. Gracz wskazuje frakcję i widzi przed decyzją ubytek wpływu, poparcia, członków oraz ewentualnych posłów i doradców. To odrębny wariant od rozłamu z karty E3 (10.2).

P — `party.faction_expulsion`: 1 T, 1 R; wspólne odnowienie 12 M; frakcja ma dodatnią siłę i `dissent>=max(30,100*Q.dissent)`. Próg kieruje akcję przeciw środowisku faktycznie generującemu konflikt; nie daje opłacalnego przycisku usuwania dowolnych lojalnych członków. Manifest odejścia obejmuje 25% zaplecza wskazanej frakcji, a nie 25% całej PPS:

```js
removedShare = 0.25 * oldFactionStrength / 100;
factionStrengthRaw = oldFactionStrength * 0.75;
// Pozostałe siły bez zmiany, następnie jedna normalizacja do 100.
remainingFactionDissent = max(0, oldFactionDissent - 15);
apparatus.member_index *= 1 - removedShare;
// W każdej komórce elektoratu: ubytek dotychczasowej preferencji PPS.
lostPpsPP = oldPpsPreference * removedShare;
```

Ubytek preferencji przechodzi do wskazanego w manifeście rywala lub grupy `other`; suma każdej komórki nadal 100. To propozycja proporcjonalnego kosztu wyborczego, nie założenie, że każdy wydalony członek ma ten sam elektorat. Sprzeciw i siła przeliczają spójność **po** odejściu. Nie dodajemy drugiej globalnej ulgi w `Q.dissent`.

Przykład P: frakcja siły 20 traci 5 punktów przed normalizacją i ma potem `15/95*100≈15,79` siły. PPS traci 5% dotychczasowego poparcia: sondaż 10% staje się 9,5%, przy pozostałych danych bez zmian. Dissent tej frakcji spada np. z 60 do 45. Ceną poprawy spójności są mniejsza partia i niższe wpływy składkowe.

Posłowie zachowują mandaty: zamrożony przydział frakcyjny z 10.2 (M16) wskazuje, ilu przechodzi do odrębnego klubu lub niezrzeszonych; P — 25% jej posłów zaokrąglone raz do najbliższej liczby całkowitej. Roster doradców wskazuje konkretnych wydalonych; pozostali nie znikają tylko za przynależność frakcyjną. Usunięcie aktywnego doradcy nie nalicza dodatkowo zwykłej kary odwołania, bo zastępuje ją wynik czystki. Ubytek Milicji lub komórek związkowych wymaga ich wskazania w tym samym manifeście; nie wyliczamy dodatkowo 5% strat każdej organizacji. Pieniądze niezależnych związków nie są konfiskowane.

`S.faction_cases` zapisuje `resolution=expulsion`, `departure_manifest_id` i pozostałe żądania. Rozłam i czystka nie mogą drugi raz usunąć tej samej osoby. Odejście posłów może odebrać większość własnej koalicji. Zmniejszony dissent nie kasuje podpisanych zobowiązań, stanu gospodarki ani politycznych konsekwencji utraty ludzi.

**K — etap 5 (0.46):** karta Jedność (`polish_party_unity`, 6.3–6.4 katalogu) jest w puli, gdy któraś frakcja ma sprzeciw co najmniej 30 albo kanał z KPP jest otwarty. Ma cztery opcje. Ustępstwo: −8 sprzeciwu, 1 T, 1 R, cd 3 M dla tej frakcji. Linia współpracy z KPP: +15 akceptacji, 1 T, cd 6 M. Odroczenie sprawy: od sprzeciwu 45, na 3 M, raz na sprawę, bez zmiany sprzeciwu. Czystka (`party.faction_expulsion`): 1 T, 1 R, wspólne cd 12 M, bramka `max(30, sprzeciw partii)`; odchodzi 25% zaplecza, a sprzeciw spada o 15. Czystka używa rachunku z 10.2 na stanie po wcześniejszych odejściach, więc nikt nie odchodzi dwa razy.

### 10.10. Karta partii: PPS wobec modelu sowieckiego

**Z — karta zwykłej puli partii, nie wydarzenie B13.** `party.ussr_position` określa krajową linię PPS wobec sowieckiego modelu władzy. P — dostęp od początku rozdziału, 1 T, 0 R, odnowienie 12 M; zapisuje `ussr_stance`. Nie wymaga oferty komunistów ani nowego doniesienia. Obecnego stanowiska nie wybiera się ponownie (10.5, Z — 0.32); zmiana stosuje reakcję raz. Historyczne cytaty wymagają źródła, ale wybór programu nie wymaga zmyślonego wystąpienia. Trzy warianty pozostają:

| Wariant | Natychmiastowy skutek P | Dalszy sens |
|---|---|---|
| Solidaryzować się z państwem sowieckim jako próbą budowy socjalizmu / `sympathetic` | Relacja KPRP/KPP +5; Centrum sprzeciw +5 | Łatwiejsze rozmowy z komunistami, trudniejsza wiarygodność w demokratycznym porozumieniu, jeśli oferta wymaga potępienia autorytaryzmu |
| Zachować niezależność: współpraca robotnicza bez przyjęcia modelu sowieckiego / `independent` | Bez automatycznej zmiany relacji i dissentu | Możliwa ograniczona współpraca na konkretnych warunkach; brak bonusu za poparcie modelu |
| Potępić sowiecki autorytaryzm i podporządkowanie ruchu robotniczego / `critical` | Relacja KPRP/KPP −5. Z — 0.33: bez reakcji frakcji, bo dokumentacja nie wskazuje frakcji popierającej model sowiecki | Większa zgodność oferty obrony pluralizmu; trudniejsza trwała współpraca z komunistami |

Dodatnie premie relacji dla tego samego stanowiska są jednorazowe w rozdziale. Ocena `programFit` odczytuje zgodność warunków danej oferty, nie daje dodatkowych głosów z automatu. Ta karta nie zmienia sama `form_of_power`, nie przyznaje sukcesu wspólnego strajku i nie rozwiązuje kontaktów z KPP. Nie otwiera dyplomacji, pomocy z Moskwy ani osobnej symulacji Międzynarodówki w tym rozdziale.

**K — etap 5 (0.46):** karta `polish_party_ussr_position`: solidarność bez wspólnych prób daje raz +5 relacji z KPP i +5 sprzeciwu Centrum, potępienie −5 relacji bez reakcji frakcji; 1 T, cd 12 M. Nie tworzy sojuszu, wydatków ani nowego systemu.

## 11. Gospodarka i finanse: pełny kontrakt miesięczny

### 11.0. Ocena złożoności względem oryginału

**Z — 14 IX 2026: obowiązuje prostszy model.** Zachowujemy siedem wskaźników, jeden abstrakcyjny budżet, zwykle jedną decyzję dla małej reformy lub przygotowanie i wdrożenie dla dużej oraz jeden proces reakcji kapitału. Usuwamy państwową księgę gotówki, długu i zaległości, rezerwacje, ręczny przydział kadry i trzy sektorowe symulacje przedsiębiorców. Nie usuwamy kosztów partyjnych R, funduszy związków ani utrzymania organizacji.

Niemiecki rdzeń to bezrobocie, inflacja, wzrost i abstrakcyjny `budget`, z pomocniczymi licznikami polityk; źródła: `source/scenes/post_event.scene.dry`, `source/scenes/government_affairs/economic_policy.scene.dry`, `source/scenes/government_affairs/fiscal_policy.scene.dry`. Polski model zachowuje dodatkowo płace realne, kredyt i presję agrarną, a wzrost jest zmianą produkcji, nie ósmym wskaźnikiem. Rozdziały 11–12 poniżej zastępują wcześniejszą propozycję księgową; nie są opisem już wdrożonego kodu.

**P — `economy_simple_v1`:** liczby, równania i profile kosztów są roboczym balansem zatwierdzonej struktury, nie historycznymi statystykami. Dotychczasowych 100 B dochodu i cen startowych nie przeliczamy automatycznie na nowe punkty budżetu.

### 11.1. Stany wejściowe

E oznacza `S.economy`. Siedem wskazań głównych: inflacja, płace realne, budżet, produkcja, kredyt, bezrobocie i presja agrarna.

| Pole | Jednostka / początek P | Zapis i odczyt |
|---|---|---|
| `E.currency_regime` | `marka`, następnie `stabilizing` lub `zloty` | Wykonana reforma / dozwolone finansowanie i warunkowe impulsy monetarne |
| `E.inflation_m` | % miesięcznie, 4 | Ceny i finansowanie / płace, kredyt, progi kryzysu |
| `E.real_wage` | Indeks 100 | Jedno równanie siły nabywczej / komórki pracowników i składki |
| `E.output` | Indeks 100 | Koniunktura i polityki / praca i budżet |
| `E.credit` | 0–100, 55 | Polityki i kryzysy / produkcja oraz dostęp do pożyczki |
| `E.market_unemployment` | 3% | Pomocnicze bezrobocie przed publicznym zatrudnieniem |
| `E.unemployment` | 3%, pochodna | Bezrobocie prywatne minus działające miejsca publiczne; początek zachowany K |
| `S.society.agrarian_pressure` | 0–100, 45 | Kredyt, wykonane reformy i impulsy wiejskie / niezadowolenie wsi i ludowcy |
| `E.budget_base` | 2 B | Początkowa przestrzeń po odziedziczonych wydatkach; zmiany tylko przez nazwany efekt scenariusza |
| `E.tax_level`, `E.tax_incidence` | 0 w −3..3; `broad` | Ustawowe zmiany podatków / budżet i rozkład kosztów |
| `E.policies` | [] | Datowane podatki, pożyczka, finansowanie emisyjne, oszczędności; jeden zapis na instrument |
| `E.budget` | Wyliczone, początkowo 2 B | Wskazanie z 11.2, nie kasa ani akumulowany zasób |
| `E.business_pressure` | 0–100, 10 | Zmiany polityki / ostrzeżenie i reakcja kapitału |
| `E.business_state` | `quiet`, potem `warning` lub `active` | Jeden proces; `warning_since=null`, `calm_months=0` na początku |
| `E.shocks` | [] | Wpisy `id,channel,value,starts_at,ends_at,condition,source_status`; datowane impulsy scenariusza |

Pomocnicze `market_unemployment`, stan kapitału i rekordy aktywnych polityk nie są dodatkowymi walutami. Nie ma drugiego źródła płac w nominalnym indeksie: `real_wage` jest autorytatywny. Historia wykresu zapisuje odczyty, nie steruje nimi. `budgetAt(t,S)` jest obliczeniem 11.2; `fiscalDelivery(B)` tabelą 11.3. Szoki cen/produkcji/agrarne sumują wartości aktywnych wpisów danego kanału; dodatni szok kredytu oznacza spadek celu kredytu, dodatni szok produkcji jego wzrost. Brak wpisów daje 0. Wkład porozumień płacowych ma nazwanych odbiorców i jedno ID; agregat `effectiveWageAgreementPP` jest średnią ważoną udziałami pracowników objętych obowiązującymi zmianami, nie pełną podwyżką dla całej ludności. Scenariusz Normalny używa datowanych presji z 17.16.2; zerowe szoki są dozwolone tylko w jawnie izolowanych testach. M02 zachowuje zadanie kalibracji pełnych przebiegów, nie brak tabeli wejść.

**K — etap 4 (0.45):** nowa gra zaczyna od wartości tej tabeli; `S.economy` jest jedynym właścicielem. Pola `Q.budget`, `Q.inflation` (inflacja miesięczna) i `Q.economic_growth` (ostatnia zmiana produkcji) są kopiami zapisywanymi przez `PolishEconomy.writeEconomyMirrors`; `Q.unemployed` pozostaje wagą wiersza bezrobotnych (3). Status i Biblioteka czytają `S.economy`.

### 11.2. Jeden budżet: przestrzeń finansowa

B to **punkt umownej zdolności finansowania polityki**, nie złoty, saldo kasowe ani miesięczna kwota do odjęcia. Podatki, koszty programów i czasowe finansowanie składają się na odczyt od nowa:

```js
cycle = clip((output - 100)/20, -3, 3);
inflationBurden = min(3, floor(max(0, inflation_m)/20));
structuralRoom = budget_base + tax_level + cycle - inflationBurden +
                 sum(activePolicyBudgetModifiers(t)) - sum(projectCharges(t));
emissionUsed = min(authorizedEmissionPoints(t), max(0, -structuralRoom));
budget = structuralRoom + emissionUsed;
```

`activePolicyBudgetModifiers` obejmuje także jawne czasowe finansowanie z pożyczki i późniejszy koszt jej obsługi; nie nazywamy tej sumy rzeczywistym saldem dochodów i wydatków. Emisja nie jest w tej sumie, by nie dodać jej drugi raz. Bieżące koszty projektu zależą od fazy: budowa albo utrzymanie; nigdy oba jednocześnie. Projekt ukończony bez dalszego działania kosztuje 0 od `first_effect_time`; jego ostatni miesiąc wykonania nadal ma koszt budowy. Przy określaniu kosztu pauzy stosujemy zapisaną fazę powrotu. Współczynniki i progi są P.

**Przykład:** baza +2, budowa 2 B przez 3 rozliczenia → budżet 0 przez każde z nich; potem utrzymanie 1 B → +1. Nie powstaje ciąg 0, −2, −4. Niewydana przestrzeń nie kumuluje się jako gotówka; anulowanie budowy usuwa przyszłe obciążenie, nie zwraca fikcyjnej sumy dawnych kosztów.

W miesiącu t budżet wykonawczy liczymy z migawki gospodarki na początku okresu oraz już zatwierdzonych polityk. Po gospodarce zapisujemy go w historii wraz z jego składnikami. Panel następnego miesiąca wylicza nową prognozę z nowego stanu. Nie uruchamiamy obiegu „spadek produkcji → drugi budżet → drugi spadek produkcji” w tym samym miesiącu.

### 11.3. Dostępność, niedobór i prognoza

Przed uruchomieniem dobrowolnego programu pokazujemy budżet z jego kosztem, znany termin wygaśnięcia finansowania i przyszłe utrzymanie. Uruchomienie jest dopuszczalne przy prognozowanym budżecie bieżącym **≥−2 B**. Zmianę finansowania można zawrzeć w tej samej decyzji wdrożeniowej; musi zostać rzeczywiście przyjęta przez uprawnionych aktorów. Próg badamy dla całego przyjętego pakietu, nie każdego projektu osobno na tej samej starej podstawie. Rezygnacja przed zatwierdzeniem niczego nie uruchamia. Nie ma odrębnej karty rezerwacji ani wymogu zamrożenia sześciu miesięcy pieniędzy.

P — istniejące programy publiczne mają jeden wspólny stopień wykonania finansowego:

| Budżet okresu | Wykonanie | Co następuje |
|---|---|---|
| ≥−2 B | Pełne, mnożnik 1 | Zwykły postęp i działanie |
| <−2 do −5 B włącznie | Ograniczone, mnożnik 0,5 | Wolniejszy postęp i połowa bieżących efektów; ostrzeżenie w panelu |
| <−5 B | Wstrzymane, mnożnik 0 | Brak postępu i bieżącej osłony; przyczyna w panelu |

To uproszczenie fiskalnego napięcia, nie automatyczne legalne uchylenie świadczenia. **Nominalny koszt zobowiązania pozostaje w budżecie**, dopóki uprawniony aktor nie zmieni programu. Dzięki temu samo ograniczenie wykonania nie tworzy pozornej oszczędności, która co drugi miesiąc wznawiałaby pełne wypłaty. W modelu nie rośnie osobna suma zaległości; zapisujemy okres niedotrzymania i odbiorców dla umów z 9 oraz społeczeństwa z 15.

Przyjęta ustawa D oraz istniejące obowiązki mogą wejść do stanu mimo przekroczenia progu dobrowolnego uruchomienia; podlegają realnemu ograniczeniu wykonania, bez D3. Nie znika uprawnienie odbiorców. Przerwanie trwające 2 M uruchamia ocenę powiązanej obietnicy według jej terminu. Jeden przypadek naruszenia nie nalicza osobnej kary za każdą techniczną nazwę tego samego braku świadczenia.

Naprawa następuje przez istniejący budżet, zmianę programu lub stosunek do rządu. Powrót wystarczającego finansowania automatycznie przywraca postęp od zachowanego miejsca. Nie ma nowego kryzysowego menu gospodarki. Prognoza jest informacją, nie bramką wymagającą utrzymywania dodatniej wartości przez kolejne 6 M.

**K — etap 4 (0.45):** wykonanie 1/0,5/0 ustala `PolishEconomy.fiscalDelivery`; nowy dobrowolny program rusza tylko przy prognozie ≥−2 B. Obowiązki gabinetu, ustawa D, konieczne pakiety gabinetu i reforma walutowa odpowiadająca na kryzys finansowy (P, test w przeglądarce) mogą ruszyć poniżej progu; ich koszt nadal ogranicza wykonanie.

### 11.4. Ceny, płace i stabilizacja

Wszystkie wartości wejściowe poniżej są z początku miesiąca; aktywne efekty polityk wyznaczamy raz:

```js
monetaryPressure = sum(activeMonetaryShocks(t, currency_regime));
targetInflation = monetaryPressure + 3*emissionUsed + activePriceShock;
inflationNext = clip(0.70*inflation_m + 0.30*targetInflation, -10, 1000);
indexedWage = real_wage * (1 + clip(inflation_m,-10,1000)/100) /
                         (1 + inflationNext/100);
baseWage = min(real_wage, indexedWage);
recovery = inflationNext <= 5 && inflationNext <= inflation_m && credit >= 45
  ? min(3, max(0,100-baseWage)) : 0;
agreementPP = clip(inflation_m+effectiveWageAgreementPP,-10,1000) -
              clip(inflation_m,-10,1000);
realWageNext = baseWage + recovery + real_wage*agreementPP/(100+inflationNext);
```

Przyspieszająca inflacja nadal wyprzedza płace, lecz jej spadek nie zwraca automatycznie całej straty. P — samoczynna odbudowa wynosi najwyżej **3 punkty indeksu/M do 100**, przy powyższych warunkach. Stała inflacja sama nie odejmuje płac w nieskończoność. Rzeczywista podwyżka ma własny zakres i okres; dodajemy tylko jej przyrost ponad bazową indeksację, bez drugiego zastosowania całej nominalnej podwyżki. Limit 100 nie ogranicza wynegocjowanych podwyżek. Osłona bezrobotnych nie podwyższa płac zatrudnionych.

Monetarna presja scenariusza jest wyraźnym wejściem, nie nową walutą ani darmowym wydarzeniem z samej daty. Test szoku 30 pp w reżimie marki pozwala przekroczyć 20% miesięcznie; bez tego szoku nie zakładamy, że historyczna hiperinflacja pojawi się samoczynnie. Wpis ma warunek reżimu, więc skuteczna stabilizacja może zakończyć tę presję; zwykły szok kredytu lub produkcji pozostaje. Osiągnięcie granicy ochronnej równania zapisuje ostrzeżenie kalibracyjne.

Uruchomienie reformy ustawia `stabilizing`; w obliczeniach impulsów marki i uprawnień emisyjnych ten stan zachowuje reguły `marka` aż do ukończenia. Wycofanie reformy przed ukończeniem przywraca `marka`, bez resetu wskaźników. Zakończona reforma zmienia `currency_regime` na `zloty` od swojego `first_effect_time`. Na początku tego okresu, przed budżetem, zamyka zwykłe finansowanie emisyjne Skarbu i odpowiednie impulsy reżimu marki, lecz nie resetuje płac, produkcji, kosztu pożyczki ani presji społecznej. Wyjątkowy instrument po stabilizacji wymaga osobnego upoważnienia z 11.9. Warianty tempa i kosztu społecznego definiuje 17.12; samo przygotowanie reformy nie obniża inflacji.

**K — etap 6 (0.47):** wejście `wage_agreement_pp` zbiera klauzule płacowe wykonanych ugód i układy zbiorowe: +2 pp × zasięg płacowy branży (przemysł 0,6, kolej 0,2, praca rolna 0,2; P z profilu M02) przez dwa miesiące od wykonania albo podpisu. Płaca dodaje je raz, jak indeksację: `wage0 × agreementPP / (100 + inflacja)`.

### 11.5. Kredyt, produkcja i zatrudnienie

```js
capitalReaction = business_state === "active" ? 1 : 0;
creditTarget = clip(55 - 0.10*max(0,inflation_m) -
                    10*capitalReaction + creditSupport - activeCreditShock, 0, 100);
creditNext = 0.70*credit + 0.30*creditTarget;
privateGrowth = clip(0.015*(credit-55) +
                     0.008*clip(real_wage-100,-50,50) -
                     0.50*capitalReaction - 0.03*strikeDisruption +
                     activeOutputShock, -8, 6);
outputNext = max(1, output * (1 + (privateGrowth + worksOutputPP)/100));
marketUnemploymentNext = clip(market_unemployment - 0.35*privateGrowth, 0, 100);
unemploymentNext = clip(marketUnemploymentNext - 0.25*operatingWorksUnits, 0, 100);
```

`creditSupport` sumuje aktywne instrumenty do 20. `strikeDisruption` zachowuje istniejące wyliczenie branżowe, najwyżej 100. Reakcję kapitału ustalamy w 11.7 raz przed tym krokiem. Poza aktywnym oporem nie ma osobnej kary za samą niechęć właścicieli.

Zamówienia 17.12.1 dodają do istniejącego `activeOutputShock` **0,30 pp × wykonanie** jednego aktywnego pakietu, po ustaleniu jego kosztu i mnożnika w tym miesiącu. Pozostałe szoki pozostają bez zmian; wkład zamówienia jest liczony raz, nie zapisywany równocześnie jako drugi szok scenariusza. Zatrudnienie reaguje przez `privateGrowth` i `marketUnemploymentNext`; nie dodajemy jednostek robót ani drugiej bezpośredniej redukcji bezrobocia. Przy nieosiągniętych ograniczeniach równania pełny wkład 0,30 pp daje różnicę −0,105 pp w zmianie bezrobocia względem tego samego stanu bez zamówienia.

Działające roboty dają `units = baseUnits * scope * coverage`, maksymalnie 8 łącznie. `coverage` jest wyłącznie pochodną 0/0,5/1 z 12.3, nie kolejnym przydziałem. Przy przekroczeniu 8 wszystkie jednostki skalujemy wspólnym czynnikiem `min(1,8/sum(units))`. Wkład produkcyjny to 0,15 pp/M na jednostkę zatrudnieniową albo 0,25 infrastrukturalną, po tym samym ograniczeniu. Mieszkania nie dodają robót drugi raz.

Publiczne miejsca pracy odejmujemy od bezrobocia prywatnego, **nie od poprzedniego całkowitego bezrobocia co miesiąc**. Zamknięcie lub ograniczenie programu usuwa odpowiednią część tych miejsc. Już zbudowany obiekt pozostaje zapisany; nie dopisujemy mu nieuzgodnionego stałego mnożnika wzrostu. Model jest uproszczeniem gry, nie estymacją gospodarki Polski.

### 11.6. Wieś i odbiorcy polityki

```js
agrarianPressureNext = clip(agrarian_pressure +
  0.03*(50-credit) + activeAgrarianShock - 3*newlyExecutedLandUnits, 0, 100);
```

Ukończona transza parcelacji działa raz. Modernizacja, komasacja i spółdzielcze przetwórstwo stosują własne, jednorazowe skutki z 12.6 i 17.12; nie naliczamy im dodatkowej parcelacji. Nie zapisujemy fikcyjnych hektarów ani nie zwiększamy bezpośrednio miejskiej produkcji za każdy projekt rolny.

Dla komórek gospodarujących i bezrolnych `realWageForCell` z 15.1 oznacza pochodny wskaźnik warunków `clip(100 + (45-agrarian_pressure)*0.4 + targetedRuralImprovements,40,140)`, gdzie poprawy pochodzą z wykonanych transz, bez powtórnego zastosowania ich jednorazowej ulgi. Pracownicy otrzymują `real_wage`; komórka bezrobotnych używa P: 65, modyfikowane wyłącznie adresowaną pomocą i wydarzeniami. Osłona daje `ongoingRelief`, a nie równocześnie drugie powiększenie tego indeksu. Nie wprowadzamy nowych grup narodowych. Ten sam wskaźnik wsi, z 1/5 ogólnej gospodarki, tworzy warunki życia chłopów w miesięcznym przepływie poparcia 5.6 (M09, 0.21). Niezadowolenie, protesty i wykonanie umów nadal odczytują gospodarkę osobno.

### 11.7. Jedna reakcja przedsiębiorców

`business_pressure` to liczba 0–100. Branża objęta reformą jest etykietą jej kosztu i relacji politycznych, nie osobnym modelem sprzeciwu.

| Przyjęte działanie P | Jednorazowa zmiana presji |
|---|---:|
| Podatek progresywny / szeroki o poziom | +4 |
| Nieuzgodniony pakiet zwiększający koszt pracy | +4 |
| Przygotowane przejęcie przedsiębiorstwa | +15 |
| Konfrontacyjne przejęcie przy wymaganym legalnym upoważnieniu | +25 |
| Wykonane porozumienie o koszcie reformy | −8 |
| Wycofanie spornego punktu | −12 |

Warianty szczegółowe podają własną cenę zamiast powyższej; nie sumujemy dawnej kary przemysłu, finansów i ziemian za jedno działanie. Jednorazową nagrodę porozumienia zapisujemy raz na sprawę. Powtórne otwarcie menu lub ponowne potwierdzenie istniejącej polityki niczego nie nalicza.

Przy ≥40 stan `warning`, z datą pierwszego ostrzeżenia. Przy ≥60 oraz co najmniej jednym pełnym miesiącu od ostrzeżenia: `active`. Wtedy działają kary kredytu i produkcji z 11.5. Stan aktywny trwa, dopóki presja nie spadnie poniżej 40 przez dwa kolejne rozliczenia; wówczas `quiet`. Nieaktywne ostrzeżenie poniżej 40 zamyka się od razu. Presja sama nie narasta co miesiąc za już raz przyjętą reformę. Deficyt sam nie uruchamia strajku kapitału.

Nie ma osobnej karty B20 ani ręcznych negocjacji trzech sektorów. Korektę reformy i przyjęcie porozumienia wykonujemy przez istniejącą właściwą kartę resortową. Czerwone linie partnerów i dissent PPS nadal rozliczamy niezależnie od gospodarczego skutku oporu.

**K — etap 6 (0.47):** przejęcie pod kontrolę publiczną daje +15 raz na zakład przy wejściu w życie ustawy (`public_control:<zakład>`), odstępstwo −4 raz na odstępstwo; układ zbiorowy nie zmienia presji. Wariantu konfrontacyjnego (+25) karta nie ma.

### 11.8. Przykład jednego programu

Izolowany test P: budżet +2, przygotowanie robót w listopadzie 1925, wdrożenie w grudniu. Koszt budowy 2 B: grudzień, styczeń i luty dają budżet 0 przy stałej koniunkturze. Od marca roboty działają za 1 B, dają 2 jednostki, czyli 0,5 pp publicznego zatrudnienia i 0,30 pp wkładu produkcyjnego. Mnożnik wykonania 1. To dwa główne wybory, a nie pięć. Przykład zamraża koniunkturę dla pokazania rachunku; pełne równania produkcji mogą zmienić późniejszy odczyt budżetu.

Jeżeli inny przyjęty wydatek obniży przestrzeń do −3, wykonanie spada do 0,5: zostaje 1 jednostka, 0,25 pp zatrudnienia i 0,15 pp wkładu produkcyjnego. Koszt zobowiązania nadal wynosi 1 B; nie tworzymy pieniężnego długu odbiorców. Obietnica pełnego programu może zostać naruszona. Gracz może wynegocjować podatki, finansowanie lub zmianę zakresu. Inflacja albo wygaśnięcie pożyczki może spowodować kolejny niedobór, ale nie automatyczne pojawienie się strajku kapitału.

### 11.9. Podatki, kapitał na inwestycje i koszt stabilizacji

`government.finance_package` wymaga Skarbu jako wykonawcy i właściwej zgody prawnej/gabinetowej. Własna inicjatywa: 1 T, 0 R, automatyczne wymagane głosowania w tej decyzji. PPS bez resortu składa ofertę przez istniejącą kartę budżetową wyłącznie w koalicji lub zewnętrznym poparciu danego gabinetu. Przyjęcie oferty nie kosztuje drugiej akcji. Opozycja nie ma dodatkowej własnej ustawy podatkowej poza zatwierdzoną D; może zwyczajnie głosować i korzystać ze stosunku do rządu. Odpowiedź na cudzą obowiązkową ofertę: 0 T.

`Policy`: `id,kind,variant,authorization_id,starts_at,ends_at,budget_modifier,emission_points,beneficiaries,effects_applied`. Przedział działania `starts_at<=t<ends_at`; brak końca dla trwałej ustawy. Jeden aktywny instrument na rodzaj; aktualizacja istniejącego nie tworzy kopii ani drugiej nagrody. `tax_level` jest jedynym źródłem zwykłych podatków w budżecie; jego zmiany nie dodają osobnego `budget_modifier`.

| Instrument P | Wpływ na przestrzeń finansową | Koszt polityczny / ograniczenie |
|---|---|---|
| Podatek progresywny | +1 poziom podatku do 3, czyli +1 B | Presja kapitału +4; Lewica −3 dissentu za uzgodnioną nową zmianę |
| Szersza podstawa podatku | Jak wyżej; `broad` | Presja +4; niezadowolenie objętej klasy średniej +3 |
| Podatki pośrednie | Jak wyżej; `indirect` | Niezadowolenie ubogich odbiorców +3; Lewica +3 bez zgody; bez dodatkowej kary kapitału |
| Nadzwyczajny podatek majątkowy | +2 B przez 6 M | Presja +8; po wygaśnięciu znika dochód. Przedłużenie wymaga decyzji |
| Krajowa pożyczka inwestycyjna | +3 B przez 6 M, następnie −1 B przez 12 M | Kredyt ≥40, zgoda finansujących; jeden rekord z dwoma okresami. Następna pożyczka dopiero po zakończeniu obsługi; nie można skasować jej kosztu przez anulowanie inwestycji |
| Cła fiskalne | +1 B przez 6 M | Szok cenowy +1 pp przez 2 M i kredytowy +3 przez 6 M, raz z tego instrumentu |
| Ograniczenie wydatków administracyjnych | +1 B przez 6 M | Niezadowolenie wskazanych pracowników publicznych +4; bez usuwania praw świadczeniobiorców |
| Cięcie świadczeń | Tylko różnica rzeczywistego obciążenia wskazanego programu, np. 2 → 1 B | Wymagana zmiana prawa; mniejsza osłona, naruszenie gwarancji, Lewica +8 bez zgody. Bez dodatkowej fikcyjnej premii budżetu |
| Finansowanie emisyjne przed stabilizacją | Limit 1–3 punktów, wybrany w pakiecie; zużycie według 11.2 | Wymaga upoważnienia; faktyczne wykorzystanie zwiększa cel inflacji. Początkowo brak aktywnego instrumentu |
| Przejściowy bilon po stabilizacji | Limit 1 punktu przez 3 M | Odrębne upoważnienie P, nie zwykła emisja banku ani dochód; ponowienie dopiero po wygaśnięciu |

Pożyczka jest abstrakcją czasowego finansowania i kosztu, nie twierdzeniem o historycznych warunkach kredytowych. Cięcia płac publicznych wymagają analogicznego wskazania istniejącej pozycji i odbiorców w profilu; brak profilu nie daje darmowego +B. Zmiana rozkładu tego samego podatku nie podnosi ponownie jego poziomu. Obniżka podatku o poziom zmniejsza przestrzeń o 1 B; przy cofnięciu spornego podwyższenia jednorazowo stosujemy −12 presji ze śladem sprawy, bez farmienia premii przez ponawianie tego samego cyklu.

**Konsolidacja kapitału:** fundusz publiczny, umowa z bankami/przemysłem lub fundusz spółdzielczy wskazuje konkretny projekt robót/kredytu i instrument finansowania. Umowa prywatna nie daje bezpłatnego ogólnokrajowego kredytu; aktywny instrument kredytowy z 12.4 daje +5 `creditSupport` raz. Jedno finansowanie, jeden koszt, jeden efekt; sponsoring wpływa na przypisanie zasługi. Środki partyjne R pozostają oddzielne. **Z — 0.37, trzy warianty:** fundusz publiczny płaci całość (instrument 12.4: 2 B budowy, 1 B działania); porozumienie z bankami i przemysłem pokrywa połowę budowy (1 B), wymaga zgody banków jak pożyczka (kredyt ≥40), obniża presję kapitału o 8 jak wykonane porozumienie (11.7), a zasługę dzieli z przedsiębiorcami; finansowanie spółdzielcze ma pełny koszt, kieruje kredyt do gospodarstw i małych zakładów i wymaga wykonawcy spółdzielczego.

Kryzys finansowy dla karty stabilizacji: budżet <−2 przez 2 M **lub** inflacja ≥20% przez 2 M, albo już przyjęty projekt. Walutowy składnik `majorCrisis` z 8.6 zachowuje próg 20% przez 2 M. Rozliczenia historii, nie liczba wejść do sceny, wyznaczają oba terminy.

H — podatki i reforma skarbowo-walutowa mają wcześniejsze źródła `PL-1924-FISCAL-CURRENCY` i `PL-CONTENT-1922-1926-2026-09`. Nowy punkt B, koszt, terminy, limity i profil bilonu są P. Zatwierdzenie uproszczenia: `PL-ECONOMY-SIMPLIFICATION-2026-09-14`.

**K — etap 4 (0.45):** instrumenty są rekordami `E.policies` z oknami budżetowymi; podatki zmieniają tylko `tax_level`. Karta finansowa PPS głosuje instrument w decyzji; gabinet proponuje pakiet w przeglądzie, a Sejm głosuje go w następnym rozliczeniu. Limit emisji to brakująca przestrzeń, od 1 do 3 punktów (P). Kryzys finansowy liczą dwa ostatnie odczyty historii.

## 12. Projekty, upoważnienie i wykonanie

### 12.1. Schemat projektu

```text
id, type, variant, sponsor, responsibility, beneficiaries, scope, tranche_ids, policy_choices,
status, preparation, authorization_id, executor, required_capabilities,
build_budget_B, upkeep_budget_B, party_cost_R, financing_policy_ids,
progress, duration_months, started_at, first_effect_time, last_processed_time,
effects_applied, obligations_linked, caretaker_allowed, interruption_reason
```

`status`: `idea|prepared|executing|operating|paused|completed|repealed`. `preparation` to 0 lub 100, nie punkty zbierane w kilku zwykłych akcjach. `coverage` jest pochodną, nie przechowywanym udziałem przydziału kadry. Nie ma `authorized/funded` jako osobnych faz gracza, kosztu gotówki na start ani planu płatności. Prawo i wykonawca pozostają sprawdzanymi warunkami. `scope=1..3` mnoży koszt i ilościowy zasięg, chyba że profil ma stały wariant; transze nie dublują beneficjentów i jednorazowych skutków.

### 12.2. Przejścia i koszty czasu

| Projekt / przejście | Akcje PPS | Wykonanie |
|---|---|---|
| Mała reforma oparta na kompetencji | Jedna decyzja wdrożenia, 1 T | Wariant, wymagane zgody i finansowanie w tym samym kroku; potem automatycznie |
| Duża reforma: `idea → prepared` | Jedno przygotowanie, 1 T | Pełne przygotowanie 100, bez budżetowego kosztu samego programu |
| `prepared → executing` | Jedno wdrożenie, 1 T | Wybrany zakres, automatyczne głosowanie jeśli potrzebne, przyjęte finansowanie i wykonawca |
| `executing → operating/completed` | 0 T | Postęp przy miesięcznym rozliczeniu |
| Brak wykonania / wznowienie | Bez dodatkowego obowiązkowego menu | Przyczyna w panelu, poprawa finansowania wznawia automatycznie; zmiana polityki zwykłą kartą |
| Zmiana lub uchylenie programu | Właściwa istniejąca karta, zwykle 1 T | Prawo i partnerzy nadal wymagani; wykonane skutki rzeczowe nie są cofane |

Dwie akcje są normalnym kosztem dużego programu, nie gwarancją uchwalenia go bez większości. Odmowa głosów lub wykonawcy zachowuje przygotowanie i pokazuje konkretny powód; zmiana oferty może wymagać późniejszej akcji politycznej. Przygotowana agenda omija losowanie i odnowienie **przy przejściu do następnego etapu tego projektu**, nie pozwala omijać czasu miesiąca ani odnowienia nowych transz. Doradca wykonuje jeden dozwolony krok za 0 T i wspólny timer, bez darmowych B/R.

D1–D2 zachowuje własne dwie karty i automatyczne rozpoczęcie dopiero po wejściu ustawy w życie według 17.15, bez trzeciej akcji. Zwykłe wznowienie lub ponowne przygotowanie projektu nie omija jednorazowego limitu D. Zmiana konstytucji zachowuje szczególną procedurę 7.6; nie dziedziczy dawnej fiskalnej serii przygotowanie–prawo–finansowanie–start. PPS nie realizuje kompetencji państwa przez samo przygotowanie programu poza rządem.

**K — etap 4 (0.45):** mała reforma rusza w decyzji; duża ma przygotowanie w karcie i wdrożenie w stałej karcie „Agenda” (1 T), bez losowania i odnowienia. Agenda uruchamia jeden przygotowany projekt danego typu naraz. Doradca Arciszewski albo Moraczewski wykonuje jeden krok karty za 0 T.

### 12.3. Wykonanie i postęp

```js
coverage = stateCanExecute(project,cabinet) ? fiscalDelivery(budget) : 0;
progressNext = min(100, progress + (100/duration_months)*coverage);
```

`fiscalDelivery` to wyłącznie 1/0,5/0 z 11.3. Koszt programu finansowanego tylko z R i jego utrzymanie korzysta ze swojego rejestru organizacji, nie z budżetu państwa. `stateCanExecute` z 8.5 sprawdza prawo, wykonawcę i zakres gabinetu; nie wymaga ministra PPS. Brak zgody gabinetu na **nową decyzję PPS** blokuje wybór akcji, nie kasuje uprawnienia administracji do wykonywania już uchwalonej ustawy.

Pełne wykonanie = 1, ograniczone = 0,5, wstrzymanie = 0. Bieżące efekty i postęp skalujemy raz. Efekt jednorazowy ukończonej transzy stosujemy raz po pełnym ukończeniu, bez ponownego mnożenia przez przejściowe ograniczenie budżetu. Przy zerze zachowujemy fazę do wznowienia w `interruption_reason`; jeżeli użyto `paused`, rekord zapisuje też fazę powrotu. Nominalny koszt obowiązuje także w pauzie do prawidłowej zmiany zobowiązania. Ukończona reforma prawna nie przestaje obowiązywać wskutek deficytu.

Program inwestycyjny działa od miesiąca po ukończeniu; koszt budowy obowiązuje w miesiącu ukończenia, a utrzymanie od pierwszego efektu. Osłona, której podstawa prawna weszła w życie przed rozliczeniem, działa już w tym rozliczeniu z mnożnikiem fiskalnym; jej profil ma `first_effect_time=started_at`. D ustawia oba pola na pierwsze należne rozliczenie według 17.15, nie na miesiąc głosowania Sejmu. Początkowa ulga osłony jest stosowana raz przy pierwszej rzeczywistej wypłacie, mnożona przez wykonanie wtedy; wznowienie nie powtarza nagrody. Ta ulga społeczna jest odrębna od jednorazowej zasługi autora z 5.4.

Zamówienie przemysłowe ma odrębny, skończony okres działania: trzy rozliczenia kontraktu z 17.12.1, bez dodatkowej budowy. Konsultacyjna reprezentacja pracowników działa po wykonaniu uprawnionego aktu. Profesjonalizacja policji, silniejsza reprezentacja i autonomia mają zwykły postęp; zapisane uprawnienia i jednorazowe efekty powstają po pełnym ukończeniu oraz wejściu w życie wymaganej podstawy. Nie czekają dodatkowego miesiąca inwestycyjnego, bo nie są robotami budowlanymi. Właściwa ustawa przechodzi 7.2; dwie akcje projektu nie znoszą terminów prawa.

Nie ma puli kadry ani limitu czterech projektów do ręcznego obsadzenia. Czas, budżet, zgoda polityczna, kompetencje i ograniczony zakres transz wystarczają jako bariery pierwszego rozdziału.

### 12.4. Katalog programów testowych

Koszt oznacza **obciążenie B podczas budowy / podczas działania**, nie B do odjęcia co miesiąc od poprzedniego budżetu. Czas w M to automatyczne rozliczenia wykonania przy pełnym finansowaniu; mała/duża określa 1/2 zwykłe akcje.

| Projekt | Kompetencje | Klasa; budowa / działanie; czas P | Efekt P |
|---|---|---|---|
| Inspekcja i czas pracy | Praca; właściwe prawo | Mała; 1 / 1; 2 M | Ochrona +1 poziom; niezadowolenie odbiorców −3 raz przy pierwszym działaniu × wykonanie |
| Osłona dla bezrobotnych | Praca + finansowanie | Mała; 0 / 2; bieżąca | Początkowa ulga −6, następnie bieżąca ulga 2 × wykonanie; D ma własne dwie karty |
| Roboty publiczne | Praca + finansowanie | Duża; 2 / 1; 3 M | 2 jednostki przy skali 1; zatrudnienie i produkcja z 11.5 |
| Instrument kredytowy | Przemysł/Skarb + instytucja | Duża; 2 / 1; 2 M | +5 do celu kredytu × wykonanie podczas działania |
| Reforma ziemska | Rolnictwo + prawo | Duża; 2 / 0; 4 M | Jedna transza parcelacji, presja agrarna −3, skutki 12.6 |
| Publiczne mieszkalnictwo spółdzielcze | Praca + wykonawca | Duża; 2 / 1; 4 M | Bieżąca ulga 2 dla odbiorców × wykonanie |
| Oświata i prawa językowe | Oświata + prawo | Duża; 1 / 1; 4 M | Wykonana umowa, jednorazowe zaufanie +4 odbiorców przy uruchomieniu |
| Reforma walutowa | Skarb + ustawa + instytucja | Duża; 2 / 0; 3 M | Zmiana reżimu od pierwszego efektu; warianty 17.12 |
| Zabezpieczenie przedsiębiorstwa | Przemysł + prawo/umowa | Duża; 2 / 1; 2 M | Przywrócenie wskazanej utraconej zdolności według profilu, bez uniwersalnej premii |
| Kontrola cywilna wojska | Wojskowość + procedura | Duża; 1 / 0; 3 M; ograniczona reforma 1 / 0; 2 M (Z — 0.36) | Wskazane zmiany zgrupowań, rozdział 16; ograniczona reforma daje połowę skutku |
| Reforma reguł gabinetowych | Tryb konstytucyjny | Osobna procedura 7.6; 1 / 0; 1 M | Reguły odpowiedzialności, bez premii gospodarczej |
| Zamówienia przemysłowe | Przemysł + zamawiający/dostawcy + finansowanie | Mała; 0 / 1; 3 M działania, potem 0 | +0,30 pp/M do wkładu produkcji × wykonanie; jeden pakiet, 17.12.1 |
| Profesjonalizacja policji | MSW + właściwy zakres polecenia | Mała; 1 / 0; 3 M | Po ukończeniu command +10 i lawful_compliance +10 raz, 17.12.2 |
| Przegląd konkretnego nadużycia | Sprawiedliwość + właściwy organ i sprawa | Mała; 1 / 0; 1 M | Rozstrzygnięcie wskazanej restrykcji, bez gwarancji korzystnego wyniku, 17.12.3 |
| Gwarancje prawne — szeroki wariant | Jak `democratic_guarantees` | Jeden istniejący projekt 7.6; 1 / 0; 1 M po promulgacji | Wspólna reforma i jej efekty, bez drugiego projektu lub premii |
| Konsultacyjna reprezentacja pracowników | Przemysł + publiczny właściciel lub jego umowa | Mała; 0 / 0; po wykonaniu aktu | Informacja i konsultacje; grievance odbiorców −2 raz, 17.12.5 |
| Współdecydowanie pracowników | Jak wyżej + podstawa prawna | Duża; 1 / 0; 2 M | Wymagane zgody na wskazane decyzje; grievance −4 raz, 17.12.5 |
| Autonomia administracyjno-kulturalna | MSW + Oświata w jej zakresie + ustawa | Duża; 1 / 0; 3 M | Przekazane kompetencje i wykonana umowa; grievance odbiorców −3 raz, 17.12.6 |

Mała spółdzielnia partyjna zachowuje 1 R przygotowania, 2 R uruchomienia i 0,10 R/M; nie otrzymuje publicznych B. **Z — 0.34:** liczba spółdzielni nie ma osobnego limitu; ogranicza ją koszt oraz limit bieżącej ulgi 6 w komórce (13.2). Utrzymanie R pozostaje rzeczywistym miesięcznym wydatkiem z zasobów PPS, inaczej niż odczyt budżetu państwa. Inwestycje narodowe nie są finansowane przez doradcę z kieszeni partii.

**K — etap 6 (0.47):** zabezpieczenie przedsiębiorstwa to projekt `plant_rescue` (duży, 2/1, 2 M, bez ustawy, pod umową właściciela będącą warunkiem kredytu): po ukończeniu przywraca zapisaną utraconą zdolność zakładu raz, bez premii dla gospodarki. Reprezentacja to projekt `enterprise_representation`: konsultacje (mała, 0/0, zakończona aktem właściciela w tej samej decyzji) i współdecydowanie (duża, 1/0, 2 M, własna ustawa). Przygotowane projekty czekają w agendzie.

### 12.5. Termin „za późno”

Prognoza podaje najwcześniejszy miesiąc efektu: pozostałe główne decyzje, miesiące wykonania przy aktualnym mnożniku i ewentualne t+1 dla inwestycji. Akcja wdrożeniowa zalicza pierwszy miesiąc budowy w swoim rozliczeniu; nie dodajemy tego miesiąca dwa razy. Przy zerowym wykonaniu termin brzmi „wstrzymane do przywrócenia warunków”.

Przykład 11.8: listopadowe przygotowanie i grudniowe wdrożenie robót 3 M → efekt od marca. Doradca może zastąpić przygotowanie w listopadzie, umożliwiając wdrożenie główną akcją tego miesiąca → efekt od lutego. Projekt uruchomiony w marcu 1926 daje efekt dopiero od czerwca, więc nie poprawi sytuacji przed majowym zamachem, jeśli ten nastąpi. Ograniczone wykonanie wydłuża termin, a umówione wybory lub ultimatum nadal mogą nadejść wcześniej.

### 12.6. Reforma rolna, modernizacja i komasacja

P — `government.land_program` wybiera **sposób podziału ziemi** i **zasadę dostępu**. Wymaga Rolnictwa, prawa i finansowania; samo posiadanie resortu nie zmienia własności. Własny projekt PPS przechodzi 12.2. Polityczna reakcja powstaje przy przyjęciu prawa, efekt społeczny dopiero przy wykonaniu. Konkretne warianty zastępują domyślny wiersz reformy ziemskiej w 12.4, nie dodają drugiego kosztu.

| Wariant | B podczas budowy / po zakończeniu / czas P, skala 1 | Wykonanie i spór |
|---|---|---|
| Parcelacja z odszkodowaniem | 2 / 0 / 4 M | 1 jednostka reformy; koszt odszkodowania w cenie. Presja kapitału +8 (koszt ziemiaństwa); najłatwiejsza podstawa umowy z Piastem |
| Przyspieszona parcelacja z odszkodowaniem | 3 / 0 / 3 M | Ta sama jednostka szybciej, większy rachunek; presja kapitału +12 (ziemiaństwo). Wyzwolenie może uznać wykonanie umówionego szybszego terminu |
| Wywłaszczenie bez odszkodowania | 1 / 0 / 4 M | Alternatywa ustrojowa wymagająca uprzedniej zmiany sprzecznych gwarancji własności; presja kapitału +25 raz (ziemiaństwo i finanse). Nie jest dostępną zwykłą decyzją ministra w niezmienionym porządku prawnym |

Wartości sprzeciwu zastępują ogólne „przejęcie własności” z 11.7. Każda wykonana jednostka obniża presję agrarną o 3 według 11.6 oraz niezadowolenie wskazanych odbiorców o 4, jednorazowo. Nie nadaje PPS mandatów. Prawidłowe odszkodowanie nie gwarantuje braku oporu; zmniejsza koszt konfliktu w porównaniu z wywłaszczeniem.

Wariant bez odszkodowania dołącza odrębną propozycję zmiany gwarancji własności, z trybem 7.1 i kosztem przygotowania/wykonania jak 7.6. Obowiązujące `law_id` musi wyraźnie dopuszczać taki transfer, zanim rozpocznie się parcelacja. Jest to dodatkowa zmiana na radykalnej ścieżce, nie ukryty skutek uchwalenia ogólnych gwarancji demokratycznych.

Zasada dostępu jest osobnym punktem tej samej ustawy: **równe kryteria potrzeb i wielkości gospodarstwa** albo **preferencja dla polskiej większości**. Drugi wariant narusza czerwone linie partnerów mniejszościowych i ewentualne gwarancje z 7.6; jeśli prawo go zabrania, opcja pokazuje blokadę. Po legalnie wprowadzonym dyskryminującym wariancie zaufanie wykluczonych komórek −6 oraz wpis bezprawności tylko wtedy, gdy faktycznie naruszono obowiązujące prawo. Przyznanie ziemi większości nie odejmuje głosów mniejszości automatycznym narodowym przelicznikiem. Skład odbiorców zapisujemy na istniejących trzech kategoriach tożsamości.

`government.agriculture_development` ma dwie odrębne, zgodne z parcelacją opcje:

| Projekt P | B podczas budowy / po zakończeniu / czas | Co zmienia |
|---|---|---|
| Doradztwo, narzędzia i spółdzielcza modernizacja | 1 / 0 / 4 M | Wykonany zakres: presja agrarna −2; wskaźnik warunków objętych komórek wiejskich +3. Dostęp do kredytu można sfinansować osobnym instrumentem, bez darmowej pożyczki w tej cenie |
| Dobrowolna komasacja i uporządkowanie gruntów | 1 / 0 / 4 M | Wymaga przyjętej lokalnej procedury, rozstrzygnięcia sporów i zgody wymaganej jej prawem; presja agrarna −2, warunki odbiorców +2. Spór o granice wstrzymuje wykonanie, nie wymusza zgody wszystkich właścicieli |

Trzecia zatwierdzona opcja tej rodziny to spółdzielcze przetwórstwo i sprzedaż, z odrębnym zakresem opisanym w 17.12 (8–9).

To projekty skończone, bez kosztu miesięcznego po wykonaniu. `beneficiaries` wskazuje obszar/komórki; `scope=1..3` dzieli ograniczony zasięg krajowy na trzy odrębne transze. Ten sam obszar nie może ponownie dostać tej samej jednorazowej poprawy; większa skala od razu zajmuje odpowiednią liczbę transz. Ziemia, modernizacja i scalenie mogą obejmować tych samych ludzi, ponieważ wykonują różne zadania. Nie podnoszą bezpośrednio miejskiego wskaźnika produkcji z 11.5.

H — ustawy o scalaniu gruntów z 31 VII 1923 i wykonaniu reformy rolnej z 28 XII 1925 są podstawą historyczną. Przyspieszenie reformy, zakres beneficjentów i wartości powyżej są P; droga bez odszkodowania jest wyraźną alternatywą. Nie przenosimy historycznej ustawy automatycznie na każdy gabinet.

### 12.7. Oświata i prawa mniejszości: cztery różne oferty

`government.education_program` obejmuje Oświatę; egzekwowanie praw lub cofnięcie administracyjnego zakazu wymaga współdziałania właściwego resortu/instytucji. Każdy wariant określa odbiorców. Nie dodajemy kolejnych narodowości. Koszty i wykonanie podstawowego projektu: 1 B podczas budowy / 1 B podczas działania / 4 M, według 12.4; maksymalnie trzy rozłączne transze zasięgu jak w 12.6.

| Wybór P | Treść wykonywana przez projekt | Warunek / następstwo |
|---|---|---|
| Dostęp do szkół i edukacja dorosłych | Placówki, nauczyciele, dostęp dla wskazanych ubogich komórek | Wykonanie daje zaufanie +4 odbiorców; nie zastępuje partyjnego TUR ani nie finansuje PPS z pieniędzy państwa |
| Świecka szkoła z wolnością religijną | Zmiana zasad zarządzania i programu, bez przymusu uczestniczenia w praktykach religijnych | Wymaga ustawy; w negocjowanej wersji PSChD ocenia treść przez `programFit`. Konfrontacyjny wariant sprzeczny z przyjętą umową uruchamia naruszenie umowy z partnerem. Z — 0.37: bez reakcji frakcji, bo dokumentacja nie wskazuje frakcji przeciwnej tej linii |
| Prawo wyboru języka i ochrona organizacji | Wykonanie przyjętych praw w szkołach oraz rozpatrzenie konkretnych bezprawnych ograniczeń organizowania | Zaufanie +4 objętych komórek żydowskich lub innych mniejszości; relacja odpowiedniego klubu +4 za wykonaną umowę, nie za samą deklarację |
| Model dwujęzyczny lub asymilacyjny | Gracz wybiera uzgodnioną dwujęzyczność albo narzucenie dominacji polskiego języka | Dobrowolnie przyjęta dwujęzyczność rozlicza umowę jak wyżej. Narzucona asymilacja: zaufanie objętych mniejszości −6, konflikt ich umów; obowiązujące prawa mogą blokować wykonanie |

To alternatywy dla tego samego celu językowego lub ustrojowego; nie można sfinansować jednego zakresu szkoły dwa razy pod sprzecznymi etykietami. Rozbudowa dostępu może natomiast współistnieć z ustaloną zasadą językową. Projekt organizacyjnych praw obywatelskich bez szkół używa 1 B podczas wykonania / 0 po zakończeniu / 2 M, kończy się po wykonaniu i nie daje efektu edukacyjnego.

W sprawie konkretnej represji wymagamy `restriction_id`, ustalenia jej podstawy prawnej i właściwego rozstrzygnięcia. Przy potwierdzonej bezprawności uprawniony organ może uchylić zakaz; PPS w opozycji składa wniosek i szuka poparcia. Sam minister Oświaty nie unieważnia wyroków. Gwarancje z 7.6 umożliwiają procedurę, nie z góry korzystny werdykt.

H — istnienie ustawy szkolnej z 31 VII 1924 jest punktem odniesienia; niniejsza tabela określa alternatywne oferty gry, a nie streszczenie wszystkich jej szczegółowych przepisów. Konkretne granice kompetencji i regionalny zasięg wdrożenia pozostają B.

Po rewizji rządowej 0.6 powyższy kontrakt obsługuje dwie rodziny: ogólną politykę oświatową i prawa językowe (17.11, pozycje 10–11). Nie są to dodatkowe, niezależnie nagradzane wersje tej samej szkoły.

### 12.8. Wawel albo Zamek Królewski: decyzja Oświaty

Z — temat przypisujemy do `education`, zgodnie z decyzją użytkownika. `government.heritage_restoration` pozwala wybrać **Wawel** albo **Zamek Królewski w Warszawie**, a następnie zakres. Chodzi o prace konserwatorskie/restauratorskie w istniejących obiektach, nie o odbudowę Warszawy po II wojnie światowej.

| Opcja P | Koszt i czas | Skutek |
|---|---|---|
| Ograniczona konserwacja | 1 B obciążenia przez 2 M, potem 0; mała reforma: jedna akcja wdrożenia | Zachowany obiekt w raporcie projektu; po ukończeniu wiarygodność PPS +1, tylko gdy była jawnym sponsorem |
| Szerszy remont i dostęp publiczny | 2 B obciążenia przez 4 M, potem 0; duża reforma: przygotowanie i wdrożenie | Jak wyżej, wiarygodność +2 oraz zaufanie objętej komórki inteligencji +3; brak dodatkowej premii wariantu małego |

Mała konserwacja wymaga jednej akcji 1 T, szerszy remont dwóch według 12.2. Nie wymagają nowej ustawy, jeśli mieszczą się w istniejących kompetencjach i przyjętym budżecie. Można ukończyć po jednym projekcie dla każdego obiektu; zmiana zakresu trwającego remontu aktualizuje obciążenie, nie tworzy nowej nagrody. Wawel/Warszawa określa obiekt i odbiorców, bez bonusu przemysłowego lub zamachowego. Ewentualne współfinansowanie społeczne wymaga przyjętej umowy wskazującej konkretną redukcję publicznego obciążenia, bez dodatkowej księgi lub karty zbiórki.

H — oba obiekty podlegały pracom w okresie międzywojennym; wawelskie zbiórki cegiełkowe obejmowały lata 1921–1926. Źródła muzealne w `PL-CONTENT-1922-1926-2026-09`. Przypisanie całej decyzji jednemu resortowi i jej koszt są uproszczeniem projektowym.

## 13. Organizacje PPS i Milicja / AS

### 13.1. Finanse partyjne i utrzymanie

`apparatus.member_index` zaczyna testowo od 100 i mierzy skalę opłacającego składki członkostwa względem otwarcia, nie liczbę wyborców lub ludzi Milicji. **Z — 0.30 (M18):** jest to rzeczywista skala członkostwa, w rozdziale 1 w zakresie 0–150. Rozłam lub czystka od razu mnożą ją przez (1 − udział odchodzących). Co miesiąc, w punkcie 6 z 4.2, indeks zbliża się do celu:

```js
memberTarget = clip(100 * ((ppsWorkerSupport / ppsWorkerSupport0 +
                            avgUnionReach / avgUnionReach0) / 2) *
                    (1 - 0.05*(dues - 2)), 50, 150);
member_index += 0.05 * (memberTarget - member_index);
```

`ppsWorkerSupport` to udział PPS w komórkach klasy `workers`, ważony ich masą. `avgUnionReach` to średni zasięg trzech branż związkowych. Wartości z indeksem 0 pochodzą z otwarcia, więc na starcie cel wynosi 100. Indeks rośnie przez istniejące działania: rozbudowę związków, kampanie, mobilizację Pużaka i organizowanie Arciszewskiego; nie ma osobnej karty rekrutacji. Przykład: trzy rozbudowy jednej branży przy niezmienionym poparciu dają cel 137,5 i indeks ok. 135 po 49 miesiącach.

Miesięczne wpływy P: `(0.25*dues + 0.15*(apparatus_level-1))*member_index/100` R (Z, 0.30, M18; wcześniej 0,20 na poziom). Doraźna dodatkowa zbiórka daje `dues*member_index/100` R, zajmuje 1 T i ma cd 3 M. Jest osobną składką nadzwyczajną, nie drugim zaksięgowaniem wpływu miesięcznego. Rozbudowa aparatu kosztuje 2 R i 1 T, poziom +1, maksymalnie 4. Przy pełnym członkostwie poziom daje netto +0,05 R/M i zwraca się po ok. 40 M; w większej partii zarabia więcej. Diagnostyka: [analysis/m18-membership-apparatus/REPORT.md](../analysis/m18-membership-apparatus/REPORT.md).

**Karta składek, Z — podwyższyć / obniżyć; od 0.34 bez płatnego „utrzymać”.** P: 1 T, 0 R, cd 6 M; `dues` w granicach 1–4, początek 2. Podwyżka o 1 zwiększa przyszłe przychody, ale od razu mnoży `member_index` przez 0,95, jeśli płace realne <90 lub bezrobocie ≥8; w innych warunkach przez 0,98. Obniżka o 1 przywraca do 2 punktów indeksu, najwyżej do 150. Od 0.30 (M18) poziom składek zmienia też cel członkostwa: −5% za każdy poziom powyżej 2, +5% za poziom 1. Pozostawienie składek bez zmian nie kosztuje akcji: obecny poziom jest widoczny jako obecny, a zamknięcie karty jest bezpłatne. Nie doliczamy automatycznie tej samej straty do preferencji wyborczych. Chodzi o obciążenie członków; kampanie i wykonane polityki osobno wpływają na elektorat. Podgląd pokazuje nowe wpływy przy nowej liczebności i koszty utrzymania przed zatwierdzeniem.

Stały koszt aparatu wynosi `0.10*apparatus_level` R/M. Prasa kosztuje 0,10 R/M, TUR `0.05*level`, a każda działająca mała spółdzielnia 0,10 R/M. Pozostałe programy mają własne zobowiązania. Same posiadane mandaty nie przynoszą automatycznych R.

Płatność następuje z rzeczywiście dostępnych środków. Niedobór nie tworzy ujemnego salda: zapisuje niedofinansowaną organizację i jej zaległości. Przed zatwierdzeniem nowego stałego kosztu interfejs pokazuje prognozę utrzymania na sześć miesięcy.

**K — etap 5 (0.46):** kasa `S.party_orgs.cash` (2 R) i składki (2) mają kopie `Q.resources` i `Q.dues`. Wpływy księgi to `(0,25·składki + 0,15·(poziom aparatu − 1))·członkostwo/100`, plus 0,10 R ze sprzedaży prasy popularnej przy zasięgu ≥ 50. Koszty płacimy w kolejności: aparat, prasa, TUR, spółdzielnie, Milicja. Niezapłacona reszta staje się zaległością, a kasa nie spada poniżej 0. Członkostwo zbliża się do celu M18 (100 na starcie, od zasięgu związków i składek, w granicach 50–150). Zbiórka daje składki × członkostwo/100 R co 3 M, rozbudowa aparatu kosztuje 2 R, a praca organizacyjna nie kosztuje nic (4.4). Karta Składki (`polish_party_dues`) blokuje obecną wysokość z powodem.

**K — etap 6 (0.47):** w księdze członkostwo zbliża się do celu przed liczeniem wpływów ze składek (kolejność M18; decyzja użytkownika w etapie 6, test „Otwarcia finansowe”: +1,65 R za trzy poziomy aparatu i +3,26 R za trzy rozbudowy branży w 52 M). Wpływ do funduszy branż liczy od etapu 6 moduł związków w punkcie 4.

### 13.2. Rejestr organizacji

| Stan | Zakres i początek P | Główna zmiana / odbiorca |
|---|---|---|
| `press.reach` | 0–100; 30 | Dystrybucja +10 / skuteczność kampanii |
| `press.credibility` | 0–100; 60 | Udokumentowana sprawa +4, fałszywie ogłoszone wykonanie −8 / zaufanie |
| `press.campaigns` | Rekordy tematu, odbiorców i terminu | Wygaszanie efektów, nasycenie |
| `tur.level` | 0–3; 0 | Ukończony etap / kadra i zasięg organizowania |
| `tur.cadres` | 0–100; 0 | +10 za etap / +0,1 mnożnika rozwoju organizacji za każde pełne 20 |
| `cooperatives.projects` | Rekordy projektu | Finansowanie, wykonanie, odbiorcy i utrzymanie |
| `apparatus.level` | 1–4; 1 | Wpływy składkowe i koszt działania |
| `apparatus.member_index` | 0–150; 100 | Składki, odejścia i miesięczne zbliżanie do celu z poparcia robotników i zasięgu związków (M18) / rzeczywiste wpływy do kasy PPS |
| `organization.arrears` | R ≥0; 0 | Niedopłata / pogorszenie zdolności, bez podwójnego naliczania długu |

Przy dwóch kolejnych miesiącach niedofinansowania prasa traci 5 zasięgu miesięcznie, a projekt TUR nie postępuje. Uzupełnienie zaległości wznawia działanie; nie przywraca automatycznie utraconego zasięgu.

Mnożnik TUR stosuje się do przyrostu zasięgu przy rozbudowie komórek, nie do przyrostu kadry samego TUR ani do pieniędzy. Wynosi `1+0.1*floor(cadres/20)`; przy trzech etapach i 30 kadry daje 1,1. Zasięg po zmianie nadal ograniczamy do 100. Mała spółdzielnia i program mieszkaniowy wskazują odbiorców w rekordzie; osłona nie obejmuje automatycznie wszystkich wyborców, a suma bieżącej ulgi w komórce jest testowo ograniczona do 6.

P — `press.format=party_journal|popular`, początek `party_journal`. Zmiana formatu kosztuje 1 T i 1 R, ma odnowienie 6 M. Popularny format dodaje +10 do efektywnego zasięgu i obniża efektywną wiarygodność o 5; nie zapisujemy tych modyfikatorów wielokrotnie do bazowych pól. Gdy efektywny zasięg wynosi ≥50 i utrzymanie prasy opłacono w poprzednim rozliczeniu, popularne wydanie przynosi dodatkowo 0,10 R/M sprzedaży do wpływów z 13.1. Zapobiega to obliczaniu przychodu na podstawie finansowanego nim samym bieżącego kosztu. Pierwsze przyjęcie tego formatu daje Centrum +3 sprzeciwu; powrót nie refunduje kary. Sam format nie dodaje pp poparcia — działa przez kampanię.

`press.restrictions` to lista ograniczeń powiązanych z `EventRun`, nie stały nowy licznik represji. Wpis ma `id,event_id,reach_penalty,expires_at,status`; testowa konfiskata zapisuje dodatnią karę 10 i termin `t+2`. Wymaga wpisu o akcie właściwej władzy i podstawie w profilu wydarzenia; nie jest losową karą za samo posiadanie prasy. Wartości używane w 5.3 obliczamy następująco:

```js
restrictionPenalty = sum(press.restrictions
  .filter(r => r.status === "active" && time < r.expires_at)
  .map(r => r.reach_penalty));
pressEffectiveReach = clip(press.reach +
  (press.format === "popular" ? 10 : 0) - restrictionPenalty, 0, 100);
pressEffectiveCredibility = clip(press.credibility -
  (press.format === "popular" ? 5 : 0), 0, 100);
```

Początkowo lista jest pusta. Wcześniejsze akcje dystrybucji i utrata zasięgu z niedofinansowania nadal zmieniają tylko wartość bazową `press.reach`.

Po usunięciu B6 nie tworzymy osobnej karty konfiskaty ani jej menu odwoławczego. Istniejący zapis ograniczenia może wygasnąć albo zostać uchylony przez właściwą instytucję w zwykłej sprawie prawnej; nie generuje dodatkowej odpowiedzi wydarzenia. PPS może też użyć istniejącej karty kampanii przez związki/spotkania (1 T, 1 R); wtedy zasięg kanału wyznacza odpowiednia branża, bez premii prasy. Brak zasobów pozostawia darmową finansowo pracę organizacyjną. Każda konfiskata wygasa lub zostaje uchylona raz po własnym ID; wygrane odwołanie nie zwraca fikcyjnie kosztu wydrukowanych egzemplarzy.

TUR ma datę dostępności w profilu treści. H — własne wydawnictwo TUR z 1929 potwierdza założenie w styczniu 1923; test otwiera wtedy budowę organizacji, a tempo poziomów pozostaje P. Źródło w `PL-CONTENT-1922-1926-2026-09`. Brak niezależnej radiostacji PPS w tym rozdziale; stary radiowy wariant Media nie jest częścią manifestu docelowej gry.

**Co gracz robi przez TUR.** Etap `party.tur` kosztuje 1 T i 2 R, trwa 2 opłacone miesięczne rozliczenia i dopiero wtedy daje poziom +1 oraz kadrę +10. `tur.active_build` przechowuje docelowy poziom, datę i liczbę opłaconych miesięcy; początkowo null. W czasie budowy koszt wynosi jak dla przyszłego poziomu, zamiast doliczać dwie opłaty. Poziomy oznaczają kolejno sieć kursów i czytelni, szkolenie organizatorów oraz koordynację ogólnokrajową. Jeden etap można rozwijać naraz; nie jest to bezpośredni zakup poparcia.

`party.tur_course` wykorzystuje poziom już wykonany. Wybór zajmuje 1 T i 1 R, program trwa 2 M finansowanego działania; jeden kurs naraz, wspólne odnowienie 4 M od rozpoczęcia. `tur.active_course` zapisuje temat, odbiorców, datę, opłacone miesiące i ID skutku, początkowo null. Kurs przerwany niedofinansowaniem czeka, zamiast nagradzać upływ czasu.

| Kurs P | Wymaganie | Wynik po zakończeniu |
|---|---|---|
| Prawa obywatelskie i praktyka demokracji | Poziom ≥1; wybrana komórka lub organizacja | Radykalizacja objętej komórki −3; jej następna kampania o demokracji w ciągu 6 M dostaje +0,10 do mnożnika z 5.3, najwyżej raz |
| Kadry związkowe i wyjaśnienie linii PPS | Poziom ≥2; wskazana branża zaakceptowała zakres | Zaufanie branży +3 i jej sprzeciw −4; nie nakazuje związkom poparcia odmiennej linii politycznej |
| Przygotowanie reformy społecznej | Poziom ≥2; istniejący projekt pracy, oświaty, mieszkalnictwa lub spółdzielczości | Pełne przygotowanie projektu (100) oraz skrócenie jego wykonania o 1 M, minimum 1 M; raz na projekt. Wymagany projekt duży jeszcze nieuruchomiony. Bez ustawy lub budżetu z automatu; nie obejmuje D ani konstytucji |
| Ogólnokrajowa kampania edukacyjna | Poziom 3 | Jak kurs praw obywatelskich, ale do trzech rozłącznych komórek zamiast jednej; nie mnoży ich ludności |

Kurs reformy nie blokuje wcześniejszego wdrożenia, ale jeżeli projekt ruszy przed jego ukończeniem, nie otrzyma wstecz skrócenia ani zwrotu kosztów. Podgląd uprzedza o utracie tej korzyści; przebudowa tej samej transzy nie odnawia użytego bonusu.

Kurs i podstawowy mnożnik kadry mają różne zastosowania: pierwszy wykonuje wybrane zadanie, drugi pomaga w rozbudowie organizacji. Premia kampanii jest jednym zużywalnym modyfikatorem, nie dodaje się ponownie co miesiąc. `tur.prepared_campaigns=[]` zapisuje temat, odbiorców, termin wygaśnięcia i komórki, które już zużyły premię; ukończenie kursu dodaje wpis, nie odświeża aktywnego bonusu tej samej komórki. Nowa akcja Czapińskiego Socialist Education z 10.4 korzysta z działającego TUR, ale nie wykonuje automatycznie całego kursu i nie dodaje jego premii; zwykłe kursy nadal wymagają własnego czasu i kosztu. Powyższe użycie edukacji jest propozycją gry opartą na funkcji historycznego TUR, a nie twierdzeniem o liczbowej skuteczności jego działalności.

**K — etap 5 (0.46):** prasa (zasięg 30, wiarygodność 60, dziennik partyjny), TUR (od I 1923), spółdzielnie i aparat są w `S.party_orgs`. Format popularny daje efektywny zasięg +10, wiarygodność −5 i sprzedaż przy zasięgu ≥ 50; pierwsze przyjęcie daje Centrum +3 sprzeciwu z przyczyną odwracalną w E3. Ograniczenia prasy mają własne ID. Kurs TUR czeka w miesiącu bez finansowania; ukończony daje jednorazową premię kampanii 1,10 w komórce i temacie. Działająca spółdzielnia PPS jest wykonawcą wariantów spółdzielczych kart 8.5 i 8.9.

### 13.3. Rekrutacja, militaryzacja i przejście do AS

**Z — dwa podstawowe działania, następnie warunkowa reorganizacja.** `pps_militia_strength` to ludzie, `pps_militia_militancy` to sprawność 0–1, `pps_militia_stage` to 1 lub 2. Szkolenie i dyscyplina są treścią militaryzacji. Usuwamy osobną akcję i proponowany miernik dowodzenia Milicji; dowodzenie regularnej armii i policji z 16 pozostaje odrębne.

| Akcja P | Warunek | Koszt | Efekt |
|---|---|---|---|
| `militia.recruit` — rekrutacja | Organizacja aktywna i legalna; sfinansowane utrzymanie | 1 R, 1 T; cd 2 M | +100 ludzi, bez premii sprawności |
| `militia.militarize` — militaryzacja | Organizacja aktywna i legalna; sprawność <0,70 | 2 R, 1 T; cd 3 M | `militarized=true`; sprawność +0,10, maksymalnie 0,70; możliwe dalsze etapy również po AS |
| `militia.as` — utworzyć AS | Wszystkie warunki poniżej | 2 R, 1 T; jednorazowo | Etap 2; posłuch członków +0,15 oraz do trzech równoczesnych akcji przed zamachem zamiast jednej (Z, 0.26, M15) |

```js
canFormAS =
  stage === 1 && militarized && strength >= 500 &&
  !banned && !repressed &&
  resources >= 2 + 3*prospectiveMonthlyUpkeep &&
  arrears === 0;
```

„Silna Milicja” oznacza tu testowo co najmniej 500 członków po wcześniejszej militaryzacji. Liczba jest P. Nie ma dodatkowej ukrytej bramki dowodzenia. Rekrutacja sama nie wystarcza. Próg odblokowuje **opcję** AS, nie wykonuje jej automatycznie i nie cofa etapu po późniejszych stratach.

Utrzymanie: `0.10*ceil(strength/200)` R/M, po AS dodatkowo 0,10 R. Przed nową rekrutacją/militaryzacją musi wystarczyć na jej koszt oraz 3 M przewidywanego utrzymania, bez zaległości; jest to kontrola rezerwy, nie jej pobór z góry. Utworzenie AS nie powiela ludzi i nie dodaje darmowej sprawności. Trzy przydziały nadal dzielą tych samych członków, fundusze i zmęczenie. **Z — 0.26 (M15):** przewagą AS jest koordynacja. Daje ona posłuch członków +0,15 (najwyżej 1) w każdym wezwaniu oraz do trzech równoczesnych akcji przed zamachem, według 13.4. Porozumienie ze związkami odbywa się w agendzie konkretnej akcji, nie jako dodatkowa opcja rozwijania Milicji.

Przykład P od stanu 200 / 0,10: trzy rekrutacje i jedna militaryzacja dają 500 / 0,20; piątym krokiem rozwoju można utworzyć AS. Łączny koszt tych działań to 7 R plus miesięczne utrzymanie i wymagana rezerwa (przy 500 członkach AS: 1,20 R na 3 M). To liczba kroków Milicji, nie gwarantowany piąty miesiąc kampanii; zbieranie środków, inne priorytety i odnowienia wydłużają drogę. Inwestycja w Milicję z 13.5 może wykonać jeden taki krok, lecz nie dwa naraz ani ominąć bramek.

Militaryzacja zwiększa zdolność do działania, nie dopisuje przemocy do spokojnego miesiąca. P — pierwsza militaryzacja wywołuje +3 sprzeciwu tylko w środowisku, które odrzuciło ten kierunek. **Z — 0.34:** tym środowiskiem jest Centrum, jak w obecnej polskiej karcie Milicji (K: `source/scenes/party_affairs/reichsbanner.scene.dry`, gdzie Centrum obawia się niekontrolowanej militaryzacji); Lewica nie dostaje premii. Historyczne stanowiska frakcji: `TBD — historical research required`; późniejsze etapy nie powtarzają tej samej reakcji bez nowego sporu. Użycie w konfrontacji ma osobne skutki wydarzenia. Wczesna AS pozostaje zatwierdzoną alternatywą, bez bramki roku 1934.

**K — etap 5 (0.46):** Milicja jest w `S.militia` (200 osób, sprawność 0,10, etap 1). Rekrutacja i militaryzacja mają koszty i bramki tej sekcji z rezerwą 3 M utrzymania; pierwsza militaryzacja daje Centrum +3 sprzeciwu. AS można utworzyć od 500 osób po militaryzacji, z pieniędzmi, legalnością i bez zaległości. Karta `polish_party_militia` zastępuje „PPS Self-Defence”; nie ma w niej współpracy ze związkami ani rozwiązania oddziału. Zakaz i represje przyjdą w etapie 7.

### 13.4. Użycie i straty

```js
availablePeople = strength - committedElsewhere - unavailablePeople;
effectiveCompliance = stage === 2 ? min(1, compliance + 0.15) : compliance; // M15
effectiveMilitiaF = (availablePeople/100) * militancy *
                   effectiveCompliance * (1-fatigue/100);
```

100 członków przy pełnych wszystkich mnożnikach daje 1 F w testowym przeliczeniu. Jest to abstrakcja balansu, nie historyczny przelicznik robotników na żołnierzy.

Niedofinansowane utrzymanie zwiększa zmęczenie o 5 miesięcznie. Miesiąc pełnego opłacenia bez użycia obniża je o 5, do zera. Straty w ludziach są całkowitoliczbowe; usuwają również ich przypisania.

`assignments` zapisuje ludzi do ochrony, łączności albo konfrontacji. Suma przydziałów nie przekracza stanu. `overlap_with_rail` w profilu wskazuje osoby o obu rolach; nie można równocześnie użyć ich jako załogi kolejowej i pełnej siły Milicji. Samo członkostwo w związku nie dopisuje osób do Milicji.

**Z — 0.26 (M15): jedna akcja Milicji, do trzech akcji AS.** Milicja (etap 1) obsługuje w danym czasie jedną sprawę. Przed zamachem jest to jedna chroniona akcja lub miejsce, w zamachu jedno zadanie z 16.8.3. Druga równoczesna potrzeba zostaje bez jej ochrony.

AS (etap 2) obsługuje przed zamachem do trzech równoczesnych spraw. Silnik przydziela ludzi w kolejności spraw w wydarzeniu:
- każda sprawa dostaje siłę do pełnego efektu ochrony z 16.5, czyli 40% przy 4 F;
- reszta przechodzi do następnej sprawy, a trzecia dostaje całą pozostałość;
- czwarta sprawa nie jest obsługiwana.

Gracz nie wybiera przydziałów. Przykład: przy dwóch sprawach Milicja 8 F chroni je w 40% i 0%, a AS 8 F w 40% i 40%. AS 3 F daje 30% i 0%, więc mała AS działa jak Milicja. Premia posłuchu działa najmocniej przy słabym nastawieniu organizacji do linii: ×1,18 przy nastawieniu 50, ×1,21 przy 20, bez zmian przy pełnym posłuchu. Diagnostyka: [analysis/m15-as-benefit/REPORT.md](../analysis/m15-as-benefit/REPORT.md).

**K — etap 5 (0.46):** jedną akcję ochrony w miesiącu i jej przydział liczy `PolishParty.allocateProtection` według przykładów z 21.1 („Jedna akcja Milicji”, „Mała AS i czwarta sprawa”). Użycie w zamachu i straty przyjdą w etapie 7.

**K — etap 7 (0.48):** w zamachu Milicja ma jedno zadanie i ludzi wolnych od innych spraw (ochrona strajku ich zajmuje): wykonuje `round(dostępni × posłuch)`, z premią AS +0,15, a siła to `wykonujący/100 × sprawność × (1 − zmęczenie/100)`. Straty w walce liczy ten sam udział co straty zgrupowań, zaokrąglony raz. Ochrona zgromadzenia po zabójstwie (B4) kosztuje 0,5 R i zmniejsza narażenie o min(0,40; 0,10 × siła).

### 13.5. Karta organizacji: do dwóch inwestycji w jednej akcji

**Z — wybieramy maksymalnie dwie różne organizacje.** Jest to przyjęty wyjątek od domyślnego jednego wariantu karty, nadal z jednym kosztem czasu. Poniższe opcje przekierowują do istniejących działań; nie tworzą drugiego systemu darmowych premii:

| Organizacja | Wybór jednego pakietu w tej organizacji | Koszt i rezultat P |
|---|---|---|
| Związki | Rozbudować jedną branżę **albo** zasilić jej fundusz | 1 R: zasięg +15 z modyfikatorami albo przelew 1 R do funduszu; 14.1 |
| Prasa | Rozszerzyć dystrybucję | 1 R: +10 zasięgu; 13.2 |
| TUR | Rozpocząć kolejny etap sieci | 2 R: budowa 2 opłacone M; bez natychmiastowego ukończenia, 13.2 |
| Milicja | Rekrutować **albo** militaryzować | Odpowiednio 1 R/+100 ludzi albo 2 R/+0,10 sprawności; wszystkie bramki 13.3 |
| Spółdzielczość / samopomoc | Przygotować mały projekt dla określonych odbiorców | 1 R: przygotowanie; uruchomienie później w agendzie za 2 R i 1 T, 17.2 |

**Z — 0.34:** nie ma płatnej opcji „zachować środki”. Zamknięcie karty bez wyboru jest bezpłatne, a karta zostaje w ręce. Anulowanie podglądu pozostaje bezpłatne. Jedna organizacja nie może zająć obu miejsc; np. rekrutacja i militaryzacja nie są dwiema różnymi organizacjami.

`ActionTxn.selected_options` zawiera 1–2 unikalne organizacje i najwyżej jedną podakcję każdej. `selection_limit=2`; łączny koszt R jest sumą pakietów. Wszystkie bramki, daty dostępności i odnowienia weryfikujemy na stanie sprzed transakcji. Najpierw zatwierdzamy cały wykonalny pakiet, potem pobieramy sumę R i 1 T, a następnie zapisujemy efekty i odnowienia. Brak środków blokuje całe zatwierdzenie, zamiast wykonywać tańszą połowę bez zgody. Rezerwa utrzymania Milicji jest sprawdzana po wszystkich jednorazowych wydatkach pakietu.

Podakcje korzystają ze wspólnych ID i odnowień niezależnie od wejścia przez tę kartę, kartę Milicji lub media. Jednorazowy wyjątek to dokładnie wskazane przekierowanie doradcy z 10.4.4, zużywające wspólne odnowienie doradcze; po wykonaniu podakcja dostaje zwykłe odnowienie. Nie pobieramy drugi raz T za podmenu. AS pozostaje osobną reorganizacją po przygotowaniu — nie można kupić rekrutacji i AS w tej samej transakcji. Mały projekt już przygotowany nie daje kolejnej nagrody; jego dalszy etap ma agendę. Karta organizacji ma testowo cd 2 M; odnowienia wybranych podakcji również obowiązują. Doradca może zastąpić koszt czasu pojedynczego etapu, zgodnie z 10.4, ale nie całego dwuelementowego pakietu.

Przykład: **prasa + TUR = 3 R i jedna główna akcja**, +10 zasięgu prasy teraz oraz rozpoczęcie budowy TUR. Nie daje to dwóch ukończonych organizacji, darmowego kursu ani kolejnej tury. TUR przed swoją datą dostępności jest zablokowany. **Związki + Milicja** pozwalają przygotowywać nacisk pracowniczy i ochronę równolegle, kosztem utrzymania obu.

**K — etap 5 (0.46):** karta Organizacje (`polish_party_organizations`, 5.1 katalogu) ma 12 pakietów: rozbudowa i fundusz każdej z trzech branż, dystrybucja prasy, TUR, rekrutacja i militaryzacja Milicji, spółdzielnia robotnicza i wiejska. Jedna akcja obejmuje do dwóch różnych pakietów z sumą kosztów; nic nie jest pobierane przed potwierdzeniem. Pakiety dzielą odnowienia z kartami Milicji i Media.

## 14. Związki, strajki i ugody

Z — decyzja o charakterze protestu należy do wydarzenia, przede wszystkim 17.5; nie ma osobnej powtarzalnej karty „strategia związkowa”. Rozbudowa i fundusz są wariantami Organizacji PPS z 13.5. Uzgodnienie żądań, rozpoczęcie oraz zakończenie konkretnej akcji pozostają w jej agendzie; poniższe akcje są etapami tych spraw.

### 14.1. Stan branży

`UnionBranch` ma: `id,reach,readiness,trust,autonomy,dissent,fatigue,fund,alignment,agreements,strike`. Oceny są 0–100; fundusz w R. Wskaźnik zasięgu nie jest historyczną liczbą związkowców. `dissent` i `fatigue` zaczynają od 0.

| Akcja | Koszt P | Zmiana |
|---|---|---|
| Rozbudowa komórek | 1 R, 1 T; 2 M odnowienia | Zasięg +15 |
| Uzgodnienie postulatów i końca akcji | 1 T; 2 M | Gotowość +15; zapis celu i warunków zakończenia |
| Przekazanie funduszu | 1 R, 1 T | Kasa PPS −1; fundusz branży +1 |
| Wspólne zebranie o linii politycznej (`union.align`, Z — 0.34) | 1 T | Alignment wybranej linii +15 po przyjęciu porozumienia |
| Mediacja sporu z kierownictwem | 1 T | Sprzeciw −8, jeśli uzgodniono konkretną zmianę |
| Rozpoczęcie protestu | 1 T, uzgodniony cel | Utworzenie rekordu strajku; późniejsze koszty z funduszu |

Fundusz otrzymuje testowo `min(0.30,0.05*reach/20)` R miesięcznych wpływów własnych i płaci 0,02 R zwykłego utrzymania. Są to pieniądze organizacji, których PPS nie może dowolnie pobrać z powrotem.

**K — etap 5 (0.46):** decyzja 2A etapu 5: `S.unions` ma trzy branże (przemysł, kolej, praca rolna) z zasięgiem 20, zaufaniem 50, autonomią 60, nastawieniem do legalnych instytucji 50 i miesięcznym funduszem 0,50/0,25/0,25 R zasilanym w księdze partii. Rozbudowa branży działa w karcie Organizacje, w pracy organizacyjnej, w akcji Arciszewskiego i w kursie kadr TUR. Gotowość, spory, strajki, ugody i osłony Grabskiego przyjdą w etapie 6. Status pokazuje trzy branże zamiast „Affiliated trade unions”.

**K — etap 6 (0.47):** kroki sporu są w stałej karcie „Trade Unions” (`polish_union_agenda`), osobno dla trzech branż: uzgodnienie postulatów ograniczonych (płace, próg 40) albo szerokich (płace i warunki, próg 60) z gotowością +15 i cd 2 M, zebranie o linii strajku albo uzgodnionego końca (+15 nastawienia), mediacja (sprzeciw −8 przy otwartej przyczynie) i rozpoczęcie protestu. Każdy krok 1 T, 0 R. Linie `strike` i `agreed_end` zaczynają od 50 (P). Fundusz branży rośnie w punkcie 4 o min(0,30; 0,05 × zasięg/20) − 0,02 R.

### 14.2. Potencjał akcji

```js
effectiveReadiness = readiness * (1-fatigue/100);
participation = reach * (effectiveReadiness/100) * compliance;
monthlyStrikeCost = 0.10 + 0.01*participation;
fundAdequacy = min(1, fund/(2*monthlyStrikeCost));
crediblePressure = participation * fundAdequacy;
```

Przed strajkiem używamy dwumiesięcznej zdolności utrzymania. Po rozpoczęciu `fundCoverage=min(1,fund/monthlyStrikeCost)`, a aktywne uczestnictwo to `participation*fundCoverage`. Pobieramy najwyżej faktyczną zawartość funduszu; nie przeliczamy ponownie ceny z obniżonego uczestnictwa w tej samej rundzie. Ujemny fundusz jest niedopuszczalny. Przychód i utrzymanie branży rozliczamy przed tym poborem raz na miesiąc.

Wysokie niezadowolenie bez przygotowanej organizacji może wywołać spontaniczny protest. Nie daje PPS `compliance=1`. Osobny `uncontrolled_participation` zwiększa zakłócenie i ryzyko starć, ale nie siłę realizującą instrukcję kierownictwa.

**K — etap 6 (0.47):** udział = zasięg × gotowość × (1 − zmęczenie/100)/100 × posłuch linii strajku z 10.3; koszt miesiąca 0,10 + 0,01 × udział R. Przed strajkiem wiarygodny nacisk to udział × min(1, fundusz/(2 × koszt)); w strajku aktywny udział miesiąca plus dotrzymany wkład partnera, najwyżej 100. Fundusz płaci raz w miesiącu; przy niepełnym pokryciu udział spada w tej samej proporcji, a sprzeciw rośnie o 3 (P).

### 14.3. Rekord i fazy

`Strike`: `id,branches,demands,threshold,started_at,status,participants,uncontrolled_participation,cost_paid,disruption,offer,termination_terms,outcome,last_processed_time,communist_cooperation`. Ostatnie pole zaczyna jako null, potem zawiera wariant, warunki i referencję do próby z 9.6; uczestnicy pozostają rozłączni.

Fazy: `prepared → negotiating → active → settlement_pending → ended`. Możliwe końce: `agreement|exhausted|repressed|withdrawn|uncontrolled`.

Każdy aktywny miesiąc pobiera fundusz raz i aktualizuje uczestnictwo. Odpowiedź na przedstawioną ofertę nie pobiera kolejnego miesiąca. Kontynuowanie przenosi sprawę do następnego rozliczenia, nie tworzy nieskończonej pętli darmowych prób negocjacji.

**K — etap 6 (0.47):** rekord strajku w `S.strikes.records` (`strike-<n>-t<t>`) ma branże, żądania i próg, fazę (`prepared`, `negotiating`, `active`, `settlement_pending`, `ended`), udział i pokrycie, koszt, zakłócenie, rundy z zapisanymi rzutami, ofertę, ugody, reakcję władz, starcia, ochronę, kroki i wynik (`agreement`, `exhausted`, `withdrawn`). Aktywny strajk kończy się wyczerpaniem przy łącznym udziale poniżej 0,5; strajk bez poparcia PPS kończy się w rozliczeniu tego samego miesiąca.

### 14.4. Oferta i rozstrzygnięcie

```js
negotiatingPressure = 0.50*crediblePressure +
                      0.30*sectorImportance +
                      0.20*governmentFragility;
successChance = clip(0.50 + (negotiatingPressure-demandThreshold)/100,
                     0.05, 0.95);
```

Testowe `sectorImportance`: przemysł 60, kolej 90, praca rolna 40. **Z — 0.24 (M12):** `governmentFragility` czyta rzeczywiste poparcie gabinetu i spory, nie autorytet Sejmu:

```js
governmentFragility = cabinet.status === "caretaker" ? 100 :
  clip(50 - (supportSeats - 222) + 0.5*maxAgreementTension, 0, 100);
```

`supportSeats` to mandaty sejmowe partii gabinetu i partii z obowiązującym podpisanym wsparciem, czyli ten sam zbiór co odpowiedzialność `r>0` w 5.6. `maxAgreementTension` to najwyższe `tension` z 9.2 wśród wiążących umów tego gabinetu. Przykłady:
- 232 posłów bez sporów: 40;
- 279 posłów: 0;
- gabinet mniejszościowy, 200 posłów: 72;
- 232 posłów przy napięciu 60: 70.

Autorytet Sejmu nie wpływa na rokowania strajkowe; nadal działa na demokrację i presję (15.2–15.3). Bez drugiego uznaniowego bonusu. Progi żądania P: ograniczone 40, szerokie 60, strukturalne 80. Gdy ustępstwo nie ma legalnego lub materialnego wykonawcy, nie losujemy „sukcesu” niemożliwej oferty.

Wynik losowania dotyczy przyjęcia określonej oferty w tej instancji. Ponowne otwarcie menu nie zmienia go. Inna wykonalna oferta może mieć inny próg, ale korzysta z tego samego zapisanego wyniku niepewności danej rundy.

Aktywne zakłócenie branży wynosi `min(100,activeParticipation+uncontrolled_participation)*sectorImportance/100`, przy rozłącznych uczestnikach akcji kontrolowanej i niekontrolowanej. Wagi 0,5/0,3/0,2 określa 17.4; brak aktywnego protestu daje zerowe zakłócenie.

**K — etap 6 (0.47):** jedna runda na miesiąc aktywnego strajku bez otwartej oferty, z jednym zapisanym rzutem `strike:<id>:round:<n>`: nacisk = 0,5·wiarygodny + 0,3·znaczenie (60/90/40) + 0,2·kruchość, szansa = clip(0,5 + (nacisk − próg)/100, 0,05, 0,95), przy kilku branżach najmniejsza. Gdy pełna oferta nie przechodzi, oferta tylko płacowa czyta ten sam rzut przy progu 40. Żądanie dymisji (próg 80) nie ma wykonawcy: odmowa bez rzutu, potem wraca próg 40. Zgoda związku według 17.4; pełna oferta jest zawsze przyjęta, czerwona linia „bez represji wobec strajkujących” zawsze odrzucona. PPS odpowiada na ofertę w odpowiedzi Sejmu (17.5.1) za 0 T.

### 14.5. Koniec strajku nie kończy wykonania

**E6 — Uczestnicy odrzucają ugodę:** tylko gdy PPS rzeczywiście przyjęła konkretną ugodę, a wskazana grupa uczestników nie chce zakończyć akcji. Dwa wybory: **Podtrzymać ugodę i wezwać do zakończenia strajku** albo **Poprzeć dalszy strajk**. Pierwszy utrzymuje zobowiązanie i rozlicza posłuch: część uczestników może strajkować dalej bez poparcia PPS. Drugi utrzymuje mobilizację, jej koszty i ewentualne naruszenie przyjętej ugody; nie wymusza lepszej oferty. Reakcja radykalnych uczestników wynika z poparcia dla tych dwóch linii. Brak trzeciej opcji renegocjacji. Jedna E6 na `strike_id + settlement_id`, bez ponawiania tej samej odmowy jako osobnej sceny komunistów E7. **Z — 0.38:** ID karty to `society.strike_settlement_rejection`, a para `strike_id + settlement_id` jest jej `instance_key`. Zapis reakcji nie rozlicza ponownie wcześniejszego podpisania ugody.

**Z — 0.24 (M12):** zgoda organizacji z 17.4 rośnie z kosztem kontynuacji, a nie z pełnym funduszem. Koszt kontynuacji to brak pieniędzy albo zmęczenie, liczy się większa wartość. Oferta spełniająca wszystkie żądania zawsze uzyskuje zgodę, a naruszenie czerwonej linii zawsze ją blokuje. Przykład: połowa żądań i zaufanie 50 dają przy pełnym funduszu i wypoczętych strajkujących 40, czyli odmowę; przy pustym funduszu 60, czyli zgodę. Diagnostyka: [analysis/m12-strike-settlement/REPORT.md](../analysis/m12-strike-settlement/REPORT.md).

Przyjęta ugoda tworzy `Agreement` z odbiorcą, wypłatą/prawem i terminem. Zaprzestanie strajku nie ustawia jeszcze obietnicy jako wykonanej.

P — pierwsza pełna, rzeczywiście wykonana należna wypłata/korzyść ugody obniża **grievance jej odbiorców o 4**, raz na `settlement_id`. Przy częściowym wykonaniu nagroda czeka na wykonanie uzgodnionego zakresu. Podpis, każda kolejna rata i ponowne otwarcie menu nie dają kolejnego −4. Zapisujemy znacznik w istniejącym rekordzie ugody; pozostałe obowiązki nadal są kontrolowane. Ulga uzupełnia dotychczasowe −2 radykalizacji za skuteczne legalne rozwiązanie; nie kasuje ekspozycji na późniejsze bezrobocie ani represji.

Jeśli kierownictwo kończy akcję zgodnie z uzgodnionymi warunkami, zaufanie związku +5. Narzucenie końca bez spełnienia warunków: sprzeciw +10 i zaufanie −8. Kontynuowanie mimo wyczerpania funduszu zmniejsza uczestnictwo proporcjonalnie do pokrycia i zwiększa sprzeciw wobec linii; nie tworzy osobnej karty E ani ludzi z samej radykalizacji.

Reakcja policji jest osobnym działaniem instytucji. PPS w opozycji może żądać interwencji, negocjować lub chronić zgromadzenie własnymi środkami. Nie wybiera za ministra dowolnego polecenia państwowego.

**K — etap 6 (0.47):** ugoda `set-<strajk>-<n>` ma klauzule z wykonawcami i terminem t+1. Płace i warunki wykonują pracodawcy w punkcie 4 następnego rozliczenia; klauzule polityczne czekają na swojego wykonawcę (represja — MSW, militaryzacja — gabinet). Pełne wykonanie zapisuje raz ulgę −4 dla etapu 7. Branża zgodna z ofertą: zaufanie +5. Odmawiający: przy łącznie co najmniej 10 punktach udziału (razem z niezwiązaną częścią komunistów) karta E6, poniżej — koniec narzucony (sprzeciw +10, zaufanie −8). E6: utrzymanie ugody narzuca koniec odmawiającym, a część z nich strajkuje dalej bez PPS; poparcie dalszego strajku łamie ugodę (wiarygodność −5 raz, `breach:<ugoda>`).

## 15. Niezadowolenie, demokracja i presja na zamach

### 15.1. Miesięczna reakcja społeczna

Każda komórka elektoratu ma niezadowolenie i radykalizację. P — aktualizacja niezadowolenia:

```js
grievanceNext = clip(grievance +
  0.20*pos(100-realWageForCell)/10 +
  0.50*newUnemploymentExposure +
  2*missedPromisedPayments +
  3*repressionExposure -
  ongoingRelief - 0.30*pos(realWageForCell-100)/10, 0, 100);
```

Wskaźnik płac stosuje się do odbiorców wynagrodzeń. Wieś i bezrobotni używają pochodnych warunków z 11.6; pozostałe nieopisane komórki mają testowo 100 ze zmianami tylko przez jawny profil. Nie traktujemy każdego chłopa jako odbiorcy płacy przemysłowej. `missedPromisedPayments` odczytuje niewykonanie wymagalnej obietnicy osłony raz na okres, nie saldo pieniężnych zaległości; `ongoingRelief` uwzględnia mnożnik wykonania raz.

Jednorazowa ulga wykonanej ugody z 14.5 aktualizuje niezadowolenie odbiorców przed tym rozliczeniem; nie odejmujemy jej drugi raz w równaniu miesięcznym.

`newUnemploymentExposure` to wzrost narażenia na bezrobocie w tej komórce w pp; `missedPromisedPayments` i `repressionExposure` są skutkami z danego okresu. `ongoingRelief` pochodzi z wykonanych programów; nie obejmuje niewypłaconej osłony.

Radykalizacja P:

```js
radicalizationNext = clip(radicalization +
  0.05*pos(grievance-60) + 2*repressionExposure +
  2*uncontrolledViolenceExposure - 2*successfulLegalSettlement, 0, 100);
```

Nie ma równania „niezadowolenie = komunizm”. Konkretne partie pozyskują część niezadowolonych przez własną ofertę i zasięg. P — miesięczny odpływ od współodpowiedzialnego za niewykonanie ugrupowania wynosi najwyżej 0,5 pp danej komórki. **Z — 0.21 (M09):** dzielimy go na akceptowanych konkurentów proporcjonalnie do ich obecnego udziału w komórce, jak w 5.6; wcześniej nieokreślony „zasięg konkurentów” nie jest już potrzebny. Umowa określa udział odpowiedzialności PPS. Osobno działa miesięczny przepływ za warunki życia z 5.6; niezadowolenie nie jest jego wejściem.

**K — etap 7 (0.48):** niezadowolenie i radykalizacja są w komórkach (start 35 i 0). Co miesiąc działa równanie 15.1 z indeksem warunków: bezrobotni 65, wieś z 11.6, pracujący robotnicy i nowa klasa średnia — płaca realna, pozostali 100. Jednorazowe skutki projektów, instrumentów, strajków, zakładów i partii stosujemy raz, przed równaniem. Mapa branż na komórki (P): przemysł — pracujący robotnicy × 0,6, kolej — × 0,2, praca rolna — wieś × 0,2; jeden poziom osłon obejmuje trzecią część bezrobotnych, bieżąca ulga w komórce najwyżej 6. Niezadowolenie krajowe to średnia ważona masą komórek.

### 15.2. Autorytet parlamentu i demokracja

Autorytet Sejmu jest oceną wyników ostatnich dwunastu miesięcy:

```js
authority = clip(55 + 4*executedImportantLaws +
                 4*resolvedCabinetCrises -
                 6*failedFormationAttempts -
                 3*monthsWithoutOperationalCabinet -
                 5*unfulfilledParliamentaryCommitments +
                 1*stanceDefenses - 2*stanceCriticisms, 0, 100);
```

Liczniki obejmują unikalne istotne sprawy, nie każde kliknięcie małej poprawki. Zlicza je dziennik z datą, a nie niezależne pola dodające ten sam sukces dwa razy.

**Z — 0.22 (M10): jeden właściciel autorytetu.** `parliament_authority` jest wyłącznie odczytem tego wzoru z `S.politics.institutional_log`, zapisywanym w punkcie 6 z 4.2. Żadna karta ani wydarzenie nie zmienia go bezpośrednio; taki zapis jest błędem walidacji. Wpis ma `id,t,kind,source_id` i liczy się, dopóki `t > time-12`. Każdy licznik wzoru to liczba wpisów jednego rodzaju: `law`, `resolution`, `failure`, `gap`, `breach`, `stance_defense` i `stance_criticism`. Dwa ostatnie zapisuje odpowiedź na wystąpienie Piłsudskiego z 10.7, raz na ID wystąpienia. Wczytanie zapisu odtwarza odczyt z dziennika i nie dodaje wpisów.

Demokracja P zmienia się co miesiąc:

```js
democracyNext = clip(democracy +
  0.03*(authority-53) -
  0.02*pos(nationalGrievance-50) -
  2*newUnlawfulInstitutionalActs +
  1*newSuccessfulLegalDefenses, 0, 100);
```

Powodzenie prawicowego legalnego rządu także może zwiększyć wiarygodność procedur. Poparcie PPS i poparcie demokracji są rozdzielone.

**Z — 0.22 (M10): demokracja rośnie sama, ale mało.** Przy punkcie odniesienia 53 zwykły Sejm (autorytet 55) dodaje 0,06 punktu miesięcznie, około 0,7 rocznie; wcześniejsze 50 dawało 0,15. Szybciej demokracja rośnie, gdy instytucje działają lepiej niż zwykle, oraz przez jawne skutki doradców, reform i odpowiedzi B4/B5. Spada przy porażkach instytucji, wysokim niezadowoleniu i bezprawnych aktach. W archiwalnych przebiegach M02 demokracja w chwili próby wynosi 64,9–75,4 zamiast 70,5–79,0. Dwa składniki zdarzeń:
- `newUnlawfulInstitutionalActs` to nowa sprawa bezprawnej przemocy wobec instytucji lub przemocy antykonstytucyjnej, czyli rekord tworzący `activeInstitutionalEmergency` (8.8) i `democraticThreat` (10.6). Obejmuje zabójstwo prezydenta potwierdzone w `presidency.security_crisis`. Liczy się raz na ID sprawy, w miesiącu jej otwarcia. Próba zamachu ma własne skutki w F10+F11 (16.8.7) i nie jest tu liczona.
- `newSuccessfulLegalDefenses` to uchylenie restrykcji po potwierdzeniu jej bezprawności we właściwej procedurze: `limited_redress` (17.12.3), skarga otwarta przez `democratic_guarantees` (7.6) albo procedura z 12.7. Liczy się raz na `restriction_id`. B4 i B5 zachowują własne +2 i nie tworzą drugiego wpisu.

**Odczyt demokracji — Z, 0.22 (M10).** Przed zamachem demokracja ma dwa skutki: gotowość wojska do udziału w zamachu (16.1) i niewielki składnik presji (15.3). W trakcie próby czyta ją ugoda (16.6). Oferty 8.3, wybory i przepływ 5.6 nie czytają demokracji. Nie dodajemy osobnego miernika dla każdej grupy.

`violence` to ocena 0–100, początek 10. Nowy poważny epizod dodaje 10, lokalny 4; miesiąc bez nowej przemocy odejmuje 2. Ofiary i straty organizacji są zapisane osobno, nie wyliczane wstecz z tej oceny.

**K — etap 7 (0.48):** autorytet jest odczytem dziennika z 12 M (ustawa +4, rozwiązanie kryzysu +4, niepowodzenie formowania −6, luka −3, złamanie −5, obrona +1, krytyka −2); bezpośredni zapis jest błędem walidacji. Demokracja zmienia się co miesiąc o 0,03 × (autorytet − 53) − 0,02 × max(0, niezadowolenie − 50), −2 za nową sprawę przemocy wobec instytucji, +1 za uchyloną bezprawną restrykcję i o skutki jawne (B4, B5, reformy). Przemoc: poważny epizod +10 (starcie, zabójstwo, zamach), lokalny +4, miesiąc bez przemocy −2. Restrykcje mają profil prawny: represja wobec legalnego strajku i konfiskata prasy są bezprawne, a zakaz Milicji po przemocy jej członków w gabinecie represyjnym — legalny.

### 15.3. Presja polityczna na próbę

P — osobno zatwierdzamy pojedyncze skutki wydarzeń i miesięczne narastanie. `pressureAfterEvents` oznacza bieżący stan po zdarzeniach, nie drugi licznik.

```js
// Przy zatwierdzeniu zdarzenia, raz na ID jego skutku:
pressureAfterEvents = clip(pressure + personalConflictImpulse +
  chjeno1926Impulse - executedMilitaryAgreementRelief, 0, 100);

// Przy rozliczeniu miesiąca, raz na t; bez ponownego dodania tych impulsów:
pressureNext = clip(pressureAfterEvents +
  3*I(noOperationalCabinet) +
  2*I(authority < 40) +
  2*I(nationalGrievance >= 60) +
  2*I(unresolvedMilitaryCase) -
  2*I(newFulfilledCivilAgreement) +
  clip(0.01*(60-democracy), -0.5, 0.5), 0, 100);
```

`noOperationalCabinet` odczytuje rzeczywiste pełnienie obowiązków/brak czynnego gabinetu przy rozliczeniu okresu. Krótka wakancja zakończona powołaniem następcy w tym samym okresie nie daje dodatkowego +3. Ten sam dziennik aktualizuje autorytet z 15.2; nie dodajemy drugiej kary za samą dymisję.

**Z — 0.22 (M10): demokracja w presji.** Ostatni składnik czyta demokrację z początku okresu, przed jej aktualizacją w tym samym rozliczeniu. Przy demokracji 70 odejmuje 0,1 punktu miesięcznie, przy 50 dodaje 0,1, a przy 60 nic. Dla porównania otwarty spór wojskowy dodaje +2. W 144 archiwalnych przebiegach M02 zostaje wszystkie 96 prób, a każda przychodzi 1–3 M później. Przykład: Sejm bazowy, decyzje zbliżone do historycznych — VI zamiast IV 1926. To zatwierdzony, znany skutek decyzji; dat M02 nie dopasowujemy ponownie. Diagnostyka: [analysis/m10-authority-democracy/REPORT.md](../analysis/m10-authority-democracy/REPORT.md).

P — `unresolvedMilitaryCase` oznacza co najmniej jedną rzeczywistą otwartą sprawę wojskową: +2/M łącznie, nie od każdej sprawy. Sam brak stanowiska dla Piłsudskiego nie tworzy konfliktu. `newFulfilledCivilAgreement` jest prawdziwe wyłącznie przy pierwszym wykonaniu nowego istotnego obowiązku cywilnego: najwyżej −2/M, z identyfikatorem już nagrodzonego obowiązku. Nie przyznajemy ponownej ulgi za dalsze poprawne wypłaty. Umowa wojskowa otrzymuje własne jednorazowe −12/−25/−20 z 16.7, bez cywilnego −2 za ten sam skutek i bez dodatkowego −3/M. Przeglądy umowy pozostają obowiązkowe.

`personalConflictImpulse` wynosi zwykle 0, a P: +8 za faktyczne ostre zerwanie uzgodnionych warunków, rozstrzygnięty konflikt nominacyjny albo jeden publiczny epizod nacisku wojskowego opisany w 17.16.9. Ostatni wariant nie wymaga fikcyjnego złamania umowy: wymaga otwartej sprawy, kryzysu formowania, publicznego żądania i poparcia oficerskiego. Zwykła krytyka parlamentu ani sama odmowa oferty nie wystarczają. Wszystkie opisy tego samego epizodu mają wspólne ID skutku; nie sumujemy +8 za przemówienie i +8 za jego poparcie ani dodatkowego +8 za powrót gabinetu już rozliczony przez +20. `chjeno1926Impulse=20` raz w rozdziale za faktyczny powrót wcześniej rządzącego Chjeno-Piasta bezpośrednio po gabinecie stabilizacyjnym lub szerokim, przy nierozwiązanej sprawie wojskowej. Bez bramki miesiąca/roku; pierwsze powołanie tej konfiguracji nie spełnia warunku powrotu. Dokładny kontrakt i zapis: 17.16.11.

Skuteczny kompromis przed próbą odejmuje jednorazowo presję według wybranego wariantu 16.7 i rozpoczyna sprawdzanie jego wykonania. Jeśli równocześnie przyznaje wpływ na obsadę wojskową, zmienia odpowiednie jednostki — może obniżyć zamiar, a zwiększyć zdolność. Nie ma dodatkowego ogólnego −20 poza efektem tego wariantu.

Próba wymaga wszystkich bramek z rozdziału 16. P — presja 40 daje ostrzeżenie, 55 poważne zagrożenie, 65 jest jednym z warunków podjęcia próby. Spadek poniżej 65 po rozpoczęciu walk nie cofa zamachu; zmienia możliwość ugody. Zachowujemy te wartości po porównaniu przebiegów; nie dopisujemy brakujących punktów samą datą maja.

**K — etap 7 (0.48):** presja rośnie co miesiąc: +3 bez działającego gabinetu, +2 przy autorytecie poniżej 40, +2 przy niezadowoleniu ≥60, +2 przy otwartej sprawie wojskowej, −2 za pierwszy nowy wykonany obowiązek cywilny oraz clip(0,01 × (60 − demokracja), ±0,5). Impulsy raz na ID: publiczny epizod nacisku wojska +8 w pierwszym kryzysie gabinetowym przy otwartej sprawie wojskowej (wejście 1A), powrót Chjeno-Piasta +20, konflikt nominacyjny +8 i złamanie umowy z Piłsudskim +8. Ulgi umowy (−12/−25/−20) działają raz na umowę i kryzys.

**K — etap 8 (0.49):** presja startowa wynosi 0 (P; w I 1922 Piłsudski jest jeszcze Naczelnikiem Państwa). Publiczny epizod nacisku wojska (+8) przypada na pierwszy kryzys gabinetowy od XI 1925 przy otwartej sprawie, a sprawa wojskowa otwiera się w VII 1923 (17.16.3). +2/M i próg 65 bez zmian.

## 16. Policja, wojsko i rozstrzygnięcie zamachu

### 16.1. Jednostki i rozpoznanie

`Force`: `id,kind,base_strength_F,readiness,command,loyalty_legal,loyalty_pils,loyalty_neutral,available_from_phase,transport_route,rail_delay_cap,committed_side,losses_F,source_status`.

Lojalności mają sumę 1. Siła jest w F; gotowość i dowodzenie w 0–1. Żadna z tych liczb nie jest odziedziczonym `reichswehr_strength` pod nową etykietą.

Profil testowy używa technicznych grup `capital_legal,capital_pils,near_reserve,remote_reserve`. Ich historyczne nazwy, liczebności i daty pozostają B. Do sprawdzenia algorytmu wystarczają wartości P:

| Grupa | Siła F / gotowość / dowodzenie | Legalna / Piłsudski / neutralna | Dostępność |
|---|---|---|---|
| capital_legal | 45 / 0,80 / 0,80 | 0,90 / 0,05 / 0,05 | Faza 0 |
| capital_pils | 55 / 0,85 / 0,85 | 0,05 / 0,90 / 0,05 | Faza 0 |
| near_reserve | 25 / 0,70 / 0,70 | 0,30 / 0,50 / 0,20 | Faza 1 |
| remote_reserve | 35 / 0,70 / 0,70 | 0,50 / 0,25 / 0,25 | Faza 2; transport kolejowy, `rail_delay_cap=2` |

To syntetyczny układ porównawczy, nie odtworzenie wojsk maja 1926. Pozwala testować zmianę przewagi po dotarciu rezerw.

**Z — profil `synthetic_test_v2` (0.20, M08).** Lojalności bliskiej rezerwy 0,30/0,50/0,20 i odległej 0,50/0,25/0,25 zastępują wcześniejsze 0,35/0,45/0,20 i 0,70/0,15/0,15. Użytkownik zatwierdził tę zmianę, aby przy biernej PPS Piłsudski wygrywał w około 40–50% prób. To kalibracja testowa, nie dane historyczne. Pozostałe grupy mają `rail_delay_cap=0`. Oczekiwana zdolność rośnie z 36,2 do 38,1, więc bramka 30 i terminy prób z analiz M02 się nie zmieniają. Archiwalne udziały wyników zamachu w analizach M02 liczono na v1 i wcześniejszych regułach rund.

**Z — gotowość wojska a demokracja (0.22, M10).** Każdy odczyt lojalności używa lojalności efektywnej: zdolność 16.2, `initialStrikeForce` 16.8.1, rozpoznanie `S.security.known` i losowanie strony po F5:

```js
s = clip(0.0025*(democracy - 60), -0.10, 0.10);
effective = s >= 0
  ? { legal, pils: pils - min(s, pils), neutral: neutral + min(s, pils) }
  : { legal, pils: pils + min(-s, neutral), neutral: neutral - min(-s, neutral) };
```

Zapisane lojalności zgrupowań, ze skutkami nominacji i reformy kadrowej, pozostają bez zmian; przesunięcie jest pochodną bieżącej demokracji. Wyższa demokracja przesuwa część gotowych do udziału do neutralności, niższa — z neutralności do Piłsudskiego. Strona legalna się nie zmienia. Losowanie po F5 czyta demokrację z chwili ogłoszenia próby i zapisuje wynik raz. Przy demokracji 60 profil `synthetic_test_v2` jest dokładnie taki jak w M08. Przy biernej PPS Piłsudski wygrywa 46,4% prób przy demokracji 45, 43,8% przy 60 i 41,1% przy 75 ([diagnostyka](../analysis/m10-authority-democracy/REPORT.md)). To uproszczenie gry, nie teza o postawie oficerów w 1926 r.; historyczny związek pozostaje **TBD — historical research required**.

**K — etap 8 (0.49):** historycy różnią się w ocenie lojalności korpusu oficerskiego w 1926 r. (`PL-MAY-COUP-1926-COURSE`); związek z demokracją pozostaje uproszczeniem gry.

`S.security.known` przechowuje oszacowania, zakres niepewności i datę informacji. Rozpoznanie zawęża przedział, nie zwiększa faktycznej lojalności. Interfejs używa rozpoznanych danych do prognoz; nie ujawnia ukrytych prawdziwych wejść przez pozornie dokładne procenty.

**K — etap 7 (0.48):** `S.security.forces` ma cztery zgrupowania `synthetic_test_v2`. Każdy odczyt używa lojalności efektywnej z bieżącej demokracji, a losowanie po F5 — z demokracji chwili ogłoszenia próby. `S.security.known` zaczyna od ±30 pp wokół udziałów przesuniętych zapisanym rzutem `<grupa>:known`; ocena sił w agendzie partii (1 T, 1 R, cd 3 M) zawęża przedział o 10 pp, do ±5. Status pokazuje tylko przedział.

### 16.2. Zdolność i warunek próby

```js
expectedPilsF = sumForce(max(0,base_strength_F-losses_F)*
                        readiness*command*loyalty_pils*
                        expectedAvailability);
capacity = clip(100*(expectedPilsF/100)*logistics, 0, 100);

attemptAllowed = pressure >= 65 &&
                 capacity >= 30 &&
                 operationalWindow &&
                 !credibleStandDownAgreement &&
                 !attemptAlreadyActive &&
                 time >= nextAttemptAvailableAt;
```

`logistics` jest oceną 0–1, testowo 0,80; `expectedAvailability` wynosi 1 dla sił mogących dotrzeć w fazach kryzysu i 0 dla niedostępnych. Punkt odniesienia 100 F jest parametrem wyświetlania zdolności. Siła legalna jest pokazywana oddzielnie; ten miernik nie udaje prawdopodobieństwa zwycięstwa.

`loyalty_pils` oznacza tu lojalność efektywną z 16.1 (M10). W profilu syntetycznym zdolność wynosi 41,0 / 38,1 / 35,2 przy demokracji 45 / 60 / 75. Przy żadnym poziomie demokracji nie spada poniżej 30 (najniżej 31,4 przy przesunięciu o 10 pp), więc bramka zdolności nie zmienia terminów prób M02. Przesuwa je wyłącznie składnik demokracji w presji z 15.3.

W scenariuszu Normalnym `operationalWindow` jest niedostępne przed wiosną 1926 (P: od 1 III); później wymaga faktycznej dostępności sił i logistyki z 17.16.6. Powrót Chjeno-Piasta w 1926 może zwiększyć presję również przy niższej zdolności. Jest automatycznym zapisem stanu, bez dodatkowej sceny przygotowań B21. Wcześniejsze porozumienia są odczytywane normalnie; próba nie rozpoczyna się wbrew powyższym warunkom. Zwykłe działania parlamentarne i organizacyjne pozostają dostępne przed jej rozpoczęciem. Produkcyjne definicje `operationalWindow`, `credibleStandDownAgreement`, `attemptAlreadyActive` i `nextAttemptAvailableAt`: 16.8.1.

Po politycznym odwołaniu przygotowań — wyjściu z fazy `political_crisis` według 16.8.1 — następna nowa próba ma 3 M odnowienia i wymaga nowego sprawdzianu przyczyn. Gdy rozpoczęta próba zostaje rozliczona jako koniec rozdziału, nie planuje się jej drugiej kopii.

**K — etap 7 (0.48):** zdolność wynosi 38,1 przy demokracji 60 (41,0 i 35,2 przy 45 i 75) i nie spada poniżej 30. Bramki liczymy w punkcie 8 rozliczenia dla następnego miesiąca: presja ≥65, zdolność ≥30, okno od III 1926 z siłą gotową w fazie 0, brak działającej ugody chroniącej i aktywnej próby oraz upłynięte odnowienie.

### 16.3. Cywilny nadzór i policja

Działanie kadrowe wymaga właściwej kompetencji, wskazanego stanowiska i legalnej podstawy. P — poprawnie wykonana reforma daje wybranej grupie +0,05 lojalności legalnej, odjęte proporcjonalnie od pozostałych udziałów. Ograniczona reforma z karty parlamentarnej daje +0,025 (Z — 0.36, 17.10). Przy rzeczywistym wykonaniu nominacji jej gotowość spada o 0,05 na 2 M; znika wyłącznie ten czasowy modyfikator, bez cofania innych zmian gotowości. +8 presji wymaga odrębnie ustalonego konkretnego konfliktu według 15.3; samo użycie karty nie daje impulsu. Jedna reforma, jej zakres i moment wykonania: 17.12.4.

Nie można ulepszać dowolnej jednostki przez posiadanie samego resortu. Profil określa, które stanowiska podlegają danej decyzji. Cywilny nadzór i jego wariant kadrowy używają jednego projektu: dwa etapy po 1 T, 1 B przez 3 M wykonania, potem 0; przejście między kartą parlamentu a resortem nie tworzy drugiego +0,05 za ten sam zakres.

Policja ma `capacity,command,lawful_compliance,public_trust`, wszystkie 0–100, testowo 50. Wykonanie ochrony zgromadzenia zależy od kompetencji i `capacity*(command/100)*(lawful_compliance/100)`; nie od relacji z PPS. Prasa i Milicja mogą osłaniać własne działania, ale nie przypisują sobie państwowej policji. Zgodne z prawem wykonanie ochrony dodaje 3 zaufania publicznego, bezprawna represja odejmuje 8; jej jednostkowy wpływ na społeczeństwo zapisuje osobny rekord ekspozycji. Ukończona profesjonalizacja z 17.12.2 zmienia `command` i `lawful_compliance` o +10 (do 100), bez dodatkowej premii do wyniku ochrony lub `capacity`.

**K — etap 7 (0.48):** karta MSW `polish_gov_interior`: profesjonalizacja (1 B przez 3 M, raz w rozdziale), śledztwa przemocy skrajnej prawicy i komunistów (1 B przez 1 M; potwierdzone przypisuje sprawę partii, którą wskazuje profil sprawy), ochrona nazwanego zgromadzenia (+10 × wykonanie w miesiącu uruchomienia) i ograniczona autonomia. Kontrola cywilna to jeden projekt `army_control` dla syntetycznego stanowiska nad `near_reserve`: przygotowuje go karta Spraw Wojskowych albo karta Sejmu, a ustawę wnosi agenda. Pełny nadzór daje +0,05, ograniczona reforma +0,025 lojalności legalnej, raz na zakres; nominacja obniża gotowość o 0,05 na 2 M, a +8 presji daje tylko przy relacji z Piłsudskim poniżej 40 (P).

### 16.4. Fazy i zobowiązania PPS

```text
political_crisis
→ attempt_declared
→ pps_stance
→ organization_commitment
→ execution_and_transport
→ optional_compromise_or_automatic_rounds
→ resolved
```

Stanowisko F4: poparcie Piłsudskiego, obrona legalnego rządu albo neutralność. Robocze `support_pils|defend_legal|mediate` zachowujemy jako identyfikatory; `mediate` oznacza teraz neutralność, bez automatycznej mediacji. Zaangażowanie F5: `none|rail|militia|both`. Neutralność dopuszcza tylko `none` albo `militia` do ochrony własnych ludzi. Nie daje równocześnie blokady transportu na rzecz jednej strony.

Cel, skala i przydział wynikają z wybranej strony, profilu kryzysu, rzeczywistej sprawności oraz posłuchu organizacji z rozdziału 10. Gracz nie wybiera tras, jednostek ani kolejnych zadań. F6+F7 pokazuje jedno wspólne rozliczenie wykonania wezwania i transportu, bez decyzji. Cztery rundy z 16.6 są obliczeniami wewnętrznymi, nie czterema menu. Wykonanie wezwania, trasy i zadania określają 16.8.2–16.8.3.

Dla każdego zgrupowania losujemy raz stronę zgodnie z efektywnym rozkładem lojalności z 16.1 — po zatwierdzeniu F5, z demokracją z chwili ogłoszenia próby — i zapisujemy `committed_side`. Nie dzielimy tej samej jednostki między dwie strony, chyba że profil jawnie zawiera jej rozłam na podjednostki. Przed próbą używamy wartości oczekiwanej, po przydziale — rzeczywistej strony.

PPS nie wybiera stron wojska samą deklaracją. Jej wcześniejsze porozumienia mogą zmienić rozkład przed zapisaniem decyzji danej jednostki, jeśli profil przewiduje taki wpływ.

**K — etap 7 (0.48):** sekwencja `polish_event_coup` prowadzi F3, F4, F5, F6+F7, F9 i F10+F11 bez zużycia miesiąca; fazę zapisuje `S.coup.phase`, a wczytanie wznawia wskazaną stronę. F4 nalicza reakcje frakcji i pokazuje ryzyko rozłamu; neutralność dopuszcza tylko Milicję do ochrony własnych ludzi. Posłuch kolei i Milicji przy poparciu Piłsudskiego czyta odwrotność nastawienia do legalnych instytucji (P).

### 16.5. Kolej i wkład Milicji

Kolej opóźnia wskazaną trasę o jedną fazę, gdy aktywne uczestnictwo kolejarzy ≥40 i koordynacja ≥50. Druga faza opóźnienia wymaga odpowiednio ≥65 i ≥70. Transport alternatywną trasą zmniejsza efekt zgodnie z profilem jednostki; nie blokujemy wszystkich rezerw jednym ogólnym bonusem. Moment pomiaru, dobór zgrupowań i `rail_delay_cap`: 16.8.3.

Sprawność kolejarzy jest wyliczana z własnej organizacji i posłuchu. Wcześniejszy strajk może uszczuplić fundusz i podnieść zmęczenie; nie daje darmowej gotowości do każdej kolejnej akcji.

Milicja dodaje efektywną siłę z rozdziału 13 tylko do zadań, do których została rzeczywiście przydzielona. Ochrona cywilna zamiast walki zmniejsza narażenie chronionego wydarzenia o udział `min(0.40,0.10*assignedProtectionF)`. Nie dodaje jednocześnie tej samej siły do bilansu wojskowego. Łączna ochrona instytucjonalna i społeczna działa kolejno na pozostałe narażenie, a nie odejmuje dwukrotnie pełnej liczby ofiar.

**K — etap 6 (0.47):** `PolishUnions.railDelayPhases(udział, koordynacja)` daje 1 fazę przy ≥ 40 i ≥ 50 oraz 2 przy ≥ 65 i ≥ 70 (test „Kolej”); zamach odczyta ją w etapie 7.

**K — etap 7 (0.48):** zamach liczy kolej według 16.8.2–16.8.3: bazowy udział z zasięgu, gotowości, zmęczenia i posłuchu, koszt rundy równy ćwierci miesięcznego z funduszu branży (płacony tylko za rozegrane rundy) i aktywny udział każdej rundy. Opóźnienie sprawdza runda poprzedzająca przybycie.

### 16.6. Ugoda, walki i wynik

Każda runda używa aktualnych, dostępnych sił po decyzjach i transporcie:

```js
F_side = sum(availableCommittedStrength*readiness*command) + committedMilitiaF;
bargainScore_side = 0.40*costOfContinuing +
                    0.30*acceptabilityOfOffer +
                    0.30*trustInEnforcement;
settlement = everyRequiredSide(bargainScore_side >= 60) &&
             legalProcedureIsAvailable;
```

Oceny ugody są 0–100 i wynikają z profilu uczestników oraz treści oferty. Nie powstaje „kompromis konstytucyjny”, jeśli jego wykonanie wymaga instytucji, które już nie działają i nie zostały przywrócone.

`availableCommittedStrength=max(0,base_strength_F-losses_F)` wyłącznie dla zgrupowania już dostępnego i przypisanego do tej strony. Testowe składniki ugody: `relativeDisadvantage=100*opposingF/(ownF+opposingF)` (50, gdy obie siły są zerowe); `exhaustion=min(100,20*completedRounds+100*cumulativeLosses/max(1,initialCommittedStrength))`; `costOfContinuing=0.5*relativeDisadvantage+0.5*exhaustion`. `acceptabilityOfOffer` jest dopasowaniem programu z 8.1, przy nienaruszonych czerwonych liniach; profile stron i treść ofert określa 16.8.5. **Z — 0.20 (M08):** `trustInEnforcement=democracy`, bez nazwanego gwaranta; wcześniejszy składnik wiarygodności gwaranta usunięto. Ten profil umożliwia obliczenie ugody bez dowolnego ustawiania jej wyniku.

Jeśli ugody nie ma, testowy bilans końcowej fazy wynosi:

| Warunek P po wszystkich wyborach | Wynik |
|---|---|
| Przewaga Piłsudskiego według 16.8.4 i możliwe przejęcie celu politycznego | Zwycięstwo Piłsudskiego |
| Przewaga strony legalnej według 16.8.4 i możliwe przywrócenie kontroli | Zwycięstwo legalnego rządu |
| Zgoda stron na jedną z ofert 16.8.5 | Kompromis konstytucyjny |
| Wygrywa strona popierana przez PPS, wkład PPS był rozstrzygający, a jej warunki zapisano przed próbą (16.8.7) | Wariant zwycięstwa z ustępstwami |
| Brak zwycięstwa i ugody po 4 rundach i ocenie końcowej | Przedłużony konflikt — Z: koniec rozdziału z raportem przekazania (16.8.6, 19.1) |

Przy zerowej sile obu stron nie dzielimy przez zero i nie ogłaszamy zwycięstwa wojskowego. Przy braku siły jednej strony potrzebny jest nadal warunek politycznego wykonania rozstrzygnięcia. „Możliwość przejęcia celu” jest polem profilu kryzysu, nie ukrytą nagrodą za dowolny korzystny iloraz.

P — cztery rundy odpowiadają fazom dostępności 0–3 i są maksimum, nie obowiązkiem. Każda najpierw rozlicza przybycie sił, następnie ewentualną ugodę, a dopiero potem porównanie i straty. Zobowiązania PPS pochodzą z F5, bez nowych menu przydziału w kolejnych rundach. F9 może wystąpić najwyżej raz, wyłącznie przy istotnym udziale PPS (16.8.6); bez niego rundy i ugoda rozliczają się automatycznie.

**Z — 0.20 (M08):** kontrola celu wymaga przewagi >1,20 przez dwie kolejne rundy albo przewagi co najmniej dwukrotnej w jednej rundzie. W obu porównaniach siła przeciwnika obejmuje jego zgrupowania przybywające w następnej rundzie (16.8.4). Zastępuje to warunek 0.13 zakończenia co najmniej fazy 2, zachowując jego cel: nadchodząca rezerwa nie pozwala na przedwczesny wynik, a jej opóźnienie koleją może rozstrzygnąć walkę już po 2. rundzie. Startujemy bez serii przewagi; remis lub utrata przewagi zerują serię. Nie zwiększamy liczby rund ponad cztery ani liczby menu. Kontrola legalna oznacza przywrócenie zdolności działania legalnych władz, kontrola zamachowców — wymuszenie rozstrzygnięcia politycznego wskazanego w profilu. Nie jest to plan operacyjny ani historyczna mapa walk. `objective_access` wynika z jawnego stanu instytucji według 16.8.4. Wynik można zatwierdzić po zakończonej rundzie, gdy gracz nie ma już nierozstrzygniętej decyzji tej rundy. Opóźniona rezerwa nie jest doliczana do wcześniejszych walk.

Straty rundy P: `ownCommittedStrength*0.08*opposingF/max(1,ownF+opposingF)`. Straty Milicji przeliczamy osobno na zaangażowanych ludzi tym samym udziałem; zapisane straty nie są ponownie odejmowane przy wejściu do wyniku.

Straty F są rozdzielane między dostępne zgrupowania proporcjonalnie do ich pozostałej bazowej siły. Dla Milicji zaokrąglamy raz do najbliższej liczby całkowitej, ograniczonej liczbą rzeczywiście zaangażowanych ludzi; nie zaokrąglamy osobno każdej podsceny. Runda zakończona przyjętą ugodą nie nalicza hipotetycznych strat kolejnej walki.

Rundy nie są miesięcznymi turami. Nie naliczają pełnej miesięcznej gospodarki po każdym pytaniu. Koszt kryzysu dla gospodarki jest jednym zapisanym efektem z liczbą rund i zakłóceniem; straty oraz zobowiązania są kumulowane po rzeczywistych fazach.

P — po zakończeniu aktywnych walk: jednorazowa zmiana produkcji `-min(8,0.5*fightingRounds+0.02*meanCrisisDisruption)%` względem aktualnego poziomu; przy braku walk i zakłóceń 0. To efekt zakończenia kryzysu z jednym ID, odrębny od miesięcznej formuły strajku. Jeżeli dany okres zakłócenia został już rozliczony miesięcznie, nie wchodzi drugi raz do `meanCrisisDisruption`. Mobilizacja kolei na potrzeby kryzysu zużywa jedną czwartą miesięcznego kosztu na rundę, zapisuje pokrycie z funduszu i używa aktywnego uczestnictwa po tym ograniczeniu. Nie wytwarza dodatkowych czterech miesięcy składek.

**Zakaz wcześniejszego zamrożenia wyniku:** pole `outcome` pozostaje null do zakończenia ostatniej mającej skutek decyzji. Podgląd bilansu to prognoza, nie zapis zakończenia.

**K — etap 7 (0.48):** rundy, ugodę, straty i ocenę końcową liczy `PolishSecurity` według silnika z `analysis/m08-coup-profile/`. Dokładne przeliczenie 81 układów stron odtwarza tabelę 16.8.8 oraz liczby M10 i M15 (test „Profil M08 w silniku gry”). `outcome` pozostaje null do ostatniej decyzji, a rozstrzygnięcie zatrzymuje się tylko przy F9.

### 16.7. Konkretne ustępstwa wobec Piłsudskiego

**Z — jest to karta rządowa przed próbą zamachu.** W czasie rozpoczętego zamachu jedyną decyzją o przedstawionej ugodzie jest F9 z 17.15; zwykła karta nie omija jej bramki zaangażowania i nie odtwarza usuniętej F2. W trakcie próby te same ustępstwa występują jako oferty 16.8.5. P — `government.pils_agreement` otwiera ofertę, nie kupuje redukcji presji. Własna inicjatywa kosztuje 1 T, odpowiedź w aktywnym kryzysie 0 T; bez automatycznego kosztu R/B. Zwykła inicjatywa wymaga aktywnego gabinetu, udziału PPS w rządzie i właściwej kompetencji albo zaakceptowanego wykonawcy gabinetowego dla tej sprawy. Samo tolerowanie rządu lub stanowisko partyjne nie odblokowuje pełnej karty ustępstw. Linia `pils_influence` nie jest warunkiem karty, tylko ogranicza dostępne ustępstwa według 10.7 (Z — 0.33). Wymagane są zgoda Piłsudskiego, właściwy wykonawca i legalna procedura. Minimalna relacja jest tylko bramką: partner ocenia program, możliwość wykonania i naruszenia swoich warunków według 8.3. Testowy profil Piłsudskiego używa `army=-2`, `institution=-2`, pozostałych tematów 0, wag 1 oraz żądania rzeczywistej wskazanej funkcji o wadze 3. Odrzuca samo honorowe stanowisko bez uzgodnionego zakresu; jest to P, do kalibracji historycznej. Premierski kompromis może więc zostać przyjęty pomimo odmiennego ideału ustrojowego, jeśli pozostałe warunki dają wynik ≥60 i nie naruszają twardych granic.

| Ustępstwo | Warunek oferty P | Skutek wykonanej umowy P | Późniejszy rachunek |
|---|---|---|---|
| Powrót do określonej funkcji wojskowej pod cywilną kontrolą | Relacja ≥40; wskazane stanowisko, zakres nominacji, zgoda właściwych władz | Presja −12; relacja +4; sprzeciw Piłsudczyków −5 | Wykonane nominacje zmieniają tylko podległe grupy sił: do +0,05 udziału lojalności wobec Piłsudskiego. Raportowanie i granice kompetencji pozostają częścią umowy |
| Samodzielny inspektorat i większa swoboda nominacji | Relacja ≥60; przyjęta zmiana prawa ustalająca kompetencje | Presja −25; relacja +4; Piłsudczycy −8, Centrum +8 sprzeciwu, jeśli nie przyjęło tej linii | Alternatywa ustrojowa: w grupach objętych wykonanymi nominacjami do +0,10 udziału lojalności. Późniejsza kontrola cywilna musi zmienić lub respektować udzielone kompetencje |
| Premier Piłsudski na programie legalnego gabinetu | Relacja ≥65, przyjęty gabinet z 8.6, zgoda prezydenta i kandydata; partnerzy akceptują ten sam program | Po rzeczywistym powołaniu presja −20; relacja +4, Piłsudczycy −5 | Obowiązuje zwykła odpowiedzialność parlamentarna, budżet i umowa. Brak dodatkowej zmiany lojalności armii bez konkretnej decyzji kadrowej |
| Odmowa ustępstw i oferta cywilnego gabinetu | Brak minimalnej relacji; realny kandydat, bez podszywania się pod zgodę Piłsudskiego | Brak darmowej redukcji presji; dalsze formowanie według 8 | Pierwsze wykonanie nowego istotnego obowiązku cywilnego może obniżyć presję raz według 15.3; jawne złamanie wcześniejszej umowy nadal kosztuje |

`S.actors.pilsudski.agreement_id` wskazuje jedną aktualną umowę tego typu, początkowo null. Jej klauzule przechowują wariant i konkretne `force_ids`. Zmiana wariantu renegocjuje istniejące zobowiązanie; jednorazową ulgę presji stosujemy raz na kryzys, a nie sumujemy −12, −25 i −20 za trzy kolejne menu. Powtórne wykonanie tej samej nominacji nie podnosi lojalności. `delta=min(limit,1-loyalty_pils)` przenosimy proporcjonalnie z pozostałych dwóch udziałów, zachowując sumę 1; w zwykłym wariancie testowym dotyczy to wyłącznie `near_reserve` z 16.1. Szersza lista grup wymaga jawnego zakresu upoważnienia.

Jednorazowa ulga powstaje, gdy umowa zacznie być wykonywana, nie przy ogłoszeniu rozmów. `credibleCompromiseOperating=true` (w 16.2 i 16.8.1 ta sama wartość nosi nazwę `credibleStandDownAgreement`) tylko podczas zgodnego z prawem wykonywania jej wymagalnych klauzul, do umówionego przeglądu za 6 M; przedłużenie nie powtarza ulgi, a sam przegląd rozlicza 16.8.1. Zawiniony rozpad daje pojedynczy `personalConflictImpulse=+8` i otwiera sprawę faktycznie naruszonej klauzuli. Sam koniec okresu umowy bez naruszenia nie daje +8 i nie wznawia automatycznie zakończonej sprawy. Wygasa jednak jej ochrona przed próbą; nowy konflikt wymaga nowej rzeczywistej przyczyny. Respektowanie takiej umowy nie blokuje wszystkich pozostałych źródeł presji ani nie przesądza, po której stronie PPS stanie w rozpoczętym zamachu.

Premierostwo po przyjęciu propozycji przekierowuje do jednej procedury gabinetowej z 8.8; nie powołuje drugiego rządu i nie pobiera drugi raz T. Ocena Piłsudskiego jako kandydata w zwykłym formowaniu jest nadal parlamentarna; nadanie mu szczególnych uprawnień pozostaje wykonaniem rządowym. Obowiązkowa mediacja rozpoczętego zamachu z 16.6 pozostaje dostępna na swoich warunkach, nawet gdy PPS jest w opozycji; nie jest ukrytą drogą do swobodnego wydawania nowych uprawnień wojskowych.

H — spór o organizację naczelnych władz wojskowych jest historycznym tłem. Wczesny niezależny inspektorat i premierostwo na opisanych warunkach są świadomymi alternatywami, a nie twierdzeniem, że trzy identyczne oferty faktycznie złożono w tej kolejności.

**K — etap 7 (0.48):** karta `polish_gov_pils_agreement` wymaga PPS w aktywnym gabinecie ze Sprawami Wojskowymi i jest zamknięta w trakcie próby. Funkcja wojskowa wykonuje się od razu. Inspektorat — po wejściu w życie ustawy wniesionej w tej samej decyzji; odrzucona ustawa kończy ofertę bez ulgi i bez +8. Premierostwo czyni Piłsudskiego kandydatem najbliższego formowania i wykonuje się po jego powołaniu. Ulga, relacja +4 i reakcja Piłsudczyków działają raz na umowę i kryzys, a sprzeciw Centrum wobec inspektoratu także po zmianie wariantu (P). Przegląd po 6 M rozstrzyga rozliczenie ostatniego miesiąca umowy.

### 16.8. Profil F `coup_f_v1` — zatwierdzone rozwiązanie M08

**Z — zatwierdzone 24 IX 2026.** Ten podrozdział jest jednym kontraktem zamachu od bramek próby do raportu. Gdy 16.1–16.7, 17.15 lub 19.1 mówią inaczej, pierwszeństwo ma 16.8. Struktura i osiem zasad są Z; liczby, profile stron i skutki pozostają P do kalibracji w prototypie. Zgrupowania są syntetyczne. Historyczne jednostki, trasy, lojalności i przebieg mediacji w maju 1926: `TBD — historical research required`. Źródło decyzji: `PL-M08-COUP-PROFILE-2026-09-24`; diagnostyka: [analysis/m08-coup-profile/REPORT.md](../analysis/m08-coup-profile/REPORT.md).

**K — etap 8 (0.49):** badania 8f (`PL-MAY-COUP-1926-COURSE`) opisują siły, transporty, blokadę kolejową i mediacje maja 1926. Profil `synthetic_test_v2` zostaje: jego cztery grupy odpowiadają układowi z 1926 r. (podzielony garnizon stolicy, bliskie odwody, dalekie odwody dowożone koleją), ale nie jednostkom i liczbom, które źródła podają rozbieżnie.

| Zasada Z | Treść |
|---|---|
| 1. Start | Próba zaczyna się dopiero po spełnieniu wszystkich bramek 16.2 |
| 2. Decyzje gracza | F4 — stanowisko PPS, F5 — zaangażowanie organizacji; bez wyboru tras, jednostek i zadań |
| 3. Wojsko i kolej | Każde zgrupowanie raz losuje stronę; strajk opóźnia transporty kolejowe strony przeciwnej |
| 4. Rundy | Najwyżej 4. Zwycięstwo po dwóch kolejnych rundach przewagi >1,20 albo od razu przy przewadze ≥2; w obu przypadkach liczymy posiłki przeciwnika z następnej rundy |
| 5. Ugoda | Bez wyraźnej przewagi strony mogą przyjąć jedną z trzech ofert; decydują koszt dalszej walki, treść oferty i poziom demokracji |
| 6. Głos PPS | F9 tylko przy istotnym udziale PPS w walkach; odrzucenie zamyka drogę do ugody w tej próbie |
| 7. Brak zwycięzcy | `prolonged_conflict` po 4 rundach i ocenie końcowej; koniec rozdziału z raportem |
| 8. Ustępstwa | Zwycięzca spełnia warunki PPS tylko przy jej rozstrzygającym wkładzie |

Gracz widzi ostrzeżenie o kryzysie politycznym, F3, F4, F5, F6+F7, ewentualnie F9 oraz F10+F11. Pozostałe elementy są rozliczeniem silnika.

#### 16.8.1. Bramki i stan przed próbą

```js
// P — liczone przy każdym sprawdzianie bramek z 4.2 pkt 8; bez nowego miernika
initialStrikeForce = S.security.forces.some(f =>
  f.available_from_phase === 0 && f.loyalty_pils > f.loyalty_legal &&
  f.readiness >= 0.50 && f.base_strength_F - f.losses_F > 0);
operationalWindow = time >= windowFrom && initialStrikeForce; // Normalny: windowFrom = timeOf(1926,3) = 51

const a = S.agreements[S.actors.pilsudski.agreement_id];
credibleStandDownAgreement = !!a && a.status === "active" &&
  a.execution_started_at != null && time >= a.execution_started_at &&
  !hasOverdueClause(a) && !a.open_breach &&
  (a.variant === "pils_premier"
    ? S.cabinet.pm === "pilsudski" && S.cabinet.status === "active"
    : time < a.review_at);                 // review_at = execution_started_at + 6
attemptAlreadyActive = S.coup.attempt_id != null && S.coup.phase !== "resolved";
nextAttemptAllowed = time >= S.coup.next_attempt_available_at;
```

`credibleStandDownAgreement` i `credibleCompromiseOperating` z 16.7 to jedna wartość. W dniu przeglądu silnik ocenia przedłużenie na niezmienionych warunkach według 8.3 (≥60) i przy właściwej kompetencji wykonawcy. Przyjęte daje `review_at += 6` bez nowej ulgi presji; odrzucone — `expired`, bez +8 i bez wznowienia zamkniętej sprawy. W danych syntetycznych `initialStrikeForce` jest zawsze spełnione; znaczenia nabiera w profilu historycznym.

**K — etap 8 (0.49), A3:** dla kompromisu wykonywanego przez gabinet (postulat `military_compromise`, etap 8c) kompetentnym wykonawcą jest ten sam gabinet, dopóki rządzi. Wcześniej taka umowa zawsze wygasała przy pierwszym przeglądzie, bo przegląd sprawdzał tylko resort Spraw Wojskowych w rękach PPS.

Fazy `S.coup.phase`: `dormant → political_crisis → attempt_declared → pps_stance → organization_commitment → execution_and_transport → resolved`. Przy presji ≥55 („poważne zagrożenie” z 15.3) rekord przechodzi do `political_crisis`, widocznej jako ostrzeżenie. Jeżeli potem zacznie działać ugoda chroniąca albo presja spadnie poniżej 40, przygotowania zostają politycznie odwołane. Faza wraca wtedy do `dormant`, a `S.coup.next_attempt_available_at = t + 3` (początkowo 1). Skok presji w jednym sprawdzianie przechodzi przez `political_crisis` do `attempt_declared` bez dodatkowej sceny.

`capacity` z 16.2 używa `expectedAvailability=1` dla zgrupowań z `available_from_phase ≤ 3` i nie przewiduje opóźnień kolei. `S.security.known` zaczyna od przedziału ±30 pp wokół udziałów lojalności. Środek przedziału przesuwa zapisany rzut `<force_id>:known`, aby nie zdradzał prawdziwej wartości. `security.assess` zmniejsza promień o 10 pp, najwyżej do 5 pp; jest stałym działaniem agendy, zawsze dostępnym za 1 T i 1 R, z odnowieniem 3 M (Z — 0.35). Wszystkie odczyty lojalności w 16.8 — `initialStrikeForce`, `capacity`, rozpoznanie i losowanie — używają lojalności efektywnej z 16.1 (M10).

#### 16.8.2. Wykonanie wezwania — F5 i F6+F7

- Posłuch liczy istniejący wzór 10.3 dla linii F4 (`support_pils|defend_legal|mediate`). Milicja nie ma w rozdziale 1 osobnego sprzeciwu: `organizationDissent=0`.
- **Kolej.**
  - Bazowy udział: `railBase = rail.reach * rail.readiness * (1 - rail.fatigue/100) / 100 * railCompliance`.
  - Koszt rundy: `(0.10 + 0.01*railBase) / 4` R z funduszu branży.
  - Aktywny udział rundy: `railBase * min(1, fund/roundCost)`.
- **Milicja.** Wezwanie wykonuje `executing = round(availablePeople * militiaCompliance)` osób, co daje siłę `executing/100 * militancy * (1 - fatigue/100)` F. `militiaCompliance` obejmuje premię AS +0,15 z 13.4 (M15).
- **Losowanie.** Strony zgrupowań losujemy raz, po zatwierdzeniu F5 (`coup_<attempt_id>:<force_id>:allegiance`). Wcześniej F4 i F5 pokazują tylko prognozę z `S.security.known`.
- **F6+F7** pokazuje:
  - kto wykonał wezwanie;
  - strony zgrupowań;
  - planowane i rzeczywiste przybycia;
  - bilans rund do chwili F9 albo do końca walk.

#### 16.8.3. Trasy i zadania — przydział silnika

- **Kolej** opóźnia każde zgrupowanie strony przeciwnej wobec F4, które ma `transport_route="rail"` i przybywa w fazie ≥1.
  - Pierwszą fazę opóźnienia (aktywny udział ≥40 i gotowość branży kolejowej ≥50) sprawdzamy w rundzie poprzedzającej planowane przybycie.
  - Drugą fazę (≥65 i ≥70) sprawdzamy w rundzie poprzedzającej przybycie już opóźnione.
  - Wyczerpany fundusz kończy blokadę.
  - `rail_delay_cap` (0–2) w profilu zgrupowania wyraża trasę alternatywną; syntetycznie odległa rezerwa ma 2, pozostałe grupy 0.
  - Kolej nie przyspiesza przyjaznych transportów; neutralna PPS jej nie używa.
- **Milicja i AS** mają w F jedno zadanie.
  - Przy poparciu lub obronie — konfrontacja: siła dodana do popieranej strony i straty według 16.6.
  - Przy neutralności — ochrona własnych ludzi, bez siły w bilansie.
  - **Z — 0.26 (M15):** także AS ma w F jedno zadanie; jej przewagą jest posłuch +0,15 (13.4). Trzy równoczesne akcje dotyczą spraw przed zamachem. Przy obronie rządu AS z tymi samymi ludźmi co Milicja 4 F daje 4,7 F. Udział PPS jest wtedy istotny (F9) w 30,4% prób zamiast 6,2%.

#### 16.8.4. Rundy, zwycięstwo i ocena końcowa

Kolejność rundy bez zmian: przybycia → ocena ugody → porównanie → straty.

```js
// P — runda r = 0..3; nextArrivals(side, r): siła zgrupowań strony przybywających w rundzie r+1
const oppEff = F[opp] + nextArrivals(opp, r);
const crushing = F[side] > 0 && F[side] >= 2.0 * oppEff;    // koniec od razu, także po 1. rundzie
streak[side] = F[side] > 1.2 * oppEff ? streak[side] + 1 : 0;
const victory = objective_access[side] && (crushing || streak[side] >= 2);
```

`objective_access` ma strona zamachu, gdy atakowany gabinet urzęduje (czynny lub p.o.). Strona legalna ma go, gdy istnieje głowa państwa (prezydent albo zastępujący marszałek) oraz czynny lub p.o. gabinet. W rozdziale 1 obie wartości są zwykle prawdziwe.

Ocena ugody działa od rundy 2 (`completedRounds ≥ 1`). Strona z przewagą >1,20 w bieżącej rundzie nie przyjmuje żadnej oferty. Po stratach 4. rundy następuje **ocena końcowa**: jeszcze jedna ocena z `completedRounds=4`, bez przybyć, porównania, strat i menu; zasada przewagi już w niej nie działa. `trustInEnforcement = democracy`, bez nazwanego gwaranta. Pozostałe składniki 16.6 bez zmian.

#### 16.8.5. Trzy oferty ugody

Strony wymagane to obóz Piłsudskiego i strona legalna (głowa państwa oraz atakowany gabinet); przy istotnym udziale PPS także PPS przez F9. Profile P używają skali 8.6: tematy od −2 do 2 i żądania z wagą.

| Oczekiwanie | Piłsudski | Strona legalna |
|---|---|---|
| `army` | −2 | +2 |
| `institution` | −2 | 0 |
| Żądania o wadze 3 | rzeczywista funkcja (16.7); dymisja atakowanego gabinetu | pozostanie gabinetu |

| Oferta | Treść | Akceptowalność P / L | Wykonalność | Wykonanie i raport |
|---|---|---|---|---|
| `coup.offer.military_function` | Funkcja wojskowa pod cywilną kontrolą, jak wariant 1 z 16.7; `army` 0, `institution` 0; gabinet zostaje | 50 / 90 | Czynny lub p.o. gabinet z posiadaczem resortu wojskowego; głowa państwa | Nominacja w chwili ugody; umowa `agreement_id` z `force_ids` w raporcie |
| `coup.offer.inspectorate_law` | Samodzielny inspektorat, jak wariant 2 z 16.7; `army` −2, `institution` 0; gabinet zostaje | 56,3 / 80 | Jak wyżej oraz Sejm nierozwiązany | Zobowiązanie ustawowe z terminem w `continuation_requirements` |
| `coup.offer.cabinet_change` | Dymisja atakowanego gabinetu i premier akceptowany przez obóz Piłsudskiego, który obejmuje funkcję wojskową; `army` −1, `institution` 0 | 90,6 / 25 | Głowa państwa i kandydat z profilu (`TBD — historical research required`) | Dymisja w chwili ugody; powołanie według 8.8 w kontynuacji |

Akceptowalność to dopasowanie 8.1, w którym żądanie spełnione ma odległość 0, a niespełnione 4 × waga. Każda oferta obejmuje:
- powrót wojsk do garnizonów;
- amnestię i zakaz represji wobec uczestników;
- zachowanie Sejmu i kalendarza wyborów.

Przy istotnym udziale PPS dochodzi klauzula końca mobilizacji PPS. Spośród wykonalnych ofert, którym każda wymagana strona daje co najmniej 60, wybieramy tę o najwyższej najniższej ocenie; remis rozstrzyga kolejność tabeli. Ofertę przedstawia marszałek Sejmu jako mediator instytucjonalny (P). Przebieg historycznych prób mediacji: `TBD — historical research required`.

**K — etap 8 (0.49):** mediacja marszałka Sejmu ma oparcie historyczne: 12 V 1926 wieczorem pośredniczył Maciej Rataj. Odpowiednikiem `coup.offer.cabinet_change` jest rząd Kazimierza Bartla z 15 V 1926 (`PL-MAY-COUP-1926-COURSE`); tekst dla gracza nie ma już dopisku o kandydacie TBD.

#### 16.8.6. Głos PPS, odrzucenie i brak zwycięzcy

```js
// P — sprawdzane przy każdej ocenie ugody
ppsSignificant = (stance === "support_pils" || stance === "defend_legal") &&
  (railDelayedForceIds.length > 0 ||             // opóźnienie ustalone w tej lub wcześniejszej rundzie
   committedMilitiaF >= 0.10 * F[supportedSide]); // siła popieranej strony razem z Milicją
```

- **Kiedy F9.** Przy pierwszej ocenie, także końcowej, w której wybrano ofertę, a `ppsSignificant` jest prawdziwe. Zapis: `S.coup.f9={completed_rounds,offer_id,response}`.
- **Poprzeć** — ugoda w tej rundzie, wynik `constitutional_compromise`.
- **Odrzucić** — do końca próby, także w ocenie końcowej, nie ma już ugody; rundy biegną dalej z niezmienionym zaangażowaniem. Odrzucenie nie narusza umowy i nie zmienia reputacji. Ekran F9 ostrzega o tym przed decyzją.
- **Bez istotnego udziału** ta sama oferta zawiera się automatycznie, bez klauzuli PPS i bez F9. Neutralna PPS nie otrzymuje F9.
- **Z — `prolonged_conflict`.** Brak zwycięstwa i ugody po 4 rundach i ocenie końcowej kończy rozdział (19.1).
  - Raport przekazania zapisuje ostatni bilans, strony i straty zgrupowań, sporną podstawę władzy, stan organizacji PPS oraz `continuation_requirements: ["prolonged_conflict"]`.
  - Nie dodajemy rund ani rozstrzygnięcia niższym progiem.

#### 16.8.7. Wkład PPS, ustępstwa i skutki F10+F11

**Wkład kontrfaktyczny.** Po rozstrzygnięciu silnik powtarza tę samą próbę z zapisanymi rzutami, ale bez organizacji PPS: bez siły Milicji, bez opóźnień kolei i bez F9 (ugoda jest wtedy automatyczna). Wyniki porządkujemy według korzyści strony popieranej przez PPS: zwycięstwo > kompromis > przedłużony konflikt > zwycięstwo przeciwnika. `S.coup.pps_contribution` przyjmuje wartość:
- `decisive` — wynik z PPS jest lepszy niż bez niej;
- `accelerating` — wynik jest ten sam, ale zapada wcześniej;
- `none` — bez różnicy;
- `adverse` — wynik z PPS jest gorszy.

Porównanie jest deterministyczne; wczytanie zapisu nie liczy go inaczej.

**Zwycięstwo z ustępstwami.** Warunki muszą być spełnione łącznie:
1. wygrywa strona popierana przez PPS;
2. PPS wykonała udział większy od zera;
3. warunki PPS zapisano przed próbą — linią `pils_influence=conditional` z gwarancjami z 10.7 albo aktywną umową z tą stroną;
4. `pps_contribution=decisive`.

Wtedy warunki stają się zobowiązaniami zwycięzcy w `S.coup.concessions_to_pps` i `continuation_requirements`. W przeciwnym razie jest to zwykłe zwycięstwo, a warunki zapisujemy jako nieprzyjęte. Bezwarunkowe poparcie nie tworzy ustępstw nawet przy rozstrzygającym wkładzie.

**Skutki F10+F11 (P).**
- **Reakcje frakcji na F4.** Naliczane raz, przy zatwierdzeniu F4, w skali 10.1; F4 pokazuje je wcześniej w podglądzie razem z ryzykiem rozłamu.
  - Poparcie Piłsudskiego: Centrum +8 (+3, jeśli wcześniej przyjęto linię `support|conditional`; +12 przy złamaniu aktywnej obietnicy obrony legalności), Lewica +8, Piłsudczycy −5.
  - Obrona rządu: Piłsudczycy +8 (+12 przy złamaniu obietnicy poparcia), Centrum −3.
  - Neutralność: Piłsudczycy +3.
- **Rozłam bez decyzji E3.** Frakcja, której sprzeciw wskutek F4 osiąga co najmniej 60, traci w F10+F11 jednorazowo domyślny manifest E3: 40% frakcji, bez doradców. Przeliczenie według 10.2 (M16).
- **Relacje.**
  - Z Piłsudskim: +4 za poparcie i dodatkowe +4 przy wykonanym udziale; przy obronie rządu −4 i −4.
  - Z partiami atakowanego gabinetu — odwrotnie.
  - Neutralność nie zmienia relacji.
- **Instytucje** — jednorazowo w raporcie, według wag 15.2:
  - przemoc +10;
  - demokracja −2 za próbę;
  - dodatkowo −2 przy `pils_victory` lub `prolonged_conflict`;
  - +1, gdy legalny gabinet przetrwał (zwycięstwo legalne albo ugoda zachowująca gabinet).
- **Produkcja** — jednorazowy skutek z 16.6.

**Raport** zapisuje:
- wynik i ofertę;
- rekord F9;
- dziennik rund: siłę stron, przybycia, opóźnienia i serie przewagi;
- demokrację z chwili ogłoszenia próby i wynikające z niej przesunięcie lojalności (16.1);
- straty, zużyty fundusz kolei i ludzi Milicji;
- rzuty;
- `pps_contribution`, ustępstwa, skutki frakcyjne i relacje;
- `continuation_requirements`.

#### 16.8.8. Profil syntetyczny v2 i diagnostyka

`synthetic_test_v2` (16.1) zmienia tylko lojalności dwóch rezerw. Zdolność wynosi 38,1 (v1: 36,2), więc bramka 30 i terminy prób M02 się nie zmieniają. Poniżej dokładne przeliczenie 81 układów stron przy demokracji 60–75, z poparciem F9 tam, gdzie się pojawia:

| PPS | Piłsudski | Rząd | Kompromis | Brak zwycięzcy | Uwagi |
|---|---|---|---|---|---|
| Bez udziału | 43,8% | 21,7% | 34,5% | 0% | Ok. 72% zwycięstw po 1–2 rundach |
| Poparcie + strajk | 72,2% | 9,4% | 18,4% | 0% | F9 w 12,2%; wkład rozstrzygający w 28,4% prób |
| Obrona + AS 6 F | 39,7% | 36,0% | 24,3% | 0% | F9 w 24,3%; wkład rozstrzygający w 14,3% prób |
| Obrona + Milicja 1 F | 43,8% | 21,7% | 34,5% | 0% | Udział nieistotny: brak F9 |

Przy demokracji 45 i biernej PPS wyniki wynoszą 43,8 / 21,7 / 8,1 / 26,4%. Odrzucenie F9 przy poparciu i strajku daje brak zwycięzcy w 12,2% prób. To diagnostyka reguł na danych syntetycznych, nie wynik kampanii ani prognoza historyczna.

**0.22 (M10):** powyższe liczby pochodzą z lojalności bez przesunięcia. Od 0.22 lojalności zależą od demokracji (16.1). Przy demokracji 60 tabela obowiązuje bez zmian. Przy 45 bierna PPS daje 46,4 / 18,6 / 6,9 / 28,2%, a przy 75 — 41,1 / 24,9 / 33,9 / 0%. Pełne zestawienie: [analysis/m10-authority-democracy/REPORT.md](../analysis/m10-authority-democracy/REPORT.md).

**K — etap 7 (0.48):** kontrakt `coup_f_v1` jest wdrożony w `source/rules/polish_security.js`: bramki i kryzys polityczny (16.8.1), wezwanie (16.8.2), opóźnienia (16.8.3), rundy (16.8.4), oferty z wykonalnością (16.8.5), F9 i brak zwycięzcy (16.8.6) oraz wkład kontrfaktyczny, ustępstwa i skutki F10+F11 (16.8.7). Warunki PPS do ustępstw to linia warunkowego poparcia albo aktywna umowa ze wspieraną stroną. Rozłam bez E3 obejmuje 40% frakcji, której sprzeciw po F4 wzrósł do co najmniej 60. Ugoda: funkcja wojskowa tworzy umowę 16.7 z nominacją, inspektorat — zobowiązanie ustawowe w kontynuacji, zmiana gabinetu — dymisję i formowanie w kontynuacji. Spadek produkcji liczy strajk kolejowy jako zakłócenie kryzysu (P).

## 17. Kontrakty kart i manifest wydarzeń

### 17.1. Minimalny rekord działania

`ActionDefinition` zawiera `id,pool,available_if,disabled_reasons,cost_R,cost_B,time_cost,cooldown_scope,cooldown_months,effects,followup,source_status,selection_limit,option_ids`. Domyślnie `selection_limit=1`, dla programu gospodarczego 3, organizacji 2. Wybrany zestaw trafia do `ActionTxn.selected_options`; stan roboczy podmenu nie wykonuje żadnych skutków. Są to proponowane identyfikatory, nie nazwy już istniejących scen Dendry.

`available_if` decyduje, czy temat istnieje. `disabled_reasons` wyjaśnia, dlaczego konkretnej opcji nie można teraz wykonać. Rozpoczęty projekt pozostaje w agendzie nawet po utracie resortu; pokazuje blokadę, zamiast znikać z gry. Zakończona obowiązkowa scena nie wraca do talii jako nowe, ponownie nagradzane wydarzenie.

W tabeli `1 T` oznacza jedyną główną akcję miesiąca, `0 T` — etap tej samej transakcji, obowiązkową odpowiedź lub przegląd. `cd` jest odnowieniem po wykonaniu, nie po obejrzeniu. `wg projektu` odsyła do rozdziału 12; nie upoważnia do dowolnie ustalonej ceny. Doradca może zastąpić wyłącznie wskazany koszt czasu, a nie zasoby, ustawę albo warunki wykonawcy.

### 17.2. Katalog podstawowych działań P

| ID / pula | Warunki i koszt | Zapisany skutek |
|---|---|---|
| `party.fundraise` / agenda finansów PPS | 1 T; cd 3 M; bez kosztu R | Nadzwyczajna zbiórka: +`dues*member_index/100` R; rozdział 13.1 |
| `party.organize_without_funds` / agenda | 1 T, 0 R | +2 zasięgu jednej branży albo +2 `base_reach_pps` komórek jednej klasy (Z — 0.34); bez prasy i TUR, bez wzrostu funduszu |
| `party.apparatus` / agenda finansów PPS | 1 T, 2 R; poziom <4 | +1 poziom: wpływy +0,15 × członkostwo/100 i koszt +0,10 R/M (M18) |
| `party.campaign` / partia, karta Media | 1 T, 1 R; cel społeczny i temat | Przesunięcie preferencji według 5.3, ze śladem nasycenia |
| `party.turnout` / partia, karta Media | 1 T, 1 R | +0,04 frekwencji wskazanej komórki, do 0,90; wygasa po wyborach |
| `party.press_distribution` / partia | 1 T, 1 R; cd 2 M | Zasięg prasy +10, do 100 |
| `party.press_investigation` / partia, karta Media | 1 T, 1 R; istniejąca sprawa i dowody | Wiarygodność +4; ujawniony fakt zapisany raz, bez generowania fikcyjnego skandalu |
| `party.tur` / partia | Od daty organizacji; 1 T, 2 R; poziom <3; 2 M wykonania | Dopiero ukończenie: +1 poziom, +10 kadry; utrzymanie według 13.2 |
| `party.tur_course` / partia | Temat i bramki 13.2; 1 T, 1 R; 2 M, cd 4 M | Kurs demokracji, kadry związku lub przygotowanie reformy |
| `party.cooperative` / agenda | Wybrani odbiorcy; 1 T i 1 R przygotowania, następnie 1 T i 2 R uruchomienia | Mała spółdzielnia; ulga +1 dla odbiorców podczas opłaconego działania; 0,10 R/M |
| `party.faction_conference` / karta Jedność, ustępstwo dla frakcji | 1 T, 1 R; cd 3 M | Przyjęty kompromis: sprzeciw tej frakcji −8; wymaga zgodnego z jej profilem ustępstwa |
| `party.advisors` / partia, osobna karta (Z — 0.35) | 1 T; cd 6 M | Zmiana obsady według 10.4; bez kasowania odnowień aktywności |
| `kpp.contact` / karta Stosunki z partiami | 1 T; relacja z KPP ≥10, kanał zamknięty | `contact_open=true`, relacja +4; rozmowy od następnego miesiąca (9.5, Z — 0.35) |
| `kpp.trial/rules/agreement` / agenda Współpraca z KPP | Odpowiednio 1 T, 1 T oraz 1 T i 1 R; warunki 9.5 | Uzgodniona próba, zasady albo szerszy układ (Z — 0.35) |
| Karty stanowisk `party.direction/main_opponent/pils_influence/form_of_power/electoral_base/slavic_autonomy/jewish_cooperation` / partia | 1 T, 0 R; cd 6 M na kartę | Trwałe stanowiska i ich kontekstowe skutki, 10.5–10.8 |
| `party.economic_program` / partia | 1 T, 0 R; cd 6 M; do 3 priorytetów | Zestaw aktywnych priorytetów; bez darmowego wykonania, 10.5 |
| `party.organizations` / partia | 1 T; cd 2 M; do 2 organizacji; suma R | Pakiet konkretnych podakcji z 13.5 |
| `party.dues` / partia | 1 T, 0 R; cd 6 M | Wyższe, zachowane lub niższe składki; indeks członkostwa i wpływy, 13.1 |
| `party.faction_expulsion` / jedność lub agenda sporu | 1 T, 1 R; cd 12 M; warunki 10.9 | Jeden manifest odejścia, mniejsza frakcja, PPS i dissent |
| `party.press_format` / partia | 1 T, 1 R; cd 6 M | Format programowy lub popularny; modyfikatory zasięgu, wiarygodności i sprzedaży z 13.2 |
| `militia.recruit/militarize/as` / karta Milicji, organizacje lub agenda | Dokładne koszty i bramki 13.3; AS poza pakietem organizacji | Ludzie, sprawność i etap; bez osobnej akcji dowodzenia |
| `union.organize/prepare/fund/mediate/align` / organizacje lub agenda konkretnego sporu | Konkretna branża; koszty 14.1 i pakiet 13.5 | Własny zasięg, gotowość, fundusz albo sprzeciw organizacji |
| `union.strike` / agenda | 1 T; cel, branża, roszczenie i plan zakończenia | Rekord strajku; nie natychmiastowe powodzenie ugody |
| `party.outreach` / partia | 1 T; cd 3 M na partnera | Relacja +4, a od 70: +2; bez automatycznej deklaracji głosowania |
| `parliament.list_agreement` / parlament | 1 T; otwarte okno list; zgoda wszystkich partnerów | Wspólna lista na wskazane wybory, bez wspólnego rządu z automatu |
| `parliament.cabinet_formation` / parlament, agenda formowania | Własna inicjatywa 1 T łącznie; obowiązkowe formowanie 0 T; 8.8 | Dostępna konfiguracja, kandydat, udział PPS, mniejszości i resorty w jednej sekwencji |
| `parliament.bill` / wewnętrzne rozliczenie | Koszt zawarty we właściwej karcie; dla D wyłącznie 17.15 | Automatyczne głosowania, terminy i zapis ustawy; bez osobnego menu procedowania |
| `parliament.government_support` / parlament lub odpowiedź na kryzys | 1 T, cd 3 M; odpowiedź 0 T raz na sprawę, 9.8 | Wycofać poparcie, negocjować, przekonać lub utrzymać; odwołanie jako krok tej samej karty |
| `parliament.no_confidence` / podakcja Stosunku do rządu | Czas zawarty w akcji 9.8; legalna procedura | Głosowanie; po reformie także nazwany następca. Nie jest odrębną losową kartą |
| `project.prepare/launch` / podakcje istniejących kart | Mała reforma 1 T wdrożenia; duża 1 T przygotowania i 1 T wdrożenia; 12.2 | Zgody i finansowanie w decyzji wdrożenia; dalej automatycznie. D1–D2 i konstytucja mają własne procedury |
| `government.tax` / rząd | 1 T wniesienia; kompetencja, ustawa i głosowania | Zmiana `tax_level` o 1 w granicach −3..3; rozkład obciążenia z 11.9, reakcja raz |
| `government.collection` / karta Polityka finansowa (Z — 0.37) | Mała reforma; 1 T, obciążenie 1 B przez 2 M | Po wykonaniu trwały modyfikator +1 B poprawy poboru; tylko raz w rozdziale, bez nowego podatku. Nie tworzy procentowego licznika sprawności |
| `government.administration` / rząd | Nie jest osobnym zakupem kadry; patrz karta MSW, 17.12 | Brak puli administracji i bonusu liczby projektów. Konkretna reforma policji/administracji wymaga własnego profilu, nie ukrytej premii do całej gospodarki |
| `government.police_protection` / rząd lub uzgodniony wykonawca | Mała decyzja 1 T; obciążenie 1 B przez 1 M; nazwana sprawa i legalne zadanie | Na ten M zdolność ochrony tej sprawy +10 × wykonanie, do 100; jeden rekord, bez trwałej premii siły |
| `government.army_control` / agenda | Projekt 12.4, legalny zakres stanowisk | Zmiana wskazanych lojalności po wykonaniu; żadnego zakupu lojalności całej armii |
| `government.pils_agreement` / rząd | 1 T inicjatywy; odpowiedź na właściwą ofertę rządową 0 T; uprawnienia 16.7 | Trzy ustępstwa lub odmowa; właściwe powołanie i wykonanie, bez automatycznej redukcji presji |
| `society.strike_communist_cooperation` / wydarzenie | 0 T w aktywnym strajku z partnerem; 9.6 | Pełna współpraca, lekka koordynacja albo odmowa; osobno rozliczany wynik rzeczywistej próby; dyscyplina KPP z relacji i zgodności celu (M13) |
| `politics.pils_parliament_criticism` / wydarzenie | Konkretne wystąpienie; 0 T raz na sprawę | Trzy odpowiedzi z 10.7; skutek dla autorytetu jako wpis dziennika 15.2; nie nadpisuje trwałej linii |
| `party.ussr_position` / pula partii | Od początku; 1 T, 0 R; cd 12 M | Trzy stanowiska z 10.10; nie jest reakcją wydarzenia ani bezpłatnym odblokowaniem koalicji |
| `security.assess` / agenda, zawsze dostępne (Z — 0.35) | 1 T, 1 R; cd 3 M | Nowa datowana ocena sił; promień błędu rozpoznania maleje o 10 pp, nie poniżej 5 pp |

Wiersze działań są podakcjami, nie osobnymi dodatkowymi kartami do losowania. Manifest talii partyjnej używa rodzin z 10.5, a ich podmenu odczytują powyższe koszty. Agenda finansów zachowuje zbiórkę nadzwyczajną i rozbudowę aparatu; rozwinięty TUR udostępnia w agendzie kursy, a rozpoczęta spółdzielnia następny etap. Dotychczasowy roboczy `parliament.outreach` jest zastąpiony przez `party.outreach`; kontakty są przygotowaniem partyjnym, a podpisywanie ofert pozostaje parlamentarne.

Zmiana podatku, administracji lub ochrony policji w tabeli nadal przechodzi predykat kompetencji. Dopisanie akcji do agendy nie nadaje PPS uprawnień wykonawczych w opozycji.

### 17.3. Wydarzenie ma przyczynę, okno i rozgałęzienia

`EventDefinition`: `id,window,trigger,priority,recurrence,choices,fallback,source_refs`. Instancja używa jednego `EventRun` z 4.5. Migawka zachowuje powód wezwania; warunek wykonania kosztownego wyboru jest ponownie sprawdzany na aktualnym stanie.

Poniższe identyfikatory i okna są projektem treści. Wydarzenie historyczne H nie oznacza, że jego alternatywne warunki lub skutki liczbowe również są H.

| ID / okno tematyczne | Wyzwalacz | Wybory i skutek dla gry |
|---|---|---|
| `opening.cabinet_1922` / przed XI 1922 | Rzeczywista dymisja lub utrata zdolności gabinetu | Kandydat związany z Piłsudskim, kompromisowy kandydat parlamentarny albo opozycja; wejście do jednej sekwencji 8.8, bez czwartej odpowiedzi o ustępstwie |
| `politics.pils_parliament_criticism` / konkretna debata od 1922 | Zapisane wystąpienie Piłsudskiego i aktualny spór; 10.7 | Poparcie krytyki, obrona parlamentu albo propozycja legalnej reformy; odrębne od stałej linii PPS. Odpowiedź obowiązkowa, bez opcji „milczeć” (Z — 0.38) |
| `society.strike_communist_cooperation` / rzeczywisty strajk | Partner komunistyczny uczestniczy, PPS ma możliwość odpowiedzi; 9.6 | Pełna współpraca, lekka koordynacja lub odmowa przed rozstrzygnięciem akcji |
| `election.sejm_1922` / XI 1922 | Termin pierwszych wyborów | Zamknięcie list → preferencje/frekwencja → mandaty → niezmienny wynik |
| `parliament.speaker_1922` / pierwsze posiedzenie | Wybrany parlament bez marszałka | Zgłoszenia i głosowanie; wybrana osoba staje się potencjalnym zastępcą prezydenta |
| `presidency.election_1922` / XII 1922 | Legalnie utworzone Zgromadzenie Narodowe | Jedna decyzja nominacyjna PPS, następnie końcowy wynik obliczony z głosów i umów |
| `presidency.security_crisis` / po wyborze | Konkretna rozpoznana groźba w profilu treści | Automatyczne rozliczenie zagrożenia i wcześniej wykonanej ochrony, bez menu B3; sam wybór kandydata lewicy nie wywołuje zabójstwa |
| `presidency.assassination_response` / po zakończonej sprawie zamachu na prezydenta | Potwierdzone zabójstwo, po obsłużeniu zależnej wakancji | Mobilizacja republikańska, powściągliwość albo odwet; trzy wybory, 17.6 |
| `society.niewiadomski_cult` / od I 1923 | Historyczna gałąź Narutowicza oraz konkretna uroczystość w profilu | Potępienie bez zakłócenia, msza w intencji obrony demokracji albo brak udziału; 17.7 |
| `society.strike_1923` / główne okno jesienią 1923, poza nim ogólny kontekst sporu | Niezadowolenie objętych robotników/branży ≥60 i brak wykonanej ugody w sprawie; inicjacja żądań według 17.16.5 | Rokowania, ograniczony strajk ekonomiczny albo żądanie dymisji; jedna karta B8+B10, reakcja państwa w tym samym rekordzie |
| `society.krakow_1923` / X–XI 1923 | Aktywna sprawa strajkowa, lokalna mobilizacja i reakcja władz | Kontekst tej samej sprawy i jednej odpowiedzi B11+B12 z 17.5.1; nie wywołuje drugiego menu ugody |
| `parliament.strike_response` / aktywny spór 1923 | Strajk oraz represja lub spór o odpowiedź rządu | Trzy odpowiedzi łączą ugodę i stanowisko klubu w jednym menu; 17.5.1 |
| `economy.stabilization` / historyczny temat końca 1923–1924; wcześniej przy spełnieniu 11.9 | Kryzys finansowy lub przyjęty projekt stabilizacji | Przekazanie do wariantów `government.currency_stabilisation` przy właściwym dostępie, inaczej odpowiedź parlamentarna; jedna reforma i wspólny budżet |
| `economy.credit_crisis` / temat 1925 | Kredyt <35 przez 2 M albo datowany zewnętrzny impuls profilu | Kredyt, zatrudnienie, osłony albo brak interwencji; wyłącznie przy właściwych kompetencjach i finansowaniu, 17.13 |
| `cabinet.austerity_1926` / I–IV 1926 | Budżet <−2 przez 2 M lub projekt cięć naruszający umowę | Cztery odpowiedzi karty 9.8, jak w 17.13 i 17.16.4: negocjować warunek, przekonywać bez ultimatum, utrzymać poparcie mimo sporu, wycofać poparcie (Z — 0.38). Nowe finansowanie jest treścią oferty kompromisowej; cięcie 2 → 1 B mimo umowy przechodzi przy utrzymaniu poparcia; wyjście PPS to wycofanie poparcia |
| `cabinet.chjeno_return_1926` / po spełnieniu warunków | Rzeczywisty powrót wcześniej rządzącego Chjeno-Piasta bezpośrednio po gabinecie stabilizacyjnym lub szerokim, przy nierozwiązanej sprawie wojskowej | Zapis kryzysu i +20 raz w rozdziale, bez bramki miesiąca/roku i bez zaległej dopłaty; bez B21; próba nadal wymaga 16.2 |
| `coup.attempt` / dostępne okno operacyjne | Wszystkie warunki 16.2 | Stanowisko → zaplecze → wykonanie → ugoda lub wynik; potem raport |
| `election.successor` / data rekordu prawnego | Legalnie zarządzone następne wybory | Wynik i mandaty → raport rozdziału, przed formowaniem kolejnego rządu |

Daty tematów nie są dodatkowymi modyfikatorami inflacji, mandatów i lojalności. Normalny ładuje nazwane presje i warunkowe sprawy z 17.16; poza nimi rocznica nie zmienia liczb. Zerowe impulsy pozostają profilem izolowanego testu, nie drugim trybem kampanii. Mapa 17.16 określa również pominięcie wydarzenia po usunięciu jego przyczyny.

Kryzys społeczny może wracać najwcześniej po 3 M jako nowa sprawa, jeśli jego przyczyna nadal istnieje. Wybory, wakancja i zakończenie konkretnej próby zamachu nie są wydarzeniami odnawialnymi pod tym samym ID.

### 17.4. Uzupełniające reguły zamykające zależności

Te reguły są częścią tego samego zestawu P. Chronią model przed istnieniem ważnej liczby, której nic nie zmienia lub której nikt nie odczytuje.

| Stan / parametr | Początek i zapis | Odczyt |
|---|---|---|
| Reakcja przedsiębiorców | Presja 10; stan quiet; progi i terminy 11.7 | Jedna aktywna reakcja w kredycie i produkcji; bez zdolności trzech sektorów |
| Wykonanie publicznych projektów | Pochodne 0/0,5/1 z budżetu oraz legalnego wykonawcy | Bez ręcznej kadry i limitu czterech realizacji; zgoda na nową akcję PPS osobno, 8.5 |
| Reputacja wykonania PPS | 50; wykonany istotny obowiązek +3, nowe zawinione naruszenie −5, cofnięta groźba z 9.8 −5 (M11); raz na ID, granice 0–100 | Oferta 8.3, leverage i wiarygodność umów |
| Radykalizacja komórki | 0 w profilu syntetycznym; zmiany 15.1 | Ryzyko niekontrolowanej akcji i ocena oferty zakończenia protestu |
| Sprzeciw i zmęczenie branży | 0 / 0; aktywny miesiąc strajku +5 zmęczenia, spokojny −5; granice 0–100 | Gotowość efektywna=`readiness*(1-fatigue/100)`; używana zamiast surowej gotowości w 14.2 |
| Koordynacja kolei | To `S.unions.rail.readiness`, nie drugi licznik | Bramka 50/70 w 16.5; spadające wykonanie przez zmęczenie uwzględnia się osobno w uczestnictwie |
| Autonomia branży | 60; trwała zmiana tylko jako element zaakceptowanych reguł współpracy | Przy zakończeniu protestu wymagana zgoda organizacji, jeśli ≥50; nie wolno wydać rozkazu zastępującego tę zgodę |
| Potwierdzona zgoda związku na ugodę | Wyliczana z oferty | `0.5*fulfilmentOfDemands + 0.3*trust + 0.2*strikeContinuationCost >= 50`, gdzie `strikeContinuationCost=max(100*(1-fundCoverage), fatigue)` (Z, 0.24, M12; inna zmienna niż `costOfContinuing` zamachu z 16.6), z zachowaniem uzgodnionych czerwonych linii. Pełny fundusz nie zwiększa zgody; nadal wzmacnia `crediblePressure` z 14.2 |
| Niepokój poza kontrolą związku | Wyliczany, nie dodawany do członkostwa | `uncontrolledPressure = nationalWorkerGrievance * workerRadicalization / 100 * (1-participation/100)`; od 40 uruchamia osobną sprawę protestu, nie automatyczną rewolucję |
| Osłabienie gabinetu dla rokowań strajkowych | `50-(supportSeats-222)+0.5*maxAgreementTension`, ograniczone 0–100; gabinet pełniący obowiązki 100 (Z, 0.24, M12) | `governmentFragility` w 14.4; bez dodatkowego nienazwanego bonusu |
| Zakłócenie gospodarcze przez strajki | Suma branżowych zakłóceń z wagami 0,5 przemysł / 0,3 kolej / 0,2 rolnictwo | `strikeDisruption` w produkcji; najwyżej 100 |
| Faktyczne ograniczenie inwestycji | `business_state === "active"` | Kary 11.5 raz; sama presja bez aktywnej reakcji nie obniża produkcji |
| Bieżący odpływ rozczarowanych | `min(ppsCellShare,0.5 * responsibility * min(1,overdueObligationWeight/2))` pp/M | Odjęcie od PPS; podział na akceptowanych konkurentów proporcjonalnie do ich udziału w komórce (Z, 0.21, M09); przy braku takiego konkurenta brak transferu. Liczony po przepływie 5.6 |
| Przepływ za warunki życia | `S.society.living_conditions_last`, ostatni odczyt 5.6; zmiana raz na okres | Od i do partii odpowiedzialnych za rząd: najwyżej 0,5 pp pogorszenia i 0,25 pp poprawy w komórce; powód `living_conditions` |

Początkowa zgodność z linią wezwania i czerwone linie muszą być jawne w profilu komórek/organizacji. Od 0.21 odpływ nie czyta zasięgu konkurentów, tylko ich udziały w komórce (M09). W izolowanym teście przyjmujemy zgodność 50 i brak czerwonych linii. To dane testu, nie stanowisko historycznej partii. W profilu przeznaczonym dla gracza brak wymaganego pola jest błędem walidacji, a nie domyślną zgodą.

Publiczne programy i płatności partyjne mają odbiorcę oraz ID. Rozdział 11 odczytuje obciążenie raz z projektu lub instrumentu; nie tworzy księgi wypłat. R partii jest odrębnie potrącane raz za rzeczywiście finansowane działanie. Efekt podatku, osłony, rozłamu czy przemocy przechodzi przez jeden rekord zdarzenia; inne systemy odczytują ten rekord zamiast odtwarzać skutek z narracji.

**K — etap 3 (0.44):** reputacja wykonania to `S.actors.pps.credibility` (50, granice 0–100, zmiana raz na ID). `PolishGovernment.governmentFragility` liczy się z zapisu gabinetu; gabinet pełniący obowiązki ma 100.

**K — etap 4 (0.45):** reakcja przedsiębiorców (progi 40/60, jeden miesiąc ostrzeżenia, dwa spokojne miesiące do wygaszenia), wykonanie projektów, odpływ rozczarowanych i przepływ za warunki życia działają według tej tabeli w `PolishEconomy`. Odpływ liczy się po przepływie 5.6: odpowiedzialność PPS 1 w gabinecie, 0,5 przy wspieraniu, a waga to suma zaległych obietnic, za które PPS odpowiada według 5.4. Do etapu 5, w którym profile komórek wskażą akceptowanych konkurentów, odpływ trafia do wszystkich pozostałych partii komórki proporcjonalnie do ich udziałów (P). Zakłócenie przez strajki wynosi 0 do etapu 6.

**K — etap 5 (0.46):** odpływ rozczarowanych działa w komórkach: `min(udział PPS, perCell)` pp do akceptowanych konkurentów komórki, proporcjonalnie do ich udziałów. Profil testowy komórek nie ma czerwonych linii, więc akceptowany jest każdy konkurent z udziałem (P). Ochrona Czapińskiego zatrzymuje połowę części dla KPP w komórkach robotniczych.

**K — etap 6 (0.47):** zakłócenie produkcji to suma wag 0,5/0,3/0,2 zakłóceń branż, gdzie zakłócenie branży = min(100, udział + udział niekontrolowany) × znaczenie/100; produkcja czyta −0,03 × zakłócenie (11.5). Zmęczenie +5 w miesiącu strajku branży, −5 bez strajku. Zgoda związku: 0,5·100·spełnienie + 0,3·zaufanie + 0,2·max(100·(1 − pokrycie), zmęczenie) ≥ 50.

### 17.5. Strajki i Kraków 1923: od postulatów do decyzji o zakończeniu

`society.strike_1923` obejmuje jesienną falę protestów. Nazwane wydarzenie `society.krakow_1923` wymaga tej sprawy, lokalnej mobilizacji oraz decyzji władz o użyciu środków przymusu w profilu; testowe okno X–XI 1923. Sam listopad nie dopisuje historycznych ofiar do spokojnej kampanii. W łagodniejszym przebiegu gracz rozwiązuje spór przed starciami i w raporcie widzi uniknięty kryzys.

Pierwsza odpowiedź w kryzysie kosztuje 0 T; rozpoczęty strajk zużywa normalny fundusz z 14.2, ochrona Milicji wymaga przydziału ludzi i 0,5 R organizacji. Własna inicjatywa protestu przed wydarzeniem nadal kosztuje 1 T. Profil sprawy zapisuje osobno żądania płacowe, wojskowe podporządkowanie kolei, tryb postępowania represyjnego, stan zatrzymań i przyjętą ofertę. Nie zakładamy wszystkich represji w każdym alternatywnym rządzie.

| Wybór PPS — B8+B10 | Faktyczne działanie | Rezultat / koszt polityczny P |
|---|---|---|
| Podjąć rokowania przed rozszerzeniem protestu / `negotiate` | Ograniczona oferta płacowa lub cofnięcia konkretnej represji; próg 40 z 14.4; bez nowego wezwania do rozszerzenia | Dopiero przyjęta oferta tworzy umowę. Brak strajku zmniejsza nacisk, ale chroni fundusz. Odmowa nie jest automatycznym ustępstwem |
| Prowadzić ograniczony strajk o płace i warunki pracy / `economic_strike` | Wybrane branże, uzgodnione żądania ekonomiczne i warunki końca; fundusz 14.2 | Próg 40 dla pojedynczego żądania lub 60 dla szerszego pakietu. Bez postulatu dymisji; zakres i posłuch ograniczają nacisk oraz straty |
| Połączyć strajk z żądaniem ustąpienia gabinetu / `cabinet_resignation` | Cel polityczny, próg żądań strukturalnych 80; rozszerzenie tylko przy zgodzie i funduszach organizacji | Lewica −3 dissentu przy zgodnej linii, Centrum +8 bez uzgodnienia. Dymisja wymaga rzeczywistego odejścia lub legalnego głosowania; uliczny sukces jej nie zastępuje |

P — **dostęp do ograniczonej akcji**: niezadowolenie właściwych odbiorców ≥50 albo odrzucone/nierozwiązane żądanie w istniejącej sprawie. **Sam postulat dymisji** jest dostępny w tak otwartym sporze, bez dodatkowej bramki 60. Nie zwiększa automatycznie uczestnictwa ani skali strajku; próbę rozszerzenia do ogólnej mobilizacji nadal warunkują niezadowolenie ≥60, zgoda organizacji i fundusze. Próg 80 ocenia trudność uzyskania politycznego ustępstwa, a nie pozwolenie na jego wypowiedzenie. Zamknięte żądanie nie otwiera ponownie tej samej akcji.

**Połączenie B8+B10:** to dokładnie trzy odpowiedzi, zapis `EventRun.payload.strike_strategy`. Osobne menu `government.strike_response` nie jest wywoływane. Reakcja państwa należy do tej samej fazy: przy właściwym mandacie PPS wariant rokowań zleca mediację, a oba warianty strajkowe utrzymują ochronę pokojowej akcji i interwencję tylko wobec konkretnej przemocy. Mediacja pracownicza wymaga Pracy lub upoważnionego wykonawcy; dyspozycja policji wymaga MSW i legalnego mandatu. Własny minister ma tylko swój zakres, a pozostałe decyzje podejmuje właściwy aktor państwa. Bez kompetencji PPS wybiera linię własnych organizacji, nie zachowanie policji. Nie ma tu dodatkowego wyboru rozpędzenia strajku. Każda dyspozycja przechodzi przez środki, kompetencję i posłuch, bez darmowej ochrony; profil zapisuje ją w `government_response`, nie obok drugiej sprzecznej odpowiedzi NPC. Wycofanie ministrów przy żądaniu dymisji korzysta ze zwykłej procedury 9.8 i od tej chwili odbiera ich kompetencje.

Jeśli w proteście uczestniczą komuniści, **osobna karta współpracy z 9.6** rozstrzyga pełne współdziałanie, lekką koordynację albo odmowę. Pojawia się po wyborze celu protestu, przed obliczeniem uczestnictwa, ryzyka starć i wyniku. Wybór celu nie narzuca partnera, a wybór partnera nie narzuca eskalacji.

Ugoda może mieć trzy osobne klauzule: **płace i powrót do pracy**, **cofnięcie militaryzacji kolei**, **wycofanie wskazanego nadzwyczajnego trybu represji lub przegląd zatrzymań**. Każda ma właściwego wykonawcę, termin t+1 i wagę 1 w umowie. Płace P podnoszą `effectiveWageAgreementPP` o 2 na 2 M dla modelowanego zakresu; wynik agregujemy według udziału objętych pracowników, nie dodajemy +2 całej gospodarce za lokalny zakład. Cofnięcie represji kończy konkretną ekspozycję; nie kasuje całej radykalizacji. Przyjęcie pakietu i zgodne zakończenie akcji daje jeden wynik 14.5, nie oddzielną premię za każdą podscenę.

**Starcia mają warunki.** Wykonana dyspozycja PPS wynikająca ze wspólnej karty B8+B10 zastępuje decyzję władz tylko w zakresie posiadanych kompetencji dla danej fazy. W pozostałych przypadkach władze wybierają zachowanie według profilu: ugoda, ochrona zgromadzeń albo represja. W syntetycznym teście odpowiedź represyjna zachodzi przy aktywnej akcji, odrzuconej ofercie i `security_response=repress`; to jawna wartość scenariusza, nie historyczna etykieta każdej prawicy. Dla aktywnego spotkania `clashRisk=clip(0.10+0.004*uncontrolled_participation+0.25*I(repressive_response)+0.20*I(pps_authorizes_confrontation)-0.20*compliance,0,0.90)`. Jeden rzut na fazę spotkania; fazy to wezwanie, reakcja władz, zakończenie — bez nieskończonego ponawiania.

Po starciu zapisujemy jeden poważny epizod przemocy (+10 według 15.2), narażenie objętych komórek i sprawę odpowiedzialności. Testowe straty własnej Milicji: 2% faktycznie przydzielonych ludzi, zaokrąglone raz; pozostali poszkodowani mają odrębny wpis profilu, nigdy historyczną liczbę wyliczoną z tego procentu. Ochrona z 16.5 ogranicza narażenie cywilne; nie zeruje ryzyka rozpoczęcia starcia. Te wartości opisują P, a nie rekonstrukcję taktyki walk.

H — krakowski kryzys listopadowy i negocjacje wokół represji, kolejarzy i żądań ekonomicznych są udokumentowane. Źródła w `PL-CONTENT-1922-1926-2026-09`; alternatywne zachowanie PPS, rządu i komunistów podlega regułom gry.

**K — etap 6 (0.47):** karta strajków 1923 `polish_event_strike_1923` otwiera się sprawą płacową 17.16.5 i ma trzy odpowiedzi 0 T: rozmowy (od razu runda; przyjęta oferta kończy sprawę ugodą przed strajkiem), strajk ograniczony i żądanie dymisji (oba po odrzuconym żądaniu). Władze odpowiadają w tej samej fazie według `strike_state_profiles_v1` (P): Chjeno-Piast — przymus po odrzuconej rundzie aktywnego strajku, gabinet z PPS — ugoda, pozostali — ochrona zgromadzeń. Minister PPS zastępuje profil tylko w swoim zakresie: Praca mediuje, MSW dysponuje policją, Sprawy Wojskowe decydują o kolei. Przymus dodaje żądanie cofnięcia represji, na kolei militaryzację (+10 niezadowolenia dla etapu 7) i losuje raz na rundę starcie; Kraków to sprawa płacowa z represją w X–XI 1923. Kroki strajku (`polish_strike_steps`): współpraca z KPP (9.6), potem ochrona Milicji za 0,5 R, która zmniejsza narażenie o min(0,40; 0,10 × siła); w starciu Milicja traci 2% przydzielonych ludzi. Przemoc i narażenie czekają na etap 7.

**K — etap 7 (0.48):** starcie w strajku jest jednym poważnym epizodem przemocy (+10), zgodnie z tą sekcją; w części 7a przyjęto chwilowo +4. Starcie przy ochronie Milicji jest przemocą organizacji PPS: sprawa `pps_violence`, a w gabinecie represyjnym legalny zakaz Milicji.

### 17.5.1. Kraków: ugoda i odpowiedź parlamentarna — B11+B12

**Z — jedno menu zamiast dwóch kart.** `parliament.strike_response` jest jedyną odpowiedzią w tej fazie istniejącej sprawy `society.krakow_1923` lub innego aktywnego protestu z represją albo rzeczywistą ofertą ugody. Dostępne również w opozycji. P: 0 T, 0 R za stanowisko; wykonanie ugody zachowuje zwykłe koszty i zgody. Rekord ma `parliament_response=null|demands|settlement|order`, wybraną ofertę i wynik.

| Trzy wybory | Konkretny skutek |
|---|---|
| Żądać cofnięcia represji i ustępstw dla robotników / `demands` | Gdy istnieje oferta, zażądać jej uzupełnienia o jedno niespełnione żądanie: płace, militaryzację kolei lub konkretną represję. Bez oferty — przedstawić te żądania. Progi 14.4 i zgoda wykonawcy nadal obowiązują |
| Szukać ugody i zakończyć strajk na uzgodnionych warunkach / `settlement` | Przyjąć istniejącą wykonalną ugodę albo przedstawić jeden ograniczony pakiet. Po zgodzie stron wezwać do uzgodnionego końca; posłuch 14.5, bez drugiego ekranu akceptacji i drugiej premii |
| Poprzeć przywrócenie porządku i wezwać do zakończenia strajku / `order` | Wycofać poparcie PPS dla kontynuacji bez nowych ustępstw. Niewykonane obietnice: raz sprzeciw związku +10 i zaufanie −8. Apel nie kończy automatycznie protestu i nie jest rozkazem użycia policji |

Odmowa rządu pozostawia istniejący spór i cel akcji; nie tworzy czwartej odpowiedzi „odrzuć i eskaluj” ani drugiego menu B11. Klauzule ugody z 17.5 mają jednego wykonawcę, jeden termin i jedno rozliczenie; treść oferty jest parametrem wybranej odpowiedzi. Nie wybieramy ponownie partnera komunistycznego, celu protestu lub zachowania Milicji. Zapis i ponowne wejście zachowują tę samą odpowiedź; nowa istotna oferta może wznowić sprawę, ale nie daje ponownie nagrody za wykonane już warunki.

**K — etap 6 (0.47):** odpowiedź Sejmu `polish_event_strike_response` pojawia się raz na fazę sprawy (oferta rządu albo represja) i ma trzy odpowiedzi za 0 T: żądania (oferta wygasa albo żądania trafiają od razu do rządu), ugoda (przyjęcie oferty albo jeden ograniczony pakiet) i przywrócenie porządku (PPS cofa poparcie bez nowych ustępstw; związek: sprzeciw +10 i zaufanie −8 raz; ci, którzy słuchają wezwania do końca, odchodzą). Wezwanie nie jest rozkazem dla policji.

### 17.6. Mobilizacja po zabójstwie prezydenta

`presidency.assassination_response` wymaga potwierdzonej śmierci w wyniku zamachu w zakończonym `presidency.security_crisis`. Nie uruchamia się po każdej porażce wyborczej prawicy. Obowiązkowa wakancja i przejęcie obowiązków przez rzeczywistego marszałka mają pierwszeństwo; mobilizacja nie zastępuje wyboru następcy. Narutowicz jest historycznym przypadkiem, inne ofiary wymagają osobno opracowanego, oznaczonego alternatywnego przebiegu.

Jedna decyzja PPS, 0 T; dobór narzędzia jest częścią tego samego wydarzenia. Gracz wybiera zakres mobilizacji i zapisuje wskazane organizacje, aby ta sama Milicja nie chroniła jednocześnie kilku miejsc przed etapem AS. AS chroni do trzech miejsc według 13.4 (M15).

| Odpowiedź | Wymaganie i koszt P | Następstwo |
|---|---|---|
| Masowa obrona republiki | Uzgodniona linia związku albo działająca prasa; 1 R kampanii | Kampania o demokracji w objętych komórkach według 5.3; ochrona opcjonalnie 0,5 R. Pokojowo wykonane zgromadzenie: demokracja +2, raz; nie daje automatycznej zgody na strajk generalny |
| Powściągliwość i skupienie na legalnej sukcesji | 0 R; własna deklaracja i głosy | Brak darmowej kampanii masowej; Lewica +3 sprzeciwu, jeśli wcześniej przyjęto obietnicę publicznej mobilizacji. Legalny wybór następcy ma własne skutki ustrojowe |
| Zezwolić własnej Milicji na odwetową konfrontację | Zdolni, przydzieleni członkowie; 0,5 R, przyjęcie linii sprawdzane przez 10.3 | Centrum +8 sprzeciwu bez wewnętrznej zgody; ryzyko i rzeczywisty epizod z 17.5. Tylko wykonana bezprawna przemoc zapisuje naruszenie prawa, reakcję władz i narażenie; deklaracja nie tworzy ludzi ani ofiar |

Przy istniejącym zagrożeniu używamy testu starcia z 17.5 dla jednej fazy zgromadzenia. Wariant pokojowy nie ma `pps_authorizes_confrontation`; odwetowy go ustawia. Reakcja władz pochodzi z osobnego profilu, nie z wyboru gracza za ministra. Mobilizacja może więc zwiększyć demokratyczne przywiązanie i siłę kampanii, a nieprzygotowany odwet może zwiększyć przemoc oraz rozbić zgodę partii.

**K — etap 7 (0.48):** decyzja 2B etapu 7: wybór Narutowicza zawsze kończy się zabójstwem; ochrony prezydenta rozdział 1 nie modeluje. Sprawa zabójstwa jest instytucjonalna, z etykietą skrajnej prawicy bez wskazanej partii, i zamyka się przy legalnej sukcesji. B4 `polish_event_assassination_response`: obrona republiki (1 R, kampania o demokracji wśród robotników, test starcia przy otwartej sprawie, pokojowo +2 raz; ochrona Milicji opcjonalnie za 0,5 R), powściągliwość (Lewica +3 przy kampanii o demokracji w ostatnich 12 M, P) i odwet (0,5 R, Centrum +8; tylko wykonane starcie tworzy sprawę przeciw PPS i reakcję władz).

### 17.7. Kult Niewiadomskiego i zachowanie Milicji

`society.niewiadomski_cult` wymaga historycznej gałęzi zabójstwa Narutowicza przez Niewiadomskiego oraz konkretnego publicznego wydarzenia upamiętniającego sprawcę. Testowe okno od I 1923; jedno nazwane wydarzenie, bez corocznego farmienia reakcji. Samo zwyczajne nabożeństwo nie spełnia wyzwalacza. H dotyczy istnienia kultu; konkretna miejscowość, nabożeństwo i uczestnicy wymagają źródłowego profilu B.

| Stanowisko PPS, 0 T w wydarzeniu | Koszt P | Co gracz uzyskuje / ryzykuje |
|---|---|---|
| Potępić kult, nakazać niezakłócanie nabożeństwa | 0 R; jasna instrukcja Milicji | Centrum −3 sprzeciwu przy uzgodnionej linii; relacja PSChD +2 tylko jeśli partner przyjął wspólne potępienie przemocy. Niski posłuch może zostawić niekontrolowaną konfrontację |
| Zorganizujmy mszę w intencji obrony demokracji / `democracy_mass` | P: 1 R organizacji; zgoda konkretnego duchownego/gospodarza, dostępne miejsce i działające zaplecze PPS | Jedna pokojowa kampania demokratyczna w faktycznie objętych komórkach według 5.3; po wykonaniu demokracja +2 raz. Brak automatycznej relacji z chadecją, poparcia wszystkich katolików lub zmiany programu świeckości. Odmowa gospodarza nie daje premii i nie pobiera kosztu niewykonanej mszy |
| Nie angażować organizacji | 0 R | Brak kampanii i kosztu udziału; Lewica +3 tylko przy złamanej obietnicy publicznej odpowiedzi |

Msza jest alternatywą rozgrywki zaproponowaną przez użytkownika, nie twierdzeniem, że PPS historycznie ją zorganizowała. Polecenie powściągliwości dotyczy także jej uczestników. W każdym wariancie ewentualne niekontrolowane zachowanie opiera się na istniejącym `uncontrolledPressure` z 17.4; nie przypisujemy wszystkich obecnych PPS. Bez własnej konfrontacji lub niekontrolowanego udziału nie losujemy starcia Milicji. Interfejs odróżnia sprzeciw wobec kultu zabójcy od stosunku do religii: wybór nie musi zmieniać całej osi programu państwo–Kościół.

**K — etap 7 (0.48):** B5 `polish_event_niewiadomski_cult` pojawia się raz od I 1923 w gałęzi zabójstwa Narutowicza przez Niewiadomskiego; miejsce uroczystości: TBD — historical research required. Potępienie: Centrum −3 przy linii parlamentaryzmu, PSChD +2 przy relacji ≥40. Msza tylko przy zgodzie gospodarza (relacja z PSChD ≥40, P) i działającym aparacie: 1 R, kampania o demokracji, +2 raz, bez zmiany relacji z chadecją. Brak zaangażowania: Lewica +3 przy wcześniejszej obietnicy. Niekontrolowane starcie losujemy tylko przy niepokoju z 17.4 większym od zera.

**K — etap 8 (0.49):** B5 pojawia się od II 1923, po egzekucji 31 I 1923. Nazwaną uroczystością jest pogrzeb na Powązkach 6 II 1923 z mszą żałobną i ok. 10 tys. uczestników (`PL-NIEWIADOMSKI-CULT-1923`); tekst wydarzenia mówi o nim i o lutowych nabożeństwach. Odpowiedzi PPS bez zmian.

### 17.8. Wycofana scena Żyrardowa

Z — B15 usunięto z bieżącego katalogu. `press.zyrardow` nie jest losowane ani wywoływane jako wydarzenie; nie ma wyboru nagłośnienia, premii wiarygodności czy kary partnera z dawnej sceny. Istniejące materiały historyczne pozostają w rejestrze źródeł. Ewentualne ogólne sprawy odpowiedzialności rozlicza właściwa instytucja, bez odtwarzania usuniętej minigry.

### 17.9. Powiązanie katalogu z istniejącym stanem

Nowe karty zapisują wariant w istniejącym `Project`, `Agreement`, `Negotiation` albo `EventRun.payload`; payload zaczyna jako pusty obiekt. Nie powstają osobne globalne waluty „reformy rolnej”, „afery” czy „Niewiadomskiego”. Po zakończeniu wydarzenia payload trafia do `S.events.resolved`, a jego zobowiązania pozostają w agendzie. Ukończone transze projektów są odczytywane z `S.projects`, nie kasowane przy kolejnym losowaniu karty.

| Katalog / akcja | Miejsce rozliczenia i stała agenda |
|---|---|
| `parliament.list_agreement` | Nazwane listy 6.5; zapis uczestników i ustępstw w negocjacji |
| `parliament.cabinet_formation` | Konfiguracje, premierzy i mniejszości 8.6–8.8; profil stabilizacji 9.7 w tej samej karcie |
| `parliament.constitution_project` | Trzy warianty 7.6; od przygotowania stały projekt |
| `government.finance_package`, `parliament.finance_amendment`, `government.investment_fund` | Instrumenty 11.9, wspólny budżet 11.2; agenda do wygaśnięcia zobowiązań |
| `government.land_program`, `government.agriculture_development` | Wariant i transze 12.6; koniec kosztu po ukończeniu |
| `government.education_program`, `government.heritage_restoration` | Oświata, język, prawa i oba obiekty 12.7–12.8; właściwy typ końca projektu |
| `party.tur_course`, `society.strike_communist_cooperation`, `government.pils_agreement` | Odpowiednio 13.2, 9.6 i 16.7; kurs, wybór współpracy w strajku albo rządowa umowa |
| `society.krakow_1923`, `presidency.assassination_response`, `society.niewiadomski_cult` | Rozgałęzienia 17.5–17.8; obowiązkowe odpowiedzi i późniejsze terminy |

Szczególne efekty z tabel zastępują ogólny efekt tego samego rodzaju, zamiast go dublować. Przykładowo zaufanie +4 wykonanej szkoły to wynik z 5.4 z przypisaniem odpowiedzialności PPS, a nie +4 ze szkoły i kolejne +4 z raportu. Podobnie explicitna zmiana reputacji zastępuje domyślne +3/−5 za ten sam obowiązek z 17.4. Koszt kampanii już opłacony w wydarzeniu nie jest pobierany ponownie przez helper 5.3.

### 17.10. Aktualny manifest 10 kart parlamentarnych

**Z — rodziny wyborów, nie dziesięć kart losowanych w każdej sytuacji.** Zwykła inicjatywa zużywa jedną główną akcję (P: 1 T); obowiązkowa odpowiedź na rzeczywiste wydarzenie 0 T. **Z — 0.36:** karty 3–5 nie mają odnowienia: każda dotyczy konkretnej sprawy, każda próba kosztuje 1 T (karta 3, Budżet, jest odpowiedzią na konkretny pakiet za 0 T — decyzja etapu 4, potwierdzona w 0.49), a odrzuconej oferty nie ponawia się bez zmiany oferty albo sytuacji (8.3). Podmenu tej samej oferty nie dolicza czasu. Koszt przygotowania lub wykonania osobnego projektu pozostaje według 12.2; ponowne otwarcie istniejącej agendy nie pobiera go drugi raz. „Pula” oznacza dostępność w zwykłym doborze; „agenda” gwarantuje dostęp po otwarciu sprawy; „wydarzenie” pojawia się po wyzwalaczu. Poniższy manifest ma pierwszeństwo przed dawnymi roboczymi podziałami kart.

| Nr / rodzina i ID P | Dostępność | Wybory gracza Z i wynik |
|---|---|---|
| 1. Tworzenie gabinetu i udział PPS / `parliament.cabinet_formation` | Agenda formowania, 8.8; obowiązkowa sekwencja albo wykonalna inicjatywa | Dostępny układ i premier, udział/tolerowanie/opozycja, opcjonalne poparcie mniejszości, warunki i konkretne resorty. Grabski jest profilem tej oferty |
| 2. Zabezpieczenie bezrobotnych / `parliament.legislative_program` | Po wyborach 1922, poza formalnym rządem; jedna inicjatywa w rozdziale | Dokładnie D1: rozpocząć/nie podejmować; D2: pełny projekt/realny kompromis lub wycofanie. Kontrakt 17.15; brak menu innych zwykłych ustaw PPS |
| 3. Budżet i koszty kryzysu / `parliament.finance_amendment` | Pula lub agenda faktycznego pakietu; bramka poniżej | Poprzeć, chronić wydatki robotnicze, przenieść ciężar na majątek, zaproponować pożyczkę zamiast cięć albo odmówić. Przyjęcie poprawki i legalne finansowanie nadal konieczne. Z — 0.36: „chronić wydatki” to warunek usunięcia cięcia wskazanych świadczeń, a budżet traci tę oszczędność; „przenieść ciężar” to podatek progresywny albo nadzwyczajny podatek majątkowy z 11.9; „pożyczka” to krajowa pożyczka inwestycyjna z 11.9, przy kredycie ≥40 i zgodzie finansujących; „odmówić” to brak poparcia pakietu. Warunki PPS partnerzy oceniają według 8.3 |
| 4. Reforma konstytucyjna / `parliament.constitution_project` | Pula przygotowania, następnie agenda | Gwarancje demokratyczne, stabilizacja przez konstruktywne wotum nieufności albo silniejszy prezydent; odrębne projekty 7.6, nie zmiana ustroju samą deklaracją |
| 5. Parlamentarna kontrola wojska / `parliament.army_oversight` | Pula przy przygotowanym projekcie lub konkretnej sprawie wojskowej; agenda po rozpoczęciu | Pełniejszy nadzór cywilny albo ograniczona reforma. Z — 0.36: bez płatnych „wyjaśnień ministra” i „odłożenia”; zamknięcie karty jest bezpłatne. Ograniczona reforma to kompromisowa wersja tego samego projektu: w ofercie `army=0` zamiast +2, skutek +0,025 zamiast +0,05 lojalności legalnej wskazanej grupy, obciążenie 1 B przez 2 M zamiast 3 M. Zmiana prawa według 12.4 |
| 6. Stosunek do rządu / `parliament.government_support` | Pula i gwarantowana odpowiedź na kryzys umowy; 9.8 | Zakończyć poparcie, negocjować ustępstwa albo przekonać rząd; „utrzymać poparcie” tylko w odpowiedzi na ostrzeżenie albo ultimatum partnera (9.8, Z — 0.36). W opozycji kontekstowo poprzeć/odrzucić odwołanie; wotum jest krokiem tej samej karty |
| 7. Porozumienie wyborcze / `parliament.list_agreement` | Okno przygotowania list, 6.5 | Własna lista, PPS–Wyzwolenie, PPS–NPR lub warunkowy wcześniejszy Centrolew. Blok ludowy wymaga samodzielnej zgody Piasta i Wyzwolenia; PPS może zabiegać o porozumienie, nie rozkazuje partnerom |
| 8. Wybór marszałka / `parliament.speaker_election` | Wydarzenie wyboru lub wakancji, 7.5 | Poparcie Śmiarowskiego, Rataja albo Daszyńskiego zgodnie z dostępnością; głosy decydują o urzędzie, a urząd o legalnej sukcesji |
| 9. Wybór prezydenta / `presidency.election` | Wydarzenie właściwego wyboru, 7.2–7.3 | Zgłosić własnego dostępnego kandydata albo nie; pokazać końcowy wynik. Wcześniejsze porozumienia odczytuje automatyczne rozstrzygnięcie |
| 10. Ugoda i reakcja na represje/strajki 1923 / `parliament.strike_response` | Wydarzenie aktywnego sporu, 17.5.1 | Dokładnie trzy wybory: żądać cofnięcia represji i ustępstw / szukać ugody / poprzeć przywrócenie porządku i wezwać do końca strajku |

**Budżet — bramka dostępu Z, zapis P:**

```text
canUseBudgetCard = cabinet.status == active
  && budgetOrFiscalPackagePending
  && (pps_mode == member
      || (pps_mode == external_support && hasCurrentCabinetSupport))
```

`hasCurrentCabinetSupport` oznacza rzeczywiście obowiązujące wsparcie tego gabinetu zapisane w umowie lub w jawnej początkowej tolerancji z 4; nie samo wysokie pole relacji, dawną obietnicę albo pojedynczy głos za ustawą. Popierany gabinet ekspercki używa tego samego trybu `external_support`, bez nowej kategorii. Zakończenie wsparcia wyłącza specjalną kartę budżetowych negocjacji. Opozycja nadal głosuje nad budżetem w obowiązkowej procedurze oraz może podjąć jedną inicjatywę zabezpieczenia bezrobotnych w karcie 2 — nie ma jednak pięciu opcji negocjacji z pozycji zaplecza gabinetu. Uzgadnianie przyszłych warunków wsparcia w karcie 1 nie wymaga wcześniejszego popierania jeszcze niepowołanego rządu i nie przyznaje mu z góry pieniędzy.

Nazwane wydarzenia `parliament.speaker_1922` i `presidency.election_1922` z 17.3 są instancjami rodzin wyboru marszałka i prezydenta, nie dodatkowymi kartami. Odpowiednio obsługują też wakancje, z właściwym profilem kandydatów.

**Granice:** ustępstwa personalne i wykonawcze wobec Piłsudskiego są w `government.pils_agreement` (16.7). Parlamentarna karta 5 zachowuje kontrolę, projekty i głosy wymagane do ich legalności. Odrębny priorytet negocjacyjny, karta Grabskiego, karta egzekwowania każdej obietnicy i osobna losowa karta wotum nieufności nie należą do manifestu. Obsługa technicznej podakcji z 17.2 lub zdarzenia z 17.3 korzysta z właściwej rodziny, nie powiększa talii.

**K — etap 4 (0.45):** `canUseBudgetCard` wymaga oczekującego pakietu tego gabinetu (decyzja etapu 4); odpowiedź kosztuje 0 T, raz na pakiet. Warunki PPS partnerzy oceniają według 8.3; odmowa oznacza głos PPS przeciw pakietowi. Opozycja głosuje w obowiązkowym głosowaniu bez karty.

**K — etap 7 (0.48):** talia parlamentarna ma wszystkie 10 rodzin; doszła karta kontroli wojska `polish_parliament_army_oversight` z dwiema opcjami. Karty 3–5 nie mają odnowienia: odrzuconej ustawy kontroli ani wniosku konstytucyjnego nie wnosi się bez zmiany prognozy, a odpowiedź na pakiet budżetowy jest raz na pakiet (0 T, decyzja etapu 4).

**K — etap 8 (0.49):** karta Budżet pozostaje odpowiedzią na pakiet za 0 T, raz na pakiet (ograniczenie zapisane przy domknięciu planu).

### 17.11. Aktualny manifest kart rządowych — 16 rodzin

**Z** — katalog poniżej zapisuje zatwierdzone wybory. **P** — identyfikatory, przypisanie rekordów i nowe parametry wykonania są specyfikacją do testów. Numeracja odpowiada opisowi w rozdziale 3 przewodnika. Każda rodzina korzysta ze wspólnego czasu działań; sam wybór nazwy polityki nie kosztuje dodatkowej tury.

| Nr / karta i ID P | Właściwa kompetencja / dostęp | Wybory Z |
|---|---|---|
| 1. Prawa pracownicze / `government.labor_rights` | Praca | Inspekcja i egzekwowanie czasu pracy; układy zbiorowe; ograniczone odstępstwa w zagrożonych zakładach |
| 2. Świadczenia i pomoc bezrobotnym / `government.social_welfare` | Praca | Rozszerzyć ochronę; skupić pomoc na najbardziej potrzebujących; ograniczyć świadczenia |
| 3. Polityka finansowa / `government.finance_package` | Skarb | Obciążyć wysokie dochody i majątek; obciążyć szerokie grupy (podatki pośrednie, szersza podstawa podatku albo cła); pożyczka krajowa; oszczędności ze wskazaniem wydatków; finansowanie z emisji; usprawnić pobór podatków (Z — 0.37) |
| 4. Stabilizacja waluty / `government.currency_stabilisation` | Skarb; kryzys, potem agenda | Szybka stabilizacja z oszczędnościami; osłony i obciążenie majątku; stopniowe ograniczanie emisji |
| 5. Kapitał na inwestycje / `government.investment_fund` | Skarb / Przemysł i Handel; właściwy wykonawca | Fundusz publiczny; porozumienie z bankami i przemysłem; finansowanie spółdzielcze |
| 6. Polityka wobec przemysłu / `government.industrial_policy` | Przemysł i Handel; wskazana branża lub zakład | Warunkowy kredyt, ogólny albo na ratunek wskazanego zakładu; zamówienia publiczne; przejęcie pod kontrolę publiczną; reprezentacja pracownicza w uprawnionym przedsiębiorstwie |
| 7. Roboty publiczne / `government.public_works` | Praca; finansowanie | Szybkie zatrudnienie bezrobotnych; transport i infrastruktura; mieszkalnictwo robotnicze |
| 8. Wykonanie reformy rolnej / `government.land_program` | Rolnictwo | Parcelacja z odszkodowaniem; przyspieszona parcelacja; wywłaszczenie bez odszkodowania. Następnie: dostęp według potrzeb albo preferencja polskiej większości |
| 9. Modernizacja rolnictwa / `government.agriculture_development` | Rolnictwo | Doradztwo i wyposażenie; dobrowolna komasacja; spółdzielcze przetwórstwo i sprzedaż |
| 10. Polityka oświatowa / `government.education_program` | Oświata | Szkoły na wsi; edukacja ubogich i dorosłych w ośrodkach robotniczych; świecki model szkoły z wolnością religijną |
| 11. Prawa językowe i szkoły mniejszości / `government.minority_school_rights` | Oświata; współpraca z MSW w jego kompetencjach | Nauka we własnym języku; uzgodniona dwujęzyczność; dominacja języka polskiego |
| 12. Policja i bezpieczeństwo wewnętrzne / `government.internal_security` | Sprawy Wewnętrzne | Profesjonalizacja i podporządkowanie legalnym władzom; badanie wskazanej przemocy skrajnej prawicy; badanie wskazanej przemocy komunistów; ochrona zgromadzeń i instytucji |
| 13. Wymiar sprawiedliwości / `government.justice_policy` | Sprawiedliwość | Wspólny projekt gwarancji demokratycznych; przegląd wskazanego nadużycia |
| 14. Polityka wojskowa / `government.military_policy` | Sprawy Wojskowe | Wdrożyć nadzór cywilny; legalne zmiany kadrowe; kompromis organizacyjny ograniczający reformę |
| 15. Porozumienie z Piłsudskim / `government.pils_agreement` | Właściwa oferta rządowa, 16.7 referencji | Funkcja wojskowa pod nadzorem; samodzielniejszy inspektorat i nominacje; legalne premierostwo; odmówić |
| 16. Wawel albo Zamek Królewski / `government.heritage_restoration` | Oświata; ograniczona sprawa | Wybrać obiekt, potem: konserwacja albo większy remont z dostępem publicznym |

**Dostęp i czas:** zwykłe inicjatywy trafiają do puli tylko przy właściwym dostępie PPS do resortu; konkretna umowa wykonania z partnerem otwiera tylko jej zakres. `stateCanExecute` z 8.5 sprawdza wykonanie, nie jest obowiązkiem posiadania już gotowej ustawy przed przygotowaniem projektu. Wniosek może być przygotowywany wcześniej, lecz nie daje wtedy efektów wykonawczych. Zwykła akcja P: 1 T; wariant i odbiorcy mieszczą się w decyzji wdrożeniowej małego programu albo przygotowaniu dużego z 12.2. Duży ma jeszcze tylko decyzję wdrożenia w agendzie, bez ponownego losowania lub odnowienia między etapami. Nowe programy/transze zachowują odnowienia podakcji 17.2; program uruchomiony postępuje automatycznie. Kryzysowe skierowanie do istniejącej polityki kosztuje 0 T za odpowiedź, ale zachowuje rzeczywisty koszt wykonania. Strajk ma jedną kartę z 17.5; osobnej karty konfliktu z przedsiębiorcami nie ma.

Stabilizacja jest dostępna przy kryzysie finansowym lub walutowym z 11.9 albo przy już otwartym projekcie, następnie w agendzie. Nie jest zwykłym wielokrotnym przełączaniem walut. Remont ogranicza się do dwóch obiektów z 12.8. Dawne pozycje 17–18 nie są odrębnymi kartami po rewizji B8+B10 i B20. MSZ pozostaje w podziale gabinetu bez talii dyplomatycznej i bez zastępczej premii ekonomicznej. Gabinet ustępujący kontynuuje wyłącznie dopuszczone bieżące zadania, nie nowe reformy.

**Jedna odpowiedzialność za działanie:** ID rodziny nie tworzy drugiego projektu. Inspekcja z 12.4 należy do karty 1, osłony do 2, `government.tax` i `government.collection` do 3 (Z — 0.37), instrument kredytowy może być podakcją 5 lub 6, a `government.army_control` do 14. Obie drogi do tej samej podakcji mają jeden koszt, odnowienie, rekord i efekty. Karta 11 przejmuje językowe warianty dawnego `government.education_program`; karta 10 zachowuje dostęp i świeckość. Nadal współdzielą kontrakt 12.7 i nie finansują dwa razy tego samego zakresu szkoły.

**Z — 0.37:** nie ma płatnych opcji utrzymania, odłożenia ani pozostawienia sprawy właścicielom; zamknięcie karty jest bezpłatne. Odmowa w karcie 15 zostaje, bo kieruje do formowania gabinetu. Otworzenie oraz podgląd karty nie zużywają czasu; potwierdzenie zwykłej decyzji stosuje jej koszt. Samo zamknięcie menu nie przesuwa zegara. Ponowne użycie tego samego wariantu wskazuje istniejący projekt albo nowy, rozłączny zakres, nigdy drugą premię za raz wykonaną politykę.

**K — etap 4 (0.45):** trzynaście rodzin ma polskie sceny `polish_gov_*` w `source/scenes/government_affairs/` (1–11, 13 i 16); rodziny 12, 14 i 15 wchodzą w etapie 7. Karta trafia do talii tylko przy resorcie PPS w aktywnym gabinecie. Opcje zależne od późniejszych systemów (układ zbiorowy, odstępstwo, spółdzielczy fundusz inwestycyjny, ratunek zakładu, przejęcie pod kontrolę publiczną, reprezentacja pracownicza, spółdzielcze przetwórstwo i sprzedaż, przegląd sprawy w Sprawiedliwości) oraz wywłaszczenie bez odszkodowania, które wymaga zmiany gwarancji własności, są widoczne i zablokowane z powodem; skutki dla komórek, zaufania i niezadowolenia czekają w `pending_effects` projektu.

**K — etap 6 (0.47):** opcje zależne od związków i zakładów działają: układ zbiorowy i odstępstwo w karcie 1, ratunek zakładu, przejęcie i reprezentacja w karcie 6. Zablokowane pozostają wywłaszczenie bez odszkodowania i przegląd sprawy w Sprawiedliwości (etap 7).

**K — etap 7 (0.48):** wszystkie 16 rodzin ma polskie sceny: doszły `polish_gov_interior` (12), `polish_gov_military` (14) i `polish_gov_pils_agreement` (15), a przegląd sprawy w Sprawiedliwości działa. Niemieckie karty są zablokowane warunkami polskiej gry; MSZ nie ma karty.

### 17.12. Skutki wariantów rządowych i granice wykonania

**1–2. Praca i świadczenia.** Inspekcja używa 12.4. Układ zbiorowy zapisuje pracodawcę, związek, objętych pracowników, warunki i termin w `Agreement`; efekt płacowy przechodzi raz przez 11.4. Odstępstwo ma `restriction_id`/podstawę prawną, zakres zakładów i datę wygaśnięcia; nie jest ogólnym usunięciem ochrony czasu pracy. **Z — 0.37:** układ zbiorowy to 1 T i 0 B, bo płaci podpisujący go pracodawca; działa przez płace (11.4) i nie podnosi presji kapitału. Odstępstwo to 1 T i 0 B; presja kapitału −4, niezadowolenie objętych pracowników +3; wygasa w zapisanym terminie. W projekcie osłon „rozszerzyć” podnosi zasięg (`scope`) o 1, najwyżej do 3: każdy poziom kosztuje +2 B miesięcznie, a nowo objęci odbiorcy dostają tę samą ulgę (−6 na start, potem 2). „Skupić” obejmuje połowę odbiorców, najbardziej potrzebujących, z pełną ulgą, za 1 B zamiast 2. Cięcie wymaga legalnej zmiany świadczenia. Ubytek dochodu odbiorców i naruszone obietnice rozliczają 5.4 i 9.2; nie dodajemy kary za samo odwiedzenie karty. Zasiłek nie zmniejsza `market_unemployment`.

**3–4. Finanse i stabilizacja.** Karta 3 wybiera instrumenty 11.9; pożyczka i podatek mają po jednym rekordzie. **Z — 0.37:** opcja „obciążyć szerokie grupy” ma trzy warianty z 11.9: podatki pośrednie, szerszą podstawę podatku albo cła fiskalne. Opcja „finansowanie z emisji” daje przed stabilizacją druk pieniądza w upoważnionym limicie 1–3 punktów, a po stabilizacji przejściowy bilon, 1 punkt przez 3 M. Opcja „usprawnić pobór” to `government.collection`: 1 T, 1 B przez 2 M, potem trwale +1 B, raz w rozdziale. Karta 4 wybiera `rapid_cuts`, `protected` albo `gradual`; od 0.37 bez płatnego `defer`, a brak decyzji to bezpłatne zamknięcie karty. P — szybka stabilizacja: budowa 2 B, 3 M, przyjęte cięcia co najmniej 1 B wskazanych wydatków; od uruchomienia szok celu kredytu +10 przez 3 M. Stabilizacja z osłonami: 2 B, 3 M, osłona pełna lub jawnie uzgodniona ograniczona oraz przyjęte pokrycie jej obciążenia; ten sam szok kredytu +10 przez 3 M, osłony rozliczane oddzielnie raz. Stopniowa stabilizacja: 1 B, 5 M, szok celu kredytu +5 przez 5 M; jeśli korzysta z emisji, uzgodniony limit musi wygasnąć najpóźniej przy przejściu do złotego. Dłuższe wykonanie zachowuje dłużej presję pieniężną marki. Koszt po wykonaniu 0; reżim zmienia się według 11.4. Wybór wariantu to przygotowanie/aktualizacja **jednego** projektu; wdrożenie przyjmuje konieczny pakiet, nie tworzy osobnych kart finansowania. Istniejące osłony lub podatki spełniają warunek bez ponownego uchwalania. Gdy reformę prowadzi gabinet bez PPS, stosuje te same koszty i wykonanie; wybór wariantu i finansowania przez ten gabinet określa profil 17.16.4. Wykonalność sprawdzono w kontrolowanych przebiegach M02 (17.16.10–11); balans pełnej kampanii pozostaje zadaniem prototypu.

**5–6. Inwestycje i zakłady.** Trzy sposoby kierowania kapitałem zachowują 11.9. `industrial_policy` zapisuje wariant `credit`, `orders`, `public_control` albo kontekstowy `worker_representation` (od 0.37 bez płatnego `owner_adjustment`) oraz konkretny problem i odbiorców. Reprezentacja dotyczy zarządzania uprawnionym przedsiębiorstwem i nie wymusza jego przejęcia. Kredyt używa instrumentu z 12.4 i limitu `creditSupport`; zamówienie ma rzeczowego odbiorcę, koszt i dostawę; przejęcie ma akt prawny, zakres własności, zarząd i środki działania. Żaden wariant nie leczy automatycznie wszystkich trzech problemów. Dla kredytu i zabezpieczenia zakładu zachowujemy ceny 12.4. **Z — 0.37:** zabezpieczenie przedsiębiorstwa to wariant opcji „warunkowy kredyt”: kredyt idzie albo ogólnie na rynek (+5 do celu kredytu), albo na ratunek jednego wskazanego zakładu, który przywraca jego utraconą zdolność (2 B budowy, 1 B działania, 2 M). Zamówienie ma przyjęty profil 17.12.1: jedna akcja, 1 B przez 3 M działania, +0,30 pp miesięcznego wkładu produkcji × wykonanie, najwyżej jeden aktywny pakiet. Brak interwencji nie generuje arbitralnego bankructwa: firma podlega już zapisanym problemom. Zobowiązanie utrzymania zatrudnienia jest rozliczane po wykonaniu, nie przy udzieleniu obietnicy.

**7. Roboty publiczne pod Pracą.** Wymagają `labor` i przyjętego finansowania; sam Skarb nie daje kompetencji Pracy. `employment`: 2 B budowy przez 3 M, potem 1 B działania i 2 jednostki; `infrastructure`: 2 B przez 4 M, potem 1 B i 2 jednostki; `housing`: 2 B przez 4 M, potem 1 B i ulga 2, bez dodatkowych jednostek zatrudnienia. Wszystkie są dużymi programami. Produkcja 0,15/0,25 pp na działającą jednostkę według 11.5; przy pełnych dwóch jednostkach 0,30/0,50 pp/M. To jeden efekt, nie dodatkowa premia. Zakończenie robót usuwa publiczne zatrudnienie, zachowując zapis zbudowanej infrastruktury. Transportowy zakres inwestycji nie daje PPS dowodzenia koleją, policją ani wojskiem.

**8–9. Wieś.** Warianty parcelacji i dostępu pozostają dokładnie jak w 12.6. Trzecia opcja modernizacji, `cooperative_processing_sales`, dodaje spółdzielcze przetwórstwo/sprzedaż. P — duży projekt: obciążenie 1 B przez 4 M, po ukończeniu 0 B, warunki objętych gospodarujących komórek +2 po zakończeniu; bez ogólnokrajowego bonusu dla bezrolnych, bez dopisywania przychodu R partii. Wymaga uzgodnionego wykonawcy spółdzielczego i ograniczonej transzy. Nie sumuje dla tego samego działania efektu wcześniejszego ogólnego „spółdzielczego usprawnienia”: rekord wskazuje, czy wykonano doradztwo, komasację, czy przetwórstwo/sprzedaż. Program państwowy i partyjna mała spółdzielnia mają odrębne źródła finansowania, bez podwójnego pokrycia tej samej faktury.

**10–11. Szkoły.** `rural_access`, `urban_worker_adult_access`, `secular` należą do karty 10; `own_language`, `agreed_bilingual`, `polish_dominance` do karty 11. Ceny, beneficjenci i skutki zgodnie z 12.7. Dostęp może współistnieć z zasadą językową lub świeckością; sprzeczne zasady językowe zmieniają istniejący projekt, nie tworzą równoległych nagród. Podpisany kompromis religijny albo mniejszościowy jest konkretną umową do rozliczenia. Oświata nie unieważnia zakazu MSW ani wyroku sądu samym wyborem wariantu. Ograniczona autonomia wymaga projektu MSW z 17.12.6; federalizacja pozostaje celem kontynuacji. Ludność nadal ma tylko trzy istniejące kategorie tożsamości.

**12–14. Aparat państwa.** Profesjonalizacja policji ma profil 17.12.2: 1 T, 1 B przez 3 M, po ukończeniu +10 dowodzenia i wykonywania legalnych poleceń raz w rozdziale. Śledztwo ma `case_id`, dostępne przesłanki, właściwy organ i wynik; etykieta `far_right`/`communist` wskazuje badaną sprawę, nie dowód winy. **Z — 0.37:** śledztwo kosztuje 1 T i 1 B przez 1 M, jak przegląd sprawy w Sprawiedliwości. Potwierdzone śledztwo przypisuje sprawę konkretnej partii w dzienniku 15.2. Ochrona zgromadzenia używa 17.2. Wymiar sprawiedliwości zachowuje `broad_safeguards` i `limited_redress` (od 0.37 bez płatnego `retain`): szeroki wariant prowadzi do tego samego projektu `democratic_guarantees`, ograniczony rozpatruje konkretną sprawę za 1 T i 1 B przez 1 M — 17.12.3. Nie tworzymy drugiej konstytucyjnej reformy, automatycznych korzystnych wyroków ani premii za deklarację.

Polityka wojskowa zapisuje `civilian_oversight`, `personnel_changes` albo `organizational_compromise` (od 0.37 bez płatnego `retain`). Każdy efekt dotyczy wskazanych funkcji i `force_ids`, po właściwym akcie i wykonaniu. Zmiana kadrowa nie odblokowuje automatycznie kompetencji do zmiany dowolnego dowódcy; profile nominacji i ich skutki muszą być jawne. Kompromis nie jest samoczynnym ustępstwem Piłsudskiemu: jeśli nadaje mu osobiste kompetencje, używa jednej umowy karty 15. Kontrola z 12.4 obciąża budżet o 1 B przez 3 M, potem koszt wynosi 0. Koszt, czas, wykonanie i odbiorcy skutków są określone w 17.12.2–4. Historyczne obsady i zakresy konkretnych stanowisk nadal wymagają danych: **TBD — historical research required**. Próby używają jawnego profilu syntetycznego; nazwa urzędu bez właściwego upoważnienia nie daje wpływu na dowolne zgrupowanie.

**15–16. Istniejące konkretne sprawy.** Ustępstwa wobec Piłsudskiego zachowują bramki, liczby i jednokrotność 16.7. Remont zachowuje 12.8. Nie tworzymy drugiego bonusu presji za przekazanie oferty do formowania gabinetu ani drugiej premii prestiżu za wejście do karty remontu.

**Dawne 17–18 — bez dodatkowych menu.** Reakcja państwa podczas strajku została włączona do 17.5. Sprzeciw przedsiębiorców nadal wynika z faktycznie przyjętych reform według 11.7, lecz nie uruchamia `government.business_conflict`. Podtrzymanie reformy pozostawia jej skutki, a korekta lub zastępcze finansowanie wymaga zwykłej karty właściwego resortu, pieniędzy i zgody wykonawcy. Nie naliczamy drugiego sprzeciwu za samo wyświetlenie informacji o konflikcie.

Wszystkie profile rządowe odczytują istniejące zasoby, projekty, umowy, sprawy i odbiorców. Nowe warianty mają dawać różne skutki polityczne bez nowych walut i paneli. Wartości szczególne zastępują ogólny skutek tej samej kategorii, zamiast go dodawać drugi raz. Akceptacja katalogu nie zamyka wcześniej odłożonej decyzji o ogólnym uproszczeniu modelu gospodarki.

**K — etap 6 (0.47):** układ zbiorowy (`S.unions[b].agreements`, `coll-<branża>-t<t>`) zapisuje pracodawców, związek, objętych, warunki płacowe i termin 12 M; 1 T, 0 B; skutek płacowy przez 11.4 jak klauzula ugody, bez zmiany presji kapitału. Blokady: otwarty spór branży, trwający układ i aktywna reakcja przedsiębiorców (P). Odstępstwo (`plant.exemption` z `restriction_id`; podstawą jest ustawa o czasie pracy z inspekcji) obejmuje jeden zakład na 6 M: 1 T, 0 B, presja −4, niezadowolenie objętych +3 dla etapu 7; wygasa w terminie. Zakłady mają profil `synthetic_plants_v1` (decyzja 2A etapu 6): zapis przy kryzysie kredytowym albo aktywnej reakcji przedsiębiorców (raz na epizod, przemysł) i przy strajku zakończonym wyczerpaniem (raz na branżę), z utraconą zdolnością 20 i 10% robotników branży; bez interwencji nic więcej się nie dzieje. Karta Przemysłu działa na zakładach przemysłu i warsztatach kolejowych: ratunek (12.4) i przejęcie ustawą z programem `fiscal` +2 (presja +15 przy wejściu w życie, zarząd publiczny). Opcje wskazują najstarszy pasujący zakład (P).

**K — etap 7 (0.48):** śledztwo przypisuje sprawę partii tylko wtedy, gdy wskazuje ją profil sprawy; zabójstwo prezydenta żadnej partii nie wskazuje. Obowiązująca delegacja autonomii blokuje centralne polecenie dominacji języka polskiego w szkołach obszaru.

#### 17.12.1. Zamówienia przemysłowe — jeden czasowy kontrakt

**Z — wykonalne w pierwszym rozdziale.** `orders` w istniejącej karcie Przemysłu oznacza jeden pakiet zamówień dla wskazanej zagrożonej branży. Rekord projektu i umowy zawiera przedmiot dostawy, dostawców, publicznego zamawiającego, beneficjentów oraz istniejące finansowanie. Nie jest to pełny model każdej firmy. Brak właściwego resortu/umowy wykonania, dopuszczalnej dostawy lub finansowania blokuje uruchomienie według 8.5 i 11.3; sama deklaracja nie daje efektu.

P — 1 T uruchamia kontrakt na trzy miesięczne rozliczenia `[started_at,started_at+3)`. Koszt startu 0, obciążenie działania 1 B/M, po wygaśnięciu 0. Pierwsze wykonanie jest w rozliczeniu uruchomienia; nie dodajemy miesiąca budowy. Przy `coverage=1/0.5/0` wkład w `activeOutputShock` wynosi odpowiednio 0,30/0,15/0 pp — raz w 11.5. Nie podnosi odrębnie kredytu, płac ani publicznych jednostek zatrudnienia. Po wygaśnięciu wkład ustaje; nie resetujemy już osiągniętego poziomu produkcji.

Kontrakt ma stały termin: niewykonane miesiące nie przedłużają go automatycznie. Miesiąc bez środków albo dostaw nie daje efektu, a rzeczywiste naruszenie zobowiązania oceniamy raz według 9.2. Niedostępny dostawca musi wynikać z zapisanej sprawy, nie z arbitralnego losowania upadłości. Niepełne finansowanie skalujemy raz, zachowując nominalny koszt zgodnie z 11.3. Najwyżej jeden aktywny pakiet w kraju; wznowienie menu nie zmienia końca ani nie otwiera drugiego. Kolejne zamówienie po wygaśnięciu wymaga nowej płatnej decyzji i wykonalnego kontraktu.

#### 17.12.2. Profesjonalizacja policji — wykonanie legalnych poleceń

**Z — wykonalne, raz w rozdziale.** Istniejąca karta MSW, 1 T; projekt obciąża budżet 1 B przez 3 M pełnego wdrażania, potem 0 B. Wymaga właściwego aktu, wykonawcy i zakresu policyjnego; nie obejmuje Milicji PPS ani wojska. Niedofinansowanie spowalnia lub zatrzymuje postęp według 12.3. Po pełnym ukończeniu `command=min(100,command+10)` i `lawful_compliance=min(100,lawful_compliance+10)` raz. Limit rozdziału odczytuje wykonany projekt i jego `effects_applied`, bez nowego miernika.

Wynik wykorzystuje istniejące `capacity*(command/100)*(lawful_compliance/100)` ochrony z 16.3. Przy początkowych 50/50/50 zdolność wynosi 12,5, po wykonaniu 50/60/60 — 18. To skutek zmiany parametrów, nie dodatkowy bonus +5,5. Zaufanie publiczne zmienia się dopiero przez rzeczywiste działania policji. Zmiana rządu nie cofa szkolenia, nie odnawia limitu i nie czyni policji organizacją PPS; polecenia nadal pochodzą od właściwych władz.

**K — etap 7 (0.48):** projekt `police_professionalization` (1 B przez 3 M); po ukończeniu dowodzenie i wykonywanie legalnych poleceń +10 raz, a zdolność ochrony rośnie z 12,5 do 18. Nowy gabinet ani powtórne wywołanie nie dają drugiego efektu.

#### 17.12.3. Sprawiedliwość — jedna sprawa albo wspólne gwarancje

`limited_redress`: 1 T, 1 B przez 1 M pełnego wykonania, potem 0. Wymagane `case_id`, konkretna restrykcja, właściwy organ i rozstrzygalny profil prawny. Projekt uruchamia przegląd, nie wyrok wybrany przez ministra. Po wykonaniu uprawniony organ odczytuje ustalone przesłanki: potwierdzona bezprawność pozwala uchylić wskazany `restriction_id`; brak podstaw kończy przegląd bez oczekiwanej ulgi. Usuwamy tylko skutek tej restrykcji (np. karę zasięgu prasy albo przyszłą ekspozycję na dany zakaz), bez zwrotu dawnych miesięcy, fikcyjnych odszkodowań i globalnego resetu represji. Brak wykonania zachowuje sprawę bez korzystnego wyniku. Ponowne rozpatrzenie tego samego materiału nie daje nagrody; nowa sprawa potrzebuje nowych przesłanek.

`broad_safeguards`: przekierowanie do jednego `democratic_guarantees` z 7.6. Przygotowanie, głosowania, 1 B przez 1 M po promulgacji i skutki pozostają dokładnie jego kosztami. Wejście przez kartę Sprawiedliwości nie dodaje etapu, skrótu ani drugiego projektu. Gwarancje otwierają prawną procedurę obrony, ale nie gwarantują rozstrzygnięcia każdej sprawy. Odmowa izb zatrzymuje tę reformę na dotychczasowych zasadach.

Bez decyzji system i faktyczne restrykcje zostają, a zamknięcie karty nic nie kosztuje (Z — 0.37). Wszystkie warianty odczytują właściwość organów: minister Oświaty lub Sprawiedliwości nie uchyla cudzego wyroku przez wybór nazwy polityki.

**K — etap 7 (0.48):** projekt `justice_review` (1 B przez 1 M) wskazuje pierwszą aktywną restrykcję bez przeglądu. Bezprawną uchyla (demokracja +1 raz), legalna zostaje (`no_grounds`), a bez wykonania przegląd nie daje wyniku.

#### 17.12.4. Nominacje jako wariant kontroli cywilnej

**Z — wykonalny mechanizm w ograniczonym zakresie.** `personnel_changes` wskazuje konkretną nominację w istniejącym projekcie kontroli cywilnej: przygotowanie 1 T, wdrożenie 1 T, 1 B przez 3 M pełnego wykonania, potem 0. `civilian_oversight` i jego wariant kadrowy nie są dwoma pakietami bonusów dla tej samej reformy. `organizational_compromise` wykonuje tylko uzgodniony zakres; jeśli nadaje Piłsudskiemu osobiste uprawnienia, korzysta z jednej umowy 16.7. Bez decyzji siły i presja się nie zmieniają; od 0.37 nie ma płatnego `retain`.

Profil nominacji musi wskazać `position_id`, `candidate_id`, dostępność/zgodę osoby, organ powołujący, podstawę i wymagane upoważnienie, `force_ids` oraz konkretny ewentualny konflikt. Wybór nie daje prawa do dowolnego stanowiska. Brak zgody, upoważnienia lub ważnej osoby zatrzymuje wykonanie i pokazuje przyczynę. Historyczne nazwiska i kompetencje: **TBD — historical research required**. Kontrola prototypowa może użyć oznaczonej syntetycznej funkcji nadzoru nad `near_reserve`, bez podszywania się pod rzeczywisty urząd lub oficera.

**K — etap 8 (0.49):** obsady i kompetencje stanowisk wojskowych 1922–1926 zapisuje `PL-ARMY-POSTS-1922-1926` (dokumentacja). Gabinety gry różnią się od historycznych, więc profil nominacji pozostaje syntetyczny (P), bez historycznych nazwisk.

Przy wykonaniu aktu: `delta=min(0.05,1-loyalty_legal)` dla wskazanej grupy; odejmujemy delta proporcjonalnie od pozostałych udziałów, zachowując sumę 1. Gotowość tej grupy ma −0,05 przez dwa miesiące od aktu, z dolną granicą 0; usunięcie modyfikatora nie nadpisuje innych zmian. Efekty są raz na zakres reformy; ponowienie nominacji lub przekierowanie przez inną kartę nie dodaje kolejnego +0,05. Siłę i zdolność przelicza 16.2, więc zmiana nie jest automatycznym zwycięstwem rządu.

Impuls +8 wymaga rzeczywistego epizodu konfliktu z 15.3, np. rozstrzygniętej spornej nominacji, i jednego ID skutku. Nie tworzymy epizodu za samo użycie karty ani nie powtarzamy go przy ukończeniu i wyświetleniu wyniku. Przy zgodnym wykonaniu bez takiego konfliktu impuls wynosi 0.

**K — etap 7 (0.48):** nominacja to wariant `personnel_changes` projektu `army_control`: po ukończeniu +0,05 lojalności legalnej `near_reserve` i gotowość −0,05 w dwóch następnych miesiącach; konflikt +8 przy relacji z Piłsudskim poniżej 40 (P).

#### 17.12.5. Reprezentacja w przedsiębiorstwie — dwa zakresy uprawnień

**Z — wykonalne w przedsiębiorstwach publicznych albo prywatnych objętych przyjętą umową właściciela.** Wybór zarządzania przy wskazanym przedsiębiorstwie z rodziny `government.industrial_policy`; właściwy projekt/umowa jest również dostępny Czapińskiemu. Nie wymaga ustroju rad, nie przenosi własności samym wyborem reprezentacji. Oba warianty używają jednego rekordu zakresu reprezentacji, `scope=1` dla zapisanych pracowników, bez osobnego krajowego poziomu rad.

| Wariant | Koszt i wykonanie P | Uprawnienie i bezpośredni skutek |
|---|---|---|
| `consultative` | Jedna akcja 1 T, 0 B; po wykonaniu uprawnionego aktu/umowy | Informacja i obowiązkowe konsultacje przed zmianą warunków zatrudnienia. Nie ma prawa weta. Grievance objętych pracowników −2 raz |
| `decision_rights` | Dwa etapy po 1 T, 1 B przez 2 M pełnego wdrażania, potem 0; odpowiednia podstawa prawna | Zgoda wskazanej reprezentacji wymagana na wymienione w umowie masowe zwolnienia i zmianę zasad wynagradzania. Grievance odbiorców −4 raz po wykonaniu |

Rekord zawiera `enterprise_ids`, `worker_actor_id`, `beneficiaries`, dostęp do informacji i `covered_decisions`. Reprezentant korzysta z istniejącego aktora związkowego oraz umów; nie utożsamiamy go automatycznie z PPS. Przy konsultacjach późniejsza decyzja zapisuje przedstawienie informacji i stanowisko, ale odmowa pracowników nie blokuje jej. Przy współdecydowaniu właściwa oferta wymaga ich zgody według 8.3; odmowa zatrzymuje objętą decyzję, nie całe państwo. Próba naruszenia uprawnienia uruchamia zwykłe naruszenie umowy lub sprawę represji; nie wykonuje potajemnie legalnej zgody.

Wdrożenie wymaga istniejących środków, właściciela/umowy, kompetencji i ważnej podstawy; brak upoważnienia nie jest kupowany budżetem lub odnowieniem doradcy. Niedofinansowanie spowalnia silniejszy wariant według 12.3. Wypowiedzenie/zmiana prawa wymaga właściwego aktu, bez resetowania nagród. Ulepszenie konsultacji do współdecydowania daje dla tych samych pracowników tylko brakującą różnicę ulgi −2, nie −2 i następnie −4; ponowny wybór nie daje nic. Zmianę przypisujemy tylko objętej części istniejących komórek. Koszt przejęcia przedsiębiorstwa pozostaje osobny od wdrożenia reprezentacji; za tę samą reformę nie naliczamy dwukrotnie reakcji kapitału lub zasługi.

**K — etap 6 (0.47):** reprezentacja jest w projekcie `enterprise_representation` z `policy_choices.worker_representation` i w rekordzie zakładu (`representation`: wariant, reprezentant `union:<branża>`, objęte decyzje). Działa tylko w zakładzie publicznym po przejęciu; umowy właściciela prywatnego zakładu ten rozdział jeszcze nie negocjuje. Konsultacje: 1 T, 0 B, grievance −2; współdecydowanie: przygotowanie w karcie i wdrożenie w agendzie z ustawą, 1 B przez 2 M, grievance −4 albo brakujące −2 po konsultacjach. Skutki czekają w `pending_effects` na etap 7.

#### 17.12.6. Ograniczona autonomia — ustawa i przekazane kompetencje

**Z — wykonalna autonomia administracyjno-kulturalna wybranego obszaru.** Dotyczy szkół, języka urzędowego i instytucji kultury w określonym zakresie przekazanym samorządowi. Nie ustanawia parlamentu regionalnego, własnej armii, granicy państwa ani osobnego modelu podatkowego.

Wejście: punkt uzgodnionego programu gabinetowego/umowy z partnerem mniejszościowym otwiera zwykłą dwustopniową agendę projektu 12.2; wykonawca MSW oraz Oświata w jej kompetencjach. Własna inicjatywa PPS wymaga właściwego udziału/wykonawcy rządowego. Karta partyjna tylko wybiera linię, a PPS poza rządem może negocjować wykonanie przez gabinet. Nie jest to druga samodzielna ustawa D ani nowa losowana karta.

P — przygotowanie 1 T, wdrożenie 1 T; 1 B przez 3 M pełnego wdrażania, potem 0. Przyjęta ustawa według 7.2 musi określać przekazywane kompetencje, obszar, uprawniony samorząd i wykonawców. Przy odmowie izb lub wykonawcy projekt nie działa; częściowe finansowanie spowalnia, brak finansowania zatrzymuje postęp. Obowiązujące przekazanie wymaga ustawy i wykonania; dopiero wtedy daje raz −3 grievance objętej ludności i rozlicza faktycznie spełnioną umowę. Sam udział mniejszości w umowie nie gwarantuje głosów całego klubu.

`Project.policy_choices` przechowuje `territory_id`, `recipient_authority_id`, `delegated_capabilities` i powiązanie `authorization_id/Agreement`; akt prawa oraz projekt mają jednego właściciela efektu. Późniejsza decyzja dotycząca tego samego obszaru musi odczytać delegację: organ centralny bez kompetencji nie może wykonać jej jako legalnego zwykłego polecenia. Zmiana zakresu wymaga odpowiedniego nowego aktu, a jego bezprawne naruszenie daje sprawę nadużycia i zobowiązań. Zmiana gabinetu lub cofnięcie partyjnego postulatu nie usuwa obowiązującego przekazania.

Nie tworzymy dodatkowej populacji ani przyznajemy ulgi wszystkim `other_minorities`. Profil wskazuje rzeczywistych odbiorców i ich udział w istniejących komórkach; przy braku danych historycznych test ma jawny zasięg syntetyczny. Ten sam obszar nie otrzymuje ponownie nagrody za tę samą delegację. Nowe szkoły i placówki wymagają odrębnego programu oświatowego i jego utrzymania; sama autonomia nie finansuje infrastruktury. Pełna autonomia polityczna należy do kontynuacji.

**Wspólny odczyt kompetencji:** sprawdzenie `stateCanExecute` z 8.5 odczytuje obowiązującą delegację dla działania/obszaru, a decyzja przedsiębiorstwa dodatkowo zakres reprezentacji 17.12.5. Brak uprawnienia lub wymaganej zgody blokuje legalne wykonanie. Jeżeli osobne wydarzenie opisuje bezprawne naruszenie, zapisuje je jako nadużycie/konflikt według dotychczasowych reguł, nie jako prawidłowo wykonany akt. Nie dodajemy kolejnej sceny kontroli każdej decyzji.

**K — etap 7 (0.48):** opcja autonomii jest na karcie MSW i wymaga umowy z reprezentacją innych mniejszości z punktem językowym albo szkolnym; ustawa z programem `autonomy` +1, potem 1 B przez 3 M. Po ukończeniu obowiązuje delegacja szkół, języka urzędowego i kultury syntetycznego obszaru, a objęta połowa innych mniejszości ma raz −3 niezadowolenia (P: −1,5 w ich komórkach).

#### 17.12.7. Granica programu i wykonania M07

| Opcja | Status w pierwszym rozdziale | Odczyt i komunikat |
|---|---|---|
| Zamówienia, policja, konkretna sprawa sądowa, nominacje, reprezentacja, ograniczona autonomia | Wykonalne w opisanym zakresie | Koszt, prawo, wykonawca, termin, faktyczny wynik; niepowodzenie nie daje nagrody |
| Szerokie gwarancje wymiaru sprawiedliwości | Wspólny projekt demokratyzacji 7.6 | Jeden projekt i jedno wykonanie niezależnie od wejścia przez kartę |
| Rady robotnicze jako ustrój | Bieżący program; pełne wykonanie w kontynuacji | Frakcje, kampanie i zgodność ofert z 10.8; dostępna reprezentacja w przedsiębiorstwach jako osobne działanie |
| Federacja | Bieżący program; pełne wykonanie w kontynuacji | Oś programu w 10.8/8.3, umowy i zgodne kroki pośrednie; żadnego przycisku „wprowadź federację” |
| Pełna autonomia polityczna z regionalnym parlamentem | Kontynuacja | Zapisany cel, bez osobnego regionalnego parlamentu lub niedokończonego projektu w tej kampanii |

Każdy wynik rozróżnia stanowisko, projekt w toku i wykonany akt. Raport 19 zachowuje program oraz zrealizowane projekty oddzielnie. Zmiana programu nie cofa prawa, a wybór odłożonego celu nie pobiera pieniędzy za jego nieistniejące wdrożenie. M07 jest domknięte na poziomie mechanik i zakresu; dane historyczne, obsady wojskowe M08 oraz balans pozostają zadaniami implementacji/prototypu.

### 17.13. Rewizja B1–B21: obowiązujący podział scen

**Z — uwagi użytkownika z 10 września 2026, wersja 0.8.** Oznaczenia B odnoszą się do propozycji przedstawionej w rozmowie; nie są nową talią 21 kart. Poniższa mapa ma pierwszeństwo przed wcześniejszymi rejestrami decyzji. Usunięcie menu nie usuwa gospodarczych, instytucjonalnych i organizacyjnych skutków już wykonanych działań.

| Dawna scena | Aktualna postać |
|---|---|
| B1 — kryzys gabinetowy 1922 | Trzy odpowiedzi: kandydat Piłsudskiego, kompromis parlamentarny, opozycja. Bez osobnego warunku ustępstwa; jedna sekwencja formowania |
| B2 — krytyka parlamentu | Poprzeć krytykę; bronić parlamentu; poprzeć reformę zwiększającą skuteczność. Trzeci wybór wspiera linię i zmniejsza dissent Centrum o 2 P, bez odblokowania projektu/ścieżki; 10.7 |
| B3 — zagrożenie prezydenta | Pominięte menu. Zagrożenie i wcześniejsza ochrona rozliczają się bez nowego wyboru; sukcesja i B4 pozostają |
| B4 — mobilizacja po zabójstwie | Obrona republiki; powściągliwość i sukcesja; odwet. Bez wariantu łączącego mobilizację z żądaniem odpowiedzialności instytucji; 17.6 |
| B5 — kult Niewiadomskiego | Potępić kult i nie zakłócać; zorganizować mszę w obronie demokracji; nie angażować organizacji. Trzy wybory; 17.7 |
| B6 — konfiskata prasy | Usunięta osobna karta i jej menu. Rzeczywiste ograniczenia publikacji nadal mogą działać w modelu prasy |
| B7 — Chjeno-Piast 1923 | Bez osobnej karty; kandydatura i udział PPS w zwykłym formowaniu gabinetu 8.8 |
| B8+B10 — strajki i reakcja państwa | Jedna karta: rokowania, ograniczony strajk ekonomiczny, strajk z żądaniem dymisji. Kompetencje państwowe rozliczane w tej samej fazie; 17.5 |
| B9 — współpraca komunistyczna | Pełna, lekka, brak — bez zmiany, nadal oddzielny wybór partnera przed wynikiem strajku |
| B11+B12 — ugoda i odpowiedź Sejmu | Jedno menu: żądania/uzupełnienie oferty; ugoda i uzgodniony koniec; porządek i wezwanie do końca bez nowych ustępstw; 17.5.1 |
| B13 — model sowiecki | Zwykła karta partii `party.ussr_position`, trzy dotychczasowe stanowiska; 10.10 |
| B14 — stabilizacja | Właściwa karta Skarbu lub trzy odpowiedzi w ofercie tolerowania eksperta, 9.7; bez poparcia pakietu bez umowy. Organizacja, kontakt, zgoda i finansowanie wymagane |
| B15 — Żyrardów | Usunięta karta, jej menu i premie; źródła historyczne zachowane |
| B16 — kryzys kredytowy | Cztery odpowiedzi tylko przy kompetencjach opisanych niżej |
| B17 — ziemia/prawa językowe | Usunięte dodatkowe wydarzenie. Polityki ziemskie i oświatowe pozostają w swoich zwykłych kartach i projektach |
| B18 — szeroki gabinet | Wejście, poparcie z zewnątrz albo opozycja wyłącznie w negocjacji 8.8; aktualna bramka kryzysu, głosy, kandydat i program |
| B19 — oszczędności naruszają umowę | Cztery odpowiedzi istniejącej karty 9.8: negocjować ustępstwa, przekonywać, utrzymać poparcie, wycofać poparcie/ministrów |
| B20 — odmowa przedsiębiorców | Usunięte menu; sprzeciw i ewentualne ograniczenie inwestycji wynikają z 11.7, nie z kliknięcia wydarzenia |
| B21 — powrót Chjeno-Piasta 1926 | Bez dodatkowej karty przygotowawczej. Rzeczywisty powrót aktualizuje presję raz; rozpoczęta próba zamachu zachowuje własną sekwencję i kończy rozdział po wyniku |

**B16 — dostęp i wykonanie:** kryzys to istniejący warunek z 17.3. Menu pokazujemy, gdy przynajmniej jedna z trzech interwencji ma rzeczywisty dostęp wykonawczy PPS. Samo tolerowanie gabinetu, dobra relacja lub wysoki leverage nie są takim dostępem. Każdy przycisk podaje powód blokady, jeśli brak prawa, środków albo właściwego wykonawcy. Odmowa interwencji jest zawsze możliwa po otwarciu menu, bez premii. PPS bez dostępu otrzymuje informację o kryzysie; może użyć zwykłej karty stosunku do rządu, bez dodatkowego darmowego żądania resortowej interwencji.

| Odpowiedź B16 | Kompetencja i rozliczenie |
|---|---|
| Uruchomić warunkowy kredyt dla zagrożonej działalności | Właściwy instrument Skarbu/Przemysłu i Handlu lub przyjęty kontrakt wykonania; podakcja kart 5/6, limit kredytu i ryzyko z istniejącego programu |
| Podtrzymać zatrudnienie przez zamówienia lub przygotowane roboty publiczne | Zamówienie przez właściwego zamawiającego albo gotowy projekt Pracy. Wskazanie projektu w tym wariancie nie daje dodatkowej interwencji ani nie kończy przygotowania z automatu |
| Skupić środki na osłonach dla osób tracących pracę | Praca lub przyjęty wykonawca; karta 2, legalne świadczenie i faktycznie opłaceni beneficjenci; brak automatycznego spadku bezrobocia |
| Nie podejmować nowej interwencji | Brak nowego wydatku i premii; dotychczasowe zobowiązania oraz gospodarcze następstwa kryzysu pozostają |

Pierwsza odpowiedź to P: 0 T, raz na `crisis_id`; koszty i odnowienia wskazanej interwencji pozostają normalne. Nie przeskakuje etapów projektu ani nie pozwala ponawiać wypłaty za to samo zdarzenie. Zmiana zakresu/czasu istniejącej polityki zapisuje się w jej projekcie, nie w drugim saldzie kryzysu.

Źródło decyzji: `PL-EVENTS-B-REVIEW-2026-09-10` w [HISTORICAL_SOURCES.md](../HISTORICAL_SOURCES.md). Parametry organizacyjne i liczbowe są P; msza to alternatywa projektowa, nie nowa teza historyczna.

**K — etap 7 (0.48):** B1–B5 są wdrożone zgodnie z mapą: B1 `polish_event_cabinet_1922`, B2 `polish_event_pils_criticism`, B3 w sekwencji prezydenckiej bez menu, B4 `polish_event_assassination_response` i B5 `polish_event_niewiadomski_cult`. B6, B15, B17 i B20 nie mają scen.

### 17.14. Uproszczone sceny C1–C9

**Z — rewizja użytkownika, 11 września 2026.** Priorytetem jest krótki wybór polityczny i wynik, bliższy prostocie niemieckiego wzorca. Poniższe sceny nie są dodatkową talią; techniczne zapisy głosów i umów nie mają własnych ekranów negocjacyjnych.

| Dawna scena | Aktualny wybór i wynik |
|---|---|
| C1 — oferta gabinetowa | Jeden ekran: układ i premier, wejście/tolerowanie/opozycja, program, poparcie mniejszości i resorty. Jedno zatwierdzenie i wynik; 8.8 |
| C2 — kontrpropozycja partnera | Usunięte menu. Ocena przyjęcie/odmowa z podaniem przyczyny, bez targowania się w kolejnych rundach; 8.3 |
| C3 — porozumienie wyborcze | Samodzielna PPS, PPS–Wyzwolenie, PPS–NPR, dostępny Centrolew albo porozumienie z istniejącym blokiem ludowym. Następnie wynik. Bez negocjacji programu i kandydatur; stały profil sojuszu w 6.5 |
| C4 — procedowanie ustawy | Brak osobnej sceny wyborów lub menu Senatu. Po decyzji w zwykłej karcie ustawy wynik wynika z głosów, programu i prawa; 7.2 |
| C5 — marszałek | Poprzeć Śmiarowskiego, Rataja albo zgłosić/popierać Daszyńskiego, według dostępności; pokazać wynik i konsekwencję dla sukcesji |
| C6 — prezydent | Zgłosić dostępnego kandydata PPS albo nie zgłaszać; następnie końcowy wynik, bez pośrednich tur |
| C7 — odwołanie gabinetu | Poprzeć odwołanie albo odmówić. Po reformie konstruktywnego wotum poparcie wymaga dostępnego uzgodnionego następcy; rząd może przetrwać mimo wyjścia PPS |
| C8 — przedterminowe wybory | Usunięta karta oraz cztery inicjatywy z jej menu. Legalny kalendarz i już zarządzone wybory zachowane; 7.4 |
| C9 — wakancja prezydencka | Usunięta osobna scena informacyjna. Zapis zastępstwa automatyczny, informacja w wyborze następcy C6 i dzienniku; B4 pozostaje po rzeczywistym zabójstwie |

C5–C7 zachowują dotychczasowe warunki i koszty odpowiedzi w swojej sprawie. C7 jest prostym głosowaniem w istniejącej rodzinie stosunku do rządu, nie jedenastą powtarzalną kartą. Zapis po zatwierdzeniu C1/C3 zachowuje wybór i wynik; wczytanie nie wraca do dodatkowej negocjacji. Brak osobnego ekranu C9 nie pozostawia pustego zastępstwa, a brak C4 nie daje automatycznie uchwalonej ustawy. Parametry pozostałych systemów nie są przebudowywane przy tej rewizji.

Źródło: `PL-C-SCENES-REVIEW-2026-09-11` w [HISTORICAL_SOURCES.md](../HISTORICAL_SOURCES.md). Zmiana dokumentacji, bez wdrożenia w Dendry.

### 17.15. Zatwierdzone uproszczenie D–G

**Z — ten manifest zastępuje wcześniejsze propozycje dodatkowych scen D–G.** Liczby, identyfikatory i szczegóły rozliczenia oznaczone P są projektem do testów. Usunięcie sceny nie usuwa już istniejących skutków gospodarczych, posłuchu, umów ani głosowań. Nie przenosimy jej menu do nowej „agendy kryzysu”.

#### D — jedna ustawa, dwie karty

**Ustawa o zabezpieczeniu bezrobotnych** jest projektem rozgrywki, nie twierdzeniem o przebiegu historycznego procesu legislacyjnego. Jedna inicjatywa w pierwszym rozdziale; dostęp dopiero po wyborach 1922 i tylko gdy `pps_mode != member`. Zewnętrzne poparcie rządu jej nie blokuje. Reforma stabilizująca gabinety należy do karty **Reforma konstytucyjna**, wariant `constructive_vonc` (7.6), nie jest drugą ustawą D.

| Karta | Dokładne wybory | Wynik i czas P |
|---|---|---|
| **D1. Projekt zabezpieczenia bezrobotnych** | **Rozpocząć inicjatywę ustawodawczą PPS** / **Nie podejmować inicjatywy** | Rozpoczęcie: 1 T, gotowy pełny projekt z ustalonym kosztem, źródłem finansowania i wykonawcą; bez osobnego przygotowywania dokumentacji. Odmowa: 0 T, zamknięcie oferty na rozdział, bez premii |
| **D2. Poparcie dla ustawy** | **Podtrzymać pełny projekt PPS** / **Przyjąć ograniczony wariant dla uzyskania szerszego poparcia**. Gdy brak rzeczywistej oferty kompromisu, drugi wybór brzmi **Wycofać projekt** | Po D1 gwarantowane następne okno parlamentarne; 0 T za odpowiedź. Wybór wersji i wynik Sejmu w tej samej karcie, potem datowana procedura automatyczna. Wycofanie kończy inicjatywę; oczekiwanie nie odbiera kolejnych zwykłych akcji |

P — D1 w gwarantowanej agendzie po pierwszych wyborach nie musi być podejmowana natychmiast. Wyraźne „nie podejmować” zamyka tę ofertę. Po rozpoczęciu D2 pojawia się po rozliczeniu miesiąca D1; obowiązkowy kryzys ma pierwszeństwo. Jeżeli PPS tymczasem wejdzie do rządu, D2 jest zawieszona do ponownego wyjścia, bez nowej opłaty i bez resetu inicjatywy. Koniec rozdziału zapisuje niedokończony projekt, zamiast wymuszać dodatkową scenę po zakończeniu.

Kompromis wymaga konkretnego klubu gotowego poprzeć ograniczony wariant; odczytujemy stanowiska, relacje i zobowiązania według 7–9. Nie wystarczy przycisk „kompromis” ani sam wysoki wynik relacji. Pełny projekt można poddać głosowaniu mimo braku większości; może upaść. Większość Sejmu i właściwa procedura Senatu rozstrzygają automatycznie, bez trzeciej karty. Przychylność partnera nie gwarantuje głosów całej izby.

P — pełny wariant ma obciążenie 2 B podczas działania, bez osobnego kosztu startu; początkowa ulga −6 i bieżąca 2. Ograniczony wariant obejmuje tych samych uprawnionych, lecz niższe świadczenie: obciążenie 1 B, ulgi −3 i 1. Oba mają stały zakres `scope=1` i działają od pierwszego rozliczenia po wejściu ustawy w życie, według wyjątku świadczeń w 12.3; nie czekają dodatkowego miesiąca wykonania. To stały kompromis, bez dodatkowego suwaka. Ustawa tworzy zobowiązanie budżetowe; przed głosowaniem widoczny jest prognozowany budżet i wykonanie. Nie dodaje nowego podatku ani nie wymaga trzeciej karty, a brak środków nie uniemożliwia samego głosowania.

Po wejściu ustawy w życie wykonawcą jest administracja Pracy, także bez ministra PPS i w zakresie bieżących obowiązków gabinetu ustępującego. `stateCanExecute` oraz budżet wyznaczają wykonanie 1/0,5/0; informacja o ograniczeniu trafia do panelu i umowy, bez D3. Pełna osłona przy mnożniku 0,5 daje bieżącą ulgę 1, lecz nadal zobowiązuje do pełnej kwoty: to niewykonanie, a nie automatycznie uzgodniony kompromis. Formalnie uzgodniony wariant ograniczony przy mnożniku 1 również daje ulgę 1, ale realizuje własną mniejszą obietnicę. Ustawa i karta rządowa używają tego samego identyfikatora programu; wejście PPS do rządu go nie kasuje ani nie dubluje.

**Z — M05, jeden kalendarz, bez trzeciej karty.** „Bez dodatkowego miesiąca” oznacza koszt D2 równy 0 T, a nie wyłączenie upływu czasu prawnego. Poniższe terminy realizacji są uproszczeniem P na potrzeby gry, korzystającym z ram 7.2; nie odtworzeniem historycznej drogi tej ustawy.

| Etap | Termin P i rozstrzygnięcie | Stan i skutek |
|---|---|---|
| D2: wybór i Sejm | Data D2 (`submitted_at`); przy braku dokładniejszej daty pierwszy dzień bieżącego miesiąca. Jedno głosowanie według 7.1 | Odmowa lub brak kworum: `rejected`, wycofanie: `withdrawn`. Sukces: `in_procedure`; karta pokazuje „Sejm przyjął, oczekuje na Senat”, bez wypłat |
| Senat | `submitted_at + 30 dni`: automatycznie odczytuje aktualne stanowiska i umowy. Bez zgłoszonych zarzutów kończy ten etap; zgłoszenie zmian zapisuje ich konkretny wariant i termin zwrotu | Bez zarzutów: finał procedury tego dnia. Ze zmianami: oczekiwanie do `submitted_at + 60 dni`, bez menu i blokowania zwykłej tury |
| Zmiany Senatu i ponowny Sejm | W dniu zwrotu (+60): przyjęcie zmian zwykłą większością; jeśli nieprzyjęte, odrzucenie zmian progiem 11/20 z 7.2. PPS głosuje zgodnie z zamkniętym wariantem i umowami | Przyjęcie zmian daje tekst zmieniony; skuteczne odrzucenie zmian zachowuje tekst Sejmu. Brak obu większości lub kworum kończy D jako `rejected`, bez ponownej darmowej próby |
| Ogłoszenie i wejście w życie | Po pomyślnym finale: automatyczna promulgacja i `effective_at` tego samego dnia — jawne uproszczenie P, bez osobnego okresu oczekiwania | `enacted`; powstaje obowiązujący program i zobowiązanie budżetowe. Nie dodajemy głosowania prezydenckiego ani uznaniowego weta |
| Pierwsze rozliczenie | Pierwszy niezamknięty okres obejmujący dzień `effective_at`; koszt i wykonanie przed gospodarką tego okresu | 2 B lub 1 B oraz wykonanie 1/0,5/0. Przy zerze brak wypłaty, ulgi i nagrody; obowiązek pozostaje do wykonania |

Poprawki Senatu pozostają w dwóch już opisanych profilach świadczenia, bez nowych podatków lub nowego projektu. PPS popiera poprawkę tylko w dopuszczalnym zakresie zapisanym przy D2; pozostali głosują według swoich aktualnych deklaracji. Przyjęte przez izby ograniczenie może być polityczną porażką pełnego postulatu PPS, ale wykonujemy rzeczywiście uchwalony wariant, a nie odrzucony pierwotny koszt. „Kompromis” w D2 wymaga aktualnego partnera; późniejsza poprawka Senatu nie jest dodatkowym wyborem kompromisu gracza.

Scheduler obsługuje należne daty chronologicznie przed finansami w 4.2, do końca rozliczanego okresu lub wcześniejszej daty zamknięcia rozdziału. Termin +30 nie może uruchomić przedwcześnie terminu +60. Nie cofamy zamkniętych miesięcy; zapis wczytany przed etapem wykonuje go raz, zapis po etapie odczytuje wynik. D w toku nie blokuje kolejki zwykłych akcji. Wejście PPS do rządu **po D2** nie zatrzymuje procedury; zawieszenie dotyczy tylko jeszcze niewybranej D2. Rozwiązanie Sejmu przed finałem zamyka niezakończoną inicjatywę jako `expired` (uproszczenie P); granica rozdziału zapisuje stan bez rozliczania przyszłych dat.

Przykład P: D1 w I 1923, D2 i zgoda Sejmu 1 II. Bez zarzutów Senatu ustawa wchodzi w życie 3 III i jest rozliczana w marcu. Przy zmianach zwróconych 2 IV i pomyślnym finale — w kwietniu. Luty nie ma wypłat z tej ustawy. Gracz wykonuje zwykłe akcje w czasie oczekiwania.

Finansowanie zapisujemy przy D1 jako istniejące `financing_policy_ids` i/lub budżet ogólny, ponownie pokazujemy prognozę przy D2. Sam wpis źródła nie tworzy podatku ani rezerwacji pieniędzy. Właściwy budżet jest liczony ponownie przy wypłacie. `sponsor=pps`, `executor=labor_administration`, udziały zasługi 5.4; nie trzeba mieć ministra PPS. Przyjęcie ustawy nie tworzy nowej rządowej inicjatywy przygotowania lub uruchomienia, a należna wypłata jest wykonaniem obowiązku.

`chapter.unemployment_bill` P zapisuje `status=available|pending|in_procedure|declined|withdrawn|rejected|expired|enacted`, wybrany i ostatecznie uchwalony wariant, `project_id`, `ballot_ids`, `submitted_at`, `senate_notice_due`, `senate_return_due`, `effective_at`, `next_step`, dopuszczalny zakres kompromisu oraz rozliczone identyfikatory akcji/etapów. Tylko `pending` może otworzyć D2. Autorstwo, wykonawca, finansowanie i jednorazowa nagroda są zapisane w powiązanym projekcie; nie dublujemy ich w drugim programie.

Jeden projekt osłon dla tych odbiorców: D i karta Pracy odwołują się do tego samego wykonania, bez podwójnej wypłaty i premii. Ponowne wejście do agendy, odnowienie doradcy, objęcie resortu ani odrzucenie ustawy nie resetują jednorazowego D. W przypadku już działającego programu naliczamy wyłącznie rzeczywistą zmianę uprawnień i kosztu, bez powtórzenia nagrodzonych efektów. Kolejna kadencja kończy rozdział, więc limit nie odnawia się w trakcie tej kampanii.

#### E — dwie reakcje organizacyjne

| Karta | Warunek | Dokładne wybory |
|---|---|---|
| **E3. Część frakcji grozi odejściem** / `party.faction_split` (Z — 0.38) | Wysoki sprzeciw, konkretna grupa i wykonalne żądanie; 10.2 | **Przyjąć żądanie i zachować jedność** / **Utrzymać linię PPS i zaakceptować rozłam** |
| **E6. Uczestnicy odrzucają ugodę** / `society.strike_settlement_rejection` (Z — 0.38) | Przyjęta przez PPS ugoda i rzeczywista odmowa części uczestników strajku; 14.5 | **Podtrzymać ugodę i wezwać do zakończenia strajku** / **Poprzeć dalszy strajk** |

Obie są obowiązkową odpowiedzią 0 T, nie darmową akcją organizacyjną. E3 domyślnie nie usuwa żadnego doradcy. Tylko wyjątkowy jawny manifest może wskazać konkretną osobę odchodzącą z grupą. Usunięte E1, E2, E4, E5, E7, E8 i E9 nie wracają jako osobne decyzje o ostrzeżeniu, wykonaniu rozłamu, odmowie organizacji lub pieniądzach. Zwykła polityka partyjna, dyscyplina i świadome wykluczenia pozostają odrębnymi kartami PPS.

#### F — krótka sekwencja zamachu

| Scena | Treść / wybory |
|---|---|
| **F3. Rozpoczęcie zamachu** | Informacja o rozpoczętej próbie; może stanowić wstęp do F4, bez osobnej decyzji |
| **F4. Stanowisko PPS** | **Poprzeć Piłsudskiego** / **Bronić legalnego rządu** / **Zachować neutralność** |
| **F5. Zaangażowanie organizacji** | **Związki i kolej** / **Milicja** / **Oba narzędzia** / **Nie angażować organizacji**; warunki 16.4. Neutralność: tylko ochrona własnych ludzi przez Milicję albo brak udziału |
| **F6+F7. Mobilizacja i układ sił** | Jedna scena bez decyzji: kto wykonał wezwanie, jaki jest wpływ kolei na posiłki i rzeczywisty bilans. Bez osobnego menu odmowy organizacji |
| **F9. Propozycja kompromisu** | Tylko przy istotnym udziale PPS w walkach i ofercie, którą pozostałe strony są gotowe przyjąć (16.8.6): **Poprzeć przedstawiony kompromis** / **Odrzucić i utrzymać zaangażowanie** |
| **F10+F11. Wynik zamachu i konsekwencje dla PPS** | Jeden wynik bez decyzji: rozstrzygnięcie, straty, frakcje, relacje i zobowiązania. Początek końcowego raportu G8 |

**Bramka F9 — Z, 0.20 (M08):** PPS popiera jedną ze stron, a jej udział jest istotny w walkach. Oznacza to, że strajk rzeczywiście opóźnił co najmniej jedno zgrupowanie albo Milicja/AS daje co najmniej 1/10 siły popieranej strony (16.8.6). Nie wystarczają sama deklaracja poparcia, symboliczny udział ani ochrona własnych ludzi przy neutralności.

F9 pojawia się dopiero wtedy, gdy wszystkie pozostałe wymagane strony oceniają konkretną ofertę na co najmniej 60. Decyzja PPS przesądza więc o ugodzie. Najwyżej jedna F9 na próbę, bez negocjowania własnego pakietu i ponawiania odrzuconej oferty. Przy istotnym udziale każda oferta zawiera klauzulę końca mobilizacji PPS, dlatego odrzucenie zamyka drogę do ugody do końca próby, także w ocenie końcowej. Bez istotnego udziału PPS pozostali aktorzy porozumiewają się automatycznie, a ugoda nie zapisuje zobowiązań w imieniu PPS; wynik pokaże jej skutki.

Usuwamy F1 i F2 jako osobne sceny przygotowania/ostatniej oferty oraz F8 jako ponowny wybór taktyczny. Zwykłe działania przed zamachem pozostają. F4–F9 nie zużywają miesięcy; silnik rozlicza transport i maksymalnie cztery wewnętrzne rundy według 16.6. Nie zapisuje wyniku przed ostatnim dostępnym wyborem. Straty i ewentualny rozłam po zamachu są skutkiem w F10+F11, bez dodatkowej decyzji E3 po zakończeniu rozdziału; doradcy wymagają jawnego manifestu odejścia. Pełny profil F, w tym rundy, oferty i skutki F10+F11: 16.8.

#### G — informacje i granice kampanii

| Scena / operacja | Zachowanie |
|---|---|
| **G1. Początek kampanii** | Styczeń 1922, krótka sytuacja PPS; **Rozpocznij**, bez premii za kliknięcie |
| **G4. Zbliżają się wybory** | Przypomnienie aktualnego legalnego terminu i stanu sojuszu; przygotowania przez istniejące karty, bez dodatkowej darmowej akcji |
| **G6. Wynik wyborów 1922** | Głosy i mandaty; następnie istniejące wybory urzędów i formowanie gabinetu. Bez wyboru „interpretacji wyniku” |
| **G7. Wynik następnych legalnych wyborów** | Wynik zamyka rozdział przed kolejnym formowaniem rządu, także gdy wybory były przedterminowe |
| **G8. Raport końca rozdziału** | Jeden raport z 19.2; F10+F11 albo G7 jest jego początkiem, nie dodatkowymi ekranami tego samego wyniku |
| **G9. Wczytanie kampanii** | Operacja przywrócenia stanu, bez nowej sceny i decyzji; 19.3 |

G2 i G3 nie są osobnymi ekranami początku/końca każdego miesiąca: wystarczy zwykły interfejs i panel zmian. G5 nie jest potwierdzeniem zamknięcia list: termin blokuje zapisane listy automatycznie według reguł wyborów. Stan decyzji, naliczone efekty i miejsce w sekwencji są zapisywane; wczytanie nie powtarza głosowania, kosztu, strat ani losowania.

**K — etap 4 (0.45):** D1 (1 T) i D2 (0 T) są stałą kartą `polish_unemployment_bill` po wyborach 1922, poza gabinetem. Wariant ograniczony wymaga klubu gotowego poprzeć tylko jego; wycofanie jest dostępne tylko bez kompromisu. Po wejściu w życie powstaje albo zmienia się jedna osłona dla tych odbiorców: 2 B albo 1 B od okresu `effective_at`, wykonawca `labor_administration`, udział PPS 0,40.

### 17.16. Scenariusz Normalny — `normal_chapter1_v1`

**Z — zatwierdzony 20 IX 2026:** jeden scenariusz od I 1922 do wyniku rozpoczętej próby zamachu albo pierwszych legalnych wyborów parlamentarnych po 1922. Obejmuje kalendarz presji, samodzielne działania gabinetów, przejścia między kryzysami i dalszą grę bez zamachu. Nie dodaje talii, resortu ani poziomu trudności. **P — liczby są zatwierdzonym zestawem do pierwszych testów, nie skalibrowanym balansem ani statystykami historycznymi.** Źródło decyzji i selekcja materiału: `PL-NORMAL-SCENARIO-2026-09-20` w `HISTORICAL_SOURCES.md`.

#### 17.16.1. Otwarcie, zegar i zapis

Profil używa otwarcia z 3: Ponikowski, tolerowanie przez PPS bez resortów, istniejące mandaty i organizacje; gospodarka `economy_simple_v1`, m.in. inflacja 4, płace/produkcja 100, kredyt 55, bazowy budżet 2. Wynik wyborów 1922 jest obliczany, nie nadpisywany wynikiem potrzebnym następnemu premierowi. Premia historycznego kandydata +8 z 8.7 dotyczy tylko wykonalnych, zaakceptowanych ofert.

P — zapis `S.scenario={profile_id:"normal_chapter1_v1",version:5,npc_reviewed_time:null}` identyfikuje jeden obowiązujący manifest. To metadane, nie przełącznik w interfejsie. Presje przechowuje istniejące `S.economy.shocks`, a sprawy polityczne `EventRun`, umowy i historia. Każdy szok ma `id,channel,value,starts_at,ends_at,condition,source_ref`; przedziały są lewostronnie domknięte jak w 11.9. W tabelach niżej podano ostatni aktywny miesiąc włącznie; np. VI–XII 1925 zapisuje się jako `[timeOf(1925,6),timeOf(1926,1))`. `ends_at=null` oznacza brak kalendarzowego końca, nie brak warunku reżimu.

Przed krokiem finansów w 4.2 aktywujemy efekty z osiągniętym `first_effect_time` (w tym złoty), dobieramy szoki okresu i wykonujemy najwyżej jeden przegląd inicjatyw gabinetu z 17.16.4. Wymagane odpowiedzi PPS następują przed zatwierdzeniem pakietu i gospodarką. Potem jest jedno rozliczenie finansów, gospodarki i społeczeństwa; progi oparte na zakończonych miesiącach tworzą sprawę do kolejki następnego miesiąca. Zapis w trakcie odpowiedzi zachowuje fazę transakcji; wczytanie nie rozpoczyna przeglądu ani miesiąca ponownie. Metadane scenariusza i przyczyny zmian przechodzą do raportu 19.

#### 17.16.2. Presje gospodarcze — kompletne wejścia pierwszego testu

| ID / okres włącznie | Kanał i wartość P | Warunek, koniec i interpretacja |
|---|---|---|
| `marka_1922_h1` / I–VI 1922 | `monetary` = 8 | Tylko `marka` lub `stabilizing` |
| `marka_1922_h2` / VII–XII 1922 | `monetary` = 15 | Zastępuje poprzedni przedział; nie dodaje do 8 |
| `marka_1923_h1` / I–VI 1923 | `monetary` = 30 | Jak wyżej |
| `marka_1923_q3` / VII–IX 1923 | `monetary` = 60 | Jak wyżej |
| `marka_crisis` / od X 1923 | `monetary` = 120 | Utrzymuje się do skutecznego przejścia do złotego; nie wygasa tylko dlatego, że nadszedł 1924 |
| `rural_1924` / IX 1924–II 1925 | `agrarian` = +1/M | Sześć dodatnich impulsów; potem kanał 0, bez resetowania presji agrarnej |
| `credit_1925` / VI–XII 1925 | `credit` = +12; `output` = −0,4 pp/M | Dodatnia wartość kredytowa odejmuje się od celu kredytu. Działa też po reformie waluty |
| `credit_1926_tail` / I–VI 1926 | `credit` = +6; `output` = −0,2 pp/M | Zastępuje poprzedni rekord; to zdefiniowane wygaszanie, nie dodatkowe −18 kredytu |
| `recovery_1926_27` / VII 1926–VI 1927 | `output` = +0,3 pp/M | Niezależne od zwycięstwa Piłsudskiego; działa w trwającej kampanii bez zamachu |
| Od VII 1927 do legalnych wyborów | Nowe zewnętrzne szoki kredytu/produkcji/agrarne = 0 | Pozostają skutki polityk, konfliktów, finansowania i ewentualna nierozwiązana presja marki |

Jest najwyżej jeden aktywny przedział rodziny `marka`; cel inflacji nadal wyznacza 11.4. Liczba 120 nie ustawia inflacji na 120 i nie odejmuje bezpośrednio płac. Złoty usuwa warunkowe impulsy marki oraz zwykłe upoważnienie emisyjne Skarbu, ale nie zewnętrzny kryzys kredytowy. Szoki stabilizacji (+10 kredytu przez 3 M albo +5 przez 5 M) pochodzą wyłącznie z rzeczywiście uruchomionego projektu 17.12; nie ma drugiego, kalendarzowego „kosztu roku 1924”. Efekt bilonu wymaga jego przyjętego instrumentu. Powtarzające się otwieranie B16 nie powiela szoku `credit_1925`.

Szoki cen/produkcji z innych rzeczywistych polityk nadal sumują się według 11. Kanały niewymienione w profilu mają wartość 0. Żaden rekord scenariusza nie daje automatycznie R, nowych mandatów, osłon ani konkretnego wyniku sondażu. Poprawa otoczenia może być przeważona przez strajki, aktywny opór kapitału lub brak wykonania programów. Handel zagraniczny jest przyczyną tła gospodarczego, bez działań dyplomatycznych gracza.

**K — etap 4 (0.45):** tabela jest zapisana jako `E.shocks` nowej gry; warunek `marka` obowiązuje też w czasie stabilizacji, a złoty go kończy. Szoki stabilizacji i ceł dopisuje ich rzeczywisty instrument.

#### 17.16.3. Oś polityczna i warunki pominięcia

| Okno tematu | Sprawa inicjowana przez scenariusz | Warunek przejścia / alternatywa |
|---|---|---|
| I–V 1922 | Ponikowski szuka bieżącego poparcia; PPS buduje program, organizacje i kontakty | Brak przymusowego nowego gabinetu albo darmowych ustępstw |
| VI–VII 1922 | Spór Naczelnika z Ponikowskim o utrzymanie gabinetu; preferencja kandydata Śliwińskiego, potem kompromis Nowaka | P — profil otwiera jedną sprawę konfliktu; gdy nie ma przyjętego kompromisu utrzymującego gabinet, Ponikowski składa dymisję. Śliwiński wymaga poparcia, a porażka uruchamia ocenę następnej wykonalnej oferty. Przy innym lub utrzymanym gabinecie nie odtwarzamy z góry całej sekwencji |
| XI–XII 1922 | Wybory, marszałek, nominacja PPS i końcowy wynik prezydencki | Głosy i umowy rozstrzygają urzędy. Historyczna gałąź zagrożenia Narutowicza odczytuje wcześniejszą ochronę; nie przenosi zabójstwa na dowolnego zwycięzcę lewicy |
| XII 1922–początek 1923 | Po rzeczywistym zabójstwie: legalne zastępstwo, następca, mobilizacja PPS; później warunkowo kult Niewiadomskiego | Bez zabójstwa brak tych reakcji. Przy konieczności nowego gabinetu Sikorski jest kandydatem ciągłości państwa, nie automatycznie mianowanym premierem |
| Od V 1923 | Piast i prawica przedstawiają konkurencyjny kompromis ziemski i gabinetowy | P — oferta Chjeno-Piasta oceniana raz dla nowej sytuacji. Nie odwołuje urzędującego rządu datą. Potrzebne zerwanie poprzedniej umowy, dymisja lub właściwe głosowanie; PPS może mieć lepszą wykonalną alternatywę |
| 1923, zwłaszcza jesień | Spory płacowe i kolejowe, możliwy kontekst krakowski | Warunki z 17.16.5; wykonana ugoda usuwa podstawę eskalacji. Strajk nie mianuje premiera |
| Kryzys waluty, historycznie koniec 1923–1924 | Gabinet przygotowuje stabilizację; Grabski ma preferencję w odpowiednim oknie po wakacie | Dostępny wcześniej kryzys z 11.9 może pozwolić innemu gabinetowi rozpocząć reformę wcześniej. Brak obowiązku czekania do I 1924 |
| Po stabilizacji, zwłaszcza 1924 | Rozłożenie kosztów, osłony i możliwy spór o czas pracy w hutnictwie | Karta stosunku do rządu tylko po konkretnej propozycji/naruszeniu, bez automatycznego wydłużania czasu pracy datą |
| VI–XI 1925 | Szok kredytu i produkcji; gabinet przedstawia korektę programu | Grabski może przetrwać dzięki zaakceptowanemu rozwiązaniu. Jego dymisja wymaga odmowy poparcia dla wykonalnej korekty i decyzji premiera; sama data XI nie wystarcza |
| Koniec 1925–IV 1926 | Po wakacie oferta szerokiego gabinetu; następnie spór budżetowy i wojskowy | Skrzyński albo inny akceptowany kandydat. PPS nie musi wejść, a odmowa nie zatrzymuje tworzenia rządu przez pozostałych |
| Po gabinecie stabilizacyjnym lub szerokim | Możliwy powrót Chjeno-Piasta i impuls +20; ocena próby | Wcześniejszy Chjeno-Piast w historii, faktyczne powołanie następcy i nierozwiązana sprawa wojskowa; bez bramki daty. Pozostają wszystkie bramki 16.2 |
| Bez zamachu, do wyborów | Wygaszanie szoków, wykonanie ziemi/osłon/praw językowych, wygasające finansowanie i kampania | Gabinet nie jest przymusowo wymieniany, a prawa i zobowiązania nie znikają |

Historyczna chronologia nie jest dodatkową karą za niestabilność: pojedyncza dymisja zapisuje jeden fakt, odczytywany przez istniejące wskaźniki 15. Nie dodajemy równoległego „−autorytet za rok” ani osobnego licznika kryzysów. PPS może krytykować gabinet, który skutecznie reformuje państwo; sukces legalnego rządu nie jest automatycznie sukcesem wyborczym PPS.

**K — etap 7 (0.48):** wejście 1A: spór Naczelnika z Ponikowskim w VI 1922 zapisuje jedną sprawę i wystąpienie B2. Karty kompromisu nie ma (P), więc urzędujący gabinet Ponikowskiego podaje się do dymisji, a B1 otwiera obowiązkowe formowanie. Sprawa wojskowa otwiera się w I 1925 (wejście testowe; historyczna data: TBD — historical research required) i zamyka ją dopiero wykonana umowa z Piłsudskim.

**K — etap 8 (0.49):** wejścia scenariusza po badaniach 8f i decyzjach etapu 8: spór Naczelnika w VI 1922 (temat wystąpienia: prawo powoływania rządu); oferta Chjeno-Piasta V–XII 1923; odejście 10 posłów Piasta XII 1923 (P z M02); sprawa wojskowa od VII 1923 (2 VII 1923); jeden publiczny epizod nacisku wojska w kryzysie gabinetowym od XI 1925; dymisja Grabskiego od XI 1925, gdy rządzi w kryzysie kredytowym albo walutowym (A1, `grabski_resignation_1925`; karta formowania podaje przyczynę). W kampaniach etapu 8 gabinety następują po sobie: Ponikowski → Śliwiński → Nowak → Witos → Grabski → Skrzyński ([pomiar](../analysis/stage8-campaigns/REPORT.md)).

#### 17.16.4. Krótkie profile samodzielnych działań gabinetów

**Z:** najwyżej jedna nowa inicjatywa rządowa na miesiąc poza resortami kontrolowanymi przez PPS. To wspólny limit gabinetu, nie po jednej akcji na każdego ministra. Automatyczne wykonanie przyjętych programów nie zużywa go. Nie pobiera R ani głównej akcji PPS; korzysta z tych samych projektów, kosztów B, prawa i wykonawców. Gabinet ustępujący zachowuje tylko obowiązki dozwolone w 8.5. Brak wykonalnej inicjatywy daje zapis przyczyny, nie fikcyjny sukces.

P — przegląd najpierw obsługuje zagrożone prawne wypłaty i wymagalne umowy, potem jedną należną poprawioną ofertę koniecznego pakietu, następnie następny niewykonany punkt krótkiego programu gabinetu z tabeli. Nie ma wspólnego automatu nakazującego każdemu premierowi zaczynać od tej samej reformy walutowej. Nowy kryzys kredytowy wstawia odpowiedź kredytową przed dobrowolne nowe inwestycje. Rozpoczęte projekty wykonują się automatycznie; przygotowanie zachowuje się po zmianie rządu. Remis: wcześniejszy termin, potem stabilny ID. Finansowanie może wejść do pakietu wdrożenia, bez drugiej inicjatywy; duży projekt nadal wymaga osobnego przygotowania.

`ActionTxn.source=cabinet` oznacza wykonawcę państwowego, z `consumes_month=false`; przegląd sam nie przesuwa zegara. `npc_reviewed_time=t` i unikalne ID transakcji chronią przed drugą inicjatywą po wczytaniu lub wymianie premiera w tym samym miesiącu. Sprawa wymagająca stanowiska PPS korzysta z właściwej istniejącej karty. Gabinet nie głosuje za PPS i nie zastępuje jej ministra. Wykonanie wcześniej zawartej umowy przez cudzy resort jest dozwolone bez nowej decyzji gracza, jeśli mieści się w upoważnieniu. Reakcje policji i powołanie gabinetu wewnątrz już otwartego kryzysu mają własne kompetencje/procedury, a nie dodatkową darmową inicjatywę reformy.

| Profil | Domyślna kolejność propozycji P | Reakcja na odmowę / granica |
|---|---|---|
| Ponikowski / Nowak | Bieżące zobowiązania; przy niedoborze szersza podstawa podatku, następnie ograniczenie wydatków administracyjnych; przy spełnieniu 11.9 przygotowanie stabilizacji | Nie inicjuje automatycznie reformy konstytucji. Konflikt z Naczelnikiem rozstrzyga sprawa 1922, a nie saldo B |
| Sikorski po kryzysie prezydenckim | Ochrona konkretnie zagrożonych instytucji, następnie porozumienie pracownicze i wykonalne finansowanie | Ochrona wymaga MSW i kosztu z 17.2; nie przyznaje stałej ogólnokrajowej premii policji. Utrata poparcia wymaga rzeczywistej procedury |
| Chjeno-Piast 1923 | Uzgodniona parcelacja z odszkodowaniem; dochody, preferencyjnie szersza podstawa podatku, potem cięcia administracyjne; stabilizacja przy kryzysie | Piast ocenia wykonanie obietnicy ziemskiej. Aktywny konflikt kolejowy po odmowie ugody może wywołać preferowaną reakcję przymusową; prawica sama w sobie nie oznacza automatycznych starć |
| Grabski | Przy kryzysie walutowym przygotowanie stabilizacji; domyślnie `rapid_cuts` z nazwanymi cięciami oraz podatkiem majątkowym; zaakceptowana tolerancja PPS może zmienić wariant na `protected` lub `gradual` | Jeżeli pakiet nie ma zgody, zgłasza wykonalną zmienioną ofertę przez zwykłe procedury, nie wykonuje zakazanych cięć. Po stabilizacji priorytetem są obowiązki i reakcja na rzeczywisty kryzys kredytu |
| Skrzyński / szeroka koalicja | Wspólne minimum: utrzymanie uzgodnionych osłon i korekta finansowania; potem uzgodniony program zatrudnienia/kredytu | Naruszenie gwarancji otwiera istniejący B19. Sprzeczne zobowiązania mogą doprowadzić do odejścia PPS lub prawicy; żaden partner nie otrzymuje zgody za samą nazwę „szeroki gabinet” |
| Gabinet centrolewicowy | Uzgodnione osłony, reforma rolna z odszkodowaniem, następnie przyjęte reformy legalne; domyślna propozycja dochodowa: progresja lub podatek majątkowy | Piast, NPR i zewnętrzni partnerzy zachowują swoje warunki. PPS nie przeprowadza całego programu jednym wejściem do rządu |
| Konstytucyjny gabinet Piłsudskiego | Punkty przyjętej umowy, w tym konkretna organizacja wojska | Te same koszty, odpowiedzialność i wymagane poparcie; nie ma automatycznej lojalności armii ani zgody na autonomię wojskową |

Preferencja w tabeli jest ofertą, nie upoważnieniem. Przy kryzysie kredytowym profile najpierw szukają wykonalnego instrumentu wsparcia kredytu, potem programu zatrudnienia/osłony zgodnego z umową. Finansowanie wykorzystuje 11.9: bez PPS preferencje własnego profilu, z PPS przyjęty pakiet; niedopuszczalny instrument jest pomijany z powodem. Pożyczka wymaga kredytu ≥40 i zgody finansujących; emisja po stabilizacji nie wraca bez osobnego upoważnienia. Podatek majątkowy, pożyczka i cięcia nie tworzą kopii aktywnego instrumentu.

Program ma wskazany termin i wykonawcę w umowie. P — proponowane minimum terminów: przygotowanie stabilizacji w pierwszej dostępnej inicjatywie po przyjęciu programu, próba wdrożenia w następnej; pierwsza transza ziemska do t+6 od przyjęcia obietnicy; pozostałe osłony zgodnie z 9.1. Polityczna odmowa oferty nie nalicza kary za złamanie niepodpisanej umowy. Niewykonane podpisane zobowiązanie uruchamia 9.2: ostrzeżenie, ultimatum, dopiero potem utratę odpowiedniego poparcia.

Rząd rezygnuje po skutecznym żądaniu ustąpienia albo własnej decyzji. P — po odrzuceniu **koniecznego** pakietu premier przedstawia jedną określoną poprawkę przy następnym miesięcznym przeglądzie. Jeżeli jest odrzucona albo nie ma legalnego, finansowo wykonalnego wariantu, składa dymisję. Konieczność wynika z istniejących obowiązków lub jawnego warunku pozostania premiera, nie z dowolnej opcjonalnej inwestycji. Przyjęta wykonalna poprawka zamyka sprawę. Odmowa PPS nie zastępuje stanowiska całego parlamentu. Zapis w istniejącym `EventRun.payload`: `cabinet_id,original_offer_id,revised_offer_id,status,next_review_at`; status `initial|revision_due|accepted|resigned|closed`. Bez nowego menu C2: odpowiedź korzysta z istniejącego stosunku do rządu. Nie ponawiamy tej samej oferty co miesiąc ani po wczytaniu.

**Dwa konkretne spory P do pierwszego rozdziału:**

| Gabinet i wyzwalacz | Pierwsza propozycja | Jedna poprawka / wynik odmowy |
|---|---|---|
| **Grabski: aktywny kryzys kredytu bez wykonanego wsparcia** | Instrument kredytowy z 12.4: 2 B przez 2 M, następnie 1 B utrzymania, +5 wsparcia; istniejący uprawniony wykonawca i finansowanie zwykłym budżetem. Realna zgoda wykonawcy oraz finansujących wymagana. Odpowiedź kredytowa jest wskazanym warunkiem pozostania premiera | Ten sam projekt z podatkiem majątkowym +2 B/6 M, presja kapitału +8, bez powielania aktywnego instrumentu. Poprawka musi usunąć wskazaną przyczynę odmowy; dodatkowy podatek nie zastępuje odmawiającego wykonawcy. Jeśli brak takiej możliwości lub zgód — dymisja. Wykonane wcześniej wsparcie zamyka wyzwalacz; nie wymuszamy nowego kryzysu ani dymisji w listopadzie. |
| **Skrzyński: uzgodniony przegląd osłon podczas aktywnego kryzysu kredytowego** | Raz, w szóstym miesiącu od powołania (`formed_at+5`), o ile istnieje pełna osłona 2 B. Prawicowi partnerzy proponują ograniczenie jej do 1 B. Jest to ich postulat programowy, także przy wypłacalnym budżecie, nie dodatkowy szok kosztów | PPS może uzgodnić pozostawienie 2 B przy istniejącym lub legalnie poprawionym finansowaniu. Każdy wymagany partner ocenia konkretną ofertę wspólną regułą 8.3: ≥60, wykonalne finansowanie i spełnione twarde warunki. Relacje wpływają na ocenę; nie mają dodatkowych minimów ZLN/PSChD. Brak kompromisu pozostawia przyjęcie cięć albo wycofanie poparcia; skutki według akapitu poniżej. |

Przegląd Skrzyńskiego zajmuje istniejącą scenę B19. Cztery odpowiedzi z 9.8 pozostają: negocjować warunek, przekonywać bez ultimatum, utrzymać poparcie mimo sporu, wycofać poparcie. Dwie pierwsze używają tej samej pojedynczej oferty kompromisowej; różnią się tym, czy PPS zapowiada odejście po odmowie. Od 0.23 (M11) odmowa przy targowaniu wymaga od razu spełnienia groźby albo cofnięcia się. Przyjęty kompromis obniża o 3 relację PPS z każdą z partii, które go przyjęły. W archiwalnych przebiegach M02 nie zmienia to wyników, gabinetów ani terminów prób. W 12 przebiegach z odrzuconym przeglądem PPS odchodzi o miesiąc wcześniej, bez zużycia akcji. Nie otwierają kolejnych bezpłatnych prób. Jeżeli przy przeglądzie nie ma pełnej osłony lub kryzys już wygasł, zamykamy ten termin bez żądania fikcyjnych cięć. Nowe niedofinansowanie rzeczywistych zobowiązań nadal może uruchomić zwykły spór budżetowy.

Przyjęte cięcie wymaga zmiany prawa i poparcia, daje wyłącznie **+1 B z redukcji istniejącego kosztu 2→1**, a osłona maleje proporcjonalnie; stosujemy reakcje 11.9 i odpowiedzialność za renegocjowane gwarancje. Samo przedstawienie żądania nie obniża świadczeń. Przy odrzuceniu przez PPS i wyjściu przeliczamy głosy: Skrzyński może pozostać, jeśli pozostałe zaplecze zaakceptuje program. ZLN/PSChD/Piast mogą przedstawić własną ofertę Witosa po faktycznym rozpadzie wspólnego minimum; dopiero zgody, skuteczne głosowanie lub dymisja otwierają zmianę. **Odejście PPS nie ustawia automatycznie Chjeno-Piasta.** Nowy rząd dziedziczy świadczenia i musi osobno legalnie je zmienić.

Inspiracja mechaniczna: `source/scenes/events/unemployment_insurance_1.scene.dry` (prawica żąda cięć, kompromis zależy od relacji) i `source/scenes/government_affairs/dealing_with_toleration.scene.dry` (utrzymanie, nacisk lub zerwanie poparcia). Polski profil nie kopiuje niemieckiej automatycznej nominacji następcy/wyborów. Próg, termin, propozycje i preferencje powyżej są **uproszczeniem rozgrywki P**, nie nowymi twierdzeniami historycznymi.

**K — etap 4 (0.45):** `PolishProjects.cabinetReview` wykonuje najwyżej jedną inicjatywę w miesiącu poza resortami PPS, jako transakcję `source=cabinet` bez zużycia miesiąca. Kolejność: jedna poprawka odrzuconego koniecznego pakietu, zagrożone wypłaty, należne obietnice, stabilizacja przy kryzysie finansowym, odpowiedź kredytowa, dochody przy niedoborze. Profile i reguła dymisji są w rozdziale 14 planu implementacji.

#### 17.16.5. Drożyzna, kolej i ugoda

P — trzy kolejne zakończone miesiące `real_wage<80` otwierają jedną sprawę żądań wyrównania płac dla objętych pracowników. Scenariusz zapisuje odbiorców i przedstawienie żądania w `EventRun.payload`, bez dodatkowego menu strategii. Reakcja PPS korzysta z istniejącego protestu/rokowań, a reakcja państwa z profilu gabinetu. Przy jawnym odrzuceniu żądania lub braku przyjętej ugody do następnego rozliczenia: raz **+8 grievance** w objętych komórkach. Nie jest to +8 dla całej ludności ani automatyczna kara od samej daty.

Rzeczywiście zarządzona militaryzacja kolei w aktywnym sporze daje raz **+10 grievance kolejarzy**. Jeśli komórka elektoratu obejmuje również inne branże, dodaje się zmianę ważoną udziałem kolejarzy; branżowa gotowość do strajku odczytuje pełny adresowany skutek. Nie tworzymy nowej kategorii narodowej ani ludzi. Ten impuls opisuje konflikt o przymus służbowy; dodatkową ekspozycję na represję z 15.1 zapisuje dopiero osobne wykonane działanie wobec ludzi, nie drugi raz to samo zarządzenie.

Przy bezczynności PPS istnieje żądanie i reakcja władz, lecz nie powstaje automatycznie strajk generalny PPS. Dostęp do ograniczonego protestu i samego postulatu dymisji określa 17.5: ≥50 albo otwarte odrzucone żądanie. Próg ≥60 dotyczy rozszerzenia do ogólnej mobilizacji właściwej grupy/branży, nie średniej całej ludności i nie pozwolenia na polityczny postulat. Skala nadal zależy od zasięgu, funduszu i posłuchu. Późniejszy podobny problem używa ogólnego kontekstu sporu, bez nazywania go historycznym Krakowem listopada 1923.

P — preferencja przymusu Chjeno-Piasta dotyczy aktywnego sporu kolejowego, odrzuconej wykonalnej ugody i wykonanej decyzji właściwych władz. Minister PPS lub uzgodniony wykonawca zastępuje tę reakcję tylko w zakresie własnych kompetencji z 17.5. Rokowania i wykonane ustępstwa mogą przerwać ciąg przed militaryzacją lub starciem. Krwawe starcie wymaga faktycznej konfrontacji i testu z 17.5; nie jest nagrodą za wybranie radykalnej linii ani obowiązkowym wydarzeniem listopada.

Jednorazowe efekty mają klucze `case_id + rejected_wage_demand` i `case_id + rail_militarization`. Zmiana gabinetu lub ponowne wejście do sceny nie kasuje historii naliczenia. Nowa sprawa wymaga nowego żądania/przyczyny, co najmniej 3 M odnowienia i nie może ponownie ukarać za wciąż otwarte stare żądanie. Przyjęta ugoda zamyka eskalację danego sporu; jej wykonanie sprawdzają 9 i 14.5, w tym E6 tylko przy rzeczywistej odmowie uczestników. Protest wpływa na politykę partnerów, nie zastępuje głosowania albo dymisji.

**K — etap 6 (0.47):** obserwacja płac `S.strikes.wage_watch` liczy pełne miesiące płac realnych poniżej 80; po trzech otwiera sprawę płacową przemysłu i kolei (`kind: wage_case`), jedną naraz, najwcześniej 3 M po zamknięciu poprzedniej. Żądanie płacowe bez przyjętej ugody do następnego rozliczenia zapisuje raz +8 niezadowolenia dla etapu 7.

#### 17.16.6. Presja na zamach i dalsza kampania

Z — w pierwszym scenariuszu sposobność wojskowa jest wyłączona przed wiosną 1926. P — techniczny początek okna to **1 III 1926**; nie jest twierdzeniem o historycznym terminie decyzji o przewrocie. Potem `operationalWindow` wymaga dostępnych w fazach kryzysu sił i logistyki według profilu 16; sama data nie wystarcza. Próba nadal wymaga presji ≥65, zdolności ≥30, braku wykonywanego porozumienia o odstąpieniu i zachowania odnowienia. Rozstrzygnięcie walki, ugody i przedłużonego konfliktu określa 16.8 (M08, 0.20); historyczny profil wojsk pozostaje `TBD — historical research required`.

**K — etap 8 (0.49):** w kampaniach etapu 8 presja przekracza 65 w XII 1925, więc próbę wyznacza okno od III 1926; wykonane porozumienie wojskowe z Piłsudskim zapobiega próbie (cel 1A spełniony).

Przed tym oknem spory o wojsko i krytyka parlamentu mogą wpływać na istniejące relacje, umowy, presję i lojalności. Nie ma automatycznego miesięcznego impulsu za niepowierzenie Piłsudskiemu władzy. `personalConflictImpulse` wymaga konkretnego zdarzenia: zerwania przyjętej obietnicy, konfliktu nominacyjnego lub publicznego nacisku wojskowego z 17.16.9; używa istniejącego +8 z 15.3, bez ponownego naliczania tej samej odmowy. Kwalifikujący się powrót Chjeno-Piasta daje +20 raz niezależnie od miesiąca, według 17.16.11. Rachunek presji oraz połączone przebiegi opisują 17.16.9–11. Scenariusz nie ustawia presji na 65, aby naprawić brak eskalacji.

Koncesje z 16.7 zmniejszają motywację do próby, ale przyznane wpływy wojskowe mogą zwiększyć zdolność. Reforma cywilnej kontroli i reforma konstytucji zachowują własne warunki; nie zastępują ich dobre relacje z PPS. Po rozpoczęciu próby obowiązuje wyłącznie krótka sekwencja F, bez nowych F1/F2/F8 i bez drugiej próby po raporcie końcowym.

Bez zamachu kampania wykorzystuje wygasanie szoków z 17.16.2 oraz trzy istniejące sprawdziany: (1) wygaśnięcie finansowania kontra koszt utrzymania programów, (2) wykonanie obietnic ziemskich, socjalnych i językowych, (3) przejście od współpracy gabinetowej do sojuszu wyborczego. Nie dodajemy zastępczej katastrofy ani nagrody gospodarczej za Piłsudskiego. Nierozwiązany konflikt wojskowy może doprowadzić do późniejszej próby. Przy braku próby i wcześniejszego legalnego głosowania działa kalendarz 7.4, testowo wybory **19 II 1928**, po których następuje raport bez nowego gabinetu. Powstanie Sanacji, BBWR lub instytucji lat trzydziestych nie wynika z samego upływu czasu w gałęzi bez przewrotu.

#### 17.16.7. Cztery przebiegi referencyjne i wynik przeglądu dokumentacji

To scenariusze sprawdzające przyczynowość, **nie wyniki symulacji ani gwarantowane zakończenia**. Porównanie pełnych kampanii wymaga wspólnego otwarcia, kalendarza presji i ziaren. W izolowanym porównaniu negocjacji należy dodatkowo zamrozić ten sam wynik wyborów jako jawny fixture; nie nadpisywać nim legalnego wyniku całej kampanii. Rejestrować co miesiąc gospodarkę, wykonanie programów, stan umów, gabinet i powód zmiany, niezadowolenie adresatów, presję/zdolność oraz czas i R zużyte przez PPS.

| Przebieg | Decyzje i łańcuch | Warunek wyniku / co musi wykazać implementacja |
|---|---|---|
| **N-A: PPS bierna politycznie** | Zachowuje zwykłe działania własnej partii, nie zawiera nowych wiążących umów i nie buduje alternatywnej większości. Początkowa tolerancja nie daje automatycznie późniejszych uprawnień. Pracownicy zgłaszają żądania, gabinety finansują politykę i przygotowują stabilizację bez ministra PPS | Inni mogą utworzyć Chjeno-Piast, potem gabinet ekspercki i przeprowadzić reformę. Nie muszą upaść tylko z powodu bierności PPS. Przy faktycznych przesileniach i niewygaszonym sporze wojskowym możliwy zamach; bez bramek kampania trwa do wyborów. Brak zablokowania świata na oczekiwaniu na kartę PPS |
| **N-B: PPS tolerująca** | Inwestuje w związki, fundusz, prasę i kontakty. W 1923 próbuje kontrolowanego protestu i ugody; potem wynegocjowanej tolerancji z osłoną i finansowaniem. W 1925 zabiega o utrzymanie wykonalnego minimum zamiast dowolnego prawa weta | Potrzebni wykonawca, zgoda premiera i rzeczywista wartość poparcia. Wykonana osłona ogranicza koszty społeczne; PPS dzieli odpowiedzialność za przyjęte wyrzeczenia. Może podtrzymać kompromis albo zerwać tolerancję bez automatycznej dymisji rządu. Dobre wyniki gospodarcze nie zastępują rozwiązania sporu wojskowego |
| **N-C: PPS współrządząca** | Przygotowuje partnerów i program, zwykle wchodzi do szerokiego gabinetu po kryzysie 1925. Uzyskuje Pracę, przygotowuje jeden program osłon lub zatrudnienia i wdraża go z przyjętym finansowaniem. Duża inwestycja wymaga dwóch kroków; osłona ma własny krótszy kontrakt | Inicjatywa innego ministra nie wykonuje drugiej akcji w resorcie PPS. Wygasanie dochodów/propozycja cięć wymusza wybór utrzymania kompromisu, zmniejszenia programu lub odejścia. Program nie znika wraz z PPS, a odejście nie jest dymisją całego gabinetu. Ani współrządzenie, ani opozycja nie dają automatycznego zwycięstwa |

**N-H — historyczne zamiary:** PPS chce prowadzić polityczny protest 1923, poprzeć stabilizację, wejść do szerokiego gabinetu i odmówić cięć osłon, a w razie próby poprzeć Piłsudskiego przygotowaną koleją. Nie wymuszamy zgód, głosów ani wyniku walk dla tej etykiety. Sprawdzamy dostępność tych decyzji i faktyczną zmianę rządu po wyjściu PPS.

Przegląd 21 IX 2026: cztery kontrolowane przebiegi i porównania w `analysis/m02-four-runs/REPORT.md` ujawniły blokadę ZLN, brak konkretnego sporu oszczędnościowego i przedwczesny wynik walk. Rewizja 0.13 wdraża korekty opisane powyżej; nowe wyniki w `analysis/m02-revision-13/REPORT.md`. **Nie potwierdzono jeszcze** pełnej autonomicznej kampanii przy różnych wynikach wyborów ani historycznej częstotliwości kryzysów. Był to stan M02 w rewizji 0.13; późniejsze sprawdzenie i zamknięcie etapu dokumentacji opisują 17.16.10–11. M05–M13 nie zostają zamknięte przez sam manifest.

#### 17.16.8. Zamknięty ciąg polityczny: kryzys kredytu → następca → osłony → próba

**Rewizja 0.14 — krok 2 M02.** Poniższy kontrakt konkretyzuje przejścia 17.16.3–6, bez nowych kart, rund negocjacji, walut ani zmiany progu 60. Profile i liczby są P. [Raport oraz 16 sprawdzonych wariantów](../analysis/m02-political-chain/REPORT.md) obejmują także dwie odmowy polityczne wobec Grabskiego i rzeczywiste powołanie następcy. Są to wycinki z kontrolowaną gospodarką, nie pełna ponowna kampania od 1922.

| Przejście i jego przyczyna | Stanowiska partnerów / program | Decyzja PPS w istniejącej karcie | Warunek pozostania albo odejścia rządu |
|---|---|---|---|
| **1. Kryzys kredytu, brak wykonanego wsparcia** | Grabski uznaje uzyskanie wykonalnej odpowiedzi za warunek pozostania. Skarb i właściwa instytucja sprawdzają legalność i środki; kluby oceniają konkretną treść, nie nazwisko premiera | Poprzeć pakiet, zgłosić dopuszczalny warunek przez stosunek do rządu albo odmówić. Brak ministrów nie daje PPS weta | Jeśli projekt nie jest gotowy, pierwsza inicjatywa go przygotowuje, kolejna proponuje uruchomienie. Gotowy projekt może zostać zaproponowany od razu. Przyjęty i wykonalny pakiet utrzymuje Grabskiego; sama odmowa PPS nie usuwa go |
| **2. Pierwszy pakiet nie przeszedł** | Zapisujemy powód: środki, poparcie, uprawnienie lub wykonawca. Jedna poprawka finansuje ten sam projekt podatkiem majątkowym; nie rozpoczyna drugiego instrumentu | Jedna odpowiedź na zmienioną treść przy następnym miesięcznym przeglądzie. Brak dodatkowego menu C2 | Przyjęcie poprawki zamyka sprawę. Jeżeli obie oferty nie przechodzą albo brak poprawki usuwającej przeszkodę, Grabski składa dymisję. Podatek nie naprawia odmowy wykonawcy. Gdy przyczyna kryzysu rzeczywiście ustała i brak nadal wymagalnego obowiązku, sprawę można zamknąć bez dymisji |
| **3. Faktyczna dymisja / wakat** | Grabski pełni obowiązki. Dostępny Skrzyński proponuje ratunkowe minimum z PPS; Piast może przygotować własne Chjeno-Piast. Zachowujemy także inne rzeczywiście odblokowane konfiguracje 8.6–8.7 | Jedno C1: dostępna konfiguracja, kandydat, udział lub poparcie, program i resorty; albo opozycja | Nowy rząd wymaga zgód, wykonalności głosowań i legalnego powołania. Ranking 8.7 wybiera spośród przyjętych ofert. Nie ma obowiązkowej inwestytury 223 dla każdego gabinetu. PPS nie musi uczestniczyć w zwycięskim układzie |
| **4. Żadna oferta nie jest wykonalna** | Pozostaje gabinet pełniący obowiązki, realizujący legalne bieżące świadczenia. Kandydaci i kluby zachowują rzeczywiste odmowy | Zwykłe działania mogą zmienić poparcie lub przygotować inną dostępną ofertę | Nie odtwarzamy C1 ani nie liczymy kolejnej nieudanej próby od samej zmiany miesiąca. Nowy kandydat, program, wykonana gwarancja lub zmieniona deklaracja umożliwiają ponowną ocenę. Brak operacyjnego rządu nadal odczytuje 15.2–3 |
| **5. Powstaje szeroki gabinet** | Pełne finansowane osłony, jeden przegląd w szóstym miesiącu. PPS: Praca; testowa alternatywa NPR: Gospodarka i gwarancje pracownicze; Piast: Rolnictwo; PSChD: Sprawiedliwość; ZLN: Skarb | Przyjąć uzgodnioną ofertę albo pozostać poza nią. Doradca może wspomóc jedną ofertę na zwykłych warunkach | Zgody i podział urzędów nie zastępują uprawnień do kolejnych reform. Nowy premier dziedziczy prawo, projekty i daty finansowania; nie dostaje drugiej inicjatywy w miesiącu zużytym już przez poprzednika |
| **6. Szósty miesiąc, nadal kryzys kredytu i osłona 2 B** | Prawica proponuje koszt 1 B. Piast i NPR oceniają warunki utrzymania wspólnego programu. Przygotowana oferta Witosa jest realną alternatywą tylko z dostępnym kandydatem, programem i możliwymi deklaracjami | Wynegocjować pełne osłony; przekonywać bez groźby odejścia; utrzymać poparcie; wycofać poparcie. Zachowana rodzina B19/9.8 | Przyjęty kompromis utrzymuje rząd. Uzgodnione cięcie wymaga zmiany prawa. Odmowa kompromisu nie obcina świadczenia i nie odwołuje premiera. Zanik przesłanki zamyka ten termin przeglądu bez wymuszenia cięć |
| **7. PPS rzeczywiście wycofuje ministrów/poparcie** | Przy następnym przeglądzie partnerzy porównują konkretną kontynuację Skrzyńskiego i przygotowaną ofertę Piasta. Pozostanie nie dziedziczy automatycznie głosów dawnych członków | PPS przechodzi do opozycji; może głosować za albo przeciw rzeczywistemu wnioskowi w istniejącej scenie | Przyjęte przez premiera i wystarczające zaplecze minimum pozwala Skrzyńskiemu pozostać bez PPS. Skuteczne odwołanie albo dymisja pozwala powołać zaakceptowanego następcę. Brak obu dróg oznacza pełnienie obowiązków, nie automatycznego Witosa |
| **8. Rzeczywiste powołanie Witosa** | Przyjęte Chjeno-Piast ma własny program fiskalny i ziemski. Posłowie Piasta poza dawną umową muszą osobno przyjąć nową. NPR może poprzeć ustawę bez wejścia do rządu | Opozycja, odpowiedź na konkretne decyzje rządu i przygotowanie organizacji; żadnego automatycznego rozpoczęcia strajku | Legalny gabinet działa, dopóki nie zostanie skutecznie odwołany lub nie poda się do dymisji. Cięcie odziedziczonych osłon to osobna inicjatywa i procedura, nie skutek nominacji |
| **9. Sprawdzian próby zamachu** | Otwarta sprawa wojskowa zwiększa presję, a wykonywane porozumienie może ją rozwiązać. Siły, logistyka i zamiar pozostają osobne | Przed próbą dostępne zwykłe działania i kompetentna oferta 16.7; po jej rozpoczęciu istniejące F4/F5/F9 | Próba tylko po wszystkich warunkach 16.2. Przy braku bramek rząd i kampania trwają. Dymisja, odejście PPS albo sam maj nie uruchamiają walk |

**Dostępność alternatyw.** Wąski domyślny zestaw tej sprawy to oferta kryzysowa Skrzyńskiego i przygotowana przez Piast oferta z prawicą. Inne konfiguracje pozostają dostępne po swoich bramkach, ale nie są wymyślane jako anonimowy „ekspert z poparciem 238”. Piast zgłasza propozycję przy wakacie albo faktycznym zagrożeniu/rozpadzie wspólnego minimum; potrzebuje zainteresowanych PSChD/ZLN, dopuszczalnego programu i możliwego oparcia parlamentarnego. W przeglądzie może to być przygotowana oferta warunkowa, nie już powołany gabinet. Do oceny alternatywy bierzemy bazowy wynik 8.3 tylko wtedy, gdy takie przygotowanie faktycznie istnieje. Nie liczymy wycofanej oferty Grabskiego jako wykonalnej alternatywy po jego dymisji; powrót osoby wymaga zmienionej treści lub zgód usuwających przyczynę odejścia.

**Konkretny profil odmów, P.** Neutralne relacje kandydata z klubami 50, wiarygodność 50. Oferta bieżącego finansowania ma `fiscal=0`, poprawka majątkowa `fiscal=+2`. W sprawdzonym wariancie dwóch politycznych odmów Piast, NPR i Wyzwolenie wymagają wydzielonego finansowania, aby chronić dotychczasowe wydatki. Pierwszy pakiet go nie zapewnia; poprawka zapewnia, lecz odrzucają ją PSChD/ZLN przez treść podatkową. PPS popiera oba. Brak umów poparcia obu segmentów mniejszości nie daje ich głosów. Wyniki: **201:243**, potem **178:266** — dymisja i policzone formowanie następcy. Przy przyjętych umowach z oboma segmentami testowa poprawka może uzyskać **268:176** i utrzymać rząd. To warunek konkretnej oferty, nie uniwersalne nowe weto klasowe albo stały pogląd historycznych partii.

**Kontynuacja bez PPS, P.** Skrzyński może przyjąć mandat dalszego wykonywania legalnych zobowiązań, jeśli istnieje finansowane minimum i wystarczające poparcie. Oferta ma `fiscal=0`, zachowuje osłonę 2 B i niezależnie oceniane warunki wykonania. Wymóg udziału PPS przy powołaniu szerokiej koalicji nie oznacza automatycznej dymisji po jej odejściu. Jeżeli prawica odrzuci taką kontynuację i nie ma innego poparcia, premier rezygnuje; nie nadajemy pozostaniu bezwarunkowej zgody. Lepszy wynik punktowy konkurenta sam nie odwołuje urzędującego rządu.

**Dziesięciu posłów testowych.** Jeżeli scenariusz używa wcześniejszego syntetycznego odejścia 10 posłów Piasta, przechowuje ich deklarację wewnątrz istniejących 70 mandatów. Wariant kontrolny wiąże ponowne poparcie z wykonaną gwarancją ziemską, przyjęciem parcelacji z odszkodowaniem, brakiem nowego obciążenia drobnych gospodarstw i oceną nowej oferty. To jawny profil P, nie dopisany fakt historyczny. Sama data albo powrót nazwiska Witosa nie przywraca głosów. Bez nich badana większość to 220:224; z przyjętą nową umową 230:214. Osobne głosowanie nad finansowaniem nie musi pokrywać się ze stanowiskiem wobec składu gabinetu.

**Kolejność i zapis.** Korzystamy z istniejących `EventRun.payload`, `Negotiation`, `Agreement`, deklaracji i dziennika. Sprawa wiąże przyczynę z ID pierwszej oferty, poprawki, powodami odmowy i terminem odpowiedzi; sukces/dymisja/zamknięcie są końcowe dla tej instancji. Zapisujemy rozpatrzony zestaw kandydatur i stan wejściowy; nieudana próba jest jednym zdarzeniem. Wczytanie nie odnawia prób, premii ani inicjatyw. Po dymisji można zakończyć obowiązkowe formowanie w tym samym miesiącu, lecz limit inicjatywy gabinetowej pozostaje zużyty. Jeśli PPS wychodzi przy przeglądzie osłon, odpowiedź pozostałych partnerów przypada na następny przegląd, bez drugiej darmowej decyzji negocjacyjnej PPS. Istniejący, już rozstrzygany legalny wniosek zachowuje własną procedurę.

**Presja i granica dowodu.** Stosujemy wyłącznie 15.2–3 i 16.2. Dymisja/odmowa mają dziennik instytucjonalny, nie dodatkowe arbitralne +punkty zamachu. Kwalifikujący się powrót Chjeno-Piasta otrzymuje +20 w chwili powołania według 17.16.11; nie otrzymuje w maju zaległej ani ponownej dopłaty. Kontrolowane ślady ujawniają wczesną dymisję (VII lub VIII 1925) i wcześniejszy przegląd następcy. Nie przesuwamy ich na daty historyczne bez przyczyny. Połączenie tych przejść z gospodarką, reputacją, frakcjami i odmiennymi parlamentami opisują 17.16.10–11. M02 zamykamy na etapie dokumentacji; dalszy balans terminów należy do testów prototypu. Walka po rozpoczęciu próby pozostaje zakresem F/M08.

#### 17.16.9. Pokrycie wydarzeń i kalibracja presji — krok 3

**P — rewizja 0.15, 22 IX 2026.** [Raport i powtarzalne obliczenia](../analysis/m02-pressure-calibration/REPORT.md): odtworzono 272 archiwalne odczyty, sprawdzono 20 wariantów i trzy projekcje kroku 2. Zachowujemy próg 65 oraz stawki 15.3. Nie dodajemy nowego miernika, talii, menu B21/F1/F2 ani harmonogramu automatycznych zamachów.

| Zdarzenie / stan | Warunek i skutek | Kiedy nie naliczać |
|---|---|---|
| Miesiąc bez czynnego gabinetu | Rzeczywisty stan instytucji daje istniejące +3; autorytet korzysta z tego samego dziennika | Samo przekazanie urzędu, już zakończone powołaniem następcy, nie jest dodatkowym miesiącem bez rządu |
| Publiczny epizod nacisku wojskowego | Zapisane publiczne żądanie Piłsudskiego, poparcie interweniujących oficerów, otwarta sprawa wojskowa, faktyczny kryzys tworzenia/przebudowy gabinetu i brak wykonywanego kompromisu w tej sprawie → jedno +8 w istniejącym kanale | Nie za samą datę, wakat lub krytykę parlamentu. Nie powtarzać przy kolejnym gabinecie bez odrębnego epizodu |
| Wykonana ugoda | Dotychczasowa jednorazowa ulga i zamknięcie konkretnie rozwiązanej sprawy; przegląd za 6 M | Podpis, przedłużenie i powtórzenie nominacji nie dają kolejnej ulgi; nierozwiązane inne sprawy nie znikają |
| Powrót Chjeno-Piasta | +20 raz po rzeczywistym powrocie po gabinecie stabilizacyjnym lub szerokim przy otwartej sprawie wojskowej; doprecyzowanie 0.16 | Brak bramki maja, zaległej dopłaty lub drugiego +8 za tę samą konfrontację |
| Spełnienie wszystkich bramek 16.2 | Sprawdzian po pakiecie zdarzenia albo po miesięcznym rozliczeniu, zgodnie z 4.2 | Nie czekać na początek kolejnego miesiąca; nie przeliczać samej presji przy każdym sprawdzianie |

Publiczny epizod jest skutkiem istniejącej sprawy politycznej, z `EventRun.payload` zawierającym przedmiot, powiązaną sprawę wojskową, kryzys gabinetowy, zapis publicznego żądania/poparcia i jedno ID naliczonego skutku. Data zapisana w historii opisuje to, co się wydarzyło; nie zastępuje warunków. Powiązane wystąpienia w jednym epizodzie dzielą ID. Profile aktorów muszą dostarczyć faktyczny epizod; nie generujemy go automatycznie z każdej dymisji. Historyczna podstawa i odróżnienie od uproszczenia P: `PL-M02-PRESSURE-2026-09-22` w rejestrze źródeł.

**Wynik kontrolny:** H miał w V 1926 presję 54. Uwzględnienie pominiętego +3 w VI 1922 i jednego publicznego +8 w XI 1925 daje 65 przy niezmienionym +2/M. Stan po IV to 43; powołanie następcy daje 63, rozliczenie V — 65 i próbę w tym samym miesiącu. Bez publicznego epizodu próba następuje we IX 1926; dodatkowy wykonany obowiązek cywilny w IV przesuwa ją na VI. Wykonana i przestrzegana ugoda w VIII 1925 albo IV 1926 zapobiega próbie do testowej granicy wyborów. Zdolność poniżej 30 blokuje próbę mimo presji 65.

**Ograniczenie:** H zachowuje wcześniejsze kontrolowane gabinety i gospodarkę, a otwarcie sprawy w I 1925 jest wejściem testowym, nie datowaniem historycznego początku sporu. Stałe otwarcie od VI 1923 prowadzi w kontroli już do III 1926. Nie zamykamy sprawy bez rozstrzygnięcia dla wygodnej daty. Połączony rachunek wykonano następnie w 17.16.10–11; historyczne datowanie konkretnych spraw pozostaje robocze do późniejszego sprawdzenia. Projekcje kroku 2 dają także VII lub XII 1926, więc wynik H nie zastępuje tych odmiennych ciągów. Parametry sił w diagnostyce pozostają syntetyczne (M08).

#### 17.16.10. Sparowane przebiegi na trzech Sejmach — wynik kroku 4

**Archiwalna weryfikacja 22 IX 2026, reguły 0.15, przed końcową korektą.** [Raport poprzedniego stanu](../analysis/m02-robustness/REPORT_0_15.md): 144 główne przebiegi (4 strategie × 3 składy Sejmu × 12 wspólnych ziaren), 216 porównań pojedynczych decyzji oraz 36 kontroli wcześniejszego otwarcia sprawy wojskowej. Gospodarka, koszty, oceniane oferty, głosowania, projekty i presja są liczone razem. Poniższe wyniki służą jako punkt odniesienia; bieżące wyniki 0.16: [raport końcowy](../analysis/m02-robustness/REPORT.md).

| Strategia | Sejm bazowy | Korzystniejszy dla PPS | Trudniejszy dla PPS |
|---|---|---|---|
| A — bierna | Próba XII 1926 | Próba III 1927 | Próba IV 1927 |
| B — tolerująca | Do granicy wyborów bez próby | Do granicy wyborów bez próby | Próba V lub VI 1927, po 6/12 |
| C — współrządząca | Do granicy wyborów bez próby | Do granicy wyborów bez próby | Próba V lub VI 1927, po 6/12 |
| H — historycznie zbliżone decyzje | Próba II 1927 | Próba I 1927 | Próba V 1927 |

Pozostałe pola tabeli zachowują ten sam termin w 12/12 badanych losowań. Skład bazowy jest syntetycznym wejściem wcześniejszych testów, nie wynikiem historycznym. Korzystniejszy przenosi 8 miejsc do PPS i 4 do Wyzwolenia, odpowiednio od ZLN/PSChD; trudniejszy odwrotnie. Wszystkie mają 444 miejsca. Blok Piast–PSChD–ZLN ma odpowiednio 230/218/242: od tego zależy możliwość legalnej zmiany, a nie kalendarz premierów.

**Wniosek korygujący zakres poprzedniego dowodu:** H z 17.16.9 osiągał maj przy zamrożonym ciągu gabinetowym. Po ocenieniu odmów Grabski odchodzi w VIII 1925, Skrzyński ma przegląd w I 1926, a po odejściu PPS Witos wraca w III. Zapisane +20 od V nie działa dla tego powrotu. Wynik majowy nie został więc potwierdzony w połączonym przebiegu. Nie zwiększono presji, aby go odtworzyć.

Sprawdzone zależności: osobna większość finansująca osłony; odrzucony kredyt bez późniejszych efektów; zachowanie programów po zmianie premiera; wykonana ugoda zatrzymująca konkretny spór; roboty dające w C −0,50 pp bezrobocia w sparowanym stanie V 1926. Korzystniejszy Sejm może umożliwić osłony, a nadal nie zapewniać dodatkowych pieniędzy na roboty. Trudniejszy utrzymuje prawicowy gabinet po odejściu dziesięciu posłów Piasta i może zablokować plan tolerowania Grabskiego.

**Decyzje wynikające z tego sprawdzenia:** użytkownik zatwierdził usunięcie bramki maja i dodatkowych minimów relacji, a datowanie spraw wojskowych pozostawił robocze — 17.16.11. Profile inicjatyw i stanowisk osób pozostają P do testów prototypu. Kontrolne profile Sikorskiego/Witosa oraz warunki ofert mniejszości nie są historycznymi faktami ani pełnym modelem wszystkich ich zachowań.

**Granica:** wspólne losowania dotyczą ugód, starć i sił. Dostęp do zaplanowanych zwykłych kart jest kontrolowany, nie losujemy pełnej ręki. Otwarcie instytucjonalne, kompetentni wykonawcy i syntetyczne siły mają jawne profile. Wyniku kolejnych wyborów nie obliczono; sam przepływ za warunki życia z 5.6 sprawdzono później na tych przebiegach (M09, 0.21). Rozłamy E3 nie zostały osiągnięte. To diagnostyka scenariusza, nie test pełnej gry.

#### 17.16.11. Końcowa korekta i domknięcie M02 — 0.16

**Z — zatwierdzone 22 IX 2026:** usuwamy tylko dwie dodatkowe blokady; pozostałe liczby i zestaw przebiegów zachowujemy.

- **Impuls +20:** legalnie powołany Chjeno-Piast musi rzeczywiście wrócić po swoim wcześniejszym rządzie i po bezpośrednio poprzedzającym gabinecie o profilu stabilizacyjnym lub szerokim. W chwili powołania musi istnieć nierozwiązana sprawa wojskowa. Raz w rozdziale, bez warunku miesiąca/roku. Sam pierwszy gabinet tej konfiguracji, oferta bez powołania, powrót po innym profilu lub przy rozwiązanym sporze nie dają impulsu. Późniejsze otwarcie sprawy nie dopisuje go wstecz.
- **Kompromis osłon:** ocena każdej wymaganej zgody ≥60 według 8.3, wykonalne finansowanie i nienaruszone twarde warunki. Relacje liczymy wyłącznie we wspólnej ocenie, bez dodatkowych minimów 25/45. Nie zmieniamy kwoty osłon, momentu przeglądu ani skutków odmowy.
- **Pozostałe parametry:** +2/M za co najmniej jedną otwartą sprawę i próg 65 pozostają. Nie zmieniamy osobnej bramki sposobności z 16.2 ani progu zdolności. Usunięcie bramki maja dla impulsu nie usuwa warunków rozpoczęcia samej próby.
- **B — datowanie spraw wojskowych:** `TBD — historical research required`. I 1925 w głównym teście i VI 1923 w kontroli to robocze wejścia, nie potwierdzone daty początku jednego ciągłego konfliktu. Nie przesuwamy ich, by wymusić maj.

Historia powołań, profil poprzednika i otwarty `EventRun` wystarczają do oceny; bez nowego miernika lub karty. Zachowujemy identyfikatory `chjeno1926Impulse` i `cabinet.chjeno_return_1926` dla ciągłości dokumentacji: końcówka `1926` nie jest warunkiem daty. Metadane scenariusza mają wersję 5. Zapisane skutki pozostają naliczone raz; nie odtwarzamy dawnych powołań po aktualizacji.

**Status M02: scenariusz gotowy do implementacji.** Końcowe sprawdzenie używa raz tego samego zestawu 144 + 216 + 36 przebiegów: [wyniki i różnice](../analysis/m02-robustness/REPORT.md). Balans dat, pełny dobór kart i historyczny profil sił wymagają grywalnego prototypu; M06 zamknięto w dokumentacji w 0.28 (7.3–7.5), M08 w 0.20 (16.8), M09 w 0.21 (5.6), a M10 w 0.22 (15.2–16.1). Mały składnik demokracji w presji z 0.22 opóźnia każdą z 96 prób o 1–3 M, bez utraty żadnej; to zatwierdzony skutek, nie nowe dopasowanie. Kruchość z poparcia i sporów z 0.24 (M12) zmienia miesiąc ugody strajkowej w 10 przebiegach i przyspiesza jeden termin próby o miesiąc, bez zmiany kolejności gabinetów. Nie rozpoczynamy kolejnej rundy dopasowywania dat w dokumentacji.

**K — etap 8 (0.49):** datowanie spraw wojskowych rozstrzygnęły badania 8f: sprawa otwiera się w VII 1923 (`PL-MILITARY-CASE-1923-1926`), a publiczny epizod nacisku przypada na kryzys od XI 1925. Strojenie etapu 8 nie zmieniło +2/M ani progu 65; presja startowa wynosi 0 (P). Wzorzec 1A: N-A i N-H mają próbę w III 1926, N-B i N-C nie mają próby dzięki wykonanemu porozumieniu ([pomiar](../analysis/stage8-campaigns/REPORT.md)).

## 18. Ścieżki jako zestawy warunków, a nie osobne tryby

### 18.1. Osiem zgodnych z przewodnikiem strategii

Nie istnieje `winning_route=...`, które wyłącza pozostałe strategie. Raport może rozpoznać kilka profili działania w jednej kampanii. Wskaźniki poniżej są proponowanymi kryteriami diagnostycznymi; nie stanowią końcowej punktacji zwycięstwa.

| Strategia | Minimalne przygotowanie | Sprawdzalny rezultat | Typowa droga załamania |
|---|---|---|---|
| Parlamentarna obrona demokracji | Partnerzy przyjmują program; działające legalne instytucje; uchwalony budżet | Autorytet ≥55, demokracja ≥60; bez zaległego ultimatum; mocniejszy wariant także z uchwaloną reformą reguł gabinetowych | Dobre relacje bez głosów; niewykonane zobowiązania; odejście partnera otwierające skuteczne odwołanie gabinetu |
| Stabilizacja z ochroną robotników | Zabezpieczone osłony i legalny plan dochodów przed odcięciem emisji | Nowy reżim pieniądza; inflacja ≤2% przez 3 M; płace realne ≥90; pełne wykonanie uzgodnionego wariantu osłon | Stabilizacja cen przy ograniczonych świadczeniach i spadku płac, które niszczą poparcie dla jej wykonawcy |
| Porozumienie z ludowcami | Zgoda programu ziemskiego i pracowniczego; właściwy partner, nie ogólna suma „centrum” | Wykonana jednostka reformy ziemskiej i umowa bez niezałatwionego naruszenia | Wspólna lista bez wspólnego programu; zobowiązanie przekraczające budżet lub czerwoną linię własności |
| Samodzielna partia masowa | Aparat ≥2, prasa ≥50, finansowanie i co najmniej dwie branże z zasięgiem ≥40 | Organizacje utrzymane przez 6 M, wzrost poparcia w rzeczywistych komórkach; zdolność negocjowania bez resortów | Wzrost wydatków stałych, brak funduszu strajkowego, frakcje rozchodzące się po odmowie współpracy |
| Zatrudnienie i aktywna polityka gospodarcza | Gotowy projekt, wykonawca i budżet po uruchomieniu ≥−2; znany koszt utrzymania | ≥2 działające jednostki robót; pełne wykonanie; publiczne miejsca pracy odróżnione od prywatnej koniunktury | Późne uruchomienie, niedobór budżetu, wygaśnięcie finansowania albo aktywna reakcja kapitału |
| Radykalny nacisk i ograniczona współpraca z komunistami | Dwie wykonane próby, uzgodnione zasady, fundusze i kontrola własnej organizacji | Wykonana ugoda bez wymuszonego podporządkowania PPS; zdolność zakończenia akcji | Odrzucona ugoda, odpływ centrum, partner łamiący reguły i rosnąca niekontrolowana presja |
| Warunkowa współpraca z Piłsudskim | Przyjęta konkretna umowa; przygotowana linia we frakcji i organizacjach | Ustępstwo wykonane i zapisane, a nie tylko zwycięstwo wspieranej strony | Wsparcie bez zobowiązań; wzrost zdolności zamachowej mimo chwilowego spadku presji; odmowa posłuchu |
| Przygotowana obrona konstytucyjna | Legalne kompetencje, rozpoznanie, przygotowane organizacje, realne siły obrony | Wykonane legalne rozstrzygnięcie lub przyjęty kompromis; raport faktycznych strat i stanu partii | Deklaracja obrony bez posłuchu, spóźnione rezerwy, równoczesny rozłam własnego zaplecza |

### 18.2. Dlaczego podobne strategie dają różne rezultaty

Droga parlamentarna odpowiada na pytanie, kto może legalnie rządzić i jak zapobiec utracie skutecznej większości. Umiarkowana stabilizacja odpowiada na pytanie, jak rozłożyć koszt naprawy finansów i cen. Można połączyć obie, ale ani inflacja 1%, ani dobre relacje z partnerami nie ustanawiają konstruktywnego wotum nieufności. Z kolei reforma procedury nie finansuje świadczeń.

Większa PPS nie musi mieć większego wpływu w konkretnej rozmowie. Przykład L z 8.2 pokazuje spadek z około 74 do 14 po pojawieniu się alternatywnego układu, bez zmiany sondażu. Nawet przy L=74 uruchomienie programu obciążającego budżet o 2 B podczas budowy i 1 B podczas działania wymaga budżetu i wykonawcy. R, B, mandaty, relacja oraz leverage nie są zamiennymi saldami.

### 18.3. Cztery przykłady przejść do sprawdzenia

1. **Umowa i ultimatum.** Jeden obowiązek o wadze 2 jest po terminie: +16 napięcia/M. Początek 20 → 36 → 52 → 68. W trzecim rozliczeniu otwiera się ultimatum z terminem `t+2`. Mediacja −8 zmniejsza napięcie do 60, ale sama nie wykonuje obowiązku. Zapłata zaległości i zaakceptowanie odbioru zamykają naruszenie; wyjście partnera nie następuje tylko dlatego, że kiedyś osiągnięto 60.
2. **Ustawa bez pełnej osłony.** Pełna osłona zobowiązuje budżet na 2 B, ale budżet −3 daje wykonanie 0,5. Bieżąca ulga 2 daje 1; umowa wymagająca pełnego wykonania pozostaje niewykonana. Legalne przyjęcie ograniczonego wariantu za 1 B jest innym stanem niż niedofinansowanie pełnego programu. Nie można zamienić jednego w drugi samą etykietą.

Każdy przykład izoluje wybrane wejścia. Nie jest symulacją całej historycznej kampanii ani dowodem, że strategia została zbalansowana.

## 19. Granica rozdziału, raport i zapis

### 19.1. Dokładny predykat końca

Sprawdzanie następuje po zatwierdzeniu skutków wydarzenia, przed wyborem kolejnej zwykłej sceny i przed formowaniem gabinetu po następnych wyborach:

```js
electionEndpoint = latestElection != null &&
  latestElection.sequence_after_opening >= 2 &&
  latestElection.legal_basis.validated &&
  latestElection.status === "certified" &&
  latestElection.total_seats === 444;

coupEndpoint = coup.attempt_id != null &&
  coup.phase === "resolved" &&
  coup.outcome != null &&
  coup.effects_complete;

chapterEnds = electionEndpoint || coupEndpoint;
```

`sequence_after_opening=1` oznacza wybory listopadowe 1922. Uproszczony Sejm startowy nie jest nowo przeprowadzonymi wyborami. Drugi legalny wynik kończy rozdział niezależnie od tego, czy przypada przed majem 1926. `certified` w tym modelu oznacza ukończony techniczny zapis całego wyniku; nie twierdzimy, że historyczna procedura rozstrzygania protestów wyborczych zajmowała zero dni.

Rozwiązanie parlamentu, samo zarządzenie wyborów, sondaż oraz pierwszy wynik 1922 nie spełniają tego warunku. Jeżeli przed datą głosowania rozpocznie się zamach i nastąpi jego rozliczenie, granicą jest zamach. Rekord wyborów pozostaje w raporcie jako zaplanowany lub przerwany.

Uniknięcie próby w fazie `political_crisis` nie kończy rozdziału. Kompromis zawarty po `attempt_declared` jest rozstrzygnięciem rozpoczętej próby i kończy go. Po czterech rundach i ocenie końcowej bez zwycięstwa i ugody status wyniku brzmi `prolonged_conflict`: zakończyliśmy zakres symulacji pierwszego rozdziału, nie ogłaszamy fikcyjnego zwycięstwa militarnego. **Z — zatwierdzone 24 IX 2026 (M08):** to pełnoprawny koniec rozdziału z raportem przekazania (16.8.6). Ma być rzadszy niż zwycięstwo jednej ze stron.

Jeżeli tego samego dnia kolidują różne końce, obowiązuje kolejność wydarzeń: aktywnej rozpoczętej sekwencji nie przerywa drugi raport; pozostałe sprawy zachowują się jako niezrealizowane. Raz zapisany `chapter.trigger_id` nie jest zastępowany późniejszym wejściem do menu.

**K — etap 2 (0.43):** `PolishInstitutions.endChapterIfDue` sprawdza warunek zaraz po zatwierdzeniu wyniku, przed formowaniem rządu. Zapisuje w `S.chapter` status `ended`, przyczynę `next_legal_election`, `trigger_id` wyniku i raport. `coupEndpoint` czyta `S.coup`, które powstanie w etapie 7; do tego czasu jest zawsze fałszywy.

**K — etap 7 (0.48):** rozliczona próba kończy rozdział z przyczyną `coup` i `trigger_id` próby; raport zachowuje ostatnie wybory (`last_election`). Po raporcie `main`, `post_event` i `root` prowadzą tylko do raportu.

### 19.2. Raport opisuje stan, nie moralną punktację

G8 to jeden raport. Wynik F10+F11 albo G7 jest jego pierwszą częścią; nie powtarzamy rozstrzygnięcia na trzech ekranach i nie dodajemy decyzji po końcu rozdziału.

`ChapterReport` jest głęboką kopią, z `report_id,schema_version,balance_id,scenario_id,trigger_id,time,date,reason,state,ledger_summary,uncertainties,continuation_requirements`. Minimalna zawartość:

| Obszar raportu | Co musi zostać zachowane |
|---|---|
| Punkt zwrotny | Typ, data, wynik wyborów albo wariant zamachu, zakończone i przerwane fazy |
| PPS | Sondaże, mandaty, frakcje, rozłamy i osoby odchodzące, reputacja, kasa i koszty utrzymania |
| Ustrój | Obowiązujące reformy, urzędy i wakancje, legalna podstawa władzy, aktualny parlament i Senat |
| Rząd | Premier, tryb PPS, resorty, ważność upoważnień, umowy i zaległe terminy |
| Społeczeństwo | Preferencje komórek, frekwencja, niezadowolenie, radykalizacja, demokratyczna legitymizacja |
| Gospodarka | Inflacja, płace realne, produkcja, zatrudnienie, kredyt, składniki budżetu, fazy pożyczki, emisja i jedna reakcja kapitału |
| Organizacje | Fundusze i posłuch związków, prasa, TUR, spółdzielnie, Milicja/AS, straty i status prawny |
| Strategia i członkostwo | Aktualne stanowiska, do 3 priorytetów, wykonane przygotowania demokratyczne, decyzje o ZSRR i strajkach, manifesty czystek oraz indeks członkostwa |
| Siły państwa | Faktyczne przydziały, straty, dowodzenie, lojalność i nadal niepewne rozpoznanie |
| Niedokończone sprawy | Projekty, ustawy w toku, terminy obciążeń i finansowania, niewykonane obietnice, ultimata i wygasające porozumienia |
| Pamięć działań | Zapisane losowania i rozstrzygnięcia, ID zastosowanych efektów, nasycenie kampanii, odnowienia |

Wynik prezentowany graczowi może wskazać konkretną porażkę: utratę partnera, zdobyczy pracowniczych, legalnej władzy lub części partii. Nie zamienia tego automatycznie w nieodwracalne `game_over` odziedziczone z Niemiec. Delegalizacja PPS powinna otwierać ograniczony tryb przetrwania i raportować straty, jeśli taki wariant został opracowany; dopóki jego treści nie ma, nie należy tworzyć nieobsługiwanej blokady wszystkich działań.

**K — etap 2 (0.43):** raport jest głęboką kopią w `S.chapter.report`. Zawiera punkt zwrotny z wynikami obu wyborów, PPS (mandaty, udział głosów, frakcje), ustrój (prezydent, marszałek poprzedniej kadencji, Sejm, Senat), rząd w obecnej prostej postaci, podsumowanie zapisów i niepewności. Obszary z późniejszych etapów są wymienione jako jeszcze nie modelowane, a nie wymyślone. Scena `polish_chapter_report` pokazuje raport po angielsku. Po końcu rozdziału `main`, `post_event` i `root` prowadzą tylko do raportu i nie rozliczają nowych miesięcy. Nową grę zaczyna przeładowanie strony.

**K — etap 7 (0.48):** raport ma też społeczeństwo (komórki, klasy, legitymizacja), politykę (demokracja, autorytet, przemoc, presja, sprawy i restrykcje), siły państwa (zgrupowania, strony, straty, rozpoznanie, policja, umowa z Piłsudskim), niedokończone sprawy i pamięć działań. Punkt zwrotny zamachu zapisuje wynik, ofertę, F9, rundy, strony, rzuty, wkład PPS, skutki i `continuation_requirements`. Lista `NOT_MODELLED` wymienia tylko treść i kalibrację etapu 8 oraz kontynuację.

**K — etap 8 (0.49):** lista `NOT_MODELLED` ma jedną pozycję: to, co następuje po rozdziale (nowy rząd po wyborach albo po zamachu), nie jest częścią gry; scena pokazuje ją pod nagłówkiem „Beyond this chapter”. Ustrój w raporcie zapisuje też marszałka obradującego Sejmu (`constitution.speaker`). Raport po zamachu pokazuje go jako marszałka Sejmu, a raport po wyborach pokazuje marszałka ustępującego Sejmu. Wcześniej raport po zamachu pokazywał w tym miejscu „Vacant”.

### 19.3. Odporność zapisu w środku wydarzenia

Zapisywać trzeba zarówno stan Dendry potrzebny do powrotu do sceny, jak i rekord aktywnej transakcji/sekwencji. Samo `coup.round=2` nie wystarcza bez zapisanych przydziałów, strat i rzutów.

Przy wczytaniu:

1. Sprawdzić wersję schematu i manifestu scenariusza.
2. Odtworzyć wartości pochodne z autorytatywnych rekordów.
3. Wznowić wskazaną fazę bez ponownego pobrania kosztu i losowania.
4. Dokończyć tylko efekty niezapisane w `effects_applied`.
5. Jeżeli raport istnieje, otworzyć raport bez dalszego rozliczania miesięcy.

**Z — 0.40:** zapis bez zgodnej wersji schematu, w tym każdy zapis sprzed przebudowy, nie jest migrowany. Gra pokazuje komunikat i proponuje nową grę.

**K — etap 0 (0.41):** `PolishRules.checkSave` porównuje wersję schematu. `out/html/game.js` zaraz po każdym wczytaniu pyta o nową grę. Sceny `main` i `post_event` zatrzymują niezgodny zapis w scenie `polish_incompatible_save`, zanim rozliczą miesiąc.

Zmiana zestawu balansowego w trakcie kampanii wymaga jawnej migracji. Nie wolno po cichu zmienić kosztu już podpisanej umowy przez podmianę globalnej tabeli. Wartości konkretnego zobowiązania i aktywnego programu są zapisane w ich rekordach.

## 20. Integracja z Dendry i odziedziczonym kodem

### 20.1. Mapa odpowiedzialności

To plan wdrożenia, nie polecenie wykonania zmian w tej pracy dokumentacyjnej. Nazwy proponowanych helperów są interfejsami logicznymi; docelowe pliki i sposób ich wywoływania należy dopasować do działającego projektu.

| Istniejąca powierzchnia | Zachować / sprawdzić | Proponowany następca odpowiedzialności |
|---|---|---|
| `source/scenes/root.scene.dry` | Zatwierdzone otwarcie, identyfikatory partii i doradców | `initializePolishState(profile)`; walidacja nowych domen i danych wejściowych |
| `source/scenes/main.scene.dry` | Wspólna ręka i punkt wejścia | `availableActions(state)`, agenda i wspólny miesięczny koszt |
| `source/scenes/post_event.scene.dry` | Znane obecne przejścia i zależności | `settleMonthOnce(t)`, uporządkowane finanse/projekty/gospodarka/społeczeństwo |
| `source/scenes/sejm_election.scene.dry` i `source/scenes/sejm_election_result.scene.dry` | Metoda 444 mandatów i oddzielone wyniki | `certifyElection()`, listy/kluby/Senat oraz sprawdzenie końca przed nowym gabinetem |
| `source/scenes/polish_opening_state.scene.dry` | Semantyczny otwierający gabinet i kompetencje | Aktualizacja z zaakceptowanej umowy, bez nadpisania historii wyborów |
| `source/scenes/polish_presidential_sequence.scene.dry` | Rozdział urzędu od niemieckiego prezydenta | `resolvePresidentialElection()`, jeden wynik po nominacji, rzeczywisty marszałek i osobny model zagrożenia |
| `source/scenes/party_affairs/`, `source/scenes/government_affairs/` | Inwentarz kosztów, dostępności i skutków | Małe wymiany poszczególnych kart na kontrakty rozdziału 17 |
| `source/scenes/advisors/` | Czternaście nazw i istniejące dostępności | Jedna transakcja działania, wspólne odnowienie, brak cofania kosztu po wykonaniu |
| `source/scenes/events/` | Dated routing i efekty wymagające wyłączenia | `routePolishEvents()` oraz osobny manifest zamachu i kolejnych wyborów |
| `node_modules/dendrynexus/lib/engine.js` | Semantyka talii, ręki, powrotu, serializacji | Audyt zachowania; bez edytowania zależności, jeśli wystarcza rozwiązanie w treści/helperze |

Kod pomocniczy powinien oddzielać obliczenie od zapisania wyniku: np. `computeFiscalSettlement(state)` zwraca kwoty i przyczyny, a jedna transakcja je stosuje. Nie jest potrzebna zmiana silnika, języka ani frameworka interfejsu.

**Z — 0.40: miejsce kodu reguł.** Obliczenia reguł trafiają do osobnego pliku zwykłego JavaScriptu w `source/rules/`, bez nowych zależności i bez kompilatora. `npm run build` kopiuje go do `out/html/`, strona wczytuje go przed `core.js`, a testy Node wczytują go bezpośrednio. Sceny Dendry wywołują go w skryptach i w warunkach `{! … !}`.

**Z — 0.40: język.** Teksty dla gracza powstają na razie tylko po angielsku; polskie nazwy własne osób, partii i instytucji zostają. Dokumentacja pozostaje po polsku.

**K — etap 0 (0.41):** `npm run build` kopiuje `source/rules/polish_rules.js` do `out/html/`, `out/html/index.html` wczytuje go przed `core.js`, a testy Node wczytują tę samą kopię.

**K — etap 2 (0.43):** drugi plik reguł, `source/rules/polish_institutions.js` (`window.PolishInstitutions`), obsługuje wybory, Senat, głosowania, urzędy, kalendarz i koniec rozdziału. Korzysta z zegara i rzutów z `polish_rules.js`, więc strona wczytuje go po nim i przed `core.js`.

### 20.1.1. Dziewięć resortów a dotychczasowe zapisy

Zmiana projektu nie zmieniła istniejącego `Q.polish_portfolios` i dziesięciu kategorii w kodzie. Przyszły allocator ma korzystać z jawnego manifestu dziewięciu resortów z 8.5, nie z odziedziczonej długości mapy. Program `public_works` pozostaje ważny jako temat; klucz o tej nazwie nie jest już dopuszczalnym stanowiskiem w nowych ofertach, prognozach `portfolioFit`, wakatach i podziale gabinetu.

Starszy zapis z osobnymi właścicielami Pracy oraz Robót nie może być przekształcony przez przypisanie dwóch ministrów do `labor`, przyznanie obu partii tej samej kompetencji ani automatyczne usunięcie podpisanych zobowiązań. Wdrożenie wymaga wersjonowanej, jawnej migracji obsady i zgody na zmienione umowy; do jej opracowania stare zapisy zachowują stary manifest, a nowy wymaga nowej kampanii. Istniejące projekty, długi, wybudowane obiekty i ich koszty nie są usuwane wraz z kategorią resortu. Historyczne biografie i inwentarz dawnego kodu pozostają opisem własnego kontekstu.

**K — etap 3 (0.44):** wdrożone jak wyżej: dziewięć resortów, a `public_works` jest tematem programu, nie urzędem.

### 20.2. Manifest przejęcia mechaniki

Każda wdrażana domena ma wpis: `system_id,new_owner,legacy_writers_to_disable,legacy_readers_to_adapt,migration,tests,status`. Dopóki nowa gospodarka nie przejdzie weryfikacji, dotychczasowe zachowanie pozostaje bazą. W momencie przejęcia wyłącza się wszystkie stare skutki tej domeny w tej samej ograniczonej zmianie.

Najbardziej niebezpieczne przecieki:

- nowa inflacja aktualizowana obok starego `budget` i niemieckich sprzężeń;
- nowe umowy obok dawnych progów automatycznego rozpadu koalicji;
- nowe fazy zamachu obok wcześniejszego wyliczenia `coup_progress` lub wyniku przed wyborem;
- dokładne mandaty nadpisywane przez późniejsze procenty sondaży;
- polska sukcesja odczytująca odziedziczone `president`;
- odnowienie doradcy odejmowane przez kilka powrotów do `main`;
- niemiecki automatyczny epilog przerywający polski raport;
- spóźnione niemieckie wydarzenie uruchamiane wyłącznie dlatego, że numer miesiąca doszedł do dawnego progu;
- polski przepływ za warunki życia (5.6) obok odziedziczonych reguł poparcia: erozji `pro_republic` od bezrobocia i inflacji, przepływów do NSDAP i dryfów lat 1929–1932 w `source/scenes/post_event.scene.dry` oraz sceny `source/scenes/events/high_inflation.scene.dry`. Gospodarka liczyłaby się wtedy dwa razy;
- odziedziczone `pro_republic` zapisywane przez sceny doradców (`source/scenes/advisors/niedzialkowski.scene.dry`, `prochnik.scene.dry`) obok polskiej demokracji. Polskie skutki A4 i A12 zapisują wyłącznie `S.politics.democracy` (15.2), a zapis `parliament_authority` poza dziennikiem jest błędem.

Nie wystarczy zamienić nazwę karty. Czytelnik każdego przejmowanego pola i wszystkie ścieżki jego zapisu muszą trafić do manifestu. [TRANSITION_MATRIX.md](../TRANSITION_MATRIX.md) pozostaje inwentarzem wykonanych wycinków i ich granic.

**K — etap 2 (0.43):** wpis `elections_offices` ma status „wykonane”. Mandaty pochodzą tylko z zapisanego wyniku (przeciek 4). Polska głowa państwa nie czyta odziedziczonego `president` (przeciek 5). Niemieckie zakończenia mają tag `event`, którego `post_event` nie oferuje, a test sprawdza, że żadna polska scena do nich nie prowadzi (przeciek 7). `main` i `post_event` wybierają następną scenę z jednej wartości `pl_route`: najpierw rozpoczęta sekwencja, potem wybory, marszałek i prezydent, na końcu kolejka wydarzeń. Wybory wejdą do kolejki w etapie 7, razem z pierwszymi wydarzeniami kategorii 1–2.

**K — etap 3 (0.44):** wpis `agreements_cabinets` ma status „wykonane”. `coalition_dissent` nie ma skutku (przeciek 2): lustro zeruje je przy każdym odświeżeniu, karta `coalition_affairs` jest zablokowana, a doradcy go nie zmieniają. Niemieckie wota nieufności są nieosiągalne, co sprawdza test. Z `election_1928` usunięto sześć stałych opcji rządu.

**K — etap 4 (0.45):** wpis `economy_projects` ma status „wykonane”. `S.economy` jest jedynym właścicielem, a `Q.budget`, `Q.inflation` i `Q.economic_growth` zapisuje tylko jego lustro (przeciek 1). Niemiecki blok gospodarki i poparcia w `post_event` działa tylko bez `polish_economy_system`, a `events/high_inflation` i dziewięć zastąpionych niemieckich kart rządowych są zablokowane tym samym warunkiem (przeciek 9); test „Stare reguły poparcia” to sprawdza.

**K — etap 5 (0.46):** wpis `party_factions` ma status „wykonane”. Właścicielami są `S.party_orgs`, `S.militia`, `S.unions` (część z etapu 6), `S.faction_cases`, `S.advisors` i `S.actors.pps`; stare pola partii, Milicji i frakcji są kopiami. Trzy automatyczne sceny kryzysu frakcji mają znacznik `event` i nie trafiają do kolejki. Odziedziczone karty partyjne mają warunek `not polish_party_rules`. Niemieckie mosty frakcji i wierszy poparcia są wyłączone. Przeciek 10 zamknięty: Niedziałkowski i Próchnik nie zapisują `pro_republic`. Wskaźniki `qdisplays/dissent`, `strength`, `loyalty` i `militancy` czytają kopie bez zmian.

**K — etap 6 (0.47):** wpis `unions_strikes` ma status „wykonane”. Właścicielami są `S.unions`, `S.strikes` i `S.enterprises`; niemieckie `labor_unrest` i `unions_declare_independence` mają warunek `not polish_union_rules` i nie wchodzą do polskiej kolejki.

**K — etap 7 (0.48):** wpis `democracy_coup` ma status „wykonane”. Właścicielami są `S.politics`, `S.security` i `S.coup`. 26 niemieckich scen zapisujących `coup_progress` albo `pro_republic` ma warunek `not polish_security_rules` (przeciek 3 zamknięty), a Status i Biblioteka czytają przywiązanie do demokracji.

### 20.3. Kolejność ograniczonych wdrożeń

1. Kontrakt czasu, transakcji, losowań, agendy i zapisu; bez zmiany bilansu całej gospodarki.
2. Zamrożone wybory, minimalny Senat, głosowania i legalny koniec rozdziału.
3. Umowy, gabinety i kompetencje resortów; jeden testowy program od oferty do wykonania.
4. Księga finansów, projekt i gospodarka; dopiero wtedy pełny katalog polityk.
5. Organizacje, frakcje i strajk z wykonaniem ugody.
6. Presja, siły, fazy zamachu i raport po decyzjach.
7. Zbadane profile historyczne, chronologia, pełna kampania i kalibracja.

**Z — 0.40:** szczegółowy plan tych wdrożeń — etapy 0–8 z plikami, testami 21.1 i wstępnym manifestem przejęcia — jest w [POLISH_IMPLEMENTATION_PLAN.md](POLISH_IMPLEMENTATION_PLAN.md). Plan dodaje etap 0, czyli fundament techniczny, i dzieli punkt 5 na partię oraz związki ze strajkami.

To podział odpowiedzialności, nie nowe osobne silniki. Ten sam `Agreement`, `Project`, `Ballot`, `EventRun` i `ActionTxn` obsługuje kolejne lata. Kontynuacja do 1939 dodaje aktorów, projekty i reguły ustrojowe z datą wejścia w życie; nie resetuje całego stanu na granicy roku.

## 21. Kryteria weryfikacji i kalibracji

### 21.1. Niezmienniki i przypadki graniczne

**D–G — dodatkowe kryteria przyszłej implementacji:**

- D1 nie występuje przed wyborami 1922 ani w formalnym rządzie; D2 wymaga rozpoczętej jedynej inicjatywy. Zmiana trybu PPS, zapis i wczytanie nie resetują limitu. D2 zawieszona podczas udziału w rządzie wraca bez kosztu D1.
- D2 ma dwa wybory: kompromis tylko z rzeczywistym partnerem, inaczej wycofanie. Pełny projekt może przegrać. Od razu rozstrzyga się Sejm; Senat i ewentualny powrót do Sejmu wymagają dat +30/+60, bez trzeciej karty i blokowania zwykłej akcji.
- D przed `effective_at` nie kosztuje B i nie wypłaca świadczenia. Po wejściu w życie pierwsze należne rozliczenie odczytuje aktualny budżet: 1/0,5/0; przy zerze obowiązek pozostaje, a nagrody czekają na wykonanie.
- D: zaakceptowana poprawka Senatu rozlicza koszt i świadczenie zmienionego tekstu. Odrzucenie poprawki wymaga 11/20, a brak obu większości lub kworum zamyka inicjatywę; nie otwiera D2 ponownie.
- Autorstwo D daje raz udział PPS 0,40 po pełnym wykonaniu. Nie sumuje się z głosowaniem, tolerowaniem i objęciem resortu; częściowa wypłata uruchamia tylko właściwą ulgę społeczną. Zapis po wypłacie nie powtarza żadnego skutku.
- Wejście PPS do rządu przed D2 zawiesza wybór; po D2 nie zatrzymuje procedury. Rozwiązanie Sejmu zamyka niedokończone D jako `expired`; koniec rozdziału nie wykonuje przyszłych zdarzeń. Ogólne karty i doradcy nie odnawiają limitu.
- E3 obejmuje tylko wskazaną część frakcji. Domyślny manifest nie usuwa doradców; wyjątek zapowiada konkretną osobę. Przyjęcie żądania rzeczywiście zmienia politykę, odmowa stosuje manifest raz.
- E6 wymaga wcześniejszej ugody i rzeczywistej odmowy. Ten sam strajk i ugoda nie tworzą ponownej E6 ani E7; część strajkujących może nie posłuchać wezwania kończącego akcję.
- F6+F7 oraz F10+F11 nie mają decyzji. F9 nie występuje przy samym poparciu politycznym, wyborze `none`, neutralności ani nieistotnym udziale (16.8.6). Istotny udział bez oferty przyjętej przez pozostałe strony także nie wystarcza. F9 najwyżej raz; odrzucenie zamyka ugodę do końca próby.
- Neutralna PPS nie blokuje transportów dla jednej strony. Wewnętrzne rundy nie otwierają nowych decyzji taktycznych; wynik uwzględnia przyjętą lub odrzuconą F9.
- Walka kończy się po najwyżej 4 rundach, także po 1. albo 2. rundzie według 16.8.4. `prolonged_conflict` po ocenie końcowej jest końcem rozdziału. Ustępstwa zwycięzcy wymagają `pps_contribution=decisive`.
- G2/G3/G5 nie tworzą osobnych ekranów. G6 kontynuuje kampanię; G7 kończy ją przed formowaniem gabinetu. G8 nie dubluje wyniku, G9 nie nalicza efektów ponownie.

Poniższa lista jest specyfikacją przyszłych testów, nie raportem ich zaliczenia przez obecny kod.

| Test | Wejście lub działanie | Wymagany wynik |
|---|---|---|
| Jedna tura | Główna karta → kilka podscen → powrót | Dokładnie jedno rozliczenie t i jeden przyrost czasu |
| Nowe powołanie | Frakcje 50/15/35; pierwszy nowy Piłsudczyk; jego dissent 20 | Po +5 surowej siły: 47,619/14,286/38,095; dissent Piłsudczyków 15. Ponowne powołanie nie daje kolejnych korzyści |
| Start i odwołanie | Początkowy doradca, następnie odwołanie i powrót | Brak drugiego bonusu otwarcia; przy dobrowolnym odwołaniu +5 dissentu; wspólny timer bez resetu |
| Pużak | Dissenty 8/20/40, Party Discipline | 0/8/28; żadnego dodatkowego warunku obietnicy lub mediacji |
| Jedno przekierowanie | Arciszewski, Praca, podakcja na odnowieniu, wystarczające środki | Jeden wskazany krok 0 T, zwykły R/B; wszyscy doradcy zablokowani do t+6; kolejne kroki normalnie |
| Brak resortu | Moraczewski w opozycji lub sam Skarb bez wykonawcy Pracy | Brak wykonania robót, brak pobrania odnowienia za odrzucony podgląd |
| Piłsudczycy | Jaworowski / Malinowski / Ziemięcki przy formalnej koalicji | Odpowiednio relacja i frakcja / tylko frakcja / tolerowanie niedostępne, miejska akcja niezależna |
| Miasta i klasy | Podział komórki major_city/other, potem Municipal Socialism | Suma mas i wcześniejszy sondaż niezmienione przez sam podział; akcja obejmuje tylko właściwy zakres |
| Efekty czasowe | Pużak i Perl, właściwa prasowa kampania robotnicza przed/po wygaśnięciu | Tylko aktywne właściwe mnożniki; bez powtórnej nagrody, bez ujemnych preferencji |
| KPP i Lewica | Socialist Education, odpływ 4 pp PPS→KPP oraz 2 pp inna partia→KPP | Pierwszy ograniczony do 2, drugi bez zmiany; Lewica PPS nie staje się KPP |
| Droga do KPP | Start 10; kontakt, potem rozmowy co 3 M | Kanał od razu; ≥20 w 4. miesiącu (3 akcje), ≥30 w 10. (5 akcji), ≥50 po ok. 25 M |
| Wrogość a kanał | Stanowisko krytyczne wobec modelu sowieckiego przed kontaktem | Relacja 5 < 10; kontakt niedostępny |
| Późni doradcy | Rozdział 1 do zamachu albo do wyborów 19 II 1928 | Próchnik i Drobner niedostępni; zapisani jako obsada kontynuacji |
| Dyscyplina KPP | Relacja 30, cel partnera szeroki: wspólne żądania szerokie / ograniczone / strukturalne | 65% / 40% / 65%; zapisany jeden rzut |
| Akceptacja a KPP | Ten sam przypadek po kompromisie w PPS (akceptacja 50 → 65) | Szansa KPP bez zmian; znika kara Centrum +5/+2 |
| Program bez zmiany | Zatwierdzenie zestawu priorytetów identycznego z obecnym; potem zamknięcie karty | Zatwierdzenie zablokowane z powodem; zamknięcie bez kosztu i odnowienia (0.35) |
| Odroczenie sprawy frakcji | Frakcja z żądaniem i sprzeciwem 50: odroczenie, potem sprzeciw 62 | Brak E3 przez 3 M od odroczenia, potem E3 możliwa; samo odroczenie nie zmienia sprzeciwu (0.35) |
| Dwa warianty kompromisu | Ustępstwo dla Lewicy; osobno uzgodnienie linii współpracy z KPP | Sprzeciw Lewicy −8 za 1 T, 1 R, cd 3 M; akceptacja układu 50 → 65 w każdej frakcji za 1 T, 0 R, cd 6 M (0.35) |
| Dostęp karty Jedność | Wszystkie frakcje ze sprzeciwem poniżej 30 i zamknięty kanał z KPP; potem sprzeciw jednej frakcji 30 | Karty nie ma w puli; potem jest (0.35) |
| Zmiana doradców osobno | Brak sporu w partii | Karta zmiany doradców dostępna; karta Jedność niedostępna (0.35) |
| Kontakt i agenda KPP | Otwarcie kontaktu w miesiącu 0, potem rozmowy | Rozmowa możliwa od miesiąca 1; agenda „Współpraca z KPP” pokazuje `kpp.trial` od relacji 30 przy istniejącym żądaniu (0.35) |
| Rozpoznanie w agendzie | Trzy oceny sił co 3 M | Promień 30 → 20 → 10 → 5 pp; każda kosztuje 1 T i 1 R (0.35) |
| Kompromis w PPS | Karta `party.unity`, opcja „Kompromis” w sprawie współpracy; później złamanie zasad | +15 w każdej frakcji (65); po złamaniu −15 (50) |
| Granice dyscypliny | Relacja 0 przy zgodności 0; relacja 100 przy zgodności 100 | 10% i 90% |
| Rozmowa a akcja | Drobner negocjuje, potem wspólna demonstracja i jej ochrona | Rozmowa: zero udanych prób; wykonana demonstracja z ochroną: najwyżej jeden sukces |
| Kolejność i zakres | Koniec rozdziału po zamachu, Sanacja/SL nieaktywne lub Drobner przed 1928 | Brak nowych akcji po raporcie i przed datą; bez automatycznego powołania nowych partii |
| Doradca | Akcja przy t=1, powroty, wczytanie zapisu | Ponowne użycie najwcześniej t=7; bez drugiego przychodu miesięcznego |
| Ręka | Trzy miejsca; znikają warunki jednej karty | Brak czwartej karty; legalne uzupełnienie i trwała agenda projektu |
| Brak gotówki | R=0, brak płatnych akcji | Dostępna praca organizacyjna lub inne legalne działanie; brak ujemnej kasy |
| Rzut | Oglądanie/cancel/save/load tego samego wyzwania | Ten sam zapisany rzut; brak ponownej nagrody |
| Populacja | Zmiana zatrudnienia mniejszościowego robotnika | Suma mas=1; osoba nie dodana do osobnej drugiej puli |
| Dwie kategorie mniejszości | Połączenie komórek początkowych różnych rozmiarów i tej samej frekwencji | Zachowane masy i głosy; tylko `jewish` i `other_minorities` obok większości; suma dwóch segmentów mandatowych równa mandatowi agregatu |
| Jedna trudność | Nowa gra i wczytanie zapisu | Wyłącznie Normalny; brak selektora trybu historycznego, zapisy i sondaże dostępne |
| Prezydentura bez interaktywnych tur | Zgłoszenie albo brak kandydata, następnie wczytanie | Jeden ekran końcowego wyniku; niezmienione głosy klubów, brak powtórnej nominacji i powtórnych skutków |
| Remis finalistów urzędu | Dwie ważne kandydatury, równe głosy, spełnione kworum; rzut poniżej 0,5 / równy 0,5 | Odpowiednio pierwszy / drugi finalista; 50/50, głosy bez zmian, brak `no_election` z powodu remisu |
| Zamówienia | Jeden kontrakt, 3 M, wykonanie 1/0,5/0 i wygaśnięcie | 1 B/M, wkład 0,30/0,15/0 pp raz; potem 0. Brak drugiego pakietu i podwójnej redukcji bezrobocia |
| Policja | Ukończenie reformy, zapis, zmiana gabinetu i próba powtórzenia | +10 command/lawful_compliance raz do 100; nowy rząd nie resetuje limitu ani efektu |
| Sprawiedliwość | Potwierdzone nadużycie / brak podstaw / brak wykonania | Tylko pierwszy wynik usuwa konkretną restrykcję; żaden nie kasuje wszystkich represji. Szeroki wariant ma ID demokratyzacji |
| Nominacja | Brak kompetencji / wykonanie / powtórzenie / koniec okresu przejściowego | Właściwa grupa, suma lojalności 1, efekt +0,05 raz, −0,05 gotowości na 2 M; +8 tylko za konkretny konflikt |
| Reprezentacja | Konsultacje → współdecydowanie → ponowny wybór | Ulga −2, potem różnica −2, następnie 0. Odmowa reprezentantów blokuje objętą decyzję tylko przy decision_rights |
| Autonomia | Ustawa bez wykonania / ukończenie / polecenie spoza kompetencji | Bez przedwczesnej ulgi; po ukończeniu −3 raz dla odbiorców i rzeczywiste ograniczenie kompetencji. Szkoły nadal kosztują osobno |
| Cele ustrojowe | Rady/federacja/full autonomy; raport rozdziału | Stanowisko i jego skutki zapisane, bez nieistniejącego wdrożenia, wydatków lub ukończonej reformy |
| Zapis losowania urzędu | Powrót do menu lub save/load po rzucie i po obsadzie | Ten sam rzut i zwycięzca, jeden zapis skutków; bez nowego miesiąca lub negocjacji |
| Granica losowania urzędu | Brak kworum, nieważny finalista, nierówne głosy lub remis nad ustawą | Brak użycia wyjątku 50/50; właściwa procedura zachowuje swoje wymagania |
| Finał bez większości bezwzględnej | A 200, B 180, 60 wstrzymań, 4 nieważne | Wygrywa A; wstrzymania w obecności, nie w większości; bez losowania |
| Kworum i kandydatury | Obowiązkowy wybór urzędu; profil z jedną ważną kandydaturą | Obecne wszystkie kluby; profil odrzucony jako błąd danych przed głosowaniem |
| Bezpiecznik wyboru urzędu | Nierozstrzygnięty wybór mimo reguł | `no_election`, urząd pełni osoba z profilu, zwykła tura, nowe głosowanie w następnym miesiącu |
| Zmiana formatu prasy | Popularny → programowy → popularny | Jeden bieżący modyfikator formatu; bez kumulowania +10 zasięgu i powtórnej premii |
| Cel członkostwa | Start; zasięg związków ×1,75 przy stałym poparciu; składki 3 | 100; 137,5; 95; zawsze w 50–150 |
| Zbliżanie członkostwa | Indeks 100 przy celu 137,5; indeks 120 przy celu 100 | 101,875; 119 (5% różnicy w obie strony) |
| Zwrot aparatu | Poziom 2 przy pełnym członkostwie | Netto +0,05 R/M, zwrot 40 M (dawniej +0,10 i 20 M) |
| Otwarcia finansowe | 52 M: 3 poziomy aparatu albo 3 rozbudowy branży | +1,65 R albo +3,26 R względem braku inwestycji (dawniej +9,30 i −3,00) |
| Konfiskata | Jedna sprawa, ponowne wejście, potem uchylenie | Ograniczenie raz po ID; usunięcie tylko tej restrykcji; kampania związkowa nadal możliwa |
| Preferencje | +4 pp w komórce blisko 100% | Wszystkie udziały 0–100, suma 100, brak ujemnego rywala |
| Nasycenie | Piąta identyczna kampania w 6 M | Mniejszy przyrost niż pierwsza przy pozostałych równych wejściach |
| Warunki życia | Bezrobocie +1 pp przy stałych płacach | Robotnicy −2 pkt, inteligencja −1, drobnomieszczaństwo −0,5, chłopi −0,4, burżuazja 0 |
| Przepływ pogorszenia | Zmiana −3 i −8 pkt; gabinet ZLN–PSChD–Piast, PPS w opozycji | Partie gabinetu tracą 0,30 i 0,50 pp (limit); opozycja zyskuje według udziałów |
| Przepływ poprawy | Zmiana +3 i +8 pkt; PPS toleruje gabinet | Odpowiedzialni zyskują 0,15 i 0,25 pp (limit); PPS z wagą 0,5 |
| Asymetria | −4 pkt, potem +4 pkt za tego samego gabinetu | Odpowiedzialni kończą niżej niż na starcie |
| Brak przepływu | Stała gospodarka; trwale niski, lecz stały poziom płac; gabinet bez członków i podpisanego wsparcia | Zero pp |
| Mała pula | Odpowiedzialni: 0,1 pp z `r=1` i 0,1 pp z `r=0,5`; zmiana −10 | Przepływ 0,15 pp; żaden udział ujemny; suma 100 |
| Bez podwójnego liczenia | Wypłata osłony; przejście do bezrobocia; inflacja przy stałych płacach realnych | Wskaźnik zmienia tylko człon bezrobocia lub płac; brak osobnego członu inflacji |
| Kolejność M09 | Przepływ 5.6 i odpływ 17.4 w jednym miesiącu; zapis i wczytanie | Najpierw 5.6, potem 17.4; wczytanie nie powtarza przepływu |
| Stare reguły poparcia | Aktywny 5.6 oraz niemiecka erozja `pro_republic`, dryfy 1929–1932 i scena wysokiej inflacji | Żaden odziedziczony zapis nie zmienia polskich preferencji |
| Autorytet z dziennika | Odpowiedź „Poprzeć krytykę” w miesiącu t; rozliczenia do t+12; zapis i wczytanie | 53 w miesiącach t…t+11, 55 od t+12; jeden wpis na ID wystąpienia |
| Bez bezpośredniego zapisu | Karta lub wydarzenie zmienia `parliament_authority` wprost | Błąd walidacji; zmiana tylko przez wpis dziennika |
| Demokracja w zwykłym Sejmie | Autorytet 55, niezadowolenie poniżej 50, brak zdarzeń | +0,06 punktu miesięcznie (dawniej +0,15) |
| Zdarzenia demokracji | Nowa sprawa przemocy antykonstytucyjnej; uchylenie bezprawnej restrykcji; odpowiedź B4 | −2 raz na ID sprawy; +1 raz na `restriction_id`; B4 tylko własne +2 |
| Demokracja w presji | Demokracja 70 / 60 / 50 na początku okresu | Składnik presji −0,1 / 0 / +0,1 punktu; najwyżej ±0,5 |
| Mandaty | Remis reszt, małe listy, wspólna lista | Całkowite 444 i deterministyczne rozstrzygnięcie remisu |
| Rozłam E3 | Lewica: siła 15, sprzeciw 65, 5 posłów; manifest do KPP | Odchodzi 6%; poparcie PPS ×0,94; 2 posłów; sprzeciw 45; siły 53,2 / 9,6 / 37,2 |
| Zamrożeni posłowie | Akcja doradcy zmienia siłę frakcji przed rozłamem albo po nim | Ten sam przydział i ta sama liczba odchodzących posłów |
| Rozłam i czystka | Czystka Lewicy po jej rozłamie | Działa na stanie po rozłamie; nikt nie odchodzi dwa razy |
| Zamrożony wynik | Sondaż, rozłam i zmiana gabinetu po wyborach | Historia wyborów niezmieniona; transfery zmieniają tylko aktualne kluby |
| Zwykła większość | Quorum spełnione; 90 za, 89 przeciw, 30 wstrzymanych | Przyjęcie według zwykłej większości; bez wymogu 223 za |
| Szczególna większość | Rozwiązanie: 222 obecnych, 147/148 za | Pierwsze nie przechodzi, drugie przechodzi przy przyjętej definicji mianownika |
| Senat | 66/67 głosów przy wymaganiu 3/5 ze 111 | Pierwsze nie wystarcza, drugie wystarcza |
| Oferta | Relacja 100, naruszona twarda czerwona linia | Odmowa; kasa i leverage nie omijają warunku |
| Umowa | Naruszenie, ostrzeżenie, ultimatum, zapłata | Jedna instancja konfliktu; usunięcie przyczyny znosi niewykonane ultimatum |
| Groźba przyjęta | `bargain` z oceną 65 dzięki potrzebie; cztery partie przyjmują | Ustępstwo zapisane; relacja każdej z nich z PPS −3, raz na ofertę |
| Groźba odrzucona | `bargain` odrzucony; wybór spełnić albo cofnąć się | Spełnić: skutki `withdraw` bez kosztu T. Cofnąć: wiarygodność −5, `pps_threat_discounted=true` |
| Groźba po cofnięciu | Kolejne `bargain` wobec tego samego gabinetu; nowy gabinet | `need=0` jak przy perswazji; nowy gabinet zaczyna bez zniżki |
| Perswazja | Sukces i odmowa | Relacja i wiarygodność bez zmian; po odmowie poparcie zostaje |
| Rząd bez potrzeby PPS | `need=0`, ta sama baza 62 | Obie opcje przechodzą; targowanie kosztuje relację, perswazja nie |
| Utrata partnera | Wyjście z koalicji bez skutecznej dymisji | Brak automatycznych wyborów; ponowne przeliczenie realnych głosów |
| Niedobór budżetu | B = −2 / −2,01 / −5 / −5,01 | Wykonanie odpowiednio 1 / 0,5 / 0,5 / 0; brak drugiego potrącenia i automatycznej poprawy przez niewykonanie |
| Budżet bez kumulacji | Baza 2, budowa 2 przez 3 M, utrzymanie 1 | Odczyty 0/0/0, potem +1 przy stałej gospodarce, bez księgi rezerwacji |
| Efekt projektu | Ustawa, legalny wykonawca, brak ministra PPS, budżet −3 | Wykonanie 0,5; wyjście PPS nie zmienia tego samo. Ustępujący gabinet wykonuje bieżące świadczenia |
| Zatrudnienie | Te same 2 jednostki robót przez 6 M | Stały bezpośredni zasób 0,5 pp miejsc pracy; nie kolejne −0,5 pp co miesiąc |
| Kapitał | Presja 60, wcześniej quiet, nowe ostrzeżenie | Najpierw warning; active dopiero po pełnym miesiącu ostrzeżenia przy presji nadal ≥60 |
| AS | 499/500 członków, z militaryzacją i bez niej | AS dostępna od 500 po militaryzacji, przy kasie, legalności i utrzymaniu; sam próg nie wykonuje reorganizacji |
| Posłuch AS | Nastawienie 50 / 20 / 100; te same osoby i sprawność | Posłuch 0,835→0,985 / 0,715→0,865 / 1→1; siła ×1,18 / ×1,21 / ×1 |
| Jedna akcja Milicji | Dwie równoczesne sprawy przy 8 F | Milicja 40% / 0%; AS 40% / 40% |
| Mała AS i czwarta sprawa | AS 3 F przy dwóch sprawach; AS 14 F przy czterech | 30% / 0%; 4 / 4 / 6 / 0 F |
| AS w zamachu | Obrona rządu: Milicja 4 F i AS z tymi samymi ludźmi, demokracja 60 | Jedno zadanie; F9 w 6,2% i 30,4% prób |
| Podwójny przydział | Ci sami ludzie zgłoszeni do ochrony i walki | Odrzucenie ponad dostępną liczbę; brak mnożenia siły |
| Kolej | Uczestnictwo 39/40 przy koordynacji 50 | Próg opóźnienia osiągnięty dopiero w drugim przypadku |
| Zgoda na ugodę | Połowa żądań, zaufanie 50: pełny fundusz; pusty fundusz; pełny fundusz i zmęczenie 50 | 40, odmowa; 60, zgoda; 50, zgoda |
| Zgoda a fundusz | Ten sam przypadek przy rosnącym pokryciu funduszu | Zgoda nie rośnie; `crediblePressure` rośnie |
| Pełna oferta i czerwona linia | Spełnione wszystkie żądania; naruszona czerwona linia | Zawsze zgoda; zawsze odmowa |
| Kruchość gabinetu | 232 / 279 / 200 posłów; 232 przy napięciu 60; gabinet pełniący obowiązki | 40 / 0 / 72; 70; 100; autorytet Sejmu bez wpływu |
| Zamach | Identyczne siły; różne ostatnie zobowiązania PPS | Wynik obliczony po zobowiązaniach; może się zmienić, lecz nie musi |
| Zero sił | Obie strony F=0 | Brak NaN, dzielenia przez zero i zmyślonej militarnej przewagi |
| Gotowość wojska | Demokracja 60 / 75 / 45 / 100 | Lojalności v2 bez zmian / Piłsudski −3,75 pp do neutralnej / +3,75 pp z neutralnej / −10 pp (limit); suma 1 |
| Zdolność a demokracja | Demokracja 0–100 w profilu syntetycznym | Zdolność co najmniej 30; bramka zdolności nie zmienia terminów M02 |
| Losowanie po F5 | Zmiana demokracji po zapisanym rzucie; zapis i wczytanie | Ten sam rzut i strona; przesunięcie z chwili ogłoszenia próby |
| Wczytanie zamachu | Zapis po wyborze strony i jednej rundzie | Te same strony, straty i rzuty; tylko następna nierozstrzygnięta faza |
| Szybkie zwycięstwo | Przewaga ≥2 po 1. rundzie; przewaga 1,3 w rundach 1–2 bez posiłków przeciwnika w następnej rundzie | Koniec odpowiednio po 1. i po 2. rundzie, bez czekania na rundę 3 |
| Nadchodząca rezerwa | Przewaga po 2. rundzie, rezerwa przeciwnika przybywa w 3. rundzie; ta sama rezerwa opóźniona koleją | Brak zwycięstwa po 2. rundzie; przy opóźnieniu zwycięstwo po 2. rundzie |
| Pomiar strajku | Udział 80 w rundzie 1, fundusz wyczerpany przed rundą przed przybyciem rezerwy | Brak opóźnienia; blokadę rozstrzyga runda poprzedzająca przybycie |
| Istotny udział | Milicja 1 F przy stronie 45 F; 6 F przy 45 F; strajk opóźniający transport; neutralna ochrona | F9 odpowiednio niedostępne / dostępne / dostępne / niedostępne |
| Ugoda w rundzie 1 | Obie strony oceniają ofertę ≥60 przed pierwszą walką | Brak ugody; ocena od rundy 2 |
| Przewaga nie negocjuje | Strona z przewagą 1,25 w bieżącej rundzie; ta sama sytuacja w ocenie końcowej | Brak zgody w rundach 2–4; zwykła ocena po 4. rundzie |
| Odrzucone F9 | Istotny udział, obie strony gotowe, PPS odrzuca | Brak ugody do końca próby, także w ocenie końcowej; reputacja bez zmian |
| Brak zwycięzcy | Pat po 4 rundach, demokracja 30, brak oferty ≥60 | `prolonged_conflict`, raport przekazania i koniec rozdziału |
| Wkład kontrfaktyczny | Te same rzuty z PPS i bez PPS; zapis i wczytanie | Jedna klasa wkładu; ustępstwa tylko przy `decisive` i zapisanych warunkach |
| Kryzys i przerwa | Presja 56, potem zaczyna działać ugoda chroniąca; później presja ≥65 | `political_crisis` → `dormant`, `next_attempt_available_at=t+3`; brak próby przed tą datą |
| Przegląd ugody chroniącej | Umowa wykonywana 6 M; przedłużenie przyjęte albo odrzucone | Przedłużenie bez nowej ulgi albo wygaśnięcie bez +8 |
| Granica | Wynik 1922 / samo rozwiązanie / następny legalny wynik | Odpowiednio: gra trwa / trwa do zdarzenia kończącego / raport |
| Data | Proponowane ogłoszenie 1927-11-29 | Najwcześniejszy dzień +78 to 1928-02-15; wybrana niedziela 1928-02-19 |
| Raport | Wielokrotne otwarcie zakończonego rozdziału | Brak nowych miesięcy, strat, kosztów i podwójnego raportu |
| Izolacja Polski | Aktywny nowy model gospodarki i zamachu | Żaden stary niemiecki zapis nie zmienia ich wyniku |
| Skład porozumienia | Wspólna lista PPS–NPR, potem oferta centrum i poparcie mniejszości | NPR ma własny klub; brak automatycznej koalicji; mniejszości wspierają zewnętrznie i nie dostają resortu |
| Wykonalność jedności narodowej | Wysokie relacje, lecz brak kryzysu albo twarda sprzeczność programu | Oferta zablokowana; żaden koszt R nie omija warunku |
| Premier ekspercki | Brak formalnych członków partyjnych, istnieją gwaranci tolerancji | Ranking czyta podpisane wsparcie; brak średniej pustej listy i fikcyjnej inwestytury |
| Marszałek i prezydent | Daszyński wygrywa oba urzędy w kolejności | Urzędy rozdzielone, następca marszałka wybrany, brak 445. mandatu |
| Trzy reformy | Tylko konstruktywne wotum=true | Brak arbitrażu prezydenckiego i skargi z nowego pakietu gwarancji; każda reforma ma osobny akt |
| Czasowy dochód | Podatek majątkowy od t przez 6 M; wczytanie zapisu | +2 B tylko dla t..t+5, bez odnowienia terminu lub nagrody |
| Pożyczka inwestycyjna | Jedna decyzja w t; ponowne otwarcie | +3 B t..t+5, −1 B t+6..t+17, potem 0. Nowa pożyczka zablokowana do końca obsługi; program można zamknąć bez kasowania kosztu |
| Parcelacja i komasacja | Oba projekty dla tej samej transzy, potem powtórzenie komasacji | Dwa odmienne wykonane efekty dopuszczalne; trzecia nagroda za ten sam zakres komasacji zablokowana |
| Remont Oświaty | Trwający mały remont Wawelu, potem rozszerzenie tego projektu | Jedno rozliczenie kosztów pozostałego zakresu i jedna premia na końcu; ukończonego remontu nie uruchamiamy ponownie dla nagrody |
| TUR | Opłacona jedna z dwóch rat czasu, potem brak utrzymania | Nieukończony kurs nie daje premii; po wykonaniu premia jednej komórki zużywa się raz |
| Komuniści | Jeden strajk otwarty trzy razy; potem drugi rzeczywisty strajk | Pierwszy daje najwyżej jedną próbę; dwie różne udane próby, w tym pełna, dopiero otwierają dalsze przygotowanie |
| Ustępstwo Piłsudskiemu | Powrót wojskowy → renegocjacja inspektoratu w tym samym kryzysie | Brak zsumowania wszystkich ulg presji; wyłącznie rzeczywiście wykonane, niepowtórzone nominacje |
| Kraków | Wypłata żądanej podwyżki, brak decyzji o cofnięciu represji | Spełniona jedna klauzula, pozostałe nadal otwarte; brak automatycznej dymisji gabinetu |
| Mobilizacja i kult | Prezydent żyje albo brak konkretnej uroczystości kultu | Odpowiednia scena nie występuje; zwykłe nabożeństwo nie jest wyzwalaczem |
| Sceny wycofane B | Harmonogram zawiera dawną sprawę Żyrardowa, konfiskaty, ziemi/języka albo odmowy przedsiębiorców | Brak usuniętego menu i jego nagród; zwykłe polityki i rzeczywiste konsekwencje działają nadal |
| Karty rządowe bez pustych opcji | Karty Świadczenia, Stabilizacja, Przemysł, Sprawiedliwość, Wojsko i Wawel | Brak opcji utrzymania, odłożenia i pozostawienia właścicielom; zamknięcie bez kosztu (0.37) |
| Układ zbiorowy i odstępstwo | Układ w jednej branży; odstępstwo w zagrożonym zakładzie | Układ: 0 B, skutek płacowy przez 11.4, bez oporu kapitału; odstępstwo: 0 B, presja kapitału −4, niezadowolenie objętych +3, wygasa w terminie (0.37) |
| Rozszerzyć i skupić osłony | Osłona 2 B; rozszerzenie do zasięgu 2; osobno skupienie | Rozszerzenie: 4 B, ulga także dla nowych odbiorców; skupienie: 1 B, pełna ulga dla połowy odbiorców (0.37) |
| Pobór w karcie finansowej | Usprawnienie poboru dwa razy w rozdziale | Za pierwszym razem 1 T, 1 B przez 2 M, potem +1 B trwale; drugi raz zablokowany (0.37) |
| Szerokie grupy i emisja | Opcja „obciążyć szerokie grupy” w trzech wariantach; „finansowanie z emisji” przed i po stabilizacji | Koszty i skutki z 11.9; przed stabilizacją limit emisji, po stabilizacji bilon 1 punkt przez 3 M (0.37) |
| Warianty funduszu inwestycyjnego | Ten sam projekt: fundusz publiczny, banki przy kredycie 39 i 40, spółdzielnie | Publiczny: 2 B budowy; banki: blokada przy 39, przy 40 budowa 1 B i presja kapitału −8; spółdzielczy: 2 B, kredyt dla gospodarstw i małych zakładów (0.37) |
| Ratunek zakładu | Warunkowy kredyt ogólny albo dla wskazanego zakładu | Ogólny: +5 do celu kredytu; ratunek: przywrócenie utraconej zdolności zakładu, 2 B przez 2 M, potem 1 B (0.37) |
| Śledztwo i adresat polemiki | Śledztwo potwierdza sprawcę przemocy; potem linia `unconstitutional_force` | 1 T, 1 B przez 1 M; sprawa przypisana partii, która staje się adresatem kampanii polemicznej (0.37) |
| Szkoła świecka bez reakcji frakcji | Wariant konfrontacyjny sprzeczny z umową z NPR | Naruszenie umowy z NPR; brak reakcji frakcji PPS (0.37) |
| Jedna karta E3 | Lewica ze sprzeciwem 65: zamknięta sprawa A, potem nowa sprawa B z nowym żądaniem | Jedna definicja `party.faction_split`; sprawa A nie wraca, B otwiera instancję z własnym `case_id` (0.38) |
| Klucz sprawy E6 | Strajk S, ugoda U1 odrzucona przez część uczestników; zapis i wczytanie; potem nowa ugoda U2 | Jedna `society.strike_settlement_rejection` dla S + U1, bez drugiej po wczytaniu; U2 może otworzyć nową (0.38) |
| Obowiązkowa odpowiedź B2 | Wystąpienie w miesiącu t; próba przejścia do zwykłej akcji bez odpowiedzi | Zablokowane do wyboru jednej z trzech odpowiedzi w t; brak opcji „milczeć”; 0 T (0.38) |
| Sprzeczność odpowiedzi B2 | `form_of_power=parliamentarism` i „Poprzeć krytykę”; osobno `pils_influence=support` i „Bronić parlamentu”; osobno `workers_councils` i „Poprzeć krytykę” | Pierwszy przypadek: ostrzeżenie i Centrum +8 (5 + 3). Drugi i trzeci: bez ostrzeżenia, tylko skutki samej odpowiedzi (0.38) |
| Oszczędności 1926 przez 9.8 | Przegląd Skrzyńskiego w 6. miesiącu przy osłonie 2 B | Cztery odpowiedzi 9.8; brak osobnych opcji „nowe finansowanie”, „mniejszy zakres” i „naruszenie”; przy utrzymaniu poparcia cięcie 2 → 1 B przechodzi, jeśli ma poparcie (0.38) |
| Kolejność kategorii wydarzeń | W jednym miesiącu należne: krytyka parlamentu, odmowa ugody E6 i przegląd oszczędności 1926 | Kolejność: E6 (1), przegląd (4), krytyka parlamentu (6); wszystkie przed następną zwykłą akcją (0.39) |
| Resorty docelowe | Nowa oferta gabinetowa i lista kompetencji | Dokładnie 9 unikalnych portfeli; brak `public_works` jako urzędu, brak drugiego `labor`; program robót nadal istnieje |
| Roboty pod Pracą | PPS ma Pracę i finansowanie / tylko Skarb / brak finansowania | Wykonanie odpowiednio możliwe / wymaga wykonawcy Pracy / zablokowane; nie potrzeba dawnego resortu Komunikacji |
| Katalog rządowy | Pula, agenda i wyzwalacze | 16 rodzin; bez dodatkowych menu B10/B20; MSZ bez kart, kryzys kredytowy kieruje do właściwej polityki |
| Wariant robót | Zatrudnienie / infrastruktura / mieszkania | Odpowiednie czasy i odbiorcy; mieszkania nie otrzymują dodatkowych 2 jednostek zatrudnienia; zamknięcie nie usuwa zbudowanego obiektu |
| Wykonanie i limit robót | 2 jednostki zatrudnieniowe i 2 infrastrukturalne, globalne wykonanie 0,5 | 2 jednostki pracy i 0,40 pp produkcji; wspólny limit 8 skaluje raz oba wkłady |
| Stabilizacja i finanse | Ta sama pożyczka z karty 3 wskazana w karcie 4 | Jeden rekord; zmiana reżimu nie resetuje płac ani obsługi pożyczki; zamyka tylko dozwolone dla marki finansowanie i szoki |
| Szkoły | Dostęp wiejski, potem język tego samego zakresu | Odrębne właściwości jednego projektu lub jawne koszty nowego zakresu; bez podwójnej premii i bez wzrostu TUR |
| Państwo a PPS w strajku | Trzy warianty B8+B10 przy Pracy / MSW / braku resortów | Jeden cel i jedna reakcja władz w jej właściwym zakresie; Praca nie wydaje rozkazów policji; brak drugiego menu B10 |
| Konflikt kapitału | Reforma zwiększa sprzeciw, potem stan active ogranicza inwestycje | Skutki 11.7 występują raz, bez karty B20; korekta programu i finansowanie mają zwykły koszt |
| Starszy gabinet | Inni właściciele Pracy i Robót w dawnym zapisie | Brak cichego scalenia i dublowania urzędu; wymagany wersjonowany plan migracji |
| Manifest parlamentu | Otwarcie puli, agendy i wydarzeń | 10 rodzin z 17.10; bez karty wcześniejszych wyborów i Żyrardowa; wspólna odpowiedź B11+B12 |
| Gabinet po wyborach | Wysokie relacje, normalne otwarcie po 1922, brak kryzysu | Szerokie i stabilizacyjne warianty wyszarzone; lewica zależy od rzeczywistych możliwości poparcia |
| Poparcie mniejszości | Włączenie prośby, zgoda jednego segmentu, odmowa drugiego | Podgląd może odblokować rozmowy, ale powołanie wymaga wystarczających przyjętych deklaracji; bez darmowych głosów i resortów |
| Narastanie kryzysu | Ta sama dopuszczalna oferta kryzysowa przy rosnącym kryzysie | Premia 8.8 rośnie do limitu, nie omija czerwonych linii; po opanowaniu kryzysu przyjęty gabinet nie znika |
| Wspólna karta gabinetowa | Grabski, osłony, udział PPS i resorty | Jedna sekwencja i jeden koszt inicjatywy; brak dodatkowego priorytetu lub karty Grabskiego |
| Utrzymanie poparcia tylko w kryzysie | Karta Stosunek do rządu bez kryzysu; potem ultimatum partnera | Bez opcji „utrzymać”, zamknięcie bez kosztu; przy ultimatum odpowiedź „utrzymać” za 0 T (0.36) |
| Kontrola wojska bez pustych opcji | Karta kontroli wojska przy przygotowanym projekcie | Dwie opcje: pełny nadzór i ograniczona reforma; zamknięcie bez kosztu (0.36) |
| Ograniczona reforma wojska | Ta sama grupa: pełny nadzór albo ograniczona reforma | Lojalność legalna +0,05 albo +0,025; obciążenie 1 B przez 3 M albo 2 M; w ofercie `army` +2 albo 0 (0.36) |
| Opcje karty Budżet | Pakiet z cięciem świadczeń; warianty „chronić”, „majątek”, „pożyczka” przy kredycie 39 i 40 | „Chronić”: pakiet bez cięcia; „majątek”: podatek progresywny albo majątkowy; „pożyczka”: blokada przy 39, oferta przy 40 (0.36) |
| Kompromis listowy a Lewica | Pierwsza lista `centrolew_early`; osobno lista `labour` | Lewica +3 tylko przy Centrolewie; przy liście z NPR bez reakcji (0.36) |
| Impas | Trzy nieudane propozycje powołania; potem nowy kandydat | Stan `impasse`, gabinet pełniący obowiązki, kruchość 100 w rokowaniach; z nowym kandydatem obowiązkowe formowanie (0.36) |
| Karty 3–5 bez odnowienia | Odrzucona oferta budżetowa, w następnym miesiącu ta sama oferta, potem zmieniona | Ta sama oferta niedostępna; zmieniona dostępna za 1 T (0.36) |
| Budżet | Koalicjant / faktyczny gwarant eksperta / opozycja po pojedynczym głosie za ustawą | Dostęp odpowiednio tak / tak / nie przy aktywnym pakiecie; prawo do zwykłego głosu budżetowego pozostaje |
| Poparcie gabinetu | Odmowa ustępstw, późniejsze wycofanie i wotum | Jedna oferta i wynik, bez kontrpropozycji C2; C7 przyjęcie/odrzucenie odwołania, rzeczywiste głosy decydują |
| Legalny kalendarz bez C8 | Upadek rządu; brak aktu rozwiązania / wcześniej legalnie zarządzone wybory | Brak sceny wcześniejszych wyborów w obu przypadkach; w pierwszym normalna kadencja, w drugim zachowany termin i koniec rozdziału po wyniku |
| Pula ustępstw wojskowych | PPS w opozycji, tolerowaniu, z właściwym uprawnieniem rządowym | Brak zwykłej karty ustępstw w pierwszych dwóch; dostęp w trzecim. Parlament nadal proceduje wymagane ustawy |
| Strajk i Sejm | Te same organizacje i fundusz, trzy parlamentarne odpowiedzi, ponowne otwarcie | Odczyt wcześniejszych wyborów; żadnego ponownego doboru partnera, drugiego strajku lub podwójnej kary za wycofanie |
| Program gospodarczy | Trzy priorytety, próba dodania czwartego i ponowne wejście | Limit 3; jeden T; brak wykonanej reformy lub premii za powtórzenie |
| Bez płatnego braku wyboru | Karta Organizacje zamknięta bez wyboru; karta Składki z obecnym poziomem | Zamknięcie bez kosztu T i bez odnowienia; obecny poziom składek zablokowany z powodem (0.34) |
| Militaryzacja a frakcje | Pierwsza i druga militaryzacja Milicji | Centrum +3 sprzeciwu tylko przy pierwszej; Lewica bez zmian (0.34) |
| Praca organizacyjna w komórkach | Praca w komórkach chłopów przy linii `workers_peasants`; próba wyboru prasy | `base_reach_pps` chłopów +2,2 (mnożnik 1,10); prasa niedostępna (0.34) |
| Media bez odnowienia karty | Dwie kampanie na ten sam temat w kolejnych miesiącach | Obie dostępne; druga z mniejszym zyskiem według nasycenia 5.3 (0.34) |
| Dwie organizacje | Prasa + TUR przy 2/3 R, duplikat tej samej organizacji | Przy 2 R brak częściowego zakupu; przy 3 R jeden T i dwa różne procesy; duplikat odrzucony |
| Podmenu i doradcy | Rekrutacja z organizacji, potem karta Milicji | To samo odnowienie; brak drugiej bezpłatnej rekrutacji lub podwójnego T |
| Demokracja zależna od sytuacji | Ten sam kierunek przed zagrożeniem i podczas kryzysu 1922 | Brak stałej premii do demokracji; kontekstowe znaczenie kampanii i wcześniej wykonanej pracy |
| Dwie decyzje Piłsudskiego | Warunkowe poparcie, potem obrona parlamentu w odpowiedzi na wystąpienie | Odrębne zapisy; brak automatycznej zmiany wojska, ustroju lub trwałej linii |
| Trzy ustroje | Wybór silniejszego prezydenta albo rad | Nie ustawia wykonanej reformy; prezydent nie staje się Piłsudskim, rady nie tworzą nowego rządu |
| Cztery stanowiska autonomii | Federacja i szeroka współpraca żydowska | Dwie różne karty; w elektoracie nadal tylko dwie kategorie mniejszości; brak automatycznych praw i dodatkowej populacji |
| Czystka | Frakcja 20, dissent 60, PPS 10%, indeks członkostwa 100 | Przy spełnionej bramce: siła ok. 15,79; dissent 45; PPS 9,5%; indeks 95; transfery posłów bez niszczenia mandatów |
| Składki | Podwyżka przy płacach 89/91, bezrobocie 3 | Indeks mnożony odpowiednio przez 0,95/0,98; przychód dopiero w miesięcznej księdze |
| Współpraca i eskalacja | Pełna współpraca przy ograniczonym żądaniu, partner dotrzymuje końca | Dodatkowy uzgodniony nacisk; brak automatycznej przemocy lub radykalnego żądania |
| ZSRR | Stanowisko sympatyzujące bez wykonanych prób | Zmiana relacji i dissentu, brak koalicji, pieniędzy z Moskwy i zmiany ustroju |
| Potępienie modelu sowieckiego | Zmiana z `sympathetic` na `critical` | Relacja z KPP −5; brak reakcji frakcji (0.33) |
| Adresat polemiki | Linia `capital_land` przy profilach 8.6; linia `unconstitutional_force` bez sprawy przemocy | Adresaci PSChD i ZLN; w drugim przypadku kampania polemiczna zablokowana z powodem „brak adresata” (0.33) |
| Ustępstwa a linia | Karta 16.7 przy liniach `support`, `conditional`, `oppose_military_interference` | Wszystkie ustępstwa; inspektorat tylko z zapisem o odpowiedzialności przed Sejmem; inspektorat zablokowany (0.33) |
| Arbitraż i linia | Przygotowanie `presidential_arbitration` przy `parliamentarism`, potem przy `strong_presidency` i późniejszej zmianie linii | Najpierw blokada z powodem, potem przygotowanie; zmiana linii nie kasuje projektu (0.33) |
| Zasięg i charakter partii | Rozbudowa branży kolejowej przy `workers`; akcja Ziemięckiego przy `broad_democratic`; dystrybucja prasy przy dowolnej linii | Mnożnik ×1,10 w obu pierwszych przypadkach, łącznie z TUR najwyżej 1,30; prasa bez mnożnika (0.33) |
| Oś autonomii | Oferta z prawami kulturalnymi (0) i oferta z autonomią wojewódzką (+1) wobec ZLN i reprezentacji pozostałych mniejszości | Odległość od ideału: ZLN 2, mniejszości 1; przy autonomii ZLN blokuje czerwona linia, mniejszości 0 (0.33) |
| Bund | Lista partii, relacje, listy wyborcze i Sejm; wykonana wspólna akcja pracownicza | Bund nie występuje jako partia; zaufanie startuje od 50 i zmienia się tylko po wykonanej akcji (0.33) |
| B1/B2 | Kryzys gabinetowy i odpowiedź reformistyczna | Trzy wybory B1; B2 nie tworzy projektu, nie odblokowuje wariantu i nie daje głosów |
| B3/B4 | Zagrożenie, następnie rzeczywista śmierć albo jej brak | Brak menu B3; tylko potwierdzona śmierć uruchamia trzy odpowiedzi B4, po obsłudze wakancji |
| Msza B5 | Zgoda / odmowa gospodarza; ponowne wejście | Trzy odpowiedzi; odmowa bez premii/kosztu niewykonanej mszy; wykonanie raz, bez automatycznego sojuszu chadeckiego |
| B8+B10 i B11+B12 | Jedna sprawa z udziałem komunistów, ofertą i represją | Po trzy odpowiedzi w dwóch różnych fazach, B9 osobno; brak drugiego menu policji i podwójnego przyjęcia ugody |
| Tolerowanie B14 | Aparat 1/2, zasięg 39/40, relacja 39/40; brak kontaktu lub pieniędzy | Warunki otwierają tylko rozmowę; akceptacja wymaga 8.3, finansowania i wykonawcy; brak poparcia bez umowy |
| Kredyt B16 | Tylko Praca / tylko Skarb / opozycja bez upoważnienia | Właściwe interwencje dostępne, pozostałe zablokowane; w trzecim brak menu interwencji; nie powstaje gotowy projekt |
| Sowiecki model B13 | Zwykły dobór partii, próba wyboru obecnego stanowiska, aktywne odnowienie | 1 T, cd 12 M; trzy stanowiska; obecne stanowisko zablokowane z powodem; brak bezpłatnej reakcji wydarzenia i ponownej premii |
| Obecna linia | Karta stanowiska z obecną linią; próba jej wyboru, potem zamknięcie karty | Opcja zablokowana z powodem „obecna linia”; zamknięcie bez kosztu T i bez odnowienia; karta zostaje w ręce (0.32) |
| Profil frakcji v1 | `pils_influence` z `conditional` na `support`; w osobnym przebiegu na `oppose_military_interference` | Centrum +3, a w drugim przebiegu Piłsudczycy +3 sprzeciwu; Lewica bez zmian; relacja z Piłsudskim +4 albo −4 (0.32) |
| B18/B19/B21 | Negocjacja szerokiego gabinetu, naruszenie umowy, powrót Chjeno-Piasta | Zwykłe istniejące menu; bez dodatkowych kart powołania i przygotowania zamachu; presja raz |
| C1 | Edycja gabinetu, trybu, programu, mniejszości i resortów | Jeden ekran, jeden commit i koszt, następnie wynik; bez drugiego menu udziału PPS |
| C2/C3 | Odmowa partnera, sojusz z niezgodnym programem, wczytanie | Brak kontrpropozycji i menu warunków listy; jedna ocena, odmowa zachowuje dotychczasową listę |
| C4 | Sporna ustawa i poprawki Senatu | Automatyczne głosy według programu/umów i prawa; bez dodatkowej sceny politycznej, brak większości nie oznacza przyjęcia |
| C5–C7 | Wybór marszałka/prezydenta; wotum z następcą i bez niego | Zatwierdzone menu i końcowe wyniki; po reformie brak następcy blokuje konstruktywne wotum |
| C8/C9 | Upadek gabinetu lub śmierć prezydenta | Brak dodatkowych ekranów; kalendarz legalnych wyborów zachowany, zastępca zapisany przed C6/B4 |

Test progu powinien obejmować wartość tuż poniżej, dokładnie na progu i tuż powyżej, a także brak danych. Liczby zmiennoprzecinkowe porównuje się z ustaloną tolerancją; mandaty, daty, identyfikatory i koszty w najmniejszej jednostce — dokładnie.

### 21.2. Pełne kampanie i zachowania trudne do zbalansowania

Po wdrożeniu należy uruchomić z tymi samymi zestawami ziaren co najmniej: bierne otwarcie, aktywną kampanię wyborczą, stałą opozycję, formalną koalicję, stabilizację z osłonami, aktywne zatrudnienie, budowę masowych organizacji, przygotowaną mediację i obronę konstytucyjną. Porównanie różnych strategii musi używać tego samego scenariusza wyjściowego.

Najpierw sprawdzać wykonalność: czy można zebrać zasoby na AS, wykonać program przed terminem, przeprowadzić legalne wcześniejsze wybory i dojść do obu rodzajów raportu. Następnie sprawdzać proporcje: czy jedna akcja nie dominuje stale wszystkich innych, czy zewnętrzne poparcie ma realną wartość, czy gospodarka reaguje na finansowanie, a organizacje mają koszt utrzymania możliwy do udźwignięcia.

Szczególne ryzyka `balance_v0_1`:

- Bazowa przestrzeń, koszty programów i impulsy scenariusza mogą prowadzić do zbyt szybkiego kryzysu albo samoczynnego wyjścia z niego. Kalibracja musi obejmować pełne 1922–1928, nie tylko jeden poprawny miesiąc.
- W 0.13 usunięto automatyczny skok płac po stabilizacji. Nadal kalibrować odbudowę +3, termin stabilizacji i rzeczywiste podwyżki; limit 100 dotyczy tylko samoczynnego powrotu.
- Przy jednej lub dwóch decyzjach reformy nadal konkurują o czas z partią i koalicją. Sprawdzić udział doradców, kursów TUR i projektu wykonywanego przez partnera.
- Wysoka autonomia związku bez narzędzi negocjacji mogłaby zamienić strategię w serię odmów. Każda odmowa musi mieć powód i możliwą zmianę warunków.
- Syntetyczne siły mogą przesądzać zamach przed wykorzystaniem organizacji. Sprawdzić scenariusze blisko granicy i zdecydowaną przewagę; PPS nie musi odwracać każdej przewagi, ale jej wkład musi być mierzalny.
- Automatyczne skumulowane nagrody za reformy mogą prowadzić do nieskończonego poparcia lub legitymizacji. Każdy jednorazowy skutek potrzebuje ID, a każdy stały — ograniczonej grupy odbiorców i kosztu.
- Przepływ 5.6 (M09) jest łagodny: na przebiegach M02 zmienia PPS o −0,1 do +0,6 pp w rozdziale. W prototypie sprawdzić, czy gospodarka jest odczuwalna przy pełnych kampaniach, czułość wskaźnika wsi oraz przypadki, w których chłopi przesuwają więcej niż drobnomieszczaństwo.

Nie ustalamy z góry, że każda strategia ma taką samą szansę powodzenia. Historyczną tendencję definiuje jeden profil Normalny 17.16, wymagający kalibracji. Przebiegi N-A/N-B/N-C są opisane, lecz nie można twierdzić, że tendencja została potwierdzona, zanim porównania pełnych symulacji zostaną wykonane.

### 21.2a. Kontrole rewizji gospodarczej 0.11

- Zgodność prognozy budżetu z rozliczeniem przy niezmienionych wejściach; brak mnożenia opłat B przez liczbę odświeżeń.
- Granice wykonania i powrót z pauzy; ustawa D bez PPS, także po zmianie gabinetu; jedna początkowa nagroda osłony.
- Mała reforma 1 akcja, duża 2; przygotowana agenda nie czeka na ponowne losowanie ani odnowienie pierwszego kroku. Roboty XI 1925 → III 1926; doradca XI → II 1926.
- Kurs TUR reformy daje całe przygotowanie i −1 M, nie zbędne +25; nadal kosztuje R i czas kursu.
- Pożyczka: daty przejścia do kosztu, brak duplikacji, brak usunięcia zobowiązania wraz z inwestycją. Nieużyty limit emisji nie podnosi cen.
- Stała inflacja i płace indeksowane do poprzedniej inflacji nie tworzą samoczynnego trwałego spadku siły nabywczej. Szok, stabilizacja i szok kredytu mają odmienne wyniki.
- Jedna reakcja kapitału: ostrzeżenie poprzedza opór; spadek poniżej 40 przez 2 M go wygasza; brak trzech sektorowych kar.

Przeliczenie izolowanych przypadków dokumentu nie zastępuje symulacji kampanii ani testów późniejszego kodu. Nowy profil stanu gospodarki nie ma wdrożonych zapisów do migracji. Gdy następca powstanie, starszy zapis niemieckiego `budget` lub eksperymentalnej księgi wymaga jawnego adaptera albo nowej kampanii; nie wolno interpretować 100 dawnych B jako 100 nowych punktów.

### 21.2c. Kontrole korekty 0.13

| Przypadek | Oczekiwany wynik |
|---|---|
| Kryzys kredytu, relacja ZLN 5 | Oferta ratunkowa możliwa do oceny; nie jest automatycznie przyjęta. W spokojnym otwarciu nadal blokuje ją brak kryzysu |
| Wykonana ugoda dla 80% zatrudnionych | Średnia ulga 3,2 raz, nie 4 dla całej populacji i nie co ratę |
| Żądanie dymisji przy niezadowoleniu 47 | Dostępny postulat w otwartym sporze; brak automatycznej mobilizacji ogólnej, zmiany głosów i dymisji |
| Szeroki gabinet w XI, pełna osłona i kryzys | Jeden przegląd w IV; przyjęty kompromis zachowuje osłonę; podpis cięć bez właściwej ustawy nie zmienia kosztu |
| PPS wychodzi, pozostali utrzymują premiera | Brak nowego gabinetu i brak +20; przy rzeczywistym przyjęciu następcy osobne głosowanie/procedura |
| Grabski, prognoza −3 po projekcie | Nowy podatek majątkowy może poprawić ją do −1; nie zastępuje brakującego wykonawcy i nie powiela aktywnego podatku |
| Przewaga po fazie 1, legalna rezerwa dostępna w 2 | Jeszcze brak wojskowego wyniku; faza 2 najpierw rozlicza jej przybycie albo blokadę kolei. W 0.20 spełnione przez doliczenie posiłków następnej rundy (16.8.4) |

Weryfikacja liczb i ograniczeń: `analysis/m02-revision-13/check.cjs`. Zgody w kontrolowanych przebiegach są wejściami; test nie dowodzi pełnej akceptacji wszystkich ofert według 8.3 w grze.

### 21.2b. Kontrole scenariusza Normalnego 0.12

| Przypadek | Oczekiwany rezultat / granica dowodu |
|---|---|
| Kolejne miesiące I 1922–II 1928 | Dokładnie jeden warunkowy przedział marki; zerowy kredyt przed VI 1925, +12 potem +6 i 0. Przedziały nie nakładają dwóch poziomów tej samej rodziny |
| Złoty przed X 1923 | Presja 120 nie uruchamia się; reforma nie usuwa późniejszej presji wiejskiej/kredytowej |
| `stabilizing` bez ukończenia | Nadal działa aktualny przedział marki; brak przedwczesnej nagrody za samo przygotowanie |
| Reforma waluty i kryzys 1925 równocześnie | Efekt konkretnego projektu i tło mogą się sumować; każdy ma jedno ID. Nie ma trzeciego szoku za samą datę |
| Brak PPS w rządzie | Wykonalny NPC przechodzi przez przygotowanie/wdrożenie, uzyskuje zgody i płaci B; bez zmiany R PPS i bez fikcyjnego prawa weta gracza |
| Zapis podczas odpowiedzi / nowy premier w tym samym t | Wznowienie tej samej transakcji, najwyżej jedna nowa inicjatywa gabinetu w miesiącu |
| PPS ma Pracę, NPC chce robót | NPC nie wykonuje dodatkowej akcji tego resortu za PPS. Inny kompetentny minister może przedstawić finansowanie, lecz nie uruchamia za gracza robót |
| Płace 79/79/80 oraz 79/79/79 | Pierwsza seria nie spełnia progu trzech miesięcy; druga otwiera żądanie, bez automatycznego strajku ani natychmiastowego +8 |
| Odrzucone żądanie / wykonana ugoda | +8 raz w określonych komórkach albo brak eskalacji; militaryzacja +10 wyłącznie rzeczywistym adresatom, agregacja nie powiela ludzi |
| Zbliża się historyczna data następcy | Aktywny wykonalny gabinet pozostaje. Potrzebny rzeczywisty akt ustąpienia lub głosowanie |
| PPS odchodzi, pozostali zapewniają dalsze poparcie | Rząd może przetrwać, obowiązujące programy nadal mają wykonawcę |
| II 1926 przy presji 100 i zdolności 100 | Brak próby w scenariuszu Normalnym przed datą sposobności; od III same te liczby nie zastępują dostępności operacyjnej ani pozostałych bramek |
| Brak zamachu do połowy 1926 | Szoki słabną, następnie poprawia się tło produkcji; bez automatycznego BBWR, resetu długoterminowych kosztów czy raportu zwycięstwa |
| Wybory wcześniejsze / 19 II 1928 | Po legalnym wyniku raport; manifest nie dopisuje późniejszych szoków i nie otwiera nowego gabinetu po zakończeniu |
| Pełne N-A/N-B/N-C | Wspólne scenariusze i ziarna, prawdziwe koszty każdej akcji; porównać zdolność zapobieżenia kryzysom, nie narzucić oczekiwanej kolejności premierów |

Powyższa tabela to kryteria przyszłych testów. Kontrola dokumentów lub przeliczenie pojedynczego kanału nie potwierdza pełnych przebiegów, poprawności bieżącego silnika ani finalnego balansu.

**K — etap 8 (0.49):** pełne kampanie 13 strategii na 12 ziarnach, wyniki i przypisanie kontroli 21.2, 21.2a–c do testów: [`analysis/stage8-campaigns/REPORT.md`](../analysis/stage8-campaigns/REPORT.md). Niespełniona kontrola wykonalności: legalne wcześniejsze wybory (rozwiązanie z 7.6 nie jest wdrożone).

### 21.3. Obowiązki przy implementacji

Po zmianie źródeł lub zasobów wykonać `npm run build`, potwierdzić D3 i wymagane obrazy w `out/html/`, uruchomić `npm test` oraz odpowiedni test przeglądarkowy. Istnieją testy `tests/sejm-election.test.js`, `tests/polish-opening-state.test.js`, `tests/polish-party-system.test.js`, `tests/polish-presidential-sequence.test.js` i `tests/sejm-browser-smoke.cjs`; pokrywają obecne wycinki, nie nowe reguły tego dokumentu.

Samo poprawne kompilowanie Dendry nie sprawdza poprawności finansów, legalności głosowania ani momentu rozstrzygnięcia zamachu. Dokumentacja zmieniona bez źródeł wymaga kontroli odnośników, spójności kontraktów i przykładów liczbowych; nie wymaga przebudowy niezmienionej gry.

## 22. Granice pewności, źródła i następne decyzje

### 22.1. Co jest rozstrzygnięte, a co pozostaje propozycją

Zatwierdzone są prostsza struktura gospodarki z 11.0, zakres, rola gracza, podstawowa pętla, rodzaje wpływu, dziewięć resortów, rozdzielenie procesów zamachowych, rozwój Milicji przed AS i granica następnych legalnych wyborów. Zgoda na konkretne wartości robocze pozwala je tu zaproponować; nie oznacza zatwierdzenia wszystkich współczynników i alternatyw ustrojowych do wdrożenia.

| Temat | Co daje obecny dokument | Co trzeba rozstrzygnąć lub zbadać przed właściwym wdrożeniem |
|---|---|---|
| Koszty i progi | Jednolity zestaw P z jednostkami, czasem i miejscem odczytu | Próby pełnych kampanii i korekta balansu |
| Kalendarz bez zamachu | Legalne warunki i konkretny wariant 19 II 1928 | Wybór tego wariantu publikacji i kalendarza jako domyślnego; nie jest wymuszony jedną historyczną datą |
| Sejm/Senat | Dokładne 444 mandaty, jawny uproszczony Senat, dwa zbiorcze segmenty mniejszości | Kalibracja udziałów obu segmentów, ordynacja senatorska i obecności; bez dodawania kolejnych narodowych klubów |
| Partie i gabinety | Nazwane konfiguracje, kolejność gabinetów, alternatywni premierzy i syntetyczne profile programu z 8.6–8.7 | Historyczna kalibracja stanowisk i datowanych zmian liderów; propozycje liczbowe nie są historycznymi profilami |
| Elektorat | Populacja bez podwójnego liczenia; polska większość, Żydzi i pozostałe mniejszości; Z — miesięczny przepływ za warunki życia 5.6 (M09) | Kalibracja macierzy tych trzech kategorii z klasami i właściwego mianownika bezrobocia; siła przepływu 5.6 i czułość wskaźnika wsi w prototypie |
| Gospodarka i scenariusz | Jeden budżet, krótkie projekty, jedna reakcja kapitału; datowane presje i profile gabinetów 17.16 | M02 gotowe do implementacji; balans grywalnego prototypu i historyczny profil wojsk (B; mechanika M08 zamknięta w 16.8) nadal do sprawdzenia; liczby modelu nie są statystykami |
| Warianty M07 | Konkretne profile wykonania 17.12.1–7 i cele odłożone na kontynuację | Koszty i wpływ na przebieg gry do testów; historyczne sprawy, stanowiska i obszary wymagają profili treści. Brak obowiązku tworzenia federacji lub państwa rad w rozdziale 1 |
| Prezydent i przemoc 1922 | Jeden wybór nominacyjny, końcowy wynik, osobne zagrożenie, ochrona i sukcesja | Wiarygodne preferencje i transfery w tle oraz warianty zagrożeń; brak interaktywnych kolejnych tur |
| Organizacje | Zasoby, koszty, autonomia, posłuch, przygotowanie AS | Historyczny zasięg związków, organizacji mniejszości, TUR i Milicji; profile sporów wewnętrznych |
| Wojsko i zamach | Zamknięty profil F `coup_f_v1` (16.8) na syntetycznych zgrupowaniach `synthetic_test_v2` | Historyczne zgrupowania, trasy, lojalności, mediator i kandydat oferty dymisyjnej — B; kalibracja w prototypie; korzyść AS uzgodniona w M15 (13.3–13.4) |
| Autorytet i demokracja | Z — jeden dziennik autorytetu; demokracja rosnąca sama tylko o 0,06/M; przed zamachem gotowość wojska i niewielki składnik presji (15.2, 15.3, 16.1; M10) | Wagi dziennika, siła przesunięcia, składnik presji i profile zdarzeń bezprawnych do kalibracji; historyczny związek nastrojów demokratycznych z postawą wojska i presją — B |
| Konflikt po czterech rundach | Z — koniec rozdziału z raportem przekazania (16.8.6, 19.1) | Treść kontynuacji |
| Reformy konstytucji | Trzy rozdzielone warianty: gwarancje, konstruktywne wotum, arbitraż prezydencki; dodatkowa zmiana własności na radykalnej ścieżce | Dokładna treść alternatywnych przepisów i zgodność z pozostałym prawem przed wdrożeniem |

Każda pozycja historyczna bez potwierdzenia pozostaje **TBD — historical research required**. Nie blokuje przygotowania tej referencji ani testów algorytmu na danych syntetycznych, ale nie może zostać opisana w wydanej grze jako ustalony fakt.

### 22.2. Podstawa i ślad źródłowy

| Zakres | Źródło i granica zastosowania |
|---|---|
| Niemiecka mechanika | [GERMAN_ORIGINAL_TECHNICAL_REFERENCE.md](GERMAN_ORIGINAL_TECHNICAL_REFERENCE.md); wzór poziomu precyzji i audyt pułapek, nie dowód dla polskich instytucji |
| Zatwierdzony polski pierwszy szkic | [POLISH_DESCRIPTIVE_GUIDE.md](POLISH_DESCRIPTIVE_GUIDE.md); kierunek gry i osiem strategii |
| Stan kodu i migracja | [STATE_VARIABLES.md](../STATE_VARIABLES.md), [MECHANICS_MAP.md](../MECHANICS_MAP.md), [TRANSITION_MATRIX.md](../TRANSITION_MATRIX.md), [PLAN.md](../PLAN.md) oraz źródła wskazane w rozdziałach 1 i 20 |
| Sejm, Senat, kadencja i rozwiązanie | [Konstytucja marcowa, rozdział II](https://biblioteka.sejm.gov.pl/tek01/txt/kpol/1921a-r2.html), art. 11, 26, 32 i 35 |
| Prezydent i odpowiedzialność ministrów | [Konstytucja marcowa, rozdział III](https://biblioteka.sejm.gov.pl/tek01/txt/kpol/1921a-r3.html), art. 39–45 i 58 |
| Zmiana konstytucji | [Konstytucja marcowa, rozdział VI](https://biblioteka.sejm.gov.pl/tek01/txt/kpol/1921a-r6.html), art. 125 |
| Liczba mandatów i terminy zarządzenia/głosowania | [Ordynacja wyborcza do Sejmu z 28 VII 1922](https://eli.gov.pl/api/acts/DU/1922/590/text.html), art. 9, 13–14; algorytm z rozdziału 6 pozostaje uproszczeniem |
| Początek i upływ pięcioletniej kadencji | [Senat RP: kadencje izb 1922–1939](https://www.senat.gov.pl/gfx/senat/userfiles/_public/k8/statystyki/senat_1922-1939/01_kadencje_1922-1939.pdf); proponowane wybory II 1928 nie są historycznym wynikiem tego źródła |
| Stabilizacja, ziemia, organizacje i zamach | [HISTORICAL_SOURCES.md](../HISTORICAL_SOURCES.md): `PL-1924-FISCAL-CURRENCY`, `PL-1925-LAND-REFORM`, `PPS-MAY-1926-ROLE`, `PL-1922-1926-CABINETS`, `PPS-CHAPTER1-NOTION-NOTES` |
| Decyzje o liczbach i granicy rozdziału | Ta rozmowa; wpis `PL-TECHNICAL-DRAFT-2026-09` w rejestrze źródeł; decyzja projektowa, nie źródło historyczne |
| Konkretne koalicje, polityki, TUR, kryzysy i oba zamki | `PL-CONTENT-1922-1926-2026-09` w [rejestrze](../HISTORICAL_SOURCES.md); zatwierdzony zakres treści, historyczne źródła i granice poszczególnych scen |

Mapowanie do przewodnika opisowego: jego rozdziały 1–4 → tutaj 1–4; 5 → 10; 6 → 13–14; 7–8 → 5–6; 9 → 7–9; 10 → 8.5 i 12; 11 → 9.7 i 11–12; 12 → 17; 13 → 9.6, 16.7 i 18; 14 → 15–16; 15–16 → 19; 17 → 18 i 21; 18–19 → 20 i 22.

To referencja projektowa gotowa do omówienia i dzielenia na ograniczone prace implementacyjne. Zbadane liczby historyczne, zatwierdzone decyzje, testowe parametry i działający kod pozostają czterema odrębnymi kategoriami.

### 22.3. Ponowna ocena notatek projektowych

Źródło: [notes for the polish version](https://app.notion.com/p/notes-for-the-polish-version-3d282c5228d580f09615f7c82ac854a2), ponownie odczytane w przeglądarce 9 września 2026; wpis `PL-DESIGN-SIMPLIFICATION-2026-09` w rejestrze. Notatki zawierają pomysły, starsze decyzje, opis przejściowego kodu i niezweryfikowane twierdzenia historyczne. Nie są jednym aktualnym kontraktem implementacji.

| Pomysł | Decyzja w tej rewizji i powód |
|---|---|
| Jawna deklaracja metody socjalizmu i form własności | Po rewizji 10 września: osobne karty ustroju i do trzech priorytetów gospodarczych, 10.5–10.8. Nadają treść późniejszym zarzutom o zmianę linii |
| Zakres współpracy z Bundem i polityka mniejszościowa | Dodane konkretne warianty, przy zachowaniu tylko dwóch kategorii mniejszości; brak nowych narodowych systemów |
| Świeckość i relacje z religijnymi wyborcami | Po rewizji 10 września bez osobnej karty partyjnej; treść reformy Oświaty, umowy lub właściwego wydarzenia |
| Popularne wydanie „Robotnika” | Dodany ograniczony wybór zasięg/sprzedaż versus wiarygodność i sprzeciw działaczy |
| Konfiskaty prasy | Dodana nazwana sprawa z czasowym efektem i legalną odpowiedzią; treść historyczna potrzebuje źródeł |
| Industrializacja zmienia strukturę klasową | Wartościowe dla dłuższej kampanii, odłożone do zbadania i oceny uproszczonej gospodarki. Nie dajemy automatycznego przyrostu wyborców PPS za sam wzrost liczby robotników |
| Wielkie inwestycje i polityka lat trzydziestych | Poza obecnym rozdziałem. Nie przesuwamy ich nazw i skutków do 1922 bez badania |
| Automatyczne zabójstwo dowolnego lewicowego prezydenta | Nieprzeniesione: wynik wyborów i konkretne zagrożenie są osobne |
| Zwycięzca prezydentury wyznaczany wyłącznie etykietą większości | Nieprzeniesione: końcowy wynik musi wynikać z głosów i porozumień; część reguł w notatkach jest wzajemnie sprzeczna |
| Powrót Chjeno-Piasta automatycznie rozstrzyga zamach | Zachowany obowiązkowy kryzys polityczny, ale próba i wynik nadal używają wcześniej uzgodnionych bramek oraz decyzji PPS |
| Władza ekspercka, tolerowanie rządu, kolej i ustępstwa wojskowe | Rozwinięte w konkretne oferty 8.7, 9.7, 16.7 i 17.5; nie dokładamy drugich liczników tych samych procesów |

Nowe liczby kart są propozycjami P. Wątpliwe daty, konkretne represje i historyczne stanowiska aktorów pozostają **TBD — historical research required**. Treść notatek o późniejszej Sanacji nie uchyla zatwierdzonego końca pierwszego rozdziału.

### 22.4. Mapa wprowadzonych tematów z listy użytkownika

Każdy poniższy temat jest teraz opisany jako wybór gracza w obu dokumentach. „Wprowadzony” oznacza dokumentację docelowej gry; nie wdrożenie w Dendry. Nowe kierunki wynikają z decyzji użytkownika, a szczegółowe koszty i progi pozostają P.

| Temat | Przewodnik opisowy — rozdział | Ta referencja — kontrakt |
|---|---|---|
| PPS–PSL–NPR, szersza koalicja, jedność narodowa, zjednoczona lewica | 9: konkretne koalicje | 8.6; dodatkowe bramki komunistów 9.6 |
| PPS–Wyzwolenie, PPS–NPR, blok ludowy, Centrolew | 8: konkretne sojusze wyborcze | 6.5; metoda mandatowa 6.1 |
| Ciąg gabinetów i alternatywni premierzy | 9: gabinety i premierzy | 8.7 |
| Śmiarowski, Rataj, Daszyński | 9: marszałek | 7.5 oraz rozdział urzędów 7.3 |
| Demokratyzacja, silniejszy prezydent, stabilizacja gabinetów | 9: reforma reguł | 7.6 |
| Ustępstwa wobec Piłsudskiego | 13.7: cztery stanowiska wobec oferty | 16.7 |
| Podatki i konsolidacja kapitału na inwestycje | 11: źródła finansowania | 11.9 |
| Tolerowanie Grabskiego i koszty stabilizacji | 11: cztery stanowiska i przegląd | 9.7 |
| Reforma rolna | 10: sposoby parcelacji i dostęp | 12.6 |
| Oświata i prawa mniejszości | 10: szkoła, język i organizowanie | 12.7 |
| Kraków i strajki 1923 | 12: protesty, kolej i treść ugody | 17.5 oraz 14 |
| Mobilizacja po zabójstwie prezydenta | 12: cztery odpowiedzi | 17.6 |
| Współpraca z komunistami | 13.6: trzy próby i zakres frontu | 9.5–9.6 |
| Modernizacja i komasacja | 10: odrębne programy wiejskie | 12.6 |
| Funkcja TUR | 6: poziomy i zadania | 13.2; efekt kampanii 5.3 |
| Kult Niewiadomskiego i Milicja wobec nabożeństw | 12: trzy odpowiedzi, w tym msza w obronie demokracji | 17.7 |
| Afera żyrardowska: ujawnić czy ograniczyć rozgłos | 12: publikacja i kontrola | 17.8 |
| Wawel lub Zamek Królewski jako decyzja Oświaty | 10: mały projekt dziedzictwa | 12.8 |

Z wcześniejszych polskich plików zachowano też rozdzielenie listy od gabinetu, samodzielność klubów, zewnętrzne wsparcie mniejszości, dziewięć aktualnych portfeli (po przeniesieniu robót do Pracy), doradców i ograniczenia istniejących wycinków. Nie przywrócono odrzuconych później uproszczeń: stałych wyników prezydentury, natychmiastowej AS, dalszych narodowych podziałów, dyplomacji i przeniesienia inwestycji lat trzydziestych do 1922.

Zapisy zatwierdzeń kolejnych decyzji, dawne 22.5–22.24, są od 0.31 w rozdziale 23 (M19).

## 23. Archiwum decyzji

**Z — 0.31 (M19).** Ten rozdział przechowuje historię decyzji dla przejrzystości. Nie jest instrukcją wdrożenia: gdy jego treść różni się od rozdziałów 1–22, obowiązują rozdziały 1–22. Teksty przeniesiono bez zmian.

### 23.1. Dawny opis wersji

Nagłówek dokumentu w wersji 0.30, z opisem wersji 0.5–0.13:

**Wersja 0.30 — 26 września 2026.** Specyfikacja pierwszego rozdziału na podstawie [POLISH_DESCRIPTIVE_GUIDE.md](POLISH_DESCRIPTIVE_GUIDE.md). Obejmuje stan, jednostki, wzory, warunki kart, kolejność rozliczeń, głosowania, umowy, gospodarkę, organizacje, zamach i zapis kampanii. Rewizja zachowuje katalog koalicji, gabinetów, reform i kryzysów oraz wprowadza zatwierdzone karty strategiczne PPS: trwałe stanowiska, program do trzech priorytetów, inwestowanie w dwie organizacje, rozwój Milicji i decyzje wydarzeń. Zachowuje dwie kategorie mniejszości, Normalny i końcowy wynik wyborów prezydenckich. Wersja 0.5 wprowadza zatwierdzone 12 kart parlamentarnych: wspólne tworzenie gabinetu i udział PPS, kontekstowe blokady, uproszczone poparcie rządu oraz dwuwariantowy Żyrardów. Ustępstwa wobec Piłsudskiego należą do kart rządowych. Wersja 0.6 dodaje zatwierdzony manifest 16 podstawowych kart rządowych i 2 wydarzeń, a roboty publiczne przenosi do Pracy: dziewięć resortów. Wersja 0.7 zastępuje doradcze ogólniki 22 konkretnymi akcjami 13 osób, wpływem powołania na frakcje i opisem niemieckiego wzorca. Wersja 0.8 upraszcza wydarzenia B1–B21: łączy protest z reakcją władz i ugodę z odpowiedzią parlamentarną, usuwa wskazane osobne sceny oraz przenosi model sowiecki do puli partii. Wersja 0.9 upraszcza C1–C9: jeden ekran gabinetu, wybór sojuszu bez negocjacji warunków, brak scen kontrpropozycji, procedowania ustawy, inicjowania wcześniejszych wyborów i wakancji. Aktualny manifest: 10 rodzin parlamentarnych i 16 rządowych; kontekstowe kryzysy korzystają z tych samych działań. Wersja 0.10 ogranicza D do jednej ustawy i dwóch kart, E do groźby rozłamu części frakcji oraz odrzucenia ugody, a F i G do skróconych sekwencji z 17.15. Stabilizacja gabinetów pozostaje reformą konstytucyjną. Wersja 0.11 wdraża zatwierdzone uproszczenie gospodarki: siedem wskazań, jeden budżet, krótkie wdrażanie i jedna reakcja kapitału; aktualizuje zależne karty, umowy i testy. Wersja 0.12 dodaje zatwierdzony scenariusz Normalny `normal_chapter1_v1`: presje, profile gabinetów, przejścia kryzysowe, końcówkę bez zamachu i trzy przebiegi referencyjne (17.16). Wersja 0.13 wdraża korekty czterech przebiegów: dostęp do gabinetu kryzysowego, konkretny spór o osłony, pojedynczą poprawkę koniecznej oferty, stopniową odbudowę płac, ulgę ugody i znaczenie transportu przed wynikiem zamachu. Dokument nie zmienia działającej gry.

### 23.2. Akapity rewizji 0.14–0.30

Od najnowszej. Rewizja 0.13 ma własny zapis w 23.3.

**Rewizja 0.30 — zatwierdzone rozwiązanie M18:** indeks członkostwa (13.1) oznacza rzeczywistą skalę partii i w rozdziale 1 mieści się w zakresie 0–150. Co miesiąc zbliża się o 5% różnicy do celu z poparcia PPS wśród robotników i zasięgu związków, obniżanego przez wyższe składki. Rośnie przez istniejące działania, bez nowej karty rekrutacji. Wpływy z poziomu aparatu wynoszą 0,15 zamiast 0,20 R, więc poziom daje netto +0,05 R/M i zwraca się po ok. 40 M zamiast 20. Aparat przestaje być oczywistym pierwszym ruchem, a budowanie organizacji zaczyna się opłacać. W archiwalnych przebiegach M02 wyniki i gabinety się nie zmieniają, a kasa PPS nigdy nie spada poniżej zera. Liczby są P. M18 zamknięte w dokumentacji; kod gry bez zmian, metadane scenariusza nadal w wersji 5.

**Rewizja 0.29 — zatwierdzone rozwiązanie M17:** Próchnik (A12) i Drobner (A13) należą do obsady kontynuacji i nie pojawiają się w rozdziale 1. Wcześniej wchodzili w styczniu 1928 r., po końcu większości przebiegów. Współpraca z KPP ma w rozdziale 1 drogę przez zwykłe działania. „Otworzyć kontakt” (9.5) jest dostępne od relacji 10, czyli od startu, a po otwarciu kanału zwykłe rozmowy z 8.1 obejmują KPP. Lekka koordynacja w strajku jest możliwa po 3 akcjach, pełna współpraca po 5, zasady szerszego układu po ok. 10. Przebiegi M02 nie korzystają z tych doradców ani ze współpracy z komunistami, więc scenariusz się nie zmienia. Liczby są P. M17 zamknięte w dokumentacji; kod gry bez zmian, metadane scenariusza nadal w wersji 5.

**Rewizja 0.28 — zatwierdzone rozwiązanie M06:** wybór prezydenta i marszałka nie może już utknąć. W finale dwóch kandydatów wygrywa ten, kto dostał więcej głosów; wstrzymania i głosy nieważne liczą się do obecności, nie do większości, a dokładny remis nadal rozstrzyga losowanie 50/50 z 0.18. Na obowiązkowe wybory urzędów przychodzą wszystkie kluby, a profil musi mieć co najmniej dwie ważne kandydatury. Bezpiecznik: nierozstrzygnięty mimo to wybór kończy sekwencję ze statusem `no_election`. Urząd sprawuje wtedy osoba pełniąca obowiązki, gracz odzyskuje zwykłą turę, a nowe głosowanie następuje samo w następnym miesiącu. Przebiegi M02 nie zawierają algorytmu wyborów urzędów, więc scenariusz się nie zmienia. M06 zamknięte w dokumentacji; kod gry bez zmian, metadane scenariusza nadal w wersji 5.

**Rewizja 0.27 — zatwierdzone rozwiązanie M16:** przyjęty rozłam E3 (10.2) ma jeden jawny rachunek, taki sam jak czystka z 10.9, tylko dla 40% zaplecza frakcji. Siła frakcji spada ×0,6 i następuje normalizacja. Członkostwo i poparcie PPS w każdej komórce spadają o udział odchodzących, a ubytek wyborców przechodzi do odbiorcy z manifestu albo do `other`. 40% posłów frakcji, zaokrąglone raz, przechodzi do klubu rozłamowego; sprzeciw pozostałej części spada o 20. Posłowie klubu PPS są przypisani do frakcji od wyborów do rzeczywistego transferu; zmiany siły frakcji po akcjach doradców nie przepisują ich. Przebiegi M02 nie osiągają rozłamu, więc scenariusz się nie zmienia. Liczby są P. M16 zamknięte w dokumentacji; kod gry bez zmian, metadane scenariusza nadal w wersji 5.

**Rewizja 0.26 — zatwierdzone rozwiązanie M15:** Milicja ma jedną akcję naraz: przed zamachem chroni jedną sprawę, w zamachu wykonuje jedno zadanie. Przewagą AS jest koordynacja. Posłuch jej członków rośnie o 0,15 (najwyżej do 1), więc z tymi samymi ludźmi AS daje ok. 18–21% więcej siły, w zamachu i w wydarzeniach. Przed zamachem AS obsługuje do trzech równoczesnych spraw; silnik daje każdej siłę do pełnego efektu ochrony (4 F), a resztę przekazuje następnej. W zamachu AS ma, jak Milicja, jedno zadanie. Przy obronie rządu częściej czyni PPS istotną siłą (F9). AS nie dodaje ludzi ani sprawności. Przebiegi M02 nie modelują siły Milicji, więc scenariusz się nie zmienia. Liczby są P. M15 zamknięte w dokumentacji; kod gry bez zmian, metadane scenariusza nadal w wersji 5.

**Rewizja 0.25 — zatwierdzone rozwiązanie M13:** dyscyplina KPP we wspólnym strajku (9.6) zależy od relacji z KPP i zgodności wspólnych żądań z celem partnera zapisanym w profilu wydarzenia: `(relacja + zgodność celu) / 200`, w granicach 10–90%. Poparcie współpracy wewnątrz PPS (9.5) działa już tylko na PPS. Podnosi je opcja „Kompromis” w karcie „Jedność i kierownictwo” (+15 w każdej frakcji). Od 60 znosi karę sprzeciwu Centrum i, jak dotąd, otwiera trwały front. Przebiegi M02 nie zawierają współpracy z komunistami, więc scenariusz się nie zmienia. Liczby są P, historyczne cele KPP B. M13 zamknięte w dokumentacji; kod gry bez zmian, metadane scenariusza nadal w wersji 5.

**Rewizja 0.24 — zatwierdzone rozwiązanie M12:** zgoda związku na ugodę strajkową (17.4) czyta koszt dalszej walki, a nie stan funduszu. Koszt kontynuacji to większa z dwóch wartości: brak pieniędzy albo zmęczenie strajkujących. Pełny fundusz nie skłania już do ugody, ale nadal wzmacnia nacisk z 14.2. Kruchość rządu w rokowaniach strajkowych (14.4) czyta rzeczywiste poparcie gabinetu i spory w jego umowach: `50 − (posłowie popierający − 222) + 0,5 × najwyższe napięcie`, w granicach 0–100; gabinet pełniący obowiązki ma 100. Autorytet Sejmu przestaje wpływać na strajki. W archiwalnych przebiegach M02 ugoda strajkowa przypada w innym miesiącu w 10 ze 144 przebiegów, a jeden termin próby przesuwa się o miesiąc wcześniej; kolejność gabinetów się nie zmienia. Liczby są P. M12 zamknięte w dokumentacji; kod gry bez zmian, metadane scenariusza nadal w wersji 5.

**Rewizja 0.23 — zatwierdzone rozwiązanie M11:** targowanie z 9.8 (`bargain`) jest prawdziwą groźbą. Gdy rząd odmówi, PPS od razu, za 0 T, wybiera: spełnić groźbę ze zwykłymi skutkami `withdraw` albo się cofnąć. Cofnięcie kosztuje wiarygodność −5, a do końca tego gabinetu kolejne targowanie liczy się bez składnika potrzeby. Ustępstwo wymuszone groźbą obniża o 3 relację z każdą partią, która je przyjęła; perswazja nie zmienia relacji. Ocena 8.3 się nie zmienia. W archiwalnych przebiegach M02 wyniki, kolejność gabinetów i terminy prób zostają te same. W 12 przebiegach z odrzuconym przeglądem osłon PPS odchodzi o miesiąc wcześniej. Liczby są P. M11 zamknięte w dokumentacji; kod gry bez zmian, metadane scenariusza nadal w wersji 5.

**Rewizja 0.22 — zatwierdzone rozwiązanie M10:** autorytet Sejmu ma jednego właściciela: dziennik instytucjonalny z 15.2. Odpowiedź na wystąpienie Piłsudskiego z 10.7 zapisuje w nim wpis +1 albo −2 ważny 12 miesięcy, zamiast bezpośredniej zmiany kasowanej przez miesięczne przeliczenie. Demokracja rośnie sama tylko nieznacznie: punkt odniesienia autorytetu w jej równaniu wynosi 53, więc zwykły Sejm dodaje 0,06 zamiast 0,15 punktu miesięcznie. Dwa dotąd puste składniki mają konkretne zdarzenia. Przed zamachem demokracja działa na dwa sposoby. Pierwszy to gotowość wojska do udziału (16.1): 2,5 pp lojalności wobec Piłsudskiego na każde 10 punktów od poziomu 60, najwyżej ±10 pp. Drugi to niewielki składnik presji (15.3): `0,01 × (60 − demokracja)` miesięcznie, najwyżej ±0,5. Przy biernej PPS Piłsudski wygrywa 41–46% prób przy demokracji 45–75; przy 60 wyniki M08 się nie zmieniają. W archiwalnych przebiegach M02 zostaje wszystkie 96 prób, każda 1–3 M później; to zatwierdzony skutek, nie nowe dopasowanie dat. Oferty i wyborcy nie czytają demokracji. Liczby są P. M10 zamknięte w dokumentacji; kod gry bez zmian, metadane scenariusza nadal w wersji 5.

**Rewizja 0.21 — zatwierdzone rozwiązanie M09:** 5.6 dodaje miesięczny przepływ poparcia za warunki życia. Każda z pięciu klas ma pochodny wskaźnik z płac realnych i bezrobocia (−2 punkty za każdy punkt procentowy ponad 3%). Robotnicy odczuwają go w pełni, inteligencja w 1/2, drobnomieszczaństwo w 1/4, a chłopi w 1/5, obok pełnego wskaźnika wsi z 11.6; burżuazja i ziemiaństwo nie reagują. Pogorszenie przesuwa 0,1 pp za punkt, najwyżej 0,5 pp miesięcznie, od partii odpowiedzialnych za rząd do pozostałych. Poprawa nagradza odpowiedzialnych w połowie siły: 0,05 pp za punkt, najwyżej 0,25 pp. Członkowie gabinetu odpowiadają w pełni, partie tolerujące go na podstawie podpisanego wsparcia w połowie, opozycja wcale. Odbiorcy przepływu i odpływu za niewykonane zobowiązania z 17.4 dzielą się według obecnych udziałów w komórce. Inflacja działa tylko przez płace, spadek produkcji przez bezrobocie; świadczenia nie wchodzą do wskaźnika. Liczby są P. M09 zamknięte w dokumentacji; kod gry bez zmian, metadane scenariusza nadal w wersji 5.

**Rewizja 0.20 — zatwierdzone rozwiązanie M08:** 16.8 zamyka pełny profil F `coup_f_v1` od bramek próby do raportu. Zwycięstwo zapada po dwóch kolejnych rundach przewagi ponad 1,20 albo od razu przy przewadze co najmniej dwukrotnej; w obu przypadkach siła przeciwnika obejmuje jego oddziały przybywające w następnej rundzie. Walka może więc skończyć się po 1–2 rundach, a opóźnienie koleją zachowuje znaczenie. Ugoda wybiera jedną z trzech ofert (funkcja wojskowa, inspektorat, dymisja gabinetu); zaufanie do jej wykonania czyta tylko demokrację, bez nazwanego gwaranta. PPS decyduje w F9 wyłącznie przy istotnym udziale w walkach, a odrzucenie zamyka drogę do ugody w tej próbie. `prolonged_conflict` jest zatwierdzonym końcem rozdziału; ustępstwa zwycięzcy wobec PPS wymagają rozstrzygającego wkładu, liczonego kontrfaktycznie. Syntetyczne lojalności dwóch rezerw zmieniono (`synthetic_test_v2`), aby przy biernej PPS Piłsudski wygrywał w około 44% prób. Liczby są P, historyczne zgrupowania i mediacja pozostają B. M08 zamknięte w dokumentacji; kod gry bez zmian, metadane scenariusza nadal w wersji 5.

**Rewizja 0.19 — zatwierdzone rozwiązanie M07:** 17.12.1–7 określa wykonanie zamówień, policji, rozliczenia nadużyć, nominacji, reprezentacji pracowniczej i ograniczonej autonomii. Szerokie gwarancje korzystają z istniejącej demokratyzacji. Federacja, pełna autonomia polityczna i państwo rad są celami na kontynuację, z bieżącymi skutkami programu. Koszty i efekty są przyjętymi wartościami prototypowymi, nadal P do balansu; M07 zamknięte w dokumentacji. Nie zmieniamy kodu gry, liczby rodzin kart ani reguł M02; profil scenariusza nadal ma wersję 5.

**Rewizja 0.18 — remis w wyborze urzędu:** przy remisie dwóch finalistów wyborów prezydenta lub marszałka zwycięzcę wskazuje jedno zapisane losowanie 50/50 (7.3, 7.5). Bez dodatkowej karty, miesiąca, zmiany głosów ani ponownego losowania po wczytaniu. Zatwierdzone uproszczenie rozgrywki; pozostałe przypadki impasu M06 nie są nim rozstrzygnięte.

**Rewizja 0.17 — M05:** D2 zamyka wybór i pierwsze głosowanie Sejmu; pozostałe czynności odbywają się automatycznie w dniach zapisanych w 17.15. Ustawa daje wypłaty dopiero od wejścia w życie, zachowuje autora PPS, wykonawcę i finansowanie. Zasługa za autorstwo z 5.4 jest jednorazowa i wymaga rzeczywistego wykonania. Jedna inicjatywa, bez ponawiania przez ogólne karty projektów. M05 zamknięte w dokumentacji; M02 i jego zestaw porównawczy pozostają bez zmian, metadane scenariusza nadal 5.

**Rewizja 0.16 — końcowa korekta M02:** impuls +20 zależy od rzeczywistego powrotu Chjeno-Piasta po gabinecie stabilizacyjnym lub szerokim przy otwartej sprawie wojskowej, bez bramki maja. Kompromis osłon używa wspólnej oceny ≥60, wykonalnego finansowania i twardych warunków, bez dodatkowych minimów relacji. Pozostałe liczby pozostają. Scenariusz jest gotowy do implementacji; datowanie sporów wojskowych jest robocze i wymaga późniejszego sprawdzenia historycznego. Kontrakt i granice domknięcia: 17.16.11; [końcowe sprawdzenie](../analysis/m02-robustness/REPORT.md). Poniższe datowane rewizje opisują wcześniejsze etapy.

**Rewizja 0.15:** krok 3 M02 uzupełnił pokrycie presji oraz moment sprawdzania bramek (4.2, 15.3, 17.16.9). Kontrolowany H osiągał V 1926 na zamrożonym tle; późniejszy krok 4 nie potwierdził tej daty po połączeniu polityki z gospodarką. To archiwalny rachunek, nie docelowy termin próby.

**Rewizja 0.14:** domknięty ciąg polityczny od kryzysu kredytu przez odmowy Grabskiego, oceniane oferty następców i spór o osłony do warunkowej próby zamachu — 17.16.8. Sprawdzenie obejmuje 16 wariantów politycznych; pełna gospodarcza kampania i kalibracja M02 nadal pozostają otwarte.

### 23.3. Zapisy zatwierdzeń (dawne 22.5–22.24)

Zapisy zachowują dawne numery, aby odwołania „22.x” w rejestrach nadal prowadziły do właściwego tekstu.

#### 22.5. Zatwierdzone poprawki kart, 10 września 2026

Przegląd użytkownika zastępuje poprzedni ogólny katalog programu: kierunek ma skutki zależne od stanu politycznego, przeciwnik nie obejmuje „obecnego gabinetu”, Piłsudski ma osobną kartę linii i osobną reakcję na krytykę parlamentu. Program wybiera do trzech priorytetów; ustrój ma dokładnie trzy warianty. Karty mniejszości odtwarzają cztery warianty autonomii i trzy współpracy żydowskiej z Notion, przy zachowaniu dwóch agregatów elektoratu. Organizacje pozwalają na dwie inwestycje; strajki są wydarzeniami; Milicja rozwija się przez rekrutację i militaryzację do warunkowej AS. Dochodzą czystka frakcyjna oraz wydarzenia współpracy strajkowej i stanowiska wobec ZSRR.

Wcześniejsze liczby wymagające niezależnego dowodzenia Milicji, osobna karta religii oraz trzy karty prób współpracy nie są częścią nowego kontraktu. Konkretne parametry, proponowane odpowiedzi o ZSRR i warunki czystki są P; tematy i limity wyborów są Z. Źródło projektu: `PL-PARTY-CARDS-REVIEW-2026-09-10` w [HISTORICAL_SOURCES.md](../HISTORICAL_SOURCES.md). Nie zmieniono `source/`, nie przeprowadzono migracji zapisów ani kalibracji nowych parametrów.

#### 22.6. Zatwierdzone karty parlamentarne, 10 września 2026

Manifest 17.10 wdraża w dokumentacji zatwierdzone połączenia i uproszczenia. Przewodnik opisowy: rozdziały 3, 9, 11–13 i 15. Kontrakty dostępności i następstw: 7.4, 8.8, 9.7–9.8, 16.7, 17.5.1 i 17.8. Źródło decyzji: `PL-PARLIAMENT-CARDS-REVIEW-2026-09-10` w [HISTORICAL_SOURCES.md](../HISTORICAL_SOURCES.md). Katalog i ograniczenia dostępu są Z; identyfikatory, progi kryzysu, koszty i wzory pozostają P. Żaden z tych zapisów nie oznacza zmiany działającego kodu.

#### 22.7. Zatwierdzone karty rządowe i Praca, 10 września 2026

Źródło: `PL-GOVERNMENT-CARDS-REVIEW-2026-09-10` w [HISTORICAL_SOURCES.md](../HISTORICAL_SOURCES.md). Użytkownik zatwierdził 18 propozycji z jedną korektą: usunięcie osobnego resortu Robót Publicznych / Komunikacji i przeniesienie karty do Pracy. Katalog Z i docelowe kompetencje opisują 8.5, 17.11–17.12 oraz rozdziały 3 i 10 przewodnika; P to szczegółowe rekordy, parametry i przyszła migracja. Numery 1–16 są podstawowymi rodzinami (z kontekstową dostępnością), 17–18 wydarzeniami. Zachowano zatwierdzone karty partii i parlamentu; ich interakcje rozliczają wspólne umowy, projekty i wydarzenia, nie powielone efekty. Brak zmian w Dendry.

#### 22.8. Rewizja doradców, 10 września 2026

Użytkownik zlecił analizę niemieckich doradców, konkretny wpływ powołania na siłę/dissent i syntezę po 1–2 akcje. Wynik: 13 profili, 22 akcje, zachowane trzy miejsca i wspólny zegar; roster późniejszych lat bez wcześniejszego odblokowania. Zmiany i parametry są w 10.4, wspólne akcje także 9.5–9.6, a przewodnik opisowy rozdział 5 zawiera pełny katalog. Synteza ogranicza powtarzające się akcje prosanacyjne i kontakty komunistyczne. Źródło: `PL-ADVISORS-REVIEW-2026-09-10`. Obecny kod oraz niemieckie dokumenty pozostają bez zmian; P to liczby, profile i zakres implementacji.

#### 22.9. Uproszczenie wydarzeń B

Wersja 0.8 zastępuje wcześniejsze menu według pełnej mapy 17.13. Szczególnie B15 usuwa wcześniejsze zatwierdzenie Żyrardowa, B20 wycofuje odrębną kartę przedsiębiorców, a B13 zmienia typ i koszt karty sowieckiej. Dawne wpisy 22.3–22.7 są historią projektu; aktywne katalogi i scenariusze weryfikacji zostały zaktualizowane. Źródło: `PL-EVENTS-B-REVIEW-2026-09-10`. Bez zmian w kodzie gry.

#### 22.10. Uproszczenie C1–C9, 11 września 2026

Rewizja 0.9 usuwa dodatkowe negocjacyjne i proceduralne sceny według 17.14. Zastępuje wcześniejszą wielorundową ofertę, menu warunków listy i inicjatywę wcześniejszych wyborów. Starsze rejestry są historią decyzji; obecne 6.5, 7.2–7.4, 8.3/8.8 i manifest dziesięciu rodzin parlamentarnych mają pierwszeństwo. C5–C7 pozostają. Źródło: `PL-C-SCENES-REVIEW-2026-09-11`. Bez zmian w źródłach gry.

#### 22.11. Uproszczenie D–G, 11 września 2026

Zatwierdzono jedną inicjatywę zabezpieczenia bezrobotnych w dwóch kartach, poza formalnym rządem. Stabilizacja gabinetów pozostaje wariantem reformy konstytucyjnej. E zachowuje tylko E3 (część frakcji, domyślnie bez doradcy) i E6. F łączy mobilizację z transportem oraz wynik z konsekwencjami, ogranicza ugodę do faktycznego udziału; G usuwa dodatkowe miesięczne ekrany i zamknięcie list. Kanoniczny manifest: 17.15. Jest to zatwierdzenie dokumentacji projektu, nie stwierdzenie wdrożenia do Dendry ani historycznej autentyczności projektowanych wariantów.

#### 22.12. Zatwierdzona prosta gospodarka — 14 IX 2026

Wersja 0.11 zastępuje rozbudowane rozliczenia 11–12 prostym budżetem i profilem `economy_simple_v1`. Zaktualizowano jednostki, wykonanie bez kadry, warianty resortowe, D, umowy, doradców, TUR, raport i testy. Zatwierdzona jest struktura; liczby pozostają P. Historyczny profil scenariusza i pełny model wyborczy pozostają oddzielnymi otwartymi pracami M02/M09. Źródło decyzji: `PL-ECONOMY-SIMPLIFICATION-2026-09-14`. Kod bez zmian.


#### 22.13. Zatwierdzony scenariusz Normalny — 20 IX 2026

Wersja 0.12 wprowadza `normal_chapter1_v1` w 17.16. Zatwierdzone: kalendarz presji, najwyżej jedna nowa inicjatywa państwa poza resortami PPS na miesiąc, samodzielne profile gabinetów, przejścia od żądań płacowych do protestu, warunkowa zmiana rządu, sposobność wojskowa od wiosny 1926 oraz kampania bez zamachu do legalnych wyborów. Tabela liczb i techniczne daty pozostają P do kalibracji. Przebiegi N-A/N-B/N-C przeszły przegląd kontraktów dokumentacyjnych, nie pełną symulację. M02 jest częściowo rozwiązane, nie usunięte z audytu. Źródło: `PL-NORMAL-SCENARIO-2026-09-20`. Bez zmian kodu.

#### Rewizja 0.13 — wyniki czterech przebiegów, 21 IX 2026

Zatwierdzona korekta M02: ratunkowy gabinet bez osobnych progów relacji na wejściu; konkretny przegląd osłon i pojedyncza poprawka koniecznej oferty; stopniowa odbudowa płac +3; dostęp do protestu po odrzuconych żądaniach; polityczny postulat bez automatycznej szerokiej mobilizacji; ulga ugody −4 raz po wykonaniu; presja +2 za otwartą sprawę i pojedyncze nagrody; wojskowe rozstrzygnięcie najwcześniej po fazie 2. Koszty programów, budżet bazowy i progi presji pozostają. Źródło decyzji: `PL-M02-REVISION-2026-09-21`. Wyniki przed zmianą: `analysis/m02-four-runs/REPORT.md`; weryfikacja korekty: `analysis/m02-revision-13/REPORT.md`. Kontrolowane testy nie zastępują pełnej symulacji aktorów, wyborów i historycznego profilu wojsk. Bez zmian gameplay.

#### 22.14. Zatwierdzone rozwiązanie M08 — 24 IX 2026

Użytkownik przyjął uproszczony model zamachu w ośmiu zasadach i zlecił jego zapis w dokumentacji. Kanoniczny kontrakt: 16.8, z odwołaniami w 16.1–16.7, 17.15, 19.1 i 21.1. Decyzje:
- walka trwa najwyżej 4 rundy, a przy wyraźnej przewadze kończy się po 1–2 rundach;
- zasada „strona z przewagą nie negocjuje” i ocena końcowa po 4. rundzie;
- trzy oferty ugody;
- usunięty nazwany gwarant;
- głos PPS w F9 tylko przy istotnym udziale w walkach;
- odrzucenie F9 zamyka ugodę;
- `prolonged_conflict` jako koniec rozdziału, rzadszy niż zwycięstwo;
- ustępstwa wyłącznie przy rozstrzygającym wkładzie PPS;
- profil `synthetic_test_v2`, dający przy biernej PPS około 44% zwycięstw Piłsudskiego.

Robocze skutki F10+F11 dla frakcji, relacji i instytucji pochodzą z wcześniejszej propozycji i pozostają P do kalibracji. Źródło: `PL-M08-COUP-PROFILE-2026-09-24`. Diagnostyka: `analysis/m08-coup-profile/`. Kod gry, zależności i metadane scenariusza bez zmian.

#### 22.15. Zatwierdzone rozwiązanie M09 — 25 IX 2026

Użytkownik zatwierdził miesięczny przepływ poparcia za warunki życia i zlecił jego zapis w dokumentacji. Kanoniczny kontrakt: 5.6, z odwołaniami w 2.3–2.4, 5.4, 11.6, 15.1, 17.4, 20.2 i 21.1. Decyzje użytkownika:
- siła łagodna: 0,1 pp za punkt pogorszenia, najwyżej 0,5 pp miesięcznie w klasie;
- poprawa nagradza rządzących w połowie siły: 0,05 pp za punkt, najwyżej 0,25 pp;
- bez dodatkowego członu inflacji dla klas średnich;
- chłopi reagują na ogólną gospodarkę, ale słabiej niż inne klasy.

Z propozycji przyjęto też wskaźnik z płac realnych i bezrobocia (−2 punkty za 1 pp), odpowiedzialność 1/0,5/0 oraz podział według udziałów, także dla odpływu za niewykonanie z 17.4. Udział 1/5 dla chłopów jest interpretacją czwartej decyzji w zapisie; granica ważonej puli to zabezpieczenie techniczne. Obie wartości można zmienić bez zmiany struktury. Przy wdrożeniu trzeba wyłączyć odziedziczone niemieckie reguły poparcia (20.2). Źródło: `PL-M09-LIVING-CONDITIONS-2026-09-25`. Diagnostyka: `analysis/m09-living-conditions/`. Kod gry, zależności i metadane scenariusza bez zmian.

#### 22.16. Zatwierdzone rozwiązanie M10 — 25 IX 2026

Użytkownik odpowiedział na propozycję M10 trzema decyzjami, zatwierdził ich konkretne liczby i zlecił zapis w dokumentacji. Kanoniczny kontrakt: 15.2, 15.3 i 16.1, z odwołaniami w 2.3–2.4, 10.7, 16.2, 16.4, 16.8, 17, 20.2 i 21.1. Decyzje:
- demokracja działa na gotowość wojska i trochę na presję zamachową: 2,5 pp lojalności na 10 punktów od 60 (najwyżej ±10 pp) oraz `0,01 × (60 − demokracja)` presji miesięcznie (najwyżej ±0,5);
- demokracja może rosnąć sama, ale mało: punkt odniesienia 53, czyli +0,06/M w zwykłym Sejmie zamiast +0,15;
- wpływ na wojsko jest łagodny.

Użytkownik przyjął, że składnik presji opóźnia archiwalne próby M02 o 1–3 M, bez utraty żadnej. Bez osobnej decyzji, jako część całej propozycji, przyjęto:
- jeden właściciel autorytetu — dziennik z 12 miesięcy, w którym odpowiedź na wystąpienie Piłsudskiego jest wpisem +1/−2;
- zdarzenia dwóch pustych składników demokracji.

Zawężenie bezprawnych aktów do przemocy wobec instytucji jest decyzją zapisu. Liczenie potwierdzonej represji jako bezprawnego aktu karałoby skargę, która ją ujawnia. Odrzucony wariant: wpływ demokracji na wyborców. Źródło: `PL-M10-AUTHORITY-DEMOCRACY-2026-09-25`. Diagnostyka: `analysis/m10-authority-democracy/`. Kod gry, zależności i metadane scenariusza bez zmian.

#### 22.17. Zatwierdzone rozwiązanie M11 — 25 IX 2026

Użytkownik zatwierdził propozycję M11 dwiema decyzjami i zlecił jej zapis w dokumentacji. Kanoniczny kontrakt: 9.8, z odwołaniami w 2.4, 8.3, 17.4, 17.16 i 21.1. Decyzje:
- po odmowie targowania PPS wybiera: spełnić groźbę albo cofnąć się; cofnięcie kosztuje wiarygodność −5 i do końca gabinetu odbiera groźbie składnik potrzeby;
- ustępstwo wymuszone groźbą obniża o 3 relację z każdą partią, która je przyjęła; perswazja relacji nie zmienia.

Odrzucony wariant: automatyczne zerwanie poparcia po każdej odmowie. Źródło: `PL-M11-THREAT-PERSUASION-2026-09-25`. Diagnostyka: `analysis/m11-threat-persuasion/`. Kod gry, zależności i metadane scenariusza bez zmian.

#### 22.18. Zatwierdzone rozwiązanie M12 — 25 IX 2026

Użytkownik zatwierdził propozycję M12 dwiema decyzjami i zlecił jej zapis w dokumentacji. Kanoniczny kontrakt: 14.4, 14.5 i 17.4, z odwołaniami w 17.16 i 21.1. Decyzje:
- zgoda związku na ugodę czyta koszt kontynuacji, czyli większą z wartości: brak pieniędzy w funduszu albo zmęczenie strajkujących;
- kruchość rządu w rokowaniach strajkowych czyta rzeczywiste poparcie gabinetu i spory w jego umowach, zamiast autorytetu Sejmu.

Odrzucone warianty: koszt kontynuacji tylko z funduszu; kruchość tylko z poparcia. Źródło: `PL-M12-STRIKE-SETTLEMENT-2026-09-25`. Diagnostyka: `analysis/m12-strike-settlement/`. Kod gry, zależności i metadane scenariusza bez zmian.

#### 22.19. Zatwierdzone rozwiązanie M13 — 25 IX 2026

Użytkownik zatwierdził propozycję M13 dwiema decyzjami i zlecił jej zapis w dokumentacji. Kanoniczny kontrakt: 9.5 i 9.6, z odwołaniami w 10.5, 17 i 21.1. Decyzje:
- dyscyplina KPP zależy od relacji i zgodności wspólnych żądań z celem partnera z profilu wydarzenia;
- PPS uzgadnia linię współpracy opcją „Kompromis” w istniejącej karcie „Jedność i kierownictwo”; akceptacja ≥60 znosi karę sprzeciwu Centrum i pozostaje bramką trwałego frontu.

Odrzucony wariant: dyscyplina zależna tylko od relacji. Nie dodano nowej karty ani modelu frakcji KPP. Źródło: `PL-M13-COMMUNIST-DISCIPLINE-2026-09-25`. Diagnostyka: `analysis/m13-communist-discipline/`. Kod gry, zależności i metadane scenariusza bez zmian.

#### 22.20. Zatwierdzone rozwiązanie M15 — 26 IX 2026

Użytkownik zatwierdził propozycję M15 dwiema decyzjami i zlecił jej zapis w dokumentacji. Kanoniczny kontrakt: 13.3 i 13.4, z odwołaniami w 16.8.2, 16.8.3, 17.6 i 21.1. Decyzje:
- AS daje lepsze wykonanie wezwania oraz do trzech równoczesnych akcji przed zamachem (wariant a);
- premia posłuchu wynosi +0,15.

Doprecyzowano też, kiedy działa limit jednej akcji Milicji. Odrzucony wariant: same trzy akcje, bez premii posłuchu. Źródło: `PL-M15-AS-BENEFIT-2026-09-26`. Diagnostyka: `analysis/m15-as-benefit/`. Kod gry, zależności i metadane scenariusza bez zmian.

#### 22.21. Zatwierdzone rozwiązanie M16 — 26 IX 2026

Użytkownik zatwierdził propozycję M16 trzema decyzjami i zlecił jej zapis w dokumentacji. Kanoniczny kontrakt: 10.2, z odwołaniami w 2.4, 10.9, 16.8.7 i 21.1. Decyzje:
- wyborcy odchodzą w tej samej proporcji co członkowie, jak przy czystce;
- sprzeciw pozostałej części frakcji spada o 20;
- posłowie są przypisani do frakcji od wyborów do rzeczywistego transferu.

Zachowano dwie opcje E3 i domyślny brak odchodzącego doradcy. Źródło: `PL-M16-SPLIT-RECALCULATION-2026-09-26`. Diagnostyka: `analysis/m16-split-recalculation/`. Kod gry, zależności i metadane scenariusza bez zmian.

#### 22.22. Zatwierdzone rozwiązanie M06 — 26 IX 2026

Użytkownik zatwierdził propozycję M06 dwiema decyzjami i zlecił jej zapis w dokumentacji. Kanoniczny kontrakt: 7.3 i 7.5, z odwołaniami w 4.5, 7.1 i 21.1. Decyzje:
- w finale dwóch kandydatów wygrywa ten, kto dostał więcej głosów; wstrzymania nie liczą się do większości, remis rozstrzyga losowanie 50/50;
- bezpiecznik: nierozstrzygnięty wybór kończy sekwencję, oddaje graczowi zwykłą turę i planuje nowe głosowanie na następny miesiąc.

Kworum i dwie ważne kandydatury są zapewnione przez obecność wszystkich klubów i walidację profilu. Odrzucony wariant: liczenie wstrzymań i powtórka głosowania przy braku większości. Źródło: `PL-M06-OFFICE-ELECTIONS-2026-09-26`. Diagnostyka: `analysis/m06-office-elections/`. Kod gry, zależności i metadane scenariusza bez zmian.

#### 22.23. Zatwierdzone rozwiązanie M17 — 26 IX 2026

Użytkownik zatwierdził propozycję M17 dwiema decyzjami i zlecił jej zapis w dokumentacji. Kanoniczny kontrakt: 9.5 i 10.4.3, z odwołaniami w 8.1 i 21.1. Decyzje:
- Próchnik i Drobner są obsadą kontynuacji: w rozdziale 1 niedostępni, bez przesuwania ich dat;
- „Otworzyć kontakt” z KPP jest dostępne od relacji 10, a po otwarciu kanału zwykłe rozmowy z 8.1 obejmują KPP.

Odrzucony wariant: wcześniejsza dostępność obu doradców. Źródło: `PL-M17-LATE-ADVISORS-2026-09-26`. Diagnostyka: `analysis/m17-late-advisors/`. Kod gry, zależności i metadane scenariusza bez zmian.

#### 22.24. Zatwierdzone rozwiązanie M18 — 26 IX 2026

Użytkownik zatwierdził propozycję M18 dwiema decyzjami i zlecił jej zapis w dokumentacji. Kanoniczny kontrakt: 13.1, z odwołaniami w 17 i 21.1. Decyzje:
- indeks członkostwa oznacza rzeczywistą skalę partii i może rosnąć do 150, zbliżając się do celu z poparcia robotników i zasięgu związków;
- wpływy z poziomu aparatu wynoszą 0,15 zamiast 0,20 R.

Odrzucone warianty: członkostwo tylko jako utrzymanie bazy z otwarcia; aparat bez zmian. Nie dodano karty rekrutacji. Źródło: `PL-M18-MEMBERSHIP-APPARATUS-2026-09-26`. Diagnostyka: `analysis/m18-membership-apparatus/`. Kod gry, zależności i metadane scenariusza bez zmian.

### 23.4. Zatwierdzone rozwiązanie M19 — 26 IX 2026

Użytkownik zatwierdził propozycję M19 dwiema decyzjami i zlecił jej zapis w dokumentacji. Decyzje:
- historia zostaje w tych samych plikach, w wyraźnie oddzielonym archiwum na końcu; aktualna wersja do kodowania to rozdziały 1–22;
- katalog kart do kodowania, z jedną tabelą na kartę, jest następnym krokiem, rodzina po rodzinie, z przeglądem użytkownika.

Przy porządkowaniu poprawiono dwa nieaktualne zdania: czystka w 10.9 odwołuje się do rozłamu z karty E3, a status M02 w 17.16 podaje zamknięcie M06. W archiwum MECHANICS_MAP jeden odnośnik do 17.10 wskazuje teraz obecny nagłówek. Żadna reguła ani liczba się nie zmieniła. Źródło: `PL-M19-DOCUMENT-STRUCTURE-2026-09-26`. Diagnostyka: `analysis/m19-document-structure/`. Kod gry, zależności i metadane scenariusza bez zmian.

### 23.5. Zatwierdzony katalog kart — 26 IX 2026

Użytkownik zatwierdził propozycję katalogu i zlecił wykonanie go dla wszystkich kart. Decyzje:
- wzór: nagłówek karty, tabela opcji i otwarte pytania; tylko nazwy kart i opcji, bez pełnych tekstów dla gracza;
- osobny plik [POLISH_CARD_CATALOGUE.md](POLISH_CARD_CATALOGUE.md), sprawdzany skryptem zgodności z referencją;
- kolejność partii od kart stanowisk; wszystkie partie powstały od razu jako szkic do przeglądu;
- obecnej linii w kartach stanowisk nie wybiera się ponownie, a zamknięcie karty jest bezpłatne (10.5, 10.10);
- profil testowy frakcji `faction_stance_profile_v1` wyłącznie z tego, co dokumentacja już mówi (10.5).

Katalog obejmuje 69 pozycji i wypisuje 45 otwartych pytań. Nie zmienia żadnej innej reguły ani liczby. Źródło: `PL-CARD-CATALOGUE-2026-09-26`. Diagnostyka: `analysis/card-catalogue/`. Kod gry, zależności i metadane scenariusza bez zmian.

### 23.6. Rozstrzygnięte pytania partii 1 katalogu — 26 IX 2026

Użytkownik przyjął wszystkie propozycje dla dziewięciu pytań kart stanowisk. W sprawie Bundu wybrał wariant A: Bund zostaje organizacją z własnym zaufaniem, ale nie jest partią. Zapisane reguły:
- kierunek działa przez kampanie i nastawienie organizacji; oferty ocenia się po treści (10.5);
- adresaci kampanii polemicznej: prawica narodowa to ZLN, obrońcy kapitału i ziemiaństwa to partie z ideałem `fiscal` i `land` ≤ −1, przemoc przeciw konstytucji to partia z otwartą sprawą przemocy; bez adresata kampania jest zablokowana (10.6);
- linia wobec Piłsudskiego ogranicza ustępstwa, ale nie jest warunkiem karty 16.7 (10.7, 16.7);
- arbitraż prezydenta PPS przygotowuje tylko przy linii silniejszej prezydentury (7.6, 10.8);
- zakres „rozbudowy zasięgu” i środowiska charakteru partii (10.6);
- ideały testowe na osi autonomii: ZLN −2, pozostałe mniejszości +1, reszta 0 (8.6, 10.8);
- Bund nie jest partią; zaufanie na starcie 50 (5.5);
- potępienie modelu sowieckiego nie wywołuje reakcji frakcji (10.10).

Otwarta zostaje uwaga z pytania 4.5: niewiele działań buduje zasięg poza robotnikami. Przeniesiono ją do pytań karty „Praca organizacyjna” (katalog 5.7). Źródło: `PL-CARD-CATALOGUE-BATCH1-2026-09-26`. Diagnostyka: `analysis/card-catalogue/`. Kod gry, zależności i metadane scenariusza bez zmian.

### 23.7. Rozstrzygnięte pytania partii 2 katalogu — 26 IX 2026

Użytkownik przyjął wszystkie osiem propozycji dla dziesięciu pytań partii 2 (zasoby i organizacje partii). Zapisane reguły:
- nie ma płatnych opcji bez skutku: „zachować środki” w karcie Organizacje i „utrzymać” w karcie Składki zastępuje bezpłatne zamknięcie karty (10.5, 13.1, 13.5);
- pierwsza militaryzacja Milicji daje Centrum +3 sprzeciwu; kierunek wzięty z obecnego kodu karty Milicji (13.3);
- karta Media nie ma własnego odnowienia i obejmuje kampanię mobilizacyjną oraz śledztwo prasowe (10.5, 17.2);
- wspólne zebranie o linii politycznej ma ID `union.align` (14.1, 17.2);
- praca organizacyjna daje +2 zasięgu jednej branży albo komórkom jednej wybranej klasy, bez prasy i TUR (4.4, 17.2);
- liczba spółdzielni nie ma osobnego limitu (12.4).

Źródło: `PL-CARD-CATALOGUE-BATCH2-2026-09-26`. Diagnostyka: `analysis/card-catalogue/`. Kod gry, zależności i metadane scenariusza bez zmian.

### 23.8. Rozstrzygnięte pytania partii 3 katalogu — 26 IX 2026

Użytkownik przyjął wszystkie osiem propozycji dla ośmiu pytań partii 3 (relacje, program, jedność i doradcy). W punkcie o ocenie sił najpierw rozważał jej usunięcie, ostatecznie przyjął propozycję. Zapisane reguły:
- bez płatnych opcji bez skutku: identycznego zestawu priorytetów nie da się zatwierdzić, a zwykłe „utrzymać linię” znika z karty Jedność (10.5);
- „Przekonać do odroczenia”: przez 3 M sprawa frakcji nie wywołuje E3, sprzeciw bez zmian; 1 T, raz na sprawę (10.2, 10.5);
- dwa warianty kompromisu z osobnymi kosztami (10.5, 17.2);
- karta Jedność tylko przy sprzeciwie ≥30 albo otwartym kanale z KPP (10.5);
- zmiana doradców to osobna karta (10.4.2, 10.5);
- kontakt z KPP w karcie Stosunki z partiami (`kpp.contact`), dalsze kroki w agendzie „Współpraca z KPP” (`kpp.trial`, `kpp.rules`, `kpp.agreement`) (9.5, 17.2);
- ocena sił bezpieczeństwa jako stałe działanie agendy (16.8.1, 17.2).

Źródło: `PL-CARD-CATALOGUE-BATCH3-2026-09-26`. Diagnostyka: `analysis/card-catalogue/`. Kod gry, zależności i metadane scenariusza bez zmian.

### 23.9. Rozstrzygnięte pytania partii 4 katalogu — 26 IX 2026

Użytkownik przyjął wszystkie siedem propozycji dla sześciu pytań partii 4 (karty parlamentarne) i jednego problemu znalezionego przy okazji. Zapisane reguły:
- „Utrzymać poparcie” tylko jako odpowiedź na ostrzeżenie albo ultimatum (9.8);
- karta Kontrola wojska bez płatnych „wyjaśnień ministra” i „odłożenia” (17.10);
- opcje karty Budżet korzystają z narzędzi 11.9 (17.10);
- karty 3–5 bez odnowienia; odrzuconej oferty nie ponawia się bez zmiany (17.10);
- ograniczona reforma kontroli wojska: kompromis `army=0`, skutek +0,025, obciążenie 1 B przez 2 M (12.4, 16.3, 17.10);
- kompromis listowy: Lewica +3 tylko przy liście, która rezygnuje z programu robotniczego, czyli wcześniejszym Centrolewie (6.5);
- impas po trzech nieudanych propozycjach to stan z gabinetem pełniącym obowiązki (8.7).

Źródło: `PL-CARD-CATALOGUE-BATCH4-2026-09-26`. Diagnostyka: `analysis/card-catalogue/`. Kod gry, zależności i metadane scenariusza bez zmian.

### 23.10. Rozstrzygnięte pytania partii 5 katalogu — 26 IX 2026

Użytkownik przyjął wszystkie dziewięć propozycji dla ośmiu pytań partii 5 (karty rządowe) i jednego problemu znalezionego przy okazji. Zapisane reguły:
- bez płatnych opcji utrzymania, odłożenia i pozostawienia sprawy właścicielom w sześciu kartach rządowych (12.8, 17.11, 17.12);
- układ zbiorowy 0 B; odstępstwo 0 B, presja kapitału −4, niezadowolenie objętych +3 (17.12);
- rozszerzenie osłon: +2 B za poziom zasięgu; skupienie: połowa odbiorców za 1 B (17.12);
- trzy warianty funduszu inwestycyjnego różnią się tym, kto płaci i kto musi się zgodzić (11.9);
- śledztwo 1 T i 1 B przez 1 M; potwierdzone przypisuje sprawę partii (10.6, 17.12);
- usprawnienie poboru należy do karty finansowej (17.2, 17.11, 17.12);
- „obciążyć szerokie grupy” z trzema wariantami i nowa opcja „finansowanie z emisji” (17.11, 17.12);
- ratunek zakładu jako wariant warunkowego kredytu (17.12);
- szkoła świecka bez reakcji frakcji; zostaje naruszenie umowy z partnerem (12.7).

Przy okazji wiersz karty 6 w 17.10 dopasowano do reguły 0.36 z 9.8: „utrzymać poparcie” tylko w odpowiedzi na ostrzeżenie albo ultimatum partnera. Reguła się nie zmienia.

Źródło: `PL-CARD-CATALOGUE-BATCH5-2026-09-26`. Diagnostyka: `analysis/card-catalogue/`. Kod gry, zależności i metadane scenariusza bez zmian.

### 23.11. Rozstrzygnięte pytania partii 6 katalogu — 26 IX 2026

Użytkownik przyjął wszystkie pięć propozycji dla czterech pytań partii 6 (wydarzenia) i jednego problemu znalezionego przy okazji. Zapisane reguły:
- E3 ma ID `party.faction_split`, a kluczem instancji jest `case_id` (10.2, 17.15);
- E6 ma ID `society.strike_settlement_rejection`, a kluczem instancji jest `strike_id + settlement_id` (14.5, 17.15);
- odpowiedź na krytykę parlamentu przez Piłsudskiego jest obowiązkowa, bez opcji „milczeć” (10.7, 17.3);
- wiersz `cabinet.austerity_1926` w 17.3 odsyła do czterech odpowiedzi 9.8, zgodnie z 17.13 i 17.16.4;
- odpowiedź na krytykę parlamentu przeczy trwałej linii tylko przy „Poprzeć krytykę parlamentaryzmu” i `form_of_power=parliamentarism`; reaguje Centrum, +3 (10.7).

Po tej partii katalog nie ma otwartych pytań. Źródło: `PL-CARD-CATALOGUE-BATCH6-2026-09-26`. Diagnostyka: `analysis/card-catalogue/`. Kod gry, zależności i metadane scenariusza bez zmian.

### 23.12. Kategorie kolejki siedmiu wydarzeń — 26 IX 2026

Użytkownik zatwierdził bez zmian siedem kategorii kolejki, które katalog kart przypisał na podstawie opisu 4.5 (dopisek „wniosek z 4.5”). Zapis: tabela w 4.5 i test „Kolejność kategorii wydarzeń” w 21.1.

Użytkownik odłożył na później badania historyczne pięciu punktów oznaczonych `TBD — historical research required`. Do tego czasu gra używa oznaczonych wartości testowych.

Źródło: `PL-CARD-CATALOGUE-QUEUE-2026-09-26`. Diagnostyka: `analysis/card-catalogue/`. Kod gry, zależności i metadane scenariusza bez zmian.

### 23.13. Plan implementacji i decyzje techniczne — 26 IX 2026

Użytkownik poprosił o kompleksowy plan implementacji rozdziału 1 i podjął trzy decyzje:
- kod reguł w osobnym module JavaScript w `source/rules/`, kopiowanym przy budowaniu i wczytywanym przez stronę i testy (20.1);
- teksty dla gracza na razie tylko po angielsku (20.1);
- zapis bez zgodnej wersji schematu wymaga nowej gry, bez migracji (19.3).

Plan: [POLISH_IMPLEMENTATION_PLAN.md](POLISH_IMPLEMENTATION_PLAN.md) (20.3). Zmiany `package.json` i `out/html/index.html` wykona dopiero etap 0. Źródło: `PL-IMPLEMENTATION-PLAN-2026-09-26`. Diagnostyka: `analysis/implementation-plan/`. Kod gry, zależności i metadane scenariusza bez zmian.

### 23.14. Etap 0 wdrożony — 26 IX 2026

Użytkownik zatwierdził cztery decyzje etapu 0:
- stan rozdziału w jednym obiekcie `Q.S` (2.4);
- sprawdzenie zapisu zaraz po wczytaniu w `out/html/game.js` i zabezpieczenie w scenach `main` i `post_event` (19.3);
- obecne testy łapią wszystkie błędy silnika;
- błąd „Return card to hand” poprawia etap 1, a do tego czasu jest jedynym dopuszczonym wyjątkiem w teście przejść.

Wdrożenie oznaczono jako K w 2.4, 19.3 i 20.1. Rozgrywka się nie zmieniła: osiem przejść gry, łącznie 15 788 kroków, daje te same sceny, stan poza `Q.S` i stan generatora co wersja sprzed etapu. `npm test`: 97 z 97. Wyniki i ustalenia: rozdział 10 [planu implementacji](POLISH_IMPLEMENTATION_PLAN.md). Źródło: `PL-STAGE0-FOUNDATION-2026-09-26`. Zależności i metadane scenariusza bez zmian.

### 23.15. Etap 1 wdrożony — 26 IX 2026

Użytkownik zatwierdził cztery decyzje etapu 1:
- odziedziczone karty dostają wspólne rozwiązanie bez edycji każdej z nich: zamknięcie z pierwszej strony karty cofa jej otwarcie;
- dobieranie kart przez nakładkę na silnik, równomiernie wśród legalnych kart posortowanych po ID, z zapisanym rzutem;
- darmowe odrzucenie karty raz w miesiącu w stałej karcie;
- przekierowanie doradcy do karty za 0 T, bez zwrotu akcji doradcy.

Przy wdrożeniu doszły trzy uzupełnienia w granicach tych decyzji: „Back to main” z pierwszej strony karty działa jak „Close card”; „Discard a card” jest widoczna przez cały miesiąc, dopóki odrzucenie jest dostępne; doradca zwalnia z kosztu cały przekierowany krok, także kartę otwieraną z pierwszej. Rozliczenie miesiąca zachowuje dotychczasową kolejność odziedziczonego bloku.

Wdrożenie oznaczono jako K w 4.2–4.6. `npm test`: 122 z 122. Wyniki i ustalenia: rozdział 11 [planu implementacji](POLISH_IMPLEMENTATION_PLAN.md). Źródło: `PL-STAGE1-TURN-2026-09-26`. Zależności i metadane scenariusza bez zmian.

### 23.16. Etap 2 wdrożony — 26 IX 2026

Użytkownik zatwierdził pięć decyzji etapu 2:
- karta 7.7 katalogu i test „Kompromis listowy a Lewica” przechodzą do etapu 3, a test „C4” do etapu 4;
- wybory marszałka i prezydenta liczymy z głosów klubów według testowego profilu `office_profiles_1922_v1` (P);
- luki referencji wypełniają uproszczenia P: kandydaci na marszałka, warunki w wersji sprawdzalnej, mandat po wyborze posła na prezydenta, „ważne głosy” i marszałek senior; warunki i skutki z późniejszych systemów wchodzą razem z tymi etapami;
- rozdział kończy się po zatwierdzeniu następnych wyborów, z minimalnym raportem;
- nowy plik reguł `polish_institutions.js`, a liczenie mandatów przeniesione do niego bez zmiany wyników.

Wdrożenie oznaczono jako K w 2.4, 6.1, 6.3, 6.4, 7.1, 7.3–7.5, 19.1, 19.2, 20.1 i 20.2, a przesunięcia jako Z w 6.5 i 7.2. `npm test`: 144 z 144. Wyniki i ustalenia: rozdział 12 [planu implementacji](POLISH_IMPLEMENTATION_PLAN.md). Źródło: `PL-STAGE2-INSTITUTIONS-2026-09-26`. Zależności i metadane scenariusza bez zmian.

### 23.17. Etap 3 wdrożony — 26 IX 2026

Użytkownik zatwierdził siedem decyzji etapu 3:
- trzy części 3a–3c, każda z budowaniem, testami i krótkim raportem;
- relacje z PPS w `S.actors`, pola `Q.<partia>_relation` jako kopie i dwa segmenty mniejszości z 5.5;
- kandydaci na premiera według profilu P z oknami historycznymi +8 z 8.7 (H);
- stałe programy minimum układów i automatyczny podział resortów;
- obietnice czekające na etap 4 bez terminu i napięcia oraz jeden testowy program P;
- karta 9.1 katalogu przechodzi do etapu 7;
- uproszczenia P dla prognozy głosów, kolejności formowania, okna list, wskaźników kryzysu i wniosku o odwołanie.

Wdrożenie oznaczono jako K w 2.4, 5.5, 6.5, 7.1, 7.5, 8.3, 8.5–8.8, 9.2–9.4, 9.8, 10.4.3, 17.4, 20.1.1 i 20.2. `npm test`: 185 z 185. Wyniki i ustalenia: rozdział 13 [planu implementacji](POLISH_IMPLEMENTATION_PLAN.md). Źródło: `PL-STAGE3-GOVERNMENT-2026-09-26`. Zależności i metadane scenariusza bez zmian.

### 23.18. Etap 4 wdrożony — 27 IX 2026

Użytkownik zatwierdził pięć decyzji etapu 4:
- presje scenariusza z 17.16.2 i gospodarcza część przeglądu gabinetu (17.16.4) wchodzą teraz, a oś polityczna 17.16.3 w etapie 8;
- przepływ 5.6 i odpływ 17.4 działają na istniejących wierszach klas; wiersz bezrobotnych czyta wskaźnik robotników, wiersz mniejszości średnią wskaźników klas ważoną ich wielkością, a waga `Q.unemployed` wynosi stale 3; test „Populacja” przechodzi do etapu 5;
- punkty programu z etapu 3 dostają konkretne projekty, terminy i reguły P, a `ppsResponsible` rozróżnia resorty (5.4);
- opcje zależne od systemów późniejszych etapów są widoczne i zablokowane z powodem, ich skutki czekają w `pending_effects` projektu, a zależne od nich testy przechodzą do etapów 5–7;
- karta Budżet jest dostępna, gdy konkretny pakiet finansowy gabinetu czeka na głosowanie; nie ma budżetu rocznego.

Wdrożenie oznaczono jako K w 2.4, 4.2, 4.5, 5.4, 5.6, 7.2, 7.6, 8.5, 8.6, 9.1, 9.7, 11.1, 11.3, 11.9, 12.2, 17.4, 17.10, 17.11, 17.15, 17.16.2, 17.16.4 i 20.2. `npm test`: 251 z 251. Wyniki, uproszczenia P i luki: rozdział 14 [planu implementacji](POLISH_IMPLEMENTATION_PLAN.md). Źródło: `PL-STAGE4-ECONOMY-2026-09-27`. Zależności i metadane scenariusza bez zmian.

### 23.19. Etap 5 wdrożony — 27 IX 2026

Użytkownik zatwierdził trzy decyzje etapu 5:
- 54 rozłączne komórki elektoratu od razu, z preferencjami dobranymi tak, by wynik krajowy otwarcia był dokładnie taki jak przed etapem; wiersze klas stają się kopiami (5.1–5.2);
- trzy branże `S.unions` już w etapie 5, z wartościami z 3.2 i funduszem z 14.1; gotowość, spory, strajki i osłony Grabskiego zostają w etapie 6;
- żądanie karty E3 cofa zapisaną odwracalną przyczynę sprzeciwu o największym udziale; bez takiej przyczyny karty nie ma (10.2).

Wdrożenie oznaczono jako K w 2.4, 4.2, 4.4, 4.5, 5.1–5.6, 7.6, 8.6, 9.5, 9.8, 10.1–10.3, 10.4.2–10.4.4, 10.5–10.10, 13.1–13.5, 14.1, 17.4 i 20.2. `npm test`: 327 z 327. Wyniki, uproszczenia P i luki: rozdział 15 [planu implementacji](POLISH_IMPLEMENTATION_PLAN.md). Źródło: `PL-STAGE5-PARTY-2026-09-27`. Zależności i metadane scenariusza bez zmian.

### 23.20. Etap 6 wdrożony — 27 IX 2026

Użytkownik zatwierdził trzy decyzje etapu 6:
- niezadowolenie z 15.1 zostaje w etapie 7; sprawę strajkową otwierają droga płacowa z 17.16.5, odrzucone żądanie i własny strajk z agendy związków, a skutki dla niezadowolenia sprawa zapisuje raz dla etapu 7;
- zakład trafia do zapisu przez problem istniejących systemów (kryzys kredytowy, aktywna reakcja przedsiębiorców, strajk zakończony wyczerpaniem); zapis jest syntetyczny, bez nazw, a przejęcie wymaga ustawy;
- reakcja władz wynika z profilu gabinetu, minister PPS zastępuje ją tylko w swoim zakresie, starcie losuje się raz na fazę, ochrona Milicji kosztuje 0,5 R i traci w starciu 2% ludzi; przemoc i narażenie czekają na etap 7.

W części 6a użytkownik wybrał też kolejność księgi z M18: członkostwo zbliża się do celu przed liczeniem wpływów (13.1).

Wdrożenie oznaczono jako K w 2.4, 4.2, 4.5, 5.5, 9.6–9.8, 10.4.3, 11.4, 11.7, 12.4, 13.1, 14.1–14.5, 16.5, 17.4, 17.5, 17.5.1, 17.11, 17.12, 17.12.5, 17.16.5 i 20.2. `npm test`: 360 z 360. Wyniki, uproszczenia P i luki: rozdział 16 [planu implementacji](POLISH_IMPLEMENTATION_PLAN.md). Źródło: `PL-STAGE6-UNIONS-2026-09-27`. Zależności i metadane scenariusza bez zmian.

### 23.21. Etap 7 wdrożony — 27 IX 2026

Użytkownik zatwierdził trzy decyzje etapu 7:
- trzy datowane wejścia scenariusza jako profil testowy `normal_chapter1_v1`: spór Naczelnika z Ponikowskim w VI 1922 (B1 i wystąpienie B2); sprawa wojskowa od I 1925 (wejście testowe; historyczna data: TBD — historical research required), zamykana dopiero wykonaną umową z Piłsudskim; jeden publiczny epizod nacisku wojska (+8) w pierwszym kryzysie gabinetowym przy otwartej sprawie. Powrót Chjeno-Piasta (+20) wynika z gry, a reszta osi 17.16.3 zostaje w etapie 8;
- historyczna gałąź prezydentury: wybór Narutowicza zawsze kończy się zabójstwem, bez modelu ochrony w rozdziale 1; B4 następuje tylko po potwierdzonej śmierci;
- restrykcje wynikają z istniejących działań: represji strajku (bezprawnej wobec legalnego strajku), konfiskaty prasy i reakcji władz na wykonaną bezprawną przemoc organizacji PPS (odwet B4, starcie z udziałem Milicji). Gabinet represyjny zakazuje Milicji, co jest restrykcją legalną; inne gabinety otwierają sprawę bez zakazu. Przegląd w Sprawiedliwości uchyla tylko restrykcje bezprawne, z demokracją +1 raz.

Etap miał pięć części: 7a (polityka i społeczeństwo), 7b (siły państwa i Piłsudski), 7c (rok 1922 i prezydentura), 7d (zamach F) i 7e (raport, talie i izolacja). Silnik zamachu jest silnikiem M08; przeliczenie 81 układów stron odtwarza 16.8.8, M10 i M15.

Wdrożenie oznaczono jako K w 2.4, 4.2, 4.5, 8.7, 10.7, 13.4, 15.1–15.3, 16.1–16.7, 16.8.8, 17.5–17.7, 17.10–17.12, 17.12.2–17.12.4, 17.12.6, 17.13, 17.16.3, 19.1, 19.2 i 20.2. `npm test`: 417 z 417. Wyniki, uproszczenia P i luki: rozdział 17 [planu implementacji](POLISH_IMPLEMENTATION_PLAN.md). Źródło: `PL-STAGE7-DEMOCRACY-COUP-2026-09-27`. Zależności i metadane scenariusza bez zmian.

### 23.22. Etap 8 wdrożony — 4 X 2026 (ostatni etap)

Użytkownik zatwierdził sześć decyzji planu etapu 8:
- **1A:** cel kalibracji to wzorzec M02 na wspólnych ziarnach.
  - N-A i N-H: próba w co najmniej 2/3 ziaren, z medianą III–VIII 1926.
  - N-B i N-C z wykonaną umową wojskową: bez próby do wyborów 1928 w co najmniej 2/3 ziaren.
  - Do tego kontrole wykonalności 21.2. Maja nie wymuszamy.
- **2A:** elektorat otwarcia skalibrowany do bazowego Sejmu M02, z dokładnością ±5 mandatów na klub.
- **3A:** na ekranach tylko polskie dane:
  - zakładka Defense;
  - wykresy Biblioteki od I 1922;
  - oś czasu 1918–1922 z faktów zapisanych w `HISTORICAL_SOURCES.md` (wdrożona oś zaczyna się od pierwszego zapisanego faktu, 20 II 1919);
  - bez niemieckich zdjęć na polskich kartach.
- **4A:** funkcjonalne teksty angielskie z ekranami G1 i G4, bez notatek roboczych i bez nowej narracji historycznej.
- **5A:** `pilsudski_aligned` to gabinety Śliwińskiego i Piłsudskiego; gabinet mniejszościowy to taki, którego partie nie mają własnej większości (gabinet fachowców się liczy).
- **6B:** badania punktów TBD w części 8f. Każde ustalenie trafia do rejestru i do gry dopiero po zgodzie użytkownika.

4 X 2026 użytkownik:
- przyjął wszystkie dziewięć propozycji raportu badań 8f (w punkcie 9 także A2) i polecił dostroić presję zamachową na wiosnę 1926;
- zatwierdził decyzje A1–A4: dymisja Grabskiego od XI 1925, reguła 8.9 dla NPR, przegląd porozumienia wykonywanego przez gabinet i poprawki automatów strategii;
- zatwierdził poprawki 1–5 i opis ograniczeń 6–12;
- zdecydował, że etap 8 jest ostatnim etapem planu;
- zdecydował, że rozwiązania Sejmu z 7.6 nie wdrażamy, więc legalne wcześniejsze wybory pozostają ograniczeniem rozdziału.

Wdrożenie oznaczono jako K w 5.2, 7.6, 8.6, 8.9, 9.6, 10.5, 15.3, 16.1, 16.8, 16.8.1, 16.8.5, 17.7, 17.10, 17.12.4, 17.16.3, 17.16.6, 17.16.11, 19.2 i 21.2. `npm test`: 438 z 438. Pomiar: [`analysis/stage8-campaigns/REPORT.md`](../analysis/stage8-campaigns/REPORT.md); badania: [`analysis/stage8-research/REPORT.md`](../analysis/stage8-research/REPORT.md). Wyniki, uproszczenia P i ograniczenia gotowego rozdziału: rozdział 18 [planu implementacji](POLISH_IMPLEMENTATION_PLAN.md). Źródła: `PL-STAGE8-NORMAL-SCENARIO-2026-10-04` i osiem wpisów badań 8f w `HISTORICAL_SOURCES.md`. Zależności bez zmian; schemat stanu 8 bez zmian.
