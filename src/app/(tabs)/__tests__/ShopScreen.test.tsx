import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'

import ShopScreen from '../shop'

jest.mock('@/store/walletStore', () => ({ useWalletStore: jest.fn() }))
jest.mock('@/api/vouchers.service', () => ({
  VOUCHER_CATALOG: [
    { denomination: 10,  label: '£10 Voucher',  description: 'Great for everyday treats', pointsEarned: 10  },
    { denomination: 25,  label: '£25 Voucher',  description: 'Perfect for a night out',   pointsEarned: 25  },
    { denomination: 50,  label: '£50 Voucher',  description: 'Treat yourself',             pointsEarned: 50  },
    { denomination: 100, label: '£100 Voucher', description: 'The big one',                pointsEarned: 100 },
  ],
  vouchersService: { purchase: jest.fn() },
}))
jest.mock('@/api/client', () => ({
  generateId: jest.fn().mockReturnValue('test-tx-id'),
}))

import { useWalletStore } from '@/store/walletStore'
import { vouchersService } from '@/api/vouchers.service'

const mockAddVoucher       = jest.fn()
const mockApplyTransaction = jest.fn()
const mockSetLoyaltyPoints = jest.fn()

const BASE_STATE = {
  balance: 500,
  vouchers: [] as { id: string; denomination: number; code: string; purchasedAt: string; pointsEarned: number }[],
  loyaltyPoints: 0,
  addVoucher: mockAddVoucher,
  applyTransaction: mockApplyTransaction,
  setLoyaltyPoints: mockSetLoyaltyPoints,
}

const MOCK_VOUCHER = {
  id: 'v-1',
  denomination: 25,
  code: 'SW-ABCD1234',
  purchasedAt: new Date('2025-01-15').toISOString(),
  pointsEarned: 25,
}

describe('ShopScreen', () => {
  beforeAll(() => jest.useRealTimers())
  afterAll(() => jest.useFakeTimers())

  beforeEach(() => {
    ;(useWalletStore as unknown as jest.Mock).mockImplementation((selector: (s: typeof BASE_STATE) => unknown) =>
      selector(BASE_STATE)
    )
    ;(vouchersService.purchase as jest.Mock).mockResolvedValue({ data: MOCK_VOUCHER, error: null })
  })

  afterEach(() => jest.clearAllMocks())

  it('shows balance and loyalty points in header', async () => {
    await render(<ShopScreen />)
    expect(await screen.findByText('£500.00')).toBeTruthy()
    expect(screen.getByText('0 pts · 1 pt per £1 spent')).toBeTruthy()
  })

  it('renders all 4 denomination cards', async () => {
    await render(<ShopScreen />)
    expect(await screen.findByText('£10')).toBeTruthy()
    expect(screen.getByText('£25')).toBeTruthy()
    expect(screen.getByText('£50')).toBeTruthy()
    expect(screen.getByText('£100')).toBeTruthy()
  })

  it('shows empty state when no vouchers purchased', async () => {
    await render(<ShopScreen />)
    expect(await screen.findByText('No vouchers yet')).toBeTruthy()
  })

  it('renders voucher history with code and points when vouchers exist', async () => {
    const stateWithVouchers = { ...BASE_STATE, vouchers: [MOCK_VOUCHER] }
    ;(useWalletStore as unknown as jest.Mock).mockImplementation((selector: (s: typeof stateWithVouchers) => unknown) =>
      selector(stateWithVouchers)
    )
    await render(<ShopScreen />)
    expect(await screen.findByText('£25 Voucher')).toBeTruthy()
    expect(screen.getByText('SW-ABCD1234')).toBeTruthy()
    expect(screen.getByText('+25 pts earned')).toBeTruthy()
  })

  it('opens confirm modal with purchase summary when a card is pressed', async () => {
    await render(<ShopScreen />)
    fireEvent.press(await screen.findByText('£25'))

    expect(await screen.findByText('Confirm purchase')).toBeTruthy()
    expect(screen.getByText('£25 Voucher')).toBeTruthy()
    expect(screen.getByText('£475.00')).toBeTruthy() // balance after = 500 - 25
    // +25 pts appears on both the catalog card and the modal — assert both are present
    expect(screen.getAllByText('+25 pts').length).toBeGreaterThanOrEqual(2)
  })

  it('does not open confirm modal when balance is insufficient', async () => {
    const brokenState = { ...BASE_STATE, balance: 5 }
    ;(useWalletStore as unknown as jest.Mock).mockImplementation((selector: (s: typeof brokenState) => unknown) =>
      selector(brokenState)
    )
    await render(<ShopScreen />)
    await screen.findByText('£5.00') // wait for render
    fireEvent.press(screen.getByText('£10'))
    expect(screen.queryByText('Confirm purchase')).toBeNull()
  })

  it('calls purchase service and updates store on confirm', async () => {
    await render(<ShopScreen />)
    fireEvent.press(await screen.findByText('£25'))
    await screen.findByText('Confirm purchase')

    fireEvent.press(screen.getByText('Buy for £25.00'))

    await waitFor(() => {
      expect(vouchersService.purchase).toHaveBeenCalledWith(25)
      expect(mockAddVoucher).toHaveBeenCalledWith(MOCK_VOUCHER)
      expect(mockApplyTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-tx-id', type: 'voucher_purchase', amount: -25 })
      )
      expect(mockSetLoyaltyPoints).toHaveBeenCalledWith(25)
    })
  })

  it('shows success modal with voucher code after purchase', async () => {
    await render(<ShopScreen />)
    fireEvent.press(await screen.findByText('£25'))
    await screen.findByText('Confirm purchase')

    fireEvent.press(screen.getByText('Buy for £25.00'))

    expect(await screen.findByText('Voucher purchased!')).toBeTruthy()
    expect(screen.getByText('SW-ABCD1234')).toBeTruthy()
    expect(screen.getByText('+25 pts added to your rewards')).toBeTruthy()
  })

  it('shows inline error when purchase fails', async () => {
    ;(vouchersService.purchase as jest.Mock).mockResolvedValue({ data: null, error: 'Insufficient balance.' })

    await render(<ShopScreen />)
    fireEvent.press(await screen.findByText('£25'))
    await screen.findByText('Confirm purchase')

    fireEvent.press(screen.getByText('Buy for £25.00'))

    expect(await screen.findByText('Insufficient balance.')).toBeTruthy()
    expect(screen.queryByText('Voucher purchased!')).toBeNull()
  })
})
