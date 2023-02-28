import { ApiResponseProperty } from '@nestjs/swagger';

export type GetPartiesBySearchTextResponse = GetPartiesBySearchTextResponseElement[];

export class GetPartiesBySearchTextResponseElement {
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

  @ApiResponseProperty()
  officerRiskDate: string;

  @ApiResponseProperty()
  countryCode: string;
}
