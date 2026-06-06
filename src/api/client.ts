import { ApiResponse } from '@/types';

const SIMULATED_DELAY_MS = 150;

export async function mockRequest<T>(
  handler: () => T,
  delayMs = SIMULATED_DELAY_MS,
): Promise<ApiResponse<T>> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  try {
    const data = handler();
    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { data: null, error: message };
  }
}
