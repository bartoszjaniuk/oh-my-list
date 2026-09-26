# Listastic — schemat bazy danych PostgreSQL (MVP)

Dokument opisuje model logiczny i fizyczny dla Supabase Postgres: tabele, relacje, indeksy, ograniczenia oraz polityki RLS. Przyjęto normalizację do **3NF** z uzasadnionymi wyjątkami (np. `category_dictionary` jako globalny słownik pod fuzzy lookup). Relacja **`list_items` ↔ `categories`** rozstrzygnięta jako **FK po `category_id`** (zamiast luźnego `text`), z walidacją zgodności typu listy z kategorią (trigger / constraint).

> **Zakres MVP vs POST-MVP:** Produkt MVP używa wyłącznie list typu **`shopping`**. CHECK na `lists.type` / `categories.list_type` / `category_dictionary.list_type` **już obejmuje** wartości `movies`, `books`, `travel`, `gifts` — to celowe przygotowanie schematu pod **POST-MVP** (włączenie innych rodzajów list bez migracji enum). Seed kategorii i słownika w MVP dotyczy **shopping**; seed pozostałych typów może być odłożony lub dodany z góry jako nieaktywny w UI. Import z przepisu (PRD §4.14) **nie wymaga nowej tabeli** w MVP (preview jest efemeryczny; zapis idzie przez `list_items`).

---

## 1. Lista tabel z kolumnami, typami i ograniczeniami

### 1.1. `public.users`

Profil aplikacji powiązany z `auth.users` (Supabase Auth). Nie zastępuje tabeli `auth.users`.

| Kolumna | Typ | Ograniczenia / domyślne |
|---------|-----|-------------------------|
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| `auth_user_id` | `uuid` | `NOT NULL`, `UNIQUE`, `REFERENCES auth.users(id) ON DELETE CASCADE` |
| `name` | `text` | `NOT NULL` |
| `email` | `text` | `NOT NULL`; unikalność: `UNIQUE` na `lower(email)` (indeks unikalny częściowy lub `citext` jeśli włączone) |
| `avatar` | `text` | `NOT NULL`, `DEFAULT ''` |
| `plan` | `text` | `NOT NULL`, `DEFAULT 'basic'`, `CHECK (plan IN ('basic', 'premium'))` |
| `onboarding_completed_at` | `timestamptz` | `NULL` — brak = onboarding nieukończony (PRD: jednorazowo po pierwszym logowaniu) |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` |
| `updated_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` |

**Uwagi:** Email przechowywany **lowercase** (sesja); aktualizacja maila poza MVP. `plan` pod przyszłe limity (wartości TBD w PRD §17).

---

### 1.2. `public.lists`

| Kolumna | Typ | Ograniczenia / domyślne |
|---------|-----|-------------------------|
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| `name` | `text` | `NOT NULL`, `CHECK (char_length(trim(name)) > 0)` |
| `type` | `text` | `NOT NULL`, `CHECK (type IN ('shopping', 'movies', 'books', 'travel', 'gifts'))` — **MVP:** aplikacja/API tworzy wyłącznie `shopping`; pozostałe wartości = **POST-MVP** (już w schemacie) |
| `owner_id` | `uuid` | `NOT NULL`, `REFERENCES public.users(id) ON DELETE RESTRICT` |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` |
| `updated_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` |

**Spójność właściciela:** wymóg, aby istniał dokładnie jeden wiersz w `list_members` z `role = 'owner'` i `user_id = owner_id` dla tej samej listy — **constraint deferrable** lub **trigger** `AFTER INSERT/UPDATE` na `lists` i `list_members`.

---

### 1.3. `public.list_members`

Członkostwo; właściciel jest także rekordem z `role = 'owner'` (sesja).

| Kolumna | Typ | Ograniczenia / domyślne |
|---------|-----|-------------------------|
| `list_id` | `uuid` | `NOT NULL`, `REFERENCES public.lists(id) ON DELETE CASCADE` |
| `user_id` | `uuid` | `NOT NULL`, `REFERENCES public.users(id) ON DELETE CASCADE` |
| `role` | `text` | `NOT NULL`, `CHECK (role IN ('owner', 'member'))` |
| `joined_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` |

**Klucz główny:** `PRIMARY KEY (list_id, user_id)`.

**Ograniczenia:**

