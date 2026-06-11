import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'

import { loyaltyService } from '@/api/loyalty.service'
import { useWalletStore } from '@/store/walletStore'

import { RedeemCard } from '../RedeemCard'

jest.mock('@/store/walletStore', () => ({ useWalletStore: jest.fn() }))
jest.mock('@/api/loyalty.service', () => ({
  loyaltyService: { redeem: jest.fn() },
}))
jest.mock('@/api/client', () => ({
  generateId: jest.fn().mockReturnValue('test-tx-id'),
}))

const mockApplyTransaction = jest.fn()
const mockSetLoyaltyPoints = jest.fn()

function withPoints(loyaltyPoints: number) {
  const state = { loyaltyPoints, applyTransaction: mockApplyTransaction, setLoyaltyPoints: mockSetLoyaltyPoints }
  ;(useWalletStore as unknown as jest.Mock).mockImplementation(
    (selector: (s: typeof state) => unknown) => selector(state),
  )
}

describe('RedeemCard', () => {
  beforeAll(() => jest.useRealTimers())
  afterAll(() => jest.useFakeTimers())
  afterEach(() => jest.clearAllMocks())

  // ── Not-enough-points state ───────────────────────────────────────────────────

  it('shows empty state when points are 0', async () => {
    withPoints(0)
    await render(<RedeemCard />)
    expect(await screen.findByText('Not enough points yet')).toBeTruthy()
  })

  it('shows empty state when points are 99 (below the 100-pt minimum)', async () => {
    withPoints(99)
    await render(<RedeemCard />)
    expect(await screen.findByText('Not enough points yet')).toBeTruthy()
  })

  // ── Redeemer UI initial state ─────────────────────────────────────────────────

  it('shows 100 pts as initial amount and £1.00 credit preview when points = 100', async () => {
    withPoints(100)
    await render(<RedeemCard />)
    expect(await screen.findByLabelText('Redeem 100 points for £1.00')).toBeTruthy()
    expect(screen.getByText('£1.00')).toBeTruthy()
  })

  it('disables both stepper buttons when only one unit is available (100 pts)', async () => {
    withPoints(100)
    await render(<RedeemCard />)
    await screen.findByLabelText('Redeem 100 points for £1.00')

    expect(screen.getByLabelText('Decrease redemption amount').props.accessibilityState.disabled).toBe(true)
    expect(screen.getByLabelText('Increase redemption amount').props.accessibilityState.disabled).toBe(true)
  })

  // ── Stepper interactions ──────────────────────────────────────────────────────

  it('increment steps up by 100 pts and decrement steps back down', async () => {
    withPoints(250) // maxRedeemable = 200, initial = 100
    await render(<RedeemCard />)
    await screen.findByLabelText('Redeem 100 points for £1.00')

    fireEvent.press(screen.getByLabelText('Increase redemption amount'))
    expect(await screen.findByLabelText('Redeem 200 points for £2.00')).toBeTruthy()

    fireEvent.press(screen.getByLabelText('Decrease redemption amount'))
    expect(await screen.findByLabelText('Redeem 100 points for £1.00')).toBeTruthy()
  })

  it('increment is disabled at the maximum redeemable amount', async () => {
    withPoints(250)
    await render(<RedeemCard />)
    await screen.findByLabelText('Redeem 100 points for £1.00')

    fireEvent.press(screen.getByLabelText('Increase redemption amount'))
    await screen.findByLabelText('Redeem 200 points for £2.00')

    expect(screen.getByLabelText('Increase redemption amount').props.accessibilityState.disabled).toBe(true)
    expect(screen.getByLabelText('Decrease redemption amount').props.accessibilityState.disabled).toBe(false)
  })

  it('decrement is disabled at the minimum (100 pts)', async () => {
    withPoints(250)
    await render(<RedeemCard />)
    await screen.findByLabelText('Redeem 100 points for £1.00')

    expect(screen.getByLabelText('Decrease redemption amount').props.accessibilityState.disabled).toBe(true)
  })

  // ── Successful redemption ─────────────────────────────────────────────────────

  it('calls the service, updates the store, and shows a success message on redemption', async () => {
    withPoints(100)
    ;(loyaltyService.redeem as jest.Mock).mockResolvedValue({
      data: { creditAmount: 1, remainingPoints: 0, transactionId: 'svc-tx-1' },
      error: null,
    })

    await render(<RedeemCard />)
    fireEvent.press(await screen.findByLabelText('Redeem 100 points for £1.00'))

    await waitFor(() => {
      expect(loyaltyService.redeem).toHaveBeenCalledWith(100)
      expect(mockApplyTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          id:          'test-tx-id',
          type:        'points_redemption',
          amount:      1,
          description: 'Redeemed 100 pts for £1.00 credit',
        }),
      )
      expect(mockSetLoyaltyPoints).toHaveBeenCalledWith(0)
    })
    expect(await screen.findByText('£1.00 added to your wallet')).toBeTruthy()
  })

  it('redeems 200 pts (£2.00) after incrementing to the second unit', async () => {
    withPoints(250)
    ;(loyaltyService.redeem as jest.Mock).mockResolvedValue({
      data: { creditAmount: 2, remainingPoints: 50, transactionId: 'svc-tx-2' },
      error: null,
    })

    await render(<RedeemCard />)
    await screen.findByLabelText('Redeem 100 points for £1.00')
    fireEvent.press(screen.getByLabelText('Increase redemption amount'))
    fireEvent.press(await screen.findByLabelText('Redeem 200 points for £2.00'))

    await waitFor(() => {
      expect(loyaltyService.redeem).toHaveBeenCalledWith(200)
      expect(mockApplyTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 2, description: 'Redeemed 200 pts for £2.00 credit' }),
      )
      expect(mockSetLoyaltyPoints).toHaveBeenCalledWith(50)
    })
  })

  // ── Error handling ────────────────────────────────────────────────────────────

  it('shows an inline error and does not update the store when the service returns an error', async () => {
    withPoints(100)
    ;(loyaltyService.redeem as jest.Mock).mockResolvedValue({
      data: null,
      error: 'Insufficient loyalty points.',
    })

    await render(<RedeemCard />)
    fireEvent.press(await screen.findByLabelText('Redeem 100 points for £1.00'))

    expect(await screen.findByText('Insufficient loyalty points.')).toBeTruthy()
    expect(mockApplyTransaction).not.toHaveBeenCalled()
    expect(mockSetLoyaltyPoints).not.toHaveBeenCalled()
  })

  // ── Double-tap prevention ─────────────────────────────────────────────────────

  it('disables the button while a redemption is in progress and ignores a second press', async () => {
    withPoints(100)
    let resolveRedeem!: (v: {
      data: { creditAmount: number; remainingPoints: number; transactionId: string }
      error: null
    }) => void
    const pendingRedeem = new Promise<{
      data: { creditAmount: number; remainingPoints: number; transactionId: string }
      error: null
    }>((res) => { resolveRedeem = res })
    ;(loyaltyService.redeem as jest.Mock).mockReturnValue(pendingRedeem)

    await render(<RedeemCard />)
    fireEvent.press(await screen.findByLabelText('Redeem 100 points for £1.00'))

    // Button switches to loading state while the service is pending
    expect(await screen.findByLabelText('Processing redemption')).toBeTruthy()

    // A second press does not trigger a second service call
    fireEvent.press(screen.getByLabelText('Processing redemption'))
    expect(loyaltyService.redeem).toHaveBeenCalledTimes(1)

    // Resolve to avoid leaving a dangling promise
    await act(async () => {
      resolveRedeem({
        data: { creditAmount: 1, remainingPoints: 0, transactionId: 'svc-tx-1' },
        error: null,
      })
    })
  })
})
