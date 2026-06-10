---
topic: auth
last_compiled: 2026-06-10
sources_count: 6
status: active
---

# Authentication [coverage: high — 6 sources]

## Summary [coverage: high — 6 sources]
Authentication is a mock implementation standing in for Google OAuth. The `authService` POSTs to `/auth/sign-in` which returns a hardcoded user (`Alex Johnson`). Session is persisted to AsyncStorage under `sw-auth` so users remain signed in across launches. The auth guard in `(tabs)/_layout.tsx` blocks unauthenticated navigation until after AsyncStorage hydration completes.

Real Google OAuth (OAuth 2.0 via `expo-auth-session` or similar) was intentionally not implemented — the transport layer is designed to swap mock → real HTTP without changing service or store code.

## Auth Store [coverage: high — 1 source]
**File:** `src/store/authStore.ts` | Persisted key: `sw-auth`

| Field | Type | Description |
|-------|------|-------------|
| `user` | `User \| null` | Signed-in user or null |
| `isAuthenticated` | `boolean` | Derived gate used by the auth guard |
| `isHydrated` | `boolean` | Set to true once AsyncStorage has rehydrated; prevents flash-of-wrong-route |

Actions: `signIn(user)`, `signOut()`, `_setHydrated()` (called internally by persist middleware).

## Auth Service [coverage: high — 2 sources]
```ts
authService.signInMock()   // POST /auth/sign-in  → ApiResponse<User>
authService.signOut()      // POST /auth/sign-out  → ApiResponse<void>
```
Both delegate to `transport` — the mock transport returns a hardcoded `MOCK_USER` with a simulated 150 ms network delay.

## Auth Guard [coverage: high — 1 source]
Located in `src/app/(tabs)/_layout.tsx`:
1. While `!isHydrated` — render `null` (blank screen, prevents premature redirect)
2. While `!isAuthenticated` — `<Redirect href="/(auth)/sign-in" />`
3. Otherwise — render the tab navigator

## AppHeader [coverage: high — 1 source]
`src/components/AppHeader.tsx` — rendered on every tab. Derives two-letter initials from `user.displayName` (e.g. "Alex Johnson" → "AJ"). Falls back to `?` if no user. Shows display name + "Welcome back" sub-label.

## Known Limitations [coverage: medium — 2 sources]
- No real Google OAuth; `signInMock()` skips all OAuth flows
- `photoURL` is always `null` in mock; no avatar image rendered
- Sign-out UX lives in the Settings tab (confirmed by settings screen test)

## Sources [coverage: high — 6 sources]
- [src/store/authStore.ts](../../src/store/authStore.ts)
- [src/api/auth.service.ts](../../src/api/auth.service.ts)
- [src/api/transport/mock.transport.ts](../../src/api/transport/mock.transport.ts)
- [src/components/AppHeader.tsx](../../src/components/AppHeader.tsx)
- [src/app/(tabs)/_layout.tsx](../../src/app/(tabs)/_layout.tsx)
- [src/api/__tests__/auth.service.test.ts](../../src/api/__tests__/auth.service.test.ts)
