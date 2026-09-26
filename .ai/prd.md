# Oh my list — Product Requirements Document (MVP)

## 1. Przegląd produktu

Oh my list (Listastic) to aplikacja mobilna (iOS/Android) do tworzenia, zarządzania i współdzielenia **inteligentnych list zakupowych**. Wyróżnikiem produktu jest kategoryzacja produktów: najpierw globalny słownik (dopasowanie dokładne i rozmyte), potem — gdy potrzeba — AI (OpenRouter), synchronizacja w czasie rzeczywistym między współpracownikami (Supabase Realtime) oraz **import składników z linku do przepisu kulinarnego** (podgląd → edycja → dopiero potem zapis na listę).

Aplikacja skierowana jest do dorosłych, rodzin, współlokatorów i par, którzy chcą sprawniej organizować wspólne zakupy.

> **Zakres typów list:** MVP obsługuje wyłącznie typ `shopping`. Pozostałe typy (`movies`, `books`, `travel`, `gifts`) są **zaprojektowane** w modelu danych, API i katalogu kategorii (patrz §8.2–8.5) i mogą zostać włączone w **POST-MVP** bez przebudowy schematu — w UI MVP nie są dostępne.

## 2. Problem użytkownika

1. **Chaos informacyjny i strata czasu** — ręczne tworzenie, grupowanie i formatowanie list zakupowych jest monotonne i czasochłonne.
2. **Brak synchronizacji** — tradycyjne listy i komunikatory nie aktualizują się w czasie rzeczywistym, co prowadzi do dublowania zakupów i zapominania.
3. **Brak kontekstu** — płaskie listy zakupów bez podziału na kategorie (np. nabiał, warzywa) są nieczytelne. Automatyczny podział natychmiast je porządkuje.
4. **Przepisywanie z przepisów** — przepis kulinarny zawiera listę składników, którą trzeba ręcznie przenosić na listę zakupów; to dodatkowa strata czasu i źródło pomyłek.

## 3. Stos technologiczny

| Warstwa      | Technologia                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------- |
| Mobile       | Expo React Native, `expo-router`, NativeWind (Tailwind)                                         |
| Backend      | Supabase Edge Functions (tylko operacje serwerowe, bez własnego serwera)                        |
| Baza danych  | Supabase (Postgres), rozszerzenie `pg_trgm` (indeks GIN do fuzzy match w `category_dictionary`) |
| Autentykacja | Supabase Auth (Google OAuth)                                                                    |
| Real-time    | Supabase Realtime (Postgres Changes + Presence/Broadcast)                                       |
| AI           | OpenRouter API                                                                                  |
| Czcionka     | CabinetGrotesk                                                                                  |

## 4. Funkcjonalności MVP

### 4.1 Autentykacja

- Logowanie wyłącznie przez Google (Supabase Auth).
- Po pierwszym zalogowaniu — onboarding (3 slajdy), wyświetlany jednorazowo.
- Po zalogowaniu — ekran Home.

### 4.2 Onboarding

Trzy slajdy z ilustracją i krótkim tekstem:

1. Inteligentna kategoryzacja — AI automatycznie porządkuje Twoje zakupy.
2. Współdzielenie w real-time — zmiany widoczne natychmiast u wszystkich.
3. Import z przepisu — wklej link, sprawdź składniki, dodaj na listę.

Ostatni slajd zawiera przycisk „Zaloguj się przez Google". Wyświetlany tylko raz (przy pierwszym uruchomieniu).

### 4.3 Nawigacja

**Bottom Tabs:**

| Pozycja | Element | Opis                                                                                |
| ------- | ------- | ----------------------------------------------------------------------------------- |
| Lewa    | Home    | Ekran główny z kafelkami                                                            |
| Środek  | FAB (+) | Wyróżniony przycisk (większy, kolorowy, podniesiony). Otwiera modal tworzenia listy |
| Prawa   | Profil  | Ekran profilu użytkownika                                                           |

**Stack Navigator (z Home):**

- HomeScreen
- ListsScreen — jeden ekran z przełączaniem między „Moje listy” a „Listy współdzielone” (patrz §4.5)
- ListDetailScreen (Widok listy)
- ListSettingsScreen (Ustawienia listy)
- RecipeImportPreviewScreen (Podgląd składników z przepisu) — patrz §4.14

**Bottom Sheets:**

- JoinWithCode (Dołącz z kodem) — z kafelka Home
- ShareList (Udostępnianie listy) — z nagłówka listy
- EditItem (Edycja elementu) — z widoku listy
- ImportFromRecipe (Import z linku) — z widoku listy; pole URL → po sukcesie nawigacja do podglądu

> **POST-MVP:** `ListTypesScreen` (Rodzaje list) — katalog typów list; nie wchodzi w nawigację MVP.

### 4.4 Ekran Home

