import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, UKEFID } from '@ukef/constants';
import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsString, Length, Matches } from 'class-validator';

interface Options {
  description: string;
}

export const ValidatedFacilitiesIdentifiersApiProperty = ({ description }: Options) =>
  applyDecorators(
    ApiProperty({
      type: 'string',
      description,
      pattern: UKEFID.MAIN_ID.MULTIPLE_TEN_DIGIT_REGEX,
      example: EXAMPLES.GIFT.FACILITY_IDS_QUERY_PARAM,
    }),
    Transform(({ value }) => {
      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === 'string') {
        return value.split(',');
      }

      return value;
    }),
    IsArray(),
    ArrayNotEmpty(),
    IsString({ each: true }),
    Length(UKEFID.VALIDATION.MIN_LENGTH, UKEFID.VALIDATION.MAX_LENGTH, { each: true }),
    Matches(UKEFID.MAIN_ID.TEN_DIGIT_REGEX, { each: true, message: `For 'ids': Value must follow pattern ${UKEFID.MAIN_ID.TEN_DIGIT_REGEX}.` }),
  );
