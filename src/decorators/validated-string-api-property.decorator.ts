import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Length, Matches } from 'class-validator';
import { regexToString } from '@ukef/helpers';

import { NullableOption, parseRequiredAndNullable, RequiredOption } from './parse-required-and-nullable-validation.helper';

type Options = {
  description: string;
  length?: number;
  minLength?: number;
  maxLength?: number;
  required?: RequiredOption;
  nullable?: NullableOption;
  pattern?: RegExp;
  enum?: Record<string, string | number> | (string | number)[];
  example?: string;
  default?: string;
};

export const ValidatedStringApiProperty = ({
  description,
  length,
  minLength: minLengthOption,
  maxLength: maxLengthOption,
  required,
  nullable,
  pattern,
  enum: theEnum,
  example,
  default: theDefault,
}: Options) => {
  const minLength = length ?? minLengthOption ?? 0;
  const maxLength = length ?? maxLengthOption;

  const { shouldPropertyBeDocumentedAsRequired, shouldPropertyBeDocumentedAsNullable, validationDecoratorsToApply } = parseRequiredAndNullable({
    required,
    nullable,
  });

  const decoratorsToApply = [
    ApiProperty({
      type: 'string',
      description,
      minLength,
      maxLength,
      required: shouldPropertyBeDocumentedAsRequired,
      nullable: shouldPropertyBeDocumentedAsNullable,
      pattern: pattern ? regexToString(pattern) : undefined,
      enum: theEnum,
      example,
      default: theDefault,
    }),
    IsString(),
    Length(minLength, maxLength),
  ];
  decoratorsToApply.push(...validationDecoratorsToApply);

  if (pattern) {
    decoratorsToApply.push(Matches(pattern));
  }

  if (theEnum) {
    decoratorsToApply.push(IsEnum(theEnum));
  }

  return applyDecorators(...decoratorsToApply);
};
