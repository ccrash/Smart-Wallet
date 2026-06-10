import { render, screen } from '@testing-library/react-native'

import { VoucherHistoryRow } from '../VoucherHistoryRow'

const MOCK_VOUCHER = {
  id: 'v-1',
  denomination: 25,
  code: 'SW-ABCD1234',
  purchasedAt: new Date('2025-01-15').toISOString(),
  pointsEarned: 25,
}

describe('VoucherHistoryRow', () => {
  it('renders denomination, voucher code, and points earned', async () => {
    await render(<VoucherHistoryRow voucher={MOCK_VOUCHER} isLast />)
    expect(await screen.findByText('£25 Voucher')).toBeTruthy()
    expect(screen.getByText('SW-ABCD1234')).toBeTruthy()
    expect(screen.getByText('+25 pts earned')).toBeTruthy()
  })

  it('renders without throwing when isLast is false', async () => {
    await render(<VoucherHistoryRow voucher={MOCK_VOUCHER} isLast={false} />)
    expect(await screen.findByText('SW-ABCD1234')).toBeTruthy()
  })
})
