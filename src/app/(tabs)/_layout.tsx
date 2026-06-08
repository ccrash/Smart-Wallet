import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

import { AppHeader } from '@/components/AppHeader';
import { useAuthStore } from '@/store/authStore';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused, color }: { name: IconName; focused: boolean; color: string }) {
  const icon: IconName = focused ? name : (`${name}-outline` as IconName);
  return <Ionicons name={icon} size={24} color={color} />;
}

export default function TabsLayout() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { colorScheme } = useColorScheme();

  if (!isHydrated) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        tabBarStyle: {
          backgroundColor: isDark ? '#09090b' : '#ffffff',
          borderTopColor: isDark ? '#27272a' : '#f3f4f6',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#208AEF',
        tabBarInactiveTintColor: isDark ? '#71717a' : '#9ca3af',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wallet',
          tabBarIcon: (p) => <TabIcon name="wallet" focused={p.focused} color={p.color} />,
        }}
      />
      <Tabs.Screen
        name="pots"
        options={{
          title: 'Pots',
          tabBarIcon: (p) => <TabIcon name="layers" focused={p.focused} color={p.color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: (p) => <TabIcon name="pricetag" focused={p.focused} color={p.color} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Rewards',
          tabBarIcon: (p) => <TabIcon name="star" focused={p.focused} color={p.color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: (p) => <TabIcon name="settings" focused={p.focused} color={p.color} />,
        }}
      />
    </Tabs>
  );
}
