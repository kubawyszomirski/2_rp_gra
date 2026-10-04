# Plan implementacji rozdziału 1

**Stan — referencja 0.53, 4 października 2026. Wszystkie etapy 0–8 wykonane; etap 8 był ostatni, a pierwszy rozdział jest wdrożony w całości (rozdział 18). Po planie gra dostała polską wersję językową (rozdział 19), potwierdzanie obecnej linii (rozdział 20) nazwę Centralnego Komitetu Wykonawczego dla doradców (rozdział 21) i nowe opisy wyborów (rozdział 22).** Plan opisuje, w jakiej kolejności i jakimi zmianami w kodzie wdrożono pierwszy rozdział gry. Reguły gry podaje [referencja techniczna](POLISH_TECHNICAL_REFERENCE.md), a karty — [katalog kart](POLISH_CARD_CATALOGUE.md). Plan nie tworzy reguł: przy rozbieżności obowiązuje referencja. Sam plan niczego jeszcze nie zmienia w grze. Każdy etap zaczyna się dopiero po zatwierdzeniu jego szczegółowego planu.

## 1. Jak czytać plan

- Plan rozwija kolejność z [referencji, 20.3](POLISH_TECHNICAL_REFERENCE.md#203-kolejność-ograniczonych-wdrożeń) w dziewięć etapów, od 0 do 8. Etap 0 to fundament techniczny. Punkt 5 z 20.3 dzielimy na partię (etap 5) oraz związki i strajki (etap 6).
- Każdy etap ma: cel, zakres w referencji, karty z katalogu, pliki, dane stanu, kroki, stare mechanizmy do wyłączenia, testy i warunek ukończenia.
- Dodatki zbierają przypisania: karty katalogu (A), testy z 21.1 (B), niebezpieczne przecieki z 20.2 (C) i wstępny manifest przejęcia (D). Skrypt [`analysis/implementation-plan/check.cjs`](../analysis/implementation-plan/check.cjs) sprawdza, że każda karta, każdy test i każdy przeciek ma dokładnie jeden etap.
- Oznaczenia jak w referencji: K — kod, Z — zatwierdzone, P — propozycja do testów.
- Wielkość etapu (mała, średnia, duża, bardzo duża) jest orientacyjna i służy tylko do porównania etapów.
- Plik oznaczony „(nowy)” jeszcze nie istnieje; powstanie w danym etapie.

### 1.1. Słowniczek

- **Moduł reguł** — plik JavaScript z obliczeniami reguł, np. budżetu albo oceny oferty. Nie zawiera tekstów scen.
- **Scena** — plik `.dry` w `source/scenes/`: tekst, opcje i krótkie skrypty. Silnik Dendry pokazuje ją graczowi.
- **Stan gry** — wszystkie zapisywane wartości. W Dendry są to „qualities”, w skryptach dostępne jako `Q.…`.
- **Transakcja akcji** — jedna akcja gracza w trzech krokach: podgląd kosztu, zatwierdzenie, rozliczenie. Koszt pobiera się raz.
- **Kolejka wydarzeń** — lista wydarzeń należnych w miesiącu, rozstrzyganych w stałej kolejności.
- **Manifest przejęcia** — wpis mówiący, kto przejmuje daną dziedzinę gry i które stare niemieckie zapisy trzeba wtedy wyłączyć (20.2).
- **Test jednostkowy** — sprawdza jedną funkcję modułu reguł na liczbach z referencji, bez uruchamiania gry.
- **Test silnika** — uruchamia prawdziwą grę Dendry z `out/game.json` i sprawdza przebieg. Tak działają obecne testy.
- **Test w przeglądarce** — szybkie przejście gry w prawdziwej przeglądarce (`tests/sejm-browser-smoke.cjs`).

## 2. Zatwierdzone decyzje (Z — 0.40)

1. **Kod reguł w osobnym module.** Obliczenia trafiają do zwykłego pliku JavaScript w `source/rules/`, bez nowych zależności i bez kompilatora.
   - `npm run build` kopiuje go do `out/html/`, strona wczytuje go przed `core.js`, a testy Node wczytują go bezpośrednio.
   - Sceny Dendry wywołują go w skryptach i w warunkach `{! … !}`.
   - Wymaga to zmiany skryptu `build` w `package.json` i pliku `out/html/index.html`. Użytkownik zgodził się na obie zmiany; wprowadza je dopiero etap 0.
   - Silnik, język programowania i interfejs pozostają bez zmian (20.1).
2. **Na razie tylko angielski.** Wszystkie nowe teksty dla gracza — tytuły, opisy, opcje i komunikaty — powstają po angielsku, jak obecne sceny. *Zastąpione w 0.50: gra ma też wersję polską (rozdział 19).*
   - Polskie nazwy własne osób, partii i instytucji zostają.
   - Identyfikatory w kodzie są w ASCII, jak w referencji.
   - Dokumentacja projektu pozostaje po polsku. Tłumaczenie gry to osobna decyzja na później.
3. **Stare zapisy gry wymagają nowej gry.** Zapis bez zgodnej wersji schematu (`S.meta.schema_version`), w tym każdy zapis sprzed przebudowy, nie jest migrowany. Gra pokazuje komunikat i proponuje nową grę (19.3).

Wcześniej zatwierdzone w referencji:
- kolejność wdrożeń (20.3);
- wyłączanie starej mechaniki dziedzina po dziedzinie, w tej samej zmianie (20.2);
- brak zmiany silnika (20.1) i brak edycji zależności.

Decyzje etapu 0 (Z — 0.41):
- stan rozdziału w jednym obiekcie `Q.S`;
- sprawdzenie zapisu zaraz po wczytaniu w `out/html/game.js` oraz zabezpieczenie w scenach `main` i `post_event`;
- obecne testy łapią wszystkie błędy silnika i korzystają z zastępnika przeglądarki;
- błąd „Return card to hand” poprawia etap 1; do tego czasu jest jedynym dopuszczonym wyjątkiem w teście przejść.

Decyzje etapu 1 (Z — 0.42):
- odziedziczone karty dostają wspólne rozwiązanie, bez edycji każdej z nich: zamknięcie z pierwszej strony karty cofa jej otwarcie, a nowe polskie karty dostaną pełną transakcję;
- dobieranie kart przez nakładkę na silnik: równomiernie wśród legalnych kart posortowanych według ID, z zapisanym rzutem;
- darmowe odrzucenie karty raz w miesiącu w stałej karcie „Discard a card”;
- przekierowanie doradcy do karty za 0 T, bez zwrotu akcji doradcy.

Decyzje etapu 2 (Z — 0.43):
- karta 7.7 i test „Kompromis listowy a Lewica” przechodzą do etapu 3, a test „C4” do etapu 4, bo zależą od systemów tych etapów;
- wybory marszałka i prezydenta liczy się z głosów klubów według testowego profilu `office_profiles_1922_v1` (P; referencja 7.3 i 7.5);
- luki referencji wypełniają jawne uproszczenia P, a warunki i skutki z późniejszych systemów wchodzą razem z tymi etapami;
- rozdział kończy się minimalnym raportem po zatwierdzeniu następnych wyborów;
- drugi plik reguł `source/rules/polish_institutions.js`, a liczenie mandatów przeniesione do niego bez zmiany wyników.

Decyzje etapu 3 (Z — 0.44):
- trzy części 3a–3c, każda z budowaniem, testami i krótkim raportem;
- relacje z PPS przechowuje `S.actors`, a pola `Q.<partia>_relation` są kopiami; blok mniejszości dzieli się na reprezentację żydowską (1/3 mandatów) i pozostałe mniejszości (2/3), obie z relacją 50;
- kandydaci na premiera według profilu P: premier partyjny z profilem swojej partii, fachowiec z profilem neutralnym, okna historyczne z 8.7 (H) dają +8 w rankingu; gabinet Piłsudskiego należy do etapu 7;
- każdy układ ma stały program minimum; gracz wybiera układ, premiera, udział PPS, prośbę o poparcie mniejszości i resorty PPS, a partnerzy dostają swoje resorty automatycznie;
- obietnice wymagające programów z etapu 4 czekają w umowie bez terminu i bez napięcia; działają obietnice poparcia i jeden testowy program P, używany tylko w testach;
- karta 9.1 katalogu (kryzys gabinetowy 1922) przechodzi do etapu 7;
- luki referencji wypełniają uproszczenia P: prognoza głosów, kolejność formowania, okno list, wskaźniki kryzysu równe 0 do etapów 4 i 7 oraz wniosek o odwołanie tylko po wycofaniu poparcia przez partnera.

Decyzje etapu 4 (Z — 0.45):
- trzy części 4a–4c, każda z budowaniem, testami i krótkim raportem;
- datowane presje gospodarcze z 17.16.2 i gospodarcza część przeglądu gabinetu z 17.16.4 wchodzą już w etapie 4, bo bez nich gospodarka i wydarzenia 9.11–9.13 by nie działały; oś polityczna 17.16.3 (Śliwiński, oferta Chjeno-Piasta z 1923 i dalsze) zostaje w etapie 8;
- przepływ poparcia z warunków życia (5.6, M09) i odpływ rozczarowanych (17.4) działają na istniejących wierszach klas, zanim etap 5 wprowadzi komórki; wiersz „bezrobotni” czyta wskaźnik robotników, wiersz „mniejszości” średnią wskaźników klas ważoną ich wielkością (P); waga bezrobotnych w wyborach zostaje 3; test „Populacja” przechodzi do etapu 5;
- punkty programu z umów etapu 3 dostają konkretne projekty, terminy P (pierwsza transza ziemska do t+6, osłona do t+4, szkoły mniejszości do t+6) i reguły przeciw sprzecznym decyzjom; brak wykonania przez resort, którego PPS nie ma, nie jest złamaną obietnicą PPS (5.4);
- opcje wymagające systemów późniejszych etapów są widoczne i zablokowane z powodem; ich skutki w tych systemach zostają w rekordzie projektu (`pending_effects`); testy, które da się uruchomić w pełni dopiero później, przechodzą do etapów 5–7 (dodatek B);
- karta Budżet działa, gdy przed głosowaniem Sejmu czeka konkretny pakiet finansowy gabinetu; referencja nie ma corocznego budżetu i go nie dodajemy.

Decyzje etapu 5 (Z — 0.46):
- cztery części 5a–5d, każda z budowaniem, testami i krótkim raportem;
- elektorat to od razu 54 rozłączne komórki: klasa × tożsamość (70/10/20) × zatrudnienie × duże miasto; preferencje startowe dobrano tak, by wynik krajowy otwarcia był dokładnie taki jak przed etapem, a wiersze klas są już tylko kopiami (5.1–5.2);
- trzy branże związków (przemysł, kolej, praca rolna) z wartościami z 3.2 i funduszem z 14.1 wchodzą już w etapie 5, bo potrzebują ich kampanie, cel członkostwa i rozbudowa organizacji; gotowość, spory, strajki, ugody i osłony Grabskiego zostają w etapie 6;
- żądanie karty E3 cofa zapisaną odwracalną przyczynę sprzeciwu frakcji o największym udziale: linię z karty stanowiska, popularny format prasy, układ z KPP albo udział w gabinecie lub jego poparcie, gdy sprzeciw wywołała jego polityka; bez takiej przyczyny karty nie ma, a wysoki sprzeciw działa przez spójność i posłuch (10.2).

Decyzje etapu 6 (Z — 0.47):
- trzy części 6a–6c, każda z budowaniem, testami i krótkim raportem;
- niezadowolenie (15.1) zostaje w etapie 7: sprawę strajkową otwierają droga płacowa z 17.16.5, odrzucone żądanie i własny strajk z agendy związków; skutki dla niezadowolenia sprawa zapisuje raz w `S.strikes.pending_effects`, a zastosuje je etap 7;
- zakład trafia do zapisu przez problem istniejących systemów: kryzys kredytowy i aktywna reakcja przedsiębiorców zapisują zagrożony zakład w przemyśle, a strajk zakończony wyczerpaniem — w swojej branży; zapis jest syntetyczny, bez nazw i historycznych zakładów; przejęcie wymaga ustawy;
- reakcja władz wynika z profilu gabinetu (P), a minister PPS zastępuje ją tylko w swoim zakresie (Praca prowadzi mediację, MSW dysponuje policją); starcie losuje się raz na fazę sprawy; ochrona Milicji kosztuje 0,5 R, a w starciu Milicja traci 2% przydzielonych ludzi; przemoc i narażenie na represje sprawa zapisuje dla etapu 7;
- w księdze partii najpierw członkostwo zbliża się do celu, a potem liczymy wpływy ze składek, jak w M18 (decyzja użytkownika w części 6a, test „Otwarcia finansowe”).

Decyzje etapu 7 (Z — 0.48):
- pięć części 7a–7e, każda z budowaniem, testami, kontrolami i krótkim raportem;
- trzy datowane wejścia scenariusza jako profil testowy `normal_chapter1_v1`: spór Naczelnika z Ponikowskim w VI 1922 (B1 i wystąpienie B2); sprawa wojskowa od I 1925 (wejście testowe, historyczna data: TBD — historical research required), zamykana dopiero wykonaną umową z Piłsudskim; jeden publiczny epizod nacisku wojska (+8) w pierwszym kryzysie gabinetowym przy otwartej sprawie; powrót Chjeno-Piasta (+20) wynika z gry, a reszta osi 17.16.3 zostaje w etapie 8;
- historyczna gałąź prezydentury: wybór Narutowicza zawsze kończy się zabójstwem; ochrony prezydenta rozdział 1 nie modeluje, a B4 następuje tylko po potwierdzonej śmierci;
- restrykcje wynikają z istniejących działań: represji strajku (bezprawnej wobec legalnego strajku), konfiskaty prasy i reakcji władz na wykonaną bezprawną przemoc organizacji PPS (odwet B4, starcie z udziałem Milicji); gabinet represyjny zakazuje Milicji (restrykcja legalna), inne gabinety otwierają sprawę bez zakazu; każda restrykcja ma profil prawny, a przegląd w Sprawiedliwości uchyla tylko bezprawne, z demokracją +1 raz.

Decyzje etapu 8 (Z — 0.49):
- **1A:** cel kalibracji to wzorzec M02 na wspólnych ziarnach, plus kontrole wykonalności 21.2. Maja nie wymuszamy.
  - N-A i N-H: próba w co najmniej 2/3 ziaren, mediana III–VIII 1926.
  - N-B i N-C z wykonaną umową wojskową: bez próby do wyborów 1928 w co najmniej 2/3 ziaren.
- **2A:** strojenie preferencji i frekwencji komórek otwarcia, a nie krzywej mandatów. Bierna PPS ma dostać bazowy Sejm M02 z dokładnością ±5 mandatów na klub.
- **3A:** na ekranach tylko polskie dane:
  - zakładka Defense: Milicja, AS, policja i znane przedziały wojska;
  - wykresy Biblioteki od I 1922;
  - polska oś czasu 1918–1922, tylko z faktów zapisanych w `HISTORICAL_SOURCES.md` (wdrożona oś zaczyna się od pierwszego zapisanego faktu, 20 II 1919);
  - bez niemieckich zdjęć na polskich kartach; pliki zostają, nowych obrazów nie dodajemy.
- **4A:** funkcjonalne teksty angielskie: ekrany G1 i G4, bez dopisków „(stage N)”, „temporary” i „in transition”, bez nowej narracji historycznej.
- **5A:** `pilsudski_aligned` to gabinety Śliwińskiego i Piłsudskiego. Gabinet mniejszościowy to taki, którego partie nie mają własnej większości; gabinet fachowców też się liczy.
- **6B:** badania punktów TBD w części 8f. Każde ustalenie trafia do rejestru i do gry dopiero po zgodzie użytkownika.
- **4 X 2026, wyniki 8f:** użytkownik przyjął wszystkie dziewięć propozycji badań (w punkcie 9 także A2) i polecił dostroić presję zamachową na wiosnę 1926.
- **4 X 2026, decyzje A1–A4:**
  - A1: dymisja Grabskiego od XI 1925, gdy rządzi w kryzysie kredytowym lub walutowym (datowane wejście);
  - A2: reguła 8.9 dla NPR;
  - A3: przedłużanie porozumienia wykonywanego przez gabinet;
  - A4: poprawki automatów strategii.
- **4 X 2026, domknięcie:** poprawki 1–5 i opis ograniczeń 6–12 (rozdział 18). Etap 8 jest ostatnim etapem planu.
- **4 X 2026, wcześniejsze wybory:** rozwiązania Sejmu z 7.6 nie wdrażamy; legalne wcześniejsze wybory pozostają nieosiągalne (ograniczenie z rozdziału 18).

## 3. Stan wyjściowy kodu (K, 26 IX 2026)

### 3.1. Budowanie i testy

- **Silnik:** `dendrynexus` z przypiętego commitu w `package.json`. Środowisko: Node.js 22.21.1 i npm 10.9.4.
- **`npm run build`:**
  - `dendrynexus make-html` kompiluje pliki `.dry` z `source/` do `out/game.json`; innych plików w `source/` nie czyta;
  - potem skrypt kopiuje D3 do `out/html/d3.v7.min.js`, a obrazy z `assets/img/` do `out/html/img/`.
- **`npm test`** (`node --test tests/*.test.js`): obecnie 83 testy w czterech plikach:
  - `tests/sejm-election.test.js`;
  - `tests/polish-opening-state.test.js`;
  - `tests/polish-party-system.test.js`;
  - `tests/polish-presidential-sequence.test.js`.
  Testy uruchamiają prawdziwy silnik na zbudowanym `out/game.json`, więc przed nimi trzeba zbudować grę.
- **Test w przeglądarce:** `tests/sejm-browser-smoke.cjs`.

### 3.2. Jak działa kod scen

- **Treść:** w `source/scenes/` jest 18 scen głównych, 40 doradców (`source/scenes/advisors/`), 79 wydarzeń (`source/scenes/events/`), 22 karty rządowe (`source/scenes/government_affairs/`) i 20 kart partyjnych (`source/scenes/party_affairs/`). Osobno jest 8 wskaźników w `source/qdisplays/`.
- **Skrypty:** silnik zamienia każdy skrypt sceny na osobną funkcję (`new Function('state', 'Q', …)` w `node_modules/dendrynexus/lib/engine.js`). Nie ma wspólnej biblioteki kodu. Wspólne fragmenty wywołuje się przez `call:`, np. `polish_opening_state` z `source/scenes/main.scene.dry`.
- **Błędy:** silnik łapie błędy skryptów i tylko je loguje. Obecne testy nie przechodzą, gdy pojawi się taki komunikat; nowe testy zachowają tę zasadę.
- **Warunki:** `view-if` i `choose-if` mogą być blokiem JavaScript `{! … !}`, jeśli nie zawierają nic poza nim (`node_modules/dendrynexus/lib/parsers/validators.js`). Dzięki temu warunki mogą pytać moduł reguł o złożony stan.
- **Wydarzenia:** wydarzenia miesiąca wybiera `source/scenes/post_event.scene.dry` z listy `- #event`, czyli spośród scen z tagiem `event` ze spełnionymi warunkami. Tam też co miesiąc maleją liczniki `…_timer` z listy `Q.timers`.

### 3.3. Co już działa po polsku

- **Otwarcie 1922:** partie, frakcje, doradcy, Milicja i stan początkowy są w `source/scenes/root.scene.dry`. Spójność gabinetu otwarcia pilnuje `source/scenes/polish_opening_state.scene.dry`.
- **Wybory do Sejmu w listopadzie 1922** (444 mandaty, większość 223): `source/scenes/sejm_election.scene.dry`, `source/scenes/sejm_election_result.scene.dry` i `source/scenes/election_algorithm.scene.dry`.
- **Wybór prezydenta w grudniu 1922** (Zgromadzenie Narodowe z migawką Senatu): `source/scenes/polish_presidential_sequence.scene.dry`.
- **Partia i otoczenie:** 9 partii, 3 frakcje PPS, polscy doradcy i Milicja PPS. Niektóre niemieckie gałęzie są już wyłączone, np. trzy niemieckie rozłamy frakcji.

Szczegóły podaje [TRANSITION_MATRIX.md](../TRANSITION_MATRIX.md) w części „What exists today”. Żaden okres od początku do końca nie jest jeszcze potwierdzony jako spójna polska gra.

### 3.4. Co zostało z niemieckiej gry

- **Gospodarka:** `budget` w 37 plikach, `inflation` w 31, `unemployment` w 23, m.in. w `post_event`, `root`, `status`, kartach rządowych i wydarzeniach.
- **Poparcie i zamach:** poparcie republiki `pro_republic` w 43 plikach, zamach `coup_progress` w 19.
- **Rozpad koalicji:** `coalition_dissent` w 44 plikach. Pełne listy są w dodatku E.
- **Odnowienia:**
  - licznik `Q.advisor_action_timer` w `source/scenes/main.scene.dry` i liczniki kart `…_timer`;
  - cofanie akcji w `source/scenes/cancel_advisor_action.scene.dry`;
  - odrzucanie kart w `source/scenes/easy_discard.scene.dry`.
- **Epilog:** `source/scenes/game_over.scene.dry`, `source/scenes/events/game_over_1934.scene.dry` i `source/scenes/events/1934_end.scene.dry`.
- **Wydarzenia z datą:** ponad 50 niemieckich wydarzeń ma warunek daty, np. `source/scenes/events/1929.scene.dry` i `source/scenes/events/young_plan.scene.dry`.

## 4. Architektura docelowa

### 4.1. Moduł reguł

- **Plik:** `source/rules/polish_rules.js` (nowy). Gdy urośnie, dzielimy go na kilka plików dziedzin w `source/rules/`. Każdy trafia do `out/html/` i jest wczytywany w stałej kolejności.
- **Forma:** zwykły JavaScript działający i w przeglądarce, i w Node. W przeglądarce udostępnia obiekt `PolishRules`, w Node eksportuje go przez `module.exports`. Bez składni `import`, bez bibliotek i bez kroku kompilacji.
- **Budowanie:** skrypt `build` dostaje kopiowanie `source/rules/*.js` do `out/html/`. Kontrola po budowaniu (AGENTS.md) obejmuje też ten plik.
- **Strona:** `out/html/index.html` wczytuje `polish_rules.js` przed `core.js`.
- **Podział pracy (20.1):**
  - funkcje `compute…` i `evaluate…` tylko liczą i zwracają wynik z przyczynami; nie zmieniają stanu;
  - jedna funkcja `apply…` na transakcję zapisuje wynik;
  - te same funkcje sprawdzamy testami jednostkowymi i wywołujemy w grze.
- **Losowość:** moduł nie woła `Math.random()` bezpośrednio. Wynik rzutu bierze z zapisanego rekordu (`S.rng`, 4.6), więc wczytanie gry nie losuje ponownie.

### 4.2. Stan gry

- **Zapis:** dziedziny z 2.4 referencji (`S.meta`, `S.turn`, `S.events`, `S.projects`, `S.agreements`, `S.cabinet` i pozostałe) zapisujemy w stanie Dendry jako obiekty JSON, tak jak dziś `Q.sejm_parliament` i `Q.polish_presidency`. Od etapu 0 jest to jeden obiekt `Q.S` (K).
- **Kto zapisuje:** tylko moduł reguł. Sceny i wskaźniki czytają te dziedziny przez moduł albo przez kilka prostych pól do wyświetlania, które zapisuje ta sama transakcja.
- **Wersja schematu:** `S.meta.schema_version` rośnie przy każdej zmianie kształtu stanu. Zgodnie z decyzją 3 zapis z inną wersją prowadzi do komunikatu i nowej gry.
- **Zapis w środku sekwencji (19.3):** rekord aktywnej transakcji i wydarzenia wystarcza do wznowienia bez ponownego kosztu i losowania.

### 4.3. Sceny Dendry

- **Treść:** sceny zostają warstwą treści: tytuł, tekst po angielsku, opcje i obrazy.
- **Logika:** warunki pytają moduł (`{! return PolishRules.… !}`), a skrypty wywołują jedną transakcję.
- **Stare sceny:** niemieckich scen nie kasujemy (AGENTS.md). Wyłączamy je warunkiem albo usuwamy z listy wyboru w chwili przejęcia ich dziedziny.
- **Wydarzenia:** polskie wydarzenia dostają własny tag, a `post_event` wybiera tylko je. Niemieckie wydarzenia z tagiem `event` przestają się wtedy pojawiać bez masowej edycji ich plików. Sposób sprawdzimy w etapie 1.

### 4.4. Testy

- **Jednostkowe** (`tests/rules-*.test.js`): funkcje modułu na liczbach z 21.1 i z kalkulatorów w `analysis/`.
- **Silnika** (`tests/polish-*.test.js`): prawdziwa gra z `out/game.json`, z zapisem i wczytaniem w środku sekwencji.
  - Nowy wspólny pomocnik `tests/helpers/dendry.js` (nowy) tworzy grę, przewija miesiące, wybiera karty i zapisuje stan.
  - Od etapu 0 obecne testy także łapią wszystkie błędy silnika i korzystają z tego samego zastępnika przeglądarki: `window` z działającym silnikiem i brak `d3`.
- **W przeglądarce:** `tests/sejm-browser-smoke.cjs`, rozszerzany o przebieg każdego ukończonego etapu.
- **Wzorzec liczb:** kalkulatory w `analysis/` (M02–M18). Test jednostkowy powtarza ich przykład i wynik.
- **Przypisanie testów:** test z 21.1 należy do pierwszego etapu, po którym da się go uruchomić w pełnej postaci (dodatek B). Wcześniejsze etapy sprawdzają swoje fragmenty na danych testowych.

### 4.5. Manifest przejęcia

- **Wpis:** każda dziedzina ma wiersz z 20.2: `system_id`, nowy właściciel, stare zapisy do wyłączenia, stare odczyty do dostosowania, migracja, testy i status. Wstępna wersja jest w dodatku D; aktualizujemy ją w każdym etapie.
- **Przejęcie:** wszystkie stare skutki dziedziny wyłączamy w tej samej zmianie. Osobny test sprawdza, że po przejęciu żaden stary zapis nie zmienia nowych wyników.
- **Rejestr wycinków:** [TRANSITION_MATRIX.md](../TRANSITION_MATRIX.md) nadal opisuje wykonane wycinki i granicę spójnej polskiej gry.

## 5. Zasady pracy w każdym etapie

**Przed etapem:** przedstawiam w czacie szczegółowy plan etapu: zakres, pliki, kroki i testy. Koduję dopiero po akceptacji użytkownika.

**W trakcie:**
- jeden ograniczony system naraz; duży etap dzielimy na kroki, każdy z własnym budowaniem i testami;
- liczby P bierzemy dokładnie z referencji i nie stroimy ich przed etapem 8;
- rozbieżność kodu z referencją albo luka w referencji to pytanie do użytkownika, nie cicha zmiana reguły;
- bez nowych zależności, bez `npm audit fix` i bez masowego zastępowania ani zmiany nazw;
- bez ręcznej edycji `out/game.json`, `out/html/core.js` i innych plików generowanych.

**Warunek ukończenia każdego etapu:**
1. `npm run build` kończy się bez błędu.
2. W `out/html/` są D3, obrazy i plik modułu reguł.
3. `npm test` przechodzi w całości, łącznie z testami wcześniejszych etapów.
4. Test w przeglądarce przechodzi przebieg tego etapu.
5. Wiersz manifestu przejęcia ma status „wykonane”, a stare zapisy tej dziedziny są wyłączone.
6. TRANSITION_MATRIX i STATE_VARIABLES opisują nowy stan, a referencja oznacza wdrożone reguły jako K.
7. Użytkownik dostaje raport: co działa, co wyłączono, zmienione pliki, ostrzeżenia i błędy. Commit tylko na prośbę użytkownika.

## 6. Etapy

### Etap 0 — Fundament techniczny

*Wielkość: mała. Bez zmiany rozgrywki.*

**Stan:** wykonany 26 IX 2026 (K). Wynik i ustalenia są w rozdziale 10.

**Cel:** przygotować moduł reguł, nowy stan i narzędzia testów tak, aby gra działała dokładnie jak dziś.

**Zakres w referencji:** 2.1–2.4, 3.1–3.2, 19.3, 20.1, 20.2.

**Karty z katalogu:** brak.

**Pliki:**
- `source/rules/polish_rules.js` (nowy);
- `package.json` (skrypt `build`) i `out/html/index.html`;
- `source/scenes/root.scene.dry` i `source/scenes/main.scene.dry`;
- `tests/helpers/dendry.js` (nowy), `tests/rules-foundation.test.js` (nowy), `tests/polish-foundation.test.js` (nowy).

**Stan:** `S.meta` (wersja schematu, `balance_id`, `scenario_id=normal_chapter1_v1`, ziarno) i puste dziedziny z 2.4.

**Kroki:**
1. Moduł reguł i jego wczytywanie w przeglądarce i w testach. Gra jeszcze go nie wywołuje.
2. Nowa gra zakłada `S.meta` i puste dziedziny z 2.4. Żadna dotychczasowa wartość się nie zmienia.
3. Sprawdzenie wersji schematu przy wczytaniu i scena z komunikatem o niezgodnym zapisie, po angielsku.
4. Wspólny pomocnik testów silnika.
5. Rozpoznanie silnika: ręka, talia, powrót do `main`, liczniki w `post_event` i cofanie w `cancel_advisor_action`. Wynik trafia do planu etapu 1.
6. Uzupełnienie manifestu przejęcia (dodatek D) o pełne listy plików każdej dziedziny.

**Wyłączamy:** nic; etap nie przejmuje żadnej dziedziny.

**Testy z 21.1:** „Jedna trudność”. Własne: stan startowy, zapis i wczytanie oraz niezgodny zapis.

**Gotowe, gdy:** wszystkie dotychczasowe testy przechodzą bez zmian, gra w przeglądarce działa jak przed etapem, a nowa gra ma poprawne `S.meta`.

### Etap 1 — Czas, akcje, karty i kolejka wydarzeń

*Wielkość: średnia. Punkt 1 z 20.3.*

**Stan:** wykonany 26 IX 2026 (K). Wynik i ustalenia są w rozdziale 11.

**Cel:** jeden miesięczny zegar, jedna transakcja na akcję i jedna kolejka wydarzeń jako podstawa wszystkich kart.

**Zakres w referencji:** 4.1–4.6, 17.1, 17.3, 17.9, 19.3. Wspólne zasady kart z rozdziału 2 katalogu.

**Karty z katalogu:** brak; etap buduje mechanizm wspólny dla wszystkich kart.

**Pliki:**
- `source/rules/polish_rules.js`;
- `source/scenes/main.scene.dry` i `source/scenes/post_event.scene.dry`;
- `source/scenes/easy_discard.scene.dry` i `source/scenes/cancel_advisor_action.scene.dry`;
- sceny polskich doradców w `source/scenes/advisors/`;
- `tests/rules-turn.test.js` (nowy) i `tests/polish-turn.test.js` (nowy).

**Stan:** `S.turn` (faza, ostatni rozliczony miesiąc, oczekująca transakcja), `S.cooldowns`, `S.events` i `S.rng`.

**Kroki:**
1. Stała kolejność rozliczenia miesiąca (4.2) z blokadą „raz na miesiąc”. Dziedziny jeszcze nieprzejęte liczy stary kod, ale tylko raz.
2. Transakcja akcji: podgląd, zatwierdzenie, rozliczenie (4.3). Najpierw przenosimy akcje doradców, bo mają już wspólne odnowienie.
3. Ręka z trzema miejscami, sprawdzanie legalności karty i jedno darmowe odrzucenie w miesiącu. Po zatwierdzeniu „powrót” jest tylko nawigacją, bez zwrotu kosztu.
4. Odnowienia zapisane jako daty (`available_at`) zamiast liczników zmniejszanych w `post_event`.
5. Agenda: projekty i obowiązkowe odpowiedzi poza ręką.
6. Kolejka wydarzeń `EventRun` z kategoriami 1–6 i tabelą z 4.5 (0.39):
   - wszystkie należne wydarzenia przed następną akcją;
   - osobny tag polskich wydarzeń w `post_event`.
7. Losowania zapisywane raz (4.6).

**Wyłączamy:** odejmowanie odnowienia doradców przy powrotach do `main` oraz niemieckie wydarzenia uruchamiane samą datą (przecieki 6 i 8 z dodatku C).

**Testy z 21.1:** „Jedna tura”, „Doradca”, „Ręka”, „Rzut”. Własne: kolejność kategorii na wydarzeniach testowych oraz zapis w środku transakcji i wydarzenia.

**Gotowe, gdy:** miesiąc to jedna główna akcja, żaden koszt nie dubluje się po wczytaniu, a niemieckie wydarzenia z datą się nie pojawiają.

### Etap 2 — Wybory, urzędy, głosowania i koniec rozdziału

*Wielkość: średnia, bo wybory 1922 i wybór prezydenta już działały. Punkt 2 z 20.3.*

**Stan:** wykonany 26 IX 2026 (K). Wynik i ustalenia są w rozdziale 12.

**Cel:** przenieść istniejące wybory i urzędy na nowy fundament oraz zakończyć rozdział legalnym zdarzeniem i raportem.

**Zakres w referencji:** 6.1–6.5, 7.1–7.5, 19.1–19.2.

**Karty z katalogu:** 7.8, 7.9, 9.3, 9.16.

**Pliki:**
- `source/rules/polish_institutions.js` (nowy) i `source/rules/polish_rules.js` (schemat 3);
- `source/scenes/sejm_election.scene.dry`, `source/scenes/sejm_election_result.scene.dry` i `source/scenes/polish_opening_state.scene.dry`;
- `source/scenes/polish_speaker_election.scene.dry` (nowy), `source/scenes/polish_presidential_sequence.scene.dry` i `source/scenes/polish_chapter_report.scene.dry` (nowy);
- `source/scenes/main.scene.dry`, `source/scenes/post_event.scene.dry`, `source/scenes/root.scene.dry`, `source/scenes/status.scene.dry` i `source/scenes/library.scene.dry`;
- `out/html/index.html` i `.gitignore`;
- `tests/rules-institutions.test.js` (nowy) i `tests/polish-institutions.test.js` (nowy). Dotychczasowe testy wyborów, prezydenta i otwarcia zmieniły oczekiwania zgodnie z referencją.

**Stan:** `S.parliament`, `S.senate`, `S.ballots` i `S.chapter`. Przy nowej grze wypełniamy je z otwierającego Sejmu.

**Kroki:**
1. Wyniki wyborów zamrożone w jednym rekordzie i wspólna lista w liczeniu mandatów (6.1–6.2). Kartę 7.7 przeniesiono do etapu 3 (decyzja etapu 2).
2. Głosowanie `Ballot` z kworum i większościami (7.1) oraz minimalny Senat (6.4). Procedurę ustawy z 7.2 wdroży etap 4.
3. Wybór marszałka i prezydenta z wyjściami z impasu (M06, 7.3 i 7.5).
4. Następne wybory (`election.successor`, 7.4) i kalendarz bez wcześniejszych wyborów, gdy nie ma aktu rozwiązania.
5. Warunek końca rozdziału (19.1) i prosty raport (19.2) zamiast niemieckiego epilogu.

**Wyłączamy:** odczyt niemieckiego `president`, nadpisywanie mandatów procentami z sondaży i niemiecki epilog (przecieki 4, 5 i 7).

**Wzorzec liczb:** `analysis/m06-office-elections/`.

**Testy z 21.1:** 15 testów z dodatku B, m.in. „Mandaty”, „Senat”, „Granica” i „Raport”.

**Gotowe, gdy:** obecne testy wyborów i prezydenta przechodzą, a rozdział kończy się raportem po legalnym wyniku.

### Etap 3 — Relacje, umowy, gabinety i resorty

*Wielkość: duża; trzy części 3a–3c. Punkt 3 z 20.3.*

**Stan:** wykonany 26 IX 2026 (K). Wynik i ustalenia są w rozdziale 13.

**Cel:** gabinety powstają i upadają przez negocjacje. PPS wchodzi do rządu, toleruje go albo jest w opozycji na podstawie umów.

**Zakres w referencji:** 6.2, 6.5, 8.1–8.9, 9.1–9.4, 9.8, 17.4, 20.1.1.

**Karty z katalogu:** 6.1, 7.1, 7.6, 7.7.

Kartę 9.1 przeniesiono do etapu 7 (decyzja etapu 3).

**Pliki:**
- `source/rules/polish_government.js` (nowy), `source/rules/polish_rules.js` (schemat 4) i `source/rules/polish_institutions.js` (segmenty mniejszości i wspólne listy);
- `source/scenes/polish_cabinet_formation.scene.dry`, `source/scenes/polish_government_support.scene.dry`, `source/scenes/polish_government_response.scene.dry` i `source/scenes/polish_list_agreement.scene.dry` (nowe);
- `source/scenes/polish_opening_state.scene.dry`, `source/scenes/sejm_election.scene.dry`, `source/scenes/sejm_election_result.scene.dry` i `source/scenes/polish_speaker_election.scene.dry`;
- `source/scenes/main.scene.dry`, `source/scenes/post_event.scene.dry`, `source/scenes/root.scene.dry`, `source/scenes/status.scene.dry`, `source/scenes/library.scene.dry` i `source/scenes/polish_presidential_sequence.scene.dry`;
- `source/scenes/party_affairs/inter_party_relationships.scene.dry`, `source/scenes/events/election_1928.scene.dry` i `source/scenes/government_affairs/coalition_affairs.scene.dry`;
- doradcy: `source/scenes/advisors/daszynski.scene.dry`, `source/scenes/advisors/malinowski.scene.dry` i `source/scenes/advisors/ziemiecki.scene.dry`;
- `out/html/index.html` i `.gitignore`;
- `tests/rules-negotiation.test.js` (nowy) i `tests/polish-cabinet.test.js` (nowy) oraz dotychczasowe testy (rozdział 13).

**Stan:** `S.actors`, `S.negotiation`, `S.agreements`, `S.cabinet`, `S.cabinet_crisis` i lista `S.parliament.alliances`.

**Kroki (wykonane):**
1. Relacje, reputacja wykonania i rozmowy (8.1–8.2, 17.4); karta 6.1.
2. Ocena ofert `programFit` z czerwonymi liniami (8.3) i profile partii (8.6).
3. Dziewięć resortów zamiast dziesięciu kluczy `Q.polish_portfolios` (8.5, 20.1.1).
4. Tworzenie gabinetu jedną ofertą (C1), oferty bez PPS, poparcie mniejszości, impas i gabinet pełniący obowiązki (8.4, 8.7–8.8); karta 7.1.
5. Umowy: napięcie raz w miesiącu, ostrzeżenie, ultimatum, przedłużenie i kolejność po wyjściu partnera (9.1–9.4).
6. Stosunek do rządu: targowanie, perswazja, utrzymanie poparcia tylko w kryzysie, wycofanie i głosowanie o odwołanie (9.8, M11, 7.1); karta 7.6.
7. Jeden testowy program P (osłona pracownicza z 9.1) tylko w testach. W grze ta sama obietnica czeka na programy etapu 4.
8. Porozumienie wyborcze (6.2, 6.5; karta 7.7) z oknem list IX–X 1922 i XII 1927–I 1928. W tym samym kroku umowa o komisji z Piastem i reputacja +5 w wyborze marszałka (7.5); wcześniejszych zobowiązań do kandydata na marszałka żadna karta etapu 3 nie tworzy (rozdział 13).

**Wyłączamy:** niemieckie progi automatycznego rozpadu koalicji (`coalition_dissent`) i niemieckie wota nieufności (przeciek 2).

**Wzorzec liczb:** `analysis/m11-threat-persuasion/`, `analysis/m02-negotiations/` i `analysis/m02-political-chain/`.

**Testy z 21.1:** 23 testy z dodatku B, m.in. „Oferta”, „Umowa”, „Impas” i „Perswazja”.

**Gotowe, gdy:** po wyborach 1922 gabinet powstaje przez negocjację, a jego upadek otwiera nową sekwencję bez starych progów.

### Etap 4 — Budżet, gospodarka, projekty i karty państwa

*Wielkość: bardzo duża; trzy części 4a–4c. Punkt 4 z 20.3.*

**Stan:** wykonany 27 IX 2026 (K). Wynik i ustalenia są w rozdziale 14.

**Cel:** zastąpić niemiecką gospodarkę prostą polską i oprzeć na niej karty rządowe i parlamentarne.

**Zakres w referencji:** 5.6, 7.6, 9.7, 11.0–11.9, 12.1–12.8, 17.10–17.12, 17.15. Na mocy decyzji etapu 4 dochodzą 17.16.2 (presje) i gospodarcza część 17.16.4 (przegląd gabinetu).

**Karty z katalogu:** 7.2, 7.3, 7.4, 8.1–8.11, 8.13, 8.16, 9.11, 9.12, 9.13.

**Części:**
- **4a — gospodarka i projekty:**
  - budżet w punktach B, ceny, płace i stabilizacja, kredyt, produkcja i zatrudnienie, wieś, presja przedsiębiorców i instrumenty 11.9;
  - cykl projektu od przygotowania do wykonania (12.1–12.5);
  - warunki życia a wyborcy (5.6, M09).
- **4b — karty rządowe:** 13 z 16 rodzin, czyli 8.1–8.11, 8.13 i 8.16. Karty policji, wojska i porozumienia z Piłsudskim należą do etapu 7.
- **4c — karty parlamentarne i wydarzenia:**
  - ustawa D1/D2 (7.2 katalogu, 17.15), budżet (7.3 katalogu) i reforma konstytucyjna (7.4 katalogu, 7.6);
  - procedura ustawy z terminami Senatu i ponownym głosowaniem Sejmu (7.2, C4), przeniesiona z etapu 2;
  - stabilizacja, kryzys kredytowy i oszczędności 1926 (9.11–9.13 katalogu).

**Pliki:**
- `source/rules/polish_economy.js` (nowy) i `source/rules/polish_projects.js` (nowy); `source/rules/polish_rules.js` (schemat 5), `source/rules/polish_institutions.js` (lista ustaw, przegląd w Senacie) i `source/rules/polish_government.js` (obietnice z projektami, kryzysy, warunki Grabskiego);
- karty rządowe `polish_gov_labor_rights`, `polish_gov_social_welfare`, `polish_gov_finance`, `polish_gov_currency`, `polish_gov_investment`, `polish_gov_industry`, `polish_gov_public_works`, `polish_gov_land`, `polish_gov_agriculture`, `polish_gov_education`, `polish_gov_minority_schools`, `polish_gov_justice` i `polish_gov_heritage` w `source/scenes/government_affairs/` (nowe);
- `source/scenes/polish_agenda.scene.dry`, `source/scenes/polish_unemployment_bill.scene.dry`, `source/scenes/polish_budget_package.scene.dry`, `source/scenes/polish_constitution_project.scene.dry`, `source/scenes/polish_event_stabilization.scene.dry`, `source/scenes/polish_event_credit_crisis.scene.dry` i `source/scenes/polish_event_austerity_1926.scene.dry` (nowe);
- `source/scenes/post_event.scene.dry` (blok gospodarki), `source/scenes/root.scene.dry`, `source/scenes/main.scene.dry`, `source/scenes/status.scene.dry`, `source/scenes/library.scene.dry`, `source/scenes/polish_opening_state.scene.dry`, `source/scenes/polish_cabinet_formation.scene.dry` i `source/scenes/sejm_election.scene.dry`;
- blokady w niemieckich kartach `economic_policy`, `fiscal_policy`, `social_welfare`, `labor_rights`, `agricultural_policy`, `education_science`, `judiciary`, `constitutional_reform` i `economic_democracy` w `source/scenes/government_affairs/` oraz w `events/high_inflation`;
- doradcy: `source/scenes/advisors/arciszewski.scene.dry` i `source/scenes/advisors/moraczewski.scene.dry`;
- `out/html/index.html` i `.gitignore`;
- `tests/rules-economy.test.js`, `tests/rules-projects.test.js`, `tests/polish-economy.test.js` i `tests/polish-government-cards.test.js` (nowe) oraz dotychczasowe testy (rozdział 14).

Wskaźnik `qdisplays/taxation` zostaje bez zmian: czyta go tylko wyłączona niemiecka karta `fiscal_policy`, a polski poziom podatków pokazuje Status.

**Stan:** `S.economy`, `S.society` (presja agrarna, `living_conditions_last`, poprawy wsi), `S.projects`, lista `S.parliament.laws`, `S.chapter.unemployment_bill` i rekord `Q.polish_presidency.constitution.reforms`.

**Kroki (wykonane):**
1. Moduł `polish_economy.js`: budżet 11.2, wykonanie 11.3, ceny i płace 11.4, kredyt, produkcja i zatrudnienie 11.5, wieś 11.6, reakcja przedsiębiorców 11.7, presje 17.16.2, kryzysy 11.9 i przepływ 5.6 z odpływem 17.4.
2. Moduł `polish_projects.js`: projekty 12.1–12.8, procedura ustawy 7.2 z Senatem, instrumenty 11.9, pakiety i karta Budżet, przegląd gabinetu 17.16.4, ustawa D, trzy reformy 7.6, karty rządowe i wydarzenia; kolejność rozliczenia 4.2 w `settleMonth`.
3. Schemat 5 i nowa gra z profilem `economy_simple_v1`; stare pola gospodarki jako kopie; niemiecki blok gospodarki w `post_event` wyłączony warunkiem.
4. Trzynaście kart rządowych, agenda przygotowanych reform, przekierowania Arciszewskiego i Moraczewskiego (jeden krok za 0 T).
5. Ustawa D1/D2, karta Budżet, reforma konstytucyjna, wydarzenia 9.11–9.13 i warunki stabilizacji Grabskiego w karcie formowania (9.7).
6. Status, Biblioteka i powiadomienia ekranu głównego pokazują polską gospodarkę i projekty.

**Wyłączamy:**
- niemiecki `budget` i sprzężenia inflacji;
- erozję `pro_republic` od bezrobocia i inflacji, przepływy do NSDAP i dryfy 1929–1932 w `post_event`;
- scenę `high_inflation` (przecieki 1 i 9);
- niemieckie karty i wydarzenia gospodarcze (dodatek D).

**Wzorzec liczb:** `analysis/m09-living-conditions/` i `analysis/m02-revision-13/`.

**Testy z 21.1:** 35 testów z dodatku B, m.in. „Niedobór budżetu”, „Efekt projektu” i „Warunki życia”. Dziewięć testów zależnych od systemów późniejszych etapów przeniesiono do etapów 5–7 (decyzja etapu 4).

**Gotowe, gdy:** gabinet z PPS może przyjąć program, sfinansować go w budżecie i wykonać projekt, a żaden stary zapis gospodarki nie zmienia wyniku.

### Etap 5 — Partia: stanowiska, organizacje, frakcje, doradcy i kampanie

*Wielkość: duża; cztery części 5a–5d. Punkt 5 z 20.3, część partyjna.*

**Stan:** wykonany 27 IX 2026 (K). Wynik i ustalenia są w rozdziale 15.

**Cel:** pełna talia partyjna: stanowiska, organizacje, pieniądze, frakcje, doradcy i kampanie wyborcze.

**Zakres w referencji:** 5.1–5.5, 9.5, 10.1–10.10, 13.1–13.5. Na mocy decyzji etapu 5 dochodzą 14.1 (trzy branże związków, bez strajków) oraz przepływ 5.6 i odpływ 17.4 na komórkach.

**Karty z katalogu:** 4.1–4.8, 5.1–5.9, 6.2–6.7, 9.10.

**Części:**
- **5a — pieniądze, organizacje, Milicja i związki** (13.1–13.5, 14.1; katalog 5.1, 5.2 i 5.4–5.9): miesięczna księga partii, karty Organizacje, Milicja i Składki, stała karta „Party Agenda”.
- **5b — komórki i kampanie** (5.1–5.4; katalog 5.3): 54 komórki, sondaż i głosy z komórek, karta Media, nagrody 5.4.
- **5c — stanowiska, program i KPP** (9.5, 10.5–10.8, 10.10; katalog 4.1–4.8, 6.2 i 6.7): osiem kart stanowisk, program gospodarczy, arbitraż i oś autonomii, agenda współpracy z KPP, zaufanie Bundu.
- **5d — frakcje, E3 i doradcy** (10.1–10.4, 10.9; katalog 6.3–6.6 i 9.10): sprawy frakcji, karta E3, karta Jedność z czystką, karta zmiany doradców i akcje z 10.4.3.

**Pliki:**
- `source/rules/polish_electorate.js` (nowy) i `source/rules/polish_party.js` (nowy); `source/rules/polish_rules.js` (schemat 6, dziedziny partii, E3 w kolejce), `source/rules/polish_economy.js` i `source/rules/polish_projects.js` (przepływy na komórkach, zatrudnienie, wykonawca spółdzielczy, arbitraż), `source/rules/polish_government.js` (reakcje frakcji, oś autonomii, reakcje na zerwanie) i `source/rules/polish_institutions.js` (raport, frekwencja po wyborach);
- karty `polish_party_organizations`, `polish_party_militia`, `polish_party_dues`, `polish_party_media`, `polish_party_direction`, `polish_party_main_opponent`, `polish_party_pils_influence`, `polish_party_form_of_power`, `polish_party_electoral_base`, `polish_party_slavic_autonomy`, `polish_party_jewish_cooperation`, `polish_party_ussr_position`, `polish_party_economic_program`, `polish_party_unity` i `polish_party_advisers` w `source/scenes/party_affairs/` (nowe);
- `source/scenes/polish_party_agenda.scene.dry` i `source/scenes/polish_event_faction_split.scene.dry` (nowe);
- blokady w odziedziczonych kartach `campaigning`, `fundraising`, `ideology`, `media`, `party_disunity`, `party_organizations`, `reichsbanner`, `shuffle_leadership`, `rally`, `enemies` i `international_relations` w `source/scenes/party_affairs/`;
- trzy sceny kryzysu frakcji poza kolejką: `events/pps_lewica_split`, `events/pps_pilsudczycy_split` i `events/pps_centrum_crisis`;
- 14 polskich doradców w `source/scenes/advisors/` i zamknięcie w trybie doradcy w 13 kartach rządowych etapu 4;
- `source/scenes/root.scene.dry`, `source/scenes/post_event.scene.dry`, `source/scenes/election_algorithm.scene.dry`, `source/scenes/sejm_election_result.scene.dry`, `source/scenes/main.scene.dry`, `source/scenes/status.scene.dry` i `source/scenes/polish_opening_state.scene.dry`;
- `out/html/index.html`, `.gitignore` i `tests/helpers/dendry.js`;
- `tests/rules-party.test.js`, `tests/polish-party.test.js`, `tests/rules-electorate.test.js`, `tests/rules-strategy.test.js` i `tests/rules-factions.test.js` (nowe) oraz dotychczasowe testy (rozdział 15). `tests/polish-party-system.test.js` zostaje.

Wskaźniki `qdisplays/dissent`, `qdisplays/strength`, `qdisplays/loyalty` i `qdisplays/militancy` zostają bez zmian: czytają kopie stanu.

**Stan:** `S.party_orgs`, `S.militia`, `S.unions` (trzy branże), `S.faction_cases`, `S.advisors`, `S.society.cells`, `S.actors.pps.strategy`, `S.actors.pps.factions`, `S.actors.communist_cooperation` i `S.actors.bund`.

**Kroki (wykonane):**
1. Kasa PPS, składki i zbiórka. Zawsze dostępna praca organizacyjna (13.1; 5.7 katalogu).
2. Prasa, TUR, spółdzielnie, aparat i członkostwo (13.2, 13.5, M18); karta Organizacje z dwoma pakietami.
3. Milicja i AS na nowym stanie (13.3–13.4, M15).
4. Komórki elektoratu i kampanie (5.1–5.5) z przepływem 5.6 i odpływem 17.4 na komórkach.
5. Frakcje i posłuch (10.1–10.3). Karta E3 `party.faction_split` zamiast trzech automatycznych scen kryzysu frakcji. Czystka (10.9).
6. Doradcy i ich akcje (10.4) na transakcji z etapu 1.
7. Osiem kart stanowisk, program gospodarczy, jedność i zmiana doradców (10.5–10.10).
8. Kontakt i współpraca z KPP (9.5) oraz zaufanie Bundu (5.5).

**Wyłączamy:** zapisy do `pro_republic` w scenach doradców `niedzialkowski` i `prochnik` (przeciek 10), niemieckie mosty wierszy poparcia i pięciu dawnych frakcji, trzy automatyczne sceny kryzysu frakcji i odziedziczone karty partyjne (dodatek D).

**Wzorzec liczb:** `analysis/m16-split-recalculation/`, `analysis/m17-late-advisors/`, `analysis/m18-membership-apparatus/`, `analysis/m13-communist-discipline/` i `analysis/m15-as-benefit/`.

**Testy z 21.1:** 67 testów z dodatku B, m.in. „Rozłam E3”, „Składki” i „Obecna linia”; trzy z nich przeniósł etap 4.

**Gotowe, gdy:** każda karta z partii 1–3 katalogu działa na nowej transakcji, a rozłam frakcji to karta E3 z dwoma wyborami.

### Etap 6 — Związki i strajki

*Wielkość: duża; trzy części 6a–6c. Punkt 5 z 20.3, część strajkowa, oraz sprawy odłożone w etapach 4–5.*

**Stan:** wykonany 27 IX 2026 (K). Wynik i ustalenia są w rozdziale 16.

**Cel:** strajk od postulatów przez ugodę do jej wykonania, z udziałem PPS, komunistów, Sejmu i władz.

**Zakres w referencji:** 9.6, 14.1–14.5, 17.4, 17.5. Na mocy planu etapu 6 dochodzą sprawy odłożone w etapach 4–5: 9.7 (osłony Grabskiego i umowa tolerowania), 16.5 (opóźnienie kolei), 17.5.1 (odpowiedź Sejmu), 17.12 i 17.12.5 (układy zbiorowe, zakłady, przejęcie i reprezentacja) oraz 17.16.5 (droga płacowa).

**Karty z katalogu:** 5.10, 7.10, 9.7, 9.8, 9.9.

**Części:**
- **6a — branże i strajk** (14.1–14.5, 17.4; katalog 5.10): moduł strajków, stała karta „Trade Unions” z krokami sporu, miesiąc strajku z funduszem i zmęczeniem, runda rokowań, zgoda związku, ugoda i jej wykonanie, spadek produkcji i skutek płacowy.
- **6b — sprawa 1923, władze, komuniści i Sejm** (9.6, 16.5, 17.5, 17.5.1, 17.16.5; katalog 7.10, 9.7–9.9): droga płacowa, karta strajków 1923, kroki współpracy z KPP i ochrony Milicji, reakcja władz według profilu gabinetu i resortów PPS, Kraków, odpowiedź Sejmu, karta E6, blokada niemieckich wydarzeń.
- **6c — układy, zakłady i Grabski** (9.7, 17.12, 17.12.5): układ zbiorowy w branży, syntetyczne zakłady i działające na nich opcje kart Pracy i Przemysłu, warianty Czapińskiego, osłony Grabskiego i umowa tolerowania na 6 M z przeglądem po 3 M.

**Pliki:**
- `source/rules/polish_unions.js` (nowy); `source/rules/polish_rules.js` (schemat 7, dziedziny `S.strikes` i `S.enterprises`, trzy wydarzenia strajkowe w kolejce), `source/rules/polish_party.js` (kolejność księgi z M18, linie strajkowe branż, wynik próby z KPP), `source/rules/polish_economy.js` (odczyt zakłóceń i układów), `source/rules/polish_projects.js` (wejścia strajkowe w rozliczeniu, opcje układów i zakładów, projekty ratunku i reprezentacji, ustawa o przejęciu, profil Grabskiego z osłonami, odpowiedź na wydarzenie stabilizacji), `source/rules/polish_government.js` (reakcje frakcji, osłony i umowa tolerowania Grabskiego, przegląd i koniec terminu w odpowiedzi 9.8) i `source/rules/polish_institutions.js` (raport, lista `NOT_MODELLED`);
- sceny `polish_union_agenda`, `polish_event_strike_1923`, `polish_strike_steps`, `polish_event_strike_response` i `polish_event_strike_rejection` w `source/scenes/` (nowe);
- sceny `root`, `post_event`, `main`, `status`, `polish_opening_state`, `polish_agenda`, `polish_cabinet_formation`, `polish_government_response`, `polish_government_support` i `polish_event_stabilization`, karty `government_affairs/polish_gov_labor_rights` i `government_affairs/polish_gov_industry` oraz doradca `advisors/czapinski`;
- blokady w `events/labor_unrest` i `events/unions_declare_independence`;
- `out/html/index.html`, `.gitignore` i `tests/helpers/dendry.js`;
- `tests/rules-strike.test.js` i `tests/polish-strike.test.js` (nowe) oraz dotychczasowe testy (rozdział 16).

**Stan:** `S.strikes` (rekordy strajków i spraw, klucze wydarzeń, obserwacja płac, wejścia do gospodarki, skutki dla etapu 7), `S.enterprises` (syntetyczne zakłady), ugody w rekordzie strajku, układy zbiorowe w `S.unions[b].agreements`, `TrialRecord` współpracy z KPP oraz termin umowy tolerowania w `S.agreements`.

**Kroki (wykonane):**
1. Stan branż i potencjał akcji (14.1–14.2): linie strajkowe, gotowość, zmęczenie i fundusz.
2. Rekord strajku, runda rokowań, zgoda związku i kruchość rządu (14.3–14.4, 17.4).
3. Wykonanie ugody i karta E6 `society.strike_settlement_rejection` (14.5).
4. Strajki 1923 i Kraków, współpraca z komunistami w strajku, ochrona Milicji oraz odpowiedź klubu i władz (17.5, 17.5.1, 9.6, B8+B10, B11+B12).
5. Układy zbiorowe, zakłady i opcje kart Pracy i Przemysłu (17.12, 17.12.5; decyzja 2).
6. Osłony Grabskiego i umowa tolerowania (9.7, 9.8).

**Wyłączamy:** niemieckie wydarzenia `labor_unrest` i `unions_declare_independence` (warunek `not polish_union_rules`; pliki zostają, dodatek D).

**Wzorzec liczb:** `analysis/m12-strike-settlement/`, `analysis/m13-communist-discipline/` i `analysis/m18-membership-apparatus/`.

**Testy z 21.1:** 18 testów z dodatku B, m.in. „Zgoda na ugodę”, „Kraków” i „Klucz sprawy E6”; dwa z nich przeniósł etap 4.

**Gotowe, gdy:** strajk 1923 przechodzi od żądań do wykonanej albo odrzuconej ugody bez podwójnego liczenia funduszu.

### Etap 7 — Demokracja, siły bezpieczeństwa, zamach i raport

*Wielkość: duża; pięć części 7a–7e. Punkt 6 z 20.3.*

**Stan:** wykonany 27 IX 2026 (K). Wynik i ustalenia są w rozdziale 17.

**Cel:** presja na zamach, siły i ich lojalność, sekwencja zamachu po decyzjach gracza oraz pełny raport. Po tym etapie rozdział da się przejść od początku do końca.

**Zakres w referencji:** 10.7, 15.1–15.3, 16.1–16.8, 17.6–17.7, 19.2. Na mocy planu etapu 7 dochodzą: 8.7 (Śliwiński i konstytucyjny gabinet Piłsudskiego), 17.10–17.13 (talie, karty MSW, wojska i Sprawiedliwości, sceny B1–B5), 17.12.2–17.12.4 i 17.12.6 (policja, przegląd nadużycia, nominacje, autonomia), 17.16.3 (spór 1922 i sprawa wojskowa) oraz 19.1 (koniec rozdziału po zamachu).

**Karty z katalogu:** 6.8, 7.5, 8.12, 8.14, 8.15, 9.1, 9.2, 9.4, 9.5, 9.6, 9.14, 9.15.

Kartę 9.1 przeniesiono z etapu 3 (decyzja etapu 3): spór Naczelnika z Ponikowskim wymaga relacji z Piłsudskim.

**Części:**
- **7a — polityka i społeczeństwo** (10.7, 15.1–15.3; katalog 9.2, 9.14): dziennik instytucji i autorytet Sejmu, demokracja, przemoc, niezadowolenie i radykalizacja komórek, presja z impulsami, datowane wejścia scenariusza, karta B2.
- **7b — siły państwa i Piłsudski** (16.1–16.3, 16.7, 16.8.1, 17.12.2–17.12.4, 17.12.6; katalog 6.8, 7.5, 8.12–8.15): zgrupowania i lojalność efektywna, zdolność, rozpoznanie w agendzie, policja, kontrola wojska i nominacje, umowa z Piłsudskim z przeglądem, przegląd nadużycia, autonomia, śledztwo prasowe, reakcja władz na przemoc organizacji PPS.
- **7c — rok 1922 i prezydentura** (17.6–17.7, 17.13, 17.16.3; katalog 9.1, 9.4–9.6): kryzys gabinetowy B1 z kandydaturą Śliwińskiego, zagrożenie B3 bez menu, mobilizacja B4 i kult B5; wydarzenia kategorii 1–2 przed należnymi wyborami i formowaniem.
- **7d — zamach F** (16.4–16.8; katalog 9.15): bramki i kryzys polityczny, F3–F11, rundy z opóźnieniami kolei, ugoda i F9, wkład kontrfaktyczny, ustępstwa, skutki i koniec rozdziału; przeciek 3.
- **7e — raport, talie i izolacja** (17.10–17.11, 19.2): pełny raport, obie talie, warunki na niemieckich zapisach `coup_progress` i `pro_republic`, przejście kampanii od stycznia 1922 do raportu.

**Pliki:**
- `source/rules/polish_politics.js` i `source/rules/polish_security.js` (nowe); `source/rules/polish_rules.js` (schemat 8, dziedziny `S.politics`, `S.security`, `S.coup`, wejścia scenariusza, sześć definicji kolejki), `source/rules/polish_government.js` (kandydaci Śliwiński i Piłsudski, formowanie po B1, kryzys z niezadowolenia i spraw), `source/rules/polish_projects.js` (projekty i karty MSW, wojska, przeglądu i autonomii, trasa Sejmu, powtórzenie odrzuconej ustawy), `source/rules/polish_party.js` (śledztwo prasowe, kampania bez akcji, adresaci polemiki), `source/rules/polish_unions.js` (niezadowolenie robotników), `source/rules/polish_electorate.js` i `source/rules/polish_institutions.js` (droga do wydarzeń kategorii 1–2, koniec po zamachu, pełny raport);
- sceny `polish_event_pils_criticism`, `polish_event_cabinet_1922`, `polish_event_assassination_response`, `polish_event_niewiadomski_cult`, `polish_event_coup` i `polish_parliament_army_oversight` w `source/scenes/` (nowe);
- karty `polish_gov_interior`, `polish_gov_military` i `polish_gov_pils_agreement` w `source/scenes/government_affairs/` (nowe);
- sceny `root`, `post_event`, `status`, `library`, `polish_opening_state`, `polish_presidential_sequence`, `polish_cabinet_formation`, `polish_agenda`, `polish_party_agenda`, `polish_chapter_report`, karty `government_affairs/polish_gov_justice` i `party_affairs/polish_party_media`;
- warunek `not polish_security_rules` w 26 niemieckich scenach zapisujących `coup_progress` albo `pro_republic`, m.in. `government_affairs/police`, `government_affairs/military_policy`, `events/march_on_berlin` i `events/capital_strike` (rozdział 17);
- `out/html/index.html`, `.gitignore` i `tests/helpers/dendry.js`;
- `tests/rules-politics.test.js`, `tests/polish-democracy.test.js`, `tests/rules-coup.test.js` i `tests/polish-coup.test.js` (nowe) oraz dotychczasowe testy (rozdział 17).

**Stan:** `S.politics` (dziennik i autorytet Sejmu, demokracja, przemoc, niezadowolenie krajowe, sprawy, restrykcje, wystąpienia, epizody), `S.security` (zgrupowania, rozpoznanie, policja, modyfikatory, ochrony), `S.coup` (presja, fazy, próba z rozstrzygnięciem, F9, wynik, wkład i ustępstwa), `S.actors.pilsudski` i `S.scenario.inputs`.

**Kroki (wykonane):**
1. Dziennik instytucjonalny, autorytet Sejmu i demokracja (15.2, M10). Krytyka parlamentu B2 (10.7).
2. Niezadowolenie i presja na zamach (15.1, 15.3).
3. Siły bezpieczeństwa, lojalność, policja i wojsko (16.1–16.4); karty 7.5, 8.12 i 8.14 katalogu.
4. Porozumienie z Piłsudskim i ocena sił (16.7, 16.8.1).
5. Wydarzenia prezydenckie: zagrożenie, mobilizacja po zabójstwie i kult Niewiadomskiego (17.6–17.7).
6. Sekwencja zamachu F z rundami, ugodą i skutkami (16.6, 16.8).
7. Pełny raport (19.2) i wariant bez zamachu do następnych wyborów.
8. Pełne listy obu talii: 10 kart parlamentarnych i 16 rządowych.

**Wyłączamy:** niemiecki `coup_progress` i ustalanie wyniku zamachu przed wyborem gracza (przeciek 3) oraz pozostałe zapisy `pro_republic` (dodatek D): 26 scen ma warunek `not polish_security_rules`, pliki zostają.

**Wzorzec liczb:** `analysis/m08-coup-profile/`, `analysis/m10-authority-democracy/`, `analysis/m02-pressure-calibration/` i `analysis/m15-as-benefit/`.

**Testy z 21.1:** 53 testy z dodatku B, m.in. „Zamach”, „Autorytet z dziennika” i „Izolacja Polski”; cztery z nich przeniósł etap 4.

**Gotowe, gdy:** kampania od stycznia 1922 kończy się raportem po zamachu albo po następnych wyborach, a test „Izolacja Polski” potwierdza, że żaden stary zapis nie zmienia wyniku.

### Etap 8 — Scenariusz Normalny, treść i kalibracja

*Wielkość: bardzo duża. Punkt 7 z 20.3.*

**Stan:** wykonany 4 X 2026 (K) jako ostatni etap planu. Wynik, poprawki i ograniczenia gotowego rozdziału są w rozdziale 18.

**Cel:** pełna, zbalansowana kampania z kompletną treścią po angielsku.

**Zakres w referencji:** 17.13, 17.14, 17.16, 21.2, 21.2a, 21.2b, 21.2c, 22.

**Karty z katalogu:** 9.17.

**Pliki:** sceny wszystkich poprzednich etapów (teksty), `source/scenes/status.scene.dry`, `source/scenes/library.scene.dry` i `tests/sejm-browser-smoke.cjs` (pełny przebieg kampanii).

**Stan:** `S.scenario` (profil `normal_chapter1_v1`).

**Kroki:**
1. Scenariusz `normal_chapter1_v1`: zachowanie gabinetów bez PPS i kalendarz (17.16).
2. Sceny B, C i G po rewizjach (17.13–17.14).
3. Teksty dla gracza po angielsku we wszystkich scenach; ekrany `status` i `library`.
4. Pełne przejścia kampanii i kontrole 21.2, 21.2a, 21.2b i 21.2c. Strojenie liczb P z raportem dla użytkownika.
5. Badania historyczne pięciu punktów TBD, gdy użytkownik do nich wróci. Do tego czasu zostają oznaczone wartości testowe.

**Wyłączamy:** pozostałe niemieckie karty i wydarzenia bez polskiego odpowiednika (dodatek D).

**Wzorzec liczb:** `analysis/m02-revision-13/`, `analysis/m02-political-chain/` i `analysis/m02-pressure-calibration/`.

**Testy:** kontrole pełnych kampanii z 21.2; testy z 21.1 są już przypisane do etapów 0–7.

**Gotowe, gdy:** TRANSITION_MATRIX potwierdza cały rozdział jako spójną polską grę, a kontrole 21.2 przechodzą.

## 7. Kamienie milowe

- **Po etapie 2:** kalendarz 1922 — otwarcie, wybory i prezydent — działa na nowym fundamencie, a rozdział ma legalny koniec z raportem.
- **Po etapie 3:** gabinety powstają przez negocjację i upadają bez starych progów; umowy pamiętają obietnice.
- **Po etapie 4:** gabinet może przyjąć i wykonać program opłacony z budżetu.
- **Po etapie 7:** rozdział da się przejść od początku do końca, z zamachem i bez niego.
- **Po etapie 8:** rozdział jest zbalansowany i ma pełną treść.

## 8. Ryzyka i zabezpieczenia

| Ryzyko | Zabezpieczenie |
|---|---|
| Stara i nowa reguła liczą to samo dwa razy | Wyłączanie starych zapisów w tej samej zmianie i test, że stare zapisy nic nie zmieniają (dodatek C) |
| Silnik ukrywa błędy skryptów | Testy silnika nie przechodzą przy żadnym zalogowanym błędzie |
| Zapis w środku sekwencji dubluje koszt albo losowanie | Transakcje i rzuty zapisane w stanie; testy zapisu i wczytania w każdym etapie |
| Liczby robocze dają złą rozgrywkę | Strojenie dopiero w etapie 8, na pełnych przebiegach; wcześniej tylko zgodność z referencją |
| Etap 4 jest zbyt duży | Podział na części 4a–4c, każda z własnymi testami |
| Plik reguł rośnie bez kontroli | Podział na pliki dziedzin w `source/rules/` |
| Warunki Dendry nie czytają złożonego stanu | Warunki `{! … !}` wołają moduł reguł; sprawdzamy to w etapie 0 |

## 9. Sprawy techniczne rozstrzygnięte w etapie 0

- **Układ stanu:** jeden obiekt `Q.S` (decyzja 1A etapu 0).
- **Sprawdzenie zapisu:** zaraz po wczytaniu w `out/html/game.js` oraz zabezpieczenie w `main` i `post_event` (decyzja 2A).
- **Niemieckie wydarzenia:** odcina je etap 1 osobnym tagiem polskich wydarzeń w `post_event`; rozpoznanie jest w rozdziale 10.
- **Testy:** wspólny pomocnik `tests/helpers/dendry.js`; obecne testy łapią wszystkie błędy silnika (decyzja 3A).

## 10. Ustalenia z etapu 0

**Wynik etapu (K):**
- Nowe pliki: `source/rules/polish_rules.js`, `source/scenes/polish_incompatible_save.scene.dry`, `tests/helpers/dendry.js`, `tests/rules-foundation.test.js` i `tests/polish-foundation.test.js`. Do testu w przeglądarce doszła konfiguracja podglądu `.claude/launch.json` (`npm run serve`).
- Zmienione pliki:
  - `package.json` (kopiowanie modułu przy budowaniu), `.gitignore`, `out/html/index.html` i `out/html/game.js`;
  - `source/scenes/root.scene.dry`, `source/scenes/main.scene.dry` i `source/scenes/post_event.scene.dry`;
  - cztery dotychczasowe pliki testów: filtr błędów, zastępnik przeglądarki i wczytanie modułu reguł.
- Testy: 97 z 97, czyli 83 dotychczasowe i 14 nowych.
- Rozgrywka bez zmian: osiem przejść gry, łącznie 15 788 kroków z wyborem opcji według ID, daje te same sceny, ten sam stan poza `Q.S` i ten sam stan generatora losowego co wersja sprzed etapu.
- Przeglądarka: nowa gra, 60 ruchów do maja 1922, zapis i wczytanie slotu oraz stary zapis z odmową i ze zgodą na nową grę.

**Dla etapu 1 i dalszych:**
- Kolejność scen w `out/game.json` zależy od kolejności odczytu plików przy budowaniu. Po przebudowaniu w innym katalogu karty mogą mieć inną kolejność, więc ta sama pozycja na liście albo to samo losowanie z listy daje inną grę. Etap 1: każde losowanie wybiera z listy posortowanej według ID (4.6).
- Gdy kilka warunków `go-to` jest spełnionych naraz, silnik losuje cel. Nowe gałęzie muszą się wzajemnie wykluczać, tak jak w zabezpieczeniu zapisu.
- Wczytanie zapisu (`setState`) nie uruchamia skryptów scen. Wszystko, co potrzebne do wznowienia, musi być w `Q.S`.
- Silnik zapisuje w stanie całą zagraną kartę (`lastPlayedCard`), nie tylko jej ID.
- „Return card to hand” (`easy_discard`) zwraca kartę, akcję miesiąca i licznik. Gdy karty nie zagrano z ręki, najpierw odejmuje akcję, a potem zgłasza błąd. Etap 1 usuwa ten zwrot (4.3); do tego czasu to jedyny dopuszczony błąd w teście przejść.
- 52 liczniki z listy `Q.timers` maleją co miesiąc w `post_event`, a `cancel_advisor_action` zeruje licznik doradców i kart (dodatek E).
- Scena bez opcji dostaje od silnika „Continue...” do `root`.
- W 12 automatycznych przejściach lat 1922–1928 pojawiło się tylko jedno niemieckie wydarzenie: `economic_expansion` (1926).

**Błędy zastane w kodzie, poza zakresem etapu:**
- `window.onload` w `out/html/game.js` przy pierwszej wizycie odczytuje nieustawiony rozmiar czcionki (`font_size.toFixed`).
- Scena otwarcia odtwarza muzykę z katalogu `music/`, którego nie ma w repozytorium; przeglądarka dostaje odpowiedź 404.

## 11. Ustalenia z etapu 1

**Wynik etapu (K):**
- Nowe pliki: `source/rules/polish_engine_hooks.js`, `source/scenes/polish_advisor_commit.scene.dry`, `source/scenes/polish_event_router.scene.dry`, `source/scenes/polish_discard.scene.dry`, `tests/rules-turn.test.js` i `tests/polish-turn.test.js`.
- Zmienione pliki:
  - `source/rules/polish_rules.js` (zegar, rozliczenie, transakcje, karty, kolejka, losowanie; schemat w wersji 2);
  - `source/scenes/post_event.scene.dry`, `source/scenes/main.scene.dry`, `source/scenes/root.scene.dry`, `source/scenes/easy_discard.scene.dry`, `source/scenes/cancel_advisor_action.scene.dry` i `source/scenes/return.scene.dry`;
  - 14 polskich doradców (21 akcji dostało `call: polish_advisor_commit`) i trzy sceny `pps_*` (tag `pl_event`);
  - `out/html/index.html`, `out/html/game.js`, `.gitignore`;
  - dotychczasowe testy: zegar liczony z `time`, wydarzenia z kolejki, wersja 2 schematu i pusta lista znanych błędów.
- Testy: 122 z 122. Przeglądarka: dobieranie i zagrywanie kart kliknięciami, zamknięcie karty Milicji, odrzucenie, akcja Perla za 0 T, dwa kryzysy frakcji po kolei oraz zapis i wczytanie slotu, bez błędu silnika.

**Uzupełnienia przy wdrożeniu, w granicach decyzji:**
- „Back to main” z pierwszej strony karty działa jak „Close card”, bo też jest wyjściem bez decyzji (11 kart ma tę opcję).
- Cofanie otwarcia obejmuje wszystkie pola zapisywane przez kod otwarcia karty, a nie tylko licznik `…_timer` o nazwie karty. Karta Milicji zapisuje odnowienie jako `pps_militia_timer`.
- „Discard a card” jest widoczna przez cały miesiąc, dopóki odrzucenie jest dostępne, bo silnik nie odświeża kart stałych po dobraniu karty. Przy pustej ręce pokazuje tylko informację.
- Doradca zwalnia z kosztu cały przekierowany krok, także kartę otwieraną z pierwszej (np. Newspapers otwiera kartę mediów).
- Wydarzenie wybrane w miesiącu, w którym pierwszeństwo miały wybory albo sukcesja, nie jest zamykane, dopóki router do niego nie wejdzie.
- Rozliczenie miesiąca zachowuje dotychczasową kolejność odziedziczonego bloku: zegar przesuwa się na początku, jak dawniej. Kolejność punktów 4–7 z 4.2 przyjdzie z etapami 4–7.

**Dla następnych etapów:**
- Przekierowań doradców jest 6, nie 7, jak podawał szczegółowy plan etapu.
- Dwie odziedziczone karty partyjne, Fundraising i Rally, mają na pierwszej stronie tylko opcje działania. Taką kartę trzeba rozegrać albo odrzucić; zamknąć jej się nie da, do czasu wymiany.
- Karta `shuffle_leadership` otwiera się od razu na podstronie, więc nie ma pierwszej strony do zamknięcia.
- Automatyczny gracz z testów potrafi utknąć na darmowych ruchach; pomocnik `walk` najpierw próbuje nowych opcji na danej stronie.

## 12. Ustalenia z etapu 2

**Wynik etapu (K):**
- Nowe pliki: `source/rules/polish_institutions.js`, `source/scenes/polish_speaker_election.scene.dry`, `source/scenes/polish_chapter_report.scene.dry`, `tests/rules-institutions.test.js` i `tests/polish-institutions.test.js`.
- Zmienione pliki:
  - `source/rules/polish_rules.js` (schemat 3 z dziedzinami parlamentu, Senatu i głosowań);
  - `source/scenes/sejm_election.scene.dry`, `source/scenes/sejm_election_result.scene.dry`, `source/scenes/polish_opening_state.scene.dry` i `source/scenes/polish_presidential_sequence.scene.dry`;
  - `source/scenes/main.scene.dry`, `source/scenes/post_event.scene.dry`, `source/scenes/root.scene.dry`, `source/scenes/status.scene.dry` i `source/scenes/library.scene.dry`;
  - `out/html/index.html` i `.gitignore`;
  - dotychczasowe testy: wczytanie drugiego pliku reguł i schemat 3; data 19 II 1928 zamiast maja 1928; brak wcześniejszych „niemieckich” wyborów oraz niemieckich progów i wykluczeń; liczone wyniki grudnia zamiast stałych; druga kandydatura Daszyńskiego dostępna; głowa państwa bez niemieckiego `president`. Opcjonalny skrypt `tests/sejm-browser-smoke.cjs` opisuje nowy grudzień; nie uruchomiono go, bo nie ma Playwrighta.
- Testy: 144 z 144, w tym 22 nowe. Stary kod liczenia mandatów ze sceny i nowy z modułu dają te same listy, głosy i mandaty na 20 000 losowych danych.
- Przeglądarka: wybory 1922, wybór marszałka i obie elekcje prezydenckie kliknięciami, zastępstwo marszałka po zamachu, zapis i wczytanie w środku grudnia, przeskok czasu w konsoli do stycznia 1928, wybory 1928, raport, zapis, przeładowanie strony i wczytanie raportu. Bez nowych błędów silnika.

**Uzupełnienia przy wdrożeniu, w granicach decyzji:**
- `main` i `post_event` wybierają następną scenę z jednej wartości `pl_route`, bo silnik losuje cel, gdy kilka warunków `go-to` jest spełnionych naraz. Rozpoczęta sekwencja ma pierwszeństwo przed nową (4.5, kategoria 1).
- Wybór prezydenta następuje po pierwszej próbie wyboru marszałka, także nieudanej. Po nieudanej próbie marszałka nowe głosowanie jest w następnym miesiącu, a grudniowa elekcja prezydenta odbywa się normalnie.
- Po drugich wyborach rząd nie jest formowany: raport pokazuje rząd, który był u władzy, a Status nie pisze „Government formation pending”.
- Nierozstrzygnięte wybory prezydenta trafiają do `Q.polish_presidency.failed_elections`, więc lista `elections` zawiera tylko wybory rozstrzygnięte.
- Raport zapisuje marszałka poprzedniej kadencji (`S.parliament.previous_term`), bo nowy Sejm jeszcze go nie wybrał.

**Dla następnych etapów:**
- Domyślny wynik 1922 z gry jest daleki od historycznego (mniejszości około 101 mandatów, ZLN 59). Gdy PPS zgłasza Daszyńskiego, pierwszy odpada Narutowicz i nie ma zamachu. Kontrola „bierna PPS → historyczni zwycięzcy” należy do etapu 8.
- Etap 3: karta 7.7 z oknem list, umowa o komisji z Piastem, wcześniejsze zobowiązania i reputacja +5 w wyborze marszałka.
- Etap 4: procedura ustawy z terminami Senatu i test „C4”.
- Etap 5: linia Centrum w wyborze marszałka oraz transfery między klubami przy rozłamach.
- Etap 7: wybory i urzędy wchodzą do kolejki wydarzeń razem z pierwszymi wydarzeniami kategorii 1–2; `coupEndpoint` zacznie czytać `S.coup`.
- Zapisy ze schematu 2 (etap 1) wymagają nowej gry.

## 13. Ustalenia z etapu 3

**Wynik etapu (K):**
- Nowe pliki: `source/rules/polish_government.js`, sceny `polish_cabinet_formation`, `polish_government_support`, `polish_government_response` i `polish_list_agreement`, testy `tests/rules-negotiation.test.js` i `tests/polish-cabinet.test.js`.
- Zmienione pliki:
  - `source/rules/polish_rules.js` (schemat 4 z dziedzinami aktorów, umów, gabinetu, negocjacji i kryzysu; zapis głównej akcji nowych kart) i `source/rules/polish_institutions.js` (dwa segmenty mniejszości, wspólne listy w liczeniu mandatów);
  - sceny `root`, `main` (talia „Parliament”, stała karta odpowiedzi), `post_event` (rozliczenie umów), `polish_opening_state` (pola z zapisu gabinetu), `sejm_election`, `sejm_election_result`, `polish_speaker_election`, `polish_presidential_sequence`, `status`, `library` i `party_affairs/inter_party_relationships`;
  - `events/election_1928` (usunięte sześć stałych opcji rządu), `government_affairs/coalition_affairs` (blokada polskiego systemu) oraz doradcy Daszyński, Malinowski i Ziemięcki;
  - `out/html/index.html` i `.gitignore`;
  - dotychczasowe testy: nowe formowanie zamiast opcji `election_1928`, dziewięć resortów, zapis gabinetu jako jedyne źródło pól rządu (stare sceny nie mogą go podmienić), sześć testów „complete playable government outcome” w nowych układach. Skrypt `tests/sejm-browser-smoke.cjs` przechodzi przez nowe formowanie; nie uruchomiono go, bo nie ma Playwrighta.
- Testy: 185 z 185, w tym 41 nowych.
- Przeglądarka:
  - rozmowa z NPR, perswazja wobec Ponikowskiego (odmowa przy ocenie 55,0);
  - wspólna lista PPS–Wyzwolenie w październiku 1922 i jej wiersz w wyniku wyborów;
  - formowanie po wyborach z poparciem mniejszości, Daszyńskim i resortami Pracy oraz Spraw Wewnętrznych; zapis, przeładowanie strony i wczytanie w środku formowania; powołanie gabinetu z 235 posłami;
  - wyjście PPS z gabinetu Daszyńskiego i dymisja; w grudniu najpierw marszałek i prezydent, potem obowiązkowe formowanie; gabinet fachowców Nowaka powołany przez prezydenta;
  - w nowej grze wycofanie tolerancji Ponikowskiego, głosowanie 35 za, 0 przeciw (przyjęte) i nowe formowanie w lutym.
  - Bez nowych błędów silnika. W konsoli są tylko wcześniejsze błędy interfejsu (`toFixed` w `game.js`, brakujące pliki dźwięku, `cardImage`). Test w przeglądarce wykazał cztery usterki wyświetlania, poprawione i objęte testem: wiersze partii ze wspólnej listy w wyniku wyborów, puste napięcie umów, nieprzeliczone poparcie po wycofaniu i brak spacji w opisie oferty.

**Uzupełnienia przy wdrożeniu, w granicach decyzji (P):**
- Formowanie ma domyślną ofertę: pierwszy dostępny układ, premier partyjny przed kandydatem okna. Impas zaczyna się po trzech rundach bez powołania. Tej samej odrzuconej oferty nie da się złożyć ponownie bez zmiany sytuacji. Obowiązkowe formowanie przychodzi po sekwencjach instytucji i przed wydarzeniami (trasa `cabinet` w `main` i `post_event`).
- Według prognozy z decyzji 7 gabinet mniejszościowy potrzebuje tylko większej liczby głosów „za” niż „przeciw”. Przy domyślnym wyniku 1922 PPS i Wyzwolenie mogą więc rządzić ze 120 posłami. Gabinet fachowców bez alternatyw dostaje podpisy prawie wszystkich klubów (potrzeba 100). Z tego samego powodu PPS sama może obalić gabinet Ponikowskiego, z którym nikt inny nie ma umowy; decyzja 6 przewiduje tę możliwość. Kalibracja należy do etapu 8.
- W listopadzie 1922 premia okna daje fachowcowi Nowakowi pierwszeństwo przed Chjeno-Piastem, gdy PPS zostaje w opozycji.
- Bezpartyjny premier sam ocenia żądania PPS (jak w M02): ideałem jest jego program, a relacja z PPS wynosi 50.
- Partia premiera nie stawia ultimatum własnemu gabinetowi. Gdy wychodzi z gabinetu, premier podaje się do dymisji.
- Przedłużenie z 9.3: gdy termin już minął, trzy miesiące liczymy od renegocjacji. Inaczej przedłużenie nigdy nie odpowiadałoby na ultimatum.
- Żądaniem karty 7.6 jest w grze osłona pracownicza z 9.1 (finansowana, `fiscal=+2` jak w M02). Przyjęta trafia do umowy jako obietnica czekająca na etap 4, bez terminu; ultimatum pojawi się w grze dopiero z programami etapu 4 (decyzja 5).
- Wniosek o odwołanie: kluby związane z gabinetem głosują przeciw, pozostałe według oceny programu (poniżej 40 za odwołaniem, inaczej wstrzymują się), KPP i Inni się wstrzymują. Wniosek bez odpowiedzi PPS rozstrzyga się przy następnym rozliczeniu, z PPS wstrzymującą się.
- Listy: stałe profile programów (`list_profiles_v1`, P); potrzebę partnera wyznacza jego najlepsza inna lista. Wspólna lista liczy się w metodzie 6.1 i ma kolor pierwszej partii. Odrzucona propozycja wraca dopiero po zmianie relacji, reputacji, kar za naruszenia albo wykonanych zobowiązań.
- Reakcje frakcji na zerwanie z 9.8 nie mają jeszcze liczb P; wejdą z etapem 5.
- Wybór marszałka (7.5): pakiet Rataja tworzy umowę z Piastem z dwoma wykonanymi zobowiązaniami (głosy PPS i udział w komisjach) i stałą obietnicą obrony regulaminu. Zwycięstwo Daszyńskiego jako kandydata PPS daje reputację +5. Wcześniejszych zobowiązań do kandydata na marszałka żadna karta etapu 3 nie tworzy, więc warunki 7.5, które je czytają, pozostają niespełnione.
- Poprawiony błąd reguł: fachowca, którego gabinet upadł, wykluczamy także wtedy, gdy jego gabinet jeszcze pełni obowiązki.
- Karty `dealing_with_toleration` i `shuffle_cabinet` nie wymagały zmian: blokuje je już `polish_government_safeguards`. Karta `social_welfare` pozostaje grywalna, gdy PPS jest w rządzie.

**Dla następnych etapów:**
- Etap 4: programy dają obietnicom terminy i wykonanie; obietnica budżetowa, `unagreedBurdenPoints` i wskaźniki kryzysu (niezadowolenie, waluta, kredyt); konstruktywne wotum po reformie (`S.parliament.constructive_vonc`).
- Etap 5: reakcje frakcji na zerwanie; agenda KPP i przygotowanie układów `united_left` i `workers_front`.
- Etap 7: karta 9.1, gabinet Piłsudskiego i zagrożenie instytucji w `severeCrisis`.
- Etap 8: kalibracja gabinetów mniejszościowych, podpisów dla fachowców i obalenia gabinetu przez jedną partię.
- Zapisy ze schematu 3 (etap 2) wymagają nowej gry.

## 14. Ustalenia z etapu 4

**Wynik etapu (K):**
- Nowe pliki:
  - moduły reguł `source/rules/polish_economy.js` (gospodarka, budżet, presje, kryzysy, przepływ 5.6 i odpływ 17.4) i `source/rules/polish_projects.js` (projekty, ustawy, instrumenty, pakiety, przegląd gabinetu, ustawa D, reformy 7.6, karty i wydarzenia, kolejność rozliczenia 4.2);
  - trzynaście kart rządowych `polish_gov_*` w `source/scenes/government_affairs/`;
  - stałe karty agendy, ustawy D i Budżetu (`source/scenes/polish_agenda.scene.dry`, `source/scenes/polish_unemployment_bill.scene.dry`, `source/scenes/polish_budget_package.scene.dry`), karta reformy konstytucyjnej w talii „Parliament” (`source/scenes/polish_constitution_project.scene.dry`) i trzy wydarzenia (`source/scenes/polish_event_stabilization.scene.dry`, `source/scenes/polish_event_credit_crisis.scene.dry`, `source/scenes/polish_event_austerity_1926.scene.dry`);
  - testy `tests/rules-economy.test.js`, `tests/rules-projects.test.js`, `tests/polish-economy.test.js` i `tests/polish-government-cards.test.js`.
- Zmienione pliki:
  - `source/rules/polish_rules.js` (schemat 5 z dziedzinami `S.economy` i `S.society`, lista `S.parliament.laws`, rekord `S.chapter.unemployment_bill`, trzy wydarzenia w kolejce 4.5, jeden krok doradcy w karcie otwartej przez niego) i `source/rules/polish_institutions.js` (lista ustaw, reguła przeglądu w Senacie);
  - `source/rules/polish_government.js`: obietnice programowe z projektami, terminami i regułami (decyzja 3), odpowiedzialność PPS tylko za własne resorty (5.4), kryzys walutowy i kredytowy w `majorCrisis`, konstruktywne wotum z rekordu 7.6, warunki stabilizacji Grabskiego w formowaniu (9.7), punkty nieuzgodnionego obciążenia w napięciu umów;
  - sceny `root` (nowa gra z profilem gospodarki, rekord trzech reform), `post_event` (polskie rozliczenie w kolejności 4.2, niemiecki blok wyłączony warunkiem, poparcie liczone ponownie po przepływie), `main` (trzy stałe karty, powiadomienia gospodarki), `status`, `library`, `polish_opening_state`, `polish_cabinet_formation` (menu warunków stabilizacji) i `sejm_election` (nieaktualne zdanie o niemieckiej opiece);
  - blokady `not polish_economy_system` w niemieckich kartach `economic_policy`, `fiscal_policy`, `social_welfare`, `labor_rights`, `agricultural_policy`, `education_science`, `judiciary`, `constitutional_reform` i `economic_democracy` oraz w wydarzeniu `high_inflation`; pliki pozostają w repozytorium;
  - doradcy: Arciszewski otwiera kartę praw pracowniczych albo świadczeń, Moraczewski kartę robót publicznych, każdy z jednym krokiem za 0 T; oba wymagają PPS w gabinecie z Pracą;
  - `out/html/index.html` (dwa nowe skrypty), `.gitignore` i `tests/helpers/dendry.js`;
  - dotychczasowe testy: schemat 5, obietnice z terminami zamiast `awaiting_stage4`, izolowany program testowy w testach mechaniki napięcia, polska karta świadczeń zamiast niemieckiej `social_welfare` i dwa nowe moduły w testach, które same je wczytują.
- Testy: 251 z 251, w tym 66 nowych.
- Przeglądarka:
  - nowa gra: Status z budżetem w B, walutą, inflacją miesięczną, płacami, produkcją, kredytem, bezrobociem, presją agrarną i nastrojem przedsiębiorców;
  - karta reformy konstytucyjnej w talii „Parliament”, przygotowanie tekstu i agenda z wnioskiem zablokowanym do utworzenia Senatu;
  - po wyborach 1922 gabinet PPS–Wyzwolenie z Pracą i Skarbem: karta świadczeń (osłona 2 B), talia „Government Affairs”, przygotowanie robót, samodzielna reforma rolna ministra Wyzwolenia, blokada nowych programów poniżej −2 B;
  - wniosek o gwarancje demokratyczne przyjęty przez Sejm większością 2/3 i przez Senat po 30 dniach;
  - kryzys finansowy, wydarzenie stabilizacji z wariantami przy Skarbie PPS, uruchomienie reformy walutowej, emisja z karty finansowej, złoty w VIII 1924 i spadek inflacji;
  - wykres gospodarki w Bibliotece z polskimi etykietami.
  - Bez nowych błędów silnika. W konsoli są tylko wcześniejsze błędy interfejsu (`toFixed` w `game.js`, brakujące pliki dźwięku). Test w przeglądarce wykazał trzy usterki wyświetlania (podwójna kropka po przyczynie ograniczenia, „business cycle −0,00”, dwa rodzaje minusa) i jedną niespójność reguł (poniżej).

**Uzupełnienia przy wdrożeniu, w granicach decyzji (P):**
- **Kolejność rozliczenia (4.2):** zegar przesuwa się jak dotąd na początku rozliczenia, ale kroki okresu t — ustawy, przegląd gabinetu, finanse, projekty, gospodarka, przepływ i obietnice — liczą się z datą t. Umowy (9.2) rozliczają się jak w etapie 3.
- **Procedura ustawy (7.2, C4):**
  - Sejm głosuje w decyzji; przed utworzeniem Senatu (do wyniku wyborów 1922) ustawa wchodzi w życie z głosowaniem Sejmu;
  - uproszczony Senat głosuje po 30 dniach tą samą regułą klubów; sprzeciw wraca po 60 dniach jako słabszy wariant ustawy (w D: ograniczony) albo jako odrzucenie;
  - Sejm przyjmuje zmiany zwykłą większością albo odrzuca je większością 11/20; bez żadnej z nich ustawa upada;
  - kluby związane z gabinetem głosują za jego ustawami, chyba że przekraczają ich czerwoną linię; pozostałe według oceny programu (od 60 za, poniżej 40 przeciw, inaczej wstrzymanie); KPP i Inni się wstrzymują;
  - ustawy mają: inspekcja czasu pracy, reforma rolna, komasacja, szkoła świecka, reforma walutowa i instrumenty podatkowe (bez oszczędności administracyjnych). Które ustawy pracownicze obowiązują na starcie gry: `TBD — historical research required`.
- **Pakiety i karta Budżet:** pakiet gabinetu głosuje się w rozliczeniu następnego miesiąca; PPS w gabinecie albo wspierająca go odpowiada raz za 0 T. Stanowisko finansowe pakietu to zaokrąglona średnia stanowisk jego instrumentów. Partner, który głosował przeciw pakietowi oddalonemu od jego ideału o co najmniej 2, dostaje raz `min(3, odległość − 1)` punktów nieuzgodnionego obciążenia.
- **Przegląd gabinetu (17.16.4), profile:**

  | Profil | Dochody przy niedoborze | Stabilizacja |
  |---|---|---|
  | Fachowcy (Ponikowski, Nowak, Sikorski) | szersza podstawa, potem oszczędności administracyjne | stopniowa |
  | Grabski | jak fachowcy | szybka z oszczędnościami i podatkiem majątkowym; przy tolerowaniu za pożyczkę — stopniowa z pożyczką |
  | Skrzyński | szersza podstawa, potem podatek majątkowy | stopniowa |
  | Chjeno-Piast | szersza podstawa, potem oszczędności administracyjne | szybka z oszczędnościami |
  | Lewica i centrolewica | podatek progresywny, potem majątkowy | z osłonami (bez osłony stopniowa) |
  | Szerokie gabinety | szersza podstawa, potem podatek majątkowy | stopniowa |

  Pakiet jest konieczny przy ograniczonych bieżących wypłatach, przy stabilizacji i w sporze Grabskiego o kredyt; po odrzuceniu premier przedstawia jedną poprawkę, a po jej odrzuceniu składa dymisję. Poprawka ma pierwszeństwo przed nową ofertą, więc tej samej oferty nie ponawia się.
- **Obietnice (decyzja 3):** ziemia 0/+1 — parcelacja (przyspieszona przy +1), pierwsza transza do t+6; finanse +1/+2 w gabinecie partyjnym — osłona w pełnym wariancie do t+4 (9.1); każdy punkt finansów, Kościoła i równość prawna — reguła; instytucje — projekt 7.6 bez terminu; ziemia +2 czeka na zmianę gwarancji własności (luka); wojsko i autonomia czekają na etap 7. Decyzja łamie regułę, gdy jest po drugiej stronie zera od uzgodnionego stanowiska (przy wspólnym ciężarze 0 tylko cięcie świadczeń), szkoła świecka łamie uzgodniony kompromis religijny, a preferencja polskiej większości i dominacja języka polskiego łamią równość prawną.
- **Reforma walutowa poniżej −2 B:** reforma odpowiadająca na kryzys finansowy 11.9 nie jest dobrowolnym programem z 11.3, więc — jak konieczny pakiet gabinetu — może ruszyć poniżej −2 B; jej koszt nadal ogranicza wykonanie. Wynik testu w przeglądarce.
- **Inne liczby i profile P:** limit emisji równy brakującej przestrzeni, od 1 do 3 punktów; zamówienia według syntetycznego profilu `synthetic_orders_v1`; transze ziemi wspólne dla trzech wariantów parcelacji, transze modernizacji osobno dla każdego wariantu, a poprawa warunków wsi z jednej transzy to 1/3 wartości wariantu; agenda uruchamia jeden przygotowany projekt danego typu naraz; jedna osłona dla tych samych odbiorców (D zmienia istniejącą); jedna zasada językowa szkół mniejszości; wydarzenie 9.12 raz w rozdziale; przegląd 1926 (9.13) w szóstym miesiącu gabinetu Skrzyńskiego albo przy kryzysie budżetowym w I–IV 1926, raz.
- **Luki zapisane dla następnych etapów:** umowy wykonania z partnerem nie da się jeszcze wynegocjować, więc karty rządowe otwiera tylko resort PPS; PPS w gabinecie bez Skarbu może tylko odpowiadać na pakiety; wywłaszczenie bez odszkodowania nie ma karty zmiany gwarancji własności; umowa tolerowania Grabskiego na 6 miesięcy z przeglądem po 3 (9.7) nie jest jeszcze zapisana.
- **Poprawione przy wdrożeniu:** przyjęte żądanie osłony dublowało obietnicę już zapisaną w programie; warunki Grabskiego ginęły przy powołaniu gabinetu fachowców; nieaktualne zdania o „tymczasowej niemieckiej opiece” w scenie wyborów i w Bibliotece.

**Dla następnych etapów:**
- Etap 5: komórki i zaufanie (5.1–5.4) stosują zaufanie z `pending_effects` i nagrodę autorską 5.4; profile komórek wskazują akceptowanych konkurentów odpływu 17.4; spółdzielnie otwierają wariant spółdzielczy 8.5 i przetwórstwo 8.9; Czapiński dostaje Socjalistyczny Program Gospodarczy; testy „Populacja”, „Warianty funduszu inwestycyjnego” i „Szkoły”.
- Etap 6: zakłady i związki otwierają układy zbiorowe, odstępstwa, ratunek zakładu, przejęcie i reprezentację; zasięg związków otwiera osłony Grabskiego; `strikeDisruption` zasila produkcję; testy „Ratunek zakładu” i „Wspólna karta gabinetowa”.
- Etap 7: niezadowolenie 15.1 stosuje ulgi i koszty z `pending_effects`; demokracja dostaje +3 z gwarancji; sprawy restrykcji otwierają przegląd w Sprawiedliwości; autonomia i karty MSW oraz wojska; testy „Reprezentacja”, „Autonomia”, „Sprawiedliwość” i „Rozszerzyć i skupić osłony”.
- Etap 8: oś polityczna 17.16.3 i kalibracja przepływów, odpływu, profili gabinetów i budżetu.
- Zapisy ze schematu 4 (etap 3) wymagają nowej gry.

## 15. Ustalenia z etapu 5

**Wynik etapu (K):**
- Nowe pliki:
  - moduły reguł `source/rules/polish_electorate.js` (komórki, sondaż i głosy, zatrudnienie, trend klas, kampanie, transfery, przepływ 5.6 i odpływ 17.4 na komórkach) i `source/rules/polish_party.js` (księga partii, organizacje, Milicja, branże związków, stanowiska i program, KPP i Bund, kampanie, nagrody 5.4, frakcje, sprawy i E3, karta Jedność, doradcy);
  - piętnaście kart talii partyjnej `polish_party_*` w `source/scenes/party_affairs/`, stała karta agendy partii (`source/scenes/polish_party_agenda.scene.dry`) i karta E3 (`source/scenes/polish_event_faction_split.scene.dry`);
  - testy `tests/rules-party.test.js`, `tests/polish-party.test.js`, `tests/rules-electorate.test.js`, `tests/rules-strategy.test.js` i `tests/rules-factions.test.js`.
- Zmienione pliki:
  - `source/rules/polish_rules.js`: schemat 6 z dziedzinami `S.party_orgs`, `S.militia`, `S.unions` i `S.faction_cases`, sprawdzenie komórek i frakcji w walidacji, E3 w kolejce z kluczem sprawy, bez trzech dawnych kryzysów frakcji;
  - `source/rules/polish_economy.js` i `source/rules/polish_projects.js`: przepływ 5.6 i odpływ 17.4 na komórkach, zmiana zatrudnienia komórek po rozliczeniu gospodarki, spółdzielnia PPS jako wykonawca wariantów spółdzielczych, arbitraż zależny od linii ustrojowej, reakcje Lewicy przez wspólny rachunek frakcji;
  - `source/rules/polish_government.js`: reakcje frakcji z przyczyną i jedną normalizacją, reakcje na zerwanie poparcia (pusty profil P), cecha `territorial_autonomy` od autonomii +1, klub bez profilu wstrzymuje się w prognozie;
  - `source/rules/polish_institutions.js`: koniec dodatkowej frekwencji z wyborami, raport z linią, programem, organizacjami, Milicją i związkami, aktualna lista `NOT_MODELLED`;
  - sceny `root` (komórki i stan partii nowej gry), `post_event` (księga partii w punkcie 6, mosty wyłączone, wynik z komórek), `election_algorithm`, `sejm_election_result` (podział klubu PPS w dniu wyniku), `main` (stała karta agendy partii), `status` (pieniądze, organizacje, Milicja, branże) i `polish_opening_state`;
  - warunek `not polish_party_rules` w odziedziczonych kartach partyjnych; pliki pozostają w repozytorium. Trzy sceny kryzysu frakcji mają znacznik `event` zamiast `pl_event`;
  - doradcy: akcje z 10.4.3 przez `PolishParty.advisorAction`, bez `pro_republic`; Próchnik, Drobner i Dubois mają tylko powrót. Trzynaście kart `polish_gov_*` ma zamknięcie w trybie doradcy;
  - `out/html/index.html` (dwa nowe skrypty), `.gitignore` i `tests/helpers/dendry.js`;
  - dotychczasowe testy: schemat 6, kasa według księgi, ponowne zasianie komórek w testach, które ustawiają wiersze klas, kryzysy frakcji przez E3 z testową przyczyną, doradcy według 10.4.3, karta Media jako akcja miesiąca zamiast odziedziczonej kampanii.
- Testy: 327 z 327, w tym 76 nowych.
- Przeglądarka:
  - nowa gra: Status z pieniędzmi partii (2 R, wpływy 0,5 R, stałe koszty 0,3 R), organizacjami, Milicją i trzema branżami;
  - talia partyjna daje polskie karty;
  - kampania prasowa do robotników: PPS 32,56% → 33,19% wśród nich; po miesiącu kasa 1,2 R;
  - akcja Pużaka za 0 T z odnowieniem 6 M: sprzeciw 0/8/0;
  - obecna linia karty kierunku jest zablokowana, a zamknięcie karty nic nie kosztuje i karta wraca do ręki;
  - zbiórka w agendzie partii (+2 R) i zmiana stanowiska autonomii.
  - Bez błędów silnika. W konsoli są wcześniejsze błędy interfejsu (`toFixed` w `game.js`, brakujące pliki dźwięku) i błędy wykresu w Bibliotece (luki poniżej).

**Uzupełnienia przy wdrożeniu, w granicach decyzji (P):**
- **Komórki (decyzja 1A):** preferencje z wierszy klas skalowane do dotychczasowego wyniku krajowego; wynik krajowy zaokrąglony do 10⁻¹², żeby szum obliczeń nie zmieniał mandatów. Wiersze klas są średnimi komórek, także mniejszości danej klasy, więc ich liczby są inne niż przed etapem (np. PPS wśród robotników 32,6% zamiast 38,6%).
- **Kampanie:** najpierw temat, potem odbiorcy; komórki robotnicze czytają średni zasięg trzech branż, pozostałe własną bazę. Premia kierunku: temat parlamentarny przy ustawie PPS w procedurze, obrona zdobyczy przy działającej osłonie lub inspekcji (×1,15 przy proponowanym cięciu), temat klasowy zawsze.
- **Nagrody 5.4:** odbiorców projektu przypisuje komórkom prosty klucz, np. osłona → bezrobotni, reforma rolna → chłopi, szkoły mniejszości → komórki mniejszości.
- **Odpływ 17.4:** profil testowy komórek nie ma czerwonych linii, więc akceptowany jest każdy konkurent.
- **Rozłam i czystka:** głosy Lewicy przechodzą do KPP, pozostałych frakcji do Innych. Posłowie przechodzą do technicznego klubu `pps_split_<frakcja>`, który wstrzymuje się w głosowaniach i nie wchodzi do ofert. Doradcy zostają. Podział klubu PPS na frakcje liczymy przy otwarciu i w dniu wyniku wyborów.
- **Talia partyjna:** 16 kart manifestu 10.5; „International Relations” i „Political Rally” nie mają następcy.
- **Zerwanie poparcia (9.8):** mechanizm reakcji frakcji działa z pustym profilem testowym.
- **Wynik wspólnej akcji z KPP:** `PolishParty.resolveTrial` zapisuje raz sukces, niepowodzenie (−5 relacji) albo złamanie reguł (−15 akceptacji w każdej frakcji); wywoła go etap 6.
- **Zależności od etapów 6–7** są widoczne i zablokowane z powodem, a ich skutki czekają na swój etap: demokracja z akcji Niedziałkowskiego (`pending_effects`), śledztwo prasowe, próby z KPP (bez wspólnych żądań), zakaz i represje Milicji, zagrożenie demokracji, adresat „przemoc antykonstytucyjna”, tolerowanie Ziemięckiego oraz własność publiczna i reprezentacja pracownicza Czapińskiego.
- **Zmienione liczby:** akcje doradców według 10.4.3; Milicja według kosztów i bramek 13.3, bez współpracy ze związkami i bez rozwiązania oddziału; Czapiński ma na razie tylko wariant finansowy.
- **Stanowiska a ideały PPS:** stanowiska zmieniają ideały w tematach `institution` i `autonomy`; czerwona linia ZLN „autonomia terytorialna” obejmuje też autonomię województw (+1).

**Poprawione przy wdrożeniu:**
- akcja Perla i akcja Jaworowskiego normalizowały siły frakcji po każdej zmianie, a nie raz na końcu;
- karty `polish_gov_*` otwarte przez doradcę nie miały zamknięcia w trybie doradcy;
- podział klubu PPS na frakcje po wyborach powstawał przy pierwszym odczycie, a nie w dniu wyniku;
- Status pokazywał „0” przy braku zaległości;
- ekran startowy podawał maj 1928 jako następne wybory; teraz podaje 19 II 1928 z kalendarza gry;
- zapisy schematu 5 bez frakcji w `Q.S` wywoływały błąd warunków kart; karty partii wymagają zgodnego zapisu.

**Luki zapisane dla następnych etapów:**
- wykresy poparcia i gospodarki w Bibliotece nie pokazują polskich danych: oś czasu zaczyna się na stałe w I 1928 (`out/html/d3-linegraph.js`), a skala wykresu poparcia czyta niemieckie klucze `spd` i `nsdap`; błąd sprzed etapu 5, zgłoszony do osobnej poprawki;
- Zgromadzenie Narodowe w XII 1922 liczy mandaty z migawki dnia wyborów (`Q.sejm_parliament`), więc posłowie, którzy odeszli w rozłamie przed jego zebraniem, liczą się jeszcze jako PPS;
- wspólne akcje z KPP i Bundem nie mają jeszcze wykonania: `communist_cooperation.demands` i wyniki prób przyniosą strajki etapu 6;
- reakcje frakcji na zerwanie poparcia mają pusty profil.

**Dla następnych etapów:**
- Etap 6: gotowość, spory, strajki, E6, ugody i osłony Grabskiego na trzech istniejących branżach; wspólne żądania i wyniki prób z KPP (`resolveTrial`) oraz wspólne akcje z Bundem; rekordy przedsiębiorstw dla wariantów Czapińskiego.
- Etap 7: demokracja (+5 Niedziałkowskiego czeka w `pending_effects`), zagrożenie demokracji w `strategyFactor`, zakaz i represje Milicji, użycie Milicji i AS w ochronie i w zamachu, śledztwo prasowe, gabinet `pilsudski_aligned` dla Ziemięckiego, niezadowolenie i radykalizacja komórek.
- Etap 8: profil reakcji na zerwanie, profil komórek z czerwonymi liniami i historyczne proporcje komórek.
- Zapisy ze schematu 5 (etap 4) wymagają nowej gry.

## 16. Ustalenia z etapu 6

**Wynik etapu (K):**
- Nowe pliki:
  - moduł reguł `source/rules/polish_unions.js`: kroki sporu, potencjał akcji, rekord strajku i miesiąc strajku, runda rokowań, zgoda związku, ugoda i jej wykonanie, wejścia do gospodarki, droga płacowa i Kraków, komuniści w strajku, władze, odpowiedź Sejmu, E6, opóźnienie kolei, układy zbiorowe, zakłady i odstępstwa;
  - stała karta „Trade Unions” (`source/scenes/polish_union_agenda.scene.dry`), karta strajków 1923 (`source/scenes/polish_event_strike_1923.scene.dry`), kroki strajku (`source/scenes/polish_strike_steps.scene.dry`), odpowiedź Sejmu (`source/scenes/polish_event_strike_response.scene.dry`) i E6 (`source/scenes/polish_event_strike_rejection.scene.dry`);
  - testy `tests/rules-strike.test.js` (27) i `tests/polish-strike.test.js` (6).
- Zmienione pliki:
  - `source/rules/polish_rules.js`: schemat 7 z dziedzinami `S.strikes` i `S.enterprises`, trzy wydarzenia strajkowe w kolejce z kluczem sprawy (`strike`);
  - `source/rules/polish_party.js`: w księdze członkostwo zbliża się do celu przed liczeniem wpływów (M18); wpływ do funduszy branż przeniesiony do modułu związków; linie strajku i uzgodnionego końca w nastawieniu branż; zapis wyniku próby z KPP;
  - `source/rules/polish_projects.js`: wejścia strajkowe w rozliczeniu miesiąca; układ zbiorowy, odstępstwo, ratunek zakładu, przejęcie i reprezentacja w kartach Pracy i Przemysłu; projekty `plant_rescue` i `enterprise_representation` w agendzie; ustawa `public_control`; profil Grabskiego przy osłonach; odpowiedź na wydarzenie stabilizacji prowadzi do oferty tolerowania;
  - `source/rules/polish_government.js`: rozmowa o osłonach Grabskiego, jego odpowiedź w tym samym zatwierdzeniu, obowiązki osłon w umowie tolerowania, termin 6 M z przeglądem po 3 M, odpowiedzi 9.8 na przegląd i koniec terminu; poprawka odszukania umowy tolerowania eksperta (poniżej);
  - `source/rules/polish_economy.js` (odczyt `strike_disruption` i `wage_agreement_pp`) i `source/rules/polish_institutions.js` (strajki i zakłady w raporcie, lista `NOT_MODELLED`);
  - sceny `root`, `post_event` (początek miesiąca związków w punkcie 4, koniec po księdze partii), `main` (stała karta związków), `status` (wiersz strajków), `polish_opening_state`, `polish_agenda`, `polish_cabinet_formation`, `polish_government_response`, `polish_government_support` i `polish_event_stabilization`; karty `polish_gov_labor_rights` (podmenu branż) i `polish_gov_industry` (zapis zakładów, podmenu reprezentacji); dwa warianty Czapińskiego otwierają kartę Przemysłu;
  - warunek `not polish_union_rules` w `events/labor_unrest` i `events/unions_declare_independence`; pliki zostają;
  - `out/html/index.html` (nowy skrypt po `polish_party.js`), `.gitignore` i `tests/helpers/dendry.js`;
  - dotychczasowe testy: schemat 7, lista i kolejność modułów, globalny `PolishUnions`, zablokowany ratunek bez zakładu, test Grabskiego z etapu 4;
  - kontrole: `analysis/card-catalogue/check.cjs` (definicje E3 i E6 w kolejce) i `analysis/implementation-plan/check.cjs` (24 akcje doradców, asercje etapu 6).
- Testy: 360 z 360, w tym 33 nowe.
- Przeglądarka (tymczasowy serwer statyczny na porcie 8010, bo port 8000 zajmował serwer innej sesji):
  - nowa gra w schemacie 7 ze stałą kartą „Trade Unions”;
  - karta Praw pracowniczych pokazuje zapisany zakład, odstępstwo jest zablokowane z powodem, podmenu branż daje układ w przemyśle za jeden miesiąc: płace 100 zamiast ok. 98,9, które dałaby sama inflacja miesiąca;
  - karta Przemysłu pokazuje zakład, reprezentacja jest zablokowana przy prywatnym właścicielu, ratunek czeka w agendzie, a jego uruchomienie daje 50% budowy w pierwszym rozliczeniu;
  - bez błędów silnika i ze zgodnym stanem.

**Uzupełnienia przy wdrożeniu, w granicach decyzji (P):**
- **Kroki sporu (14.1):** uzgodnienie postulatów (gotowość +15, cd 2 M; ograniczone — płace, próg 40; szerokie — płace i warunki, próg 60), zebranie o linii strajku albo uzgodnionego końca (+15), mediacja (sprzeciw −8) i rozpoczęcie protestu; każdy krok 1 T i 0 R.
- **Potencjał i miesiąc (14.2–14.3, 17.4):** udział = zasięg × gotowość skuteczna/100 × posłuch linii strajku; koszt 0,10 + 0,01 × udział R/M; wiarygodny nacisk przed strajkiem × min(1, fundusz / 2 koszty), w strajku aktywny udział. Fundusz płaci raz w miesiącu, brak pieniędzy obniża udział i daje +3 sprzeciwu; zmęczenie +5 w miesiącu strajku, −5 bez niego. Zakłócenie produkcji: wagi 0,5/0,3/0,2 i znaczenie branż 60/90/40, odczyt −0,03 × zakłócenie w produkcji (11.5).
- **Runda rokowań (14.4):** jeden zapisany rzut na rundę; szansa = clip(0,5 + (nacisk − próg)/100, 0,05, 0,95), gdzie nacisk = 0,5·wiarygodny + 0,3·znaczenie + 0,2·kruchość; przy kilku branżach liczy się najmniejsza szansa; mniejsza oferta płacowa czyta ten sam rzut. Żądanie polityczne nie ma wykonawcy: odmowa bez rzutu, a następna runda wraca do oferty płacowej (profil M02).
- **Zgoda związku (17.4, M12):** 0,5·100·spełnienie + 0,3·zaufanie + 0,2·max(100·(1 − pokrycie), zmęczenie) ≥ 50; pełna oferta zawsze przyjęta, czerwona linia „bez represji wobec strajkujących” zawsze odrzucona. Ofertę rządu PPS odpowiada w odpowiedzi Sejmu (17.5.1), za 0 T.
- **Ugoda (14.5):** klauzule z wykonawcami; płace i warunki wykonują pracodawcy w miesiącu po podpisie; klauzula płacowa daje +2 pp × zasięg płacowy branży (0,6/0,2/0,2) przez dwa miesiące. Pełne wykonanie zapisuje ulgę −4 dla etapu 7. Zakończenie narzucone bez warunków: sprzeciw +10 i zaufanie −8.
- **E6:** po przyjęciu oferty liczymy odmawiających uczestników i niezwiązaną porozumieniem część komunistów; karta pojawia się od 10 punktów udziału, raz na parę strajk + ugoda. Utrzymanie ugody narzuca koniec odmawiającym; poparcie dalszego strajku łamie ugodę (wiarygodność −5 raz).
- **Droga płacowa (17.16.5):** trzy pełne miesiące płac realnych poniżej 80 otwierają sprawę płacową przemysłu i kolei, najwcześniej 3 M po zamknięciu poprzedniej. Rozmowy dają od razu rundę; strajk ograniczony i żądanie dymisji wymagają odrzuconego żądania. Żądanie dymisji: Lewica −3 sprzeciwu przy linii klasowej, inaczej Centrum +8. Brak przyjętej ugody do następnego rozliczenia zapisuje +8 niezadowolenia dla etapu 7.
- **Władze (decyzja 3A):** profil `strike_state_profiles_v1` — Chjeno-Piast sięga po przymus po odrzuconej rundzie aktywnego strajku, gabinet z PPS szuka ugody, pozostałe chronią zgromadzenia. Minister PPS zastępuje profil tylko w swoim zakresie: Praca mediuje, MSW dysponuje policją, Sprawy Wojskowe decydują o kolei; Praca nie wydaje rozkazów policji. Przymus dodaje żądanie cofnięcia represji, a na kolei militaryzację (+10 niezadowolenia dla etapu 7). Kraków to sprawa płacowa w X–XI 1923 z represją.
- **Starcie:** ryzyko clip(0,10 + 0,004·udział niekontrolowany + 0,25 − 0,20·posłuch, 0, 0,90), jeden zapisany rzut na rundę; przemoc i narażenie na represje czekają na etap 7. Ochrona Milicji (0,5 R, wybór na początku strajku) zmniejsza narażenie o min(0,40; 0,10 × siła), nie zapobiega starciu; w starciu Milicja traci 2% przydzielonych ludzi.
- **Komuniści (9.6):** działają w strajkach przemysłu i kolei przy co najmniej 5% KPP wśród robotników; wkład 10 punktów, cel szeroki. Pełna współpraca wiąże cały wkład, ograniczona połowę; dyscyplina to jeden rzut `kpp_discipline:<strajk>`; wynik próby zapisuje się raz przy końcu strajku (sukces +5 albo +2 relacji). Bund: strajk przemysłu przy linii współpracy żydowskiej jest wspólną akcją (+5 za zgodne zakończenie, −5 za złamanie ugody przez PPS).
- **Odpowiedź Sejmu (17.5.1):** trzy odpowiedzi za 0 T raz na fazę sprawy: żądania, ugoda albo przywrócenie porządku (PPS cofa poparcie; związek: sprzeciw +10 i zaufanie −8 raz; wezwanie nie kończy protestu i nie jest rozkazem dla policji).
- **Kolej (16.5):** funkcja opóźnienia `railDelayPhases`: jedna faza przy udziale ≥ 40 i koordynacji ≥ 50, dwie przy ≥ 65 i ≥ 70; odczyta ją zamach w etapie 7.
- **Zakłady (decyzja 2A):** profil `synthetic_plants_v1` — zakład w trudności ma utraconą zdolność 20 i 10% robotników branży; zapis raz na epizod kryzysu kredytowego albo aktywnej reakcji przedsiębiorców i raz na branżę strajku zakończonego wyczerpaniem. Nazwy to „zakład przemysłowy / warsztat kolejowy / majątek nr N”. Karta Przemysłu działa na zakładach przemysłu i warsztatach kolejowych; majątek pracy rolnej nie należy do jej kompetencji.
- **Układ zbiorowy (8.1):** podmenu trzech branż; 1 T, 0 B; skutek płacowy jak klauzula płacowa ugody; termin 12 M. Blokady: otwarty spór w branży, trwający układ i aktywna reakcja przedsiębiorców (pracodawcy nie podpisują).
- **Odstępstwo (8.1):** 1 T, 0 B, dla najstarszego zakładu w trudności, na 6 M; presja kapitału −4, niezadowolenie objętych +3 dla etapu 7. Podstawą prawną jest obowiązująca ustawa o czasie pracy z inspekcji tej karty; odstępstwo nie usuwa ochrony czasu pracy.
- **Ratunek, przejęcie i reprezentacja (8.6, 12.4, 17.12.5):** ratunek to duży projekt bez ustawy, pod umową właściciela będącą warunkiem kredytu: 2 B przez 2 M, potem 1 B; po ukończeniu przywraca zdolność zakładu, bez premii dla gospodarki. Przejęcie to ustawa (program `fiscal` +2) i presja +15 przy wejściu w życie; wariantu konfrontacyjnego (+25) nie ma. Reprezentacja tylko w zakładzie publicznym: konsultacje 1 T, 0 B, niezadowolenie −2; współdecydowanie z własną ustawą, 1 B przez 2 M, −4 albo brakujące −2; reprezentantem jest związek branży. Opcje wskazują najstarszy pasujący zakład.
- **Grabski (9.7):** rozmowę o osłonach otwierają aparat 2, branża z zasięgiem 40 i relacja 40 z Grabskim (neutralne 50 w jego profilu). Odpowiada w tym samym zatwierdzeniu: ocena 8.3 dla obciążenia majątku (`fiscal` +2) z potrzebą PPS, odmowa, gdy ma działające poparcie bez PPS, pieniądze (nowy podatek majątkowy, budżet prognozy co najmniej −2 B) i minister Pracy jako wykonawca. Przyjęte osłony dodają do umowy tolerowania pełną osłonę do t+4 i regułę warunków, a profil gabinetu przechodzi na stabilizację z osłonami i podatek majątkowy. Tolerowanie Grabskiego to umowa na 6 M z przeglądem po 3 M; oba otwierają odpowiedź 9.8; utrzymanie poparcia na końcu terminu odnawia umowę na 6 M, a bez odpowiedzi tolerowanie trwa. Odpowiedź na wydarzenie stabilizacji bez Skarbu otwiera tę samą kartę formowania z Grabskim i osłonami.
- **Czapiński:** warianty własności publicznej i reprezentacji otwierają kartę Przemysłu z jednym krokiem za 0 T; bez zakładu albo zakładu publicznego są zablokowane z powodem.

**Poprawione przy wdrożeniu:**
- warunki „pożyczka” z etapu 4 nie trafiały do umowy tolerowania eksperta: kod szukał umowy `pps_support`, a tolerowany fachowiec podpisuje umowę `pps`;
- początek miesiąca związków mógł zasilić fundusz dwa razy przy ponownym wejściu w to samo rozliczenie; teraz każda połowa miesiąca działa raz na okres.

**Luki zapisane dla następnych etapów:**
- skutki strajków dla niezadowolenia, radykalizacji, przemocy i narażenia na represje czekają w `S.strikes.pending_effects`, w `pending_effects` projektów i w rekordach zakładów;
- ochronę Milicji wybiera się tylko przy rozpoczęciu strajku; profil `strike_state_profiles_v1`, liczby zakładów i opcje wskazujące najstarszy zakład to wartości testowe P;
- zakład nie ma jeszcze skutku gospodarczego poza zapisem, a umowy właściciela prywatnego zakładu (dla reprezentacji) nie da się negocjować w tym rozdziale;
- pozycja `kpp_trial` agendy partii nadal wymaga zapisanego wspólnego żądania (`communist_cooperation.demands`), którego żadna sprawa jeszcze nie tworzy; próbę z KPP w strajku zapisuje krok współpracy;
- w karcie Przemysłu opcja kredytu przygotowanego przez gabinet w kryzysie kredytowym pokazuje powód „launch it from the agenda”, choć agenda PPS go nie zawiera (odziedziczone z etapu 4);
- `npm run serve` używa stałego portu 8000; równoległa sesja może go zająć.

**Dla następnych etapów:**
- Etap 7: niezadowolenie i radykalizacja (skutki zapisane w sprawach, projektach i zakładach), przemoc i demokracja ze starć, policja i wojsko, kolej (`railDelayPhases`) i Milicja w zamachu.
- Etap 8: kalibracja liczb strajków i zakładów, treść zakładów w scenariuszu, historyczne cele KPP w strajkach: `TBD — historical research required`.
- Zapisy ze schematu 6 (etap 5) wymagają nowej gry.

## 17. Ustalenia z etapu 7

**Wynik etapu (K):**
- Nowe pliki:
  - moduł reguł `source/rules/polish_politics.js`: dziennik instytucji i autorytet Sejmu, demokracja, przemoc, sprawy i restrykcje z profilem prawnym, niezadowolenie i radykalizacja komórek, presja z impulsami, wejścia scenariusza, karty B1, B2, B4 i B5, zagrożenie B3, test starcia zgromadzenia i reakcja władz na przemoc organizacji PPS;
  - moduł reguł `source/rules/polish_security.js`: zgrupowania `synthetic_test_v2` i lojalność efektywna, zdolność, rozpoznanie, policja, kontrola wojska i nominacje, umowa z Piłsudskim z przeglądem, bramki próby oraz silnik zamachu `coup_f_v1` z F4, F5, F9, wkładem kontrfaktycznym i skutkami F10+F11;
  - wydarzenia `source/scenes/polish_event_pils_criticism.scene.dry` (B2), `source/scenes/polish_event_cabinet_1922.scene.dry` (B1), `source/scenes/polish_event_assassination_response.scene.dry` (B4), `source/scenes/polish_event_niewiadomski_cult.scene.dry` (B5) i `source/scenes/polish_event_coup.scene.dry` (F3–F11); karta Sejmu `source/scenes/polish_parliament_army_oversight.scene.dry`; karty rządowe `source/scenes/government_affairs/polish_gov_interior.scene.dry`, `source/scenes/government_affairs/polish_gov_military.scene.dry` i `source/scenes/government_affairs/polish_gov_pils_agreement.scene.dry`;
  - testy `tests/rules-politics.test.js` (13), `tests/polish-democracy.test.js` (5), `tests/rules-coup.test.js` (26) i `tests/polish-coup.test.js` (13).
- Zmienione pliki:
  - `source/rules/polish_rules.js`: schemat 8 z dziedzinami `S.politics`, `S.security` i `S.coup`, walidacja autorytetu, wejścia `S.scenario.inputs`, sześć definicji kolejki (B1, B2, B4, B5, zamach) z kluczami `politics` i `coup`;
  - `source/rules/polish_government.js`: kryzys z niezadowolenia i nagłej sprawy instytucjonalnej (8.6, 8.8), kandydaci Śliwiński (okno VI–VII 1922) i Piłsudski (tylko po uzgodnionym premierostwie), formowanie po B1 bez drugiej akcji;
  - `source/rules/polish_projects.js`: projekty profesjonalizacji, śledztwa, ochrony, kontroli wojska, przeglądu i autonomii; karty MSW i Spraw Wojskowych; przegląd w Sprawiedliwości; trasa Sejmu dla kontroli wojska; odrzucona ustawa nie wraca bez zmiany; delegacja autonomii w kompetencjach szkół;
  - `source/rules/polish_party.js` (śledztwo prasowe, kampania bez akcji dla wydarzeń, adresaci polemiki bez PPS), `source/rules/polish_unions.js` (niezadowolenie robotników), `source/rules/polish_electorate.js` (niezadowolenie startowe 35) i `source/rules/polish_institutions.js` (wydarzenia kategorii 1–2 przed wyborami, koniec po zamachu, pełny raport, lista `NOT_MODELLED`);
  - sceny `root`, `post_event` (rozliczenie polityki i sił, sprawdzenie po wydarzeniach), `status`, `library`, `polish_opening_state` (oczekiwanie na B4, pierwszeństwo wydarzeń kategorii 1–2 przed formowaniem), `polish_presidential_sequence` (B3 bez menu, sukcesja), `polish_cabinet_formation` (Śliwiński i Piłsudski), `polish_agenda`, `polish_party_agenda` (ocena sił), `polish_chapter_report`, karty `polish_gov_justice` i `polish_party_media`;
  - warunek `not polish_security_rules` w 26 niemieckich scenach zapisujących `coup_progress` albo `pro_republic`: doradcy `leber`, `rosenfeld`, `sender` i `seydewitz`; wydarzenia `all_quiet`, `austrian_civil_war`, `banking_crisis`, `capital_strike`, `emergency_cuts`, `harzburg_front`, `hunger_chancellor`, `march_on_berlin`, `nazis_in_crisis`, `prussian_coup`, `return_to_normalcy`, `schleichers_schemes`, `unemployment_insurance_1`, `unemployment_insurance_weimar`, `weltbuhne` i `young_plan_right_coalition`; karty `deport_hitler`, `foreign_policy`, `military_policy`, `police`, `confronting_nazis` i `crisis_program`; pliki zostają;
  - `out/html/index.html` (dwa nowe skrypty po `polish_unions.js`), `.gitignore` i `tests/helpers/dendry.js`;
  - dotychczasowe testy: schemat 8, globalne moduły w trzech osobnych środowiskach testów, wejścia scenariusza wyłączone w testach przechodzących czerwiec 1922, B1 i formowanie przed B2, B4 w sekwencji prezydenckiej, przegląd w Sprawiedliwości;
  - kontrola `analysis/implementation-plan/check.cjs` (asercje etapu 7).
- Testy: 417 z 417, w tym 57 nowych — 53 testy z 21.1 oraz „a new game starts politics…”, drugi test „B3/B4” (odwet), „Profil M08 w silniku gry” i „Kampania od stycznia 1922 do raportu”.
- Zgodność z M08: silnik gry przeliczony na 81 układach stron w 64 zestawach (strategie, demokracja 30–75, F9 przyjęte i odrzucone) daje te same rozkłady co `analysis/m08-coup-profile/`, z różnicą 0; tabele 16.8.8, M10 i M15 wychodzą bez zmian.
- Przeglądarka (port 8000): nowa gra w schemacie 8; Status pokazuje wiersze polityki i sił państwa; agenda partii ma ocenę sił, która za 1 R zawęża przedział z ±30 do ±20 pp; miesiąc rozlicza się bez błędów. Na ekranie tytułowym konsola pokazuje błędy wykresów bez danych i ustawienia rozmiaru czcionki z `out/html/game.js`, którego ten etap nie zmieniał.

**Uzupełnienia przy wdrożeniu, w granicach decyzji (P):**
- **Niezadowolenie (15.1):** indeks warunków bezrobotnych 65, wsi z 11.6, pracujących robotników i nowej klasy średniej z płacy realnej, pozostałych 100; mapa branż: przemysł — pracujący robotnicy × 0,6, kolej × 0,2, praca rolna — wieś × 0,2; jeden poziom osłon obejmuje trzecią część bezrobotnych, bieżąca ulga w komórce do 6.
- **Wejścia scenariusza:** `S.scenario.inputs` włącza spór 1922, sprawę wojskową 1925 i uroczystość 1923; testy innych systemów wyłączają je jawnie.
- **B1:** karty kompromisu z Naczelnikiem nie ma, więc urzędujący gabinet Ponikowskiego podaje się do dymisji w VI 1922; Śliwiński zgadza się kandydować, gdy Naczelnik sprawuje urząd, w oknie VI–VII 1922; kompromisem Sejmu jest Nowak.
- **B3–B5:** sprawa zabójstwa ma etykietę skrajnej prawicy bez wskazanej partii i zamyka się przy zaprzysiężeniu następcy; kampanie B4 i B5 obejmują robotników; „obietnica publicznej mobilizacji” to kampania PPS o demokracji w ostatnich 12 M; gospodarz mszy i wspólne potępienie wymagają relacji z PSChD ≥40; niekontrolowane starcie losujemy tylko przy niepokoju z 17.4 większym od zera.
- **Siły państwa:** premierostwo Piłsudskiego czyni go kandydatem najbliższego formowania; ustawa o inspektoracie jest wnoszona od razu, a odrzucona kończy ofertę bez ulgi i bez +8; sprzeciw Centrum dotyczy samego inspektoratu, także po zmianie wariantu; konflikt nominacyjny (+8) przy relacji z Piłsudskim poniżej 40; autonomia na karcie MSW wymaga umowy z reprezentacją innych mniejszości, a ulga −3 dla objętej połowy działa jako −1,5 w komórkach; zakaz Milicji blokuje nowe działania, trwająca ochrona strajku kończy się ze strajkiem.
- **Zamach:** bramki liczymy przy rozliczeniu miesiąca dla następnego miesiąca, więc próba jest możliwa od marca 1926; posłuch kolei i Milicji przy poparciu Piłsudskiego czyta odwrotność nastawienia do legalnych instytucji; Milicja chroniąca strajk nie walczy w zamachu; warunki PPS do ustępstw to linia warunkowego poparcia albo aktywna umowa ze wspieraną stroną; złamanie obietnicy obrony legalności (Centrum +12) to linia sprzeciwu wobec ingerencji wojska, a obietnicy poparcia (Piłsudczycy +12) — linia poparcia; rozłam bez E3 obejmuje 40% frakcji, której sprzeciw po F4 wzrósł do co najmniej 60; spadek produkcji czyta strajk kolejowy jako zakłócenie; ugoda o funkcji wojskowej tworzy umowę 16.7, inspektorat — zobowiązanie ustawowe na 6 M w kontynuacji, zmiana gabinetu — dymisję i formowanie w kontynuacji.
- **Raport i izolacja:** raport ma społeczeństwo, politykę, siły państwa, niedokończone sprawy i pamięć działań; Status i Biblioteka pokazują przywiązanie do demokracji zamiast niemieckiego poparcia dla republiki.

**Poprawione przy wdrożeniu:**
- starcie w strajku jest poważnym epizodem przemocy (+10), jak mówi 17.5; część 7a przyjęła chwilowo +4;
- ujemne zero w składnikach presji zmieniało porównanie zapisu po wczytaniu;
- przegląd umowy z Piłsudskim zostawiał miesiąc bez ochrony; teraz rozstrzyga go rozliczenie ostatniego miesiąca umowy;
- zmiana wariantu umowy po zamknięciu sprawy wojskowej dawała drugą ulgę presji; ulga działa raz na umowę.
- teksty akcji Niedziałkowskiego „obrona demokracji”, odstępstwa od czasu pracy i reprezentacji konsultacyjnej mówiły, że skutek czeka na etap 7; teraz podają, że działa przy najbliższym rozliczeniu miesiąca.

**Luki zapisane dla następnych etapów:**
- karta budżetu odpowiada raz na pakiet za 0 T (decyzja etapu 4), a 17.10 mówi o 1 T za próbę;
- historyczne zgrupowania, trasy, lojalności i przebieg mediacji maja 1926, data sprawy wojskowej, przebieg sporu 1922 i miejsce uroczystości 1923: `TBD — historical research required`;
- ustępstwa zwycięzcy, inspektorat po ugodzie i nowy gabinet po zmianie gabinetu są tylko zapisane w `continuation_requirements`;
- dwa automatyczne przejścia kampanii zakończyły się zamachem jesienią 1927 i zwycięstwem Piłsudskiego (presja ok. 65, demokracja ok. 70); to sprawa kalibracji etapu 8;
- `npm run serve` używa stałego portu 8000; równoległa sesja może go zająć.
- tolerowanie warunkowe Ziemięckiego (10.4.3, A10) pozostaje zablokowane z powodem: wymaga gabinetu mniejszościowego z profilem `pilsudski_aligned`, a referencja nie określa, które gabinety mają ten profil; to decyzja projektowa do zatwierdzenia;
- punkty programu umowy gabinetowej o wojsku i autonomii mają nadal status `awaiting_later_stage`: nie są powiązane z projektami `army_control` i `limited_autonomy`, więc nie liczą się jako wykonane ani złamane; powiązanie (wariant, termin) wymaga decyzji.

**Dla następnych etapów:**
- Etap 8: treść scen i scenariusza, kalibracja liczb P (presja, demokracja, zdolność, restrykcje, B4–B5), profile historyczne punktów TBD i pełne kontrole kampanii z 21.2; decyzje o profilu `pilsudski_aligned` i o punktach programu dotyczących wojska i autonomii.
- Zapisy ze schematu 7 wymagają nowej gry.

## 18. Ustalenia z etapu 8

**Wynik etapu (K):**

*Nowe pliki:*
- `tests/helpers/strategies.js`: 13 automatów strategii PPS do pełnych kampanii — cztery przebiegi referencyjne 17.16.7 i dziewięć strategii 21.2;
- testy `tests/polish-campaign.test.js` (2) i `tests/polish-scenario.test.js` (18);
- `analysis/stage8-campaigns/` (pomiar, kalibracja 2A, [raport](../analysis/stage8-campaigns/REPORT.md));
- `analysis/stage8-research/` (raport badań 8f, notatki, pomiar sprzed decyzji).

*Zmienione pliki reguł:*
- `source/rules/polish_government.js`:
  - kompromis wojskowy jako postulat poparcia (`military_compromise`, wykonawca: gabinet);
  - konkurencyjna oferta Chjeno-Piasta, dysydenci Piasta;
  - `pilsudskiAligned`, `ppsSupportAgreement`, `militaryCaseOpen`, przypomnienie G4 przed wyborami;
  - profil `actor_profiles_v2` z historycznym tematem `autonomy`;
  - reguła 8.9 dla NPR, front z KPP po porozumieniu 9.6, neutralne notki zobowiązań.
- `source/rules/polish_politics.js`:
  - wejścia `chjeno_piast_1923`, `piast_split_1923`, `military_escalation` i `grabski_resignation_1925`;
  - daty z badań: sprawa wojskowa VII 1923, uroczystość B5 II 1923;
  - temat wystąpienia z 1922 r.; presja startowa 0; przyczyna kryzysu na karcie formowania.
- `source/rules/polish_security.js`: kompromis wykonywany przez gabinet, widok zakładki Defense, przegląd porozumienia gabinetu (A3), teksty bez TBD.
- `source/rules/polish_projects.js`: przegląd gabinetu wykonuje obietnicę wojskową; tekst kredytu przygotowanego przez rząd.
- `source/rules/polish_party.js`: tolerowanie warunkowe Ziemięckiego, linia startowa `regional_autonomy`, tekst próby z KPP.
- `source/rules/polish_unions.js`: cel KPP `structural`.
- `source/rules/polish_rules.js`: presja startowa 0, nowe wejścia scenariusza.
- `source/rules/polish_institutions.js`: raport (marszałek obradującego Sejmu po zamachu, sekcja „Beyond this chapter”, daty wejść) i lista `NOT_MODELLED`.

*Zmienione sceny i pliki strony:*
- `root`: wiersze klas otwarcia według decyzji 2A, ekran tytułowy, bez niemieckiej muzyki;
- `election_simulation`, `main` (G4, bez notatek roboczych) i `status` (polska zakładka Defense);
- `library`: wstęp, polska oś czasu 1919–1922 (od pierwszego faktu zapisanego w `HISTORICAL_SOURCES.md`, 20 II 1919), strony;
- `polish_government_support`, `polish_government_response`;
- `polish_presidential_sequence`: Zgromadzenie liczy obecne kluby;
- `polish_cabinet_formation` (przyczyna kryzysu), `polish_party_agenda` (bez martwej próby z KPP);
- `polish_event_niewiadomski_cult`, `polish_event_coup` (komentarz), `polish_chapter_report`, `advisors/ziemiecki`;
- niemieckie zdjęcia usunięte z 49 polskich scen; pliki obrazów zostają;
- `out/html/d3-linegraph.js` (polskie wykresy od I 1922, puste dane bez błędu) i `out/html/game.js` (domyślny rozmiar czcionki).

*Pozostałe zmiany:*
- dotychczasowe testy dostosowane do wartości 2A, presji 0, dat 8f, celu KPP i linii autonomii;
- `analysis/implementation-plan/check.cjs` (asercje etapu 8);
- osiem wpisów badań 8f w `HISTORICAL_SOURCES.md`.

*Weryfikacja:*
- **Testy:** 438 z 438.
- **Pomiar:** cel 1A spełniony.
  - N-A i N-H: próba w 12/12 ziaren, w III 1926.
  - N-B i N-C: bez próby w 12/12, z wykonanym porozumieniem wojskowym.
  - Gabinety we wszystkich strategiach: Ponikowski → Śliwiński → Nowak → Witos → Grabski → Skrzyński.
  - PPS wchodzi do gabinetu Skrzyńskiego przy strategiach współrządzącej, „jak w historii”, koalicyjnej i zatrudnieniowej.
  - Sejm 1922 przy biernej PPS mieści się w ±5 mandatów od bazowego Sejmu M02.
- **Przeglądarka** (port 8000, ręcznie w panelu przeglądarki; skrypt `tests/sejm-browser-smoke.cjs` wymaga Playwrighta, którego projekt nie instaluje, i zostaje bez zmian):
  - nowa gra bez błędów konsoli i bez niemieckiej muzyki;
  - polska zakładka Defense;
  - Biblioteka z wykresami od I 1922;
  - z zapisów kampanii wczytanych w stronie: karta formowania z przyczyną kryzysu XII 1925, cały zamach z dwiema postawami PPS (obrona rządu i neutralność), raport po zamachu z marszałkiem obradującego Sejmu i raport po wyborach 1928 z marszałkiem ustępującego Sejmu.

**Uzupełnienia przy wdrożeniu (P):**
- presja startowa 0 zamiast 10;
- wejścia scenariusza:
  - oferta Chjeno-Piasta V–XII 1923;
  - odejście 10 posłów Piasta w XII 1923 (z M02);
  - dymisja Grabskiego od XI 1925 (A1);
  - publiczny epizod nacisku wojska od XI 1925;
- automaty strategii:
  - tolerują tylko premiera w jego oknie;
  - przed koalicją prowadzą rozmowy z partiami, jak przebieg C w M02;
  - tworzą AS, gdy tylko jest osiągalna;
  - odpowiadają na wydarzenia po zakończeniu miesiąca;
- kalibracja 2A: jeden mnożnik na partię we wszystkich wierszach klas ([`calibration.json`](../analysis/stage8-campaigns/calibration.json)).

**Poprawione przy wdrożeniu:**
- obliczony Sejm 1922 zamrażał oś gabinetów (decyzja 2A);
- NPR odrzucała każdy gabinet z PPS w resorcie Pracy, bo reguła 8.9 nie była wdrożona; PPS nie wchodziła do rządu w żadnej kampanii;
- porozumienie wykonywane przez gabinet wygasało przy pierwszym przeglądzie (A3);
- rządy z komunistami były zawsze zamknięte, wbrew 9.6;
- pozycja próby z KPP w agendzie nigdy nie była dostępna;
- tekst kredytu rządu odsyłał do agendy PPS;
- notatki etapów zostały w tekstach dla gracza;
- strona próbowała odtwarzać brakującą niemiecką muzykę (404);
- raport po zamachu pokazywał marszałka poprzedniego Sejmu jako „Vacant”;
- nazwa wyniku zamachu na ekranie F10 zaczynała zdanie małą literą (znalezione w końcowym teście przeglądarki; `source/rules/polish_security.js`).

**Sprawy odłożone przez wcześniejsze etapy:**

*Rozwiązane:*
- kontrola „bierna PPS → historyczni zwycięzcy” (etap 2): marszałek Rataj; prezydent Narutowicz, po zamachu Wojciechowski;
- oś polityczna 17.16.3 i profile gabinetów (etap 4);
- wykresy Biblioteki i liczenie posłów w Zgromadzeniu Narodowym (etap 5);
- przygotowanie układów z KPP (etap 5, 9.6);
- cele KPP w strajkach i tekst kredytu (etap 6);
- profil `pilsudski_aligned` i punkty programu o wojsku i autonomii (etap 7);
- daty i punkty TBD objęte badaniami 8f;
- zamachy jesienią 1927 w przejściach etapu 7.

*Ograniczenia gotowego rozdziału* (decyzja użytkownika z 4 X 2026: opisane, bez zmian w grze):
- **karta Budżet:** odpowiedź na pakiet kosztuje 0 T (decyzja etapu 4); referencja 17.10 poprawiona;
- **reakcje frakcji na wycofanie poparcia rządu:** mechanizm działa, ale profil liczb jest pusty (P);
- **gospodarka słabo różnicuje strategie,** bo PPS rządzi najwyżej kilka miesięcy przed zamachem;
- **termin próby:** wszystkie strategie bez porozumienia z Piłsudskim mają próbę w III 1926, bo presja przekracza 65 w XII 1925, a okno otwiera się w III 1926;
- **koniec rozdziału:** rozdział kończy się raportem; dalsze skutki (ustępstwa zwycięzcy, nowy gabinet po ugodzie) są tylko zapisane jako wymagania kontynuacji, której nie będzie;
- **profile robocze P i punkty TBD:**
  - liczbami roboczymi P pozostają zakłady i liczby strajków, czerwone linie i proporcje komórek;
  - jako TBD pozostają punkty, których badania 8f nie objęły: procedura zastąpienia posła, marszałek senior, stanowiska Lewicy przed 1926 r. i lojalność oficerów;
- **serwer:** `npm run serve` używa stałego portu 8000;
- **legalne wcześniejsze wybory:** nie są w grze osiągalne.
  - Rozwiązanie Sejmu przy reformie arbitrażu (7.6) nie jest wdrożone, a karty wcześniejszych wyborów nie ma (manifest 17.10).
  - Kontrola wykonalności 21.2 jest pod tym względem niespełniona. Użytkownik zdecydował 4 X 2026, że rozwiązania Sejmu z 7.6 nie wdrażamy; ograniczenie zostaje.
- **identyfikator `awaiting_later_stage`:** zostaje jako wewnętrzny status zobowiązania w zapisie gry; nie jest tekstem dla gracza.

**Koniec planu:** etap 8 był ostatni (decyzja użytkownika z 4 X 2026). Plan nie ma dalszych etapów. Schemat stanu 8 bez zmian, więc zapisy z etapu 7 nadal się wczytują.

## 19. Polska wersja językowa (po planie, 0.50)

To osobne zadanie po zakończeniu planu, nie etap 9. 4 X 2026 użytkownik poprosił o polską wersję gry z możliwością zmiany języka i zatwierdził decyzje 1A–7A (referencja 20.1 i 23.23). Gra pozostaje jedną grą w dwóch językach: logika, sceny i stan są wspólne, a różnią się tylko teksty.

- **Jak działa:** domyślny jest angielski. Gracz zmienia język w Opcjach albo odnośnikiem w nagłówku, także w trakcie gry; wybór pamięta przeglądarka, a zapis gry wczytuje się w obu językach.
- **Sceny:** tłumaczenia linia po linii w `source/i18n/pl/` (opis formatu i słownik: `source/i18n/pl/README.md`). `npm run build` buduje z nich `out/html/game_pl.json`.
- **Reguły:** każdy tekst modułów `source/rules/` ma polski odpowiednik (`L(en, pl)`); teksty zapisywane w `S` zostają po angielsku i tłumaczy je wyświetlanie (`PolishRules.storedText`).
- **Wyniki:** 100 plików tłumaczeń kompletnych, bez brakujących linii. Wszystkie 13 strategii gra po polsku do końca rozdziału bez angielskich tekstów i z identycznym stanem gry jak po angielsku (test „Ta sama rozgrywka w obu językach”). `npm test`: 444 z 444.
- **Ograniczenia:**
  - wartości policzone przed zmianą języka w trakcie gry zostają w poprzednim języku do następnej strony;
  - Credits tłumaczą tylko nagłówki, listy źródeł zostają w oryginale;
  - nazwa gry w `info.dry` zostaje angielska, bo jest kluczem zapisów w przeglądarce;
  - nieosiągalne sceny niemieckie i teksty techniczne (walidacja zapisu, błędy dla programisty) zostają po angielsku.

## 20. Potwierdzenie obecnej linii (po planie, 0.51)

To druga zmiana po zakończeniu planu, nie etap 9. 4 X 2026 użytkownik poprosił, by w kartach stanowisk dało się wybrać także obecną linię, a wyjście z karty nazywało się jak odłożenie na rękę (referencja 10.5, 13.1 i 23.24).

- **Reguła:** potwierdzenie obecnej linii kosztuje akcję miesiąca i zwykłe odnowienie karty; nic więcej się nie zmienia. Zastępuje regułę 0.32, według której obecnej linii nie dało się wybrać.
- **Zakres:** osiem kart stanowisk, Składki („utrzymać”) i Program gospodarczy (ten sam zestaw). Inne karty bez zmian.
- **Nazwa:** „Close card” to teraz „Return to hand”, po polsku „Odłóż na rękę”; wyjście z karty otwartej przez doradcę zostaje „Close card”.
- **Pliki:** `source/rules/polish_party.js`, sceny tych dziesięciu kart i `easy_discard` z ich polskimi tłumaczeniami, trzy pliki testów.
- **Wyniki:** `npm test` 444 z 444; 18 kontroli analitycznych przechodzi; schemat stanu 8 bez zmian. Zautomatyzowane strategie nie używają tych kart, więc wyniki kampanii etapu 8 się nie zmieniają (156 kampanii bez potwierdzenia).

## 21. Nazwa Centralnego Komitetu Wykonawczego (po planie, 0.52)

Trzecia zmiana po zakończeniu planu, nie etap 9. 4 X 2026 użytkownik poprosił, by doradcy nazywali się w grze „Centralny Komitet Wykonawczy”, a po angielsku „Central Executive Committee” (referencja 10.4 i 23.25).

- **Zakres:** tylko teksty dla gracza, w obu językach. Reguły, identyfikatory w kodzie i zapisy gry bez zmian; dokumentacja zachowuje termin techniczny „doradca”.
- **Historia:** nazwa CKW jest faktem udokumentowanym; trzy miejsca to uproszczenie gry (`HISTORICAL_SOURCES.md`, wpis `PL-PPS-CKW-NAME-2026-10-04`).
- **Pliki:** sceny `main`, `root`, `library`, `polish_party_advisers`, `polish_advisor_commit`, `cancel_advisor_action` i cztery karty doradców z polskimi tłumaczeniami; `source/rules/polish_party.js`; `out/html/game.js`; dwa pliki testów. Napis o odnowieniu akcji CKW ma pełną odmianę liczebnika w obu językach.
- **Wyniki:** `npm test` 445 z 445; tłumaczenia kompletne; 18 kontroli analitycznych przechodzi; test w przeglądarce w obu językach bez błędów.

## 22. Opisy wyborów i liczby (po planie, 0.53)

Czwarta zmiana po zakończeniu planu, nie etap 9. 4 X 2026 użytkownik poprosił o wyraźne oznaczenie obecnej linii i o wybór w Opcjach, czy opisy wyborów pokazują liczby skutków (referencja 20.1 i 23.26).

- **Obecna linia:** pogrubiona etykieta w osobnym wierszu w dziesięciu kartach.
- **Liczby:** skutki słowami, ich wielkość w nawiasie; ustawienie „Liczby w opisach wyborów”, domyślnie wyłączone. Koszty słowami, bez skrótów T, R i B; legenda jednostek w Bibliotece.
- **Pliki:** opisy 61 scen z polskimi tłumaczeniami i legenda jednostek w Bibliotece; moduły reguł (`polish_rules`, `polish_party`, `polish_politics`, `polish_unions`, `polish_security`, `polish_projects`, `polish_government`); `out/html/index.html`, `game.js` i `game.css`; nowy test `tests/choice-descriptions.test.js`.
- **Wyniki:** `npm test` 451 z 451; 2234 różne opisy z 13 strategii w obu językach bez liczb skutków po ich ukryciu; test w przeglądarce bez błędów.

## Dodatek A. Karty katalogu według etapów

| Etap | Pozycje katalogu | Liczba |
|---|---|---:|
| 0 | — | 0 |
| 1 | — | 0 |
| 2 | 7.8, 7.9, 9.3, 9.16 | 4 |
| 3 | 6.1, 7.1, 7.6, 7.7 | 4 |
| 4 | 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.11, 8.13, 8.16, 9.11, 9.12, 9.13 | 19 |
| 5 | 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 9.10 | 24 |
| 6 | 5.10, 7.10, 9.7, 9.8, 9.9 | 5 |
| 7 | 6.8, 7.5, 8.12, 8.14, 8.15, 9.1, 9.2, 9.4, 9.5, 9.6, 9.14, 9.15 | 12 |
| 8 | 9.17 | 1 |
| **Razem** | | **69** |

Numery w tej tabeli to pozycje katalogu kart, nie sekcje referencji.

## Dodatek B. Testy z 21.1 według etapów

Test przypisujemy do pierwszego etapu, po którym da się go uruchomić w pełnej postaci. Każdy następny etap uruchamia też wszystkie testy wcześniejszych etapów. Decyzja etapu 4 przeniosła dziewięć testów zależnych od komórek, związków, zakładów i niezadowolenia: „Populacja”, „Warianty funduszu inwestycyjnego” i „Szkoły” do etapu 5, „Ratunek zakładu” i „Wspólna karta gabinetowa” do etapu 6 oraz „Reprezentacja”, „Autonomia”, „Sprawiedliwość” i „Rozszerzyć i skupić osłony” do etapu 7. Ich części wykonalne w etapie 4 sprawdzają testy tego etapu.

- **Etap 0 (1):** „Jedna trudność”.
- **Etap 1 (4):** „Jedna tura”, „Doradca”, „Ręka”, „Rzut”.
- **Etap 2 (15):** „Prezydentura bez interaktywnych tur”, „Remis finalistów urzędu”, „Zapis losowania urzędu”, „Granica losowania urzędu”, „Finał bez większości bezwzględnej”, „Kworum i kandydatury”, „Bezpiecznik wyboru urzędu”, „Mandaty”, „Zwykła większość”, „Szczególna większość”, „Senat”, „Granica”, „Data”, „Raport”, „Marszałek i prezydent”.
- **Etap 3 (23):** „Oferta”, „Umowa”, „Groźba przyjęta”, „Groźba odrzucona”, „Groźba po cofnięciu”, „Perswazja”, „Rząd bez potrzeby PPS”, „Utrata partnera”, „Skład porozumienia”, „Premier ekspercki”, „Resorty docelowe”, „Starszy gabinet”, „Gabinet po wyborach”, „Poparcie mniejszości”, „Utrzymanie poparcia tylko w kryzysie”, „Impas”, „Poparcie gabinetu”, „Legalny kalendarz bez C8”, „C1”, „C2/C3”, „C5–C7”, „C8/C9”, „Kompromis listowy a Lewica”.
- **Etap 4 (35):** „Niedobór budżetu”, „Budżet bez kumulacji”, „Efekt projektu”, „Zatrudnienie”, „Kapitał”, „Warunki życia”, „Przepływ pogorszenia”, „Przepływ poprawy”, „Asymetria”, „Brak przepływu”, „Mała pula”, „Bez podwójnego liczenia”, „Kolejność M09”, „Stare reguły poparcia”, „Zamówienia”, „Czasowy dochód”, „Pożyczka inwestycyjna”, „Parcelacja i komasacja”, „Remont Oświaty”, „Pobór w karcie finansowej”, „Szerokie grupy i emisja”, „Szkoła świecka bez reakcji frakcji”, „Oszczędności 1926 przez 9.8”, „Roboty pod Pracą”, „Wariant robót”, „Wykonanie i limit robót”, „Stabilizacja i finanse”, „Konflikt kapitału”, „Wykonalność jedności narodowej”, „Narastanie kryzysu”, „Opcje karty Budżet”, „Budżet”, „Trzy reformy”, „Kredyt B16”, „C4”.
- **Etap 5 (67):** „Nowe powołanie”, „Start i odwołanie”, „Pużak”, „Jedno przekierowanie”, „Brak resortu”, „Piłsudczycy”, „Miasta i klasy”, „Efekty czasowe”, „KPP i Lewica”, „Droga do KPP”, „Wrogość a kanał”, „Późni doradcy”, „Dyscyplina KPP”, „Akceptacja a KPP”, „Program bez zmiany”, „Odroczenie sprawy frakcji”, „Dwa warianty kompromisu”, „Dostęp karty Jedność”, „Zmiana doradców osobno”, „Kontakt i agenda KPP”, „Kompromis w PPS”, „Granice dyscypliny”, „Rozmowa a akcja”, „Brak gotówki”, „Dwie kategorie mniejszości”, „Zmiana formatu prasy”, „Cel członkostwa”, „Zbliżanie członkostwa”, „Zwrot aparatu”, „Konfiskata”, „Preferencje”, „Nasycenie”, „AS”, „Posłuch AS”, „Jedna akcja Milicji”, „Mała AS i czwarta sprawa”, „Rozłam E3”, „Zamrożeni posłowie”, „Rozłam i czystka”, „Zamrożony wynik”, „Jedna karta E3”, „Czystka”, „TUR”, „Program gospodarczy”, „Bez płatnego braku wyboru”, „Militaryzacja a frakcje”, „Praca organizacyjna w komórkach”, „Media bez odnowienia karty”, „Dwie organizacje”, „Podmenu i doradcy”, „Demokracja zależna od sytuacji”, „Trzy ustroje”, „Cztery stanowiska autonomii”, „Składki”, „ZSRR”, „Potępienie modelu sowieckiego”, „Adresat polemiki”, „Arbitraż i linia”, „Oś autonomii”, „Bund”, „Sowiecki model B13”, „Obecna linia”, „Profil frakcji v1”, „Cele ustrojowe”, „Populacja”, „Warianty funduszu inwestycyjnego”, „Szkoły”.
- **Etap 6 (18):** „Kolej”, „Zgoda na ugodę”, „Zgoda a fundusz”, „Pełna oferta i czerwona linia”, „Kruchość gabinetu”, „Komuniści”, „Współpraca i eskalacja”, „Kraków”, „Państwo a PPS w strajku”, „Strajk i Sejm”, „B8+B10 i B11+B12”, „Klucz sprawy E6”, „Układ zbiorowy i odstępstwo”, „Otwarcia finansowe”, „Zasięg i charakter partii”, „Tolerowanie B14”, „Ratunek zakładu”, „Wspólna karta gabinetowa”.
- **Etap 7 (53):** „Autorytet z dziennika”, „Bez bezpośredniego zapisu”, „Demokracja w zwykłym Sejmie”, „Zdarzenia demokracji”, „Demokracja w presji”, „AS w zamachu”, „Podwójny przydział”, „Zamach”, „Zero sił”, „Gotowość wojska”, „Zdolność a demokracja”, „Losowanie po F5”, „Wczytanie zamachu”, „Szybkie zwycięstwo”, „Nadchodząca rezerwa”, „Pomiar strajku”, „Istotny udział”, „Ugoda w rundzie 1”, „Przewaga nie negocjuje”, „Odrzucone F9”, „Brak zwycięzcy”, „Wkład kontrfaktyczny”, „Kryzys i przerwa”, „Przegląd ugody chroniącej”, „Policja”, „Nominacja”, „Śledztwo i adresat polemiki”, „Ustępstwo Piłsudskiemu”, „Pula ustępstw wojskowych”, „Ustępstwa a linia”, „Rozpoznanie w agendzie”, „Mobilizacja i kult”, „B3/B4”, „Msza B5”, „B1/B2”, „Obowiązkowa odpowiedź B2”, „Sprzeczność odpowiedzi B2”, „Dwie decyzje Piłsudskiego”, „Kontrola wojska bez pustych opcji”, „Ograniczona reforma wojska”, „Karty 3–5 bez odnowienia”, „Karty rządowe bez pustych opcji”, „B18/B19/B21”, „Kolejność kategorii wydarzeń”, „Manifest parlamentu”, „Katalog rządowy”, „Sceny wycofane B”, „Izolacja Polski”, „Kolejność i zakres”, „Reprezentacja”, „Autonomia”, „Sprawiedliwość”, „Rozszerzyć i skupić osłony”.
- **Etap 8 (0):** kontrole pełnych kampanii z 21.2, 21.2a, 21.2b i 21.2c. Wdrożone jako testy `tests/polish-campaign.test.js` i `tests/polish-scenario.test.js` oraz pomiar [`analysis/stage8-campaigns/`](../analysis/stage8-campaigns/REPORT.md).

Razem: 216 testów z 21.1.

## Dodatek C. Przecieki z 20.2 i etap, który je zamyka

| Nr | Przeciek z 20.2 | Etap |
|---:|---|---:|
| 1 | Nowa inflacja obok starego `budget` i niemieckich sprzężeń | 4 |
| 2 | Nowe umowy obok dawnych progów automatycznego rozpadu koalicji | 3 |
| 3 | Nowe fazy zamachu obok `coup_progress` albo wyniku ustalonego przed wyborem | 7 |
| 4 | Dokładne mandaty nadpisywane przez procenty sondaży; dziś chronią przed tym testy wyborów | 2 |
| 5 | Polska sukcesja odczytująca niemieckie `president` | 2 |
| 6 | Odnowienie doradcy odejmowane przy kilku powrotach do `main` | 1 |
| 7 | Niemiecki epilog przerywający polski raport | 2 |
| 8 | Niemieckie wydarzenie uruchamiane samą datą | 1 |
| 9 | Przepływ z 5.6 obok niemieckich reguł poparcia: `pro_republic`, NSDAP, dryfy 1929–1932, `high_inflation` | 4 |
| 10 | `pro_republic` zapisywane przez sceny doradców | 5 |

## Dodatek D. Wstępny manifest przejęcia

Kolumny odpowiadają wpisowi z 20.2. Nazwy scen bez ścieżki oznaczają pliki w `source/scenes/`; pełne listy plików są w dodatku E. Kolumna „Testy” odsyła do dodatku B.

| `system_id` | Etap | Nowy właściciel | Stare zapisy do wyłączenia | Stare odczyty do dostosowania | Migracja | Testy | Status |
|---|---:|---|---|---|---|---|---|
| `turn_actions` | 1 | `S.turn`, `S.cooldowns`, `S.events`, `S.rng` | `Q.advisor_action_timer`, 52 liczniki `…_timer` w `post_event` (dodatek E), zwrot kosztu w `cancel_advisor_action` i `easy_discard` (znany błąd) | `main` (opis odnowienia), `easy_discard` | Brak; nowa gra | Etap 1 | wykonane |
| `elections_offices` | 2 | `S.parliament`, `S.senate`, `S.ballots`, `S.chapter` | `Q.president` w `root`, `game_over`, `government_affairs/constitutional_reform`, `events/game_over_1934`; epilog w `game_over`, `events/1934_end`, `events/game_over_1934` | `status`, `library`, `polish_opening_state` | Wypełnienie z obecnych pól polskich przy nowej grze | Etap 2 | wykonane |
| `agreements_cabinets` | 3 | `S.actors`, `S.negotiation`, `S.agreements`, `S.cabinet`, `S.cabinet_crisis` | `coalition_dissent` (38 plików po etapie 3, dodatek E; bez skutku); `events/vote_of_no_confidence`, `events/kpd_vote_of_no_confidence` | `Q.polish_portfolios` (9 resortów), `polish_opening_state`, `status`, `library` | Brak; nowa gra | Etap 3 | wykonane |
| `economy_projects` | 4 | `S.economy`, `S.projects`, `S.society.living_conditions_last` | `budget` (37 plików), `inflation` (31), `unemployment` (23), dodatek E: po etapie 4 pola `budget`, `inflation` i `economic_growth` są kopiami `S.economy`, a waga `unemployed` wynosi 3; erozja `pro_republic`, przepływy NSDAP i dryfy w `post_event` wyłączone warunkiem; `events/high_inflation` i niemieckie karty gospodarcze zablokowane | `status`, `library` (`qdisplays/taxation` czyta tylko wyłączona karta) | Brak; nowa gra | Etap 4 | wykonane |
| `party_factions` | 5 | `S.party_orgs`, `S.militia`, `S.unions` (trzy branże), `S.faction_cases`, `S.advisors`, `S.society.cells`, `S.actors.pps.strategy`, `S.actors.pps.factions` | `pro_republic` w `advisors/niedzialkowski` i `advisors/prochnik` (usunięte, przeciek 10); automatyczne sceny `events/pps_lewica_split`, `events/pps_pilsudczycy_split`, `events/pps_centrum_crisis` (poza kolejką); niemieckie mosty wierszy poparcia i pięciu frakcji w `post_event`; odziedziczone karty partyjne (warunek `not polish_party_rules`) | `qdisplays/dissent`, `qdisplays/strength`, `qdisplays/loyalty`, `qdisplays/militancy` (czytają kopie, bez zmian) | Wypełnienie z pól otwarcia przy nowej grze; zapisy ze schematu 5 wymagają nowej gry | Etap 5 | wykonane |
| `unions_strikes` | 6 | `S.unions` (trzy branże od etapu 5; linie strajkowe i układy od etapu 6), `S.strikes` (strajki, ugody, sprawy), `S.enterprises` (syntetyczne zakłady) | `events/labor_unrest`, `events/unions_declare_independence` (warunek `not polish_union_rules`, poza polską kolejką) | karty związkowe w `party_affairs` (zablokowane od etapu 5); `status` czyta kopie | Brak; zapisy ze schematu 6 wymagają nowej gry | Etap 6 | wykonane |
| `democracy_coup` | 7 | `S.politics`, `S.security`, `S.coup`, `S.actors.pilsudski` | `coup_progress` (19 plików) i pozostałe zapisy `pro_republic` (dodatek E): 26 scen z warunkiem `not polish_security_rules`, pliki zostają (przeciek 3) | `status` i `library` czytają przywiązanie do demokracji; `game_over` nie jest osiągalne po polskim raporcie | Brak; zapisy ze schematu 7 wymagają nowej gry | Etap 7 | wykonane |
| `scenario_content` | 8 | `S.scenario` | Pozostałe niemieckie karty i wydarzenia bez polskiego odpowiednika | — | Brak | 21.2 | wykonane |

## Dodatek E. Pełne listy starych zapisów (etap 0)

Listy wygenerowano z kodu 26 IX 2026: pliki w `source/`, w których występuje całe słowo. Nazwy bez folderu to pliki w `source/scenes/`. Etap w nawiasie to etap, który przejmuje daną dziedzinę.

- **`budget`** — 37 plików, etap 4: `events/1930`, `events/banking_crisis`, `events/black_thursday`, `events/businesses_lose_confidence`, `events/capital_strike`, `events/economic_expansion`, `events/election_1928`, `events/emergency_cuts`, `events/high_inflation`, `events/hoover_moratorium`, `events/kpd_policy`, `events/lausanne_conference`, `events/london_economic_conference`, `events/panzerkreuzer_b`, `events/papenomics`, `events/schacht_vs_hilferding`, `events/schleichers_schemes`, `events/unemployment_insurance_1`, `events/unemployment_insurance_weimar`, `events/vote_of_no_confidence`, `game_over`, `government_affairs/agricultural_policy`, `government_affairs/coalition_affairs`, `government_affairs/dealing_with_toleration`, `government_affairs/economic_democracy`, `government_affairs/economic_policy`, `government_affairs/education_science`, `government_affairs/fiscal_policy`, `government_affairs/foreign_policy`, `government_affairs/judiciary`, `government_affairs/labor_rights`, `government_affairs/military_policy`, `government_affairs/social_welfare`, `government_affairs/womens_rights`, `post_event`, `root`, `status`.
- **`inflation`** — 31 plików, etap 4: `events/1930`, `events/1931`, `events/1932`, `events/1934`, `events/banking_crisis`, `events/black_thursday`, `events/businesses_lose_confidence`, `events/economic_expansion`, `events/economic_recovery`, `events/emergency_cuts`, `events/high_inflation`, `events/labor_unrest`, `events/london_economic_conference`, `events/papenomics`, `events/return_to_normalcy`, `events/unemployment_insurance_1`, `events/unemployment_insurance_weimar`, `game_over`, `government_affairs/economic_policy`, `government_affairs/fiscal_policy`, `government_affairs/foreign_policy`, `government_affairs/labor_affairs`, `government_affairs/labor_rights`, `government_affairs/police`, `government_affairs/social_welfare`, `government_affairs/womens_rights`, `library`, `party_affairs/crisis_program`, `post_event`, `root`, `status`.
- **`unemployment`** — 23 plików, etap 4: `events/1929`, `events/1931`, `events/1932`, `events/1934`, `events/black_thursday`, `events/businesses_lose_confidence`, `events/economic_expansion`, `events/economic_recovery`, `events/game_over_1934`, `events/kpd_policy`, `events/unemployment_insurance_weimar`, `game_over`, `government_affairs/economic_policy`, `government_affairs/fiscal_policy`, `government_affairs/labor_rights`, `government_affairs/social_welfare`, `government_affairs/womens_rights`, `library`, `party_affairs/campaigning`, `party_affairs/crisis_program`, `party_affairs/fundraising`, `post_event`, `root`.
- **`pro_republic`** — 41 plików, etapy 4 i 7 (dwa pliki polskich doradców przestały go zapisywać w etapie 5, przeciek 10): `advisors/leber`, `advisors/rosenfeld`, `advisors/sender`, `advisors/seydewitz`, `events/all_quiet`, `events/austrian_civil_war`, `events/banking_crisis`, `events/capital_strike`, `events/death_of_hindenburg_president`, `events/election_1928`, `events/emergency_cuts`, `events/high_inflation`, `events/hunger_chancellor`, `events/kpd_vote_of_no_confidence`, `events/march_on_berlin`, `events/prussian_coup`, `events/return_to_normalcy`, `events/schleichers_schemes`, `events/unemployment_insurance_1`, `events/unemployment_insurance_weimar`, `events/vote_of_no_confidence`, `events/young_plan_right_coalition`, `government_affairs/coalition_affairs`, `government_affairs/constitutional_reform`, `government_affairs/dealing_with_toleration`, `government_affairs/economic_policy`, `government_affairs/education_science`, `government_affairs/foreign_policy`, `government_affairs/judiciary`, `government_affairs/labor_rights`, `government_affairs/prussian_affairs`, `government_affairs/social_welfare`, `government_affairs/war_guilt`, `library`, `party_affairs/confronting_nazis`, `party_affairs/iron_front`, `party_affairs/media`, `party_affairs/rally`, `post_event`, `root`, `status`.
- **`coup_progress`** — 19 plików, etap 7: `events/austrian_civil_war`, `events/capital_strike`, `events/election_1928`, `events/harzburg_front`, `events/march_on_berlin`, `events/nazis_in_crisis`, `events/return_to_normalcy`, `events/weltbuhne`, `government_affairs/agricultural_policy`, `government_affairs/deport_hitler`, `government_affairs/economic_policy`, `government_affairs/foreign_policy`, `government_affairs/judiciary`, `government_affairs/military_policy`, `government_affairs/police`, `government_affairs/prussian_affairs`, `government_affairs/war_guilt`, `party_affairs/crisis_program`, `root`.
- **`coalition_dissent`** — 38 plików, etap 3 (po wdrożeniu etapu 3 pole nie ma skutku, a sześć plików już go nie używa; rozdział 13): `advisors/braun`, `advisors/muller`, `events/austrian_civil_war`, `events/austrian_customs_union`, `events/blutmai`, `events/capital_strike`, `events/election_1928`, `events/high_inflation`, `events/kpd_policy`, `events/kpd_vote_of_no_confidence`, `events/labor_unrest`, `events/panzerkreuzer`, `events/panzerkreuzer_b`, `events/panzerkreuzer_ministry`, `events/unemployment_insurance_weimar`, `events/vote_of_no_confidence`, `events/weltbuhne`, `government_affairs/agricultural_policy`, `government_affairs/coalition_affairs`, `government_affairs/domestic_enemies`, `government_affairs/economic_democracy`, `government_affairs/economic_policy`, `government_affairs/education_science`, `government_affairs/fiscal_policy`, `government_affairs/foreign_policy`, `government_affairs/homosexual_rights`, `government_affairs/judiciary`, `government_affairs/labor_affairs`, `government_affairs/labor_rights`, `government_affairs/military_policy`, `government_affairs/prussian_affairs`, `government_affairs/shuffle_cabinet`, `government_affairs/social_welfare`, `government_affairs/womens_rights`, `party_affairs/crisis_program`, `party_affairs/enemies`, `party_affairs/peoples_party`, `root`.
- **`Q.president`** — 5 plików, etap 2: `events/game_over_1934`, `game_over`, `government_affairs/constitutional_reform`, `polish_opening_state`, `root`.
- **Liczniki `…_timer`** — 52 pozycji listy `Q.timers` w `root`, maleją co miesiąc w `post_event`; etap 1: `advisor_action`, `confronting_nazis`, `crisis_program`, `fundraising`, `ideology`, `inter_party_relationships`, `international_relations`, `iron_front`, `media`, `enemies`, `party_organizations`, `rally`, `pps_militia`, `shuffle_leadership`, `streetfighting`, `peoples_party`, `party_disunity`, `agricultural_policy`, `domestic_enemies`, `fiscal_policy`, `foreign_policy`, `judiciary`, `labor_affairs`, `military_policy`, `police`, `prussian_affairs`, `shuffle_cabinet`, `social_welfare`, `homosexual_rights`, `economic_policy`, `coalition_affairs`, `war_guilt`, `womens_rights`, `economic_democracy`, `dealing_with_toleration`, `constitutional_reform`, `labor_rights`, `education_science`, `curriculum`, `emergency_cuts`, `unemployment_insurance`, `sa_ban`, `sh_ban`, `papen_chancellor`, `kpd_policy`, `kpd_ultimatum`, `popular_front_dispute`, `high_inflation`, `banking_crisis`, `march_on_berlin`, `understanding_enemy`, `schleichers_schemes`.
