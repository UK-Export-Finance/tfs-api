import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, PROPERTIES } from '@ukef/constants';
import { IsIn, IsISO8601, IsOptional, IsString, Length, Matches } from 'class-validator';

export type CreatePartyRequest = CreatePartyRequestItem[];

export class CreatePartyRequestItem {
  @ApiProperty({ description: 'The UKEF ID for the party. Should contain just digits.', minLength: 8, maxLength: 8, example: '00291013', pattern: '/^d{8}$/' })
  @Length(8, 8, {
    message: 'alternateIdentifier must be exactly 8 characters',
  })
  @Matches(/^\d+$/, {
    message: 'alternateIdentifier must only contain digits',
  })
  alternateIdentifier: string;

  @ApiProperty({ description: 'The primary industry classification code for this customer.', minLength: 1, maxLength: 10, example: '0001' })
  @Length(1, 10)
  industryClassification: string;

  @ApiProperty({ description: 'The primary customer name.', minLength: 1, maxLength: 35, example: 'ACTUAL IMPORT EXPORT' })
  @Length(1, 35)
  name1: string;

  @ApiProperty({ description: 'The secondary customer name.', required: false, minLength: 1, maxLength: 35, example: 'ACTUAL IMPORT EXPORT' })
  @IsOptional()
  @Length(0, 35)
  name2: string;

  @ApiProperty({ description: 'The tertiary customer name.', required: false, minLength: 1, maxLength: 35, example: 'ACTUAL IMPORT EXPORT' })
  @IsOptional()
  @Length(0, 35)
  name3: string;

  @ApiProperty({ description: 'A code that indicates what minority class this customer represents.', minLength: 1, maxLength: 2, example: '70' })
  @Length(1, 2)
  smeType: string;

  @ApiProperty({
    description: "A code that identifies the citizenship category of this customer. Should be '1' if the domicile country is the UK, otherwise '2'.",
    example: '2',
  })
  @IsString()
  @IsIn(['1', '2'])
  citizenshipClass: string;

  @ApiProperty({ description: 'The date of creation in YYYY-MM-DD (ISO 8601) format.', example: '2023-03-15', type: Date, format: 'date' })
  @IsISO8601()
  @Length(0, 10)
  officerRiskDate: string;

  @ApiProperty({
    description: "The country code for the party's primary address.",
    required: false,
    maxLength: 3,
    default: PROPERTIES.PARTY.DEFAULT.address.countryCode,
    example: EXAMPLES.COUNTRY_CODE,
  })
  @IsOptional()
  @Length(0, 3)
  countryCode: string;
}
