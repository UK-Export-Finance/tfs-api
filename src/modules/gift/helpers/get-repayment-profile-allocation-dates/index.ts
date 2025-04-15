import { GiftRepaymentProfileDto } from '../../dto';

/**
 * Get all allocation dates from GIFT repayment profile allocations
 * @param {GiftRepaymentProfileDto[]} repaymentProfiles: ALl repayment profiles
 * @returns {string[]} All allocation's dueDate values
 */
export const getRepaymentProfileAllocationDates = (repaymentProfiles: GiftRepaymentProfileDto[]): string[] => {
  const dates = Object.values(repaymentProfiles)
    .map((profile: GiftRepaymentProfileDto) => profile.allocations.map((allocation) => allocation.dueDate))
    .flat();

  return dates;
};
