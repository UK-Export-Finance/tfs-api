import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import request from 'supertest';

const expectedBundleIdentifierMustMatchPatternErrorMessage = `BundleIdentifier must match /^0000\\d{6}$/ regular expression`;

export const withBundleIdentifierUrlValidationApiTests = ({
  makeRequestWithBundleId,
  givenRequestWouldOtherwiseSucceedForBundleId,
  successStatusCode,
}: {
  makeRequestWithBundleId: (bundleId: string) => request.Test;
  givenRequestWouldOtherwiseSucceedForBundleId: (bundleId: string) => void;
  successStatusCode?: number;
}): void => {
  describe('bundleIdentifier URL validation', () => {
    const valueGenerator = new RandomValueGenerator();
    const expectedSuccessStatusCode = successStatusCode ?? 200;

    it(`returns a ${expectedSuccessStatusCode} response if the bundleId in the URL is valid`, async () => {
      const validBundleId = valueGenerator.acbsBundleId();
      givenRequestWouldOtherwiseSucceedForBundleId(validBundleId);

      const { status } = await makeRequestWithBundleId(validBundleId);

      expect(status).toBe(expectedSuccessStatusCode);
    });

    it('returns a 400 response if the bundleId in the URL has fewer than 10 digits', async () => {
      const fewerThan10Digits = '001234567';
      givenRequestWouldOtherwiseSucceedForBundleId(fewerThan10Digits);

      const { status, body } = await makeRequestWithBundleId(fewerThan10Digits);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`bundleIdentifier must be longer than or equal to 10 characters`]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the bundleId in the URL has more than 10 digits', async () => {
      const moreThan10Digits = '00123456789';
      givenRequestWouldOtherwiseSucceedForBundleId(moreThan10Digits);

      const { status, body } = await makeRequestWithBundleId(moreThan10Digits);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`bundleIdentifier must be shorter than or equal to 10 characters`]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the bundleId in the URL has an alphabetic character', async () => {
      const withAnAlphaCharacter = '00123a4567';
      givenRequestWouldOtherwiseSucceedForBundleId(withAnAlphaCharacter);

      const { status, body } = await makeRequestWithBundleId(withAnAlphaCharacter);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([expectedBundleIdentifierMustMatchPatternErrorMessage]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the bundleId in the URL has a non-alphanumeric character', async () => {
      const withAnNonAlphaNumericCharacter = '0012345!78';
      givenRequestWouldOtherwiseSucceedForBundleId(withAnNonAlphaNumericCharacter);

      const { status, body } = await makeRequestWithBundleId(withAnNonAlphaNumericCharacter);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([expectedBundleIdentifierMustMatchPatternErrorMessage]),
        statusCode: 400,
      });
    });
  });
};
