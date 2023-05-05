import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, Min } from 'class-validator';

interface Options {
  description: string;
  minimum?: number;
  enum?: any;
  required?: boolean;
  example?: number;
  default?: number;
}

export const ValidatedNumberApiProperty = ({ description, minimum, enum: theEnum, required, example, default: theDefault }: Options) => {
  const decoratorsToApply = [
    ApiProperty({
      type: 'number',
      description,
      minimum,
      example,
      enum: theEnum,
      required,
      default: theDefault,
    }),
  ];

  if (minimum || minimum === 0) {
    decoratorsToApply.push(Min(minimum));
  }

  const isRequiredProperty = required ?? true;
  if (isRequiredProperty) {
    decoratorsToApply.push(IsNotEmpty());
  } else {
    decoratorsToApply.push(IsOptional());
  }

  if (theEnum) {
    decoratorsToApply.push(IsEnum(theEnum));
  }

  return applyDecorators(...decoratorsToApply);
};
