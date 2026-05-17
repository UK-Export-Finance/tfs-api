import { ValidatedFacilityIdentifiersApiProperty } from '@ukef/decorators/validated-facility-identifiers-api-property';
import { UkefId } from '@ukef/helpers';

/**
 * Facility IDs param.
 */
export class FacilityIdsOperationParamsDto {
  @ValidatedFacilityIdentifiersApiProperty({
    description: 'Facility IDs, comma separated',
  })
  readonly ids: UkefId[];
}