- `UNIQUE (list_id, user_id)` — pokryte przez PK.
- **Maks. 11 uczestników na listę** (10 członków + właściciel — sesja): realizacja przez **trigger** `BEFORE INSERT` na `list_members` zliczający wiersze dla `list_id` (albo licznik w aplikacji/Edge Function; trigger jako twarda gwarancja).

---

### 1.4. `public.categories`

Katalog dozwolonych kategorii per `list_type` (PRD §7.4, §8); seed zgodny z §8 + wiersz **„Inne”** dla każdego `list_type` (fallback AI / słownik).

**MVP:** obowiązkowy seed dla `list_type = 'shopping'` (PRD §8.1). Seed dla `movies` / `books` / `travel` / `gifts` (PRD §8.2–8.5) jest **opcjonalny w MVP** i wymagany przy włączeniu typów w **POST-MVP** — CHECK i model już je wspierają.

| Kolumna | Typ | Ograniczenia / domyślne |
|---------|-----|-------------------------|
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| `list_type` | `text` | `NOT NULL`, ten sam `CHECK` co `lists.type` (wszystkie 5 wartości w schemacie; MVP używa `shopping`) |
| `name` | `text` | `NOT NULL` |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` |

**Ograniczenia:**

- `UNIQUE (list_type, name)`.
- Opcjonalnie: `CHECK (char_length(trim(name)) > 0)`.

---

### 1.5. `public.list_items`

| Kolumna | Typ | Ograniczenia / domyślne |
|---------|-----|-------------------------|
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| `list_id` | `uuid` | `NOT NULL`, `REFERENCES public.lists(id) ON DELETE CASCADE` |
| `name` | `text` | `NOT NULL`, `CHECK (char_length(name) <= 200 AND char_length(trim(name)) > 0)` |
| `category_id` | `uuid` | `NOT NULL`, `REFERENCES public.categories(id) ON DELETE RESTRICT` |
| `is_checked` | `boolean` | `NOT NULL`, `DEFAULT false` |
| `quantity` | `text` | `NULL` |
| `note` | `text` | `NULL` |
| `link` | `text` | `NULL` |
| `added_by` | `uuid` | `NOT NULL`, `REFERENCES public.users(id) ON DELETE RESTRICT` — usuwanie użytkownika z `users` wymaga wcześniejszej obsługi treści lub soft-delete konta |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` |
| `updated_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` |

**Spójność kategorii z typem listy:** `category_id` musi wskazywać kategorię, której `categories.list_type` = `lists.type` dla `list_items.list_id`. Wymuszenie: **trigger** `BEFORE INSERT OR UPDATE` na `list_items` lub join-check w mutacji (Edge Function + trigger jako zabezpieczenie).

**Konflikty (PRD §9.3):** klient wysyła `updated_at`; akceptacja zapisu tylko gdy nowsze niż w DB — logika w **Edge Function / RPC** lub polityka `UPDATE` z warunkiem `WHERE updated_at < incoming` (wtedy `updated_at` musi być explicite ustawiane tylko przy sukcesie). Przy bezpośrednim `UPDATE` z klienta zalecane **RPC** z porównaniem timestampów. **`updated_at` aktualizowany także przy zmianie `is_checked`** (sesja).

---

### 1.6. `public.invitations`

