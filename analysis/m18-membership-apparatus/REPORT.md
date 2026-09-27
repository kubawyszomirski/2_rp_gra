# M18 — członkostwo i aparat, referencja 0.30

26 IX 2026. **M18 zamknięte w dokumentacji.** Kalkulator sprawdza reguły z
[13.1](../../docs/POLISH_TECHNICAL_REFERENCE.md#131-finanse-partyjne-i-utrzymanie)
referencji technicznej. Robi to na trzy sposoby:
- testy jednostkowe;
- porównanie otwarć w 52-miesięcznym rachunku kasy;
- powtórka 144 archiwalnych przebiegów M02 na silniku
  [m02-robustness](../m02-robustness/engine.cjs), do którego nowe reguły
  wstawiamy tylko w pamięci.

Nie jest to symulacja kampanii.

Uruchomienie: `node analysis/m18-membership-apparatus/check.cjs`. Pliki:
[kalkulator](check.cjs) i [wyniki z hashami dokumentów](results.json).

## Zatwierdzone reguły

Decyzje użytkownika: indeks członkostwa oznacza rzeczywistą skalę partii i
może rosnąć; wpływy z poziomu aparatu wynoszą 0,15 zamiast 0,20 R.

- **Członkostwo rośnie z zapleczem.**
  - Co miesiąc indeks zbliża się o 5% różnicy do celu:
    `100 × średnia(poparcie PPS wśród robotników / na starcie, średni zasięg
    związków / na starcie) × (1 − 0,05 × (składki − 2))`, w granicach 50–150.
  - Zakres indeksu w rozdziale 1 to 0–150.
  - Rośnie przez istniejące działania, bez nowej karty rekrutacji.
  - Rozłam i czystka nadal od razu mnożą indeks przez (1 − udział
    odchodzących).
- **Aparat.** Wpływy miesięczne:
  `(0,25 × składki + 0,15 × (poziom − 1)) × członkostwo / 100`. Każdy poziom
  daje netto +0,05 R/mies. przy pełnym członkostwie (dawniej +0,10). Zwrot po
  40 miesiącach (dawniej 20).

## Porównanie otwarć

Kasa PPS po 52 miesiącach względem braku inwestycji; składki 2, członkostwo
startowe 100.

| Otwarcie | Dotychczas | Po zmianie |
|---|---:|---:|
| 1 poziom aparatu | +3,20 R | +0,60 R |
| 3 poziomy aparatu | +9,30 R | +1,65 R |
| 3 rozbudowy jednej branży związkowej | −3,00 R | +3,26 R, członkostwo 134,8 |

Budowanie organizacji przestaje być czystym kosztem, a aparat przestaje być
oczywistym pierwszym ruchem. W tym rachunku poparcie wśród robotników się nie
zmienia. Kampanie, które je podnoszą, dodatkowo zwiększają cel członkostwa.

**Składki.** W dłuższym okresie składki 3 zamiast 2 dają 0,71 zamiast
0,50 R/mies. wpływów, przy celu członkostwa 95 zamiast 100. Podwyżka nadal
wymienia członków na pieniądze, tylko trwale, a nie jednorazowo.

## Scenariusz M02: 144 główne przebiegi

| Wariant | Wyniki i terminy | Gabinety | Najniższa kasa | Kasa na końcu względem archiwum |
|---|---|---|---:|---:|
| Tylko aparat 0,15 | bez zmian | bez zmian | 0,25 R | od −3,65 do 0 R |
| Zatwierdzony: aparat 0,15 i wzrost członkostwa | bez zmian | bez zmian | 0,25 R | od 0 do +12,46 R |

- Wszystkie aktywne strategie M02 zaczynają od poziomu aparatu i rozbudowują
  związki. Po zmianie kończą rozdział z większą kasą dzięki członkostwu.
  Strategia bierna nie zmienia się.
- Plany M02 są ustalone z góry i nie wydają dodatkowych pieniędzy, dlatego
  wynik się nie zmienia.
- Silnik M02 nie liczy poparcia wyborczego, więc cel członkostwa policzono tam
  tylko z zasięgu związków.

## Sprawdzone niezmienniki

- Na starcie cel wynosi 100, więc bez zmian w zapleczu członkostwo stoi w
  miejscu.
- Cel mieści się w 50–150. Indeks zbliża się do niego o 5% różnicy w obie
  strony.
- Wyższe składki obniżają cel. Aparat zarabia więcej w większej partii.
- Silnik M02 bez nowych reguł odtwarza archiwum dokładnie.

## Granice

- Szybkość (5%), granice (50–150), czynnik składek i wpływy z aparatu są P do
  kalibracji w prototypie. Wzrost kasy aktywnych strategii w M02 (do +12 R)
  trzeba sprawdzić w pełnej kampanii, gdy gracz może te pieniądze wydać.
- Indeks jest względną skalą członkostwa, nie historyczną liczbą członków PPS.
  Historyczne dane o członkostwie: **TBD — historical research required**.
- Kod gry, zależności i metadane scenariusza bez zmian.
