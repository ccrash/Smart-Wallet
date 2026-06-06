import { View, Text, ScrollView } from 'react-native';

import { useWalletStore } from '@/store/walletStore';

export default function WalletScreen() {
  const { balance, transactions } = useWalletStore();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-zinc-950">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        <View className="bg-primary rounded-3xl p-6">
          <Text className="text-white/70 text-sm font-medium mb-1">Available Balance</Text>
          <Text className="text-white text-4xl font-bold">£{balance.toFixed(2)}</Text>
        </View>

        <View className="bg-white dark:bg-zinc-900 rounded-2xl p-4">
          <Text className="text-base font-semibold text-black dark:text-white mb-3">
            Recent Transactions
          </Text>
          {transactions.length === 0 ? (
            <Text className="text-gray-400 text-sm text-center py-4">No transactions yet</Text>
          ) : (
            transactions.map((tx, i) => (
              <View
                key={tx.id}
                style={{ borderBottomWidth: i < transactions.length - 1 ? 1 : 0 }}
                className="flex-row justify-between items-center py-3 border-gray-100 dark:border-zinc-800">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-black dark:text-white">
                    {tx.description}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {new Date(tx.date).toLocaleDateString('en-GB')}
                  </Text>
                </View>
                <Text className={`text-sm font-semibold ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.amount >= 0 ? '+' : ''}£{Math.abs(tx.amount).toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}
