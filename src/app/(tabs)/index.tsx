import { ScrollView, View } from 'react-native'

import { BalanceCard } from '@/components/wallet/BalanceCard'
import { TransactionList } from '@/components/wallet/TransactionList'

export default function WalletScreen() {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-zinc-950">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <BalanceCard />
        <TransactionList />
      </ScrollView>
    </View>
  )
}
