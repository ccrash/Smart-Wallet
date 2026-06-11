---
topic: component-architecture
last_compiled: 2026-06-11
sources_count: 16
status: active
---

# Component Architecture [coverage: high — 16 sources]

## Summary [coverage: high — 16 sources]
All tab screens are thin layout shells — typically 10–15 lines. Each visual section is extracted into a self-contained component in `src/components/{domain}/` that reads directly from Zustand stores via selectors. This avoids prop-drilling, keeps screens readable, and makes each component independently testable.

Tab navigation is handled by a custom `FloatingTabBar` component rendered via expo-router's `tabBar` prop. All scroll containers call `useTabBarPadding()` to reserve space above the floating bar.

The app has two persisted Zustand stores beyond the wallet: `authStore` (session) and `themeStore` (appearance preference). The root `_layout.tsx` bridges the theme store into NativeWind's `setColorScheme` on mount and on preference change.

All interactive elements carry `accessibilityRole`, `accessibilityLabel`, and `accessibilityState` so the app is usable with screen readers. Modals set `accessibilityViewIsModal` to focus the accessibility tree on the modal content while it is open.

## The Pattern [coverage: high — 4 sources]
```
Screen (layout shell)
└── SectionComponent (self-contained)
    ├── useWalletStore((s) => s.relevantSlice)
    ├── local UI state (loading, modal, input, error)
    └── child presentational components (receive only display props)
```

**Rules:**
1. Screens own layout (ScrollView, background colour, padding) — nothing else. Bottom padding uses `useTabBarPadding()` on `contentContainerStyle`
2. Section components own their data fetching, local state, and handlers
3. Child components (cards, rows, modals) are purely presentational — they receive callbacks and display data via props
4. When two sections share interaction state (e.g., catalog + modals), they live in one component rather than lifting state to the screen

## Component Map [coverage: high — 16 sources]

### Wallet (`src/components/wallet/`)
| Component | Role |
|-----------|------|
| `BalanceCard` | Reads `balance` + `pots`; shows available balance + pot summary |
| `TransactionList` | Pagination state + `walletService` calls; renders rows + "Load more"; accessible load-more button with `accessibilityState={{ disabled: isLoadingMore }}` |
| `TransactionRow` | Presentational; icon, description, signed amount, running balance |

### Pot (`src/components/pot/`)
| Component | Role |
|-----------|------|
| `PotList` | All modal state + handlers + service calls; renders list |
| `PotCard` | Presentational pot card with Add / Take out / Delete actions; color derived from pot id hash across 10 palette colors |
| `PotActionModal` | Presentational bottom-sheet; receives all state as props |

### Voucher (`src/components/voucher/`)
| Component | Role |
|-----------|------|
| `ShopBalanceCard` | Balance + loyalty points summary for shop context |
| `VoucherCatalog` | Full purchase flow + modal state + both modals |
| `VoucherCard` | Denomination card; disabled when `!canAfford` |
| `VoucherConfirmModal` | Confirm bottom-sheet; buy button + error display |
| `VoucherSuccessModal` | Success overlay; shows code + points |
| `MyVouchers` | Reads `vouchers` from store; empty state or history list |
| `VoucherHistoryRow` | Presentational voucher history row |

### Rewards (`src/components/rewards/`)
| Component | Role |
|-----------|------|
| `PointsHeroCard` | Points balance + progress bar; store-connected |
| `RedeemCard` | Stepper + redemption flow; store-connected |
| `HowItWorksCard` | Static 3-step explainer; no props or state |

### Root (`src/components/`)
| Component | Role |
|-----------|------|
| `AppHeader` | User initials + display name; dark mode aware; rendered on every tab via `screenOptions.header` |
| `FloatingTabBar` | Custom tab bar; pill shape, Reanimated spring scale, accessibility roles. Exports `useTabBarPadding()` |

## FloatingTabBar Detail [coverage: high — 1 source]
`src/components/FloatingTabBar.tsx` replaces the default expo-router tab bar with a floating pill.

**Visual:** `position: absolute`, `bottom: safeAreaBottom + 12`, inset 20px each side, `borderRadius: 28`. Light: white + `#e5e7eb` border + shadow. Dark: `#18181b`, no border, stronger shadow.

**Active indicator:** Each icon is wrapped in an `Animated.View`. When focused: `backgroundColor: #208AEF`, `borderRadius: 14`. Icon color white; inactive icons muted gray.

**Animation:** Per-icon `useSharedValue` + `withSpring({ damping: 15, stiffness: 200 })` scales 0.85 → 1.0 on focus.

**Accessibility:** Each tab `Pressable` has:
- `accessibilityRole="tab"`
- `accessibilityLabel` from `TAB_LABELS` map (`index` → `"Wallet"`, `pots` → `"Pots"`, etc.)
- `accessibilityState={{ selected: isFocused }}`

