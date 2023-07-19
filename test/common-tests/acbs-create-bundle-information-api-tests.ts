import { ENUMS } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import nock from 'nock/types';
import supertest from 'supertest';

export const withAcbsCreateBundleInformationTests = ({
  givenTheRequestWouldOtherwiseSucceed,
  requestToCreateBundleInformationInAcbs,
  givenRequestToCreateBundleInformationInAcbsSucceeds,
  givenRequestToCreateBundleInformationInAcbsSucceedsWithWarningHeader,
  makeRequest,
  facilityIdentifier,
  expectedResponse,
  createBundleInformationType,
  expectedResponseCode,
}: {
  givenTheRequestWouldOtherwiseSucceed: () => void;
  requestToCreateBundleInformationInAcbs: () => nock.Interceptor;
  givenRequestToCreateBundleInformationInAcbsSucceeds: () => nock.Scope;
  givenRequestToCreateBundleInformationInAcbsSucceedsWithWarningHeader: () => nock.Scope;
  makeRequest: () => supertest.Test;
  facilityIdentifier: UkefId;
  expectedResponse: unknown;
  createBundleInformationType: string;
  expectedResponseCode: number;
}) => {
  describe('Common ACBS create bundle information tests', () => {
    beforeEach(() => {
      givenTheRequestWouldOtherwiseSucceed();
    });

    describe('Shared Acbs create bundle information tests', () => {
      it(`returns a ${expectedResponseCode} response with the bundle identifier if getting the facility succeeds and the bundle information has been successfully created in ACBS`, async () => {
        const acbsRequest = givenRequestToCreateBundleInformationInAcbsSucceeds();

        const { status, body, header } = await makeRequest();

        expect(status).toBe(expectedResponseCode);
        expect(body).toStrictEqual(expectedResponse);
        expect(acbsRequest.isDone()).toBe(true);
        expect(header).not.toHaveProperty('processing-warning');
      });

      it(`returns a ${expectedResponseCode} response with the bundle identifier and 'processing-warning' header is set if getting the facility succeeds and ACBS returns a warning error`, async () => {
        const acbsRequest = givenRequestToCreateBundleInformationInAcbsSucceedsWithWarningHeader();

        const { status, body, header } = await makeRequest();
        expect(status).toBe(expectedResponseCode);
        expect(body).toStrictEqual(expectedResponse);
        expect(acbsRequest.isDone()).toBe(true);
        expect(header).toHaveProperty('processing-warning');
      });

      it('returns a 400 response if ACBS responds with a 400 response that is not a string when creating the bundle information', async () => {
        const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
        requestToCreateBundleInformationInAcbs().reply(400, acbsErrorMessage);

        const { status, body } = await makeRequest();

        expect(status).toBe(400);
        expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
      });

      it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain a known error when creating the bundle information', async () => {
        const acbsErrorMessage = 'ACBS error message';
        requestToCreateBundleInformationInAcbs().reply(400, acbsErrorMessage);

        const { status, body } = await makeRequest();

        expect(status).toBe(400);
        expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
      });

      it('returns a 500 response if ACBS responds with an error code that is not 400 when creating the bundle information', async () => {
        requestToCreateBundleInformationInAcbs().reply(401, 'Unauthorized');

        const { status, body } = await makeRequest();

        expect(status).toBe(500);
        expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
      });

      it('returns a 500 response if ACBS times out when creating the bundle information', async () => {
        requestToCreateBundleInformationInAcbs().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

        const { status, body } = await makeRequest();

        expect(status).toBe(500);
        expect(body).toStrictEqual({
          statusCode: 500,
          message: 'Internal server error',
        });
      });
    });

    if (createBundleInformationType === ENUMS.BUNDLE_INFORMATION_TYPES.FACILITY_CODE_VALUE_TRANSACTION) {
      describe('FacilityCodeValueTransaction specific tests', () => {
        it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility does not exist" when creating the bundle information', async () => {
          requestToCreateBundleInformationInAcbs().reply(400, `Facility does not exist or user does not have access to it: '${facilityIdentifier}'`);

          const { status, body } = await makeRequest();
          expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });

          expect(status).toBe(404);
        });
      });
    }

    if (createBundleInformationType === ENUMS.BUNDLE_INFORMATION_TYPES.FACILITY_AMOUNT_TRANSACTION) {
      describe('FacilityAmountTransaction specific tests', () => {
        it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility does not exist" when creating the bundle information', async () => {
          requestToCreateBundleInformationInAcbs().reply(400, `Facility does not exist or user does not have access to it: '${facilityIdentifier}'`);

          const { status, body } = await makeRequest();
          expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });

          expect(status).toBe(404);
        });
      });
    }

    if (createBundleInformationType === ENUMS.BUNDLE_INFORMATION_TYPES.LOAN_ADVANCE_TRANSACTION) {
      describe('LoanAdvanceTransaction specific tests', () => {
        it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Loan does not exist" when creating the facility activation transaction', async () => {
          requestToCreateBundleInformationInAcbs().reply(400, `Loan does not exist or user does not have access to it: '${facilityIdentifier}'`);

          const { status, body } = await makeRequest();

          expect(status).toBe(404);
          expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
        });
      });
    }

    if (createBundleInformationType === ENUMS.BUNDLE_INFORMATION_TYPES.FACILITY_FEE_AMOUNT_TRANSACTION) {
      describe('FacilityFixedFee specific tests', () => {
        it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility does not exist" when creating the facility fixed fees amount amendment', async () => {
          requestToCreateBundleInformationInAcbs().reply(400, `Facility does not exist or user does not have access to it: '${facilityIdentifier}'`);

          const { status, body } = await makeRequest();

          expect(status).toBe(404);
          expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
        });
      });
    }

    if (createBundleInformationType === ENUMS.BUNDLE_INFORMATION_TYPES.NEW_LOAN_REQUEST) {
      describe('NewLoanRequest specific tests', () => {
        it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility does not exist" when creating the facility loan', async () => {
          requestToCreateBundleInformationInAcbs().reply(400, `Facility does not exist or user does not have access to it: '${facilityIdentifier}'`);

          const { status, body } = await makeRequest();

          expect(status).toBe(404);
          expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
        });
      });
    }
  });
};
