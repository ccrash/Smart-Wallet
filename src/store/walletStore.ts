import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { db } from '@/api/db'
import { Pot, Transaction, Voucher } from '@/types'

const SEED_BALANCE = 500

type WalletState = {
  balance: number
  transactions: Transaction[]
  pots: Pot[]
  vouchers: Voucher[]
  loyaltyPoints: number
  isSeeded: boolean
  isHydrated: boolean

  seed: () => void
  reset: () => void
  _setHydrated: () => void
  applyTransaction: (tx: Omit<Transaction, 'runningBalance'>) => void
  addPot: (pot: Pot) => void
  updatePotBalance: (id: string, balance: number) => void
  removePot: (id: string) => void
  addVoucher: (voucher: Voucher) => void
  setLoyaltyPoints: (points: number) => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: 0,
      transactions: [],
      pots: [],
      vouchers: [],
      loyaltyPoints: 0,
      isSeeded: false,
      isHydrated: false,

      seed: () => {
        if (get().isSeeded) return
        const seedTx: Transaction = {
          id: 'seed-001',
          date: new Date().toISOString(),
          description: 'Welcome bonus',
          amount: SEED_BALANCE,
          type: 'seed',
          runningBalance: SEED_BALANCE,
        }
        db.hydrate({ balance: SEED_BALANCE, transactions: [seedTx] })
        set({ balance: SEED_BALANCE, transactions: [seedTx], isSeeded: true })
      },

      reset: () => {
        db.reset()
        set({
          balance: 0,
          transactions: [],
          pots: [],
          vouchers: [],
          loyaltyPoints: 0,
          isSeeded: false,
        })
      },

      _setHydrated: () => set({ isHydrated: true }),

      applyTransaction: (tx) => {
        const newBalance = get().balance + tx.amount
        const fullTx = { ...tx, runningBalance: newBalance }
        db.set((d) => ({
          ...d,
          balance: newBalance,
          transactions: [fullTx, ...d.transactions],
        }))
        set((s) => ({
          balance: newBalance,
          transactions: [fullTx, ...s.transactions],
        }))
      },

      addPot: (pot) => {
        db.set((d) => ({ ...d, pots: [...d.pots, pot] }))
        set((s) => ({ pots: [...s.pots, pot] }))
      },

      updatePotBalance: (id, balance) => {
        db.set((d) => ({ ...d, pots: d.pots.map((p) => (p.id === id ? { ...p, balance } : p)) }))
        set((s) => ({ pots: s.pots.map((p) => (p.id === id ? { ...p, balance } : p)) }))
      },

      removePot: (id) => {
        db.set((d) => ({ ...d, pots: d.pots.filter((p) => p.id !== id) }))
        set((s) => ({ pots: s.pots.filter((p) => p.id !== id) }))
      },

      addVoucher: (voucher) => {
        db.set((d) => ({ ...d, vouchers: [voucher, ...d.vouchers] }))
        set((s) => ({ vouchers: [voucher, ...s.vouchers] }))
      },

      setLoyaltyPoints: (points) => {
        db.set((d) => ({ ...d, loyaltyPoints: points }))
        set({ loyaltyPoints: points })
      },
    }),
    {
      name: 'sw-wallet-v3',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Reverse-sync: populate db from persisted store state so services
          // see the correct data from the previous session on cold start.
          db.hydrate({
            balance: state.balance,
            transactions: state.transactions,
            pots: state.pots,
            vouchers: state.vouchers,
            loyaltyPoints: state.loyaltyPoints,
          })
        }
        state?._setHydrated()
      },
    },
  ),
)
