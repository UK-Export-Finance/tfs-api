import { EXAMPLES } from '@ukef/constants';
import { mockResponse200, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { generateHighLevelErrors, generateOverviewErrors, mapEntitiesByField, stripPayload } from '../helpers';
import { generateArrayOfErrors } from '../helpers/async-validation/generate-errors';
import { GiftCounterpartyService, GiftCurrencyService, GiftProductTypeService } from '.';
import { GiftFacilityAsyncValidationService } from './gift.facility-async-validation.service';

const {
  GIFT: { CURRENCIES, FACILITY_CREATION_PAYLOAD: mockPayload, FACILITY_ID: mockFacilityId },
} = EXAMPLES;

describe('GiftFacilityAsyncValidationService', () => {
  const logger = new PinoLogger({});

  let currencyService: GiftCurrencyService;
  let productTypeService: GiftProductTypeService;
  let counterpartyService: GiftCounterpartyService;
  let service: GiftFacilityAsyncValidationService;

  let giftHttpService;
  let mockGetResponse;
  let mockGetSupportedCurrencies: jest.Mock;
  let mockProductTypeIsSupported: jest.Mock;
  let mockGetAllRoleCodes: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockGetResponse = mockResponse200(CURRENCIES);

    mockGetSupportedCurrencies = jest.fn().mockResolvedValueOnce(mockGetResponse);

    currencyService = new GiftCurrencyService(giftHttpService, logger);
    currencyService.getSupportedCurrencies = mockGetSupportedCurrencies;

    mockProductTypeIsSupported = jest.fn().mockResolvedValueOnce(true);

    productTypeService = new GiftProductTypeService(giftHttpService, logger);
    productTypeService.isSupported = mockProductTypeIsSupported;

    mockGetAllRoleCodes = jest.fn().mockResolvedValueOnce([]);

    counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    counterpartyService.getAllRoleCodes = mockGetAllRoleCodes;

    service = new GiftFacilityAsyncValidationService(logger, counterpartyService, currencyService, productTypeService);
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

    it('should call counterpartyService.getAllRoleCodes', async () => {
      // Act
      await service.creation(mockPayload, mockFacilityId);

      // Assert
      expect(mockGetAllRoleCodes).toHaveBeenCalledTimes(1);
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
          supportedValues: [],
          fieldName: 'roleCode',
          parentEntityName: 'counterparties',
        });

        const expected = [...overviewErrors, ...currencyErrors, ...counterpartyRoleErrors];

        expect(response).toEqual(expected);
      });
    });

    describe('when currencyService.getSupportedCurrencies returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockGetSupportedCurrencies = jest.fn().mockRejectedValueOnce(mockResponse500());

        currencyService.getSupportedCurrencies = mockGetSupportedCurrencies;

        service = new GiftFacilityAsyncValidationService(logger, counterpartyService, currencyService, productTypeService);
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

        service = new GiftFacilityAsyncValidationService(logger, counterpartyService, currencyService, productTypeService);
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
