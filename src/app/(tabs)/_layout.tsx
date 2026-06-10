import { Redirect, Tabs } from 'expo-router'

import { AppHeader } from '@/components/AppHeader'
import { FloatingTabBar } from '@/components/FloatingTabBar'
import { useAuthStore } from '@/store/authStore'

export default function TabsLayout() {
  const { isAuthenticated, isHydrated } = useAuthStore()

  if (!isHydrated) return null
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        header: () => <AppHeader />,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Wallet' }} />
      <Tabs.Screen name="pots" options={{ title: 'Pots' }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop' }} />
      <Tabs.Screen name="rewards" options={{ title: 'Rewards' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  )
}
