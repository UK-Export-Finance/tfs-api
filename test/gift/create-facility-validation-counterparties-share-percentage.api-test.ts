import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import { arrayOfObjectsSharePercentageValidation } from './assertions';
import { apimMdmObligationSubtypesUrl, counterpartyRolesUrl, currencyUrl, feeTypeUrl, mockResponses, productTypeUrl } from './test-helpers';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const { APIM_MDM_KEY, APIM_MDM_URL, APIM_MDM_VALUE, GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const {
  PATH: { FACILITY },
} = GIFT;

const mockFirstCounterparty = EXAMPLES.GIFT.COUNTERPARTY({ withSharePercentage: true });
const mockSecondCounterparty = EXAMPLES.GIFT.COUNTERPARTY({ withSharePercentage: true });

describe('POST /gift/facility - validation - counterparties - share percentage', () => {
  const url = `/api/${prefixAndVersion}/gift${FACILITY}`;

  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  beforeEach(() => {
    nock(GIFT_API_URL).persist().get(productTypeUrl()).reply(HttpStatus.OK, mockResponses.productType);

    nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

    nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

    nock(GIFT_API_URL).persist().get(counterpartyRolesUrl).reply(HttpStatus.OK, mockResponses.counterpartyRolesWithHasSharePercentage);

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
    initialPayload: {
      ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
      counterparties: [mockFirstCounterparty, mockSecondCounterparty],
    },
    parentFieldName: 'counterparties',
    url,
  };

  describe('when a counterparty role requires a sharePercentage', () => {
    arrayOfObjectsSharePercentageValidation(baseParams);
  });
});
