import { ApiResponse, Transaction } from '@/types'

import { mockRequest } from './client'
import { db } from './db'

const PAGE_SIZE = 20

export const walletService = {
  getBalance(): Promise<ApiResponse<number>> {
    return mockRequest(() => db.get().balance)
  },

  getTransactions(page = 0): Promise<ApiResponse<{ items: Transaction[]; hasMore: boolean }>> {
    return mockRequest(() => {
      const all = db.get().transactions
      const start = page * PAGE_SIZE
      const items = all.slice(start, start + PAGE_SIZE)
      return { items, hasMore: start + PAGE_SIZE < all.length }
    })
  },
}
