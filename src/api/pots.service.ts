import { ApiResponse, Pot } from '@/types'

import { generateId, mockRequest } from './client'
import { db } from './db'

const MAX_NAME_LENGTH = 30

export const potsService = {
  list(): Promise<ApiResponse<Pot[]>> {
    return mockRequest(() => db.get().pots)
  },

  create(name: string): Promise<ApiResponse<Pot>> {
    return mockRequest(() => {
      const trimmed = name.trim()
      if (!trimmed) throw new Error('Pot name cannot be empty.')
      if (trimmed.length > MAX_NAME_LENGTH)
        throw new Error(`Pot name must be ${MAX_NAME_LENGTH} characters or fewer.`)

      const { pots } = db.get()
      if (pots.some((p) => p.name.toLowerCase() === trimmed.toLowerCase()))
        throw new Error(`A pot named "${trimmed}" already exists.`)

      return {
        id: generateId(),
        name: trimmed,
        balance: 0,
        createdAt: new Date().toISOString(),
      }
    })
  },

  deposit(potId: string, amount: number): Promise<ApiResponse<{ pot: Pot; debitAmount: number }>> {
    return mockRequest(() => {
      if (amount <= 0) throw new Error('Deposit amount must be greater than zero.')

      const { balance, pots } = db.get()
      const pot = pots.find((p) => p.id === potId)
      if (!pot) throw new Error('Pot not found.')
      if (balance < amount) throw new Error('Insufficient balance.')

      return { pot: { ...pot, balance: pot.balance + amount }, debitAmount: amount }
    })
  },

  withdraw(potId: string, amount: number): Promise<ApiResponse<{ pot: Pot; creditAmount: number }>> {
    return mockRequest(() => {
      if (amount <= 0) throw new Error('Withdrawal amount must be greater than zero.')

      const { pots } = db.get()
      const pot = pots.find((p) => p.id === potId)
      if (!pot) throw new Error('Pot not found.')
      if (pot.balance < amount) throw new Error('Insufficient pot balance.')

      return { pot: { ...pot, balance: pot.balance - amount }, creditAmount: amount }
    })
  },

  remove(potId: string): Promise<ApiResponse<{ refundAmount: number }>> {
    return mockRequest(() => {
      const { pots } = db.get()
      const pot = pots.find((p) => p.id === potId)
      if (!pot) throw new Error('Pot not found.')

      return { refundAmount: pot.balance }
    })
  },
}
