import { registerDecorator, ValidationOptions } from 'class-validator';

import type { GiftRepaymentProfileRequestDto } from '@ukef/modules/gift/dto';
import { hasUniqueRepaymentProfileNames } from '@ukef/modules/gift/helpers';

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
          return hasUniqueRepaymentProfileNames(repaymentProfiles);
        },
        defaultMessage() {
          return `repaymentProfile[] name's must be unique`;
        },
      },
    });
  };
}
