---
topic: auth
last_compiled: 2026-06-11
sources_count: 6
status: active
---

# Authentication [coverage: high — 6 sources]

## Summary [coverage: high — 6 sources]
Authentication is a mock implementation standing in for Google OAuth. The sign-in screen collects a display name and calls `authService.signIn(name)`, which POSTs to `/auth/sign-in`; the mock transport validates the name and derives a demo user (id, name, slugged email, `photoURL: null`) from it. On success the screen calls `authStore.signIn(user)` and redirects. Session is persisted to AsyncStorage under `sw-auth` so users remain signed in across launches. The auth guard in `(tabs)/_layout.tsx` blocks unauthenticated navigation until after AsyncStorage hydration completes.

Real Google OAuth (OAuth 2.0 via `expo-auth-session` or similar) was intentionally not implemented — see `README_INTERVIEW.md` for the scope rationale. When it is added, the intent is to call `authStore.signIn(user)` after a successful OAuth exchange, leaving the guard/persistence/sign-out lifecycle unchanged.

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
User enters a display name, taps "Continue"
→ authService.signIn(name)            // POST /auth/sign-in { displayName }
→ on success: authStore.signIn(user)  // user derived from the entered name
→ router.replace('/(tabs)')
```
On a validation error (empty name, or over the 30-char limit) the transport returns `{ error }` and the screen shows it inline instead of navigating.

## Auth Service [coverage: medium — 2 sources]
```ts
authService.signIn(displayName)  // POST /auth/sign-in  → ApiResponse<User>
authService.signOut()            // POST /auth/sign-out  → ApiResponse<void>
```
Both delegate to `transport`. The mock handler for `/auth/sign-in` trims/validates the name, rejects empty or over-length input, and derives a `User` (generated id, slugged `…@demo.smartwallet.app` email, `photoURL: null`) with a simulated 150 ms network delay.

## Auth Guard [coverage: high — 1 source]
Located in `src/app/(tabs)/_layout.tsx`:
1. While `!isHydrated` — render `null` (blank screen, prevents premature redirect)
2. While `!isAuthenticated` — `<Redirect href="/(auth)/sign-in" />`
3. Otherwise — render the tab navigator with `FloatingTabBar` and `AppHeader` in `screenOptions`

## AppHeader [coverage: high — 1 source]
`src/components/AppHeader.tsx` — rendered on every tab via `screenOptions.header`. Derives two-letter initials from `user.displayName` (e.g. "Alex Johnson" → "AJ"). Falls back to `?` if no user. Shows display name + "Welcome back" sub-label. Supports light/dark mode via NativeWind classes (`bg-white dark:bg-zinc-950`, `text-black dark:text-white`).

## Known Limitations [coverage: medium — 2 sources]
- No real Google OAuth; sign-in derives a demo user from a typed display name (see `README_INTERVIEW.md`)
- `photoURL` is always `null` in mock; no avatar image rendered (initials placeholder only)
- Sign-out UX lives in the Settings tab

## Sources [coverage: high — 6 sources]
- [src/store/authStore.ts](../../src/store/authStore.ts)
- [src/api/auth.service.ts](../../src/api/auth.service.ts)
- [src/api/transport/mock.transport.ts](../../src/api/transport/mock.transport.ts)
- [src/components/AppHeader.tsx](../../src/components/AppHeader.tsx)
- [src/app/(tabs)/_layout.tsx](../../src/app/(tabs)/_layout.tsx)
- [src/api/__tests__/auth.service.test.ts](../../src/api/__tests__/auth.service.test.ts)
