---
topic: pots
last_compiled: 2026-06-11
sources_count: 7
status: active
---

# Savings Pots [coverage: high — 7 sources]

## Summary [coverage: high — 7 sources]
Savings pots let users ring-fence money into named buckets. Each pot tracks its own balance. Money deposited into a pot is debited from the main wallet; withdrawals credit it back. Deleting a pot with a positive balance automatically refunds the full amount to the wallet. The feature is implemented as a self-contained `PotList` component that owns all interaction state and communicates with the wallet via `walletStore` actions.

## Data Model [coverage: high — 1 source]
```ts
type Pot = {
  id: string
  name: string
  balance: number
  createdAt: string  // ISO string
}
```

## Service API [coverage: high — 1 source]
```ts
potsService.list()                        // GET  /pots
potsService.create(name)                  // POST /pots
potsService.deposit(potId, amount)        // POST /pots/:id/deposit → { pot, debitAmount }
potsService.withdraw(potId, amount)       // POST /pots/:id/withdraw → { pot, creditAmount }
potsService.remove(potId)                 // DELETE /pots/:id → { refundAmount }
```

## Business Rules [coverage: high — 3 sources]
| Operation | Validation |
|-----------|-----------|
| Create | Name non-empty, ≤30 chars, case-insensitive unique across existing pots |
| Deposit | `isValidAmount` (finite, > 0, max 2dp — rejects NaN/Infinity), wallet balance ≥ amount |
| Withdraw | `isValidAmount` (finite, > 0, max 2dp — rejects NaN/Infinity), pot balance ≥ amount |
| Delete | Always succeeds; returns `refundAmount = pot.balance` (can be 0) |

Validation is two-layer: `PotList` parses input with `parseMoneyInput` (from `src/utils/money.ts`) and shows a field error without calling the service when the text is malformed; the mock transport independently re-validates with `isValidAmount` and rounds resulting pot balances with `roundMoney`.

## Component Architecture [coverage: high — 3 sources]
```
pots.tsx (thin shell)
└── PotList (owns all logic + state)
    ├── PotCard × N (presentational, per-pot)
    └── PotActionModal (presentational bottom-sheet)
```

**`PotList` state:**
- `isLoading` — true until `potsService.list()` resolves on mount
- `modalMode: 'create' | 'deposit' | 'withdraw' | null`
- `selectedPot: Pot | null` — the pot being acted on
- `inputValue: string` — bound to the modal TextInput
- `fieldError: string` — shown below the input on service error
- `isSubmitting: boolean` — disables Confirm button + shows spinner

**`handleSubmit` branches:**
- `create` → `potsService.create(inputValue)` → `addPot(r.data)` → `closeModal()`
- `deposit`/`withdraw` first parse: `const amount = parseMoneyInput(inputValue)` — if `null`, sets `fieldError` (`'Enter a valid amount, e.g. 25 or 25.50.'`) and never calls the service
- `deposit` → `potsService.deposit(id, amount)` → `updatePotBalance(id, newBalance)` + `applyTransaction({ type: 'pot_deposit', amount: -debitAmount })` → `closeModal()`
- `withdraw` → `potsService.withdraw(id, amount)` → `updatePotBalance(id, newBalance)` + `applyTransaction({ type: 'pot_withdrawal', amount: creditAmount })` → `closeModal()`

**`handleDelete`** — shows `Alert.alert` with a refund message if `pot.balance > 0`; on confirm, calls `potsService.remove`, optionally applies a `pot_withdrawal` transaction (if `refundAmount > 0`), then calls `removePot(id)`.

## PotCard Visual [coverage: medium — 1 source]
`PotCard` derives a color from the pot's `id` using a hash → index into a 10-color palette (indigo, emerald, amber, coral, blue, violet, pink, teal, orange, cyan). Each pot renders with a solid color background, the pot name in the header row, a delete (trash) icon, the £balance in large type, and Add / Take out action buttons styled as semi-transparent pills.

## Modal Config [coverage: medium — 1 source]
| Mode | Title | Placeholder | Keyboard |
|------|-------|-------------|---------|
| create | New pot | Pot name (e.g. Holiday) | default |
| deposit | Add money | Amount (e.g. 50.00) | decimal-pad |
| withdraw | Take out | Amount (e.g. 25.00) | decimal-pad |

## Keyboard Handling [coverage: medium — 1 source]
`PotActionModal` wraps content in `KeyboardAvoidingView` with `behavior: Platform.OS === 'ios' ? 'padding' : 'height'` — satisfies the task's keyboard avoidance requirement for input forms.

## Testing [coverage: high — 1 source]
`PotList.test.tsx` — 15 tests covering full CRUD interaction:
- Create success → `addPot` called, modal closes
- Create failure → `fieldError` shown, modal stays open
- Deposit success → `updatePotBalance` + `applyTransaction({ type: 'pot_deposit', amount: -N })`
- Deposit failure → `fieldError` shown
- Invalid amounts (`'.'`, `'5abc'`, `'10.999'`, `'0'`) → field error shown, service never called (4 parameterised tests)
- Withdraw success → `updatePotBalance` + `applyTransaction({ type: 'pot_withdrawal', amount: N })`
- Withdraw failure → `fieldError` shown
- Delete alert: refund message when `balance > 0`
- Delete alert: empty message when `balance === 0`
- Delete confirm: `removePot` called, no transaction when `refundAmount === 0`
- Delete confirm: `applyTransaction({ amount: 75 })` + `removePot` when `refundAmount > 0`
- Delete service error: `removePot` NOT called when service returns `{ data: null }`

Key testing pattern: `typeInto(placeholder, value)` helper — `fireEvent.changeText` + `waitFor(getByDisplayValue)` to flush controlled input state before pressing Confirm.

## Sources [coverage: high — 7 sources]
- [src/api/pots.service.ts](../../src/api/pots.service.ts)
- [src/utils/money.ts](../../src/utils/money.ts)
- [src/types/index.ts](../../src/types/index.ts)
- [src/components/pot/PotList.tsx](../../src/components/pot/PotList.tsx)
- [src/components/pot/PotCard.tsx](../../src/components/pot/PotCard.tsx)
- [src/components/pot/PotActionModal.tsx](../../src/components/pot/PotActionModal.tsx)
- [src/components/pot/__tests__/PotList.test.tsx](../../src/components/pot/__tests__/PotList.test.tsx)
