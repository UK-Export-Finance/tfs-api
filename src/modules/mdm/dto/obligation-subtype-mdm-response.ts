import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { MDM_EXAMPLES } from '../../../constants/examples/mdm.examples.constant';

const { OBLIGATION_SUBTYPES } = MDM_EXAMPLES;

/**
 * APIM MDM "obligation subtype" response DTO.
 * These fields are returned from APIM MDM when getting an obligation subtype
 */
export class ObligationSubtypeMdmResponseDto {
  @IsString()
  @ApiProperty({
    example: OBLIGATION_SUBTYPES.OST001.type,
  })
  readonly type: string;

  @IsString()
  @ApiProperty({
    example: OBLIGATION_SUBTYPES.OST001.typeCode,
  })
  readonly typeCode: string;

  @IsString()
  @ApiProperty({
    example: OBLIGATION_SUBTYPES.OST001.code,
  })
  readonly code: string;

  @IsString()
  @ApiProperty({
    example: OBLIGATION_SUBTYPES.OST001.description,
  })
  readonly description: string;

  @IsString()
  @ApiProperty({
    example: OBLIGATION_SUBTYPES.OST001.isActive,
  })
  readonly isActive: boolean;
}
