# Polska wersja gry: pliki tłumaczeń

Angielskie sceny w `source/scenes/` i `source/qdisplays/` to jedyna kopia logiki gry. Każdy plik JSON w tym katalogu tłumaczy jeden plik sceny, linia po linii (decyzja 1A z 4 października 2026). `npm run build` uruchamia `tools/i18n/build.cjs`. Skrypt składa z tych plików polską kopię scen w `out/i18n/pl/`, kompiluje ją i zapisuje `out/html/game_pl.json`.

## Format pliku

```json
{
 "source": "scenes/status.scene.dry",
 "status": "complete",
 "lines": {
  "= Government": "= Rząd",
  "[? if not polish_party_rules : Resources available: [+ resources +] ?]": "[? if not polish_party_rules : Dostępne środki: [+ resources +] ?]"
 }
}
```

- **Klucz** to angielska linia bez wcięcia, dokładnie taka jak w pliku sceny. **Wartość** to cała linia po polsku. Wcięcie zostaje z oryginału.
- **Ta sama angielska linia w kilku miejscach pliku** dostaje jedno tłumaczenie. Jeśli jedno z tych miejsc musi zostać po angielsku, angielska linia musi się czymś różnić (przykład: `Q.pps_government_position_en` w `polish_opening_state`).
- **Zostaje bez zmian wszystko poza tekstem:** znaczniki Dendry (`[+ … +]`, `[? if … : … ?]`, `**…**`), identyfikatory wyborów (`- @id:`), warunki i logika skryptów.
- **W liniach skryptów** tłumaczymy napisy w cudzysłowach. Wolno też dodać funkcje wyświetlania: `PolishRules.storedText`, `dateText`, `monthYear`, `num`, `plural` i `PolishSecurity.forceName`. Nie wolno zmieniać tego, co skrypt zapisuje w stanie gry. Test „Wersja polska: te same sceny, jakości i logika co angielska” sprawdza, że poza tekstami i skryptami obie wersje są identyczne.
- **Wartość `null`:** linia, której polska gra nigdy nie pokazuje (np. dane odziedziczonego modelu niemieckiego). Używamy jej tylko wtedy, gdy na pewno nie widać jej na żadnym ekranie, także przed rozpoczęciem gry.
- **`keep_original: true`:** linie bez wpisu celowo zostają w oryginale i nie liczą się jako braki (tylko listy źródeł w `credits.scene.dry`, decyzja 7A). Build podaje ich liczbę jako „kept in the original”.
- **`status`:** `complete` albo `partial`. Test `tests/i18n.test.js` sprawdza:
  - plik `complete` musi mieć wpis dla każdej linii z tekstem;
  - żaden plik nie może mieć wpisów, których angielska linia już nie istnieje. Zmiana angielskiego tekstu wymaga więc poprawienia tłumaczenia.
- **Linia bez wpisu** zostaje w polskiej wersji po angielsku.

Lista linii do przetłumaczenia (bez budowania gry):

```
node tools/i18n/build.cjs --report scenes/status.scene.dry
```

## Teksty modułów reguł

Teksty tworzone w `source/rules/*.js` mają polski odpowiednik obok angielskiego: `L('English text', 'Polski tekst')` (decyzja 2A).

**Pomocnicze funkcje** w `PolishRules`:
- `plural(n, 'miesiąc', 'miesiące', 'miesięcy')` — odmiana po liczbie;
- `num(x, digits)` — przecinek dziesiętny;
- `monthYear(t, 'nom' | 'gen' | 'loc')`:
  - `'nom'` — marzec 1926;
  - `'gen'` — (od) marca 1926;
  - `'loc'` — (w) marcu 1926;
- `dateText('1928-02-19')` — 19 lutego 1928;
- `monthText('1926-03')` — marzec 1926;
- `inLanguage('en', fn)` — wykonuje `fn` z tekstami angielskimi (gdy tekst ekranu ma trafić do stanu gry).

**Teksty zapisywane w stanie gry** (`Q.S`) zostają po angielsku i tłumaczy je dopiero wyświetlanie (decyzja 5A):
- moduł, który zapisuje tekst, rejestruje jego polską formę: `PolishRules.registerStoredText(text => …)`;
- ekran pokazuje go przez `PolishRules.storedText(text)`: w wersji polskiej dostaje przekład, w angielskiej ten sam tekst;
- tekstu do `S` nie wolno składać z `L(…)` ani z polskich funkcji: liczby wtedy w formacie angielskim (`fmtEn` w `polish_security.js`), nazwy zakładów przez `plantName(plant, true)`.

Test „Ta sama rozgrywka w obu językach” gra każdą z 13 strategii do końca rozdziału w obu językach. Sprawdza, że stan gry jest identyczny, a polskie ekrany nie mają angielskich linii.

