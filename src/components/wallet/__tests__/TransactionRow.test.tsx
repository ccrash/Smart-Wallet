import { render, screen } from '@testing-library/react-native'

import { TransactionRow } from '../TransactionRow'

const BASE_TX = {
  id: 'tx-1',
  date: new Date('2025-01-15').toISOString(),
  description: 'Welcome bonus',
  amount: 500,
  type: 'seed' as const,
  runningBalance: 500,
}

describe('TransactionRow', () => {
  it('renders description, positive signed amount, and running balance', async () => {
    await render(<TransactionRow tx={BASE_TX} isLast />)
    expect(await screen.findByText('Welcome bonus')).toBeTruthy()
    expect(screen.getByText('+£500.00')).toBeTruthy()
    expect(screen.getByText('£500.00 bal')).toBeTruthy()
  })

  it('renders negative amount without + prefix', async () => {
    const debitTx = { ...BASE_TX, amount: -25, description: 'Voucher purchase', type: 'voucher_purchase' as const, runningBalance: 475 }
    await render(<TransactionRow tx={debitTx} isLast />)
    expect(await screen.findByText('Voucher purchase')).toBeTruthy()
    expect(screen.getByText('£25.00')).toBeTruthy()
    expect(screen.getByText('£475.00 bal')).toBeTruthy()
  })

  it('renders without throwing when isLast is false', async () => {
    await render(<TransactionRow tx={BASE_TX} isLast={false} />)
    expect(await screen.findByText('Welcome bonus')).toBeTruthy()
  })
})
