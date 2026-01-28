import { HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse200, mockResponse201 } from '@ukef-test/http-response';
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
  GiftStatusService,
} from '../';
import { GiftFacilityService } from './';

const { DTFS_INTEGRATION_DEFAULTS } = GIFT;

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

const mockResponsePost = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

const mockBusinessCalendar = BUSINESS_CALENDAR;
const mockBusinessCalendarsConvention = BUSINESS_CALENDARS_CONVENTION;
const mockCounterparties = [COUNTERPARTY(), COUNTERPARTY(), COUNTERPARTY()];
const mockFixedFees = [FIXED_FEE(), FIXED_FEE()];
const mockObligations = [OBLIGATION(), OBLIGATION(), OBLIGATION()];
const mockRepaymentProfiles = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];

const mockAsyncValidationServiceCreationResponse = [];
const mockCreateBusinessCalendarResponse = mockResponse201({ data: mockBusinessCalendar });
const mockCreateBusinessCalendarsConventionResponse = mockResponse201({ data: mockBusinessCalendarsConvention });
const mockCreateCounterpartiesResponse = mockCounterparties.map((counterparty) => mockResponse201({ data: counterparty }));
const mockCreateFixedFeesResponse = mockFixedFees.map((fixedFee) => mockResponse201({ data: fixedFee }));
const mockCreateObligationsResponse = mockObligations.map((obligation) => mockResponse201({ data: obligation }));
const mockRepaymentProfilesResponse = mockRepaymentProfiles.map((repaymentProfile) => mockResponse201({ data: repaymentProfile }));

