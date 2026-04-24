/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: [
    // Types
    '/types/',
    '\\.d\\.ts$',
  ],
  testPathIgnorePatterns: ['dist'],
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/*.test.ts'],
  rootDir: './',
  testTimeout: 80000,
  reporters: [['default', { summaryThreshold: 1 }]],
};
