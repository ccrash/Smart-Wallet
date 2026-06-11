import { Pressable, Text, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { VoucherProduct } from '@/types'

import { voucherColor } from './voucherTheme'

type Props = {
  product: VoucherProduct
  canAfford: boolean
  onSelect: (product: VoucherProduct) => void
}

export function VoucherCard({ product, canAfford, onSelect }: Props) {
  const color = voucherColor(product.denomination)

  return (
    <Pressable
      onPress={() => canAfford && onSelect(product)}
      accessibilityRole="button"
      accessibilityLabel={`${product.label}, ${product.pointsEarned} points earned`}
      accessibilityState={{ disabled: !canAfford }}
      style={{ backgroundColor: color }}
      className={`flex-1 rounded-2xl p-4 active:opacity-75 ${!canAfford ? 'opacity-40' : ''}`}>
      <View className="flex-row items-center justify-between mb-3">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}>
          <Ionicons name="pricetag" size={17} color="white" />
        </View>
        <View
          className="flex-row items-center gap-1 rounded-full px-2 py-1"
          style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
          <Ionicons name="star" size={11} color="white" />
          <Text className="text-xs font-semibold text-white">+{product.pointsEarned} pts</Text>
        </View>
      </View>
      <Text className="text-2xl font-bold text-white tracking-tight">
        £{product.denomination}
      </Text>
      <Text className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.75)' }} numberOfLines={2}>
        {product.description}
      </Text>
    </Pressable>
  )
}
