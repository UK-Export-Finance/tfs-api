import { ExecutionContext } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { lastValueFrom, of } from 'rxjs';
import { AcbsBadRequestException } from '@ukef/modules/acbs/exception/acbs-bad-request.exception';
import { HttpArgumentsHost } from '@ukef/types';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { LoggingInterceptor } from './logging-interceptor.helper';

describe('LoggingInterceptor', () => {
  const valueGenerator = new RandomValueGenerator();

  const requestBody = {
    field1: valueGenerator.string(),
    field2: valueGenerator.nonnegativeFloat(),
  };

  const responseBody = {
    field3: valueGenerator.string(),
    field4: valueGenerator.nonnegativeFloat(),
  };

  const info = jest.fn();
  const logger = {
    info,
  } as unknown as PinoLogger;

  const interceptor: LoggingInterceptor = new LoggingInterceptor(logger);

  beforeEach(() => {
    info.mockReset();
  });

  const runInterceptor = (
    requestBodyToIntercept: unknown,
    responseBodyToIntercept: unknown,
    next = { handle: () => of(responseBodyToIntercept) },
  ): Promise<unknown> => {
    const context = {
      switchToHttp: () =>
        ({
          getRequest: <T>() =>
            ({
              body: requestBodyToIntercept,
            }) as T,
        }) as HttpArgumentsHost,
    } as ExecutionContext;
    try {
      const interceptObservable = interceptor.intercept(context, next);
      return lastValueFrom(interceptObservable);
    } catch {
      return Promise.resolve(undefined);
    }
  };

  describe('intercept', () => {
    describe('when the intercepted data contains neither responseBody nor warningErrors', () => {
      const requestMessage = 'Handling the following request from the client.';
      const responseMessage = 'Returning the following response to the client.';

      it('calls logger with input data and again with output data', async () => {
        await runInterceptor(requestBody, responseBody);

        expect(logger.info).toHaveBeenCalledTimes(2);
        expect(logger.info).toHaveBeenNthCalledWith(1, { requestBody }, requestMessage);
        expect(logger.info).toHaveBeenNthCalledWith(2, { responseBody }, responseMessage);
      });

      it('calls logger with input data as undefined and again with output data as undefined', async () => {
        const modifiedRequestBody = undefined;
        const modifiedResponseBody = undefined;
        await runInterceptor(modifiedRequestBody, modifiedResponseBody);

        expect(logger.info).toHaveBeenCalledTimes(2);
        expect(logger.info).toHaveBeenNthCalledWith(1, { requestBody: modifiedRequestBody }, requestMessage);
        expect(logger.info).toHaveBeenNthCalledWith(2, { responseBody: modifiedResponseBody }, responseMessage);
      });

      it('calls logger with input data as null and again with output data as null', async () => {
        const modifiedRequestBody = null;
        const modifiedResponseBody = null;
        await runInterceptor(modifiedRequestBody, modifiedResponseBody);

        expect(logger.info).toHaveBeenCalledTimes(2);
        expect(logger.info).toHaveBeenNthCalledWith(1, { requestBody: modifiedRequestBody }, requestMessage);
        expect(logger.info).toHaveBeenNthCalledWith(2, { responseBody: modifiedResponseBody }, responseMessage);
      });

      it('calls logger with input data and again with output data even if output is empty', async () => {
        const modifiedResponseBody = [];
        await runInterceptor(requestBody, modifiedResponseBody);

        expect(logger.info).toHaveBeenCalledTimes(2);
        expect(logger.info).toHaveBeenNthCalledWith(1, { requestBody }, requestMessage);
        expect(logger.info).toHaveBeenNthCalledWith(2, { responseBody: modifiedResponseBody }, responseMessage);
      });

      it('calls logger with input data and again with output data even if output is null', async () => {
        const modifiedResponseBody = null;
        await runInterceptor(requestBody, modifiedResponseBody);

        expect(logger.info).toHaveBeenCalledTimes(2);
        expect(logger.info).toHaveBeenNthCalledWith(1, { requestBody }, requestMessage);
        expect(logger.info).toHaveBeenNthCalledWith(2, { responseBody: modifiedResponseBody }, responseMessage);
      });

      it('calls logger with input data and again with output data even if output is undefined', async () => {
        const modifiedResponseBody = undefined;
        await runInterceptor(requestBody, modifiedResponseBody);

        expect(logger.info).toHaveBeenCalledTimes(2);
        expect(logger.info).toHaveBeenNthCalledWith(1, { requestBody }, requestMessage);
        expect(logger.info).toHaveBeenNthCalledWith(2, { responseBody: modifiedResponseBody }, responseMessage);
      });

      it('calls logger with input data as undefined and again with output data', async () => {
        const modifiedRequestBody = undefined;
        await runInterceptor(modifiedRequestBody, responseBody);

        expect(logger.info).toHaveBeenCalledTimes(2);
        expect(logger.info).toHaveBeenNthCalledWith(1, { requestBody: modifiedRequestBody }, requestMessage);
        expect(logger.info).toHaveBeenNthCalledWith(2, { responseBody }, responseMessage);
      });

      it('calls logger with input data as null and again with output data', async () => {
        const modifiedRequestBody = null;
        await runInterceptor(modifiedRequestBody, responseBody);

        expect(logger.info).toHaveBeenCalledTimes(2);
        expect(logger.info).toHaveBeenNthCalledWith(1, { requestBody: modifiedRequestBody }, requestMessage);
        expect(logger.info).toHaveBeenNthCalledWith(2, { responseBody }, responseMessage);
      });

      it('calls logger with input data and exceptions are not logged', async () => {
        const next = {
          handle: () => {
            throw new AcbsBadRequestException(valueGenerator.string());
          },
        };
        await runInterceptor(requestBody, responseBody, next);

        expect(logger.info).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenNthCalledWith(1, { requestBody }, requestMessage);
      });
    });
  });
});
