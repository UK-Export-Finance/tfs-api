import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

interface Options {
  description: string;
  minimum: number;
  maximum?: number;
  required?: boolean;
  example?: number;
  default?: number;
}

export const ValidatedNumberApiProperty = ({ description, minimum, maximum, required, example, default: theDefault }: Options) => {
  const decoratorsToApply = [
    ApiProperty({
      type: 'number',
      description,
      minimum,
      example,
      required,
      default: theDefault,
    }),
    Min(minimum),
    Max(maximum),
  ];

  const isRequiredProperty = required ?? true;
  if (isRequiredProperty) {
    decoratorsToApply.push(IsNotEmpty());
  } else {
    decoratorsToApply.push(IsOptional());
  }

  return applyDecorators(...decoratorsToApply);
};
