import { ApiResponseProperty } from '@nestjs/swagger';

export class CreateDealGuaranteeResponse {
  @ApiResponseProperty({ example: '00000001' })
  readonly dealIdentifier: string;

  constructor(dealIdentifier: string) {
    this.dealIdentifier = dealIdentifier;
  }
}
