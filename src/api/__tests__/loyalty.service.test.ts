import { loyaltyService } from '../loyalty.service'
import { db } from '../db'

async function run<T>(promise: Promise<T>): Promise<T> {
  jest.runAllTimers()
  return promise
}

describe('loyaltyService', () => {
  beforeEach(() => db.reset())

  describe('getBalance', () => {
    it('returns the current loyalty points', async () => {
      db.hydrate({ loyaltyPoints: 350 })

      const result = await run(loyaltyService.getBalance())

      expect(result.error).toBeNull()
      expect(result.data).toBe(350)
    })
  })

  describe('redeem', () => {
    it('converts 100 points to £1 credit', async () => {
      db.hydrate({ loyaltyPoints: 300 })

      const result = await run(loyaltyService.redeem(100))

      expect(result.error).toBeNull()
      expect(result.data!.creditAmount).toBe(1)
      expect(result.data!.remainingPoints).toBe(200)
      expect(result.data!.transactionId).toBeTruthy()
    })

    it('scales credit linearly (300 pts → £3)', async () => {
      db.hydrate({ loyaltyPoints: 300 })

      const result = await run(loyaltyService.redeem(300))

      expect(result.data!.creditAmount).toBe(3)
      expect(result.data!.remainingPoints).toBe(0)
    })

    it('returns error when redeeming zero points', async () => {
      db.hydrate({ loyaltyPoints: 500 })

      const result = await run(loyaltyService.redeem(0))

      expect(result.data).toBeNull()
      expect(result.error).toMatch(/greater than zero/)
    })

    it('returns error when points are not a multiple of 100', async () => {
      db.hydrate({ loyaltyPoints: 500 })

      const result = await run(loyaltyService.redeem(150))

      expect(result.data).toBeNull()
      expect(result.error).toMatch(/multiples of 100/)
    })

    it('returns error when balance is insufficient', async () => {
      db.hydrate({ loyaltyPoints: 50 })

      const result = await run(loyaltyService.redeem(100))

      expect(result.data).toBeNull()
      expect(result.error).toBe('Insufficient loyalty points.')
    })

    it('returns error for negative points', async () => {
      db.hydrate({ loyaltyPoints: 500 })

      const result = await run(loyaltyService.redeem(-100))

      expect(result.data).toBeNull()
      expect(result.error).toMatch(/greater than zero/)
    })

    it('succeeds when balance exactly equals the redemption amount (full redemption → 0 remaining)', async () => {
      db.hydrate({ loyaltyPoints: 100 })

      const result = await run(loyaltyService.redeem(100))

      expect(result.error).toBeNull()
      expect(result.data!.creditAmount).toBe(1)
      expect(result.data!.remainingPoints).toBe(0)
    })

    it('returns error when balance is one point below the redemption amount (99 pts, redeem 100)', async () => {
      db.hydrate({ loyaltyPoints: 99 })

      const result = await run(loyaltyService.redeem(100))

      expect(result.data).toBeNull()
      expect(result.error).toBe('Insufficient loyalty points.')
    })

    it('leaves 1 remaining point when redeeming 100 from a 101-point balance', async () => {
      db.hydrate({ loyaltyPoints: 101 })

      const result = await run(loyaltyService.redeem(100))

      expect(result.error).toBeNull()
      expect(result.data!.creditAmount).toBe(1)
      expect(result.data!.remainingPoints).toBe(1)
    })

    it('redeems a large multiple (1000 pts → £10 credit, 0 remaining)', async () => {
      db.hydrate({ loyaltyPoints: 1000 })

      const result = await run(loyaltyService.redeem(1000))

      expect(result.error).toBeNull()
      expect(result.data!.creditAmount).toBe(10)
      expect(result.data!.remainingPoints).toBe(0)
    })

    it('returns error for a large non-multiple of 100 (1001 pts)', async () => {
      db.hydrate({ loyaltyPoints: 2000 })

      const result = await run(loyaltyService.redeem(1001))

      expect(result.data).toBeNull()
      expect(result.error).toMatch(/multiples of 100/)
    })
  })
})
