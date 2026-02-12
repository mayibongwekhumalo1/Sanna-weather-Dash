export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
  transform: {},
};
