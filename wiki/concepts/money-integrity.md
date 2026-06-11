---
concept: Money Integrity
last_compiled: 2026-06-11
topics_connected: [wallet-core, pots, transport-layer, voucher-shop, loyalty-rewards]
status: active
---

# Money Integrity

## Pattern
Every feature that moves money enforces correctness in layers rather than in one place: the form rejects malformed text before any service call, the mock transport (acting as the "server") independently re-validates the parsed amount and the business rule (sufficient balance, valid denomination, multiples of 100), and the store rounds every arithmetic result to 2 decimal places. No single layer is trusted to be the only guard.

The motivating failure mode is JavaScript's permissive number handling: `parseFloat('.')` is `NaN`, and `NaN` passes naive checks like `amount <= 0` and `balance < amount` (both are `false`), so without explicit `Number.isFinite` guards a malformed input silently corrupts a persisted balance. Similarly, repeated float arithmetic (`499.9 - 0.2`) drifts away from exact 2dp values unless every result is rounded.

## Instances
- **2026-06-11** in [pots](../topics/pots.md): `PotList` parses deposit/withdraw input with `parseMoneyInput` and never calls the service on malformed text; the transport re-validates with `isValidAmount`.
- **2026-06-11** in [transport-layer](../topics/transport-layer.md): deposit/withdraw handlers reject NaN/Infinity/sub-penny amounts and round resulting pot balances with `roundMoney`.
- **2026-06-11** in [wallet-core](../topics/wallet-core.md): `applyTransaction` rounds the wallet balance on every mutation; `src/utils/money.ts` created as the single home for money rules.
- **2026-06-10** in [voucher-shop](../topics/voucher-shop.md): purchase validated against a denomination allow-list (inherently NaN-safe) plus a balance guard in the transport.
- **2026-06-10** in [loyalty-rewards](../topics/loyalty-rewards.md): redemption restricted to multiples of 100 (`NaN % 100 !== 0` makes this NaN-safe) with a non-negative points guard; the UI stepper only produces valid values.

## What This Means
Validation placement mirrors a real client/server split even though everything runs in-process: the transport behaves as the authoritative validator (what a backend would do), while forms validate for UX (fast, friendly errors without a round trip). When the mock transport is swapped for a real API (`EXPO_PUBLIC_API_URL`), the client-side layer keeps working unchanged and the server contract is already documented by the mock's checks. The corollary: any new money-moving feature should (1) parse user text with `parseMoneyInput`, (2) validate in its transport handler with `isValidAmount`, and (3) round any stored result with `roundMoney` — skipping any layer reintroduces the NaN/drift class of bug.

## Sources
- [wallet-core](../topics/wallet-core.md)
- [pots](../topics/pots.md)
- [transport-layer](../topics/transport-layer.md)
- [voucher-shop](../topics/voucher-shop.md)
- [loyalty-rewards](../topics/loyalty-rewards.md)
