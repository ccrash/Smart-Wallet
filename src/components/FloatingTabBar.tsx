import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

const TAB_ICONS: Record<string, IoniconsName> = {
  index:    'wallet',
  pots:     'layers',
  shop:     'pricetag',
  rewards:  'star',
  settings: 'settings',
}

const TAB_LABELS: Record<string, string> = {
  index:    'Wallet',
  pots:     'Pots',
  shop:     'Shop',
  rewards:  'Rewards',
  settings: 'Settings',
}

const PRIMARY = '#1C274C'

export const TAB_BAR_HEIGHT = 56
export const TAB_BAR_OFFSET = 12

export function useTabBarPadding() {
  const { bottom } = useSafeAreaInsets()
  return TAB_BAR_HEIGHT + TAB_BAR_OFFSET + bottom + 8
}

function TabItem({
  routeName,
  isFocused,
  onPress,
  onLongPress,
  isDark,
}: {
  routeName: string
  isFocused: boolean
  onPress: () => void
  onLongPress: () => void
  isDark: boolean
}) {
  const scale = useSharedValue(isFocused ? 1 : 0.85)

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0.85, { damping: 15, stiffness: 200 })
  }, [isFocused, scale])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const base = TAB_ICONS[routeName] ?? 'ellipse'
  const iconName: IoniconsName = isFocused ? base : (`${base}-outline` as IoniconsName)

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityLabel={TAB_LABELS[routeName] ?? routeName}
      accessibilityState={{ selected: isFocused }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: TAB_BAR_HEIGHT }}
    >
      <Animated.View
        style={[
          { borderRadius: 14, padding: 8 },
          isFocused && { backgroundColor: PRIMARY },
          animStyle,
        ]}
      >
        <Ionicons
          name={iconName}
          size={22}
          color={isFocused ? '#ffffff' : isDark ? '#71717a' : '#9ca3af'}
        />
      </Animated.View>
    </Pressable>
  )
}

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <View
      style={{
        position: 'absolute',
        bottom: bottom + TAB_BAR_OFFSET,
        left: 20,
        right: 20,
        height: TAB_BAR_HEIGHT,
        borderRadius: TAB_BAR_HEIGHT / 2,
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        flexDirection: 'row',
        borderWidth: isDark ? 0 : 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.4 : 0.12,
        shadowRadius: 24,
        elevation: 12,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key })
        }

        return (
          <TabItem
            key={route.key}
            routeName={route.name}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
            isDark={isDark}
          />
        )
      })}
    </View>
  )
}
