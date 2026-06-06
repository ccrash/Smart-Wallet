import { useWalletStore } from '@/store/walletStore';
import { ApiResponse, Transaction } from '@/types';

import { mockRequest } from './client';

const PAGE_SIZE = 20;

export const walletService = {
  getBalance(): Promise<ApiResponse<number>> {
    return mockRequest(() => useWalletStore.getState().balance);
  },

  getTransactions(page = 0): Promise<ApiResponse<{ items: Transaction[]; hasMore: boolean }>> {
    return mockRequest(() => {
      const all = useWalletStore.getState().transactions;
      const start = page * PAGE_SIZE;
      const items = all.slice(start, start + PAGE_SIZE);
      return { items, hasMore: start + PAGE_SIZE < all.length };
    });
  },
};
