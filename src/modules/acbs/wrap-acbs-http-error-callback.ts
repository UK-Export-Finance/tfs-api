import { AxiosError } from 'axios';

import { AcbsException } from './exception/acbs.exception';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';
import { KnownErrors } from './known-errors';

type AcbsHttpErrorCallback = (error: Error) => never;

export const createWrapAcbsHttpGetErrorCallback =
  ({ messageForUnknownError, knownErrors }: { messageForUnknownError: string; knownErrors: KnownErrors }): AcbsHttpErrorCallback =>
  (error: Error) => {
    if (error instanceof AxiosError && error.response && typeof error.response.data === 'string' && error.response.data.includes('Party not found')) {
      knownErrors.forEach(({ substringToFind, throwError }) => {
        if (error.response.data.includes(substringToFind)) {
          throwError(error);
        }
      });
    }

    throw new AcbsException(messageForUnknownError, error);
  };

export const createWrapAcbsHttpPostErrorCallback =
  ({ messageForUnknownError, knownErrors }: { messageForUnknownError: string; knownErrors: KnownErrors }): AcbsHttpErrorCallback =>
  (error: Error) => {
    if (!(error instanceof AxiosError) || !error.response || error.response.status !== 400) {
      throw new AcbsUnexpectedException(messageForUnknownError, error);
    }

    if (typeof error.response.data === 'string') {
      knownErrors.forEach(({ substringToFind, throwError }) => {
        if (error.response.data.includes(substringToFind)) {
          throwError(error);
        }
      });
    }

    throw new AcbsBadRequestException(
      messageForUnknownError,
      error,
      typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data),
    );
  };
