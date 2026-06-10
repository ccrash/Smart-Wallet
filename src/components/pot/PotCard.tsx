import { Pressable, Text, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { Pot } from '@/types'

type Props = {
  pot: Pot
  onDeposit: (pot: Pot) => void
  onWithdraw: (pot: Pot) => void
  onDelete: (pot: Pot) => void
}

export function PotCard({ pot, onDeposit, onWithdraw, onDelete }: Props) {
  return (
    <View className="bg-white dark:bg-zinc-900 rounded-2xl p-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 items-center justify-center">
          <Ionicons name="layers" size={20} color="#8b5cf6" />
        </View>
        <Pressable
          onPress={() => onDelete(pot)}
          hitSlop={8}
          accessibilityLabel={`Delete ${pot.name}`}
          className="active:opacity-50">
          <Ionicons name="trash-outline" size={18} color="#9ca3af" />
        </Pressable>
      </View>

      <Text className="text-base font-semibold text-black dark:text-white">{pot.name}</Text>
      <Text className="text-3xl font-bold text-black dark:text-white mt-1 mb-4">
        £{pot.balance.toFixed(2)}
      </Text>

      <View className="flex-row gap-2">
        <Pressable
          onPress={() => onDeposit(pot)}
          className="flex-1 flex-row items-center justify-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl py-2.5 active:opacity-70">
          <Ionicons name="add" size={16} color="#208AEF" />
          <Text className="text-sm font-semibold text-primary">Add</Text>
        </Pressable>
        <Pressable
          onPress={() => onWithdraw(pot)}
          className="flex-1 flex-row items-center justify-center gap-1.5 bg-gray-100 dark:bg-zinc-800 rounded-xl py-2.5 active:opacity-70">
          <Ionicons name="remove" size={16} color="#6b7280" />
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400">Take out</Text>
        </Pressable>
      </View>
    </View>
  )
}
