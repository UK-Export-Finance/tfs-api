import { JestConfigWithTsJest } from 'ts-jest';

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
    '@ukef/module/(.*)': '<rootDir>/../src/modules/$1',
    '@ukef/(.*)': '<rootDir>/../src/$1',
    '@ukef-test/(.*)': '<rootDir>../test/$1',
  },
};

const config: JestConfigWithTsJest = {
  projects: [
    {
      displayName: 'Unit',
      setupFilesAfterEnv: ['../test/setup/mock-nestjs-axios.ts'],
      testMatch: ['**/*.test.ts'],
      transform: { '^.+\\.(ts|tsx)?$': ['ts-jest', { useESM: true }] },
      ...defaultSettings,
      rootDir: 'src', // Since unit tests are created inside `src`
    },
    {
      displayName: 'API',
      setupFilesAfterEnv: ['./setup/override-environment-variables.ts'],
      testMatch: ['**/*.api-test.ts'],
      transform: { '^.+\\.(ts|tsx)?$': ['ts-jest', { useESM: true }] },
      ...defaultSettings,
    },
  ],
};

export default config;
