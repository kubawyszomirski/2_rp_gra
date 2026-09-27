# M06 — wybór prezydenta i marszałka bez impasu, referencja 0.28

26 IX 2026. **M06 zamknięte w dokumentacji.** Kalkulator sprawdza reguły z
[7.3](../../docs/POLISH_TECHNICAL_REFERENCE.md#73-wybory-prezydenckie-i-sukcesja),
[7.5](../../docs/POLISH_TECHNICAL_REFERENCE.md#75-marszałek-śmiarowski-rataj-albo-daszyński),
7.1 i 4.5 referencji technicznej testami jednostkowymi. Nie jest to symulacja
kampanii.

Uruchomienie: `node analysis/m06-office-elections/check.cjs`. Pliki:
[kalkulator](check.cjs) i [wyniki z hashami dokumentów](results.json).

## Zatwierdzone reguły

Decyzje użytkownika: w finale wygrywa ten, kto ma więcej głosów; dodajemy
bezpiecznik.

1. **Finał zawsze kończy się wynikiem.** W ostatnim głosowaniu dwóch
   kandydatów wygrywa ten, kto dostał więcej głosów.
   - Wstrzymania i głosy nieważne liczą się do obecności, ale nie do
     większości.
   - Dokładny remis nadal rozstrzyga zapisane losowanie 50/50 z 0.18.
   - Reguła dotyczy prezydenta (Zgromadzenie Narodowe) i marszałka (dogrywka
     dwóch pierwszych).
   - To uproszczenie gry; szczegółowy regulamin z 1922 r.:
     **TBD — historical research required**.
2. **Kworum i kandydaci są zapewnieni.**
   - Na obowiązkowe wybory urzędów przychodzą wszystkie kluby, bo w rozdziale 1
     nie ma opcji bojkotu.
   - Profil każdego wyboru musi mieć co najmniej dwie ważne kandydatury. Ich
     brak to błąd danych, wykrywany przed głosowaniem.
3. **Bezpiecznik.** Gdyby wybór mimo to się nie rozstrzygnął:
   - sekwencja kończy się ze statusem `no_election`;
   - urząd sprawuje osoba pełniąca obowiązki wskazana w profilu;
   - gracz odzyskuje zwykłą turę;
   - nowe głosowanie odbywa się samo w następnym miesiącu.

## Przykłady

| Sytuacja | Dotychczas | Teraz |
|---|---|---|
| Finał: A 200, B 180, 60 wstrzymań, 4 nieważne (444 posłów) | impas: A nie ma ponad połowy z 440 | wygrywa A |
| Finał: 210 do 210 | losowanie 50/50 | bez zmian |
| Profil z jedną ważną kandydaturą | impas w grze | błąd danych przed głosowaniem |
| Nieprzewidziany brak rozstrzygnięcia | zablokowana sekwencja | koniec sekwencji, zwykła tura, nowe głosowanie za miesiąc |

Sprawdzono też siatkę 175 finałów, łącznie z remisami: każdy kończy się
wyborem.

## Wpływ na scenariusz M02

Brak. Archiwalny silnik M02 traktuje wybory urzędów w 1922 r. jako część
wspólnego, ustalonego otwarcia i nie ma algorytmu głosowania na urzędy.
Kalkulator sprawdza to w jego kodzie.

## Granice

- Reguła finału i bezpiecznik są uproszczeniami gry, nie odtworzeniem
  regulaminu Zgromadzenia Narodowego ani Sejmu.
- Osobę pełniącą obowiązki przy nierozstrzygniętym wyborze marszałka wskazuje
  profil. Historyczna procedura: **TBD — historical research required**.
- Kod gry, zależności i metadane scenariusza bez zmian.
