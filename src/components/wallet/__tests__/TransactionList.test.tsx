import { fireEvent, render, screen } from '@testing-library/react-native'

import { useWalletStore } from '@/store/walletStore'
import { walletService } from '@/api/wallet.service'

import { TransactionList } from '../TransactionList'

jest.mock('@/store/walletStore', () => ({ useWalletStore: jest.fn() }))
jest.mock('@/api/wallet.service', () => ({
  walletService: { getTransactions: jest.fn() },
}))

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
  transactions: [],
}

describe('TransactionList', () => {
  beforeAll(() => jest.useRealTimers())
  afterAll(() => jest.useFakeTimers())

  beforeEach(() => {
    ;(useWalletStore as unknown as jest.Mock).mockImplementation((selector: (s: typeof BASE_STATE) => unknown) =>
      selector(BASE_STATE)
    )
    mockGetTransactions.mockResolvedValue({
      data: { items: [], hasMore: false },
      error: null,
    })
  })

  afterEach(() => jest.clearAllMocks())

  it('shows empty state when there are no transactions', async () => {
    await render(<TransactionList />)
    expect(await screen.findByText('No transactions yet')).toBeTruthy()
  })

  it('renders transaction description, signed amount, and running balance', async () => {
    mockGetTransactions.mockResolvedValue({
      data: { items: [MOCK_TX], hasMore: false },
      error: null,
    })
    await render(<TransactionList />)
    expect(await screen.findByText('Welcome bonus')).toBeTruthy()
    expect(screen.getByText('+£500.00')).toBeTruthy()
    expect(screen.getByText('£500.00 bal')).toBeTruthy()
  })

  it('shows Load more button when hasMore is true', async () => {
    mockGetTransactions.mockResolvedValue({
      data: { items: [MOCK_TX], hasMore: true },
      error: null,
    })
    await render(<TransactionList />)
    expect(await screen.findByText('Load more')).toBeTruthy()
  })

  it('fetches next page when Load more is pressed', async () => {
    const PAGE_1_TX = { ...MOCK_TX, id: 'tx-2' }
    mockGetTransactions
      .mockResolvedValueOnce({ data: { items: [MOCK_TX],   hasMore: true  }, error: null })
      .mockResolvedValueOnce({ data: { items: [PAGE_1_TX], hasMore: false }, error: null })

    await render(<TransactionList />)
    const loadMore = await screen.findByText('Load more')

    fireEvent.press(loadMore)
    await screen.findByText('Welcome bonus')

    expect(mockGetTransactions).toHaveBeenCalledWith(1)
  })

  it('shows loading spinner while loading more results', async () => {
    // First page resolves normally; second page is a never-resolving promise
    // so we can observe the intermediate isLoadingMore state.
    let resolveSecondPage!: () => void
    const secondPagePending = new Promise<void>((res) => { resolveSecondPage = res })

    mockGetTransactions
      .mockResolvedValueOnce({ data: { items: [MOCK_TX], hasMore: true }, error: null })
      .mockReturnValueOnce(secondPagePending.then(() => ({ data: { items: [], hasMore: false }, error: null })))

    await render(<TransactionList />)
    fireEvent.press(await screen.findByText('Load more'))

    // While second page is pending the spinner should be visible
    expect(await screen.findByTestId('loading-more')).toBeTruthy()

    resolveSecondPage()
  })
})
