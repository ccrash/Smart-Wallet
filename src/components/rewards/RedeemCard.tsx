import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { generateId } from '@/api/client'
import { loyaltyService } from '@/api/loyalty.service'
import { useWalletStore } from '@/store/walletStore'

const POINTS_PER_UNIT = 100
const CREDIT_PER_UNIT = 1

export function RedeemCard() {
  const loyaltyPoints    = useWalletStore((s) => s.loyaltyPoints)
  const applyTransaction = useWalletStore((s) => s.applyTransaction)
  const setLoyaltyPoints = useWalletStore((s) => s.setLoyaltyPoints)

  const maxRedeemable = Math.floor(loyaltyPoints / POINTS_PER_UNIT) * POINTS_PER_UNIT

  const [redeemAmount, setRedeemAmount] = useState(maxRedeemable > 0 ? POINTS_PER_UNIT : 0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]               = useState('')
  const [successMsg, setSuccessMsg]     = useState('')

  const creditPreview = (redeemAmount / POINTS_PER_UNIT) * CREDIT_PER_UNIT
  const canRedeem     = redeemAmount > 0 && redeemAmount <= loyaltyPoints

  function decrement() {
    setError('')
    setSuccessMsg('')
    setRedeemAmount((prev) => Math.max(0, prev - POINTS_PER_UNIT))
  }

  function increment() {
    setError('')
    setSuccessMsg('')
    setRedeemAmount((prev) => Math.min(maxRedeemable, prev + POINTS_PER_UNIT))
  }

  async function handleRedeem() {
    if (!canRedeem || isSubmitting) return
    setIsSubmitting(true)
    setError('')
    setSuccessMsg('')

    const r = await loyaltyService.redeem(redeemAmount)

    if (r.data !== null) {
      applyTransaction({
        id: generateId(),
        date: new Date().toISOString(),
        type: 'points_redemption',
        amount: r.data.creditAmount,
        description: `Redeemed ${redeemAmount} pts for £${r.data.creditAmount.toFixed(2)} credit`,
      })
      setLoyaltyPoints(r.data.remainingPoints)
      setSuccessMsg(`£${r.data.creditAmount.toFixed(2)} added to your wallet`)
      const nextMax = Math.floor(r.data.remainingPoints / POINTS_PER_UNIT) * POINTS_PER_UNIT
      setRedeemAmount(nextMax > 0 ? POINTS_PER_UNIT : 0)
    } else {
      setError(r.error)
    }

    setIsSubmitting(false)
  }

  return (
    <View className="bg-white dark:bg-zinc-900 rounded-3xl p-5">
      <Text className="text-base font-semibold text-black dark:text-white mb-4">
        Redeem points
      </Text>

      {maxRedeemable === 0 ? (
        <View className="items-center py-4">
          <View className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center mb-3">
            <Ionicons name="star-outline" size={26} color="#f59e0b" />
          </View>
          <Text className="text-sm font-medium text-black dark:text-white">Not enough points yet</Text>
          <Text className="text-xs text-gray-400 mt-1 text-center">
            You need at least {POINTS_PER_UNIT} pts to redeem. Keep shopping!
          </Text>
        </View>
      ) : (
        <>
          <View className="flex-row items-center justify-between bg-gray-50 dark:bg-zinc-800 rounded-2xl p-3 mb-3">
            <Pressable
              onPress={decrement}
              disabled={redeemAmount <= POINTS_PER_UNIT}
              hitSlop={8}
              className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-700 items-center justify-center active:opacity-60 disabled:opacity-30">
              <Ionicons name="remove" size={20} color="#208AEF" />
            </Pressable>

            <View className="items-center">
              <Text className="text-2xl font-bold text-black dark:text-white">
                {redeemAmount}
              </Text>
              <Text className="text-xs text-gray-400">pts</Text>
            </View>

            <Pressable
              onPress={increment}
              disabled={redeemAmount >= maxRedeemable}
              hitSlop={8}
              className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-700 items-center justify-center active:opacity-60 disabled:opacity-30">
              <Ionicons name="add" size={20} color="#208AEF" />
            </Pressable>
          </View>

          <View className="flex-row items-center justify-center gap-1 mb-4">
            <Ionicons name="arrow-forward" size={14} color="#9ca3af" />
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              = <Text className="font-semibold text-black dark:text-white">£{creditPreview.toFixed(2)}</Text> wallet credit
            </Text>
          </View>

          {error !== '' && (
            <View className="flex-row items-center gap-1.5 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2.5 mb-3">
              <Ionicons name="alert-circle-outline" size={15} color="#ef4444" />
              <Text className="text-xs text-red-600 dark:text-red-400 flex-1">{error}</Text>
            </View>
          )}

          {successMsg !== '' && (
            <View className="flex-row items-center gap-1.5 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2.5 mb-3">
              <Ionicons name="checkmark-circle-outline" size={15} color="#22c55e" />
              <Text className="text-xs text-green-700 dark:text-green-400 flex-1">{successMsg}</Text>
            </View>
          )}

          <Pressable
            onPress={handleRedeem}
            disabled={!canRedeem || isSubmitting}
            className="bg-primary rounded-2xl py-4 items-center active:opacity-75 disabled:opacity-40">
            {isSubmitting
              ? <ActivityIndicator size="small" color="white" />
              : <Text className="text-base font-semibold text-white">
                  Redeem {redeemAmount} pts
                </Text>}
          </Pressable>
        </>
      )}
    </View>
  )
}
