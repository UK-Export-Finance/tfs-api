import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { DATE_FORMATS } from '@ukef/constants';
import { DateOnlyString } from '@ukef/helpers';
import { IsISO8601, Matches } from 'class-validator';

import { NullableOption, parseRequiredAndNullable, RequiredOption } from './parse-required-and-nullable-validation.helper';

interface Options {
  description: string;
  example?: DateOnlyString;
  required?: RequiredOption;
  default?: DateOnlyString | null;
  nullable?: NullableOption;
}

export const ValidatedDateOnlyApiProperty = ({ description, example, required, default: theDefault, nullable }: Options) => {
  const { shouldPropertyBeDocumentedAsRequired, shouldPropertyBeDocumentedAsNullable, validationDecoratorsToApplyForRequiredOption } = parseRequiredAndNullable(
    {
      required,
      nullable,
    },
  );
  const decoratorsToApply = [
    ApiProperty({
      description,
      type: Date,
      format: 'date',
      required: shouldPropertyBeDocumentedAsRequired,
      example,
      default: theDefault,
      nullable: shouldPropertyBeDocumentedAsNullable,
    }),
    IsISO8601({ strict: true }),
    Matches(DATE_FORMATS.DATE_ONLY_STRING.regex),
  ];

  decoratorsToApply.push(...validationDecoratorsToApplyForRequiredOption);

  return applyDecorators(...decoratorsToApply);
};