Układ **bento grid** (masonry) z 4 kafelkami o zróżnicowanych rozmiarach. Pastelowe tła, zaokrąglone rogi (16-20px), grafiki/ilustracje na każdym kafelku.

| Rząd | Kafelek             | Szerokość | Cel                                                                                                                                                      |
| ---- | ------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Moje listy          | 2/3       | Otwiera **ListsScreen** z aktywnym segmentem „Moje listy” (listy własne — użytkownik jest właścicielem)                                                  |
| 1    | Dołącz z kodem      | 1/3       | Otwiera bottom sheet z polem na kod + skan QR                                                                                                            |
| 2    | Import z przepisu   | 1/3       | Skrót: użytkownik wybiera listę (lub tworzy nową), potem wkleja link do przepisu (patrz §4.14)                                                           |
| 2    | Listy współdzielone | 2/3       | Otwiera **ten sam ListsScreen**, z aktywnym segmentem „Listy współdzielone” (listy, do których użytkownik dołączył jako członek, nie będąc właścicielem) |

### 4.5 Ekran list (ListsScreen) — „Moje listy” i „Listy współdzielone”

Jeden ekran z **przełącznikiem segmentów** (np. segmented control / zakładki u góry): **„Moje listy”** oraz **„Listy współdzielone”**. Semantyka treści bez zmian względem wcześniejszego podziału na dwa ekrany — różni się tylko sposób nawigacji (jedno miejsce zamiast dwóch tras).

**Segment „Moje listy”**

- Listy, których użytkownik jest **właścicielem** (`owner`).
- Kafelki z: nazwą listy, liczbą członków, liczbą elementów.
- Sortowanie: ostatnio edytowane na górze.
- Użytkownik może mieć wiele list zakupowych.

**Segment „Listy współdzielone”**

- **Wyłącznie** listy, do których użytkownik dołączył jako **członek**, a **nie** jest właścicielem.
- Ten sam format kafelków co w segmencie „Moje listy”.

**Zachowanie z Home:** kafelek „Moje listy” otwiera ListsScreen z wybranym segmentem „Moje listy”; kafelek „Listy współdzielone” — ten sam ekran z segmentem „Listy współdzielone”. Użytkownik może przełączać segmenty na miejscu bez powrotu na Home.

**API (§12):** Oba segmenty korzystają z **jednego** żądania pobrania list (`GET` + parametr zapytania `scope`: własne vs współdzielone); szczegóły w tabeli endpointów i w API Plan.

### 4.6 Ekran „Rodzaje list” — POST-MVP

Katalog predefiniowanych typów list (`shopping`, `movies`, `books`, `travel`, `gifts`) z kafelkami. **Nie wchodzi w UI MVP** — typy inne niż `shopping` są przygotowane w schemacie i dokumentacji (API Plan, DB Plan, §8), ale użytkownik MVP tworzy wyłącznie listy zakupowe. Ekran i wybór typu przy tworzeniu listy mogą wrócić w POST-MVP.

### 4.7 FAB (+) — Modal tworzenia listy

Flow:

1. Modal otwiera się z polem „Podaj nazwę listy" (input tekstowy).
2. Na dole — przycisk „Utwórz".
3. Lista jest zawsze tworzona jako typ **`shopping`** (pole `type` ustawiane po stronie serwera / hardcodowane w kliencie MVP).

Walidacja:

- Nazwa wymagana (min. 1 znak po trimie).
- Przycisk „Utwórz" nieaktywny, dopóki walidacja nie jest spełniona.

Po utworzeniu: modal się zamyka → nawigacja do widoku nowo utworzonej listy.

> **POST-MVP:** krok wyboru typu listy (5 kafelków) przed „Utwórz".

### 4.8 Widok listy (ListDetailScreen)

**Nagłówek:**

- Strzałka wstecz
- Nazwa listy
- Ikona udostępniania (share) → otwiera bottom sheet
- Ikona koła zębatego (settings) → przenosi na ekran ustawień

**Treść:**

- Elementy pogrupowane wg kategorii.
- Kategorie wyświetlane alfabetycznie, „Inne" zawsze na końcu. Kategorie bez elementów — ukryte.
- Elementy wewnątrz kategorii — chronologicznie (od najstarszego).
- Element zaznaczony (checked): przekreślenie tekstu + zmiana koloru. Pozostaje na swoim miejscu w kategorii.
- Akcja „Wyczyść ukończone" — trwałe usunięcie wszystkich zaznaczonych elementów.

**Dodawanie elementów:**

- Stały textarea na dole ekranu (styl Apple Notes).
- Użytkownik wpisuje wiele produktów naraz, rozdzielonych nową linią lub przecinkiem.
- Przycisk „Dodaj" zatwierdza.
- Elementy rozdzielane, dodawane pojedynczo, kategoryzowane (słownik → AI).
- Walidacja: max 200 znaków na dodanie, brak pustych znaków / samych spacji. Przycisk „Dodaj" nieaktywny przy pustym polu.
- Osobna akcja „Import z przepisu" (ikona / przycisk w okolicy pola dodawania) → bottom sheet z polem URL (patrz §4.14).

