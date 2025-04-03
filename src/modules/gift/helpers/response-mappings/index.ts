import { HttpStatus } from '@nestjs/common';
import { AxiosResponse } from 'axios';

interface GiftValidationError {
  message: string;
}

/**
 * Create a "bad request" object.
 * This is for APIM TFS services that call multiple GIFT endpoints.
 * This allows us to return multiple, concise validation errors in a single response.
 * @param {Array<AxiosResponse>} responses
 * @returns {Object}
 */
export const createBadRequestObject = (responses: AxiosResponse[]) => ({
  status: HttpStatus.BAD_REQUEST,
  statusText: 'Bad request',
  validationErrors: mapErrorResponses(responses),
});

/**
 * Map validation responses received from GIFT into a simpler, concise structure.
 * @param {Array<AxiosResponse>} responses
 * @returns {Array<object>}
 */
export const mapErrorResponses = (responses: AxiosResponse[]) =>
  responses.map(({ data }) => ({
    path: data.path,
    messages: data.validationErrors.map((error: GiftValidationError) => error.message),
  }));

/**
 * Map responses into an array of objects,
 * with each object containing only the data property.
 * @param {Array<AxiosResponse>} responses
 * @returns {Array<object>}
 */
export const mapResponsesData = (responses: AxiosResponse[]) => responses.map((response: AxiosResponse) => response.data);
