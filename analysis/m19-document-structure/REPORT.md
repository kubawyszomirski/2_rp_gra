# M19 — jedna wersja do kodowania, referencja 0.31

26 IX 2026. **M19 zamknięte w dokumentacji.** Kalkulator sprawdza budowę
dokumentów po uporządkowaniu. Nie zmienia żadnej reguły i nie jest symulacją
kampanii.

Uruchomienie: `node analysis/m19-document-structure/check.cjs`. Pliki:
[kalkulator](check.cjs) i [wyniki z hashami dokumentów](results.json).

Porównanie z kopiami sprzed M19 wykonano raz:
`M19_BACKUP_DIR=<katalog z kopiami> node analysis/m19-document-structure/check.cjs`.
Kopie leżą poza repozytorium, więc późniejsze uruchomienia bez nich zachowują
w `results.json` zapisany wynik tego porównania.

## Zatwierdzone decyzje

Decyzje użytkownika:
- historia zostaje w tych samych plikach, w wyraźnie oddzielonym archiwum na
  końcu;
- katalog kart do kodowania to następny krok, nie część M19.

## Co gdzie teraz jest

| Dokument | Aktualna wersja do kodowania | Historia |
|---|---|---|
| Referencja techniczna | nagłówek 0.31, tabela „gdzie jest aktualna reguła”, rozdziały 1–22 | [rozdział 23](../../docs/POLISH_TECHNICAL_REFERENCE.md#23-archiwum-decyzji): dawny opis wersji (23.1), 17 akapitów rewizji 0.14–0.30 (23.2), 21 zapisów zatwierdzeń (23.3: dawne 22.5–22.24 i rewizja 0.13), decyzja M19 (23.4) |
| Przewodnik | akapit „Stan”, wstęp i rozdziały 1–19 | [dodatek „historia zmian przewodnika”](../../docs/POLISH_DESCRIPTIVE_GUIDE.md#dodatek-historia-zmian-przewodnika): 30 notek |
| PLAN, MECHANICS_MAP, STATE_VARIABLES, TRANSITION_MATRIX | sekcja „Current state” z tabelą obszarów i sekcji referencji | „Archive of entries”: wszystkie dotychczasowe wpisy |
| Audyt mechanik | M01–M19 zamknięte w dokumentacji | — |
| HISTORICAL_SOURCES | dziennik źródeł z wpisem M19 | układ bez zmian |

Zapisy 22.5–22.24 zachowały numery, więc odwołania „22.x” w rejestrach nadal
trafiają we właściwy tekst. Ich nagłówki są o jeden poziom niżej, ale adresy
(kotwice) się nie zmieniły.

## Poprawki przy porządkowaniu

Żadna reguła ani liczba się nie zmieniła. Poprawiono trzy nieaktualne miejsca:
- **10.9:** czystka jest teraz „odrębnym wariantem od rozłamu z karty E3
  (10.2)”. Wcześniej zdanie odwoływało się do „dobrowolnego rozłamu po
  ultimatum”. Takiej osobnej sceny już nie ma: rozłam to jedna karta E3.
- **17.16, status M02:** „M06 zamknięto w dokumentacji w 0.28 (7.3–7.5)”
  zamiast „M06 pozostaje oddzielną pozycją audytu”.
- **MECHANICS_MAP, wpis archiwalny 0.5:** odnośnik do sekcji 17.10 wskazywał
  nagłówek, którego już nie ma. Sekcja nazywa się dziś „Aktualny manifest 10
  kart parlamentarnych”. Poprawiono tylko adres odnośnika; treść wpisu jest
  bez zmian.

## Wyniki sprawdzenia

**Budowa dokumentów:**
- **Referencja:**
  - 23 rozdziały w kolejności; nad rozdziałem 1 są tylko nagłówek i tabela;
  - tabela wskazuje sekcje 1–23, a każda podsekcja w niej wymieniona istnieje;
  - rozdział 22 ma tylko 22.1–22.4; zapisy 22.5–22.24 i rewizja 0.13 leżą w
    23.3;
  - każdy akapit rewizji występuje w pliku raz.
- **Przewodnik:** nad rozdziałem 1 są akapit „Stan” i trzy akapity wstępu. W
  rozdziałach 1–19 nie ma datowanych notek; 30 notek jest w dodatku.
- **Rejestry:** na górze „Current state”, pod nim „Archive of entries”. Każda
  sekcja z tabeli obszarów istnieje w referencji.
- **Audyt:** tabela zamkniętych pozycji obejmuje M01–M19, a grupy otwartych
  problemów są puste.

**Odnośniki:**
- 353 odnośniki do plików w repozytorium: każdy plik istnieje;
- 131 odnośników z kotwicą, w tym 116 do dokumentów M19: każdy trafia w
  istniejący nagłówek.

**Porównanie z kopiami sprzed M19:**
- Żaden niepusty wiersz nie zginął. Zmieniły się tylko trzy opisane wyżej
  wiersze i osiem wierszy audytu zamykających M19.
- Dawny nagłówek, 17 akapitów rewizji, zapisy zatwierdzeń i 30 notek
  przewodnika przeniesiono dosłownie i w tej samej kolejności.
- Wszystkie dawne kotwice nagłówków nadal istnieją. Wyjątek to usunięta
  otwarta pozycja M19 w audycie.

## Następny krok

Katalog kart do kodowania, rodzina po rodzinie, każda z przeglądem
użytkownika. Każda karta dostanie jedną tabelę:
- dostęp;
- dokładne opcje;
- koszt czasu i zasobów;
- skutki;
- stan końcowy;
- odnowienie.

Katalog nie jest częścią M19 i czeka na decyzję użytkownika.

## Wpływ na scenariusz M02

Brak: nie zmieniła się żadna reguła ani liczba.

## Aktualizacja 0.32

Od 0.32 skrypt sprawdza tę samą budowę dokumentów w wersji 0.31 i każdej nowszej. Dopuszcza też więcej niż 30 notek w dodatku przewodnika. Wynik jednorazowego porównania z kopiami sprzed M19 pozostaje zapisany w `results.json`. Liczby odnośników podane wyżej opisują stan 0.31; aktualne są w `results.json`. W 0.32 było to 363 odnośniki do plików i 200 z kotwicą, wszystkie poprawne.

## Granice

- Sprawdzenie dotyczy budowy dokumentów i odnośników, nie treści reguł. Reguły
  sprawdzają kalkulatory M02–M18 i przyszły prototyp.
- Kotwice liczone są regułami GitHuba: małe litery, bez interpunkcji, spacje
  jako myślniki. Inny podgląd Markdown może tworzyć inne adresy.
- Kod gry, zależności i metadane scenariusza bez zmian.
