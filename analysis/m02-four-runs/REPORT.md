# M02 — cztery kontrolowane przebiegi pierwszego rozdziału

21 IX 2026. **Wynik obliczeń do oceny projektu. Nie zmienia specyfikacji ani działającej gry.**

Przeliczono cztery strategie od I 1922 do próby zamachu albo granicy następnych wyborów. Najważniejszy wynik: **proponowane poprawki dają znaczenie osłonom, robotom i kompromisowi wojskowemu, ale nie tworzą jeszcze wiarygodnego domyślnego ciągu politycznego 1925–1926.** Historyczne zamiary PPS napotykają blokadę szerokiego gabinetu; samo jej usunięcie nie wywołuje sporu o oszczędności. Nie należy zamykać M02.

## 1. Co dokładnie policzono

Podstawa: [referencja 0.12](../../docs/POLISH_TECHNICAL_REFERENCE.md), szczególnie rozdziały 8–9, 11–17, oraz [proponowany pakiet poprawek](../m02-comparison/REPORT.md). W tym teście stosujemy:

- krótkie priorytety gabinetów i najwyżej jedną ich nową inicjatywę miesięcznie poza resortem PPS;
- odbudowę płac o **3 punkty indeksu miesięcznie**, przy spełnieniu warunków kredytu i inflacji;
- ograniczony protest przy niezadowoleniu ≥50 **lub nierozwiązanym odrzuconym żądaniu**; próg 60 pozostaje dla ogólnej/politycznej eskalacji;
- **+2 presji/M** za konkretny nierozwiązany konflikt wojskowy; wykonane ustępstwo −12 raz; istotne umowy cywilne −2 raz, najwyżej −2/M;
- kryzys kredytowy jako przesłankę rozmów o szerokim gabinecie, bez automatycznego powołania.

Rozliczamy budżet państwa, projekty i ich opóźnienia, gospodarkę, odbiorców osłon, niezadowolenie, radykalizację, fundusze i zmęczenie związków, pieniądze PPS, przygotowanie partnerów, presję oraz syntetyczny wynik walk. Są **281 miesięczne rozliczenia czterech podstawowych przebiegów**, pięć dodatkowych wariantów porównawczych i jeden test prognozy budżetowej.

To kontrolowane przebiegi reguł, **nie autonomiczna symulacja wszystkich partii ani rozegrane kampanie w Dendry**. Jawne wejścia polityczne są konieczne, ponieważ obecny katalog nie wyznacza jeszcze wszystkich zgód i kontrpropozycji. W szczególności:

| Wspólne wejście | Znaczenie i granica wniosku |
|---|---|
| Ten sam syntetyczny Sejm: PPS 41, Wyzwolenie 49, NPR 18, Piast 70, PSChD 60, ZLN 100, mniejszości 90, pozostali 14, KPP 2 | Łącznie 444. Nie są to historyczne mandaty ani prognoza wyborów. Zamrażamy je, aby porównać decyzje rządowe. |
| Konflikt z Naczelnikiem w VI 1922, nieudana próba Śliwińskiego, przyjęty Nowak; później gałąź Narutowicza i Sikorski | Wspólne deklaracje aktorów i zdarzenia scenariusza. Nie wyliczamy prawdopodobieństwa zabójstwa. |
| W V 1923 prawica i Piast mają 230 deklarowanych głosów za zmianą gabinetu | Głosowanie jest skuteczne przy przyjętych deklaracjach; sama data nie odwołuje Sikorskiego. |
| W XII 1923 dziesięciu posłów Piasta wycofuje poparcie w sporze politycznym | **Syntetyczny warunek testu**, nie historyczna liczba ani skutek policzonego strajku. Pozwala na głosowanie 224:220 i przyjętą ofertę Grabskiego. Bez tej zmiany deklaracji ten test nie dowodzi upadku Chjeno-Piasta. |
| W I 1925 otwiera się jedna sprawa organizacji władz wojskowych | Wspólny test nierozwiązanego konfliktu. Nie oznacza, że konflikt rodzi się automatycznie co styczeń. |
| Wskazani wykonawcy przyjmują wykonalne pakiety podatkowe i ofertę wojskową; w C akceptują rekonstrukcję ze Skrzyńskim | Zgody i dopuszczalność zakresu są wejściami. Kontrolujemy kompetencje PPS, relacje, koszty, czas i wykonanie; nie udajemy pełnego wyliczenia wszystkich preferencji z 8.3. |
| Spójność PPS 95,25; zgodność z wezwaniem 50; brak premii doradców | Izolacja badanych mechanik. Nie modelujemy tutaj całej ewolucji frakcji ani wyniku sondaży. |
| Wspólne zapisane losowania rokowań i wojsk | Identyczne sytuacje nie dostają korzystniejszego losu z powodu nazwy strategii. Wynik jednego ziarna nie jest estymacją prawdopodobieństwa. |

