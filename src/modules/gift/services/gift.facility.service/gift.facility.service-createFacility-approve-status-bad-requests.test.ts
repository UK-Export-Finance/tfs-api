import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockAxiosError, mockResponse200, mockResponse201 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import {
  GiftCounterpartyService,
  GiftCurrencyService,
  GiftFacilityAsyncValidationService,
  GiftFixedFeeService,
  GiftObligationService,
  GiftRepaymentProfileService,
  GiftStatusService,
} from '../';
import { GiftFacilityService } from './';

const {
  GIFT: {
    COUNTERPARTY,
    FACILITY_ID: mockFacilityId,
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

const mockAsyncValidationServiceCreationResponse = [];
const mockCreateCounterpartiesResponse = mockCounterparties.map((counterparty) => mockResponse201(counterparty));
const mockCreateFixedFeesResponse = mockFixedFees.map((fixedFee) => mockResponse201(fixedFee));
const mockCreateObligationsResponse = mockObligations.map((counterparty) => mockResponse201(counterparty));
const mockRepaymentProfilesResponse = mockRepaymentProfiles.map((repaymentProfile) => mockResponse201(repaymentProfile));
const mockApprovedStatusResponse = mockResponse200({ data: WORK_PACKAGE_APPROVE_RESPONSE_DATA });

describe('GiftFacilityService.create - error handling', () => {
  const logger = new PinoLogger({});

  let asyncValidationService: GiftFacilityAsyncValidationService;
  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let statusService: GiftStatusService;
  let service: GiftFacilityService;

  let giftHttpService;
  let asyncValidationServiceCreationSpy: jest.Mock;
  let createInitialFacilitySpy: jest.Mock;
  let createCounterpartiesSpy: jest.Mock;
  let createFixedFeesSpy: jest.Mock;
  let createObligationsSpy: jest.Mock;
  let createRepaymentProfilesSpy: jest.Mock;
  let approvedStatusSpy: jest.Mock;

  beforeEach(() => {
    // Arrange
    const currencyService = new GiftCurrencyService(giftHttpService, logger);

    asyncValidationService = new GiftFacilityAsyncValidationService(logger, currencyService);
    counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    fixedFeeService = new GiftFixedFeeService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);

    asyncValidationServiceCreationSpy = jest.fn().mockResolvedValueOnce(mockAsyncValidationServiceCreationResponse);
    createInitialFacilitySpy = jest.fn().mockResolvedValueOnce(mockCreateInitialFacilityResponse);
    createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCreateCounterpartiesResponse);
    createFixedFeesSpy = jest.fn().mockResolvedValueOnce(mockCreateFixedFeesResponse);
    createObligationsSpy = jest.fn().mockResolvedValueOnce(mockCreateObligationsResponse);
    createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockRepaymentProfilesResponse);
    approvedStatusSpy = jest.fn().mockResolvedValueOnce(mockApprovedStatusResponse);

    asyncValidationService.creation = asyncValidationServiceCreationSpy;
    counterpartyService.createMany = createCounterpartiesSpy;
    fixedFeeService.createMany = createFixedFeesSpy;
    obligationService.createMany = createObligationsSpy;
    repaymentProfileService.createMany = createRepaymentProfilesSpy;

    service = new GiftFacilityService(
      giftHttpService,
      logger,
      asyncValidationService,
      counterpartyService,
      fixedFeeService,
      obligationService,
      repaymentProfileService,
      statusService,
    );

    service.createInitialFacility = createInitialFacilitySpy;
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe(`when giftStatusService.approved returns ${HttpStatus.BAD_REQUEST}`, () => {
    beforeEach(() => {
      // Arrange
      approvedStatusSpy = jest.fn().mockResolvedValueOnce(mockAxiosError({ status: HttpStatus.BAD_REQUEST }));

      statusService.approved = approvedStatusSpy;

      service = new GiftFacilityService(
        giftHttpService,
        logger,
        asyncValidationService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        statusService,
      );

      service.createInitialFacility = createInitialFacilitySpy;
    });

    it('should return an object with the giftStatusService.approved data and status', async () => {
      // Act
      const response = await service.create(mockPayload, mockFacilityId);

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
      approvedStatusSpy = jest.fn().mockResolvedValueOnce(mockAxiosError({ status: HttpStatus.INTERNAL_SERVER_ERROR }));

      statusService.approved = approvedStatusSpy;

      service = new GiftFacilityService(
        giftHttpService,
        logger,
        asyncValidationService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        statusService,
      );

      service.createInitialFacility = createInitialFacilitySpy;
    });

    it('should return an object with the giftStatusService.approved data and status', async () => {
      // Act
      const response = await service.create(mockPayload, mockFacilityId);

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
});
