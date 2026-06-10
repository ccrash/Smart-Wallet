import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import { walletService } from '@/api/wallet.service'
import { useWalletStore } from '@/store/walletStore'
import { Transaction } from '@/types'

import { TransactionRow } from './TransactionRow'

export function TransactionList() {
  const txCount = useWalletStore((s) => s.transactions.length)

  const [txList, setTxList] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(0)

  const loadPage = useCallback(async (p: number) => {
    if (p === 0) setIsLoading(true)
    else setIsLoadingMore(true)

    const result = await walletService.getTransactions(p)

    if (result.data !== null) {
      if (p === 0) setTxList(result.data.items)
      else setTxList((prev) => [...prev, ...result.data!.items])
      setHasMore(result.data.hasMore)
      setPage(p)
    }

    if (p === 0) setIsLoading(false)
    else setIsLoadingMore(false)
  }, [])

  useEffect(() => {
    loadPage(0)
  }, [txCount, loadPage])

  return (
    <View className="bg-white dark:bg-zinc-900 rounded-2xl p-4">
      <Text className="text-base font-semibold text-black dark:text-white mb-3">
        Recent Transactions
      </Text>

      {isLoading ? (
        <View className="py-8 items-center justify-center">
          <ActivityIndicator size="small" color="#208AEF" />
        </View>
      ) : txList.length === 0 ? (
        <View className="py-8 items-center">
          <Text className="text-sm text-gray-400">No transactions yet</Text>
          <Text className="text-xs text-gray-300 dark:text-zinc-600 mt-1">
            Your activity will appear here.
          </Text>
        </View>
      ) : (
        <>
          {txList.map((tx, i) => (
            <TransactionRow key={tx.id} tx={tx} isLast={i === txList.length - 1} />
          ))}

          {hasMore && (
            <Pressable
              onPress={() => loadPage(page + 1)}
              disabled={isLoadingMore}
              className="mt-3 py-3 items-center active:opacity-60">
              {isLoadingMore ? (
                <ActivityIndicator size="small" color="#208AEF" />
              ) : (
                <Text className="text-sm text-primary font-medium">Load more</Text>
              )}
            </Pressable>
          )}
        </>
      )}
    </View>
  )
}