Spór płacowy obejmuje przemysł i kolej: testowo łącznie 80% zatrudnionych odbiorców. Efekty odrzucenia żądań, ugody i represji są ważone; nie dopisujemy ich całej ludności. Ekspozycja na nowe bezrobocie używa wariantu dodatniego przyrostu w pp z poprzedniego raportu. Źródłowe skróty SHA-256, wejścia i zdarzenia zapisuje [results.json](results.json).

## 2. Wspólna chronologia: kryzysy i odpowiedzi rządów

| Termin | Co występuje i co robi państwo |
|---|---|
| I–V 1922 | Ponikowski utrzymuje bieżące działanie. Budżet nie wymaga nadzwyczajnej korekty; nie otrzymuje fikcyjnej nowej reformy za każdy miesiąc. |
| VI–VII 1922 | Zadany konflikt kończy się dymisją i nieudaną próbą Śliwińskiego. Przyjęta oferta Nowaka kończy przesilenie. |
| XII 1922 | Po zadanej gałęzi kryzysu prezydenckiego działa Sikorski. Ochrona instytucji kosztuje 1 B przez miesiąc. Aktywne PPS wydają 1 R na pokojową mobilizację. |
| I 1923 | Propozycja ugody pracowniczej Sikorskiego nie uzyskuje zgody wykonawcy. To opcjonalny punkt: brak efektu, bez automatycznej dymisji. |
| IV 1923 | Inflacja przekraczała 20% przez dwa zakończone miesiące. Otwiera się kryzys walutowy; Sikorski przygotowuje stabilizację. |
| V–VIII 1923 | Przyjęty Chjeno-Piast przygotowuje parcelację w V, uruchamia ją w VI, rozszerza podatek w VII i uruchamia wcześniej przygotowaną reformę walutową w VIII. Finansuje ją także czasowym ograniczeniem wydatków administracyjnych. |
| IX–X 1923 | Nakładają się koszty ziemi i waluty. Budżet spada poniżej −2 B, najniżej do **−2,10 B**. Wykonanie spada do połowy; projekty kończą się później niż przy pełnym finansowaniu. |
| X 1923 | Trzy zakończone miesiące płac poniżej 80 otwierają żądanie wyrównania. Nierozwiązane żądanie daje dostęp do ograniczonego protestu w XI. |
| XI 1923 | Ziemia zaczyna działać i znika jej koszt 2 B. Otwiera się bramka finansowa po dwóch słabych miesiącach, lecz bieżąca prognoza wraca już do **−1,12 B**. Nowa konieczna korekta nie jest potrzebna. Warianty B/C/H rozpoczynają protest; A pozostaje bierna. |
| XII 1923 | Zaczyna działać złoty. **Reformę ukończył poprzedni gabinet**; Grabski dziedziczy jej wynik i nie dostaje drugiej premii. Jego powołanie wynika z opisanej wyżej zmiany deklaracji, nie z samej stabilizacji. B/C uzyskują osłonę dla bezrobotnych z finansowaniem. |
| II–III 1924 | W użytym losowaniu B/C/H przyjmują ugodę w II po wcześniejszych odmowach. Pierwsza podwyżka działa w III, druga w IV. Zamykamy żądanie płacowe; ugoda nie uchyla automatycznie militaryzacji kolei. |
| VI 1924 | W B/C wygasa sześciomiesięczny podatek majątkowy. Stała podwyżka zwykłego podatku pozostaje. Osłona nadal jest finansowo wykonalna. |
| I 1925 | Otwarta wspólna sprawa wojskowa zaczyna dawać +2 presji/M. |
| VI–IX 1925 | Datowany szok kredytu i produkcji dotyka wszystkich. Grabski przygotowuje instrument kredytowy w VI, wdraża w VII za 2 B; efekt +5 do wsparcia kredytu zaczyna się w IX, utrzymanie 1 B/M. |
| VIII / XII 1925 | W B wykonana zostaje wojskowa oferta, o którą PPS zabiegała od VI. W C wykonuje ją przyjęty szeroki gabinet w XII. Czekanie w B wynika z limitu inicjatyw zajętych przez kredyt. |
| XI 1925–III 1926 | Tylko C spełnia relacyjne warunki przyjętej szerokiej oferty: wchodzi do Skrzyńskiego, uzyskuje Pracę, przygotowuje roboty w XI, wdraża w XII, otrzymuje efekt w III. |
| IV–V 1926 | W żadnym przebiegu nie pojawia się niewykonalność bieżących osłon wymuszająca cięcia. Nie ma wyliczonej dymisji i ponownego Chjeno-Piasta. Sam maj nie daje +20 ani próby zamachu. |

