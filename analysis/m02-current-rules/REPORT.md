# M02 — przeliczenie obecnych reguł

Obliczenia 20–21 IX 2026. Podstawa: **referencja 0.12**, `normal_chapter1_v1`, `economy_simple_v1`. Nie wdrożono wcześniej proponowanych korekt. Nie zmieniono przewodników, rejestrów projektu ani kodu gry.

**Wniosek:** gospodarkę i wykonanie konkretnych przyjętych programów można już przeliczać. Wyniki potwierdzają problemy z odbudową płac, terminem protestów i narastaniem presji zamachowej. Pełna sekwencja gabinetów nadal wymaga wejść, których scenariusz nie określa. M02 nie jest jeszcze zamknięte.

## 1. Co rzeczywiście policzono

Uruchomiono **siedem wariantów polityki gospodarczej**, każdy z dwiema interpretacjami ekspozycji na nowe bezrobocie: 14 przebiegów po 73 rozliczenia miesięczne, od I 1922 do I 1928. Następnie dochodzimy do zaplanowanej granicy wyborczej 19 II 1928. Zgodnie z §4.1–4.5 nie dopisujemy zwykłej lutowej tury przed wydarzeniem kończącym rozdział. **Nie obliczono mandatów ani zatwierdzonego wyniku tych wyborów.**

To warunkowe przebiegi podsystemów, **nie czternaście pełnych rozgrywek**. Przyjęcie pakietu, legalny wykonawca i dostęp PPS do Pracy są jawnymi danymi testu. Nie udajemy, że zostały wynegocjowane lub przegłosowane. Sprawdzenie pełnych N-A/N-B/N-C wymaga również zasobów i decyzji partii, wyborów, obsady urzędów, umów oraz reakcji partnerów.

Przeliczone reguły:

- wszystkie przedziały presji Normalnego, również lata 1926–1928;
- budżet z migawki początku miesiąca, czasowe dochody, obsługa pożyczki, koszty budowy i utrzymania;
- pełne/ograniczone/wstrzymane wykonanie oraz terminy pierwszych efektów;
- inflacja, płace, kredyt, produkcja, bezrobocie i presja agrarna;
- niezadowolenie, radykalizacja, otwarcie żądania płacowego i progi protestów;
- liczba inicjatyw potrzebnych do wykonania badanych programów;
- presja zamachowa dla jawnych wejść politycznych oraz osobne testy impasu i wykonanych porozumień.

Nie wprowadzono obniżonego progu protestu, nowego mechanizmu płac, dodatkowych impulsów wojskowych ani nowych priorytetów gabinetów. Nie użyto niemieckich równań jako zastępstwa brakujących polskich reguł.

### Dane i ograniczenia społeczne

Użyto rozkładu klas i miejskiej siły roboczej z §5.1. Komórki narodowościowe można tu scalić: otrzymują identyczne efekty. Ich łączna masa pozostaje bez zmian. Początkowe niezadowolenie wynosi 35, radykalizacja 0.

Dokument określa przenoszenie preferencji przy utracie pracy, lecz nie domyka przenoszenia niezadowolenia i radykalizacji ani adresowania `newUnemploymentExposure`. Dlatego jawnie zastosowano:

1. Przenoszenie obu ocen wraz z ludźmi i ważenie masą przy łączeniu komórek — założenie diagnostyczne.
2. `exposureMode=0`: sam wpływ warunków życia, bez dodatkowej kary ekspozycji. To wariant tabel głównych.
3. `exposureMode=1`: dodatkowo wzrost miejskiego bezrobocia w pp trafia do każdej komórki modelowanej siły roboczej. To alternatywny test wrażliwości, nie zatwierdzona reguła ani matematyczna górna granica.

Wyniki gospodarki nie zależą tutaj od tego wyboru, ponieważ nie narzucamy faktycznego strajku ani represji. Wyniki społeczne trzeba czytać wraz z tym zastrzeżeniem. W obu wariantach pozostają te same główne wnioski o jesieni 1923 i braku krajowego progu 60.

Brak ugody po otwarciu żądania płacowego jest wejściem testu: +8 nalicza się raz w jego najbliższym rozliczeniu. Cięcia administracyjne adresujemy testowo do zatrudnionej inteligencji; nie twierdzimy, że cała ta grupa była historycznie urzędnikami. Nie dopisano represji, nowych porozumień płacowych ani wojskowej militaryzacji. Osobno sprawdzono lokalny impuls kolejowy +10.

