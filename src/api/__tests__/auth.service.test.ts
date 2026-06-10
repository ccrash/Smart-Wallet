import { authService } from '../auth.service'

describe('authService', () => {
  describe('signInMock', () => {
    it('returns the mock user', async () => {
      const promise = authService.signInMock()
      jest.runAllTimers()
      const result = await promise

      expect(result.error).toBeNull()
      expect(result.data).toMatchObject({
        id: 'mock-user-001',
        displayName: 'Alex Johnson',
        email: 'alex@example.com',
        photoURL: null,
      })
    })
  })

  describe('signOut', () => {
    it('resolves without error', async () => {
      const promise = authService.signOut()
      jest.runAllTimers()
      const result = await promise

      expect(result.error).toBeNull()
    })
  })
})
