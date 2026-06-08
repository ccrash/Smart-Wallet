import { walletService } from '../wallet.service'
import { db } from '../db'

const makeTransactions = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `tx-${i}`,
    date: new Date().toISOString(),
    description: `Transaction ${i}`,
    amount: 10,
    type: 'seed' as const,
    runningBalance: 500 + i * 10,
  }))

async function run<T>(promise: Promise<T>): Promise<T> {
  jest.runAllTimers()
  return promise
}

describe('walletService', () => {
  beforeEach(() => db.reset())

  describe('getBalance', () => {
    it('returns the current balance', async () => {
      db.hydrate({ balance: 250 })

      const result = await run(walletService.getBalance())

      expect(result.error).toBeNull()
      expect(result.data).toBe(250)
    })
  })

  describe('getTransactions', () => {
    it('returns first page of transactions', async () => {
      db.hydrate({ transactions: makeTransactions(25) })

      const result = await run(walletService.getTransactions(0))

      expect(result.error).toBeNull()
      expect(result.data!.items).toHaveLength(20)
      expect(result.data!.hasMore).toBe(true)
    })

    it('returns second page with no more results', async () => {
      db.hydrate({ transactions: makeTransactions(25) })

      const result = await run(walletService.getTransactions(1))

      expect(result.data!.items).toHaveLength(5)
      expect(result.data!.hasMore).toBe(false)
    })

    it('returns empty page when no transactions', async () => {
      const result = await run(walletService.getTransactions(0))

      expect(result.data!.items).toHaveLength(0)
      expect(result.data!.hasMore).toBe(false)
    })
  })
})
