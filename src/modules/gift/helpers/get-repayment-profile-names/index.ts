import { GiftRepaymentProfileRequestDto } from '../../dto';

/**
 * Get all names from GIFT repayment profiles
 * @param {GiftRepaymentProfileRequestDto[]} repaymentProfiles: All repayment profiles
 * @returns {string[]} All repayment profile's names
 */
export const getRepaymentProfileNames = (repaymentProfiles?: GiftRepaymentProfileRequestDto[]): string[] => {
  if (Array.isArray(repaymentProfiles)) {
    return Object.values(repaymentProfiles).map((repaymentProfile) => repaymentProfile.name);
  }

  return [];
};
