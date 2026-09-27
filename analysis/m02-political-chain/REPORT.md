# M02, krok 2 — od kryzysu kredytowego do możliwej próby zamachu

21 IX 2026. **Domknięto kontrakt przejść i sprawdzono zmianę gabinetu po niepowodzeniu obu ofert Grabskiego.** Jest to sprawdzenie ciągu politycznego na jawnych stanach początkowych, nie ponowna pełna kampania gospodarcza od 1922 roku. Terminy i częstotliwość kryzysów nadal wymagają kroku 3.

Uruchomienie: `node analysis/m02-political-chain/check.cjs`. [Kalkulator](check.cjs), [pełne ślady 16 wariantów](TRACES.md), [wejścia, oceny, głosy i miesięczny stan](results.json). Obliczenia reprodukują wszystkie **59 ocen kroku 1** przed uruchomieniem nowego ciągu. Archiwów nie nadpisano.

## Ustalenia potrzebne do zamknięcia ciągu

1. **Jedna sprawa Grabskiego, najwyżej dwie oferty.** Przy aktywnym kryzysie bez wykonanego wsparcia gabinet przygotowuje instrument kredytowy, jeżeli nie jest gotowy. Próbuje finansować go z istniejącego budżetu, następnie — po niepowodzeniu — przedstawia jedną poprawkę z podatkiem majątkowym. Poprawka zajmuje następny przegląd gabinetowy. Przyjęcie wykonalnej oferty utrzymuje rząd. Niepowodzenie obu kończy się jego dymisją. Brak właściwego wykonawcy nie jest naprawiany fikcyjnym podatkiem: przy następnym przeglądzie premier stwierdza brak dopuszczalnej poprawki i odchodzi.
2. **Następca nie jest wpisany do kalendarza.** Po faktycznej dymisji otwiera się istniejąca C1. PPS składa jedną ofertę lub wybiera opozycję. Piast może zgłosić własny układ z prawicą. Oceniamy zgody, obsadę, finanse i deklaracje; spośród przyjętych ofert działa dotychczasowy ranking §8.7. Grabski nie występuje jako „dalsze tolerowanie eksperta” po odrzuceniu programu, od którego uzależnił pozostanie. Nowe zaproszenie go wymaga usunięcia przyczyny dymisji.
3. **Brak oferty oznacza pełnienie obowiązków.** Kontynuowane są prawne wypłaty. Nie ma co miesiąc darmowej kopii C1 ani dopisywanego następcy. Nowe rozpatrzenie wymaga zmiany programu, poparcia lub kandydatury. M06 pozostaje właściwym miejscem dla szerszych impasów urzędowych.
4. **Przegląd osłon jest liczony od powołania.** W szóstym miesiącu, podczas trwającego kryzysu kredytowego, prawica żąda 2→1 B. PPS negocjuje pełne osłony, przekonuje bez groźby odejścia, utrzymuje poparcie albo je wycofuje. Sam postulat niczego nie obcina; potrzeba zgody i zmiany prawa.
5. **Po wyjściu PPS oceniamy dwie konkretne możliwości.** W następnym przeglądzie partnerzy mogą utrzymać Skrzyńskiego na przyjętych warunkach albo poprzeć własną ofertę Witosa. W pierwszym wariancie premier osobno przyjmuje mandat do kontynuowania legalnych zobowiązań bez PPS. W drugim potrzebne jest skuteczne odwołanie/ustąpienie oraz akt powołania. Sam wynik rankingu nie obala urzędującego gabinetu.
6. **Dziedziczymy stan państwa.** Powołanie Witosa nie usuwa osłon. Dopiero jego odrębna inicjatywa i skuteczna procedura obniżają koszt do 1 B. Uchwalony podatek wygasa po sześciu miesiącach także po zmianie rządu. Nieudane projekty nie dają efektów gospodarczych.
7. **Zamach jest osobnym sprawdzianem.** Nierozwiązana sprawa wojskowa, nieskuteczność instytucji i faktyczny kwalifikujący się powrót Chjeno-Piasta wpływają na istniejącą presję. Nie dodajemy premii za samą dymisję Grabskiego lub odejście PPS. Nadal potrzeba presji ≥65, zdolności ≥30, okna operacyjnego, braku wiarygodnego porozumienia o odstąpieniu, braku aktywnej próby i upływu odnowienia.

