import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { AcbsConfig } from '@ukef/config/acbs.config';

import { AcbsConfigBaseUrlAndUseReturnExceptionHeader } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateDealDto } from './dto/acbs-create-deal.dto';
import { AcbsGetDealResponseDto } from './dto/acbs-get-deal-response.dto';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { postDealExistsKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostOrPutErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsDealService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(
    @Inject(AcbsConfig.KEY)
    config: AcbsConfigBaseUrlAndUseReturnExceptionHeader,
    httpService: HttpService,
    private readonly logger: PinoLogger,
  ) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async createDeal(portfolioIdentifier: string, newDeal: AcbsCreateDealDto, idToken: string): Promise<void> {
    const dealIdentifier = newDeal.DealIdentifier;

    this.logger.info('[ACBS] Initiating deal creation - ID: %s', dealIdentifier);

    try {
      await this.acbsHttpService.post<AcbsCreateDealDto>({
        path: this.getAcbsDealPath(portfolioIdentifier),
        requestBody: newDeal,
        idToken,
        onError: createWrapAcbsHttpPostOrPutErrorCallback({
          messageForUnknownError: `Failed to create a deal with identifier ${dealIdentifier} in ACBS.`,
          knownErrors: [postDealExistsKnownAcbsError(dealIdentifier)],
        }),
      });

      this.logger.info('[ACBS] Deal creation succeeded - ID: %s', dealIdentifier);
    } catch (error) {
      this.logger.error(
        '[ACBS] Deal creation failed - ID: %s, Error: %s, Type: %s',
        dealIdentifier,
        error instanceof Error ? error.message : String(error),
        error?.constructor?.name,
      );
      throw error;
    }
  }

  async getDealByIdentifier(portfolioIdentifier: string, dealIdentifier: string, idToken: string): Promise<AcbsGetDealResponseDto> {
    this.logger.info('[ACBS] Fetching deal - ID: %s', dealIdentifier);

    try {
      const { data: deal } = await this.acbsHttpService.get<AcbsGetDealResponseDto | null>({
        path: `${this.getAcbsDealPath(portfolioIdentifier)}/${dealIdentifier}`,
        idToken,
        onError: createWrapAcbsHttpGetErrorCallback({
          messageForUnknownError: `Failed to get the deal with identifier ${dealIdentifier}.`,
          knownErrors: [],
        }),
      });

      if (deal) {
        this.logger.info('[ACBS] Deal fetch succeeded - ID: %s', dealIdentifier);
        return deal;
      }

      this.logger.warn('[ACBS] Deal not found - ID: %s', dealIdentifier);
      throw new AcbsResourceNotFoundException(`Deal with identifier ${dealIdentifier} was not found by ACBS.`);
    } catch (error) {
      if (error instanceof AcbsResourceNotFoundException) {
        throw error;
      }
      this.logger.error(
        '[ACBS] Deal fetch failed - ID: %s, Error: %s, Type: %s',
        dealIdentifier,
        error instanceof Error ? error.message : String(error),
        error?.constructor?.name,
      );
      throw error;
    }
  }

  private getAcbsDealPath(portfolioIdentifier: string): string {
    return `/Portfolio/${portfolioIdentifier}/Deal`;
  }
}
