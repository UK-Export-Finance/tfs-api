import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import {
  arrayOfObjectsCurrencyStringValidation,
  arrayOfObjectsNumberValidation,
  arrayOfObjectsStringValidation,
  assert400Response,
  generatePayloadArrayOfObjects,
} from './assertions';
import { counterpartyRolesUrl, currencyUrl, feeTypeUrl, mockResponses, obligationSubtypeUrl, productTypeUrl } from './test-helpers';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const {
  PATH: { FACILITY },
  VALIDATION: { OBLIGATION: OBLIGATION_VALIDATION },
} = GIFT;

describe('POST /gift/facility - validation - obligations', () => {
  const url = `/api/${prefixAndVersion}/gift${FACILITY}`;

  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  beforeEach(() => {
    nock(GIFT_API_URL).persist().get(productTypeUrl).reply(HttpStatus.OK, mockResponses.productType);

    nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

    nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

    nock(GIFT_API_URL).persist().get(counterpartyRolesUrl).reply(HttpStatus.OK, mockResponses.counterpartyRoles);

    nock(GIFT_API_URL).persist().get(obligationSubtypeUrl).reply(HttpStatus.OK, mockResponses.obligationSubtype);
  });

  afterAll(async () => {
    await api.destroy();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const parentFieldName = 'obligations';

  const baseParams = {
    initialPayload: EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
    parentFieldName,
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
          'obligations.0.amount should not be null or undefined',
          `obligations.0.amount must not be greater than ${OBLIGATION_VALIDATION.OBLIGATION_AMOUNT.MAX}`,
          'obligations.0.amount must not be less than 1',
          'obligations.0.amount must be a number conforming to the specified constraints',
          'obligations.0.subtypeCode should not be null or undefined',
          `obligations.0.subtypeCode must be longer than or equal to ${OBLIGATION_VALIDATION.OBLIGATION_SUBTYPE_CODE.MIN_LENGTH} characters`,
          'obligations.0.subtypeCode must be a string',
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

  describe('amount', () => {
    arrayOfObjectsNumberValidation({
      ...baseParams,
      fieldName: 'amount',
      min: OBLIGATION_VALIDATION.OBLIGATION_AMOUNT.MIN,
      max: OBLIGATION_VALIDATION.OBLIGATION_AMOUNT.MAX,
    });
  });

  describe('subtypeCode', () => {
    const fieldName = 'subtypeCode';

    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName,
      min: OBLIGATION_VALIDATION.OBLIGATION_SUBTYPE_CODE.MIN_LENGTH,
      max: OBLIGATION_VALIDATION.OBLIGATION_SUBTYPE_CODE.MAX_LENGTH,
    });

    describe('when the provided subtype code is not supported', () => {
      const UNSUPPORTED_SUBTYPE_CODE = 'UNSUPPORTED';

      let mockPayload;

      const value = UNSUPPORTED_SUBTYPE_CODE;

      beforeAll(() => {
        // Arrange
        mockPayload = generatePayloadArrayOfObjects({
          initialPayload: baseParams.initialPayload,
          fieldName,
          parentFieldName,
          value,
        });
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
        const expected = [
          `obligations contain a subtypeCode that is not supported for the provided productTypeCode (${EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD.overview.productTypeCode})`,
        ];

        expect(body.message).toStrictEqual(expected);
      });
    });
  });
});
