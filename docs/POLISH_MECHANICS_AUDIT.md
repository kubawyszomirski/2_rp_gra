# Audyt proponowanych polskich mechanik przed implementacją

**Audyt 11 września; aktualizacja 4 października 2026 — referencja 0.52.** Wszystkie punkty audytu są zamknięte w dokumentacji. W 0.32 powstał [katalog kart do kodowania](POLISH_CARD_CATALOGUE.md). Wszystkie sześć partii użytkownik przejrzał w 0.33–0.38; katalog nie ma otwartych pytań. W 0.39 zatwierdzono kategorie kolejki siedmiu wydarzeń, a badania historyczne odłożono na później. W 0.40 powstał [plan implementacji](POLISH_IMPLEMENTATION_PLAN.md), a w 0.41–0.49 wdrożono wszystkie jego etapy 0–8; etap 8 był ostatni. Etap 7 wdrożył w grze profil F z M08 bez różnic w rozkładach, dziennik autorytetu i demokrację z M10 oraz udział AS w zamachu z M15. Etap 8 zagrał pełne kampanie w silniku gry i spełnił wzorzec M02: bez porozumienia z Piłsudskim próba przypada na III 1926, a z wykonanym porozumieniem nie dochodzi do niej przed wyborami 1928 ([raport](../analysis/stage8-campaigns/REPORT.md)). Badania etapu 8 datowały sprawy wojskowe; profil sił pozostaje syntetyczny. 26 września domknięto M19, M18, M17, M06, M16 i M15. M19 oddziela aktualną wersję do kodowania od archiwum decyzji we wszystkich dokumentach. M18 pozwala członkostwu rosnąć z zapleczem i obniża wpływy z aparatu, żeby nie był obowiązkowym otwarciem (13.1). M17 przenosi Próchnika i Drobnera do kontynuacji i otwiera drogę do współpracy z KPP przez zwykłe działania (9.5, 10.4.3). M06 sprawia, że wybór prezydenta i marszałka zawsze się kończy (7.3–7.5). M16 daje rozłamowi E3 jeden rachunek, jak czystce, i zamraża przypisanie posłów do frakcji (10.2). M15 daje AS lepsze wykonanie wezwania i do trzech akcji naraz przed zamachem (13.3–13.4). 25 września domknięto M13, M12, M11, M10 i M09. M13 wiąże dyscyplinę KPP z relacją i zgodnością celu, a zgodę wewnątrz PPS wyłącznie z zachowaniem PPS (9.5–9.6). M12 wiąże zgodę związku na ugodę z kosztem dalszej walki, a kruchość rządu w rokowaniach strajkowych z jego poparciem i sporami (14.4, 17.4). M11 czyni targowanie z rządem prawdziwą groźbą z ceną, a perswazję bezpieczną opcją zachowującą relacje (9.8). M10 daje jeden dziennik autorytetu i powolny wzrost demokracji. Przed zamachem demokracja działa przez gotowość wojska i niewielki składnik presji (15.2, 15.3, 16.1). M09 dodaje miesięczny przepływ poparcia za warunki życia, ważony odpowiedzialnością za rząd (5.6). Dzień wcześniej, 24 września, domknięto M08: zatwierdzony profil F od bramek próby do raportu (16.8). Wcześniej, 22 września, domknięto M02: scenariusz jest gotowy do implementacji po końcowej korekcie dwóch warunków i sprawdzeniu istniejących przebiegów. Kod gry bez zmian. Balans, pełny dobór kart, historyczne datowanie spraw wojskowych i historyczny profil sił wymagają prototypu oraz późniejszej weryfikacji. Pozostałe niezrealizowane rekomendacje nie są automatycznie zatwierdzone.

Materiał: `docs/POLISH_TECHNICAL_REFERENCE.md`, `docs/POLISH_DESCRIPTIVE_GUIDE.md`, `PLAN.md`, `MECHANICS_MAP.md`, `STATE_VARIABLES.md`, `TRANSITION_MATRIX.md`, `HISTORICAL_SOURCES.md`. Niemiecka referencja posłużyła do porównania gospodarki i tempa działań. `docs/EXECUTIVE_GAME_OVERVIEW.md` opisuje istniejący wycinek kodu, więc jego odmienności od projektu docelowego nie zostały automatycznie uznane za błędy. Starsze zatwierdzenia w rejestrach również nie przeważają nad nowszymi.

Przegląd obejmował powiązania przyczynowe, dostępność działań, koszt czasu, zakończenia procesów i spójność dokumentów. Wykonano izolowane przeliczenia kilku wzorów. **Nie była to symulacja pełnej kampanii, test działającego polskiego następcy ani nowa weryfikacja wszystkich historycznych tez i źródeł.**

## Ocena gotowości

Koncepcja gry, katalog decyzji i scenariusz Normalny wystarczają do przygotowania ograniczonego prototypu. Dokumentacja **nie jest jeszcze zweryfikowaną specyfikacją całego pierwszego rozdziału**. Blokady z tego audytu przed prototypem — impasy instytucjonalne i zależności między systemami — są zamknięte w dokumentacji. Pozostaje weryfikacja w grywalnym prototypie. Katalog kart do kodowania powstał w 0.32, a w 0.33–0.38 użytkownik przejrzał wszystkie jego partie; nie ma otwartych pytań. Kalibrację scenariusza przenosimy do grywalnego prototypu.

To w dużej części skutek kolejnych rewizji: uproszczono widoczne sceny, lecz nie zawsze odpowiadające im starsze reguły. Nie potrzeba kolejnej dużej talii kart. Potrzeba usunięcia sprzeczności i zamknięcia już obiecanych działań.

| Priorytet | Ustalenia | Co zrobić |
|---|---|---|
| Przed implementacją zależnego systemu | — | M06 zamknięte w dokumentacji w 0.28 |
| Przed uznaniem prototypu za grywalny | — | M09–M13 i M15–M16 zamknięte w dokumentacji; przyczynowość sprawdzi prototyp |
| Przed pełną kampanią i dalszym rozwojem | — | M17–M19 zamknięte w dokumentacji; katalog kart przejrzany w całości (0.33–0.38) |

