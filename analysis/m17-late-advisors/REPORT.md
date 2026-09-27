# M17 — późni doradcy i droga do współpracy z KPP, referencja 0.29

26 IX 2026. **M17 zamknięte w dokumentacji.** Kalkulator sprawdza reguły z
[8.1](../../docs/POLISH_TECHNICAL_REFERENCE.md#81-relacja-nie-jest-zobowiązaniem),
[9.5](../../docs/POLISH_TECHNICAL_REFERENCE.md#95-komuniści-powtarzane-przygotowanie-zamiast-licznika-koalicji)
i [10.4.3](../../docs/POLISH_TECHNICAL_REFERENCE.md#1043-zatwierdzony-katalog-i-robocze-efekty)
referencji technicznej testami jednostkowymi. Nie jest to symulacja kampanii.

Uruchomienie: `node analysis/m17-late-advisors/check.cjs`. Pliki:
[kalkulator](check.cjs) i [wyniki z hashami dokumentów](results.json).

## Zatwierdzone reguły

Decyzje użytkownika: Próchnik i Drobner jako obsada kontynuacji; droga do
współpracy z KPP przez zwykłe działania.

1. **Próchnik (A12) i Drobner (A13) należą do kontynuacji.** W rozdziale 1 się
   nie pojawiają. Ich akcje i dotychczasowe daty zostają zapisane dla
   rozdziału 2. Wcześniej rozdział kończył się zamachem (1926–1927) albo
   wyborami (19 II 1928), więc ci doradcy mieli najwyżej jeden–dwa miesiące i
   jedną akcję.
2. **Droga do KPP przez zwykłe działania.**
   - „Otworzyć kontakt” (9.5) jest dostępne od relacji 10, czyli od startu,
     zamiast od 20. Kosztuje 1 akcję i daje +4.
   - Po otwarciu kanału zwykłe rozmowy z 8.1 obejmują KPP: +4 relacji, 1 akcja,
     odnowienie 3 miesiące.
   - Wrogość zamyka drogę: stanowisko krytyczne wobec modelu sowieckiego (−5)
     albo kampanie polemiczne przeciw KPP (−2 każda) mogą zbić relację poniżej
     10.

## Dlaczego była potrzebna zmiana

Relacja z KPP startuje od 10. Dawniej otwarcie kontaktu i lekka koordynacja w
strajku wymagały 20, a przed 1928 r. relację podnosiło tylko stanowisko
prosowieckie (+5, raz). Najwyżej 15 — kanał nigdy się nie otwierał. Kalkulator
potwierdza to na sześcioletnim planie: bez Drobnera droga była zamknięta.

## Droga po zmianie

Plan: kontakt w miesiącu 0, potem rozmowy, gdy tylko pozwala odnowienie.

| Próg | Znaczenie | Kiedy osiągnięty | Akcje | Relacja |
|---|---|---|---:|---:|
| 20 | lekka koordynacja w strajku (9.6) | 4. miesiąc | 3 | 22 |
| 30 | pełna współpraca w strajku (9.6) | 10. miesiąc | 5 | 30 |
| 50 | zasady szerszego układu (9.5) | ok. 25. miesiąc | 10 | 50 |

Udane wspólne próby dodają +2 (lekka) albo +5 (pełna), a stanowisko prosowieckie
+5. Trwały front (65–70) zostaje celem długoterminowym, głównie na
kontynuację. Każdy krok kosztuje akcję, więc współpraca jest realnym wyborem
konkurującym z innymi planami.

## Wpływ na scenariusz M02

Brak. Silnik M02 nie korzysta z tych doradców ani ze współpracy z komunistami;
kalkulator sprawdza to w jego kodzie.

## Granice

- Progi i przyrosty są P do kalibracji w prototypie.
- Daty i profile Próchnika i Drobnera pozostają przyjętymi profilami gry,
  zapisanymi dla kontynuacji; nie są nowymi tezami historycznymi.
- Kod gry, zależności i metadane scenariusza bez zmian. Obecne sceny doradców w
  `source/` nie są tu zmieniane.
