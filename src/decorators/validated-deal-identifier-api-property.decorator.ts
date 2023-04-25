import { EXAMPLES } from '@ukef/constants';

import { ValidatedStringApiProperty } from './validated-string-api-property.decorator';

interface Options {
  description: string;
}

export const ValidatedDealIdentifierApiProperty = ({ description }: Options) =>
  ValidatedStringApiProperty({
    description,
    length: 10,
    pattern: /^00\d{8}$/,
    example: EXAMPLES.DEAL_ID,
  });