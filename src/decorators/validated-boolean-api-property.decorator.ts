import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

interface Options {
  description: string;
  minimum?: number;
  enum?: any;
  required?: boolean;
  example?: number;
  default?: number;
}

export const ValidatedBooleanApiProperty = ({ description, required, example, default: theDefault }: Options) => {
  const decoratorsToApply = [
    ApiProperty({
      type: 'boolean',
      description,
      example,
      required,
      default: theDefault,
    }),
    IsBoolean(),
  ];

  const isRequiredProperty = required ?? true;
  if (isRequiredProperty) {
    decoratorsToApply.push(IsNotEmpty());
  } else {
    decoratorsToApply.push(IsOptional());
  }

  return applyDecorators(...decoratorsToApply);
};
