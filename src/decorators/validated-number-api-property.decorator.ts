import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Min } from 'class-validator';

interface Options {
  description: string;
  minimum: number;
}

export const ValidatedNumberApiProperty = ({ description, minimum }: Options) => {
  const decoratorsToApply = [
    ApiProperty({
      type: 'number',
      description,
      minimum,
    }),
    IsNotEmpty(),
    Min(minimum),
  ];

  return applyDecorators(...decoratorsToApply);
};
