import { AxiosError } from 'axios';
import { ObservableInput, throwError } from 'rxjs';

import { AcbsException } from './exception/acbs.exception';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';
import { KnownErrors } from './known-errors';

type AcbsHttpErrorCallback = (error: Error) => ObservableInput<never>;

export const createWrapAcbsHttpGetErrorCallback =
  ({ messageForUnknownError, knownErrors }: { messageForUnknownError: string; knownErrors: KnownErrors }): AcbsHttpErrorCallback =>
  (error: Error) => {
    if (error instanceof AxiosError && error.response && typeof error.response.data === 'string') {
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
    if (!(error instanceof AxiosError) || !error.response || error.response.status !== 400) {
      return throwError(() => new AcbsUnexpectedException(messageForUnknownError, error));
    }

    if (typeof error.response.data === 'string') {
      const errorMessageInLowerCase = error.response.data.toLowerCase();
      knownErrors.forEach(({ caseInsensitiveSubstringToFind, throwError }) => {
        if (errorMessageInLowerCase.includes(caseInsensitiveSubstringToFind.toLowerCase())) {
          return throwError(error);
        }
      });
    }

    return throwError(
      () =>
        new AcbsBadRequestException(
          messageForUnknownError,
          error,
          typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data),
        ),
    );
  };
