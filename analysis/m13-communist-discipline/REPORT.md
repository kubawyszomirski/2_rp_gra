# M13 — dyscyplina komunistów we wspólnym strajku, referencja 0.25

25 IX 2026. **M13 zamknięte w dokumentacji.** Kalkulator sprawdza reguły z
[9.5](../../docs/POLISH_TECHNICAL_REFERENCE.md#95-komuniści-powtarzane-przygotowanie-zamiast-licznika-koalicji)
i [9.6](../../docs/POLISH_TECHNICAL_REFERENCE.md#96-karta-wydarzenia-współpraca-z-komunistami-podczas-strajku)
referencji technicznej testami jednostkowymi. Nie jest to symulacja kampanii.

Uruchomienie: `node analysis/m13-communist-discipline/check.cjs`. Pliki:
[kalkulator](check.cjs) i [wyniki z hashami dokumentów](results.json).

## Zatwierdzone reguły

Decyzje użytkownika: dyscyplina KPP zależy od relacji i zgodności celu; PPS
uzgadnia linię opcją „Kompromis” w karcie „Jedność i kierownictwo”.

- **Dyscyplina KPP:** szansa dotrzymania uzgodnionych zasad =
  (relacja z KPP + zgodność celu) / 200, w granicach 10–90%. Rzut zapisuje się
  raz.
  - Profil wydarzenia zapisuje cel partnera w tym strajku: żądania ograniczone,
    szerokie albo strukturalne.
  - Wspólne żądania na poziomie celu lub wyżej dają zgodność 100, o jeden
    poziom niżej 50, o dwa 0.
  - Profil testowy przyjmuje cel szeroki. Historyczne cele KPP:
    **TBD — historical research required**.
- **Poparcie współpracy w PPS działa tylko na PPS:**
  - Podnosi je opcja „Kompromis” w karcie „Jedność i kierownictwo”: +15 w
    każdej frakcji (1 akcja, odnowienie 6 miesięcy). Złamanie uzgodnionych
    zasad odejmuje 15.
  - Od 60 linia jest uzgodniona: znika kara sprzeciwu Centrum (+5 przy pełnej
    współpracy, +2 przy lekkiej).
  - Próg 60 nadal otwiera trwały front, razem z relacją ≥65 i przyjętymi
    zasadami.
  - Posłuch własnych związków i Milicji liczy się jak dotąd, z ich
    nastawienia do linii (10.3).

## Przykłady

| Sytuacja | Dotychczas | Teraz |
|---|---|---|
| Relacja 30, poparcie w PPS 50 | 40% | zależy od żądań |
| Relacja 30, Centrum przekonane (poparcie 65) | 47,5% — komuniści „bardziej zdyscyplinowani” | bez zmian |
| Relacja 30, cel szeroki, wspólne żądania szerokie | — | 65% |
| Relacja 30, cel szeroki, wspólne żądania ograniczone | — | 40% |
| Relacja 30, cel szeroki, wspólne żądania strukturalne | — | 65% |
| Relacja 50, cel strukturalny, wspólne żądania ograniczone | — | 25% |

Poparcie w PPS startuje od 50 w każdej frakcji. Jeden kompromis daje 65,
niezależnie od siły frakcji, a złamanie zasad przywraca 50.

## Wpływ na scenariusz M02

Brak. Archiwalny silnik M02 nie modeluje współpracy z komunistami, co
kalkulator sprawdza bezpośrednio w jego kodzie. Zatwierdzony scenariusz się
nie zmienia.

## Granice

- Wartości progów i wag są P do kalibracji w prototypie.
- Profil celu KPP w konkretnych strajkach wymaga źródeł.
- Nie modelujemy frakcji KPP. Dokumentacja celowo nie przenosi niemieckich
  reguł frakcji KPD (Conciliators).
- Kod gry, zależności i metadane scenariusza bez zmian.
