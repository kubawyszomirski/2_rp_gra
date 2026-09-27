# Katalog kart do kodowania — referencja 0.32

26 IX 2026. Powstał szkic [katalogu kart](../../docs/POLISH_CARD_CATALOGUE.md): jedna tabela na każdą kartę, działanie agendy i wydarzenie. Razem z nim użytkownik zatwierdził dwie reguły kart stanowisk. Skrypt sprawdza, czy katalog wiernie powtarza referencję. Nie jest to symulacja kampanii.

Uruchomienie: `node analysis/card-catalogue/check.cjs`. Pliki: [kalkulator](check.cjs) i [wyniki z hashami dokumentów](results.json).

## Zatwierdzone decyzje

- **Wzór:** nagłówek karty, tabela opcji i otwarte pytania. Katalog zawiera tylko nazwy kart i opcji, bez pełnych tekstów dla gracza.
- **Osobny plik** `docs/POLISH_CARD_CATALOGUE.md`. Katalog nie tworzy reguł; przy rozbieżności obowiązuje referencja.
- **Wszystkie partie od razu**, jako szkic do przeglądu. Kolejność zaczyna się od kart stanowisk.
- **Obecna linia:** w ośmiu kartach stanowisk obecnej linii nie wybiera się ponownie, a zamknięcie karty jest bezpłatne (10.5, 10.10, 21.1).
- **Profil testowy frakcji** `faction_stance_profile_v1`: Piłsudczycy odrzucają sprzeciw wobec ingerencji wojska, a Centrum — poparcie wpływu Piłsudskiego (10.5). Pozostałe karty stanowisk nie mają reakcji frakcji. Historyczne stanowiska frakcji: **TBD — historical research required**.

## Co zawiera katalog

| Partia | Rozdział katalogu | Pozycje | Otwarte pytania |
|---|---|---:|---:|
| 1. Stanowiska partii | 4 | 8 | 0 (przejrzana w 0.33) |
| 2. Zasoby i organizacje partii | 5 | 10 | 0 (przejrzana w 0.34) |
| 3. Relacje, program, jedność i doradcy | 6 | 8 | 0 (przejrzana w 0.35) |
| 4. Karty parlamentarne | 7 | 10 | 0 (przejrzana w 0.36) |
| 5. Karty rządowe | 8 | 16 | 0 (przejrzana w 0.37) |
| 6. Wydarzenia i sekwencje | 9 | 17 | 0 (przejrzana w 0.38) |
| **Razem** | | **69** | **0** (w 0.32: 45) |

49 pozycji ma nagłówek karty z talii albo agendy, a 20 — nagłówek wydarzenia. Rozdział 10 katalogu dzieli pytania na sześć rodzajów, m.in.:
- płatne opcje bez skutku;
- reakcje frakcji bez profilu;
- działania bez ID albo karty;
- brakujące liczby;
- sprzeczne zapisy referencji.

## Wyniki sprawdzenia

- **Pokrycie.** Każdy identyfikator z referencji ma miejsce w katalogu:
  - rodziny talii partyjnej (10.5): 15, a od 0.35 16, bo zmiana doradców jest osobną kartą;
  - 10 kart parlamentarnych (17.10);
  - 16 kart rządowych (17.11);
  - wszystkie działania z 17.2, wydarzenia z 17.3 i powiązania z 17.9;
  - 22 akcje doradców (10.4.3).
- **Wzór.** Każda pozycja ma:
  - nagłówek z wymaganymi polami w stałej kolejności;
  - tabelę opcji z pięcioma kolumnami;
  - wiersz „Otwarte pytania”.
- **Statusy.** Kolumna statusu zawiera tylko K, Z, P, H, B, „—” albo odsyłacz do pytania.
- **Źródła.** Każda sekcja z wiersza „Źródła i testy” istnieje w rozdziałach 1–22 referencji, a każdy test w cudzysłowie — w tabeli 21.1.
- **Kod.**
  - Każdy wymieniony plik z `source/` istnieje.
  - Gdzie katalog pisze „Brak sceny z tym ID”, tego identyfikatora rzeczywiście nie ma w `source/`.
- **Koszty.** 48 porównań z 17.2 (w 0.32 było 43, bo tabela 17.2 urosła o nowe działania): każdy koszt w T i R oraz każde odnowienie z 17.2 występuje w katalogu przy tym działaniu.
- **Reguły 0.32.**
  - W kartach stanowisk każda opcja jest zablokowana jako „to obecna linia”.
  - Profil frakcji jest zapisany w katalogu i w 10.5.
  - 10.10 i 21.1 zmieniono zgodnie z decyzją.
- **Spis i grupy pytań.** Spis w rozdziale 3 i grupy w rozdziale 10 zgadzają się z pozycjami: każda karta z pytaniami jest w jakiejś grupie.

