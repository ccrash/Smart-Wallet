import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  AppState,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import * as LocalAuthentication from 'expo-local-authentication'

import { useAuthStore } from '@/store/authStore'
import { useSecurityStore } from '@/store/securityStore'

export function BiometricGate({ children }: { children: React.ReactNode }) {
  const enabled    = useSecurityStore((s) => s.biometricLockEnabled)
  const isHydrated = useSecurityStore((s) => s.isHydrated)
  const setEnabled = useSecurityStore((s) => s.setBiometricLockEnabled)
  const signOut    = useAuthStore((s) => s.signOut)

  const [unlocked, setUnlocked]                 = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  // 'unknown' (iOS cold start) and 'inactive' (app switcher) still count as
  // visible — only an explicit background transition should defer the prompt.
  const [appActive, setAppActive]               = useState(AppState.currentState !== 'background')
  const authBusy = useRef(false)

  const locked = isHydrated && enabled && !unlocked

  // Re-lock when the app is backgrounded; track foreground so the prompt
  // only fires while the app is actually visible.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      setAppActive(next !== 'background')
      if (next === 'background') setUnlocked(false)
    })
    return () => sub.remove()
  }, [])

  const tryUnlock = useCallback(async () => {
    if (authBusy.current) return
    authBusy.current = true
    setIsAuthenticating(true)
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Smart Wallet',
        cancelLabel: 'Cancel',
      })
      if (result.success) setUnlocked(true)
    } finally {
      authBusy.current = false
      setIsAuthenticating(false)
    }
  }, [])

  useEffect(() => {
    if (locked && appActive) tryUnlock()
  }, [locked, appActive, tryUnlock])

  function handleSignOut() {
    // Escape hatch so failing biometrics can never dead-end the user, but
    // confirmed first — it drops the session and disables the lock.
    Alert.alert('Sign out', 'Signing out will also disable the app lock. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          signOut()
          setEnabled(false)
          setUnlocked(true)
        },
      },
    ])
  }

  if (Platform.OS === 'web') return <>{children}</>
  if (!isHydrated) return null

  // The app (and the navigator) stays mounted underneath; the lock is an
  // opaque overlay. Unmounting the router here would reset navigation state
  // on every lock/unlock cycle.
  return (
    <View className="flex-1">
      {children}
      {locked && (
        <View
          accessibilityViewIsModal
          style={StyleSheet.absoluteFillObject}
          className="items-center justify-center bg-white dark:bg-black px-6">
          <View className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-4">
            <Ionicons name="lock-closed" size={28} color="#1C274C" />
          </View>
          <Text className="text-xl font-bold text-black dark:text-white">Smart Wallet locked</Text>
          <Text className="text-sm text-gray-400 mt-1 mb-8 text-center">
            Authenticate to access your wallet.
          </Text>

          <Pressable
            onPress={tryUnlock}
            disabled={isAuthenticating}
            accessibilityRole="button"
            accessibilityLabel={isAuthenticating ? 'Authenticating' : 'Unlock'}
            accessibilityState={{ disabled: isAuthenticating }}
            className="w-full items-center justify-center bg-primary rounded-2xl py-4 px-6 active:opacity-75 disabled:opacity-40">
            {isAuthenticating
              ? <ActivityIndicator size="small" color="white" />
              : <Text className="text-base font-semibold text-white">Unlock</Text>}
          </Pressable>

          <Pressable
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            className="mt-4 py-2 active:opacity-50">
            <Text className="text-sm font-medium text-red-500">Sign out</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
