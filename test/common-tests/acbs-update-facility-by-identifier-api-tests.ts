import { TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import nock from 'nock/types';
import supertest from 'supertest';

export const withAcbsUpdateFacilityByIdentifierServiceTests = ({
  givenTheRequestWouldOtherwiseSucceed,
  requestToUpdateFacilityInAcbs,
  makeRequest,
}: {
  givenTheRequestWouldOtherwiseSucceed: () => void;
  requestToUpdateFacilityInAcbs: () => nock.Interceptor;
  makeRequest: () => supertest.Test;
}) => {
  describe('Common ACBS update facility service tests', () => {
    it('returns a 400 response if ACBS update endpoint responds with a 400 response without the string "The Facility not found or the user does not have access to it."', async () => {
      givenTheRequestWouldOtherwiseSucceed();

      requestToUpdateFacilityInAcbs().reply(400, 'error message');

      const { status, body } = await makeRequest();

      expect(status).toBe(400);
      expect(body).toStrictEqual({ statusCode: 400, message: 'Bad request', error: 'error message' });
    });

    it('returns a 400 response if ACBS update endpoint responds with a 400 response that is not a string', async () => {
      givenTheRequestWouldOtherwiseSucceed();

      const acbsErrorMessage = { Message: 'error message' };
      requestToUpdateFacilityInAcbs().reply(400, acbsErrorMessage);
      const { status, body } = await makeRequest();

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: JSON.stringify(acbsErrorMessage), statusCode: 400 });
    });

    it('returns a 404 response if ACBS update endpoint responds with a 400 response with the string "The Facility not found or the user does not have access to it."', async () => {
      givenTheRequestWouldOtherwiseSucceed();

      requestToUpdateFacilityInAcbs().reply(400, 'The Facility not found or the user does not have access to it.');

      const { status, body } = await makeRequest();

      expect(status).toBe(404);
      expect(body).toStrictEqual({ statusCode: 404, message: 'Not found' });
    });

    it('returns a 500 response if ACBS update endpoint responds with an error code that is not 400', async () => {
      givenTheRequestWouldOtherwiseSucceed();

      requestToUpdateFacilityInAcbs().reply(401, 'Unauthorized');

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if updating the facility in ACBS times out', async () => {
      givenTheRequestWouldOtherwiseSucceed();

      requestToUpdateFacilityInAcbs().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200);

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });
};
