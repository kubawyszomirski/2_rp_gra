# M02 — wdrożona korekta dokumentacji 0.13

21 IX 2026. Zatwierdzone poprawki są w obu polskich przewodnikach i rejestrach projektu. Nie zmieniono rozgrywki w Dendry. Wyniki poniżej pochodzą z kontrolowanego kalkulatora; zgody aktorów, mandaty i spójność PPS pozostają jawnymi wejściami, tak jak w poprzednim raporcie.

## Co zmieniono

1. **Ratunkowy gabinet:** usunięto dodatkowe progi relacji na wejściu do `skrzynski_broad`. Kryzys kredytowy może otwierać tę ofertę. Pozostają zgoda na wspólne minimum, ocena oferty, czerwone linie i głosy. ZLN 25 / PSChD 45 są teraz roboczym warunkiem gotowości do kompromisu o osłony, nie przepustką do samego gabinetu.
2. **Konkretny spór o osłony:** w szóstym miesięcznym rozliczeniu szerokiego gabinetu, przy nadal aktywnym kryzysie kredytowym i pełnej osłonie, prawica proponuje ograniczenie kosztu 2→1 B. Jedyny domyślny kompromis utrzymuje pełną osłonę z wykonalnym finansowaniem. Gracz korzysta ze starej karty stosunku do rządu, bez nowych rund negocjacji. To polityczne żądanie, także przy wypłacalnym budżecie; nie dopisujemy ukrytego szoku fiskalnego.
3. **Grabski:** określono kredytowy pakiet konieczny i jedną poprawkę finansowaną podatkiem majątkowym. Przyjęcie poprawki wymaga pieniędzy, uprawnień i rzeczywistego wykonawcy. Jej odmowa albo niemożliwość kończy się dymisją; następca wymaga odrębnej procedury.
4. **Protest:** otwarte odrzucone żądanie lub niezadowolenie ≥50 pozwala na ograniczoną akcję. Można w niej żądać dymisji bez dodatkowego progu niezadowolenia; nie daje to automatycznie większej mobilizacji. Ogólna mobilizacja nadal wymaga 60, a polityczne ustępstwo ma trudność 80 i właściwą drogę wykonania.
5. **Ugoda i płace:** pierwsza pełna wykonana korzyść ugody daje jej odbiorcom −4 niezadowolenia raz. Samoczynna odbudowa płac wynosi najwyżej +3 do indeksu 100 przy dostępności kredytu i opanowanej inflacji; wynegocjowane podwyżki są odrębne.
6. **Presja i kolej:** +2/M tylko za konkretny otwarty konflikt wojskowy, ulgi umów jednokrotne. Wynik wojskowy najwcześniej po fazie 2, po rozliczeniu rezerw i transportu. Bez nowych decyzji taktycznych i bez wydłużenia ponad cztery rundy.

Koszty programów, bazowy budżet 2 i próg próby 65 pozostają. Wzorzec sporu zaczerpnięto z niemieckiego `source/scenes/events/unemployment_insurance_1.scene.dry`, a sposobu nacisku z `source/scenes/government_affairs/dealing_with_toleration.scene.dry`. Nie przeniesiono automatycznego niemieckiego powołania następcy ani wyborów. Wszystkie nowe terminy/progi są propozycjami balansu P, nie danymi historycznymi.

## Wynik ponownych czterech przebiegów

Maj 1926, po rozliczeniu miesiąca:

| PPS | Gabinet | Budżet B | Bezrobocie | Presja | Koniec przy zadanych wejściach |
|---|---|---:|---:|---:|---|
| Bierna | Grabski | +1,37 | 7,81% | 38 | Próba VIII 1927; syntetyczne zwycięstwo Piłsudskiego |
| Tolerująca | Grabski | +0,31 | 8,25% | 4 | Granica wyborów 19 II 1928 |
| Współrządząca | Skrzyński | −0,66 | 7,75% | 10 | Granica wyborów 19 II 1928 |
| Historyczne zamiary | Chjeno-Piast 1926 | +0,27 | 8,62% | 54 | Próba XII 1926; syntetyczne zwycięstwo Piłsudskiego |

W H znika blokada politycznego postulatu strajkowego w XI 1923; nadal odmawia go istniejąca większość, więc PPS w następnej rundzie wybiera ograniczoną ugodę płacową. Nie zamieniamy żądania politycznego w darmową dymisję albo podwyżkę.

**W H działa teraz cały sprawdzany ciąg:** XI 1925 przyjęta oferta Skrzyńskiego, z osłoną PPS finansowaną w dostępnej przestrzeni → IV 1926 przegląd i odmowa kompromisu przez prawicę przy słabych relacjach → wyjście PPS → V 1926 odrębne skuteczne głosowanie oraz przyjęta oferta Witosa → +20 presji. Nowy gabinet legalnie ogranicza istniejącą osłonę; program nie znika wraz z ministrami PPS. Stanowiska pozostałych aktorów i ich poparcie nowej oferty są nadal deklarowanymi wejściami testu, nie wynikiem pełnego modelu preferencji.

W C przegląd odbywa się również w IV 1926, lecz przygotowane relacje i przyjęta oferta kompromisu zachowują pełne osłony oraz rząd. Ten sam kryzys ma więc dwie sprawdzone reakcje. Dodatkowy wariant przyjęcia cięć poprawia budżet kosztem pomocy bezrobotnym. W osobnym wariancie H po wyjściu PPS inne partie utrzymują Skrzyńskiego: brak głosowania nad następcą oznacza brak nowego gabinetu i brak +20. Samo odejście PPS nie wywołuje zmiany rządu.

