import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockWorkPackageId } from '@ukef-test/gift/test-helpers';
import { mockResponse200, mockResponse201, mockResponse204, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftAmountAmendmentService } from '../gift.amount-amendment.service';
import { GiftFacilityService } from '../gift.facility.service';
import { GiftReplaceExpiryDateAmendmentService } from '../gift.replace-expiry-date-amendment.service';
import { GiftStatusService } from '../gift.status.service';
import { GiftWorkPackageService } from '../gift.work-package.service';
import { GiftFacilityAmendmentService } from '.';

const {
  GIFT: {
    FACILITY_AMENDMENT_REQUEST_PAYLOAD: mockPayload,
    FACILITY_ID: mockFacilityId,
    FACILITY_MULTIPLE_AMENDMENTS_REQUEST_PAYLOAD: mockMultipleAmendmentsPayload,
    FACILITY_RESPONSE_DATA,
    WORK_PACKAGE_APPROVE_RESPONSE_DATA,
    WORK_PACKAGE_CREATION_RESPONSE_DATA,
  },
} = EXAMPLES;

const {
  AMEND_FACILITY_TYPES_CONSUMER: { AMEND_FACILITY_REPLACE_EXPIRY_DATE },
  FACILITY_CATEGORY_CODES,
} = GIFT;

const replaceExpiryDatePayload = {
  ...mockPayload,
  amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
  amendmentData: EXAMPLES.GIFT.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.REPLACE_EXPIRY_DATE,
};

const mockWorkPackageServiceCreateResponse = mockResponse201(WORK_PACKAGE_CREATION_RESPONSE_DATA);
const mockFacilityResponseData = {
  ...FACILITY_RESPONSE_DATA,
  obligations: [{ id: 'obligation-1' }],
  riskDetails: {
    facilityCategoryCode: FACILITY_CATEGORY_CODES.CONTINGENT,
  },
};

