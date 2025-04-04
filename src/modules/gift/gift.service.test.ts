import { HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockAxiosError, mockResponse200, mockResponse201, mockResponse500 } from '@ukef-test/http-response';
import { AxiosResponse } from 'axios';

import { GiftService } from './gift.service';
import { mapValidationErrorResponses } from './helpers';

const {
  GIFT: { COUNTERPARTY_DATA, FACILITY_RESPONSE_DATA, FACILITY_CREATION_PAYLOAD: mockPayload, FACILITY_ID: mockFacilityId },
} = EXAMPLES;

const mockResponseGet = mockResponse200(FACILITY_RESPONSE_DATA);
const mockResponsePost = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

const mockCreateCounterpartiesResponse = [mockResponse201(COUNTERPARTY_DATA), mockResponse201(COUNTERPARTY_DATA), mockResponse201(COUNTERPARTY_DATA)];

describe('GiftService', () => {
  let httpService: HttpService;
  let service: GiftService;

  let giftHttpService;
  let mockHttpServiceGet: jest.Mock;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockResponseGet);
    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockResponsePost);

    httpService.get = mockHttpServiceGet;
    httpService.post = mockHttpServicePost;

    giftHttpService = {
      get: mockHttpServiceGet,
      post: mockHttpServicePost,
    };

    service = new GiftService(giftHttpService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('getFacility', () => {
    it('should call giftHttpService.get', async () => {
      await service.getFacility(mockFacilityId);

      expect(mockHttpServiceGet).toHaveBeenCalledTimes(1);

      expect(mockHttpServiceGet).toHaveBeenCalledWith({
        path: `${GIFT.PATH.FACILITY}/${mockFacilityId}`,
      });
    });

    describe('when giftHttpService.get is successful', () => {
      it('should return the response of giftHttpService.get', async () => {
        const response = await service.getFacility(mockFacilityId);

        expect(response).toEqual(mockResponseGet);
      });
    });

    describe('when giftHttpService.get returns an error', () => {
      beforeEach(() => {
        mockHttpServiceGet = jest.fn().mockRejectedValueOnce(mockResponse500());

        httpService.get = mockHttpServiceGet;

        giftHttpService.get = mockHttpServiceGet;

        service = new GiftService(giftHttpService);
      });

      it('should thrown an error', async () => {
        const promise = service.getFacility(mockFacilityId);

        const expected = 'Error calling GIFT HTTP service GET method';

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('createInitialFacility', () => {
    it('should call giftHttpService.post', async () => {
      await service.createInitialFacility(mockPayload.overview);

      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: GIFT.PATH.FACILITY,
        payload: mockPayload.overview,
      });
    });

    describe('when giftHttpService.post is successful', () => {
      it('should return the response of giftHttpService.post', async () => {
        const response = await service.createInitialFacility(mockPayload.overview);

        expect(response).toEqual(mockResponsePost);
      });
    });

    describe('when giftHttpService.post returns an error', () => {
      beforeEach(() => {
        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockResponse500());

        httpService.post = mockHttpServicePost;

        giftHttpService.post = mockHttpServicePost;

        service = new GiftService(giftHttpService);
      });

      it('should thrown an error', async () => {
        const promise = service.createInitialFacility(mockPayload.overview);

        const expected = 'Error creating initial GIFT facility';

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('createFacility', () => {
    let createInitialFacilitySpy: jest.Mock;
    let createCounterpartiesSpy: jest.Mock;

    beforeEach(() => {
      mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockResponse201());

      createInitialFacilitySpy = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
      createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCreateCounterpartiesResponse);

      service = new GiftService(giftHttpService);

      service.createInitialFacility = createInitialFacilitySpy;
      service.createCounterparties = createCounterpartiesSpy;
    });

    it('should call service.createInitialFacility', async () => {
      await service.createFacility(mockPayload);

      expect(createInitialFacilitySpy).toHaveBeenCalledTimes(1);

      expect(createInitialFacilitySpy).toHaveBeenCalledWith(mockPayload.overview);
    });

    it('should call service.createCounterparties', async () => {
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
            counterparties: [COUNTERPARTY_DATA, COUNTERPARTY_DATA, COUNTERPARTY_DATA],
          },
        };

        expect(response).toEqual(expected);
      });
    });

    describe('when service.createInitialFacility throws an error', () => {
      const mockAxiosErrorStatus = HttpStatus.BAD_REQUEST;

      const mockAxiosErrorData = {
        validationErrors: [{ mock: true }],
      };

      beforeEach(() => {
        createInitialFacilitySpy = jest.fn().mockRejectedValueOnce(mockAxiosError({ data: mockAxiosErrorData, status: mockAxiosErrorStatus }));

        service = new GiftService(giftHttpService);

        service.createInitialFacility = createInitialFacilitySpy;
      });

      it('should throw an error', async () => {
        const response = service.createFacility(mockPayload);

        const expected = 'Error creating GIFT facility';

        await expect(response).rejects.toThrow(expected);
      });
    });

    describe(`when service.createCounterparties returns a response that does not have a  ${HttpStatus.CREATED} status`, () => {
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

        service.createCounterparties = createCounterpartiesSpy;
      });

      it('should return an object with mapped errors', async () => {
        const response = await service.createFacility(mockPayload);

        const expectedValidationErrors = mapValidationErrorResponses({
          entity: 'counterparty',
          responses: mockCounterpartiesResponse,
        });

        const expected = {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Validation errors with facility entity(s)',
            validationErrors: expectedValidationErrors,
          },
        };

        expect(response).toEqual(expected);
      });
    });

    describe('when service.createCounterparties throws an error', () => {
      const mockAxiosErrorStatus = HttpStatus.BAD_REQUEST;

      const mockAxiosErrorData = {
        validationErrors: [{ mock: true }],
      };

      beforeEach(() => {
        createCounterpartiesSpy = jest.fn().mockRejectedValueOnce(mockAxiosError({ data: mockAxiosErrorData, status: mockAxiosErrorStatus }));

        service = new GiftService(giftHttpService);

        service.createInitialFacility = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));

        service.createCounterparties = createCounterpartiesSpy;
      });

      it('should throw an error', async () => {
        const response = service.createFacility(mockPayload);

        const expected = 'Error creating GIFT facility';

        await expect(response).rejects.toThrow(expected);
      });
    });
  });
});
