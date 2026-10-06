import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { EXAMPLES, UKEFID } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';

export class GetDealsGuaranteesParamsDto {
  @ApiProperty({ description: 'The identifier of the deal in ACBS', example: EXAMPLES.DEAL_ID })
  @Matches(UKEFID.MAIN_ID.TEN_DIGIT_REGEX)
  dealIdentifier: UkefId;
}
