import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';

interface Options {
  description: string;
  minLength: number;
  maxLength: number;
  example?: string;
  required?: boolean;
  default?: string;
}

export const ValidatedStringApiProperty = ({ description, minLength, maxLength, example, required, default: theDefault }: Options) => {
  const decoratorsToApply = [
    ApiProperty({
      type: 'string',
      description,
      example,
      minLength,
      maxLength,
      required,
      default: theDefault,
    }),
    Length(minLength, maxLength),
  ];

  const isRequiredProperty = required ?? true;
  if (!isRequiredProperty) {
    decoratorsToApply.push(IsOptional());
  }
  return applyDecorators(...decoratorsToApply);
};
