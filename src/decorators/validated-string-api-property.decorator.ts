import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { regexToString } from '@ukef/helpers';
import { IsEnum, IsString, Length, Matches } from 'class-validator';

import { parseRequiredAndNullable, RequiredOption } from './parse-required-and-nullable-validation.helper';

interface Options {
  description: string;
  length?: number;
  minLength?: number;
  maxLength?: number;
  required?: RequiredOption;
  pattern?: RegExp;
  enum?: any;
  example?: string;
  default?: string;
}

export const ValidatedStringApiProperty = ({
  description,
  length,
  minLength,
  maxLength,
  required,
  pattern,
  enum: theEnum,
  example,
  default: theDefault,
}: Options) => {
  minLength = length ?? minLength ?? 0;
  maxLength = length ?? maxLength;

  const { shouldPropertyBeDocumentedAsRequired, validationDecoratorsToApply } = parseRequiredAndNullable({
    required,
    nullable: typeof required === 'function' ? (...args) => !required(...args) : !(required ?? true),
  });

  const decoratorsToApply = [
    ApiProperty({
      type: 'string',
      description,
      minLength,
      maxLength,
      required: shouldPropertyBeDocumentedAsRequired,
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
