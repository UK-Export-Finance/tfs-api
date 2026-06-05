import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import {
  apimFacilityAmendmentWithoutQueueUrl,
  approveStatusUrl,
  facilityAmendmentUrl,
  facilityUrl,
  facilityWorkPackageUrl,
  mockResponses,
  obligationAmendmentUrl,
} from './test-helpers';

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
      api.postWithoutAuth(
        apimFacilityAmendmentWithoutQueueUrl,
        GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD,
        incorrectAuth?.headerName,
        incorrectAuth?.headerValue,
      ),
  });

  describe(`${AMEND_FACILITY_INCREASE_AMOUNT}`, () => {
    describe(`when the payload is valid and a ${HttpStatus.CREATED} response is returned by all GIFT endpoints`, () => {
      it(`should return a ${HttpStatus.CREATED} response with a facility and the created amendment`, async () => {
        // Arrange
        const callOrder: string[] = [];

        nock(GIFT_API_URL)
          .get(facilityUrl)
          .reply(HttpStatus.OK, {
            obligations: [{ id: 'obligation-1' }],
          });

        nock(GIFT_API_URL)
          .post(facilityWorkPackageUrl)
          .reply(() => {
            callOrder.push('workPackage');

            return [HttpStatus.CREATED, mockResponses.workPackageCreation];
          });

        nock(GIFT_API_URL)
          .post(facilityAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT))
          .reply(() => {
            callOrder.push('facilityAmendment');

            return [HttpStatus.CREATED, mockResponses.facilityAmendment];
          });

        nock(GIFT_API_URL)
          .post(obligationAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT))
          .reply(() => {
            callOrder.push('obligationAmendment');

            return [HttpStatus.CREATED, mockResponses.facilityAmendment];
          });

        nock(GIFT_API_URL).post(approveStatusUrl).reply(HttpStatus.OK, mockResponses.approveStatus);

        const mockPayload = {
          amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
          amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT,
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.CREATED);
        expect(body).toStrictEqual({
          ...mockResponses.approveStatus,
          isApproved: true,
        });

        expect(callOrder).toStrictEqual(['workPackage', 'facilityAmendment', 'obligationAmendment']);
      });
    });
  });

  describe(`${AMEND_FACILITY_DECREASE_AMOUNT}`, () => {
    describe(`when the payload is valid and a ${HttpStatus.CREATED} response is returned by all GIFT endpoints`, () => {
      it(`should return a ${HttpStatus.CREATED} response with a facility and the created amendment`, async () => {
        // Arrange
        const callOrder: string[] = [];

        nock(GIFT_API_URL)
          .get(facilityUrl)
          .reply(HttpStatus.OK, {
            obligations: [{ id: 'obligation-1' }],
          });

        nock(GIFT_API_URL)
          .post(facilityWorkPackageUrl)
          .reply(() => {
            callOrder.push('workPackage');

            return [HttpStatus.CREATED, mockResponses.workPackageCreation];
          });

        nock(GIFT_API_URL)
          .post(obligationAmendmentUrl(AMEND_FACILITY_DECREASE_AMOUNT))
          .reply(() => {
            callOrder.push('obligationAmendment');

            return [HttpStatus.CREATED, mockResponses.facilityAmendment];
          });

        nock(GIFT_API_URL)
          .post(facilityAmendmentUrl(AMEND_FACILITY_DECREASE_AMOUNT))
          .reply(() => {
            callOrder.push('facilityAmendment');

            return [HttpStatus.CREATED, mockResponses.facilityAmendment];
          });

        nock(GIFT_API_URL).post(approveStatusUrl).reply(HttpStatus.OK, mockResponses.approveStatus);

        const mockPayload = {
          amendmentType: AMEND_FACILITY_DECREASE_AMOUNT,
          amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.DECREASE_AMOUNT,
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.CREATED);

        expect(body).toStrictEqual({
          ...mockResponses.approveStatus,
          isApproved: true,
        });

        expect(callOrder).toStrictEqual(['workPackage', 'obligationAmendment', 'facilityAmendment']);
      });
    });
  });

  describe(`${AMEND_FACILITY_REPLACE_EXPIRY_DATE}`, () => {
    describe(`when the payload is valid and a ${HttpStatus.CREATED} response is returned by all GIFT endpoints`, () => {
      it(`should return a ${HttpStatus.CREATED} response with a facility and the created amendment`, async () => {
        // Arrange
        nock(GIFT_API_URL)
          .get(facilityUrl)
          .reply(HttpStatus.OK, {
            obligations: [{ id: 'obligation-1' }],
          });

        nock(GIFT_API_URL).post(facilityWorkPackageUrl).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).post(facilityAmendmentUrl(AMEND_FACILITY_REPLACE_EXPIRY_DATE)).reply(HttpStatus.CREATED, mockResponses.facilityAmendment);

        nock(GIFT_API_URL).post(approveStatusUrl).reply(HttpStatus.OK, mockResponses.approveStatus);

        const mockPayload = {
          amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
          amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.REPLACE_EXPIRY_DATE,
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.CREATED);
        expect(body).toStrictEqual({
          ...mockResponses.approveStatus,
          isApproved: true,
        });
      });
    });
  });
});
