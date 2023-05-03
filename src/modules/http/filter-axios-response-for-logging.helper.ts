import { AxiosResponse } from 'axios';

export const filterAxiosResponseForLogging = (response: AxiosResponse): Pick<AxiosResponse, 'data' | 'headers' | 'status' | 'statusText'> => {
  const { data, headers, status, statusText } = response;
  return {
    data,
    headers,
    status,
    statusText,
  };
};
