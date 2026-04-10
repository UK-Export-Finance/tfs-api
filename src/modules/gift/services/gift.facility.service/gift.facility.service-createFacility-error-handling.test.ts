import { HttpStatus } from '@nestjs/common';
import { EXAMPLES } from '@ukef/constants';
import { MdmService } from '@ukef/modules/mdm/mdm.service';
import { mockGiftFacilityCreationErrorService } from '@ukef-test/gift/mock-services';
import { mockAxiosError, mockResponse201, mockResponse204 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import {
  GiftAccrualScheduleService,
  GiftBusinessCalendarsConventionService,
  GiftBusinessCalendarService,
  GiftCounterpartyService,
  GiftCurrencyService,
  GiftFacilityAsyncValidationService,
  GiftFacilityCreationErrorService,
  GiftFeeTypeService,
  GiftFixedFeeService,
  GiftObligationService,
  GiftProductTypeService,
  GiftRepaymentProfileService,
  GiftRiskDetailsService,
  GiftStatusService,
} from '../';
import { GiftFacilityService } from './';

const {
  GIFT: {
    ACCRUAL_SCHEDULE,
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
    WORK_PACKAGE_ID: mockWorkPackageId,
  },
} = EXAMPLES;

const mockHttpPostResponse = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

const mockAccrualSchedules = [ACCRUAL_SCHEDULE, ACCRUAL_SCHEDULE];
const mockBusinessCalendar = BUSINESS_CALENDAR;
const mockCounterparties = [COUNTERPARTY(), COUNTERPARTY(), COUNTERPARTY()];
const mockFixedFees = [FIXED_FEE(), FIXED_FEE()];
const mockObligations = [OBLIGATION(), OBLIGATION(), OBLIGATION()];
const mockRepaymentProfiles = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];
const mockRiskDetails = RISK_DETAILS;

const mockAsyncValidationServiceCreationResponse = [];
const mockCreateAccrualSchedulesResponse = mockAccrualSchedules.map((accrualSchedule) => mockResponse201({ data: accrualSchedule }));
const mockCreateBusinessCalendarResponse = mockResponse201({ data: mockBusinessCalendar });
const mockCreateBusinessCalendarsConventionResponse = mockResponse201({ data: BUSINESS_CALENDAR });
const mockCreateCounterpartiesResponse = mockCounterparties.map((counterparty) => mockResponse201(counterparty));
const mockCreateFixedFeesResponse = mockFixedFees.map((fixedFee) => mockResponse201(fixedFee));
const mockCreateObligationsResponse = mockObligations.map((counterparty) => mockResponse201(counterparty));
const mockCreateRepaymentProfilesResponse = mockRepaymentProfiles.map((repaymentProfile) => mockResponse201(repaymentProfile));
const mockCreateRiskDetailsResponse = mockResponse201({ data: mockRiskDetails });
const mockApprovedStatusResponse = mockResponse201({ data: WORK_PACKAGE_APPROVE_RESPONSE_DATA });
const mockFinallyHandlerResponse = mockResponse204();

