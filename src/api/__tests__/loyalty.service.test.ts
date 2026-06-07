import { loyaltyService } from '../loyalty.service';

jest.mock('@/store/walletStore');

import { useWalletStore } from '@/store/walletStore';

const mockGetState = useWalletStore.getState as jest.Mock;

async function run<T>(promise: Promise<T>): Promise<T> {
  jest.runAllTimers();
  return promise;
}

describe('loyaltyService', () => {
  describe('getBalance', () => {
    it('returns the current loyalty points', async () => {
      mockGetState.mockReturnValue({ loyaltyPoints: 350 });

      const result = await run(loyaltyService.getBalance());

      expect(result.error).toBeNull();
      expect(result.data).toBe(350);
    });
  });

  describe('redeem', () => {
    it('converts 100 points to £1 credit', async () => {
      mockGetState.mockReturnValue({ loyaltyPoints: 300 });

      const result = await run(loyaltyService.redeem(100));

      expect(result.error).toBeNull();
      expect(result.data!.creditAmount).toBe(1);
      expect(result.data!.remainingPoints).toBe(200);
      expect(result.data!.transactionId).toBeTruthy();
    });

    it('scales credit linearly (300 pts → £3)', async () => {
      mockGetState.mockReturnValue({ loyaltyPoints: 300 });

      const result = await run(loyaltyService.redeem(300));

      expect(result.data!.creditAmount).toBe(3);
      expect(result.data!.remainingPoints).toBe(0);
    });

    it('returns error when redeeming zero points', async () => {
      mockGetState.mockReturnValue({ loyaltyPoints: 500 });

      const result = await run(loyaltyService.redeem(0));

      expect(result.data).toBeNull();
      expect(result.error).toMatch(/greater than zero/);
    });

    it('returns error when points are not a multiple of 100', async () => {
      mockGetState.mockReturnValue({ loyaltyPoints: 500 });

      const result = await run(loyaltyService.redeem(150));

      expect(result.data).toBeNull();
      expect(result.error).toMatch(/multiples of 100/);
    });

    it('returns error when balance is insufficient', async () => {
      mockGetState.mockReturnValue({ loyaltyPoints: 50 });

      const result = await run(loyaltyService.redeem(100));

      expect(result.data).toBeNull();
      expect(result.error).toBe('Insufficient loyalty points.');
    });

    it('returns error for negative points', async () => {
      mockGetState.mockReturnValue({ loyaltyPoints: 500 });

      const result = await run(loyaltyService.redeem(-100));

      expect(result.data).toBeNull();
      expect(result.error).toMatch(/greater than zero/);
    });
  });
});
