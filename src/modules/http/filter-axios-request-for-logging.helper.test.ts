import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosRequestConfig } from 'axios';

import { filterAxiosRequestForLogging } from './filter-axios-request-for-logging.helper';

describe('filterAxiosRequestForLogging', () => {
  const valueGenerator = new RandomValueGenerator();
  const timeout = valueGenerator.nonnegativeInteger();
  const headers = { Accept: 'application/json' };
  const maxRedirects = valueGenerator.nonnegativeInteger();
  const baseURL = valueGenerator.httpsUrl();
  const url = '/some-url';
  const method = 'post';
  const data = {
    someNumber: valueGenerator.nonnegativeFloat(),
  };

  const request: AxiosRequestConfig = {
    timeout,
    headers,
    maxRedirects,
    baseURL,
    url,
    method,
    data,
    transformRequest: jest.fn(),
    transformResponse: jest.fn(),
  };

  it('returns only the timeout, headers, maxRedirects, baseURL, url, method, and data of the request', () => {
    expect(filterAxiosRequestForLogging(request)).toStrictEqual({
      timeout,
      headers,
      maxRedirects,
      baseURL,
      url,
      method,
      data,
    });
  });
});
