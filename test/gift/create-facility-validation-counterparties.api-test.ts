import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import nock from 'nock';

import { arrayOfObjectsNumberValidation, arrayOfObjectsStringValidation } from './assertions';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const {
  PATH: { FACILITY },
  VALIDATION: { COUNTERPARTY: COUNTERPARTY_VALIDATION },
} = GIFT;

describe('POST /gift/facility - validation - counterparties', () => {
  const url = `/api/${prefixAndVersion}/gift${FACILITY}`;

  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
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
    parentFieldName: 'counterparties',
    url,
  };

  describe('when an empty counterparty object is provided', () => {
    it('should return a 400 response with validation errors for all required fields', async () => {
      const mockPayload = {
        ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
        counterparties: [{}],
      };

      const { status, body } = await api.post(url, mockPayload);

      expect(status).toBe(400);

      const expected = {
        error: 'Bad Request',
        message: [
          `counterparties.0.counterpartyUrn should not be null or undefined`,
          `counterparties.0.counterpartyUrn must be longer than or equal to ${COUNTERPARTY_VALIDATION.COUNTERPARTY_URN.MIN} characters`,
          `counterparties.0.counterpartyUrn must be a string`,
          `counterparties.0.exitDate should not be null or undefined`,
          `counterparties.0.exitDate must be longer than or equal to ${COUNTERPARTY_VALIDATION.EXIT_DATE.MIN} characters`,
          `counterparties.0.exitDate must be a string`,
          `counterparties.0.roleId should not be null or undefined`,
          `counterparties.0.roleId must be longer than or equal to ${COUNTERPARTY_VALIDATION.ROLE_ID.MIN} characters`,
          `counterparties.0.roleId must be a string`,
          `counterparties.0.sharePercentage should not be null or undefined`,
          `counterparties.0.sharePercentage must not be greater than ${COUNTERPARTY_VALIDATION.SHARE_PERCENTAGE.MAX}`,
          `counterparties.0.sharePercentage must not be less than ${COUNTERPARTY_VALIDATION.SHARE_PERCENTAGE.MIN}`,
          `counterparties.0.sharePercentage must be a number conforming to the specified constraints`,
          `counterparties.0.startDate should not be null or undefined`,
          `counterparties.0.startDate must be longer than or equal to ${COUNTERPARTY_VALIDATION.START_DATE.MIN} characters`,
          `counterparties.0.startDate must be a string`,
        ],
        statusCode: 400,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('counterpartyUrn', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'counterpartyUrn',
      min: COUNTERPARTY_VALIDATION.COUNTERPARTY_URN.MIN,
      max: COUNTERPARTY_VALIDATION.COUNTERPARTY_URN.MAX,
    });
  });

  describe('exitDate', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'exitDate',
      min: COUNTERPARTY_VALIDATION.EXIT_DATE.MIN,
      max: COUNTERPARTY_VALIDATION.EXIT_DATE.MAX,
    });
  });

  describe('roleId', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'roleId',
      min: COUNTERPARTY_VALIDATION.ROLE_ID.MIN,
      max: COUNTERPARTY_VALIDATION.ROLE_ID.MAX,
    });
  });

  describe('sharePercentage', () => {
    arrayOfObjectsNumberValidation({
      ...baseParams,
      fieldName: 'sharePercentage',
      min: COUNTERPARTY_VALIDATION.SHARE_PERCENTAGE.MIN,
      max: COUNTERPARTY_VALIDATION.SHARE_PERCENTAGE.MAX,
    });
  });

  describe('startDate', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'startDate',
      min: COUNTERPARTY_VALIDATION.START_DATE.MIN,
      max: COUNTERPARTY_VALIDATION.START_DATE.MAX,
    });
  });
});