## Zamknięte w dokumentacji — aktualizacja 26 IX 2026

Poniższe pozycje usunięto z listy aktywnych problemów. Numery pozostają stabilne dla wcześniejszych rozmów. Zamknięcie oznacza spójny kontrakt projektowy, nie test ukończonej gry.

| ID | Rozwiązanie w referencji | Co jeszcze sprawdzi implementacja |
|---|---|---|
| **M19 — jedna wersja do kodowania** | 0.31: referencja ma na górze stan i tabelę „gdzie jest aktualna reguła”; rozdziały 1–22 to jedyna wersja do kodowania, a rozdział 23 to archiwum. Przewodnik ma dodatek „historia zmian”, a rejestry sekcję „Current state” nad archiwum wpisów. Poprawiono nieaktualne zdania i jeden odnośnik | Przegląd katalogu kart (szkic 0.32), partia po partii |
| **M18 — członkostwo i aparat** | 0.30: indeks członkostwa 0–150 zbliża się co miesiąc o 5% do celu z poparcia robotników i zasięgu związków (składki obniżają cel); aparat 0,15 zamiast 0,20 R na poziom, zwrot 40 M (13.1) | Szybkość i granice wzrostu, wpływy aparatu przy pełnej kampanii |
| **M17 — późni doradcy** | 0.29: Próchnik i Drobner jako obsada kontynuacji; „Otworzyć kontakt” z KPP od relacji 10, potem zwykłe rozmowy z 8.1: lekka koordynacja po 3 akcjach, pełna współpraca po 5 (9.5, 10.4.3) | Tempo drogi do KPP przy pełnej kampanii |
| **M06 — wybór urzędu bez impasu** | 0.28: finał dwóch kandydatów wygrywa większa liczba głosów, wstrzymania tylko w obecności, remis losowaniem 50/50; kworum i dwie kandydatury zapewnione; bezpiecznik kończy nierozstrzygniętą sekwencję z nowym głosowaniem w następnym miesiącu (7.3–7.5, 4.5) | Szczegółowy regulamin Zgromadzenia i Sejmu z 1922 r. |
| **M16 — rozłam E3** | 0.27: przyjęty rozłam stosuje rachunek czystki z udziałem 40%: siła ×0,6 i normalizacja, członkostwo i poparcie PPS ×(1 − udział), wyborcy do odbiorcy z manifestu, 40% posłów frakcji raz do klubu rozłamowego, sprzeciw reszty −20; posłowie zamrożeni między transferami (10.2) | Udziały i spadki sprzeciwu w prototypie; odbiorcy wyborców w konkretnych sprawach |
| **M15 — przewaga AS** | 0.26: Milicja ma jedną akcję naraz; AS daje posłuch +0,15 (ok. +18–21% siły z tych samych ludzi) i przed zamachem do trzech równoczesnych akcji, każdą do pełnego efektu ochrony; w zamachu jedno zadanie (13.3–13.4, 16.8) | Wartość premii, limit akcji i kolejność przydziału w prototypie; historyczna rola AS |
| **M13 — dyscyplina komunistów** | 0.25: szansa dotrzymania zasad przez KPP = (relacja + zgodność celu) / 200, 10–90%; zgodność z celu partnera w profilu wydarzenia; akceptacja w PPS podnoszona „Kompromisem” w `party.unity`, od 60 bez kary Centrum i nadal bramka frontu (9.5–9.6) | Historyczne cele KPP w strajkach; kalibracja w prototypie |
| **M12 — ugoda strajkowa i kruchość rządu** | 0.24: zgoda związku = 0,5 × spełnienie żądań + 0,3 × zaufanie + 0,2 × koszt kontynuacji (brak pieniędzy albo zmęczenie, większa wartość); kruchość = 50 − (posłowie popierający − 222) + 0,5 × najwyższe napięcie, gabinet pełniący obowiązki 100 (14.4, 17.4) | Wagi i progi przy pełnych kampaniach; oferty częściowe w prototypie |
| **M11 — groźba a perswazja** | 0.23: po odmowie targowania PPS od razu spełnia groźbę albo się cofa (wiarygodność −5, do końca gabinetu groźba bez składnika potrzeby); wymuszone ustępstwo daje −3 relacji z partiami, które je przyjęły; perswazja nie zmienia relacji (9.8) | Wartości −5 i −3 przy pełnych kampaniach |
| **M10 — autorytet i demokracja** | 0.22: autorytet wyłącznie z dziennika instytucjonalnego z 12 M, odpowiedź na wystąpienie Piłsudskiego jako wpis +1/−2; demokracja rośnie sama o 0,06/M, z konkretnymi zdarzeniami bezprawnych aktów i obrony prawa; przed zamachem gotowość wojska (2,5 pp na 10 punktów od 60, najwyżej ±10 pp) i presja `0,01 × (60 − demokracja)` (15.2, 15.3, 16.1) | Wagi dziennika, siła przesunięcia, składnik presji i profile zdarzeń; historyczny związek nastrojów demokratycznych z postawą wojska |
| **M09 — gospodarka a wyborcy** | 0.21: wskaźnik warunków życia pięciu klas z płac realnych i bezrobocia (chłopi: wskaźnik wsi i 1/5 ogólnej gospodarki); miesięczny przepływ od partii odpowiedzialnych za rząd, 0,1 pp za punkt do 0,5 pp, poprawa w połowie siły; odpowiedzialność 1/0,5/0; podział według udziałów także dla odpływu za niewykonanie (5.6) | Siła przepływu i czułość wskaźnika wsi przy pełnych kampaniach; wyłączenie niemieckich reguł poparcia (20.2) |
| **M08 — rozstrzygnięcie zamachu** | 0.20: profil F `coup_f_v1` (16.8) — bramki i przerwa, wykonany udział, trasy, rundy do 4 z szybkim zwycięstwem, trzy oferty, F9 przy istotnym udziale, odrzucenie, `prolonged_conflict` jako koniec rozdziału, ustępstwa przy rozstrzygającym wkładzie; profil syntetyczny v2 | Historyczne zgrupowania, trasy i mediacja; balans i skutki F10+F11 w prototypie; korzyść AS uzgodniona w M15 (0.26) |
| **M01 — wybór gospodarki** | Zatwierdzone siedem wskazań, jeden budżet, krótkie projekty, jedna reakcja kapitału; 11–12 i powiązane dokumenty zaktualizowane | Balans i działanie w pełnym scenariuszu |
| **M03 — zbyt wiele etapów** | Mała reforma 1 akcja, duża 2; agenda gwarantuje następny krok, potem automatyczne wykonanie; konkretne daty robót w 11.8/12.5 | Tempo całej kampanii przy konkurencji z innymi akcjami |
| **M04 — PPS a administracja** | Osobne `ppsCanChoose` i `stateCanExecute`; bieżące D działa bez PPS oraz w zakresie obowiązków gabinetu ustępującego | Zmiana gabinetu i wszystkie legalne wyjątki wykonawcze |
| **M14 — nieużyteczne +25 TUR** | Pełne przygotowanie i −1 M wykonania raz na duży projekt; bez D/konstytucji, z zachowaniem R i czasu kursu | Czy korzyść równoważy czas i koszt w grze |
| **M07 — konkretne wykonanie opcji** | 0.19: profile projektów i ich skutków; jedna wspólna demokratyzacja, ograniczona autonomia; federacja i państwo rad jako program na kontynuację | Dane historyczne, balans i działające przejścia w prototypie |
| **M05 — procedura D** | 0.17: D2 kończy wybór i głosowanie Sejmu; reszta datowana automatycznie, wypłaty po wejściu w życie; autorstwo PPS i jednorazowa zasługa, bez obejść limitu | Terminy, odmowy, zapis między etapami oraz wykonanie i zasługa w prototypie |
| **M02 — scenariusz Normalny** | 0.16: połączony scenariusz, warunkowe następstwo gabinetów, wykonanie programów i presja; +20 za rzeczywisty powrót prawicy po stabilizacji/szerokim gabinecie podczas otwartego sporu, wspólna ocena kompromisu bez drugiej bramki relacji | Pełna ręka kart, balans i datowanie konkretnych spraw wojskowych; pełny wynik kolejnych wyborów sprawdzi prototyp; przepływ gospodarka–wyborcy zamknęło M09 w 0.21, a mechanikę zamachu M08 w 0.20; od 0.22 składnik demokracji w presji (M10) opóźnia każdą z 96 prób o 1–3 M |

