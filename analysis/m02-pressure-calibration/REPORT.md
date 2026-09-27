# M02, krok 3 — tempo presji zamachowej

22 IX 2026. **Zachowujemy +2 za miesiąc otwartej sprawy wojskowej i próg 65.** Uzupełnienie skutków wydarzeń pozwala osiągnąć próg w maju 1926 w kontrolowanym przebiegu H. Nie trzeba dodawać punktów za nadejście maja. Nie jest to jeszcze ponowne obliczenie pełnej kampanii politycznej i gospodarczej.

Uruchomienie: `node analysis/m02-pressure-calibration/check.cjs`. [Kalkulator](check.cjs), [zestawienie wyników](RESULTS.md), [miesięczne składniki, zdarzenia i wejścia](results.json). Najpierw odtworzono **272 archiwalne odczyty presji** czterech przebiegów 0.13, następnie porównano **20 wariantów**, trzy projekcje ciągów kroku 2 i bramki zdarzeń. Archiwów nie zmieniono.

## Najpierw pokrycie wydarzeń

| Źródło presji | Stan wcześniejszego rachunku | Ustalenie |
|---|---|---|
| Brak czynnego gabinetu +3/M | Pominięty w starym kalkulatorze, mimo zapisu pełnienia obowiązków przez Ponikowskiego w VI 1922 | Uwzględnić ten rozliczany miesiąc. Krótkie przekazanie urzędu zakończone powołaniem następcy nie daje osobnej pełnej kary |
| Niski autorytet +2/M; niezadowolenie ogólnokrajowe +2/M | W rachunku obecne | Nie dodawać drugiej kary za dymisję, odmowę oferty lub sam protest. Ich wpływ przechodzi przez właściwy stan instytucji/społeczeństwa |
| Otwarta sprawa wojskowa +2/M | Obecna od I 1925 w wejściu H | Nie podwyższać stawki. Sprawa musi mieć przedmiot i nierozwiązane żądanie; sama niechęć do parlamentu nie wystarcza |
| Ostra publiczna eskalacja wojskowa | Brak odpowiednika w H | Istniejący kanał `personalConflictImpulse=+8`, raz za rzeczywisty publiczny nacisk wojskowy przy kryzysie formowania. Warunki poniżej |
| Faktyczny powrót Chjeno-Piasta +20 | Już obecny w V 1926 | Zachować jednokrotność. Brak dodatkowego +8 za opis tego samego powrotu innymi słowami |
| Wykonanie obowiązku cywilnego −2 | Obecne: pięć pierwszych wykonań do V 1926 | Zachować najwyżej jedną ulgę na miesiąc. Dalsze wypłaty, podpis i odnowienie nie dają następnej ulgi |
| Wykonana umowa wojskowa −12/−25/−20 | Obecna w ścieżkach ugody | Rozwiązanie danej sprawy zatrzymuje jej miesięczne narastanie; przegląd nie odnawia premii |
| Chwila sprawdzenia bramek | Stary replay sprawdzał próg przed wydarzeniami następnego miesiąca | Sprawdzić po zatwierdzonym pakiecie wydarzenia i po rozliczeniu miesiąca, przed przesunięciem daty. Nie rozliczać miesiąca drugi raz |