Osłona R4 ma legalny program i finansowanie, ale bez dopisanego kontraktu politycznego: nie naliczamy fikcyjnych naruszeń obietnicy, dissentu, odejścia PPS ani premii za wykonanie umowy. Wynik R4 pokazuje wykonanie fiskalne, nie cały koszt polityczny tolerowania rządu.

## 2. Porównywane warianty

| ID | Przyjęte wejście polityczne | Inicjatywy i finansowanie | Pierwszy efekt |
|---|---|---|---|
| R0 | Żadna oferta stabilizacji nie uzyskuje akceptacji | Brak nowych polityk; skrajny test gospodarki, nie przewidywanie zachowania premierów | Brak złotego |
| R1 | Szybka reforma przy pierwszej dostępnej okazji | IV 1923 przygotowanie; V wdrożenie. 2 B przez 3 M; cięcie administracji +1 B i podatek majątkowy +2 B przez 6 M | VIII 1923 |
| R2 | Stopniowa reforma przy pierwszej okazji | IV 1923 przygotowanie; V wdrożenie. 1 B przez 5 M; bez nowego podatku, cięcia i emisji | X 1923 |
| R3 | Szybki pakiet przyjęty dopiero na początku 1924 | XII 1923 przygotowanie; I 1924 wdrożenie. Pakiet jak R1, przesunięty w czasie | IV 1924 |
| R4 | Późna reforma z osłoną bezrobotnych | Daty jak R3. Reforma 2 B, świadczenie 2 B; podatek majątkowy +2 B i pożyczka +3 B przez 6 M, następnie obsługa −1 B przez 12 M | Osłona I 1924; złoty IV 1924 |
| R5 | R3 oraz program zatrudnienia PPS | XI 1925 przygotowanie, XII wdrożenie przez uprawnione PPS. Budowa 2 B przez 3 M, potem 1 B; bez dodatkowego finansowania | III 1926 |
| R6 | R1 oraz zaakceptowana reakcja kredytowa gabinetu | VI 1925 przygotowanie, VII wdrożenie. Budowa 2 B przez 2 M, potem 1 B; +5 celu kredytu | IX 1925 |

W R4 kredyt w chwili zaciągania pożyczki wynosi 49,10, więc próg ≥40 jest spełniony. Zgoda finansujących pozostaje jawnym wejściem. Każdy uruchamiany pakiet spełnia prognozę budżetu ≥−2 B. Nie przyjmowano następnych polityk poza wymienionymi. To ograniczenie eksperymentu, nie dopisana zasada bezczynności NPC.

## 3. Gospodarka — wyniki

Wartości po rozliczeniu **maja 1926**, bez dodatkowych zakłóceń strajkowych. Inflacja to procent miesięczny; płace i produkcja mają początek 100. B to przestrzeń finansowa danego miesiąca, nie skumulowana kasa.

| Wariant | Inflacja | Płace | Produkcja | Kredyt | Bezrobocie | Budżet B |
|---|---:|---:|---:|---:|---:|---:|
| R0 — bez reformy | 120,00% | 47,27 | 78,08 | 36,16 | 11,63% | −2,06 |
| R1 — szybka, wcześniej | <0,01% | 104,00 | 93,00 | 48,16 | 5,54% | +1,66 |
| R2 — stopniowa, wcześniej | <0,01% | 104,00 | 92,26 | 48,16 | 5,82% | +1,63 |
| R3 — szybka, później | 0,01% | 103,99 | 88,36 | 48,14 | 7,32% | +1,43 |
| R4 — później, z osłoną | 0,01% | 103,99 | 88,36 | 48,14 | 7,32% | −0,57 |
| R5 — później + roboty | 0,01% | 103,99 | 89,16 | 48,14 | 6,82% | +0,46 |
| R6 — wcześniej + kredyt | <0,01% | 104,00 | 93,40 | 52,96 | 5,38% | +0,68 |

### Wcześniejsza stabilizacja jest dostępna bez wyjątkowych warunków gospodarczych

Bez wcześniejszych interwencji inflacja osiąga 22,22% w II 1923 i 24,55% w III. To dwa wymagane miesiące. W **IV 1923** otwiera się możliwość przygotowania; wdrożenie w V kończy szybką reformę w VII, a złoty działa od VIII.

