import { potsService } from '../pots.service'
import { db } from '../db'

const makePot = (overrides: Partial<{ id: string; name: string; balance: number }> = {}) => ({
  id: 'pot-1',
  name: 'Holiday',
  balance: 100,
  createdAt: new Date().toISOString(),
  ...overrides,
})

async function run<T>(promise: Promise<T>): Promise<T> {
  jest.runAllTimers()
  return promise
}

describe('potsService', () => {
  beforeEach(() => db.reset())

  describe('list', () => {
    it('returns all pots', async () => {
      const pots = [makePot()]
      db.hydrate({ pots })

      const result = await run(potsService.list())

      expect(result.error).toBeNull()
      expect(result.data).toEqual(pots)
    })
  })

  describe('create', () => {
    it('creates a pot with trimmed name', async () => {
      const result = await run(potsService.create('  Holiday  '))

      expect(result.error).toBeNull()
      expect(result.data).toMatchObject({ name: 'Holiday', balance: 0 })
      expect(result.data!.id).toBeTruthy()
    })

    it('returns error for empty name', async () => {
      const result = await run(potsService.create('   '))

      expect(result.data).toBeNull()
      expect(result.error).toBe('Pot name cannot be empty.')
    })

    it('returns error when name exceeds 30 characters', async () => {
      const result = await run(potsService.create('A'.repeat(31)))

      expect(result.data).toBeNull()
      expect(result.error).toMatch(/30 characters or fewer/)
    })

    it('returns error for duplicate name (case-insensitive)', async () => {
      db.hydrate({ pots: [makePot({ name: 'Holiday' })] })

      const result = await run(potsService.create('holiday'))

      expect(result.data).toBeNull()
      expect(result.error).toMatch(/already exists/)
    })
  })

  describe('deposit', () => {
    it('returns updated pot and debit amount', async () => {
      db.hydrate({ balance: 500, pots: [makePot({ balance: 100 })] })

      const result = await run(potsService.deposit('pot-1', 50))

      expect(result.error).toBeNull()
      expect(result.data!.pot.balance).toBe(150)
      expect(result.data!.debitAmount).toBe(50)
    })

    it('returns error for zero amount', async () => {
      db.hydrate({ balance: 500, pots: [makePot()] })

      const result = await run(potsService.deposit('pot-1', 0))

      expect(result.data).toBeNull()
      expect(result.error).toMatch(/must be a positive number/)
    })

    it('returns error when balance is insufficient', async () => {
      db.hydrate({ balance: 30, pots: [makePot()] })

      const result = await run(potsService.deposit('pot-1', 50))

      expect(result.data).toBeNull()
      expect(result.error).toBe('Insufficient balance.')
    })

    it('returns error when pot not found', async () => {
      db.hydrate({ balance: 500 })

      const result = await run(potsService.deposit('pot-999', 50))

      expect(result.data).toBeNull()
      expect(result.error).toBe('Pot not found.')
    })
  })

  describe('withdraw', () => {
    it('returns updated pot and credit amount', async () => {
      db.hydrate({ pots: [makePot({ balance: 100 })] })

      const result = await run(potsService.withdraw('pot-1', 40))

      expect(result.error).toBeNull()
      expect(result.data!.pot.balance).toBe(60)
      expect(result.data!.creditAmount).toBe(40)
    })

    it('returns error for negative amount', async () => {
      db.hydrate({ pots: [makePot()] })

      const result = await run(potsService.withdraw('pot-1', -10))

      expect(result.data).toBeNull()
      expect(result.error).toMatch(/must be a positive number/)
    })

    it('returns error when pot balance is insufficient', async () => {
      db.hydrate({ pots: [makePot({ balance: 20 })] })

      const result = await run(potsService.withdraw('pot-1', 50))

      expect(result.data).toBeNull()
      expect(result.error).toBe('Insufficient pot balance.')
    })
  })

  describe('remove', () => {
    it('returns the pot balance as refund amount', async () => {
      db.hydrate({ pots: [makePot({ balance: 75 })] })

      const result = await run(potsService.remove('pot-1'))

      expect(result.error).toBeNull()
      expect(result.data!.refundAmount).toBe(75)
    })

    it('returns zero refund for empty pot', async () => {
      db.hydrate({ pots: [makePot({ balance: 0 })] })

      const result = await run(potsService.remove('pot-1'))

      expect(result.data!.refundAmount).toBe(0)
    })

    it('returns error when pot not found', async () => {
      const result = await run(potsService.remove('pot-999'))

      expect(result.data).toBeNull()
      expect(result.error).toBe('Pot not found.')
    })
  })
})
