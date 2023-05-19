import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import request from 'supertest';

const expectedLoanIdentifierMustMatchPatternErrorMessage = `loanIdentifier must match /^\\d{10}$/ regular expression`;

export const withLoanIdentifierUrlValidationApiTests = ({
  makeRequestWithLoanId,
  givenRequestWouldOtherwiseSucceedForLoanId,
  successStatusCode,
}: {
  makeRequestWithLoanId: (facilityId: string) => request.Test;
  givenRequestWouldOtherwiseSucceedForLoanId: (facilityId: string) => void;
  successStatusCode?: number;
}): void => {
  describe('loanIdentifier URL validation', () => {
    const valueGenerator = new RandomValueGenerator();
    const expectedSuccessStatusCode = successStatusCode ?? 200;

    it(`returns a ${expectedSuccessStatusCode} response if the loanId in the URL is valid`, async () => {
      const validLoanId = valueGenerator.loanId();
      givenRequestWouldOtherwiseSucceedForLoanId(validLoanId);

      const { status } = await makeRequestWithLoanId(validLoanId);

      expect(status).toBe(expectedSuccessStatusCode);
    });

    it('returns a 400 response if the loanId in the URL has fewer than 10 digits', async () => {
      const fewerThan10Digits = '001234567';
      givenRequestWouldOtherwiseSucceedForLoanId(fewerThan10Digits);

      const { status, body } = await makeRequestWithLoanId(fewerThan10Digits);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`loanIdentifier must be longer than or equal to 10 characters`]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the loanId in the URL has more than 10 digits', async () => {
      const moreThan10Digits = '00123456789';
      givenRequestWouldOtherwiseSucceedForLoanId(moreThan10Digits);

      const { status, body } = await makeRequestWithLoanId(moreThan10Digits);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`loanIdentifier must be shorter than or equal to 10 characters`]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the loanId in the URL has an alphabetic character', async () => {
      const withAnAlphaCharacter = '00123a4567';
      givenRequestWouldOtherwiseSucceedForLoanId(withAnAlphaCharacter);

      const { status, body } = await makeRequestWithLoanId(withAnAlphaCharacter);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([expectedLoanIdentifierMustMatchPatternErrorMessage]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the loanId in the URL has a non-alphanumeric character', async () => {
      const withAnNonAlphaNumericCharacter = '0012345!78';
      givenRequestWouldOtherwiseSucceedForLoanId(withAnNonAlphaNumericCharacter);

      const { status, body } = await makeRequestWithLoanId(withAnNonAlphaNumericCharacter);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([expectedLoanIdentifierMustMatchPatternErrorMessage]),
        statusCode: 400,
      });
    });
  });
};
