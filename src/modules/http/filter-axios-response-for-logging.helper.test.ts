import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { filterAxiosResponseForLogging } from './filter-axios-response-for-logging.helper';

describe('filterAxiosResponseForLogging', () => {
  const valueGenerator = new RandomValueGenerator();
  const data = {
    someNumber: valueGenerator.nonnegativeFloat(),
  };
  const headers = { Accept: 'application/json' };
  const status = 200;
  const statusText = 'ok';

  const response: AxiosResponse = {
    data,
    headers,
    status,
    statusText,
    config: {} as InternalAxiosRequestConfig,
    request: {},
  };

  it('returns only the data, headers, status, statusText of the response', () => {
    expect(filterAxiosResponseForLogging(response)).toStrictEqual({
      data,
      headers,
      status,
      statusText,
    });
  });
});
