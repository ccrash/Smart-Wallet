import '@/global.css'

import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { useColorScheme } from 'nativewind'

import { BiometricGate } from '@/components/BiometricGate'
import { useThemeStore } from '@/store/themeStore'
import { useWalletStore } from '@/store/walletStore'

export default function RootLayout() {
  const { preference } = useThemeStore()
  const { setColorScheme } = useColorScheme()
  const { seed, isHydrated } = useWalletStore()

  useEffect(() => {
    setColorScheme(preference)
  }, [preference, setColorScheme])

  useEffect(() => {
    if (isHydrated) seed()
  }, [isHydrated, seed])

  return (
    <BiometricGate>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </BiometricGate>
  )
}
