import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftWorkPackageService } from './gift.work-package.service';

const {
  GIFT: { WORK_PACKAGE_CREATION_RESPONSE_DATA, FACILITY_ID: mockFacilityId },
} = EXAMPLES;

const { INTEGRATION_DEFAULTS, PATH } = GIFT;

describe('GiftWorkPackageService', () => {
  const logger = new PinoLogger({});

  let service: GiftWorkPackageService;

  let giftHttpService;
  let mockHttpPostResponse;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockHttpPostResponse = mockResponse201(WORK_PACKAGE_CREATION_RESPONSE_DATA);

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockHttpPostResponse);

    giftHttpService = {
      post: mockHttpServicePost,
    };

    service = new GiftWorkPackageService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

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
    beforeEach(() => {
      // Arrange
      mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockResponse500());

      giftHttpService.post = mockHttpServicePost;

      service = new GiftWorkPackageService(giftHttpService, logger);
    });

    it('should thrown an error', async () => {
      // Act
      const promise = service.create(mockFacilityId);

      // Assert
      const expected = new Error(`Error creating work package for facility ${mockFacilityId}`, { cause: mockResponse500() });

      await expect(promise).rejects.toThrow(expected);
    });
  });
});
