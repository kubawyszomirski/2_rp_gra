# Etap 8, część 8f: badania historyczne punktów TBD

**Stan:** zatwierdzone i wdrożone 4 X 2026. Użytkownik przyjął wszystkie dziewięć propozycji (wariant A; w punkcie 9 także A2), a do punktu 1 dodał strojenie presji na wiosnę 1926. Wynik wdrożenia opisuje ostatnia sekcja.

**Jak powstał raport**
- Cztery osobne badania objęły prace naukowe, akty prawne i prasę z epoki. Wszystkie źródła sprawdzono 4 X 2026.
- Pełne notatki badań są w katalogu [notes/](notes/). To robocze wyniki modelu językowego, a nie źródła: spisują źródła i tropy do sprawdzenia.
- Ustalenia, od których zależą proponowane zmiany w grze, sprawdziłem sam w źródle. Mają dopisek **sprawdzone**.
- Skutki dla gry zmierzyłem bez zmieniania gry: [whatif.cjs](whatif.cjs), wyniki w [results.json](results.json). Używam tych samych 13 strategii i ziaren 8001–8012 co w `analysis/stage8-campaigns/`.

**Oznaczenia**
- [F] fakt podany w źródle; [I] interpretacja historyka; [W] nasz wniosek.
- Pewność: wysoka, średnia albo niska.
- P to liczba robocza, Z to wartość już przez Ciebie zatwierdzona.

## Podsumowanie

| # | Punkt | Dziś w grze | Najważniejsze ustalenie | Pewność | Propozycja |
|---|---|---|---|---|---|
| 1 | Data otwarcia sprawy wojskowej | I 1925, wejście testowe | 2 VII 1923 Piłsudski rezygnuje z ostatniej funkcji wojskowej, po projekcie ustawy Szeptyckiego | wysoka, sprawdzone | VII 1923 |
| 2 | Publiczny epizod nacisku wojska (+8) | pierwszy kryzys gabinetowy przy otwartej sprawie (Z) | 15 XI 1925 oficerowie w Sulejówku, w kryzysie po dymisji Grabskiego | wysoka | kryzys od XI 1925 |
| 3 | Obsady i kompetencje stanowisk wojskowych | profil syntetyczny | ministrowie i szefowie Sztabu 1922–1926; konstytucja marcowa | wysoka / średnia | tylko dokumentacja |
| 4 | Spór Naczelnika z Ponikowskim (1922) | spór w VI 1922, wystąpienie o „traktowaniu gabinetu przez Sejm”; Śliwiński rządzi do wyborów | 2–6 VI dymisja gabinetu; potem spór o prawo powoływania rządu; Śliwiński obalony 7 VII; Korfanty, strajk PPS 18 VII; Nowak 31 VII | wysoka, sprawdzone | poprawić temat wystąpienia; kalendarz bez zmian |
| 5 | Kult Niewiadomskiego (1923) | wydarzenie od I 1923, miejsce TBD | egzekucja 31 I; pogrzeb na Powązkach 6 II z mszą, ok. 10 tys. osób; nabożeństwa w lutym w wielu miastach; orędzie biskupów ok. 10 II | wysoka, sprawdzone | II 1923, Warszawa, Powązki |
| 6 | Zamach majowy: siły, kolej, mediacja | profil syntetyczny; mediator: marszałek Sejmu | układ sił zgodny ze strukturą profilu; mediacja Rataja 12 V; rząd Bartla 15 V | średnia | profil zostaje; dokumentacja |
| 7 | Cele KPP w strajkach | cel `broad` (test) | KPRP w 1923 r.: obalić rząd, rząd robotniczo-chłopski, strajk powszechny | wysoka, sprawdzone | `structural` |
| 8 | Prądy w PPS | profil testowy stanowisk | piłsudczycy potwierdzeni; Centrum częściowo; Lewica słabo udokumentowana | średnia | bez zmian w grze |
| 9 | Partie wobec autonomii mniejszości | ZLN −2, mniejszości +1, reszta 0 | PPS za autonomią terytorialną; Wyzwolenie tylko w deklaracjach; Piast i chadecja w pakcie lanckorońskim | średnia, część sprawdzona | Piast −1, PSChD −1, Wyzwolenie +1, PPS +1 |

---

## 1. Data otwarcia sprawy wojskowej

**Dziś w grze:** sprawa otwiera się w I 1925 (`SCENARIO_INPUTS.military_case` w `source/rules/polish_politics.js`). Referencja 17.16.11 nazywa tę datę roboczą: `TBD — historical research required`.

**Ustalenia** (szczegóły: [notes/military-case.md](notes/military-case.md)):
- [F] 18 VI 1923 minister Szeptycki przedstawia Radzie Ministrów projekt ustawy o organizacji najwyższych władz wojskowych. 27 VI projekt trafia do Sejmu. Pewność średnia: każdą z tych dat podaje jedno źródło naukowe.
- [F] 30 VI 1923 na posiedzeniu Ścisłej Rady Wojennej Piłsudski zarzuca Szeptyckiemu nielojalność i zapowiada odejście z wojska.
- [F] **2 VII 1923** Piłsudski rezygnuje z przewodnictwa Ścisłej Rady Wojennej, swojej ostatniej funkcji wojskowej. Poza czynną służbą pozostaje do 15 V 1926.
  - Pewność wysoka: datę podają cztery niezależne źródła.
  - **Sprawdzone** w biogramie Piłsudskiego na dzieje.pl (Muzeum Historii Polski / PAP).
