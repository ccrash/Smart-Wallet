import { ScrollView } from 'react-native'

import { HowItWorksCard } from '@/components/rewards/HowItWorksCard'
import { PointsHeroCard } from '@/components/rewards/PointsHeroCard'
import { RedeemCard } from '@/components/rewards/RedeemCard'

export default function RewardsScreen() {
  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-zinc-950"
      contentContainerStyle={{ padding: 16, gap: 16 }}>
      <PointsHeroCard />
      <RedeemCard />
      <HowItWorksCard />
    </ScrollView>
  )
}
