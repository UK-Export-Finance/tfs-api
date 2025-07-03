import { GiftFacilityCounterpartyRequestDto, GiftFacilityCounterpartyRoleResponseDto } from '../../../dto';
import { arrayOfObjectsHasValue } from '../../array-of-objects-has-value';

// /**
//  * Generate validation errors for the "overview" object in a GIFT facility creation payload
//  * @param {GiftFacilityOverviewRequestDto} payload: The "overview" object in the facility creation payload
//  * @param {String[]} supportedCurrencies: Currencies supported by GIFT
//  * @returns {String[]} An array of validation errors
//  */
export const generateCounterpartyRoleValidationErrors = (
  payload: GiftFacilityCounterpartyRequestDto[],
  supportedRoles: GiftFacilityCounterpartyRoleResponseDto[],
): string[] => {
  const validationErrors = [];

  // payload.forEach((counterparty: GiftFacilityCounterpartyRequestDto) => {
  payload.forEach(({ roleCode }) => {
    if (!arrayOfObjectsHasValue(supportedRoles, 'roleCode', roleCode)) {
      validationErrors.push(`counterparty INDEX ROLE is not supported - ${roleCode}`);
    }
  });

  return validationErrors;
};
