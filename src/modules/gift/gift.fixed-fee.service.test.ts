import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftFixedFeeService } from './gift.fixed-fee.service';
const {
  GIFT: { FIXED_FEE, FACILITY_ID: mockFacilityId, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { EVENT_TYPES, PATH } = GIFT;

describe('GiftFixedFeeService', () => {
  const logger = new PinoLogger({});

  let httpService: HttpService;
  let service: GiftFixedFeeService;

  let giftHttpService;
  let mockCreateOneResponse;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockCreateOneResponse = mockResponse201(FIXED_FEE());

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockCreateOneResponse);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    service = new GiftFixedFeeService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('createOne', () => {
    const mockFixedFee = FIXED_FEE();

    it('should call giftHttpService.post', async () => {
      // Act
      await service.createOne(mockFixedFee, mockFacilityId, mockWorkPackageId);

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.CREATE_FIXED_FEE}`,
        payload: mockFixedFee,
      });
    });

    describe('when giftHttpService.post is successful', () => {
      it('should return the response of giftHttpService.post', async () => {
        // Act
        const response = await service.createOne(mockFixedFee, mockFacilityId, mockWorkPackageId);

        // Assert
        expect(response).toEqual(mockCreateOneResponse);
      });
    });

    describe('when giftHttpService.post returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockResponse500());

        giftHttpService.post = mockHttpServicePost;

        service = new GiftFixedFeeService(giftHttpService, logger);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.createOne(mockFixedFee, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = new Error(`Error creating a fixed fee for facility ${mockFacilityId}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('createMany', () => {
    const fixedFeesLength = 3;

    const mockFixedFees = Array(fixedFeesLength).fill(FIXED_FEE());

    let mockCreateOne = jest.fn().mockResolvedValue(mockResponse201(mockFixedFees));

    beforeEach(() => {
      // Arrange
      mockCreateOneResponse = mockResponse201(mockFixedFees);

      giftHttpService.post = jest
        .fn()
        .mockResolvedValueOnce(mockResponse201(mockFixedFees[0]))
        .mockResolvedValueOnce(mockResponse201(mockFixedFees[1]))
        .mockResolvedValueOnce(mockResponse201(mockFixedFees[2]));

      service = new GiftFixedFeeService(giftHttpService, logger);

      service.createOne = mockCreateOne;
    });

    it('should call service.createOne for each provided fixed fee', async () => {
      // Act
      await service.createMany(mockFixedFees, mockFacilityId, mockWorkPackageId);

      // Assert
      expect(mockCreateOne).toHaveBeenCalledTimes(fixedFeesLength);

      expect(mockCreateOne).toHaveBeenCalledWith(mockFixedFees[0], mockFacilityId, mockWorkPackageId);
      expect(mockCreateOne).toHaveBeenCalledWith(mockFixedFees[1], mockFacilityId, mockWorkPackageId);
      expect(mockCreateOne).toHaveBeenCalledWith(mockFixedFees[2], mockFacilityId, mockWorkPackageId);
    });

    describe('when service.createOne is successful', () => {
      it('should return the response of multiple calls to service.createOne', async () => {
        // Act
        const response = await service.createMany(mockFixedFees, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = [mockCreateOneResponse, mockCreateOneResponse, mockCreateOneResponse];

        expect(response).toEqual(expected);
      });
    });

    describe('when service.createOne returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockCreateOne = jest.fn().mockRejectedValueOnce(mockResponse500());

        service = new GiftFixedFeeService(giftHttpService, logger);

        service.createOne = mockCreateOne;
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.createMany(mockFixedFees, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = new Error(`Error creating fixed fees for facility ${mockFacilityId}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
