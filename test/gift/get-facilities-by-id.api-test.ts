import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { GIFT } from '@ukef/constants';
import { GiftQueueService } from '@ukef/modules/gift/services';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const {
  PATH: { FACILITIES },
} = GIFT;

describe('GET /gift/facilities?ids={ids}', () => {
  const valueGenerator = new RandomValueGenerator();

  const mockFacilityIds = [valueGenerator.ukefId(), valueGenerator.ukefId(), valueGenerator.ukefId()];

  const mockFacilityIdsPathParam = mockFacilityIds.join(',');

  const url = `/api/${prefixAndVersion}/gift${FACILITIES}?ids=${mockFacilityIdsPathParam}`;

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
    describe('when ids query param is not comma-separated UKEF ids', () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
        // Arrange
        const invalidIds = 'invalid-id';

        // Act
        const { status } = await api.get(`/api/${prefixAndVersion}/gift${FACILITIES}?ids=${invalidIds}`);

        // Assert
        expect(status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    describe('when ids query param contains a non-UKEF id', () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response when one id is invalid`, async () => {
        // Arrange
        const invalidIds = `${valueGenerator.ukefId()},123,${valueGenerator.ukefId()}`;

        // Act
        const { status } = await api.get(`/api/${prefixAndVersion}/gift${FACILITIES}?ids=${invalidIds}`);

        // Assert
        expect(status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe('when the ids are valid', () => {
    it(`should return ${HttpStatus.ACCEPTED}`, async () => {
      // Act
      const { status } = await api.get(url);

      // Assert
      expect(status).toBe(HttpStatus.ACCEPTED);
    });

    it('should call giftQueueService.enqueue with the facility get many message', async () => {
      // Act
      await api.get(url);

      // Assert
      expect(enqueueSpy).toHaveBeenCalledTimes(1);
      expect(enqueueSpy).toHaveBeenCalledWith({ messageType: 'FACILITY_GET_MANY', ids: mockFacilityIds });
    });
  });
});
