import { GiftRepaymentProfileDto } from '../../dto';

/**
 * Get all allocation dates from GIFT repayment profile allocations
 * @param {GiftRepaymentProfileDto[]} repaymentProfiles: All repayment profiles
 * @returns {string[]} All allocation's dueDate values
 */
export const getRepaymentProfileAllocationDates = (repaymentProfiles?: GiftRepaymentProfileDto[]): string[] => {
  if (repaymentProfiles) {
    return Object.values(repaymentProfiles)
      .map((profile: GiftRepaymentProfileDto) => profile.allocations.map((allocation) => allocation.dueDate))
      .flat();
  }

  return [];
};
