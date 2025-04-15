import { registerDecorator, ValidationOptions } from 'class-validator';

import { GiftRepaymentProfileDto } from '../dto';
import { getRepaymentProfileAllocationDates } from '../helpers';

export function UniqueRepaymentProfileAllocationDates(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'uniqueRepaymentProfileAllocationDates',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(repaymentProfiles: GiftRepaymentProfileDto[]) {
          const allValues = getRepaymentProfileAllocationDates(repaymentProfiles);

          const uniqueValues = [...new Set(allValues)];

          return uniqueValues.length === allValues.length;
        },
        defaultMessage() {
          return `repaymentProfile[].allocation[] dueDate's must be unique`;
        },
      },
    });
  };
}
