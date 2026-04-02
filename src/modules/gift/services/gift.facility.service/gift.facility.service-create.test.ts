import { HttpStatus } from '@nestjs/common';
import { EXAMPLES } from '@ukef/constants';
import { MdmService } from '@ukef/modules/mdm/mdm.service';
import { mockGiftFacilityCreationErrorService } from '@ukef-test/gift/mock-services';
import { mockResponse200, mockResponse201, mockResponse204 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import {
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
    BUSINESS_CALENDAR,
    BUSINESS_CALENDARS_CONVENTION,
    COUNTERPARTY,
    FACILITY_ID: mockFacilityId,
    FACILITY_RESPONSE_DATA,
    FACILITY_CREATION_PAYLOAD_NO_FIXED_FEES,
    FACILITY_CREATION_PAYLOAD_NO_REPAYMENT_PROFILES,
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
const mockBusinessCalendarsConvention = BUSINESS_CALENDARS_CONVENTION;
const mockCounterparties = [COUNTERPARTY(), COUNTERPARTY(), COUNTERPARTY()];
const mockFixedFees = [FIXED_FEE(), FIXED_FEE()];
const mockObligations = [OBLIGATION(), OBLIGATION(), OBLIGATION()];
const mockRepaymentProfiles = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];
const mockRiskDetails = RISK_DETAILS;

const mockAsyncValidationServiceCreationResponse = [];
const mockCreateBusinessCalendarResponse = mockResponse201({ data: mockBusinessCalendar });
const mockCreateBusinessCalendarsConventionResponse = mockResponse201({ data: mockBusinessCalendarsConvention });
const mockCreateCounterpartiesResponse = mockCounterparties.map((counterparty) => mockResponse201({ data: counterparty }));
const mockCreateFixedFeesResponse = mockFixedFees.map((fixedFee) => mockResponse201({ data: fixedFee }));
const mockCreateObligationsResponse = mockObligations.map((obligation) => mockResponse201({ data: obligation }));
const mockCreateRepaymentProfilesResponse = mockRepaymentProfiles.map((repaymentProfile) => mockResponse201({ data: repaymentProfile }));
const mockCreateRiskDetailsResponse = mockResponse201({ data: mockRiskDetails });
const mockFinallyHandlerResponse = mockResponse204();

describe('GiftFacilityService.create - happy path', () => {
  const logger = new PinoLogger({});

  let currencyService: GiftCurrencyService;
  let asyncValidationService: GiftFacilityAsyncValidationService;
  let businessCalendarService: GiftBusinessCalendarService;
  let businessCalendarsConventionService: GiftBusinessCalendarsConventionService;
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
  let createInitialFacilitySpy: jest.Mock;
  let createBusinessCalendarSpy: jest.Mock;
  let createBusinessCalendarsConventionSpy: jest.Mock;
  let createCounterpartiesSpy: jest.Mock;
  let asyncValidationServiceCreationSpy: jest.Mock;
  let createFixedFeesSpy: jest.Mock;
  let createObligationsSpy: jest.Mock;
  let createRepaymentProfilesSpy: jest.Mock;
  let createRiskDetailsSpy: jest.Mock;
  let approvedStatusSpy: jest.Mock;
  let finallyHandlerSpy: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockHttpPostResponse);

    giftHttpService = {
      post: mockHttpServicePost,
    };

    httpService = giftHttpService;

    const counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    const feeTypeService = new GiftFeeTypeService(giftHttpService, logger);
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

    businessCalendarService = new GiftBusinessCalendarService(giftHttpService, logger);
    businessCalendarsConventionService = new GiftBusinessCalendarsConventionService(giftHttpService, logger);
    fixedFeeService = new GiftFixedFeeService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    riskDetailsService = new GiftRiskDetailsService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);
    creationErrorService = mockGiftFacilityCreationErrorService();

    createInitialFacilitySpy = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    asyncValidationServiceCreationSpy = jest.fn().mockResolvedValueOnce(mockAsyncValidationServiceCreationResponse);
    createBusinessCalendarSpy = jest.fn().mockResolvedValueOnce(mockCreateBusinessCalendarResponse);
    createBusinessCalendarsConventionSpy = jest.fn().mockResolvedValueOnce(mockCreateBusinessCalendarsConventionResponse);
    createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCreateCounterpartiesResponse);
    createFixedFeesSpy = jest.fn().mockResolvedValueOnce(mockCreateFixedFeesResponse);
    createObligationsSpy = jest.fn().mockResolvedValueOnce(mockCreateObligationsResponse);
    createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockCreateRepaymentProfilesResponse);
    createRiskDetailsSpy = jest.fn().mockResolvedValueOnce(mockCreateRiskDetailsResponse);
    approvedStatusSpy = jest.fn().mockResolvedValueOnce(mockResponse200(WORK_PACKAGE_APPROVE_RESPONSE_DATA));
    finallyHandlerSpy = jest.fn().mockResolvedValueOnce(mockFinallyHandlerResponse);

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
      creationErrorService,
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

  it('should call giftRiskDetailsService.createOne', async () => {
    // Act
    await service.create(mockPayload, mockFacilityId);

    // Assert
    expect(createRiskDetailsSpy).toHaveBeenCalledTimes(1);

    expect(createRiskDetailsSpy).toHaveBeenCalledWith(mockPayload.riskDetails, mockFacilityId, FACILITY_RESPONSE_DATA.workPackageId);
  });

  it('should call giftStatusService.approved', async () => {
    // Act
    await service.create(mockPayload, mockFacilityId);

    // Assert
    expect(approvedStatusSpy).toHaveBeenCalledTimes(1);

    expect(approvedStatusSpy).toHaveBeenCalledWith(mockFacilityId, FACILITY_RESPONSE_DATA.workPackageId);
  });

  it('should NOT call giftFacilityCreationErrorService.finallyHandler', async () => {
    // Act
    await service.create(mockPayload, mockFacilityId);

    // Assert
    expect(finallyHandlerSpy).toHaveBeenCalledTimes(0);
  });

  describe('when fixedFees is NOT provided in the payload', () => {
    it('should NOT call giftFixedFeeService.createMany', async () => {
      // Act
      await service.create(FACILITY_CREATION_PAYLOAD_NO_FIXED_FEES, mockFacilityId);

      // Assert
      expect(createFixedFeesSpy).not.toHaveBeenCalled();
    });
  });

  describe('when fixedFees is provided in the payload as an empty array', () => {
    it('should NOT call giftFixedFeeService.createMany', async () => {
      // Arrange
      const payload = {
        ...FACILITY_CREATION_PAYLOAD_NO_FIXED_FEES,
        fixedFees: [],
      };

      // Act
      await service.create(payload, mockFacilityId);

      // Assert
      expect(createFixedFeesSpy).not.toHaveBeenCalled();
    });
  });

  describe('when repaymentProfiles is NOT provided in the payload', () => {
    it('should NOT call giftRepaymentProfileService.createMany', async () => {
      // Act
      await service.create(FACILITY_CREATION_PAYLOAD_NO_REPAYMENT_PROFILES, mockFacilityId);

      // Assert
      expect(createRepaymentProfilesSpy).not.toHaveBeenCalled();
    });
  });

  describe('when repaymentProfiles is provided in the payload as an empty array', () => {
    it('should NOT call giftRepaymentProfileService.createMany', async () => {
      // Arrange
      const payload = {
        ...FACILITY_CREATION_PAYLOAD_NO_REPAYMENT_PROFILES,
        repaymentProfiles: [],
      };

      // Act
      await service.create(payload, mockFacilityId);

      // Assert
      expect(createRepaymentProfilesSpy).not.toHaveBeenCalled();
    });
  });

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
        businessCalendarsConvention: mockBusinessCalendarsConvention,
        counterparties: mockCounterparties,
        fixedFees: mockFixedFees,
        obligations: mockObligations,
        repaymentProfiles: mockRepaymentProfiles,
        riskDetails: mockRiskDetails,
      },
    };

    expect(response).toEqual(expected);
  });
});
