# Etap 8: pełne kampanie, kalibracja i kontrole 21.2

**Stan:** pomiar końcowy z 4 X 2026, referencja 0.49. To ostatni etap planu wdrożenia; rozdział pierwszy jest zamknięty.

## Jak mierzymy

- **Narzędzia:** [`tests/helpers/strategies.js`](../../tests/helpers/strategies.js) gra całe kampanie w prawdziwym silniku gry; [`run.cjs`](run.cjs) zbiera wyniki.
- **Zakres:** 13 strategii PPS × 12 wspólnych ziaren (8001–8012), od I 1922 do raportu rozdziału.
- **Dostęp do kart jest kontrolowany,** jak w analizach M02 (17.16.10): automat otwiera karty z talii bezpośrednio, bez losowania ręki.
- **Wynik:** `results-<etykieta>.json`, a dla pomiaru początkowego i końcowego także `monthly-<etykieta>.csv`. Pośrednie pliki miesięczne nie są w repozytorium.
- **Uruchomienie:** `node analysis/stage8-campaigns/run.cjs <etykieta>`. Test [`tests/polish-campaign.test.js`](../../tests/polish-campaign.test.js) sprawdza, że każda strategia dochodzi do raportu bez utknięcia.

**Strategie:**
- **Cztery przebiegi referencyjne 17.16.7:**
  - N-A — bierna;
  - N-B — tolerująca;
  - N-C — współrządząca;
  - N-H — historyczne zamiary.
- **Dziewięć strategii 21.2:** bierne otwarcie, aktywna kampania wyborcza, stała opozycja, formalna koalicja, stabilizacja z osłonami, aktywne zatrudnienie, masowe organizacje, przygotowana mediacja, obrona konstytucyjna.

## Historia pomiaru

| Etykieta | Co się zmieniło | N-A | N-H | N-B / N-C |
|---|---|---|---|---|
| `baseline` | stan po etapie 7 | próba VI 1927 | VIII 1927 | próba X 1927 |
| `after-8c` | oś polityczna i kompromis wojskowy przez gabinet (8c) | — | — | bez próby |
| `after-2A` | elektorat otwarcia dopasowany do bazowego Sejmu M02 (decyzja 2A) | VII 1927 | VI 1927 | bez próby (12/12) |
| `after-split` | oferta Chjeno-Piasta V 1923 i odejście 10 posłów Piasta XII 1923 | IV 1927 | VI 1927 | bez próby |
| `after-8f` | daty z badań 8f i presja startowa 0 | III 1926 | IV 1926 | bez próby |
| `after-chain` | decyzje A1–A4: dymisja Grabskiego XI 1925, reguła 8.9 dla NPR, przegląd porozumienia gabinetu, poprawki automatów | III 1926 | III 1926 | bez próby |
| `final` | poprawki 1–5 zamknięcia | III 1926 | III 1926 | bez próby |

## Wynik końcowy (`final`)

| Strategia | Próba | Termin | Wyniki (12 ziaren) | PPS w rządzie | Koniec |
|---|---|---|---|---|---|
| N-A | 12/12 | III 1926 | 7 zwycięstw Piłsudskiego, 3 kompromisy, 2 zwycięstwa rządu | 0 | zamach |
| N-B | 0/12 | — | porozumienie z Piłsudskim 12/12 | 0 | wybory 1928 |
| N-C | 0/12 | — | porozumienie 12/12 | 12 (Skrzyński) | wybory 1928 |
| N-H | 12/12 | III 1926 | 7 / 3 / 2 | 12 (Skrzyński) | zamach |
| pozostałe 9 | 12/12 | III 1926 | 7 / 3 / 2 (obrona konstytucyjna 6 / 3 / 3) | 12 przy koalicji i zatrudnieniu | zamach |

- **Kolejność rządów we wszystkich strategiach:** Ponikowski → Śliwiński (VI 1922) → Nowak (XI 1922) → Witos (VI/VII 1923) → Grabski (I 1924) → Skrzyński (XII 1925).
- **PPS w rządzie:** wchodzi do gabinetu Skrzyńskiego przy strategiach współrządzącej, „jak w historii”, formalnej koalicji i aktywnego zatrudnienia.
- **Sejm 1922 przy biernej PPS:**
  - KPP 2, PPS 43, NPR 19, Wyzwolenie 48, Piast 70, PSChD 59, ZLN 99, mniejszości 90, Inne 14;
  - wobec bazowego Sejmu M02 każdy klub mieści się w ±5 mandatów (decyzja 2A; [calibration.json](calibration.json));
  - marszałek: Rataj; prezydent: Narutowicz, po zamachu Wojciechowski (kontrola etapu 2).
- **Presja przekracza 65 w XII 1925** we wszystkich strategiach poza N-B, bo przychodzi wtedy kryzys po dymisji Grabskiego i pokaz siły oficerów (+8). Przy N-C spada potem dzięki porozumieniu. Datę próby (III 1926) wyznacza więc techniczne okno sposobności (P, 17.16.6), otwarte od III 1926.
- **Decyzję o zamachu zmienia tylko** porozumienie wojskowe z Piłsudskim, tak jak w M02.

