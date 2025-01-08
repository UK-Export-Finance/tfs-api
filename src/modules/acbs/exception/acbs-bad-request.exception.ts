import { AcbsException } from './acbs.exception';

export class AcbsBadRequestException extends AcbsException {
  constructor(
    message: string,
    innerError?: Error,
    public readonly errorBody?: string,
  ) {
    super(message, innerError);
  }
}
