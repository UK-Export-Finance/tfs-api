import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { Cache } from 'cache-manager';
import { when } from 'jest-when';
import { PinoLogger } from 'nestjs-pino';

import { ACBS_ID_TOKEN_CACHE_KEY } from './acbs-id-token.cache-key';
import { CachingAcbsAuthenticationService } from './caching-acbs-authentication.service';

describe('CachingAcbsAuthenticationService', () => {
  const valueGenerator = new RandomValueGenerator();
  const ttlInMilliseconds = valueGenerator.nonnegativeInteger();
  const newIdToken = valueGenerator.string();
  const cachedIdToken = valueGenerator.string();

  const usingIdCachedTokenLogMessage = 'Using the cached ACBS authentication id token.';
  const requestingNewIdTokenLogMessage = 'Requesting a new ACBS authentication id token.';
  const errorDuringGettingCachedIdTokenLogMessage = 'An error occurred when trying to get the id token from the cache. A new token will be requested.';
  const errorDuringCachingIdTokenLogMessage =
    'An error occurred when trying to store the id token in the cache. The new token will be used without storing it in the cache.';

  let acbsAuthenticationServiceGetIdToken: jest.Mock;
  let cacheManagerGet: jest.Mock;
  let cacheManagerSet: jest.Mock;
  let loggerDebug: jest.Mock;
  let loggerWarn: jest.Mock;
  let service: CachingAcbsAuthenticationService;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(newIdToken);

    cacheManagerGet = jest.fn();
    cacheManagerSet = jest.fn();
    const cacheManager: Cache = {
      get: cacheManagerGet,
      set: cacheManagerSet,
      del: jest.fn(),
      reset: jest.fn(),
      wrap: jest.fn(),
      store: null,
      on: null,
      removeListener: function (): void {
        throw new Error('Function not implemented.');
      },
    };

    const logger = new PinoLogger({});
    loggerDebug = jest.fn();
    logger.debug = loggerDebug;
    loggerWarn = jest.fn();
    logger.warn = loggerWarn;

    service = new CachingAcbsAuthenticationService({ idTokenCacheTtlInMilliseconds: ttlInMilliseconds }, acbsAuthenticationService, cacheManager, logger);
  });

  describe('getIdToken', () => {
    const withTestsThatANewIdTokenIsRetrievedAndCached = (): void => {
      it('calls the AcbsAuthenticationService', async () => {
        await service.getIdToken();

        expect(acbsAuthenticationServiceGetIdToken).toHaveBeenCalledTimes(1);
      });

      it('returns a new id token from the AcbsAuthenticationService if storing it in the cache DOES NOT error', async () => {
        const idToken = await service.getIdToken();

        expect(idToken).toBe(newIdToken);
      });

      it('returns a new id token from the AcbsAuthenticationService if storing it in the cache DOES error', async () => {
        const cacheManagerSetError = new Error('Test error');
        cacheManagerSet.mockRejectedValue(cacheManagerSetError);

        const idToken = await service.getIdToken();

        expect(idToken).toBe(newIdToken);
      });

      it('does NOT log that storing the id token in the cache failed at WARN level if storing it in the cache DOES NOT error', async () => {
        await service.getIdToken();

        const anyObject = expect.objectContaining({});

        expect(loggerWarn).not.toHaveBeenCalledWith(anyObject, errorDuringCachingIdTokenLogMessage);
      });

      it('logs that storing the id token in the cache failed at WARN level if storing it in the cache DOES error', async () => {
        const cacheManagerSetError = new Error('Test error');
        cacheManagerSet.mockRejectedValue(cacheManagerSetError);

        await service.getIdToken();

        expect(loggerWarn).toHaveBeenCalledWith(cacheManagerSetError, errorDuringCachingIdTokenLogMessage);
      });

      it('does NOT log that an id token was retrieved from the cache at DEBUG level', async () => {
        await service.getIdToken();

        expect(loggerDebug).not.toHaveBeenCalledWith(usingIdCachedTokenLogMessage);
      });

      it('stores a new id token from the AcbsAuthenticationService in the cache with the specified TTL', async () => {
        await service.getIdToken();

        expect(cacheManagerSet).toHaveBeenCalledWith(ACBS_ID_TOKEN_CACHE_KEY, newIdToken, ttlInMilliseconds);
      });

      it('logs that an id token is being stored in the cache at DEBUG level', async () => {
        await service.getIdToken();

        expect(loggerDebug).toHaveBeenCalledWith(requestingNewIdTokenLogMessage);
      });

      it('throws the same error as the AcbsAuthenticationService if it errors', async () => {
        const getIdTokenError = new Error('Test error');
        acbsAuthenticationServiceGetIdToken.mockReset();
        when(acbsAuthenticationServiceGetIdToken).calledWith().mockRejectedValue(getIdTokenError);

        const getIdTokenPromise = service.getIdToken();

        await expect(getIdTokenPromise).rejects.toBe(getIdTokenError);
      });
    };

    describe('when the idToken is not in the cache', () => {
      beforeEach(() => {
        when(cacheManagerGet).calledWith(ACBS_ID_TOKEN_CACHE_KEY).mockResolvedValueOnce(null);
      });

      withTestsThatANewIdTokenIsRetrievedAndCached();
    });

    describe('when there is an error when trying to get the id token from the cache', () => {
      let error: Error;

      beforeEach(() => {
        error = new Error('Test error');
        when(cacheManagerGet).calledWith(ACBS_ID_TOKEN_CACHE_KEY).mockRejectedValue(error);
      });

      it('logs that trying to get the id token from the cache failed at WARN level', async () => {
        await service.getIdToken();

        expect(loggerWarn).toHaveBeenCalledWith(error, errorDuringGettingCachedIdTokenLogMessage);
      });

      withTestsThatANewIdTokenIsRetrievedAndCached();
    });

    describe('when the idToken is in the cache', () => {
      beforeEach(() => {
        when(cacheManagerGet).calledWith(ACBS_ID_TOKEN_CACHE_KEY).mockResolvedValueOnce(cachedIdToken);
      });

      it('does not call the AcbsAuthenticationService', async () => {
        await service.getIdToken();

        expect(acbsAuthenticationServiceGetIdToken).toHaveBeenCalledTimes(0);
      });

      it('returns the cached id token', async () => {
        const idToken = await service.getIdToken();

        expect(idToken).toBe(cachedIdToken);
      });

      it('logs that an id token was retrieved from the cache at DEBUG level', async () => {
        await service.getIdToken();

        expect(loggerDebug).toHaveBeenCalledWith(usingIdCachedTokenLogMessage);
      });

      it('does NOT update the id token in the cache', async () => {
        await service.getIdToken();

        expect(cacheManagerSet).toHaveBeenCalledTimes(0);
      });

      it('does NOT log that an id token is being stored in the cache at DEBUG level', async () => {
        await service.getIdToken();

        expect(loggerDebug).not.toHaveBeenCalledWith(requestingNewIdTokenLogMessage);
      });
    });
  });
});
