import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockWorkPackageId } from '@ukef-test/gift/test-helpers';
import { mockResponse200, mockResponse201 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftAmountAmendmentService } from '../gift.amount-amendment.service';
import { GiftFacilityService } from '../gift.facility.service';
import { GiftReplaceExpiryDateAmendmentService } from '../gift.replace-expiry-date-amendment.service';
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
  AMEND_FACILITY_TYPES_CONSUMER: { AMEND_FACILITY_DECREASE_AMOUNT, AMEND_FACILITY_INCREASE_AMOUNT, AMEND_FACILITY_REPLACE_EXPIRY_DATE },
  FACILITY_CATEGORY_CODES,
} = GIFT;

const mockWorkPackageServiceCreateResponse = mockResponse201(WORK_PACKAGE_CREATION_RESPONSE_DATA);

describe('GiftFacilityAmendmentService', () => {
  const logger = new PinoLogger({});
  const mockFacilityCategoryCode = FACILITY_CATEGORY_CODES.CONTINGENT;
  const mockObligations = [{ id: 'obligation-1' }];

  const mockFacilityResponseData = {
    ...FACILITY_RESPONSE_DATA,
    obligations: mockObligations,
    riskDetails: {
      facilityCategoryCode: mockFacilityCategoryCode,
    },
  };

  let mockAmountAmendmentServiceFacility: jest.Mock;
  let mockAmountAmendmentServiceObligations: jest.Mock;
  let mockFacilityServiceGet: jest.Mock;
  let workPackageService: GiftWorkPackageService;
  let facilityService: GiftFacilityService;
  let amountAmendmentService: GiftAmountAmendmentService;
  let replaceExpiryDateAmendmentService: GiftReplaceExpiryDateAmendmentService;
  let statusService: GiftStatusService;
  let mockWorkPackageServiceCreate: jest.Mock;
  let mockStatusServiceApproved: jest.Mock;
  let mockReplaceExpiryDateAmendmentServiceFacility: jest.Mock;
  let mockReplaceExpiryDateAmendmentServiceObligations: jest.Mock;

  let service: GiftFacilityAmendmentService;

  let giftHttpService;

  beforeEach(() => {
    // Arrange
    giftHttpService = {};

    workPackageService = new GiftWorkPackageService(giftHttpService, logger);
    facilityService = {} as GiftFacilityService;
    amountAmendmentService = {} as GiftAmountAmendmentService;
    replaceExpiryDateAmendmentService = {} as GiftReplaceExpiryDateAmendmentService;
    statusService = new GiftStatusService(giftHttpService, logger);

    mockFacilityServiceGet = jest.fn().mockResolvedValueOnce(mockResponse200(mockFacilityResponseData));
    mockAmountAmendmentServiceFacility = jest.fn().mockResolvedValueOnce(mockResponse201(WORK_PACKAGE_CREATION_RESPONSE_DATA));
    mockAmountAmendmentServiceObligations = jest.fn().mockResolvedValueOnce([]);
    mockWorkPackageServiceCreate = jest.fn().mockResolvedValueOnce(mockWorkPackageServiceCreateResponse);
    mockStatusServiceApproved = jest.fn().mockResolvedValueOnce(mockResponse200(WORK_PACKAGE_APPROVE_RESPONSE_DATA));
    mockReplaceExpiryDateAmendmentServiceFacility = jest.fn().mockResolvedValueOnce(mockResponse201(WORK_PACKAGE_CREATION_RESPONSE_DATA));
    mockReplaceExpiryDateAmendmentServiceObligations = jest.fn().mockResolvedValueOnce(WORK_PACKAGE_CREATION_RESPONSE_DATA);

    facilityService.get = mockFacilityServiceGet;
    amountAmendmentService.facility = mockAmountAmendmentServiceFacility;
    amountAmendmentService.obligations = mockAmountAmendmentServiceObligations;
    replaceExpiryDateAmendmentService.facility = mockReplaceExpiryDateAmendmentServiceFacility;
    replaceExpiryDateAmendmentService.obligations = mockReplaceExpiryDateAmendmentServiceObligations;
    workPackageService.create = mockWorkPackageServiceCreate;
    statusService.approved = mockStatusServiceApproved;

    service = new GiftFacilityAmendmentService(
      logger,
      workPackageService,
      facilityService,
      amountAmendmentService,
      replaceExpiryDateAmendmentService,
      statusService,
    );
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

  describe(`when the amendment is ${AMEND_FACILITY_INCREASE_AMOUNT}`, () => {
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
          facilityCategoryCode: mockFacilityCategoryCode,
          facilityId: mockFacilityId,
          newFacilityAmount: increasePayload.amendmentData.amount,
          obligations: mockObligations,
          workPackageId: mockWorkPackageId,
        }),
      );

      expect(mockAmountAmendmentServiceFacility.mock.invocationCallOrder[0]).toBeLessThan(mockAmountAmendmentServiceObligations.mock.invocationCallOrder[0]);
    });
  });

  describe(`when the amendment is ${AMEND_FACILITY_DECREASE_AMOUNT}`, () => {
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
          facilityCategoryCode: mockFacilityCategoryCode,
          facilityId: mockFacilityId,
          newFacilityAmount: decreasePayload.amendmentData.amount,
          obligations: mockObligations,
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

  describe(`when the amendment is ${AMEND_FACILITY_REPLACE_EXPIRY_DATE}`, () => {
    const replaceExpiryDatePayload = {
      ...mockPayload,
      amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
      amendmentData: EXAMPLES.GIFT.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.REPLACE_EXPIRY_DATE,
    };

    it('should call giftReplaceExpiryDateAmendmentService.obligations then giftReplaceExpiryDateAmendmentService.facility when existing expiry date is before the new expiry date', async () => {
      // Act
      await service.create(mockFacilityId, replaceExpiryDatePayload);

      // Assert
      expect(mockReplaceExpiryDateAmendmentServiceFacility).toHaveBeenCalledTimes(1);
      expect(mockReplaceExpiryDateAmendmentServiceObligations).toHaveBeenCalledTimes(1);

      expect(mockReplaceExpiryDateAmendmentServiceFacility).toHaveBeenNthCalledWith(1, {
        amendmentType: replaceExpiryDatePayload.amendmentType,
        facilityId: mockFacilityId,
        workPackageId: mockWorkPackageId,
        expiryDate: replaceExpiryDatePayload.amendmentData.expiryDate,
      });

      expect(mockReplaceExpiryDateAmendmentServiceObligations).toHaveBeenNthCalledWith(1, {
        amendmentType: replaceExpiryDatePayload.amendmentType,
        facilityId: mockFacilityId,
        obligations: mockObligations,
        workPackageId: mockWorkPackageId,
        facilityExpiryDate: replaceExpiryDatePayload.amendmentData.expiryDate,
      });

      expect(mockReplaceExpiryDateAmendmentServiceObligations.mock.invocationCallOrder[0]).toBeLessThan(
        mockReplaceExpiryDateAmendmentServiceFacility.mock.invocationCallOrder[0],
      );
    });

    it('should call giftReplaceExpiryDateAmendmentService.facility then giftReplaceExpiryDateAmendmentService.obligations when existing expiry date is not before the new expiry date', async () => {
      // Arrange
      const earlierExpiryDatePayload = {
        ...replaceExpiryDatePayload,
        amendmentData: {
          expiryDate: '2026-01-01',
        },
      };

      // Act
      await service.create(mockFacilityId, earlierExpiryDatePayload);

      // Assert
      expect(mockReplaceExpiryDateAmendmentServiceFacility).toHaveBeenCalledTimes(1);
      expect(mockReplaceExpiryDateAmendmentServiceObligations).toHaveBeenCalledTimes(1);

      expect(mockReplaceExpiryDateAmendmentServiceFacility).toHaveBeenNthCalledWith(1, {
        amendmentType: earlierExpiryDatePayload.amendmentType,
        facilityId: mockFacilityId,
        workPackageId: mockWorkPackageId,
        expiryDate: earlierExpiryDatePayload.amendmentData.expiryDate,
      });

      expect(mockReplaceExpiryDateAmendmentServiceObligations).toHaveBeenNthCalledWith(1, {
        amendmentType: earlierExpiryDatePayload.amendmentType,
        facilityId: mockFacilityId,
        obligations: mockObligations,
        workPackageId: mockWorkPackageId,
        facilityExpiryDate: earlierExpiryDatePayload.amendmentData.expiryDate,
      });

      expect(mockReplaceExpiryDateAmendmentServiceFacility.mock.invocationCallOrder[0]).toBeLessThan(
        mockReplaceExpiryDateAmendmentServiceObligations.mock.invocationCallOrder[0],
      );
    });

    it('should return only the facility amendment response data', async () => {
      // Arrange
      const replaceExpiryDateFacilityResponse = mockResponse201(WORK_PACKAGE_CREATION_RESPONSE_DATA);

      mockReplaceExpiryDateAmendmentServiceFacility = jest.fn().mockResolvedValueOnce(replaceExpiryDateFacilityResponse);
      mockReplaceExpiryDateAmendmentServiceObligations = jest.fn().mockResolvedValueOnce([WORK_PACKAGE_CREATION_RESPONSE_DATA]);

      replaceExpiryDateAmendmentService.facility = mockReplaceExpiryDateAmendmentServiceFacility;
      replaceExpiryDateAmendmentService.obligations = mockReplaceExpiryDateAmendmentServiceObligations;

      service = new GiftFacilityAmendmentService(
        logger,
        workPackageService,
        facilityService,
        amountAmendmentService,
        replaceExpiryDateAmendmentService,
        statusService,
      );

      // Act
      const response = await service.create(mockFacilityId, replaceExpiryDatePayload);

      // Assert
      const expected = {
        status: HttpStatus.CREATED,
        data: {
          ...WORK_PACKAGE_CREATION_RESPONSE_DATA,
          isApproved: true,
        },
      };

      expect(response).toStrictEqual(expected);
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
          ...WORK_PACKAGE_CREATION_RESPONSE_DATA,
          isApproved: true,
        },
      };

      expect(response).toEqual(expected);
    });
  });
});
