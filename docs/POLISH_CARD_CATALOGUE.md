# Polska wersja: katalog kart do kodowania

**Stan — referencja 0.52, 4 października 2026. Wszystkie partie przejrzane; brak otwartych pytań; wszystkie karty wdrożone (etapy 0–8 planu implementacji); teksty kart mają też wersję polską (referencja 23.23); obecną linię kart stanowisk, Składek i Programu gospodarczego można potwierdzić (referencja 23.24); doradcy występują w grze jako Centralny Komitet Wykonawczy (referencja 23.25).** Katalog zbiera w jednym miejscu to, co [referencja techniczna](POLISH_TECHNICAL_REFERENCE.md) mówi o każdej karcie i wydarzeniu pierwszego rozdziału. Jest ściągą do kodowania: jedna tabela na kartę. Katalog powstał w całości w wersji 0.32. Wszystkie sześć partii użytkownik przejrzał w 0.33–0.38. Rozstrzygnięte pytania pogrupowano w rozdziale 10.

## 1. Jak czytać katalog

- **Katalog nie tworzy reguł.** Każda liczba pochodzi z sekcji referencji wskazanej w wierszu „Źródła i testy”. Gdy katalog i referencja się różnią, obowiązuje referencja. Skrypt [`analysis/card-catalogue/check.cjs`](../analysis/card-catalogue/check.cjs) wykrywa rozbieżności kosztów i odnowień oraz brakujące karty.
- **Kolejność wdrażania:** etap, w którym powstaje każda karta, podaje [plan implementacji](POLISH_IMPLEMENTATION_PLAN.md), dodatek A.
- **Oznaczenia** są takie jak w rozdziale 1 referencji: K — kod, Z — zatwierdzone, P — propozycja do testów, H — historia ze źródła, B — potrzebne badanie (`TBD — historical research required`). „Z / P” oznacza: opcja zatwierdzona, liczby do testów.
- **Jednostki:**
  - T — czas: 1 T to jedyna główna akcja miesiąca, 0 T to krok tej samej sprawy albo obowiązkowa odpowiedź;
  - R — środki PPS;
  - B — punkt budżetu państwa, czyli obciążenie, nie wydatek z kasy;
  - M — miesiąc;
  - „cd” — odnowienie liczone od zatwierdzenia, nie od obejrzenia.
- **Obecny kod** opisuje pliki, które dziś są w `source/` (K). Nazwa niemieckiej sceny oznacza tylko, że dotyczy tego samego tematu. Przy przejęciu domeny jej stare skutki trzeba wyłączyć według 20.2.
- **Nagłówek karty z talii** ma pola: Talia i pula, Dostęp, Koszt, Limit wyboru, Odnowienie, Wyjątek, Zapisuje, Odczytują, Co zostaje po karcie, Obecny kod, Źródła i testy. Odpowiadają one polom `ActionDefinition` z 17.1.
- **Nagłówek wydarzenia** ma pola: Rodzaj, Wyzwalacz, Okno, Kolejka, Powtarzalność, Koszt odpowiedzi, Bez odpowiedzi, Zapisuje, Odczytują, Co zostaje po karcie, Obecny kod, Źródła i testy. Odpowiadają one `EventDefinition` z 17.3 i kolejce z 4.5.
- **Tabela opcji** ma kolumny: Opcja (ID), Zablokowana, gdy, Skutek od razu, Skutek później, Status.
- **Otwarte pytania** to luki i sprzeczności znalezione przy wypełnianiu. Nie są rozstrzygnięte; do czasu decyzji obowiązuje tekst referencji.

## 2. Wspólne zasady wszystkich kart

Z 4.3, 4.4 i 17.1 referencji; dotyczą każdej karty poniżej i nie są powtarzane w tabelach.

- **Ręka:** łącznie trzy miejsca, nie trzy na talię. Gracz wybiera talię, a silnik losuje jedną z N legalnych kart z prawdopodobieństwem 1/N. Przy N=0 dobieranie jest niedostępne z podanym powodem.
- **Legalność karty:** aktywny polski manifest, dostępna data, brak wyczerpania wizyt, spełnione `view-if`, brak tej samej instancji w ręce i upłynięte odnowienie. `choose-if` sprawdza konkretną opcję jeszcze raz w chwili użycia.
- **Koszt dopiero po zatwierdzeniu:** oglądanie i anulowanie są bezpłatne. Transakcja `ActionTxn` przechodzi `preview → committed → settled`. Po zatwierdzeniu „powrót” jest tylko nawigacją.
- **Odrzucanie:** jedno dobrowolne odrzucenie karty na miesiąc jest darmowe. Karta, która przestała być ważna, znika bez skutku i bez zwrotu.
- **Odnowienie** zapisujemy jako datę: `available_at = t + cd`. Nie zmniejszamy go przy każdym wejściu do `post_event`.
- **Poza ręką:** projekty i obowiązkowe odpowiedzi są w agendzie. Ich wykonanie kosztuje akcję, chyba że są odpowiedzią w trwającym wydarzeniu (0 T). Kroki projektu to `project.prepare` i `project.launch` (12.2): mała reforma 1 T wdrożenia, duża 1 T przygotowania i 1 T wdrożenia. Głosowania ustaw rozlicza wewnętrzne `parliament.bill` (7.2), bez osobnego menu.
- **Doradca** może zastąpić koszt czasu jednego wskazanego kroku (0 T i wspólne odnowienie doradców). Nie płaci R ani B i nie zastępuje prawa ani wykonawcy.
- **Nazwa doradców w grze (Z — 0.52):** gracz widzi ich jako Centralny Komitet Wykonawczy PPS (CKW; ang. Central Executive Committee), a jedną osobę jako członka CKW. Katalog zachowuje termin techniczny „doradca”.
- **Podakcje z 17.2** nie są osobnymi kartami do losowania. Mają jedno ID, jeden koszt i jedno odnowienie niezależnie od drogi wejścia.
- **Pula, agenda, wydarzenie:** „pula” to zwykły dobór, „agenda” daje gwarantowany dostęp po otwarciu sprawy, „wydarzenie” pojawia się po wyzwalaczu.
- **Stanowiska (Z — 0.51, zastępuje Z — 0.32):** obecną linię można potwierdzić. Kosztuje to akcję miesiąca (1 T) i zwykłe odnowienie karty, ale nic więcej nie zmienia: bez premii, reakcji frakcji i wpisu w historii linii. Tak samo działają „Utrzymać” w Składkach i ten sam zestaw w Programie gospodarczym. Wyjście z karty bez działania nazywa się „Odłóż na rękę” (ang. „Return to hand”, dawniej „Close card”) i nic nie kosztuje. Karty Organizacje, Jedność, Stosunek do rządu, Kontrola wojska i karty rządowe od 0.34–0.37 nie mają płatnych opcji bez skutku.
- **Praca organizacyjna:** zawsze dostępne działanie `party.organize_without_funds` (5.7 katalogu) chroni przed utknięciem bez pieniędzy.
- **Wdrożenie (K, etap 1, 0.42):** dobieranie i odnowienia doradców działają już według tych zasad. Odziedziczone karty pobierają koszt przy otwarciu, ale zamknięcie z pierwszej strony cofa go w całości; darmowe odrzucenie daje karta „Discard a card”. Nowe karty z tego katalogu dostaną pełną transakcję.
- **Wdrożenie (K, etap 2, 0.43):** wybór marszałka (7.8), wybór prezydenta (7.9), wybory 1922 (9.3) i następne wybory (9.16) działają w kodzie. Karta 7.7 przeszła do etapu 3, bo zgoda partnerów wymaga oceny oferty i umów z tego etapu.
- **Wdrożenie (K, etap 3, 0.44):** rozmowy z partiami (6.1), tworzenie gabinetu (7.1), stosunek do rządu (7.6) i porozumienie wyborcze (7.7) działają w kodzie; trzy ostatnie leżą w nowej talii „Parliament”. Nowe karty zapisują jedną transakcję dopiero przy zatwierdzeniu. Karta 9.1 przeszła do etapu 7, bo wymaga relacji z Piłsudskim.
- **Wdrożenie (K, etap 4, 0.45):** ustawa D (7.2), karta Budżet (7.3), reforma konstytucyjna (7.4), trzynaście kart rządowych (8.1–8.11, 8.13, 8.16) i trzy wydarzenia gospodarcze (9.11–9.13) działają w kodzie. Karty rządowe trafiają do talii tylko przy resorcie PPS. Opcje zależne od systemów etapów 5–7 są widoczne i zablokowane z powodem. Stała karta „Agenda” uruchamia przygotowane duże programy i składa wnioski konstytucyjne. Odziedziczone niemieckie karty gospodarcze zostają w repozytorium, zablokowane warunkiem `not polish_economy_system`.
- **Wdrożenie (K, etap 5, 0.46):** osiem kart stanowisk (4.1–4.8), karty i pozycje partii (5.1–5.9), program gospodarczy, Jedność z czystką, zmiana doradców, akcje doradców i agenda współpracy z KPP (6.2–6.7) oraz karta E3 (9.10) działają w kodzie. Talia partyjna ma 16 kart manifestu, a zbiórka, aparat, praca organizacyjna, kursy TUR, spółdzielnie i kroki z KPP leżą w stałej karcie „Party Agenda”. Opcje zależne od etapów 6–7 są widoczne i zablokowane z powodem. Odziedziczone karty partyjne zostają w repozytorium, zablokowane warunkiem `not polish_party_rules`, a trzy dawne sceny kryzysu frakcji nie trafiają do kolejki.

## 3. Spis kart

Liczba w ostatniej kolumnie to otwarte pytania przy karcie. Razem: 69 pozycji i 0 pytań.