- [F] Z funkcji szefa Sztabu Generalnego zrezygnował wcześniej. Dymisję złożył pod koniec maja 1923, a weszła w życie w czerwcu (dzieje.pl podaje 9 VI).
- [F] 3 VII 1923 w hotelu Bristol Piłsudski tłumaczy swoje odejście i atakuje endecję.
- [F] Dalsze fazy sprawy:
  - kompromis Sosnkowskiego (XII 1923 – II 1924);
  - projekt Sikorskiego w Sejmie (wniesiony 14 III 1924, wycofany z komisji ok. 10 II 1926);
  - eskalacja z udziałem oficerów (XI 1925 – II 1926);
  - projekt Żeligowskiego (4 V 1926);
  - rozstrzygnięcie dekretem z 6 VIII 1926 (Dz.U. 1926 nr 79 poz. 445), już po zamachu.
- [W] Listopad 1925 to eskalacja istniejącej sprawy, a nie jej początek.
- Temat sprawy w grze, „the organisation of the supreme military authorities”, zgadza się ze źródłami.

**Propozycja 1**
- **A (polecam):** sprawa otwiera się w VII 1923, z datą-kotwicą 2 VII 1923.
- **B:** zostaje I 1925 jako wartość testowa.

**Zmierzony skutek wariantu A** (13 strategii × 12 ziaren):

| Strategia | Dziś (I 1925) | VII 1923 |
|---|---|---|
| N-A, bierna | próba w 12/12, IV 1927 | próba w 12/12, III 1926 |
| N-H, historyczne decyzje | 12/12, VI 1927 | 12/12, III 1926 |
| N-B i N-C | bez próby w 12/12, dzięki umowie z Piłsudskim | bez zmian |
| 9 strategii z 21.2 | 12/12, mediany V–VIII 1927 | 12/12, III 1926 |

- Wariant A sam spełnia cel 1A: N-A i N-H mają próbę w każdym ziarnie, z medianą w III 1926. N-B i N-C pozostają bez próby. Żadnej liczby P nie zmieniam.
- To nie jest przesunięcie daty dla wymuszenia maja. Data pochodzi ze źródeł, a próba wypada w marcu, nie w maju.
- **Zastrzeżenie:** presja przekracza 65 już między V 1925 a I 1926. Datę próby wyznacza wtedy techniczne okno sposobności od III 1926 (P, 17.16.6), a nie łańcuch zdarzeń. Każda strategia bez umowy z Piłsudskim ma próbę w tym samym miesiącu. Wyniki zamachu też są prawie jednakowe: 7 zwycięstw Piłsudskiego, 3 kompromisy i 2 zwycięstwa rządu na 12 ziaren.
- Czy w części 8d stroić liczby P tak, żeby presja przekraczała 65 bliżej III–VIII 1926, a decyzje PPS znów zmieniały datę? To osobna decyzja; zapytam o nią po Twojej odpowiedzi w punkcie 1.

## 2. Publiczny epizod nacisku wojska (+8)

**Dziś w grze (Z, decyzja 1A etapu 7):** jeden publiczny epizod nacisku wojska dodaje +8 do presji w pierwszym kryzysie gabinetowym przy otwartej sprawie. Przy sprawie od I 1925 epizod w obecnych kampaniach w ogóle się nie zdarza, bo po I 1925 nie ma kryzysu gabinetowego.

**Ustalenia:**
- [F] 13 XI 1925 rząd Grabskiego podaje się do dymisji. 14 XI Piłsudski składa Prezydentowi pisemne ostrzeżenie.
- [F] 15 XI 1925 oficerowie manifestują w Sulejówku; przemawia gen. Orlicz-Dreszer. Liczba uczestników według źródeł: od kilkuset do około tysiąca.
- [I] Historycy różnią się w ocenie, czy za tym stał spisek. Kulka oraz Dmowski i Chromiński opisują poufne przygotowania; Olstowski i Suleja (2026) zaprzeczają, by istniała konspiracja.

**Problem:** przy sprawie od VII 1923 obecna reguła umieszcza epizod w pierwszym kryzysie po VII 1923. W kampaniach jest to XII 1923, czyli upadek Witosa. Historycznie epizod przypadł na kryzys z XI 1925, prawie dwa lata później.

**Propozycja 2** (ma znaczenie tylko przy wariancie 1A)
- **A (polecam):** epizod w pierwszym kryzysie gabinetowym od XI 1925, przy otwartej sprawie. Wymaga nowego datowanego wejścia scenariusza.
- **B:** reguła bez zmian.
- **Zmierzony skutek wariantu A:**
  - termin próby się nie zmienia (III 1926);
  - presja przekracza 65 nieco później: u N-A w IX 1925 zamiast V 1925;
  - w obecnych kampaniach epizod się nie zdarza, bo Grabski przetrwa kryzys kredytowy. Ten znany problem należy do części 8d.

## 3. Obsady i kompetencje stanowisk wojskowych

**Dziś w grze:** profil syntetyczny. Referencja (12.4, 17.12) podaje: „historyczne obsady i zakresy: TBD”.

**Ustalenia** — konstytucja marcowa, Dz.U. 1921 nr 44 poz. 267 [F]:
- **art. 46:** Prezydent jest zwierzchnikiem sił zbrojnych, ale nie może dowodzić w czasie wojny. Naczelnego Wodza mianuje na wypadek wojny, na wniosek Rady Ministrów.
- **art. 44:** akty Prezydenta wymagają kontrasygnaty.
- **art. 45:** urzędy wojskowe obsadza się na wniosek Rady Ministrów.
- Dekret z 7 I 1921 utworzył Ścisłą Radę Wojenną. Jej przewodniczący był przewidziany na Naczelnego Wodza i działał poza kontrolą parlamentu.

