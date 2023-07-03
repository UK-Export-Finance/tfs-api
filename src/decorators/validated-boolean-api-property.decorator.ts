import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

interface Options {
  description: string;
}

export const ValidatedRequiredBooleanApiProperty = ({ description }: Options) => {
  const decoratorsToApply = [
    ApiProperty({
      type: 'boolean',
      description,
      required: true,
      nullable: false,
    }),
    IsBoolean(),
    IsNotEmpty(),
  ];
  return applyDecorators(...decoratorsToApply);
};
