import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse400, mockResponse418, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftRepaymentProfileService } from './gift.repayment-profile.service';

const {
  GIFT: { REPAYMENT_PROFILE, FACILITY_ID: mockFacilityId, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { EVENT_TYPES, PATH } = GIFT;

describe('GiftRepaymentProfileService', () => {
  const logger = new PinoLogger({});

  let httpService: HttpService;
  let service: GiftRepaymentProfileService;

  let giftHttpService;
  let mockCreateOneResponse;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockCreateOneResponse = mockResponse201(REPAYMENT_PROFILE());

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockCreateOneResponse);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    service = new GiftRepaymentProfileService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('createOne', () => {
    const mockRepaymentProfile = REPAYMENT_PROFILE();

    it('should call giftHttpService.post', async () => {
      // Act
      await service.createOne(mockRepaymentProfile, mockFacilityId, mockWorkPackageId);

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_REPAYMENT_PROFILE}`,
        payload: mockRepaymentProfile,
      });
    });

    describe('when giftHttpService.post is successful', () => {
      it('should return the response of giftHttpService.post', async () => {
        // Act
        const response = await service.createOne(mockRepaymentProfile, mockFacilityId, mockWorkPackageId);

        // Assert
        expect(response).toEqual(mockCreateOneResponse);
      });
    });

    describe('when giftHttpService.post returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockResponse500());

        giftHttpService.post = mockHttpServicePost;

        service = new GiftRepaymentProfileService(giftHttpService, logger);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.createOne(mockRepaymentProfile, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = new Error(`Error creating a repayment profile with name ${mockRepaymentProfile.name} for facility ${mockFacilityId}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('createMany', () => {
    const repaymentProfilesLength = 3;

    const mockRepaymentProfiles = Array(repaymentProfilesLength).fill(REPAYMENT_PROFILE());

    let mockCreateOne = jest.fn().mockResolvedValue(mockResponse201(mockRepaymentProfiles));

    beforeEach(() => {
      // Arrange
      mockCreateOneResponse = mockResponse201(mockRepaymentProfiles);

      giftHttpService.post = jest
        .fn()
        .mockResolvedValueOnce(mockResponse201(mockRepaymentProfiles[0]))
        .mockResolvedValueOnce(mockResponse201(mockRepaymentProfiles[1]))
        .mockResolvedValueOnce(mockResponse201(mockRepaymentProfiles[2]));

      service = new GiftRepaymentProfileService(giftHttpService, logger);

      service.createOne = mockCreateOne;
    });

    it('should call service.createOne for each provided repayment profile', async () => {
      // Act
      await service.createMany(mockRepaymentProfiles, mockFacilityId, mockWorkPackageId);

      // Assert
      expect(mockCreateOne).toHaveBeenCalledTimes(repaymentProfilesLength);

      expect(mockCreateOne).toHaveBeenCalledWith(mockRepaymentProfiles[0], mockFacilityId, mockWorkPackageId);
      expect(mockCreateOne).toHaveBeenCalledWith(mockRepaymentProfiles[1], mockFacilityId, mockWorkPackageId);
      expect(mockCreateOne).toHaveBeenCalledWith(mockRepaymentProfiles[2], mockFacilityId, mockWorkPackageId);
    });

    describe('when service.createOne is successful', () => {
      it('should return the response of multiple calls to service.createOne', async () => {
        // Act
        const response = await service.createMany(mockRepaymentProfiles, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = [mockCreateOneResponse, mockCreateOneResponse, mockCreateOneResponse];

        expect(response).toEqual(expected);
      });
    });

    describe('when service.createOne returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockCreateOne = jest.fn().mockRejectedValueOnce(mockResponse500());

        service = new GiftRepaymentProfileService(giftHttpService, logger);

        service.createOne = mockCreateOne;
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.createMany(mockRepaymentProfiles, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = new Error(`Error creating repayment profiles for facility ${mockFacilityId}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });

    describe('when service.createOne returns multiple unacceptable and acceptable error statuses', () => {
      beforeEach(() => {
        // Arrange
        mockCreateOneResponse = mockResponse201(mockRepaymentProfiles);

        service = new GiftRepaymentProfileService(giftHttpService, logger);

        mockCreateOne = jest.fn().mockResolvedValueOnce(mockResponse418()).mockResolvedValueOnce(mockResponse500()).mockResolvedValueOnce(mockResponse400());

        service.createOne = mockCreateOne;
      });

      it('should continue to call service.createOne with mapped data for each provided counterparty', async () => {
        // Act
        await service.createMany(mockRepaymentProfiles, mockFacilityId, mockWorkPackageId);

        // Assert
        expect(mockCreateOne).toHaveBeenCalledTimes(repaymentProfilesLength);

        expect(mockCreateOne).toHaveBeenCalledWith(mockRepaymentProfiles[0], mockFacilityId, mockWorkPackageId);
        expect(mockCreateOne).toHaveBeenCalledWith(mockRepaymentProfiles[1], mockFacilityId, mockWorkPackageId);
        expect(mockCreateOne).toHaveBeenCalledWith(mockRepaymentProfiles[2], mockFacilityId, mockWorkPackageId);
      });
    });
  });
});
