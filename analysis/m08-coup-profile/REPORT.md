# M08 — profil zamachu `coup_f_v1`, referencja 0.20

24 IX 2026. **M08 zamknięte w dokumentacji.** Ten katalog sprawdza zatwierdzony
model z [16.8 referencji technicznej](../../docs/POLISH_TECHNICAL_REFERENCE.md#168-profil-f-coup_f_v1--zatwierdzone-rozwiązanie-m08).
Robi to na syntetycznych zgrupowaniach. Nie jest to symulacja kampanii ani
prognoza historyczna.

Uruchomienie: `node analysis/m08-coup-profile/check.cjs`. Pliki:
[kalkulator](check.cjs) i [wyniki z hashami dokumentów](results.json).

## Co liczymy

Każde z czterech syntetycznych zgrupowań staje po stronie rządu, Piłsudskiego
albo pozostaje neutralne. Daje to 81 układów, każdy z własnym
prawdopodobieństwem. Kalkulator liczy **dokładnie** wszystkie układy, więc
wynik nie zależy od losowania próbek.

Sprawdzane strategie PPS:
- bez udziału;
- neutralność z ochroną;
- poparcie Piłsudskiego ze strajkiem silnym albo słabszym;
- poparcie Piłsudskiego z Milicją 6 F;
- obrona rządu z Milicją 1 F, z AS 6 F albo ze strajkiem.

Każdą strategię liczymy przy demokracji 30/45/60/75 oraz przy poparciu i
odrzuceniu F9.

Zasady modelu (skrót 16.8):
- najwyżej 4 rundy;
- zwycięstwo po dwóch kolejnych rundach przewagi >1,20 albo od razu przy
  przewadze ≥2, z doliczeniem posiłków przeciwnika z następnej rundy;
- strajk mierzony w rundzie przed przybyciem;
- ugoda od rundy 2; strona z przewagą nie negocjuje;
- ocena końcowa po 4. rundzie;
- trzy oferty, zaufanie równe demokracji;
- F9 tylko przy istotnym udziale PPS; odrzucenie zamyka ugodę;
- wkład PPS liczony powtórką bez jej organizacji.

## Wynik: profil `synthetic_test_v2`, demokracja 60–75

| PPS | Piłsudski | Rząd | Kompromis | Brak zwycięzcy | F9 | Zwycięstwa po 1–2 rundach | Wkład rozstrzygający |
|---|---:|---:|---:|---:|---:|---:|---:|
| Bez udziału | 43,8% | 21,7% | 34,5% | 0% | — | 47,1% z 65,5% | — |
| Poparcie + strajk | 72,2% | 9,4% | 18,4% | 0% | 12,2% | 75,5% z 81,6% | 28,4% |
| Poparcie + Milicja 6 F | 64,8% | 21,0% | 14,2% | 0% | 14,2% | 66,8% z 85,8% | 21,0% |
| Obrona + AS 6 F | 39,7% | 36,0% | 24,3% | 0% | 24,3% | 18,8% z 75,7% | 14,3% |
| Obrona + Milicja 1 F | 43,8% | 21,7% | 34,5% | 0% | 0% | 47,1% z 65,5% | 0% |
| Obrona + strajk | 37,7% | 21,7% | 40,6% | 0% | 6,1% | 47,1% z 59,4% | 0,1% |

„Wkład rozstrzygający” to odsetek wszystkich prób, w których strona popierana
przez PPS wygrała, a bez PPS by nie wygrała. Tylko wtedy, przy wcześniej
zapisanych warunkach PPS, powstaje zwycięstwo z ustępstwami.

- **Odrzucenie F9:**
  - poparcie + strajk: brak zwycięzcy 12,2%, kompromis bez F9 6,2%;
  - obrona + AS: brak zwycięzcy 24,3%.
  
  Odsetki zwycięstw nie zmieniają się, bo F9 pojawia się tylko w pacie.
- **Niska demokracja:**
  - przy 45 i biernej PPS: 43,8 / 21,7 / 8,1 / 26,4%;
  - przy 30: 43,8 / 21,7 / 0 / 34,5%.
  
  Brak zwycięzcy zostaje rzadszy niż zwycięstwo Piłsudskiego.
- **Mała Milicja (1 F)** nie jest istotna: nie otwiera F9 i nie blokuje ugody
  innych stron.

## Porównanie z profilem v1

Przy biernej PPS i demokracji 60 profil v1 (lojalności sprzed 0.20) daje
29,4 / 29,5 / 41,2 / 0%. Profil v2 daje 43,8 / 21,7 / 34,5 / 0%, co spełnia
wskazanie użytkownika: 40–50% zwycięstw Piłsudskiego.

Przy poparciu i strajku v1 daje 66,3% zwycięstw Piłsudskiego, a v2 72,2%.
Oczekiwana zdolność wynosi 36,2 w v1 i 38,1 w v2, więc bramka 30 i terminy
prób z analiz M02 się nie zmieniają.

## Przykład runda po rundzie

Oba garnizony stolicy są lojalne wobec swoich stron, bliska rezerwa staje po
stronie Piłsudskiego, odległa — rządu. Demokracja 75.

| Runda | Bez strajku: Piłsudski / rząd | Seria przewagi | Ze strajkiem |
|---|---|---|---|
| 1 | 39,7 / 28,8 (1,38) | Piłsudski 1 | jak obok |
| 2 | 50,7 / 27,5 (1,84), ale rezerwa rządu dojedzie w rundzie 3 i jest doliczana | zerowana | rezerwa stoi na torach: seria 2 → **Piłsudski wygrywa po 2. rundzie** |
| 3 | 49,2 / 43,2 (1,14) | brak | — |
| przed 4 | ugoda na inspektoracie: obie strony ≥60 | — | — |

- **Przy demokracji 30:** ten sam pat (1,15 po 4. rundzie) kończy się jako
  `prolonged_conflict`.
- **Gdy garnizon rządowy zostaje neutralny:** przewaga jest przygniatająca i
  Piłsudski wygrywa już po 1. rundzie.

## Sprawdzone niezmienniki

- Akceptowalność ofert: 50/90, 56,25/80 i 90,625/25. Prawdopodobieństwa
  sumują się do 1, a wyniki są deterministyczne.
- Nadchodząca rezerwa blokuje przedwczesne zwycięstwo po 2. rundzie.
  Opóźnienie o 1 albo 2 fazy pozwala rozstrzygnąć po 2. rundzie.
- Wyczerpany fundusz przed rundą pomiaru zwalnia pociąg.
- Przewaga ≥2 kończy walkę po 1. rundzie. Zero sił po obu stronach nie daje
  zwycięstwa.
- W rundzie 1 nie ma ugody. Neutralna PPS i PPS bez udziału nigdy nie dostają
  F9.
- Odrzucone F9 zamyka ugodę także w ocenie końcowej. Nieistotny udział nie
  blokuje ugody.
- Kontrfaktyczny wkład strajku w przykładzie ma klasę `decisive`.

## Granice

- Zgrupowania, lojalności, trasy i siły są syntetyczne (`synthetic_test_v2`).
  Historyczne jednostki, przebieg mediacji i kandydat oferty dymisyjnej:
  **TBD — historical research required**.
- Milicję i strajk podajemy jako gotowe wartości wejściowe: siłę F, udział i
  koordynację. Kalkulator nie liczy posłuchu, funduszu ani strat ludzi.
- Robocze skutki F10+F11 (frakcje, relacje, demokracja, przemoc) nie są tu
  liczone; pozostają P.
- Zgoda na ugodę czyta bezpośrednio demokrację. W przebiegach M02 wynosiła ona
  w chwili próby ok. 69–84, dlatego przy obecnym balansie kompromis zwykle
  zastępuje pat. Zmiany w M10 mogą to przesunąć. Po M10 (0.22) demokracja w chwili
  próby wynosi 65–75, a kompromis nadal zwykle zastępuje pat.
- Archiwalne analizy M02 liczyły wyniki zamachu na profilu v1 i regułach 0.13.
  Pozostają zapisem tamtego stanu.
- Od 0.22 (M10) lojalności zależą od demokracji. Wyniki przy demokracji 60 są
  bez zmian; dla innych poziomów zob. [raport M10](../m10-authority-democracy/REPORT.md).
- Kod gry, zależności i metadane scenariusza bez zmian.
