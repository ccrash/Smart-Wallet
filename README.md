# Smart Wallet

A personal finance mini-app built with React Native / Expo as a 7-day coding exercise.

---

## Quick start

```bash
npm install
npm run web      # browser at http://localhost:8081
npm run android  # Android (requires emulator or device)
```

No environment variables are required — the app ships with a built-in mock transport that
runs entirely in-process. To point at a real backend, copy `.env.example` to `.env.local`
and set `EXPO_PUBLIC_API_URL`.

---

## Features

| Screen | Status | Notes |
|---|---|---|
| Sign in | ✅ | Mock auth (Google OAuth stub) |
| Wallet home | ✅ | Balance, transaction history with pagination |
| Savings pots | ✅ | Create, deposit, withdraw, delete pots |
| Voucher shop | ✅ | Buy preset vouchers; codes generated on purchase |
| Loyalty rewards | 🔄 | Points balance shown; redemption UI in progress |

---

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Expo SDK 54, managed workflow | Fastest cross-platform start; no native build tooling needed for review |
| Navigation | expo-router v6 | File-system routing — convention over configuration |
| Styling | NativeWind 4 (Tailwind CSS) | Single utility-class system that works on both native and web |
| State | Zustand 5 + AsyncStorage `persist` | Minimal boilerplate; stores are independent slices; hydration pattern is explicit |
| TypeScript | Strict throughout | All domain types defined in `src/types/index.ts` |

---

## Architecture

### Folder structure

```
src/
  api/
    transport/
      types.ts          # ApiTransport interface
      mock.transport.ts # In-process mock — route handlers + business logic
      http.transport.ts # Real HTTP client (fetch) for production
      index.ts          # Exports active transport based on EXPO_PUBLIC_API_URL
    auth.service.ts
    wallet.service.ts
    pots.service.ts
    vouchers.service.ts
    loyalty.service.ts
    client.ts           # generateId utility
    db.ts               # In-memory state store used by the mock transport
    index.ts            # Barrel export
  store/
    authStore.ts
    walletStore.ts
    themeStore.ts
  types/
    index.ts            # Single source of truth for domain types
  app/                  # expo-router file-system routes
    (auth)/
      sign-in.tsx
    (tabs)/
      index.tsx         # Wallet home
      pots.tsx
      shop.tsx
      rewards.tsx
      settings.tsx
  components/
    AppHeader.tsx
    pot/
    voucher/
    wallet/
```

### Transport layer

All API calls go through an `ApiTransport` interface:

```ts
interface ApiTransport {
  get<T>(path: string, params?: Record<string, string | number>): Promise<ApiResponse<T>>
  post<T>(path: string, body?: unknown): Promise<ApiResponse<T>>
  put<T>(path: string, body?: unknown): Promise<ApiResponse<T>>
  del<T>(path: string): Promise<ApiResponse<T>>
}
```

Two implementations live behind this interface:

| Implementation | File | When active |
|---|---|---|
| `mockTransport` | `transport/mock.transport.ts` | `EXPO_PUBLIC_API_URL` is unset (default) |
| `httpTransport` | `transport/http.transport.ts` | `EXPO_PUBLIC_API_URL` is set |

The active transport is selected once at import time in `transport/index.ts`:

```ts
export const transport = process.env.EXPO_PUBLIC_API_URL ? httpTransport : mockTransport
```

This means **no code changes are needed to switch from local to production** — set the env
variable and the real HTTP client takes over. Services are thin wrappers that never know
which transport they're talking to:

```ts
// pots.service.ts — identical whether running locally or against a real API
export const potsService = {
  deposit(potId: string, amount: number) {
    return transport.post(`/pots/${potId}/deposit`, { amount })
  },
}
```

The mock transport contains all business logic (validation, pagination, ID generation) and
simulates 150 ms network latency. `db.ts` is its internal in-memory state; the production
HTTP transport has no equivalent — state lives server-side.

### REST API contract

The routes the HTTP transport would call against a real backend:

| Method | Path | Body / Params | Response |
|---|---|---|---|
| `GET` | `/wallet/balance` | — | `number` |
| `GET` | `/wallet/transactions` | `?page=N` | `{ items: Transaction[]; hasMore: boolean }` |
| `GET` | `/pots` | — | `Pot[]` |
| `POST` | `/pots` | `{ name }` | `Pot` |
| `POST` | `/pots/:id/deposit` | `{ amount }` | `{ pot: Pot; debitAmount: number }` |
| `POST` | `/pots/:id/withdraw` | `{ amount }` | `{ pot: Pot; creditAmount: number }` |
| `DELETE` | `/pots/:id` | — | `{ refundAmount: number }` |
| `GET` | `/vouchers` | — | `Voucher[]` |
| `POST` | `/vouchers/purchase` | `{ denomination }` | `Voucher` |
| `GET` | `/loyalty/balance` | — | `number` |
| `POST` | `/loyalty/redeem` | `{ points }` | `{ creditAmount; remainingPoints; transactionId }` |
| `POST` | `/auth/sign-in` | — | `User` |
| `POST` | `/auth/sign-out` | — | `void` |

