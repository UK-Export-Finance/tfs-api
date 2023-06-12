import { ValidatedPartyIdentifierApiProperty } from '@ukef/decorators/validated-party-identifier-api-property.decorator';

export class GetPartyByIdentifierParamsDto {
  @ValidatedPartyIdentifierApiProperty({ description: 'The ACBS identifier for the party.' })
  readonly partyIdentifier: string;
}