Sam taki wynik nie jest błędem — wcześniejsza reforma ma być możliwa. Problem polega na tym, że obecne priorytety NPC kierują do kryzysu finansowego, a nie określają jeszcze pełnego politycznego kosztu uzyskania zgód. R1 pokazuje rezultat przyjęcia pakietu, **nie dowodzi**, że Nowak lub inny premier zawsze go przyjmie. Nie można traktować R0 jako domyślnego skutku bierności PPS: rząd ma własne inicjatywy.

### Płace automatycznie wracają do 104

Przy braku nowych podwyżek i aktywnej granicy ochronnej wzór §11.4 teleskopuje się do:

```text
płaca_t × (1 + inflacja_t/100) = 100 × 1,04
płaca_t = 104 / (1 + inflacja_t/100)
```

Oznacza to, że przy spadku inflacji do zera płace wracają do **104 niezależnie od głębokości poprzedniej utraty siły nabywczej**. Kod diagnostyczny sprawdza tę tożsamość w każdym miesiącu.

W późnej reformie R3 płace spadają do 49,14 w III 1924, rosną do 75,20 w VI, 91,92 w IX i 99,52 w XII. Nie zawarto nowej ugody płacowej. Historia kryzysu pozostaje w produkcji, bezrobociu i niezadowoleniu, ale niemal znika z samych płac.

R3 w V 1926 ma wyższe bezrobocie niż R1 o 1,78 pp i produkcję niższą o 4,64 punktu. **Nie cała gospodarka resetuje się po reformie**; problem dotyczy przede wszystkim płac i ich wpływu na dalszą eskalację.

### Koszt stabilizacji i kryzys 1925 działają, lecz nie gwarantują upadku gabinetu

Przy późnej szybkiej reformie kredyt spada do 39,60 w III 1924. Wczesna reforma ogranicza rozmiar załamania. Datowany szok 1925 działa także po przyjęciu złotego: w R1 kredyt spada z 54,98 w V 1925 do 43,99 w XII. Produkcja słabnie, bezrobocie rośnie; nie występuje automatyczny nawrót inflacji.

W R1/R3 kredyt podczas tego szoku **nie spada poniżej 35**. B16 nadal może się otworzyć dzięki drugiemu warunkowi: datowanemu impulsowi. Reakcja kredytowa R6 jest finansowo wykonalna i pomaga, ale zaczyna działać dopiero we wrześniu, a nie w czerwcu po samym przygotowaniu.

Wykryte rozłączenie: `majorCrisis` (§8.6) obejmuje inflację, krajowe niezadowolenie ≥60 lub dwa upadki gabinetu. **Nie obejmuje samego kryzysu kredytowego ani B16.** Przy stabilnej walucie, braku takich upadków i wynikach społecznych R1/R3 kryzys 1925 nie otwiera bramki szerokiego gabinetu. Sam opis „szersza koalicja po kryzysie” tego nie zmienia; nadal potrzebna jest inna rzeczywista przesłanka oraz zgody partnerów.

### Wygasające finansowanie tworzy rzeczywisty dylemat

W R4 państwo utrzymuje osłonę za 2 B. W VII 1924 wygasa +2 B podatku majątkowego oraz +3 B pożyczki, a zaczyna działać jej obsługa −1 B: zmiana instrumentów wynosi **−6 B**.

| Miesiąc | Budżet | Wykonanie świadczenia |
|---|---:|---:|
| VI 1924 | +2,71 B | 100% |
| VII 1924 | −2,31 B | 50% |
| VIII 1924 | −2,32 B | 50% |
| IX 1924 | −1,34 B | 100% |

Nominalny koszt nie znika. Powrót pełnego wykonania wynika ze spadku inflacyjnego obciążenia budżetu, bez kolejnej akcji. Kryterium dwóch zakończonych miesięcy niedoboru jest spełnione na początku IX, kiedy bieżące wykonanie już się poprawia — kolejka powinna rozróżniać historyczne naruszenie i nadal trwający niedobór.

To dobry działający mechanizm, lecz jego wpływ na koalicję wymaga konkretnej umowy: czy PPS zagwarantowała pełną wypłatę, od kiedy, komu, z jaką wagą i czy uzgodniono zmianę. **Nie należy dopisywać automatycznej dymisji po dwóch miesiącach deficytu.**

### Roboty mają skutek i termin, ale jedna mała inwestycja nie wymusza oszczędności

R5: przygotowanie XI 1925, wdrożenie XII, wykonanie XII–II, pierwsze miejsca pracy III 1926. W V bezrobocie jest o **0,50 pp** niższe niż w R3. To odjęcie poziomu, nie kolejne −0,50 pp co miesiąc. Budżet pozostaje dodatni podczas działania. Nie ma podstawy, by z samego tego programu wywołać rozpad koalicji wiosną 1926.

