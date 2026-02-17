import { HttpStatus } from '@nestjs/common';
import { EXAMPLES } from '@ukef/constants';
import { mockAxiosError, mockResponse201 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import {
  GiftBusinessCalendarsConventionService,
  GiftBusinessCalendarService,
  GiftCounterpartyService,
  GiftCurrencyService,
  GiftFacilityAsyncValidationService,
  GiftFeeTypeService,
  GiftFixedFeeService,
  GiftObligationService,
  GiftObligationSubtypeService,
  GiftProductTypeService,
  GiftRepaymentProfileService,
  GiftRiskDetailsService,
  GiftStatusService,
} from '../';
import { GiftFacilityService } from './';

const {
  GIFT: {
    BUSINESS_CALENDAR,
    COUNTERPARTY,
    FACILITY_ID: mockFacilityId,
    FACILITY_RESPONSE_DATA,
    FACILITY_CREATION_PAYLOAD: mockPayload,
    FIXED_FEE,
    OBLIGATION,
    REPAYMENT_PROFILE,
    RISK_DETAILS,
    WORK_PACKAGE_APPROVE_RESPONSE_DATA,
  },
} = EXAMPLES;

const mockHttpPostResponse = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

const mockBusinessCalendar = BUSINESS_CALENDAR;
const mockCounterparties = [COUNTERPARTY(), COUNTERPARTY(), COUNTERPARTY()];
const mockFixedFees = [FIXED_FEE(), FIXED_FEE()];
const mockObligations = [OBLIGATION(), OBLIGATION(), OBLIGATION()];
const mockRepaymentProfiles = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];
const mockRiskDetails = RISK_DETAILS;

const mockCreateBusinessCalendarResponse = mockResponse201({ data: mockBusinessCalendar });
const mockCreateBusinessCalendarsConventionResponse = mockResponse201({ data: BUSINESS_CALENDAR });
const mockCreateCounterpartiesResponse = mockCounterparties.map((counterparty) => mockResponse201(counterparty));
const mockCreateFixedFeesResponse = mockFixedFees.map((fixedFee) => mockResponse201(fixedFee));
const mockCreateObligationsResponse = mockObligations.map((counterparty) => mockResponse201(counterparty));
const mockCreateRepaymentProfilesResponse = mockRepaymentProfiles.map((repaymentProfile) => mockResponse201(repaymentProfile));
const mockCreateRiskDetailsResponse = mockResponse201({ data: mockRiskDetails });
const mockApprovedStatusResponse = mockResponse201({ data: WORK_PACKAGE_APPROVE_RESPONSE_DATA });

