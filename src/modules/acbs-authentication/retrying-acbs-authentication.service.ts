import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsAuthenticationConfig from '@ukef/config/acbs-authentication.config';
import { waitFor } from '@ukef/helpers/wait-for.helper';
import { PinoLogger } from 'nestjs-pino';

import { AcbsAuthenticationService } from './acbs-authentication.service';
import { BaseAcbsAuthenticationServiceInjectionKey } from './base-acbs-authentication.service';

type RequiredConfigKeys = 'maxNumberOfRetries' | 'retryDelayInMilliseconds';

export class RetryingAcbsAuthenticationService extends AcbsAuthenticationService {
  constructor(
    @Inject(AcbsAuthenticationConfig.KEY)
    private readonly config: Pick<ConfigType<typeof AcbsAuthenticationConfig>, RequiredConfigKeys>,
    @Inject(BaseAcbsAuthenticationServiceInjectionKey)
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly logger: PinoLogger,
  ) {
    super();
  }

  getIdToken(): Promise<string> {
    return this.getIdTokenWithRetry();
  }

  private async getIdTokenWithRetry(retryNumber = 0): Promise<string> {
    try {
      return await this.acbsAuthenticationService.getIdToken();
    } catch (error) {
      retryNumber += 1;
      if (retryNumber > this.config.maxNumberOfRetries) {
        throw error;
      }
      this.logRetryAttempt({ error, retryNumber });
      await waitFor(this.config.retryDelayInMilliseconds);
      return await this.getIdTokenWithRetry(retryNumber);
    }
  }

  private logRetryAttempt({ error, retryNumber }: { error: unknown; retryNumber: number }): void {
    this.logger.warn(error, `Failed to get an ACBS authentication id token - retrying the request now (retry attempt ${retryNumber}).`);
  }
}

export const RetryingAcbsAuthenticationServiceInjectionKey = Symbol(RetryingAcbsAuthenticationService.name);
