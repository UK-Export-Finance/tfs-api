import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ENUMS } from '@ukef/constants';
import { FacilityUpdateOperationEnum } from '@ukef/constants/enums/facility-update-operations';

export class UpdateFacilityByOperationQueryDto {
  @ApiProperty({ description: 'Update operation', enum: FacilityUpdateOperationEnum, example: ENUMS.FACILITY_UPDATE_OPERATIONS.ISSUE })
  @IsEnum(FacilityUpdateOperationEnum)
  op: FacilityUpdateOperationEnum;
}
