# M02 — obecne reguły a prosty pakiet poprawek

21 IX 2026. **Porównanie i rekomendacja do zatwierdzenia, nie zmiana obowiązującej specyfikacji.** Przewodniki, audyt i kod gry pozostają bez zmian.

Rekomenduję pięć ograniczonych zmian: krótkie priorytety gabinetów, stopniowy powrót płac, dostęp do ograniczonego protestu po odrzuceniu żądań, presję za konkretny nierozwiązany konflikt wojskowy i jedną poprawioną ofertę przed dymisją. Nie potrzeba nowej talii, waluty ani rozbudowanego systemu zarządzania rządem.

## 1. Co porównano

Wzięto siedem wejść R0–R6 z [poprzedniego raportu](../m02-current-rules/REPORT.md): brak stabilizacji, wcześniejszą/szybszą/późniejszą reformę oraz osłony, roboty i interwencję kredytową. Daty decyzji, finansowanie i presje zewnętrzne są identyczne między wersjami. Zmieniono wyłącznie badane równania. Zachowano obie wcześniejsze interpretacje ekspozycji na bezrobocie.

Porównanie płac: 7 wejść × 3 wersje × 2 warianty społeczne, po 73 miesięczne rozliczenia. Osobno sprawdzono kolejność tych samych dwóch projektów, dwa sposoby naliczania presji na tych samych zdarzeniach oraz sześć sytuacji dymisji. Odtworzenie obecnej wersji zgadza się z **każdym polem wszystkich 1022 zapisanych wcześniej wierszy**.

To nadal testy warunkowe. Zgody na programy, obsada resortów i zdarzenia wojskowe są wejściami, a nie wynikiem symulacji całego parlamentu. Otwarta możliwość protestu nie jest automatycznie wykonanym strajkiem. Próg presji nie jest wynikiem zamachu. Dzięki temu nie mylimy skutków poprawki z dopisanym zwycięstwem lub historycznym wydarzeniem.

## 2. Różne priorytety gabinetów

**Obecnie:** wspólny priorytet kryzysu finansowego może sprawić, że różne gabinety bardzo szybko wybierają tę samą reformę walutową. Ogólne opisy preferencji nie określają skończonej kolejności propozycji.

**Propozycja:** każdy gabinet ma krótką listę 2–3 punktów. Zakończonego punktu nie proponuje ponownie. Zagrożone prawne wypłaty i wymagalne umowy nadal mają pierwszeństwo. Potem rozpatruje kolejny punkt własnego programu. Nowy rzeczywisty kryzys może wywołać korektę programu, ale nie daje dodatkowych inicjatyw ponad jedną miesięcznie.

| Gabinet/profil | Domyślna kolejność propozycji |
|---|---|
| Ponikowski / Nowak | Bieżące finansowanie → uzgodniona korekta dochodów lub wydatków → reforma walutowa |
| Sikorski | Ochrona instytucji, jeśli są faktycznie zagrożone → ugoda pracownicza → naprawa finansów |
| Chjeno-Piast | Przyjęta reforma ziemska → finansowanie i stabilizacja waluty |
| Grabski | Stabilizacja waluty → odpowiedź na późniejszy kryzys kredytowy |
| Skrzyński / szeroki gabinet | Finansowanie przyjętych osłon → uzgodniony program kredytu lub zatrudnienia |
| Centrolewica | Osłony → ziemia → przyjęte reformy legalne |

Lista nie zastępuje większości, uprawnień i budżetu. Nieprzyjęta reforma nie zaczyna działać; przygotowana zachowuje swoją agendę. Brak aktualnego problemu oznacza pominięcie danego punktu, nie tworzenie fikcyjnego kryzysu. PPS może doprowadzić do przyjęcia innego programu.

**Test:** od IV 1923 dostępne są dwa zaakceptowane projekty: parcelacja i szybka stabilizacja. Zmieniono tylko kolejność ich przygotowania/wdrożenia, zachowując oba projekty i ich koszty:

| Pierwszy projekt | Cztery inicjatywy IV–VII | Pierwszy efekt złotego | Bezrobocie V 1926, proponowane płace +3 |
|---|---|---|---:|
| Waluta | Waluta: przygotowanie/wdrożenie; ziemia: przygotowanie/wdrożenie | VIII 1923 | 6,27% |
| Ziemia | Ziemia: przygotowanie/wdrożenie; waluta: przygotowanie/wdrożenie | X 1923 | 6,80% |

