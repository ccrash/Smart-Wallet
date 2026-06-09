import { ApiResponse } from '@/types'

import { ApiTransport } from './types'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? ''

async function request<T>(
  method: string,
  path: string,
  options: { params?: Record<string, string | number>; body?: unknown } = {},
): Promise<ApiResponse<T>> {
  const url = new URL(`${BASE_URL}${path}`)

  if (options.params) {
    for (const [k, v] of Object.entries(options.params)) {
      url.searchParams.set(k, String(v))
    }
  }

  try {
    const res = await fetch(url.toString(), {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      return { data: null, error: (payload as { message?: string }).message ?? res.statusText }
    }

    const data: T = await res.json()
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Network error' }
  }
}

export const httpTransport: ApiTransport = {
  get:  (path, params) => request('GET',    path, { params }),
  post: (path, body)   => request('POST',   path, { body }),
  put:  (path, body)   => request('PUT',    path, { body }),
  del:  (path)         => request('DELETE', path),
}
