# M10 — autorytet Sejmu i demokracja, referencja 0.22

25 IX 2026. **M10 zamknięte w dokumentacji.** Kalkulator sprawdza reguły z
[15.2](../../docs/POLISH_TECHNICAL_REFERENCE.md#152-autorytet-parlamentu-i-demokracja),
[15.3](../../docs/POLISH_TECHNICAL_REFERENCE.md#153-presja-polityczna-na-próbę)
i [16.1](../../docs/POLISH_TECHNICAL_REFERENCE.md#161-jednostki-i-rozpoznanie)
referencji technicznej. Robi to na trzy sposoby:
- testy jednostkowe dziennika autorytetu i równań demokracji;
- powtórka 144 archiwalnych przebiegów M02 na silniku
  [m02-robustness](../m02-robustness/engine.cjs), do którego nowe reguły
  wstawiamy tylko w pamięci, bez zmiany pliku;
- dokładne przeliczenie 81 układów stron zamachu z
  [kalkulatora M08](../m08-coup-profile/check.cjs), który od 0.22 eksportuje
  swoje funkcje; jego wyniki się nie zmieniły.

Nie jest to symulacja kampanii ani prognoza historyczna.

Uruchomienie: `node analysis/m10-authority-democracy/check.cjs`. Pliki:
[kalkulator](check.cjs) i [wyniki z hashami dokumentów](results.json).

## Zatwierdzone reguły

Decyzje użytkownika:
1. demokracja działa na gotowość wojska i trochę na presję zamachową;
2. demokracja może rosnąć sama, ale mało;
3. wpływ na wojsko jest łagodny.

Użytkownik zatwierdził też konkretne liczby.

- **Autorytet ma jednego właściciela — dziennik instytucjonalny.**
  - Autorytet jest odczytem wzoru 15.2 z wpisów ostatnich 12 miesięcy; nic nie
    zapisuje go bezpośrednio.
  - Odpowiedź na wystąpienie Piłsudskiego tworzy jeden wpis: „Bronić
    parlamentu” +1 albo „Poprzeć krytykę” −2, ważny 12 miesięcy.
- **Demokracja rośnie sama, ale mało.** Punkt odniesienia autorytetu w jej
  równaniu wynosi 53 zamiast 50. Zwykły Sejm dodaje więc 0,06 punktu
  miesięcznie (około 0,7 rocznie) zamiast 0,15. Dwa dotąd puste składniki mają
  konkretne zdarzenia:
  - nowa sprawa przemocy wobec instytucji, w tym zabójstwo prezydenta: −2;
  - uchylenie bezprawnej restrykcji w procedurze prawnej: +1.
- **Trochę presji.** Do miesięcznej presji zamachowej dochodzi
  `0,01 × (60 − demokracja)`, najwyżej ±0,5 punktu. Przy demokracji 70 to −0,1
  punktu miesięcznie, przy 50 +0,1. Otwarty spór wojskowy dodaje dla porównania
  +2.
- **Gotowość wojska.**
  - Każde 10 punktów demokracji powyżej 60 przesuwa 2,5 pp szansy każdego
    zgrupowania na poparcie Piłsudskiego do neutralności; poniżej 60 —
    odwrotnie. Najwyżej ±10 pp; strona legalna się nie zmienia.
  - Przesunięcie działa w bramce zdolności, w rozpoznaniu i w losowaniu stron
    po F5.

## Wynik 1: terminy prób zamachu w przebiegach M02

144 główne przebiegi; bez nowych reguł silnik odtwarza archiwum dokładnie.

| Wariant | Próby | Opóźnienie prób |
|---|---|---|
| Dotychczas | 96 | — |
| Tylko mały wzrost demokracji | 96 | 0 M we wszystkich |
| **Zatwierdzony: wzrost i presja 0,01** | **96** | **1 M w 24, 2 M w 36, 3 M w 36** |
| Dla porównania: presja 0,02 | 96 | 2–6 M |

Żadna próba nie znika ani nie powstaje; przesuwa się tylko jej termin. Tak jest
celowo: to znany skutek decyzji, a dat M02 nie dopasowujemy ponownie. Przykłady
z ziarna 01:

| Sejm i strategia | Dotychczas | Zatwierdzony |
|---|---|---|
| Bazowy, A — bierna | III 1926 | IV 1926 |
| Bazowy, H — decyzje zbliżone do historycznych | IV 1926 | VI 1926 |
| Korzystniejszy, A / H | III / I 1927 | IV / III 1927 |
| Trudniejszy, A | IV 1927 | VI 1927 |
| Trudniejszy, B / C / H | V 1927 | VIII 1927 |

Strategie B i C w Sejmach bazowym i korzystniejszym nadal dochodzą do wyborów
bez próby.

Demokracja w chwili próby wynosi 64,9–75,4 zamiast 70,5–79,0. Przy takiej
demokracji i biernej PPS Piłsudski wygrywa w 41,1–42,9% prób. Kompromis
pozostaje dostępny jak w M08.

## Wynik 2: zamach przy różnych poziomach demokracji

Profil `synthetic_test_v2`, poparcie F9 tam, gdzie się pojawia. Przy demokracji
60 wyniki są dokładnie takie jak w M08.

| Demokracja | 30 | 45 | 60 | 75 | 85 |
|---|---:|---:|---:|---:|---:|
| Zdolność zamachowa (bramka 30) | 42,6 | 41,0 | 38,1 | 35,2 | 33,5 |
| Bierna PPS: Piłsudski | 47,9% | 46,4% | 43,8% | 41,1% | 39,4% |
| Bierna PPS: rząd | 17,6% | 18,6% | 21,7% | 24,9% | 27,1% |
| Bierna PPS: kompromis | 0% | 6,9% | 34,5% | 33,9% | 33,5% |
| Bierna PPS: brak zwycięzcy | 34,5% | 28,2% | 0% | 0% | 0% |
| Poparcie + strajk: Piłsudski | 77,8% | 75,9% | 72,2% | 68,5% | 66,0% |
| Poparcie + Milicja 6 F: Piłsudski | 72,5% | 69,3% | 64,8% | 60,2% | 57,2% |
| Obrona + AS 6 F: rząd | 27,5% | 30,9% | 36,0% | 41,0% | 44,3% |
| Obrona + strajk: rząd | 17,7% | 18,7% | 21,7% | 25,0% | 27,2% |

- Przy demokracji 45–75 bierna PPS daje Piłsudskiemu 41–46% zwycięstw, czyli
  mieści się w przedziale 40–50% z M08.
- Zdolność nie spada poniżej 30 przy żadnym poziomie demokracji: najniżej
  31,4 przy przesunięciu o 10 pp. Gotowość wojska nie zmienia więc terminów
  prób; zmienia je wyłącznie składnik presji.
- Niska demokracja zwiększa odsetek braku zwycięzcy, bo zgodnie z M08 obniża
  zaufanie do ugody.

## Przykład: odpowiedź na wystąpienie Piłsudskiego

PPS popiera krytykę parlamentaryzmu:
- autorytet wynosi 53 zamiast 55 przez 12 miesięcy, potem wraca;
- demokracja spada łącznie o 0,72 punktu (0,06 miesięcznie przez 12 miesięcy);
- szansa powodzenia rokowań strajkowych rośnie o 0,4 pp, bo gabinet jest
  słabszy. Tak było do 0.23; od 0.24 (M12) kruchość czyta poparcie gabinetu i
  spory, więc ten skutek znika.

Dotychczas ta sama zmiana znikała przy najbliższym rozliczeniu miesiąca.

## Sprawdzone niezmienniki

- Wpis dziennika liczy się przez 12 miesięcy i wygasa. Jeden wpis przypada na
  jedno wystąpienie.
- Bezpośredni zapis dawnego typu znika przy następnym przeliczeniu, a wpis
  dziennika zostaje.
- Zwykły Sejm dodaje 0,06 punktu demokracji miesięcznie; dawniej 0,15.
- Bezprawny akt daje −2, a skuteczna obrona prawa +1.
- Składnik presji wynosi −0,1 przy demokracji 70 i +0,1 przy 50; mieści się
  w ±0,5.
- Silnik M02 bez nowych reguł odtwarza archiwum. Z zatwierdzonymi regułami
  zostaje wszystkie 96 prób, każda opóźniona o 1–3 miesiące.
- Lojalności przy każdym poziomie demokracji 0–100 sumują się do 1 i mieszczą
  w 0–1. Przy demokracji 60 są dokładnie takie jak w `synthetic_test_v2`.
- Zdolność wynosi co najmniej 30, a odsetek zwycięstw Piłsudskiego nie rośnie
  wraz z demokracją.

## Granice

- Zgrupowania i lojalności są syntetyczne. Historyczny związek nastrojów
  demokratycznych z postawą oficerów i z presją na zamach w 1926 r.:
  **TBD — historical research required**. To uproszczenie gry, nie teza
  historyczna.
- Wagi dziennika, siła przesunięcia, składnik presji i profile zdarzeń
  bezprawnych są P do kalibracji w prototypie.
- Przebiegi M02 nie zawierają zdarzeń bezprawnych aktów ani obrony prawa.
- Silnik M02 liczył wyniki zamachu na regułach sprzed M08. Stąd bierzemy
  wyłącznie terminy prób i poziom demokracji.
- Kod gry, zależności i metadane scenariusza bez zmian. Przy wdrożeniu sceny
  doradców nie mogą dalej zapisywać odziedziczonego `pro_republic` (20.2).