Pełna tabela przyczyn, partnerów, decyzji PPS i warunków pozostania rządu jest w technicznej referencji **17.16.8**. Nie dodano kart ani rund negocjacji.

## Dwie odmowy polityczne — przeprowadzone do następcy

Wariant `political_refusal_twice` pozwala sprawdzić rzeczywistą przegraną obu propozycji w głosowaniu, bez tłumaczenia pierwszej samym brakiem pieniędzy.

**Jawne założenie P:** Piast, NPR i Wyzwolenie żądają wydzielonego źródła finansowania nowego instrumentu, chroniącego dotychczasowe wydatki. Pierwsza propozycja ogólnego finansowania budżetowego nie spełnia tego warunku. Poprawka z podatkiem majątkowym go spełnia, lecz traci poparcie prawicy przez treść podatkową. PPS popiera obie oferty; reprezentacje mniejszości nie zawarły umów ich poparcia. Nie jest to twierdzenie o historycznych głosowaniach ani stałe weto tych partii wobec każdej inwestycji.

| Moment | Rzeczywista przyczyna i wynik |
|---|---|
| VI 1925 | Gotowy instrument 2 B; prognoza po uruchomieniu −1 B. Pierwsza propozycja przegrywa **201:243**. Brak zgody politycznej, mimo wykonalnego budżetu |
| VII 1925 | Ten sam instrument z wydzielonym podatkiem +2 B na sześć miesięcy. Prognoza +1 B. Zmienia się grupa zwolenników, ale wynik to **178:266**. Projekt ani podatek nie zostają uruchomione |
| VII 1925 | Grabski składa dymisję. PPS proponuje szeroki układ; dostępny Daszyński zużywa istniejącą akcję koalicyjną, bonus +5 i wspólne odnowienie sześciomiesięczne |
| VII 1925 | Oferta Skrzyńskiego uzyskuje zgody Piasta, NPR, PSChD i ZLN. Ocena rankingowa **78,33**, oferta Witosa **73,89**. Obie mają realne większości; przyjęta oferta Skrzyńskiego wygrywa ranking i zostaje legalnie powołana |
| XII 1925 | Szósty miesiąc nowego gabinetu. Przy relacji ZLN 29 i PSChD 46 kompromis pełnych osłon przechodzi; ZLN daje **60,65**, bez ponownego bonusu doradcy |

Nie używamy historycznej premii Skrzyńskiego do uzyskania lipcowego wyniku; jego okno +8 rozpoczyna się w listopadzie. Rozstrzygają policzone oferty. Inicjatywa nowego gabinetu nie pojawia się drugi raz w lipcu po inicjatywie ustępującego.

## Najważniejsze warianty kontrolne

