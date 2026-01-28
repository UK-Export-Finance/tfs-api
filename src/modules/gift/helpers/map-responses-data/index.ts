import { AxiosResponse } from 'axios';

/**
 * Map an array of axios responses into an array of data objects (data.data)
 * @param {AxiosResponse[]} responses
 * @returns {object[]}
 */
export const mapResponsesData = (responses: AxiosResponse[]) => responses.map((response: AxiosResponse) => response.data?.data);
