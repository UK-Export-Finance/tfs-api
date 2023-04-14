import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { Matches } from 'class-validator';

export class GetDealsGuaranteesParamsDto {
  @ApiProperty({ description: 'The identifier of the deal in ACBS', example: EXAMPLES.DEAL_ID })
  @Matches(/00\d{8}/)
  dealIdentifier: UkefId;
}
