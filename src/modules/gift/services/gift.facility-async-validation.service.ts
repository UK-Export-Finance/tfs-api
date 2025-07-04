import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { GiftFacilityCreationRequestDto } from '../dto';
import { generateArrayOfErrors, generateHighLevelErrors, generateOverviewErrors, mapEntitiesByField, stripPayload } from '../helpers';
import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftCurrencyService } from './gift.currency.service';
import { GiftFeeTypeService } from './gift.fee-type.service';
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
    private readonly counterpartyService: GiftCounterpartyService,
    private readonly currencyService: GiftCurrencyService,
    private readonly feeTypeService: GiftFeeTypeService,
    private readonly productTypeService: GiftProductTypeService,
  ) {
    this.counterpartyService = counterpartyService;
    this.currencyService = currencyService;
    this.feeTypeService = feeTypeService;
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

      const counterpartyRoles = await this.counterpartyService.getAllRoleCodes();

      const supportedCurrencies = await this.currencyService.getSupportedCurrencies();

      const isSupportedProductType = await this.productTypeService.isSupported(overview.productTypeCode);

      const feeTypeCodes = await this.feeTypeService.getAllFeeTypeCodes();

      const overviewErrors = generateOverviewErrors({
        isSupportedProductType,
        payload: overview,
        supportedCurrencies: supportedCurrencies.data,
      });

      const currencyErrors = generateHighLevelErrors({
        payload: stripPayload(payload, 'currency'),
        supportedValues: supportedCurrencies.data,
        fieldName: 'currency',
      });

      const counterpartyRoleErrors = generateArrayOfErrors({
        fieldValues: mapEntitiesByField(payload.counterparties, 'roleCode'),
        supportedValues: counterpartyRoles,
        fieldName: 'roleCode',
        parentEntityName: 'counterparties',
      });

      const feeTypeCodeErrors = generateArrayOfErrors({
        fieldValues: mapEntitiesByField(payload.fixedFees, 'feeTypeCode'),
        supportedValues: feeTypeCodes,
        fieldName: 'feeTypeCode',
        parentEntityName: 'fixedFees',
      });

      return [...overviewErrors, ...currencyErrors, ...counterpartyRoleErrors, ...feeTypeCodeErrors];
    } catch (error) {
      this.logger.error('Error validating a GIFT facility - async %s %o', facilityId, error);

      throw new Error(`Error validating a GIFT facility - async ${facilityId}`, error);
    }
  }
}
