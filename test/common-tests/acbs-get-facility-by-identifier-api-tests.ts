import { TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import nock from 'nock/types';
import supertest from 'supertest';

export const withAcbsGetFacilityServiceCommonTests = ({
  givenTheRequestWouldOtherwiseSucceed,
  requestToGetFacilityInAcbs,
  makeRequest,
}: {
  givenTheRequestWouldOtherwiseSucceed: () => void;
  requestToGetFacilityInAcbs: () => nock.Interceptor;
  makeRequest: () => supertest.Test;
}) => {
  describe('Common ACBS get facility service tests', () => {
    it('returns a 404 response if ACBS get facility returns a 400 response with the string "The facility not found"', async () => {
      givenTheRequestWouldOtherwiseSucceed();
      requestToGetFacilityInAcbs().reply(400, 'The facility not found');

      const { status, body } = await makeRequest();

      expect(status).toBe(404);
      expect(body).toStrictEqual({
        statusCode: 404,
        message: 'Not found',
      });
    });

    it('returns a 500 response if ACBS get facility returns a 400 response without the string "The facility not found"', async () => {
      givenTheRequestWouldOtherwiseSucceed();
      requestToGetFacilityInAcbs().reply(400, 'An error message from ACBS.');

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });

    it('returns a 500 response if ACBS get facility responds with a 400 response that is not a string', async () => {
      givenTheRequestWouldOtherwiseSucceed();

      const acbsErrorMessage = { Message: 'error message' };
      requestToGetFacilityInAcbs().reply(400, acbsErrorMessage);

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS get facility responds with a status code that is NOT 200 or 400', async () => {
      givenTheRequestWouldOtherwiseSucceed();
      requestToGetFacilityInAcbs().reply(401);

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });

    it('returns a 500 response if ACBS get facility times out', async () => {
      givenTheRequestWouldOtherwiseSucceed();
      requestToGetFacilityInAcbs().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200);

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });
};