| Kolumna | Typ | Ograniczenia / domyślne |
|---------|-----|-------------------------|
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| `list_id` | `uuid` | `NOT NULL`, `REFERENCES public.lists(id) ON DELETE CASCADE` |
| `code` | `text` | `NOT NULL`, `UNIQUE`; format: 6 znaków, uppercase, alfabet bez mylących znaków (np. `CHECK (code ~ '^[A-HJ-NP-Z2-9]{6}$')` — dopasować do generatora w kodzie) |
| `expires_at` | `timestamptz` | `NOT NULL` |
| `used_at` | `timestamptz` | `NULL` |
| `used_by` | `uuid` | `NULL`, `REFERENCES public.users(id) ON DELETE SET NULL` |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` |
| `revoked_at` | `timestamptz` | `NULL` — wypełniane przy unieważnieniu przy rotacji kodu (sesja) |
| `superseded_by` | `uuid` | `NULL`, `REFERENCES public.invitations(id) ON DELETE SET NULL` |

**Reguły biznesowe (PRD §6):** ważność do `expires_at` lub do pierwszego użycia (`used_at`); zaproszony musi mieć konto. **Jeden aktywny kod na listę** (sesja): przy nowym kodzie poprzedni oznaczany `revoked_at` / `superseded_by` w jednej transakcji.

**Częściowy indeks unikalny (opcjonalny):** jeden aktywny nieużyty nieunieważniony na listę — np. `UNIQUE (list_id) WHERE used_at IS NULL AND revoked_at IS NULL` (PostgreSQL partial unique index), jeśli produkt wymaga dokładnie jednego aktywnego zaproszenia naraz.

---

### 1.7. `public.category_dictionary`

Globalny słownik: `(item_name, list_type)` unikalne; `item_name` znormalizowany (PRD §7.2).

| Kolumna | Typ | Ograniczenia / domyślne |
|---------|-----|-------------------------|
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| `item_name` | `text` | `NOT NULL` — znormalizowana nazwa |
| `list_type` | `text` | `NOT NULL`, ten sam `CHECK` co `lists.type` — MVP: wpisy dla `shopping`; inne typy = **POST-MVP** |
| `category_id` | `uuid` | `NOT NULL`, `REFERENCES public.categories(id) ON DELETE RESTRICT` |
| `usage_count` | `integer` | `NOT NULL`, `DEFAULT 1`, `CHECK (usage_count >= 0)` |
| `confidence` | `double precision` | `NOT NULL`, `DEFAULT 0.7` — sens wg PRD §7.6 |
| `source` | `text` | `NOT NULL`, `DEFAULT 'ai'` — np. `'ai'`, przyszło: `'user'` |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` |
| `updated_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` |

**Ograniczenia:**

- `UNIQUE (item_name, list_type)`.
- Spójność: `categories.list_type` = `category_dictionary.list_type` dla wskazanego `category_id` — **trigger** lub walidacja w Edge Function.

**Rozszerzenie:** `CREATE EXTENSION IF NOT EXISTS pg_trgm;` (PRD §3, §7.3).

---

### 1.8. (Opcjonalnie MVP+) `public.user_ai_usage`

Tabela pomocnicza pod **limity wywołań AI** per użytkownik / okres (PRD §10; wartości TBD). Można zastąpić licznikami w Edge + cache; jeśli w DB:

| Kolumna | Typ | Ograniczenia |
|---------|-----|----------------|
| `user_id` | `uuid` | `REFERENCES public.users(id) ON DELETE CASCADE` |
| `period_start` | `date` lub `timestamptz` | początek okresu rozliczeniowego |
| `calls_count` | `integer` | `NOT NULL`, `DEFAULT 0`, `CHECK (calls_count >= 0)` |

`PRIMARY KEY (user_id, period_start)` lub podobnie — do doprecyzowania przy wdrożeniu limitów.

---

## 2. Relacje między tabelami

| Relacja | Kardynalność | Opis |
|---------|----------------|------|
| `auth.users` → `public.users` | 1 : 0..1 | Jedno konto Auth → jeden profil (`auth_user_id` unikalny). |
| `public.users` → `public.lists` | 1 : N | Właściciel list (`owner_id`). |
| `public.lists` ↔ `public.users` (przez `list_members`) | N : M | Członkostwo; **tabela łącząca** `list_members` z atrybutem `role`. |
| `public.lists` → `public.list_items` | 1 : N | Elementy listy. |
| `public.lists.type` → `public.categories` | 1 : N | Kategorie dla danego typu listy (filtrowanie po `list_type`, nie FK z `lists` — ta sama wartość tekstowa). |
| `public.categories` → `public.list_items` | 1 : N | `list_items.category_id`. |
| `public.lists` → `public.invitations` | 1 : N | Wiele rekordów historycznych kodów; jeden „aktywny” wg reguł biznesowych. |
| `public.users` → `public.list_items` | 1 : N | `added_by`. |
| `public.category_dictionary` | N : 1 | do `categories` przez `category_id`; słownik globalny per `(item_name, list_type)`. |

**Uwaga:** Brak relacji M:N poza członkostwem (`list_members`) w MVP.

---

## 3. Indeksy