**Edycja elementu:**

- Kliknięcie elementu → bottom sheet z polami: nazwa, notatka, ilość, link.
- Pola ilość, notatka i link dostępne dla list zakupowych.

**Usuwanie:**

- Każde usunięcie wymaga potwierdzenia (modal).
- Zaznaczanie/odznaczanie elementów to osobna akcja (nie jest usuwaniem).

### 4.9 Ekran ustawień listy (ListSettingsScreen)

Dostępny z ikony koła zębatego w nagłówku widoku listy. Zawiera:

1. **Pole edycji nazwy listy**.
2. **Sekcja „Członkowie"** — lista avatarów/nazw użytkowników. Właściciel widzi przycisk usunięcia (X) przy każdym członku. Właściciel nie może usunąć siebie.
3. **Przycisk „Opuść listę"** — widoczny tylko dla członka.
4. **Przycisk „Usuń listę"** — widoczny tylko dla właściciela, na dole ekranu, czerwony, z potwierdzeniem.

### 4.10 Udostępnianie listy (ShareList bottom sheet)

Otwierany z ikony share w nagłówku widoku listy. Zawiera:

1. Tekst o zaproszeniu do kolaboracji.
2. Kod QR (generowany z linku zaproszenia).
3. Przycisk „Udostępnij kod do listy" (otwiera systemowy share sheet).

### 4.11 Dołączanie do listy

**Z kafelka Home „Dołącz z kodem":**

- Bottom sheet z polem na kod alfanumeryczny + przycisk „Dołącz" + przycisk „Skanuj QR".
- Dołączenie „na ślepo" (bez podglądu listy przed dołączeniem).

**Przez deep link:**

- Format: `listastic://invite/{code}`.
- Otwiera aplikację i automatycznie dołącza do listy.
- Jeśli aplikacja nie jest zainstalowana — fallback na stronę webową z linkiem do sklepu.

### 4.12 Profil

- Zdjęcie użytkownika (z Google).
- Adres email.
- Przycisk wylogowania.

### 4.13 Stany puste

Gdy w aktywnym segmencie ekranu list brak list do wyświetlenia albo gdy brak elementów na liście — tekst informacyjny (bez ilustracji w MVP).

### 4.14 Import produktów z linku do przepisu (AI)

Cel: użytkownik wkleja URL przepisu kulinarnego; AI wyciąga listę składników; **nic nie trafia na listę zakupową**, dopóki użytkownik nie potwierdzi po edycji podglądu.

**Wejścia do flow:**

1. Z widoku listy — akcja „Import z przepisu" → bottom sheet z polem URL.
2. Z kafelka Home „Import z przepisu" → wybór listy docelowej (lub utworzenie nowej), potem to samo bottom sheet.

**Flow:**

```
Użytkownik wkleja URL przepisu
        ↓
POST .../recipe-import/preview  (Edge Function + OpenRouter)
        ↓
Ekran podglądu: lista rozpoznanych produktów (nazwa, opcjonalnie ilość)
        ↓
Użytkownik edytuje: poprawia nazwy/ilości, usuwa pozycje, dodaje brakujące
        ↓
„Dodaj do listy" → zapis przez pipeline bulk (słownik + AI kategoryzacja)
        ↓
Powrót do widoku listy z nowymi produktami
```

**Zasady:**

- Podgląd jest **stanem przejściowym po stronie klienta** (odpowiedź API preview nie zapisuje `list_items`).
- Bez możliwości pominięcia podglądu — brak „dodaj od razu bez edycji" w MVP.
- Błędy: nieprawidłowy URL, strona niedostępna, AI nie rozpoznało składników → komunikat + możliwość ponowienia.
- Po potwierdzeniu obowiązuje ten sam pipeline kategoryzacji co przy `POST .../items/bulk` (API Plan §2.3.1 / §2.3).

**API:** szczegóły w API Plan — `POST /lists/:id/recipe-import/preview` oraz potwierdzenie przez `POST /lists/:id/items/bulk` (z opcjonalnym `quantity`).

## 5. System ról i uprawnień

| Akcja                   | Właściciel (owner) | Członek (member) |
| ----------------------- | ------------------ | ---------------- |
| Dodawanie elementów / import z przepisu | ✅ | ✅ |
| Edycja elementów        | ✅                 | ✅               |
| Usuwanie elementów      | ✅                 | ✅               |
| Zaznaczanie/odznaczanie | ✅                 | ✅               |
| Edycja nazwy listy      | ✅                 | ✅               |
| Zapraszanie członków    | ✅                 | ✅               |
| Usuwanie członków       | ✅                 | ❌               |
| Usuwanie listy          | ✅                 | ❌               |
| Opuszczenie listy       | —                  | ✅               |

