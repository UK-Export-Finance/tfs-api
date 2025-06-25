import { EXAMPLES } from '@ukef/constants';
import { mockResponse200, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftCurrencyService } from './gift.currency.service';
import { GiftFacilityAsyncValidationService } from './gift.facility-async-validation.service';
import { generateOverviewValidationErrors, generateValidationErrors, stripPayload } from './helpers';

const {
  GIFT: { CURRENCIES, FACILITY_CREATION_PAYLOAD: mockPayload, FACILITY_ID: mockFacilityId },
} = EXAMPLES;

describe('GiftFacilityAsyncValidationService', () => {
  const logger = new PinoLogger({});

  let currencyService: GiftCurrencyService;
  let service: GiftFacilityAsyncValidationService;

  let giftHttpService;
  let mockGetResponse;
  let mockGetSupportedCurrencies: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockGetResponse = mockResponse200(CURRENCIES);

    mockGetSupportedCurrencies = jest.fn().mockResolvedValueOnce(mockGetResponse);

    currencyService = new GiftCurrencyService(giftHttpService, logger);

    currencyService.getSupportedCurrencies = mockGetSupportedCurrencies;

    service = new GiftFacilityAsyncValidationService(logger, currencyService);
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

    describe('when currencyService.getSupportedCurrencies is successful', () => {
      it('should return validation errors from various helper functions', async () => {
        // Act
        const response = await service.creation(mockPayload, mockFacilityId);

        // Assert
        const overviewErrs = generateOverviewValidationErrors(mockPayload.overview, CURRENCIES);

        const currencyErrors = generateValidationErrors({
          payload: stripPayload(mockPayload, 'currency'),
          supportedValues: CURRENCIES,
          fieldName: 'currency',
        });

        const expected = [...overviewErrs, ...currencyErrors];

        expect(response).toEqual(expected);
      });
    });

    describe('when currencyService.getSupportedCurrencies returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockGetSupportedCurrencies = jest.fn().mockRejectedValueOnce(mockResponse500());

        currencyService.getSupportedCurrencies = mockGetSupportedCurrencies;

        service = new GiftFacilityAsyncValidationService(logger, currencyService);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.creation(mockPayload, mockFacilityId);

        // Assert
        const expected = new Error(`Error validating a GIFT facility (async) ${mockFacilityId}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
