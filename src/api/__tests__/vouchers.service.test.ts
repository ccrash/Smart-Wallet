import { vouchersService } from '../vouchers.service'
import { db } from '../db'

async function run<T>(promise: Promise<T>): Promise<T> {
  jest.runAllTimers()
  return promise
}

describe('vouchersService', () => {
  beforeEach(() => db.reset())

  describe('list', () => {
    it('returns all vouchers', async () => {
      const vouchers = [
        { id: 'v-1', denomination: 10, code: 'SW-ABC', purchasedAt: new Date().toISOString(), pointsEarned: 10 },
      ]
      db.hydrate({ vouchers })

      const result = await run(vouchersService.list())

      expect(result.error).toBeNull()
      expect(result.data).toEqual(vouchers)
    })
  })

  describe('purchase', () => {
    it('creates a voucher with correct points (1pt per £1)', async () => {
      db.hydrate({ balance: 500 })

      const result = await run(vouchersService.purchase(25))

      expect(result.error).toBeNull()
      expect(result.data).toMatchObject({ denomination: 25, pointsEarned: 25 })
      expect(result.data!.code).toMatch(/^SW-/)
      expect(result.data!.id).toBeTruthy()
    })

    it.each([10, 25, 50, 100] as const)('accepts £%i denomination', async (denomination) => {
      db.hydrate({ balance: 500 })

      const result = await run(vouchersService.purchase(denomination))

      expect(result.error).toBeNull()
      expect(result.data!.denomination).toBe(denomination)
    })

    it('returns error for invalid denomination', async () => {
      db.hydrate({ balance: 500 })

      const result = await run(vouchersService.purchase(15 as never))

      expect(result.data).toBeNull()
      expect(result.error).toMatch(/Invalid denomination/)
    })

    it('returns error when balance is insufficient', async () => {
      db.hydrate({ balance: 5 })

      const result = await run(vouchersService.purchase(10))

      expect(result.data).toBeNull()
      expect(result.error).toBe('Insufficient balance.')
    })

    it('allows purchase when balance exactly equals denomination', async () => {
      db.hydrate({ balance: 10 })

      const result = await run(vouchersService.purchase(10))

      expect(result.error).toBeNull()
      expect(result.data!.denomination).toBe(10)
    })
  })
})
