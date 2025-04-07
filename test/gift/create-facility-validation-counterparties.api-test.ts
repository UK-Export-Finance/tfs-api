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
  // VALIDATION: {
  //   FACILITY: { OVERVIEW: OVERVIEW_VALIDATION },
  // },
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
          `counterparties.0.counterpartyUrn must be longer than or equal to 8 characters`,
          `counterparties.0.counterpartyUrn must be a string`,
          `counterparties.0.exitDate should not be null or undefined`,
          `counterparties.0.exitDate must be longer than or equal to 10 characters`,
          `counterparties.0.exitDate must be a string`,
          `counterparties.0.roleId should not be null or undefined`,
          `counterparties.0.roleId must be longer than or equal to 1 characters`,
          `counterparties.0.roleId must be a string`,
          `counterparties.0.sharePercentage should not be null or undefined`,
          `counterparties.0.sharePercentage must not be greater than 100`,
          `counterparties.0.sharePercentage must not be less than 1`,
          `counterparties.0.sharePercentage must be a number conforming to the specified constraints`,
          `counterparties.0.startDate should not be null or undefined`,
          `counterparties.0.startDate must be longer than or equal to 10 characters`,
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
      min: 8,
      max: 8,
    });
  });

  describe('exitDate', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'exitDate',
      min: 10,
      max: 10,
    });
  });

  describe('roleId', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'roleId',
      min: 1,
      max: 50,
    });
  });

  describe('sharePercentage', () => {
    arrayOfObjectsNumberValidation({
      ...baseParams,
      fieldName: 'sharePercentage',

      min: 1,
      max: 100,
    });
  });

  describe('startDate', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'startDate',
      min: 10,
      max: 10,
    });
  });
});
