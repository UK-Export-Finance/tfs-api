import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { GIFT } from '@ukef/constants';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withFacilityIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/facility-identifier-url-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const {
  PATH: { FACILITY },
} = GIFT;

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

describe('GET /gift/facility/{facilityId}', () => {
  const valueGenerator = new RandomValueGenerator();

  const mockFacilityId = valueGenerator.ukefId();

  const url = `/api/${prefixAndVersion}/gift${FACILITY}/${mockFacilityId}`;

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
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) => api.getWithoutAuth(url, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  describe('validation', () => {
    withFacilityIdentifierUrlValidationApiTests({
      givenRequestWouldOtherwiseSucceedForFacilityId: (facilityId) => {
        nock(GIFT_API_URL).get(`${FACILITY}/${facilityId}`).reply(200);
      },
      makeRequestWithFacilityId: (facilityId) => api.get(`/api/${prefixAndVersion}/gift${FACILITY}/${facilityId}`),
      idName: 'facilityId',
    });
  });

  describe(`when a ${HttpStatus.OK} response is returned by GIFT`, () => {
    it(`should return a ${HttpStatus.OK} response with the received data`, async () => {
      const mockResponse = {
        facilityId: mockFacilityId,
        aMockFacility: true,
      };

      nock(GIFT_API_URL).get(`${FACILITY}/${mockFacilityId}`).reply(200, mockResponse);

      const { status, body } = await api.get(url);

      expect(status).toBe(HttpStatus.OK);

      expect(body).toStrictEqual(mockResponse);
    });
  });

  describe(`when a ${HttpStatus.BAD_REQUEST} response is returned by GIFT`, () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with the facility`, async () => {
      const mockResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation error',
        validationErrors: [
          {
            path: ['facilityId'],
            message: 'Invalid facilityId',
          },
        ],
      };

      nock(GIFT_API_URL).get(`${FACILITY}/${mockFacilityId}`).reply(400, mockResponse);

      const { status, body } = await api.get(url);

      expect(status).toBe(HttpStatus.BAD_REQUEST);

      expect(body).toStrictEqual(mockResponse);
    });
  });

  describe(`when a ${HttpStatus.NOT_FOUND} response is returned by GIFT`, () => {
    it(`should return a ${HttpStatus.NOT_FOUND} response with the facility`, async () => {
      const mockResponse = {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'No Facility was found',
      };

      nock(GIFT_API_URL).get(`${FACILITY}/${mockFacilityId}`).reply(404, mockResponse);

      const { status, body } = await api.get(url);

      expect(status).toBe(HttpStatus.NOT_FOUND);

      expect(body).toStrictEqual(mockResponse);
    });
  });

  describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned by GIFT`, () => {
    it(`should return a ${HttpStatus.UNAUTHORIZED} response`, async () => {
      nock(GIFT_API_URL).get(`${FACILITY}/${mockFacilityId}`).reply(HttpStatus.UNAUTHORIZED);

      const { status } = await api.get(url);

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} response is returned by GIFT`, () => {
    it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
      nock(GIFT_API_URL).get(`${FACILITY}/${mockFacilityId}`).reply(HttpStatus.INTERNAL_SERVER_ERROR);

      const { status } = await api.get(url);

      expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
