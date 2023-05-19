import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, Min, NotEquals } from 'class-validator';

interface Options {
  description: string;
  minimum?: number;
  enum?: any;
  required?: boolean;
  example?: number;
  default?: number;
  forbidZero?: boolean;
}

export const ValidatedNumberApiProperty = (options: Options) => {
  const decoratorsToApply = [ApiProperty(buildSwaggerPropertyOptions(options))];

  const { minimum, enum: theEnum, required, forbidZero } = options;

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

  if (forbidZero) {
    decoratorsToApply.push(NotEquals(0));
  }

  return applyDecorators(...decoratorsToApply);
};

const buildSwaggerPropertyOptions = ({
  description,
  minimum,
  enum: theEnum,
  required,
  example,
  default: theDefault,
  forbidZero,
}: Options): ApiPropertyOptions => {
  const baseOptions = {
    type: 'number',
    description,
    minimum,
    example,
    enum: theEnum,
    required,
    default: theDefault,
  };

  return forbidZero ? { ...baseOptions, not: { enum: [0] } } : baseOptions;
};
