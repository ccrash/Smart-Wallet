import { Pot, Transaction, Voucher } from '@/types'

type DbState = {
  balance: number
  transactions: Transaction[]
  pots: Pot[]
  vouchers: Voucher[]
  loyaltyPoints: number
}

const EMPTY: DbState = {
  balance: 0,
  transactions: [],
  pots: [],
  vouchers: [],
  loyaltyPoints: 0,
}

let _state: DbState = { ...EMPTY }

export const db = {
  get: (): DbState => _state,
  set: (updater: (s: DbState) => DbState): void => { _state = updater(_state) },
  hydrate: (partial: Partial<DbState>): void => { _state = { ..._state, ...partial } },
  reset: (): void => { _state = { ...EMPTY } },
}
