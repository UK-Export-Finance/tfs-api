import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Min, NotEquals, ValidateIf } from 'class-validator';

interface Options {
  description: string;
  minimum?: number;
  enum?: any;
  required?: boolean;
  nullable?: boolean;
  example?: number;
  default?: number;
  forbidZero?: boolean;
}

export const ValidatedNumberApiProperty = (options: Options) => {
  const decoratorsToApply = [ApiProperty(buildSwaggerPropertyOptions(options)), IsNumber()];

  const { minimum, enum: theEnum, required, nullable, forbidZero } = options;

  if (minimum || minimum === 0) {
    decoratorsToApply.push(Min(minimum));
  }

  const isRequiredProperty = required ?? true;
  const isNullableProperty = nullable ?? false;

  if (isRequiredProperty || !isNullableProperty) {
    decoratorsToApply.push(IsNotEmpty());

    if (!isRequiredProperty) {
      decoratorsToApply.push(ValidateIf((_object, value) => value !== undefined));
    }

    if (isNullableProperty) {
      decoratorsToApply.push(ValidateIf((_object, value) => value !== null));
    }
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
