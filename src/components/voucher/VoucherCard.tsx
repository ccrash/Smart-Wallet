import { Pressable, Text, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { VoucherProduct } from '@/types'

type Props = {
  product: VoucherProduct
  canAfford: boolean
  onSelect: (product: VoucherProduct) => void
}

export function VoucherCard({ product, canAfford, onSelect }: Props) {
  return (
    <Pressable
      onPress={() => canAfford && onSelect(product)}
      accessibilityRole="button"
      accessibilityLabel={`${product.label}, ${product.pointsEarned} points earned`}
      accessibilityState={{ disabled: !canAfford }}
      className={`flex-1 bg-white dark:bg-zinc-900 rounded-2xl p-4 active:opacity-75 ${!canAfford ? 'opacity-40' : ''}`}>
      <View className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mb-3">
        <Ionicons name="pricetag" size={20} color="#f97316" />
      </View>
      <Text className="text-2xl font-bold text-black dark:text-white">
        £{product.denomination}
      </Text>
      <Text className="text-xs text-gray-400 mt-1">{product.description}</Text>
      <View className="flex-row items-center gap-1 mt-3">
        <Ionicons name="star" size={12} color="#eab308" />
        <Text className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
          +{product.pointsEarned} pts
        </Text>
      </View>
    </Pressable>
  )
}
