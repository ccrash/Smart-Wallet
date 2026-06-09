import { httpTransport } from './http.transport'
import { mockTransport } from './mock.transport'

// Use the real HTTP transport when EXPO_PUBLIC_API_URL is set; fall back to the
// mock transport for local development and tests.
export const transport = process.env.EXPO_PUBLIC_API_URL ? httpTransport : mockTransport
