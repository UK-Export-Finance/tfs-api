import { ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { lastValueFrom, of } from 'rxjs';

import { WarningErrorsHeaderInterceptor } from './warning-errors-header.interceptor';

describe('WarningErrorsInterceptor', () => {
  const valueGenerator = new RandomValueGenerator();

  let context: ExecutionContext;
  let setResponseHeaders: jest.Mock;

  let interceptor: WarningErrorsHeaderInterceptor;

  beforeEach(() => {
    setResponseHeaders = jest.fn();
    context = {
      switchToHttp: () =>
        ({
          getResponse: <T>() =>
            ({
              setHeader: setResponseHeaders,
            } as T),
        } as HttpArgumentsHost),
    } as ExecutionContext;
    interceptor = new WarningErrorsHeaderInterceptor();
  });

  describe('intercept', () => {
    describe('when the intercepted data contains neither responseBody nor warningErrors', () => {
      let dataWithoutResponseBodyOrWarningErrors: any;

      beforeEach(() => {
        dataWithoutResponseBodyOrWarningErrors = {
          notResponseBody: {
            field1: valueGenerator.string(),
            field2: valueGenerator.nonnegativeFloat(),
          },
          notWarningErrors: valueGenerator.boolean(),
        };
      });

      it('does not set the response headers', async () => {
        await dataAfterIntercepting(dataWithoutResponseBodyOrWarningErrors);

        expect(setResponseHeaders).not.toHaveBeenCalled();
      });

      it('does not transform the data', async () => {
        const dataAfterInterceptingPromise = dataAfterIntercepting(dataWithoutResponseBodyOrWarningErrors);

        await expect(dataAfterInterceptingPromise).resolves.toBe(dataWithoutResponseBodyOrWarningErrors);
      });
    });

    describe('when the intercepted data contains both responseBody and warningErrors', () => {
      const warningErrors = valueGenerator.string();

      let responseBody: any;
      let dataWithResponseBodyAndWarningErrors: any;

      beforeEach(() => {
        responseBody = {
          field1: valueGenerator.string(),
          field2: valueGenerator.nonnegativeFloat(),
        };
        dataWithResponseBodyAndWarningErrors = {
          responseBody,
          warningErrors,
        };
      });

      it('sets the processing-warning response header to the value of warningErrors', async () => {
        await dataAfterIntercepting(dataWithResponseBodyAndWarningErrors);

        expect(setResponseHeaders).toHaveBeenCalledWith('processing-warning', warningErrors);
      });

      it('selects the responseBody from the data', async () => {
        const dataAfterInterceptingPromise = dataAfterIntercepting(dataWithResponseBodyAndWarningErrors);

        await expect(dataAfterInterceptingPromise).resolves.toBe(responseBody);
      });
    });

    describe('when the data contains responseBody but not warningErrors', () => {
      let responseBody: any;
      let dataWithResponseBodyAndNotWarningErrors: any;

      beforeEach(() => {
        responseBody = {
          field1: valueGenerator.string(),
          field2: valueGenerator.nonnegativeFloat(),
        };
        dataWithResponseBodyAndNotWarningErrors = {
          responseBody,
          notWarningErrors: valueGenerator.string(),
        };
      });

      it('does not set the response headers', async () => {
        await dataAfterIntercepting(dataWithResponseBodyAndNotWarningErrors);

        expect(setResponseHeaders).not.toHaveBeenCalled();
      });

      it('selects the responseBody from the data', async () => {
        const dataAfterInterceptingPromise = dataAfterIntercepting(dataWithResponseBodyAndNotWarningErrors);

        await expect(dataAfterInterceptingPromise).resolves.toBe(responseBody);
      });
    });

    describe('when the data contains warningErrors but not responseBody', () => {
      let dataWithWarningErrorsAndNotResponseBody: any;

      beforeEach(() => {
        dataWithWarningErrorsAndNotResponseBody = {
          notResponseBody: {
            field1: valueGenerator.string(),
            field2: valueGenerator.nonnegativeFloat(),
          },
          warningErrors: valueGenerator.string(),
        };
      });

      it('does not set the response headers', async () => {
        await dataAfterIntercepting(dataWithWarningErrorsAndNotResponseBody);

        expect(setResponseHeaders).not.toHaveBeenCalled();
      });

      it('does not transform the data', async () => {
        const dataAfterInterceptingPromise = dataAfterIntercepting(dataWithWarningErrorsAndNotResponseBody);

        await expect(dataAfterInterceptingPromise).resolves.toBe(dataWithWarningErrorsAndNotResponseBody);
      });
    });
  });

  const dataAfterIntercepting = (dataToIntercept: unknown): Promise<unknown> => {
    const next = { handle: () => of(dataToIntercept) };
    const interceptObservable = interceptor.intercept(context, next);
    return lastValueFrom(interceptObservable);
  };
});
