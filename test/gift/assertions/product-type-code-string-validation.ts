import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { MDM_EXAMPLES } from '@ukef/constants/examples/mdm.examples.constant';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import { apimMdmObligationSubtypesUrl, mockResponses } from '../test-helpers';
import { generatePayload } from './generate-payload';
import { assert400Response } from './response-assertion';
import { stringValidation } from './string-validation';

const { API_RESPONSE_MESSAGES, PATH } = GIFT;

const { APIM_MDM_KEY, APIM_MDM_URL, APIM_MDM_VALUE, GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const UNSUPPORTED_PRODUCT_TYPE_CODE = 'ABC';

/**
 * Validation tests for a product type code string field with an unsupported product type code and invalid values
 * @param {object} initialPayload: The payload to use before adding a field value
 * @param {string} parentFieldName: The name of a parent field. E.g parentObject
 * @param {string} url: The URL the tests will call.
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
   * Mock the obligation subtype response to return a 404, as the product type code in the payload is not supported.
   * This allows us to assert that the correct error message is returned when the product type code is not supported.
   */
  const mockObligationSubtypeResponse = [
    {
      ...mockResponses.obligationSubtypes[0],
      code: MDM_EXAMPLES.OBLIGATION_SUBTYPES.OST009.code,
      productTypeCode: UNSUPPORTED_PRODUCT_TYPE_CODE,
    },
  ];

  describe('when the provided product type code is not supported', () => {
    beforeAll(() => {
      // Arrange
      nock(GIFT_API_URL).persist().get(`${PATH.PRODUCT_TYPE}/${UNSUPPORTED_PRODUCT_TYPE_CODE}`).reply(HttpStatus.NOT_FOUND, mockResponses.productType);

      nock(APIM_MDM_URL)
        .persist()
        .get(apimMdmObligationSubtypesUrl)
        .matchHeader(APIM_MDM_KEY, APIM_MDM_VALUE)
        .reply(HttpStatus.OK, mockObligationSubtypeResponse);
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