W XI 1923 najsłabszy indeks płac wynosi **56,14**. Odbudowa +3 jest powolna: wszystkie cztery przebiegi wracają do 100 dopiero w IX 1925. To wynik stosunkowo wczesnej stabilizacji w tym zestawie, a nie dowód, że późna reforma również naprawiłaby płace przed majem.

Przy represyjnej odpowiedzi na strajk ryzyko starcia wynosi w XI 1923 około 18,3%; zapisany rzut go nie wywołuje. **Nie ma zatem automatycznych wydarzeń krakowskich z historycznymi ofiarami.** Cztery miesiące protestu do ugody to wynik tego losowania. Nie uzasadnia on sam zmiany prawdopodobieństwa ugody.

## 3. Cztery strategie i ich wyniki

W tabeli wartości po rozliczeniu **V 1926**. B to punkt przestrzeni finansowej, nie historyczna kwota pieniężna. Przy B ≥−2 programy nadal wykonują się w całości. „Bezrobocie” jest stopą z modelu, nie szacunkiem historycznym dla Polski.

| Przebieg | Gabinet i pozycja PPS | Bezrobocie | Budżet B | Presja /100 | Dalszy wynik przy tych wejściach |
|---|---|---:|---:|---:|---|
| **A — bierna** | Grabski; opozycja | 7,81% | +1,37 | 38 | Próba w VIII 1927; zwycięstwo Piłsudskiego w syntetycznym bilansie |
| **B — tolerująca** | Grabski; umowa zewnętrznego poparcia | 8,25% | +0,31 | 4 | Bez próby do granicy wyborów 19 II 1928 |
| **C — współrządząca** | Skrzyński; ministerstwo Pracy | 7,75% | −0,66 | 10 | Bez próby do granicy wyborów 19 II 1928 |
| **H — historyczne zamiary** | Grabski; poparcie zewnętrzne, nieudana próba wejścia do szerokiego gabinetu | 8,62% | +1,27 | 36 | Próba w IX 1927; zwycięstwo Piłsudskiego w syntetycznym bilansie |

### A — PPS bierna

PPS nie inwestuje w nowe porozumienia ani mobilizację. Państwo nadal przeprowadza ziemię, walutę i interwencję kredytową. Żądanie płacowe pozostaje bez ugody, a otwarty spór wojskowy narasta.

Próg ostrzeżenia 40 pojawia się w VI 1926, poważnego zagrożenia 55 w II 1927, a warunek 65 zostaje przekroczony w rozliczeniu VII. Próba rozpoczyna się w VIII 1927. Rząd Grabskiego trwa, ponieważ nie wpisaliśmy nieistniejącego głosowania, niewykonalnego budżetu ani osobistej dymisji.

