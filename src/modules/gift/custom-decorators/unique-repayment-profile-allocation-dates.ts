import { registerDecorator, ValidationOptions } from 'class-validator';

import type { GiftRepaymentProfileRequestDto } from '@ukef/modules/gift/dto';
import { hasUniqueRepaymentProfileAllocationDates } from '@ukef/modules/gift/helpers';

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
          return hasUniqueRepaymentProfileAllocationDates(repaymentProfiles);
        },
        defaultMessage() {
          return `repaymentProfile[].allocation[] dueDate's must be unique`;
        },
      },
    });
  };
}
