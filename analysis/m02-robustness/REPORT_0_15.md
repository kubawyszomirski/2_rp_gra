# M02, krok 4 — cztery strategie, trzy Sejmy, wspólne losowania

> Archiwum reguł 0.15. Bieżące skrypty i pliki wynikowe zostały zastąpione rewizją 0.16. Zbiorcze wyniki sprzed korekty zachowuje [baseline-0.15.json](baseline-0.15.json), aktualny wynik opisuje [REPORT.md](REPORT.md). Poniższe wnioski i otwarte pytania dotyczą stanu przed końcową akceptacją użytkownika.

22 IX 2026. **Różnice między strategiami mają rzeczywiste skutki, ale wcześniejszy majowy wynik H nie jest odporny na połączenie gospodarki z ocenami ofert.** W bazowym Sejmie B i C unikają próby dzięki wykonanej ugodzie, A dochodzi do niej w XII 1926, a H w II 1927. Nie podwyższono presji, żeby odzyskać maj. Zmiana mandatów wpływa na legalne następstwo gabinetów, dostęp do reform i możliwość wykonania ugody.

Uruchomienie: `node analysis/m02-robustness/run.cjs`. [Zestawienie](SUMMARY.md), [dwanaście przebiegów ze wspólnego ziarna 01](TRACES.md), [miesięczne rozliczenia wszystkich wariantów](monthly.csv), [oferty, głosy, zdarzenia, projekty i losowania](results.json). Skrypty [engine.cjs](engine.cjs) i [negotiations.cjs](negotiations.cjs) są diagnostyką dokumentacji; nie zostały podłączone do gry.

## Co dokładnie policzono

- **144 główne przebiegi:** 4 strategie × 3 Sejmy × 12 wspólnych ziaren `m02-robustness-01`…`12`.
- **216 porównań pojedynczych decyzji:** pominięcie ugody w B/C, robót w C, przygotowania rozmów z mniejszościami w B, doradcy lub dodatkowego kontaktu z ZLN w H. Każde porównanie zachowuje ten sam Sejm i ziarno.
- **36 kontroli wcześniejszego sporu wojskowego:** wszystkie strategie i Sejmy, trzy pierwsze ziarna, sprawa otwarta od VI 1923 zamiast testowego I 1925.

Każdy przebieg przelicza miesiące od I 1922 do rozstrzygnięcia syntetycznej próby albo granicy kolejnych wyborów, 19 II 1928. Gospodarka nie jest odczytywana z dawnego H: zmienia się przez faktycznie przyjęte i wykonane polityki, koszty, strajki i finansowanie. Oferta odrzucona przez parlament nie daje projektu, podatku ani późniejszej premii.

Formuły gospodarki i społeczeństwa pochodzą z `analysis/m02-current-rules/calculate.cjs`, z zatwierdzoną odbudową płac +3. Zasady ofert pochodzą z technicznej referencji 8.3, profile i odmowy z 8.9/17.16.8, presja z 15.3/17.16.9. Wspólny kalkulator ofert odtwarza wszystkie **59 wcześniejszych ocen**. Dawne archiwa pozostają niezmienione.

## Składy parlamentu

To trzy **syntetyczne wyniki wyborów 1922**, a nie odtworzenie historycznego podziału mandatów. Do tych wyborów zachowujemy wspólne otwarcie instytucjonalne. Wariant bazowy pochodzi z poprzednich rachunków; zmiana dotyczy tylko 12 z 444 miejsc.

| Klub | Bazowy | Korzystniejszy dla PPS | Trudniejszy dla PPS |
|---|---:|---:|---:|
| PPS | 41 | 49 | 33 |
| Wyzwolenie | 49 | 53 | 45 |
| Piast | 70 | 70 | 70 |
| NPR | 18 | 18 | 18 |
| PSChD | 60 | 56 | 64 |
| ZLN | 100 | 92 | 108 |
| Reprezentacja żydowska | 45 | 45 | 45 |
| Pozostałe mniejszości | 45 | 45 | 45 |
| Pozostali | 14 | 14 | 14 |
| Komuniści | 2 | 2 | 2 |
| **Razem** | **444** | **444** | **444** |
| **Piast + PSChD + ZLN** | **230** | **218** | **242** |
| **Ten sam blok po odejściu 10 posłów Piasta** | **220** | **208** | **232** |

