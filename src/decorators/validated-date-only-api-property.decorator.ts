import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, Matches } from 'class-validator';

export const ValidatedDateOnlyApiProperty = ({ description }: { description: string }) =>
  applyDecorators(
    ApiProperty({
      description,
      type: Date,
      format: 'date',
    }),
    IsISO8601({ strict: true }),
    Matches(/^\d{4}-\d{2}-\d{2}$/),
  );
