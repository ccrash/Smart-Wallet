# Smart Wallet Knowledge Base

Last compiled: 2026-06-11
Total topics: 9 | Total sources: 65

## Topics

| Topic | Also Known As | Sources | Last Updated | Status |
|-------|--------------|---------|-------------|--------|
| [project-overview](topics/project-overview.md) | overview, stack, architecture, navigation, expo, react native, tab bar | 5 | 2026-06-10 | active |
| [auth](topics/auth.md) | authentication, sign-in, google oauth, session, authStore | 6 | 2026-06-11 | active |
| [wallet-core](topics/wallet-core.md) | wallet, balance, transactions, db, walletStore, history, pagination | 8 | 2026-06-11 | active |
| [pots](topics/pots.md) | savings pots, pots, deposit, withdraw, PotList, PotCard | 6 | 2026-06-11 | active |
| [voucher-shop](topics/voucher-shop.md) | vouchers, shop, purchase, VoucherCatalog, denomination | 9 | 2026-06-10 | active |
| [loyalty-rewards](topics/loyalty-rewards.md) | loyalty, points, rewards, redeem, RedeemCard, cashback | 5 | 2026-06-10 | active |
| [transport-layer](topics/transport-layer.md) | transport, mock, http, ApiTransport, ApiResponse, services | 7 | 2026-06-10 | active |
| [component-architecture](topics/component-architecture.md) | components, architecture, pattern, self-contained, store, screens, FloatingTabBar, useTabBarPadding, tab bar, accessibility, themeStore | 16 | 2026-06-11 | active |
| [testing](topics/testing.md) | tests, jest, RNTL, mocking, coverage, component tests, walletStore tests | 18 | 2026-06-11 | active |

## Recent Changes
- 2026-06-11: Updated `auth` (sign-in flow now bypasses authService, calls authStore.signIn directly; AppHeader dark mode), `component-architecture` (themeStore added, TransactionList accessibility), `testing` (walletStore 13 tests, TransactionList 5 tests with load-more spinner), `pots` (removed stale PotsScreen.test.tsx reference, PotCard color detail)
- 2026-06-10: Updated `testing` (18 files, 122 tests, screen→component restructure, http transport isolation), `component-architecture` (accessibility conventions, TAB_LABELS), `transport-layer` (100% coverage, error paths table, http.transport.test.ts)
- 2026-06-10: Updated `component-architecture` (FloatingTabBar, useTabBarPadding) and `project-overview` (custom tab bar architecture)
- 2026-06-10: Initial compilation — 9 topics created from 54 sources
