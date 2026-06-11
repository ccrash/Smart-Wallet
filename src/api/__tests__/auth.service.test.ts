import { authService } from '../auth.service'

describe('authService', () => {
  describe('signIn', () => {
    it('returns a demo user built from the display name', async () => {
      const promise = authService.signIn('Alex Johnson')
      jest.runAllTimers()
      const result = await promise

      expect(result.error).toBeNull()
      expect(result.data).toMatchObject({
        displayName: 'Alex Johnson',
        email: 'alex.johnson@demo.smartwallet.app',
        photoURL: null,
      })
      expect(result.data!.id).toBeTruthy()
    })

    it('trims surrounding whitespace from the name', async () => {
      const promise = authService.signIn('  Alex  ')
      jest.runAllTimers()
      const result = await promise

      expect(result.error).toBeNull()
      expect(result.data!.displayName).toBe('Alex')
    })

    it('returns an error for an empty name', async () => {
      const promise = authService.signIn('   ')
      jest.runAllTimers()
      const result = await promise

      expect(result.data).toBeNull()
      expect(result.error).toBe('Name cannot be empty.')
    })

    it('returns an error when the name exceeds 30 characters', async () => {
      const promise = authService.signIn('A'.repeat(31))
      jest.runAllTimers()
      const result = await promise

      expect(result.data).toBeNull()
      expect(result.error).toMatch(/30 characters or fewer/)
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
