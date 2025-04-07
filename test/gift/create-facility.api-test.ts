import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const { API_RESPONSE_MESSAGES, API_RESPONSE_TYPES, ENTITY_NAMES, PATH } = GIFT;

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

describe('POST /gift/facility', () => {
  const valueGenerator = new RandomValueGenerator();

  const mockFacilityId = valueGenerator.ukefId();
  const mockWorkPackageId = valueGenerator.workPackageId();

  const mockResponses = {
    badRequest: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Validation error',
      validationErrors: [
        {
          path: ['fieldX'],
          message: 'Invalid fieldX',
        },
      ],
    },
    counterparty: { aCounterparty: true },
    facility: {
      facilityId: mockFacilityId,
      workPackageId: mockWorkPackageId,
      aMockFacility: true,
    },
    internalServerError: {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    },
    unauthorized: {
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Unauthorized',
    },
  };

  const payloadCounterparties = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.counterparties);

  const facilityUrl = `/api/${prefixAndVersion}/gift${PATH.FACILITY}`;
  const counterPartyUrl = `${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.COUNTERPARTY}${PATH.CREATION_EVENT}`;

  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {},
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  describe('when the payload is valid and a 201 response is returned by GIFT', () => {
    it('should return a 201 response with a facility and counterparties', async () => {
      nock(GIFT_API_URL).post(PATH.FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

      nock(GIFT_API_URL).persist().post(counterPartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

      const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      expect(status).toBe(HttpStatus.CREATED);

      const expected = {
        ...mockResponses.facility,
        counterparties: Array(payloadCounterparties.length).fill(mockResponses.counterparty),
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when a 400 response is returned by the GIFT facility endpoint', () => {
    it('should return a 400 response', async () => {
      nock(GIFT_API_URL).post(PATH.FACILITY).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

      const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = mockResponses.badRequest;

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when a 401 response is returned by the GIFT facility endpoint', () => {
    it('should return a 401 response', async () => {
      nock(GIFT_API_URL).post(PATH.FACILITY).reply(HttpStatus.UNAUTHORIZED, mockResponses.unauthorized);

      const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      expect(status).toBe(HttpStatus.UNAUTHORIZED);

      expect(body).toStrictEqual(mockResponses.unauthorized);
    });
  });

  describe('when an unacceptable status is returned by the GIFT facility endpoint', () => {
    it('should return a 500 response', async () => {
      nock(GIFT_API_URL).post(PATH.FACILITY).reply(HttpStatus.I_AM_A_TEAPOT);

      const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      expect(status).toBe(500);

      expect(body).toStrictEqual(mockResponses.internalServerError);
    });
  });

  describe('when a 500 status is returned by the GIFT facility endpoint', () => {
    it('should return a 500 response', async () => {
      nock(GIFT_API_URL).post(PATH.FACILITY).reply(HttpStatus.INTERNAL_SERVER_ERROR);

      const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      expect(status).toBe(500);

      expect(body).toStrictEqual(mockResponses.internalServerError);
    });
  });

  describe('when a 400 response is returned by the GIFT counterparty endpoint', () => {
    it('should return a 400 response with a mapped body/validation errors', async () => {
      nock(GIFT_API_URL).post(PATH.FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

      nock(GIFT_API_URL).persist().post(counterPartyUrl).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

      const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expectedValidationErrors = payloadCounterparties.map((counterparty, index) => ({
        entityName: ENTITY_NAMES.COUNTERPARTY,
        index,
        message: mockResponses.badRequest.message,
        validationErrors: mockResponses.badRequest.validationErrors,
        type: API_RESPONSE_TYPES.ERROR,
        status: mockResponses.badRequest.statusCode,
      }));

      const expected = {
        ...mockResponses.badRequest,
        message: API_RESPONSE_MESSAGES.FACILITY_VALIDATION_ERRORS,
        validationErrors: expectedValidationErrors,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when a 401 response is returned by the GIFT counterparty endpoint', () => {
    it('should return a 401 response  with a mapped body/validation errors', async () => {
      nock(GIFT_API_URL).post(PATH.FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

      nock(GIFT_API_URL).persist().post(counterPartyUrl).reply(HttpStatus.UNAUTHORIZED, mockResponses.unauthorized);

      const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      expect(status).toBe(HttpStatus.UNAUTHORIZED);

      const expectedValidationErrors = payloadCounterparties.map((counterparty, index) => ({
        entityName: ENTITY_NAMES.COUNTERPARTY,
        index,
        message: mockResponses.unauthorized.message,
        type: API_RESPONSE_TYPES.ERROR,
        status: mockResponses.unauthorized.statusCode,
      }));

      const expected = {
        ...mockResponses.unauthorized,
        validationErrors: expectedValidationErrors,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when an unacceptable status is returned by the GIFT counterparty endpoint', () => {
    it('should return a 500 response', async () => {
      nock(GIFT_API_URL).post(PATH.FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

      nock(GIFT_API_URL).persist().post(counterPartyUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.badRequest);

      const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(body).toStrictEqual(mockResponses.internalServerError);
    });
  });

  describe('when a 500 response is returned by the GIFT counterparty endpoint', () => {
    it('should return a 500 response', async () => {
      nock(GIFT_API_URL).post(PATH.FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

      nock(GIFT_API_URL).persist().post(counterPartyUrl).reply(HttpStatus.I_AM_A_TEAPOT);

      const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(body).toStrictEqual(mockResponses.internalServerError);
    });
  });
});
