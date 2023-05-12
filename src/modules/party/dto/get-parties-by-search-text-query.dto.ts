import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

const stringWithoutWhitespaces = /^\s*\S+\s*$/;

export class GetPartiesBySearchTextQuery {
  @ValidatedStringApiProperty({
    description: 'Parties matching the provided Search Text will be returned. Cannot contain only whitespaces.',
    minLength: 3,
    pattern: stringWithoutWhitespaces,
  })
  searchText: string;
}
