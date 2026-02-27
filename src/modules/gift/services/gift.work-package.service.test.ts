import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse204, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftWorkPackageService } from './gift.work-package.service';

const {
  GIFT: { WORK_PACKAGE_CREATION_RESPONSE_DATA, FACILITY_ID: mockFacilityId, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { INTEGRATION_DEFAULTS, PATH } = GIFT;

describe('GiftWorkPackageService', () => {
  const logger = new PinoLogger({});

  let service: GiftWorkPackageService;

  let giftHttpService;
  let mockHttpPostResponse;
  let mockHttpDeleteResponse;
  let mockHttpServicePost: jest.Mock;
  let mockHttpServiceDelete: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockHttpPostResponse = mockResponse201(WORK_PACKAGE_CREATION_RESPONSE_DATA);
    mockHttpDeleteResponse = mockResponse204();

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockHttpPostResponse);
    mockHttpServiceDelete = jest.fn().mockResolvedValueOnce(mockHttpDeleteResponse);

    giftHttpService = {
      post: mockHttpServicePost,
      delete: mockHttpServiceDelete,
    };

    service = new GiftWorkPackageService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('should call giftHttpService.post', async () => {
      // Act
      await service.create(mockFacilityId);

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}`,
        payload: {
          name: INTEGRATION_DEFAULTS.GIFT_AMENDMENT_WORK_PACKAGE_NAME,
        },
      });
    });

    describe('when giftHttpService.post is successful', () => {
      it('should return the response of giftHttpService.post', async () => {
        // Act
        const response = await service.create(mockFacilityId);

        // Assert
        expect(response).toEqual(mockHttpPostResponse);
      });
    });

    describe('when giftHttpService.post returns an error', () => {
      const mockError = mockResponse500();

      beforeEach(() => {
        // Arrange
        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockError);

        giftHttpService.post = mockHttpServicePost;

        service = new GiftWorkPackageService(giftHttpService, logger);
      });

      it('should throw an error', async () => {
        // Act
        const promise = service.create(mockFacilityId);

        // Assert
        const expected = new Error(`Error creating work package for facility ${mockFacilityId}`, { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('delete', () => {
    it('should call giftHttpService.delete', async () => {
      // Act
      await service.delete(mockWorkPackageId, mockFacilityId);

      // Assert
      expect(mockHttpServiceDelete).toHaveBeenCalledTimes(1);

      expect(mockHttpServiceDelete).toHaveBeenCalledWith({
        path: `${PATH.WORK_PACKAGE}/${mockWorkPackageId}`,
      });
    });

    describe('when giftHttpService.delete is successful', () => {
      it('should return the response of giftHttpService.delete', async () => {
        // Act
        const response = await service.delete(mockWorkPackageId, mockFacilityId);

        // Assert
        expect(response).toEqual(mockHttpDeleteResponse);
      });
    });

    describe('when giftHttpService.delete returns an error', () => {
      const mockError = mockResponse500();

      beforeEach(() => {
        // Arrange
        mockHttpServiceDelete = jest.fn().mockRejectedValueOnce(mockError);

        giftHttpService.delete = mockHttpServiceDelete;

        service = new GiftWorkPackageService(giftHttpService, logger);
      });

      it('should throw an error', async () => {
        // Act
        const promise = service.delete(mockWorkPackageId, mockFacilityId);

        // Assert
        const expected = new Error(`Error deleting work package ${mockWorkPackageId} for facility ${mockFacilityId}`, { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
