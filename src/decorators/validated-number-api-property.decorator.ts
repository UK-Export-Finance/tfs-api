import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, Min, NotEquals } from 'class-validator';

import { NullableOption, parseRequiredAndNullable, RequiredOption } from './parse-required-and-nullable-validation.helper';

interface Options {
  description: string;
  minimum?: number;
  enum?: any;
  required?: RequiredOption;
  nullable?: NullableOption;
  example?: number;
  default?: number;
  forbidZero?: boolean;
}

export const ValidatedNumberApiProperty = (options: Options) => {
  const { description, minimum, enum: theEnum, required, nullable, example, default: theDefault, forbidZero } = options;

  const { shouldPropertyBeDocumentedAsRequired, shouldPropertyBeDocumentedAsNullable, validationDecoratorsToApply } = parseRequiredAndNullable({
    required,
    nullable,
  });

  const decoratorsToApply = [
    ApiProperty(
      buildSwaggerPropertyOptions({
        description,
        minimum,
        enum: theEnum,
        required: shouldPropertyBeDocumentedAsRequired,
        nullable: shouldPropertyBeDocumentedAsNullable,
        example,
        default: theDefault,
        forbidZero,
      }),
    ),
    IsNumber(),
  ];

  if (minimum || minimum === 0) {
    decoratorsToApply.push(Min(minimum));
  }

  decoratorsToApply.push(IsNotEmpty());
  decoratorsToApply.push(...validationDecoratorsToApply);

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
  nullable,
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
    nullable,
    default: theDefault,
  };

  return (forbidZero ? { ...baseOptions, not: { enum: [0] } } : baseOptions) as ApiPropertyOptions;
};
