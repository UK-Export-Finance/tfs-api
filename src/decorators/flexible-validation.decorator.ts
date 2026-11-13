/**
 * Marks a request DTO as requiring flexible (non-whitelist) validation.
 *
 * This must be applied to the DTO class used for the route's body, not to the
 * route handler itself. A `PipeTransform`'s `ArgumentMetadata` only exposes the
 * parameter's `metatype` (e.g. the DTO class) - it has no reference to the
 * controller or handler - so that's the only thing `GlobalValidationPipe` can
 * reliably check to detect flexible routes.
 *
 * DTOs marked with this decorator bypass the global `forbidNonWhitelisted`
 * validation and are instead validated by their route-specific flexible pipe
 * (e.g. `FlexibleValidationPipe` or `FlexibleArrayValidationPipe`).
 */
export const FLEXIBLE_VALIDATION = Symbol('FLEXIBLE_VALIDATION');

export const FlexibleValidation = (): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(FLEXIBLE_VALIDATION, true, target);
  };
};
