import { ApiProperty } from '@nestjs/swagger';
import { MDM_EXAMPLES } from '@ukef/constants/examples/mdm.examples.constant';
import { IsBoolean, IsString } from 'class-validator';

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

  @IsBoolean()
  @ApiProperty({
    example: OBLIGATION_SUBTYPES.OST001.isActive,
  })
  readonly isActive: boolean;
}
