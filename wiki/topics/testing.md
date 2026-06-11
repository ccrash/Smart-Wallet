---
topic: testing
last_compiled: 2026-06-11
sources_count: 18
status: active
---

# Testing [coverage: high — 18 sources]

## Summary [coverage: high — 18 sources]
The test suite uses Jest 29 + jest-expo + @testing-library/react-native 14. Tests are co-located with source files in `__tests__/` directories. Tests are structured in three layers:

1. **Unit** — API services, transport layer, Zustand store (no React rendering)
2. **Component** — each self-contained component tested in its own `__tests__/` file next to the source
3. **Screen** — only `SettingsScreen` and `TabsLayout` remain at screen level (they test screen-specific concerns: auth guard, theme preferences, alert flows)

Screen-level tests for `WalletScreen`, `ShopScreen`, and `PotsScreen` were removed when their logic was found to be fully covered by component-level tests for `BalanceCard`, `TransactionList`, `VoucherCatalog`, `MyVouchers`, and `PotList`.

## Test Stack [coverage: high — 1 source]
| Tool | Version | Role |
|------|---------|------|
| jest | ^29.7.0 | Test runner |
| jest-expo | ^54.0.17 | Expo-aware Jest preset |
| @testing-library/react-native | ^14.0.0 | Component rendering + queries |
| TypeScript | ~5.9.2 | Type-safe test code |

**Global config:** `fakeTimers: { enableGlobally: true }` — all tests start with fake timers. Tests that need async resolution (mock transport has 150 ms `setTimeout`) call `jest.useRealTimers()` in `beforeAll`.

## Test File Map [coverage: high — 18 sources]

### API & Transport
| File | What it covers |
|------|---------------|
| `src/api/__tests__/auth.service.test.ts` | Auth service — `signInMock` returns mock user; `signOut` resolves without error |
| `src/api/__tests__/wallet.service.test.ts` | Balance + paginated transactions |
| `src/api/__tests__/pots.service.test.ts` | Pot CRUD — 15 tests covering all business rules |
| `src/api/__tests__/vouchers.service.test.ts` | Purchase — denomination validation, balance guard |
| `src/api/__tests__/loyalty.service.test.ts` | Points redemption — multiples-of-100 rule |
| `src/api/transport/__tests__/mock.transport.test.ts` | Route table, path matching, error shapes |
| `src/api/transport/__tests__/http.transport.test.ts` | Real HTTP fetch wrapper — all success + error paths |

### Store
| File | What it covers |
|------|---------------|
| `src/store/__tests__/walletStore.test.ts` | seed (idempotent), applyTransaction (debit/credit/ordering/runningBalance), reset (all fields zeroed, re-seed allowed), addPot/updatePotBalance/removePot, addVoucher (prepends), setLoyaltyPoints — 13 tests |

### Components — Wallet
| File | What it covers |
|------|---------------|
| `src/components/wallet/__tests__/BalanceCard.test.tsx` | Balance display, pot summary, singular/plural |
| `src/components/wallet/__tests__/TransactionList.test.tsx` | Empty state, rows with amount + running balance, "Load more" button when hasMore, pagination (page 1 fetch), loading spinner (testID `loading-more`) while second page is in-flight — 5 tests |
| `src/components/wallet/__tests__/TransactionRow.test.tsx` | Positive/negative amount formatting, isLast border |

### Components — Voucher
| File | What it covers |
|------|---------------|
| `src/components/voucher/__tests__/ShopBalanceCard.test.tsx` | Balance + loyalty points header |
| `src/components/voucher/__tests__/VoucherCatalog.test.tsx` | Catalog render, confirm flow, purchase, success/error modals, close |
| `src/components/voucher/__tests__/MyVouchers.test.tsx` | Empty state, history row |
| `src/components/voucher/__tests__/VoucherHistoryRow.test.tsx` | Code + points display, isLast border |

### Components — Pot
| File | What it covers |
|------|---------------|
| `src/components/pot/__tests__/PotList.test.tsx` | Full CRUD interaction — 11 tests |

