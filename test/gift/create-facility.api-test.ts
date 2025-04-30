import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const { API_RESPONSE_MESSAGES, API_RESPONSE_TYPES, ENTITY_NAMES, PATH } = GIFT;

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const getExpectedValidationErrors = (payload, expectedResponse, entityName) => {
  const expected = payload.map((obj, index) => ({
    entityName,
    index,
    message: expectedResponse.message,
    type: API_RESPONSE_TYPES.ERROR,
    status: expectedResponse.statusCode,
  }));

  if (expectedResponse.validationErrors) {
    return expected.map((obj) => ({
      ...obj,
      validationErrors: expectedResponse.validationErrors,
    }));
  }

  return expected;
};

describe('POST /gift/facility', () => {
  const mockFacilityId = GIFT_EXAMPLES.FACILITY_ID;
  const mockWorkPackageId = GIFT_EXAMPLES.WORK_PACKAGE_ID;

  const mockResponses = {
    badRequest: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Validation error',
      validationErrors: [
        {
          path: ['fieldX'],
          message: 'Invalid fieldX',
        },
      ],
    },
    counterparty: { aCounterparty: true },
    fixedFee: { aFixedFee: true },
    obligation: { anObligation: true },
    repaymentProfile: { aRepaymentProfile: true },
    facility: {
      aMockFacility: true,
      facilityId: mockFacilityId,
      workPackageId: mockWorkPackageId,
    },
    internalServerError: {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    },
    unauthorized: {
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Unauthorized',
    },
  };

  const payloadCounterparties = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.counterparties);
  const payloadFixedFees = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.fixedFees);
  const payloadObligations = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.obligations);
  const payloadRepaymentProfiles = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.repaymentProfiles);

  const facilityUrl = `/api/${prefixAndVersion}/gift${PATH.FACILITY}`;
  const facilityCreationUrl = PATH.CREATE_FACILITY;
  const counterpartyUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}`;
  const fixedFeeUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}`;
  const obligationUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}`;
  const repaymentProfileUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}`;

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
      api.postWithoutAuth(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  describe(`when the payload is valid and a ${HttpStatus.CREATED} response is returned by all GIFT endpoints`, () => {
    it(`should return a ${HttpStatus.CREATED}} response with a facility, counterparties and repayment profiles`, async () => {
      // Arrange
      nock(GIFT_API_URL).persist().post(facilityCreationUrl).reply(HttpStatus.CREATED, mockResponses.facility);

      nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

      nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

      nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

      nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

      // Act
      const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.CREATED);

      const expected = {
        ...mockResponses.facility,
        counterparties: Array(payloadCounterparties.length).fill(mockResponses.counterparty),
        fixedFees: Array(payloadCounterparties.length).fill(mockResponses.fixedFee),
        obligations: Array(payloadObligations.length).fill(mockResponses.obligation),
        repaymentProfiles: Array(payloadRepaymentProfiles.length).fill(mockResponses.repaymentProfile),
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('GIFT facility creation endpoint error handling', () => {
    describe(`when a ${HttpStatus.BAD_REQUEST} response is returned by the GIFT facility endpoint`, () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = mockResponses.badRequest;

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned by the GIFT facility endpoint`, () => {
      it(`should return a ${HttpStatus.UNAUTHORIZED} response`, async () => {
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.UNAUTHORIZED, mockResponses.unauthorized);

        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        expect(status).toBe(HttpStatus.UNAUTHORIZED);

        expect(body).toStrictEqual(mockResponses.unauthorized);
      });
    });

    describe('when an unacceptable status is returned by the GIFT facility endpoint', () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.I_AM_A_TEAPOT);

        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        expect(body).toStrictEqual(mockResponses.internalServerError);
      });
    });

    describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} status is returned by the GIFT facility endpoint`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.INTERNAL_SERVER_ERROR);

        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        expect(body).toStrictEqual(mockResponses.internalServerError);
      });
    });
  });

  describe('GIFT counterparty endpoint error handling', () => {
    describe(`when a ${HttpStatus.BAD_REQUEST} response is returned by the GIFT counterparty endpoint`, () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with a mapped body/validation errors`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          ...mockResponses.badRequest,
          message: API_RESPONSE_MESSAGES.FACILITY_VALIDATION_ERRORS,
          validationErrors: getExpectedValidationErrors(payloadCounterparties, mockResponses.badRequest, ENTITY_NAMES.COUNTERPARTY),
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned by the GIFT counterparty endpoint`, () => {
      it(`should return a ${HttpStatus.UNAUTHORIZED} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.UNAUTHORIZED, mockResponses.unauthorized);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.UNAUTHORIZED);

        const expected = {
          ...mockResponses.unauthorized,
          validationErrors: getExpectedValidationErrors(payloadCounterparties, mockResponses.unauthorized, ENTITY_NAMES.COUNTERPARTY),
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} status is returned by the GIFT counterparty endpoint`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.badRequest);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        expect(body).toStrictEqual(mockResponses.internalServerError);
      });
    });

    describe('when an unacceptable response is returned by the GIFT counterparty endpoint', () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.I_AM_A_TEAPOT);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        expect(body).toStrictEqual(mockResponses.internalServerError);
      });
    });
  });

  describe('GIFT fixed fee endpoint error handling', () => {
    describe(`when a ${HttpStatus.BAD_REQUEST} response is returned by the GIFT fixed fee endpoint`, () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with a mapped body/validation errors`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          ...mockResponses.badRequest,
          message: API_RESPONSE_MESSAGES.FACILITY_VALIDATION_ERRORS,
          validationErrors: getExpectedValidationErrors(payloadFixedFees, mockResponses.badRequest, ENTITY_NAMES.FIXED_FEE),
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned by the GIFT fixed fee endpoint`, () => {
      it(`should return a ${HttpStatus.UNAUTHORIZED} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.unauthorized);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.UNAUTHORIZED, mockResponses.unauthorized);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.UNAUTHORIZED);

        const expected = {
          ...mockResponses.unauthorized,
          validationErrors: getExpectedValidationErrors(payloadFixedFees, mockResponses.unauthorized, ENTITY_NAMES.FIXED_FEE),
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} status is returned by the GIFT fixed fee endpoint`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.badRequest);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        expect(body).toStrictEqual(mockResponses.internalServerError);
      });
    });

    describe('when an unacceptable response is returned by the GIFT fixed fee endpoint', () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.I_AM_A_TEAPOT);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        expect(body).toStrictEqual(mockResponses.internalServerError);
      });
    });
  });

  describe('GIFT obligation endpoint error handling', () => {
    describe(`when a ${HttpStatus.BAD_REQUEST} response is returned by the GIFT obligation endpoint`, () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with a mapped body/validation errors`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          ...mockResponses.badRequest,
          message: API_RESPONSE_MESSAGES.FACILITY_VALIDATION_ERRORS,
          validationErrors: getExpectedValidationErrors(payloadObligations, mockResponses.badRequest, ENTITY_NAMES.OBLIGATION),
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned by the GIFT obligation endpoint`, () => {
      it(`should return a ${HttpStatus.UNAUTHORIZED} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.UNAUTHORIZED, mockResponses.unauthorized);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.UNAUTHORIZED);

        const expected = {
          ...mockResponses.unauthorized,
          validationErrors: getExpectedValidationErrors(payloadObligations, mockResponses.unauthorized, ENTITY_NAMES.OBLIGATION),
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} status is returned by the GIFT obligation endpoint`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.obligation);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        expect(body).toStrictEqual(mockResponses.internalServerError);
      });
    });

    describe('when an unacceptable response is returned by the GIFT obligation endpoint', () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.I_AM_A_TEAPOT);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        expect(body).toStrictEqual(mockResponses.internalServerError);
      });
    });
  });

  describe('GIFT repayment profile endpoint error handling', () => {
    describe(`when a ${HttpStatus.BAD_REQUEST} response is returned by the GIFT repayment profile endpoint`, () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with a mapped body/validation errors`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          ...mockResponses.badRequest,
          message: API_RESPONSE_MESSAGES.FACILITY_VALIDATION_ERRORS,
          validationErrors: getExpectedValidationErrors(payloadRepaymentProfiles, mockResponses.badRequest, ENTITY_NAMES.REPAYMENT_PROFILE),
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned by the GIFT repayment profile endpoint`, () => {
      it(`should return a ${HttpStatus.UNAUTHORIZED} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.UNAUTHORIZED, mockResponses.unauthorized);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.UNAUTHORIZED);

        const expected = {
          ...mockResponses.unauthorized,
          validationErrors: getExpectedValidationErrors(payloadRepaymentProfiles, mockResponses.unauthorized, ENTITY_NAMES.REPAYMENT_PROFILE),
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} status is returned by the GIFT repayment profile endpoint`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.badRequest);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.badRequest);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        expect(body).toStrictEqual(mockResponses.internalServerError);
      });
    });

    describe(`when an unacceptable response is returned by the GIFT repayment profile endpoint`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

        nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED);

        nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

        nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

        nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.I_AM_A_TEAPOT);

        // Act
        const { status, body } = await api.post(facilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        expect(body).toStrictEqual(mockResponses.internalServerError);
      });
    });
  });
});
