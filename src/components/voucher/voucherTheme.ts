const VOUCHER_COLORS: Record<number, string> = {
  10: '#3b82f6', // blue
  25: '#8b5cf6', // violet
  50: '#10b981', // emerald
  100: '#f97316', // orange
}

const FALLBACK_COLOR = '#1C274C'

export function voucherColor(denomination: number): string {
  return VOUCHER_COLORS[denomination] ?? FALLBACK_COLOR
}