**Wniosek:** bierność nie zamraża świata i nie uniemożliwia stabilizacji. Sama stabilizacja gospodarcza nie rozwiązuje sporu o wojsko.

### B — PPS tolerująca

PPS rozwija aparat do poziomu 2, przemysł i kolej do zasięgu 50 i gotowości 55, zbiera środki i buduje kontakty. Po odrzuceniu rokowań podejmuje ograniczony protest. W XII 1923 uzyskuje od Grabskiego osłonę kosztującą 2 B: progresja +1 B pozostaje na stałe, podatek majątkowy +2 B wygasa po sześciu miesiącach.

W VI 1925 zabiega o rządowy kompromis wojskowy; **nie wykonuje sama karty rządowej bez ministerstwa**. Założona zgoda właściwych aktorów prowadzi do wykonania przez Grabskiego w VIII. Presja spada jednorazowo o 12, konflikt przestaje dawać +2/M. Późniejsze sześciomiesięczne przeglądy utrzymują uzgodnienie, bez kolejnych ulg.

Osłona ma wyraźny skutek: niezadowolenie bezrobotnych w V 1926 wynosi **22,57 zamiast 72,06 w A**. Bezrobocie jest jednak wyższe niż w A, bo cztery miesiące strajku ograniczyły produkcję, a zasiłek nie tworzy miejsc pracy. To różne efekty jednej strategii, nie błąd odejmowania osłon od bezrobocia.

### C — PPS współrządząca

Do działań B dochodzi pięć kontaktów z ZLN: I, IV, VII, X 1924 i I 1925. Relacja rośnie z **5 do 25**, czyli do bramki szerokiej koalicji. Pozostałe wymagane relacje po przygotowaniu: Piast 53, NPR 54, PSChD 46. W XI 1925 przyjęta oferta rekonstrukcji daje PPS Pracę.

Roboty kosztują 2 B przez wdrażanie, potem 1 B utrzymania. Od III 1926 dają 2 jednostki programu, czyli bezpośrednio **−0,5 pp bezrobocia**. Kompromis wojskowy z XII zamyka spór później niż w B, stąd pozostaje wyższa presja 10.

W V 1926 osłona, kredyt i roboty pozostają w pełni finansowane przy −0,66 B. Nie ma podstawy do wymuszenia odejścia PPS za cięcia, których nikt nie potrzebuje proponować.

### H — PPS podejmuje decyzje zbliżone do historycznych

Ten wariant zamierza naciskać strajkiem na prawicowy gabinet, poprzeć stabilizację, wejść do szerokiego rządu, reagować na cięcia i ostatecznie poprzeć Piłsudskiego koleją. Buduje kolej silniej: docelowo zasięg 95, gotowość 100. Nie inwestuje pięciu akcji w ZLN.

**Dwie intencje blokują reguły:**

1. W XI 1923 niezadowolenie zatrudnionych robotników przed wyborem wynosi **47,43**, poniżej proponowanej bramki 60 dla politycznej eskalacji. Dostępny jest ograniczony strajk dzięki nierozwiązanym żądaniom.
2. W XI 1925 relacja z ZLN wynosi **5 przy wymaganych 25**. Szeroki gabinet jest niedostępny pomimo kryzysu i pozostałych przygotowań.

W IV 1926 PPS nie może odejść z koalicji, do której nie weszła. Osobny test z pominięciem wyłącznie bramki ZLN pozwala na Skrzyńskiego, lecz nadal nie dostarcza finansowej konieczności cięć ani automatycznej dymisji. Nie odtwarzamy maja przez dopisanie upadku rządu.

Próba następuje dopiero w IX 1927. PPS uruchamia kolej; uczestnictwo około **79,4** daje zdolność opóźnienia wrogiego transportu o dwie fazy. **Sprostowanie przy wdrożeniu 0.13:** w tym zapisanym losowaniu odległa rezerwa wybiera jednak Piłsudskiego, więc PPS nie blokuje jej transportu. Nie było podstaw do przypisania braku zmiany zwycięzcy wyłącznie przedwczesnemu zakończeniu walk. Algorytm pozwalał kończyć przed fazą 2, ale znaczenie tego problemu sprawdza dopiero osobny test z rezerwą po stronie legalnej w `analysis/m02-revision-13/REPORT.md`. W pierwotnym bilansie zwycięstwo Piłsudskiego następuje po dwóch rundach z koleją i bez niej.

