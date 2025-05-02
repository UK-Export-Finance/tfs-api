import { HttpService } from '@nestjs/axios';
import { GIFT } from '@ukef/constants';
import { CURRENCIES } from '@ukef/constants/currencies.constant';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';

import { GiftCurrencyService } from './gift.currency.service';

const { PATH } = GIFT;

const mockCurrencies = [CURRENCIES.EUR, CURRENCIES.GBP];

describe('GiftCurrencyService', () => {
  let httpService: HttpService;
  let service: GiftCurrencyService;

  let giftHttpService;
  let mockGetResponse;
  let mockHttpServiceGet: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockGetResponse = mockResponse201(mockCurrencies);

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockGetResponse);

    httpService.get = mockHttpServiceGet;

    giftHttpService = {
      get: mockHttpServiceGet,
    };

    service = new GiftCurrencyService(giftHttpService);
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
      beforeEach(() => {
        // Arrange
        mockHttpServiceGet = jest.fn().mockRejectedValueOnce(mockResponse500());

        giftHttpService.get = mockHttpServiceGet;

        service = new GiftCurrencyService(giftHttpService);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.getSupportedCurrencies();

        // Assert
        const expected = new Error('Error getting supported currencies');

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
