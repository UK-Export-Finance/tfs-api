import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import { mockResponses } from '../test-helpers';
import { generatePayload } from './generate-payload';
import { assert400Response } from './response-assertion';
import { stringValidation } from './string-validation';

const { PATH } = GIFT;

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const UNSUPPORTED_PRODUCT_TYPE_CODE = 'ABC';

/**
 * Validation tests for a product type code string field with an unsupported product type code and invalid values
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {String} url: The URL the tests will call.
 */
export const productTypeCodeStringValidation = ({ initialPayload, parentFieldName, url }) => {
  let api: Api;

  const fieldName = 'productTypeCode';

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  const mockPayload = generatePayload({ initialPayload, fieldName, parentFieldName });

  describe('when the provided product type code is not supported', () => {
    beforeAll(() => {
      // Arrange

      nock(GIFT_API_URL).persist().get(`${PATH.PRODUCT_TYPE}/${UNSUPPORTED_PRODUCT_TYPE_CODE}`).reply(HttpStatus.NOT_FOUND, mockResponses.productType);

      mockPayload[`${parentFieldName}`][`${fieldName}`] = UNSUPPORTED_PRODUCT_TYPE_CODE;
    });

    it('should return a 400 response', async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [
        `${parentFieldName}.${fieldName} is not supported (${UNSUPPORTED_PRODUCT_TYPE_CODE})`,
        `obligations contain a subtypeCode that is not supported for the provided productTypeCode (${UNSUPPORTED_PRODUCT_TYPE_CODE})`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  stringValidation({
    fieldName,
    initialPayload,
    min: GIFT.VALIDATION.FACILITY.OVERVIEW.PRODUCT_TYPE_CODE.MIN_LENGTH,
    max: GIFT.VALIDATION.FACILITY.OVERVIEW.PRODUCT_TYPE_CODE.MAX_LENGTH,
    parentFieldName,
    url,
  });
};