Dlatego w korzystniejszym Sejmie nie można po prostu mianować Chjeno-Piasta w maju 1923, a w trudniejszym odejście dziesięciu posłów nie wystarcza do odwołania go w grudniu. Głosowania w tej diagnostyce zakładają obecność wszystkich posłów; brak deklaracji poparcia oznacza głos przeciw. Nie testowano odmiennego kworum i strategicznych wstrzymań.

## Strategie i uczciwe porównanie losowań

**A — bierna:** bez rozbudowy zaplecza, bez własnych rokowań strajkowych, osłon i ugody wojskowej. Państwo nadal prowadzi legalne działania samodzielnie.

**B — tolerująca:** buduje aparat i związki, najpierw proponuje ograniczoną ugodę pracowniczą, przygotowuje rozmowy z oboma segmentami mniejszości, próbuje uzyskać finansowane osłony od popieranego premiera. Nie wchodzi do gabinetu; zabiega o wykonawcę ugody wojskowej.

**C — współrządząca:** przygotowuje zaplecze i porozumienia jak B, rozwija także stosunki z prawicowymi partnerami, proponuje szeroki gabinet, chroni osłony i próbuje uruchomić roboty publiczne. Zajęcie Pracy, finansowanie oraz zgody muszą faktycznie powstać. Sama nazwa strategii nie przyznaje ministerstwa.

**H — decyzje zbliżone do historycznych:** silniejsza kolej, postulat polityczny podczas strajku, brak wcześniejszego pakietu osłon Grabskiego i brak ugody wojskowej; próba wejścia do szerokiego gabinetu, negocjacja osłon, odejście po odmowie. Używa dostępnego Daszyńskiego i jednego kontaktu z ZLN. To plan wyborów gracza, nie skrypt dat historycznych.

Losowość obejmuje przyjęcie ugody płacowej, starcie w aktywnym sporze i wybór strony przez jednostki. Liczba pochodzi z `hash(ziarno, identyfikator sprawy i rundy)`. To samo zdarzenie otrzymuje tę samą liczbę także wtedy, gdy w innej strategii wystąpi później. Pominięte zdarzenie nie przesuwa losowań reszty kampanii. Głosy i zgody polityczne są obliczane, nie losowane. Dwanaście ziaren służy porównaniu odporności, nie estymacji historycznego prawdopodobieństwa.

**Dostęp do zwykłych kart jest kontrolowanym wejściem.** Strategie mają dostęp do zaplanowanych legalnych działań; sprawdzane są miesiące, koszty, kompetencje i odnowienia. Nie symulowano losowania pełnych trzech talii ani optymalnego zarządzania ręką. Nie wolno przedstawiać wyniku jako dowodu odporności na pech w doborze kart. Rozpoczęte programy korzystają z gwarantowanej agendy.

## Główne wyniki

Daty oznaczają początek próby, której krótka sekwencja nie dodaje miesięcy, albo dojście do granicy wyborów. Nie prognozujemy wyniku tych wyborów.

| Strategia | Bazowy Sejm | Korzystniejszy | Trudniejszy |
|---|---|---|---|
| A — bierna | XII 1926, 12/12 | III 1927, 12/12 | IV 1927, 12/12 |
| B — tolerująca | Bez próby do wyborów, 12/12 | Bez próby do wyborów, 12/12 | V 1927: 6/12; VI 1927: 6/12 |
| C — współrządząca | Bez próby do wyborów, 12/12 | Bez próby do wyborów, 12/12 | V 1927: 6/12; VI 1927: 6/12 |
| H — historycznie zbliżone decyzje | II 1927, 12/12 | I 1927, 12/12 | V 1927, 12/12 |