## 6. System zaproszeń

- **Format kodu**: 6 znaków alfanumerycznych, uppercase, bez mylących znaków (O/0, I/1). Np. `A3X7K9`.
- **Ważność**: 24 godziny lub do jednokrotnego użycia (co nastąpi pierwsze).
- **Wymagania**: zaproszony musi mieć konto (rejestracja przed dołączeniem).
- **Kanały**: link (`listastic://invite/{code}`), kod QR, ręczne wpisanie kodu.
- **Deep linking**: obsługiwany natywnie przez Expo (`expo-linking`).

## 7. Kategoryzacja AI

Cel systemu: automatyczne przypisywanie elementów do kategorii z **minimalnym użyciem AI** — najpierw globalny słownik (exact, potem fuzzy), dopiero potem wywołanie modelu; walidacja wyniku przed zapisem; uczenie się systemu w czasie przez rozbudowę słownika.

**Architektura wysokiego poziomu:**  
`INPUT → NORMALIZE → DICTIONARY (exact + fuzzy) → AI fallback → VALIDATE → SAVE → RETURN`

### 7.1 Flow kategoryzacji

```
Użytkownik dodaje element(y)
        ↓
Normalizacja nazw (patrz 7.2)
        ↓
Exact match w category_dictionary (item_name + list_type)
        ↓
    ┌── Trafienie → użyj kategorii ze słownika
    └── Brak → Fuzzy match (pg_trgm, próg similarity ≥ 0,7)
                    ↓
            ┌── Trafienie → użyj kategorii ze słownika
            └── Brak → Wywołanie OpenRouter API
                              ↓
                     Walidacja (kategoria z dozwolonej listy dla typu listy)
                              ↓
                     Zapis wyniku do słownika (z confidence i source)
                              ↓
                     Przypisanie kategorii do elementu
```

> **MVP:** `list_type` w praktyce zawsze `shopping`. Słownik i walidacja pozostają parametryzowane po `list_type`, żeby w POST-MVP włączyć pozostałe typy bez zmiany pipeline'u.

Przykład: użytkownik dodaje „mleko 2%” na liście zakupów → po normalizacji `mleko` → exact match w słowniku → zwrot kategorii bez wywołania AI.

### 7.2 Normalizacja nazw przed lookup i AI

Przed wyszukiwaniem w słowniku oraz przekazaniem nazwy do promptu:

- `lowercase`, `trim`
- usunięcie polskich diakrytyków
- **usunięcie znaków specjalnych** (spójnie z implementacją — np. znaki poza literami/cyframi), aby „mleko 2%” i „mleko” mapowały się do tej samej bazy porównań

### 7.3 Globalny słownik (CategoryDictionary)

Tabela Postgres (`category_dictionary`) przechowująca wcześniej skategoryzowane elementy:

| Pole                       | Opis                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `item_name`                | Znormalizowana nazwa (wg 7.2)                                                           |
| `list_type`                | Typ listy (MVP: zawsze `shopping`; wartości `movies` / `books` / `travel` / `gifts` — **POST-MVP**, już w CHECK schematu) |
| `category`                 | Przypisana kategoria (musi należeć do zestawu dla danego typu — patrz §8 i walidacja)   |
| `usage_count`              | Licznik użyć                                                                            |
| `confidence`               | Domyślnie `0.7`; patrz 7.6                                                              |
| `source`                   | Źródło wpisu, domyślnie `'ai'`; rezerwacja na przyszłe źródła (np. korekta użytkownika) |
| `created_at`, `updated_at` | Timestamps                                                                              |

**Unikalność:** (`item_name`, `list_type`).

**Indeksy (MVP):**

- exact: `(item_name, list_type)` — szybki lookup po znormalizowanej nazwie
- fuzzy: rozszerzenie Postgres `pg_trgm` + indeks GIN na `item_name` (`gin_trgm_ops`) — dopasowanie podobieństwa do istniejących wpisów w słowniku

**Próg fuzzy:** similarity ≥ **0,7** → uznaj za trafienie i użyj kategorii ze słownika; poniżej progu → ścieżka AI (fallback).

### 7.4 Tabela `categories` (zalecana)

Osobna tabela katalogu kategorii per typ listy ułatwia walidację (np. CHECK, FK lub walidacja w Edge Function) i ewentualną rozbudowę:

- `id` (uuid, PK)
- `list_type` (text, not null)
- `name` (text, not null) — etykieta zgodna z listą predefiniowaną w §8

(Szczegóły relacji z `list_items.category` — implementacyjnie: tekstowa zgodność z nazwą w `categories` lub mapowanie po `id` — do ustalenia przy modelowaniu migracji.)

