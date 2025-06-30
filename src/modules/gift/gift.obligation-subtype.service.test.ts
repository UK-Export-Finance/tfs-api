import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse200, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftObligationSubtypeService } from './gift.obligation-subtype.service';

const { OBLIGATION_SUBTYPES, PATH, PRODUCT_TYPE_CODES } = GIFT;

const {
  GIFT: { FACILITY_ID: mockFacilityId, OBLIGATION },
} = EXAMPLES;

const mockProductCode = PRODUCT_TYPE_CODES.EXIP;

describe('GiftObligationSubtypeService', () => {
  const logger = new PinoLogger({});

  let httpService: HttpService;
  let service: GiftObligationSubtypeService;

  let giftHttpService;
  let mockGetAllResponse;
  let mockHttpServiceGet: jest.Mock;
  let mockGetAll: jest.Mock;
  let mockGetAllByProductType: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockGetAllResponse = mockResponse200({ obligationSubtypes: Object.values(OBLIGATION_SUBTYPES) });

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockGetAllResponse);

    httpService.get = mockHttpServiceGet;

    giftHttpService = {
      get: mockHttpServiceGet,
    };

    service = new GiftObligationSubtypeService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('getAll', () => {
    it('should call giftHttpService.get', async () => {
      // Act
      await service.getAll();

      // Assert
      expect(mockHttpServiceGet).toHaveBeenCalledTimes(1);

      expect(mockHttpServiceGet).toHaveBeenCalledWith({
        path: PATH.OBLIGATION_SUBTYPE,
      });
    });

    it('should return the response of giftHttpService.get', async () => {
      // Act
      const response = await service.getAll();

      // Assert
      expect(response).toEqual(mockGetAllResponse);
    });

    describe('when giftHttpService.get is successful', () => {
      it('should return the response of giftHttpService.get', async () => {
        // Act
        const response = await service.getAll();

        // Assert
        expect(response).toEqual(mockGetAllResponse);
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
        const promise = service.getAll();

        // Assert
        const expected = new Error('Error getting obligation subtypes');

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('getAllByProductType', () => {
    beforeEach(() => {
      // Arrange
      service = new GiftObligationSubtypeService(giftHttpService, logger);

      mockGetAll = jest.fn().mockResolvedValueOnce(mockGetAllResponse);

      service.getAll = mockGetAll;
    });

    it('should call service.getAll', async () => {
      // Act
      await service.getAllByProductType(mockProductCode);

      // Assert
      expect(mockGetAll).toHaveBeenCalledTimes(1);
    });

    it('should return an array of subtypes filtered by the provided product type code', async () => {
      // Act
      const response = await service.getAllByProductType(mockProductCode);

      // Assert
      const expected = [OBLIGATION_SUBTYPES.EXP01, OBLIGATION_SUBTYPES.EXP02];

      expect(response).toStrictEqual(expected);
    });

    describe('when service.getAll returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockGetAll = jest.fn().mockRejectedValueOnce(mockResponse500());

        service = new GiftObligationSubtypeService(giftHttpService, logger);

        service.getAll = mockGetAll;
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.getAllByProductType(mockProductCode);

        // Assert
        const expected = new Error(`Error getting obligation subtypes by product type ${mockProductCode}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('isSupported', () => {
    beforeEach(() => {
      // Arrange
      service = new GiftObligationSubtypeService(giftHttpService, logger);

      mockGetAllByProductType = jest.fn().mockResolvedValueOnce([OBLIGATION_SUBTYPES.EXP01]);

      service.getAllByProductType = mockGetAllByProductType;
    });

    it('should call service.getAllByProductType', async () => {
      // Act
      await service.isSupported({
        facilityId: mockFacilityId,
        obligations: [OBLIGATION()],
        productTypeCode: mockProductCode,
      });

      // Assert
      expect(mockGetAllByProductType).toHaveBeenCalledTimes(1);

      expect(mockGetAllByProductType).toHaveBeenCalledWith(mockProductCode);
    });

    describe('when the provided subtype codes are supported', () => {
      it('should return true', async () => {
        // Act
        const response = await service.isSupported({
          facilityId: mockFacilityId,
          obligations: [OBLIGATION()],
          productTypeCode: mockProductCode,
        });

        // Assert
        expect(response).toBe(true);
      });
    });

    describe('when the provided subtype codes are NOT supported', () => {
      it('should return false', async () => {
        // Arrange
        mockGetAllByProductType = jest.fn().mockResolvedValueOnce([OBLIGATION_SUBTYPES.BIP02]);

        service.getAllByProductType = mockGetAllByProductType;

        // Act
        const response = await service.isSupported({
          facilityId: mockFacilityId,
          obligations: [OBLIGATION()],
          productTypeCode: mockProductCode,
        });

        // Assert
        expect(response).toBe(false);
      });
    });

    describe('when service.getAllByProductType returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockGetAllByProductType = jest.fn().mockRejectedValueOnce(new Error());

        service = new GiftObligationSubtypeService(giftHttpService, logger);

        service.getAllByProductType = mockGetAllByProductType;
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.isSupported({
          facilityId: mockFacilityId,
          obligations: [OBLIGATION()],
          productTypeCode: mockProductCode,
        });

        // Assert
        const expected = new Error(
          `Error checking if multiple obligation subtypes are supported for product type ${mockProductCode} for facility ${mockFacilityId}`,
        );

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
