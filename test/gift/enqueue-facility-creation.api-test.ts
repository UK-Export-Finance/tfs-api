import { HttpStatus } from '@nestjs/common';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { GiftQueueService } from '@ukef/modules/gift/services';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import nock from 'nock';

import { apimFacilityUrl } from './test-helpers';

describe('POST /gift/facility', () => {
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
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) => {
      return api.postWithoutAuth(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD, incorrectAuth?.headerName, incorrectAuth?.headerValue);
    },
  });

  describe('when the payload is valid', () => {
    it('should return 202', async () => {
      const { status } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      expect(status).toBe(HttpStatus.ACCEPTED);
    });

    it('should call giftQueueService.enqueue with the facility creation message', async () => {
      await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      expect(enqueueSpy).toHaveBeenCalledTimes(1);
      expect(enqueueSpy).toHaveBeenCalledWith({ messageType: 'FACILITY_CREATION', payload: GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD });
    });
  });
});
