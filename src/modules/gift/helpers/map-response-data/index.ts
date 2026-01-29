import { AxiosResponse } from 'axios';

/**
 * Map an axios response into a data object (data.data).
 * @param {AxiosResponse} response
 * @returns {object}
 */
export const mapResponseData = (response: AxiosResponse) => response.data?.data;