**`useTabBarPadding()` hook:** Returns `TAB_BAR_HEIGHT (56) + TAB_BAR_OFFSET (12) + safeAreaBottom + 8`. Must be mocked in tests: `jest.mock('@/components/FloatingTabBar', () => ({ useTabBarPadding: jest.fn().mockReturnValue(0) }))`.

## Theme Store [coverage: high — 2 sources]
`src/store/themeStore.ts` | Persisted key: `sw-theme`

```ts
type ThemeState = {
  preference: ThemePreference   // 'light' | 'dark' | 'system'
  setPreference: (p: ThemePreference) => void
}
```

Default: `'system'`. The root `_layout.tsx` calls `setColorScheme(preference)` on mount and whenever `preference` changes, wiring NativeWind's color scheme to the stored preference. The Settings screen exposes a 3-button radio group (Light / Dark / System) to change this preference.

## Accessibility Conventions [coverage: high — 10 sources]
All interactive elements follow this pattern:

| Element type | accessibilityRole | accessibilityLabel | accessibilityState |
|---|---|---|---|
| Action button | `"button"` | Describes the action + context, e.g. `"Add money to Holiday"` | `{ disabled }` when relevant |
| Voucher card | `"button"` | `"${label}, ${pts} points earned"` | `{ disabled: !canAfford }` |
| Tab item | `"tab"` | Tab name from `TAB_LABELS` | `{ selected: isFocused }` |
| Theme radio | `"radio"` | `"${name} theme"` | `{ checked: active }` |
| TextInput | — | Field name e.g. `"New pot"` or `"Add money"` from modal config | — |
| Load more | `"button"` | `"Load more transactions"` / `"Loading more transactions"` | `{ disabled: isLoadingMore }` |

**Modals** (`PotActionModal`, `VoucherConfirmModal`, `VoucherSuccessModal`) all set `accessibilityViewIsModal` on the `<Modal>` element. This tells the OS accessibility layer to hide background content, focusing screen readers on the modal. Note: when a modal is open, RNTL's `getAllByText` will only find text inside the modal — background content is hidden from the accessibility tree.

**Icon-only buttons** always receive an explicit `accessibilityLabel`. Decorative icons inside labelled buttons do not need separate attributes.

## State Ownership Decision [coverage: high — 3 sources]
**Co-locate state with the component that renders it.**

- `TransactionList` owns `page`, `txList`, `isLoading`, `isLoadingMore`
- `VoucherCatalog` owns `selected`, `modalState`, `isSubmitting`, `error`, `lastVoucher` — rendered modals live inside `VoucherCatalog` because React Native's `Modal` renders at OS level regardless of tree position
- `PotList` owns all modal state — same reasoning; "New pot" button and list both need `openModal`

**Store vs local state:** Store = persisted financial data. Local = transient UI state. Never put UI state in the store.

## Why Single walletStore [coverage: high — 1 source]
Deliberately one store despite covering pots, vouchers, and loyalty. Voucher purchase atomically touches `balance`, `vouchers`, AND `loyaltyPoints`. Splitting would require coordinating writes across boundaries. Zustand selectors already provide component-level subscription isolation.

## Sources [coverage: high — 16 sources]
- [src/app/_layout.tsx](../../src/app/_layout.tsx)
- [src/app/(tabs)/_layout.tsx](../../src/app/(tabs)/_layout.tsx)
- [src/app/(tabs)/index.tsx](../../src/app/(tabs)/index.tsx)
- [src/app/(tabs)/pots.tsx](../../src/app/(tabs)/pots.tsx)
- [src/app/(tabs)/shop.tsx](../../src/app/(tabs)/shop.tsx)
- [src/app/(tabs)/rewards.tsx](../../src/app/(tabs)/rewards.tsx)
- [src/app/(tabs)/settings.tsx](../../src/app/(tabs)/settings.tsx)
- [src/store/themeStore.ts](../../src/store/themeStore.ts)
- [src/components/FloatingTabBar.tsx](../../src/components/FloatingTabBar.tsx)
- [src/components/AppHeader.tsx](../../src/components/AppHeader.tsx)
- [src/components/wallet/BalanceCard.tsx](../../src/components/wallet/BalanceCard.tsx)
- [src/components/wallet/TransactionList.tsx](../../src/components/wallet/TransactionList.tsx)
- [src/components/pot/PotList.tsx](../../src/components/pot/PotList.tsx)
- [src/components/pot/PotCard.tsx](../../src/components/pot/PotCard.tsx)
- [src/components/pot/PotActionModal.tsx](../../src/components/pot/PotActionModal.tsx)
- [src/components/voucher/VoucherCatalog.tsx](../../src/components/voucher/VoucherCatalog.tsx)
