# API Plan — Listastic MVP

> **Zakres MVP:** produkt i UI obsługują wyłącznie listy typu **`shopping`**. Pole `type` / `list_type` oraz wartości `movies`, `books`, `travel`, `gifts` **pozostają w kontrakcie API i schemacie DB** (już zaprojektowane) — to przygotowanie pod **POST-MVP**. W MVP klient zawsze tworzy i operuje na `shopping`; serwer może odrzucać tworzenie innych typów (`400`) albo akceptować tylko `shopping` przy `POST /lists`.

## 1. Resources

| Resource | Database Table | Description |
|---|---|---|
| **User** | `public.users` | Application profile linked to Supabase Auth identity |
| **List** | `public.lists` | Named list owned by a user; MVP: `type = 'shopping'` only (other types POST-MVP) |
| **List Member** | `public.list_members` | Membership record connecting a user to a list with a role |
| **List Item** | `public.list_items` | An item inside a list, with category and optional metadata |
| **Invitation** | `public.invitations` | Time-limited, single-use invitation code for a list |
| **Category** | `public.categories` | Read-only catalogue of allowed categories per list type (MVP seed: `shopping`; other types POST-MVP) |

> **Architecture note:** All endpoints are implemented as **Supabase Edge Functions** (Deno, TypeScript). They receive a Supabase JWT, validate it, enforce authorization beyond RLS where necessary, and interact with the database via the `service_role` client or authenticated client. Supabase Realtime runs directly from the client (filtered by `list_id`; RLS enforces data visibility).

---

## 2. Endpoints

### 2.1 Users

#### `GET /users/me`
Returns the authenticated user's profile.

**Response 200**
```json
{
  "id": "uuid",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "avatar": "https://...",
  "plan": "basic",
  "onboarding_completed_at": null,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors**
| Code | Message |
|---|---|
| 401 | `unauthorized` — missing or invalid JWT |
| 404 | `user_not_found` — profile does not exist (race condition after signup) |

---

#### `PATCH /users/me`
Update the current user's profile fields.

**Request body**
```json
{
  "name": "Jane Doe"
}
```

**Response 200** — updated user object (same shape as `GET /users/me`)

**Errors**
| Code | Message |
|---|---|
| 400 | `validation_error` — `name` is empty or blank |
| 401 | `unauthorized` |

---

#### `POST /users/me/onboarding`
Mark the onboarding flow as completed. Sets `onboarding_completed_at = now()`. Idempotent: if already set, returns 200 without updating.

**Request body** — empty `{}`

**Response 200**
```json
{
  "onboarding_completed_at": "2024-06-01T10:00:00Z"
}
```

**Errors**
| Code | Message |
|---|---|
| 401 | `unauthorized` |

---

### 2.2 Lists

**Product / client (PRD §4.5):** The mobile app uses a single **ListsScreen** with two segments — **„Moje listy”** (owned lists) and **„Listy współdzielone”** (lists where the user joined as `member`, not owner). Home tiles open the same screen with the matching segment preselected. **One `GET /lists` resource** selects the slice via the **`scope`** query parameter; the client passes `scope=owned` or `scope=shared` when loading or refreshing the matching segment (or relies on the default for „Moje listy”).

#### `GET /lists`
Returns a paginated list of list summaries. Behaviour depends on **`scope`**:

- **`scope=owned`** (default if omitted) — lists **owned** by the authenticated user (`lists.owner_id` = current user). Powers the **„Moje listy”** segment.
- **`scope=shared`** — lists where the user is a **member** with `role = 'member'` in `list_members` (not the owner). Powers the **„Listy współdzielone”** segment. Lists that appear only as owned (user is owner) **do not** appear here; they appear under `scope=owned` only.

Sorted by `updated_at DESC` in both modes. Same response shape for both.

**Query parameters**
| Param | Type | Default | Description |
|---|---|---|---|
| `scope` | string | `owned` | `owned` — lists the user owns; `shared` — lists the user belongs to as a non-owner member |
| `limit` | integer | 50 | Max items per page |
| `offset` | integer | 0 | Pagination offset |

**Response 200**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Grocery run",
      "type": "shopping",
      "owner_id": "uuid",
      "member_count": 3,
      "item_count": 12,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "total": 5
}
```

