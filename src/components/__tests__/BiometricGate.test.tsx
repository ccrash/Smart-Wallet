import { Alert, AppState, Text } from 'react-native'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'

import * as LocalAuthentication from 'expo-local-authentication'

import { useAuthStore } from '@/store/authStore'
import { useSecurityStore } from '@/store/securityStore'

import { BiometricGate } from '../BiometricGate'

jest.mock('@/store/authStore',     () => ({ useAuthStore:     jest.fn() }))
jest.mock('@/store/securityStore', () => ({ useSecurityStore: jest.fn() }))
jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(),
}))

const mockSignOut             = jest.fn()
const mockSetBiometricEnabled = jest.fn()

function withSecurity(biometricLockEnabled: boolean, isHydrated = true) {
  ;(useSecurityStore as unknown as jest.Mock).mockImplementation((s: (state: object) => unknown) =>
    s({
      biometricLockEnabled,
      isHydrated,
      setBiometricLockEnabled: mockSetBiometricEnabled,
    }),
  )
}

function lastAppStateHandler(spy: jest.SpyInstance): (state: string) => void {
  return spy.mock.calls[spy.mock.calls.length - 1][1]
}

describe('BiometricGate', () => {
  beforeAll(() => jest.useRealTimers())
  afterAll(()  => jest.useFakeTimers())
  afterEach(()  => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  beforeEach(() => {
    ;(useAuthStore as unknown as jest.Mock).mockImplementation((s: (state: object) => unknown) =>
      s({ signOut: mockSignOut }),
    )
    withSecurity(false)
  })

  it('renders children directly when the lock is disabled', async () => {
    await render(
      <BiometricGate>
        <Text>app content</Text>
      </BiometricGate>,
    )
    expect(await screen.findByText('app content')).toBeTruthy()
    expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled()
  })

  it('renders nothing until the security store has hydrated', async () => {
    withSecurity(true, false)
    await render(
      <BiometricGate>
        <Text>app content</Text>
      </BiometricGate>,
    )
    expect(screen.queryByText('app content')).toBeNull()
    expect(screen.queryByText('Smart Wallet locked')).toBeNull()
  })

  it('prompts automatically and unlocks on success', async () => {
    withSecurity(true)
    ;(LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true })

    await render(
      <BiometricGate>
        <Text>app content</Text>
      </BiometricGate>,
    )

    await waitFor(() => {
      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ promptMessage: 'Unlock Smart Wallet' }),
      )
    })
    expect(await screen.findByText('app content')).toBeTruthy()
  })

  it('stays locked when authentication fails, and Unlock retries', async () => {
    withSecurity(true)
    ;(LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
      success: false,
      error: 'user_cancel',
    })

    await render(
      <BiometricGate>
        <Text>app content</Text>
      </BiometricGate>,
    )

    expect(await screen.findByText('Smart Wallet locked')).toBeTruthy()
    expect(screen.queryByText('app content')).toBeNull()

    ;(LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true })
    fireEvent.press(screen.getByLabelText('Unlock'))

    expect(await screen.findByText('app content')).toBeTruthy()
  })

  it('sign out from the lock screen requires confirmation, then drops the session and disables the lock', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    withSecurity(true)
    ;(LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
      success: false,
      error: 'user_cancel',
    })

    await render(
      <BiometricGate>
        <Text>app content</Text>
      </BiometricGate>,
    )

    fireEvent.press(await screen.findByLabelText('Sign out'))

    // Nothing happens until the alert is confirmed
    expect(mockSignOut).not.toHaveBeenCalled()

    const [, , buttons] = alertSpy.mock.calls[0] as [
      string, string, { style?: string; onPress?: () => void }[],
    ]
    act(() => { buttons.find((b) => b.style === 'destructive')?.onPress?.() })

    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(mockSetBiometricEnabled).toHaveBeenCalledWith(false)
    expect(await screen.findByText('app content')).toBeTruthy()
  })

  it('re-locks when the app is backgrounded and prompts again on resume', async () => {
    const appStateSpy = jest.spyOn(AppState, 'addEventListener')
    withSecurity(true)
    ;(LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true })

    await render(
      <BiometricGate>
        <Text>app content</Text>
      </BiometricGate>,
    )
    expect(await screen.findByText('app content')).toBeTruthy()
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(1)

    const handler = lastAppStateHandler(appStateSpy)

    // Background → re-lock; the prompt must NOT fire while not visible
    await act(async () => handler('background'))
    expect(screen.queryByText('app content')).toBeNull()
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(1)

    // Resume → prompt fires again and unlocks
    await act(async () => handler('active'))
    await waitFor(() => expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(2))
    expect(await screen.findByText('app content')).toBeTruthy()
  })
})
