/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/vectorIconsMock.js',
    '^@expo/vector-icons/(.*)$': '<rootDir>/__mocks__/vectorIconsMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind)',
  ],
  fakeTimers: { enableGlobally: true },
  maxWorkers: 1,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
