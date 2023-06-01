import * as BUNDLE_STATUSES from './enums/bundle-status';
import * as COVENANT_TYPE_CODES from './enums/covenant-type-code';
import * as FACILITY_STAGES from './enums/facility-stage';
import * as FACILITY_STATUSES from './enums/facility-status';
import * as FACILITY_TYPE_IDS from './enums/facility-type-id';
import * as FACILITY_UPDATE_OPERATIONS from './enums/facility-update-operations';
import * as GUARANTEE_TYPE_CODES from './enums/guarantee-type-code';
import * as INCOME_CLASS_CODES from './enums/income-class-code';
import * as LENDER_TYPE_CODES from './enums/lender-type-code';
import * as OPERATION_TYPE_CODES from './enums/operation-type-code';
import * as PORTFOLIO from './enums/portfolio';
import * as PRODUCT_TYPE_GROUPS from './enums/product-type-group';
import * as PRODUCT_TYPE_IDS from './enums/product-type-id';
import * as LOAN_BILLING_FREQUENCY_TYPES from './enums/loan-billing-frequency-type';

export const ENUMS = {
  BUNDLE_STATUSES: BUNDLE_STATUSES.BundleStatusEnum,
  LENDER_TYPE_CODES: LENDER_TYPE_CODES.LenderTypeCodeEnum,
  PORTFOLIO: PORTFOLIO.PortfolioEnum,
  COVENANT_TYPE_CODES: COVENANT_TYPE_CODES.CovenantTypeCodeEnum,
  PRODUCT_TYPE_IDS: PRODUCT_TYPE_IDS.ProductTypeIdEnum,
  FACILITY_TYPE_IDS: FACILITY_TYPE_IDS.FacilityTypeIdEnum,
  FACILITY_STATUSES: FACILITY_STATUSES.FacilityStatusEnum,
  FACILITY_STAGES: FACILITY_STAGES.FacilityStageEnum,
  PRODUCT_TYPE_GROUPS: PRODUCT_TYPE_GROUPS.ProductTypeGroupEnum,
  GUARANTEE_TYPE_CODES: GUARANTEE_TYPE_CODES.GuaranteeTypeCodeEnum,
  INCOME_CLASS_CODES: INCOME_CLASS_CODES.IncomeClassCodeEnum,
  OPERATION_TYPE_CODES: OPERATION_TYPE_CODES.OperationTypeCodeEnum,
  FACILITY_UPDATE_OPERATIONS: FACILITY_UPDATE_OPERATIONS.FacilityUpdateOperationEnum,
  LOAN_BILLING_FREQUENCY_TYPES: LOAN_BILLING_FREQUENCY_TYPES.LoanBillingFrequencyTypeEnum,
};
