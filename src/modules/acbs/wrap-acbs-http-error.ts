import { AxiosError } from 'axios';
import { catchError, ObservableInput, ObservedValueOf, OperatorFunction } from 'rxjs';

import { AcbsException } from './exception/acbs.exception';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

export function wrapAcbsHttpError<T, O extends ObservableInput<any>>({
  resourceIdentifier,
  messageForUnknownException,
}: {
  resourceIdentifier: string;
  messageForUnknownException: string;
}): OperatorFunction<T, T | ObservedValueOf<O>> {
  return catchError((error: Error) => {
    if (error instanceof AxiosError && error.response && typeof error.response.data === 'string' && error.response.data.includes('Party not found')) {
      throw new AcbsResourceNotFoundException(`Party with identifier ${resourceIdentifier} was not found by ACBS.`, error);
    }

    throw new AcbsException(messageForUnknownException, error);
  });
}

export function wrapAcbsHttpPostError<T, O extends ObservableInput<any>>({
  resourceIdentifier,
  messageForUnknownException,
}: {
  resourceIdentifier: string;
  messageForUnknownException: string;
}): OperatorFunction<T, T | ObservedValueOf<O>> {
  return catchError((error: Error) => {
    if (!(error instanceof AxiosError) || !error.response || error.response.status !== 400) {
      throw new AcbsUnexpectedException(messageForUnknownException, error);
    }

    if (typeof error.response.data === 'string') {
      if (error.response.data.includes('The deal not found')) {
        throw new AcbsResourceNotFoundException(`Deal with identifier ${resourceIdentifier} was not found by ACBS.`, error);
      }

      if (error.response.data.includes('The facility not found')) {
        throw new AcbsResourceNotFoundException(`Facility with identifier ${resourceIdentifier} was not found by ACBS.`, error);
      }
    }

    throw new AcbsBadRequestException(
      messageForUnknownException,
      error,
      typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data),
    );
  });
}
