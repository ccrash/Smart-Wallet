import { Text, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { useWalletStore } from '@/store/walletStore'

const POINTS_PER_UNIT = 100

export function PointsHeroCard() {
  const loyaltyPoints = useWalletStore((s) => s.loyaltyPoints)

  const maxRedeemable = Math.floor(loyaltyPoints / POINTS_PER_UNIT) * POINTS_PER_UNIT
  const progressPct   = Math.min((loyaltyPoints % POINTS_PER_UNIT) / POINTS_PER_UNIT, 1)

  return (
    <View className="bg-primary rounded-3xl p-6">
      <View className="flex-row items-center gap-2 mb-4">
        <Ionicons name="star" size={18} color="rgba(255,255,255,0.8)" />
        <Text className="text-white/80 text-sm font-medium">Loyalty Points</Text>
      </View>

      <Text className="text-white text-5xl font-bold">{loyaltyPoints.toLocaleString()}</Text>
      <Text className="text-white/60 text-sm mt-1">pts available</Text>

      <View className="mt-4">
        <View className="flex-row justify-between mb-1.5">
          <Text className="text-white/60 text-xs">
            {loyaltyPoints % POINTS_PER_UNIT} / {POINTS_PER_UNIT} pts to next £1
          </Text>
          <Text className="text-white/60 text-xs">
            {maxRedeemable > 0 ? `${maxRedeemable} redeemable` : 'Earn more to redeem'}
          </Text>
        </View>
        <View className="h-1.5 rounded-full bg-white/20">
          <View
            className="h-1.5 rounded-full bg-white"
            style={{ width: `${Math.round(progressPct * 100)}%` }}
          />
        </View>
      </View>
    </View>
  )
}
