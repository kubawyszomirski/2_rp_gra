# M02, krok 1 — sprawdzenie czterech porozumień

21 września 2026. **Wynik: zgody założone w poprzednich przebiegach nie wszystkie przechodzą przez opisany algorytm.** Sprawdzono oferty, bez ponownego prowadzenia całych kampanii. Nie zmieniono gry ani wspólnego progu akceptacji 60.

Uruchomienie: `node analysis/m02-negotiations/check.cjs`. [Pełna tabela ocen](SCORES.md), [wejścia i wyniki](results.json), [kalkulator](check.cjs). Kalkulator wykonuje 59 ocen wraz z wariantami kontrolnymi; nie jest silnikiem polskiej gry.

## Co liczymy, a co jest wejściem

- Wzór, wagi, kara za naruszenia, brak premii doradcy w ocenie alternatyw i rozróżnienie nacisku od przekonywania pochodzą z technicznej referencji §8.3 i §9.8.
- Relacje przygotowanych PPS: Piast 53, NPR 54, PSChD 46; ZLN 25 w C i 5 w H. Są skutkiem zapisanych kontaktów z poprzedniego planu działań. H oznacza historyczne zamiary, nie historycznie odtworzone głosowania.
- Wiarygodność jest kontrolnie równa 50, nierozliczone naruszenia 0. Poprzedni test nie prowadził pełnego rejestru reputacji wobec każdego partnera. Nie dopisujemy PPS zasługi za wszystkie projekty obcych rządów. W szczególności wynik blisko 60 jest wrażliwy na rzeczywisty rejestr zobowiązań.
- Każda oferta ma program, konkretne żądania urzędowe lub wykonawcze i jawne alternatywy. Brak profilu jest błędem, a nie zgodą. Badane programy nie zawierają dodatkowych, nieistotnych tematów podnoszących dopasowanie.
- Dla prawicy badamy przygotowaną ofertę Piasta z Witosem: `fiscal=-1`, ziemia z odszkodowaniem `land=0`, PSChD otrzymuje Sprawiedliwość, ZLN Skarb. Relacje obu partii z Piastem wynoszą 60 według profilu testowego §8.6. Jej zgody sprawdzamy w punkcie 4. **Dostępność tej inicjatywy jest warunkiem testu, nie automatycznym wydarzeniem w listopadzie.** Osobno liczymy brak alternatyw; moment ich zgłaszania pozostaje krokiem 2.
- Alternatywą Piasta/NPR jest oferta dalszego zewnętrznego poparcia eksperta, `fiscal=0`, neutralna relacja z kandydatem 50 i uzgodnione warunki wykonania. Nie obdarzamy ich dodatkowym resortem.
- Brakowało profili osobowych Grabskiego i Skrzyńskiego. Uzupełnienia niżej mają status **P — dane syntetyczne do testu**, nie odtworzone poglądy lub historyczne relacje. Podobnie wariant NPR z resortem gospodarki jest propozycją konkretnej oferty.

To oblicza polityczną ocenę ofert. Prawna dostępność istniejących programów, osobowe mandaty do rozmowy i dostępność kandydatów są jawnymi warunkami. Nie przedstawiamy ich jako automatycznie zasymulowanych. Zgoda premiera na nowy podatek nie zastępuje głosowania ani zgody prywatnego finansującego.

## 1. Tolerowanie Grabskiego

P — profil osoby: preferencja `fiscal=+1`, bezpośrednia relacja z PPS 50, wiarygodność oferty 50; mandat do stabilizacji przy finansowanych osłonach, bez przekazania PPS ministerstw. Jest to konkretny adresat rozmowy, nie użycie znajomości PPS z Piastem jako zastępstwa relacji z premierem. Istnienie tego bezpośredniego kanału trzeba zapewnić sceną formowania; wcześniejszy przebieg tego nie liczył.

Oferta PPS: osłony i obciążenie majątku `fiscal=+2`. Alternatywa premiera: stabilizacja bez dodatkowej umowy z PPS, `fiscal=0`. W grudniowym punkcie testowym jedna dymisja i kryzys walutowy dają `crisisCooperation=15`.

