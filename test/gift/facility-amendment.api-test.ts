import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import { apimFacilityAmendmentUrl, facilityAmendmentUrl, facilityWorkPackageUrl, mockResponses } from './test-helpers';

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const {
  AMEND_FACILITY_TYPES: { AMEND_FACILITY_INCREASE_AMOUNT, AMEND_FACILITY_DECREASE_AMOUNT, AMEND_FACILITY_REPLACE_EXPIRY_DATE },
} = GIFT;

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

  beforeEach(() => {
    // Arrange
    nock(GIFT_API_URL).persist().post(facilityWorkPackageUrl).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

    nock(GIFT_API_URL).persist().post(facilityAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT)).reply(HttpStatus.CREATED, mockResponses.facilityAmendment);

    nock(GIFT_API_URL).persist().post(facilityAmendmentUrl(AMEND_FACILITY_DECREASE_AMOUNT)).reply(HttpStatus.CREATED, mockResponses.facilityAmendment);

    nock(GIFT_API_URL).persist().post(facilityAmendmentUrl(AMEND_FACILITY_REPLACE_EXPIRY_DATE)).reply(HttpStatus.CREATED, mockResponses.facilityAmendment);
  });

  describe(`${AMEND_FACILITY_INCREASE_AMOUNT}`, () => {
    describe(`when the payload is valid and a ${HttpStatus.CREATED} response is returned by all GIFT endpoints`, () => {
      it(`should return a ${HttpStatus.CREATED} response with a facility and the created amendment`, async () => {
        // Arrange
        const mockPayload = {
          amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
          amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT,
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.CREATED);

        const expected = mockResponses.facilityAmendment;

        expect(body).toStrictEqual(expected);
      });
    });
  });

  describe(`${AMEND_FACILITY_DECREASE_AMOUNT}`, () => {
    describe(`when the payload is valid and a ${HttpStatus.CREATED} response is returned by all GIFT endpoints`, () => {
      it(`should return a ${HttpStatus.CREATED} response with a facility and the created amendment`, async () => {
        // Arrange
        const mockPayload = {
          amendmentType: AMEND_FACILITY_DECREASE_AMOUNT,
          amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.DECREASE_AMOUNT,
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.CREATED);

        const expected = mockResponses.facilityAmendment;

        expect(body).toStrictEqual(expected);
      });
    });
  });

  describe(`${AMEND_FACILITY_REPLACE_EXPIRY_DATE}`, () => {
    describe(`when the payload is valid and a ${HttpStatus.CREATED} response is returned by all GIFT endpoints`, () => {
      it(`should return a ${HttpStatus.CREATED} response with a facility and the created amendment`, async () => {
        // Arrange
        const mockPayload = {
          amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
          amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.REPLACE_EXPIRY_DATE,
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.CREATED);

        const expected = mockResponses.facilityAmendment;

        expect(body).toStrictEqual(expected);
      });
    });
  });
});
