import { ValidateIf } from 'class-validator';

export type RequiredOption = OptionalBooleanOrBooleanDependingOnCurrentObject;
export type NullableOption = OptionalBooleanOrBooleanDependingOnCurrentObject;

type OptionalBooleanOrBooleanDependingOnCurrentObject = undefined | BooleanOrBooleanDependingOnCurrentObject;
type BooleanOrBooleanDependingOnCurrentObject = boolean | BooleanDependingOnCurrentObject;
type BooleanDependingOnCurrentObject = (currentObject: Record<string, unknown>) => boolean;

const asBooleanDependingOnCurrentObject = (x: BooleanOrBooleanDependingOnCurrentObject): BooleanDependingOnCurrentObject =>
  typeof x === 'function' ? x : () => x;

const getAllowedNullishValuesForProperty = (
  currentObject: Record<string, unknown>,
  { required, nullable }: DefaultedRequiredAndNullable,
): (undefined | null)[] => {
  const propertyIsRequiredOnCurrentObject = asBooleanDependingOnCurrentObject(required);
  const propertyIsNullableOnCurrentObject = asBooleanDependingOnCurrentObject(nullable);
  const allowedNullishValues: (undefined | null)[] = [];

  if (propertyIsNullableOnCurrentObject(currentObject)) {
    allowedNullishValues.push(null);
  }

  if (!propertyIsRequiredOnCurrentObject(currentObject)) {
    allowedNullishValues.push(undefined);
  }

  return allowedNullishValues;
};

export const parseRequiredAndNullable = ({ required, nullable }: RequiredAndNullable): ParsedRequiredAndNullableOptions => {
  const requiredOrDefault = required ?? true;
  const nullableOrDefault = nullable ?? false;
  return {
    shouldPropertyBeDocumentedAsRequired: typeof requiredOrDefault === 'function' ? false : requiredOrDefault,
    shouldPropertyBeDocumentedAsNullable: typeof nullableOrDefault === 'function' ? true : nullableOrDefault,
    validationDecoratorsToApply: [
      ValidateIf(
        (currentObject, propertyValue) =>
          !getAllowedNullishValuesForProperty(currentObject, { required: requiredOrDefault, nullable: nullableOrDefault }).includes(propertyValue),
      ),
    ],
  };
};

interface RequiredAndNullable {
  required: RequiredOption;
  nullable: NullableOption;
}

// required/nullable are always defaulted (non-undefined) by the time they reach getAllowedNullishValuesForProperty
interface DefaultedRequiredAndNullable {
  required: BooleanOrBooleanDependingOnCurrentObject;
  nullable: BooleanOrBooleanDependingOnCurrentObject;
}

interface ParsedRequiredAndNullableOptions {
  shouldPropertyBeDocumentedAsRequired: boolean;
  shouldPropertyBeDocumentedAsNullable: boolean;
  validationDecoratorsToApply: PropertyDecorator[];
}
