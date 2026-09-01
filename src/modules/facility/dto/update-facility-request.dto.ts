import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { Exclude } from 'class-transformer';

import { BaseUpdateFacilityRequestItem, BaseUpdateFacilityRequestItemWithFacilityIdentifier } from './base-facility-request.dto';

export class UpdateFacilityRequest extends BaseUpdateFacilityRequestItem {
  /**
   * Read-only field returned from GET endpoint that may be sent back in amendment requests.
   * This is accepted for client convenience (when re-sending GET response) but excluded from ACBS updates.
   */
  @Exclude()
  @ValidatedFacilityIdentifierApiProperty({
    description: 'Read-only field returned from GET endpoint. The identifier of the facility.',
    required: false,
    nullable: true,
  })
  readonly facilityIdentifier?: string | null;
}

export class UpdateFacilityRequestWithFacilityIdentifier extends BaseUpdateFacilityRequestItemWithFacilityIdentifier {}
