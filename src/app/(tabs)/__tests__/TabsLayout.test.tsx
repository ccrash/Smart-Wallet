import { render } from '@testing-library/react-native'
import { Redirect, Tabs } from 'expo-router'

import { useAuthStore } from '@/store/authStore'

import TabsLayout from '../_layout'

jest.mock('@/store/authStore', () => ({ useAuthStore: jest.fn() }))
jest.mock('nativewind', () => ({ useColorScheme: jest.fn(() => ({ colorScheme: 'light' })) }))
jest.mock('@/components/AppHeader', () => ({ AppHeader: () => null }))

// jest.mock factories are hoisted above imports. Using React.createElement(View, ...)
// inside the factory triggers NativeWind's Babel plugin to inject _ReactNativeCSSInterop
// as a top-level variable, which isn't in scope at hoist-time. Use jest.fn(() => null)
// instead — Redirect / Tabs call counts are checked directly via mock.calls.
jest.mock('expo-router', () => ({
  Redirect: jest.fn(() => null),
  Tabs: Object.assign(jest.fn(() => null), { Screen: jest.fn(() => null) }),
}))

const MockRedirect = Redirect as unknown as jest.Mock
const MockTabs    = Tabs    as unknown as jest.Mock

function mockAuth(isAuthenticated: boolean, isHydrated: boolean) {
  // _layout.tsx calls useAuthStore() without a selector
  ;(useAuthStore as unknown as jest.Mock).mockReturnValue({ isAuthenticated, isHydrated })
}

describe('TabsLayout auth guard', () => {
  beforeAll(() => jest.useRealTimers())
  afterAll(()  => jest.useFakeTimers())
  beforeEach(() => jest.clearAllMocks())

  it('renders nothing while the store is not yet hydrated', async () => {
    mockAuth(false, false)
    await render(<TabsLayout />)
    expect(MockRedirect).not.toHaveBeenCalled()
    expect(MockTabs).not.toHaveBeenCalled()
  })

  it('renders nothing while hydrating even if technically authenticated', async () => {
    mockAuth(true, false)
    await render(<TabsLayout />)
    expect(MockRedirect).not.toHaveBeenCalled()
    expect(MockTabs).not.toHaveBeenCalled()
  })

  it('renders Redirect to sign-in when hydrated but not authenticated', async () => {
    mockAuth(false, true)
    await render(<TabsLayout />)
    expect(MockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: '/(auth)/sign-in' }),
      undefined,
    )
    expect(MockTabs).not.toHaveBeenCalled()
  })

  it('renders Tabs when hydrated and authenticated', async () => {
    mockAuth(true, true)
    await render(<TabsLayout />)
    expect(MockTabs).toHaveBeenCalled()
    expect(MockRedirect).not.toHaveBeenCalled()
  })
})
