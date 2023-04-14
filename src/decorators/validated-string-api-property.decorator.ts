import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Length, Matches } from 'class-validator';

interface Options {
  description: string;
  length?: number;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  pattern?: RegExp;
  example?: string;
  default?: string;
}

export const ValidatedStringApiProperty = ({ description, length, minLength, maxLength, required, pattern, example, default: theDefault }: Options) => {
  minLength = length ?? minLength;
  maxLength = length ?? maxLength;
  const decoratorsToApply = [
    ApiProperty({
      type: 'string',
      description,
      minLength,
      maxLength,
      required,
      pattern: pattern && pattern.toString().split('/')[1],
      example,
      default: theDefault,
    }),
    Length(minLength, maxLength),
  ];

  const isRequiredProperty = required ?? true;
  if (!isRequiredProperty) {
    decoratorsToApply.push(IsOptional());
  }
  if (pattern) {
    decoratorsToApply.push(Matches(pattern));
  }
  return applyDecorators(...decoratorsToApply);
};
