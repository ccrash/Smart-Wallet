import { Text, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { useWalletStore } from '@/store/walletStore'

import { VoucherHistoryRow } from './VoucherHistoryRow'

export function MyVouchers() {
  const vouchers = useWalletStore((s) => s.vouchers)

  return (
    <View>
      <Text className="text-base font-semibold text-black dark:text-white mb-3">
        My Vouchers
      </Text>
      <View className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
        {vouchers.length === 0 ? (
          <View className="py-10 items-center">
            <View className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mb-3">
              <Ionicons name="pricetag-outline" size={26} color="#f97316" />
            </View>
            <Text className="text-sm font-medium text-black dark:text-white">No vouchers yet</Text>
            <Text className="text-xs text-gray-400 mt-1 text-center px-6">
              Purchase a voucher above to see your codes here.
            </Text>
          </View>
        ) : (
          vouchers.map((v, i) => (
            <VoucherHistoryRow key={v.id} voucher={v} isLast={i === vouchers.length - 1} />
          ))
        )}
      </View>
    </View>
  )
}
