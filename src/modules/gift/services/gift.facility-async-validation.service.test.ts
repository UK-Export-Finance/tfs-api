import { EXAMPLES } from '@ukef/constants';
import { mockResponse200, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import {
  generateArrayOfErrors,
  generateCounterpartySharePercentageErrors,
  generateHighLevelErrors,
  generateObligationSubtypeCodeErrors,
  generateOverviewErrors,
  mapEntitiesByField,
  stripPayload,
} from '../helpers';
import { GiftCounterpartyService, GiftCurrencyService, GiftFeeTypeService, GiftObligationSubtypeService, GiftProductTypeService } from '.';
import { GiftFacilityAsyncValidationService } from './gift.facility-async-validation.service';

const {
  GIFT: {
    COUNTERPARTY_ROLES_RESPONSE_DATA,
    CURRENCIES,
    FACILITY_CREATION_PAYLOAD: mockPayload,
    FACILITY_ID: mockFacilityId,
    OBLIGATION_SUBTYPES_RESPONSE_DATA,
  },
} = EXAMPLES;

const mockCounterpartyRoleCodes = [COUNTERPARTY_ROLES_RESPONSE_DATA.counterpartyRoles[0].code];

const mockObligationSubtypes = OBLIGATION_SUBTYPES_RESPONSE_DATA.obligationSubtypes;

describe('GiftFacilityAsyncValidationService', () => {
  const logger = new PinoLogger({});

  let counterpartyService: GiftCounterpartyService;
  let currencyService: GiftCurrencyService;
  let feeTypeService: GiftFeeTypeService;
  let productTypeService: GiftProductTypeService;
  let obligationSubtypeService: GiftObligationSubtypeService;
  let service: GiftFacilityAsyncValidationService;

  let giftHttpService;
  let mockGetSupportedCurrencies: jest.Mock;
  let mockGetAllFeeTypeCodes: jest.Mock;
  let mockProductTypeIsSupported: jest.Mock;
  let mockGetAllRoles: jest.Mock;
  let mockGetAllRoleCodes: jest.Mock;
  let mockGetAllByProductType: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockGetSupportedCurrencies = jest.fn().mockResolvedValueOnce(mockResponse200(CURRENCIES));

    currencyService = new GiftCurrencyService(giftHttpService, logger);
    currencyService.getSupportedCurrencies = mockGetSupportedCurrencies;

    mockGetAllFeeTypeCodes = jest.fn().mockResolvedValueOnce([]);
    feeTypeService = new GiftFeeTypeService(giftHttpService, logger);
    feeTypeService.getAllFeeTypeCodes = mockGetAllFeeTypeCodes;

    mockProductTypeIsSupported = jest.fn().mockResolvedValueOnce(true);

    productTypeService = new GiftProductTypeService(giftHttpService, logger);
    productTypeService.isSupported = mockProductTypeIsSupported;

    mockGetAllRoles = jest.fn().mockResolvedValueOnce({ data: COUNTERPARTY_ROLES_RESPONSE_DATA });
    mockGetAllRoleCodes = jest.fn().mockReturnValueOnce(mockCounterpartyRoleCodes);

    counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    counterpartyService.getAllRoles = mockGetAllRoles;
    counterpartyService.getAllRoleCodes = mockGetAllRoleCodes;

    obligationSubtypeService = new GiftObligationSubtypeService(giftHttpService, logger);
    mockGetAllByProductType = jest.fn().mockResolvedValueOnce(mockObligationSubtypes);
    obligationSubtypeService.getAllByProductType = mockGetAllByProductType;

    service = new GiftFacilityAsyncValidationService(
      logger,
      counterpartyService,
      currencyService,
      feeTypeService,
      obligationSubtypeService,
      productTypeService,
    );
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('creation', () => {
    it('should call currencyService.getSupportedCurrencies', async () => {
      // Act
      await service.creation(mockPayload, mockFacilityId);

      // Assert
      expect(mockGetSupportedCurrencies).toHaveBeenCalledTimes(1);
    });

    it('should call productTypeService.isSupported', async () => {
      // Act
      await service.creation(mockPayload, mockFacilityId);

      // Assert
      expect(mockProductTypeIsSupported).toHaveBeenCalledTimes(1);
      expect(mockProductTypeIsSupported).toHaveBeenCalledWith(mockPayload.overview.productTypeCode);
    });

    it('should call counterpartyService.getAllRoles', async () => {
      // Act
      await service.creation(mockPayload, mockFacilityId);

      // Assert
      expect(mockGetAllRoles).toHaveBeenCalledTimes(1);
    });

    it('should call counterpartyService.getAllRoleCodes', async () => {
      // Act
      await service.creation(mockPayload, mockFacilityId);

      // Assert
      expect(mockGetAllRoleCodes).toHaveBeenCalledTimes(1);
      expect(mockGetAllRoleCodes).toHaveBeenCalledWith(COUNTERPARTY_ROLES_RESPONSE_DATA.counterpartyRoles);
    });

    it('should call feeTypeService.getAllFeeTypeCodes', async () => {
      // Act
      await service.creation(mockPayload, mockFacilityId);

      // Assert
      expect(mockGetAllFeeTypeCodes).toHaveBeenCalledTimes(1);
    });

    it('should call obligationSubtypeService.getAllByProductType', async () => {
      // Act
      await service.creation(mockPayload, mockFacilityId);

      // Assert
      expect(mockGetAllByProductType).toHaveBeenCalledTimes(1);
      expect(mockGetAllByProductType).toHaveBeenCalledWith(mockPayload.overview.productTypeCode);
    });

    describe('when all service calls are successful', () => {
      it('should return validation errors from various helper functions', async () => {
        // Act
        const response = await service.creation(mockPayload, mockFacilityId);

        // Assert
        const overviewErrors = generateOverviewErrors({
          isSupportedProductType: true,
          payload: mockPayload.overview,
          supportedCurrencies: CURRENCIES,
        });

        const currencyErrors = generateHighLevelErrors({
          payload: stripPayload(mockPayload, 'currency'),
          supportedValues: CURRENCIES,
          fieldName: 'currency',
        });

        const counterpartyRoleErrors = generateArrayOfErrors({
          fieldValues: mapEntitiesByField(mockPayload.counterparties, 'roleCode'),
          supportedValues: mockCounterpartyRoleCodes,
          fieldName: 'roleCode',
          parentEntityName: 'counterparties',
        });

        const counterpartySharePercentageErrors = generateCounterpartySharePercentageErrors({
          counterpartyRoles: COUNTERPARTY_ROLES_RESPONSE_DATA.counterpartyRoles,
          providedCounterparties: mockPayload.counterparties,
        });

        const feeTypeCodeErrors = generateArrayOfErrors({
          fieldValues: mapEntitiesByField(mockPayload.fixedFees, 'feeTypeCode'),
          supportedValues: [],
          fieldName: 'feeTypeCode',
          parentEntityName: 'fixedFees',
        });

        const obligationSubtypeCodeErrors = generateObligationSubtypeCodeErrors({
          subtypes: mockObligationSubtypes,
          productTypeCode: mockPayload.overview.productTypeCode,
          providedObligations: mockPayload.obligations,
        });

        const expected = [
          ...overviewErrors,
          ...currencyErrors,
          ...counterpartyRoleErrors,
          ...counterpartySharePercentageErrors,
          ...feeTypeCodeErrors,
          ...obligationSubtypeCodeErrors,
        ];

        expect(response).toEqual(expected);
      });
    });

    describe('when feeTypeService.getAllFeeTypeCodes returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockGetAllFeeTypeCodes = jest.fn().mockRejectedValueOnce(mockResponse500());

        feeTypeService.getAllFeeTypeCodes = mockGetAllFeeTypeCodes;

        service = new GiftFacilityAsyncValidationService(
          logger,
          counterpartyService,
          currencyService,
          feeTypeService,
          obligationSubtypeService,
          productTypeService,
        );
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.creation(mockPayload, mockFacilityId);

        // Assert
        const expected = new Error(`Error validating a GIFT facility - async ${mockFacilityId}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });

    describe('when currencyService.getSupportedCurrencies returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockGetSupportedCurrencies = jest.fn().mockRejectedValueOnce(mockResponse500());

        currencyService.getSupportedCurrencies = mockGetSupportedCurrencies;

        service = new GiftFacilityAsyncValidationService(
          logger,
          counterpartyService,
          currencyService,
          feeTypeService,
          obligationSubtypeService,
          productTypeService,
        );
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.creation(mockPayload, mockFacilityId);

        // Assert
        const expected = new Error(`Error validating a GIFT facility - async ${mockFacilityId}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });

    describe('when productTypeService.isSupported returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockProductTypeIsSupported = jest.fn().mockRejectedValueOnce(mockResponse500());

        productTypeService.isSupported = mockProductTypeIsSupported;

        service = new GiftFacilityAsyncValidationService(
          logger,
          counterpartyService,
          currencyService,
          feeTypeService,
          obligationSubtypeService,
          productTypeService,
        );
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.creation(mockPayload, mockFacilityId);

        // Assert
        const expected = new Error(`Error validating a GIFT facility - async ${mockFacilityId}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });

    describe('when obligationSubtypeService.getAllByProductType returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockGetAllByProductType = jest.fn().mockRejectedValueOnce(mockResponse500());

        obligationSubtypeService.getAllByProductType = mockGetAllByProductType;

        service = new GiftFacilityAsyncValidationService(
          logger,
          counterpartyService,
          currencyService,
          feeTypeService,
          obligationSubtypeService,
          productTypeService,
        );
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.creation(mockPayload, mockFacilityId);

        // Assert
        const expected = new Error(`Error validating a GIFT facility - async ${mockFacilityId}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