Oba wyniki wojskowe używają czterech syntetycznych grup z 16.1, logistyki 0,8, zdolności 36,23 i jawnego dostępu do celu politycznego. Nie są przewidywaniem historycznych walk. Dla B/C kończymy na granicy zaplanowanych wyborów: nie wyliczamy nowych mandatów ani wyniku kampanii wyborczej.

## 4. Które decyzje rzeczywiście zmieniają przebieg

Poniżej zmieniono tylko wskazaną decyzję, zachowując pozostałe wejścia i losowania.

| Zmiana | Wynik |
|---|---|
| B nie doprowadza do kompromisu wojskowego | Presja V 1926 **4 → 36**; zamiast dojścia do wyborów próba w IX 1927. Gospodarka pozostaje identyczna. |
| C nie doprowadza do kompromisu wojskowego | Presja **10 → 34**; próba w X 1927 pomimo osłon i robót. Sam udział w gabinecie nie zabezpiecza demokracji. |
| C nie wdraża robót | Bezrobocie V 1926 **7,75 → 8,25%**, budżet **−0,66 → +0,31 B**; brak próby przy zachowanym kompromisie. Różnica budżetu nie jest dokładnie 1, bo działa także wpływ produkcji na dochody. |
| H pomija tylko twardą bramkę ZLN | Możliwe wejście do Skrzyńskiego, lecz brak przymusowego cięcia programu i brak samoczynnego powrotu Witosa. Próba nadal w IX 1927. To test bramki, nie zatwierdzenie jej usunięcia. |
| H nie uruchamia kolei podczas próby | W tym samym losowaniu nadal zwycięstwo Piłsudskiego po dwóch rundach. Zmieniają się koszty i transport, nie zwycięzca. |

Sama zmiana nazwy gabinetu nie tworzy nowych pieniędzy ani efektu osłon. Programy zachowują wykonanie po zmianie premiera. Reakcja kapitału pozostaje nieaktywna: maksymalna presja to 22 w A/H i 34 w B/C, poniżej ostrzeżenia 40. Ten zestaw nie sprawdza ekstremalnej nacjonalizacji ani aktywnego strajku kapitału.

## 5. Co korygować — bez rozbudowy modelu

| Problem wykryty w teście | Praktyczna rekomendacja |
|---|---|
| **Szeroka koalicja wymaga pięciu kontaktów z ZLN** | Dla istniejącej oferty kryzysowej dopuścić rozmowy bez zwykłego progu relacji z każdym przeciwnikiem. Zachować przyjęcie konkretnego minimum, czerwone linie i głosy. Dobre relacje nadal pomagają, ale pięć spotkań z prawicą nie powinno być jedyną przepustką PPS do gabinetu ratunkowego. |
| **Nie powstaje spór oszczędnościowy 1926** | Uzupełnić krótki profil Grabskiego/Skrzyńskiego o konkretny powód przedstawienia koniecznej korekty, jeden wariant zastępczy i deklaracje partnerów. Może być ekonomiczny albo polityczny, lecz musi odczytywać rzeczywiste zobowiązanie. Nie dodawać automatycznej dymisji datą. Obecny test nie wyznacza jeszcze właściwej wartości kosztu tego konfliktu. |
| **Presja rośnie, ale historyczny zamiar kończy się próbą dopiero w 1927** | Na razie zostawić +2/M i próg 65. Najpierw domknąć poprzedni wiersz i realny powrót Chjeno-Piasta. Przy H w V 1926 jest 36; sam rzeczywisty powrót +20 dałby **56**, nadal za mało. Jeszcze jedno uzasadnione zerwanie +8 dałoby 64. To informacja do kalibracji kolejności, nie uzasadnienie dopisania fikcyjnej zdrady lub obniżenia progu na oko. |
| **Próg 60 blokuje sam polityczny postulat strajku w XI 1923** | Rozważyć rozdzielenie deklaracji celu od zdolności do szerokiej mobilizacji: w istniejącym konflikcie można żądać dymisji, ale skala nadal zależy od organizacji, a skuteczność żądania od trudniejszego progu 80 i procedury parlamentarnej. Nie obniżać ogólnego progu niezadowolenia do 47 tylko dla tej daty. To korekta propozycji, wymaga decyzji projektowej. |
| **Kolej bywa spóźniona wobec końca walk** | W ramach M08 sprawdzić fazę osiągnięcia celu politycznego względem przybycia rezerw. Obecny parametr: przewaga >1,20 przez dwie rundy przy `objective_access=true` może rozstrzygnąć wszystko przed fazą 2. Nie wzmacniać automatycznie Milicji ani kolei; najpierw dobrać profil dostępności i kontroli celu. |
| **Niezadowolenie zatrudnionych słabo opada po poprawie płac** | W V 1926 nadal 62,40–64,27 mimo płac 100 i zakończonych ugód w B/C/H. Równanie nie daje zwykłego spadku przy płacy dokładnie 100. Do próby wystarczy mała, jednorazowa ulga za wykonaną ugodę dla jej odbiorców; bez drugiego miernika. Nie wybieramy jeszcze jej liczby na podstawie jednego losowania. |

