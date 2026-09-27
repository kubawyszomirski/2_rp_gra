# M15 — przewaga AS, referencja 0.26

26 IX 2026. **M15 zamknięte w dokumentacji.** Kalkulator sprawdza reguły z
[13.3](../../docs/POLISH_TECHNICAL_REFERENCE.md#133-rekrutacja-militaryzacja-i-przejście-do-as),
[13.4](../../docs/POLISH_TECHNICAL_REFERENCE.md#134-użycie-i-straty) i 16.8
referencji technicznej. Robi to na dwa sposoby:
- testy jednostkowe;
- dokładne przeliczenie 81 układów stron zamachu z
  [kalkulatora M08](../m08-coup-profile/check.cjs) przy demokracji 60.

Nie jest to symulacja kampanii.

Uruchomienie: `node analysis/m15-as-benefit/check.cjs`. Pliki:
[kalkulator](check.cjs) i [wyniki z hashami dokumentów](results.json).

## Zatwierdzone reguły

Decyzje użytkownika: wariant (a) — lepsze wykonanie wezwania i do trzech akcji
naraz przed zamachem; premia posłuchu +0,15.

- **Milicja ma jedną akcję naraz.**
  - Przed zamachem chroni jedną sprawę naraz. Druga, równoczesna potrzeba
    zostaje bez ochrony.
  - W zamachu albo walczy (przy poparciu lub obronie), albo chroni własnych
    ludzi (przy neutralności).
- **AS: lepsza koordynacja.**
  - Posłuch członków +0,15, najwyżej do 1. Więcej ludzi wykonuje wezwanie, w
    zamachu i w wydarzeniach. AS nie dodaje ludzi ani sprawności.
  - Przed zamachem AS obsługuje do trzech równoczesnych spraw. Silnik
    przydziela ludzi w kolejności spraw w wydarzeniu: każda dostaje siłę do
    pełnego efektu ochrony (40%, czyli 4 F), a reszta przechodzi do następnej.
  - W zamachu AS ma, jak Milicja, jedno zadanie; jej przewagą jest wyższy
    posłuch.

## Ile daje premia posłuchu

| Nastawienie organizacji do linii | Posłuch Milicji | Posłuch AS | Siła AS przy tych samych ludziach |
|---|---:|---:|---:|
| 50 | 0,835 | 0,985 | ×1,18 |
| 20 | 0,715 | 0,865 | ×1,21 |
| 100 | 1 | 1 | ×1 — więcej nie da się wykonać |

Premia działa najmocniej wtedy, gdy organizacja nie jest przekonana do linii,
np. przy nagłej zmianie stanowiska w kryzysie.

## Wiele akcji naraz przed zamachem

| Organizacja, siła | Dwie równoczesne sprawy | Ochrona pierwszej / drugiej |
|---|---|---|
| Milicja, 8 F | tylko pierwsza | 40% / 0% |
| AS, 8 F | obie | 40% / 40% |
| AS, 3 F | tylko pierwsza, bo na drugą nie zostaje siły | 30% / 0% |

Mała AS działa więc jak Milicja. Przewaga wielu akcji pojawia się dopiero
wtedy, gdy jedna sprawa nie wykorzystuje całej organizacji.

## Zamach (kalkulator M08, demokracja 60)

| PPS | Milicja | AS z tymi samymi ludźmi |
|---|---|---|
| Obrona rządu | 4 F: Piłsudski 43,7%, PPS istotna (F9) w 6,2% prób | 4,7 F: Piłsudski 39,7%, F9 w 30,4% |
| Obrona rządu | 6 F: Piłsudski 39,7%, kompromis 24,3% | 7,1 F: Piłsudski 33,6%, kompromis 30,4% |
| Poparcie Piłsudskiego | 6 F: Piłsudski 64,8% | 7,1 F: 64,8%, praktycznie bez zmian |

Najważniejszy skutek: przy obronie rządu AS częściej czyni PPS istotną siłą w
walkach. Wtedy, zgodnie z zasadą M08, PPS ma głos w kompromisie (F9).

## Wpływ na scenariusz M02

Brak. Archiwalny silnik M02 nalicza tylko miesięczne utrzymanie Milicji; nie ma
w nim siły Milicji ani AS. Kalkulator sprawdza to w kodzie silnika.

## Granice

- Premia +0,15, limit trzech spraw i kolejność przydziału są P do kalibracji
  w prototypie.
- Siła Milicji w zamachu jest syntetycznym wejściem (4 F, 6 F), nie
  przeliczeniem z historycznej liczby członków.
- Historyczna rola i siła Akcji Socjalistycznej: **TBD — historical research
  required**.
- Kod gry, zależności i metadane scenariusza bez zmian.
