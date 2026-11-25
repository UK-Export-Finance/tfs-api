import { applyDecorators } from '@nestjs/common';

/**
 * Type-safe wrapper for applyDecorators that returns PropertyDecorator.
 * Resolves TS1271 errors by explicitly asserting the return type.
 * @internal
 */
export const applyDecoratorsProperty = (...decorators: any[]): PropertyDecorator => {
  return applyDecorators(...decorators) as any as PropertyDecorator;
};
