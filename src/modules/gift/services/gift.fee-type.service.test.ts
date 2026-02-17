import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftFeeTypeService } from './gift.fee-type.service';

const { PATH } = GIFT;

const {
  GIFT: { FEE_TYPES, FEE_TYPES_RESPONSE_DATA },
} = EXAMPLES;

describe('GiftFeeTypeService', () => {
  const logger = new PinoLogger({});

  let service: GiftFeeTypeService;

  let giftHttpService;
  let mockGetResponse;
  let mockHttpServiceGet: jest.Mock;
  let mockGetSupportedFeeTypes: jest.Mock;

  const mockError = mockResponse500();

  beforeEach(() => {
    // Arrange
    mockGetResponse = mockResponse201(FEE_TYPES_RESPONSE_DATA);

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockGetResponse);

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
        mockHttpServiceGet = jest.fn().mockRejectedValueOnce(mockError);

        giftHttpService.get = mockHttpServiceGet;

        service = new GiftFeeTypeService(giftHttpService, logger);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.getSupportedFeeTypes();

        // Assert
        const expected = new Error('Error getting supported fee types', { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('getAllFeeTypeCodes', () => {
    beforeEach(() => {
      mockGetSupportedFeeTypes = jest.fn().mockResolvedValueOnce({
        data: {
          feeTypes: [FEE_TYPES.BEX, FEE_TYPES.PLA],
        },
      });

      service.getSupportedFeeTypes = mockGetSupportedFeeTypes;
    });

    it('should call service.getSupportedFeeTypes', async () => {
      // Act
      await service.getAllFeeTypeCodes();

      // Assert
      expect(mockGetSupportedFeeTypes).toHaveBeenCalledTimes(1);
    });

    describe('when service.getSupportedFeeTypes is successful', () => {
      it('should return an array of codes from the response of service.getSupportedFeeTypes', async () => {
        // Act
        const response = await service.getAllFeeTypeCodes();

        // Assert
        const expected = [FEE_TYPES.BEX.code, FEE_TYPES.PLA.code];

        expect(response).toEqual(expected);
      });
    });

    describe('when service.getSupportedFeeTypes returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockGetSupportedFeeTypes = jest.fn().mockRejectedValueOnce(mockError);

        service = new GiftFeeTypeService(giftHttpService, logger);

        service.getSupportedFeeTypes = mockGetSupportedFeeTypes;
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.getAllFeeTypeCodes();

        // Assert
        const expected = new Error('Error getting all fee type codes', { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
