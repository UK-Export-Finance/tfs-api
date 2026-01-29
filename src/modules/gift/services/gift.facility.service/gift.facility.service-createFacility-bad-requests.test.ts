import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201 } from '@ukef-test/http-response';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { mapAllValidationErrorResponses, mapValidationErrorResponses } from '../../helpers';
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
  GiftStatusService,
} from '../';
import { GiftFacilityService } from './';

const {
  GIFT: {
    BUSINESS_CALENDAR,
    BUSINESS_CALENDARS_CONVENTION,
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

const { API_RESPONSE_MESSAGES, ENTITY_NAMES } = GIFT;

const mockCreateInitialFacilityResponse = mockResponse201(FACILITY_RESPONSE_DATA);

const mockBusinessCalendar = BUSINESS_CALENDAR;
const mockBusinessCalendarsConvention = BUSINESS_CALENDARS_CONVENTION;
const mockCounterparties = [COUNTERPARTY(), COUNTERPARTY(), COUNTERPARTY()];
const mockFixedFees = [FIXED_FEE(), FIXED_FEE()];
const mockObligations = [OBLIGATION(), OBLIGATION(), OBLIGATION()];
const mockRepaymentProfiles = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];

const mockAsyncValidationServiceCreationResponse = [];
const mockCreateBusinessCalendarResponse = mockResponse201({ data: mockBusinessCalendar });
const mockCreateBusinessCalendarsConventionResponse = mockResponse201({ data: mockBusinessCalendarsConvention });

const mockCreateCounterpartiesResponse = mockCounterparties.map((counterparty) => mockResponse201(counterparty));
const mockCreateFixedFeesResponse = mockFixedFees.map((fixedFee) => mockResponse201(fixedFee));
const mockCreateObligationsResponse = mockObligations.map((counterparty) => mockResponse201(counterparty));
const mockRepaymentProfilesResponse = mockRepaymentProfiles.map((repaymentProfile) => mockResponse201(repaymentProfile));
const mockApprovedStatusResponse = mockResponse201({ data: WORK_PACKAGE_APPROVE_RESPONSE_DATA });

describe('GiftFacilityService.create - bad requests', () => {
  const logger = new PinoLogger({});

  let asyncValidationService: GiftFacilityAsyncValidationService;
  let businessCalendarService: GiftBusinessCalendarService;
  let businessCalendarsConventionService: GiftBusinessCalendarsConventionService;
  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let statusService: GiftStatusService;
  let service: GiftFacilityService;

  let giftHttpService;
  let asyncValidationServiceCreationSpy: jest.Mock;
  let createInitialFacilitySpy: jest.Mock;
  let createBusinessCalendarSpy: jest.Mock;
  let createBusinessCalendarsConventionSpy: jest.Mock;
  let createCounterpartiesSpy: jest.Mock;
  let createFixedFeesSpy: jest.Mock;
  let createObligationsSpy: jest.Mock;
  let createRepaymentProfilesSpy: jest.Mock;
  let approvedStatusSpy: jest.Mock;

  beforeEach(() => {
    // Arrange
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
    counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    fixedFeeService = new GiftFixedFeeService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);

    asyncValidationServiceCreationSpy = jest.fn().mockResolvedValueOnce(mockAsyncValidationServiceCreationResponse);
    createInitialFacilitySpy = jest.fn().mockResolvedValueOnce(mockCreateInitialFacilityResponse);
    createBusinessCalendarSpy = jest.fn().mockResolvedValueOnce(mockCreateBusinessCalendarResponse);
    createBusinessCalendarsConventionSpy = jest.fn().mockResolvedValueOnce(mockCreateBusinessCalendarsConventionResponse);
    createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCreateCounterpartiesResponse);
    createFixedFeesSpy = jest.fn().mockResolvedValueOnce(mockCreateFixedFeesResponse);
    createObligationsSpy = jest.fn().mockResolvedValueOnce(mockCreateObligationsResponse);
    createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockRepaymentProfilesResponse);
    approvedStatusSpy = jest.fn().mockResolvedValueOnce(mockApprovedStatusResponse);

    asyncValidationService.creation = asyncValidationServiceCreationSpy;
    businessCalendarService.createOne = createBusinessCalendarSpy;
    businessCalendarsConventionService.createOne = createBusinessCalendarsConventionSpy;
    counterpartyService.createMany = createCounterpartiesSpy;
    fixedFeeService.createMany = createFixedFeesSpy;
    obligationService.createMany = createObligationsSpy;
    repaymentProfileService.createMany = createRepaymentProfilesSpy;
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
      statusService,
    );

    service.createInitialFacility = createInitialFacilitySpy;
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe(`when a service returns a first item with a status that is ${HttpStatus.CREATED}, but other items have ${HttpStatus.BAD_REQUEST}`, () => {
    const mockResponse = [
      {
        status: HttpStatus.CREATED,
        data: {},
      },
      {
        status: HttpStatus.BAD_REQUEST,
        data: {
          validationErrors: [{ message: 'Mock validation error' }],
        },
      },
    ] as AxiosResponse[];

    describe('counterpartyService.createMany', () => {
      beforeEach(() => {
        // Arrange
        createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        counterpartyService.createMany = createCounterpartiesSpy;
      });

      it('should return an object with mapped counterparty errors', async () => {
        // Act
        const response = await service.create(mockPayload, mockFacilityId);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.COUNTERPARTY,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.GIFT_FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
      });

      it('should NOT call giftStatusService.approved', async () => {
        // Act
        await service.create(mockPayload, mockFacilityId);

        // Assert
        expect(approvedStatusSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('fixedFeeService.createMany', () => {
      beforeEach(() => {
        // Arrange
        createFixedFeesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        fixedFeeService.createMany = createFixedFeesSpy;
      });

      it('should return an object with mapped counterparty errors', async () => {
        // Act
        const response = await service.create(mockPayload, mockFacilityId);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.FIXED_FEE,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.GIFT_FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
      });

      it('should NOT call giftStatusService.approved', async () => {
        // Act
        await service.create(mockPayload, mockFacilityId);

        // Assert
        expect(approvedStatusSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('obligationService.createMany', () => {
      beforeEach(() => {
        // Arrange
        createObligationsSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        obligationService.createMany = createObligationsSpy;
      });

      it('should return an object with mapped counterparty errors', async () => {
        // Act
        const response = await service.create(mockPayload, mockFacilityId);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.OBLIGATION,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.GIFT_FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
      });

      it('should NOT call giftStatusService.approved', async () => {
        // Act
        await service.create(mockPayload, mockFacilityId);

        // Assert
        expect(approvedStatusSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('repaymentProfileService.createMany', () => {
      beforeEach(() => {
        // Arrange
        createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        repaymentProfileService.createMany = createRepaymentProfilesSpy;
      });

      it('should return an object with mapped counterparty errors', async () => {
        // Act
        const response = await service.create(mockPayload, mockFacilityId);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.REPAYMENT_PROFILE,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.GIFT_FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
      });

      it('should NOT call giftStatusService.approved', async () => {
        // Act
        await service.create(mockPayload, mockFacilityId);

        // Assert
        expect(approvedStatusSpy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe(`when multiple services return items with ${HttpStatus.BAD_REQUEST} statuses`, () => {
    const mockBadRequest = {
      status: HttpStatus.BAD_REQUEST,
      data: {
        validationErrors: [{ message: 'Mock validation error' }],
      },
    } as AxiosResponse;

    const mockResponses = [mockBadRequest, mockBadRequest, mockBadRequest] as AxiosResponse[];

    beforeEach(() => {
      // Arrange
      createBusinessCalendarSpy = jest.fn().mockResolvedValueOnce(mockBadRequest);
      createBusinessCalendarsConventionSpy = jest.fn().mockResolvedValueOnce(mockBadRequest);
      createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockResponses);
      createFixedFeesSpy = jest.fn().mockResolvedValueOnce(mockResponses);
      createObligationsSpy = jest.fn().mockResolvedValueOnce(mockResponses);
      createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockResponses);

      businessCalendarService.createOne = createBusinessCalendarSpy;
      businessCalendarsConventionService.createOne = createBusinessCalendarsConventionSpy;
      counterpartyService.createMany = createCounterpartiesSpy;
      fixedFeeService.createMany = createFixedFeesSpy;
      obligationService.createMany = createObligationsSpy;
      repaymentProfileService.createMany = createRepaymentProfilesSpy;
    });

    it('should return an object with mapped errors for all service responses', async () => {
      // Act
      const response = await service.create(mockPayload, mockFacilityId);

      // Assert
      const expectedValidationErrors = mapAllValidationErrorResponses({
        businessCalendars: [mockBadRequest],
        businessCalendarsConvention: [mockBadRequest],
        counterparties: mockResponses,
        fixedFees: mockResponses,
        obligations: mockResponses,
        repaymentProfiles: mockResponses,
      });

      const expected = {
        status: HttpStatus.BAD_REQUEST,
        data: {
          statusCode: HttpStatus.BAD_REQUEST,
          message: API_RESPONSE_MESSAGES.GIFT_FACILITY_VALIDATION_ERRORS,
          validationErrors: expectedValidationErrors,
        },
      };

      expect(response).toEqual(expected);
    });

    it('should NOT call giftStatusService.approved', async () => {
      // Act
      await service.create(mockPayload, mockFacilityId);

      // Assert
      expect(approvedStatusSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe(`when a service returns a first item with a status that is ${HttpStatus.BAD_REQUEST}`, () => {
    const mockResponse = [
      {
        status: HttpStatus.BAD_REQUEST,
        data: {
          validationErrors: [{ message: 'mock counterparty validation error' }],
        },
      },
    ] as AxiosResponse[];

    describe('counterpartyService.createMany', () => {
      beforeEach(() => {
        // Arrange
        createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        counterpartyService.createMany = createCounterpartiesSpy;
      });

      it('should return an object with mapped counterparty errors', async () => {
        // Act
        const response = await service.create(mockPayload, mockFacilityId);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.COUNTERPARTY,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.GIFT_FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
      });

      it('should NOT call giftStatusService.approved', async () => {
        // Act
        await service.create(mockPayload, mockFacilityId);

        // Assert
        expect(approvedStatusSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('fixedFeeService.createMany', () => {
      beforeEach(() => {
        // Arrange
        createFixedFeesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        fixedFeeService.createMany = createFixedFeesSpy;
      });

      it('should return an object with mapped fixed fee errors', async () => {
        // Act
        const response = await service.create(mockPayload, mockFacilityId);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.FIXED_FEE,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.GIFT_FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
      });

      it('should NOT call giftStatusService.approved', async () => {
        // Act
        await service.create(mockPayload, mockFacilityId);

        // Assert
        expect(approvedStatusSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('obligationService.createMany', () => {
      beforeEach(() => {
        // Arrange
        createObligationsSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        obligationService.createMany = createObligationsSpy;
      });

      it('should return an object with mapped obligation errors', async () => {
        // Act
        const response = await service.create(mockPayload, mockFacilityId);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.OBLIGATION,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.GIFT_FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
      });

      it('should NOT call giftStatusService.approved', async () => {
        // Act
        await service.create(mockPayload, mockFacilityId);

        // Assert
        expect(approvedStatusSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('repaymentProfileService.createMany', () => {
      beforeEach(() => {
        // Arrange
        createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        repaymentProfileService.createMany = createRepaymentProfilesSpy;
      });

      it('should return an object with mapped repayment profile errors', async () => {
        // Act
        const response = await service.create(mockPayload, mockFacilityId);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.REPAYMENT_PROFILE,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.GIFT_FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
      });

      it('should NOT call giftStatusService.approved', async () => {
        // Act
        await service.create(mockPayload, mockFacilityId);

        // Assert
        expect(approvedStatusSpy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe(`when a service returns a first item with a status that is NOT ${HttpStatus.BAD_REQUEST}`, () => {
    const mockMessage = 'The service is unavailable';

    const mockResponse = [
      {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        data: { message: mockMessage },
      },
    ] as AxiosResponse[];

    describe('counterpartyService.createMany', () => {
      beforeEach(() => {
        // Arrange
        createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        counterpartyService.createMany = createCounterpartiesSpy;
      });

      it("should return an object with the first counterparty's status and message", async () => {
        // Act
        const response = await service.create(mockPayload, mockFacilityId);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.COUNTERPARTY,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          data: {
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            message: mockMessage,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
      });

      it('should NOT call giftStatusService.approved', async () => {
        // Act
        await service.create(mockPayload, mockFacilityId);

        // Assert
        expect(approvedStatusSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('fixedFeeService.createMany', () => {
      beforeEach(() => {
        // Arrange
        createFixedFeesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        fixedFeeService.createMany = createFixedFeesSpy;
      });

      it("should return an object with the first fixed fee's status and message", async () => {
        // Act
        const response = await service.create(mockPayload, mockFacilityId);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.FIXED_FEE,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          data: {
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            message: mockMessage,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
      });

      it('should NOT call giftStatusService.approved', async () => {
        // Act
        await service.create(mockPayload, mockFacilityId);

        // Assert
        expect(approvedStatusSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('obligationService.createMany', () => {
      beforeEach(() => {
        // Arrange
        createObligationsSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        obligationService.createMany = createObligationsSpy;
      });

      it("should return an object with the first obligation's status and message", async () => {
        // Act
        const response = await service.create(mockPayload, mockFacilityId);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.OBLIGATION,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          data: {
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            message: mockMessage,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
      });

      it('should NOT call giftStatusService.approved', async () => {
        // Act
        await service.create(mockPayload, mockFacilityId);

        // Assert
        expect(approvedStatusSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('repaymentProfileService.createMany', () => {
      beforeEach(() => {
        // Arrange
        createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        repaymentProfileService.createMany = createRepaymentProfilesSpy;
      });

      it("should return an object with the first repayment profile's status and message", async () => {
        // Act
        const response = await service.create(mockPayload, mockFacilityId);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.REPAYMENT_PROFILE,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          data: {
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            message: mockMessage,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
      });

      it('should NOT call giftStatusService.approved', async () => {
        // Act
        await service.create(mockPayload, mockFacilityId);

        // Assert
        expect(approvedStatusSpy).toHaveBeenCalledTimes(0);
      });
    });
  });
});
