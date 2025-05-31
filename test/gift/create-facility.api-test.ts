import { HttpStatus } from '@nestjs/common';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import {
  apimFacilityUrl,
  approveStatusUrl,
  counterpartyUrl,
  currencyUrl,
  facilityCreationUrl,
  feeTypeUrl,
  fixedFeeUrl,
  mockResponses,
  obligationUrl,
  payloadCounterparties,
  payloadFixedFees,
  payloadObligations,
  payloadRepaymentProfiles,
  repaymentProfileUrl,
} from './test-helpers';

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

describe('POST /gift/facility', () => {
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
      api.postWithoutAuth(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  describe(`when the payload is valid and a ${HttpStatus.CREATED} response is returned by all GIFT endpoints`, () => {
    it(`should return a ${HttpStatus.CREATED}} response with a facility and all created entities`, async () => {
      // Arrange
      nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

      nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

      nock(GIFT_API_URL).persist().post(facilityCreationUrl).reply(HttpStatus.CREATED, mockResponses.facility);

      nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

      nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

      nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

      nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

      nock(GIFT_API_URL).persist().post(approveStatusUrl).reply(HttpStatus.OK, mockResponses.approveStatus);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.CREATED);

      const expected = {
        ...mockResponses.facility.configurationEvent.data,
        counterparties: Array(payloadCounterparties.length).fill(mockResponses.counterparty.data),
        fixedFees: Array(payloadFixedFees.length).fill(mockResponses.fixedFee.data),
        obligations: Array(payloadObligations.length).fill(mockResponses.obligation.data),
        repaymentProfiles: Array(payloadRepaymentProfiles.length).fill(mockResponses.repaymentProfile.data),
      };

      expect(body).toStrictEqual(expected);
    });
  });
});
