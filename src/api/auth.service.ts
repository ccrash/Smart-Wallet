import { User } from '@/types'

import { transport } from './transport'

export const authService = {
  signIn(displayName: string) {
    return transport.post<User>('/auth/sign-in', { displayName })
  },

  signOut() {
    return transport.post<void>('/auth/sign-out')
  },
}