Daty większości przesileń są odporne na badane losowania, ponieważ decydują o nich większość i akceptacja programu. Losowość wpływa wyraźniej na długość protestu, wykonanie ugody płacowej i gospodarcze następstwa zakłóceń. W B bazowym strajk pojawia się w 6/12 przebiegów; w C i H w 12/12. W bazowych B/C/H starcie występuje w 2/12. Są to wyniki tego zestawu losowań, nie wyważone docelowe częstości.

### Bazowy Sejm: co robią rządy

Wspólne otwarcie daje kryzys walutowy w IV 1923 i możliwość oferty prawicy w V. Chjeno-Piast ma 230 głosów, przygotowuje ziemię i finansowanie, potem stabilizację. Parcelacja zaczyna działać w XI 1923, reforma walutowa w XII. Październikowe żądanie płacowe i listopadowe decyzje strajkowe wynikają z trzech miesięcy niskich płac. W XII odchodzi dziesięciu posłów Piasta: 220 głosów nie wystarcza do utrzymania rządu; oceniona oferta Grabskiego uzyskuje poparcie.

| Moment | A | B | C | H |
|---|---|---|---|---|
| XII 1923 | Brak osłon PPS | Przyjęty pakiet osłon i finansowania | Taki sam przyjęty pakiet | Tolerowanie bez tego pakietu |
| VI–VIII 1925 | Przygotowanie kredytu; dwie odmowy, dymisja Grabskiego w VIII | Pierwsza oferta przyjęta w VII; Grabski zostaje | Pierwsza oferta przyjęta w VII | Dwie odmowy; Grabski odchodzi w VIII |
| Następny gabinet | Witos w VIII 1925 | Grabski pozostaje | Przyjęta przebudowa na Skrzyńskiego w XI 1925 | Skrzyński powołany już w VIII 1925 |
| Osłony | Brak | Pełne | Pełne, kompromis w IV 1926 | Uchwalenie IX 1925; odmowa kompromisu I 1926 |
| Decyzja PPS po sporze | — | — | Pozostaje | Wyjście II 1926, następca III; cięcie osobną ustawą IV |
| Ugoda wojskowa | Brak | Wykonana VIII 1925 | Wykonana XII 1925 | Brak |
| Roboty PPS | Brak | Brak kompetencji ministra | Przygotowanie I 1926, wdrożenie II, działanie od V | Brak takiego wyboru |

Żadna odmowa nie jest naprawiana dopisaniem efektu projektu. Nowy gabinet dziedziczy uchwalone świadczenia; powołanie Witosa nie tnie ich samo w sobie.

### Dlaczego padają odmowy

| Sprawa w bazowym Sejmie | Obliczony wynik | Znaczenie |
|---|---|---|
| Osłony B/C u Grabskiego | Ocena premiera ok. 68,47 przy pierwszym ziarnie; odrębne głosowanie **268:176** | Zgoda premiera sama nie zastępuje większości finansującej |
| Pierwszy kredyt A | **160:284**, przy wykonalnym budżecie | Brak poparcia PPS i uzgodnionych warunków mniejszości; część centrum wymaga wydzielonego finansowania |
| Poprawka kredytowa A | **137:307** | Podatek pozyskuje część centrum, traci prawicę; brak wystarczającej większości |
| Pierwszy kredyt H, potem poprawka | **201:243**, potem **178:266** | Samo poparcie PPS nadal nie daje większości. Po drugiej odmowie następuje dymisja |
| Pierwszy kredyt B/C | **291:153** | Przygotowane i ocenione poparcie obu segmentów mniejszości zmienia wynik; poprawka nie jest potrzebna |
| Kompromis osłon C | ZLN ok. **61,75**, przy relacji 29 | Przechodzi ocenę i próg relacji; osłony pozostają pełne |
| Kompromis osłon H | ZLN ok. **56,75**, relacja 9 | Odmowa; PPS nie wychodzi automatycznie, dopiero następna własna akcja wykonuje ten wybór |

