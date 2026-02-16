import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockWorkPackageId } from '@ukef-test/gift/test-helpers';
import { mockResponse201 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftWorkPackageService } from '../gift.work-package.service';
import { GiftFacilityAmendmentService } from '.';

const {
  GIFT: { WORK_PACKAGE_CREATION_RESPONSE_DATA, FACILITY_ID: mockFacilityId, FACILITY_AMENDMENT_REQUEST_PAYLOAD: mockPayload },
} = EXAMPLES;

const { PATH } = GIFT;

const mockWorkPackageServiceCreateResponse = mockResponse201(WORK_PACKAGE_CREATION_RESPONSE_DATA);
const mockHttpPostResponse = mockResponse201({ mockHttpPostResponse: true });

describe('GiftFacilityAmendmentService', () => {
  const logger = new PinoLogger({});

  let mockHttpServicePost: jest.Mock;
  let workPackageService: GiftWorkPackageService;
  let mockWorkPackageServiceCreate: jest.Mock;

  let service: GiftFacilityAmendmentService;

  let giftHttpService;

  beforeEach(() => {
    // Arrange
    workPackageService = new GiftWorkPackageService(giftHttpService, logger);

    mockWorkPackageServiceCreate = jest.fn().mockResolvedValueOnce(mockWorkPackageServiceCreateResponse);
    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockHttpPostResponse);

    workPackageService.create = mockWorkPackageServiceCreate;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    service = new GiftFacilityAmendmentService(giftHttpService, logger, workPackageService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should call giftWorkPackageService.create', async () => {
    // Act
    await service.create(mockFacilityId, mockPayload);

    // Assert
    expect(mockWorkPackageServiceCreate).toHaveBeenCalledTimes(1);

    expect(mockWorkPackageServiceCreate).toHaveBeenCalledWith(mockFacilityId);
  });

  it('should call giftHttpService.post', async () => {
    // Act
    await service.create(mockFacilityId, mockPayload);

    // Assert
    expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

    expect(mockHttpServicePost).toHaveBeenCalledWith({
      path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/AmendFacility_${mockPayload.amendmentType}`,
      payload: mockPayload.amendmentData,
    });
  });

  describe('when all calls are successful', () => {
    it('should return a response object with data as the result of giftHttpService.post', async () => {
      // Act
      const response = await service.create(mockFacilityId, mockPayload);

      // Assert
      const expected = {
        status: HttpStatus.CREATED,
        data: mockHttpPostResponse.data,
      };

      expect(response).toEqual(expected);
    });
  });
});
