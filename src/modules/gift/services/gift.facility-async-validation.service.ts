import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { GiftFacilityCreationRequestDto } from '../dto';
import {
  generateArrayOfErrors,
  generateCounterpartySharePercentageErrors,
  generateHighLevelErrors,
  generateObligationSubtypeCodeErrors,
  generateOverviewErrors,
  mapEntitiesByField,
  stripPayload,
} from '../helpers';
import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftCurrencyService } from './gift.currency.service';
import { GiftFeeTypeService } from './gift.fee-type.service';
import { GiftObligationSubtypeService } from './gift.obligation-subtype.service';
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
    private readonly obligationSubtypeService: GiftObligationSubtypeService,
    private readonly productTypeService: GiftProductTypeService,
  ) {
    this.counterpartyService = counterpartyService;
    this.currencyService = currencyService;
    this.feeTypeService = feeTypeService;
    this.obligationSubtypeService = obligationSubtypeService;
    this.productTypeService = productTypeService;
  }

  /**
   * Custom async validation for GIFT facility creation
   * @param {GiftFacilityCreationRequestDto} payload: The facility creation payload
   * @param {string} facilityId: Facility ID
   * @returns {object}
   */
  async creation(payload: GiftFacilityCreationRequestDto, facilityId: string) {
    try {
      this.logger.info('Validating a GIFT facility - async %s', facilityId);

      const { overview } = payload;

      const { productTypeCode } = overview;

      const {
        data: { counterpartyRoles },
      } = await this.counterpartyService.getAllRoles();

      const counterpartyRoleCodes = this.counterpartyService.getAllRoleCodes(counterpartyRoles);

      const feeTypeCodes = await this.feeTypeService.getAllFeeTypeCodes();

      const isSupportedProductType = await this.productTypeService.isSupported(productTypeCode);

      const supportedCurrencies = await this.currencyService.getSupportedCurrencies();

      const supportedObligationSubtypes = await this.obligationSubtypeService.getAllByProductType(productTypeCode);

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
        supportedValues: counterpartyRoleCodes,
        fieldName: 'roleCode',
        parentEntityName: 'counterparties',
      });

      const counterpartySharePercentageErrors = generateCounterpartySharePercentageErrors({
        counterpartyRoles,
        providedCounterparties: payload.counterparties,
      });

      const feeTypeCodeErrors = generateArrayOfErrors({
        fieldValues: mapEntitiesByField(payload.fixedFees, 'feeTypeCode'),
        supportedValues: feeTypeCodes,
        fieldName: 'feeTypeCode',
        parentEntityName: 'fixedFees',
      });

      const obligationSubtypeCodeErrors = generateObligationSubtypeCodeErrors({
        subtypes: supportedObligationSubtypes,
        productTypeCode,
        providedObligations: payload.obligations,
      });

      return [
        ...overviewErrors,
        ...currencyErrors,
        ...counterpartyRoleErrors,
        ...counterpartySharePercentageErrors,
        ...feeTypeCodeErrors,
        ...obligationSubtypeCodeErrors,
      ];
    } catch (error) {
      this.logger.error('Error validating a GIFT facility - async %s %o', facilityId, error);

      throw new Error(`Error validating a GIFT facility - async ${facilityId}`, { cause: error });
    }
  }
}
