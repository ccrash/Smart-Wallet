import { ScrollView, View } from 'react-native'

import { MyVouchers } from '@/components/voucher/MyVouchers'
import { ShopBalanceCard } from '@/components/voucher/ShopBalanceCard'
import { VoucherCatalog } from '@/components/voucher/VoucherCatalog'

export default function ShopScreen() {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-zinc-950">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <ShopBalanceCard />
        <VoucherCatalog />
        <MyVouchers />
      </ScrollView>
    </View>
  )
}