**Czego na razie nie zmieniać:** kosztu osłony 2 B, utrzymania robót 1 B, ich bezpośredniego efektu −0,5 pp oraz odbudowy płac +3. Działają rozróżnialnie i dają wykonalne wybory. Nie ma również podstaw do globalnego zmniejszenia bazowego budżetu z 2 do 1 B: w tej samej migawce wdrożenia robót w XII 1925 prognoza spadłaby z **−1,62 do −2,62 B**, poniżej progu dopuszczenia −2. Naprawa jednego kryzysu mogłaby zablokować sensowną alternatywę. To sprawdzenie jednej decyzji, nie pełny przebieg ze zmienionym budżetem.

Proponowana reguła „jedna poprawiona konieczna oferta, potem dymisja” nie uruchamia się w tych czterech przebiegach: nie ma dwóch odrzuconych koniecznych pakietów. Jej sześć przejść sprawdzono w poprzednim porównaniu, ale **nie stanowi to testu pełnego kryzysu konkretnego gabinetu**. Właśnie brak jego określonej treści pozostaje główną częścią M02.

## 6. Weryfikacja i pliki

- [replay.cjs](replay.cjs) — cztery strategie, jawne wejścia, pięć wariantów i sprawdzenia; uruchomienie: `node analysis/m02-four-runs/replay.cjs`.
- [monthly.csv](monthly.csv) — wszystkie 281 miesięcy podstawowych przebiegów.
- [results.json](results.json) — chronologia zdarzeń, koszty, odmowy, projekty, rundy próby, porównania i skróty źródeł.
- [calculate.cjs](../m02-current-rules/calculate.cjs) — wspólne równania; dodano opcjonalny rzeczywisty wpływ ugody, strajku i zakresu odbiorców. Domyślny poprzedni wariant pozostaje bez zmian.

Kontrole przeszły: limit inicjatyw, odnowienia użytych akcji, nieujemne fundusze, pojedyncze rozliczenie oferty na rundę, zachowanie reform przy zmianie gabinetu, jednorazowe nagrody, brak rządowych robót bez wykonawcy, moment zatrzymania oraz bezpośredni efekt zatrudnienia. Górna granica niekontrolowanego protestu nie dochodzi do progu 40 w żadnym podstawowym przebiegu; nie pominięto przez to aktywnego spontanicznego kryzysu.

Ponowne `node analysis/m02-comparison/compare.cjs`: zgodność wszystkich **1022 wcześniejszych wierszy**, testy płac, presji i dymisji poprawne. `npm test`: **83/83**. Nie zmieniano `source/`, `out/`, przewodników ani audytu; kompilacja gry i test przeglądarkowy nie były potrzebne dla tego narzędzia analitycznego. Przejście testów nie oznacza zatwierdzenia balansu ani gotowości całego scenariusza do implementacji.
