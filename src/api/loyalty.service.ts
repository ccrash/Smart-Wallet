import { transport } from './transport'

export const loyaltyService = {
  getBalance() {
    return transport.get<number>('/loyalty/balance')
  },

  redeem(points: number) {
    return transport.post<{ creditAmount: number; remainingPoints: number; transactionId: string }>(
      '/loyalty/redeem',
      { points },
    )
  },
}
