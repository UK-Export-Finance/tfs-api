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

  const url = `/api/${prefixAndVersion}/gift${FACILITY}${mockFacilityId}`;

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
        nock(GIFT_API_URL).get(`${FACILITY}${facilityId}`).reply(200);
      },
      makeRequestWithFacilityId: (facilityId) => api.get(`/api/${prefixAndVersion}/gift${FACILITY}${facilityId}`),
      idName: 'facilityId',
    });
  });

  describe('when a 200 response is returned by GIFT', () => {
    it('should return a 200 response with the received data', async () => {
      const mockResponse = {
        facilityId: mockFacilityId,
        aMockFacility: true,
      };

      nock(GIFT_API_URL).get(`${FACILITY}${mockFacilityId}`).reply(200, mockResponse);

      const { status, body } = await api.get(url);

      expect(status).toBe(200);

      expect(body).toStrictEqual(mockResponse);
    });
  });

  describe('when a 400 response is returned by GIFT', () => {
    it('should return a 400 response with the facility', async () => {
      const mockResponse = {
        statusCode: 400,
        message: 'Validation error',
        validationErrors: [
          {
            path: ['facilityId'],
            message: 'Invalid facilityId',
          },
        ],
      };

      nock(GIFT_API_URL).get(`${FACILITY}${mockFacilityId}`).reply(400, mockResponse);

      const { status, body } = await api.get(url);

      expect(status).toBe(400);

      expect(body).toStrictEqual(mockResponse);
    });
  });

  describe('when a 404 response is returned by GIFT', () => {
    it('should return a 404 response with the facility', async () => {
      const mockResponse = {
        statusCode: 404,
        message: 'No Facility was found',
      };

      nock(GIFT_API_URL).get(`${FACILITY}${mockFacilityId}`).reply(404, mockResponse);

      const { status, body } = await api.get(url);

      expect(status).toBe(404);

      expect(body).toStrictEqual(mockResponse);
    });
  });

  describe('when a 401 response is returned by GIFT', () => {
    it('should return a 500 response', async () => {
      nock(GIFT_API_URL).get(`${FACILITY}${mockFacilityId}`).reply(401);

      const { status } = await api.get(url);

      expect(status).toBe(500);
    });
  });

  describe('when a 500 response is returned by GIFT', () => {
    it('should return a 500 response', async () => {
      nock(GIFT_API_URL).get(`${FACILITY}${mockFacilityId}`).reply(500);

      const { status } = await api.get(url);

      expect(status).toBe(500);
    });
  });
});
