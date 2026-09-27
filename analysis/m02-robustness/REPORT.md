# M02 — końcowa korekta i wynik, referencja 0.16

22 IX 2026. **M02: scenariusz gotowy do implementacji.** Wprowadzono dwie
zatwierdzone poprawki warunków i raz uruchomiono istniejący zestaw porównawczy.
Nie dostrajano dalszych liczb ani dat. Historyczne tempo i balans wymagają
sprawdzenia w grywalnym prototypie.

## Co zmieniono

1. **Impuls +20 bez bramki maja.** Daje go faktyczny powrót wcześniej
   rządzącego Chjeno-Piasta bezpośrednio po gabinecie stabilizacyjnym lub
   szerokim, przy nierozwiązanym konflikcie wojskowym w chwili powołania.
   W badanym katalogu poprzednikiem jest Grabski albo Skrzyński. Impuls jest
   jednorazowy w rozdziale; nie dostaje go pierwsze powołanie, odrzucona oferta,
   powrót po innym profilu ani powrót po rozwiązaniu sporu. Później otwarty
   konflikt nie nalicza go wstecz.
2. **Kompromis osłon bez drugiego minimum relacji.** Każda wymagana zgoda
   korzysta ze wspólnej oceny ≥60, finansowania i twardych warunków. Usunięto
   dodatkowe ZLN ≥25 / PSChD ≥45. Relacje nadal wpływają na sam wynik oceny.

Pozostają +2/M, próg presji 65, koszty, gospodarka, priorytety, profile aktorów,
ziarna losowań i składy Sejmu. Osobna bramka sposobności próby od III 1926 oraz
wymóg zdolności nie zostały usunięte razem z majową bramką impulsu. Daty początku
spraw wojskowych są robocze: **TBD — historical research required**.

## Wynik głównych przebiegów

W tabeli daty oznaczają próbę zamachu, nie samo powołanie gabinetu. Brak próby
kończy diagnostykę na testowej granicy kolejnych wyborów, 19 II 1928; nie jest
to obliczony wynik tych wyborów. Poza wskazanym podziałem 6/12 wszystkie terminy
są takie same w 12/12 badanych losowań.

| Sejm | PPS | Przed, 0.15 | Po, 0.16 |
|---|---|---|---|
| Bazowy | A — bierna | XII 1926 | **III 1926** |
| Bazowy | B — tolerująca | Bez próby do granicy wyborów | Bez zmiany |
| Bazowy | C — współrządząca | Bez próby do granicy wyborów | Bez zmiany |
| Bazowy | H — decyzje zbliżone do historycznych | II 1927 | **IV 1926** |
| Korzystniejszy | A | III 1927 | Bez zmiany |
| Korzystniejszy | B | Bez próby do granicy wyborów | Bez zmiany |
| Korzystniejszy | C | Bez próby do granicy wyborów | Bez zmiany |
| Korzystniejszy | H | I 1927 | Ten sam termin; PPS utrzymuje udział w gabinecie dzięki kompromisowi |
| Trudniejszy | A | IV 1927 | Bez zmiany |
| Trudniejszy | B | V / VI 1927, po 6/12 | Bez zmiany |
| Trudniejszy | C | V / VI 1927, po 6/12 | Bez zmiany |
| Trudniejszy | H | V 1927 | Bez zmiany |

**Bazowy A:** dwie odmowy koniecznego pakietu kredytowego prowadzą do dymisji
Grabskiego i rzeczywistego powrotu Chjeno-Piasta w VIII 1925. Otwarta sprawa
wojskowa pozwala wtedy naliczyć +20. Presja osiąga 65 przy dostępnej sposobności
w III 1926. Nie czeka na maj i nie dostaje wtedy drugiej dopłaty.

**Bazowy H:** Grabski odchodzi w VIII 1925; powstaje Skrzyński. W I 1926 ZLN
ocenia kompromis osłon na 56,75, więc usunięcie drugiej blokady nie daje zgody.
PPS wychodzi w II, a w III faktycznie wraca Chjeno-Piast: +20. W IV następca
osobno uchwala cięcie osłon, a presja dochodzi do 65 i następuje próba. Osiągnięto
kwiecień, nie maj; zostawiamy ten rezultat bez kolejnego przesuwania dat.

**Korzystniejszy H:** w IV 1926 ZLN ma ocenę 64,10. Finansowanie i wymagane zgody
są dostępne. Dawniej relacja 9 przegrywała dodatkowy próg 25; teraz kompromis
przechodzi w 12/12 przebiegów i PPS nie wychodzi z gabinetu. Nie rozwiązuje to
samo w sobie konfliktu wojskowego: próba nadal następuje w I 1927. Zgodność w
sprawie osłon nie jest automatyczną ugodą z Piłsudskim.

