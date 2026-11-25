import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { MDM_EXAMPLES } from '@ukef/constants/examples/mdm.examples.constant';

import { ObligationSubtypeMdmResponseDto } from './obligation-subtype-mdm-response.dto';

/**
 * APIM TFS "obligation subtype with product type code" response DTO.
 * This is returned from the APIM TFS MdmService, as part of mapping in APIM TFS.
 */
export class ObligationSubtypeWithProductTypeCodeResponseDto extends ObligationSubtypeMdmResponseDto {
  @IsString()
  @ApiProperty({
    example: MDM_EXAMPLES.OBLIGATION_SUBTYPES_WITH_PRODUCT_CODES.OST001.productTypeCode,
  })
  readonly productTypeCode!: string;
}