| Stanowisko | Osoba | Okres | Pewność |
|---|---|---|---|
| Minister spraw wojskowych | gen. K. Sosnkowski | do końca V 1923 | wysoka |
| Kierownik ministerstwa | gen. A. Osiński | 28 V – 13 VI 1923 | średnia |
| Minister spraw wojskowych | gen. S. Szeptycki | 13 VI – 5 XII 1923 | wysoka |
| Minister spraw wojskowych | gen. K. Sosnkowski | 19 XII 1923 – II 1924 | średnio-wysoka |
| Minister spraw wojskowych | gen. W. Sikorski | 17 II 1924 – 14 XI 1925 | wysoka |
| Minister spraw wojskowych | gen. L. Żeligowski | 27 XI 1925 – 10 V 1926 | średnia (dzień) |
| Minister spraw wojskowych | gen. J. Malczewski | 10 – 15 V 1926 | średnia |
| Minister spraw wojskowych | J. Piłsudski | od 15 V 1926 | wysoka |
| Szef Sztabu Generalnego | gen. W. Sikorski | 1 IV 1921 – 16 XII 1922 | wysoka |
| Szef Sztabu Generalnego | J. Piłsudski | XII 1922 – VI 1923 | wysoka (miesiące) |
| Szef Sztabu Generalnego | gen. S. Haller | VI 1923 – V 1926 | wysoka |
| p.o. szefa Sztabu Generalnego | gen. E. Kessler | XII 1925 – V 1926 | średnia |
| Przewodniczący Ścisłej Rady Wojennej | J. Piłsudski | 1921 – 2 VII 1923; potem prawdopodobnie bez obsady | wysoka / niska |

**Propozycja 3**
- **A (polecam): tylko dokumentacja.** Ustalenia trafiają do `HISTORICAL_SOURCES.md` i do notki w referencji.
  - W grze gabinety są alternatywne, więc historyczne nazwiska nie pasują do ekranów.
  - Profil nominacji zostaje syntetyczny (P).
- **Obserwacja:** w latach 1922–1926 ministrami spraw wojskowych byli wyłącznie generałowie. W grze tekę może objąć partia, także PPS. Zapiszę to jako świadome uproszczenie gry.

## 4. Spór Naczelnika z Ponikowskim (1922)

**Dziś w grze:**
- spór w VI 1922 zapisuje jedną sprawę i wystąpienie Piłsudskiego (B2) na temat „the Sejm’s treatment of the cabinet of Ponikowski”;
- karty kompromisu nie ma (P), więc gabinet Ponikowskiego podaje się do dymisji, a formowanie jest obowiązkowe;
- w kampanii biernej Śliwiński rządzi od VI do XI 1922, a Nowak od XI 1922.

**Ustalenia** (szczegóły: [notes/crisis-1922-niewiadomski.md](notes/crisis-1922-niewiadomski.md), część 1):
- **Faza 1: Naczelnik kontra gabinet.**
  - [F] 2 VI 1922 na posiedzeniu Rady Ministrów w Belwederze Piłsudski zażądał odpowiedzi, czy państwu grozi niebezpieczeństwo. Uchwała rządu go nie zadowoliła i gabinet podał się do dymisji. 6 VI Piłsudski oświadczył, że dymisję przyjmuje.
  - [I] Faryś: Piłsudski chciał usunąć ministra spraw zagranicznych Skirmunta i ministra skarbu Michalskiego. Tło to szok po Rapallo i cięcia wydatków na wojsko. dzieje.pl wskazuje jako bezpośredni powód spór o kredyty na wojsko.
  - **Sprawdzone** w: J. Faryś, „Pamięć i Sprawiedliwość” 2(38)/2021.
- **Faza 2: Naczelnik kontra Sejm o prawo powoływania rządu.**
  - [F] Mała Konstytucja kazała powoływać rząd „na podstawie porozumienia z Sejmem”. Piłsudski zażądał wykładni tego zapisu.
  - [F] 16 VI Sejm uchwalił wykładnię: inicjatywa należy „z reguły” do Naczelnika, ale bez porozumienia premiera desygnuje organ Sejmu większością głosów. 17 VI powołano Komisję Główną. Wyniki obu głosowań źródła podają różnie.
- **Dalszy przebieg** [F]:
  - 28 VI Naczelnik mianował gabinet Śliwińskiego; Narutowicz został ministrem spraw zagranicznych.
  - 7 VII Sejm odmówił temu gabinetowi zaufania stosunkiem 201:195, przy 3 wstrzymujących się (**sprawdzone**, Faryś). Za odwołaniem głosowała prawica i część Klubu Pracy Konstytucyjnej.
  - 14 VII Komisja Główna desygnowała Korfantego stosunkiem 219:206 (**sprawdzone**). Piłsudski odpisał, że nie może brać udziału w tej pracy i będzie zmuszony złożyć urząd. Dekretów nie podpisał.
  - 18 VII PPS przeprowadziła w Warszawie strajk demonstracyjny i wiec przeciw Korfantemu. Liczbę uczestników źródła podają od ok. 8 tys. do 50 tys.
  - 26 VII Sejm odrzucił wniosek prawicy o wotum nieufności dla Naczelnika.
  - 29 VII Komisja Główna uchyliła desygnację Korfantego i przyjęła kandydaturę Juliana Nowaka (240:184). 31 VII Naczelnik podpisał dekrety gabinetu Nowaka.
- [W] PPS konsekwentnie stała po stronie Naczelnika. Wynik rozstrzygał Klub Pracy Konstytucyjnej: najpierw głosował z prawicą, potem poparł Nowaka.

