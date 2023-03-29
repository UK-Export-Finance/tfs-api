import { PartyException } from './party-exception';

export class CreatePartyInAcbsFailedException extends PartyException {
  constructor(message: string, innerError?: Error) {
    super(message, innerError);
  }
}