Warunek wydzielonego finansowania oraz warunki segmentów mniejszości są profilami P z tej rodziny testów, nie opisem historycznych głosowań. Kontakt otwiera konkretną ofertę zawierającą niedyskryminacyjne warunki; każdy segment przechodzi ocenę programu. Nie przyznajemy mu bezwarunkowego stałego poparcia PPS.

### Co zmienia korzystniejszy i trudniejszy Sejm

**Korzystniejszy:** 218 głosów nie obala Sikorskiego w V 1923. Brak priorytetu parcelacji Chjeno-Piasta pozwala wcześniej przeprowadzić stabilizację: złoty od VIII 1923. B próbuje osłon u innego premiera; ocena ok. 57,24 odrzuca pakiet. C/H mogą doprowadzić do uzgodnionej przebudowy w XI 1925 i osłon szerokiego gabinetu. C ma jednak za mało przestrzeni finansowej na dodatkowe roboty: prognoza przy pierwszym ziarnie **−3,39 B**, poniżej dopuszczalnego −2. Nie ma robót ani fikcyjnych miejsc pracy. Po wyjściu H w V 1926 Witos nadal nie ma większości; Skrzyński uzyskuje **236:208** dla kontynuacji bez PPS w VI.

**Trudniejszy:** prawica z Piastem zaczyna od 242 i po odejściu dziesięciu posłów zachowuje 232. Grabski nie obejmuje rządu. B nie otrzymuje zatem dostępu do jego tolerowania; C nie uzyskuje Pracy za sam wybór strategii. Obie mogą nadal pomóc uchwalić kredyt, ale nie otrzymują automatycznego wykonawcy ugody wojskowej ani osłon. W tych planach legalne działania państwa nadal trwają, a nierozwiązany spór wojskowy ostatecznie prowadzi do próby.

Więcej mandatów PPS nie oznacza automatycznie większego budżetu. W korzystniejszej ścieżce nie powstaje wcześniejszy pakiet podatkowy Grabskiego, który w bazowym C finansuje połączenie osłon i robót. To czytelna zależność programu od wcześniejszych decyzji, nie powód do premii budżetowej za wynik wyborów.

## Wykonanie programów i gospodarka

W bazowym B/C osłona 2 B zaczyna działać w XII 1923. Pakiet obejmuje trwałe +1 B progresji i +2 B podatku majątkowego na sześć miesięcy; ten drugi rzeczywiście wygasa w VI 1924. Kredyt przyjęty w VII 1925 buduje się przez dwa miesiące, działa od IX i nadal kosztuje 1 B. Roboty C kosztują 2 B przez trzy miesiące, potem 1 B utrzymania. W maju 1926 dają dwie jednostki zatrudnieniowe.

| Bazowy Sejm, V 1926; zakres 12 losowań | A | B | C | H |
|---|---:|---:|---:|---:|
| Budżet B | 2,35 | 0,26–0,38 | −0,74…−0,64 | 1,15–1,31 |
| Bezrobocie modelowe, % | 7,96 | 7,74–8,65 | 7,38–8,15 | 8,32–9,58 |
| Koszt osłony B | 0 | 2 | 2 | 1 |
| Działające jednostki robót | 0 | 0 | 2 | 0 |
| Presja zamachowa | 51 | 7–9 | 21–23 | 47 |

Wskaźniki są wartościami modelu, nie historyczną statystyką. Rezerwa budżetowa A nie oznacza poprawy sytuacji bezrobotnych: nie finansuje on osłon i robót. Wcześniejsze ograniczone wykonanie projektów także jest zapisane: parcelacja trwa dłużej niż idealne cztery miesiące, gdy jej budżetowe pokrycie wynosi 0,5.

## Które decyzje mają wykazany wpływ

Porównania są sparowane: zmieniamy jedną wskazaną decyzję, pozostawiając pozostały plan i losowania.

