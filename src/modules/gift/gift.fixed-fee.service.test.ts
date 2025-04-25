import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';

import { GiftFixedFeeService } from './gift.fixed-fee.service';
const {
  GIFT: { FIXED_FEE, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { PATH } = GIFT;

const expectedPath = `${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.FIXED_FEE}${PATH.CREATION_EVENT}`;

describe('GiftFixedFeeService', () => {
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

    service = new GiftFixedFeeService(giftHttpService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('createOne', () => {
    const mockPayload = FIXED_FEE();

    it('should call giftHttpService.post', async () => {
      // Act
      await service.createOne(mockPayload, mockWorkPackageId);

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: expectedPath,
        payload: mockPayload,
      });
    });

    describe('when giftHttpService.post is successful', () => {
      it('should return the response of giftHttpService.post', async () => {
        // Act
        const response = await service.createOne(mockPayload, mockWorkPackageId);

        // Assert
        expect(response).toEqual(mockCreateOneResponse);
      });
    });

    describe('when giftHttpService.post returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockResponse500());

        giftHttpService.post = mockHttpServicePost;

        service = new GiftFixedFeeService(giftHttpService);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.createOne(mockPayload, mockWorkPackageId);

        // Assert
        const expected = new Error('Error creating fixed fee');

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('createMany', () => {
    const fixedFeesLength = 3;

    const mockFixedFees = Array(fixedFeesLength).fill(FIXED_FEE());

    const mockPayload = mockFixedFees;

    let mockCreateOne = jest.fn().mockResolvedValue(mockResponse201(mockFixedFees));

    beforeEach(() => {
      // Arrange
      mockCreateOneResponse = mockResponse201(mockFixedFees);

      giftHttpService.post = jest
        .fn()
        .mockResolvedValueOnce(mockResponse201(mockFixedFees[0]))
        .mockResolvedValueOnce(mockResponse201(mockFixedFees[1]))
        .mockResolvedValueOnce(mockResponse201(mockFixedFees[2]));

      service = new GiftFixedFeeService(giftHttpService);

      service.createOne = mockCreateOne;
    });

    it('should call service.createOne for each provided fixed fee', async () => {
      // Act
      await service.createMany(mockPayload, mockWorkPackageId);

      // Assert
      expect(mockCreateOne).toHaveBeenCalledTimes(fixedFeesLength);

      expect(mockCreateOne).toHaveBeenCalledWith(mockPayload[0], mockWorkPackageId);
      expect(mockCreateOne).toHaveBeenCalledWith(mockPayload[1], mockWorkPackageId);
      expect(mockCreateOne).toHaveBeenCalledWith(mockPayload[2], mockWorkPackageId);
    });

    describe('when service.createOne is successful', () => {
      it('should return the response of multiple calls to service.createOne', async () => {
        // Act
        const response = await service.createMany(mockPayload, mockWorkPackageId);

        // Assert
        const expected = [mockCreateOneResponse, mockCreateOneResponse, mockCreateOneResponse];

        expect(response).toEqual(expected);
      });
    });

    describe('when service.createOne returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockCreateOne = jest.fn().mockRejectedValueOnce(mockResponse500());

        service = new GiftFixedFeeService(giftHttpService);

        service.createOne = mockCreateOne;
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.createMany(mockPayload, mockWorkPackageId);

        // Assert
        const expected = new Error('Error creating fixed fees');

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
