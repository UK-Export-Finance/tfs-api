import { AxiosRequestConfig } from 'axios';

export const filterAxiosRequestForLogging = (
  config: AxiosRequestConfig,
): Pick<AxiosRequestConfig, 'timeout' | 'headers' | 'maxRedirects' | 'baseURL' | 'url' | 'method' | 'data'> => {
  const { timeout, headers, maxRedirects, baseURL, url, method, data } = config;
  return {
    timeout,
    headers,
    maxRedirects,
    baseURL,
    url,
    method,
    data,
  };
};