describe('GiftFacilityService.create - error handling', () => {
  const logger = new PinoLogger({});

  let asyncValidationService: GiftFacilityAsyncValidationService;
  let accrualScheduleService: GiftAccrualScheduleService;
  let businessCalendarService: GiftBusinessCalendarService;
  let businessCalendarsConventionService: GiftBusinessCalendarsConventionService;
  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let riskDetailsService: GiftRiskDetailsService;
  let statusService: GiftStatusService;
  let creationErrorService: GiftFacilityCreationErrorService;
  let service: GiftFacilityService;

  let giftHttpService;
  let httpService;
  let mockHttpServicePost: jest.Mock;
  let asyncValidationServiceCreationSpy: jest.Mock;
  let createInitialFacilitySpy: jest.Mock;
  let createAccrualSchedulesSpy: jest.Mock;
  let createBusinessCalendarSpy: jest.Mock;
  let createBusinessCalendarsConventionSpy: jest.Mock;
  let createCounterpartiesSpy: jest.Mock;
  let createFixedFeesSpy: jest.Mock;
  let createObligationsSpy: jest.Mock;
  let createRepaymentProfilesSpy: jest.Mock;
  let createRiskDetailsSpy: jest.Mock;
  let approvedStatusSpy: jest.Mock;
  let finallyHandlerSpy: jest.Mock;

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

    accrualScheduleService = new GiftAccrualScheduleService(giftHttpService, logger);
    counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    const currencyService = new GiftCurrencyService(giftHttpService, logger);
    const feeTypeService = new GiftFeeTypeService(giftHttpService, logger);
    httpService = giftHttpService;
    const mdmService = new MdmService(httpService, logger);
    const productTypeService = new GiftProductTypeService(giftHttpService, logger);

    asyncValidationService = new GiftFacilityAsyncValidationService(
      logger,
      counterpartyService,
      currencyService,
      feeTypeService,
      mdmService,
      productTypeService,
    );

    accrualScheduleService = new GiftAccrualScheduleService(giftHttpService, logger);
    businessCalendarService = new GiftBusinessCalendarService(giftHttpService, logger);
    businessCalendarsConventionService = new GiftBusinessCalendarsConventionService(giftHttpService, logger);
    fixedFeeService = new GiftFixedFeeService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    riskDetailsService = new GiftRiskDetailsService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);
    creationErrorService = mockGiftFacilityCreationErrorService();

    asyncValidationServiceCreationSpy = jest.fn().mockResolvedValueOnce(mockAsyncValidationServiceCreationResponse);
    createInitialFacilitySpy = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    createAccrualSchedulesSpy = jest.fn().mockResolvedValueOnce(mockCreateAccrualSchedulesResponse);
    createBusinessCalendarSpy = jest.fn().mockResolvedValueOnce(mockCreateBusinessCalendarResponse);
    createBusinessCalendarsConventionSpy = jest.fn().mockResolvedValueOnce(mockCreateBusinessCalendarsConventionResponse);
    createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCreateCounterpartiesResponse);
    createFixedFeesSpy = jest.fn().mockResolvedValueOnce(mockCreateFixedFeesResponse);
    createObligationsSpy = jest.fn().mockResolvedValueOnce(mockCreateObligationsResponse);
    createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockCreateRepaymentProfilesResponse);
    createRiskDetailsSpy = jest.fn().mockResolvedValueOnce(mockCreateRiskDetailsResponse);
    approvedStatusSpy = jest.fn().mockResolvedValueOnce(mockApprovedStatusResponse);
    finallyHandlerSpy = jest.fn().mockResolvedValueOnce(mockFinallyHandlerResponse);

    asyncValidationService.creation = asyncValidationServiceCreationSpy;
    accrualScheduleService.createMany = createAccrualSchedulesSpy;
    businessCalendarService.createOne = createBusinessCalendarSpy;
    businessCalendarsConventionService.createOne = createBusinessCalendarsConventionSpy;
    counterpartyService.createMany = createCounterpartiesSpy;
    fixedFeeService.createMany = createFixedFeesSpy;
    obligationService.createMany = createObligationsSpy;
    repaymentProfileService.createMany = createRepaymentProfilesSpy;
    riskDetailsService.createOne = createRiskDetailsSpy;
    statusService.approved = approvedStatusSpy;
    creationErrorService.finallyHandler = finallyHandlerSpy;

    service = new GiftFacilityService(
      giftHttpService,
      logger,
      asyncValidationService,
      accrualScheduleService,
      businessCalendarService,
      businessCalendarsConventionService,
      counterpartyService,
      fixedFeeService,
      obligationService,
      repaymentProfileService,
      riskDetailsService,
      statusService,
      creationErrorService,
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
        accrualScheduleService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
        creationErrorService,
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

    it('should call giftFacilityCreationErrorService.finallyHandler (without a work package ID)', async () => {
      // Act
      await expect(service.create(mockPayload, mockFacilityId)).rejects.toThrow();

      // Assert
      expect(finallyHandlerSpy).toHaveBeenCalledTimes(1);
      expect(finallyHandlerSpy).toHaveBeenCalledWith({
        facilityId: mockFacilityId,
        creationCatchError: mockError,
      });
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
        accrualScheduleService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
        creationErrorService,
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

    it('should call giftFacilityCreationErrorService.finallyHandler', async () => {
      // Act
      await expect(service.create(mockPayload, mockFacilityId)).rejects.toThrow();

      // Assert
      expect(finallyHandlerSpy).toHaveBeenCalledTimes(1);
      expect(finallyHandlerSpy).toHaveBeenCalledWith({
        facilityId: mockFacilityId,
        workPackageId: mockWorkPackageId,
        creationCatchError: mockError,
      });
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
        accrualScheduleService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
        creationErrorService,
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

    it('should call giftFacilityCreationErrorService.finallyHandler', async () => {
      // Act
      await expect(service.create(mockPayload, mockFacilityId)).rejects.toThrow();

      // Assert
      expect(finallyHandlerSpy).toHaveBeenCalledTimes(1);
      expect(finallyHandlerSpy).toHaveBeenCalledWith({
        facilityId: mockFacilityId,
        workPackageId: mockWorkPackageId,
        creationCatchError: mockError,
      });
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
        accrualScheduleService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
        creationErrorService,
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

    it('should call giftFacilityCreationErrorService.finallyHandler', async () => {
      // Act
      await expect(service.create(mockPayload, mockFacilityId)).rejects.toThrow();

      // Assert
      expect(finallyHandlerSpy).toHaveBeenCalledTimes(1);
      expect(finallyHandlerSpy).toHaveBeenCalledWith({
        facilityId: mockFacilityId,
        workPackageId: mockWorkPackageId,
        creationCatchError: mockError,
      });
    });
  });

  describe('when accrualScheduleService.createMany throws an error', () => {
    beforeEach(() => {
      // Arrange
      createAccrualSchedulesSpy = jest.fn().mockRejectedValueOnce(mockError);

      accrualScheduleService.createMany = createAccrualSchedulesSpy;

      service = new GiftFacilityService(
        giftHttpService,
        logger,
        asyncValidationService,
        accrualScheduleService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
        creationErrorService,
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

    it('should call giftFacilityCreationErrorService.finallyHandler', async () => {
      // Act
      await expect(service.create(mockPayload, mockFacilityId)).rejects.toThrow();

      // Assert
      expect(finallyHandlerSpy).toHaveBeenCalledTimes(1);
      expect(finallyHandlerSpy).toHaveBeenCalledWith({
        facilityId: mockFacilityId,
        workPackageId: mockWorkPackageId,
        creationCatchError: mockError,
      });
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
        accrualScheduleService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
        creationErrorService,
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

    it('should call giftFacilityCreationErrorService.finallyHandler', async () => {
      // Act
      await expect(service.create(mockPayload, mockFacilityId)).rejects.toThrow();

      // Assert
      expect(finallyHandlerSpy).toHaveBeenCalledTimes(1);
      expect(finallyHandlerSpy).toHaveBeenCalledWith({
        facilityId: mockFacilityId,
        workPackageId: mockWorkPackageId,
        creationCatchError: mockError,
      });
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
        accrualScheduleService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
        creationErrorService,
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

    it('should call giftFacilityCreationErrorService.finallyHandler', async () => {
      // Act
      await expect(service.create(mockPayload, mockFacilityId)).rejects.toThrow();

      // Assert
      expect(finallyHandlerSpy).toHaveBeenCalledTimes(1);
      expect(finallyHandlerSpy).toHaveBeenCalledWith({
        facilityId: mockFacilityId,
        workPackageId: mockWorkPackageId,
        creationCatchError: mockError,
      });
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
        accrualScheduleService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
        creationErrorService,
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

    it('should call giftFacilityCreationErrorService.finallyHandler', async () => {
      // Act
      await expect(service.create(mockPayload, mockFacilityId)).rejects.toThrow();

      // Assert
      expect(finallyHandlerSpy).toHaveBeenCalledTimes(1);
      expect(finallyHandlerSpy).toHaveBeenCalledWith({
        facilityId: mockFacilityId,
        workPackageId: mockWorkPackageId,
        creationCatchError: mockError,
      });
    });
  });
});
