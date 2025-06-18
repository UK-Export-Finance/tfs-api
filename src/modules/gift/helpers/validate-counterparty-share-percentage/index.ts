import { GIFT } from '@ukef/constants';

import { GiftFacilityCounterpartyRoleDto } from '../../dto';

const {
  VALIDATION: {
    COUNTERPARTY: {
      SHARE_PERCENTAGE: { MIN, MAX },
    },
  },
} = GIFT;

interface ValidateCounterpartySharePercentageParams {
  roles: GiftFacilityCounterpartyRoleDto[];
  roleCode: string;
  sharePercentage?: any;
}

/**
 * Check if a roleCode requires a share percentage
 * and if so, validate that a provided share percentage is valid.
 * @param {GiftFacilityCounterpartyRoleDto[]} roles: Array of counterparty roles
 * @param {String} roleCode: Counterparty role ID
 * @param {any} sharePercentage: Provided share percentage for a counterparty
 * @returns {Boolean}
 */
export const validateCounterpartySharePercentage = ({ roles, roleCode, sharePercentage }: ValidateCounterpartySharePercentageParams): boolean => {
  const role = roles.find((role: GiftFacilityCounterpartyRoleDto) => role.id === roleCode);

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
