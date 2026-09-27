# M12 — zgoda na ugodę strajkową i kruchość rządu, referencja 0.24

25 IX 2026. **M12 zamknięte w dokumentacji.** Kalkulator sprawdza reguły z
[14.4](../../docs/POLISH_TECHNICAL_REFERENCE.md#144-oferta-i-rozstrzygnięcie)
i [17.4](../../docs/POLISH_TECHNICAL_REFERENCE.md#174-uzupełniające-reguły-zamykające-zależności)
referencji technicznej. Robi to na dwa sposoby:
- testy jednostkowe obu wzorów;
- powtórka 144 archiwalnych przebiegów M02 na silniku
  [m02-robustness](../m02-robustness/engine.cjs). Nowe reguły wstawiamy do
  niego tylko w pamięci: osobno oraz na regułach M10 i M11.

Nie jest to symulacja kampanii.

Uruchomienie: `node analysis/m12-strike-settlement/check.cjs`. Pliki:
[kalkulator](check.cjs) i [wyniki z hashami dokumentów](results.json).

## Zatwierdzone reguły

Decyzje użytkownika: koszt kontynuacji liczy brak pieniędzy i zmęczenie;
kruchość rządu liczy poparcie i spory.

- **Zgoda związku na ugodę:**
  `0,5 × spełnienie żądań + 0,3 × zaufanie + 0,2 × koszt kontynuacji ≥ 50`,
  z zachowaniem czerwonych linii.
  - Koszt kontynuacji to większa z dwóch wartości: brak pieniędzy
    (`100 × (1 − pokrycie funduszu)`) albo zmęczenie strajkujących.
  - Pełny fundusz nie zwiększa już chęci zakończenia strajku. Nadal wzmacnia
    nacisk na pracodawcę (14.2).
- **Kruchość rządu w rokowaniach strajkowych:**
  `50 − (posłowie popierający gabinet − 222) + 0,5 × najwyższe napięcie w jego
  umowach`, w granicach 0–100.
  - Gabinet pełniący obowiązki ma 100.
  - Autorytet Sejmu przestaje wpływać na strajki.

## Przykłady

**Zgoda przy połowie żądań i zaufaniu 50:**

| Sytuacja | Dotychczas | Teraz |
|---|---|---|
| Pełny fundusz, wypoczęci | 60 — zgoda | 40 — odmowa, związek czeka na lepszą ofertę |
| Pusty fundusz | 40 — odmowa | 60 — zgoda |
| Pełny fundusz, zmęczenie 50 | 60 — zgoda | 50 — zgoda |

Oferta spełniająca wszystkie żądania jest zawsze przyjmowana, a naruszenie
czerwonej linii zawsze ją blokuje.

**Kruchość:**

| Gabinet | Kruchość |
|---|---:|
| 232 posłów, bez sporów | 40 |
| 279 posłów | 0 |
| Mniejszościowy, 200 posłów | 72 |
| 232 posłów, napięcie 60 | 70 |
| Pełniący obowiązki | 100 |

## Scenariusz M02: 144 główne przebiegi

- **Zgoda związku niczego nie zmienia.** Wszystkie archiwalne ugody spełniają
  żądania w całości, więc związek zawsze się zgadza.
- **Kruchość zmienia szansę ugody strajkowej o −8,2 do +3,4 pp.**
  - 229 ofert, przyjętych 108 — tyle samo co dotychczas.
  - W 10 przebiegach ugoda przypada w innym miesiącu.
  - W Sejmie bazowym i trudniejszym ugoda przychodzi wcześniej, w XI–XII 1923
    zamiast I–VII 1924. Chjeno-Piast ma tam cienką większość, więc jest
    bardziej kruchy.
  - W Sejmie korzystniejszym ugoda przychodzi później, bo rząd Sikorskiego ma
    tam szerokie poparcie.
- **Jeden termin zamachu** przesuwa się o miesiąc wcześniej: Sejm trudniejszy,
  strategia B, ziarno 10.
- **Kolejność gabinetów** się nie zmienia; żadna próba nie znika ani nie
  powstaje.
- **Łącznie z M10 i M11** zmiany są takie same.

## Granice

- Silnik M02 nie zapisuje poparcia gabinetów powołanych ze wspólnego profilu
  otwarcia: Ponikowskiego, Nowaka i Sikorskiego. Przyjęto syntetycznie, jak w
  M09, że tolerują je Piast, NPR, PSChD i ZLN, a także PPS, gdy popiera rząd z
  zewnątrz. To założenie testu, nie fakt historyczny.
- Wagi i próg są P do kalibracji w prototypie.
- Przebiegi M02 nie zawierają ofert częściowych, więc nowa reguła zgody
  związku nie została w nich sprawdzona w działaniu.
- Kod gry, zależności i metadane scenariusza bez zmian.
