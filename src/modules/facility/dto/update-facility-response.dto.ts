import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';

export class UpdateFacilityResponse {
  @ValidatedFacilityIdentifierApiProperty({
    description: 'The identifier of the updated facility.',
  })
  readonly facilityIdentifier: string;
}
