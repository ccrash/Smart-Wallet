import { useWalletStore } from '@/store/walletStore';
import { ApiResponse, Voucher } from '@/types';

import { generateId, mockRequest } from './client';

export const VOUCHER_DENOMINATIONS = [10, 25, 50, 100] as const;
export type VoucherDenomination = (typeof VOUCHER_DENOMINATIONS)[number];

const POINTS_PER_POUND = 1;

function generateVoucherCode(): string {
  return `SW-${generateId().toUpperCase().slice(0, 8)}`;
}

export const vouchersService = {
  list(): Promise<ApiResponse<Voucher[]>> {
    return mockRequest(() => useWalletStore.getState().vouchers);
  },

  purchase(denomination: VoucherDenomination): Promise<ApiResponse<Voucher>> {
    return mockRequest(() => {
      if (!VOUCHER_DENOMINATIONS.includes(denomination))
        throw new Error(`Invalid denomination. Choose from: ${VOUCHER_DENOMINATIONS.join(', ')}.`);

      const { balance } = useWalletStore.getState();
      if (balance < denomination) throw new Error('Insufficient balance.');

      return {
        id: generateId(),
        denomination,
        code: generateVoucherCode(),
        purchasedAt: new Date().toISOString(),
        pointsEarned: denomination * POINTS_PER_POUND,
      };
    });
  },
};
