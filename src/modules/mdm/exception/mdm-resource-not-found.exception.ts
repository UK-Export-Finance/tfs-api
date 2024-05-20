import { MdmException } from './mdm.exception';

export class MdmResourceNotFoundException extends MdmException {
  constructor(
    message: string,
    public readonly innerError?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
