import { ApiProperty } from '@nestjs/swagger';

export class CreateDealResponse {
  @ApiProperty({
    example: '0020900035',
  })
  dealIdentifier: string;
}
