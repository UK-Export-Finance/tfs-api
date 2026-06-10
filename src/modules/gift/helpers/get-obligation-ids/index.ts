import { AxiosResponse } from 'axios';

/**
 * Helper function to extract obligation IDs from an array of Axios responses.
 * @param {AxiosResponse[]} obligationsResponse: An array of Axios responses containing obligation data
 * @returns {number[]} An array of obligation IDs
 */
export const getObligationIds = (obligationsResponse: AxiosResponse[]) => obligationsResponse.map((obligation) => obligation?.data?.id);
