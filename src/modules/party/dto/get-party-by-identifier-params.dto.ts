import { ValidatedPartyIdentifierApiProperty } from '@ukef/decorators/validated-party-identifier-api-property.decorator';
import { AcbsPartyId } from '@ukef/helpers';

export class GetPartyByIdentifierParamsDto {
  @ValidatedPartyIdentifierApiProperty({
    description: 'The ACBS identifier for the party.',
  })
  readonly partyIdentifier: AcbsPartyId;
}