### 7.5 Masowe dodawanie

Endpoint `POST /lists/:id/items/bulk` przyjmuje `{ items: ["Mleko", "Chleb", ...] }` albo `{ items: [{ name, quantity? }, ...] }` (potwierdzenie importu z przepisu).

Flow po stronie serwerowej (Supabase Edge Function):

1. Normalizacja nazw (wg 7.2).
2. Dla każdego elementu: exact match w `category_dictionary` → przy braku fuzzy (próg 0,7) → pozostawienie w puli do AI.
3. Grupowanie elementów nadal bez kategorii (po słowniku).
4. Jedno (lub wsadowe) wywołanie AI dla tej grupy.
5. Walidacja kategorii względem dozwolonych dla typu listy; zapis do słownika z `confidence` / `source` oraz utworzenie rekordów `list_items`.
6. Emisja zdarzeń WebSocket.

### 7.6 Poziomy `confidence` (słownik)

| Źródło / sytuacja                                                                 | `confidence` (wstępne wartości) |
| --------------------------------------------------------------------------------- | ------------------------------- |
| Wynik z AI (poprawny po walidacji)                                                | `0.7`                           |
| Awaryjna kategoria „Inne” (AI niedostępne / błąd / brak dopasowania po walidacji) | `0.3`                           |
| Przyszła korekta przez użytkownika (post-MVP)                                     | `1.0`                           |

Pole `source` w słowniku odróżnia pochodzenie wpisu (np. `'ai'` vs przyszłe `'user'`); domyślnie dla wpisów z AI: `'ai'`.

### 7.7 Prompt AI

Kategorie zdefiniowane jako stałe TypeScript (współdzielone w projekcie mobile + Edge Functions). Prompt zawiera listę dozwolonych kategorii dla danego typu listy i wymusza wybór jednej. Format odpowiedzi: JSON.

Przykład dla zakupów (pojedynczy element):

```
Jesteś asystentem kategoryzacji produktów.
Przypisz produkt do DOKŁADNIE JEDNEJ kategorii z listy:
[Warzywa, Owoce, Pieczywo, Nabiał, ...].
Jeśli żadna nie pasuje, zwróć "Inne".
Odpowiedz WYŁĄCZNIE w formacie JSON: {"category": "nazwa"}
Produkt: {itemName}
```

Przykład dla wielu elementów:

```
Przypisz każdy produkt do DOKŁADNIE JEDNEJ kategorii z listy:
[Warzywa, Owoce, Pieczywo, Nabiał, ...].
Jeśli żadna nie pasuje, zwróć "Inne".
Odpowiedz WYŁĄCZNIE w formacie JSON: [{"item": "nazwa", "category": "kategoria"}, ...]
Produkty: {items}
```

### 7.8 Fallback

Jeśli AI nie może przypisać kategorii lub API jest niedostępne → element otrzymuje kategorię „Inne" (przy zapisie do słownika stosować `confidence` = `0.3` zgodnie z 7.6, o ile wpis trafia do słownika).

## 8. Predefiniowane kategorie

### 8.1 Zakupy — MVP

Warzywa, Owoce, Pieczywo, Nabiał, Mięso i wędliny, Ryby i owoce morza, Kasze, ryż, makarony, Konserwy i słoiki, Przyprawy i zioła, Oleje i octy, Śniadaniowe, Słodycze i przekąski, Napoje, Mrożonki, Chemia gospodarcza, Papier i ręczniki, Dom i wyposażenie, Higiena osobista, Dla dzieci i niemowląt, Dla zwierząt, Inne

### 8.2–8.5 Pozostałe typy — POST-MVP (zaprojektowane)

Poniższe zestawy kategorii są **już opisane** w dokumentacji i mogą być seedowane w `categories` / walidowane w API wraz z włączeniem typów list. **Nie są używane w UI ani flow tworzenia list w MVP.**

#### 8.2 Filmy / Seriale (`movies`) — POST-MVP

Akcja, Przygoda, Komedia, Dramat, Horror, Thriller, Kryminał, Fantasy, Sci-Fi (Science Fiction), Animacja, Dokument, Biograficzny, Historyczny, Wojenny, Western, Musical, Tajemnica / Mystery, Noir, Psychologiczny

#### 8.3 Książki (`books`) — POST-MVP

Kryminał, Thriller, Sensacja, Fantastyka, Sci-Fi, Horror, Romans, Powieść historyczna, Powieść przygodowa, Dystopia

#### 8.4 Podróże (`travel`) — POST-MVP

Transport, Noclegi, Dokumenty, Finanse, Bagaż, Atrakcje, Jedzenie i Napoje, Aktywności, Kultura i Etykieta, Bezpieczeństwo, Inspiracje i Relacje, Fotografia i Wideo, Mapy i Nawigacja, Zakupy i Pamiątki, Życie nocne

