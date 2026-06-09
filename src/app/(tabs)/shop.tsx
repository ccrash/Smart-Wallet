import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { generateId } from '@/api/client'
import { VOUCHER_CATALOG, VoucherDenomination, vouchersService } from '@/api/vouchers.service'
import { VoucherCard } from '@/components/voucher/VoucherCard'
import { VoucherConfirmModal } from '@/components/voucher/VoucherConfirmModal'
import { VoucherHistoryRow } from '@/components/voucher/VoucherHistoryRow'
import { VoucherSuccessModal } from '@/components/voucher/VoucherSuccessModal'
import { useWalletStore } from '@/store/walletStore'
import { Voucher, VoucherProduct } from '@/types'

type ModalState = null | 'confirm' | 'success'

const CATALOG_ROWS: [VoucherProduct, VoucherProduct][] = [
  [VOUCHER_CATALOG[0], VOUCHER_CATALOG[1]],
  [VOUCHER_CATALOG[2], VOUCHER_CATALOG[3]],
]

export default function ShopScreen() {
  const balance          = useWalletStore((s) => s.balance)
  const vouchers         = useWalletStore((s) => s.vouchers)
  const loyaltyPoints    = useWalletStore((s) => s.loyaltyPoints)
  const addVoucher       = useWalletStore((s) => s.addVoucher)
  const applyTransaction = useWalletStore((s) => s.applyTransaction)
  const setLoyaltyPoints = useWalletStore((s) => s.setLoyaltyPoints)

  const [selected,     setSelected]     = useState<VoucherProduct | null>(null)
  const [modalState,   setModalState]   = useState<ModalState>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error,        setError]        = useState('')
  const [lastVoucher,  setLastVoucher]  = useState<Voucher | null>(null)

  function handleSelect(product: VoucherProduct) {
    setSelected(product)
    setError('')
    setModalState('confirm')
  }

  function closeModal() {
    setModalState(null)
    setSelected(null)
    setError('')
  }

  async function handlePurchase() {
    if (!selected || isSubmitting) return
    setIsSubmitting(true)
    setError('')

    const r = await vouchersService.purchase(selected.denomination as VoucherDenomination)

    if (r.data !== null) {
      addVoucher(r.data)
      applyTransaction({
        id: generateId(),
        date: new Date().toISOString(),
        type: 'voucher_purchase',
        amount: -selected.denomination,
        description: `${selected.label} purchased`,
      })
      setLoyaltyPoints(loyaltyPoints + r.data.pointsEarned)
      setLastVoucher(r.data)
      setModalState('success')
    } else {
      setError(r.error)
    }

    setIsSubmitting(false)
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-zinc-950">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        <View className="bg-primary rounded-3xl p-6">
          <Text className="text-white/70 text-sm font-medium mb-1">Available Balance</Text>
          <Text className="text-white text-4xl font-bold">£{balance.toFixed(2)}</Text>
          <Text className="text-white/60 text-sm mt-2">
            {loyaltyPoints} pts · 1 pt per £1 spent
          </Text>
        </View>

        <View>
          <Text className="text-base font-semibold text-black dark:text-white mb-3">
            Choose a voucher
          </Text>
          <View style={{ gap: 12 }}>
            {CATALOG_ROWS.map(([a, b]) => (
              <View key={a.denomination} className="flex-row" style={{ gap: 12 }}>
                <VoucherCard
                  product={a}
                  canAfford={balance >= a.denomination}
                  onSelect={handleSelect}
                />
                <VoucherCard
                  product={b}
                  canAfford={balance >= b.denomination}
                  onSelect={handleSelect}
                />
              </View>
            ))}
          </View>
        </View>

        <View>
          <Text className="text-base font-semibold text-black dark:text-white mb-3">
            My Vouchers
          </Text>
          <View className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
            {vouchers.length === 0 ? (
              <View className="py-10 items-center">
                <View className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mb-3">
                  <Ionicons name="pricetag-outline" size={26} color="#f97316" />
                </View>
                <Text className="text-sm font-medium text-black dark:text-white">No vouchers yet</Text>
                <Text className="text-xs text-gray-400 mt-1 text-center px-6">
                  Purchase a voucher above to see your codes here.
                </Text>
              </View>
            ) : (
              vouchers.map((v, i) => (
                <VoucherHistoryRow
                  key={v.id}
                  voucher={v}
                  isLast={i === vouchers.length - 1}
                />
              ))
            )}
          </View>
        </View>

      </ScrollView>

      <VoucherConfirmModal
        visible={modalState === 'confirm'}
        product={selected}
        balance={balance}
        isSubmitting={isSubmitting}
        error={error}
        onConfirm={handlePurchase}
        onClose={closeModal}
      />

      <VoucherSuccessModal
        visible={modalState === 'success'}
        voucher={lastVoucher}
        onClose={closeModal}
      />
    </View>
  )
}
