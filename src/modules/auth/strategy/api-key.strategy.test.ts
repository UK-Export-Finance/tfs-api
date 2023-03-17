import { UnauthorizedException } from '@nestjs/common';
import { AUTH } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { Request } from 'express';
import { when } from 'jest-when';
import { BadRequestError } from 'passport-headerapikey';

import { AuthService } from '../auth.service';
import { ApiKeyStrategy } from './api-key.strategy';

jest.mock('../auth.service');

describe('ApiKeyStrategy', () => {
  const valueGenerator = new RandomValueGenerator();
  const apiKeyHeaderName = AUTH.STRATEGY.toLowerCase();
  const validApiKey = valueGenerator.string();
  const otherHeaderName = valueGenerator.word().toLowerCase();
  const invalidApiKey = valueGenerator.string();

  let error: jest.Mock;
  let fail: jest.Mock;
  let pass: jest.Mock;
  let redirect: jest.Mock;
  let success: jest.Mock;

  let authService: AuthService;

  let strategy: ApiKeyStrategy;

  beforeEach(() => {
    authService = new AuthService(null);
    const authServiceValidateApiKey = jest.fn();
    authService.validateApiKey = authServiceValidateApiKey;

    when(authServiceValidateApiKey).mockReturnValue(false);
    when(authServiceValidateApiKey).calledWith(validApiKey).mockReturnValue(true);

    strategy = new ApiKeyStrategy(authService);

    // When Passport uses the strategy to authenticate the request, it will
    // augment the strategy with the below callbacks. The strategy should
    // call exactly one of the below callbacks to indicate the result of the
    // authentication.
    // See https://github.com/jaredhanson/passport-strategy#augmented-methods
    // for more details.
    error = strategy['error'] = jest.fn();
    fail = strategy['fail'] = jest.fn();
    pass = strategy['pass'] = jest.fn();
    redirect = strategy['redirect'] = jest.fn();
    success = strategy['success'] = jest.fn();
  });

  describe('authenticate', () => {
    describe('when the api key header is not present', () => {
      beforeEach(() => {
        const requestWithoutApiKeyHeader = createRequestWithHeaders({
          [otherHeaderName]: validApiKey,
        });
        strategy.authenticate(requestWithoutApiKeyHeader);
      });

      it('does not error', () => {
        expect(error).not.toHaveBeenCalled();
      });

      it('fails with a BadRequestError', () => {
        expect(fail).toHaveBeenCalledTimes(1);
        expect(fail).toHaveBeenCalledWith(new BadRequestError('Missing API Key'), null);
      });

      it('does not pass', () => {
        expect(pass).not.toHaveBeenCalled();
      });

      it('does not redirect', () => {
        expect(redirect).not.toHaveBeenCalled();
      });

      it('does not succeed', () => {
        expect(success).not.toHaveBeenCalled();
      });
    });

    describe('when the api key header is present and the api key value is invalid', () => {
      beforeEach(() => {
        const requestWithIncorrectApiKeyValue = createRequestWithHeaders({
          [apiKeyHeaderName]: invalidApiKey,
        });
        strategy.authenticate(requestWithIncorrectApiKeyValue);
      });

      it('errors with an UnauthorizedException', () => {
        expect(error).toHaveBeenCalledTimes(1);
        expect(error).toHaveBeenCalledWith(new UnauthorizedException());
      });

      it('does not fail', () => {
        expect(fail).not.toHaveBeenCalled();
      });

      it('does not pass', () => {
        expect(pass).not.toHaveBeenCalled();
      });

      it('does not redirect', () => {
        expect(redirect).not.toHaveBeenCalled();
      });

      it('does not succeed', () => {
        expect(success).not.toHaveBeenCalled();
      });
    });

    describe('when the api key header is present and the api key value is valid', () => {
      beforeEach(() => {
        const requestWithCorrectApiKeyValue = createRequestWithHeaders({
          [apiKeyHeaderName]: validApiKey,
          [otherHeaderName]: invalidApiKey,
        });
        strategy.authenticate(requestWithCorrectApiKeyValue);
      });

      it('does not error', () => {
        expect(error).not.toHaveBeenCalled();
      });

      it('does not fail', () => {
        expect(fail).not.toHaveBeenCalled();
      });

      it('does not pass', () => {
        expect(pass).not.toHaveBeenCalled();
      });

      it('does not redirect', () => {
        expect(redirect).not.toHaveBeenCalled();
      });

      it('succeeds with `true` as the user and `undefined` as the info', () => {
        expect(success).toHaveBeenCalledTimes(1);
        expect(success).toHaveBeenCalledWith(true, undefined);
      });
    });
  });

  const createRequestWithHeaders = (headers: Record<string, string>): Request => ({ headers } as unknown as Request);
});
