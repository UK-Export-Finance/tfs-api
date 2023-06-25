import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Length, Matches } from 'class-validator';

import { parseRequiredAndNullable } from './parse-required-and-nullable-validation.helper';

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

type RequiredOption = undefined | boolean | ((currentObject: Record<string, unknown>) => boolean);

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

  const { shouldPropertyBeDocumentedAsRequired, validationDecoratorsToApplyForRequiredOption } = parseRequiredAndNullable({
    required,
    nullable: true,
  });

  const decoratorsToApply = [
    ApiProperty({
      type: 'string',
      description,
      minLength,
      maxLength,
      required: shouldPropertyBeDocumentedAsRequired,
      pattern: pattern?.toString().split('/')[1],
      enum: theEnum,
      example,
      default: theDefault,
    }),
    IsString(),
    Length(minLength, maxLength),
  ];
  decoratorsToApply.push(...validationDecoratorsToApplyForRequiredOption);

  if (pattern) {
    decoratorsToApply.push(Matches(pattern));
  }
  if (theEnum) {
    decoratorsToApply.push(IsEnum(theEnum));
  }
  return applyDecorators(...decoratorsToApply);
};