#### 8.5 Prezenty (`gifts`) — POST-MVP

Dla Niej, Dla Niego, Dla Dziecka, Dla Domu, Inne

## 9. Synchronizacja real-time (WebSocket)

### 9.1 Architektura

- **Mechanizm**: Supabase Realtime
  - **Postgres Changes**: subskrypcje zmian w tabelach (`lists`, `list_items`, `list_members`, `invitations`, `category_dictionary`; opcjonalnie `categories` przy zmianach katalogu).
  - **Presence/Broadcast** (opcjonalnie w MVP): stan “kto jest na ekranie listy” oraz ephemeral zdarzenia (np. “kto edytuje”).
- **Model**:
  - Widok listy subskrybuje zmiany tylko dla danej listy (filtrowanie po `list_id`).
  - Dostęp do danych real-time ograniczony przez RLS (tylko członkowie listy widzą zmiany).

### 9.2 Zdarzenia

W praktyce “zdarzeniami” są zmiany w DB emitowane przez Postgres Changes:

| Tabela         | Akcja         | Opis                                                                   |
| -------------- | ------------- | ---------------------------------------------------------------------- |
| `list_items`   | INSERT        | Dodanie elementu/elementów                                             |
| `list_items`   | UPDATE        | Edycja elementu (nazwa, ilość, notatka, link, kategoria, `is_checked`) |
| `list_items`   | DELETE        | Usunięcie elementu / czyszczenie ukończonych                           |
| `list_members` | INSERT/DELETE | Dołączenie / usunięcie członka / opuszczenie listy                     |
| `lists`        | UPDATE        | Zmiana nazwy listy                                                     |

Opcjonalnie (Presence/Broadcast):

- “Kto przegląda listę”: Presence `track` na kanale per `list_id`
- “Kto edytuje”: Presence state (np. `mode: viewing|editing`, `item_id`) lub Broadcast “editing-start/stop”

### 9.3 Rozwiązywanie konfliktów

Strategia **last write wins**. Każda modyfikacja elementu wymaga timestampu `updatedAt`. Serwer akceptuje zapis tylko jeśli przychodzący timestamp jest nowszy niż aktualny.

## 10. Bezpieczeństwo

1. **Rate limiting** — ograniczenie liczby requestów per IP (timeout). Zabezpieczenie przed spamowaniem endpointów.
2. **Limity AI per użytkownik** — maksymalna liczba wywołań kategoryzacji AI (konkretne progi do ustalenia w ramach definicji planów basic/premium).
3. **Autentykacja** — Supabase Auth (JWT).
4. **Walidacja danych** — max 200 znaków na dodanie, sanityzacja inputów, walidacja typów.
5. **Hardening HTTP** — CORS, Helmet, bezpieczne nagłówki, ograniczenia body size (szczególnie dla bulk).
6. **Autoryzacja zasobów** — każda operacja na liście wymaga weryfikacji członkostwa i roli (owner/member), nie tylko tokenu.
7. **RLS (Row Level Security)** — polityki dostępu do tabel tak, aby dane list były widoczne tylko dla członków; analogicznie dla zaproszeń (tylko członkowie/owner).
8. **Sekrety i konfiguracja** — bezpieczne przechowywanie kluczy (Supabase, OpenRouter), rotacja, ograniczenia uprawnień.

## 11. Model danych (Supabase Postgres)

Poniższy model jest opisem tabel w Postgresie (zarządzanych przez Supabase). Nie używamy Prisma.

### 11.1 `users`

- `id` (uuid, PK)
- `auth_user_id` (uuid, unique, not null) — mapowanie użytkownika Supabase Auth → rekord w DB
- `name` (text, not null)
- `email` (text, unique, not null)
- `avatar` (text, default '')
- `plan` (text, default 'basic') — `basic` / `premium`
- `created_at`, `updated_at` (timestamptz)

### 11.2 `lists`

- `id` (uuid, PK)
- `name` (text, not null)
- `type` (text, not null) — w MVP zawsze `shopping`; CHECK / enum obejmuje też `movies` / `books` / `travel` / `gifts` (**POST-MVP**, już w DB Plan)
- `owner_id` (uuid, FK → `users.id`, not null)
- `created_at`, `updated_at` (timestamptz)

### 11.3 `list_members`

- `list_id` (uuid, FK → `lists.id`, not null)
- `user_id` (uuid, FK → `users.id`, not null)
- `role` (text, not null) — `owner` / `member`
- `joined_at` (timestamptz)
- Unique: (`list_id`, `user_id`)

### 11.4 `list_items`

- `id` (uuid, PK)
- `list_id` (uuid, FK → `lists.id`, not null)
- `name` (text, not null)
- `category` (text, default 'Inne')
- `is_checked` (boolean, default false)
- `quantity` (text, null)
- `note` (text, null)
- `link` (text, null)
- `added_by` (uuid, FK → `users.id`, not null)
- `created_at`, `updated_at` (timestamptz)

