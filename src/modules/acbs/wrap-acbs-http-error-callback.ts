import { AxiosError } from 'axios';

import { AcbsException } from './exception/acbs.exception';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

type AcbsHttpErrorCallback = (error: Error) => never;

export const createWrapAcbsHttpErrorCallback =
  ({ resourceIdentifier, messageForUnknownException }: { resourceIdentifier: string; messageForUnknownException: string }): AcbsHttpErrorCallback =>
  (error: Error) => {
    if (error instanceof AxiosError && error.response && typeof error.response.data === 'string' && error.response.data.includes('Party not found')) {
      throw new AcbsResourceNotFoundException(`Party with identifier ${resourceIdentifier} was not found by ACBS.`, error);
    }

    throw new AcbsException(messageForUnknownException, error);
  };

export const createWrapAcbsHttpPostErrorCallback =
  ({
    messageForUnknownError,
    knownErrors,
  }: {
    messageForUnknownError: string;
    knownErrors: { substringToFind: string; throwError: (error: AxiosError) => never }[];
  }): AcbsHttpErrorCallback =>
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