Przy braku dalszych wydarzeń produkcja przed wyborami osiąga 98,12 w R5 wobec 91,60 w R3. Jest to skutek utrzymywanego programu z kosztem 1 B, nie darmowy bonus po jego zamknięciu.

## 4. Protesty i związki

W R0/R3 płaca spada poniżej 80 w VII, VIII i IX 1923. Żądanie otwiera się w X. Dodanie +8 za brak ugody nadal nie wystarcza do progu 60:

| Odczyt | Niezadowolenie zatrudnionych robotników |
|---|---:|
| XI 1923, warunki życia i +8 | 49,48 |
| XI 1923, dodatkowo testowa ekspozycja na nowe bezrobocie | 49,95 |
| XI 1923, lokalnie także rzeczywista militaryzacja kolei +10 | 59,48–59,95 |
| XII 1923, bez militaryzacji | 50,41 w wariancie podstawowym |

Militaryzacji nie dodano do krajowego niezadowolenia ani do wszystkich robotników. To osobny test branży przy założonej decyzji władz. Jej rzeczywista dostępność wymaga wcześniejszego sporu, wykonalnej ugody i odpowiedzi instytucji. Dodatkowe represje mogłyby zmienić wynik, ale muszą być faktycznym zdarzeniem.

**Sama drożyzna i odrzucone żądanie nie uruchamiają tu głównej karty protestowej jesienią 1923.** Bez reformy próg zostaje osiągnięty dopiero na kartę w X–XI 1924, zależnie od interpretacji ekspozycji. Przy późnej reformie R3 nie zostaje osiągnięty w ogóle przed wyborczą granicą. Radykalizacja zaczyna się od 0 i rośnie dopiero przy niezadowoleniu >60, więc nie stanowi wcześniejszego automatycznego obejścia. Próg spontanicznego protestu 40 również nie zostaje osiągnięty w tych wariantach bez dodatkowej przemocy.

To nie dowód, że w całej grze strajk jest niemożliwy: gracz może przygotować własną akcję, mogą wystąpić konkretne represje i konflikty lokalne. To dowód, że **obecny podstawowy łańcuch gospodarczy sam nie dostarcza oczekiwanego kryzysu 1923**.

Związki także nie stają się potęgą od samego upływu czasu. Przy początkowym zasięgu 20, gotowości 25, zgodności 50 i spójności PPS 95,25:

- posłuch = 0,83575;
- potencjalne kontrolowane uczestnictwo = 4,17875 w skali branży;
- miesięczny koszt aktywnej akcji = 0,1417875 R;
- przed XI 1923 fundusz przemysłowy = 1,16 R, kolejowy = 0,91 R, bez wydatków na wcześniejsze strajki;
- dla wykonalnego ograniczonego żądania szansa akceptacji oferty wynosi około 39,1% w przemyśle i 48,1% na kolei, przy autorytecie 55.

Fundusz wystarcza do testu dwumiesięcznego, lecz gotowość i zasięg pozostają małe. Nie wykonano losowania sukcesu bez nazwanej oferty i wykonawcy. PPS tolerująca rząd potrzebuje konkretnych wcześniejszych akcji organizacyjnych; nie można ich zastąpić etykietą przebiegu N-B.

## 5. Presja zamachowa

W podstawowym rachunku politycznym zadano operacyjny gabinet, autorytet 55, brak nowych impulsów osobistego konfliktu i brak premii za wykonanie umów. To **kontrolowane wejście**, nie obliczona historia parlamentu.

Krajowe niezadowolenie pozostaje poniżej 60 nawet w R0: przed wyborami osiąga 57,34 lub 57,60 w drugim wariancie ekspozycji. W R1–R6 jest niższe. W tym teście presja pozostaje na **10**. Sam rzeczywisty powrót Chjeno-Piasta w V 1926 podniósłby ją do **30**, wobec wymaganego **65**. Brak zamachu wynika więc także z braku dodatnich wejść politycznych; nie wolno opisywać tego jako wyliczonego sukcesu PPS.

Osobne testy izolują obecne ujemne składniki. Przy początkowej presji 50 i bez dodatnich impulsów, po sześciu miesiącach:

| Wykonywany warunek | Presja |
|---|---:|
| Umowy rządowe, −2/M | 38 |
| Wiarygodny kompromis, −3/M | 32 |
| Oba jednocześnie, −5/M | 20 |

