import { GIFT } from '@ukef/constants';

const {
  VALIDATION: {
    COUNTERPARTY: {
      ROLE_ID: { MIN_LENGTH, MAX_LENGTH },
    },
  },
} = GIFT;

/**
 * Check if a role ID has a valid format.
 * @param {String} roleId: Role ID
 * @returns {Boolean}
 */
export const isValidCounterpartyRoleIdFormat = (roleId?: string): boolean => {
  if (roleId && typeof roleId === 'string') {
    return roleId?.length >= MIN_LENGTH && roleId?.length <= MAX_LENGTH;
  }

  return false;
};
