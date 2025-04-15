import { GiftRepaymentProfileDto } from '../../dto';

/**
 * Get all allocation dates from GIFT repayment profiles
 * @param {GiftRepaymentProfileDto[]} repaymentProfiles: ALl repayment profiles
 * @returns {string[]} All allocation's dueDate values
 */
export const getRepaymentProfileAllocationDates = (repaymentProfiles: GiftRepaymentProfileDto[]): string[] => {
  const allValues = Object.values(repaymentProfiles)
    .map((profile: GiftRepaymentProfileDto) => profile.allocations.map((allocation: any) => allocation.dueDate))
    .flat();

  return allValues;
};
