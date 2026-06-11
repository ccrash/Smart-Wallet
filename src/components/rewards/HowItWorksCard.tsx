import { Text, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

const STEPS = [
  {
    icon: 'pricetag-outline' as const,
    iconColor: '#f59e0b',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    title: 'Earn points',
    body: 'Get 1 pt for every £1 spent on vouchers. Points are credited instantly.',
  },
  {
    icon: 'cash-outline' as const,
    iconColor: '#22c55e',
    bg: 'bg-green-100 dark:bg-green-900/30',
    title: 'Redeem for credit',
    body: '100 pts = £1.00 wallet credit. Redeem in multiples of 100.',
  },
  {
    icon: 'wallet-outline' as const,
    iconColor: '#1C274C',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    title: 'Use your credit',
    body: 'Redeemed credit goes straight to your wallet balance — spend it on anything.',
  },
]

export function HowItWorksCard() {
  return (
    <View className="bg-white dark:bg-zinc-900 rounded-3xl p-5">
      <Text className="text-base font-semibold text-black dark:text-white mb-4">
        How it works
      </Text>

      <View style={{ gap: 14 }}>
        {STEPS.map((step) => (
          <View key={step.title} className="flex-row items-start gap-3">
            <View className={`w-8 h-8 rounded-full ${step.bg} items-center justify-center mt-0.5`}>
              <Ionicons name={step.icon} size={15} color={step.iconColor} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-black dark:text-white">{step.title}</Text>
              <Text className="text-xs text-gray-400 mt-0.5 leading-4">{step.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
