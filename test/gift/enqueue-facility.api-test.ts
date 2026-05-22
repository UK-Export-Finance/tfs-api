import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { App as AppUnderTest } from '@ukef/app';
import { AUTH } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { MainModule } from '@ukef/main.module';
import { GiftQueueService } from '@ukef/modules/gift/services';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import request from 'supertest';

import { apimFacilityUrl } from './test-helpers';

describe('POST /gift/facility', () => {
  let app: INestApplication;
  let mockEnqueue: jest.Mock;

  beforeAll(async () => {
    mockEnqueue = jest.fn().mockResolvedValue(undefined);

    const moduleFixture = await Test.createTestingModule({ imports: [MainModule] })
      .overrideProvider(GiftQueueService)
      .useValue({ enqueue: mockEnqueue })
      .compile();

    app = moduleFixture.createNestApplication();
    new AppUnderTest(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockEnqueue.mockClear();
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {},
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) => {
      const req = request(app.getHttpServer()).post(apimFacilityUrl).send(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);
      if (incorrectAuth) {
        return req.set(incorrectAuth.headerName, incorrectAuth.headerValue);
      }
      return req;
    },
  });

  describe('when the payload is valid', () => {
    it('should return 202', async () => {
      const { status } = await request(app.getHttpServer())
        .post(apimFacilityUrl)
        .send(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD)
        .set(AUTH.STRATEGY, ENVIRONMENT_VARIABLES.API_KEY);

      expect(status).toBe(HttpStatus.ACCEPTED);
    });

    it('should call giftQueueService.enqueue with the facility creation message', async () => {
      await request(app.getHttpServer()).post(apimFacilityUrl).send(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD).set(AUTH.STRATEGY, ENVIRONMENT_VARIABLES.API_KEY);

      expect(mockEnqueue).toHaveBeenCalledTimes(1);
      expect(mockEnqueue).toHaveBeenCalledWith({ messageType: 'FACILITY_CREATION', payload: GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD });
    });
  });
});
