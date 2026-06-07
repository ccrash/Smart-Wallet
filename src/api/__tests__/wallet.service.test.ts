import { walletService } from '../wallet.service';

jest.mock('@/store/walletStore');

import { useWalletStore } from '@/store/walletStore';

const mockGetState = useWalletStore.getState as jest.Mock;

const makeTransactions = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `tx-${i}`,
    date: new Date().toISOString(),
    description: `Transaction ${i}`,
    amount: 10,
    type: 'seed' as const,
    runningBalance: 500 + i * 10,
  }));

describe('walletService', () => {
  describe('getBalance', () => {
    it('returns the current balance', async () => {
      mockGetState.mockReturnValue({ balance: 250 });

      const promise = walletService.getBalance();
      jest.runAllTimers();
      const result = await promise;

      expect(result.error).toBeNull();
      expect(result.data).toBe(250);
    });
  });

  describe('getTransactions', () => {
    it('returns first page of transactions', async () => {
      const transactions = makeTransactions(25);
      mockGetState.mockReturnValue({ transactions });

      const promise = walletService.getTransactions(0);
      jest.runAllTimers();
      const result = await promise;

      expect(result.error).toBeNull();
      expect(result.data!.items).toHaveLength(20);
      expect(result.data!.hasMore).toBe(true);
    });

    it('returns second page with no more results', async () => {
      const transactions = makeTransactions(25);
      mockGetState.mockReturnValue({ transactions });

      const promise = walletService.getTransactions(1);
      jest.runAllTimers();
      const result = await promise;

      expect(result.data!.items).toHaveLength(5);
      expect(result.data!.hasMore).toBe(false);
    });

    it('returns empty page when no transactions', async () => {
      mockGetState.mockReturnValue({ transactions: [] });

      const promise = walletService.getTransactions(0);
      jest.runAllTimers();
      const result = await promise;

      expect(result.data!.items).toHaveLength(0);
      expect(result.data!.hasMore).toBe(false);
    });
  });
});
