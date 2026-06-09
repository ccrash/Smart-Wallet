import catalogJson from '@/data/vouchers.json'
import { Voucher, VoucherProduct } from '@/types'

import { transport } from './transport'

export const VOUCHER_CATALOG: VoucherProduct[] = catalogJson
export const VOUCHER_DENOMINATIONS = VOUCHER_CATALOG.map((v) => v.denomination)
export type VoucherDenomination = (typeof VOUCHER_DENOMINATIONS)[number]

export const vouchersService = {
  list() {
    return transport.get<Voucher[]>('/vouchers')
  },

  purchase(denomination: VoucherDenomination) {
    return transport.post<Voucher>('/vouchers/purchase', { denomination })
  },
}