| Sprawdzenie | Wynik |
|---|---|
| Ocena premiera przy przygotowanym aparacie i związku | **68,17 — zgoda warunkowa** |
| Ta sama oferta bez wymaganego aparatu lub zasięgu | Odmowa dostępu mimo wysokiej oceny |
| Ta sama oferta bez wykonalnego finansowania | Odmowa mimo wysokiej oceny |
| Wrażliwość: preferencja premiera `fiscal=0` zamiast +1 | **58,44 — odmowa**; brakujący profil ma rzeczywiste znaczenie |
| Poparcie nowego pakietu podatkowego przez Piast / NPR | **56,94 / 56,94 — odmowa** przy testowej neutralnej relacji z wnioskodawcą |
| Poparcie tego pakietu przez PSChD | **49,17 — odmowa** |

Prognoza osłony **+1,84 B** w starym przebiegu zakładała przyjęcie progresji i podatku majątkowego. Nie jest pieniędzmi dostępnymi przed uchwaleniem tych instrumentów. Dotychczasowych 238 posłów tolerujących eksperta nie wolno automatycznie zaliczać do poparcia nowego pakietu finansowego.

**Wniosek:** można uzyskać zgodę premiera, ale poprzedni przebieg nie dowiódł uchwalenia osłon z takim finansowaniem. Pragmatyczna korekta: przed wykonaniem pakietu sprawdzać konkretnych jego zwolenników. Po odmowie pozostaje już istniejący wariant pożyczki/ograniczenia cięć albo tolerancja bez wynegocjowanej osłony. Nie dodajemy darmowej rozmowy ani nowej karty. Pożyczka wymaga osobno kredytu ≥40, finansującego i rozliczenia późniejszego kosztu; ten raport nie ogłasza jej automatycznie zaakceptowaną alternatywą.

## 2. Wejście PPS do Skrzyńskiego

Pierwszy problem jest prosty: **PPS i NPR preferują Pracę**. Przy literalnym wymaganiu tego resortu przez obie partie oferta jest sprzeczna. Samo usunięcie progu relacji nie naprawia obsady.

P — przetestowana konkretna alternatywa dla NPR: **Gospodarka + zapisane pełne osłony i samodzielność związków**, zamiast Pracy. Pozostały podział: PPS Praca, Piast Rolnictwo, PSChD Sprawiedliwość, ZLN Skarb. Każdy portfel ma jednego właściciela. Nie zakładamy, że NPR zaakceptuje dowolny inny resort w każdej koalicji.

Program ratunkowy `fiscal=0`: pełne uzgodnione osłony, finansowanie oraz późniejszy przegląd. P — osobowy profil Skrzyńskiego `fiscal=0`, relacja 50, wymaga udziału PPS i finansowanego minimum; otrzymuje 74,44 i przyjmuje kandydaturę. To nie zastępuje zgód partii.

| Oferta po usunięciu konfliktu resortów | ZLN | Cała oferta |
|---|---:|---|
| C, istniejące kontakty, przygotowana alternatywa Witosa | **59,65** | Odmowa ZLN |
| H, istniejące kontakty, ta sama alternatywa | **54,65** | Odmowa ZLN |
| C + jeden dodatkowy kontakt z ZLN: relacja 25→29 | **60,65** | Wszyscy partnerzy przyjmują |
| H + kontakt 5→9 + istniejąca akcja koalicyjna Daszyńskiego (+5) | **60,65** | Wszyscy partnerzy przyjmują |
| H bez żadnej dostępnej alternatywy partnerów | **62,50** | Wszyscy partnerzy przyjmują |

Kryzys kredytowy otwiera tę ofertę, ale w obecnym wzorze nie daje sam z siebie punktów `crisisCooperation`: bez upadków, wysokiego niezadowolenia ogólnokrajowego i kryzysu walutowego premia wynosi **0**. Jest to rzeczywisty wynik aktualnych reguł, nie dodano ukrytej premii za nazwę gabinetu.

**Wniosek:** wejście jest osiągalne istniejącymi działaniami. Nie potrzeba obniżać progu 60. Przygotowanie dodatkowego kontaktu i doradcy zmienia plan gracza; nie wolno dopisać tych efektów do poprzedniej kampanii za darmo. Bez potwierdzonego powołania Skrzyńskiego późniejsze wiersze jego przeglądu są tylko testem warunkowym.

## 3. Kompromis zachowujący osłony

Oceniamy ten sam wykonalny program `fiscal=0` i przygotowaną prawicową alternatywę. Budżet z archiwalnego kwietniowego punktu C wynosi około −0,66 B, mieści się więc w dozwolonym zakresie. Nie dodajemy podatku, drugiej osłony ani ponownego bonusu Daszyńskiego. Bramki ZLN ≥25 i PSChD ≥45 pozostają warunkami rozmowy.

