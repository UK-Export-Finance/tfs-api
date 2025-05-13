import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockAxiosError, mockResponse201 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftFixedFeeService } from './gift.fixed-fee.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftService } from './gift.service';
import { GiftStatusService } from './gift.status.service';

const {
  GIFT: {
    COUNTERPARTY,
    FACILITY_RESPONSE_DATA,
    FACILITY_CREATION_PAYLOAD: mockPayload,
    FIXED_FEE,
    OBLIGATION,
    REPAYMENT_PROFILE,
    WORK_PACKAGE_APPROVE_RESPONSE_DATA,
  },
} = EXAMPLES;

const { API_RESPONSE_MESSAGES } = GIFT;

const mockCreateInitialFacilityResponse = mockResponse201(FACILITY_RESPONSE_DATA);

const mockCounterparties = [COUNTERPARTY(), COUNTERPARTY(), COUNTERPARTY()];
const mockFixedFees = [FIXED_FEE(), FIXED_FEE()];
const mockObligations = [OBLIGATION(), OBLIGATION(), OBLIGATION()];
const mockRepaymentProfiles = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];

const mockCreateCounterpartiesResponse = mockCounterparties.map((counterparty) => mockResponse201(counterparty));
const mockCreateFixedFeesResponse = mockFixedFees.map((fixedFee) => mockResponse201(fixedFee));
const mockCreateObligationsResponse = mockObligations.map((counterparty) => mockResponse201(counterparty));
const mockRepaymentProfilesResponse = mockRepaymentProfiles.map((repaymentProfile) => mockResponse201(repaymentProfile));
const mockApproveStatusResponse = mockResponse201({ data: WORK_PACKAGE_APPROVE_RESPONSE_DATA });

describe('GiftService.createFacility - error handling', () => {
  const logger = new PinoLogger({});

  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let statusService: GiftStatusService;
  let service: GiftService;

  let giftHttpService;
  let createInitialFacilitySpy: jest.Mock;
  let createCounterpartiesSpy: jest.Mock;
  let createFixedFeesSpy: jest.Mock;
  let createObligationsSpy: jest.Mock;
  let createRepaymentProfilesSpy: jest.Mock;
  let statusServiceSpy: jest.Mock;

  beforeEach(() => {
    // Arrange
    counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    fixedFeeService = new GiftFixedFeeService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);

    createInitialFacilitySpy = jest.fn().mockResolvedValueOnce(mockCreateInitialFacilityResponse);
    createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCreateCounterpartiesResponse);
    createFixedFeesSpy = jest.fn().mockResolvedValueOnce(mockCreateFixedFeesResponse);
    createObligationsSpy = jest.fn().mockResolvedValueOnce(mockCreateObligationsResponse);
    createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockRepaymentProfilesResponse);
    statusServiceSpy = jest.fn().mockResolvedValueOnce(mockApproveStatusResponse);

    counterpartyService.createMany = createCounterpartiesSpy;
    fixedFeeService.createMany = createFixedFeesSpy;
    obligationService.createMany = createObligationsSpy;
    repaymentProfileService.createMany = createRepaymentProfilesSpy;

    service = new GiftService(giftHttpService, logger, counterpartyService, fixedFeeService, obligationService, repaymentProfileService, statusService);

    service.createInitialFacility = createInitialFacilitySpy;
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe(`when giftStatusService.approved returns ${HttpStatus.BAD_REQUEST}`, () => {
    beforeEach(() => {
      // Arrange
      statusServiceSpy = jest.fn().mockResolvedValueOnce(mockAxiosError({ status: HttpStatus.BAD_REQUEST }));

      statusService.approved = statusServiceSpy;

      service = new GiftService(giftHttpService, logger, counterpartyService, fixedFeeService, obligationService, repaymentProfileService, statusService);

      service.createInitialFacility = createInitialFacilitySpy;
    });

    it('should return an object with the giftStatusService.approved data and status', async () => {
      // Act
      const response = await service.createFacility(mockPayload);

      // Assert
      const expected = {
        status: HttpStatus.BAD_REQUEST,
        data: {
          statusCode: HttpStatus.BAD_REQUEST,
          message: API_RESPONSE_MESSAGES.APPROVED_STATUS_ERROR_MESSAGE,
        },
      };

      expect(response).toEqual(expected);
    });
  });

  describe(`when giftStatusService.approved returns ${HttpStatus.INTERNAL_SERVER_ERROR}`, () => {
    beforeEach(() => {
      // Arrange
      statusServiceSpy = jest.fn().mockResolvedValueOnce(mockAxiosError({ status: HttpStatus.INTERNAL_SERVER_ERROR }));

      statusService.approved = statusServiceSpy;

      service = new GiftService(giftHttpService, logger, counterpartyService, fixedFeeService, obligationService, repaymentProfileService, statusService);

      service.createInitialFacility = createInitialFacilitySpy;
    });

    it('should return an object with the giftStatusService.approved data and status', async () => {
      // Act
      const response = await service.createFacility(mockPayload);

      // Assert
      const expected = {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: API_RESPONSE_MESSAGES.APPROVED_STATUS_ERROR_MESSAGE,
        },
      };

      expect(response).toEqual(expected);
    });
  });

  describe('when giftStatusService.approved throws an error', () => {
    beforeEach(() => {
      // Arrange
      statusServiceSpy = jest.fn().mockRejectedValueOnce(mockAxiosError());

      statusService.approved = statusServiceSpy;

      service = new GiftService(giftHttpService, logger, counterpartyService, fixedFeeService, obligationService, repaymentProfileService, statusService);
    });

    it('should throw an error', async () => {
      // Act
      const response = service.createFacility(mockPayload);

      // Assert
      const expected = new Error('Error creating GIFT facility');

      await expect(response).rejects.toThrow(expected);
    });
  });
});
