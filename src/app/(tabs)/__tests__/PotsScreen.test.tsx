import { fireEvent, render, screen } from '@testing-library/react-native'

import PotsScreen from '../pots'

jest.mock('@/store/walletStore', () => ({ useWalletStore: jest.fn() }))
jest.mock('@/api/pots.service', () => ({
  potsService: {
    list: jest.fn(),
    create: jest.fn(),
    deposit: jest.fn(),
    withdraw: jest.fn(),
    remove: jest.fn(),
  },
}))
jest.mock('@/api/client', () => ({
  generateId: jest.fn().mockReturnValue('test-tx-id'),
}))

import { useWalletStore } from '@/store/walletStore'
import { potsService } from '@/api/pots.service'

const mockAddPot = jest.fn()
const mockUpdatePotBalance = jest.fn()
const mockRemovePot = jest.fn()
const mockApplyTransaction = jest.fn()

const BASE_STATE = {
  pots: [] as { id: string; name: string; balance: number; createdAt: string }[],
  addPot: mockAddPot,
  updatePotBalance: mockUpdatePotBalance,
  removePot: mockRemovePot,
  applyTransaction: mockApplyTransaction,
}

const HOLIDAY_POT = { id: 'pot-1', name: 'Holiday', balance: 75, createdAt: '' }

describe('PotsScreen', () => {
  beforeAll(() => jest.useRealTimers())
  afterAll(() => jest.useFakeTimers())

  beforeEach(() => {
    ;(useWalletStore as jest.Mock).mockImplementation((selector: (s: typeof BASE_STATE) => unknown) =>
      selector(BASE_STATE)
    )
    ;(potsService.list as jest.Mock).mockResolvedValue({ data: [], error: null })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('shows empty state after loading with no pots', async () => {
    await render(<PotsScreen />)
    expect(await screen.findByText('No pots yet')).toBeTruthy()
  })

  it('renders pot card with name and balance', async () => {
    const stateWithPot = { ...BASE_STATE, pots: [HOLIDAY_POT] }
    ;(useWalletStore as jest.Mock).mockImplementation((selector: (s: typeof stateWithPot) => unknown) =>
      selector(stateWithPot)
    )
    await render(<PotsScreen />)
    expect(await screen.findByText('Holiday')).toBeTruthy()
    expect(screen.getByText('£75.00')).toBeTruthy()
  })

  it('opens create modal when New pot is pressed', async () => {
    await render(<PotsScreen />)
    await screen.findByText('No pots yet') // wait for load
    fireEvent.press(screen.getByText('New pot'))
    expect(await screen.findByPlaceholderText('Pot name (e.g. Holiday)')).toBeTruthy()
  })

  it('opens deposit modal when Add is pressed on a pot', async () => {
    const stateWithPot = { ...BASE_STATE, pots: [HOLIDAY_POT] }
    ;(useWalletStore as jest.Mock).mockImplementation((selector: (s: typeof stateWithPot) => unknown) =>
      selector(stateWithPot)
    )
    await render(<PotsScreen />)
    await screen.findByText('Holiday')

    fireEvent.press(screen.getByText('Add'))
    expect(await screen.findByPlaceholderText('Amount (e.g. 50.00)')).toBeTruthy()
  })
})