**Errors**
| Code | Message |
|---|---|
| 400 | `validation_error` — invalid or unknown `scope` |
| 401 | `unauthorized` |

**Implementation notes**

- **`scope=owned`:** filter `lists` by `owner_id = current user` (same aggregation for `member_count` / `item_count` as today).
- **`scope=shared`:** join `list_members` → `lists` where `user_id = current user` and `role = 'member'`; same `ListSummary` + `total` contract.
- **Default:** omitting `scope` MUST behave like `scope=owned` for backward compatibility with existing clients.

---

#### `POST /lists`
Create a new list. The calling user becomes the owner. Atomically inserts a `list_members` record with `role = 'owner'`.

**MVP:** lists are always created as **`type: "shopping"`**. Client may omit `type` (server defaults to `shopping`) or send `"shopping"` explicitly.

**Request body**
```json
{
  "name": "Weekend shopping",
  "type": "shopping"
}
```

**Response 201**
```json
{
  "id": "uuid",
  "name": "Weekend shopping",
  "type": "shopping",
  "owner_id": "uuid",
  "member_count": 1,
  "item_count": 0,
  "created_at": "...",
  "updated_at": "..."
}
```

**Errors**
| Code | Message |
|---|---|
| 400 | `validation_error` — `name` blank; or `type` present and not `'shopping'` (**MVP**). Values `movies` / `books` / `travel` / `gifts` are reserved for **POST-MVP** (already in DB CHECK). |
| 401 | `unauthorized` |

---

#### `GET /lists/:id`
Get details of a single list. Caller must be a member.

**Response 200**
```json
{
  "id": "uuid",
  "name": "Weekend shopping",
  "type": "shopping",
  "owner_id": "uuid",
  "member_count": 3,
  "item_count": 12,
  "created_at": "...",
  "updated_at": "..."
}
```

**Errors**
| Code | Message |
|---|---|
| 401 | `unauthorized` |
| 403 | `forbidden` — caller is not a list member |
| 404 | `list_not_found` |

---

#### `PATCH /lists/:id`
Update the list name. Any member (owner or member) may edit the name.

**Request body**
```json
{
  "name": "Big weekly shop"
}
```

**Response 200** — updated list object (same shape as `GET /lists/:id`)

**Errors**
| Code | Message |
|---|---|
| 400 | `validation_error` — `name` blank |
| 401 | `unauthorized` |
| 403 | `forbidden` — caller is not a member |
| 404 | `list_not_found` |

---

#### `DELETE /lists/:id`
Permanently delete a list and all its items. **Owner only**.

**Response 204** — no body

**Errors**
| Code | Message |
|---|---|
| 401 | `unauthorized` |
| 403 | `forbidden` — caller is not the owner |
| 404 | `list_not_found` |

---

### 2.3 List Items

#### `GET /lists/:id/items`
Return all items in the list, ordered by `category name ASC` then `created_at ASC` within each category. Category "Inne" is always last (handled by the client or via a `CASE` sort expression).

