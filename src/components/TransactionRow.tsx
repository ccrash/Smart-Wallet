import { Text, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { Transaction, TransactionType } from '@/types'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']
type IconConfig = { name: IoniconName; bg: string }

const TX_ICON: Record<TransactionType, IconConfig> = {
  seed:             { name: 'gift-outline',    bg: 'bg-green-500'  },
  pot_deposit:      { name: 'arrow-down-circle', bg: 'bg-blue-500'  },
  pot_withdrawal:   { name: 'arrow-up-circle',   bg: 'bg-violet-500'},
  voucher_purchase: { name: 'pricetag',          bg: 'bg-orange-500'},
  points_redemption:{ name: 'star',              bg: 'bg-yellow-500'},
}

type Props = {
  tx: Transaction
  isLast: boolean
}

export function TransactionRow({ tx, isLast }: Props) {
  const icon = TX_ICON[tx.type]
  return (
    <View
      style={{ borderBottomWidth: isLast ? 0 : 1 }}
      className="flex-row items-center gap-3 py-3 border-gray-100 dark:border-zinc-800">
      <View className={`w-10 h-10 rounded-full items-center justify-center ${icon.bg}`}>
        <Ionicons name={icon.name} size={18} color="white" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-black dark:text-white">
          {tx.description}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          {new Date(tx.date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </View>
      <View className="items-end">
        <Text
          className={`text-sm font-semibold ${
            tx.amount >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
          {tx.amount >= 0 ? '+' : ''}£{Math.abs(tx.amount).toFixed(2)}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          £{tx.runningBalance.toFixed(2)} bal
        </Text>
      </View>
    </View>
  )
}
