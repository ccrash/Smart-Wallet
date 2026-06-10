import { ScrollView } from 'react-native'

import { useTabBarPadding } from '@/components/FloatingTabBar'
import { HowItWorksCard } from '@/components/rewards/HowItWorksCard'
import { PointsHeroCard } from '@/components/rewards/PointsHeroCard'
import { RedeemCard } from '@/components/rewards/RedeemCard'

export default function RewardsScreen() {
  const tabPad = useTabBarPadding()
  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-zinc-950"
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: tabPad }}>
      <PointsHeroCard />
      <RedeemCard />
      <HowItWorksCard />
    </ScrollView>
  )
}
