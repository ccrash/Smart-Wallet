import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'

import { authService } from '@/api/auth.service'
import { useAuthStore } from '@/store/authStore'

import SignInScreen from '../sign-in'

jest.mock('@/store/authStore', () => ({ useAuthStore: jest.fn() }))
jest.mock('@/api/auth.service', () => ({
  authService: { signIn: jest.fn() },
}))

const mockReplace = jest.fn()
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

const mockStoreSignIn = jest.fn()

const DEMO_USER = {
  id: 'u-1',
  displayName: 'Alex',
  email: 'alex@demo.smartwallet.app',
  photoURL: null,
}

// Types a value into a TextInput and waits for the controlled state to sync
async function typeInto(placeholder: string, value: string) {
  const input = await screen.findByPlaceholderText(placeholder)
  fireEvent.changeText(input, value)
  await waitFor(() => expect(screen.getByDisplayValue(value)).toBeTruthy())
}

describe('SignInScreen', () => {
  beforeAll(() => jest.useRealTimers())
  afterAll(()  => jest.useFakeTimers())
  afterEach(()  => jest.clearAllMocks())

  beforeEach(() => {
    ;(useAuthStore as unknown as jest.Mock).mockImplementation((s: (state: object) => unknown) =>
      s({ signIn: mockStoreSignIn }),
    )
  })

  it('disables Continue while the name is empty', async () => {
    await render(<SignInScreen />)
    const button = await screen.findByLabelText('Continue')
    expect(button.props.accessibilityState.disabled).toBe(true)
  })

  it('enables Continue once a name is typed', async () => {
    await render(<SignInScreen />)
    await typeInto('Your name (e.g. Alex)', 'Alex')
    expect(screen.getByLabelText('Continue').props.accessibilityState.disabled).toBe(false)
  })

  it('signs in, stores the user, and navigates to the tabs on success', async () => {
    ;(authService.signIn as jest.Mock).mockResolvedValue({ data: DEMO_USER, error: null })

    await render(<SignInScreen />)
    await typeInto('Your name (e.g. Alex)', 'Alex')
    fireEvent.press(screen.getByLabelText('Continue'))

    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalledWith('Alex')
      expect(mockStoreSignIn).toHaveBeenCalledWith(DEMO_USER)
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)')
    })
  })

  it('shows the service error inline and does not navigate on failure', async () => {
    ;(authService.signIn as jest.Mock).mockResolvedValue({
      data: null,
      error: 'Name must be 30 characters or fewer.',
    })

    await render(<SignInScreen />)
    await typeInto('Your name (e.g. Alex)', 'A very long name')
    fireEvent.press(screen.getByLabelText('Continue'))

    expect(await screen.findByText('Name must be 30 characters or fewer.')).toBeTruthy()
    expect(mockStoreSignIn).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('ignores a second press while a sign-in is in flight', async () => {
    let resolveSignIn!: (v: { data: typeof DEMO_USER; error: null }) => void
    ;(authService.signIn as jest.Mock).mockReturnValue(
      new Promise((res) => { resolveSignIn = res }),
    )

    await render(<SignInScreen />)
    await typeInto('Your name (e.g. Alex)', 'Alex')
    fireEvent.press(screen.getByLabelText('Continue'))

    expect(await screen.findByLabelText('Signing in')).toBeTruthy()
    fireEvent.press(screen.getByLabelText('Signing in'))
    expect(authService.signIn).toHaveBeenCalledTimes(1)

    resolveSignIn({ data: DEMO_USER, error: null })
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)'))
  })
})
