# M11 — groźba a perswazja, referencja 0.23

25 IX 2026. **M11 zamknięte w dokumentacji.** Kalkulator sprawdza reguły z
[9.8 referencji technicznej](../../docs/POLISH_TECHNICAL_REFERENCE.md#98-stosunek-do-rządu--jedno-proste-menu).
Robi to na trzy sposoby:
- testy jednostkowe oceny 8.3 dla targowania i perswazji;
- archiwalne przypadki przeglądu osłon z
  [analizy negocjacji M02](../m02-negotiations/REPORT.md);
- powtórka 144 archiwalnych przebiegów M02 na silniku
  [m02-robustness](../m02-robustness/engine.cjs). Nowe reguły wstawiamy do
  niego tylko w pamięci: osobno oraz razem z regułami M10.

Nie jest to symulacja kampanii.

Uruchomienie: `node analysis/m11-threat-persuasion/check.cjs`. Pliki:
[kalkulator](check.cjs) i [wyniki z hashami dokumentów](results.json).

## Zatwierdzone reguły

Decyzje użytkownika: po odmowie PPS ma wybór; wymuszone ustępstwo kosztuje
relację.

- **Groźba musi być prawdziwa.** Gdy rząd odmówi przy targowaniu, PPS od razu,
  bez kosztu akcji, wybiera jedno z dwóch:
  - **spełnić groźbę** — wycofać poparcie, ze zwykłymi skutkami;
  - **cofnąć się** — wiarygodność PPS −5, jak za zawinione naruszenie umowy.
    Do końca tego gabinetu kolejne targowanie liczy się bez składnika
    potrzeby, czyli jak perswazja.
- **Wymuszone ustępstwo kosztuje relację.** Każda partia, która przyjęła ofertę
  pod groźbą, obniża relację z PPS o 3.
- **Perswazja** nie zmienia relacji ani wiarygodności, przy sukcesie i przy
  odmowie.

Ocena oferty (8.3) się nie zmienia. Targowanie nadal dodaje 0,1 × potrzeba
rządu, czyli do +10 punktów, a perswazja nie. Gdy premier ma większość bez PPS,
potrzeba wynosi 0 i targowanie tylko kosztuje.

## Przykłady

| Sytuacja | Targowanie | Perswazja |
|---|---|---|
| Baza 55, rząd bardzo potrzebuje PPS | 65: sukces; relacja −3 z partiami, które ustąpiły | 55: odmowa, bez kosztu |
| Baza 48, rząd bardzo potrzebuje PPS | 58: odmowa; odejście albo wiarygodność −5 i utrata siły groźby | 48: odmowa, bez kosztu |
| Baza 62, rząd nie potrzebuje PPS | 62: sukces, ale relacja −3 | 62: sukces bez kosztu |

Wiarygodność −5 obniża każdą późniejszą ocenę oferty o 0,5 punktu u wszystkich
partnerów.

## Przegląd osłon za rządu Skrzyńskiego (archiwalne przypadki M02)

| Przypadek | Wynik | Relacje Piast / NPR / PSChD / ZLN po przeglądzie |
|---|---|---|
| C, targowanie, bez kontaktu z ZLN | odmowa | bez zmian (53 / 54 / 46 / 25) |
| C, targowanie, jeden kontakt z ZLN | przyjęte | 50 / 51 / 43 / 26 (dotąd 53 / 54 / 46 / 29) |
| C, perswazja, bez kontaktu | odmowa | bez zmian |
| C, perswazja, trzy kontakty z ZLN | przyjęte | bez zmian (53 / 54 / 46 / 37) |
| H, targowanie (ZLN 5) | odmowa | bez zmian |

Targowanie oszczędza więc dwa kontakty z ZLN, ale kosztuje po 3 punkty
relacji z czterema partiami.

## Scenariusz M02: 144 główne przebiegi

- Przegląd osłon odbywa się w 48 przebiegach: 36 kończy się kompromisem, 12
  odmową.
- Po odmowie PPS w tych przebiegach i tak odchodzi z gabinetu. Teraz robi to od
  razu, bez kolejnej akcji, więc odejście przypada o miesiąc wcześniej we
  wszystkich 12 przypadkach. Przykład: Sejm bazowy, decyzje zbliżone do
  historycznych — I zamiast II 1926.
- Wyniki przebiegów, kolejność gabinetów i terminy prób zamachu się nie
  zmieniają: 96 prób, wszystkie w tych samych miesiącach. Tak samo jest przy
  łącznym stosowaniu reguł M10 i M11 w porównaniu z samymi regułami M10.
- Niższe relacje po 36 kompromisach nie zmieniają późniejszych gabinetów w
  tych przebiegach.

## Sprawdzone niezmienniki

- Przykład z audytu: targowanie 65 (sukces, relacja −3), perswazja 55 (odmowa
  bez kosztu).
- Odmowa targowania kończy się albo odejściem, albo wiarygodnością −5 i
  zniżką groźby wobec tego gabinetu. Kolejna groźba liczy się wtedy jak
  perswazja.
- Gdy rząd nie potrzebuje PPS, obie opcje mają tę samą ocenę, a tylko
  targowanie kosztuje relację.
- Perswazja nigdy nie zmienia relacji ani wiarygodności.
- Silnik M02 bez nowych reguł odtwarza archiwum dokładnie.

## Granice

- Wartości −5 i −3 są P do kalibracji w prototypie.
- Przebiegi M02 nie zawierają cofnięcia groźby: tam, gdzie rząd odmawia, plan
  PPS przewiduje odejście.
- Historyczne zachowanie PPS i partnerów przy konkretnych sporach nie jest tu
  odtwarzane.
- Kod gry, zależności i metadane scenariusza bez zmian.
