import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length, Matches, ValidateIf } from 'class-validator';

interface Options {
  description: string;
  length?: number;
  minLength?: number;
  maxLength?: number;
  required?: RequiredOption;
  pattern?: RegExp;
  enum?: any;
  example?: string;
  default?: string;
}

type RequiredOption = undefined | boolean | ((currentObject: Record<string, unknown>) => boolean);

export const ValidatedStringApiProperty = ({
  description,
  length,
  minLength,
  maxLength,
  required,
  pattern,
  enum: theEnum,
  example,
  default: theDefault,
}: Options) => {
  minLength = length ?? minLength ?? 0;
  maxLength = length ?? maxLength;
  const { shouldPropertyBeDocumentedAsRequired: shouldFieldBeDocumentedAsRequired, validationDecoratorsToApplyForRequiredOption } =
    parseRequiredOption(required);
  const decoratorsToApply = [
    ApiProperty({
      type: 'string',
      description,
      minLength,
      maxLength,
      required: shouldFieldBeDocumentedAsRequired,
      pattern: pattern?.toString().split('/')[1],
      enum: theEnum,
      example,
      default: theDefault,
    }),
    IsString(),
    Length(minLength, maxLength),
  ];
  decoratorsToApply.push(...validationDecoratorsToApplyForRequiredOption);

  if (pattern) {
    decoratorsToApply.push(Matches(pattern));
  }
  if (theEnum) {
    decoratorsToApply.push(IsEnum(theEnum));
  }
  return applyDecorators(...decoratorsToApply);
};

const parseRequiredOption = (requiredOption: RequiredOption): ParsedRequiredOption => {
  if (typeof requiredOption === 'function') {
    return parseRequiredOptionFunction(requiredOption);
  }
  return parseRequiredOptionNonFunction(requiredOption);
};

const parseRequiredOptionFunction = (requiredOption: (currentObject: Record<string, unknown>) => boolean): ParsedRequiredOption => {
  const propertyIsRequiredOnCurrentObject = requiredOption;
  const propertyIsNotNullish = (propertyValue: unknown) => propertyValue !== null && propertyValue !== undefined;
  return {
    shouldPropertyBeDocumentedAsRequired: false, // the property is not always required, so we should not document that it is required
    validationDecoratorsToApplyForRequiredOption: [
      ValidateIf((currentObject, propertyValue) => propertyIsRequiredOnCurrentObject(currentObject) || propertyIsNotNullish(propertyValue)),
    ],
  };
};

const parseRequiredOptionNonFunction = (requiredOption: boolean | undefined): ParsedRequiredOption => {
  const required = requiredOption ?? true;
  return {
    shouldPropertyBeDocumentedAsRequired: required,
    validationDecoratorsToApplyForRequiredOption: required ? [] : [IsOptional()],
  };
};

interface ParsedRequiredOption {
  shouldPropertyBeDocumentedAsRequired: boolean;
  validationDecoratorsToApplyForRequiredOption: PropertyDecorator[];
}