Pierwsza premia sama dokładnie równoważy +2/M za krajowe niezadowolenie ≥60. Dokument nie definiuje dostatecznie ostro, jak długo `cabinetExecutingAgreements` jest prawdziwe po spełnieniu pojedynczej obietnicy. Nie założono automatycznie, że legalnie działający gabinet zawsze otrzymuje tę premię.

### Czy próba jest w ogóle osiągalna?

Tak, przy określonych dodatkowych zdarzeniach. Przeliczono wspólnie autorytet i presję od XI 1925 do V 1926, zaczynając od presji 10. Przez sześć miesięcy nie ma operacyjnego gabinetu; w maju udaje się rzeczywiście powołać Chjeno-Piast, co kończy impas i daje +4 do autorytetu oraz jednorazowe +20 presji. Nie dodano wysokiego krajowego niezadowolenia ani zniżek za porozumienia.

| Dodatkowe zapisane zdarzenia | Autorytet w V | Presja w V | Próg 65 |
|---|---:|---:|---|
| Brak | 41 | 50 | Nie |
| Dwie nieudane próby utworzenia gabinetu w poprzednich 12 M | 29 | 60 | Nie |
| Jak wyżej oraz jedno ostre zerwanie porozumienia z Piłsudskim w IV, +8 | 29 | 68 | Tak |

To **syntetyczne testy wrażliwości**, nie rekonstrukcja historii ani dowód, że takie zdarzenia generuje dziś scenariusz. Zdarzenia dostarczono jawnie; bez nich równania ich nie tworzą. Licznik miesięcy impasu i skutki formowania gabinetu naliczono raz, według §15.2.

Przy dostępności wszystkich czterech syntetycznych grup wojsk zdolność wynosi **36,231**, co przekracza próg 30. Przy dostępnych tylko grupach stołecznych wynosi **29,763** i nie przekracza go. Wynik 68 otwiera więc możliwość próby dopiero przy odpowiedniej dostępności sił, logistyce, braku ugody o odstąpieniu i pozostałych bramkach. Nie obliczono zwycięzcy zamachu; test kończy się na możliwości rozpoczęcia, a profil operacyjny M08 pozostaje potrzebny.

## 6. Co dzieje się do granicy wyborczej

Poniżej stan po I 1928 przy utrzymaniu wejść danego eksperymentu. Warianty nie mają obliczonego politycznego powodu przedterminowych wyborów ani uruchomionego zamachu. To stan **przed** umówioną granicą 19 II, nie kompletny raport wyborczy.

| Wariant | Płace | Produkcja | Bezrobocie | Budżet B | Krajowe niezadowolenie |
|---|---:|---:|---:|---:|---:|
| R0 | 47,27 | 71,61 | 14,65% | −2,40 | 57,34 |
| R1 | 104,00 | 96,41 | 4,27% | +1,82 | 35,51 |
| R2 | 104,00 | 95,64 | 4,55% | +1,78 | 38,58 |
| R3 | 104,00 | 91,60 | 6,06% | +1,58 | 41,85 |
| R4 | 104,00 | 91,60 | 6,06% | −0,42 | 39,84 |
| R5 | 104,00 | 98,12 | 5,56% | +0,89 | 41,82 |
| R6 | 104,00 | 98,28 | 3,60% | +0,91 | 35,23 |

R0 otrzymuje również dodatni impuls produkcyjny VII 1926–VI 1927, ale nie usuwa on nierozwiązanej presji marki i słabego kredytu. Przy założonym braku nowych reform gospodarka nadal się pogarsza. Warianty ze stabilizacją stopniowo się odbudowują. Ten fragment kalendarza działa bez dopisywania gospodarczego bonusu za zwycięstwo Piłsudskiego.

## 7. Gabinety — co można już sprawdzić, a czego nie można uczciwie wyliczyć

**Sprawdzone:** badane programy respektują limit jednej nowej inicjatywy gabinetu na miesiąc, osobne przygotowanie i wdrożenie, budżet całego pakietu i opóźniony efekt. Roboty PPS kosztują dwie własne akcje; NPC nie wykonuje za PPS drugiej inicjatywy w jej resorcie. Program kredytowy może zacząć się po szoku 1925 bez oczekiwania na kartę gracza, jeśli jego oferta uzyska zgody.

