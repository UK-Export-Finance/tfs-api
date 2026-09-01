import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { Exclude } from 'class-transformer';

import { BaseFacilityRequestItem, BaseFacilityRequestItemWithFacilityIdentifier } from './base-facility-request.dto';

export class UpdateFacilityRequest extends BaseFacilityRequestItem {
  /**
   * Read-only field returned from GET endpoint that may be sent back in amendment requests.
   * This is accepted for client convenience (when re-sending GET response) but excluded from ACBS updates.
   */
  @Exclude()
  @ValidatedFacilityIdentifierApiProperty({
    description: 'Read-only field returned from GET endpoint. The identifier of the facility.',
    required: false,
  })
  readonly facilityIdentifier?: string;
}

export class UpdateFacilityRequestWithFacilityIdentifier extends BaseFacilityRequestItemWithFacilityIdentifier {}
