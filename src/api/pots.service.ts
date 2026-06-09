import { Pot } from '@/types'

import { transport } from './transport'

export const potsService = {
  list() {
    return transport.get<Pot[]>('/pots')
  },

  create(name: string) {
    return transport.post<Pot>('/pots', { name })
  },

  deposit(potId: string, amount: number) {
    return transport.post<{ pot: Pot; debitAmount: number }>(`/pots/${potId}/deposit`, { amount })
  },

  withdraw(potId: string, amount: number) {
    return transport.post<{ pot: Pot; creditAmount: number }>(`/pots/${potId}/withdraw`, { amount })
  },

  remove(potId: string) {
    return transport.del<{ refundAmount: number }>(`/pots/${potId}`)
  },
}
