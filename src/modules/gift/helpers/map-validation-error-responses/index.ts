import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { ValidationErrorResponse } from '@ukef/types';
import { AxiosResponse } from 'axios';

const { API_RESPONSE_TYPES } = GIFT;

interface MapValidationErrorResponsesParams {
  entityName: string;
  responses: AxiosResponse[];
}

/**
 * Map responses with an invalid status.
 * An index is also returned to help consumers debug which item in an array has errors.
 * @param {MapValidationErrorResponsesParams}
 * @returns {ValidationErrorResponse[]} Mapped responses that do not have a CREATED status.
 */
export const mapValidationErrorResponses = ({ responses, entityName }: MapValidationErrorResponsesParams): ValidationErrorResponse[] => {
  const mappedAndFiltered: ValidationErrorResponse[] = [];

  responses.forEach(({ data, status }, index) => {
    if (status !== HttpStatus.CREATED) {
      const { message, validationErrors } = data;

      mappedAndFiltered.push({
        entityName,
        index,
        message,
        status,
        type: API_RESPONSE_TYPES.ERROR,
        validationErrors,
      });
    }
  });

  return mappedAndFiltered;
};
