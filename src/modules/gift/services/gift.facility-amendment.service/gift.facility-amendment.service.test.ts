import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockWorkPackageId } from '@ukef-test/gift/test-helpers';
import { mockResponse200, mockResponse201, mockResponse404 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { DecreaseAmountDto } from '../../dto';
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
    FACILITY_MULTIPLE_AMENDMENTS_REQUEST_PAYLOAD: mockMultipleAmendmentsPayload,
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
  const mockObligations = [
    {
      id: 'obligation-1',
      maturityDateFollowsFacility: false,
      accrualSchedules: [{ accrualScheduleId: 101 }, { accrualScheduleId: 102 }],
    },
    {
      id: 'obligation-2',
      maturityDateFollowsFacility: true,
      accrualSchedules: [{ accrualScheduleId: 103 }],
    },
  ];

  const mockFacilityResponseData = {
    ...FACILITY_RESPONSE_DATA,
    expiryDate: '2027-02-01',
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
  let mockReplaceExpiryDateAmendmentServiceAccrualSchedules: jest.Mock;

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
    mockReplaceExpiryDateAmendmentServiceAccrualSchedules = jest.fn().mockResolvedValueOnce(undefined);

    facilityService.get = mockFacilityServiceGet;
    amountAmendmentService.facility = mockAmountAmendmentServiceFacility;
    amountAmendmentService.obligations = mockAmountAmendmentServiceObligations;
    replaceExpiryDateAmendmentService.facility = mockReplaceExpiryDateAmendmentServiceFacility;
    replaceExpiryDateAmendmentService.obligations = mockReplaceExpiryDateAmendmentServiceObligations;
    replaceExpiryDateAmendmentService.accrualSchedules = mockReplaceExpiryDateAmendmentServiceAccrualSchedules;
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

  describe('create', () => {
    it('should call giftWorkPackageService.create', async () => {
      // Act
      await service.create(mockFacilityId, mockPayload);

      // Assert
      expect(mockWorkPackageServiceCreate).toHaveBeenCalledTimes(1);
      expect(mockWorkPackageServiceCreate).toHaveBeenCalledWith(mockFacilityId);
    });

    it('should call handleAmendmentCreation with the amendment', async () => {
      // Arrange
      const spy = jest.spyOn(service, 'handleAmendmentCreation' as any);

      // Act
      await service.create(mockFacilityId, mockPayload);

      // Assert
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({
        workPackageId: mockWorkPackageId,
        facility: mockFacilityResponseData,
        facilityId: mockFacilityId,
        amendment: mockPayload,
      });
    });

    it('should call giftStatusService.approved', async () => {
      // Act
      await service.create(mockFacilityId, mockPayload);

      // Assert
      expect(mockStatusServiceApproved).toHaveBeenCalledTimes(1);
      expect(mockStatusServiceApproved).toHaveBeenCalledWith(mockFacilityId, mockWorkPackageId);
    });

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

    describe('when facility get returns a non-OK status', () => {
      it('should return the facility error response', async () => {
        // Arrange
        mockFacilityServiceGet = jest.fn().mockResolvedValueOnce(mockResponse404());
        facilityService.get = mockFacilityServiceGet;
        service = new GiftFacilityAmendmentService(
          logger,
          workPackageService,
          facilityService,
          amountAmendmentService,
          replaceExpiryDateAmendmentService,
          statusService,
        );

        // Act
        const response = await service.create(mockFacilityId, mockPayload);

        // Assert
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });
    });

    describe('when work package creation returns a non-CREATED status', () => {
      it('should return the work package error response', async () => {
        // Arrange
        mockWorkPackageServiceCreate = jest.fn().mockResolvedValueOnce(mockResponse200({}));
        workPackageService.create = mockWorkPackageServiceCreate;
        service = new GiftFacilityAmendmentService(
          logger,
          workPackageService,
          facilityService,
          amountAmendmentService,
          replaceExpiryDateAmendmentService,
          statusService,
        );

        // Act
        const response = await service.create(mockFacilityId, mockPayload);

        // Assert
        expect(response.status).toBe(HttpStatus.OK);
      });
    });

    describe('when an error occurs', () => {
      it('should throw an error with a descriptive message', async () => {
        // Arrange
        const mockError = new Error('API error');
        mockFacilityServiceGet = jest.fn().mockRejectedValueOnce(mockError);
        facilityService.get = mockFacilityServiceGet;
        service = new GiftFacilityAmendmentService(
          logger,
          workPackageService,
          facilityService,
          amountAmendmentService,
          replaceExpiryDateAmendmentService,
          statusService,
        );

        // Act
        const promise = service.create(mockFacilityId, mockPayload);

        // Assert
        await expect(promise).rejects.toThrow(`Error creating amendment ${mockPayload.amendmentType} for facility ${mockFacilityId}`);
      });
    });
  });

  describe('handleAmendmentCreation', () => {
    describe(`when the amendment is ${AMEND_FACILITY_INCREASE_AMOUNT}`, () => {
      const increasePayload = {
        ...mockPayload,
        amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
      };

      it('should call giftAmountAmendmentService.facility,  then giftAmountAmendmentService.obligations', async () => {
        // Act
        await service.handleAmendmentCreation({
          workPackageId: mockWorkPackageId,
          facility: mockFacilityResponseData,
          facilityId: mockFacilityId,
          amendment: increasePayload,
        });

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
        await service.handleAmendmentCreation({
          workPackageId: mockWorkPackageId,
          facility: mockFacilityResponseData,
          facilityId: mockFacilityId,
          amendment: decreasePayload,
        });

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

      describe('when the existing expiry date is before the new expiry date', () => {
        it('should call giftReplaceExpiryDateAmendmentService.facility, then obligations, then accrual schedules', async () => {
          // Act
          await service.handleAmendmentCreation({
            workPackageId: mockWorkPackageId,
            facility: mockFacilityResponseData,
            facilityId: mockFacilityId,
            amendment: replaceExpiryDatePayload,
          });

          // Assert
          expect(mockReplaceExpiryDateAmendmentServiceAccrualSchedules).toHaveBeenCalledTimes(1);
          expect(mockReplaceExpiryDateAmendmentServiceFacility).toHaveBeenCalledTimes(1);
          expect(mockReplaceExpiryDateAmendmentServiceObligations).toHaveBeenCalledTimes(1);

          expect(mockReplaceExpiryDateAmendmentServiceAccrualSchedules).toHaveBeenNthCalledWith(1, {
            amendmentType: replaceExpiryDatePayload.amendmentType,
            expiryDate: replaceExpiryDatePayload.amendmentData.expiryDate,
            facilityId: mockFacilityId,
            obligations: mockObligations,
            workPackageId: mockWorkPackageId,
          });

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

          expect(mockReplaceExpiryDateAmendmentServiceFacility.mock.invocationCallOrder[0]).toBeLessThan(
            mockReplaceExpiryDateAmendmentServiceObligations.mock.invocationCallOrder[0],
          );
          expect(mockReplaceExpiryDateAmendmentServiceObligations.mock.invocationCallOrder[0]).toBeLessThan(
            mockReplaceExpiryDateAmendmentServiceAccrualSchedules.mock.invocationCallOrder[0],
          );
        });
      });

      describe('when the new expiry date is before the existing expiry date', () => {
        it('should call giftReplaceExpiryDateAmendmentService.accrual schedules, then obligations, then facility', async () => {
          // Arrange
          const earlierExpiryDatePayload = {
            ...replaceExpiryDatePayload,
            amendmentData: {
              ...EXAMPLES.GIFT.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.REPLACE_EXPIRY_DATE,
              expiryDate: '2026-01-01',
            },
          };

          // Act
          await service.handleAmendmentCreation({
            workPackageId: mockWorkPackageId,
            facility: mockFacilityResponseData,
            facilityId: mockFacilityId,
            amendment: earlierExpiryDatePayload,
          });

          // Assert
          expect(mockReplaceExpiryDateAmendmentServiceAccrualSchedules).toHaveBeenCalledTimes(1);
          expect(mockReplaceExpiryDateAmendmentServiceFacility).toHaveBeenCalledTimes(1);
          expect(mockReplaceExpiryDateAmendmentServiceObligations).toHaveBeenCalledTimes(1);

          expect(mockReplaceExpiryDateAmendmentServiceAccrualSchedules).toHaveBeenNthCalledWith(1, {
            amendmentType: earlierExpiryDatePayload.amendmentType,
            expiryDate: earlierExpiryDatePayload.amendmentData.expiryDate,
            facilityId: mockFacilityId,
            obligations: mockObligations,
            workPackageId: mockWorkPackageId,
          });

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

          expect(mockReplaceExpiryDateAmendmentServiceAccrualSchedules.mock.invocationCallOrder[0]).toBeLessThan(
            mockReplaceExpiryDateAmendmentServiceObligations.mock.invocationCallOrder[0],
          );
          expect(mockReplaceExpiryDateAmendmentServiceObligations.mock.invocationCallOrder[0]).toBeLessThan(
            mockReplaceExpiryDateAmendmentServiceFacility.mock.invocationCallOrder[0],
          );
        });
      });

      describe('when obligations do not follow facility maturity dates', () => {
        it('should still amend obligations', async () => {
          // Arrange
          const payloadWithUpdateObligationDatesFalse = {
            ...replaceExpiryDatePayload,
            amendmentData: replaceExpiryDatePayload.amendmentData,
          };

          // Act
          await service.handleAmendmentCreation({
            workPackageId: mockWorkPackageId,
            facility: mockFacilityResponseData,
            facilityId: mockFacilityId,
            amendment: payloadWithUpdateObligationDatesFalse,
          });

          // Assert
          expect(mockReplaceExpiryDateAmendmentServiceAccrualSchedules).toHaveBeenCalledTimes(1);
          expect(mockReplaceExpiryDateAmendmentServiceFacility).toHaveBeenCalledTimes(1);
          expect(mockReplaceExpiryDateAmendmentServiceObligations).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('when all obligations follow facility maturity dates', () => {
      it('should not amend obligations', async () => {
        // Arrange
        const facilityWithFollowingDates = {
          ...mockFacilityResponseData,
          obligations: [{ id: 'obligation-1', maturityDateFollowsFacility: true }],
        };

        // Act
        await service.handleAmendmentCreation({
          workPackageId: mockWorkPackageId,
          facility: facilityWithFollowingDates,
          facilityId: mockFacilityId,
          amendment: {
            amendmentType: 'IncreaseAmount',
            amendmentData: new DecreaseAmountDto(),
          },
        });

        // Assert
        expect(mockReplaceExpiryDateAmendmentServiceAccrualSchedules).toHaveBeenCalledTimes(1);
        expect(mockReplaceExpiryDateAmendmentServiceFacility).toHaveBeenCalledTimes(1);
        expect(mockReplaceExpiryDateAmendmentServiceObligations).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('createMultiple', () => {
    describe('when facility get returns a non-OK status', () => {
      it('should return the facility error response', async () => {
        // Arrange
        mockFacilityServiceGet = jest.fn().mockResolvedValueOnce(mockResponse404());
        facilityService.get = mockFacilityServiceGet;
        service = new GiftFacilityAmendmentService(
          logger,
          workPackageService,
          facilityService,
          amountAmendmentService,
          replaceExpiryDateAmendmentService,
          statusService,
        );

        // Act
        const response = await service.createMultiple(mockFacilityId, mockMultipleAmendmentsPayload);

        // Assert
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });
    });

    describe('when work package creation returns a non-CREATED status', () => {
      it('should return the work package error response', async () => {
        // Arrange
        mockWorkPackageServiceCreate = jest.fn().mockResolvedValueOnce(mockResponse200({}));
        workPackageService.create = mockWorkPackageServiceCreate;
        service = new GiftFacilityAmendmentService(
          logger,
          workPackageService,
          facilityService,
          amountAmendmentService,
          replaceExpiryDateAmendmentService,
          statusService,
        );

        // Act
        const response = await service.createMultiple(mockFacilityId, mockMultipleAmendmentsPayload);

        // Assert
        expect(response.status).toBe(HttpStatus.OK);
      });
    });

    describe('when all amendments are created successfully', () => {
      it('should call handleAmendmentCreation for each amendment in the payload', async () => {
        // Arrange
        const spy = jest.spyOn(service, 'handleAmendmentCreation' as any);

        // Act
        await service.createMultiple(mockFacilityId, mockMultipleAmendmentsPayload);

        // Assert
        expect(spy).toHaveBeenCalledTimes(mockMultipleAmendmentsPayload.amendments.length);
      });

      it('should call approveWorkPackage after all amendments are created', async () => {
        // Arrange
        const approveSpy = jest.spyOn(service, 'approveWorkPackage' as any);

        // Act
        await service.createMultiple(mockFacilityId, mockMultipleAmendmentsPayload);

        // Assert
        expect(approveSpy).toHaveBeenCalledTimes(1);
        expect(approveSpy).toHaveBeenCalledWith(mockFacilityId, mockWorkPackageId);
      });

      it('should return a response with status CREATED and isApproved true', async () => {
        // Act
        const response = await service.createMultiple(mockFacilityId, mockMultipleAmendmentsPayload);

        // Assert
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.data.isApproved).toBe(true);
      });
    });

    describe('when an error occurs', () => {
      it('should throw an error with a descriptive message', async () => {
        // Arrange
        const mockError = new Error('API error');
        mockFacilityServiceGet = jest.fn().mockRejectedValueOnce(mockError);
        facilityService.get = mockFacilityServiceGet;
        service = new GiftFacilityAmendmentService(
          logger,
          workPackageService,
          facilityService,
          amountAmendmentService,
          replaceExpiryDateAmendmentService,
          statusService,
        );

        // Act
        const promise = service.createMultiple(mockFacilityId, mockMultipleAmendmentsPayload);

        // Assert
        await expect(promise).rejects.toThrow(`Error creating multiple amendments for facility ${mockFacilityId}`);
      });
    });
  });
});
