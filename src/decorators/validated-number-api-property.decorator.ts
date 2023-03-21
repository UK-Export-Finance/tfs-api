import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Max, Min } from 'class-validator';

interface Options {
  description: string;
  minimum: number;
  maximum: number;
}

export const ValidatedNumberApiProperty = ({ description, minimum, maximum }: Options) => {
  const decoratorsToApply = [
    ApiProperty({
      type: 'number',
      description,
      minimum,
      maximum,
    }),
    IsNotEmpty(),
    Min(minimum),
    Max(maximum),
  ];

  return applyDecorators(...decoratorsToApply);
};
