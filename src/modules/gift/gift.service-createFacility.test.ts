import { HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockAxiosError, mockResponse201 } from '@ukef-test/http-response';
import { AxiosResponse } from 'axios';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftService } from './gift.service';
import { mapValidationErrorResponses } from './helpers';

const {
  GIFT: { COUNTERPARTY, FACILITY_RESPONSE_DATA, FACILITY_CREATION_PAYLOAD: mockPayload },
} = EXAMPLES;

const { API_RESPONSE_MESSAGES, ENTITY_NAMES } = GIFT;

const mockResponsePost = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

const mockCounterparties = [COUNTERPARTY(), COUNTERPARTY(), COUNTERPARTY()];

const mockCreateCounterpartiesResponse = mockCounterparties.map((counterparty) => mockResponse201(counterparty));

describe('GiftService.createFacility', () => {
  let httpService: HttpService;
  let counterpartyService: GiftCounterpartyService;
  let service: GiftService;

  let giftHttpService;
  let mockHttpServicePost: jest.Mock;
  let mockCreateCounterparties: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockResponsePost);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    counterpartyService = new GiftCounterpartyService(giftHttpService);

    mockCreateCounterparties = jest.fn().mockResolvedValueOnce(mockCreateCounterpartiesResponse);

    counterpartyService.createMany = mockCreateCounterparties;

    service = new GiftService(giftHttpService, counterpartyService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  let createInitialFacilitySpy: jest.Mock;
  let createCounterpartiesSpy: jest.Mock;

  beforeEach(() => {
    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockResponse201());

    createInitialFacilitySpy = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCreateCounterpartiesResponse);

    counterpartyService.createMany = createCounterpartiesSpy;

    service = new GiftService(giftHttpService, counterpartyService);

    service.createInitialFacility = createInitialFacilitySpy;
  });

  it('should call service.createInitialFacility', async () => {
    await service.createFacility(mockPayload);

    expect(createInitialFacilitySpy).toHaveBeenCalledTimes(1);

    expect(createInitialFacilitySpy).toHaveBeenCalledWith(mockPayload.overview);
  });

  it('should call counterpartyService.createMany', async () => {
    await service.createFacility(mockPayload);

    expect(createCounterpartiesSpy).toHaveBeenCalledTimes(1);

    expect(createCounterpartiesSpy).toHaveBeenCalledWith(mockPayload.counterparties, FACILITY_RESPONSE_DATA.workPackageId);
  });

  describe('when all calls are successful', () => {
    it('should return a response object', async () => {
      const response = await service.createFacility(mockPayload);

      const expected = {
        status: HttpStatus.CREATED,
        data: {
          ...FACILITY_RESPONSE_DATA,
          counterparties: mockCounterparties,
        },
      };

      expect(response).toEqual(expected);
    });
  });

  describe('when counterpartyService.createInitialFacility throws an error', () => {
    const mockAxiosErrorStatus = HttpStatus.BAD_REQUEST;

    const mockAxiosErrorData = {
      validationErrors: [{ mock: true }],
    };

    beforeEach(() => {
      createInitialFacilitySpy = jest.fn().mockRejectedValueOnce(mockAxiosError({ data: mockAxiosErrorData, status: mockAxiosErrorStatus }));

      service = new GiftService(giftHttpService, counterpartyService);

      service.createInitialFacility = createInitialFacilitySpy;
    });

    it('should throw an error', async () => {
      const response = service.createFacility(mockPayload);

      const expected = 'Error creating GIFT facility';

      await expect(response).rejects.toThrow(expected);
    });
  });

  describe(`when counterpartyService.createMany returns a first item with a status that is ${HttpStatus.CREATED} and other items have errors`, () => {
    const mockCounterpartiesResponse = [
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

    beforeEach(() => {
      createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCounterpartiesResponse);

      counterpartyService.createMany = createCounterpartiesSpy;
    });

    it('should return an object with mapped errors', async () => {
      const response = await service.createFacility(mockPayload);

      const expectedValidationErrors = mapValidationErrorResponses({
        entityName: ENTITY_NAMES.COUNTERPARTY,
        responses: mockCounterpartiesResponse,
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

  describe(`when counterpartyService.createMany returns a first item with a status that is ${HttpStatus.BAD_REQUEST}`, () => {
    const mockCounterpartiesResponse = [
      {
        status: HttpStatus.BAD_REQUEST,
        data: {
          validationErrors: [{ message: 'mock validation error' }],
        },
      },
    ] as AxiosResponse[];

    beforeEach(() => {
      createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCounterpartiesResponse);

      counterpartyService.createMany = createCounterpartiesSpy;
    });

    it('should return an object with mapped errors', async () => {
      const response = await service.createFacility(mockPayload);

      const expectedValidationErrors = mapValidationErrorResponses({
        entityName: ENTITY_NAMES.COUNTERPARTY,
        responses: mockCounterpartiesResponse,
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

  describe(`when counterpartyService.createMany returns a first item with a status that is NOT ${HttpStatus.BAD_REQUEST}`, () => {
    const mockMessage = 'The service is unavailable';

    const mockCounterpartiesResponse = [
      {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        data: { message: mockMessage },
      },
    ] as AxiosResponse[];

    beforeEach(() => {
      createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCounterpartiesResponse);

      counterpartyService.createMany = createCounterpartiesSpy;
    });

    it("should return an object with the first counterparty's status and message", async () => {
      const response = await service.createFacility(mockPayload);

      const expectedValidationErrors = mapValidationErrorResponses({
        entityName: ENTITY_NAMES.COUNTERPARTY,
        responses: mockCounterpartiesResponse,
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

  describe('when counterpartyService.createMany throws an error', () => {
    const mockAxiosErrorStatus = HttpStatus.BAD_REQUEST;

    const mockAxiosErrorData = {
      validationErrors: [{ mock: true }],
    };

    beforeEach(() => {
      createCounterpartiesSpy = jest.fn().mockRejectedValueOnce(mockAxiosError({ data: mockAxiosErrorData, status: mockAxiosErrorStatus }));

      counterpartyService.createMany = createCounterpartiesSpy;

      service = new GiftService(giftHttpService, counterpartyService);

      service.createInitialFacility = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    });

    it('should throw an error', async () => {
      const response = service.createFacility(mockPayload);

      const expected = 'Error creating GIFT facility';

      await expect(response).rejects.toThrow(expected);
    });
  });
});
