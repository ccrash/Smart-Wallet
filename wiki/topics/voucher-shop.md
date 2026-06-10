---
topic: voucher-shop
last_compiled: 2026-06-10
sources_count: 9
status: active
---

# Voucher Shop [coverage: high — 9 sources]

## Summary [coverage: high — 9 sources]
The voucher shop lets users buy preset gift vouchers (£10, £25, £50, £100). Purchasing deducts the face value from the main wallet, generates a unique voucher code (format: `SW-XXXXXXXX`), and awards loyalty points equal to the denomination value. The shop screen is split into three self-contained components: `ShopBalanceCard`, `VoucherCatalog` (owns the full purchase flow + modals), and `MyVouchers`.

## Data Model [coverage: high — 1 source]
```ts
type VoucherProduct = {
  denomination: number   // 10 | 25 | 50 | 100
  label: string          // "£10 Voucher" etc.
  description: string
  pointsEarned: number   // equals denomination (1 pt per £1)
}

type Voucher = {
  id: string
  denomination: number
  code: string           // "SW-XXXXXXXX"
  purchasedAt: string    // ISO string
  pointsEarned: number
}
```

## Service API [coverage: high — 1 source]
```ts
vouchersService.list()                  // GET  /vouchers  → Voucher[]
vouchersService.purchase(denomination)  // POST /vouchers/purchase → Voucher
```

## Catalog [coverage: high — 1 source]
Four preset denominations loaded from `src/data/vouchers.json`:

| Denomination | Points Earned | Effective Cashback |
|-------------|-------------|-------------------|
| £10 | 10 pts | 1% |
| £25 | 25 pts | 1% |
| £50 | 50 pts | 1% |
| £100 | 100 pts | 1% |

Rendered as a 2×2 grid in `VoucherCatalog` via `CATALOG_ROWS`.

## Purchase Flow [coverage: high — 3 sources]
1. User taps a `VoucherCard` (disabled if `balance < denomination`)
2. `handleSelect(product)` → opens confirm modal (`modalState = 'confirm'`)
3. User confirms → `handlePurchase()`:
   - `vouchersService.purchase(denomination)` → validates denomination + balance
   - On success: `addVoucher(voucher)`, `applyTransaction({ type: 'voucher_purchase', amount: -denomination })`, `setLoyaltyPoints(loyaltyPoints + pointsEarned)`, `setModalState('success')`
   - On error: sets `error` string, keeps modal open
4. Success modal shows voucher code + points earned → `closeModal()` resets all state

## Component Architecture [coverage: high — 4 sources]
```
shop.tsx (thin shell)
├── ShopBalanceCard  — balance + loyalty points summary
├── VoucherCatalog   — catalog grid + purchase state + both modals
│   ├── VoucherCard × 4
│   ├── VoucherConfirmModal
│   └── VoucherSuccessModal
└── MyVouchers       — purchased vouchers list
    └── VoucherHistoryRow × N
```

**Modals live inside `VoucherCatalog`** (inside the ScrollView) because React Native's `Modal` component renders at OS level regardless of tree position — no need to hoist them outside the scroll container.

## Voucher Code Format [coverage: high — 1 source]
`SW-${generateId().toUpperCase().slice(0, 8)}` — produces codes like `SW-AB3F72K1`. Not redeemable; display only.

## Balance Guard [coverage: high — 2 sources]
- `VoucherCard` receives `canAfford={balance >= denomination}` — renders disabled + reduced opacity when false
- Mock transport also validates: throws `'Insufficient balance.'` if balance < denomination
- Two-layer guard prevents UX and service-level overdraft

## Testing [coverage: high — 1 source]
9 tests in `ShopScreen.test.tsx`:
- Balance + points displayed in header
- All 4 denomination cards render
- Empty state when no vouchers
- Voucher history with code and points
- Confirm modal opens on card press
- Modal does NOT open when balance insufficient
- Purchase calls service + updates store
- Success modal shows after purchase
- Inline error on purchase failure

## Sources [coverage: high — 9 sources]
- [src/api/vouchers.service.ts](../../src/api/vouchers.service.ts)
- [src/types/index.ts](../../src/types/index.ts)
- [src/components/voucher/VoucherCatalog.tsx](../../src/components/voucher/VoucherCatalog.tsx)
- [src/components/voucher/ShopBalanceCard.tsx](../../src/components/voucher/ShopBalanceCard.tsx)
- [src/components/voucher/MyVouchers.tsx](../../src/components/voucher/MyVouchers.tsx)
- [src/components/voucher/VoucherCard.tsx](../../src/components/voucher/VoucherCard.tsx)
- [src/components/voucher/VoucherConfirmModal.tsx](../../src/components/voucher/VoucherConfirmModal.tsx)
- [src/components/voucher/VoucherSuccessModal.tsx](../../src/components/voucher/VoucherSuccessModal.tsx)
- [src/app/(tabs)/shop.tsx](../../src/app/(tabs)/shop.tsx)
