import catalogJson from '@/data/vouchers.json'
import { ApiResponse, Voucher, VoucherProduct } from '@/types'

import { generateId, mockRequest } from './client'
import { db } from './db'

export const VOUCHER_CATALOG: VoucherProduct[] = catalogJson
export const VOUCHER_DENOMINATIONS = VOUCHER_CATALOG.map((v) => v.denomination)
export type VoucherDenomination = (typeof VOUCHER_DENOMINATIONS)[number]

function generateVoucherCode(): string {
  return `SW-${generateId().toUpperCase().slice(0, 8)}`
}

export const vouchersService = {
  list(): Promise<ApiResponse<Voucher[]>> {
    return mockRequest(() => db.get().vouchers)
  },

  purchase(denomination: VoucherDenomination): Promise<ApiResponse<Voucher>> {
    return mockRequest(() => {
      if (!VOUCHER_DENOMINATIONS.includes(denomination))
        throw new Error(`Invalid denomination. Choose from: ${VOUCHER_DENOMINATIONS.join(', ')}.`)

      const { balance } = db.get()
      if (balance < denomination) throw new Error('Insufficient balance.')

      return {
        id: generateId(),
        denomination,
        code: generateVoucherCode(),
        purchasedAt: new Date().toISOString(),
        pointsEarned: VOUCHER_CATALOG.find((v) => v.denomination === denomination)?.pointsEarned ?? denomination,
      }
    })
  },
}
