import { HttpStatus } from '@nestjs/common';
import { AxiosResponse } from 'axios';

interface FilterResponsesWithInvalidStatusParams {
  entity: string;
  responses: AxiosResponse[];
}

interface ExtendedAxiosResponse extends AxiosResponse {
  entity: string;
  index: number;
}

/**
 * Map responses with an invalid status.
 * An index is also returned to help consumers debug which item in an array has errors.
 * @param {FilterResponsesWithInvalidStatusParams}
 * @returns {ExtendedAxiosResponse[]} Mapped responses that do not match an expected status
 */
export const mapValidationErrorResponses = ({ responses, entity }: FilterResponsesWithInvalidStatusParams): ExtendedAxiosResponse[] => {
  const mappedAndFiltered = [];

  responses.forEach(({ data, status }, index) => {
    if (status !== HttpStatus.CREATED) {
      mappedAndFiltered.push({
        type: 'api-error-response',
        entity,
        index,
        messages: data.validationErrors,
      });
    }
  });

  return mappedAndFiltered;
};