**Świadomie po angielsku zostają:**
- nazwa gry w `info.dry`, bo jest kluczem zapisów i ustawień w przeglądarce (polski tytuł strony podaje `out/html/game.js`);
- listy źródeł w Credits (`keep_original`);
- nieosiągalne sceny niemieckie (bez plików tłumaczeń);
- teksty techniczne: walidacja zapisu, błędy dla programisty, etykiety wewnętrzne.

## Słownik

| Angielski | Polski |
|---|---|
| Sejm, MPs, seats | Sejm, posłowie, mandaty |
| Marshal of the Sejm | marszałek Sejmu |
| National Assembly | Zgromadzenie Narodowe |
| President (of the Republic) | prezydent (Rzeczypospolitej) |
| Head of state | głowa państwa |
| Prime minister | premier |
| cabinet, government | gabinet, rząd |
| caretaker cabinet | gabinet tymczasowy |
| cabinet of experts | gabinet fachowców |
| portfolio | resort |
| Labour, Interior, Treasury, Industry and Trade, Justice, Agriculture, Military Affairs, Education, Foreign Affairs | Praca, Sprawy Wewnętrzne, Skarb, Przemysł i Handel, Sprawiedliwość, Rolnictwo, Sprawy Wojskowe, Oświata, Sprawy Zagraniczne |
| toleration, external support, opposition | tolerowanie, poparcie z zewnątrz, opozycja |
| agreement | porozumienie |
| promise | obietnica |
| motion to dismiss the cabinet | wniosek o odwołanie gabinetu |
| coup, attempt | zamach, próba zamachu |
| pressure towards a coup | presja na zamach |
| army groups | zgrupowania wojska |
| police; command; lawful compliance | policja; dowodzenie; praworządność |
| democracy (attachment to democracy) | demokracja (przywiązanie do demokracji) |
| authority of the Sejm | autorytet Sejmu |
| grievance | niezadowolenie |
| radicalisation | radykalizacja |
| violence | przemoc |
| factions; strength; dissent; cohesion | frakcje; siła; sprzeciw; spójność |
| party money, dues, membership, apparatus | kasa partii, składki, członkostwo, aparat |
| press, reach, credibility | prasa, zasięg, wiarygodność |
| cooperatives | spółdzielnie |
| trade unions, branch, fund | związki zawodowe, branża, fundusz |
| Industry, Railways, Agricultural labour | Przemysł, Kolej, Robotnicy rolni |
| strike, demands, settlement | strajk, postulaty, ugoda |
| demand of a faction | żądanie (frakcji) |
| monthly settlement | miesięczne rozliczenie |
| protection for the unemployed, benefit | osłona dla bezrobotnych, zasiłek |
| cells of the electorate | grupy wyborców |
| pp (percentage points) | pkt proc. |
| reputation, credibility | wiarygodność |
| compliance with a call, alignment with a line | posłuch, zgodność z linią |
| conservation, restoration | konserwacja, restauracja |
| Interior, Treasury, Labour (as holders of a card) | resort Spraw Wewnętrznych, Skarbu, Pracy |
| budget, inflation, real wages, output, credit, unemployment | budżet, inflacja, płace realne, produkcja, kredyt, bezrobocie |
| agrarian pressure, business pressure | presja agrarna, presja przedsiębiorców |
| Polish mark, złoty | marka polska, złoty |
| workers, peasants, intelligentsia, petty bourgeoisie, bourgeoisie and landowners | robotnicy, chłopi, inteligencja, drobnomieszczaństwo, burżuazja i ziemiaństwo |
| Library, deck, hand, card, agenda, advisers | Biblioteka, talia, ręka, karta, agenda, doradcy |
| Party Affairs, Government Affairs, Parliament | Sprawy partii, Sprawy rządu, Parlament |
| main action of the month | główna akcja miesiąca |
| cooldown | odnowienie |
| chapter report | raport z rozdziału |
| gameplay approximation, simplification | przybliżenie gry, uproszczenie |
| working balance (of the game) | roboczy bilans gry |

**Oznaczenia:** T, R, B i F zostają bez zmian, jak w polskiej dokumentacji.

**Nazwy partii:** zostają w formie używanej w grze: KPP, PPS, NPR, PSL Wyzwolenie, PSL Piast, PSChD, ZLN, Blok Mniejszości Narodowych, Inne.

**Zwracanie się do gracza i partia:**
- do gracza mówimy w drugiej osobie („Prowadzisz PPS…”);
- PPS mówi o sobie „my” („Tolerujemy rząd…”);
- po dwukropku piszemy małą literą, chyba że zaczyna się nazwa własna albo osobne zdanie.

**Tłumaczenie bez nowych faktów:** przekład nie dodaje faktów historycznych ani nie zmienia sensu zdań (AGENTS.md).