| Zmiana w bazowym Sejmie | Wynik |
|---|---|
| B rezygnuje z ugody wojskowej | Zamiast dojścia do wyborów: próba V–VI 1927 |
| C rezygnuje z ugody wojskowej | Zamiast dojścia do wyborów: próba II–III 1927 |
| C rezygnuje z robót | Bezrobocie w V 1926 wyższe dokładnie o **0,50 pp** w każdym sparowanym przebiegu; brak kosztu programu i jego jednorazowej nagrody |
| B pomija przygotowanie porozumień z mniejszościami | Nie ma większości dla wcześniejszej osłony ani obu ofert kredytowych; Grabski odchodzi, wraca prawica, próba XII 1926–I 1927 |
| H nie korzysta z koalicyjnej akcji Daszyńskiego | Nie uzyskuje zgody na szeroki gabinet w badanej ofercie; brak późniejszej osłony, próba o miesiąc wcześniej |
| H pomija jeden dodatkowy kontakt z ZLN | W tym zestawie nie zmienia końca: inne składniki nadal wystarczają do powołania, a późniejszy kompromis i tak odpada |

Ostatni wynik jest istotny: nie każda dodatkowa akcja musi przesuwać przekroczony już próg. W trudniejszym Sejmie pominięcie ugody niczego nie zmienia, ponieważ strategia nie uzyskała do niej dostępu. Również pominięcie robót nie zmienia stanu tam, gdzie program wcześniej nie przeszedł warunków.

## Co pozostaje do poprawienia

**1. Majowy wynik kroku 3 był warunkowy.** Tam zachowano gotowy gabinet Skrzyńskiego z XI 1925 i powrót Witosa w V 1926. Po obliczeniu głosów H traci Grabskiego już w VIII 1925. Przegląd następcy wypada w I 1926, odejście PPS w II, a powrót Witosa w III. Majowy wynik nie przechodzi tego testu. Nie należy zachowywać go jako „sprawdzonej kampanii historycznej”.

**2. Impuls powrotu prawicy jest zbyt zależny od okna daty.** Obecna reguła daje +20 dopiero za powrót od V 1926. Powrót w III nie dostaje go ani wtedy, ani później. To nie błąd rachunku: diagnostyka zachowuje zapis 0.15. Jest to kandydat do uproszczenia projektu: powiązać ewentualny impuls z konkretną eskalacją i powrotem gabinetu w otwartej sprawie, zamiast z granicą maja. Nie zmieniono tej reguły w ramach testu.

**3. Termin otwarcia i zamknięcia sprawy wojskowej nadal silnie steruje końcem.** Przy stale otwartej sprawie od VI 1923, zamiast testowego I 1925, A i H dochodzą do próby już w III 1926 we wszystkich trzech Sejmach. W trudniejszym Sejmie dotyczy to także B/C; w pozostałych ugoda nadal zapobiega próbie. Trzeba opisać rzeczywisty przebieg poszczególnych spraw i wykonane odpowiedzi. Nie zwiększać stawki +2, nie kasować starego konfliktu samą datą i nie dodawać automatycznego wymuszenia maja.

**4. Dodatkowy próg relacji może blokować ofertę mimo akceptowalnej oceny.** W korzystniejszym H ocena ZLN przy przeglądzie wynosi ok. 64,10, ale relacja 9 nie spełnia osobnego minimum 25. Kompromis więc odpada pomimo braku wykonalnej większości Witosa. Trzeba świadomie zachować taki twardy warunek albo polegać na wspólnej ocenie. Rachunek nie usuwa go samodzielnie.

**5. Część reakcji aktorów nadal jest profilem do zatwierdzenia.** Obliczone zgody nie zastępują ustalenia, jaką propozycję aktor w ogóle zgłasza. Test jawnie podaje warunki podatkowe, jedną publiczną interwencję wojskową i gotowość premiera bez własnej większości partyjnej do rozpatrzenia przebudowy. Nie wolno wyprowadzać z tych profili ogólnego twierdzenia o historycznych intencjach postaci. Potrzebne jest dopięcie krótkich, konkretnych profili, a nie kolejnego miernika.

