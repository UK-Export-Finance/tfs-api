import { IntersectionType, OmitType } from '@nestjs/swagger';
import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { DateOnlyString } from '@ukef/helpers';

import { BaseFacilityRequestItem, BaseFacilityRequestItemWithFacilityIdentifier } from './base-facility-request.dto';

class UpdateFacilityRequestUniqueProperties {
  @ValidatedDateOnlyApiProperty({
    description: 'Issue Date for Bond OR Disbursement Date for Loan/EWCS. Not required at commitment stage.',
  })
  readonly issueDate: DateOnlyString;
}

export class UpdateFacilityRequest extends IntersectionType(UpdateFacilityRequestUniqueProperties, OmitType(BaseFacilityRequestItem, ['issueDate'] as const)) {}

export class UpdateFacilityRequestWithFacilityIdentifier extends IntersectionType(
  UpdateFacilityRequestUniqueProperties,
  OmitType(BaseFacilityRequestItemWithFacilityIdentifier, ['issueDate'] as const),
) {}
