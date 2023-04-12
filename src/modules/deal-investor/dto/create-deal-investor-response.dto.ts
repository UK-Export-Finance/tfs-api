import { ApiResponseProperty } from '@nestjs/swagger';

export class CreateDealInvestorResponse {
  @ApiResponseProperty({ example: '0020900111' })
  readonly dealIdentifier: string;

  constructor(dealIdentifier: string) {
    this.dealIdentifier = dealIdentifier;
  }
}
