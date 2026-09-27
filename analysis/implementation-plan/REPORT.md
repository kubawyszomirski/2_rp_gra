# Plan implementacji rozdziału 1 — referencja 0.40

26 IX 2026. Powstał [plan implementacji](../../docs/POLISH_IMPLEMENTATION_PLAN.md) pierwszego rozdziału. Rozwija on kolejność z 20.3 referencji w dziewięć etapów (0–8). Skrypt sprawdza spójność planu z katalogiem kart i referencją. Nie jest to symulacja kampanii i niczego nie wdraża w grze.

Uruchomienie: `node analysis/implementation-plan/check.cjs`. Pliki: [kalkulator](check.cjs) i [wyniki z hashami dokumentów](results.json).

## Zatwierdzone decyzje

- **Kod reguł w osobnym module** (wariant A): zwykły JavaScript w `source/rules/`, kopiowany przez `npm run build` do `out/html/` i wczytywany przez stronę i testy. Zmiany `package.json` i `out/html/index.html` wykona dopiero etap 0.
- **Na razie tylko angielski:** nowe teksty dla gracza po angielsku, z polskimi nazwami własnymi.
- **Stare zapisy gry:** zapis bez zgodnej wersji schematu prowadzi do komunikatu i nowej gry, bez migracji.

Referencja zapisuje je w 19.3, 20.1 i 20.3, a decyzję w 23.13.

## Co zawiera plan

| Etap | Treść | Pozycje katalogu | Testy z 21.1 | Przecieki z 20.2 |
|---|---|---:|---:|---|
| 0 | Fundament techniczny | 0 | 1 | — |
| 1 | Czas, akcje, karty i kolejka wydarzeń | 0 | 4 | 6, 8 |
| 2 | Wybory, urzędy, głosowania i koniec rozdziału | 5 | 17 | 4, 5, 7 |
| 3 | Relacje, umowy, gabinety i resorty | 4 | 22 | 2 |
| 4 | Budżet, gospodarka, projekty i karty państwa | 19 | 43 | 1, 9 |
| 5 | Partia | 24 | 64 | 10 |
| 6 | Związki i strajki | 5 | 16 | — |
| 7 | Demokracja, siły, zamach i raport | 11 | 49 | 3 |
| 8 | Scenariusz Normalny, treść i kalibracja | 1 | 0 (kontrole 21.2) | — |
| **Razem** | | **69** | **216** | **10** |

## Wyniki sprawdzenia

- **Etapy:** dziewięć etapów w kolejności 0–8. Każdy ma cel, zakres w referencji, karty, pliki, stan, listę wyłączanych mechanizmów i warunek ukończenia.
- **Zakres:** każda sekcja referencji wymieniona w zakresie etapu istnieje w rozdziałach 1–22.
- **Karty:** każda z 69 pozycji katalogu ma dokładnie jeden etap. Dodatek A zgadza się z wierszem kart w każdym etapie.
- **Testy:** każdy z 216 testów z 21.1 ma dokładnie jeden etap. Liczby testów w tekście etapów zgadzają się z dodatkiem B, a przykładowe testy wymienione w etapie należą do tego etapu.
- **Przecieki:** każdy z 10 przecieków z 20.2 ma jeden etap. Etap wymienia go w polu „Wyłączamy”.
- **Manifest:** osiem wierszy dla etapów 1–8, z unikalnym `system_id` i statusem „planowane”.
- **Pliki:** każdy wymieniony plik istnieje; 20 ścieżek jest oznaczonych jako nowe. Nazwy kart i wskaźników wymienione obok folderu istnieją w tym folderze.
- **Odnośniki:** odnośniki względne i kotwice trafiają w istniejące pliki i nagłówki.
- **Decyzje:** referencja 0.40 zapisuje je w 19.3, 20.1 i 20.3, a cztery rejestry wskazują plan.

Skrypt sprawdzono też odwrotnie: po usunięciu jednego testu z dodatku B albo jednej karty z dodatku A kończy się błędem.

## Zasada przypisania testów

Test z 21.1 należy do pierwszego etapu, po którym da się go uruchomić w pełnej postaci. Przykład: „Kolejność kategorii wydarzeń” używa krytyki parlamentu z etapu 7, więc należy do etapu 7. Mechanizm kolejki powstaje w etapie 1 i sprawdzają go tam własne testy na wydarzeniach testowych.

## Aktualizacja 0.41 — etap 0 wykonany

Etap 0 jest wdrożony (K). Plan zapisuje cztery decyzje etapu, jego wynik i ustalenia dla następnych etapów (rozdział 10) oraz pełne listy starych zapisów (dodatek E). Skrypt sprawdza dodatkowo, że:
- etap 0 jest oznaczony jako wykonany, a jego pięć nowych plików istnieje;
- `package.json` kopiuje moduł reguł przy budowaniu, a `out/html/index.html` go wczytuje;
- referencja zapisuje etap w 23.14;
- każdy plik z dodatku E zawiera wskazaną zmienną jako całe słowo, a liczby plików się zgadzają.

Skrypt przyjmuje teraz każdą wersję 0.4x w nagłówkach planu, referencji i rejestrów.

Poprawka liczby: `pro_republic` występuje w 43 plikach, nie w 46, jak podawał plan w 0.40.

## Aktualizacja 0.42 — etap 1 wykonany

Etap 1 jest wdrożony (K). Plan zapisuje jego cztery decyzje, wynik i ustalenia (rozdział 11), a wiersz `turn_actions` w dodatku D ma status „wykonane”. Skrypt sprawdza dodatkowo, że:
- etap 1 jest oznaczony jako wykonany, a jego sześć nowych plików istnieje;
- status każdego wiersza dodatku D zgadza się ze stanem jego etapu;
- referencja ma pięć oznaczeń K etapu 1 w rozdziale 4 i zapis 23.15;
- strona wczytuje nakładkę na silnik, a `game.js` ją instaluje;
- wszystkie 21 akcji polskich doradców zatwierdza się przez moduł reguł.

## Aktualizacja 0.43 — etap 2 wykonany

Etap 2 jest wdrożony (K). Plan zapisuje jego pięć decyzji, wynik i ustalenia (rozdział 12), a wiersz `elections_offices` w dodatku D ma status „wykonane”. Decyzja 1 przeniosła kartę 7.7 i test „Kompromis listowy a Lewica” do etapu 3, a test „C4” do etapu 4:

| Etap | Pozycje katalogu | Testy z 21.1 |
|---|---:|---:|
| 2 | 4 (było 5) | 15 (było 17) |
| 3 | 5 (było 4) | 23 (było 22) |
| 4 | 19 | 44 (było 43) |

Skrypt sprawdza dodatkowo, że:
- etap 2 jest oznaczony jako wykonany, a jego pięć nowych plików istnieje;
- referencja ma 12 oznaczeń K etapu 2 i zapis 23.16;
- strona wczytuje drugi plik reguł, `polish_institutions.js`;
- przeniesione karta i testy mają nowe etapy.

## Granice

- Plan nie zmienia reguł. Przy rozbieżności obowiązuje referencja.
- Wielkości etapów są orientacyjne, bez terminów.
- Manifest w dodatku D jest wstępny; pełne listy starych zapisów są w dodatku E (etap 0).
- Etap 0 zmienił kod zgodnie z planem, bez zmiany rozgrywki. Zależności i metadane scenariusza bez zmian.
