import { Pressable, Text, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { Pot } from '@/types'

type Props = {
  pot: Pot
  onDeposit: (pot: Pot) => void
  onWithdraw: (pot: Pot) => void
  onDelete: (pot: Pot) => void
}

const POT_COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // coral
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
]

function potColor(id: string): string {
  const hash = id.split('').reduce((n, c) => n + c.charCodeAt(0), 0)
  return POT_COLORS[hash % POT_COLORS.length]
}

export function PotCard({ pot, onDeposit, onWithdraw, onDelete }: Props) {
  const color = potColor(pot.id)

  return (
    <View style={{ backgroundColor: color }} className="rounded-2xl p-4">
      {/* Header: icon + name + trash */}
      <View className="flex-row items-center mb-5">
        <View
          className="w-8 h-8 rounded-xl items-center justify-center mr-2.5"
          style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}>
          <Ionicons name="layers" size={16} color="white" />
        </View>
        <Text
          className="flex-1 text-sm font-semibold"
          style={{ color: 'rgba(255,255,255,0.88)' }}
          numberOfLines={1}>
          {pot.name}
        </Text>
        <Pressable
          onPress={() => onDelete(pot)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${pot.name}`}
          className="active:opacity-50">
          <Ionicons name="trash-outline" size={17} color="rgba(255,255,255,0.55)" />
        </Pressable>
      </View>

      {/* Balance */}
      <Text className="text-white text-3xl font-bold tracking-tight mb-5">
        £{pot.balance.toFixed(2)}
      </Text>

      {/* Actions */}
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => onDeposit(pot)}
          accessibilityRole="button"
          accessibilityLabel={`Add money to ${pot.name}`}
          style={{ backgroundColor: 'rgba(255,255,255,0.26)' }}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 active:opacity-70">
          <Ionicons name="add" size={16} color="white" />
          <Text className="text-sm font-semibold text-white">Add</Text>
        </Pressable>
        <Pressable
          onPress={() => onWithdraw(pot)}
          accessibilityRole="button"
          accessibilityLabel={`Withdraw money from ${pot.name}`}
          style={{ backgroundColor: 'rgba(255,255,255,0.13)' }}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 active:opacity-70">
          <Ionicons name="remove" size={16} color="rgba(255,255,255,0.85)" />
          <Text className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Take out
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
