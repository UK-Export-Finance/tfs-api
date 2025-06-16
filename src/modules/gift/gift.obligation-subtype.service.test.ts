import { HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { mockResponse200, mockResponse404, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftObligationSubtypeService } from './gift.obligation-subtype.service';

const { OBLIGATION_SUBTYPES, PRODUCT_TYPE_CODES } = GIFT;

const { PATH } = GIFT;

const mockProductCode = PRODUCT_TYPE_CODES.EXIP;
const mockSubtypeCode = OBLIGATION_SUBTYPES.EXP01.code;

describe('GiftObligationSubtypeService', () => {
  const logger = new PinoLogger({});

  let httpService: HttpService;
  let service: GiftObligationSubtypeService;

  let giftHttpService;
  let mockGetOneResponse;
  let mockHttpServiceGet: jest.Mock;
  let mockGetOne: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockGetOneResponse = mockResponse200(OBLIGATION_SUBTYPES.EXP01);

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockGetOneResponse);

    httpService.get = mockHttpServiceGet;

    giftHttpService = {
      get: mockHttpServiceGet,
    };

    service = new GiftObligationSubtypeService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('createOne', () => {
    it('should call giftHttpService.get', async () => {
      // Act
      await service.getOne(mockSubtypeCode);

      // Assert
      expect(mockHttpServiceGet).toHaveBeenCalledTimes(1);

      expect(mockHttpServiceGet).toHaveBeenCalledWith({
        path: `${PATH.OBLIGATION_SUBTYPE}/${mockSubtypeCode}`,
      });
    });

    describe('when giftHttpService.get is successful', () => {
      it('should return the response of giftHttpService.get', async () => {
        // Act
        const response = await service.getOne(mockSubtypeCode);

        // Assert
        expect(response).toEqual(mockGetOneResponse);
      });
    });

    describe('when giftHttpService.get returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockHttpServiceGet = jest.fn().mockRejectedValueOnce(mockResponse500());

        giftHttpService.get = mockHttpServiceGet;

        service = new GiftObligationSubtypeService(giftHttpService, logger);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.getOne(mockSubtypeCode);

        // Assert
        const expected = new Error(`Error getting obligation subtype ${mockSubtypeCode}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('isSupported', () => {
    beforeEach(() => {
      // Arrange
      service = new GiftObligationSubtypeService(giftHttpService, logger);

      mockGetOne = jest.fn().mockResolvedValueOnce(mockResponse200(OBLIGATION_SUBTYPES.EXP01));

      service.getOne = mockGetOne;
    });

    it('should call service.getOne', async () => {
      // Act
      await service.isSupported(mockProductCode, mockSubtypeCode);

      // Assert
      expect(mockGetOne).toHaveBeenCalledTimes(1);

      expect(mockGetOne).toHaveBeenCalledWith(mockSubtypeCode);
    });

    describe(`when service.getOne returns ${HttpStatus.OK} and the response contains the provided product code`, () => {
      it('should return true', async () => {
        // Act
        const response = await service.isSupported(mockProductCode, mockSubtypeCode);

        // Assert
        expect(response).toBe(true);
      });
    });

    describe(`when service.getOne returns ${HttpStatus.OK} and the response does NOT contain the provided product code`, () => {
      it('should return false', async () => {
        // Arrange
        mockGetOne = jest.fn().mockResolvedValueOnce(mockResponse200(OBLIGATION_SUBTYPES.BIP02));

        service.getOne = mockGetOne;

        // Act
        const response = await service.isSupported(mockProductCode, OBLIGATION_SUBTYPES.EXP01.code);

        // Assert
        expect(response).toBe(false);
      });
    });

    describe(`when service.getOne does NOT return ${HttpStatus.OK}`, () => {
      it('should return false', async () => {
        // Arrange
        mockGetOne = jest.fn().mockResolvedValueOnce(mockResponse404());

        service = new GiftObligationSubtypeService(giftHttpService, logger);

        service.getOne = mockGetOne;

        // Act
        const response = await service.isSupported(mockProductCode, mockSubtypeCode);

        // Assert
        expect(response).toBe(false);
      });
    });

    describe('when service.getOne returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockGetOne = jest.fn().mockRejectedValueOnce(mockResponse500());

        service = new GiftObligationSubtypeService(giftHttpService, logger);

        service.getOne = mockGetOne;
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.isSupported(mockProductCode, mockSubtypeCode);

        // Assert
        const expected = new Error(`Error checking if obligation subtype code ${mockSubtypeCode} is supported for product type ${mockProductCode}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
