import supertest from 'supertest';

export const withPutFacilityQueryParameterTests = ({
  makeRequestWithUrl,
  updateFacilityBaseUrl,
}: {
  makeRequestWithUrl: (url: string) => supertest.Test;
  updateFacilityBaseUrl: string;
}) => {
  describe('PUT /facilities query parameter tests', () => {
    it('returns a 400 response if the request does not have the op query parameter', async () => {
      const { status, body } = await makeRequestWithUrl(updateFacilityBaseUrl);
      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`op must be one of the following values: issue, amendExpiryDate, amendAmount`]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the request has an empty query value for op', async () => {
      const { status, body } = await makeRequestWithUrl(updateFacilityBaseUrl + '?op=');
      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`op must be one of the following values: issue, amendExpiryDate, amendAmount`]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the op query parameter is not supported', async () => {
      const InvalidUpdateFacilityUrl = updateFacilityBaseUrl + `?op=invalidEnum`;

      const { status, body } = await makeRequestWithUrl(InvalidUpdateFacilityUrl);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`op must be one of the following values: issue, amendExpiryDate, amendAmount`]),
        statusCode: 400,
      });
    });
  });
};