## Partia 1 — przegląd użytkownika, referencja 0.33

Użytkownik przyjął propozycje dla wszystkich dziewięciu pytań kart stanowisk. W sprawie Bundu wybrał wariant A. Pytań jest teraz 36; partia 1 nie ma żadnego.

| Karta | Rozstrzygnięcie |
|---|---|
| Kierunek polityczny | Działa przez kampanie i nastawienie organizacji; oferty ocenia się po treści |
| Główny przeciwnik | Prawica narodowa to ZLN. Obrońcy kapitału i ziemiaństwa to partie z ideałami `fiscal` i `land` ≤ −1, dziś PSChD i ZLN. Przemoc przeciw konstytucji to partia z otwartą sprawą przemocy. Bez adresata kampania polemiczna jest zablokowana |
| Wpływ Piłsudskiego | Linia ogranicza ustępstwa, ale nie jest warunkiem karty 16.7 |
| Jakiej władzy chcemy | Arbitraż prezydenta PPS przygotowuje tylko przy linii silniejszej prezydentury |
| Charakter partii | Rozbudowa to każde podniesienie zasięgu branży albo komórek; prasa się nie liczy. Uwaga o słabych wariantach przeszła do pracy organizacyjnej (5.7) |
| Mniejszości słowiańskie | Ideały testowe na osi autonomii: ZLN −2, pozostałe mniejszości +1, reszta 0 |
| Współpraca żydowska | Bund jest organizacją, nie partią; zaufanie na starcie 50 |
| Model sowiecki | Potępienie nie wywołuje reakcji frakcji |

Skrypt sprawdza te reguły w referencji (5.5, 7.6, 8.6, 10.5–10.8, 10.10, 16.7) i osiem nowych testów w 21.1. Dwie rzeczy liczy sam:
- adresatów „obrońców kapitału i ziemiaństwa” z profili 8.6 — wychodzą PSChD i ZLN;
- odległości na osi autonomii dla oferty praw kulturalnych — ZLN 2, mniejszości 1.

## Partia 2 — przegląd użytkownika, referencja 0.34

Użytkownik przyjął wszystkie osiem propozycji dla dziesięciu pytań partii 2. Pytań jest teraz 26; partie 1 i 2 nie mają żadnego.

| Karta | Rozstrzygnięcie |
|---|---|
| Organizacje PPS, Składki | Bez płatnych opcji bez skutku; zamknięcie karty bez wyboru nic nie kosztuje |
| Organizacje PPS, Milicja | Pierwsza militaryzacja: Centrum +3 sprzeciwu. Kierunek pochodzi z obecnego kodu karty Milicji |
| Media i kampania | Bez własnego odnowienia; obejmuje kampanię mobilizacyjną i śledztwo prasowe |
| Kroki sprawy związkowej | Zebranie o linii politycznej ma ID `union.align` |
| Praca organizacyjna | +2 zasięgu jednej branży albo komórkom jednej wybranej klasy; bez prasy i TUR |
| Spółdzielnie | Bez osobnego limitu liczby |

Skrypt sprawdza te reguły w referencji (4.4, 10.5, 12.4, 13.1, 13.3, 13.5, 14.1, 17.2) i cztery nowe testy w 21.1. Dodatkowo:
- liczy zysk pracy organizacyjnej przy premii charakteru partii: 2 × 1,10 = 2,2;
- sprawdza w obecnym kodzie Milicji, że militaryzacja podnosi tam sprzeciw Centrum.

## Partia 3 — przegląd użytkownika, referencja 0.35

Użytkownik przyjął wszystkie osiem propozycji dla ośmiu pytań partii 3. Ocenę sił bezpieczeństwa najpierw chciał usunąć, ale ostatecznie przyjął propozycję. Pytań jest teraz 18; partie 1–3 nie mają żadnego.

| Karta | Rozstrzygnięcie |
|---|---|
| Program gospodarczy | Tego samego zestawu nie da się zatwierdzić ponownie; zamknięcie karty nic nie kosztuje |
| Jedność i kierownictwo | Bez zwykłego „utrzymać linię”. Dwa kompromisy: ustępstwo dla frakcji (1 T, 1 R, 3 M; sprzeciw −8) albo linia współpracy z KPP (1 T, 6 M; +15 zgody w każdej frakcji). Odroczenie daje 3 M bez E3. Karta tylko przy sprzeciwie ≥30 albo otwartym kanale z KPP |
| Zmiana doradców | Osobna karta, 1 T, odnowienie 6 M |
| Stosunki z partiami | Opcja „Otworzyć kontakt z KPP” (`kpp.contact`); pierwsza rozmowa od następnego miesiąca |
| Współpraca z KPP | Stała pozycja agendy z krokami `kpp.trial`, `kpp.rules`, `kpp.agreement` |
| Ocena sił bezpieczeństwa | Stałe działanie agendy, 1 T, 1 R, odnowienie 3 M |

