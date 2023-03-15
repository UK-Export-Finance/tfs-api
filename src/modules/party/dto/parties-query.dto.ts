import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class PartiesQueryDto {
  @ApiProperty({ description: 'Minimum length: 3', minLength: 3 })
  @Length(3)
  searchText: string;
}
