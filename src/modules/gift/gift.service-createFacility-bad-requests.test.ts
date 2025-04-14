import { HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201 } from '@ukef-test/http-response';
import { AxiosResponse } from 'axios';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftService } from './gift.service';
import { mapAllValidationErrorResponses, mapValidationErrorResponses } from './helpers';

const {
  GIFT: { COUNTERPARTY, FACILITY_RESPONSE_DATA, FACILITY_CREATION_PAYLOAD: mockPayload, REPAYMENT_PROFILE },
} = EXAMPLES;

const { API_RESPONSE_MESSAGES, ENTITY_NAMES } = GIFT;

const mockResponsePost = mockResponse201(FACILITY_RESPONSE_DATA);

const mockCounterparties = [COUNTERPARTY(), COUNTERPARTY(), COUNTERPARTY()];
const mockRepaymentProfiles = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];

const mockCreateCounterpartiesResponse = mockCounterparties.map((counterparty) => mockResponse201(counterparty));

const mockRepaymentProfilesResponse = mockRepaymentProfiles.map((repaymentProfile) => mockResponse201(repaymentProfile));

describe('GiftService.createFacility - bad requests', () => {
  let httpService: HttpService;
  let counterpartyService: GiftCounterpartyService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let service: GiftService;

  let giftHttpService;
  let mockHttpServicePost: jest.Mock;
  let createInitialFacilitySpy: jest.Mock;
  let createCounterpartiesSpy: jest.Mock;
  let createRepaymentProfilesSpy: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockResponsePost);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    counterpartyService = new GiftCounterpartyService(giftHttpService);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService);

    createInitialFacilitySpy = jest.fn().mockResolvedValueOnce(mockResponsePost);
    createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCreateCounterpartiesResponse);
    createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockRepaymentProfilesResponse);

    counterpartyService.createMany = createCounterpartiesSpy;
    repaymentProfileService.createMany = createRepaymentProfilesSpy;

    service = new GiftService(giftHttpService, counterpartyService, repaymentProfileService);

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
        createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        counterpartyService.createMany = createCounterpartiesSpy;
      });

      it('should return an object with mapped counterparty errors', async () => {
        const response = await service.createFacility(mockPayload);

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

    describe('repaymentProfiles.createMany', () => {
      beforeEach(() => {
        createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        repaymentProfileService.createMany = createRepaymentProfilesSpy;
      });

      it('should return an object with mapped counterparty errors', async () => {
        const response = await service.createFacility(mockPayload);

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
    const mockResponse = [
      {
        status: HttpStatus.BAD_REQUEST,
        data: {
          validationErrors: [{ message: 'mock validation error' }],
        },
      },
      {
        status: HttpStatus.BAD_REQUEST,
        data: {
          validationErrors: [{ message: 'mock validation error' }],
        },
      },
    ] as AxiosResponse[];

    beforeEach(() => {
      createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockResponse);
      createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

      counterpartyService.createMany = createCounterpartiesSpy;
      repaymentProfileService.createMany = createRepaymentProfilesSpy;
    });

    it('should return an object with mapped errors for all service responses', async () => {
      const response = await service.createFacility(mockPayload);

      const expectedValidationErrors = mapAllValidationErrorResponses({
        counterparties: mockResponse,
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
        createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        counterpartyService.createMany = createCounterpartiesSpy;
      });

      it('should return an object with mapped counterparty errors', async () => {
        const response = await service.createFacility(mockPayload);

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

    describe('repaymentProfiles.createMany', () => {
      beforeEach(() => {
        createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        repaymentProfileService.createMany = createRepaymentProfilesSpy;
      });

      it('should return an object with mapped repayment profile errors', async () => {
        const response = await service.createFacility(mockPayload);

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
        createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        counterpartyService.createMany = createCounterpartiesSpy;
      });

      it("should return an object with the first counterparty's status and message", async () => {
        const response = await service.createFacility(mockPayload);

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

    describe('repaymentProfiles.createMany', () => {
      beforeEach(() => {
        createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockResponse);

        repaymentProfileService.createMany = createRepaymentProfilesSpy;
      });

      it("should return an object with the first repayment profille's status and message", async () => {
        const response = await service.createFacility(mockPayload);

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