To syntetyczne porównanie kolejności, nie twierdzenie o obsadzie gabinetu w IV 1923. Oba pakiety są finansowo wykonalne. Budowy postępują automatycznie, więc premier nie czeka czterech miesięcy na zakończenie parcelacji, zanim podejmie kolejną inicjatywę.

**Ocena:** warto przyjąć. Różnica jest odczuwalna bez dodatkowej mechaniki. Sama kolejność nie przesuwa automatycznie reformy do 1924 — wcześniejsza stabilizacja pozostaje możliwa przy odpowiednio przyjętym programie. Nie należy wymuszać historycznej daty dodatkowym zakazem.

## 3. Stopniowa odbudowa płac

**Obecnie:** przy braku nowych podwyżek spadek inflacji przywraca płace do 104 niezależnie od poniesionej straty.

**Propozycja:** zachować obecną stratę przy przyspieszającej inflacji, ale usunąć automatyczny skok w górę, gdy inflacja hamuje. Gdy inflacja miesięczna wynosi najwyżej 5%, nie rośnie, a kredyt na początku miesiąca wynosi co najmniej 45, płace odzyskują stałą liczbę punktów indeksu, najwyżej do 100. Są to punkty, nie procent składany. Rzeczywiste podwyżki wynegocjowane przez gracza mają zachować odrębny, jednorazowy efekt — limit 100 dotyczy tylko samoczynnej odbudowy. W porównywanych przebiegach nie zawarto takich podwyżek.

Sprawdzono wcześniejszą propozycję **+2 punkty/M** oraz prostą korektę **+3 punkty/M**. Pozostałe równania gospodarki nie zmieniają się.

| Przebieg — stan V 1926 | Obecne płace / bezrobocie | Odbudowa +2 | Odbudowa +3 |
|---|---|---|---|
| Wczesna szybka stabilizacja R1 | 104,00 / 5,54% | 100,00 / 6,41% | 100,00 / 6,27% |
| Późna szybka stabilizacja R3 | 103,99 / 7,32% | 79,14 / 9,84% | 94,14 / 9,45% |
| Późna stabilizacja + roboty R5 | 103,99 / 6,82% | 79,14 / 9,34% | 94,14 / 8,95% |

**Rekomendacja: +3 jako punkt wyjścia do prototypu.** +2 długo utrzymuje głęboką utratę płac w krótkim pierwszym rozdziale. Przy +3 późna reforma nadal oznacza dotkliwszy kryzys i wyższe bezrobocie niż wcześniejsza. Roboty zachowują sens: zmniejszają bezrobocie o 0,5 pp, ale nie leczą automatycznie całej gospodarki.

Koszt tej zmiany trzeba zaakceptować świadomie. Przy późnej reformie niezadowolenie robotników w V 1926 wynosi około 70,68 zamiast 54,59. Po odzyskaniu płacy 100 nie znika samo: dodatnia ekspozycja na bezrobocie i nierozwiązana sprawa żądań nadal mają znaczenie. Wykonana ugoda musi zamykać tę konkretną sprawę zgodnie z istniejącymi regułami; wysoki licznik nie powinien odnawiać w nieskończoność tego samego sporu. Testy nie obejmują decyzji o takiej ugodzie ani późniejszych strajków, więc nie są prognozą całego społecznego bilansu strategii.

## 4. Łatwiejszy początek ograniczonego protestu

**Obecnie:** główna karta wymaga niezadowolenia 60. W R3 nie pojawia się przed wyborami przy samych przyjętych wejściach.

**Pierwsza propozycja — próg 50:** sama nie wystarcza. Przy późnej stabilizacji otwiera ograniczoną akcję dopiero w I 1924, ponieważ w XI 1923 niezadowolenie wynosi jeszcze około 49,5.

**Rekomendowana prosta reguła:** ograniczony protest jest dostępny przy **niezadowoleniu ≥50 albo odrzuconym/nierozwiązanym żądaniu płacowym w istniejącej sprawie**. Próg 60 pozostaje dla eskalacji ogólnej/politycznej. Rozwiązana sprawa nie daje tej dostępności, nawet jeśli niezadowolenie nadal jest wysokie.

| Warunek w tym samym późnym przebiegu R3 | Pierwsza dostępność |
|---|---|
| Obecne 60, obecne płace | Nie występuje |
| Tylko próg 50, obecne lub stopniowo odbudowywane płace | I 1924 |
| Próg 50 lub odrzucone żądanie | XI 1923 |
| Ogólna eskalacja 60 przy proponowanej odbudowie płac | XI 1924, jeśli nadal nie ma ugody |

