import { ApiResponseProperty } from '@nestjs/swagger';
import { EXAMPLES, PROPERTIES } from '@ukef/constants';
import { DateOnlyString } from '@ukef/helpers';

export class GetDealByIdentifierResponse {
  @ApiResponseProperty({ example: EXAMPLES.DEAL_ID })
  dealIdentifier: string;

  @ApiResponseProperty({ example: PROPERTIES.GLOBAL.portfolioIdentifier })
  portfolioIdentifier: string;

  @ApiResponseProperty({ example: EXAMPLES.CURRENCY })
  currency: string;

  @ApiResponseProperty()
  dealValue: number;

  @ApiResponseProperty({
    type: Date,
    format: 'date',
  })
  guaranteeCommencementDate: DateOnlyString;

  @ApiResponseProperty({ example: EXAMPLES.PARTY_ID })
  obligorPartyIdentifier: string;

  @ApiResponseProperty()
  obligorName: string;

  @ApiResponseProperty()
  obligorIndustryClassification: string;
}