**Response 200**
```json
{
  "data": [
    {
      "id": "uuid",
      "list_id": "uuid",
      "name": "Mleko",
      "category_id": "uuid",
      "category_name": "Nabiał",
      "is_checked": false,
      "quantity": "2 l",
      "note": null,
      "link": null,
      "added_by": "uuid",
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

**Errors**
| Code | Message |
|---|---|
| 401 | `unauthorized` |
| 403 | `forbidden` |
| 404 | `list_not_found` |

---

#### `POST /lists/:id/items/bulk`
Add one or more items to the list. Each item is normalized, looked up in `category_dictionary` (exact then fuzzy, threshold ≥ 0.7), and items without a dictionary hit are sent to OpenRouter in a single batched call. Results are validated against the list's allowed categories before saving. Dictionary entries are upserted with `usage_count` incremented atomically.

Also used as the **confirm step** after recipe-import preview (PRD §4.14): the client sends the user-edited preview rows (with optional `quantity`); nothing from preview is persisted until this call succeeds.

**Request body** (string form — simple add)
```json
{
  "items": ["Mleko 2%", "Chleb razowy", "Łosoś"]
}
```

**Request body** (object form — recipe confirm / items with quantity)
```json
{
  "items": [
    { "name": "Mleko 2%", "quantity": "200 ml" },
    { "name": "Mąka", "quantity": "300 g" },
    { "name": "Jajka", "quantity": "2 szt." }
  ]
}
```

`items` may be a mix of strings and objects; strings are treated as `{ "name": "..." }` with `quantity: null`.

**Constraints**
- Max 200 characters per item name (after trim).
- No blank item names.
- `items` array must not be empty.

**Response 201**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Mleko",
      "category_id": "uuid",
      "category_name": "Nabiał",
      "is_checked": false,
      "quantity": null,
      "note": null,
      "link": null,
      "added_by": "uuid",
      "created_at": "...",
      "updated_at": "...",
      "categorization_source": "dictionary"
    },
    {
      "id": "uuid",
      "name": "Łosoś",
      "category_id": "uuid",
      "category_name": "Ryby i owoce morza",
      "is_checked": false,
      "quantity": null,
      "note": null,
      "link": null,
      "added_by": "uuid",
      "created_at": "...",
      "updated_at": "...",
      "categorization_source": "ai"
    }
  ]
}
```

> `categorization_source`: `"dictionary"` | `"ai"` | `"fallback"` (when AI is unavailable → category "Inne" assigned).

**Errors**
| Code | Message |
|---|---|
| 400 | `validation_error` — blank item, name > 200 chars, or empty array |
| 401 | `unauthorized` |
| 403 | `forbidden` |
| 404 | `list_not_found` |
| 429 | `ai_rate_limit_exceeded` — user's AI call quota exhausted |
| 502 | `ai_unavailable` — OpenRouter unreachable (fallback to "Inne" applied; items still saved) |

---

#### `PATCH /lists/:id/items/:itemId`
Edit item metadata (name, quantity, note, link). Implements **last-write-wins** via `updated_at` comparison: the request must include `updated_at` matching the record's current value; if stale, request is rejected.

**Request body**
```json
{
  "name": "Mleko pełnotłuste",
  "quantity": "1 l",
  "note": "bez laktozy",
  "link": "https://...",
  "updated_at": "2024-06-01T10:00:00Z"
}
```
All fields are optional; at least one must be present.

**Response 200** — updated item object (same shape as items in `GET .../items`)

**Errors**
| Code | Message |
|---|---|
| 400 | `validation_error` — blank name, name > 200 chars, or missing `updated_at` |
| 401 | `unauthorized` |
| 403 | `forbidden` |
| 404 | `list_not_found` or `item_not_found` |
| 409 | `conflict` — `updated_at` is stale; response body contains the current server version of the item |

---

#### `PATCH /lists/:id/items/:itemId/check`
Toggle `is_checked` for an item. Also updates `updated_at`. Any member may perform this action.

**Request body**
```json
{
  "is_checked": true
}
```

**Response 200** — updated item object

**Errors**
| Code | Message |
|---|---|
| 400 | `validation_error` — `is_checked` missing or not boolean |
| 401 | `unauthorized` |
| 403 | `forbidden` |
| 404 | `list_not_found` or `item_not_found` |

---

#### `DELETE /lists/:id/items/:itemId`
Delete a single item. Any member may delete. Requires confirmation on the client before calling.

**Response 204** — no body

**Errors**
| Code | Message |
|---|---|
| 401 | `unauthorized` |
| 403 | `forbidden` |
| 404 | `list_not_found` or `item_not_found` |

---

#### `DELETE /lists/:id/items/completed`
Delete all items where `is_checked = true`. Any member may perform this action.

**Response 200**
```json
{
  "deleted_count": 7
}
```

**Errors**
| Code | Message |
|---|---|
| 401 | `unauthorized` |
| 403 | `forbidden` |
| 404 | `list_not_found` |

---

