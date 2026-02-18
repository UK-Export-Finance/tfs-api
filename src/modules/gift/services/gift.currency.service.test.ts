import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftCurrencyService } from './gift.currency.service';

const { PATH } = GIFT;

describe('GiftCurrencyService', () => {
  const logger = new PinoLogger({});

  let service: GiftCurrencyService;

  let giftHttpService;
  let mockGetResponse;
  let mockHttpServiceGet: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockGetResponse = mockResponse201(EXAMPLES.GIFT.CURRENCIES);

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockGetResponse);

    giftHttpService = {
      get: mockHttpServiceGet,
    };

    service = new GiftCurrencyService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('createOne', () => {
    it('should call giftHttpService.get', async () => {
      // Act
      await service.getSupportedCurrencies();

      // Assert
      expect(mockHttpServiceGet).toHaveBeenCalledTimes(1);

      expect(mockHttpServiceGet).toHaveBeenCalledWith({ path: PATH.CURRENCY });
    });

    describe('when giftHttpService.get is successful', () => {
      it('should return the response of giftHttpService.get', async () => {
        // Act
        const response = await service.getSupportedCurrencies();

        // Assert
        expect(response).toEqual(mockGetResponse);
      });
    });

    describe('when giftHttpService.get returns an error', () => {
      const mockError = mockResponse500();

      beforeEach(() => {
        // Arrange
        mockHttpServiceGet = jest.fn().mockRejectedValueOnce(mockError);

        giftHttpService.get = mockHttpServiceGet;

        service = new GiftCurrencyService(giftHttpService, logger);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.getSupportedCurrencies();

        // Assert
        const expected = new Error('Error getting supported currencies', { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
