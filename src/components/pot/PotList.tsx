import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { generateId } from '@/api/client'
import { potsService } from '@/api/pots.service'
import { useTabBarPadding } from '@/components/FloatingTabBar'
import { useWalletStore } from '@/store/walletStore'
import { Pot } from '@/types'
import { parseMoneyInput } from '@/utils/money'

import { PotActionModal, PotModalMode } from './PotActionModal'
import { PotCard } from './PotCard'

export function PotList() {
  const addPot           = useWalletStore((s) => s.addPot)
  const updatePotBalance = useWalletStore((s) => s.updatePotBalance)
  const removePot        = useWalletStore((s) => s.removePot)
  const applyTransaction = useWalletStore((s) => s.applyTransaction)
  const displayPots      = useWalletStore((s) => s.pots)

  const tabPad = useTabBarPadding()

  const [isLoading,    setIsLoading]    = useState(true)
  const [modalMode,    setModalMode]    = useState<PotModalMode | null>(null)
  const [selectedPot,  setSelectedPot]  = useState<Pot | null>(null)
  const [inputValue,   setInputValue]   = useState('')
  const [fieldError,   setFieldError]   = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    potsService.list().then(() => setIsLoading(false))
  }, [])

  function openModal(mode: PotModalMode, pot?: Pot) {
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

    } else if (selectedPot) {
      const amount = parseMoneyInput(inputValue)

      if (amount === null) {
        setFieldError('Enter a valid amount, e.g. 25 or 25.50.')

      } else if (modalMode === 'deposit') {
        const r = await potsService.deposit(selectedPot.id, amount)
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

      } else if (modalMode === 'withdraw') {
        const r = await potsService.withdraw(selectedPot.id, amount)
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

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: tabPad }}>

        <Pressable
          onPress={() => openModal('create')}
          accessibilityRole="button"
          accessibilityLabel="Create a new pot"
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
            <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 items-center justify-center mb-4">
              <Ionicons name="layers-outline" size={30} color="#9ca3af" />
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

      <PotActionModal
        mode={modalMode}
        selectedPot={selectedPot}
        inputValue={inputValue}
        fieldError={fieldError}
        isSubmitting={isSubmitting}
        onChangeInput={(v) => { setInputValue(v); setFieldError('') }}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />
    </>
  )
}
