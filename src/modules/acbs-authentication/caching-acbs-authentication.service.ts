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

  async getIdToken(): Promise<string> {
    const cachedIdToken = await this.getIdTokenFromCache();

    if (cachedIdToken !== null && cachedIdToken !== undefined) {
      // TODO APIM-97: fallback on error?
      this.logger.debug('Using the cached ACBS authentication id token.');
      return cachedIdToken;
    }

    this.logger.debug('Requesting a new ACBS authentication id token.');
    const newIdToken = await this.getNewIdToken();
    this.storeIdTokenInCache(newIdToken);
    return newIdToken;
  }

  private getIdTokenFromCache(): Promise<string> {
    return this.cacheManager.get<string>(ACBS_ID_TOKEN_CACHE_KEY);
  }

  private getNewIdToken(): Promise<string> {
    return this.baseAcbsAuthenticationService.getIdToken();
  }

  private storeIdTokenInCache(idToken: string): void {
    this.cacheManager.set(ACBS_ID_TOKEN_CACHE_KEY, idToken, this.config.idTokenCacheTtlInMilliseconds);
  }
}
