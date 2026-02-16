import { HttpStatus } from '@nestjs/common';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import { apimFacilityAmendmentUrl, facilityAmendmentUrl, mockResponses, workPackageUrl } from './test-helpers';

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

describe('POST /gift/facility/:facilityId/amendment', () => {
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
      api.postWithoutAuth(apimFacilityAmendmentUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  describe(`when the payload is valid and a ${HttpStatus.CREATED} response is returned by all GIFT endpoints`, () => {
    it(`should return a ${HttpStatus.CREATED} response with a facility and the created amendment`, async () => {
      // Arrange
      nock(GIFT_API_URL).persist().post(workPackageUrl).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

      nock(GIFT_API_URL).persist().post(facilityAmendmentUrl).reply(HttpStatus.CREATED, mockResponses.facilityAmendment);

      // Act
      const { status, body } = await api.post(apimFacilityAmendmentUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.CREATED);

      const expected = mockResponses.facilityAmendment;

      expect(body).toStrictEqual(expected);
    });
  });
});
