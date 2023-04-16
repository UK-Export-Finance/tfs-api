import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';

interface Options {
  description: string;
  minimum: number;
  required?: boolean;
  default?: number;
}

export const ValidatedNumberApiProperty = ({ description, minimum, required, default: theDefault }: Options) => {
  const decoratorsToApply = [
    ApiProperty({
      type: 'number',
      description,
      minimum,
      required,
      default: theDefault,
    }),
    Min(minimum),
  ];

  const isRequiredProperty = required ?? true;
  if (isRequiredProperty) {
    decoratorsToApply.push(IsNotEmpty());
  } else {
    decoratorsToApply.push(IsOptional());
  }

  return applyDecorators(...decoratorsToApply);
};
