import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import request from 'supertest';

export const withFacilityIdentifierUrlValidationApiTests = ({
  makeRequestWithFacilityId,
  givenRequestWouldOtherwiseSucceedForFacilityId,
  successStatusCode,
  idName = 'facilityIdentifier',
}: {
  makeRequestWithFacilityId: (facilityId: string) => request.Test;
  givenRequestWouldOtherwiseSucceedForFacilityId: (facilityId: string) => void;
  successStatusCode?: number;
  idName?: string;
}): void => {
  const expectedFacilityIdentifierMustMatchPatternErrorMessage = `${idName} must match /^00\\d{8}$/ regular expression`;

  describe(`${idName} URL validation`, () => {
    const valueGenerator = new RandomValueGenerator();

    const expectedSuccessStatusCode = successStatusCode ?? 200;

    it(`returns a ${expectedSuccessStatusCode} response if the facilityId in the URL is valid`, async () => {
      const validFacilityId = valueGenerator.facilityId();

      givenRequestWouldOtherwiseSucceedForFacilityId(validFacilityId);

      const { status } = await makeRequestWithFacilityId(validFacilityId);

      expect(status).toBe(expectedSuccessStatusCode);
    });

    it('returns a 400 response if the facilityId in the URL has fewer than 10 digits', async () => {
      const fewerThan10Digits = '001234567';

      givenRequestWouldOtherwiseSucceedForFacilityId(fewerThan10Digits);

      const { status, body } = await makeRequestWithFacilityId(fewerThan10Digits);

      expect(status).toBe(400);

      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`${idName} must be longer than or equal to 10 characters`]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the facilityId in the URL has more than 10 digits', async () => {
      const moreThan10Digits = '00123456789';

      givenRequestWouldOtherwiseSucceedForFacilityId(moreThan10Digits);

      const { status, body } = await makeRequestWithFacilityId(moreThan10Digits);

      expect(status).toBe(400);

      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`${idName} must be shorter than or equal to 10 characters`]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the facilityId in the URL has an alphabetic character', async () => {
      const withAnAlphaCharacter = '00123a4567';

      givenRequestWouldOtherwiseSucceedForFacilityId(withAnAlphaCharacter);

      const { status, body } = await makeRequestWithFacilityId(withAnAlphaCharacter);

      expect(status).toBe(400);

      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([expectedFacilityIdentifierMustMatchPatternErrorMessage]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the facilityId in the URL has a non-alphanumeric character', async () => {
      const withAnNonAlphaNumericCharacter = '0012345!78';

      givenRequestWouldOtherwiseSucceedForFacilityId(withAnNonAlphaNumericCharacter);

      const { status, body } = await makeRequestWithFacilityId(withAnNonAlphaNumericCharacter);

      expect(status).toBe(400);

      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([expectedFacilityIdentifierMustMatchPatternErrorMessage]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the facilityId in the URL does not start with 00', async () => {
      const doesNotStartWith00 = '0112345678';

      givenRequestWouldOtherwiseSucceedForFacilityId(doesNotStartWith00);

      const { status, body } = await makeRequestWithFacilityId(doesNotStartWith00);

      expect(status).toBe(400);

      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([expectedFacilityIdentifierMustMatchPatternErrorMessage]),
        statusCode: 400,
      });
    });
  });
};
