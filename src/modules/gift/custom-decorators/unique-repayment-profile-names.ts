import { registerDecorator, ValidationOptions } from 'class-validator';

import { GiftRepaymentProfileDto } from '../dto';
import { arrayHasUniqueStrings, getRepaymentProfileNames } from '../helpers';

/**
 * Custom decorator to check if a provided repayment profile's name is unique.
 * @param {ValidationOptions} options: Class validator's validation options
 * @returns {Boolean | string}
 */
export function UniqueRepaymentProfileNames(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'UniqueRepaymentProfileNames',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(repaymentProfiles: GiftRepaymentProfileDto[]) {
          const profileNames = getRepaymentProfileNames(repaymentProfiles);

          return arrayHasUniqueStrings(profileNames);
        },
        defaultMessage() {
          return `repaymentProfile[] name's must be unique`;
        },
      },
    });
  };
}
