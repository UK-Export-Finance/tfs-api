import { isDateString } from 'class-validator';

import type { GiftRepaymentProfileRequestDto } from '@ukef/modules/gift/dto';
import { arrayHasUniqueStrings } from '@ukef/modules/gift/helpers/array-has-unique-strings';
import { getRepaymentProfileAllocationDates } from '@ukef/modules/gift/helpers/get-repayment-profile-allocation-dates';

/**
 * Check if the provided repayment profiles all have unique allocation dueDates.
 * Only dueDates that are otherwise valid (a valid ISO 8601 date string) are checked for uniqueness.
 * Invalid dueDates (e.g, null, a number, an empty string) are excluded, since they are already
 * flagged by other field validators - otherwise, two allocations that both have an invalid, identical
 * dueDate (e.g, both `null`) would incorrectly be flagged as "duplicates" of one another.
 * @param {GiftRepaymentProfileRequestDto[]} repaymentProfiles: All repayment profiles
 * @returns {Boolean}
 */
export const hasUniqueRepaymentProfileAllocationDates = (repaymentProfiles?: GiftRepaymentProfileRequestDto[]): boolean => {
  /**
   * If repayment profiles are not provided, the validation of unique allocation dates will be skipped.
   * This is because repayment profiles are optional in the facility creation payload.
   * Therefore we only need to validate, if repayment profiles are provided.
   */
  if (!Array.isArray(repaymentProfiles) || !repaymentProfiles.length) {
    return true;
  }

  const allocationDates = getRepaymentProfileAllocationDates(repaymentProfiles);

  const validAllocationDates = allocationDates.filter((dueDate: unknown): dueDate is string => typeof dueDate === 'string' && isDateString(dueDate));

  /**
   * If there are fewer than 2 otherwise-valid dueDates, there's nothing meaningful to compare for uniqueness.
   */
  if (validAllocationDates.length < 2) {
    return true;
  }

  return arrayHasUniqueStrings(validAllocationDates);
};
