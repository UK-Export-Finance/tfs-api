import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class CreateDealDto {
  @ApiProperty({
    example: '0020900035',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10)
  dealIdentifier: string;

  @ApiProperty({
    description: 'Deal portfolio is E1',
    example: 'E1',
  })
  @IsString()
  @IsOptional()
  @Length(2)
  portfolioIdentifier: string;

  @ApiProperty({
    description: 'Deal currency code is USD, CAD',
    example: 'GBP',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3)
  currency: string;

  @ApiProperty()
  @ApiProperty({
    example: 2000000000.9989765,
  })
  @IsNumber()
  @IsNotEmpty()
  dealValue: number;

  @ApiProperty({
    description:
      'Deal effective date is not in workflow. Currently operations assume a date earlier than the Facility effective date. Use the earliest Effective Date on facilities in Workflow under this Deal, i.e. Guarantee Commencement Date.',
    example: '2017-06-01',
  })
  @IsDateString()
  @IsNotEmpty()
  guaranteeCommencementDate: string;

  @ApiProperty({
    example: '00000000',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10)
  obligorPartyIdentifier: string;

  @ApiProperty({
    description: 'Obligor party name, which is party name1 attribute.',
    example: 'Test McTesterson',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(0)
  @MaxLength(35)
  obligorName: string;

  @ApiProperty({
    description: 'Obligor party industry classification',
    example: '1405',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(0)
  @MaxLength(10)
  obligorIndustryClassification: string;
}
