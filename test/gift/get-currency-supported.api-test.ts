import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const {
  PATH: { CURRENCY, SUPPORTED },
} = GIFT;

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

describe('GET /gift/currencies/supported', () => {
  const url = `/api/${prefixAndVersion}/gift${CURRENCY}${SUPPORTED}`;

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

  describe(`when a ${HttpStatus.OK} response is returned by GIFT`, () => {
    it(`should return a ${HttpStatus.OK} response with the received data`, async () => {
      // Arrange
      const mockResponse = [GIFT_EXAMPLES.CURRENCIES];

      nock(GIFT_API_URL).get(CURRENCY).reply(200, mockResponse);

      // Act
      const { status, body } = await api.get(url);

      // Assert
      expect(status).toBe(HttpStatus.OK);

      expect(body).toStrictEqual(mockResponse);
    });
  });

  describe(`when a ${HttpStatus.NOT_FOUND} response is returned by GIFT`, () => {
    it(`should return a ${HttpStatus.NOT_FOUND} response`, async () => {
      // Arrange
      const mockResponse = {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Route not found',
      };

      nock(GIFT_API_URL).get(CURRENCY).reply(404, mockResponse);

      // Act
      const { status, body } = await api.get(url);

      // Assert
      expect(status).toBe(HttpStatus.NOT_FOUND);

      expect(body).toStrictEqual(mockResponse);
    });
  });

  describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned by GIFT`, () => {
    it(`should return a ${HttpStatus.UNAUTHORIZED} response`, async () => {
      // Arrange
      nock(GIFT_API_URL).get(CURRENCY).reply(HttpStatus.UNAUTHORIZED);

      // Act
      const { status } = await api.get(url);

      // Assert
      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} response is returned by GIFT`, () => {
    it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
      // Arrange
      nock(GIFT_API_URL).get(CURRENCY).reply(HttpStatus.INTERNAL_SERVER_ERROR);

      // Act
      const { status } = await api.get(url);

      // Assert
      expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
