import { EXAMPLES, UKEFID } from '@ukef/constants';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { UkefId } from '@ukef/helpers';

export class GetFacilityInvestorsParamsDto {
  @ValidatedStringApiProperty({
    description: 'The identifier of the facility.',
    example: EXAMPLES.FACILITY_ID,
    length: 10,
    pattern: UKEFID.TEN_DIGIT_REGEX,
  })
  facilityIdentifier: UkefId;
}