| Wariant | Wynik polityczny |
|---|---|
| Pierwszy pakiet ma środki i poparcie | Grabski pozostaje; brak wymuszonego Skrzyńskiego w listopadzie |
| Pierwszy pakiet niewykonalny finansowo, poprawka z uzgodnionym poparciem obu segmentów mniejszości | Poprawka przechodzi **268:176**; Grabski pozostaje. +2 B wygasa, koszt utrzymania kredytu pozostaje |
| Pierwszy pakiet −3 B, poprawka −1 B, lecz brak poparcia dla podatku | Dymisja w VII 1925; zaakceptowany następca rzeczywiście obejmuje urząd |
| Projekt jeszcze nieprzygotowany | Przygotowanie w VI, pierwsza oferta w VII, poprawka i dymisja w VIII; przegląd następcy dopiero w I 1926 |
| PPS wycofuje się przy przeglądzie, a Piast ma pełną uzgodnioną reprezentację | W badanej wczesnej gałęzi wyjście w XII 1925, zmiana rządu w I 1926: **230:214**. Cięcie osłon dopiero po osobnym głosowaniu nowego gabinetu |
| Kompromis odrzucono, lecz PPS jeszcze nie wybrała odejścia | Brak automatycznej dymisji ministrów. Ten test graniczny kończy obserwację na oczekiwaniu na rzeczywistą następną decyzję/nową ofertę, zamiast symulować kilkanaście miesięcy fikcyjnego rozwiązania sporu |
| PPS wychodzi, dziesięciu posłów Piasta nie wraca | Oferta Witosa ma **220:224** i odpada. Kontynuacja Skrzyńskiego otrzymuje **238:206** bez PPS; zachowuje pełną osłonę |
| PPS odmawia członkostwa od początku | Szeroka oferta z wymogiem jej udziału odpada. Witos może powstać już po dymisji Grabskiego, jeżeli uzyska swoje zgody i głosy |
| Brak PPS i brak dziesięciu posłów dla Witosa | Brak wykonalnej oferty w ograniczonym zestawie testowym; Grabski pełni obowiązki. Jedna nieudana próba, nie nowa kara za tę samą próbę w każdym miesiącu |
| W czasie impasu wykonano wcześniejszą gwarancję ziemską i ponownie uzgodniono program | Nowa konkretna podstawa poparcia uruchamia ponowną ocenę; Witos może powstać w X 1925. Nie odzyskuje dziesięciu posłów samą zmianą daty |
| Brak uprawnionego wykonawcy | Podatek nie usuwa przeszkody; brak fikcyjnej drugiej oferty, dymisja i rzeczywiste formowanie następcy |
| Kryzys rozwiązany przed terminem poprawki, brak nadal wymagalnego obowiązku | Sprawa zostaje zamknięta; premier nie odchodzi z powodu wygasłej przesłanki |

Dziesięciu posłów pozostaje osobnym, **syntetycznym** blokiem w obrębie istniejących 70 mandatów Piasta. Przy powrocie do nowej oferty sprawdzamy wykonanie wcześniejszej gwarancji ziemskiej, parcelację z odszkodowaniem, brak nowego podatku na drobne gospodarstwa i ocenę programu. Nie tworzymy dziesięciu nowych mandatów ani nie twierdzimy, że był to historyczny powód odejścia wskazanych posłów. Przy głosowaniu nad konkretną ustawą mogą mieć inne stanowisko niż przy składzie rządu.

## Co wynika dla terminu zamachu

To sprawdzenie **nie potwierdza jeszcze właściwego tempa scenariusza**. Gdy gotowy pakiet jest proponowany już w czerwcu, dymisja po jednej poprawce wypada w lipcu. Następnie przegląd osłon może wypaść w grudniu, a Witos powrócić w styczniu 1926. Taki powrót **nie dostaje później w maju** bonusu +20: nie można podpiąć starej nominacji pod nową datę.

Przy kontrolowanej początkowej presji 20 i nierozwiązanej sprawie wojskowej wczesna gałąź dochodzi do próby dopiero w IV 1927. W teście później otwartej sprawy (pierwsza oferta XI 1925) Skrzyński powstaje w XII, przegląd wypada w V 1926, Witos w VI, a próba w XI 1926. Ten późny początek jest osobnym wejściem testowym, nie naprawą historii przez opóźnienie wydarzenia bez przyczyny.

Długi rzeczywisty impas potrafi doprowadzić do próby wcześniej: w teście bez następcy jest to III 1926. Ważna, wykonywana umowa wojskowa blokuje próbę w wariancie kontrolnym. Sukces ekonomiczny Grabskiego sam nie rozwiązuje niezależnego sporu wojskowego.

**Następny krok:** skalibrować początek i tempo tych rzeczywistych spraw, a nie dodawać punkty zamachu za nadejście maja. Pełne przebiegi muszą ponownie liczyć gospodarkę, ugrupowania i reputację po każdej z nowych gałęzi.

## Granice dowodu

