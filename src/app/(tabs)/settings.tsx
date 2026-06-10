import { Alert, Pressable, ScrollView, Text, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { useTabBarPadding } from '@/components/FloatingTabBar'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useWalletStore } from '@/store/walletStore'
import { ThemePreference } from '@/types'

type ThemeOption = { value: ThemePreference; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: 'sunny' },
  { value: 'dark',  label: 'Dark',  icon: 'moon'  },
  { value: 'system', label: 'System', icon: 'contrast' },
]

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const { preference, setPreference } = useThemeStore()
  const reset = useWalletStore((s) => s.reset)
  const seed  = useWalletStore((s) => s.seed)

  const tabPad = useTabBarPadding()

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  function handleResetData() {
    Alert.alert(
      'Reset wallet data',
      'This will clear all pots, vouchers, and transactions and restore the demo data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => { reset(); seed() },
        },
      ],
    )
  }

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ])
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-zinc-950">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: tabPad }}>

        {/* Profile */}
        <View className="bg-white dark:bg-zinc-900 rounded-2xl p-4 flex-row items-center gap-4">
          <View className="w-14 h-14 rounded-full bg-primary items-center justify-center">
            <Text className="text-white font-bold text-xl">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-black dark:text-white">
              {user?.displayName}
            </Text>
            <Text className="text-sm text-gray-400">{user?.email}</Text>
          </View>
        </View>

        {/* Appearance */}
        <View className="bg-white dark:bg-zinc-900 rounded-2xl p-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Appearance
          </Text>
          <View className="flex-row gap-2">
            {THEME_OPTIONS.map((opt) => {
              const active = preference === opt.value
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setPreference(opt.value)}
                  accessibilityRole="radio"
                  accessibilityLabel={`${opt.label} theme`}
                  accessibilityState={{ checked: active }}
                  className={`flex-1 items-center py-3 rounded-xl border ${
                    active
                      ? 'bg-primary border-primary'
                      : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700'
                  } active:opacity-70`}>
                  <Ionicons name={opt.icon} size={20} color={active ? 'white' : '#9ca3af'} />
                  <Text className={`text-xs mt-1 font-medium ${active ? 'text-white' : 'text-gray-400'}`}>
                    {opt.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Data */}
        <View className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-4 pb-1">
            Data
          </Text>
          <Pressable
            onPress={handleResetData}
            accessibilityRole="button"
            accessibilityLabel="Reset wallet data"
            className="flex-row items-center px-4 py-4 gap-3 active:opacity-60">
            <View className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center">
              <Ionicons name="refresh" size={18} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-black dark:text-white">Reset wallet data</Text>
              <Text className="text-xs text-gray-400 mt-0.5">Restore demo transactions and clear pots</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>
        </View>

        {/* Account */}
        <View className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-4 pb-1">
            Account
          </Text>
          <Pressable
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            className="flex-row items-center px-4 py-4 gap-3 active:opacity-60">
            <View className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center">
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            </View>
            <Text className="flex-1 text-sm font-medium text-red-500">Sign out</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>
        </View>

      </ScrollView>
    </View>
  )
}