| Tabela | Indeks | Cel |
|--------|--------|-----|
| `users` | `UNIQUE (auth_user_id)` | Logowanie / mapowanie JWT → profil. |
| `users` | `UNIQUE` na `lower(email)` | Wyszukiwanie i unikalność emaila. |
| `lists` | `(owner_id)` | Listy właściciela, sortowanie po `updated_at` (poniżej). |
| `lists` | `(owner_id, updated_at DESC)` | Segment „Moje listy” ekranu ListsScreen — ostatnio edytowane (PRD §4.5). |
| `list_members` | `(user_id)` | Segment „Listy współdzielone” (`GET /lists?scope=shared`) — członkostwo z joinem do `lists` (PRD §4.5). |
| `list_members` | `(list_id)` | Lista członków, zliczanie limitu 11. |
| `list_items` | `(list_id, created_at ASC)` | Elementy chronologicznie w kategorii (PRD §4.8). |
| `list_items` | `(list_id)` | Ogólne zapytania po liście. |
| `list_items` | `(list_id, updated_at DESC)` | Opcjonalnie pod sortowanie / sync. |
| `categories` | `(list_type)` | Filtr kategorii dla typu listy. |
| `invitations` | `(code)` | `UNIQUE` już wspiera lookup; dodatkowo `WHERE` po aktywnych jeśli częściowy indeks po `code` nie jest konieczny. |
| `invitations` | `(list_id) WHERE used_at IS NULL AND revoked_at IS NULL` | Aktywne zaproszenia per lista (częściowy). |
| `category_dictionary` | `UNIQUE (item_name, list_type)` | Exact match (PRD §7.3). |
| `category_dictionary` | `GIN (item_name gin_trgm_ops)` | Fuzzy match `pg_trgm`, próg similarity ≥ 0,7 w zapytaniu (PRD §7.3). |

**Realtime (PRD §9):** indeksy po `list_id` na `list_items`, `list_members`, `invitations` wspierają filtrowanie subskrypcji po konkretnej liście.

---

## 4. Zasady PostgreSQL (RLS)

Włączyć `ROW LEVEL SECURITY` na tabelach: `users`, `lists`, `list_members`, `list_items`, `invitations`, `categories`, `category_dictionary` (oraz opcjonalnie `user_ai_usage`). Realtime respektuje RLS — tylko członkowie widzą zmiany (PRD §9.1, §10).

### 4.1. Funkcje pomocnicze (wzór)

- `public.is_list_member(p_list_id uuid, p_auth_uid uuid) RETURNS boolean`  
  Sprawdza, czy `auth.uid()` mapuje się na `users.auth_user_id` i czy istnieje `(list_id, user_id)` w `list_members`.

- `public.is_list_owner(p_list_id uuid, p_auth_uid uuid) RETURNS boolean`  
  Jak wyżej + `role = 'owner'` w `list_members`.

- `public.current_app_user_id() RETURNS uuid`  
  `SELECT id FROM public.users WHERE auth_user_id = auth.uid()` (cache w `STABLE` / bezpieczne użycie w politykach).

### 4.2. Polityki — ogólne założenia

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `users` | Własny wiersz (`auth_user_id = auth.uid()`); opcjonalnie inni użytkownicy widoczni tylko jako **członkowie wspólnych list** (PRD: nazwa + avatar na liście członków) — np. `EXISTS` join przez `list_members`. | Tylko własny profil (trigger po rejestracji z Auth) lub wyłącznie `service_role`. | Tylko własny wiersz. | Zwykle brak dla klienta; `ON DELETE` z Auth po stronie serwera. |
| `lists` | Członkowie listy (`is_list_member`). | Użytkownik tworzy listę jako `owner_id = current_app_user_id()`; jednocześnie insert do `list_members` (transakcja / RPC). | Członkowie (PRD: edycja nazwy owner i member). | Tylko `is_list_owner`. |
| `list_members` | Członkowie tej samej listy. | Owner: dodawanie członków z limitem 11; dołączenie przez invite flow — często **tylko przez RPC** z `SECURITY DEFINER` walidującym kod. | Ograniczone (np. zmiana roli tylko service). | Owner usuwa członków (nie siebie); członek może usunąć **tylko swój** wiersz (opuść listę). |
| `list_items` | Członkowie listy. | Członkowie; `added_by = current_app_user_id()`. | Członkowie; opcjonalnie RPC pod last-write-wins. | Członkowie. |
| `invitations` | Członkowie listy (PRD §10: zaproszenia widoczne dla uprawnionych). | Członkowie (PRD §5: owner i member zapraszają) — lub wyłącznie Edge Function + `service_role` dla prostoty. | Rzadko (unieważnienie) — owner/member wg produktu. | Owner lub system. |
| `categories` | **Wszyscy uwierzytelnieni** (katalog statyczny) lub członkowie — w MVP zwykle read-only dla zalogowanych. | Tylko `service_role` / migracje (seed). | Tylko `service_role`. | Tylko `service_role`. |
| `category_dictionary` | **SELECT** dla uwierzytelnionych jeśli Edge Function robi lookup serwerowo; jeśli klienci nie czytają słownika bezpośrednio — dostęp tylko dla `service_role` i funkcji `SECURITY DEFINER`. **INSERT/UPDATE** — preferencyjnie **tylko** przez Edge Function (klucz OpenRouter), ewentualnie rozszerzone polityki z kontrolą rate limit. | | | |

