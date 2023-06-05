import * as ASSIGNED_RATING_CODES from './enums/assigned-rating-code';
import * as BUNDLE_INFORMATION_TYPES from './enums/bundle-information-type';
import * as BUNDLE_STATUS_CODES from './enums/bundle-status-code';
import * as CITIZENSHIP_CLASSES from './enums/citizenship-class';
import * as COVENANT_TYPE_CODES from './enums/covenant-type-code';
import * as FACILITY_STAGES from './enums/facility-stage';
import * as FACILITY_STATUSES from './enums/facility-status';
import * as FACILITY_TRANSACTION_TYPE_CODES from './enums/facility-transaction-type-code';
import * as FACILITY_TYPE_IDS from './enums/facility-type-id';
import * as FACILITY_UPDATE_OPERATIONS from './enums/facility-update-operations';
import * as FEE_FREQUENCY_TYPES from './enums/fee-frequency-type';
import * as GUARANTEE_TYPE_CODES from './enums/guarantee-type-code';
import * as INCOME_CLASS_CODES from './enums/income-class-code';
import * as INITIAL_BUNDLE_STATUS_CODES from './enums/initial-bundle-status-code';
import * as LENDER_TYPE_CODES from './enums/lender-type-code';
import * as LIMIT_TYPE_CODES from './enums/limit-type-code';
import * as OPERATION_TYPE_CODES from './enums/operation-type-code';
import * as PORTFOLIO from './enums/portfolio';
import * as PRODUCT_TYPE_GROUPS from './enums/product-type-group';
import * as PRODUCT_TYPE_IDS from './enums/product-type-id';
import * as YEAR_BASIS from './enums/year-basis';

export const ENUMS = {
  BUNDLE_STATUS_CODES: BUNDLE_STATUS_CODES.BundleStatusCodeEnum,
  INITIAL_BUNDLE_STATUS_CODES: INITIAL_BUNDLE_STATUS_CODES.InitialBundleStatusCodeEnum,
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
  FACILITY_TRANSACTION_TYPE_CODES: FACILITY_TRANSACTION_TYPE_CODES.FacilityTransactionTypeCodeEnum,
  BUNDLE_INFORMATION_TYPES: BUNDLE_INFORMATION_TYPES.BundleInformationType,
  FEE_FREQUENCY_TYPES: FEE_FREQUENCY_TYPES.FeeFrequencyTypeEnum,
  LIMIT_TYPE_CODES: LIMIT_TYPE_CODES.LimitTypeCodeEnum,
  ASSIGNED_RATING_CODES: ASSIGNED_RATING_CODES.AssignedRatingCodeEnum,
  CITIZENSHIP_CLASSES: CITIZENSHIP_CLASSES.CitizenshipClassEnum,
  YEAR_BASIS: YEAR_BASIS.YearBasisEnum,
};
