import { View, Text, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

export function AppHeader() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { setPreference } = useThemeStore();
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === 'dark';

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800">
      <View className="flex-row items-center justify-between px-4 pb-3 pt-2">

        <View className="flex-row items-center gap-3">
          <View className="w-9 h-9 rounded-full bg-primary items-center justify-center">
            <Text className="text-white font-bold text-sm">{initials}</Text>
          </View>
          <View>
            <Text className="text-xs text-gray-400 dark:text-gray-500">Welcome back</Text>
            <Text className="text-sm font-semibold text-black dark:text-white">
              {user?.displayName ?? 'Guest'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <Text className="text-base">{isDark ? '🌙' : '☀️'}</Text>
          <Switch
            value={isDark}
            onValueChange={(val) => setPreference(val ? 'dark' : 'light')}
            trackColor={{ false: '#E5E7EB', true: '#208AEF' }}
            thumbColor="#ffffff"
          />
        </View>

      </View>
    </View>
  );
}
