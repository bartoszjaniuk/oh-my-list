Aplikacja - Oh my list (MVP)

## Główny problem

Chaos informacyjny i strata czasu: Ręczne tworzenie, grupowanie i formatowanie list zakupowych jest monotonne i zajmuje czas.
Brak synchronizacji: Tradycyjne listy lub komunikatory tekstowe nie aktualizują się u wszystkich w tym samym czasie, co prowadzi do nieporozumień (np. dublowanie zakupów).
Brak kontekstu: Przesłana znajomym "płaska" lista jest nieczytelna. Automatyczny podział na kategorie (np. warzywa, nabiał, pieczywo) natychmiast ją porządkuje.
Czasochłonne przepisy: Przepis kulinarny zawiera listę składników, którą trzeba ręcznie przepisywać na listę zakupów — to dodatkowa strata czasu i źródło pomyłek.

## Najmniejszy zestaw funkcjonalności

- Zarządzanie kontem: Prosta rejestracja i logowanie (logowanie Google).
- Zarządzanie listami zakupowymi (CRUD): Tworzenie, edycja, przeglądanie i usuwanie list zakupowych. **ListsScreen (PRD §4.5):** jeden ekran z przełącznikiem „Moje listy” (własne) i „Listy współdzielone” (członek, nie właściciel), zasila go **`GET /lists`** z parametrem **`scope`** (`owned` / `shared`; API Plan §2.2).
- Współdzielenie: Możliwość zaproszenia innych użytkowników do listy (np. poprzez wygenerowanie linku/ kod QR).
- Synchronizacja w czasie rzeczywistym: Zmiany na liście (dodanie, usunięcie, odznaczenie elementu jako "zrobione") pojawiają się natychmiast u wszystkich członków bez konieczności odświeżania ekranu (przy użyciu WebSockets).

- Moduł AI (Kategoryzacja): Integracja z zewnętrznym API (OpenRouter), które w tle analizuje dodany produkt i automatycznie przypisuje mu kategorię zakupową (np. "mleko" → "Nabiał").
- Import z przepisu (AI): Użytkownik wkleja link do przepisu kulinarnego. AI rozpoznaje listę składników, a użytkownik najpierw widzi podgląd rozpoznanych produktów, może je edytować (dodać, usunąć, poprawić nazwę/ilość), a dopiero po potwierdzeniu produkty trafiają na listę zakupową.

## Co NIE wchodzi w zakres MVP

- Inne typy list (Filmy/Seriale, Książki, Podróże, Prezenty): opisane w PRD / API Plan / DB Plan (pole `lists.type`, kategorie, walidacja) — **istnieją w dokumentacji i schemacie**, ale **nie są dostępne w UI MVP**. Kandydat na **POST-MVP**.
- Zaawansowane uprawnienia: Wersja MVP posiada dwie role: właściciel (owner) i członek (member). Właściciel ma pełne prawa, członek może wszystko oprócz usunięcia listy oraz usunięcia właściciela. Brak ról takich jak "Tylko do odczytu" czy "Administrator".
- Tryb offline: Zaawansowana obsługa konfliktów podczas działania bez dostępu do internetu i synchronizacja po ponownym połączeniu.
- Powiadomienia Push: Powiadomienia na telefon o każdej zmianie na liście.
- Rozbudowane integracje: Brak połączenia ze sklepami internetowymi czy kalendarzami.
- Mikrozarządzanie AI: Możliwość ręcznego trenowania modelu AI przez użytkownika.
- Automatyczny import bez potwierdzenia: Produkty z przepisu nigdy nie trafiają na listę bez wcześniejszego podglądu i akceptacji użytkownika.

# Kryteria sukcesu

- Utworzenie aplikacji mobilnej
- Konfiguracja Supabase (Auth + DB + Realtime) oraz funkcji serwerowych dla AI
- Techniczne:
  - Skuteczność AI (kategoryzacja): Model prawidłowo przypisuje kategorie zakupowe w co najmniej 90% przypadków bez konieczności ręcznej poprawki przez użytkownika.
  - Import z przepisu: Użytkownik może przejrzeć i poprawić rozpoznane produkty przed dodaniem ich do listy.
