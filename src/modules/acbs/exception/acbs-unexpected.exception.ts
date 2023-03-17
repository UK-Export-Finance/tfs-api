import { AcbsException } from './acbs.exception';

export class AcbsUnexpectedException extends AcbsException {
  constructor(message: string, innerError?: Error) {
    super(message, innerError);
  }
}
