import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { UkefId } from '@ukef/helpers';

/**
 * Get facility params.
 */
export class GetFacilityOperationParamsDto {
  @ValidatedFacilityIdentifierApiProperty({
    description: 'The facility ID',
  })
  readonly facilityId: UkefId;
}
