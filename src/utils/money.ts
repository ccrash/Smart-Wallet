/** Rounds to 2 decimal places. All balance arithmetic must pass through this so float error never accumulates in a stored balance. */
export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100
}

/** True for a finite, positive amount with at most 2 decimal places. Rejects NaN/Infinity. */
export function isValidAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0 && roundMoney(amount) === amount
}

/** Parses user-entered money text. Returns the amount in pounds, or null unless it is a plain positive number with at most 2 decimal places. */
export function parseMoneyInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null
  const amount = Number(trimmed)
  return amount > 0 ? amount : null
}
