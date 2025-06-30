import { HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import { EXAMPLES } from '@ukef/constants';
import { mockAxiosError, mockResponse201 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftCurrencyService } from './gift.currency.service';
import { GiftFacilityService } from './gift.facility.service';
import { GiftFacilityAsyncValidationService } from './gift.facility-async-validation.service';
import { GiftFixedFeeService } from './gift.fixed-fee.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftStatusService } from './gift.status.service';

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

const mockResponsePost = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

const mockCounterparties = [COUNTERPARTY(), COUNTERPARTY(), COUNTERPARTY()];
const mockFixedFees = [FIXED_FEE(), FIXED_FEE()];
const mockObligations = [OBLIGATION(), OBLIGATION(), OBLIGATION()];
const mockRepaymentProfiles = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];

const mockCreateCounterpartiesResponse = mockCounterparties.map((counterparty) => mockResponse201(counterparty));
const mockCreateFixedFeesResponse = mockFixedFees.map((fixedFee) => mockResponse201(fixedFee));
const mockCreateObligationsResponse = mockObligations.map((counterparty) => mockResponse201(counterparty));
const mockRepaymentProfilesResponse = mockRepaymentProfiles.map((repaymentProfile) => mockResponse201(repaymentProfile));
const mockApprovedStatusResponse = mockResponse201({ data: WORK_PACKAGE_APPROVE_RESPONSE_DATA });

describe('GiftFacilityService.create - error handling', () => {
  const logger = new PinoLogger({});

  let httpService: HttpService;
  let asyncValidationService: GiftFacilityAsyncValidationService;
  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let statusService: GiftStatusService;
  let service: GiftFacilityService;

  let giftHttpService;
  let mockHttpServicePost: jest.Mock;
  let asyncValidationServiceCreationSpy: jest.Mock;
  let createInitialFacilitySpy: jest.Mock;
  let createCounterpartiesSpy: jest.Mock;
  let createFixedFeesSpy: jest.Mock;
  let createObligationsSpy: jest.Mock;
  let createRepaymentProfilesSpy: jest.Mock;
  let approvedStatusSpy: jest.Mock;

  const mockAxiosErrorStatus = HttpStatus.BAD_REQUEST;

  const mockAxiosErrorData = {
    validationErrors: [{ mock: true }],
  };

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockResponsePost);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    const currencyService = new GiftCurrencyService(giftHttpService, logger);

    asyncValidationService = new GiftFacilityAsyncValidationService(logger, currencyService);
    counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    fixedFeeService = new GiftFixedFeeService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);

    createInitialFacilitySpy = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
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

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('when giftFacilityService.createInitialFacility throws an error', () => {
    beforeEach(() => {
      // Arrange
      createInitialFacilitySpy = jest.fn().mockRejectedValueOnce(mockAxiosError({ data: mockAxiosErrorData, status: HttpStatus.BAD_REQUEST }));

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

    it('should throw an error', async () => {
      // Act
      const response = service.create(mockPayload, mockFacilityId);

      // Assert
      const expected = new Error(`Error creating a GIFT facility ${mockFacilityId}`);

      await expect(response).rejects.toThrow(expected);
    });
  });

  describe('when counterpartyService.createMany throws an error', () => {
    beforeEach(() => {
      // Arrange
      createCounterpartiesSpy = jest.fn().mockRejectedValueOnce(mockAxiosError({ data: mockAxiosErrorData, status: HttpStatus.BAD_REQUEST }));

      counterpartyService.createMany = createCounterpartiesSpy;

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

      service.createInitialFacility = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    });

    it('should throw an error', async () => {
      // Act
      const response = service.create(mockPayload, mockFacilityId);

      // Assert
      const expected = new Error(`Error creating a GIFT facility ${mockFacilityId}`);

      await expect(response).rejects.toThrow(expected);
    });
  });

  describe('when fixedFeeService.createMany throws an error', () => {
    beforeEach(() => {
      // Arrange
      createFixedFeesSpy = jest.fn().mockRejectedValueOnce(mockAxiosError({ data: mockAxiosErrorData, status: HttpStatus.BAD_REQUEST }));

      counterpartyService.createMany = createFixedFeesSpy;

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

      service.createInitialFacility = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    });

    it('should throw an error', async () => {
      // Act
      const response = service.create(mockPayload, mockFacilityId);

      // Assert
      const expected = new Error(`Error creating a GIFT facility ${mockFacilityId}`);

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
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        statusService,
      );

      service.createInitialFacility = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    });

    it('should throw an error', async () => {
      // Act
      const response = service.create(mockPayload, mockFacilityId);

      // Assert
      const expected = new Error(`Error creating a GIFT facility ${mockFacilityId}`);

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
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        statusService,
      );

      service.createInitialFacility = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    });

    it('should throw an error', async () => {
      // Act
      const response = service.create(mockPayload, mockFacilityId);

      // Assert
      const expected = new Error(`Error creating a GIFT facility ${mockFacilityId}`);

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
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        statusService,
      );

      service.createInitialFacility = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    });

    it('should throw an error', async () => {
      // Act
      const response = service.create(mockPayload, mockFacilityId);

      // Assert
      const expected = new Error(`Error creating a GIFT facility ${mockFacilityId}`);

      await expect(response).rejects.toThrow(expected);
    });
  });
});
