import { registerDecorator, ValidationOptions } from 'class-validator';

import { GiftRepaymentProfileRequestDto } from '../dto';
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
        validate(repaymentProfiles: GiftRepaymentProfileRequestDto[]) {
          /**
           * If repayment profiles are not provided, the validation of unique names will be skipped.
           * This is because repayment profiles are optional in the facility creation payload.
           * Therefore we only need to validate, if repayment profiles are provided.
           */
          if (!Array.isArray(repaymentProfiles)) {
            return true;
          }

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