Ulga ugody w III 1924 zmniejsza średnie niezadowolenie zatrudnionych o **3,2**, ponieważ jej odbiorcy stanowią w teście 80% tej grupy: 4×0,8. Późniejsze wypłaty nie powtarzają ulgi. W maju 1926 u zatrudnionych pozostaje około 60,67 w C zamiast 63,86 poprzednio; naprawienie konkretnego sporu nie zeruje wszystkich wcześniejszych kosztów kryzysu.

## Co wykazał test kolei

Przy sprawdzaniu szczegółowych losowań ujawniono, że **odległa rezerwa w pierwotnych czterech przebiegach poparła Piłsudskiego**. Kolej PPS nie blokowała własnego sprzymierzeńca. Poprzedni opis nadmiernie przypisywał brak zmiany zwycięzcy wyłącznie zbyt wczesnemu zakończeniu walk; został sprostowany.

Aby rzeczywiście sprawdzić moment przybycia wrogich rezerw, wykonano osobny jawny test: stolica legalna po stronie rządu, stolica zamachowa i bliska rezerwa po stronie Piłsudskiego, odległa rezerwa po stronie rządu. Nie zmieniono sił ani gotowości.

| Reguła | Z blokadą kolei | Bez blokady kolei |
|---|---|---|
| Poprzednia | Zwycięstwo Piłsudskiego po 2 rundach | Ten sam wynik, zanim rezerwa może dotrzeć |
| Po korekcie | Zwycięstwo Piłsudskiego po 3 rundach; legalna rezerwa opóźniona | Rezerwa dociera i odbiera rozstrzygającą przewagę; przedłużony konflikt po 4 rundach |

To sprawdzenie znaczenia transportu w określonym układzie, nie gwarancja zwycięstwa dzięki kolejarzom. W pierwotnym losowaniu obie wersje nadal wygrywa Piłsudski, teraz po trzech rundach.

## Zakres sprawdzenia i co pozostaje

- 281 starych wierszy miesięcznych odtwarza się bez zmiany któregokolwiek zapisanego pola. Poprawki są opcją kalkulatora, a wcześniejsze wyniki pozostają punktem porównania.
- Przeliczono **272 miesiące czterech nowych przebiegów**, trzy warianty reakcji gabinetowych i cztery zestawienia transportu.
- Sprawdzono pięć konkretnych przypadków oferty Grabskiego: przyjęcie zwykłego finansowania, naprawę przez podatek, odmowę obu ofert, brak wykonawcy i zakaz podwojenia aktywnego podatku. Są to testy samej decyzji; nie pełne kampanie z następcą po jego dymisji.
- Kontrole obejmują fundusze, limit inicjatyw, pojedyncze rozliczenie ugody/przeglądu/+20, zachowanie reform, odrębne głosowanie po odejściu PPS, wpływ cięć i moment wyniku walk.

**M02 pozostaje częściowo otwarte.** Sekwencja H jest dostępna i ma konsekwencje, lecz presja 54 w V 1926 prowadzi do próby dopiero w XII. Nie zmieniono +2 ani progu 65, by wymusić datę. Dalsze prace dotyczą kalibracji konfliktów i rzeczywistych zgód, różnych wyników wyborów i frakcji. M08 wymaga historycznego profilu sił oraz konkretnych ofert ugody; syntetyczny test nie rozstrzyga tych kwestii.

Pliki: [kalkulator i sprawdzenia](check.cjs), [miesięczne wyniki](monthly.csv), [zdarzenia, wejścia i wyniki porównań](results.json). Uruchomienie: `node analysis/m02-revision-13/check.cjs`. Wspólny kalkulator w `analysis/m02-four-runs/replay.cjs` zachowuje dawną ścieżkę bez opcji `revision13`; obliczenia gospodarki są w `analysis/m02-current-rules/calculate.cjs`.

## Zmienione pliki i weryfikacja repozytorium

- `docs/POLISH_TECHNICAL_REFERENCE.md`, `docs/POLISH_DESCRIPTIVE_GUIDE.md` — docelowe reguły 0.13.
- `docs/POLISH_MECHANICS_AUDIT.md` — zrealizowane części i pozostała kalibracja M02/M08.
- `PLAN.md`, `MECHANICS_MAP.md`, `STATE_VARIABLES.md`, `TRANSITION_MATRIX.md`, `HISTORICAL_SOURCES.md` — zgodne rejestry zatwierdzenia, stanu, przejść i inspiracji.
- `analysis/m02-current-rules/calculate.cjs`, `analysis/m02-four-runs/replay.cjs` — opcjonalne obliczenia korekty, bez zmiany dawnych domyślnych wyników.
- `analysis/m02-four-runs/REPORT.md` — sprostowanie interpretacji wcześniejszego losowania rezerwy; dawnych tabel wyników nie zmieniono.
- `analysis/m02-revision-13/check.cjs`, `REPORT.md`, `monthly.csv`, `results.json` — nowa weryfikacja i wyniki.

`npm test`: **83/83**. Dodatkowo zgodność wszystkich **1022 wcześniejszych wierszy gospodarczych** i 281 wierszy poprzednich czterech przebiegów. `git diff --check` bez błędów; brak zmian w `source/`, `assets/` i `out/`. Nie uruchamiano kompilacji ani przeglądarkowego testu rozgrywki, ponieważ nie zmieniono źródeł gry ani interfejsu. Nie pozostały niezaliczone sprawdzenia; ograniczenia pokrycia opisano powyżej.