| Sposób rozmowy z ZLN | Wynik |
|---|---:|
| Wynegocjować warunek, relacja 25 | **59,65 — odmowa** |
| Wynegocjować warunek, relacja 29 po jednym kontakcie | **60,65 — zgoda** |
| Przekonywać bez groźby odejścia, relacja 25 | **57,50 — odmowa** |
| Przekonywać, relacja 37 po trzech kontaktach | **60,50 — zgoda** |

Pozostali partnerzy przyjmują te sprawdzone warianty. W H relacja ZLN 5 nie spełnia nawet bramki kompromisu. Ewentualny kontakt użyty do powołania koalicji utrzymuje swoją zmianę relacji; **nie trzeba kupować go drugi raz** do przeglądu, jeśli relacja po drodze nie spadła. Jednorazowy bonus doradcy do formowania nie przechodzi natomiast na przegląd.

**Wniosek:** relacje mają właściwą strategiczną funkcję, a przekonywanie jest trudniejsze od uzależnienia dalszego poparcia od ustępstwa. Poprzednią automatyczną zgodę w C należy zastąpić tym rachunkiem. Wynik blisko progu nie uzasadnia strojenia całego systemu pod jeden syntetyczny przebieg.

## 4. Oferta Witosa po rozpadzie wspólnego minimum

Piast zgłasza własną konkretną ofertę, ze wskazanym programem i obsadą. Nie liczymy go jako negocjującego z samym sobą; podobnie nie liczymy PPS jako partnera własnej oferty. PSChD i ZLN oceniają porozumienie z Piastem, a nie stosunki z PPS.

- PSChD: **73,54 — zgoda**; ZLN: **73,54 — zgoda**. Obie oceny uwzględniają alternatywę dalszego tolerowania eksperta.
- W syntetycznym Sejmie Piast 70 + PSChD 60 + ZLN 100 daje **230 za zmianą, 214 przeciw**, przy zadeklarowanym głosowaniu wszystkich pozostałych przeciw.
- Jeżeli 10 posłów Piasta pozostaje poza porozumieniem: **220:224 — zmiana nie przechodzi**. Nie zakładamy automatycznego powrotu dziesięciu posłów, którzy odpadli w grudniu 1923; ich ponowne pozyskanie jest wejściem wymagającym rozstrzygnięcia w pełnej kampanii.

**Wniosek:** Witos jest politycznie wykonalną alternatywą, kiedy Piast rzeczywiście ją zgłosi i ma zadeklarowane głosy. Wyjście PPS samo tego nie powoduje. Podanie tych samych 230 mandatów bez sprawdzenia deklaracji byłoby powtórzeniem błędu wcześniejszego testu.

## Co można zamknąć po tym kroku

Sprawdzono cztery wskazane porozumienia oraz wskazano konkretne miejsca zastąpienia zgód wpisanych na sztywno. Przetestowano niewielkie uzupełnienie oferty resortowej NPR i użycie istniejących kontaktów/doradcy. Nie dodano systemu negocjacyjnych rund, nowych walut ani bonusu wymuszającego historyczny wynik.

**M02 pozostaje otwarte.** Następny krok musi dostarczyć rzeczywiste momenty pojawiania się alternatyw, poparcie dla finansowania, rejestr zobowiązań i deklaracje posłów. W szczególności pełny przebieg musi odgałęzić się po odmowie Grabskiego/finansujących albo po nieudanym formowaniu koalicji, zamiast zachować późniejsze skutki fikcyjnej zgody. Kalibracja terminu zamachu i ponowne cztery kampanie pozostają poza tym krokiem.

Weryfikacja: kalkulator kończy się poprawnie, sprawdza m.in. brak profilu, odmowę mimo wysokiej punktacji, wpływ alternatywy, brak wielokrotnej premii doradcy i utratę większości. Archiwalnych wyników wcześniejszych przebiegów nie nadpisano. Profile P nie są nowymi źródłami historycznymi.

Sprawdzono również niezmienność 281 miesięcznych wierszy pierwotnych przebiegów i 272 wierszy rewizji 0.13. `npm test`: **83/83**, bez błędów; `git diff --check`: poprawnie. Build i przeglądarka nie były potrzebne: zmiany obejmują dokumentację i oddzielny kalkulator, bez `source/`, zasobów ani `out/`.
