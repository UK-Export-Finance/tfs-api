import { AxiosResponse } from 'axios';

/**
 * Map responses into an array of objects,
 * with each object containing only information from data.eventData.
 * @param {Array<AxiosResponse>} responses
 * @returns {Array<object>}
 */
export const mapResponsesData = (responses: AxiosResponse[]) => responses.map((response: AxiosResponse) => response.data.eventData);