Żądanie istnieje od X 1923 po trzech miesiącach płac poniżej 80. Nie dodajemy nowego wydarzenia ani drugiego +8. Gracz otrzymuje wcześniejszy wybór rokowań lub ograniczonej akcji; skala, koszt funduszu, posłuch i reakcja państwa pozostają dotychczasowe. Samo otwarcie możliwości nie militaryzuje kolei i nie wywołuje Krakowa.

**Ocena:** przyjąć dostęp po odrzuconym żądaniu; nie obniżać kolejno progu do 49, 48 itd., żeby trafić w kalendarz. Rozstrzygnięty konflikt jest lepszą przesłanką niż dopasowywanie liczby.

## 5. Naliczanie presji zamachowej

**Propozycja mieści się w trzech zmianach:**

1. Wykonana istotna umowa cywilna: **−2 raz**, najwyżej −2 w miesiącu. Ten sam obowiązek nie daje ponownej nagrody za kolejne kontrole wykonania.
2. Ustępstwo wojskowe zachowuje własne jednorazowe −12/−25/−20. Usuwamy dodatkowe −3 co miesiąc. Umowa wojskowa nie dostaje równocześnie cywilnego −2 za ten sam skutek.
3. Faktycznie otwarty, nierozwiązany konflikt wojskowy: **+2/M łącznie**, bez mnożenia przez liczbę spraw. Rozwiązanie sporu kończy ten składnik. Sam upływ czasu albo odmowa zaoferowania Piłsudskiemu stanowiska nie otwiera automatycznie konfliktu.

Pozostają obecne +20 za rzeczywisty powrót Chjeno-Piasta, +8 za zerwanie porozumienia, wpływ autorytetu/braku rządu/napięcia społecznego oraz wojskowe warunki próby. Konkretne sprawy korzystają z istniejących rekordów wydarzeń i umów; nie potrzeba drugiej waluty wojskowej.

**Test wielokrotnego odejmowania:** początek presji 50, jednorazowe wykonanie ustępstwa −12 i odrębnej umowy cywilnej; sześć miesięcy poprawnego wykonania. Obecnie wynik to **8**, po zmianie **36**. To porównanie tych samych ustępstw — zmienia się nagradzanie ich kolejnych kontroli.

**Test na tych samych wejściach gospodarczych i politycznych:** operacyjny gabinet, autorytet 55, cywilna umowa wykonana w I 1925. W wariancie konfliktowym od I 1925 istnieje konkretna otwarta sprawa wojskowa; w IV 1926 dochodzi do zerwania porozumienia, w V do rzeczywistego powrotu Chjeno-Piasta. Alternatywnie spór rozwiązano w VI 1925 ustępstwem −12, więc nie występuje późniejsze zerwanie tego porozumienia.

| Przebieg | Presja V 1926 obecnie | Presja po zmianie |
|---|---:|---:|
| Trwający konflikt, zerwanie +8, powrót Chjeno-Piasta | 24 | 70 |
| Konflikt wcześniej rozwiązany, następnie powrót Chjeno-Piasta | 18 | 26 |
| Spokojny wariant bez konfliktu i bez tego powrotu | 0 | 8 |

Daty konfliktu i zgody są **jawnymi wejściami testu**, nie nowym historycznym skryptem ani ustalonym prawdopodobieństwem wystąpienia. Testuje się także obie wersje presji na obu gospodarkach: obecnej i proponowanej, żeby oddzielić efekty.

**Ocena:** przyjąć jako prosty wariant do prototypu. Presja rośnie za trwający problem, a nie za samą datę. Rzeczywiste porozumienie nadal ją obniża. Wynik 70 spełnia tylko bramkę polityczną; pozostają siły, logistyka i pozostałe warunki. Zapis porównania zatrzymuje się przy osiągnięciu tej bramki zamiast udawać dalszą spokojną kampanię albo ogłaszać zwycięzcę.

## 6. Jasna dymisja: jedna poprawiona oferta

**Obecnie:** premier może odejść po odrzuceniu niezbędnej korekty, gdy brak zaakceptowanej wykonalnej alternatywy. Nie wiadomo, ile propozycji rozpatruje i kiedy kończy szukanie.

