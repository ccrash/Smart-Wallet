import catalogJson from '@/data/vouchers.json'
import { Pot, User, Voucher, VoucherProduct } from '@/types'
import { isValidAmount, roundMoney } from '@/utils/money'

import { generateId } from '../client'
import { db } from '../db'
import { ApiTransport } from './types'

const DELAY_MS = 150
const PAGE_SIZE = 20
const MAX_NAME_LENGTH = 30
const POINTS_PER_UNIT = 100
const CREDIT_PER_UNIT = 1

const VOUCHER_CATALOG: VoucherProduct[] = catalogJson
const VOUCHER_DENOMINATIONS = VOUCHER_CATALOG.map((v) => v.denomination)

const MOCK_USER: User = {
  id: 'mock-user-001',
  displayName: 'Alex Johnson',
  email: 'alex@example.com',
  photoURL: null,
}

function respond<T>(handler: () => T): Promise<import('@/types').ApiResponse<T>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        resolve({ data: handler(), error: null })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred'
        resolve({ data: null, error: message })
      }
    }, DELAY_MS)
  })
}

function matchPath(pattern: string, path: string): Record<string, string> | null {
  const pp = pattern.split('/')
  const ap = path.split('/')
  if (pp.length !== ap.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) params[pp[i].slice(1)] = ap[i]
    else if (pp[i] !== ap[i]) return null
  }
  return params
}

export const mockTransport: ApiTransport = {
  get<T>(path: string, params: Record<string, string | number> = {}) {
    if (path === '/wallet/balance') {
      return respond(() => db.get().balance) as Promise<import('@/types').ApiResponse<T>>
    }

    if (path === '/wallet/transactions') {
      return respond(() => {
        const page = Number(params.page ?? 0)
        const all = db.get().transactions
        const start = page * PAGE_SIZE
        return { items: all.slice(start, start + PAGE_SIZE), hasMore: start + PAGE_SIZE < all.length }
      }) as Promise<import('@/types').ApiResponse<T>>
    }

    if (path === '/pots') {
      return respond(() => db.get().pots) as Promise<import('@/types').ApiResponse<T>>
    }

    if (path === '/vouchers') {
      return respond(() => db.get().vouchers) as Promise<import('@/types').ApiResponse<T>>
    }

    if (path === '/loyalty/balance') {
      return respond(() => db.get().loyaltyPoints) as Promise<import('@/types').ApiResponse<T>>
    }

    return Promise.resolve({ data: null, error: `Unknown route: GET ${path}` }) as Promise<import('@/types').ApiResponse<T>>
  },

  post<T>(path: string, body: unknown = {}) {
    const b = body as Record<string, unknown>

    if (path === '/auth/sign-in') {
      return respond(() => MOCK_USER) as Promise<import('@/types').ApiResponse<T>>
    }

    if (path === '/auth/sign-out') {
      return respond(() => undefined as void) as Promise<import('@/types').ApiResponse<T>>
    }

    if (path === '/pots') {
      return respond((): Pot => {
        const trimmed = String(b.name ?? '').trim()
        if (!trimmed) throw new Error('Pot name cannot be empty.')
        if (trimmed.length > MAX_NAME_LENGTH)
          throw new Error(`Pot name must be ${MAX_NAME_LENGTH} characters or fewer.`)
        const { pots } = db.get()
        if (pots.some((p) => p.name.toLowerCase() === trimmed.toLowerCase()))
          throw new Error(`A pot named "${trimmed}" already exists.`)
        return { id: generateId(), name: trimmed, balance: 0, createdAt: new Date().toISOString() }
      }) as Promise<import('@/types').ApiResponse<T>>
    }

    const depositMatch = matchPath('/pots/:id/deposit', path)
    if (depositMatch) {
      return respond(() => {
        const amount = Number(b.amount)
        if (!isValidAmount(amount))
          throw new Error('Deposit amount must be a positive number with at most 2 decimal places.')
        const { balance, pots } = db.get()
        const pot = pots.find((p) => p.id === depositMatch.id)
        if (!pot) throw new Error('Pot not found.')
        if (balance < amount) throw new Error('Insufficient balance.')
        return { pot: { ...pot, balance: roundMoney(pot.balance + amount) }, debitAmount: amount }
      }) as Promise<import('@/types').ApiResponse<T>>
    }

    const withdrawMatch = matchPath('/pots/:id/withdraw', path)
    if (withdrawMatch) {
      return respond(() => {
        const amount = Number(b.amount)
        if (!isValidAmount(amount))
          throw new Error('Withdrawal amount must be a positive number with at most 2 decimal places.')
        const { pots } = db.get()
        const pot = pots.find((p) => p.id === withdrawMatch.id)
        if (!pot) throw new Error('Pot not found.')
        if (pot.balance < amount) throw new Error('Insufficient pot balance.')
        return { pot: { ...pot, balance: roundMoney(pot.balance - amount) }, creditAmount: amount }
      }) as Promise<import('@/types').ApiResponse<T>>
    }

    if (path === '/vouchers/purchase') {
      return respond((): Voucher => {
        const denomination = Number(b.denomination)
        if (!VOUCHER_DENOMINATIONS.includes(denomination))
          throw new Error(`Invalid denomination. Choose from: ${VOUCHER_DENOMINATIONS.join(', ')}.`)
        const { balance } = db.get()
        if (balance < denomination) throw new Error('Insufficient balance.')
        const product = VOUCHER_CATALOG.find((v) => v.denomination === denomination)
        return {
          id: generateId(),
          denomination,
          code: `SW-${generateId().toUpperCase().slice(0, 8)}`,
          purchasedAt: new Date().toISOString(),
          pointsEarned: product?.pointsEarned ?? denomination,
        }
      }) as Promise<import('@/types').ApiResponse<T>>
    }

    if (path === '/loyalty/redeem') {
      return respond(() => {
        const points = Number(b.points)
        if (points <= 0) throw new Error('Points to redeem must be greater than zero.')
        if (points % POINTS_PER_UNIT !== 0)
          throw new Error(`Points must be redeemed in multiples of ${POINTS_PER_UNIT}.`)
        const { loyaltyPoints } = db.get()
        if (loyaltyPoints < points) throw new Error('Insufficient loyalty points.')
        return {
          creditAmount: (points / POINTS_PER_UNIT) * CREDIT_PER_UNIT,
          remainingPoints: loyaltyPoints - points,
          transactionId: generateId(),
        }
      }) as Promise<import('@/types').ApiResponse<T>>
    }

    return Promise.resolve({ data: null, error: `Unknown route: POST ${path}` }) as Promise<import('@/types').ApiResponse<T>>
  },

  put<T>(_path: string, _body?: unknown) {
    return Promise.resolve({ data: null, error: 'Not implemented in mock transport' }) as Promise<import('@/types').ApiResponse<T>>
  },

  del<T>(path: string) {
    const deleteMatch = matchPath('/pots/:id', path)
    if (deleteMatch) {
      return respond(() => {
        const pot = db.get().pots.find((p) => p.id === deleteMatch.id)
        if (!pot) throw new Error('Pot not found.')
        return { refundAmount: pot.balance }
      }) as Promise<import('@/types').ApiResponse<T>>
    }

    return Promise.resolve({ data: null, error: `Unknown route: DELETE ${path}` }) as Promise<import('@/types').ApiResponse<T>>
  },
}
