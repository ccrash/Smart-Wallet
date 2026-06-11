import { isValidAmount, parseMoneyInput, roundMoney } from '../money'

describe('money', () => {
  // ─── roundMoney ────────────────────────────────────────────────────────────

  describe('roundMoney', () => {
    it('rounds float arithmetic error to 2 decimal places', () => {
      expect(roundMoney(0.1 + 0.2)).toBe(0.3)
      expect(roundMoney(499.9 - 0.2)).toBe(499.7)
    })

    it('leaves exact 2dp amounts unchanged', () => {
      expect(roundMoney(25.5)).toBe(25.5)
      expect(roundMoney(100)).toBe(100)
    })
  })

  // ─── isValidAmount ─────────────────────────────────────────────────────────

  describe('isValidAmount', () => {
    it('accepts positive amounts with up to 2 decimal places', () => {
      expect(isValidAmount(0.01)).toBe(true)
      expect(isValidAmount(25)).toBe(true)
      expect(isValidAmount(25.5)).toBe(true)
      expect(isValidAmount(25.55)).toBe(true)
    })

    it('rejects NaN and Infinity', () => {
      expect(isValidAmount(NaN)).toBe(false)
      expect(isValidAmount(Infinity)).toBe(false)
      expect(isValidAmount(-Infinity)).toBe(false)
    })

    it('rejects zero and negative amounts', () => {
      expect(isValidAmount(0)).toBe(false)
      expect(isValidAmount(-5)).toBe(false)
    })

    it('rejects more than 2 decimal places', () => {
      expect(isValidAmount(10.999)).toBe(false)
      expect(isValidAmount(0.001)).toBe(false)
    })
  })

  // ─── parseMoneyInput ───────────────────────────────────────────────────────

  describe('parseMoneyInput', () => {
    it('parses whole and decimal amounts', () => {
      expect(parseMoneyInput('25')).toBe(25)
      expect(parseMoneyInput('25.5')).toBe(25.5)
      expect(parseMoneyInput('25.50')).toBe(25.5)
      expect(parseMoneyInput(' 10 ')).toBe(10)
    })

    it('returns null for non-numeric input', () => {
      expect(parseMoneyInput('')).toBeNull()
      expect(parseMoneyInput('.')).toBeNull()
      expect(parseMoneyInput('abc')).toBeNull()
      expect(parseMoneyInput('5abc')).toBeNull()
      expect(parseMoneyInput('1e5')).toBeNull()
    })

    it('returns null for zero, negatives, and more than 2 decimal places', () => {
      expect(parseMoneyInput('0')).toBeNull()
      expect(parseMoneyInput('0.00')).toBeNull()
      expect(parseMoneyInput('-5')).toBeNull()
      expect(parseMoneyInput('10.999')).toBeNull()
    })
  })
})
