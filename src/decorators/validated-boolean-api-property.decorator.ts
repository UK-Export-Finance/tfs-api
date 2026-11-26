import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

import { applyDecoratorsProperty } from './apply-decorators-property.helper';

type Options = {
  description: string;
};

export const ValidatedRequiredBooleanApiProperty = ({ description }: Options): PropertyDecorator => {
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
  return applyDecoratorsProperty(...decoratorsToApply);
};
