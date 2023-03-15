import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  const valueGenerator = new RandomValueGenerator();

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AuthService, ConfigService],
    }).compile();

    authService = app.get<AuthService>(AuthService);
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

  it('should return `true` when API Key is valid', () => {
    const { API_KEY } = process.env;
    const result = authService.validateApiKey(API_KEY);

    expect(result).toBe(true);
  });
});
