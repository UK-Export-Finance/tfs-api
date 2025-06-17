import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import { arrayOfObjectsRoleIdStringValidation, arrayOfObjectsStringValidation } from './assertions';
import { counterpartyRolesUrl, currencyUrl, feeTypeUrl, mockResponses, obligationSubtypeUrl } from './test-helpers';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const {
  PATH: { FACILITY },
  VALIDATION: { COUNTERPARTY: COUNTERPARTY_VALIDATION },
} = GIFT;

const [firstCounterparty, secondCounterparty] = EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD.counterparties;

describe('POST /gift/facility - validation - counterparties', () => {
  const url = `/api/${prefixAndVersion}/gift${FACILITY}`;

  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  beforeEach(() => {
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
    parentFieldName: 'counterparties',
    url,
  };

  describe('when an empty counterparty object is provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      // Arrange
      const mockPayload = {
        ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
        counterparties: [{}],
      };

      // Act
      const { status, body } = await api.post(url, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          `counterparties.0.counterpartyUrn should not be null or undefined`,
          `counterparties.0.counterpartyUrn must be longer than or equal to ${COUNTERPARTY_VALIDATION.COUNTERPARTY_URN.MIN_LENGTH} characters`,
          `counterparties.0.counterpartyUrn must be a string`,
          `counterparties.0.exitDate should not be null or undefined`,
          `counterparties.0.exitDate must be longer than or equal to ${COUNTERPARTY_VALIDATION.EXIT_DATE.MIN_LENGTH} characters`,
          `counterparties.0.exitDate must be a string`,
          `counterparties.0.roleId should not be null or undefined`,
          `counterparties.0.roleId must be longer than or equal to ${COUNTERPARTY_VALIDATION.ROLE_ID.MIN_LENGTH} characters`,
          `counterparties.0.roleId must be a string`,
          `counterparties.0.startDate should not be null or undefined`,
          `counterparties.0.startDate must be longer than or equal to ${COUNTERPARTY_VALIDATION.START_DATE.MIN_LENGTH} characters`,
          `counterparties.0.startDate must be a string`,
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe(`when a counterparty URN is NOT unique`, () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with a validation error`, async () => {
      // Arrange
      const mockPayload = {
        ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
        counterparties: [
          firstCounterparty,
          {
            ...secondCounterparty,
            counterpartyUrn: firstCounterparty.counterpartyUrn,
          },
        ],
      };

      // Act
      const { status, body } = await api.post(url, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [`counterparty[] URN's must be unique`],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('counterpartyUrn', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'counterpartyUrn',
      min: COUNTERPARTY_VALIDATION.COUNTERPARTY_URN.MIN_LENGTH,
      max: COUNTERPARTY_VALIDATION.COUNTERPARTY_URN.MAX_LENGTH,
    });
  });

  describe('exitDate', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'exitDate',
      min: COUNTERPARTY_VALIDATION.EXIT_DATE.MIN_LENGTH,
      max: COUNTERPARTY_VALIDATION.EXIT_DATE.MAX_LENGTH,
    });
  });

  describe('roleId', () => {
    arrayOfObjectsRoleIdStringValidation(baseParams);
  });

  describe('startDate', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      fieldName: 'startDate',
      min: COUNTERPARTY_VALIDATION.START_DATE.MIN_LENGTH,
      max: COUNTERPARTY_VALIDATION.START_DATE.MAX_LENGTH,
    });
  });
});
