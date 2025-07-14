import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockAxiosError, mockResponse201 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import {
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

const mockCreateCounterpartiesResponse = mockCounterparties.map((counterparty) => mockResponse201(counterparty));
const mockCreateFixedFeesResponse = mockFixedFees.map((fixedFee) => mockResponse201(fixedFee));
const mockCreateObligationsResponse = mockObligations.map((counterparty) => mockResponse201(counterparty));
const mockRepaymentProfilesResponse = mockRepaymentProfiles.map((repaymentProfile) => mockResponse201(repaymentProfile));
const mockApprovedStatusResponse = mockResponse201({ data: WORK_PACKAGE_APPROVE_RESPONSE_DATA });

describe('GiftFacilityService.create - async validation errors', () => {
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

  describe('when asyncValidationService.creation returns a populated array', () => {
    const mockValidationErrors = ['Mock validation error'];

    beforeEach(() => {
      // Arrange
      asyncValidationServiceCreationSpy = jest.fn().mockResolvedValueOnce(mockValidationErrors);

      asyncValidationService.creation = asyncValidationServiceCreationSpy;
    });

    it(`should return an object with ${HttpStatus.BAD_REQUEST} and received validation errors`, async () => {
      // Act
      const response = await service.create(mockPayload, mockFacilityId);

      // Assert
      const expected = {
        status: HttpStatus.BAD_REQUEST,
        data: {
          error: 'Bad Request',
          statusCode: HttpStatus.BAD_REQUEST,
          message: API_RESPONSE_MESSAGES.ASYNC_FACILITY_VALIDATION_ERRORS,
          validationErrors: mockValidationErrors,
        },
      };

      expect(response).toEqual(expected);
    });

    it('should NOT call service.createInitialFacility', async () => {
      // Act
      await service.create(mockPayload, mockFacilityId);

      // Assert
      expect(createInitialFacilitySpy).not.toHaveBeenCalled();
    });

    it('should NOT call counterpartyService.createMany', async () => {
      // Act
      await service.create(mockPayload, mockFacilityId);

      // Assert
      expect(createCounterpartiesSpy).not.toHaveBeenCalled();
    });

    it('should NOT call fixedFeeService.createMany', async () => {
      // Act
      await service.create(mockPayload, mockFacilityId);

      // Assert
      expect(createFixedFeesSpy).not.toHaveBeenCalled();
    });

    it('should NOT call obligationService.createMany', async () => {
      // Act
      await service.create(mockPayload, mockFacilityId);

      // Assert
      expect(createObligationsSpy).not.toHaveBeenCalled();
    });

    it('should NOT call giftRepaymentProfileService.createMany', async () => {
      // Act
      await service.create(mockPayload, mockFacilityId);

      // Assert
      expect(createRepaymentProfilesSpy).not.toHaveBeenCalled();
    });

    it('should NOT call giftStatusService.approved', async () => {
      // Act
      await service.create(mockPayload, mockFacilityId);

      // Assert
      expect(approvedStatusSpy).not.toHaveBeenCalled();
    });
  });

  describe('when asyncValidationService.creation throws an error', () => {
    beforeEach(() => {
      // Arrange
      asyncValidationServiceCreationSpy = jest.fn().mockRejectedValueOnce(mockAxiosError());

      asyncValidationService.creation = asyncValidationServiceCreationSpy;

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