Skrypt sprawdza te reguły w referencji (9.5, 10.2, 10.4.2, 10.5, 16.8.1, 17.2) i siedem nowych testów w 21.1. Dodatkowo liczy:
- przedział rozpoznania po kolejnych ocenach: 30 → 20 → 10 → 5 punktów;
- zgodę frakcji po kompromisie w sprawie KPP: 50 → 65, powyżej progu 60.

## Partia 4 — przegląd użytkownika, referencja 0.36

Użytkownik przyjął wszystkie siedem propozycji: sześć pytań partii 4 i jeden problem znaleziony przy okazji. Pytań jest teraz 12; partie 1–4 nie mają żadnego.

| Karta | Rozstrzygnięcie |
|---|---|
| Stosunek do rządu | „Utrzymać poparcie” tylko jako odpowiedź na ostrzeżenie albo ultimatum |
| Kontrola wojska | Bez płatnych „wyjaśnień ministra” i „odłożenia”. Ograniczona reforma: kompromis w sprawach wojska, +0,025 lojalności, 1 B przez 2 M |
| Budżet | Opcje korzystają z narzędzi 11.9: podatek progresywny albo majątkowy, krajowa pożyczka |
| Budżet, Reforma konstytucyjna, Kontrola wojska | Bez odnowienia; odrzuconej oferty nie ponawia się bez zmiany |
| Porozumienie wyborcze | Lewica +3 tylko przy liście, która rezygnuje z programu robotniczego, czyli wcześniejszym Centrolewie |
| Tworzenie gabinetu | Impas po trzech nieudanych propozycjach: gabinet pełniący obowiązki |

Skrypt sprawdza te reguły w referencji (6.5, 8.7, 9.8, 12.4, 16.3, 17.10) i siedem nowych testów w 21.1. Dodatkowo:
- liczy z profili 8.6, że ograniczona reforma nigdy nie jest trudniejsza do przyjęcia niż pełny nadzór; dla Piasta, NPR i chadecji odległość spada z 2 do 0;
- sprawdza w tabeli list 6.5, że tylko wcześniejszy Centrolew zastępuje punkty programu robotniczego „minimum społecznym”.

## Partia 5 — przegląd użytkownika, referencja 0.37

Użytkownik przyjął wszystkie dziewięć propozycji: osiem pytań partii 5 i jeden problem znaleziony przy okazji, czyli płatne opcje bez skutku. Zostały 4 pytania, wszystkie w partii 6; partie 1–5 nie mają żadnego.

| Karta | Rozstrzygnięcie |
|---|---|
| Świadczenia, Stabilizacja, Przemysł, Sprawiedliwość, Wojsko, Wawel | Bez płatnych opcji utrzymania, odłożenia i pozostawienia sprawy właścicielom; zamknięcie karty nic nie kosztuje |
| Prawa pracownicze | Układ zbiorowy 0 B, bo płaci pracodawca. Odstępstwo 0 B; presja kapitału −4, niezadowolenie objętych pracowników +3; wygasa w terminie |
| Świadczenia | „Rozszerzyć”: zasięg +1, najwyżej 3, każdy poziom +2 B. „Skupić”: połowa odbiorców z pełną ulgą za 1 B |
| Polityka finansowa | Usprawnienie poboru (`government.collection`) należy do tej karty. Nowe opcje: „obciążyć szerokie grupy” (podatki pośrednie, szersza podstawa podatku albo cła) i „finansowanie z emisji” |
| Kapitał na inwestycje | Fundusz publiczny płaci całość. Banki: połowa kosztu budowy, zgoda banków przy kredycie ≥40, presja kapitału −8, zasługa dzielona. Spółdzielnie: pełny koszt, kredyt dla gospodarstw i małych zakładów |
| Polityka wobec przemysłu | Ratunek zakładu to wariant warunkowego kredytu |
| Polityka oświatowa | Szkoła świecka bez reakcji frakcji; zostaje naruszenie umowy z partnerem |
| Policja | Śledztwo: 1 T i 1 B przez 1 M. Potwierdzone przypisuje sprawę partii, która staje się adresatem linii „przemoc przeciw konstytucji” |

Skrypt sprawdza te reguły w referencji (10.6, 11.9, 12.7, 12.8, 17.2, 17.11, 17.12) i dziewięć nowych testów w 21.1. Dodatkowo liczy:
- koszty osłon z 12.4: zasięg 2 kosztuje 2 + 2 = 4 B, a skupienie połowę, 1 B;
- wariant bankowy funduszu: połowa kosztu budowy instrumentu kredytowego z 12.4 (2 B → 1 B), próg kredytu 40 z krajowej pożyczki (11.9) i −8 presji za wykonane porozumienie (11.7).

