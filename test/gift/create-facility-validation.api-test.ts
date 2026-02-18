import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import {
  assert400Response,
  currencyStringValidation,
  dateStringValidation,
  numberStringValidation,
  numberValidation,
  productTypeCodeStringValidation,
  stringValidation,
  ukefIdValidation,
} from './assertions';
import { counterpartyRolesUrl, currencyUrl, feeTypeUrl, mockResponses, obligationSubtypeUrl, productTypeUrl } from './test-helpers';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const {
  PATH: { FACILITY },
  VALIDATION,
} = GIFT;

const UNSUPPORTED_CONSUMER = 'Unsupported consumer';

describe('POST /gift/facility - validation', () => {
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

  describe('when an empty object is provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
      // Arrange
      const mockPayload = {};

      // Act
      const { status, body } = await api.post(url, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'riskDetails should not be null or undefined',
          'riskDetails must be a non-empty object',
          'consumer should not be null or undefined',
          'consumer must be a string',
          'overview should not be null or undefined',
          'overview must be a non-empty object',
          'counterparties should not be null or undefined',
          "counterparty[] URN's must be unique",
          'counterparties should not be empty',
          'counterparties must be an array',
          'fixedFees should not be null or undefined',
          'fixedFees should not be empty',
          'fixedFees must be an array',
          'obligations should not be null or undefined',
          'obligations should not be empty',
          'obligations must be an array',
          'repaymentProfiles should not be null or undefined',
          `repaymentProfile[].allocation[] dueDate's must be unique`,
          `repaymentProfile[] name's must be unique`,
          'repaymentProfiles should not be empty',
          'repaymentProfiles must be an array',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when an empty array is provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
      // Arrange
      const mockPayload = [];

      // Act
      const { status, body } = await api.post(url, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'riskDetails should not be null or undefined',
          'riskDetails must be a non-empty object',
          'consumer should not be null or undefined',
          'consumer must be a string',
          'overview should not be null or undefined',
          'overview must be a non-empty object',
          'counterparties should not be null or undefined',
          "counterparty[] URN's must be unique",
          'counterparties should not be empty',
          'counterparties must be an array',
          'fixedFees should not be null or undefined',
          'fixedFees should not be empty',
          'fixedFees must be an array',
          'obligations should not be null or undefined',
          'obligations should not be empty',
          'obligations must be an array',
          'repaymentProfiles should not be null or undefined',
          `repaymentProfile[].allocation[] dueDate's must be unique`,
          `repaymentProfile[] name's must be unique`,
          'repaymentProfiles should not be empty',
          'repaymentProfiles must be an array',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when empty entity arrays are provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      // Arrange
      const mockPayload = {
        overview: [],
        counterparties: [],
        fixedFees: [],
        obligations: [],
        repaymentProfiles: [],
        riskDetails: [],
      };

      // Act
      const { status, body } = await api.post(url, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'riskDetails must be a non-empty object',
          'consumer should not be null or undefined',
          'consumer must be a string',
          'overview must be a non-empty object',
          "counterparty[] URN's must be unique",
          'counterparties should not be empty',
          'fixedFees should not be empty',
          'obligations should not be empty',
          `repaymentProfile[].allocation[] dueDate's must be unique`,
          `repaymentProfile[] name's must be unique`,
          'repaymentProfiles should not be empty',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when null entities are provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      // Arrange
      const mockPayload = {
        overview: null,
        counterparties: null,
        fixedFees: null,
        obligations: null,
        repaymentProfiles: null,
        riskDetails: null,
      };

      // Act
      const { status, body } = await api.post(url, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'riskDetails should not be null or undefined',
          'riskDetails must be a non-empty object',
          'nested property riskDetails must be either object or array',
          'consumer should not be null or undefined',
          'consumer must be a string',
          'overview should not be null or undefined',
          'overview must be a non-empty object',
          'nested property overview must be either object or array',
          'counterparties should not be null or undefined',
          "counterparty[] URN's must be unique",
          'counterparties should not be empty',
          'counterparties must be an array',
          'nested property counterparties must be either object or array',
          'fixedFees should not be null or undefined',
          'fixedFees should not be empty',
          'fixedFees must be an array',
          'nested property fixedFees must be either object or array',
          'obligations should not be null or undefined',
          'obligations should not be empty',
          'obligations must be an array',
          'nested property obligations must be either object or array',
          'repaymentProfiles should not be null or undefined',
          `repaymentProfile[].allocation[] dueDate's must be unique`,
          `repaymentProfile[] name's must be unique`,
          'repaymentProfiles should not be empty',
          'repaymentProfiles must be an array',
          'nested property repaymentProfiles must be either object or array',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when undefined entities are provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      // Arrange
      const mockPayload = {
        overview: undefined,
        counterparties: undefined,
        fixedFees: undefined,
        obligations: undefined,
        repaymentProfiles: undefined,
        riskDetails: undefined,
      };

      // Act
      const { status, body } = await api.post(url, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'riskDetails should not be null or undefined',
          'riskDetails must be a non-empty object',
          'consumer should not be null or undefined',
          'consumer must be a string',
          'overview should not be null or undefined',
          'overview must be a non-empty object',
          'counterparties should not be null or undefined',
          "counterparty[] URN's must be unique",
          'counterparties should not be empty',
          'counterparties must be an array',
          'fixedFees should not be null or undefined',
          'fixedFees should not be empty',
          'fixedFees must be an array',
          'obligations should not be null or undefined',
          'obligations should not be empty',
          'obligations must be an array',
          'repaymentProfiles should not be null or undefined',
          `repaymentProfile[].allocation[] dueDate's must be unique`,
          `repaymentProfile[] name's must be unique`,
          'repaymentProfiles should not be empty',
          'repaymentProfiles must be an array',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when empty entity objects are provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      // Arrange
      const mockPayload = {
        overview: {},
        counterparties: {},
        fixedFees: {},
        obligations: {},
        repaymentProfiles: {},
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
          `riskDetails.facilityCreditRating must be longer than or equal to ${VALIDATION.RISK_DETAILS.FACILITY_CREDIT_RATING.MIN_LENGTH} characters`,
          'riskDetails.facilityCreditRating must be a string',
          'riskDetails.riskStatus should not be null or undefined',
          `riskDetails.riskStatus must be longer than or equal to ${VALIDATION.RISK_DETAILS.RISK_STATUS.MIN_LENGTH} characters`,
          'riskDetails.riskStatus must be a string',
          'riskDetails.ukefIndustryCode should not be null or undefined',
          `riskDetails.ukefIndustryCode must be longer than or equal to ${VALIDATION.RISK_DETAILS.UKEF_INDUSTRY_CODE.MIN_LENGTH} characters`,
          'riskDetails.ukefIndustryCode must be a number string',
          'consumer should not be null or undefined',
          'consumer must be a string',
          'overview.creditType should not be null or undefined',
          'overview.creditType must be longer than or equal to 1 characters',
          'overview.creditType must be a string',
          'overview.currency should not be null or undefined',
          `overview.currency must be longer than or equal to ${VALIDATION.FACILITY.OVERVIEW.CURRENCY.MIN_LENGTH} characters`,
          'overview.currency must be a string',
          'overview.effectiveDate should not be null or undefined',
          'overview.effectiveDate must be a valid ISO 8601 date string',
          'overview.expiryDate should not be null or undefined',
          'overview.expiryDate must be a valid ISO 8601 date string',
          'overview.amount should not be null or undefined',
          `overview.amount must not be greater than ${VALIDATION.FACILITY.OVERVIEW.FACILITY_AMOUNT.MAX}`,
          `overview.amount must not be less than ${VALIDATION.FACILITY.OVERVIEW.FACILITY_AMOUNT.MIN}`,
          'overview.amount must be a number conforming to the specified constraints',
          'overview.facilityId must be a string',
          `overview.facilityId must be longer than or equal to ${VALIDATION.FACILITY.OVERVIEW.FACILITY_ID.MIN_LENGTH} characters`,
          'overview.facilityId must match /^00\\d{8}$/ regular expression',
          'overview.name should not be null or undefined',
          `overview.name must be longer than or equal to ${VALIDATION.FACILITY.OVERVIEW.FACILITY_NAME.MIN_LENGTH} characters`,
          'overview.name must be a string',
          'overview.obligorUrn should not be null or undefined',
          `overview.obligorUrn must be longer than or equal to ${VALIDATION.FACILITY.OVERVIEW.OBLIGOR_URN.MIN_LENGTH} characters`,
          'overview.obligorUrn must be a number string',
          'overview.productTypeCode should not be null or undefined',
          `overview.productTypeCode must be longer than or equal to ${VALIDATION.FACILITY.OVERVIEW.PRODUCT_TYPE_CODE.MIN_LENGTH} characters`,
          'overview.productTypeCode must be a string',
          `counterparties.counterpartyUrn should not be null or undefined`,
          `counterparties.counterpartyUrn must be longer than or equal to ${VALIDATION.COUNTERPARTY.COUNTERPARTY_URN.MIN_LENGTH} characters`,
          `counterparties.counterpartyUrn must be a string`,
          `counterparties.exitDate should not be null or undefined`,
          'counterparties.exitDate must be a valid ISO 8601 date string',
          `counterparties.roleCode should not be null or undefined`,
          `counterparties.roleCode must be longer than or equal to ${VALIDATION.COUNTERPARTY.ROLE_CODE.MIN_LENGTH} characters`,
          `counterparties.roleCode must be a string`,
          `counterparties.startDate should not be null or undefined`,
          'counterparties.startDate must be a valid ISO 8601 date string',
          'fixedFees.amount should not be null or undefined',
          `fixedFees.amount must not be greater than ${VALIDATION.FIXED_FEE.AMOUNT_DUE.MAX}`,
          `fixedFees.amount must not be less than ${VALIDATION.FIXED_FEE.AMOUNT_DUE.MIN}`,
          'fixedFees.amount must be a number conforming to the specified constraints',
          'fixedFees.currency should not be null or undefined',
          `fixedFees.currency must be longer than or equal to ${VALIDATION.FIXED_FEE.CURRENCY.MIN_LENGTH} characters`,
          'fixedFees.currency must be a string',
          'fixedFees.effectiveDate should not be null or undefined',
          'fixedFees.effectiveDate must be a valid ISO 8601 date string',
          'fixedFees.feeTypeCode should not be null or undefined',
          `fixedFees.feeTypeCode must be longer than or equal to ${VALIDATION.FIXED_FEE.FEE_TYPE_CODE.MIN_LENGTH} characters`,
          'fixedFees.feeTypeCode must be a string',
          'obligations.currency should not be null or undefined',
          `obligations.currency must be longer than or equal to ${VALIDATION.OBLIGATION.CURRENCY.MIN_LENGTH} characters`,
          'obligations.currency must be a string',
          'obligations.effectiveDate should not be null or undefined',
          'obligations.effectiveDate must be a valid ISO 8601 date string',
          'obligations.maturityDate should not be null or undefined',
          'obligations.maturityDate must be a valid ISO 8601 date string',
          'obligations.amount should not be null or undefined',
          `obligations.amount must not be greater than ${VALIDATION.OBLIGATION.OBLIGATION_AMOUNT.MAX}`,
          `obligations.amount must not be less than ${VALIDATION.OBLIGATION.OBLIGATION_AMOUNT.MIN}`,
          'obligations.amount must be a number conforming to the specified constraints',
          'obligations.subtypeCode should not be null or undefined',
          `obligations.subtypeCode must be longer than or equal to ${VALIDATION.OBLIGATION.OBLIGATION_SUBTYPE_CODE.MIN_LENGTH} characters`,
          'obligations.subtypeCode must be a string',
          'repaymentProfiles.name should not be null or undefined',
          `repaymentProfiles.name must be longer than or equal to ${VALIDATION.REPAYMENT_PROFILE.NAME.MIN_LENGTH} characters`,
          'repaymentProfiles.name must be a string',
          'repaymentProfiles.allocations should not be null or undefined',
          'repaymentProfiles.allocations should not be empty',
          'repaymentProfiles.allocations must be an array',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  const baseParams = {
    parentFieldName: 'overview',
    initialPayload: EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
    url,
  };

  describe('consumer', () => {
    let mockPayload;

    describe('when the provided consumer is not supported', () => {
      beforeAll(() => {
        // Arrange
        mockPayload = {
          ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
          consumer: UNSUPPORTED_CONSUMER,
        };
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
        const expected = [`consumer is not supported (${UNSUPPORTED_CONSUMER})`];

        expect(body.message).toStrictEqual(expected);
      });
    });
  });

  describe('overview.creditType', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'creditType',
      min: VALIDATION.FACILITY.OVERVIEW.CREDIT_TYPE.MIN_LENGTH,
      max: VALIDATION.FACILITY.OVERVIEW.CREDIT_TYPE.MAX_LENGTH,
    });
  });

  describe('overview.currency', () => {
    currencyStringValidation(baseParams);
  });

  describe('overview.effectiveDate', () => {
    dateStringValidation({
      ...baseParams,
      fieldName: 'effectiveDate',
    });
  });

  describe('overview.expiryDate', () => {
    dateStringValidation({
      ...baseParams,
      fieldName: 'expiryDate',
    });
  });

  describe('overview.amount', () => {
    numberValidation({
      ...baseParams,
      fieldName: 'amount',
      min: VALIDATION.FACILITY.OVERVIEW.FACILITY_AMOUNT.MIN,
      max: VALIDATION.FACILITY.OVERVIEW.FACILITY_AMOUNT.MAX,
    });
  });

  describe('overview.facilityId', () => {
    ukefIdValidation({
      ...baseParams,
      fieldName: 'facilityId',
      min: VALIDATION.FACILITY.OVERVIEW.FACILITY_ID.MIN_LENGTH,
      max: VALIDATION.FACILITY.OVERVIEW.FACILITY_ID.MAX_LENGTH,
    });
  });

  describe('overview.name', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'name',
      min: VALIDATION.FACILITY.OVERVIEW.FACILITY_NAME.MIN_LENGTH,
      max: VALIDATION.FACILITY.OVERVIEW.FACILITY_NAME.MAX_LENGTH,
    });
  });

  describe('overview.obligorUrn', () => {
    numberStringValidation({
      ...baseParams,
      fieldName: 'obligorUrn',
      min: VALIDATION.FACILITY.OVERVIEW.OBLIGOR_URN.MIN_LENGTH,
      max: VALIDATION.FACILITY.OVERVIEW.OBLIGOR_URN.MAX_LENGTH,
    });
  });

  describe('overview.productTypeCode', () => {
    productTypeCodeStringValidation(baseParams);
  });
});
