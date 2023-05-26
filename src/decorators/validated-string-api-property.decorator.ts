import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

interface Options {
  description: string;
  length?: number;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
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
  const decoratorsToApply = [
    ApiProperty({
      type: 'string',
      description,
      minLength,
      maxLength,
      required,
      pattern: pattern?.toString().split('/')[1],
      enum: theEnum,
      example,
      default: theDefault,
    }),
    IsString(),
    Length(minLength, maxLength),
  ];

  const isRequiredProperty = required ?? true;
  if (!isRequiredProperty) {
    decoratorsToApply.push(IsOptional());
  }
  if (pattern) {
    decoratorsToApply.push(Matches(pattern));
  }
  if (theEnum) {
    decoratorsToApply.push(IsEnum(theEnum));
  }
  return applyDecorators(...decoratorsToApply);
};
