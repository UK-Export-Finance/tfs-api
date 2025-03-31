import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

const {
  PATH: { FACILITY },
} = GIFT;

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

describe('POST /gift/facility', () => {
  const valueGenerator = new RandomValueGenerator();

  const mockFacilityId = valueGenerator.ukefId();

  const url = `/api/v1/gift${FACILITY}`;

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
      api.postWithoutAuth(url, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  describe('when the payload is valid and a 201 response is returned by GIFT', () => {
    it('should return a 201 response with the received data', async () => {
      const mockResponse = {
        facilityId: mockFacilityId,
        aMockFacility: true,
      };

      nock(GIFT_API_URL).post(FACILITY).reply(201, mockResponse);

      const { status, body } = await api.post(url, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      expect(status).toBe(201);

      expect(body).toStrictEqual(mockResponse);
    });
  });

  describe('when a 400 response is returned by GIFT', () => {
    it('should return a 400 response with the received response', async () => {
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

      nock(GIFT_API_URL).post(FACILITY).reply(400, mockResponse);

      const { status, body } = await api.post(url, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      expect(status).toBe(400);

      expect(body).toStrictEqual(mockResponse);
    });
  });

  describe('when a 401 response is returned by GIFT', () => {
    it('should return a 400 response with the received response', async () => {
      const mockResponse = {
        statusCode: 401,
        message: 'Unauthorized',
      };

      nock(GIFT_API_URL).post(FACILITY).reply(401);

      const { status, body } = await api.post(url, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      expect(status).toBe(401);

      expect(body).toStrictEqual(mockResponse);
    });
  });

  describe('when an unacceptable status is returned by GIFT', () => {
    it('should return a 500 response', async () => {
      nock(GIFT_API_URL).post(FACILITY).reply(418);

      const { status } = await api.post(url, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      expect(status).toBe(500);
    });
  });
});