### 2.3.1 Recipe import (AI preview)

#### `POST /lists/:id/recipe-import/preview`
Fetch a recipe URL, extract ingredient candidates via OpenRouter, and return a **preview only**. Does **not** insert `list_items`. Caller must be a list member. Target list is expected to be `type = shopping` in MVP.

**Request body**
```json
{
  "url": "https://example.com/przepis/nalesniki"
}
```

**Response 200**
```json
{
  "source_url": "https://example.com/przepis/nalesniki",
  "recipe_title": "Naleśniki klasyczne",
  "items": [
    { "name": "Mąka", "quantity": "300 g" },
    { "name": "Mleko", "quantity": "500 ml" },
    { "name": "Jajka", "quantity": "2 szt." }
  ]
}
```

`recipe_title` may be `null` if unknown. `quantity` may be `null` per item. Order should match the recipe when possible.

**Client flow (PRD §4.14)**

1. Show preview screen; user edits names/quantities, removes or adds rows.
2. Confirm → `POST /lists/:id/items/bulk` with the edited `items` (object form).
3. Never skip preview in MVP.

**Errors**
| Code | Message |
|---|---|
| 400 | `validation_error` — missing/invalid URL |
| 401 | `unauthorized` |
| 403 | `forbidden` — caller is not a list member |
| 404 | `list_not_found` |
| 422 | `recipe_unparseable` — page fetched but no ingredients could be extracted |
| 429 | `ai_rate_limit_exceeded` |
| 502 | `recipe_fetch_failed` — URL unreachable / blocked / non-HTML |
| 502 | `ai_unavailable` |

**Implementation notes**

- Edge Function fetches URL server-side (timeouts, size limits, content-type checks); never trust client-parsed HTML alone.
- Counts toward AI usage limits (`user_ai_usage`) similarly to bulk categorization.
- No new DB table required for MVP preview (ephemeral response). Optional audit log is POST-MVP.

---

### 2.4 List Members

#### `GET /lists/:id/members`
Return all members of a list with basic profile info.

**Response 200**
```json
{
  "data": [
    {
      "user_id": "uuid",
      "name": "Jane Doe",
      "avatar": "https://...",
      "role": "owner",
      "joined_at": "..."
    }
  ]
}
```

**Errors**
| Code | Message |
|---|---|
| 401 | `unauthorized` |
| 403 | `forbidden` |
| 404 | `list_not_found` |

---

#### `DELETE /lists/:id/members/:userId`
**Two scenarios share one endpoint:**

- **Owner removes a member**: `userId` ≠ caller's id; caller must be owner. Owner cannot remove themselves via this endpoint.
- **Member leaves the list**: `userId` = caller's id; caller role = `'member'`. An owner cannot leave their own list (must delete it instead).

**Response 204** — no body

**Errors**
| Code | Message |
|---|---|
| 400 | `cannot_remove_owner` — owner attempted to remove themselves |
| 401 | `unauthorized` |
| 403 | `forbidden` — non-owner attempting to remove another member |
| 404 | `list_not_found` or `member_not_found` |

---

### 2.5 Invitations

#### `POST /lists/:id/invitations`
Generate a new 6-character invitation code (`[A-HJ-NP-Z2-9]{6}`). Any current member (owner or member) may generate a code. If an active code already exists for the list it is revoked (`revoked_at` + `superseded_by` set) within the same transaction before the new one is created. Rate-limited to **1 request per 10 minutes per list per user**.

**Request body** — empty `{}`

**Response 201**
```json
{
  "id": "uuid",
  "list_id": "uuid",
  "code": "A3X7K9",
  "invite_link": "listastic://invite/A3X7K9",
  "expires_at": "2024-06-02T10:00:00Z",
  "created_at": "..."
}
```

**Errors**
| Code | Message |
|---|---|
| 401 | `unauthorized` |
| 403 | `forbidden` — caller is not a member |
| 404 | `list_not_found` |
| 429 | `rate_limit_exceeded` — cooldown of 10 minutes between generations per list/user |

---