**Nie wyliczono z samej daty** powołania Nowaka, Witosa, Grabskiego i Skrzyńskiego, upadku koalicji, zamordowania prezydenta, kolejowych represji ani współrządzenia PPS. Pierwsza taka nierozstrzygnięta gałąź występuje już przy konflikcie gabinetowym VI–VII 1922. Zapisane profile mają preferencje i warunki, ale nie tworzą jeszcze kompletnego automatycznego scenariusza dla każdego stanu.

| Brakujące wejście lub przejście | Dlaczego jest potrzebne w pełnym przebiegu |
|---|---|
| Pełne oferty NPC: premier, partnerzy, resorty, program, terminy i zgody | Priorytet „stabilizacja” nie rozstrzyga, czy przyjęto szybki, osłonowy czy stopniowy pakiet i kto go poprze |
| Kolejność alternatyw po odrzuceniu oferty oraz znaczenie „niezbędnej korekty” | Bez niej nie da się wyznaczyć momentu dobrowolnej dymisji ani udowodnić braku wykonalnej alternatywy |
| Wyniki wyborów, zgody urzędowe i reakcje partnerów przy konkretnych decyzjach PPS | Nie można narzucić historycznej większości ani przyznać PPS resortu Pracy za sam opis N-C |
| Konkretne żądanie, wykonalna ugoda, reakcja policji i udział branż w komórkach | Decydują o dodatkowym niezadowoleniu, skali strajku i represjach; próg sam nie tworzy całej sprawy |
| Datowane sprawy wojskowe i dokładny czas działania zniżek za umowy | Sam maj lub brak nominacji Piłsudskiego nie dodaje presji; domyślne 0 pozostawia model bez części oczekiwanej eskalacji |
| Definicja istotnej ustawy i innych wpisów historii autorytetu | Nie każdemu programowi wolno przyznać arbitralnie +4; to zmienia demokrację i bramkę autorytetu <40 |
| Operacyjny profil sił i rozstrzygnięcie konfrontacji | Presja ≥65 jest warunkiem próby, nie jej wynikiem; M08 pozostaje oddzielne |

To konkretne powody, dla których powyższych wyników nie należy podpisywać „pełne N-A/N-B/N-C ukończone”. Nie zastąpiono brakujących danych niewidoczną decyzją skryptu.

## 8. Odtwarzanie i kontrola

Z katalogu głównego repozytorium:

```sh
node analysis/m02-current-rules/calculate.cjs
```

Pliki:

- [calculate.cjs](calculate.cjs): samodzielny kalkulator Node bez zależności i bez importowania/zapisywania stanu gry;
- [monthly.csv](monthly.csv): wszystkie 1022 rozliczenia, pełna precyzja oraz składowe budżetu i presji;
- [checkpoints.csv](checkpoints.csv): skrót dat do porównania;
- [results.json](results.json): konfiguracje, założenia, dzienniki inicjatyw, podsumowania, testy polityczne i sumy SHA-256 dokumentów wejściowych.

Sprawdzenia kalkulatora obejmują granice przedziałów szoków, zachowanie masy elektoratu, budżet przy wdrożeniu, limit inicjatyw, tożsamość płac, czas budowy i pierwszego efektu, wygaśnięcie finansowania/obsługi pożyczki, wykonanie połowiczne i niekumulacyjne miejsca pracy. Zakończyły się pomyślnie. Liczby w raporcie są zaokrąglone; <0,01% nie oznacza wymuszonego dokładnego zera.

Niezależne przeliczenie analityczne inflacji R0 oraz kontrola składników budżetu wszystkich 1022 wierszy także przeszły. Sumy SHA-256 potwierdzają brak zmiany dokumentów wejściowych podczas obliczeń. `npm test`: **83/83 testy zakończone pomyślnie**, bez pominięć i błędów.

Nie zmieniano Dendry, zależności ani zasobów, więc nie wykonywano przebudowy gry ani testu przeglądarkowego. Obecne testy gry nie weryfikują jeszcze zaproponowanego następcy gospodarki i polityki; poprawne rachunki diagnostyczne nie zastępują testu integracyjnego.

Źródła reguł: [POLISH_TECHNICAL_REFERENCE.md](../../docs/POLISH_TECHNICAL_REFERENCE.md), przede wszystkim §3–5, §8.6–8.7, §9, §10.3, §11–12, §14–16, §17.4, §17.12, §17.16 i §19. Zakres i otwarte zależności: [POLISH_MECHANICS_AUDIT.md](../../docs/POLISH_MECHANICS_AUDIT.md), M02, M06–M10. Nie dodano nowych twierdzeń ani źródeł historycznych.
