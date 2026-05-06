import { requireEnv, requireEnvInt } from 'utils/env';

describe('requireEnv', () => {
  const ENV_VAR = 'TEST_REQUIRE_ENV_VAR';

  afterEach(() => {
    delete process.env[ENV_VAR];
  });

  it('returns the value when the environment variable is set', () => {
    process.env[ENV_VAR] = 'some-value';
    expect(requireEnv(ENV_VAR)).toBe('some-value');
  });

  it('throws when the environment variable is missing', () => {
    delete process.env[ENV_VAR];
    expect(() => requireEnv(ENV_VAR)).toThrow(`Missing required environment variable: ${ENV_VAR}`);
  });

  it('throws when the environment variable is an empty string', () => {
    process.env[ENV_VAR] = '';
    expect(() => requireEnv(ENV_VAR)).toThrow(`Missing required environment variable: ${ENV_VAR}`);
  });
});

describe('requireEnvInt', () => {
  const ENV_VAR = 'TEST_REQUIRE_ENV_INT_VAR';

  afterEach(() => {
    delete process.env[ENV_VAR];
  });

  it('returns the parsed integer when the environment variable is a valid positive integer', () => {
    process.env[ENV_VAR] = '42';
    expect(requireEnvInt(ENV_VAR)).toBe(42);
  });

  it('throws when the environment variable is missing', () => {
    delete process.env[ENV_VAR];
    expect(() => requireEnvInt(ENV_VAR)).toThrow(`Missing required environment variable: ${ENV_VAR}`);
  });

  it('throws when the environment variable is not a number', () => {
    process.env[ENV_VAR] = 'abc';
    expect(() => requireEnvInt(ENV_VAR)).toThrow(`Environment variable ${ENV_VAR} must be a positive integer, got: "abc"`);
  });

  it('throws when the environment variable is a decimal', () => {
    process.env[ENV_VAR] = '1.5';
    expect(() => requireEnvInt(ENV_VAR)).toThrow(`Environment variable ${ENV_VAR} must be a positive integer, got: "1.5"`);
  });

  it('throws when the environment variable is zero', () => {
    process.env[ENV_VAR] = '0';
    expect(() => requireEnvInt(ENV_VAR)).toThrow(`Environment variable ${ENV_VAR} must be a positive integer, got: "0"`);
  });

  it('throws when the environment variable is negative', () => {
    process.env[ENV_VAR] = '-5';
    expect(() => requireEnvInt(ENV_VAR)).toThrow(`Environment variable ${ENV_VAR} must be a positive integer, got: "-5"`);
  });
});
