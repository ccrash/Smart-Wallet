import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type SecurityState = {
  biometricLockEnabled: boolean
  isHydrated: boolean
  setBiometricLockEnabled: (enabled: boolean) => void
  _setHydrated: () => void
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set) => ({
      biometricLockEnabled: false,
      isHydrated: false,
      setBiometricLockEnabled: (enabled) => set({ biometricLockEnabled: enabled }),
      _setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'sw-security',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => state?._setHydrated(),
    },
  ),
)
