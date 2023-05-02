import { ApiProperty } from '@nestjs/swagger';

export class CreateFacilityActivationTransactionResponse {
  @ApiProperty({
    readOnly: true,
    minLength: 10,
    maxLength: 10,
    description: 'The identifier of the ACBS bundle.',
    example: '0000257207',
  })
  readonly bundleIdentifier: string;

  constructor(bundleIdentifier: string) {
    this.bundleIdentifier = bundleIdentifier;
  }
}
