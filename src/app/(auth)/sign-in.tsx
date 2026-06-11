import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
} from 'react-native'
import { useRouter } from 'expo-router'

import { authService } from '@/api/auth.service'
import { useAuthStore } from '@/store/authStore'

export default function SignInScreen() {
  const router = useRouter()
  const signIn = useAuthStore((s) => s.signIn)

  const [name, setName]                 = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]               = useState('')

  const canSubmit = name.trim() !== '' && !isSubmitting

  async function handleContinue() {
    if (!canSubmit) return
    setIsSubmitting(true)
    setError('')

    const r = await authService.signIn(name)

    if (r.data !== null) {
      signIn(r.data)
      router.replace('/(tabs)')
    } else {
      setError(r.error)
      setIsSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 items-center justify-center bg-white dark:bg-black px-6">
      <Text className="text-4xl font-bold text-black dark:text-white mb-2">Smart Wallet</Text>
      <Text className="text-base text-gray-500 dark:text-gray-400 mb-12 text-center">
        Your money, organised.
      </Text>

      <TextInput
        value={name}
        onChangeText={(v) => { setName(v); setError('') }}
        placeholder="Your name (e.g. Alex)"
        placeholderTextColor="#9ca3af"
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={handleContinue}
        accessibilityLabel="Your name"
        className="w-full bg-gray-50 dark:bg-zinc-800 text-black dark:text-white rounded-xl px-4 py-3.5 text-base border border-gray-100 dark:border-zinc-700"
      />

      {error !== '' && (
        <Text className="w-full text-xs text-red-500 mt-2">{error}</Text>
      )}

      <Pressable
        onPress={handleContinue}
        disabled={!canSubmit}
        accessibilityRole="button"
        accessibilityLabel={isSubmitting ? 'Signing in' : 'Continue'}
        accessibilityState={{ disabled: !canSubmit }}
        className="w-full items-center justify-center bg-primary rounded-2xl py-4 px-6 mt-4 active:opacity-75 disabled:opacity-40">
        {isSubmitting
          ? <ActivityIndicator size="small" color="white" />
          : <Text className="text-base font-semibold text-white">Continue</Text>}
      </Pressable>

      <Text className="mt-6 text-xs text-gray-400 text-center">
        Demo profile — stored only on this device.
      </Text>
    </KeyboardAvoidingView>
  )
}
