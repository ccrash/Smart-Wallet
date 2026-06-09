import { db } from '../../db'
import { mockTransport } from '../mock.transport'

async function run<T>(promise: Promise<T>): Promise<T> {
  jest.runAllTimers()
  return promise
}

const makePot = (id = 'p1', balance = 50) => ({
  id,
  name: 'Test',
  balance,
  createdAt: '',
})

describe('mockTransport', () => {
  beforeEach(() => db.reset())

  // ─── Route dispatch ────────────────────────────────────────────────────────

  describe('unknown routes', () => {
    it('GET unknown path returns error without throwing', async () => {
      const r = await run(mockTransport.get('/does/not/exist'))
      expect(r.data).toBeNull()
      expect(r.error).toMatch(/Unknown route: GET/)
    })

    it('POST unknown path returns error without throwing', async () => {
      const r = await run(mockTransport.post('/does/not/exist'))
      expect(r.data).toBeNull()
      expect(r.error).toMatch(/Unknown route: POST/)
    })

    it('DELETE unknown path returns error without throwing', async () => {
      const r = await run(mockTransport.del('/does/not/exist'))
      expect(r.data).toBeNull()
      expect(r.error).toMatch(/Unknown route/)
    })

    it('PUT returns not-implemented for all paths', async () => {
      const r = await run(mockTransport.put('/wallet/balance'))
      expect(r.data).toBeNull()
      expect(r.error).toMatch(/Not implemented/)
    })
  })

  // ─── Path matching disambiguation ──────────────────────────────────────────

  describe('path matching', () => {
    it('routes /pots/:id/deposit and /pots/:id/withdraw to separate handlers', async () => {
      db.hydrate({ balance: 100, pots: [makePot('p1', 50)] })

      const dep = await run(mockTransport.post<{ pot: { balance: number } }>('/pots/p1/deposit', { amount: 20 }))
      expect(dep.error).toBeNull()
      expect(dep.data!.pot.balance).toBe(70)

      db.hydrate({ pots: [makePot('p1', 50)] })
      const wit = await run(mockTransport.post<{ pot: { balance: number } }>('/pots/p1/withdraw', { amount: 15 }))
      expect(wit.error).toBeNull()
      expect(wit.data!.pot.balance).toBe(35)
    })

    it('DELETE /pots/:id is not confused with POST /pots', async () => {
      db.hydrate({ pots: [makePot('p1', 80)] })

      const del = await run(mockTransport.del<{ refundAmount: number }>('/pots/p1'))
      expect(del.error).toBeNull()
      expect(del.data!.refundAmount).toBe(80)
    })

    it('extracts the correct pot ID from the path', async () => {
      db.hydrate({ pots: [makePot('pot-abc', 30), makePot('pot-xyz', 90)] })

      const r = await run(mockTransport.del<{ refundAmount: number }>('/pots/pot-xyz'))
      expect(r.error).toBeNull()
      expect(r.data!.refundAmount).toBe(90)
    })
  })

  // ─── Auth routes ───────────────────────────────────────────────────────────

  describe('POST /auth/sign-in', () => {
    it('returns the hardcoded mock user', async () => {
      const r = await run(mockTransport.post<{ id: string; displayName: string }>('/auth/sign-in'))
      expect(r.error).toBeNull()
      expect(r.data).toMatchObject({ id: 'mock-user-001', displayName: 'Alex Johnson' })
    })
  })

  describe('POST /auth/sign-out', () => {
    it('resolves without error', async () => {
      const r = await run(mockTransport.post('/auth/sign-out'))
      expect(r.error).toBeNull()
    })
  })

  // ─── Handler errors are returned, not thrown ───────────────────────────────

  describe('error shape', () => {
    it('validation errors are returned as ApiResponse errors, not exceptions', async () => {
      // Empty pot name — handler throws internally
      const r = await run(mockTransport.post('/pots', { name: '' }))
      expect(r.data).toBeNull()
      expect(typeof r.error).toBe('string')
      expect(r.error!.length).toBeGreaterThan(0)
    })

    it('insufficient balance errors are returned, not thrown', async () => {
      db.hydrate({ balance: 5 })
      const r = await run(mockTransport.post('/vouchers/purchase', { denomination: 10 }))
      expect(r.data).toBeNull()
      expect(r.error).toBe('Insufficient balance.')
    })
  })
})