### 11.5 `invitations`

- `id` (uuid, PK)
- `list_id` (uuid, FK → `lists.id`, not null)
- `code` (text, unique, not null)
- `expires_at` (timestamptz, not null)
- `used_at` (timestamptz, null)
- `used_by` (uuid, FK → `users.id`, null)
- `created_at` (timestamptz)

### 11.6 `category_dictionary`

- `id` (uuid, PK)
- `item_name` (text, not null) — znormalizowana nazwa (wg §7.2)
- `list_type` (text, not null)
- `category` (text, not null)
- `usage_count` (int, default 1)
- `confidence` (float, default 0.7) — znaczenie wg §7.6
- `source` (text, default `'ai'`) — źródło wpisu w słowniku
- `created_at`, `updated_at` (timestamptz)
- Unique: (`item_name`, `list_type`)

**Indeksy:** composite dla exact lookup; rozszerzenie `pg_trgm` + GIN na `item_name` dla fuzzy (§7.3).

### 11.7 `categories` (zalecane)

Katalog dozwolonych kategorii per `list_type` (zsynchronizowany z §8):

- `id` (uuid, PK)
- `list_type` (text, not null)
- `name` (text, not null)

Unique lub constraint: (`list_type`, `name`) — do ustalenia przy migracji.

## 12. Endpointy API (REST)

### Auth

| Metoda | Endpoint | Opis                                                                                    |
| ------ | -------- | --------------------------------------------------------------------------------------- |
| —      | —        | W MVP brak własnych endpointów auth (logowanie i sesja obsługiwane przez Supabase Auth) |

### Lists

