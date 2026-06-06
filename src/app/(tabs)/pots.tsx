import { View, Text } from 'react-native';

export default function PotsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-zinc-950 px-8">
      <Text className="text-4xl mb-3">🪣</Text>
      <Text className="text-lg font-semibold text-black dark:text-white">Savings Pots</Text>
      <Text className="text-sm text-gray-400 mt-2 text-center">
        Create named pots and move money in and out.
      </Text>
      <Text className="text-xs text-primary mt-4 font-medium">Coming soon</Text>
    </View>
  );
}
