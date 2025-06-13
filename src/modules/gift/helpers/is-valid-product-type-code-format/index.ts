import { GIFT } from '@ukef/constants';

const {
  VALIDATION: {
    FACILITY: {
      OVERVIEW: {
        PRODUCT_TYPE_CODE: { MIN_LENGTH, MAX_LENGTH },
      },
    },
  },
} = GIFT;

/**
 * Check if a product type code has a valid format.
 * @param {String} productTypeCode: Product type code
 * @returns {Boolean}
 */
export const isValidProductTypeCodeFormat = (productTypeCode?: string): boolean => {
  if (productTypeCode && typeof productTypeCode === 'string') {
    return productTypeCode?.length >= MIN_LENGTH && productTypeCode?.length <= MAX_LENGTH;
  }

  return false;
};
