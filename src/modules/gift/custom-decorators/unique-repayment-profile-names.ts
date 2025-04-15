import { registerDecorator, ValidationOptions } from 'class-validator';

import { GiftRepaymentProfileDto } from '../dto';
import { getRepaymentProfileNames } from '../helpers';

export function UniqueRepaymentProfileNames(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'UniqueRepaymentProfileNames',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(repaymentProfiles: GiftRepaymentProfileDto[]) {
          const allValues = getRepaymentProfileNames(repaymentProfiles);

          const uniqueValues = [...new Set(allValues)];

          return uniqueValues.length === allValues.length;
        },
        defaultMessage() {
          return `repaymentProfile[] name's must be unique`;
        },
      },
    });
  };
}