**Propozycja 4**
- **A (polecam): poprawić temat wystąpienia B2.**
  - Spór dotyczył najpierw polityki gabinetu, a potem prawa powoływania rządu, a nie „traktowania gabinetu przez Sejm”.
  - Nowy temat: „who appoints the cabinet: the Naczelnik or the Sejm”.
  - Sprawa w grze („the dispute of the Naczelnik with the cabinet of Ponikowski”) i jej data (VI 1922) zgadzają się ze źródłami.
- **Kalendarz bez zmian.**
  - W grze Śliwiński rządzi do wyborów, a historycznie upadł po 10 dniach.
  - Sprawa Korfantego ze strajkiem PPS (VII 1922) i gabinet Nowaka od 31 VII to dobry materiał na przyszłe wydarzenie dla PPS. Byłaby to jednak nowa treść, a decyzja 4A wyklucza nową narrację w etapie 8.
  - Proponuję zapisać to jako uproszczenie gry i jako kandydata do późniejszego etapu.
- **B:** bez zmian; ustalenia tylko w dokumentacji.

## 5. Kult Niewiadomskiego (1923)

**Dziś w grze:** wydarzenie B5 przychodzi od I 1923, miejsce uroczystości jest `TBD — historical research required` (`source/rules/polish_politics.js`). Tekst wydarzenia zaznacza, że szczegóły nabożeństwa są syntetyczne.

**Ustalenia** (szczegóły: [notes/crisis-1922-niewiadomski.md](notes/crisis-1922-niewiadomski.md), część 2):
- **Pogrzeb w Warszawie** [F]. Niewiadomskiego stracono 31 I 1923, a 6 II pochowano na Powązkach. W kościele cmentarnym odprawiono śpiewaną mszę żałobną. Mszy i konduktowi towarzyszył tłum ok. 10 tys. osób.
  - Pewność wysoka; **sprawdzone** w Polskim Słowniku Biograficznym (iPSB).
  - To najlepiej udokumentowana publiczna uroczystość ku jego czci.
- **Nabożeństwa w lutym 1923** [F], głównie według relacji prasy PPS i endeckiej:
  - Warszawa: 1 II u św. Krzyża;
  - Kraków: 10 II u franciszkanów, a wieczorem pochód PPS liczący kilka tysięcy osób, z wybitymi szybami i starciem z młodzieżą sprzyjającą Niewiadomskiemu;
  - Łomża: 15 II;
  - Zakopane: 20 II;
  - Lwów: katedra;
  - Poznań: u franciszkanów;
  - Toruń: nabożeństwo i skarga wojewody Brejskiego na księdza; data TBD.
- **Kościół** [F]: ok. 10 II biskupi w orędziu napiętnowali nadużywanie nabożeństw do manifestacji (**sprawdzone**, PSB). Duchowieństwo zachowało się różnie: część księży odprawiała nabożeństwa, część przełożonych się dystansowała.
- **Sejm** [F]: 16 II przyjął nagłość wniosku „Wyzwolenia” przeciw gloryfikacji zbrodni.
  - Według PSB była to specjalna uchwała.
  - Według stenogramu przyjęto nagłość i odesłano wniosek do komisji.
  - Ostateczny wynik: TBD.
- **PPS** [F]: kampania „Naprzodu”, pochód w Krakowie 10 II i interpelacja w krakowskiej radzie miasta.

**Propozycja 5**
- **A (polecam):**
  - wydarzenie przychodzi w II 1923, po egzekucji 31 I, a nie w I 1923;
  - miejscem jest pogrzeb na Powązkach 6 II 1923 z mszą żałobną i ok. 10 tys. uczestników;
  - w tekście wydarzenia zdanie o syntetycznym nabożeństwie zastępuję jednym zdaniem o tym pogrzebie i lutowych nabożeństwach;
  - odpowiedzi PPS i ich skutki zostają bez zmian, a msza w obronie demokracji pozostaje alternatywą gry.
  - **Zmierzony skutek:** w 156 kampaniach (13 strategii × 12 ziaren) przesunięcie o miesiąc nie zmienia liczby prób, ich mediany ani wyników zamachu.
- **B:** bez zmian; ustalenia tylko w dokumentacji.

## 6. Zamach majowy: siły, kolej, mediacja

**Dziś w grze:**
- **Siły:** cztery syntetyczne zgrupowania profilu `synthetic_test_v2` (Z, M08), w punktach siły:
  - garnizon stolicy wierny rządowi (45);
  - jednostki stołeczne bliskie Piłsudskiemu (55);
  - bliski odwód (25);
  - daleki odwód dowożony koleją (35, opóźnienie do 2 faz).
- **Mediacja:** ofertę ugody przedstawia marszałek Sejmu (P). Przebieg historycznych mediacji oznaczono jako TBD.
- **Ugoda „zmiana gabinetu”:** prowadzi do premiera akceptowanego przez obóz Piłsudskiego. W tekście dla gracza jest dopisek „the candidate is TBD — historical research required”.
- **Lojalność oficerów:** związek demokracji z lojalnością oficerów to uproszczenie gry (TBD).

**Ustalenia** (szczegóły: [notes/may-coup-1926.md](notes/may-coup-1926.md)):

*Siły* [F], źródła podają rozbieżne liczby, pewność średnia lub niska:

