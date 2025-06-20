import { GIFT } from '@ukef/constants';

import { GiftFacilityCounterpartyRoleResponseDto } from '../../dto';

const {
  VALIDATION: {
    COUNTERPARTY: {
      SHARE_PERCENTAGE: { MIN, MAX },
    },
  },
} = GIFT;

interface ValidateCounterpartySharePercentageParams {
  roles: GiftFacilityCounterpartyRoleResponseDto[];
  roleId: string;
  sharePercentage?: any;
}

/**
 * Check if a roleId requires a share percentage
 * and if so, validate that a provided share percentage is valid.
 * @param {GiftFacilityCounterpartyRoleResponseDto[]} roles: Array of counterparty roles
 * @param {String} roleId: Counterparty role ID
 * @param {any} sharePercentage: Provided share percentage for a counterparty
 * @returns {Boolean}
 */
export const validateCounterpartySharePercentage = ({ roles, roleId, sharePercentage }: ValidateCounterpartySharePercentageParams): boolean => {
  const role = roles.find((role: GiftFacilityCounterpartyRoleResponseDto) => role.id === roleId);

  /**
   * No role has been found.
   * Therefore, the role does not require a sharePercentage.
   */
  if (!role) {
    return true;
  }

  /**
   * The role does not require a share.
   * Therefore, no need to validate further.
   */
  if (!role.hasShare) {
    return true;
  }

  /**
   * The role requires a share.
   * Therefore, validate the provided sharePercentage.
   */
  if (typeof sharePercentage !== 'number' || sharePercentage < MIN || sharePercentage > MAX) {
    return false;
  }

  /**
   * The share percentage is valid.
   */
  return true;
};
