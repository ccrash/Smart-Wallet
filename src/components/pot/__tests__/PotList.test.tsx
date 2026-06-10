import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { Alert } from 'react-native'

jest.mock('@/store/walletStore', () => ({ useWalletStore: jest.fn() }))
jest.mock('@/api/pots.service', () => ({
  potsService: {
    list:     jest.fn(),
    create:   jest.fn(),
    deposit:  jest.fn(),
    withdraw: jest.fn(),
    remove:   jest.fn(),
  },
}))
jest.mock('@/api/client', () => ({
  generateId: jest.fn().mockReturnValue('test-tx-id'),
}))

import { useWalletStore } from '@/store/walletStore'
import { potsService } from '@/api/pots.service'

import { PotList } from '../PotList'

const mockAddPot           = jest.fn()
const mockUpdatePotBalance = jest.fn()
const mockRemovePot        = jest.fn()
const mockApplyTransaction = jest.fn()

const BASE_STATE = {
  pots: [] as { id: string; name: string; balance: number; createdAt: string }[],
  addPot:           mockAddPot,
  updatePotBalance: mockUpdatePotBalance,
  removePot:        mockRemovePot,
  applyTransaction: mockApplyTransaction,
}

const HOLIDAY_POT = { id: 'pot-1', name: 'Holiday', balance: 75, createdAt: '' }

// Types a value into a TextInput and waits for the controlled state to sync
async function typeInto(placeholder: string, value: string) {
  const input = await screen.findByPlaceholderText(placeholder)
  fireEvent.changeText(input, value)
  await waitFor(() => expect(screen.getByDisplayValue(value)).toBeTruthy())
}

