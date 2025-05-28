import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const { EVENT_TYPES, PATH, API_RESPONSE_TYPES } = GIFT;

export const mockFacilityId = GIFT_EXAMPLES.FACILITY_ID;
export const mockWorkPackageId = GIFT_EXAMPLES.WORK_PACKAGE_ID;

export const mockResponses = {
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
  counterparty: { data: { aCounterparty: true } },
  currencies: GIFT_EXAMPLES.CURRENCIES,
  feeTypes: GIFT_EXAMPLES.FEE_TYPES_RESPONSE_DATA,
  fixedFee: { data: { aFixedFee: true } },
  obligation: { data: { anObligation: true } },
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
  internalServerError: {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
  },
  unauthorized: {
    statusCode: HttpStatus.UNAUTHORIZED,
    message: 'Unauthorized',
  },
};

export const apimFacilityUrl = `/api/${prefixAndVersion}/gift${PATH.FACILITY}`;
export const facilityCreationUrl = PATH.CREATE_FACILITY;
export const currencyUrl = PATH.CURRENCY;
export const feeTypeUrl = PATH.FEE_TYPE;
export const counterpartyUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_COUNTERPARTY}`;
export const fixedFeeUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.CREATE_FIXED_FEE}`;
export const obligationUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.CREATE_OBLIGATION}`;
export const repaymentProfileUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_MANUAL_REPAYMENT_PROFILE}`;
export const approveStatusUrl = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.APPROVE}`;

export const payloadCounterparties = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.counterparties);
export const payloadFixedFees = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.fixedFees);
export const payloadObligations = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.obligations);
export const payloadRepaymentProfiles = Object.keys(GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD.repaymentProfiles);

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
