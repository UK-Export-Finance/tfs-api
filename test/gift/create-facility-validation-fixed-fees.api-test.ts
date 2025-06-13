import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import {
  arrayOfObjectsCurrencyStringValidation,
  arrayOfObjectsFeeTypeCodeStringValidation,
  arrayOfObjectsNumberValidation,
  arrayOfObjectsStringValidation,
} from './assertions';
import { counterpartyRolesUrl, currencyUrl, feeTypeUrl, mockResponses } from './test-helpers';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const {
  PATH: { FACILITY },
  VALIDATION: { FIXED_FEE: FIXED_FEE_VALIDATION },
} = GIFT;

describe('POST /gift/facility - validation - fixed fees', () => {
  const url = `/api/${prefixAndVersion}/gift${FACILITY}`;

  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  beforeEach(() => {
    nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

    nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

    nock(GIFT_API_URL).persist().get(counterpartyRolesUrl).reply(HttpStatus.OK, mockResponses.counterpartyRoles);
  });

  afterAll(async () => {
    await api.destroy();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const baseParams = {
    initialPayload: EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
    parentFieldName: 'fixedFees',
    url,
  };

  describe('when an empty fixed fee object is provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      // Arrange
      const mockPayload = {
        ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
        fixedFees: [{}],
      };

      // Act
      const { status, body } = await api.post(url, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'fixedFees.0.amountDue should not be null or undefined',
          `fixedFees.0.amountDue must not be greater than ${FIXED_FEE_VALIDATION.AMOUNT_DUE.MAX}`,
          `fixedFees.0.amountDue must not be less than ${FIXED_FEE_VALIDATION.AMOUNT_DUE.MIN}`,
          'fixedFees.0.amountDue must be a number conforming to the specified constraints',
          'fixedFees.0.currency should not be null or undefined',
          `fixedFees.0.currency must be longer than or equal to ${FIXED_FEE_VALIDATION.CURRENCY.MIN_LENGTH} characters`,
          'fixedFees.0.currency must be a string',
          'fixedFees.0.description should not be null or undefined',
          `fixedFees.0.description must be longer than or equal to ${FIXED_FEE_VALIDATION.DESCRIPTION.MIN_LENGTH} characters`,
          'fixedFees.0.description must be a string',
          'fixedFees.0.effectiveDate should not be null or undefined',
          `fixedFees.0.effectiveDate must be longer than or equal to ${FIXED_FEE_VALIDATION.EFFECTIVE_DATE.MIN_LENGTH} characters`,
          'fixedFees.0.effectiveDate must be a string',
          'fixedFees.0.feeTypeCode should not be null or undefined',
          `fixedFees.0.feeTypeCode must be longer than or equal to ${FIXED_FEE_VALIDATION.FEE_TYPE_CODE.MIN_LENGTH} characters`,
          'fixedFees.0.feeTypeCode must be a string',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('amountDue', () => {
    arrayOfObjectsNumberValidation({
      ...baseParams,
      fieldName: 'amountDue',
      min: FIXED_FEE_VALIDATION.AMOUNT_DUE.MIN,
      max: FIXED_FEE_VALIDATION.AMOUNT_DUE.MAX,
    });
  });

  describe('currency', () => {
    arrayOfObjectsCurrencyStringValidation(baseParams);
  });

  describe('description', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'description',
      min: FIXED_FEE_VALIDATION.DESCRIPTION.MIN_LENGTH,
      max: FIXED_FEE_VALIDATION.DESCRIPTION.MAX_LENGTH,
    });
  });

  describe('effectiveDate', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'effectiveDate',
      min: FIXED_FEE_VALIDATION.EFFECTIVE_DATE.MIN_LENGTH,
      max: FIXED_FEE_VALIDATION.EFFECTIVE_DATE.MAX_LENGTH,
    });
  });

  describe('feeTypeCode', () => {
    arrayOfObjectsFeeTypeCodeStringValidation(baseParams);
  });
});
