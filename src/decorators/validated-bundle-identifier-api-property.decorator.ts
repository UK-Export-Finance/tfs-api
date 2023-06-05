import { EXAMPLES, UKEFID } from '@ukef/constants';

import { ValidatedStringApiProperty } from './validated-string-api-property.decorator';

interface Options {
  description: string;
}

export const ValidatedBundleIdentifierApiProperty = ({ description }: Options) =>
  ValidatedStringApiProperty({
    description,
    length: 10,
    pattern: UKEFID.BUNDLE_ID.REGEX,
    example: EXAMPLES.BUNDLE_ID,
  });
