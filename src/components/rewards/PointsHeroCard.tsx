import { Text, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { useWalletStore } from '@/store/walletStore'

const POINTS_PER_UNIT = 100
const CREDIT_PER_UNIT = 1
const GOLD = '#f59e0b'

export function PointsHeroCard() {
  const loyaltyPoints = useWalletStore((s) => s.loyaltyPoints)

  const maxRedeemable = Math.floor(loyaltyPoints / POINTS_PER_UNIT) * POINTS_PER_UNIT
  const cycleProgress = loyaltyPoints % POINTS_PER_UNIT
  const progressPct   = Math.min(cycleProgress / POINTS_PER_UNIT, 1)
  const creditValue   = (maxRedeemable / POINTS_PER_UNIT) * CREDIT_PER_UNIT
  const ptsToRedeem   = POINTS_PER_UNIT - cycleProgress

  return (
    <View style={{ backgroundColor: GOLD }} className="rounded-3xl p-6">
      <View className="flex-row items-center gap-2 mb-4">
        <View
          className="w-7 h-7 rounded-lg items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}>
          <Ionicons name="star" size={14} color="white" />
        </View>
        <Text className="text-white/80 text-sm font-medium">Loyalty Points</Text>
      </View>

      <Text className="text-white text-5xl font-bold tracking-tight">
        {loyaltyPoints.toLocaleString()}
      </Text>
      <Text className="text-white/70 text-sm mt-1">
        {maxRedeemable > 0
          ? `worth £${creditValue.toFixed(2)} in wallet credit`
          : `earn ${ptsToRedeem} more ${ptsToRedeem === 1 ? 'pt' : 'pts'} to redeem`}
      </Text>

      <View className="mt-4">
        <Text className="text-white/60 text-xs mb-1.5">
          {cycleProgress} / {POINTS_PER_UNIT} pts to next £1
        </Text>
        <View className="h-1.5 rounded-full bg-white/25">
          <View
            className="h-1.5 rounded-full bg-white"
            style={{ width: `${Math.round(progressPct * 100)}%` }}
          />
        </View>
      </View>
    </View>
  )
}
