import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import { arrayOfObjectsSharePercentageValidation } from './assertions';
import { counterpartyRolesUrl, currencyUrl, feeTypeUrl, mockResponses } from './test-helpers';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const {
  PATH: { FACILITY },
} = GIFT;

const [firstCounterparty] = EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD.counterparties;

const mockCounterParty = firstCounterparty;

delete mockCounterParty.sharePercentage;

describe('POST /gift/facility - validation - counterparties - share percentage', () => {
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
    initialPayload: {
      ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
      counterparties: [mockCounterParty, mockCounterParty],
    },
    parentFieldName: 'counterparties',
    url,
  };

  describe('when a counterparty role requires a sharePercentage and a sharePercentage is NOT provided', () => {
    arrayOfObjectsSharePercentageValidation(baseParams);
  });
});
