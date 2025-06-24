import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { GiftFacilityCreationRequestDto } from './dto';
import { GiftCurrencyService } from './gift.currency.service';
import { generateOverviewValidationErrors, generateValidationErrors, stripPayload } from './helpers';

// TODO: rename to async validation?

// /**
//  * GIFT facility service.
//  * This is responsible for all facility operations that call the GIFT API.
//  */
@Injectable()
export class GiftFacilityValidationService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly currencyService: GiftCurrencyService,
  ) {
    this.currencyService = currencyService;
  }

  async creation(payload: GiftFacilityCreationRequestDto) {
    try {
      const supportedCurrencies = await this.currencyService.getSupportedCurrencies();

      const overviewErrs = generateOverviewValidationErrors(payload.overview, supportedCurrencies.data);

      const payloadCurrencies = stripPayload(payload, 'currency');

      const currencyErrors = generateValidationErrors(payloadCurrencies, supportedCurrencies.data, 'currency');

      return [...overviewErrs, ...currencyErrors];
    } catch {
      throw new Error('oh no ');
    }
  }
}
