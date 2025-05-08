import { GiftRepaymentProfileDto } from '../../dto';

/**
 * Get all allocation dates from GIFT repayment profile allocations
 * @param {GiftRepaymentProfileDto[]} repaymentProfiles: All repayment profiles
 * @returns {string[]} All allocation's dueDate values
 */
export const getRepaymentProfileAllocationDates = (repaymentProfiles?: GiftRepaymentProfileDto[]): string[] => {
  if (repaymentProfiles && Array.isArray(repaymentProfiles)) {
    return repaymentProfiles
      .map((profile: GiftRepaymentProfileDto) => {
        if (Array.isArray(profile.allocations)) {
          return profile.allocations.map((allocation) => allocation.dueDate);
        }
      })
      .flat();
  }

  return [];
};
