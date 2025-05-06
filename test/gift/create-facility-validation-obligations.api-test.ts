import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import { arrayOfObjectsCurrencyStringValidation, arrayOfObjectsNumberValidation, arrayOfObjectsStringValidation } from './assertions';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const {
  PATH: { CURRENCY, FACILITY },
  VALIDATION: { OBLIGATION: OBLIGATION_VALIDATION },
} = GIFT;

describe('POST /gift/facility - validation - obligations', () => {
  const url = `/api/${prefixAndVersion}/gift${FACILITY}`;

  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  beforeEach(() => {
    nock(GIFT_API_URL).persist().get(CURRENCY).reply(HttpStatus.OK, EXAMPLES.GIFT.CURRENCIES);
  });

  afterAll(async () => {
    await api.destroy();
  });

  afterEach(() => {
    jest.resetAllMocks();

    nock.abortPendingRequests();
    nock.cleanAll();
  });

  const baseParams = {
    initialPayload: EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
    parentFieldName: 'obligations',
    url,
  };

  describe('when an empty obligations object is provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      // Arrange
      const mockPayload = {
        ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
        obligations: [{}],
      };

      // Act
      const { status, body } = await api.post(url, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'obligations.0.currency should not be null or undefined',
          `obligations.0.currency must be longer than or equal to ${OBLIGATION_VALIDATION.CURRENCY.MIN_LENGTH} characters`,
          'obligations.0.currency must be a string',
          'obligations.0.effectiveDate should not be null or undefined',
          `obligations.0.effectiveDate must be longer than or equal to ${OBLIGATION_VALIDATION.EFFECTIVE_DATE.MIN_LENGTH} characters`,
          'obligations.0.effectiveDate must be a string',
          'obligations.0.maturityDate should not be null or undefined',
          `obligations.0.maturityDate must be longer than or equal to ${OBLIGATION_VALIDATION.MATURITY_DATE.MIN_LENGTH} characters`,
          'obligations.0.maturityDate must be a string',
          'obligations.0.obligationAmount should not be null or undefined',
          `obligations.0.obligationAmount must not be greater than ${OBLIGATION_VALIDATION.OBLIGATION_AMOUNT.MAX}`,
          'obligations.0.obligationAmount must not be less than 1',
          'obligations.0.obligationAmount must be a number conforming to the specified constraints',
          'obligations.0.productSubtype should not be null or undefined',
          `obligations.0.productSubtype must be longer than or equal to ${OBLIGATION_VALIDATION.PRODUCT_SUBTYPE.MIN_LENGTH} characters`,
          'obligations.0.productSubtype must be a string',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('currency', () => {
    arrayOfObjectsCurrencyStringValidation(baseParams);
  });

  describe('effectiveDate', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'effectiveDate',
      min: OBLIGATION_VALIDATION.EFFECTIVE_DATE.MIN_LENGTH,
      max: OBLIGATION_VALIDATION.EFFECTIVE_DATE.MAX_LENGTH,
    });
  });

  describe('maturityDate', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'maturityDate',
      min: OBLIGATION_VALIDATION.MATURITY_DATE.MIN_LENGTH,
      max: OBLIGATION_VALIDATION.MATURITY_DATE.MAX_LENGTH,
    });
  });

  describe('obligationAmount', () => {
    arrayOfObjectsNumberValidation({
      ...baseParams,
      fieldName: 'obligationAmount',
      min: OBLIGATION_VALIDATION.OBLIGATION_AMOUNT.MIN,
      max: OBLIGATION_VALIDATION.OBLIGATION_AMOUNT.MAX,
    });
  });

  describe('productSubtype', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'productSubtype',
      min: OBLIGATION_VALIDATION.PRODUCT_SUBTYPE.MIN_LENGTH,
      max: OBLIGATION_VALIDATION.PRODUCT_SUBTYPE.MAX_LENGTH,
    });
  });
});
