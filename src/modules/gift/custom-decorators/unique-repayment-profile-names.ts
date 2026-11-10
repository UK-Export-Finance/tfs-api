import { length as isLength, registerDecorator, ValidationOptions } from 'class-validator';
import { GIFT } from '@ukef/constants';

import type { GiftRepaymentProfileRequestDto } from '@ukef/modules/gift/dto';
import { arrayHasUniqueStrings, getRepaymentProfileNames } from '@ukef/modules/gift/helpers';

const {
  VALIDATION: {
    REPAYMENT_PROFILE: {
      NAME: { MIN_LENGTH, MAX_LENGTH },
    },
  },
} = GIFT;

/**
 * Custom decorator to check if a provided repayment profile's name is unique.
 * @param {ValidationOptions} options: Class validator's validation options
 * @returns {Boolean | string}
 */
export function UniqueRepaymentProfileNames(validationOptions?: ValidationOptions) {
  return function uniqueRepaymentProfileNames(object: object, propertyName: string) {
    registerDecorator({
      name: 'UniqueRepaymentProfileNames',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(repaymentProfiles: GiftRepaymentProfileRequestDto[]) {
          /**
           * If repayment profiles are not provided, the validation of unique names will be skipped.
           * This is because repayment profiles are optional in the facility creation payload.
           * Therefore we only need to validate, if repayment profiles are provided.
           */
          if (!Array.isArray(repaymentProfiles) || !repaymentProfiles.length) {
            return true;
          }

          const profileNames = getRepaymentProfileNames(repaymentProfiles);

          /**
           * Only check for uniqueness amongst names that are otherwise valid (a string of an acceptable length).
           * Otherwise, invalid names (e.g, null, a number, an out of range length) would incorrectly be flagged
           * as "duplicates" of one another, even though they are already flagged by other field validators.
           *
           * NOTE: We must use class-validator's `isLength` (not the native `string.length`), since `isLength`
           * accounts for surrogate pairs (e.g, some emoji). `string.length` counts UTF-16 code units, so e.g, a
           * single emoji can count as 2 - this could cause a name that's valid as per the DTO's `@Length` decorator,
           * to incorrectly be treated as invalid here, and therefore excluded from the uniqueness check.
           */
          const validProfileNames = profileNames.filter((name: unknown): name is string => typeof name === 'string' && isLength(name, MIN_LENGTH, MAX_LENGTH));

          if (validProfileNames.length < 2) {
            return true;
          }

          return arrayHasUniqueStrings(validProfileNames);
        },
        defaultMessage() {
          return `repaymentProfile[] name's must be unique`;
        },
      },
    });
  };
}
