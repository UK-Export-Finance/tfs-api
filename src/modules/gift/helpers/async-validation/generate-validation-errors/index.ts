import { GiftFacilityCreationValidationStrippedPayload } from '@ukef/types';

interface GenerateMessageParams {
  parentEntityName: string;
  fieldName: string;
  fieldValue: string;
  index: number;
}

/**
 * Generate a validation error message from the provided params
 * @param {GenerateMessageParams}: parentEntityName, fieldName, fieldValue, index
 * @returns {String}
 */
export const generateMessage = ({ parentEntityName, fieldName, fieldValue, index }: GenerateMessageParams) =>
  `${parentEntityName}.${index}.${fieldName} is not supported (${fieldValue})`;

/**
 * Generate validation errors for multiple entities,
 * that have values not contained in a provided list of supported values.
 * NOTE: Whilst "overview" is part of the payload, overview validation does not occur in this function, as it has a different structure.
 * @param {GiftFacilityCreationValidationStrippedPayload} payload: A stripped payload
 * @param {String[]} supportedValues: Supported values
 * @param {String} fieldName: Field name to assert.
 * @returns {String[]} Validation errors
 * @example
 * ```ts
 * const payload = {
 *   overview: 'EUR',
 *   fixedFees: ['GBP', 'USD', 'EUR']
 *   obligations: ['EUR', 'USD']
 * }
 *
 * const supportedValues = ['GBP', 'USD'];
 *
 * generateValidationErrors(payload, supportedValues, 'currency')
 *
 * [
 *   'fixedFees.2.currency is not supported (EUR)'
 *   'obligations.0.currency is not supported (EUR)'
 * ]
 * ```
 */
export const generateValidationErrors = (payload: GiftFacilityCreationValidationStrippedPayload, supportedValues: string[], fieldName: string): string[] => {
  const validationErrors = [];

  Object.keys(payload).forEach((parentEntityName) => {
    const entity = payload[`${parentEntityName}`];

    if (Array.isArray(entity)) {
      entity.forEach((fieldValue: string, index: number) => {
        if (!supportedValues.includes(fieldValue)) {
          const errorMessage = generateMessage({
            parentEntityName,
            fieldName,
            fieldValue,
            index,
          });

          validationErrors.push(errorMessage);
        }
      });
    }
  });

  return validationErrors;
};