| Metoda | Endpoint            | Opis                                                                                                                                                                                    |
| ------ | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/v1/lists`     | Pobierz listy: parametr query `scope` — `owned` (listy własne, domyślnie) lub `shared` (listy współdzielone: użytkownik jest członkiem, nie właścicielem); paginacja `limit` / `offset` |
| POST   | `/api/v1/lists`     | Utwórz nową listę                                                                                                                                                                       |
| GET    | `/api/v1/lists/:id` | Pobierz szczegóły listy                                                                                                                                                                 |
| PATCH  | `/api/v1/lists/:id` | Edytuj listę (nazwa)                                                                                                                                                                    |
| DELETE | `/api/v1/lists/:id` | Usuń listę (tylko właściciel)                                                                                                                                                           |

### List Items

| Metoda | Endpoint                                    | Opis                                                                 |
| ------ | ------------------------------------------- | -------------------------------------------------------------------- |
| GET    | `/api/v1/lists/:id/items`                   | Pobierz elementy listy                                               |
| POST   | `/api/v1/lists/:id/items/bulk`              | Dodaj elementy masowo (z kategoryzacją; także potwierdzenie importu) |
| POST   | `/api/v1/lists/:id/recipe-import/preview`   | AI: wyciągnij składniki z URL przepisu (bez zapisu na listę)         |
| PATCH  | `/api/v1/lists/:id/items/:itemId`           | Edytuj element                                                       |
| PATCH  | `/api/v1/lists/:id/items/:itemId/check`     | Zaznacz/odznacz element                                              |
| DELETE | `/api/v1/lists/:id/items/:itemId`           | Usuń element                                                         |
| DELETE | `/api/v1/lists/:id/items/completed`         | Wyczyść ukończone                                                    |

### Members

| Metoda | Endpoint                            | Opis                                                |
| ------ | ----------------------------------- | --------------------------------------------------- |
| GET    | `/api/v1/lists/:id/members`         | Pobierz członków listy                              |
| DELETE | `/api/v1/lists/:id/members/:userId` | Usuń członka (właściciel) lub opuść listę (członek) |

### Invitations

| Metoda | Endpoint                        | Opis                             |
| ------ | ------------------------------- | -------------------------------- |
| POST   | `/api/v1/lists/:id/invitations` | Generuj zaproszenie (kod + link) |
| POST   | `/api/v1/invitations/join`      | Dołącz do listy przez kod        |

## 13. Styl wizualny

- **Kolorystyka**: pastelowe kolory.
- **Czcionka**: CabinetGrotesk.
- **Komponenty**: NativeWind (Tailwind CSS), zaokrąglone rogi.
- **Ekran Home**: bento grid z grafikami/ilustracjami na kafelkach.
- **Ikony**: do wyboru (Lucide / Phosphor Icons lub inna biblioteka).
- **Design**: wzorowany na wewnętrznym designie firmowym.

## 14. Co NIE wchodzi w zakres MVP

- **Inne typy list w UI** (`movies`, `books`, `travel`, `gifts`) — schemat, CHECK i katalog kategorii **istnieją** (POST-MVP); użytkownik MVP tworzy wyłącznie `shopping`.
- Ekran „Rodzaje list" i wybór typu przy tworzeniu listy (POST-MVP).
- Niestandardowe typy list (własne kategorie użytkownika).
- Szczegółowe opisy typów list.
- Automatyczny import z przepisu **bez** podglądu i edycji.
- Tryb offline i zaawansowana obsługa konfliktów.
- Powiadomienia push.
- Powiadomienia in-app (badge'e).
- Rozbudowane integracje (sklepy, kalendarze; integracje IMDB/Goodreads — wraz z typami list POST-MVP).
- Mikrozarządzanie AI (ręczne trenowanie modelu).
- Ręczna zmiana kategorii elementu przez użytkownika z zapisem do słownika (`confidence` = 1,0 — patrz §7.6).
- Wersja webowa (Expo Web).
- Testy automatyczne (unit, integration, e2e).
- Szyfrowanie danych.
- Onboarding z możliwością powrotu (np. z profilu).
- Zaawansowany profil (zmiana nazwy, avatara, usunięcie konta).
- Filtrowanie/wyszukiwanie list.

## 15. Kryteria sukcesu

1. Działająca aplikacja mobilna (iOS/Android) z pełnym flow: rejestracja → tworzenie list zakupowych → dodawanie produktów → kategoryzacja AI → import z przepisu (podgląd + edycja) → współdzielenie → synchronizacja real-time.
2. Działające Supabase (Auth + DB + Realtime) oraz serwerowe funkcje (Edge Functions) dla operacji wymagających ukrycia sekretów i kontroli limitów (AI/bulk, recipe preview, limity, logika zaproszeń).
3. Skuteczność AI (kategoryzacja zakupowa) ≥ 90% poprawnych kategoryzacji bez interwencji użytkownika.
4. Globalny słownik kategorii (exact + fuzzy) redukuje wywołania AI o ≥ 50% po pierwszym miesiącu użytkowania; fuzzy dodatkowo obniża liczbę wywołań względem samego exact match.
5. Import z przepisu: użytkownik zawsze widzi edytowalny podgląd przed zapisem na listę.

## 16. Rekomendowana kolejność implementacji

Przy jednej osobie w zespole (full-stack), rekomendowana kolejność:

1. **Auth + model danych** — Supabase Auth, tabele w Supabase (Postgres), podstawowy CRUD użytkowników; seed kategorii **tylko `shopping`** (pozostałe typy w CHECK — gotowe na POST-MVP).
2. **CRUD list i elementów** — tworzenie list zakupowych, edycja, usuwanie list i elementów (bez AI).
3. **Współdzielenie z zaproszeniami** — generowanie kodów, dołączanie, role, zarządzanie członkami.
4. **Kategoryzacja AI** — integracja z OpenRouter, globalny słownik (exact + fuzzy, `pg_trgm`, progi z §7), tabela `categories`, masowe dodawanie, pola `confidence` / `source` w słowniku.
5. **Import z przepisu** — preview Edge Function + ekran podglądu/edycji + potwierdzenie przez bulk.
6. **Real-time sync** — Supabase Realtime (Postgres Changes), (opcjonalnie) Presence/Broadcast.
7. **Deep linking** — `listastic://invite/{code}`, fallback na stronę.
8. **Onboarding** — 3 slajdy, jednorazowe wyświetlanie.
9. **Polish i bezpieczeństwo** — rate limiting, limity AI, walidacja, stany puste, UI/UX.

## 17. Nierozwiązane kwestie (do ustalenia)

1. **Plany basic vs premium** — różnice funkcjonalne i limity.
2. **Limity per plan** — liczba list, elementów, członków, wywołań AI (w tym recipe preview).
3. **Warstwa serwerowa** — czy wszystko poza AI/bulk/recipe robimy przez bezpośredni dostęp do DB (RLS), czy dokładamy więcej Edge Functions.
4. **Jednostki (unit)** — predefiniowane jednostki dla ilości produktów.
5. **Grafiki na kafelkach Home** — wymagane zasoby graficzne.
6. **Monetyzacja** — model (subskrypcja, jednorazowy zakup, freemium).
7. **Konkretne progi rate limiting** — ile requestów/minutę, czas blokady.
8. **Konkretne limity AI** — ile wywołań dziennie/miesięcznie per użytkownik.
9. **Relacja `list_items.category` ↔ `categories`** — wyłącznie tekstowa zgodność nazw czy FK po `id` — decyzja przy implementacji modelu (DB Plan: przyjęto `category_id`).
10. **Źródła przepisów** — które domeny / formaty HTML są wspierane w MVP; fallback gdy strona blokuje scrapowanie.
11. **POST-MVP: włączenie innych typów list** — seed kategorii §8.2–8.5, UI wyboru typu, ewentualne integracje zewnętrzne.