| Moment | Piłsudski | Rząd |
|---|---|---|
| 12 V wieczorem, w Warszawie | ok. 3,4–3,5 tys. | ok. 1,7 tys. |
| 14 V, w Warszawie | ok. 8,5 tys. i ok. 800 członków Związku Strzeleckiego | ok. 2–2,2 tys. |
| Łącznie z oddziałami w drodze (tylko za Wikipedią, która powołuje się na Chojnowskiego 1986) | ok. 12 tys. | ok. 8 tys. |

*Posiłki* [F]:
- 57 i 58 pułk piechoty z Poznania dotarły rano 13 V.
- Grupa ożarowska, ok. 6 tys. żołnierzy z Wielkopolski i Pomorza, utknęła pod Ożarowem.
- Transporty z Krakowa zatrzymały się w Piotrkowie, Częstochowie i Katowicach.
- Pułki ze Lwowa nie zostały wysłane albo zatrzymali je kolejarze; źródła są sprzeczne.
- Do Piłsudskiego dojechały koleją 14 V 1 Dywizja Piechoty Legionów z Wilna i bataliony 3 Dywizji Piechoty Legionów z Lubelszczyzny.

*Kolej* [F]:
- 13 V Zarząd Główny Związku Zawodowego Kolejarzy wezwał do wstrzymywania transportów wojsk idących rządowi na odsiecz.
- Centralny Komitet Wykonawczy PPS ogłosił strajk generalny od 14 V.
- Blokada działała wybiórczo.
- [I] Znaczenie strajku jest sporne: według jednych zdecydowało o wyniku, według innych było istotne, ale nie decydujące.

*Mediacje* [F]:
- 12 V prezydent rozmawiał z Piłsudskim na moście Poniatowskiego, bez porozumienia.
- Wieczorem 12 V **pośredniczył marszałek Sejmu Rataj**, ale prezydent odmówił rozmów.
- 13 V misja generałów Żeligowskiego, Majewskiego i Osińskiego w Belwederze nie przyniosła skutku.
- 14 V w Wilanowie rząd podał się do dymisji, a prezydent zrezygnował, wbrew generałom.
- 15 V Rataj, jako pełniący obowiązki prezydenta (art. 40), powierzył misję Kazimierzowi Bartlowi. Piłsudski został ministrem spraw wojskowych.

*Lojalność oficerów* [I], historycy się różnią:
- Suleja: większość korpusu oficerskiego uważała się za podkomendnych Piłsudskiego.
- Halbersztadt: zdecydowanie po jego stronie stanęło tylko kilkunastu generałów.
- [F] Okręgi zachodnie i Kraków skłaniały się ku rządowi. Lublin (gen. Romer) przeszedł 13 V na stronę Piłsudskiego.

*Ofiary* [F]:
- według komisji gen. Żeligowskiego 379 zabitych, w tym 164 cywilów, i ok. 920 rannych;
- inne szacunki podają od 331 do ok. 400 zabitych.

**Propozycja 6**
- **A (polecam):**
  - **Profil sił zostaje syntetyczny (Z, M08).**
    - Struktura czterech grup odpowiada historycznemu układowi: podzielony garnizon stolicy, bliskie odwody, dalekie odwody dowożone koleją i wybiórcza blokada kolejowa.
    - Liczby w źródłach są jednak sprzeczne, a zmiana proporcji przestawiłaby wyniki zamachu zatwierdzone w M08.
    - Ustalenia zapisuję w dokumentacji z wyraźną granicą: to nie jest rekonstrukcja.
  - **Mediacja marszałka Sejmu:** w dokumentacji oznaczona jako historycznie uzasadniona (Rataj, 12 V wieczorem). W grze bez zmian.
  - **Ugoda „zmiana gabinetu”:**
    - w dokumentacji historycznym odpowiednikiem jest rząd Bartla z 15 V 1926;
    - z tekstu dla gracza usuwam dopisek „(the candidate is TBD — historical research required)”, bo to notatka robocza, a decyzja 4A je usuwa;
    - Bartla nie dodaję jako postaci, bo decyzja 4A wyklucza nową narrację historyczną.
  - **Lojalność oficerów:** związek z demokracją zostaje uproszczeniem gry, bo historycy się spierają.
- **B:** osobny historyczny profil sił i pomiar jego skutków. Nie polecam w tym etapie: liczby są sprzeczne, a profil wymagałby nowej kalibracji zamachu.

## 7. Cele KPP w strajkach

**Dziś w grze:** `PARTNER_GOAL = 'broad'` w `source/rules/polish_unions.js`. To cel testowy dla wszystkich strajków (referencja 9.6, M13).

**Ustalenia** (szczegóły: [notes/pps-currents-autonomy-kprp.md](notes/pps-currents-autonomy-kprp.md), część 3):
- [F] Cele wyznaczone przez II Zjazd KPRP (IX–X 1923) i „Nowy Przegląd”:
  - obalić rząd Chjeno-Piasta;
  - utworzyć rząd robotniczo-chłopski, który torowałby drogę do dyktatury proletariatu;
  - działać nie przez parlament, lecz przez strajk powszechny lub wielkie manifestacje.
  - **Sprawdzone:** A. Pilch, „Krzysztofory” 10 (1983), s. 85.
- [F] W Krakowie (XI 1923) KPRP wzywała do kontynuowania strajku aż do zwycięstwa, ale nie kierowała ruchem. Decydujący wpływ miała PPS (Pilch, s. 87, **sprawdzone**).
- [F] W 1922 r. KPRP traktowała jednolity front jako broń przeciw partiom socjalistycznym. Kierownictwo PPS i KCZZ odrzuciło jej oferty z 1922 i 1923 r.
- [I] Friszke: w latach 1921–1926 komuniści czekali na przypływ fali rewolucyjnej.
- Do 1925 r. partia nazywała się KPRP; gra przez cały rozdział używa nazwy „KPP”.

