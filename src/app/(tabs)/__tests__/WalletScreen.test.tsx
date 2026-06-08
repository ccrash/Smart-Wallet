import { fireEvent, render, screen } from '@testing-library/react-native'

import WalletScreen from '../index'

jest.mock('@/store/walletStore', () => ({ useWalletStore: jest.fn() }))
jest.mock('@/api/wallet.service', () => ({
  walletService: { getTransactions: jest.fn() },
}))

import { useWalletStore } from '@/store/walletStore'
import { walletService } from '@/api/wallet.service'

const mockGetTransactions = walletService.getTransactions as jest.Mock

const MOCK_TX = {
  id: 'tx-1',
  date: new Date('2025-01-15').toISOString(),
  description: 'Welcome bonus',
  amount: 500,
  type: 'seed' as const,
  runningBalance: 500,
}

const BASE_STATE = {
  balance: 500,
  pots: [],
  transactions: [],
}

describe('WalletScreen', () => {
  beforeAll(() => jest.useRealTimers())
  afterAll(() => jest.useFakeTimers())

  beforeEach(() => {
    ;(useWalletStore as jest.Mock).mockImplementation((selector: (s: typeof BASE_STATE) => unknown) =>
      selector(BASE_STATE)
    )
    mockGetTransactions.mockResolvedValue({
      data: { items: [], hasMore: false },
      error: null,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the wallet balance', async () => {
    await render(<WalletScreen />)
    expect(await screen.findByText('£500.00')).toBeTruthy()
  })

  it('shows pot summary when pots have money', async () => {
    const stateWithPots = {
      ...BASE_STATE,
      pots: [{ id: 'p1', name: 'Holiday', balance: 100, createdAt: '' }],
    }
    ;(useWalletStore as jest.Mock).mockImplementation((selector: (s: typeof stateWithPots) => unknown) =>
      selector(stateWithPots)
    )
    await render(<WalletScreen />)
    expect(await screen.findByText('£100.00 in 1 pot')).toBeTruthy()
  })

  it('hides pot summary when there are no pots', async () => {
    await render(<WalletScreen />)
    await screen.findByText('£500.00') // wait for load
    expect(screen.queryByText(/in \d+ pot/)).toBeNull()
  })

  it('shows empty state when there are no transactions', async () => {
    await render(<WalletScreen />)
    expect(await screen.findByText('No transactions yet')).toBeTruthy()
  })

  it('renders transaction description, signed amount, and running balance', async () => {
    mockGetTransactions.mockResolvedValue({
      data: { items: [MOCK_TX], hasMore: false },
      error: null,
    })
    await render(<WalletScreen />)
    expect(await screen.findByText('Welcome bonus')).toBeTruthy()
    expect(screen.getByText('+£500.00')).toBeTruthy()
    expect(screen.getByText('£500.00 bal')).toBeTruthy()
  })

  it('shows Load more button when hasMore is true', async () => {
    mockGetTransactions.mockResolvedValue({
      data: { items: [MOCK_TX], hasMore: true },
      error: null,
    })
    await render(<WalletScreen />)
    expect(await screen.findByText('Load more')).toBeTruthy()
  })

  it('fetches next page when Load more is pressed', async () => {
    mockGetTransactions.mockResolvedValue({
      data: { items: [MOCK_TX], hasMore: true },
      error: null,
    })
    await render(<WalletScreen />)
    const loadMore = await screen.findByText('Load more')

    fireEvent.press(loadMore)
    await screen.findByText('Welcome bonus') // wait for re-render

    expect(mockGetTransactions).toHaveBeenCalledWith(1)
  })
})
