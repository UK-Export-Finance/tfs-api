import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { UkefId } from '@ukef/helpers';

export class UpdateFacilityByOperationParamsDto {
  @ValidatedFacilityIdentifierApiProperty({
    description: 'The identifier of the facility to update.',
  })
  readonly facilityIdentifier: UkefId;
}
