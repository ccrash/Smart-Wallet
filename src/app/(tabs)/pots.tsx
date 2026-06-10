import { View } from 'react-native'

import { PotList } from '@/components/pot/PotList'

export default function PotsScreen() {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-zinc-950">
      <PotList />
    </View>
  )
}
