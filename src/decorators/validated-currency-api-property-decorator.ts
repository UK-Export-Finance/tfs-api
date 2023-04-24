import { EXAMPLES } from '@ukef/constants';

import { ValidatedStringApiProperty } from './validated-string-api-property.decorator';

interface Options {
  description: string;
}

export const ValidatedCurrencyApiProperty = ({ description }: Options) =>
  ValidatedStringApiProperty({
    description,
    example: EXAMPLES.CURRENCY,
    minLength: 3,
    maxLength: 3,
  });
