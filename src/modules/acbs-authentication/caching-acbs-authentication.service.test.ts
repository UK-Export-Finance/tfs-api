import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { Cache } from 'cache-manager';
import { when } from 'jest-when';
import { PinoLogger } from 'nestjs-pino';

import { ACBS_ID_TOKEN_CACHE_KEY } from './acbs-id-token.cache-key';
import { BaseAcbsAuthenticationService } from './base-acbs-authentication.service';
import { CachingAcbsAuthenticationService } from './caching-acbs-authentication.service';

describe('CachingAcbsAuthenticationService', () => {
  const valueGenerator = new RandomValueGenerator();
  const ttlInMilliseconds = valueGenerator.nonnegativeInteger();
  const newIdToken = valueGenerator.string();
  const cachedIdToken = valueGenerator.string();

  const usingIdCachedTokenLogMessage = 'Using the cached ACBS authentication id token.';
  const requestingNewIdTokenLogMessage = 'Requesting a new ACBS authentication id token.';

  let acbsAuthenticationServiceGetIdToken: jest.Mock;
  let cacheManagerGet: jest.Mock;
  let cacheManagerSet: jest.Mock;
  let loggerDebug: jest.Mock;
  let service: CachingAcbsAuthenticationService;

  beforeEach(() => {
    acbsAuthenticationServiceGetIdToken = jest.fn();
    const acbsAuthenticationService = new BaseAcbsAuthenticationService(null, null, null);
    acbsAuthenticationService.getIdToken = acbsAuthenticationServiceGetIdToken;
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
    };

    const logger = new PinoLogger({});
    loggerDebug = jest.fn();
    logger.debug = loggerDebug;

    service = new CachingAcbsAuthenticationService(
      { authentication: { idTokenCacheTtlInMilliseconds: ttlInMilliseconds } },
      acbsAuthenticationService,
      cacheManager,
      logger,
    );
  });

  describe('getIdToken', () => {
    describe('when the idToken is not in the cache', () => {
      beforeEach(() => {
        when(cacheManagerGet).calledWith(ACBS_ID_TOKEN_CACHE_KEY).mockResolvedValueOnce(null);
      });

      it('calls the AcbsAuthenticationService', async () => {
        await service.getIdToken();

        expect(acbsAuthenticationServiceGetIdToken).toHaveBeenCalledTimes(1);
      });

      it('returns a new id token from the AcbsAuthenticationService', async () => {
        const idToken = await service.getIdToken();

        expect(idToken).toBe(newIdToken);
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