#### `POST /invitations/join`
Join a list using an invitation code. The caller must already have a Listastic account. Validates: code exists, not expired (`expires_at > now()`), not used (`used_at IS NULL`), not revoked (`revoked_at IS NULL`), caller is not already a member, list has not reached the 11-member cap. On success: marks the invitation as used, inserts `list_members` record with `role = 'member'`. All within a single transaction (SECURITY DEFINER RPC).

**Request body**
```json
{
  "code": "A3X7K9"
}
```

**Response 200**
```json
{
  "list_id": "uuid",
  "list_name": "Weekend shopping",
  "list_type": "shopping",
  "role": "member",
  "joined_at": "..."
}
```

**Errors**
| Code | Message |
|---|---|
| 400 | `validation_error` — code blank or wrong format |
| 401 | `unauthorized` |
| 404 | `invitation_not_found` — code does not exist |
| 409 | `invitation_expired` — `expires_at` in the past |
| 409 | `invitation_used` — code already consumed |
| 409 | `invitation_revoked` — code was superseded |
| 409 | `already_member` — caller is already in the list |
| 409 | `list_full` — 11-member cap reached |

---

### 2.6 Categories

#### `GET /categories`
Return the full category catalogue for a given list type. Read-only, available to any authenticated user. Used to populate category selectors and to validate AI responses client-side.

**MVP:** clients request `list_type=shopping` only. Other types (`movies`, `books`, `travel`, `gifts`) remain valid query values if seeded — **POST-MVP** product surface; schema and this endpoint already support them.

**Query parameters**
| Param | Type | Required | Description |
|---|---|---|---|
| `list_type` | string | yes | MVP: `shopping`. Also accepted when seeded: `movies`, `books`, `travel`, `gifts` (**POST-MVP**) |

**Response 200**
```json
{
  "data": [
    { "id": "uuid", "list_type": "shopping", "name": "Nabiał" },
    { "id": "uuid", "list_type": "shopping", "name": "Inne" }
  ]
}
```

**Errors**
| Code | Message |
|---|---|
| 400 | `validation_error` — missing or invalid `list_type` |
| 401 | `unauthorized` |

---

## 3. Realtime Subscriptions

The mobile client subscribes directly to **Supabase Realtime** channels. RLS ensures subscribers receive only events they are authorised to see.

| Channel | Filter | Events | Purpose |
|---|---|---|---|
| `list_items:{list_id}` | `list_id=eq.{list_id}` | `INSERT`, `UPDATE`, `DELETE` | Live item additions, edits, checks, deletes |
| `list_members:{list_id}` | `list_id=eq.{list_id}` | `INSERT`, `DELETE` | Members joining or leaving |
| `lists:{list_id}` | `id=eq.{list_id}` | `UPDATE` | List name change |

**Presence / Broadcast (optional in MVP)**

| Channel | Event | Payload |
|---|---|---|
| `presence:{list_id}` | `track` | `{ user_id, name, avatar, mode: "viewing" \| "editing", item_id? }` |
| `broadcast:{list_id}` | `editing-start` / `editing-stop` | `{ user_id, item_id }` |

---

## 4. Authentication and Authorization

### Mechanism
- **Supabase Auth** with **Google OAuth** is the sole identity provider in MVP.
- On successful login Supabase issues a **JWT** (`access_token`, `refresh_token`).
- Every Edge Function validates the JWT using `createClient` with the caller's token (`Authorization: Bearer <access_token>`).
- The authenticated user's `auth.uid()` is mapped to `public.users.auth_user_id` via the helper function `public.current_app_user_id()`.

### Authorization layers
1. **RLS (Row Level Security)** — enforced on all tables; acts as a safety net even for direct DB access.
2. **Edge Function authorization checks** — explicit ownership/membership verification before writes (prevents information leakage through error messages and enforces business rules that RLS alone cannot express, e.g. member cap, invitation cooldown).
3. **`service_role` key** — used only inside Edge Functions for cross-table transactions (e.g. invitation join flow). Never exposed to mobile clients.

### Profile creation
A Supabase Auth **trigger** (or Edge Function webhook on `auth.users INSERT`) automatically creates the corresponding `public.users` row on first sign-in.

