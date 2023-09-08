import { ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { AcbsBadRequestException } from '@ukef/modules/acbs/exception/acbs-bad-request.exception';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { PinoLogger } from 'nestjs-pino';
import { lastValueFrom, of } from 'rxjs';

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

  const debug = jest.fn();
  const logger = {
    debug,
  } as unknown as PinoLogger;

  const interceptor: LoggingInterceptor = new LoggingInterceptor(logger);

  beforeEach(() => {
    debug.mockReset();
  });

  describe('intercept', () => {
    describe('when the intercepted data contains neither responseBody nor warningErrors', () => {
      const requestMessage = 'Handling the following request from the client.';
      const responseMessage = 'Returning the following response to the client.';

      it('calls logger with input data and again with output data', async () => {
        await runInterceptor(requestBody, responseBody);

        expect(logger.debug).toHaveBeenCalledTimes(2);
        expect(logger.debug).toHaveBeenNthCalledWith(1, { requestBody }, requestMessage);
        expect(logger.debug).toHaveBeenNthCalledWith(2, { responseBody }, responseMessage);
      });

      it('calls logger with input data as undefined and again with output data as undefined', async () => {
        const modifiedRequestBody = undefined;
        const modifiedResponseBody = undefined;
        await runInterceptor(modifiedRequestBody, modifiedResponseBody);

        expect(logger.debug).toHaveBeenCalledTimes(2);
        expect(logger.debug).toHaveBeenNthCalledWith(1, { requestBody: modifiedRequestBody }, requestMessage);
        expect(logger.debug).toHaveBeenNthCalledWith(2, { responseBody: modifiedResponseBody }, responseMessage);
      });

      it('calls logger with input data as null and again with output data as null', async () => {
        const modifiedRequestBody = null;
        const modifiedResponseBody = null;
        await runInterceptor(modifiedRequestBody, modifiedResponseBody);

        expect(logger.debug).toHaveBeenCalledTimes(2);
        expect(logger.debug).toHaveBeenNthCalledWith(1, { requestBody: modifiedRequestBody }, requestMessage);
        expect(logger.debug).toHaveBeenNthCalledWith(2, { responseBody: modifiedResponseBody }, responseMessage);
      });

      it('calls logger with input data and again with output data even if output is empty', async () => {
        const modifiedResponseBody = [];
        await runInterceptor(requestBody, modifiedResponseBody);

        expect(logger.debug).toHaveBeenCalledTimes(2);
        expect(logger.debug).toHaveBeenNthCalledWith(1, { requestBody }, requestMessage);
        expect(logger.debug).toHaveBeenNthCalledWith(2, { responseBody: modifiedResponseBody }, responseMessage);
      });

      it('calls logger with input data and again with output data even if output is null', async () => {
        const modifiedResponseBody = null;
        await runInterceptor(requestBody, modifiedResponseBody);

        expect(logger.debug).toHaveBeenCalledTimes(2);
        expect(logger.debug).toHaveBeenNthCalledWith(1, { requestBody }, requestMessage);
        expect(logger.debug).toHaveBeenNthCalledWith(2, { responseBody: modifiedResponseBody }, responseMessage);
      });

      it('calls logger with input data and again with output data even if output is undefined', async () => {
        const modifiedResponseBody = undefined;
        await runInterceptor(requestBody, modifiedResponseBody);

        expect(logger.debug).toHaveBeenCalledTimes(2);
        expect(logger.debug).toHaveBeenNthCalledWith(1, { requestBody }, requestMessage);
        expect(logger.debug).toHaveBeenNthCalledWith(2, { responseBody: modifiedResponseBody }, responseMessage);
      });

      it('calls logger with input data as undefined and again with output data', async () => {
        const modifiedRequestBody = undefined;
        await runInterceptor(modifiedRequestBody, responseBody);

        expect(logger.debug).toHaveBeenCalledTimes(2);
        expect(logger.debug).toHaveBeenNthCalledWith(1, { requestBody: modifiedRequestBody }, requestMessage);
        expect(logger.debug).toHaveBeenNthCalledWith(2, { responseBody }, responseMessage);
      });

      it('calls logger with input data as null and again with output data', async () => {
        const modifiedRequestBody = null;
        await runInterceptor(modifiedRequestBody, responseBody);

        expect(logger.debug).toHaveBeenCalledTimes(2);
        expect(logger.debug).toHaveBeenNthCalledWith(1, { requestBody: modifiedRequestBody }, requestMessage);
        expect(logger.debug).toHaveBeenNthCalledWith(2, { responseBody }, responseMessage);
      });

      it('calls logger with input data and exceptions are not logged', async () => {
        const next = {
          handle: () => {
            throw new AcbsBadRequestException(valueGenerator.string());
          },
        };
        await runInterceptor(requestBody, responseBody, next);

        expect(logger.debug).toHaveBeenCalledTimes(1);
        expect(logger.debug).toHaveBeenNthCalledWith(1, { requestBody }, requestMessage);
      });
    });
  });

  const runInterceptor = (requestBody: unknown, responseBody: unknown, next = { handle: () => of(responseBody) }): Promise<unknown> => {
    const context = {
      switchToHttp: () =>
        ({
          getRequest: <T>() =>
            ({
              body: requestBody,
            } as T),
        } as HttpArgumentsHost),
    } as ExecutionContext;
    try {
      const interceptObservable = interceptor.intercept(context, next);
      return lastValueFrom(interceptObservable);
    } catch (err) {}
  };
});
