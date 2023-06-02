import { BadRequestException } from '@nestjs/common';

import { NonEmptyObjectRequestBodyValidationPipe } from './non-empty-object-request-body-validation-pipe';

describe('nonEmptyObjectRequestBodyValidationPipe', () => {
  const nonEmptyObjectRequestBodyValidationPipe = new NonEmptyObjectRequestBodyValidationPipe();

  it('throws a BadRequestException if it is called with an array', () => {
    const validatingEmptyArray = () => nonEmptyObjectRequestBodyValidationPipe.transform([{ x: 1 }]);

    expect(validatingEmptyArray).toThrow(BadRequestException);
    expect(validatingEmptyArray).toThrow('The request body cannot be an array.');
  });

  it('throws a BadRequestException if it is called with the empty object', () => {
    const validatingEmptyObject = () => nonEmptyObjectRequestBodyValidationPipe.transform({});

    expect(validatingEmptyObject).toThrow(BadRequestException);
    expect(validatingEmptyObject).toThrow('The request body cannot be the empty object.');
  });

  it('throws a BadRequestException if it is called with an object with all properties undefined', () => {
    const validatingEmptyObject = () => nonEmptyObjectRequestBodyValidationPipe.transform({ propertyA: undefined, propertyB: undefined });

    expect(validatingEmptyObject).toThrow(BadRequestException);
    expect(validatingEmptyObject).toThrow('The request body cannot be the empty object.');
  });

  it('returns the object if it is called with an object with one or more defined properties', () => {
    const nonEmptyObject = { propertyA: 'defined', propertyB: undefined };

    expect(nonEmptyObjectRequestBodyValidationPipe.transform(nonEmptyObject)).toBe(nonEmptyObject);
  });
});
