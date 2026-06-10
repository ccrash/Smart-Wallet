import { useWalletStore } from '../walletStore'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem:    jest.fn(() => Promise.resolve(null)),
  setItem:    jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet:   jest.fn(() => Promise.resolve([])),
  getAllKeys:  jest.fn(() => Promise.resolve([])),
}))

const tx = (id: string, amount: number) => ({
  id,
  date: new Date().toISOString(),
  description: 'test',
  type: 'voucher_purchase' as const,
  amount,
})

const pot = (id: string, balance = 0) => ({
  id,
  name: `Pot ${id}`,
  balance,
  createdAt: '',
})

describe('walletStore', () => {
  beforeEach(() => useWalletStore.getState().reset())

  // ─── seed ──────────────────────────────────────────────────────────────────

  describe('seed', () => {
    it('initialises £500 balance with a seed transaction', () => {
      useWalletStore.getState().seed()
      const { balance, transactions, isSeeded } = useWalletStore.getState()
      expect(balance).toBe(500)
      expect(transactions).toHaveLength(1)
      expect(transactions[0]).toMatchObject({ type: 'seed', amount: 500, runningBalance: 500 })
      expect(isSeeded).toBe(true)
    })

    it('is idempotent — a second call does not change balance or add a transaction', () => {
      useWalletStore.getState().seed()
      useWalletStore.getState().seed()
      const { balance, transactions } = useWalletStore.getState()
      expect(balance).toBe(500)
      expect(transactions).toHaveLength(1)
    })
  })

  // ─── applyTransaction ──────────────────────────────────────────────────────

  describe('applyTransaction', () => {
    beforeEach(() => useWalletStore.getState().seed())

    it('deducts from balance and stores correct running balance', () => {
      useWalletStore.getState().applyTransaction(tx('t1', -50))
      const { balance, transactions } = useWalletStore.getState()
      expect(balance).toBe(450)
      expect(transactions[0].runningBalance).toBe(450)
    })

    it('credits to balance correctly', () => {
      useWalletStore.getState().applyTransaction(tx('t1', 100))
      expect(useWalletStore.getState().balance).toBe(600)
    })

    it('prepends so the newest transaction is first', () => {
      useWalletStore.getState().applyTransaction(tx('t1', -10))
      useWalletStore.getState().applyTransaction(tx('t2', -20))
      const { transactions } = useWalletStore.getState()
      expect(transactions[0].id).toBe('t2')
      expect(transactions[1].id).toBe('t1')
    })

    it('each transaction carries the running balance at the point it was applied', () => {
      useWalletStore.getState().applyTransaction(tx('t1', -100)) // balance → 400
      useWalletStore.getState().applyTransaction(tx('t2', -50))  // balance → 350
      const { transactions } = useWalletStore.getState()
      // newest-first order
      expect(transactions[0].id).toBe('t2')
      expect(transactions[0].runningBalance).toBe(350)
      expect(transactions[1].id).toBe('t1')
      expect(transactions[1].runningBalance).toBe(400)
    })
  })

  // ─── reset ─────────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('zeroes all state and clears the seeded flag', () => {
      useWalletStore.getState().seed()
      useWalletStore.getState().addPot(pot('p1'))
      useWalletStore.getState().addVoucher({ id: 'v1', denomination: 10, code: 'SW-XXX', purchasedAt: '', pointsEarned: 10 })
      useWalletStore.getState().setLoyaltyPoints(250)

      useWalletStore.getState().reset()

      const { balance, transactions, pots, vouchers, loyaltyPoints, isSeeded } = useWalletStore.getState()
      expect(balance).toBe(0)
      expect(transactions).toHaveLength(0)
      expect(pots).toHaveLength(0)
      expect(vouchers).toHaveLength(0)
      expect(loyaltyPoints).toBe(0)
      expect(isSeeded).toBe(false)
    })

    it('allows re-seeding after a reset', () => {
      useWalletStore.getState().seed()
      useWalletStore.getState().reset()
      useWalletStore.getState().seed()
      expect(useWalletStore.getState().balance).toBe(500)
      expect(useWalletStore.getState().transactions).toHaveLength(1)
    })
  })

  // ─── pot operations ────────────────────────────────────────────────────────

  describe('pot operations', () => {
    it('addPot appends a new pot', () => {
      useWalletStore.getState().addPot(pot('p1'))
      expect(useWalletStore.getState().pots).toHaveLength(1)
      expect(useWalletStore.getState().pots[0].id).toBe('p1')
    })

    it('updatePotBalance only mutates the matching pot', () => {
      useWalletStore.getState().addPot(pot('p1', 0))
      useWalletStore.getState().addPot(pot('p2', 0))
      useWalletStore.getState().updatePotBalance('p1', 200)
      const pots = useWalletStore.getState().pots
      expect(pots.find((p) => p.id === 'p1')!.balance).toBe(200)
      expect(pots.find((p) => p.id === 'p2')!.balance).toBe(0)
    })

    it('removePot removes only the matching pot', () => {
      useWalletStore.getState().addPot(pot('p1'))
      useWalletStore.getState().addPot(pot('p2'))
      useWalletStore.getState().removePot('p1')
      const pots = useWalletStore.getState().pots
      expect(pots).toHaveLength(1)
      expect(pots[0].id).toBe('p2')
    })
  })

  // ─── vouchers and loyalty points ───────────────────────────────────────────

  describe('addVoucher', () => {
    it('prepends the new voucher to the list', () => {
      const v1 = { id: 'v1', denomination: 10, code: 'SW-A', purchasedAt: '', pointsEarned: 10 }
      const v2 = { id: 'v2', denomination: 25, code: 'SW-B', purchasedAt: '', pointsEarned: 25 }
      useWalletStore.getState().addVoucher(v1)
      useWalletStore.getState().addVoucher(v2)
      expect(useWalletStore.getState().vouchers[0].id).toBe('v2')
    })
  })

  describe('setLoyaltyPoints', () => {
    it('replaces the points balance', () => {
      useWalletStore.getState().setLoyaltyPoints(350)
      expect(useWalletStore.getState().loyaltyPoints).toBe(350)
      useWalletStore.getState().setLoyaltyPoints(100)
      expect(useWalletStore.getState().loyaltyPoints).toBe(100)
    })
  })
})
