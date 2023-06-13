import { EXAMPLES, UKEFID } from '@ukef/constants';

import { ValidatedStringApiProperty } from './validated-string-api-property.decorator';

interface Options {
  description: string;
}

export const ValidatedPartyIdentifierApiProperty = ({ description }: Options) =>
  ValidatedStringApiProperty({
    description,
    length: 8,
    pattern: UKEFID.PARTY_ID.REGEX,
    example: EXAMPLES.PARTY_ID,
  });
