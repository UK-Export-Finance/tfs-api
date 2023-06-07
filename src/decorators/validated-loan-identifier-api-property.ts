import { ACBSID, EXAMPLES } from '@ukef/constants';

import { ValidatedStringApiProperty } from './validated-string-api-property.decorator';

interface Options {
  description: string;
}

export const ValidatedLoanIdentifierApiProperty = ({ description }: Options) =>
  ValidatedStringApiProperty({
    description,
    length: ACBSID.LOAN_ID.LENGTH,
    pattern: ACBSID.LOAN_ID.REGEX,
    example: EXAMPLES.LOAN_ID,
  });
