import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftFeeTypeService } from './gift.fee-type.service';

const { PATH } = GIFT;

describe('GiftFeeTypeService', () => {
  const logger = new PinoLogger({});

  let httpService: HttpService;
  let service: GiftFeeTypeService;

  let giftHttpService;
  let mockGetResponse;
  let mockHttpServiceGet: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockGetResponse = mockResponse201(EXAMPLES.GIFT.FEE_TYPES_RESPONSE_DATA);

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockGetResponse);

    httpService.get = mockHttpServiceGet;

    giftHttpService = {
      get: mockHttpServiceGet,
    };

    service = new GiftFeeTypeService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('getSupportedFeeTypes', () => {
    it('should call giftHttpService.get', async () => {
      // Act
      await service.getSupportedFeeTypes();

      // Assert
      expect(mockHttpServiceGet).toHaveBeenCalledTimes(1);

      expect(mockHttpServiceGet).toHaveBeenCalledWith({ path: PATH.FEE_TYPE });
    });

    describe('when giftHttpService.get is successful', () => {
      it('should return the response of giftHttpService.get', async () => {
        // Act
        const response = await service.getSupportedFeeTypes();

        // Assert
        expect(response).toEqual(mockGetResponse);
      });
    });

    describe('when giftHttpService.get returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockHttpServiceGet = jest.fn().mockRejectedValueOnce(mockResponse500());

        giftHttpService.get = mockHttpServiceGet;

        service = new GiftFeeTypeService(giftHttpService, logger);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.getSupportedFeeTypes();

        // Assert
        const expected = new Error('Error getting supported fee types');

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