describe('GiftFacilityService.create - error handling', () => {
  const logger = new PinoLogger({});

  let asyncValidationService: GiftFacilityAsyncValidationService;
  let businessCalendarService: GiftBusinessCalendarService;
  let businessCalendarsConventionService: GiftBusinessCalendarsConventionService;
  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let riskDetailsService: GiftRiskDetailsService;
  let statusService: GiftStatusService;
  let service: GiftFacilityService;

  let giftHttpService;
  let mockHttpServicePost: jest.Mock;
  let asyncValidationServiceCreationSpy: jest.Mock;
  let createInitialFacilitySpy: jest.Mock;
  let createBusinessCalendarSpy: jest.Mock;
  let createBusinessCalendarsConventionSpy: jest.Mock;
  let createCounterpartiesSpy: jest.Mock;
  let createFixedFeesSpy: jest.Mock;
  let createObligationsSpy: jest.Mock;
  let createRepaymentProfilesSpy: jest.Mock;
  let createRiskDetailsSpy: jest.Mock;
  let approvedStatusSpy: jest.Mock;

  const mockAxiosErrorStatus = HttpStatus.BAD_REQUEST;

  const mockAxiosErrorData = {
    validationErrors: [{ mock: true }],
  };

  const mockError = mockAxiosError({ data: mockAxiosErrorData, status: HttpStatus.BAD_REQUEST });

  beforeEach(() => {
    // Arrange
    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockHttpPostResponse);

    giftHttpService = {
      post: mockHttpServicePost,
    };

    counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    const currencyService = new GiftCurrencyService(giftHttpService, logger);
    const feeTypeService = new GiftFeeTypeService(giftHttpService, logger);
    const obligationSubtypeService = new GiftObligationSubtypeService(giftHttpService, logger);
    const productTypeService = new GiftProductTypeService(giftHttpService, logger);

    asyncValidationService = new GiftFacilityAsyncValidationService(
      logger,
      counterpartyService,
      currencyService,
      feeTypeService,
      obligationSubtypeService,
      productTypeService,
    );

    businessCalendarService = new GiftBusinessCalendarService(giftHttpService, logger);
    businessCalendarsConventionService = new GiftBusinessCalendarsConventionService(giftHttpService, logger);
    fixedFeeService = new GiftFixedFeeService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    riskDetailsService = new GiftRiskDetailsService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);

    createInitialFacilitySpy = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    createBusinessCalendarSpy = jest.fn().mockResolvedValueOnce(mockCreateBusinessCalendarResponse);
    createBusinessCalendarsConventionSpy = jest.fn().mockResolvedValueOnce(mockCreateBusinessCalendarsConventionResponse);
    createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCreateCounterpartiesResponse);
    createFixedFeesSpy = jest.fn().mockResolvedValueOnce(mockCreateFixedFeesResponse);
    createObligationsSpy = jest.fn().mockResolvedValueOnce(mockCreateObligationsResponse);
    createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockCreateRepaymentProfilesResponse);
    createRiskDetailsSpy = jest.fn().mockResolvedValueOnce(mockCreateRiskDetailsResponse);
    approvedStatusSpy = jest.fn().mockResolvedValueOnce(mockApprovedStatusResponse);

    asyncValidationService.creation = asyncValidationServiceCreationSpy;
    businessCalendarService.createOne = createBusinessCalendarSpy;
    businessCalendarsConventionService.createOne = createBusinessCalendarsConventionSpy;
    counterpartyService.createMany = createCounterpartiesSpy;
    fixedFeeService.createMany = createFixedFeesSpy;
    obligationService.createMany = createObligationsSpy;
    repaymentProfileService.createMany = createRepaymentProfilesSpy;
    riskDetailsService.createOne = createRiskDetailsSpy;
    statusService.approved = approvedStatusSpy;

    service = new GiftFacilityService(
      giftHttpService,
      logger,
      asyncValidationService,
      businessCalendarService,
      businessCalendarsConventionService,
      counterpartyService,
      fixedFeeService,
      obligationService,
      repaymentProfileService,
      riskDetailsService,
      statusService,
    );

    service.createInitialFacility = createInitialFacilitySpy;
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('when giftFacilityService.createInitialFacility throws an error', () => {
    beforeEach(() => {
      // Arrange
      createInitialFacilitySpy = jest.fn().mockRejectedValueOnce(mockError);

      service = new GiftFacilityService(
        giftHttpService,
        logger,
        asyncValidationService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
      );

      service.createInitialFacility = createInitialFacilitySpy;
    });

    it('should throw an error', async () => {
      // Act
      const response = service.create(mockPayload, mockFacilityId);

      // Assert
      const expected = new Error(`Error creating a GIFT facility ${mockFacilityId}`, { cause: mockError });

      await expect(response).rejects.toThrow(expected);
    });
  });

  describe('when counterpartyService.createMany throws an error', () => {
    beforeEach(() => {
      // Arrange
      createCounterpartiesSpy = jest.fn().mockRejectedValueOnce(mockError);

      counterpartyService.createMany = createCounterpartiesSpy;

      service = new GiftFacilityService(
        giftHttpService,
        logger,
        asyncValidationService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
      );

      service.createInitialFacility = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    });

    it('should throw an error', async () => {
      // Act
      const response = service.create(mockPayload, mockFacilityId);

      // Assert
      const expected = new Error(`Error creating a GIFT facility ${mockFacilityId}`, { cause: mockError });

      await expect(response).rejects.toThrow(expected);
    });
  });

  describe('when fixedFeeService.createMany throws an error', () => {
    beforeEach(() => {
      // Arrange
      createFixedFeesSpy = jest.fn().mockRejectedValueOnce(mockError);

      fixedFeeService.createMany = createFixedFeesSpy;

      service = new GiftFacilityService(
        giftHttpService,
        logger,
        asyncValidationService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
      );

      service.createInitialFacility = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    });

    it('should throw an error', async () => {
      // Act
      const response = service.create(mockPayload, mockFacilityId);

      // Assert
      const expected = new Error(`Error creating a GIFT facility ${mockFacilityId}`, { cause: mockError });

      await expect(response).rejects.toThrow(expected);
    });
  });

  describe('when obligationsService.createMany throws an error', () => {
    beforeEach(() => {
      // Arrange
      createObligationsSpy = jest.fn().mockRejectedValueOnce(mockAxiosError({ data: mockAxiosErrorData, status: mockAxiosErrorStatus }));

      obligationService.createMany = createObligationsSpy;

      service = new GiftFacilityService(
        giftHttpService,
        logger,
        asyncValidationService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
      );

      service.createInitialFacility = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    });

    it('should throw an error', async () => {
      // Act
      const response = service.create(mockPayload, mockFacilityId);

      // Assert
      const expected = new Error(`Error creating a GIFT facility ${mockFacilityId}`, { cause: mockError });

      await expect(response).rejects.toThrow(expected);
    });
  });

  describe('when repaymentProfileService.createMany throws an error', () => {
    beforeEach(() => {
      // Arrange
      createRepaymentProfilesSpy = jest.fn().mockRejectedValueOnce(mockAxiosError({ data: mockAxiosErrorData, status: HttpStatus.BAD_REQUEST }));

      repaymentProfileService.createMany = createRepaymentProfilesSpy;

      service = new GiftFacilityService(
        giftHttpService,
        logger,
        asyncValidationService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
      );

      service.createInitialFacility = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    });

    it('should throw an error', async () => {
      // Act
      const response = service.create(mockPayload, mockFacilityId);

      // Assert
      const expected = new Error(`Error creating a GIFT facility ${mockFacilityId}`, { cause: mockError });

      await expect(response).rejects.toThrow(expected);
    });
  });

  describe('when riskDetailsService.createOne throws an error', () => {
    beforeEach(() => {
      // Arrange
      createRiskDetailsSpy = jest.fn().mockRejectedValueOnce(mockAxiosError({ data: mockAxiosErrorData, status: HttpStatus.BAD_REQUEST }));

      riskDetailsService.createOne = createRiskDetailsSpy;

      service = new GiftFacilityService(
        giftHttpService,
        logger,
        asyncValidationService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
      );

      service.createInitialFacility = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    });

    it('should throw an error', async () => {
      // Act
      const response = service.create(mockPayload, mockFacilityId);

      // Assert
      const expected = new Error(`Error creating a GIFT facility ${mockFacilityId}`, { cause: mockError });

      await expect(response).rejects.toThrow(expected);
    });
  });

  describe('when giftStatusService.approved throws an error', () => {
    beforeEach(() => {
      // Arrange
      approvedStatusSpy = jest.fn().mockRejectedValueOnce(mockAxiosError({ data: mockAxiosErrorData, status: HttpStatus.BAD_REQUEST }));

      statusService.approved = approvedStatusSpy;

      service = new GiftFacilityService(
        giftHttpService,
        logger,
        asyncValidationService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
      );

      service.createInitialFacility = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    });

    it('should throw an error', async () => {
      // Act
      const response = service.create(mockPayload, mockFacilityId);

      // Assert
      const expected = new Error(`Error creating a GIFT facility ${mockFacilityId}`, { cause: mockError });

      await expect(response).rejects.toThrow(expected);
    });
  });
});
