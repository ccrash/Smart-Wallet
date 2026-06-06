import { View, Text } from 'react-native';

import { useWalletStore } from '@/store/walletStore';

export default function RewardsScreen() {
  const loyaltyPoints = useWalletStore((s) => s.loyaltyPoints);

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-zinc-950 px-8">
      <Text className="text-4xl mb-3">⭐</Text>
      <Text className="text-lg font-semibold text-black dark:text-white">Loyalty Rewards</Text>
      <Text className="text-5xl font-bold text-primary mt-4">{loyaltyPoints}</Text>
      <Text className="text-sm text-gray-400 mt-1">points</Text>
      <Text className="text-sm text-gray-400 mt-4 text-center">
        1 pt per £1 spent · 100 pts = £1.00 credit
      </Text>
      <Text className="text-xs text-primary mt-4 font-medium">Coming Soon</Text>
    </View>
  );
}