Skrypt sprawdzono też odwrotnie: na kopiach dokumentów sprzed partii 5 kończy się błędem.

Przy okazji wiersz karty 6 w 17.10 powtarza teraz regułę 0.36: „utrzymać poparcie” tylko w odpowiedzi na ostrzeżenie albo ultimatum partnera. Reguła się nie zmienia.

## Partia 6 — przegląd użytkownika, referencja 0.38

Użytkownik przyjął wszystkie pięć propozycji: cztery pytania partii 6 i jeden problem znaleziony przy okazji. Katalog nie ma już otwartych pytań.

| Karta | Rozstrzygnięcie |
|---|---|
| Część frakcji grozi odejściem (E3) | ID `party.faction_split`: jedna karta dla wszystkich frakcji, kluczem sprawy jest `case_id` |
| Uczestnicy odrzucają ugodę (E6) | ID `society.strike_settlement_rejection`, kluczem sprawy jest para strajk + ugoda |
| Krytyka parlamentu przez Piłsudskiego | Odpowiedź obowiązkowa w miesiącu wystąpienia, bez opcji „milczeć”. Linii PPS przeczy tylko poparcie krytyki przy linii parlamentaryzmu: ostrzeżenie i Centrum +3 |
| Mobilizacja po zabójstwie prezydenta | Odpowiedź obowiązkowa, jak już podawała referencja w 17.9 |
| Oszczędności i przegląd osłon | Wiersz 17.3 podaje cztery odpowiedzi karty Stosunek do rządu, tak jak 17.13 i 17.16.4 |

Skrypt sprawdza te reguły w referencji (10.2, 10.7, 14.5, 17.3, 17.15) i pięć nowych testów w 21.1. Dodatkowo:
- liczy łączną reakcję Centrum z tabeli 10.7: +5 za samą odpowiedź i +3 za sprzeczność, razem +8;
- sprawdza, że dozwolone połączenia stanowisk pochodzą z przykładów w przewodniku;
- sprawdza, że nowe ID nie występują jeszcze w `source/`.

Na kopiach dokumentów sprzed partii 6 skrypt kończy się błędem.

## Kategorie kolejki — referencja 0.39

Siedem wydarzeń nie miało w referencji kategorii kolejki; katalog przypisał je sam na podstawie opisu 4.5 (dopisek „wniosek z 4.5”). Użytkownik zatwierdził je bez zmian, a referencja zapisuje je teraz w tabeli 4.5. Kategoria decyduje tylko o kolejności wydarzeń należnych w tym samym miesiącu.

| Wydarzenie | Kategoria |
|---|---|
| Kryzys gabinetowy 1922 | 2 — sukcesja |
| Krytyka parlamentu przez Piłsudskiego | 6 — tło |
| Zagrożenie prezydenta | 2 — sukcesja |
| Mobilizacja po zabójstwie prezydenta | 5 — kryzys, po obsłużeniu wakatu |
| Kult Niewiadomskiego | 6 — tło |
| Uczestnicy odrzucają ugodę (E6) | 1 — część trwającego strajku |
| Oszczędności 1926 | 4 — termin przeglądu |

Skrypt sprawdza, że:
- katalog podaje przy każdym z tych wydarzeń tę samą kategorię co tabela 4.5 i nie ma już dopisku „wniosek z 4.5”;
- każde wydarzenie katalogu ma kategorię 1–6 albo opisane miejsce w sekwencji strajku;
- kolejność z nowego testu w 21.1 wynika z tabeli: E6, potem przegląd oszczędności, na końcu krytyka parlamentu.

Na kopiach dokumentów sprzed tej zmiany skrypt kończy się błędem. Użytkownik odłożył na później badania historyczne pięciu punktów `TBD — historical research required`.

## Granice

- Skrypt porównuje koszty tylko z tabelą 17.2. Koszty kart parlamentarnych, rządowych i wydarzeń opisane w innych sekcjach sprawdza przegląd użytkownika.
- Wszystkie pytania katalogu są rozstrzygnięte. Przy rozbieżności nadal obowiązuje tekst referencji.
- Pięć punktów oznaczonych `TBD — historical research required` czeka na badania, które użytkownik odłożył na później. Do tego czasu gra używa oznaczonych wartości testowych.
- Pole „Obecny kod” opisuje dzisiejsze pliki. Niemieckie karty trzeba wyłączyć przy przejęciu domeny (20.2).
- Kod gry, zależności i metadane scenariusza bez zmian.
