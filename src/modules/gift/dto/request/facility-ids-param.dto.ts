import { ValidatedFacilitiesIdentifiersApiProperty } from '@ukef/decorators/validated-facilities-identifiers-api-property';
import { UkefId } from '@ukef/helpers';

/**
 * Facility IDs param.
 */
export class FacilityIdsOperationParamsDto {
  @ValidatedFacilitiesIdentifiersApiProperty({
    description: 'Facility IDs, comma separated',
  })
  readonly ids: UkefId[];
}
