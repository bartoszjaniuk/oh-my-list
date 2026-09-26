# Analiza: wyświetlanie listy list (listastic/mobile)

Źródło: `/Users/bartoszjaniuk/private/listastic/mobile`  
Zakres: `src/api/lists/*`, ekran `src/app/(protected)/lists/index.tsx` + feature overview  
Cel: wzorzec do przepisania w **oh-my-list**

---

## Analysis progress

- [x] Step 1: Repository structure
- [x] Step 2: Dependencies and scripts
- [x] Step 3: App architecture (Router, features, shared)
- [x] Step 4: UI / design-system patterns
- [x] Step 5: Data, auth, and side effects
- [x] Step 6: Native modules / platform splits
- [x] Step 7: Testing approach
- [x] Step 8: Duplication and dead code risks
- [x] Step 9: Short findings summary

---

## 1. Struktura (lists overview)

```
src/app/(protected)/lists/
  _layout.tsx          # Stack: index + [id]
  index.tsx            # cienki route → ListsScreen
  [id].tsx             # szczegóły (poza zakresem UI overview)

src/api/lists/
  lists.ts             # fetch do Edge Functions
  lists.models.ts      # ListSummary, ListScope, GetLists*
  lists.queryKeys.ts   # query-key-factory
  lists.utils.ts       # normalize + invalidate*
  lists.consts.ts      # DEFAULT_LIMIT/OFFSET
  hooks/
    useListsQuery.ts
    useListsRealtime.ts
    useOwnedListsQuery.ts / useSharedListsQuery.ts  # cienkie wrappery
    useDeleteListMutation.ts
    …

src/features/lists/overview/
  hooks/useListsScreen.ts      # orchestracja ekranu
  components/ListHeader.tsx
  components/ListCard.tsx
  components/OwnedListSwipeRow.tsx
  components/ListSegmentControl.tsx
  components/ListTypeFilterModal.tsx
  components/ListOverviewListEmptyContent.tsx
  utils/…
```

**Wzorzec warstw:** route (Expo Router) → screen hook → API hooks → Edge Function. UI i logika poza `app/`.

---

## 2. Zależności (relewantne)

| Listastic | oh-my-list (już ma) |
|-----------|---------------------|
| Expo ~54, RQ 5.x, query-key-factory | Expo ~57, RQ, query-key-factory |
| `@supabase/supabase-js` + Realtime | Supabase client obecny |
| NativeWind 4 | NativeWind 4 |
| gesture-handler (Swipeable) | gesture-handler obecny |

Endpointy w obu projektach już zbliżone (`oh-my-list/src/api/endpoints.ts`: `lists`, `listItems`, …).

---

## 3. Architektura flow ekranu

```
lists/index.tsx
  └─ useListsScreen()
       ├─ useListsQuery(segment)     # dane (owned | shared)
       ├─ useListsRealtime()         # subskrypcja → invalidate cache
       ├─ useDeleteListMutation()    # swipe delete (tylko owned)
       └─ lokalny state: search, type filter, delete dialog
  └─ FlatList + ListHeader + ListCard / OwnedListSwipeRow
```

- Segment `owned` | `shared` z query param `?type=` (domyślnie `shared` jeśli nie `owned`).
- Filtrowanie po nazwie i typie: **po stronie klienta** (`useMemo` na `data.data`).
- Pull-to-refresh: `refetch` z React Query (`isFetching && !isLoading`).

---

## 4. UI patterns do skopiowania

- **ListHeader:** back, tytuł zależny od segmentu, CTA „nowa lista”, SearchField, filtr typu, `ListSegmentControl`.
- **ListCard:** karta z ikoną typu (pastel), nazwa, etykieta Prywatna/Współdzielona (`member_count > 1`), liczniki items/members, `updated_at`.
- **OwnedListSwipeRow:** `Swipeable` → delete → `ConfirmDialog`.
- Empty / error / loading: `ListOverviewListEmptyContent` (osobny komponent, nie inline w FlatList).
- Styling: NativeWind + tokeny kolorów z design systemu listastic.

W oh-my-list: `Home.screen.tsx` ma pusty `FlatList` — naturalne miejsce na overview albo osobny route jak w listastic.

---

## 5. Data layer

### GET lists (REST / Edge)

`getLists(params)` → `GET {SUPABASE_URL}/functions/v1/lists?limit&offset&scope`

- Auth: `Bearer` access token + `apikey`.
- Odpowiedź: `{ data: ListSummary[], total: number }`.
- `ListSummary`: `id`, `name`, `type`, `owner_id`, `member_count`, `item_count`, `created_at`, `updated_at`.
- `scope`: `"owned" | "shared"` (default w normalize: `"owned"`).
- Limit domyślny: **50**, offset: **0**.

