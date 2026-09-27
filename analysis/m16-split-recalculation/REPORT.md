# M16 — przeliczenie przy rozłamie E3, referencja 0.27

26 IX 2026. **M16 zamknięte w dokumentacji.** Kalkulator sprawdza reguły z
[10.2](../../docs/POLISH_TECHNICAL_REFERENCE.md#102-od-sprzeciwu-do-rozłamu--e3)
i [10.9](../../docs/POLISH_TECHNICAL_REFERENCE.md#109-usunięcie-członków-frakcji)
referencji technicznej. Używa testów jednostkowych na profilu otwarcia partii:
- frakcje 50/15/35, 35 posłów;
- wiersze wyborców pięciu klas z `source/scenes/root.scene.dry`.

Nie jest to symulacja kampanii.

Uruchomienie: `node analysis/m16-split-recalculation/check.cjs`. Pliki:
[kalkulator](check.cjs) i [wyniki z hashami dokumentów](results.json).

## Zatwierdzone reguły

Decyzje użytkownika: wyborcy odchodzą w tej samej proporcji co członkowie;
sprzeciw pozostałej części −20; posłowie przypisani do frakcji na stałe, aż do
rzeczywistego odejścia.

- **Jeden rachunek rozłamu, jak przy czystce, tylko 40% zamiast 25%.**
  Odchodzi 40% zaplecza tej frakcji, czyli
  `removedShare = 0,40 × siła frakcji / 100` całej PPS.
  - **Siła:** siła frakcji ×0,6, następnie wszystkie frakcje przeliczamy do
    sumy 100.
  - **Członkowie:** członkostwo PPS ×(1 − `removedShare`).
  - **Wyborcy:** w każdej komórce poparcie PPS ×(1 − `removedShare`). Ubytek
    przechodzi do partii wskazanej w manifeście albo do „innych”; każda
    komórka nadal sumuje się do 100.
  - **Posłowie:** 40% posłów frakcji, zaokrąglone raz, przechodzi do klubu
    rozłamowego.
  - **Organizacje:** odchodzą tylko struktury wskazane w manifeście.
  - **Sprzeciw pozostałej części** spada o 20, najniżej do 0. Spójność liczymy
    po odejściu.
- **Posłowie przypisani do frakcji na stałe.**
  - Po wyborach klub PPS dzielimy między frakcje metodą największych reszt,
    według ich siły w dniu wyborów.
  - Później przypisanie zmienia się tylko przy rzeczywistym odejściu: rozłamie,
    czystce albo przejściu posła.
  - Zmiana siły frakcji po akcjach doradców nie przepisuje już wybranych
    posłów.

## Przykłady

| | Rozłam Lewicy | Rozłam Piłsudczyków | Czystka Lewicy (dla porównania) |
|---|---|---|---|
| Siła frakcji / posłowie przed | 15 / 5 | 35 / 12 | 15 / 5 |
| Odchodzi zaplecza PPS | 6% | 14% | 3,75% |
| Poparcie PPS (start 14,7%) | 13,8% | 12,6% | 14,1% |
| Posłowie odchodzący | 2 (klub 35 → 33) | 5 (35 → 30) | 1 |
| Sprzeciw pozostałej części | 65 → 45 | 62 → 42 | 65 → 50 |

Po rozłamie Lewicy frakcje mają siłę Centrum 53,2 / Lewica 9,6 /
Piłsudczycy 37,2, a spójność PPS rośnie z 88,5 do 93,8.

## Dlaczego posłowie muszą być przypisani na stałe

Przykład: Lewica rośnie w siłę dzięki akcjom doradców (+12 surowej siły, do
24,1).
- **Z przeliczaniem posłów** miałaby nagle 8 posłów, a ten sam rozłam
  zabrałby 3.
- **Przy stałym przypisaniu** ma nadal 5 posłów, a rozłam zabiera 2.

Wynik nie zależy więc od kolejności akcji. Kalkulator sprawdza to wprost:
akcja zmieniająca siłę frakcji przed rozłamem albo po nim daje ten sam
transfer.

## Sprawdzone niezmienniki

- 35 posłów przy sile 50/15/35 dzieli się na 18/5/12.
- Rozłam i czystka używają jednego rachunku; różnią się tylko udziałem (40% /
  25%), spadkiem sprzeciwu (−20 / −15) i tym, że czystka nie tworzy klubu
  rozłamowego.
- Poparcie PPS spada dokładnie o udział odchodzących, a komórki sumują się do
  100.
- Jeden manifest: późniejsza czystka tej samej frakcji działa na stanie po
  rozłamie, nigdy nie usuwa tych samych ludzi drugi raz.

## Wpływ na scenariusz M02

Brak. Archiwalne przebiegi M02 same sprawdzają, że sprzeciw żadnej frakcji nie
osiąga 60, więc rozłam E3 w nich nie występuje. Te same zasady obowiązują przy
automatycznym rozłamie po zamachu (M08, F10+F11).

## Granice

- Udziały 40% i 25% oraz spadki −20 i −15 są P do kalibracji w prototypie.
- Odbiorca odchodzących wyborców jest częścią manifestu konkretnej sprawy.
  Historyczne rozłamy PPS i ich elektoraty: **TBD — historical research
  required**.
- Kod gry, zależności i metadane scenariusza bez zmian.