**B i C:** wykonana ugoda wojskowa nadal zapobiega próbie w bazowym i
korzystniejszym Sejmie. W trudniejszym prawica zachowuje większość i blokuje
badany plan dojścia PPS do wpływu; korekta nie przyznaje jej brakującego rządu,
resortu ani pieniędzy. Nie zmieniły się wyniki wykonania osłon, uruchomienia
robót i zawarcia ugód w żadnej z dwunastu głównych konfiguracji.

## Kontrole decyzji i datowania

Istniejące 216 kontroli pojedynczych decyzji zachowują wpływ przygotowania
politycznego. W bazowym Sejmie pominięcie kontaktów z mniejszościami w B albo
pośrednictwa doradcy w H może dać powrót prawicy i próbę już w III 1926. Wariant
H bez dodatkowego kontaktu z ZLN ma teraz próbę w IV 1926. Pominięcie samej ugody
wojskowej w B/C nadal prowadzi do późniejszej próby mimo osłon; usunięcie robót
w C nie zastępuje ani nie unieważnia wykonanej ugody.

W 36 istniejących kontrolach sprawa wojskowa jest otwarta od VI 1923 zamiast
I 1925. Przy ciągle otwartym sporze przebiegi bez wykonanej ugody dochodzą do
próby w III 1926. B/C w bazowym i korzystniejszym Sejmie nadal mogą jej uniknąć.
To potwierdza znaczenie długości konfliktu, nie historyczną poprawność tych dat.
Nie zmieniono ich ani nie dodano sztucznego zamknięcia sprawy.

## Weryfikacja i granice

Uruchomiono raz `node analysis/m02-robustness/run.cjs`:

- 144 główne przebiegi: 4 strategie × 3 Sejmy × 12 wspólnych ziaren;
- 216 kontroli decyzji i 36 kontroli daty sporu — razem **396 konfiguracji**;
- wewnętrzne powtórzenie głównych przebiegów sprawdza deterministyczność;
- odtworzono 59 wcześniejszych ocen ofert;
- przeszły sprawdziany głosów, budżetów, uprawnień, pojedynczego naliczenia
  skutków i wspólnych losowań; doprecyzowano sprawdzenie nowych warunków impulsu
  i kompromisu na tych samych przebiegach;
- wcześniejsze katalogi obliczeń pozostały niezmienione.

Raz uruchomione `npm test`: **83/83 zaliczone**, bez pominięć i błędów. Nie
zmieniono Dendry ani zasobów, więc nie wykonywano kompilacji i testu interfejsu.
Generator raportu pokazuje brak odczytu z maja, jeśli kampania skończyła się
wcześniej; nie dopisuje stanów po zakończeniu.

To diagnostyka dokumentacji. Zachowuje kontrolowany dostęp do zwykłych kart,
ograniczony katalog kandydatów, jawne próbne stanowiska aktorów, wspólne otwarcie
instytucjonalne i syntetyczne siły. Bazowy/pomyślniejszy/trudniejszy Sejm mają
444 mandaty; prawica z Piastem odpowiednio 230/218/242. Pełne losowanie ręki,
wynik kolejnych wyborów i historyczny model walk nie są tu implementowane.
Szczegóły niezmienionych założeń są w [archiwalnym raporcie 0.15](REPORT_0_15.md).

**Zamykamy etap dokumentacji M02.** Dalsze sprawdzenie historycznych dat i
balansu nastąpi przy prototypie; M06/M08/M09 zachowują odrębny zakres. Nie dodano
nowego miernika, karty ani kolejnej rundy strojenia.

## Pliki

- [Wyniki zbiorcze](SUMMARY.md), [ślady ziarna 01](TRACES.md),
  [pełne dane zdarzeń i ofert](results.json), [miesiące](monthly.csv).
- [Dane porównawcze sprzed poprawki](baseline-0.15.json) zachowują zbiorcze
  wyniki, porównania decyzji i hashe wejść 0.15. Bieżące pliki wynikowe są 0.16.
- Zmieniono [kalkulator](engine.cjs), [sprawdziany i raportowanie](run.cjs),
  [referencję](../../docs/POLISH_TECHNICAL_REFERENCE.md),
  [przewodnik](../../docs/POLISH_DESCRIPTIVE_GUIDE.md),
  [audyt](../../docs/POLISH_MECHANICS_AUDIT.md), [plan](../../PLAN.md),
  [mapę mechanik](../../MECHANICS_MAP.md), [stan](../../STATE_VARIABLES.md),
  [przejścia](../../TRANSITION_MATRIX.md) i [rejestr źródeł](../../HISTORICAL_SOURCES.md).
