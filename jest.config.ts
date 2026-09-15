import { JestConfigWithTsJest } from 'ts-jest';

const tsJestGlobals = {
  'ts-jest': {
    useESM: true,
    tsconfig: { module: 'esnext', target: 'ES2022' },
  },
};

const tsJestTransform = { '^.+\\.(ts|tsx)?$': ['ts-jest', { useESM: true }] };

const defaultSettings = {
  rootDir: 'test',
  extensionsToTreatAsEsm: ['.ts'],
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '@ukef/constants/(.*)': '<rootDir>/../src/constants/$1',
    '@ukef/config/(.*)': '<rootDir>/../src/config/$1',
    '@ukef/helpers/(.*)': '<rootDir>/../src/helpers/$1',
    '@ukef/modules/(.*)': '<rootDir>/../src/modules/$1',
    '@ukef/(.*)': '<rootDir>/../src/$1',
    '@ukef/auth/(.*)': '<rootDir>/../src/modules/auth/$1',
    '@ukef-test/(.*)': '<rootDir>../test/$1',
  },
};

const config: JestConfigWithTsJest = {
  projects: [
    {
      displayName: 'Unit-FF=true',
      setupFiles: ['../test/setup/enable-gift-feature-flag.ts'],
      setupFilesAfterEnv: ['../test/setup/mock-nestjs-axios.ts'],
      testMatch: ['**/*.test.ts'],
      testPathIgnorePatterns: ['.*\\.gift-disabled\\.test\\.ts$'],
      globals: tsJestGlobals,
      transform: tsJestTransform,
      ...defaultSettings,
      rootDir: 'src',
    },
    {
      displayName: 'Unit-FF=false',
      setupFiles: ['../test/setup/disable-gift-feature-flag.ts'],
      setupFilesAfterEnv: ['../test/setup/mock-nestjs-axios.ts'],
      testMatch: ['**/*.gift-disabled.test.ts'],
      globals: tsJestGlobals,
      transform: tsJestTransform,
      ...defaultSettings,
      rootDir: 'src',
    },
    {
      displayName: 'API-FF=true',
      setupFilesAfterEnv: ['./setup/override-environment-variables.ts', './setup/enable-gift-feature-flag.ts'],
      testMatch: ['**/*.api-test.ts', '!**/feature-flag-disabled/**/*.api-test.ts'],
      globals: tsJestGlobals,
      transform: tsJestTransform,
      ...defaultSettings,
    },
    {
      displayName: 'API-FF=false',
      setupFilesAfterEnv: ['./setup/override-environment-variables.ts', './setup/disable-gift-feature-flag.ts'],
      testMatch: ['**/feature-flag-disabled/*.api-test.ts'],
      globals: tsJestGlobals,
      transform: tsJestTransform,
      ...defaultSettings,
    },
  ],
  reporters: [['default', { summaryThreshold: 1 }]],
};

export default config;
