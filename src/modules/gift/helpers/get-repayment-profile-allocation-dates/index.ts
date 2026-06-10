import { GiftRepaymentProfileRequestDto } from '../../dto';

/**
 * Get all allocation dates from GIFT repayment profile allocations
 * @param {GiftRepaymentProfileRequestDto[]} repaymentProfiles: All repayment profiles
 * @returns {String[]} All allocation's dueDate values
 */
export const getRepaymentProfileAllocationDates = (repaymentProfiles?: GiftRepaymentProfileRequestDto[]): string[] => {
  if (Array.isArray(repaymentProfiles)) {
    return repaymentProfiles
      .map((profile: GiftRepaymentProfileRequestDto) => {
        if (Array.isArray(profile.allocations)) {
          return profile.allocations.map((allocation) => allocation.dueDate);
        }
      })
      .flat();
  }

  return [];
};
