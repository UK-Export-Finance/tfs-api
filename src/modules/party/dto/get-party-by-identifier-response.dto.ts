import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { DateString } from '@ukef/helpers/date-string.type';

export class GetPartyByIdentifierResponse {
  @ApiResponseProperty()
  alternateIdentifier: string;

  @ApiResponseProperty()
  industryClassification: string;

  @ApiResponseProperty()
  name1: string;

  @ApiResponseProperty()
  name2: string;

  @ApiResponseProperty()
  name3: string;

  @ApiResponseProperty()
  smeType: string;

  @ApiResponseProperty()
  citizenshipClass: string;

  @ApiProperty({ readOnly: true, type: Date, nullable: true })
  officerRiskDate: DateString;

  @ApiResponseProperty()
  countryCode: string;
}