M05 zamknięto w dokumentacji w 0.17, M07 w 0.19, M08 w 0.20, M09 w 0.21, M10 w 0.22, M11 w 0.23, M12 w 0.24, M13 w 0.25, M15 w 0.26, M16 w 0.27, M06 w 0.28, M17 w 0.29, M18 w 0.30, a M19 w 0.31.

### M02. Scenariusz Normalny — gotowy do implementacji

**Status: etap dokumentacji zakończony, 0.16.** [Kontrakt końcowy 17.16.11](POLISH_TECHNICAL_REFERENCE.md#171611-końcowa-korekta-i-domknięcie-m02--016) zapisuje dwie zaakceptowane poprawki. Impuls +20 wynika z rzeczywistego powrotu Chjeno-Piasta po gabinecie stabilizacyjnym lub szerokim, przy otwartej sprawie wojskowej; nie wymaga maja. Kompromis osłon wymaga wspólnej oceny ≥60, finansowania i twardych warunków, bez minimów relacji 25/45. +2/M, próg 65 i pozostałe liczby zachowano.

**Weryfikacja:** po ocenach ofert, sukcesji i pokrycia presji przeprowadzono połączone miesięczne przebiegi czterech strategii na trzech Sejmach. Końcowa korekta korzysta raz z tego samego zestawu: 144 główne przebiegi, 216 kontroli decyzji i 36 kontroli początku sporu wojskowego. [Raport końcowy i porównanie](../analysis/m02-robustness/REPORT.md); [wyniki poprzednich reguł 0.15](../analysis/m02-robustness/REPORT_0_15.md). Starsze etapy zachowują własne raporty w `analysis/m02-negotiations/`, `m02-political-chain/` i `m02-pressure-calibration/`.

**Granice zamknięcia:** daty konkretnych sporów wojskowych pozostają robocze — `TBD — historical research required`. Kontrolowany dostęp do zwykłych kart, jawne profile aktorów i syntetyczne siły nie zastępują grywalnego prototypu. Nie potwierdzamy historycznego tempa ani pełnego wyniku wyborów. To dalsze testy balansu i oddzielne M06/M08/M09, nie powód do kolejnej rundy dostrajania M02 w dokumentacji.

### M05. D — czas, wykonanie i zasługa uzgodnione

**Status: zamknięte w dokumentacji, 0.17.** [17.15](POLISH_TECHNICAL_REFERENCE.md#1715-zatwierdzone-uproszczenie-dg) zachowuje D1 i D2. D2 zamyka wybór oraz pierwsze głosowanie Sejmu; Senat, ewentualny powrót do Sejmu i promulgacja biegną według dat bez dodatkowej karty. Określono wejście w życie i pierwsze należne rozliczenie, działające tylko przy rzeczywistym wykonaniu 1/0,5/0.

[5.4](POLISH_TECHNICAL_REFERENCE.md#54-rezultat-polityki-i-odpowiedzialność) zapisuje PPS jako autora, Pracę jako wykonawcę i roboczy udział PPS 0,40, nagradzany raz po pełnym wykonaniu. Finansowanie i program są wspólne z kartą Pracy. [7.2](POLISH_TECHNICAL_REFERENCE.md#72-ustawa-i-urząd) i 12.2 wykluczają ponawianie zakończonego D przez zwykłą zmianę projektu. Wejście do rządu po D2 nie przerywa procedury; rozwiązanie Sejmu i koniec rozdziału mają jawne skutki.

**Do sprawdzenia przy implementacji:** terminy +30/+60, poprawki i odmowy, stan zapisu między etapami, ograniczone wypłaty, brak podwójnej zasługi i limit inicjatywy. Daty realizacji i udział 0,40 są jawnymi uproszczeniami/wartościami P, nie historycznym odtworzeniem tej ustawy. Sprawdzono spójność dokumentacji; nie jest to wdrożona procedura Dendry.

### M07. Zakres i wykonanie opcji — uzgodnione

**Status: zamknięte w dokumentacji, 0.19.** Użytkownik zaakceptował [profile 17.12.1–7](POLISH_TECHNICAL_REFERENCE.md#17121-zamówienia-przemysłowe--jeden-czasowy-kontrakt): zamówienia, policja, konkretne nadużycia, nominacje, reprezentacja pracownicza i ograniczona autonomia mają koszt, czas, warunki, efekt i późniejszy odczyt. Szerokie gwarancje są wejściem do istniejącej demokratyzacji, bez drugiego projektu. Federacja, państwo rad i pełna autonomia polityczna należą do kontynuacji; ich program ma bieżące skutki, lecz nie udaje wykonanej reformy.

Zamówienia odczytuje gospodarka 11.5; policję ochrona 16.3; nominacje siły i presja 15–16; reprezentację przyszłe decyzje przedsiębiorstwa; delegowane kompetencje autonomii — uprawnienia dalszych działań. Ulgi dotyczą wyłącznie wskazanych odbiorców, są jednorazowe i nie powielają skutków przy ponowieniu karty, zmianie wejścia lub ulepszeniu tego samego programu. Reguły doradców i jedynej inicjatywy D pozostają.

**Granice:** jest to zamknięcie mechaniki i zakresu, nie deklaracja działającego kodu. Balans i scenariusze wykonania wymagają prototypu; historyczne stanowiska, kandydaci, sprawy prawne i obszary autonomii wymagają profili treści. Pełny operacyjny model zamachu zamknięto w M08 (0.20, 16.8). Nie trzeba implementować federacji ani państwa rad, aby spełnić kontrakt pierwszego rozdziału.

### M08. Rozstrzygnięcie zamachu — uzgodnione

**Status: zamknięte w dokumentacji, 0.20.** Użytkownik przyjął [profil F `coup_f_v1` z 16.8](POLISH_TECHNICAL_REFERENCE.md#168-profil-f-coup_f_v1--zatwierdzone-rozwiązanie-m08). Każda luka z tego punktu ma teraz regułę:
- **Bramki:** okno, ugoda chroniąca z przeglądem po 6 M, faza `political_crisis` od presji 55 i 3 M przerwy po odwołaniu przygotowań.
- **Wykonanie i zadania:** wykonany udział według posłuchu 10.3, pomiar strajku w rundzie przed przybyciem, jedno zadanie Milicji/AS w F.
- **Rundy:** najwyżej 4; zwycięstwo po dwóch rundach przewagi >1,20 albo od razu przy przewadze ≥2, z posiłkami przeciwnika z następnej rundy.
- **Ugoda:** trzy oferty, zaufanie równe demokracji; strona z przewagą nie negocjuje; ocena końcowa po 4. rundzie.
- **F9:** tylko przy istotnym udziale PPS; odrzucenie zamyka ugodę do końca próby.
- **Brak zwycięzcy:** `prolonged_conflict` jest końcem rozdziału z raportem.
- **Ustępstwa:** wymagają rozstrzygającego wkładu PPS, liczonego kontrfaktycznie.

Na życzenie użytkownika zmieniono lojalności dwóch syntetycznych rezerw (`synthetic_test_v2`), aby przy biernej PPS Piłsudski wygrywał w około 44% prób. Dokładne przeliczenie 81 układów: [raport](../analysis/m08-coup-profile/REPORT.md). Przy demokracji 60–75 brak zwycięzcy występuje tylko po odrzuceniu F9. Przy demokracji 45 i biernej PPS dotyczy 26% prób, nadal rzadziej niż zwycięstwo Piłsudskiego.

**Granice:**
- Zgrupowania, trasy, lojalności, mediacja i kandydat oferty dymisyjnej pozostają `TBD — historical research required`.
- Robocze skutki F10+F11 (frakcje, relacje, demokracja) i wszystkie liczby wymagają kalibracji w prototypie.
- Korzyść AS uzgodniono w M15 (0.26): posłuch +0,15 i jedno zadanie w F.
- Zgoda na ugodę czyta bezpośrednio poziom demokracji. Od 0.22 demokracja rośnie sama tylko powoli i przesuwa gotowość wojska (M10); przy demokracji 60 wyniki M08 się nie zmieniają.
- Nie jest to wdrożona sekwencja Dendry.

### M09. Gospodarka a wyborcy — uzgodnione

**Status: zamknięte w dokumentacji, 0.21.** Użytkownik przyjął [przepływ z 5.6](POLISH_TECHNICAL_REFERENCE.md#56-warunki-życia-i-odpowiedzialność-za-rząd--przepływ-m09). Luka z tego punktu ma teraz regułę:
- **Warunki życia:** jeden pochodny wskaźnik na klasę z płac realnych i bezrobocia (−2 punkty za 1 pp). Robotnicy odczuwają go w pełni, inteligencja w 1/2, drobnomieszczaństwo w 1/4, chłopi w 1/5 obok pełnego wskaźnika wsi z 11.6, a burżuazja wcale.
- **Przepływ:** co miesiąc, tylko przy zmianie warunków. Pogorszenie 0,1 pp za punkt, najwyżej 0,5 pp w klasie; poprawa w połowie siły, najwyżej 0,25 pp.
- **Odpowiedzialność:** gabinet 1, podpisana tolerancja 0,5, opozycja 0; premier bezpartyjny nie ma własnych wyborców.
- **Odbiorcy:** pozostałe partie według obecnych udziałów w komórce. Ten sam podział dotyczy odpływu za niewykonane zobowiązania, który pozostaje osobnym skutkiem.
- **Bez podwójnego liczenia:** inflacja działa tylko przez płace, produkcja przez bezrobocie, świadczenia są poza wskaźnikiem, a utrata pracy nie zmienia preferencji.

Decyzje użytkownika: łagodna siła, poprawa w połowie siły, bez dodatkowego członu inflacji dla klas średnich, chłopi reagują słabiej niż inne klasy. Przeliczenie na przebiegach M02: [raport](../analysis/m09-living-conditions/REPORT.md). Sam przepływ zmienia poparcie PPS o −0,1 do +0,6 pp w rozdziale. Hiperinflacja 1923 odbiera partiom rządu 2,2 pp wśród robotników.

**Granice:**
- Wszystkie liczby są P; siłę przepływu i czułość wskaźnika wsi sprawdzi prototyp przy pełnych kampaniach.
- Udział 1/5 dla chłopów to interpretacja decyzji użytkownika. W 2 z 12 przebiegów chłopi przesuwają nieco więcej niż drobnomieszczaństwo, bo działa u nich też wskaźnik wsi.
- Przy wdrożeniu trzeba wyłączyć odziedziczone niemieckie reguły poparcia (20.2).
- Nie jest to wdrożona reguła Dendry ani prognoza wyborów.

### M10. Autorytet Sejmu i demokracja — uzgodnione

**Status: zamknięte w dokumentacji, 0.22.** Użytkownik odpowiedział na propozycję trzema decyzjami, zatwierdził ich konkretne liczby i zlecił zapis. Kontrakt: [15.2](POLISH_TECHNICAL_REFERENCE.md#152-autorytet-parlamentu-i-demokracja), [15.3](POLISH_TECHNICAL_REFERENCE.md#153-presja-polityczna-na-próbę) i [16.1](POLISH_TECHNICAL_REFERENCE.md#161-jednostki-i-rozpoznanie). Obie luki z tego punktu mają regułę:
- **Autorytet:** jedynym właścicielem jest dziennik instytucjonalny z 12 miesięcy. Odpowiedź na wystąpienie Piłsudskiego to wpis +1 albo −2, a nie bezpośrednia zmiana kasowana przez przeliczenie. Bezpośredni zapis jest błędem walidacji.
- **Demokracja rośnie sama, ale mało:** punkt odniesienia 53 zamiast 50, więc zwykły Sejm dodaje 0,06 punktu miesięcznie zamiast 0,15. Nowa sprawa przemocy wobec instytucji daje −2, a uchylenie bezprawnej restrykcji w procedurze prawnej +1.
- **Skutki przed zamachem — decyzja użytkownika:**
  - gotowość wojska: każde 10 punktów demokracji od poziomu 60 przesuwa 2,5 pp lojalności wobec Piłsudskiego do neutralności albo z niej, najwyżej ±10 pp;
  - trochę presji: co miesiąc `0,01 × (60 − demokracja)`, najwyżej ±0,5 punktu.
- **Czego demokracja nie czyta:** ofert, wyborów i przepływu 5.6. Nie powstaje nowy miernik dla każdej grupy.

Przeliczenie: [raport](../analysis/m10-authority-democracy/REPORT.md).
- W 144 przebiegach M02 zostaje wszystkie 96 prób, każda 1–3 miesiące później. Przykład: Sejm bazowy, decyzje zbliżone do historycznych — VI zamiast IV 1926. Użytkownik przyjął ten skutek; dat M02 nie dopasowujemy ponownie.
- Demokracja w chwili próby wynosi 65–75 zamiast 70–79. Przy biernej PPS Piłsudski wygrywa wtedy w 41–43% prób, a przy demokracji 60 w 44%, jak w M08.
- Zdolność zamachowa nie spada poniżej 30 przy żadnym poziomie demokracji.

**Granice:**
- Wszystkie liczby są P. Historyczny związek nastrojów demokratycznych z postawą oficerów i z presją na zamach pozostaje `TBD — historical research required`.
- Zdarzenia bezprawnych aktów zawężono do przemocy wobec instytucji. Potwierdzona represja nie obniża demokracji, żeby skarga, która ją ujawnia, nie była karana.
- Przy wdrożeniu sceny doradców nie mogą dalej zapisywać odziedziczonego `pro_republic` (20.2).
- Nie jest to wdrożona reguła Dendry.

### M11. Groźba i perswazja — uzgodnione

**Status: zamknięte w dokumentacji, 0.23.** Użytkownik zatwierdził propozycję dwiema decyzjami i zlecił zapis. Kontrakt: [9.8](POLISH_TECHNICAL_REFERENCE.md#98-stosunek-do-rządu--jedno-proste-menu), z odwołaniem w 8.3. Luka z tego punktu ma teraz regułę:
- **Groźba musi być prawdziwa:** po odmowie targowania PPS od razu, za 0 T, spełnia groźbę albo się cofa. Cofnięcie kosztuje wiarygodność −5, a do końca gabinetu kolejne targowanie liczy się bez składnika potrzeby.
- **Wymuszone ustępstwo kosztuje:** każda partia, która przyjęła ofertę pod groźbą, obniża relację z PPS o 3.
- **Perswazja jest bezpieczna:** nie zmienia relacji ani wiarygodności, ale nie ma premii za potrzebę.

Przeliczenie: [raport](../analysis/m11-threat-persuasion/REPORT.md).
- Przykład z audytu: targowanie 65 (sukces, relacja −3), perswazja 55 (odmowa bez kosztu).
- W przeglądzie osłon za Skrzyńskiego targowanie oszczędza dwa kontakty z ZLN, ale obniża relacje z czterema partiami o 3.
- W 144 przebiegach M02 wyniki, kolejność gabinetów i terminy prób zostają te same, także razem z M10. W 12 przebiegach z odrzuconym przeglądem PPS odchodzi o miesiąc wcześniej.

**Granice:**
- Wartości −5 i −3 są P do kalibracji w prototypie.
- Przebiegi M02 nie zawierają cofnięcia groźby.
- Nie jest to wdrożona reguła Dendry.

### M12. Ugoda strajkowa i kruchość rządu — uzgodnione

**Status: zamknięte w dokumentacji, 0.24.** Użytkownik zatwierdził propozycję dwiema decyzjami i zlecił zapis. Kontrakt: [14.4](POLISH_TECHNICAL_REFERENCE.md#144-oferta-i-rozstrzygnięcie), 14.5 i [17.4](POLISH_TECHNICAL_REFERENCE.md#174-uzupełniające-reguły-zamykające-zależności). Oba problemy z tego punktu mają regułę:
- **Zgoda związku:** 0,5 × spełnienie żądań + 0,3 × zaufanie + 0,2 × koszt kontynuacji ≥ 50, z zachowaniem czerwonych linii. Koszt kontynuacji to większa z wartości: brak pieniędzy albo zmęczenie. Pełny fundusz nie skłania już do ugody, ale nadal wzmacnia nacisk z 14.2.
- **Kruchość rządu:** 50 − (posłowie popierający gabinet − 222) + 0,5 × najwyższe napięcie w jego umowach, w granicach 0–100; gabinet pełniący obowiązki ma 100. Autorytet Sejmu przestaje wpływać na strajki.

Przeliczenie: [raport](../analysis/m12-strike-settlement/REPORT.md).
- Przykład z audytu po zmianie: połowa żądań i zaufanie 50 dają 40 przy pełnym funduszu (odmowa) i 60 przy pustym (zgoda).
- W 144 przebiegach M02 zgoda związku niczego nie zmienia, bo archiwalne oferty spełniają żądania w całości.
- Kruchość zmienia szansę ugody strajkowej o −8,2 do +3,4 pp. W 10 przebiegach ugoda przypada w innym miesiącu, a jeden termin próby przychodzi miesiąc wcześniej. Kolejność gabinetów się nie zmienia.

**Granice:**
- Wagi i progi są P do kalibracji w prototypie.
- Poparcie gabinetów z profilu otwarcia (Ponikowski, Nowak, Sikorski) liczono w diagnostyce z syntetycznej tolerancji M09.
- Oferty częściowe nie występują w przebiegach M02.
- Nie jest to wdrożona reguła Dendry.

### M13. Dyscyplina komunistów we wspólnym strajku — uzgodnione

**Status: zamknięte w dokumentacji, 0.25.** Użytkownik zatwierdził propozycję dwiema decyzjami i zlecił zapis. Kontrakt: [9.5](POLISH_TECHNICAL_REFERENCE.md#95-komuniści-powtarzane-przygotowanie-zamiast-licznika-koalicji) i [9.6](POLISH_TECHNICAL_REFERENCE.md#96-karta-wydarzenia-współpraca-z-komunistami-podczas-strajku), z odwołaniem w 10.5. Luka z tego punktu ma teraz regułę:
- **Dyscyplina KPP:** (relacja z KPP + zgodność celu) / 200, w granicach 10–90%, jeden zapisany rzut. Zgodność czyta cel partnera z profilu wydarzenia: wspólne żądania na poziomie celu lub wyżej 100, o poziom niżej 50, o dwa 0.
- **Akceptacja w PPS działa tylko na PPS:** podnosi ją opcja „Kompromis” w karcie „Jedność i kierownictwo” (+15 w każdej frakcji). Od 60 znosi karę sprzeciwu Centrum i nadal jest bramką trwałego frontu.
- **Posłuch własnych struktur** liczy się jak dotąd z ich nastawienia do linii (10.3).

Przeliczenie: [raport](../analysis/m13-communist-discipline/REPORT.md). Przy relacji 30 i celu szerokim KPP dotrzymuje zasad z szansą 65% przy żądaniach szerokich i 40% przy ograniczonych. Przekonanie Centrum PPS tej szansy nie zmienia. Przebiegi M02 nie zawierają współpracy z komunistami.

**Granice:**
- Wartości są P do kalibracji w prototypie.
- Historyczne cele KPP w konkretnych strajkach pozostają `TBD — historical research required`.
- Nie modelujemy frakcji KPP.
- Nie jest to wdrożona reguła Dendry.

### M15. Przewaga AS — uzgodnione

**Status: zamknięte w dokumentacji, 0.26.** Użytkownik zatwierdził propozycję dwiema decyzjami i zlecił zapis. Kontrakt: [13.3](POLISH_TECHNICAL_REFERENCE.md#133-rekrutacja-militaryzacja-i-przejście-do-as) i [13.4](POLISH_TECHNICAL_REFERENCE.md#134-użycie-i-straty), z odwołaniami w 16.8.2–16.8.3 i 17.6. Luka z tego punktu ma teraz regułę:
- **Limit Milicji:** jedna akcja naraz — przed zamachem jedna chroniona sprawa, w zamachu jedno zadanie.
- **Koordynacja AS:** posłuch członków +0,15, najwyżej do 1. Z tymi samymi ludźmi AS ma ok. 18–21% więcej siły, bez nowych ludzi i bez sprawności.
- **Trzy akcje AS przed zamachem:** silnik daje każdej sprawie siłę do pełnego efektu ochrony (4 F), a resztę następnej. W zamachu AS ma, jak Milicja, jedno zadanie.

Przeliczenie: [raport](../analysis/m15-as-benefit/REPORT.md).
- Przy obronie rządu AS z tymi samymi ludźmi co Milicja 4 F daje 4,7 F. Udział istotny (F9) pojawia się wtedy w 30,4% prób zamiast 6,2%, a Piłsudski wygrywa w 39,7% zamiast 43,7%.
- Przy poparciu Piłsudskiego wynik praktycznie się nie zmienia.
- Przebiegi M02 nie modelują siły Milicji.

**Granice:**
- Wartości są P do kalibracji w prototypie.
- Historyczna rola i siła AS pozostają `TBD — historical research required`.
- Nie jest to wdrożona reguła Dendry.

### M16. Rozłam E3 — uzgodnione

**Status: zamknięte w dokumentacji, 0.27.** Użytkownik zatwierdził propozycję trzema decyzjami i zlecił zapis. Kontrakt: [10.2](POLISH_TECHNICAL_REFERENCE.md#102-od-sprzeciwu-do-rozłamu--e3), z odwołaniami w 10.9 i 16.8.7. Luka z tego punktu ma teraz regułę:
- **Jeden rachunek:** rozłam stosuje rachunek czystki z udziałem 40%. Siła frakcji spada ×0,6 i następuje normalizacja; członkostwo i poparcie PPS w każdej komórce spadają o udział odchodzących. Wyborcy przechodzą do odbiorcy z manifestu, a 40% posłów frakcji, zaokrąglone raz, do klubu rozłamowego.
- **Reszta frakcji:** sprzeciw spada o 20 (przy czystce o 15).
- **Zamrożeni posłowie:** po wyborach klub PPS dzielimy między frakcje według ich siły. Przydział zmienia się tylko przy rzeczywistym transferze, a zmiany siły frakcji go nie przepisują.

Przeliczenie: [raport](../analysis/m16-split-recalculation/REPORT.md).
- Rozłam Lewicy (siła 15, sprzeciw 65, 5 posłów) zabiera 6% zaplecza i 2 posłów. Poparcie PPS spada z 14,7% do 13,8%, a sprzeciw pozostałej Lewicy wynosi 45.
- Bez zamrożenia wzmocniona Lewica straciłaby w tym samym rozłamie 3 posłów zamiast 2.
- Przebiegi M02 nie osiągają rozłamu.

**Granice:**
- Wartości są P do kalibracji w prototypie.
- Historyczne rozłamy PPS i ich elektoraty pozostają `TBD — historical research required`.
- Nie jest to wdrożona reguła Dendry.

### M06. Wybór urzędu bez impasu — uzgodnione

**Status: zamknięte w dokumentacji, 0.28.** Remis dwóch finalistów rozstrzyga losowanie 50/50 zatwierdzone w 0.18. Pozostałe wyjątki użytkownik zamknął dwiema decyzjami i zlecił zapis. Kontrakt: [7.3](POLISH_TECHNICAL_REFERENCE.md#73-wybory-prezydenckie-i-sukcesja) i [7.5](POLISH_TECHNICAL_REFERENCE.md#75-marszałek-śmiarowski-rataj-albo-daszyński), z odwołaniami w 4.5 i 7.1.
- **Finał:** wygrywa ten, kto dostał więcej głosów. Wstrzymania i głosy nieważne liczą się do obecności, nie do większości.
- **Kworum i kandydatury:** na obowiązkowe wybory urzędów przychodzą wszystkie kluby; profil musi mieć co najmniej dwie ważne kandydatury, a ich brak jest błędem danych przed głosowaniem.
- **Bezpiecznik:** nierozstrzygnięty mimo to wybór kończy sekwencję ze statusem `no_election`. Urząd pełni osoba wskazana w profilu, gracz odzyskuje zwykłą turę, a nowe głosowanie następuje samo w następnym miesiącu.

Przeliczenie: [raport](../analysis/m06-office-elections/REPORT.md). Finał A 200, B 180 i 60 wstrzymań kończy się wyborem A zamiast impasu; każdy z 175 finałów w siatce testowej, łącznie z remisami, kończy się wyborem. Przebiegi M02 nie zawierają algorytmu wyborów urzędów.

**Granice:**
- Reguła finału i bezpiecznik są uproszczeniami gry.
- Szczegółowy regulamin i procedura zastępstwa pozostają `TBD — historical research required`.
- Nie jest to wdrożona reguła Dendry.

### M17. Późni doradcy — uzgodnione

**Status: zamknięte w dokumentacji, 0.29.** Użytkownik zatwierdził propozycję dwiema decyzjami i zlecił zapis. Kontrakt: [9.5](POLISH_TECHNICAL_REFERENCE.md#95-komuniści-powtarzane-przygotowanie-zamiast-licznika-koalicji) i [10.4.3](POLISH_TECHNICAL_REFERENCE.md#1043-zatwierdzony-katalog-i-robocze-efekty), z odwołaniem w 8.1.
- **Obsada kontynuacji:** Próchnik i Drobner nie pojawiają się w rozdziale 1. Ich akcje i daty zostają zapisane dla rozdziału 2, bez przesuwania.
- **Droga do KPP przez zwykłe działania:** „Otworzyć kontakt” jest dostępne od relacji 10, czyli od startu, a po otwarciu kanału zwykłe rozmowy z 8.1 obejmują KPP.

Przeliczenie: [raport](../analysis/m17-late-advisors/REPORT.md). Przy dawnym progu 20 kanał nigdy się nie otwierał bez Drobnera. Teraz lekka koordynacja jest możliwa w 4. miesiącu (3 akcje), pełna współpraca w 10. (5 akcji), a zasady szerszego układu po ok. 25 miesiącach. Przebiegi M02 nie korzystają z tych doradców ani ze współpracy z komunistami.

**Granice:** progi i przyrosty są P do kalibracji; daty i profile obu doradców pozostają przyjętymi profilami gry.

### M18. Członkostwo i aparat — uzgodnione

**Status: zamknięte w dokumentacji, 0.30.** Użytkownik zatwierdził propozycję dwiema decyzjami i zlecił zapis. Kontrakt: [13.1](POLISH_TECHNICAL_REFERENCE.md#131-finanse-partyjne-i-utrzymanie), z odwołaniami w 17 i 21.1.
- **Członkostwo jest rzeczywistą skalą partii:** indeks 0–150 zbliża się co miesiąc o 5% różnicy do celu. Cel to 100 × średnia z proporcji poparcia PPS wśród robotników i średniego zasięgu związków względem otwarcia; wyższe składki go obniżają. Działa przez istniejące działania, bez karty rekrutacji.
- **Aparat:** wpływy 0,15 zamiast 0,20 R na poziom, czyli netto +0,05 R/M i zwrot po ok. 40 M zamiast 20.

Przeliczenie: [raport](../analysis/m18-membership-apparatus/REPORT.md).
- Po 52 miesiącach trzy poziomy aparatu dają +1,65 R zamiast +9,30 R.
- Trzy rozbudowy branży związkowej dają +3,26 R zamiast −3,00 R, przy członkostwie ok. 135.
- W 144 przebiegach M02 wyniki i gabinety się nie zmieniają, a kasa nigdy nie spada poniżej zera.

**Granice:**
- Wartości są P do kalibracji w prototypie.
- Wzrost kasy aktywnych strategii w M02 (do +12 R) trzeba sprawdzić w pełnej kampanii.
- Historyczne dane o członkostwie PPS pozostają `TBD — historical research required`.

### M19. Jedna wersja do kodowania — uzgodnione

**Status: zamknięte w dokumentacji, 0.31.** Użytkownik zatwierdził propozycję dwiema decyzjami i zlecił zapis.
- **Historia w tych samych plikach, w oddzielonym archiwum:**
  - referencja techniczna ma na górze stan wersji i tabelę „gdzie jest aktualna reguła”. Rozdziały 1–22 są jedyną wersją do kodowania. Akapity rewizji 0.13–0.30, dawny opis wersji i zapisy 22.5–22.24 trafiły bez zmian do rozdziału 23 „Archiwum decyzji”;
  - przewodnik ma na górze jeden akapit o stanie, a 30 notek o poprawkach trafiło do dodatku „historia zmian”;
  - PLAN, MECHANICS_MAP, STATE_VARIABLES i TRANSITION_MATRIX mają na górze sekcję „Current state”, a wszystkie dotychczasowe wpisy leżą pod nagłówkiem archiwum;
  - HISTORICAL_SOURCES pozostaje dziennikiem źródeł.
- **Nieaktualne miejsca poprawione:**
  - czystka w 10.9 odwołuje się do rozłamu z karty E3, nie do „rozłamu po ultimatum”;
  - status M02 w 17.16 podaje zamknięcie M06;
  - jeden odnośnik w archiwum MECHANICS_MAP (wpis 0.5) wskazuje obecny nagłówek 17.10, a treść wpisu się nie zmieniła.
- **Katalog kart do kodowania** jest następnym krokiem: jedna tabela na kartę, rodzina po rodzinie, z przeglądem użytkownika. Szkic całego katalogu powstał w 0.32: [POLISH_CARD_CATALOGUE.md](POLISH_CARD_CATALOGUE.md).

Sprawdzenie: [raport](../analysis/m19-document-structure/REPORT.md). Żaden akapit nie zginął, tylko zmienił miejsce. Wszystkie odnośniki do sekcji referencji trafiają w istniejące nagłówki.

## Reguły wymagające zamknięcia

Brak otwartych pozycji w tej grupie; M06 zamknięto w dokumentacji w 0.28 (zob. wyżej).

## Niespójności przyczynowe i słabe wybory

Wszystkie pozycje tej grupy (M09–M13, M15–M16) zamknięto w dokumentacji; zob. wyżej.

## Użyteczność długoterminowa i porządek dokumentacji

Wszystkie pozycje tej grupy (M17–M19) zamknięto w dokumentacji; zob. wyżej.

## Co już jest dobre i nie wymaga kolejnej przebudowy

- Rozdzielenie głosów, mandatów, relacji, zasobów partyjnych i budżetu państwa.
- Jedna miesięczna akcja, wspólny timer doradców i trzy miejsca na karty; potrzebna jest kalibracja liczby etapów, nie nowy system czasu.
- Osobne wejście do gabinetu, tolerowanie i opozycja.
- Presja na zamach oddzielona od zdolności oraz wynik liczony po decyzjach PPS.
- PPS nie dowodzi automatycznie każdym związkiem, Milicją i państwową policją.
- Jedna ustawa D w dwóch kartach oraz E3 jako odejście części frakcji, zwykle bez doradcy.
- Nakładające się tożsamości reprezentowane bez podwójnego liczenia ludności.
- Zapis rzeczywistych skutków i końcowy raport zamiast wymuszonego dobrego/złego zakończenia.

## Proponowana kolejność dalszych decyzji

1. Zweryfikować roboczy balans zatwierdzonej prostej gospodarki na scenariuszach; wybór struktury i liczby etapów M01/M03 jest zamknięty.
2. W prototypie sprawdzić pełną rękę kart i balans zatwierdzonego scenariusza Normalnego, także rządy bez PPS i okres po uniknięciu zamachu. M02 jest gotowe do implementacji.
3. Wyjścia z impasów wyboru urzędu są uzgodnione (M06, 7.3–7.5). Kalendarz i zasługa D (M05) są uzgodnione; M04 jest już rozdzielone w 8.5.
4. Profil zamachu M08 (16.8) i przewaga AS (M15, 13.3–13.4) są uzgodnione. Zakres wykonalnych reform M07 jest uzgodniony.
5. Zależności między systemami są uzgodnione w dokumentacji: gospodarka–wyborcy (M09, 5.6), autorytet–demokracja (M10, 15.2–16.1), groźba–perswazja (M11, 9.8), ugoda związkowa i kruchość rządu (M12, 14.4 i 17.4), dyscyplina KPP (M13, 9.5–9.6) oraz rozłam E3 (M16, 10.2); kurs TUR ma poprawiony kontrakt M14. Ich działanie sprawdzi prototyp.
6. Sprawdzić trzy otwarcia oraz kampanię gabinetową na kalendarzu, dopiero potem ustalić ostateczne wartości robocze. Daty późnych doradców (M17) i model członkostwa (M18) są uzgodnione; nie wynikają z przypadkowego efektu starego kodu.
7. Aktualne reguły są w jednej spójnej wersji dokumentacji (M19, 0.31), a katalog kart do kodowania powstał w 0.32 i został przejrzany w całości w 0.33–0.38. Etap 3 (relacje, umowy, gabinety i resorty z kartą porozumienia wyborczego 7.7) jest wdrożony w 0.44, etap 4 (budżet, gospodarka, projekty, ustawy i karty państwa) w 0.45, etap 5 (partia: stanowiska, organizacje, frakcje, doradcy i kampanie) w 0.46, a etap 6 (związki, strajki, ugody, zakłady i osłony Grabskiego) w 0.47. Następny krok: etap 7 [planu implementacji](POLISH_IMPLEMENTATION_PLAN.md), czyli demokracja, siły bezpieczeństwa, zamach i raport. Prototyp wdrażać jednym ograniczonym systemem naraz.

Nie trzeba przed pierwszym prototypem znać idealnego współczynnika inflacji, dokładnego historycznego zasięgu każdej organizacji ani wszystkich gałęzi do 1939. Trzeba natomiast wiedzieć, **co gracz faktycznie wybiera, co wykonuje państwo, kiedy działa skutek i jak proces kończy się także po niepowodzeniu**.
