import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { generateId } from '@/api/client'
import { potsService } from '@/api/pots.service'
import { PotCard } from '@/components/PotCard'
import { useWalletStore } from '@/store/walletStore'
import { Pot } from '@/types'

type ModalMode = null | 'create' | 'deposit' | 'withdraw'

const MODAL_CONFIG: Record<
  Exclude<ModalMode, null>,
  { title: string; placeholder: string; keyboardType: 'default' | 'decimal-pad' }
> = {
  create:   { title: 'New pot',   placeholder: 'Pot name (e.g. Holiday)', keyboardType: 'default'     },
  deposit:  { title: 'Add money', placeholder: 'Amount (e.g. 50.00)',     keyboardType: 'decimal-pad' },
  withdraw: { title: 'Take out',  placeholder: 'Amount (e.g. 25.00)',     keyboardType: 'decimal-pad' },
}

export default function PotsScreen() {
  const addPot           = useWalletStore((s) => s.addPot)
  const updatePotBalance = useWalletStore((s) => s.updatePotBalance)
  const removePot        = useWalletStore((s) => s.removePot)
  const applyTransaction = useWalletStore((s) => s.applyTransaction)
  // Read pots directly — reactive to balance changes, not just count changes
  const displayPots      = useWalletStore((s) => s.pots)

  const [isLoading,    setIsLoading]    = useState(true)
  const [modalMode,    setModalMode]    = useState<ModalMode>(null)
  const [selectedPot,  setSelectedPot]  = useState<Pot | null>(null)
  const [inputValue,   setInputValue]   = useState('')
  const [fieldError,   setFieldError]   = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Call service on mount to honour the async/loading pattern
  useEffect(() => {
    potsService.list().then(() => setIsLoading(false))
  }, [])

  function openModal(mode: Exclude<ModalMode, null>, pot?: Pot) {
    setModalMode(mode)
    setSelectedPot(pot ?? null)
    setInputValue('')
    setFieldError('')
  }

  function closeModal() {
    setModalMode(null)
    setSelectedPot(null)
    setInputValue('')
    setFieldError('')
  }

  async function handleSubmit() {
    if (isSubmitting || !modalMode) return
    setIsSubmitting(true)
    setFieldError('')

    const now = new Date().toISOString()

    if (modalMode === 'create') {
      const r = await potsService.create(inputValue)
      if (r.data !== null) {
        addPot(r.data)
        closeModal()
      } else {
        setFieldError(r.error)
      }

    } else if (modalMode === 'deposit' && selectedPot) {
      const r = await potsService.deposit(selectedPot.id, parseFloat(inputValue))
      if (r.data !== null) {
        updatePotBalance(selectedPot.id, r.data.pot.balance)
        applyTransaction({
          id: generateId(),
          date: now,
          type: 'pot_deposit',
          amount: -r.data.debitAmount,
          description: `Transfer to ${selectedPot.name}`,
        })
        closeModal()
      } else {
        setFieldError(r.error)
      }

    } else if (modalMode === 'withdraw' && selectedPot) {
      const r = await potsService.withdraw(selectedPot.id, parseFloat(inputValue))
      if (r.data !== null) {
        updatePotBalance(selectedPot.id, r.data.pot.balance)
        applyTransaction({
          id: generateId(),
          date: now,
          type: 'pot_withdrawal',
          amount: r.data.creditAmount,
          description: `Withdraw from ${selectedPot.name}`,
        })
        closeModal()
      } else {
        setFieldError(r.error)
      }
    }

    setIsSubmitting(false)
  }

  function handleDelete(pot: Pot) {
    Alert.alert(
      `Delete "${pot.name}"?`,
      pot.balance > 0
        ? `£${pot.balance.toFixed(2)} will be returned to your wallet.`
        : 'This pot is empty and will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const r = await potsService.remove(pot.id)
            if (r.data !== null) {
              if (r.data.refundAmount > 0) {
                applyTransaction({
                  id: generateId(),
                  date: new Date().toISOString(),
                  type: 'pot_withdrawal',
                  amount: r.data.refundAmount,
                  description: `${pot.name} pot closed`,
                })
              }
              removePot(pot.id)
            }
          },
        },
      ],
    )
  }

  const config = modalMode ? MODAL_CONFIG[modalMode] : null

  return (
    <View className="flex-1 bg-gray-50 dark:bg-zinc-950">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        <Pressable
          onPress={() => openModal('create')}
          className="flex-row items-center justify-center gap-2 bg-primary rounded-2xl py-4 active:opacity-75">
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="text-base font-semibold text-white">New pot</Text>
        </Pressable>

        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="small" color="#208AEF" />
          </View>
        ) : displayPots.length === 0 ? (
          <View className="py-12 items-center">
            <View className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 items-center justify-center mb-4">
              <Ionicons name="layers-outline" size={30} color="#8b5cf6" />
            </View>
            <Text className="text-sm font-medium text-black dark:text-white">No pots yet</Text>
            <Text className="text-xs text-gray-400 mt-1 text-center">
              Create a pot to start saving towards a goal.
            </Text>
          </View>
        ) : (
          displayPots.map((pot) => (
            <PotCard
              key={pot.id}
              pot={pot}
              onDeposit={(p) => openModal('deposit', p)}
              onWithdraw={(p) => openModal('withdraw', p)}
              onDelete={handleDelete}
            />
          ))
        )}

      </ScrollView>

      <Modal
        visible={modalMode !== null}
        animationType="slide"
        transparent
        onRequestClose={closeModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1">
          <Pressable className="flex-1 bg-black/40" onPress={closeModal} />

          <View className="bg-white dark:bg-zinc-900 rounded-t-3xl px-6 pt-5 pb-10">
            <View className="w-10 h-1 rounded-full bg-gray-200 dark:bg-zinc-700 self-center mb-5" />

            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-semibold text-black dark:text-white">
                {config?.title}
                {selectedPot ? ` — ${selectedPot.name}` : ''}
              </Text>
              <Pressable onPress={closeModal} hitSlop={8} className="active:opacity-50">
                <Ionicons name="close" size={22} color="#9ca3af" />
              </Pressable>
            </View>

            <TextInput
              value={inputValue}
              onChangeText={(v) => { setInputValue(v); setFieldError('') }}
              placeholder={config?.placeholder ?? ''}
              placeholderTextColor="#9ca3af"
              keyboardType={config?.keyboardType ?? 'default'}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              className="bg-gray-50 dark:bg-zinc-800 text-black dark:text-white rounded-xl px-4 py-3.5 text-base border border-gray-100 dark:border-zinc-700"
            />

            {fieldError !== '' && (
              <Text className="text-xs text-red-500 mt-2">{fieldError}</Text>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting || inputValue.trim() === ''}
              className="mt-4 bg-primary rounded-2xl py-4 items-center active:opacity-75 disabled:opacity-40">
              {isSubmitting
                ? <ActivityIndicator size="small" color="white" />
                : <Text className="text-base font-semibold text-white">Confirm</Text>}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}
