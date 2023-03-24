import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { DATE_FORMATS } from '@ukef/constants';
import { IsISO8601, Matches } from 'class-validator';

export const ValidatedDateOnlyApiProperty = ({ description }: { description: string }) =>
  applyDecorators(
    ApiProperty({
      description,
      type: Date,
      format: 'date',
    }),
    IsISO8601({ strict: true }),
    Matches(DATE_FORMATS.DATE_ONLY_STRING.regex),
  );
