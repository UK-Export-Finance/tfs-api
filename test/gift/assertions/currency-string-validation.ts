import { GIFT } from '@ukef/constants';
import { AUD } from '@ukef/constants/currencies.constant';
import { Api } from '@ukef-test/support/api';

import { generatePayload } from './generate-payload';
import { assert400Response } from './response-assertion';
import { stringValidation } from './string-validation';

const INVALID_CURRENCY = 'ABC';
const UNSUPPORTED_CURRENCY = AUD;

/**
 * Validation tests for a currency string field with an unsupported currency and invalid values
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {String} url: The URL the tests will call.
 */
export const currencyStringValidation = ({ initialPayload, parentFieldName, url }) => {
  let api: Api;

  const fieldName = 'currency';

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  const mockPayload = generatePayload({ initialPayload, fieldName, parentFieldName });

  describe('when the provided currency is an invalid ISO code', () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = INVALID_CURRENCY;
    });

    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [`${parentFieldName}.${fieldName} is not supported (${INVALID_CURRENCY})`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe('when the provided currency is not supported', () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = UNSUPPORTED_CURRENCY;
    });

    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [`${parentFieldName}.${fieldName} is not supported (${UNSUPPORTED_CURRENCY})`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  stringValidation({
    fieldName,
    initialPayload,
    min: GIFT.VALIDATION.CURRENCY.MIN_LENGTH,
    max: GIFT.VALIDATION.CURRENCY.MAX_LENGTH,
    parentFieldName,
    url,
  });
};