**Propozycja:** po odrzuceniu koniecznego pakietu premier ma **jedną poprawioną ofertę**, przedstawianą przy następnym miesięcznym przeglądzie. Jeśli zostanie odrzucona albo nie da się złożyć legalnego, finansowo wykonalnego wariantu — składa dymisję. Przyjęcie wykonalnej poprawki kończy kryzys. Oferta ma wskazany punkt programu i wariant zastępczy; nie przeszukujemy wszystkich teoretycznych koalicji.

„Konieczny” oznacza budżet potrzebny do wykonania istniejących obowiązków albo wskazany wcześniej warunek pozostania tego premiera. Nie oznacza dowolnej nowej inwestycji. To informacja w profilu/umowie, nie nowy miernik. Odmowa PPS nie jest odmową całego parlamentu: sprawdzamy rzeczywiste wymagane zgody.

Sprawdzone przejścia:

| Sytuacja | Wynik proponowanej reguły |
|---|---|
| PPS wychodzi, ale rząd nadal może działać | Brak automatycznej dymisji |
| Odrzucono opcjonalną inwestycję | Rząd przechodzi do dalszego programu |
| Odrzucono konieczny pakiet, przyjęto wykonalną poprawkę | Rząd pozostaje |
| Odrzucono pakiet i jego jedyną poprawkę | Dymisja |
| Po odrzuceniu pakietu brak wykonalnej poprawki | Dymisja bez pustej rundy negocjacji |
| Przegłosowano legalne żądanie ustąpienia | Dymisja zgodnie z procedurą, bez dodatkowej oferty |

Dymisja przekazuje do istniejącego formowania rządu i zasad pełnienia obowiązków. Nie powołuje następcy, nie rozwiązuje Sejmu i nie kasuje reform. Poprawka jest ofertą tej samej sprawy, nie nową kartą do losowania.

**Ocena:** przyjąć. To ogranicza liczbę decyzji i usuwa nieskończone negocjacje. Nadal trzeba wpisać konkretny konieczny pakiet i wariant kompromisowy do profilu danego gabinetu; test przejść nie udaje, że rozstrzygnął głosowania za partnerów.

## 7. Rekomendowany zakres następnej zmiany dokumentacji

Wprowadzić opisany pakiet z odbudową płac **+3**, bramką ograniczonego protestu **50 lub odrzucone żądanie**, presją **+2 za aktywną sprawę wojskową**, jednokrotnymi ulgami oraz **jedną poprawioną ofertą gabinetu**. Priorytety zapisać jako krótkie programy, nie nowy system punktowy.

Do tego potrzebny jest mały łącznik już wykryty w pierwszym raporcie: istniejący kryzys kredytowy powinien móc otwierać **rozmowy o szerokim gabinecie**. Nadal potrzebuje on zgód i realnego powodu powołania. Tego łącznika nie wdrożono ani nie przedstawiono tutaj jako policzonego sukcesu koalicji.

Nie dokładamy kolejnych gospodarczych wskaźników ani nie podnosimy presji do 65 samą datą maja. Proponowane reguły ograniczają najważniejsze problemy, ale **M02 pozostaje otwarte do testu pełnego przebiegu z konkretnymi ofertami, zgodami i zdarzeniami**. Nie trzeba przedtem rozwijać pełnego katalogu nowych scen.

## Pliki i weryfikacja

Uruchomienie: `node analysis/m02-comparison/compare.cjs` z katalogu głównego repozytorium.

- [compare.cjs](compare.cjs) — porównanie i sprawdzenia propozycji;
- [results.json](results.json) — założenia, punkty kontrolne, daty inicjatyw i przebiegi polityczne;
- [monthly.csv](monthly.csv) — miesięczne wyniki wszystkich par gospodarczych;
- [calculate.cjs](../m02-current-rules/calculate.cjs) — istniejący kalkulator udostępniony do ponownego użycia. Opcje porównania nie zmieniają jego domyślnych obliczeń ani plików pierwszego raportu.

Kontrole zakończone pomyślnie: zgodność z pierwotnymi danymi, miesięczny limit odbudowy płac, warunki jej rozpoczęcia, zachowanie progu 60, zamknięcie rozwiązanej sprawy protestowej, jednokrotna nagroda umowy, skończona procedura dymisji i jedna inicjatywa gabinetu na miesiąc. Źródłem pozostaje referencja 0.12; jej skrót SHA-256 zapisano w wynikach. Nie zmieniono rozgrywki ani zatwierdzonych dokumentów projektowych.
