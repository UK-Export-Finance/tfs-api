import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsAuthenticationConfig from '@ukef/config/acbs-authentication.config';
import { Cache } from 'cache-manager';
import { PinoLogger } from 'nestjs-pino';

import { AcbsAuthenticationService } from './acbs-authentication.service';
import { ACBS_ID_TOKEN_CACHE_KEY } from './acbs-id-token.cache-key';
import { BaseAcbsAuthenticationService } from './base-acbs-authentication.service';

type RequiredConfigKeys = 'idTokenCacheTtlInMilliseconds';

@Injectable()
export class CachingAcbsAuthenticationService extends AcbsAuthenticationService {
  constructor(
    @Inject(AcbsAuthenticationConfig.KEY)
    private readonly config: Pick<ConfigType<typeof AcbsAuthenticationConfig>, RequiredConfigKeys>,
    private readonly baseAcbsAuthenticationService: BaseAcbsAuthenticationService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly logger: PinoLogger,
  ) {
    super();
  }

  getIdToken(): Promise<string> {
    return this.tryGetCachedIdToken({
      onError: (error: unknown) => this.logger.warn(error, 'An error occurred when trying to get the id token from the cache. A new token will be requested.'),
      onCachedIdTokenNotRetrieved: async () => {
        const newIdToken = await this.getNewIdToken();
        this.tryStoreIdTokenInCache(newIdToken);
        return newIdToken;
      },
    });
  }

  private async tryGetCachedIdToken({
    onError,
    onCachedIdTokenNotRetrieved,
  }: {
    onError: (error: unknown) => void;
    onCachedIdTokenNotRetrieved: () => Promise<string>;
  }): Promise<string> {
    try {
      const cachedIdToken = await this.cacheManager.get<string>(ACBS_ID_TOKEN_CACHE_KEY);

      if (cachedIdToken !== null && cachedIdToken !== undefined) {
        this.logger.debug('Using the cached ACBS authentication id token.');
        return cachedIdToken;
      }
    } catch (error) {
      onError(error);
    }

    return await onCachedIdTokenNotRetrieved();
  }

  private getNewIdToken(): Promise<string> {
    this.logger.debug('Requesting a new ACBS authentication id token.');
    return this.baseAcbsAuthenticationService.getIdToken();
  }

  private async tryStoreIdTokenInCache(idToken: string): Promise<void> {
    // TODO APIM-97: a ttl of 0 caches the value permanently - should we disable this?
    // TODO APIM-97: should we allow caching to be turned off?
    try {
      await this.cacheManager.set(ACBS_ID_TOKEN_CACHE_KEY, idToken, this.config.idTokenCacheTtlInMilliseconds);
    } catch (error) {
      this.logger.warn(error, 'An error occurred when trying to store the id token in the cache. The new token will be used without storing it in the cache.');
    }
  }
}
