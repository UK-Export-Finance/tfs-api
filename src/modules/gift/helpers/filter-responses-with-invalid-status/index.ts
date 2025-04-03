import { AxiosResponse } from 'axios';

interface FilterResponsesWithInvalidStatusParams {
  responses: AxiosResponse[];
  expectedStatus: number;
}

/**
 * Filter responses with an invalid status
 * @param {FilterResponsesWithInvalidStatusParams}
 * @returns {AxiosResponse[]} Responses that do not match an expected status
 */
export const filterResponsesWithInvalidStatus = ({ responses, expectedStatus }: FilterResponsesWithInvalidStatusParams) => {
  const filtered = responses.filter((response) => response.status !== expectedStatus);

  return filtered;
};
