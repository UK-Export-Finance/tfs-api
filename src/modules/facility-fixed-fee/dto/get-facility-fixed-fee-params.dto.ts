import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { UkefId } from '@ukef/helpers';

export class GetFacilityFixedFeeParamsDto {
  @ValidatedFacilityIdentifierApiProperty({
    description: 'The identifier of the facility in ACBS.',
  })
  facilityIdentifier: UkefId;
}
