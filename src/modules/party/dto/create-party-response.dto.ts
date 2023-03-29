import { ApiProperty } from '@nestjs/swagger';

export class CreatePartyResponse {
  @ApiProperty({ readOnly: true, required: false })
  partyIdentifier?: string;
}
