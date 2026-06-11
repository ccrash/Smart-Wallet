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
    it('builds a demo user from the submitted display name', async () => {
      const r = await run(
        mockTransport.post<{ displayName: string; email: string }>('/auth/sign-in', {
          displayName: 'Alex Johnson',
        }),
      )
      expect(r.error).toBeNull()
      expect(r.data).toMatchObject({
        displayName: 'Alex Johnson',
        email: 'alex.johnson@demo.smartwallet.app',
      })
    })

    it('rejects an empty display name', async () => {
      const r = await run(mockTransport.post('/auth/sign-in', { displayName: '  ' }))
      expect(r.data).toBeNull()
      expect(r.error).toBe('Name cannot be empty.')
    })

    it('strips characters that are not valid in the derived email', async () => {
      const r = await run(
        mockTransport.post<{ email: string }>('/auth/sign-in', { displayName: "Anne-Marie O'Neil" }),
      )
      expect(r.error).toBeNull()
      expect(r.data!.email).toBe('annemarie.oneil@demo.smartwallet.app')
    })
  })

  describe('POST /auth/sign-out', () => {
    it('resolves without error', async () => {
      const r = await run(mockTransport.post('/auth/sign-out'))
      expect(r.error).toBeNull()
    })
  })

  // ─── Amount validation ─────────────────────────────────────────────────────

  describe('amount validation', () => {
    beforeEach(() => db.hydrate({ balance: 100, pots: [makePot('p1', 50)] }))

    it.each([NaN, Infinity, 0, -10, 10.999])('rejects deposit amount %p', async (amount) => {
      const r = await run(mockTransport.post('/pots/p1/deposit', { amount }))
      expect(r.data).toBeNull()
      expect(r.error).toMatch(/Deposit amount must be a positive number/)
    })

    it.each([NaN, Infinity, 0, -10, 10.999])('rejects withdrawal amount %p', async (amount) => {
      const r = await run(mockTransport.post('/pots/p1/withdraw', { amount }))
      expect(r.data).toBeNull()
      expect(r.error).toMatch(/Withdrawal amount must be a positive number/)
    })

    it('rejects a non-numeric deposit body', async () => {
      const r = await run(mockTransport.post('/pots/p1/deposit', { amount: '.' }))
      expect(r.data).toBeNull()
      expect(r.error).toMatch(/Deposit amount must be a positive number/)
    })

    it('keeps pot balances at exactly 2 decimal places', async () => {
      db.hydrate({ pots: [makePot('p1', 0.1)] })
      const r = await run(mockTransport.post<{ pot: { balance: number } }>('/pots/p1/deposit', { amount: 0.2 }))
      expect(r.error).toBeNull()
      expect(r.data!.pot.balance).toBe(0.3)
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
