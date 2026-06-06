import { ApiResponse, User } from '@/types';

import { mockRequest } from './client';

const MOCK_USER: User = {
  id: 'mock-user-001',
  displayName: 'Alex Johnson',
  email: 'alex@example.com',
  photoURL: null,
};

export const authService = {
  signInMock(): Promise<ApiResponse<User>> {
    return mockRequest(() => MOCK_USER);
  },

  signOut(): Promise<ApiResponse<void>> {
    return mockRequest(() => undefined as void);
  },
};
