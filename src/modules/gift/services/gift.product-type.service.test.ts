import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse200, mockResponse404, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftProductTypeService } from './gift.product-type.service';

const { PATH, PRODUCT_TYPE_CODES } = GIFT;

describe('GiftProductTypeService', () => {
  const logger = new PinoLogger({});

  let service: GiftProductTypeService;

  let giftHttpService;
  let mockGetResponse;
  let mockHttpServiceGet: jest.Mock;
  let mockGetOne: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockGetResponse = mockResponse200(EXAMPLES.GIFT.PRODUCT_TYPE_RESPONSE_DATA);

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockGetResponse);

    giftHttpService = {
      get: mockHttpServiceGet,
    };

    service = new GiftProductTypeService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('getOne', () => {
    it('should call giftHttpService.get', async () => {
      // Act
      await service.getOne(PRODUCT_TYPE_CODES.EXIP);

      // Assert
      expect(mockHttpServiceGet).toHaveBeenCalledTimes(1);

      expect(mockHttpServiceGet).toHaveBeenCalledWith({ path: `${PATH.PRODUCT_TYPE}/${PRODUCT_TYPE_CODES.EXIP}` });
    });

    describe('when giftHttpService.get is successful', () => {
      it('should return the response of giftHttpService.get', async () => {
        // Act
        const response = await service.getOne(PRODUCT_TYPE_CODES.EXIP);

        // Assert
        expect(response).toEqual(mockGetResponse);
      });
    });

    describe('when giftHttpService.get returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockHttpServiceGet = jest.fn().mockRejectedValueOnce(mockResponse500());

        giftHttpService.get = mockHttpServiceGet;

        service = new GiftProductTypeService(giftHttpService, logger);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.getOne(PRODUCT_TYPE_CODES.EXIP);

        // Assert
        const expected = new Error(`Error getting product type ${PRODUCT_TYPE_CODES.EXIP}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('isSupported', () => {
    beforeEach(() => {
      // Arrange
      service = new GiftProductTypeService(giftHttpService, logger);

      mockGetOne = jest.fn().mockResolvedValueOnce(mockResponse200());

      service.getOne = mockGetOne;
    });

    it('should call service.getOne', async () => {
      // Act
      await service.isSupported(PRODUCT_TYPE_CODES.EXIP);

      // Assert
      expect(mockGetOne).toHaveBeenCalledTimes(1);

      expect(mockGetOne).toHaveBeenCalledWith(PRODUCT_TYPE_CODES.EXIP);
    });

    describe(`when service.getOne returns ${HttpStatus.OK}`, () => {
      it('should return true', async () => {
        // Act
        const response = await service.isSupported(PRODUCT_TYPE_CODES.EXIP);

        // Assert
        expect(response).toBe(true);
      });
    });

    describe(`when service.getOne does NOT return ${HttpStatus.OK}`, () => {
      it('should return false', async () => {
        // Arrange
        mockGetOne = jest.fn().mockResolvedValueOnce(mockResponse404());

        service = new GiftProductTypeService(giftHttpService, logger);

        service.getOne = mockGetOne;

        // Act
        const response = await service.isSupported(PRODUCT_TYPE_CODES.EXIP);

        // Assert
        expect(response).toBe(false);
      });
    });

    describe('when service.getOne returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockGetOne = jest.fn().mockRejectedValueOnce(mockResponse500());

        service = new GiftProductTypeService(giftHttpService, logger);

        service.getOne = mockGetOne;
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.isSupported(PRODUCT_TYPE_CODES.EXIP);

        // Assert
        const expected = new Error(`Error checking if product type ${PRODUCT_TYPE_CODES.EXIP} is supported`);

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
