import { EXAMPLES } from '@ukef/constants';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { UkefId } from '@ukef/helpers';

export class GetFacilityInvestorsParamsDto {
  @ValidatedStringApiProperty({
    description: 'The identifier of the facility.',
    example: EXAMPLES.FACILITY_ID,
    length: 10,
    pattern: /^00\d{8}$/,
  })
  facilityIdentifier: UkefId;
}
