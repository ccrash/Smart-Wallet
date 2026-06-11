# Smart Wallet Codebase Wiki — Navigation Guide

This project has a compiled knowledge wiki. Use it instead of scanning raw files.

## How to use this wiki

1. Start at [INDEX.md](INDEX.md) — scan the topic table to find relevant modules
2. Read 1-3 topic articles relevant to your current task
3. Check coverage tags:
   - `[coverage: high]` — trust this section, skip raw files
   - `[coverage: medium]` — good overview, check raw sources for implementation details
   - `[coverage: low]` — read the raw source files listed in Sources
4. Only read raw source files when you need code-level detail

## Topic Quick-Reference

| You're working on… | Read this first |
|--------------------|----------------|
| Screens / routing | [project-overview](topics/project-overview.md) |
| Sign-in / session / auth guard | [auth](topics/auth.md) |
| Balance, transactions, walletStore, db | [wallet-core](topics/wallet-core.md) |
| Savings pots | [pots](topics/pots.md) |
| Voucher purchase flow | [voucher-shop](topics/voucher-shop.md) |
| Loyalty points / redemption | [loyalty-rewards](topics/loyalty-rewards.md) |
| API services / mock transport | [transport-layer](topics/transport-layer.md) |
| Component structure / screens | [component-architecture](topics/component-architecture.md) |
| Tests / mocking / RNTL patterns | [testing](topics/testing.md) |
| Anything that moves money (validation, rounding, NaN) | [money-integrity](concepts/money-integrity.md) |

## Stats
Compiled: 2026-06-11 | Topics: 9 | Concepts: 1 | Sources: 67