---

## 5. Validation and Business Logic

### 5.1 Users
| Field | Rule |
|---|---|
| `name` | Non-empty after trim |
| `email` | Stored lowercase; uniqueness enforced by DB index |
| `plan` | Must be `'basic'` or `'premium'` |
| `onboarding_completed_at` | Set once; idempotent endpoint |

### 5.2 Lists
| Field | Rule |
|---|---|
| `name` | Non-empty after trim (`char_length(trim(name)) > 0`) |
| `type` | **MVP:** must be `'shopping'` (or omitted → default `shopping`). DB CHECK also allows `movies` / `books` / `travel` / `gifts` for **POST-MVP**; API rejects non-shopping creates in MVP |
| `owner_id` | Automatically set to the caller's user id; not client-supplied |
| Owner membership | On list creation, a `list_members` row with `role = 'owner'` is inserted atomically |
| `scope` (query, **`GET /lists` only**) | `owned` (default) or `shared`; must reject unknown values with `400 validation_error` |

### 5.3 List Items
| Field | Rule |
|---|---|
| `name` | Non-empty after trim; max 200 characters |
| `category_id` | Must reference a category whose `list_type` matches `lists.type`; enforced by DB trigger + Edge Function |
| `added_by` | Set server-side from JWT; not client-supplied |
| `updated_at` | Must be provided in PATCH; rejected if stale (last-write-wins) |
| Bulk input | Max 200 chars per item name; empty/blank items are skipped with a warning; items may be strings or `{ name, quantity? }` (recipe confirm) |

### 5.4 List Members
| Rule | Detail |
|---|---|
| Max 11 members per list | Enforced by DB trigger `BEFORE INSERT` on `list_members` and by Edge Function check |
| Owner cannot remove themselves | `400 cannot_remove_owner` |
| Owner cannot leave | Must delete the list instead |
| Member cannot remove others | `403 forbidden` |

### 5.5 Invitations
| Rule | Detail |
|---|---|
| Code format | `^[A-HJ-NP-Z2-9]{6}$` (no confusable characters O/0, I/1) |
| Validity | 24 hours from creation OR first use, whichever comes first |
| Single active code per list | On new code generation, the previous active code is atomically revoked (`revoked_at`, `superseded_by`) |
| Generation rate limit | 1 request per 10 minutes per (list, user) pair |
| Join preconditions | Code valid + not expired + not used + not revoked + caller not already a member + list under 11-member cap |
| Join is atomic | Invitation update + `list_members` insert in a single SECURITY DEFINER RPC |

### 5.6 AI Categorization
| Rule | Detail |
|---|---|
| Normalization pipeline | `lowercase → trim → remove diacritics → remove special characters` before dictionary lookup and AI prompt |
| Dictionary lookup order | 1. Exact match `(item_name, list_type)` → 2. Fuzzy match via `pg_trgm` similarity ≥ 0.7 → 3. AI (OpenRouter) |
| AI batching | All items without a dictionary hit in a single bulk request are sent to OpenRouter in one call |
| Category validation | AI response is validated against `categories` for the list's `list_type`; invalid category → fallback to "Inne" |
| Fallback | If AI unavailable or response invalid → category "Inne" with `confidence = 0.3` |
| Dictionary upsert | `INSERT ... ON CONFLICT (item_name, list_type) DO UPDATE SET usage_count = usage_count + 1, updated_at = now()` atomically |
| AI rate limit | Per-user call limit (thresholds TBD per `basic`/`premium` plan); `429` response when exceeded; tracked in `user_ai_usage` |
| `confidence` values | AI success → `0.7`; fallback "Inne" → `0.3`; future user correction → `1.0` |
| `source` values | `'ai'` for all AI-assigned entries; reserved: `'user'` for future manual corrections |

### 5.6.1 Recipe import preview
| Rule | Detail |
|---|---|
| No persistence | Preview response must not write `list_items` |
| Confirm path | Client confirms via `POST .../items/bulk` after user edit |
| Fetch limits | Server-side URL fetch: timeout, max body size, HTTPS preferred; block private/link-local IPs where practical |
| AI usage | Counts toward the same AI quota family as categorization |
| Rate limiting | Same family as bulk/AI endpoints |

