# M09 — warunki życia a poparcie, referencja 0.21

25 IX 2026. **M09 zamknięte w dokumentacji.** Kalkulator sprawdza przepływ z
[5.6 referencji technicznej](../../docs/POLISH_TECHNICAL_REFERENCE.md#56-warunki-życia-i-odpowiedzialność-za-rząd--przepływ-m09).
Używa do tego archiwalnych miesięcznych przebiegów M02: gospodarki, gabinetu i
roli PPS. Liczy wyłącznie ten przepływ, bez kampanii, obietnic i innych zmian
poparcia, więc nie jest prognozą wyborów.

Uruchomienie: `node analysis/m09-living-conditions/check.cjs`. Pliki:
[kalkulator](check.cjs) i [wyniki z hashami dokumentów](results.json).

## Zatwierdzone reguły

- **Warunki życia klasy.** Ogólna gospodarka to płace realne oraz −2 punkty
  za każdy punkt procentowy bezrobocia ponad 3%. Klasy odczuwają ją w różnym
  stopniu:
  - robotnicy — w pełni;
  - inteligencja — w 1/2;
  - drobnomieszczaństwo — w 1/4;
  - chłopi — w 1/5, a do tego w pełni wskaźnik wsi z 11.6;
  - burżuazja i ziemiaństwo — nie reagują.
- **Pogorszenie:** 0,1 pp za punkt, najwyżej 0,5 pp miesięcznie w klasie,
  od partii odpowiedzialnych do pozostałych.
- **Poprawa:** w połowie siły — 0,05 pp za punkt, najwyżej 0,25 pp miesięcznie.
- **Odpowiedzialni:** partie w gabinecie z wagą 1, partie tolerujące go na
  podstawie umowy z wagą 0,5, opozycja 0.
- **Odbiorcy:** pozostałe partie, proporcjonalnie do obecnego poparcia.
  Świadczenia nie wchodzą do wskaźnika.

## Wynik: zmiana poparcia PPS w kraju

Start w tym uproszczeniu pięciu klas: 14,7%. Wyniki w pp za cały rozdział, do
próby zamachu albo granicy wyborów (ziarno 01).

| Sejm | A — bierna | B — tolerująca | C — współrządząca | H — decyzje zbliżone do historycznych |
|---|---:|---:|---:|---:|
| Bazowy | −0,03 | +0,57 | +0,58 | +0,55 |
| Korzystniejszy | −0,06 | −0,04 | −0,04 | −0,08 |
| Trudniejszy | +0,03 | +0,01 | +0,01 | +0,03 |

Różnice wynikają z tego, kto odpowiadał za rząd w czasie spadku płac w 1923 r.
i ich późniejszej odbudowy:
- **Bazowy:** PPS jest w opozycji podczas hiperinflacji 1923 i zyskuje. Potem
  w B, C i H toleruje Grabskiego podczas odbudowy i dostaje połowę nagrody.
  W A pozostaje w opozycji i przy odbudowie oddaje zysk.
- **Korzystniejszy:** płace spadają płycej, tylko do ok. 75. PPS toleruje
  gabinet Sikorskiego przez cały spadek i odbudowę. Dzieli winę za spadek, a za
  odbudowę dostaje tylko połowę.
- **Trudniejszy:** Chjeno-Piast rządzi od V 1923 do końca. PPS w opozycji
  zyskuje na hiperinflacji, a przy dłuższej odbudowie oddaje prawie cały zysk.

Pozostałe partie w tych przebiegach:
- ZLN: od −0,1 do −0,5 pp;
- PSChD: od −0,1 do −0,4 pp;
- Piast: od −0,1 do −0,2 pp;
- Wyzwolenie: od +0,1 do +0,2 pp;
- KPP: od +0,04 do +0,2 pp;
- NPR: od −0,2 do +0,3 pp. Wynik zależy od przebiegu, bo w założeniu testowym
  NPR toleruje gabinety eksperckie, a za Chjeno-Piasta jest w opozycji.

## Przepływ w klasach

Przepływ netto od partii odpowiedzialnych w całym rozdziale, w pp poparcia
danej klasy:

| Klasa | Przepływ netto |
|---|---|
| Robotnicy | 1,5–2,4 |
| Inteligencja | 0,8–1,5 |
| Drobnomieszczaństwo | 0,4–0,7 |
| Chłopi | 0,3–0,5 |
| Burżuazja | 0 |

**Chłopi (decyzja 4).** Gdyby czytali tylko wskaźnik wsi, przesuwaliby
0,03–0,19 pp. Z zatwierdzoną regułą przesuwają 0,3–0,5 pp:
- zawsze mniej niż robotnicy i inteligencja;
- mniej niż drobnomieszczaństwo w 10 z 12 przebiegów.

Wyjątkiem są przebiegi A i H w Sejmie korzystniejszym: 0,46 wobec 0,42 pp oraz
0,49 wobec 0,44 pp. Płace spadają tam płycej, a wieś traci na własnym
wskaźniku, którego klasy miejskie nie odczuwają.

## Przykład: hiperinflacja 1923

Przebieg A w Sejmie bazowym, gabinet Chjeno-Piasta, V–XI 1923. Płace realne
robotników spadają z 81,7 do 56,1. Partie rządzące tracą wśród robotników
2,18 pp; w trzech miesiącach przepływ trafia w limit 0,5 pp. PPS w opozycji
zyskuje w tej klasie 1,02 pp.

## Sprawdzone niezmienniki

- 1 pp bezrobocia obniża warunki robotników o 2 punkty; burżuazja nie reaguje.
- Na ogólną gospodarkę chłopi reagują w 1/5, słabiej niż każda reagująca klasa
  miejska. W każdym przebiegu ich łączny przepływ jest mniejszy niż robotników
  i inteligencji.
- Równy spadek i poprawa za tego samego rządu zostawiają odpowiedzialnych niżej,
  bo nagroda działa w połowie siły.
- Bez odpowiedzialnych partii i przy stałej gospodarce nie ma przepływu.
- Opozycja nie traci przy pogorszeniu.
- Wiersze poparcia mieszczą się w 0–100 i sumują do 100; limity miesięczne są
  zachowane; wyniki są deterministyczne.

## Granice

- Przebiegi M02 nie zapisują, kto tolerował gabinety eksperckie. Przyjęto
  syntetycznie, że tolerują je Piast, NPR, PSChD i ZLN z wagą 0,5. To założenie
  testu, nie fakt historyczny.
- Kalkulator używa klasowych wierszy otwarcia z `source/scenes/root.scene.dry`,
  bez podziału na tożsamości i zatrudnienie. W grze przepływ działa w każdej
  komórce klasy.
- Bez kampanii, obietnic, rozłamów i głosowania. Pełny wynik następnych wyborów
  sprawdzi prototyp.
- Wskaźnik wsi zmienia się w tych przebiegach tylko o kilka punktów; jego
  czułość pozostaje do kalibracji.
- Liczby są P. Kod gry, zależności i metadane scenariusza bez zmian.
  Odziedziczone niemieckie dryfy poparcia w `post_event` trzeba wyłączyć przy
  wdrożeniu (20.2).
