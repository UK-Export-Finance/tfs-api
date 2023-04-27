import { EXAMPLES, UKEFID } from '@ukef/constants';

import { ValidatedStringApiProperty } from './validated-string-api-property.decorator';

interface Options {
  description: string;
}

export const ValidatedDealIdentifierApiProperty = ({ description }: Options) =>
  ValidatedStringApiProperty({
    description,
    length: 10,
    pattern: UKEFID.MAIN_ID.TEN_DIGIT_REGEX,
    example: EXAMPLES.DEAL_ID,
  });
