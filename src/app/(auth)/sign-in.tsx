import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'

import { useAuthStore } from '@/store/authStore'

export default function SignInScreen() {
  const router = useRouter()
  const signIn = useAuthStore((s) => s.signIn)

  function handleMockSignIn() {
    signIn({
      id: 'mock-user-001',
      displayName: 'Alex Johnson',
      email: 'alex@example.com',
      photoURL: null,
    })
    router.replace('/(tabs)')
  }

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black px-6">
      <Text className="text-4xl font-bold text-black dark:text-white mb-2">Smart Wallet</Text>
      <Text className="text-base text-gray-500 dark:text-gray-400 mb-12 text-center">
        Your money, organised.
      </Text>

      <Pressable
        onPress={handleMockSignIn}
        className="w-full items-center justify-center bg-primary rounded-2xl py-4 px-6 active:opacity-75">
        <Text className="text-base font-semibold text-white">Sign in with Google</Text>
      </Pressable>

      <Text className="mt-6 text-xs text-gray-400 text-center">
        Real OAuth coming soon
      </Text>
    </View>
  )
}
