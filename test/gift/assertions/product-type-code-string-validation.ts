import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import { mockResponses, obligationSubtypeUrl } from '../test-helpers';
import { generatePayload } from './generate-payload';
import { assert400Response } from './response-assertion';
import { stringValidation } from './string-validation';

const { API_RESPONSE_MESSAGES, OBLIGATION_SUBTYPES, PATH } = GIFT;

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

  // generate initial payload
  const mockPayload = generatePayload({ initialPayload, fieldName, parentFieldName });

  // set the fieldName to have an unsupported product type
  mockPayload[`${parentFieldName}`][`${fieldName}`] = UNSUPPORTED_PRODUCT_TYPE_CODE;

  /**
   * Map over the payload's obligations so that each obligation has the same unsupported product type code.
   * Otherwise, obligation validation errors will be returned.
   * This test is specifically for the high level product type code only.
   */
  mockPayload.obligations = mockPayload.obligations.map((obligation) => ({
    ...obligation,
    productTypeCode: UNSUPPORTED_PRODUCT_TYPE_CODE,
  }));

  /**
   * Mock the obligation subtype response,
   * so that obligations with an unsupported product type code are technically valid.
   * This prevents the obligation validation errors from being returned.
   * So that this test is specifically focus on the high level product type code.
   */
  const mockObligationSubtypeResponse = {
    obligationSubtypes: [
      {
        tonyTest: true,
        code: OBLIGATION_SUBTYPES.EXP01.code,
        name: OBLIGATION_SUBTYPES.EXP01.name,
        productTypeCode: UNSUPPORTED_PRODUCT_TYPE_CODE,
      },
    ],
  };

  describe('when the provided product type code is not supported', () => {
    beforeAll(() => {
      // Arrange
      nock(GIFT_API_URL).persist().get(`${PATH.PRODUCT_TYPE}/${UNSUPPORTED_PRODUCT_TYPE_CODE}`).reply(HttpStatus.NOT_FOUND, mockResponses.productType);

      nock(GIFT_API_URL).persist().get(obligationSubtypeUrl).reply(HttpStatus.OK, mockObligationSubtypeResponse);
    });

    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct body.message', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = API_RESPONSE_MESSAGES.ASYNC_FACILITY_VALIDATION_ERRORS;

      expect(body.message).toStrictEqual(expected);
    });

    it('should return the correct body.validationErrors', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [
        `${parentFieldName}.${fieldName} is not supported - ${UNSUPPORTED_PRODUCT_TYPE_CODE}`,
        `obligations.0.subtypeCode is not supported by product type ${UNSUPPORTED_PRODUCT_TYPE_CODE}`,
        `obligations.1.subtypeCode is not supported by product type ${UNSUPPORTED_PRODUCT_TYPE_CODE}`,
      ];

      expect(body.validationErrors).toStrictEqual(expected);
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