## Założenia i granice dowodu

- Początek instytucjonalny 1922, gałąź Narutowicza, legalny prezydent i wykonawcy mają wspólny profil. Po wyborach porównujemy wskazane oferty, nie cały katalog wszystkich premierów i koalicji. PPS w C/H preferuje szeroki gabinet; nie optymalizuje wszystkich możliwych centrolewicowych alternatyw.
- Profile stron i programów bazują na krokach 1–2. Sikorski ma testowy ideał fiskalny 0, Witos −1; rząd pozapartyjny może ocenić propozycję przebudowy, a prawicowy z własną większością nie przyjmuje jej w tym planie. To jawne P, nie nowe zatwierdzone reguły wszystkich gabinetów.
- Mniejszości mają dwa segmenty po 45 miejsc. Własne kontakty PPS otwierają przygotowane oferty poparcia niedyskryminujących pakietów, a wynik zależy od ich oceny. Inni posłowie i komuniści w badanych ustawach nie dołączają do większości. To kontrolowany zestaw deklaracji, nie pełny model parlamentarnych manewrów.
- Reputacja PPS rośnie za faktycznie wykonane jej zobowiązania; nie dostaje nagród za wszystkie reformy cudzych rządów. Reakcje frakcyjne zastosowanych wyborów wpływają na posłuch. W tych przebiegach nie osiągnięto progu E3; nie testowano całego katalogu rozłamów, nowych frakcji ani transferów wyborców.
- Syntetyczny profil sił, logistyka i brak przyjętej ugody podczas walk pozostają wejściami. Wyniki wojskowe są diagnostyką F, nie ustalonym historycznym balansem M08. Różnice między losowaniami nie są prawdopodobieństwem historycznego zwycięstwa Piłsudskiego.
- Wybory 1922 są wejściem, a następne legalne wybory granicą obserwacji. Nie wyliczono ich wyniku ani sondaży z niezadowolenia — to nadal zakres M09. Nie dodano karty wcześniejszych wyborów.

**M02 nie należy jeszcze zamykać.** Wykonano sparowane porównanie miesięcznych przebiegów i wskazano konkretne niestabilne założenia. Zależność zmian gabinetów od głosów, rozdzielenie finansowania i wykonania oraz wpływ decyzji gracza działają w badanym zakresie. Historyczne tempo, profile aktorów i odporność na zwykły dobór kart pozostają do domknięcia.

## Weryfikacja i pliki

Sprawdzenia obejmują 59 dawnych ocen, identyczny wynik ponownego uruchomienia, wspólne klucze losowań, sumę 444 mandatów, poprawne większości, jedną inicjatywę gabinetową i najwyżej jedną główną akcję PPS na miesiąc, nieujemne fundusze, skończone wartości, brak powielonych programów i nagród oraz brak uruchomienia robót bez wcześniejszego uzyskania Pracy. Cały katalog poprzednich plików diagnostycznych zachowuje te same skróty.

`npm test`: **83/83**. Diagnostyka: **396 zakończonych przebiegów**, bez błędów kontroli. Nie zmieniono Dendry, zasobów ani interfejsu, więc nie wykonywano przebudowy ani testu przeglądarkowego. Te testy nie oznaczają wdrożenia polskiego kontraktu w działającej grze.

Dodano `analysis/m02-robustness/{engine.cjs,negotiations.cjs,run.cjs,REPORT.md,SUMMARY.md,TRACES.md,results.json,monthly.csv}`. Wyniki i zastrzeżenia odnotowano w obu polskich przewodnikach, audycie oraz `PLAN.md`, `MECHANICS_MAP.md`, `STATE_VARIABLES.md`, `TRANSITION_MATRIX.md`, `HISTORICAL_SOURCES.md`. Zmiana nie zatwierdza nowych współczynników ani nie usuwa wcześniejszych otwartych problemów.
