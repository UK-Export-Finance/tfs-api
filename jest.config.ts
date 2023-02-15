import { JestConfigWithTsJest } from 'ts-jest';

const moduleNameMapper = {
  '@ukef/config/(.*)': '<rootDir>/../src/config/$1',
  '@ukef/helpers/(.*)': '<rootDir>/../src/helpers/$1',
  '@ukef/module/(.*)': '<rootDir>/../src/modules/$1',
  '@ukef/(.*)': '<rootDir>/../src/$1',
};

const config: JestConfigWithTsJest = {
  projects: [
    {
      displayName: 'Unit',
      rootDir: 'test',
      testMatch: ['**/*.spec.ts'],
      extensionsToTreatAsEsm: ['.ts'],
      preset: 'ts-jest/presets/default-esm',
      testEnvironment: 'node',
      transform: { '^.+\\.(ts|tsx)?$': ['ts-jest', { useESM: true }] },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
      moduleNameMapper,
    },
    {
      displayName: 'API',
      rootDir: 'test',
      testMatch: ['**/*.api-test.ts'],
      extensionsToTreatAsEsm: ['.ts'],
      preset: 'ts-jest/presets/default-esm',
      testEnvironment: 'node',
      transform: { '^.+\\.(ts|tsx)?$': ['ts-jest', { useESM: true }] },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
      moduleNameMapper,
    },
  ],
};

export default config;
