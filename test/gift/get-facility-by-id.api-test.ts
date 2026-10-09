import { HttpStatus } from '@nestjs/common';
import { AppConfig } from '@ukef/config/app.config';
import { GIFT } from '@ukef/constants';
import { GiftQueueService } from '@ukef/modules/gift/services';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withFacilityIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/facility-identifier-url-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const {
  PATH: { FACILITY },
} = GIFT;

describe('GET /gift/facility/{facilityId}', () => {
  const valueGenerator = new RandomValueGenerator();

  const mockFacilityId = valueGenerator.ukefId();

  const url = `/api/${prefixAndVersion}/gift${FACILITY}/${mockFacilityId}`;

  let api: Api;
  let enqueueSpy: jest.SpyInstance;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  beforeEach(() => {
    enqueueSpy = jest.spyOn(GiftQueueService.prototype, 'enqueue').mockResolvedValue(undefined);
  });

  afterEach(() => {
    enqueueSpy.mockRestore();
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {},
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) => api.getWithoutAuth(url, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  describe('validation', () => {
    withFacilityIdentifierUrlValidationApiTests({
      givenRequestWouldOtherwiseSucceedForFacilityId: () => {},
      makeRequestWithFacilityId: (facilityId) => api.get(`/api/${prefixAndVersion}/gift${FACILITY}/${facilityId}`),
      idName: 'facilityId',
      successStatusCode: HttpStatus.ACCEPTED,
    });
  });

  describe('when the facilityId is valid', () => {
    it(`should return ${HttpStatus.ACCEPTED}`, async () => {
      // Act
      const { status } = await api.get(url);

      // Assert
      expect(status).toBe(HttpStatus.ACCEPTED);
    });

    it('should call giftQueueService.enqueue with the facility get message', async () => {
      // Act
      await api.get(url);

      // Assert
      expect(enqueueSpy).toHaveBeenCalledTimes(1);
      expect(enqueueSpy).toHaveBeenCalledWith({ messageType: 'FACILITY_GET', facilityId: mockFacilityId });
    });
  });
});
