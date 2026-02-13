import { GIFT } from '@ukef/constants';
import { mockResponse200, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftObligationSubtypeService } from './gift.obligation-subtype.service';

const { OBLIGATION_SUBTYPES, PATH, PRODUCT_TYPE_CODES } = GIFT;

const mockProductCode = PRODUCT_TYPE_CODES.EXIP;

describe('GiftObligationSubtypeService', () => {
  const logger = new PinoLogger({});

  let service: GiftObligationSubtypeService;

  let giftHttpService;
  let mockGetAllResponse;
  let mockHttpServiceGet: jest.Mock;
  let mockGetAll: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockGetAllResponse = mockResponse200({ obligationSubtypes: Object.values(OBLIGATION_SUBTYPES) });

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockGetAllResponse);

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
});
