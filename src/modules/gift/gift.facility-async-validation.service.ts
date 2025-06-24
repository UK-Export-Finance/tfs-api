import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { GiftFacilityCreationRequestDto } from './dto';
import { GiftCurrencyService } from './gift.currency.service';
import { generateOverviewValidationErrors, generateValidationErrors, stripPayload } from './helpers';

// TODO: rename to async validation?

/**
 * GIFT facility validation service.
 * This is responsible for all manual, asynchronous facility validations.
 * The reason for doing this, instead of custom, async NestJS decorators, is that:
 * 1) Such custom decorators can end up unnecessarily making the same API calls multiple times.
 * 2) Async NestJS validation decorators are not entirely suitable for our requirements.
 * 3) Custom validation gives us complete control and optimisation.
 */
@Injectable()
export class GiftFacilityAsyncValidationService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly currencyService: GiftCurrencyService,
  ) {
    this.currencyService = currencyService;
  }

  async creation(payload: GiftFacilityCreationRequestDto, facilityId: string) {
    try {
      this.logger.info('Validating a GIFT facility (async) %s', facilityId);

      const supportedCurrencies = await this.currencyService.getSupportedCurrencies();

      const overviewErrs = generateOverviewValidationErrors(payload.overview, supportedCurrencies.data);

      const payloadCurrencies = stripPayload(payload, 'currency');

      const currencyErrors = generateValidationErrors(payloadCurrencies, supportedCurrencies.data, 'currency');

      return [...overviewErrs, ...currencyErrors];
    } catch (error) {
      this.logger.error('Error validating a GIFT facility (async) %s %o', facilityId, error);

      throw new Error(`Error validating a GIFT facility (async) ${facilityId}`, error);
    }
  }
}
