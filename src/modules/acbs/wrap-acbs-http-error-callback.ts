import { isAxiosError } from 'axios';
import { ObservableInput, throwError } from 'rxjs';

import { AcbsException } from './exception/acbs.exception';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { KnownErrors } from './known-errors';

type AcbsHttpErrorCallback = (error: Error) => ObservableInput<never>;

/**
 * NOTE: axios ships separate CJS and ESM builds (its package.json "exports" map
 * resolves `require` and `import` to different files), so an `AxiosError` thrown
 * by @nestjs/axios's ESM-based HttpService is not an `instanceof` the `AxiosError`
 * class resolved via this file's (CJS-compiled) import. `isAxiosError` is a duck-typing
 * check (`error.isAxiosError === true`) that works regardless of which build constructed the error.
 * @param {Object} params
 * @param {string} params.messageForUnknownError
 * @param {KnownErrors} params.knownErrors
 * @returns {AcbsHttpErrorCallback} The error callback function for handling ACBS HTTP errors.
 */
export const createWrapAcbsHttpGetErrorCallback =
  ({ messageForUnknownError, knownErrors }: { messageForUnknownError: string; knownErrors: KnownErrors }): AcbsHttpErrorCallback =>
  (error: Error) => {
    if (isAxiosError<string>(error) && error.response && typeof error.response.data === 'string') {
      const errorMessageInLowerCase = error.response.data.toLowerCase();
      knownErrors.forEach(({ caseInsensitiveSubstringToFind, throwError }) => {
        if (errorMessageInLowerCase.includes(caseInsensitiveSubstringToFind.toLowerCase())) {
          return throwError(error);
        }
      });
    }

    return throwError(() => new AcbsException(messageForUnknownError, error));
  };

export const createWrapAcbsHttpPostOrPutErrorCallback =
  ({ messageForUnknownError, knownErrors }: { messageForUnknownError: string; knownErrors: KnownErrors }): AcbsHttpErrorCallback =>
  (error: Error) => {
    if (!isAxiosError<string>(error) || !error.response || error.response.status !== 400) {
      return throwError(() => new AcbsException(messageForUnknownError, error));
    }

    if (typeof error.response.data === 'string') {
      const errorMessageInLowerCase = error.response.data.toLowerCase();
      knownErrors.forEach(({ caseInsensitiveSubstringToFind, throwError }) => {
        if (errorMessageInLowerCase.includes(caseInsensitiveSubstringToFind.toLowerCase())) {
          return throwError(error);
        }
      });
    }

    const { data } = error.response;

    return throwError(() => new AcbsBadRequestException(messageForUnknownError, error, typeof data === 'string' ? data : JSON.stringify(data)));
  };
