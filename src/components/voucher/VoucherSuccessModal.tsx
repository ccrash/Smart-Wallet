import {
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { Voucher } from '@/types'

type Props = {
  visible: boolean
  voucher: Voucher | null
  onClose: () => void
}

export function VoucherSuccessModal({ visible, voucher, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      accessibilityViewIsModal
      onRequestClose={onClose}>
      <View className="flex-1">
        <Pressable className="flex-1 bg-black/40" onPress={onClose} />
        <View className="bg-white dark:bg-zinc-900 rounded-t-3xl px-6 pt-5 pb-10">
          <View className="w-10 h-1 rounded-full bg-gray-200 dark:bg-zinc-700 self-center mb-5" />

          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-3">
              <Ionicons name="checkmark-circle" size={36} color="#22c55e" />
            </View>
            <Text className="text-lg font-semibold text-black dark:text-white">
              Voucher purchased!
            </Text>
            {voucher && (
              <Text className="text-sm text-gray-400 mt-1">
                +{voucher.pointsEarned} pts added to your rewards
              </Text>
            )}
          </View>

          {voucher && (
            <>
              <Text className="text-xs text-gray-400 text-center uppercase tracking-wider font-medium mb-2">
                Your voucher code
              </Text>
              <View className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-5 items-center mb-6">
                <Text className="text-3xl font-bold text-black dark:text-white tracking-widest">
                  {voucher.code}
                </Text>
              </View>
            </>
          )}

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Done"
            className="bg-primary rounded-2xl py-4 items-center active:opacity-75">
            <Text className="text-base font-semibold text-white">Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}