**Propozycja 7**
- **A (polecam):** cel KPP `structural` (żądanie polityczne), jako datowany profil historyczny na lata 1922–1926.
  - Skutki przy relacji 30:
    - przy pojedynczym żądaniu ograniczonym pełnej współpracy nie da się zawrzeć, a ograniczona koordynacja ma 15% szans na dotrzymanie zasad;
    - przy żądaniu szerokim szansa dotrzymania umowy spada z 65% do 40%;
    - przy żądaniu politycznym bez zmian (65%);
    - niezwiązana część udziału KPP wspiera każde żądanie PPS.
  - **Zmierzony skutek w kampaniach: żaden.** KPP ma 5% wśród robotników w 108 ze 156 przebiegów (31% miesięcy), ale automaty strategii nigdy nie współpracują z KPP. Zmiana dotyczy tylko gracza, który wybierze współpracę.
- **B:** cel `broad` zostaje jako P, a ustalenie trafia tylko do dokumentacji.
- **Nazwa partii:** proponuję zostawić „KPP” jako uproszczenie gry i opisać je w dokumentacji. Zmiana nazwy wymagałaby wielu edycji tekstów.

## 8. Prądy w PPS

**Dziś w grze:**
- **Profil testowy stanowisk** `faction_stance_profile_v1` (Z, 0.32):
  - piłsudczycy odrzucają linię „Oppose the army’s interference”;
  - Centrum odrzuca linię „Support his influence”.
- **Militaryzacja Milicji** budzi sprzeciw Centrum (Z, 0.34).
- **Akceptacja współpracy z KPP** jest jednakowa we wszystkich prądach: 50 (P).
- **Doradcy:**
  - Centrum: Daszyński, Pużak, Perl, Niedziałkowski, Arciszewski;
  - Lewica: Zaremba, Czapiński; w kontynuacji także Próchnik, Drobner, Dubois;
  - piłsudczycy: Jaworowski, Moraczewski, Ziemięcki, Malinowski.

**Ustalenia** (szczegóły: [notes/pps-currents-autonomy-kprp.md](notes/pps-currents-autonomy-kprp.md), część 1):
- [I] Prądy były nieformalne. Zwolennicy Piłsudskiego nie tworzyli jednej zwartej frakcji (Kowalski 2018).
- **Piłsudczycy** — skład potwierdzony: Moraczewski, Jaworowski, Hołówko, a także Malinowski, Downarowicz, Praussowa i inni.
  - [F] Moraczewski wiązał udział PPS w rządzie Skrzyńskiego z powrotem Piłsudskiego do wojska; 7 I 1926 postawił tę sprawę na Radzie Ministrów.
  - [F] „Manifest do ludu pracującego” (IV 1926): Piłsudski powinien znów stanąć na czele wojska.
  - Wniosek: reguła profilu dla piłsudczyków ma mocne oparcie. Pewność wysoka.
- **Centrum:**
  - [F] Perl na kongresie 1923/24 mówił, że Piłsudski nie jest „naszym człowiekiem”.
  - [F] W I 1924 Centralny Komitet Wykonawczy zakazał członkom należenia bez zgody partii do innych organizacji, także legionowych.
  - [F] Daszyński wydał jednak w 1925 r. pochwalną broszurę o Piłsudskim.
  - Wniosek: reguła profilu dla Centrum ma tylko częściowe oparcie. Pewność średnia.
- **Lewica:** przed 1926 r. słabo udokumentowana.
  - [F] Pragier założył organizację „Młot” przeciw wpływom piłsudczyków w partii (data TBD).
  - [F] Czapiński w 1923 r. w Krakowie łączył ataki na Chjeno-Piasta z apoteozą Piłsudskiego (**sprawdzone**, Pilch, s. 85). Jego przypisanie do Lewicy w latach 1922–1926 jest więc niepewne.
- **Autonomia** dzieliła ludzi w poprzek prądów: Moraczewski był przeciw, Hołówko za autonomią Galicji Wschodniej, Niedziałkowski pisał projekty, Daszyński był za.
- **Komuniści:** kierownictwo (Centrum) odrzucało oferty KPRP, a piłsudczycy byli zdecydowanie antykomunistyczni.
- **Ziemięcki** (w grze piłsudczyk) był blisko tego prądu:
  - 9 V 1926 Piłsudski żądał dla niego teki ministra;
  - przed zamachem w jego mieszkaniu odbyło się spotkanie z instrukcją dla kolejarzy.
  - Pewność średnia; zgodne z grą.
- **Rozłam PPS-Lewicy:**
  - nastąpił w VI 1926, po zamachu, i miał zasięg regionalny: zachodnia Małopolska, Lubelszczyzna, Śląsk;
  - przywództwo jest sporne: Czuma albo Dymowski;
  - Lieberman i Pragier zostali w PPS.
  - To wydarzenie leży poza rozdziałem 1. Rozłam Lewicy w grze jest mechaniką, a nie odtworzeniem tego wydarzenia.

**Propozycja 8**
- **A (polecam): bez zmian w grze.**
  - W dokumentacji zapisuję: reguła piłsudczyków ma oparcie historyczne (pewność wysoka), reguła Centrum częściowe (średnia), stanowiska Lewicy przed 1926 r. pozostają TBD.
  - Przypisania doradców zostają bez zmian, z notką o niepewnym przypisaniu Czapińskiego.
- **B:** zróżnicować akceptację współpracy z KPP, np. piłsudczycy niżej. Nie mierzyłem skutków i nie polecam tego w tym etapie.

