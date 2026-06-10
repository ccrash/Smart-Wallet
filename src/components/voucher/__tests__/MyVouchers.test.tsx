import { render, screen } from '@testing-library/react-native'

import { useWalletStore } from '@/store/walletStore'

import { MyVouchers } from '../MyVouchers'

jest.mock('@/store/walletStore', () => ({ useWalletStore: jest.fn() }))

const BASE_STATE = {
  vouchers: [] as { id: string; denomination: number; code: string; purchasedAt: string; pointsEarned: number }[],
}

const MOCK_VOUCHER = {
  id: 'v-1',
  denomination: 25,
  code: 'SW-ABCD1234',
  purchasedAt: new Date('2025-01-15').toISOString(),
  pointsEarned: 25,
}

describe('MyVouchers', () => {
  beforeEach(() => {
    ;(useWalletStore as unknown as jest.Mock).mockImplementation((selector: (s: typeof BASE_STATE) => unknown) =>
      selector(BASE_STATE)
    )
  })

  afterEach(() => jest.clearAllMocks())

  it('shows empty state when no vouchers purchased', async () => {
    await render(<MyVouchers />)
    expect(await screen.findByText('No vouchers yet')).toBeTruthy()
  })

  it('renders voucher history with code and points when vouchers exist', async () => {
    const stateWithVouchers = { ...BASE_STATE, vouchers: [MOCK_VOUCHER] }
    ;(useWalletStore as unknown as jest.Mock).mockImplementation((selector: (s: typeof stateWithVouchers) => unknown) =>
      selector(stateWithVouchers)
    )
    await render(<MyVouchers />)
    expect(await screen.findByText('£25 Voucher')).toBeTruthy()
    expect(screen.getByText('SW-ABCD1234')).toBeTruthy()
    expect(screen.getByText('+25 pts earned')).toBeTruthy()
  })
})
