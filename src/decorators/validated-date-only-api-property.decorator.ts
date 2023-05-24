import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { DATE_FORMATS } from '@ukef/constants';
import { DateOnlyString } from '@ukef/helpers';
import { IsISO8601, IsOptional, Matches, ValidateIf } from 'class-validator';

interface Options {
  description: string;
  example?: DateOnlyString;
  required?: boolean;
  default?: DateOnlyString | null;
  nullable?: boolean;
}

export const ValidatedDateOnlyApiProperty = ({ description, example, required, default: theDefault, nullable }: Options) => {
  const decoratorsToApply = [
    ApiProperty({
      description,
      type: Date,
      format: 'date',
      required,
      example,
      default: theDefault,
      nullable,
    }),
    IsISO8601({ strict: true }),
    Matches(DATE_FORMATS.DATE_ONLY_STRING.regex),
  ];

  const isRequiredProperty = required ?? true;
  const isNullableProperty = nullable ?? false;

  if (!isRequiredProperty && isNullableProperty) {
    decoratorsToApply.push(IsOptional());
  } else if (!isRequiredProperty) {
    decoratorsToApply.push(ValidateIf((_object, value) => value !== undefined));
  } else if (isNullableProperty) {
    decoratorsToApply.push(ValidateIf((_object, value) => value !== null));
  }

  return applyDecorators(...decoratorsToApply);
};
