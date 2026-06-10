import { ScrollView, View } from 'react-native'

import { useTabBarPadding } from '@/components/FloatingTabBar'
import { MyVouchers } from '@/components/voucher/MyVouchers'
import { ShopBalanceCard } from '@/components/voucher/ShopBalanceCard'
import { VoucherCatalog } from '@/components/voucher/VoucherCatalog'

export default function ShopScreen() {
  const tabPad = useTabBarPadding()
  return (
    <View className="flex-1 bg-gray-50 dark:bg-zinc-950">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: tabPad }}>
        <ShopBalanceCard />
        <VoucherCatalog />
        <MyVouchers />
      </ScrollView>
    </View>
  )
}
