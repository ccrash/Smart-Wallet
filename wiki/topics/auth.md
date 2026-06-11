---
topic: auth
last_compiled: 2026-06-11
sources_count: 6
status: active
---

# Authentication [coverage: high — 6 sources]

## Summary [coverage: high — 6 sources]
Authentication is a mock implementation standing in for Google OAuth. The sign-in screen directly calls `authStore.signIn()` with a hardcoded user (`Alex Johnson`) — bypassing `authService` entirely. Session is persisted to AsyncStorage under `sw-auth` so users remain signed in across launches. The auth guard in `(tabs)/_layout.tsx` blocks unauthenticated navigation until after AsyncStorage hydration completes.

`authService.signInMock()` (which POSTs to `/auth/sign-in`) still exists and is covered by tests, but the UI no longer calls it — the sign-in screen now sets store state directly, making the flow synchronous and zero-latency.

Real Google OAuth (OAuth 2.0 via `expo-auth-session` or similar) was intentionally not implemented — when it is, the intent is to call `authStore.signIn(user)` after a successful OAuth exchange.

## Auth Store [coverage: high — 1 source]
**File:** `src/store/authStore.ts` | Persisted key: `sw-auth`

| Field | Type | Description |
|-------|------|-------------|
| `user` | `User \| null` | Signed-in user or null |
| `isAuthenticated` | `boolean` | Derived gate used by the auth guard |
| `isHydrated` | `boolean` | Set to true once AsyncStorage has rehydrated; prevents flash-of-wrong-route |

Actions: `signIn(user)`, `signOut()`, `_setHydrated()` (called internally by persist middleware's `onRehydrateStorage` callback).

## Sign-In Flow [coverage: high — 1 source]
`src/app/(auth)/sign-in.tsx`:
```
User taps "Sign in with Google"
→ authStore.signIn({ id: 'mock-user-001', displayName: 'Alex Johnson', email: 'alex@example.com', photoURL: null })
→ router.replace('/(tabs)')
```
No network call. The `authService.signInMock()` transport route still works but is only exercised by service-layer tests.

## Auth Service [coverage: medium — 2 sources]
```ts
authService.signInMock()   // POST /auth/sign-in  → ApiResponse<User>
authService.signOut()      // POST /auth/sign-out  → ApiResponse<void>
```
Both delegate to `transport` — the mock transport returns a hardcoded `MOCK_USER` with a simulated 150 ms network delay. The service exists for testing and future real OAuth integration; the current UI does not call it.

## Auth Guard [coverage: high — 1 source]
Located in `src/app/(tabs)/_layout.tsx`:
1. While `!isHydrated` — render `null` (blank screen, prevents premature redirect)
2. While `!isAuthenticated` — `<Redirect href="/(auth)/sign-in" />`
3. Otherwise — render the tab navigator with `FloatingTabBar` and `AppHeader` in `screenOptions`

## AppHeader [coverage: high — 1 source]
`src/components/AppHeader.tsx` — rendered on every tab via `screenOptions.header`. Derives two-letter initials from `user.displayName` (e.g. "Alex Johnson" → "AJ"). Falls back to `?` if no user. Shows display name + "Welcome back" sub-label. Supports light/dark mode via NativeWind classes (`bg-white dark:bg-zinc-950`, `text-black dark:text-white`).

## Known Limitations [coverage: medium — 2 sources]
- No real Google OAuth; sign-in sets store state directly with a hardcoded mock user
- `photoURL` is always `null` in mock; no avatar image rendered (initials placeholder only)
- Sign-out UX lives in the Settings tab

## Sources [coverage: high — 6 sources]
- [src/store/authStore.ts](../../src/store/authStore.ts)
- [src/api/auth.service.ts](../../src/api/auth.service.ts)
- [src/api/transport/mock.transport.ts](../../src/api/transport/mock.transport.ts)
- [src/components/AppHeader.tsx](../../src/components/AppHeader.tsx)
- [src/app/(tabs)/_layout.tsx](../../src/app/(tabs)/_layout.tsx)
- [src/api/__tests__/auth.service.test.ts](../../src/api/__tests__/auth.service.test.ts)
