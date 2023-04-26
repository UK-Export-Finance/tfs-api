import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, UKEFID } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { Matches } from 'class-validator';

export class GetDealsInvestorsParamsDto {
  @ApiProperty({ description: 'UKEF id for deal', example: EXAMPLES.DEAL_ID })
  @Matches(UKEFID.MAIN_ID.TEN_DIGIT_REGEX)
  dealIdentifier: UkefId;
}
