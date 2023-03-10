import { AxiosError } from 'axios';
import { catchError, ObservableInput, ObservedValueOf, OperatorFunction } from 'rxjs';

import { AcbsException } from './exception/acbs.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';

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
