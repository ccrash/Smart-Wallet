import { render, screen } from '@testing-library/react-native'

jest.mock('@/store/walletStore', () => ({ useWalletStore: jest.fn() }))

import { useWalletStore } from '@/store/walletStore'

import { ShopBalanceCard } from '../ShopBalanceCard'

const BASE_STATE = {
  balance: 500,
  loyaltyPoints: 0,
}

describe('ShopBalanceCard', () => {
  beforeEach(() => {
    ;(useWalletStore as unknown as jest.Mock).mockImplementation((selector: (s: typeof BASE_STATE) => unknown) =>
      selector(BASE_STATE)
    )
  })

  afterEach(() => jest.clearAllMocks())

  it('shows balance and loyalty points', async () => {
    await render(<ShopBalanceCard />)
    expect(await screen.findByText('£500.00')).toBeTruthy()
    expect(screen.getByText('0 pts · 1 pt per £1 spent')).toBeTruthy()
  })
})
