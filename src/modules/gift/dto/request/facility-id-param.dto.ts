import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { UkefId } from '@ukef/helpers';

/**
 * Facility ID param.
 */
export class FacilityIdOperationParamsDto {
  @ValidatedFacilityIdentifierApiProperty({
    description: 'The facility ID',
  })
  readonly facilityId: UkefId;
}
