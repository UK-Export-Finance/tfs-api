import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockWorkPackageId } from '@ukef-test/gift/test-helpers';
import { mockResponse200, mockResponse201 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftAmountAmendmentService } from '../gift.amount-amendment.service';
import { GiftFacilityService } from '../gift.facility.service';
import { GiftStatusService } from '../gift.status.service';
import { GiftWorkPackageService } from '../gift.work-package.service';
import { GiftFacilityAmendmentService } from '.';

const {
  GIFT: {
    FACILITY_ID: mockFacilityId,
    FACILITY_AMENDMENT_REQUEST_PAYLOAD: mockPayload,
    FACILITY_RESPONSE_DATA,
    WORK_PACKAGE_APPROVE_RESPONSE_DATA,
    WORK_PACKAGE_CREATION_RESPONSE_DATA,
  },
} = EXAMPLES;

const {
  AMEND_FACILITY_TYPES: { AMEND_FACILITY_DECREASE_AMOUNT, AMEND_FACILITY_INCREASE_AMOUNT },
} = GIFT;

const mockWorkPackageServiceCreateResponse = mockResponse201(WORK_PACKAGE_CREATION_RESPONSE_DATA);

describe('GiftFacilityAmendmentService', () => {
  const logger = new PinoLogger({});

  let mockAmountAmendmentServiceFacility: jest.Mock;
  let mockAmountAmendmentServiceObligations: jest.Mock;
  let mockFacilityServiceGet: jest.Mock;
  let workPackageService: GiftWorkPackageService;
  let facilityService: GiftFacilityService;
  let amountAmendmentService: GiftAmountAmendmentService;
  let statusService: GiftStatusService;
  let mockWorkPackageServiceCreate: jest.Mock;
  let mockStatusServiceApproved: jest.Mock;

  let service: GiftFacilityAmendmentService;

  let giftHttpService;

  beforeEach(() => {
    // Arrange
    giftHttpService = {};

    workPackageService = new GiftWorkPackageService(giftHttpService, logger);
    facilityService = {} as GiftFacilityService;
    amountAmendmentService = {} as GiftAmountAmendmentService;
    statusService = new GiftStatusService(giftHttpService, logger);

    mockFacilityServiceGet = jest.fn().mockResolvedValueOnce(mockResponse200(FACILITY_RESPONSE_DATA));
    mockAmountAmendmentServiceFacility = jest.fn().mockResolvedValueOnce(mockResponse201({}));
    mockAmountAmendmentServiceObligations = jest.fn().mockResolvedValueOnce([]);
    mockWorkPackageServiceCreate = jest.fn().mockResolvedValueOnce(mockWorkPackageServiceCreateResponse);
    mockStatusServiceApproved = jest.fn().mockResolvedValueOnce(mockResponse200(WORK_PACKAGE_APPROVE_RESPONSE_DATA));

    facilityService.get = mockFacilityServiceGet;
    amountAmendmentService.facility = mockAmountAmendmentServiceFacility;
    amountAmendmentService.obligations = mockAmountAmendmentServiceObligations;
    workPackageService.create = mockWorkPackageServiceCreate;
    statusService.approved = mockStatusServiceApproved;

    service = new GiftFacilityAmendmentService(logger, workPackageService, facilityService, amountAmendmentService, statusService);
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

  describe('when amendment is increase amount', () => {
    const increasePayload = {
      ...mockPayload,
      amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
    };

    it('should call giftAmountAmendmentService.facility,  then giftAmountAmendmentService.obligations', async () => {
      // Act
      await service.create(mockFacilityId, increasePayload);

      // Assert
      expect(mockAmountAmendmentServiceFacility).toHaveBeenCalledTimes(1);
      expect(mockAmountAmendmentServiceObligations).toHaveBeenCalledTimes(1);

      expect(mockAmountAmendmentServiceFacility).toHaveBeenNthCalledWith(1, {
        ...increasePayload,
        facilityId: mockFacilityId,
        workPackageId: mockWorkPackageId,
      });
      expect(mockAmountAmendmentServiceObligations).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          amendmentType: increasePayload.amendmentType,
          facilityId: mockFacilityId,
          newFacilityAmount: increasePayload.amendmentData.amount,
          workPackageId: mockWorkPackageId,
        }),
      );

      expect(mockAmountAmendmentServiceFacility.mock.invocationCallOrder[0]).toBeLessThan(mockAmountAmendmentServiceObligations.mock.invocationCallOrder[0]);
    });
  });

  describe('when amendment is decrease amount', () => {
    const decreasePayload = {
      ...mockPayload,
      amendmentType: AMEND_FACILITY_DECREASE_AMOUNT,
    };

    it('should call giftAmountAmendmentService.obligations then facility', async () => {
      // Act
      await service.create(mockFacilityId, decreasePayload);

      // Assert
      expect(mockAmountAmendmentServiceFacility).toHaveBeenCalledTimes(1);
      expect(mockAmountAmendmentServiceObligations).toHaveBeenCalledTimes(1);

      expect(mockAmountAmendmentServiceObligations).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          amendmentType: decreasePayload.amendmentType,
          facilityId: mockFacilityId,
          newFacilityAmount: decreasePayload.amendmentData.amount,
          workPackageId: mockWorkPackageId,
        }),
      );
      expect(mockAmountAmendmentServiceFacility).toHaveBeenNthCalledWith(1, {
        ...decreasePayload,
        facilityId: mockFacilityId,
        workPackageId: mockWorkPackageId,
      });

      expect(mockAmountAmendmentServiceObligations.mock.invocationCallOrder[0]).toBeLessThan(mockAmountAmendmentServiceFacility.mock.invocationCallOrder[0]);
    });
  });

  it('should call giftStatusService.approved', async () => {
    // Act
    await service.create(mockFacilityId, mockPayload);

    // Assert
    expect(mockStatusServiceApproved).toHaveBeenCalledTimes(1);

    expect(mockStatusServiceApproved).toHaveBeenCalledWith(mockFacilityId, mockWorkPackageId);
  });

  describe('when all calls are successful', () => {
    it('should return a response object with data as the result of giftHttpService.post', async () => {
      // Act
      const response = await service.create(mockFacilityId, mockPayload);

      // Assert
      const expected = {
        status: HttpStatus.CREATED,
        data: {
          ...WORK_PACKAGE_APPROVE_RESPONSE_DATA,
          isApproved: true,
        },
      };

      expect(response).toEqual(expected);
    });
  });
});
