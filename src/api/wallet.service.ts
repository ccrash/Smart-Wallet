import { Transaction } from '@/types'

import { transport } from './transport'

export const walletService = {
  getBalance() {
    return transport.get<number>('/wallet/balance')
  },

  getTransactions(page = 0) {
    return transport.get<{ items: Transaction[]; hasMore: boolean }>('/wallet/transactions', { page })
  },
}
