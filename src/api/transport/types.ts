import { ApiResponse } from '@/types'

export interface ApiTransport {
  get<T>(path: string, params?: Record<string, string | number>): Promise<ApiResponse<T>>
  post<T>(path: string, body?: unknown): Promise<ApiResponse<T>>
  put<T>(path: string, body?: unknown): Promise<ApiResponse<T>>
  del<T>(path: string): Promise<ApiResponse<T>>
}
