import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { AMEND_FACILITY_TYPES_ARRAY, GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { MockGiftResponse } from '@ukef-test/support/interfaces/mock-gift-response.interface';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const { AMEND_FACILITY_TYPES, EVENT_TYPES, INTEGRATION_DEFAULTS, PATH, PRODUCT_TYPE_CODES, API_RESPONSE_TYPES } = GIFT;

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
  approveStatus: { data: { aStatusUpdate: true } },
  businessCalendar: { data: GIFT_EXAMPLES.BUSINESS_CALENDAR },
  businessCalendarsConvention: { data: GIFT_EXAMPLES.BUSINESS_CALENDARS_CONVENTION },
  counterparty: { data: { aCounterparty: true } },
  counterpartyRoles: GIFT_EXAMPLES.COUNTERPARTY_ROLES_RESPONSE_DATA,
  counterpartyRolesWithHasSharePercentage: {
    counterpartyRoles: [GIFT_EXAMPLES.COUNTERPARTY_ROLE.GUARANTOR],
  },
  currencies: GIFT_EXAMPLES.CURRENCIES,
  facility: {
    workPackageId: mockWorkPackageId,
    configurationEvent: {
      data: {
        aMockFacility: true,
        facilityId: mockFacilityId,
      },
    },
  },
  facilityAmendment: {
    data: { anAmendedFacility: true },
  },
  feeTypes: GIFT_EXAMPLES.FEE_TYPES_RESPONSE_DATA,
  fixedFee: { data: { aFixedFee: true } },
  obligation: { data: { anObligation: true } },
  obligationSubtype: GIFT_EXAMPLES.OBLIGATION_SUBTYPES_RESPONSE_DATA,
  productType: { data: { aProductType: true } },
  repaymentProfile: { data: { aRepaymentProfile: true } },
  riskDetails: {
    data: {
      ...GIFT_EXAMPLES.RISK_DETAILS,
      overrideRiskRating: INTEGRATION_DEFAULTS.OVERRIDE_RISK_RATING,
      overrideLossGivenDefault: INTEGRATION_DEFAULTS.OVERRIDE_LOSS_GIVEN_DEFAULT,
      riskReassessmentDate: INTEGRATION_DEFAULTS.RISK_REASSESSMENT_DATE,
    },
  },
  workPackageCreation: GIFT_EXAMPLES.WORK_PACKAGE_CREATION_RESPONSE_DATA,
  badRequest,
  internalServerError,
  forbidden,
  notFound,
  unauthorized,
  iAmATeapot,
};

export const apimFacilityUrl = `/api/${prefixAndVersion}/gift${PATH.FACILITY}`;
export const apimFacilityAmendmentUrl = `/api/${prefixAndVersion}/gift${PATH.FACILITY}/${mockFacilityId}${PATH.AMENDMENT}`;
export const currencyUrl = PATH.CURRENCY;
export const counterpartyRolesUrl = PATH.COUNTERPARTY_ROLES;
export const facilityCreationUrl = PATH.CREATE_FACILITY;
export const feeTypeUrl = PATH.FEE_TYPE;
export const obligationSubtypeUrl = PATH.OBLIGATION_SUBTYPE;
export const productTypeUrl = `${PATH.PRODUCT_TYPE}/${PRODUCT_TYPE_CODES.BIP}`;
export const businessCalendarUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_BUSINESS_CALENDAR}`;
export const businessCalendarsConventionUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_BUSINESS_CALENDARS_CONVENTION}`;
export const counterpartyUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_COUNTERPARTY}`;
export const fixedFeeUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_FIXED_FEE}`;
export const obligationUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_OBLIGATION}`;
export const repaymentProfileUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_REPAYMENT_PROFILE}`;
export const riskDetailsUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_RISK_DETAILS}`;
export const approveStatusUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.APPROVE}`;
export const facilityWorkPackageUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}`;
export const facilityAmendmentUrl = (amendmentType: string = AMEND_FACILITY_TYPES.AMEND_FACILITY_INCREASE_AMOUNT) =>
  `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/AmendFacility_${amendmentType}`;
export const workPackageUrl = `${PATH.WORK_PACKAGE}/${mockWorkPackageId}`;

export const businessCalendar = GIFT_EXAMPLES.BUSINESS_CALENDAR;
export const businessCalendarsConvention = GIFT_EXAMPLES.BUSINESS_CALENDARS_CONVENTION;

export const payloadCounterparties = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.counterparties);
export const payloadFixedFees = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.fixedFees);
export const payloadObligations = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.obligations);
export const payloadRepaymentProfiles = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.repaymentProfiles);

/**
 * Generate expected validation errors
 * @param {object} payload: The payload that has been sent
 * @param {object} expectedResponse: The expected response message and status
 * @param {string} entityName: The name of the payload entity
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

export const amendmentTypeValidationMessage = `amendmentType must be one of the following values: ${AMEND_FACILITY_TYPES_ARRAY.join(', ')}`;