**Historyczna podstawa eskalacji:** 14 XI 1925 Piłsudski przedstawił prezydentowi ostrzeżenie dotyczące wojska podczas kryzysu gabinetowego; 15 XI nastąpiła demonstracja poparcia oficerów w Sulejówku. Źródło opisuje również wcześniejszy spór o naczelne władze wojskowe, trwający już w 1923. [Włodzimierz Suleja, „Zamach majowy”, IPN, 12 V 2023](https://przystanekhistoria.pl/pa2/teksty/100884,Zamach-majowy.html).

**Uproszczenie P:** oba powiązane listopadowe wystąpienia tworzą jeden impuls +8. W grze wymaga on otwartej sprawy wojskowej, rzeczywistego kryzysu tworzenia/przebudowy gabinetu, publicznego żądania popartego interwencją środowiska oficerskiego oraz braku wykonywanego kompromisu w tej sprawie. Listopad jest datą kontrolnego śladu, nie samodzielną przesłanką. Sam kryzys rządu ani zwykła krytyka parlamentu nie generują takiego wydarzenia. Nie udajemy, że złamano nieistniejącą umowę.

W pełnym scenariuszu profil aktora musi dostarczyć tę konkretną interwencję lub jej brak. Łączne spełnienie warunków pozwala rozliczyć zapisane zdarzenie, a nie automatycznie produkować nową groźbę przy każdym wakacie. Korzystamy z istniejącego wydarzenia politycznego/dziennika, bez nowej karty lub menu przygotowań zamachu. Jeden identyfikator zdarzenia zabezpiecza przed powtórzeniem przez ponowne wejście, odtworzenie zapisu lub drugie wystąpienie w tym samym epizodzie.

## Skąd bierze się maj 1926

W kontrolowanym H: **10 początkowych −10 za pięć wykonanych obowiązków cywilnych +34 za 17 miesięcy sprawy wojskowej +20 za faktyczne powołanie Chjeno-Piasta +3 za czerwcowy brak czynnego gabinetu +8 za publiczną eskalację = 65**.

Na koniec IV 1926 jest 43. Powołanie następcy daje 63; nierozwiązana sprawa wojskowa dodaje w majowym rozliczeniu 2. Sprawdzian rozpoczyna próbę w maju, bez dodatkowego przejścia do czerwca. To rozdzielczość miesięczna, nie odtworzenie dokładnego dnia 12 maja.

| Kontrola | Presja w V 1926 | Pierwsza próba |
|---|---:|---|
| Archiwalne naliczanie i kontrola następnego miesiąca | 54 | XII 1926 |
| Tylko poprawiony moment kontroli | 54 | XI 1926 |
| Dodatkowo uwzględniony brak gabinetu | 57 | IX 1926 |
| Pełne pokrycie, obecna stawka +2/M | **65** | **V 1926** |
| Pełne pokrycie, podwyższenie do +2,5/M | 71 przed rozliczeniem miesiąca | V 1926, już po powołaniu następcy |
| Pełne pokrycie, podwyższenie do +3/M | 79 przed rozliczeniem miesiąca | V 1926, już po powołaniu następcy |

Nie rekomendujemy zwiększania stawki: przy pełnym pokryciu nie jest potrzebne do uzyskania badanego terminu, a szybciej zużywa przestrzeń na reakcję. Próg 65 i pozostałe współczynniki także pozostają bez zmian.

## Czy decyzje nadal mają znaczenie

Poniższe różnice izolują presję na tym samym tle. Przyjęcie i wykonanie kompromisu są jawnym wejściem testu; nie oznaczają, że opozycyjna PPS może samodzielnie obsadzać stanowiska wojskowe.

| Zmiana względem pełnego H | Wynik |
|---|---|
| Wykonana ugoda pod cywilną kontrolą w VIII 1925, z poprawnymi przeglądami | Nie dochodzi do publicznej eskalacji tej sprawy. Presja w V 1926: 25; brak próby do granicy wyborów |
| Taka ugoda dopiero w IV 1926 | Presja w V: 49; brak próby do granicy wyborów |
| Brak publicznej interwencji wojskowej | Presja w V: 57; próba IX 1926 przy dalszym nierozwiązanym sporze |
| Chjeno-Piast wraca dopiero w VIII 1926 | Próba VIII 1926, po rzeczywistym powołaniu |
| Chjeno-Piast w ogóle nie wraca | Presja w V: 45; przeciągany spór prowadzi do próby III 1927 |
| Jeszcze jeden wykonany obowiązek cywilny w IV 1926 | Presja w V: 63; próba VI 1926 |
| Ugoda z VIII 1925 zostaje rzeczywiście złamana w X 1926 | Jedno +8 i ponownie otwarta sprawa; próba I 1928 |
| Ugody po sześciu miesiącach nie przedłużono, ale nie naruszono klauzuli ani nie zgłoszono nowego konfliktu | Wygasa ochrona porozumienia; brak automatycznego +8 i ponownego otwarcia zakończonej sprawy. Brak próby |
| Presja 65, ale dostępne siły dają zdolność tylko 29,763 | Brak próby; sama presja nie wystarcza |

To nie wynik wymuszany na wszystkich ścieżkach: przy początkowej presji 5 próba wypada w VIII 1926. Przy stale otwartej sprawie od VI 1923 — już w III 1926. Pełny wykaz zawiera [RESULTS.md](RESULTS.md).

## Granica sprawdzenia

**I 1925 jest odziedziczonym wejściem dawnego testu, nie ustaleniem o początku historycznego konfliktu.** Nie należy wygaszać rzeczywiście nierozwiązanej sprawy z 1923 tylko po to, by otrzymać maj. Pełny scenariusz musi wskazać, kiedy konkretna sprawa pozostaje otwarta, zostaje wykonana/wycofana albo zastąpiona nową. Historia ogólnej rywalizacji nie daje automatycznie czynnej sprawy w każdym miesiącu. Sprawdzenie długiego konfliktu pokazuje rzeczywistą wrażliwość tego uproszczenia, nie uzasadnia zmiany daty wstecz.

Gospodarka i gabinety H są zamrożonymi danymi z 0.13, z kontrolowanymi zgodami partnerów. Dodane +3 koryguje brakujący składnik presji, nie odtwarza całej historii autorytetu: w tym czerwcu korekta autorytetu 49→46 nadal nie przekracza progu 40. W pełnej kampanii trzeba wyliczyć oba zapisy ze wspólnego dziennika. Po końcu archiwalnego H dalsze próby korzystają z jawnie stałego tła: autorytet ≥40, niezadowolenie <60, brak nowych ulg cywilnych. Nie są prognozą przyszłej gospodarki.

Projekcja trzech ciągów z kroku 2 zachowuje ich własną presję początkową i daty zmian gabinetów. Dostarczenie tego samego warunkowego publicznego epizodu przy ich faktycznym formowaniu daje próbę **XII 1926** po wczesnych dwóch odmowach i wyjściu PPS, **VII 1926** przy późniejszej reakcji na kryzys oraz **brak próby** przy wykonywanej ugodzie. Nie przenosimy na te ciągi majowego wyniku H ani nie cofamy gabinetów na historyczne daty.

Siły pozostają kontrolowanym profilem z poprzednich testów (zdolność 36,231); skutki nominacji i historyczny skład wojsk wymagają osobnej weryfikacji M08. Test ugody izoluje jej wpływ na zamiar, nie dowodzi braku skutków dla wojska.

**Wynik kroku 3:** pokrycie presji i kolejność sprawdzeń są określone, liczby nie wymagają teraz podwyższania. Dokumentacja 0.15 zapisuje te reguły. M02 pozostaje otwarte do wspólnego przeliczenia pełnych kampanii, w tym przebiegu spraw wojskowych, legalnych sukcesji i wykonania porozumień. Nie zmieniono kodu gry, archiwów ani katalogu kart.

## Weryfikacja i zmienione pliki

Diagnostyka presji przechodzi wraz ze sprawdzeniem pojedynczego naliczenia epizodu, odmowy naliczenia przy brakujących przesłankach, powtarzalności oraz wszystkich bramek próby. `npm test`: **83/83**, bez błędów. `node --check` i `git diff --check`: bez błędów. Nie uruchamiano przebudowy ani testu przeglądarkowego: nie zmieniono źródeł gry, zasobów ani interfejsu. Testy istniejącego kodu nie oznaczają, że nowy kontrakt dokumentacyjny został już zaimplementowany w grze.

Zmiany tego kroku: `docs/POLISH_TECHNICAL_REFERENCE.md`, `docs/POLISH_DESCRIPTIVE_GUIDE.md`, `docs/POLISH_MECHANICS_AUDIT.md`; rejestry `PLAN.md`, `MECHANICS_MAP.md`, `STATE_VARIABLES.md`, `TRANSITION_MATRIX.md`, `HISTORICAL_SOURCES.md`; nowe `analysis/m02-pressure-calibration/{check.cjs,REPORT.md,RESULTS.md,results.json}`. Zastane inne zmiany robocze i archiwalne obliczenia zachowano.
