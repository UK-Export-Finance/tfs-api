import { ApiProperty } from '@nestjs/swagger';
import { MDM_EXAMPLES } from '@ukef/constants/examples/mdm.examples.constant';
import { IsString } from 'class-validator';

import { ObligationSubtypeMdmResponseDto } from './obligation-subtype-mdm-response';

/**
 * APIM TFS "obligation subtype with product type code" response DTO.
 * This is returned from the APIM TFS MdmService, as part of mapping
 */
export class ObligationSubtypeWithProductTypeCodeResponseDto extends ObligationSubtypeMdmResponseDto {
  @IsString()
  @ApiProperty({
    example: MDM_EXAMPLES.OBLIGATION_SUBTYPES_WITH_PRODUCT_CODES.OST001.productTypeCode,
  })
  readonly productTypeCode: string;
}
