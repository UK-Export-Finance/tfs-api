import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftStatusService } from './gift.status.service';
const {
  GIFT: { WORK_PACKAGE_APPROVE_RESPONSE_DATA, FACILITY_ID: mockFacilityId, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { PATH } = GIFT;

describe('GiftStatusService', () => {
  const logger = new PinoLogger({});

  let httpService: HttpService;
  let service: GiftStatusService;

  let giftHttpService;
  let mockApprovedResponse;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockApprovedResponse = mockResponse201(WORK_PACKAGE_APPROVE_RESPONSE_DATA);

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockApprovedResponse);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    service = new GiftStatusService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('approved', () => {
    it('should call giftHttpService.post', async () => {
      // Act
      await service.approved(mockFacilityId, mockWorkPackageId);

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.APPROVE}`,
      });
    });

    describe('when giftHttpService.post is successful', () => {
      it('should return the response of giftHttpService.post', async () => {
        // Act
        const response = await service.approved(mockFacilityId, mockWorkPackageId);

        // Assert
        expect(response).toEqual(mockApprovedResponse);
      });
    });

    describe('when giftHttpService.post returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockResponse500());

        giftHttpService.post = mockHttpServicePost;

        service = new GiftStatusService(giftHttpService, logger);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.approved(mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = new Error('Error setting facility work package status as approved');

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
