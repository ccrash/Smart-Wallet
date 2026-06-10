import { Text, View } from 'react-native'

import { useWalletStore } from '@/store/walletStore'

export function BalanceCard() {
  const balance = useWalletStore((s) => s.balance)
  const pots = useWalletStore((s) => s.pots)

  const potTotal = pots.reduce((sum, p) => sum + p.balance, 0)
  const potCount = pots.length

  return (
    <View className="bg-primary rounded-3xl p-6">
      <Text className="text-white/70 text-sm font-medium mb-1">Available Balance</Text>
      <Text className="text-white text-4xl font-bold">£{balance.toFixed(2)}</Text>
      {potCount > 0 && (
        <Text className="text-white/60 text-sm mt-2">
          £{potTotal.toFixed(2)} in {potCount} {potCount === 1 ? 'pot' : 'pots'}
        </Text>
      )}
    </View>
  )
}
