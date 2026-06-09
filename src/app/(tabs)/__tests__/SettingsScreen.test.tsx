import { Alert } from 'react-native'
import { fireEvent, render, screen } from '@testing-library/react-native'

import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useWalletStore } from '@/store/walletStore'

import SettingsScreen from '../settings'

jest.mock('@/store/authStore',  () => ({ useAuthStore:  jest.fn() }))
jest.mock('@/store/themeStore', () => ({ useThemeStore: jest.fn() }))
jest.mock('@/store/walletStore',() => ({ useWalletStore:jest.fn() }))

const MOCK_USER = { id: 'u1', displayName: 'Alex Johnson', email: 'alex@example.com', photoURL: null }

const mockSignOut       = jest.fn()
const mockReset         = jest.fn()
const mockSeed          = jest.fn()
const mockSetPreference = jest.fn()

describe('SettingsScreen', () => {
  beforeAll(() => jest.useRealTimers())
  afterAll(()  => jest.useFakeTimers())
  afterEach(()  => jest.clearAllMocks())

  beforeEach(() => {
    ;(useThemeStore as unknown as jest.Mock).mockReturnValue({
      preference: 'light',
      setPreference: mockSetPreference,
    })
    ;(useAuthStore as unknown as jest.Mock).mockImplementation((s: (state: object) => unknown) =>
      s({ user: MOCK_USER, signOut: mockSignOut }),
    )
    ;(useWalletStore as unknown as jest.Mock).mockImplementation((s: (state: object) => unknown) =>
      s({ reset: mockReset, seed: mockSeed }),
    )
  })

  // ─── Profile ─────────────────────────────────────────────────────────────────

  it('displays the user display name and email', async () => {
    await render(<SettingsScreen />)
    expect(await screen.findByText('Alex Johnson')).toBeTruthy()
    expect(screen.getByText('alex@example.com')).toBeTruthy()
  })

  it('derives two-letter initials from the display name', async () => {
    await render(<SettingsScreen />)
    expect(await screen.findByText('AJ')).toBeTruthy()
  })

  it('shows ? when no user is signed in', async () => {
    ;(useAuthStore as unknown as jest.Mock).mockImplementation((s: (state: object) => unknown) =>
      s({ user: null, signOut: mockSignOut }),
    )
    await render(<SettingsScreen />)
    expect(await screen.findByText('?')).toBeTruthy()
  })

  // ─── Appearance ───────────────────────────────────────────────────────────────

  it('renders all three theme options', async () => {
    await render(<SettingsScreen />)
    expect(await screen.findByText('Light')).toBeTruthy()
    expect(screen.getByText('Dark')).toBeTruthy()
    expect(screen.getByText('System')).toBeTruthy()
  })

  it('calls setPreference when a theme option is pressed', async () => {
    await render(<SettingsScreen />)
    fireEvent.press(await screen.findByText('Dark'))
    expect(mockSetPreference).toHaveBeenCalledWith('dark')
  })

  // ─── Reset wallet data ────────────────────────────────────────────────────────

  it('shows a confirmation alert when Reset wallet data is pressed', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    await render(<SettingsScreen />)

    fireEvent.press(await screen.findByText('Reset wallet data'))
    expect(alertSpy).toHaveBeenCalledWith('Reset wallet data', expect.any(String), expect.any(Array))
  })

  it('calls reset() then seed() when the destructive button is confirmed', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    await render(<SettingsScreen />)

    fireEvent.press(await screen.findByText('Reset wallet data'))

    const [, , buttons] = alertSpy.mock.calls[0] as [
      string, string, { style?: string; onPress?: () => void }[],
    ]
    buttons.find((b) => b.style === 'destructive')?.onPress?.()

    expect(mockReset).toHaveBeenCalledTimes(1)
    expect(mockSeed).toHaveBeenCalledTimes(1)
    expect(mockReset.mock.invocationCallOrder[0]).toBeLessThan(mockSeed.mock.invocationCallOrder[0])
  })

  it('does not call reset or seed when the alert is cancelled', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    await render(<SettingsScreen />)

    fireEvent.press(await screen.findByText('Reset wallet data'))

    const [, , buttons] = alertSpy.mock.calls[0] as [
      string, string, { style?: string; onPress?: () => void }[],
    ]
    buttons.find((b) => b.style === 'cancel')?.onPress?.()

    expect(mockReset).not.toHaveBeenCalled()
    expect(mockSeed).not.toHaveBeenCalled()
  })

  // ─── Sign out ─────────────────────────────────────────────────────────────────

  it('shows a confirmation alert when Sign out is pressed', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    await render(<SettingsScreen />)

    fireEvent.press(await screen.findByText('Sign out'))
    expect(alertSpy).toHaveBeenCalledWith('Sign out', expect.any(String), expect.any(Array))
  })

  it('calls signOut when the destructive button is confirmed', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    await render(<SettingsScreen />)

    fireEvent.press(await screen.findByText('Sign out'))

    const [, , buttons] = alertSpy.mock.calls[0] as [
      string, string, { style?: string; onPress?: () => void }[],
    ]
    buttons.find((b) => b.style === 'destructive')?.onPress?.()
    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  it('does not call signOut when the alert is cancelled', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    await render(<SettingsScreen />)

    fireEvent.press(await screen.findByText('Sign out'))

    const [, , buttons] = alertSpy.mock.calls[0] as [
      string, string, { style?: string; onPress?: () => void }[],
    ]
    buttons.find((b) => b.style === 'cancel')?.onPress?.()
    expect(mockSignOut).not.toHaveBeenCalled()
  })
})