| Nr | Karta | ID | Pytania |
|---|---|---|---:|
| 4.1 | [Kierunek polityczny](#41-kierunek-polityczny--partydirection) | `party.direction` | 0 |
| 4.2 | [Główny przeciwnik](#42-główny-przeciwnik--partymain_opponent) | `party.main_opponent` | 0 |
| 4.3 | [Wpływ Piłsudskiego](#43-wpływ-piłsudskiego--partypils_influence) | `party.pils_influence` | 0 |
| 4.4 | [Jakiej władzy chcemy](#44-jakiej-władzy-chcemy--partyform_of_power) | `party.form_of_power` | 0 |
| 4.5 | [Charakter partii](#45-charakter-partii--partyelectoral_base) | `party.electoral_base` | 0 |
| 4.6 | [Mniejszości słowiańskie: autonomia](#46-mniejszości-słowiańskie-autonomia--partyslavic_autonomy) | `party.slavic_autonomy` | 0 |
| 4.7 | [Współpraca z organizacjami żydowskimi](#47-współpraca-z-organizacjami-żydowskimi--partyjewish_cooperation) | `party.jewish_cooperation` | 0 |
| 4.8 | [PPS wobec modelu sowieckiego](#48-pps-wobec-modelu-sowieckiego--partyussr_position) | `party.ussr_position` | 0 |
| 5.1 | [Organizacje PPS](#51-organizacje-pps--partyorganizations) | `party.organizations` | 0 |
| 5.2 | [Milicja PPS](#52-milicja-pps--partymilitia) | `party.militia` | 0 |
| 5.3 | [Media i kampania](#53-media-i-kampania--partymedia) | `party.media` | 0 |
| 5.4 | [Składki](#54-składki--partydues) | `party.dues` | 0 |
| 5.5 | [Zbiórka nadzwyczajna](#55-zbiórka-nadzwyczajna--partyfundraise) | `party.fundraise` | 0 |
| 5.6 | [Rozbudowa aparatu](#56-rozbudowa-aparatu--partyapparatus) | `party.apparatus` | 0 |
| 5.7 | [Praca organizacyjna](#57-praca-organizacyjna--partyorganize_without_funds) | `party.organize_without_funds` | 0 |
| 5.8 | [Kurs TUR](#58-kurs-tur--partytur_course) | `party.tur_course` | 0 |
| 5.9 | [Uruchomienie spółdzielni](#59-uruchomienie-spółdzielni--partycooperative) | `party.cooperative` | 0 |
| 5.10 | [Kroki sprawy związkowej](#510-kroki-sprawy-związkowej--unionprepare-unionalign-unionmediate-unionstrike) | `union.prepare`, `union.align`, `union.mediate`, `union.strike` | 0 |
| 6.1 | [Stosunki z partiami](#61-stosunki-z-partiami--partyoutreach) | `party.outreach` | 0 |
| 6.2 | [Program gospodarczy](#62-program-gospodarczy--partyeconomic_program) | `party.economic_program` | 0 |
| 6.3 | [Jedność i kierownictwo](#63-jedność-i-kierownictwo--partyunity) | `party.unity` | 0 |
| 6.4 | [Usunięcie części frakcji](#64-usunięcie-części-frakcji--partyfaction_expulsion) | `party.faction_expulsion` | 0 |
| 6.5 | [Zmiana doradców](#65-zmiana-doradców--partyadvisors) | `party.advisors` | 0 |
| 6.6 | [Akcje doradców](#66-akcje-doradców--advisor) | `advisor.*` | 0 |
| 6.7 | [Współpraca z KPP: agenda](#67-współpraca-z-kpp-agenda--kpptrial-kpprules-kppagreement) | `kpp.trial`, `kpp.rules`, `kpp.agreement` | 0 |
| 6.8 | [Ocena sił bezpieczeństwa](#68-ocena-sił-bezpieczeństwa--securityassess) | `security.assess` | 0 |
| 7.1 | [Tworzenie gabinetu i udział PPS](#71-tworzenie-gabinetu-i-udział-pps--parliamentcabinet_formation) | `parliament.cabinet_formation` | 0 |
| 7.2 | [Zabezpieczenie bezrobotnych, D1 i D2](#72-zabezpieczenie-bezrobotnych-d1-i-d2--parliamentlegislative_program) | `parliament.legislative_program` | 0 |
| 7.3 | [Budżet i koszty kryzysu](#73-budżet-i-koszty-kryzysu--parliamentfinance_amendment) | `parliament.finance_amendment` | 0 |
| 7.4 | [Reforma konstytucyjna](#74-reforma-konstytucyjna--parliamentconstitution_project) | `parliament.constitution_project` | 0 |
| 7.5 | [Parlamentarna kontrola wojska](#75-parlamentarna-kontrola-wojska--parliamentarmy_oversight) | `parliament.army_oversight` | 0 |
| 7.6 | [Stosunek do rządu](#76-stosunek-do-rządu--parliamentgovernment_support) | `parliament.government_support` | 0 |
| 7.7 | [Porozumienie wyborcze](#77-porozumienie-wyborcze--parliamentlist_agreement) | `parliament.list_agreement` | 0 |
| 7.8 | [Wybór marszałka](#78-wybór-marszałka--parliamentspeaker_election) | `parliament.speaker_election` | 0 |
| 7.9 | [Wybór prezydenta](#79-wybór-prezydenta--presidencyelection) | `presidency.election` | 0 |
| 7.10 | [Ugoda i reakcja na represje](#710-ugoda-i-reakcja-na-represje--parliamentstrike_response) | `parliament.strike_response` | 0 |
| 8.1 | [Prawa pracownicze](#81-prawa-pracownicze--governmentlabor_rights) | `government.labor_rights` | 0 |
| 8.2 | [Świadczenia i pomoc bezrobotnym](#82-świadczenia-i-pomoc-bezrobotnym--governmentsocial_welfare) | `government.social_welfare` | 0 |
| 8.3 | [Polityka finansowa](#83-polityka-finansowa--governmentfinance_package) | `government.finance_package` | 0 |
| 8.4 | [Stabilizacja waluty](#84-stabilizacja-waluty--governmentcurrency_stabilisation) | `government.currency_stabilisation` | 0 |
| 8.5 | [Kapitał na inwestycje](#85-kapitał-na-inwestycje--governmentinvestment_fund) | `government.investment_fund` | 0 |
| 8.6 | [Polityka wobec przemysłu](#86-polityka-wobec-przemysłu--governmentindustrial_policy) | `government.industrial_policy` | 0 |
| 8.7 | [Roboty publiczne](#87-roboty-publiczne--governmentpublic_works) | `government.public_works` | 0 |
| 8.8 | [Wykonanie reformy rolnej](#88-wykonanie-reformy-rolnej--governmentland_program) | `government.land_program` | 0 |
| 8.9 | [Modernizacja rolnictwa](#89-modernizacja-rolnictwa--governmentagriculture_development) | `government.agriculture_development` | 0 |
| 8.10 | [Polityka oświatowa](#810-polityka-oświatowa--governmenteducation_program) | `government.education_program` | 0 |
| 8.11 | [Prawa językowe i szkoły mniejszości](#811-prawa-językowe-i-szkoły-mniejszości--governmentminority_school_rights) | `government.minority_school_rights` | 0 |
| 8.12 | [Policja i bezpieczeństwo wewnętrzne](#812-policja-i-bezpieczeństwo-wewnętrzne--governmentinternal_security) | `government.internal_security` | 0 |
| 8.13 | [Wymiar sprawiedliwości](#813-wymiar-sprawiedliwości--governmentjustice_policy) | `government.justice_policy` | 0 |
| 8.14 | [Polityka wojskowa](#814-polityka-wojskowa--governmentmilitary_policy) | `government.military_policy` | 0 |
| 8.15 | [Porozumienie z Piłsudskim](#815-porozumienie-z-piłsudskim--governmentpils_agreement) | `government.pils_agreement` | 0 |
| 8.16 | [Wawel albo Zamek Królewski](#816-wawel-albo-zamek-królewski--governmentheritage_restoration) | `government.heritage_restoration` | 0 |
| 9.1 | [Kryzys gabinetowy 1922](#91-kryzys-gabinetowy-1922--openingcabinet_1922) | `opening.cabinet_1922` | 0 |
| 9.2 | [Krytyka parlamentu przez Piłsudskiego](#92-krytyka-parlamentu-przez-piłsudskiego--politicspils_parliament_criticism) | `politics.pils_parliament_criticism` | 0 |
| 9.3 | [Wybory do Sejmu 1922](#93-wybory-do-sejmu-1922--electionsejm_1922) | `election.sejm_1922` | 0 |
| 9.4 | [Zagrożenie prezydenta](#94-zagrożenie-prezydenta--presidencysecurity_crisis) | `presidency.security_crisis` | 0 |
| 9.5 | [Mobilizacja po zabójstwie prezydenta](#95-mobilizacja-po-zabójstwie-prezydenta--presidencyassassination_response) | `presidency.assassination_response` | 0 |
| 9.6 | [Kult Niewiadomskiego](#96-kult-niewiadomskiego--societyniewiadomski_cult) | `society.niewiadomski_cult` | 0 |
| 9.7 | [Współpraca z komunistami podczas strajku](#97-współpraca-z-komunistami-podczas-strajku--societystrike_communist_cooperation) | `society.strike_communist_cooperation` | 0 |
| 9.8 | [Strajki 1923 i Kraków](#98-strajki-1923-i-kraków--societystrike_1923) | `society.strike_1923` | 0 |
| 9.9 | [Uczestnicy odrzucają ugodę (E6)](#99-uczestnicy-odrzucają-ugodę-e6--societystrike_settlement_rejection) | `society.strike_settlement_rejection` | 0 |
| 9.10 | [Część frakcji grozi odejściem (E3)](#910-część-frakcji-grozi-odejściem-e3--partyfaction_split) | `party.faction_split` | 0 |
| 9.11 | [Stabilizacja](#911-stabilizacja--economystabilization) | `economy.stabilization` | 0 |
| 9.12 | [Kryzys kredytowy](#912-kryzys-kredytowy--economycredit_crisis) | `economy.credit_crisis` | 0 |
| 9.13 | [Oszczędności i przegląd osłon](#913-oszczędności-i-przegląd-osłon--cabinetausterity_1926) | `cabinet.austerity_1926` | 0 |
| 9.14 | [Powrót Chjeno-Piasta](#914-powrót-chjeno-piasta--cabinetchjeno_return_1926) | `cabinet.chjeno_return_1926` | 0 |
| 9.15 | [Zamach: sekwencja F](#915-zamach-sekwencja-f--coupattempt) | `coup.attempt` | 0 |
| 9.16 | [Następne wybory](#916-następne-wybory--electionsuccessor) | `election.successor` | 0 |
| 9.17 | [Sceny informacyjne G](#917-sceny-informacyjne-g--bez-id) | — | 0 |

## 4. Partia 1 — stanowiska partii

Osiem kart, którymi PPS ogłasza trwałą linię (10.5–10.10). Mają wspólny kontrakt: 1 T, 0 R, jeden wybór i zapis jednego pola w `S.actors.pps.strategy`. Karta sowiecka ma odnowienie 12 M, pozostałe 6 M.

**Reakcje frakcji — profil testowy `faction_stance_profile_v1` (Z — 0.32).** Zmiana na linię, którą profil frakcji odrzuca, daje tej frakcji +3 sprzeciwu, raz na decyzję. Przy zmianie kilku elementów naraz jest to najwyżej +8 (10.5). Profil jest zbudowany wyłącznie z tego, co dokumentacja już mówi:
- Piłsudczycy odrzucają `pils_influence=oppose_military_interference`;
- Centrum odrzuca `pils_influence=support`;
- karty „Jakiej władzy chcemy” i „PPS wobec modelu sowieckiego” mają tylko swoje reakcje szczególne z 10.8 i 10.10;
- pozostałe pięć kart nie ma odrzucanych wariantów. Historyczne stanowiska frakcji: badania 8f (`PL-PPS-CURRENTS-1922-1926`) dają mocne oparcie regule piłsudczyków i częściowe regule Centrum; stanowiska Lewicy przed 1926 r.: `TBD — historical research required`.

**Status partii:** przejrzana przez użytkownika 26 IX 2026; wszystkie pytania rozstrzygnięte w 0.33 (referencja 23.6).

### 4.1. Kierunek polityczny — `party.direction`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór | Z |
| Dostęp | Od stycznia 1922, bez dodatkowych warunków | P |
| Koszt | 1 T, 0 R, 0 B | P |
| Limit wyboru | 1 opcja | Z |
| Odnowienie | cd 6 M dla tej karty | P |
| Wyjątek | Otwarte ultimatum albo obowiązkowy kryzys daje odpowiedź mimo odnowienia, raz na sprawę | P |
| Zapisuje | `S.actors.pps.strategy.direction`; na starcie `parliamentary_socialism` | P |
| Odczytują | `strategyFactor` kampanii (5.3, 10.6); nastawienie organizacji przez kampanie zgodne z linią (10.3: kampania danej linii +8). Oferty partnerzy oceniają po treści, nie po deklaracji (10.5) | Z / P |
| Co zostaje po karcie | Nic w agendzie; po odnowieniu karta wraca do puli | P |
| Obecny kod | `source/scenes/party_affairs/polish_party_direction.scene.dry` (etap 5, 0.46): cztery kierunki, obecny można potwierdzić bez skutków (0.51), 1 T i odnowienie 6 M; reakcje frakcji z profilu `faction_stance_profile_v1` zapisują przyczynę, którą może cofnąć E3. Reguły w `source/rules/polish_party.js`. Odziedziczona `source/scenes/party_affairs/ideology.scene.dry` („Questions of Ideology”) ma warunek `not polish_party_rules` | K |
| Źródła i testy | 10.5, 10.6, 17.2; test „Demokracja zależna od sytuacji” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Socjalizm parlamentarny (`parliamentary_socialism`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii, bez premii | Kampania o temacie parlamentarnym: `strategyFactor` 1,10, gdy istnieje adresat i żądanie | Z / P |
| Samodzielna polityka klasowa (`class_independence`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii | Kampania klasowa 1,10. Sojusze są dozwolone, ale wspólna lista sprzeczna z publiczną obietnicą wymaga renegocjacji | Z / P |
| Obrona zdobyczy robotniczych (`workers_gains`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii | Kampania obrony zdobyczy 1,10, a 1,15, gdy w agendzie jest ograniczenie tej zdobyczy | Z / P |
| Szeroki ruch demokratyczny (`democratic_movement`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii | Kampania demokratyczna 1,00 bez zagrożenia i 1,15 przy `democraticThreat`, czyli presji ≥40 albo aktywnej sprawie przemocy antykonstytucyjnej | Z / P |
| Reakcja frakcji na zmianę | — | Brak w profilu `faction_stance_profile_v1` | — | P; historycznie B |

**Otwarte pytania:** brak.

### 4.2. Główny przeciwnik — `party.main_opponent`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór | Z |
| Dostęp | Od stycznia 1922, bez dodatkowych warunków | P |
| Koszt | 1 T, 0 R, 0 B | P |
| Limit wyboru | 1 opcja; nie ma opcji „obecny gabinet” | Z |
| Odnowienie | cd 6 M dla tej karty | P |
| Wyjątek | Otwarte ultimatum albo obowiązkowy kryzys daje odpowiedź mimo odnowienia, raz na sprawę | P |
| Zapisuje | `S.actors.pps.strategy.main_opponent`; na starcie `nationalist_right` | P |
| Odczytują | Cel kampanii polemicznej (5.3, 10.6); relacja zaatakowanego adresata. Bez adresata linię można przyjąć, ale kampania polemiczna jest zablokowana z powodem „brak adresata” | Z / P |
| Co zostaje po karcie | Nic w agendzie; sam wybór nie obala gabinetu ani nie zrywa umowy | P |
| Obecny kod | `source/scenes/party_affairs/polish_party_main_opponent.scene.dry` (etap 5, 0.46): cztery stanowiska, obecne można potwierdzić bez skutków (0.51); adresaci polemiki w karcie Media (5.3 katalogu); przy linii „przemoc antykonstytucyjna” adresatem jest od etapu 7 (0.48) partia, której potwierdzone śledztwo MSW przypisało otwartą sprawę przemocy (nigdy sama PPS). Odziedziczona `source/scenes/party_affairs/enemies.scene.dry` ma warunek `not polish_party_rules` | K |
| Źródła i testy | 10.5, 10.6, 5.3, 9.5, 17.2; testy „Preferencje”, „Wrogość a kanał” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Prawica narodowa (`nationalist_right`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis celu; adresat: ZLN | Kampania polemiczna przenosi głosy do PPS tylko z puli adresata w komórce, z limitem jej wielkości; adresat −2 relacji raz na kampanię | Z / P |
| Komuniści (`communists`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis celu; adresat: KPP | Jak wyżej wobec KPP; kampanie po −2 mogą zbić relację z KPP poniżej 10 i zamknąć drogę do kontaktu (9.5) | Z / P |
| Obrońcy kapitału i ziemiaństwa (`capital_land`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis celu; adresaci: partie z ideałem `fiscal` ≤ −1 i `land` ≤ −1 w aktualnym profilu 8.6 (test: PSChD i ZLN) | Zmiana profilu partii zmienia listę adresatów | Z / P |
| Przemoc przeciw konstytucji, niezależnie od strony (`unconstitutional_force`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis celu; adresat: partia z otwartą sprawą przemocy antykonstytucyjnej w dzienniku 15.2 | Bez takiej sprawy kampania polemiczna jest zablokowana | Z / P |
| Reakcja frakcji na zmianę | — | Brak w profilu `faction_stance_profile_v1` | — | P; historycznie B |

PSChD nie należy do puli prawicy narodowej, choć w grze tworzy z ZLN listę `chzjn` (6.5). Przypisanie adresatów to reguła gry (P).

**Otwarte pytania:** brak.

### 4.3. Wpływ Piłsudskiego — `party.pils_influence`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór | Z |
| Dostęp | Od stycznia 1922, bez dodatkowych warunków | P |
| Koszt | 1 T, 0 R, 0 B | P |
| Limit wyboru | 1 opcja | Z |
| Odnowienie | cd 6 M dla tej karty | P |
| Wyjątek | Otwarte ultimatum albo obowiązkowy kryzys daje odpowiedź mimo odnowienia, raz na sprawę | P |
| Zapisuje | `S.actors.pps.strategy.pils_influence`; na starcie `conditional` | P |
| Odczytują | Ustępstwa wobec Piłsudskiego (16.7); reakcje frakcji (10.5); reakcje Centrum na F4 i warunki PPS w zamachu (16.8.7) | P |
| Co zostaje po karcie | Nic w agendzie; po odnowieniu karta wraca do puli | P |
| Obecny kod | `source/scenes/party_affairs/polish_party_pils_influence.scene.dry` (etap 5, 0.46): trzy stanowiska; poparcie daje Centrum +3 sprzeciwu i relację z Piłsudskim +4 (nie częściej niż raz na 12 M), sprzeciw wobec ingerencji wojska Piłsudczykom +3 i relację −4. Relacja w `S.actors.relations.pilsudski`, reguły w `source/rules/polish_party.js` | K |
| Źródła i testy | 10.5, 10.7, 16.7, 16.8, 17.2; test „Dwie decyzje Piłsudskiego” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Popierać wpływ (`support`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Relacja z Piłsudskim +4, bez powtórki przy powrocie do tej linii w ciągu 12 M; Centrum +3 sprzeciwu | Wszystkie ustępstwa z 16.7 dostępne, przy ich relacji i zgodach. W F4 poparcie Piłsudskiego kosztuje Centrum +3 zamiast +8 | Z / P |
| Popierać warunkowo (`conditional`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Relacja bez zmian | Ustępstwa z 16.7 z gwarancją: funkcja pod kontrolą cywilną i premierostwo legalnego gabinetu spełniają ją z definicji, a inspektorat wymaga zapisu o odpowiedzialności przed Sejmem. Linia z gwarancjami zapisuje warunki PPS przed zamachem (16.8.7) | Z / P |
| Sprzeciwiać się ingerencji wojska (`oppose_military_interference`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Relacja −4; Piłsudczycy +3 sprzeciwu | Do jawnej zmiany linii blokuje samodzielny inspektorat, czyli władzę wojskową niezależną od rządu. Pozostałe ustępstwa, rozmowy i poparcie legalnego premiera zostają dostępne | Z / P |

Linia nie jest warunkiem karty 16.7, tylko ogranicza dostępne ustępstwa (10.7).

**Otwarte pytania:** brak.

### 4.4. Jakiej władzy chcemy — `party.form_of_power`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór | Z |
| Dostęp | Od stycznia 1922, bez dodatkowych warunków | P |
| Koszt | 1 T, 0 R, 0 B | P |
| Limit wyboru | 1 opcja | Z |
| Odnowienie | cd 6 M dla tej karty | P |
| Wyjątek | Otwarte ultimatum albo obowiązkowy kryzys daje odpowiedź mimo odnowienia, raz na sprawę | P |
| Zapisuje | `S.actors.pps.strategy.form_of_power`; na starcie `parliamentarism` | P |
| Odczytują | Oś metody ustrojowej w `programFit` (10.8, 8.3); kampanie (5.3); raport rozdziału jako program (19) | P |
| Co zostaje po karcie | Nic w agendzie. Deklaracja nie zmienia obowiązującego ustroju | Z |
| Obecny kod | `source/scenes/party_affairs/polish_party_form_of_power.scene.dry` (etap 5, 0.46): parlamentaryzm, silniejsza prezydentura i rady robotnicze (za pierwszym razem Lewica +4 siły, Centrum +3 sprzeciwu); żadna nie wprowadza reformy. Silniejsza prezydentura otwiera arbitraż prezydenta z karty reformy (7.4 katalogu) | K |
| Źródła i testy | 10.5, 10.8, 7.6, 17.12.7; testy „Trzy ustroje”, „Cele ustrojowe” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Parlamentaryzm (`parliamentarism`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii; oś ustrojowa +2 | Zachowuje drogę większości, odpowiedzialności gabinetu i demokratyzacji | Z / P |
| Silniejsza prezydentura (`strong_presidency`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii; oś 0 | Tylko przy tej linii PPS może przygotować arbitraż prezydenta (7.4 katalogu); późniejsza zmiana linii nie kasuje projektu. Legalna reforma prezydentury nie jest ingerencją wojska | Z / P |
| Rady robotnicze (`workers_councils`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Oś −2. Przy pierwszym przyjęciu w rozdziale: Lewica +4 surowej siły, potem jedna normalizacja; Centrum +3 sprzeciwu zamiast reakcji ogólnej | Powrót do tej linii nie daje ponownie siły. Nie daje głosów KPP, reprezentacji pracowniczej ani wyborców. Państwo rad należy do kontynuacji | Z / P |

**Otwarte pytania:** brak.

### 4.5. Charakter partii — `party.electoral_base`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór | Z |
| Dostęp | Od stycznia 1922, bez dodatkowych warunków | P |
| Koszt | 1 T, 0 R, 0 B | P |
| Limit wyboru | 1 opcja | Z |
| Odnowienie | cd 6 M dla tej karty | P |
| Wyjątek | Otwarte ultimatum albo obowiązkowy kryzys daje odpowiedź mimo odnowienia, raz na sprawę | P |
| Zapisuje | `S.actors.pps.strategy.electoral_base`; na starcie `workers` | P |
| Odczytują | Mnożnik rozbudowy zasięgu w docelowym środowisku (10.6); oczekiwania partnerów i zaplecza | P |
| Co zostaje po karcie | Nic w agendzie. Wybór nie daje pieniędzy, kadry TUR, ludzi Milicji ani głosów | Z |
| Obecny kod | `source/scenes/party_affairs/polish_party_electoral_base.scene.dry` (etap 5, 0.46): cztery stanowiska; rozbudowa organizacji w środowisku partii ×1,10 (z kadrą TUR najwyżej ×1,30). Odziedziczona `source/scenes/party_affairs/peoples_party.scene.dry` zależy od niemieckich pól i nie pojawia się w polskiej talii | K |
| Źródła i testy | 10.5, 10.6, 13.2 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Partia robotnicza (`workers`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii | +0,10 do mnożnika rozbudowy: trzy branże związkowe i komórki robotników, w tym robotników rolnych | Z / P |
| Partia robotniczo-chłopska (`workers_peasants`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii | Jak wyżej oraz komórki chłopów | Z / P |
| Szeroka partia demokratyczna (`broad_democratic`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii | +0,10 w komórkach inteligencji i drobnomieszczaństwa | Z / P |
| Własny profil i docieranie przez sojusze (`allied_reach`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii | Zasięg partnera dopiero po jego zgodzie, bez liczenia tych samych odbiorców dwa razy | Z / P |
| Reakcja frakcji na zmianę | — | Brak w profilu `faction_stance_profile_v1` | — | P; historycznie B |

Rozbudową zasięgu jest każde podniesienie zasięgu branży związkowej albo `base_reach_pps` komórek docelowego środowiska: rozbudowa branży (5.1 katalogu), praca organizacyjna (5.7 katalogu) i akcje Pużaka, Arciszewskiego i Ziemięckiego (6.6 katalogu). Zasięg prasy się nie liczy. Łączny mnożnik rozbudowy z TUR jest ograniczony testowo do 1,30; nasycenie kampanii obowiązuje nadal.

**Otwarte pytania:** brak. Od 0.34 praca organizacyjna buduje zasięg także w komórkach chłopów, inteligencji i drobnomieszczaństwa (5.7 katalogu).

### 4.6. Mniejszości słowiańskie: autonomia — `party.slavic_autonomy`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór | Z |
| Dostęp | Od stycznia 1922, bez dodatkowych warunków | P |
| Koszt | 1 T, 0 R, 0 B | P |
| Limit wyboru | 1 opcja | Z |
| Odnowienie | cd 6 M dla tej karty | P |
| Wyjątek | Otwarte ultimatum albo obowiązkowy kryzys daje odpowiedź mimo odnowienia, raz na sprawę | P |
| Zapisuje | `S.actors.pps.strategy.slavic_autonomy`; na starcie `cultural_rights` | P |
| Odczytują | Oś praw i autonomii w ocenie ofert (10.8, 8.3), temat `autonomy`; ideały testowe z 8.6: ZLN −2, reprezentacja pozostałych mniejszości +1, reszta 0. Treść żądań ustrojowych i praw mniejszości; raport jako program | Z / P |
| Co zostaje po karcie | Nic w agendzie. Brak przycisku wdrożenia, negocjacji zagranicznych i zmiany granic | Z |
| Obecny kod | `source/scenes/party_affairs/polish_party_slavic_autonomy.scene.dry` (etap 5, 0.46): federacja, autonomia województw, prawa kulturalne i polonizacja (oś +2…−2); ideał PPS `autonomy` w ofertach; autonomia od +1 przekracza czerwoną linię ZLN. Bez nowej populacji i praw. Od etapu 8 (0.49) linią startową PPS jest autonomia województw (`regional_autonomy`), jak projekt Niedziałkowskiego z X 1921, a ideały `autonomy` partii są datowane według badań 8f (`actor_profiles_v2`) | K |
| Źródła i testy | 10.5, 10.8, 17.12.6, 17.12.7; testy „Cztery stanowiska autonomii”, „Cele ustrojowe” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Federacja (`federation`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii; oś +2 | Program krajowej przebudowy z członami ukraińskim i białoruskim; wykonanie w kontynuacji. Dozwolone zgodne kroki pośrednie | Z / P |
| Autonomia wojewódzka (`regional_autonomy`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii; oś +1 | Państwo jednolite z przekazanymi kompetencjami. W rozdziale 1 wykonalna jest tylko ograniczona autonomia z 17.12.6 | Z / P |
| Swobody języka, szkół i organizacji bez autonomii (`cultural_rights`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii; oś 0 | Prawa językowe, szkolne i organizacyjne bez autonomii politycznej | Z / P |
| Polonizacja (`polonisation`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii; oś −2 | Odrzuca odrębną autonomię i instytucje narodowe | Z / P |
| Reakcja frakcji na zmianę | — | Brak w profilu `faction_stance_profile_v1` | — | P; historycznie B |

Żadna deklaracja nie daje od razu poparcia agregatu `other_minorities`. Temat słowiański nie oznacza, że każdy wyborca tego agregatu jest Ukraińcem albo Białorusinem (10.8).

Skutek dla gracza: linia za autonomią pomaga w rozmowach z reprezentacją mniejszości, a szkodzi w rozmowach z ZLN. Historyczne stanowiska partii w latach 1922–1926 zapisuje od etapu 8 (0.49) profil `actor_profiles_v2` według badań 8f (`PL-MINORITY-AUTONOMY-1922-1926`).

**Otwarte pytania:** brak.

### 4.7. Współpraca z organizacjami żydowskimi — `party.jewish_cooperation`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór | Z |
| Dostęp | Od stycznia 1922, bez dodatkowych warunków | P |
| Koszt | 1 T, 0 R, 0 B | P |
| Limit wyboru | 1 opcja | Z |
| Odnowienie | cd 6 M dla tej karty | P |
| Wyjątek | Otwarte ultimatum albo obowiązkowy kryzys daje odpowiedź mimo odnowienia, raz na sprawę | P |
| Zapisuje | `S.actors.pps.strategy.jewish_cooperation`; na starcie `labour_only` | P |
| Odczytują | Oś współpracy w ocenie ofert (10.8, 8.3); dopuszczalny zakres porozumień, zwłaszcza z Bundem (5.5) | P |
| Co zostaje po karcie | Nic w agendzie. Istniejące obietnice trzeba wykonać, renegocjować albo wypowiedzieć | Z |
| Obecny kod | `source/scenes/party_affairs/polish_party_jewish_cooperation.scene.dry` (etap 5, 0.46): szeroka, tylko pracownicza albo żadna; bez nowej populacji i praw. Zaufanie Bundu w `S.actors.bund` zmienia tylko wykonana wspólna akcja: od etapu 6 (0.47) strajk przemysłu przy linii innej niż „żadna” daje +5 za zakończenie zgodne z ugodą i −5 za złamanie ugody przez PPS | K |
| Źródła i testy | 10.5, 10.8, 9.2; test „Cztery stanowiska autonomii” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Szeroka współpraca i prawa w programie (`broad`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii; oś +2 | Dopuszcza porozumienie o prawach i wspólne działania | Z / P |
| Współpraca pracownicza (`labour_only`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii; oś 0 | Dopuszcza porozumienia pracy, zwłaszcza z Bundem | Z / P |
| Brak współpracy (`none`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Zapis linii; oś −2 | Blokuje inicjowanie nowych wspólnych działań. Nie cofa już obowiązujących praw obywateli | Z / P |
| Reakcja frakcji na zmianę | — | Brak w profilu `faction_stance_profile_v1` | — | P; historycznie B |

Bund nie jest partią (5.5): nie ma go na liście partii i relacji, na listach wyborczych ani w Sejmie. Jest organizacją robotniczą, partnerem wspólnych akcji pracowniczych. Jego zaufanie zaczyna od 50 i zmienia się tylko przez wykonane wspólne akcje.

**Otwarte pytania:** brak.

### 4.8. PPS wobec modelu sowieckiego — `party.ussr_position`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór; nie jest wydarzeniem B13 | Z |
| Dostęp | Od początku rozdziału; nie wymaga oferty komunistów ani nowego doniesienia | P |
| Koszt | 1 T, 0 R, 0 B | P |
| Limit wyboru | 1 opcja | Z |
| Odnowienie | cd 12 M | P |
| Wyjątek | Otwarte ultimatum albo obowiązkowy kryzys daje odpowiedź mimo odnowienia, raz na sprawę | P |
| Zapisuje | `S.actors.pps.strategy.ussr_stance`; na starcie `uncommitted`, więc przy pierwszym użyciu dostępne są wszystkie trzy opcje | P |
| Odczytują | Relacja KPRP/KPP i droga do kontaktu (9.5); sprzeciw frakcji; zgodność warunków ofert z obroną pluralizmu (8.3) | P |
| Co zostaje po karcie | Nic w agendzie. Bez dyplomacji, pomocy z Moskwy i zmiany `form_of_power` | Z |
| Obecny kod | `source/scenes/party_affairs/polish_party_ussr_position.scene.dry` (etap 5, 0.46): solidarność, niezależność i potępienie; 1 T, odnowienie 12 M; solidarność daje raz +5 relacji z KPP i Centrum +5 sprzeciwu, potępienie −5 relacji bez reakcji frakcji | K |
| Źródła i testy | 10.10, 9.5, 17.13; testy „ZSRR”, „Sowiecki model B13”, „Wrogość a kanał” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Solidaryzować się z państwem sowieckim jako próbą budowy socjalizmu (`sympathetic`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Relacja KPRP/KPP +5, jednorazowo w rozdziale; Centrum +5 sprzeciwu | Łatwiejsze rozmowy z komunistami; trudniejsza wiarygodność tam, gdzie oferta wymaga potępienia autorytaryzmu | Z / P |
| Zachować niezależność (`independent`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Bez zmiany relacji i sprzeciwu | Możliwa ograniczona współpraca na konkretnych warunkach | Z / P |
| Potępić sowiecki autorytaryzm (`critical`) | — (obecna linia: potwierdzenie za 1 T, bez skutków) | Relacja KPRP/KPP −5; bez reakcji frakcji | Większa zgodność ofert obrony pluralizmu. Relacja poniżej 10 zamyka drogę do kontaktu (9.5) | Z / P |

Reakcję frakcji przy potępieniu usunięto w 0.33: dokumentacja nie wskazuje frakcji popierającej model sowiecki.

**Otwarte pytania:** brak.

## 5. Partia 2 — zasoby i organizacje partii

Cztery karty talii partyjnej (Organizacje, Milicja, Media, Składki) oraz stałe działania agendy: zbiórka, aparat, praca organizacyjna, kursy TUR, uruchomienie spółdzielni i kroki sprawy związkowej (13–14, 17.2). Podakcje mają jedno ID i jeden koszt bez względu na drogę wejścia.

**Status partii:** przejrzana przez użytkownika 26 IX 2026; wszystkie pytania rozstrzygnięte w 0.34 (referencja 23.7).

### 5.1. Organizacje PPS — `party.organizations`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór | Z |
| Dostęp | Od stycznia 1922; pakiet TUR dopiero od daty dostępności organizacji (test: I 1923) | P / H |
| Koszt | 1 T; suma R wybranych pakietów | P |
| Limit wyboru | 1–2 różne organizacje, najwyżej jedna podakcja w każdej (`selection_limit=2`); zamknięcie bez wyboru jest bezpłatne | Z |
| Odnowienie | cd 2 M dla karty; odnowienia wybranych podakcji obowiązują osobno | P |
| Wyjątek | Doradca może zastąpić czas jednego etapu (10.4.4), nie całego pakietu | P |
| Zapisuje | `ActionTxn.selected_options`; zasięg lub fundusz branży, `press.reach`, `tur.active_build`, stan Milicji, `cooperatives.projects` | P |
| Odczytują | Utrzymanie (13.1), rejestr organizacji (13.2), Milicja (13.3), związki (14.1), zasięg kampanii (5.3) | P |
| Co zostaje po karcie | Budowa TUR w toku; przygotowana spółdzielnia czeka w agendzie (5.9 katalogu); miesięczne utrzymanie organizacji | P |
| Obecny kod | `source/scenes/party_affairs/polish_party_organizations.scene.dry` (etap 5, 0.46): 12 pakietów, do dwóch różnych w jednej akcji ze wspólnym potwierdzeniem; nic nie jest pobierane przed potwierdzeniem. Reguły w `source/rules/polish_party.js`. Odziedziczona `source/scenes/party_affairs/party_organizations.scene.dry` ma warunek `not polish_party_rules` | K |
| Źródła i testy | 13.5, 13.1, 13.2, 13.3, 14.1, 17.2; testy „Dwie organizacje”, „Podmenu i doradcy”, „TUR” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Związki: rozbudować jedną branżę (`union.organize`) | brak środków; odnowienie podakcji 2 M | −1 R; zasięg branży +15 z modyfikatorami, do 100 | Zasięg działa w kampaniach (5.3), celu członkostwa (13.1) i potencjale strajku (14.2) | Z / P |
| Związki: zasilić fundusz branży (`union.fund`) | brak środków | −1 R; fundusz branży +1 | To pieniądze związku; PPS nie może ich odebrać (14.1) | Z / P |
| Prasa: rozszerzyć dystrybucję (`party.press_distribution`) | brak środków; cd 2 M | −1 R; `press.reach` +10, do 100 | Kampanie prasowe (5.3) | Z / P |
| TUR: rozpocząć kolejny etap (`party.tur`) | przed datą TUR; poziom 3; trwa inna budowa | −2 R; start budowy | Po 2 opłaconych M: poziom +1 i kadra +10. W czasie budowy utrzymanie jak dla przyszłego poziomu | Z / P |
| Milicja: rekrutacja (`militia.recruit`) | organizacja nieaktywna albo nielegalna; brak rezerwy na 3 M utrzymania; cd 2 M | −1 R; +100 ludzi | Utrzymanie `0.10*ceil(strength/200)` R/M | Z / P |
| Milicja: militaryzacja (`militia.militarize`) | sprawność ≥0,70; brak rezerwy; cd 3 M | −2 R; sprawność +0,10, do 0,70; `militarized=true` | Pierwsza militaryzacja: Centrum +3 sprzeciwu | Z / P |
| Spółdzielczość: przygotować mały projekt (`party.cooperative`) | brak wskazanych odbiorców; brak środków | −1 R; projekt przygotowany | Uruchomienie w agendzie za 1 T i 2 R (5.9 katalogu) | Z / P |

Nie ma płatnej opcji „Zachować środki”: zamknięcie karty bez wyboru jest bezpłatne, a karta zostaje w ręce (Z — 0.34). Jedna organizacja nie zajmuje obu miejsc: rekrutacja i militaryzacja to ta sama organizacja. AS nie należy do tej karty. Brak środków blokuje cały pakiet, zamiast kupić tańszą połowę. Rezerwę utrzymania Milicji sprawdzamy po wszystkich jednorazowych wydatkach pakietu.

**Otwarte pytania:** brak.

### 5.2. Milicja PPS — `party.militia`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór; te same podakcje także przez Organizacje PPS i agendę | Z |
| Dostęp | Organizacja aktywna i legalna; opcja AS po spełnieniu `canFormAS` | P |
| Koszt | 1 T; rekrutacja 1 R, militaryzacja 2 R, AS 2 R | P |
| Limit wyboru | 1 opcja; rekrutacja i AS nie w jednej transakcji | Z |
| Odnowienie | Rekrutacja cd 2 M, militaryzacja cd 3 M, AS jednorazowo | P |
| Wyjątek | Doradca może zastąpić czas jednego kroku | P |
| Zapisuje | `pps_militia_strength`, `pps_militia_militancy`, `pps_militia_stage` (1 albo 2), `militarized` | P |
| Odczytują | Ochrona spraw przed zamachem (13.4, 16.5); zadanie w zamachu (16.8.3); utrzymanie (13.3) | P |
| Co zostaje po karcie | Miesięczne utrzymanie; niedofinansowanie daje +5 zmęczenia na miesiąc | P |
| Obecny kod | `source/scenes/party_affairs/polish_party_militia.scene.dry` (etap 5, 0.46): rekrutacja, militaryzacja i przejście do AS według 13.3 na `S.militia`; bez współpracy ze związkami i bez rozwiązania oddziału. Odziedziczona `source/scenes/party_affairs/reichsbanner.scene.dry` („PPS Self-Defence”) ma warunek `not polish_party_rules` | K |
| Źródła i testy | 13.3, 13.4, 13.5, 16.5, 16.8.3; testy „AS”, „Posłuch AS”, „Jedna akcja Milicji”, „Mała AS i czwarta sprawa”, „AS w zamachu”, „Podwójny przydział” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Rekrutacja (`militia.recruit`) | organizacja nieaktywna albo nielegalna; brak rezerwy na koszt i 3 M utrzymania; zaległości | −1 R; +100 ludzi, bez premii sprawności | Wyższe utrzymanie | Z / P |
| Militaryzacja (`militia.militarize`) | sprawność ≥0,70; brak rezerwy; zaległości | −2 R; sprawność +0,10, do 0,70; `militarized=true` | Pierwsza militaryzacja: Centrum +3 sprzeciwu. Dalsze etapy możliwe także po AS | Z / P |
| Utworzyć AS (`militia.as`) | brak `canFormAS`: etap 1, militaryzacja, ≥500 ludzi, brak zakazu i represji, R ≥ 2 + 3 × przyszłe utrzymanie, brak zaległości | −2 R; etap 2 | Posłuch członków +0,15, do 1; przed zamachem do trzech równoczesnych spraw, w zamachu jedno zadanie; utrzymanie +0,10 R/M | Z / P |

Milicja obsługuje jedną sprawę naraz (13.4). Próg 500 ludzi odblokowuje opcję AS, ale jej nie wykonuje i nie cofa etapu po późniejszych stratach.

**Otwarte pytania:** brak.

### 5.3. Media i kampania — `party.media`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór | Z |
| Dostęp | Od stycznia 1922; kampania wymaga wskazanych komórek i tematu | P |
| Koszt | 1 T; każdy wariant 1 R | P |
| Limit wyboru | 1 wariant, nie wszystkie naraz | Z |
| Odnowienie | Karta nie ma własnego odnowienia (Z — 0.34). Dystrybucja cd 2 M, format cd 6 M; kampanie bez odnowienia, z nasyceniem tematu przez 6 M | Z / P |
| Wyjątek | Kampanię można prowadzić przez związki i spotkania, gdy prasa jest ograniczona albo słaba (13.2) | P |
| Zapisuje | `press.reach`, `press.format`, `press.credibility`, `press.campaigns`; preferencje i frekwencja komórek (5.3) | P |
| Odczytują | Kampania (5.3), `strategyFactor` (10.6), sprzedaż popularnego wydania (13.1–13.2) | P |
| Co zostaje po karcie | Rekord kampanii i licznik nasycenia w komórce; format działa do zmiany; prasa kosztuje 0,10 R/M | P |
| Obecny kod | `source/scenes/party_affairs/polish_party_media.scene.dry` (etap 5, 0.46): dystrybucja i format prasy oraz kampania prasowa, przez związki, polemika i mobilizacja; najpierw temat, potem odbiorcy. Od etapu 7 (0.48) śledztwo prasowe działa na zapisanej sprawie przemocy albo bezprawnej restrykcji, której prasa jeszcze nie ujawniła: 1 T, 1 R, wiarygodność +4 raz; bez sprawy PPS i bez sporu o wojsko. Komórki i zysk kampanii w `source/rules/polish_electorate.js`. Odziedziczone `source/scenes/party_affairs/media.scene.dry` i `source/scenes/party_affairs/campaigning.scene.dry` mają warunek `not polish_party_rules` | K |
| Źródła i testy | 5.3, 10.6, 13.2, 17.2; testy „Preferencje”, „Nasycenie”, „Zmiana formatu prasy”, „Konfiskata” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Rozszerzyć dystrybucję (`party.press_distribution`) | cd 2 M; brak środków | −1 R; `press.reach` +10, do 100 | — | Z / P |
| Zmienić format prasy (`party.press_format`) | cd 6 M; brak środków | −1 R; `party_journal` ↔ `popular`. Pierwsze przyjęcie formatu popularnego: Centrum +3 sprzeciwu | Popularny: efektywny zasięg +10, wiarygodność −5; przy efektywnym zasięgu ≥50 i opłaconym utrzymaniu +0,10 R/M sprzedaży | Z / P |
| Kampania o preferencje (`party.campaign`) | brak komórek albo tematu; brak środków | −1 R; zysk PPS `gain_pp` według 5.3: zasięg, zaufanie, spójność, nasycenie, `strategyFactor` | Licznik tematu w komórce na 6 M | Z / P |
| Kampania polemiczna (`party.campaign`, wariant) | brak adresata wskazanego w 4.2 | −1 R; głosy tylko z puli adresata | Adresat −2 relacji raz na kampanię | Z / P |
| Kampania przez związki i spotkania (`party.campaign`, wariant) | brak środków | −1 R; zasięg z właściwej branży, bez premii prasy | — | Z / P |
| Kampania mobilizacyjna (`party.turnout`) | brak środków | −1 R; frekwencja wskazanej komórki +0,04, do 0,90 | Wygasa po wyborach | Z / P |
| Śledztwo prasowe (`party.press_investigation`) | brak istniejącej sprawy i dowodów | −1 R; `press.credibility` +4; ujawniony fakt zapisany raz | Nie tworzy fikcyjnego skandalu | Z / P |

Kampania mobilizacyjna i śledztwo prasowe należą do tej karty (Z — 0.34). Śledztwo jest dostępne tylko przy prawdziwej sprawie i dowodach.

**Otwarte pytania:** brak.

### 5.4. Składki — `party.dues`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór | Z |
| Dostęp | Od stycznia 1922 | P |
| Koszt | 1 T, 0 R | P |
| Limit wyboru | 1 opcja | Z |
| Odnowienie | cd 6 M | P |
| Wyjątek | — | — |
| Zapisuje | `dues` w granicach 1–4, na starcie 2; `apparatus.member_index` | P |
| Odczytują | Miesięczne wpływy i cel członkostwa (13.1) | P |
| Co zostaje po karcie | Nic w agendzie; podgląd pokazuje przed zatwierdzeniem nowe wpływy i koszty utrzymania | P |
| Obecny kod | `source/scenes/party_affairs/polish_party_dues.scene.dry` (etap 5, 0.46): składki 1–4; od 0.51 „utrzymać” za 1 T i odnowienie, bez skutków; skutek dla członkostwa i wpływów w miesięcznej księdze partii (`source/rules/polish_party.js`) | K |
| Źródła i testy | 13.1, 10.5, 17.2; testy „Składki”, „Cel członkostwa” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Podwyższyć | składki na poziomie 4 | Indeks członkostwa ×0,95, gdy płace realne <90 albo bezrobocie ≥8, a w innych warunkach ×0,98 | Wyższe wpływy; cel członkostwa −5% za każdy poziom powyżej 2 | Z / P |
| Obniżyć | składki na poziomie 1 | Indeks członkostwa +2 punkty, najwyżej 150 | Niższe wpływy; cel członkostwa +5% przy poziomie 1 | Z / P |
| Utrzymać (`keep`) | — | Składki, członkostwo i wpływy bez zmian | Karta czeka 6 M jak po zmianie | Z |

„Utrzymać” to potwierdzenie obecnego poziomu: kosztuje akcję miesiąca i odnowienie 6 M, ale niczego nie zmienia; odłożenie karty na rękę bez wyboru jest bezpłatne (Z — 0.51, zastępuje bezpłatne pozostawienie z 0.34). Strata członków nie przechodzi automatycznie na preferencje wyborcze (13.1).

**Otwarte pytania:** brak.

### 5.5. Zbiórka nadzwyczajna — `party.fundraise`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Agenda finansów PPS, poza ręką | P |
| Dostęp | Zawsze po upłynięciu odnowienia | P |
| Koszt | 1 T, 0 R | P |
| Limit wyboru | Jedno działanie | P |
| Odnowienie | cd 3 M | P |
| Wyjątek | — | — |
| Zapisuje | Kasa PPS +`dues*member_index/100` R | P |
| Odczytują | — | — |
| Co zostaje po karcie | Nic; to osobna składka nadzwyczajna, nie drugie zaksięgowanie wpływu miesięcznego | P |
| Obecny kod | Pozycja stałej karty `source/scenes/polish_party_agenda.scene.dry` (etap 5, 0.46): składki × członkostwo/100 R, odnowienie 3 M. Odziedziczona `source/scenes/party_affairs/fundraising.scene.dry` ma warunek `not polish_party_rules` | K |
| Źródła i testy | 13.1, 17.2; test „Brak gotówki” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Przeprowadzić zbiórkę (`party.fundraise`) | odnowienie | +`dues*member_index/100` R; przy składkach 2 i indeksie 100: +2 R | — | P |

**Otwarte pytania:** brak.

### 5.6. Rozbudowa aparatu — `party.apparatus`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Agenda finansów PPS, poza ręką | P |
| Dostęp | Poziom aparatu <4 | P |
| Koszt | 1 T, 2 R | P |
| Limit wyboru | Jedno działanie | P |
| Odnowienie | Brak w 17.2; kolejne poziomy można budować miesiąc po miesiącu | P |
| Wyjątek | — | — |
| Zapisuje | `apparatus.level` +1 | P |
| Odczytują | Miesięczne wpływy i utrzymanie (13.1) | P |
| Co zostaje po karcie | Stały koszt 0,10 R/M za każdy poziom | P |
| Obecny kod | Pozycja stałej karty `source/scenes/polish_party_agenda.scene.dry` (etap 5, 0.46): 2 R za kolejny poziom aparatu; wpływy z aparatu w miesięcznej księdze partii (M18) | K |
| Źródła i testy | 13.1, 17.2; testy „Zwrot aparatu”, „Otwarcia finansowe” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Rozbudować aparat (`party.apparatus`) | poziom 4; brak 2 R | −2 R; poziom +1 | Wpływy +0,15 × członkostwo/100 R/M i koszt +0,10 R/M. Przy pełnym członkostwie netto +0,05 R/M, zwrot po ok. 40 M (M18) | Z / P |

**Otwarte pytania:** brak.

### 5.7. Praca organizacyjna — `party.organize_without_funds`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Gwarantowane działanie poza ręką (4.4) | P |
| Dostęp | Zawsze | P |
| Koszt | 1 T, 0 R | P |
| Limit wyboru | Jedna branża związkowa albo komórki jednej wybranej klasy; bez prasy i TUR | Z / P |
| Odnowienie | Brak | P |
| Wyjątek | — | — |
| Zapisuje | Zasięg branży +2 albo `base_reach_pps` komórek wybranej klasy +2 | Z / P |
| Odczytują | Kampanie (5.3), cel członkostwa (13.1) | P |
| Co zostaje po karcie | Nic; fundusz nie rośnie | P |
| Obecny kod | Pozycja stałej karty `source/scenes/polish_party_agenda.scene.dry` (etap 5, 0.46): 1 T, 0 R, +2 zasięgu jednej branży albo bazy PPS w jednej klasie; dostępna także przy pustej kasie | K |
| Źródła i testy | 4.4, 17.2, 13.2; test „Brak gotówki” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Praca w branży związkowej (`party.organize_without_funds`) | — | Zasięg branży +2, do 100 | Mnożnik charakteru partii (4.5 katalogu), gdy branża należy do docelowego środowiska | Z / P |
| Praca w komórkach wybranej klasy (`party.organize_without_funds`) | — | `base_reach_pps` komórek tej klasy +2, do 100 | Mnożnik charakteru partii, gdy klasa należy do docelowego środowiska | Z / P |

Działanie jest darmowe, ale słabe. Przydaje się, gdy brakuje pieniędzy albo gdy PPS chce powoli budować zaplecze w nowym środowisku (Z — 0.34).

**Otwarte pytania:** brak.

### 5.8. Kurs TUR — `party.tur_course`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Agenda TUR po wykonaniu co najmniej poziomu 1 | P |
| Dostęp | Poziom TUR wymagany przez wybrany kurs | P |
| Koszt | 1 T, 1 R; program trwa 2 M finansowanego działania | P |
| Limit wyboru | Jeden kurs naraz | P |
| Odnowienie | Wspólne cd 4 M od rozpoczęcia kursu | P |
| Wyjątek | Kurs przerwany niedofinansowaniem czeka, zamiast nagradzać upływ czasu | P |
| Zapisuje | `tur.active_course`; po zakończeniu skutek kursu i wpis w `tur.prepared_campaigns` | P |
| Odczytują | Mnożnik kampanii 1,10 w objętej komórce (5.3); przygotowanie projektu (12.2) | P |
| Co zostaje po karcie | Zużywalny wpis kampanii albo przygotowany projekt | P |
| Obecny kod | Pozycja stałej karty `source/scenes/polish_party_agenda.scene.dry` (etap 5, 0.46): cztery kursy według poziomu TUR; kurs czeka w miesiącu bez finansowania, a ukończony daje jednorazową premię kampanii | K |
| Źródła i testy | 13.2, 17.2, 5.3; test „TUR” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Prawa obywatelskie i praktyka demokracji | brak poziomu 1; brak wskazanej komórki albo organizacji | −1 R; start kursu | Po 2 M: radykalizacja objętej komórki −3; następna kampania o demokracji w ciągu 6 M +0,10 do mnożnika, raz | P |
| Kadry związkowe i wyjaśnienie linii PPS | brak poziomu 2; branża nie przyjęła zakresu | −1 R; start kursu | Zaufanie branży +3, jej sprzeciw −4; bez nakazu poparcia innej linii | P |
| Przygotowanie reformy społecznej | brak poziomu 2; brak dużego, jeszcze nieuruchomionego projektu pracy, oświaty, mieszkalnictwa lub spółdzielczości | −1 R; start kursu | Pełne przygotowanie projektu (100) i wykonanie krótsze o 1 M, najmniej 1 M; raz na projekt; nie dotyczy D ani konstytucji | P |
| Ogólnokrajowa kampania edukacyjna | brak poziomu 3 | −1 R; start kursu | Jak kurs praw obywatelskich, w do trzech rozłącznych komórkach | P |

Budowę samego TUR (`party.tur`) opisuje 5.1 katalogu.

**Otwarte pytania:** brak.

### 5.9. Uruchomienie spółdzielni — `party.cooperative`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Agenda po przygotowaniu projektu w Organizacjach PPS (5.1 katalogu) | P |
| Dostęp | Przygotowany mały projekt z wskazanymi odbiorcami | P |
| Koszt | 1 T, 2 R | P |
| Limit wyboru | Jeden projekt | P |
| Odnowienie | Brak w 17.2 | P |
| Wyjątek | — | — |
| Zapisuje | Rekord w `cooperatives.projects`: odbiorcy, finansowanie, wykonanie, utrzymanie | P |
| Odczytują | Ulga odbiorców (13.2); utrzymanie 0,10 R/M (13.1) | P |
| Co zostaje po karcie | Działająca spółdzielnia kosztuje 0,10 R/M; bez publicznych B | P |
| Obecny kod | Pozycja stałej karty `source/scenes/polish_party_agenda.scene.dry` (etap 5, 0.46): uruchomienie przygotowanej spółdzielni za 2 R; działająca spółdzielnia jest wykonawcą wariantów spółdzielczych w `source/scenes/government_affairs/polish_gov_investment.scene.dry` i `source/scenes/government_affairs/polish_gov_agriculture.scene.dry` | K |
| Źródła i testy | 17.2, 13.1, 13.2, 12.4 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Uruchomić spółdzielnię (`party.cooperative`) | brak przygotowania; brak 2 R | −2 R; start działania | Ulga +1 dla odbiorców, dopóki działanie jest opłacone; suma ulg w komórce najwyżej 6 | Z / P |

Liczba spółdzielni nie ma osobnego limitu; ogranicza ją koszt oraz limit ulgi 6 w komórce (Z — 0.34).

**Otwarte pytania:** brak.

### 5.10. Kroki sprawy związkowej — `union.prepare`, `union.align`, `union.mediate`, `union.strike`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Agenda konkretnej branży albo sporu; nie ma osobnej karty strategii związkowej | Z |
| Dostęp | Istniejąca branża; strajk wymaga celu, branży, roszczenia i planu zakończenia | P |
| Koszt | 1 T, 0 R za każdy krok | P |
| Limit wyboru | Jeden krok | P |
| Odnowienie | Uzgodnienie postulatów cd 2 M; pozostałe kroki bez odnowienia w 14.1 | P |
| Wyjątek | Charakter protestu wybiera wydarzenie strajkowe (9.8 katalogu), nie ta agenda | Z |
| Zapisuje | `UnionBranch.readiness`, `alignment`, `dissent`; rekord `Strike` | P |
| Odczytują | Potencjał akcji i ugoda (14.2–14.4); zgoda na ugodę (17.4) | P |
| Co zostaje po karcie | Strajk przechodzi fazy `prepared → negotiating → active → settlement_pending → ended`; każdy aktywny miesiąc pobiera fundusz | P |
| Obecny kod | Stała karta `source/scenes/polish_union_agenda.scene.dry` (etap 6, 0.47): trzy branże, a w każdej uzgodnienie postulatów ograniczonych albo szerokich, zebranie o linii strajku albo uzgodnionego końca, mediacja i rozpoczęcie protestu; każdy krok 1 T i 0 R. Po rozpoczęciu kroki strajku w `source/scenes/polish_strike_steps.scene.dry`. Reguły w `source/rules/polish_unions.js`. Odziedziczona `source/scenes/government_affairs/labor_affairs.scene.dry` wymaga SPD, a `source/scenes/events/unions_declare_independence.scene.dry` ma warunek `not polish_union_rules` | K |
| Źródła i testy | 14, 14.1, 14.2, 14.3, 17.2, 17.5; testy „Zgoda na ugodę”, „Zgoda a fundusz”, „Pełna oferta i czerwona linia” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Uzgodnić postulaty i koniec akcji (`union.prepare`) | cd 2 M | Gotowość branży +15; zapis celu i warunków zakończenia | Warunki zakończenia czyta ugoda (14.4–14.5) | P |
| Wspólne zebranie o linii politycznej (`union.align`) | brak przyjętego porozumienia | `alignment` wybranej linii +15 | Wyższy posłuch w wezwaniach (10.3) | P |
| Mediacja sporu z kierownictwem (`union.mediate`) | brak uzgodnionej konkretnej zmiany | Sprzeciw branży −8 | — | P |
| Rozpocząć protest (`union.strike`) | brak uzgodnionego celu | Rekord strajku | Koszty z funduszu branży co aktywny miesiąc (14.2) | P |

**Otwarte pytania:** brak.

## 6. Partia 3 — relacje, program, jedność i doradcy

Karty talii partyjnej, które budują kontakty, program gospodarczy i spójność kierownictwa. Do tego akcje doradców, kroki współpracy z komunistami i ocena sił bezpieczeństwa (8.1, 9.5, 10.1–10.9, 16.8.1, 17.2).

**Status partii:** przejrzana przez użytkownika 26 IX 2026; wszystkie pytania rozstrzygnięte w 0.35 (referencja 23.8).

### 6.1. Stosunki z partiami — `party.outreach`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór | Z |
| Dostęp | Partner z aktualnego składu: Wyzwolenie, Piast, NPR, PSChD albo inny dopuszczony; KPP dopiero po otwarciu kanału (9.5) | Z / P |
| Koszt | 1 T, 0 R | P |
| Limit wyboru | 1 partner | Z |
| Odnowienie | cd 3 M dla tego partnera | P |
| Wyjątek | — | — |
| Zapisuje | Relacja PPS z partnerem, 0–100 | P |
| Odczytują | Ocena ofert (8.3, waga 0,25); bramki list (6.5) i gabinetów (8.6); progi 10/20/30/50 z KPP (9.5–9.6) | P |
| Co zostaje po karcie | Nic; bez deklaracji głosowania, stanowisk i list. Podpisanie oferty pozostaje parlamentarne | Z |
| Obecny kod | `source/scenes/party_affairs/inter_party_relationships.scene.dry`: karta „Talks with Other Parties” według tej tabeli (etap 3, 0.44): jeden partner, +4 albo +2 od 70, odnowienie 3 M na partnera, bez R i bez zmian frakcji, kontakt z KPP. Reguły w `source/rules/polish_government.js`. Dawny roboczy `parliament.outreach` zastępuje `party.outreach` (17.2) | K |
| Źródła i testy | 8.1, 9.5, 10.5, 17.2; testy „Droga do KPP”, „Wrogość a kanał” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Rozmowa z partnerem (`party.outreach`) | cd 3 M dla tego partnera; KPP bez otwartego kanału | Relacja +4, a od 70: +2 | Relacja działa w ocenach ofert i bramkach list oraz gabinetów | Z / P |
| Otworzyć kontakt z KPP (`kpp.contact`) | relacja z KPP <10; kanał już otwarty | `contact_open=true`; relacja +4 | Od następnego miesiąca rozmowy obejmują KPP; dalsze kroki w agendzie „Współpraca z KPP” (6.7 katalogu). Droga: lekka koordynacja po 3 akcjach, pełna po 5 (M17) | Z / P |

**Otwarte pytania:** brak.

### 6.2. Program gospodarczy — `party.economic_program`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór | Z |
| Dostęp | Od stycznia 1922 | P |
| Koszt | 1 T, 0 R | P |
| Limit wyboru | Zestaw 0–3 z pięciu priorytetów w jednej transakcji | Z |
| Odnowienie | cd 6 M | P |
| Wyjątek | Doraźne osłony i wymagane odpowiedzi są dostępne także poza listą priorytetów | P |
| Zapisuje | `S.actors.pps.strategy.economic_priorities`, zbiór; na starcie pusty | P |
| Odczytują | Agenda przygotowania projektów (12.2); oceny ofert i obietnice | P |
| Co zostaje po karcie | Przyjęte priorytety trafiają do agendy jako dostępne przygotowanie, każde z kosztami 12.2 | P |
| Obecny kod | `source/scenes/party_affairs/polish_party_economic_program.scene.dry` (etap 5, 0.46): do trzech z pięciu priorytetów; od 0.51 ten sam zestaw można potwierdzić za 1 T bez skutków; nie wprowadza reformy. Odziedziczona `source/scenes/party_affairs/crisis_program.scene.dry` zależy od niemieckich pól i nie pojawia się w polskiej talii | K |
| Źródła i testy | 10.5, 12.2, 17.2; test „Program gospodarczy” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Stabilizacja z osłonami (`stabilisation_with_protection`) | czwarty element zestawu | Zapis priorytetu | Wariant tolerowania Grabskiego i osłony płac oraz bezrobotnych (9.7) | Z / P |
| Roboty publiczne i zatrudnienie (`public_works`) | czwarty element zestawu | Zapis priorytetu | Projekt pracy i inwestycji; później finansowanie i wykonawca | Z / P |
| Podatki majątkowe i kapitał na inwestycje (`wealth_and_investment`) | czwarty element zestawu | Zapis priorytetu | Wybór instrumentu z 11.9; deklaracja nie dodaje B | Z / P |
| Uspołecznienie wybranych przedsiębiorstw (`socialisation`) | czwarty element zestawu | Zapis priorytetu | Przygotowanie zakresu przejęć, rekompensat i zarządzania | Z / P |
| Program agrarno-robotniczy (`agrarian_labour`) | czwarty element zestawu | Zapis priorytetu | Wariant parcelacji, modernizacji albo ochrony pracy rolnej (12.6) | Z / P |
| Pusty zestaw | — (przy pustym obecnym zestawie: potwierdzenie za 1 T, bez skutków) | Świadome wycofanie priorytetów, bez nagrody | Nie kasuje ukończonej ustawy, wydatku ani podpisanej obietnicy | Z |

Zatwierdzić można także zestaw równy obecnemu: to potwierdzenie za 1 T i odnowienie 6 M, bez innych skutków; odłożenie karty na rękę bez zatwierdzenia jest bezpłatne (Z — 0.51, zastępuje Z — 0.35). Ponowne wybranie istniejącego priorytetu nie daje postępu projektu. Zestaw może łączyć stabilizację i roboty publiczne; o zgodności decydują finansowanie i zakres oferty.

**Otwarte pytania:** brak.

### 6.3. Jedność i kierownictwo — `party.unity`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór | Z |
| Dostęp | Tylko gdy któraś frakcja ma sprzeciw ≥30 albo kanał z KPP jest otwarty | Z / P |
| Koszt | Zależnie od opcji: ustępstwo dla frakcji 1 T i 1 R; linia współpracy z KPP 1 T, 0 R; odroczenie 1 T, 0 R; czystka 1 T i 1 R | P |
| Limit wyboru | 1 opcja | Z |
| Odnowienie | Ustępstwo cd 3 M; linia współpracy z KPP cd 6 M; odroczenie raz na sprawę; czystka cd 12 M | P |
| Wyjątek | — | — |
| Zapisuje | Siła i sprzeciw frakcji; `S.faction_cases`, w tym termin odroczenia; `pps_internal_acceptance` przy kompromisie w sprawie komunistów | P |
| Odczytują | Spójność (10.1), posłuch (10.3), E3 (10.2), współpraca z KPP (9.5–9.6) | P |
| Co zostaje po karcie | Zamknięta, odroczona albo nadal otwarta sprawa frakcji; przy czystce manifest odejścia | P |
| Obecny kod | `source/scenes/party_affairs/polish_party_unity.scene.dry` (etap 5, 0.46): w puli przy sprzeciwie frakcji ≥ 30 albo przy otwartym kanale z KPP; ustępstwo, linia współpracy z KPP, odroczenie sprawy frakcji i czystka (6.4 katalogu). Odziedziczona `source/scenes/party_affairs/party_disunity.scene.dry` ma warunek `not polish_party_rules` | K |
| Źródła i testy | 10.1, 10.2, 10.5, 10.9, 9.5, 17.2; testy „Kompromis w PPS”, „Akceptacja a KPP”, „Czystka”, „Odroczenie sprawy frakcji”, „Dwa warianty kompromisu”, „Dostęp karty Jedność” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Kompromis: ustępstwo dla jednej frakcji (`party.faction_conference`) | brak ustępstwa zgodnego z profilem frakcji; brak 1 R; cd 3 M | −1 R; sprzeciw tej frakcji −8 | — | Z / P |
| Kompromis: linia współpracy z komunistami | kanał z KPP zamknięty; cd 6 M | +15 poparcia układu w każdej frakcji (`pps_internal_acceptance`, start 50) | Od 60: brak kary Centrum w 9.6 i spełniona jedna z bramek trwałego frontu (M13) | Z / P |
| Przekonać do odroczenia | brak konkretnego żądania frakcji; sprzeciw <45; sprawa już raz odroczona | Sprawa odroczona o 3 M; sprzeciw bez zmian | Przez 3 M ta sprawa nie wywołuje E3, potem wraca | Z / P |
| Usunąć część frakcji (`party.faction_expulsion`) | warunki 10.9 | Zob. 6.4 katalogu | — | Z / P |

Nie ma zwykłego „Utrzymać linię”; w kryzysie E3 utrzymanie linii zostaje odpowiedzią (9.10 katalogu). Zmiana doradców jest osobną kartą (6.5 katalogu). Zasady od 0.35.

**Otwarte pytania:** brak.

### 6.4. Usunięcie części frakcji — `party.faction_expulsion`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Opcja karty Jedność i kierownictwo albo agenda sporu | Z |
| Dostęp | Frakcja ma dodatnią siłę i `dissent ≥ max(30, 100*Q.dissent)` | P |
| Koszt | 1 T, 1 R | P |
| Limit wyboru | 1 wskazana frakcja | Z |
| Odnowienie | Wspólne cd 12 M | P |
| Wyjątek | Rozłam i czystka nie mogą drugi raz usunąć tej samej osoby | P |
| Zapisuje | `S.faction_cases` (`resolution=expulsion`, `departure_manifest_id`); siły i sprzeciw frakcji, `member_index`, preferencje PPS, `faction_seats` | P |
| Odczytują | Spójność (10.1); większość własnego gabinetu po odejściu posłów | P |
| Co zostaje po karcie | Posłowie zachowują mandaty w innym klubie albo jako niezrzeszeni; podpisane zobowiązania zostają | Z |
| Obecny kod | Opcja czystki w `source/scenes/party_affairs/polish_party_unity.scene.dry` (etap 5, 0.46): 1 T, 1 R, wspólne odnowienie 12 M, bramka `max(30, sprzeciw partii)`; odejście tym samym rachunkiem co rozłam E3 w `source/rules/polish_party.js` | K |
| Źródła i testy | 10.9, 10.2, 17.2; testy „Czystka”, „Rozłam i czystka”, „Zamrożeni posłowie” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Usunąć 25% zaplecza wskazanej frakcji | warunek sprzeciwu niespełniony; brak 1 R | Udział odchodzących = 0,25 × siła/100; siła ×0,75 i jedna normalizacja; sprzeciw frakcji −15; członkostwo i preferencje PPS ×(1 − udział); głosy do rywala z manifestu albo `other`; 25% posłów frakcji, zaokrąglone raz | Doradcy wskazani w rosterze odchodzą bez dodatkowej kary odwołania; Milicja i związki tracą tylko ludzi wskazanych w manifeście | Z / P |

Przykład z 10.9: frakcja o sile 20 ma potem ok. 15,79 siły; PPS traci 5% poparcia; sprzeciw spada np. z 60 do 45.

**Otwarte pytania:** brak.

### 6.5. Zmiana doradców — `party.advisors`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Partia, zwykły dobór; osobna karta (od 0.35) | Z |
| Dostęp | Osoby dostępne według dat profili; trzy aktywne miejsca | Z / P |
| Koszt | 1 T | P |
| Limit wyboru | Jedna końcowa obsada trzech miejsc w jednej transakcji | P |
| Odnowienie | cd 6 M; nie resetuje odnowienia akcji doradców | P |
| Wyjątek | — | — |
| Zapisuje | Aktywne miejsca, `appointed_once`, siły i sprzeciw frakcji | P |
| Odczytują | Akcje doradców (6.6 katalogu), spójność (10.1) | P |
| Co zostaje po karcie | Nic w agendzie | P |
| Obecny kod | `source/scenes/party_affairs/polish_party_advisers.scene.dry` (etap 5, 0.46): jedna końcowa obsada do trzech osób, 1 T, odnowienie 6 M, bez resetu odnowienia akcji; od 0.52 karta nazywa się „Zmiana składu Centralnego Komitetu Wykonawczego” (ang. „Change the Central Executive Committee”); w rozdziale 1 bez Próchnika, Drobnera i Dubois. Odziedziczona `source/scenes/party_affairs/shuffle_leadership.scene.dry` ma warunek `not polish_party_rules`; `source/scenes/advisors/shuffle_leadership_pinned.scene.dry` jest niewidoczna | K |
| Źródła i testy | 10.4.2, 10.5, 17.2; testy „Nowe powołanie”, „Start i odwołanie” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Pierwsze powołanie dostępnej osoby | brak wolnego miejsca w końcowej obsadzie | Frakcja osoby: +5 surowej siły, potem normalizacja; −5 sprzeciwu, do 0 | — | Z / P |
| Odwołanie aktywnego doradcy | — | Frakcja osoby: +5 sprzeciwu, do 99 | — | Z / P |
| Ponowne powołanie tej samej osoby | — | Bez ponownej premii | — | P |

Początkowi doradcy Daszyński, Pużak i Perl są oznaczeni jako już powołani, bez premii wstecz. Pozorne odwołanie i ponowne dodanie tej samej osoby w jednym menu niczego nie daje.

**Otwarte pytania:** brak.

### 6.6. Akcje doradców — `advisor.*`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Menu doradców, poza ręką | Z |
| Dostęp | Aktywny doradca w jednym z trzech miejsc i warunki jego akcji | Z / P |
| Koszt | 0 T; R według akcji: 0 albo 1 | P |
| Limit wyboru | Jedna akcja | P |
| Odnowienie | Wspólne cd 6 M dla wszystkich doradców (`S.cooldowns.advisor_action`) | P |
| Wyjątek | Przekierowanie do karty rządowej wykonuje jeden krok za 0 T i zużywa wspólne odnowienie (10.4.4) | P |
| Zapisuje | Według akcji; czasowe modyfikatory w `S.advisors.effects` | P |
| Odczytują | — | — |
| Co zostaje po karcie | Efekty na 6 M wygasają; zamknięcie podglądu nic nie pobiera; odmowa z braku środków nie zużywa doradcy | P |
| Obecny kod | Pliki osób w `source/scenes/advisors/` (etap 5, 0.46): akcje z 10.4.3 przez `PolishParty.advisorAction` w `source/rules/polish_party.js`, 0 T, własne R, wspólne odnowienie 6 M. Arciszewski, Moraczewski i Czapiński otwierają karty rządowe z jednym krokiem za 0 T (Czapiński: Skarb, a od etapu 6, 0.47, także Przemysł dla własności publicznej i reprezentacji, gdy dana opcja jest wykonalna); karta otwarta przez doradcę ma zamknięcie w trybie doradcy. Próchnik, Drobner i Dubois mają tylko powrót (kontynuacja). Żadna scena doradcy nie zapisuje `pro_republic`. Od etapu 8 (0.49, decyzja 5A) warunkowe tolerowanie Ziemięckiego jest dostępne przy poparciu z zewnątrz, na podstawie umowy, mniejszościowego gabinetu Śliwińskiego albo Piłsudskiego; wcześniej żaden gabinet nie miał tego profilu | K |
| Źródła i testy | 10.4.2, 10.4.3, 10.4.4, 10.4.5; testy „Pużak”, „Jedno przekierowanie”, „Brak resortu”, „Piłsudczycy”, „Miasta i klasy”, „Efekty czasowe”, „KPP i Lewica”, „Późni doradcy”, „Doradca” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| A1 Daszyński: Parliamentary Compromise (`advisor.daszynski.parliamentary_compromise`) | — | 0 R; relacje: Piast +5, NPR +5, PSChD +4 | Tolerowanie nadal wymaga kandydata, programu i poparcia | Z / P |
| A1 Daszyński: Broker a Coalition (`advisor.daszynski.broker_coalition`) | brak koalicji i negocjacji szerokiego gabinetu | 0 R; jeden tryb: napięcie każdej aktywnej umowy gabinetowej −10 albo +5 do oceny jednej oferty szerokiego gabinetu | Bonus wygasa po rozstrzygnięciu oferty albo po 6 M; bez obejścia bramki kryzysu | Z / P |
| A2 Pużak: Party Discipline (`advisor.puzak.party_discipline`) | — | 0 R; każda frakcja −12 sprzeciwu, do 0 | Nie usuwa przyczyn przyszłych przyrostów | Z / P |
| A2 Pużak: Mobilize the Organization (`advisor.puzak.mobilize_organization`) | brak 1 R | −1 R; `base_reach_pps` komórek robotniczych +10, do 100 | Kampanie pracownicze ×1,20 przez 6 M | Z / P |
| A3 Perl: Define the Party Line (`advisor.perl.define_party_line`) | po III 1927 | 0 R; Centrum +8 surowej siły, Piłsudczycy −4, sprzeciw Centrum −8; transfer KPP → PPS bazowo 1 pp w komórkach robotniczych (10.4.4) | — | Z / P |
| A3 Perl: Direct the Party Press (`advisor.perl.direct_party_press`) | brak działającej prasy; po III 1927 | −1 R; `press.credibility` +5, do 100 | Kampanie prasowe ×1,25 przez 6 M | Z / P |
| A4 Niedziałkowski: Build Centrolew (`advisor.niedzialkowski.build_centrolew`) | — | 0 R; Piast, Wyzwolenie, NPR i PSChD po +3 relacji | Może odblokować listę i rozmowy (6.5, 8.6), bez sojuszu i większości | Z / P |
| A4 Niedziałkowski: Defend Constitutional Democracy (`advisor.niedzialkowski.defend_democracy`) | — | 0 R; demokracja +5; nastawienie organizacji PPS do obrony legalnych instytucji +5 | Przez 6 M poparcie jawnie autorytarnego projektu: Centrum +5 sprzeciwu raz na projekt | Z / P |
| A5 Arciszewski: Labour Programme (`advisor.arciszewski.labour_programme`) | PPS poza rządem albo bez Pracy | Przekierowanie do `government.labor_rights` albo `government.social_welfare`, jeden etap za 0 T | Zwykłe koszty R, B i prawo | Z / P |
| A5 Arciszewski: Organize the Workers (`advisor.arciszewski.organize_workers`) | brak 1 R | −1 R; wybrana branża: zasięg +8; PPS bazowo +3 pp w jej komórkach robotniczych | — | Z / P |
| A6 Zaremba: Worker-Peasant Front (`advisor.zaremba.worker_peasant_front`) | — | 0 R; Wyzwolenie +8 relacji | Bez listy tworzonej samą nazwą frontu | Z / P |
| A6 Zaremba: Class Campaign (`advisor.zaremba.class_campaign`) | brak 1 R | −1 R; bazowo +4 pp u robotników zatrudnionych, +3 pp u bezrobotnych, −2 pp u drobnomieszczaństwa; Lewica +4 surowej siły, sprzeciw −5 | — | Z / P |
| A7 Czapiński: Socialist Economic Programme (`advisor.czapinski.socialist_economic_programme`) | PPS poza gabinetem; brak resortu albo umowy wykonania | Jedna z trzech polityk: przejęcie publiczne, finansowanie progresywne lub majątkowe, reprezentacja pracownicza; dostęp albo jeden etap za 0 T | Prawo, pieniądze i wykonawca nadal potrzebne | Z / P |
| A7 Czapiński: Socialist Education (`advisor.czapinski.socialist_education`) | brak działającego TUR; brak 1 R | −1 R; Lewica +6 surowej siły, sprzeciw −5 | Przez 6 M odpływ PPS → KPP w komórkach robotniczych ×0,50 | Z / P |
| A8 Jaworowski: Back Piłsudski (`advisor.jaworowski.back_pilsudski`) | — | 0 R; relacja z Piłsudskim +8; Piłsudczycy +5 surowej siły; Centrum i Lewica po +3 sprzeciwu | Przy sprzeczności z przyjętą linią raz wyższa kara zamiast dwóch | Z / P |
| A9 Moraczewski: Public Works Programme (`advisor.moraczewski.public_works_programme`) | PPS poza rządem; brak Pracy albo umowy wykonania | Przekierowanie do `government.public_works`, jeden etap za 0 T | — | Z / P |
| A10 Ziemięcki: Conditional Toleration (`advisor.ziemiecki.conditional_toleration`) | brak `external_support` wobec gabinetu `pilsudski_aligned` z faktyczną umową | 0 R; Centrum −10, Lewica −8 sprzeciwu | Nie zmienia rodzaju poparcia | Z / P |
| A10 Ziemięcki: Municipal Socialism (`advisor.ziemiecki.municipal_socialism`) | brak 1 R | −1 R; `base_reach_pps` +8 i PPS bazowo +2 pp w zakresie dużych miast | Bez ratusza, budżetu miejskiego i mieszkań | Z / P |
| A11 Malinowski: Organize the Piłsudczyks (`advisor.malinowski.organize_pilsudczyks`) | — | 0 R; Piłsudczycy +8 surowej siły, sprzeciw −10 | Bez zmiany relacji z Piłsudskim i armii | Z / P |
| A12 Próchnik i A13 Drobner (`advisor.prochnik.republican_left`, `advisor.drobner.negotiate_kpp`, `advisor.drobner.joint_workers_action`) | zawsze w rozdziale 1 | — | Obsada kontynuacji (M17); akcje zapisane dla rozdziału 2 | Z |

Transfery poparcia używają wzoru z 10.4.4 i jednej migawki sprzed akcji. Dubois zachowuje miejsce w puli kontynuacji od 1930.

**Otwarte pytania:** brak.

### 6.7. Współpraca z KPP: agenda — `kpp.trial`, `kpp.rules`, `kpp.agreement`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Stała pozycja agendy „Współpraca z KPP”, poza ręką; pojawia się po otwarciu kontaktu (6.1 katalogu) | Z |
| Dostęp | Otwarty kanał z KPP; pozycja pokazuje następny krok, którego warunki są spełnione | Z / P |
| Koszt | 1 T za krok; szerszy układ 1 T i 1 R; odpowiedź w wydarzeniu 0 T, nigdy oba koszty za tę samą umowę | P |
| Limit wyboru | Jeden krok | P |
| Odnowienie | — | — |
| Wyjątek | Próbę można też uzgodnić odpowiedzią w wydarzeniu strajkowym (9.7 katalogu), za 0 T | P |
| Zapisuje | `S.actors.communist_cooperation`: `contact_open`, `trial_records`, `rules`, `pps_internal_acceptance`, `active_agreement` | P |
| Odczytują | Dyscyplina KPP (9.6); oferty `united_left` i `workers_front` (8.6) | P |
| Co zostaje po karcie | Rekordy prób i przyjęte zasady | P |
| Obecny kod | Pozycje stałej karty `source/scenes/polish_party_agenda.scene.dry` (etap 5, 0.46) przy otwartym kanale z KPP: próba (relacja 30 i wspólne żądanie z etapu 6), reguły i szerszy układ. Reguły w `source/rules/polish_party.js`. Od etapu 8 (0.49) agenda nie pokazuje próby, bo nigdy nie była osiągalna: w tym rozdziale próbę uzgadnia się w strajku, w kroku współpracy z komunistami (9.7 katalogu); scena próby zostaje w pliku. Szerszy układ (reguły i porozumienie) otwiera oferty gabinetów z KPP | K |
| Źródła i testy | 9.5, 9.6, 8.6, 17.2; testy „Droga do KPP”, „Komuniści”, „Kompromis w PPS”, „Kontakt i agenda KPP” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Uzgodnić próbę (`kpp.trial`) | relacja <30; brak istniejącego żądania | 1 T; zapis uzgodnionej próby | Wykonana próba: relacja +5 za pełną, +2 za lekką współpracę; naruszenie zasad −5 | Z / P |
| Uzgodnić zasady (`kpp.rules`) | mniej niż dwie różne udane akcje, w tym jedna pełna; relacja <50 | 1 T; stanowisko wobec legalności, przemocy i samodzielności PPS | — | Z / P |
| Zawrzeć szerszy układ (`kpp.agreement`) | zasady nieprzyjęte przez obie strony; `pps_internal_acceptance` <60; brak 1 R | 1 T, −1 R; umowa o wskazanym celu | Trwały front wymaga też relacji ≥65; pierwszy trwały front: Centrum +8 sprzeciwu bez uprzedniej akceptacji | Z / P |

Miejsce kroków i ich ID ustalono w 0.35.

**Otwarte pytania:** brak.

### 6.8. Ocena sił bezpieczeństwa — `security.assess`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Stałe działanie agendy, poza ręką, zawsze dostępne (od 0.35) | Z |
| Dostęp | Od stycznia 1922 | P |
| Koszt | 1 T, 1 R | P |
| Limit wyboru | Jedno działanie | P |
| Odnowienie | cd 3 M | P |
| Wyjątek | — | — |
| Zapisuje | `S.security.known`: nowa datowana ocena; promień błędu −10 pp, nie mniej niż 5 pp (początek ±30 pp) | P |
| Odczytują | Prognozy przed F4 i F5 (16.8.1–16.8.2) | P |
| Co zostaje po karcie | Nowa ocena do czasu kolejnej | P |
| Obecny kod | `source/scenes/polish_party_agenda.scene.dry` i `source/rules/polish_security.js` (etap 7, 0.48): stałe działanie agendy partii za 1 T i 1 R, cd 3 M; promień 30 → 20 → 10 → 5 pp; środek przedziału przesuwa zapisany rzut, a Status pokazuje tylko przedział | K |
| Źródła i testy | 17.2, 16.8.1, 16.8.2 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Ocenić siły (`security.assess`) | cd 3 M; brak 1 R | −1 R; węższy przedział znanych lojalności | Lepsza prognoza stron zgrupowań | P |

Trzy oceny zawężają przedział z ±30 do ±5 pp. Wcześniejsza ocena może się zestarzeć, bo lojalności zmieniają się z demokracją (16.1).

**Otwarte pytania:** brak.

## 7. Partia 4 — karty parlamentarne

Dziesięć rodzin z manifestu 17.10. Są to rodziny wyborów, nie dziesięć kart losowanych w każdej sytuacji. Zwykła inicjatywa kosztuje 1 T, obowiązkowa odpowiedź na rzeczywiste wydarzenie 0 T. Podmenu tej samej oferty nie dolicza czasu. Karty 8–10 pojawiają się po wyzwalaczu, więc mają nagłówek wydarzenia.

**Status partii:** przejrzana przez użytkownika 26 IX 2026; wszystkie pytania rozstrzygnięte w 0.36 (referencja 23.9).

### 7.1. Tworzenie gabinetu i udział PPS — `parliament.cabinet_formation`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Parlament; agenda formowania | Z |
| Dostęp | Wynik wyborów 1922, rzeczywisty upadek gabinetu albo przyjęta propozycja przebudowy rządu. Dobrowolna inicjatywa wymaga dostępnego kandydata i co najmniej jednego zainteresowanego partnera | Z |
| Koszt | Obowiązkowe formowanie 0 T; własna inicjatywa 1 T łącznie, bez dodatkowego czasu za ministrów, kandydata i mniejszości | P |
| Limit wyboru | Jedna oferta: układ i kandydat, tryb PPS, program, poparcie mniejszości i resorty; jedno zatwierdzenie (C1) | Z |
| Odnowienie | Brak odnowienia, ale odmowa nie otwiera darmowej kopii tej samej oferty; kolejna próba wymaga zmienionej oferty albo sytuacji (8.3) | Z |
| Wyjątek | Gabinety kryzysowe (`broad_centre`, `skrzynski_broad`, `national_unity`, nadzwyczajna oferta ekspercka) tylko przy `crisisOfferAllowed`; w otwarciu po 1922 są wyszarzone | Z |
| Zapisuje | `Negotiation` (`kind=cabinet`, `context`, `configuration_id`, `candidate_id`, `programme_profile`, `pps_mode_proposed`, `seek_minority_support`, `minority_terms`, `availability_snapshot`, `phase`); `Agreement`; `Cabinet` (`status`, `pps_mode`, resorty) | P |
| Odczytują | Ocena ofert (8.3), wykonanie resortów (8.5), odpowiedzialność za rząd (5.6), kruchość rządu (14.4) | P |
| Co zostaje po karcie | Umowy z obowiązkami (9.1) i miesięcznym napięciem (9.2). Po odmowie PPS pozostali tworzą wykonalny gabinet (8.7) albo zostaje gabinet pełniący obowiązki i otwarty kryzys. Po trzech nieudanych propozycjach: impas (8.7) | Z |
| Obecny kod | `source/scenes/polish_cabinet_formation.scene.dry` (etap 3, 0.44): jedna oferta C1, obowiązkowa po wyborach 1922 i po upadku rządu, własna inicjatywa w talii „Parliament”. Reguły w `source/rules/polish_government.js`; otwarcie z Ponikowskim w `source/scenes/polish_opening_state.scene.dry`. Od etapu 6 (0.47) warunki osłon Grabskiego otwierają aparat 2, zasięg 40 i relacja 40; Grabski odpowiada w tym samym zatwierdzeniu, a tolerowanie go jest umową na 6 M z przeglądem po 3 M. Od etapu 7 (0.48) kandydatami są też Artur Śliwiński (okno VI–VII 1922) i Piłsudski po uzgodnionym premierostwie z 8.15 katalogu; formowanie po kryzysie 1922 (9.1 katalogu) jest obowiązkowe i bezpłatne. Odziedziczona `source/scenes/government_affairs/coalition_affairs.scene.dry` jest zablokowana. Od etapu 8 (0.49): karta podaje przyczynę kryzysu otwartego datowanym wejściem (dymisja Grabskiego, A1); partie Chjeno-Piasta porównują ofertę PPS także z własnym kompromisem; od XII 1923 dziesięciu posłów Piasta głosuje przeciw gabinetowi z prawicą; w szerokim gabinecie Skrzyńskiego NPR przyjmuje Przemysł i Handel zamiast Pracy (8.9 referencji); oferty z KPP wymagają szerszego porozumienia z KPP, a KPP nie żąda w nich resortu | K |
| Źródła i testy | 8.3, 8.4, 8.6, 8.7, 8.8, 9.7, 17.10, 17.14; testy „Wspólna karta gabinetowa”, „Gabinet po wyborach”, „Poparcie mniejszości”, „Narastanie kryzysu”, „Wykonalność jedności narodowej”, „Premier ekspercki”, „C1”, „C2/C3” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Konfiguracja i kandydat (np. `left_minority`, `centre_left`, `skrzynski_broad`) | brak dostępnego kandydata, dopuszczalnych warunków albo realnego poparcia; bramka kryzysu | Ocena partnerów 8.3: przyjęcie przy wyniku ≥60 i spełnionych twardych warunkach | Umowa z terminami; powołanie dopiero po legalnej procedurze | Z / P |
| Udział PPS: członek gabinetu (`member`) | brak uzgodnionego resortu | Resorty PPS według oferty; odpowiedzialność PPS za rząd 1 | Kompetencje resortów (8.5) | Z / P |
| Udział PPS: zewnętrzne poparcie (`external_support`) | — | Tolerowanie według umowy; odpowiedzialność 0,5 | Warunki programowe zamiast resortów | Z / P |
| Udział PPS: opozycja (`opposition`) | — | Bez zgody partnerów; odpowiedzialność 0 | Pozostali mogą utworzyć gabinet bez PPS | Z |
| Zabiegać o poparcie mniejszości (przełącznik) | — | Przeliczenie wykonalności; warunki w tej samej umowie; dwa segmenty zgadzają się osobno | Odmowa jednego segmentu wymaga ponownego sprawdzenia oferty przed powołaniem | Z / P |
| Grabski i profil stabilizacji (`candidate_id=grabski`, `programme_profile=stabilisation`) | poza oknem profilu (test: od XII 1923) | Warianty z 9.7: tolerować za osłony i podatek majątkowy; tolerować za pożyczkę i ograniczenie cięć; opozycja | Tolerowanie na 6 M z przeglądem po 3 M. Rozmowa o osłonach wymaga aparatu ≥2, zasięgu branży ≥40 i relacji z adresatem ≥40 | Z / P |

Czerwonych linii, brakujących mandatów i bramki kryzysu nie można ominąć wydaniem R. Niepewna zgoda jest oznaczona „wymaga uzgodnienia”, a nie liczona jako głos.

**Impas (Z — 0.36).** Po trzech nieudanych propozycjach powołania gra wchodzi w impas. To stan, nie karta:
- panel pokazuje „Impas: rządzi gabinet pełniący obowiązki”; taki gabinet wykonuje tylko bieżące zadania, a w rokowaniach strajkowych jest najsłabszy (kruchość 100);
- formowanie wraca jako obowiązkowe, gdy pojawi się nowy kandydat albo istotna zmiana poparcia: nowa umowa, rozłam albo transfer posłów; PPS może też spróbować sama za 1 T ze zmienioną ofertą;
- przy uchwalonym arbitrażu prezydenta (7.4 katalogu) prezydent może rozwiązać Sejm; bez tej reformy nic nie dzieje się automatycznie.

**Otwarte pytania:** brak.

### 7.2. Zabezpieczenie bezrobotnych, D1 i D2 — `parliament.legislative_program`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Parlament; gwarantowana agenda po wyborach 1922 | Z |
| Dostęp | Po wyborach 1922 i tylko gdy `pps_mode != member`; jedna inicjatywa w rozdziale | Z |
| Koszt | D1 1 T; D2 0 T | P |
| Limit wyboru | Jeden wybór w każdej z dwóch kart | Z |
| Odnowienie | Jednorazowa w rozdziale. Odrzucenie, wycofanie, doradca ani objęcie resortu nie odnawiają D | Z |
| Wyjątek | Gdy PPS wejdzie do rządu przed D2, D2 jest zawieszona do wyjścia, bez nowej opłaty | P |
| Zapisuje | `chapter.unemployment_bill`: status, wybrany i uchwalony wariant, `project_id`, `ballot_ids`, `submitted_at`, `senate_notice_due`, `senate_return_due`, `effective_at`, zakres kompromisu. Projekt osłony z `sponsor=pps`, `executor=labor_administration` | P |
| Odczytują | Budżet i wykonanie (11.3, 12.3), zasługa autora (5.4), odpowiedzialność | P |
| Co zostaje po karcie | Datowana procedura bez decyzji gracza: Senat +30 dni, zwrot +60, promulgacja; po wejściu w życie obciążenie 2 B albo 1 B | P |
| Obecny kod | `source/scenes/polish_unemployment_bill.scene.dry` (etap 4, 0.45): stała karta od wyniku wyborów 1922, gdy PPS nie jest członkiem gabinetu; D1 za 1 T, D2 za 0 T po rozliczeniu miesiąca. Procedura ustawy, kompromis i osłona w `source/rules/polish_projects.js`; rekord `S.chapter.unemployment_bill` | K |
| Źródła i testy | 17.15 (D), 7.2, 11.3, 12.3, 5.4; kryteria D–G w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| D1: Rozpocząć inicjatywę ustawodawczą PPS | PPS w rządzie; przed wyborami 1922; inicjatywa już użyta | 1 T; gotowy pełny projekt z kosztem, finansowaniem i wykonawcą | D2 w następnym oknie parlamentarnym, po rozliczeniu miesiąca D1 | Z / P |
| D1: Nie podejmować inicjatywy | — | 0 T; oferta zamknięta na rozdział, bez premii | — | Z |
| D2: Podtrzymać pełny projekt | — | 0 T; głosowanie Sejmu od razu | Pełny wariant: 2 B, ulga początkowa −6 i bieżąca 2. Projekt może upaść | Z / P |
| D2: Przyjąć ograniczony wariant | brak konkretnego klubu gotowego poprzeć ograniczony wariant | 0 T; głosowanie ograniczonego wariantu | 1 B; ulgi −3 i 1 | Z / P |
| D2: Wycofać projekt | dostępne tylko wtedy, gdy nie ma oferty kompromisu | 0 T; status `withdrawn` | Koniec inicjatywy | Z |

**Otwarte pytania:** brak.

### 7.3. Budżet i koszty kryzysu — `parliament.finance_amendment`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Parlament; pula albo agenda faktycznego pakietu | Z |
| Dostęp | `canUseBudgetCard`: aktywny gabinet, oczekujący budżet albo pakiet fiskalny, PPS w gabinecie albo z obowiązującym wsparciem tego gabinetu | Z / P |
| Koszt | 1 T za zwykłą inicjatywę; odpowiedź na obowiązkową ofertę 0 T | P |
| Limit wyboru | 1 opcja | Z |
| Odnowienie | Brak; każda próba kosztuje 1 T, a odrzuconej oferty nie ponawia się bez zmiany oferty albo sytuacji (8.3) | Z / P |
| Wyjątek | Opozycja głosuje nad budżetem w obowiązkowej procedurze, ale nie ma tej karty; zakończenie wsparcia ją wyłącza | Z |
| Zapisuje | Oferta w `Negotiation`; instrumenty `Policy` (11.9) po przyjęciu | P |
| Odczytują | Budżet (11.2), instrumenty (11.9), reakcja kapitału (11.7) | P |
| Co zostaje po karcie | Przyjęta poprawka nadal wymaga legalnego finansowania i głosowania | Z |
| Obecny kod | `source/scenes/polish_budget_package.scene.dry` (etap 4, 0.45): stała karta, gdy pakiet gabinetu, którego PPS jest członkiem albo który wspiera, czeka na głosowanie Sejmu; odpowiedź 0 T raz na pakiet. Pakiety i przegląd gabinetu w `source/rules/polish_projects.js`. Odziedziczona `source/scenes/government_affairs/fiscal_policy.scene.dry` jest zablokowana warunkiem `not polish_economy_system` | K |
| Źródła i testy | 17.10, 11.9, 9.7; test „Budżet” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Poprzeć pakiet | — | Poparcie pakietu w zaproponowanym kształcie | Odpowiedzialność za popartą politykę (5.4) | Z |
| Chronić wydatki robotnicze | — | Warunek usunięcia cięcia wskazanych świadczeń; budżet traci tę oszczędność | Ocena partnerów 8.3 | Z / P |
| Przenieść ciężar na majątek | — | Oferta z podatkiem progresywnym albo nadzwyczajnym podatkiem majątkowym (11.9) | Presja kapitału +4 albo +8 | Z / P |
| Zaproponować pożyczkę zamiast cięć | kredyt <40; brak zgody finansujących | Oferta z krajową pożyczką (11.9): +3 B przez 6 M, potem −1 B przez 12 M | Następna pożyczka dopiero po zakończeniu obsługi | Z / P |
| Odmówić | — | Brak poparcia pakietu | — | Z |

Opcje korzystają z gotowych narzędzi 11.9, a warunki PPS partnerzy oceniają według 8.3 (Z — 0.36). Jeśli głosy PPS były potrzebne, odmowa oznacza upadek pakietu.

**Otwarte pytania:** brak.

### 7.4. Reforma konstytucyjna — `parliament.constitution_project`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Parlament; pula przygotowania, potem agenda | Z |
| Dostęp | Od stycznia 1922; wniosek wymaga co najmniej 111 posłów (7.1) | H / P |
| Koszt | Przygotowanie 2 główne akcje; wykonanie obciąża 1 B przez 1 M, bez utrzymania | P |
| Limit wyboru | Jeden projekt na transakcję; trzy odrębne projekty | Z |
| Odnowienie | Brak; odrzuconej oferty nie ponawia się bez zmiany (Z — 0.36) | Z / P |
| Wyjątek | Doradca zastępuje krok tylko wtedy, gdy jego akcja obejmuje ten projekt; „Defend Constitutional Democracy” go nie przygotowuje | P |
| Zapisuje | `Q.polish_presidency.constitution.reforms`: trzy pola, domyślnie false; własny `law_id` każdego projektu | P |
| Odczytują | Zmiana konstytucji (7.1), odwołanie gabinetu (C7), wcześniejsze wybory (7.4) | P |
| Co zostaje po karcie | Projekt w agendzie od przygotowania; skutek po promulgacji i 1 M wdrożenia | P |
| Obecny kod | `source/scenes/polish_constitution_project.scene.dry` (etap 4, 0.45) w talii „Parliament”: pierwsza akcja przygotowuje tekst, druga składa wniosek w stałej karcie `source/scenes/polish_agenda.scene.dry`. Rekord `Q.polish_presidency.constitution.reforms`; `constructive_vonc` jest jego adapterem. Własne przygotowanie arbitrażu prezydenta zablokowane do etapu 5. Odziedziczona `source/scenes/government_affairs/constitutional_reform.scene.dry` jest zablokowana warunkiem `not polish_economy_system` | K |
| Źródła i testy | 7.1, 7.6, 12.4, 17.10; testy „Trzy reformy”, „Szczególna większość”, „C5–C7” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Gwarancje demokratyczne (`democratic_guarantees`) | brak 2/3 w obu izbach przy co najmniej połowie składu | Po wykonaniu: demokracja +3 raz; Wyzwolenie i oba segmenty mniejszości +4 relacji; ZLN przeciw ofercie | Skarga na konkretną represję z terminem t+1; uchylenie tylko tego zakazu | Z / P |
| Konstruktywne wotum nieufności (`constructive_vonc`) | jak wyżej | Obalenie gabinetu wymaga jednocześnie 223 głosów dla uzgodnionego następcy | Chroni też gabinet, którego PPS nie chce | Z / P |
| Arbitraż prezydenta (`presidential_arbitration`) | jak wyżej; własne przygotowanie PPS bez linii `strong_presidency` (10.8) | Po 2 nieudanych próbach powołania gabinetu w 3 M prezydent może rozwiązać Sejm z kontrasygnatą premiera pełniącego obowiązki | Lewica +8 sprzeciwu; sprzeczna umowa demokratyczna wymaga renegocjacji; wybory według kalendarza | Z / P |

**Otwarte pytania:** brak.

### 7.5. Parlamentarna kontrola wojska — `parliament.army_oversight`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Parlament; pula przy przygotowanym projekcie albo konkretnej sprawie wojskowej, agenda po rozpoczęciu | Z |
| Dostęp | Przygotowany projekt albo konkretna sprawa wojskowa | Z |
| Koszt | 1 T za zwykłą inicjatywę; projekt kontroli cywilnej według 12.4 (duży, 1 B przez 3 M) | P |
| Limit wyboru | 1 opcja | Z |
| Odnowienie | Brak; odrzuconej oferty nie ponawia się bez zmiany (Z — 0.36) | Z / P |
| Wyjątek | Przejście między kartą parlamentu a resortem nie tworzy drugiego +0,05 lojalności za ten sam zakres (16.3) | P |
| Zapisuje | Projekt kontroli cywilnej (12.1) z `force_ids` | P |
| Odczytują | Lojalności zgrupowań (16.1–16.3), zdolność zamachowa (16.2) | P |
| Co zostaje po karcie | Projekt w agendzie; skutki dopiero po akcie i wykonaniu | P |
| Obecny kod | `source/scenes/polish_parliament_army_oversight.scene.dry` i `source/rules/polish_projects.js` (etap 7, 0.48): dwie opcje, jeden projekt `army_control` przygotowany przez Sejm, ustawa w agendzie; odrzucona ustawa nie wraca bez zmiany prognozy. Odziedziczona `source/scenes/government_affairs/military_policy.scene.dry` ma warunek `not polish_security_rules` | K |
| Źródła i testy | 17.10, 12.4, 16.3, 17.12.4; test „Nominacja” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Pełniejszy nadzór cywilny | brak procedury albo głosów | Projekt kontroli cywilnej: w ofercie `army=+2`; 1 B przez 3 M | Po wykonaniu wskazana grupa +0,05 lojalności legalnej, odjęte proporcjonalnie od pozostałych | Z / P |
| Ograniczona reforma | jak wyżej | Kompromisowa wersja tego samego projektu: w ofercie `army=0`; 1 B przez 2 M | Po wykonaniu wskazana grupa +0,025 lojalności legalnej | Z / P |

Nie ma płatnych „wyjaśnień ministra” ani „odłożenia”; zamknięcie karty jest bezpłatne (Z — 0.36). Ograniczona reforma łatwiej zdobywa zgodę Piasta, NPR i chadecji, bo ich ideał w sprawach wojska to kompromis (0 w 8.6).

**Otwarte pytania:** brak.

### 7.6. Stosunek do rządu — `parliament.government_support`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Parlament; pula i gwarantowana odpowiedź na kryzys umowy | Z |
| Dostęp | Rzeczywista relacja PPS z gabinetem (członkostwo, tolerowanie); w opozycji przy konkretnej inicjatywie odwołania | Z |
| Koszt | Zwykłe użycie 1 T, 0 R; przy ostrzeżeniu albo ultimatum odpowiedź 0 T raz na sprawę, także w odnowieniu | P |
| Limit wyboru | 1 opcja | Z |
| Odnowienie | cd 3 M na gabinet | P |
| Wyjątek | Po odmowie `bargain` natychmiastowy wybór za 0 T: spełnić groźbę albo się cofnąć (M11) | Z |
| Zapisuje | `Negotiation` z jedną ofertą i odpowiedzią tak/nie; `Agreement` (zakres, termin); `S.cabinet.pps_threat_discounted`; wiarygodność PPS; relacje | P |
| Odczytują | Ocena ofert (8.3), umowy i napięcie (9.1–9.4), odwołanie (7.1), odpowiedzialność (5.6) | P |
| Co zostaje po karcie | Umowy i napięcie według 9.1–9.4; przyjęty postulat wykonuje zwykły wykonawca | P |
| Obecny kod | `source/scenes/polish_government_support.scene.dry` (1 T w talii „Parliament”) i stała karta odpowiedzi `source/scenes/polish_government_response.scene.dry` (0 T), etap 3, 0.44. Żądaniem w grze jest osłona pracownicza z 9.1; od etapu 4 przyjęta staje się obietnicą osłony w pełnym wariancie z terminem. Wzór menu: odziedziczona `source/scenes/government_affairs/dealing_with_toleration.scene.dry`. Niemieckiego automatycznego zarządzenia wyborów nie przenosimy (9.8). Od etapu 8 (0.49) przy otwartej sprawie wojskowej żądaniem może być też kompromis z Piłsudskim pod kontrolą cywilną (`military_compromise`), z groźbą albo bez niej; gabinet wykonuje go sam przy najbliższym przeglądzie, a umowa obowiązuje, dopóki ten gabinet rządzi (A3) | K |
| Źródła i testy | 9.8, 9.1, 9.2, 9.3, 9.4, 8.3, 17.4, 17.10, 17.14; testy „Groźba przyjęta”, „Groźba odrzucona”, „Groźba po cofnięciu”, „Perswazja”, „Rząd bez potrzeby PPS”, „Poparcie gabinetu”, „Utrata partnera”, „C5–C7” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Zakończyć poparcie (`withdraw`) | PPS w opozycji | Wycofanie tolerowania albo ministrów; w tej samej sekwencji decyzja o poparciu odwołania | Odwołanie zależy od głosów i prawa; frakcje reagują na faktyczne zerwanie | Z / P |
| Wynegocjować ustępstwa (`bargain`) | — | Ocena 8.3 ze składnikiem potrzeby; przyjęta oferta zapisuje zakres i termin; każda partia, która ją przyjęła, −3 relacji z PPS | Odmowa: od razu spełnić groźbę albo cofnąć się (wiarygodność −5, `pps_threat_discounted=true`) | Z / P |
| Przekonać rząd (`persuade`) | — | Ocena 8.3 z `need=0`; sukces przy wyniku ≥60 i braku czerwonych linii; relacje bez zmian | Po odmowie zostaje dotychczasowe poparcie | Z / P |
| Utrzymać poparcie (`maintain`) | poza ostrzeżeniem albo ultimatum partnera | Odpowiedź 0 T: bez nowego warunku; nie usuwa niewykonania | Własne zaplecze ocenia tolerowaną politykę | Z |
| W opozycji: poprzeć odwołanie gabinetu (`parliament.no_confidence`) | brak konkretnej inicjatywy; po reformie konstruktywnego wotum brak następcy | Głosowanie według 7.1 | Rząd może przetrwać mimo głosów PPS | Z / P |
| W opozycji: odmówić udziału w obalaniu | — | Głos przeciw albo wstrzymanie | — | Z |

Poza kryzysem nie ma opcji „Utrzymać poparcie”, a zamknięcie karty jest bezpłatne (Z — 0.36).

**Otwarte pytania:** brak.

### 7.7. Porozumienie wyborcze — `parliament.list_agreement`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Parlament; okno przygotowania list | Z |
| Dostęp | Otwarte okno list przed wyborami | P |
| Koszt | Potwierdzenie 1 T raz, także przy odmowie partnerów; oglądanie 0 T | P |
| Limit wyboru | Jeden wybór; w kampanii najwyżej jedno własne porozumienie | Z |
| Odnowienie | Ta sama decyzja na niezmienionym stanie nie daje nowej oceny ani premii | P |
| Wyjątek | — | — |
| Zapisuje | `ElectoralAlliance` (`members`, `accepted_by`, `nomination_terms`, `valid_until`, `withdrawal_rules`); `Negotiation.kind=electoral_list` | P |
| Odczytują | Metoda wyborcza (6.1); ocena ofert (8.3), gdzie `portfolioFit` oznacza podział kandydatur | P |
| Co zostaje po karcie | Po zamknięciu list skład nie zmienia się zwykłą kartą relacji. Po wyborach członkowie mają osobne kluby | Z |
| Obecny kod | `source/scenes/polish_list_agreement.scene.dry` (etap 3, 0.44): okno IX–X 1922 i XII 1927–I 1928, stałe profile list `list_profiles_v1` (P), przyjęta lista w `S.parliament.alliances` i w liczeniu mandatów | K |
| Źródła i testy | 6.2, 6.5, 8.3, 17.10, 17.14; testy „Skład porozumienia”, „Mandaty”, „C2/C3” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Samodzielna lista PPS | — | Pełny program i własne nominacje; bez premii za odmowę sojuszu | — | Z |
| PPS–Wyzwolenie (`left_peasant`) | relacja z Wyzwoleniem <50; ocena <60; sprzeczna aktywna umowa | Wspólna lista; podział miejsc proporcjonalny do głosów | Reforma ziemska z równym dostępem i ochrona pracy jako zobowiązanie | Z / P |
| PPS–NPR (`labour`) | relacja z NPR <60; konfrontacyjny antyklerykalizm w programie | Wspólna lista | Ośmiogodzinny dzień pracy, osłona bezrobotnych, wolność religijna | Z / P |
| Wcześniejszy Centrolew (`centrolew_early`) | relacje z Wyzwoleniem, Piastem i NPR <60; mniej niż 2 wykonane wspólne zobowiązania z udziałem PPS | Wspólna lista czterech partii | Legalna zmiana rządów, minimum społeczne, kompromis ziemski i religijny. Pierwsze przyjęcie: Lewica +3 sprzeciwu | Z / P |
| Zabiegać o porozumienie z blokiem ludowym (`peasant`) | Piast i Wyzwolenie nie przyjmują pakietu ziemskiego | PPS wspiera zbliżenie, ale nie tworzy cudzej listy | Silniejszy partner na wsi | Z / P |

Niepowodzenie zachowuje dotychczasową listę, domyślnie samodzielną. Pierwsze przyjęcie listy, której program rezygnuje z punktów programu robotniczego, daje Lewicy +3 sprzeciwu (Z — 0.36), bez powtórki, jeśli karę naliczyła już zmiana programu. W praktyce dotyczy to wcześniejszego Centrolewu; listy z Wyzwoleniem i z NPR zachowują ochronę pracy. Listy konkurentów (`christian_agrarian`, `chzjn`) powstają bez PPS.

**Otwarte pytania:** brak.

### 7.8. Wybór marszałka — `parliament.speaker_election`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Obowiązkowa sekwencja; instancje `parliament.speaker_1922` i wakancje urzędu | Z |
| Wyzwalacz | Wybrany parlament bez marszałka albo wakat urzędu | Z |
| Okno | Po wyborach 1922, przed grudniową prezydenturą; wakat w dowolnym czasie | P |
| Kolejka | Kategoria 3 z 4.5: wybory i prawnie ustalone głosowania | P |
| Powtarzalność | Nowa instancja przy wakacie; bezpiecznik: nowe głosowanie w następnym miesiącu (M06) | Z |
| Koszt odpowiedzi | Stanowisko PPS 0 T; wcześniejsze dobrowolne negocjacje kosztują zwykłą akcję | P |
| Bez odpowiedzi | Sekwencja obowiązkowa; wybór jest wymagany | Z |
| Zapisuje | `EventRun.payload`: głosy, ewentualne `tie_break`, zwycięzca; aktualny marszałek | P |
| Odczytują | Sukcesja prezydenta (7.3, C9), mediator ugody w zamachu (16.8.5) | P |
| Co zostaje po karcie | Urząd i ewentualna umowa, np. o komisji z Piastem | P |
| Obecny kod | `source/scenes/polish_speaker_election.scene.dry` i `source/rules/polish_institutions.js`: wybór marszałka z głosów klubów, zapis w `S.parliament.speaker_elections` (etap 2) | K |
| Źródła i testy | 7.5, 7.3, 17.10, 17.14; testy „Marszałek i prezydent”, „Remis finalistów urzędu”, „Finał bez większości bezwzględnej”, „Kworum i kandydatury”, „Bezpiecznik wyboru urzędu”, „Zapis losowania urzędu”, „C5–C7” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Poprzeć Eugeniusza Śmiarowskiego | brak zgody kandydata | Wyzwolenie +4 relacji; Centrum −3 sprzeciwu, jeśli zgodne z jego linią | Urząd tylko po wygraniu głosowania; przegrana nie cofa efektu dotrzymanej obietnicy | H / Z / P |
| Uzgodnić poparcie Macieja Rataja | relacja z Piastem <45; brak przyjętego pakietu | Piast +4 relacji; Lewica +3 sprzeciwu, jeśli PPS obiecała wcześniej własnego kandydata | Umowa o konkretnej komisji albo procedurze | H / Z / P |
| Zgłosić Ignacego Daszyńskiego | brak zgody; relacja z Wyzwoleniem <60; żaden inny klub nie podpisuje nominacji | Bez premii za nominację; złamanie wcześniejszej umowy to zwykłe naruszenie | Zwycięstwo: reputacja PPS +5 | Z / P |

Do jednego głosowania trafiają wszystkie podtrzymane kandydatury. Kworum ≥148; zwycięzca ma ponad połowę ważnych głosów; bez tego dogrywka dwóch pierwszych, którą wygrywa większa liczba głosów; przy remisie losowanie 50/50 (M06). H: Rataj i Śmiarowski rywalizowali o urząd w 1922; kandydatura Daszyńskiego to alternatywa P.

**Otwarte pytania:** brak.

### 7.9. Wybór prezydenta — `presidency.election`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Obowiązkowa sekwencja; instancja `presidency.election_1922` i wakancje | Z |
| Wyzwalacz | Legalnie utworzone Zgromadzenie Narodowe albo wakat urzędu | Z |
| Okno | XII 1922; wakat w dowolnym czasie | H / P |
| Kolejka | Kategoria 2 (sukcesja) albo 3 (wybory) z 4.5 | P |
| Powtarzalność | Jedna instancja na wybór; bezpiecznik jak w 7.3 referencji | Z |
| Koszt odpowiedzi | 0 T | P |
| Bez odpowiedzi | Klub PPS głosuje według umowy, a bez niej według zapisanej kolejności akceptowanych kandydatów | P |
| Zapisuje | `PresidentialElectionRun`: `assembly_snapshot`, `pps_nomination`, `preference_snapshot`, `final_ballot`, `winner`, `status`, `tie_break`, `effects_applied` | P |
| Odczytują | Sukcesja i powołanie premiera (8.7); zagrożenie prezydenta (9.4 katalogu) | P |
| Co zostaje po karcie | Przy wyborze marszałka na prezydenta najpierw wybór nowego marszałka, potem zwykła tura | P |
| Obecny kod | `source/scenes/polish_presidential_sequence.scene.dry` i `source/rules/polish_institutions.js`: nominacja PPS, wynik liczony z głosów klubów, zastępstwo marszałka (etap 2); od etapu 7 (0.48) zagrożenie B3 bez menu i odpowiedź B4 z kolejki przed drugim głosowaniem (9.4–9.5 katalogu) | K |
| Źródła i testy | 7.3, 7.1, 17.10, 17.14; testy „Prezydentura bez interaktywnych tur”, „Remis finalistów urzędu”, „Finał bez większości bezwzględnej”, „Kworum i kandydatury”, „Bezpiecznik wyboru urzędu”, „C5–C7” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Zgłosić kandydata PPS | brak dostępnej osoby (test: Daszyński) | Zapis nominacji; od razu końcowy wynik | Zgłoszenie sprzeczne z wiążącą obietnicą to zwykłe naruszenie umowy | Z / P |
| Nie zgłaszać | — | Klub głosuje według umowy albo kolejności akceptowanych kandydatów | — | Z |

Finał dwóch kandydatów wygrywa większa liczba głosów; remis rozstrzyga losowanie 50/50; przy `no_election` urząd sprawuje marszałek, a nowe głosowanie odbywa się w następnym miesiącu (M06). Wybór prezydenta nie kończy rozdziału.

**Otwarte pytania:** brak.

### 7.10. Ugoda i reakcja na represje — `parliament.strike_response`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Odpowiedź w fazie istniejącej sprawy (B11+B12); dostępna także w opozycji | Z |
| Wyzwalacz | `society.krakow_1923` albo inny aktywny protest z represją albo rzeczywistą ofertą ugody | Z |
| Okno | Test X–XI 1923 dla Krakowa; inne protesty w swoim czasie | P |
| Kolejka | Kategoria 5 z 4.5: warunkowe kryzysy | P |
| Powtarzalność | Jedna odpowiedź na fazę sprawy; nowa istotna oferta może wznowić sprawę bez ponownej nagrody | P |
| Koszt odpowiedzi | 0 T, 0 R za stanowisko; wykonanie ugody ze zwykłymi kosztami i zgodami | P |
| Bez odpowiedzi | Odpowiedź obowiązkowa w tej fazie | Z |
| Zapisuje | `parliament_response=null\|demands\|settlement\|order`, wybrana oferta i wynik | P |
| Odczytują | Ugoda i jej wykonanie (14.4–14.5), zgoda związku (17.4) | P |
| Co zostaje po karcie | Umowa ugody z klauzulami (płace, kolej, represje), każda z wykonawcą i terminem t+1 | P |
| Obecny kod | `source/scenes/polish_event_strike_response.scene.dry` (etap 6, 0.47): wydarzenie kolejki raz na fazę sprawy — oferta rządu albo represja; trzy odpowiedzi 0 T: żądania, ugoda i przywrócenie porządku. Reguły w `source/rules/polish_unions.js` | K |
| Źródła i testy | 17.5, 17.5.1, 14.4, 14.5, 17.10; testy „Strajk i Sejm”, „B8+B10 i B11+B12”, „Kraków” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Żądać cofnięcia represji i ustępstw (`demands`) | — | Uzupełnienie oferty o jedno niespełnione żądanie albo przedstawienie żądań, gdy oferty nie ma | Progi 14.4 i zgoda wykonawcy nadal obowiązują | Z / P |
| Szukać ugody i zakończyć strajk (`settlement`) | — | Przyjęcie wykonalnej ugody albo przedstawienie jednego ograniczonego pakietu; wezwanie do uzgodnionego końca | Posłuch według 14.5 | Z / P |
| Poprzeć przywrócenie porządku (`order`) | — | Wycofanie poparcia PPS dla kontynuacji bez nowych ustępstw | Niewykonane obietnice: raz sprzeciw związku +10 i zaufanie −8. Apel nie kończy protestu i nie jest rozkazem dla policji | Z / P |

**Otwarte pytania:** brak.

## 8. Partia 5 — karty rządowe

Szesnaście rodzin z manifestu 17.11. Zasady wspólne dla wszystkich (17.11):
- zwykłe inicjatywy trafiają do puli tylko przy właściwym dostępie PPS do resortu; konkretna umowa wykonania z partnerem otwiera tylko jej zakres;
- zwykła akcja kosztuje 1 T; wariant i odbiorcy mieszczą się w decyzji wdrożeniowej małego programu albo w przygotowaniu dużego (12.2);
- kryzysowe skierowanie do istniejącej polityki kosztuje 0 T za odpowiedź, z rzeczywistym kosztem wykonania;
- utrzymanie, odłożenie, pozostawienie właścicielom i odmowa nie dają premii;
- ponowne użycie tego samego wariantu wskazuje istniejący projekt albo nowy, rozłączny zakres, nigdy drugą premię;
- od 0.37 nie ma płatnych opcji utrzymania, odłożenia ani pozostawienia sprawy właścicielom: zamknięcie karty nic nie kosztuje.

Wszystkie obecne sceny rządowe w `source/scenes/government_affairs/` są odziedziczonymi kartami niemieckimi (warunki `spd_in_government` i minister SPD).

**Status partii:** przejrzana przez użytkownika 26 IX 2026; wszystkie pytania rozstrzygnięte w 0.37 (referencja 23.10).

### 8.1. Prawa pracownicze — `government.labor_rights`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; kompetencja Pracy | Z |
| Dostęp | PPS ma Pracę albo umowę wykonania tego zakresu | Z / P |
| Koszt | 1 T; inspekcja jako mała reforma (12.4): 1 B budowy i 1 B działania; układ zbiorowy i odstępstwo 0 B | P |
| Limit wyboru | 1 wariant | Z |
| Odnowienie | Brak odnowienia karty; ten sam wariant wskazuje istniejący projekt | P |
| Wyjątek | Doradca Arciszewski wykonuje jeden etap za 0 T (6.6 katalogu) | P |
| Zapisuje | Projekt inspekcji (12.1); `Agreement` układu zbiorowego; `restriction_id` odstępstwa | P |
| Odczytują | Płace (11.4), niezadowolenie odbiorców (15.1), umowy (9.1) | P |
| Co zostaje po karcie | Działający projekt albo umowa z terminem | P |
| Obecny kod | `source/scenes/government_affairs/polish_gov_labor_rights.scene.dry` (etap 4, 0.45; etap 6, 0.47): inspekcja czasu pracy z ustawą; układ zbiorowy w podmenu trzech branż (1 T, 0 B, płace przez 11.4, termin 12 M) i odstępstwo dla najstarszego zakładu w trudności (6 M; podstawą jest ustawa o czasie pracy). Zakłady i układy zapisuje `source/rules/polish_unions.js`. Dostęp przez resort Pracy PPS. Odziedziczona `source/scenes/government_affairs/labor_rights.scene.dry` jest zablokowana warunkiem `not polish_economy_system` | K |
| Źródła i testy | 17.11, 17.12, 12.4, 11.4; testy „Katalog rządowy”, „Resorty docelowe”, „Jedno przekierowanie” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Inspekcja i egzekwowanie czasu pracy | brak właściwego prawa | Projekt: 1 B budowy przez 2 M, potem 1 B działania | Ochrona +1 poziom; niezadowolenie odbiorców −3 raz przy pierwszym działaniu × wykonanie | Z / P |
| Układy zbiorowe | brak pracodawcy i związku gotowych do umowy | 0 B, bo płaci podpisujący pracodawca. `Agreement`: pracodawca, związek, objęci pracownicy, warunki i termin | Efekt płacowy raz przez 11.4; bez oporu przedsiębiorców | Z / P |
| Ograniczone odstępstwa w zagrożonych zakładach | brak podstawy prawnej | 0 B; presja kapitału −4; niezadowolenie objętych pracowników +3. Rekord: zakres zakładów i data wygaśnięcia | Wygasa w terminie; nie jest ogólnym usunięciem ochrony czasu pracy | Z / P |

**Otwarte pytania:** brak.

### 8.2. Świadczenia i pomoc bezrobotnym — `government.social_welfare`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; kompetencja Pracy | Z |
| Dostęp | PPS ma Pracę albo umowę wykonania; finansowanie | Z / P |
| Koszt | 1 T; projekt osłony jako mała reforma: 0 B budowy, 2 B działania | P |
| Limit wyboru | 1 wariant | Z |
| Odnowienie | Brak odnowienia karty | P |
| Wyjątek | Doradca Arciszewski wykonuje jeden etap za 0 T | P |
| Zapisuje | Jeden projekt osłony dla tych odbiorców, wspólny z D (17.15) | P |
| Odczytują | Budżet i wykonanie (11.3), ulga odbiorców (12.4), odpowiedzialność (5.4), umowy (9.2) | P |
| Co zostaje po karcie | Bieżące świadczenie i jego obciążenie | P |
| Obecny kod | `source/scenes/government_affairs/polish_gov_social_welfare.scene.dry` (etap 4, 0.45): rozszerzyć, skupić i ograniczyć jedną osłonę dla bezrobotnych; ograniczenie przez ustawę. Dostęp przez resort Pracy PPS. Odziedziczona `source/scenes/government_affairs/social_welfare.scene.dry` jest zablokowana warunkiem `not polish_economy_system` | K |
| Źródła i testy | 17.11, 17.12, 12.4, 11.9, 17.15; test „Katalog rządowy” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Rozszerzyć ochronę | brak finansowania; zasięg już 3 | Zasięg (`scope`) +1: każdy poziom +2 B miesięcznie | Nowo objęci dostają tę samą ulgę: −6 na start, potem 2 × wykonanie | Z / P |
| Skupić pomoc na najbardziej potrzebujących | — | Połowa odbiorców, najbardziej potrzebujących; 1 B zamiast 2 | Ci odbiorcy dostają pełną ulgę | Z / P |
| Ograniczyć świadczenia | brak legalnej zmiany świadczenia | Budżet zyskuje tylko różnicę rzeczywistego obciążenia, np. 2 → 1 B | Mniejsza osłona, naruszenie gwarancji, Lewica +8 sprzeciwu bez zgody | Z / P |

Zasiłek nie zmniejsza `market_unemployment` (17.12).

Wariant ograniczony ustawy D daje wszystkim mniej; „skupić” daje mniejszej grupie tyle samo. Nie ma płatnego „utrzymać zakres” (Z — 0.37).

**Otwarte pytania:** brak.

### 8.3. Polityka finansowa — `government.finance_package`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; kompetencja Skarbu | Z |
| Dostęp | Skarb jako wykonawca i właściwa zgoda prawna albo gabinetowa. Bez resortu PPS składa ofertę kartą budżetową (7.3 katalogu) | Z / P |
| Koszt | Własna inicjatywa 1 T, 0 R; wymagane głosowania rozliczają się w tej decyzji; odpowiedź na cudzą obowiązkową ofertę 0 T | P |
| Limit wyboru | 1 wariant; jeden aktywny instrument danego rodzaju | Z / P |
| Odnowienie | Brak odnowienia karty; aktualizacja instrumentu nie tworzy kopii | P |
| Wyjątek | Opozycja nie ma własnej ustawy podatkowej poza D | Z |
| Zapisuje | `E.tax_level`, `E.tax_incidence`, `E.policies` (`Policy`: `kind`, `variant`, `starts_at`, `ends_at`, `budget_modifier`) | P |
| Odczytują | Budżet (11.2), reakcja kapitału (11.7), niezadowolenie (15.1), frakcje | P |
| Co zostaje po karcie | Instrumenty z terminem; po wygaśnięciu dochód znika | P |
| Obecny kod | `source/scenes/government_affairs/polish_gov_finance.scene.dry` (etap 4, 0.45): dziesięć opcji: pięć podatków i ceł, pożyczka, oszczędności administracyjne, cięcie świadczeń, emisja albo bilon i usprawnienie poboru; wszystkie instrumenty poza oszczędnościami przechodzą przez ustawę. Dostęp przez Skarb PPS. Odziedziczona `source/scenes/government_affairs/fiscal_policy.scene.dry` jest zablokowana warunkiem `not polish_economy_system` | K |
| Źródła i testy | 17.11, 17.12, 11.9, 11.2; testy „Czasowy dochód”, „Pożyczka inwestycyjna”, „Stabilizacja i finanse”, „Kapitał” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Obciążyć wysokie dochody i majątek | poziom podatku 3 | Podatek progresywny: `tax_level` +1, czyli +1 B; presja kapitału +4; Lewica −3 sprzeciwu za uzgodnioną zmianę. Albo nadzwyczajny podatek majątkowy: +2 B przez 6 M, presja +8 | Po 6 M podatek majątkowy wygasa; przedłużenie wymaga decyzji | Z / P |
| Obciążyć szerokie grupy: podatki pośrednie | poziom podatku 3 | `tax_level` +1 z rozkładem `indirect`: +1 B; niezadowolenie ubogich odbiorców +3; Lewica +3 bez zgody | — | Z / P |
| Obciążyć szerokie grupy: szersza podstawa podatku | poziom podatku 3 | `tax_level` +1 z rozkładem `broad`: +1 B; presja kapitału +4; niezadowolenie objętej klasy średniej +3 | — | Z / P |
| Obciążyć szerokie grupy: cła fiskalne | trwa poprzedni instrument | +1 B przez 6 M | Szok cenowy +1 pp przez 2 M i kredytowy +3 przez 6 M, raz | Z / P |
| Pożyczka krajowa | kredyt <40; brak zgody finansujących; trwa obsługa poprzedniej | +3 B przez 6 M | Potem −1 B przez 12 M; anulowanie inwestycji nie kasuje kosztu | Z / P |
| Oszczędności ze wskazaniem wydatków | brak profilu wskazanej pozycji | Ograniczenie wydatków administracyjnych: +1 B przez 6 M, niezadowolenie wskazanych pracowników publicznych +4. Cięcie świadczeń: tylko różnica obciążenia i zmiana prawa | Przy cięciu świadczeń bez zgody Lewica +8 | Z / P |
| Finansowanie z emisji | brak upoważnienia | Przed stabilizacją: druk pieniądza w upoważnionym limicie 1–3 punktów. Po stabilizacji: przejściowy bilon, 1 punkt przez 3 M | Wykorzystana emisja podnosi cel inflacji (11.4); bilon ponowić można dopiero po wygaśnięciu | Z / P |
| Usprawnić pobór podatków (`government.collection`) | już wykonane w rozdziale | 1 T; 1 B przez 2 M | Potem trwale +1 B; bez nowego podatku | Z / P |

Podakcje tej rodziny: `government.tax` (zmiana `tax_level` o 1 w granicach −3..3, reakcja raz) i `government.collection` (Z — 0.37). Warianty „obciążyć szerokie grupy” i „finansowanie z emisji” przyjęto w 0.37.

**Otwarte pytania:** brak.

### 8.4. Stabilizacja waluty — `government.currency_stabilisation`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; kompetencja Skarbu; najpierw kryzys, potem agenda | Z |
| Dostęp | Kryzys finansowy: budżet <−2 przez 2 M albo inflacja ≥20% przez 2 M, albo już przyjęty projekt | P |
| Koszt | Duży projekt: przygotowanie 1 T i wdrożenie 1 T; B według wariantu | P |
| Limit wyboru | 1 wariant jednego projektu | Z |
| Odnowienie | Nie jest zwykłym przełączaniem walut; jeden projekt | Z |
| Wyjątek | Wydarzenie stabilizacji (9.11 katalogu) kieruje tutaj przy właściwym dostępie | P |
| Zapisuje | Projekt z wariantem; `E.currency_regime`: `stabilizing`, po ukończeniu `zloty` | P |
| Odczytują | Inflacja i finansowanie emisyjne (11.4), szoki scenariusza (17.16.2) | P |
| Co zostaje po karcie | Po ukończeniu koszt 0; złoty kończy impulsy marki i zwykłą emisję Skarbu | P |
| Obecny kod | `source/scenes/government_affairs/polish_gov_currency.scene.dry` (etap 4, 0.45): trzy warianty jednej reformy walutowej; karta tylko przy kryzysie finansowym, wdrożenie w agendzie. Dostęp przez Skarb PPS; bez PPS reformę prowadzi przegląd gabinetu w `source/rules/polish_projects.js` | K |
| Źródła i testy | 17.11, 17.12, 11.4, 11.9; testy „Stabilizacja i finanse”, „Tolerowanie B14” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Szybka stabilizacja z oszczędnościami (`rapid_cuts`) | brak przyjętych cięć co najmniej 1 B wskazanych wydatków | Projekt: 2 B budowy przez 3 M | Od uruchomienia szok celu kredytu +10 przez 3 M | Z / P |
| Stabilizacja z osłonami i obciążeniem majątku (`protected`) | brak pełnej albo jawnie uzgodnionej ograniczonej osłony z pokryciem | 2 B przez 3 M | Ten sam szok kredytu +10 przez 3 M; osłony rozliczane osobno | Z / P |
| Stopniowe ograniczanie emisji (`gradual`) | — | 1 B przez 5 M | Szok kredytu +5 przez 5 M; limit emisji wygasa najpóźniej przy przejściu do złotego; presja marki trwa dłużej | Z / P |

**Otwarte pytania:** brak.

### 8.5. Kapitał na inwestycje — `government.investment_fund`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; Skarb albo Przemysł i Handel | Z |
| Dostęp | Właściwy wykonawca i wskazany projekt robót albo kredytu | P |
| Koszt | 1 T; instrument kredytowy jako duży projekt (12.4): 2 B budowy, 1 B działania | P |
| Limit wyboru | 1 wariant | Z |
| Odnowienie | Brak odnowienia karty | P |
| Wyjątek | — | — |
| Zapisuje | Instrument finansowania powiązany z projektem; `creditSupport` | P |
| Odczytują | Kredyt (11.5), przypisanie zasługi (5.4) | P |
| Co zostaje po karcie | Jedno finansowanie, jeden koszt, jeden efekt | P |
| Obecny kod | `source/scenes/government_affairs/polish_gov_investment.scene.dry` (etap 4, 0.45): fundusz publiczny i porozumienie z bankami (od kredytu 40); wariant spółdzielczy zablokowany do etapu 5. Dostęp przez Skarb albo Przemysł i Handel PPS. Od etapu 8 (0.49) instrument kredytowy przygotowany przez gabinet uruchamia sam gabinet przy przeglądzie; karta mówi to graczowi zamiast odsyłać do agendy PPS | K |
| Źródła i testy | 17.11, 17.12, 11.9, 12.4; test „Kapitał” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Fundusz publiczny | brak wskazanego projektu | Pełny koszt państwa: 2 B budowy, 1 B działania | Aktywny instrument kredytowy daje raz +5 `creditSupport`; zasługa dla rządu | Z / P |
| Porozumienie z bankami i przemysłem | brak zgody banków; kredyt <40 | Państwo płaci połowę budowy: 1 B budowy, 1 B działania; presja kapitału −8 raz | Ten sam skutek kredytowy; zasługa dzielona z przedsiębiorcami | Z / P |
| Finansowanie spółdzielcze | brak wykonawcy spółdzielczego | Pełny koszt: 2 B budowy, 1 B działania | Kredyt trafia do gospodarstw i małych zakładów przez spółdzielnie | Z / P |

Warianty różnią się tym, kto płaci i kto musi się zgodzić (Z — 0.37).

**Otwarte pytania:** brak.

### 8.6. Polityka wobec przemysłu — `government.industrial_policy`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; Przemysł i Handel; wskazana branża albo zakład | Z |
| Dostęp | Właściwy resort albo umowa wykonania; konkretny problem i odbiorcy | P |
| Koszt | 1 T; B według wariantu | P |
| Limit wyboru | 1 wariant | Z |
| Odnowienie | Zamówienia: najwyżej jeden aktywny pakiet w kraju | P |
| Wyjątek | Doradca Czapiński daje dostęp albo jeden etap za 0 T (6.6 katalogu) | P |
| Zapisuje | Projekt z wariantem, problemem i odbiorcami; `Project.policy_choices.worker_representation` | P |
| Odczytują | Kredyt i produkcja (11.5), reakcja kapitału (11.7), niezadowolenie (15.1) | P |
| Co zostaje po karcie | Kontrakt albo projekt z terminem; brak interwencji nie wywołuje arbitralnego bankructwa | P |
| Obecny kod | `source/scenes/government_affairs/polish_gov_industry.scene.dry` (etap 4, 0.45; etap 6, 0.47): warunkowy kredyt i zamówienia; ratunek zakładu (duży projekt w agendzie), przejęcie ustawą i reprezentacja w podmenu (konsultacje albo współdecydowanie z ustawą) na zakładach przemysłu i warsztatach kolejowych z `source/rules/polish_unions.js`. Dostęp przez Przemysł i Handel PPS. Odziedziczona `source/scenes/government_affairs/economic_democracy.scene.dry` jest zablokowana warunkiem `not polish_economy_system`. Od etapu 8 (0.49) instrument kredytowy przygotowany przez gabinet uruchamia sam gabinet przy przeglądzie; karta mówi to graczowi zamiast odsyłać do agendy PPS | K |
| Źródła i testy | 17.11, 17.12, 17.12.1, 17.12.5, 12.4, 11.7; testy „Zamówienia”, „Reprezentacja”, „Konflikt kapitału” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Warunkowy kredyt (`credit`) | brak instytucji i finansowania | Instrument kredytowy (12.4): 2 B przez 2 M, potem 1 B; ogólny albo na ratunek wskazanego zakładu | Ogólny: +5 do celu kredytu × wykonanie, łączny `creditSupport` najwyżej 20. Ratunek: przywrócenie utraconej zdolności zakładu według profilu | Z / P |
| Zamówienia publiczne (`orders`) | brak dostawy, dostawców, zamawiającego albo finansowania; aktywny inny pakiet | Kontrakt na trzy rozliczenia: start 0 B, działanie 1 B/M | +0,30 pp/M do wkładu produkcji × wykonanie; po wygaśnięciu wkład ustaje | Z / P |
| Przejęcie pod kontrolę publiczną (`public_control`) | brak aktu prawnego, zakresu własności, zarządu i środków | Przygotowane przejęcie: presja kapitału +15; konfrontacyjne przy wymaganym upoważnieniu +25 | — | Z / P |
| Reprezentacja pracownicza (`worker_representation`) | przedsiębiorstwo nie jest publiczne ani objęte umową właściciela | `consultative`: 1 T, 0 B. `decision_rights`: dwa etapy po 1 T, 1 B przez 2 M, i podstawa prawna | Grievance objętych pracowników −2 albo −4 raz; ulepszenie daje tylko brakującą różnicę | Z / P |

Zabezpieczenie przedsiębiorstwa z 12.4 to wariant ratunkowy warunkowego kredytu. Nie ma płatnego „pozostawić dostosowanie właścicielom” (Z — 0.37).

**Otwarte pytania:** brak.

### 8.7. Roboty publiczne — `government.public_works`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; kompetencja Pracy | Z |
| Dostęp | PPS ma Pracę albo umowę wykonania; przyjęte finansowanie. Sam Skarb nie daje kompetencji | Z / P |
| Koszt | Duży program: przygotowanie 1 T i wdrożenie 1 T | P |
| Limit wyboru | 1 wariant | Z |
| Odnowienie | Brak odnowienia karty | P |
| Wyjątek | Doradca Moraczewski wykonuje jeden etap za 0 T; kurs TUR może zastąpić przygotowanie (5.8 katalogu) | P |
| Zapisuje | Projekt robót z wariantem, zakresem i jednostkami | P |
| Odczytują | Produkcja i bezrobocie (11.5), budżet (11.2) | P |
| Co zostaje po karcie | Działające jednostki; najwyżej 8 łącznie. Zakończenie usuwa publiczne zatrudnienie, a zapis infrastruktury zostaje | P |
| Obecny kod | `source/scenes/government_affairs/polish_gov_public_works.scene.dry` (etap 4, 0.45): trzy programy robót, przygotowanie w karcie i wdrożenie w agendzie, najwyżej 8 jednostek zatrudnienia. Dostęp przez resort Pracy PPS; doradca A9 otwiera kartę za 0 T. Odziedziczona `source/scenes/government_affairs/economic_policy.scene.dry` jest zablokowana warunkiem `not polish_economy_system` | K |
| Źródła i testy | 17.11, 17.12, 11.5, 11.8, 12.4; testy „Roboty pod Pracą”, „Wariant robót”, „Wykonanie i limit robót”, „Zatrudnienie”, „Budżet bez kumulacji” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Szybkie zatrudnienie bezrobotnych (`employment`) | brak Pracy albo finansowania | 2 B budowy przez 3 M | Potem 1 B działania i 2 jednostki: 0,15 pp produkcji/M na jednostkę; publiczne miejsca odejmowane od bezrobocia prywatnego | Z / P |
| Transport i infrastruktura (`infrastructure`) | jak wyżej | 2 B przez 4 M | Potem 1 B i 2 jednostki: 0,25 pp produkcji/M na jednostkę | Z / P |
| Mieszkalnictwo robotnicze (`housing`) | jak wyżej | 2 B przez 4 M | Potem 1 B; ulga 2 dla odbiorców, bez jednostek zatrudnienia | Z / P |

Przykład z 11.8: przygotowanie w listopadzie i wdrożenie w grudniu dają efekt od marca.

**Otwarte pytania:** brak.

### 8.8. Wykonanie reformy rolnej — `government.land_program`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; kompetencja Rolnictwa | Z |
| Dostęp | Rolnictwo, prawo i finansowanie; samo posiadanie resortu nie zmienia własności | Z / P |
| Koszt | Duży projekt: przygotowanie 1 T i wdrożenie 1 T; B według wariantu | P |
| Limit wyboru | Jeden sposób podziału i jedna zasada dostępu w tej samej ustawie | Z |
| Odnowienie | Brak; `scope=1..3` dzieli zasięg na trzy transze, bez ponownej nagrody dla tego samego obszaru | P |
| Wyjątek | — | — |
| Zapisuje | Projekt parcelacji z wariantem, zasadą dostępu i transzami | P |
| Odczytują | Presja agrarna (11.6), reakcja kapitału (11.7), niezadowolenie (15.1), umowy z Piastem i mniejszościami | P |
| Co zostaje po karcie | Reakcja polityczna przy przyjęciu prawa, efekt społeczny przy wykonaniu | P |
| Obecny kod | `source/scenes/government_affairs/polish_gov_land.scene.dry` (etap 4, 0.45): parcelacja z odszkodowaniem albo przyspieszona, potem zasada dostępu; wywłaszczenie zablokowane bez zmiany gwarancji własności. Dostęp przez Rolnictwo PPS; minister partnera może prowadzić parcelację w przeglądzie gabinetu, gdy należy do niej obietnica w jego resorcie. Odziedziczona `source/scenes/government_affairs/agricultural_policy.scene.dry` jest zablokowana warunkiem `not polish_economy_system` | K |
| Źródła i testy | 17.11, 12.6, 11.6, 11.7; test „Parcelacja i komasacja” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Parcelacja z odszkodowaniem | brak prawa albo finansowania | 2 B przez 4 M; jedna jednostka reformy | Presja kapitału +8; presja agrarna −3; niezadowolenie odbiorców −4 raz | Z / P |
| Przyspieszona parcelacja z odszkodowaniem | jak wyżej | 3 B przez 3 M | Presja kapitału +12 | Z / P |
| Wywłaszczenie bez odszkodowania | brak uprzedniej zmiany gwarancji własności (7.1, 7.6) | 1 B przez 4 M | Presja kapitału +25 raz | Z / P |
| Zasada dostępu: równe kryteria potrzeb i wielkości gospodarstwa | — | Punkt tej samej ustawy | — | Z / P |
| Zasada dostępu: preferencja polskiej większości | prawo albo gwarancje z 7.6 zabraniają | Punkt tej samej ustawy | Zaufanie wykluczonych komórek −6; wpis bezprawności tylko przy naruszeniu prawa; czerwone linie partnerów mniejszościowych | Z / P |

H: ustawy o scalaniu gruntów z 31 VII 1923 i wykonaniu reformy rolnej z 28 XII 1925 są podstawą historyczną; warianty i liczby są P.

**Otwarte pytania:** brak.

### 8.9. Modernizacja rolnictwa — `government.agriculture_development`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; kompetencja Rolnictwa | Z |
| Dostęp | Rolnictwo i ograniczona transza obszaru | P |
| Koszt | Duży projekt: przygotowanie 1 T i wdrożenie 1 T; 1 B przez 4 M | P |
| Limit wyboru | 1 wariant | Z |
| Odnowienie | Brak; ten sam obszar nie dostaje drugi raz tej samej poprawy | P |
| Wyjątek | — | — |
| Zapisuje | Projekt z wariantem i transzą | P |
| Odczytują | Presja agrarna (11.6), warunki życia wsi (5.6) | P |
| Co zostaje po karcie | Projekt skończony, bez kosztu po wykonaniu | P |
| Obecny kod | `source/scenes/government_affairs/polish_gov_agriculture.scene.dry` (etap 4, 0.45): doradztwo i komasacja z ustawą; spółdzielcze przetwórstwo zablokowane do etapu 5. Dostęp przez Rolnictwo PPS. Odziedziczona `source/scenes/government_affairs/agricultural_policy.scene.dry` jest zablokowana warunkiem `not polish_economy_system` | K |
| Źródła i testy | 17.11, 17.12, 12.6; test „Parcelacja i komasacja” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Doradztwo, narzędzia i spółdzielcza modernizacja | — | 1 B przez 4 M | Presja agrarna −2; warunki objętych komórek wiejskich +3 | Z / P |
| Dobrowolna komasacja i uporządkowanie gruntów | brak lokalnej procedury i zgód wymaganych prawem | 1 B przez 4 M | Presja agrarna −2; warunki odbiorców +2; spór o granice wstrzymuje wykonanie | Z / P |
| Spółdzielcze przetwórstwo i sprzedaż (`cooperative_processing_sales`) | brak wykonawcy spółdzielczego | 1 B przez 4 M | Warunki objętych gospodarujących +2; bez przychodu R dla partii | Z / P |

**Otwarte pytania:** brak.

### 8.10. Polityka oświatowa — `government.education_program`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; kompetencja Oświaty | Z |
| Dostęp | Oświata; zmiana zasad szkoły wymaga ustawy | Z / P |
| Koszt | Duży projekt: 1 B budowy i 1 B działania, 4 M; do trzech rozłącznych transz | P |
| Limit wyboru | 1 wariant | Z |
| Odnowienie | Brak; ten sam zakres szkoły nie jest finansowany dwa razy | P |
| Wyjątek | Kurs TUR może przygotować projekt (5.8 katalogu) | P |
| Zapisuje | Projekt oświatowy z wariantem i odbiorcami | P |
| Odczytują | Zaufanie odbiorców (5.4), umowy z NPR i PSChD | P |
| Co zostaje po karcie | Działające szkoły i ich utrzymanie | P |
| Obecny kod | `source/scenes/government_affairs/polish_gov_education.scene.dry` (etap 4, 0.45): szkoły na wsi, edukacja w ośrodkach robotniczych i szkoła świecka z ustawą. Dostęp przez Oświatę PPS. Odziedziczona `source/scenes/government_affairs/education_science.scene.dry` jest zablokowana warunkiem `not polish_economy_system` | K |
| Źródła i testy | 17.11, 17.12, 12.7; test „Szkoły” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Szkoły na wsi (`rural_access`) | brak finansowania | Projekt dostępu dla wskazanych komórek | Zaufanie odbiorców +4 po wykonaniu | Z / P |
| Edukacja ubogich i dorosłych w ośrodkach robotniczych (`urban_worker_adult_access`) | brak finansowania | Jak wyżej | Zaufanie odbiorców +4; nie zastępuje TUR | Z / P |
| Świecki model szkoły z wolnością religijną (`secular`) | brak ustawy | Zmiana zasad zarządzania i programu | PSChD ocenia treść przez `programFit`. Wariant konfrontacyjny sprzeczny z umową łamie umowę z partnerem; bez reakcji frakcji PPS (Z — 0.37) | Z / P |

**Otwarte pytania:** brak.

### 8.11. Prawa językowe i szkoły mniejszości — `government.minority_school_rights`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; Oświata, we współpracy z MSW w jego kompetencjach | Z |
| Dostęp | Oświata; egzekwowanie praw wymaga właściwego resortu albo instytucji | Z / P |
| Koszt | Duży projekt: 1 B budowy i 1 B działania, 4 M; prawa organizacyjne bez szkół: 1 B przez 2 M | P |
| Limit wyboru | 1 zasada językowa | Z |
| Odnowienie | Brak; sprzeczne zasady zmieniają istniejący projekt | P |
| Wyjątek | — | — |
| Zapisuje | Projekt z zasadą językową i odbiorcami; umowy z klubami mniejszości | P |
| Odczytują | Zaufanie komórek mniejszości, relacje klubów, umowy (9.2) | P |
| Co zostaje po karcie | Wykonana umowa albo konflikt umów | P |
| Obecny kod | `source/scenes/government_affairs/polish_gov_minority_schools.scene.dry` (etap 4, 0.45): jedna zasada językowa: własny język, uzgodniona dwujęzyczność (z umową z reprezentacją mniejszości) albo dominacja polskiego (zablokowana przy gwarancjach demokratycznych). Dostęp przez Oświatę PPS. Od etapu 7 (0.48) obowiązująca delegacja autonomii (17.12.6) blokuje dominację polskiego w szkołach obszaru | K |
| Źródła i testy | 17.11, 17.12, 12.7; test „Szkoły” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Nauka we własnym języku (`own_language`) | — | Wykonanie przyjętych praw w szkołach | Zaufanie objętych komórek +4; relacja odpowiedniego klubu +4 za wykonaną umowę | Z / P |
| Uzgodniona dwujęzyczność (`agreed_bilingual`) | brak dobrowolnie przyjętej umowy | Jak wyżej | Rozlicza umowę jak wyżej | Z / P |
| Dominacja języka polskiego (`polish_dominance`) | obowiązujące prawa blokują wykonanie | Narzucona asymilacja | Zaufanie objętych mniejszości −6; konflikt ich umów | Z / P |

H: ustawa szkolna z 31 VII 1924 jest punktem odniesienia; granice kompetencji i zasięg wdrożenia pozostają B.

**Otwarte pytania:** brak.

### 8.12. Policja i bezpieczeństwo wewnętrzne — `government.internal_security`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; Sprawy Wewnętrzne | Z |
| Dostęp | MSW, właściwy akt i zakres policyjny | Z / P |
| Koszt | 1 T; B według wariantu | P |
| Limit wyboru | 1 wariant | Z |
| Odnowienie | Profesjonalizacja raz w rozdziale | Z |
| Wyjątek | — | — |
| Zapisuje | Policja: `capacity`, `command`, `lawful_compliance`, `public_trust`; rekord śledztwa z `case_id`; rekord ochrony | P |
| Odczytują | Ochrona zgromadzeń (16.3), strajki (17.5) | P |
| Co zostaje po karcie | Zmiana rządu nie cofa szkolenia i nie czyni policji organizacją PPS | Z |
| Obecny kod | `source/scenes/government_affairs/polish_gov_interior.scene.dry` i `source/rules/polish_projects.js` (etap 7, 0.48): profesjonalizacja, dwa śledztwa, ochrona zgromadzenia i ograniczona autonomia (17.12.6); skutki dla policji i spraw w `source/rules/polish_security.js`. Odziedziczona `source/scenes/government_affairs/police.scene.dry` ma warunek `not polish_security_rules` | K |
| Źródła i testy | 17.11, 17.12, 17.12.2, 16.3, 17.2; testy „Policja”, „Państwo a PPS w strajku” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Profesjonalizacja i podporządkowanie legalnym władzom | projekt już wykonany w rozdziale | Projekt: 1 B przez 3 M | Po ukończeniu `command` +10 i `lawful_compliance` +10, raz | Z / P |
| Badanie wskazanej przemocy skrajnej prawicy | brak `case_id` i przesłanek | 1 B przez 1 M; śledztwo w sprawie; etykieta wskazuje sprawę, nie dowód winy | Potwierdzone śledztwo przypisuje sprawę partii; ta partia staje się adresatem linii „przemoc przeciw konstytucji” (4.2 katalogu) | Z / P |
| Badanie wskazanej przemocy komunistów | jak wyżej | 1 B przez 1 M; jak wyżej | Jak wyżej | Z / P |
| Ochrona zgromadzeń i instytucji (`government.police_protection`) | brak nazwanej sprawy i legalnego zadania | Mała decyzja: 1 B przez 1 M | Zdolność ochrony tej sprawy +10 × wykonanie, do 100, na ten miesiąc | Z / P |

Przy początkowych 50/50/50 zdolność ochrony wynosi 12,5, po profesjonalizacji 18 (17.12.2). `government.administration` nie jest osobnym zakupem kadry ani premią dla gospodarki; konkretna reforma policji albo administracji wymaga własnego profilu (17.2).

**Otwarte pytania:** brak.

### 8.13. Wymiar sprawiedliwości — `government.justice_policy`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; Sprawiedliwość | Z |
| Dostęp | Sprawiedliwość; właściwość organów | Z |
| Koszt | Według wariantu | P |
| Limit wyboru | 1 wariant | Z |
| Odnowienie | Ponowne rozpatrzenie tego samego materiału nie daje nagrody | P |
| Wyjątek | Minister nie uchyla cudzego wyroku wyborem nazwy polityki | Z |
| Zapisuje | Projekt przeglądu z `case_id` i `restriction_id`; albo projekt `democratic_guarantees` | P |
| Odczytują | Restrykcje prasy i organizacji (13.2), demokracja (15.2) | P |
| Co zostaje po karcie | Przegląd albo wspólny projekt gwarancji | P |
| Obecny kod | `source/scenes/government_affairs/polish_gov_justice.scene.dry` (etap 4, 0.45): szerokie gwarancje prowadzą do tego samego projektu co karta 7.4 katalogu; od etapu 7 (0.48) przegląd wskazanej restrykcji (1 B przez 1 M) uchyla tylko bezprawną. Dostęp przez Sprawiedliwość PPS. Odziedziczona `source/scenes/government_affairs/judiciary.scene.dry` jest zablokowana warunkiem `not polish_economy_system` | K |
| Źródła i testy | 17.11, 17.12, 17.12.3, 7.6; test „Sprawiedliwość” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Wspólny projekt gwarancji demokratycznych (`broad_safeguards`) | — | Przekierowanie do jednego `democratic_guarantees` (7.4 katalogu), bez dodatkowego etapu | Koszty i skutki tamtego projektu | Z / P |
| Przegląd wskazanego nadużycia (`limited_redress`) | brak `case_id`, konkretnej restrykcji, organu albo profilu prawnego | 1 T; 1 B przez 1 M | Potwierdzona bezprawność: uchylenie wskazanej restrykcji; brak podstaw: koniec bez ulgi | Z / P |

**Otwarte pytania:** brak.

### 8.14. Polityka wojskowa — `government.military_policy`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; Sprawy Wojskowe | Z |
| Dostęp | Właściwa kompetencja, wskazane stanowisko i legalna podstawa | Z / P |
| Koszt | Projekt kontroli: przygotowanie 1 T, wdrożenie 1 T, 1 B przez 3 M | P |
| Limit wyboru | 1 wariant | Z |
| Odnowienie | Efekty raz na zakres reformy | P |
| Wyjątek | Kompromis nadający Piłsudskiemu osobiste uprawnienia używa umowy z 8.15 katalogu | Z |
| Zapisuje | Projekt z `force_ids`; profil nominacji (`position_id`, `candidate_id`, organ, podstawa); podakcja `government.army_control` | P |
| Odczytują | Lojalności zgrupowań (16.1–16.3), zdolność zamachowa (16.2), presja (15.3) | P |
| Co zostaje po karcie | Zmienione lojalności wskazanych grup; czasowy spadek gotowości | P |
| Obecny kod | `source/scenes/government_affairs/polish_gov_military.scene.dry` i `source/rules/polish_projects.js` (etap 7, 0.48): nadzór cywilny, zmiany kadrowe i kompromis organizacyjny jako jeden projekt `army_control` nad syntetycznym stanowiskiem przy `near_reserve`; skutki w `source/rules/polish_security.js`. Odziedziczona `source/scenes/government_affairs/military_policy.scene.dry` ma warunek `not polish_security_rules` | K |
| Źródła i testy | 17.11, 17.12, 17.12.4, 16.3, 12.4; test „Nominacja” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Wdrożyć nadzór cywilny (`civilian_oversight`) | brak procedury albo upoważnienia | Projekt kontroli | Po wykonaniu wskazana grupa +0,05 lojalności legalnej | Z / P |
| Legalne zmiany kadrowe (`personnel_changes`) | brak zgody osoby, upoważnienia albo ważnego profilu | Nominacja w projekcie kontroli | +0,05 lojalności legalnej grupy; jej gotowość −0,05 przez 2 M; +8 presji tylko przy rzeczywistym konflikcie nominacyjnym | Z / P |
| Kompromis organizacyjny ograniczający reformę (`organizational_compromise`) | — | Wykonanie tylko uzgodnionego zakresu | — | Z / P |

Historyczne obsady i zakresy stanowisk 1922–1926 zapisuje od etapu 8 (0.49) `PL-ARMY-POSTS-1922-1926` (badania 8f). Gabinety gry różnią się od historycznych, więc gra nadal używa oznaczonej syntetycznej funkcji nadzoru nad `near_reserve` (P).

**Otwarte pytania:** brak.

### 8.15. Porozumienie z Piłsudskim — `government.pils_agreement`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; karta przed próbą zamachu | Z |
| Dostęp | Aktywny gabinet, PPS w rządzie z właściwą kompetencją albo zaakceptowany wykonawca; zgoda Piłsudskiego i legalna procedura. Samo tolerowanie nie wystarcza | Z / P |
| Koszt | Własna inicjatywa 1 T; odpowiedź w aktywnym kryzysie 0 T; bez R i B | P |
| Limit wyboru | 1 ustępstwo albo odmowa | Z |
| Odnowienie | Jedna aktualna umowa; ulga presji raz na kryzys, bez sumowania trzech wariantów | P |
| Wyjątek | W trakcie zamachu te same ustępstwa występują tylko jako oferty ugody F9 (9.15 katalogu) | Z |
| Zapisuje | `S.actors.pilsudski.agreement_id`; klauzule z wariantem i `force_ids`; `credibleStandDownAgreement` | P |
| Odczytują | Presja (15.3), bramki próby (16.2, 16.8.1), lojalności (16.1) | P |
| Co zostaje po karcie | Umowa z przeglądem po 6 M; zawiniony rozpad daje raz +8 presji | P |
| Obecny kod | `source/scenes/government_affairs/polish_gov_pils_agreement.scene.dry` i `source/rules/polish_security.js` (etap 7, 0.48): trzy ustępstwa i odmowa, jedna umowa `S.actors.pilsudski.agreement_id`, ulga raz na umowę i kryzys, przegląd po 6 M; premierostwo przez formowanie gabinetu (7.1 katalogu) | K |
| Źródła i testy | 16.7, 16.8.1, 17.11, 17.12; testy „Ustępstwo Piłsudskiemu”, „Pula ustępstw wojskowych”, „Przegląd ugody chroniącej”, „Kryzys i przerwa” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Funkcja wojskowa pod cywilną kontrolą | relacja <40; brak stanowiska i zakresu nominacji; brak zgody władz | Po rozpoczęciu wykonania: presja −12; relacja +4; Piłsudczycy −5 sprzeciwu | Nominacje: do +0,05 udziału lojalności wobec Piłsudskiego w podległych grupach | Z / P |
| Samodzielny inspektorat i większa swoboda nominacji | relacja <60; brak zmiany prawa; linia `oppose_military_interference`; przy linii `conditional` brak zapisu o odpowiedzialności przed Sejmem | Presja −25; relacja +4; Piłsudczycy −8; Centrum +8 sprzeciwu, jeśli nie przyjęło tej linii | Do +0,10 udziału lojalności w grupach objętych nominacjami | Z / P |
| Premier Piłsudski na programie legalnego gabinetu | relacja <65; brak przyjętego gabinetu, zgody prezydenta i kandydata | Po powołaniu: presja −20; relacja +4; Piłsudczycy −5 | Przekierowanie do formowania gabinetu (7.1 katalogu), bez drugiego T | Z / P |
| Odmowa ustępstw i oferta cywilnego gabinetu | — | Bez ulgi presji; dalsze formowanie według 8 | Pierwsze wykonanie nowego istotnego obowiązku cywilnego może raz obniżyć presję (15.3) | Z / P |

H: spór o organizację naczelnych władz wojskowych jest historycznym tłem. Wczesny inspektorat i premierostwo na tych warunkach są alternatywami gry.

**Otwarte pytania:** brak.

### 8.16. Wawel albo Zamek Królewski — `government.heritage_restoration`

| Pole | Treść | Status |
|---|---|---|
| Talia i pula | Rząd; Oświata; ograniczona sprawa | Z |
| Dostęp | Oświata i przyjęty budżet; bez nowej ustawy, jeśli mieści się w kompetencjach | Z / P |
| Koszt | Najpierw wybór obiektu, potem zakres: mała konserwacja 1 T, szerszy remont 2 T (12.2) | P |
| Limit wyboru | 1 obiekt i 1 zakres | Z |
| Odnowienie | Po jednym projekcie na obiekt; zmiana zakresu aktualizuje obciążenie bez nowej nagrody | P |
| Wyjątek | — | — |
| Zapisuje | Projekt z obiektem i zakresem | P |
| Odczytują | Wiarygodność PPS, zaufanie komórki inteligencji | P |
| Co zostaje po karcie | Zachowany obiekt w raporcie projektu | P |
| Obecny kod | `source/scenes/government_affairs/polish_gov_heritage.scene.dry` (etap 4, 0.45): konserwacja albo większy remont Wawelu lub Zamku Królewskiego. Dostęp przez Oświatę PPS | K |
| Źródła i testy | 12.8, 17.11, 17.12; test „Remont Oświaty” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Ograniczona konserwacja | projekt dla tego obiektu już ukończony | 1 B przez 2 M | Po ukończeniu wiarygodność PPS +1, gdy była jawnym sponsorem | Z / P |
| Szerszy remont i dostęp publiczny | jak wyżej | 2 B przez 4 M | Wiarygodność +2; zaufanie objętej komórki inteligencji +3 | Z / P |

Obiekty to Wawel albo Zamek Królewski w Warszawie; chodzi o prace w istniejących budynkach. H: oba obiekty były remontowane w okresie międzywojennym; wawelskie zbiórki cegiełkowe trwały w latach 1921–1926 (`PL-CONTENT-1922-1926-2026-09`).

**Otwarte pytania:** brak.

## 9. Partia 6 — wydarzenia i sekwencje

Wydarzenia z 17.3, sceny B i C po rewizjach (17.13–17.14), reakcje E i sekwencja F (17.15, 16.8) oraz sceny informacyjne G. Mają nagłówek wydarzenia. Kategorię kolejki podajemy według 4.5. Siedem kategorii, które katalog najpierw sam wywnioskował z opisu 4.5, użytkownik zatwierdził w 0.39; referencja zapisuje je w 4.5.

**Status partii:** przejrzana przez użytkownika 26 IX 2026; wszystkie pytania rozstrzygnięte w 0.38 (referencja 23.11).

### 9.1. Kryzys gabinetowy 1922 — `opening.cabinet_1922`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Wydarzenie otwierające obowiązkowe formowanie gabinetu (B1) | Z |
| Wyzwalacz | Rzeczywista dymisja albo utrata zdolności gabinetu. W scenariuszu: spór Naczelnika z Ponikowskim, gdy nie ma kompromisu utrzymującego gabinet (17.16.3) | P |
| Okno | Przed XI 1922; w scenariuszu VI–VII 1922 | H / P |
| Kolejka | Kategoria 2 z 4.5: sukcesja instytucji (Z — 0.39) | Z |
| Powtarzalność | Jedna sprawa na upadek gabinetu | P |
| Koszt odpowiedzi | 0 T, jak obowiązkowe formowanie | P |
| Bez odpowiedzi | Wybór wymagany; opozycja PPS zostawia formowanie innym (8.7) | Z |
| Zapisuje | `Negotiation` z `context.reason=cabinet_fall`; `S.cabinet_crisis` | P |
| Odczytują | Formowanie gabinetu (7.1 katalogu) | P |
| Co zostaje po karcie | Jedna sekwencja formowania, bez czwartej odpowiedzi o ustępstwie | Z |
| Obecny kod | `source/scenes/polish_event_cabinet_1922.scene.dry` i `source/rules/polish_politics.js` (etap 7, 0.48): spór VI 1922, dymisja urzędującego gabinetu Ponikowskiego, trzy odpowiedzi prowadzące do obowiązkowego formowania w `source/scenes/polish_cabinet_formation.scene.dry` | K |
| Źródła i testy | 17.3, 17.13, 17.16.3, 8.7, 8.8; test „B1/B2” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Kandydat związany z Piłsudskim | brak zgody kandydata | Wejście do sekwencji 8.8 z tym kandydatem | Porażka otwiera ocenę następnej wykonalnej oferty | Z / P |
| Kompromisowy kandydat parlamentarny | brak dostępnego kandydata | Wejście do sekwencji 8.8 | — | Z / P |
| Opozycja | — | PPS poza gabinetem | Inni tworzą wykonalny gabinet (8.7) | Z |

H: oś gabinetów Ponikowski — próba Śliwińskiego — Nowak według `PL-1922-1926-CABINETS` (8.7).

**Otwarte pytania:** brak.

### 9.2. Krytyka parlamentu przez Piłsudskiego — `politics.pils_parliament_criticism`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Wydarzenie; jedna odpowiedź na ID wystąpienia (B2) | Z |
| Wyzwalacz | Zapisane wystąpienie Piłsudskiego i aktualny spór; profil wskazuje temat, instytucję i spór | P |
| Okno | Od 1922 | P |
| Kolejka | Kategoria 6 z 4.5: tło (Z — 0.39) | Z |
| Powtarzalność | Nowe ID wystąpienia to nowa sprawa; wczytanie nie dodaje drugiego wpisu | Z |
| Koszt odpowiedzi | 0 T | P |
| Bez odpowiedzi | Odpowiedź obowiązkowa w miesiącu wystąpienia, przed następną zwykłą akcją; nie ma opcji „milczeć” (Z — 0.38) | Z |
| Zapisuje | `response` w wydarzeniu; wpis dziennika instytucjonalnego 15.2 (`stance_criticism` albo `stance_defense`) | Z |
| Odczytują | Autorytet Sejmu (15.2), frakcje (10.1), relacja z Piłsudskim | P |
| Co zostaje po karcie | Wpis dziennika na 12 M; nie nadpisuje `pils_influence` ani `form_of_power` | Z |
| Obecny kod | `source/scenes/polish_event_pils_criticism.scene.dry` i `source/rules/polish_politics.js` (etap 7, 0.48): jedna obowiązkowa odpowiedź na zapisane wystąpienie (spór 1922, sprawa wojskowa 1925), wpis dziennika 15.2. Od etapu 8 (0.49) sprawa wojskowa otwiera się w VII 1923 (badania 8f), a wystąpienie z 1922 r. dotyczy prawa powoływania rządu | K |
| Źródła i testy | 10.7, 15.2, 17.3, 17.13; testy „Dwie decyzje Piłsudskiego”, „Autorytet z dziennika”, „Bez bezpośredniego zapisu”, „B1/B2”, „Obowiązkowa odpowiedź B2”, „Sprzeczność odpowiedzi B2” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Poprzeć krytykę parlamentaryzmu | — | Relacja z Piłsudskim +4; Piłsudczycy −3, Centrum +5 sprzeciwu. Przy linii `form_of_power=parliamentarism` ostrzeżenie przed zatwierdzeniem i Centrum dodatkowo +3 | Wpis `stance_criticism`: autorytet −2 przez 12 M | Z / P |
| Bronić parlamentu i legalnej zmiany rządu | — | Relacja −4; Piłsudczycy +5, Centrum −3 sprzeciwu | Wpis `stance_defense`: autorytet +1 przez 12 M; możliwa kampania obrony instytucji | Z / P |
| Parlament należy reformować, aby działał skuteczniej | — | Bez zmiany relacji; Centrum −2 sprzeciwu | Wspiera linię reform; nie tworzy projektu, ścieżki ani postępu ustawy | Z / P |

Trwałej linii przeczy tylko poparcie krytyki przy linii parlamentaryzmu (Z — 0.38). Inne połączenia nie są sprzeczne, np. poparcie wpływu Piłsudskiego z obroną parlamentu albo linia rad robotniczych z poparciem krytyki. Obrona i reforma nigdy nie dają sporu o wiarygodność. Treść przypisana historycznej osobie wymaga źródła; scena syntetyczna ma P.

**Otwarte pytania:** brak.

### 9.3. Wybory do Sejmu 1922 — `election.sejm_1922`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Sekwencja bez decyzji gracza; wynik G6 | Z |
| Wyzwalacz | Termin pierwszych wyborów | H |
| Okno | XI 1922 | H |
| Kolejka | Kategoria 3 z 4.5: wybory i prawnie ustalone głosowania | Z |
| Powtarzalność | Jednorazowe; ponowne wejście z tym samym ID nic nie dopisuje | P |
| Koszt odpowiedzi | Brak decyzji | — |
| Bez odpowiedzi | — | — |
| Zapisuje | Jeden rekord w `Q.sejm_results` ze `status=certified`; kluby; Senat metodą `sejm_proxy_v1` | K / P |
| Odczytują | Wybór marszałka (7.8 katalogu), prezydenta (7.9 katalogu), formowanie gabinetu (7.1 katalogu), D1 (7.2 katalogu) | P |
| Co zostaje po karcie | Niezmienny zapis parlamentu; zmiany tylko przez transfery klubów | P |
| Obecny kod | `source/scenes/sejm_election.scene.dry`, `source/scenes/sejm_election_result.scene.dry` i `source/rules/polish_institutions.js`: 444 mandaty, oddzielone sondaże, `status=certified`, kluby i Senat `sejm_proxy_v1` (etap 2) | K |
| Źródła i testy | 6.1, 6.3, 6.4, 17.3, 17.15; testy „Mandaty”, „Zamrożony wynik”, „Senat” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Sekwencja bez wyboru | — | Zamknięcie list → preferencje i frekwencja → mandaty → niezmienny wynik | Wybory urzędów i formowanie gabinetu | Z |

**Otwarte pytania:** brak.

### 9.4. Zagrożenie prezydenta — `presidency.security_crisis`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Rozliczenie automatyczne, bez menu (B3) | Z |
| Wyzwalacz | Konkretna rozpoznana groźba w profilu treści, po wyborze prezydenta | P |
| Okno | Po wyborze prezydenta | P |
| Kolejka | Kategoria 2 z 4.5: sukcesja (Z — 0.39) | Z |
| Powtarzalność | Jedna sprawa na zagrożenie | P |
| Koszt odpowiedzi | Brak decyzji | — |
| Bez odpowiedzi | — | — |
| Zapisuje | Wynik zagrożenia; przy zabójstwie wakat i sukcesja | P |
| Odczytują | Mobilizacja po zabójstwie (9.5 katalogu); sukcesja (7.3) | P |
| Co zostaje po karcie | Wakat obsługuje marszałek bez osobnej sceny (C9) | Z |
| Obecny kod | `source/scenes/polish_presidential_sequence.scene.dry` i `source/rules/polish_politics.js` (etap 7, 0.48): rozliczenie bez menu w sekwencji prezydenckiej; decyzja 2B etapu 7 — wybór Narutowicza kończy się zabójstwem, bez modelu ochrony; sprawa instytucjonalna, przemoc +10, wakat marszałka | K |
| Źródła i testy | 17.3, 17.13, 7.3; testy „B3/B4”, „Mobilizacja i kult” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Sekwencja bez wyboru | — | Automatyczne rozliczenie zagrożenia i wcześniej wykonanej ochrony | Sam wybór kandydata lewicy nie wywołuje zabójstwa | Z |

H: zamach na Narutowicza to historyczna gałąź; inne ofiary wymagają osobno opracowanego, oznaczonego przebiegu.

**Otwarte pytania:** brak.

### 9.5. Mobilizacja po zabójstwie prezydenta — `presidency.assassination_response`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Jedna decyzja PPS (B4) | Z |
| Wyzwalacz | Potwierdzona śmierć w wyniku zamachu w zakończonym `presidency.security_crisis`, po obsłużeniu wakatu | Z |
| Okno | Po zabójstwie | P |
| Kolejka | Kategoria 5 z 4.5: warunkowy kryzys, po sukcesji (Z — 0.39) | Z |
| Powtarzalność | Jednorazowe | P |
| Koszt odpowiedzi | 0 T; koszty wybranego narzędzia w R | P |
| Bez odpowiedzi | Odpowiedź obowiązkowa (17.9) | Z |
| Zapisuje | Wybór i wskazane organizacje w `EventRun.payload` | P |
| Odczytują | Kampania (5.3), demokracja (15.2), test starcia (17.5) | P |
| Co zostaje po karcie | Kampania, ewentualny epizod przemocy i sprawa odpowiedzialności | P |
| Obecny kod | `source/scenes/polish_event_assassination_response.scene.dry` i `source/rules/polish_politics.js` (etap 7, 0.48): trzy odpowiedzi po obsłużeniu wakatu, przed drugim głosowaniem Zgromadzenia Narodowego; test starcia zgromadzenia i przemoc organizacji PPS tylko po wykonanym starciu | K |
| Źródła i testy | 17.6, 17.5, 17.13, 13.4; testy „B3/B4”, „Zdarzenia demokracji”, „Mobilizacja i kult” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Masowa obrona republiki | brak uzgodnionej linii związku i działającej prasy | −1 R kampanii; ochrona opcjonalnie −0,5 R | Kampania o demokracji w objętych komórkach; pokojowe zgromadzenie: demokracja +2 raz | Z / P |
| Powściągliwość i skupienie na legalnej sukcesji | — | 0 R | Lewica +3 sprzeciwu, jeśli PPS obiecała publiczną mobilizację | Z / P |
| Zezwolić Milicji na odwetową konfrontację | brak zdolnych, przydzielonych członków | −0,5 R; `pps_authorizes_confrontation` | Centrum +8 sprzeciwu bez wewnętrznej zgody; ryzyko i epizod z 17.5 | Z / P |

Ta sama Milicja nie chroni kilku miejsc przed etapem AS; AS chroni do trzech (13.4).

**Otwarte pytania:** brak.

### 9.6. Kult Niewiadomskiego — `society.niewiadomski_cult`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Jedno nazwane wydarzenie (B5) | Z |
| Wyzwalacz | Historyczna gałąź zabójstwa Narutowicza przez Niewiadomskiego i konkretne publiczne wydarzenie upamiętniające sprawcę; zwykłe nabożeństwo nie wystarcza. Od etapu 8 (0.49) jest nim pogrzeb na Powązkach 6 II 1923 (`PL-NIEWIADOMSKI-CULT-1923`) | H |
| Okno | Od II 1923, po egzekucji 31 I 1923 (etap 8, badania 8f) | H |
| Kolejka | Kategoria 6 z 4.5: tło (Z — 0.39) | Z |
| Powtarzalność | Jednorazowe, bez corocznego powtarzania | Z |
| Koszt odpowiedzi | 0 T | P |
| Bez odpowiedzi | — | — |
| Zapisuje | Stanowisko w `EventRun.payload` | P |
| Odczytują | Kampania (5.3), demokracja (15.2), `uncontrolledPressure` (17.4) | P |
| Co zostaje po karcie | Ewentualna kampania albo spór o posłuch | P |
| Obecny kod | `source/scenes/polish_event_niewiadomski_cult.scene.dry` i `source/rules/polish_politics.js` (etap 7, 0.48; etap 8, 0.49): jedna uroczystość od II 1923 w gałęzi zabójstwa Narutowicza: pogrzeb na Powązkach 6 II 1923 (badania 8f); msza tylko przy zgodzie gospodarza | K |
| Źródła i testy | 17.7, 17.13, 17.4; testy „Msza B5”, „Mobilizacja i kult” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Potępić kult i nakazać niezakłócanie nabożeństwa | — | 0 R; instrukcja dla Milicji | Centrum −3 sprzeciwu przy uzgodnionej linii; PSChD +2 relacji tylko przy wspólnym potępieniu przemocy; niski posłuch może zostawić niekontrolowaną konfrontację | Z / P |
| Zorganizować mszę w intencji obrony demokracji (`democracy_mass`) | brak zgody duchownego albo gospodarza, miejsca albo zaplecza PPS | −1 R organizacji | Kampania demokratyczna w objętych komórkach; po wykonaniu demokracja +2 raz. Odmowa gospodarza: bez premii i kosztu | Z / P |
| Nie angażować organizacji | — | 0 R | Lewica +3 tylko przy złamanej obietnicy publicznej odpowiedzi | Z / P |

H: istnienie kultu; konkretna miejscowość, nabożeństwo i uczestnicy wymagają profilu źródłowego (B). Msza to alternatywa gry zaproponowana przez użytkownika, nie teza historyczna.

**Otwarte pytania:** brak.

### 9.7. Współpraca z komunistami podczas strajku — `society.strike_communist_cooperation`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Krok odpowiedzi w sprawie strajku (B9) | Z |
| Wyzwalacz | Trwa albo jest przygotowany konkretny strajk, komuniści w nim działają, a PPS może odpowiedzieć | Z |
| Okno | Każdy rzeczywisty strajk, także 1923 i Kraków | Z |
| Kolejka | W sekwencji strajku: po wyborze celu protestu, przed obliczeniem uczestnictwa (17.5) | Z |
| Powtarzalność | Raz na `strike_id`; ponowne otwarcie tego samego strajku nie tworzy kolejnych sukcesów | Z / P |
| Koszt odpowiedzi | 0 T; fundusz i ochrona rozliczane raz w sprawie strajku | P |
| Bez odpowiedzi | — | — |
| Zapisuje | `Strike.communist_cooperation`; `TrialRecord` (`mode`, `terms`, `partner_response`, `ended_as_agreed`, `result`) | P |
| Odczytują | Dyscyplina KPP, nacisk `crediblePressure`, niekontrolowany udział | P |
| Co zostaje po karcie | Rekord próby: pełna +5, lekka +2, naruszenie −5; brak współpracy nie jest nieudaną próbą | P |
| Obecny kod | Krok współpracy w `source/scenes/polish_strike_steps.scene.dry` (etap 6, 0.47): pełna współpraca, ograniczona koordynacja albo brak; jeden zapisany rzut dyscypliny i jeden `TrialRecord`, wynik próby przy końcu strajku. Reguły w `source/rules/polish_unions.js` i `source/rules/polish_party.js`. Od etapu 8 (0.49) cel KPP to `structural`, więc pełna współpraca wymaga żądań szerokich albo politycznych | K |
| Źródła i testy | 9.6, 9.5, 17.5; testy „Dyscyplina KPP”, „Akceptacja a KPP”, „Granice dyscypliny”, „Komuniści”, „Współpraca i eskalacja” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Pełna współpraca (`full`) | kontakt nieotwarty; relacja <30; brak wspólnych żądań i reguł zakończenia | Wspólny komitet; porozumienie wiąże cały wkład partnera | Centrum +5, gdy `pps_internal_acceptance` <60; dyscyplina KPP `clip((relacja + zgodność celu)/200, 0,10, 0,90)` | Z / P |
| Lekka koordynacja (`limited`) | relacja <20; brak wspólnego ograniczonego żądania | Porozumienie wiąże połowę wkładu partnera | Centrum +2, gdy akceptacja <60; Lewica +3 tylko przy wcześniejszej obietnicy pełnej współpracy | Z / P |
| Brak współpracy (`none`) | — | PPS zachowuje własne żądania i kierownictwo protestu | Złamana wcześniejsza obietnica współdziałania: zwykły konflikt | Z / P |

Cel partnera zapisuje profil wydarzenia. Od etapu 8 (0.49) jest nim `structural` (profil `kpp_goal_1922_1926`; badania 8f, `PL-KPRP-GOALS-1923`), wcześniej wartość testowa `broad`.

**Otwarte pytania:** brak.

### 9.8. Strajki 1923 i Kraków — `society.strike_1923`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Jedna karta odpowiedzi PPS; reakcja państwa w tym samym rekordzie (B8+B10). Nazwane `society.krakow_1923` jest kontekstem tej samej sprawy | Z |
| Wyzwalacz | Niezadowolenie objętych robotników albo branży ≥60 i brak wykonanej ugody; albo sprawa żądań płacowych po trzech miesiącach płac realnych <80 (17.16.5) | P |
| Okno | Główne okno jesienią 1923; poza nim ogólny kontekst sporu. Kraków: test X–XI 1923 | H / P |
| Kolejka | Kategoria 5 z 4.5: warunkowe kryzysy | P |
| Powtarzalność | Nowa sprawa najwcześniej po 3 M, jeśli przyczyna trwa; zamknięte żądanie nie otwiera tej samej akcji | P |
| Koszt odpowiedzi | Pierwsza odpowiedź 0 T; strajk zużywa fundusz (14.2); ochrona Milicji wymaga przydziału ludzi i 0,5 R. Własny protest przed wydarzeniem kosztuje 1 T (5.10 katalogu) | P |
| Bez odpowiedzi | — | — |
| Zapisuje | `EventRun.payload.strike_strategy`; `government_response`; rekord `Strike` | P |
| Odczytują | Potencjał i ugoda (14.2–14.5), zgoda związku (17.4), przemoc (15.2), współpraca z KPP (9.7 katalogu) | P |
| Co zostaje po karcie | Ugoda z klauzulami: płace (+2 do `effectiveWageAgreementPP` na 2 M dla objętego zakresu), cofnięcie militaryzacji kolei, wycofanie trybu represji; każda z wykonawcą, terminem t+1 i wagą 1 | P |
| Obecny kod | `source/scenes/polish_event_strike_1923.scene.dry` (etap 6, 0.47): wydarzenie kolejki, gdy droga płacowa otwiera sprawę; rozmowy, strajk ograniczony albo żądanie dymisji, 0 T; reakcja władz według profilu gabinetu i resortów PPS; Kraków w X–XI 1923. Reguły w `source/rules/polish_unions.js`. Odziedziczona `source/scenes/government_affairs/labor_affairs.scene.dry` wymaga SPD, a `source/scenes/events/labor_unrest.scene.dry` ma warunek `not polish_union_rules` | K |
| Źródła i testy | 17.5, 17.16.5, 14.2, 14.4, 17.13; testy „B8+B10 i B11+B12”, „Kraków”, „Państwo a PPS w strajku” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Podjąć rokowania przed rozszerzeniem protestu (`negotiate`) | — | Ograniczona oferta płacowa albo cofnięcia konkretnej represji; próg 40 z 14.4 | Umowę tworzy dopiero przyjęta oferta; brak strajku chroni fundusz, ale zmniejsza nacisk | Z / P |
| Ograniczony strajk o płace i warunki pracy (`economic_strike`) | niezadowolenie odbiorców <50 i brak odrzuconego żądania | Wybrane branże, uzgodnione żądania i warunki końca | Próg 40 dla pojedynczego żądania, 60 dla szerszego pakietu | Z / P |
| Strajk z żądaniem ustąpienia gabinetu (`cabinet_resignation`) | jak wyżej | Cel polityczny, próg 80; rozszerzenie tylko przy zgodzie i funduszach organizacji | Lewica −3 sprzeciwu przy zgodnej linii, Centrum +8 bez uzgodnienia; dymisja wymaga rzeczywistego odejścia albo głosowania | Z / P |

Starcia mają warunki: `clashRisk` z 17.5, jeden rzut na fazę spotkania, epizod przemocy +10 (15.2), straty Milicji 2% przydzielonych ludzi. Odpowiedź parlamentarna na represje: 7.10 katalogu. H: kryzys krakowski listopada 1923 jest udokumentowany (`PL-CONTENT-1922-1926-2026-09`); alternatywne zachowanie stron podlega regułom gry.

**Otwarte pytania:** brak.

### 9.9. Uczestnicy odrzucają ugodę (E6) — `society.strike_settlement_rejection`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Obowiązkowa odpowiedź 0 T | Z |
| Wyzwalacz | PPS przyjęła konkretną ugodę, a wskazana grupa uczestników nie chce zakończyć akcji | Z |
| Okno | W trakcie sprawy strajku | Z |
| Kolejka | Kategoria 1 z 4.5: część rozpoczętej sekwencji (Z — 0.39) | Z |
| Powtarzalność | Jedna E6 na `strike_id + settlement_id`; ta para jest `instance_key` (Z — 0.38) | Z |
| Koszt odpowiedzi | 0 T | Z |
| Bez odpowiedzi | — | — |
| Zapisuje | Reakcja w rekordzie ugody | P |
| Odczytują | Posłuch (14.5), naruszenie ugody (9.2) | P |
| Co zostaje po karcie | Zapis reakcji nie rozlicza ponownie podpisania ugody | Z |
| Obecny kod | `source/scenes/polish_event_strike_rejection.scene.dry` (etap 6, 0.47): kategoria 1, klucz strajku i ugody, od 10 punktów odmawiającego udziału; utrzymanie ugody albo poparcie dalszego strajku, 0 T. Reguły w `source/rules/polish_unions.js` | K |
| Źródła i testy | 14.5, 17.15; test „Klucz sprawy E6” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Podtrzymać ugodę i wezwać do zakończenia strajku | — | Zobowiązanie zostaje; rozliczenie posłuchu | Część uczestników może strajkować dalej bez poparcia PPS | Z |
| Poprzeć dalszy strajk | — | Mobilizacja trwa, z kosztami | Możliwe naruszenie przyjętej ugody; nie wymusza lepszej oferty | Z |

**Otwarte pytania:** brak.

### 9.10. Część frakcji grozi odejściem (E3) — `party.faction_split`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Obowiązkowa odpowiedź 0 T | Z |
| Wyzwalacz | Sprzeciw frakcji ≥60 i konkretne, wykonalne żądanie polityczne; wcześniej informacja przy ≥30 i ostrzeżenie przy ≥45 | P |
| Okno | Dowolne | P |
| Kolejka | Kategoria 5 z 4.5: kryzysy partyjne | P |
| Powtarzalność | Jedna definicja dla wszystkich frakcji; `instance_key` to `case_id` (Z — 0.38). Zakończony `case_id` nie uruchamia E3 ponownie; nowa E3 wymaga nowego konfliktu i żądania | Z |
| Koszt odpowiedzi | 0 T | Z |
| Bez odpowiedzi | — | — |
| Zapisuje | `S.faction_cases`; `departure_manifest` | P |
| Odczytują | Spójność (10.1), `faction_seats`, członkostwo i preferencje PPS | P |
| Co zostaje po karcie | Przy rozłamie technicznie nazwany klub rozłamowy z posłami | Z |
| Obecny kod | `source/scenes/polish_event_faction_split.scene.dry` (etap 5, 0.46): kolejka 4.5, kategoria 5, jedna instancja na sprawę frakcji; żądanie cofa zapisaną przyczynę sprzeciwu (decyzja 3A etapu 5); przyjąć albo utrzymać linię z rozłamem M16. Sprawy i odejścia w `source/rules/polish_party.js`. Dawne sceny `source/scenes/events/pps_lewica_split.scene.dry`, `source/scenes/events/pps_pilsudczycy_split.scene.dry` i `source/scenes/events/pps_centrum_crisis.scene.dry` mają znacznik `event` i nie trafiają do kolejki | K |
| Źródła i testy | 10.2, 10.9, 17.15; testy „Rozłam E3”, „Zamrożeni posłowie”, „Rozłam i czystka”, „Jedna karta E3” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Przyjąć żądanie i zachować jedność | — | Gra wykonuje wskazaną zmianę linii; sprzeciw frakcji −5 | Reakcje partnerów i innych frakcji wynikają ze zmienionej polityki | Z / P |
| Utrzymać linię PPS i zaakceptować rozłam | — | Manifest: 40% zaplecza frakcji; siła ×0,6 i normalizacja; członkostwo i poparcie PPS ×(1 − udział); głosy do odbiorcy z manifestu; 40% posłów frakcji do klubu rozłamowego; sprzeciw reszty −20 | Doradcy zostają, chyba że manifest wskazuje osobę z nazwiska | Z / P |

Przykład z 10.2: Lewica o sile 15 i 5 posłach traci 6% zaplecza PPS i 2 posłów. Sprawa odroczona w karcie Jedność nie wywołuje E3 przez 3 M (6.3 katalogu).

**Otwarte pytania:** brak.

### 9.11. Stabilizacja — `economy.stabilization`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Przekierowanie do właściwej karty (B14) | Z |
| Wyzwalacz | Kryzys finansowy albo przyjęty projekt stabilizacji (11.9) | P |
| Okno | Historyczny temat końca 1923–1924; wcześniej przy spełnieniu 11.9 | H / P |
| Kolejka | Kategoria 5 z 4.5 | P |
| Powtarzalność | Jeden projekt stabilizacji | Z |
| Koszt odpowiedzi | 0 T; koszty projektu normalne | P |
| Bez odpowiedzi | Gabinet bez PPS może sam przygotować reformę (17.16.4) | P |
| Zapisuje | — | — |
| Odczytują | Stabilizacja waluty (8.4 katalogu), oferta tolerowania eksperta (7.1 katalogu) | P |
| Co zostaje po karcie | Projekt stabilizacji albo stanowisko w ofercie | P |
| Obecny kod | `source/scenes/polish_event_stabilization.scene.dry` (etap 4, 0.45): kolejka 4.5, kategoria 5, przy kryzysie finansowym albo walutowym bez reformy; warianty przy Skarbie PPS; bez Skarbu odpowiedź o osłonach otwiera kartę formowania z Grabskim tolerowanym przez PPS (etap 6, 0.47), a bez niej decyzja zostaje przy gabinecie. Reguły w `source/rules/polish_projects.js` | K |
| Źródła i testy | 17.3, 17.13, 9.7, 11.9, 17.12; testy „Tolerowanie B14”, „Stabilizacja i finanse” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Przejść do wariantów stabilizacji (8.4 katalogu) | brak dostępu wykonawczego (Skarb albo umowa wykonania) | Wybór wariantu projektu | Jeden wspólny budżet i jedna reforma | Z |
| Odpowiedź parlamentarna w ofercie tolerowania eksperta | PPS ma dostęp wykonawczy | Trzy odpowiedzi z 9.7: osłony i podatek majątkowy; pożyczka i ograniczenie cięć; opozycja | Wymagane organizacja, kontakt, zgoda i finansowanie | Z / P |

**Otwarte pytania:** brak.

### 9.12. Kryzys kredytowy — `economy.credit_crisis`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Wydarzenie z czterema odpowiedziami, pokazywane tylko przy dostępie wykonawczym PPS (B16) | Z |
| Wyzwalacz | Kredyt <35 przez 2 M albo datowany impuls profilu (`credit_1925`: VI–XII 1925) | P |
| Okno | Temat 1925 | P |
| Kolejka | Kategoria 5 z 4.5 | P |
| Powtarzalność | Raz na `crisis_id`; ponowne otwarcie nie powiela szoku | P |
| Koszt odpowiedzi | Pierwsza odpowiedź 0 T; koszty i odnowienia interwencji normalne | P |
| Bez odpowiedzi | PPS bez dostępu dostaje informację i może użyć karty stosunku do rządu | Z |
| Zapisuje | Interwencja w projekcie wskazanej karty | P |
| Odczytują | Kredyt i produkcja (11.5); warunek pozostania Grabskiego (17.16.4) | P |
| Co zostaje po karcie | Zobowiązania i następstwa kryzysu | P |
| Obecny kod | `source/scenes/polish_event_credit_crisis.scene.dry` (etap 4, 0.45): kolejka 4.5, kategoria 5, przy kryzysie kredytowym i resorcie PPS (Skarb, Przemysł i Handel albo Praca), raz w rozdziale; kredyt, zamówienia albo roboty, osłona albo brak interwencji. Reguły w `source/rules/polish_projects.js` | K |
| Źródła i testy | 17.13, 17.3, 17.16.2, 17.16.4; test „Kredyt B16” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Uruchomić warunkowy kredyt dla zagrożonej działalności | brak instrumentu Skarbu albo Przemysłu, albo kontraktu wykonania | Podakcja kart 8.5–8.6 katalogu | Limit kredytu i ryzyko z programu | Z / P |
| Podtrzymać zatrudnienie przez zamówienia albo przygotowane roboty | brak zamawiającego albo gotowego projektu Pracy | Zamówienie (8.6 katalogu) albo projekt robót (8.7 katalogu) | Wskazanie projektu nie kończy jego przygotowania | Z / P |
| Skupić środki na osłonach dla tracących pracę | brak Pracy albo wykonawcy | Karta świadczeń (8.2 katalogu) | Brak automatycznego spadku bezrobocia | Z / P |
| Nie podejmować nowej interwencji | — | Bez wydatku i premii | — | Z |

**Otwarte pytania:** brak.

### 9.13. Oszczędności i przegląd osłon — `cabinet.austerity_1926`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Sprawa otwierająca odpowiedź w karcie Stosunek do rządu (B19, 7.6 katalogu) | Z |
| Wyzwalacz | Budżet <−2 przez 2 M albo projekt cięć naruszający umowę. W gabinecie Skrzyńskiego przegląd w 6. miesiącu (`formed_at+5`) przy pełnej osłonie 2 B | P |
| Okno | I–IV 1926 | P |
| Kolejka | Kategoria 4 z 4.5: termin przeglądu (Z — 0.39) | Z |
| Powtarzalność | Raz; nie ponawiamy oferty co miesiąc ani po wczytaniu | P |
| Koszt odpowiedzi | 0 T | P |
| Bez odpowiedzi | — | — |
| Zapisuje | `EventRun.payload`: `cabinet_id`, `original_offer_id`, `revised_offer_id`, `status`, `next_review_at` | P |
| Odczytują | Stosunek do rządu (9.8), ocena ofert (8.3), budżet (11.9) | P |
| Co zostaje po karcie | Przyjęte cięcie daje tylko +1 B z redukcji 2 → 1 B, a osłona maleje proporcjonalnie. Odejście PPS nie ustawia automatycznie Chjeno-Piasta | P |
| Obecny kod | `source/scenes/polish_event_austerity_1926.scene.dry` (etap 4, 0.45): kolejka 4.5, kategoria 4, I–IV 1926 przy pełnej osłonie 2 B, w szóstym miesiącu gabinetu Skrzyńskiego albo przy kryzysie budżetowym, raz; groźba, perswazja, utrzymanie poparcia albo wyjście z gabinetu. Reguły w `source/rules/polish_projects.js` | K |
| Źródła i testy | 17.3, 17.13, 17.16.4, 9.8; testy „B18/B19/B21”, „Oszczędności 1926 przez 9.8” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Negocjować warunek (`bargain`) | — | Jedna oferta kompromisowa: pozostawienie 2 B przy istniejącym albo legalnie poprawionym finansowaniu | Przyjęcie: −3 relacji z każdą partią, która przyjęła; odmowa: spełnić groźbę albo się cofnąć | Z / P |
| Przekonywać bez ultimatum (`persuade`) | — | Ta sama oferta z `need=0` | Relacje bez zmian | Z / P |
| Utrzymać poparcie mimo sporu (`maintain`) | — | Cięcie przechodzi, jeśli ma poparcie | — | Z |
| Wycofać poparcie (`withdraw`) | — | Wyjście PPS | Skrzyński może pozostać, jeśli reszta zaplecza przyjmie program | Z |

Od 0.38 wiersz 17.3 też podaje cztery odpowiedzi karty 9.8. Dawne odpowiedzi się w nich mieszczą: nowe finansowanie to treść oferty kompromisowej, mniejszy zakres i naruszenie to utrzymanie poparcia przy cięciu 2 → 1 B, a wyjście PPS to wycofanie poparcia.

**Otwarte pytania:** brak.

### 9.14. Powrót Chjeno-Piasta — `cabinet.chjeno_return_1926`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Zapis stanu bez menu (B21) | Z |
| Wyzwalacz | Rzeczywisty powrót wcześniej rządzącego Chjeno-Piasta bezpośrednio po gabinecie stabilizacyjnym albo szerokim, przy nierozwiązanej sprawie wojskowej | Z |
| Okno | Po spełnieniu warunków, bez bramki daty | Z |
| Kolejka | — | — |
| Powtarzalność | Raz w rozdziale, bez zaległej dopłaty | Z |
| Koszt odpowiedzi | Brak decyzji | — |
| Bez odpowiedzi | — | — |
| Zapisuje | Zapis kryzysu; presja na zamach +20 raz | Z / P |
| Odczytują | Presja (15.3), bramki próby (16.2) | P |
| Co zostaje po karcie | Próba nadal wymaga wszystkich bramek 16.2 | Z |
| Obecny kod | Brak sceny z tym ID w `source/` (bez karty, B21); impuls +20 liczy raz `source/rules/polish_politics.js` (etap 7, 0.48) | K |
| Źródła i testy | 17.3, 17.13, 17.16.6, 17.16.11; test „B18/B19/B21” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Sekwencja bez wyboru | — | Presja +20 raz | Ocena bramek próby w najbliższym sprawdzianie | Z / P |

**Otwarte pytania:** brak.

### 9.15. Zamach: sekwencja F — `coup.attempt`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Krótka sekwencja: F3 (informacja), F4, F5, F6+F7 (bez decyzji), ewentualnie F9, F10+F11 (wynik) | Z |
| Wyzwalacz | Wszystkie bramki 16.2: presja ≥65, zdolność ≥30, okno operacyjne, brak wykonywanej ugody chroniącej, brak aktywnej próby, upłynięte odnowienie | Z / P |
| Okno | Normalny: od 1 III 1926 i przy sile gotowej w fazie 0 | P |
| Kolejka | Kategoria 2 z 4.5: rozpoczęta konfrontacja | Z |
| Powtarzalność | Po politycznym odwołaniu przygotowań 3 M odnowienia; rozliczona próba kończy rozdział | Z / P |
| Koszt odpowiedzi | F4–F9 nie zużywają miesięcy; najwyżej cztery wewnętrzne rundy | Z |
| Bez odpowiedzi | F6+F7 i F10+F11 nie mają decyzji | Z |
| Zapisuje | `S.coup`: `attempt_id`, `phase`, `f9`, `pps_contribution`, `concessions_to_pps`; zapisane rzuty; raport | P |
| Odczytują | Raport końca rozdziału (19.1–19.2) | P |
| Co zostaje po karcie | Koniec rozdziału, raport i `continuation_requirements` | Z |
| Obecny kod | `source/scenes/polish_event_coup.scene.dry` i `source/rules/polish_security.js` (etap 7, 0.48): F3–F11 bez zużycia miesiąca, silnik M08, koniec rozdziału po rozstrzygnięciu. Odziedziczone `source/scenes/events/prussian_coup.scene.dry` (warunek `not polish_security_rules`) i `source/scenes/events/civil_war.scene.dry` są poza polską kolejką. Od etapu 8 (0.49) teksty mediacji marszałka i zmiany gabinetu nie mają dopisku TBD (mediacja Rataja 12 V 1926; rząd Bartla z 15 V 1926), a raport po zamachu podaje marszałka obradującego Sejmu | K |
| Źródła i testy | 16.8, 16.2, 16.4, 16.6, 17.15, 19.1; testy „Zamach”, „Zero sił”, „Losowanie po F5”, „Wczytanie zamachu”, „Szybkie zwycięstwo”, „Nadchodząca rezerwa”, „Pomiar strajku”, „Istotny udział”, „Ugoda w rundzie 1”, „Przewaga nie negocjuje”, „Odrzucone F9”, „Brak zwycięzcy”, „Wkład kontrfaktyczny”, „Kryzys i przerwa”, „AS w zamachu” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| F4: Poprzeć Piłsudskiego (`support_pils`) | — | Centrum +8 sprzeciwu (+3, jeśli wcześniej `support` albo `conditional`; +12 przy złamaniu obietnicy obrony legalności), Lewica +8, Piłsudczycy −5 | Relacja z Piłsudskim +4, przy wykonanym udziale kolejne +4 | Z / P |
| F4: Bronić legalnego rządu (`defend_legal`) | — | Piłsudczycy +8 (+12 przy złamaniu obietnicy poparcia), Centrum −3 | Relacja z Piłsudskim −4 i −4; z partiami gabinetu odwrotnie | Z / P |
| F4: Zachować neutralność (`mediate`) | — | Piłsudczycy +3 | Relacje bez zmian | Z / P |
| F5: Związki i kolej (`rail`) | neutralność | Wezwanie kolejarzy; koszt rundy z funduszu branży | Opóźnienie transportów kolejowych strony przeciwnej: faza 1 przy udziale ≥40 i gotowości ≥50, faza 2 przy ≥65 i ≥70 | Z / P |
| F5: Milicja (`militia`) | — | Wezwanie Milicji albo AS, jedno zadanie | Konfrontacja po popieranej stronie albo ochrona własnych ludzi przy neutralności | Z / P |
| F5: Oba narzędzia (`both`) | neutralność | Kolej i Milicja | — | Z / P |
| F5: Nie angażować organizacji (`none`) | — | Brak udziału | — | Z |
| F9: Poprzeć przedstawiony kompromis | brak istotnego udziału PPS albo oferty ocenianej na ≥60 przez pozostałe strony | Ugoda w tej rundzie; wynik `constitutional_compromise` | Klauzula końca mobilizacji PPS | Z / P |
| F9: Odrzucić i utrzymać zaangażowanie | jak wyżej | Do końca próby nie ma już ugody | Rundy biegną dalej; odrzucenie nie narusza umowy | Z / P |

Frakcja, której sprzeciw po F4 osiąga ≥60, traci w F10+F11 domyślny manifest E3 bez decyzji. W raporcie instytucje: przemoc +10, demokracja −2 za próbę i kolejne −2 przy `pils_victory` albo `prolonged_conflict`, +1, gdy legalny gabinet przetrwał. Siły, transporty, blokadę kolejową i mediacje maja 1926 opisuje od etapu 8 (0.49) `PL-MAY-COUP-1926-COURSE` (badania 8f); profil `synthetic_test_v2` zostaje, bo jego cztery grupy odpowiadają układowi z 1926 r. Lojalność korpusu oficerskiego historycy oceniają różnie: `TBD — historical research required`.

**Otwarte pytania:** brak.

### 9.16. Następne wybory — `election.successor`

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Sekwencja bez decyzji, kończąca rozdział (G7) | Z |
| Wyzwalacz | Legalnie zarządzone następne wybory; domyślnie koniec kadencji, test 19 II 1928 (t=74) | Z / P |
| Okno | Data rekordu prawnego | P |
| Kolejka | Kategoria 3 z 4.5 | Z |
| Powtarzalność | Jednorazowe; zapisanego wyniku nie cofa później otwarty kryzys | Z |
| Koszt odpowiedzi | Brak decyzji | — |
| Bez odpowiedzi | — | — |
| Zapisuje | Wynik i mandaty; uproszczony nowy Senat | P |
| Odczytują | Raport (19.2), przed formowaniem kolejnego rządu | Z |
| Co zostaje po karcie | Raport bez nowego gabinetu | Z |
| Obecny kod | `source/rules/polish_institutions.js` (kalendarz 19 II 1928, koniec rozdziału) i `source/scenes/polish_chapter_report.scene.dry` (raport); odziedziczona `source/scenes/events/election_1928.scene.dry` nie uruchamia już wyborów, a jej polskie opcje służą tylko formowaniu rządu po 1922 (etap 2) | K |
| Źródła i testy | 7.4, 17.3, 17.15, 19.1; testy „Granica”, „Data”, „Legalny kalendarz bez C8”, „Raport” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| Sekwencja bez wyboru | — | Wynik i mandaty | Koniec rozdziału i raport | Z |

19 lutego 1928 jest propozycją dopuszczalnego kalendarza w grze, nie datą historycznych wyborów.

**Otwarte pytania:** brak.

### 9.17. Sceny informacyjne G — bez ID

| Pole | Treść | Status |
|---|---|---|
| Rodzaj | Informacja, bez decyzji i premii | Z |
| Wyzwalacz | Start kampanii, zbliżające się wybory, wyniki wyborów, koniec rozdziału, wczytanie | Z |
| Okno | Według sceny | Z |
| Kolejka | — | — |
| Powtarzalność | Wczytanie nie powtarza głosowania, kosztu, strat ani losowania | Z |
| Koszt odpowiedzi | Brak decyzji | — |
| Bez odpowiedzi | — | — |
| Zapisuje | — | — |
| Odczytują | — | — |
| Co zostaje po karcie | — | — |
| Obecny kod | G1: `source/scenes/root.scene.dry` (ekran tytułowy i styczeń 1922; od etapu 8, 0.49, bez niemieckiej muzyki); G4: przypomnienie w `source/scenes/main.scene.dry` w trzech miesiącach przed głosowaniem (etap 8); G8: `source/scenes/polish_chapter_report.scene.dry` (od etapu 8 sekcja „Beyond this chapter” i marszałek obradującego Sejmu po zamachu). Ekrany stanu z etapu 8: polska zakładka Defense w `source/scenes/status.scene.dry` oraz oś czasu 1919–1922 i wykresy od I 1922 w `source/scenes/library.scene.dry`. Zakończenie: `source/scenes/game_over.scene.dry` (odziedziczone) | K |
| Źródła i testy | 17.15, 19.2, 19.3; testy „Raport”, „Jedna trudność” w 21.1 | — |

| Opcja (ID) | Zablokowana, gdy | Skutek od razu | Skutek później | Status |
|---|---|---|---|---|
| G1. Początek kampanii | — | Styczeń 1922, krótka sytuacja PPS, „Rozpocznij” bez premii | — | Z |
| G4. Zbliżają się wybory | — | Przypomnienie terminu i stanu sojuszu | Przygotowania przez istniejące karty | Z |
| G6. Wynik wyborów 1922 | — | Głosy i mandaty (9.3 katalogu) | Wybory urzędów i formowanie gabinetu | Z |
| G7. Wynik następnych wyborów | — | Zob. 9.16 katalogu | Koniec rozdziału | Z |
| G8. Raport końca rozdziału | — | Jeden raport z 19.2; F10+F11 albo G7 jest jego początkiem | — | Z |
| G9. Wczytanie kampanii | — | Przywrócenie stanu bez nowej sceny i decyzji (19.3) | — | Z |

G2, G3 i G5 nie są osobnymi ekranami.

**Otwarte pytania:** brak.

## 10. Powtarzające się pytania

Pytania przy kartach układały się w kilka rodzajów; jedno pytanie mogło należeć do dwóch. Wszystkie rozstrzygnięto w 0.33–0.38.

1. **Płatne opcje bez skutku.** Rozstrzygnięte: od 0.32–0.37 takie opcje zastępuje bezpłatne zamknięcie karty w kartach stanowisk, Organizacje, Składki, Program gospodarczy, Jedność, Stosunek do rządu, Kontrola wojska i w kartach rządowych. W 0.51 użytkownik przywrócił płatne potwierdzenie obecnej linii w kartach stanowisk, Składkach i Programie gospodarczym (1 T i zwykłe odnowienie, bez innych skutków; referencja 23.24); odłożenie karty na rękę dalej nic nie kosztuje. Brak otwartych pytań tego rodzaju.
2. **Reakcje frakcji bez profilu.** Referencja każe frakcji reagować, ale nie mówi której. Rozstrzygnięte w 0.33–0.38. Brak otwartych pytań tego rodzaju.
3. **Brak ID albo karty.** Działanie ma koszt, ale nie ma identyfikatora albo miejsca w talii. Rozstrzygnięte w 0.33–0.38; ostatnie ID dostały karty E3 i E6. Brak otwartych pytań tego rodzaju.
4. **Brakujące liczby albo skutki.** Opcja jest zatwierdzona, ale bez kosztu B albo skutku. Rozstrzygnięte w 0.33–0.37. Brak otwartych pytań tego rodzaju.
5. **Sprzeczne albo nieaktualne zapisy w referencji.** Rozstrzygnięte w 0.33–0.38. Brak otwartych pytań tego rodzaju.
6. **Warunki i zakres do doprecyzowania.** Rozstrzygnięte w 0.33–0.38; ostatnie było pytanie o brak odpowiedzi na krytykę parlamentu. Brak otwartych pytań tego rodzaju.

Przy rozbieżności nadal obowiązuje tekst referencji. Nowe rozstrzygnięcia zapisujemy w referencji i w katalogu w tym samym kroku.