## 9. Partie wobec autonomii mniejszości

**Dziś w grze:**
- **Temat `autonomy` w profilach partii** (P, Z — 0.33): ZLN −2 (z czerwoną linią „autonomia terytorialna”), „inne mniejszości” +1, pozostali 0.
- **Skala:** −2 polonizacja, 0 prawa kulturalne bez autonomii, +1 autonomia województw, +2 federacja.
- **Gdzie działa:**
  - przy głosowaniu nad ustawą o ograniczonej autonomii (karta spraw wewnętrznych);
  - przy ofertach z tym tematem.
- **Linia startowa PPS:** `cultural_rights` (0, P).

**Ustalenia:**
- **PPS:** jedyna partia z inicjatywami ustawodawczymi [F].
  - Projekt Niedziałkowskiego z X 1921: szeroka autonomia Galicji Wschodniej z własnym Sejmem Krajowym.
  - Projekt z 1924 r., wniesiony w I 1925: Galicja Wschodnia, Wołyń i dwa powiaty poleskie.
  - **Sprawdzone:** Szumiło, „Rocznik Lubelski” 37 (2011), s. 114. Pewność wysoka.
- **PSL „Wyzwolenie”:** deklarowało autonomię terytorialną (1924), ale nigdy nie złożyło konkretnego wniosku [F] (Szumiło, s. 114, **sprawdzone**). Pewność średnia.
- **PSL „Piast”:** pewność średnia.
  - [F] W programie z 1921 r. deklarowało równouprawnienie.
  - [F] W pakcie lanckorońskim (17 V 1923) przyjęło m.in.: „większość polską” jako podstawę rządów, rząd tworzony tylko przez Polaków, *numerus clausus* i osadnictwo na Kresach.
  - [I] W praktyce dążyło do asymilacji.
- **Chadecja:** [F] podpisała pakt lanckoroński. Jej stanowisko wobec samej autonomii pozostaje TBD. Pewność średnia lub niska.
- **NPR:** [F] autonomia kulturalna, ale nie dla Żydów; Polska jako „państwo narodowe, a nie narodowościowe” (III Kongres, V 1923). Pewność średnio-wysoka.
- **ZLN:** pewność wysoka.
  - [F] Uznawał tylko autonomię kulturalną; Głąbiński widział w autonomii Galicji Wschodniej drogę do rozpadu państwa.
  - [I] Celem była asymilacja.
- **Mniejszości:**
  - [F] Ukraińska Reprezentacja Parlamentarna przyjęła w V 1923 program autonomii terytorialnej wszystkich ziem ukraińskich, z własnym sejmem. „Autonomię wojewódzką” uważała za niewystarczającą (Szumiło, s. 111–112, **sprawdzone**). W ciągu roku większość jej posłów odeszła od tego programu.
  - [F] Koło Żydowskie złożyło w VI 1924 projekt autonomii narodowej Żydów, osobowej, a nie terytorialnej.
  - Stanowisko posłów niemieckich: TBD.
- **Akty prawne** [F]:
  - Ustawa z 26 IX 1922 o samorządzie województw lwowskiego, tarnopolskiego i stanisławowskiego nie weszła w życie.
  - Ustawy językowe i szkolna z 31 VII 1924 przeszły głosami partii polskich.

**Propozycja 9**
- **A (polecam):** datowany profil historyczny tematu `autonomy`.
  - Zmiany: Piast −1, PSChD −1, Wyzwolenie +1, PPS +1.
  - Bez zmian: ZLN −2, NPR 0, inne mniejszości +1.
  - Reprezentacja żydowska 0 i KPP 0 zostają, bo brak danych o ich stosunku do autonomii terytorialnej ziem słowiańskich.
  - **Zmierzony skutek** (Sejm 1922, bierna PPS, XII 1922):
    - dziś ustawa o ograniczonej autonomii ma 286 głosów za, nie licząc PPS, w tym Piasta i chadecji;
    - po zmianie: 157 za, 99 przeciw, 145 wstrzymujących się, bo Piast i PSChD się wstrzymują;
    - ustawa nadal przechodzi, ale bez poparcia partii paktu lanckorońskiego, co zgadza się ze źródłami.
- **A2 (polecam razem z A):** linia startowa PPS `regional_autonomy` zamiast `cultural_rights`, bo od X 1921 oficjalną linią PPS był projekt autonomii terytorialnej. Skutek mechaniczny jest niewielki: zmienia raport programu i to, którą linię karta stanowiska uznaje za obecną.
- **B:** profil zostaje (P), a ustalenia trafiają tylko do dokumentacji.

---

## Punkty, których badania nie objęły (zostają TBD)

- Zastąpienie posła wybranego na prezydenta (`next_on_list_v1`).
- Marszałek senior przy nierozstrzygniętym wyborze marszałka Sejmu.
- Historyczne cele KPP w strajkach po 1923 r. Badanie dotyczyło głównie 1923 r.; dla lat 1921–1926 jest tylko ogólna ocena Friszkego.
- Dalsze luki wymienione w notatkach, m.in. monografie Garlickiego („Przewrót majowy”) i Marszałka („Najwyższe władze wojskowe…”), których nie udało się przeczytać.

## Co zrobię po Twojej decyzji

1. Zatwierdzone ustalenia wpiszę do `HISTORICAL_SOURCES.md` (źródła z adresami i granicą pewności) oraz do referencji.
2. W grze zmienię tylko to, co zatwierdzisz. Potem build, testy, kontrole i nowy pomiar kampanii.
3. Następnie część 8d: strojenie liczb P do celu 1A, jeśli będzie potrzebne (zob. zastrzeżenie w punkcie 1).

