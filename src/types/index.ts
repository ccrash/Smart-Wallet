export type User = {
  id: string;
  displayName: string;
  email: string;
  photoURL: string | null;
};

export type TransactionType =
  | 'seed'
  | 'pot_deposit'
  | 'pot_withdrawal'
  | 'voucher_purchase'
  | 'points_redemption';

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  runningBalance: number;
};

export type Pot = {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
};

export type Voucher = {
  id: string;
  denomination: number;
  code: string;
  purchasedAt: string;
  pointsEarned: number;
};

export type ThemePreference = 'light' | 'dark' | 'system';

export type ApiSuccess<T> = { data: T; error: null };
export type ApiError = { data: null; error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
