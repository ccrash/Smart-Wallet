# Smart Wallet Wiki — Schema

## Topics

| Slug | Description | Status |
|------|-------------|--------|
| `project-overview` | Overall project brief, stack table, navigation architecture, five features, key design decisions | active |
| `auth` | Auth store, mock sign-in service, session persistence, auth guard, AppHeader | active |
| `wallet-core` | walletStore, db singleton, transaction model, applyTransaction, pagination, balance integrity | active |
| `pots` | Savings pots feature — service API, business rules, PotList state machine, PotCard, PotActionModal | active |
| `voucher-shop` | Voucher purchase flow — catalog, VoucherCatalog, ShopBalanceCard, MyVouchers, modals, balance guard | active |
| `loyalty-rewards` | Loyalty scheme — earn rate, RedeemCard stepper, PointsHeroCard progress, redemption flow | active |
| `transport-layer` | ApiTransport interface, ApiResponse union, mock/http transports, route table, path matching | active |
| `component-architecture` | Thin-shell screen pattern, component map by domain, state ownership rules, single-store rationale | active |
| `testing` | Test stack, file map, store mocking pattern, async patterns, spy cleanup, PotList test detail | active |

## Concepts

_None identified on first compile. Re-run after adding more domain complexity._

## Naming Conventions
- Topic slugs: `lowercase-kebab-case`
- Source links: relative markdown paths from `topics/` to `src/`
- Coverage tags: `[coverage: high — N sources]`, `[coverage: medium — N sources]`, `[coverage: low — N sources]`

## Evolution Log
- **2026-06-10**: Initial schema generated from 9 topics, 0 concepts
- **2026-06-10**: Updated `component-architecture` — added FloatingTabBar, useTabBarPadding hook, floating tab bar pattern; updated `project-overview` — navigation architecture now reflects custom tab bar and per-screen padding strategy
