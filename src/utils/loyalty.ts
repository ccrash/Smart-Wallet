/** Points that redeem as one unit of wallet credit. Redemptions must be whole multiples of this. */
export const POINTS_PER_REDEEM_UNIT = 100

/** Wallet credit, in pounds, granted per redeemed unit. */
export const CREDIT_PER_UNIT = 1

/** Pounds of wallet credit a points amount redeems for. */
export function pointsToCredit(points: number): number {
  return (points / POINTS_PER_REDEEM_UNIT) * CREDIT_PER_UNIT
}
