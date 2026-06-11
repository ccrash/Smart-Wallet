---
topic: transport-layer
last_compiled: 2026-06-11
sources_count: 8
status: active
---

# Transport Layer [coverage: high — 8 sources]

## Summary [coverage: high — 8 sources]
The transport layer is a thin abstraction that lets all API services work identically in development (mock) and production (real HTTP) by swapping a single `ApiTransport` implementation. Services call `transport.get/post/del` and never know which backend they're talking to. Selection is compile-time: if `EXPO_PUBLIC_API_URL` is set, use `httpTransport`; otherwise use `mockTransport`.

All responses use a discriminated union — they always resolve (never reject), which eliminates unhandled promise rejections throughout the app.

Both transports have 100% statement coverage. The `httpTransport` branch of `index.ts` is verified by an isolated module test that sets `EXPO_PUBLIC_API_URL` before requiring the module.

## ApiTransport Interface [coverage: high — 1 source]
```ts
interface ApiTransport {
  get<T>(path: string, params?: Record<string, string | number>): Promise<ApiResponse<T>>
  post<T>(path: string, body?: unknown): Promise<ApiResponse<T>>
  put<T>(path: string, body?: unknown): Promise<ApiResponse<T>>
  del<T>(path: string): Promise<ApiResponse<T>>
}
```

## Response Shape [coverage: high — 1 source]
```ts
type ApiSuccess<T> = { data: T; error: null }
type ApiError     = { data: null; error: string }
type ApiResponse<T> = ApiSuccess<T> | ApiError
```
Callers pattern-match on `result.data !== null`. No try/catch needed at the call site.

## Transport Selection [coverage: high — 1 source]
```ts
// src/api/transport/index.ts
export const transport = process.env.EXPO_PUBLIC_API_URL ? httpTransport : mockTransport
```
Set `EXPO_PUBLIC_API_URL=https://api.example.com` in `.env` to switch to real HTTP.

## HTTP Transport [coverage: high — 1 source]
`src/api/transport/http.transport.ts` — wraps the browser/React Native `fetch` API.

**URL construction:** `new URL(BASE_URL + path)` — params are appended via `url.searchParams.set`. `BASE_URL` is captured at module load time from `process.env.EXPO_PUBLIC_API_URL`.

**Error handling paths:**
| Scenario | Returns |
|---|---|
| `res.ok` | `{ data: await res.json(), error: null }` |
| `!res.ok`, body has `message` | `{ data: null, error: payload.message }` |
| `!res.ok`, `res.json()` rejects | `{ data: null, error: res.statusText }` |
| `fetch` throws an `Error` | `{ data: null, error: err.message }` |
| `fetch` throws a non-Error | `{ data: null, error: 'Network error' }` |

Never throws — always returns `ApiResponse`.

## Mock Transport Routes [coverage: high — 1 source]
| Method | Path | Returns |
|--------|------|---------|
| GET | `/wallet/balance` | `number` |
| GET | `/wallet/transactions` | `{ items, hasMore }` |
| GET | `/pots` | `Pot[]` |
| GET | `/vouchers` | `Voucher[]` |
| GET | `/loyalty/balance` | `number` |
| POST | `/auth/sign-in` | `User` (hardcoded mock) |
| POST | `/auth/sign-out` | `void` |
| POST | `/pots` | `Pot` (validates name, checks duplicates) |
| POST | `/pots/:id/deposit` | `{ pot, debitAmount }` |
| POST | `/pots/:id/withdraw` | `{ pot, creditAmount }` |
| POST | `/vouchers/purchase` | `Voucher` (validates denomination + balance) |
| POST | `/loyalty/redeem` | `{ creditAmount, remainingPoints, transactionId }` |
| DELETE | `/pots/:id` | `{ refundAmount }` |

**Simulated delay:** 150 ms on every route (via `setTimeout`). Tests that use the mock transport must call `jest.useRealTimers()` in `beforeAll`.  
**Error handling:** Business rule violations throw inside `respond(handler)` and are caught → returned as `ApiError`. Unknown routes return an error response immediately.

**Amount validation:** `/pots/:id/deposit` and `/pots/:id/withdraw` validate amounts with `isValidAmount` from `src/utils/money.ts` — finite, positive, max 2 decimal places. This explicitly rejects `NaN`/`Infinity`, which the previous `amount <= 0` check let through (`NaN <= 0` is `false`). Resulting pot balances are rounded with `roundMoney` so they stay at exact 2dp. `/loyalty/redeem` is NaN-safe via its multiples-of-100 check (`NaN % 100 !== 0` is `true`); `/vouchers/purchase` via its denomination allow-list.

## Path Matching [coverage: medium — 1 source]
`matchPath(pattern, path)` — splits both strings by `/` and extracts `:param` segments. Returns `Record<string, string>` of captured params or `null` on mismatch. Used for `/pots/:id`, `/pots/:id/deposit`, `/pots/:id/withdraw`.

## generateId [coverage: high — 1 source]
`src/api/client.ts`: `Math.random().toString(36).slice(2, 11)` — 9-character alphanumeric. Not cryptographically secure; used for transaction IDs, pot IDs, voucher codes. Mocked to `'test-tx-id'` in all tests.

## Sources [coverage: high — 8 sources]
- [src/api/transport/types.ts](../../src/api/transport/types.ts)
- [src/utils/money.ts](../../src/utils/money.ts)
- [src/api/transport/index.ts](../../src/api/transport/index.ts)
- [src/api/transport/mock.transport.ts](../../src/api/transport/mock.transport.ts)
- [src/api/transport/http.transport.ts](../../src/api/transport/http.transport.ts)
- [src/api/transport/__tests__/http.transport.test.ts](../../src/api/transport/__tests__/http.transport.test.ts)
- [src/api/client.ts](../../src/api/client.ts)
- [src/types/index.ts](../../src/types/index.ts)
