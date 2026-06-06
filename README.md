# Smart Wallet

A personal finance mini-app built with React Native / Expo as a 7-day coding exercise.

---

## Quick start

```bash
npm install
npm run web      # browser at http://localhost:8081
npm run android  # Android (requires emulator or device)
```

No environment variables are required to run the app — all data is local and the backend is mocked.

---

## Features

| Screen | Status | Notes |
|---|---|---|
| Sign in | ✅ | Mock auth (Google OAuth stub) |
| Wallet home | ✅ | Balance, transaction history with pagination |
| Savings pots | 🔄 | Service layer done; UI in progress |
| Voucher shop | 🔄 | Service layer done; UI in progress |
| Loyalty rewards | 🔄 | Service layer done; UI in progress |

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
  api/           # Service layer — all "backend" calls go here
    client.ts    # mockRequest wrapper + generateId
    auth.service.ts
    wallet.service.ts
    pots.service.ts
    vouchers.service.ts
    loyalty.service.ts
    index.ts     # barrel export
  store/
    authStore.ts
    walletStore.ts
  types/
    index.ts     # single source of truth for domain types
  app/           # expo-router file-system routes
    (auth)/
      sign-in.tsx
    (tabs)/
      index.tsx  # wallet home
      pots.tsx
      shop.tsx
      rewards.tsx
  components/
```

### Service layer pattern

All mutations go through `src/api/` services rather than calling store methods directly from UI components. Each service method:

1. Calls `useWalletStore.getState()` to read current state (like a server reading from a DB).
2. Validates the operation and throws on failure — the `mockRequest` wrapper catches thrown errors and converts them to `{ data: null, error: string }`.
3. Returns the computed result (new entity, updated balance delta, etc.) — calling code then writes to the store.

```
UI component
  → calls service (async, returns ApiResponse<T>)
    → mockRequest simulates 150 ms latency
    → handler reads state, validates, returns result
  ← { data: T, error: null }  or  { data: null, error: string }
  → on success: component calls store method to persist
```

This keeps stores as pure persistence (no business logic) and services as the authority on what operations are valid.

### `ApiResponse<T>` discriminated union

```ts
type ApiResponse<T> = { data: T; error: null } | { data: null; error: string };
```

Callers narrow with `if (result.error)` — no try/catch scattered through the UI.

### State hydration

Both stores use `onRehydrateStorage` to set `isHydrated: true` after AsyncStorage loads. The root layout gate (`_layout.tsx`) waits for both stores to be hydrated before rendering screens, preventing flashes of incorrect state on cold launch.

---

## Business rules

| Rule | Enforced in |
|---|---|
| Starting balance: £500 (seeded once) | `walletStore.seed()` |
| Overdraft prevention | `potsService.deposit`, `vouchersService.purchase` |
| Pot name uniqueness (case-insensitive) | `potsService.create` |
| Pot name max 30 chars | `potsService.create` |
| Voucher denominations: £10, £25, £50, £100 | `vouchersService.purchase` |
| Points earned: 1 pt per £1 spent on vouchers | `vouchersService.purchase` |
| Points redeemable in multiples of 100 | `loyaltyService.redeem` |
| 100 pts = £1.00 credit | `loyaltyService.redeem` |
| Withdrawing from a pot returns funds to wallet | `potsService.withdraw` |
| Deleting a pot with balance refunds to wallet | `potsService.remove` |

---

## Google OAuth — current state and production path

Authentication is currently mocked: the sign-in button creates a hardcoded `User` object via `authService.signInMock()`. No credentials are required to run or review the app.

**Production implementation plan:**

1. Stand up a thin backend (Node/Express or serverless function) as an OAuth bridge. The bridge holds the Google `client_secret`; the mobile app never sees it.
2. Mobile app calls `expo-auth-session` with the bridge's `/auth/google` URL. After the Google callback, the bridge exchanges the code for tokens, creates a session, and returns only a signed session token to the app.
3. App stores the session token; all subsequent API calls authenticate with it.

This pattern (OAuth bridge) keeps the client secret off the device and allows token refresh server-side.

**Why not implement it now?**
- iOS OAuth requires a macOS machine to build the native client; this was developed on Windows.
- A real bridge requires a deployed server; adding that dependency would make the app un-runnable without credentials.
- The mock fallback lets any reviewer run the app immediately.

---

## Known limitations and trade-offs

- **No real persistence beyond the device** — all data lives in AsyncStorage. On app uninstall, data is lost.
- **No real auth** — the mock user is hardcoded. Avatar image (`photoURL`) is always null.
- **Pots/Shop/Rewards screens are stubs** — the service layer and business logic are complete; the UI components are in progress.
- **No input validation in the UI** — validation lives in services; form-level error messaging is not yet wired.
- **`mockRequest` is synchronous internally** — the handler runs on the JS thread. A real API would be truly async and could fail for network reasons; error handling is deliberately simplified.
- **No optimistic updates** — the store is only updated after the service call resolves. For a 150 ms simulated delay this is fine; with real network latency it would feel sluggish.

---

## What I'd add with more time

1. **Complete the three placeholder screens** — pots, shop, rewards — using the already-implemented service layer.
2. **Google OAuth bridge** — as described above.
3. **expo-image** — for caching the user avatar and any product images in the voucher shop.
4. **Real backend + database** — sync wallet state server-side so it survives reinstalls and can be shared across devices.
5. **Push notifications** — `expo-notifications` for transaction confirmations and pot goal milestones.
6. **Biometric lock** — `expo-local-authentication` to re-authenticate before transfers.
7. **Unit tests** — the service layer functions are pure (input → output) and straightforward to test with Jest; `mockRequest` can be swapped for a synchronous version in tests.
8. **CI** — GitHub Actions running `tsc --noEmit` and the test suite on every PR.
