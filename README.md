# Smart Wallet

A mobile-first personal finance app — wallet, savings pots, a voucher shop, and loyalty
points — built with React Native (Expo) and TypeScript. Runs on iOS, Android, and the web
from a single codebase.

---

![plot](./assets/screenshots/ios_recording.gif)

---

## Quick start

```bash
npm install
npm start        # builds the app and prints a QR code
```

Then choose a target:

- **Mobile** — install **Expo Go** ([iOS](https://apps.apple.com/app/expo-go/id982107779) /
  [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)) and scan the QR
  code from the terminal (iOS: Camera app; Android: the Expo Go scanner).
- **Web** — press `w` in the terminal to open the browser version.

If `npm start` can't connect (corporate Wi‑Fi, VPN, or other network restrictions), use the
tunnel instead, which routes through Expo's servers:

```bash
npm run start:tunnel
```

Other handy scripts:

```bash
npm test         # Jest suite
npm run android  # open directly in an Android emulator
npm run ios      # open directly in an iOS simulator (macOS)
```

No environment variables are required — the app ships with a built-in mock backend that
runs entirely in-process. To point at a real backend, set `EXPO_PUBLIC_API_URL`.

---

## Features

| Feature | Notes |
|---|---|
| Sign in | Local demo profile (name input); session persists across launches |
| Wallet | Balance and paginated transaction history with running balances |
| Savings pots | Create, deposit, withdraw, delete — pot money is ring-fenced from the wallet |
| Voucher shop | Buy preset vouchers; a voucher code is generated on purchase |
| Loyalty rewards | Earn 1 pt per £1 spent; redeem 100 pts for £1.00 wallet credit |
| Biometric app lock | Optional Face ID / fingerprint / device PIN lock (mobile only) |
| Dark mode | Light / dark / system, switchable in Settings |

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Expo SDK 54 (managed workflow), React Native + react-native-web |
| Navigation | expo-router — file-system routing |
| Styling | NativeWind 4 (Tailwind CSS for native and web) |
| State | Zustand 5 with AsyncStorage persistence |
| Testing | Jest + React Native Testing Library |
| Language | TypeScript, strict |

---

## Architecture in brief

**Transport abstraction.** Every feature talks to a small service layer, which calls an
`ApiTransport` interface. The default implementation is an in-process mock that owns all
business rules and simulates network latency; a real `fetch`-based transport activates when
`EXPO_PUBLIC_API_URL` is set — no other code changes needed.

```ts
export const transport = process.env.EXPO_PUBLIC_API_URL ? httpTransport : mockTransport
```

All responses share one discriminated union (`{ data } | { error }`), so callers handle
errors by pattern matching — no try/catch, no unhandled rejections.

**Self-contained components.** Screens are thin layout shells; the logic lives in
domain components that subscribe directly to the stores, which keeps them independently
testable and avoids prop-drilling.

**Money correctness.** All money rules live in one utility: strict input parsing (rejects
`NaN` and sub-penny values), validation repeated at the transport boundary, and every
balance computation rounded to exactly two decimal places so float error can never
accumulate. The wallet balance can never go negative, and points can never be
over-redeemed.

---

## Testing

```bash
npm test
```

200+ tests across unit (services, transport, stores, money utilities) and component
(React Native Testing Library) levels — covering balance integrity edge cases, validation,
loading/error states, and the biometric lock lifecycle.

---

## Known limitations

- Data lives in AsyncStorage on the device — uninstalling the app clears it.
- Authentication is a local demo profile; there is no server-side identity.
- Face ID can't be tested in Expo Go on iOS (platform limitation) — it needs a dev build.
  Fingerprint on Android and the device-PIN fallback work everywhere; the lock is hidden
  on web.

## Roadmap

- Real backend behind the existing transport contract (drop-in via `EXPO_PUBLIC_API_URL`)
- Google sign-in through a token-exchange bridge
- Push notifications for transactions and pot milestones
- CI running typecheck and the test suite on every PR