---

## Decyzje i wdrożenie — 4 X 2026

**Decyzje użytkownika:** punkty 1–9 w wariancie A, w punkcie 9 także A2. Do punktu 1 doszło polecenie: presja zamachowa ma dochodzić do progu wiosną 1926 już teraz.

**Wdrożone w grze:**
- `source/rules/polish_politics.js`: sprawa wojskowa od VII 1923; publiczny epizod nacisku wojska dopiero w kryzysie od XI 1925 (nowe wejście `military_escalation`); uroczystość B5 od II 1923, z miejscem „pogrzeb na Powązkach 6 II 1923”; temat wystąpienia z 1922 r. „the right to appoint the cabinet”; presja startowa 0 w opisie profilu `START`.
- `source/rules/polish_rules.js`: presja zamachowa nowej gry startuje od 0 zamiast 10 (P, strojenie 8d).
- `source/rules/polish_unions.js`: cel KPP `structural`, z tekstem dla gracza.
- `source/rules/polish_government.js`: profil `actor_profiles_v2` z historycznym tematem `autonomy`.
- `source/rules/polish_party.js`: linia startowa PPS `regional_autonomy`.
- `source/rules/polish_security.js` i `source/rules/polish_institutions.js`: bez dopisku „TBD” w tekstach dla gracza; raport rozdziału podaje historyczne daty wejść scenariusza.
- `source/scenes/polish_event_niewiadomski_cult.scene.dry`: tekst o pogrzebie 6 II 1923 i lutowych nabożeństwach.
- `HISTORICAL_SOURCES.md`: osiem wpisów źródłowych i wiersze indeksu.

**Strojenie presji (P):**
- Presję prawie w całości tworzy +2 na miesiąc za otwartą sprawę wojskową. To wartość zatwierdzona w 17.16.11, więc jej nie zmieniałem.
- Zmieniłem tylko presję startową z 10 na 0. W I 1922 Piłsudski jest jeszcze Naczelnikiem Państwa, więc nacisku na zamach nie ma.
- Warianty startu 10, 5 i 0 porównałem przed zmianą. Przy 10 próg 65 przypadał na IX 1925 – I 1926, a próbę wyznaczało samo okno od III 1926. Przy 0 próg przypada na II–IV 1926.

**Wynik w grze** (`analysis/stage8-campaigns/`, etykieta `after-8f`; 13 strategii × 12 ziaren):

| Strategia | Próba | Termin |
|---|---|---|
| N-A, bierna | 12/12 | III 1926 |
| N-H, historyczne decyzje | 12/12 | IV 1926 |
| N-B i N-C | 0/12, porozumienie z Piłsudskim w 12/12 | — |
| pozostałe strategie z 21.2 | 12/12 | III albo IV 1926, zależnie od decyzji PPS |

- Cel 1A jest spełniony.
- Kontrole wykonalności: oba rodzaje raportu, AS osiągalna, żadnej zablokowanej kampanii.
- Testy: 431 z 431. Wszystkie kontrole `analysis/*/check.cjs` przechodzą.

**Sprawa otwarta po pomiarze:**
- Od kalibracji 2A PPS nie wchodzi do rządu w żadnej ze 156 kampanii; przed 2A wchodziła w 24.
- Układ gabinetów po 1923 r. się zatrzymuje: Witos → Grabski do końca albo Śliwiński od VI 1923 do końca.
- Grabski nie upada, bo jego odpowiedź na kryzys kredytowy przechodzi bez sprzeciwu Sejmu.
- Model sprawdził dwie poprawki:
  - głosowanie nad odpowiedzią kredytową, jak w 17.16.8, niczego nie zmienia, bo Sejm ją przyjmuje;
  - wymuszona dymisja Grabskiego w XI 1925 daje gabinet Skrzyńskiego, ale PPS do niego nie wchodzi.
- To decyzja projektowa do podjęcia przez użytkownika.

**Rozstrzygnięcie sprawy otwartej (decyzje A1–A4, 4 X 2026):**
- **A1:** Grabski podaje się do dymisji od XI 1925, jeśli nadal rządzi w kryzysie kredytowym albo walutowym. To datowane wejście scenariusza (`grabski_resignation_1925`); karta formowania podaje przyczynę.
- **A2:** wdrożona zatwierdzona reguła 8.9. W rządzie Skrzyńskiego NPR przyjmuje także Przemysł i Handel.
- **A3:** porozumienie z Piłsudskim wykonywane przez gabinet przedłuża się przy przeglądzie, dopóki rządzi ten sam gabinet.
- **A4:** poprawki automatów strategii:
  - tolerowanie tylko premiera w jego oknie;
  - rozmowy przygotowujące koalicję;
  - odpowiedź na wydarzenia po zakończeniu miesiąca;
  - AS tworzona, gdy tylko jest osiągalna.

**Wynik** (`analysis/stage8-campaigns/`, etykieta `after-chain`):
- We wszystkich strategiach rządy idą Ponikowski → Śliwiński → Nowak → Witos (1923) → Grabski (1924) → Skrzyński (XII 1925).
- PPS wchodzi do rządu Skrzyńskiego w 12/12 przy strategiach współrządzącej, „jak w historii”, koalicyjnej i zatrudnieniowej.
- Zamach: przy strategiach bez porozumienia z Piłsudskim III 1926; przy strategii tolerującej i współrządzącej brak zamachu.
- AS jest osiągalna w 12/12 kampanii strategii „masowe organizacje”.
- Testy: 434 z 434.
