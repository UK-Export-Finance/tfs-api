import { AcbsException } from './acbs.exception';

export class AcbsResourceNotFoundException extends AcbsException {
  constructor(message: string, innerError?: Error) {
    super(message, innerError);
  }
}
