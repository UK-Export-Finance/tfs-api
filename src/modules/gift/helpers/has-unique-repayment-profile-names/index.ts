import { length as isLength } from 'class-validator';
import { GIFT } from '@ukef/constants';

import type { GiftRepaymentProfileRequestDto } from '@ukef/modules/gift/dto';
import { arrayHasUniqueStrings } from '@ukef/modules/gift/helpers/array-has-unique-strings';
import { getRepaymentProfileNames } from '@ukef/modules/gift/helpers/get-repayment-profile-names';

const {
  VALIDATION: {
    REPAYMENT_PROFILE: {
      NAME: { MIN_LENGTH, MAX_LENGTH },
    },
  },
} = GIFT;

/**
 * Check if the provided repayment profiles all have unique names.
 * Only names that are otherwise valid (a string of an acceptable length) are checked for uniqueness.
 * Invalid names (e.g, null, a number, an out of range length) are excluded, since they are already
 * flagged by other field validators - otherwise, two profiles that both have an invalid, identical
 * name (e.g, both `null`) would incorrectly be flagged as "duplicates" of one another.
 * NOTE: We must use class-validator's `isLength` (not the native `string.length`), since `isLength`
 * accounts for surrogate pairs (e.g, some emoji). `string.length` counts UTF-16 code units, so e.g, a
 * single emoji can count as 2 - this could cause a name that's valid as per the DTO's `@Length` decorator,
 * to incorrectly be treated as invalid here, and therefore excluded from the uniqueness check.
 * @param {GiftRepaymentProfileRequestDto[]} repaymentProfiles: All repayment profiles
 * @returns {Boolean}
 */
export const hasUniqueRepaymentProfileNames = (repaymentProfiles?: GiftRepaymentProfileRequestDto[]): boolean => {
  /**
   * If repayment profiles are not provided, the validation of unique names will be skipped.
   * This is because repayment profiles are optional in the facility creation payload.
   * Therefore we only need to validate, if repayment profiles are provided.
   */
  if (!Array.isArray(repaymentProfiles) || !repaymentProfiles.length) {
    return true;
  }

  const profileNames = getRepaymentProfileNames(repaymentProfiles);

  const validProfileNames = profileNames.filter((name: unknown): name is string => typeof name === 'string' && isLength(name, MIN_LENGTH, MAX_LENGTH));

  /**
   * If there are fewer than 2 otherwise-valid names, there's nothing meaningful to compare for uniqueness.
   */
  if (validProfileNames.length < 2) {
    return true;
  }

  return arrayHasUniqueStrings(validProfileNames);
};
