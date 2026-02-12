import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import { numberStringValidation, numberValidation, stringValidation, ukefIdValidation } from './assertions';
import { counterpartyRolesUrl, currencyUrl, feeTypeUrl, mockResponses, obligationSubtypeUrl, productTypeUrl } from './test-helpers';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const {
  PATH: { FACILITY },
  VALIDATION,
} = GIFT;

describe('POST /gift/facility - validation - risk details', () => {
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

  const baseParams = {
    initialPayload: EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
    parentFieldName: 'riskDetails',
    url,
  };

  describe('when an empty risk details object is provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      // Arrange
      const mockPayload = {
        ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
        riskDetails: {},
      };

      // Act
      const { status, body } = await api.post(url, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'riskDetails.account should not be null or undefined',
          `riskDetails.account must be longer than or equal to ${VALIDATION.RISK_DETAILS.ACCOUNT.MIN_LENGTH} characters`,
          'riskDetails.account must be a number string',
          'riskDetails.dealId must be a string',
          `riskDetails.dealId must be longer than or equal to ${VALIDATION.RISK_DETAILS.DEAL_ID.MIN_LENGTH} characters`,
          'riskDetails.dealId must match /^00\\d{8}$/ regular expression',
          'riskDetails.facilityCategoryCode should not be null or undefined',
          `riskDetails.facilityCategoryCode must be longer than or equal to ${VALIDATION.RISK_DETAILS.FACILITY_CATEGORY_CODE.MIN_LENGTH} characters`,
          'riskDetails.facilityCategoryCode must be a string',
          'riskDetails.facilityCreditRating should not be null or undefined',
          `riskDetails.facilityCreditRating must not be greater than ${VALIDATION.RISK_DETAILS.FACILITY_CREDIT_RATING.MAX_LENGTH}`,
          `riskDetails.facilityCreditRating must not be less than ${VALIDATION.RISK_DETAILS.FACILITY_CREDIT_RATING.MIN_LENGTH}`,
          'riskDetails.facilityCreditRating must be a number conforming to the specified constraints',
          'riskDetails.riskStatus should not be null or undefined',
          `riskDetails.riskStatus must be longer than or equal to ${VALIDATION.RISK_DETAILS.RISK_STATUS.MIN_LENGTH} characters`,
          'riskDetails.riskStatus must be a string',
          'riskDetails.ukefIndustryCode should not be null or undefined',
          `riskDetails.ukefIndustryCode must be longer than or equal to ${VALIDATION.RISK_DETAILS.UKEF_INDUSTRY_CODE.MIN_LENGTH} characters`,
          'riskDetails.ukefIndustryCode must be a number string',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('account', () => {
    numberStringValidation({
      ...baseParams,
      fieldName: 'account',
      parentFieldName: 'riskDetails',
      min: VALIDATION.RISK_DETAILS.ACCOUNT.MIN_LENGTH,
      max: VALIDATION.RISK_DETAILS.ACCOUNT.MAX_LENGTH,
    });
  });

  describe('dealId', () => {
    ukefIdValidation({
      ...baseParams,
      fieldName: 'dealId',
      parentFieldName: 'riskDetails',
      min: VALIDATION.RISK_DETAILS.DEAL_ID.MIN_LENGTH,
      max: VALIDATION.RISK_DETAILS.DEAL_ID.MAX_LENGTH,
    });
  });

  describe('facilityCategoryCode', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'facilityCategoryCode',
      parentFieldName: 'riskDetails',
      min: VALIDATION.RISK_DETAILS.FACILITY_CATEGORY_CODE.MIN_LENGTH,
      max: VALIDATION.RISK_DETAILS.FACILITY_CATEGORY_CODE.MAX_LENGTH,
    });
  });

  describe('facilityCreditRating', () => {
    numberValidation({
      ...baseParams,
      fieldName: 'facilityCreditRating',
      parentFieldName: 'riskDetails',
      min: VALIDATION.RISK_DETAILS.FACILITY_CREDIT_RATING.MIN_LENGTH,
      max: VALIDATION.RISK_DETAILS.FACILITY_CREDIT_RATING.MAX_LENGTH,
    });
  });

  describe('riskStatus', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'riskStatus',
      parentFieldName: 'riskDetails',
      min: VALIDATION.RISK_DETAILS.RISK_STATUS.MIN_LENGTH,
      max: VALIDATION.RISK_DETAILS.RISK_STATUS.MAX_LENGTH,
    });
  });

  describe('ukefIndustryCode', () => {
    numberStringValidation({
      ...baseParams,
      fieldName: 'ukefIndustryCode',
      parentFieldName: 'riskDetails',
      min: VALIDATION.RISK_DETAILS.UKEF_INDUSTRY_CODE.MIN_LENGTH,
      max: VALIDATION.RISK_DETAILS.UKEF_INDUSTRY_CODE.MAX_LENGTH,
    });
  });
});
