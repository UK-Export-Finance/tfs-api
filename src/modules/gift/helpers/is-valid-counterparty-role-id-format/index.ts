import { GIFT } from '@ukef/constants';

const {
  VALIDATION: {
    COUNTERPARTY: {
      ROLE_CODE: { MIN_LENGTH, MAX_LENGTH },
    },
  },
} = GIFT;

/**
 * Check if a role ID has a valid format.
 * @param {String} roleCode: Role code
 * @returns {Boolean}
 */
export const isValidCounterpartyRoleIdFormat = (roleCode?: string): boolean => {
  if (roleCode && typeof roleCode === 'string') {
    return roleCode?.length >= MIN_LENGTH && roleCode?.length <= MAX_LENGTH;
  }

  return false;
};
