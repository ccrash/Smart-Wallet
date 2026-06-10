---
topic: loyalty-rewards
last_compiled: 2026-06-10
sources_count: 5
status: active
---

# Loyalty Rewards [coverage: high — 5 sources]

## Summary [coverage: high — 5 sources]
The loyalty scheme awards 1 point per £1 spent on vouchers. Points accumulate in `walletStore.loyaltyPoints` and can be redeemed in multiples of 100 for wallet credit (100 pts = £1.00 — 1% effective cashback). The rewards screen is split into three self-contained components: `PointsHeroCard` (balance display + progress), `RedeemCard` (stepper + redemption flow), and `HowItWorksCard` (static explainer).

## Business Rules [coverage: high — 2 sources]
| Rule | Detail |
|------|--------|
| Earn rate | 1 pt per £1 of voucher face value |
| Redemption unit | 100 pts minimum, multiples of 100 only |
| Credit rate | 100 pts = £1.00 wallet credit |
| Points floor | Cannot go negative (enforced by mock transport + UX clamp) |
| Credit destination | Added directly to main wallet via `applyTransaction` |

## Service API [coverage: high — 1 source]
```ts
loyaltyService.getBalance()    // GET  /loyalty/balance → number
loyaltyService.redeem(points)  // POST /loyalty/redeem → { creditAmount, remainingPoints, transactionId }
```

## Redemption Flow [coverage: high — 2 sources]
1. `RedeemCard` computes `maxRedeemable = floor(loyaltyPoints / 100) * 100`
2. If `maxRedeemable === 0` → shows empty state ("Not enough points yet")
3. Stepper allows selecting 100..maxRedeemable in steps of 100; `creditPreview = redeemAmount / 100`
4. On "Redeem N pts":
   - `loyaltyService.redeem(redeemAmount)` → validates server-side
   - `applyTransaction({ type: 'points_redemption', amount: creditAmount, description: 'Redeemed N pts for £X.XX credit' })`
   - `setLoyaltyPoints(remainingPoints)`
   - Shows inline success message; resets stepper to next valid amount

## Progress Bar [coverage: medium — 1 source]
`PointsHeroCard` shows progress toward the next redemption threshold:
- `progressPct = (loyaltyPoints % 100) / 100`
- White bar on primary blue background
- Labels: "{N % 100} / 100 pts to next £1" and "{maxRedeemable} redeemable" (or "Earn more to redeem")

## Component Architecture [coverage: high — 2 sources]
```
rewards.tsx (thin shell)
├── PointsHeroCard   — points balance + progress bar (store-connected)
├── RedeemCard       — full redemption flow + state (store-connected)
└── HowItWorksCard   — static 3-step explainer (no props/state)
```

`HowItWorksCard` renders from a `STEPS` constant array — avoids JSX repetition for the three earn/redeem/use steps.

## Where Points Are Set [coverage: high — 2 sources]
Points are updated via `walletStore.setLoyaltyPoints(n)` from two locations:
- **`VoucherCatalog`** — after purchase: `setLoyaltyPoints(loyaltyPoints + pointsEarned)`
- **`RedeemCard`** — after redemption: `setLoyaltyPoints(remainingPoints)` from service response

Both write to `walletStore` which persists to AsyncStorage.

## Sources [coverage: high — 5 sources]
- [src/api/loyalty.service.ts](../../src/api/loyalty.service.ts)
- [src/components/rewards/PointsHeroCard.tsx](../../src/components/rewards/PointsHeroCard.tsx)
- [src/components/rewards/RedeemCard.tsx](../../src/components/rewards/RedeemCard.tsx)
- [src/components/rewards/HowItWorksCard.tsx](../../src/components/rewards/HowItWorksCard.tsx)
- [src/app/(tabs)/rewards.tsx](../../src/app/(tabs)/rewards.tsx)