### 5.7 Security
| Concern | Implementation |
|---|---|
| Rate limiting (general) | Per-IP and per-user request throttling in Edge Functions (thresholds TBD §17.7) |
| Rate limiting (AI/bulk/recipe) | Stricter limits for `POST .../items/bulk` and `POST .../recipe-import/preview`; checked before calling OpenRouter / fetching URL |
| CORS | Restricted to known origins in Edge Function headers |
| Body size limits | Enforced on bulk endpoints to prevent abuse |
| Input sanitization | Zod schemas validate and sanitize all request bodies in Edge Functions |
| Secrets | `OPENROUTER_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` stored only in Supabase Edge Function environment variables; never sent to clients |
| RLS bypass | Only allowed via `service_role` inside Edge Functions for controlled transactions |

---

## 6. List Detail Deletion Integration Architecture (`/lists/:id`)

This section defines the mobile integration architecture for:

1. **Single-item delete** from the item bottom sheet.
2. **Delete checked items** from the existing floating trash button.

The design follows the implemented Edge Function contracts in `supabase/functions/list-items` and keeps all existing list-detail behaviour unchanged (item grouping, check/uncheck, bulk add, and current realtime invalidation model).

### 6.1 Current backend contract (already implemented)

- `DELETE /functions/v1/list-items/{listId}/items/{itemId}`  
  - success: `204 No Content`
  - errors: `401`, `403`, `404` (`list_not_found` or `item_not_found`)
- `DELETE /functions/v1/list-items/{listId}/items/completed`
  - success: `200 { "deleted_count": number }`
  - errors: `401`, `403`, `404` (`list_not_found`)

Both operations trigger `DELETE` events in `public.list_items`, which are already covered by `useListDetailsRealtime` via `postgres_changes` subscription on `list_items` filtered by `list_id`.

### 6.2 Mobile architecture layers

| Layer | Responsibility | Files |
|---|---|---|
| API client (`lists.ts`) | Build delete endpoints, execute authenticated `fetch`, map API errors to user-facing `Error` | `mobile/src/api/lists/lists.ts` |
| API models (`lists.models.ts`) | Type contracts for `delete_completed` response | `mobile/src/api/lists/lists.models.ts` |
| Mutations (`hooks/*`) | React Query mutation lifecycle, optimistic cache updates, rollback on failure, invalidation on settle | `mobile/src/api/lists/hooks/useDeleteListItemMutation.ts`, `mobile/src/api/lists/hooks/useDeleteCompletedListItemsMutation.ts` |
| Screen orchestration | Bottom sheet actions, confirmation modal state, pending/error UI, button enablement, accessibility labels | `mobile/src/app/(protected)/lists/[id].tsx` |
| Realtime reconciliation | Keep current `invalidateListItemsQuery` + `invalidateListDetailsQuery` strategy as final consistency layer | `mobile/src/api/lists/hooks/useListDetailsRealtime.ts` |

### 6.3 API client changes

Add two client functions in `lists.ts`:

- `deleteListItem(listId: string, itemId: string): Promise<void>`
- `deleteCompletedListItems(listId: string): Promise<{ deleted_count: number }>`

Design details:

- Keep the same auth/header strategy already used across list API calls.
- Handle `204` body safely for single delete (do not call `response.json()` when status is `204`).
- Reuse existing endpoint base (`endpoints.listItems`) and current URL convention:
  - `${endpoints.listItems}/${listId}/items/${itemId}`
  - `${endpoints.listItems}/${listId}/items/completed`
- Preserve error parsing semantics (prefer backend message, fallback to local message).

### 6.4 React Query mutation strategy

#### A) `useDeleteListItemMutation`

Mutation input:

```ts
{ listId: string; itemId: string }
```

Flow:

1. `onMutate`
   - cancel list-items query for `listId`
   - snapshot previous data
   - optimistically remove `itemId` from cached `queryKeys.lists.listItems(listId)`
