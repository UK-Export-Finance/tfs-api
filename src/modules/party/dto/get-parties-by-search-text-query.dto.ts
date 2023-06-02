import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

const endsInAWhitespaceCharacter = /\S$/;

export class GetPartiesBySearchTextQuery {
  @ValidatedStringApiProperty({
    description:
      'Parties matching the provided Search Text will be returned. It must end in a non-whitespace character, but leading whitespace characters are allowed and will be included in the search.',
    minLength: 3,
    pattern: endsInAWhitespaceCharacter,
  })
  searchText: string;
}
