import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { GIFT } from '@ukef/constants';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const {
  PATH: { FACILITY, FACILITIES },
} = GIFT;

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

describe('GET /gift/facilities/{ids}', () => {
  const valueGenerator = new RandomValueGenerator();

  const mockFacilityIds = [valueGenerator.ukefId(), valueGenerator.ukefId(), valueGenerator.ukefId()];

  const mockFacilityIdsPathParam = mockFacilityIds.join(',');

  const url = `/api/${prefixAndVersion}/gift${FACILITIES}?ids=${mockFacilityIdsPathParam}`;

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

  describe(`when ${HttpStatus.OK} responses are returned by GIFT for all facilities`, () => {
    it(`should return a ${HttpStatus.OK} response with all facilities`, async () => {
      // Arrange
      const mockFacilityResponses = mockFacilityIds.map((facilityId) => ({
        facilityId,
        aMockFacility: true,
      }));

      nock(GIFT_API_URL).get(`${FACILITY}/${mockFacilityIds[0]}`).reply(HttpStatus.OK, mockFacilityResponses[0]);
      nock(GIFT_API_URL).get(`${FACILITY}/${mockFacilityIds[1]}`).reply(HttpStatus.OK, mockFacilityResponses[1]);
      nock(GIFT_API_URL).get(`${FACILITY}/${mockFacilityIds[2]}`).reply(HttpStatus.OK, mockFacilityResponses[2]);

      // Act
      const { status, body } = await api.get(url);

      // Assert
      expect(status).toEqual(HttpStatus.OK);
      expect(body).toHaveLength(mockFacilityIds.length);

      expect(body).toStrictEqual(mockFacilityResponses);
    });
  });

  describe(`when a ${HttpStatus.BAD_REQUEST} response is returned by GIFT for one facility`, () => {
    it(`should return a ${HttpStatus.OK} response containing the mixed facility responses`, async () => {
      // Arrange
      const badRequestResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation error',
      };

      nock(GIFT_API_URL).get(`${FACILITY}/${mockFacilityIds[0]}`).reply(HttpStatus.OK, { facilityId: mockFacilityIds[0], aMockFacility: true });
      nock(GIFT_API_URL).get(`${FACILITY}/${mockFacilityIds[1]}`).reply(HttpStatus.BAD_REQUEST, badRequestResponse);
      nock(GIFT_API_URL).get(`${FACILITY}/${mockFacilityIds[2]}`).reply(HttpStatus.OK, { facilityId: mockFacilityIds[2], aMockFacility: true });

      // Act
      const { status, body } = await api.get(url);

      // Assert
      expect(status).toEqual(HttpStatus.OK);
      expect(body).toHaveLength(mockFacilityIds.length);

      expect(body[0]).toStrictEqual({ facilityId: mockFacilityIds[0], aMockFacility: true });
      expect(body[1]).toStrictEqual(badRequestResponse);
      expect(body[2]).toStrictEqual({ facilityId: mockFacilityIds[2], aMockFacility: true });
    });
  });

  describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} response is returned by GIFT`, () => {
    it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
      // Arrange
      nock(GIFT_API_URL).get(`${FACILITY}/${mockFacilityIds[0]}`).reply(HttpStatus.INTERNAL_SERVER_ERROR);

      // Act
      const { status } = await api.get(url);

      // Assert
      expect(status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
