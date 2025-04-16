import { GiftRepaymentProfileDto } from '../../dto';

/**
 * Get all names from GIFT repayment profiles
 * @param {GiftRepaymentProfileDto[]} repaymentProfiles: All repayment profiles
 * @returns {string[]} All repayment profile's name values
 */
export const getRepaymentProfileNames = (repaymentProfiles: GiftRepaymentProfileDto[]): string[] =>
  Object.values(repaymentProfiles).map((repaymentProfile) => repaymentProfile.name);