### Screens
| File | What it covers |
|------|---------------|
| `src/app/(tabs)/__tests__/SettingsScreen.test.tsx` | Profile display, theme picker, reset/sign-out alert flows |
| `src/app/(tabs)/__tests__/TabsLayout.test.tsx` | Auth guard states (not hydrated / unauthenticated / authenticated) |

## Mocking Pattern [coverage: high — 3 sources]
All component and screen tests mock the store at module level:
```ts
jest.mock('@/store/walletStore', () => ({ useWalletStore: jest.fn() }))

// In beforeEach:
(useWalletStore as unknown as jest.Mock).mockImplementation(
  (selector: (s: typeof BASE_STATE) => unknown) => selector(BASE_STATE),
)
```
Services are mocked individually per test file. `generateId` is mocked to `'test-tx-id'` for deterministic assertions.

**FloatingTabBar mock** — any component that uses `useTabBarPadding()` must mock the hook to avoid the `SafeAreaProvider` requirement:
```ts
jest.mock('@/components/FloatingTabBar', () => ({ useTabBarPadding: jest.fn().mockReturnValue(0) }))
```
This is required in `PotList.test.tsx` and `SettingsScreen.test.tsx`.

## Timer Pattern [coverage: medium — 3 sources]
Tests that exercise async flows (service calls, mock transport) use:
```ts
beforeAll(() => jest.useRealTimers())
afterAll(()  => jest.useFakeTimers())
```
Real timers are needed because mock transport uses `setTimeout(150ms)`. The `afterAll` restores fake timers so other test files aren't affected. Pure rendering tests (BalanceCard, ShopBalanceCard, etc.) don't need this — they only use `mockResolvedValue` which resolves via microtasks, unaffected by fake timers.

`TransactionList.test.tsx` uses `beforeAll(() => jest.useRealTimers())` because it mocks `walletService.getTransactions` as a `mockResolvedValue` (microtask), but calls `afterAll(() => jest.useFakeTimers())` to restore the global state.

## Async Patterns [coverage: high — 2 sources]
| Scenario | Pattern |
|----------|---------|
| Wait for element to appear | `await render(...)` then `await screen.findByText(...)` |
| Wait for async side effect | `await waitFor(() => expect(mock).toHaveBeenCalled())` |
| Controlled input | `fireEvent.changeText(input, value)` + `await waitFor(() => screen.getByDisplayValue(value))` |
| Alert confirm button | `act(() => buttons.find(b => b.style === 'destructive')?.onPress?.())` + `waitFor` |
| Load-more spinner | testID `"loading-more"` on the `ActivityIndicator` inside TransactionList |
| Pending promise (mid-flight) | `new Promise((res) => { resolveSecondPage = res })` — hold the promise unresolved to observe intermediate loading state, then call `await act(async () => { resolveSecondPage() })` |

**Important:** This version of RNTL requires `await render(...)` even for synchronous components — `screen` is not populated until render's async setup completes. All tests use `await render`.

The `typeInto(placeholder, value)` helper in `PotList.test.tsx` encapsulates the controlled-input pattern.

## Spy Cleanup [coverage: high — 1 source]
```ts
afterEach(() => {
  jest.clearAllMocks()    // clears call history + implementations
  jest.restoreAllMocks()  // restores spied-on methods (e.g. Alert.alert)
})
```
Both are needed: `clearAllMocks` alone doesn't restore `jest.spyOn` targets, causing Alert spy accumulation across tests.

## HTTP Transport Tests [coverage: high — 1 source]
`http.transport.test.ts` requires module isolation because `BASE_URL` is captured at module load time:
```ts
beforeAll(() => {
  global.fetch = mockFetch as unknown as typeof fetch
  process.env.EXPO_PUBLIC_API_URL = 'http://api.test'
  jest.resetModules()
  t = require('@/api/transport/http.transport').httpTransport
})
```
The test covers: successful GET/POST/PUT/DELETE, non-ok response with `message` field, non-ok with JSON parse failure (falls back to `statusText`), network error (Error thrown), and non-Error thrown (returns `'Network error'`).

