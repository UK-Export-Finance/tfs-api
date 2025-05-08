import { registerDecorator, ValidationOptions } from 'class-validator';

import { GiftRepaymentProfileDto } from '../dto';
import { arrayHasUniqueStrings, getRepaymentProfileAllocationDates } from '../helpers';

export function UniqueRepaymentProfileAllocationDates(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'uniqueRepaymentProfileAllocationDates',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(repaymentProfiles: GiftRepaymentProfileDto[]) {
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