2. `onError`
   - restore snapshot (rollback)
3. `onSettled`
   - invalidate `listItems` and `listDetails`
   - keep invalidation to reconcile with realtime and server truth

#### B) `useDeleteCompletedListItemsMutation`

Mutation input:

```ts
{ listId: string }
```

Flow:

1. `onMutate`
   - cancel list-items query
   - snapshot previous data
   - optimistically filter out all `is_checked === true` items
2. `onError`
   - rollback snapshot
3. `onSuccess`
   - optionally use `deleted_count` for toast/message
4. `onSettled`
   - invalidate `listItems` and `listDetails`

This mirrors existing mutation patterns (`usePatchListItemCheckMutation`) and prevents behavioural drift.

### 6.5 List screen UI/state architecture (`[id].tsx`)

Introduce the following local UI state:

- `isDeleteConfirmOpen: boolean`
- `deleteIntent: { type: "single"; item: ListItem } | { type: "completed"; checkedCount: number } | null`
- Optional: a shared `actionErrorMessage` region near floating actions (same visual pattern as existing mutation errors)

#### Trigger points

1. **Single delete (inside item bottom sheet)**
   - Add destructive action button at the bottom of the already existing item details sheet.
   - Action opens confirmation modal (no API call yet).
   - Confirm action executes `useDeleteListItemMutation`.

2. **Delete checked (existing floating trash button)**
   - Keep existing floating trash button.
   - Compute `checkedCount` from `itemsData?.data`.
   - If `checkedCount === 0`, button is disabled (or keeps press blocked with helper feedback).
   - Press opens confirmation modal.
   - Confirm action executes `useDeleteCompletedListItemsMutation`.

#### Confirmation UX (required by PRD)

- Every delete path is gated by explicit confirmation.
- Confirmation copy includes scope:
  - single: item name
  - bulk: number of checked items
- Disable confirm/cancel controls while mutation is pending.
- On success:
  - close confirmation modal
  - for single delete: close item details bottom sheet and clear `selectedItem`
- On error:
  - keep screen state stable
  - show inline error message with retry path

### 6.6 Realtime behavior and consistency model

No new realtime channel is needed. Existing `useListDetailsRealtime` already listens to:

- `lists`
- `list_members`
- `list_items` (`event: "*"`, `filter: list_id=eq.{listId}`)

Consistency strategy:

1. Immediate perceived response via optimistic cache updates.
2. Server confirmation via mutation result.
3. Final consistency via existing invalidations and realtime events.

This avoids introducing a second parallel state system and minimizes risk of regressions.

### 6.7 Non-regression constraints

To preserve existing app behaviour:

- Do not alter current grouping/sorting logic (`Inne` last, alphabetical categories, item order by `created_at`).
- Do not modify current add-items bottom sheet behaviour or pending animation.
- Do not change existing check/uncheck mutation contract.
- Keep `useListDetailsRealtime` subscriptions and invalidation scope intact.
- Keep all edge-case states currently present (`missing listId`, pull-to-refresh, fetch errors).

### 6.8 Edge cases

| Case | Expected behaviour |
|---|---|
| User confirms single delete for an item already deleted remotely | mutation returns `404 item_not_found`; UI closes confirmation, invalidates, refreshes list |
| User triggers delete-completed with no checked items (race after realtime) | short-circuit on client; no API call |
| Two users delete completed simultaneously | operation remains idempotent; one client may receive `deleted_count = 0`, both converge after realtime |
| Unauthorized/session expired | API error shown; no destructive local state remains after rollback |
| Member removed during session | next mutation returns `403`; UI shows error, list data refetches |

### 6.9 Test plan (manual, mobile + realtime)

1. Open same list on two devices/accounts.
2. Device A: single-delete from item bottom sheet; verify item disappears on both devices.
3. Device A: check multiple items; use floating trash; verify all checked removed on both devices.
4. Force API failure (expired token / revoked membership) and verify rollback + error messaging.
5. Verify non-regression:
   - adding items still works
   - check/uncheck still works
   - grouping/sorting remains unchanged
   - pull-to-refresh and realtime still update list content.
