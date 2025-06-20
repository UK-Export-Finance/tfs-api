import { registerDecorator, ValidationOptions } from 'class-validator';

import { GiftRepaymentProfileRequestDto } from '../dto';
import { arrayHasUniqueStrings, getRepaymentProfileAllocationDates } from '../helpers';

/**
 * Custom decorator to check if a provided repayment profile's allocation date is unique.
 * @param {ValidationOptions} options: Class validator's validation options
 * @returns {Boolean | string}
 */
export function UniqueRepaymentProfileAllocationDates(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'uniqueRepaymentProfileAllocationDates',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(repaymentProfiles: GiftRepaymentProfileRequestDto[]) {
          const allocationDates = getRepaymentProfileAllocationDates(repaymentProfiles);

          return arrayHasUniqueStrings(allocationDates);
        },
        defaultMessage() {
          return `repaymentProfile[].allocation[] dueDate's must be unique`;
        },
      },
    });
  };
}
