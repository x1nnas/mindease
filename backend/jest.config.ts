export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    globalSetup: '<rootDir>/src/tests/globalSetup.ts',
    globalTeardown: '<rootDir>/src/tests/globalTeardown.ts',
    setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
    verbose: true,
    collectCoverage: false,
  };
  