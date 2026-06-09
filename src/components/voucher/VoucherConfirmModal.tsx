import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { VoucherProduct } from '@/types'

type Props = {
  visible: boolean
  product: VoucherProduct | null
  balance: number
  isSubmitting: boolean
  error: string
  onConfirm: () => void
  onClose: () => void
}

export function VoucherConfirmModal({
  visible,
  product,
  balance,
  isSubmitting,
  error,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View className="flex-1">
        <Pressable className="flex-1 bg-black/40" onPress={onClose} />
        <View className="bg-white dark:bg-zinc-900 rounded-t-3xl px-6 pt-5 pb-10">
          <View className="w-10 h-1 rounded-full bg-gray-200 dark:bg-zinc-700 self-center mb-5" />

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-black dark:text-white">
              Confirm purchase
            </Text>
            <Pressable onPress={onClose} hitSlop={8} className="active:opacity-50">
              <Ionicons name="close" size={22} color="#9ca3af" />
            </Pressable>
          </View>

          {product && (
            <>
              <View className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-4 mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-gray-400">Voucher</Text>
                  <Text className="text-sm font-semibold text-black dark:text-white">
                    {product.label}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-gray-400">Points earned</Text>
                  <Text className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                    +{product.pointsEarned} pts
                  </Text>
                </View>
                <View className="h-px bg-gray-200 dark:bg-zinc-700 my-2" />
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-400">Balance after</Text>
                  <Text className="text-sm font-semibold text-black dark:text-white">
                    £{(balance - product.denomination).toFixed(2)}
                  </Text>
                </View>
              </View>

              {error !== '' && (
                <Text className="text-xs text-red-500 mb-3">{error}</Text>
              )}

              <Pressable
                onPress={onConfirm}
                disabled={isSubmitting}
                className="bg-primary rounded-2xl py-4 items-center active:opacity-75 disabled:opacity-40">
                {isSubmitting
                  ? <ActivityIndicator size="small" color="white" />
                  : <Text className="text-base font-semibold text-white">
                      Buy for £{product.denomination.toFixed(2)}
                    </Text>}
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  )
}