- Stan wejściowy to jawny wycinek po reformie walutowej: legalna osłona 2 B już obowiązuje. Nie jest to osłona rzekomo uchwalona w błędnej gałęzi kroku 1. Jej wcześniejsze legalne powstanie jest założeniem tego odrębnego testu.
- Podstawowa przestrzeń budżetowa −1 B albo +1 B, niezadowolenie ogólnokrajowe poniżej 60, relacje, kompetencje prawne i zasięg kryzysu są kontrolowane. Liczymy koszty budowy/utrzymania, wygasanie podatku, zmiany osłon, głosy i presję; **nie liczymy od nowa produkcji, płac, kampanii wyborczej ani reakcji frakcji**.
- Kryzys w podstawowym wycinku trwa do VI 1926 włącznie. Zamknięcie sprawy w lipcu jest zasadne tylko w wariancie, gdzie również rzeczywista przyczyna ustąpiła; samo wygaśnięcie szoku kalendarzowego w pełnej kampanii nie dowodzi naprawy kredytu.
- Pierwsza oferta wykorzystuje gotowy projekt jako jawny stan początkowy; wariant bez niego sprawdza konieczny osobny miesiąc przygotowania. Nie jest to darmowe przygotowanie po wybuchu kryzysu.
- Wszyscy 444 posłowie biorą udział w testowych głosowaniach; brak uzgodnionego poparcia oznacza głos przeciw. Nie ukrywamy potrzebnej większości we wstrzymaniach. Podział reprezentacji mniejszości 45/45 jest wyłącznie rozbiciem testowych 90 mandatów.
- Relacje do kandydatów, mandaty osób i warunki wydzielonego finansowania są profilami P. Dostępne oferty w testach to Skrzyński i Witos; brak kandydata w tym zestawie nie dowodzi, że żaden inny historycznie lub projektowo możliwy gabinet nie istnieje. Pełny generator zachowuje pozostałe odblokowane konfiguracje §8.6–8.7.
- Przedsięwzięcie jest testowym **publicznym** instrumentem kredytowym z uprawnioną instytucją i Skarbem jako finansującym. Zgoda prywatnych pożyczkodawców nie została zasymulowana ani założona dla pożyczki.
- Akt powołania, zakończenie wymaganej procedury prawnej i ciągła ważność umowy wojskowej w jej wariancie są jawnymi wejściami. Nie rozwiązujemy M05/M06/M08 tym kalkulatorem. Syntetyczna zdolność wojskowa wynosi 36,231; nie rozstrzygamy walk, tylko przejście do istniejącej sekwencji F.

**M02 pozostaje częściowo otwarte.** Krok 2 dostarcza określone przejścia i sprawdzoną zmianę gabinetu; pozostały kalibracja oraz pełne kampanie na różnych układach parlamentarnych.

Weryfikacja: 16 wariantów, zgodność wszystkich 59 ocen kroku 1, sprawdzenia sześciu niezależnych przeszkód rozpoczęcia próby, zachowania świadczeń przy pełnieniu obowiązków, jednokrotności podatku/impulsu oraz limitu jednej inicjatywy gabinetowej. Powtórzenie tych samych wejść daje identyczny ślad. `npm test`: **83/83**, bez błędów. `git diff --check`: poprawnie. Build i przeglądarka nie były potrzebne: brak zmian w `source/`, zasobach i `out/`.

Zmodyfikowane dokumenty: `docs/POLISH_TECHNICAL_REFERENCE.md`, `docs/POLISH_DESCRIPTIVE_GUIDE.md`, `docs/POLISH_MECHANICS_AUDIT.md`, `PLAN.md`, `MECHANICS_MAP.md`, `STATE_VARIABLES.md`, `TRANSITION_MATRIX.md`, `HISTORICAL_SOURCES.md`. Nowe materiały: niniejszy raport, `check.cjs`, `TRACES.md` i `results.json` w `analysis/m02-political-chain/`. Pozostałe zastane zmiany pozostawiono bez ingerencji.
