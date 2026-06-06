import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Pot, Transaction, Voucher } from '@/types';

const SEED_BALANCE = 500;

type WalletState = {
  balance: number;
  transactions: Transaction[];
  pots: Pot[];
  vouchers: Voucher[];
  loyaltyPoints: number;
  isSeeded: boolean;
  isHydrated: boolean;

  seed: () => void;
  _setHydrated: () => void;
  applyTransaction: (tx: Omit<Transaction, 'runningBalance'>) => void;
  addPot: (pot: Pot) => void;
  updatePotBalance: (id: string, balance: number) => void;
  removePot: (id: string) => void;
  addVoucher: (voucher: Voucher) => void;
  setLoyaltyPoints: (points: number) => void;
};

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
        if (get().isSeeded) return;
        const seedTx: Transaction = {
          id: 'seed-001',
          date: new Date().toISOString(),
          description: 'Welcome bonus',
          amount: SEED_BALANCE,
          type: 'seed',
          runningBalance: SEED_BALANCE,
        };
        set({ balance: SEED_BALANCE, transactions: [seedTx], isSeeded: true });
      },

      _setHydrated: () => set({ isHydrated: true }),

      applyTransaction: (tx) => {
        const newBalance = get().balance + tx.amount;
        set((s) => ({
          balance: newBalance,
          transactions: [{ ...tx, runningBalance: newBalance }, ...s.transactions],
        }));
      },

      addPot: (pot) => set((s) => ({ pots: [...s.pots, pot] })),

      updatePotBalance: (id, balance) =>
        set((s) => ({ pots: s.pots.map((p) => (p.id === id ? { ...p, balance } : p)) })),

      removePot: (id) => set((s) => ({ pots: s.pots.filter((p) => p.id !== id) })),

      addVoucher: (voucher) => set((s) => ({ vouchers: [voucher, ...s.vouchers] })),

      setLoyaltyPoints: (points) => set({ loyaltyPoints: points }),
    }),
    {
      name: 'sw-wallet',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => state?._setHydrated(),
    },
  ),
);