## walletStore Test Coverage [coverage: high — 1 source]
`walletStore.test.ts` covers 13 tests across 6 describe blocks:
- **seed** (2): initialises £500 balance with seed tx; idempotent (second call adds nothing)
- **applyTransaction** (4): deducts/credits balance; prepends (newest first); each tx carries correct runningBalance
- **reset** (2): zeroes all fields (balance, transactions, pots, vouchers, loyaltyPoints, isSeeded); allows re-seeding after reset
- **pot operations** (3): addPot appends; updatePotBalance mutates only matching pot; removePot removes only matching pot
- **addVoucher** (1): prepends to vouchers list
- **setLoyaltyPoints** (1): replaces points balance (not additive)

## PotList Test Coverage [coverage: high — 1 source]
`PotList.test.tsx` is the most comprehensive component test (11 tests):
- Create success → `addPot` called, modal closes
- Create failure → `fieldError` shown, modal stays open
- Deposit success → `updatePotBalance` + `applyTransaction({ type: 'pot_deposit', amount: -N })`
- Deposit failure → `fieldError` shown
- Withdraw success → `updatePotBalance` + `applyTransaction({ type: 'pot_withdrawal', amount: N })`
- Withdraw failure → `fieldError` shown
- Delete alert: refund message when `balance > 0`
- Delete alert: empty message when `balance === 0`
- Delete confirm: `removePot` called, no transaction when `refundAmount === 0`
- Delete confirm: `applyTransaction({ amount: 75 })` + `removePot` when `refundAmount > 0`
- Delete service error: `removePot` NOT called when service returns `{ data: null }`

## Sources [coverage: high — 18 sources]
- [src/app/(tabs)/__tests__/SettingsScreen.test.tsx](../../src/app/(tabs)/__tests__/SettingsScreen.test.tsx)
- [src/app/(tabs)/__tests__/TabsLayout.test.tsx](../../src/app/(tabs)/__tests__/TabsLayout.test.tsx)
- [src/components/pot/__tests__/PotList.test.tsx](../../src/components/pot/__tests__/PotList.test.tsx)
- [src/components/wallet/__tests__/BalanceCard.test.tsx](../../src/components/wallet/__tests__/BalanceCard.test.tsx)
- [src/components/wallet/__tests__/TransactionList.test.tsx](../../src/components/wallet/__tests__/TransactionList.test.tsx)
- [src/components/wallet/__tests__/TransactionRow.test.tsx](../../src/components/wallet/__tests__/TransactionRow.test.tsx)
- [src/components/voucher/__tests__/ShopBalanceCard.test.tsx](../../src/components/voucher/__tests__/ShopBalanceCard.test.tsx)
- [src/components/voucher/__tests__/VoucherCatalog.test.tsx](../../src/components/voucher/__tests__/VoucherCatalog.test.tsx)
- [src/components/voucher/__tests__/MyVouchers.test.tsx](../../src/components/voucher/__tests__/MyVouchers.test.tsx)
- [src/components/voucher/__tests__/VoucherHistoryRow.test.tsx](../../src/components/voucher/__tests__/VoucherHistoryRow.test.tsx)
- [src/store/__tests__/walletStore.test.ts](../../src/store/__tests__/walletStore.test.ts)
- [src/api/__tests__/auth.service.test.ts](../../src/api/__tests__/auth.service.test.ts)
- [src/api/__tests__/wallet.service.test.ts](../../src/api/__tests__/wallet.service.test.ts)
- [src/api/__tests__/pots.service.test.ts](../../src/api/__tests__/pots.service.test.ts)
- [src/api/__tests__/vouchers.service.test.ts](../../src/api/__tests__/vouchers.service.test.ts)
- [src/api/__tests__/loyalty.service.test.ts](../../src/api/__tests__/loyalty.service.test.ts)
- [src/api/transport/__tests__/mock.transport.test.ts](../../src/api/transport/__tests__/mock.transport.test.ts)
- [src/api/transport/__tests__/http.transport.test.ts](../../src/api/transport/__tests__/http.transport.test.ts)
