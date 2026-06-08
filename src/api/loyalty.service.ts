import { ApiResponse } from '@/types'

import { generateId, mockRequest } from './client'
import { db } from './db'

const POINTS_PER_REDEMPTION_UNIT = 100
const CREDIT_PER_REDEMPTION_UNIT = 1

export const loyaltyService = {
  getBalance(): Promise<ApiResponse<number>> {
    return mockRequest(() => db.get().loyaltyPoints)
  },

  redeem(points: number): Promise<ApiResponse<{ creditAmount: number; remainingPoints: number; transactionId: string }>> {
    return mockRequest(() => {
      if (points <= 0) throw new Error('Points to redeem must be greater than zero.')
      if (points % POINTS_PER_REDEMPTION_UNIT !== 0)
        throw new Error(`Points must be redeemed in multiples of ${POINTS_PER_REDEMPTION_UNIT}.`)

      const { loyaltyPoints } = db.get()
      if (loyaltyPoints < points) throw new Error('Insufficient loyalty points.')

      const creditAmount = (points / POINTS_PER_REDEMPTION_UNIT) * CREDIT_PER_REDEMPTION_UNIT
      return {
        creditAmount,
        remainingPoints: loyaltyPoints - points,
        transactionId: generateId(),
      }
    })
  },
}