describe('GiftFacilityAmendmentService - error handling', () => {
  const logger = new PinoLogger({});

  let giftHttpService;
  let service: GiftFacilityAmendmentService;

  let workPackageService: GiftWorkPackageService;
  let facilityService: GiftFacilityService;
  let amountAmendmentService: GiftAmountAmendmentService;
  let replaceExpiryDateAmendmentService: GiftReplaceExpiryDateAmendmentService;
  let statusService: GiftStatusService;

  let mockWorkPackageServiceCreate: jest.Mock;
  let mockFacilityServiceGet: jest.Mock;
  let mockAmountAmendmentFacility: jest.Mock;
  let mockAmountAmendmentObligations: jest.Mock;
  let mockReplaceExpiryDateAmendmentFacility: jest.Mock;
  let mockReplaceExpiryDateAmendmentObligations: jest.Mock;
  let mockReplaceExpiryDateAmendmentAccrualSchedules: jest.Mock;
  let mockStatusServiceApproved: jest.Mock;

  const buildService = () => {
    service = new GiftFacilityAmendmentService(
      logger,
      workPackageService,
      facilityService,
      amountAmendmentService,
      replaceExpiryDateAmendmentService,
      statusService,
    );
  };

  beforeEach(() => {
    giftHttpService = {
      delete: jest.fn().mockResolvedValue(mockResponse200({})),
    };

    workPackageService = new GiftWorkPackageService(giftHttpService, logger);
    facilityService = {} as GiftFacilityService;
    amountAmendmentService = {} as GiftAmountAmendmentService;
    replaceExpiryDateAmendmentService = {} as GiftReplaceExpiryDateAmendmentService;
    statusService = new GiftStatusService(giftHttpService, logger);

    mockFacilityServiceGet = jest.fn().mockResolvedValueOnce(mockResponse200(mockFacilityResponseData));
    mockWorkPackageServiceCreate = jest.fn().mockResolvedValueOnce(mockWorkPackageServiceCreateResponse);
    mockAmountAmendmentFacility = jest.fn().mockResolvedValueOnce(mockResponse201({}));
    mockAmountAmendmentObligations = jest.fn().mockResolvedValueOnce([]);
    mockReplaceExpiryDateAmendmentFacility = jest.fn().mockResolvedValueOnce(mockResponse201({}));
    mockReplaceExpiryDateAmendmentObligations = jest.fn().mockResolvedValueOnce({});
    mockReplaceExpiryDateAmendmentAccrualSchedules = jest.fn().mockResolvedValueOnce(undefined);
    mockStatusServiceApproved = jest.fn().mockResolvedValueOnce(mockResponse200(WORK_PACKAGE_APPROVE_RESPONSE_DATA));

    facilityService.get = mockFacilityServiceGet;
    workPackageService.create = mockWorkPackageServiceCreate;
    amountAmendmentService.facility = mockAmountAmendmentFacility;
    amountAmendmentService.obligations = mockAmountAmendmentObligations;
    replaceExpiryDateAmendmentService.facility = mockReplaceExpiryDateAmendmentFacility;
    replaceExpiryDateAmendmentService.obligations = mockReplaceExpiryDateAmendmentObligations;
    replaceExpiryDateAmendmentService.accrualSchedules = mockReplaceExpiryDateAmendmentAccrualSchedules;
    statusService.approved = mockStatusServiceApproved;

    buildService();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('giftWorkPackageService.create', () => {
    describe(`when giftWorkPackageService.create does NOT return a ${HttpStatus.CREATED} status`, () => {
      it.each([
        HttpStatus.ACCEPTED,
        HttpStatus.BAD_GATEWAY,
        HttpStatus.BAD_REQUEST,
        HttpStatus.CONFLICT,
        HttpStatus.FORBIDDEN,
        HttpStatus.I_AM_A_TEAPOT,
        HttpStatus.INTERNAL_SERVER_ERROR,
        HttpStatus.NOT_FOUND,
        HttpStatus.OK,
      ])('should return a response with the received status and data', async (status) => {
        // Arrange
        const mockResponseData = WORK_PACKAGE_CREATION_RESPONSE_DATA;

        mockWorkPackageServiceCreate = jest.fn().mockResolvedValueOnce({
          status,
          data: mockResponseData,
        });

        workPackageService.create = mockWorkPackageServiceCreate;

        buildService();

        // Act
        const response = await service.create(mockFacilityId, mockPayload);

        // Assert
        const expected = {
          status,
          data: mockResponseData,
        };

        expect(response).toEqual(expected);
      });
    });

    describe('when giftWorkPackageService.create throws an error', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockWorkPackageServiceCreate = jest.fn().mockRejectedValueOnce(mockError);

        workPackageService.create = mockWorkPackageServiceCreate;

        buildService();

        // Act
        const response = service.create(mockFacilityId, mockPayload);

        // Assert
        const expected = new Error(`Error creating amendment ${mockPayload.amendmentType} for facility ${mockFacilityId}`, { cause: mockError });

        await expect(response).rejects.toThrow(expected);
      });
    });
  });

  describe('giftWorkPackageService.createMultiple', () => {
    describe('when amendments fail to be created', () => {
      let mockHttpServiceDelete;
      let mockErrorResponse;

      beforeEach(() => {
        // Arrange
        mockHttpServiceDelete = jest.fn().mockResolvedValue(mockResponse204());

        giftHttpService.delete = mockHttpServiceDelete;
        workPackageService = new GiftWorkPackageService(giftHttpService, logger);
        workPackageService.create = mockWorkPackageServiceCreate;

        mockErrorResponse = {
          status: HttpStatus.BAD_REQUEST,
          data: { error: 'Mock amendment error' },
        };

        jest.spyOn(service, 'handleCreateAmendments' as any).mockResolvedValue(mockErrorResponse);
      });

      afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
      });

      it('should call giftWorkPackageService.delete', async () => {
        // Act
        await service.createMultiple(mockFacilityId, mockMultipleAmendmentsPayload);

        // Assert
        expect(mockHttpServiceDelete).toHaveBeenCalledTimes(1);
        expect(mockHttpServiceDelete).toHaveBeenCalledWith({ path: `/work-package/${mockWorkPackageId}` });
      });

      it('should return the amendment error response', async () => {
        // Act
        const response = await service.createMultiple(mockFacilityId, mockMultipleAmendmentsPayload);

        // Assert
        expect(response).toEqual(mockErrorResponse);
      });
    });

    describe('when amendments throw an exception', () => {
      it('should delete the work package and return error response', async () => {
        // Arrange
        const mockError = new Error('Network error during amendments');
        const mockHttpServiceDelete = jest.fn().mockResolvedValue(mockResponse204());

        giftHttpService.delete = mockHttpServiceDelete;
        workPackageService = new GiftWorkPackageService(giftHttpService, logger);
        workPackageService.create = mockWorkPackageServiceCreate;

        buildService();

        jest.spyOn(service, 'handleCreateAmendments' as any).mockRejectedValueOnce(mockError);

        // Act
        const response = await service.createMultiple(mockFacilityId, mockMultipleAmendmentsPayload);

        // Assert
        expect(mockHttpServiceDelete).toHaveBeenCalledTimes(1);
        expect(mockHttpServiceDelete).toHaveBeenCalledWith({ path: `/work-package/${mockWorkPackageId}` });
        expect(response.status).toBeDefined();
      });

      it('should still return error even if work package deletion fails', async () => {
        // Arrange
        const mockError = new Error('Network error during amendments');
        const mockDeleteError = new Error('Delete failed');
        const mockHttpServiceDelete = jest.fn().mockRejectedValue(mockDeleteError);

        giftHttpService.delete = mockHttpServiceDelete;
        workPackageService = new GiftWorkPackageService(giftHttpService, logger);
        workPackageService.create = mockWorkPackageServiceCreate;

        buildService();

        jest.spyOn(service, 'handleCreateAmendments' as any).mockRejectedValueOnce(mockError);

        // Act
        const response = await service.createMultiple(mockFacilityId, mockMultipleAmendmentsPayload);

        // Assert
        expect(response.status).toBeDefined();
      });
    });

    describe('when amendments are successful, but work package deletion fails', () => {
      it('should return the work package deletion response', async () => {
        // Arrange
        const mockHttpServiceDelete = jest.fn().mockResolvedValue(mockResponse500());

        giftHttpService.delete = mockHttpServiceDelete;
        workPackageService = new GiftWorkPackageService(giftHttpService, logger);

        buildService();

        jest.spyOn(service, 'handleCreateAmendments' as any).mockResolvedValue({ status: HttpStatus.ACCEPTED });

        // Act
        const response = await service.createMultiple(mockFacilityId, mockMultipleAmendmentsPayload);

        // Assert
        const expected = mockResponse500();

        expect(response).toEqual(expected);
      });
    });
  });

  describe('giftAmountAmendmentService', () => {
    describe(`when giftAmountAmendmentService.facility does NOT return a ${HttpStatus.CREATED} status`, () => {
      it('should return the amendment response and not approve the work package', async () => {
        // Arrange
        const mockErrorResponse = {
          status: HttpStatus.BAD_REQUEST,
          data: { badRequest: true },
        };

        mockAmountAmendmentFacility = jest.fn().mockResolvedValueOnce(mockErrorResponse);
        amountAmendmentService.facility = mockAmountAmendmentFacility;

        buildService();

        // Act
        const response = await service.create(mockFacilityId, mockPayload);

        // Assert
        expect(response).toEqual(mockErrorResponse);
        expect(mockStatusServiceApproved).not.toHaveBeenCalled();
      });
    });

    describe('when giftAmountAmendmentService.facility throws an error', () => {
      it('should delete the work package and then throw an error', async () => {
        // Arrange
        const mockError = new Error('Network error during amendment');
        const mockHttpServiceDelete = jest.fn().mockResolvedValue(mockResponse204());

        mockAmountAmendmentFacility = jest.fn().mockRejectedValueOnce(mockError);
        amountAmendmentService.facility = mockAmountAmendmentFacility;

        giftHttpService.delete = mockHttpServiceDelete;
        workPackageService = new GiftWorkPackageService(giftHttpService, logger);
        workPackageService.create = mockWorkPackageServiceCreate;

        buildService();

        // Act
        const response = service.create(mockFacilityId, mockPayload);

        // Assert
        expect(mockHttpServiceDelete).toHaveBeenCalledTimes(1);
        expect(mockHttpServiceDelete).toHaveBeenCalledWith({ path: `/work-package/${mockWorkPackageId}` });

        const expected = new Error(`Error creating amendment ${mockPayload.amendmentType} for facility ${mockFacilityId}`, { cause: mockError });

        await expect(response).rejects.toThrow(expected);
      });

      it('should throw error even if work package deletion fails', async () => {
        // Arrange
        const mockError = new Error('Network error during amendment');
        const mockDeleteError = new Error('Delete failed');

        mockAmountAmendmentFacility = jest.fn().mockRejectedValueOnce(mockError);
        amountAmendmentService.facility = mockAmountAmendmentFacility;

        const mockHttpServiceDelete = jest.fn().mockRejectedValue(mockDeleteError);

        giftHttpService.delete = mockHttpServiceDelete;
        workPackageService = new GiftWorkPackageService(giftHttpService, logger);
        workPackageService.create = mockWorkPackageServiceCreate;

        buildService();

        // Act
        const response = service.create(mockFacilityId, mockPayload);

        // Assert
        const expected = new Error(`Error creating amendment ${mockPayload.amendmentType} for facility ${mockFacilityId}`, { cause: mockError });

        await expect(response).rejects.toThrow(expected);
      });
    });

    describe('when giftAmountAmendmentService.obligations throws an error', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockAmountAmendmentObligations = jest.fn().mockRejectedValueOnce(mockError);
        amountAmendmentService.obligations = mockAmountAmendmentObligations;

        buildService();

        // Act
        const response = service.create(mockFacilityId, mockPayload);

        // Assert
        const expected = new Error(`Error creating amendment ${mockPayload.amendmentType} for facility ${mockFacilityId}`, { cause: mockError });

        await expect(response).rejects.toThrow(expected);
      });
    });
  });

  describe('giftReplaceExpiryDateAmendmentService', () => {
    describe(`when giftReplaceExpiryDateAmendmentService.facility does NOT return a ${HttpStatus.CREATED} status`, () => {
      it('should return the amendment response and not approve the work package', async () => {
        // Arrange
        const mockErrorResponse = {
          status: HttpStatus.BAD_REQUEST,
          data: { badRequest: true },
        };

        mockReplaceExpiryDateAmendmentFacility = jest.fn().mockResolvedValueOnce(mockErrorResponse);
        replaceExpiryDateAmendmentService.facility = mockReplaceExpiryDateAmendmentFacility;

        buildService();

        // Act
        const response = await service.create(mockFacilityId, replaceExpiryDatePayload);

        // Assert
        expect(response).toEqual(mockErrorResponse);
        expect(mockStatusServiceApproved).not.toHaveBeenCalled();
      });
    });

    describe('when giftReplaceExpiryDateAmendmentService.facility throws an error', () => {
      it('should delete the work package and then throw an error', async () => {
        // Arrange
        const mockError = new Error('Network error during facility amendment');
        const mockHttpServiceDelete = jest.fn().mockResolvedValue(mockResponse204());

        mockReplaceExpiryDateAmendmentFacility = jest.fn().mockRejectedValueOnce(mockError);
        replaceExpiryDateAmendmentService.facility = mockReplaceExpiryDateAmendmentFacility;

        giftHttpService.delete = mockHttpServiceDelete;
        workPackageService = new GiftWorkPackageService(giftHttpService, logger);
        workPackageService.create = mockWorkPackageServiceCreate;

        buildService();

        // Act
        const response = service.create(mockFacilityId, replaceExpiryDatePayload);

        // Assert
        expect(mockHttpServiceDelete).toHaveBeenCalledTimes(1);
        expect(mockHttpServiceDelete).toHaveBeenCalledWith({ path: `/work-package/${mockWorkPackageId}` });

        const expected = new Error(`Error creating amendment ${replaceExpiryDatePayload.amendmentType} for facility ${mockFacilityId}`, { cause: mockError });

        await expect(response).rejects.toThrow(expected);
      });
    });

    describe('when giftReplaceExpiryDateAmendmentService.obligations throws an error', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockFacilityServiceGet = jest.fn().mockResolvedValueOnce(
          mockResponse200({
            ...mockFacilityResponseData,
            obligations: [{ id: 'obligation-1', maturityDateFollowsFacility: false }],
          }),
        );
        facilityService.get = mockFacilityServiceGet;

        mockReplaceExpiryDateAmendmentObligations = jest.fn().mockRejectedValueOnce(mockError);
        replaceExpiryDateAmendmentService.obligations = mockReplaceExpiryDateAmendmentObligations;

        buildService();

        // Act
        const response = service.create(mockFacilityId, replaceExpiryDatePayload);

        // Assert
        const expected = new Error(`Error creating amendment ${replaceExpiryDatePayload.amendmentType} for facility ${mockFacilityId}`, {
          cause: mockError,
        });

        await expect(response).rejects.toThrow(expected);
      });
    });
  });

  describe('giftStatusService.approved', () => {
    it('should call giftStatusService.approved for amount amendments', async () => {
      // Act
      await service.create(mockFacilityId, mockPayload);

      // Assert
      expect(mockStatusServiceApproved).toHaveBeenCalledTimes(1);
      expect(mockStatusServiceApproved).toHaveBeenCalledWith(mockFacilityId, WORK_PACKAGE_CREATION_RESPONSE_DATA.id);
    });

    describe(`when giftStatusService.approved does NOT return a ${HttpStatus.OK} status`, () => {
      describe.each([
        HttpStatus.ACCEPTED,
        HttpStatus.BAD_GATEWAY,
        HttpStatus.BAD_REQUEST,
        HttpStatus.CONFLICT,
        HttpStatus.CREATED,
        HttpStatus.FORBIDDEN,
        HttpStatus.I_AM_A_TEAPOT,
        HttpStatus.INTERNAL_SERVER_ERROR,
        HttpStatus.NOT_FOUND,
      ])('with status %s', (status) => {
        const mockResponseData = WORK_PACKAGE_APPROVE_RESPONSE_DATA;

        beforeEach(() => {
          // Arrange
          mockStatusServiceApproved = jest.fn().mockResolvedValueOnce({
            status,
            data: mockResponseData,
          });

          statusService.approved = mockStatusServiceApproved;

          buildService();
        });

        it(`should return ${HttpStatus.INTERNAL_SERVER_ERROR}`, async () => {
          // Act
          const response = await service.create(mockFacilityId, mockPayload);

          // Assert
          const expected = {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            data: {
              message: 'Unable to approve work package',
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            },
          };

          expect(response).toEqual(expected);
        });
      });
    });

    describe('when giftStatusService.approved throws an error', () => {
      it('should delete the work package and return an error response', async () => {
        // Arrange
        const mockError = new Error('Approval service error');
        (mockError as any).status = HttpStatus.INTERNAL_SERVER_ERROR;
        (mockError as any).cause = {
          data: { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Unable to approve work package' },
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        };

        mockStatusServiceApproved = jest.fn().mockRejectedValueOnce(mockError);

        statusService.approved = mockStatusServiceApproved;

        buildService();

        // Act
        const response = await service.create(mockFacilityId, mockPayload);

        // Assert
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.data).toBeDefined();
      });
    });
  });
});