**Cel 1A:**
- N-A i N-H: próba w 12 z 12 ziaren, mediana III 1926 (przedział celu III–VIII 1926). **Spełnione.**
- N-B i N-C: bez próby do wyborów w 12 z 12, z wykonanym porozumieniem. **Spełnione.**

## Kontrole 21.2

**Wykonalność:**

| Kontrola | Wynik |
|---|---|
| Środki na AS | **tak:** masowe organizacje tworzą AS w 12/12 |
| Program przed terminem | **tak:** osłona pracownicza działa w 12/12 przy N-B, N-C, N-H, kampanii wyborczej, formalnej koalicji, stabilizacji z osłonami i aktywnym zatrudnieniu; gabinety bez PPS wykonują reformę waluty, parcelację i instrument kredytowy |
| Legalne wcześniejsze wybory | **nie.** Rozwiązanie Sejmu przez prezydenta przy reformie arbitrażu (7.6) nie jest wdrożone, a karty wcześniejszych wyborów nie ma (manifest 17.10). Ograniczenie zapisane w planie, rozdz. 18 |
| Oba rodzaje raportu | **tak:** raport po zamachu (11 strategii) i po wyborach 1928 (N-B, N-C) |
| Kampania bez utknięcia | **tak:** 156/156 |

**Proporcje:**
- **Jedna akcja nie dominuje** wszystkich innych. Decydujące jest porozumienie wojskowe z Piłsudskim; pozostałe działania zmieniają wynik zamachu, a nie jego termin. Automaty mają stałe plany, więc ta kontrola nie zastępuje gry człowieka.
- **Poparcie z zewnątrz ma wartość:** tolerujący N-B wynegocjowuje kompromis wojskowy wykonany przez gabinet i unika zamachu.
- **Gospodarka reaguje na finansowanie słabo:**
  - średnie bezrobocie 1923–II 1926 wynosi 5,32–5,66%, a produkcja 92,8–93,7, zależnie od strategii;
  - PPS rządzi tylko kilka miesięcy przed zamachem, więc jej programy zdążą niewiele zmienić.
  - Zapisane jako ograniczenie rozdziału.
- **Utrzymanie organizacji da się udźwignąć:** kasa partii nie spada poniżej zera (najniżej 0 R przy masowych organizacjach).

**Kontrole 21.2a–c i dowody:**

| Wiersz | Dowód |
|---|---|
| 21.2a: prognoza budżetu = rozliczenie, bez mnożenia opłat | test „Budżet bez kumulacji”, „Niedobór budżetu” |
| 21.2a: granice wykonania, ustawa D, jedna nagroda osłony | „Wykonanie i limit robót”, testy C4 |
| 21.2a: reforma mała/duża, agenda, terminy robót i doradcy | „Roboty pod Pracą”, „Wariant robót” |
| 21.2a: kurs TUR | test „TUR” (etap 5) |
| 21.2a: pożyczka | „Pożyczka inwestycyjna” |
| 21.2a: inflacja i płace | „Warunki życia”, „Stabilizacja i finanse” |
| 21.2a: jedna reakcja kapitału | „Konflikt kapitału” |
| 21.2b: kolejne miesiące marki i złotego | „17.16.2: one marka interval at a time…” |
| 21.2b: brak PPS w rządzie | pomiar: gabinety bez PPS wykonują reformę waluty, parcelację i kredyt we wszystkich kampaniach |
| 21.2b: zapis podczas odpowiedzi | testy zapisu w formowaniu i zamachu („save and load in the middle of the formation…”, „Wczytanie zamachu”) |
| 21.2b: płace 79/79/80 i 79/79/79 | „Płace 79/79/80 i 79/79/79 (21.2b)” |
| 21.2b: historyczna data następcy | „Oferta Chjeno-Piasta 1923…: the date alone dismisses nothing”; jedynym datowanym upadkiem jest warunkowa dymisja Grabskiego (A1) |
| 21.2b: II 1926 przy presji 100 | „II 1926 przy presji 100 (21.2b)” |
| 21.2b: brak zamachu do połowy 1926; wybory 19 II 1928 | pomiar N-B i N-C; testy „Raport” i „Data” |
| 21.2b: pełne N-A/N-B/N-C | ten raport |
| 21.2c: kryzys kredytu; Grabski i podatek majątkowy | „Grabski and the credit crisis…”, „Dymisja Grabskiego (A1)” |
| 21.2c: ugoda dla 80% zatrudnionych; żądanie dymisji przy 47 | testy 21.2c w `tests/polish-scenario.test.js` |
| 21.2c: szeroki gabinet i przegląd w szóstym miesiącu | „Oszczędności 1926 przez 9.8” i pomiar N-C |
| 21.2c: przewaga po fazie 1, rezerwa w fazie 2 | „Nadchodząca rezerwa” |

## Ograniczenia gotowego rozdziału

Zapisane w planie wdrożenia, rozdz. 18:
- Wszystkie strategie bez porozumienia z Piłsudskim mają próbę w III 1926.
- Gospodarka słabo różnicuje strategie.
- Nie ma drogi do legalnych wcześniejszych wyborów.
- Profile robocze P i punkty TBD pozostają oznaczone.
