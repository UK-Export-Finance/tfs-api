import { ApiProperty } from '@nestjs/swagger';

export class CreateFacilityFixedFeeResponse {
  @ApiProperty({
    readOnly: true,
    minLength: 10,
    maxLength: 10,
    description: 'The identifier of the facility that the investor was created for.',
    example: '0000000001',
  })
  readonly facilityIdentifier: string;

  constructor(facilityIdentifier: string) {
    this.facilityIdentifier = facilityIdentifier;
  }
}
