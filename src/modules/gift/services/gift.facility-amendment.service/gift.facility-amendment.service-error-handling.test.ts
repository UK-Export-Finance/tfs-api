import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse200, mockResponse201, mockResponse500 } from '@ukef-test/http-response';
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
    FACILITY_RESPONSE_DATA,
    WORK_PACKAGE_APPROVE_RESPONSE_DATA,
    WORK_PACKAGE_CREATION_RESPONSE_DATA,
  },
} = EXAMPLES;

const {
  AMEND_FACILITY_TYPES: { AMEND_FACILITY_REPLACE_EXPIRY_DATE },
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
    giftHttpService = {};

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
    mockStatusServiceApproved = jest.fn().mockResolvedValueOnce(mockResponse200(WORK_PACKAGE_APPROVE_RESPONSE_DATA));

    facilityService.get = mockFacilityServiceGet;
    workPackageService.create = mockWorkPackageServiceCreate;
    amountAmendmentService.facility = mockAmountAmendmentFacility;
    amountAmendmentService.obligations = mockAmountAmendmentObligations;
    replaceExpiryDateAmendmentService.facility = mockReplaceExpiryDateAmendmentFacility;
    replaceExpiryDateAmendmentService.obligations = mockReplaceExpiryDateAmendmentObligations;
    statusService.approved = mockStatusServiceApproved;

    buildService();
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

  describe('giftAmountAmendmentService', () => {
    describe('when giftAmountAmendmentService.facility throws an error', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockAmountAmendmentFacility = jest.fn().mockRejectedValueOnce(mockError);
        amountAmendmentService.facility = mockAmountAmendmentFacility;

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
    describe('when giftReplaceExpiryDateAmendmentService.facility throws an error', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockReplaceExpiryDateAmendmentFacility = jest.fn().mockRejectedValueOnce(mockError);
        replaceExpiryDateAmendmentService.facility = mockReplaceExpiryDateAmendmentFacility;

        buildService();

        // Act
        const response = service.create(mockFacilityId, replaceExpiryDatePayload);

        // Assert
        const expected = new Error(`Error creating amendment ${replaceExpiryDatePayload.amendmentType} for facility ${mockFacilityId}`, { cause: mockError });

        await expect(response).rejects.toThrow(expected);
      });
    });

    describe('when giftReplaceExpiryDateAmendmentService.obligations throws an error', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

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

        it('should throw an error', async () => {
          // Act
          const response = service.create(mockFacilityId, mockPayload);

          // Assert
          await expect(response).rejects.toThrow(`Error creating amendment ${mockPayload.amendmentType} for facility ${mockFacilityId}`);
        });
      });
    });

    describe('when giftStatusService.approved throws an error', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockStatusServiceApproved = jest.fn().mockRejectedValueOnce(mockError);

        statusService.approved = mockStatusServiceApproved;

        buildService();

        // Act
        const response = service.create(mockFacilityId, mockPayload);

        // Assert
        await expect(response).rejects.toThrow(`Error creating amendment ${mockPayload.amendmentType} for facility ${mockFacilityId}`);
      });
    });
  });
});
