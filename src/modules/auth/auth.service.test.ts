import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  const valueGenerator = new RandomValueGenerator();
  const config = { apiKey: 'api-key' };

  beforeAll(() => {
    authService = new AuthService(config);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should return `false` when API Key is invalid', () => {
    const key = valueGenerator.string();
    const result = authService.validateApiKey(key);

    expect(result).toBe(false);
  });

  it('should return `false` when API Key is not provided', () => {
    const result = authService.validateApiKey('');

    expect(result).toBe(false);
  });

  it('should return `false` when API Key is `null`', () => {
    const result = authService.validateApiKey(null);

    expect(result).toBe(false);
  });

  it('should return `false` when API Key is `undefined`', () => {
    const result = authService.validateApiKey(undefined);

    expect(result).toBe(false);
  });

  it('should return `true` when API Key is valid', () => {
    const result = authService.validateApiKey(config.apiKey);

    expect(result).toBe(true);
  });
});
