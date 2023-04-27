import { EXAMPLES, UKEFID } from '@ukef/constants';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { UkefId } from '@ukef/helpers';

export class FacilityGuaranteesParamsDto {
  @ValidatedStringApiProperty({
    description: 'The identifier of the facility in ACBS.',
    example: EXAMPLES.FACILITY_ID,
    length: 10,
    pattern: UKEFID.MAIN_ID.TEN_DIGIT_REGEX,
  })
  facilityIdentifier: UkefId;
}
