import { GiftRepaymentProfileDto } from '../../dto';

/**
 * Get all names from GIFT repayment profiles
 * @param {GiftRepaymentProfileDto[]} repaymentProfiles: ALl repayment profiles
 * @returns {string[]} All repayment profile's name values
 */
export const getRepaymentProfileNames = (repaymentProfiles: GiftRepaymentProfileDto[]): string[] => {
  const names = Object.values(repaymentProfiles).map((repaymentProfile) => repaymentProfile.name);

  return names;
};
