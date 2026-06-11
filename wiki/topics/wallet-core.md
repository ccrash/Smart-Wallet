---
topic: wallet-core
last_compiled: 2026-06-11
sources_count: 9
status: active
---

# Wallet Core [coverage: high — 9 sources]

## Summary [coverage: high — 9 sources]
The wallet is the financial hub of the app. A single Zustand store (`walletStore`, persisted to AsyncStorage) holds all financial state. An in-memory `db` singleton acts as the data layer that mock services read from and write to — it is reverse-synced from the store on cold start so services always see correct session state.

All money rules (2-decimal-place precision, amount validation, input parsing) are centralised in `src/utils/money.ts`. Every balance arithmetic result passes through `roundMoney` so float error can never accumulate in a stored balance.

The home screen (`index.tsx`) is a thin layout shell. `BalanceCard` and `TransactionList` are self-contained components that subscribe directly to the store.

Starting balance: £500 (seeded once on first launch after hydration).

## Data Model [coverage: high — 2 sources]
```ts
type Transaction = {
  id: string
  date: string          // ISO string
  description: string
  amount: number        // negative = debit, positive = credit
  type: TransactionType // 'seed' | 'pot_deposit' | 'pot_withdrawal' | 'voucher_purchase' | 'points_redemption'
  runningBalance: number
}
```

## Store Shape [coverage: high — 1 source]
**Key:** `sw-wallet-v3` | Persisted via Zustand `persist` + AsyncStorage

| Field | Type | Purpose |
|-------|------|---------|
| `balance` | `number` | Available wallet balance (excludes pot money) |
| `transactions` | `Transaction[]` | Full history, newest first |
| `pots` | `Pot[]` | All savings pots |
| `vouchers` | `Voucher[]` | Purchased vouchers |
| `loyaltyPoints` | `number` | Current points balance |
| `isSeeded` | `boolean` | Guards against re-seeding on relaunch |
| `isHydrated` | `boolean` | Set true after AsyncStorage rehydration |

## The db Layer [coverage: high — 1 source]
`src/api/db.ts` — a module-level singleton that mock services use as their backing store:

```ts
db.get()               // read current state
db.set(updater)        // functional update (services write here)
db.hydrate(partial)    // merge partial state (called on cold start by walletStore)
db.reset()             // clear to EMPTY
```

**Why this exists:** Mock services need synchronous access to current state (balance checks, pot lookups). Rather than passing state as parameters, the db layer acts as a shared memory. On rehydration, `walletStore` calls `db.hydrate()` so the in-memory db reflects the persisted session.

## Key Actions [coverage: high — 1 source]
- **`applyTransaction(tx)`** — computes `newBalance = roundMoney(balance + tx.amount)` (rounded to 2dp to prevent float drift), writes `runningBalance` onto the tx, updates both `db` and store atomically
- **`seed()`** — guarded by `isSeeded`; creates the `£500` welcome transaction; called by root `_layout.tsx` after hydration
- **`reset()`** — clears db + all store fields; used by Settings → "Reset wallet data"

## Transaction Pagination [coverage: high — 2 sources]
`walletService.getTransactions(page)` → `GET /wallet/transactions?page=N`

- Page size: 20 items
- Returns `{ items: Transaction[], hasMore: boolean }`
- `TransactionList` manages its own `page`, `txList`, `isLoading`, `isLoadingMore`, `hasMore` state
- Refetch triggered when `txCount` (store selector) changes — catches new transactions from any feature

## Transaction Icons [coverage: medium — 1 source]
| TransactionType | Icon | Colour |
|----------------|------|--------|
| `seed` | gift-outline | green |
| `pot_deposit` | arrow-down-circle | blue |
| `pot_withdrawal` | arrow-up-circle | violet |
| `voucher_purchase` | pricetag | orange |
| `points_redemption` | star | yellow |

## Money Utilities [coverage: high — 1 source]
`src/utils/money.ts` — the single place money rules live:

| Function | Behaviour |
|----------|-----------|
| `roundMoney(n)` | Rounds to 2dp (`Math.round(n * 100) / 100`). All balance arithmetic passes through it. |
| `isValidAmount(n)` | True only for finite, positive amounts with ≤2 decimal places. Rejects `NaN`/`Infinity` (which `amount <= 0` checks let through — `NaN <= 0` is `false`). Used by the mock transport. |
| `parseMoneyInput(raw)` | Strict regex parse (`/^\d+(\.\d{1,2})?$/`) of user text → `number \| null`. Rejects `'.'`, `'5abc'`, `'1e5'`, `'10.999'`, `'0'`. Used by forms before calling services. |

Validation is layered: forms parse with `parseMoneyInput` (friendly field error, no service call), the mock transport independently re-validates with `isValidAmount`, and the store rounds with `roundMoney`.

## Balance Integrity Rules [coverage: high — 3 sources]
- Balance never goes negative — enforced in the mock transport (throws `'Insufficient balance.'`)
- Balances are always exact 2dp values — `applyTransaction` and pot arithmetic round via `roundMoney`
- `NaN`/`Infinity`/sub-penny amounts are rejected at both the input layer (`parseMoneyInput`) and the transport layer (`isValidAmount`)
- `applyTransaction` does not re-validate amounts; the service layer is expected to validate before calling
- Pot balances are excluded from `balance` — they represent committed savings

## Sources [coverage: high — 9 sources]
- [src/store/walletStore.ts](../../src/store/walletStore.ts)
- [src/utils/money.ts](../../src/utils/money.ts)
- [src/api/db.ts](../../src/api/db.ts)
- [src/api/wallet.service.ts](../../src/api/wallet.service.ts)
- [src/types/index.ts](../../src/types/index.ts)
- [src/components/wallet/BalanceCard.tsx](../../src/components/wallet/BalanceCard.tsx)
- [src/components/wallet/TransactionList.tsx](../../src/components/wallet/TransactionList.tsx)
- [src/components/wallet/TransactionRow.tsx](../../src/components/wallet/TransactionRow.tsx)
- [src/app/(tabs)/index.tsx](../../src/app/(tabs)/index.tsx)