**Funkcje z `SECURITY DEFINER`:** operacje join przez zaproszenie, bulk items, inkrementacja `usage_count` w jednej transakcji — z minimalnym zestawem uprawnień (`SET search_path = public`).

**Rola `service_role`:** omija RLS — wyłącznie backend (Edge Functions), nigdy w aplikacji mobilnej.

---

## 5. Funkcje PostgreSQL (RPC / SECURITY DEFINER)

Funkcje wywoływane przez Edge Functions przez klienta `service_role`. Oznaczenie `SECURITY DEFINER` + `SET search_path = public` zapewnia ochronę przed path-injection i pozwala pomijać RLS w ściśle kontrolowany sposób.

| Funkcja | Plik migracji | Opis |
|---------|--------------|------|
| `public.create_list(p_name text, p_type text, p_owner_id uuid) RETURNS public.lists` | `20260411000000_create_list_rpc.sql` | Atomowo wstawia rekord do `lists` i `list_members` (role `'owner'`) w jednej transakcji PL/pgSQL. Zwraca pełny wiersz `lists`. |
| `public.current_app_user_id() RETURNS uuid` | `20260407184500_sync_auth_users_to_public_users.sql` lub osobna migracja | Mapuje `auth.uid()` → `public.users.id`; używana w politykach RLS jako `STABLE`. |
| `public.is_list_member(p_auth_uid uuid, p_list_id uuid) RETURNS boolean` | `20260407183000_fix_rls_recursion_policies.sql` | Sprawdza członkostwo bez rekurencji w RLS. |
| `public.is_list_owner(p_auth_uid uuid, p_list_id uuid) RETURNS boolean` | `20260407183000_fix_rls_recursion_policies.sql` | Jak wyżej, dodatkowo `role = 'owner'`. |

### Konwencje tworzenia funkcji RPC

- Zawsze `SECURITY DEFINER` + `SET search_path = public` dla funkcji omijających RLS.
- Parametry prefiksowane `p_` (np. `p_name`, `p_owner_id`), zmienne lokalne `v_` — unikanie kolizji z nazwami kolumn.
- Wywołanie z Edge Function przez klienta `service_role` przez `supabase.rpc("nazwa_funkcji", { ... })`.
- Wynik mapowany na DTO po stronie TypeScript (Edge Function) — nigdy nie ujawniamy surowych wierszy DB klientowi mobilnemu.

---

## 6. Historia migracji

| Plik | Zawartość |
|------|-----------|
| `20260403120000_enable_pg_trgm.sql` | Włączenie rozszerzenia `pg_trgm`. |
| `20260403120100_create_users.sql` | Tabela `public.users` + RLS. |
| `20260403120200_create_categories_seed.sql` | Tabela `public.categories` + dane seed (**MVP:** `shopping`; opcjonalnie pozostałe typy pod POST-MVP). |
| `20260403120300_create_lists.sql` | Tabela `public.lists` + RLS + indeksy. CHECK `type` obejmuje wszystkie 5 wartości (POST-MVP-ready). |
| `20260403120400_create_list_members.sql` | Tabela `public.list_members` + RLS + trigger limitu 11 uczestników. |
| `20260403120500_create_list_items.sql` | Tabela `public.list_items` + RLS + indeksy. |
| `20260403120600_create_invitations.sql` | Tabela `public.invitations` + RLS. |
| `20260403120700_create_category_dictionary.sql` | Tabela `public.category_dictionary` + GIN index `pg_trgm`. |
| `20260403120800_create_user_ai_usage.sql` | Tabela `public.user_ai_usage` + RLS. |
| `20260403120900_seed_category_dictionary_shopping.sql` | Dane seed słownika dla typu `shopping`. |
| `20260407181700_fix_rls_recursion.sql` | Naprawa nieskończonej rekurencji w politykach RLS. |
| `20260407183000_fix_rls_recursion_policies.sql` | Funkcje `is_list_member`, `is_list_owner` + zaktualizowane polityki. |
| `20260407184500_sync_auth_users_to_public_users.sql` | Trigger/funkcja synchronizacji `auth.users` → `public.users`. |
| `20260411000000_create_list_rpc.sql` | Funkcja RPC `create_list` — atomowe tworzenie listy z właścicielem. |

