import { render, screen } from '@testing-library/react-native'

import { useWalletStore } from '@/store/walletStore'

import { PointsHeroCard } from '../PointsHeroCard'

jest.mock('@/store/walletStore', () => ({ useWalletStore: jest.fn() }))

function withPoints(loyaltyPoints: number) {
  ;(useWalletStore as unknown as jest.Mock).mockImplementation(
    (selector: (s: { loyaltyPoints: number }) => unknown) => selector({ loyaltyPoints }),
  )
}

describe('PointsHeroCard', () => {
  beforeAll(() => jest.useRealTimers())
  afterAll(() => jest.useFakeTimers())
  afterEach(() => jest.clearAllMocks())

  // ── Points balance display ────────────────────────────────────────────────────

  it('displays the points balance', async () => {
    withPoints(250)
    await render(<PointsHeroCard />)
    expect(await screen.findByText('250')).toBeTruthy()
  })

  it('displays 0 when points balance is zero', async () => {
    withPoints(0)
    await render(<PointsHeroCard />)
    expect(await screen.findByText('0')).toBeTruthy()
  })

  // ── Progress text: "X / 100 pts to next £1" ──────────────────────────────────

  it('shows "0 / 100" at 0 pts', async () => {
    withPoints(0)
    await render(<PointsHeroCard />)
    expect(await screen.findByText(/0 \/ 100 pts to next £1/)).toBeTruthy()
  })

  it('shows "99 / 100" at 99 pts', async () => {
    withPoints(99)
    await render(<PointsHeroCard />)
    expect(await screen.findByText(/99 \/ 100 pts to next £1/)).toBeTruthy()
  })

  it('resets progress to "0 / 100" at exactly 100 pts — a new cycle starts', async () => {
    withPoints(100)
    await render(<PointsHeroCard />)
    expect(await screen.findByText(/0 \/ 100 pts to next £1/)).toBeTruthy()
  })

  it('shows "1 / 100" at 101 pts', async () => {
    withPoints(101)
    await render(<PointsHeroCard />)
    expect(await screen.findByText(/1 \/ 100 pts to next £1/)).toBeTruthy()
  })

  it('shows "50 / 100" at 250 pts', async () => {
    withPoints(250)
    await render(<PointsHeroCard />)
    expect(await screen.findByText(/50 \/ 100 pts to next £1/)).toBeTruthy()
  })

  // ── Redeemable status ─────────────────────────────────────────────────────────

  it('shows "Earn more to redeem" at 0 pts', async () => {
    withPoints(0)
    await render(<PointsHeroCard />)
    expect(await screen.findByText('Earn more to redeem')).toBeTruthy()
  })

  it('shows "Earn more to redeem" at 99 pts (below 100-pt minimum)', async () => {
    withPoints(99)
    await render(<PointsHeroCard />)
    expect(await screen.findByText('Earn more to redeem')).toBeTruthy()
  })

  it('shows "100 redeemable" at exactly 100 pts', async () => {
    withPoints(100)
    await render(<PointsHeroCard />)
    expect(await screen.findByText('100 redeemable')).toBeTruthy()
  })

  it('shows "100 redeemable" at 101 pts — the extra 1 pt carries into the next cycle', async () => {
    withPoints(101)
    await render(<PointsHeroCard />)
    expect(await screen.findByText('100 redeemable')).toBeTruthy()
  })

  it('shows "200 redeemable" at 250 pts', async () => {
    withPoints(250)
    await render(<PointsHeroCard />)
    expect(await screen.findByText('200 redeemable')).toBeTruthy()
  })

  it('shows no "redeemable" text when pts < 100 — shows "Earn more to redeem" instead', async () => {
    withPoints(50)
    await render(<PointsHeroCard />)
    await screen.findByText('Earn more to redeem') // wait for render to settle
    expect(screen.queryByText(/redeemable/)).toBeNull()
  })
})
