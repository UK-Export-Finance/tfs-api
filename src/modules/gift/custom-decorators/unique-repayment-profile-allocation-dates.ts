import { isDateString, registerDecorator, ValidationOptions } from 'class-validator';

import type { GiftRepaymentProfileRequestDto } from '@ukef/modules/gift/dto';
import { arrayHasUniqueStrings, getRepaymentProfileAllocationDates } from '@ukef/modules/gift/helpers';

/**
 * Custom decorator to check if a provided repayment profile's allocation date is unique.
 * @param {ValidationOptions} options: Class validator's validation options
 * @returns {Boolean | string}
 */
export function UniqueRepaymentProfileAllocationDates(validationOptions?: ValidationOptions) {
  return function uniqueRepaymentProfileAllocationDates(object: object, propertyName: string) {
    registerDecorator({
      name: 'uniqueRepaymentProfileAllocationDates',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(repaymentProfiles: GiftRepaymentProfileRequestDto[]) {
          /**
           * If repayment profiles are not provided, the validation of unique allocation dates will be skipped.
           * This is because repayment profiles are optional in the facility creation payload.
           * Therefore we only need to validate, if repayment profiles are provided.
           */
          if (!Array.isArray(repaymentProfiles) || !repaymentProfiles.length) {
            return true;
          }

          const allocationDates = getRepaymentProfileAllocationDates(repaymentProfiles);

          /**
           * Only check for uniqueness amongst dueDates that are otherwise valid (a valid ISO 8601 date string).
           * Otherwise, invalid dueDates (e.g, null, a number, an empty string) would incorrectly be flagged
           * as "duplicates" of one another, even though they are already flagged by other field validators.
           */
          const validAllocationDates = allocationDates.filter((dueDate: unknown): dueDate is string => typeof dueDate === 'string' && isDateString(dueDate));

          if (validAllocationDates.length < 2) {
            return true;
          }

          return arrayHasUniqueStrings(validAllocationDates);
        },
        defaultMessage() {
          return `repaymentProfile[].allocation[] dueDate's must be unique`;
        },
      },
    });
  };
}