---

## 7. Dodatkowe uwagi i decyzje projektowe

1. **`category` (text) w PRD §11.4 vs `category_id`:** Przyjęto **`category_id` → `categories`** dla integralności, seed „Inne” per `list_type`, oraz wyświetlanie etykiety przez join. Odpowiada to „zalecanej” tabeli `categories` (PRD §7.4) i rozwiązuje nierozwiązany punkt PRD §17.9 na rzecz modelu relacyjnego.

2. **`category_dictionary.category` jako tekst w PRD:** Zmapowano na **`category_id`** z tą samą logiką walidacji co elementy listy; `list_type` + `category_id` muszą być spójne.

3. **Normalizacja nazw (§7.2):** Wykonanie w Edge Function przed zapisem; opcjonalny trigger `BEFORE INSERT/UPDATE` na `category_dictionary.item_name` jako dodatkowa ochrona (sesja).

4. **Atomowy `usage_count` (sesja):** `INSERT ... ON CONFLICT (item_name, list_type) DO UPDATE SET usage_count = category_dictionary.usage_count + 1, ...` w jednej transakcji.

5. **Sortowanie kategorii w UI:** Alfabetycznie po `categories.name`, „Inne” zawsze na końcu — logika aplikacji (PRD §4.8), ewentualnie kolumna `sort_key` w `categories` post-MVP.

6. **Indeks `lists.updated_at`:** Rozważyć trigger `AFTER INSERT OR UPDATE` na `list_items` aktualizujący `lists.updated_at`, aby segment „Moje listy” na ListsScreen mógł sortować po ostatniej aktywności na liście (PRD §4.5).

7. **Migracje:** Kolejność zgodna z tabelą w sekcji 6. Każda nowa migracja zawiera komentarz-nagłówek z opisem celu, tabel i ewentualnych efektów ubocznych.

8. **Plany i limity AI (PRD §17):** Kolumna `users.plan` przygotowuje model; limity liczbowe w konfiguracji lub przyszłej tabeli `user_ai_usage`.

9. **Rate limit generowania zaproszeń (sesja, 1/10 min):** Implementacja w Edge Function + opcjonalna tabela cooldownów lub cache; nie jest częścią rdzeniowego schematu relacyjnego.

10. **Bez Prisma (PRD §11):** Migracje SQL (Supabase CLI).

11. **Funkcje RPC a RLS:** Funkcje `SECURITY DEFINER` omijają RLS — wywoływane wyłącznie przez klienta `service_role` wewnątrz Edge Functions. Klient mobilny nigdy nie ma dostępu do `service_role`. Każda nowa funkcja RPC musi być udokumentowana w sekcji 5 niniejszego planu.

12. **Typy list poza `shopping`:** Wartości CHECK są celowo szersze niż UI MVP. Włączenie `movies` / `books` / `travel` / `gifts` w POST-MVP = seed kategorii + odblokowanie `POST /lists` w API — **bez zmiany kształtu tabel**.

13. **Import z przepisu (PRD §4.14 / API Plan §2.3.1):** Brak tabeli `recipe_imports` w MVP. Preview jest odpowiedzią Edge Function; potwierdzenie zapisuje wiersze w `list_items` (z `quantity` gdy podane). Opcjonalny log audytu URL / wyników AI = POST-MVP.

---

*Dokument stanowi podstawę pod migracje; szczegóły typów (`double precision` vs `numeric` dla `confidence`) można ujednolicić przy pierwszej migracji.*
