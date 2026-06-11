# Reviewer notes — Smart Wallet take-home

This file maps the take-home brief to the implementation and documents the scope
decisions. The main [README](README.md) presents the app as a standalone project; everything
exercise-specific lives here.

---

## Requirements coverage

| Brief section | Status | Where |
|---|---|---|
| 2.1 Authentication | ⚠️ Deliberately re-scoped (see below) | `src/app/(auth)/sign-in.tsx`, `src/store/authStore.ts` |
| 2.2 Main wallet | ✅ Seeded £500, running balances, overdraft prevention | `src/store/walletStore.ts`, `src/components/wallet/` |
| 2.3 Savings pots | ✅ Create / deposit / withdraw / delete with refund | `src/components/pot/`, `src/api/pots.service.ts` |
| 2.4 Voucher shop | ✅ 4 denominations, generated codes, "My Vouchers" list | `src/components/voucher/` |
| 2.5 Loyalty points | ✅ 1 pt/£1, redeem in multiples of 100, never negative | `src/components/rewards/` |
| Session persistence | ✅ Zustand `persist` + AsyncStorage | all stores |
| Profile + sign-out in UI | ✅ Header shows name/initials; sign-out in Settings | `src/components/AppHeader.tsx`, `src/app/(tabs)/settings.tsx` |
| Keyboard avoidance | ✅ Sign-in form and pot amount modal | `KeyboardAvoidingView` in both |
| Web target | ✅ Runs in the browser; `Alert`-driven and biometric flows are mobile-only |

**Beyond the brief:** optional biometric app lock (Face ID / fingerprint / device PIN via
`expo-local-authentication`) with re-lock on background, dark mode, and a centralised money
utility hardened against `NaN` input and float drift.

---

## The OAuth decision

Google OAuth was cut deliberately, not for lack of time to wire a button:

- **It adds no working feature here.** Everything behind sign-in is mocked locally, so a
  real Google token would authenticate against… nothing. The visible product outcome
  (profile in the header, persisted session, sign-out) is identical either way.
- **It adds reviewer friction.** Real OAuth on mobile needs a deployed token-exchange
  bridge (the `client_secret` must never ship in the app), Google credentials, and native
  builds — making the app un-runnable without setup. A take-home should run in one command.
- **The security budget went somewhere real instead**: the biometric app lock, which works
  end-to-end including re-locking on background.

What exists instead: sign-in asks for a display name; the mock transport's
`POST /auth/sign-in` validates it and derives a demo user; the session persists so launches
skip sign-in. The full auth lifecycle a real flow would need — route guard, persistence,
sign-out — is exercised.

**Production path:** a thin OAuth bridge (serverless is fine) holds the Google
`client_secret`; the app drives it with `expo-auth-session`, receives only a signed session
token, and `http.transport.ts` attaches that token to every request.

---

## Business rules and where they're enforced

| Rule | Enforced in |
|---|---|
| Starting balance: £500 (seeded once) | `walletStore.seed()` |
| Overdraft prevention | `mock.transport` — `/pots/:id/deposit`, `/vouchers/purchase` |
| Amounts: finite, positive, max 2 decimal places (NaN rejected) | `src/utils/money.ts`, re-validated in `mock.transport` |
| Balances rounded to exact 2dp on every mutation | `walletStore.applyTransaction`, pot handlers |
| Pot name: non-empty, ≤30 chars, case-insensitively unique | `mock.transport` — `POST /pots` |
| Voucher denominations: £10 / £25 / £50 / £100 | `mock.transport` — `POST /vouchers/purchase` |
| Points: 1 pt per £1; redeem in multiples of 100; 100 pts = £1.00 | `mock.transport` — `POST /loyalty/redeem` |
| Pot withdrawal / deletion refunds to wallet | `mock.transport` — `/pots/:id/withdraw`, `DELETE /pots/:id` |

Validation is two-layer by design: forms parse and reject malformed input client-side for
fast feedback; the mock transport (standing in for the server) independently re-validates,
exactly as a real API would.

---

## REST API contract (implemented by the mock, expected from a real backend)

| Method | Path | Body / Params | Response |
|---|---|---|---|
| `POST` | `/auth/sign-in` | `{ displayName }` | `User` |
| `POST` | `/auth/sign-out` | — | `void` |
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

---

## Folder structure

```
src/
  api/
    transport/
      types.ts          # ApiTransport interface + ApiResponse union
      mock.transport.ts # In-process mock — route handlers + business rules
      http.transport.ts # Real HTTP client (fetch) for production
      index.ts          # Selects active transport via EXPO_PUBLIC_API_URL
    *.service.ts        # auth / wallet / pots / vouchers / loyalty
    client.ts           # generateId utility
    db.ts               # In-memory state backing the mock transport
  store/                # zustand slices: auth, wallet, theme, security
  types/index.ts        # Single source of truth for domain types
  utils/money.ts        # parseMoneyInput / isValidAmount / roundMoney
  app/                  # expo-router routes
    (auth)/sign-in.tsx
    (tabs)/             # index (wallet), pots, shop, rewards, settings
  components/           # AppHeader, FloatingTabBar, BiometricGate + per-domain folders
```

---

## Testing

200+ tests in 23 suites, three layers:

1. **Unit** — services, both transports, stores, money utilities (balance integrity,
   NaN/precision edge cases, idempotent seeding, pagination)
2. **Component** — every domain component via React Native Testing Library (loading,
   error, empty, and success states; double-submit guards)
3. **Screen** — auth guard states, settings flows, biometric lock lifecycle
   (auto-prompt, retry, sign-out escape, background re-lock)

---

## Trade-offs I'm aware of

- **Mock state is mirrored** between the in-memory `db` and the persisted store
  (reverse-synced on cold start). With a real backend the server becomes the single source
  of truth and the mirror disappears.
- **The client orchestrates multi-step mutations** (e.g. voucher purchase = add voucher +
  debit + award points as separate store writes). A real API would make this one atomic
  server-side operation; the transport contract above is shaped for that.
- **No optimistic updates** — fine at the mock's simulated 150 ms latency; a real network
  would warrant skeleton/optimistic patterns.
- **Confirmation dialogs use `Alert`**, which is mobile-only; web parity for destructive
  confirmations would need a cross-platform dialog component.

## What I'd do differently with more time

1. Real backend implementing the REST contract (the transport makes it a drop-in)
2. Production-grade frontend developed with React.js, featuring a fully adaptive and responsive layout.
3. Google sign-in via the OAuth bridge described above
4. Auth-token middleware in `http.transport.ts`
5. Push notifications (`expo-notifications`)
