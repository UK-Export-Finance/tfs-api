import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import request from 'supertest';

const expectedPartyIdentifierMustMatchPatternErrorMessage = `partyIdentifier must match /^\\d{8}$/ regular expression`;

export const withPartyIdentifierUrlValidationApiTests = ({
  makeRequestWithPartyId,
  givenRequestWouldOtherwiseSucceedForPartyId,
  successStatusCode,
}: {
  makeRequestWithPartyId: (partyId: string) => request.Test;
  givenRequestWouldOtherwiseSucceedForPartyId: (partyId: string) => void;
  successStatusCode?: number;
}): void => {
  describe('partyIdentifier URL validation', () => {
    const valueGenerator = new RandomValueGenerator();
    const expectedSuccessStatusCode = successStatusCode ?? 200;

    it(`returns a ${expectedSuccessStatusCode} response if the partyId in the URL is valid`, async () => {
      const validPartyId = valueGenerator.acbsPartyId();
      givenRequestWouldOtherwiseSucceedForPartyId(validPartyId);

      const { status } = await makeRequestWithPartyId(validPartyId);

      expect(status).toBe(expectedSuccessStatusCode);
    });

    it('returns a 400 response if the partyId in the URL has fewer than 8 digits', async () => {
      const fewerThan8Digits = '1234567';
      givenRequestWouldOtherwiseSucceedForPartyId(fewerThan8Digits);

      const { status, body } = await makeRequestWithPartyId(fewerThan8Digits);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`partyIdentifier must be longer than or equal to 8 characters`]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the partyId in the URL has more than 8 digits', async () => {
      const moreThan8Digits = '123456789';
      givenRequestWouldOtherwiseSucceedForPartyId(moreThan8Digits);

      const { status, body } = await makeRequestWithPartyId(moreThan8Digits);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`partyIdentifier must be shorter than or equal to 8 characters`]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the partyId in the URL has an alphabetic character', async () => {
      const withAnAlphaCharacter = '00123a45';
      givenRequestWouldOtherwiseSucceedForPartyId(withAnAlphaCharacter);

      const { status, body } = await makeRequestWithPartyId(withAnAlphaCharacter);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([expectedPartyIdentifierMustMatchPatternErrorMessage]),
        statusCode: 400,
      });
    });

    it('returns a 400 response if the partyId in the URL has a non-alphanumeric character', async () => {
      const withAnNonAlphaNumericCharacter = '0012345!';
      givenRequestWouldOtherwiseSucceedForPartyId(withAnNonAlphaNumericCharacter);

      const { status, body } = await makeRequestWithPartyId(withAnNonAlphaNumericCharacter);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([expectedPartyIdentifierMustMatchPatternErrorMessage]),
        statusCode: 400,
      });
    });
  });
};
