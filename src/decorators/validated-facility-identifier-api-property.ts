import { EXAMPLES, UKEFID } from '@ukef/constants';

import { NullableOption, RequiredOption } from './parse-required-and-nullable-validation.helper';
import { ValidatedStringApiProperty } from './validated-string-api-property.decorator';

interface Options {
  description: string;
  required?: RequiredOption;
  nullable?: NullableOption;
}
/**
 * Decorator for validating a facility identifier string.
 * @param {string} params.description - The description of the facility identifier.
 * @param {RequiredOption} [params.required] - Whether the facility identifier is required.
 * @param {NullableOption} [params.nullable] - Whether the facility identifier can be null.
 * @returns A decorator function that validates a facility identifier string according to the specified options.
 */
export const ValidatedFacilityIdentifierApiProperty = ({ description, required, nullable }: Options) =>
  ValidatedStringApiProperty({
    description,
    length: 10,
    pattern: UKEFID.MAIN_ID.TEN_DIGIT_REGEX,
    example: EXAMPLES.FACILITY_ID,
    required,
    nullable,
  });
