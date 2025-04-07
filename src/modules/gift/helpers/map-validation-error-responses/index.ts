import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';

const { API_RESPONSE_TYPES } = GIFT;

interface FilterResponsesWithInvalidStatusParams {
  entityName: string;
  responses: AxiosResponse[];
}

interface ExtendedAxiosResponse extends AxiosResponse {
  entityName: string;
  index: number;
  message: string;
}

/**
 * Map responses with an invalid status.
 * An index is also returned to help consumers debug which item in an array has errors.
 * @param {FilterResponsesWithInvalidStatusParams}
 * @returns {ExtendedAxiosResponse[]} Mapped responses that do not match an expected status
 */
export const mapValidationErrorResponses = ({ responses, entityName }: FilterResponsesWithInvalidStatusParams): ExtendedAxiosResponse[] => {
  const mappedAndFiltered = [];

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
