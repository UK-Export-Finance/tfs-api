import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';

import { GiftObligationService } from './gift.obligation.service';
const {
  GIFT: { OBLIGATION, FACILITY_ID: mockFacilityId, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { PATH } = GIFT;

describe('GiftObligationService', () => {
  let httpService: HttpService;
  let service: GiftObligationService;

  let giftHttpService;
  let mockCreateOneResponse;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockCreateOneResponse = mockResponse201(OBLIGATION());

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockCreateOneResponse);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    service = new GiftObligationService(giftHttpService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('createOne', () => {
    const mockPayload = OBLIGATION();

    it('should call giftHttpService.post', async () => {
      // Act
      await service.createOne(mockPayload, mockFacilityId, mockWorkPackageId);

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}`,
        payload: mockPayload,
      });
    });

    describe('when giftHttpService.post is successful', () => {
      it('should return the response of giftHttpService.post', async () => {
        // Act
        const response = await service.createOne(mockPayload, mockFacilityId, mockWorkPackageId);

        // Assert
        expect(response).toEqual(mockCreateOneResponse);
      });
    });

    describe('when giftHttpService.post returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockResponse500());

        giftHttpService.post = mockHttpServicePost;

        service = new GiftObligationService(giftHttpService);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.createOne(mockPayload, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = new Error('Error creating obligation');

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('createMany', () => {
    const obligationsLength = 3;

    const mockObligations = Array(obligationsLength).fill(OBLIGATION());

    const mockPayload = mockObligations;

    let mockCreateOne = jest.fn().mockResolvedValue(mockResponse201(mockObligations));

    beforeEach(() => {
      // Arrange
      mockCreateOneResponse = mockResponse201(mockObligations);

      giftHttpService.post = jest
        .fn()
        .mockResolvedValueOnce(mockResponse201(mockObligations[0]))
        .mockResolvedValueOnce(mockResponse201(mockObligations[1]))
        .mockResolvedValueOnce(mockResponse201(mockObligations[2]));

      service = new GiftObligationService(giftHttpService);

      service.createOne = mockCreateOne;
    });

    it('should call service.createOne for each provided obligation', async () => {
      // Act
      await service.createMany(mockPayload, mockWorkPackageId);

      // Assert
      expect(mockCreateOne).toHaveBeenCalledTimes(obligationsLength);

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

        service = new GiftObligationService(giftHttpService);

        service.createOne = mockCreateOne;
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.createMany(mockPayload, mockWorkPackageId);

        // Assert
        const expected = new Error('Error creating obligations');

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
