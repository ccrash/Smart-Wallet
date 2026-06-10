import { Text, View } from 'react-native'

import { useWalletStore } from '@/store/walletStore'

export function ShopBalanceCard() {
  const balance       = useWalletStore((s) => s.balance)
  const loyaltyPoints = useWalletStore((s) => s.loyaltyPoints)

  return (
    <View className="bg-primary rounded-3xl p-6">
      <Text className="text-white/70 text-sm font-medium mb-1">Available Balance</Text>
      <Text className="text-white text-4xl font-bold">£{balance.toFixed(2)}</Text>
      <Text className="text-white/60 text-sm mt-2">
        {loyaltyPoints} pts · 1 pt per £1 spent
      </Text>
    </View>
  )
}