describe('PotList', () => {
  beforeAll(() => jest.useRealTimers())
  afterAll(()  => jest.useFakeTimers())

  beforeEach(() => {
    ;(useWalletStore as unknown as jest.Mock).mockImplementation(
      (selector: (s: typeof BASE_STATE) => unknown) => selector(BASE_STATE),
    )
    ;(potsService.list as jest.Mock).mockResolvedValue({ data: [], error: null })
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  // ─── Create ──────────────────────────────────────────────────────────────────

  describe('create pot', () => {
    it('calls addPot and closes modal on success', async () => {
      const newPot = { id: 'pot-new', name: 'Emergency', balance: 0, createdAt: '' }
      ;(potsService.create as jest.Mock).mockResolvedValue({ data: newPot, error: null })

      await render(<PotList />)
      await screen.findByText('No pots yet')

      fireEvent.press(screen.getByText('New pot'))
      await typeInto('Pot name (e.g. Holiday)', 'Emergency')
      fireEvent.press(screen.getByText('Confirm'))

      await waitFor(() => {
        expect(potsService.create).toHaveBeenCalledWith('Emergency')
        expect(mockAddPot).toHaveBeenCalledWith(newPot)
      })
      expect(screen.queryByText('Confirm')).toBeNull()
    })

    it('shows field error and keeps modal open on failure', async () => {
      ;(potsService.create as jest.Mock).mockResolvedValue({ data: null, error: 'Name is required.' })

      await render(<PotList />)
      await screen.findByText('No pots yet')

      fireEvent.press(screen.getByText('New pot'))
      await typeInto('Pot name (e.g. Holiday)', 'x')
      fireEvent.press(screen.getByText('Confirm'))

      expect(await screen.findByText('Name is required.')).toBeTruthy()
      expect(screen.getByText('Confirm')).toBeTruthy()
    })
  })

  // ─── Deposit ─────────────────────────────────────────────────────────────────

  describe('deposit', () => {
    beforeEach(() => {
      const stateWithPot = { ...BASE_STATE, pots: [HOLIDAY_POT] }
      ;(useWalletStore as unknown as jest.Mock).mockImplementation(
        (selector: (s: typeof stateWithPot) => unknown) => selector(stateWithPot),
      )
    })

    it('updates pot balance, applies a debit transaction, and closes modal on success', async () => {
      ;(potsService.deposit as jest.Mock).mockResolvedValue({
        data: { pot: { ...HOLIDAY_POT, balance: 125 }, debitAmount: 50 },
        error: null,
      })

      await render(<PotList />)
      fireEvent.press(await screen.findByText('Add'))
      await typeInto('Amount (e.g. 50.00)', '50')
      fireEvent.press(screen.getByText('Confirm'))

      await waitFor(() => {
        expect(potsService.deposit).toHaveBeenCalledWith('pot-1', 50)
        expect(mockUpdatePotBalance).toHaveBeenCalledWith('pot-1', 125)
        expect(mockApplyTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            id:          'test-tx-id',
            type:        'pot_deposit',
            amount:      -50,
            description: 'Transfer to Holiday',
          }),
        )
      })
      expect(screen.queryByText('Confirm')).toBeNull()
    })

    it('shows field error on failure', async () => {
      ;(potsService.deposit as jest.Mock).mockResolvedValue({
        data: null, error: 'Insufficient balance.',
      })

      await render(<PotList />)
      fireEvent.press(await screen.findByText('Add'))
      await typeInto('Amount (e.g. 50.00)', '999')
      fireEvent.press(screen.getByText('Confirm'))

      expect(await screen.findByText('Insufficient balance.')).toBeTruthy()
      expect(mockUpdatePotBalance).not.toHaveBeenCalled()
    })
  })

  // ─── Withdraw ────────────────────────────────────────────────────────────────

  describe('withdraw', () => {
    beforeEach(() => {
      const stateWithPot = { ...BASE_STATE, pots: [HOLIDAY_POT] }
      ;(useWalletStore as unknown as jest.Mock).mockImplementation(
        (selector: (s: typeof stateWithPot) => unknown) => selector(stateWithPot),
      )
    })

    it('updates pot balance, applies a credit transaction, and closes modal on success', async () => {
      ;(potsService.withdraw as jest.Mock).mockResolvedValue({
        data: { pot: { ...HOLIDAY_POT, balance: 25 }, creditAmount: 50 },
        error: null,
      })

      await render(<PotList />)
      fireEvent.press(await screen.findByText('Take out'))
      await typeInto('Amount (e.g. 25.00)', '50')
      fireEvent.press(screen.getByText('Confirm'))

      await waitFor(() => {
        expect(potsService.withdraw).toHaveBeenCalledWith('pot-1', 50)
        expect(mockUpdatePotBalance).toHaveBeenCalledWith('pot-1', 25)
        expect(mockApplyTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            id:          'test-tx-id',
            type:        'pot_withdrawal',
            amount:      50,
            description: 'Withdraw from Holiday',
          }),
        )
      })
      expect(screen.queryByText('Confirm')).toBeNull()
    })

    it('shows field error on failure', async () => {
      ;(potsService.withdraw as jest.Mock).mockResolvedValue({
        data: null, error: 'Amount exceeds pot balance.',
      })

      await render(<PotList />)
      fireEvent.press(await screen.findByText('Take out'))
      await typeInto('Amount (e.g. 25.00)', '999')
      fireEvent.press(screen.getByText('Confirm'))

      expect(await screen.findByText('Amount exceeds pot balance.')).toBeTruthy()
      expect(mockUpdatePotBalance).not.toHaveBeenCalled()
    })
  })

  // ─── Delete ──────────────────────────────────────────────────────────────────

  describe('delete', () => {
    beforeEach(() => {
      const stateWithPot = { ...BASE_STATE, pots: [HOLIDAY_POT] }
      ;(useWalletStore as unknown as jest.Mock).mockImplementation(
        (selector: (s: typeof stateWithPot) => unknown) => selector(stateWithPot),
      )
    })

    it('shows refund message in alert when pot has balance', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')
      await render(<PotList />)
      fireEvent.press(await screen.findByLabelText('Delete Holiday'))

      expect(alertSpy).toHaveBeenCalledWith(
        'Delete "Holiday"?',
        '£75.00 will be returned to your wallet.',
        expect.any(Array),
      )
    })

    it('shows empty message in alert when pot has no balance', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')
      const emptyPot = { ...HOLIDAY_POT, balance: 0 }
      const stateEmpty = { ...BASE_STATE, pots: [emptyPot] }
      ;(useWalletStore as unknown as jest.Mock).mockImplementation(
        (selector: (s: typeof stateEmpty) => unknown) => selector(stateEmpty),
      )

      await render(<PotList />)
      fireEvent.press(await screen.findByLabelText('Delete Holiday'))

      expect(alertSpy).toHaveBeenCalledWith(
        'Delete "Holiday"?',
        'This pot is empty and will be removed.',
        expect.any(Array),
      )
    })

    it('calls remove and removePot on confirm — no refund transaction when balance is zero', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')
      const emptyPot = { ...HOLIDAY_POT, balance: 0 }
      const stateEmpty = { ...BASE_STATE, pots: [emptyPot] }
      ;(useWalletStore as unknown as jest.Mock).mockImplementation(
        (selector: (s: typeof stateEmpty) => unknown) => selector(stateEmpty),
      )
      ;(potsService.remove as jest.Mock).mockResolvedValue({ data: { refundAmount: 0 }, error: null })

      await render(<PotList />)
      fireEvent.press(await screen.findByLabelText('Delete Holiday'))

      const [, , buttons] = alertSpy.mock.calls[0] as [
        string, string, { style?: string; onPress?: () => void }[],
      ]
      act(() => { buttons.find((b) => b.style === 'destructive')?.onPress?.() })

      await waitFor(() => {
        expect(potsService.remove).toHaveBeenCalledWith('pot-1')
        expect(mockRemovePot).toHaveBeenCalledWith('pot-1')
      })
      expect(mockApplyTransaction).not.toHaveBeenCalled()
    })

    it('applies a refund transaction when pot had balance', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')
      ;(potsService.remove as jest.Mock).mockResolvedValue({ data: { refundAmount: 75 }, error: null })

      await render(<PotList />)
      fireEvent.press(await screen.findByLabelText('Delete Holiday'))

      const [, , buttons] = alertSpy.mock.calls[0] as [
        string, string, { style?: string; onPress?: () => void }[],
      ]
      act(() => { buttons.find((b) => b.style === 'destructive')?.onPress?.() })

      await waitFor(() => {
        expect(mockApplyTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            id:          'test-tx-id',
            type:        'pot_withdrawal',
            amount:      75,
            description: 'Holiday pot closed',
          }),
        )
        expect(mockRemovePot).toHaveBeenCalledWith('pot-1')
      })
    })
  })
})
