import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class GetPartiesBySearchTextQuery {
  @ApiProperty({ description: 'Minimum length: 3. Cannot contain only whitespaces.', minLength: 3 })
  @Length(3)
  searchText: string;
}
