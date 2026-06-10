import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { User } from '@/types'

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  signIn: (user: User) => void;
  signOut: () => void;
  _setHydrated: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      signIn: (user) => set({ user, isAuthenticated: true }),
      signOut: () => set({ user: null, isAuthenticated: false }),
      _setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'sw-auth',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => state?._setHydrated(),
    },
  ),
)
