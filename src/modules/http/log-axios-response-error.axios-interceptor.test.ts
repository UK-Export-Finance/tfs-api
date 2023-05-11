import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { when } from 'jest-when';
import { PinoLogger } from 'nestjs-pino';

import { filterAxiosResponseForLogging } from './filter-axios-response-for-logging.helper';
import { logAxiosResponseErrorWith } from './log-axios-response-error.axios-interceptor';
import { AxiosResponseErrorInterceptor } from './type/axios-response-error-interceptor.type';

jest.mock('./filter-axios-response-for-logging.helper');

describe('logAxiosResponseError', () => {
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

  const filteredResponse = {
    data,
    headers,
    status,
    statusText,
  };

  const errorWithoutResponse = new AxiosError('error without response');

  const errorWithResponse = new AxiosError('error with response', undefined, undefined, undefined, response);

  let logger: PinoLogger;
  let logAxiosResponseError: AxiosResponseErrorInterceptor;

  beforeEach(() => {
    logger = new PinoLogger({});
    logger.warn = jest.fn();
    logAxiosResponseError = logAxiosResponseErrorWith(logger);

    (filterAxiosResponseForLogging as jest.Mock).mockReset();
    when(filterAxiosResponseForLogging).calledWith(response).mockReturnValueOnce(filteredResponse);
  });

  it('logs the full error at warn level for an error without a response', async () => {
    await logAxiosResponseError(errorWithoutResponse).catch(() => {});

    expect(logger.warn).toHaveBeenCalledWith(errorWithoutResponse, 'A HTTP server failed to respond to our request.');
  });

  it('logs the filtered response at warn level for an error with a response', async () => {
    await logAxiosResponseError(errorWithResponse).catch(() => {});

    expect(logger.warn).toHaveBeenCalledWith({ response: filteredResponse }, 'A HTTP server responded to our request with an error response.');
  });

  it('rejects with the original error for an error without a response', async () => {
    const logAxiosResponseErrorPromise = logAxiosResponseError(errorWithoutResponse);

    await expect(logAxiosResponseErrorPromise).rejects.toBe(errorWithoutResponse);
  });

  it('rejects with the original error for an error with a response', async () => {
    const logAxiosResponseErrorPromise = logAxiosResponseError(errorWithResponse);

    await expect(logAxiosResponseErrorPromise).rejects.toBe(errorWithResponse);
  });
});
