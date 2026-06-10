---
topic: pots
last_compiled: 2026-06-10
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

## Business Rules [coverage: high — 2 sources]
| Operation | Validation |
|-----------|-----------|
| Create | Name non-empty, ≤30 chars, case-insensitive unique across existing pots |
| Deposit | Amount > 0, wallet balance ≥ amount |
| Withdraw | Amount > 0, pot balance ≥ amount |
| Delete | Always succeeds; returns `refundAmount = pot.balance` (can be 0) |

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
- `deposit` → `potsService.deposit(id, parseFloat(inputValue))` → `updatePotBalance(id, newBalance)` + `applyTransaction({ type: 'pot_deposit', amount: -debitAmount })` → `closeModal()`
- `withdraw` → `potsService.withdraw(id, parseFloat(inputValue))` → `updatePotBalance(id, newBalance)` + `applyTransaction({ type: 'pot_withdrawal', amount: creditAmount })` → `closeModal()`

**`handleDelete`** — shows `Alert.alert` with a refund message if `pot.balance > 0`; on confirm, calls `potsService.remove`, optionally applies a `pot_withdrawal` transaction (if `refundAmount > 0`), then calls `removePot(id)`.

## Modal Config [coverage: medium — 1 source]
| Mode | Title | Placeholder | Keyboard |
|------|-------|-------------|---------|
| create | New pot | Pot name (e.g. Holiday) | default |
| deposit | Add money | Amount (e.g. 50.00) | decimal-pad |
| withdraw | Take out | Amount (e.g. 25.00) | decimal-pad |

## Keyboard Handling [coverage: medium — 1 source]
`PotActionModal` wraps content in `KeyboardAvoidingView` with `behavior: Platform.OS === 'ios' ? 'padding' : 'height'` — satisfies the task's keyboard avoidance requirement for input forms.

## Testing [coverage: high — 2 sources]
14 tests total across two files:
- **`PotList.test.tsx`** (10 tests): create success/fail, deposit success/fail, withdraw success/fail, delete alert message variants (with/without balance), delete confirm with and without refund transaction
- **`PotsScreen.test.tsx`** (4 tests): empty state, pot card rendering, modal open on "New pot", deposit modal open

Key testing pattern: `typeInto(placeholder, value)` helper — `fireEvent.changeText` + `waitFor(getByDisplayValue)` to flush controlled input state before pressing Confirm.

## Sources [coverage: high — 7 sources]
- [src/api/pots.service.ts](../../src/api/pots.service.ts)
- [src/types/index.ts](../../src/types/index.ts)
- [src/components/pot/PotList.tsx](../../src/components/pot/PotList.tsx)
- [src/components/pot/PotCard.tsx](../../src/components/pot/PotCard.tsx)
- [src/components/pot/PotActionModal.tsx](../../src/components/pot/PotActionModal.tsx)
- [src/app/(tabs)/pots.tsx](../../src/app/(tabs)/pots.tsx)
- [src/components/pot/__tests__/PotList.test.tsx](../../src/components/pot/__tests__/PotList.test.tsx)
