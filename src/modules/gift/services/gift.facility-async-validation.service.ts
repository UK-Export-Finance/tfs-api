import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { GiftFacilityCreationRequestDto } from '../dto';
import { generateOverviewValidationErrors, generateValidationErrors, stripPayload } from '../helpers';
import { GiftCurrencyService } from './gift.currency.service';
import { GiftProductTypeService } from './gift.product-type.service';

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
    private readonly productTypeService: GiftProductTypeService,
  ) {
    this.currencyService = currencyService;
    this.productTypeService = productTypeService;
  }

  /**
   * Custom async validation for GIFT facility creation
   * @param {GiftFacilityCreationRequestDto} payload: The facility creation payload
   * @param {String} facilityId: Facility ID
   * @returns {Object}
   */
  async creation(payload: GiftFacilityCreationRequestDto, facilityId: string) {
    try {
      this.logger.info('Validating a GIFT facility - async %s', facilityId);

      const { overview } = payload;

      const supportedCurrencies = await this.currencyService.getSupportedCurrencies();

      const isSupportedProductType = await this.productTypeService.isSupported(overview.productTypeCode);

      const overviewErrors = generateOverviewValidationErrors({
        isSupportedProductType,
        payload: overview,
        supportedCurrencies: supportedCurrencies.data,
      });

      const payloadCurrencies = stripPayload(payload, 'currency');

      const currencyErrors = generateValidationErrors({
        payload: payloadCurrencies,
        supportedValues: supportedCurrencies.data,
        fieldName: 'currency',
      });

      return [...overviewErrors, ...currencyErrors];
    } catch (error) {
      this.logger.error('Error validating a GIFT facility - async %s %o', facilityId, error);

      throw new Error(`Error validating a GIFT facility - async ${facilityId}`, error);
    }
  }
}
