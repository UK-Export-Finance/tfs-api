import { GIFT } from '@ukef/constants';

import { GiftFacilityCounterpartyRequestDto, GiftFacilityCounterpartyRoleResponseDto } from '../../dto';

const {
  VALIDATION: {
    COUNTERPARTY: {
      SHARE_PERCENTAGE: { MIN, MAX },
    },
  },
} = GIFT;

interface GenerateCounterpartySharePercentageErrorsParams {
  counterpartyRoles: GiftFacilityCounterpartyRoleResponseDto[];
  providedCounterparties: GiftFacilityCounterpartyRequestDto[];
}

/**
 * Check all provided counterparties share percentages.
 * If a GIFT counterparty role has a true hasSharePercentage flag,
 * and a provided counterparty does NOT have a sharePercentage field,
 * an error message should be returned.
 * @param {GenerateCounterpartySharePercentageErrorsParams} counterpartyRoles, providedCounterparties
 * @returns {String[]}
 * @example
 * ```ts
 * const counterpartyRoles = [ { code: 'A', hasSharePercentage: true } ];
 * const providedCounterparties [ { counterpartyUrn: 'ABC', roleCode: 'A' sharePercentage: 20 }];
 *
 * generateCounterpartySharePercentageErrors({ counterpartyRoles, providedCounterparties })
 *
 * [
 *   'counterparties.0.sharePercentage must be a provided as a number, at least 1 and not greater than 100`)'
 *   'counterparties.1.sharePercentage must be a provided as a number, at least 1 and not greater than 100`)'
 * ]
 * ```
 */
export const generateCounterpartySharePercentageErrors = ({
  counterpartyRoles,
  providedCounterparties,
}: GenerateCounterpartySharePercentageErrorsParams): string[] => {
  const validationErrors = [];

  providedCounterparties.forEach((role: GiftFacilityCounterpartyRequestDto, index: number) => {
    const { roleCode: providedRoleCode, sharePercentage } = role;

    const giftRole = counterpartyRoles.find((giftRole: GiftFacilityCounterpartyRoleResponseDto) => giftRole.code === providedRoleCode);

    /**
     * If the GIFT role hasSharePercentage flag is true,
     * and no sharePercentage is provided,
     * or if a provided sharePercentage is not within the MIN/MAX range,
     * return an error.
     */
    if (giftRole?.hasSharePercentage && (!sharePercentage || (sharePercentage && (sharePercentage < MIN || sharePercentage > MAX)))) {
      validationErrors.push(`counterparties.${index}.sharePercentage must be a provided as a number, at least ${MIN} and not greater than ${MAX}`);
    }
  });

  return validationErrors;
};
