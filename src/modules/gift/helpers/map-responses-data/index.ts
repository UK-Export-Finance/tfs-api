import { AxiosResponse } from 'axios';

import { mapResponseData } from '@ukef/modules/gift/helpers/map-response-data';

/**
 * Map an array of axios responses into an array of data objects (data.data)
 * @param {AxiosResponse[]} responses
 * @returns {object[]}
 */
export const mapResponsesData = (responses: AxiosResponse[]) => responses.map((response: AxiosResponse) => mapResponseData(response));