### React Query

```ts
useListsQuery(scope, params?) → useQuery({
  queryKey: queryKeys.lists.list(normalized),
  queryFn: () => getLists(normalized),
})
```

`invalidateListsQuery()` invaliduje cały prefix `listsKeys.list._def` (owned **i** shared).

Mutacje (`create`, `delete`, `join`, rename, …) też wołają `invalidateListsQuery`. Delete ma optimistic update pod konkretny query key scope.

### Realtime

`useListsRealtime` **nie pobiera danych**. Subskrybuje Supabase Postgres Changes na:

- `lists`
- `list_members`
- `list_items`

i przy dowolnym evencie woła `invalidateListsQuery()` → React Query refetchuje aktywne query.

Kanał: `lists-screen:${user.id}`, cleanup `removeChannel` przy unmount / zmianie usera.

---

## 6. Native / platform

- Brak `Platform.OS` w overview lists.
- Wymaga: Gesture Handler (`Swipeable`), Safe Area, FlatList.
- Realtime wymaga włączonych publicaţii RLS/realtime na tych tabelach w Supabase (to samo w oh-my-list, jeśli backend ten sam).

---

## 7. Testy

Brak testów jednostkowych/E2E pod `features/lists` w listastic. Walidacja: ręczne + typecheck/lint.

---

## 8. Duplikacja / ryzyka

| Ryzyko | Opis |
|--------|------|
| Wrappery `useOwnedListsQuery` / `useSharedListsQuery` | Cienkie aliasy; ekran używa bezpośrednio `useListsQuery(segment)` — opcjonalne przy porcie. |
| Broad realtime invalidation | Każda zmiana w `list_items` odświeża **całą** listę list (nawet tylko `item_count`). Proste, ale może spamować refetch. |
| Filtry tylko lokalne | Przy >50 listach paginacja API jest, ale UI nie ładuje kolejnych stron. |
| Podwójne invalidate | Mutacje + realtime mogą refetchować 2× — zwykle OK. |
| Segment default | `initialScopeFromParam`: wszystko poza `"owned"` → `"shared"` (nie `"owned"`). |

---

## 9. Odpowiedź: dlaczego dwa hooki?

### `useListsQuery` vs `useListsRealtime`

**Nie są zamiennikami.** Robią dwie różne rzeczy:

| Hook | Rola | Czy „pobiera listy”? |
|------|------|----------------------|
| `useListsQuery` | **Źródło danych** — React Query + HTTP GET Edge | Tak |
| `useListsRealtime` | **Side effect** — listeners Postgres Changes → `invalidateListsQuery()` | Nie |

Razem: Query = initial load + manual refetch + refetch po invalidacji; Realtime = auto-odświeżenie gdy ktoś inny (lub inna sesja) zmieni listę / członków / itemy.

### Czy oba są potrzebne?

- **MVP / pierwsza iteracja w oh-my-list:** wystarczy **`useListsQuery`** (+ invalidate po własnych mutacjach: create/delete). Pull-to-refresh pokrywa resztę.
- **`useListsRealtime`:** potrzebny, gdy chcesz live sync (współdzielone listy, drugi device, inny użytkownik dodaje item → `item_count` na overview). Bez niego UI się zaktualizuje dopiero po refetch / focus / mutacji lokalnej.

**Rekomendacja przy porcie:** najpierw query + mutacje; realtime dodać w drugim kroku (ten sam pattern co `useListDetailsRealtime` na szczegółach).

---

## Patterns do mirror w oh-my-list

1. `src/api/lists/` — models, `getLists`, query keys, `useListsQuery`, utils invalidate.
2. Cienki route w `app/` + `useListsScreen` + komponenty overview.
3. Segment owned/shared → osobny query key (cache nie miesza scope’ów).
4. Realtime opcjonalnie, osobny hook (nie mieszać subskrypcji w `useListsQuery`).
5. Client-side search/filter na małej liście (limit 50) — OK na start.

## Hotspots

- `useListsScreen` — jedna orchestracja ekranu (dobry punkt kopiowania).
- `invalidateListsQuery` — wspólny kontrakt mutacji i realtime.
- `ListSummary.item_count` — powód nasłuchu `list_items` na overview.

## Stan oh-my-list (kontekst)

- Auth + endpoints lists już są; brak jeszcze `src/api/lists/*` i prawdziwego UI list.
- `Home.screen.tsx` — placeholder FlatList; można tu osadzić overview albo dodać route jak w listastic.
