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
    const startTime = Date.now();

    this.logger.info(
      {
        dealIdentifier,
        portfolioIdentifier,
        dealValue: newDeal.MemoLimitAmount,
        timestamp: new Date().toISOString(),
      },
      '[ACBS] Initiating deal creation request',
    );

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

      const duration = Date.now() - startTime;
      this.logger.info(
        {
          dealIdentifier,
          portfolioIdentifier,
          durationMs: duration,
          timestamp: new Date().toISOString(),
        },
        '[ACBS] Deal creation succeeded',
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        {
          dealIdentifier,
          portfolioIdentifier,
          durationMs: duration,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorType: error?.constructor?.name,
          timestamp: new Date().toISOString(),
        },
        '[ACBS] Deal creation failed',
      );
      throw error;
    }
  }

  async getDealByIdentifier(portfolioIdentifier: string, dealIdentifier: string, idToken: string): Promise<AcbsGetDealResponseDto> {
    const startTime = Date.now();

    this.logger.debug(
      {
        dealIdentifier,
        portfolioIdentifier,
        timestamp: new Date().toISOString(),
      },
      '[ACBS] Fetching deal by identifier',
    );

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
        const duration = Date.now() - startTime;
        this.logger.debug(
          {
            dealIdentifier,
            portfolioIdentifier,
            durationMs: duration,
            timestamp: new Date().toISOString(),
          },
          '[ACBS] Deal fetch succeeded',
        );
        return deal;
      }

      const duration = Date.now() - startTime;
      this.logger.warn(
        {
          dealIdentifier,
          portfolioIdentifier,
          durationMs: duration,
          timestamp: new Date().toISOString(),
        },
        '[ACBS] Deal not found in ACBS',
      );

      throw new AcbsResourceNotFoundException(`Deal with identifier ${dealIdentifier} was not found by ACBS.`);
    } catch (error) {
      const duration = Date.now() - startTime;
      if (error instanceof AcbsResourceNotFoundException) {
        throw error;
      }
      this.logger.error(
        {
          dealIdentifier,
          portfolioIdentifier,
          durationMs: duration,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorType: error?.constructor?.name,
          timestamp: new Date().toISOString(),
        },
        '[ACBS] Deal fetch failed',
      );
      throw error;
    }
  }

  private getAcbsDealPath(portfolioIdentifier: string): string {
    return `/Portfolio/${portfolioIdentifier}/Deal`;
  }
}
