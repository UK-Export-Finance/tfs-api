import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('GET /gift/facility/{facilityId}', () => {
  const valueGenerator = new RandomValueGenerator();

  const mockFacilityId = valueGenerator.ukefId();

  const url = `/api/v1/gift/facility/${mockFacilityId}`;

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

  describe('when a 200 response is returned by GIFT', () => {
    it('should return a 200 response with the received data', async () => {
      const mockResponse = {
        facilityId: mockFacilityId,
        aMockFacility: true,
      };

      nock(ENVIRONMENT_VARIABLES.GIFT_API_URL).get(`/facility/${mockFacilityId}`).reply(200, mockResponse);

      const { status, body } = await api.get(url);

      expect(status).toBe(200);

      expect(body).toStrictEqual(mockResponse);
    });
  });

  describe('when a 400 response is returned by GIFT', () => {
    it('should return a 404 response with the facility', async () => {
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

      nock(ENVIRONMENT_VARIABLES.GIFT_API_URL).get(`/facility/${mockFacilityId}`).reply(404, mockResponse);

      const { status, body } = await api.get(url);

      expect(status).toBe(404);

      expect(body).toStrictEqual(mockResponse);
    });
  });

  describe('when a 404 response is returned by GIFT', () => {
    it('should return a 404 response with the facility', async () => {
      const mockResponse = {
        statusCode: 404,
        message: 'No Facility was found',
      };

      nock(ENVIRONMENT_VARIABLES.GIFT_API_URL).get(`/facility/${mockFacilityId}`).reply(404, mockResponse);

      const { status, body } = await api.get(url);

      expect(status).toBe(404);

      expect(body).toStrictEqual(mockResponse);
    });
  });

  describe('when a 401 response is returned by GIFT', () => {
    it('should return a 500 response', async () => {
      nock(ENVIRONMENT_VARIABLES.GIFT_API_URL).get(`/facility/${mockFacilityId}`).reply(401);

      const { status } = await api.get(url);

      expect(status).toBe(500);
    });
  });

  describe('when a 500 response is returned by GIFT', () => {
    it('should return a 500 response', async () => {
      nock(ENVIRONMENT_VARIABLES.GIFT_API_URL).get(`/facility/${mockFacilityId}`).reply(500);

      const { status } = await api.get(url);

      expect(status).toBe(500);
    });
  });
});
