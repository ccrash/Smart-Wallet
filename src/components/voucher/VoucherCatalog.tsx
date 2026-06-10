import { useState } from 'react'
import { Text, View } from 'react-native'

import { generateId } from '@/api/client'
import { VOUCHER_CATALOG, VoucherDenomination, vouchersService } from '@/api/vouchers.service'
import { useWalletStore } from '@/store/walletStore'
import { Voucher, VoucherProduct } from '@/types'

import { VoucherCard } from './VoucherCard'
import { VoucherConfirmModal } from './VoucherConfirmModal'
import { VoucherSuccessModal } from './VoucherSuccessModal'

type ModalState = null | 'confirm' | 'success'

const CATALOG_ROWS: [VoucherProduct, VoucherProduct][] = [
  [VOUCHER_CATALOG[0], VOUCHER_CATALOG[1]],
  [VOUCHER_CATALOG[2], VOUCHER_CATALOG[3]],
]

export function VoucherCatalog() {
  const balance          = useWalletStore((s) => s.balance)
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
    <>
      <View>
        <Text className="text-base font-semibold text-black dark:text-white mb-3">
          Choose a voucher
        </Text>
        <View style={{ gap: 12 }}>
          {CATALOG_ROWS.map(([a, b]) => (
            <View key={a.denomination} className="flex-row" style={{ gap: 12 }}>
              <VoucherCard product={a} canAfford={balance >= a.denomination} onSelect={handleSelect} />
              <VoucherCard product={b} canAfford={balance >= b.denomination} onSelect={handleSelect} />
            </View>
          ))}
        </View>
      </View>

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
    </>
  )
}
