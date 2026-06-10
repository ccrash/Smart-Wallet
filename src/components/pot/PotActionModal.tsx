import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { Pot } from '@/types'

export type PotModalMode = 'create' | 'deposit' | 'withdraw'

const MODAL_CONFIG: Record<
  PotModalMode,
  { title: string; placeholder: string; keyboardType: 'default' | 'decimal-pad' }
> = {
  create:   { title: 'New pot',   placeholder: 'Pot name (e.g. Holiday)', keyboardType: 'default'     },
  deposit:  { title: 'Add money', placeholder: 'Amount (e.g. 50.00)',     keyboardType: 'decimal-pad' },
  withdraw: { title: 'Take out',  placeholder: 'Amount (e.g. 25.00)',     keyboardType: 'decimal-pad' },
}

type Props = {
  mode: PotModalMode | null
  selectedPot: Pot | null
  inputValue: string
  fieldError: string
  isSubmitting: boolean
  onChangeInput: (val: string) => void
  onSubmit: () => void
  onClose: () => void
}

export function PotActionModal({
  mode,
  selectedPot,
  inputValue,
  fieldError,
  isSubmitting,
  onChangeInput,
  onSubmit,
  onClose,
}: Props) {
  const config = mode ? MODAL_CONFIG[mode] : null

  return (
    <Modal
      visible={mode !== null}
      animationType="slide"
      transparent
      accessibilityViewIsModal
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <Pressable className="flex-1 bg-black/40" onPress={onClose} />

        <View className="bg-white dark:bg-zinc-900 rounded-t-3xl px-6 pt-5 pb-10">
          <View className="w-10 h-1 rounded-full bg-gray-200 dark:bg-zinc-700 self-center mb-5" />

          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-lg font-semibold text-black dark:text-white">
              {config?.title}
              {selectedPot ? ` — ${selectedPot.name}` : ''}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="active:opacity-50">
              <Ionicons name="close" size={22} color="#9ca3af" />
            </Pressable>
          </View>

          <TextInput
            value={inputValue}
            onChangeText={onChangeInput}
            placeholder={config?.placeholder ?? ''}
            placeholderTextColor="#9ca3af"
            keyboardType={config?.keyboardType ?? 'default'}
            accessibilityLabel={config?.title ?? 'Enter value'}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            className="bg-gray-50 dark:bg-zinc-800 text-black dark:text-white rounded-xl px-4 py-3.5 text-base border border-gray-100 dark:border-zinc-700"
          />

          {fieldError !== '' && (
            <Text className="text-xs text-red-500 mt-2">{fieldError}</Text>
          )}

          <Pressable
            onPress={onSubmit}
            disabled={isSubmitting || inputValue.trim() === ''}
            accessibilityRole="button"
            accessibilityLabel={isSubmitting ? 'Processing' : 'Confirm'}
            accessibilityState={{ disabled: isSubmitting || inputValue.trim() === '' }}
            className="mt-4 bg-primary rounded-2xl py-4 items-center active:opacity-75 disabled:opacity-40">
            {isSubmitting
              ? <ActivityIndicator size="small" color="white" />
              : <Text className="text-base font-semibold text-white">Confirm</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
