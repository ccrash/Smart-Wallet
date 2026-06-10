import { render, screen } from '@testing-library/react-native'

import { useWalletStore } from '@/store/walletStore'

import { BalanceCard } from '../BalanceCard'

jest.mock('@/store/walletStore', () => ({ useWalletStore: jest.fn() }))

const BASE_STATE = {
  balance: 500,
  pots: [] as { id: string; name: string; balance: number; createdAt: string }[],
}

describe('BalanceCard', () => {
  beforeEach(() => {
    ;(useWalletStore as unknown as jest.Mock).mockImplementation((selector: (s: typeof BASE_STATE) => unknown) =>
      selector(BASE_STATE)
    )
  })

  afterEach(() => jest.clearAllMocks())

  it('renders the wallet balance', async () => {
    await render(<BalanceCard />)
    expect(await screen.findByText('£500.00')).toBeTruthy()
  })

  it('shows pot summary when pots have money', async () => {
    const stateWithPots = {
      ...BASE_STATE,
      pots: [{ id: 'p1', name: 'Holiday', balance: 100, createdAt: '' }],
    }
    ;(useWalletStore as unknown as jest.Mock).mockImplementation((selector: (s: typeof stateWithPots) => unknown) =>
      selector(stateWithPots)
    )
    await render(<BalanceCard />)
    expect(await screen.findByText('£100.00 in 1 pot')).toBeTruthy()
  })

  it('hides pot summary when there are no pots', async () => {
    await render(<BalanceCard />)
    await screen.findByText('£500.00') // wait for render
    expect(screen.queryByText(/in \d+ pot/)).toBeNull()
  })

  it('uses plural "pots" when there are multiple pots', async () => {
    const stateWithMultiple = {
      ...BASE_STATE,
      pots: [
        { id: 'p1', name: 'Holiday', balance: 100, createdAt: '' },
        { id: 'p2', name: 'Emergency', balance: 200, createdAt: '' },
      ],
    }
    ;(useWalletStore as unknown as jest.Mock).mockImplementation((selector: (s: typeof stateWithMultiple) => unknown) =>
      selector(stateWithMultiple)
    )
    await render(<BalanceCard />)
    expect(await screen.findByText('£300.00 in 2 pots')).toBeTruthy()
  })
})
