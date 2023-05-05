import * as BUNDLE_STATUSES from './enums/bundle-status';
import * as COVENANT_TYPE_CODES from './enums/covenant-type-code';
import * as GUARANTEE_TYPE_CODES from './enums/guarantee-type-code';
import * as LENDER_TYPE_CODES from './enums/lender-type-code';
import * as PORTFOLIO from './enums/portfolio';
import * as PRODUCT_TYPE_GROUPS from './enums/product-type-group';
import * as PRODUCT_TYPE_IDS from './enums/product-type-id';

export const ENUMS = {
  BUNDLE_STATUSES: BUNDLE_STATUSES.BundleStatusEnum,
  LENDER_TYPE_CODES: LENDER_TYPE_CODES.LenderTypeCodeEnum,
  PORTFOLIO: PORTFOLIO.PortfolioEnum,
  COVENANT_TYPE_CODES: COVENANT_TYPE_CODES.CovenantTypeCodeEnum,
  GUARANTEE_TYPE_CODES: GUARANTEE_TYPE_CODES.guaranteeTypeCodeEnum,
  PRODUCT_TYPE_IDS: PRODUCT_TYPE_IDS.ProductTypeIdEnum,
  PRODUCT_TYPE_GROUPS: PRODUCT_TYPE_GROUPS.ProductTypeGroupEnum,
};
