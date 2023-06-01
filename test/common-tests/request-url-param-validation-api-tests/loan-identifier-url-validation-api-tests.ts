import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import request from 'supertest';

const expectedLoanIdentifierMustMatchPatternErrorMessage = `loanIdentifier must match /^\\d{9}$/ regular expression`;

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

    it('returns a 400 response if the loanId in the URL has fewer than 9 digits', async () => {
      const fewerThan9Digits = '12345678';
      givenRequestWouldOtherwiseSucceedForLoanId(fewerThan9Digits);

      const { status, body } = await makeRequestWithLoanId(fewerThan9Digits);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`loanIdentifier must be longer than or equal to 9 characters`]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the loanId in the URL has more than 9 digits', async () => {
      const moreThan9Digits = '1234567890';
      givenRequestWouldOtherwiseSucceedForLoanId(moreThan9Digits);

      const { status, body } = await makeRequestWithLoanId(moreThan9Digits);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`loanIdentifier must be shorter than or equal to 9 characters`]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the loanId in the URL has an alphabetic character', async () => {
      const withAnAlphaCharacter = '00123a456';
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
      const withAnNonAlphaNumericCharacter = '0012345!7';
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
