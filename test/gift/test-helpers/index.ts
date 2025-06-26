import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { MockGiftResponse } from '@ukef-test/support/interfaces/mock-gift-response.interface';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const { EVENT_TYPES, PATH, PRODUCT_TYPE_CODES, API_RESPONSE_TYPES } = GIFT;

export const mockFacilityId = GIFT_EXAMPLES.FACILITY_ID;
export const mockWorkPackageId = GIFT_EXAMPLES.WORK_PACKAGE_ID;

const badRequest: MockGiftResponse = {
  statusCode: HttpStatus.BAD_REQUEST,
  message: 'Validation error',
  validationErrors: [
    {
      path: ['fieldX'],
      message: 'Invalid fieldX',
    },
  ],
};

const internalServerError: MockGiftResponse = {
  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  message: 'Internal server error',
};

const forbidden: MockGiftResponse = {
  statusCode: HttpStatus.FORBIDDEN,
  message: 'Forbidden',
};

const notFound: MockGiftResponse = {
  statusCode: HttpStatus.NOT_FOUND,
  message: 'Not found',
};

const unauthorized: MockGiftResponse = {
  statusCode: HttpStatus.UNAUTHORIZED,
  message: 'Unauthorized',
};

const iAmATeapot: MockGiftResponse = {
  statusCode: HttpStatus.I_AM_A_TEAPOT,
  message: 'Teapot',
};

export const mockResponses = {
  badRequest,
  counterparty: { data: { aCounterparty: true } },
  counterpartyRoles: GIFT_EXAMPLES.COUNTERPARTY_ROLES_RESPONSE_DATA,
  currencies: GIFT_EXAMPLES.CURRENCIES,
  feeTypes: GIFT_EXAMPLES.FEE_TYPES_RESPONSE_DATA,
  fixedFee: { data: { aFixedFee: true } },
  obligation: { data: { anObligation: true } },
  productType: { data: { aProductType: true } },
  repaymentProfile: { data: { aRepaymentProfile: true } },
  facility: {
    workPackageId: mockWorkPackageId,
    configurationEvent: {
      data: {
        aMockFacility: true,
        facilityId: mockFacilityId,
      },
    },
  },
  approveStatus: { data: { aStatusUpdate: true } },
  internalServerError,
  forbidden,
  notFound,
  unauthorized,
  iAmATeapot,
};

export const apimFacilityUrl = `/api/${prefixAndVersion}/gift${PATH.FACILITY}`;
export const currencyUrl = PATH.CURRENCY;
export const counterpartyRolesUrl = PATH.COUNTERPARTY_ROLES;
export const facilityCreationUrl = PATH.CREATE_FACILITY;
export const feeTypeUrl = PATH.FEE_TYPE;
export const productTypeUrl = `${PATH.PRODUCT_TYPE}/${PRODUCT_TYPE_CODES.EXIP}`;
export const counterpartyUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_COUNTERPARTY}`;
export const fixedFeeUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.CREATE_FIXED_FEE}`;
export const obligationUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.CREATE_OBLIGATION}`;
export const repaymentProfileUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_MANUAL_REPAYMENT_PROFILE}`;
export const approveStatusUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.APPROVE}`;

export const payloadCounterparties = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.counterparties);
export const payloadFixedFees = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.fixedFees);
export const payloadObligations = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.obligations);
export const payloadRepaymentProfiles = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.repaymentProfiles);

/**
 * Generate expected validation errors
 * @param {Object} payload: The payload that has been sent
 * @param {Object} expectedResponse: The expected response message and status
 * @param {String} entityName: The name of the payload entity
 * @returns {Array[Object]} Validation errors
 */
export const getExpectedValidationErrors = (payload, expectedResponse, entityName) => {
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
