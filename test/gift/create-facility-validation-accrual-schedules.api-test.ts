import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import { arrayOfObjectsDateStringValidation, arrayOfObjectsNumberValidation, arrayOfObjectsStringValidation } from './assertions';
import { apimMdmObligationSubtypesUrl, counterpartyRolesUrl, currencyUrl, feeTypeUrl, mockResponses, productTypeUrl } from './test-helpers';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const { APIM_MDM_KEY, APIM_MDM_URL, APIM_MDM_VALUE, GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const {
  PATH: { FACILITY },
  VALIDATION: { ACCRUAL_SCHEDULE: ACCRUAL_SCHEDULE_VALIDATION },
} = GIFT;

describe('POST /gift/facility - validation - accrual schedules', () => {
  const url = `/api/${prefixAndVersion}/gift${FACILITY}`;

  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  beforeEach(() => {
    nock(GIFT_API_URL).persist().get(productTypeUrl()).reply(HttpStatus.OK, mockResponses.productType);

    nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

    nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

    nock(GIFT_API_URL).persist().get(counterpartyRolesUrl).reply(HttpStatus.OK, mockResponses.counterpartyRoles);

    nock(APIM_MDM_URL)
      .persist()
      .get(apimMdmObligationSubtypesUrl)
      .matchHeader(APIM_MDM_KEY, APIM_MDM_VALUE)
      .reply(HttpStatus.OK, mockResponses.obligationSubtypes);
  });

  afterAll(async () => {
    await api.destroy();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const baseParams = {
    initialPayload: EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
    parentFieldName: 'accrualSchedules',
    url,
  };

  describe('when an empty accrual schedules object is provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      // Arrange
      const mockPayload = {
        ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
        accrualSchedules: [{}],
      };

      // Act
      const { status, body } = await api.post(url, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'accrualSchedules.0.accrualDayBasisCode should not be null or undefined',
          `accrualSchedules.0.accrualDayBasisCode must be longer than or equal to ${ACCRUAL_SCHEDULE_VALIDATION.ACCRUAL_DAY_BASIS_CODE.MIN_LENGTH} characters`,
          'accrualSchedules.0.accrualDayBasisCode must be a string',
          'accrualSchedules.0.accrualEffectiveDate should not be null or undefined',
          'accrualSchedules.0.accrualEffectiveDate must be a valid ISO 8601 date string',
          'accrualSchedules.0.accrualFrequencyCode should not be null or undefined',
          `accrualSchedules.0.accrualFrequencyCode must be longer than or equal to ${ACCRUAL_SCHEDULE_VALIDATION.ACCRUAL_FREQUENCY_CODE.MIN_LENGTH} characters`,
          'accrualSchedules.0.accrualFrequencyCode must be a string',
          'accrualSchedules.0.accrualMaturityDate should not be null or undefined',
          'accrualSchedules.0.accrualMaturityDate must be a valid ISO 8601 date string',
          'accrualSchedules.0.accrualScheduleTypeCode should not be null or undefined',
          `accrualSchedules.0.accrualScheduleTypeCode must be longer than or equal to ${ACCRUAL_SCHEDULE_VALIDATION.ACCRUAL_SCHEDULE_TYPE_CODE.MIN_LENGTH} characters`,
          'accrualSchedules.0.accrualScheduleTypeCode must be a string',
          'accrualSchedules.0.additionalRate should not be null or undefined',
          `accrualSchedules.0.additionalRate must not be less than ${ACCRUAL_SCHEDULE_VALIDATION.ADDITIONAL_RATE.MIN}`,
          'accrualSchedules.0.additionalRate must be a number conforming to the specified constraints',
          'accrualSchedules.0.baseRate should not be null or undefined',
          'accrualSchedules.0.baseRate must be a number conforming to the specified constraints',
          'accrualSchedules.0.firstCycleAccrualEndDate should not be null or undefined',
          'accrualSchedules.0.firstCycleAccrualEndDate must be a valid ISO 8601 date string',
          'accrualSchedules.0.spreadRate should not be null or undefined',
          `accrualSchedules.0.spreadRate must not be less than ${ACCRUAL_SCHEDULE_VALIDATION.SPREAD_RATE.MIN}`,
          'accrualSchedules.0.spreadRate must be a number conforming to the specified constraints',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('accrualDayBasisCode', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'accrualDayBasisCode',
      min: ACCRUAL_SCHEDULE_VALIDATION.ACCRUAL_DAY_BASIS_CODE.MIN_LENGTH,
      max: ACCRUAL_SCHEDULE_VALIDATION.ACCRUAL_DAY_BASIS_CODE.MAX_LENGTH,
    });
  });

  describe('accrualEffectiveDate', () => {
    arrayOfObjectsDateStringValidation({
      ...baseParams,
      fieldName: 'accrualEffectiveDate',
    });
  });

  describe('accrualFrequencyCode', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'accrualFrequencyCode',
      min: ACCRUAL_SCHEDULE_VALIDATION.ACCRUAL_FREQUENCY_CODE.MIN_LENGTH,
      max: ACCRUAL_SCHEDULE_VALIDATION.ACCRUAL_FREQUENCY_CODE.MAX_LENGTH,
    });
  });

  describe('accrualMaturityDate', () => {
    arrayOfObjectsDateStringValidation({
      ...baseParams,
      fieldName: 'accrualMaturityDate',
    });
  });

  describe('accrualScheduleTypeCode', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'accrualScheduleTypeCode',
      min: ACCRUAL_SCHEDULE_VALIDATION.ACCRUAL_SCHEDULE_TYPE_CODE.MIN_LENGTH,
      max: ACCRUAL_SCHEDULE_VALIDATION.ACCRUAL_SCHEDULE_TYPE_CODE.MAX_LENGTH,
    });
  });

  describe('additionalRate', () => {
    arrayOfObjectsNumberValidation({
      ...baseParams,
      fieldName: 'additionalRate',
      min: ACCRUAL_SCHEDULE_VALIDATION.ADDITIONAL_RATE.MIN,
    });
  });

  describe('baseRate', () => {
    arrayOfObjectsNumberValidation({
      ...baseParams,
      fieldName: 'baseRate',
    });
  });

  describe('firstCycleAccrualEndDate', () => {
    arrayOfObjectsDateStringValidation({
      ...baseParams,
      fieldName: 'firstCycleAccrualEndDate',
    });
  });

  describe('spreadRate', () => {
    arrayOfObjectsNumberValidation({
      ...baseParams,
      fieldName: 'spreadRate',
      min: ACCRUAL_SCHEDULE_VALIDATION.SPREAD_RATE.MIN,
    });
  });
});
