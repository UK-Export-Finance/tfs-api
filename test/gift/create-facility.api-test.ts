import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import {
  apimFacilityUrl,
  approveStatusUrl,
  businessCalendarsConventionUrl,
  businessCalendarUrl,
  counterpartyRolesUrl,
  counterpartyUrl,
  currencyUrl,
  facilityCreationUrl,
  feeTypeUrl,
  fixedFeeUrl,
  mockResponses,
  obligationSubtypeUrl,
  obligationUrl,
  payloadCounterparties,
  payloadFixedFees,
  payloadObligations,
  payloadRepaymentProfiles,
  productTypeUrl,
  repaymentProfileUrl,
  riskDetailsUrl,
} from './test-helpers';

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const { OBLIGATION_SUBTYPES, PRODUCT_TYPE_CODES, PRODUCT_TYPE_NAMES } = GIFT;

const { FACILITY_CREATION_PAYLOAD: initPayload } = GIFT_EXAMPLES;

const setupMocks = () => {
  nock(GIFT_API_URL).persist().get(productTypeUrl(PRODUCT_TYPE_CODES.BIP)).reply(HttpStatus.OK, mockResponses.productType);
  nock(GIFT_API_URL).persist().get(productTypeUrl(PRODUCT_TYPE_CODES.EXIP)).reply(HttpStatus.OK, mockResponses.productType);
  nock(GIFT_API_URL).persist().get(productTypeUrl(PRODUCT_TYPE_CODES.BSS)).reply(HttpStatus.OK, mockResponses.productType);
  nock(GIFT_API_URL).persist().get(productTypeUrl(PRODUCT_TYPE_CODES.GEF)).reply(HttpStatus.OK, mockResponses.productType);

  nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

  nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

  nock(GIFT_API_URL).persist().get(counterpartyRolesUrl).reply(HttpStatus.OK, mockResponses.counterpartyRoles);

  nock(GIFT_API_URL).persist().get(obligationSubtypeUrl).reply(HttpStatus.OK, mockResponses.obligationSubtype);

  nock(GIFT_API_URL).persist().post(facilityCreationUrl).reply(HttpStatus.CREATED, mockResponses.facility);

  nock(GIFT_API_URL).persist().post(businessCalendarUrl).reply(HttpStatus.CREATED, mockResponses.businessCalendar);

  nock(GIFT_API_URL).persist().post(businessCalendarsConventionUrl).reply(HttpStatus.CREATED, mockResponses.businessCalendarsConvention);

  nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

  nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

  nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

  nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

  nock(GIFT_API_URL).persist().post(riskDetailsUrl).reply(HttpStatus.CREATED, mockResponses.riskDetails);

  nock(GIFT_API_URL).persist().post(approveStatusUrl).reply(HttpStatus.OK, mockResponses.approveStatus);
};

describe('POST /gift/facility', () => {
  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {},
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  describe(`when the payload is valid and a ${HttpStatus.CREATED} response is returned by all GIFT endpoints`, () => {
    it(`should return a ${HttpStatus.CREATED} response with a facility and all created entities`, async () => {
      // Arrange
      setupMocks();

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.CREATED);

      const expected = {
        ...mockResponses.facility.configurationEvent.data,
        businessCalendars: [mockResponses.businessCalendar.data],
        businessCalendarsConvention: mockResponses.businessCalendarsConvention.data,
        counterparties: Array(payloadCounterparties.length).fill(mockResponses.counterparty.data),
        fixedFees: Array(payloadFixedFees.length).fill(mockResponses.fixedFee.data),
        obligations: Array(payloadObligations.length).fill(mockResponses.obligation.data),
        repaymentProfiles: Array(payloadRepaymentProfiles.length).fill(mockResponses.repaymentProfile.data),
        riskDetails: mockResponses.riskDetails.data,
      };

      expect(body).toStrictEqual(expected);
    });

    describe(`${PRODUCT_TYPE_CODES.BIP} - ${PRODUCT_TYPE_NAMES.BIP}`, () => {
      it(`should return a ${HttpStatus.CREATED} response`, async () => {
        // Arrange
        setupMocks();

        const mockPayload = {
          ...initPayload,
          overview: {
            ...initPayload.overview,
            productTypeCode: PRODUCT_TYPE_CODES.BIP,
          },
          obligations: [
            {
              ...initPayload.obligations[0],
              subtypeCode: OBLIGATION_SUBTYPES.OST001.code,
            },
          ],
        };

        // Act
        const { status } = await api.post(apimFacilityUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.CREATED);
      });
    });

    describe(`${PRODUCT_TYPE_CODES.EXIP} - ${PRODUCT_TYPE_NAMES.EXIP}`, () => {
      it(`should return a ${HttpStatus.CREATED} response`, async () => {
        // Arrange
        setupMocks();

        const mockPayload = {
          ...initPayload,
          overview: {
            ...initPayload.overview,
            productTypeCode: PRODUCT_TYPE_CODES.EXIP,
          },
          obligations: [
            {
              ...initPayload.obligations[0],
              subtypeCode: OBLIGATION_SUBTYPES.OST009.code,
            },
          ],
        };

        // Act
        const { status } = await api.post(apimFacilityUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.CREATED);
      });
    });

    describe(`${PRODUCT_TYPE_CODES.BSS} - ${PRODUCT_TYPE_NAMES.BSS}`, () => {
      it(`should return a ${HttpStatus.CREATED} response`, async () => {
        // Arrange
        setupMocks();

        const mockPayload = {
          ...initPayload,
          overview: {
            ...initPayload.overview,
            productTypeCode: PRODUCT_TYPE_CODES.BSS,
          },
          obligations: [
            {
              ...initPayload.obligations[0],
              subtypeCode: OBLIGATION_SUBTYPES.OST012.code,
            },
          ],
        };

        // Act
        const { status } = await api.post(apimFacilityUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.CREATED);
      });
    });
  });
});
