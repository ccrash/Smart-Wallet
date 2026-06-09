import { Text, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { Voucher } from '@/types'

type Props = {
  voucher: Voucher
  isLast: boolean
}

export function VoucherHistoryRow({ voucher, isLast }: Props) {
  return (
    <View
      style={{ borderBottomWidth: isLast ? 0 : 1 }}
      className="flex-row items-center gap-3 px-4 py-3 border-gray-100 dark:border-zinc-800">
      <View className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center">
        <Ionicons name="pricetag" size={18} color="#f97316" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-black dark:text-white">
          £{voucher.denomination} Voucher
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          {new Date(voucher.purchasedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </View>
      <View className="items-end">
        <View className="bg-gray-100 dark:bg-zinc-800 rounded-lg px-2.5 py-1">
          <Text className="text-xs font-semibold text-black dark:text-white tracking-widest">
            {voucher.code}
          </Text>
        </View>
        <Text className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
          +{voucher.pointsEarned} pts earned
        </Text>
      </View>
    </View>
  )
}
