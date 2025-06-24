import { GiftFacilityOverviewRequestDto } from '../../../dto';

/**
 * Generate validation errors for the "overview" object in a GIFT facility creation payload
 * @param {GiftFacilityOverviewRequestDto} payload: The "overview" object in the facility creation payload
 * @param {String[]} supportedCurrencies: Currencies supported by GIFT
 * @returns {String[]} An array of validation errors
 */
export const generateOverviewValidationErrors = (payload: GiftFacilityOverviewRequestDto, supportedCurrencies: string[]): string[] => {
  const validationErrors = [];

  if (!supportedCurrencies.includes(payload.currency)) {
    validationErrors.push(`overview.currency is not supported (${payload.currency})`);
  }

  return validationErrors;
};
