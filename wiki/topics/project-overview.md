---
topic: project-overview
last_compiled: 2026-06-10
sources_count: 5
status: active
---

# Project Overview [coverage: high — 5 sources]

## Summary [coverage: high — 5 sources]
Smart Wallet is a mobile-first React Native (Expo) take-home exercise implementing a digital wallet with five core features: Google sign-in, a main wallet with transaction history, savings pots, a voucher shop, and a loyalty points scheme. The app targets both iOS/Android and web via a single codebase. The goal is clean architecture and product thinking under time pressure rather than pixel-perfection.

Sources: CLAUDE.md, AGENTS.md, package.json, src/app/_layout.tsx, src/app/(tabs)/_layout.tsx — all current as of 2026-06-10.

## Stack [coverage: high — 3 sources]
| Concern | Choice | Version |
|---------|--------|---------|
| Framework | React Native + Expo | RN 0.81.5, Expo ~54 |
| Language | TypeScript | ~5.9.2 |
| Routing | expo-router (file-based) | ~6.0.24 |
| State | Zustand | ^5.0.14 |
| Persistence | AsyncStorage | ^2.2.0 |
| Styling | NativeWind (Tailwind) | ^4.2.5 |
| Icons | @expo/vector-icons (Ionicons) | ^15.1.1 |
| Animation | react-native-reanimated | ~4.1.1 |
| Testing | Jest + jest-expo + @testing-library/react-native | 29 / 54 / 14 |

## Navigation Architecture [coverage: high — 2 sources]
expo-router uses file-based routing with two route groups:

- `(auth)/` — unauthenticated shell; currently only `sign-in.tsx`
- `(tabs)/` — main app; five tabs: Wallet (`index`), Pots, Shop, Rewards, Settings

Auth guard lives in `(tabs)/_layout.tsx`: after AsyncStorage hydration (`isHydrated`), unauthenticated users are redirected to `/(auth)/sign-in`. The root `_layout.tsx` seeds the wallet balance (£500) on first launch after hydration.

`AppHeader` is rendered on every tab via `screenOptions.header`, showing user initials and display name from `authStore`.

**Tab bar:** A custom `FloatingTabBar` component is passed to expo-router's `tabBar` prop, replacing the default tab bar. It renders as a floating pill (`position: absolute`) with icon-only navigation and a Reanimated spring animation on tab switch. Each scroll container adds bottom padding via the `useTabBarPadding()` hook (exported from `FloatingTabBar`) so content is never hidden behind the bar. No `screenLayout` wrapper is used — screens own their own bottom padding, keeping the area outside the pill fully transparent.

## Features [coverage: high — 2 sources]
1. **Auth** — Mock Google sign-in; session persisted to AsyncStorage
2. **Wallet** — £500 seeded balance; transaction history with pagination; balance never goes negative
3. **Pots** — Named savings pots; deposit/withdraw/delete with wallet balance sync
4. **Voucher Shop** — £10/£25/£50/£100 denominations; generates voucher code on purchase
5. **Loyalty Rewards** — 1 pt per £1 spent; redeem in multiples of 100 pts (100 pts = £1)

## Key Design Decisions [coverage: high — 2 sources]
- No backend required — all data is local via a mock transport + AsyncStorage persistence
- Single Zustand store (`walletStore`) for all financially coupled state (balance, transactions, pots, vouchers, loyalty points) — deliberate; splitting would break atomic cross-domain writes
- Separate `authStore` and `themeStore` for non-financial concerns
- Component architecture: screens are thin layout shells; each section is a self-contained component that reads directly from the store
- Custom tab bar (`FloatingTabBar`) with no `screenLayout` wrapper: transparent outside-pill area achieved by having each scroll container manage its own `paddingBottom` via `useTabBarPadding()`

## Sources [coverage: high — 5 sources]
- [CLAUDE.md](../../CLAUDE.md)
- [AGENTS.md](../../AGENTS.md)
- [package.json](../../package.json)
- [src/app/_layout.tsx](../../src/app/_layout.tsx)
- [src/app/(tabs)/_layout.tsx](../../src/app/(tabs)/_layout.tsx)