All responses are wrapped in `ApiResponse<T>`:

```ts
type ApiResponse<T> = { data: T; error: null } | { data: null; error: string }
```

The HTTP transport normalises non-2xx responses and network errors into the same shape, so
callers never need try/catch.

### Service layer pattern

Services own no business logic — validation and rules live in the transport layer
(mock) or on the server (HTTP). Each service method:

1. Calls `transport.get/post/put/del` with a route and payload.
2. Returns `ApiResponse<T>` — callers narrow with `if (result.error)`.
3. On success: the UI component writes results to the store.

```
UI component
  → calls service (async, returns ApiResponse<T>)
    → transport layer handles the request
  ← { data: T, error: null }  or  { data: null, error: string }
  → on success: component calls store method to persist
```

This keeps stores as pure persistence (no business logic) and makes the production
migration path mechanical: stand up the backend, set the env variable, done.

### `ApiResponse<T>` discriminated union

```ts
type ApiResponse<T> = { data: T; error: null } | { data: null; error: string }
```

Callers narrow with `if (result.error)` — no try/catch scattered through the UI.

### State hydration

Both stores use `onRehydrateStorage` to set `isHydrated: true` after AsyncStorage loads.
The root layout gate (`_layout.tsx`) waits for both stores to be hydrated before rendering
screens, preventing flashes of incorrect state on cold launch.

---

## Business rules

| Rule | Enforced in |
|---|---|
| Starting balance: £500 (seeded once) | `walletStore.seed()` |
| Overdraft prevention | `mock.transport` — `/pots/:id/deposit`, `/vouchers/purchase` |
| Pot name uniqueness (case-insensitive) | `mock.transport` — `POST /pots` |
| Pot name max 30 chars | `mock.transport` — `POST /pots` |
| Voucher denominations: £10, £25, £50, £100 | `mock.transport` — `POST /vouchers/purchase` |
| Points earned: 1 pt per £1 spent on vouchers | `mock.transport` — `POST /vouchers/purchase` |
| Points redeemable in multiples of 100 | `mock.transport` — `POST /loyalty/redeem` |
| 100 pts = £1.00 credit | `mock.transport` — `POST /loyalty/redeem` |
| Withdrawing from a pot returns funds to wallet | `mock.transport` — `POST /pots/:id/withdraw` |
| Deleting a pot with balance refunds to wallet | `mock.transport` — `DELETE /pots/:id` |

---

## Google OAuth — current state and production path

Authentication is currently mocked: the sign-in button creates a hardcoded `User` object
via the mock transport's `POST /auth/sign-in` handler. No credentials are required to run
or review the app.

**Production implementation plan:**

1. Stand up a thin backend (Node/Express or serverless function) as an OAuth bridge. The
   bridge holds the Google `client_secret`; the mobile app never sees it.
2. Mobile app calls `expo-auth-session` with the bridge's `/auth/google` URL. After the
   Google callback, the bridge exchanges the code for tokens, creates a session, and
   returns only a signed session token to the app.
3. App stores the session token; all subsequent API calls authenticate with it via a
   request header added in `http.transport.ts`.

**Why not implement it now?**
- iOS OAuth requires a macOS machine to build the native client; this was developed on Windows.
- A real bridge requires a deployed server; adding that dependency would make the app
  un-runnable without credentials.
- The mock fallback lets any reviewer run the app immediately.

---

## Known limitations and trade-offs

- **No real persistence beyond the device** — all data lives in AsyncStorage. On app
  uninstall, data is lost. A real backend would resolve this.
- **No real auth** — the mock user is hardcoded. Avatar image (`photoURL`) is always null.
- **Loyalty rewards redemption UI** — the service and business logic are complete and
  tested; the redemption flow in the Rewards screen is not yet wired up.
- **Mock transport is synchronous internally** — handlers run on the JS thread with a
  simulated 150 ms delay. A real API introduces true async failure modes (timeouts, 5xx);
  the `httpTransport` handles these and maps them to the same `ApiResponse` error shape.
- **No optimistic updates** — the store is only updated after the service call resolves.
  Fine for 150 ms simulated latency; with real network latency a skeleton/optimistic
  pattern would improve perceived performance.

---

## What I'd add with more time

1. **Loyalty rewards redemption UI** — wire the already-implemented `loyaltyService.redeem()`
   into the Rewards screen.
2. **Google OAuth bridge** — as described above.
3. **Real backend** — sync wallet state server-side so it survives reinstalls and works
   across devices. The transport abstraction makes this a drop-in: implement the REST
   contract and set `EXPO_PUBLIC_API_URL`.
4. **Auth header middleware** — add a `getAuthToken()` hook in `http.transport.ts` to
   attach the session token to every request.
5. **expo-image** — for caching the user avatar and any product images in the voucher shop.
6. **Push notifications** — `expo-notifications` for transaction confirmations and pot
   goal milestones.
7. **Biometric lock** — `expo-local-authentication` to re-authenticate before transfers.
8. **CI** — GitHub Actions running `tsc --noEmit` and the Jest suite on every PR.
