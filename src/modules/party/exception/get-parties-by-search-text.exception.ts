import { PartyException } from './party-exception';

export class GetPartiesBySearchTextException extends PartyException {
  constructor(message: string, innerError?: Error) {
    super(message, innerError);
  }
}