describe('GiftFacilityService.create', () => {
  const logger = new PinoLogger({});

  let httpService: HttpService;
  let currencyService: GiftCurrencyService;
  let asyncValidationService: GiftFacilityAsyncValidationService;
  let businessCalendarService: GiftBusinessCalendarService;
  let businessCalendersConventionService: GiftBusinessCalendarsConventionService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let statusService: GiftStatusService;
  let service: GiftFacilityService;

  let giftHttpService;
  let mockHttpServicePost: jest.Mock;
  let createInitialFacilitySpy: jest.Mock;
  let createBusinessCalendarSpy: jest.Mock;
  let createBusinessCalendarsConventionSpy: jest.Mock;
  let createCounterpartiesSpy: jest.Mock;
  let asyncValidationServiceCreationSpy: jest.Mock;
  let createFixedFeesSpy: jest.Mock;
  let createObligationsSpy: jest.Mock;
  let createRepaymentProfilesSpy: jest.Mock;
  let approvedStatusSpy: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockResponsePost);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    const counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
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
    businessCalendersConventionService = new GiftBusinessCalendarsConventionService(giftHttpService, logger);
    fixedFeeService = new GiftFixedFeeService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);

    createInitialFacilitySpy = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    asyncValidationServiceCreationSpy = jest.fn().mockResolvedValueOnce(mockAsyncValidationServiceCreationResponse);
    createBusinessCalendarSpy = jest.fn().mockResolvedValueOnce(mockCreateBusinessCalendarResponse);
    createBusinessCalendarsConventionSpy = jest.fn().mockResolvedValueOnce(mockCreateBusinessCalendarsConventionResponse);
    createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCreateCounterpartiesResponse);
    createFixedFeesSpy = jest.fn().mockResolvedValueOnce(mockCreateFixedFeesResponse);
    createObligationsSpy = jest.fn().mockResolvedValueOnce(mockCreateObligationsResponse);
    createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockRepaymentProfilesResponse);
    approvedStatusSpy = jest.fn().mockResolvedValueOnce(mockResponse200(WORK_PACKAGE_APPROVE_RESPONSE_DATA));

    asyncValidationService.creation = asyncValidationServiceCreationSpy;
    businessCalendarService.createOne = createBusinessCalendarSpy;
    businessCalendersConventionService.createOne = createBusinessCalendarsConventionSpy;
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
      businessCalendersConventionService,
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

  it('should call asyncValidationService.creation', async () => {
    // Act
    await service.create(mockPayload, mockFacilityId);

    // Assert
    expect(asyncValidationServiceCreationSpy).toHaveBeenCalledTimes(1);

    expect(asyncValidationServiceCreationSpy).toHaveBeenCalledWith(mockPayload, mockFacilityId);
  });

  it('should call service.createInitialFacility', async () => {
    // Act
    await service.create(mockPayload, mockFacilityId);

    // Assert
    expect(createInitialFacilitySpy).toHaveBeenCalledTimes(1);

    expect(createInitialFacilitySpy).toHaveBeenCalledWith(mockPayload.overview);
  });

  it('should call businessCalendarService.createOne', async () => {
    // Act
    await service.create(mockPayload, mockFacilityId);

    // Assert
    expect(createBusinessCalendarSpy).toHaveBeenCalledTimes(1);

    expect(createBusinessCalendarSpy).toHaveBeenCalledWith({
      facilityId: mockPayload.overview.facilityId,
      workPackageId: FACILITY_RESPONSE_DATA.workPackageId,
      startDate: mockPayload.overview.effectiveDate,
      exitDate: mockPayload.overview.expiryDate,
    });
  });

  it('should call businessCalendarsConventionService.createOne', async () => {
    // Act
    await service.create(mockPayload, mockFacilityId);

    // Assert
    expect(createBusinessCalendarsConventionSpy).toHaveBeenCalledTimes(1);

    expect(createBusinessCalendarsConventionSpy).toHaveBeenCalledWith({
      facilityId: mockPayload.overview.facilityId,
      workPackageId: FACILITY_RESPONSE_DATA.workPackageId,
      businessDayConvention: DTFS_INTEGRATION_DEFAULTS.BUSINESS_CALENDARS_CONVENTION,
      dueOnLastWorkingDayEachMonth: DTFS_INTEGRATION_DEFAULTS.DUE_ON_LAST_WORKING_DAY_EACH_MONTH,
      dateSnapBack: DTFS_INTEGRATION_DEFAULTS.DATE_SNAP_BACK,
    });
  });

  it('should call counterpartyService.createMany', async () => {
    // Act
    await service.create(mockPayload, mockFacilityId);

    // Assert
    expect(createCounterpartiesSpy).toHaveBeenCalledTimes(1);

    expect(createCounterpartiesSpy).toHaveBeenCalledWith(mockPayload.counterparties, mockFacilityId, FACILITY_RESPONSE_DATA.workPackageId);
  });

  it('should call fixedFeeService.createMany', async () => {
    // Act
    await service.create(mockPayload, mockFacilityId);

    // Assert
    expect(createFixedFeesSpy).toHaveBeenCalledTimes(1);

    expect(createFixedFeesSpy).toHaveBeenCalledWith(mockPayload.fixedFees, mockFacilityId, FACILITY_RESPONSE_DATA.workPackageId);
  });

  it('should call obligationService.createMany', async () => {
    // Act
    await service.create(mockPayload, mockFacilityId);

    // Assert
    expect(createObligationsSpy).toHaveBeenCalledTimes(1);

    expect(createObligationsSpy).toHaveBeenCalledWith(mockPayload.obligations, mockFacilityId, FACILITY_RESPONSE_DATA.workPackageId);
  });

  it('should call giftRepaymentProfileService.createMany', async () => {
    // Act
    await service.create(mockPayload, mockFacilityId);

    // Assert
    expect(createRepaymentProfilesSpy).toHaveBeenCalledTimes(1);

    expect(createRepaymentProfilesSpy).toHaveBeenCalledWith(mockPayload.repaymentProfiles, mockFacilityId, FACILITY_RESPONSE_DATA.workPackageId);
  });

  it('should call giftStatusService.approved', async () => {
    // Act
    await service.create(mockPayload, mockFacilityId);

    // Assert
    expect(approvedStatusSpy).toHaveBeenCalledTimes(1);

    expect(approvedStatusSpy).toHaveBeenCalledWith(mockFacilityId, FACILITY_RESPONSE_DATA.workPackageId);
  });

  describe('when all calls are successful', () => {
    it('should return a response object', async () => {
      // Act
      const response = await service.create(mockPayload, mockFacilityId);

      // Assert
      const expected = {
        status: HttpStatus.CREATED,
        data: {
          ...FACILITY_RESPONSE_DATA.configurationEvent.data,
          state: WORK_PACKAGE_APPROVE_RESPONSE_DATA.state,
          businessCalendars: [mockBusinessCalendar],
          businessCalendarsConvention: [mockBusinessCalendarsConvention],
          counterparties: mockCounterparties,
          fixedFees: mockFixedFees,
          obligations: mockObligations,
          repaymentProfiles: mockRepaymentProfiles,
        },
      };

      expect(response).toEqual(expected);
    });
  });
});
