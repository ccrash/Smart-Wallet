import { User } from '@/types'

import { transport } from './transport'

export const authService = {
  signInMock() {
    return transport.post<User>('/auth/sign-in')
  },

  signOut() {
    return transport.post<void>('/auth/sign-out')
  },
}
