import { registerDecorator, ValidationOptions } from 'class-validator';

import { GiftFacilityCounterpartyRequestDto } from '../dto';
import { arrayHasUniqueStrings, getCounterpartyUrns } from '../helpers';

/**
 * Custom decorator to check if a provided counterparty URN is unique.
 * @param {ValidationOptions} options: Class validator's validation options
 * @returns {Boolean | string}
 */
export function UniqueCounterpartyUrns(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'UniqueCounterpartyUrns',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(counterparties: GiftFacilityCounterpartyRequestDto[]) {
          const profileNames = getCounterpartyUrns(counterparties);

          return arrayHasUniqueStrings(profileNames);
        },
        defaultMessage() {
          return `counterparty[] URN's must be unique`;
        },
      },
    });
  };
}
