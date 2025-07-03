import { GiftFacilityCreationValidationStrippedPayload } from '@ukef/types';

interface GenerateErrorMessageParams {
  fieldName: string;
  fieldValue: string;
  index: number;
  parentEntityName: string;
  supportedValues: string[];
}

interface GenerateArrayOfErrorsParams {
  fieldName: string;
  fieldValues: string[];
  parentEntityName: string;
  supportedValues: string[];
}

interface GenerateValidationErrorsParams {
  fieldName: string;
  payload: GiftFacilityCreationValidationStrippedPayload;
  supportedValues: string[];
}

/**
 * If a field value is not in the provided supported values,
 * generate an error message from the provided params.
 * @param {GenerateErrorMessageParams}: fieldName, fieldValue, index, parentEntityName, supportedValues
 * @returns {String | undefined}
 */
export const generateErrorMessage = ({ fieldName, fieldValue, index, parentEntityName, supportedValues }: GenerateErrorMessageParams) => {
  if (!supportedValues.includes(fieldValue)) {
    return `${parentEntityName}.${index}.${fieldName} is not supported - ${fieldValue}`;
  }
};

/**
 * Generate an array of errors
 * @param {GenerateArrayOfErrorsParams} fieldName, fieldValues, parentEntityName, supportedValues
 * @returns {String[]}
 */
export const generateArrayOfErrors = ({ fieldName, fieldValues, parentEntityName, supportedValues }: GenerateArrayOfErrorsParams): string[] => {
  const validationErrors = [];

  fieldValues.forEach((fieldValue: string, index: number) => {
    const validationError = generateErrorMessage({
      fieldName,
      fieldValue,
      index,
      parentEntityName,
      supportedValues,
    });

    if (validationError) {
      validationErrors.push(validationError);
    }
  });

  return validationErrors;
};

// TODO
// TODO
// TODO
// review documentation throughout
// add examples
// and param ordering, alphabetical

/**
 * Generate validation errors at a high level for multiple entities.
 * Depending on the provided field name and if values are contained the provided list of supported values.
 * NOTE: Whilst "overview" is part of the payload, overview validation does not occur in this function, as it has a different structure.
 * @param {GenerateValidationErrorsParams} fieldName, payload, supportedValues
 * @returns {String[]} Array of validation errors
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
 * generateHighLevelValidationErrors('currency', payload, supportedValues)
 *
 * [
 *   'fixedFees.2.currency is not supported (EUR)'
 *   'obligations.0.currency is not supported (EUR)'
 * ]
 * ```
 */
export const generateHighLevelErrors = ({ fieldName, payload, supportedValues }: GenerateValidationErrorsParams): string[] => {
  const highlevelErrors = [];

  Object.keys(payload).forEach((parentEntityName) => {
    const entity = payload[`${parentEntityName}`];

    if (Array.isArray(entity)) {
      const errors = generateArrayOfErrors({
        fieldValues: entity,
        supportedValues,
        fieldName,
        parentEntityName,
      });

      highlevelErrors.push(...errors);
    }
  });

  return highlevelErrors;
};
