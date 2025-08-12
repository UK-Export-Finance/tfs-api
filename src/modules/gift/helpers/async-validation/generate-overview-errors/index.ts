import { GiftFacilityOverviewRequestDto } from '../../../dto';

interface GenerateOverviewValidationErrorsParams {
  isSupportedProductType: boolean;
  payload: GiftFacilityOverviewRequestDto;
  supportedCurrencies: string[];
}

/**
 * Generate validation errors for the "overview" object in a GIFT facility creation payload
 * @param {boolean} isSupportedProductType: If the product type is supported by GIFT
 * @param {GiftFacilityOverviewRequestDto} payload: The "overview" object in the facility creation payload
 * @param {String[]} supportedCurrencies: Currencies supported by GIFT
 * @returns {String[]} An array of validation errors
 */
export const generateOverviewErrors = ({ isSupportedProductType, payload, supportedCurrencies }: GenerateOverviewValidationErrorsParams): string[] => {
  const validationErrors = [];

  if (!supportedCurrencies.includes(payload.currency)) {
    validationErrors.push(`overview.currency is not supported - ${payload.currency}`);
  }

  if (!isSupportedProductType) {
    validationErrors.push(`overview.productTypeCode is not supported - ${payload.productTypeCode}`);
  }

  return validationErrors;
};
