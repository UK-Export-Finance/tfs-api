import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201 } from '@ukef-test/http-response';
import { AxiosResponse } from 'axios';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftFixedFeeService } from './gift.fixed-fee.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftService } from './gift.service';
import { mapAllValidationErrorResponses, mapValidationErrorResponses } from './helpers';

const {
  GIFT: { COUNTERPARTY, FACILITY_RESPONSE_DATA, FACILITY_CREATION_PAYLOAD: mockPayload, FIXED_FEE, OBLIGATION, REPAYMENT_PROFILE },
} = EXAMPLES;

const { API_RESPONSE_MESSAGES, ENTITY_NAMES } = GIFT;

const mockCreateInitialFacilityResponse = mockResponse201(FACILITY_RESPONSE_DATA);

const mockCounterparties = [COUNTERPARTY(), COUNTERPARTY(), COUNTERPARTY()];
const mockFixedFees = [FIXED_FEE(), FIXED_FEE()];
const mockObligations = [OBLIGATION(), OBLIGATION(), OBLIGATION()];
const mockRepaymentProfiles = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];

const mockCreateCounterpartiesResponse = mockCounterparties.map((counterparty) => mockResponse201(counterparty));
const mockCreateFixedFeesResponse = mockFixedFees.map((fixedFee) => mockResponse201(fixedFee));
const mockCreateObligationsResponse = mockObligations.map((counterparty) => mockResponse201(counterparty));
const mockRepaymentProfilesResponse = mockRepaymentProfiles.map((repaymentProfile) => mockResponse201(repaymentProfile));

describe('GiftService.createFacility - bad requests', () => {
  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let service: GiftService;

  let giftHttpService;
  let createInitialFacilitySpy: jest.Mock;
  let createCounterpartiesSpy: jest.Mock;
  let createFixedFeesSpy: jest.Mock;
  let createObligationsSpy: jest.Mock;
  let createRepaymentProfilesSpy: jest.Mock;

  beforeEach(() => {
    // Arrange
    counterpartyService = new GiftCounterpartyService(giftHttpService);
    fixedFeeService = new GiftFixedFeeService(giftHttpService);
    obligationService = new GiftObligationService(giftHttpService);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService);

    createInitialFacilitySpy = jest.fn().mockResolvedValueOnce(mockCreateInitialFacilityResponse);
    createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCreateCounterpartiesResponse);
    createFixedFeesSpy = jest.fn().mockResolvedValueOnce(mockCreateFixedFeesResponse);
    createObligationsSpy = jest.fn().mockResolvedValueOnce(mockCreateObligationsResponse);
    createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockRepaymentProfilesResponse);

    counterpartyService.createMany = createCounterpartiesSpy;
    fixedFeeService.createMany = createFixedFeesSpy;
    obligationService.createMany = createObligationsSpy;
    repaymentProfileService.createMany = createRepaymentProfilesSpy;

    service = new GiftService(giftHttpService, counterpartyService, fixedFeeService, obligationService, repaymentProfileService);

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
          validationErrors: [{ message: 'mock validation error' }],
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
        const response = await service.createFacility(mockPayload);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.COUNTERPARTY,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
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
        const response = await service.createFacility(mockPayload);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.FIXED_FEE,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
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
        const response = await service.createFacility(mockPayload);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.OBLIGATION,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
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
        const response = await service.createFacility(mockPayload);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.REPAYMENT_PROFILE,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
      });
    });
  });

  describe(`when multiple services return items with ${HttpStatus.BAD_REQUEST} statuses`, () => {
    const mockBadRequest = {
      status: HttpStatus.BAD_REQUEST,
      data: {
        validationErrors: [{ message: 'mock validation error' }],
      },
    };

    const mockResponse = [mockBadRequest, mockBadRequest, mockBadRequest] as AxiosResponse[];

    beforeEach(() => {
      // Arrange
      createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockResponse);
      createFixedFeesSpy = jest.fn().mockResolvedValueOnce(mockResponse);
      createObligationsSpy = jest.fn().mockResolvedValueOnce(mockResponse);
      createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

      counterpartyService.createMany = createCounterpartiesSpy;
      fixedFeeService.createMany = createFixedFeesSpy;
      obligationService.createMany = createObligationsSpy;
      repaymentProfileService.createMany = createRepaymentProfilesSpy;
    });

    it('should return an object with mapped errors for all service responses', async () => {
      // Act
      const response = await service.createFacility(mockPayload);

      // Assert
      const expectedValidationErrors = mapAllValidationErrorResponses({
        counterparties: mockResponse,
        fixedFees: mockResponse,
        obligations: mockResponse,
        repaymentProfiles: mockResponse,
      });

      const expected = {
        status: HttpStatus.BAD_REQUEST,
        data: {
          statusCode: HttpStatus.BAD_REQUEST,
          message: API_RESPONSE_MESSAGES.FACILITY_VALIDATION_ERRORS,
          validationErrors: expectedValidationErrors,
        },
      };

      expect(response).toEqual(expected);
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
        const response = await service.createFacility(mockPayload);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.COUNTERPARTY,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
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
        const response = await service.createFacility(mockPayload);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.FIXED_FEE,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
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
        const response = await service.createFacility(mockPayload);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.OBLIGATION,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
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
        const response = await service.createFacility(mockPayload);

        // Assert
        const expectedValidationErrors = mapValidationErrorResponses({
          entityName: ENTITY_NAMES.REPAYMENT_PROFILE,
          responses: mockResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.FACILITY_VALIDATION_ERRORS,
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
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
        const response = await service.createFacility(mockPayload);

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
    });

    describe('fixedFeeService.createMany', () => {
      beforeEach(() => {
        // Arrange
        createFixedFeesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        fixedFeeService.createMany = createFixedFeesSpy;
      });

      it("should return an object with the first fixed fee's status and message", async () => {
        // Act
        const response = await service.createFacility(mockPayload);

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
    });

    describe('obligationService.createMany', () => {
      beforeEach(() => {
        // Arrange
        createObligationsSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        obligationService.createMany = createObligationsSpy;
      });

      it("should return an object with the first obligation's status and message", async () => {
        // Act
        const response = await service.createFacility(mockPayload);

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
    });

    describe('repaymentProfileService.createMany', () => {
      beforeEach(() => {
        // Arrange
        createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        repaymentProfileService.createMany = createRepaymentProfilesSpy;
      });

      it("should return an object with the first repayment profile's status and message", async () => {
        // Act
        const response = await service.createFacility(mockPayload);

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
    });
  });
});
