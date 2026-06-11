import { Text, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { useWalletStore } from '@/store/walletStore'

export function ShopBalanceCard() {
  const balance       = useWalletStore((s) => s.balance)
  const loyaltyPoints = useWalletStore((s) => s.loyaltyPoints)

  return (
    <View className="bg-primary rounded-3xl p-6">
      <Text className="text-white/70 text-sm font-medium mb-1">Available Balance</Text>
      <Text className="text-white text-4xl font-bold tracking-tight">£{balance.toFixed(2)}</Text>
      <View className="flex-row mt-4">
        <View
          className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
          <Ionicons name="star" size={13} color="#fde047" />
          <Text className="text-white text-xs font-medium">
            {loyaltyPoints} pts · 1 pt per £1 spent
          </Text>
        </View>
      </View>
    </View>
  )
}
